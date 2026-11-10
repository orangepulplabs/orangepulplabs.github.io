/* Zest v6 (batch g): Reversi Flip. A new puzzle (no original to override). Reversi used as a solitaire problem.
   Rules: tap an empty cell to place a dark disc. Every straight line of light discs that it sandwiches against another dark disc (in any of the
   8 directions) flips dark. A placement must flip at least one disc. You are given k discs; turn every light disc dark.
   Levels: a curated table (tests/batch_g_gen_reversi.js) built by reverse play from an all-dark board, then filtered by an exact search:
   the fewest placements is exactly k, at most two winning orders exist, "always take the biggest flip" loses (from level 3), and from level 8
   every winning first placement flips the fewest discs of all legal placements (a quiet set-up move, not the big one).
   Stuck policy (1.2.4): out of discs or no placement flips anything = 'over' at once; a legal placement after which no win is left = 'dead'
   (deferred by the kit: shown on Hint, 3+ moves later or 10 s idle, with Undo back to the last good position). */
(function(){
var ID='reversi-flip';
var D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
/* board: array of N*N, 0 empty, 1 dark, 2 light */
function flipsAt(b,N,c){if(b[c])return [];var x=c%N,y=(c/N)|0,out=[];
  for(var d=0;d<8;d++){var dx=D8[d][0],dy=D8[d][1],run=[],cx=x+dx,cy=y+dy;
    while(cx>=0&&cy>=0&&cx<N&&cy<N&&b[cy*N+cx]===2){run.push(cy*N+cx);cx+=dx;cy+=dy}
    if(run.length&&cx>=0&&cy>=0&&cx<N&&cy<N&&b[cy*N+cx]===1)for(var i=0;i<run.length;i++)out.push(run[i])}
  return out}
function legal(b,N){var m=[];for(var c=0;c<N*N;c++)if(!b[c]){var f=flipsAt(b,N,c);if(f.length)m.push({c:c,f:f})}return m}
function apply(b,c,f){var n=b.slice();n[c]=1;for(var i=0;i<f.length;i++)n[f[i]]=1;return n}
function lights(b){var n=0;for(var i=0;i<b.length;i++)if(b[i]===2)n++;return n}
/* can the board be cleared with at most k placements? returns a winning sequence of cells or null (memo on board+k) */
function win(b,N,k,memo){if(!lights(b))return [];if(k<=0)return null;memo=memo||{};var key=b.join('')+k;if(key in memo)return memo[key];
  var ms=legal(b,N),r=null;for(var i=0;i<ms.length&&!r;i++){var s=win(apply(b,ms[i].c,ms[i].f),N,k-1,memo);if(s)r=[ms[i].c].concat(s)}
  memo[key]=r;return r}
/* all winning first moves within k (used by hints and tests) */
function winningFirsts(b,N,k){var memo={},out=[];legal(b,N).forEach(function(m){if(win(apply(b,m.c,m.f),N,k-1,memo))out.push(m)});return out}
/* dihedral symmetry t (0..7) of an N*N index */
function symIdx(c,N,t){var x=c%N,y=(c/N)|0,X=x,Y=y;if(t&4){var q=X;X=Y;Y=q}if(t&1)X=N-1-X;if(t&2)Y=N-1-Y;return Y*N+X}
function symBoard(b,N,t){var o=new Array(N*N);for(var c=0;c<N*N;c++)o[symIdx(c,N,t)]=b[c];return o}
/* curated levels: [N, board string (0/1/2 per cell), k, solution cells] (written by tests/batch_g_gen_reversi.js) */
var LEVELS=[[4,"1001120000000011",1,[6]],[5,"0100102101121001201000110",1,[21]],[5,"0010110120101221001000100",2,[9,19]],[5,"0012010201102100210011001",2,[4,11]],[5,"0011000000102101222010021",2,[6,22]],[5,"0000012101002110102110200",3,[23,0,21]],[6,"120011121100020001021000100001100000",2,[2,25]],[6,"000100122211112121222000010201000100",3,[24,21,2]],[5,"0001100000201021222101010",3,[5,9,22]],[6,"112010220021001012120000011000100000",3,[23,3,12]],[6,"111110122002102022121102110120011101",3,[29,5,9]],[6,"101000012020101202000010120110101011",4,[9,11,20,23]],[6,"110100120222101221112200101111110100",3,[5,8,22]],[6,"111000122112010012021212002220100010",4,[25,29,5,14]],[6,"000220120210001200120001011120010001",4,[12,2,5,21]],[6,"001001011210102221001100000222102201",4,[34,31,23,13]],[6,"000200121201120201012201010000101010",3,[2,4,27]],[6,"110001022220020022012210122221022200",5,[34,6,30,11,23]],[6,"010001202221221200201210220100001000",4,[30,0,3,17]],[6,"000110122001010221021210210220022220",5,[18,30,35,9,23]]];
function make(level,rng){var L=Math.max(1,Math.min(LEVELS.length,level|0||1)),e=LEVELS[L-1],N=e[0],b=e[1].split('').map(Number),t=L===1?0:pzInt(rng,8);
  var bb=symBoard(b,N,t),sol=e[3].map(function(c){return symIdx(c,N,t)});
  return {level:L,title:'Level '+L,N:N,board:bb,k:e[2],par:e[2],parExact:true,sol:sol,sym:t}}
window.V6RF={flipsAt:flipsAt,legal:legal,apply:apply,lights:lights,win:win,winningFirsts:winningFirsts,symIdx:symIdx,symBoard:symBoard,LEVELS:LEVELS,make:make};

var CSS=''
+'.gv{position:relative;width:100%;max-width:380px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);'
+'--gv-felt1:#3E8E63;--gv-felt2:#2F7350;--gv-line:rgba(10,40,24,.38);--gv-dark1:#4A4642;--gv-dark2:#15130F;--gv-light1:#FFFDF6;--gv-light2:#E4DCC8;--gv-dot:rgba(255,255,255,.55);--gv-rim:#1F5A3B}'
+':root[data-theme="dark"] .gv{--gv-felt1:#2B6B49;--gv-felt2:#1E4F35;--gv-line:rgba(0,0,0,.45);--gv-dark1:#3A3733;--gv-dark2:#0B0A08;--gv-light1:#F3EEDF;--gv-light2:#CFC6AE;--gv-dot:rgba(255,255,255,.42);--gv-rim:#123826}'
+'.gv-top{display:flex;align-items:center;justify-content:center;gap:12px;min-height:36px;width:100%}'
+'.gv-tray{display:flex;gap:6px;align-items:center;min-height:30px;padding:3px 10px;border-radius:17px;background:var(--surface);box-shadow:0 0 0 1.5px var(--line)}'
+'.gv-tray i{width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--gv-dark1),var(--gv-dark2) 70%);box-shadow:0 2px 0 rgba(0,0,0,.35);transition:opacity .2s,scale .2s}'
+'.gv-tray i.used{opacity:.16;scale:.7;box-shadow:none}'
+'.gv-b{position:relative;width:100%;aspect-ratio:1;border-radius:20px;padding:3%;box-sizing:border-box;background:linear-gradient(160deg,var(--gv-felt1),var(--gv-felt2));box-shadow:inset 0 0 0 4px var(--gv-rim),0 8px 20px rgba(10,40,20,.22);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.gv-g{position:relative;width:100%;height:100%;display:grid;gap:0;border-radius:8px;box-shadow:0 0 0 1.5px var(--gv-line)}'
+'.gv-c{position:relative;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 .75px var(--gv-line);cursor:pointer;perspective:300px}'
+'.gv-c:focus-visible{outline:3px solid #fff;outline-offset:-3px}'
+'.gv-c.lg::after{content:"";width:22%;height:22%;border-radius:50%;background:var(--gv-dot);transition:scale .15s}'
+'.gv-c.lg.pv::after{scale:1.6;background:#fff}'
+'.gv-d{position:absolute;inset:9%;transform-style:preserve-3d;pointer-events:none}'
+'.gv-d b{position:absolute;inset:0;border-radius:50%;backface-visibility:hidden;-webkit-backface-visibility:hidden}'
+'.gv-d b.k{background:radial-gradient(circle at 35% 30%,var(--gv-dark1),var(--gv-dark2) 72%);box-shadow:0 3px 0 rgba(0,0,0,.35),inset 0 -3px 4px rgba(0,0,0,.5)}'
+'.gv-d b.w{background:radial-gradient(circle at 35% 30%,var(--gv-light1),var(--gv-light2) 75%);box-shadow:0 3px 0 rgba(0,0,0,.28),inset 0 -3px 4px rgba(0,0,0,.12);transform:rotateY(180deg)}'
+'.gv-d.lt{transform:rotateY(180deg)}'
+'.gv-d.pv b.w{box-shadow:0 0 0 3px #F6B73C,0 3px 0 rgba(0,0,0,.28)}'
+'.gv-d.pv{animation:rfwob .5s ease-in-out infinite}@keyframes rfwob{0%,100%{translate:0 0}50%{translate:0 -2px}}'
+'.zk-rm .gv-d.pv{animation:none}@media (prefers-reduced-motion:reduce){.gv-d.pv{animation:none}}';

function mount(root,inst,api){ZK.css(CSS,'gv-css');root.textContent='';
  var N=inst.N,rm=ZK.rm(api),b=inst.board.slice(),hist=[],hints=0,fin=false,ghost=null,idle=null,offs=[],pend=[],last=null;
  var stage=document.createElement('div');stage.className='gv zk-stage zk-host'+(rm?' zk-rm':'');
  var top=document.createElement('div');top.className='gv-top';
  var tray=document.createElement('div');tray.className='gv-tray';tray.setAttribute('role','img');var trayI=[];
  for(var i=0;i<inst.k;i++){var t=document.createElement('i');tray.appendChild(t);trayI.push(t)}
  var LDISC='<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#F3EEDF" stroke="#8A8270" stroke-width="2"/></svg>';
  var ctr=ZK.counter({icon:LDISC,label:function(n){return n+' light disc'+(n===1?'':'s')+' left'}});
  top.appendChild(tray);top.appendChild(ctr.el);
  var board=document.createElement('div');board.className='gv-b zk-board';board.setAttribute('role','grid');
  var grid=document.createElement('div');grid.className='gv-g';grid.style.gridTemplateColumns='repeat('+N+',1fr)';grid.style.gridTemplateRows='repeat('+N+',1fr)';board.appendChild(grid);
  var cells=[],discs=[];
  for(var c=0;c<N*N;c++){var ce=document.createElement('div');ce.className='gv-c';ce.setAttribute('data-zkc','');ce.setAttribute('role','gridcell');ce.tabIndex=-1;ce.dataset.i=c;grid.appendChild(ce);cells.push(ce);discs.push(null)}
  stage.appendChild(top);stage.appendChild(board);root.appendChild(stage);
  function disc(c,col){var d=document.createElement('div');d.className='gv-d'+(col===2?' lt':'');d.innerHTML='<b class="k"></b><b class="w"></b>';cells[c].appendChild(d);discs[c]=d;return d}
  function render(){for(var c=0;c<N*N;c++){if(b[c]&&!discs[c])disc(c,b[c]);if(!b[c]&&discs[c]){discs[c].remove();discs[c]=null}
      if(discs[c])discs[c].classList.toggle('lt',b[c]===2)}
    marks();var left=inst.k-hist.length;trayI.forEach(function(t,i){t.classList.toggle('used',i>=left)});
    tray.setAttribute('aria-label',left+' disc'+(left===1?'':'s')+' to place');ctr.set(lights(b),true);label()}
  var LG={};function marks(){LG={};if(!fin&&hist.length<inst.k)legal(b,N).forEach(function(m){LG[m.c]=m.f});
    for(var c=0;c<N*N;c++)cells[c].classList.toggle('lg',!!LG[c])}
  function label(){board.setAttribute('aria-label','Board '+N+' by '+N+'. '+lights(b)+' light discs, '+(inst.k-hist.length)+' dark discs to place.');
    for(var c=0;c<N*N;c++)cells[c].setAttribute('aria-label','Row '+((c/N|0)+1)+', column '+(c%N+1)+': '+(b[c]===1?'dark':b[c]===2?'light':LG[c]?'empty, flips '+LG[c].length:'empty'))}
  /* press preview: the discs this placement would flip lift and glow */
  var pv=null;function preview(c){unpreview();if(!LG[c])return;pv=c;cells[c].classList.add('pv');LG[c].forEach(function(f){if(discs[f])discs[f].classList.add('pv')});ZK.sfx('press')}
  function unpreview(){if(pv==null)return;cells[pv].classList.remove('pv');for(var c=0;c<N*N;c++)if(discs[c])discs[c].classList.remove('pv');pv=null}
  /* a refused move is named at once in the line under the board (the kit's rule chip is for moves that are made, and its Undo would undo an earlier move) */
  var tellT=0;function tell(msg){if(api.say)api.say(msg);var h=root.closest&&root.closest('.pz5');h=h&&h.querySelector('.pzh');if(!h)return;h.textContent=msg;clearTimeout(tellT);tellT=setTimeout(function(){if(h.textContent===msg)h.textContent=''},1900)}
  function flush(){pend.forEach(function(t){clearTimeout(t)});pend=[];render()}
  function place(c){if(fin)return;flush();ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);unpreview();
    if(hist.length>=inst.k){ZK.wrong(tray);return}
    var f=LG[c];if(!f){ZK.wrong(cells[c]);tell(b[c]?'That cell is taken.':'A disc there would not flip anything.');return}
    hist.push({c:c,f:f.slice(),b:b.slice()});b=apply(b,c,f);last=c;api.moved();
    /* travel: the disc drops in from the tray, then the lines flip in a ripple outward from it */
    var used=trayI[inst.k-hist.length];if(used)used.classList.add('used');
    var d=disc(c,1);marks();ZK.sfx('clack');ZK.buzz('move');
    if(!rm){var tr=ZK.at(board,used||tray),ca=ZK.at(board,cells[c]);
      ZK.anim(d,[{transform:'translate('+(tr.x-ca.x)+'px,'+(tr.y-ca.y)+'px) scale(.55)',opacity:.6},{transform:'translate(0,-10px) scale(1.12)',opacity:1,offset:.75},{transform:'none'}],260,'cubic-bezier(.3,.7,.4,1)')}
    var x0=c%N,y0=(c/N)|0,base=rm?0:110;
    f.forEach(function(fc){var dist=Math.max(Math.abs(fc%N-x0),Math.abs(((fc/N)|0)-y0)),dl=rm?0:base+dist*50;
      pend.push(setTimeout(function(){var e=discs[fc];if(!e)return;e.classList.remove('lt');
        if(!rm)ZK.anim(e,[{transform:'rotateY(180deg) translateZ(0)'},{transform:'rotateY(90deg) translateZ(14px)',offset:.5},{transform:'rotateY(0deg)'}],300,'cubic-bezier(.3,.6,.4,1)');
        ZK.sfx('click',{p:dist+2})},dl))});
    var tEnd=rm?0:Math.min(380,base+50*f.reduce(function(m,fc){return Math.max(m,Math.max(Math.abs(fc%N-x0),Math.abs(((fc/N)|0)-y0)))},0)+120);
    ctr.set(lights(b));label();
    if(!lights(b)){fin=true;marks();ZK.stuck(stage,false);if(api.say)api.say('Every disc is dark.');
      pend.push(setTimeout(function(){ZK.sfx('cap',{n:4});ZK.buzz('pop');var g=ZK.at(board,cells[c]);ZK.burst(board,g.x,g.y,{n:12,r:46,colors:['#F6B73C','#fff','#3E8E63']});
        api.done({solved:true,moves:hist.length,hints:hints,extra:{par:inst.par}})},tEnd));return}
    var left=inst.k-hist.length;
    if(!left)ZK.stuck(stage,true,{kind:'over',text:'Out of discs: '+lights(b)+' light left',onUndo:undo});
    else if(!Object.keys(LG).length)ZK.stuck(stage,true,{kind:'over',text:'No placement flips a light disc',onUndo:undo});
    else if(!win(b,N,left))ZK.stuck(stage,true,{kind:'dead',text:'The light discs can’t all be flipped now',onUndo:undo});
    else ZK.stuck(stage,false)}
  function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  function cellAt(e){var t=e.target&&e.target.closest?e.target.closest('.gv-c'):null;return t&&grid.contains(t)?+t.dataset.i:-1}
  var down=-1;
  L(grid,'pointerdown',function(e){down=cellAt(e);if(down>=0)preview(down)});
  L(grid,'pointerleave',function(){unpreview();down=-1});
  L(grid,'pointercancel',function(){unpreview();down=-1});
  L(grid,'pointerup',function(e){var c=cellAt(e),d0=down;down=-1;unpreview();if(c<0||c!==d0)return;place(c)});
  L(grid,'keydown',function(e){var c=document.activeElement&&document.activeElement.dataset?+document.activeElement.dataset.i:0,n=c;
    if(e.key==='ArrowRight')n=Math.min(N*N-1,c+1);else if(e.key==='ArrowLeft')n=Math.max(0,c-1);else if(e.key==='ArrowDown')n=Math.min(N*N-1,c+N);else if(e.key==='ArrowUp')n=Math.max(0,c-N);
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();place(c);return}else return;e.preventDefault();cells[n].focus()});
  cells[0].tabIndex=0;
  render();
  if(inst.level===1&&inst.sol&&inst.sol.length){var s0=inst.sol[0];ghost=ZK.ghost(stage,[{tap:cells[s0],down:function(){preview(s0)},up:function(){unpreview()}}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin||!hist.length)return false;flush();var h=hist.pop();b=h.b;var d=discs[h.c];
    if(d&&!rm){discs[h.c]=null;ZK.anim(d,[{transform:'none',opacity:1},{transform:'translateY(-14px) scale(.6)',opacity:0}],180,ZK.EASE);setTimeout(function(){d.remove()},180)}
    render();h.f.forEach(function(fc){if(discs[fc]&&!rm)ZK.anim(discs[fc],[{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],220)});
    last=hist.length?hist[hist.length-1].c:null;ZK.stuck(stage,false);ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true}
  return{undo:undo,
    restart:function(){if(fin)return;flush();b=inst.board.slice();hist=[];render();ZK.stuck(stage,false);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;flush();ZK.unmark(stage);var left=inst.k-hist.length,ws=left>0?winningFirsts(b,N,left):[];
      if(!ws.length){ZK.mark(document.querySelector('.pz5 [data-undo]'));return hist.length?'This can’t be finished from here. Undo a placement.':'No win from here.'}
      hints++;var best=ws[0],ms=legal(b,N),mx=0;ms.forEach(function(m){if(m.f.length>mx)mx=m.f.length});
      if(lv<=1){if(best.f.length<mx)return 'The biggest flip is a trap here. A quieter disc sets up a long line.';return 'Count the lines each placement would close.'}
      if(lv===2){ZK.mark(cells[best.c]);return 'Try this cell.'}
      place(best.c);return 'Placed one for you.'},
    destroy:function(){pend.forEach(function(t){clearTimeout(t)});if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last!=null?cells[last]:board},
    moves:function(){return hist.length},
    state:function(){return{board:b.slice(),N:N,k:inst.k,used:hist.length,moves:hist.length,fin:fin,lights:lights(b)}}}}

ZK.override({id:ID,name:'Reversi Flip',family:'logic',theme:'F9',blurb:'Sandwich the light discs to flip them dark.',
  how:'Tap an empty cell to place a dark disc. Light lines it sandwiches flip. Flip them all with the discs you have.',
  areas:['logic','planning'],levels:LEVELS.length||20,secs:80,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'All dark with '+m+' disc'+(m===1?'':'s')+'.'+(res.hints?' With a hint.':'')}}});
})();
