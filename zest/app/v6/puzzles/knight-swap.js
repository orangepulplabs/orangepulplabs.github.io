/* Zest v6 (batch g): Knight Swap. A new puzzle after Paolo Guarini's problem (1512). Knights hop in an L to an empty square; nothing is
   captured. Get the light knights onto the dark knights' squares and the dark knights onto the light knights' squares (each square shows,
   as a ring, the colour that must end there).
   State space: C(n,a)*C(n-a,a) placements (at most about 60,000 here); a backward BFS from the goal runs once when the board opens, so par is
   exact and hints are instant. Every hop can be hopped back, so there is no dead end and no stuck chip.
   Levels: a curated table (tests/batch_g_gen_knight.js). From level 4 the board's knight graph branches (it is not one ring), and every
   shortest solution has to move a knight AWAY from the squares it is heading for at least once (a knight steps into a side pocket and waits). */
(function(){
var ID='knight-swap',KM=[[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]];
/* board: W, H, cells string ('#' square, '.' none); pieces: array per square index: 0 empty, 1 light, 2 dark */
function adj(W,H,cells){var A=[];for(var c=0;c<W*H;c++){A.push([]);if(cells[c]!=='#')continue;var x=c%W,y=(c/W)|0;
    for(var k=0;k<8;k++){var nx=x+KM[k][0],ny=y+KM[k][1];if(nx<0||ny<0||nx>=W||ny>=H)continue;var n=ny*W+nx;if(cells[n]==='#')A[c].push(n)}}return A}
function key(p){return p.join('')}
/* backward BFS from the goal (lights on the dark start squares, darks on the light start squares); returns dist map by key */
function distMap(W,H,cells,start){var A=adj(W,H,cells),goal=start.map(function(v){return v===1?2:v===2?1:0}),gk=key(goal),D={},q=[goal];D[gk]=0;
  for(var i=0;i<q.length;i++){var p=q[i],dk=D[key(p)];for(var c=0;c<p.length;c++){if(!p[c])continue;var a=A[c];for(var j=0;j<a.length;j++){var n=a[j];if(p[n])continue;
        var np=p.slice();np[n]=p[c];np[c]=0;var k=key(np);if(D[k]===undefined){D[k]=dk+1;q.push(np)}}}}
  return D}
function moves(A,p){var out=[];for(var c=0;c<p.length;c++){if(!p[c])continue;var a=A[c];for(var j=0;j<a.length;j++)if(!p[a[j]])out.push([c,a[j]])}return out}
/* curated levels: [W, H, cells, start pieces string] (tests/batch_g_gen_knight.js) */
var LEVELS=[[3,4,"############","000000100020"],[3,4,"#.#######.##","200000100000"],[4,5,".#.##.#########.####","00002000011020000000"],[4,5,"##########...#######","10000000020000001002"],[4,4,"##########.##.##","0000220110000000"],[3,4,"####.#######","100000202010"],[3,5,"######.#####.##","000120002001000"],[4,4,"#.##.#.#########","0000010202000010"],[3,3,"####.####","101000202"],[4,5,"##.####.#####.####.#","00020000011200000000"],[4,5,"######.#...######.##","00020001000000201000"],[3,4,"############","001201212000"]];
function make(level,rng){var L=Math.max(1,Math.min(LEVELS.length,level|0||1)),e=LEVELS[L-1],W=e[0],H=e[1],cells=e[2],pc=e[3];
  /* a random mirror for daily and reel copies */
  if(L>1){var t=pzInt(rng,4);if(t&1){var c2='',p2='';for(var y=0;y<H;y++)for(var x=0;x<W;x++){c2+=cells[y*W+W-1-x];p2+=pc[y*W+W-1-x]}cells=c2;pc=p2}
    if(t&2){var c3='',p3='';for(var y2=0;y2<H;y2++)for(var x2=0;x2<W;x2++){c3+=cells[(H-1-y2)*W+x2];p3+=pc[(H-1-y2)*W+x2]}cells=c3;pc=p3}}
  var start=pc.split('').map(Number),D=distMap(W,H,cells,start);
  return {level:L,title:'Level '+L,W:W,H:H,cells:cells,start:start,par:D[key(start)],parExact:true}}
window.V6KS={adj:adj,distMap:distMap,moves:moves,key:key,LEVELS:LEVELS,make:make};

var CSS=''
+'.gks{position:relative;width:100%;max-width:380px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);'
+'--gks-a:#EADBC0;--gks-b:#C9A97E;--gks-hole:transparent;--gks-lt1:#FFFDF6;--gks-lt2:#E2D7BE;--gks-dk1:#57504A;--gks-dk2:#1D1A16;--gks-ink:#1B1916;--gks-glow:#F6B73C}'
+':root[data-theme="dark"] .gks{--gks-a:#5A4D3B;--gks-b:#43392C;--gks-lt1:#F6F1E4;--gks-lt2:#CFC4AA;--gks-dk1:#4A443E;--gks-dk2:#0E0C0A;--gks-ink:#0E0C0A}'
+'.gks-b{position:relative;width:100%;touch-action:none;user-select:none;-webkit-user-select:none}'
+'.gks-g{position:relative;width:100%}'
+'.gks-c{position:absolute;box-sizing:border-box;border-radius:10px;cursor:pointer}'
+'.gks-c.sq{background:var(--gks-a);box-shadow:inset 0 -3px 0 rgba(0,0,0,.08)}.gks-c.sq.alt{background:var(--gks-b)}'
+'.gks-c .ring{position:absolute;inset:14%;border-radius:50%;border:4px dashed transparent;opacity:.9}'
+'.gks-c.want1 .ring{border-color:#FFFDF6;box-shadow:0 0 0 1.5px rgba(0,0,0,.25)}.gks-c.want2 .ring{border-color:#2A2520}'
+':root[data-theme="dark"] .gks-c.want2 .ring{border-color:#0A0908;box-shadow:0 0 0 1.5px rgba(255,255,255,.25)}'
+'.gks-c.ok .ring{border-style:solid;border-color:#F6B73C!important;box-shadow:0 0 10px 2px rgba(246,183,60,.6)!important;opacity:1}'
+'.gks-c.tg::after{content:"";position:absolute;inset:32%;border-radius:50%;background:var(--gks-glow);box-shadow:0 0 12px 4px rgba(246,183,60,.7);animation:kstg 1s ease-in-out infinite}'
+'@keyframes kstg{50%{transform:scale(1.2)}}'
+'.gks-n{position:absolute;left:0;top:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:3;will-change:transform}'
+'.gks-n svg{width:84%;height:84%;filter:drop-shadow(0 3px 2px rgba(0,0,0,.3))}'
+'.gks-n.l path.b{fill:url(#ksgl)}.gks-n.d path.b{fill:url(#ksgd)}.gks-n path.b{stroke:var(--gks-ink);stroke-width:2;stroke-linejoin:round}'
+'.gks-n.d path.b{stroke:#000}.gks-n .eye{fill:var(--gks-ink)}.gks-n.d .eye{fill:#F3EEDF}'
+'.gks-n.up{z-index:5}.gks-n.up svg{filter:drop-shadow(0 10px 6px rgba(0,0,0,.3))}'
+'.zk-rm .gks-c.tg::after{animation:none}@media (prefers-reduced-motion:reduce){.gks-c.tg::after{animation:none}}';
var HORSE='<svg viewBox="0 0 40 40"><defs><linearGradient id="ksgl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFDF6"/><stop offset="1" stop-color="#D9CDB2"/></linearGradient><linearGradient id="ksgd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5E5650"/><stop offset="1" stop-color="#16130F"/></linearGradient></defs>'
 +'<path class="b" d="M11 35h19l-1-4c-.4-5 2.6-8.6 2.6-14.4C31.6 9.4 26.6 5.4 20.4 6l-2-3.2-1.8 4C13 8.4 9.6 12.6 8.2 16.8l-1 3.8c-.4 2 1.6 3.4 3.4 2.4l3.6-2c1.4-.8 3 .2 2.8 1.8-.6 4-5.6 6.4-6 12.2z"/><circle class="eye" cx="20.5" cy="12.5" r="1.7"/></svg>';

function mount(root,inst,api){ZK.css(CSS,'gks-css');root.textContent='';
  var W=inst.W,H=inst.H,cells=inst.cells,rm=ZK.rm(api),p=inst.start.slice(),A=adj(W,H,cells),D=null,hist=[],hints=0,fin=false,ghost=null,idle=null,offs=[],sel=-1,last=null;
  var stage=document.createElement('div');stage.className='gks zk-stage zk-host'+(rm?' zk-rm':'');
  var pips=ZK.pips(inst.par);
  var board=document.createElement('div');board.className='gks-b zk-board';board.setAttribute('role','grid');
  var grid=document.createElement('div');grid.className='gks-g';grid.style.aspectRatio=W+' / '+H;board.appendChild(grid);
  var pw=100/W,ph=100/H,sq=[],kn={},want=inst.start.map(function(v){return v===1?2:v===2?1:0});
  for(var c=0;c<W*H;c++){var e=document.createElement('div');var x=c%W,y=(c/W)|0;e.style.left=(x*pw+.6)+'%';e.style.top=(y*ph+.6)+'%';e.style.width=(pw-1.2)+'%';e.style.height=(ph-1.2)+'%';
    if(cells[c]==='#'){e.className='gks-c sq'+((x+y)%2?' alt':'')+(want[c]?' want'+want[c]:'');e.setAttribute('data-zkc','');e.setAttribute('role','gridcell');e.dataset.i=c;e.innerHTML='<i class="ring"></i>'}
    else e.className='gks-c';grid.appendChild(e);sq.push(e)}
  stage.appendChild(pips.el);stage.appendChild(board);root.appendChild(stage);
  function knight(c){var n=document.createElement('div');n.className='gks-n '+(p[c]===1?'l':'d');n.style.width=pw+'%';n.style.height=ph+'%';n.innerHTML=HORSE;n.style.transform='translate('+(c%W)*100+'%,'+((c/W)|0)*100+'%)';grid.appendChild(n);return n}
  for(var c1=0;c1<W*H;c1++)if(p[c1])kn[c1]=knight(c1);
  function pos(c){return 'translate('+(c%W)*100+'%,'+((c/W)|0)*100+'%)'}
  function refresh(){for(var c=0;c<W*H;c++)if(cells[c]==='#')sq[c].classList.toggle('ok',!!want[c]&&p[c]===want[c]);label()}
  function label(){var left=0;for(var c=0;c<W*H;c++)if(want[c]&&p[c]!==want[c])left++;board.setAttribute('aria-label','Knight board. '+left+' knight'+(left===1?'':'s')+' still to place.');
    for(var c2=0;c2<W*H;c2++)if(cells[c2]==='#')sq[c2].setAttribute('aria-label','Row '+((c2/W|0)+1)+', column '+(c2%W+1)+': '+(p[c2]===1?'light knight':p[c2]===2?'dark knight':'empty')+(want[c2]?', wants '+(want[c2]===1?'light':'dark'):''))}
  function targets(c){return A[c].filter(function(n){return !p[n]})}
  function lift(c){drop();if(!p[c])return;sel=c;var n=kn[c];n.classList.add('up');ZK.anim(n,[{transform:pos(c)},{transform:pos(c)+' translateY(-10%) scale(1.12)'}],120,ZK.EASE,0,'forwards');
    targets(c).forEach(function(t){sq[t].classList.add('tg')});ZK.sfx('lift');ZK.buzz('tap')}
  function drop(keep){if(sel<0)return;var n=kn[sel];if(n){n.classList.remove('up');if(!keep){n.getAnimations().forEach(function(a){a.cancel()});n.style.transform=pos(sel)}}
    for(var c=0;c<W*H;c++)sq[c].classList.remove('tg');sel=-1}
  function hop(a,b){if(fin)return false;if(!p[a]||p[b]||A[a].indexOf(b)<0){return false}
    ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);drop(true);
    var n=kn[a];delete kn[a];kn[b]=n;p[b]=p[a];p[a]=0;hist.push([a,b]);last=b;api.moved();pips.set(hist.length);refresh();
    n.getAnimations().forEach(function(x){x.cancel()});n.style.transform=pos(b);n.classList.remove('up');
    if(!rm){var mid='translate('+((a%W+b%W)/2)*100+'%,'+((((a/W)|0)+((b/W)|0))/2)*100+'%) translateY(-38%) scale(1.18)';
      ZK.anim(n,[{transform:pos(a)+' translateY(-10%) scale(1.12)'},{transform:mid,offset:.5},{transform:pos(b)+' scale(1.08,.9)',offset:.85},{transform:pos(b)}],300,'cubic-bezier(.3,.6,.4,1)')}
    setTimeout(function(){ZK.sfx('clack');ZK.buzz('move');if(want[b]===p[b])ZK.sfx('cap',{n:Math.min(8,okCount())})},rm?0:250);
    if(solvedNow()){fin=true;if(api.say)api.say('Swapped.');setTimeout(function(){var g=ZK.at(board,sq[b]);ZK.burst(board,g.x,g.y,{n:12,r:46,colors:['#F6B73C','#fff','#57504A']});
        api.done({solved:true,moves:hist.length,hints:hints,extra:{par:inst.par}})},rm?0:260)}
    return true}
  function okCount(){var k=0;for(var c=0;c<W*H;c++)if(want[c]&&p[c]===want[c])k++;return k}
  function solvedNow(){for(var c=0;c<W*H;c++)if(want[c]&&p[c]!==want[c])return false;return true}
  /* input: drag a knight (it rides above the finger; the nearest glowing square locks on), or tap a knight, then a glowing square */
  var dg=null;function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  function cellAt(x,y){var r=grid.getBoundingClientRect();var cx=Math.floor((x-r.left)/r.width*W),cy=Math.floor((y-r.top)/r.height*H);if(cx<0||cy<0||cx>=W||cy>=H)return -1;var c=cy*W+cx;return cells[c]==='#'?c:-1}
  L(grid,'pointerdown',function(e){if(fin)return;var c=cellAt(e.clientX,e.clientY);if(c<0)return;
    if(sel>=0&&!p[c]){var s0=sel;if(A[s0].indexOf(c)>=0)hop(s0,c);else{ZK.wrong(sq[c]);drop()}return}
    if(p[c]){if(!targets(c).length){ZK.wrong(sq[c]);if(api.say)api.say('This knight has no free square to hop to.');return}
      lift(c);dg={c:c,x:e.clientX,y:e.clientY,id:e.pointerId,moved:false};try{grid.setPointerCapture(e.pointerId)}catch(_){}}});
  L(grid,'pointermove',function(e){if(!dg||e.pointerId!==dg.id)return;var dx=e.clientX-dg.x,dy=e.clientY-dg.y;if(!dg.moved&&Math.hypot(dx,dy)<10)return;dg.moved=true;
    var r=grid.getBoundingClientRect(),n=kn[dg.c];if(!n)return;n.getAnimations().forEach(function(a){a.cancel()});
    n.style.transform=pos(dg.c)+' translate('+dx+'px,'+(dy-r.height/H*.45)+'px) scale(1.15)'});
  L(grid,'pointerup',function(e){if(!dg||e.pointerId!==dg.id)return;var d=dg;dg=null;if(!d.moved)return;
    var r=grid.getBoundingClientRect(),hx=e.clientX,hy=e.clientY-r.height/H*.45,best=-1,bd=1e9;
    targets(d.c).forEach(function(t){var cx=r.left+(t%W+.5)*r.width/W,cy=r.top+(((t/W)|0)+.5)*r.height/H,dd=Math.hypot(cx-hx,cy-hy);if(dd<bd){bd=dd;best=t}});
    if(best>=0&&bd<r.width/W*.75){if(!hop(d.c,best))drop()}else{var n=kn[d.c];if(n){ZK.anim(n,[{transform:n.style.transform},{transform:pos(d.c)}],180,ZK.SPRING)}drop();ZK.sfx('soft')}});
  L(grid,'pointercancel',function(){if(dg){dg=null;drop()}});
  L(board,'keydown',function(e){if(e.key==='Escape')drop()});
  refresh();
  if(inst.level===1){D=D||distMap(W,H,cells,inst.start);var best0=null;moves(A,p).forEach(function(m){var np=p.slice();np[m[1]]=np[m[0]];np[m[0]]=0;if(D[key(np)]===inst.par-1&&!best0)best0=m});
    if(best0)ghost=ZK.ghost(stage,[{drag:[sq[best0[0]],sq[best0[1]]],down:function(){lift(best0[0])},up:function(){drop()}}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  function bestMove(){D=D||distMap(W,H,cells,inst.start);var cur=D[key(p)],out=null;moves(A,p).forEach(function(m){if(out)return;var np=p.slice();np[m[1]]=np[m[0]];np[m[0]]=0;if(D[key(np)]===cur-1)out=m});return out}
  function undo(){if(fin||!hist.length)return false;drop();var h=hist.pop(),a=h[0],b=h[1],n=kn[b];delete kn[b];kn[a]=n;p[a]=p[b];p[b]=0;n.style.transform=pos(a);
    ZK.anim(n,[{transform:pos(b)},{transform:pos(a)}],180,ZK.EASE);pips.set(hist.length);refresh();last=hist.length?hist[hist.length-1][1]:null;ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true}
  return{undo:undo,
    restart:function(){if(fin)return;drop();Object.keys(kn).forEach(function(k){kn[k].remove()});kn={};p=inst.start.slice();hist=[];for(var c=0;c<W*H;c++)if(p[c])kn[c]=knight(c);pips.set(0);refresh();ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;ZK.unmark(stage);var m=bestMove();if(!m)return null;hints++;var cur=D[key(p)];
      if(lv<=1)return cur+' hop'+(cur===1?'':'s')+' left at best. Sometimes a knight must step aside into a corner and wait.';
      if(lv===2){ZK.mark([sq[m[0]],sq[m[1]]]);return 'Hop this knight to the marked square.'}
      hop(m[0],m[1]);return 'Hopped one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last!=null?sq[last]:board},
    moves:function(){return hist.length},
    state:function(){return{p:p.slice(),moves:hist.length,fin:fin}}}}

ZK.override({id:ID,name:'Knight Swap',family:'move',theme:'F9',blurb:'Hop the knights until light and dark have swapped places.',
  how:'Drag a knight in an L to an empty square. Put every knight on a square of its own colour ring.',
  areas:['space','planning'],levels:LEVELS.length||16,secs:90,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'Swapped in '+m+' hop'+(m===1?'':'s')+'. The fewest is '+p+'.'+(res.hints?' With a hint.':'')}}});
})();
