/* Zest puzzles, wave 3 builder 5: Dot Loop, Ring Gate Escape, Shadow Clock, Mix to Target.
   Loaded after puzzles_kit.js. Every make(level,rng) is pure (no Math.random, no DOM): the same seed gives the same puzzle on every device.
   Generators and solvers are exposed on PZE5 for tests/pze5_logic.js. mount() returns {undo,hint,restart,moves,destroy}; hint(n) returns the sentence and (level 3) may perform the step.
   Everything is drawn as SVG built in code. All wording is about the puzzle only: no claims about the brain. No audio.
   Extra inst fields:
   dot-loop {R,C,dots[],hollows[],loop[],par}: R x C cells, cell index r*C+c, corner index r*(C+1)+c; loop = the shortest closed loop as corner indexes; par = its length.
   ring-gate-escape {R,S,gates[][],walls[[corridor,sector]],start,par}: R rings, S sectors; gates[c] = sectors open in the ring just inside corridor c; par = shortest number of moves.
   shadow-clock {kind:'eq'|'hz',lat,labels,t,alpha,tol,step,par:1}: t = true minutes after midnight; alpha = shadow angle from the noon line (deg, left is negative).
   mix-to-target {n,ratios[][],a,b,r,tx,ty,eps,par}: two points on a circle of n slots, a share ratio, a target point inside the circle; par = fewest presses.
   shadow-clock has no undo (undo:false); its toolbar is Hint + Try again. Container: any width from 280 px, height grows. */
var PZE5={};
(function(){
var UID=0;
var CSS='.e5{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.e5 *{box-sizing:border-box}'
+'.e5-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.e5-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.e5-prog{margin:0;font-weight:700;font-size:1rem;text-align:center;overflow-wrap:anywhere}'
+'.e5-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.e5-btn{position:relative;min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer}'
+'.e5-btn:disabled{background:var(--dis-bg);color:var(--dis-ink);border-color:var(--dis-bg);cursor:default}'
+'.e5-btn.e5-hint{outline:3px dashed var(--ink);outline-offset:2px}'
+'.e5-btn.e5-hint::before{content:"?";position:absolute;top:-14px;right:2px;font:800 .75rem var(--font);color:var(--ink)}'
+'.e5-svg{width:100%;max-width:340px;height:auto;display:block}'
+'.e5-svg text{font-family:var(--font);font-weight:800;fill:var(--ink);text-anchor:middle}'
+'.e5-dlb{position:relative;display:grid;width:100%}'
+'.e5-dls{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible}'
+'.e5-vx{position:relative;aspect-ratio:1/1;min-width:48px;min-height:48px;padding:0;margin:0;border:0;background:transparent;cursor:pointer}'
+'.e5-vx::after{content:"";position:absolute;left:50%;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:var(--muted)}'
+'.e5-vx.e5-on::after{background:var(--ink)}'
+'.e5-vx.e5-st::after{width:20px;height:20px;margin:-10px 0 0 -10px;background:var(--surface);border:4px double var(--ink)}'
+'.e5-vx.e5-end::after{width:22px;height:22px;margin:-11px 0 0 -11px;background:var(--accent);border:3px solid var(--ink)}'
+'.e5-vx.e5-hint{outline:3px dashed var(--ink);outline-offset:-6px;border-radius:50%}'
+'.e5-vx.e5-hint::before{content:"?";position:absolute;top:2px;left:50%;margin-left:-4px;font:800 .75rem var(--font);color:var(--ink)}'
+'.e5-rg{display:flex;flex-wrap:wrap;gap:6px;width:100%}.e5-rg>.e5-btn{flex:1 1 130px;max-width:100%;overflow-wrap:anywhere}'
+'.e5-sl{width:100%;min-height:48px;margin:0;accent-color:var(--accent)}'
+'.e5-sw{display:flex;gap:8px;width:100%}.e5-sw>div{flex:1 1 0;min-width:0;border:2px solid var(--ink);border-radius:var(--r1);padding:8px;text-align:center;font-size:.875rem;font-weight:700;line-height:1.35;background:var(--surface);color:var(--ink)}'
+'.e5-sw i{display:flex;align-items:center;justify-content:center;height:44px;margin-bottom:4px;border-radius:6px;border:2px solid var(--ink);font-style:normal;font-size:1.5rem;font-weight:800;color:#fff;text-shadow:0 0 3px #000,0 0 3px #000}'
+'.phone.rm .e5 *,.phone.rm .e5 *::before{transition:none!important;animation:none!important}'
+'@media (prefers-reduced-motion:reduce){.e5 *,.e5 *::before{transition:none!important;animation:none!important}}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pze5-css'))return;var s=document.createElement('style');s.id='pze5-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function B(txt,fn,at){at=at||{};at.class='e5-btn '+(at.class||'');return pzBtn(txt,fn,at)}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'e5 '+cls});root.appendChild(w);return w}
function plural(n,w,pl){return n+' '+(n===1?w:(pl||w+'s'))}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
var NS='http://www.w3.org/2000/svg';
function sv(tag,at,txt){var e=document.createElementNS(NS,tag);Object.keys(at||{}).forEach(function(k){e.setAttribute(k,at[k])});if(txt!==undefined)e.textContent=txt;return e}
function r1(x){return Math.round(x*10)/10}
function r2(x){return Math.round(x*100)/100}
function say2(msg,api,t){msg.textContent=t;if(api.say)api.say(t)}
/* shared: delays done() by 350 ms, adds the toolbar (Undo/Hint/Restart, or Hint/Try again when kind==='try'), mutes the page's own live regions when api.say exists */
function wrap(m,kind){return function(root,inst,api){var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'e5-row e5-bar'}),w=root.firstChild;
    if(kind!=='try')bar.appendChild(B('Undo',function(){lv=0;c.undo()},{'aria-label':'Undo'}));
    bar.appendChild(B('Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)},{'aria-label':'Hint'}));
    bar.appendChild(kind==='try'?B('Try again',function(){lv=0;c.restart()},{'aria-label':'Try again from the start'}):B('Restart',function(){lv=0;c.restart()},{'aria-label':'Restart this level'}));
    if(w)w.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,moves:c.moves,destroy:function(){clearTimeout(tm);c.destroy()}}}}

/* ================= 1. Dot Loop ================= */
/* A grid of R x C cells sits between (R+1) x (C+1) corners. You draw one closed loop along the grid lines (corner to neighbouring corner, never crossing or touching itself).
   Cells carry clues: a filled dot must be INSIDE the loop, an empty ring must be OUTSIDE. Score: loop length; par = the shortest loop that satisfies every clue.
   A simple closed loop is exactly the boundary of a set of cells that is 4-connected, has no hole and has no two cells touching only at a corner. make() grows such a set at random, picks clues from it, then
   searches every set that fits the clues (at most 2^16 sets) for the smallest perimeter, so par is exact. */
function dlValid(m,R,C){var W=C+2,H=R+2,g=[],i,r,c,cnt=0,first=-1;
  for(i=0;i<W*H;i++)g.push(0);
  for(r=0;r<R;r++)for(c=0;c<C;c++)if(m>>(r*C+c)&1){g[(r+1)*W+c+1]=1;cnt++;if(first<0)first=(r+1)*W+c+1}
  if(!cnt)return false;
  for(r=0;r<H-1;r++)for(c=0;c<W-1;c++){var a=g[r*W+c],b=g[r*W+c+1],cc=g[(r+1)*W+c],d=g[(r+1)*W+c+1];if(a===d&&b===cc&&a!==b)return false}
  function flood(s,v){var seen={},q=[s],n=0;seen[s]=1;while(q.length){var x=q.pop();n++;var xr=Math.floor(x/W),xc=x%W,nb=[];
    if(xr>0)nb.push(x-W);if(xr<H-1)nb.push(x+W);if(xc>0)nb.push(x-1);if(xc<W-1)nb.push(x+1);
    for(var k=0;k<nb.length;k++)if(!seen[nb[k]]&&g[nb[k]]===v){seen[nb[k]]=1;q.push(nb[k])}}return n}
  return flood(first,1)===cnt&&flood(0,0)===W*H-cnt}
function dlPerim(m,R,C){var p=0,r,c;for(r=0;r<R;r++)for(c=0;c<C;c++)if(m>>(r*C+c)&1){
  if(r===0||!(m>>((r-1)*C+c)&1))p++;if(r===R-1||!(m>>((r+1)*C+c)&1))p++;if(c===0||!(m>>(r*C+c-1)&1))p++;if(c===C-1||!(m>>(r*C+c+1)&1))p++}return p}
function dlSolve(R,C,D,X){var all=(1<<(R*C))-1,free=all&~D&~X,sub=free,best=1e9,bm=-1;
  for(;;){var m=D|sub,p=dlPerim(m,R,C);if(p<best&&dlValid(m,R,C)){best=p;bm=m}if(!sub)break;sub=(sub-1)&free}
  return{mask:bm,perim:best}}
function dlTrace(m,R,C){var Cv=C+1,adj={},ins=function(r,c){return r>=0&&c>=0&&r<R&&c<C&&(m>>(r*C+c)&1)===1},r,c;
  function add(a,b){(adj[a]=adj[a]||[]).push(b);(adj[b]=adj[b]||[]).push(a)}
  for(r=0;r<=R;r++)for(c=0;c<C;c++)if(ins(r-1,c)!==ins(r,c))add(r*Cv+c,r*Cv+c+1);
  for(r=0;r<R;r++)for(c=0;c<=C;c++)if(ins(r,c-1)!==ins(r,c))add(r*Cv+c,(r+1)*Cv+c);
  var start=Math.min.apply(null,Object.keys(adj).map(Number)),loop=[start],prev=-1,cur=start;
  for(;;){var nx=adj[cur].filter(function(v){return v!==prev}).sort(function(a,b){return a-b})[0];if(prev<0)nx=adj[cur].slice().sort(function(a,b){return a-b})[0];
    if(nx===start)break;loop.push(nx);prev=cur;cur=nx}
  return loop}
/* which cells lie inside a closed loop of corners (ray to the left, parity of vertical edges) */
function dlInside(R,C,loop){var Cv=C+1,vert={},n=loop.length,i,r,c,out=[];
  for(i=0;i<n;i++){var a=loop[i],b=loop[(i+1)%n];if(a%Cv===b%Cv)vert[Math.min(Math.floor(a/Cv),Math.floor(b/Cv))+','+(a%Cv)]=1}
  for(r=0;r<R;r++)for(c=0;c<C;c++){var k=0;for(var x=0;x<=c;x++)if(vert[r+','+x])k++;if(k%2)out.push(r*C+c)}
  return out}
function dlSize(level){return level<=4?[2,3]:level<=10?[3,3]:level<=16?[3,4]:[4,4]}
function dlMake(level,rng){var sz=dlSize(level),R=sz[0],C=sz[1],cells=R*C,frac=0.9-0.6*(level-1)/29,att,i;
  for(att=0;att<80;att++){
    var m=1<<pzInt(rng,cells),k=Math.max(2,Math.round(cells*(0.35+0.3*rng()))),size=1,tries=0;
    while(size<k&&tries++<cells*6){var cand=[];for(i=0;i<cells;i++)if(!(m>>i&1)){var r=Math.floor(i/C),c=i%C;
      if((r>0&&(m>>(i-C)&1))||(r<R-1&&(m>>(i+C)&1))||(c>0&&(m>>(i-1)&1))||(c<C-1&&(m>>(i+1)&1)))cand.push(i)}
      if(!cand.length)break;m|=1<<cand[pzInt(rng,cand.length)];size++}
    if(!dlValid(m,R,C))continue;
    var inside=[],outside=[];for(i=0;i<cells;i++)(m>>i&1?inside:outside).push(i);inside=pzShuffle(inside,rng);outside=pzShuffle(outside,rng);
    var nclue=Math.max(2,Math.round(cells*frac)),nd=Math.min(inside.length,Math.max(1,Math.ceil(nclue*0.6))),nx=Math.min(outside.length,nclue-nd),D=0,X=0;
    for(i=0;i<nd;i++)D|=1<<inside[i];for(i=0;i<nx;i++)X|=1<<outside[i];
    var s=dlSolve(R,C,D,X),loop=dlTrace(s.mask,R,C);
    var dots=[],hol=[];for(i=0;i<cells;i++){if(D>>i&1)dots.push(i);if(X>>i&1)hol.push(i)}
    return{level:level,title:'Level '+level,R:R,C:C,dots:dots,hollows:hol,loop:loop,par:loop.length}}
  var full=(1<<cells)-1,lp=dlTrace(full,R,C);return{level:level,title:'Level '+level,R:R,C:C,dots:[0],hollows:[],loop:lp,par:lp.length}}
PZE5.dl={make:dlMake,solve:dlSolve,inside:dlInside,valid:dlValid,perim:dlPerim,trace:dlTrace};
function mountDl(root,inst,api){
  var w=shell(root,'e5-dl'),R=inst.R,C=inst.C,Rv=R+1,Cv=C+1,path=[],closed=false,fin=false,hints=0,undos=0,hl=-1,btns=[],i,
    info=pzEl('p',{class:'e5-info',text:'Tap corners one after another to draw one closed loop along the lines. Every filled dot must end up inside the loop and every empty ring outside it. Shorter loops score better.'}),
    key=pzEl('p',{class:'e5-info',text:'Key: filled dot = inside the loop. Empty ring = outside the loop.'}),
    len=pzEl('p',{class:'e5-prog'}),msg=pzEl('p',{class:'e5-msg',role:'status'}),
    board=pzEl('div',{class:'e5-dlb',role:'group','aria-label':'Grid of '+Rv+' rows by '+Cv+' columns of corners'}),svg=sv('svg',{viewBox:'0 0 '+Cv+' '+Rv,'aria-hidden':'true',focusable:'false',class:'e5-dls'});
  board.style.maxWidth=(Cv*76)+'px';board.style.gridTemplateColumns='repeat('+Cv+',1fr)';
  function say(t){say2(msg,api,t)}
  function segs(){return closed?path.length:Math.max(0,path.length-1)}
  function nm(v){return 'row '+(Math.floor(v/Cv)+1)+', column '+(v%Cv+1)}
  function cellName(c){return 'row '+(Math.floor(c/C)+1)+', column '+(c%C+1)}
  function adjV(a,b){return Math.abs(Math.floor(a/Cv)-Math.floor(b/Cv))+Math.abs(a%Cv-b%Cv)===1}
  function paint(){svg.textContent='';var pts=path.map(function(v){return (v%Cv+.5)+','+(Math.floor(v/Cv)+.5)});
    if(closed)svg.appendChild(sv('polygon',{points:pts.join(' '),fill:'var(--tint)',stroke:'none'}));
    if(path.length>1)svg.appendChild(sv(closed?'polygon':'polyline',{points:pts.join(' '),fill:'none',stroke:'var(--accent)','stroke-width':'.13','stroke-linejoin':'round','stroke-linecap':'round'}));
    inst.dots.forEach(function(c){svg.appendChild(sv('circle',{cx:c%C+1,cy:Math.floor(c/C)+1,r:'.17',fill:'var(--ink)'}))});
    inst.hollows.forEach(function(c){svg.appendChild(sv('circle',{cx:c%C+1,cy:Math.floor(c/C)+1,r:'.17',fill:'var(--surface)',stroke:'var(--ink)','stroke-width':'.06'}))});
    for(var v=0;v<Rv*Cv;v++){var b=btns[v],on=path.indexOf(v)>=0,end=path.length&&v===path[path.length-1]&&!closed,st=path.length&&v===path[0];
      b.className='e5-vx'+(on?' e5-on':'')+(st?' e5-st':'')+(end?' e5-end':'')+(hl===v?' e5-hint':'');
      b.setAttribute('aria-label','Corner '+nm(v)+(st?', start of your line':end?', end of your line':on?', on your line':'')+(hl===v?', hint':'')+(closed&&st?', loop closed':''))}
    len.textContent=path.length?'Loop length so far: '+segs()+(closed?' (closed)':''):'Tap any corner to start.'}
  function check(){var ins=dlInside(R,C,path),i2;
    for(i2=0;i2<inst.dots.length;i2++)if(ins.indexOf(inst.dots[i2])<0)return 'The loop leaves the filled dot at '+cellName(inst.dots[i2])+' outside. Undo and try again.';
    for(i2=0;i2<inst.hollows.length;i2++)if(ins.indexOf(inst.hollows[i2])>=0)return 'The empty ring at '+cellName(inst.hollows[i2])+' is inside the loop. It should be outside. Undo and try again.';
    return ''}
  function tap(v){if(fin)return;hl=-1;
    if(closed){say('The loop is closed. Press Undo to change it.');paint();return}
    if(!path.length){path=[v];paint();say('Started at corner '+nm(v)+'.');return}
    var last=path[path.length-1];
    if(v===last){say('Your line ends here. Tap a neighbouring corner.');return}
    if(!adjV(last,v)){say('Tap a corner right next to the end of your line.');return}
    if(path.length>=2&&v===path[path.length-2]){path.pop();undos++;paint();say('Stepped back to corner '+nm(v)+'.');return}
    if(v===path[0]&&path.length>=4){closed=true;api.moved();var bad=check();paint();
      if(!bad){fin=true;say('Loop closed. Every clue fits.');api.done({solved:true,moves:segs(),hints:hints,undos:undos,extra:{par:inst.par}})}else say(bad);return}
    if(path.indexOf(v)>=0){say('A loop cannot touch itself. Pick another corner or press Undo.');return}
    path.push(v);api.moved();paint();say('Line to corner '+nm(v)+'. Length '+segs()+'.')}
  for(i=0;i<Rv*Cv;i++)(function(v){var b=pzBtn('',function(){tap(v)},{class:'e5-vx','aria-label':'Corner '+nm(v)});btns.push(b);board.appendChild(b)})(i);
  board.appendChild(svg);w.appendChild(info);w.appendChild(key);w.appendChild(len);w.appendChild(board);w.appendChild(msg);paint();
  /* where does the current line sit relative to the stored shortest loop? */
  function plan(){var L=inst.loop,n=L.length,best=null;if(!path.length)return{start:L[0]};
    var i0=L.indexOf(path[0]);if(i0>=0)[1,-1].forEach(function(d){var m=0;while(m<path.length&&L[((i0+d*m)%n+n)%n]===path[m])m++;if(!best||m>best.m)best={m:m,d:d,i0:i0}});
    if(best&&best.m===path.length&&!closed)return{next:L[(((best.i0+best.d*path.length)%n)+n)%n]};
    return{back:best?best.m:0}}
  function dirWord(a,b){var dr=Math.floor(b/Cv)-Math.floor(a/Cv),dc=b%Cv-a%Cv;return dr<0?'up':dr>0?'down':dc<0?'left':'right'}
  return{undo:function(){if(fin)return false;if(closed){closed=false;undos++;paint();say('Reopened the loop.');return true}
      if(!path.length)return false;path.pop();undos++;hl=-1;paint();say('Undone.');return true},
    restart:function(){path=[];closed=false;hl=-1;paint();say('Restarted. Tap any corner to start.')},
    moves:function(){return segs()},
    hint:function(lv){if(fin)return null;hints++;var p=plan(),s;
      if(p.start!==undefined){if(lv<=1){hl=p.start;s='Look at the corner marked ?. It is a good place to start.'}else if(lv===2){hl=p.start;s='Start at corner '+nm(p.start)+'.'}else{tap(p.start);return msg.textContent}paint();say(s);return s}
      if(p.back!==undefined){var k=p.back,d=path.length-k;
        if(lv<=1){hl=k?path[k-1]:-1;s='This line is not part of the shortest loop. Step back '+plural(d,'corner')+'.'}
        else if(lv===2){hl=k?path[k-1]:-1;s=k?'Undo until your line ends at corner '+nm(path[k-1])+'.':'Press Restart and begin again.'}
        else{path=path.slice(0,k);closed=false;undos++;hl=-1;paint();s='Stepped back to a line that fits the shortest loop.';say(s);return s}
        paint();say(s);return s}
      var nx=p.next,last=path[path.length-1];
      if(lv<=1){hl=nx;s='Look at the corner marked ?. It comes next on the shortest loop.'}
      else if(lv===2){hl=nx;s='From corner '+nm(last)+', go '+dirWord(last,nx)+' one step to corner '+nm(nx)+'.'}
      else{tap(nx);return msg.textContent}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({undo:true,id:'dot-loop',name:'Dot Loop',family:'grid',theme:'F7',blurb:'Draw one closed loop around the dots, keeping the rings outside.',
  how:'Tap corners one after another to draw a single closed loop along the lines. Filled dots must be inside the loop and empty rings outside. Tap the first corner again to close it. The shortest loop scores best.',
  areas:['space','flex'],levels:30,secs:90,make:dlMake,mount:wrap(mountDl),
  stars:function(res,inst){var par=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0,s=pzStarsByPar(m,par,h);
    return{stars:s,line:'Your loop is '+m+' steps long, with '+hintsLine(h)+'. The shortest loop that fits every clue is '+par+' steps.'}}});

/* ================= 2. Ring Gate Escape ================= */
/* R concentric rings, each cut into S sectors. Ring k has gaps (gates) in some sectors. You stand in a corridor between rings at some sector; one move = turn one sector round the corridor (unless a wall stands there),
   go IN through a gate in the ring just inside you (same sector), or go OUT through the gate of the ring just outside you. Reach the centre. par = fewest moves (breadth-first search).
   gates[c] = sectors open in the ring between corridor c and corridor c+1 (corridor R-1 touches the centre); walls = [corridor, a]: wall between sector a and a+1 in that corridor. Corridor 0 is outside all rings. */
function rgParams(level){return{R:level<=6?3:level<=14?4:level<=22?5:6,S:level<=10?8:level<=20?10:12,g:level<=8?1:2,w:Math.floor((level-1)/2.5)}}
function rgWalls(arr){var o={};arr.forEach(function(x){o[x[0]+','+x[1]]=1});return o}
function rgDist(R,S,G,W){var d=[],c,s,q=[];for(c=0;c<R;c++){d.push([]);for(s=0;s<S;s++)d[c].push(-1)}
  function blocked(cc,ss,dir){var a=dir>0?ss:(ss-1+S)%S;return !!W[cc+','+a]}
  for(s=0;s<S;s++)if(G[R-1].indexOf(s)>=0){d[R-1][s]=1;q.push([R-1,s])}
  for(var h=0;h<q.length;h++){var cur=q[h],cc=cur[0],ss=cur[1],nb=[];
    if(!blocked(cc,ss,1))nb.push([cc,(ss+1)%S]);if(!blocked(cc,ss,-1))nb.push([cc,(ss-1+S)%S]);
    if(cc+1<R&&G[cc].indexOf(ss)>=0)nb.push([cc+1,ss]);if(cc>=1&&G[cc-1].indexOf(ss)>=0)nb.push([cc-1,ss]);
    nb.forEach(function(n){if(d[n[0]][n[1]]<0){d[n[0]][n[1]]=d[cc][ss]+1;q.push(n)}})}
  return d}
function rgMake(level,rng){var p=rgParams(level),R=p.R,S=p.S,best=null,att,c,s,i;
  for(att=0;att<80;att++){var G=[],W=[],used={};
    for(c=0;c<R;c++)G.push(pzShuffle(seq(S),rng).slice(0,p.g).sort(function(a,b){return a-b}));
    for(i=0;i<p.w;i++){var wc=pzInt(rng,R),wa=pzInt(rng,S);if(!used[wc+','+wa]){used[wc+','+wa]=1;W.push([wc,wa])}}
    var d=rgDist(R,S,G,rgWalls(W)),ok=[];for(s=0;s<S;s++)if(d[0][s]>0)ok.push(s);if(!ok.length)continue;
    var st=ok[pzInt(rng,ok.length)],par=d[0][st],lo=R+Math.min(4,Math.floor(level/6));
    if(!best||par>best.par)best={G:G,W:W,st:st,par:par};if(par>=lo)break}
  if(!best){var G0=[];for(c=0;c<R;c++)G0.push([0]);var d0=rgDist(R,S,G0,{});best={G:G0,W:[],st:S-1,par:d0[0][S-1]}}
  return{level:level,title:'Level '+level,R:R,S:S,gates:best.G,walls:best.W,start:best.st,par:best.par}}
var RG_ACT=['Turn anticlockwise','Turn clockwise','Go in','Go out'];
/* apply an action to (c,s): returns {c,s,goal} or {err} */
function rgStep(inst,c,s,act){var S=inst.S,R=inst.R,W=rgWalls(inst.walls),G=inst.gates;
  if(act===1||act===0){var dir=act===1?1:-1,a=dir>0?s:(s-1+S)%S;if(W[c+','+a])return{err:'A wall stands in the way here.'};return{c:c,s:(s+dir+S)%S}}
  if(act===2){if(G[c].indexOf(s)<0)return{err:'The ring ahead is closed at this sector. Turn until you face a gap.'};if(c+1>=R)return{c:R,s:0,goal:true};return{c:c+1,s:s}}
  if(c<1)return{err:'You are already outside every ring.'};if(G[c-1].indexOf(s)<0)return{err:'The ring behind you is closed at this sector.'};return{c:c-1,s:s}}
function rgPath(inst,from){var d=rgDist(inst.R,inst.S,inst.gates,rgWalls(inst.walls)),c=from?from[0]:0,s=from?from[1]:inst.start,out=[];
  for(var g=0;g<200;g++){var here=d[c][s],found=false;if(here<0)return null;
    for(var a=0;a<4&&!found;a++){var r=rgStep(inst,c,s,a);if(r.err)continue;if(r.goal){if(here===1){out.push(a);return out}continue}
      if(d[r.c][r.s]===here-1){out.push(a);c=r.c;s=r.s;found=true}}
    if(!found)return null}return null}
PZE5.rg={make:rgMake,dist:rgDist,path:rgPath,step:rgStep,actions:RG_ACT,params:rgParams};
function mountRg(root,inst,api){
  var w=shell(root,'e5-rg0'),R=inst.R,S=inst.S,c=0,s=inst.start,hist=[],fin=false,hints=0,undos=0,hl=null,bt=[],
    info=pzEl('p',{class:'e5-info',text:'Reach the centre. Turn round the corridor until you face a gap in the ring ahead, then go in. Walls (short thick bars) block the way along a corridor.'}),
    pos=pzEl('p',{class:'e5-prog'}),msg=pzEl('p',{class:'e5-msg',role:'status'}),
    svg=sv('svg',{viewBox:'-10 -10 220 220',class:'e5-svg',role:'img','aria-label':'Concentric rings with gaps. Your marker is in a corridor. The centre is the goal.'}),
    grid=pzEl('div',{class:'e5-rg',role:'group','aria-label':'Moves'});
  function say(t){say2(msg,api,t)}
  function ringR(k){return 86-(k-1)*(70/R)}
  function ang(sec){return(-90+sec*360/S)*Math.PI/180}
  function xy(a,r){return[100+r*Math.cos(a),100+r*Math.sin(a)]}
  function tokR(cc){return cc>=R?0:cc===0?ringR(1)+9:(ringR(cc)+ringR(cc+1))/2}
  function paint(){svg.textContent='';var half=Math.PI/S,k,sec,p;
    svg.appendChild(sv('circle',{cx:100,cy:100,r:r1(ringR(R)-3),fill:'var(--tint)',stroke:'var(--ink)','stroke-width':'1.5','stroke-dasharray':'3 2'}));
    svg.appendChild(sv('text',{x:100,y:103,'font-size':R>=5?'8':'9'},'Centre'));
    for(k=1;k<=R;k++){var rr=ringR(k);for(sec=0;sec<S;sec++){if(inst.gates[k-1].indexOf(sec)>=0){
        [ang(sec)-half,ang(sec)+half].forEach(function(a){var q=xy(a,rr);svg.appendChild(sv('circle',{cx:r1(q[0]),cy:r1(q[1]),r:'1.8',fill:'var(--ink)'}))});continue}
      var a1=xy(ang(sec)-half,rr),a2=xy(ang(sec)+half,rr);
      svg.appendChild(sv('path',{d:'M'+r1(a1[0])+' '+r1(a1[1])+' A'+r1(rr)+' '+r1(rr)+' 0 0 1 '+r1(a2[0])+' '+r1(a2[1]),fill:'none',stroke:'var(--ink)','stroke-width':'3','stroke-linecap':'round'}))}}
    inst.walls.forEach(function(wl){var cc=wl[0],a=ang(wl[1])+half,ro=cc===0?ringR(1)+15:ringR(cc),ri=cc+1>=R?ringR(R):ringR(cc+1),p1=xy(a,ro-1.5),p2=xy(a,ri+1.5);
      svg.appendChild(sv('line',{x1:r1(p1[0]),y1:r1(p1[1]),x2:r1(p2[0]),y2:r1(p2[1]),stroke:'var(--accent)','stroke-width':'3.4','stroke-linecap':'square'}));
      svg.appendChild(sv('line',{x1:r1(p1[0]),y1:r1(p1[1]),x2:r1(p2[0]),y2:r1(p2[1]),stroke:'var(--ink)','stroke-width':'1','stroke-linecap':'square'}))});
    for(sec=0;sec<S;sec++){p=xy(ang(sec),ringR(1)+22);svg.appendChild(sv('text',{x:r1(p[0]),y:r1(p[1]+2.5),'font-size':'7'},String(sec+1)))}
    if(hl){p=hl.c>=R?[100,100]:xy(ang(hl.s),tokR(hl.c));svg.appendChild(sv('circle',{cx:r1(p[0]),cy:r1(p[1]),r:'7.5',fill:'none',stroke:'var(--ink)','stroke-width':'1.6','stroke-dasharray':'3 2'}));svg.appendChild(sv('text',{x:r1(p[0]),y:r1(p[1]-9),'font-size':'8'},'?'))}
    p=xy(ang(s),tokR(c));svg.appendChild(sv('circle',{cx:r1(p[0]),cy:r1(p[1]),r:'4.6',fill:'var(--accent)',stroke:'var(--ink)','stroke-width':'1.8'}));
    svg.appendChild(sv('circle',{cx:r1(p[0]),cy:r1(p[1]),r:'1.4',fill:'var(--ink)'}));
    if(c>=R){pos.textContent='You are in the centre.'}else{
      var gs=inst.gates[c].map(function(x){return x+1});
      pos.textContent='Corridor '+(c+1)+' of '+R+', sector '+(s+1)+' of '+S+'. Gap in the ring ahead: sector'+(gs.length>1?'s ':' ')+gs.join(', ')+'.'}
    bt.forEach(function(b,ix){b.className='e5-btn'+(hl&&hl.act===ix?' e5-hint':'')})}
  function go(act){if(fin)return false;hl=null;var r=rgStep(inst,c,s,act);if(r.err){say(r.err);paint();return false}
    hist.push([c,s,act]);api.moved();
    if(r.goal){fin=true;c=R;paint();say('You reached the centre.');api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}});return true}
    c=r.c;s=r.s;paint();say(RG_ACT[act]+'. Now in corridor '+(c+1)+', sector '+(s+1)+'.');return true}
  RG_ACT.forEach(function(t,ix){var b=B(t,function(){go(ix)},{});bt.push(b);grid.appendChild(b)});
  w.appendChild(info);w.appendChild(svg);w.appendChild(pos);w.appendChild(grid);w.appendChild(msg);paint();
  function onKey(e){var k=e.key;if(fin)return;
    if(k==='ArrowLeft'){e.preventDefault();go(0)}else if(k==='ArrowRight'){e.preventDefault();go(1)}else if(k==='ArrowDown'){e.preventDefault();go(2)}else if(k==='ArrowUp'){e.preventDefault();go(3)}}
  root.addEventListener('keydown',onKey);
  function nextAct(){var p=rgPath(inst,[c,s]);return p?p[0]:-1}
  return{undo:function(){if(fin||!hist.length)return false;var h=hist.pop();c=h[0];s=h[1];undos++;hl=null;paint();say('Undone.');return true},
    restart:function(){hist=[];c=0;s=inst.start;hl=null;paint();say('Restarted at the outside, sector '+(s+1)+'.')},
    moves:function(){return hist.length},
    hint:function(lv){if(fin)return null;hints++;var a=nextAct(),sx,r;if(a<0){sx='No route from here: press Restart.';say(sx);return sx}
      if(lv<=1){r=rgStep(inst,c,s,a);hl={c:r.goal?R:r.c,s:r.goal?0:r.s,act:a};sx='Look at the dashed circle marked ?, and the button marked ?. They show the next move on a shortest route.'}
      else if(lv===2){hl={c:c,s:s,act:a};sx='Next, press: '+RG_ACT[a]+'.'}
      else{go(a);return msg.textContent}
      paint();say(sx);return sx},
    destroy:function(){root.removeEventListener('keydown',onKey);root.textContent=''}}}
registerPuzzle({undo:true,id:'ring-gate-escape',name:'Ring Gate Escape',family:'move',theme:'F7',blurb:'Find a route through the gaps in a set of rings to reach the centre.',
  how:'Turn round the corridor to face a gap in the ring ahead, then go in. Repeat ring by ring until you reach the centre. Short walls block the way along a corridor. The fewest moves scores best.',
  areas:['space','control'],levels:30,secs:100,make:rgMake,mount:wrap(mountRg),
  stars:function(res,inst){var par=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0,s=pzStarsByPar(m,par,h),u=res.undos||0;if(u>3&&s>2)s=2;
    return{stars:s,line:'You reached the centre in '+plural(m,'move')+' with '+hintsLine(h)+(u?' and '+plural(u,'undo'):'')+'. The shortest route takes '+plural(par,'move')+'.'}}});

/* ================= 3. Shadow Clock ================= */
/* A plan view of a flat dial. A pole at the centre casts a shadow across hour lines; you move a time marker until its hand lies along the shadow, then press Check.
   True solar time t (minutes after midnight, 7:00 to 17:00 range). Shadow angle from the noon line (left negative): 'eq' dial (hour lines evenly spaced): alpha = 15 deg per hour from noon;
   'hz' dial (flat dial at latitude lat): alpha = atan(sin(lat) * tan(15 deg * hours from noon)). The answer is computed in advance; Check passes when |marker - t| <= tol minutes. par = 1 check.
   Levels 1-10 even dial, 11-20 flat dial with numbered hours, 21-30 flat dial with unnumbered lines. The dial is an invented one: no real place, height or date is stated. */
function scAlpha(kind,lat,t){var hr=(t-720)/60;if(kind==='eq')return 15*hr;return Math.atan(Math.sin(lat*Math.PI/180)*Math.tan(15*hr*Math.PI/180))*180/Math.PI}
function scTol(l){return l<=5?30:l<=15?15:l<=20?10:5}
function scStep(l){return l<=10?15:5}
function scFmt(t){var h=Math.floor(t/60),m=t%60,ap=h>=12?'pm':'am',h12=h%12||12;return h12+':'+('0'+m).slice(-2)+' '+ap}
function scMake(level,rng){var step=scStep(level),lat=[20,30,40,50][pzInt(rng,4)],kind=level<=10?'eq':'hz',c=[],t;
  for(t=480;t<=960;t+=step)if(Math.abs(t-720)>60)c.push(t);t=c[pzInt(rng,c.length)];
  return{level:level,title:'Level '+level,kind:kind,lat:lat,labels:level<=20,t:t,alpha:r2(scAlpha(kind,lat,t)),tol:scTol(level),step:step,par:1}}
PZE5.sc={make:scMake,alpha:scAlpha,fmt:scFmt,tol:scTol,step:scStep};
function mountSc(root,inst,api){
  var w=shell(root,'e5-sc'),val=720,checks=0,hints=0,fin=false,hlh=-1,
    info=pzEl('p',{class:'e5-info',text:'A pole at the dial centre casts the dark shadow. Move the dashed time marker until it lies along the shadow, then press Check time. Morning is on the left of the noon line and afternoon on the right.'}),
    read=pzEl('p',{class:'e5-prog'}),msg=pzEl('p',{class:'e5-msg',role:'status'}),
    svg=sv('svg',{viewBox:'0 0 240 135',class:'e5-svg',role:'img','aria-label':'A flat dial seen from above with hour lines. The shadow lies on the '+(inst.alpha<0?'left (morning) side':'right (afternoon) side')+' of the noon line.'}),
    sl=pzEl('input',{type:'range',class:'e5-sl',min:420,max:1020,step:inst.step,value:720,'aria-label':'Time marker, from 7:00 am to 5:00 pm'}),
    row1=pzEl('div',{class:'e5-row'}),row2=pzEl('div',{class:'e5-row'});
  function say(t){say2(msg,api,t)}
  function pt(a,r){var q=a*Math.PI/180;return[120+r*Math.sin(q),115-r*Math.cos(q)]}
  function paint(){svg.textContent='';var h,m,p,q;
    svg.appendChild(sv('path',{d:'M36 115 A84 84 0 0 1 204 115 Z',fill:'var(--tint)',stroke:'var(--ink)','stroke-width':'1.6'}));
    for(h=7;h<=17;h++){var a=scAlpha(inst.kind,inst.lat,h*60),hh=h===hlh||h===hlh+1;p=pt(a,hh?60:72);q=pt(a,84);
      svg.appendChild(sv('line',{x1:r1(p[0]),y1:r1(p[1]),x2:r1(q[0]),y2:r1(q[1]),stroke:'var(--ink)','stroke-width':hh?'3.6':h===12?'2.6':'1.6'}));
      for(m=15;m<60&&h<17;m+=15){var a2=scAlpha(inst.kind,inst.lat,h*60+m),p2=pt(a2,78),q2=pt(a2,84);svg.appendChild(sv('line',{x1:r1(p2[0]),y1:r1(p2[1]),x2:r1(q2[0]),y2:r1(q2[1]),stroke:'var(--ink)','stroke-width':'.8'}))}
      if(inst.labels||h===12){var tp=pt(a,95);svg.appendChild(sv('text',{x:r1(tp[0]),y:r1(tp[1]+3),'font-size':'9'},String(h%12||12)))}}
    var sh=pt(inst.alpha,66);svg.appendChild(sv('line',{x1:120,y1:115,x2:r1(sh[0]),y2:r1(sh[1]),stroke:'var(--ink)','stroke-width':'6','stroke-linecap':'round',opacity:'.55'}));
    var ha=pt(scAlpha(inst.kind,inst.lat,val),84);svg.appendChild(sv('line',{x1:120,y1:115,x2:r1(ha[0]),y2:r1(ha[1]),stroke:'var(--accent)','stroke-width':'2.4','stroke-dasharray':'5 3'}));
    svg.appendChild(sv('circle',{cx:r1(ha[0]),cy:r1(ha[1]),r:'3.6',fill:'var(--accent)',stroke:'var(--ink)','stroke-width':'1.4'}));
    svg.appendChild(sv('polygon',{points:'120,104 126,115 114,115',fill:'var(--ink)'}));
    sl.value=val;sl.setAttribute('aria-valuetext',scFmt(val));read.textContent='Marker time: '+scFmt(val)}
  function setVal(v){if(fin)return;val=Math.max(420,Math.min(1020,v));hlh=-1;paint()}
  function check(){if(fin)return;checks++;api.moved();var off=Math.abs(val-inst.t);
    if(off<=inst.tol){fin=true;paint();say('That matches the shadow: '+scFmt(val)+'.');api.done({solved:true,moves:checks,hints:hints,undos:0,extra:{par:1,off:off,tol:inst.tol,t:inst.t}});return true}
    say('Not quite: the marker time is more than '+inst.tol+' minutes from the shadow time. Look at the hour lines either side of the shadow and try again.');return false}
  function bs(t,d){return B(t,function(){setVal(val+d)},{})}
  sl.oninput=function(){setVal(+sl.value)};
  row1.appendChild(bs('Earlier by 1 hour',-60));row1.appendChild(bs('Earlier by '+inst.step+' minutes',-inst.step));row1.appendChild(bs('Later by '+inst.step+' minutes',inst.step));row1.appendChild(bs('Later by 1 hour',60));
  row2.appendChild(B('Check time',function(){check()},{}));
  w.appendChild(info);w.appendChild(svg);w.appendChild(read);w.appendChild(sl);w.appendChild(row1);w.appendChild(row2);w.appendChild(msg);paint();
  return{undo:function(){return false},
    restart:function(){if(fin)return;val=720;hlh=-1;paint();say('Marker back at 12:00 pm.')},
    moves:function(){return checks},
    hint:function(lv){if(fin)return null;hints++;var hr=Math.floor(inst.t/60),s;
      if(lv<=1){hlh=hr;s='Look at the two thick hour lines either side of the shadow. The time is between them.'}
      else if(lv===2){hlh=hr;s='The shadow sits between the '+(hr%12||12)+' and '+((hr+1)%12||12)+' o’clock lines, in the '+(hr>=12?'afternoon':'morning')+'.'}
      else{val=inst.t;paint();check();return msg.textContent}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({undo:false,id:'shadow-clock',name:'Shadow Clock',family:'number',theme:'F8',blurb:'Read a sundial: set the time marker to match the shadow.',
  how:'A dark shadow lies across a dial. Move the time marker until its dashed hand lies along the shadow, using the slider or the buttons, then press Check time. Fewer checks score better.',
  areas:['space','attention'],levels:30,secs:60,make:scMake,mount:wrap(mountSc,'try'),
  stars:function(res,inst){var m=res.moves,h=res.hints||0,s=pzStarsByPar(m,1,h),off=res.extra&&res.extra.off;
    return{stars:s,line:'You read the shadow after '+plural(m,'check')+' with '+hintsLine(h)+(off!==undefined?' and landed '+plural(off,'minute')+' from the exact time':'')+'. One check is the best possible.'}}});

/* ================= 4. Mix to Target ================= */
/* Points sit on a circle (n slots, angle 360/n each, slot 0 at the top, clockwise). Point A and point B mix with a share ratio wa:wb; the mix is the weighted average of their positions (a spot inside the circle,
   as on a colour circle). Hue of a spot = its angle, strength = its distance from the centre (0 to 100%). The target is another spot; you win when the mix lies within eps of it.
   One press = move A or B one slot, or shift the share one step. par = fewest presses from the start (breadth-first search over (a,b,ratio)). */
function mtParams(l){return{n:l<=10?12:l<=20?16:18,ratios:l<=8?[[1,1]]:l<=18?[[1,2],[1,1],[2,1]]:[[1,3],[1,2],[1,1],[2,1],[3,1]]}}
function mtPos(n,k){var th=2*Math.PI*k/n;return[Math.sin(th),-Math.cos(th)]}
function mtMix(n,rt,a,b,r){var pa=mtPos(n,a),pb=mtPos(n,b),w=rt[r],t=w[0]+w[1];return[(w[0]*pa[0]+w[1]*pb[0])/t,(w[0]*pa[1]+w[1]*pb[1])/t]}
var MT_ACT=['A anticlockwise','A clockwise','B anticlockwise','B clockwise','More A','More B'];
/* ratios are ordered from A-light to A-heavy: More A moves to the next index */
function mtApply(inst,st,act){var n=inst.n,nr=inst.ratios.length,a=st[0],b=st[1],r=st[2];
  if(act===0)a=(a+n-1)%n;else if(act===1)a=(a+1)%n;else if(act===2)b=(b+n-1)%n;else if(act===3)b=(b+1)%n;else if(act===4)r=r+1;else r=r-1;
  if(r<0||r>=nr)return null;return[a,b,r]}
function mtIsGoal(inst,st){var m=mtMix(inst.n,inst.ratios,st[0],st[1],st[2]);return Math.hypot(m[0]-inst.tx,m[1]-inst.ty)<inst.eps}
function mtDist(inst){var n=inst.n,nr=inst.ratios.length,dist=[],q=[],a,b,r,id=function(s){return(s[0]*n+s[1])*nr+s[2]};
  for(a=0;a<n*n*nr;a++)dist.push(-1);
  for(a=0;a<n;a++)for(b=0;b<n;b++)for(r=0;r<nr;r++)if(mtIsGoal(inst,[a,b,r])){dist[id([a,b,r])]=0;q.push([a,b,r])}
  for(var h=0;h<q.length;h++){var cur=q[h];for(var act=0;act<6;act++){var nx=mtApply(inst,cur,act);if(nx&&dist[id(nx)]<0){dist[id(nx)]=dist[id(cur)]+1;q.push(nx)}}}
  return{dist:dist,id:id}}
function mtPath(inst,from){var D=mtDist(inst),st=from||[inst.a,inst.b,inst.r],out=[];
  for(var g=0;g<200;g++){var here=D.dist[D.id(st)];if(here<=0)return here===0?out:null;
    for(var act=0;act<6;act++){var nx=mtApply(inst,st,act);if(nx&&D.dist[D.id(nx)]===here-1){out.push(act);st=nx;break}}}return null}
function mtMake(level,rng){var p=mtParams(level),n=p.n,nr=p.ratios.length,lo=2+Math.floor(level/6),hi=lo+2,att,inst;
  for(att=0;att<60;att++){var ta=pzInt(rng,n),tb=pzInt(rng,n),tr=pzInt(rng,nr);if(ta===tb)continue;
    var m=mtMix(n,p.ratios,ta,tb,tr);if(Math.hypot(m[0],m[1])<0.2)continue;
    inst={level:level,title:'Level '+level,n:n,ratios:p.ratios,a:0,b:0,r:0,tx:Math.round(m[0]*1e4)/1e4,ty:Math.round(m[1]*1e4)/1e4,eps:0.02,par:0};
    var D=mtDist(inst),c=[],best=-1,bs=null,a,b,r;
    for(a=0;a<n;a++)for(b=0;b<n;b++)for(r=0;r<nr;r++){var d=D.dist[D.id([a,b,r])];if(d>=lo&&d<=hi)c.push([a,b,r,d]);if(d>best){best=d;bs=[a,b,r,d]}}
    var pick=c.length?c[pzInt(rng,c.length)]:bs;if(!pick||pick[3]<1)continue;
    inst.a=pick[0];inst.b=pick[1];inst.r=pick[2];inst.par=pick[3];if(c.length)return inst}
  return inst}
PZE5.mt={make:mtMake,dist:mtDist,path:mtPath,mix:mtMix,apply:mtApply,isGoal:mtIsGoal,actions:MT_ACT,params:mtParams};
function mtHue(x,y){var h=Math.atan2(x,-y)*180/Math.PI;return Math.round((h+360)%360)%360}
function mtStr(x,y){return Math.min(100,Math.round(Math.hypot(x,y)*100))}
function mountMt(root,inst,api){
  var w=shell(root,'e5-mt'),n=inst.n,st=[inst.a,inst.b,inst.r],hist=[],fin=false,hints=0,undos=0,hl=-1,D=mtDist(inst),uid='e5m'+(++UID),i,
    info=pzEl('p',{class:'e5-info',text:'Move points A and B round the circle so that their mix (the cross) lands on the target (the diamond). Each press moves one point one step'+(inst.ratios.length>1?', or shifts the share between A and B.':'.')+' The two boxes below give the numbers.'}),
    sw=pzEl('div',{class:'e5-sw'}),swT=pzEl('div'),swM=pzEl('div'),prog=pzEl('p',{class:'e5-prog'}),msg=pzEl('p',{class:'e5-msg',role:'status'}),
    svg=sv('svg',{viewBox:'-12 -12 244 244',class:'e5-svg',role:'img','aria-label':'A colour circle with point A, point B, the mix and the target. Numbers for each are given below.'}),
    grid=pzEl('div',{class:'e5-rg',role:'group','aria-label':'Moves'}),bt=[];
  function say(t){say2(msg,api,t)}
  function px(k){var p=mtPos(n,k);return[110+90*p[0],110+90*p[1]]}
  function col(x,y){return 'hsl('+mtHue(x,y)+','+mtStr(x,y)+'%,52%)'}
  var wheel=sv('g',{}),j;
  for(j=0;j<36;j++){var a0=(j*10-5)*Math.PI/180,a1=(j*10+5)*Math.PI/180;wheel.appendChild(sv('path',{d:'M110 110 L'+r1(110+92*Math.sin(a0))+' '+r1(110-92*Math.cos(a0))+' A92 92 0 0 1 '+r1(110+92*Math.sin(a1))+' '+r1(110-92*Math.cos(a1))+' Z',fill:'hsl('+(j*10)+',85%,52%)',stroke:'none'}))}
  var df=sv('defs'),rg=sv('radialGradient',{id:uid});rg.appendChild(sv('stop',{offset:'0','stop-color':'#fff','stop-opacity':'1'}));rg.appendChild(sv('stop',{offset:'1','stop-color':'#fff','stop-opacity':'0'}));df.appendChild(rg);
  var dyn=sv('g',{});
  svg.appendChild(df);svg.appendChild(wheel);svg.appendChild(sv('circle',{cx:110,cy:110,r:92,fill:'url(#'+uid+')'}));svg.appendChild(sv('circle',{cx:110,cy:110,r:92,fill:'none',stroke:'var(--ink)','stroke-width':'2'}));
  [0,90,180,270].forEach(function(dg){var q=dg*Math.PI/180;svg.appendChild(sv('text',{x:r1(110+104*Math.sin(q)),y:r1(113-104*Math.cos(q)),'font-size':'9'},dg+'°'))});
  for(j=0;j<n;j++){var pp=mtPos(n,j);svg.appendChild(sv('line',{x1:r1(110+86*pp[0]),y1:r1(110+86*pp[1]),x2:r1(110+94*pp[0]),y2:r1(110+94*pp[1]),stroke:'var(--ink)','stroke-width':'1.2'}))}
  svg.appendChild(dyn);
  function share(){var rt=inst.ratios[st[2]];return rt[0]+' : '+rt[1]}
  function paint(){dyn.textContent='';var pa=px(st[0]),pb=px(st[1]),m=mtMix(n,inst.ratios,st[0],st[1],st[2]),mx=110+90*m[0],my=110+90*m[1],tx=110+90*inst.tx,ty=110+90*inst.ty;
    dyn.appendChild(sv('line',{x1:r1(pa[0]),y1:r1(pa[1]),x2:r1(pb[0]),y2:r1(pb[1]),stroke:'var(--ink)','stroke-width':'1.6','stroke-dasharray':'4 3'}));
    dyn.appendChild(sv('polygon',{points:r1(tx)+','+r1(ty-8)+' '+r1(tx+8)+','+r1(ty)+' '+r1(tx)+','+r1(ty+8)+' '+r1(tx-8)+','+r1(ty),fill:'var(--surface)',stroke:'var(--ink)','stroke-width':'2.4'}));
    dyn.appendChild(sv('circle',{cx:r1(pa[0]),cy:r1(pa[1]),r:'9',fill:'var(--surface)',stroke:'var(--ink)','stroke-width':'2.4'}));dyn.appendChild(sv('text',{x:r1(pa[0]),y:r1(pa[1]+4),'font-size':'11'},'A'));
    dyn.appendChild(sv('rect',{x:r1(pb[0]-8.5),y:r1(pb[1]-8.5),width:17,height:17,rx:'3',fill:'var(--surface)',stroke:'var(--ink)','stroke-width':'2.4'}));dyn.appendChild(sv('text',{x:r1(pb[0]),y:r1(pb[1]+4),'font-size':'11'},'B'));
    var xd='M'+r1(mx-6)+' '+r1(my-6)+' L'+r1(mx+6)+' '+r1(my+6)+' M'+r1(mx+6)+' '+r1(my-6)+' L'+r1(mx-6)+' '+r1(my+6);
    dyn.appendChild(sv('path',{d:xd,stroke:'var(--ink)','stroke-width':'4.4','stroke-linecap':'round'}));dyn.appendChild(sv('path',{d:xd,stroke:'var(--surface)','stroke-width':'1.8','stroke-linecap':'round'}));
    swT.textContent='';swM.textContent='';
    swT.appendChild(pzEl('i',{text:'◆','aria-hidden':'true',style:'background:'+col(inst.tx,inst.ty)}));swT.appendChild(document.createTextNode('Target (diamond): hue '+mtHue(inst.tx,inst.ty)+'°, strength '+mtStr(inst.tx,inst.ty)+'%'));
    swM.appendChild(pzEl('i',{text:'✕','aria-hidden':'true',style:'background:'+col(m[0],m[1])}));swM.appendChild(document.createTextNode('Your mix (cross): hue '+mtHue(m[0],m[1])+'°, strength '+mtStr(m[0],m[1])+'%'));
    prog.textContent='A at '+r1(360*st[0]/n)+'°, B at '+r1(360*st[1]/n)+'°'+(inst.ratios.length>1?', share A : B = '+share():'')+'. Presses: '+hist.length+'.';
    bt.forEach(function(b){b.className='e5-btn'+(b._act===hl?' e5-hint':'')})}
  function press(act){if(fin)return false;hl=-1;var nx=mtApply(inst,st,act);if(!nx){say('The share cannot go further that way.');paint();return false}
    hist.push(st);st=nx;api.moved();paint();
    if(mtIsGoal(inst,st)){fin=true;say('The mix lands on the target.');api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})}
    else{var mm=mtMix(n,inst.ratios,st[0],st[1],st[2]);say(MT_ACT[act]+'. The mix is now at hue '+mtHue(mm[0],mm[1])+'°.')}return true}
  MT_ACT.forEach(function(t,ix){if(ix>=4&&inst.ratios.length<2)return;var b=B(t,function(){press(ix)},{});b._act=ix;bt.push(b);grid.appendChild(b)});
  sw.appendChild(swT);sw.appendChild(swM);
  w.appendChild(info);w.appendChild(svg);w.appendChild(sw);w.appendChild(prog);w.appendChild(grid);w.appendChild(msg);paint();
  function next(){var here=D.dist[D.id(st)];for(var act=0;act<6;act++){var nx=mtApply(inst,st,act);if(nx&&D.dist[D.id(nx)]===here-1)return act}return -1}
  return{undo:function(){if(fin||!hist.length)return false;st=hist.pop();undos++;hl=-1;paint();say('Undone.');return true},
    restart:function(){hist=[];st=[inst.a,inst.b,inst.r];hl=-1;paint();say('Restarted.')},
    moves:function(){return hist.length},
    hint:function(lv){if(fin)return null;hints++;var a=next(),s;if(a<0)return null;
      if(lv<=1){hl=a;s='Look at the button marked ?. It starts a shortest way to the target.'}
      else if(lv===2){hl=a;s='Press: '+MT_ACT[a]+'.'}
      else{press(a);return msg.textContent}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({undo:true,id:'mix-to-target',name:'Mix to Target',family:'grid',theme:'F1',blurb:'Move two colour points on a circle so their mix lands on the target.',
  how:'Two points, A and B, sit on a colour circle. Move them round the circle (and, in later levels, shift how much of each you use) until the mix, shown as a cross, lands on the target diamond. Numbers and shapes are shown, so you never need colour alone.',
  areas:['space','flex'],levels:30,secs:75,make:mtMake,mount:wrap(mountMt),
  stars:function(res,inst){var par=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0,s=pzStarsByPar(m,par,h),u=res.undos||0;if(u>3&&s>2)s=2;
    return{stars:s,line:'The mix reached the target in '+plural(m,'press','presses')+' with '+hintsLine(h)+(u?' and '+plural(u,'undo'):'')+'. The fewest possible is '+plural(par,'press','presses')+'.'}}});
})();
