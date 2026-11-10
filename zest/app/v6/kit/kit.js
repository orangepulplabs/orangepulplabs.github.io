/* Zest v6 kit (ZK): the shared feel layer for redesigned puzzles. Vanilla JS, no build, transform and opacity only.
   Loaded after app4a.js (audio, reduced(), ST_) and delight.js (ZD), before the v6 puzzle files.
   Everything here respects Reduce motion (OS setting, the in-app switch, or api.rm) and the Sound / Vibration switches.

   ZK.rm(api)                         true when motion should be minimal
   ZK.sfx(name, opt) / ZK.buzz(name)  sound (Web Audio, no files) and haptic; silent when muted or before the first touch
   ZK.anim(el, frames, ms, ease, delay)  WAAPI wrapper that does nothing under reduced motion
   ZK.pressable(el)                   press state: scale .94 on touch, spring back (CSS 'scale', composes with any transform)
   ZK.wrong(el, msg)                  a wrong move: small wobble + warm amber tint + low 'mm' + double tick; never red, never a buzzer
   ZK.burst(host, x, y, o)            a few particles (pooled), host-relative coordinates
   ZK.ghost(host, steps, o)           level-1 ghost-hand demo: 2-3 s, skippable by touch, never again once the player has moved
   ZK.win(host, o)                    in-board win: settle, rising chime, colour wave, particles, stars with haptic ticks, Next in < 1 s
   ZK.stuck(host, on, o)              the 'no moves left' signal with a big Undo
   ZK.idle(host, ms, fn)              calls fn after ms with no touch (used to glow the Hint button: the soft 'stuck' hook)
   ZK.counter(o) / ZK.pips(par)       progress built into the board: a count that rolls and pops, and par pips that fill per move */
(function(){
var ZK=window.ZK={v:1};
var SPRING='cubic-bezier(.34,1.56,.64,1)',EASE='cubic-bezier(.2,.8,.2,1)',EIN='cubic-bezier(.5,0,.75,0)';
ZK.SPRING=SPRING;ZK.EASE=EASE;ZK.EIN=EIN;
/* last input kind: the win card's Next takes focus only for keyboard players */
ZK.kbd=false;try{document.addEventListener('keydown',function(e){if(e.key==='Tab'||e.key.indexOf('Arrow')===0||e.key==='Enter'||e.key===' ')ZK.kbd=true},true);document.addEventListener('pointerdown',function(){ZK.kbd=false},true)}catch(e){}

/* ---------- settings ---------- */
function st(){try{return typeof ST_==='function'?ST_():{}}catch(e){return{}}}
ZK.rm=function(api){if(api&&api.rm)return true;try{if(typeof reduced==='function'&&reduced())return true}catch(e){}
  try{return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){return false}};
ZK.muted=function(){var s=st();return s.sfx===false||s.sfx===0};

/* ---------- css (one <style>, injected once) ---------- */
var CSS=''
+'.zk-p{transition:scale .22s '+SPRING+';-webkit-tap-highlight-color:transparent}.zk-p:active{scale:.94;transition:scale .06s ease-out}'
+'.zk-amber{box-shadow:0 0 0 3px #E9A23B!important}'
+'.zk-host{position:relative}'
+'.zk-dot{position:absolute;left:0;top:0;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;pointer-events:none;z-index:6;will-change:transform,opacity}'
+'.zk-hand{position:absolute;left:0;top:0;width:46px;height:54px;margin:-4px 0 0 -14px;pointer-events:none;z-index:9;opacity:0;will-change:transform,opacity;filter:drop-shadow(0 3px 6px rgba(0,0,0,.28))}'
+'.zk-tap{position:absolute;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid var(--accent,#E8590C);pointer-events:none;z-index:8;opacity:0}'
+'.zk-win{position:absolute;left:50%;top:calc(100% - 52px);z-index:10;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:220px;max-width:calc(100% - 16px);padding:12px 16px 14px;border-radius:22px;background:var(--surface,#fff);box-shadow:0 10px 34px rgba(0,0,0,.22),0 0 0 1px var(--line,#e6dfd3);transform:translateX(-50%);text-align:center;font:600 .875rem/1.3 var(--font,system-ui);color:var(--muted,#5f5a52)}'
+'.zk-win .zk-stars{display:flex;gap:8px}.zk-win .zk-star{width:38px;height:38px}.zk-win .zk-star path{fill:var(--line,#ddd);stroke:var(--edge,#999);stroke-width:1.5}.zk-win .zk-star.on path{fill:#F6B73C;stroke:#B0700A}'
+'.zk-win .zk-next{all:unset;box-sizing:border-box;cursor:pointer;min-width:160px;height:48px;padding:0 22px;border-radius:24px;background:var(--accent,#E8590C);color:var(--on-accent,#1B1916);font:800 1rem/48px var(--font,system-ui);text-align:center}'
+'.zk-win .zk-next:focus-visible,.zk-win .zk-more:focus-visible{outline:3px solid var(--ink,#000);outline-offset:2px}'
+'.zk-win .zk-more{all:unset;cursor:pointer;min-height:32px;padding:0 10px;font:700 .8125rem/32px var(--font,system-ui);color:var(--link,#B23A07)}'
+'.zk-won .zk-board{pointer-events:none}'
+'.zk-stuckchip{position:relative;z-index:7;display:flex;align-items:center;gap:8px;max-width:100%;box-sizing:border-box;padding:4px 4px 4px 14px;border-radius:26px;background:var(--surface,#fff);box-shadow:0 6px 22px rgba(0,0,0,.18),0 0 0 1px var(--line,#ddd);font:700 .8125rem/1.25 var(--font,system-ui);color:var(--ink,#111);text-align:left}'
+'.zk-stuckchip>span{flex:1 1 auto;min-width:0}'
+'.zk-stuckchip button{all:unset;flex:none;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;height:44px;min-width:44px;padding:0 12px;border-radius:22px;background:var(--accent,#E8590C);color:var(--on-accent,#111);font:800 .9375rem var(--font,system-ui)}'
+'.zk-stuckchip button.zk-rs{padding:0;width:44px;background:var(--surface-2,rgba(0,0,0,.06));color:var(--ink,#111);box-shadow:inset 0 0 0 1.5px var(--line,#ddd)}'
+'.zk-stuckchip button:focus-visible{outline:3px solid var(--ink,#000);outline-offset:2px}'
/* the reserved row under the board (puzzle page: .zk-status around the hint line; elsewhere a slot after the board) */
+'.zk-status{position:relative;min-height:52px;display:flex;flex-direction:column;justify-content:center}'
+'.zk-status>.pzh,.zk-status>.pzh:empty{min-height:0;margin-top:0;margin-bottom:0}'
+'.zk-status.zk-haschip>.pzh{display:none}'
+'.zk-slot{display:flex;justify-content:center;padding:0 8px}.zk-slot:empty{display:none}'
+'.zk-slot.zk-flow{min-height:52px}.zk-slot.zk-flow:empty{display:flex}'
/* a rule-breaking move: the cells or pieces in the clash */
+'.zk-hoff{opacity:.42}'
+'.zk-clash{outline:3px solid #E9A23B!important;outline-offset:1px!important}'
+'.zk-stuck .zk-board{opacity:.62;transition:opacity .3s}'
+'.zk-ctr{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px 0 10px;border-radius:17px;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--line,#ddd);font:800 1.0625rem/1 var(--font,system-ui);color:var(--ink,#111);font-variant-numeric:tabular-nums}'
+'.zk-ctr svg{width:18px;height:18px;flex:none}.zk-ctr .zk-num{display:inline-block;min-width:1.2ch;text-align:center}.zk-ctr.zk-zero{background:var(--ok-bg,#ddefe2);color:var(--ok-ink,#14532d);box-shadow:none}'
+'.zk-pips{display:flex;flex-wrap:wrap;justify-content:center;gap:5px;min-height:10px;max-width:100%}.zk-pips i{width:9px;height:9px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--edge,#888)}.zk-pips i.on{background:var(--accent,#E8590C);box-shadow:none}.zk-pips i.over{width:7px;height:7px;margin-top:1px;background:var(--edge,#888);box-shadow:none;opacity:.7}'
+'.zk-sr{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'
+'.zk-hintglow{animation:zkglow 1.6s ease-in-out 3}@keyframes zkglow{0%,100%{box-shadow:var(--sh1,0 1px 3px rgba(0,0,0,.2))}50%{box-shadow:0 0 0 4px var(--accent,#E8590C),0 0 18px var(--accent,#E8590C)}}'
/* the hint mark wins over a puzzle's own 'all:unset' (an !important animation beats normal declarations; its keyframes are always visible) */
+'.zk-mark{animation:zkmark 1s ease-in-out infinite!important;outline:3px dashed var(--ink,#111);outline-offset:3px}@keyframes zkmark{0%,100%{outline:3px dashed var(--ink,#111);outline-offset:2px}50%{outline:3px dashed var(--accent,#E8590C);outline-offset:5px}}'
+'@media (prefers-reduced-motion:reduce){.zk-p,.zk-p:active{transition:none;scale:none}.zk-hintglow{animation:none}.zk-mark{animation:none!important;outline:3px dashed var(--ink,#111)!important;outline-offset:3px!important}}'
+'.zk-rm .zk-p,.zk-rm .zk-p:active{transition:none;scale:none}.zk-rm .zk-mark,.zk-rm.zk-mark{animation:none!important;outline:3px dashed var(--ink,#111)!important;outline-offset:3px!important}';
ZK.css=function(extra,id){try{if(!document.getElementById('zk-css')){var s=document.createElement('style');s.id='zk-css';s.textContent=CSS;document.head.appendChild(s)}
  if(extra&&id&&!document.getElementById(id)){var t=document.createElement('style');t.id=id;t.textContent=extra;document.head.appendChild(t)}}catch(e){}};

/* ---------- sound: short synthesised cues on the v4 engine's sfx bus ---------- */
var PENT=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.5,1567.98,1760,2093];
function A(){try{if(ZK.muted()||typeof audio!=='function'||typeof gestured==='undefined'||!gestured)return null;return audio()}catch(e){return null}}
function osc(t,f0,f1,dur,vol,type){var o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(sg);o.start(t);o.stop(t+dur+.03)}
function nz(t,dur,type,f,vol,f1){var s=ac.createBufferSource();s.buffer=nbuf;s.loop=true;var fl=ac.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t+dur);fl.Q.value=1.2;
  var g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(sg);s.start(t);s.stop(t+dur+.03)}
function bell(t,f,dur,vol){osc(t,f,0,dur,vol);osc(t,f*2.01,0,dur*.6,vol*.25)}
var SFX={
  press:function(t){osc(t,1800,1500,.03,.035)},
  click:function(t,o){var p=(o&&o.p)||0;nz(t,.02,'bandpass',3200,.09);osc(t,560+p*28,420+p*20,.05,.07,'triangle')},        // a light switch; p = pitch step
  pop:function(t){osc(t,980,260,.08,.12);nz(t+.005,.04,'highpass',2400,.05)},                                               // a peg popping out
  clack:function(t){nz(t,.035,'bandpass',1500,.12);osc(t,210,150,.06,.1,'triangle')},                                         // a peg landing
  lift:function(t){osc(t,420,620,.07,.05,'triangle')},
  pour:function(t,o){var d=(o&&o.d)||.32;nz(t,d,'lowpass',380,.09,1600);for(var i=0;i<3;i++)osc(t+.05+i*d/3.4,300+i*90,520+i*80,.05,.035)},   // a soft glug
  cap:function(t,o){var n=(o&&o.n)||0;bell(t,PENT[Math.min(n,PENT.length-1)],.5,.16);bell(t+.07,PENT[Math.min(n+2,PENT.length-1)],.5,.11);nz(t,.03,'bandpass',2600,.06)},
  slide:function(t){nz(t,.07,'bandpass',900,.1,500);osc(t+.05,170,140,.05,.07,'triangle')},                                  // a wooden tile settling
  roll:function(t,o){var d=Math.min(.6,(o&&o.d)||.2);nz(t,d,'lowpass',500,.05,300)},
  thud:function(t,o){var k=Math.min(1,((o&&o.k)||3)/6);osc(t,150,70,.11,.12+.08*k);nz(t,.04,'lowpass',700,.06)},
  drop:function(t){osc(t,700,1400,.12,.1);bell(t+.08,1046.5,.4,.12)},                                                          // the ball drops into the goal
  soft:function(t){osc(t,196,180,.22,.16);osc(t,392,370,.12,.03)},                                                             // 'mm': kind, not a buzzer
  undo:function(t){osc(t,660,440,.07,.05,'triangle')},
  star:function(t,o){var i=(o&&o.i)||0;bell(t,[783.99,987.77,1318.5][i]||1318.5,.45,.15)},
  chime:function(t,o){var s=(o&&o.stars)||1,seq=s>=3?[0,2,4,5,7]:s===2?[0,2,4,5]:[0,2,4];seq.forEach(function(k,i){bell(t+i*.075,PENT[k],.55,.13)})}};
ZK.sfx=function(n,o){try{if(!SFX[n]||!A())return false;SFX[n](ac.currentTime+.003,o);ZK.lastSfx=n;return true}catch(e){return false}};
var HAP={tap:8,move:12,pop:[8,30,14],wrong:[6,50,6],cap:[14,40,20],star:14,win:[15,60,15,60,30],thud:16,soft:10};
ZK.buzz=function(n){try{var s=st();if(s.hap===false||s.hap===0||!navigator.vibrate||!HAP[n])return false;navigator.vibrate(HAP[n]);ZK.lastBuzz=n;return true}catch(e){return false}};

/* ---------- motion ---------- */
ZK.anim=function(el,frames,ms,ease,delay,fill){if(!el||!el.animate||ZK.rm())return null;try{return el.animate(frames,{duration:ms,easing:ease||EASE,delay:delay||0,fill:fill||'none'})}catch(e){return null}};
ZK.pressable=function(el){if(el&&el.classList)el.classList.add('zk-p');return el};
/* a wrong move: distinct but kind */
ZK.wrong=function(el,o){o=o||{};if(el){el.classList.add('zk-amber');setTimeout(function(){el.classList.remove('zk-amber')},480);
    if(ZK.rm()){try{el.animate([{opacity:.55},{opacity:1}],{duration:220})}catch(e){}}
    else ZK.anim(el,[{translate:'0 0'},{translate:'-5px 0'},{translate:'4px 0'},{translate:'-2px 0'},{translate:'0 0'}],240,'ease-out')}
  if(!o.silent){ZK.sfx('soft');ZK.buzz('wrong')}};
/* particles: n dots from (x,y) in host coordinates */
var DOTS=[];
ZK.burst=function(host,x,y,o){if(!host||ZK.rm())return;o=o||{};var n=o.n||10,cols=o.colors||['var(--accent,#E8590C)','#F6B73C','var(--accent-2,#F7A35C)'],r0=o.r||34;
  for(var i=0;i<n;i++){var d=DOTS.pop()||document.createElement('i');d.className='zk-dot';d.style.background=cols[i%cols.length];d.style.left=x+'px';d.style.top=y+'px';host.appendChild(d);
    var a=(i/n)*Math.PI*2+Math.random()*.6,r=r0*(.6+Math.random()*.7),s=o.size||(.7+Math.random()*.6);
    var an=d.animate([{transform:'translate(0,0) scale('+s+')',opacity:1},{transform:'translate('+(Math.cos(a)*r).toFixed(1)+'px,'+(Math.sin(a)*r+(o.fall||8)).toFixed(1)+'px) scale(.2)',opacity:0}],{duration:(o.ms||520)+Math.random()*160,easing:'cubic-bezier(.15,.7,.3,1)',fill:'forwards'});
    (function(d){an.onfinish=function(){if(d.parentNode)d.parentNode.removeChild(d);if(DOTS.length<40)DOTS.push(d)}})(d)}};
/* centre of el in host coordinates (one layout read) */
ZK.at=function(host,el){var h=host.getBoundingClientRect(),r=el.getBoundingClientRect();return{x:r.left-h.left+r.width/2,y:r.top-h.top+r.height/2,w:r.width,h:r.height}};

/* ---------- ghost hand ---------- */
var HAND='<svg viewBox="0 0 46 54" width="46" height="54" aria-hidden="true"><path d="M15 4c2.4 0 4.2 1.9 4.2 4.3v15.2l1.3-.4c2.2-.6 4.3.5 5 2.4l.3.9 1.2-.3c2.2-.5 4.2.7 4.8 2.7l.2.8 1.1-.2c2.3-.3 4.3 1.3 4.5 3.6l.6 8.1c.4 5.6-3.2 10.7-8.6 12.2l-3.4.9c-4.8 1.3-9.9-.6-12.7-4.7L3.6 37.2c-1.3-1.9-.8-4.5 1.1-5.8 1.7-1.1 3.9-.9 5.3.5l.8.8V8.3C10.8 5.9 12.7 4 15 4z" fill="#fff" stroke="#1B1916" stroke-width="2.4" stroke-linejoin="round"/></svg>';
ZK.HAND=HAND;   /* teach2: the Show me demo (teach2.js) draws the same hand */
function seenMap(){try{return JSON.parse(localStorage.getItem('zv6ghost')||'{}')||{}}catch(e){return{}}}
ZK.ghostSeen=function(id){return !!seenMap()[id]};
ZK.ghostDone=function(id){try{var m=seenMap();if(m[id])return;m[id]=1;localStorage.setItem('zv6ghost',JSON.stringify(m))}catch(e){}};
/* steps: [{tap:el, down:fn, up:fn} | {drag:[elA,elB], down:fn, up:fn} | {swipe:[el,dx,dy]}]. o: {id, level, delay, repeat, force}. Returns {stop()} or null. */
ZK.ghost=function(host,steps,o){o=o||{};if(!host)return null;if(!o.force&&((o.level&&o.level!==1)||(o.id&&ZK.ghostSeen(o.id))))return null;
  var hand=document.createElement('div'),ring=document.createElement('div'),dead=false,tm=[],plays=0,anims=[],rm=ZK.rm(),live=false;   /* live: a step's down has fired in this play and the play has not been cleaned up */
  hand.className='zk-hand';hand.innerHTML=HAND;ring.className='zk-tap';host.classList.add('zk-host');
  function T(fn,ms){tm.push(setTimeout(function(){if(!dead)fn()},ms))}
  function A2(el,fr,ms,ease,delay){if(rm)return;try{var a=el.animate(fr,{duration:ms,easing:ease||EASE,delay:delay||0,fill:'forwards'});anims.push(a);return a}catch(e){}}
  function pt(el){var p=ZK.at(host,el);return p}
  function place(x,y,op){hand.style.transform='translate('+x+'px,'+y+'px)';hand.style.opacity=op}
  function tapFx(x,y){ring.style.left=x+'px';ring.style.top=y+'px';if(rm){ring.style.opacity=.8;T(function(){ring.style.opacity=0},500);return}
    A2(ring,[{transform:'scale(.4)',opacity:.9},{transform:'scale(1.3)',opacity:0}],520,'ease-out')}
  function play(){if(dead)return;plays++;host.appendChild(hand);host.appendChild(ring);var t=0;
    steps.forEach(function(s){
      if(s.tap){var p=pt(s.tap),x=p.x,y=p.y;
        T(function(){if(rm){place(x,y,1);return}place(x+26,y+40,0);A2(hand,[{transform:'translate('+(x+26)+'px,'+(y+40)+'px)',opacity:0},{transform:'translate('+x+'px,'+y+'px)',opacity:1}],420)},t);
        T(function(){A2(hand,[{transform:'translate('+x+'px,'+y+'px) scale(1)',opacity:1},{transform:'translate('+x+'px,'+(y+3)+'px) scale(.9)',opacity:1}],120);tapFx(x,y);live=true;if(s.down)s.down()},t+460);
        T(function(){A2(hand,[{transform:'translate('+x+'px,'+(y+3)+'px) scale(.9)',opacity:1},{transform:'translate('+x+'px,'+y+'px) scale(1)',opacity:1}],160);if(s.up)s.up()},t+(s.hold||800));
        t+=(s.hold||800)+260}
      else if(s.drag||s.swipe){var a=pt(s.drag?s.drag[0]:s.swipe[0]),b=s.drag?pt(s.drag[1]):{x:a.x+s.swipe[1],y:a.y+s.swipe[2]};
        T(function(){if(rm){place(a.x,a.y,1);return}place(a.x+26,a.y+40,0);A2(hand,[{transform:'translate('+(a.x+26)+'px,'+(a.y+40)+'px)',opacity:0},{transform:'translate('+a.x+'px,'+a.y+'px)',opacity:1}],420)},t);
        T(function(){tapFx(a.x,a.y);live=true;if(s.down)s.down()},t+460);
        T(function(){if(rm){place(b.x,b.y,1);if(s.up)s.up();return}A2(hand,[{transform:'translate('+a.x+'px,'+a.y+'px) scale(.92)',opacity:1},{transform:'translate('+b.x+'px,'+b.y+'px) scale(.92)',opacity:1}],s.swipe?380:760,'cubic-bezier(.45,0,.3,1)');if(s.move)s.move()},t+620);
        T(function(){if(s.up)s.up()},t+(s.swipe?1000:1400));
        t+=s.swipe?1250:1650}});
    T(function(){if(rm){hand.style.opacity=0;return}A2(hand,[{opacity:1},{opacity:0}],260)},t);
    T(function(){cleanup(false);if(plays<(o.repeat||2))T(play,o.again||4200)},t+300)}
  /* undo the puzzle's preview state, but ONLY when a demo step actually set some (live). Each step's cancel runs, or its up when it has no cancel.
     Never touching the board before the first down (or between plays) means an early touch lands on the very element it pressed. */
  function restore(){if(!live)return;live=false;steps.slice().reverse().forEach(function(s){var f=s.cancel||s.up;if(f)try{f()}catch(e){}})}
  function cleanup(all){anims.forEach(function(a){try{a.cancel()}catch(e){}});anims=[];if(hand.parentNode)hand.remove();if(ring.parentNode)ring.remove();
    restore();if(all){dead=true;tm.forEach(clearTimeout)}}
  /* the player's touch stops the demo AND counts as their move. If undoing the preview rebuilt the element under the finger, the browser would
     never deliver the rest of the gesture (no click on a detached node: the "swallowed first tap"), so the touch is replayed on the element now there. */
  function replay(e){var x=e.clientX,y=e.clientY,t=document.elementFromPoint(x,y);if(!t||!host.contains(t))return;
    e.stopImmediatePropagation();var I={bubbles:true,cancelable:true,composed:true,clientX:x,clientY:y,screenX:e.screenX,screenY:e.screenY,pointerId:e.pointerId,pointerType:e.pointerType,isPrimary:e.isPrimary,button:e.button,buttons:e.buttons,width:e.width,height:e.height,pressure:e.pressure};
    try{t.dispatchEvent(new PointerEvent('pointerdown',I))}catch(er){return}
    var clicked=false;function ck(){clicked=true}
    function up(ev){if(ev.pointerId!==e.pointerId)return;document.removeEventListener('pointerup',up,true);document.removeEventListener('pointercancel',up,true);if(ev.type!=='pointerup')return;
      document.addEventListener('click',ck,true);
      setTimeout(function(){document.removeEventListener('click',ck,true);if(clicked)return;var u=document.elementFromPoint(ev.clientX,ev.clientY);
        if(u&&u.isConnected&&(u===t||t.contains(u)||u.contains(t))&&Math.hypot(ev.clientX-x,ev.clientY-y)<12){try{(u.closest('button')||u).dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:ev.clientX,clientY:ev.clientY}))}catch(er){}}},0)}
    document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true)}
  function stop(e){if(dead)return;var tg=e&&e.type==='pointerdown'?e.target:null;cleanup(true);host.removeEventListener('pointerdown',stop,true);document.removeEventListener('keydown',stop,true);
    if(tg&&!tg.isConnected)replay(e)}
  host.addEventListener('pointerdown',stop,true);document.addEventListener('keydown',stop,true);
  T(play,o.delay==null?650:o.delay);
  return{stop:stop,el:hand,playing:function(){return !dead}}};

/* ---------- in-board win ---------- */
var STAR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.9l-5.8 3.2 1.4-6.4L2.7 9.3l6.5-.7z" stroke-linejoin="round"/></svg>';
/* o: {stars, board (el whose [data-zkc] cells wave; default host), origin el or {x,y}, line, onNext, nextLabel, onMore, moreLabel, colors} */
ZK.win=function(host,o){o=o||{};var rm=ZK.rm(),stars=Math.max(1,Math.min(3,o.stars||1)),board=o.board||host,box,btn,dead=false;
  host.classList.add('zk-host','zk-won');ZK.buzz('move');
  /* 1. settle (0 to 300 ms) */
  ZK.anim(board,[{scale:'1'},{scale:'.975'},{scale:'1.012'},{scale:'1'}],320,'ease-out');
  /* 2. chime + wave + particles (from 300 ms) */
  setTimeout(function(){if(dead)return;ZK.sfx('chime',{stars:stars});
    if(!rm){var cells=[].slice.call(board.querySelectorAll('[data-zkc]')),hb=host.getBoundingClientRect(),org=o.origin,ox,oy;
      if(org&&org.getBoundingClientRect){var q=ZK.at(host,org);ox=q.x;oy=q.y}else if(org&&org.x!=null){ox=org.x;oy=org.y}else{var bq=ZK.at(host,board);ox=bq.x;oy=bq.y}
      var pos=cells.map(function(c){var r=c.getBoundingClientRect();return{c:c,d:Math.hypot(r.left-hb.left+r.width/2-ox,r.top-hb.top+r.height/2-oy)}}),mx=1;
      pos.forEach(function(p){if(p.d>mx)mx=p.d});
      /* SVG cells scale around the SVG origin, not their own centre (pieces flew off the board in Seven Pieces), so they only lift */
      pos.forEach(function(p){var sv=typeof SVGElement!=='undefined'&&p.c instanceof SVGElement,lu=4;if(sv)try{var m=(p.c.ownerSVGElement||p.c).getScreenCTM();if(m&&m.a>0)lu=+(4/m.a).toFixed(4)}catch(e){}   /* 1.2.1: SVG user units can be tiny (Link Across: ~40 px per unit), so lift 4 SCREEN px */
        ZK.anim(p.c,sv?[{translate:'0 0'},{translate:'0 -'+lu+'px'},{translate:'0 0'}]:[{scale:'1',translate:'0 0'},{scale:'1.1',translate:'0 -4px'},{scale:'1',translate:'0 0'}],380,SPRING,p.d/mx*360)});
      ZK.burst(host,ox,oy,{n:stars===3?16:11,r:stars===3?80:56,colors:o.colors,ms:640});
      if(stars===3)setTimeout(function(){if(!dead)ZK.burst(host,ox,oy,{n:10,r:120,colors:o.colors,ms:700,size:.6})},140)}},rm?0:300);
  /* 3. the card with stars (lands 520 to 820 ms), Next tappable from 600 ms */
  box=document.createElement('div');box.className='zk-win';box.setAttribute('role','group');box.setAttribute('aria-label','Solved, '+stars+' of 3 stars');
  var row=document.createElement('div');row.className='zk-stars';var ss=[];
  for(var i=0;i<3;i++){var s=document.createElement('span');s.className='zk-star'+(i<stars?' on':'');s.innerHTML=STAR;s.style.opacity=rm?1:0;row.appendChild(s);ss.push(s)}
  box.appendChild(row);
  if(o.line){var ln=document.createElement('div');ln.textContent=o.line;box.appendChild(ln)}
  if(o.onNext){btn=document.createElement('button');btn.type='button';btn.className='zk-next zk-p';btn.textContent=o.nextLabel||'Next';btn.onclick=function(){if(dead)return;ZK.sfx('press');o.onNext()};box.appendChild(btn)}
  if(o.onMore){var mb=document.createElement('button');mb.type='button';mb.className='zk-more';mb.textContent=o.moreLabel||'Details';mb.onclick=function(){if(!dead)o.onMore()};box.appendChild(mb)}
  if(!rm){box.style.opacity=0}
  host.appendChild(box);
  if(!rm)ZK.anim(box,[{opacity:0,transform:'translateX(-50%) translateY(14px) scale(.96)'},{opacity:1,transform:'translateX(-50%)'}],220,SPRING,240,'forwards');
  ss.forEach(function(s,i){setTimeout(function(){if(dead)return;s.style.opacity=1;
      if(!rm)ZK.anim(s,[{transform:'scale(.3) rotate(-25deg)',opacity:0},{transform:'scale(1.25) rotate(6deg)',opacity:1,offset:.7},{transform:'scale(1)',opacity:1}],300,SPRING);
      if(i<stars){ZK.sfx('star',{i:i});ZK.buzz('star')}},rm?40+i*60:360+i*130)});
  setTimeout(function(){if(!dead&&btn&&ZK.kbd)try{btn.focus({preventScroll:true})}catch(e){}},rm?60:400);
  return{el:box,next:btn,close:function(){dead=true;if(box.parentNode)box.remove();host.classList.remove('zk-won')}}};

/* ---------- stuck: one policy for every puzzle (1.2.4) ----------
   ZK.stuck(host, on, {kind, text, cells, onUndo})
   kind 'rule'  a move that visibly breaks a stated rule: shown at once, the clashing cells or pieces (o.cells) are outlined, and the text
                names the rule (puzzles only use it when that is true).
   kind 'over'  the game is over by its own rules (no legal move left, out of stones): shown at once with Undo and Restart.
   kind 'dead'  (the default) a legal move into a position that can no longer be finished. Nothing shows at once. The kit remembers the move
                where it happened and shows "This can't be finished from here" (or the puzzle's own truthful text) with Undo (back to the
                last good position) and Restart only when (a) the player asks for a hint (the runner calls ZK.sess(..).reveal('hint')),
                (b) the player has made 3 or more moves past that point, or (c) 10 s pass without a touch while the position is lost.
   on=false says "not known lost now"; a 'dead' record clears when an Undo goes back past the losing move, on Restart, or when the
   puzzle has not said "lost" again within 1.5 s (the position changed and is fine).
   The chip never sits on the board or its controls: it goes in the reserved row under the board (.zk-slot: the puzzle page's status row,
   the Reel card's caption) or, without one, in a slot of its own after the board. Its Undo and Restart go through the runner (sess.ui),
   so the move counter, the Reel chip and the win card stay in step.
   The session (ZK.sess(el)): one per mounted board, made by ZK.override's mount wrapper. It counts the moves (api.moved, minus each Undo
   that undid something, 0 on Restart; or the puzzle's own ctrl.moves()), and holds the stuck state. The runner and the Reel set
   sess.ui = {count(n), undo(), restart(), hints()} to keep their own controls in step. */
var UNDO='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 7L4 12l5 5M4 12h10a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -4)"/></svg>';
var RESTART='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
ZK.DEAD_TEXT='This can’t be finished from here';
ZK.DEAD_MOVES=3;ZK.DEAD_IDLE=10000;ZK.DEAD_STALE=1500;
/* the kind for chips raised by puzzle files that pass none (kept here so those files need no change) */
ZK.KIND={'They linked across':'over','No seeds left':'over','Dead end':'over','Wrong start island':'rule'};   /* Bridge Walk: starting on an even island breaks the stated rule */
/* the move count for puzzles whose own count is in state() under another name */
ZK.MOVES={'dot-loop':function(s){return s.len},'code-cracker':function(s){return s.guesses}};
function sessOf(el){for(var e=el;e&&e!==document;e=e.parentNode)if(e.__zks)return e.__zks;return null}
ZK.sess=sessOf;
function mkSess(id,root){
  var s={id:id,root:root,n:0,ctrl:null,ui:null,dead:null,revealed:false,deadNow:false,staleT:0,idleT:0,chip:null,host:null,why:''};
  if(root)root.__zks=s;
  s.count=function(){var c=s.ctrl;try{if(c&&typeof c.moves==='function'){var m=c.moves();if(typeof m==='number'&&m>=0)return m}
      if(c&&c.state&&ZK.MOVES[id]){var m2=ZK.MOVES[id](c.state()||{});if(typeof m2==='number'&&m2>=0)return m2}}catch(e){}return s.n};
  s.sync=function(){if(s.ui&&s.ui.count)try{s.ui.count(s.count())}catch(e){}};
  s.lost=function(){return !!s.dead};
  s.clearDead=function(){clearTimeout(s.staleT);clearTimeout(s.idleT);var had=!!s.dead;s.dead=null;s.revealed=false;s.deadNow=false;if(s.chip&&s.chip.kind==='dead')hide(s)};
  s.armIdle=function(){clearTimeout(s.idleT);if(!s.dead||s.revealed)return;s.idleT=setTimeout(function(){if(s.dead&&!s.revealed&&(!s.root||s.root.isConnected))s.reveal('idle')},ZK.DEAD_IDLE)};
  s.reveal=function(why){if(!s.dead)return false;s.revealed=true;s.why=why||'';clearTimeout(s.idleT);show(s,'dead',s.dead.o,why);return true};
  /* the canonical Undo and Restart (the runner wraps them to count undos and reset hints) */
  s.undo=function(){var c=s.ctrl;if(!c||!c.undo)return false;var n0=s.n,d0=s.dead,r;s.n=Math.max(0,s.n-1);if(s.dead&&s.n<s.dead.n0)s.clearDead();
    try{r=c.undo()}catch(e){r=false}
    if(r===false){s.n=n0;if(d0&&!s.dead){s.dead=d0;s.deadNow=true}return false}
    if(s.chip&&s.chip.kind!=='dead')hide(s);setTimeout(s.sync,0);s.sync();return true};
  s.restart=function(){var c=s.ctrl;try{c&&c.restart&&c.restart()}catch(e){}s.n=0;s.clearDead();hide(s);setTimeout(s.sync,0);s.sync()};
  s.doUndo=function(){return s.ui&&s.ui.undo?s.ui.undo():s.undo()};
  s.doRestart=function(){if(s.ui&&s.ui.restart)s.ui.restart();else s.restart()};
  s.moved=function(){s.n++;try{if(s.ui&&s.ui.moved)s.ui.moved()}catch(e){}s.sync();setTimeout(s.sync,0);setTimeout(s.sync,500);if(s.dead)s.armIdle()};
  if(root)root.addEventListener('pointerdown',function(){if(s.dead)s.armIdle()},true);
  if(root)root.addEventListener('pointerup',function(){setTimeout(s.sync,0)},true);   /* changes a puzzle makes on its own (a tap back along the wire) */
  return s}
ZK.mkSess=mkSess;
/* where the chip goes: the page's reserved row, the Reel card's caption slot, or a slot of its own right after the board */
function slotFor(host){var sec=host.closest&&host.closest('.pz5'),z;
  if(sec&&(z=sec.querySelector('.zk-status .zk-slot')))return z;
  var card=host.closest&&host.closest('.rl6c');if(card&&(z=card.querySelector('.rchipslot')))return z;
  var nx=host.nextElementSibling;if(nx&&nx.classList&&nx.classList.contains('zk-slot'))return nx;
  z=document.createElement('div');z.className='zk-slot zk-flow';if(host.parentNode)host.parentNode.insertBefore(z,host.nextSibling);return z}
function hide(s){var c=s.chip;s.chip=null;if(!c)return;if(c.el.parentNode)c.el.remove();
  if(c.cells)c.cells.forEach(function(e){if(e&&e.classList)e.classList.remove('zk-clash')});
  if(c.host)c.host.classList.remove('zk-stuck');var st=c.slot&&c.slot.closest&&c.slot.closest('.zk-status');if(st)st.classList.remove('zk-haschip');
  var card=c.slot&&c.slot.closest&&c.slot.closest('.rl6c');if(card)card.classList.remove('zk-chip')}
function show(s,kind,o,why){o=o||{};var host=s.host;if(!host)return;
  var text=o.text||(kind==='dead'?ZK.DEAD_TEXT:'No moves left');
  if(kind==='dead'&&why==='hint')text='A recent move went wrong. It can’t be finished.';
  if(s.chip&&s.chip.kind===kind&&s.chip.text===text)return;
  var fresh=!s.chip;hide(s);
  var slot=slotFor(host),c=document.createElement('div');c.className='zk-stuckchip';c.setAttribute('role','status');c.setAttribute('data-kind',kind);
  var t=document.createElement('span');t.textContent=text;c.appendChild(t);
  var k=kind==='dead'&&s.dead?Math.max(1,s.n-s.dead.n0+1):1;
  var b=document.createElement('button');b.type='button';b.className='zk-p zk-un';b.innerHTML=UNDO+'<span>Undo'+(k>1?' '+k:'')+'</span>';
  b.setAttribute('aria-label',k>1?'Undo '+k+' moves, back to the last good position':'Undo');
  b.onclick=function(){var n=k;if(kind==='dead'&&s.dead)n=Math.max(1,s.n-s.dead.n0+1);for(var i=0;i<n;i++)if(s.doUndo()===false)break;ZK.sfx('undo')};c.appendChild(b);
  if(kind!=='rule'){var r=document.createElement('button');r.type='button';r.className='zk-p zk-rs';r.innerHTML=RESTART;r.setAttribute('aria-label','Restart');r.onclick=function(){s.doRestart()};c.appendChild(r)}
  slot.appendChild(c);var cells=[].concat(o.cells||[]).filter(Boolean);cells.forEach(function(e){if(e.classList)e.classList.add('zk-clash')});
  s.chip={el:c,kind:kind,text:text,host:host,slot:slot,cells:cells};
  if(kind!=='rule')host.classList.add('zk-host','zk-stuck');
  var st=slot.closest&&slot.closest('.zk-status');if(st)st.classList.add('zk-haschip');var card=slot.closest&&slot.closest('.rl6c');if(card)card.classList.add('zk-chip');
  if(fresh){ZK.anim(c,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],260,SPRING);ZK.sfx('soft');ZK.buzz('soft')}
  try{if(s.ui&&s.ui.say)s.ui.say(text)}catch(e){}}
ZK.stuck=function(host,on,o){o=o||{};if(!host)return;var s=sessOf(host);if(!s){s=host.__zks||(host.__zks=mkSess('',null))}s.host=host;
  if(!on){s.deadNow=false;if(s.chip&&s.chip.kind!=='dead')hide(s);
    if(s.dead){clearTimeout(s.staleT);s.staleT=setTimeout(function(){if(!s.deadNow)s.clearDead()},ZK.DEAD_STALE)}
    return}
  var kind=o.kind||ZK.KIND[o.text]||'dead';
  if(kind!=='dead'){if(s.dead)s.clearDead();show(s,kind,o);return}
  s.deadNow=true;clearTimeout(s.staleT);
  if(!s.dead){s.dead={n0:s.n,o:o};s.armIdle()}else s.dead.o=o;
  if(s.revealed)show(s,'dead',o,s.why);
  else if(s.n-s.dead.n0>=ZK.DEAD_MOVES)s.reveal('moves')};

/* ---------- idle: the soft stuck hook (glows the runner's Hint button by default) ---------- */
ZK.idle=function(host,ms,fn){var t=null,dead=false;fn=fn||function(){var h=document.querySelector('.pz5 [data-hint],#hi');if(h){h.classList.remove('zk-hintglow');void h.offsetWidth;h.classList.add('zk-hintglow')}};
  function poke(){if(dead)return;clearTimeout(t);t=setTimeout(function(){if(!dead&&host.isConnected)fn()},ms)}
  host.addEventListener('pointerdown',poke,true);poke();
  return{poke:poke,stop:function(){dead=true;clearTimeout(t);host.removeEventListener('pointerdown',poke,true)}}};

/* ---------- progress on the board ---------- */
/* a count with an icon: set(n) rolls the number and pops the pill; reaching 0 turns it 'done' */
ZK.counter=function(o){o=o||{};var el=document.createElement('div'),num=document.createElement('span'),cur=null;el.className='zk-ctr';el.setAttribute('role','img');
  el.innerHTML=o.icon||'';num.className='zk-num';el.appendChild(num);
  function set(n,quiet){var prev=cur;cur=n;num.textContent=String(n);el.setAttribute('aria-label',(o.label?o.label(n):String(n)));el.classList.toggle('zk-zero',n===0&&o.zero!==false);
    if(prev!==null&&prev!==n&&!quiet){var up=n>prev;ZK.anim(num,[{transform:'translateY('+(up?8:-8)+'px)',opacity:0},{transform:'none',opacity:1}],200,EASE);ZK.anim(el,[{scale:'1'},{scale:'1.12'},{scale:'1'}],240,SPRING)}}
  return{el:el,set:set,get:function(){return cur}}};
/* par pips: par hollow dots that fill per move; moves past par add small grey dots */
ZK.pips=function(par){var el=document.createElement('div');el.className='zk-pips';el.setAttribute('aria-hidden','true');var used=0;
  function set(n){var prev=used;used=n;el.textContent='';for(var i=0;i<Math.max(par,n);i++){var d=document.createElement('i');if(i<par&&i<n)d.className='on';else if(i>=par)d.className='over';el.appendChild(d)}
    if(n>prev&&n<=Math.max(par,n)){var last=el.children[n-1];if(last)ZK.anim(last,[{transform:'scale(1.8)'},{transform:'scale(1)'}],260,SPRING)}}
  set(0);return{el:el,set:set}};

/* ---------- a board-level hint marker (pulsing dashed outline) ---------- */
ZK.mark=function(els){[].concat(els||[]).forEach(function(e){if(e)e.classList.add('zk-mark')})};
ZK.unmark=function(root){[].forEach.call((root||document).querySelectorAll('.zk-mark'),function(e){e.classList.remove('zk-mark')})};

/* ---------- a fallback toolbar for hosts that do not draw one (api.toolbar !== false) ---------- */
ZK.bar=function(host,c){var b=document.createElement('div');b.style.cssText='display:flex;gap:8px;justify-content:center;margin-top:12px';var lv=0;
  [['Undo',function(){c.undo()}],['Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)}],['Restart',function(){lv=0;c.restart()}]].forEach(function(x){var e=document.createElement('button');e.type='button';e.textContent=x[0];e.className='zk-p';
    e.style.cssText='min-width:72px;min-height:48px;border-radius:24px;border:0;background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);font:700 1rem var(--font);color:var(--ink)';e.onclick=x[1];b.appendChild(e)});
  host.appendChild(b);return b};

/* ---------- override registry: v6 puzzles replace the original registerPuzzle entries; the originals are kept for the gallery ---------- */
ZK.orig={};ZK.list=[];
/* the mount wrapper makes the session: it sees every counted move (api.moved) and the result (api.done: the hint count the runner kept,
   so a Restart gives a clean replay its stars back), and keeps the stuck state of this board */
function wrapMount(def){var m0=def.mount;if(!m0||m0.__zk)return;
  var m1=function(root,inst,api){api=api||{};var s=mkSess(def.id,root),a={};for(var k in api)a[k]=api[k];
    a.moved=function(){var r=api.moved?api.moved.apply(api,arguments):undefined;s.moved();return r};
    a.done=function(res){res=res||{};try{if(s.ui&&s.ui.hints)res.hints=s.ui.hints()}catch(e){}s.clearDead();hide(s);return api.done?api.done.call(api,res):undefined};
    var c=m0.call(this,root,inst,a);s.ctrl=c;return c};
  m1.__zk=1;def.mount=m1}
ZK.override=function(def){if(typeof PUZZLES==='undefined')return;wrapMount(def);if(PUZZLES[def.id]&&!PUZZLES[def.id].v6)ZK.orig[def.id]=PUZZLES[def.id];def.v6=true;if(ZK.list.indexOf(def.id)<0)ZK.list.push(def.id);registerPuzzle(def);return def};
})();
