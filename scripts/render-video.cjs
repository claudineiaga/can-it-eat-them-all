const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');
for(const name of ['DejaVuSans.ttf','DejaVuSans-Bold.ttf']){
 const font=path.join('/usr/share/fonts/truetype/dejavu',name);
 if(fs.existsSync(font))GlobalFonts.registerFromPath(font,'Arial');
}
const Simulation=require('../src/simulation'),Renderer=require('../src/renderer'),SoundDesign=require('../src/audio');
const W=1080,H=1920,FPS=60;
const out=path.resolve(__dirname,'../output');
fs.mkdirSync(out,{recursive:true});
const test=new Simulation();while(!test.done&&test.time<120)test.step();
if(!test.done)throw Error('No ending within 120 seconds');
const duration=Math.ceil((test.endTime+2.6)*FPS)/FPS;
console.log(JSON.stringify({duration,ending:test.endTime,peak:test.peak,eaten:test.eaten,born:test.born}));
const canvas=createCanvas(W,H),s=new Simulation(),r=new Renderer(canvas.getContext('2d')),sound=new SoundDesign();
if(process.argv.includes('--stills')){
 const marks=[0,3,10,25,31,40,45.1,47];
 for(let frame=0;frame<=47*FPS;frame++){
  const t=frame/FPS;
  while(!s.done&&s.time+1e-8<t){s.step();r.ingest(s.events);}
  if(marks.some(x=>Math.abs(x-t)<.001)){r.draw(s,t);fs.writeFileSync(path.join(out,`frame-${t}.png`),canvas.toBuffer('image/png'));}
 }process.exit(0);
}
const ff=spawn('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-threads','3','-movflags','+faststart',path.join(out,'silent.mp4')]);
let fferr='';ff.stderr.on('data',b=>fferr+=b);let lastProgress=Date.now();
async function main(){
 for(let frame=0;frame<duration*FPS;frame++){
  const t=frame/FPS;
  while(!s.done&&s.time+1e-8<t){s.step();r.ingest(s.events);sound.ingest(s.events);}
  r.draw(s,t);
  if(!ff.stdin.write(canvas.data()))await new Promise((res,rej)=>{const fail=e=>{ff.stdin.off('drain',ok);rej(e);};const ok=()=>{ff.stdin.off('error',fail);res();};ff.stdin.once('drain',ok);ff.stdin.once('error',fail);});
  if(Date.now()-lastProgress>10000){console.log(`Rendered ${t.toFixed(1)} / ${duration.toFixed(1)} seconds`);lastProgress=Date.now();}
 }
 ff.stdin.end();await new Promise((res,rej)=>ff.on('close',code=>code?rej(Error(fferr)):res()));
 fs.writeFileSync(path.join(out,'audio-notes.json'),JSON.stringify({duration,notes:sound.notes}));
 fs.writeFileSync(path.join(out,'run-report.json'),JSON.stringify({duration,seed:s.cfg.seed,rules:s.cfg,ending:s.endTime,peak:s.peak,eaten:s.eaten,born:s.born,history:s.history},null,2));
 console.log('Visual render complete.');
}
main().catch(e=>{console.error(e);process.exit(1);});
