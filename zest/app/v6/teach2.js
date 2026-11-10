/* teach2 (prototype, 7 Nov 2026; design and research in Docs/v6/teach2.md). One teaching system for every puzzle, on the puzzle page and in the Reel.
   Loaded after teach.js, teach6.js and reel6.js. A puzzle takes part by supplying ZT.DEMO[id] (teach2-data.js); puzzles without it keep today's teaching.

   What it adds, for a puzzle with a demo:
   1. "Show me": a 3-6 s scripted demo on a tiny board of its own (never the real board, so it never gives the level away). It is the puzzle's
      real code driven by a script: the ghost hand presses, and the real consequence happens (squares fill, a gear meshes and the dial turns, the clue
      pips appear, the stones come off). One caption line. It plays by itself the first time a player meets the puzzle (level 1 or a Reel card),
      once per puzzle, and any touch skips it. It can be replayed from the Rules sheet (where it leads the sheet) and from the hint ladder.
   2. Level 1, first time: a guided first move or two on the real board: the target is lit, the rest dimmed, one line says what to do. Nothing is
      locked (any touch goes through); after the guided steps, or two touches elsewhere, it lets go.
   3. The hint ladder gains a free first rung: the rule in one line plus a "Show me" chip. Later rungs are the puzzle's own (highlight, then the move).
   4. Confusion watch: no touch for 12 s before the first move, 3 refused moves within 25 s, or 6 touches in 8 s with no move. It offers
      "Show me" once per board and once per puzzle per session, in the hint row, and never if the demo was just watched.
   The old level-1 ghost hand and the 4 s nudge are switched off for these puzzles (the guided move replaces them).
   ?off (or ?teach2=off) turns all of this off, to compare with the teaching as shipped.

   ZT.DEMO[id] = {
     line:  'the rule in one line (9 words or so)',          caption of the demo, the hint's first rung
     end:   'the goal, shown when the demo ends' (optional; defaults to line),
     inst:  function(){ return a tiny instance for p.mount }, (or level: n to use p.make(n))
     steps: [ step, ... ]   the demo script, 3-6 s in all
     guide: function(root, inst, k){ return step k of the level-1 guided start on the real board, or null }   (optional)
     flail: false           (optional) for puzzles where taps without a counted move are normal (Code Cracker counts a move on Check)
   }
   step = {tap: T} | {drag: [T, T], ms} | {wait: ms} | {mark: T} | {do: function(root, inst, ctrl)} plus optional say:'caption from this step on', hold: ms after it.
   Steps run one after another (each starts when the previous one ends). {do} runs code on the demo board (e.g. ctrl.undo()), then waits hold (500 ms).
   T (a target) = a CSS selector inside the demo board, a function(root, inst) returning an element or a {x, y} point in viewport pixels. */
(function(){
if(!window.ZT||!window.ZK)return;
var D=ZT.DEMO=ZT.DEMO||{};
var OFF=/[?&](off|teach2=off)\b/.test(location.search);
ZT.T2={on:!OFF};
/* the Reel's Show me style: 'strip' (above the board, the board stays live; decision 2) or 'full' (over the board, the 7 Nov prototype). ?reelfull compares. */
ZT.REEL=/[?&]reelfull\b/.test(location.search)?'full':'strip';
/* the puzzle page uses the same strip (8 Nov: the 3-judge test failed the full card on level 1, as it hid the real board); ?pagefull compares */
ZT.PAGE=/[?&]pagefull\b/.test(location.search)?'full':'strip';
if(OFF)return;
function has(id){return !!(id&&D[id])}
/* a puzzle whose levels ask different things (Living Stones: capture or save) gives by(inst) -> a key into alt; the variant's fields override the base */
function pick(id,inst){var d=D[id];if(!d||!d.by||!d.alt||!inst)return d;var k=null;try{k=d.by(inst)}catch(e){}var v=k&&d.alt[k];if(!v)return d;var o={};for(var x in d)o[x]=d[x];for(x in v)o[x]=v[x];return o}
ZT.pickDemo=pick;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function TS(){try{var v=S();if(!v.teach||typeof v.teach!=='object')v.teach={};if(!v.teach.demo)v.teach.demo={};return v.teach}catch(e){return {demo:{}}}}
function seen(id){return !!TS().demo[id]}
function markSeen(id){var t=TS();if(!t.demo[id]){t.demo[id]=1;try{save()}catch(e){}}}
function log(n){try{ev(n)}catch(e){}}
function rmOn(){try{return ZK.rm()}catch(e){return false}}

var CSS=''
+'.zt2-ov{position:absolute;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:12px 12px 10px;box-sizing:border-box;border-radius:22px;background:var(--bg,#F7F4EE);box-shadow:0 0 0 1.5px var(--line,#E2DBD0),0 18px 40px -18px rgba(0,0,0,.45);overflow:hidden}'
+'.zt2-ov .zt2-tag{position:absolute;left:14px;top:10px;font:800 .6875rem/1 var(--font,system-ui);letter-spacing:.08em;text-transform:uppercase;color:var(--accent,#E8590C)}'
+'.zt2-ov .zt2-skip{position:absolute;right:6px;top:2px;min-width:48px;min-height:40px;border:0;background:transparent;color:var(--muted,#6F675E);font:700 .875rem var(--font,system-ui);cursor:pointer}'
+'.zt2-in{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%}'
+'.zt2-box{position:relative;width:100%;flex:1 1 auto;display:flex;align-items:flex-start;justify-content:center;overflow:hidden;min-height:120px}'
+'.zt2-host{position:relative;width:300px;flex:none;transform-origin:50% 0}'
+'.zt2-shield{position:absolute;inset:0;z-index:7}'
+'.zt2-host .zk-slot{display:none}.zt2-dslot{display:flex;justify-content:center;padding:4px 0 0}.zt2-dslot:empty{display:none}.zt2-dslot .zk-stuckchip{pointer-events:none}'
+'.zt2-cap{min-height:2.7em;max-width:30ch;text-align:center;font:700 1rem/1.35 var(--font,system-ui);color:var(--ink,#1B1916);text-wrap:balance}'
+'.zt2-btns{display:flex;gap:10px;justify-content:center;min-height:48px}'
+'.zt2-btns button{min-height:48px;min-width:96px;padding:0 18px;border-radius:24px;font:750 .9375rem var(--font,system-ui);cursor:pointer;border:0}'
+'.zt2-btns .zt2-go{background:var(--accent,#E8590C);color:var(--on-accent,#fff)}.zt2-btns .zt2-re{background:transparent;color:var(--ink,#1B1916);box-shadow:inset 0 0 0 2px var(--line,#D9D0C2)}'
+'.zt2-hand{position:absolute;left:0;top:0;width:46px;height:54px;margin:-4px 0 0 -14px;pointer-events:none;z-index:9;opacity:0;filter:drop-shadow(0 3px 6px rgba(0,0,0,.28))}'
+'.zt2-ring{position:absolute;left:0;top:0;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:3px solid var(--accent,#E8590C);pointer-events:none;z-index:8;opacity:0}'
/* the guided first move: a lit ring on the target, the rest dimmed by its shadow; never takes a touch */
+'.zt2-spot{position:absolute;z-index:30;pointer-events:none;border-radius:18px;box-shadow:0 0 0 3px var(--accent,#E8590C),0 0 0 9999px rgba(20,17,14,.38);transition:all .25s cubic-bezier(.2,.8,.2,1)}'
+'.zt2-spot.soft{box-shadow:0 0 0 3px var(--accent,#E8590C),0 0 0 7px rgba(232,89,12,.25)}.zt2-spot.soft.pulse{animation:zt2-pulse2 1.3s ease-in-out infinite}@keyframes zt2-pulse2{50%{box-shadow:0 0 0 6px var(--accent,#E8590C),0 0 0 12px rgba(232,89,12,.2)}}'
+'.zt2-spot.pulse:not(.soft){animation:zt2-pulse 1.3s ease-in-out infinite}@keyframes zt2-pulse{0%,100%{box-shadow:0 0 0 3px var(--accent,#E8590C),0 0 0 9999px rgba(20,17,14,.38)}50%{box-shadow:0 0 0 7px var(--accent,#E8590C),0 0 0 9999px rgba(20,17,14,.38)}}'
+'.zt2-say{position:absolute;z-index:31;pointer-events:none;max-width:250px;padding:8px 12px;border-radius:12px;background:var(--ink,#1B1916);color:var(--bg,#F7F4EE);font:700 .875rem/1.3 var(--font,system-ui);text-align:center;box-shadow:0 8px 20px -8px rgba(0,0,0,.5);transform:translateX(-50%)}'
+'.zt2-path{position:absolute;inset:0;z-index:31;pointer-events:none;overflow:visible}.zt2-path path{fill:none;stroke:var(--accent,#E8590C);stroke-width:4;stroke-linecap:round;stroke-dasharray:2 9;animation:zt2-dash .9s linear infinite}'
+'@keyframes zt2-dash{to{stroke-dashoffset:-22}}'
+'.zt2-chip{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;margin:6px auto 0;border-radius:20px;border:0;background:var(--accent,#E8590C);color:var(--on-accent,#fff);font:750 .875rem var(--font,system-ui);cursor:pointer}'
+'.zt2-chiprow{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;font:600 .875rem var(--font,system-ui);color:var(--muted,#6F675E)}'
+'.rl6c .zt2-chiprow{justify-content:flex-start;color:#D6CCBF}'
+'.zt2-sheetdemo{position:relative;border-radius:18px;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--line,#E2DBD0);padding:10px 8px;height:min(46vh,330px);display:flex}'
/* the Reel's Show me (decision 2, 8 Nov): a strip above the board, so the real board stays visible and tappable while the demo plays */
+'.zt2-strip{position:relative;flex:none;z-index:4;height:clamp(96px,calc(27svh - 40px),210px);margin:2px 0 6px;display:flex;gap:10px;padding:8px 8px 8px 8px;box-sizing:border-box;border-radius:18px;background:var(--bg,#F7F4EE);color:var(--ink,#1B1916);box-shadow:0 0 0 1.5px var(--line,#E2DBD0),0 10px 24px -14px rgba(0,0,0,.6);overflow:hidden;animation:zt2-in .22s ease-out}'
+'@keyframes zt2-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}'
+'.zt2-strip .zt2-box{flex:0 0 54%;min-height:0;height:100%;border-radius:12px;background:var(--surface,#fff);align-items:center}'
+'.zt2-strip .zt2-side{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px;padding:2px 0 0}'
+'.zt2-strip .zt2-tag{font:800 .6875rem/1 var(--font,system-ui);letter-spacing:.08em;text-transform:uppercase;color:var(--accent,#E8590C);padding-top:6px}'
+'.zt2-strip .zt2-skip{position:absolute;right:0;top:0;min-width:56px;min-height:40px;border:0;background:transparent;color:var(--muted,#6F675E);font:700 .8125rem var(--font,system-ui);cursor:pointer}'
+'.zt2-strip .zt2-cap{min-height:0;max-width:none;text-align:left;font:700 .9375rem/1.3 var(--font,system-ui);margin:2px 0 0;flex:1 1 auto;overflow:hidden}'
+'.zt2-strip .zt2-btns{justify-content:flex-start;min-height:0}.zt2-strip .zt2-btns button{min-height:40px;min-width:0;padding:0 14px;font-size:.8125rem}'
+'.zt2-strip.zt2-paused .zt2-box{opacity:.4}.pz5 .zt2-strip{height:clamp(96px,calc(21svh - 16px),170px);margin:0 0 6px}'
+'.zt2-strip.zt2-tall{flex-direction:column;gap:4px;height:clamp(150px,calc(38svh - 56px),280px)}.pz5 .zt2-strip.zt2-tall{height:clamp(150px,calc(34svh - 40px),260px)}'
+'.zt2-strip.zt2-xtall{height:clamp(150px,calc(44svh - 70px),330px)}.pz5 .zt2-strip.zt2-xtall{height:clamp(150px,calc(36svh - 56px),270px)}'
+'.zt2-strip.zt2-tall .zt2-box{flex:1 1 auto;width:100%;height:auto;min-height:0}'
+'.zt2-strip.zt2-tall .zt2-side{flex:none;flex-direction:row;align-items:center;gap:8px;padding:0 2px}.zt2-strip.zt2-tall .zt2-tag{display:none}'
+'.zt2-strip.zt2-tall .zt2-cap{margin:0;flex:1 1 auto;font-size:.875rem;line-height:1.25;max-height:2.6em}'
+'.zt2-strip.zt2-tall .zt2-skip{top:4px;right:4px;min-height:32px;border-radius:12px;background:var(--bg,#F7F4EE);z-index:8}'
+'@media (max-width:340px),(max-height:640px){.zt2-strip .zt2-cap{font-size:.8125rem;line-height:1.25}.zt2-strip .zt2-tag{padding-top:4px}}'
/* a hint or demo mark on an SVG shape: a CSS outline inside a scaled viewBox draws huge rectangles, so SVG marks are a screen-sized stroke instead */
+'svg .zk-mark,svg .zk-mark *{outline:none!important;animation:none!important;stroke:var(--accent,#E8590C)!important;stroke-width:3px!important;vector-effect:non-scaling-stroke;stroke-dasharray:6 4}'
+'@media (prefers-reduced-motion:reduce){.zt2-strip{animation:none}}.rm .zt2-strip{animation:none}'
+'@media (prefers-reduced-motion:reduce){.zt2-spot.pulse,.zt2-spot.soft.pulse,.zt2-path path{animation:none!important}}.rm .zt2-spot.pulse,.rm .zt2-path path{animation:none!important}';
function css(){if(document.getElementById('zt2-css'))return;var s=document.createElement('style');s.id='zt2-css';s.textContent=CSS;document.head.appendChild(s)}
try{css()}catch(e){}

/* ---------------- the player: the puzzle's own mount on a tiny board, driven by a script ---------------- */
function target(T,root,inst){try{if(typeof T==='function')T=T(root,inst);if(typeof T==='string')T=root.querySelector(T);}catch(e){return null}
  if(!T)return null;if(T.getBoundingClientRect){var r=T.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,el:T}}return T}
var PID=7700;
/* the demo board sits under a shield (a touch on it is the player's, never the board's); the script lifts the shield for each event it sends */
function fire(type,x,y,id,shield){if(shield)shield.style.pointerEvents='none';var el=document.elementFromPoint(x,y);if(!el){if(shield)shield.style.pointerEvents='';return null}var o={bubbles:true,cancelable:true,composed:true,clientX:x,clientY:y,screenX:x,screenY:y,pointerId:id,pointerType:'touch',isPrimary:true,button:0,buttons:type==='pointerup'||type==='click'?0:1,width:20,height:20,pressure:type==='pointerup'?0:.5};
  try{el.dispatchEvent(type==='click'?new MouseEvent('click',o):new PointerEvent(type,o))}catch(e){}if(shield)shield.style.pointerEvents='';return el}   /* puzzles hit-test during the event (elementFromPoint), so the shield stays lifted until it is handled */
/* ZT.play(box, id, o): mounts the demo in box (an element that is laid out), plays it once. o: {cap(el) caption element, onEnd()}. Returns {stop(), replay()} */
var SLOW=(function(){var m=/[?&]demospeed=([0-9.]+)/.exec(location.search);return m?1/Math.max(.25,+m[1]):1.4})();   /* owner 8 Nov: demos felt too fast; 1.4x slower (?demospeed=1 restores) */
ZT.play=function(box,id,o){o=o||{};css();var d=pick(id,o.inst),p=typeof P==='function'?P(id):(window.PUZZLES||{})[id];if(!d||!p)return null;
  var host=document.createElement('div');host.className='zt2-host';host.setAttribute('aria-hidden','true');box.appendChild(host);var shield=document.createElement('div');shield.className='zt2-shield';box.appendChild(shield);
  var hand=document.createElement('div');hand.className='zt2-hand';hand.innerHTML=ZK.HAND||'';var ring=document.createElement('div');ring.className='zt2-ring';
  box.appendChild(hand);box.appendChild(ring);
  var ctrl=null,inst=null,tm=[],dead=false,run=0,rm=rmOn(),sfx=ZK.sfx,buzz=ZK.buzz;
  function T(fn,ms){var r=run;tm.push(setTimeout(function(){if(!dead&&r===run)fn()},ms*SLOW))}
  function rel(pt){var b=box.getBoundingClientRect();return {x:pt.x-b.left,y:pt.y-b.top}}
  function at(pt,op,sc){var q=rel(pt);hand.style.transform='translate('+q.x+'px,'+q.y+'px) scale('+(sc||1)+')';hand.style.opacity=op==null?1:op}
  function glide(a,b,ms){if(rm||!hand.animate){at(b);return}var qa=rel(a),qb=rel(b);try{hand.animate([{transform:'translate('+qa.x+'px,'+qa.y+'px) scale(.92)'},{transform:'translate('+qb.x+'px,'+qb.y+'px) scale(.92)'}],{duration:ms*SLOW,easing:'cubic-bezier(.45,0,.3,1)',fill:'forwards'})}catch(e){}at(b,1,.92)}
  function pulse(pt){var q=rel(pt);ring.style.left=q.x+'px';ring.style.top=q.y+'px';if(rm||!ring.animate){ring.style.opacity=.8;T(function(){ring.style.opacity=0},400);return}
    try{ring.animate([{transform:'scale(.4)',opacity:.9},{transform:'scale(1.3)',opacity:0}],{duration:520*SLOW,easing:'ease-out'})}catch(e){}}
  function say(t){if(o.cap&&t!=null)o.cap.textContent=t}
  /* 8 Nov: fit what the board draws, not the 300 px host: a narrow board (Seed Pits' two columns) used to sit tiny in the middle of empty width.
     The width is the box of the visible elements; a full-width element counts only if it paints something (as the Reel's own fit does). */
  function painted(e){var c=getComputedStyle(e);return /svg|img|canvas/i.test(e.tagName)||c.backgroundImage!=='none'||c.boxShadow!=='none'||parseFloat(c.borderLeftWidth)>0||!/rgba\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor)}
  function fit(){var bw=box.clientWidth,bh=box.clientHeight;host.style.transform='none';host.style.margin='0';var w=host.offsetWidth||300,h=host.scrollHeight||300,hr=host.getBoundingClientRect(),l=1e9,r=-1e9;
    [].forEach.call(host.querySelectorAll('*'),function(e){if(e.closest('.zt2-dslot'))return;var b=e.getBoundingClientRect();if(b.width<2||b.height<2)return;if(b.width>=hr.width-1&&!painted(e))return;l=Math.min(l,b.left);r=Math.max(r,b.right)});
    var cw=r>l?Math.min(w,r-l+8):w,cx=r>l?(l+r)/2-(hr.left+hr.width/2):0;host.__t2cw=cw;host.__t2h=h;
    var s=Math.min(bw/cw,bh/h,1.25);if(!(s>0))s=1;host.style.transform='translateX('+(-cx*s).toFixed(1)+'px) scale('+s+')';host.style.marginBottom=(h*s-h)+'px';host.style.marginTop='0';host.style.marginLeft=host.style.marginRight=((cw*s-w)/2)+'px'}
  function mount(){if(ctrl)try{ctrl.destroy&&ctrl.destroy()}catch(e){}host.textContent='';
    try{inst=d.inst?d.inst(p):p.make(d.level||1,pzRng(1));if(inst&&typeof inst==='object')inst.toolbar=false;
      ctrl=p.mount(host,inst,{rm:rm,zen:true,toolbar:false,relaxed:false,demo:true,now:function(){return 0},say:function(){},moved:function(){},done:function(){}})}catch(e){console.error('teach2 demo',id,e);ctrl=null}
    [].forEach.call(host.querySelectorAll('.zk-hand'),function(e){e.remove()});keepChips();fit();if(o.onMount)try{o.onMount(host,d)}catch(e){}T(fit,120)}
  /* 8 Nov fix: a stuck or rule chip raised inside the demo went to the page's own chip row (the kit puts chips in the section's status row, and a demo
     board with no session of its own even borrowed the real board's session). The demo board gets its own session, and its chip is kept in a row
     inside the demo. */
  function keepChips(){try{var ss=host.__zks;if(!ss&&ZK.mkSess)ss=ZK.mkSess(id,host);if(!ss||ss.__t2keep)return;ss.__t2keep=1;var cur=ss.chip;
    Object.defineProperty(ss,'chip',{configurable:true,get:function(){return cur},set:function(v){cur=v;if(!v||!v.el||host.contains(v.el))return;var out=v.slot;
      var row=host.querySelector(':scope>.zt2-dslot');if(!row){row=document.createElement('div');row.className='zt2-dslot';host.appendChild(row)}row.appendChild(v.el);v.slot=row;
      setTimeout(function(){try{var st=out&&out.closest&&out.closest('.zk-status');if(st&&!st.querySelector('.zk-stuckchip'))st.classList.remove('zk-haschip');
        var cd=out&&out.closest&&out.closest('.rl6c');if(cd&&!cd.querySelector('.rchipslot .zk-stuckchip'))cd.classList.remove('zk-chip');
        if(out&&out.classList&&out.classList.contains('zk-flow')&&!out.firstChild&&!host.contains(out))out.remove()}catch(e){}},0)}})}catch(e){}}
  function mute(on){if(on){ZK.sfx=function(){};ZK.buzz=function(){}}else{ZK.sfx=sfx;ZK.buzz=buzz}}
  /* the script runs as a chain (8 Nov fix): each step starts only when the previous one has ended, timed from when that step really ran, so a late
     timer can never make two drags overlap. All times are design times; T() applies SLOW. */
  function play(){run++;dead=false;tm.forEach(clearTimeout);tm=[];mount();say(d.line);hand.style.opacity=0;var last={x:box.getBoundingClientRect().left+box.clientWidth/2,y:box.getBoundingClientRect().bottom};
    var steps=d.steps||[];
    function end(){if(!rm&&hand.animate)try{hand.animate([{opacity:1},{opacity:0}],{duration:240,fill:'forwards'})}catch(e){}hand.style.opacity=0;say(d.end||d.line);if(o.onEnd)o.onEnd()}
    function step(i){if(i>=steps.length){T(end,200);return}var s=steps[i],next=function(ms){T(function(){step(i+1)},ms)};
      if(s.say!=null&&!s.tap&&!s.drag&&!s.mark)say(s.say);
      if(s.wait){next(s.wait);return}
      if(s.do){try{s.do(host,inst,ctrl)}catch(e){console.error('teach2 demo step',id,e)}next(s.hold==null?500:s.hold);return}
      if(s.mark){var am=target(s.mark,host,inst);if(s.say!=null)say(s.say);if(am&&am.el)ZK.mark(am.el);next(s.hold||700);return}
      if(s.tap){var a=target(s.tap,host,inst);if(!a){next(0);return}if(s.say!=null)say(s.say);if(rm)at(a);else glide(last,a,360);last=a;
        T(function(){var a2=target(s.tap,host,inst)||a;mute(true);var id2=++PID;fire('pointerdown',a2.x,a2.y,id2,shield);fire('pointerup',a2.x,a2.y,id2,shield);fire('click',a2.x,a2.y,id2,shield);mute(false);pulse(a2);at(a2,1,.88);
          T(function(){at(a2,1,1)},rm?120:140);next((rm?140:160)+(s.hold==null?160:s.hold))},rm?120:380);return}
      if(s.drag){var ms=s.ms||(rm?300:760),N=14,a0=target(s.drag[0],host,inst);if(!a0){next(0);return}if(s.say!=null)say(s.say);if(rm)at(a0);else glide(last,a0,360);last=a0;
        T(function(){var a=target(s.drag[0],host,inst)||a0,b=target(s.drag[1],host,inst);if(!b){next(0);return}var id2=++PID;mute(true);fire('pointerdown',a.x,a.y,id2,shield);mute(false);pulse(a);at(a,1,.9);
          for(var k=1;k<=N;k++)(function(k){T(function(){var x=a.x+(b.x-a.x)*k/N,y=a.y+(b.y-a.y)*k/N;mute(true);fire('pointermove',x,y,id2,shield);mute(false);at({x:x,y:y},1,.9);last={x:x,y:y}},ms*k/N)})(k);
          /* the release, and only then the next step: chained, so it follows the last move even when timers run late */
          T(function(){mute(true);fire('pointerup',b.x,b.y,id2,shield);mute(false);at(b,1,1);next(40+(s.hold==null?260:s.hold))},ms+40)},rm?120:380);return}
      next(0)}
    T(function(){step(0)},rm?250:450);
    /* the planned length (design time x SLOW), for callers that want it */
    var t=rm?250:450;steps.forEach(function(s){if(s.wait)t+=s.wait;else if(s.do)t+=s.hold==null?500:s.hold;else if(s.mark)t+=s.hold||700;else if(s.tap)t+=(rm?260:540)+(s.hold==null?160:s.hold);else if(s.drag)t+=(rm?120:380)+(s.ms||(rm?300:760))+80+(s.hold==null?260:s.hold)});
    return (t+200)*SLOW}
  window.addEventListener('resize',fit);
  var api={stop:function(){dead=true;run++;tm.forEach(clearTimeout);window.removeEventListener('resize',fit);mute(false);try{ctrl&&ctrl.destroy&&ctrl.destroy()}catch(e){}host.remove();shield.remove();hand.remove();ring.remove()},
    replay:function(){return play()},length:0};
  api.length=play();return api};

/* ---------------- the Show me card: over the board (page) or the card's board area (Reel) ---------------- */
var OPEN=null;
/* area: the element whose box the card covers; parent: where it goes (positioned). o: {auto, onClose(how)} */
ZT.showMe=function(id,area,o){o=o||{};if(!has(id)||!area||!area.isConnected)return null;css();if(OPEN)OPEN.close('replaced');if(o.strip)return strip(id,area,o);
  var par=o.parent||area.offsetParent||area.parentNode;if(getComputedStyle(par).position==='static')par.style.position='relative';
  var pr=par.getBoundingClientRect(),ar=area.getBoundingClientRect(),W=Math.max(300,Math.min(ar.width,440)),H=Math.max(330,Math.min(ar.height+(o.extra||0),560));
  var left=ar.left-pr.left+par.scrollLeft+(ar.width-W)/2,top=ar.top-pr.top+par.scrollTop+Math.min(0,(ar.height-H)/2);
  left=Math.max(8-pr.left,Math.min(left,document.documentElement.clientWidth-pr.left-W-8));
  var ov=document.createElement('div');ov.className='zt2-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Show me: how to play '+((P(id)||{}).name||''));ov.setAttribute('data-showme',id);
  ov.style.cssText+='left:'+left+'px;top:'+top+'px;width:'+W+'px;height:'+H+'px';
  ov.innerHTML='<span class="zt2-tag">Show me</span><button class="zt2-skip" type="button" data-skip>Skip</button><div class="zt2-box" aria-hidden="true"></div><p class="zt2-cap" aria-live="polite"></p><div class="zt2-btns"></div>';
  par.appendChild(ov);var box=ov.querySelector('.zt2-box'),cap=ov.querySelector('.zt2-cap'),btns=ov.querySelector('.zt2-btns'),closeT=0,done=false,pl=null;
  function close(how){if(done)return;done=true;clearTimeout(closeT);if(pl)pl.stop();ov.remove();if(OPEN&&OPEN.el===ov)OPEN=null;markSeen(id);log('t2_demo_'+(how||'close'));if(o.onClose)o.onClose(how||'close')}
  function ended(){btns.innerHTML='<button class="zt2-re" type="button" data-replay>Replay</button><button class="zt2-go" type="button" data-go>Your turn</button>';
    btns.querySelector('[data-replay]').onclick=function(e){e.stopPropagation();btns.innerHTML='';clearTimeout(closeT);pl.replay();log('t2_demo_replay')};
    btns.querySelector('[data-go]').onclick=function(e){e.stopPropagation();close('go')};
    try{if(ZK.kbd)btns.querySelector('[data-go]').focus({preventScroll:true})}catch(e){}
    if(o.auto)closeT=setTimeout(function(){close('timeout')},Math.round(7000*SLOW))}
  ov.querySelector('[data-skip]').onclick=function(e){e.stopPropagation();close('skip')};
  /* a touch on the card skips it while it plays (it is the player's to stop); a vertical swipe in the Reel also moves on */
  ov.addEventListener('pointerdown',function(e){if(!e.isTrusted||e.target.closest('button'))return;   /* the script's own presses are not the player's */
  if(!btns.firstChild)close('touch');else close('touch-end')});
  function key(e){if(e.key==='Escape'&&!done){e.preventDefault();close('esc')}}document.addEventListener('keydown',key,true);
  var oc=close;close=function(h){document.removeEventListener('keydown',key,true);oc(h)};
  requestAnimationFrame(function(){if(done)return;pl=ZT.play(box,id,{cap:cap,onEnd:ended,inst:o.inst});if(!pl)close('fail')});
  log(o.auto?'t2_demo_auto':'t2_demo_open');
  OPEN={el:ov,close:function(h){close(h)},id:id};return OPEN};

/* ---------------- the Reel's Show me: a strip above the board (decision 2) ----------------
   It goes in the card's column just above the board area (.rmid), which shrinks to make room; the Reel re-fits the board, so the real
   board stays on screen and takes touches while the demo plays. Any touch on the card ends it: a touch on the strip at once, a touch on
   the board (or anywhere else on the card) stops the demo at once and folds the strip away when the finger lifts, so the board never
   re-fits under a finger. Ends on Replay (and Close); in auto mode it folds away 7 s after the end. */
function refit(){try{window.dispatchEvent(new Event('resize'))}catch(e){}}
function strip(id,area,o){var card=o.parent||area.parentNode;
  var ov=document.createElement('div');ov.className='zt2-strip';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Show me: how to play '+((P(id)||{}).name||''));ov.setAttribute('data-showme',id);ov.setAttribute('data-strip','');
  ov.innerHTML='<div class="zt2-box" aria-hidden="true"></div><div class="zt2-side"><span class="zt2-tag">Show me</span><button class="zt2-skip" type="button" data-skip>Skip</button><p class="zt2-cap" aria-live="polite"></p><div class="zt2-btns"></div></div>';
  area.parentNode.insertBefore(ov,area);var box=ov.querySelector('.zt2-box'),cap=ov.querySelector('.zt2-cap'),btns=ov.querySelector('.zt2-btns'),skip=ov.querySelector('[data-skip]'),closeT=0,done=false,pl=null,soft=false;
  capH();refit();
  function close(how){if(done)return;done=true;clearTimeout(closeT);if(pl)pl.stop();card.removeEventListener('pointerdown',onDown,true);document.removeEventListener('pointerup',onUp,true);document.removeEventListener('pointercancel',onUp,true);document.removeEventListener('keydown',key,true);
    ov.remove();refit();if(OPEN&&OPEN.el===ov)OPEN=null;markSeen(id);log('t2_demo_'+(how||'close'));if(o.onClose)o.onClose(how||'close')}
  function ended(){btns.innerHTML='<button class="zt2-re" type="button" data-replay>Replay</button>';skip.textContent='Close';
    btns.querySelector('[data-replay]').onclick=function(e){e.stopPropagation();btns.innerHTML='';skip.textContent='Skip';clearTimeout(closeT);pl.replay();log('t2_demo_replay')};
    if(o.auto)closeT=setTimeout(function(){close('timeout')},Math.round(7000*SLOW))}
  skip.onclick=function(e){e.stopPropagation();close(btns.firstChild?'close':'skip')};
  function onDown(e){if(!e.isTrusted||done)return;var t=e.target;if(t.closest&&t.closest('.zt2-strip button'))return;
    if(ov.contains(t)){close(btns.firstChild?'touch-end':'touch');return}
    /* the player's own move: stop the demo now (its scripted presses must never mix with a real drag), fold the strip when the finger lifts */
    if(!soft){soft=true;clearTimeout(closeT);if(pl){pl.stop();pl=null}ov.classList.add('zt2-paused');document.addEventListener('pointerup',onUp,true);document.addEventListener('pointercancel',onUp,true)}}
  function onUp(){setTimeout(function(){close('touch')},160)}
  card.addEventListener('pointerdown',onDown,true);
  function key(e){if(e.key==='Escape'&&!done){e.preventDefault();close('esc')}}document.addEventListener('keydown',key,true);
  /* 8 Nov: a tall or detailed demo board (Seed Pits, Zebra, River Ferry, Four Shades) is unreadable beside the caption. The strip then goes tall: the
     demo board on top at full width, the caption under it. A puzzle can ask with strip:'tall', 'xtall' (side by side, taller: narrow tall boards) or 'side'; otherwise it is picked from the board's shape
     (tall wins when it shows the board at least 1.3x bigger). */
  var decided=false;function choose(h,d){if(decided)return;decided=true;var pref=d&&d.strip;
    if(pref!=='tall'&&pref!=='side'&&pref!=='xtall'){var w=h.__t2cw||h.offsetWidth||300,hh=h.__t2h||h.scrollHeight||300;
      if(hh/w>1.6)pref='xtall';   /* a narrow, tall board: only height helps, so the side layout, taller */
      else{var s1=Math.min(box.clientWidth/w,box.clientHeight/hh);ov.classList.add('zt2-tall');var s2=Math.min(box.clientWidth/w,box.clientHeight/hh);ov.classList.remove('zt2-tall');pref=s2>=s1*1.3?'tall':'side'}}
    if(pref==='tall'||pref==='xtall')ov.classList.add('zt2-'+pref);capH();refit()}
  /* on a Reel card the strip never takes more than 42% of the column it shares with the real board (360-390 px phones keep a usable board) */
  function capH(){if(!card.classList||!card.classList.contains('rl6c'))return;ov.style.height='';var tot=ov.offsetHeight+area.offsetHeight,mx=Math.floor(tot*.42);if(ov.offsetHeight>mx)ov.style.height=Math.max(96,mx)+'px'}
  requestAnimationFrame(function(){requestAnimationFrame(function(){if(done||soft)return;pl=ZT.play(box,id,{cap:cap,onEnd:ended,inst:o.inst,onMount:choose});if(!pl)close('fail')})});
  log(o.auto?'t2_demo_auto':'t2_demo_open');
  OPEN={el:ov,close:function(h){close(h)},id:id,strip:true};return OPEN}

/* ---------------- the guided first move (level 1, first time, real board) ---------------- */
ZT.guide=function(id,root,inst,o){o=o||{};var d=D[id];if(!d||!d.guide||!root)return null;css();
  var par=root.offsetParent||root.parentNode,spot=null,sayEl=null,path=null,k=0,dead=false,miss=0,s=ZK.sess(root),n0=s?s.count():0,poll=0,cur=null;
  function clear(){if(spot)spot.remove();if(sayEl)sayEl.remove();if(path)path.remove();spot=sayEl=path=null}
  function ptRel(T){var a=target(T,root,inst);if(!a)return null;var pr=par.getBoundingClientRect();return {x:a.x-pr.left,y:a.y-pr.top,el:a.el}}
  /* the lit box: g.box(root, inst) -> {left, top, right, bottom} in viewport pixels, or the element of g.light / g.tap / the drag's start */
  function litRect(g){if(g.box){try{return g.box(root,inst)}catch(e){return null}}var el=g.light||(g.tap&&(target(g.tap,root,inst)||{}).el)||(g.drag&&(target(g.drag[0],root,inst)||{}).el);
    if(typeof el==='string')el=root.querySelector(el);if(typeof el==='function')el=el(root,inst);return el&&el.getBoundingClientRect?el.getBoundingClientRect():null}
  var lit=null;
  function show(){clear();if(dead)return;var g=null;try{g=d.guide(root,inst,k)}catch(e){g=null}if(!g)return stop('done');cur=g;
    var r=litRect(g);if(!r)return stop('none');var pr=par.getBoundingClientRect(),pad=g.pad==null?6:g.pad;lit={left:r.left-pad,top:r.top-pad,right:r.right+pad,bottom:r.bottom+pad};
    var b={l:r.left-pr.left,t:r.top-pr.top,w:r.right-r.left,h:r.bottom-r.top};spot=document.createElement('div');spot.className='zt2-spot pulse'+(document.querySelector('.zt2-strip')?' soft':'');spot.setAttribute('data-guide',k);
    spot.style.cssText='left:'+(b.l-pad)+'px;top:'+(b.t-pad)+'px;width:'+(b.w+pad*2)+'px;height:'+(b.h+pad*2)+'px';par.appendChild(spot);
    if(g.drag){var a=ptRel(g.drag[0]),z=ptRel(g.drag[1]);if(a&&z){path=document.createElementNS('http://www.w3.org/2000/svg','svg');path.setAttribute('class','zt2-path');
      var mx=(a.x+z.x)/2,my=Math.min(a.y,z.y)-40;path.innerHTML='<path d="M'+a.x+' '+a.y+'Q'+mx+' '+my+' '+z.x+' '+z.y+'"/><circle cx="'+z.x+'" cy="'+z.y+'" r="11" fill="none" stroke="var(--accent,#E8590C)" stroke-width="3.5"/>';par.appendChild(path)}}
    /* a short board area with the strip open (small phones): the bubble would cover the board, so the ring and path speak alone */
    if(g.say&&!((par.clientHeight||999)<300&&document.querySelector('.zt2-strip'))){sayEl=document.createElement('div');sayEl.className='zt2-say';sayEl.textContent=g.say;var below=b.t+b.h+pad+12,above=b.t-pad-12;
      var ph=par.clientHeight||9999;if(g.above||below+60>ph){sayEl.style.top=Math.max(4,above-44)+'px'}else sayEl.style.top=below+'px';
      var cx=Math.max(130,Math.min(b.l+b.w/2,(par.clientWidth||390)-130));sayEl.style.left=cx+'px';par.appendChild(sayEl)}
    log('t2_guide_'+k)}
  /* the guide follows the player: a counted move (or a step's until(), or for a tap step a press inside the lit box) moves it on; two presses outside it end it */
  function onDown(e){if(dead||!cur||!lit||!e.isTrusted)return;var x=e.clientX,y=e.clientY,inside=x>=lit.left&&x<=lit.right&&y>=lit.top&&y<=lit.bottom;
    if(cur.drag&&!inside){var z=target(cur.drag[1],root,inst);if(z&&Math.hypot(z.x-x,z.y-y)<60)inside=true}
    if(inside){if(cur.tap)setTimeout(function(){if(!dead)next()},260);return}
    if(++miss>=2)stop('miss')}
  root.addEventListener('pointerdown',onDown,true);
  /* the board can move (the Show me strip opens or folds, the Reel re-fits): place the light again on the same step */
  var rsT=0;function onRs(){clearTimeout(rsT);rsT=setTimeout(function(){if(!dead&&cur)show()},60)}window.addEventListener('resize',onRs);
  poll=setInterval(function(){if(dead)return;if(!root.isConnected)return stop('gone');var n=s?s.count():0;if(n!==n0){n0=n;next()}else if(cur&&cur.until){try{if(cur.until(root,inst))next()}catch(e){}}},200);
  var lastAdv=0;function next(){if(Date.now()-lastAdv<600)return;lastAdv=Date.now();k++;show()}
  function stop(why){if(dead)return;dead=true;clearInterval(poll);clearTimeout(rsT);window.removeEventListener('resize',onRs);clear();root.removeEventListener('pointerdown',onDown,true);if(o.onEnd)o.onEnd(why)}
  show();GUIDE={stop:stop};return GUIDE};
var GUIDE=null,GUIDE_AT=Math.round(1600*SLOW);   /* ms after a strip demo opens: the first move lights up on the real board */

/* ---------------- a chip in the hint row: "Show me" ---------------- */
function rowFor(root){var sec=root.closest&&root.closest('.pz5'),card=root.closest&&root.closest('.rl6c');
  if(sec)return sec.querySelector('.zk-status')||sec;if(card)return card.querySelector('.rcap');return root.parentNode}
function chip(root,id,text,why){var row=rowFor(root);if(!row)return null;var old=row.querySelector('.zt2-chiprow');if(old)old.remove();
  var c=document.createElement('div');c.className='zt2-chiprow';c.setAttribute('data-t2chip',why);c.innerHTML=(text?'<span>'+esc(text)+'</span>':'')+'<button class="zt2-chip" type="button">'+
    '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>Show me</button>';
  var card=root.closest&&root.closest('.rl6c');if(card){var rr=row.querySelector('.rrow');row.insertBefore(c,rr||null)}else row.appendChild(c);
  c.querySelector('button').onclick=function(){c.remove();open(id,root,false);log('t2_chip_'+why)};
  return c}
function open(id,root,auto,onClose){var card=root.closest&&root.closest('.rl6c'),inst=root.__t2inst;
  if(card)return ZT.showMe(id,card.querySelector('.rmid'),{auto:auto,parent:card,onClose:onClose,inst:inst,strip:ZT.REEL!=='full'});
  var sec=root.closest&&root.closest('.pz5');return ZT.showMe(id,root,{auto:auto,parent:sec||root.parentNode,onClose:onClose,inst:inst,strip:ZT.PAGE!=='full'})}
ZT.openDemo=open;

/* ---------------- confusion watch ---------------- */
var OFFERED={};   /* once per puzzle per session */
ZT.watch=function(id,root,o){o=o||{};var d=D[id];if(!d||!root)return null;var s=ZK.sess(root),t0=Date.now(),lastTouch=Date.now(),downs=[],wrongs=[],n0=s?s.count():0,dead=false,iv=0;
  function busy(){return !!OPEN||(typeof Nav!=='undefined'&&Nav.overlays>0)||!!document.querySelector('.zt2-spot')||(o.blocked&&o.blocked())}
  function offer(why){if(OFFERED[id]||dead)return;OFFERED[id]=1;stop();chip(root,id,why==='idle'?'Not sure where to start?':'Not sure how it works?',why);log('t2_confused_'+why)}
  function onDown(e){if(e&&!e.isTrusted)return;var now=Date.now();lastTouch=now;downs.push({t:now,n:s?s.count():0})}
  root.addEventListener('pointerdown',onDown,true);
  root.__t2wrong=function(){wrongs.push(Date.now())};
  iv=setInterval(function(){if(dead)return;if(!root.isConnected)return stop();if(busy()){lastTouch=Math.max(lastTouch,Date.now()-4000);return}var now=Date.now(),n=s?s.count():0;
    if(o.done&&o.done())return stop();
    if(n===0&&now-lastTouch>12000&&now-t0>12000)return offer('idle');
    wrongs=wrongs.filter(function(t){return now-t<25000});if(wrongs.length>=3)return offer('wrong');
    if(d.flail!==false){downs=downs.filter(function(x){return now-x.t<8000});if(downs.length>=6&&downs[0].n===n)return offer('flail')}},1000);
  function stop(){dead=true;clearInterval(iv);root.removeEventListener('pointerdown',onDown,true)}
  return {stop:stop}};
/* refused moves: every puzzle already calls ZK.wrong (the amber wobble); count them for the board they belong to */
var wrong0=ZK.wrong;ZK.wrong=function(el){try{for(var e=el;e&&e!==document;e=e.parentNode)if(e.__t2wrong){e.__t2wrong();break}}catch(x){}return wrong0.apply(this,arguments)};
var stuck0=ZK.stuck;ZK.stuck=function(host,on,o){try{if(on&&o&&o.kind==='rule')for(var e=host;e&&e!==document;e=e.parentNode)if(e.__t2wrong){e.__t2wrong();break}}catch(x){}return stuck0.apply(this,arguments)};

/* ---------------- the old level-1 ghost and the 4 s nudge step aside for puzzles with a demo ---------------- */
var gs0=ZK.ghostSeen;ZK.ghostSeen=function(id){return has(id)||gs0(id)};
var nudge0=ZT.nudge;ZT.nudge=function(o){if(o&&has(o.id))return {stop:function(){},shown:function(){return false}};return nudge0.apply(this,arguments)};

/* ---------------- the hint ladder: a free first rung (the rule + Show me) ---------------- */
if(window.ZR){var ZR0=window.ZR;window.ZR=function(o){var c=ZR0(o),id=o.s&&o.s.id,h0=c.hint;if(!has(id))return c;
  c.hint=function(){if(o.fin()||c.t2rule||(o.s.lost&&o.s.lost()))return h0.apply(this,arguments);c.t2rule=true;if(GUIDE)GUIDE.stop('hint');o.text(pick(id,o.s.root&&o.s.root.__t2inst).line);
    var root=o.s.root;if(root)chip(root,id,'',
      'hint');log('t2_hint_rule');return Promise.resolve()};
  var r0=c.restart;c.restart=function(){var r=r0.apply(this,arguments);return r};return c}}

/* ---------------- the Rules sheet leads with the demo ---------------- */
if(window.ztRulesSheet){var rs0=window.ztRulesSheet;window.ztRulesSheet=function(id){if(!has(id)||typeof Nav==='undefined')return rs0.apply(this,arguments);
  var p=P(id),b=h5('<div><div class="zt2-sheetdemo"><div class="zt2-in"><div class="zt2-box" aria-hidden="true"></div><p class="zt2-cap"></p><div class="zt2-btns"></div></div></div><div style="margin-top:16px">'+ZT.stepsHtml(id,p&&p.how)+'</div><button class="btn pri wide" data-back style="margin-top:18px">Back to the puzzle</button></div>');
  var sh=Nav.sheet({title:'How to play '+(p?p.name:''),body:b,cls:'zt-rsheet'}),pl=null;
  var oc=sh.close;sh.close=function(){if(pl)pl.stop();return oc.apply(this,arguments)};
  qs(b,'[data-back]').onclick=function(){sh.close()};
  setTimeout(function(){var box=qs(b,'.zt2-box'),cap=qs(b,'.zt2-cap'),bt=qs(b,'.zt2-btns');if(!box||!box.isConnected)return;
    var cur=document.querySelector('.pz5:last-of-type .pzroot');if(window.RL6&&RL6.cards&&RL6.cards[RL6.cur]&&typeof Nav!=='undefined'&&Nav.cur==='play'&&!Nav.depth)cur={__t2inst:RL6.cards[RL6.cur].inst};
    pl=ZT.play(box,id,{inst:cur&&cur.__t2inst,cap:cap,onEnd:function(){bt.innerHTML='<button class="zt2-re" type="button">Replay</button>';bt.firstChild.onclick=function(){bt.innerHTML='';pl.replay()}}});markSeen(id)},360);
  /* the sheet can also close by its scrim or Back: stop the demo when its box leaves the page */
  var mo=new MutationObserver(function(){if(!b.isConnected){if(pl)pl.stop();mo.disconnect()}});mo.observe(document.body,{childList:true,subtree:true});
  return sh}}

/* ---------------- the puzzle page ---------------- */
var pp0=playPuzzle;
playPuzzle=function(id,level,o){var st=pp0.apply(this,arguments);try{if(st&&st.id===id&&has(id)&&st.inst&&!st.fin)setTimeout(function(){page(st)},380)}catch(e){console.error(e)}return st};
function page(st){if(typeof RUN!=='undefined'&&RUN!==st)return;var secs=document.querySelectorAll('.pz5'),sec=secs[secs.length-1],root=sec&&sec.querySelector('.pzroot');if(!root||!root.isConnected)return;
  var id=st.id,t=TS();root.__t2inst=st.inst;
  /* teach6 wires the page's Rules pill to its own sheet; point it at the sheet that leads with the demo */
  var rb=sec.querySelector('[data-rules]');if(rb)rb.onclick=function(){window.ztRulesSheet(id);log('rules_open')};function live(){return (typeof RUN==='undefined'||RUN===st)&&!st.fin&&root.isConnected}
  function guide(){if(!live()||st.level!==1||st.mv>0||(t.guide&&t.guide[id]))return startWatch();(t.guide=t.guide||{})[id]=1;try{save()}catch(e){}
    st.t2g=ZT.guide(id,root,st.inst,{onEnd:function(){startWatch()}});if(!st.t2g)startWatch()}
  function startWatch(){if(!live()||st.t2w)return;st.t2w=ZT.watch(id,root,{done:function(){return !live()}})}
  /* first time: the demo plays in the strip above the board and, 1.6 s in, the first move lights up on the real board (rule first, then where) */
  if(!seen(id)&&st.mv===0){var op2=open(id,root,true,function(how){if(how!=='replaced')setTimeout(guide,how==='touch'?0:200)});if(op2&&op2.strip)setTimeout(function(){if(OPEN===op2)guide()},GUIDE_AT)}else guide();
  var pg=Nav.top;if(pg&&pg.el===sec){var op=pg.onPop;pg.onPop=function(){if(OPEN)OPEN.close('leave');if(st.t2g)st.t2g.stop();if(st.t2w)st.t2w.stop();if(op)return op.apply(this,arguments)}}}

/* ---------------- the Reel ---------------- */
if(window.RL6){var R=window.RL6,dueT=0;
  var onCard=null;
  /* focus fires again for the same card (re-fits, the observer); only a different card closes an open demo */
  var onG=null;
  R.onFocus=function(c){if(c&&c===onCard)return;onCard=c;clearTimeout(dueT);if(OPEN)OPEN.close('swipe');if(onG){onG.stop('swipe');onG=null}if(!c||!has(c.id)||seen(c.id)||c.solved)return;
    var firstHint=false;try{firstHint=R.cur===0&&!(S().teach&&S().teach.reelswipe)&&!(window.Q&&Q.demo&&!/[?&](teach|swipehint)\b/.test(location.search))}catch(e){}
    var touched=false,el=c.el;function tch(){touched=true}el.addEventListener('pointerdown',tch,true);
    dueT=setTimeout(function(){el.removeEventListener('pointerdown',tch,true);if(touched||c.mv>0||c.solved||R.cards[R.cur]!==c||typeof Nav==='undefined'||Nav.cur!=='play'||Nav.depth||Nav.overlays>0)return;
      if(document.querySelector('[data-swipehint]')){dueT=setTimeout(arguments.callee,600);return}
      var host=c.el.querySelector('[data-host]');if(!host)return;var op=open(c.id,host,true);
      /* a Reel card is a cold mid-level: the demo teaches the rule on its tiny board, and the real board's first move lights up beside it (the level's
         own guide step 0; the guide functions read inst, so they work on any level). Once per puzzle, with the auto demo only. */
      if(op&&op.strip&&D[c.id]&&D[c.id].guide)dueT=setTimeout(function(){if(OPEN!==op||c.mv>0||R.cards[R.cur]!==c)return;c.t2g=ZT.guide(c.id,host,c.inst,{});onG=c.t2g},GUIDE_AT)},firstHint?2700:900)};
  R.onMount=function(c){if(!has(c.id))return;var host=c.el.querySelector('[data-host]');host.__t2inst=c.inst;if(c.t2w)c.t2w.stop();
    setTimeout(function(){if(!c.ctrl||!host.isConnected)return;c.t2w=ZT.watch(c.id,host,{done:function(){return c.solved||!c.ctrl},blocked:function(){return R.cards[R.cur]!==c}})},50)}}
})();
