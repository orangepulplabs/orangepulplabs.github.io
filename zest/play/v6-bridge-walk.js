/* Zest v6: Bridge Walk. Overrides puzzles_c3.js 'bridge-walk' (original kept in ZK.orig). The MAP puzzle of the trail trio (Dot Loop = draw, Dodecahedron Tour = gem).
   Islands in a river joined by plank bridges. Walk (tap or drag) across every bridge exactly once. Some maps cannot be walked: press the flag, then PROVE it by
   marking every island with an odd number of bridges (no blind "Impossible" guess any more). Generator, Euler rule and solver come from PZC3.bw (exact). */
(function(){
var ID='bridge-walk',NS='http://www.w3.org/2000/svg',LET='ABCDEFGH';
function sv(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
/* aha filter: a walkable map from level 3 usually forces the start (exactly two odd islands); every 4th level is the all-even breather where any start works but the order still matters */
/* 1.2.1 (level-review fix). From level 11 a walkable map is kept only if a careless walk strands you: random walks from a correct start (an odd island,
   or any island when all are even) get stuck before the last bridge in at least half of 160 playouts. Every map with 5+ islands is laid out so no bridge
   passes under an island and (from level 11) at most 2 bridges cross; maps that cannot be laid out cleanly are rerolled. trim6.js keeps one impossible map
   after the first (old 28) as the last breather. */
function strand(inst,rng){var n=inst.n,E=inst.edges,deg=PZC3.bw.deg(n,E),st=[],i,lost=0,N=160;for(i=0;i<n;i++)if(deg[i]%2)st.push(i);if(!st.length)for(i=0;i<n;i++)st.push(i);
  for(var t=0;t<N;t++){var used=E.map(function(){return 0}),cur=st[pzInt(rng,st.length)],left=E.length;
    for(;;){var o=[];E.forEach(function(e,k){if(!used[k]&&(e[0]===cur||e[1]===cur))o.push(k)});if(!o.length)break;var k=o[pzInt(rng,o.length)];used[k]=1;left--;cur=E[k][0]===cur?E[k][1]:E[k][0]}
    if(left)lost++}return lost/N}
function make(level,rng){var B=PZC3.bw,inst=null;
  for(var k=0;k<120;k++){inst=B.make(level,rng);if(!(inst.impossible||level<3||level===10||inst.odd===2||(level%4===1&&inst.odd===0))&&k<40)continue;
    if(level>10&&!inst.impossible){inst.strand=strand(inst,rng);if(inst.strand<.5)continue}
    if(inst.n>=5&&level!==10){relayout(inst,rng);if(level>10&&(inst.cross>2||inst.under))continue}
    break}
  return inst}
/* untangle: try many assignments of lands to the circle slots and keep the one with the fewest crossing bridges (the walk is unchanged) */
function segX(p,q,r,s){function o(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}var d1=o(p,q,r),d2=o(p,q,s),d3=o(r,s,p),d4=o(r,s,q);return d1*d2<0&&d3*d4<0}
function crossings(E,pos){var c=0;for(var i=0;i<E.length;i++)for(var j=i+1;j<E.length;j++){var a=E[i],b=E[j];if(a[0]===b[0]||a[0]===b[1]||a[1]===b[0]||a[1]===b[1])continue;if(segX(pos[a[0]],pos[a[1]],pos[b[0]],pos[b[1]]))c++}return c}
/* the bridge curves exactly as mount() draws them (parallel bridges bow apart by 13), sampled, against every other island (land radius 9.4 + 2 margin) */
function curves(E,pos){var grp={};E.forEach(function(e,k){var key=Math.min(e[0],e[1])+','+Math.max(e[0],e[1]);(grp[key]=grp[key]||[]).push(k)});
  return E.map(function(e,k){var a=Math.min(e[0],e[1]),b=Math.max(e[0],e[1]),g=grp[a+','+b],j=g.indexOf(k),off=g.length===1?0:(j===0?-1:1)*13,pa=pos[a],pb=pos[b],dx=pb[0]-pa[0],dy=pb[1]-pa[1],L=Math.sqrt(dx*dx+dy*dy)||1,
    cx=(pa[0]+pb[0])/2-dy/L*off,cy=(pa[1]+pb[1])/2+dx/L*off,pts=[];for(var s=0;s<=16;s++){var t=s/16,u=1-t;pts.push([u*u*pa[0]+2*u*t*cx+t*t*pb[0],u*u*pa[1]+2*u*t*cy+t*t*pb[1]])}return{a:a,b:b,pts:pts}})}
function under(E,pos){var cv=curves(E,pos),n=0;cv.forEach(function(c){pos.forEach(function(p,v){if(v===c.a||v===c.b)return;if(c.pts.some(function(q){return Math.hypot(q[0]-p[0],q[1]-p[1])<11.4}))n++})});return n}
function segXc(p,q,r,s){function o(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}var d1=o(p,q,r),d2=o(p,q,s),d3=o(r,s,p),d4=o(r,s,q);return d1*d2<=0&&d3*d4<=0&&!(d1===0&&d2===0)}   /* touching counts (two bridges meeting exactly at a sample point) */
function crossC(E,pos){var cv=curves(E,pos),c=0;for(var i=0;i<cv.length;i++)for(var j=i+1;j<cv.length;j++){var A=cv[i],B=cv[j];if(A.a===B.a||A.a===B.b||A.b===B.a||A.b===B.b)continue;
    var hit=false;for(var s=0;s<16&&!hit;s++)for(var t=0;t<16&&!hit;t++)if(segXc(A.pts[s],A.pts[s+1],B.pts[t],B.pts[t+1]))hit=true;if(hit)c++}return c}
/* layouts tried: the circle (any order of islands round it) and a 3x3 field (any n of its 9 spots); keep the one with no bridge under an island and the fewest crossings */
var FIELD=[[18,18],[50,14],[82,18],[16,50],[50,50],[84,50],[18,82],[50,86],[82,82]];
function relayout(inst,rng){var slots=inst.pos.map(function(p){return p.slice()}),best=null,bs=1e9,bc=0,bu=0,n=inst.n;
  for(var t=0;t<420;t++){var pos=[];if(t<210){var perm=t===0?slots.map(function(_,i){return i}):pzShuffle(slots.map(function(_,i){return i}),rng);perm.forEach(function(sl,v){pos[v]=slots[sl]})}
    else{var f=pzShuffle(FIELD.map(function(_,i){return i}),rng).slice(0,n);f.forEach(function(sl,v){pos[v]=FIELD[sl].slice()})}
    var u=under(inst.edges,pos);if(best&&u>bu)continue;var c=crossC(inst.edges,pos),sc=u*100+c;if(sc<bs){bs=sc;best=pos;bc=c;bu=u;if(!sc)break}if(t>=120&&!bu&&bc<=2)break}   /* speed: crossings only for layouts that are not worse on islands */
  inst.pos=best;inst.cross=bc;inst.under=bu}
var CSS='.bw{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);--bw-w1:#CFE6F5;--bw-w2:#A8D0EA;--bw-land:#EFD9A6;--bw-land2:#D8B976;--bw-plank:#8A5A2B;--bw-gold:#F0A21B;--bw-ink:#4A3410}'
+':root[data-theme="dark"] .bw{--bw-w1:#1F3347;--bw-w2:#162636;--bw-land:#8A7544;--bw-land2:#6A5A33;--bw-plank:#B9884F;--bw-gold:#FFC247;--bw-ink:#FFF3D6}'
+'.bw-board{position:relative;width:100%;aspect-ratio:1;border-radius:26px;overflow:hidden;background:radial-gradient(110% 100% at 30% 10%,var(--bw-w1),var(--bw-w2));box-shadow:inset 0 2px 0 rgba(255,255,255,.3),0 6px 18px rgba(20,60,90,.18);touch-action:none;user-select:none;-webkit-user-select:none}'
+'.bw-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}'
+'.bw-isl{all:unset;position:absolute;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;font:800 1.2rem/1 var(--font);color:var(--bw-ink)}'
+'.bw-isl:focus-visible{outline:3px solid var(--ink);outline-offset:-2px}'
+'.bw-isl .bw-d{position:absolute;right:-2px;top:-4px;min-width:22px;height:22px;border-radius:11px;background:var(--surface,#fff);box-shadow:0 0 0 2px var(--bw-ink);font:800 .8rem/22px var(--font);text-align:center}'
+'.bw-isl.odd .bw-d{background:var(--bw-gold)}.bw-isl.mk::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:4px solid #E9A23B}'
+'.bw-walker{position:absolute;left:0;top:0;width:34px;height:34px;margin:-30px 0 0 -17px;pointer-events:none;z-index:4;will-change:transform}'
+'.bw-walker svg{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 3px 3px rgba(0,0,0,.3))}'
+'.bw-note{position:absolute;left:50%;top:10px;transform:translateX(-50%);padding:6px 14px;border-radius:18px;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--line,#ddd);font:700 .9rem var(--font);color:var(--ink);white-space:nowrap;z-index:5;pointer-events:none}'
+'.bw-flag{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:8px;min-height:48px;padding:0 18px;border-radius:24px;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--edge,#999);font:800 .95rem var(--font);color:var(--ink)}'
+'.bw-flag:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.bw-flag.on{background:#E9A23B;box-shadow:none;color:#1B1916}'
+'.bw-hl{animation:bwp 1.1s ease-in-out infinite}@keyframes bwp{50%{opacity:.35}}'
+'@media (prefers-reduced-motion:reduce){.bw-hl{animation:none}}.zk-rm .bw-hl{animation:none}';
var WALKER='<svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="12" r="8.5" fill="#E8590C" stroke="#fff" stroke-width="2.4"/><circle cx="14.2" cy="10.2" r="2.4" fill="#fff" opacity=".75"/><path d="M17 20.5L11 31h12z" fill="#E8590C" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>';
var FLAG='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 21V4m0 1h11l-2.5 4L17 13H6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function mount(root,inst,api){ZK.css(CSS,'bw-css');root.textContent='';var B=PZC3.bw;
  var n=inst.n,E=inst.edges,pos=inst.pos,m=E.length,rm=ZK.rm(api),deg=B.deg(n,E),used=E.map(function(){return 0}),hist=[],cur=-1,fin=false,hints=0,undos=0,wrong=0,proof=false,marks={},showDeg=false,hl=[],ghost=null,idle=null,offs=[],drag=null,swallow=false,last=null,noteT=null;
  var stage=document.createElement('div');stage.className='bw zk-stage zk-host'+(rm?' zk-rm':'');
  var board=document.createElement('div');board.className='bw-board zk-board';board.setAttribute('role','group');board.setAttribute('aria-label','Map with '+n+' islands and '+m+' bridges');
  var svg=sv('svg',{viewBox:'0 0 100 100','aria-hidden':'true',focusable:'false','class':'bw-svg'});board.appendChild(svg);
  var pips=ZK.pips(m),flag=document.createElement('button');flag.type='button';flag.className='bw-flag zk-p';flag.innerHTML=FLAG+'<span>Can’t be done</span>';flag.setAttribute('aria-label','Say this map cannot be walked, then prove it');
  var grp={};E.forEach(function(e,k){var key=Math.min(e[0],e[1])+','+Math.max(e[0],e[1]);(grp[key]=grp[key]||[]).push(k)});
  var geo=E.map(function(e,k){var a=Math.min(e[0],e[1]),b=Math.max(e[0],e[1]),g=grp[a+','+b],j=g.indexOf(k),off=g.length===1?0:(j===0?-1:1)*13,pa=pos[a],pb=pos[b],dx=pb[0]-pa[0],dy=pb[1]-pa[1],L=Math.sqrt(dx*dx+dy*dy)||1,
    cx=(pa[0]+pb[0])/2-dy/L*off,cy=(pa[1]+pb[1])/2+dx/L*off;return{d:'M'+pa[0]+' '+pa[1]+' Q'+cx.toFixed(1)+' '+cy.toFixed(1)+' '+pb[0]+' '+pb[1],mx:.25*pa[0]+.5*cx+.25*pb[0],my:.25*pa[1]+.5*cy+.25*pb[1]}});
  var gE=[],isl=[],i;
  /* layers: bridges under islands */
  E.forEach(function(e,k){var g=sv('g',{});var rope=sv('path',{d:geo[k].d,fill:'none',stroke:'var(--bw-plank)','stroke-width':'4.6','stroke-linecap':'round',opacity:.35});
    var plank=sv('path',{d:geo[k].d,fill:'none',stroke:'var(--bw-plank)','stroke-width':'3.6','stroke-dasharray':'1.5 .9','stroke-linecap':'butt'});
    var gold=sv('path',{d:geo[k].d,fill:'none',stroke:'var(--bw-gold)','stroke-width':'3.6','stroke-dasharray':'1.5 .9','stroke-linecap':'butt',opacity:0});
    var glow=sv('path',{d:geo[k].d,fill:'none',stroke:'#fff','stroke-width':'5.6','stroke-linecap':'round',opacity:0});
    var badge=sv('g',{opacity:0}),bc=sv('circle',{cx:geo[k].mx.toFixed(1),cy:geo[k].my.toFixed(1),r:'3.3',fill:'var(--surface,#fff)',stroke:'var(--bw-ink)','stroke-width':'.5'}),bt=sv('text',{x:geo[k].mx.toFixed(1),y:(geo[k].my+1.5).toFixed(1),'text-anchor':'middle','font-size':'4.2','font-weight':'800',fill:'var(--bw-ink)','font-family':'inherit'});
    badge.appendChild(bc);badge.appendChild(bt);[glow,rope,plank,gold,badge].forEach(function(x){g.appendChild(x)});svg.appendChild(g);gE.push({g:g,glow:glow,gold:gold,badge:badge,bt:bt,plank:plank})});
  pos.forEach(function(p,v){var g=sv('g',{});g.appendChild(sv('circle',{cx:p[0],cy:p[1],r:'9.4',fill:'var(--bw-land2)'}));g.appendChild(sv('circle',{cx:p[0],cy:p[1]-.7,r:'8.4',fill:'var(--bw-land)'}));svg.appendChild(g)});
  pos.forEach(function(p,v){var b=document.createElement('button');b.type='button';b.className='bw-isl zk-p';b.setAttribute('data-zkc','');b.style.left=p[0]+'%';b.style.top=p[1]+'%';b.textContent=LET.charAt(v);
    b.setAttribute('aria-label','Island '+LET.charAt(v)+', '+deg[v]+' bridges');b.onclick=function(){if(swallow)return;tap(v)};isl.push(b);board.appendChild(b)});
  var walker=document.createElement('div');walker.className='bw-walker';walker.innerHTML=WALKER;walker.style.opacity=0;board.appendChild(walker);
  var note=document.createElement('div');note.className='bw-note';note.style.display='none';board.appendChild(note);
  stage.appendChild(board);stage.appendChild(pips.el);stage.appendChild(flag);root.appendChild(stage);
  function say(t){api.say(t)}
  function place(v,animFrom){var q=ZK.at(board,isl[v]);walker.style.transform='translate('+q.x+'px,'+q.y+'px)'}
  function unusedAt(v){var o=[];E.forEach(function(e,k){if(!used[k]&&(e[0]===v||e[1]===v))o.push(k)});return o}
  function other(k,v){var e=E[k];return e[0]===v?e[1]:e[0]}
  function setNote(t,ms){clearTimeout(noteT);if(!t){note.style.display='none';return}note.textContent=t;note.style.display='';if(ms)noteT=setTimeout(function(){note.style.display='none'},ms)}
  function paint(){
    E.forEach(function(e,k){var x=gE[k],u=used[k];x.gold.setAttribute('opacity',u?1:0);x.badge.setAttribute('opacity',u?1:0);if(u){var o=0;for(var q=0;q<hist.length;q++)if(hist[q].e===k)o=q+1;x.bt.textContent=o}
      var h=cur>=0&&!u&&!fin&&!proof&&(e[0]===cur||e[1]===cur);x.plank.setAttribute('class',h?'bw-hl':'');x.plank.setAttribute('stroke',hl.indexOf('e'+k)>=0?'var(--bw-gold)':'var(--bw-plank)')});
    for(var v=0;v<n;v++){var b=isl[v];b.classList.toggle('odd',(proof||showDeg)&&deg[v]%2===1);b.classList.toggle('mk',!!marks[v]);
      var d=b.querySelector('.bw-d');if(proof||showDeg){if(!d){d=document.createElement('span');d.className='bw-d';b.appendChild(d)}d.textContent=deg[v]}else if(d)d.remove();
      b.classList.toggle('zk-mark',hl.indexOf(v)>=0)}
    pips.set(hist.length);flag.classList.toggle('on',proof);
    if(cur>=0){walker.style.opacity=1}}
  function deadCheck(){ZK.stuck(stage,false);if(fin||cur<0)return;var left=m-hist.length;if(!left)return;
    if(!unusedAt(cur).length){ZK.stuck(stage,true,{text:'Dead end',onUndo:undo});say('No bridges left here. Undo.');return}
    var p=B.find(n,E,used.slice(),cur);if(!p){ZK.stuck(stage,true,{text:'A bridge is cut off now',onUndo:undo});say('From here some bridge can no longer be reached. Undo a step.')}}
  function start(v){ZK.ghostDone(ID);if(ghost)ghost.stop();cur=v;last=isl[v];place(v);walker.style.opacity=1;ZK.anim(walker,[{scale:'0'},{scale:'1.25'},{scale:'1'}],300,ZK.SPRING);ZK.sfx('lift');ZK.buzz('tap');hl=[];paint();say('Start on island '+LET.charAt(v)+'.')}
  function cross(k){var v=other(k,cur),from=cur,fq=ZK.at(board,isl[from]),tq=ZK.at(board,isl[v]);ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);hl=[];
    used[k]=1;hist.push({e:k,from:from});cur=v;last=isl[v];api.moved();
    walker.style.transform='translate('+tq.x+'px,'+tq.y+'px)';
    var x=gE[k];ZK.anim(walker,[{transform:'translate('+fq.x+'px,'+fq.y+'px)'},{transform:'translate('+((fq.x+tq.x)/2)+'px,'+((fq.y+tq.y)/2-10)+'px)',offset:.5},{transform:'translate('+tq.x+'px,'+tq.y+'px)'}],300,'ease-in-out');
    ZK.anim(x.gold,[{opacity:0},{opacity:1}],240,ZK.EASE);ZK.anim(x.glow,[{opacity:.9},{opacity:0}],520,'ease-out');ZK.anim(x.badge,[{opacity:0,transform:'scale(.2)'},{opacity:1,transform:'scale(1.3)'},{opacity:1,transform:'scale(1)'}],320,ZK.SPRING);
    ZK.sfx('cap',{n:Math.min(8,hist.length-1)});ZK.buzz('tap');setTimeout(function(){ZK.anim(isl[v],[{scale:'1'},{scale:'1.18'},{scale:'1'}],240,ZK.SPRING)},rm?0:240);
    paint();api.say('Bridge '+hist.length+' of '+m+'.');
    if(hist.length===m){fin=true;ZK.stuck(stage,false);setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:m,wrong:wrong,impossible:false}})},rm?0:340);return}
    deadCheck()}
  function tap(v){if(fin)return;
    if(proof){tapProof(v);return}
    if(cur<0){start(v);return}
    if(v===cur)return;
    var ks=unusedAt(cur).filter(function(k){return other(k,cur)===v});
    if(ks.length){cross(ks[0]);return}
    ZK.wrong(isl[v]);if(unusedAt(cur).length)unusedAt(cur).forEach(function(k){ZK.anim(gE[k].plank.parentNode,[{opacity:1},{opacity:.4},{opacity:1}],360)})}
  function oddList(){var o=[];deg.forEach(function(x,v){if(x%2)o.push(v)});return o}
  function tapProof(v){if(deg[v]%2===0){ZK.wrong(isl[v]);setNote('Even: bridges pair up here',1600);return}
    marks[v]=!marks[v];ZK.sfx('lift');ZK.buzz('tap');ZK.anim(isl[v],[{scale:'1.15'},{scale:'1'}],220,ZK.SPRING);paint();checkProof()}
  function checkProof(){
    var od=oddList();if(od.every(function(x){return marks[x]})){fin=true;proof=false;paint();api.moved();setNote('',0);ZK.stuck(stage,false);say('Proved: no walk can cross every bridge once.');
      setTimeout(function(){api.done({solved:true,moves:m+wrong,hints:hints,undos:undos,extra:{par:m,wrong:wrong,impossible:true,odd:inst.odd}})},rm?0:300)}}
  flag.onclick=function(){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();
    if(inst.impossible){proof=!proof;marks={};paint();setNote(proof?'Mark every island with an odd number':'',0);if(proof){ZK.sfx('lift');ZK.buzz('tap')}return}
    wrong++;showDeg=true;proof=false;paint();ZK.wrong(flag);var o=oddList();setNote(o.length===0?'Every island is even: you can walk it':'Only two islands are odd: you can walk it',2600);say('A walk does exist on this map.')};
  function toXY(e){var r=board.getBoundingClientRect();return[(e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100]}
  function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  L(board,'pointerdown',function(e){if(fin||proof)return;var b=e.target.closest&&e.target.closest('.bw-isl');if(!b)return;var v=isl.indexOf(b);
    if(cur<0){start(v);drag={id:e.pointerId,moved:false,x0:e.clientX,y0:e.clientY};swallow=false;return}
    if(v===cur)drag={id:e.pointerId,moved:false,x0:e.clientX,y0:e.clientY}});
  L(document,'pointermove',function(e){if(!drag||e.pointerId!==drag.id||fin)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<10)return;drag.moved=true;
    var P=toXY(e),best=-1,bd=1e9;unusedAt(cur).forEach(function(k){var o=other(k,cur),d=Math.hypot(P[0]-pos[o][0],P[1]-pos[o][1]);if(d<bd){bd=d;best=k}});
    if(best>=0&&bd<10){cross(best)}});
  function end(e){if(!drag||(e&&e.pointerId!==drag.id))return;var d=drag;drag=null;if(d.moved){swallow=true;setTimeout(function(){swallow=false},60)}}
  L(document,'pointerup',end);L(document,'pointercancel',end);
  /* the walker follows the layout when the board resizes */
  if(window.ResizeObserver){var ro=new ResizeObserver(function(){if(cur>=0)place(cur)});ro.observe(board);offs.push(function(){ro.disconnect()})}
  paint();
  if(inst.level===1&&inst.trail){var tr=inst.trail;ghost=ZK.ghost(stage,[{tap:isl[tr[0]]},{drag:[isl[tr[0]],isl[tr[1]]]}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin)return false;if(proof){proof=false;marks={};setNote('',0);paint();return true}
    if(hist.length){var h=hist.pop();used[h.e]=0;cur=h.from;last=isl[cur];undos++;place(cur);ZK.anim(walker,[{scale:'.8'},{scale:'1'}],240,ZK.SPRING);hl=[];ZK.unmark(stage);paint();ZK.sfx('undo');ZK.buzz('tap');deadCheck();return true}
    if(cur>=0){cur=-1;walker.style.opacity=0;undos++;paint();ZK.sfx('undo');return true}return false}
  return{undo:undo,
    restart:function(){if(fin)return;used=E.map(function(){return 0});hist=[];cur=-1;proof=false;marks={};hl=[];walker.style.opacity=0;ZK.unmark(stage);ZK.stuck(stage,false);setNote('',0);paint();ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;hints++;ZK.unmark(stage);
      if(inst.impossible){if(lv<=1){showDeg=true;paint();return 'Each island now shows its bridge count. Count the odd ones.'}
        if(lv===2){showDeg=true;hl=oddList();paint();return 'A walk can only start and end on odd islands. Here there are '+inst.odd+'.'}
        proof=true;marks={};oddList().forEach(function(x){marks[x]=true});paint();checkProof();return 'Marked them for you.'}
      if(cur<0){var r=B.solve(inst);if(lv<=1){showDeg=true;paint();return inst.odd?'Start on an island with an odd number of bridges.':'Every island is even: start anywhere.'}
        if(lv===2){hl=[r.start];paint();return 'Start on the marked island.'}start(r.start);return 'Started for you.'}
      var p=B.find(n,E,used.slice(),cur);
      if(!p){if(lv<3){return 'A bridge is cut off from here. Undo a step or two.'}var c=0;while(hist.length&&!B.find(n,E,used.slice(),cur)){undo();undos--;c++}if(!B.find(n,E,used.slice(),cur)){cur=-1;walker.style.opacity=0}paint();return 'Stepped back '+c+'.'}
      var to=other(p[0],cur);if(lv<=1){showDeg=true;paint();return 'Do not strand a bridge behind you: save some for later.'}
      if(lv===2){hl=[to];paint();return 'Cross toward the marked island.'}cross(p[0]);return 'Crossed for you.'},
    destroy:function(){clearTimeout(noteT);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{used:hist.length,cur:cur,fin:fin,proof:proof}}}}
window.V6BW={make:make,strand:strand,under:under,crossC:crossC};
ZK.override({id:ID,name:'Bridge Walk',family:'move',theme:'F7',calm:true,
  blurb:'Cross every bridge once, or prove that you cannot.',
  how:'Walk over every bridge exactly once. No way? Flag it and mark the odd islands.',
  areas:['space','flex'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var x=res.extra||{},par=(inst&&inst.par)||x.par||res.moves,m=res.moves,h=res.hints||0,wr=x.wrong||0,s=pzStarsByPar(m,par,h);if(wr&&s>1)s--;
    return{stars:s,line:(inst&&inst.impossible)?'Proved: too many odd islands for any walk.':'All '+par+' bridges crossed once.'}}});
})();
