/* Zest v6 pilot: Switch Off (lights-out family). Overrides the puzzles_d3.js entry through ZK.override (the original stays in ZK.orig).
   Rule: a tap switches that light and the lights directly above, below, left and right. Goal: a dark board.
   Board: 3x3 for levels 1-3 (teach), 4x4 for 4-9, 5x5 for 10-30. Every board is made by tapping from all-dark, so it is solvable.
   par = the fewest taps, exact: Gaussian elimination over GF(2), then every combination of the free variables (none on 3x3, 4 on 4x4, 2 on 5x5).
   Aha filter: from level 4 the fewest-tap solution must include at least one tap on a light that is OFF (the counter-intuitive move);
   from level 12, at least two; but not too many (at most 1 on 4x4, about half the taps on 5x5 until level 20) so no level is a trick cliff. Levels follow a target-par table with sawtooth breathers (see Docs/v6/pilots/switch-off.md).
   No text on the board: a lit-count pill, par pips, the cross-shaped preview on press, and a ghost tap on level 1 only. */
(function(){
var ID='switch-off';
function pc(x){var n=0;while(x){x&=x-1;n++}return n}
var EFFC={};
function eff(n){if(EFFC[n])return EFFC[n];var a=[];for(var q=0;q<n*n;q++){var r=(q/n)|0,c=q%n,m=1<<q;
    if(r>0)m|=1<<(q-n);if(r<n-1)m|=1<<(q+n);if(c>0)m|=1<<(q-1);if(c<n-1)m|=1<<(q+1);a.push(m)}return EFFC[n]=a}
/* every press set x with A x = b (A symmetric: row i = eff[i]) */
function solveAll(n,b){var N=n*n,E=eff(n),rows=[],i,c,p,t,k,piv=[],rk=0,free=[];
  for(i=0;i<N;i++)rows.push({m:E[i],r:(b>>i)&1});
  for(c=0;c<N;c++){p=-1;for(i=rk;i<N;i++)if((rows[i].m>>c)&1){p=i;break}if(p<0)continue;t=rows[p];rows[p]=rows[rk];rows[rk]=t;
    for(i=0;i<N;i++)if(i!==rk&&((rows[i].m>>c)&1)){rows[i].m^=rows[rk].m;rows[i].r^=rows[rk].r}piv.push(c);rk++}
  for(i=rk;i<N;i++)if(rows[i].r)return[];
  for(c=0;c<N;c++)if(piv.indexOf(c)<0)free.push(c);
  var sols=[];for(var f=0;f<(1<<free.length);f++){var x=0;for(k=0;k<free.length;k++)if((f>>k)&1)x|=1<<free[k];
    for(k=0;k<rk;k++){var v=rows[k].r^(pc(rows[k].m&~(1<<piv[k])&x)&1);if(v)x|=1<<piv[k]}sols.push(x)}
  return sols}
function minSol(n,b){var s=solveAll(n,b);if(!s.length)return null;var best=s[0];for(var i=1;i<s.length;i++)if(pc(s[i])<pc(best))best=s[i];return best}
function xorOf(n,ps){var E=eff(n),m=0;ps.forEach(function(q){m^=E[q]});return m}
/* target fewest taps per level: teach, ramp, and a breather after each climb */
var PAR=[1,1,2, 2,3,2,3,4,3, 3,4,4,5,4,5,6,5,6,7,5, 6,7,7,8,6,8,8,9,7,9];
function sizeOf(level){return level<=3?3:level<=9?4:5}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var n=sizeOf(level),N=n*n,target=PAR[level-1],ahaMin=level<4?0:level<12?1:2,ahaMax=level<10?1:level<20?Math.ceil(target/2):target-1,best=null,all=[],i;
  for(i=0;i<N;i++)all.push(i);
  if(level===1){var b1=xorOf(3,[4]);return pack(level,n,b1,1,0)}
  if(level===2){var corners=[0,2,6,8],cq=corners[pzInt(rng,4)];return pack(level,n,xorOf(3,[cq]),1,0)}
  for(var t=0;t<900;t++){var k=target+pzInt(rng,2),ps=pzShuffle(all,rng).slice(0,k),b=xorOf(n,ps);if(!b)continue;
    var s=minSol(n,b),par=pc(s),aha=0,overlap=false,E=eff(n),q,sel=[];
    for(q=0;q<N;q++)if((s>>q)&1){sel.push(q);if(!((b>>q)&1))aha++}
    for(var a=0;a<sel.length&&!overlap;a++)for(var c=a+1;c<sel.length;c++)if(E[sel[a]]&E[sel[c]]){overlap=true;break}
    if(level===3&&!overlap)continue;
    if(pc(b)===N)continue;   /* never a fully lit board */
    var sc=Math.abs(par-target)*10+Math.max(0,ahaMin-aha)*6+Math.max(0,aha-ahaMax)*4;
    if(!best||sc<best.sc)best={sc:sc,b:b,par:par,aha:aha};if(sc===0)break}
  return pack(level,n,best.b,best.par,best.aha)}
function pack(level,n,b,par,aha){var lit=[];for(var i=0;i<n*n;i++)lit.push((b>>i)&1);return{level:level,title:'Level '+level,n:n,lit:lit,par:par,parExact:true,aha:aha}}
window.V6SO={make:make,solveAll:solveAll,minSol:minSol,eff:eff,xorOf:xorOf,PAR:PAR};

var CSS=''
+'.so{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:var(--font);--so-bg:#2A2622;--so-off:#3A352F;--so-ring:rgba(255,255,255,.16)}'
+':root[data-theme="dark"] .so{--so-bg:#0B0A09;--so-off:#26221E;--so-ring:rgba(255,255,255,.12)}'
+'.so-top{display:flex;align-items:center;justify-content:center;gap:14px;min-height:34px}'
+'.so-board{position:relative;z-index:1;display:grid;gap:7px;width:100%;padding:9px;box-sizing:border-box;border-radius:24px;background:var(--so-bg);box-shadow:inset 0 3px 10px rgba(0,0,0,.35),0 1px 0 rgba(255,255,255,.4);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.so-c{all:unset;position:relative;aspect-ratio:1;min-width:44px;cursor:pointer;border-radius:15px;perspective:500px;-webkit-tap-highlight-color:transparent;transition:scale .18s '+ZK.SPRING+'}'
+'.so-c:focus-visible{outline:3px solid #fff;outline-offset:2px}'
+'.so-in{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .38s cubic-bezier(.3,1.45,.55,1)}'
+'.so-f{position:absolute;inset:0;border-radius:15px;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;align-items:center;justify-content:center}'
+'.so-on{background:radial-gradient(circle at 50% 40%,#FFF6CF 0,#FFD866 36%,#F4A11F 100%);box-shadow:0 0 16px rgba(255,186,58,.6),inset 0 -3px 0 rgba(150,72,0,.35)}'
+'.so-on svg{width:38%;height:38%;opacity:.5}'
+'.so-off{transform:rotateY(180deg);background:var(--so-off);box-shadow:inset 0 2px 0 rgba(255,255,255,.05),inset 0 -3px 0 rgba(0,0,0,.35)}'
+'.so-off i{width:22%;height:22%;border-radius:50%;box-shadow:inset 0 0 0 2px var(--so-ring)}'
+'.so-c.pv{box-shadow:0 0 0 3px #fff,0 0 0 6px rgba(255,255,255,.18)}.so-c.pv0{scale:.93}'
+'.so-c.zk-mark{outline-color:#fff}'
+'.so-glow{position:absolute;inset:-10px;border-radius:30px;pointer-events:none;opacity:0;background:radial-gradient(closest-side,rgba(255,214,102,.55),rgba(255,214,102,0));z-index:0}'
+'.zk-rm .so-in,.so.zk-rm .so-c{transition:none}'
+'@media (prefers-reduced-motion:reduce){.so-in,.so-c{transition:none}}';
var SUN='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="#F4A11F"/><g stroke="#F4A11F" stroke-width="2.2" stroke-linecap="round"><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></g></svg>';
var GLYPH='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="#8A4300"/><g stroke="#8A4300" stroke-width="2.4" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/></g></svg>';

function mount(root,inst,api){ZK.css(CSS,'so-css');root.textContent='';
  var n=inst.n,N=n*n,E=eff(n),rm=ZK.rm(api),cur=0,start,i,hist=[],hints=0,undos=0,fin=false,last=null,cells=[],inner=[],ang=[],ghost=null,idle=null,pv=-1,offs=[];
  for(i=0;i<N;i++)if(inst.lit[i])cur|=1<<i;start=cur;
  var stage=document.createElement('div');stage.className='so zk-stage zk-host'+(rm?' zk-rm':'');
  var top=document.createElement('div');top.className='so-top';
  var ctr=ZK.counter({icon:SUN,label:function(k){return k===0?'All lights off':k+' light'+(k===1?'':'s')+' on'}}),pips=ZK.pips(inst.par);
  top.appendChild(ctr.el);
  var board=document.createElement('div');board.className='so-board zk-board';board.setAttribute('role','grid');board.setAttribute('aria-label','Lights, '+n+' by '+n);
  board.style.gridTemplateColumns='repeat('+n+',1fr)';
  for(i=0;i<N;i++)(function(q){var b=document.createElement('button');b.type='button';b.className='so-c';b.setAttribute('data-zkc','');b.setAttribute('role','gridcell');
    var inn=document.createElement('span');inn.className='so-in';inn.innerHTML='<span class="so-f so-on">'+GLYPH+'</span><span class="so-f so-off"><i></i></span>';
    b.appendChild(inn);b.onclick=function(){tap(q)};cells.push(b);inner.push(inn);ang.push(((cur>>q)&1)?0:180);inn.style.transition='none';inn.style.transform='rotateY('+ang[q]+'deg)';board.appendChild(b)})(i);
  stage.appendChild(top);stage.appendChild(board);stage.appendChild(pips.el);root.appendChild(stage);
  requestAnimationFrame(function(){inner.forEach(function(x){x.style.transition=''})});
  function on(q){return (cur>>q)&1}
  function labels(){for(var q=0;q<N;q++)cells[q].setAttribute('aria-label','Row '+(((q/n)|0)+1)+', column '+(q%n+1)+', '+(on(q)?'on':'off'))}
  function count(){return pc(cur)}
  function flip(q,delay){ang[q]+=180;var s=inner[q].style;s.transitionDelay=(rm?0:delay)+'ms';s.transform='rotateY('+ang[q]+'deg)'}
  function toggle(q){var m=E[q];for(var p=0;p<N;p++)if((m>>p)&1)flip(p,p===q?0:60);cur^=m}
  function preview(q,show){for(var p=0;p<N;p++)if((E[q]>>p)&1){cells[p].classList.toggle('pv',show);if(p===q)cells[p].classList.toggle('pv0',show)}}
  function clearPv(){if(pv>=0){preview(pv,false);pv=-1}}
  function tap(q){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();clearPv();ZK.unmark(stage);
    hist.push(q);toggle(q);last=cells[q];api.moved();var k=count();ctr.set(k);pips.set(hist.length);labels();
    ZK.sfx('click',{p:k});ZK.buzz('move');
    if(cur===0){fin=true;api.say('All the lights are off.');
      /* the last light goes out: a warm afterglow breathes out of the dark board */
      var gl=document.createElement('div');gl.className='so-glow';stage.insertBefore(gl,board);var ga=ZK.anim(gl,[{opacity:0,transform:'scale(.9)'},{opacity:1,transform:'scale(1)',offset:.35},{opacity:0,transform:'scale(1.12)'}],900,'ease-out',260);if(ga)ga.onfinish=function(){gl.remove()};else gl.remove();
setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:300)}}
  function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  L(board,'pointerdown',function(e){var c=e.target.closest&&e.target.closest('.so-c');if(!c||fin)return;var q=cells.indexOf(c);clearPv();pv=q;preview(q,true);ZK.sfx('press')});
  L(document,'pointerup',clearPv);L(document,'pointercancel',clearPv);
  L(board,'keydown',function(e){var q=cells.indexOf(document.activeElement);if(q<0)return;var r=(q/n)|0,c=q%n,t=-1;
    if(e.key==='ArrowRight'&&c<n-1)t=q+1;else if(e.key==='ArrowLeft'&&c>0)t=q-1;else if(e.key==='ArrowDown'&&r<n-1)t=q+n;else if(e.key==='ArrowUp'&&r>0)t=q-n;
    if(t>=0){cells[t].focus();e.preventDefault()}});
  ctr.set(count(),true);labels();
  if(inst.level===1){var cq=4;for(var z=0;z<N;z++)if(E[z]===cur){cq=z;break}
    ghost=ZK.ghost(stage,[{tap:cells[cq],down:function(){preview(cq,true)},up:function(){preview(cq,false)},cancel:function(){preview(cq,false)},hold:900}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  function setAll(){for(var q=0;q<N;q++){var want=on(q)?0:180;if(((ang[q]%360)+360)%360!==want)flip(q,0)}}
  return{
    undo:function(){if(fin||!hist.length)return false;var q=hist.pop();toggle(q);undos++;var k=count();ctr.set(k);pips.set(hist.length);labels();ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true},
    restart:function(){if(fin)return;cur=start;hist=[];setAll();ctr.set(count());pips.set(0);labels();ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin||cur===0)return null;var s=minSol(n,cur),q=-1;for(var p=0;p<N;p++)if((s>>p)&1){if(q<0||!on(p))q=p;if(!on(p))break}
      hints++;ZK.unmark(stage);
      if(lv<=1){var reg=[];for(var p2=0;p2<N;p2++)if((E[q]>>p2)&1)reg.push(cells[p2]);ZK.mark(reg);return 'Look around here.'}
      if(lv===2){ZK.mark(cells[q]);return on(q)?'Try this light.':'Try this one, even though it is off.'}
      tap(q);return 'Tapped one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{lit:count(),moves:hist.length,fin:fin}}}}

ZK.override({id:ID,name:'Switch Off',family:'grid',theme:'F10',calm:true,
  blurb:'Tap the lights until every one is off.',
  how:'A tap switches a light and the lights above, below and beside it. Make the board dark.',
  areas:['control','flex'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'All dark in '+m+' tap'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
