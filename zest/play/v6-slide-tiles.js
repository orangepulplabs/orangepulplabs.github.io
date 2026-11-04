/* Zest v6 pilot: Slide Tiles (8- and 15-puzzle). Overrides puzzles_a.js 'slide-tiles' (original kept in ZK.orig). Uses the original IDA* solver (PZA.tSolve).
   Goal: tiles in order, gap last. Every start is a random walk from solved (always solvable).
   Levels are CURATED by tests/gen_slide.js: exact par by IDA* (Manhattan, w=1); 3x3 for 1-18, 4x4 from 19 with a breather.
   Aha filter: from level 4 the optimal route must move a tile that starts in its home (you have to break order to make order).
   make() shows the curated level as is, or transposed (same par), by the seed. No text: the tray has its home numbers etched faintly, tiles in place
   carry a small green mark, and par pips sit under the board. Tap any tile in line with the gap (slides the whole line) or drag it. */
(function(){
var ID='slide-tiles';
var LEVELS=[[3,[1,2,3,0,4,6,7,5,8],3],[3,[1,2,3,7,4,5,0,8,6],4],[3,[4,1,3,0,2,5,7,8,6],5],[3,[1,6,2,4,5,3,7,0,8],7],[3,[1,2,3,7,5,6,8,4,0],8],[3,[2,4,3,1,5,6,7,8,0],8],[3,[1,0,2,4,5,6,7,3,8],9],[3,[8,1,3,4,2,5,0,7,6],10],[3,[8,1,3,4,2,5,7,6,0],12],[3,[1,2,3,0,5,6,7,8,4],11],[3,[4,2,1,7,6,3,8,0,5],13],[3,[1,5,0,7,4,2,3,8,6],14],[3,[4,1,6,3,5,2,0,7,8],12],[3,[1,6,0,4,5,2,3,7,8],16],[3,[3,5,2,1,8,6,0,4,7],16],[3,[5,8,2,1,0,6,4,3,7],14],[3,[4,5,2,7,0,6,8,1,3],18],[3,[1,4,0,7,2,3,8,5,6],16],[4,[1,2,3,4,5,6,8,0,13,9,7,11,10,14,15,12],12],[4,[1,2,3,0,5,6,7,4,14,10,12,8,9,13,11,15],11],[4,[1,2,3,4,5,13,7,8,9,10,12,0,14,6,11,15],15],[4,[5,1,3,4,13,2,6,7,14,10,11,8,9,0,15,12],16],[4,[2,0,3,7,1,5,8,4,9,6,11,12,13,10,14,15],13],[4,[1,3,4,8,5,0,2,7,13,9,11,12,10,14,6,15],18],[4,[1,10,7,3,5,11,2,8,9,6,4,0,13,14,15,12],21],[4,[1,2,4,8,5,6,0,11,13,9,3,10,14,7,15,12],19],[4,[6,1,4,8,5,0,2,11,10,3,12,7,9,13,14,15],22],[4,[1,7,3,8,6,2,4,0,5,10,9,12,13,14,15,11],24],[4,[7,2,8,3,1,6,0,10,5,9,12,4,13,14,11,15],21],[4,[5,1,3,4,0,2,7,11,13,6,12,15,14,8,9,10],27]]; /*LEVELS*/
function transpose(t,n){var o=new Array(n*n);for(var r=0;r<n;r++)for(var c=0;c<n;c++){var v=t[r*n+c];o[c*n+r]=v===0?0:(function(){var h=v-1,hr=(h/n)|0,hc=h%n;return hc*n+hr+1})()}return o}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var L=LEVELS[level-1],n=L[0],t=L[1].slice();if(pzInt(rng,2))t=transpose(t,n);
  return{level:level,title:'Level '+level,n:n,tiles:t,par:L[2],parExact:true}}
window.V6ST={make:make,transpose:transpose,levels:function(){return LEVELS}};

var CSS=''
+'.st{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:var(--font);--st-tray:#D9CBB4;--st-well:#C9B89D;--st-tile1:#FFFDF7;--st-tile2:#F1E7D6;--st-ink:#3B2A1A;--st-etch:rgba(80,55,30,.22)}'
+':root[data-theme="dark"] .st{--st-tray:#2B251F;--st-well:#211C17;--st-tile1:#4A4036;--st-tile2:#3A3129;--st-ink:#F6EBDD;--st-etch:rgba(255,235,210,.14)}'
+'.st-b{position:relative;width:100%;aspect-ratio:1;padding:8px;box-sizing:border-box;border-radius:24px;background:var(--st-tray);box-shadow:inset 0 3px 8px rgba(0,0,0,.18),0 1px 0 rgba(255,255,255,.4);touch-action:none;user-select:none;-webkit-user-select:none}'
+'.st-in{position:relative;width:100%;height:100%}'
+'.st-slot{position:absolute;display:flex;align-items:center;justify-content:center;font:700 1.3rem var(--disp);color:var(--st-etch)}'
+'.st-slot::before{content:"";position:absolute;inset:4%;border-radius:16%;background:var(--st-well);box-shadow:inset 0 2px 4px rgba(0,0,0,.18);z-index:-1}'
+'.st-t{all:unset;position:absolute;left:0;top:0;box-sizing:border-box;padding:4%;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .17s cubic-bezier(.25,1.25,.5,1);will-change:transform}'
+'.st-t.drag{transition:none;z-index:3}'
+'.st-f{position:relative;width:100%;height:100%;border-radius:16%;display:flex;align-items:center;justify-content:center;background:linear-gradient(165deg,var(--st-tile1),var(--st-tile2));box-shadow:inset 0 2px 0 rgba(255,255,255,.6),inset 0 -4px 0 rgba(0,0,0,.12),0 3px 4px rgba(40,25,10,.22);font:700 1.75rem/1 var(--disp);color:var(--st-ink)}'
+'.st.n4 .st-f{font-size:1.4rem}.st.n4 .st-slot{font-size:1rem}'
+'.st-f::after{content:"";position:absolute;right:9%;bottom:9%;width:15%;height:15%;border-radius:50%;background:#2E9E5B;box-shadow:0 0 0 2px rgba(255,255,255,.7);opacity:0;scale:.3;transition:opacity .2s,scale .3s '+ZK.SPRING+'}'
+'.st-t.home .st-f::after{opacity:1;scale:1}'
+'.st-t.home .st-f{box-shadow:inset 0 2px 0 rgba(255,255,255,.6),inset 0 -4px 0 rgba(0,0,0,.12),0 3px 4px rgba(40,25,10,.22),inset 0 0 0 2px rgba(46,158,91,.35)}'
+'.st-t:focus-visible .st-f{outline:3px solid var(--ink);outline-offset:2px}'
+'.st-t.zk-mark{outline:none}.st-t.zk-mark .st-f{animation:zkmark 1s ease-in-out infinite}'
+'.zk-rm .st-t{transition:none}@media (prefers-reduced-motion:reduce){.st-t{transition:none}}';

function mount(root,inst,api){ZK.css(CSS,'st-css');root.textContent='';
  var n=inst.n,N=n*n,rm=ZK.rm(api),t=inst.tiles.slice(),hist=[],hints=0,undos=0,fin=false,last=null,btn={},offs=[],idle=null,drag=null,swallow=false,size=100/n;
  var stage=document.createElement('div');stage.className='st zk-stage zk-host n'+n+(rm?' zk-rm':'');
  var b=document.createElement('div');b.className='st-b zk-board';b.setAttribute('role','group');b.setAttribute('aria-label','Tiles, '+n+' by '+n);
  var inn=document.createElement('div');inn.className='st-in';b.appendChild(inn);
  for(var p=0;p<N-1;p++){var sl=document.createElement('span');sl.className='st-slot';sl.setAttribute('aria-hidden','true');sl.textContent=String(p+1);sl.style.left=(p%n)*size+'%';sl.style.top=((p/n)|0)*size+'%';sl.style.width=size+'%';sl.style.height=size+'%';inn.appendChild(sl)}
  for(var v=1;v<N;v++)(function(v){var e=document.createElement('button');e.type='button';e.className='st-t zk-p';e.setAttribute('data-zkc','');e.style.width=size+'%';e.style.height=size+'%';
    e.innerHTML='<span class="st-f" aria-hidden="true">'+v+'</span>';e.onclick=function(){if(swallow)return;tapTile(v)};btn[v]=e;inn.appendChild(e)})(v);
  var pips=ZK.pips(inst.par);
  stage.appendChild(b);stage.appendChild(pips.el);root.appendChild(stage);
  function pos(v){return t.indexOf(v)}
  function gap(){return t.indexOf(0)}
  function xy(p){return{x:p%n,y:(p/n)|0}}
  function place(v,dx,dy){var q=xy(pos(v));btn[v].style.transform='translate('+(q.x*100+(dx||0))+'%,'+(q.y*100+(dy||0))+'%)'}
  function paint(){var g=gap();for(var v=1;v<N;v++){place(v);var p=pos(v),home=p===v-1,q=xy(p);btn[v].classList.toggle('home',home);
      btn[v].setAttribute('aria-label','Tile '+v+', row '+(q.y+1)+', column '+(q.x+1)+(home?', in place':'')+(line(v)?', can slide':''))}}
  function line(v){var p=xy(pos(v)),g=xy(gap());return (p.x===g.x)!==(p.y===g.y)}
  /* the tiles between v and the gap (v first), in the order they move (nearest the gap first) */
  function chain(v){var p=xy(pos(v)),g=xy(gap()),out=[];if(!line(v))return null;var sx=Math.sign(g.x-p.x),sy=Math.sign(g.y-p.y),x=g.x-sx,y=g.y-sy;
    while(true){out.push(t[y*n+x]);if(x===p.x&&y===p.y)break;x-=sx;y-=sy}return{tiles:out,dx:sx,dy:sy}}
  function step(v){var p=pos(v),g=gap();t[g]=v;t[p]=0;hist.push(v);api.moved()}
  function moveChain(ch){ZK.unmark(stage);var homeBefore=0;for(var i=1;i<N;i++)if(pos(i)===i-1)homeBefore++;
    ch.tiles.forEach(function(v){step(v)});last=btn[ch.tiles[ch.tiles.length-1]];paint();pips.set(hist.length);
    ch.tiles.forEach(function(v,i){if(!rm&&i)btn[v].style.transitionDelay=(i*22)+'ms';setTimeout(function(){btn[v].style.transitionDelay=''},200)});
    ZK.sfx('slide');ZK.buzz('move');
    var homeNow=0;for(var j=1;j<N;j++)if(pos(j)===j-1)homeNow++;
    if(homeNow>homeBefore)setTimeout(function(){ZK.sfx('star',{i:Math.min(2,((homeNow/(N-1))*3)|0)})},rm?0:150);
    if(homeNow===N-1){fin=true;api.say('All in order.');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:240)}}
  function tapTile(v){if(fin)return;var ch=chain(v);if(!ch){ZK.wrong(btn[v].firstChild);return}moveChain(ch)}
  /* drag along the line toward the gap; the whole chain follows, clamped to one cell; release past 35% commits */
  function L(tg,ty,fn,o){tg.addEventListener(ty,fn,o);offs.push(function(){tg.removeEventListener(ty,fn,o)})}
  L(b,'pointerdown',function(e){if(fin)return;var el=e.target.closest&&e.target.closest('.st-t');if(!el)return;var v=+el.firstChild.textContent,ch=chain(v);if(!ch)return;
    drag={v:v,ch:ch,x0:e.clientX,y0:e.clientY,on:false,id:e.pointerId,cell:inn.getBoundingClientRect().width/n,f:0};ZK.sfx('press')});
  L(document,'pointermove',function(e){if(!drag||e.pointerId!==drag.id)return;var dx=e.clientX-drag.x0,dy=e.clientY-drag.y0,along=drag.ch.dx?dx*drag.ch.dx:dy*drag.ch.dy;
    if(!drag.on){if(Math.abs(along)<8)return;drag.on=true;drag.ch.tiles.forEach(function(v){btn[v].classList.add('drag')})}
    var f=Math.max(0,Math.min(1,along/drag.cell));drag.f=f;drag.ch.tiles.forEach(function(v){place(v,drag.ch.dx*f*100,drag.ch.dy*f*100)})});
  function end(e){if(!drag||(e&&e.pointerId!==drag.id))return;var d=drag;drag=null;if(!d.on)return;d.ch.tiles.forEach(function(v){btn[v].classList.remove('drag')});
    swallow=true;setTimeout(function(){swallow=false},60);
    if(d.f>.35)moveChain(d.ch);else{paint();ZK.sfx('soft')}}
  L(document,'pointerup',end);L(document,'pointercancel',end);
  L(b,'keydown',function(e){var k=e.key,d=k==='ArrowUp'?[0,1]:k==='ArrowDown'?[0,-1]:k==='ArrowLeft'?[1,0]:k==='ArrowRight'?[-1,0]:null;if(!d||fin)return;e.preventDefault();
    var g=xy(gap()),x=g.x+d[0],y=g.y+d[1];if(x<0||y<0||x>=n||y>=n){ZK.wrong(b,{});return}tapTile(t[y*n+x]);btn[t[g.y*n+g.x]]&&btn[t[g.y*n+g.x]].focus()});
  paint();pips.set(0);
  requestAnimationFrame(function(){/* first paint without sliding in */});
  idle=ZK.idle(stage,25000);
  function next(){var r=PZA.tSolve(t,n,1,n===3?2e6:400000)||PZA.tSolve(t,n,3,1e6);return r&&r.path.length?r.path[0]:null}
  return{undo:function(){if(fin||!hist.length)return false;var v=hist.pop(),p=pos(v),g=gap();
      /* the tile goes back to where the gap is now (it came from there) */
      t[g]=v;t[p]=0;undos++;paint();pips.set(hist.length);ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true},
    restart:function(){if(fin)return;t=inst.tiles.slice();hist=[];paint();pips.set(0);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var v=next();ZK.unmark(stage);if(!v)return null;hints++;
      if(lv<=1){var g=gap(),need=null;for(var i=1;i<N;i++)if(pos(i)!==i-1){need=i;break}if(need){ZK.mark(btn[need]);return 'Where does this one belong?'}return 'Nearly there.'}
      if(lv===2){ZK.mark(btn[v]);return 'Slide this one.'}
      moveChain(chain(v));return 'Slid for you.'},
    destroy:function(){if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{tiles:t.slice(),moves:hist.length,fin:fin}}}}

ZK.override({id:ID,name:'Slide Tiles',family:'move',blurb:'Slide numbered tiles into order.',
  how:'Slide tiles into the gap until every number sits on its place.',
  areas:['space','control'],levels:30,secs:90,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'In order in '+m+' move'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
