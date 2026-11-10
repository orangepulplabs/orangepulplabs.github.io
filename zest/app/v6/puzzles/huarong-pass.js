/* Zest v6 new puzzle (batch f): Huarong Pass (sliding blocks of mixed sizes; a NEW id, not a reskin of Slide Tiles).
   Rule: drag a block into free space (it slides straight, any distance: one move). Free the big red block through the gate in the bottom edge.
   Blocks: 2x2 (the big one), 1x2 tall, 2x1 wide, 1x1. There are two or more gaps, and the goal is to free one block, not to order tiles.
   Levels are CURATED by tests/batch_f_gen_huarong.js from random layouts (never a published layout): exact par by BFS over the whole
   reachable set (one move = one block sliding straight, any distance). Aha filter: from level 4 every shortest route moves the big block
   AWAY from the gate at least once, or moves a block back to where it was (a detour); the generator checks this on the whole shortest-route DAG.
   No dead ends exist (every slide can be slid back), so there is no stuck chip; idle 25 s glows Hint. Hints come from a BFS distance map
   built at mount (a few thousand states). A cell string encodes a board: a/b/c/d = big block TL/TR/BL/BR, u/n = tall top/bottom,
   l/r = wide left/right, s = small, . = empty. */
(function(){
var ID='huarong-pass';
var LEVELS=[[4,4,1,"slrslrlrab.scds.",2],[4,4,1,".lrsssuuabnncd.s",3],[4,4,1,"lr.sslrssuab.ncd",5],[4,4,1,"lrlrabsscd.uss.n",7],[4,4,1,"lrlr.sabsucd.nss",9],[4,4,1,"sslrab.scd.ssslr",12],[4,4,1,"lruu..nnabsscdss",14],[4,4,1,"lrus..nsabsucdsn",16],[4,4,1,"lrlrsab.scdslr.s",15],[4,5,1,"u.usnuns.nuuabnncdss",17],[4,4,1,"sab.ucd.nsuussnn",20],[4,5,1,"su..snuuuunnnnabsscd",18],[4,4,1,".abs.cdssuuusnnn",22],[4,5,1,"uuusnnnsusabnscdlr..",24],[4,5,1,"ussunabnucdunssnlr..",26],[4,4,1,"..lrusabnucdsnss",25],[4,5,1,"uslrnabsscdu.uunsnn.",28],[4,4,1,"uab.ncdssuussnn.",23],[4,5,1,".suu.snnabuscdnulrsn",28],[4,4,1,"u.lrnsab.ucdsnss",26],[4,5,1,"slrsu.abn.cduuusnnns",30],[4,4,1,"sabuscdnuu.snn.s",25],[4,5,1,"lr..uuabnncdsususnsn",32],[4,4,1,".slruuabnncd.sss",28],[4,5,1,"lrssuuabnncd.usu.nsn",33],[4,4,1,"uslrnuabsncd.s.s",30],[4,5,1,"su.sunabn.cduulrnnss",34],[4,4,1,".uab.ncdussunssn",31],[4,5,1,"lrusabnucdsnussun..n",35]]; /*LEVELS*/
/* ---- core ---- */
function decode(key,W,H){var P=[],seen={};for(var i=0;i<W*H;i++){var c=key.charAt(i),x=i%W,y=(i/W)|0;
    if(c==='a')P.push({t:'B',x:x,y:y,w:2,h:2});else if(c==='u')P.push({t:'V',x:x,y:y,w:1,h:2});else if(c==='l')P.push({t:'H',x:x,y:y,w:2,h:1});else if(c==='s')P.push({t:'S',x:x,y:y,w:1,h:1})}
  return P}
var PART={B:['a','b','c','d'],V:['u','n'],H:['l','r'],S:['s']};
function encode(P,W,H){var g=new Array(W*H).fill('.');P.forEach(function(p){var k=0;for(var dy=0;dy<p.h;dy++)for(var dx=0;dx<p.w;dx++)g[(p.y+dy)*W+p.x+dx]=PART[p.t][k++]});return g.join('')}
var DIRS=[[0,-1],[0,1],[-1,0],[1,0]];
/* every move from key: {i (piece index in decode order), dx, dy (cells), key} */
function moves(key,W,H){var P=decode(key,W,H),out=[];
  P.forEach(function(p,i){DIRS.forEach(function(d){for(var s=1;;s++){var nx=p.x+d[0]*s,ny=p.y+d[1]*s;if(nx<0||ny<0||nx+p.w>W||ny+p.h>H)break;var free=true;
        for(var yy=ny;yy<ny+p.h&&free;yy++)for(var xx=nx;xx<nx+p.w;xx++){var inside=xx>=p.x&&xx<p.x+p.w&&yy>=p.y&&yy<p.y+p.h;if(!inside&&key.charAt(yy*W+xx)!=='.'){free=false;break}}
        if(!free)break;var Q=P.slice();Q[i]={t:p.t,x:nx,y:ny,w:p.w,h:p.h};out.push({i:i,dx:d[0]*s,dy:d[1]*s,key:encode(Q,W,H)})}})});
  return out}
function bigAt(key,W){var i=key.indexOf('a');return{x:i%W,y:(i/W)|0}}
function isGoal(key,W,H,gx){var b=bigAt(key,W);return b.x===gx&&b.y===H-2}
/* BFS over the reachable set; returns {dist: Map key -> moves to the goal} (multi-source from every goal state) */
function distMap(start,W,H,gx,cap){cap=cap||200000;var seen=new Map([[start,1]]),q=[start],all=[start];
  while(q.length){var nq=[];for(var j=0;j<q.length;j++){var ms=moves(q[j],W,H);for(var m=0;m<ms.length;m++){var k=ms[m].key;if(!seen.has(k)){seen.set(k,1);nq.push(k);all.push(k);if(all.length>cap)return null}}}q=nq}
  var dist=new Map(),fr=[];all.forEach(function(k){if(isGoal(k,W,H,gx)){dist.set(k,0);fr.push(k)}});
  while(fr.length){var nf=[];for(var a=0;a<fr.length;a++){var d=dist.get(fr[a]),ms2=moves(fr[a],W,H);for(var b=0;b<ms2.length;b++){var k2=ms2[b].key;if(!dist.has(k2)){dist.set(k2,d+1);nf.push(k2)}}}fr=nf}
  return{dist:dist,size:all.length}}
function make(level,rng){level=Math.max(1,Math.min(LEVELS.length,level|0||1));var L=LEVELS[level-1],W=L[0],H=L[1],gx=L[2],key=L[3];
  /* mirror left-right by the seed when the gate is centred (same par) */
  if(W-2-gx===gx&&pzInt(rng,2)){var P=decode(key,W,H).map(function(p){return{t:p.t,x:W-p.x-p.w,y:p.y,w:p.w,h:p.h}});key=encode(P,W,H)}
  return{level:level,title:'Level '+level,W:W,H:H,gx:gx,key:key,par:L[4],parExact:true}}
window.V6HP={make:make,decode:decode,encode:encode,moves:moves,isGoal:isGoal,distMap:distMap,bigAt:bigAt,levels:function(){return LEVELS}};

var CSS=''
+'.hp{position:relative;width:100%;max-width:360px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);'
+'--hp-tray:#C9B48F;--hp-tray2:#B39C76;--hp-floor:#E8DCC4;--hp-grid:rgba(90,60,30,.10);--hp-big1:#E4572E;--hp-big2:#B83A16;--hp-v1:#5B8DB8;--hp-v2:#3E6A92;--hp-h1:#6E9B5A;--hp-h2:#4E7A3D;--hp-s1:#F3E7CF;--hp-s2:#D8C7A4;--hp-ink:#1B1916;--hp-gate:#E4572E}'
+':root[data-theme="dark"] .hp{--hp-tray:#3A3027;--hp-tray2:#2C241D;--hp-floor:#1F1A16;--hp-grid:rgba(255,230,200,.06);--hp-big1:#F0683D;--hp-big2:#C24A20;--hp-v1:#6C9CC7;--hp-v2:#46739C;--hp-h1:#7DAE68;--hp-h2:#5A8848;--hp-s1:#E9DCC2;--hp-s2:#C7B593;--hp-gate:#FF8A5C}'
+'.hp-b{position:relative;width:100%;box-sizing:border-box;padding:10px 10px 0;border-radius:22px 22px 14px 14px;background:linear-gradient(165deg,var(--hp-tray),var(--hp-tray2));box-shadow:inset 0 2px 0 rgba(255,255,255,.25),0 3px 8px rgba(0,0,0,.18);touch-action:none;user-select:none;-webkit-user-select:none}'
+'.hp-in{position:relative;border-radius:10px;background:var(--hp-floor);box-shadow:inset 0 2px 6px rgba(0,0,0,.22)}'
+'.hp-g{position:absolute;inset:0;pointer-events:none;border-radius:10px;background-image:linear-gradient(var(--hp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--hp-grid) 1px,transparent 1px)}'
+'.hp-gate{position:relative;height:30px;margin:0 auto}'
+'.hp-gate i{position:absolute;top:0;bottom:6px;left:0;right:0;border:3px dashed var(--hp-gate);border-top:0;border-radius:0 0 14px 14px;opacity:.75}'
+'.hp-gate b{position:absolute;left:50%;top:6px;width:14px;height:14px;margin-left:-7px;border-right:3px solid var(--hp-gate);border-bottom:3px solid var(--hp-gate);transform:rotate(45deg);opacity:.8}'
+'.hp-sill{position:absolute;bottom:-6px;height:12px;background:var(--hp-floor)}'
+'.hp-k{all:unset;position:absolute;left:0;top:0;box-sizing:border-box;padding:3px;cursor:grab;-webkit-tap-highlight-color:transparent;transition:transform .2s cubic-bezier(.25,1.3,.5,1);will-change:transform;z-index:2}'
+'.hp-k.drag{transition:none;z-index:4;cursor:grabbing}'
+'.hp-f{display:block;position:relative;width:100%;height:100%;box-sizing:border-box;border-radius:12px;box-shadow:inset 0 3px 0 rgba(255,255,255,.35),inset 0 -5px 0 rgba(0,0,0,.18),0 3px 4px rgba(30,20,10,.25)}'
+'.hp-k.drag .hp-f{box-shadow:inset 0 3px 0 rgba(255,255,255,.35),inset 0 -5px 0 rgba(0,0,0,.18),0 10px 16px rgba(30,20,10,.3)}'
+'.hp-k.B .hp-f{background:linear-gradient(160deg,var(--hp-big1),var(--hp-big2));border-radius:16px}'
+'.hp-k.V .hp-f{background:linear-gradient(160deg,var(--hp-v1),var(--hp-v2))}.hp-k.H .hp-f{background:linear-gradient(160deg,var(--hp-h1),var(--hp-h2))}.hp-k.S .hp-f{background:linear-gradient(160deg,var(--hp-s1),var(--hp-s2))}'
+'.hp-f svg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);opacity:.55}'
+'.hp-k:focus-visible .hp-f{outline:3px solid var(--ink);outline-offset:2px}'
+'.hp-k.zk-mark{outline:none}.hp-k.zk-mark .hp-f{animation:zkmark 1s ease-in-out infinite}'
+'.zk-rm .hp-k{transition:none}@media (prefers-reduced-motion:reduce){.hp-k{transition:none}}';
var ICON={B:'<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M4 18h16l-1.5-9-4 3.5L12 6l-2.5 6.5-4-3.5z"/></svg>',
  V:'<svg width="10" height="26" viewBox="0 0 10 26"><path d="M5 3v20" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>',
  H:'<svg width="26" height="10" viewBox="0 0 26 10"><path d="M3 5h20" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>',S:''};

function mount(root,inst,api){ZK.css(CSS,'hp-css');root.textContent='';
  var W=inst.W,H=inst.H,gx=inst.gx,rm=ZK.rm(api),key=inst.key,P=decode(key,W,H),hist=[],hints=0,undos=0,fin=false,busy=false,last=null,idle=null,ghost=null,offs=[],drag=null,swallow=false;
  var DM=distMap(inst.key,W,H,gx).dist;
  var stage=document.createElement('div');stage.className='hp zk-stage zk-host'+(rm?' zk-rm':'');
  var b=document.createElement('div');b.className='hp-b zk-board';b.setAttribute('role','group');b.setAttribute('aria-label','Blocks, '+W+' by '+H+'. Free the big block through the gate below');
  var inn=document.createElement('div');inn.className='hp-in';var grid=document.createElement('div');grid.className='hp-g';inn.appendChild(grid);
  var sill=document.createElement('div');sill.className='hp-sill';inn.appendChild(sill);
  var gate=document.createElement('div');gate.className='hp-gate';gate.innerHTML='<i></i><b></b>';
  b.appendChild(inn);b.appendChild(gate);
  var els=P.map(function(p,i){var e=document.createElement('button');e.type='button';e.className='hp-k zk-p '+p.t;e.setAttribute('data-zkc','');e.innerHTML='<span class="hp-f">'+ICON[p.t]+'</span>';
    e.onclick=function(){if(swallow)return;tapPiece(i)};inn.appendChild(e);return e});
  var pips=ZK.pips(inst.par);
  stage.appendChild(b);stage.appendChild(pips.el);root.appendChild(stage);
  var C=60;
  function layout(){var w=b.clientWidth-20;C=Math.floor(Math.min(w/W,(Math.max(360,(window.innerHeight||700)-300))/H));if(C<44)C=44;
    inn.style.width=(C*W)+'px';inn.style.height=(C*H)+'px';inn.style.margin='0 auto';grid.style.backgroundSize=C+'px '+C+'px';
    gate.style.width=(2*C)+'px';gate.style.marginLeft=gate.style.marginRight='auto';gate.style.transform='translateX('+((gx+1)*C-W*C/2)+'px)';
    sill.style.left=(gx*C+3)+'px';sill.style.width=(2*C-6)+'px';
    els.forEach(function(e,i){var p=P[i];e.style.width=(p.w*C)+'px';e.style.height=(p.h*C)+'px'});paint()}
  function place(i,ox,oy){var p=P[i];els[i].style.transform='translate('+(p.x*C+(ox||0))+'px,'+(p.y*C+(oy||0))+'px)'}
  function paint(){P.forEach(function(p,i){place(i);els[i].setAttribute('aria-label',({B:'Big block',V:'Tall block',H:'Wide block',S:'Small block'})[p.t]+', column '+(p.x+1)+', row '+(p.y+1))})}
  /* the free run of piece i in each direction (cells) */
  function reach(i){var p=P[i],r=[0,0,0,0];DIRS.forEach(function(d,k){for(var s=1;;s++){var nx=p.x+d[0]*s,ny=p.y+d[1]*s;if(nx<0||ny<0||nx+p.w>W||ny+p.h>H)break;var free=true;
        for(var yy=ny;yy<ny+p.h&&free;yy++)for(var xx=nx;xx<nx+p.w;xx++){var inside=xx>=p.x&&xx<p.x+p.w&&yy>=p.y&&yy<p.y+p.h;if(!inside&&key.charAt(yy*W+xx)!=='.'){free=false;break}}
        if(!free)break;r[k]=s}});return r}
  function L(tg,ty,fn,o){tg.addEventListener(ty,fn,o);offs.push(function(){tg.removeEventListener(ty,fn,o)})}
  function commit(i,dx,dy,o){o=o||{};var p=P[i],Q=P.slice();Q[i]={t:p.t,x:p.x+dx,y:p.y+dy,w:p.w,h:p.h};P=Q;key=encode(P,W,H);
    /* encode/decode keeps piece order only by scan order; we keep our own P order, so els stay matched */
    if(!o.undo){hist.push([i,dx,dy]);api.moved();pips.set(hist.length)}last=els[i];ZK.unmark(stage);
    place(i);var dist=Math.abs(dx)+Math.abs(dy);ZK.sfx('slide');ZK.buzz('move');
    if(!rm){var e=els[i];setTimeout(function(){ZK.anim(e.firstChild,[{scale:'1 1'},{scale:(dx?'.96 1.04':'1.04 .96')},{scale:'1 1'}],200,ZK.SPRING)},Math.min(260,120+dist*40))}
    if(!o.undo&&p.t==='B'&&P[i].x===gx&&P[i].y===H-2)win(i)}
  function win(i){fin=true;busy=true;api.say('Free!');var e=els[i];
    setTimeout(function(){if(!rm){e.style.transition='transform .42s cubic-bezier(.5,0,.75,0),opacity .3s ease-in .14s';e.style.transform='translate('+(P[i].x*C)+'px,'+((H+0.6)*C)+'px)';e.style.opacity='0';ZK.burst(stage,ZK.at(stage,gate).x,ZK.at(stage,gate).y,{n:12,r:46});ZK.sfx('drop');
        ZK.anim(gate,[{filter:'brightness(1)'},{filter:'brightness(1.6)'},{filter:'brightness(1)'}],500)}
      else ZK.sfx('drop');
      setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:150)},rm?0:90)}
  function tapPiece(i){if(fin||busy)return;var r=reach(i),opts=[];r.forEach(function(v,k){if(v)opts.push(k)});
    if(opts.length===1){var k=opts[0];stopGhost();commit(i,DIRS[k][0],DIRS[k][1]);return}
    ZK.wrong(els[i].firstChild,{silent:opts.length>1});if(opts.length>1)ZK.sfx('press')}
  function stopGhost(){if(ghost){ghost.stop();ghost=null}ZK.ghostDone(ID)}
  L(b,'pointerdown',function(e){if(fin||busy)return;var el=e.target.closest&&e.target.closest('.hp-k');if(!el)return;var i=els.indexOf(el);if(i<0)return;
    drag={i:i,x0:e.clientX,y0:e.clientY,id:e.pointerId,ax:null,r:reach(i),on:false,ox:0,oy:0};ZK.sfx('press')});
  L(document,'pointermove',function(e){if(!drag||e.pointerId!==drag.id)return;var dx=e.clientX-drag.x0,dy=e.clientY-drag.y0;
    if(!drag.on){if(Math.hypot(dx,dy)<7)return;drag.on=true;drag.ax=Math.abs(dx)>=Math.abs(dy)?'x':'y';
      /* if the dominant axis is blocked both ways, use the other one */
      if(drag.ax==='x'&&!drag.r[2]&&!drag.r[3]&&(drag.r[0]||drag.r[1]))drag.ax='y';else if(drag.ax==='y'&&!drag.r[0]&&!drag.r[1]&&(drag.r[2]||drag.r[3]))drag.ax='x';
      els[drag.i].classList.add('drag');stopGhost()}
    var r=drag.r,res=.18*C;if(drag.ax==='x'){var lo=-r[2]*C,hi=r[3]*C;drag.ox=dx<lo?lo-Math.min(res,(lo-dx)*.2):dx>hi?hi+Math.min(res,(dx-hi)*.2):dx;drag.oy=0}
    else{var lo2=-r[0]*C,hi2=r[1]*C;drag.oy=dy<lo2?lo2-Math.min(res,(lo2-dy)*.2):dy>hi2?hi2+Math.min(res,(dy-hi2)*.2):dy;drag.ox=0}
    place(drag.i,drag.ox,drag.oy)});
  function end(e){if(!drag||(e&&e.pointerId!==drag.id))return;var d=drag;drag=null;if(!d.on)return;els[d.i].classList.remove('drag');swallow=true;setTimeout(function(){swallow=false},60);
    var cx=Math.round(d.ox/C),cy=Math.round(d.oy/C);cx=Math.max(-d.r[2],Math.min(d.r[3],cx));cy=Math.max(-d.r[0],Math.min(d.r[1],cy));
    if(cx||cy)commit(d.i,cx,cy);else{place(d.i);if(Math.hypot(d.ox,d.oy)>C*.25)ZK.sfx('soft')}}
  L(document,'pointerup',end);L(document,'pointercancel',end);
  L(window,'resize',function(){layout()});
  layout();pips.set(0);
  idle=ZK.idle(stage,25000);
  function best(){var ms=moves(key,W,H),d0=DM.get(key),Pk=decode(key,W,H);for(var j=0;j<ms.length;j++){if(DM.get(ms[j].key)===d0-1){
      /* map the decode-order piece to our piece order by position */
      var q=Pk[ms[j].i];for(var i=0;i<P.length;i++)if(P[i].x===q.x&&P[i].y===q.y&&P[i].t===q.t)return{i:i,dx:ms[j].dx,dy:ms[j].dy}}}return null}
  if(inst.level===1){var m0=best();if(m0){var tg=document.createElement('span');tg.style.cssText='position:absolute;width:2px;height:2px;pointer-events:none;opacity:0';
      var pp=P[m0.i];tg.style.left=((pp.x+m0.dx+pp.w/2)*C)+'px';tg.style.top=((pp.y+m0.dy+pp.h/2)*C)+'px';inn.appendChild(tg);
      var e0=els[m0.i];ghost=ZK.ghost(stage,[{drag:[e0,tg],down:function(){e0.style.transition='transform .76s cubic-bezier(.45,0,.3,1)'},
        move:function(){place(m0.i,m0.dx*C,m0.dy*C)},up:function(){e0.style.transition='';place(m0.i)}}],{id:ID,level:1})}}
  return{undo:function(){if(fin||busy||!hist.length)return false;var h=hist.pop();undos++;pips.set(hist.length);commit(h[0],-h[1],-h[2],{undo:true});ZK.sfx('undo');return true},
    restart:function(){if(fin)return;P=decode(inst.key,W,H);key=inst.key;hist=[];paint();pips.set(0);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var m=best();ZK.unmark(stage);if(!m)return null;hints++;var left=DM.get(key);
      if(lv<=1){var bi=P.findIndex(function(p){return p.t==='B'});ZK.mark(els[bi]);return left===1?'One slide frees it.':left+' moves can free the big block. Make room for something two cells wide.'}
      if(lv===2){ZK.mark(els[m.i]);return 'Move this one '+(m.dx<0?'left':m.dx>0?'right':m.dy<0?'up':'down')+'.'}
      stopGhost();commit(m.i,m.dx,m.dy);return 'Moved for you.'},
    destroy:function(){if(idle)idle.stop();if(ghost)ghost.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    next:function(){var m=best();if(!m)return null;return{i:m.i,d:[m.dx*C,m.dy*C]}},
    state:function(){return{key:key,moves:hist.length,fin:fin,busy:busy&&!fin,left:DM.get(key)}}}}

ZK.override({id:ID,name:'Huarong Pass',family:'move',theme:'F8',blurb:'Slide the blocks until the big one escapes through the gate.',
  how:'Drag a block into free space. Get the big red block out through the gate at the bottom.',
  areas:['space','control'],levels:LEVELS.length,secs:90,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'Free in '+m+' move'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
