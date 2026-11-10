/* Zest v6 new puzzle (batch f): Safe Queens (id bezzel-queens). A NEW core for the original eight-safe-queens (scored 21, arrow buttons, no designed deduction).
   Rule: place a queen on every row so that no two queens share a row, column or diagonal. Some queens are given (pinned). Rocks hold no queen,
   but lines of attack pass over them. Every level has exactly one answer.
   Levels are CURATED by tests/batch_f_gen_queens.js: a random n-queens answer, then rocks and given queens added until the answer is unique,
   then every rock or given that is not needed is taken away again. Aha filter: the level must NOT fall to singles (a row or column with one
   safe square left); from level 4 it needs at least one "what if" step (a queen on square X would leave some row or column with no safe
   square, so X is out), and later levels need two or more. The squares attacked by the queens on the board are shaded, so singles are a
   glance and the thinking is the what-if.
   Stuck policy (1.2.4): a queen placed where another queen attacks it breaks the rule: flagged at once (both queens outlined, the line of
   attack drawn, chip with Undo). A legal queen that is not in the one answer is a lost position: the kit's deferred 'dead' chip.
   Par = queens to place; a removal is a move too, so 3 stars = no wrong queen. */
(function(){
var ID='bezzel-queens';
var LEVELS=[[4,[14],[],[1,7,8,14],0],[5,[11],[18],[0,8,11,19,22],0],[5,[3],[6],[3,5,12,19,21],1],[5,[4],[6],[4,7,10,18,21],1],[6,[27],[16,18,30],[4,8,12,23,27,31],1],[6,[3,32],[],[3,6,16,19,29,32],1],[6,[17],[7,25,28],[1,9,17,18,26,34],2],[5,[19,21],[],[3,5,12,19,21],2],[6,[12],[20,21],[4,8,12,23,27,31],2],[6,[13],[9,29],[2,11,13,22,24,33],3],[7,[4,26],[31],[4,13,15,26,30,35,45],2],[6,[13,24],[],[2,11,13,22,24,33],2],[7,[6,21],[],[6,11,16,21,33,38,43],3],[7,[26,35],[],[4,13,15,26,30,35,45],3],[6,[2],[19,21,25,28],[2,11,13,22,24,33],4],[7,[21,48],[],[1,10,19,21,30,39,48],3],[7,[33,48],[],[3,7,18,22,33,37,48],4],[7,[0,11],[],[0,11,15,26,30,41,45],3],[7,[33,46],[7,13],[0,10,20,23,33,36,46],4],[7,[24],[11,29,33,34],[5,9,20,24,28,39,43],4],[6,[9],[13,28],[1,9,17,18,26,34],3],[7,[5,42],[],[5,10,15,27,32,37,42],4],[7,[4,19],[34],[4,7,19,24,29,41,44],5],[7,[29],[9,16,44],[2,7,19,24,29,41,46],4],[7,[6,40],[],[6,10,14,25,29,40,44],6],[7,[7,17],[],[4,7,17,27,30,40,43],4],[7,[4],[14,19,24,37,40],[4,13,15,26,30,35,45],6],[7,[39,44],[],[0,12,17,22,34,39,44],6],[7,[1,13],[],[1,13,18,23,28,40,45],6],[7,[5,20],[9],[5,10,20,21,30,39,43],7]]; /*LEVELS*/
/* ---- core: cells are r*n+c ---- */
function att(n,a,b){var ra=(a/n)|0,ca=a%n,rb=(b/n)|0,cb=b%n;return ra===rb||ca===cb||Math.abs(ra-rb)===Math.abs(ca-cb)}
function count(n,giv,rocks,cap){cap=cap||2;var rock={},cols=[],sols=0,fixed={};rocks.forEach(function(c){rock[c]=1});giv.forEach(function(c){fixed[(c/n)|0]=c%n});var Q=[];
  function ok(r,c){for(var i=0;i<Q.length;i++){var q=Q[i],qr=(q/n)|0,qc=q%n;if(qc===c||Math.abs(qr-r)===Math.abs(qc-c))return false}return true}
  function rec(r){if(sols>=cap)return;if(r===n){sols++;return}if(fixed[r]!=null){var c0=fixed[r];if(ok(r,c0)){Q.push(r*n+c0);rec(r+1);Q.pop()}return}
    for(var c=0;c<n;c++){if(rock[r*n+c])continue;var fc=false;for(var k in fixed)if(fixed[k]===c&&+k!==r)fc=true;if(fc)continue;if(ok(r,c)){Q.push(r*n+c);rec(r+1);Q.pop()}}}
  rec(0);return sols}
/* candidates of the free rows/cols, given queens Q and out-squares X */
function cands(n,Q,rocks,X){var rock={},bad={};rocks.forEach(function(c){rock[c]=1});(X||[]).forEach(function(c){bad[c]=1});var rq={},cq={};Q.forEach(function(q){rq[(q/n)|0]=1;cq[q%n]=1});
  var out=[];for(var r=0;r<n;r++){if(rq[r])continue;for(var c=0;c<n;c++){var s=r*n+c;if(cq[c]||rock[s]||bad[s])continue;var free=true;for(var i=0;i<Q.length;i++)if(att(n,Q[i],s)){free=false;break}if(free)out.push(s)}}
  return{list:out,rq:rq,cq:cq}}
/* singles to a fixpoint; returns {Q, dead:bool} */
function singles(n,Q,rocks,X){Q=Q.slice();for(var guard=0;guard<n*2;guard++){var C=cands(n,Q,rocks,X),byR={},byC={};C.list.forEach(function(s){(byR[(s/n)|0]=byR[(s/n)|0]||[]).push(s);(byC[s%n]=byC[s%n]||[]).push(s)});
    for(var r=0;r<n;r++)if(!C.rq[r]&&!byR[r])return{Q:Q,dead:true};for(var c=0;c<n;c++)if(!C.cq[c]&&!byC[c])return{Q:Q,dead:true};
    var pick=null;for(var r2=0;r2<n&&pick==null;r2++)if(byR[r2]&&byR[r2].length===1)pick=byR[r2][0];for(var c2=0;c2<n&&pick==null;c2++)if(byC[c2]&&byC[c2].length===1)pick=byC[c2][0];
    if(pick==null)return{Q:Q,dead:false};Q.push(pick)}return{Q:Q,dead:false}}
/* does some free row or column have no safe square? (a what-if is DIRECT: the queen on X itself empties a line; the press preview shows it) */
function emptyLine(n,Q,rocks,X){var C=cands(n,Q,rocks,X),hr={},hc={};C.list.forEach(function(z){hr[(z/n)|0]=1;hc[z%n]=1});for(var r=0;r<n;r++)if(!C.rq[r]&&!hr[r])return true;for(var c=0;c<n;c++)if(!C.cq[c]&&!hc[c])return true;return false}
/* human-style solve: singles, else one what-if elimination. Returns {ok, looks, steps:[{t:'single'|'look', cell, why}]} */
function logic(n,Q,rocks,X){Q=Q.slice();X=(X||[]).slice();var steps=[],looks=0;
  for(var guard=0;guard<200;guard++){if(Q.length===n)return{ok:true,looks:looks,steps:steps};
    var C=cands(n,Q,rocks,X),byR={},byC={};C.list.forEach(function(s){(byR[(s/n)|0]=byR[(s/n)|0]||[]).push(s);(byC[s%n]=byC[s%n]||[]).push(s)});
    var dead=false;for(var r=0;r<n;r++)if(!C.rq[r]&&!byR[r])dead=true;for(var c=0;c<n;c++)if(!C.cq[c]&&!byC[c])dead=true;if(dead)return{ok:false,looks:looks,steps:steps,dead:true};
    var pick=null,why=null;for(var r2=0;r2<n&&pick==null;r2++)if(byR[r2]&&byR[r2].length===1){pick=byR[r2][0];why={row:r2}}
    for(var c2=0;c2<n&&pick==null;c2++)if(byC[c2]&&byC[c2].length===1){pick=byC[c2][0];why={col:c2}}
    if(pick!=null){Q.push(pick);steps.push({t:'single',cell:pick,why:why});continue}
    var el=null;for(var i=0;i<C.list.length&&el==null;i++){var s=C.list[i];if(emptyLine(n,Q.concat([s]),rocks,X)){el=s;
        /* which line empties first (for the hint): the first free row/col with no candidate after placing s */
        var C2=cands(n,Q.concat([s]),rocks,X),hasR={},hasC={};C2.list.forEach(function(z){hasR[(z/n)|0]=1;hasC[z%n]=1});var line=null;
        for(var rr=0;rr<n&&!line;rr++)if(!C2.rq[rr]&&!hasR[rr])line={row:rr};for(var cc=0;cc<n&&!line;cc++)if(!C2.cq[cc]&&!hasC[cc])line={col:cc};why=line}}
    if(el==null)return{ok:false,looks:looks,steps:steps};X.push(el);looks++;steps.push({t:'look',cell:el,why:why})}
  return{ok:false,looks:looks,steps:steps}}
function make(level,rng){level=Math.max(1,Math.min(LEVELS.length,level|0||1));var L=LEVELS[level-1],n=L[0],giv=L[1].slice(),rocks=L[2].slice(),sol=L[3].slice();
  /* the seed may mirror the board left-right (same logic, same par) */
  if(pzInt(rng,2)){var m=function(s){var r=(s/n)|0,c=s%n;return r*n+(n-1-c)};giv=giv.map(m);rocks=rocks.map(m);sol=sol.map(m)}
  return{level:level,title:'Level '+level,n:n,givens:giv,rocks:rocks,sol:sol,par:n-giv.length,looks:L[4],parExact:true}}
window.V6BQ={make:make,att:att,emptyLine:emptyLine,count:count,cands:cands,logic:logic,singles:singles,levels:function(){return LEVELS}};

var CSS=''
+'.bq{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);'
+'--bq-l:#F6ECD9;--bq-d:#EEDFC4;--bq-frame:#8A6A45;--bq-shade:rgba(70,40,12,.30);--bq-hatch:rgba(70,40,12,.30);--bq-q:#1F2A44;--bq-qg:#8E5B1E;--bq-ray:rgba(232,89,12,.55);--bq-rock:#8C857A}'
+':root[data-theme="dark"] .bq{--bq-l:#97876F;--bq-d:#8D7D66;--bq-frame:#2A221B;--bq-shade:rgba(0,0,0,.50);--bq-hatch:rgba(0,0,0,.45);--bq-q:#F4EEE2;--bq-qg:#F0B45A;--bq-ray:rgba(255,150,90,.6);--bq-rock:#9A9286}'
+'.bq-b{position:relative;box-sizing:border-box;padding:5px;border-radius:14px;background:var(--bq-frame);box-shadow:0 4px 12px rgba(0,0,0,.2);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.bq-g{position:relative;display:grid;border-radius:9px;overflow:hidden}'
+'.bq-c{all:unset;position:relative;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center}'
+'.bq-c.l{background:var(--bq-l)}.bq-c.d{background:var(--bq-d)}'
+'.bq-c{box-shadow:inset 0 0 0 .5px rgba(70,40,12,.18)}.bq-c::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(45deg,var(--bq-hatch) 0 2px,transparent 2px 7px),var(--bq-shade);opacity:0;transition:opacity .25s;pointer-events:none}'
+'.bq-c.hit::after{opacity:1}'
+'.bq-c.rk::before{content:"";position:absolute;inset:16%;border-radius:42% 48% 40% 50%;background:radial-gradient(circle at 35% 30%,#B9B2A6,var(--bq-rock) 60%,#5E584F);box-shadow:0 2px 2px rgba(0,0,0,.3)}'
+'.bq-c:focus-visible{outline:3px solid var(--ink);outline-offset:-3px}'
+'.bq-c.zk-mark{outline-offset:-4px}'
+'.bq-q{position:relative;width:74%;height:74%;pointer-events:none;z-index:2}'
+'.bq-q svg{width:100%;height:100%;display:block;filter:drop-shadow(0 2px 1.5px rgba(0,0,0,.35))}'
+'.bq-q.gv svg .bq-base{fill:var(--bq-qg)}'
+'.bq-rays{position:absolute;inset:5px;pointer-events:none;z-index:3;overflow:visible}'
+'.bq-rays line{stroke:var(--bq-ray);stroke-width:5;stroke-linecap:round}'
+'.bq-rays line.clash{stroke:#E9A23B;stroke-width:6}'
+'.bq-crowns{display:flex;gap:4px;min-height:34px;align-items:center}.bq-crowns i{width:32px;height:32px;display:block;transition:opacity .2s}.bq-crowns i svg{width:100%;height:100%}.bq-crowns i.used{opacity:.22;filter:grayscale(1)}'
+'.bq-fly{position:absolute;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;pointer-events:none;z-index:8}.bq-fly svg{width:100%;height:100%;filter:drop-shadow(0 4px 4px rgba(0,0,0,.3))}'
+'@media (prefers-reduced-motion:reduce){.bq-c::after{transition:none}}.zk-rm .bq-c::after{transition:none}';
function queenSvg(){return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 30l-3-17 8 7 7-12 7 12 8-7-3 17z" fill="var(--bq-q)" stroke="#1B1916" stroke-width="1.6" stroke-linejoin="round"/><circle cx="5" cy="12" r="2.6" fill="var(--bq-q)" stroke="#1B1916" stroke-width="1.2"/><circle cx="20" cy="7" r="2.6" fill="var(--bq-q)" stroke="#1B1916" stroke-width="1.2"/><circle cx="35" cy="12" r="2.6" fill="var(--bq-q)" stroke="#1B1916" stroke-width="1.2"/><rect class="bq-base" x="7" y="30" width="26" height="6" rx="2" fill="var(--bq-q)" stroke="#1B1916" stroke-width="1.6"/></svg>'}

function mount(root,inst,api){ZK.css(CSS,'bq-css');root.textContent='';
  var n=inst.n,rm=ZK.rm(api),giv=inst.givens,rocks=inst.rocks,sol=inst.sol,G={},R={},S={},mine=[],hist=[],hints=0,undos=0,fin=false,last=null,idle=null,ghost=null,offs=[],pressC=-1;
  giv.forEach(function(c){G[c]=1});rocks.forEach(function(c){R[c]=1});sol.forEach(function(c){S[c]=1});
  var stage=document.createElement('div');stage.className='bq zk-stage zk-host'+(rm?' zk-rm':'');
  var crowns=document.createElement('div');crowns.className='bq-crowns';crowns.setAttribute('aria-hidden','true');
  var b=document.createElement('div');b.className='bq-b zk-board';b.setAttribute('role','group');b.setAttribute('aria-label','Board '+n+' by '+n+'. Place '+n+' queens that do not attack each other');
  var g=document.createElement('div');g.className='bq-g';b.appendChild(g);
  var NS='http://www.w3.org/2000/svg',rays=document.createElementNS(NS,'svg');rays.setAttribute('class','bq-rays');b.appendChild(rays);
  var cells=[];for(var s=0;s<n*n;s++)(function(s){var e=document.createElement('button');e.type='button';e.className='bq-c '+((((s/n)|0)+s%n)%2?'d':'l')+(R[s]?' rk':'');
    e.setAttribute('data-zkc','');e.onclick=function(){tap(s)};cells.push(e);g.appendChild(e)})(s);
  for(var i=0;i<inst.par;i++){var ci=document.createElement('i');ci.innerHTML=queenSvg();crowns.appendChild(ci)}
  var pips=ZK.pips(inst.par);
  stage.appendChild(crowns);stage.appendChild(b);root.appendChild(stage);
  var CS=48;
  function layout(){var avail=stage.clientWidth||300;var full=Math.min((window.innerWidth||360)-2,372);
    CS=Math.floor((avail-10)/n);if(CS<44&&full>avail){CS=Math.floor((full-10)/n);b.style.marginLeft=b.style.marginRight=(-(full-avail)/2)+'px'}else b.style.marginLeft=b.style.marginRight='';
    CS=Math.min(CS,64);g.style.gridTemplateColumns='repeat('+n+','+CS+'px)';g.style.gridAutoRows=CS+'px';rays.setAttribute('viewBox','0 0 '+(n*CS)+' '+(n*CS));rays.style.width=rays.style.height=(n*CS)+'px'}
  function queens(){return giv.concat(mine)}
  function ctr(s){return{x:(s%n+.5)*CS,y:(((s/n)|0)+.5)*CS}}
  function paint(){var Q=queens(),hit={};Q.forEach(function(q){for(var t=0;t<n*n;t++)if(t!==q&&V6BQ.att(n,q,t))hit[t]=1});
    cells.forEach(function(e,s){var has=G[s]||mine.indexOf(s)>=0;e.classList.toggle('hit',!!hit[s]&&!has&&!R[s]);
      if(has&&!e.firstChild){var q=document.createElement('span');q.className='bq-q'+(G[s]?' gv':'');q.innerHTML=queenSvg();e.appendChild(q)}
      if(!has&&e.firstChild)e.textContent='';
      var rr=((s/n)|0)+1,cc=s%n+1;e.setAttribute('aria-label','Row '+rr+', column '+cc+(R[s]?', rock':G[s]?', given queen':has?', your queen':hit[s]?', attacked':', safe'))});
    [].forEach.call(crowns.children,function(c,i){c.classList.toggle('used',i>=inst.par-mine.length)})}
  function clashPairs(){var Q=queens(),out=[];for(var i=0;i<Q.length;i++)for(var j=i+1;j<Q.length;j++)if(V6BQ.att(n,Q[i],Q[j]))out.push([Q[i],Q[j]]);return out}
  function drawRays(s,cls,dur){while(rays.firstChild)rays.removeChild(rays.firstChild);if(s<0)return;var p=ctr(s),r=(s/n)|0,c=s%n;
    [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(d,k){var rr=r,cc=c;while(rr+d[0]>=0&&rr+d[0]<n&&cc+d[1]>=0&&cc+d[1]<n){rr+=d[0];cc+=d[1]}
      if(rr===r&&cc===c)return;var e=ctr(rr*n+cc),ln=document.createElementNS(NS,'line');ln.setAttribute('x1',p.x);ln.setAttribute('y1',p.y);ln.setAttribute('x2',e.x);ln.setAttribute('y2',e.y);
      if(!rm){var L=Math.hypot(e.x-p.x,e.y-p.y);ln.style.strokeDasharray=L;ln.style.strokeDashoffset=L;ln.animate([{strokeDashoffset:L},{strokeDashoffset:0}],{duration:dur||180,easing:'ease-out',fill:'forwards'})}
      rays.appendChild(ln)})}
  function clearRays(fade){if(!rays.firstChild)return;if(fade&&!rm){var a=ZK.anim(rays,[{opacity:1},{opacity:0}],260);if(a)a.onfinish=function(){drawRays(-1);rays.style.opacity=''};else drawRays(-1)}else drawRays(-1)}
  function clashLine(a,bb){drawRays(-1);var p=ctr(a),q=ctr(bb),ln=document.createElementNS(NS,'line');ln.setAttribute('class','clash');ln.setAttribute('x1',p.x);ln.setAttribute('y1',p.y);ln.setAttribute('x2',q.x);ln.setAttribute('y2',q.y);rays.appendChild(ln)}
  function L(tg,ty,fn,o){tg.addEventListener(ty,fn,o);offs.push(function(){tg.removeEventListener(ty,fn,o)})}
  L(b,'pointerdown',function(e){if(fin)return;var el=e.target.closest&&e.target.closest('.bq-c');if(!el)return;var s=cells.indexOf(el);if(G[s]||R[s]||mine.indexOf(s)>=0||clashPairs().length)return;pressC=s;drawRays(s,null,160);ZK.sfx('press')});
  L(document,'pointerup',function(){if(pressC>=0){pressC=-1;setTimeout(function(){if(!clashPairs().length)clearRays(true)},0)}});
  L(document,'pointercancel',function(){pressC=-1;clearRays()});
  function check(){var cp=clashPairs();ZK.unmark(stage);
    if(cp.length){var p=cp[0];clashLine(p[0],p[1]);ZK.stuck(stage,true,{kind:'rule',text:'These two queens attack each other',cells:[cells[p[0]],cells[p[1]]]});return}
    ZK.stuck(stage,false);
    var wrong=mine.some(function(s){return !S[s]});
    if(wrong){var t=V6BQ.cands(n,queens(),rocks,[]),dead=false,byR={},byC={};t.list.forEach(function(z){byR[(z/n)|0]=1;byC[z%n]=1});for(var r=0;r<n;r++)if(!t.rq[r]&&!byR[r])dead=true;for(var c=0;c<n;c++)if(!t.cq[c]&&!byC[c])dead=true;
      ZK.stuck(stage,true,{text:dead?'A row or column has no safe square left':'These queens can’t all fit now'})}
    if(queens().length===n&&!cp.length&&!wrong)win()}
  function tap(s){if(fin||R[s]||G[s])return;stopGhost();var k=mine.indexOf(s);
    if(k>=0){mine.splice(k,1);hist.push(['-',s]);api.moved();pips.set(hist.length);if(!rm)fly(cells[s],crowns.children[inst.par-mine.length-1],200);paint();clearRays();ZK.sfx('undo');ZK.buzz('tap');last=cells[s];check();return}
    if(clashPairs().length){ZK.wrong(cells[s]);return}   /* fix the clash first (Undo, or tap a clashing queen off) */
    var from=crowns.children[inst.par-mine.length-1];mine.push(s);hist.push(['+',s]);api.moved();pips.set(hist.length);paint();last=cells[s];
    var q=cells[s].firstChild,FL=rm?0:240;if(q&&!rm){fly(from,cells[s],FL);q.style.opacity=0;setTimeout(function(){q.style.opacity='';ZK.anim(q,[{transform:'scale(1.12,.86)'},{transform:'scale(.96,1.05)',offset:.5},{transform:'none'}],220,ZK.SPRING)},FL)}
    ZK.sfx('lift');setTimeout(function(){ZK.sfx('clack');ZK.buzz('move');drawRays(s,null,200);setTimeout(function(){if(!clashPairs().length)clearRays(true)},rm?0:420)},rm?0:FL);
    if(!rm){var p=ctr(s);[].forEach.call(cells,function(e,t){if(t!==s&&V6BQ.att(n,s,t)&&!e.firstChild&&!R[t]){var dd=Math.max(Math.abs(((t/n)|0)-((s/n)|0)),Math.abs(t%n-s%n));ZK.anim(e,[{filter:'brightness(1)'},{filter:'brightness(.86)'},{filter:'brightness(1)'}],260,'ease-out',dd*40)}})}
    check()}
  /* a queen flies between the tray above the board and a square (travel, then the square's own queen settles) */
  function fly(a,bb,ms){if(!a||!bb)return;var p=ZK.at(stage,a),r=ZK.at(stage,bb),e=document.createElement('div');e.className='bq-fly';e.innerHTML=queenSvg();stage.appendChild(e);
    var an=e.animate([{transform:'translate('+p.x+'px,'+p.y+'px) scale(.9)'},{transform:'translate('+((p.x+r.x)/2)+'px,'+(Math.min(p.y,r.y)-30)+'px) scale(1.2)',offset:.5},{transform:'translate('+r.x+'px,'+r.y+'px) scale(1)'}],{duration:ms,easing:'cubic-bezier(.3,.1,.3,1)',fill:'forwards'});
    an.onfinish=function(){e.remove()};setTimeout(function(){if(e.parentNode)e.remove()},ms+200)}
  function win(){fin=true;api.say('All queens safe.');setTimeout(function(){clearRays();ZK.sfx('cap',{n:4});
    if(!rm)queens().forEach(function(qs,i){var q=cells[qs].firstChild;if(q)ZK.anim(q,[{transform:'none'},{transform:'translateY(-6px) scale(1.12)'},{transform:'none'}],320,ZK.SPRING,i*40)})},rm?0:260);
    setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:420)}
  function stopGhost(){if(ghost){ghost.stop();ghost=null}ZK.ghostDone(ID)}
  layout();paint();pips.set(0);
  idle=ZK.idle(stage,25000);
  L(window,'resize',function(){layout()});
  /* next logical step from the current (good) position */
  function step(){var good=mine.filter(function(s){return S[s]});var r=V6BQ.logic(n,giv.concat(good),rocks,[]);return r.steps.length?r.steps:null}
  function nextPlace(){var bad=mine.filter(function(s){return !S[s]});if(bad.length)return{remove:bad[0]};var st=step();if(!st)return null;for(var i=0;i<st.length;i++)if(st[i].t==='single')return{place:st[i].cell,first:st[0]};
    for(var s=0;s<sol.length;s++)if(!G[sol[s]]&&mine.indexOf(sol[s])<0)return{place:sol[s],first:st[0]};return null}
  if(inst.level===1){var np=nextPlace();if(np&&np.place!=null){var tc=cells[np.place];ghost=ZK.ghost(stage,[{tap:tc,down:function(){drawRays(np.place,null,200)},up:function(){clearRays()},hold:1100}],{id:ID,level:1})}}
  function lineCells(w){var out=[];for(var t=0;t<n;t++)out.push(cells[w.row!=null?w.row*n+t:t*n+w.col]);return out}
  return{undo:function(){if(fin||!hist.length)return false;var h=hist.pop();if(h[0]==='+')mine.splice(mine.indexOf(h[1]),1);else mine.push(h[1]);undos++;pips.set(hist.length);paint();clearRays();check();ZK.sfx('undo');return true},
    restart:function(){if(fin)return;mine=[];hist=[];paint();pips.set(0);clearRays();ZK.stuck(stage,false);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var np=nextPlace();ZK.unmark(stage);if(!np)return null;hints++;
      if(np.remove!=null){ZK.mark(cells[np.remove]);return 'This queen is not in the answer. Tap it to lift it off.'}
      var f=np.first;
      if(lv<=1){if(f.t==='single'){ZK.mark(lineCells(f.why));return f.why.row!=null?'This row has one safe square left.':'This column has one safe square left.'}
        ZK.mark(cells[f.cell]);if(f.why)ZK.mark(lineCells(f.why));return 'What if a queen stood on the marked square? Look at the marked line.'}
      if(lv===2){ZK.mark(cells[np.place]);return 'A queen goes here.'}
      tap(np.place);return 'Placed for you.'},
    destroy:function(){if(idle)idle.stop();if(ghost)ghost.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    next:function(){var np=nextPlace();return np?(np.remove!=null?np.remove:np.place):null},
    state:function(){return{mine:mine.slice(),moves:hist.length,fin:fin,clash:clashPairs().length}}}}

ZK.override({id:ID,name:'Safe Queens',family:'grid',theme:'F10',blurb:'Place queens so that none can attack another.',
  how:'Tap a square to place a queen. One per row; no two may share a line or diagonal. Rocks hold none.',
  areas:['space','logic'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:m<=p?'Every queen right first time.':'Done in '+m+' taps. The fewest is '+p+'.'}}});
})();
