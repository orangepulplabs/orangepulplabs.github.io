/* Zest v6: Dodecahedron Tour. Overrides puzzles_c3.js 'dodecahedron-tour' (original kept in ZK.orig). The GEM puzzle of the trail trio.
   Visit every corner of a crystal once and come home. A bead hops corner to corner and leaves a rainbow thread; corners light up in the order you visit them.
   Graphs and the exact Hamilton search (PZC3.dt.complete) come from the original: cube, prisms, then the dodecahedron. Because the search is exact, a doomed
   route is flagged at once ("This loop can't finish") instead of ten moves later. */
(function(){
var ID='dodecahedron-tour',NS='http://www.w3.org/2000/svg';
function sv(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
var make=PZC3.dt.make;
var CSS='.dt{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);--dt-bg1:#E9E4FA;--dt-bg2:#D3CBF1;--dt-edge:rgba(90,70,170,.42);--dt-gem:#fff;--dt-ring:#6A55C9}'
+':root[data-theme="dark"] .dt{--dt-bg1:#2A2250;--dt-bg2:#171230;--dt-edge:rgba(190,175,255,.38);--dt-gem:#20193F;--dt-ring:#B9A9FF}'
+'.dt-board{position:relative;width:100%;border-radius:26px;overflow:hidden;background:radial-gradient(110% 90% at 30% 10%,var(--dt-bg1),var(--dt-bg2));box-shadow:inset 0 2px 0 rgba(255,255,255,.25),0 6px 18px rgba(40,25,90,.22);touch-action:none;user-select:none;-webkit-user-select:none}'
+'.dt-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}'
+'.dt-v{all:unset;position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;pointer-events:none}.dt-v:focus-visible{outline:3px solid var(--ink);outline-offset:-4px}'
+'.dt-pulse{animation:dtp 1.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes dtp{50%{opacity:.35}}'
+'@media (prefers-reduced-motion:reduce){.dt-pulse{animation:none}}.zk-rm .dt-pulse{animation:none}';
var GEM='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9l3-4h8l3 4-7 11z" fill="#9B7BFF" stroke="#4B2FB0" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 9h14M9 9l3 11 3-11" fill="none" stroke="#fff" stroke-width="1.2" opacity=".75"/></svg>';
function hue(i,n){return 'hsl('+Math.round(i/Math.max(1,n)*300+10)+',85%,58%)'}

function mount(root,inst,api){ZK.css(CSS,'dt-css');root.textContent='';var D=PZC3.dt;
  var n=inst.n,E=inst.edges,pos=inst.pos,H=inst.H,adj=D.adj(n,E),rm=ZK.rm(api),path=inst.start>=0?[inst.start]:[],closed=false,fin=false,hints=0,undos=0,steps=0,hl=-1,ghost=null,idle=null,offs=[],drag=null,swallow=false,last=null,lostT=null;
  var stage=document.createElement('div');stage.className='dt zk-stage zk-host'+(rm?' zk-rm':'');
  var ctr=ZK.counter({icon:GEM,label:function(k){return k+' corners to visit'}});
  var board=document.createElement('div');board.className='dt-board zk-board';board.style.aspectRatio='100 / '+H;board.setAttribute('role','group');board.setAttribute('aria-label','A '+inst.shape+' with '+n+' corners');
  var svg=sv('svg',{viewBox:'0 0 100 '+H,'aria-hidden':'true',focusable:'false','class':'dt-svg'});board.appendChild(svg);
  var gEdges=sv('g',{}),gTrail=sv('g',{}),gV=sv('g',{}),bead=sv('circle',{r:'2.2',fill:'#fff',stroke:'var(--dt-ring)','stroke-width':'.7',opacity:0});
  E.forEach(function(e){gEdges.appendChild(sv('line',{x1:pos[e[0]][0],y1:pos[e[0]][1],x2:pos[e[1]][0],y2:pos[e[1]][1],stroke:'var(--dt-edge)','stroke-width':'.7','stroke-linecap':'round'}))});
  svg.appendChild(gEdges);svg.appendChild(gTrail);svg.appendChild(gV);svg.appendChild(bead);
  var vs=[],btn=[],i;
  for(i=0;i<n;i++)(function(i){var g=sv('g',{}),halo=sv('circle',{cx:pos[i][0],cy:pos[i][1],r:'5.6',fill:'none',stroke:'var(--dt-ring)','stroke-width':'.8',opacity:0}),c=sv('circle',{cx:pos[i][0],cy:pos[i][1],r:'3.4',fill:'var(--dt-gem)',stroke:'var(--dt-ring)','stroke-width':'.7'}),
    sh=sv('circle',{cx:pos[i][0]-1,cy:pos[i][1]-1.1,r:'1',fill:'#fff',opacity:.55});[halo,c,sh].forEach(function(x){g.appendChild(x)});gV.appendChild(g);vs.push({g:g,c:c,halo:halo});
    var b=document.createElement('button');b.type='button';b.className='dt-v';b.setAttribute('data-zkc','');b.style.left=pos[i][0]+'%';b.style.top=(pos[i][1]/H*100)+'%';b.setAttribute('aria-label','Corner '+(i+1));
    b.onclick=function(){if(swallow)return;tap(i)};btn.push(b);board.appendChild(b)})(i);
  var pips=ZK.pips(n);stage.appendChild(ctr.el);stage.appendChild(board);stage.appendChild(pips.el);root.appendChild(stage);
  function paint(){gTrail.textContent='';var cur=path.length?path[path.length-1]:-1,q;
    for(q=1;q<path.length+(closed?1:0);q++){var a=path[q-1],b=path[q%path.length],col=hue(q-1,n);
      gTrail.appendChild(sv('line',{x1:pos[a][0],y1:pos[a][1],x2:pos[b][0],y2:pos[b][1],stroke:col,'stroke-width':'3.4','stroke-linecap':'round',opacity:.35}));
      gTrail.appendChild(sv('line',{x1:pos[a][0],y1:pos[a][1],x2:pos[b][0],y2:pos[b][1],stroke:col,'stroke-width':'1.5','stroke-linecap':'round'}))}
    for(i=0;i<n;i++){var s=path.indexOf(i),c=vs[i].c;
      if(s>=0){c.setAttribute('fill',hue(s,n));c.setAttribute('stroke','#fff')}else{c.setAttribute('fill','var(--dt-gem)');c.setAttribute('stroke','var(--dt-ring)')}
      var home=path.length===n&&!closed&&i===path[0]&&adj[cur].indexOf(i)>=0,isHl=hl===i;
      vs[i].halo.setAttribute('opacity',(i===cur&&!closed)||home||isHl?1:0);vs[i].halo.setAttribute('class',(home||isHl)?'dt-pulse':'');vs[i].halo.setAttribute('stroke',isHl?'#E9A23B':'var(--dt-ring)');
      btn[i].setAttribute('aria-label','Corner '+(i+1)+(s>=0?', step '+(s+1):', not visited')+(i===cur?', you are here':'')+(path.length&&path[0]===i?', the start':''))}
    ctr.set(n-path.length,true);pips.set(Math.max(0,path.length-1+(closed?1:0)))}
  function xy(e){var r=board.getBoundingClientRect();return[(e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*H]}
  function nearest(P,maxPx){var r=board.getBoundingClientRect(),best=-1,bd=1e9;for(var v=0;v<n;v++){var d=Math.hypot(P[0]-pos[v][0],P[1]-pos[v][1])*r.width/100;if(d<bd){bd=d;best=v}}return bd<=maxPx?best:-1}
  function check(){clearTimeout(lostT);ZK.stuck(stage,false);if(fin||path.length<2)return;
    lostT=setTimeout(function(){if(fin)return;if(!D.complete(adj,n,path)){ZK.stuck(stage,true,{text:'This loop can’t finish',onUndo:undo});api.say('This route cannot be finished. Undo a few steps.')}},rm?0:200)}
  function hop(from,to,closing){var a=pos[from],b=pos[to];ZK.unmark(stage);
    if(!rm){bead.setAttribute('opacity',1);var an=bead.animate([{transform:'translate('+a[0]+'px,'+a[1]+'px) scale(1.4)'},{transform:'translate('+b[0]+'px,'+b[1]+'px) scale(1)'}],{duration:240,easing:'cubic-bezier(.3,.7,.4,1)',fill:'forwards'});an.onfinish=function(){bead.setAttribute('opacity',0)};
      var g=vs[to].g;try{g.animate([{transform:'scale(1)'},{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:320,delay:200,easing:ZK.SPRING})}catch(e){}}}
  function step(v){ZK.ghostDone(ID);if(ghost)ghost.stop();hl=-1;var from=path.length?path[path.length-1]:-1;
    path.push(v);last=btn[v];if(from>=0){steps++;api.moved()}   /* choosing the start corner is free: par n counts the n hops of the cycle */
    if(from>=0)hop(from,v);ZK.sfx('cap',{n:Math.min(9,(path.length-1)%10)});ZK.buzz('tap');paint();
    if(path.length===n)api.say('All corners visited. Return to the start.');else api.say('Step '+path.length+' of '+n+'.');check()}
  function close(){var cur=path[path.length-1];hop(cur,path[0]);closed=true;steps++;fin=true;last=btn[path[0]];api.moved();ZK.stuck(stage,false);paint();ZK.sfx('cap',{n:9});
    setTimeout(function(){api.done({solved:true,moves:steps,hints:hints,undos:undos,extra:{par:n,n:n}})},rm?0:300)}
  function tap(v){if(fin)return;
    if(!path.length){step(v);return}
    var cur=path[path.length-1];if(v===cur)return;
    if(path.length===n&&v===path[0]){if(adj[cur].indexOf(v)>=0)close();else ZK.wrong(btn[v]);return}
    if(adj[cur].indexOf(v)<0||path.indexOf(v)>=0){ZK.wrong(btn[v]);vs[v].g.animate&&!rm&&vs[v].g.animate([{transform:'translateX(-1px)'},{transform:'translateX(1px)'},{transform:'none'}],{duration:200});
      adj[cur].forEach(function(w){if(path.indexOf(w)<0)ZK.anim(vs[w].g,[{opacity:1},{opacity:.4},{opacity:1}],360)});return}
    step(v)}
  function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  /* hit-testing by nearest corner (corners on the dodecahedron are closer than 48 px): tap anywhere near; or press the bead's corner and drag to a neighbour */
  L(board,'pointerdown',function(e){if(fin)return;var v=nearest(xy(e),30);if(v<0)return;
    if(path.length&&v===path[path.length-1])drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,moved:false};else drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,moved:false,tapV:v}});
  L(document,'pointermove',function(e){if(!drag||e.pointerId!==drag.id||fin)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<10)return;if(drag.tapV!==undefined)return;drag.moved=true;
    var v=nearest(xy(e),15),cur=path[path.length-1];if(v>=0&&v!==cur&&adj[cur].indexOf(v)>=0&&path.indexOf(v)<0){step(v)}else if(v>=0&&path.length===n&&v===path[0]&&adj[cur].indexOf(v)>=0){close()}});
  function end(e){if(!drag||(e&&e.pointerId!==drag.id))return;var d=drag;drag=null;
    if(d.moved){swallow=true;setTimeout(function(){swallow=false},60);return}
    if(d.tapV!==undefined&&!(e&&Math.hypot(e.clientX-d.x0,e.clientY-d.y0)>12)){swallow=true;setTimeout(function(){swallow=false},60);tap(d.tapV)}
    else if(d.tapV===undefined&&path.length&&!(e&&Math.hypot(e.clientX-d.x0,e.clientY-d.y0)>12)){}}
  L(document,'pointerup',end);L(document,'pointercancel',end);
  paint();
  if(inst.level===1){var cy=D.complete(adj,n,[0]);ghost=ZK.ghost(stage,[{tap:btn[cy[0]]},{tap:btn[cy[1]]},{tap:btn[cy[2]]}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin||path.length<=(inst.start>=0?1:0))return false;path.pop();if(path.length)steps=Math.max(0,steps-1);undos++;hl=-1;ZK.unmark(stage);paint();ZK.sfx('undo');ZK.buzz('tap');check();return true}
  function back(){var k=path.length;while(k>0&&!D.complete(adj,n,path.slice(0,k)))k--;return k}
  return{undo:undo,
    restart:function(){if(fin)return;path=inst.start>=0?[inst.start]:[];steps=0;hl=-1;ZK.unmark(stage);ZK.stuck(stage,false);clearTimeout(lostT);paint();ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;hints++;var nx;
      if(!path.length){nx=D.complete(adj,n,[0])[0];hl=nx;paint();if(lv>=3){hl=-1;tap(nx);return 'Started for you.'}return 'Any corner works. Try the marked one.'}
      var comp=D.complete(adj,n,path);
      if(!comp){var k=Math.max(back(),inst.start>=0?1:0),d=path.length-k;
        if(lv<3){hl=k?path[k-1]:-1;paint();return lv<=1?'This loop can’t be finished. Step back.':'Step back to the marked corner.'}
        path=path.slice(0,k);steps=k;undos++;hl=-1;ZK.stuck(stage,false);paint();return 'Stepped back '+d+'.'}
      nx=path.length<n?comp[path.length]:path[0];
      if(lv<=1){hl=nx;paint();return 'The marked corner can come next.'}
      if(lv===2){hl=nx;paint();return 'Go to the marked corner.'}
      tap(nx);return 'Moved for you.'},
    destroy:function(){clearTimeout(lostT);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{path:path.slice(),fin:fin}}}}
ZK.override({id:ID,name:'Dodecahedron Tour',family:'move',theme:'F7',calm:true,
  blurb:'Light every corner of a crystal once and return home.',
  how:'Hop from corner to corner. Light them all once, then go home.',
  areas:['space','flex'],levels:30,secs:120,make:make,mount:mount,
  stars:function(res,inst){var par=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0,s=pzStarsByPar(m,par,h),u=res.undos||0;if(u>3&&s>2)s=2;
    return{stars:s,line:'A loop through all '+par+' corners.'}}});
})();
