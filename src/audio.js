/* Original synthesized sound design. No recordings or licensed melodies. */
(function(root){
'use strict';
class SoundDesign {
 constructor(){this.lastBirth=-1;this.lastEat=-1;this.notes=[];}
 ingest(events){const fresh=[];
  for(const e of events){
   if(e.type==='birth'&&e.t-this.lastBirth>.085){
    this.lastBirth=e.t;fresh.push({t:e.t,f:1046.5*[1,1.125,1.25,1.5,1.667][e.n%5],d:.065,a:.045,kind:'birth'});
   }
   if(e.type==='eat'&&e.t-this.lastEat>.055){
    this.lastEat=e.t;
    const scale=[261.63,293.66,329.63,392,440,523.25,440,392];
    fresh.push({t:e.t,f:scale[e.n%scale.length],d:.18,a:.13,kind:'eat'});
   }
   if(e.type==='end')for(let i=0;i<4;i++)fresh.push({t:e.t+i*.095,f:[261.63,329.63,392,523.25][i],d:.8,a:.10,kind:'end'});
  }this.notes.push(...fresh);return fresh;
 }
}
root.SoundDesign=SoundDesign;if(typeof module!=='undefined')module.exports=SoundDesign;
})(typeof globalThis!=='undefined'?globalThis:this);
