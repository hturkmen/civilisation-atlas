import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {runBoundedChild,PREFLIGHT_TIMEOUT_MS} from '../src/bounded-child.mjs';
import {classifyFailure} from '../../apps/worker/import-tasks.mjs';

const fixture=new URL('./fixtures/child-behaviour.mjs',import.meta.url);
test('CPU-bound child is actually dead before timeout rejection reaches caller',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'atlas-kill-'));
  try {
    const pidFile=join(dir,'pid');
    await assert.rejects(runBoundedChild(fixture,{mode:'spin',pidFile},{timeoutMs:2000}),{code:'TIME_BUDGET'});
    const pid=Number(await readFile(pidFile,'utf8'));
    assert.throws(()=>process.kill(pid,0),{code:'ESRCH'});
    assert.deepEqual(classifyFailure({code:'TIME_BUDGET'}),{code:'TIME_BUDGET',retry:true});
  } finally {await rm(dir,{recursive:true,force:true});}
});
test('result alone is insufficient: a child that stays alive is killed',async()=>{
  await assert.rejects(runBoundedChild(fixture,{mode:'linger'},{timeoutMs:1000}),{code:'TIME_BUDGET'});
});
test('parent credentials and Node injection flags are not inherited',async()=>{
  const previous=process.env.ATLAS_TEST_SECRET,options=process.env.NODE_OPTIONS;
  process.env.ATLAS_TEST_SECRET='synthetic-test-only';process.env.NODE_OPTIONS='--throw-deprecation';
  try {
    const result=await runBoundedChild(fixture,{mode:'ok'});
    assert.equal(result.secretPresent,false);assert.equal(result.nodeOptionsPresent,false);
    assert.deepEqual(result.execArgv,['--max-old-space-size=128']);
  } finally {
    if(previous===undefined)delete process.env.ATLAS_TEST_SECRET;else process.env.ATLAS_TEST_SECRET=previous;
    if(options===undefined)delete process.env.NODE_OPTIONS;else process.env.NODE_OPTIONS=options;
  }
});
test('crash and missing response remain infrastructure failures, not source quarantine',async()=>{
  for(const mode of ['crash','empty'])await assert.rejects(runBoundedChild(fixture,{mode}),{code:'PREFLIGHT_FAILED'});
  assert.deepEqual(classifyFailure({code:'PREFLIGHT_FAILED'}),{code:'UNEXPECTED_FAILURE',retry:false});
});
test('callers cannot disable or enlarge the fixed process budget',()=>{
  for(const timeoutMs of [0,-1,Infinity,NaN,1.5,PREFLIGHT_TIMEOUT_MS+1]){
    assert.throws(()=>runBoundedChild(fixture,{mode:'ok'},{timeoutMs}),{code:'INVALID_TIME_BUDGET'});
  }
});
