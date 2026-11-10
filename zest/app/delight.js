/* Zest delight: sound, haptics, the zest pop, count-up and the citrus companion. Exposes window.ZD.
   Loaded after app4d.js and before app4b.js. Uses globals from app4a.js (ac, sg, nbuf, tone, noise, audio, gestured, ST_, reduced, phone).
   Rules: every reward uses at least two of three channels (look, sound, buzz); Reduce motion means no particles, hops or loops (a 200 ms
   opacity highlight and static text instead); nothing here ever nags, wilts or asks for attention. */
(function(){
var Z=window.ZD={hour:null,last:'',lastH:null,pops:0,active:0};
(function(){var m=/[?&]hour=(\d{1,2})/.exec(location.search);if(m)Z.hour=Math.min(23,+m[1])})();   // test hook: ?hour=7 or ZD.hour=7
Z.getHour=function(){return typeof Z.hour==='number'?Z.hour:new Date().getHours()};
Z.sky=function(){var h=Z.getHour();return h>=5&&h<9?'dawn':h>=9&&h<16?'day':h>=16&&h<19?'golden':'night'};
Z.night=function(){return Z.sky()==='night'};
function rm(){try{return typeof reduced==='function'&&reduced()}catch(e){return false}}
Z.reduced=rm;
function fin(a,fn){try{if(a)a.onfinish=fn}catch(e){}}

/* ---------- sound: C major pentatonic (C D E G A), built with Web Audio, no files ---------- */
var F={C3:130.81,G3:196,E4:329.63,C5:523.25,D5:587.33,E5:659.25,G5:783.99,A5:880,C6:1046.5,E6:1318.5,A6:1760},OKS=[F.C5,F.D5,F.E5,F.G5,F.A5],okIdx=0,okAt=0;
function bell(t,f,dur,vol){tone(t,f,dur,'sine',vol,sg,.006);tone(t,f*2,dur*.7,'sine',vol*.28,sg,.006)}
function drop(t,f0,f1,dur,vol){var o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(sg);o.start(t);o.stop(t+dur+.02)}
function sweep(t,dur,f0,f1,vol,type){var s=ac.createBufferSource();s.buffer=nbuf;s.loop=true;var fl=ac.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(f1,t+dur);
  var g=ac.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+dur*.3);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(sg);s.start(t);s.stop(t+dur+.05)}
var SND={
  tap:function(t){noise(t,.03,'bandpass',1100,.07,sg);drop(t,220,110,.06,.06)},   // a soft wood tock
  ok:function(t){var n=performance.now();if(n-okAt>2500)okIdx=0;okAt=n;bell(t,OKS[Math.min(okIdx,OKS.length-1)],.22,.2);okIdx++},   // climbs C5 to A5 inside a round, then rests on A5
  soft:function(t){tone(t,F.G3,.24,'sine',.26,sg,.02);tone(t,F.G3*2,.14,'sine',.04,sg,.02)},   // 'mm', never a buzzer
  round:function(t){[F.C5,F.E5,F.G5].forEach(function(f,i){bell(t+i*.09,f,.5,.18)})},
  best:function(t){[F.C5,F.E5,F.G5,F.C6,F.E6,F.A6].forEach(function(f,i){bell(t+i*.08,f,.55,.16)});sweep(t+.1,.7,3500,9000,.03,'highpass')},
  daily:function(t){tone(t,F.C3,2.2,'sine',.22,sg,1);tone(t,F.G3,2.2,'sine',.14,sg,1);[F.E5,F.G5,F.A5,F.C6].forEach(function(f,i){bell(t+.9+i*.28,f,.6,.15)})},
  up:function(t,o){var k=Math.max(0,Math.min(9,((o&&o.combo)||1)-1)),f=F.C5*Math.pow(2,[0,2,4,7,9,12,14,16,19,21][k]/12);bell(t,f,.22,.2)},   // pitch climbs one pentatonic step per answer in a row (reel)
  swish:function(t){sweep(t,.12,300,2400,.12,'lowpass')},
  tick:function(t){tone(t,F.E4,.06,'sine',.2,sg,.004)}};
Z.names=Object.keys(SND);
Z.resetChain=function(){okIdx=0;okAt=0};
Z.sound=function(n,o){try{var s=ST_();if(!s.sfx||!gestured||!SND[n]||!audio())return false;SND[n](ac.currentTime+.005,o);Z.last=n;return true}catch(e){return false}};

/* ---------- haptics: short Android-style patterns, behind the Vibration switch ---------- */
var HP={tap:10,ok:15,soft:10,round:[15,60,15],best:[15,60,15,150,30]};
Z.haptic=function(n){try{if(!HP[n]||!ST_().hap||!navigator.vibrate)return false;navigator.vibrate(HP[n]);Z.lastH=n;return true}catch(e){return false}};

/* ---------- the zest pop: an orange peel curl and six oil-spray dots; transform and opacity only ---------- */
var POOL=[];
function mkPop(){var d=document.createElement('div');d.className='zpop';d.setAttribute('aria-hidden','true');
  d.innerHTML='<svg class="zpeel" viewBox="0 0 24 24" width="20" height="20"><path d="M3 19C3 9 11 3 21 5C14 6 11 9 11 13C11 16 13 17 16 16C12 21 6 21 3 19Z" fill="var(--accent)"/></svg><i></i><i></i><i></i><i></i><i></i><i></i>';return d}
function at(el){var p=phone.getBoundingClientRect(),r=el.getBoundingClientRect();return {x:r.left-p.left+r.width/2,y:r.top-p.top+r.height/2}}
function hl(el){try{el.animate([{opacity:.55},{opacity:1}],{duration:200,easing:'ease-out'})}catch(e){}}   // Reduce motion: a 200 ms opacity highlight
Z.pop=function(el,kind){if(!el||!el.getBoundingClientRect)return;kind=kind||'ok';Z.pops++;
  if(rm()){hl(el);return}
  try{el.animate([{scale:'1'},{scale:'1.12'},{scale:'1'}],{duration:180,easing:'ease-out'})}catch(e){}
  if(!phone||Z.active>=4)return;
  var big=kind==='best'||kind==='daily',tap=kind==='tap',lo=tap?9:big?22:14,hi=tap?14:big?30:22,o=POOL.pop()||mkPop(),c=at(el);
  o.style.left=c.x+'px';o.style.top=c.y+'px';phone.appendChild(o);Z.active++;
  var dots=o.querySelectorAll('i'),off=Math.random()*60;
  for(var i=0;i<dots.length;i++){dots[i].style.display=tap&&i>3?'none':'';var a=(off+i*60+Math.random()*20)*Math.PI/180,r=lo+Math.random()*(hi-lo);
    dots[i].animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+(Math.cos(a)*r).toFixed(1)+'px,'+(Math.sin(a)*r).toFixed(1)+'px) scale(.5)',opacity:0}],{duration:420,easing:'ease-out',fill:'forwards'})}
  var pe=o.querySelector('.zpeel');pe.style.display=tap?'none':'';
  var pa=pe.animate([{transform:'translate(0,0) rotate(0deg) scale(.7)',opacity:1},{transform:'translate('+(hi*.5)+'px,'+(-hi*1.05)+'px) rotate(140deg) scale(1)',opacity:0}],{duration:420,easing:'ease-out',fill:'forwards'});
  fin(pa,function(){if(o.parentNode)o.remove();Z.active=Math.max(0,Z.active-1);if(POOL.length<4)POOL.push(o)})};
/* a gentle miss: a 2 px wobble over 160 ms and a warm amber tint, never red. Reduce motion: only the 200 ms highlight. */
Z.miss=function(el){if(!el)return;el.classList.add('zamber');setTimeout(function(){el.classList.remove('zamber')},520);
  if(rm()){hl(el);return}
  try{el.animate([{translate:'0 0'},{translate:'-2px 0'},{translate:'2px 0'},{translate:'0 0'}],{duration:160})}catch(e){}};
/* a soft gold ring from a number: 700 ms, scale .8 to 1.6, opacity .6 to 0 */
Z.ring=function(el){if(!el||rm()||!phone)return;var o=document.createElement('div'),c=at(el),r=el.getBoundingClientRect(),s=Math.max(60,Math.min(r.width+40,220));o.className='zring';o.setAttribute('aria-hidden','true');
  o.style.cssText='left:'+c.x+'px;top:'+c.y+'px;width:'+s+'px;height:'+s+'px';phone.appendChild(o);
  var a=o.animate([{transform:'translate(-50%,-50%) scale(.8)',opacity:.6},{transform:'translate(-50%,-50%) scale(1.6)',opacity:0}],{duration:700,easing:'ease-out',fill:'forwards'});fin(a,function(){o.remove()})};
/* reward bundle for callers that want all channels at once: kind is 'tap', 'ok', 'best' or 'daily' */
Z.reward=function(el,kind){Z.pop(el,kind);Z.sound(kind==='tap'?'tap':kind==='best'?'best':kind==='daily'?'daily':'ok');Z.haptic(kind==='tap'?'tap':kind==='best'||kind==='daily'?'best':'ok')};

/* ---------- count-up ---------- */
Z.countUp=function(el,to,ms,fmt){if(!el)return;fmt=fmt||function(x){return String(Math.round(x))};var end=fmt(to);
  if(rm()||!isFinite(to)||!(ms>0)){el.textContent=end;return}
  var id=(el._cu||0)+1,t0=0;el._cu=id;el.textContent=fmt(0);
  function stop(){return el._cu!==id}
  requestAnimationFrame(function f(ts){if(stop())return;if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/ms);if(p>=1||!el.isConnected){el.textContent=end;return}el.textContent=fmt(to*(1-Math.pow(1-p,3)));requestAnimationFrame(f)});
  setTimeout(function(){if(!stop())el.textContent=end},ms+250)};

/* ---------- the companion: a citrus slice, one inline SVG, five groups ---------- */
var SVG='<svg class="zc" viewBox="0 0 64 64" aria-hidden="true" focusable="false">'+
 '<g class="zc-body"><circle cx="32" cy="34" r="25" fill="var(--zc-rind)"/><circle cx="32" cy="34" r="21.5" fill="var(--zc-pulp)"/></g>'+
 '<g class="zc-seg" stroke="var(--zc-pith)" stroke-width="2.4" stroke-linecap="round" fill="none"><path d="M32 19.5V14M44.6 26.8L49.3 24M44.6 41.3L49.3 44M32 48.5V54M19.4 41.3L14.7 44M19.4 26.8L14.7 24"/></g>'+
 '<g class="zc-eyes"><g class="zc-open" fill="#3B2210"><circle cx="24.5" cy="34" r="2.7"/><circle cx="39.5" cy="34" r="2.7"/></g><g class="zc-shut" fill="none" stroke="#3B2210" stroke-width="2" stroke-linecap="round"><path d="M21.5 34q3 3 6 0M36.5 34q3 3 6 0"/></g><text class="zc-z" x="45" y="22" font-size="11" font-weight="700" fill="var(--zc-z)">z</text></g>'+
 '<g class="zc-mouth" fill="none" stroke="#3B2210" stroke-width="2.2" stroke-linecap="round"><path d="M27.5 41q4.5 4.5 9 0"/></g>'+
 '<g class="zc-peel"><path d="M43 12c1-6 9-8 13-4c-5-1-8 1-9 5c-1 3-4 3-4-1z" fill="var(--zc-leaf)"/></g></svg>';
Z.svg=SVG;
function Comp(el,state){var s=this;s.el=el;s.n=0;if(!el.querySelector('svg.zc'))el.innerHTML=SVG;s.svg=el.querySelector('svg.zc');s.base='idle';s.set(state||'idle')}
Comp.prototype.loops=function(){var v=this.svg;v.classList.remove('loop');if(rm()||this.base!=='idle')return;v.style.setProperty('--zc-blink',(5+Math.random()*2).toFixed(1)+'s');v.classList.add('loop')};
Comp.prototype.set=function(st){var s=this;
  if(st==='idle'||st==='rest'){s.base=st;s.svg.setAttribute('data-s',st);s.loops();return s}
  s.svg.setAttribute('data-s',st);if(rm()){setTimeout(function(){s.svg.setAttribute('data-s',s.base)},200);return s}   // Reduce motion: no hop, no tilt
  var k=++s.n,fr,o;if(st==='tilt'){fr=[{rotate:'0deg'},{rotate:'6deg'},{rotate:'0deg'}];o={duration:240,easing:'ease-in-out'}}
  else{fr=[{translate:'0 0'},{translate:'0 -14px'},{translate:'0 0'}];o={duration:360,easing:'ease-out',iterations:st==='cheer'?2:1}}
  try{var a=s.svg.animate(fr,o);fin(a,function(){if(k===s.n)s.svg.setAttribute('data-s',s.base)})}catch(e){s.svg.setAttribute('data-s',s.base)}
  return s};
Comp.prototype.hop=function(){return this.set('hop')};Comp.prototype.cheer=function(){return this.set('cheer')};Comp.prototype.tilt=function(){return this.set('tilt')};
Comp.prototype.destroy=function(){this.n++;try{this.svg.getAnimations().forEach(function(a){a.cancel()})}catch(e){}this.el.innerHTML=''};
Z.companion=function(el,state){return el?new Comp(el,state):null};
/* finds every [data-zc] in a screen (data-zc="auto" is idle by day and resting at night: time of day, never absence) */
Z.comps=[];
Z.mount=function(root){Z.comps=[];(root||document).querySelectorAll('[data-zc]').forEach(function(e){var v=e.dataset.zc;Z.comps.push(Z.companion(e,v==='auto'?(Z.night()?'rest':'idle'):v))});return Z.comps};
Z.react=function(st){Z.comps.forEach(function(c){if(c&&c.el.isConnected)c.set(st)})};
})();
