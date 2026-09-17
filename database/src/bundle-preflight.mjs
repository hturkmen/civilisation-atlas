import {createHash} from 'node:crypto';
import {open, lstat} from 'node:fs/promises';
import {constants} from 'node:fs';
import {isAbsolute} from 'node:path';
import {createEditorialRevision,validateRevisionManifest} from '../../packages/domain/src/editorial-revisions.mjs';
import {validateEditorialCandidates} from '../../packages/domain/src/editorial.mjs';

export const IMPORT_LIMITS = Object.freeze({bytes:8*1024*1024,depth:64,nodes:200000,records:100,vertices:50000});
export class Rejection extends Error {constructor(code){super(code);this.code=code;}}
const reject=code=>{throw new Rejection(code);};
const object=value=>value!==null && typeof value==='object' && !Array.isArray(value);

export async function readBounded(file, receipt) {
  // No URL/path in output or DB. No network requests, archives, or symlink following.
  if(typeof file!=='string' || !isAbsolute(file) || !/\.json$/i.test(file) || file.startsWith('//') || file.startsWith('\\\\')) reject('LOCAL_JSON_REQUIRED');
  let handle;
  try {
    const before=await lstat(file);
    if(!before.isFile() || before.isSymbolicLink()) reject('REGULAR_FILE_REQUIRED');
    handle=await open(file,constants.O_RDONLY | (constants.O_NOFOLLOW??0) | (constants.O_NONBLOCK??0));
    const stat=await handle.stat();
    if(!stat.isFile()) reject('REGULAR_FILE_REQUIRED');
    // A pre-read size is not a checksum or a claim that those bytes were consumed.
    if(stat.size>IMPORT_LIMITS.bytes) reject('BYTE_LIMIT');
    const chunks=[];
    while(true){
      const chunk=Buffer.alloc(Math.min(65536,IMPORT_LIMITS.bytes+1-receipt.bytesObserved));
      const {bytesRead}=await handle.read(chunk,0,chunk.length,null);
      if(!bytesRead)break;
      receipt.bytesObserved+=bytesRead;
      if(receipt.bytesObserved>IMPORT_LIMITS.bytes) reject('BYTE_LIMIT');
      chunks.push(chunk.subarray(0,bytesRead));
    }
    const raw=Buffer.concat(chunks);
    receipt.sha256=createHash('sha256').update(raw).digest('hex');
    return raw;
  } catch(error) {
    if(error instanceof Rejection)throw error;
    reject('FILE_UNAVAILABLE');
  } finally {if(handle)await handle.close();}
}

export function parseBounded(raw) {
  let text;
  try{text=new TextDecoder('utf-8',{fatal:true}).decode(raw);}catch{reject('INVALID_JSON');}
  let depth=0,quoted=false,escaped=false;
  for(const char of text){
    if(quoted){if(escaped)escaped=false;else if(char==='\\')escaped=true;else if(char==='"')quoted=false;}
    else if(char==='"')quoted=true;
    else if(char==='{' || char==='['){if(++depth>IMPORT_LIMITS.depth)reject('DEPTH_LIMIT');}
    else if(char==='}' || char===']')depth--;
  }
  let bundle;
  try{bundle=JSON.parse(text);}catch{reject('INVALID_JSON');}
  const stack=[bundle];let nodes=0;
  while(stack.length){
    const value=stack.pop();if(++nodes>IMPORT_LIMITS.nodes)reject('NODE_LIMIT');
    if(value && typeof value==='object')for(const child of Object.values(value))stack.push(child);
  }
  return bundle;
}

export function prepareBundle(bundle) {
  const keys=['formatVersion','sources','candidates','entities','revisions'];
  if(!object(bundle) || bundle.formatVersion!==1 || Object.keys(bundle).some(key=>!keys.includes(key))) reject('INVALID_CONTRACT');
  for(const key of keys.slice(1)){
    if(!Array.isArray(bundle[key]) || !bundle[key].length)reject('INVALID_CONTRACT');
    if(bundle[key].length>IMPORT_LIMITS.records)reject('RECORD_LIMIT');
  }
  const registry=new Map();let vertices=0;
  for(const entity of bundle.entities){
    if(!object(entity) || !['settlement','boundary_record','perspective'].includes(entity.kind)
      || typeof entity.id!=='string' || !entity.id || !object(entity.content) || entity.content.id!==entity.id)reject('INVALID_CONTRACT');
    const key=JSON.stringify([entity.kind,entity.id]);
    if(registry.has(key))reject('INVALID_CONTRACT');
    registry.set(key,entity);
    if(entity.kind==='perspective'){
      const map=entity.content;
      if(typeof map.creator!=='string' || !map.creator.trim() || !Number.isSafeInteger(map.publicationYear)
        || typeof map.knowledgeDate!=='string' || !map.knowledgeDate.trim()
        || typeof map.image?.sha256!=='string' || !/^[a-f0-9]{64}$/.test(map.image.sha256))reject('INVALID_CONTRACT');
    }
    if(entity.kind!=='boundary_record')continue;
    const record=entity.content;
    if(typeof record.polity?.id!=='string' || !record.polity.id || !Number.isSafeInteger(record.period?.start)
      || !Number.isSafeInteger(record.period?.endExclusive) || record.period.start>=record.period.endExclusive
      || !Number.isSafeInteger(record.sourceFromYear) || !Number.isSafeInteger(record.sourceToYear)
      || record.geometry?.type!=='Feature' || record.geometry.id!==record.id)reject('INVALID_CONTRACT');
    const geometry=entity.content.geometry?.geometry;
    if(!object(geometry) || geometry.type!=='MultiPolygon' || geometry.crs!==undefined
      || !Array.isArray(geometry.coordinates) || !geometry.coordinates.length)reject('INVALID_GEOMETRY');
    for(const polygon of geometry.coordinates){
      if(!Array.isArray(polygon) || !polygon.length)reject('INVALID_GEOMETRY');
      for(const ring of polygon){
        if(!Array.isArray(ring) || ring.length<4)reject('INVALID_GEOMETRY');
        for(const position of ring){
          if(++vertices>IMPORT_LIMITS.vertices)reject('VERTEX_LIMIT');
          if(!Array.isArray(position) || position.length!==2 || !position.every(Number.isFinite)
            || Math.abs(position[0])>180 || Math.abs(position[1])>90)reject('INVALID_GEOMETRY');
        }
        if(ring[0][0]!==ring.at(-1)[0] || ring[0][1]!==ring.at(-1)[1])reject('INVALID_GEOMETRY');
      }
    }
  }
  const inputs={sources:bundle.sources,candidates:bundle.candidates,entities:bundle.entities,resolveEntity:ref=>registry.get(JSON.stringify([ref?.kind,ref?.id]))};
  // Validate actual content against stored pins; self-supplied pins never grant review/publication.
  let current;
  try {
    validateEditorialCandidates(bundle.candidates,bundle.sources);
    validateRevisionManifest(bundle.revisions);
    for(const candidate of bundle.candidates){
      if(candidate.status==='blocked' || candidate.entityRef.kind!=='perspective')continue;
      const map=inputs.resolveEntity(candidate.entityRef)?.content;
      if(!map || candidate.claimPredicate!=='artifact_and_knowledge_date_separation'
        || candidate.extent.startEarliest!==map.publicationYear
        || candidate.extent.endLatestExclusive!==map.publicationYear+1)reject('INVALID_CONTRACT');
    }
    current=bundle.candidates.map(candidate=>createEditorialRevision(candidate,bundle.sources,inputs.resolveEntity(candidate.entityRef)));
    if(bundle.candidates.some(c=>c.reviewStatus!=='unreviewed') || current.some(pin=>!bundle.revisions.some(p=>p.revisionId===pin.revisionId)))reject('INVALID_CONTRACT');
  } catch {reject('INVALID_CONTRACT');}
  return {inputs,pins:bundle.revisions,current};
}
