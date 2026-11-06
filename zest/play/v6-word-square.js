/* Zest v6: Word Square. Overrides puzzles_e2.js through ZK.override. make(), the par (fewest swaps, brute force over all row orders) and the solver are the original's.
   Rule: reorder the rows so row k reads the same as column k (the square is symmetric).
   Board: a grid of letter tiles. A tile turns green when it equals its mirror across the diagonal, so the player SEES the square come together. Tap a row to lift it
   (its twin column glows); tap another row and the two rows slide past each other and swap. Pips show par, one per swap.
   Aha: the answer is found by reading a column against a row. The generator keeps at least one swap that changes no obvious match at level 1-9 sizes (3x3), 4x4 from level 10 and 5x5 from level 20. */
(function(){
var ID='word-square',CC=window.V6C,E=window.PZE2;
var WANT=[1,1,2,2,2, 2,2,3,2,3,3,2,3,3,3,2,3, 3,3,4,3,4,4,3,4,4,4,3,4,4];
function sizeOf(L){return L<=5?3:L<=17?4:5}
function one(n,want,rng){var sq=E.ws.find(n,rng),best=null,bp=-1,t;
  for(t=0;t<150;t++){var a=pzShuffle(sq,rng),p=E.ws.par(a);if(p>=1&&(best===null||Math.abs(p-want)<Math.abs(bp-want))){best=a;bp=p;if(p===want)break}}
  return{n:n,rows:best,par:bp,answer:sq}}
/* 1.2.1 (level-review fix): a move is 'put this row in that slot' (the rows between shift), not a swap. Par = fewest such moves to any symmetric order
   = n minus the longest increasing run of target slots (exact, over every solution). So three stars mean the order was read before touching. */
function lis(a){var t=[];a.forEach(function(x){var lo=0,hi=t.length;while(lo<hi){var m=(lo+hi)>>1;if(t[m]<x)lo=m+1;else hi=m}t[lo]=x});return t.length}
function mdist(arr,s){return arr.length-lis(arr.map(function(w){return s.indexOf(w)}))}
function mpar(arr){var best=99;E.ws.solutions(arr).forEach(function(s){var d=mdist(arr,s);if(d<best)best=d});return best}
function mnear(arr){var best=null,bd=99;E.ws.solutions(arr).forEach(function(s){var d=mdist(arr,s);if(d<bd){bd=d;best=s}});return best}
/* the moves to get there: repeatedly take a row that is not part of the kept increasing run and put it straight into its slot */
function movesPlan(rows){var a=rows.slice(),t=mnear(a),out=[],g=0;while(g++<12){var idx=a.map(function(w){return t.indexOf(w)});if(idx.every(function(x,i){return x===i}))break;
    var keep=keepSet(idx),i=0;while(keep[i])i++;var w=a[i],tgt=idx[i],after=-1;for(var q=0;q<a.length;q++)if(keep[q]&&idx[q]<tgt)after=q;   /* right after the last kept row that belongs above it */
    var j=after<i?after+1:after;a.splice(i,1);a.splice(j,0,w);out.push([i,j])}return out}
function keepSet(idx){var n=idx.length,L=[],P=[],best=0,end=-1,i,j;for(i=0;i<n;i++){L[i]=1;P[i]=-1;for(j=0;j<i;j++)if(idx[j]<idx[i]&&L[j]+1>L[i]){L[i]=L[j]+1;P[i]=j}if(L[i]>best){best=L[i];end=i}}var k={};while(end>=0){k[end]=1;end=P[end]}return k}
function partsFor(L){return L<12?1:L<26?2:3}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var n=sizeOf(level),want=WANT[level-1],k=partsFor(level),parts=[],par=0;
  for(var q=0;q<k;q++){var pt=one(n,Math.max(1,want-q),rng);parts.push(pt);par+=pt.par}
  parts.forEach(function(pt){pt.swaps=pt.par;pt.par=mpar(pt.rows)});par=parts.reduce(function(s,pt){return s+pt.par},0);
  return{title:'Level '+level,level:level,n:n,rows:parts[0].rows,answer:parts[0].answer,parts:parts,par:par,parExact:true}}
function swapsPlan(rows){var a=rows.slice(),t=E.ws.nearest(a),out=[];for(var i=0;i<a.length;i++)if(a[i]!==t[i]){var k=a.indexOf(t[i]);out.push([i,k]);var x=a[i];a[i]=a[k];a[k]=x}return out}
function plan(inst){var out=[];inst.parts.forEach(function(pt,qi){if(qi)out.push({wait:1.1});movesPlan(pt.rows).forEach(function(s){out.push('.sq-r[data-pos="'+s[0]+'"]');out.push('.sq-r[data-pos="'+s[1]+'"]');out.push({wait:.5})})});return out}
CC[ID]={mpar:mpar,movesPlan:movesPlan,mnear:mnear,make:make,partsFor:partsFor,WANT:WANT,sizeOf:sizeOf,plan:plan,swapsPlan:swapsPlan};
var CSS=''
+'.sq{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font)}'
+'.sq-board{position:relative;width:100%}'
+'.sq-r{all:unset;position:absolute;left:0;box-sizing:border-box;display:flex;justify-content:center;gap:6px;cursor:pointer;border-radius:16px;transition:transform .34s '+ZK.SPRING+';-webkit-tap-highlight-color:transparent;z-index:1}'
+'.sq-r:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.sq-r.up{z-index:3}'
+'.sq-c{flex:none;display:flex;align-items:center;justify-content:center;border-radius:12px;background:var(--surface);box-shadow:0 0 0 2px var(--edge),0 3px 0 var(--edge);font:800 1.5rem/1 var(--disp,var(--font));text-transform:uppercase;color:var(--ink);transition:background .2s,box-shadow .2s}'
+'.sq-c.ok{background:var(--ok-bg,#ddefe2);color:var(--ok-ink,#14532d);box-shadow:0 0 0 2px var(--ok-ink,#14532d),0 3px 0 var(--ok-ink,#14532d)}'
+'.sq-c.tw{background:var(--tint);box-shadow:0 0 0 3px var(--accent),0 3px 0 var(--accent)}'
+'.sq-r.sel .sq-c{box-shadow:0 0 0 3px var(--accent),0 6px 0 var(--accent)}'
+'.sq-c.dg{background:var(--surface);color:var(--ink);box-shadow:0 0 0 2px var(--edge),0 3px 0 var(--edge);background-image:repeating-linear-gradient(135deg,transparent 0 7px,rgba(127,127,127,.16) 7px 9px)}'
+'.sq-r.drag{transition:none;z-index:4;filter:drop-shadow(0 10px 14px rgba(0,0,0,.22))}.sq-board{touch-action:none}'
+'.zk-rm .sq-r{transition:none}@media (prefers-reduced-motion:reduce){.sq-r{transition:none}}';
function mount(root,inst,api){CC.css();ZK.css(CSS,'sq-css');
  var rm=ZK.rm(api),n=inst.n,qi=0,base=0,locked=false,arr=inst.parts[0].rows.slice(),els={},posOf={},sel=-1,hist=[],hints=0,undos=0,fin=false,last=null,ghost=null,idle=null,stage=CC.stage(root,'sq',api),board=CC.el('div','sq-board zk-board'),pips=ZK.pips(inst.par),cw=0,tw=52,gap=6,rh=0;
  stage.appendChild(board);pips.el.className+=' sq-pips';stage.appendChild(pips.el);
  cw=Math.floor(stage.getBoundingClientRect().width)||340;tw=Math.max(44,Math.min(60,Math.floor((cw-16-gap*(n-1))/n)));rh=tw+gap+8;board.style.height=(n*rh)+'px';
  function paint(){arr.forEach(function(w,i){posOf[w]=i;var b=els[w];b.setAttribute('data-pos',i);b.style.transform='translateY('+(i*rh)+'px)';b.classList.toggle('sel',sel===i);b.classList.toggle('up',sel===i);b.setAttribute('aria-label','Row '+(i+1)+': '+w+(sel===i?', lifted':''));
      [].forEach.call(b.children,function(c,j){var m=arr[j].charAt(i)===w.charAt(j)&&true;c.textContent=w.charAt(j);var ok=arr[j].charAt(i)===w.charAt(j);c.className='sq-c'+(j===i?' dg':ok?' ok':'')+(sel>=0&&j===sel&&!ok&&j!==i?' tw':'')})});
    if(sel>=0&&!rm)ZK.anim(els[arr[sel]],[{scale:'1'},{scale:'1.04'}],160,ZK.SPRING,0,'forwards')}
  function buildPart(){board.textContent='';els={};posOf={};sel=-1;hist=[];arr=inst.parts[qi].rows.slice();
  arr.forEach(function(w,k){var b=CC.btn('sq-r','',function(){tap(posOf[w])});b.setAttribute('data-zkc','');b.style.width=(n*tw+(n-1)*gap)+'px';b.style.left=Math.round((cw-(n*tw+(n-1)*gap))/2)+'px';b.style.height=tw+'px';
    w.split('').forEach(function(ch){var c=CC.el('span','sq-c');c.style.width=tw+'px';c.style.height=tw+'px';c.style.fontSize=Math.round(tw*.5)+'px';c.textContent=ch;b.appendChild(c)});els[w]=b;board.appendChild(b)});
    paint();if(!rm)Object.keys(els).forEach(function(w,k){ZK.anim(els[w],[{opacity:0,scale:'.9'},{opacity:1,scale:'1'}],240,ZK.SPRING,k*50)})}
  function sym(){return E.ws.sym(arr)}
  function doMove(i,j,rec){var w=arr.splice(i,1)[0];arr.splice(j,0,w);if(rec){hist.push([i,j]);api.moved();pips.set(base+hist.length)}}
  function tap(i){if(fin||locked)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    if(sel<0){sel=i;ZK.sfx('lift');ZK.buzz('tap');paint();return}
    if(sel===i){sel=-1;ZK.sfx('undo');paint();return}
    var a=sel;sel=-1;doMove(a,i,true);last=els[arr[i]];paint();ZK.sfx('slide');ZK.buzz('move');
    if(sym())solvedPart()}
  function solvedPart(){ZK.sfx('star',{i:1});if(qi<inst.parts.length-1){locked=true;base+=hist.length;sel=-1;paint();ZK.sfx('cap',{n:qi});setTimeout(function(){qi++;locked=false;buildPart()},rm?60:760);return}
    fin=true;api.say('Every row matches its column.');setTimeout(function(){api.done({solved:true,moves:base+hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:420)}
  function key(e){if(fin)return;var k='12345'.indexOf(e.key);if(k>=0&&k<n)tap(k)}
  stage.addEventListener('keydown',key);
  var dg=null,swallow=0;   /* drag a row: it follows the finger lifted (scale + shadow), the others slide to make room, release drops it in the slot */
  function preview(from,to){var a=arr.slice(),w=a.splice(from,1)[0];a.splice(to,0,w);a.forEach(function(x,k){if(x!==w)els[x].style.transform='translateY('+(k*rh)+'px)'})}
  board.addEventListener('pointerdown',function(e){if(fin||locked)return;var r=e.target.closest&&e.target.closest('.sq-r');if(!r)return;dg={i:+r.getAttribute('data-pos'),y0:e.clientY,on:false,to:+r.getAttribute('data-pos'),el:r,id:e.pointerId}});
  board.addEventListener('pointermove',function(e){if(!dg||e.pointerId!==dg.id)return;var dy=e.clientY-dg.y0;if(!dg.on){if(Math.abs(dy)<8)return;dg.on=true;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);sel=dg.i;paint();dg.el.classList.add('drag');ZK.sfx('lift');ZK.buzz('tap');try{board.setPointerCapture(e.pointerId)}catch(x){}}
    var y=Math.max(-rh*.4,Math.min((n-1)*rh+rh*.4,dg.i*rh+dy));dg.el.style.transform='translateY('+y+'px) scale(1.04)';var to=Math.max(0,Math.min(n-1,Math.round(y/rh)));if(to!==dg.to){dg.to=to;preview(dg.i,to);ZK.sfx('press')}});
  function endDrag(e){if(!dg)return;var d=dg;dg=null;if(!d.on)return;swallow=Date.now();d.el.classList.remove('drag');sel=-1;
    if(d.to!==d.i){doMove(d.i,d.to,true);last=els[arr[d.to]];paint();ZK.sfx('slide');ZK.buzz('move');if(sym())solvedPart()}else{paint();ZK.sfx('undo')}}
  board.addEventListener('pointerup',endDrag);board.addEventListener('pointercancel',endDrag);
  board.addEventListener('click',function(e){if(Date.now()-swallow<350){e.stopPropagation();e.preventDefault()}},true);
  buildPart();
  if(inst.level===1){var sp=movesPlan(inst.parts[0].rows)[0];ghost=ZK.ghost(stage,[{tap:els[arr[sp[0]]],hold:800},{tap:els[arr[sp[1]]],hold:900}],{id:ID,level:1,delay:900})}
  idle=ZK.idle(stage,25000);
  return{
    undo:function(){if(fin||locked||!hist.length)return false;var h=hist.pop();doMove(h[1],h[0],false);pips.set(base+hist.length);undos++;sel=-1;paint();ZK.sfx('undo');ZK.buzz('tap');return true},
    restart:function(){if(fin||locked)return;hist=[];arr=inst.parts[qi].rows.slice();sel=-1;pips.set(base);paint();ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin||locked)return null;var mp=movesPlan(arr)[0];if(!mp)return null;var i=mp[0],k=mp[1];hints++;ZK.unmark(stage);
      if(lv<=1){ZK.mark(els[arr[i]]);return 'This row is not in its place yet.'}
      if(lv===2){ZK.mark(els[arr[i]]);return 'This row goes to slot '+(k+1)+'. Read it down column '+(k+1)+'.'}
      sel=-1;doMove(i,k,true);last=els[arr[k]];paint();ZK.sfx('slide');if(sym())solvedPart();return 'Moved for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();stage.removeEventListener('keydown',key);root.textContent=''},
    moves:function(){return locked?base:base+hist.length},   /* while a solved part waits for the next, its moves are already in base */   /* 1.2.4: the count the header, the Reel chip and the win card all show */
    lastEl:function(){return last},state:function(){return{moves:hist.length,fin:fin}}}}
ZK.override({id:ID,name:'Word Square',family:'word',theme:'F3',blurb:'Move the rows until every row reads down as its column.',
  how:'Drag a row to its place (or tap it, then its slot). Green tiles match their mirror.',areas:['space','flex'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){return{stars:pzStarsByPar(res.moves,inst.par,res.hints),line:'Done in '+CC.pl(res.moves,'move')+'. The fewest is '+inst.par+'.'}}});
})();
