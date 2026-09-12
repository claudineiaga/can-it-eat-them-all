const canvas=document.querySelector('#view'),play=document.querySelector('#play'),seek=document.querySelector('#seek');
const duration=48.15;let sim,renderer,sounds,time=0,playing=false,last=null,ac=null,master=null,voices=[];
function reset(){sim=new Simulation();renderer=new Renderer(canvas.getContext('2d'));sounds=new SoundDesign();time=0;last=null;renderer.draw(sim,0);}
function silence(){for(const v of voices){try{v.stop();}catch(e){}}voices=[];}
function audioInit(){if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.connect(ac.destination);}ac.resume();setVolume();}
function setVolume(){if(master)master.gain.value=document.querySelector('#sound').checked?Number(document.querySelector('#volume').value)*.85:0;}
function note(n){if(!ac||!playing)return;const start=ac.currentTime+Math.max(0,n.t-time),o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(n.f,start);if(n.kind==='birth')o.frequency.exponentialRampToValueAtTime(n.f*.65,start+n.d);g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(n.a,start+.003);g.gain.exponentialRampToValueAtTime(.0001,start+n.d);o.connect(g);g.connect(master);o.start(start);o.stop(start+n.d+.01);voices.push(o);o.onended=()=>{o.disconnect();g.disconnect();voices=voices.filter(v=>v!==o);};}
function advance(t,withSound){while(!sim.done&&sim.time+1e-8<t){sim.step();renderer.ingest(sim.events);const ns=sounds.ingest(sim.events);if(withSound)ns.forEach(note);}time=t;renderer.draw(sim,time);seek.value=time;document.querySelector('#time').textContent=`0:${String(Math.floor(time)).padStart(2,'0')}`;}
function toggle(){if(time>=duration){reset();seek.value=0;}playing=!playing;last=null;if(playing){audioInit();document.querySelector('#status').textContent='Playing the simulation with the same rules from start to finish.';}else silence();play.textContent=playing?'❚❚ Pause':'▶ Play';}
play.onclick=toggle;document.querySelector('#restart').onclick=()=>{silence();reset();advance(0,false);};
seek.oninput=()=>{const t=Number(seek.value);silence();reset();advance(t,false);last=null;};
document.querySelector('#sound').onchange=setVolume;document.querySelector('#volume').oninput=setVolume;
document.querySelector('#fullscreen').onclick=()=>{if(canvas.requestFullscreen)canvas.requestFullscreen().catch(()=>{document.querySelector('#status').textContent='Full screen is unavailable in this browser.';});};
document.addEventListener('keydown',e=>{if(['INPUT','BUTTON','SUMMARY'].includes(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();toggle();}if(e.key.toLowerCase()==='r')document.querySelector('#restart').click();if(e.key.toLowerCase()==='m'){const cb=document.querySelector('#sound');cb.checked=!cb.checked;setVolume();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)toggle();});
function frame(now){if(playing){if(last!==null)advance(Math.min(duration,time+Math.min((now-last)/1000,.05)),true);last=now;if(time>=duration){playing=false;silence();play.textContent='↻ Watch again';document.querySelector('#status').textContent='End of the pilot. Restart to watch again.';}}requestAnimationFrame(frame);}
reset();requestAnimationFrame(frame);
