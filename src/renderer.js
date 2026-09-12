(function(root){
'use strict';
const C={bg:'#06090f',white:'#f2f5f7',muted:'#9da9b9',cyan:'#35e0f1',orange:'#ff953d'};
class Renderer {
 constructor(ctx){this.ctx=ctx;this.fx=[];this.trail=[];this.lastTrail=-1;this.birthFlash=-9;this.eatFlash=-9;}
 ingest(events){for(const e of events){
  if(e.type==='birth'){this.birthFlash=e.t;this.fx.push({...e});}
  if(e.type==='eat'){this.eatFlash=e.t;this.fx.push({...e});}
 }this.fx=this.fx.slice(-160);}
 circle(x,y,r,fill,stroke,lw=1){const c=this.ctx;c.beginPath();c.arc(x,y,Math.max(.01,r),0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=lw;c.strokeStyle=stroke;c.stroke();}}
 text(str,x,y,size=24,color=C.white,weight=600,align='center'){
  const c=this.ctx;c.font=`${weight} ${size}px Arial, sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(str,x,y);
 }
 draw(s,t){
  const c=this.ctx,w=c.canvas.width,h=c.canvas.height;
  c.save();c.scale(w/900,h/1600);c.fillStyle=C.bg;c.fillRect(0,0,900,1600);
  const cx=438,cy=835,R=s.cfg.arena,end=s.done,elapsed=end?Math.max(0,t-s.endTime):0;
  const bg=c.createRadialGradient(cx,cy,30,cx,cy,650);bg.addColorStop(0,'#0e1925');bg.addColorStop(1,C.bg);c.fillStyle=bg;c.fillRect(0,0,900,1600);
  // Title, counter, and all essential action stay inside a conservative Shorts safe area.
  this.text('MULTIPLY  /  DEVOUR',cx,143,20,C.muted,600);
  if(!end){this.text('CAN IT EAT',cx,228,64,C.white,800);this.text('THEM ALL?',cx,302,72,C.cyan,800);}
  else if(s.outcome==='hunter'){this.text('EVERY.',cx,228,66,C.white,800);this.text('LAST. ONE.',cx,302,72,C.orange,800);}
  else{this.text('TOO MANY.',cx,228,66,C.white,800);this.text('THE SWARM WINS.',cx,302,49,C.cyan,800);}
  this.text(String(s.balls.length),cx,397,72,end?C.orange:C.white,700);
  this.text(end?'BALLS LEFT':s.balls.length<=5?'LEFT TO CATCH':'BALLS ALIVE',cx,431,18,C.muted,600);
  // Thin arena boundary and quiet progress ticks; no flashes across the full frame.
  this.circle(cx,cy,R+8,null,'#1d2a38',1);
  this.circle(cx,cy,R,null,'#c7d0da',2.2);
  c.save();c.beginPath();c.arc(cx,cy,R-1,0,Math.PI*2);c.clip();
  if(s.time-this.lastTrail>.024 && !end){this.trail.push({x:s.hunter.x,y:s.hunter.y,t:s.time,r:s.hunter.r});this.lastTrail=s.time;}
  this.trail=this.trail.filter(p=>t-p.t<.22);
  for(const p of this.trail){c.globalAlpha=.07*Math.max(0,1-(t-p.t)/.22);this.circle(cx+p.x,cy+p.y,p.r,C.orange);}
  c.globalAlpha=1;
  // One short tail per particle makes direction readable even in a busy arena.
  c.lineCap='round';
  for(const b of s.balls){
   c.strokeStyle='rgba(53,224,241,.19)';c.lineWidth=3.5;c.beginPath();c.moveTo(cx+b.x-b.vx*.045,cy+b.y-b.vy*.045);c.lineTo(cx+b.x,cy+b.y);c.stroke();
   this.circle(cx+b.x,cy+b.y,b.r,C.cyan);
   this.circle(cx+b.x-1.1,cy+b.y-1.2,1.5,'#d9ffff');
  }
  this.fx=this.fx.filter(e=>t-e.t<.38);
  for(const e of this.fx){const age=Math.max(0,t-e.t),p=age/.38;c.globalAlpha=(1-p)*.7;
   if(e.type==='birth')this.circle(cx+e.x,cy+e.y,7+p*15,null,C.cyan,1.5);
   else{this.circle(cx+e.x,cy+e.y,5+p*11,null,C.orange,2);}
  }c.globalAlpha=1;
  const hunter=s.hunter,hx=cx+hunter.x,hy=cy+hunter.y;
  const pulse=Math.max(0,1-(t-this.eatFlash)/.12);
  const glow=c.createRadialGradient(hx,hy,hunter.r*.3,hx,hy,hunter.r+19);
  glow.addColorStop(0,'rgba(255,128,34,0)');glow.addColorStop(.7,'rgba(255,133,35,.15)');glow.addColorStop(1,'rgba(255,133,35,0)');
  this.circle(hx,hy,hunter.r+19,glow);
  this.circle(hx,hy,hunter.r,'#ff963f','#ffd4a6',2.5);
  // A dark centre identifies the eater without adding a cartoon face.
  this.circle(hx,hy,hunter.r*.70,'#24170f');
  this.circle(hx,hy,hunter.r*.48,'#100e0d');
  this.circle(hx,hy,hunter.r*.7+1,null,`rgba(255,216,174,${.25+pulse*.5})`,2);
  c.restore();
  // Two rules remain visible. Small type clarifies the reproduction cooldown.
  if(!end){
   this.circle(173,1292,6,C.cyan);this.text('WALL HIT → +1',199,1301,29,C.cyan,700,'left');
   this.text('One birth per ball every 3 seconds max.',cx,1340,19,C.muted,500);
   this.circle(248,1392,9,C.orange);this.text('EAT → GROW',274,1402,29,C.orange,700,'left');
   this.text('300 balls = swarm wins',cx,1450,19,C.muted,500);
  }else{
   const a=Math.min(1,elapsed/.35);c.globalAlpha=a;
   this.text(`${s.eaten} EATEN  ·  ${s.endTime.toFixed(1)} SECONDS`,cx,1302,26,C.white,600);
   this.text(`Peak population: ${s.peak}`,cx,1350,23,C.muted,500);
   this.text(s.outcome==='hunter'?'Started small. Finished everything.':'The multiplication won.',cx,1420,25,C.orange,600);
   c.globalAlpha=1;
  }
  c.restore();
 }
}
root.Renderer=Renderer;if(typeof module!=='undefined')module.exports=Renderer;
})(typeof globalThis!=='undefined'?globalThis:this);
