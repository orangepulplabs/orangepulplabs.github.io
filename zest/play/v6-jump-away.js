/* Zest v6 pilot: Jump Away (peg solitaire), absorbing Jump Line as board shapes. Overrides puzzles_d3.js 'jump-away' (original kept in ZK.orig).
   Rule: a peg jumps over a neighbouring peg, in a straight line, into the empty hole beyond; the jumped peg is removed. Goal: one peg left.
   Boards: a row, a small plus, squares, a diamond, a fat cross, the 33-hole cross and the 37-hole round board (Jump Line's idea of shapes).
   Levels are CURATED: tests/gen_jump.js builds each start by reversing jumps from one peg (so it is always solvable), then scores it by the exact
   chance that random legal play wins (P). Easy levels have P near 1; the ladder lowers P with sawtooth breathers, and from level 3 every level
   has at least one losing first move (a trap: the aha). make() returns the curated level under a random symmetry of its board (same P, same par).
   par = pegs - 1 (every win takes exactly that many jumps). Stuck signal: no jumps left, or (exact search) no way left to reach one peg. */
(function(){
var ID='jump-away';
var SHAPES={
  row:['xxx'],
  plus:['..x..','..x..','xxxxx','..x..','..x..'],
  sq3:['xxx','xxx','xxx'],
  sq4:['xxxx','xxxx','xxxx','xxxx'],
  diamond:['..x..','.xxx.','xxxxx','.xxx.','..x..'],
  cross:['.xxx.','xxxxx','xxxxx','xxxxx','.xxx.'],
  english:['..xxx..','..xxx..','xxxxxxx','xxxxxxx','xxxxxxx','..xxx..','..xxx..'],
  french:['..xxx..','.xxxxx.','xxxxxxx','xxxxxxx','xxxxxxx','.xxxxx.','..xxx..']};
var GEO={};
/* geometry: holes (r,c), index map, jump triples [from, over, to] */
function geo(name){if(GEO[name])return GEO[name];var rows=SHAPES[name],R=rows.length,C=rows[0].length,rc=[],idx={},tr=[],r,c;
  for(r=0;r<R;r++)for(c=0;c<C;c++)if(rows[r].charAt(c)==='x'){idx[r*C+c]=rc.length;rc.push([r,c])}
  function at(r,c){if(r<0||c<0||r>=R||c>=C)return -1;var k=idx[r*C+c];return k===undefined?-1:k}
  rc.forEach(function(p,a){[[0,1],[1,0],[0,-1],[-1,0]].forEach(function(d){var b=at(p[0]+d[0],p[1]+d[1]),t=at(p[0]+2*d[0],p[1]+2*d[1]);if(b>=0&&t>=0)tr.push([a,b,t])})});
  var g={name:name,R:R,C:C,rc:rc,n:rc.length,at:at,tr:tr,byFrom:[],byTo:[]};for(var i=0;i<g.n;i++){g.byFrom.push([]);g.byTo.push([])}
  tr.forEach(function(t){g.byFrom[t[0]].push(t);g.byTo[t[2]].push(t)});return GEO[name]=g}
function key(s){var k=0,p=1;for(var i=0;i<s.length;i++){if(s[i])k+=p;p*=2}return k}
function legal(g,s){var o=[];for(var i=0;i<g.tr.length;i++){var t=g.tr[i];if(s[t[0]]&&s[t[1]]&&!s[t[2]])o.push(t)}return o}
function count(s){var n=0;for(var i=0;i<s.length;i++)n+=s[i];return n}
/* exact: can this position still reach one peg? memo by board key; cap = max positions explored (returns null when capped) */
function winnable(g,s,cap,memo){memo=memo||new Map();var nodes=0,capped=false;
  function rec(s,k){if(count(s)===1)return true;if(memo.has(k))return memo.get(k);if(++nodes>cap){capped=true;return false}
    var ms=legal(g,s),res=false;for(var i=0;i<ms.length&&!res;i++){var t=ms[i];s[t[0]]=0;s[t[1]]=0;s[t[2]]=1;
      var nk=k-Math.pow(2,t[0])-Math.pow(2,t[1])+Math.pow(2,t[2]);res=rec(s,nk);s[t[0]]=1;s[t[1]]=1;s[t[2]]=0;if(capped)return false}
    memo.set(k,res);return res}
  var r=rec(s.slice(),key(s));return capped?null:r}
/* a winning next jump (or null), using the same exact search */
function nextWin(g,s,cap){var memo=new Map(),ms=legal(g,s);for(var i=0;i<ms.length;i++){var t=ms[i],x=s.slice();x[t[0]]=0;x[t[1]]=0;x[t[2]]=1;var w=winnable(g,x,cap,memo);if(w)return t}return null}
/* P = chance that uniformly random legal play wins (exact) */
function pRandom(g,s){var memo=new Map();function rec(s,k){if(count(s)===1)return 1;if(memo.has(k))return memo.get(k);var ms=legal(g,s),p=0;
    for(var i=0;i<ms.length;i++){var t=ms[i];s[t[0]]=0;s[t[1]]=0;s[t[2]]=1;p+=rec(s,k-Math.pow(2,t[0])-Math.pow(2,t[1])+Math.pow(2,t[2]));s[t[0]]=1;s[t[1]]=1;s[t[2]]=0}
    p=ms.length?p/ms.length:0;memo.set(k,p);return p}return rec(s.slice(),key(s))}
/* reverse jumps from one peg: always solvable */
function reverseBuild(g,end,k,rng){var s=new Array(g.n).fill(0);s[end]=1;
  for(var i=0;i<k;i++){var c=[];g.tr.forEach(function(t){if(s[t[2]]&&!s[t[1]]&&!s[t[0]])c.push(t)});if(!c.length)return null;var t=c[pzInt(rng,c.length)];s[t[2]]=0;s[t[1]]=1;s[t[0]]=1}
  return s}
/* the 8 symmetries of a square frame; a symmetry is used only if it maps the board onto itself */
function syms(g){var out=[],R=g.R,C=g.C;
  [function(r,c){return[r,c]},function(r,c){return[r,C-1-c]},function(r,c){return[R-1-r,c]},function(r,c){return[R-1-r,C-1-c]},
   function(r,c){return[c,r]},function(r,c){return[c,R-1-r]},function(r,c){return[C-1-c,r]},function(r,c){return[C-1-c,R-1-r]}].forEach(function(f,i){
    if(i>=4&&R!==C)return;var map=[];for(var a=0;a<g.n;a++){var q=f(g.rc[a][0],g.rc[a][1]),b=g.at(q[0],q[1]);if(b<0)return;map.push(b)}out.push(map)});return out}
/* curated ladder, from tests/gen_jump.js: [shape, pegs (as hole indices), P (random-play win chance), traps (losing first moves)] */
var LEVELS=[["row",[1,2],1,0],["plus",[5,6,7],1,0],["plus",[3,4,7,8],0.333,2],["diamond",[1,6,7,10],0.5,2],["diamond",[2,4,5,6,10],0.333,1],["sq4",[1,2,11,15],0.5,1],["sq4",[2,4,5,6,11,13],0.25,1],["diamond",[0,2,7,8,10,12],0.333,1],["diamond",[2,4,5,6,7,8,12],0.167,1],["cross",[0,1,5,6,10,19],0.313,2],["cross",[1,2,5,6,15,16,19],0.148,2],["cross",[9,10,12,13,14,16,17,19],0.0969,3],["sq4",[4,5,6,7,9,11,14],0.144,2],["english",[3,4,6,7,9,22,23],0.119,1],["english",[14,15,17,18,21,28,29,30],0.0776,2],["sq4",[0,2,3,9,10,11,14,15],0.0999,1],["english",[3,8,18,24,27,28,29,30,31],0.0599,2],["english",[13,15,17,18,20,24,25,28,29,30],0.0399,3],["french",[1,3,4,13,14,27,32,33,36],0.059,1],["cross",[5,6,7,9,10,12,14,16],0.0987,2],["english",[0,4,5,10,11,20,21,23,27,28],0.0307,4],["french",[1,3,5,6,7,8,16,23,27,28,32],0.0279,1],["english",[0,1,3,4,10,14,15,17,18,21,22],0.0179,2],["french",[1,5,8,10,15,19,20,21,23,25,26,33],0.0171,1],["cross",[3,4,5,8,9,10,11,12,15],0.0601,1],["english",[0,1,3,5,9,13,14,22,23,24,28,29],0.0115,2],["french",[0,5,6,10,11,13,22,23,26,27,30,32,33],0.0101,3],["english",[2,3,5,10,11,15,16,17,18,19,22,28,32],0.00789,2],["french",[2,4,5,6,9,11,19,23,25,29,31],0.0219,2],["french",[1,3,5,8,9,15,18,19,21,23,27,28,31,35],0.00525,1]]; /*LEVELS*/
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var L=LEVELS[level-1],g=geo(L[0]),S=syms(g),map=S[pzInt(rng,S.length)],st=new Array(g.n).fill(0);
  L[1].forEach(function(h){st[map[h]]=1});var n=L[1].length;
  return{level:level,title:'Level '+level,shape:L[0],start:st,par:n-1,parExact:true,p:L[2],traps:L[3]}}
window.V6JA={SHAPES:SHAPES,geo:geo,legal:legal,winnable:winnable,nextWin:nextWin,pRandom:pRandom,reverseBuild:reverseBuild,syms:syms,make:make,levels:function(){return LEVELS}};

var CSS=''
+'.ja{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:var(--font);--ja-wood:#E9D6B5;--ja-wood2:#D9BF94;--ja-hole:#B79A6E;--ja-peg1:#FF9A4D;--ja-peg2:#D9480F;--ja-peg3:#7A2500}'
+':root[data-theme="dark"] .ja{--ja-wood:#3A3127;--ja-wood2:#2C251D;--ja-hole:#1A1612;--ja-peg1:#FFB27A;--ja-peg2:#F06A1F;--ja-peg3:#8A3000}'
+'.ja-board{position:relative;display:grid;gap:4px;padding:12px;box-sizing:border-box;border-radius:26px;background:radial-gradient(120% 90% at 30% 20%,var(--ja-wood),var(--ja-wood2));box-shadow:inset 0 2px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(0,0,0,.12),0 6px 18px rgba(60,30,0,.14);touch-action:none;user-select:none;-webkit-user-select:none}'
+'.ja-h{all:unset;position:relative;aspect-ratio:1;width:calc(var(--jc) + 2*var(--jo));height:calc(var(--jc) + 2*var(--jo));margin:calc(-1*var(--jo));cursor:pointer;border-radius:50%;display:flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent}'
+'.ja-h::before{content:"";position:absolute;inset:calc(var(--jo) + var(--jc)*.22);border-radius:50%;background:var(--ja-hole);box-shadow:inset 0 3px 4px rgba(0,0,0,.35),0 1px 0 rgba(255,255,255,.35)}'
+'.ja-h:focus-visible{outline:3px solid var(--ink);outline-offset:-2px}'
+'.ja-h.tg::after{content:"";position:absolute;inset:calc(var(--jo) + var(--jc)*.12);border-radius:50%;box-shadow:0 0 0 3px var(--ja-peg2),0 0 14px 2px var(--ja-peg1);animation:jaglow 1s ease-in-out infinite}'
+'@keyframes jaglow{0%,100%{opacity:.55;scale:.92}50%{opacity:1;scale:1.04}}'
+'.ja-h.near::after{box-shadow:0 0 0 4px var(--ink),0 0 18px 4px var(--ja-peg1);animation:none;opacity:1}'
+'.ja-g{display:block}'
+'.ja-p{position:relative;width:calc(var(--jc)*.74);height:calc(var(--jc)*.74);border-radius:50%;background:radial-gradient(circle at 34% 30%,#fff 0,var(--ja-peg1) 18%,var(--ja-peg2) 62%,var(--ja-peg3) 100%);box-shadow:0 3px 0 rgba(90,30,0,.45),0 5px 8px rgba(0,0,0,.25);transition:transform .2s '+ZK.SPRING+',box-shadow .2s;pointer-events:none;will-change:transform}'
+'.ja-p.up{transform:translateY(-6px) scale(1.12);box-shadow:0 3px 0 rgba(90,30,0,.35),0 14px 16px rgba(0,0,0,.28)}'
+'.ja-p.dim{opacity:.5}'
+'.ja-p.drag{transition:none;z-index:5}'
+'.ja-fly{position:absolute;left:0;top:0;z-index:6;pointer-events:none}'
+'.zk-rm .ja-p,.zk-rm .ja-h.tg::after{transition:none;animation:none}'
+'@media (prefers-reduced-motion:reduce){.ja-p{transition:none}.ja-h.tg::after{animation:none;opacity:1}}';
var PEG='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="#E8590C"/><circle cx="9.5" cy="9" r="2.4" fill="#fff" opacity=".7"/></svg>';

function mount(root,inst,api){ZK.css(CSS,'ja-css');root.textContent='';
  var g=geo(inst.shape),rm=ZK.rm(api),st=inst.start.slice(),hist=[],hints=0,undos=0,fin=false,sel=-1,last=null,holes=[],pegs=[],ghost=null,idle=null,offs=[],drag=null,lostTimer=null;
  var stage=document.createElement('div');stage.className='ja zk-stage zk-host'+(rm?' zk-rm':'');
  var ctr=ZK.counter({icon:PEG,label:function(k){return k+' peg'+(k===1?'':'s')+' left'},zero:false});
  var board=document.createElement('div');board.className='ja-board zk-board';board.setAttribute('role','group');board.setAttribute('aria-label','The board');
  var D=Math.max(g.C,g.R),gp=D>=7?2:4,pad=D>=7?8:12,cs=getComputedStyle(root),avail=Math.min(372,(root.clientWidth-parseFloat(cs.paddingLeft||0)-parseFloat(cs.paddingRight||0))||350),cell=Math.min(64,Math.floor((avail-2*pad-(D-1)*gp)/D));
  /* tap targets: at least 44 px even when the drawn cell is smaller (7-wide boards at 320 px: 37 px). The hole and peg stay drawn at the
     cell size; the button reaches past it by --jo on every side (neighbours' edges overlap by a few px; a tap there is between two holes anyway) */
  var hit=Math.max(cell,44);board.style.setProperty('--jc',cell+'px');board.style.setProperty('--jo',((hit-cell)/2)+'px');
  board.style.gap=gp+'px';board.style.padding=pad+'px';board.style.gridTemplateColumns='repeat('+g.C+','+cell+'px)';board.style.gridAutoRows=cell+'px';board.style.width=(g.C*cell+(g.C-1)*gp+2*pad)+'px';board.style.maxWidth='100%';
  for(var r=0;r<g.R;r++)for(var c=0;c<g.C;c++){var h=g.at(r,c);if(h<0){var sp=document.createElement('span');sp.className='ja-g';sp.setAttribute('aria-hidden','true');board.appendChild(sp);continue}
    (function(h){var b=document.createElement('button');b.type='button';b.className='ja-h zk-p';b.setAttribute('data-zkc','');var p=document.createElement('span');p.className='ja-p';b.appendChild(p);
      b.onclick=function(){tapHole(h)};holes[h]=b;pegs[h]=p;board.appendChild(b)})(h)}
  stage.appendChild(ctr.el);stage.appendChild(board);root.appendChild(stage);
  function n(){return count(st)}
  function targets(a){var o=[];g.byFrom[a].forEach(function(t){if(st[t[1]]&&!st[t[2]])o.push(t)});return o}
  function paint(){for(var i=0;i<g.n;i++){var p=pegs[i];p.style.display=st[i]?'':'none';p.classList.toggle('up',i===sel);holes[i].classList.remove('tg','near');
      var rc=g.rc[i];holes[i].setAttribute('aria-label','Row '+(rc[0]+1)+', column '+(rc[1]+1)+', '+(st[i]?(i===sel?'peg, lifted':'peg'):'empty'));holes[i].setAttribute('aria-pressed',i===sel?'true':'false')}
    if(sel>=0)targets(sel).forEach(function(t){holes[t[2]].classList.add('tg');holes[t[2]].setAttribute('aria-label',holes[t[2]].getAttribute('aria-label')+', you can land here')});
    ctr.set(n())}
  function select(a){sel=a;paint();if(a>=0){ZK.sfx('lift');ZK.buzz('tap')}}
  function stuckCheck(){clearTimeout(lostTimer);ZK.stuck(stage,false);if(fin)return;
    if(!legal(g,st).length){ZK.stuck(stage,true,{text:n()===2?'So close: no jumps left':'No jumps left',onUndo:undo});api.say('No jumps left.');return}
    lostTimer=setTimeout(function(){if(fin)return;var w=winnable(g,st,150000);if(w===false){ZK.stuck(stage,true,{text:'One peg is out of reach now',onUndo:undo});api.say('From here one peg is out of reach. Undo to step back.')}},250)}
  function jump(t,fromXY){ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    var a=ZK.at(board,holes[t[0]]),b=ZK.at(board,holes[t[2]]),m=ZK.at(board,holes[t[1]]);if(fromXY){a.x=fromXY.x;a.y=fromXY.y}
    hist.push(t);st[t[0]]=0;st[t[1]]=0;st[t[2]]=1;sel=-1;last=holes[t[2]];paint();api.moved();
    /* the jumping peg arcs over; the jumped peg pops */
    var pe=pegs[t[2]],dx=a.x-b.x,dy=a.y-b.y;
    ZK.anim(pe,[{transform:'translate('+dx+'px,'+dy+'px) scale(1.12)'},{transform:'translate('+dx/2+'px,'+(dy/2-26)+'px) scale(1.28)',offset:.5},{transform:'translate(0,0) scale(.92)',offset:.85},{transform:'none'}],300,'cubic-bezier(.3,.7,.4,1)');
    if(!rm){var ghostPeg=document.createElement('span');ghostPeg.className='ja-p ja-fly';var w=pegs[t[0]].getBoundingClientRect().width||36;
      ghostPeg.style.width=w+'px';ghostPeg.style.height=w+'px';ghostPeg.style.left=(m.x-w/2)+'px';ghostPeg.style.top=(m.y-w/2)+'px';board.appendChild(ghostPeg);
      var an=ZK.anim(ghostPeg,[{transform:'scale(1)',opacity:1},{transform:'scale(1.25)',opacity:1,offset:.35},{transform:'scale(0)',opacity:0}],260,'ease-in',90,'forwards');
      if(an)an.onfinish=function(){ghostPeg.remove()};else ghostPeg.remove();
      setTimeout(function(){ZK.burst(board,m.x,m.y,{n:7,r:26,colors:['var(--ja-peg1)','var(--ja-peg2)','#F6B73C']})},120)}
    ZK.sfx('pop');setTimeout(function(){ZK.sfx('clack')},rm?0:250);ZK.buzz('pop');
    if(n()===1){fin=true;ZK.stuck(stage,false);api.say('One peg left.');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:280);return}
    api.say(n()+' pegs left.');stuckCheck()}
  function tapHole(h){if(fin)return;
    if(st[h]){if(sel===h){select(-1);return}if(!targets(h).length){ZK.wrong(pegs[h].parentNode);select(-1);return}select(h);return}
    if(sel>=0){var t=targets(sel).filter(function(x){return x[2]===h})[0];if(t){jump(t);return}ZK.wrong(holes[h]);return}
    var into=g.byTo[h].filter(function(t){return st[t[0]]&&st[t[1]]});
    if(into.length===1){jump(into[0]);return}
    if(into.length>1){into.forEach(function(t){ZK.anim(pegs[t[0]],[{transform:'translateY(0)'},{transform:'translateY(-6px)'},{transform:'none'}],260,ZK.SPRING)});ZK.sfx('press');return}
    ZK.wrong(holes[h])}
  /* drag: the lifted peg rides 34 px above the finger so it is never hidden; the nearest legal hole lights up */
  function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  L(board,'pointerdown',function(e){if(fin)return;var b=e.target.closest&&e.target.closest('.ja-h');if(!b)return;var h=holes.indexOf(b);if(h<0||!st[h]||!targets(h).length)return;
    drag={h:h,x0:e.clientX,y0:e.clientY,on:false,near:null,id:e.pointerId}});
  L(document,'pointermove',function(e){if(!drag||e.pointerId!==drag.id)return;var dx=e.clientX-drag.x0,dy=e.clientY-drag.y0;
    if(!drag.on){if(Math.hypot(dx,dy)<10)return;drag.on=true;if(sel!==drag.h)select(drag.h);pegs[drag.h].classList.add('drag')}
    pegs[drag.h].style.transform='translate('+dx+'px,'+(dy-34)+'px) scale(1.15)';
    var best=null,bd=1e9,br=board.getBoundingClientRect();targets(drag.h).forEach(function(t){var q=holes[t[2]].getBoundingClientRect(),d=Math.hypot(q.left+q.width/2-e.clientX,q.top+q.height/2-(e.clientY-34));if(d<bd){bd=d;best=t}});
    var nr=best&&bd<Math.max(40,br.width/g.C)?best:null;if(nr!==drag.near){if(drag.near)holes[drag.near[2]].classList.remove('near');drag.near=nr;if(nr){holes[nr[2]].classList.add('near');ZK.buzz('tap')}}});
  function endDrag(e){if(!drag||(e&&e.pointerId!==drag.id))return;var d=drag;drag=null;if(!d.on)return;var p=pegs[d.h];p.classList.remove('drag');
    if(d.near){var br=board.getBoundingClientRect(),cur=p.getBoundingClientRect(),from={x:cur.left-br.left+cur.width/2,y:cur.top-br.top+cur.height/2};p.style.transform='';jump(d.near,from)}
    else{p.style.transform='';ZK.anim(p,[{transform:'translateY(-12px)'},{transform:'none'}],260,ZK.SPRING);select(-1);ZK.sfx('soft')}
    swallow=true;setTimeout(function(){swallow=false},50)}
  var swallow=false;
  L(document,'pointerup',endDrag);L(document,'pointercancel',endDrag);
  L(board,'click',function(e){if(swallow){e.stopPropagation();e.preventDefault()}},true);
  paint();
  if(inst.level===1){var t0=legal(g,st)[0];if(t0)ghost=ZK.ghost(stage,[{drag:[holes[t0[0]],holes[t0[2]]],down:function(){select(t0[0])},up:function(){select(-1)},cancel:function(){if(!fin&&!hist.length)select(-1)}}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin||!hist.length)return false;var t=hist.pop();st[t[0]]=1;st[t[1]]=1;st[t[2]]=0;sel=-1;undos++;paint();ZK.unmark(stage);
    ZK.anim(pegs[t[1]],[{transform:'scale(0)'},{transform:'none'}],240,ZK.SPRING);ZK.sfx('undo');ZK.buzz('tap');stuckCheck();return true}
  return{undo:undo,
    restart:function(){if(fin)return;st=inst.start.slice();hist=[];sel=-1;paint();ZK.unmark(stage);ZK.stuck(stage,false);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var t=nextWin(g,st,200000);ZK.unmark(stage);
      if(!t){ZK.mark(document.querySelector('.pz5 [data-undo]'));return 'One peg is out of reach from here. Undo a jump.'}
      hints++;if(lv<=1){ZK.mark(holes[t[0]]);return 'This peg has a good jump.'}
      if(lv===2){select(t[0]);ZK.mark(holes[t[2]]);return 'Land it here.'}
      jump(t);return 'Jumped for you.'},
    destroy:function(){clearTimeout(lostTimer);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{pegs:n(),moves:hist.length,fin:fin,sel:sel}}}}

ZK.override({id:ID,name:'Jump Away',family:'move',theme:'F10',calm:true,
  blurb:'Jump pegs over each other until one is left.',
  how:'Jump a peg over its neighbour into an empty hole. The jumped peg comes off. Leave one peg.',
  areas:['space','control'],levels:30,secs:90,make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'One peg left after '+m+' jump'+(m===1?'':'s')+(h?', with '+h+' hint'+(h===1?'':'s'):'')+'.'}}});
})();
