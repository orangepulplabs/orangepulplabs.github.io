/* Zest puzzles, set A: Slide Tiles, Disc Tower, Few Swaps, Make the Target, Digit Span, Tilt Run. Contract: see puzzles_kit.js.
   Layout: first the pure generators and solvers (no DOM, exposed as PZA for tests), then one shared shell + undo/hint engine, then the six mounts.
   Every make(level, rng) is deterministic in rng and returns plain JSON (nothing but numbers, strings, arrays, booleans).
   Extra fields the runner may use: inst.level, inst.par, inst.parExact (false = par is a good-run estimate), inst.title.
   Extra def fields: undo:false (Digit Span). mount() draws its own Undo / Hint / Restart row unless api.toolbar===false or inst.toolbar===false,
   and then the controller {undo(), hint(n), restart(), destroy(), moves()} drives the same things. hint(n) returns the sentence and also shows it. */
var PZA={};
function pzaPl(n,w){return n+' '+w+(n===1?'':'s')}
function pzaKeyOk(e){return !(e.ctrlKey||e.metaKey||e.altKey)&&!/^(INPUT|TEXTAREA|SELECT)$/.test((e.target&&e.target.tagName)||'')}
function pzaMid(level,a,b){return a+(b-a)*(level-1)/29}

/* ================= 1. Slide Tiles: IDA* with Manhattan distance ================= */
/* t = tiles by position (0 = gap). w = weight on the heuristic (1 = optimal). cap = node budget. Returns {path:[tile values slid], exact} or null. */
function pzaTSolve(start,n,w,cap){
  var N=n*n,t=start.slice(),md=[],nb=[],i,v,p;
  for(v=1;v<N;v++){md[v]=[];for(p=0;p<N;p++)md[v][p]=Math.abs(((v-1)/n|0)-(p/n|0))+Math.abs((v-1)%n-p%n)}
  for(i=0;i<N;i++)nb[i]=pzaTNb(i,n);
  var h=0;for(i=0;i<N;i++)if(t[i])h+=md[t[i]][i];
  var nodes=0,bound=w*h,path=[],found=false,abort=false;
  function dfs(g,h,b,prev){
    var f=g+w*h;if(f>bound)return f;
    if(h===0){found=true;return -1}
    if(++nodes>cap){abort=true;return 1e9}
    var min=1e9,a=nb[b];
    for(var k=0;k<a.length;k++){var q=a[k];if(q===prev)continue;var tile=t[q];
      t[b]=tile;t[q]=0;path.push(tile);
      var r=dfs(g+1,h-md[tile][q]+md[tile][b],q,b);
      if(found)return -1;
      path.pop();t[q]=tile;t[b]=0;
      if(abort)return 1e9;if(r<min)min=r}
    return min}
  for(;;){var r=dfs(0,h,t.indexOf(0),-1);if(found)return {path:path,exact:w===1};if(abort||r>=1e9)return null;bound=r}}
function pzaTNb(b,n){var r=b/n|0,c=b%n,a=[];if(r>0)a.push(b-n);if(r<n-1)a.push(b+n);if(c>0)a.push(b-1);if(c<n-1)a.push(b+1);return a}
PZA.tSolve=pzaTSolve;
PZA.makeSlide=function(level,rng){
  var n=level<=20?3:4,N=n*n,L=n===3?6+Math.round(level*1.3):16+(level-21)*2,best=null;
  for(var tries=0;tries<4;tries++){
    var b=N-1,prev=-1,t=[],i,s;for(i=1;i<N;i++)t.push(i);t.push(0);
    for(s=0;s<L;s++){var a=pzaTNb(b,n).filter(function(x){return x!==prev}),q=a[pzInt(rng,a.length)];t[b]=t[q];t[q]=0;prev=b;b=q}
    var solved=true;for(i=0;i<N-1;i++)if(t[i]!==i+1)solved=false;if(solved)continue;
    var sol=pzaTSolve(t,n,1,n===3?4e6:60000),par=sol?Math.min(sol.path.length,L):L;
    if(!best||par>best.par)best={title:'Level '+level,level:level,n:n,tiles:t,par:par,parExact:!!sol,scramble:L}}
  return best};
PZA.slideNext=function(s,n){var r=pzaTSolve(s,n,1,n===3?4e6:150000)||pzaTSolve(s,n,3,3e6);return r&&r.path.length?r.path[0]:null};

/* ================= 2. Disc Tower: state = base-3 code, digit d = peg of disc d (0 = smallest) ================= */
var PZA_PW=[1,3,9,27,81,243,729,2187,6561],PZA_TW={};
function pzaTPegs(code,n){var a=[];for(var d=0;d<n;d++){a.push(code%3);code=(code-code%3)/3}return a}
function pzaTMoves(code,n){var p=pzaTPegs(code,n),t=[99,99,99],out=[],a,b,d;for(d=n-1;d>=0;d--)t[p[d]]=d;
  for(a=0;a<3;a++)for(b=0;b<3;b++)if(a!==b&&t[a]<99&&t[b]>t[a])out.push({d:t[a],a:a,b:b,code:code+(b-a)*PZA_PW[t[a]]});return out}
function pzaTDist(n){if(PZA_TW[n])return PZA_TW[n];var S=PZA_PW[n],dist=new Int16Array(S),q=new Int32Array(S),h=0,e=0,i;
  for(i=0;i<S;i++)dist[i]=-1;dist[S-1]=0;q[e++]=S-1;
  while(h<e){var c=q[h++],m=pzaTMoves(c,n);for(i=0;i<m.length;i++)if(dist[m[i].code]<0){dist[m[i].code]=dist[c]+1;q[e++]=m[i].code}}
  return PZA_TW[n]=dist}
PZA.towerDist=pzaTDist;PZA.towerMoves=pzaTMoves;
PZA.makeTower=function(level,rng){
  var n=3+Math.round((level-1)*5/29),std=level%3!==0,dist=pzaTDist(n),code=0,d;
  if(!std){for(var tries=0;tries<30;tries++){var c=0;for(d=0;d<n;d++)c+=pzInt(rng,3)*PZA_PW[d];if(dist[c]>=Math.max(3,n)){code=c;break}}if(!code)std=true}
  return {title:'Level '+level,level:level,n:n,start:code,std:std,par:dist[code],parExact:true}};
PZA.towerNext=function(code,n){var dist=pzaTDist(n),m=pzaTMoves(code,n);for(var i=0;i<m.length;i++)if(dist[m[i].code]===dist[code]-1)return m[i];return null};

/* ================= 3. Few Swaps ================= */
function pzaCycles(p){var seen=[],c=0,i,j;for(i=0;i<p.length;i++)if(!seen[i]){c++;j=i;while(!seen[j]){seen[j]=1;j=p[j]-1}}return c}
PZA.cycles=pzaCycles;
PZA.makeSwaps=function(level,rng){
  var n=5+Math.floor((level-1)*7/29),min=Math.max(2,Math.ceil((n-1)*pzaMid(level,.4,.8))),base=[],i,best=null,bp=-1;
  for(i=1;i<=n;i++)base.push(i);
  for(var tries=0;tries<300;tries++){var p=pzShuffle(base,rng),par=n-pzaCycles(p);if(par>bp){bp=par;best=p}if(par>=min)break}
  return {title:'Level '+level,level:level,n:n,items:best,par:bp,parExact:true}};
PZA.swapNext=function(p){for(var i=0;i<p.length;i++)if(p[i]!==i+1)return {a:i,b:p.indexOf(i+1)};return null};

/* ================= 4. Make the Target ================= */
var PZA_MAXV=1e6;
/* all results of combining a and b (a<=b): only exact, positive whole numbers */
function pzaOps(a,b){var o=[];if(a+b<=PZA_MAXV)o.push({op:'+',r:a+b});if(a*b<=PZA_MAXV)o.push({op:'×',r:a*b});if(b>a)o.push({op:'−',r:b-a});if(a>0&&b%a===0)o.push({op:'÷',r:b/a});return o}
/* one move the player asks for: any order of the two numbers, the valid orientation is used */
PZA.combine=function(x,y,op){var a=Math.min(x,y),b=Math.max(x,y);
  if(op==='+'){if(a+b>PZA_MAXV)return {err:'That sum is bigger than this puzzle allows. Try something smaller.'};return {r:a+b,txt:b+' + '+a+' = '+(a+b)}}
  if(op==='×'){if(a*b>PZA_MAXV)return {err:'That product is bigger than this puzzle allows. Try something smaller.'};return {r:a*b,txt:b+' × '+a+' = '+a*b}}
  if(op==='−'){if(a===b)return {err:x+' − '+y+' would be 0. Results here must be whole numbers above zero. Try another pair or sign.'};return {r:b-a,txt:b+' − '+a+' = '+(b-a)}}
  if(a>0&&b%a===0)return {r:b/a,txt:b+' ÷ '+a+' = '+(b/a)};
  return {err:b+' ÷ '+a+' is not a whole number. Only exact answers are allowed here. Try another pair or sign.'}};
/* breadth-first search over sorted multisets: fewest operations until the target is one of the numbers. cap = max states. */
function pzaTargetSolve(nums,target,cap){
  var start=nums.slice().sort(function(a,b){return a-b});if(start.indexOf(target)>=0)return {par:0,path:[]};
  var par={},layer=[start],seen=1;par[start.join(',')]=null;
  while(layer.length){var nx=[];
    for(var li=0;li<layer.length;li++){var s=layer[li],pk=s.join(',');
      for(var i=0;i<s.length;i++){if(i&&s[i]===s[i-1])continue;
        for(var j=i+1;j<s.length;j++){if(j>i+1&&s[j]===s[j-1])continue;
          var os=pzaOps(s[i],s[j]);
          for(var k=0;k<os.length;k++){var r=os[k].r,rest=[],m,ins=false;for(m=0;m<s.length;m++)if(m!==i&&m!==j){if(!ins&&r<s[m]){rest.push(r);ins=true}rest.push(s[m])}if(!ins)rest.push(r);
            var key=rest.join(',');if(par[key]!==undefined)continue;
            par[key]={p:pk,x:s[j],y:s[i],op:os[k].op,r:r};
            if(r===target){var path=[],c=key;while(par[c]){path.unshift({x:par[c].x,y:par[c].y,op:par[c].op,r:par[c].r});c=par[c].p}return {par:path.length,path:path}}
            if(++seen>cap)return null;nx.push(rest)}}}}
    layer=nx}
  return null}
PZA.targetSolve=pzaTargetSolve;
PZA.makeTarget=function(level,rng){
  var n=level<=10?4:level<=20?5:6,k=Math.min(n-1,level<3?1:level<9?2:level<15?3:4),mx=Math.round(pzaMid(level,9,28)),hi=level<5?60:level<12?150:999,best=null;
  function fold(w,ps){var pr=ps[pzInt(rng,ps.length)],x=Math.min(w[pr[0]],w[pr[1]]),y=Math.max(w[pr[0]],w[pr[1]]),os=pzaOps(x,y).filter(function(o){return o.r<=hi*3});
    if(!os.length)return null;var o=os[pzInt(rng,os.length)],rest=w.filter(function(_,q){return q!==pr[0]&&q!==pr[1]});rest.push(o.r);return rest}
  for(var tries=0;tries<60;tries++){
    var nums=[],i;for(i=0;i<n;i++)nums.push(1+pzInt(rng,mx));
    var w=nums.slice(),ok=true;
    for(var s=0;s<k&&ok;s++){var ps=[];for(var a=0;a<w.length;a++)for(var b=a+1;b<w.length;b++)ps.push([a,b]);w=fold(w,ps);if(!w)ok=false}
    if(!ok)continue;var target=w[w.length-1];
    if(target<Math.max(2,level<5?6:10)||target>hi||nums.indexOf(target)>=0)continue;
    var sol=pzaTargetSolve(nums,target,150000);if(!sol||sol.par<1)continue;
    var cand={title:'Level '+level,level:level,nums:nums,target:target,par:sol.par,parExact:true};
    if(!best||Math.abs(sol.par-k)<Math.abs(best.par-k))best=cand;
    if(sol.par>=k)break}
  if(!best){var nm=[2,3,4,5,6,7].slice(0,n);best={title:'Level '+level,level:level,nums:nm,target:10,par:pzaTargetSolve(nm,10,1e5).par,parExact:true}}
  return best};

/* ================= 5. Digit Span ================= */
PZA.makeDigits=function(level,rng){
  var n=3+Math.round((level-1)*7/29),d=[],prev=-1;
  for(var i=0;i<n;i++){var x;do{x=pzInt(rng,10)}while(x===prev);d.push(x);prev=x}
  return {title:'Level '+level,level:level,n:n,digits:d,par:n,parExact:true,mode:level<=5?'all':'one'}};

/* ================= 6. Tilt Run ================= */
var PZA_DIR=[[0,-1,'up'],[0,1,'down'],[-1,0,'left'],[1,0,'right']];
PZA.slide=function(w,h,bl,x,y,dir,gx,gy){var dx=PZA_DIR[dir][0],dy=PZA_DIR[dir][1];
  for(;;){var tx=x+dx,ty=y+dy;if(tx<0||ty<0||tx>=w||ty>=h||bl[ty*w+tx])break;x=tx;y=ty;if(x===gx&&y===gy)break}return [x,y]};
/* BFS over stopping places: returns the shortest list of directions from (x,y) to the goal, or null */
PZA.tiltSolve=function(w,h,bl,x,y,gx,gy){
  if(x===gx&&y===gy)return [];var prev={},q=[[x,y]];prev[y*w+x]=null;
  for(var qi=0;qi<q.length;qi++){var c=q[qi];
    for(var d=0;d<4;d++){var r=PZA.slide(w,h,bl,c[0],c[1],d,gx,gy),k=r[1]*w+r[0];if(r[0]===c[0]&&r[1]===c[1])continue;if(k in prev)continue;
      prev[k]={p:c[1]*w+c[0],d:d};
      if(r[0]===gx&&r[1]===gy){var path=[],cc=k;while(prev[cc]){path.unshift(prev[cc].d);cc=prev[cc].p}return path}
      q.push(r)}}
  return null};
PZA.makeTilt=function(level,rng){
  var s=5+Math.round((level-1)*4/29),T=2+Math.floor((level-1)*7/29),dens=pzaMid(level,.1,.2),best=null;
  for(var tries=0;tries<500;tries++){
    var bl=[],i;for(i=0;i<s*s;i++)bl.push(rng()<dens?1:0);
    var sx=pzInt(rng,s),sy=pzInt(rng,s),gx=pzInt(rng,s),gy=pzInt(rng,s);
    if((sx===gx&&sy===gy)||bl[sy*s+sx]||bl[gy*s+gx])continue;
    var p=PZA.tiltSolve(s,s,bl,sx,sy,gx,gy);if(!p)continue;
    var sc=Math.abs(p.length-T);
    if(!best||sc<best.sc)best={sc:sc,inst:{title:'Level '+level,level:level,w:s,h:s,blocks:bl,sx:sx,sy:sy,gx:gx,gy:gy,par:p.length,parExact:true}};
    if(sc<=(level<4?1:0))break}
  if(!best){var b2=[];for(var j=0;j<s*s;j++)b2.push(0);var pp=PZA.tiltSolve(s,s,b2,0,0,s-1,s-1);best={inst:{title:'Level '+level,level:level,w:s,h:s,blocks:b2,sx:0,sy:0,gx:s-1,gy:s-1,par:pp.length,parExact:true}}}
  return best.inst};

/* ================= shared styles (one <style id="pza-css">) ================= */
var PZA_CSS='.pza{display:flex;flex-direction:column;gap:12px;width:100%;max-width:24rem;margin:0 auto;color:var(--ink);font-family:var(--font)}.pza *{box-sizing:border-box}'
+'.pza-top{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:2px 12px}.pza-goal{margin:0;font:700 1.125rem/1.25 var(--disp)}.pza-ct{font:650 .875rem var(--font);color:var(--muted)}'
+'.pza-board{position:relative}.pza-msg{margin:0;min-height:2.8em;font-size:.9375rem;line-height:1.4;color:var(--muted)}'
+'.pza-bar{display:flex;flex-wrap:wrap;gap:8px}.pza-bar .pzb{flex:1 1 5.5rem}'
+'.pza .pzb{min-height:3rem;min-width:48px;padding:.25rem 14px;border:0;border-radius:var(--r1);background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);font:700 1rem/1.2 var(--font);color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-align:center;transition:transform .12s ease-out}'
+'.pza .pzb:active{transform:scale(.97)}.pza .pzb:disabled{background:var(--dis-bg);color:var(--dis-ink);box-shadow:none;cursor:default}.pza .pzb.pri{background:var(--accent);color:var(--on-accent);box-shadow:none}'
+'.pza .pzb.sel{background:var(--tint);box-shadow:inset 0 0 0 3px var(--accent)}.pza .pzb:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.pza .pzb.sel:focus-visible{box-shadow:inset 0 0 0 3px var(--accent),0 0 0 5px var(--bg)}'
+'.pza .pzb.pza-hint{outline:3px dashed var(--ink);outline-offset:3px}.pza-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}'
/* slide tiles */
+'.pza-sg{position:relative;width:100%;border-radius:var(--r2);background:var(--ph);box-shadow:0 0 0 1px var(--line) inset}.pza-sg::before{content:"";display:block;padding-top:100%}'
+'.pza-sg .pzb,.pza-gap{position:absolute;left:0;top:0;padding:0;background:none!important;box-shadow:none!important;border-radius:0;transition:transform .14s ease-out}.pza-sg .pzb:focus-visible{outline-offset:-3px}'
+'.pza-face{display:flex;align-items:center;justify-content:center;position:absolute;inset:4%;border-radius:var(--r1);background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);font:700 1.5rem/1 var(--disp);overflow:hidden}'
+'.pza-sg .pzb.ok .pza-face{background:var(--tint)}.pza-sg .pzb.ok .pza-face::after{content:"\\2713";position:absolute;right:7%;top:3%;font:700 .75rem var(--font);color:var(--link)}'
+'.pza-gap .pza-face{background:none;box-shadow:none;border:2px dashed var(--edge);font:600 .75rem var(--font);color:var(--muted)}'
/* disc tower */
+'.pza-tw{display:flex;gap:8px}.pza .pza-peg{flex:1 1 0;min-width:0;flex-direction:column;justify-content:flex-end;gap:2px;position:relative;padding:6px 3px 4px;align-items:stretch}'
+'.pza-rod{position:absolute;left:50%;top:6px;bottom:1.7rem;width:8px;margin-left:-4px;border-radius:4px;background:var(--edge);opacity:.55}.pza-stack{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:2px}'
+'.pza-disc{height:1.5rem;border-radius:99px;background:var(--accent);color:var(--on-accent);box-shadow:0 0 0 1.5px var(--ink) inset;font:700 .8125rem/1.5rem var(--font);text-align:center;overflow:hidden;transition:transform .12s ease-out}'
+'.pza-peg.sel .pza-disc:first-child{transform:translateY(-.4rem);box-shadow:0 0 0 3px var(--ink) inset}.pza-cap{position:relative;font:650 .75rem/1.2 var(--font);color:var(--muted);text-align:center;padding-top:2px}'
/* few swaps */
+'.pza-fs{display:grid;grid-template-columns:repeat(auto-fill,minmax(3.25rem,1fr));gap:8px}.pza .pza-fs .pzb{flex-direction:column;gap:0;min-height:4rem;padding:2px;position:relative}.pza-fs .pzb b{font:700 1.25rem/1.1 var(--disp)}'
+'.pza-fs .pzb i{font-style:normal;font-size:.9rem;line-height:1;color:var(--muted)}.pza .pza-fs .pzb.ok{background:var(--tint)}.pza-fs .pzb.ok::after{content:"\\2713";position:absolute;right:5px;top:2px;font:700 .75rem var(--font);color:var(--link)}'
/* make the target */
+'.pza-nums{display:flex;flex-wrap:wrap;gap:8px}.pza .pza-nums .pzb{flex:1 1 3.5rem;min-height:3.5rem;font:700 1.5rem/1 var(--disp);position:relative}.pza-nums .pzb small{position:absolute;left:5px;top:2px;font:700 .6875rem var(--font);color:var(--link)}'
+'.pza .pza-nums .pzb.hit{background:var(--ok-bg);color:var(--ok-ink)}.pza-nums .pzb.hit::after{content:"\\2713";position:absolute;right:5px;top:2px;font:700 .75rem var(--font)}'
+'.pza-ops{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.pza .pza-ops .pzb{flex:1;font-size:1.5rem;min-height:3.25rem}.pza-pre{margin:8px 0 0;font:600 1rem var(--font);min-height:1.6em}.pza-log{margin:6px 0 0;padding-left:1.4rem;font-size:.875rem;line-height:1.5;color:var(--muted)}'
/* digit span */
+'.pza-big{display:flex;align-items:center;justify-content:center;min-height:9rem;border-radius:var(--r2);background:var(--surface);box-shadow:0 0 0 1px var(--line);font:700 4.5rem/1 var(--disp);text-align:center;padding:8px;word-break:break-all}'
+'.pza-big.all{font-size:2.25rem;letter-spacing:.12em;line-height:1.3}.pza-dots{display:flex;gap:6px;justify-content:center;margin:8px 0 0;min-height:10px}.pza-dots i{width:10px;height:10px;border-radius:2px;box-shadow:0 0 0 1.5px var(--edge) inset}.pza-dots i.on{background:var(--ink);box-shadow:none}'
+'.pza-slots{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.pza-slots span{display:flex;flex-direction:column;align-items:center;justify-content:center;width:2.5rem;height:3.5rem;border-radius:10px;background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);font:700 1.5rem/1 var(--disp)}'
+'.pza-slots span.cur{box-shadow:0 0 0 3px var(--accent)}.pza-slots span small{font:700 .75rem/1 var(--font)}.pza-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.pza .pza-pad .pzb{min-height:3.25rem;font:700 1.375rem/1 var(--disp)}.pza .pza-pad .pzb.sm{font:700 .9375rem var(--font)}'
+'.pza-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;margin-top:12px}'
/* tilt run */
+'.pza-tr{position:relative;width:100%;border-radius:var(--r2);background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}.pza-tr::before{content:"";display:block;padding-top:100%}'
+'.pza-cell{position:absolute;display:flex;align-items:center;justify-content:center}.pza-blk{display:block;background:repeating-linear-gradient(45deg,var(--ink) 0 3px,var(--surface) 3px 7px);border:2px solid var(--ink);border-radius:4px}'
+'.pza-goalc span{width:80%;height:80%;border-radius:50%;background:var(--tint);border:3px double var(--ink);display:flex;align-items:center;justify-content:center;font:700 .75rem var(--font);color:var(--ink)}'
+'.pza-ball{position:absolute;left:0;top:0;display:flex;align-items:center;justify-content:center;transition:transform .15s ease-out}.pza-ball span{width:64%;height:64%;border-radius:50%;background:var(--accent);box-shadow:0 0 0 2.5px var(--ink) inset;display:block}'
+'.pza-dir{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.pza .pza-dir .pzb{flex:1;min-height:3.5rem;font-size:1.5rem}'
+'.pza.rm *,.pza.rm *::before{transition:none!important;animation:none!important}@media (prefers-reduced-motion:reduce){.pza *,.pza *::before{transition:none!important;animation:none!important}}';
function pzaCss(){if(typeof document==='undefined'||document.getElementById('pza-css'))return;var s=document.createElement('style');s.id='pza-css';s.textContent=PZA_CSS;(document.head||document.documentElement).appendChild(s)}

/* ================= shared shell and engine ================= */
function pzaShell(root,inst,api,o){
  pzaCss();while(root.firstChild)root.removeChild(root.firstChild);o=o||{};
  var S={timers:[],offs:[],dead:false};
  S.wrap=pzEl('div',{class:'pza'+(api.rm?' rm':'')+(o.cls?' '+o.cls:'')});
  S.goal=pzEl('p',{class:'pza-goal',text:o.goal||''});S.ct=pzEl('span',{class:'pza-ct num'});
  S.board=pzEl('div',{class:'pza-board'});S.msg=pzEl('p',{class:'pza-msg'});S.bar=pzEl('div',{class:'pza-bar'});
  if(!api.say)S.msg.setAttribute('role','status');
  S.wrap.appendChild(pzEl('div',{class:'pza-top'},[S.goal,S.ct]));S.wrap.appendChild(S.board);S.wrap.appendChild(S.msg);
  S.showBar=!(api.toolbar===false||inst.toolbar===false);if(S.showBar)S.wrap.appendChild(S.bar);
  S.say=function(t){S.msg.textContent=t;if(api.say)api.say(t)};
  S.later=function(fn,ms){var id=setTimeout(function(){if(!S.dead)fn()},ms);S.timers.push(id);return id};
  S.on=function(tg,ty,fn){tg.addEventListener(ty,fn);S.offs.push(function(){tg.removeEventListener(ty,fn)})};
  S.destroy=function(){S.dead=true;S.timers.forEach(clearTimeout);S.offs.forEach(function(f){f()});if(S.wrap.parentNode)S.wrap.parentNode.removeChild(S.wrap)};
  S.key=function(fn){S.on(document,'keydown',function(e){if(S.dead||!S.wrap.isConnected||!pzaKeyOk(e))return;if(fn(e))e.preventDefault()})};
  root.appendChild(S.wrap);return S}
/* mk(inst, ctx) -> {init(), step(state, action) -> {s,msg?}|{err}|null, render(state), solved(state), hint(state, n) -> string|null, win(state, moves), reset(), key(keyName, state) -> bool}
   ctx.mark(element, order) draws the dashed hint outline (and data-hint-order) until the next move. */
function pzaEngine(root,inst,api,mk,o){
  var S=pzaShell(root,inst,api,o),hist,hints=0,undos=0,fin=0,lvl=0,sp,bu,bh,br;
  var ctx={board:S.board,say:S.say,S:S,cur:function(){return hist[hist.length-1]},act:act,render:render,
    mark:function(el,ord){el.classList.add('pza-hint');el.setAttribute('data-hint-order',ord)}};
  sp=mk(inst,ctx);hist=[sp.init()];
  function clearMarks(){var m=S.board.querySelectorAll('.pza-hint');for(var i=0;i<m.length;i++){m[i].classList.remove('pza-hint');m[i].removeAttribute('data-hint-order')}}
  function hintLabel(){if(bh){bh.textContent=lvl===0?'Hint':lvl<3?'More hint':'Show again';bh.setAttribute('aria-label',bh.textContent)}}
  function render(){clearMarks();sp.render(ctx.cur());S.ct.textContent='Moves '+(hist.length-1);if(bu)bu.disabled=hist.length<2||!!fin}
  function act(a){if(fin)return false;var r=sp.step(ctx.cur(),a);if(!r)return false;
    if(r.err){clearMarks();S.say(r.err);return false}
    hist.push(r.s);lvl=0;hintLabel();if(api.moved)api.moved();render();if(r.msg)S.say(r.msg);
    if(sp.solved(r.s)){fin=1;if(bu)bu.disabled=true;S.say(sp.win?sp.win(r.s,hist.length-1):'Solved.');
      S.later(function(){api.done({solved:true,moves:hist.length-1,hints:hints,undos:undos,extra:{par:inst.par}})},o&&o.delay!=null?o.delay:350)}
    return true}
  function undo(){if(fin||hist.length<2)return false;hist.pop();undos++;lvl=0;hintLabel();if(sp.reset)sp.reset();render();S.say('Undone. You are back to '+pzaPl(hist.length-1,'move')+'.');return true}
  function restart(){if(fin)return false;hist=[sp.init()];lvl=0;hintLabel();if(sp.reset)sp.reset();render();S.say('Back to the start.');return true}
  function hint(n){if(fin)return null;n=Math.max(1,Math.min(3,n||lvl+1));lvl=n;hints++;clearMarks();var t=sp.hint(ctx.cur(),n);S.say(t||'No hint right now. Undo a move or restart.');hintLabel();return t}
  if(S.showBar){bu=pzBtn('Undo',undo);bh=pzBtn('Hint',function(){hint()});br=pzBtn('Restart',restart);S.bar.appendChild(bu);S.bar.appendChild(bh);S.bar.appendChild(br)}
  if(sp.key)S.key(function(e){return fin?false:sp.key(e.key,ctx.cur())});
  render();
  return {undo:undo,hint:hint,restart:restart,destroy:S.destroy,moves:function(){return hist.length-1}}}

/* ================= mounts ================= */
function pzaArrowDir(k){return k==='ArrowUp'?0:k==='ArrowDown'?1:k==='ArrowLeft'?2:k==='ArrowRight'?3:-1}

/* ---- 1. Slide Tiles ---- */
function pzaMountSlide(root,inst,api){
  return pzaEngine(root,inst,api,function(inst,ctx){
    var n=inst.n,N=n*n,btns={},grid=pzEl('div',{class:'pza-sg'}),gap=pzEl('div',{class:'pza-gap',role:'img','aria-label':'The gap'},[pzEl('span',{class:'pza-face',text:'gap'})]),size=(100/n)+'%';
    function place(el,p){el.style.width=size;el.style.height=size;el.style.transform='translate('+(p%n*100)+'%,'+(Math.floor(p/n)*100)+'%)'}
    for(var v=1;v<N;v++)(function(v){var b=pzBtn('Tile '+v,function(){ctx.act(v)},{text:''});b.appendChild(pzEl('span',{class:'pza-face','aria-hidden':'true',text:String(v)}));btns[v]=b;grid.appendChild(b)})(v);
    grid.appendChild(gap);ctx.board.appendChild(grid);
    function adj(p,b){return Math.abs((p/n|0)-(b/n|0))+Math.abs(p%n-b%n)===1}
    function dirWord(p,b){return p<b?(b-p===1?'right':'down'):(p-b===1?'left':'up')}
    return {
      init:function(){return inst.tiles.slice()},
      step:function(s,v){var p=s.indexOf(v),b=s.indexOf(0);if(!adj(p,b))return {err:'Tile '+v+' is not next to the gap. A tile can only slide into the gap, so pick one that touches it.'};var t=s.slice();t[b]=v;t[p]=0;return {s:t}},
      render:function(s){var b=s.indexOf(0);place(gap,b);for(var v=1;v<N;v++){var p=s.indexOf(v),el=btns[v],home=p===v-1;place(el,p);el.classList.toggle('ok',home);
        el.setAttribute('aria-label','Tile '+v+', row '+((p/n|0)+1)+', column '+(p%n+1)+(adj(p,b)?', can slide into the gap':'')+(home?', in its place':''))}},
      solved:function(s){for(var i=0;i<N-1;i++)if(s[i]!==i+1)return false;return true},
      win:function(s,m){return 'All the tiles are in order, in '+pzaPl(m,'move')+'.'},
      key:function(k,s){var d=pzaArrowDir(k);if(d<0)return false;var b=s.indexOf(0),r=b/n|0,c=b%n,p=d===2?(c<n-1?b+1:-1):d===3?(c>0?b-1:-1):d===0?(r<n-1?b+n:-1):(r>0?b-n:-1);
        if(p<0){ctx.say('Nothing to slide that way.');return true}ctx.act(s[p]);return true},
      hint:function(s,lv){var t=PZA.slideNext(s,n);if(!t)return null;var p=s.indexOf(t),b=s.indexOf(0),w=dirWord(p,b);
        var side=p<b?(b-p===1?'left':'top'):(p-b===1?'right':'bottom');
        if(lv===1)return 'Look at the tile on the '+side+' side of the gap.';
        if(lv===2)return 'A good tile to slide next is number '+t+'.';
        ctx.mark(btns[t],1);return 'Slide tile '+t+' '+w+' into the gap.'}}
  },{cls:'pza-slide',goal:'Put the tiles in order, 1 to '+(inst.n*inst.n-1)+'.'})}

/* ---- 2. Disc Tower ---- */
function pzaMountTower(root,inst,api){
  return pzaEngine(root,inst,api,function(inst,ctx){
    var n=inst.n,src=-1,pegs=[],stacks=[],names=['left','middle','right'],row=pzEl('div',{class:'pza-tw'});
    for(var i=0;i<3;i++)(function(i){var st=pzEl('span',{class:'pza-stack','aria-hidden':'true'}),cap=pzEl('span',{class:'pza-cap','aria-hidden':'true',text:'Peg '+(i+1)+(i===2?' (goal)':'')});
      var b=pzBtn('Peg '+(i+1),function(){tap(i)},{class:'pza-peg',text:''});b.appendChild(pzEl('span',{class:'pza-rod','aria-hidden':'true'}));b.appendChild(st);b.appendChild(cap);
      b.style.minHeight=(n*1.625+3.2)+'rem';pegs.push(b);stacks.push(st);row.appendChild(b)})(i);
    ctx.board.appendChild(row);
    function tap(i){var s=ctx.cur(),p=pzaTPegs(s,n);
      if(src<0){if(p.indexOf(i)<0){ctx.say('Peg '+(i+1)+' has no discs. Pick a peg that has a disc on it.');return}src=i;ctx.render();
        ctx.say('Disc '+(p.indexOf(i)+1)+' from peg '+(i+1)+' is lifted. Now pick the peg to put it on.');return}
      if(src===i){src=-1;ctx.render();ctx.say('Put back. Pick a peg to start again.');return}
      var a=src;src=-1;if(!ctx.act({a:a,b:i}))ctx.render()}
    return {
      init:function(){return inst.start},
      reset:function(){src=-1},
      step:function(s,m){var p=pzaTPegs(s,n),t=[99,99,99],d;for(d=n-1;d>=0;d--)t[p[d]]=d;
        if(t[m.a]===99)return {err:'Peg '+(m.a+1)+' has no discs to move.'};
        if(t[m.b]<t[m.a])return {err:'Disc '+(t[m.a]+1)+' can not sit on disc '+(t[m.b]+1)+'. A wide disc would squash a narrow one, so only a smaller disc goes on top. Try another peg.'};
        return {s:s+(m.b-m.a)*PZA_PW[t[m.a]],msg:'Moved disc '+(t[m.a]+1)+' to peg '+(m.b+1)+'.'}},
      render:function(s){var p=pzaTPegs(s,n);
        for(var i=0;i<3;i++){var st=stacks[i],ds=[],d;while(st.firstChild)st.removeChild(st.firstChild);
          for(d=0;d<n;d++)if(p[d]===i)ds.push(d);
          ds.forEach(function(d){var e=pzEl('span',{class:'pza-disc',text:String(d+1)});e.style.width=(32+68*d/Math.max(1,n-1))+'%';st.appendChild(e)});
          pegs[i].classList.toggle('sel',src===i);
          var lab='Peg '+(i+1)+' ('+names[i]+(i===2?', the goal peg':'')+'): '+(ds.length?'discs from top '+ds.map(function(d){return d+1}).join(', '):'empty');
          if(src===i)lab+=', top disc lifted';else if(src>=0)lab+=', tap to put the lifted disc here';
          pegs[i].setAttribute('aria-label',lab)}},
      solved:function(s){return s===PZA_PW[n]-1},
      win:function(s,m){return 'The whole tower is on peg 3, in '+pzaPl(m,'move')+'.'},
      hint:function(s,lv){var m=PZA.towerNext(s,n);if(!m)return null;
        if(lv===1)return 'Look at peg '+(m.a+1)+' ('+names[m.a]+').';
        if(lv===2)return 'Move disc '+(m.d+1)+', the top one on peg '+(m.a+1)+'.';
        ctx.mark(pegs[m.a],1);ctx.mark(pegs[m.b],2);return 'Move disc '+(m.d+1)+' from peg '+(m.a+1)+' to peg '+(m.b+1)+'.'}}
  },{cls:'pza-tower',goal:'Move the whole tower to peg 3.'})}

/* ---- 3. Few Swaps ---- */
function pzaMountSwaps(root,inst,api){
  return pzaEngine(root,inst,api,function(inst,ctx){
    var n=inst.n,first=-1,btns=[],grid=pzEl('div',{class:'pza-fs'}),sh=['●','■','◆','▲'];
    for(var i=0;i<n;i++)(function(i){var b=pzBtn('Position '+(i+1),function(){tap(i)},{text:''});b.appendChild(pzEl('i',{'aria-hidden':'true'}));b.appendChild(pzEl('b',{'aria-hidden':'true'}));btns.push(b);grid.appendChild(b)})(i);
    ctx.board.appendChild(grid);
    function tap(i){var s=ctx.cur();
      if(first<0){first=i;ctx.render();ctx.say('Item '+s[i]+' is picked. Now pick the item to swap it with.');return}
      if(first===i){first=-1;ctx.render();ctx.say('Put back. Pick an item to start again.');return}
      var a=first;first=-1;if(!ctx.act({a:a,b:i}))ctx.render()}
    return {
      init:function(){return inst.items.slice()},
      reset:function(){first=-1},
      step:function(s,m){var t=s.slice(),x=t[m.a];t[m.a]=t[m.b];t[m.b]=x;return {s:t,msg:'Swapped item '+s[m.a]+' with item '+s[m.b]+'.'}},
      render:function(s){for(var i=0;i<n;i++){var b=btns[i],v=s[i];b.firstChild.textContent=sh[v%4];b.lastChild.textContent=String(v);b.classList.toggle('ok',v===i+1);b.classList.toggle('sel',first===i);
        b.setAttribute('aria-label','Position '+(i+1)+': item '+v+(v===i+1?', in its place':'')+(first===i?', picked':''))}},
      solved:function(s){for(var i=0;i<n;i++)if(s[i]!==i+1)return false;return true},
      win:function(s,m){return 'All in order, in '+pzaPl(m,'swap')+'.'},
      hint:function(s,lv){var m=PZA.swapNext(s);if(!m)return null;
        if(lv===1)return 'Look at position '+(m.a+1)+'. Its item belongs somewhere else.';
        if(lv===2)return 'Item '+(m.a+1)+' belongs in position '+(m.a+1)+'. It is in position '+(m.b+1)+' now.';
        ctx.mark(btns[m.a],1);ctx.mark(btns[m.b],2);return 'Swap position '+(m.a+1)+' with position '+(m.b+1)+'.'}}
  },{cls:'pza-swaps',goal:'Put the '+inst.n+' items in order, 1 to '+inst.n+'.'})}

/* ---- 4. Make the Target ---- */
function pzaMountTarget(root,inst,api){
  return pzaEngine(root,inst,api,function(inst,ctx){
    var picks=[],op='',numsEl=pzEl('div',{class:'pza-nums'}),opsEl=pzEl('div',{class:'pza-ops',role:'group','aria-label':'Signs'}),pre=pzEl('p',{class:'pza-pre'}),log=pzEl('ol',{class:'pza-log','aria-label':'Your steps'}),
      OPS=[['+','plus'],['−','minus'],['×','times'],['÷','divided by']],opb={},lastFocus=-1,s0=null;
    OPS.forEach(function(o){var b=pzBtn(o[0],function(){tapOp(o[0])},{'aria-label':o[1]});b.setAttribute('aria-pressed','false');opb[o[0]]=b;opsEl.appendChild(b)});
    ctx.board.appendChild(numsEl);ctx.board.appendChild(opsEl);ctx.board.appendChild(pre);ctx.board.appendChild(log);
    function go(){if(picks.length===2&&op){var a=picks[0],b=picks[1],o=op;picks=[];op='';if(!ctx.act({i:a,j:b,op:o}))ctx.render()}}
    function tapNum(i){var k=picks.indexOf(i);if(k>=0)picks.splice(k,1);else if(picks.length<2)picks.push(i);else picks[1]=i;ctx.render();go()}
    function tapOp(o){op=op===o?'':o;ctx.render();go()}
    return {
      init:function(){return {a:inst.nums.slice(),log:[]}},
      reset:function(){picks=[];op=''},
      step:function(s,m){var r=PZA.combine(s.a[m.i],s.a[m.j],m.op);if(r.err)return {err:r.err};
        var a=s.a.filter(function(_,q){return q!==m.i&&q!==m.j});a.push(r.r);lastFocus=a.length-1;return {s:{a:a,log:s.log.concat([r.txt])},msg:r.txt+(a.indexOf(inst.target)>=0?'':'. '+pzaPl(a.length,'number')+' left.')}},
      render:function(s){
        while(numsEl.firstChild)numsEl.removeChild(numsEl.firstChild);var hit=s.a.indexOf(inst.target);
        s.a.forEach(function(v,i){var k=picks.indexOf(i),b=pzBtn(String(v),function(){tapNum(i)},{'aria-label':'Number '+v+(i===hit?', the target':'')+(k>=0?', picked '+(k===0?'first':'second'):'')});
          if(k>=0){b.classList.add('sel');b.appendChild(pzEl('small',{text:k?'2nd':'1st','aria-hidden':'true'}))}if(i===hit)b.classList.add('hit');numsEl.appendChild(b)});
        OPS.forEach(function(o){opb[o[0]].classList.toggle('sel',op===o[0]);opb[o[0]].setAttribute('aria-pressed',op===o[0]?'true':'false')});
        var A=picks.length?s.a[picks[0]]:'?',B=picks.length>1?s.a[picks[1]]:'?';
        pre.textContent=picks.length||op?A+' '+(op||'?')+' '+B:'Pick two numbers and a sign.';
        while(log.firstChild)log.removeChild(log.firstChild);s.log.forEach(function(t){log.appendChild(pzEl('li',{text:t}))});
        if(lastFocus>=0&&s!==s0){s0=s;var f=numsEl.children[lastFocus];lastFocus=-1;if(f&&f.focus)f.focus()}},
      solved:function(s){return s.a.indexOf(inst.target)>=0},
      win:function(s,m){return 'You made '+inst.target+' in '+pzaPl(m,'step')+'.'},
      hint:function(s,lv){var r=PZA.targetSolve(s.a,inst.target,400000);if(!r||!r.path.length)return null;var st=r.path[0];
        if(lv===1)return 'There is a way to make '+inst.target+' in '+pzaPl(r.par,'more step')+'.';
        if(lv===2)return 'Try using the numbers '+st.x+' and '+st.y+' together.';
        var i=s.a.indexOf(st.x),j=s.a.indexOf(st.y,st.x===st.y?i+1:0),nb=numsEl.children;if(nb[i])ctx.mark(nb[i],1);if(nb[j])ctx.mark(nb[j],2);if(opb[st.op])ctx.mark(opb[st.op],3);
        return 'Try '+st.x+' '+st.op+' '+st.y+' = '+st.r+'.'}}
  },{cls:'pza-target',goal:'Make '+inst.target})}

/* ---- 5. Digit Span (no undo: 'Try again') ---- */
var pzaDigitText=false;   /* the text-mode choice lasts for the session */
function pzaMountDigits(root,inst,api){
  var S=pzaShell(root,inst,api,{cls:'pza-digits',goal:'Remember '+inst.n+' digits, then type them back.'}),N=inst.n,D=inst.digits,
    K=(api.relaxed===true||(typeof api.relaxed==='function'&&api.relaxed()))?1.5:1,phase='ready',typed=[],attempt=1,hints=0,fin=false,marks=null,hl=0;
  function clear(){while(S.board.firstChild)S.board.removeChild(S.board.firstChild)}
  function ready(){phase='ready';typed=[];marks=null;clear();S.ct.textContent='Try '+attempt;
    var txt=pzBtn(pzaDigitText?'Text mode: on':'Text mode: off',function(){pzaDigitText=!pzaDigitText;ready()},{'aria-pressed':pzaDigitText?'true':'false'});
    S.board.appendChild(pzEl('div',{class:'pza-big','aria-hidden':'true',text:'?'}));
    S.board.appendChild(pzEl('div',{class:'pza-row'},[pzBtn('Show the digits',start,{class:'pri'}),txt]));
    S.say(pzaDigitText?'Text mode is on. The digits will appear as text and stay until you hide them.':'Ready when you are. '+N+' digits will appear, '+(inst.mode==='all'?'all together':'one at a time')+'. Take your time.')}
  function start(){if(phase!=='ready')return;phase='show';clear();
    var big=pzEl('div',{class:'pza-big'+(inst.mode==='all'||pzaDigitText?' all':''),'aria-live':'polite'}),dots=pzEl('div',{class:'pza-dots','aria-hidden':'true'});S.board.appendChild(big);S.board.appendChild(dots);
    if(pzaDigitText){big.textContent=D.join(' ');S.board.appendChild(pzEl('div',{class:'pza-row'},[pzBtn('Hide and type',typeIn,{class:'pri'})]));S.say('The digits are '+D.join(', ')+'. Hide them when you are ready.');return}
    if(inst.mode==='all'){big.textContent=D.join(' ');S.later(typeIn,Math.max(2200,N*800)*K);return}
    var i=0;for(var d=0;d<N;d++)dots.appendChild(pzEl('i'));
    (function nxt(){if(i>=N){S.later(typeIn,300*K);return}big.textContent=String(D[i]);dots.children[i].className='on';i++;S.later(function(){big.textContent='';S.later(nxt,260*K)},800*K)})()}
  function typeIn(){if(phase!=='show')return;phase='type';typed=[];marks=null;draw();S.say('Now type the digits in the same order.')}
  function draw(){clear();var slots=pzEl('div',{class:'pza-slots',role:'group','aria-label':'Your answer, '+typed.length+' of '+N+' typed'});
    for(var i=0;i<N;i++){var sp=pzEl('span',{class:i===typed.length&&phase==='type'?'cur':''},[typed[i]===undefined?'_':String(typed[i])]);
      if(marks)sp.appendChild(pzEl('small',{text:marks[i]?'✓':'✗','aria-label':marks[i]?'right':'not right'}));slots.appendChild(sp)}
    S.board.appendChild(slots);
    if(phase==='wrong'){S.board.appendChild(pzEl('div',{class:'pza-row'},[pzBtn('Try again',again,{class:'pri'})]));return}
    var pad=pzEl('div',{class:'pza-pad'});
    [1,2,3,4,5,6,7,8,9].forEach(function(k){pad.appendChild(pzBtn(String(k),function(){press(k)}))});
    pad.appendChild(pzBtn('⌫',back,{'aria-label':'Delete last digit',class:'sm'}));pad.appendChild(pzBtn('0',function(){press(0)}));
    var ok=pzBtn('Check',check,{class:'pri sm'});ok.disabled=typed.length<N||phase!=='type';pad.appendChild(ok);S.board.appendChild(pad)}
  function press(k){if(phase!=='type'||typed.length>=N)return;typed.push(k);draw();S.say(typed.length>=N?'All '+N+' typed. Press Check when you are ready.':'Typed '+k+'. '+(N-typed.length)+' to go.')}
  function back(){if(phase!=='type'||!typed.length)return;typed.pop();draw()}
  function check(){if(phase!=='type'||typed.length<N)return;var right=0,i;marks=[];for(i=0;i<N;i++){marks.push(typed[i]===D[i]);if(typed[i]===D[i])right++}
    if(right===N){fin=true;phase='won';draw();S.say('That is right. All '+N+' digits, on try '+attempt+'.');if(api.moved)api.moved();
      S.later(function(){api.done({solved:true,moves:attempt,hints:hints,undos:0,extra:{attempts:attempt,digits:N}})},500);return}
    phase='wrong';attempt++;draw();S.say('Not quite: '+right+' of '+N+' are in the right place. Try again whenever you like.');S.ct.textContent='Try '+attempt}
  function again(){if(fin||phase==='show')return false;if(phase==='type'){attempt++}ready();return true}
  function hint(n){if(fin)return null;n=Math.max(1,Math.min(3,n||hl+1));hl=n;hints++;
    var t=n===1?'There are '+N+' digits.':n===2?'The first digit is '+D[0]+' and the last is '+D[N-1]+'.':'The digits are '+D.join(', ')+'.';S.say(t);return t}
  if(S.showBar){S.bar.appendChild(pzBtn('Hint',function(){hint()}));S.bar.appendChild(pzBtn('Try again',again))}
  S.key(function(e){if(phase!=='type')return false;if(/^[0-9]$/.test(e.key)){press(+e.key);return true}if(e.key==='Backspace'){back();return true}
    if(e.key==='Enter'&&e.target.tagName!=='BUTTON'){check();return true}return false});
  ready();
  return {undo:function(){return false},hint:hint,restart:again,destroy:S.destroy,moves:function(){return attempt}}}

/* ---- 6. Tilt Run ---- */
function pzaMountTilt(root,inst,api){
  return pzaEngine(root,inst,api,function(inst,ctx){
    var W=inst.w,H=inst.h,bl=inst.blocks,size=(100/W)+'%',hgt=(100/H)+'%',board=pzEl('div',{class:'pza-tr',role:'img'}),ball=pzEl('div',{class:'pza-ball','aria-hidden':'true'},[pzEl('span')]),dirs=[],
      names=['up','down','left','right'],arrows=['↑','↓','←','→'],row=pzEl('div',{class:'pza-dir',role:'group','aria-label':'Slide the ball'});
    function cellAt(x,y,cls,kid){var c=pzEl('div',{class:'pza-cell '+cls,'aria-hidden':'true'},[kid]);c.style.left=(x*100/W)+'%';c.style.top=(y*100/H)+'%';c.style.width=size;c.style.height=hgt;board.appendChild(c)}
    var blocksTxt=[],x,y;
    for(y=0;y<H;y++)for(x=0;x<W;x++)if(bl[y*W+x]){cellAt(x,y,'',pzEl('span',{class:'pza-blk',style:'width:86%;height:86%'}));blocksTxt.push('row '+(y+1)+' column '+(x+1))}
    cellAt(inst.gx,inst.gy,'pza-goalc',pzEl('span',{text:'G'}));
    ball.style.width=size;ball.style.height=hgt;board.appendChild(ball);ctx.board.appendChild(board);
    for(var d=0;d<4;d++)dirs.push(pzBtn('Slide '+names[d],(function(d){return function(){ctx.act(d)}})(d),{text:arrows[d]}));
    [2,0,1,3].forEach(function(d){row.appendChild(dirs[d])});ctx.board.appendChild(row);
    var sx0=0,sy0=0,sdown=false;
    ctx.S.on(board,'pointerdown',function(e){sdown=true;sx0=e.clientX;sy0=e.clientY});
    ctx.S.on(board,'pointerup',function(e){if(!sdown)return;sdown=false;var dx=e.clientX-sx0,dy=e.clientY-sy0;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;
      ctx.act(Math.abs(dx)>Math.abs(dy)?(dx>0?3:2):(dy>0?1:0))});
    ctx.S.on(board,'pointercancel',function(){sdown=false});
    return {
      init:function(){return {x:inst.sx,y:inst.sy}},
      step:function(s,d){var r=PZA.slide(W,H,bl,s.x,s.y,d,inst.gx,inst.gy);
        if(r[0]===s.x&&r[1]===s.y)return {err:'The ball is already against a wall or block that way. Try another direction.'};
        return {s:{x:r[0],y:r[1]},msg:'Rolled '+names[d]+' to row '+(r[1]+1)+', column '+(r[0]+1)+(r[0]===inst.gx&&r[1]===inst.gy?', the goal':'')+'.'}},
      render:function(s){ball.style.transform='translate('+(s.x*100)+'%,'+(s.y*100)+'%)';var at=s.x===inst.gx&&s.y===inst.gy;
        board.setAttribute('aria-label','Board '+W+' by '+H+'. Ball at row '+(s.y+1)+', column '+(s.x+1)+'. Goal at row '+(inst.gy+1)+', column '+(inst.gx+1)+(at?'. The ball is on the goal':'')+'. Blocks: '+(blocksTxt.join('; ')||'none')+'.')},
      key:function(k){var d=pzaArrowDir(k);if(d<0)return false;ctx.act(d);return true},
      solved:function(s){return s.x===inst.gx&&s.y===inst.gy},
      win:function(s,m){return 'The ball reached the goal in '+pzaPl(m,'slide')+'.'},
      hint:function(s,lv){var p=PZA.tiltSolve(W,H,bl,s.x,s.y,inst.gx,inst.gy);if(!p)return 'From here the ball can not reach the goal. Undo a slide or restart.';
        if(lv===1)return 'Look at the goal, at row '+(inst.gy+1)+', column '+(inst.gx+1)+'. Think about what could stop the ball there.';
        if(lv===2)return 'The next slide is '+(p[0]<2?'up or down':'left or right')+'.';
        ctx.mark(dirs[p[0]],1);return 'Slide '+names[p[0]]+'.'}}
  },{cls:'pza-tilt',goal:'Slide the ball onto the G.'})}

/* ================= stars: talk about the puzzle and the route only ================= */
function pzaLine(res,inst,unit,shortest){var m=res.moves,p=inst.par;
  if(inst.parExact===false)return 'You solved it in '+pzaPl(m,unit)+'. A good run is about '+p+'.';
  return m<=p?'You solved it in '+pzaPl(m,unit)+', the '+shortest+' possible.':'You solved it in '+pzaPl(m,unit)+'. The '+shortest+' is '+p+'.'}

/* ================= registration ================= */
function pzaReg(d,make,mount,unit,sh,how){d.make=make;d.mount=mount;d.levels=30;d.how=how;
  d.stars=function(res,inst){return {stars:pzStarsByPar(res.moves,inst.par,res.hints),line:pzaLine(res,inst,unit,sh)}};return registerPuzzle(d)}
pzaReg({id:'slide-tiles',name:'Slide Tiles',family:'move',blurb:'Slide numbered tiles into order.',areas:['space','control'],secs:120},PZA.makeSlide,pzaMountSlide,'move','shortest','Tap a tile next to the gap to slide it into the gap, or use the arrow keys. Put the tiles in order, 1 first.');
pzaReg({id:'disc-tower',name:'Disc Tower',family:'move',blurb:'Move a stack of discs to another peg.',areas:['space','control'],secs:120},PZA.makeTower,pzaMountTower,'move','shortest','Tap a peg to lift its top disc, then tap the peg to put it on. A disc can only go on a wider disc or an empty peg.');
pzaReg({id:'few-swaps',name:'Few Swaps',family:'move',blurb:'Put a row in order with as few swaps as you can.',areas:['space','flex'],secs:60},PZA.makeSwaps,pzaMountSwaps,'swap','fewest','Tap two items to swap them. Put the items in order, 1 first, using as few swaps as you can.');
pzaReg({id:'make-target',name:'Make the Target',family:'number',blurb:'Combine numbers until the target appears.',areas:['space'],secs:90},PZA.makeTarget,pzaMountTarget,'step','fewest','Pick two numbers and a sign (+ − × ÷). They join into one new number. Only whole numbers above zero are allowed. Make the target appear.');
pzaReg({id:'digit-span',name:'Digit Span',family:'memory',blurb:'Watch some digits, then type them back.',areas:['memory'],secs:45,undo:false},PZA.makeDigits,pzaMountDigits,'try','fewest','Watch the digits, then type them in the same order on the keypad. Turn on text mode to read them at your own pace.');
PUZZLES['digit-span'].stars=function(res,inst){var a=(res.extra&&res.extra.attempts)||res.moves||1;
  return {stars:a<=1?3:a===2?2:1,line:a<=1?'You typed all '+inst.n+' digits on the first try.':'You typed all '+inst.n+' digits on try '+a+'.'}};
pzaReg({id:'tilt-run',name:'Tilt Run',family:'move',blurb:'Slide the ball until it stops on the goal.',areas:['space','control'],secs:90},PZA.makeTilt,pzaMountTilt,'slide','shortest','Pick a direction (buttons, arrow keys or a swipe). The ball slides until it meets a wall or block. Make it stop on the G.');
