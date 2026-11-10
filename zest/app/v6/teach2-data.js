/* teach2 prototype data (Docs/v6/teach2.md): the Show me demo and the level-1 guided start for four puzzles.
   Format: see the header of teach2.js. Each demo runs the puzzle's own code on a tiny board of its own (never a real level), 3-6 s, one caption line.
   Loaded after teach2.js; teach2.js reads ZT.DEMO lazily. */
(function(){
if(!window.ZT)return;var D=ZT.DEMO=ZT.DEMO||{};
function q(root,sel,i){return root.querySelectorAll(sel)[i||0]}
function union(els){var r=null;els.forEach(function(e){if(!e)return;var b=e.getBoundingClientRect();if(!r)r={left:b.left,top:b.top,right:b.right,bottom:b.bottom};else{r.left=Math.min(r.left,b.left);r.top=Math.min(r.top,b.top);r.right=Math.max(r.right,b.right);r.bottom=Math.max(r.bottom,b.bottom)}});return r}

/* ---- Picture Rows: what the numbers mean is the whole puzzle. A 3x3 picture: "3" fills a row, "1 1" is one, a gap, one. ---- */
D['picture-rows']={
  line:'Each number is a run of filled squares, in order.',
  end:'Match every number and the picture appears.',
  inst:function(){var rows=['r.r','rrr','.r.'],cl=V6PR.cluesOf(rows);return {level:0,title:'',name:'demo',rows:rows,W:cl.W,H:cl.H,R:cl.R,C:cl.C,par:4,fills:6}},
  steps:[
    {mark:function(r){return q(r,'.zpr-rc',1)},say:'3 means three filled squares in a row.',hold:500},
    {drag:['[data-i="3"]','[data-i="5"]'],ms:620,hold:200},
    {mark:function(r){return q(r,'.zpr-rc',0)},say:'1 1 means one, a gap, then one.',hold:450},
    {tap:'[data-i="0"]',hold:40},{tap:'[data-i="2"]',hold:120},
    {tap:'[data-i="7"]',say:'1 means one square.',hold:500}],
  /* level 1 (the heart): the two full rows, which need no thinking once the numbers make sense */
  guide:function(root,inst,k){var full=[];for(var y=0;y<inst.H;y++)if(inst.R[y].length===1&&inst.R[y][0]===inst.W)full.push(y);var y2=full[k];if(y2==null||k>1)return null;
    var W=inst.W,cells=[];for(var x=0;x<W;x++)cells.push(root.querySelector('[data-i="'+(y2*W+x)+'"]'));
    return {box:function(r){return union([q(r,'.zpr-rc',y2)].concat(cells))},drag:[cells[0],cells[W-1]],
      say:k===0?'This '+W+' means all '+W+' squares are filled. Drag along the row.':'This row is '+W+' too.'}}};

/* ---- Gear Train: a dial needs a gear on its peg, touching gears turn each other, and (decision 4, 8 Nov) smaller gears turn faster.
   The demo board has two dials: the left one wants the drive's own speed (a medium gear), the right one a faster turn (a small gear). ---- */
var GT={W:13.6,H:12.2,pegs:[[7.6,8.4],[3.743,3.804],[10.814,4.57]],drive:0,dsize:2,outs:[{p:1,dir:-1,sp:1},{p:2,dir:-1,sp:1.5}],tray:[1,1,0],sol:[2,2,1],par:2};
function peg(root,lv,i,dy){var b=root.querySelector('.zgt-b');if(!b)return null;var r=b.getBoundingClientRect(),u=r.width/lv.W,p=lv.pegs[i];return {x:r.left+p[0]*u,y:r.top+p[1]*u+(dy||0)}}
D['gear-train']={
  line:'Drag gears onto pegs. Touching gears turn opposite ways; smaller ones turn faster.',
  end:'Make every dial turn like its orange hand.',
  inst:function(){return {level:0,title:'',lv:GT,par:2,parExact:true}},
  steps:[
    /* the gear rides 56 px above the finger, as in the game, so the finger ends under the peg */
    {drag:['.zgt-tok[data-size="2"]',function(r,inst){return peg(r,inst.lv,1,56)}],ms:700,say:'Drag a gear on. Touching gears turn opposite ways.',hold:650},
    {drag:['.zgt-tok[data-size="1"]',function(r,inst){return peg(r,inst.lv,2,56)}],ms:700,say:'Smaller gears turn faster.',hold:300},
    {wait:1400,say:'Each dial now turns like its orange hand.'}],
  guide:function(root,inst,k){if(k>0)return null;var lv=inst.lv,tgt=-1;for(var i=0;i<lv.pegs.length;i++)if(lv.sol[i]&&i!==lv.drive){tgt=i;break}if(tgt<0)return null;
    var tok=root.querySelector('.zgt-tok[data-size="'+lv.sol[tgt]+'"]');return {light:tok,drag:[tok,function(r){return peg(r,lv,tgt,0)}],say:lv.outs.some(function(o){return o.p===tgt})?'Drag this gear onto the dial’s peg.':'Start here: drag this gear onto the ringed peg.',above:false}}};
/* the goal line and the Rules said "ghost hand", a word nobody knows yet; the hand is drawn dashed and orange */
function goal(){try{if(ZT.T2&&!ZT.T2.on)return;var t=ZT.T['gear-train'];if(t){t[0]='Make every dial turn like its orange hand';
  t[1]=['Drag a gear from the tray onto a peg.','Gears that touch turn opposite ways; smaller gears turn faster.','Make every dial turn the way and speed its orange hand shows.']}}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',goal);else goal();

/* ---- Code Cracker: the pips are the whole puzzle, and the goal is all pips filled. ---- */
D['code-cracker']={
  line:'Guess, then Check. ● right peg, right slot. ○ right peg, wrong slot.',
  end:'Three filled pips: the code is cracked.',
  flail:false,   /* pegs go in with taps; only Check counts a move */
  inst:function(){return {level:0,len:3,size:4,rep:false,lo:1,code:[3,2,4],par:2}},
  steps:[
    {tap:function(r){return q(r,'.cc-key',0)},say:'Tap pegs to make a guess.',hold:20},{tap:function(r){return q(r,'.cc-key',1)},hold:20},{tap:function(r){return q(r,'.cc-key',2)},hold:20},
    {tap:'.cc-go',say:'Then Check.',hold:200},
    {wait:1500,say:'● right peg, right slot. ○ right peg, wrong slot.'},
    {tap:function(r){return q(r,'.cc-key',2)},hold:20},{tap:function(r){return q(r,'.cc-key',1)},hold:20},{tap:function(r){return q(r,'.cc-key',3)},hold:20},{tap:'.cc-go',hold:500}],
  guide:function(root,inst,k){
    if(k===0)return {light:'.cc-pal',say:'Tap pegs to fill your guess.',until:function(r){return !r.querySelector('.cc-slot:not(.full)')}};
    if(k===1)return {tap:'.cc-go',say:'Now tap Check to see the clue.'};
    return null}};

/* ---- Living Stones: breathing spaces (the amber dots) and what filling the last one does. ---- */
D['living-stones']={
  line:'Fill the last breathing space (amber dot) of the marked group to capture it.',
  end:'Capture the marked group with the stones you have.',
  inst:function(){return {level:0,title:'',size:5,rows:['.....','..x..','.xox.','.....','.....'],target:12,type:'cap',k:1,par:1,sol:17,parExact:true}},
  steps:[
    {mark:function(r){return q(r,'.dk-pt',17)},say:'The amber dot: the white stone’s last breathing space.',hold:1300},
    {tap:function(r){return q(r,'.dk-pt',17)},say:'Fill it, and the white stone is captured.',hold:1300}],
  /* save levels ask the opposite: keep your own marked group alive */
  by:function(inst){return inst.type},
  alt:{save:{line:'Give your marked group more breathing spaces (amber dots) so it lives.',end:'Keep the marked dark group alive.',
    inst:function(){return {level:0,title:'',size:5,rows:['.....','..o..','.oxo.','.....','.....'],target:12,type:'save',k:1,par:1,sol:17,parExact:true}},
    steps:[{mark:function(r){return q(r,'.dk-pt',17)},say:'Your marked stone has one breathing space left.',hold:1300},
      {tap:function(r){return q(r,'.dk-pt',17)},say:'Grow into it: more breathing spaces, and it lives.',hold:1600}]}},
  guide:function(root,inst,k){if(k>0)return null;var b=root.querySelectorAll('.dk-pt')[inst.sol];return b?{tap:b,say:'Place your stone on the amber dot.',above:true}:null}};
})();
