import {createHash, randomUUID} from 'node:crypto';
import {validateEditorialCandidates} from '../../packages/domain/src/editorial.mjs';
import {createEditorialRevision, validateRevisionManifest} from '../../packages/domain/src/editorial-revisions.mjs';

function canonical(value) {
  if (Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
  if (value && typeof value === 'object') return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}';
  return JSON.stringify(value);
}
const digest = value => createHash('sha256').update(canonical(value)).digest('hex');
const json = value => JSON.stringify(value);

/** Trusted local JSON inputs only, not an arbitrary upload/import service. No publication/review side effects. */
export async function importEditorial(db, inputs, pins) {
  const {sources, candidates, resolveEntity} = inputs;
  validateEditorialCandidates(candidates,sources);
  validateRevisionManifest(pins);
  // Validate and clone everything before the first database write.
  const prepared = candidates.map(candidate => {
    if (candidate.reviewStatus !== 'unreviewed') throw new Error('Importer accepts only unreviewed candidates; reviews require the future authorized service');
    const entity = resolveEntity(candidate.entityRef);
    const current = createEditorialRevision(candidate,sources,entity);
    const pin = pins.find(pin=>pin.revisionId===current.revisionId);
    if (!pin || canonical(pin)!==canonical(current)) throw new Error('Missing or stale revision pin: '+candidate.id);
    return structuredClone({candidate,entity,pin,sources:current.sources.map(p=>sources.find(s=>s.id===p.sourceId))});
  });
  return db.transaction(async tx => {
    // Serialize revision numbering across importer instances; all statements share one transaction.
    await tx.exec('LOCK TABLE atlas.source, atlas.entity IN SHARE ROW EXCLUSIVE MODE');
    const report={imported:0,blocked:0,unchanged:0};
    async function extent(e, expression) {
      const id=randomUUID();
      await tx.query('INSERT INTO atlas.temporal_extent VALUES ($1,$2,$3,$4,$5,$6)',[id,e.startEarliest,e.startLatest,e.endEarliestExclusive,e.endLatestExclusive,expression]);
      return id;
    }
    async function sourceRevision(source,pin) {
      let found=(await tx.query('SELECT id FROM atlas.source WHERE stable_key=$1',[source.id])).rows[0];
      if(!found){found={id:randomUUID()};await tx.query('INSERT INTO atlas.source VALUES ($1,$2)',[found.id,source.id]);}
      const existing=(await tx.query('SELECT id FROM atlas.source_revision WHERE source_id=$1 AND content_hash=$2',[found.id,pin.contentHash])).rows[0];
      if(existing)return existing.id;
      const no=(await tx.query('SELECT coalesce(max(revision_no),0)+1 AS n FROM atlas.source_revision WHERE source_id=$1',[found.id])).rows[0].n;
      const id=randomUUID();
      await tx.query('INSERT INTO atlas.source_revision VALUES ($1,$2,$3,$4,$5,$6)',[id,found.id,no,pin.contentHash,source.rightsStatus,json(source)]);
      return id;
    }
    async function entityRevision(entity,pin) {
      const isBoundary=entity.kind==='boundary_record';
      const key=isBoundary?'polity:'+entity.content.polity.id:'settlement:'+entity.id;
      let found=(await tx.query('SELECT id FROM atlas.entity WHERE slug=$1',[key])).rows[0];
      if(!found){found={id:randomUUID()};await tx.query('INSERT INTO atlas.entity VALUES ($1,$2,$3)',[found.id,isBoundary?'polity':'settlement',key]);}
      const existing=(await tx.query('SELECT id FROM atlas.entity_revision WHERE entity_id=$1 AND content_hash=$2',[found.id,pin.entity.contentHash])).rows[0];
      if(existing)return existing.id;
      const no=(await tx.query('SELECT coalesce(max(revision_no),0)+1 AS n FROM atlas.entity_revision WHERE entity_id=$1',[found.id])).rows[0].n;
      const id=randomUUID();
      await tx.query('INSERT INTO atlas.entity_revision VALUES ($1,$2,$3,$4,$5)',[id,found.id,no,pin.entity.contentHash,json(entity.content)]);
      return id;
    }
    for(const {candidate,entity,pin,sources:usedSources} of prepared){
      if((await tx.query('SELECT 1 FROM atlas.editorial_import WHERE revision_id=$1',[pin.revisionId])).rows.length){report.unchanged++;continue;}
      const sourceIds=new Map();
      for(const source of usedSources) sourceIds.set(source.id,await sourceRevision(source,pin.sources.find(s=>s.sourceId===source.id)));
      let assertionId=null,geometryId=null,perspectiveId=null;
      if(candidate.status!=='blocked'){
        const temporalId=await extent(candidate.extent,candidate.originalExpression);
        if(entity.kind==='perspective'){
          const map=entity.content;
          if(candidate.claimPredicate!=='artifact_and_knowledge_date_separation' || candidate.extent.startEarliest!==map.publicationYear
            || candidate.extent.endLatestExclusive!==map.publicationYear+1 || !map.knowledgeDate?.trim()) throw new Error('Unsupported perspective date mapping');
          perspectiveId=randomUUID();
          await tx.query(`INSERT INTO atlas.perspective_revision(id,observer_label,knowledge_extent_id,artifact_extent_id,artifact_hash,content_hash,payload,knowledge_date_note)
            VALUES ($1,$2,NULL,$3,$4,$5,$6,$7)`,[perspectiveId,map.creator,temporalId,map.image.sha256,pin.revisionId,json({map,candidate}),map.knowledgeDate]);
        }else{
          const entityId=await entityRevision(entity,pin);
          assertionId=randomUUID();
          await tx.query('INSERT INTO atlas.assertion_revision VALUES ($1,$2,$3,$4,$5,$6)',[assertionId,entityId,temporalId,candidate.claimPredicate,json(candidate),pin.claimHash]);
          if(entity.kind==='boundary_record'){
            const record=entity.content;
            const geometryPeriod=await extent({startEarliest:record.period.start,startLatest:record.period.start,endEarliestExclusive:record.period.endExclusive,endLatestExclusive:record.period.endExclusive},`Source record ${record.id}: ${record.sourceFromYear} to ${record.sourceToYear}, inclusive`);
            geometryId=randomUUID();
            // Artifact is the canonical inline Feature retained in entity_payload, not an invented upstream checksum.
            await tx.query('INSERT INTO atlas.geometry_revision VALUES ($1,$2,$3,$4,$5,$6)',[geometryId,entityId,geometryPeriod,digest(record.geometry),'inline-feature:'+record.id,pin.entity.contentHash]);
            await tx.query('INSERT INTO atlas.geometry_payload(geometry_revision_id,original_geojson) VALUES ($1,$2)',[geometryId,json(record.geometry.geometry)]);
          }
        }
        // Candidate evidence targets the candidate claim/perspective. Do not pretend it reviewed the geometry itself.
        for(const evidence of candidate.evidence){
          await tx.query(`INSERT INTO atlas.evidence_link(id,source_revision_id,assertion_revision_id,perspective_revision_id,relation,locator,locator_missing_reason,source_statement,editorial_inference)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,[randomUUID(),sourceIds.get(evidence.sourceId),assertionId,perspectiveId,evidence.relation,evidence.locator??null,evidence.locator==null?evidence.locatorMissingReason:null,evidence.sourceStatement,evidence.editorialInference]);
        }
      }
      const blocked=candidate.status==='blocked';
      await tx.query(`INSERT INTO atlas.editorial_import VALUES ($1,$2,'gate-a-v1',$3,'unreviewed',$4,$5,$6,$7,$8,$9)`,
        [pin.revisionId,candidate.id,blocked?'blocked':'imported',json(pin),json(candidate),json(entity.content),assertionId,geometryId,perspectiveId]);
      for(const sourceId of sourceIds.values()) await tx.query('INSERT INTO atlas.editorial_import_source VALUES ($1,$2)',[pin.revisionId,sourceId]);
      report[blocked?'blocked':'imported']++;
    }
    return report;
  });
}
