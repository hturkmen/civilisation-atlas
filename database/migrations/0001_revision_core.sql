-- PostgreSQL relational foundation. Does not activate a public release.
-- Run once on an empty, dedicated database as the migration owner.
BEGIN;
CREATE SCHEMA atlas;
REVOKE ALL ON SCHEMA atlas FROM PUBLIC;
CREATE DOMAIN atlas.sha256 AS text CHECK (VALUE ~ '^[a-f0-9]{64}$');
CREATE TABLE atlas.schema_migration (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE atlas.entity (
  id uuid PRIMARY KEY, kind text NOT NULL CHECK (kind IN ('polity','civilisation','culture','settlement','region')),
  slug text NOT NULL UNIQUE CHECK (length(trim(slug)) > 0)
);
CREATE TABLE atlas.source (id uuid PRIMARY KEY, stable_key text NOT NULL UNIQUE CHECK (length(trim(stable_key)) > 0));
CREATE TABLE atlas.temporal_extent (
  id uuid PRIMARY KEY, start_earliest integer NOT NULL, start_latest integer NOT NULL,
  end_earliest_exclusive integer NOT NULL, end_latest_exclusive integer NOT NULL,
  original_expression text NOT NULL CHECK (length(trim(original_expression)) > 0),
  CHECK (start_earliest <= start_latest AND end_earliest_exclusive <= end_latest_exclusive
    AND start_earliest < end_earliest_exclusive AND start_latest < end_latest_exclusive)
);
CREATE TABLE atlas.entity_revision (
  id uuid PRIMARY KEY, entity_id uuid NOT NULL REFERENCES atlas.entity(id),
  revision_no integer NOT NULL CHECK (revision_no > 0), content_hash atlas.sha256 NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'), UNIQUE (entity_id, revision_no)
);
CREATE TABLE atlas.source_revision (
  id uuid PRIMARY KEY, source_id uuid NOT NULL REFERENCES atlas.source(id),
  revision_no integer NOT NULL CHECK (revision_no > 0), content_hash atlas.sha256 NOT NULL,
  rights_status text NOT NULL CHECK (rights_status IN ('unknown','approved','rejected','revoked')),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'), UNIQUE (source_id, revision_no)
);
CREATE TABLE atlas.assertion_revision (
  id uuid PRIMARY KEY, entity_revision_id uuid NOT NULL REFERENCES atlas.entity_revision(id),
  temporal_extent_id uuid NOT NULL REFERENCES atlas.temporal_extent(id),
  predicate text NOT NULL CHECK (length(trim(predicate)) > 0), value_json jsonb NOT NULL,
  content_hash atlas.sha256 NOT NULL
);
-- Geometry bytes remain in a verified artifact until the PostGIS migration/import adapter lands.
CREATE TABLE atlas.geometry_revision (
  id uuid PRIMARY KEY, entity_revision_id uuid NOT NULL REFERENCES atlas.entity_revision(id),
  temporal_extent_id uuid NOT NULL REFERENCES atlas.temporal_extent(id),
  artifact_hash atlas.sha256 NOT NULL, feature_locator text NOT NULL CHECK (length(trim(feature_locator)) > 0),
  content_hash atlas.sha256 NOT NULL
);
CREATE TABLE atlas.perspective_revision (
  id uuid PRIMARY KEY, observer_label text NOT NULL CHECK (length(trim(observer_label)) > 0),
  knowledge_extent_id uuid NOT NULL REFERENCES atlas.temporal_extent(id),
  artifact_extent_id uuid NOT NULL REFERENCES atlas.temporal_extent(id),
  artifact_hash atlas.sha256 NOT NULL, content_hash atlas.sha256 NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object')
);
CREATE TABLE atlas.evidence_link (
  id uuid PRIMARY KEY, source_revision_id uuid NOT NULL REFERENCES atlas.source_revision(id),
  assertion_revision_id uuid REFERENCES atlas.assertion_revision(id),
  geometry_revision_id uuid REFERENCES atlas.geometry_revision(id),
  perspective_revision_id uuid REFERENCES atlas.perspective_revision(id),
  relation text NOT NULL CHECK (relation IN ('supports','contradicts','context')),
  locator text, locator_missing_reason text,
  source_statement text NOT NULL CHECK (length(trim(source_statement)) > 0),
  editorial_inference text NOT NULL CHECK (length(trim(editorial_inference)) > 0),
  CHECK (num_nonnulls(assertion_revision_id, geometry_revision_id, perspective_revision_id) = 1),
  CHECK ((locator IS NOT NULL AND length(trim(locator)) > 0 AND locator_missing_reason IS NULL)
      OR (locator IS NULL AND locator_missing_reason IS NOT NULL AND length(trim(locator_missing_reason)) > 0))
);
CREATE TABLE atlas.dataset_release (
  id uuid PRIMARY KEY,
  -- validated means relationally sealed only. Public activation awaits authenticated review/publishing.
  state text NOT NULL DEFAULT 'building' CHECK (state IN ('building','validated','withdrawn')),
  manifest_hash atlas.sha256, data_as_of date NOT NULL, app_schema_version integer NOT NULL CHECK (app_schema_version > 0)
);
CREATE TABLE atlas.release_member (
  id uuid PRIMARY KEY, release_id uuid NOT NULL REFERENCES atlas.dataset_release(id),
  entity_revision_id uuid REFERENCES atlas.entity_revision(id),
  source_revision_id uuid REFERENCES atlas.source_revision(id),
  assertion_revision_id uuid REFERENCES atlas.assertion_revision(id),
  geometry_revision_id uuid REFERENCES atlas.geometry_revision(id),
  perspective_revision_id uuid REFERENCES atlas.perspective_revision(id),
  evidence_link_id uuid REFERENCES atlas.evidence_link(id),
  CHECK (num_nonnulls(entity_revision_id, source_revision_id, assertion_revision_id, geometry_revision_id, perspective_revision_id, evidence_link_id) = 1),
  UNIQUE (release_id, entity_revision_id), UNIQUE (release_id, source_revision_id),
  UNIQUE (release_id, assertion_revision_id), UNIQUE (release_id, geometry_revision_id),
  UNIQUE (release_id, perspective_revision_id), UNIQUE (release_id, evidence_link_id)
);
CREATE INDEX ON atlas.release_member(release_id);
CREATE INDEX ON atlas.evidence_link(source_revision_id);
CREATE INDEX ON atlas.assertion_revision(entity_revision_id);
CREATE INDEX ON atlas.geometry_revision(entity_revision_id);

-- Revisions and their dependencies are append-only, even before publication.
-- Editable drafts belong to the editorial layer, not these snapshots.
CREATE FUNCTION atlas.reject_mutation() RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, atlas AS $$
BEGIN RAISE EXCEPTION 'immutable snapshot: %', TG_TABLE_NAME USING ERRCODE = '55000'; END $$;
DO $$
DECLARE tab text;
BEGIN
  FOREACH tab IN ARRAY ARRAY['entity','source','temporal_extent','entity_revision','source_revision','assertion_revision','geometry_revision','perspective_revision','evidence_link'] LOOP
    EXECUTE format('CREATE TRIGGER immutable_rows BEFORE UPDATE OR DELETE ON atlas.%I FOR EACH ROW EXECUTE FUNCTION atlas.reject_mutation()', tab);
    EXECUTE format('CREATE TRIGGER immutable_truncate BEFORE TRUNCATE ON atlas.%I FOR EACH STATEMENT EXECUTE FUNCTION atlas.reject_mutation()', tab);
  END LOOP;
END $$;

CREATE FUNCTION atlas.guard_release_member() RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, atlas AS $$
DECLARE release_state text; target uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.release_id <> OLD.release_id THEN
    RAISE EXCEPTION 'release membership cannot move between releases' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'DELETE' THEN target := OLD.release_id; ELSE target := NEW.release_id; END IF;
  -- Serialize member changes with the sealing UPDATE of their parent release.
  SELECT state INTO release_state FROM atlas.dataset_release WHERE id = target FOR UPDATE;
  IF release_state IS NULL OR release_state <> 'building' THEN
    RAISE EXCEPTION 'release is missing or sealed' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END $$;
CREATE TRIGGER guard_member BEFORE INSERT OR UPDATE OR DELETE ON atlas.release_member
FOR EACH ROW EXECUTE FUNCTION atlas.guard_release_member();
CREATE TRIGGER guard_member_truncate BEFORE TRUNCATE ON atlas.release_member
FOR EACH STATEMENT EXECUTE FUNCTION atlas.reject_mutation();

CREATE FUNCTION atlas.guard_release() RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, atlas AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.state <> 'building' THEN RAISE EXCEPTION 'release must begin in building state' USING ERRCODE = '55000'; END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'release records are retained' USING ERRCODE = '55000'; END IF;
  IF NEW.id <> OLD.id THEN RAISE EXCEPTION 'release identity is immutable' USING ERRCODE = '55000'; END IF;
  IF OLD.state = 'building' AND NEW.state = 'building' THEN RETURN NEW; END IF;
  IF OLD.state = 'validated' AND NEW.state = 'withdrawn' AND (to_jsonb(OLD) - 'state') = (to_jsonb(NEW) - 'state') THEN RETURN NEW; END IF;
  IF OLD.state <> 'building' OR NEW.state <> 'validated' THEN RAISE EXCEPTION 'invalid or immutable release transition' USING ERRCODE = '55000'; END IF;
  IF NEW.manifest_hash IS NULL OR NOT EXISTS (SELECT 1 FROM atlas.release_member WHERE release_id = NEW.id) THEN
    RAISE EXCEPTION 'sealing requires manifest hash and members' USING ERRCODE = '23514';
  END IF;
  -- Every selected assertion/geometry pins its parent entity in this same release.
  IF EXISTS (
    SELECT 1 FROM atlas.release_member m
    LEFT JOIN atlas.assertion_revision a ON a.id = m.assertion_revision_id
    LEFT JOIN atlas.geometry_revision g ON g.id = m.geometry_revision_id
    WHERE m.release_id = NEW.id AND coalesce(a.entity_revision_id, g.entity_revision_id) IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM atlas.release_member p WHERE p.release_id = NEW.id AND p.entity_revision_id = coalesce(a.entity_revision_id, g.entity_revision_id))
  ) THEN RAISE EXCEPTION 'release lacks parent entity revision' USING ERRCODE = '23514'; END IF;
  -- Evidence must reference source and target revisions that are in this release.
  IF EXISTS (
    SELECT 1 FROM atlas.release_member m JOIN atlas.evidence_link e ON e.id = m.evidence_link_id
    WHERE m.release_id = NEW.id AND (
      NOT EXISTS (SELECT 1 FROM atlas.release_member s WHERE s.release_id = NEW.id AND s.source_revision_id = e.source_revision_id)
      OR NOT EXISTS (SELECT 1 FROM atlas.release_member t WHERE t.release_id = NEW.id AND
        (t.assertion_revision_id = e.assertion_revision_id OR t.geometry_revision_id = e.geometry_revision_id OR t.perspective_revision_id = e.perspective_revision_id)))
  ) THEN RAISE EXCEPTION 'release lacks evidence source or target' USING ERRCODE = '23514'; END IF;
  IF EXISTS (
    SELECT 1 FROM atlas.release_member m JOIN atlas.source_revision s ON s.id = m.source_revision_id
    WHERE m.release_id = NEW.id AND s.rights_status <> 'approved'
  ) THEN RAISE EXCEPTION 'source rights not approved' USING ERRCODE = '23514'; END IF;
  IF EXISTS (
    SELECT 1 FROM atlas.release_member m WHERE m.release_id = NEW.id
    AND num_nonnulls(m.assertion_revision_id,m.geometry_revision_id,m.perspective_revision_id) = 1
    AND NOT EXISTS (
      SELECT 1 FROM atlas.release_member em JOIN atlas.evidence_link e ON e.id = em.evidence_link_id
      WHERE em.release_id = NEW.id AND e.relation = 'supports' AND e.locator IS NOT NULL
      AND (e.assertion_revision_id = m.assertion_revision_id OR e.geometry_revision_id = m.geometry_revision_id OR e.perspective_revision_id = m.perspective_revision_id)
    )
  ) THEN RAISE EXCEPTION 'release lacks located supporting evidence' USING ERRCODE = '23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_release BEFORE INSERT OR UPDATE OR DELETE ON atlas.dataset_release
FOR EACH ROW EXECUTE FUNCTION atlas.guard_release();
CREATE TRIGGER guard_release_truncate BEFORE TRUNCATE ON atlas.dataset_release
FOR EACH STATEMENT EXECUTE FUNCTION atlas.reject_mutation();

-- No browser/runtime role receives access here. Owner/superuser remains a trusted migration boundary.
REVOKE ALL ON ALL TABLES IN SCHEMA atlas FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA atlas FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA atlas REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA atlas REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
INSERT INTO atlas.schema_migration(version) VALUES (1);
COMMIT;
