/* Zest v6 new puzzle (batch f): Quilt Tiles (MacMahon-style edge matching; a NEW id).
   Each square tile is split corner to corner into four triangles, one colour per edge. Drag a tile onto another to swap them; from level 9
   (a new board) tap a tile to turn it a quarter. Goal: every pair of touching edges shows the same colour (a stitched seam), and every edge
   on the outside of the quilt is the plain border colour, the colour of the frame.
   Levels are CURATED by tests/batch_f_gen_quilt.js: random seam colours, then a backtracking solver (raster order, seam pruning) keeps a
   layout only if its answer is unique (up to turning the whole quilt, on boards where tiles turn), and counts the dead ends a careful
   left-to-right player meets: from level 4 at least one tile that fits its seams at that point has to come out again (two places look right
   until a far seam decides); later levels need more. Par = the fewest moves to the answer: swaps (tiles minus cycles of the needed
   permutation) plus quarter turns, minimised over every answer layout (identical tiles, turned quilt).
   No dead ends exist (any swap or turn can be taken back), so no stuck chip; idle 25 s glows Hint. */
(function(){
var ID='quilt-tiles';
var LEVELS=[[3,3,0,[[0,3,1,0],[0,3,2,3],[0,0,3,3],[1,2,1,0],[2,3,3,2],[3,0,1,3],[1,2,0,0],[3,2,0,2],[1,0,0,2]],[[0,0],[1,0],[2,0],[3,0],[4,0],[8,0],[5,0],[7,0],[6,0]],2],[3,3,0,[[0,2,2,0],[0,2,2,2],[0,0,1,2],[2,1,3,0],[2,1,1,1],[1,0,1,1],[3,3,0,0],[1,1,0,3],[1,0,0,1]],[[2,0],[1,0],[6,0],[3,0],[4,0],[5,0],[7,0],[0,0],[8,0]],3],[3,3,0,[[0,3,2,0],[0,2,2,3],[0,0,2,2],[2,3,1,0],[2,2,1,3],[2,0,3,2],[1,2,0,0],[1,2,0,2],[3,0,0,2]],[[2,0],[1,0],[5,0],[7,0],[4,0],[3,0],[6,0],[0,0],[8,0]],4],[3,4,0,[[0,3,1,0],[0,3,2,3],[0,3,2,3],[0,0,2,3],[1,1,1,0],[2,1,1,1],[2,1,2,1],[2,0,3,1],[1,2,0,0],[1,3,0,2],[2,3,0,3],[3,0,0,3]],[[3,0],[7,0],[8,0],[4,0],[0,0],[11,0],[6,0],[1,0],[2,0],[9,0],[10,0],[5,0]],5],[3,4,0,[[0,2,3,0],[0,2,3,2],[0,1,2,2],[0,0,1,1],[3,1,1,0],[3,2,1,1],[2,1,2,2],[1,0,3,1],[1,1,0,0],[1,3,0,1],[2,1,0,3],[3,0,0,1]],[[0,0],[9,0],[4,0],[10,0],[7,0],[5,0],[8,0],[2,0],[6,0],[3,0],[1,0],[11,0]],6],[4,4,0,[[0,2,2,0],[0,3,1,2],[0,1,1,3],[0,0,2,1],[2,1,3,0],[1,1,3,1],[1,1,2,1],[2,0,2,1],[3,2,1,0],[3,1,2,2],[2,2,3,1],[2,0,2,2],[1,2,0,0],[2,3,0,2],[3,1,0,3],[2,0,0,1]],[[5,0],[1,0],[2,0],[4,0],[15,0],[8,0],[12,0],[9,0],[0,0],[7,0],[10,0],[11,0],[6,0],[14,0],[13,0],[3,0]],7],[4,4,0,[[0,2,1,0],[0,3,3,2],[0,3,3,3],[0,0,3,3],[1,3,2,0],[3,3,1,3],[3,1,3,3],[3,0,2,1],[2,1,3,0],[1,3,3,1],[3,2,1,3],[2,0,1,2],[3,2,0,0],[3,2,0,2],[1,3,0,2],[1,0,0,3]],[[8,0],[13,0],[2,0],[3,0],[11,0],[9,0],[7,0],[1,0],[5,0],[0,0],[10,0],[4,0],[15,0],[12,0],[14,0],[6,0]],9],[4,4,0,[[0,1,1,0],[0,1,1,1],[0,1,2,1],[0,0,1,1],[1,1,3,0],[1,3,1,1],[2,2,3,3],[1,0,2,2],[3,3,3,0],[1,3,1,3],[3,1,3,3],[2,0,1,1],[3,3,0,0],[1,2,0,3],[3,3,0,2],[1,0,0,3]],[[4,0],[13,0],[7,0],[0,0],[11,0],[5,0],[9,0],[3,0],[10,0],[2,0],[1,0],[8,0],[12,0],[6,0],[14,0],[15,0]],11],[3,3,1,[[0,3,1,0],[0,3,1,3],[0,0,3,3],[1,2,1,0],[1,3,1,2],[3,0,2,3],[1,3,0,0],[1,3,0,3],[2,0,0,3]],[[0,0],[6,0],[2,3],[3,0],[4,0],[5,0],[1,0],[7,0],[8,3]],3],[3,3,1,[[0,2,2,0],[0,1,3,2],[0,0,3,1],[2,3,2,0],[3,2,2,3],[3,0,3,2],[2,1,0,0],[2,3,0,1],[3,0,0,3]],[[1,0],[4,0],[0,0],[3,0],[5,0],[2,0],[8,0],[7,0],[6,0]],5],[3,3,1,[[0,4,4,0],[0,3,1,4],[0,0,1,3],[4,2,4,0],[1,3,1,2],[1,0,3,3],[4,2,0,0],[1,4,0,2],[3,0,0,4]],[[0,3],[3,0],[1,0],[4,0],[2,0],[5,3],[7,0],[6,0],[8,0]],6],[3,4,1,[[0,1,1,0],[0,3,2,1],[0,3,3,3],[0,0,2,3],[1,2,1,0],[2,2,1,2],[3,2,2,2],[2,0,3,2],[1,2,0,0],[1,3,0,2],[2,2,0,3],[3,0,0,2]],[[3,0],[2,0],[8,0],[11,3],[7,0],[5,0],[9,0],[1,0],[4,0],[6,0],[10,0],[0,0]],7],[3,4,1,[[0,1,4,0],[0,4,2,1],[0,1,4,4],[0,0,4,1],[4,3,2,0],[2,1,3,3],[4,2,2,1],[4,0,4,2],[2,2,0,0],[3,2,0,2],[2,2,0,2],[4,0,0,2]],[[8,0],[0,0],[6,0],[3,0],[2,0],[5,0],[7,0],[4,0],[11,0],[9,3],[10,0],[1,3]],8],[3,3,1,[[0,4,3,0],[0,2,3,4],[0,0,4,2],[3,2,3,0],[3,2,3,2],[4,0,3,2],[3,1,0,0],[3,4,0,1],[3,0,0,4]],[[5,0],[3,0],[0,3],[1,3],[4,0],[2,0],[8,0],[7,3],[6,0]],7],[3,4,1,[[0,2,1,0],[0,4,2,2],[0,4,1,4],[0,0,4,4],[1,4,3,0],[2,3,2,4],[1,2,4,3],[4,0,4,2],[3,2,0,0],[2,4,0,2],[4,4,0,4],[4,0,0,4]],[[7,0],[3,0],[5,0],[9,0],[2,0],[6,0],[0,0],[8,0],[10,0],[1,0],[4,0],[11,0]],9],[4,4,1,[[0,1,4,0],[0,3,2,1],[0,3,3,3],[0,0,3,3],[4,1,4,0],[2,3,4,1],[3,3,1,3],[3,0,1,3],[4,2,4,0],[4,4,3,2],[1,1,4,4],[1,0,4,1],[4,2,0,0],[3,3,0,2],[4,4,0,3],[4,0,0,4]],[[0,0],[1,0],[7,0],[15,0],[11,0],[9,0],[6,0],[8,3],[2,0],[5,0],[14,0],[4,0],[12,3],[13,3],[10,3],[3,0]],10],[4,4,1,[[0,3,4,0],[0,3,3,3],[0,3,2,3],[0,0,1,3],[4,2,4,0],[3,3,4,2],[2,2,3,3],[1,0,4,2],[4,1,3,0],[4,2,1,1],[3,4,2,2],[4,0,1,4],[3,3,0,0],[1,3,0,3],[2,3,0,3],[1,0,0,3]],[[11,0],[1,0],[14,0],[7,0],[6,0],[10,0],[5,0],[2,0],[4,0],[9,0],[8,0],[3,0],[0,0],[12,0],[13,0],[15,0]],11],[3,4,1,[[0,1,2,0],[0,2,3,1],[0,3,1,2],[0,0,2,3],[2,4,1,0],[3,4,2,4],[1,3,3,4],[2,0,3,3],[1,3,0,0],[2,1,0,3],[3,1,0,1],[3,0,0,1]],[[5,0],[0,0],[10,3],[3,0],[6,0],[4,0],[7,3],[1,0],[8,0],[9,0],[11,0],[2,0]],9],[4,4,1,[[0,1,1,0],[0,4,3,1],[0,3,1,4],[0,0,4,3],[1,3,1,0],[3,4,3,3],[1,1,4,4],[4,0,4,1],[1,2,4,0],[3,2,1,2],[4,3,4,2],[4,0,3,3],[4,3,0,0],[1,3,0,3],[4,4,0,3],[3,0,0,4]],[[1,0],[2,3],[5,0],[14,0],[11,3],[0,0],[13,3],[7,0],[10,0],[9,3],[8,0],[4,0],[12,0],[6,3],[3,0],[15,0]],12],[4,4,1,[[0,2,1,0],[0,3,4,2],[0,4,4,3],[0,0,4,4],[1,2,1,0],[4,3,3,2],[4,3,1,3],[4,0,2,3],[1,4,4,0],[3,4,3,4],[1,2,3,4],[2,0,3,2],[4,3,0,0],[3,3,0,3],[3,2,0,3],[3,0,0,2]],[[4,0],[7,3],[2,3],[11,0],[1,0],[5,0],[13,0],[12,0],[9,0],[8,0],[6,0],[10,0],[3,0],[0,0],[14,0],[15,3]],13],[4,4,1,[[0,3,1,0],[0,3,1,3],[0,4,3,3],[0,0,4,4],[1,1,4,0],[1,1,2,1],[3,2,1,1],[4,0,2,2],[4,1,1,0],[2,2,2,1],[1,2,1,2],[2,0,4,2],[1,3,0,0],[2,3,0,3],[1,2,0,3],[4,0,0,2]],[[15,0],[1,3],[7,0],[3,0],[9,0],[4,3],[6,0],[8,0],[0,0],[5,0],[13,0],[11,2],[12,0],[10,0],[14,0],[2,3]],12],[4,4,1,[[0,2,2,0],[0,3,1,2],[0,2,1,3],[0,0,2,2],[2,2,4,0],[1,4,4,2],[1,4,1,4],[2,0,2,4],[4,2,3,0],[4,1,2,2],[1,3,4,1],[2,0,4,3],[3,1,0,0],[2,2,0,1],[4,4,0,2],[4,0,0,4]],[[15,0],[14,0],[12,3],[3,0],[0,3],[5,0],[9,0],[7,0],[1,0],[8,3],[10,1],[11,3],[2,0],[13,0],[6,2],[4,0]],14],[4,4,1,[[0,2,5,0],[0,5,2,2],[0,2,4,5],[0,0,3,2],[5,3,4,0],[2,2,2,3],[4,3,5,2],[3,0,3,3],[4,2,2,0],[2,3,3,2],[5,3,2,3],[3,0,3,3],[2,2,0,0],[3,3,0,2],[2,3,0,3],[3,0,0,3]],[[10,3],[14,3],[1,0],[3,3],[0,0],[5,0],[6,3],[13,0],[2,3],[9,0],[7,0],[11,0],[12,0],[4,3],[8,0],[15,2]],15],[4,4,1,[[0,1,1,0],[0,1,1,1],[0,3,1,1],[0,0,2,3],[1,3,1,0],[1,4,1,3],[1,3,1,4],[2,0,2,3],[1,3,1,0],[1,2,4,3],[1,4,4,2],[2,0,3,4],[1,1,0,0],[4,1,0,1],[4,4,0,1],[3,0,0,4]],[[2,0],[11,0],[3,3],[4,0],[13,0],[5,3],[8,0],[15,0],[10,0],[7,0],[6,0],[9,0],[12,0],[0,0],[14,0],[1,3]],13],[4,4,1,[[0,2,2,0],[0,5,4,2],[0,3,4,5],[0,0,3,3],[2,2,2,0],[4,2,5,2],[4,4,3,2],[3,0,3,4],[2,4,5,0],[5,4,2,4],[3,1,2,4],[3,0,1,1],[5,3,0,0],[2,2,0,3],[2,3,0,2],[1,0,0,3]],[[0,0],[1,3],[2,3],[4,0],[12,2],[15,2],[3,3],[10,3],[8,0],[13,0],[7,3],[11,3],[6,0],[9,0],[14,0],[5,0]],16],[4,4,1,[[0,4,3,0],[0,5,1,4],[0,4,2,5],[0,0,4,4],[3,3,3,0],[1,2,2,3],[2,1,1,2],[4,0,5,1],[3,4,2,0],[2,3,5,4],[1,4,1,3],[5,0,3,4],[2,3,0,0],[5,4,0,3],[1,4,0,4],[3,0,0,4]],[[9,3],[11,0],[3,3],[1,0],[4,3],[5,0],[6,0],[0,0],[8,0],[14,0],[10,0],[7,0],[12,3],[2,3],[13,3],[15,3]],15],[4,4,1,[[0,1,1,0],[0,5,3,1],[0,1,5,5],[0,0,4,1],[1,2,4,0],[3,2,1,2],[5,2,2,2],[4,0,1,2],[4,3,2,0],[1,5,1,3],[2,3,2,5],[1,0,1,3],[2,1,0,0],[1,5,0,1],[2,2,0,5],[1,0,0,2]],[[15,0],[13,0],[12,0],[9,3],[4,3],[7,0],[6,2],[11,3],[8,0],[3,3],[10,0],[2,3],[5,3],[1,3],[14,0],[0,3]],17],[4,4,1,[[0,2,1,0],[0,2,2,2],[0,4,4,2],[0,0,3,4],[1,4,4,0],[2,2,2,4],[4,4,2,2],[3,0,4,4],[4,1,3,0],[2,1,3,1],[2,2,3,1],[4,0,1,2],[3,2,0,0],[3,4,0,2],[3,1,0,4],[1,0,0,1]],[[0,0],[1,0],[2,2],[8,3],[9,0],[5,0],[7,3],[6,3],[13,0],[11,3],[4,0],[10,0],[12,3],[3,2],[15,2],[14,0]],18],[4,4,1,[[0,4,1,0],[0,3,1,4],[0,1,4,3],[0,0,1,1],[1,4,2,0],[1,2,1,4],[4,5,4,2],[1,0,1,5],[2,5,3,0],[1,2,4,5],[4,3,5,2],[1,0,2,3],[3,1,0,0],[4,2,0,1],[5,2,0,2],[2,0,0,2]],[[7,3],[8,0],[4,0],[2,0],[11,3],[9,3],[6,3],[12,3],[1,0],[5,3],[0,0],[10,0],[3,0],[13,0],[14,3],[15,3]],17],[4,4,1,[[0,1,4,0],[0,5,1,1],[0,3,3,5],[0,0,5,3],[4,4,3,0],[1,1,3,4],[3,3,4,1],[5,0,5,3],[3,1,3,0],[3,3,3,1],[4,4,2,3],[5,0,4,4],[3,2,0,0],[3,5,0,2],[2,5,0,5],[4,0,0,5]],[[0,0],[14,3],[9,2],[4,0],[2,0],[7,3],[12,3],[6,0],[8,0],[3,0],[1,2],[11,0],[5,0],[15,3],[10,2],[13,0]],19]]; /*LEVELS*/
/* ---- core: a tile is [top,right,bottom,left], 0 = border colour ---- */
function rot(t,r){r=((r%4)+4)%4;var o=t.slice();for(var i=0;i<r;i++)o=[o[3],o[0],o[1],o[2]];return o}
/* all answer layouts: [{id, r}] per position, given base tiles; turn = tiles may turn; cap answers */
function solveAll(R,C,base,turn,cap){cap=cap||4000;var N=R*C,used=new Array(N).fill(false),cur=new Array(N),out=[],dead=0,nodes=0;
  function fits(p,e){var x=p%C,y=(p/C)|0;if(y===0&&e[0]!==0)return false;if(y===R-1&&e[2]!==0)return false;if(x===0&&e[3]!==0)return false;if(x===C-1&&e[1]!==0)return false;
    if(y>0&&e[0]===0)return false;if(x>0&&e[3]===0)return false;if(y<R-1&&e[2]===0)return false;if(x<C-1&&e[1]===0)return false;
    if(y>0){var u=cur[p-C];if(rot(base[u.id],u.r)[2]!==e[0])return false}if(x>0){var l=cur[p-1];if(rot(base[l.id],l.r)[1]!==e[3])return false}return true}
  function rec(p){if(out.length>=cap)return true;if(p===N){out.push(cur.slice());return true}var any=false;
    for(var i=0;i<N;i++){if(used[i])continue;for(var r=0;r<(turn?4:1);r++){var e=rot(base[i],r);if(!fits(p,e))continue;nodes++;used[i]=true;cur[p]={id:i,r:r};if(rec(p+1))any=true;else dead++;used[i]=false}}
    return any}
  rec(0);return{sols:out,dead:dead,nodes:nodes}}
/* the colour pattern of a layout (for counting distinct answers) */
function pattern(R,C,base,lay){return lay.map(function(c){return rot(base[c.id],c.r).join('')}).join('|')}
function rotPattern(R,C,base,lay){/* turn the whole quilt a quarter (square boards only) */var N=R*C,o=new Array(N);for(var y=0;y<R;y++)for(var x=0;x<C;x++){var p=y*C+x,np=x*C+(R-1-y);o[np]={id:lay[p].id,r:lay[p].r+1}}return o}
function rot180(lay){var N=lay.length;return lay.map(function(_,p){var c=lay[N-1-p];return{id:c.id,r:c.r+2}})}
function distinct(R,C,base,sols,turn){var seen={},n=0;sols.forEach(function(l){var k=pattern(R,C,base,l);if(turn&&R===C){var ks=[k],q=l;for(var i=0;i<3;i++){q=rotPattern(R,C,base,q);ks.push(pattern(R,C,base,q))}k=ks.sort()[0]}else if(turn){var k2=pattern(R,C,base,rot180(l));k=[k,k2].sort()[0]}if(!seen[k]){seen[k]=1;n++}});return n}
/* moves from state (pos -> {id,r}) to an answer layout: swaps (N - cycles over misplaced ids) + quarter turns (clockwise taps) */
function cost(st,lay){var N=st.length,where={};st.forEach(function(c,p){where[c.id]=p});var seen={},sw=0,rt=0;
  for(var p=0;p<N;p++){var want=lay[p].id;var cr=st[where[want]].r;rt+=((lay[p].r-cr)%4+4)%4}
  /* permutation: tile at position p must go to position target(id) */
  var tgt={};lay.forEach(function(c,p){tgt[c.id]=p});for(var p2=0;p2<N;p2++){if(seen[p2])continue;var len=0,q=p2;while(!seen[q]){seen[q]=1;len++;q=tgt[st[q].id]}sw+=len-1}
  return sw+rt}
function best(st,sols){var b=Infinity,bl=null;sols.forEach(function(l){var c=cost(st,l);if(c<b){b=c;bl=l}});return{cost:b,lay:bl}}
function solved(R,C,base,st){var N=R*C;for(var p=0;p<N;p++){var x=p%C,y=(p/C)|0,e=rot(base[st[p].id],st[p].r);
    if((y===0)!==(e[0]===0)||(y===R-1)!==(e[2]===0)||(x===0)!==(e[3]===0)||(x===C-1)!==(e[1]===0))return false;
    if(x<C-1&&rot(base[st[p+1].id],st[p+1].r)[3]!==e[1])return false;if(y<R-1&&rot(base[st[p+C].id],st[p+C].r)[0]!==e[2])return false}return true}
/* a level row: [R, C, turn, base tiles, start state [[id,r]...], par] */
function make(level,rng){level=Math.max(1,Math.min(LEVELS.length,level|0||1));var L=LEVELS[level-1];
  return{level:level,title:'Level '+level,R:L[0],C:L[1],turn:!!L[2],base:L[3].map(function(t){return t.slice()}),start:L[4].map(function(c){return{id:c[0],r:c[1]}}),par:L[5],parExact:true}}
window.V6QT={make:make,rot:rot,solveAll:solveAll,distinct:distinct,cost:cost,best:best,solved:solved,levels:function(){return LEVELS}};

var COLS=[['#3E3A52','#2A2738'],['#E4572E','#B83A16'],['#F2C14E','#C9962A'],['#3E9C8A','#2A7364'],['#8E6CC0','#674A94'],['#5E9FE0','#356FAE']];
var CSS=''
+'.qt{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);--qt-frame:#3E3A52;--qt-bg:#E9E1D2;--qt-stitch:rgba(255,255,255,.9)}'
+':root[data-theme="dark"] .qt{--qt-bg:#25211C;--qt-stitch:rgba(255,248,235,.85)}'
+'.qt-b{position:relative;box-sizing:border-box;padding:10px;border-radius:18px;background:var(--qt-frame);box-shadow:0 0 0 3px var(--qt-bg),0 0 0 5px rgba(62,58,82,.35),0 6px 16px rgba(0,0,0,.22);touch-action:none;user-select:none;-webkit-user-select:none}'
+'.qt-in{position:relative}'
+'.qt-t{all:unset;position:absolute;left:0;top:0;box-sizing:border-box;padding:2px;cursor:grab;-webkit-tap-highlight-color:transparent;transition:transform .24s cubic-bezier(.25,1.3,.5,1);will-change:transform;z-index:2}'
+'.qt-t.drag{transition:none;z-index:5;cursor:grabbing}.qt-t.drag svg{filter:drop-shadow(0 10px 10px rgba(0,0,0,.35))}'
+'.qt-t svg{display:block;width:100%;height:100%;border-radius:6px;transition:transform .22s cubic-bezier(.3,1.4,.5,1)}'
+'.qt-t.over svg{outline:3px dashed rgba(255,255,255,.85);outline-offset:-3px}'
+'.qt-t:focus-visible svg{outline:3px solid #fff;outline-offset:-3px}'
+'.qt-t.zk-mark{outline:none}.qt-t.zk-mark svg{animation:zkmark 1s ease-in-out infinite}'
+'.qt-st{position:absolute;pointer-events:none;z-index:3;border-color:var(--qt-stitch);border-style:dashed;border-width:0;opacity:0;transition:opacity .2s}'
+'.qt-st.h{height:0;border-top-width:2.5px}.qt-st.v{width:0;border-left-width:2.5px}.qt-st.on{opacity:1}'
+'.zk-rm .qt-t,.zk-rm .qt-t svg,.zk-rm .qt-st{transition:none}@media (prefers-reduced-motion:reduce){.qt-t,.qt-t svg,.qt-st{transition:none}}';
var MOTIF=['','',/*dot*/'<circle cx="0" cy="0" r="3.2" fill="rgba(0,0,0,.28)"/>',/*bar*/'<rect x="-5" y="-1.6" width="10" height="3.2" rx="1.6" fill="rgba(255,255,255,.45)"/>',/*ring*/'<circle cx="0" cy="0" r="3.6" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2"/>',/*cross*/'<path d="M-3.5 -3.5L3.5 3.5M3.5 -3.5L-3.5 3.5" stroke="rgba(255,255,255,.6)" stroke-width="2" stroke-linecap="round"/>'];
function tileSvg(e){var tri=[['50,50 0,0 100,0',50,17],['50,50 100,0 100,100',83,50],['50,50 100,100 0,100',50,83],['50,50 0,100 0,0',17,50]],s='<svg viewBox="0 0 100 100" aria-hidden="true">';
  tri.forEach(function(t,i){var c=COLS[e[i]];s+='<polygon points="'+t[0]+'" fill="'+c[0]+'" stroke="'+c[1]+'" stroke-width="1.2" stroke-linejoin="round"/>';if(MOTIF[e[i]])s+='<g transform="translate('+t[1]+' '+t[2]+')">'+MOTIF[e[i]]+'</g>'});
  return s+'<path d="M0 0L100 100M100 0L0 100" stroke="rgba(0,0,0,.18)" stroke-width="1"/></svg>'}

function mount(root,inst,api){ZK.css(CSS,'qt-css');root.textContent='';
  var R=inst.R,C=inst.C,N=R*C,turn=inst.turn,base=inst.base,rm=ZK.rm(api),st=inst.start.map(function(c){return{id:c.id,r:c.r}}),hist=[],hints=0,undos=0,fin=false,last=null,idle=null,ghost=null,offs=[],drag=null,swallow=false;
  var SOLS=solveAll(R,C,base,turn,4000).sols;
  var stage=document.createElement('div');stage.className='qt zk-stage zk-host'+(rm?' zk-rm':'');
  var b=document.createElement('div');b.className='qt-b zk-board';b.setAttribute('role','group');b.setAttribute('aria-label','Quilt, '+C+' by '+R+' tiles');
  var inn=document.createElement('div');inn.className='qt-in';b.appendChild(inn);
  var els=[];for(var i=0;i<N;i++)(function(i){var e=document.createElement('button');e.type='button';e.className='qt-t zk-p';e.setAttribute('data-zkc','');
    e.innerHTML=tileSvg(base[i]);e.onclick=function(){if(swallow)return;tapTile(i)};els.push(e);inn.appendChild(e)})(i);
  var sts=[];for(var p=0;p<N;p++){var x=p%C,y=(p/C)|0;if(x<C-1){var s1=document.createElement('i');s1.className='qt-st v';s1.dataset.a=p;s1.dataset.b=p+1;inn.appendChild(s1);sts.push(s1)}
    if(y<R-1){var s2=document.createElement('i');s2.className='qt-st h';s2.dataset.a=p;s2.dataset.b=p+C;inn.appendChild(s2);sts.push(s2)}}
  var pips=ZK.pips(inst.par);
  stage.appendChild(b);stage.appendChild(pips.el);root.appendChild(stage);
  var T=72;
  function posOf(id){for(var p=0;p<N;p++)if(st[p].id===id)return p;return -1}
  function layout(){var avail=(stage.clientWidth||300)-20;T=Math.floor(Math.min(avail/C,96,((window.innerHeight||700)-300)/R));if(T<48)T=48;
    inn.style.width=(T*C)+'px';inn.style.height=(T*R)+'px';els.forEach(function(e){e.style.width=e.style.height=T+'px'});
    sts.forEach(function(s){var a=+s.dataset.a,bb=+s.dataset.b,x=a%C,y=(a/C)|0;if(bb===a+1){s.style.left=((x+1)*T-1)+'px';s.style.top=(y*T+T*.3)+'px';s.style.height=(T*.4)+'px'}
      else{s.style.top=((y+1)*T-1)+'px';s.style.left=(x*T+T*.3)+'px';s.style.width=(T*.4)+'px'}});paint(true)}
  function place(id,dx,dy,lift){var p=posOf(id),x=p%C,y=(p/C)|0;els[id].style.transform='translate('+(x*T+(dx||0))+'px,'+(y*T+(dy||0))+'px)'+(lift?' scale(1.08)':'')}
  function edges(p){return rot(base[st[p].id],st[p].r)}
  function paint(quiet){for(var p=0;p<N;p++){var id=st[p].id;place(id);var sv=els[id].firstChild;sv.style.transform='rotate('+(st[p].r*90)+'deg)';
      var x=p%C,y=(p/C)|0;els[id].setAttribute('aria-label','Tile at row '+(y+1)+', column '+(x+1))}
    var got=0;sts.forEach(function(s){var a=+s.dataset.a,bb=+s.dataset.b,ea=edges(a),eb=edges(bb),ok=bb===a+1?ea[1]===eb[3]&&ea[1]!==0:ea[2]===eb[0]&&ea[2]!==0;
      if(ok&&!s.classList.contains('on')){got++}s.classList.toggle('on',ok)});return got}
  function L(tg,ty,fn,o){tg.addEventListener(ty,fn,o);offs.push(function(){tg.removeEventListener(ty,fn,o)})}
  function after(newSeams){if(newSeams>0){ZK.sfx('cap',{n:Math.min(8,countOn())>>1});ZK.buzz('tap')}
    if(solved(R,C,base,st)&&!fin){fin=true;api.say('Every seam matches.');
      if(!rm)sts.forEach(function(s,i){ZK.anim(s,[{opacity:1,transform:'scale(1)'},{opacity:1,transform:'scale(1.6)'},{opacity:1,transform:'scale(1)'}],300,'ease-out',i*18)});
      ZK.anim(b,[{boxShadow:'0 0 0 3px var(--qt-bg),0 0 0 5px rgba(62,58,82,.35),0 6px 16px rgba(0,0,0,.22)'},{boxShadow:'0 0 0 3px var(--qt-bg),0 0 0 10px rgba(246,183,60,.6),0 6px 16px rgba(0,0,0,.22)'},{boxShadow:'0 0 0 3px var(--qt-bg),0 0 0 5px rgba(62,58,82,.35),0 6px 16px rgba(0,0,0,.22)'}],520);
      setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:220)}}
  function countOn(){var n=0;sts.forEach(function(s){if(s.classList.contains('on'))n++});return n}
  function doSwap(pa,pb,o){o=o||{};var t=st[pa];st[pa]=st[pb];st[pb]=t;if(!o.undo){hist.push(['s',pa,pb]);api.moved();pips.set(hist.length)}last=els[st[pb].id];ZK.unmark(stage);
    var g=paint();ZK.sfx('slide');ZK.buzz('move');
    if(!rm){[pa,pb].forEach(function(p){var e=els[st[p].id].firstChild;setTimeout(function(){ZK.anim(e,[{scale:'1'},{scale:'.94'},{scale:'1'}],200,ZK.SPRING)},200)})}
    setTimeout(function(){after(o.undo?0:g)},rm?0:200)}
  function doTurn(p,o){o=o||{};var d=o.undo?-1:1;st[p].r=(st[p].r+d+4)%4;if(!o.undo){hist.push(['r',p]);api.moved();pips.set(hist.length)}last=els[st[p].id];ZK.unmark(stage);
    var g=paint();ZK.sfx('click',{p:st[p].r});ZK.buzz('tap');setTimeout(function(){after(o.undo?0:g)},rm?0:200)}
  function tapTile(id){if(fin)return;var p=posOf(id);if(!turn){ZK.wrong(els[id].firstChild,{silent:true});ZK.sfx('press');return}stopGhost();doTurn(p)}
  function stopGhost(){if(ghost){ghost.stop();ghost=null}ZK.ghostDone(turn?ID+'-t':ID)}
  function hitPos(cx,cy){var r=inn.getBoundingClientRect(),x=Math.floor((cx-r.left)/T),y=Math.floor((cy-r.top)/T);if(x<0||y<0||x>=C||y>=R)return -1;return y*C+x}
  var overEl=null;
  L(b,'pointerdown',function(e){if(fin)return;var el=e.target.closest&&e.target.closest('.qt-t');if(!el)return;var id=els.indexOf(el);drag={id:id,x0:e.clientX,y0:e.clientY,pid:e.pointerId,on:false};ZK.sfx('press')});
  L(document,'pointermove',function(e){if(!drag||e.pointerId!==drag.pid)return;var dx=e.clientX-drag.x0,dy=e.clientY-drag.y0;
    if(!drag.on){if(Math.hypot(dx,dy)<8)return;drag.on=true;els[drag.id].classList.add('drag');stopGhost();ZK.sfx('lift')}
    place(drag.id,dx,dy-10,true);var hp=hitPos(e.clientX,e.clientY),te=hp>=0?els[st[hp].id]:null;if(te===els[drag.id])te=null;
    if(overEl!==te){if(overEl)overEl.classList.remove('over');overEl=te;if(te)te.classList.add('over')}});
  function end(e){if(!drag||(e&&e.pointerId!==drag.pid))return;var d=drag;drag=null;if(overEl){overEl.classList.remove('over');overEl=null}if(!d.on)return;
    els[d.id].classList.remove('drag');swallow=true;setTimeout(function(){swallow=false},60);var hp=hitPos(e.clientX,e.clientY),pa=posOf(d.id);
    if(hp>=0&&hp!==pa)doSwap(pa,hp);else{place(d.id);ZK.sfx('soft')}}
  L(document,'pointerup',end);L(document,'pointercancel',end);
  L(window,'resize',function(){layout()});
  layout();pips.set(0);
  idle=ZK.idle(stage,25000);
  /* the best next move toward the nearest answer */
  function nextMove(){var bb=best(st,SOLS),lay=bb.lay;if(!lay)return null;
    for(var p=0;p<N;p++){if(st[p].id!==lay[p].id){return{t:'swap',a:p,b:posOf(lay[p].id),cost:bb.cost}}}
    for(var p2=0;p2<N;p2++)if(st[p2].r!==lay[p2].r)return{t:'turn',a:p2,cost:bb.cost};return null}
  if(inst.level===1){var m0=nextMove();if(m0&&m0.t==='swap'){var ea=els[st[m0.a].id],eb=els[st[m0.b].id];
      ghost=ZK.ghost(stage,[{drag:[ea,eb],down:function(){ea.classList.add('drag');ea.style.transition='transform .76s cubic-bezier(.45,0,.3,1)'},move:function(){var pa=m0.a,pb=m0.b;ea.style.transform='translate('+((pb%C)*T)+'px,'+(((pb/C)|0)*T-10)+'px) scale(1.08)'},
        up:function(){ea.classList.remove('drag');ea.style.transition='';paint()}}],{id:ID,level:1})}}
  /* the first board where tiles turn: a short demo of the tap-to-turn (the tile turns and turns back) */
  var ft=-1;for(var li=0;li<LEVELS.length;li++)if(LEVELS[li][2]){ft=li+1;break}
  if(turn&&inst.level===ft&&!ghost){var bl=best(st,SOLS).lay,tp=-1;for(var q2=0;q2<N&&tp<0;q2++)if(bl&&st[q2].id===bl[q2].id&&st[q2].r!==bl[q2].r)tp=q2;if(tp<0)for(var q3=0;q3<N&&tp<0;q3++)if(bl&&st[q3].r!==bl[q3].r)tp=q3;
    if(tp>=0){var te2=els[st[tp].id],sv2=te2.firstChild;ghost=ZK.ghost(stage,[{tap:te2,down:function(){sv2.style.transform='rotate('+((st[tp].r+1)*90)+'deg)'},up:function(){sv2.style.transform='rotate('+(st[tp].r*90)+'deg)'},hold:1000}],{id:ID+'-t',level:1})}}
  return{undo:function(){if(fin||!hist.length)return false;var h=hist.pop();undos++;pips.set(hist.length);if(h[0]==='s')doSwap(h[1],h[2],{undo:true});else doTurn(h[1],{undo:true});ZK.sfx('undo');return true},
    restart:function(){if(fin)return;st=inst.start.map(function(c){return{id:c.id,r:c.r}});hist=[];paint();pips.set(0);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var m=nextMove();ZK.unmark(stage);if(!m)return null;hints++;
      if(lv<=1){/* teach: corners and edges first */var cor=[0,C-1,N-C,N-1],wrongCorner=cor.filter(function(p){var x=p%C,y=(p/C)|0,e=edges(p);return !((y===0)===(e[0]===0)&&(x===0)===(e[3]===0)&&(x===C-1)===(e[1]===0)&&(y===R-1)===(e[2]===0))});
        if(wrongCorner.length){ZK.mark(els[st[wrongCorner[0]].id]);return 'A corner tile shows the border colour on its two outside edges.'}
        ZK.mark(els[st[m.a].id]);return m.cost+' moves can finish the quilt. Look at this tile’s seams.'}
      if(lv===2){if(m.t==='swap'){ZK.mark([els[st[m.b].id],els[st[m.a].id]]);return 'Swap these two.'}ZK.mark(els[st[m.a].id]);return 'Turn this one.'}
      if(m.t==='swap')doSwap(m.a,m.b);else doTurn(m.a);return 'Done for you.'},
    destroy:function(){if(idle)idle.stop();if(ghost)ghost.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    next:function(){var m=nextMove();if(!m)return null;return m.t==='swap'?{t:'swap',a:st[m.a].id,b:st[m.b].id}:{t:'turn',a:st[m.a].id}},
    state:function(){return{st:st.map(function(c){return[c.id,c.r]}),moves:hist.length,fin:fin}}}}

ZK.override({id:ID,name:'Quilt Tiles',family:'grid',theme:'F8',blurb:'Swap and turn the tiles until every seam matches.',
  how:'Drag a tile onto another to swap them; tap to turn. Match every seam, plain border outside.',
  areas:['space','logic'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'Stitched in '+m+' move'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
