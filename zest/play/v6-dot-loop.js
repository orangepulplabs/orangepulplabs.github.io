/* Zest v6: Dot Loop. Overrides puzzles_e5.js 'dot-loop' (original kept in ZK.orig).
   Draw ONE closed wire along the grid lines. Filled dots must end up inside, hollow rings outside. Drag a finger corner to corner (or tap neighbours).
   The wire tints its inside live and each clue lights up when it is satisfied. par = the shortest loop that fits (exact, from the original solver).
   Identity: a dark pegboard and a neon wire you pull with your finger (the trail puzzles of this batch: Dot Loop = drawing, Bridge Walk = a map, Dodecahedron Tour = a gem). */
(function(){
var ID='dot-loop',NS='http://www.w3.org/2000/svg';
function sv(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
function turns(L,Cv){var n=L.length,t=0;for(var i=0;i<n;i++){var a=L[(i+n-1)%n],b=L[i],c=L[(i+1)%n];if((b-a)!==(c-b))t++}return t}
/* 1.2.1 (level-review fix): raw levels 31-38 are dense 5x5 boards found by work/dl_gen5.js with the original exhaustive solver: 5-7 dots and 3-5 rings,
   at least one ring inside the dots' bounding box (the wire has to notch round it), shortest loop 18-20 with 10+ turns, and at most 4 different shortest
   loops (most have exactly one), so 'fewest' takes reading, not tracing round the cluster. Seeded and reproducible; the table is checked by the logic test. */
var TOP=[{"R":5,"C":5,"dots":[6,11,13,16,17,19,20],"hollows":[7,14,21,24],"loop":[6,7,8,14,15,16,22,23,29,28,27,26,25,31,30,24,18,12],"par":18,"turns":10},{"R":5,"C":5,"dots":[1,2,4,8,9,19],"hollows":[7,12,14,16,17],"loop":[1,2,3,4,5,11,17,16,22,23,29,28,27,21,15,9,8,7],"par":18,"turns":10},{"R":5,"C":5,"dots":[1,7,8,10,12,13,18],"hollows":[2,11,15,16],"loop":[0,1,2,8,9,10,16,22,28,27,26,20,14,13,19,18,12,6],"par":18,"turns":10},{"R":5,"C":5,"dots":[2,9,18,22,23,24],"hollows":[4,6,7,17],"loop":[2,3,4,10,11,17,23,29,35,34,33,32,26,27,21,15,9,8],"par":18,"turns":10},{"R":5,"C":5,"dots":[0,7,10,11,17,21,22],"hollows":[2,6,15,20],"loop":[0,1,7,13,14,8,9,15,21,27,33,32,31,25,19,18,12,6],"par":18,"turns":10},{"R":5,"C":5,"dots":[5,10,11,17,18,20,22],"hollows":[6,8,13,21],"loop":[6,7,13,14,15,21,22,28,34,33,32,26,25,31,30,24,18,12],"par":18,"turns":12},{"R":5,"C":5,"dots":[2,5,10,15,19],"hollows":[4,7,9,13,14],"loop":[0,1,2,3,9,8,14,15,21,22,23,29,28,27,26,25,24,18,12,6],"par":20,"turns":10},{"R":5,"C":5,"dots":[10,12,13,15,22,23,24],"hollows":[11,14,16,19],"loop":[12,13,19,25,26,20,14,15,16,22,28,29,35,34,33,32,31,30,24,18],"par":20,"turns":10}];
function make(level,rng){var D=PZE5.dl,inst=null;if(level>30){var T=TOP[Math.min(TOP.length,level-30)-1];return{level:level,title:'Level '+level,R:T.R,C:T.C,dots:T.dots.slice(),hollows:T.hollows.slice(),loop:T.loop.slice(),par:T.par,turns:T.turns}}
  for(var k=0;k<30;k++){inst=D.make(level,rng);if(level<4||turns(inst.loop,inst.C+1)>4)break}
  inst.turns=turns(inst.loop,inst.C+1);return inst}
var CSS='.dl{position:relative;width:100%;max-width:380px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:var(--font);--dl-bg:#1E2433;--dl-bg2:#2A3350;--dl-peg:#5B678A;--dl-ink:#fff;--dl-wire:#FFB347;--dl-glow:rgba(255,179,71,.5)}'
+':root[data-theme="light"] .dl{--dl-bg:#EAEEF9;--dl-bg2:#D9E0F3;--dl-peg:#97A1C2;--dl-ink:#1B2142;--dl-wire:#D9480F;--dl-glow:rgba(217,72,15,.35)}'
+'.dl-board{position:relative;width:100%;box-sizing:border-box;border-radius:26px;background:radial-gradient(120% 100% at 30% 15%,var(--dl-bg2),var(--dl-bg));box-shadow:inset 0 2px 0 rgba(255,255,255,.14),0 6px 18px rgba(20,25,60,.2);touch-action:none;user-select:none;-webkit-user-select:none;padding:6px}'
+'.dl-grid{position:relative;display:grid}'
+'.dl-vx{all:unset;position:relative;aspect-ratio:1;cursor:pointer;-webkit-tap-highlight-color:transparent}.dl-vx:focus-visible{outline:3px solid #fff;outline-offset:-6px;border-radius:50%}'
+'.dl-svg{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible}'
+'.dl-hint{outline:3px dashed #fff;outline-offset:-8px;border-radius:50%;animation:dlh 1s ease-in-out infinite}@keyframes dlh{50%{outline-offset:-3px}}'
+'@media (prefers-reduced-motion:reduce){.dl-hint{animation:none}}.zk-rm .dl-hint{animation:none}';
function mount(root,inst,api){ZK.css(CSS,'dl-css');root.textContent='';
  var R=inst.R,C=inst.C,Rv=R+1,Cv=C+1,rm=ZK.rm(api),path=[],closed=false,fin=false,hints=0,undos=0,hl=-1,btns=[],ghost=null,idle=null,offs=[],drag=null,swallow=false,bad=null,last=null;
  var stage=document.createElement('div');stage.className='dl zk-stage zk-host'+(rm?' zk-rm':'');
  var board=document.createElement('div');board.className='dl-board zk-board';board.setAttribute('role','group');board.setAttribute('aria-label','Dot grid, '+Rv+' by '+Cv+' corners');
  var cs0=getComputedStyle(root),avail=Math.min(380,(root.clientWidth-parseFloat(cs0.paddingLeft||0)-parseFloat(cs0.paddingRight||0))||350),cell=Math.min(78,Math.floor((avail-12)/Cv)),grid=document.createElement('div');grid.className='dl-grid';grid.style.gridTemplateColumns='repeat('+Cv+','+cell+'px)';grid.style.width=(cell*Cv)+'px';
  board.style.width=(cell*Cv+12)+'px';board.style.maxWidth='100%';
  var svg=sv('svg',{viewBox:'0 0 '+Cv+' '+Rv,'aria-hidden':'true',focusable:'false','class':'dl-svg'});
  var pips=ZK.pips(inst.par);
  function px(v){return[v%Cv+.5,Math.floor(v/Cv)+.5]}
  function nm(v){return 'row '+(Math.floor(v/Cv)+1)+', column '+(v%Cv+1)}
  function adjV(a,b){return Math.abs(Math.floor(a/Cv)-Math.floor(b/Cv))+Math.abs(a%Cv-b%Cv)===1}
  function inPoly(P,x,y){var c=false;for(var i=0,j=P.length-1;i<P.length;j=i++){var a=px(P[i]),b=px(P[j]);if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
  function cc(c){return[c%C+1,Math.floor(c/C)+1]}
  function segs(){return closed?path.length:Math.max(0,path.length-1)}
  /* clue state for the (implied) loop */
  function clue(c,hollow){if(path.length<3)return 0;var p=cc(c),ins=inPoly(path,p[0],p[1]);return hollow?(ins?-1:0):(ins?1:0)}
  function paint(){svg.textContent='';
    for(var v=0;v<Rv*Cv;v++){var q=px(v);svg.appendChild(sv('circle',{cx:q[0],cy:q[1],r:'.05',fill:'var(--dl-peg)'}))}
    var pts=path.map(function(v){var q=px(v);return q[0]+','+q[1]}).join(' ');
    if(path.length>=3)svg.appendChild(sv('polygon',{points:pts,fill:'var(--dl-wire)','fill-opacity':closed?.3:.14,stroke:'none'}));
    if(path.length>1){svg.appendChild(sv(closed?'polygon':'polyline',{points:pts,fill:'none',stroke:'var(--dl-glow)','stroke-width':'.3','stroke-linejoin':'round','stroke-linecap':'round'}));
      svg.appendChild(sv(closed?'polygon':'polyline',{points:pts,fill:'none',stroke:'var(--dl-wire)','stroke-width':'.12','stroke-linejoin':'round','stroke-linecap':'round'}))}
    if(path.length&&!closed){var e=px(path[path.length-1]);svg.appendChild(sv('circle',{cx:e[0],cy:e[1],r:'.2',fill:'var(--dl-wire)',stroke:'#fff','stroke-width':'.05'}));
      if(path.length>=4&&adjV(path[path.length-1],path[0])){var s=px(path[0]);svg.appendChild(sv('circle',{cx:s[0],cy:s[1],r:'.26',fill:'none',stroke:'var(--dl-wire)','stroke-width':'.05','stroke-dasharray':'.1 .08'}))}}
    inst.dots.forEach(function(c){var p=cc(c),k=clue(c,false),bd=bad&&bad.indexOf(c)>=0;
      if(k)svg.appendChild(sv('circle',{cx:p[0],cy:p[1],r:'.3',fill:'none',stroke:'#7BE0A0','stroke-width':'.07'}));
      if(bd)svg.appendChild(sv('circle',{cx:p[0],cy:p[1],r:'.34',fill:'none',stroke:'#E9A23B','stroke-width':'.09'}));
      svg.appendChild(sv('circle',{cx:p[0],cy:p[1],r:'.19',fill:'var(--dl-ink)'}))});
    inst.hollows.forEach(function(c){var p=cc(c),k=clue(c,true),bd=bad&&bad.indexOf(c)>=0;
      if(k||bd)svg.appendChild(sv('circle',{cx:p[0],cy:p[1],r:'.34',fill:'none',stroke:'#E9A23B','stroke-width':'.09'}));
      svg.appendChild(sv('circle',{cx:p[0],cy:p[1],r:'.19',fill:'none',stroke:'var(--dl-ink)','stroke-width':'.07'}));
      svg.appendChild(sv('path',{d:'M'+(p[0]-.08)+' '+(p[1]-.08)+'L'+(p[0]+.08)+' '+(p[1]+.08)+'M'+(p[0]+.08)+' '+(p[1]-.08)+'L'+(p[0]-.08)+' '+(p[1]+.08),stroke:'var(--dl-ink)','stroke-width':'.04','stroke-linecap':'round',opacity:.7}))});
    for(v=0;v<Rv*Cv;v++){btns[v].classList.toggle('dl-hint',hl===v);var on=path.indexOf(v)>=0;
      btns[v].setAttribute('aria-label','Corner '+nm(v)+(path.length&&v===path[0]?', start':v===path[path.length-1]?', end of your wire':on?', on your wire':''))}
    pips.set(segs())}
  for(var i=0;i<Rv*Cv;i++)(function(v){var b=document.createElement('button');b.type='button';b.className='dl-vx';b.setAttribute('data-zkc','');b.setAttribute('aria-label','Corner '+nm(v));
    b.onclick=function(){if(swallow)return;tapV(v)};btns[v]=b;grid.appendChild(b)})(i);
  grid.appendChild(svg);board.appendChild(grid);stage.appendChild(board);stage.appendChild(pips.el);root.appendChild(stage);
  function sayLen(){api.say('Wire length '+segs()+'.')}
  function dead(){if(!path.length||closed)return false;var e=path[path.length-1],ok=false;
    [[0,1],[1,0],[0,-1],[-1,0]].forEach(function(d){var r=Math.floor(e/Cv)+d[0],c=e%Cv+d[1];if(r<0||c<0||r>=Rv||c>=Cv)return;var v=r*Cv+c;if(path.indexOf(v)<0||(v===path[0]&&path.length>=4))ok=true});return !ok}
  function check(){var bl=[],i;inst.dots.forEach(function(c){var p=cc(c);if(!inPoly(path,p[0],p[1]))bl.push(c)});inst.hollows.forEach(function(c){var p=cc(c);if(inPoly(path,p[0],p[1]))bl.push(c)});return bl}
  function push(v){ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);hl=-1;bad=null;path.push(v);last=btns[v];if(path.length>1)api.moved();   /* 1.2.1: the start corner is not a move (the header now matches the wire length) */
   ZK.sfx('click',{p:Math.min(14,path.length)});ZK.buzz('tap');
    ZK.anim(btns[v],[{scale:'1.5'},{scale:'1'}],240,ZK.SPRING);paint();ZK.stuck(stage,false);if(dead())ZK.stuck(stage,true,{text:'Boxed in',onUndo:undo})}
  function pop(){path.pop();hl=-1;bad=null;paint();ZK.sfx('undo');ZK.buzz('tap');ZK.stuck(stage,false);if(dead())ZK.stuck(stage,true,{text:'Boxed in',onUndo:undo})}
  function tryClose(){var bl=check();
    if(bl.length){bad=bl;paint();ZK.wrong(null);ZK.anim(svg,[{translate:'0 0'},{translate:'-5px 0'},{translate:'4px 0'},{translate:'0 0'}],240,'ease-out');
      api.say('The loop does not fit every clue. Amber marks show which.');setTimeout(function(){bad=null;if(!fin)paint()},1400);return false}
    closed=true;fin=true;api.moved();last=btns[path[0]];paint();ZK.stuck(stage,false);api.say('Loop closed. Every clue fits.');
    setTimeout(function(){api.done({solved:true,moves:segs(),hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:260);return true}
  function tapV(v){if(fin)return;var e=path.length?path[path.length-1]:-1;
    if(!path.length){push(v);return}
    if(v===e)return;
    if(!adjV(e,v)){ZK.wrong(btns[v]);return}
    if(path.length>=2&&v===path[path.length-2]){pop();return}
    if(v===path[0]&&path.length>=4){tryClose();return}
    if(path.indexOf(v)>=0){ZK.wrong(btns[v]);return}
    push(v)}
  function toUnits(e){var r=svg.getBoundingClientRect();return[(e.clientX-r.left)/r.width*Cv,(e.clientY-r.top)/r.height*Rv]}
  function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  L(grid,'pointerdown',function(e){if(fin)return;var b=e.target.closest&&e.target.closest('.dl-vx');if(!b)return;var v=btns.indexOf(b);
    if(!path.length||v===path[path.length-1]){drag={id:e.pointerId,moved:false,x0:e.clientX,y0:e.clientY,fresh:!path.length,v:v}}});
  L(document,'pointermove',function(e){if(!drag||e.pointerId!==drag.id||fin)return;
    if(!drag.moved){if(Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<8)return;drag.moved=true;if(drag.fresh&&!path.length){push(drag.v)}}
    var P=toUnits(e),it=0;
    while(it++<4&&path.length&&!fin){var en=path[path.length-1],ep=px(en),d0=Math.hypot(P[0]-ep[0],P[1]-ep[1]);if(d0<.55)break;
      var best=-1,bd=1e9;[[0,1],[1,0],[0,-1],[-1,0]].forEach(function(d){var r=Math.floor(en/Cv)+d[0],c=en%Cv+d[1];if(r<0||c<0||r>=Rv||c>=Cv)return;var v=r*Cv+c,q=px(v),dd=Math.hypot(P[0]-q[0],P[1]-q[1]);if(dd<bd){bd=dd;best=v}});
      if(best<0||bd>=d0)break;
      if(path.length>=2&&best===path[path.length-2]){pop();continue}
      if(best===path[0]&&path.length>=4){tryClose();drag=null;break}
      if(path.indexOf(best)>=0)break;
      push(best)}});
  function end(e){if(!drag||(e&&e.pointerId!==drag.id))return;var d=drag;drag=null;if(d.moved){swallow=true;setTimeout(function(){swallow=false},60)}}
  L(document,'pointerup',end);L(document,'pointercancel',end);
  paint();
  if(inst.level===1){var Lp=inst.loop;ghost=ZK.ghost(stage,[{drag:[btns[Lp[0]],btns[Lp[1]]]}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin||!path.length)return false;undos++;pop();return true}
  function plan(){var Lp=inst.loop,n=Lp.length,best=null;if(!path.length)return{start:Lp[0]};
    var i0=Lp.indexOf(path[0]);if(i0>=0)[1,-1].forEach(function(d){var m=0;while(m<path.length&&Lp[((i0+d*m)%n+n)%n]===path[m])m++;if(!best||m>best.m)best={m:m,d:d,i0:i0}});
    if(best&&best.m===path.length)return{next:Lp[(((best.i0+best.d*path.length)%n)+n)%n]};return{back:best?best.m:0}}
  return{undo:undo,
    restart:function(){if(fin)return;path=[];hl=-1;bad=null;paint();ZK.unmark(stage);ZK.stuck(stage,false);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var p=plan(),s;hints++;
      if(p.start!==undefined){hl=p.start;paint();if(lv>=3){hl=-1;tapV(p.start);return 'Started the wire for you.'}return lv<=1?'Start near the marked corner.':'Start at the marked corner.'}
      if(p.back!==undefined){var k=p.back;hl=k?path[k-1]:-1;paint();if(lv>=3){while(path.length>k)path.pop();hl=-1;paint();return 'Stepped back to a wire that can still be shortest.'}return lv<=1?'The wire has wandered from the shortest loop. Step back.':'Step back to the marked corner.'}
      hl=p.next;paint();if(lv>=3){hl=-1;tapV(p.next);return 'Drew the next piece.'}return lv<=1?'The marked corner comes next.':'Draw to the marked corner.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{len:segs(),fin:fin,path:path.slice()}}}}
ZK.override({id:ID,name:'Dot Loop',family:'grid',theme:'F7',calm:true,
  blurb:'Draw one wire around the dots and keep the rings outside.',
  how:'Pull one closed wire. Filled dots inside, rings outside.',
  areas:['space','flex'],levels:38,secs:90,make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;return{stars:pzStarsByPar(m,p,h),line:'Wire length '+m+(m<=p?', the shortest.':'. The shortest is '+p+'.')}}});
})();
