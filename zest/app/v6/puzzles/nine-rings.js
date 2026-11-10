/* Zest v6: Nine Rings (Chinese rings). Overrides the puzzles_d9.js entry; the original stays in ZK.orig['nine-rings'].
   Rule: ring 1 can always be taken off or put back; ring k can move only when ring k-1 is ON and every ring before that is OFF. Goal: all off.
   The state graph is a single path (a Gray code): every state has a distinct distance 1, 2, 3, ... to 'all off', and a state has exactly two legal moves,
   one toward the goal and one away. So par (the exact BFS distance) picks the start state exactly.
   v5 FIXED the cliff: it grew the ring count 3 to 9 and par went 3, 5, 10, 21, 42, 85, 170, 341 (77 by level 25).
   Now par is a ladder capped at 24: 2,3,4,5,4,6,7,8,7,9 | 10,9,11,12,11,13,14,13,15,16 | 15,17,18,17,19,20,19,21,22,24 (a breather after every climb),
   and the rack only shows as many rings as the start needs (2 to 5), so the early levels teach the rhythm on 2, 3 and 4 rings before 5.
   Board: rings threaded on a rod; the rings that CAN move glow (never more than two); a locked ring that is tapped shows the ring that blocks it in amber; a move away
   from the goal gets the amber 'mm' (it is allowed, and Undo is free); par pips; counter = rings still on. Aha: after you move ring 1 the other glowing ring is the way on:
   never undo your last move. */
(function(){
var ID='nine-rings',NR=PZD9.nr;
var PAR=[2,3,4,5,4,6,7,8,7,9, 10,9,11,12,11,13,14,13,15,16, 15,17,18,17,19,20,19,21,22,24];
function bits(x){var b=0;while(x){b++;x>>=1}return b}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var par=PAR[level-1],n=Math.max(2,bits(par)),d=NR.dist(n),s=-1;
  for(var k=1;k<(1<<n);k++)if(d[k]===par){s=k;break}
  return{level:level,title:'Level '+level,n:n,start:s,par:par,parExact:true}}
window.V6NR={make:make,PAR:PAR};
var CSS=''
+'.nr{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:var(--font)}'
+'.nr-top{display:flex;align-items:center;justify-content:center;gap:12px;min-height:34px}'
+'.nr-board{position:relative;display:grid;gap:0;width:100%;box-sizing:border-box;padding:12px 8px 8px;border-radius:22px;background:var(--panel,rgba(120,110,95,.14));box-shadow:inset 0 0 0 1.5px var(--line,#ddd);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.nr-rod{position:absolute;left:6px;right:6px;top:calc(12px + 66px);height:12px;margin-top:-6px;border-radius:6px;background:linear-gradient(var(--nr-rod1,#9c9486),var(--nr-rod2,#6f685c));z-index:1;pointer-events:none;box-shadow:0 2px 3px rgba(0,0,0,.25)}'
+'.nr-c{all:unset;position:relative;box-sizing:border-box;height:168px;min-width:44px;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;justify-content:center}'
+'.nr-c:focus-visible{outline:3px solid var(--ink,#000);outline-offset:-3px;border-radius:14px}'
+'.nr-ring{position:absolute;left:50%;top:10px;width:32px;height:112px;margin-left:-16px;transition:transform .42s cubic-bezier(.3,1.35,.55,1),opacity .3s;pointer-events:none}'
+'.nr-ring i{position:absolute;inset:0;box-sizing:border-box;border:7px solid var(--nr-ring,#E8590C);border-radius:50%}'
+'.nr-ring .f{clip-path:inset(0 0 0 50%);z-index:2}.nr-ring .b{clip-path:inset(0 50% 0 0);z-index:0;opacity:.8}'
+'.nr-ring.off{transform:translateY(46px) scale(.62);opacity:.5}'
+'.nr-ring.off i{border-style:dashed;border-width:6px}'
+'.nr-c.go .nr-ring{filter:drop-shadow(0 0 7px var(--nr-ring,#E8590C))}'
+'.nr-c.go:not(.lock)::after{content:"";position:absolute;left:50%;bottom:30px;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:var(--nr-ring,#E8590C)}'
+'.nr-num{position:absolute;left:0;right:0;bottom:4px;text-align:center;font:800 1rem/1 var(--font);color:var(--muted,#5f5a52);pointer-events:none}'
+'.nr-c.amb .nr-ring i{border-color:#E9A23B}.nr-c.amb{animation:none}'
+'.nr-c.pv .nr-ring{transform:scale(.94)}.nr-c.pv .nr-ring.off{transform:translateY(46px) scale(.58)}'
+'.nr{--nr-ring:#E8590C}:root[data-theme="dark"] .nr{--nr-ring:#F6A93B;--nr-rod1:#8a8478;--nr-rod2:#5d574e}'
+'@media (max-width:359px){.nr{width:calc(100% + 16px);max-width:none;margin:0 -8px}}'
+'@media (prefers-reduced-motion:reduce){.nr-ring{transition:none}}.nr.zk-rm .nr-ring{transition:none}';
var RING='<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="5" ry="9" fill="none" stroke="currentColor" stroke-width="3"/></svg>';

function mount(root,inst,api){ZK.css(CSS,'nr-css');root.textContent='';
  var n=inst.n,rm=ZK.rm(api),D=NR.dist(n),s=inst.start,hist=[],hints=0,undos=0,fin=false,last=null,cols=[],rings=[],ghost=null,idle=null,offs=[],ambTm=null,i;
  var stage=document.createElement('div');stage.className='nr zk-stage zk-host'+(rm?' zk-rm':'');
  var ctr=ZK.counter({icon:RING,label:function(k){return k===0?'All rings off':k+' ring'+(k===1?'':'s')+' on'}}),pips=ZK.pips(inst.par);
  var top=document.createElement('div');top.className='nr-top';top.appendChild(ctr.el);
  var board=document.createElement('div');board.className='nr-board zk-board';board.setAttribute('role','group');board.setAttribute('aria-label','Rings 1 to '+n);board.style.gridTemplateColumns='repeat('+n+',minmax(0,1fr))';
  var rod=document.createElement('div');rod.className='nr-rod';board.appendChild(rod);
  for(i=0;i<n;i++)(function(k){var b=document.createElement('button');b.type='button';b.className='nr-c';b.setAttribute('data-zkc','');
    var r=document.createElement('div');r.className='nr-ring';r.innerHTML='<i class="b"></i><i class="f"></i>';b.appendChild(r);var nm=document.createElement('span');nm.className='nr-num';nm.textContent=k+1;b.appendChild(nm);
    b.onclick=function(){tap(k)};cols.push(b);rings.push(r);board.appendChild(b)})(i);
  stage.appendChild(top);stage.appendChild(board);stage.appendChild(pips.el);root.appendChild(stage);
  function onCount(){var c=0;for(var k=0;k<n;k++)if(s>>k&1)c++;return c}
  function paint(instant){for(var k=0;k<n;k++){var on=s>>k&1,can=NR.can(s,k),r=rings[k];
      if(instant){r.style.transition='none'}r.classList.toggle('off',!on);if(instant){void r.offsetWidth;r.style.transition=''}
      cols[k].classList.toggle('go',!!can);cols[k].classList.toggle('lock',!can);
      cols[k].setAttribute('aria-label','Ring '+(k+1)+', '+(on?'on the bar':'off the bar')+', '+(can?'can move':'locked'));cols[k].setAttribute('aria-disabled',can?'false':'true')}
    ctr.set(onCount())}
  function amber(list){list.forEach(function(k){cols[k].classList.add('amb')});clearTimeout(ambTm);ambTm=setTimeout(function(){cols.forEach(function(c){c.classList.remove('amb')})},700)}
  function blockers(k){if(!(s>>(k-1)&1))return[k-1];var o=[];for(var j=0;j<k-1;j++)if(s>>j&1)o.push(j);return o}
  function tap(k){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    if(!NR.can(s,k)){amber(blockers(k));ZK.wrong(cols[k]);api.say('Ring '+(k+1)+' is locked.');return}
    var away=D[s^(1<<k)]>D[s];hist.push(s);s^=1<<k;last=cols[k];api.moved();pips.set(hist.length);paint();
    ZK.sfx((s>>k&1)?'clack':'lift',{});ZK.buzz('move');
    if(away){amber([k]);ZK.sfx('soft');ZK.buzz('soft');api.say('That moved away from the goal.')}
    if(!s){fin=true;api.say('All rings are off.');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par,n:n}})},rm?0:320)}}
  function undo(){if(fin||!hist.length)return false;s=hist.pop();undos++;pips.set(hist.length);paint();ZK.unmark(stage);ZK.sfx('undo');ZK.buzz('tap');return true}
  function L(t,ty,fn){t.addEventListener(ty,fn);offs.push(function(){t.removeEventListener(ty,fn)})}
  L(stage,'pointerdown',function(e){var c=e.target.closest&&e.target.closest('button.nr-c');if(c&&!fin){c.classList.add('pv');ZK.sfx('press')}});
  function unpv(){cols.forEach(function(c){c.classList.remove('pv')})}L(document,'pointerup',unpv);L(document,'pointercancel',unpv);
  paint(true);ctr.set(onCount(),true);
  if(inst.level===1){var b0=NR.can(s,0)&&D[s^1]===D[s]-1?0:1;ghost=ZK.ghost(stage,[{tap:cols[nrBest()],hold:900}],{id:ID,level:1})}
  function nrBest(){for(var k=0;k<n;k++)if(NR.can(s,k)&&D[s^(1<<k)]===D[s]-1)return k;return 0}
  idle=ZK.idle(stage,25000);
  return{undo:undo,
    restart:function(){if(fin)return;s=inst.start;hist=[];pips.set(0);paint();ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin||!s)return null;hints++;ZK.unmark(stage);var k=nrBest();
      if(lv<=1){return 'Two rings glow. One of them goes the right way: do not undo the move you just made.'}
      if(lv===2){ZK.mark(cols[k]);return 'Move this ring.'}
      tap(k);return 'Moved one for you.'},
    destroy:function(){clearTimeout(ambTm);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{s:s,moves:hist.length,fin:fin}}}}

ZK.override({id:ID,name:'Nine Rings',family:'move',theme:'F8',
  blurb:'Free a row of linked rings from a bar, one careful move at a time.',
  how:'Tap a glowing ring to take it off or put it back. Clear the bar.',
  areas:['flex','space'],levels:30,secs:90,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||m,h=res.hints||0,s=pzStarsByPar(m,p,h),u=res.undos||0;if(u>3&&s>2)s=2;
    return{stars:s,line:m<=p?'Clear in '+m+' moves, the fewest possible.':'Clear in '+m+' moves. The fewest is '+p+'.'}}});
})();
