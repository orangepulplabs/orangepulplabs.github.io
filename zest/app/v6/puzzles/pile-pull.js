/* Zest v6: Pile Pull (a three-pile take-away game against the computer). Overrides the puzzles_d1.js entry; the original stays in ZK.orig['pile-pull'].
   Three piles of stones. A move: tap a stone to take it and every stone beyond it in its row. Whoever takes the last stone wins. The computer answers after each of your moves
   (the original rule, ppComputer, unchanged). par = the fewest of your moves that win against that reply (PZD1.pp.best, exact).
   v5: tiny stones in tall columns, three paragraphs of rules, a hint (level 1) that spelt the whole binary secret, and a flat pile-size ladder.
   Now: three rows of big pebbles (one stone per at least 44 px wide), a press preview that lifts exactly the stones you would take, the computer's reply drawn as its stones lifting away,
   a turn marker with no words, and the secret is yours to find: hint 1 only points at the pile that holds the winning move.
   Ladder: the largest pile is 3 (levels 1-3), 4 (4-8), 5 (9-14), 6 (15-30); par 2,2,3,3,4,3,4,5 | 3,4,5,4,5,6 | 4,5,6,5,6,7,5,6,7,6,7,6,7,6,7,7, a dip after each climb; positions come from every start with par = the target,
   shuffled between rows. Aha filter: from level 3 the winning first move is UNIQUE (and never 'take everything'), so the player has to find the one balancing move.
   A stuck chip with Undo shows when the computer takes the last stone or no winning line is left. */
(function(){
var ID='pile-pull',PP=PZD1.pp;
var PAR=[2,2,3,3,4,3,4,5, 3,4,5,4,5,6, 4,5,6,5,6,7,5,6,7,6,7,6,7,6,7,7];
function maxPile(level){return level<=3?3:level<=8?4:level<=14?5:6}
function tot(p){return p[0]+p[1]+p[2]}
function valueAfter(p,i,n){var q=p.slice();q[i]-=n;if(tot(q)===0)return 1;var c=PP.computer(q).s;if(tot(c)===0)return Infinity;var f=PP.best(c);return f===Infinity?Infinity:1+f}
function winMoves(p){var b=PP.best(p),o=[];for(var i=0;i<3;i++)for(var n=1;n<=p[i];n++)if(valueAfter(p,i,n)===b)o.push({i:i,n:n});return o}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var m=maxPile(level),par=PAR[level-1],c=[],cu=[],a,b,d;
  for(a=1;a<=m;a++)for(b=a;b<=m;b++)for(d=b;d<=m;d++){var p=[a,b,d];if(PP.xor(p)===0)continue;var v=PP.best(p);if(v!==par)continue;
    c.push(p);var w=winMoves(p);if(w.length===1)cu.push(p)}
  var pool=level>=3&&cu.length?cu:c;if(!pool.length){pool=[];for(a=1;a<=m;a++)for(b=a;b<=m;b++)for(d=b;d<=m;d++)if(PP.xor([a,b,d])&&PP.best([a,b,d])<Infinity)pool.push([a,b,d])}
  var sel=pool[pzInt(rng,pool.length)],piles=pzShuffle(sel,rng);
  return{level:level,title:'Level '+level,piles:piles,par:PP.best(piles),aha:level<3||cu.length>0}}
window.V6PP={make:make,PAR:PAR,maxPile:maxPile,winMoves:winMoves,valueAfter:valueAfter};

var CSS=''
+'.pp{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:var(--font)}'
+'.pp-top{display:flex;align-items:center;justify-content:center;gap:10px;min-height:38px}'
+'.pp-turn{display:flex;align-items:center;justify-content:center;gap:8px;min-width:104px;height:38px;padding:0 14px;border-radius:19px;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--line,#ddd);font:800 .9375rem/1 var(--font);color:var(--ink,#111);transition:background .2s}'
+'.pp-turn svg{width:20px;height:20px}.pp-turn.me{background:var(--accent,#E8590C);color:var(--on-accent,#1B1916);box-shadow:none}'
+'.pp-turn .dots{display:flex;gap:4px}.pp-turn .dots i{width:6px;height:6px;border-radius:50%;background:var(--muted,#5f5a52);animation:ppd 1s infinite}.pp-turn .dots i:nth-child(2){animation-delay:.15s}.pp-turn .dots i:nth-child(3){animation-delay:.3s}@keyframes ppd{0%,100%{opacity:.25}50%{opacity:1}}'
+'.pp-board{position:relative;display:flex;flex-direction:column;gap:10px;width:100%;box-sizing:border-box;padding:12px;border-radius:22px;background:var(--panel,rgba(120,110,95,.14));box-shadow:inset 0 0 0 1.5px var(--line,#ddd);touch-action:manipulation;user-select:none;-webkit-user-select:none;min-height:230px;justify-content:center}'
+'.pp-row{display:flex;gap:var(--ppg,4px);min-height:56px;align-items:center;padding:2px 0;border-radius:30px}'
+'.pp-row.zk-mark{outline-offset:2px}'
+'.pp-s{all:unset;position:relative;box-sizing:border-box;flex:0 0 var(--pps,44px);width:var(--pps,44px);height:52px;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .2s '+ZK.SPRING+',opacity .2s}'
+'.pp-s i{display:block;width:calc(var(--pps,44px) - 4px);height:calc(var(--pps,44px) - 4px);border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--pp-hi,#E7D9C2),var(--pp-lo,#A58E6E));box-shadow:inset 0 -4px 0 rgba(0,0,0,.2),0 2px 3px rgba(0,0,0,.18)}'
+'.pp-s:nth-child(even) i{background:radial-gradient(circle at 35% 30%,var(--pp-hi2,#D9E2E4),var(--pp-lo2,#7F9498))}'
+'.pp-s:focus-visible{outline:3px solid var(--ink,#000);outline-offset:-2px;border-radius:12px}'
+'.pp-s.pv{transform:translateY(-8px)}.pp-s.pv i{box-shadow:0 0 0 4px var(--accent,#E8590C),inset 0 -4px 0 rgba(0,0,0,.2),0 8px 10px rgba(0,0,0,.25)}'
+'.pp-s.zk-mark i{box-shadow:0 0 0 3px var(--ink,#111)}'
+'.pp-s.off{pointer-events:none}'
+'.pp-empty{width:100%;height:4px;border-radius:2px;background:var(--line,#ddd);align-self:center}'
+'.pp{--pp-hi:#E7D9C2;--pp-lo:#A58E6E;--pp-hi2:#D9E2E4;--pp-lo2:#7F9498}:root[data-theme="dark"] .pp{--pp-hi:#CDBB9D;--pp-lo:#8B7656;--pp-hi2:#B9C7CA;--pp-lo2:#667B7F}'
+'@media (max-width:359px){.pp{width:calc(100% + 16px);max-width:none;margin:0 -8px}.pp-board{padding:8px}}'
+'@media (prefers-reduced-motion:reduce){.pp-s{transition:none}.pp-turn .dots i{animation:none}}.pp.zk-rm .pp-s{transition:none}.pp.zk-rm .pp-turn .dots i{animation:none}';
var HAND='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 14.5a1.5 1.5 0 0 1 2.4-1.7L9 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function mount(root,inst,api){ZK.css(CSS,'pp-css');root.textContent='';
  var rm=ZK.rm(api),p=inst.piles.slice(),stack=[],hints=0,undos=0,fin=false,lost=false,busy=false,last=null,rows=[],ghost=null,idle=null,offs=[],pv=null,tms=[],taps=0,mx=Math.max.apply(null,inst.piles);
  var stage=document.createElement('div');stage.className='pp zk-stage zk-host'+(rm?' zk-rm':'');
  var turn=document.createElement('div');turn.className='pp-turn me';turn.setAttribute('role','status');
  var top=document.createElement('div');top.className='pp-top';top.appendChild(turn);
  var pips=ZK.pips(inst.par);
  var board=document.createElement('div');board.className='pp-board zk-board';board.setAttribute('role','group');board.setAttribute('aria-label','Three piles of stones');
  stage.appendChild(top);stage.appendChild(board);stage.appendChild(pips.el);root.appendChild(stage);
  function T(fn,ms){var t=setTimeout(fn,ms);tms.push(t);return t}
  function sizeStones(){var bw=board.clientWidth,g=bw<330?1:4,W=bw-(bw<330?16:24)-2,pps=Math.max(38,Math.min(60,Math.floor((W-(mx-1)*g)/mx)));board.style.setProperty('--pps',pps+'px');board.style.setProperty('--ppg',g+'px')}
  function setTurn(mine){turn.className='pp-turn'+(mine?' me':'');turn.innerHTML=mine?HAND+'<span>You</span>':'<span class="dots"><i></i><i></i><i></i></span>';turn.setAttribute('aria-label',mine?'Your move':'The computer is thinking')}
  function draw(){board.textContent='';rows=[];
    p.forEach(function(size,r){var row=document.createElement('div');row.className='pp-row';row.setAttribute('role','group');row.setAttribute('aria-label','Pile '+(r+1)+', '+size+' stone'+(size===1?'':'s'));rows.push(row);
      if(!size){var e=document.createElement('div');e.className='pp-empty';row.appendChild(e)}
      for(var k=0;k<size;k++)(function(k){var b=document.createElement('button');b.type='button';b.className='pp-s';b.setAttribute('data-zkc','');b.setAttribute('aria-label','Take '+(size-k)+' stone'+(size-k===1?'':'s')+' from pile '+(r+1));b.innerHTML='<i></i>';
        b.onclick=function(){take(r,size-k,b)};row.appendChild(b)})(k);
      board.appendChild(row)});sizeStones()}
  function preview(r,k,on){var row=rows[r];if(!row)return;for(var j=k;j<row.children.length;j++)row.children[j].classList.toggle('pv',on)}
  function clearPv(){if(pv){preview(pv[0],pv[1],false);pv=null}}
  function take(r,n,el){if(fin||lost||busy||p[r]<n)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);clearPv();
    stack.push(p.slice());taps++;api.moved();pips.set(taps);last=el;
    var k0=p[r]-n,row=rows[r];
    if(!rm)for(var j=k0;j<row.children.length;j++)(function(c,w){ZK.anim(c,[{transform:'translateY(0)',opacity:1},{transform:'translate(26px,-16px) scale(.7)',opacity:0}],260,ZK.EASE,w*40,'forwards')})(row.children[j],j-k0);
    ZK.sfx('pop');ZK.buzz('pop');
    p[r]-=n;
    if(tot(p)===0){fin=true;busy=true;setTimeout(function(){draw();api.say('You took the last stone. You win.');api.done({solved:true,moves:taps,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:300);return}
    busy=true;setTurn(false);
    T(function(){if(fin)return;var c=PP.computer(p),row2=rows[c.m.i],k1=p[c.m.i]-c.m.n;
      if(!rm&&row2)for(var j2=k1;j2<row2.children.length;j2++)ZK.anim(row2.children[j2],[{transform:'translateY(0)',opacity:1},{transform:'translate(26px,-16px) scale(.7)',opacity:0}],260,ZK.EASE,(j2-k1)*40,'forwards');
      ZK.sfx('clack');
      T(function(){if(fin)return;p=c.s;draw();busy=false;
        if(tot(p)===0){lost=true;setTurn(true);ZK.stuck(stage,true,{text:'The computer took the last stone',onUndo:undo});api.say('The computer took the last stone. Undo and try another move.');return}
        setTurn(true);
        if(PP.best(p)===Infinity){lost=true;ZK.stuck(stage,true,{text:'No winning line from here',onUndo:undo});api.say('No winning line from here. Undo to step back.')}},rm?0:300)},rm?0:560)}
  function undo(){if(fin||busy&&!lost||!stack.length)return false;tms.forEach(clearTimeout);tms=[];p=stack.pop();taps--;undos++;lost=false;busy=false;pips.set(Math.max(0,taps));draw();setTurn(true);ZK.stuck(stage,false);ZK.unmark(stage);ZK.sfx('undo');ZK.buzz('tap');return true}
  function L(t,ty,fn){t.addEventListener(ty,fn);offs.push(function(){t.removeEventListener(ty,fn)})}
  L(board,'pointerdown',function(e){var b=e.target.closest&&e.target.closest('.pp-s');if(!b||fin||busy||lost)return;var row=b.parentNode,r=rows.indexOf(row),k=[].indexOf.call(row.children,b);clearPv();pv=[r,k];preview(r,k,true);ZK.sfx('press')});
  L(document,'pointerup',clearPv);L(document,'pointercancel',clearPv);
  var ro=null;try{ro=new ResizeObserver(sizeStones);ro.observe(board)}catch(e){}
  draw();setTurn(true);
  function best(){var w=winMoves(p);return w.length?w[0]:null}
  if(inst.level===1){var wm=best();if(wm){var k0=p[wm.i]-wm.n,sb=rows[wm.i].children[k0];
    ghost=ZK.ghost(stage,[{tap:sb,down:function(){preview(wm.i,k0,true)},up:function(){preview(wm.i,k0,false)},cancel:function(){preview(wm.i,k0,false)},hold:900}],{id:ID,level:1})}}
  idle=ZK.idle(stage,25000);
  return{undo:undo,
    restart:function(){if(fin)return;tms.forEach(clearTimeout);tms=[];p=inst.piles.slice();stack=[];taps=0;lost=false;busy=false;pips.set(0);draw();setTurn(true);ZK.stuck(stage,false);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin||lost||busy)return null;var w=best();if(!w)return null;hints++;ZK.unmark(stage);var k0=p[w.i]-w.n;
      if(lv<=1){ZK.mark(rows[w.i]);return 'One pile holds the winning move.'}
      if(lv===2){ZK.mark(rows[w.i].children[k0]);return 'Take from here: this stone and the ones beyond it.'}
      take(w.i,w.n,rows[w.i].children[k0]);return 'Took '+w.n+' stone'+(w.n===1?'':'s')+' for you.'},
    destroy:function(){tms.forEach(clearTimeout);if(ghost)ghost.stop();if(idle)idle.stop();if(ro)ro.disconnect();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{p:p.slice(),moves:taps,fin:fin,lost:lost,busy:busy}}}}

ZK.override({id:ID,name:'Pile Pull',family:'number',theme:'F6',areas:['control','flex'],levels:30,secs:75,
  blurb:'Take stones so that the last stone is yours.',
  how:'Tap a stone to take it and the ones beyond it. Take the last stone to win.',
  make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves||0,h=res.hints||0,s=m<=p?3:m<=p+2?2:1;if(h&&s===3)s=2;
    return{stars:s,line:m<=p?'Won in '+m+' move'+(m===1?'':'s')+', the fewest possible.':'Won in '+m+' moves. The fewest is '+p+'.'}}});
})();
