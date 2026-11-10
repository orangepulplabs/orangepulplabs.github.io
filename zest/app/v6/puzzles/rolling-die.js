/* Zest v6 (batch g): Rolling Die. A new puzzle. Swipe and the die tips over one square. Bring it to the sun pad with the sun face on top.
   Moss squares: the sun face may never touch moss (the die cannot tip onto moss with the sun underneath). Rocks block.
   State = square x where the sun face is (top, bottom, north, south, east, west): BFS over at most 7x7x6 states, so par is exact and instant.
   Every roll can be rolled back, so there are no dead ends (no stuck chip is needed); a roll that breaks the moss rule is refused at once,
   kindly (a nudge, the moss shivers, a short line), and never counted.
   Levels: a curated table (tests/batch_g_gen_rolling.js): par is exact, the straight route always arrives with the sun wrong (par minus the
   distance >= 2 from level 3), and from level 9 the moss is needed (without it the route would be shorter), so the place where the die can
   turn round moves from level to level. */
(function(){
var ID='rolling-die',DX=[0,1,0,-1],DY=[-1,0,1,0],NAME=['up','right','down','left'];
/* sun position: 0 top, 1 bottom, 2 north, 3 east, 4 south, 5 west (2+d is the side facing direction d) */
function rollSun(s,d){var side=2+d,opp=2+((d+2)%4);if(s===0)return side;if(s===side)return 1;if(s===1)return opp;if(s===opp)return 0;return s}
/* grid: string of W*H chars, '.' floor, '#' rock, 'm' moss */
function canRoll(g,W,H,x,y,s,d){var nx=x+DX[d],ny=y+DY[d];if(nx<0||ny<0||nx>=W||ny>=H)return {ok:false,why:'edge'};var c=g[ny*W+nx];
  if(c==='#')return {ok:false,why:'rock'};var ns=rollSun(s,d);if(c==='m'&&ns===1)return {ok:false,why:'moss',x:nx,y:ny};return {ok:true,x:nx,y:ny,s:ns}}
/* BFS from (x,y,s) to the goal with the sun on top; returns the list of directions or null */
function solve(g,W,H,x,y,s,gx,gy){var K=function(x,y,s){return (y*W+x)*6+s},start=K(x,y,s),prev={},q=[start];prev[start]=-1;
  for(var i=0;i<q.length;i++){var k=q[i],st=k%6,c=(k/6)|0,cx=c%W,cy=(c/W)|0;if(cx===gx&&cy===gy&&st===0){var p=[];while(prev[k]!==-1){var pr=prev[k];p.unshift(pr[1]);k=pr[0]}return p}
    for(var d=0;d<4;d++){var r=canRoll(g,W,H,cx,cy,st,d);if(!r.ok)continue;var nk=K(r.x,r.y,r.s);if(prev[nk]===undefined){prev[nk]=[k,d];q.push(nk)}}}
  return null}
/* curated levels: [W, H, grid, start x, start y, start sun, goal x, goal y] (tests/batch_g_gen_rolling.js) */
var LEVELS=[[4,4,"................",0,0,5,1,1],[4,4,"..##............",3,2,3,1,2],[5,5,".#....#.....#...#........",4,2,5,4,0],[5,5,"........#................",0,0,2,1,2],[5,5,".#.....#.................",2,4,4,3,1],[5,5,"...#...#.#...#..#........",1,1,3,2,2],[6,6,"................#...#..#........#..#",3,4,3,1,3],[5,5,"...m.m...................",0,0,4,1,1],[6,6,"......m.mm.........#.m.#m..#.m.....#",1,4,1,2,5],[6,6,"...#..m#........m..#.m...m..mmm.#.#.",5,2,5,4,0],[6,6,".#....m..mm....m.#.#..m.mm.#...#....",0,3,5,3,3],[6,6,"..m....mmm#.....m.#.#.#..#...#m.m#.m",3,3,0,0,2],[6,6,"m.#.......m.....m.m..m#.....#..m..mm",5,1,5,1,1],[7,7,"......m...m..#m#m..m.##...#.....#....m#......#.#.",6,5,5,3,2],[7,7,"##.......##.......mm.m..#.....#m.#...#m.m.m......",3,2,3,4,4],[6,6,"......#..#....#m...m..m..m.#.#.m..#.",2,3,4,1,1],[7,7,".......#m.mm.#.m.m..#........mm#m....##m#...m....",0,4,1,4,6],[7,7,".m..m....m#mm..mm..#....m..#..##....m..m..m#...mm",5,5,2,6,1],[7,7,"..m...m.#....m..m...##.m.#.m....mm...#..m....m#m.",6,6,5,1,6],[7,7,"m...m....#......m.##...#.....#..m..#..#.##mm.....",6,6,5,4,6]];
function make(level,rng){var L=Math.max(1,Math.min(LEVELS.length,level|0||1)),e=LEVELS[L-1],W=e[0],H=e[1],g=e[2],sx=e[3],sy=e[4],ss=e[5],gx=e[6],gy=e[7];
  /* a random mirror for daily and reel copies (left-right; the sun's east and west swap with it) */
  if(L>1&&pzInt(rng,2)){var g2='';for(var y=0;y<H;y++)for(var x=0;x<W;x++)g2+=g[y*W+(W-1-x)];g=g2;sx=W-1-sx;gx=W-1-gx;if(ss===3)ss=5;else if(ss===5)ss=3}
  var p=solve(g,W,H,sx,sy,ss,gx,gy);
  return {level:L,title:'Level '+L,W:W,H:H,grid:g,sx:sx,sy:sy,ss:ss,gx:gx,gy:gy,par:p?p.length:0,parExact:true,sol:p}}
window.V6RD={rollSun:rollSun,canRoll:canRoll,solve:solve,LEVELS:LEVELS,make:make};

var CSS=''
+'.grd{position:relative;width:100%;max-width:380px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:var(--font);'
+'--grd-f1:#EFE7D6;--grd-f2:#E2D6BE;--grd-line:rgba(120,95,60,.18);--grd-rock1:#A39383;--grd-rock2:#6E6052;--grd-moss1:#7FAE5A;--grd-moss2:#4E8237;--grd-die1:#FFFCF4;--grd-die2:#E9E0CC;--grd-edge:#8A7A60;--grd-sun:#F6B73C;--grd-sun2:#E8790C}'
+':root[data-theme="dark"] .grd{--grd-f1:#3A342B;--grd-f2:#2F2A22;--grd-line:rgba(255,240,210,.07);--grd-rock1:#6E6152;--grd-rock2:#3F362D;--grd-moss1:#5B8A3F;--grd-moss2:#36612A;--grd-die1:#F3EDE0;--grd-die2:#CFC4AC;--grd-edge:#5E5240}'
+'.grd-view{position:relative;width:100%;perspective:760px;perspective-origin:50% 10%;touch-action:none;user-select:none;-webkit-user-select:none}'
+'.grd-b{position:relative;width:100%;transform:rotateX(30deg);transform-origin:50% 100%;transform-style:preserve-3d;border-radius:18px;background:linear-gradient(160deg,var(--grd-f1),var(--grd-f2));box-shadow:inset 0 0 0 3px rgba(120,95,60,.22),0 10px 0 rgba(120,95,60,.25)}'
+'.grd-c{position:absolute;box-sizing:border-box;box-shadow:inset 0 0 0 .75px var(--grd-line);transform-style:preserve-3d}'
+'.grd-rock{position:absolute;inset:12%;border-radius:50% 46% 52% 44%;background:radial-gradient(circle at 35% 30%,var(--grd-rock1),var(--grd-rock2) 75%);box-shadow:0 4px 0 rgba(0,0,0,.25),inset 0 -3px 4px rgba(0,0,0,.25)}'
+'.grd-moss{position:absolute;inset:4%;border-radius:30%;background:radial-gradient(circle at 30% 30%,var(--grd-moss1) 0 20%,transparent 21%),radial-gradient(circle at 70% 60%,var(--grd-moss1) 0 18%,transparent 19%),radial-gradient(circle at 40% 75%,var(--grd-moss1) 0 14%,transparent 15%),var(--grd-moss2);box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}'
+'.grd-goal{position:absolute;inset:10%;border-radius:18%;border:3px dashed var(--grd-sun2);background:rgba(246,183,60,.22);display:flex;align-items:center;justify-content:center}'
+'.grd-goal svg{width:78%;height:78%}.grd-goal svg circle{fill:#FFD86B}'
+'.grd-goal{animation:rdgoal 1.8s ease-in-out infinite}@keyframes rdgoal{50%{background:rgba(246,183,60,.42)}}'
+'.grd-spill{position:absolute;pointer-events:none;border-radius:50%;background:radial-gradient(closest-side,rgba(246,183,60,.85),rgba(246,183,60,0));transition:opacity .15s}'
+'.grd-die{position:absolute;left:0;top:0;transform-style:preserve-3d;pointer-events:none;z-index:3}'
+'.grd-cube{position:absolute;inset:7%;transform-style:preserve-3d}'
+'.grd-face{position:absolute;inset:0;border-radius:16%;background:linear-gradient(150deg,var(--grd-die1),var(--grd-die2));box-shadow:inset 0 0 0 2px var(--grd-edge);display:flex;align-items:center;justify-content:center;backface-visibility:hidden;-webkit-backface-visibility:hidden}'
+'.grd-face.f2,.grd-face.f3,.grd-face.f4,.grd-face.f5{background:linear-gradient(150deg,var(--grd-die2),var(--grd-edge))}.grd-face.f4{background:linear-gradient(180deg,var(--grd-die2),#B9AC90)}'
+'.grd-face.sun{background:radial-gradient(circle at 50% 45%,#FFE7A3,var(--grd-sun) 60%,var(--grd-sun2));box-shadow:inset 0 0 0 2px #B0700A}'
+'.grd-face svg{width:70%;height:70%;opacity:0}.grd-face.sun svg{opacity:1}'
+'.grd-shadow{position:absolute;inset:10%;border-radius:20%;background:rgba(40,30,15,.28);filter:blur(3px)}'
+'.grd-base{position:absolute;inset:2%;border-radius:22%;box-shadow:0 0 0 4px rgba(246,183,60,.9),0 0 18px 6px rgba(246,183,60,.6);opacity:0}'
+'.grd-pad{display:flex;gap:10px;align-items:center;justify-content:center}'
+'.grd-pad button{all:unset;box-sizing:border-box;width:52px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:var(--surface);box-shadow:0 0 0 1.5px var(--line),0 2px 0 var(--line);cursor:pointer;color:var(--ink)}'
+'.grd-pad button:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.grd-pad svg{width:22px;height:22px}'
+'.grd-moss.no{animation:rdno .4s ease-in-out}@keyframes rdno{25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}'
+'.zk-rm .grd-goal,.zk-rm .grd-moss.no{animation:none}@media (prefers-reduced-motion:reduce){.grd-goal,.grd-moss.no{animation:none}}';
var SUN='<svg viewBox="0 0 40 40"><g stroke="#8A4A00" stroke-width="3" stroke-linecap="round"><path d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5L32 32M8 32l3.5-3.5M28.5 11.5L32 8"/></g><circle cx="20" cy="20" r="8" fill="#FFF3C4" stroke="#8A4A00" stroke-width="3"/></svg>';
var ARW=['M12 19V5M5 12l7-7 7 7','M5 12h14M12 5l7 7-7 7','M12 5v14M5 12l7 7 7-7','M19 12H5M12 5l-7 7 7 7'];
/* the six faces: index = sun position (0 top 1 bottom 2 north 3 east 4 south 5 west) */
var FACE_T=['translateZ(H)','rotateY(180deg) translateZ(H)','rotateX(90deg) translateZ(H)','rotateY(90deg) translateZ(H)','rotateX(-90deg) translateZ(H)','rotateY(-90deg) translateZ(H)'];

function mount(root,inst,api){ZK.css(CSS,'grd-css');root.textContent='';
  var W=inst.W,H=inst.H,g=inst.grid,rm=ZK.rm(api),pos={x:inst.sx,y:inst.sy,s:inst.ss},hist=[],hints=0,fin=false,ghost=null,idle=null,offs=[],busy=null,pad=[],cellPx=40;
  var stage=document.createElement('div');stage.className='grd zk-stage zk-host'+(rm?' zk-rm':'');
  var pips=ZK.pips(inst.par);
  var view=document.createElement('div');view.className='grd-view';view.tabIndex=0;view.setAttribute('role','application');
  var board=document.createElement('div');board.className='grd-b zk-board';view.appendChild(board);
  var pw=100/W,ph=100/H,cells=[],mossEl={};board.style.aspectRatio=W+' / '+H;
  for(var y=0;y<H;y++)for(var x=0;x<W;x++){var c=document.createElement('div');c.className='grd-c';c.style.left=x*pw+'%';c.style.top=y*ph+'%';c.style.width=pw+'%';c.style.height=ph+'%';c.setAttribute('data-zkc','');
    var t=g[y*W+x];if(t==='#')c.innerHTML='<i class="grd-rock"></i>';else if(t==='m'){c.innerHTML='<i class="grd-moss"></i>';mossEl[y*W+x]=c.firstChild}
    if(x===inst.gx&&y===inst.gy)c.innerHTML='<div class="grd-goal">'+SUN+'</div>';board.appendChild(c);cells.push(c)}
  var spill=document.createElement('div');spill.className='grd-spill';board.appendChild(spill);
  var die=document.createElement('div');die.className='grd-die';die.style.width=pw+'%';die.style.height=ph+'%';
  die.innerHTML='<div class="grd-shadow"></div><div class="grd-base"></div><div class="grd-cube"></div>';board.appendChild(die);
  var cube=die.querySelector('.grd-cube'),base=die.querySelector('.grd-base'),faces=[];
  for(var f=0;f<6;f++){var fe=document.createElement('div');fe.className='grd-face f'+f;fe.innerHTML=SUN;cube.appendChild(fe);faces.push(fe)}
  var padEl=document.createElement('div');padEl.className='grd-pad';padEl.setAttribute('role','group');padEl.setAttribute('aria-label','Tip the die');
  [3,0,2,1].forEach(function(d){var b=document.createElement('button');b.type='button';b.className='zk-p';b.setAttribute('aria-label','Tip '+NAME[d]);
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="'+ARW[d]+'"/></svg>';b.onclick=function(){roll(d)};pad[d]=b;padEl.appendChild(b)});
  stage.appendChild(pips.el);stage.appendChild(view);stage.appendChild(padEl);root.appendChild(stage);
  function size(){var r=board.getBoundingClientRect();cellPx=Math.max(20,(board.offsetWidth||r.width)/W);var h=cellPx*.86;
    for(var f=0;f<6;f++)faces[f].style.transform=FACE_T[f].replace('H',(h/2).toFixed(1)+'px');cube.style.transform='translateZ('+(h/2).toFixed(1)+'px)'}
  function cubeBase(){return 'translateZ('+(cellPx*.43).toFixed(1)+'px)'}
  function place(){die.style.transform='translate('+pos.x*100+'%,'+pos.y*100+'%)';for(var f=0;f<6;f++)faces[f].classList.toggle('sun',f===pos.s);
    /* where the sun is: on top it shows; on a side it spills golden light on the floor beside that face; underneath, the base glows */
    base.style.opacity=pos.s===1?1:0;
    if(pos.s>=2){var d=pos.s-2;spill.style.opacity=1;spill.style.width=pw*1.1+'%';spill.style.height=ph*1.1+'%';spill.style.left=(pos.x+DX[d]*.62-.05)*pw+'%';spill.style.top=(pos.y+DY[d]*.62-.05)*ph+'%'}
    else spill.style.opacity=0;
    label()}
  var SUNW=['on top','underneath','facing up the board','facing right','facing down the board','facing left'];
  function label(){view.setAttribute('aria-label','Board '+W+' by '+H+'. Die at row '+(pos.y+1)+', column '+(pos.x+1)+', sun '+SUNW[pos.s]+'. Sun pad at row '+(inst.gy+1)+', column '+(inst.gx+1)+'. Swipe or use the arrow keys.')}
  /* a refused move is named at once in the line under the board (the kit's rule chip is for moves that are made, and its Undo would undo an earlier move) */
  var tellT=0;function tell(msg){if(api.say)api.say(msg);var h=root.closest&&root.closest('.pz5');h=h&&h.querySelector('.pzh');if(!h)return;h.textContent=msg;clearTimeout(tellT);tellT=setTimeout(function(){if(h.textContent===msg)h.textContent=''},1900)}
  function finishBusy(){if(busy){try{busy.finish()}catch(e){}busy=null}}
  function nudge(d){var a='translate('+pos.x*100+'%,'+pos.y*100+'%)';ZK.anim(die,[{transform:a},{transform:'translate('+(pos.x*100+DX[d]*10)+'%,'+(pos.y*100+DY[d]*10)+'%)'},{transform:a}],200,'ease-out')}
  function roll(d,quiet){if(fin)return;finishBusy();ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    var r=canRoll(g,W,H,pos.x,pos.y,pos.s,d);
    if(!r.ok){nudge(d);
      if(r.why==='moss'){var m=mossEl[r.y*W+r.x];if(m){m.classList.remove('no');void m.offsetWidth;m.classList.add('no')}ZK.wrong(cells[r.y*W+r.x]);tell('The sun can’t touch the moss.')}
      else{ZK.sfx('soft');ZK.buzz('wrong')}return}
    var from={x:pos.x,y:pos.y,s:pos.s};hist.push({from:from,d:d});pos={x:r.x,y:r.y,s:r.s};api.moved();pips.set(hist.length);ZK.stuck(stage,false);
    var win=pos.x===inst.gx&&pos.y===inst.gy&&pos.s===0,ms=rm?0:230;
    ZK.sfx('roll',{d:.12});
    if(!rm){/* tip over the bottom edge in the roll direction: rotate about that edge, then the die is re-seated on the new square */
      var h=cellPx*.43,e=d===1?'translate3d('+h+'px,0,'+(-h)+'px) rotateY(VAR) translate3d('+(-h)+'px,0,'+h+'px)':d===3?'translate3d('+(-h)+'px,0,'+(-h)+'px) rotateY(VAR) translate3d('+h+'px,0,'+h+'px)':
        d===2?'translate3d(0,'+h+'px,'+(-h)+'px) rotateX(VAR) translate3d(0,'+(-h)+'px,'+h+'px)':'translate3d(0,'+(-h)+'px,'+(-h)+'px) rotateX(VAR) translate3d(0,'+h+'px,'+h+'px)';
      var ang=d===1?90:d===3?-90:d===2?-90:90,ax=d===1||d===3?'':'';
      for(var f=0;f<6;f++)faces[f].classList.toggle('sun',f===from.s);spill.style.opacity=0;base.style.opacity=0;
      busy=cube.animate([{transform:cubeBase()+' '+e.replace('VAR','0deg')},{transform:cubeBase()+' '+e.replace('VAR',(ang*.55)+'deg'),offset:.5},{transform:cubeBase()+' '+e.replace('VAR',ang+'deg')}],{duration:ms,easing:'cubic-bezier(.45,.05,.55,.95)'});
      busy.onfinish=function(){busy=null;place();cube.style.transform=cubeBase();ZK.anim(die,[{transform:'translate('+pos.x*100+'%,'+pos.y*100+'%) scale(1.04,.96)'},{transform:'translate('+pos.x*100+'%,'+pos.y*100+'%)'}],140,'ease-out')}}
    else place();
    setTimeout(function(){if(!fin||win){ZK.sfx('thud',{k:2});ZK.buzz('thud')}
      if(win){fin=true;ZK.sfx('drop');ZK.buzz('pop');var gp=ZK.at(board,cells[inst.gy*W+inst.gx]);ZK.burst(board,gp.x,gp.y,{n:14,r:46,colors:['#F6B73C','#E8790C','#fff']});
        if(api.say)api.say('Sun up on the pad.');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,extra:{par:inst.par}})},rm?0:200)}},ms);
    if(win)fin=true}
  var sw=null;function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  L(view,'pointerdown',function(e){sw={x:e.clientX,y:e.clientY,id:e.pointerId,done:false};try{view.setPointerCapture(e.pointerId)}catch(_){}});
  L(view,'pointermove',function(e){if(!sw||sw.done||e.pointerId!==sw.id)return;var dx=e.clientX-sw.x,dy=e.clientY-sw.y;if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;sw.done=true;
    roll(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0))});
  /* a tap on a square next to the die tips it there */
  L(view,'pointerup',function(e){if(!sw||e.pointerId!==sw.id)return;var w=sw;sw=null;if(w.done)return;
    var el=document.elementFromPoint(e.clientX,e.clientY),c=el&&el.closest?el.closest('.grd-c'):null;if(!c)return;var i=cells.indexOf(c);if(i<0)return;var cx=i%W,cy=(i/W)|0;
    for(var d=0;d<4;d++)if(cx===pos.x+DX[d]&&cy===pos.y+DY[d]){roll(d);return}});
  L(view,'pointercancel',function(){sw=null});
  L(view,'keydown',function(e){var d=e.key==='ArrowUp'?0:e.key==='ArrowRight'?1:e.key==='ArrowDown'?2:e.key==='ArrowLeft'?3:-1;if(d<0)return;e.preventDefault();roll(d)});
  var ro=null;try{ro=new ResizeObserver(function(){size()});ro.observe(board)}catch(e){}
  size();place();
  if(inst.level===1&&inst.sol&&inst.sol.length){var steps=inst.sol.slice(0,2).map(function(d){return {swipe:[die,DX[d]*80,DY[d]*80]}});ghost=ZK.ghost(stage,steps.slice(0,1),{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin||!hist.length)return false;finishBusy();var h=hist.pop();pos={x:h.from.x,y:h.from.y,s:h.from.s};place();cube.style.transform=cubeBase();
    ZK.anim(die,[{transform:'translate('+(pos.x+DX[h.d])*100+'%,'+(pos.y+DY[h.d])*100+'%)'},{transform:'translate('+pos.x*100+'%,'+pos.y*100+'%)'}],180,ZK.EASE);
    pips.set(hist.length);ZK.stuck(stage,false);ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true}
  return{undo:undo,
    restart:function(){if(fin)return;finishBusy();pos={x:inst.sx,y:inst.sy,s:inst.ss};hist=[];place();cube.style.transform=cubeBase();pips.set(0);ZK.stuck(stage,false);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var p=solve(g,W,H,pos.x,pos.y,pos.s,inst.gx,inst.gy);ZK.unmark(stage);if(!p)return null;hints++;
      var md=Math.abs(pos.x-inst.gx)+Math.abs(pos.y-inst.gy);
      if(lv<=1){if(p.length>md)return 'The straight way lands with the sun wrong. The die needs '+p.length+' tips: find a place to turn it round.';return 'Straight there: '+p.length+' tip'+(p.length===1?'':'s')+'.'}
      if(lv===2){ZK.mark(pad[p[0]]);return 'Tip it '+NAME[p[0]]+'.'}
      roll(p[0]);return 'Tipped it '+NAME[p[0]]+' for you.'},
    destroy:function(){finishBusy();if(ro)try{ro.disconnect()}catch(e){}if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return cells[inst.gy*W+inst.gx]},
    moves:function(){return hist.length},
    state:function(){return{x:pos.x,y:pos.y,s:pos.s,moves:hist.length,fin:fin}}}}

ZK.override({id:ID,name:'Rolling Die',family:'move',theme:'F7',blurb:'Tip the die onto the sun pad, sun face up.',
  how:'Swipe to tip the die one square. Land on the sun pad with the sun on top. The sun may never touch moss.',
  areas:['space','planning'],levels:LEVELS.length||20,secs:75,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'Sun up in '+m+' tip'+(m===1?'':'s')+'. The fewest is '+p+'.'+(res.hints?' With a hint.':'')}}});
})();
