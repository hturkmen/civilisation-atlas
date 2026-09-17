import {Rejection,readBounded,parseBounded,prepareBundle} from './bundle-preflight.mjs';

// No DB client, credentials, network download, or execution of input code.
process.once('message',async({file,expectedSha256})=>{
  const receipt={sha256:null,bytesObserved:0};
  let response;
  try {
    const raw=await readBounded(file,receipt);
    if(expectedSha256!==undefined&&receipt.sha256!==expectedSha256){
      response={status:'failure',code:'INPUT_CHANGED'};
    } else {
      const prepared=prepareBundle(parseBounded(raw));
      const {resolveEntity,...inputs}=prepared.inputs;
      response={status:'ready',receipt,inputs,pins:prepared.pins,current:prepared.current};
    }
  } catch(error) {
    if(error instanceof Rejection){
      response=expectedSha256!==undefined&&receipt.sha256===null
        ?{status:'failure',code:'INPUT_UNAVAILABLE'}
        :{status:'rejected',receipt,code:error.code};
    } else response={status:'failure',code:'PREFLIGHT_FAILED'};
  }
  process.send(response,error=>{process.exitCode=error?1:0;if(process.connected)process.disconnect();});
});
