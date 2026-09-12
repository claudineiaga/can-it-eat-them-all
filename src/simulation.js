/* Original deterministic toy simulation. No external dependencies.
   All rules are constant in time. A seeded PRNG makes the same run repeatable.
   Small particles bounce off the arena, but pass through each other.
   Each eligible wall collision creates one child. The hunter steers toward
   the nearest particle and grows by area after every capture. */
(function(root){
'use strict';
class Simulation {
 constructor(options={}) {
  this.cfg={seed:14,initial:24,arena:365,particleSpeed:205,hunterSpeed:295,
   cooldown:3,growth:22,hunterRadius:29,turn:2.4,limit:300,...options};
  this.randomState=this.cfg.seed>>>0;this.time=0;this.eaten=0;this.born=0;
  this.events=[];this.balls=[];this.nextId=0;this.peak=this.cfg.initial;
  this.done=false;this.endTime=null;this.outcome=null;this.history=[];this.sampleAt=0;
  this.hunter={x:-100,y:0,vx:this.cfg.hunterSpeed,vy:0,r:this.cfg.hunterRadius};
  for(let i=0;i<this.cfg.initial;i++){
   const a=this.rand()*Math.PI*2, d=Math.sqrt(this.rand())*(this.cfg.arena-16);
   this.balls.push(this.makeBall(Math.cos(a)*d,Math.sin(a)*d,this.rand()*Math.PI*2,-this.rand()*this.cfg.cooldown));
  }
 }
 rand(){let x=this.randomState+=0x6D2B79F5;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return ((x^x>>>14)>>>0)/4294967296;}
 makeBall(x,y,a,last){return {id:this.nextId++,x,y,vx:Math.cos(a)*this.cfg.particleSpeed,vy:Math.sin(a)*this.cfg.particleSpeed,r:5.2,last,age:0};}
 step(dt=1/120){
  this.events=[];if(this.done)return;
  this.time+=dt;
  const h=this.hunter,c=this.cfg;
  let target=null,best=Infinity;
  for(const b of this.balls){const d=(b.x-h.x)**2+(b.y-h.y)**2;if(d<best){best=d;target=b;}}
  if(target){let a=Math.atan2(h.vy,h.vx),want=Math.atan2(target.y-h.y,target.x-h.x);
   let diff=Math.atan2(Math.sin(want-a),Math.cos(want-a));
   a+=Math.max(-c.turn*dt,Math.min(c.turn*dt,diff));
   h.vx=Math.cos(a)*c.hunterSpeed;h.vy=Math.sin(a)*c.hunterSpeed;
  }
  h.x+=h.vx*dt;h.y+=h.vy*dt;this.bounce(h,c.arena);
  const newborn=[],survivors=[];
  for(const b of this.balls){
   b.x+=b.vx*dt;b.y+=b.vy*dt;b.age+=dt;
   if((b.x-h.x)**2+(b.y-h.y)**2 <= (h.r+b.r)**2){
    this.eaten++;h.r=Math.sqrt(c.hunterRadius**2+this.eaten*c.growth);
    this.events.push({type:'eat',t:this.time,x:b.x,y:b.y,n:this.eaten});continue;
   }
   const hit=this.bounce(b,c.arena);
   if(hit && this.time-b.last>=c.cooldown){
    b.last=this.time;
    const a=Math.atan2(b.vy,b.vx)+(this.rand()-.5)*1.35;
    const child=this.makeBall(b.x*.97,b.y*.97,a,this.time);
    newborn.push(child);this.born++;
    this.events.push({type:'birth',t:this.time,x:b.x,y:b.y,n:this.born});
   }
   survivors.push(b);
  }
  this.balls=survivors.concat(newborn);this.peak=Math.max(this.peak,this.balls.length);
  this.bounce(h,c.arena);
  if(this.time>=this.sampleAt){this.history.push({t:this.time,n:this.balls.length});this.sampleAt+=.25;}
  if(this.balls.length===0 || this.balls.length>=c.limit){
   this.done=true;this.endTime=this.time;this.outcome=this.balls.length===0?'hunter':'swarm';
   this.events.push({type:'end',t:this.time,outcome:this.outcome});
  }
 }
 bounce(b,R){const d=Math.hypot(b.x,b.y),edge=R-b.r;
  if(d<=edge)return false;
  const nx=b.x/d,ny=b.y/d;b.x=nx*edge;b.y=ny*edge;
  const dot=b.vx*nx+b.vy*ny;
  if(dot>0){b.vx-=2*dot*nx;b.vy-=2*dot*ny;return true;}return false;
 }
}
root.Simulation=Simulation;
if(typeof module!=='undefined')module.exports=Simulation;
})(typeof globalThis!=='undefined'?globalThis:this);
