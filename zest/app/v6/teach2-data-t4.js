/* teach2 rollout, builder t4 (8 Nov 2026; Docs/v6/teach2-t4.md): the Show me demo and the level-1 guided start for
   reversi-flip, lucas-tower, bezzel-queens, quilt-tiles, rolling-die, aqueduct, huarong-pass, rect-cut.
   Format: see the header of teach2.js (same shape as teach2-data.js). Each demo runs the puzzle's own code on a tiny board of its own
   (never a real level), 3-6 s, short captions. Loaded after teach2-data.js; teach2.js reads ZT.DEMO lazily. */
(function(){
if(!window.ZT)return;var D=ZT.DEMO=ZT.DEMO||{};
function q(root,sel,i){return root.querySelectorAll(sel)[i||0]}
function ctr(el){if(!el)return null;var b=el.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}}
/* a point offset from an element's centre (a swipe or a slide of a set distance) */
function off(sel,i,dx,dy){return function(r){var c=ctr(q(r,sel,i));return c&&{x:c.x+dx(r),y:c.y+dy(r)}}}
function rectOf(el){if(!el)return null;var b=el.getBoundingClientRect();return {left:b.left,top:b.top,right:b.right,bottom:b.bottom}}
function union(els){var r=null;els.forEach(function(e){if(!e)return;var b=e.getBoundingClientRect();if(!r)r={left:b.left,top:b.top,right:b.right,bottom:b.bottom};else{r.left=Math.min(r.left,b.left);r.top=Math.min(r.top,b.top);r.right=Math.max(r.right,b.right);r.bottom=Math.max(r.bottom,b.bottom)}});return r}

/* ---- Reversi Flip: the sandwich rule (a placement flips the light lines it traps against a dark disc). ---- */
D['reversi-flip']={
  line:'Tap a cell that traps light discs between dark ones. They flip.',
  end:'Turn every light disc dark with the discs you have.',
  inst:function(){return {level:0,title:'',N:4,board:[0,0,0,0, 1,2,2,0, 0,0,2,0, 0,0,0,0],k:2,par:2,parExact:true,sol:[7,14],sym:0}},
  steps:[
    {wait:700,say:'Trap light discs between dark ones.'},
    {tap:'[data-i="7"]',say:'Tap here: the trapped line flips dark.',hold:1100},
    {tap:'[data-i="14"]',say:'Any line works: up, down or diagonal.',hold:1000}],
  guide:function(root,inst,k){if(k>0||!inst.sol||!inst.sol.length)return null;var c=root.querySelector('.gv-c[data-i="'+inst.sol[0]+'"]');
    return c?{tap:c,say:'Tap here first: it traps a light disc, so it flips.'}:null}};

/* ---- Lucas Tower: drag a top disc to another peg; never a bigger disc on a smaller one; match the target drawn above. ---- */
var PEGN=['left','middle','right','far right'];
D['lucas-tower']={
  line:'Drag a top disc to another peg. Never put a big disc on a smaller one.',
  end:'Restack the discs to match the target above.',
  inst:function(){return {level:0,title:'',P:3,n:2,s:'10',g:'22',par:2,parExact:true}},
  steps:[
    {drag:['[data-peg="0"]','[data-peg="1"]'],ms:640,say:'A big disc can’t go on a smaller one.',hold:700},
    {drag:['[data-peg="0"]','[data-peg="2"]'],ms:640,say:'Drag a top disc to another peg.',hold:300},
    {drag:['[data-peg="1"]','[data-peg="2"]'],ms:640,say:'Now it matches the target above.',hold:900}],
  guide:function(root,inst,k){if(k>0)return null;var s=String(inst.s).split('').map(Number),g=String(inst.g).split('').map(Number);
    var m=V6LT.nextMove(inst.P,inst.n,s,g,V6LT.bfs(inst.P,inst.n,g,-1));if(!m)return null;var d=q(root,'.zlt-d',m[0]),to=q(root,'[data-peg="'+m[2]+'"]');if(!d||!to)return null;
    return {light:d,pad:10,drag:[d,function(){var b=to.getBoundingClientRect(),db=d.getBoundingClientRect();return {x:b.left+b.width/2,y:db.top-db.height*.6}}],
      say:'Drag this disc to the '+(inst.P===3?PEGN[m[2]]:'marked')+' peg.'}}};

/* ---- Safe Queens: a queen attacks its row, column and diagonals (the shading); one queen per row, none attacking. ---- */
D['bezzel-queens']={
  line:'Tap safe squares. A queen attacks its row, column and diagonals.',
  end:'Fill every row with a queen. None may attack another.',
  inst:function(){return {level:0,title:'',n:4,givens:[1],rocks:[],sol:[1,7,8,14],par:3,looks:0,parExact:true}},
  steps:[
    {wait:900,say:'Shaded squares are under attack.'},
    {tap:function(r){return q(r,'.bq-c',7)},say:'Tap a safe square to place a queen.',hold:900},
    {tap:function(r){return q(r,'.bq-c',8)},say:'One queen in every row.',hold:300},
    {tap:function(r){return q(r,'.bq-c',14)},say:'No queen attacks another: solved.',hold:900}],
  /* rocks hold no queen, but attacks pass over them */
  by:function(inst){return inst.rocks&&inst.rocks.length?'rock':null},
  alt:{rock:{
    inst:function(){return {level:0,title:'',n:4,givens:[1],rocks:[3],sol:[1,7,8,14],par:3,looks:0,parExact:true}},
    steps:[
      {wait:700,say:'Shaded squares are under attack.'},
      {mark:function(r){return q(r,'.bq-c',3)},say:'A rock holds no queen. Attacks pass over it.',hold:900},
      {tap:function(r){return q(r,'.bq-c',7)},say:'Tap a safe square to place a queen.',hold:400},
      {tap:function(r){return q(r,'.bq-c',8)},hold:200},
      {tap:function(r){return q(r,'.bq-c',14)},say:'One queen per row, none attacking.',hold:900}]}},
  guide:function(root,inst,k){if(k>0)return null;var st=V6BQ.logic(inst.n,inst.givens,inst.rocks,[]).steps||[],c=null;
    for(var i=0;i<st.length;i++)if(st[i].t==='single'){c=st[i].cell;break}
    if(c==null)for(var j=0;j<inst.sol.length;j++)if(inst.givens.indexOf(inst.sol[j])<0){c=inst.sol[j];break}
    var el=c!=null&&q(root,'.bq-c',c);return el?{tap:el,say:'Tap this safe square to place a queen.'}:null}};

/* ---- Quilt Tiles: drag a tile onto another to swap (and, on turning boards, tap to turn); matched seams stitch. ---- */
var QB=[[0,1,2,0],[0,0,3,1],[2,4,0,0],[3,0,0,4]];
function qinst(turn,st){return {level:0,title:'',R:2,C:2,turn:turn,base:QB.map(function(t){return t.slice()}),start:st.map(function(c){return {id:c[0],r:c[1]}}),par:st.length,parExact:true}}
D['quilt-tiles']={
  line:'Drag a tile onto another to swap them. Match every seam.',
  end:'Match every seam, with the plain border colour outside.',
  inst:function(){return qinst(false,[[3,0],[1,0],[2,0],[0,0]])},
  steps:[
    {wait:900,say:'Touching edges must match. Outside edges stay dark.'},
    {drag:[function(r){return q(r,'.qt-t',3)},function(r){return q(r,'.qt-t',0)}],ms:760,say:'Drag a tile onto another to swap them.',hold:300},
    {wait:1400,say:'Matching edges stitch together.'}],
  by:function(inst){return inst.turn?'turn':null},
  alt:{turn:{
    line:'Drag a tile onto another to swap; tap a tile to turn it. Match every seam.',
    inst:function(){return qinst(true,[[3,0],[1,3],[2,0],[0,0]])},
    steps:[
      {wait:800,say:'Touching edges must match. Outside edges stay dark.'},
      {drag:[function(r){return q(r,'.qt-t',3)},function(r){return q(r,'.qt-t',0)}],ms:700,say:'Drag a tile onto another to swap them.',hold:300},
      {tap:function(r){return q(r,'.qt-t',1)},say:'Tap a tile to turn it.',hold:300},
      {wait:1200,say:'Every seam matches: done.'}]}},
  guide:function(root,inst,k){if(k>0)return null;var sols=V6QT.solveAll(inst.R,inst.C,inst.base,inst.turn,4000).sols,b=V6QT.best(inst.start,sols),lay=b.lay;if(!lay)return null;
    var st=inst.start;for(var p=0;p<st.length;p++)if(st[p].id!==lay[p].id){var pb=-1;for(var j=0;j<st.length;j++)if(st[j].id===lay[p].id)pb=j;
      var a=q(root,'.qt-t',st[p].id),z=q(root,'.qt-t',st[pb].id);return a&&z?{light:a,drag:[a,z],say:'Drag the lit tile onto the circled tile to swap them.'}:null}
    return null}};

/* ---- Rolling Die: a swipe tips the die one square and turns its faces; land on the pad with the sun on top (and keep the sun off moss). ---- */
function dieTo(dx,dy){return function(r){var c=ctr(q(r,'.grd-die'));return c&&{x:c.x+dx,y:c.y+dy}}}
var NAME=['up','right','down','left'],DXY=[[0,-1],[1,0],[0,1],[-1,0]];
D['rolling-die']={
  line:'Swipe to tip the die. Land on the sun pad with the sun on top.',
  end:'Land on the sun pad with the sun face on top.',
  inst:function(){return {level:0,title:'',W:3,H:3,grid:'.........',sx:0,sy:1,ss:1,gx:2,gy:1,par:2,parExact:true,sol:[1,1]}},
  steps:[
    {wait:600,say:'The sun face is underneath. The pad wants it on top.'},
    {drag:['.grd-die',dieTo(70,0)],ms:300,say:'Swipe to tip the die one square.',hold:900},
    {drag:['.grd-die',dieTo(70,0)],ms:300,say:'Its faces turn as it rolls.',hold:1100}],
  /* moss levels: the sun face may never touch moss */
  by:function(inst){return /m/.test(inst.grid||'')?'moss':null},
  alt:{moss:{
    line:'Swipe to tip the die. The sun face may never touch moss.',
    end:'Land on the pad, sun up. Keep the sun off the moss.',
    inst:function(){return {level:0,title:'',W:3,H:3,grid:'.....m...',sx:1,sy:1,ss:3,gx:0,gy:1,par:1,parExact:true,sol:[3]}},
    steps:[
      {drag:['.grd-die',dieTo(70,0)],ms:300,say:'The sun would land on moss: not allowed.',hold:1300},
      {drag:['.grd-die',dieTo(-70,0)],ms:300,say:'The other way, the sun comes up on the pad.',hold:1200}]}},
  guide:function(root,inst,k){if(k>0||!inst.sol||!inst.sol.length)return null;var d=inst.sol[0],die=q(root,'.grd-die');if(!die)return null;
    return {light:die,pad:4,drag:[die,dieTo(DXY[d][0]*80,DXY[d][1]*80)],say:'Swipe '+NAME[d]+' to tip the die: the first step of the shortest way.'}}};

/* ---- Aqueduct: a tap turns a pipe; water runs only through joined ends; open ends leak. ---- */
function aqCur(root,inst,c){var g=q(root,'.gaq-p',c),m=/rotate\((-?\d+)deg\)/.exec(g&&g.style.transform||''),k=m?Math.round(+m[1]/90):0;return V6AQ.rot(inst.pieces[c],k)}
D['aqueduct']={
  line:'Tap a pipe to turn it a quarter. Join every fountain to the spring, with no leaks.',
  end:'Water every fountain, with no open pipe ends.',
  inst:function(){return {level:0,title:'',W:3,H:1,src:1,pieces:[1,10,4],sol:[2,10,8],par:2,parExact:true}},
  steps:[
    {wait:900,say:'Water leaks from the spring’s open ends.'},
    {tap:'.gaq-c[data-i="0"]',say:'Each tap turns a pipe a quarter, clockwise.',hold:800},
    {tap:'.gaq-c[data-i="2"]',say:'Joined pipes carry the water on.',hold:1100}],
  guide:function(root,inst,k){if(k>1)return null;for(var c=0;c<inst.W*inst.H;c++)if(aqCur(root,inst,c)!==inst.sol[c]){var el=q(root,'.gaq-c[data-i="'+c+'"]');
      return el?{tap:el,say:k?'Keep tapping until the pipe ends meet.':'Tap this pipe until its end meets the water.'}:null}return null}};

/* ---- Huarong Pass: drag a block into free space (it slides straight); free the big block through the gate below. ---- */
function hpSize(e){return e.offsetWidth/(/\b(B|H)\b/.test(e.className)?2:1)}
/* the board as it is now, read from the blocks' places (the guide follows the player's real moves) */
function hpKey(root,inst){var els=root.querySelectorAll('.hp-k'),P=[];for(var i=0;i<els.length;i++){var e=els[i],t=/\bB\b/.test(e.className)?'B':/\bV\b/.test(e.className)?'V':/\bH\b/.test(e.className)?'H':'S',C=hpSize(e),m=/translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(e.style.transform||'');
    P.push({t:t,x:m?Math.round(+m[1]/C):0,y:m?Math.round(+m[2]/C):0,w:t==='B'||t==='H'?2:1,h:t==='B'||t==='V'?2:1})}return {P:P,key:V6HP.encode(P,inst.W,inst.H)}}
D['huarong-pass']={
  line:'Drag a block into free space. Free the big block through the gate below.',
  end:'Slide the big block out through the gate.',
  inst:function(){return {level:0,title:'',W:4,H:3,gx:1,key:'.ab..cd..s..',par:2,parExact:true}},
  steps:[
    {wait:700,say:'The big block must leave by the gate below.'},
    {drag:[function(r){return q(r,'.hp-k',1)},off('.hp-k',1,function(r){return -hpSize(q(r,'.hp-k',1))},function(){return 0})],ms:560,say:'Drag a block into free space.',hold:300},
    {drag:[function(r){return q(r,'.hp-k',0)},off('.hp-k',0,function(){return 0},function(r){return hpSize(q(r,'.hp-k',0))})],ms:560,say:'Now the big block slides out.',hold:1100}],
  guide:function(root,inst,k){if(k>1)return null;var s=hpKey(root,inst),dm=V6HP.distMap(inst.key,inst.W,inst.H,inst.gx);if(!dm)return null;var d0=dm.dist.get(s.key);if(!(d0>0))return null;
    var ms=V6HP.moves(s.key,inst.W,inst.H),Pk=V6HP.decode(s.key,inst.W,inst.H);
    for(var j=0;j<ms.length;j++)if(dm.dist.get(ms[j].key)===d0-1){var pk=Pk[ms[j].i],els=root.querySelectorAll('.hp-k');
      for(var i=0;i<s.P.length;i++)if(s.P[i].x===pk.x&&s.P[i].y===pk.y&&s.P[i].t===pk.t){var e=els[i],C=hpSize(e),mv=ms[j];
        var dir=mv.dx<0?'left':mv.dx>0?'right':mv.dy<0?'up':'down';
        return {light:e,drag:[e,function(){var c=ctr(e);return {x:c.x+mv.dx*C,y:c.y+mv.dy*C}}],say:(pk.t==='B'?'Drag the big block ':'Drag this block ')+dir+'.'}}}
    return null}};

/* ---- Rectangle Cut: drag corner to corner; each rectangle holds one number and covers that many squares. ---- */
function rcPt(r,c){return function(root,inst){var g=q(root,'.grc-g');if(!g)return null;var b=g.getBoundingClientRect(),R=inst.R,C=inst.C;return {x:b.left+(c+.5)*b.width/C,y:b.top+(r+.5)*b.height/R}}}
D['rect-cut']={
  line:'Drag corner to corner to draw a rectangle. One number in each, covering that many squares.',
  end:'Cut the whole board: one number per rectangle.',
  inst:function(){return {level:0,title:'',R:2,C:3,clues:[[0,0,4],[0,2,2]],sol:[[0,0,2,2],[0,2,2,1]],par:2,parExact:true}},
  steps:[
    {drag:[rcPt(0,0),rcPt(1,1)],ms:700,say:'Drag corner to corner to draw a rectangle.',hold:300},
    {wait:700,say:'The 4 covers four squares.'},
    {drag:[rcPt(0,2),rcPt(1,2)],ms:520,say:'The 2 covers two. One number in each.',hold:1000}],
  guide:function(root,inst,k){if(k>1)return null;var st=(V6RC.deduce(inst.R,inst.C,inst.clues).steps||[]).filter(function(s){return s.t}),s=st[k];
    var t=s?s.t:inst.sol[k];if(!t)return null;var n=inst.clues[s?s.i:k][2];
    return {box:function(root2){var g=q(root2,'.grc-g'),b=g.getBoundingClientRect(),cw=b.width/inst.C,ch=b.height/inst.R;return {left:b.left+t[1]*cw,top:b.top+t[0]*ch,right:b.left+(t[1]+t[3])*cw,bottom:b.top+(t[0]+t[2])*ch}},
      drag:[rcPt(t[0],t[1]),rcPt(t[0]+t[2]-1,t[1]+t[3]-1)],say:k?'Next: draw the '+n+' here.':'The '+n+' fits only here. Drag corner to corner.'}}};
})();
