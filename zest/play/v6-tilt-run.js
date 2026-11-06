/* Zest v6 pilot: Tilt Run (ice slide). Overrides puzzles_a.js 'tilt-run' (original kept in ZK.orig). Uses the original rules (PZA.slide, PZA.tiltSolve):
   the ball slides until a wall or stone stops it, and drops into the goal hole if it rolls over it. Goal: get the ball into the hole.
   Curve: board 5x5 (levels 1-5), 6x6 (6-12), 7x7 (13-20), 8x8 (21-30); target par per level with sawtooth breathers; par is the BFS optimum.
   Aha filter: from level 5 a 'greedy' player (always roll to the stop nearest the goal) must FAIL, so every level needs a detour or set-up move.
   Stuck signal: if the goal can no longer be reached from where the ball rests (BFS), a chip offers Undo. */
(function(){
var ID='tilt-run',DX=[0,0,-1,1],DY=[-1,1,0,0],NAME=['up','down','left','right'];
var PAR=[1,2,2,3,3, 4,3,4,5,4,5,5, 6,5,6,7,6,7,8,6, 7,8,8,9,7,9,9,10,8,10];
function sizeOf(L){return L<=5?5:L<=12?6:L<=20?7:8}
function greedyWins(s,bl,x,y,gx,gy,lim){var seen={};for(var k=0;k<lim;k++){if(x===gx&&y===gy)return true;seen[y*s+x]=1;var best=null,bd=1e9;
    for(var d=0;d<4;d++){var r=PZA.slide(s,s,bl,x,y,d,gx,gy);if(r[0]===x&&r[1]===y)continue;var dd=Math.abs(r[0]-gx)+Math.abs(r[1]-gy);if(dd<bd&&!seen[r[1]*s+r[0]]){bd=dd;best=r}}
    if(!best)return false;x=best[0];y=best[1]}return x===gx&&y===gy}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var s=sizeOf(level),T=PAR[level-1],dens=.08+.14*(level-1)/29,best=null;
  for(var t=0;t<2500;t++){var bl=[],i;for(i=0;i<s*s;i++)bl.push(rng()<dens?1:0);
    var sx=pzInt(rng,s),sy=pzInt(rng,s),gx=pzInt(rng,s),gy=pzInt(rng,s);if((sx===gx&&sy===gy)||bl[sy*s+sx]||bl[gy*s+gx])continue;
    var p=PZA.tiltSolve(s,s,bl,sx,sy,gx,gy);if(!p)continue;
    var greedy=level>=5&&greedyWins(s,bl,sx,sy,gx,gy,T*2+2);
    var sc=Math.abs(p.length-T)*10+(greedy?25:0);
    if(!best||sc<best.sc)best={sc:sc,inst:{level:level,title:'Level '+level,w:s,h:s,blocks:bl,sx:sx,sy:sy,gx:gx,gy:gy,par:p.length,parExact:true,greedy:greedy}};
    if(sc===0)break}
  return best.inst}
window.V6TR={make:make,greedyWins:greedyWins,PAR:PAR};

var CSS=''
+'.tr{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:var(--font);--tr-ice1:#EEF7FC;--tr-ice2:#D7EAF5;--tr-line:rgba(70,120,160,.13);--tr-st1:#A08D78;--tr-st2:#6E5D4C;--tr-hole:#1F2A31}'
+':root[data-theme="dark"] .tr{--tr-ice1:#1C2B34;--tr-ice2:#14212A;--tr-line:rgba(160,210,240,.08);--tr-st1:#6B5A49;--tr-st2:#3C3128;--tr-hole:#05080A}'
+'.tr-b{position:relative;width:100%;aspect-ratio:1;border-radius:22px;overflow:hidden;background:linear-gradient(160deg,var(--tr-ice1),var(--tr-ice2));box-shadow:inset 0 0 0 3px rgba(80,110,130,.25),0 6px 18px rgba(20,50,80,.12);touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab}'
+'.tr-b:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'.tr-grid{position:absolute;inset:0;background-image:linear-gradient(var(--tr-line) 1px,transparent 1px),linear-gradient(90deg,var(--tr-line) 1px,transparent 1px)}'
+'.tr-c{position:absolute;display:flex;align-items:center;justify-content:center}'
+'.tr-st{width:86%;height:86%;border-radius:22%;background:linear-gradient(160deg,var(--tr-st1),var(--tr-st2));box-shadow:inset 0 3px 0 rgba(255,255,255,.22),inset 0 -4px 0 rgba(0,0,0,.25),0 3px 5px rgba(0,0,0,.2)}'
+'.tr-goal i{width:62%;height:62%;border-radius:50%;background:radial-gradient(circle at 50% 60%,#000 0,var(--tr-hole) 70%);box-shadow:inset 0 4px 6px rgba(0,0,0,.6),0 0 0 3px #F6B73C,0 0 16px 3px rgba(246,183,60,.75);animation:trglow 1.6s ease-in-out infinite}'
+'@keyframes trglow{0%,100%{box-shadow:inset 0 4px 6px rgba(0,0,0,.6),0 0 0 3px #F6B73C,0 0 10px 2px rgba(246,183,60,.5)}50%{box-shadow:inset 0 4px 6px rgba(0,0,0,.6),0 0 0 4px #F6B73C,0 0 22px 6px rgba(246,183,60,.85)}}'
+'.tr-goal.close i{animation:trclose .5s ease-in-out 3}@keyframes trclose{50%{transform:scale(1.25)}}'
+'.tr-ball{position:absolute;left:0;top:0;display:flex;align-items:center;justify-content:center;pointer-events:none;will-change:transform;z-index:3}'
+'.tr-ball i{width:70%;height:70%;border-radius:50%;background:radial-gradient(circle at 34% 30%,#fff 0,#FFB27A 16%,#E8590C 60%,#8A3000 100%);box-shadow:0 4px 6px rgba(0,0,0,.3)}'
+'.tr-trail{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}'
+'.tr-trail line{stroke:#E8590C;stroke-linecap:round;stroke-dasharray:.01 .28;stroke-width:.14;opacity:.35}.tr-trail line.last{opacity:.85;stroke-width:.17}'
+'.tr-pad{display:flex;gap:10px;align-items:center;justify-content:center}'
+'.tr-pad button{all:unset;box-sizing:border-box;width:52px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:var(--surface);box-shadow:0 0 0 1.5px var(--line),0 2px 0 var(--line);cursor:pointer;color:var(--ink)}'
+'.tr-pad button:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.tr-pad svg{width:22px;height:22px}'
+'.tr-pad button.zk-mark{outline-offset:3px}'
+'.zk-rm .tr-goal i{animation:none}@media (prefers-reduced-motion:reduce){.tr-goal i{animation:none}}';
var ARW=['M12 19V5M5 12l7-7 7 7','M12 5v14M5 12l7 7 7-7','M19 12H5M12 5l-7 7 7 7','M5 12h14M12 5l7 7-7 7'];

function mount(root,inst,api){ZK.css(CSS,'tr-css');root.textContent='';
  var s=inst.w,bl=inst.blocks,rm=ZK.rm(api),pos={x:inst.sx,y:inst.sy},hist=[],hints=0,undos=0,fin=false,ghost=null,idle=null,offs=[],busy=null,pad=[];
  var stage=document.createElement('div');stage.className='tr zk-stage zk-host'+(rm?' zk-rm':'');
  var pips=ZK.pips(inst.par);
  var board=document.createElement('div');board.className='tr-b zk-board';board.tabIndex=0;board.setAttribute('role','application');
  var grid=document.createElement('div');grid.className='tr-grid';grid.style.backgroundSize=(100/s)+'% '+(100/s)+'%';board.appendChild(grid);
  var pct=100/s,stones=[],goalEl;
  function cell(x,y,cls,html){var c=document.createElement('div');c.className='tr-c '+cls;c.style.left=x*pct+'%';c.style.top=y*pct+'%';c.style.width=pct+'%';c.style.height=pct+'%';c.innerHTML=html||'';c.setAttribute('data-zkc','');board.appendChild(c);return c}
  for(var y=0;y<s;y++)for(var x=0;x<s;x++)if(bl[y*s+x])stones[y*s+x]=cell(x,y,'','<i class="tr-st"></i>');
  goalEl=cell(inst.gx,inst.gy,'tr-goal','<i></i>');
  var svgNS='http://www.w3.org/2000/svg',trail=document.createElementNS(svgNS,'svg');trail.setAttribute('class','tr-trail');trail.setAttribute('viewBox','0 0 '+s+' '+s);trail.setAttribute('preserveAspectRatio','none');board.appendChild(trail);
  var ball=document.createElement('div');ball.className='tr-ball';ball.innerHTML='<i></i>';ball.style.width=pct+'%';ball.style.height=pct+'%';board.appendChild(ball);
  var padEl=document.createElement('div');padEl.className='tr-pad';padEl.setAttribute('role','group');padEl.setAttribute('aria-label','Roll the ball');
  [2,0,1,3].forEach(function(d){var b=document.createElement('button');b.type='button';b.className='zk-p';b.setAttribute('aria-label','Roll '+NAME[d]);
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="'+ARW[d]+'"/></svg>';b.onclick=function(){roll(d)};pad[d]=b;padEl.appendChild(b)});
  stage.appendChild(pips.el);stage.appendChild(board);stage.appendChild(padEl);root.appendChild(stage);
  function place(){ball.style.transform='translate('+pos.x*100+'%,'+pos.y*100+'%)'}
  function label(){board.setAttribute('aria-label','Ice board '+s+' by '+s+'. Ball at row '+(pos.y+1)+', column '+(pos.x+1)+'. Hole at row '+(inst.gy+1)+', column '+(inst.gx+1)+'. Swipe or use the arrow keys.')}
  function drawTrail(){trail.textContent='';var pts=[{x:inst.sx,y:inst.sy}].concat(hist.map(function(h){return h.to}));
    for(var i=1;i<pts.length;i++){var l=document.createElementNS(svgNS,'line');l.setAttribute('x1',pts[i-1].x+.5);l.setAttribute('y1',pts[i-1].y+.5);l.setAttribute('x2',pts[i].x+.5);l.setAttribute('y2',pts[i].y+.5);if(i===pts.length-1)l.setAttribute('class','last');trail.appendChild(l)}}
  function reachable(x,y){return !!PZA.tiltSolve(s,s,bl,x,y,inst.gx,inst.gy)}
  function finishBusy(){if(busy){try{busy.finish()}catch(e){}busy=null}}
  function roll(d){if(fin)return;finishBusy();ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    var r=PZA.slide(s,s,bl,pos.x,pos.y,d,inst.gx,inst.gy),n=Math.abs(r[0]-pos.x)+Math.abs(r[1]-pos.y);
    if(!n){ /* blocked: a small nudge toward the wall and back */
      ZK.anim(ball,[{transform:'translate('+pos.x*100+'%,'+pos.y*100+'%)'},{transform:'translate('+(pos.x*100+DX[d]*12)+'%,'+(pos.y*100+DY[d]*12)+'%)'},{transform:'translate('+pos.x*100+'%,'+pos.y*100+'%)'}],200,'ease-out');
      ZK.sfx('soft');ZK.buzz('wrong');return}
    var from={x:pos.x,y:pos.y};pos={x:r[0],y:r[1]};hist.push({from:from,to:{x:pos.x,y:pos.y},d:d});api.moved();pips.set(hist.length);drawTrail();label();ZK.stuck(stage,false);
    var win=pos.x===inst.gx&&pos.y===inst.gy,ms=rm?0:Math.round(70+55*n);
    var a='translate('+from.x*100+'%,'+from.y*100+'%)',b='translate('+pos.x*100+'%,'+pos.y*100+'%)',sq=d<2?'scale(1.14,.84)':'scale(.84,1.14)';
    place();ZK.sfx('roll',{d:ms/1000});
    if(!rm){busy=ball.animate(win?[{transform:a},{transform:b+' scale(1)',offset:.8},{transform:b+' scale(.3)',opacity:0}]:[{transform:a,easing:'cubic-bezier(.35,0,.7,1)'},{transform:b+' '+sq,offset:.86},{transform:b}],{duration:win?ms+160:ms+120,fill:win?'forwards':'none'})}
    if(win&&rm)ball.style.opacity='0';
    setTimeout(function(){if(fin&&!win)return;
      if(win){ZK.sfx('drop');ZK.buzz('pop');var g=ZK.at(board,goalEl);ZK.burst(board,g.x,g.y,{n:12,r:40,colors:['#F6B73C','#E8590C','#fff']});
        fin=true;api.say('In the hole.');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:120);return}
      ZK.sfx('thud',{k:n});ZK.buzz('thud');
      /* what stopped it gets a small knock; a stop next to the hole makes the hole pulse */
      var hx=pos.x+DX[d],hy=pos.y+DY[d],st=(hx>=0&&hy>=0&&hx<s&&hy<s)?stones[hy*s+hx]:null;
      if(st)ZK.anim(st,[{transform:'none'},{transform:'translate('+DX[d]*3+'px,'+DY[d]*3+'px)'},{transform:'none'}],180,'ease-out');
      else ZK.anim(board,[{transform:'none'},{transform:'translate('+DX[d]*2+'px,'+DY[d]*2+'px)'},{transform:'none'}],160,'ease-out');
      if(Math.abs(pos.x-inst.gx)+Math.abs(pos.y-inst.gy)===1){goalEl.classList.remove('close');void goalEl.offsetWidth;goalEl.classList.add('close');ZK.sfx('star',{i:0})}
      if(!reachable(pos.x,pos.y)){ZK.stuck(stage,true,{kind:'dead',text:'The hole is out of reach now',onUndo:undo})}},ms);
    if(win){fin=true}}
  /* swipe anywhere on the board, or tap a spot in line with the ball */
  var sw=null;function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  L(board,'pointerdown',function(e){sw={x:e.clientX,y:e.clientY,id:e.pointerId,done:false};try{board.setPointerCapture(e.pointerId)}catch(_){}});
  L(board,'pointermove',function(e){if(!sw||sw.done||e.pointerId!==sw.id)return;var dx=e.clientX-sw.x,dy=e.clientY-sw.y;if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;sw.done=true;
    roll(Math.abs(dx)>Math.abs(dy)?(dx>0?3:2):(dy>0?1:0))});
  L(board,'pointerup',function(e){if(!sw||e.pointerId!==sw.id)return;var w=sw;sw=null;if(w.done)return;
    var r=board.getBoundingClientRect(),cx=Math.floor((e.clientX-r.left)/r.width*s),cy=Math.floor((e.clientY-r.top)/r.height*s);
    if(cx===pos.x&&cy!==pos.y)roll(cy<pos.y?0:1);else if(cy===pos.y&&cx!==pos.x)roll(cx<pos.x?2:3)});
  L(board,'pointercancel',function(){sw=null});
  L(board,'keydown',function(e){var d=e.key==='ArrowUp'?0:e.key==='ArrowDown'?1:e.key==='ArrowLeft'?2:e.key==='ArrowRight'?3:-1;if(d<0)return;e.preventDefault();roll(d)});
  place();label();drawTrail();
  if(inst.level===1){var p0=PZA.tiltSolve(s,s,bl,pos.x,pos.y,inst.gx,inst.gy);if(p0&&p0.length){var d0=p0[0],bw=0;
    ghost=ZK.ghost(stage,[{swipe:[ball,DX[d0]*90,DY[d0]*90]}],{id:ID,level:1})}}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin||!hist.length)return false;finishBusy();var h=hist.pop();var a='translate('+pos.x*100+'%,'+pos.y*100+'%)';pos={x:h.from.x,y:h.from.y};place();
    ZK.anim(ball,[{transform:a},{transform:'translate('+pos.x*100+'%,'+pos.y*100+'%)'}],180,ZK.EASE);undos++;pips.set(hist.length);drawTrail();label();ZK.stuck(stage,false);ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true}
  return{undo:undo,
    restart:function(){if(fin)return;finishBusy();pos={x:inst.sx,y:inst.sy};hist=[];place();pips.set(0);drawTrail();label();ZK.stuck(stage,false);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var p=PZA.tiltSolve(s,s,bl,pos.x,pos.y,inst.gx,inst.gy);ZK.unmark(stage);
      if(!p){ZK.mark(document.querySelector('.pz5 [data-undo]'));return 'The hole is out of reach from here. Undo a roll.'}
      hints++;if(lv<=1){if(p.length>1){var r=PZA.slide(s,s,bl,pos.x,pos.y,p[0],inst.gx,inst.gy);return 'The ball needs '+p.length+' rolls from here.'}ZK.mark(goalEl);return 'One roll will do it.'}
      if(lv===2){ZK.mark(pad[p[0]]);return 'Roll '+NAME[p[0]]+'.'}
      roll(p[0]);return 'Rolled '+NAME[p[0]]+' for you.'},
    destroy:function(){finishBusy();if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return goalEl},
    state:function(){return{x:pos.x,y:pos.y,moves:hist.length,fin:fin}}}}

ZK.override({id:ID,name:'Tilt Run',family:'move',blurb:'Slide the ball until it drops into the hole.',
  how:'Swipe to roll the ball. It slides until something stops it. Drop it into the hole.',
  areas:['space','control'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'In the hole in '+m+' roll'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
