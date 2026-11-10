/* Zest v6: Four Shades. Overrides puzzles_d7.js 'four-shades' (original kept in ZK.orig). Same Voronoi map generator, solver and par (PZD7.fs).
   Pick a colour once from the palette bar (it stays selected), then tap regions to fill them (one tap per region, no region-then-colour double step).
   Two neighbours with the same colour flash amber ALONG THEIR SHARED BORDER. Letters + patterns keep it colour-blind safe; fixed regions wear a lock ring.
   The exact solver flags a doomed colouring at once ("These colours can't all fit") instead of at the end. */
(function(){
var ID='four-shades',NS='http://www.w3.org/2000/svg',COL=['#f4c95d','#7fb8ea','#9ad99a','#e8a0d8'],LET='ABCD',PN=['solid','stripes','dots','cross-hatch'],UID=0;
function sv(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
/* 1.2.1 (level-review fix): a map sudoku. The original locked a fixed share of regions, which left 30 to 200+ valid colourings: no deduction.
   Now: the same Voronoi maps (PZD7.fs.vor / adjOf / solve, same short-border rejection), at most 22 regions, and the locks are chosen so the colouring
   is FORCED: propagation alone (a region with one colour left takes it) colours the whole map from the locks, which also makes it unique. Locks are added
   at the most constrained open region until propagation finishes, then every lock that is not needed is dropped again. */
function fsSites(n,W,H,rng){var S=[],tries=0,minD=Math.max(13,17-n*.15);while(S.length<n&&tries<4000){tries++;var p=[4+rng()*(W-8),4+rng()*(H-8)];if(S.every(function(q){return Math.hypot(q[0]-p[0],q[1]-p[1])>=minD}))S.push(p)}return S}
function prop(adj,locks){var n=adj.length,c=locks.slice(),ch=true,i;while(ch){ch=false;for(i=0;i<n;i++)if(c[i]<0){var m=15;adj[i].forEach(function(j){if(c[j]>=0)m&=~(1<<c[j])});if(!m)return null;if((m&(m-1))===0){c[i]=Math.round(Math.log2(m));ch=true}}}return c}
/* one step deeper: if giving an open region one of its colours makes propagation fail, it takes another (a 'what if' the player can see on the map) */
function prop2(adj,locks){var c=prop(adj,locks),n=adj.length,ch=true,used=false;if(!c)return null;while(ch){ch=false;if(c.every(function(x){return x>=0}))break;
    for(var i=0;i<n&&!ch;i++)if(c[i]<0){var m=15;adj[i].forEach(function(j){if(c[j]>=0)m&=~(1<<c[j])});var ok=[];for(var v=0;v<4;v++)if(m>>v&1){var t=c.slice();t[i]=v;if(prop(adj,t))ok.push(v)}
      if(!ok.length)return null;if(ok.length===1){var t2=c.slice();t2[i]=ok[0];c=prop(adj,t2);ch=true;used=true}}}
  if(!c.every(function(x){return x>=0}))return null;c.deep=used;return c}
var DEEP=12;   /* from this level the locks are thinned while prop2 still colours the map, and the map must need its 'what if' step */
function count(adj,locks,cap){var n=adj.length,c=locks.slice(),N=0;function rec(){if(N>=cap)return;var b=-1,bm=0,bc=9,i;for(i=0;i<n;i++)if(c[i]<0){var m=15;adj[i].forEach(function(j){if(c[j]>=0)m&=~(1<<c[j])});var k=0;for(var v=0;v<4;v++)if(m>>v&1)k++;if(!k)return;if(k<bc){bc=k;b=i;bm=m}}
  if(b<0){N++;return}for(var v=0;v<4;v++)if(bm>>v&1){c[b]=v;rec();c[b]=-1}}rec();return N}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var r=null;for(var k=0;k<40;k++){r=make1(level,rng);if(level<DEEP||r.deep)break}return r}
function make1(level,rng){var F=PZD7.fs,n=Math.min(22,12+Math.round((level-1)*10/29)),W=100,H=140,S,P,t,i,adj;
  for(t=0;t<60;t++){S=fsSites(n,W,H,rng);if(S.length<n)continue;P=F.vor(S,W,H);if(JSON.stringify(F.adjOf(S,P,.01))===JSON.stringify(F.adjOf(S,P,1.2)))break}
  adj=F.adjOf(S,P,1.2);var sol=F.solve(adj,S.map(function(){return-1}),rng),locks=S.map(function(){return-1});
  for(var g=0;g<n;g++){var c=prop(adj,locks);if(c&&c.every(function(x){return x>=0}))break;var best=-1,bk=9,bd=-1;
    for(i=0;i<n;i++)if((c?c[i]:locks[i])<0){var m=15;adj[i].forEach(function(j){var cj=c?c[j]:locks[j];if(cj>=0)m&=~(1<<cj)});var k=0;for(var v=0;v<4;v++)if(m>>v&1)k++;var dg=adj[i].length+rng();if(k<bk||(k===bk&&dg>bd)){bk=k;bd=dg;best=i}}
    locks[best]=sol[best]}
  var P2=level>=DEEP?prop2:prop;pzShuffle(S.map(function(_,i){return i}),rng).forEach(function(i){if(locks[i]<0)return;var v=locks[i];locks[i]=-1;var c=P2(adj,locks);if(!(c&&c.every(function(x){return x>=0})))locks[i]=v});
  var full=P2(adj,locks),deep=!!(full&&full.deep)&&!(prop(adj,locks)||[]).every(function(x){return x>=0});nl=locks.filter(function(x){return x>=0}).length;
  return{title:'Level '+level,level:level,n:n,W:W,H:H,seeds:S.map(function(s){return[Math.round(s[0]*10)/10,Math.round(s[1]*10)/10]}),polys:P.map(function(p){return p.map(function(q){return[Math.round(q[0]*100)/100,Math.round(q[1]*100)/100]})}),adj:adj,locked:locks,sol:full.slice(),par:n-nl,locks:nl,deep:deep}}
window.V6FS={make:make,prop:prop,prop2:prop2,count:count,DEEP:DEEP};
var CSS='.fs{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:var(--font)}'
+'.fs-map{position:relative;width:100%;border-radius:22px;overflow:hidden;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--line,#ddd),0 6px 18px rgba(0,0,0,.1);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.fs-svg{position:absolute;inset:0;width:100%;height:100%}'
+'.fs-n{all:unset;position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;pointer-events:none;display:flex;align-items:center;justify-content:center;font:800 .85rem var(--font);color:#2b2b2b}.fs-n:focus-visible{outline:3px solid var(--ink)}'
+'.fs-pal{display:flex;gap:10px;justify-content:center;width:100%}'
+'.fs-sw{all:unset;box-sizing:border-box;position:relative;width:64px;height:60px;border-radius:18px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--edge,#999);font:800 .8rem var(--font);color:var(--ink);transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s;-webkit-tap-highlight-color:transparent}'
+'.fs-sw svg{width:30px;height:30px}.fs-sw.on{transform:translateY(-6px);box-shadow:0 0 0 3.5px var(--ink),0 8px 14px rgba(0,0,0,.2)}.fs-sw:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'@media (prefers-reduced-motion:reduce){.fs-sw{transition:none}}.zk-rm .fs-sw{transition:none}';
var LOCK='<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><rect x="2" y="5.5" width="8" height="5.5" rx="1.4" fill="#2b2b2b"/><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="#2b2b2b" stroke-width="1.4"/></svg>';

function mount(root,inst,api){ZK.css(CSS,'fs-css');root.textContent='';var n=inst.n,W=inst.W,H=inst.H,adj=inst.adj,lock=inst.locked,rm=ZK.rm(api),col=lock.slice(),hist=[],steps=0,hints=0,undos=0,cur=0,fin=false,hl=-1,lastI=-1,ghost=null,idle=null,offs=[],pid='fs'+(++UID),i,k;
  var stage=document.createElement('div');stage.className='fs zk-stage zk-host'+(rm?' zk-rm':'');
  var ctr=ZK.counter({icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c4 4.5 6 7.5 6 10.5a6 6 0 0 1-12 0C6 10.5 8 7.5 12 3z" fill="#7fb8ea" stroke="#2b2b2b" stroke-width="1.8"/></svg>',label:function(x){return x+' regions to colour'}});
  var map=document.createElement('div');map.className='fs-map zk-board';map.style.aspectRatio=W+' / '+H;map.setAttribute('role','group');map.setAttribute('aria-label','Map with '+n+' regions');
  var svg=sv('svg',{viewBox:'0 0 '+W+' '+H,preserveAspectRatio:'none','aria-hidden':'true',focusable:'false','class':'fs-svg'}),defs=sv('defs',{});svg.appendChild(defs);
  for(k=0;k<4;k++){var pt=sv('pattern',{id:pid+k,width:'4',height:'4',patternUnits:'userSpaceOnUse'});pt.appendChild(sv('rect',{width:'4',height:'4',fill:COL[k]}));
    if(k===1)pt.appendChild(sv('rect',{x:'0',y:'0',width:'1.5',height:'4',fill:'#2b2b2b',opacity:.75}));if(k===2)pt.appendChild(sv('circle',{cx:'2',cy:'2',r:'.95',fill:'#2b2b2b',opacity:.75}));
    if(k===3)pt.appendChild(sv('path',{d:'M0 0L4 4M4 0L0 4',stroke:'#2b2b2b','stroke-width':'.7',fill:'none',opacity:.75}));defs.appendChild(pt)}
  var base=[],fill=[],gB=sv('g',{}),gF=sv('g',{}),gE=sv('g',{}),gL=sv('g',{});
  for(i=0;i<n;i++){var d='M'+inst.polys[i].map(function(p){return p[0]+' '+p[1]}).join('L')+'Z';
    var b=sv('path',{d:d,fill:'var(--surface,#fff)',stroke:'none'}),f=sv('path',{d:d,fill:'none',stroke:'none'});b.style.cursor='pointer';b.setAttribute('data-r',i);f.setAttribute('pointer-events','none');base.push(b);fill.push(f);gB.appendChild(b);gF.appendChild(f)}
  inst.polys.forEach(function(p,i){gL.appendChild(sv('path',{d:'M'+p.map(function(q){return q[0]+' '+q[1]}).join('L')+'Z',fill:'none',stroke:'var(--ink,#222)','stroke-width':'.55','stroke-linejoin':'round','pointer-events':'none'}))});
  svg.appendChild(gB);svg.appendChild(gF);svg.appendChild(gL);svg.appendChild(gE);map.appendChild(svg);
  var nodes=[];for(i=0;i<n;i++)(function(i){var b=document.createElement('button');b.type='button';b.className='fs-n';b.setAttribute('data-zkc','');b.style.left=(inst.seeds[i][0]/W*100)+'%';b.style.top=(inst.seeds[i][1]/H*100)+'%';
    b.onclick=function(){tapR(i)};nodes.push(b);map.appendChild(b)})(i);
  var pal=document.createElement('div');pal.className='fs-pal';pal.setAttribute('role','group');pal.setAttribute('aria-label','Colours');var sws=[];
  for(k=0;k<4;k++)(function(k){var b=document.createElement('button');b.type='button';b.className='fs-sw';b.setAttribute('aria-label','Colour '+LET[k]+', '+PN[k]);
    b.innerHTML='<svg viewBox="0 0 26 26" aria-hidden="true"><rect x="1" y="1" width="24" height="24" rx="5" fill="url(#'+pid+k+')" stroke="#2b2b2b" stroke-width="2"/></svg><span>'+LET[k]+'</span>';
    b.onclick=function(){pick(k)};sws.push(b);pal.appendChild(b)})(k);
  var er=document.createElement('button');er.type='button';er.className='fs-sw';er.setAttribute('aria-label','Eraser');er.innerHTML='<svg viewBox="0 0 26 26" aria-hidden="true"><rect x="1" y="1" width="24" height="24" rx="5" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"/><path d="M8 8l10 10M18 8L8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Clear</span>';er.onclick=function(){pick(-1)};sws.push(er);pal.appendChild(er);
  stage.appendChild(ctr.el);stage.appendChild(map);stage.appendChild(pal);root.appendChild(stage);
  /* the shared border of two regions: the polygon-i vertices that lie on the bisector with j */
  function shared(a,b){var A=inst.seeds[a],B=inst.seeds[b],dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy),c=(B[0]*B[0]+B[1]*B[1]-A[0]*A[0]-A[1]*A[1])/2,pts=inst.polys[a].filter(function(p){return Math.abs((p[0]*dx+p[1]*dy-c)/L)<1e-3});
    if(pts.length<2)return null;var best=null,bd=-1;pts.forEach(function(p){pts.forEach(function(q){var d=Math.hypot(p[0]-q[0],p[1]-q[1]);if(d>bd){bd=d;best=[p,q]}})});return best}
  function clashes(){var c=[];for(var a=0;a<n;a++)if(col[a]>=0)adj[a].forEach(function(b){if(b>a&&col[b]===col[a])c.push([a,b])});return c}
  function dom(i){var m=[1,1,1,1];adj[i].forEach(function(j){if(col[j]>=0)m[col[j]]=0});var o=[];m.forEach(function(v,x){if(v)o.push(x)});return o}
  var edgeCache={};
  function paint(){var cl=clashes(),left=0,bad={};gE.textContent='';
    cl.forEach(function(p){bad[p[0]]=1;bad[p[1]]=1;var key=p[0]+','+p[1],e=edgeCache[key]||(edgeCache[key]=shared(p[0],p[1]));if(e){var ln=sv('line',{x1:e[0][0],y1:e[0][1],x2:e[1][0],y2:e[1][1],stroke:'#E9A23B','stroke-width':'2.4','stroke-linecap':'round','pointer-events':'none'});gE.appendChild(ln);ZK.anim(ln,[{opacity:.2},{opacity:1}],360,'ease-in-out')}});
    for(var a=0;a<n;a++){if(col[a]<0)left++;fill[a].setAttribute('fill',col[a]<0?'none':'url(#'+pid+col[a]+')');
      nodes[a].innerHTML=(lock[a]>=0?LOCK:'')+(col[a]>=0?'<span aria-hidden="true">'+LET[col[a]]+'</span>':'');nodes[a].style.background=hl===a?'rgba(255,255,255,.7)':'transparent';nodes[a].style.boxShadow=hl===a?'0 0 0 3px #E9A23B':'none';
      nodes[a].setAttribute('aria-label','Region '+(a+1)+', '+(col[a]>=0?'colour '+LET[col[a]]+' '+PN[col[a]]:'not coloured')+(lock[a]>=0?', fixed':'')+(bad[a]?', clashes with a neighbour':''))}
    sws.forEach(function(b,q){b.classList.toggle('on',(q===4?cur===-1:q===cur))});ctr.set(left,true);
    ZK.stuck(stage,false);if(!cl.length&&left&&!fin&&!PZD7.fs.solve(adj,col,null))ZK.stuck(stage,true,{kind:'dead',text:'These colours can’t all fit',onUndo:undo})}
  function pick(c){cur=c;ZK.sfx('press');ZK.buzz('tap');paint()}
  function tapR(i){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);hl=-1;
    if(lock[i]>=0){ZK.wrong(nodes[i]);return}
    if(col[i]===cur)return;
    hist.push([i,col[i]]);col[i]=cur;lastI=i;steps++;api.moved();paint();
    if(cur>=0){var f=fill[i];f.style.transformBox='view-box';f.style.transformOrigin=inst.seeds[i][0]+'px '+inst.seeds[i][1]+'px';ZK.anim(f,[{transform:'scale(.55)',opacity:.2},{transform:'scale(1.04)',opacity:1,offset:.7},{transform:'scale(1)',opacity:1}],320,ZK.SPRING);
      ZK.sfx('click',{p:cur*2});ZK.buzz('tap');
      if(clashes().some(function(p){return p[0]===i||p[1]===i})){ZK.sfx('soft')}}
    else{ZK.sfx('undo')}
    var cl=clashes(),done=col.every(function(c){return c>=0});
    if(done&&!cl.length){fin=true;ZK.stuck(stage,false);setTimeout(function(){api.done({solved:true,moves:steps,hints:hints,undos:0,extra:{par:inst.par,n:n}})},rm?0:260)}}
  function L(t,ty,fn){t.addEventListener(ty,fn);offs.push(function(){t.removeEventListener(ty,fn)})}
  L(svg,'click',function(e){var r=e.target.getAttribute&&e.target.getAttribute('data-r');if(r!==null&&r!==undefined)tapR(+r)});
  paint();
  if(inst.level===1){var sol=PZD7.fs.solve(adj,col,null),free=[];for(i=0;i<n;i++)if(col[i]<0)free.push(i);var bi=free.sort(function(a,b){return dom(a).length-dom(b).length})[0];
    if(bi!==undefined&&sol){ghost=ZK.ghost(stage,[{tap:sws[sol[bi]],up:function(){}},{tap:nodes[bi]}],{id:ID,level:1});cur=sol[bi];paint()}}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin||!hist.length)return false;var u=hist.pop();col[u[0]]=u[1];steps=Math.max(0,steps-1);undos++;hl=-1;paint();ZK.sfx('undo');ZK.buzz('tap');return true}
  return{undo:undo,
    restart:function(){if(fin)return;col=lock.slice();hist=[];steps=0;hl=-1;ZK.unmark(stage);paint();ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;hints++;ZK.unmark(stage);var cl=clashes(),sol;
      if(cl.length){var p=cl[0],i=p[0];if(lock[i]>=0)i=p[1];hl=i;if(lv<3){paint();return lv<=1?'Two touching regions match.':'The marked region matches a neighbour.'}hist.push([i,col[i]]);col[i]=-1;steps++;hl=-1;paint();return 'Cleared the clash.'}
      sol=PZD7.fs.solve(adj,col,null);
      if(!sol){if(lv<3){ZK.mark(document.querySelector('.pz5 [data-undo]'));return 'These colours cannot all fit. Undo a colour.'}if(hist.length){undo();undos--;return 'Took the last colour back.'}return 'Restart to begin again.'}
      var best=-1,bc=9;for(var q=0;q<n;q++)if(col[q]<0){var dd=dom(q).length;if(dd<bc){bc=dd;best=q}}if(best<0)return null;
      if(lv<=1){hl=best;paint();return 'This region has few colours left.'}
      if(lv===2){hl=best;paint();return 'It can be '+dom(best).map(function(x){return LET[x]}).join(' or ')+'.'}
      cur=sol[best];paint();tapR(best);return 'Coloured it for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    moves:function(){return steps},   /* 1.2.4: the count the header, the Reel chip and the win card all show */
    lastEl:function(){return lastI>=0?nodes[lastI]:null},
    state:function(){return{col:col.slice(),fin:fin}}}}
ZK.override({id:ID,name:'Four Shades',family:'grid',theme:'F8',calm:true,
  blurb:'Colour the map so touching regions never match.',
  how:'Pick a colour, tap regions. Touching regions must differ.',
  areas:['space','flex'],levels:30,secs:110,make:make,mount:mount,
  stars:function(res,inst){var par=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;return{stars:pzStarsByPar(m,par,h),line:m+' tap'+(m===1?'':'s')+(m<=par?', one per region.':'. One per region is '+par+'.')}}});
})();
