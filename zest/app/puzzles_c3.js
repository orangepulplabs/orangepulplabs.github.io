/* Zest puzzles, wave 1 file 3: Bridge Walk, Dodecahedron Tour, Hundred Drawers.
   Loaded after puzzles_kit.js. Every make(level,rng) is pure (no Math.random, no DOM): the same seed gives the same puzzle on every device.
   The generators and solvers are exposed on PZC3 for tests/pzc3_logic.js. mount() returns {undo,hint,restart,moves,destroy}; hint(n) returns the sentence and (level 3) may perform the step.
   Everything is drawn as SVG built in code. All wording is about the puzzle only: no claims about the brain.
   Extra inst fields: bridge-walk {n,edges,pos,impossible,trail,odd,par}; dodecahedron-tour {shape,n,edges,pos,H,start,cycle,par}; hundred-drawers {n,cap,mine,perm,par,chain}.
   hundred-drawers has no undo (undo:false); its toolbar is Hint + Try again. Container: any width from 280 px, height grows (dodecahedron board is 1.4 x its width). No audio. */
var PZC3={};
(function(){
var CSS='.p3{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.p3 *{box-sizing:border-box}'
+'.p3-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.p3-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.p3-prog{margin:0;font-weight:700;font-size:1rem;text-align:center}'
+'.p3-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.p3-btn{min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer}'
+'.p3-btn:disabled{background:var(--dis-bg);color:var(--dis-ink);border-color:var(--dis-bg);cursor:default}'
+'.p3-board{position:relative;width:100%}'
+'.p3-board svg{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible}'
+'.p3-node{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:48px;min-height:48px;padding:0;border:2px solid var(--ink);border-radius:50%;background:var(--surface);color:var(--ink);font:800 1.125rem/1 var(--font);cursor:pointer}'
+'.p3-node small{font:700 .75rem/1 var(--font);color:var(--muted)}'
+'.p3-node.p3-vis{background:var(--tint)}'
+'.p3-node.p3-cur{background:var(--accent);color:var(--on-accent);border-style:double;border-width:5px}'
+'.p3-node.p3-cur small{color:var(--on-accent)}'
+'.p3-node.p3-st{outline:3px solid var(--ink);outline-offset:2px}'
+'.p3-node.p3-hint{outline:3px dashed var(--ink);outline-offset:3px}'
+'.p3-node.p3-hint::before{content:"?";position:absolute;top:-16px;left:50%;margin-left:-4px;font:800 .75rem var(--font);color:var(--ink)}'
+'.p3-node:active{transform:translate(-50%,-50%) scale(.96)}'
+'.p3-e0{stroke:var(--ink);fill:none;stroke-linecap:round}.p3-e1{stroke:var(--surface);fill:none;stroke-linecap:round;stroke-dasharray:1.4 1.6}'
+'.p3-eu{stroke:var(--accent);fill:none;stroke-linecap:round}.p3-eb{fill:var(--surface);stroke:var(--ink);stroke-width:.5}.p3-et{font:800 4px var(--font);fill:var(--ink);text-anchor:middle}'
+'.p3-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:6px;width:100%}'
+'.p3-dr{position:relative;display:flex;align-items:center;justify-content:center;min-width:48px;min-height:56px;padding:2px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);cursor:pointer}'
+'.p3-dr svg{width:100%;height:44px;display:block}'
+'.p3-dr.p3-open{border-style:dashed;background:var(--tint)}'
+'.p3-dr.p3-found{border-style:solid;border-width:4px}'
+'.p3-dr.p3-hint{outline:3px dashed var(--ink);outline-offset:2px}'
+'.p3-dr.p3-hint::before{content:"?";position:absolute;top:-2px;left:3px;font:800 .75rem var(--font);color:var(--ink)}'
+'.p3-dr text,.p3-ring text{font-family:var(--font);font-weight:800;text-anchor:middle;fill:var(--ink)}'
+'.p3-ring{width:100%;max-width:260px;height:auto}'
+'.p3-chain{margin:0 0 8px;text-align:center;font-weight:700;font-size:1rem;line-height:1.5;overflow-wrap:anywhere}'
+'.phone.rm .p3 *,.phone.rm .p3 *::before{transition:none!important;animation:none!important}'
+'@media (prefers-reduced-motion:reduce){.p3 *,.p3 *::before{transition:none!important;animation:none!important}}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pzc3-css'))return;var s=document.createElement('style');s.id='pzc3-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function B(txt,fn,at){at=at||{};at.class='p3-btn '+(at.class||'');return pzBtn(txt,fn,at)}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'p3 '+cls});root.appendChild(w);return w}
function plural(n,w,pl){return n+' '+(n===1?w:(pl||w+'s'))}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
var NS='http://www.w3.org/2000/svg';
function sv(tag,at,txt){var e=document.createElementNS(NS,tag);Object.keys(at||{}).forEach(function(k){e.setAttribute(k,at[k])});if(txt!==undefined)e.textContent=txt;return e}
function r1(x){return Math.round(x*10)/10}
function say2(msg,api,t){msg.textContent=t;if(api.say)api.say(t)}
/* shared: delays done() by 350 ms, adds the toolbar (Undo/Hint/Restart, or Hint/Try again when kind==='try'), mutes the page's own live regions when api.say exists */
function wrap(m,kind){return function(root,inst,api){var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'p3-row p3-bar'}),w=root.firstChild;
    if(kind!=='try')bar.appendChild(B('Undo',function(){lv=0;c.undo()},{'aria-label':'Undo'}));
    bar.appendChild(B('Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)},{'aria-label':'Hint'}));
    bar.appendChild(kind==='try'?B('Try again',function(){lv=0;c.restart()},{'aria-label':'Try again with every drawer closed'}):B('Restart',function(){lv=0;c.restart()},{'aria-label':'Restart this level'}));
    if(w)w.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,moves:c.moves,destroy:function(){clearTimeout(tm);c.destroy()}}}}

/* ================= 1. Bridge Walk ================= */
/* A map is a multigraph: lands 0..n-1 joined by bridges (edges). A walk that crosses every bridge exactly once exists iff the map is connected and has 0 or 2 lands with an odd number of bridges (Euler's rule).
   make() builds walkable maps as a random trail (so a walk exists by construction) and impossible maps by adding one bridge between two even lands of a walkable map (4 odd lands). Level 10 is the seven-bridge town.
   par = number of bridges (each must be crossed once). Parallel bridges are interchangeable, so tapping a land crosses the first unused bridge to it. */
var LET='ABCDEFGH';
function bwDeg(n,E){var d=seq(n).map(function(){return 0});E.forEach(function(e){d[e[0]]++;d[e[1]]++});return d}
function bwOdd(n,E){return bwDeg(n,E).filter(function(x){return x%2}).length}
function bwCircle(n){var p=[];for(var i=0;i<n;i++){var a=(-90+360*i/n)*Math.PI/180;p.push([r1(50+34*Math.cos(a)),r1(50+34*Math.sin(a))])}return p}
function bwSize(level){return level<=6?4:level<=12?5:level<=19?6:level<=25?7:8}
var BW_IMP={4:1,8:1,10:1,14:1,18:1,22:1,25:1,28:1};
var KON={n:4,E:[[0,1],[0,1],[0,2],[0,2],[0,3],[1,3],[2,3]],pos:[[50,32],[16,54],[84,54],[50,86]]};
function bwTrail(n,m,rng){var order=pzShuffle(seq(n),rng),E=[],cnt={},cur=order[0],i;
  function add(u,v){E.push([u,v]);var k=Math.min(u,v)+','+Math.max(u,v);cnt[k]=(cnt[k]||0)+1;cur=v}
  for(i=1;i<n;i++)add(cur,order[i]);
  while(E.length<m){var c=[];for(i=0;i<n;i++)if(i!==cur&&(cnt[Math.min(cur,i)+','+Math.max(cur,i)]||0)<2)c.push(i);if(!c.length)break;add(cur,c[pzInt(rng,c.length)])}
  var tr=[order[0]];E.forEach(function(e){tr.push(e[1])});return{E:E,trail:tr,cnt:cnt}}
function bwMake(level,rng){var n,m,E=null,trail=null,pos,imp=!!BW_IMP[level],t;
  if(level===10){n=KON.n;E=KON.E.map(function(e){return e.slice()});pos=KON.pos.map(function(p){return p.slice()})}
  else{n=bwSize(level);m=Math.min(14,n+1+Math.floor(level/6)+level%3);pos=bwCircle(n);
    if(!imp){t=bwTrail(n,m,rng);E=t.E;trail=t.trail}
    else{for(var tries=0;tries<60&&!E;tries++){t=bwTrail(n,m-1,rng);var dg=bwDeg(n,t.E),ev=[];dg.forEach(function(x,i){if(x%2===0)ev.push(i)});
        if(t.trail[0]===t.trail[t.trail.length-1]||ev.length<2)continue;
        var ps=pzShuffle(ev,rng),a=-1,b=-1;for(var i=0;i<ps.length&&a<0;i++)for(var j=i+1;j<ps.length;j++){var key=Math.min(ps[i],ps[j])+','+Math.max(ps[i],ps[j]);if((t.cnt[key]||0)<2){a=ps[i];b=ps[j];break}}
        if(a<0)continue;E=t.E.concat([[a,b]])}
      if(!E){n=KON.n;E=KON.E.map(function(e){return e.slice()});pos=KON.pos.map(function(p){return p.slice()})}}}
  var odd=bwOdd(n,E);imp=odd>2;if(imp)trail=null;
  return{level:level,title:'Level '+level,n:n,edges:E,pos:pos,par:E.length,impossible:imp,trail:trail,odd:odd}}
/* exhaustive search for an Euler trail continuing from `cur` over the unused edges: an array of edge indices, or null. cur<0 tries every start and returns {start,path}. A null answer is exact. */
function bwFind(n,E,used,cur){var left=0,i;for(i=0;i<E.length;i++)if(!used[i])left++;
  function go(c,l,path){if(!l)return path;var seen={};for(var k=0;k<E.length;k++){if(used[k])continue;var e=E[k],o=e[0]===c?e[1]:e[1]===c?e[0]:-1;if(o<0||seen[o])continue;seen[o]=1;used[k]=1;path.push(k);var r=go(o,l-1,path);used[k]=0;if(r)return r;path.pop()}return null}
  if(cur>=0)return go(cur,left,[]);
  for(i=0;i<n;i++){var r2=go(i,left,[]);if(r2)return{start:i,path:r2}}return null}
function bwSolve(inst){return bwFind(inst.n,inst.edges,inst.edges.map(function(){return 0}),-1)}
PZC3.bw={make:bwMake,solve:bwSolve,find:bwFind,odd:bwOdd,deg:bwDeg};
function mountBw(root,inst,api){
  var w=shell(root,'p3-bw'),n=inst.n,E=inst.edges,pos=inst.pos,deg=bwDeg(n,E),m=E.length,used,hist,cur,steps=0,hints=0,undos=0,wrong=0,fin,counts=false,hl,i,nb=[],
    info=pzEl('p',{class:'p3-info',text:'Tap a land to start there, then tap the next land to cross a bridge to it. Cross every bridge exactly once. If you are sure no such walk exists, press Impossible.'}),
    msg=pzEl('p',{class:'p3-msg',role:'status'}),board=pzEl('div',{class:'p3-board',role:'group','aria-label':'Map with '+n+' lands and '+m+' bridges'}),svg=sv('svg',{viewBox:'0 0 100 100','aria-hidden':'true',focusable:'false'}),
    row=pzEl('div',{class:'p3-row'}),imp=B('Impossible',function(){declare()},{'aria-label':'Say that no walk can cross every bridge exactly once'});
  board.style.paddingBottom='100%';board.appendChild(svg);
  var grp={};E.forEach(function(e,k){var key=Math.min(e[0],e[1])+','+Math.max(e[0],e[1]);(grp[key]=grp[key]||[]).push(k)});
  var geo=E.map(function(e,k){var a=Math.min(e[0],e[1]),b=Math.max(e[0],e[1]),g=grp[a+','+b],j=g.indexOf(k),off=g.length===1?0:(j===0?-1:1)*12,pa=pos[a],pb=pos[b],dx=pb[0]-pa[0],dy=pb[1]-pa[1],L=Math.sqrt(dx*dx+dy*dy)||1,
    cx=(pa[0]+pb[0])/2-dy/L*off,cy=(pa[1]+pb[1])/2+dx/L*off;return{d:'M'+pa[0]+' '+pa[1]+' Q'+r1(cx)+' '+r1(cy)+' '+pb[0]+' '+pb[1],mx:r1(.25*pa[0]+.5*cx+.25*pb[0]),my:r1(.25*pa[1]+.5*cy+.25*pb[1])}});
  function say(t){say2(msg,api,t)}
  function reset(){used=E.map(function(){return 0});hist=[];cur=-1;fin=false;hl=[]}reset();
  function left(i){var c=0;E.forEach(function(e,k){if(!used[k]&&(e[0]===i||e[1]===i))c++});return c}
  function order(k){for(var q=0;q<hist.length;q++)if(hist[q].e===k)return q+1;return 0}
  function paint(){svg.textContent='';
    E.forEach(function(e,k){var o=order(k);if(o){svg.appendChild(sv('path',{d:geo[k].d,class:'p3-eu','stroke-width':'3.4'}));svg.appendChild(sv('circle',{cx:geo[k].mx,cy:geo[k].my,r:'3.1',class:'p3-eb'}));svg.appendChild(sv('text',{x:geo[k].mx,y:r1(geo[k].my+1.5),class:'p3-et'},String(o)))}
      else{svg.appendChild(sv('path',{d:geo[k].d,class:'p3-e0','stroke-width':'3.2'}));svg.appendChild(sv('path',{d:geo[k].d,class:'p3-e1','stroke-width':'1.1'}))}});
    for(var i=0;i<n;i++){var b=nb[i];b.textContent='';b.appendChild(pzEl('span',{'aria-hidden':'true',text:LET.charAt(i)}));if(counts)b.appendChild(pzEl('small',{'aria-hidden':'true',text:String(deg[i])}));
      b.className='p3-node'+(cur===i?' p3-cur':'')+(hist.length&&hist[0].from===i?' p3-st':'')+(hl.indexOf(i)>=0?' p3-hint':'');
      b.setAttribute('aria-label','Land '+LET.charAt(i)+', '+plural(deg[i],'bridge')+(cur>=0?', '+plural(left(i),'unused bridge'):'')+(cur===i?', you are here':'')+(hl.indexOf(i)>=0?', hint':''))}
    imp.disabled=fin}
  function cross(v){var k=-1;for(var q=0;q<E.length;q++){if(used[q])continue;var e=E[q];if((e[0]===cur&&e[1]===v)||(e[1]===cur&&e[0]===v)){k=q;break}}
    if(k<0)return false;used[k]=1;hist.push({e:k,from:cur});cur=v;steps++;hl=[];api.moved();
    if(hist.length===m){fin=true;paint();say('Every bridge crossed once.');api.done({solved:true,moves:steps,hints:hints,undos:undos,extra:{par:m,wrong:wrong,impossible:false}});return true}
    paint();say('Bridge '+hist.length+' of '+m+' crossed. You are at land '+LET.charAt(cur)+(left(cur)?'.':'. No bridges are left here: use Undo.'));return true}
  function tap(v){if(fin)return;hl=[];
    if(cur<0){cur=v;paint();say('Starting at land '+LET.charAt(v)+'. Tap a land to cross a bridge to it.');return}
    if(v===cur){say('You are already at land '+LET.charAt(v)+'.');paint();return}
    if(!cross(v)){say('No unused bridge joins land '+LET.charAt(cur)+' to land '+LET.charAt(v)+'.');paint()}}
  function declare(){if(fin)return;
    if(inst.impossible){fin=true;paint();api.moved();steps=m+wrong;say('Right: no walk can cross every bridge exactly once.');api.done({solved:true,moves:steps,hints:hints,undos:undos,extra:{par:m,wrong:wrong,impossible:true,odd:inst.odd}})}
    else{wrong++;hl=[];say('A walk does exist on this map. Have another go, or ask for a hint.');paint()}}
  for(i=0;i<n;i++)(function(i){var b=pzBtn('',function(){tap(i)},{class:'p3-node','aria-label':'Land '+LET.charAt(i)});b.style.left=pos[i][0]+'%';b.style.top=pos[i][1]+'%';nb.push(b);board.appendChild(b)})(i);
  row.appendChild(imp);w.appendChild(info);w.appendChild(board);w.appendChild(msg);w.appendChild(row);
  say('Pick a land to start.');paint();
  function oddList(){var o=[];deg.forEach(function(x,i){if(x%2)o.push(LET.charAt(i))});return o}
  return{undo:function(){if(fin)return false;if(hist.length){var h=hist.pop();used[h.e]=0;cur=h.from;undos++;hl=[];paint();say('Undone.');return true}
      if(cur>=0){cur=-1;undos++;hl=[];paint();say('Pick a land to start.');return true}return false},
    restart:function(){reset();paint();say('Restarted. Pick a land to start.')},
    moves:function(){return hist.length},
    hint:function(lv){if(fin)return null;hints++;var s,p;
      if(inst.impossible){
        if(lv<=1){counts=true;s='Each land now shows how many bridges touch it. Count the lands with an odd number.'}
        else if(lv===2)s='A walk can begin and end at only two lands with an odd number of bridges. Here '+inst.odd+' lands have an odd number ('+oddList().join(', ')+').';
        else{paint();say('No walk exists, so the answer is Impossible.');declare();return msg.textContent}}
      else if(cur<0){var r=bwSolve(inst);
        if(lv<=1){counts=true;s=inst.odd?'Each land shows its bridges. A walk must start at one of the '+inst.odd+' lands with an odd number: '+oddList().join(' or ')+'.':'Each land shows its bridges. All are even, so a walk can start anywhere and ends where it began.'}
        else if(lv===2){hl=[r.start];s='Start at land '+LET.charAt(r.start)+'.'}
        else{tap(r.start);return msg.textContent}}
      else{p=bwFind(n,E,used,cur);
        if(!p){
          if(lv<3){s='Some bridge would be cut off from this route. Use Undo to step back a little.'}
          else{var undone=0;while(hist.length&&!bwFind(n,E,used,cur)){var h=hist.pop();used[h.e]=0;cur=h.from;undone++}
            if(!bwFind(n,E,used,cur))cur=-1;undos++;hl=[];paint();say('This route could not be finished, so Zest stepped back '+plural(undone,'bridge')+'.');return msg.textContent}}
        else{var e=E[p[0]],to=e[0]===cur?e[1]:e[0];
          if(lv<=1){counts=true;s='Each land now shows its bridges. Do not leave a bridge stranded behind you: some bridges must be saved for later.'}
          else if(lv===2){hl=[to];s='Cross to land '+LET.charAt(to)+' next.'}
          else{cross(to);return msg.textContent}}}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'bridge-walk',name:'Bridge Walk',family:'move',theme:'F7',blurb:'Walk across every bridge exactly once, or spot that you cannot.',
  how:'Tap a land to start, then tap the next land to cross a bridge to it. Cross every bridge exactly once. Some maps have no such walk: then press Impossible.',
  areas:['space','flex'],levels:30,secs:75,make:bwMake,mount:wrap(mountBw),
  stars:function(res,inst){var x=res.extra||{},par=(inst&&inst.par)||x.par||res.moves,m=res.moves,h=res.hints||0,wr=x.wrong||0,s=pzStarsByPar(m,par,h),imp=inst?inst.impossible:x.impossible;if(wr&&s>1)s--;
    return{stars:s,line:imp?'You saw that no walk can cross all '+par+' bridges once: too many lands have an odd number of bridges. '+(wr||h?'It took '+plural(wr,'wrong guess','wrong guesses')+' and '+hintsLine(h)+'.':'No wrong guesses and no hints.')
      :'You crossed all '+par+' bridges once, in '+plural(m,'crossing')+' with '+hintsLine(h)+(wr?' and '+plural(wr,'wrong guess','wrong guesses'):'')+'. The fewest possible is '+par+'.'}}});

/* ================= 2. Dodecahedron Tour ================= */
/* Graphs: the cube and n-gonal prisms (two rings joined by rungs), then the dodecahedron as a flat diagram of 20 corners.
   All of them are vertex-transitive, so a loop through every corner exists from any starting corner; make() finds one by search and stores it as inst.cycle. par = number of corners (the loop has n edges). */
var DT_DOD=[[50,6],[91.8,50.2],[75.9,121.8],[24.1,121.8],[8.2,50.2],[59.4,29.1],[77.7,67.2],[66.1,104.6],[30.8,103.3],[20.8,65.3],[73.2,43.6],[74.5,86.8],[48.1,112.6],[25.1,84.5],[37.9,31.8],[57.3,55.2],[58.9,74.8],[46.3,90.4],[39.5,71.1],[38,51.5]];
function dtGraph(k){var E=[],pos=[],i,n;
  if(k==='dod'){for(i=0;i<5;i++)E.push([i,(i+1)%5],[i,5+i],[5+i,10+i],[5+i,10+(i+4)%5],[10+i,15+i],[15+i,15+(i+1)%5]);return{n:20,E:E,pos:DT_DOD.map(function(p){return[p[0],r1(p[1]+3)]}),H:133,name:'dodecahedron'}}
  n=k;var ro=40,ri=n<=6?22:24;
  for(i=0;i<n;i++){var a=(-90+360*i/n)*Math.PI/180;pos.push([r1(50+ro*Math.cos(a)),r1(50+ro*Math.sin(a))])}
  for(i=0;i<n;i++){var b=(-90+360*i/n)*Math.PI/180;pos.push([r1(50+ri*Math.cos(b)),r1(50+ri*Math.sin(b))])}
  for(i=0;i<n;i++)E.push([i,(i+1)%n],[n+i,n+(i+1)%n],[i,n+i]);
  return{n:2*n,E:E,pos:pos,H:100,name:n===4?'cube':n+'-sided prism'}}
function dtAdj(n,E){var a=seq(n).map(function(){return[]});E.forEach(function(e){a[e[0]].push(e[1]);a[e[1]].push(e[0])});return a}
/* complete a partial path (array of corners) to a cycle through every corner; returns the full path (the closing edge is implied) or null. Exhaustive with a safe pruning rule. */
function dtComplete(adj,n,path){var vis=seq(n).map(function(){return 0}),out=path.slice(),first=path[0];path.forEach(function(v){vis[v]=1});
  function ok(){var c=out[out.length-1];for(var v=0;v<n;v++){if(vis[v])continue;var f=0;adj[v].forEach(function(w){if(!vis[w]||w===c||w===first)f++});if(f<2)return false}return true}
  function go(){if(out.length===n)return adj[out[n-1]].indexOf(first)>=0;var c=out[out.length-1];
    for(var q=0;q<adj[c].length;q++){var w=adj[c][q];if(vis[w])continue;vis[w]=1;out.push(w);if(ok()&&go())return true;out.pop();vis[w]=0}return false}
  return go()?out:null}
function dtKind(level){return level<=4?4:level<=8?5:level<=12?6:level<=16?7:level<=20?8:level<=23?9:'dod'}
function dtForced(level){return level>=24||(level>=6&&level%3===0)}
function dtMake(level,rng){var g=dtGraph(dtKind(level)),adj=dtAdj(g.n,g.E),flip=rng()<.5,flipy=rng()<.5,s0=pzInt(rng,g.n),forced=dtForced(level),cyc=dtComplete(adj,g.n,[forced?s0:0]),
  pos=g.pos.map(function(p){return[flip?r1(100-p[0]):p[0],flipy?r1(g.H-p[1]):p[1]]});
  return{level:level,title:'Level '+level,shape:g.name,n:g.n,edges:g.E,pos:pos,H:g.H,start:forced?s0:-1,cycle:cyc,par:g.n}}
PZC3.dt={make:dtMake,complete:dtComplete,adj:dtAdj,graph:dtGraph,kind:dtKind,forced:dtForced};
function mountDt(root,inst,api){
  var w=shell(root,'p3-dt'),n=inst.n,E=inst.edges,pos=inst.pos,H=inst.H,adj=dtAdj(n,E),path,steps=0,hints=0,undos=0,fin,closed,hl,nb=[],i,
    info=pzEl('p',{class:'p3-info',text:'Visit every corner once and finish back at the first. Tap a corner next to the one you are on. Each corner shows its step number.'}),
    msg=pzEl('p',{class:'p3-msg',role:'status'}),board=pzEl('div',{class:'p3-board',role:'group','aria-label':'Diagram of a '+inst.shape+' with '+n+' corners'}),svg=sv('svg',{viewBox:'0 0 100 '+H,'aria-hidden':'true',focusable:'false'});
  board.style.paddingBottom=H+'%';board.appendChild(svg);
  function say(t){say2(msg,api,t)}
  function reset(){path=inst.start>=0?[inst.start]:[];fin=false;closed=false;hl=[]}reset();
  function nbrs(v){return adj[v].map(function(x){return x+1}).sort(function(a,b){return a-b}).join(', ')}
  function paint(){svg.textContent='';var q;
    E.forEach(function(e){svg.appendChild(sv('line',{x1:pos[e[0]][0],y1:pos[e[0]][1],x2:pos[e[1]][0],y2:pos[e[1]][1],class:'p3-e0','stroke-width':'.7'}))});
    for(q=1;q<path.length+(closed?1:0);q++){var a=path[q-1],b=path[q%path.length];svg.appendChild(sv('line',{x1:pos[a][0],y1:pos[a][1],x2:pos[b][0],y2:pos[b][1],class:'p3-eu','stroke-width':'2.4'}))}
    var cur=path.length?path[path.length-1]:-1;
    for(i=0;i<n;i++){var b2=nb[i],s=path.indexOf(i)+1;b2.textContent='';if(s)b2.appendChild(pzEl('span',{'aria-hidden':'true',text:String(s)}));
      b2.className='p3-node'+(s?' p3-vis':'')+(cur===i&&!closed?' p3-cur':'')+(path.length&&path[0]===i?' p3-st':'')+(hl.indexOf(i)>=0?' p3-hint':'');
      b2.setAttribute('aria-label','Corner '+(i+1)+', joined to corners '+nbrs(i)+(s?', step '+s:', not visited')+(cur===i?', you are here':'')+(path.length&&path[0]===i?', the start':'')+(hl.indexOf(i)>=0?', hint':''))}}
  function tap(v){if(fin)return;hl=[];
    if(!path.length){path=[v];paint();say('Starting at corner '+(v+1)+'. Tap a joined corner.');return}
    var cur=path[path.length-1];
    if(path.length===n&&v===path[0]){if(adj[cur].indexOf(v)<0){say('Corner '+(v+1)+' is not joined to this corner. Use Undo.');paint();return}
      closed=true;steps++;api.moved();fin=true;paint();say('Back at the start: every corner visited once.');api.done({solved:true,moves:steps,hints:hints,undos:undos,extra:{par:n,n:n}});return}
    if(v===cur){say('You are on corner '+(v+1)+' already.');paint();return}
    if(adj[cur].indexOf(v)<0){say('Corner '+(v+1)+' is not joined to corner '+(cur+1)+'. Tap one of its neighbours.');paint();return}
    if(path.indexOf(v)>=0){say(v===path[0]?'Visit the other corners first, then come back here.':'Corner '+(v+1)+' is already visited.');paint();return}
    path.push(v);steps++;api.moved();paint();
    if(path.length===n)say(adj[v].indexOf(path[0])>=0?'All corners visited. Tap the start (corner '+(path[0]+1)+') to close the loop.':'All corners visited, but this one is not next to the start. Use Undo.');
    else say(adj[v].some(function(x){return path.indexOf(x)<0})?'Step '+path.length+' of '+n+'.':'No new corner is joined to this one. Use Undo to step back.')}
  for(i=0;i<n;i++)(function(i){var b=pzBtn('',function(){tap(i)},{class:'p3-node','aria-label':'Corner '+(i+1)});b.style.left=pos[i][0]+'%';b.style.top=(pos[i][1]/H*100)+'%';nb.push(b);board.appendChild(b)})(i);
  w.appendChild(info);w.appendChild(board);w.appendChild(msg);
  say(inst.start>=0?'Start at corner '+(inst.start+1)+'. It is marked.':'Tap any corner to start: a loop exists from every corner.');paint();
  function back(){var k=path.length;while(k>0&&!dtComplete(adj,n,path.slice(0,k)))k--;return k}
  return{undo:function(){if(fin)return false;if(path.length<=(inst.start>=0?1:0))return false;path.pop();undos++;hl=[];paint();say('Undone.');return true},
    restart:function(){reset();paint();say(inst.start>=0?'Restarted. Start at corner '+(inst.start+1)+'.':'Restarted. Tap any corner to start.')},
    moves:function(){return Math.max(0,path.length-1)},
    hint:function(lv){if(fin)return null;hints++;var s,nx;
      if(!path.length){nx=dtComplete(adj,n,[0])[0];
        if(lv<=1){hl=[nx];s='Any corner works as a start: a loop exists from every one. Look at the corner marked ?.'}
        else if(lv===2){hl=[nx];s='Start at corner '+(nx+1)+'.'}
        else{tap(nx);return msg.textContent}
        paint();say(s);return s}
      var comp=dtComplete(adj,n,path);
      if(!comp){var k=Math.max(back(),1),d=path.length-k;
        if(lv<=1)s='This route cannot be finished: some corner has been cut off. Step back a few corners.';
        else if(lv===2){hl=[path[k-1]];s='Undo '+plural(d,'step')+' to return to corner '+(path[k-1]+1)+'.'}
        else{path=path.slice(0,k);undos++;hl=[];paint();say('Stepped back '+plural(d,'corner')+' to a route that can be finished.');return msg.textContent}
        paint();say(s);return s}
      nx=path.length<n?comp[path.length]:path[0];
      if(lv<=1){hl=[nx];s='Look at the corner marked ?. It is next on a loop that can be finished.'}
      else if(lv===2){hl=[nx];s='Go from corner '+(path[path.length-1]+1)+' to corner '+(nx+1)+'.'}
      else{var from=path[path.length-1];tap(nx);s=(fin?'Closed the loop: ':'Moved ')+'from corner '+(from+1)+' to corner '+(nx+1)+'.';say(s);return s}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'dodecahedron-tour',name:'Dodecahedron Tour',family:'move',theme:'F7',blurb:'Visit every corner of a solid once and return to the start.',
  how:'Tap corners one after another along the lines. Visit every corner exactly once, then tap the first corner again to close the loop. Some levels fix the start.',
  areas:['space','flex'],levels:30,secs:120,make:dtMake,mount:wrap(mountDt),
  stars:function(res,inst){var par=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0,s=pzStarsByPar(m,par,h),u=res.undos||0;if(u>3&&s>2)s=2;
    return{stars:s,line:'You closed a loop through all '+par+' corners in '+plural(m,'step')+' with '+hintsLine(h)+(u?' and '+plural(u,'undo'):'')+'. A loop needs exactly '+par+' steps.'}}});

/* ================= 3. Hundred Drawers ================= */
/* N numbered drawers hold slips carrying the numbers 1..N in some order (a permutation fixed by the seed). You are guest p and may open at most floor(N/2) drawers; you win when you open the drawer holding slip p.
   Chain strategy: open drawer p, read its slip v, open drawer v, and so on. The drawers visited are the cycle of the permutation through p, and the last one holds slip p.
   make() builds the permutation so that cycle has length L <= floor(N/2), so the strategy always works. par = L. */
function hdSize(level){return 6+Math.round((level-1)*24/29)}
function hdMake(level,rng){var N=hdSize(level),cap=Math.floor(N/2),lo=Math.max(2,Math.ceil(cap*(0.3+0.5*(level-1)/29))),L=lo+pzInt(rng,cap-lo+1),p=1+pzInt(rng,N),i,
  others=pzShuffle(seq(N).map(function(x){return x+1}).filter(function(x){return x!==p}),rng),cyc=[p].concat(others.slice(0,L-1)),rest=others.slice(L-1),sh=pzShuffle(rest,rng),perm=seq(N+1).map(function(){return 0});
  for(i=0;i<L;i++)perm[cyc[i]]=cyc[(i+1)%L];for(i=0;i<rest.length;i++)perm[rest[i]]=sh[i];
  return{level:level,title:'Level '+level,n:N,cap:cap,mine:p,perm:perm.slice(1),par:L,chain:cyc}}
/* the chain strategy played out: drawers opened until slip p shows (perm is 0-indexed: perm[d-1] is the slip in drawer d) */
function hdChain(perm,p){var d=p,out=[];for(var g=0;g<=perm.length;g++){out.push(d);if(perm[d-1]===p)return out;d=perm[d-1]}return out}
PZC3.hd={make:hdMake,chain:hdChain,size:hdSize};
function drawerSvg(num,slip,open,found){var s=sv('svg',{viewBox:'0 0 40 40','aria-hidden':'true',focusable:'false'});
  s.appendChild(sv('rect',{x:'3',y:open?'14':'5',width:'34',height:open?'20':'30',rx:'3',fill:open?'var(--surface)':'var(--tint)',stroke:'var(--ink)','stroke-width':found?'3':'1.6'}));
  if(open){s.appendChild(sv('path',{d:'M3 14 L9 6 H31 L37 14',fill:'none',stroke:'var(--ink)','stroke-width':'1.6'}));s.appendChild(sv('text',{x:'20',y:'29','font-size':'14'},String(slip)));s.appendChild(sv('text',{x:'20',y:'11','font-size':'7'},'#'+num))}
  else{s.appendChild(sv('rect',{x:'14',y:'27',width:'12',height:'3.2',rx:'1.6',fill:'var(--ink)'}));s.appendChild(sv('text',{x:'20',y:'21','font-size':'12'},String(num)))}
  return s}
function ringSvg(chain){var L=chain.length,svg=sv('svg',{viewBox:'0 0 100 100',class:'p3-ring',role:'img','aria-label':'Your loop: '+chain.join(', then ')+', and back to '+chain[0]}),R=34,i,pt=[],mk=sv('marker',{id:'p3ar',viewBox:'0 0 6 6',refX:'5',refY:'3',markerWidth:'5',markerHeight:'5',orient:'auto'}),df=sv('defs');
  mk.appendChild(sv('path',{d:'M0 0 L6 3 L0 6 z',fill:'var(--ink)'}));df.appendChild(mk);svg.appendChild(df);
  for(i=0;i<L;i++){var a=(-90+360*i/L)*Math.PI/180;pt.push([50+R*Math.cos(a),50+R*Math.sin(a)])}
  var rr=L>14?4.6:L>8?5.6:7;
  for(i=0;i<L;i++){var A=pt[i],Bp=pt[(i+1)%L],dx=Bp[0]-A[0],dy=Bp[1]-A[1],d=Math.sqrt(dx*dx+dy*dy)||1;
    svg.appendChild(sv('line',{x1:r1(A[0]+dx/d*rr),y1:r1(A[1]+dy/d*rr),x2:r1(Bp[0]-dx/d*(rr+1.5)),y2:r1(Bp[1]-dy/d*(rr+1.5)),stroke:'var(--ink)','stroke-width':'1.2','marker-end':'url(#p3ar)'}))}
  for(i=0;i<L;i++){svg.appendChild(sv('circle',{cx:r1(pt[i][0]),cy:r1(pt[i][1]),r:rr,fill:i===0?'var(--accent)':'var(--surface)',stroke:'var(--ink)','stroke-width':i===0?'2':'1.2'}));
    svg.appendChild(sv('text',{x:r1(pt[i][0]),y:r1(pt[i][1]+(L>14?1.6:2.2)),'font-size':L>14?'4.8':L>8?'6':'7.5',style:'fill:'+(i===0?'var(--on-accent)':'var(--ink)')},String(chain[i])))}
  return svg}
function mountHd(root,inst,api){
  var w=shell(root,'p3-hd'),N=inst.n,cap=inst.cap,p=inst.mine,perm=inst.perm,opened,found,fail,steps=0,hints=0,attempts=1,fin,hl,btn=[],i,
    info=pzEl('p',{class:'p3-info',text:'A hotel has '+N+' numbered drawers. Each holds a slip with one guest number. You are guest '+p+'. Open up to '+cap+' drawers and find the slip that says '+p+'.'+(inst.level<=3?' Tip: start with the drawer that has your own number, then open the drawer named on the slip you find.':'')}),
    left=pzEl('p',{class:'p3-prog'}),msg=pzEl('p',{class:'p3-msg',role:'status'}),grid=pzEl('div',{class:'p3-grid',role:'group','aria-label':'Drawers 1 to '+N}),after=pzEl('div',{class:'p3-after'});
  after.style.width='100%';after.style.textAlign='center';
  function say(t){say2(msg,api,t)}
  function reset(){opened=[];found=false;fail=false;fin=false;hl=-1;after.textContent=''}reset();
  function paint(){left.textContent='Your number: '+p+'. Drawers left to open: '+(cap-opened.length)+' of '+cap+'.';
    for(var d=1;d<=N;d++){var b=btn[d-1],o=opened.indexOf(d)>=0,slip=perm[d-1],fd=found&&o&&slip===p;b.textContent='';b.appendChild(drawerSvg(d,slip,o,fd));
      b.className='p3-dr'+(o?' p3-open':'')+(fd?' p3-found':'')+(hl===d?' p3-hint':'');
      b.setAttribute('aria-label','Drawer '+d+(o?', open, the slip says '+slip+(fd?', your number, found':''):', closed')+(hl===d?', hint':''))}}
  function open(d){if(fin||fail||opened.indexOf(d)>=0)return;hl=-1;opened.push(d);steps++;api.moved();var slip=perm[d-1];
    if(slip===p){found=true;fin=true;paint();var ch=hdChain(perm,p);after.textContent='';after.appendChild(pzEl('p',{class:'p3-chain',text:'Following each slip leads round a loop: '+ch.join(' → ')+' → '+ch[0]+'.'}));after.appendChild(ringSvg(ch));
      say('Found it: drawer '+d+' holds slip '+p+'.');api.done({solved:true,moves:steps,hints:hints,undos:0,extra:{par:inst.par,attempts:attempts,n:N,cap:cap}});return}
    if(opened.length>=cap){fail=true;paint();say('That was all '+cap+' opens and slip '+p+' did not turn up. Press Try again: the slips stay where they are.');return}
    paint();say('Drawer '+d+' holds slip '+slip+'. Opens left: '+(cap-opened.length)+'.')}
  for(i=1;i<=N;i++)(function(d){var b=pzBtn('',function(){open(d)},{class:'p3-dr','aria-label':'Drawer '+d});btn.push(b);grid.appendChild(b)})(i);
  w.appendChild(info);w.appendChild(left);w.appendChild(grid);w.appendChild(msg);w.appendChild(after);paint();
  function nextDrawer(){var d=p;for(var g=0;g<=N;g++){if(opened.indexOf(d)<0)return d;if(perm[d-1]===p)return -1;d=perm[d-1]}return -1}
  return{undo:function(){return false},
    restart:function(){if(fin)return;if(opened.length||fail)attempts++;reset();paint();say('Every drawer is closed again. Your number is '+p+'.')},
    moves:function(){return opened.length},
    hint:function(lv){if(fin)return null;if(fail){var z='You used all your opens. Press Try again first.';say(z);return z}hints++;var d=nextDrawer(),s,chainOpen=0;
      for(var g=p,c=0;c<=N&&opened.indexOf(g)>=0;c++){chainOpen++;g=perm[g-1]}
      if(d<0)s='Follow the slips you have seen, starting from drawer '+p+'.';
      else if(lv<=1){hl=d;s=chainOpen?'Look at the drawer marked ?. It is named on the last slip in your chain.':'Look at the drawer marked ?. Your own number is a good place to begin.'}
      else if(lv===2){hl=d;s=chainOpen?'Open drawer '+d+': that is the number on the last slip in your chain.':'Open drawer '+d+': start at the drawer with your own number, then follow each slip.'}
      else{open(d);return msg.textContent}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({undo:false,id:'hundred-drawers',name:'Hundred Drawers',family:'number',theme:'F10',blurb:'Find your number among drawers by following the slips.',
  how:'You are one guest with a number. Tap a drawer to open it and read its slip. You may open only half the drawers. Find the slip that carries your own number. If the opens run out, press Try again.',
  areas:['memory','flex'],levels:30,secs:75,make:hdMake,mount:wrap(mountHd,'try'),
  stars:function(res,inst){var par=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0,a=(res.extra&&res.extra.attempts)||1,s=pzStarsByPar(m,par,h);
    return{stars:s,line:'You found your slip after '+plural(m,'open')+' with '+hintsLine(h)+(a>1?' over '+plural(a,'try','tries'):'')+'. Following the slips from your own drawer takes '+plural(par,'open')+'.'}}});
})();
