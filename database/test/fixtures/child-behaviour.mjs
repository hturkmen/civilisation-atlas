import {writeFileSync} from 'node:fs';
process.once('message',({mode,pidFile})=>{
  if(mode==='spin'){
    writeFileSync(pidFile,String(process.pid));
    while(true){} // Deliberately blocks JS timers: only the parent can terminate this fixture.
  }
  if(mode==='crash')process.exit(7);
  if(mode==='empty'){process.disconnect();return;}
  process.send({secretPresent:process.env.ATLAS_TEST_SECRET!==undefined,nodeOptionsPresent:process.env.NODE_OPTIONS!==undefined,execArgv:process.execArgv},()=>{
    if(mode==='linger'){setInterval(()=>{},1000);return;}
    process.disconnect();
  });
});
