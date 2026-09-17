import {runBoundedChild} from './bounded-child.mjs';

export async function preflightFile(file,expectedSha256) {
  const response=await runBoundedChild(new URL('./preflight-child.mjs',import.meta.url),{file,expectedSha256});
  if(!response||!['ready','rejected','failure'].includes(response.status))throw Object.assign(new Error('PREFLIGHT_FAILED'),{code:'PREFLIGHT_FAILED'});
  return response;
}
