/* Zest puzzles, wave 3 builder 4: Temple Circles, Mirror Lattice, Block Match, Silhouette Match (all theme F8).
   Loaded after puzzles_kit.js. make(level,rng) is pure (no Math.random, no DOM). Generators are exposed on PZE4 for tests/pze4_logic.js.
   Everything is drawn as SVG/DOM built in code. Wording is about the puzzle only. No audio.
   inst fields: temple-circles {W,H,fixed:[{x,y,r}],circles:[{r,cons,sols}],par}; mirror-lattice {N,sym,k,grid,miss,par};
   block-match {N,pool,grid,par}; silhouette-match {rounds:[{target,opts:[{v,rot,flip}],answer}],par} (undo:false, Hint + Try again). */
var PZE4={};
(function(){
var CSS='.pe{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.pe *{box-sizing:border-box}'
+'.pe-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.pe-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.pe-prog{margin:0;font-weight:700;font-size:1rem;text-align:center}'
+'.pe-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.pe-btn{min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}'
+'.pe-btn:disabled{background:var(--dis-bg);color:var(--dis-ink);border-color:var(--dis-bg);cursor:default}'
+'.pe-btn[aria-pressed=true],.pe-btn.pe-sel{border-width:4px;border-color:var(--ink);background:var(--tint)}'
+'.pe-btn.pe-hint{outline:3px dashed var(--ink);outline-offset:2px}'
+'.pe-btn small{font:700 .75rem/1.1 var(--font);color:var(--muted)}'
+'.pe-btn svg{width:32px;height:32px;display:block;flex:none}'
+'.pe-board{width:100%;touch-action:none;display:block}'
+'.pe-st{margin:0;padding:0;list-style:none;font-size:.9375rem;line-height:1.5;width:100%}'
+'.pe-st li{padding:2px 0}'
+'.pe-bg{fill:var(--surface);stroke:var(--ink)}.pe-gl{stroke:var(--edge);opacity:.4;fill:none}'
+'.pe-fx{fill:var(--tint);stroke:var(--ink)}.pe-pl{fill:var(--accent);stroke:var(--ink)}.pe-pt{fill:var(--on-accent);font-weight:800;text-anchor:middle;font-family:var(--font)}.pe-tx{fill:var(--ink);font-weight:800;text-anchor:middle;font-family:var(--font)}'
+'.pe-ac{fill:none;stroke:var(--ink);stroke-dasharray:.5 .35}.pe-mk{fill:var(--ink);stroke:var(--surface);stroke-width:.08}'
+'.pe-ink{fill:var(--ink);stroke:none}.pe-ln{fill:none;stroke:var(--ink)}.pe-ax{stroke:var(--muted);stroke-dasharray:1.5 1.5;fill:none}'
+'.pe-cell{fill:var(--surface);stroke:var(--edge)}.pe-miss{fill:var(--tint);stroke:var(--ink);stroke-dasharray:1 1}.pe-sl{fill:none;stroke:var(--ink)}'
+'.pe-grid{display:grid;gap:6px;justify-content:center}'
+'.pe-gc{width:56px;height:56px;min-width:48px;min-height:48px;padding:0;border:2px solid var(--ink);border-radius:var(--r1);background:var(--surface);cursor:pointer;display:block;position:relative;overflow:hidden}'
+'.pe-gc svg{width:100%;height:100%;display:block}'
+'.pe-gc.pe-hint{outline:3px dashed var(--ink);outline-offset:2px}'
+'.pe-opts{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;width:100%}'
+'.pe-op{min-height:120px;flex-direction:column;padding:4px}.pe-op svg{width:100%;height:auto;max-height:130px}'
+'.pe-op.pe-out{border-style:dashed;opacity:.75}'
+'.phone.rm .pe *,.phone.rm .pe *::before{transition:none!important;animation:none!important}'
+'@media (prefers-reduced-motion:reduce){.pe *,.pe *::before{transition:none!important;animation:none!important}}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pze4-css'))return;var s=document.createElement('style');s.id='pze4-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function B(txt,fn,at){at=at||{};at.class='pe-btn '+(at.class||'');return pzBtn(txt,fn,at)}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'pe '+cls});root.appendChild(w);return w}
function plural(n,w,pl){return n+' '+(n===1?w:(pl||w+'s'))}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
var NS='http://www.w3.org/2000/svg';
function sv(tag,at,txt){var e=document.createElementNS(NS,tag);Object.keys(at||{}).forEach(function(k){e.setAttribute(k,at[k])});if(txt!==undefined)e.textContent=txt;return e}
function say2(msg,api,t){msg.textContent=t;if(api.say)api.say(t)}
function wrap(m,kind){return function(root,inst,api){var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'pe-row pe-bar'}),w=root.firstChild;
    if(kind!=='try')bar.appendChild(B('Undo',function(){lv=0;c.undo()},{'aria-label':'Undo'}));
    bar.appendChild(B('Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)},{'aria-label':'Hint'}));
    bar.appendChild(kind==='try'?B('Try again',function(){lv=0;c.restart()},{'aria-label':'Try again'}):B('Restart',function(){lv=0;c.restart()},{'aria-label':'Restart this level'}));
    if(w)w.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,moves:c.moves,destroy:function(){clearTimeout(tm);c.destroy()}}}}
function starsFor(res,inst,verb){var par=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0,s=pzStarsByPar(m,par,h);
  return{stars:s,line:verb(m,par)+' with '+hintsLine(h)+'.'}}

/* ================= 1. Temple Circles =================
   A tablet (box W x H, whole-number grid) holds fixed circles. Each circle to place has a radius and a list of touches (floor F, left wall L, right wall R, top edge T, or circle Cn).
   A circle touches a wall when its centre is exactly r from it, and touches circle n when the squared centre distance equals (r+rn)^2 (exact whole numbers, no rounding).
   make() lists every grid position that meets the touches (sols). It accepts a scene only when every circle has 1 to 4 positions and no position of one circle overlaps any position of another or any fixed circle, so no choice can block a later circle. par = number of circles. */
var TC_W=16,TC_H=12;
function tcSols(W,H,r,cons,fixed){var out=[];
  for(var x=r;x<=W-r;x++)for(var y=r;y<=H-r;y++){var ok=true,i,j;
    for(i=0;i<cons.length&&ok;i++){var c=cons[i];
      if(c==='F')ok=y===r;else if(c==='L')ok=x===r;else if(c==='R')ok=x===W-r;else if(c==='T')ok=y===H-r;
      else{var f=fixed[+c.slice(1)],dx=x-f.x,dy=y-f.y;ok=dx*dx+dy*dy===(r+f.r)*(r+f.r)}}
    for(j=0;j<fixed.length&&ok;j++){var g=fixed[j],ex=x-g.x,ey=y-g.y;if(ex*ex+ey*ey<(r+g.r)*(r+g.r))ok=false}
    if(ok)out.push([x,y])}
  return out}
function tcApart(a,ra,b,rb){var dx=a[0]-b[0],dy=a[1]-b[1];return dx*dx+dy*dy>=(ra+rb)*(ra+rb)}
function tcMake(level,rng){var W=TC_W,H=TC_H,nP=level<=8?1:level<=16?2:level<=24?3:4,nF=level<=4?1:level<=12?2:3,maxR=level<10?2:level<20?3:4,t,k,i;
  for(t=0;t<500;t++){var fixed=[],ok=true;
    for(i=0;i<nF&&ok;i++){var f=null;
      for(var q=0;q<30&&!f;q++){var r=1+pzInt(rng,3),x=r+1+pzInt(rng,W-2*r-1),y=r+1+pzInt(rng,H-2*r-1),good=true;
        fixed.forEach(function(o){var dx=x-o.x,dy=y-o.y;if(dx*dx+dy*dy<(r+o.r+1)*(r+o.r+1))good=false});if(good)f={x:x,y:y,r:r}}
      if(f)fixed.push(f);else ok=false}
    if(!ok)continue;
    var pool=['F','L','R','T'].concat(seq(nF).map(function(n){return 'C'+n})),circles=[];
    for(k=0;k<nP&&ok;k++){var found=null;
      for(var u=0;u<60&&!found;u++){var rr=1+pzInt(rng,maxR),cons;
        if(level<=2)cons=[['F','T'][pzInt(rng,2)],['L','R'][pzInt(rng,2)]];
        else{var m=level>=21&&pzInt(rng,2)?3:2,p=pzShuffle(pool,rng);cons=p.slice(0,m);
          if(!cons.some(function(c){return c.charAt(0)==='C'}))continue;
          if((cons.indexOf('F')>=0&&cons.indexOf('T')>=0)||(cons.indexOf('L')>=0&&cons.indexOf('R')>=0))continue}
        var s=tcSols(W,H,rr,cons,fixed);if(s.length>=1&&s.length<=4)found={r:rr,cons:cons,sols:s}}
      if(found)circles.push(found);else ok=false}
    if(!ok)continue;
    for(i=0;i<circles.length&&ok;i++)for(var j=i+1;j<circles.length&&ok;j++)
      circles[i].sols.forEach(function(a){circles[j].sols.forEach(function(b){if(!tcApart(a,circles[i].r,b,circles[j].r))ok=false})});
    if(ok)return{level:level,title:'Level '+level,W:W,H:H,fixed:fixed,circles:circles,par:circles.length}}
  var fb=[{r:2,cons:['F','L'],sols:[[2,2]]},{r:2,cons:['F','R'],sols:[[W-2,2]]}].slice(0,nP>1?2:1);
  return{level:level,title:'Level '+level,W:W,H:H,fixed:[],circles:fb,par:fb.length}}
PZE4.tc={make:tcMake,sols:tcSols};
var LETS='ABCDE';
function tcName(c){return c==='F'?'the floor':c==='L'?'the left wall':c==='R'?'the right wall':c==='T'?'the top edge':'circle '+LETS.charAt(+c.slice(1))}
function mountTc(root,inst,api){
  var w=shell(root,'pe-tc'),W=inst.W,H=inst.H,C=inst.circles,F=inst.fixed,placed=[],pos,steps=0,hints=0,undos=0,fin=false,drag=false,
    info=pzEl('p',{class:'pe-info',text:'Drag the dashed circle, or use the arrow buttons, until it touches everything on the list. A diamond marks each touch. Then press Lock circle.'}),
    prog=pzEl('p',{class:'pe-prog'}),msg=pzEl('p',{class:'pe-msg',role:'status'}),st=pzEl('ul',{class:'pe-st','aria-label':'Touch checklist'}),after=pzEl('p',{class:'pe-info'}),
    svg=sv('svg',{viewBox:'-0.6 -0.6 '+(W+1.2)+' '+(H+1.2),class:'pe-board',role:'img','aria-label':'Tablet with '+plural(F.length,'fixed circle')+'. Use the buttons below to move the new circle.',focusable:'false'}),
    arrows=pzEl('div',{class:'pe-row'}),lockB;
  function clamp(){var r=C[Math.min(placed.length,C.length-1)].r;pos[0]=Math.max(r,Math.min(W-r,pos[0]));pos[1]=Math.max(r,Math.min(H-r,pos[1]))}
  function home(){pos=[Math.round(W/2),Math.round(H/2)];clamp()}home();
  function say(t){say2(msg,api,t)}
  function stat(){var i=placed.length,c=C[i],x=pos[0],y=pos[1],r=c.r,items=c.cons.map(function(k){var ok,pt;
      if(k==='F'){ok=y===r;pt=[x,0]}else if(k==='L'){ok=x===r;pt=[0,y]}else if(k==='R'){ok=x===W-r;pt=[W,y]}else if(k==='T'){ok=y===H-r;pt=[x,H]}
      else{var f=F[+k.slice(1)],dx=x-f.x,dy=y-f.y;ok=dx*dx+dy*dy===(r+f.r)*(r+f.r);pt=[x+(f.x-x)*r/(r+f.r),y+(f.y-y)*r/(r+f.r)]}
      return{label:tcName(k),ok:ok,pt:pt}}),over=false;
    F.concat(placed.map(function(p,j){return{x:p[0],y:p[1],r:C[j].r}})).forEach(function(o){var dx=x-o.x,dy=y-o.y;if(dx*dx+dy*dy<(r+o.r)*(r+o.r))over=true});
    return{items:items,over:over,all:!over&&items.every(function(t){return t.ok})}}
  function paint(){svg.textContent='';svg.appendChild(sv('rect',{x:0,y:0,width:W,height:H,class:'pe-bg','stroke-width':'.12'}));
    for(var g=1;g<W;g++)svg.appendChild(sv('line',{x1:g,y1:0,x2:g,y2:H,class:'pe-gl','stroke-width':'.03'}));for(g=1;g<H;g++)svg.appendChild(sv('line',{x1:0,y1:g,x2:W,y2:g,class:'pe-gl','stroke-width':'.03'}));
    F.forEach(function(f,i){svg.appendChild(sv('circle',{cx:f.x,cy:H-f.y,r:f.r,class:'pe-fx','stroke-width':'.14'}));svg.appendChild(sv('text',{x:f.x,y:H-f.y+.4,class:'pe-tx','font-size':'1.2'},LETS.charAt(i)))});
    placed.forEach(function(p,i){svg.appendChild(sv('circle',{cx:p[0],cy:H-p[1],r:C[i].r,class:'pe-pl','stroke-width':'.14'}));svg.appendChild(sv('text',{x:p[0],y:H-p[1]+.4,class:'pe-pt','font-size':'1.2'},String(i+1)))});
    if(!fin){var s=stat(),c=C[placed.length];svg.appendChild(sv('circle',{cx:pos[0],cy:H-pos[1],r:c.r,class:'pe-ac','stroke-width':'.16'}));
      svg.appendChild(sv('path',{d:'M'+(pos[0]-.4)+' '+(H-pos[1])+'h.8M'+pos[0]+' '+(H-pos[1]-.4)+'v.8',class:'pe-ln','stroke-width':'.14'}));
      s.items.forEach(function(t){if(t.ok){var x=t.pt[0],y=H-t.pt[1];svg.appendChild(sv('polygon',{points:(x)+','+(y-.38)+' '+(x+.38)+','+y+' '+x+','+(y+.38)+' '+(x-.38)+','+y,class:'pe-mk'}))}});
      st.textContent='';s.items.forEach(function(t){st.appendChild(pzEl('li',{text:(t.ok?'Touching ':'Not yet touching ')+t.label+(t.ok?' (diamond)':'')}))});
      if(s.over)st.appendChild(pzEl('li',{text:'This circle overlaps another circle. Move it clear.'}));
      prog.textContent='Circle '+(placed.length+1)+' of '+C.length+', radius '+c.r}
    else{st.textContent='';prog.textContent='All '+C.length+' circles placed'}
    lockB.disabled=fin}
  function setFrom(e){var rc=svg.getBoundingClientRect();if(!rc.width)return;var x=(e.clientX-rc.left)/rc.width*(W+1.2)-.6,y=H-((e.clientY-rc.top)/rc.height*(H+1.2)-.6);pos=[Math.round(x),Math.round(y)];clamp();paint()}
  svg.addEventListener('pointerdown',function(e){if(fin)return;drag=true;try{svg.setPointerCapture(e.pointerId)}catch(x){}setFrom(e);e.preventDefault()});
  svg.addEventListener('pointermove',function(e){if(drag&&!fin)setFrom(e)});
  svg.addEventListener('pointerup',function(){drag=false});svg.addEventListener('pointercancel',function(){drag=false});
  function nudge(dx,dy){if(fin)return;pos=[pos[0]+dx,pos[1]+dy];clamp();paint();say('Centre at '+pos[0]+' across, '+pos[1]+' up.')}
  [['Move circle left','←',-1,0],['Move circle up','↑',0,1],['Move circle down','↓',0,-1],['Move circle right','→',1,0]].forEach(function(a){arrows.appendChild(B(a[1],function(){nudge(a[2],a[3])},{'aria-label':a[0]}))});
  lockB=B('Lock circle',function(){lock()},{'aria-label':'Lock circle'});arrows.appendChild(lockB);
  w.addEventListener('keydown',function(e){var k=e.key,m={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[k];if(m&&e.target.tagName!=='BUTTON'){nudge(m[0],m[1]);e.preventDefault()}});
  function lock(){if(fin)return;var i=placed.length,s=stat();steps++;api.moved();
    if(!s.all){var miss=s.items.filter(function(t){return !t.ok}).map(function(t){return t.label});say(s.over?'Not locked: the circle overlaps another one.':'Not locked yet. Still to touch: '+miss.join(', ')+'.');return false}
    placed.push(pos.slice());home();
    if(placed.length===C.length){fin=true;paint();var ex=[];C.forEach(function(c,j){c.cons.forEach(function(k){if(k.charAt(0)==='C'){var f=F[+k.slice(1)],p=placed[j],dx=p[0]-f.x,dy=p[1]-f.y;ex.push('Circle '+(j+1)+' and circle '+LETS.charAt(+k.slice(1))+': the centres are '+Math.round(Math.sqrt(dx*dx+dy*dy)*100)/100+' apart, which is '+c.r+' + '+f.r+'.')}})});
      after.textContent=ex.length?'Why it works: two circles touch when their centres are exactly the two radii apart. '+ex.join(' '):'Why it works: a circle touches a wall when its centre is exactly one radius from it.';
      say('Every circle touches exactly what it should.');api.done({solved:true,moves:steps,hints:hints,undos:undos,extra:{par:inst.par}});return true}
    paint();say('Circle '+placed.length+' locked. Next, circle '+(placed.length+1)+'.');return true}
  w.appendChild(info);w.appendChild(prog);w.appendChild(svg);w.appendChild(st);w.appendChild(arrows);w.appendChild(msg);w.appendChild(after);paint();
  return{undo:function(){if(fin||!placed.length)return false;placed.pop();undos++;home();paint();say('Last circle taken back.');return true},
    restart:function(){if(fin)return;placed=[];home();paint();say('Back to the first circle.')},
    moves:function(){return steps},
    hint:function(lv){if(fin)return null;hints++;var i=placed.length,c=C[i],s=stat(),miss=s.items.filter(function(t){return !t.ok})[0],t;
      if(lv<=1)t=miss?'Circle '+(i+1)+' is not yet touching '+miss.label+'. Move it until a diamond shows there.':'Every touch is in place. Press Lock circle.';
      else if(lv===2)t='The centre of circle '+(i+1)+' belongs '+c.sols[0][0]+' steps across from the left wall.';
      else{pos=c.sols[0].slice();lock();return msg.textContent}
      say(t);return t},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'temple-circles',name:'Temple Circles',family:'move',theme:'F8',blurb:'Place circles so they exactly touch walls and other circles.',
  how:'Drag the dashed circle, or use the arrow buttons, until its centre is exactly the right distance from each thing on the checklist. A diamond marks every touch. Press Lock circle when all touches are made.',
  areas:['space','control'],levels:30,secs:90,make:tcMake,mount:wrap(mountTc,'undo'),
  stars:function(res,inst){return starsFor(res,inst,function(m,par){return 'You placed '+plural(par,'circle')+' in '+plural(m,'lock')+' (the fewest is '+par+')'})}});

/* ================= 2. Mirror Lattice =================
   A square lattice (N x N cells, N even) is mirror-symmetric left-right and top-bottom (and also across the diagonals from level 21).
   Each cell holds one of k motifs. make() builds a symmetric pattern, then hides cells so every hidden cell keeps at least one visible mirror twin, so the whole answer is fixed by symmetry. par = number of hidden cells. */
var ML_NAMES=['Plain','Circle','Diamond','Star','Square','Cross'];
function mlImages(N,sym,r,c){var a=[[r,c],[r,N-1-c],[N-1-r,c],[N-1-r,N-1-c]];if(sym==='D4')a=a.concat([[c,r],[c,N-1-r],[N-1-c,r],[N-1-c,N-1-r]]);return a.map(function(p){return p[0]*N+p[1]})}
function mlMake(level,rng){var N=level<=10?6:8,sym=level>=21?'D4':'D2',k=level<=6?3:level<=14?4:level<=22?5:6,
    m=N===6?2+Math.floor((level-1)*.6):sym==='D2'?6+Math.floor((level-11)*.8):8+Math.floor((level-21)*.7),orb=[],seen={},grid=[],t,i,c,v;
  for(c=0;c<N*N;c++)if(!seen[c]){var o=mlImages(N,sym,Math.floor(c/N),c%N).filter(function(x,j,a){return a.indexOf(x)===j});o.forEach(function(x){seen[x]=orb.length});orb.push(o)}
  for(t=0;t<40;t++){grid=[];orb.forEach(function(o){v=pzInt(rng,k);o.forEach(function(x){grid[x]=v})});var d={};grid.forEach(function(g){d[g]=1});if(Object.keys(d).length>=Math.min(k,3))break}
  var vis=orb.map(function(o){return o.length}),miss=[];
  pzShuffle(seq(N*N),rng).forEach(function(x){if(miss.length<m&&vis[seen[x]]>1){vis[seen[x]]--;miss.push(x)}});
  miss.sort(function(a,b){return a-b});
  return{level:level,title:'Level '+level,N:N,sym:sym,k:k,grid:grid,miss:miss,par:miss.length}}
PZE4.ml={make:mlMake,images:mlImages,names:ML_NAMES};
function motifSvg(id,size){var s=sv('svg',{viewBox:'0 0 10 10','aria-hidden':'true',focusable:'false'});if(size){s.setAttribute('width',size);s.setAttribute('height',size)}motifIn(s,id);return s}
function motifIn(g,id){if(id===0)g.appendChild(sv('circle',{cx:5,cy:5,r:.7,class:'pe-ink'}));
  else if(id===1)g.appendChild(sv('circle',{cx:5,cy:5,r:3,class:'pe-ln','stroke-width':'1.2'}));
  else if(id===2)g.appendChild(sv('polygon',{points:'5,1.5 8.5,5 5,8.5 1.5,5',class:'pe-ink'}));
  else if(id===3)g.appendChild(sv('polygon',{points:'5,1 6,4 9,5 6,6 5,9 4,6 1,5 4,4',class:'pe-ink'}));
  else if(id===4){g.appendChild(sv('rect',{x:2,y:2,width:6,height:6,class:'pe-ln','stroke-width':'1'}));g.appendChild(sv('rect',{x:4.1,y:4.1,width:1.8,height:1.8,class:'pe-ink'}))}
  else g.appendChild(sv('polygon',{points:'4,1.5 6,1.5 6,4 8.5,4 8.5,6 6,6 6,8.5 4,8.5 4,6 1.5,6 1.5,4 4,4',class:'pe-ink'}))}
function mountMl(root,inst,api){
  var w=shell(root,'pe-ml'),N=inst.N,miss=inst.miss,T=inst.grid,cur=miss.map(function(){return -1}),sel=0,hist=[],steps=0,hints=0,undos=0,fin=false,hlc=-1,twin=-1,
    info=pzEl('p',{class:'pe-info',text:'Dashed lines are mirrors'+(inst.sym==='D4'?' (across, down and both diagonals)':' (across and down)')+'. Pick a numbered gap, then pick the shape its mirror twin shows.'}),
    prog=pzEl('p',{class:'pe-prog'}),msg=pzEl('p',{class:'pe-msg',role:'status'}),
    svg=sv('svg',{viewBox:'0 0 '+N*10+' '+N*10,class:'pe-board',role:'img','aria-label':'Lattice, '+N+' by '+N+', with '+plural(miss.length,'gap')+'. Use the numbered buttons.',focusable:'false'}),
    gaps=pzEl('div',{class:'pe-row','aria-label':'Gaps'}),pal=pzEl('div',{class:'pe-row','aria-label':'Shapes'}),gb=[],pb=[];
  function rc(c){return 'row '+(Math.floor(c/N)+1)+', column '+(c%N+1)}
  function say(t){say2(msg,api,t)}
  function vi(c){return miss.indexOf(c)}
  function paint(){svg.textContent='';
    for(var c=0;c<N*N;c++){var x=c%N*10,y=Math.floor(c/N)*10,i=vi(c),g=sv('g',{transform:'translate('+x+' '+y+')'});
      g.appendChild(sv('rect',{x:.4,y:.4,width:9.2,height:9.2,class:i<0||cur[i]<0?(i<0?'pe-cell':'pe-miss'):'pe-cell','stroke-width':'.4'}));
      if(i<0)motifIn(g,T[c]);else if(cur[i]>=0)motifIn(g,cur[i]);else g.appendChild(sv('text',{x:5,y:6.6,class:'pe-tx','font-size':'5'},'?'));
      if(i>=0){g.appendChild(sv('text',{x:1.2,y:3.4,class:'pe-tx','font-size':'3','text-anchor':'start'},String(i+1)));if(i===sel)g.appendChild(sv('rect',{x:.9,y:.9,width:8.2,height:8.2,class:'pe-sl','stroke-width':'1.1'}));if(i===hlc)g.appendChild(sv('rect',{x:.2,y:.2,width:9.6,height:9.6,class:'pe-sl','stroke-width':'.5','stroke-dasharray':'1 1'}))}
      if(c===twin)g.appendChild(sv('rect',{x:.2,y:.2,width:9.6,height:9.6,class:'pe-sl','stroke-width':'.7','stroke-dasharray':'1.2 .8'}));
      svg.appendChild(g)}
    svg.appendChild(sv('path',{d:'M'+N*5+' 0V'+N*10+'M0 '+N*5+'H'+N*10+(inst.sym==='D4'?'M0 0L'+N*10+' '+N*10+'M'+N*10+' 0L0 '+N*10:''),class:'pe-ax','stroke-width':'.6'}));
    miss.forEach(function(c,i){var b=gb[i],t=cur[i]>=0?ML_NAMES[cur[i]]:'empty';b.setAttribute('aria-label','Cell '+(i+1)+': '+rc(c)+', '+t+(i===sel?', selected':'')+(i===hlc?', hint':''));b.textContent='';b.appendChild(pzEl('span',{'aria-hidden':'true',text:String(i+1)}));
      b.className='pe-btn'+(i===sel?' pe-sel':'')+(i===hlc?' pe-hint':'');b.setAttribute('aria-pressed',i===sel?'true':'false')});
    var left=cur.filter(function(v){return v<0}).length;prog.textContent=fin?'Lattice complete':'Gap '+(sel+1)+' of '+miss.length+' selected'+(left?', '+plural(left,'gap')+' still empty':'')}
  miss.forEach(function(c,i){var b=B(String(i+1),function(){sel=i;hlc=-1;twin=-1;paint()},{});gb.push(b);gaps.appendChild(b)});
  svg.addEventListener('click',function(e){var r=svg.getBoundingClientRect();if(!r.width||fin)return;var c=Math.floor((e.clientY-r.top)/r.height*N)*N+Math.floor((e.clientX-r.left)/r.width*N),i=vi(c);if(i>=0){sel=i;hlc=-1;twin=-1;paint()}});
  ML_NAMES.slice(0,inst.k).forEach(function(n,id){var b=B('',function(){place(sel,id)},{'aria-label':'Place '+n});b.textContent='';b.appendChild(motifSvg(id));b.appendChild(pzEl('small',{text:n}));pb.push(b);pal.appendChild(b)});
  function correct(){return miss.every(function(c,i){return cur[i]===T[c]})}
  function place(i,id){if(fin||cur[i]===id)return false;hist.push({i:i,prev:cur[i]});cur[i]=id;steps++;api.moved();hlc=-1;twin=-1;
    if(correct()){fin=true;paint();say('The lattice is mirror-symmetric. Well done.');api.done({solved:true,moves:steps,hints:hints,undos:undos,extra:{par:inst.par}});return true}
    var nx=-1;for(var q=1;q<=miss.length;q++){var j=(i+q)%miss.length;if(cur[j]<0){nx=j;break}}if(nx>=0)sel=nx;
    paint();say('Gap '+(i+1)+' set to '+ML_NAMES[id]+'.');return true}
  w.appendChild(info);w.appendChild(prog);w.appendChild(svg);w.appendChild(gaps);w.appendChild(pal);w.appendChild(msg);paint();
  function wrongOne(){for(var i=0;i<miss.length;i++)if(cur[i]!==T[miss[i]])return i;return -1}
  function twinOf(c){var im=mlImages(N,inst.sym,Math.floor(c/N),c%N);for(var j=0;j<im.length;j++)if(im[j]!==c&&vi(im[j])<0)return im[j];return -1}
  return{undo:function(){if(fin||!hist.length)return false;var h=hist.pop();cur[h.i]=h.prev;sel=h.i;undos++;hlc=-1;twin=-1;paint();say('Last shape taken back.');return true},
    restart:function(){if(fin)return;cur=miss.map(function(){return -1});hist=[];sel=0;hlc=-1;twin=-1;paint();say('All gaps are empty again.')},
    moves:function(){return steps},
    hint:function(lv){if(fin)return null;hints++;var i=wrongOne(),c=miss[i],t;if(i<0)return null;
      if(lv<=1){sel=i;hlc=i;twin=-1;t='Look at gap '+(i+1)+', marked with a dashed outline. It is not right yet.'}
      else if(lv===2){var tw=twinOf(c);sel=i;hlc=i;twin=tw;t='Gap '+(i+1)+' mirrors the cell at '+rc(tw)+', which shows a '+ML_NAMES[T[tw]]+'.'}
      else{sel=i;place(i,T[c]);return msg.textContent}
      paint();say(t);return t},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'mirror-lattice',name:'Mirror Lattice',family:'grid',theme:'F8',blurb:'Fill the gaps so the lattice is a mirror image of itself.',
  how:'The dashed lines are mirrors. Each gap has a mirror twin that is still showing. Pick a numbered gap, then pick the shape that its twin shows, until the whole lattice is symmetric.',
  areas:['space','flex'],levels:30,secs:75,make:mlMake,mount:wrap(mountMl,'undo'),
  stars:function(res,inst){return starsFor(res,inst,function(m,par){return 'You filled '+plural(par,'gap')+' using '+plural(m,'placement')+' (the fewest is '+par+')'})}});

/* ================= 3. Block Match =================
   A target pattern of N x N faces is shown; the player fills a blank grid with the same faces. Face ids: 0 light, 1 dark, 2..5 half (a dark triangle at top right, bottom right, bottom left, top left).
   Patterns are generated at random from a face pool that grows with the level (2x2, 3x3, 4x4), always with at least two kinds of face. par = N*N (one placement per cell). The patterns and faces are original. */
var BM_NAMES=['Light','Dark','Half, dark top right','Half, dark bottom right','Half, dark bottom left','Half, dark top left'];
var BM_TRI=[null,null,'0,0 10,0 10,10','10,0 10,10 0,10','10,10 0,10 0,0','0,10 0,0 10,0'];
function bmMake(level,rng){var N=level<=6?2:level<=18?3:4,pool=level<=3?[0,1]:level<=6?[0,1,2,3]:seq(6),grid=[],t,i;
  var need=Math.min(pool.length,N===2?2:N===3?(level>=10?3:2):3);
  for(t=0;t<60;t++){grid=[];for(i=0;i<N*N;i++)grid.push(pool[pzInt(rng,pool.length)]);var d={};grid.forEach(function(g){d[g]=1});if(Object.keys(d).length>=need)break}
  return{level:level,title:'Level '+level,N:N,pool:pool,grid:grid,par:N*N}}
PZE4.bm={make:bmMake,names:BM_NAMES};
function faceSvg(f){var s=sv('svg',{viewBox:'0 0 10 10','aria-hidden':'true',focusable:'false'});
  if(f<0){s.appendChild(sv('rect',{x:0,y:0,width:10,height:10,class:'pe-miss','stroke-width':'.6'}));s.appendChild(sv('text',{x:5,y:6.8,class:'pe-tx','font-size':'6'},'?'));return s}
  s.appendChild(sv('rect',{x:0,y:0,width:10,height:10,fill:'var(--surface)'}));
  if(f===1)s.appendChild(sv('rect',{x:0,y:0,width:10,height:10,class:'pe-ink'}));
  else if(f>=2){s.appendChild(sv('polygon',{points:BM_TRI[f],class:'pe-ink'}));s.appendChild(sv('path',{d:f%2===0?'M0 0L10 10':'M10 0L0 10',class:'pe-ln',stroke:'var(--ink)','stroke-width':'.5'}))}
  s.appendChild(sv('rect',{x:.2,y:.2,width:9.6,height:9.6,fill:'none',stroke:'var(--ink)','stroke-width':'.4'}));return s}
function mountBm(root,inst,api){
  var w=shell(root,'pe-bm'),N=inst.N,T=inst.grid,cur=T.map(function(){return -1}),face=inst.pool[inst.pool.length>1?1:0],hist=[],steps=0,hints=0,undos=0,fin=false,hl=-1,
    info=pzEl('p',{class:'pe-info',text:'Pick a face, then tap a square to place it, until your grid matches the target.'}),
    desc='Target, '+N+' by '+N+'. '+seq(N).map(function(r){return 'Row '+(r+1)+': '+seq(N).map(function(c){return BM_NAMES[T[r*N+c]]}).join(', ')+'.'}).join(' '),
    tw=pzEl('div',{class:'pe-grid',role:'img','aria-label':desc,style:'grid-template-columns:repeat('+N+',28px)'}),
    grid=pzEl('div',{class:'pe-grid',role:'group','aria-label':'Your grid',style:'grid-template-columns:repeat('+N+',56px)'}),pal=pzEl('div',{class:'pe-row','aria-label':'Faces'}),
    prog=pzEl('p',{class:'pe-prog'}),msg=pzEl('p',{class:'pe-msg',role:'status'}),cb=[],pb=[];
  function say(t){say2(msg,api,t)}
  function rc(i){return 'Row '+(Math.floor(i/N)+1)+', column '+(i%N+1)}
  T.forEach(function(f){var d=pzEl('div',{style:'width:28px;height:28px','aria-hidden':'true'});d.appendChild(faceSvg(f));d.firstChild.setAttribute('width','28');d.firstChild.setAttribute('height','28');tw.appendChild(d)});
  function paint(){cb.forEach(function(b,i){b.textContent='';b.appendChild(faceSvg(cur[i]));b.className='pe-gc'+(i===hl?' pe-hint':'');b.setAttribute('aria-label',rc(i)+': '+(cur[i]<0?'empty':BM_NAMES[cur[i]])+(i===hl?', hint':''))});
    pb.forEach(function(b,k){b.setAttribute('aria-pressed',inst.pool[k]===face?'true':'false')});
    var left=cur.filter(function(v){return v<0}).length;prog.textContent=fin?'Pattern matched':left?plural(left,'square')+' still empty':'Every square is filled. Check them against the target.'}
  T.forEach(function(f,i){var b=pzBtn('',function(){put(i,face)},{class:'pe-gc'});cb.push(b);grid.appendChild(b)});
  inst.pool.forEach(function(f,k){var b=B('',function(){face=f;hl=-1;paint();say('Using '+BM_NAMES[f]+'.')},{'aria-label':'Use '+BM_NAMES[f]});b.textContent='';b.appendChild(faceSvg(f));b.appendChild(pzEl('small',{text:BM_NAMES[f]}));pb.push(b);pal.appendChild(b)});
  function put(i,f){if(fin||cur[i]===f)return false;hist.push({i:i,prev:cur[i]});cur[i]=f;steps++;api.moved();hl=-1;
    if(cur.every(function(v,j){return v===T[j]})){fin=true;paint();say('Your grid matches the target.');api.done({solved:true,moves:steps,hints:hints,undos:undos,extra:{par:inst.par}});return true}
    paint();say(rc(i)+' set to '+BM_NAMES[f]+'.');return true}
  w.appendChild(info);w.appendChild(pzEl('p',{class:'pe-prog',text:'Target'}));w.appendChild(tw);w.appendChild(pzEl('p',{class:'pe-prog',text:'Your grid'}));w.appendChild(grid);w.appendChild(pal);w.appendChild(prog);w.appendChild(msg);paint();
  function wrongOne(){for(var i=0;i<T.length;i++)if(cur[i]!==T[i])return i;return -1}
  return{undo:function(){if(fin||!hist.length)return false;var h=hist.pop();cur[h.i]=h.prev;undos++;hl=-1;paint();say('Last placement taken back.');return true},
    restart:function(){if(fin)return;cur=T.map(function(){return -1});hist=[];hl=-1;paint();say('Your grid is empty again.')},
    moves:function(){return steps},
    hint:function(lv){if(fin)return null;hints++;var i=wrongOne(),t;if(i<0)return null;
      if(lv<=1){hl=i;t='Look at the square marked with a dashed outline: '+rc(i)+'. It does not match the target yet.'}
      else if(lv===2){hl=i;t=rc(i)+' needs this face: '+BM_NAMES[T[i]]+'.'}
      else{face=T[i];put(i,T[i]);return msg.textContent}
      paint();say(t);return t},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'block-match',name:'Block Match',family:'grid',theme:'F8',blurb:'Copy a pattern of square faces onto your own grid.',
  how:'A target pattern is shown. Pick a face, then tap squares to place it. Faces are light, dark, or half dark with the dark corner in one of four places. Match every square.',
  areas:['space','control'],levels:30,secs:60,make:bmMake,mount:wrap(mountBm,'undo'),
  stars:function(res,inst){return starsFor(res,inst,function(m,par){return 'You matched the pattern in '+plural(m,'placement')+' (the fewest is '+par+')'})}});

/* ================= 4. Silhouette Match =================
   A figure is a vector v = [head 0..2, left arm 0..4, right arm 0..4, legs 0..2, notch count code 0..2, side 0..1], drawn as filled polygons (our own shapes).
   Turning keeps v; flipping left-right swaps the two arms and toggles the side. A wrong option differs from the target in dk parts and is neither v nor flip(v), and its outline signature
   (sorted distances of all corner points from their centre, unchanged by turning and flipping) differs from the target. Each level has several rounds; par = rounds. */
var SM_ANG=[-60,-25,10,45,80];
function smPolys(v){var P=[],i;
  P.push([[-1,0],[1,0],[.75,3],[-.75,3]]);
  if(v[0]===0){var o=[];for(i=0;i<8;i++)o.push([Math.round(.7*Math.cos(i*Math.PI/4+Math.PI/8)*1000)/1000,Math.round((3.7+.7*Math.sin(i*Math.PI/4+Math.PI/8))*1000)/1000]);P.push(o)}
  else if(v[0]===1)P.push([[-.5,3],[.5,3],[.5,4.2],[0,5.4],[-.5,4.2]]);
  else{P.push([[-.55,3],[.55,3],[.55,4.1],[-.55,4.1]]);P.push([[-.55,4.1],[-.15,4.1],[-.95,5.1]]);P.push([[.15,4.1],[.55,4.1],[.95,5.1]])}
  [[-1,v[1]],[1,v[2]]].forEach(function(a){var sg=a[0],t=SM_ANG[a[1]]*Math.PI/180,dx=sg*Math.cos(t),dy=Math.sin(t),sx=sg*.8,sy=2.6,nx=-dy,ny=dx,ex=sx+dx*2.3,ey=sy+dy*2.3;
    P.push([[sx+nx*.17,sy+ny*.17],[ex+nx*.17,ey+ny*.17],[ex-nx*.17,ey-ny*.17],[sx-nx*.17,sy-ny*.17]]);
    P.push([[ex+nx*.4,ey+ny*.4],[ex-nx*.4,ey-ny*.4],[ex+dx*.7,ey+dy*.7]])});
  [-1,1].forEach(function(sg){var x0=sg*.5,x1=sg*(.5+.5*v[3]);P.push([[x0-.22,0],[x0+.22,0],[x1+.22,-2.4],[x1-.22,-2.4]])});
  var n=v[4]+2,sd=v[5]?-1:1;function E(t){return[sd*(.75+.25*t),3-3*t]}
  for(i=0;i<n;i++){var t0=i/n,t1=(i+1)/n,m=E((t0+t1)/2);P.push([E(t0),E(t1),[m[0]+sd*.7,m[1]]])}
  return P}
function smFlip(v){return[v[0],v[2],v[1],v[3],v[4],1-v[5]]}
function smSig(v){var pts=[];smPolys(v).forEach(function(p){p.forEach(function(q){pts.push(q)})});var cx=0,cy=0;pts.forEach(function(q){cx+=q[0];cy+=q[1]});cx/=pts.length;cy/=pts.length;
  return pts.map(function(q){return Math.round(Math.sqrt((q[0]-cx)*(q[0]-cx)+(q[1]-cy)*(q[1]-cy))*1e5)/1e5}).sort(function(a,b){return a-b})}
function smSame(a,b){if(a.length!==b.length)return false;for(var i=0;i<a.length;i++)if(Math.abs(a[i]-b[i])>1e-4)return false;return true}
var SM_RANGE=[3,5,5,3,3,2];
function smMake(level,rng){var R=level<=10?3:level<=20?4:5,dk=level<=5?3:level<=20?2:(level<=25&&level%2?2:1),rots=level<=5?[0,90,180,270]:level<=12?seq(12).map(function(i){return i*30}):null,flipOk=level>=13,rounds=[],r;
  for(r=0;r<R;r++){var v=SM_RANGE.map(function(n){return pzInt(rng,n)}),fv=smFlip(v),sigT=smSig(v),opts=[],used=[v.join(),fv.join()],tries=0;
    while(opts.length<3&&tries<400){tries++;var w=v.slice(),ix=pzShuffle(seq(6),rng).slice(0,dk);
      ix.forEach(function(j){var nv=pzInt(rng,SM_RANGE[j]-1);if(nv>=v[j])nv++;w[j]=nv});
      var key=w.join(),fk=smFlip(w).join();if(used.indexOf(key)>=0||used.indexOf(fk)>=0||smSame(smSig(w),sigT))continue;used.push(key);used.push(fk);opts.push({v:w})}
    if(opts.length<3)throw new Error('could not build options');
    var ans=pzInt(rng,4),all=[];opts.forEach(function(o){all.push(o)});all.splice(ans,0,{v:v});
    all.forEach(function(o,i){o.rot=rots?rots[pzInt(rng,rots.length)]:pzInt(rng,360);o.flip=flipOk&&pzInt(rng,2)===1;if(i===ans&&o.rot===0&&!o.flip&&level>2)o.rot=rots?rots[1]:90;
      if(i===ans&&flipOk&&level>=13&&r===0)o.flip=true});
    rounds.push({target:v,opts:all,answer:ans})}
  return{level:level,title:'Level '+level,rounds:rounds,par:R}}
PZE4.sm={make:smMake,polys:smPolys,flip:smFlip,sig:smSig};
function figSvg(v,rot,flip){var s=sv('svg',{viewBox:'-6 -7.5 12 12','aria-hidden':'true',focusable:'false'}),g=sv('g',{transform:'rotate('+rot+' 0 -1.5) scale('+(flip?-1:1)+' 1)'});
  smPolys(v).forEach(function(p){g.appendChild(sv('polygon',{points:p.map(function(q){return q[0]+','+(-q[1])}).join(' '),class:'pe-ink'}))});s.appendChild(g);return s}
var SM_FEAT=['the headdress','the arms','the arms','the legs','the notched edge','which side the notched edge is on'];
function mountSm(root,inst,api){
  var w=shell(root,'pe-sm'),R=inst.rounds,ri=0,steps=0,hints=0,attempts=1,fin=false,out=[],
    info=pzEl('p',{class:'pe-info',text:'Find the option that is the same shape as the target. It may be turned round'+(inst.rounds[0].opts.some(function(o){return o.flip})?' or flipped':'')+'. The other shapes differ in a part.'}),
    prog=pzEl('p',{class:'pe-prog'}),tg=pzEl('div',{role:'img','aria-label':'Target shape',style:'width:150px;max-width:60%'}),opts=pzEl('div',{class:'pe-opts',role:'group','aria-label':'Options'}),msg=pzEl('p',{class:'pe-msg',role:'status'}),ob=[];
  function say(t){say2(msg,api,t)}
  function paint(){var r=R[ri];prog.textContent=fin?'All '+R.length+' shapes matched':'Shape '+(ri+1)+' of '+R.length;tg.textContent='';if(!fin)tg.appendChild(figSvg(r.target,0,false));
    ob.forEach(function(b,i){b.textContent='';b.disabled=fin||out.indexOf(i)>=0&&false;if(!fin){b.appendChild(figSvg(r.opts[i].v,r.opts[i].rot,r.opts[i].flip));b.appendChild(pzEl('small',{text:'Option '+'ABCD'.charAt(i)+(out.indexOf(i)>=0?': not this one':'')}))}
      b.className='pe-btn pe-op'+(out.indexOf(i)>=0?' pe-out':'');b.setAttribute('aria-label','Option '+'ABCD'.charAt(i)+(out.indexOf(i)>=0?', ruled out':''))})}
  for(var i=0;i<4;i++)(function(i){var b=pzBtn('',function(){pick(i)},{class:'pe-btn pe-op','aria-label':'Option '+'ABCD'.charAt(i)});ob.push(b);opts.appendChild(b)})(i);
  function pick(i){if(fin)return false;steps++;api.moved();
    if(i===R[ri].answer){ri++;out=[];if(ri>=R.length){ri=R.length-1;fin=true;paint();say('Every shape matched.');api.done({solved:true,moves:steps,hints:hints,undos:0,extra:{par:inst.par,attempts:attempts}});return true}
      paint();say('Yes, that is the same shape. Next shape.');return true}
    if(out.indexOf(i)<0)out.push(i);paint();say('Not that one. Compare the parts again.');return false}
  w.appendChild(info);w.appendChild(prog);w.appendChild(tg);w.appendChild(opts);w.appendChild(msg);paint();
  return{undo:function(){return false},
    restart:function(){if(fin)return;attempts++;ri=0;out=[];paint();say('Starting again from the first shape.')},
    moves:function(){return steps},
    hint:function(lv){if(fin)return null;hints++;var r=R[ri],t,diff={};
      r.opts.forEach(function(o,i){if(i!==r.answer)o.v.forEach(function(x,j){if(x!==r.target[j])diff[j]=(diff[j]||0)+1})});
      var best=0,bj=-1;Object.keys(diff).forEach(function(j){if(diff[j]>best){best=diff[j];bj=+j}});
      if(lv<=1)t='Compare '+SM_FEAT[bj<0?1:bj]+' first. Some options differ there.';
      else if(lv===2){var wr=[0,1,2,3].filter(function(i){return i!==r.answer&&out.indexOf(i)<0})[0];if(wr===undefined)t='Only the right option is left.';else{out.push(wr);paint();t='Option '+'ABCD'.charAt(wr)+' is ruled out.'}}
      else{pick(r.answer);return msg.textContent}
      say(t);return t},
    destroy:function(){root.textContent=''}}}
registerPuzzle({undo:false,id:'silhouette-match',name:'Silhouette Match',family:'grid',theme:'F8',blurb:'Spot the matching shadow shape among four turned or flipped options.',
  how:'A target shadow shape is shown. Tap the option that is the very same shape, even if it is turned round or flipped. The other three differ in a part, such as the headdress, arms, legs or notched edge. Several shapes per level.',
  areas:['space','speed'],levels:30,secs:60,make:smMake,mount:wrap(mountSm,'try'),
  stars:function(res,inst){var a=(res.extra&&res.extra.attempts)||1;return starsFor(res,inst,function(m,par){return 'You matched '+plural(par,'shape')+' in '+plural(m,'tap')+' (the fewest is '+par+')'+(a>1?' over '+plural(a,'try','tries'):'')})}});
})();
