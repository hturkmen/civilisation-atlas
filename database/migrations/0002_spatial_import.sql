BEGIN;
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
-- Unknown knowledge time must not be invented from the artifact's publication date.
ALTER TABLE atlas.perspective_revision ALTER COLUMN knowledge_extent_id DROP NOT NULL;
ALTER TABLE atlas.perspective_revision ADD COLUMN knowledge_date_note text;
ALTER TABLE atlas.perspective_revision ADD CONSTRAINT knowledge_date_basis CHECK (
  knowledge_extent_id IS NOT NULL OR (knowledge_date_note IS NOT NULL AND length(trim(knowledge_date_note)) > 0)
);
CREATE UNIQUE INDEX entity_revision_content ON atlas.entity_revision(entity_id, content_hash);
CREATE UNIQUE INDEX source_revision_content ON atlas.source_revision(source_id, content_hash);
CREATE TABLE atlas.geometry_payload (
  geometry_revision_id uuid PRIMARY KEY REFERENCES atlas.geometry_revision(id),
  original_geojson jsonb NOT NULL CHECK (jsonb_typeof(original_geojson) = 'object'),
  geom public.geometry(MultiPolygon,4326) GENERATED ALWAYS AS (public.ST_GeomFromGeoJSON(original_geojson)) STORED,
  CHECK (geom IS NOT NULL AND NOT public.ST_IsEmpty(geom) AND public.ST_IsValid(geom)),
  CHECK (public.ST_NDims(geom) = 2),
  CHECK (public.ST_XMin(geom::public.box3d) >= -180 AND public.ST_XMax(geom::public.box3d) <= 180
     AND public.ST_YMin(geom::public.box3d) >= -90 AND public.ST_YMax(geom::public.box3d) <= 90)
);
CREATE INDEX geometry_payload_gist ON atlas.geometry_payload USING gist(geom);
CREATE TABLE atlas.editorial_import (
  revision_id atlas.sha256 PRIMARY KEY, candidate_id text NOT NULL,
  adapter_version text NOT NULL CHECK (adapter_version = 'gate-a-v1'),
  disposition text NOT NULL CHECK (disposition IN ('imported','blocked')),
  review_status text NOT NULL CHECK (review_status = 'unreviewed'),
  pin jsonb NOT NULL CHECK (jsonb_typeof(pin) = 'object'),
  candidate_payload jsonb NOT NULL CHECK (jsonb_typeof(candidate_payload) = 'object'),
  entity_payload jsonb NOT NULL CHECK (jsonb_typeof(entity_payload) = 'object'),
  assertion_revision_id uuid REFERENCES atlas.assertion_revision(id),
  geometry_revision_id uuid REFERENCES atlas.geometry_revision(id),
  perspective_revision_id uuid REFERENCES atlas.perspective_revision(id),
  CHECK ((disposition='blocked' AND num_nonnulls(assertion_revision_id,geometry_revision_id,perspective_revision_id)=0)
    OR (disposition='imported' AND num_nonnulls(assertion_revision_id,perspective_revision_id)=1))
);
CREATE TABLE atlas.editorial_import_source (
  revision_id atlas.sha256 NOT NULL REFERENCES atlas.editorial_import(revision_id),
  source_revision_id uuid NOT NULL REFERENCES atlas.source_revision(id),
  PRIMARY KEY (revision_id,source_revision_id)
);
DO $$ DECLARE tab text; BEGIN
  FOREACH tab IN ARRAY ARRAY['geometry_payload','editorial_import','editorial_import_source'] LOOP
    EXECUTE format('CREATE TRIGGER immutable_rows BEFORE UPDATE OR DELETE ON atlas.%I FOR EACH ROW EXECUTE FUNCTION atlas.reject_mutation()',tab);
    EXECUTE format('CREATE TRIGGER immutable_truncate BEFORE TRUNCATE ON atlas.%I FOR EACH STATEMENT EXECUTE FUNCTION atlas.reject_mutation()',tab);
  END LOOP;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA atlas FROM PUBLIC;
INSERT INTO atlas.schema_migration(version) VALUES (2);
COMMIT;
