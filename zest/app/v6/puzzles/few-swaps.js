/* Zest v6: Few Swaps. Overrides the puzzles_a.js entry; the original stays in ZK.orig['few-swaps'].
   Put a row of coloured tiles back in rainbow order by swapping two at a time, in as few swaps as possible.
   par = n - cycles(permutation): exact (a swap inside one cycle splits it and gains one; a swap across two cycles merges them and loses one).
   v5 mixed shapes and numbers, and par came from a random shuffle. Now: n and par follow a ladder table (n 4 to 15, par 2 to 12, with dips after climbs);
   from level 4, whenever there is more than one cycle, at least one 2-cycle exists (two tiles that sit in each other's place: one swap fixes both),
   and from level 6 there is a cycle of 3 or more: the aha is to notice which tiles belong together, and that swapping tiles from different groups wastes a swap.
   Board: a hue ramp (tile colour = its home), each slot shows a small colour swatch, the counter is tiles still out of place, a tile in its home slot gets a tick;
   a wasted swap (one that merges two groups) shows the amber 'mm' response. Tap one tile then another; the swap is an arc. */
(function(){
var ID='few-swaps';
var N=[4,4,5,5,5,6,6,6,7, 7,8,8,8,9,9,9,10, 10,10,11,11,12,12,12,13,13,14,14,15,15],
    PAR=[2,3,3,3,4,4,4,5,4, 5,6,5,6,7,6,7,8, 6,7,8,7,9,8,9,10,9,11,10,12,11,12];
function cyclesOf(p){var seen=[],out=[],i,j;for(i=0;i<p.length;i++)if(!seen[i]){var c=[];j=i;while(!seen[j]){seen[j]=1;c.push(j);j=p[j]-1}out.push(c)}return out}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var n=N[level-1],par=PAR[level-1],base=[],i,best=null,bs=1e9;for(i=1;i<=n;i++)base.push(i);
  for(var t=0;t<4000;t++){var p=pzShuffle(base,rng),cy=cyclesOf(p),pr=n-cy.length;if(pr!==par)continue;
    var ok=true,two=cy.some(function(c){return c.length===2}),big=cy.some(function(c){return c.length>=3}),fixed=cy.filter(function(c){return c.length===1}).length;
    if(level>=4&&cy.length>=2&&!two)ok=false;if(level>=6&&!big)ok=false;if(fixed>(level<=3?0:1))ok=false;
    if(level<=3&&cy.length>=2&&!two)ok=false;
    var sc=ok?0:1;if(sc<bs){bs=sc;best=p}if(ok)break}
  if(!best){for(var t2=0;t2<4000&&!best;t2++){var p2=pzShuffle(base,rng);if(n-cyclesOf(p2).length===par)best=p2}}
  return{title:'Level '+level,level:level,n:n,items:best,par:par,parExact:true,aha:bs===0}}
window.V6FS={make:make,cyclesOf:cyclesOf,N:N,PAR:PAR};

var CSS=''
+'.fs{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:var(--font);--fs-l:72%;--fs-s:78%}'
+':root[data-theme="dark"] .fs{--fs-l:62%;--fs-s:70%}'
+'.fs-top{display:flex;align-items:center;justify-content:center;gap:12px;min-height:34px}'
+'.fs-board{position:relative;width:100%;box-sizing:border-box;padding:10px;border-radius:22px;background:var(--panel,rgba(120,110,95,.14));box-shadow:inset 0 0 0 1.5px var(--line,#ddd);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.fs-in{position:relative;width:100%}'
+'.fs-s{position:absolute;left:0;top:0;border-radius:14px;box-shadow:inset 0 0 0 2px var(--edge,#cfc7b8);background:var(--surface,#fff);opacity:.9}'
+'.fs-s i{position:absolute;left:25%;right:25%;bottom:6px;height:5px;border-radius:3px}'
+'.fs-t{all:unset;position:absolute;left:0;top:0;box-sizing:border-box;border-radius:14px;display:flex;align-items:center;justify-content:center;font:800 1.25rem/1 var(--font);color:#1B1916;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .34s '+ZK.SPRING+',box-shadow .15s;box-shadow:inset 0 -4px 0 rgba(0,0,0,.18);z-index:1}'
+'.fs-t:focus-visible{outline:3px solid var(--ink,#000);outline-offset:2px}'
+'.fs-t.up{z-index:3;box-shadow:inset 0 -4px 0 rgba(0,0,0,.18),0 0 0 4px var(--ink,#111),0 8px 14px rgba(0,0,0,.25)}'
+'.fs-t.fly{z-index:2}'
+'.fs-t.home::after{content:"";position:absolute;right:5px;top:5px;width:9px;height:9px;border-radius:50%;background:#1B1916;opacity:.55}'
+'.fs-t.bad{box-shadow:inset 0 -4px 0 rgba(0,0,0,.18),0 0 0 4px #E9A23B}'
+'.fs-t.pv{transition:transform .06s ease-out}'
+'@media (max-width:359px){.fs{width:calc(100% + 16px);max-width:none;margin:0 -8px}.fs-board{padding:6px}.fs-t{font-size:1.125rem}}'
+'@media (prefers-reduced-motion:reduce){.fs-t{transition:none}}.fs.zk-rm .fs-t{transition:none}';

function mount(root,inst,api){ZK.css(CSS,'fsw-css');root.textContent='';
  var n=inst.n,cols=n<=6?n:5,rows=Math.ceil(n/cols),rm=ZK.rm(api),cur=inst.items.slice(),hist=[],hints=0,undos=0,fin=false,last=null,sel=-1,ghost=null,idle=null,offs=[],tiles=[],slots=[],geo={s:44,g:5},i;
  var stage=document.createElement('div');stage.className='fs zk-stage zk-host'+(rm?' zk-rm':'');
  var ctr=ZK.counter({icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h13l-3-3M20 16H7l3 3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',label:function(k){return k===0?'All in place':k+' tile'+(k===1?'':'s')+' out of place'}}),pips=ZK.pips(inst.par);
  var top=document.createElement('div');top.className='fs-top';top.appendChild(ctr.el);
  var board=document.createElement('div');board.className='fs-board zk-board';board.setAttribute('role','group');board.setAttribute('aria-label','Tiles in a row');
  var inn=document.createElement('div');inn.className='fs-in';board.appendChild(inn);
  function hue(v){return Math.round((v-1)*(300/Math.max(1,n-1)))}
  function col(v){return 'hsl('+hue(v)+' 85% var(--fs-l))'}
  for(i=0;i<n;i++){var sl=document.createElement('div');sl.className='fs-s';sl.innerHTML='<i style="background:hsl('+hue(i+1)+' 85% 60%)"></i>';slots.push(sl);inn.appendChild(sl)}
  for(i=1;i<=n;i++)(function(v){var b=document.createElement('button');b.type='button';b.className='fs-t';b.setAttribute('data-zkc','');b.setAttribute('data-v',v);b.textContent=v;b.style.background=col(v);b.onclick=function(){tap(v)};tiles[v]=b;inn.appendChild(b)})(i);
  stage.appendChild(top);stage.appendChild(board);stage.appendChild(pips.el);root.appendChild(stage);
  function layout(){var W=inn.clientWidth||300,g=cols>=6?4:6,s=Math.floor((W-(cols-1)*g)/cols);geo={s:s,g:g};inn.style.height=(rows*s+(rows-1)*g)+'px';
    slots.forEach(function(sl,k){sl.style.width=sl.style.height=s+'px';sl.style.transform='translate('+(k%cols)*(s+g)+'px,'+Math.floor(k/cols)*(s+g)+'px)'});
    tiles.forEach(function(t){if(t){t.style.width=t.style.height=s+'px'}});place(true)}
  function posOf(k){return 'translate('+(k%cols)*(geo.s+geo.g)+'px,'+Math.floor(k/cols)*(geo.s+geo.g)+'px)'}
  function place(instant){tiles.forEach(function(t,v){if(!t)return;var k=cur.indexOf(v);if(instant){var tr=t.style.transition;t.style.transition='none';t.style.transform=posOf(k)+(sel===k?' translateY(-5px) scale(1.06)':'');void t.offsetWidth;t.style.transition=tr}
      else t.style.transform=posOf(k)+(sel===k?' translateY(-5px) scale(1.06)':'')})}
  function out(){var k=0;for(var q=0;q<n;q++)if(cur[q]!==q+1)k++;return k}
  function remain(p){return n-cyclesOf(p).length}
  function paint(){tiles.forEach(function(t,v){if(!t)return;var k=cur.indexOf(v);t.classList.toggle('home',v===k+1);t.classList.toggle('up',sel===k);t.setAttribute('aria-label','Tile '+v+', position '+(k+1)+(v===k+1?', in place':'')+(sel===k?', picked':''))});ctr.set(out())}
  var ro=null;try{ro=new ResizeObserver(function(){layout()});ro.observe(inn)}catch(e){window.addEventListener('resize',layout);offs.push(function(){window.removeEventListener('resize',layout)})}
  layout();paint();ctr.set(out(),true);
  function tapK(k){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    if(sel<0){sel=k;place();paint();ZK.sfx('lift');ZK.buzz('tap');return}
    if(sel===k){sel=-1;place();paint();ZK.sfx('undo');return}
    var a=sel;sel=-1;swap(a,k)}
  function tap(v){tapK(cur.indexOf(v))}
  function swap(a,b,silent){var before=remain(cur),va=cur[a],vb=cur[b];cur[a]=vb;cur[b]=va;hist.push([a,b]);last=tiles[va];api.moved();var after=remain(cur);
    tiles[va].classList.add('fly');tiles[vb].classList.add('fly');setTimeout(function(){tiles[va].classList.remove('fly');tiles[vb].classList.remove('fly')},380);
    place();paint();pips.set(hist.length);
    if(!silent){ZK.sfx('slide');ZK.buzz('move')}
    if(after>=before&&!silent){[tiles[va],tiles[vb]].forEach(function(t){t.classList.add('bad');setTimeout(function(){t.classList.remove('bad')},520)});ZK.wrong(null,{});api.say('That swap did not get closer.')}
    else if(!silent){var goodHome=(cur[a]===a+1)+(cur[b]===b+1);if(goodHome){setTimeout(function(){ZK.sfx('cap',{n:goodHome})},120);if(!rm)[a,b].forEach(function(k){if(cur[k]===k+1)ZK.anim(tiles[cur[k]],[{scale:'1'},{scale:'1.15'},{scale:'1'}],300,ZK.SPRING,200)})}}
    if(out()===0){fin=true;api.say('All in order.');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:300)}}
  function undo(){if(fin||!hist.length)return false;var h=hist.pop(),a=h[0],b=h[1],t=cur[a];cur[a]=cur[b];cur[b]=t;undos++;sel=-1;place();paint();pips.set(hist.length);ZK.unmark(stage);ZK.sfx('undo');ZK.buzz('tap');return true}
  function L(t,ty,fn){t.addEventListener(ty,fn);offs.push(function(){t.removeEventListener(ty,fn)})}
  L(stage,'pointerdown',function(e){var c=e.target.closest&&e.target.closest('button.fs-t');if(c&&!fin){c.classList.add('pv');ZK.sfx('press')}});
  function unpv(){tiles.forEach(function(t){if(t)t.classList.remove('pv')})}L(document,'pointerup',unpv);L(document,'pointercancel',unpv);
  /* the helpful swap: a 2-cycle if there is one, else send a tile home from the first cycle */
  function nextSwap(){var cy=cyclesOf(cur).filter(function(c){return c.length>1});if(!cy.length)return null;var c2=cy.filter(function(c){return c.length===2})[0],c=c2||cy[0];
    var k=c[0],home=cur[k]-1;return{cycle:c,a:k,b:home,two:!!c2}}
  if(inst.level===1){var ns=nextSwap();if(ns){var ta=tiles[cur[ns.a]],tb=tiles[cur[ns.b]];
    ghost=ZK.ghost(stage,[{tap:ta,down:function(){sel=ns.a;place();paint()},hold:700},{tap:tb,down:function(){tb.classList.add('pv')},up:function(){tb.classList.remove('pv');sel=-1;place();paint()},cancel:function(){tb.classList.remove('pv');if(!hist.length){sel=-1;place();paint()}},hold:700}],{id:ID,level:1})}}
  idle=ZK.idle(stage,25000);
  return{undo:undo,
    restart:function(){if(fin)return;cur=inst.items.slice();hist=[];sel=-1;place();paint();pips.set(0);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var s=nextSwap();if(!s)return null;hints++;ZK.unmark(stage);
      if(lv<=1){ZK.mark(s.cycle.map(function(k){return tiles[cur[k]]}));return s.cycle.length===2?'These two sit in each other’s place.':'These tiles belong together: each sits in another’s place.'}
      if(lv===2){ZK.mark([tiles[cur[s.a]],tiles[cur[s.b]]]);return 'Swap these two. One lands in its place.'}
      sel=-1;swap(s.a,s.b,true);ZK.sfx('slide');return 'Swapped for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();if(ro)ro.disconnect();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{cur:cur.slice(),moves:hist.length,fin:fin,sel:sel}}}}

ZK.override({id:ID,name:'Few Swaps',family:'move',theme:'F10',
  blurb:'Put a row in order with as few swaps as you can.',
  how:'Tap two tiles to swap them. Restore the rainbow order in the fewest swaps.',
  areas:['space','flex'],levels:30,secs:60,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||m;return{stars:pzStarsByPar(m,p,res.hints),line:m<=p?'In order in '+m+' swap'+(m===1?'':'s')+', the fewest possible.':'In order in '+m+' swaps. The fewest is '+p+'.'}}});
})();
