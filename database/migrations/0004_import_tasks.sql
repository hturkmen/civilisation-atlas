BEGIN;
CREATE TABLE atlas.import_task (
  id uuid PRIMARY KEY,
  input_sha256 atlas.sha256 NOT NULL,
  adapter_version text NOT NULL DEFAULT 'gate-a-bundle-v1' CHECK (adapter_version='gate-a-bundle-v1'),
  policy_version text NOT NULL DEFAULT 'bounded-json-v1' CHECK (policy_version='bounded-json-v1'),
  state text NOT NULL DEFAULT 'queued' CHECK (state IN ('queued','running','imported','quarantined','failed')),
  attempt integer NOT NULL DEFAULT 0 CHECK (attempt BETWEEN 0 AND 3),
  available_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  lease_token uuid,
  lease_until timestamptz,
  attempt_deadline timestamptz,
  receipt_id uuid REFERENCES atlas.local_import_job(id),
  last_error text CHECK (last_error IN ('WORKER_LOST','TIME_BUDGET','TRANSIENT_DATABASE','INPUT_CHANGED','INPUT_UNAVAILABLE','UNEXPECTED_FAILURE')),
  UNIQUE(input_sha256,adapter_version,policy_version),
  CHECK ((state='running' AND attempt>0 AND num_nonnulls(lease_token,lease_until,attempt_deadline)=3 AND lease_until<=attempt_deadline)
    OR (state<>'running' AND num_nonnulls(lease_token,lease_until,attempt_deadline)=0)),
  CHECK ((state IN ('imported','quarantined'))=(receipt_id IS NOT NULL)),
  CHECK (state<>'queued' OR attempt<3)
);
CREATE TABLE atlas.import_task_event (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES atlas.import_task(id),
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  state text NOT NULL,
  attempt integer NOT NULL,
  error_code text
);
CREATE FUNCTION atlas.protect_import_task() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,atlas AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    IF NEW.state<>'queued' OR NEW.attempt<>0 THEN RAISE EXCEPTION 'task must start queued' USING ERRCODE='23514'; END IF;
  ELSE
    IF OLD.state IN ('imported','quarantined','failed') OR
       ROW(NEW.id,NEW.input_sha256,NEW.adapter_version,NEW.policy_version) IS DISTINCT FROM
       ROW(OLD.id,OLD.input_sha256,OLD.adapter_version,OLD.policy_version) THEN
      RAISE EXCEPTION 'terminal task and identity are immutable' USING ERRCODE='55000';
    END IF;
  END IF;
  IF NEW.receipt_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM atlas.local_import_job r WHERE r.id=NEW.receipt_id AND r.input_sha256=NEW.input_sha256
    AND r.adapter_version=NEW.adapter_version AND r.policy_version=NEW.policy_version AND r.outcome=NEW.state
  ) THEN RAISE EXCEPTION 'receipt must match task input and outcome' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER import_task_guard BEFORE INSERT OR UPDATE ON atlas.import_task FOR EACH ROW EXECUTE FUNCTION atlas.protect_import_task();
CREATE TRIGGER import_task_no_delete BEFORE DELETE ON atlas.import_task FOR EACH ROW EXECUTE FUNCTION atlas.reject_mutation();
CREATE TRIGGER import_task_no_truncate BEFORE TRUNCATE ON atlas.import_task FOR EACH STATEMENT EXECUTE FUNCTION atlas.reject_mutation();
CREATE FUNCTION atlas.audit_import_task() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,atlas AS $$
BEGIN
  IF TG_OP='INSERT' OR ROW(NEW.state,NEW.attempt,NEW.last_error) IS DISTINCT FROM ROW(OLD.state,OLD.attempt,OLD.last_error) THEN
    INSERT INTO atlas.import_task_event(task_id,state,attempt,error_code) VALUES (NEW.id,NEW.state,NEW.attempt,NEW.last_error);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER import_task_audit AFTER INSERT OR UPDATE ON atlas.import_task FOR EACH ROW EXECUTE FUNCTION atlas.audit_import_task();
CREATE TRIGGER task_event_immutable BEFORE UPDATE OR DELETE ON atlas.import_task_event FOR EACH ROW EXECUTE FUNCTION atlas.reject_mutation();
CREATE TRIGGER task_event_no_truncate BEFORE TRUNCATE ON atlas.import_task_event FOR EACH STATEMENT EXECUTE FUNCTION atlas.reject_mutation();

CREATE FUNCTION atlas.claim_import_task(p_id uuid,p_token uuid) RETURNS SETOF atlas.import_task
LANGUAGE plpgsql SET search_path=pg_catalog,atlas AS $$
DECLARE t atlas.import_task; moment timestamptz;
BEGIN
  IF p_token IS NULL THEN RAISE EXCEPTION 'claim token required' USING ERRCODE='22023'; END IF;
  SELECT * INTO t FROM atlas.import_task WHERE id=p_id FOR UPDATE SKIP LOCKED;
  IF NOT FOUND THEN RETURN; END IF;
  moment:=clock_timestamp();
  IF t.state='running' THEN
    IF t.lease_until>moment AND t.attempt_deadline>moment THEN RETURN; END IF;
    UPDATE atlas.import_task SET state=CASE WHEN attempt<3 THEN 'queued' ELSE 'failed' END,
      available_at=moment+make_interval(secs=>5*attempt),lease_token=NULL,lease_until=NULL,attempt_deadline=NULL,last_error='WORKER_LOST' WHERE id=p_id;
    RETURN;
  END IF;
  IF t.state<>'queued' OR t.available_at>moment THEN RETURN; END IF;
  RETURN QUERY UPDATE atlas.import_task SET state='running',attempt=attempt+1,lease_token=p_token,
    lease_until=moment+interval '30 seconds',attempt_deadline=moment+interval '120 seconds',last_error=NULL
    WHERE id=p_id RETURNING *;
END $$;

CREATE FUNCTION atlas.heartbeat_import_task(p_id uuid,p_token uuid) RETURNS boolean
LANGUAGE plpgsql SET search_path=pg_catalog,atlas AS $$
DECLARE t atlas.import_task; moment timestamptz;
BEGIN
  SELECT * INTO t FROM atlas.import_task WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  moment:=clock_timestamp();
  IF t.state<>'running' OR t.lease_token IS DISTINCT FROM p_token OR t.lease_until<=moment OR t.attempt_deadline<=moment THEN RETURN false; END IF;
  UPDATE atlas.import_task SET lease_until=least(moment+interval '30 seconds',attempt_deadline) WHERE id=p_id;
  RETURN true;
END $$;

CREATE FUNCTION atlas.finish_import_task(p_id uuid,p_token uuid,p_receipt uuid) RETURNS boolean
LANGUAGE plpgsql SET search_path=pg_catalog,atlas AS $$
DECLARE outcome_value text;
BEGIN
  IF NOT atlas.heartbeat_import_task(p_id,p_token) THEN RETURN false; END IF;
  SELECT outcome INTO outcome_value FROM atlas.local_import_job WHERE id=p_receipt;
  IF NOT FOUND THEN RAISE EXCEPTION 'receipt missing' USING ERRCODE='23503'; END IF;
  UPDATE atlas.import_task SET state=outcome_value,receipt_id=p_receipt,lease_token=NULL,lease_until=NULL,attempt_deadline=NULL WHERE id=p_id;
  RETURN true;
END $$;

CREATE FUNCTION atlas.fail_import_task(p_id uuid,p_token uuid,p_error text,p_retry boolean) RETURNS boolean
LANGUAGE plpgsql SET search_path=pg_catalog,atlas AS $$
DECLARE t atlas.import_task;
BEGIN
  SELECT * INTO t FROM atlas.import_task WHERE id=p_id FOR UPDATE;
  IF NOT FOUND OR t.state<>'running' OR t.lease_token IS DISTINCT FROM p_token THEN RETURN false; END IF;
  UPDATE atlas.import_task SET state=CASE WHEN p_retry AND attempt<3 THEN 'queued' ELSE 'failed' END,
    available_at=clock_timestamp()+make_interval(secs=>5*attempt),lease_token=NULL,lease_until=NULL,attempt_deadline=NULL,last_error=p_error WHERE id=p_id;
  RETURN true;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA atlas FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA atlas FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA atlas FROM PUBLIC;
INSERT INTO atlas.schema_migration(version) VALUES (4);
COMMIT;
