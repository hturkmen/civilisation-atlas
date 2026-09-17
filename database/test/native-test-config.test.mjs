import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nativeTestConfig} from '../src/native-test-config.mjs';
const env={ATLAS_NATIVE_TEST_ACK:'empty-disposable-db',ATLAS_NATIVE_TEST_URL:'postgresql://tester:synthetic@127.0.0.1:5432/atlas_test_worker'};
test('native test requires explicit acknowledgement and URL; never falls back to production variables',()=>{
  assert.throws(()=>nativeTestConfig({DATABASE_URL:env.ATLAS_NATIVE_TEST_URL}),{code:'TEST_DATABASE_ACK_REQUIRED'});
  assert.throws(()=>nativeTestConfig({ATLAS_NATIVE_TEST_ACK:'empty-disposable-db',PGDATABASE:'production'}),{code:'TEST_DATABASE_URL_REQUIRED'});
});
test('native test refuses remote, production names, URL options and malformed escapes',()=>{
  for(const url of ['postgresql://u@db.example/atlas_test_a','postgresql://u@127.0.0.1/production','postgresql://u@localhost/atlas_test_a?host=remote','postgresql://u@localhost/atlas_test_a#x','https://u@localhost/atlas_test_a','postgresql://u@localhost/atlas_test_%ZZ']){
    assert.throws(()=>nativeTestConfig({...env,ATLAS_NATIVE_TEST_URL:url}));
  }
});
test('native test returns explicit local connection settings and bounded timeouts',()=>{
  const c=nativeTestConfig(env);assert.equal(c.database,'atlas_test_worker');assert.equal(c.host,'127.0.0.1');
  assert.equal(c.statement_timeout,10000);assert.equal(c.connectionTimeoutMillis,5000);assert.equal(c.ssl,false);
  assert.equal(nativeTestConfig({...env,ATLAS_NATIVE_TEST_URL:'postgres://u:synthetic@[::1]/atlas_test_ipv6'}).host,'::1');
  assert.throws(()=>nativeTestConfig({...env,ATLAS_NATIVE_TEST_URL:'postgres://u@localhost/atlas_test_a'}),{code:'EXPLICIT_TEST_PASSWORD_REQUIRED'});
});
