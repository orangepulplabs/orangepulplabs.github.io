/* teach2 rollout, builder t1 (Docs/v6/teach2-rollout-brief.md, progress in Docs/v6/teach2-t1.md).
   Show me demos, level-1 guided starts and hint rule lines for: switch-off, jump-away, tube-sort, tilt-run, slide-tiles, make-target,
   balance-weights, zero-one, four-by-four. Same shape as teach2-data.js (format: the header of teach2.js). Each demo runs the puzzle's own
   mount on a tiny board of its own (never a real level), so the real result happens. Loaded after teach2.js and teach2-data.js. */
(function(){
if(!window.ZT)return;var D=ZT.DEMO=ZT.DEMO||{};
function q(root,sel,i){return root.querySelectorAll(sel)[i||0]}
function union(els){var r=null;els.forEach(function(e){if(!e)return;var b=e.getBoundingClientRect();if(!r)r={left:b.left,top:b.top,right:b.right,bottom:b.bottom};else{r.left=Math.min(r.left,b.left);r.top=Math.min(r.top,b.top);r.right=Math.max(r.right,b.right);r.bottom=Math.max(r.bottom,b.bottom)}});return r}

/* ---- Switch Off: a tap flips its neighbours too, and dark ones light up. 3x3: tap the middle (two dark neighbours light), then the corner. ---- */
D['switch-off']={
  line:'A tap flips that light and the four beside it.',
  end:'Switch every light off.',
  inst:function(){return {level:0,title:'',n:3,lit:[1,0,0, 0,1,1, 0,1,0],par:2,parExact:true}},
  steps:[
    {tap:function(r){return q(r,'.so-c',4)},say:'A tap flips that light and its neighbours.',hold:200},
    {wait:900,say:'Dark neighbours light up too.'},
    {tap:function(r){return q(r,'.so-c',0)},say:'Tap this corner: all dark.',hold:500}],
  guide:function(root,inst,k){if(k>0)return null;var n=inst.n,E=V6SO.eff(n),cur=0,i,t=-1;for(i=0;i<n*n;i++)if(inst.lit[i])cur|=1<<i;
    for(i=0;i<n*n;i++)if(E[i]===cur){t=i;break}if(t<0){var s=V6SO.minSol(n,cur);for(i=0;i<n*n;i++)if((s>>i)&1){t=i;break}}if(t<0)return null;
    return {tap:q(root,'.so-c',t),say:'Tap this light. It and its neighbours switch.'}}};

/* ---- Jump Away: a peg jumps over a neighbour into a hole, and the jumped peg comes off. Small plus board, two jumps to one peg. ---- */
D['jump-away']={
  line:'Jump a peg over a neighbour into a hole. That neighbour comes off.',
  end:'Leave just one peg.',
  inst:function(){return {level:0,title:'',shape:'plus',start:[0,1,1,1,0,0,0,0,0],par:2,parExact:true}},
  steps:[
    {tap:function(r){return q(r,'.ja-h',2)},say:'Tap a peg, then the hole past its neighbour.',hold:250},
    {tap:function(r){return q(r,'.ja-h',4)},hold:300},
    {wait:900,say:'The jumped peg comes off.'}],
  guide:function(root,inst,k){if(k>0)return null;var g=V6JA.geo(inst.shape),t=V6JA.nextWin(g,inst.start,200000)||V6JA.legal(g,inst.start)[0];if(!t)return null;
    var hs=root.querySelectorAll('.ja-h');return {light:hs[t[0]],drag:[hs[t[0]],hs[t[2]]],say:'Jump this peg over its neighbour into the empty hole.'}}};

/* ---- Tube Sort: pour only onto the same colour (or into an empty tube). ---- */
D['tube-sort']={
  line:'Tap a tube, then tap where to pour: same colour on top, or empty.',
  end:'Make every tube one colour.',
  inst:function(){return {level:0,title:'',tubes:['0011','11','00'],k:2,spare:0,par:2,parExact:true}},
  steps:[
    {tap:function(r){return q(r,'.ts-t',0)},say:'Tap a tube to pick it up.',hold:250},
    {tap:function(r){return q(r,'.ts-t',1)},say:'Then tap a tube with the same colour on top.',hold:1200}],
  guide:function(root,inst,k){if(k>1)return null;var p=PZB.ts.solve(inst.tubes,20000,1).path;if(!p||!p.length)return null;var m=p[0],ts=root.querySelectorAll('.ts-t');
    if(k===0)return {tap:ts[m[0]],say:'Tap this tube to pick it up.'};
    return {tap:ts[m[1]],say:'Now tap this tube to pour into it.'}}};

/* ---- Tilt Run: the ball does not stop where you want; it slides until a stone or the wall stops it. ---- */
function trPt(root,inst,dx,dy){var b=root.querySelector('.tr-ball'),bd=root.querySelector('.tr-b');if(!b||!bd)return null;var r=b.getBoundingClientRect(),R=bd.getBoundingClientRect(),c=R.width/inst.w;
  var x=r.left+r.width/2+dx*c,y=r.top+r.height/2+dy*c;return {x:Math.max(R.left+8,Math.min(R.right-8,x)),y:Math.max(R.top+8,Math.min(R.bottom-8,y))}}
var TRB=[0,0,0,0,1, 0,0,0,0,0, 0,0,0,0,0, 0,1,0,0,0, 0,0,0,0,0];
D['tilt-run']={
  line:'Swipe to roll. The ball slides until something stops it.',
  end:'Roll the ball into the glowing hole.',
  inst:function(){return {level:0,title:'',w:5,h:5,blocks:TRB.slice(),sx:0,sy:0,gx:3,gy:4,par:2,parExact:true}},
  steps:[
    {drag:[function(r,i){return trPt(r,i,0,0)},function(r,i){return trPt(r,i,1.6,0)}],ms:420,say:'Swipe. The ball slides until a stone stops it.',hold:900},
    {drag:[function(r,i){return trPt(r,i,0,0)},function(r,i){return trPt(r,i,0,1.6)}],ms:420,say:'Swipe down, into the hole.',hold:1100}],
  guide:function(root,inst,k){if(k>0)return null;var p=PZA.tiltSolve(inst.w,inst.h,inst.blocks,inst.sx,inst.sy,inst.gx,inst.gy);if(!p||!p.length)return null;
    var d=p[0],DX=[0,0,-1,1],DY=[-1,1,0,0],ball=root.querySelector('.tr-ball');
    return {light:ball,drag:[ball,function(r){return trPt(r,inst,DX[d]*1.5,DY[d]*1.5)}],say:'Swipe this way. The ball rolls until it hits something.'}}};

/* ---- Slide Tiles: tap a tile next to the gap and it slides in. Two taps finish the demo board. ---- */
function stTiles(root,n){var t=[],i;for(i=0;i<n*n;i++)t.push(0);[].forEach.call(root.querySelectorAll('.st-t'),function(b){var m=/translate\(([-\d.]+)%,\s*([-\d.]+)%\)/.exec(b.style.transform||'');if(!m)return;
  var x=Math.round(+m[1]/100),y=Math.round(+m[2]/100);t[y*n+x]=+b.textContent});return t}
function stBtn(root,v){var o=null;[].forEach.call(root.querySelectorAll('.st-t'),function(b){if(+b.textContent===v)o=b});return o}
D['slide-tiles']={
  line:'Tap a tile next to the gap to slide it in.',
  end:'Put the numbers in order, gap last.',
  inst:function(){return {level:0,title:'',n:3,tiles:[1,2,3,4,0,6,7,5,8],par:2,parExact:true}},
  steps:[
    {wait:400,say:'Tap a tile next to the gap to slide it in.'},
    {tap:function(r){return stBtn(r,5)},hold:700},
    {tap:function(r){return stBtn(r,8)},say:'Put the numbers in order, gap last.',hold:1000}],
  guide:function(root,inst,k){if(k>1)return null;var n=inst.n,t=stTiles(root,n),r=PZA.tSolve(t,n,1,n===3?2e6:400000);if(!r||!r.path.length)return null;var b=stBtn(root,r.path[0]);if(!b)return null;
    return {tap:b,say:k===0?'Tap this tile. It slides into the gap.':'Now this one.'}}};

/* ---- Make the Target: two numbers and a sign become one new number; repeat until the target appears. ---- */
D['make-target']={
  line:'Pick two numbers, then a sign. They become one new number.',
  end:'Make the target number.',
  inst:function(){return {level:0,title:'',nums:[3,4,2],target:12,par:1,parExact:true}},
  steps:[
    {tap:function(r){return q(r,'.mk-n',0)},say:'Make 12. Pick two numbers…',hold:60},
    {tap:function(r){return q(r,'.mk-n',1)},hold:200},
    {tap:function(r){return q(r,'.mk-o',2)},say:'…then a sign. 3 × 4 becomes 12.',hold:900}],
  guide:function(root,inst,k){var s=PZA.targetSolve(inst.nums,inst.target,400000);if(!s||!s.path.length)return null;var st=s.path[0],ns=root.querySelectorAll('.mk-n');
    var i=inst.nums.indexOf(st.x),j=inst.nums.indexOf(st.y,st.x===st.y?i+1:0),ti=ns[i],tj=ns[j],ok=['+','-','*','/'].indexOf(st.op);
    if(k===0)return {box:function(){return union([ti,tj])},say:'Tap these two numbers.',until:function(){return ti.classList.contains('sel')&&tj.classList.contains('sel')}};
    if(k===1)return {tap:root.querySelectorAll('.mk-o')[ok],say:'Now tap the sign that makes '+inst.target+'.'};
    return null}};

/* ---- Balance Weights: weights may go on either pan, even beside the object (2 = 3 - 1). Tap a weight, then a pan. ---- */
D['balance-weights']={
  line:'Put weights on either pan, even beside the object, to balance it.',
  end:'Balance it with as few weights as you can.',
  inst:function(){return {level:0,title:'',set:[1,3,9],target:2,par:2}},
  steps:[
    {tap:function(r){return q(r,'.bw-w[data-k="1"]')},say:'Tap a weight, then a pan.',hold:150},
    {tap:'.bw-hang.r .bw-bowl',hold:600},
    {tap:function(r){return q(r,'.bw-w[data-k="0"]')},say:'Too heavy? Add one beside the object.',hold:150},
    {tap:'.bw-hang.l .bw-bowl',hold:200},
    {wait:700,say:'3 = 2 + 1. Balanced.'}],
  guide:function(root,inst,k){if(k>0)return null;var sols=PZC2.bw.solutions(inst.set,inst.target);if(!sols||!sols.length)return null;var s=sols[0],w=-1,v=0;
    for(var i=s.length-1;i>=0;i--)if(s[i]){w=i;v=s[i];break}if(w<0)return null;var chip=q(root,'.bw-w[data-k="'+w+'"]'),bowl=q(root,v>0?'.bw-hang.r .bw-bowl':'.bw-hang.l .bw-bowl');
    return {light:chip,drag:[chip,bowl],say:'Drag the '+inst.set[w]+' onto the '+(v>0?'empty':'object’s')+' pan.'}}};

/* ---- Zero One: two rules no one guesses: never three alike in a line, and every line holds as many 0s as 1s. One tap is 0, two is 1. ---- */
D['zero-one']={
  line:'Tap once for 0, twice for 1. No three alike; rows and columns half 0, half 1.',
  end:'Fill the grid: no three alike, half 0s and half 1s.',
  inst:function(){var sol=[0,1,1,0, 1,0,0,1, 0,0,1,1, 1,1,0,0],g=sol.slice();g[0]=-1;g[11]=-1;return {level:0,title:'',n:4,given:g,sol:sol,par:3}},
  steps:[
    {tap:function(r){return q(r,'.zo-c',11)},say:'Each row needs two 0s and two 1s.',hold:250},
    {tap:function(r){return q(r,'.zo-c',11)},say:'One tap is 0, two taps is 1.',hold:800},
    {tap:function(r){return q(r,'.zo-c',0)},say:'Never three alike in a line: this is 0.',hold:800}],
  guide:function(root,inst,k){var n=inst.n,g=inst.given,best=-1,i,cs=root.querySelectorAll('.zo-c');
    for(i=0;i<n*n;i++)if(g[i]<0){var a=V6ZO.okv(g,n,i,0),b=V6ZO.okv(g,n,i,1);if(a!==b){if(best<0||(a&&inst.sol[best]!==0))best=i;if(a)break}}
    if(best<0)return null;var want=inst.sol[best],c=cs[best];
    if(k===0)return {tap:c,say:want===0?'Only 0 fits here. Tap once.':'Only 1 fits here. Tap twice.'};
    if(k===1&&want===1&&!c.classList.contains('v1'))return {tap:c,say:'Once more for 1.'};
    return null}};

/* ---- Four by Four: tapping a cell lights its row, column and box; the number missing from all three goes in. ---- */
D['four-by-four']={
  line:'Tap a cell, then a number. Each number once per row, column and box.',
  end:'Each number once in every row, column and box.',
  inst:function(){var sol=[1,2,3,4, 3,4,1,2, 2,1,4,3, 4,3,2,1],g=sol.slice();g[3]=0;g[14]=0;return {level:0,title:'',n:4,bw:2,bh:2,given:g,sol:sol,par:2,clues:14}},
  steps:[
    {tap:function(r){return q(r,'.fb-c',3)},say:'Tap a cell: its row, column and box light up.',hold:1000},
    {tap:function(r){return q(r,'.fb-k',3)},say:'Tap the number none of them has.',hold:900}],
  guide:function(root,inst,k){var d=V6FBF.idx({n:inst.n,bw:inst.bw,bh:inst.bh}),g=inst.given,gq=-1,gv=0,i;
    for(i=0;i<g.length&&gq<0;i++)if(!g[i]){var used={},c=[];d.peers[i].forEach(function(j){if(g[j])used[g[j]]=1});for(var v=1;v<=inst.n;v++)if(!used[v])c.push(v);if(c.length===1){gq=i;gv=c[0]}}
    if(gq<0)return null;
    var cel=q(root,'.fb-c',gq),up=cel&&cel.getBoundingClientRect().top-root.getBoundingClientRect().top>110;
    if(k===0)return {tap:cel,say:'Only '+gv+' fits here: its row, column and box have the rest. Tap it.',above:up};
    if(k===1)return {tap:q(root,'.fb-k',gv-1),say:'Only '+gv+' is missing from all three. Tap it.',above:true};
    return null}};

})();
