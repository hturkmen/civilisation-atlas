import {fork} from 'node:child_process';

export const PREFLIGHT_TIMEOUT_MS=20000;
const failure=code=>Object.assign(new Error(code),{code});

// Internal supervisor for a trusted, fixed executable module, never a user-supplied script.
// This is process/time isolation, not an OS filesystem or network sandbox.
export function runBoundedChild(modulePath,payload,{timeoutMs=PREFLIGHT_TIMEOUT_MS}={}) {
  if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>PREFLIGHT_TIMEOUT_MS)throw failure('INVALID_TIME_BUDGET');
  return new Promise((resolve,reject)=>{
    const started=performance.now();
    const child=fork(modulePath,[],{
      serialization:'advanced',stdio:['ignore','ignore','ignore','ipc'],
      execArgv:['--max-old-space-size=128'],env:{},windowsHide:true,
    });
    let result,received=false,error;
    const stop=code=>{error??=failure(code);child.kill('SIGKILL');};
    const timer=setTimeout(()=>stop('TIME_BUDGET'),timeoutMs);
    child.on('message',message=>{
      if(performance.now()-started>=timeoutMs){stop('TIME_BUDGET');return;}
      if(received){stop('PREFLIGHT_FAILED');return;}
      received=true;result=message;
    });
    child.on('error',()=>stop('PREFLIGHT_FAILED'));
    // Wait for actual exit/closed IPC; sending a signal alone is not proof of termination.
    child.on('close',(code,signal)=>{
      clearTimeout(timer);
      if(performance.now()-started>=timeoutMs)error??=failure('TIME_BUDGET');
      if(error)reject(error);
      else if(code!==0||signal||!received)reject(failure('PREFLIGHT_FAILED'));
      else resolve(result);
    });
    child.send(payload,error=>{if(error)stop('PREFLIGHT_FAILED');});
  });
}
