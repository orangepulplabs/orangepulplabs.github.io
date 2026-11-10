/* Zest v6: Sprout Lines. Overrides puzzles_d7.js 'sprout-lines' (original kept in ZK.orig). The sprouts engine below (grid paths, legal moves, route search,
   playout generator) is copied unchanged from the original, because PZD7 does not expose it. Night-garden look: glowing seeds, a vine you draw by dragging.
   Goal (solo): draw K vines before no vine can be drawn. Every vine sprouts a new seed in its middle. Seeds show their free vine slots as dots. */
(function(){
var ID='sprout-lines',NS='http://www.w3.org/2000/svg';
function sv(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
function r2(x){return Math.round(x*100)/100}
var SG=30,DR=[-1,1,0,0],DC=[0,0,-1,1];
function spNew(pos){var w=new Uint8Array(SG*SG),spots=[];pos.forEach(function(p){spots.push({r:p[0],c:p[1],l:3});w[p[0]*SG+p[1]]=2});return{w:w,spots:spots,moves:[]}}
function spClone(st){return{w:st.w.slice(),spots:st.spots.map(function(s){return{r:s.r,c:s.c,l:s.l}}),moves:st.moves.slice()}}
function spIdx(s){return s.r*SG+s.c}
function spEmptyNb(st,idx){var r=Math.floor(idx/SG),c=idx%SG,o=[];for(var d=0;d<4;d++){var rr=r+DR[d],cc=c+DC[d];if(rr>=0&&rr<SG&&cc>=0&&cc<SG&&st.w[rr*SG+cc]===0)o.push(rr*SG+cc)}return o}
function spAdjTo(idx,target){var r=Math.floor(idx/SG),c=idx%SG,tr=Math.floor(target/SG),tc=target%SG;return Math.abs(r-tr)+Math.abs(c-tc)===1}
/* breadth-first search over empty cells from src cells to the first cell satisfying goal(cell); returns cell list or null */
function spBfs(st,src,goal,rng){var prev=new Int16Array(SG*SG).fill(-2),q=[],h=0,i;
  src=rng?pzShuffle(src,rng):src;src.forEach(function(s){prev[s]=-1;q.push(s)});
  while(h<q.length){var x=q[h++];if(goal(x)){var p=[],y=x;while(y>=0){p.push(y);y=prev[y]}return p.reverse()}
    var r=Math.floor(x/SG),c=x%SG,o=rng?pzInt(rng,4):0;
    for(i=0;i<4;i++){var d=(o+i)&3,rr=r+DR[d],cc=c+DC[d];if(rr>=0&&rr<SG&&cc>=0&&cc<SG){var y2=rr*SG+cc;if(st.w[y2]===0&&prev[y2]===-2){prev[y2]=x;q.push(y2)}}}}
  return null}
function spRoute(st,a,b,rng){var A=spIdx(st.spots[a]),Bc=spIdx(st.spots[b]);
  if(a!==b){var p=spBfs(st,spEmptyNb(st,A),function(x){return spAdjTo(x,Bc)},rng);return p?[A].concat(p,[Bc]):null}
  var nb=spEmptyNb(st,A),best=null;if(rng)nb=pzShuffle(nb,rng);
  nb.forEach(function(n1){var p=spBfs(st,[n1],function(x){return x!==n1&&spAdjTo(x,A)},null);if(p&&(!best||p.length<best.length))best=p});
  return best?[A].concat(best,[A]):null}
function spApply(st,path,f,t){var k=path.length-2,mid=path[Math.ceil(k/2)],i;for(i=1;i<=k;i++)st.w[path[i]]=1;st.w[mid]=2;
  st.spots.push({r:Math.floor(mid/SG),c:mid%SG,l:1});if(f===t)st.spots[f].l-=2;else{st.spots[f].l--;st.spots[t].l--}st.moves.push({f:f,t:t,path:path})}
function spLegal(st){var comp=new Int16Array(SG*SG).fill(-1),nc=0,i,out=[];
  for(i=0;i<SG*SG;i++)if(st.w[i]===0&&comp[i]<0){var q=[i],h=0;comp[i]=nc;while(h<q.length){var x=q[h++],r=Math.floor(x/SG),c=x%SG;for(var d=0;d<4;d++){var rr=r+DR[d],cc=c+DC[d];if(rr>=0&&rr<SG&&cc>=0&&cc<SG){var y=rr*SG+cc;if(st.w[y]===0&&comp[y]<0){comp[y]=nc;q.push(y)}}}}nc++}
  var cs=st.spots.map(function(s){return s.l>=1?spEmptyNb(st,spIdx(s)).map(function(x){return comp[x]}):[]});
  for(i=0;i<st.spots.length;i++){if(st.spots[i].l<1)continue;
    if(st.spots[i].l>=2){var seen={},lp=false;cs[i].forEach(function(cp){if(seen[cp])lp=true;seen[cp]=1});if(lp)out.push({f:i,t:i})}
    for(var j=i+1;j<st.spots.length;j++)if(st.spots[j].l>=1&&cs[i].some(function(cp){return cs[j].indexOf(cp)>=0}))out.push({f:i,t:j})}
  return out}
function spPlay(st,K,rng){while(st.moves.length<K){var lm=spLegal(st);if(!lm.length)break;var m=lm[pzInt(rng,lm.length)],p=spRoute(st,m.f,m.t,rng);if(!p)break;spApply(st,p,m.f,m.t)}return st}
function spFind(st0,K,rng,tries){var best=null;for(var t=0;t<tries;t++){var st=spPlay(spClone(st0),K,rng);if(!best||st.moves.length>best.moves.length)best=st;if(st.moves.length>=K)break}return best}
var SP_POS={2:[[9,9],[20,20]],3:[[8,14],[21,8],[21,21]],4:[[8,8],[8,21],[21,8],[21,21]]};
function spSpec(level){var n=level<=8?2:level<=20?3:4,K;
  if(n===2)K=3+Math.floor((level-1)/3);else if(n===3)K=Math.min(8,5+Math.floor((level-9)/4));else K=7+Math.floor((level-21)*4/9);
  return{n:n,K:Math.min(K,3*n-1)}}
function spMake0(level,rng){var sp=spSpec(level),pos=SP_POS[sp.n].map(function(p){return[p[0]+pzInt(rng,3)-1,p[1]+pzInt(rng,3)-1]}),st0=spNew(pos),best=spFind(st0,sp.K,rng,80),K=Math.min(sp.K,best.moves.length);
  return{title:'Level '+level,level:level,n:sp.n,G:SG,spots0:pos,K:K,par:K,sol:best.moves.slice(0,K).map(function(m){return{f:m.f,t:m.t,path:m.path}})}}
function spSmooth(pts){for(var it=0;it<2;it++){var o=[pts[0]],i;for(i=0;i<pts.length-1;i++){var p=pts[i],q=pts[i+1];o.push([.75*p[0]+.25*q[0],.75*p[1]+.25*q[1]],[.25*p[0]+.75*q[0],.25*p[1]+.75*q[1]])}o.push(pts[pts.length-1]);pts=o}return pts}
/* aha filter: from level 4, careless play (random legal vines, shortest routes) must usually FAIL to reach K, so the shape of the vines matters */
function pReach(inst,rng,N){var ok=0;for(var t=0;t<N;t++){var st=spNew(inst.spots0);spPlay(st,inst.K,rng);if(st.moves.length>=inst.K)ok++}return ok/N}
function make(level,rng){if(PRE[level])return makePre(level,rng);var sp=spSpec(level),extra=level<6?0:Math.min(2,1+Math.floor((level-6)/7)),kTop=Math.min(3*sp.n-1,sp.K+extra),pos=SP_POS[sp.n].map(function(p){return[p[0]+pzInt(rng,3)-1,p[1]+pzInt(rng,3)-1]}),st0=spNew(pos),best=null,K;
  for(K=kTop;K>=sp.K&&!best;K--){var r=spFind(st0,K,rng,level<4?60:100);if(r&&r.moves.length>=K){best=r;break}}
  if(!best){best=spFind(st0,sp.K,rng,200);K=Math.min(sp.K,best.moves.length)}
  var inst={title:'Level '+level,level:level,n:sp.n,G:SG,spots0:pos,K:K,par:K,sol:best.moves.slice(0,K).map(function(m){return{f:m.f,t:m.t,path:m.path}})};
  inst.p=level<4?1:pReach(inst,rng,12);return inst}
/* 1.2.1 (level-review fix). In Sprouts only the topology counts, so n bare seeds and a target K are the same puzzle every time (30 levels held 8 puzzles).
   Raw levels 31-44 start from a PART-GROWN garden: a few vines from a seeded random playout (random routes), so the shape decides the level. K is the most
   vines the generator's playouts reach from there (at least 3 still to draw), and careless play (random legal vines, shortest routes) must reach K in at most
   40% of 24 tries. trim6.js interleaves them with the 8 distinct bare-seed levels. */
var PRE={31:[2,1],32:[2,2],33:[2,1],34:[3,2],35:[3,3],36:[3,2],37:[3,3],38:[3,4],39:[4,2],40:[4,3],41:[4,3],42:[4,4],43:[4,4],44:[4,5]};
function makePre(level,rng){var cfg=PRE[level],n=cfg[0],m0=cfg[1],pos,st0,st,best,K,t,kk;
  for(t=0;t<60;t++){pos=SP_POS[n].map(function(p){return[p[0]+pzInt(rng,3)-1,p[1]+pzInt(rng,3)-1]});st0=spNew(pos);st=spPlay(spClone(st0),m0,rng);if(st.moves.length<m0)continue;
    best=spFind(st,3*n-1,rng,120);K=best.moves.length;if(K-m0<3)continue;
    var inst={title:'Level '+level,level:level,n:n,G:SG,spots0:pos,pre:st.moves.map(function(m){return{f:m.f,t:m.t,path:m.path}}),K:K,par:K-m0,
      sol:best.moves.slice(m0,K).map(function(m){return{f:m.f,t:m.t,path:m.path}})};
    var ok=0;for(kk=0;kk<24;kk++){var s2=spClone(st);spPlay(s2,K,rng);if(s2.moves.length>=K)ok++}inst.p=ok/24;if(inst.p>.4&&t<50)continue;return inst}
  return inst}
/* known lost: each vine costs one life overall (two used, one made), the last vine's new seed always keeps its life, and a seed with lives that has no legal
   vine now never gets one (no vine can ever be drawn in a region only it can reach). So at most (lives - stuck lives - 1) vines remain: if that cannot reach K,
   the level is lost, and the board says so at once (sound: it never says lost when K is still reachable). */
function maxLeft(st){var lm=spLegal(st),live={},T=0,dead=0;lm.forEach(function(m){live[m.f]=1;live[m.t]=1});st.spots.forEach(function(sp,i){if(sp.l>0){T+=sp.l;if(!live[i])dead+=sp.l}});return lm.length?Math.max(0,T-dead-1):0}
var CSS='.sp{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);--sp-bg1:#EAF3E3;--sp-bg2:#D2E5C8;--sp-vine:#2F7A3E;--sp-seed:#F2B705;--sp-seed2:#B07A00;--sp-dead:#7E8C74}'
+':root[data-theme="dark"] .sp{--sp-bg1:#16322D;--sp-bg2:#0C1D1B;--sp-vine:#8FE3A0;--sp-seed:#FFD43B;--sp-seed2:#FFB020;--sp-dead:#4B6A5E}'
+'.sp-board{position:relative;width:100%;aspect-ratio:1;border-radius:26px;overflow:hidden;background:radial-gradient(110% 100% at 30% 10%,var(--sp-bg1),var(--sp-bg2));box-shadow:inset 0 2px 0 rgba(255,255,255,.2),0 6px 18px rgba(10,40,20,.2);touch-action:none;user-select:none;-webkit-user-select:none}'
+'.sp-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}'
+'.sp-b{all:unset;position:absolute;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;cursor:pointer;-webkit-tap-highlight-color:transparent}.sp-b:focus-visible{outline:3px solid var(--ink);outline-offset:-4px}'
+'.sp-t{animation:spt 1s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes spt{50%{opacity:.35}}'
+'@media (prefers-reduced-motion:reduce){.sp-t{animation:none}}.zk-rm .sp-t{animation:none}';
function mount(root,inst,api){ZK.css(CSS,'spl-css');root.textContent='';var K=inst.K,rm=ZK.rm(api),st,hist=[],hints=0,undos=0,steps=0,sel=-1,hl=[],fin=false,drag=null,skip=false,ghost=null,idle=null,offs=[],btns=[],legal=[],lastEl=null,mark=[];
  var stage=document.createElement('div');stage.className='sp zk-stage zk-host'+(rm?' zk-rm':'');
  var board=document.createElement('div');board.className='sp-board zk-board';board.setAttribute('role','group');board.setAttribute('aria-label','Garden with seeds');
  var svg=sv('svg',{viewBox:'0 0 '+SG+' '+SG,'aria-hidden':'true',focusable:'false','class':'sp-svg'}),gl=sv('g',{}),gs=sv('g',{}),draft=sv('path',{fill:'none',stroke:'var(--sp-vine)','stroke-width':'.55','stroke-linecap':'round','stroke-linejoin':'round',opacity:.55,'stroke-dasharray':'.1 1.1'});
  svg.appendChild(gl);svg.appendChild(draft);svg.appendChild(gs);board.appendChild(svg);var pips=ZK.pips(K);stage.appendChild(board);stage.appendChild(pips.el);root.appendChild(stage);
  function rebuild(){st=spNew(inst.spots0);(inst.pre||[]).forEach(function(m){spApply(st,m.path,m.f,m.t)});hist.forEach(function(m){spApply(st,m.path,m.f,m.t)})}
  function cx(i){return i%SG+.5}function cy(i){return Math.floor(i/SG)+.5}
  function targetsOf(i){var o=[];legal.forEach(function(m){if(m.f===i)o.push(m.t);else if(m.t===i)o.push(m.f)});return o}
  function paint(animLast){gl.textContent='';gs.textContent='';btns.forEach(function(b){b.remove()});btns=[];legal=fin?[]:spLegal(st);
    var act=drag?drag.from:sel,tg=act>=0?targetsOf(act):[],lastLine=null,lastSeed=null;
    st.moves.forEach(function(m,k){var pts=spSmooth(m.path.map(function(i){return[cx(i),cy(i)]})),d='M'+pts.map(function(p){return r2(p[0])+' '+r2(p[1])}).join('L');
      gl.appendChild(sv('path',{d:d,fill:'none',stroke:'var(--sp-vine)','stroke-width':'1.5','stroke-linecap':'round','stroke-linejoin':'round',opacity:.28}));
      var p2=sv('path',{d:d,fill:'none',stroke:'var(--sp-vine)','stroke-width':'.62','stroke-linecap':'round','stroke-linejoin':'round'});gl.appendChild(p2);if(k===st.moves.length-1)lastLine=p2});
    st.spots.forEach(function(s,i){var x=s.c+.5,y=s.r+.5,g=sv('g',{});
      if(s.l<1){g.appendChild(sv('circle',{cx:x,cy:y,r:'.95',fill:'var(--sp-dead)'}));gs.appendChild(g);if(i===st.spots.length-1)lastSeed=g;return}
      var live=sv('circle',{cx:x,cy:y,r:'1.45',fill:'var(--sp-seed)',stroke:sel===i||(drag&&drag.from===i)?'#fff':'var(--sp-seed2)','stroke-width':sel===i?'.35':'.22'});g.appendChild(live);
      if(tg.indexOf(i)>=0)g.appendChild(sv('circle',{cx:x,cy:y,r:'2.3',fill:'none',stroke:'var(--sp-seed)','stroke-width':'.3',class:'sp-t'}));
      if(hl.indexOf(i)>=0)g.appendChild(sv('circle',{cx:x,cy:y,r:'2.5',fill:'none',stroke:'var(--ink)','stroke-width':'.3','stroke-dasharray':'.6 .5'}));
      for(var k=0;k<s.l;k++){var a=-Math.PI/2+k*(2*Math.PI/3)+Math.PI/3;g.appendChild(sv('circle',{cx:r2(x+.62*Math.cos(a)),cy:r2(y+.62*Math.sin(a)),r:'.26',fill:'var(--sp-seed2)'}))}
      gs.appendChild(g);if(i===st.spots.length-1)lastSeed=g;
      var b=document.createElement('button');b.type='button';b.className='sp-b zk-p';b.setAttribute('data-zkc','');b.style.left=(x/SG*100)+'%';b.style.top=(y/SG*100)+'%';b.dataset.spot=i;
      b.setAttribute('aria-label','Seed '+(i+1)+', '+s.l+' vine slot'+(s.l===1?'':'s')+' free'+(sel===i?', chosen':''));b.onclick=function(){onSpot(i)};btns.push(b);board.appendChild(b)});
    lastEl=lastSeed;pips.set(st.moves.length);
    if(animLast&&lastLine){ZK.anim(lastLine,[{opacity:0},{opacity:1}],300,ZK.EASE);if(lastSeed){lastSeed.style.transformBox='fill-box';lastSeed.style.transformOrigin='center';ZK.anim(lastSeed,[{transform:'scale(0)'},{transform:'scale(1.5)'},{transform:'scale(1)'}],420,ZK.SPRING,120)}}
    ZK.stuck(stage,false);if(!fin&&st.moves.length<K&&!legal.length)ZK.stuck(stage,true,{text:'No vines left to draw',onUndo:undo});
    else if(!fin&&st.moves.length+maxLeft(st)<K)ZK.stuck(stage,true,{text:K+' vines can’t grow now',onUndo:undo})}
  function commit(path,f,t){ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);spApply(st,path,f,t);hist.push({f:f,t:t,path:path});steps++;sel=-1;hl=[];api.moved();
    if(st.moves.length>=K)fin=true;paint(true);ZK.sfx('cap',{n:Math.min(8,st.moves.length-1)});ZK.buzz('pop');
    if(fin){setTimeout(function(){api.done({solved:true,moves:steps,hints:hints,undos:undos,extra:{par:inst.par,K:K}})},rm?0:360)}else api.say('Vine '+st.moves.length+' of '+K+'.')}
  function onSpot(i){if(fin||skip)return;var s=st.spots[i];if(s.l<1)return;
    if(sel<0){sel=i;paint();ZK.sfx('lift');ZK.buzz('tap');return}
    if(sel===i){if(s.l<2){ZK.wrong(btns.filter(function(b){return +b.dataset.spot===i})[0]);sel=-1;paint();return}var lp=spRoute(st,i,i,null);if(!lp){ZK.wrong(null);return}commit(lp,i,i);return}
    if(targetsOf(sel).indexOf(i)<0){ZK.wrong(btns.filter(function(b){return +b.dataset.spot===i})[0]);return}
    var p=spRoute(st,sel,i,null);if(!p){ZK.wrong(null);return}commit(p,sel,i)}
  function cellAt(e){var r=svg.getBoundingClientRect();if(!r.width)return-1;var c=Math.floor((e.clientX-r.left)/r.width*SG),rr=Math.floor((e.clientY-r.top)/r.height*SG);return(c<0||rr<0||c>=SG||rr>=SG)?-1:rr*SG+c}
  function spotAtCell(c){for(var i=0;i<st.spots.length;i++)if(spIdx(st.spots[i])===c)return i;return-1}
  /* when the straight step is blocked, route round the obstacle (empty cells only, never through your own draft) toward the finger's cell */
  function bfsAround(from,to,own){if(st.w[to]!==0||own.indexOf(to)>=0)return null;var prev={};prev[from]=-1;var q=[from],h=0,lim=0;
    while(h<q.length&&lim++<900){var x=q[h++];if(x===to){var p=[],y=x;while(y!==-1){p.push(y);y=prev[y]}return p.reverse()}
      var r=Math.floor(x/SG),c=x%SG;for(var d=0;d<4;d++){var rr=r+DR[d],cc=c+DC[d];if(rr<0||cc<0||rr>=SG||cc>=SG)continue;var y2=rr*SG+cc;if(prev[y2]!==undefined||st.w[y2]!==0||own.indexOf(y2)>=0)continue;prev[y2]=x;q.push(y2)}}
    return null}
  function dpath(){draft.setAttribute('d',drag&&drag.cells.length>1?'M'+drag.cells.map(function(i){return r2(cx(i))+' '+r2(cy(i))}).join('L'):'')}
  function L(t,ty,fn){t.addEventListener(ty,fn);offs.push(function(){t.removeEventListener(ty,fn)})}
  L(board,'pointerdown',function(e){if(fin)return;var b=e.target.closest&&e.target.closest('.sp-b');if(!b)return;var i=+b.dataset.spot;if(st.spots[i].l<1)return;
    drag={from:i,cells:[spIdx(st.spots[i])],end:-1,x0:e.clientX,y0:e.clientY,id:e.pointerId,moved:false}});
  L(document,'pointermove',function(e){if(!drag||e.pointerId!==drag.id)return;if(!drag.moved){if(Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<10)return;drag.moved=true;sel=-1;paint();ZK.sfx('lift')}
    var tc=cellAt(e);if(tc<0||drag.end>=0)return;var last=drag.cells[drag.cells.length-1],g=0;
    while(last!==tc&&g++<60){var lr=Math.floor(last/SG),lc=last%SG,tr=Math.floor(tc/SG),tcc=tc%SG,nr=lr,nc=lc;
      if(Math.abs(tr-lr)>=Math.abs(tcc-lc)&&tr!==lr)nr+=tr>lr?1:-1;else nc+=tcc>lc?1:-1;var nx=nr*SG+nc;
      if(st.w[nx]===0&&drag.cells.indexOf(nx)<0){drag.cells.push(nx);last=nx}
      else if(st.w[nx]===2){var si=spotAtCell(nx);if(si>=0&&st.spots[si].l>=1&&(si!==drag.from||drag.cells.length>=4)){drag.cells.push(nx);drag.end=si}break}
      else{var br=bfsAround(last,tc,drag.cells);if(br&&br.length>1){for(var q=1;q<br.length;q++)drag.cells.push(br[q]);last=br[br.length-1]}else break}}
    dpath()});
  function up(e){if(!drag||(e&&e.pointerId!==drag.id))return;var d=drag;drag=null;draft.setAttribute('d','');
    if(!d.moved)return;skip=true;setTimeout(function(){skip=false},60);
    var cells=d.cells.slice(),t=d.end,i;
    if(t<0){var lc=cells[cells.length-1];for(i=0;i<st.spots.length;i++){var s=st.spots[i];if(s.l>=1&&spAdjTo(lc,spIdx(s))&&(i!==d.from||cells.length>=4)){t=i;break}}if(t>=0)cells.push(spIdx(st.spots[t]))}
    var f=d.from,k=cells.length-2,s1=st.spots[f];
    if(t<0||k<1||cells.length<4||(f===t&&(s1.l<2||k<3))||!spAdjTo(cells[1],cells[0])||!spAdjTo(cells[k],cells[k+1])){ZK.wrong(null);ZK.anim(draft,[{opacity:.55},{opacity:0}],200);paint();return}
    commit(cells,f,t)}
  L(document,'pointerup',up);L(document,'pointercancel',up);
  rebuild();paint();
  if(inst.level===1){var s0=inst.sol[0];ghost=ZK.ghost(stage,[{drag:[btns[s0.f],btns[s0.t]],down:function(){sel=s0.f;paint()},up:function(){sel=-1;paint()},cancel:function(){if(!hist.length){sel=-1;paint()}}}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin||!hist.length)return false;hist.pop();undos++;sel=-1;hl=[];rebuild();paint();ZK.sfx('undo');ZK.buzz('tap');return true}
  function plan(){var ok=hist.length<=inst.sol.length&&hist.every(function(m,i){var s=inst.sol[i];return m.f===s.f&&m.t===s.t&&m.path.join()===s.path.join()});
    if(ok&&hist.length<K)return inst.sol.slice(hist.length,K);var r=spFind(st,K,pzRng('sp|'+hist.length+'|'+K),60);return r&&r.moves.length>=K?r.moves.slice(hist.length,K):null}
  return{undo:undo,
    restart:function(){if(fin)return;hist=[];sel=-1;hl=[];rebuild();ZK.unmark(stage);paint();ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;hints++;var p=plan();
      if(!p||!p.length){if(lv<3){ZK.mark(document.querySelector('.pz5 [data-undo]'));return 'I cannot see K vines from here. Undo a vine.'}if(hist.length){undo();return 'Took the last vine back.'}return 'Restart to begin again.'}
      var m=p[0];if(lv<=1){hl=[m.f];sel=-1;paint();return 'Start from the marked seed.'}
      if(lv===2){hl=m.f===m.t?[m.f]:[m.f,m.t];paint();return m.f===m.t?'Loop it back to itself.':'Join the two marked seeds.'}
      commit(m.path,m.f,m.t);return 'Drew it for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return lastEl},
    state:function(){return{lines:hist.length,fin:fin,sel:sel}}}}
ZK.override({id:ID,name:'Sprout Lines',family:'move',theme:'F9',calm:true,
  blurb:'Grow vines between seeds and keep the garden alive.',
  how:'Drag a vine between seeds, never crossing. Each vine sprouts a seed. Grow the target.',
  areas:['space','control'],levels:44,secs:100,make:make,mount:mount,
  stars:function(res,inst){var par=(inst&&inst.par)||res.moves,u=res.undos||0,h=res.hints||0,s=h?(u>4?1:2):(u>4?2:3);if(u>10)s=1;return{stars:s,line:'All '+inst.K+' vines grown.',winLine:'All '+inst.K+' vines grown'+(u?' · '+u+' undo'+(u===1?'':'s'):'')}}});
window.V6SP={maxLeft:maxLeft,make:make,makePre:makePre,spClone:spClone,spFind:spFind,make0:spMake0,spNew:spNew,spLegal:spLegal,spPlay:spPlay,spRoute:spRoute,spApply:spApply,pReach:pReach};
})();
