/* teach2 rollout, builder group t3 (Docs/v6/teach2-rollout-brief.md, progress in Docs/v6/teach2-t3.md): Show me demos and level-1 guided starts for
   tiger-and-herd, blockade, seed-pits, who-owns-the-zebra, link-across, sun-mirrors, crate-push, pancake-flip, shunting-yard.
   Same shape as teach2-data.js (format in the header of teach2.js). Each demo runs the puzzle's own code on a tiny board of its own, 3-6 s, short captions.
   Loaded after teach2-data.js (teach2-t3.html only, until the core agent merges it). */
(function(){
if(!window.ZT)return;var D=ZT.DEMO=ZT.DEMO||{};
function q(root,sel,i){return root.querySelectorAll(sel)[i||0]}
/* the demo strip is small: inside a demo board, hide the counters above the board and the move pips below it so the board itself gets the room */
(function(){try{if(document.getElementById('zt2t3-css'))return;var st=document.createElement('style');st.id='zt2t3-css';st.textContent='.zt2-host .dk-top,.zt2-host .zk-pips{display:none!important}.zt2-host:has(.sp-board){width:150px!important}.zt2-host .sp-board{max-width:150px;margin:0 auto}';document.head.appendChild(st)}catch(e){}})();
function union(els){var r=null;els.forEach(function(e){if(!e)return;var b=e.getBoundingClientRect();if(!r)r={left:b.left,top:b.top,right:b.right,bottom:b.bottom};else{r.left=Math.min(r.left,b.left);r.top=Math.min(r.top,b.top);r.right=Math.max(r.right,b.right);r.bottom=Math.max(r.bottom,b.bottom)}});return r}

/* ---- Pancake Flip: a tap flips that pancake AND every one above it. Burnt boards (level 16 on): every toasted side must end facing down. ---- */
D['pancake-flip']={
  line:'Tap a pancake: it and all above it flip over.',
  end:'Sort the stack: biggest at the bottom.',
  inst:function(){return {level:0,title:'',stack:[2,3,1,4],n:4,par:2,burnt:false,parExact:true}},
  steps:[
    {wait:900,say:'Sort the stack: biggest at the bottom.'},
    {tap:function(r){return q(r,'.pf-r',1)},say:'Tap a pancake: it and all above it flip.',hold:1200},
    {tap:function(r){return q(r,'.pf-r',2)},say:'Tap again. Now it is sorted.',hold:1100}],
  by:function(inst){return inst.burnt?'burnt':null},
  alt:{burnt:{line:'Tap a pancake: it and all above flip and turn over.',end:'Sort the stack, every toasted side facing down.',
    inst:function(){return {level:0,title:'',stack:[-2,1,3],n:3,par:2,burnt:true,parExact:true}},
    steps:[{wait:1000,say:'Toasted sides must end facing down.'},
      {tap:function(r){return q(r,'.pf-r',1)},say:'A flip turns the pancakes over too.',hold:1200},
      {tap:function(r){return q(r,'.pf-r',0)},say:'The top one alone can flip. Sorted.',hold:1100}]}},
  /* level 1 is 3-2-1: one flip from the bottom sorts it */
  guide:function(root,inst,k){if(k>0)return null;var p=window.V6PF&&V6PF.solve(inst.stack,inst.burnt);if(!p||!p.length)return null;var r=q(root,'.pf-r',p[0]-1);
    return r?{tap:r,say:p[0]===inst.n?'Tap the bottom pancake: the whole stack flips.':'Tap this pancake: it and all above it flip.',above:true}:null}};

/* ---- Crate Push: swipe to walk; walking into a crate pushes it (never pulls). A 5x3 room, three swipes right, the crate lands on the spot. ---- */
function cpK(r){return r.querySelector('.zcp-k')}
function cpSw(dx,dy){return function(r){var k=cpK(r);if(!k)return null;var b=k.getBoundingClientRect();return {x:b.left+b.width/2+dx,y:b.top+b.height/2+dy}}}
D['crate-push']={
  line:'Swipe to walk. Walk into a crate to push it.',
  end:'Push every crate onto a glowing spot. Crates never pull.',
  inst:function(){return {level:0,title:'',lv:[5,3,'-----@-$-.-----',2],par:2,parExact:true}},
  steps:[
    {wait:700,say:'Swipe to walk the keeper.'},
    {drag:[cpSw(0,0),cpSw(64,0)],ms:420,hold:300},
    {drag:[cpSw(0,0),cpSw(64,0)],ms:420,say:'Walk into the crate to push it.',hold:300},
    {drag:[cpSw(0,0),cpSw(64,0)],ms:420,say:'Onto the glowing spot. Done!',hold:900}],
  /* any level: the next push of a shortest solution. Keeper beside the crate: swipe into it. Otherwise: tap the floor cell to stand on (the keeper walks there). */
  guide:function(root,inst,k){if(k>0)return null;var V=window.V6CP;if(!V)return null;var R=V.parse(inst.lv),dist=V.pullAll(R),here=dist[V.stateKey(R,R.crates,R.player)],m=null;if(!here)return null;
    V.pushes(R,R.crates,R.player).forEach(function(x){if(!m&&dist[V.stateKey(R,x[2],x[3])]===here-1)m=x});if(!m)return null;
    var DX=[0,1,0,-1],DY=[-1,0,1,0],NM=['up','right','down','left'],d=m[1];
    if(m[4]===R.player)return {box:function(r){return union([cpK(r),r.querySelectorAll('.zcp-x')[m[0]]])},drag:[cpSw(0,0),cpSw(DX[d]*70,DY[d]*70)],say:'Swipe '+NM[d]+': walk into the crate to push it.'};
    var t=root.querySelectorAll('.zcp-t')[m[4]];return t?{tap:t,say:'Tap here: the keeper walks over, ready to push '+NM[d]+'.'}:null}};

/* ---- Sun Mirrors: a tap turns a mirror; the beam must light the tower and must not touch the camp. Starts on the camp, one turn fixes it. ---- */
function smInst(W,H,g){var a=window.V6SM?V6SM.analyse(W,H,g):{par:1,sol:{}};return {level:0,title:'',W:W,H:H,g:g,par:a.par,sol:a.sol,parExact:true}}
D['sun-mirrors']={
  line:'Tap a mirror to turn it. Light every tower, never the camp.',
  end:'Bounce the sunlight through every tower. Keep it off the camp.',
  inst:function(){return smInst(4,3,'.T.../.<.C..')},
  steps:[
    {wait:1700,say:'The sunbeam hits the camp (the tent). Not allowed.'},
    {tap:'.zsm-m',say:'Tap the mirror to turn it.',hold:300},
    {wait:1700,say:'Now the beam lights the tower. Done!'}],
  guide:function(root,inst,k){if(k>0)return null;var g=inst.g,sol=inst.sol||{},c=null;Object.keys(sol).forEach(function(x){if(c==null&&g[x]!==sol[x])c=x});
    var m=c!=null&&root.querySelector('.zsm-m[data-cell="'+c+'"]');return m?{tap:m,say:'Tap this mirror to turn it.'}:null}};

/* ---- Shunting Yard: a tapped wagon comes back with every wagon in front of it; a tapped siding takes what the engine pulls. ---- */
function syW(root,inst,w){var ids=[];inst.start.s.concat([inst.start.t||'']).join('').split('').forEach(function(c){ids.push(+c)});ids.sort(function(a,b){return a-b});return root.querySelectorAll('.sy-w')[ids.indexOf(w)]}
D['shunting-yard']={
  line:'Tap a wagon: the engine fetches it and any wagons in its way.',
  end:'Make up the train shown on the top line.',
  inst:function(){return {level:0,title:'',caps:[2,2],start:{s:['','10'],t:''},target:'10',par:2,parExact:true}},
  steps:[
    {wait:900,say:'Make the train shown on the top line.'},
    {tap:function(r,inst){return syW(r,inst,1)},say:'Tap a wagon: the engine fetches it and any in its way.',hold:2000},
    {tap:function(r){return q(r,'.sy-s',0)},say:'Tap the top line: the engine drops them there.',hold:1500}],
  /* a top line that starts with wrong wagons (most Reel cards): those have to come off first. Judges of run t3-2 read such a top line as the target itself. */
  by:function(inst){var s0=inst&&inst.start&&inst.start.s[0];return s0&&inst.target.indexOf(s0)!==0?'fix':null},
  alt:{fix:{line:'Faint outlines show the train. Fetch wrong wagons off the top line first.',end:'Make the top line match its faint outlines.',
    inst:function(){return {level:0,title:'',caps:[2,2],start:{s:['0','1'],t:''},target:'10',par:3,parExact:true}},
    steps:[{wait:900,say:'The faint outlines show the train. This red wagon is wrong.'},
      {tap:function(r,inst){return syW(r,inst,0)},say:'Tap it: the engine fetches it off the top line.',hold:1300},
      {tap:function(r,inst){return syW(r,inst,1)},say:'Fetch the blue one too. It goes first.',hold:1300},
      {tap:function(r){return q(r,'.sy-s',0)},say:'Tap the top line to drop them. Done!',hold:1300}]}},
  /* any level: the first two trips of a shortest plan (fetch, then drop) */
  guide:function(root,inst,k){var V=window.V6SY;if(!V||k>1)return null;var A=V.analyse(inst.start,inst.caps,inst.target);if(!A)return null;var st=inst.start,m=null;
    for(var i=0;i<=k;i++){var ms=V.moves(st,inst.caps),d0=A.dist[A.idx[V.key(st)]];m=null;for(var j=0;j<ms.length;j++){var x=A.idx[V.key(ms[j].st)];if(x!=null&&A.dist[x]===d0-1){m=ms[j];break}}if(!m)return null;if(i<k)st=m.st}
    var mv=m.m;if(mv[0]==='push'){var sd=q(root,'.sy-s',mv[1]);return sd?{tap:sd,say:mv[1]===0?'Tap the top line to drop the wagons there.':'Tap this siding to drop the wagons there.'}:null}
    var w=+st.s[mv[1]].charAt(mv[2]),el=syW(root,inst,w);return el?{tap:el,say:mv[1]===0?'This wagon is in the wrong place. Tap it: the engine fetches it off.':'Tap this wagon: the engine fetches it.'}:null}};

/* ---- Who Owns the Zebra: tap a cell, then a fact; the clues decide what goes where. 2 houses, colour and pet, two clues. ---- */
D['who-owns-the-zebra']={
  line:'Tap a cell, then the fact the clues put there.',
  end:'Use the clues to fill every cell, and find the zebra.',
  inst:function(){return {level:0,title:'',H:2,cats:[1,2],vals:[[0,1],[0,1]],sol:[[1,0],[0,1]],
    clues:[{t:'pos',a:[0,1],b:null,h:0},{t:'same',a:[1,0],b:[0,1]}],par:1,parExact:true}},
  steps:[
    {mark:function(r){return q(r,'.zb-cl',0)},say:'Clue: blue is in the first house.',hold:700},
    {tap:function(r){return q(r,'.zb-ch',1)},say:'House 1 colour is picked. Tap blue.',hold:500},
    {mark:function(r){return q(r,'.zb-cl',1)},say:'Clue: the zebra goes with blue.',hold:700},
    {tap:function(r){return q(r,'.zb-c',2)},say:'Tap house 1’s pet cell…',hold:150},
    {tap:function(r){return q(r,'.zb-ch',0)},say:'…then the zebra.',hold:900}],
  /* level 1: house 1's first cell is already picked; light the fact that goes there */
  guide:function(root,inst,k){if(k>0)return null;var v=-1;inst.sol[0].forEach(function(h,kk){if(h===0)v=kk});var c=q(root,'.zb-ch',v),cell=q(root,'.zb-c',0);if(!c||!cell)return null;
    return {box:function(){return union([c])},tap:c,say:'House 1 is picked (orange ring). The clues put this here: tap it.'}}};

/* ---- Link Across: you join orange top to bottom, the computer answers every disc and joins navy left to right. A 3x3 fork: it blocks one gap, you take the other. ---- */
D['link-across']={
  line:'Tap cells to link the orange edges. The computer blocks after each move.',
  end:'Link top to bottom before the computer links left to right.',
  inst:function(){return {level:0,title:'',N:3,b:[2,2,1,1,2,0,1,0,0],par:2,win:[5],parExact:true}},
  steps:[
    {wait:900,say:'Link the orange edges, top to bottom.'},
    {tap:function(r){return q(r,'.la-pt',5)},say:'Tap a cell to place a disc.',hold:300},
    {wait:1300,say:'The computer answers: a diamond blocks one gap.'},
    {tap:function(r){return q(r,'.la-pt',8)},say:'Take the other gap. Linked!',hold:1200}],
  guide:function(root,inst,k){if(k>0||!inst.win||!inst.win.length)return null;var c=q(root,'.la-pt',inst.win[0]);return c?{tap:c,say:'Tap here to close the gap in your orange chain.'}:null}};

/* ---- Tiger and Herd: after every goat a tiger moves (jumping a goat if it can). Place a goat, a tiger steps, fill the point it left: all three asleep. ---- */
D['tiger-and-herd']={
  line:'Tap to place a goat. Tigers step, or jump a goat with a free spot behind.',
  end:'Trap all three tigers so none can step or jump.',
  inst:function(){return {level:0,title:'',tigers:[0,1,2],goats:7664,par:2,parExact:true}},
  /* core 8 Nov: 2 of 3 Reel judges never learned that tigers jump goats. The demo now shows a jump first (a goat at 3 leaves goat 5 with a free spot
     behind it; tiger 2 jumps it to 9), undoes it, then plays the safe line: fill the spot behind (9), the tiger steps, block its last space (1). */
  steps:[
    {tap:function(r){return q(r,'.th-pt',3)},say:'Tap a point: a goat goes there.',hold:250},
    {wait:1500,say:'A tiger jumps a goat with a free spot behind it!'},
    {do:function(r,inst,ctrl){if(ctrl&&ctrl.undo)ctrl.undo()},say:'Undo. Fill the spot behind it instead.',hold:700},
    {tap:function(r){return q(r,'.th-pt',9)},hold:250},
    {wait:1100,say:'Now the tiger can only step.'},
    {tap:function(r){return q(r,'.th-pt',1)},say:'Block its last space. All trapped!',hold:1200}],
  guide:function(root,inst,k){if(k>0||!window.V6TH)return null;var o=V6TH.optFirst({t:inst.tigers.slice(),g:inst.goats},inst.par).opt;if(!o.length)return null;var b=q(root,'.th-pt',o[0]);
    return b?{tap:b,say:inst.par===1?'Place a goat here: it traps the last tiger.':'Place a goat here, then watch the tiger move.'}:null}};

/* ---- Blockade: tap your counter, then a point next to it; the computer answers by sliding one of theirs. Leave them no move. ---- */
function bkBest(s){var D4=window.PZD4,X=window.V6BK;if(!D4||!X)return null;var v=X.exact(s);if(!v)return null;var ms=D4.bkMoves(s,'Y');
  for(var i=0;i<ms.length;i++){var s1=D4.bkApply(s,ms[i]),rs=D4.bkMoves(s1,'T');if(!rs.length)return ms[i];var ok=true;for(var j=0;j<rs.length&&ok;j++){var w=X.exact(D4.bkApply(s1,rs[j]));if(!w||w>v-1)ok=false}if(ok)return ms[i]}return null}
D['blockade']={
  line:'Tap your counter, then a point next to it. Then they move.',
  end:'Leave the computer’s diamonds no move.',
  inst:function(){return {level:0,title:'',par:2,start:'YYT.TY...'}},
  steps:[
    {wait:700,say:'Leave their diamonds no move.'},
    {tap:function(r){return q(r,'.bk-pt',0)},say:'Tap your counter, then a point next to it.',hold:150},
    {tap:function(r){return q(r,'.bk-pt',8)},hold:300},
    {wait:1200,say:'Now the computer slides a diamond.'},
    {tap:function(r){return q(r,'.bk-pt',1)},say:'Block their last space…',hold:150},
    {tap:function(r){return q(r,'.bk-pt',2)},say:'No moves left for them. You win!',hold:1200}],
  /* any level: the first move of a fastest forced win (by the exact solve), in two taps */
  guide:function(root,inst,k){if(k>1)return null;var m=bkBest(inst.start);if(!m)return null;var b=q(root,'.bk-pt',m[k]);
    return b?{tap:b,say:k===0?'Tap this counter to pick it up.':'Now tap this point to slide it there.'}:null}};

/* ---- Seed Pits (one player, no opponent): seeds go one per pit round the ring; only a last seed that lands on seeds captures. A miss, then a capture. ---- */
D['seed-pits']={
  line:'Tap a pit: its seeds go one per pit round the ring.',
  end:'A last seed that lands on seeds captures them. Reach the target.',
  inst:function(){return {level:0,title:'',pits:[2,0,1,1,0,0,0,0,0,0,0,0,0,0],target:2,par:2,parExact:true}},
  steps:[
    {wait:700,say:'Tap a pit: its seeds go one per pit.'},
    {tap:function(r){return q(r,'.sp-pt',3)},say:'Last seed lands in an empty pit: nothing.',hold:1100},
    {tap:function(r){return q(r,'.sp-pt',0)},say:'Last seed lands on a seed: captured!',hold:1300}],
  guide:function(root,inst,k){if(k>0||!window.PZD9||!PZD9.sp)return null;var s=PZD9.sp.solve(inst.pits,0,inst.target,inst.par||1);if(!s||!s.path.length)return null;var b=q(root,'.sp-pt',s.path[0]);
    return b?{tap:b,say:'Tap this pit to sow its seeds.'}:null}};

})();
