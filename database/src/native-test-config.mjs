const fail=code=>{throw Object.assign(new Error(code),{code});};
// Only an explicitly acknowledged, disposable loopback database. No fallback to PG*/DATABASE_URL.
export function nativeTestConfig(env) {
  if(env.ATLAS_NATIVE_TEST_ACK!=='empty-disposable-db')fail('TEST_DATABASE_ACK_REQUIRED');
  let url;
  try {url=new URL(env.ATLAS_NATIVE_TEST_URL);}catch{fail('TEST_DATABASE_URL_REQUIRED');}
  if(!['postgres:','postgresql:'].includes(url.protocol)
    ||!['localhost','127.0.0.1','[::1]'].includes(url.hostname)
    ||url.search||url.hash)fail('LOCAL_TEST_DATABASE_REQUIRED');
  let database,user,password;
  try {database=decodeURIComponent(url.pathname.slice(1));user=decodeURIComponent(url.username);password=decodeURIComponent(url.password);}catch{fail('INVALID_TEST_DATABASE_URL');}
  if(!/^atlas_test_[a-z0-9_]{1,40}$/.test(database)||!user)fail('DISPOSABLE_DATABASE_NAME_REQUIRED');
  if(!password)fail('EXPLICIT_TEST_PASSWORD_REQUIRED');
  return {host:url.hostname.replace(/^\[|\]$/g,''),port:Number(url.port||5432),database,user,password,
    ssl:false,connectionTimeoutMillis:5000,statement_timeout:10000,
    idle_in_transaction_session_timeout:15000,application_name:'atlas-native-test'};
}
