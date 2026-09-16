BEGIN;
-- Local operator receipts only; this is not a public upload endpoint or worker queue.
CREATE TABLE atlas.local_import_job (
  id uuid PRIMARY KEY,
  adapter_version text NOT NULL CHECK (adapter_version = 'gate-a-bundle-v1'),
  policy_version text NOT NULL CHECK (policy_version = 'bounded-json-v1'),
  input_sha256 atlas.sha256,
  bytes_observed bigint NOT NULL CHECK (bytes_observed >= 0),
  outcome text NOT NULL CHECK (outcome IN ('imported','quarantined')),
  reason_code text CHECK (reason_code IN (
    'LOCAL_JSON_REQUIRED','FILE_UNAVAILABLE','REGULAR_FILE_REQUIRED','BYTE_LIMIT',
    'INVALID_JSON','DEPTH_LIMIT','NODE_LIMIT','RECORD_LIMIT','INVALID_GEOMETRY',
    'VERTEX_LIMIT','INVALID_CONTRACT','GEOMETRY_OR_CONSTRAINT'
  )),
  result jsonb NOT NULL CHECK (jsonb_typeof(result) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((outcome='imported' AND reason_code IS NULL AND input_sha256 IS NOT NULL)
    OR (outcome='quarantined' AND reason_code IS NOT NULL)),
  UNIQUE (input_sha256, adapter_version, policy_version)
);
CREATE TABLE atlas.local_import_job_revision (
  job_id uuid NOT NULL REFERENCES atlas.local_import_job(id),
  revision_id atlas.sha256 NOT NULL REFERENCES atlas.editorial_import(revision_id),
  PRIMARY KEY (job_id, revision_id)
);
DO $$ DECLARE tab text; BEGIN
  FOREACH tab IN ARRAY ARRAY['local_import_job','local_import_job_revision'] LOOP
    EXECUTE format('CREATE TRIGGER immutable_rows BEFORE UPDATE OR DELETE ON atlas.%I FOR EACH ROW EXECUTE FUNCTION atlas.reject_mutation()',tab);
    EXECUTE format('CREATE TRIGGER immutable_truncate BEFORE TRUNCATE ON atlas.%I FOR EACH STATEMENT EXECUTE FUNCTION atlas.reject_mutation()',tab);
  END LOOP;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA atlas FROM PUBLIC;
INSERT INTO atlas.schema_migration(version) VALUES (3);
COMMIT;
