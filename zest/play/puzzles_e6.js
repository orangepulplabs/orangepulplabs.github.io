/* Zest puzzles, wave 3 file e6: Mill Builder, Stone Trap, Hidden Rule Sort. Contract: see puzzles_kit.js.
   Pure generators and solvers first (no DOM, exposed as PZE6 for tests), then one shared shell, then the three mounts.
   Meaning of par: Mill Builder par = fewest light-stone slides that complete a new mill, found by a breadth-first solver against the
   scripted dark reply. Stone Trap par = fewest light moves (place or slide) that capture every dark stone, found by the same kind of solver.
   Both give you par+2 moves. Hidden Rule Sort par = number of cards (every card is sorted once; a wrong pile is a miss, not a move
   toward the par); stars come from misses against inst.budget, the most misses a careful player can need. */
var PZE6={};
function pze6Pl(n,w,p){return n+' '+(n===1?w:(p||w+'s'))}
function pze6KeyOk(e){return !(e.ctrlKey||e.metaKey||e.altKey)&&!/^(INPUT|TEXTAREA|SELECT)$/.test((e.target&&e.target.tagName)||'')}
function pze6Bit(m,i){return ((m>>i)&1)===1}

/* ================= 1. Mill Builder =================
   Board: the classic 24 points on three squares joined at their midpoints, 16 lines of three (mills).
   Point i: ring r=floor(i/8), place j=i%8 going round from the top-left corner; odd j are midpoints and join to the next ring.
   You (light stones) slide one stone per turn to a free neighbouring point. A turn that completes a line of three light stones wins.
   Dark stones reply by a fixed rule: the first dark stone (reading order, top row first, left to right) that has a free neighbour
   slides to its first free neighbour in reading order. Dark never captures and never flies. Nothing is ever removed. */
PZE6.mb={pts:[],nb:[],mills:[],ord:[],rank:[]};
(function(){var M=PZE6.mb,i,r,j;
  for(r=0;r<3;r++){var lo=r,hi=6-r,md=3;var P=[[lo,lo],[md,lo],[hi,lo],[hi,md],[hi,hi],[md,hi],[lo,hi],[lo,md]];for(j=0;j<8;j++)M.pts.push({x:P[j][0],y:P[j][1]})}
  for(i=0;i<24;i++){M.ord.push(i)}M.ord.sort(function(a,b){return M.pts[a].y-M.pts[b].y||M.pts[a].x-M.pts[b].x});
  for(i=0;i<24;i++)M.rank[M.ord[i]]=i;
  for(i=0;i<24;i++){r=Math.floor(i/8);j=i%8;var n=[r*8+(j+1)%8,r*8+(j+7)%8];if(j%2===1){if(r>0)n.push((r-1)*8+j);if(r<2)n.push((r+1)*8+j)}
    n.sort(function(a,b){return M.rank[a]-M.rank[b]});M.nb.push(n)}
  for(r=0;r<3;r++)for(j=0;j<8;j+=2)M.mills.push([r*8+j,r*8+(j+1)%8,r*8+(j+2)%8]);
  for(j=1;j<8;j+=2)M.mills.push([j,8+j,16+j])})();
PZE6.mbName=function(i){var p=PZE6.mb.pts[i];return 'abcdefg'.charAt(p.x)+(p.y+1)};
PZE6.mbMask=function(a){var m=0;a.forEach(function(i){m+=(1<<i)});return m};
PZE6.mbList=function(m){var o=[],i;for(i=0;i<24;i++)if(pze6Bit(m,i))o.push(i);return o};
PZE6.mbNewMill=function(w,to){var M=PZE6.mb,i;for(i=0;i<M.mills.length;i++){var L=M.mills[i];if(L.indexOf(to)>=0&&pze6Bit(w,L[0])&&pze6Bit(w,L[1])&&pze6Bit(w,L[2]))return L}return null};
PZE6.mbAnyMill=function(w){var M=PZE6.mb,i;for(i=0;i<M.mills.length;i++){var L=M.mills[i];if(pze6Bit(w,L[0])&&pze6Bit(w,L[1])&&pze6Bit(w,L[2]))return L}return null};
/* dark reply: returns [from,to] or null (dark passes) */
PZE6.mbReply=function(w,b){var M=PZE6.mb,k,q;for(k=0;k<24;k++){var p=M.ord[k];if(!pze6Bit(b,p))continue;
  for(q=0;q<M.nb[p].length;q++){var t=M.nb[p][q];if(!pze6Bit(w,t)&&!pze6Bit(b,t))return [p,t]}}return null};
PZE6.mbApply=function(w,b,from,to){var nw=w-(1<<from)+(1<<to),rp=PZE6.mbReply(nw,b),nb=b;if(rp)nb=b-(1<<rp[0])+(1<<rp[1]);return {w:nw,b:nb,reply:rp}};
/* breadth-first search: fewest light slides to complete a new mill, at most maxd. Returns {d,path:[[from,to],...]} or null. */
PZE6.mbSolve=function(w,b,maxd){var M=PZE6.mb,seen={},cur=[{w:w,b:b,path:[]}],d,k,s,q,p,t;seen[w+'|'+b]=1;
  for(d=1;d<=maxd;d++){var nxt=[];
    for(k=0;k<cur.length;k++){s=cur[k];
      for(var o=0;o<24;o++){p=M.ord[o];if(!pze6Bit(s.w,p))continue;
        for(q=0;q<M.nb[p].length;q++){t=M.nb[p][q];if(pze6Bit(s.w,t)||pze6Bit(s.b,t))continue;
          var np=s.path.concat([[p,t]]),nw=s.w-(1<<p)+(1<<t);
          if(PZE6.mbNewMill(nw,t))return {d:d,path:np};
          var ap=PZE6.mbApply(s.w,s.b,p,t),key=ap.w+'|'+ap.b;if(seen[key])continue;seen[key]=1;nxt.push({w:ap.w,b:ap.b,path:np})}}}
    cur=nxt;if(!cur.length)break}
  return null};
PZE6.makeMill=function(level,rng){
  var target=1+Math.floor((level-1)*4/29),nw=3+Math.floor((level-1)/10),nbk=2+Math.floor((level-1)/7),best=null,tries,i;
  for(tries=0;tries<500;tries++){
    var pts=pzShuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],rng),W=pts.slice(0,nw),B=pts.slice(nw,nw+nbk),w=PZE6.mbMask(W),b=PZE6.mbMask(B);
    if(PZE6.mbAnyMill(w))continue;
    var s=PZE6.mbSolve(w,b,target);if(!s)continue;
    if(!best||s.d>best.d){best={w:W.slice().sort(function(x,y){return x-y}),b:B.slice().sort(function(x,y){return x-y}),d:s.d}}
    if(s.d===target)break}
  if(!best){var Wf=[0,3,5],Bf=[2,9];var sf=PZE6.mbSolve(PZE6.mbMask(Wf),PZE6.mbMask(Bf),6)||{d:1};best={w:Wf,b:Bf,d:sf.d}}
  return {title:'Level '+level,level:level,white:best.w,black:best.b,par:best.d,limit:best.d+2,parExact:true}};

/* ================= 2. Stone Trap =================
   A 5x5 board (point = y*5+x, row 0 at the top). Light stones are yours, dark stones are not.
   One turn: place a stone from your hand on any free point, or slide one of your stones one step up, down, left or right.
   After your turn, a dark stone is captured if it sits right next to the stone you just moved or placed, in a straight line,
   with another light stone on its far side (the dark stone is trapped between two light stones). You win when no dark stones remain.
   Dark replies by a fixed rule: the first dark stone (reading order) with a free neighbouring point slides to its first free neighbour
   in the order up, left, right, down. Dark never captures. */
PZE6.st={n:5};
PZE6.stName=function(i){return 'abcde'.charAt(i%5)+(Math.floor(i/5)+1)};
PZE6.stNb=function(i){var x=i%5,y=Math.floor(i/5),o=[];if(y>0)o.push(i-5);if(x>0)o.push(i-1);if(x<4)o.push(i+1);if(y<4)o.push(i+5);return o};
PZE6.stCapture=function(w,b,t){var DX=[[0,-1],[-1,0],[1,0],[0,1]],x=t%5,y=Math.floor(t/5),k,cap=[];
  for(k=0;k<4;k++){var ax=x+DX[k][0],ay=y+DX[k][1],cx=x+2*DX[k][0],cy=y+2*DX[k][1];
    if(ax<0||ay<0||ax>4||ay>4||cx<0||cy<0||cx>4||cy>4)continue;
    if(pze6Bit(b,ay*5+ax)&&pze6Bit(w,cy*5+cx))cap.push(ay*5+ax)}
  return cap};
PZE6.stReply=function(w,b){var p,q,nb;for(p=0;p<25;p++){if(!pze6Bit(b,p))continue;nb=PZE6.stNb(p);
  for(q=0;q<nb.length;q++)if(!pze6Bit(w,nb[q])&&!pze6Bit(b,nb[q]))return [p,nb[q]]}return null};
/* one light move: mv=[from,to] (from=-1 means place). Returns {w,b,hand,cap,reply}. */
PZE6.stApply=function(s,mv){var w=s.w,b=s.b,hand=s.hand,t=mv[1],cap,rp,i;
  if(mv[0]<0)hand--;else w-=(1<<mv[0]);w+=(1<<t);
  cap=PZE6.stCapture(w,b,t);for(i=0;i<cap.length;i++)b-=(1<<cap[i]);
  rp=null;if(b>0){rp=PZE6.stReply(w,b);if(rp)b=b-(1<<rp[0])+(1<<rp[1])}
  return {w:w,b:b,hand:hand,cap:cap,reply:rp}};
PZE6.stMoves=function(s){var o=[],p,q,nb;
  if(s.hand>0)for(p=0;p<25;p++)if(!pze6Bit(s.w,p)&&!pze6Bit(s.b,p))o.push([-1,p]);
  for(p=0;p<25;p++){if(!pze6Bit(s.w,p))continue;nb=PZE6.stNb(p);for(q=0;q<nb.length;q++)if(!pze6Bit(s.w,nb[q])&&!pze6Bit(s.b,nb[q]))o.push([p,nb[q]])}
  return o};
PZE6.stSolve=function(s0,maxd,budget){var seen={},cur=[{s:s0,path:[]}],d,k,i,mvs,work=0,cap=budget||250000;seen[s0.w+'|'+s0.b+'|'+s0.hand]=1;
  for(d=1;d<=maxd;d++){var nxt=[],last=d===maxd;
    for(k=0;k<cur.length;k++){mvs=PZE6.stMoves(cur[k].s);var cs=cur[k].s;work+=mvs.length;if(work>cap)return null;
      for(i=0;i<mvs.length;i++){var mv=mvs[i];
        if(last){/* last turn: only the capture matters */var w2=mv[0]<0?cs.w+(1<<mv[1]):cs.w-(1<<mv[0])+(1<<mv[1]),cp=PZE6.stCapture(w2,cs.b,mv[1]),b2=cs.b,q;for(q=0;q<cp.length;q++)b2-=(1<<cp[q]);
          if(b2===0)return {d:d,path:cur[k].path.concat([mv])};continue}
        var r=PZE6.stApply(cs,mv),np=cur[k].path.concat([mv]);
        if(r.b===0)return {d:d,path:np};
        var key=r.w+'|'+r.b+'|'+r.hand;if(seen[key])continue;seen[key]=1;nxt.push({s:{w:r.w,b:r.b,hand:r.hand},path:np})}}
    cur=nxt;if(!cur.length)break}
  return null};
PZE6.makeTrap=function(level,rng){
  var target=1+Math.floor((level-1)/10),inband=(level-1)%10,nbk=Math.min(3,Math.max(1,target-(inband<4?1:0)+(inband>=7?1:0))),nw=2+Math.floor(inband/4),hand=Math.min(3,target+(inband<5?1:0)),best=null,tries,all=[];
  for(var i=0;i<25;i++)all.push(i);
  for(tries=0;tries<(target>=3?14:80);tries++){
    var pts=pzShuffle(all,rng),W=pts.slice(0,nw),B=pts.slice(nw,nw+nbk),s={w:PZE6.mbMask(W),b:PZE6.mbMask(B),hand:hand},bad=false;
    W.forEach(function(p){if(PZE6.stCapture(s.w,s.b,p).length)bad=true});if(bad)continue;
    var r=PZE6.stSolve(s,target);if(!r)continue;
    if(!best||r.d>best.d)best={w:W.slice().sort(function(x,y){return x-y}),b:B.slice().sort(function(x,y){return x-y}),hand:hand,d:r.d};
    if(r.d===target)break}
  if(!best){var sf={w:PZE6.mbMask([6,18]),b:PZE6.mbMask([12]),hand:2},rf=PZE6.stSolve(sf,4)||{d:1};best={w:[6,18],b:[12],hand:2,d:rf.d}}
  return {title:'Level '+level,level:level,white:best.w,black:best.b,hand:best.hand,par:best.d,limit:best.d+2,parExact:true}};

/* ================= 3. Hidden Rule Sort =================
   Four pile cards, each with a shape (circle, diamond, square, triangle), a count (1 to 4) and a pattern (solid, striped, dotted, outline).
   The four piles differ in every one of the three features, so any one feature picks exactly one pile.
   Each card to sort is built so its shape, its count and its pattern each match a DIFFERENT pile. The hidden rule is one feature;
   the rule is the same for K right sorts in a row, then it changes to one of the other two features (announced in the goal line as
   'changes after every K right sorts', but never which one). A wrong pile is a miss and that pile is closed for the card; no card ends
   until it is sorted right. Careful play: first card at most 2 misses, then at most 1 miss after each switch (the rule just left is
   ruled out and the two others remain), so inst.budget = 2 + number of switches. */
PZE6.hrs={SHAPE:['circle','diamond','square','triangle'],PATT:['solid','striped','dotted','outline'],RULE:['shape','count','pattern']};
PZE6.makeSort=function(level,rng){
  var N=12+Math.floor((level-1)*18/29),K=5-Math.floor((level-1)/10),pm=[pzShuffle([0,1,2,3],rng),pzShuffle([0,1,2,3],rng),pzShuffle([0,1,2,3],rng)],
      piles=[0,1,2,3].map(function(i){return [pm[0][i],pm[1][i],pm[2][i]]}),eras=Math.ceil(N/K),rules=[],cards=[],i,r=pzInt(rng,3);
  for(i=0;i<eras;i++){rules.push(r);r=(r+1+pzInt(rng,2))%3}
  for(i=0;i<N;i++){var perm=pzShuffle([0,1,2,3],rng);cards.push({f:[piles[perm[0]][0],piles[perm[1]][1],piles[perm[2]][2]],ans:[perm[0],perm[1],perm[2]]})}
  return {title:'Level '+level,level:level,N:N,K:K,piles:piles,rules:rules,cards:cards,par:N,parExact:true,budget:2+(eras-1)}};
PZE6.hrsRuleAt=function(inst,i){return inst.rules[Math.floor(i/inst.K)]};
PZE6.hrsLabel=function(f){return pze6Pl(f[1]+1,PZE6.hrs.PATT[f[2]]+' '+PZE6.hrs.SHAPE[f[0]])};

/* ================= shared styles (one <style id="pze6-css">) ================= */
var PZE6_CSS='.pze6{display:flex;flex-direction:column;gap:12px;width:100%;max-width:24rem;margin:0 auto;color:var(--ink);font-family:var(--font)}.pze6 *{box-sizing:border-box}'
+'.pze6-top{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:2px 12px}.pze6-goal{margin:0;font:700 1.125rem/1.25 var(--disp)}.pze6-ct{font:650 .875rem var(--font);color:var(--muted)}'
+'.pze6-msg{margin:0;min-height:2.8em;font-size:.9375rem;line-height:1.4;color:var(--muted)}.pze6-note{margin:0;font-size:.8125rem;line-height:1.4;color:var(--muted)}'
+'.pze6-bar{display:flex;flex-wrap:wrap;gap:8px}.pze6-bar .pzb{flex:1 1 5.5rem}'
+'.pze6 .pzb{min-height:3rem;min-width:48px;padding:.25rem 14px;border:0;border-radius:var(--r1);background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);font:700 1rem/1.2 var(--font);color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-align:center}'
+'.pze6 .pzb:active{transform:scale(.97)}.pze6 .pzb:disabled{background:var(--dis-bg);color:var(--dis-ink);box-shadow:none;cursor:default}.pze6 .pzb:focus-visible{outline:3px solid var(--ink);outline-offset:2px}'
+'.pze6 .pzb.pze6-hint{outline:3px dashed var(--ink);outline-offset:3px}.pze6 .pzb[aria-pressed=true]{background:var(--tint);box-shadow:inset 0 0 0 3px var(--accent)}'
/* mill board */
+'.pze6-mb{position:relative;width:100%;max-width:22rem;aspect-ratio:1;margin:0 auto;border-radius:var(--r2);background:var(--surface);box-shadow:0 0 0 1px var(--line)}.pze6-mb svg.ln{position:absolute;left:24px;top:24px;width:calc(100% - 48px);height:calc(100% - 48px);overflow:visible}'
+'.pze6-mb svg.ln line{stroke:var(--edge);stroke-width:2;vector-effect:non-scaling-stroke}.pze6 .pze6-pt{position:absolute;width:48px;height:48px;min-height:48px;padding:0;border:0;border-radius:50%;background:transparent;box-shadow:none;transform:translate(-50%,-50%)}'
+'.pze6 .pze6-pt:disabled{background:transparent}.pze6-pt i{display:block;width:10px;height:10px;border-radius:50%;background:var(--edge)}.pze6-pt i.lt,.pze6-pt i.dk{width:34px;height:34px;display:flex;align-items:center;justify-content:center;font:700 .8125rem/1 var(--font);font-style:normal}'
+'.pze6-pt i.lt{background:var(--surface);color:var(--ink);box-shadow:inset 0 0 0 4px var(--ink)}.pze6-pt i.dk{background:var(--ink);color:var(--surface)}.pze6 .pze6-pt[aria-pressed=true]{background:var(--tint);box-shadow:inset 0 0 0 3px var(--accent)}.pze6 .pze6-pt.pzlast i.dk{box-shadow:0 0 0 3px var(--tint)}'
/* trap board */
+'.pze6-tb{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;width:100%;max-width:20rem;margin:0 auto}.pze6 .pze6-tb .pzb{min-height:48px;min-width:0;aspect-ratio:1;padding:0;border-radius:10px}.pze6-tb .pzb i{display:flex;align-items:center;justify-content:center;width:70%;height:70%;border-radius:50%;font:700 .8125rem/1 var(--font);font-style:normal}'
+'.pze6-tb .pzb i.lt{background:var(--surface);box-shadow:inset 0 0 0 4px var(--ink);color:var(--ink)}.pze6-tb .pzb i.dk{background:var(--ink);color:var(--surface)}.pze6-hand{display:flex;gap:8px;align-items:center;font:650 .9375rem var(--font);flex-wrap:wrap}.pze6-hand b{font:700 1.25rem var(--disp)}'
/* sort */
+'.pze6-card{display:flex;justify-content:center}.pze6-card svg{width:7.5rem;height:7.5rem;border-radius:var(--r2);background:var(--surface);box-shadow:0 0 0 2px var(--ink)}.pze6-piles{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}'
+'.pze6 .pze6-piles .pzb{flex-direction:column;min-height:6.5rem;gap:2px;padding:8px}.pze6-piles svg{width:4rem;height:4rem;display:block}.pze6-piles small{font:650 .8125rem/1.2 var(--font);color:var(--muted)}'
+'.pze6.rm *,.pze6.rm *::before{transition:none!important;animation:none!important}@media (prefers-reduced-motion:reduce){.pze6 *,.pze6 *::before{transition:none!important;animation:none!important}}';
function pze6Css(){if(typeof document==='undefined'||document.getElementById('pze6-css'))return;var s=document.createElement('style');s.id='pze6-css';s.textContent=PZE6_CSS;(document.head||document.documentElement).appendChild(s)}

/* ================= shared shell ================= */
function pze6Shell(root,inst,api,o){
  pze6Css();while(root.firstChild)root.removeChild(root.firstChild);o=o||{};
  var S={timers:[],offs:[],dead:false,onDestroy:[]};
  S.wrap=pzEl('div',{class:'pze6'+(api.rm?' rm':'')+(o.cls?' '+o.cls:'')});
  S.goal=pzEl('p',{class:'pze6-goal',text:o.goal||''});S.ct=pzEl('span',{class:'pze6-ct num'});
  S.board=pzEl('div',{});S.msg=pzEl('p',{class:'pze6-msg'});S.bar=pzEl('div',{class:'pze6-bar'});
  if(!api.say)S.msg.setAttribute('role','status');
  S.wrap.appendChild(pzEl('div',{class:'pze6-top'},[S.goal,S.ct]));S.wrap.appendChild(S.board);S.wrap.appendChild(S.msg);
  S.showBar=!(api.toolbar===false||inst.toolbar===false);if(S.showBar)S.wrap.appendChild(S.bar);
  S.say=function(t){S.msg.textContent=t;if(api.say)api.say(t)};
  S.later=function(fn,ms){var id=setTimeout(function(){if(!S.dead)fn()},ms);S.timers.push(id);return id};
  S.on=function(tg,ty,fn){tg.addEventListener(ty,fn);S.offs.push(function(){tg.removeEventListener(ty,fn)})};
  S.key=function(fn){S.on(document,'keydown',function(e){if(S.dead||!S.wrap.isConnected||!pze6KeyOk(e))return;if(fn(e))e.preventDefault()})};
  S.mark=function(el,ord){if(!el)return;el.classList.add('pze6-hint');el.setAttribute('data-hint-order',ord)};
  S.clearMarks=function(){var m=S.wrap.querySelectorAll('.pze6-hint'),i;for(i=0;i<m.length;i++){m[i].classList.remove('pze6-hint');m[i].removeAttribute('data-hint-order')}};
  S.destroy=function(){S.dead=true;S.timers.forEach(clearTimeout);S.offs.forEach(function(f){f()});S.onDestroy.forEach(function(f){try{f()}catch(e){}});if(S.wrap.parentNode)S.wrap.parentNode.removeChild(S.wrap)};
  root.appendChild(S.wrap);return S}
function pze6Svg(tag,attrs,kids){var e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.keys(attrs||{}).forEach(function(k){e.setAttribute(k,attrs[k])});(kids||[]).forEach(function(c){e.appendChild(c)});return e}
function pze6HintLabel(S,bh,lvl){if(bh){bh.textContent=lvl===0?'Hint':lvl<3?'More hint':'Show again';bh.setAttribute('aria-label',bh.textContent)}}

/* ---- 1. Mill Builder ---- */
function pze6MountMill(root,inst,api){
  var M=PZE6.mb,S=pze6Shell(root,inst,api,{cls:'pze6-mill',goal:'Slide your light stones to make a line of three within '+inst.limit+' moves.'}),
      w=PZE6.mbMask(inst.white),b=PZE6.mbMask(inst.black),hist=[],moves=0,sel=-1,fin=0,over=0,lvl=0,hints=0,btns=[],last=-1,bh,br,bu;
  var bd=pzEl('div',{class:'pze6-mb'}),svg=pze6Svg('svg',{class:'ln',viewBox:'0 0 6 6',preserveAspectRatio:'none','aria-hidden':'true',focusable:'false'});
  M.mills.forEach(function(L){var a=M.pts[L[0]],c=M.pts[L[2]];svg.appendChild(pze6Svg('line',{x1:a.x,y1:a.y,x2:c.x,y2:c.y}))});
  bd.appendChild(svg);
  M.ord.forEach(function(i){var p=M.pts[i],bt=pzBtn(PZE6.mbName(i),function(){tap(i)},{class:'pze6-pt',text:''});
    bt.style.left='calc(24px + (100% - 48px) * '+(p.x/6)+')';bt.style.top='calc(24px + (100% - 48px) * '+(p.y/6)+')';bt.appendChild(pzEl('i',{'aria-hidden':'true'}));btns[i]=bt;bd.appendChild(bt)});
  S.board.appendChild(bd);
  S.board.appendChild(pzEl('p',{class:'pze6-note',text:'Point names run a to g across and 1 to 7 down. Light stones are yours. Dark stones reply by a fixed rule: the first dark stone, reading across then down, that can move slides to its first free neighbour. Nothing is removed.'}));
  function render(){S.clearMarks();S.ct.textContent='Moves '+moves+' of '+inst.limit;
    btns.forEach(function(bt,i){var isW=pze6Bit(w,i),isB=pze6Bit(b,i),ic=bt.firstChild,st=isW?'light stone':isB?'dark stone':'empty';
      ic.className=isW?'lt':isB?'dk':'';ic.textContent=isW?'L':isB?'D':'';
      bt.classList.toggle('pzlast',i===last);
      bt.setAttribute('aria-label',PZE6.mbName(i)+', '+st+(i===sel?', selected':'')+(i===last?', dark stone moved here':''));
      bt.setAttribute('aria-pressed',i===sel?'true':'false');bt.disabled=!!(fin||over)})}
  function freeNb(i){return M.nb[i].filter(function(t){return !pze6Bit(w,t)&&!pze6Bit(b,t)})}
  function tap(i){if(fin||over)return false;
    if(pze6Bit(w,i)){if(sel===i){sel=-1;render();S.say('Stone put down.');return true}
      if(!freeNb(i).length){S.say('That stone has no free neighbouring point. Try another.');return false}
      sel=i;render();S.say('Stone on '+PZE6.mbName(i)+' picked up. Tap a free point next to it along a line.');return true}
    if(sel<0){S.say(pze6Bit(b,i)?'That is a dark stone. Tap one of your light stones first.':'Tap one of your light stones first, then a free point next to it.');return false}
    if(M.nb[sel].indexOf(i)<0||pze6Bit(b,i)){S.say('That point is not a free neighbour of the picked stone. Slide along a line to the next point.');return false}
    return go(sel,i)}
  function go(from,to){hist.push({w:w,b:b,last:last,moves:moves});moves++;sel=-1;lvl=0;pze6HintLabel(S,bh,0);if(api.moved)api.moved();
    var done=PZE6.mbNewMill(w-(1<<from)+(1<<to),to);
    if(done){w=w-(1<<from)+(1<<to);fin=1;render();S.say('You slid '+PZE6.mbName(from)+' to '+PZE6.mbName(to)+' and made a line of three: '+done.map(PZE6.mbName).join(', ')+'. Done in '+pze6Pl(moves,'move')+'.');
      S.later(function(){api.done({solved:true,moves:moves,hints:hints,undos:0,extra:{par:inst.par,used:moves}})},350);return true}
    var ap=PZE6.mbApply(w,b,from,to);w=ap.w;b=ap.b;last=ap.reply?ap.reply[1]:-1;
    var t='You slid '+PZE6.mbName(from)+' to '+PZE6.mbName(to)+'. '+(ap.reply?'Dark slid '+PZE6.mbName(ap.reply[0])+' to '+PZE6.mbName(ap.reply[1])+'.':'Dark had no move.');
    if(moves>=inst.limit){over=1;t+=' That was your last move without a line. Tap Undo or Try again.'}
    render();S.say(t);return true}
  function plan(){var left=inst.limit-moves;return left>0?PZE6.mbSolve(w,b,left):null}
  function hint(n){if(fin)return null;n=Math.max(1,Math.min(3,n||lvl+1));lvl=n;hints++;S.clearMarks();var s=plan(),t;
    if(!s){if(n>=3&&hist.length){undo();t='From there a line was out of reach, so your last move was taken back.';S.say(t);pze6HintLabel(S,bh,lvl);return t}
      t='From here a line is out of reach in the moves left. Take a move back with Undo, or use Try again.';S.say(t);pze6HintLabel(S,bh,lvl);return t}
    var p=s.path[0];
    if(n===1)t='A line can be made from here in '+pze6Pl(s.d,'move')+'. Look for a free point that finishes three light stones in a row.';
    else if(n===2){S.mark(btns[p[0]],1);t='Start with the light stone on '+PZE6.mbName(p[0])+'.'}
    else{S.mark(btns[p[1]],1);t='Slide '+PZE6.mbName(p[0])+' to '+PZE6.mbName(p[1])+'.';go(p[0],p[1])}
    S.say(t);pze6HintLabel(S,bh,lvl);return t}
  function undo(){if(fin||!hist.length)return false;var h=hist.pop();w=h.w;b=h.b;last=h.last;moves=h.moves;sel=-1;over=0;lvl=0;render();S.say('Last move taken back.');return true}
  function restart(){if(fin)return false;w=PZE6.mbMask(inst.white);b=PZE6.mbMask(inst.black);hist=[];moves=0;sel=-1;over=0;last=-1;lvl=0;pze6HintLabel(S,bh,0);render();S.say('Back to the start.');return true}
  if(S.showBar){bu=pzBtn('Undo',undo);bh=pzBtn('Hint',function(){hint()});br=pzBtn('Restart',restart);S.bar.appendChild(bu);S.bar.appendChild(bh);S.bar.appendChild(br)}
  S.say('Tap a light stone, then a free point next to it. Make a line of three light stones within '+pze6Pl(inst.limit,'move')+'.');
  render();
  return {undo:undo,hint:hint,restart:restart,destroy:S.destroy,moves:function(){return moves}}}

/* ---- 2. Stone Trap ---- */
function pze6MountTrap(root,inst,api){
  var S=pze6Shell(root,inst,api,{cls:'pze6-trap',goal:'Trap every dark stone between two light stones within '+inst.limit+' moves.'}),
      st={w:PZE6.mbMask(inst.white),b:PZE6.mbMask(inst.black),hand:inst.hand},hist=[],moves=0,sel=-1,fin=0,over=0,lvl=0,hints=0,btns=[],bh,br,bu;
  var handEl=pzEl('b',{class:'num',text:''}),hl=pzEl('p',{class:'pze6-hand'},[pzEl('span',{text:'Stones in hand'}),handEl]),bd=pzEl('div',{class:'pze6-tb'});
  var i;for(i=0;i<25;i++)(function(i){var bt=pzBtn(PZE6.stName(i),function(){tap(i)},{text:''});bt.appendChild(pzEl('i',{'aria-hidden':'true'}));btns[i]=bt;bd.appendChild(bt)})(i);
  S.board.appendChild(hl);S.board.appendChild(bd);
  S.board.appendChild(pzEl('p',{class:'pze6-note',text:'Tap a free point to place a stone from your hand, or tap one of your stones and then a free point right next to it (up, down, left or right) to slide it. A dark stone is trapped when it is next to the stone you just moved, in a straight line, with another light stone on its far side. Dark replies by a fixed rule: the first dark stone, reading across then down, that can move steps to its first free neighbour, trying up, left, right, then down. Dark never traps.'}));
  function render(){S.clearMarks();S.ct.textContent='Moves '+moves+' of '+inst.limit;handEl.textContent=String(st.hand);
    btns.forEach(function(bt,i){var isW=pze6Bit(st.w,i),isB=pze6Bit(st.b,i),ic=bt.firstChild,s=isW?'light stone':isB?'dark stone':'empty';
      ic.className=isW?'lt':isB?'dk':'';ic.textContent=isW?'L':isB?'D':'';
      bt.setAttribute('aria-label',PZE6.stName(i)+', '+s+(i===sel?', selected':''));bt.setAttribute('aria-pressed',i===sel?'true':'false');bt.disabled=!!(fin||over)})}
  function tap(i){if(fin||over)return false;var isW=pze6Bit(st.w,i),isB=pze6Bit(st.b,i);
    if(isW){if(sel===i){sel=-1;render();S.say('Stone put down.');return true}sel=i;render();S.say('Stone on '+PZE6.stName(i)+' picked up. Tap a free point next to it to slide it.');return true}
    if(isB){S.say('That is a dark stone. You cannot move it.');return false}
    if(sel>=0){if(PZE6.stNb(sel).indexOf(i)<0){S.say('That point is not next to the picked stone. Slide one step up, down, left or right.');return false}return go([sel,i])}
    if(st.hand<1){S.say('No stones left in your hand. Tap one of your stones to slide it.');return false}
    return go([-1,i])}
  function go(mv){hist.push({st:{w:st.w,b:st.b,hand:st.hand},moves:moves});moves++;sel=-1;lvl=0;pze6HintLabel(S,bh,0);if(api.moved)api.moved();
    var r=PZE6.stApply(st,mv);st={w:r.w,b:r.b,hand:r.hand};
    var t=(mv[0]<0?'You placed a stone on '+PZE6.stName(mv[1]):'You slid '+PZE6.stName(mv[0])+' to '+PZE6.stName(mv[1]))+'. '+(r.cap.length?'You trapped the dark stone on '+r.cap.map(PZE6.stName).join(' and ')+'. ':'');
    if(st.b===0){fin=1;render();S.say(t+'No dark stones are left. Done in '+pze6Pl(moves,'move')+'.');S.later(function(){api.done({solved:true,moves:moves,hints:hints,undos:0,extra:{par:inst.par,used:moves}})},350);return true}
    t+=r.reply?'Dark stepped '+PZE6.stName(r.reply[0])+' to '+PZE6.stName(r.reply[1])+'.':'Dark had no move.';
    if(moves>=inst.limit){over=1;t+=' That was your last move. Tap Undo or Try again.'}
    render();S.say(t);return true}
  function plan(){var left=inst.limit-moves;return left>0?PZE6.stSolve(st,Math.min(left,4),120000):null}
  function hint(n){if(fin)return null;n=Math.max(1,Math.min(3,n||lvl+1));lvl=n;hints++;S.clearMarks();var s=plan(),t;
    if(!s){if(n>=3&&hist.length){undo();t='From there the trap was out of reach, so your last move was taken back.';S.say(t);pze6HintLabel(S,bh,lvl);return t}
      t='From here the dark stones cannot all be trapped in the moves left. Take a move back with Undo, or use Try again.';S.say(t);pze6HintLabel(S,bh,lvl);return t}
    var m=s.path[0];
    if(n===1)t='All dark stones can be trapped from here in '+pze6Pl(s.d,'move')+'. A trap needs a light stone on each side of a dark stone, in a line.';
    else if(n===2){S.mark(btns[m[0]<0?m[1]:m[0]],1);t=m[0]<0?'Place a stone from your hand. Look at the marked point.':'Use the light stone on '+PZE6.stName(m[0])+'.'}
    else{S.mark(btns[m[1]],1);t=(m[0]<0?'Place a stone on '+PZE6.stName(m[1]):'Slide '+PZE6.stName(m[0])+' to '+PZE6.stName(m[1]))+'.';go(m)}
    S.say(t);pze6HintLabel(S,bh,lvl);return t}
  function undo(){if(fin||!hist.length)return false;var h=hist.pop();st=h.st;moves=h.moves;sel=-1;over=0;lvl=0;render();S.say('Last move taken back.');return true}
  function restart(){if(fin)return false;st={w:PZE6.mbMask(inst.white),b:PZE6.mbMask(inst.black),hand:inst.hand};hist=[];moves=0;sel=-1;over=0;lvl=0;pze6HintLabel(S,bh,0);render();S.say('Back to the start.');return true}
  if(S.showBar){bu=pzBtn('Undo',undo);bh=pzBtn('Hint',function(){hint()});br=pzBtn('Restart',restart);S.bar.appendChild(bu);S.bar.appendChild(bh);S.bar.appendChild(br)}
  S.say('Place a stone or slide one. Trap every dark stone between two light stones within '+pze6Pl(inst.limit,'move')+'.');
  render();
  return {undo:undo,hint:hint,restart:restart,destroy:S.destroy,moves:function(){return moves}}}

/* ---- 3. Hidden Rule Sort ---- */
var pze6Uid=0;
function pze6CardSvg(f,uid){
  var sv=pze6Svg('svg',{viewBox:'0 0 64 64','aria-hidden':'true',focusable:'false'}),d=pze6Svg('defs'),ink='currentColor';
  d.appendChild(pze6Svg('pattern',{id:uid+'s',width:'4',height:'4',patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'},[pze6Svg('rect',{width:'1.6',height:'4',fill:ink})]));
  d.appendChild(pze6Svg('pattern',{id:uid+'d',width:'5',height:'5',patternUnits:'userSpaceOnUse'},[pze6Svg('circle',{cx:'2.5',cy:'2.5',r:'1.2',fill:ink})]));
  sv.appendChild(d);
  var pos=[null,[[32,32]],[[20,32],[44,32]],[[32,17],[19,43],[45,43]],[[19,19],[45,19],[19,45],[45,45]]][f[1]+1],fill=['currentColor','url(#'+uid+'s)','url(#'+uid+'d)','none'][f[2]];
  pos.forEach(function(c){var x=c[0],y=c[1],h=f[1]>=2?9:13,sh;
    if(f[0]===0)sh=pze6Svg('circle',{cx:x,cy:y,r:h});
    else if(f[0]===1)sh=pze6Svg('polygon',{points:x+','+(y-h-1)+' '+(x+h+1)+','+y+' '+x+','+(y+h+1)+' '+(x-h-1)+','+y});
    else if(f[0]===2)sh=pze6Svg('rect',{x:x-h,y:y-h,width:2*h,height:2*h});
    else sh=pze6Svg('polygon',{points:x+','+(y-h-1)+' '+(x+h+1)+','+(y+h)+' '+(x-h-1)+','+(y+h)});
    sh.setAttribute('fill',fill);sh.setAttribute('stroke',ink);sh.setAttribute('stroke-width','2');sv.appendChild(sh)});
  return sv}
function pze6MountSort(root,inst,api){
  var S=pze6Shell(root,inst,api,{cls:'pze6-sort',goal:'Sort each card onto a pile. The hidden rule changes after every '+inst.K+' right sorts.'}),
      ci=0,misses=0,picks=0,fin=0,lvl=0,hints=0,tried=[],btns=[],bh,br,uid='pze6u'+(++pze6Uid)+'-',cardBox=pzEl('div',{class:'pze6-card',role:'img'}),piles=pzEl('div',{class:'pze6-piles'});
  S.board.appendChild(cardBox);S.board.appendChild(pzEl('p',{class:'pze6-note',style:'text-align:center;margin:8px 0',text:'The rule is one feature: the shape, the count, or the pattern. Tap the pile you think it picks.'}));S.board.appendChild(piles);
  inst.piles.forEach(function(f,j){var bt=pzBtn('Pile '+(j+1),function(){pick(j)},{text:''});bt.appendChild(pze6CardSvg(f,uid+j));bt.appendChild(pzEl('small',{'aria-hidden':'true',text:'Pile '+(j+1)}));btns.push(bt);piles.appendChild(bt)});
  function cur(){return inst.cards[ci]}
  function render(){S.clearMarks();var c=cur();cardBox.textContent='';cardBox.setAttribute('aria-label','Card to sort: '+PZE6.hrsLabel(c.f));cardBox.appendChild(pze6CardSvg(c.f,uid+'c'));
    S.ct.textContent='Card '+(ci+1)+' of '+inst.N+(misses?' · misses '+misses:'');
    btns.forEach(function(bt,j){var tr=tried.indexOf(j)>=0;bt.setAttribute('aria-label','Pile '+(j+1)+': '+PZE6.hrsLabel(inst.piles[j])+(tr?', not this one for this card':''));bt.disabled=!!(fin||tr)})}
  function pick(j){if(fin||tried.indexOf(j)>=0)return false;picks++;if(api.moved)api.moved();lvl=0;pze6HintLabel(S,bh,0);var rule=PZE6.hrsRuleAt(inst,ci),c=cur();
    if(c.ans[rule]===j){tried=[];
      if(ci>=inst.N-1){fin=1;ci=inst.N-1;render();S.ct.textContent='All '+inst.N+' cards sorted';S.say('Yes. That was the last card. You sorted '+inst.N+' cards with '+pze6Pl(misses,'miss','misses')+'.');
        S.later(function(){api.done({solved:true,moves:picks,hints:hints,undos:0,extra:{par:inst.par,misses:misses,budget:inst.budget}})},350)}
      else{var sw=((ci+1)%inst.K===0);ci++;render();S.say('Yes, that pile fits. Next card.'+(sw?' The rule may have just changed.':''))}}
    else{misses++;tried.push(j);render();S.say('Not that pile. Try another one.')}
    return true}
  function hint(n){if(fin)return null;n=Math.max(1,Math.min(3,n||lvl+1));lvl=n;hints++;S.clearMarks();var rule=PZE6.hrsRuleAt(inst,ci),c=cur(),t;
    if(n===1)t='The rule is one of three features: shape, count or pattern. A wrong pile rules one out, and it never stays the same rule after a change.';
    else if(n===2){var k=(rule+1)%3;t='The rule right now is not '+PZE6.hrs.RULE[k]+'.'}
    else{S.mark(btns[c.ans[rule]],1);t='The rule is the '+PZE6.hrs.RULE[rule]+', so the marked pile fits. I sorted this card for you.';S.say(t);pick(c.ans[rule]);return t}
    S.say(t);pze6HintLabel(S,bh,lvl);return t}
  function restart(){if(fin)return false;ci=0;misses=0;picks=0;tried=[];lvl=0;pze6HintLabel(S,bh,0);render();S.say('Back to the first card.');return true}
  if(S.showBar){bh=pzBtn('Hint',function(){hint()});br=pzBtn('Try again',restart);S.bar.appendChild(bh);S.bar.appendChild(br)}
  S.key(function(e){var j='1234'.indexOf(e.key);if(j>=0&&!fin){pick(j);return true}return false});
  S.say('Look at the card and tap a pile. You will be told if the pile fits. Press 1 to 4 to choose a pile. Try again starts over.');
  render();
  return {undo:function(){return false},hint:hint,restart:restart,destroy:S.destroy,moves:function(){return picks}}}

/* ================= registration ================= */
function pze6Stars3(s,hints){return hints&&s===3?2:s}
registerPuzzle({id:'mill-builder',name:'Mill Builder',family:'move',theme:'F9',areas:['space','control'],levels:30,secs:120,
  blurb:'Slide stones along a classic board to make a line of three.',
  how:'Tap one of your light stones, then a free point next to it along a line, to slide it. Make a line of three light stones within the move limit. Dark stones reply by a fixed rule, shown on screen. Nothing is removed. Undo is free.',
  make:PZE6.makeMill,mount:pze6MountMill,
  stars:function(res,inst){var u=res.extra&&res.extra.used!=null?res.extra.used:res.moves;
    return {stars:pze6Stars3(pzStarsByPar(u,inst.par,0),res.hints),line:'You made a line of three in '+pze6Pl(u,'move')+'. The shortest is '+inst.par+'.'}}});
registerPuzzle({id:'stone-trap',name:'Stone Trap',family:'grid',theme:'F9',areas:['space','control'],levels:30,secs:120,
  blurb:'Place and slide stones to trap every dark stone.',
  how:'On a 5 by 5 board, place a stone from your hand or slide one of yours a step. A dark stone is trapped when it sits next to the stone you just moved, in a straight line, with another light stone behind it. Trap them all within the move limit. Dark replies by a fixed rule. Undo is free.',
  make:PZE6.makeTrap,mount:pze6MountTrap,
  stars:function(res,inst){var u=res.extra&&res.extra.used!=null?res.extra.used:res.moves;
    return {stars:pze6Stars3(pzStarsByPar(u,inst.par,0),res.hints),line:'You trapped every dark stone in '+pze6Pl(u,'move')+'. The shortest is '+inst.par+'.'}}});
registerPuzzle({id:'hidden-rule-sort',name:'Hidden Rule Sort',family:'memory',theme:'F10',areas:['flex','attention'],levels:30,secs:120,undo:false,
  blurb:'Sort cards by a rule nobody tells you, and notice when it changes.',
  how:'Each card has a shape, a count and a pattern. Tap the pile you think it belongs on, and you are told if it fits. The hidden rule is one of those three features and changes after a set number of right sorts. A wrong pile just closes that pile for the card. Try again starts over.',
  make:PZE6.makeSort,mount:pze6MountSort,
  stars:function(res,inst){var ms=res.extra&&res.extra.misses!=null?res.extra.misses:0,bd=inst.budget,s=ms<=bd?3:ms<=bd+2?2:1;
    return {stars:pze6Stars3(s,res.hints),line:'You sorted '+inst.N+' cards with '+pze6Pl(ms,'miss','misses')+'. Three stars need '+bd+' or fewer: a careful player can need that many.'}}});
