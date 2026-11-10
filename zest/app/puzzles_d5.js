/* Zest puzzles, wave 2 file 5: Hidden Stone (F10), Jump Line (F9), Hidden Location, Sequence Keys, Which Was Said (F4).
   Loaded after puzzles_kit.js. Every make(level,rng) is pure (no Math.random, no DOM): the same seed gives the same puzzle on every device.
   Generators, checkers and solvers are exposed on PZD5 for tests/pzd5_logic.js.
   Rules in one line each:
   Hidden Stone: an eye sits just below the bottom row. A stone is seen only if no other stone lies on the straight line between it and the eye.
     Place exactly K stones so exactly V are seen. par = K (no stone taken back).
   Jump Line: a checkered grid of pieces. A piece jumps over the piece beside it, in a straight line, into the empty square beyond, and the jumped piece
     is taken. Every level is built backwards from one piece, so it is always solvable. Leave one piece. par = pieces - 1 (every full win has that many jumps).
   Hidden Location: one tile lights for 900 ms, the board goes dark for a delay, then the player taps the tile that lit. par = one correct tap per round.
   Sequence Keys: lanterns light in a hidden order that repeats. The first two full cycles are tapped as they light; then the player taps which lantern
     comes next. par = 2 x cycle length + predictions.
   Which Was Said: a short themed list is shown, then hidden. The player taps the words that were in the list among same-theme lures. par = words per round, summed.
   No audio. No luck anywhere. Wording is about the puzzle only: no claims about the brain, memory, attention or health. */
var PZD5={};
(function(){
var CSS='.pzd{box-sizing:border-box;width:100%;max-width:24rem;margin:0 auto;display:flex;flex-direction:column;gap:12px;color:var(--ink);font-family:var(--font)}.pzd *{box-sizing:border-box}'
+'.pzd-top{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:2px 12px}.pzd-goal{margin:0;font:700 1.125rem/1.25 var(--disp)}.pzd-ct{font:650 .875rem var(--font);color:var(--muted)}'
+'.pzd-msg{margin:0;min-height:2.8em;font-size:.9375rem;line-height:1.4;color:var(--muted)}.pzd-bar{display:flex;flex-wrap:wrap;gap:8px}.pzd-bar .pzb{flex:1 1 5.5rem}'
+'.pzd .pzb:focus-visible,.pzd .pzd-cell:focus-visible,.pzd .pzd-tile:focus-visible{outline:3px solid var(--ink);outline-offset:2px}'
+'.pzd .pzb.pzd-hint,.pzd .pzd-cell.pzd-hint,.pzd .pzd-tile.pzd-hint{outline:3px dashed var(--ink);outline-offset:3px}'
+'.pzd-grid{display:grid;gap:6px;margin:0 auto;width:100%}.pzd-cell{min-width:48px;min-height:48px;padding:2px;font:650 .75rem/1.1 var(--font);color:var(--ink);background:var(--surface);border:2px solid var(--edge);border-radius:8px;cursor:pointer}'
+'.pzd-cell.stone{background:var(--ink);color:var(--surface)}.pzd-cell.hid{background:var(--tint);color:var(--ink);border:2px dashed var(--ink)}'
+'.pzd-cell.piece{background:var(--ink);color:var(--surface)}.pzd-cell.land{background:var(--tint);border:2px solid var(--accent);color:var(--ink)}.pzd-cell.dk{background:var(--ink)}.pzd-cell.lt{background:var(--surface)}'
+'.pzd-cell[aria-pressed=true]{box-shadow:inset 0 0 0 3px var(--accent)}.pzd-cell:disabled{opacity:.6;cursor:default}'
+'.pzd-eyes{display:grid;text-align:center;font:650 .75rem var(--font);color:var(--muted)}'
+'.pzd-tiles{display:grid;gap:10px;width:100%}.pzd-tile{min-height:72px;padding:6px;font:700 .9375rem var(--font);color:var(--ink);background:var(--surface);border:2px solid var(--edge);border-radius:8px;cursor:pointer}'
+'.pzd-tile.lit{background:var(--accent);color:var(--on-accent)}.pzd-tile[aria-pressed=true]{background:var(--tint);box-shadow:inset 0 0 0 3px var(--accent)}.pzd-tile:disabled{opacity:.7;cursor:default}'
+'.pzd-list{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;font:600 1rem var(--font)}'
+'.pzd-list li{padding:12px 8px;min-height:48px;border:2px solid var(--edge);border-radius:8px;background:var(--surface);text-align:center}'
+'.pzd-note{margin:0;font-size:.9375rem;line-height:1.45;color:var(--muted)}.pzd-body{display:flex;flex-direction:column;gap:12px}';
function css(){if(typeof document==='undefined'||document.getElementById('pzd5-css'))return;var s=document.createElement('style');s.id='pzd5-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}
function shell(root,inst,api,o){
  css();while(root.firstChild)root.removeChild(root.firstChild);o=o||{};
  var S={timers:[],offs:[],dead:false};
  S.wrap=pzEl('div',{class:'pzd'+(api.rm?' rm':'')});
  S.goal=pzEl('p',{class:'pzd-goal',text:o.goal||''});S.ct=pzEl('span',{class:'pzd-ct num'});
  S.body=pzEl('div',{class:'pzd-body'});S.msg=pzEl('p',{class:'pzd-msg'});S.bar=pzEl('div',{class:'pzd-bar'});
  if(!api.say)S.msg.setAttribute('role','status');
  S.wrap.appendChild(pzEl('div',{class:'pzd-top'},[S.goal,S.ct]));S.wrap.appendChild(S.body);S.wrap.appendChild(S.msg);
  S.showBar=!(api.toolbar===false||inst.toolbar===false);if(S.showBar)S.wrap.appendChild(S.bar);
  root.appendChild(S.wrap);
  S.say=function(t){S.msg.textContent=t;if(api.say)api.say(t)};
  S.later=function(fn,ms){var id=setTimeout(function(){if(!S.dead)fn()},ms);S.timers.push(id);return id};
  S.clearTimers=function(){S.timers.forEach(clearTimeout);S.timers=[]};
  S.clearMarks=function(){var m=S.wrap.querySelectorAll('.pzd-hint');for(var i=0;i<m.length;i++)m[i].classList.remove('pzd-hint')};
  S.destroy=function(){S.dead=true;S.clearTimers();if(S.wrap.parentNode)S.wrap.parentNode.removeChild(S.wrap)};
  return S;
}
/* the toolbar: Undo (optional), Hint, and Restart this level or Try again */
function bar(S,o){if(!S.showBar)return;if(o.undo)S.bar.appendChild(pzBtn('Undo',o.undo));S.bar.appendChild(pzBtn('Hint',o.hint));S.bar.appendChild(pzBtn(o.tryAgain?'Try again':'Restart this level',o.restart))}
function pl(n,w){return n+' '+(n===1?w:w+'s')}
function gcd(a,b){return b?gcd(b,a%b):a}

/* ---------- Hidden Stone (F10) ---------- */
/* cells are indexed i = y*n + x; x = column 0..n-1, y = height above the eye's row (0 = bottom row, nearest the eye). The eye is at (eye,-1). */
function hsSeen(n,eye,cells){
  var set={};cells.forEach(function(i){set[(i%n)+','+Math.floor(i/n)]=1});
  return cells.map(function(i){var x=i%n,y=Math.floor(i/n),dx=x-eye,dy=y+1,g=gcd(Math.abs(dx),dy),sx=dx/g,sy=dy/g;
    for(var j=1;j<g;j++){if(set[(eye+j*sx)+','+(-1+j*sy)])return false}return true});
}
function hsMake(level,rng){
  var n=level<=10?4:5,K=2+Math.floor((level-1)/5),eye=pzInt(rng,n),pick,V,seen,tries=0,need=level>=4;
  do{tries++;pick=pzShuffle(range(n*n),rng).slice(0,K).sort(function(a,b){return a-b});
    seen=hsSeen(n,eye,pick);V=seen.filter(Boolean).length;
  }while(tries<500&&(V<1||(need&&V>K-1)));
  return {n:n,K:K,V:V,eye:eye,sol:pick,par:K,title:'Level '+level};
}
function range(k){var a=[];for(var i=0;i<k;i++)a.push(i);return a}
function hsMount(root,inst,api){
  var n=inst.n,K=inst.K,V=inst.V,S=shell(root,inst,api,{goal:'Place '+K+' stones so that exactly '+V+' can be seen from the eye below.'});
  var placed=[],hist=[],moves=0,undos=0,hints=0,lvl=0,fin=false,btns=[],eyeEl;
  var grid=pzEl('div',{class:'pzd-grid',role:'group','aria-label':'Board, '+n+' by '+n});grid.style.gridTemplateColumns='repeat('+n+',minmax(48px,1fr))';
  for(var i=0;i<n*n;i++)(function(i){var b=pzEl('button',{type:'button',class:'pzd-cell',onclick:function(){tap(i)}});btns.push(b);grid.appendChild(b)})(i);
  eyeEl=pzEl('div',{class:'pzd-eyes','aria-hidden':'true'});eyeEl.style.gridTemplateColumns='repeat('+n+',minmax(48px,1fr))';
  var eyeCell=pzEl('span',{text:'Eye'});eyeCell.style.gridColumn=String(inst.eye+1);eyeEl.appendChild(eyeCell);
  S.body.appendChild(grid);S.body.appendChild(eyeEl);
  function seenFlags(){return hsSeen(n,inst.eye,placed)}
  function seenCount(){return seenFlags().filter(Boolean).length}
  function label(i){return 'Row '+(n-Math.floor(i/n))+', column '+(i%n+1)}
  function render(){S.clearMarks();var f=seenFlags(),v=f.filter(Boolean).length;S.ct.textContent='Stones '+placed.length+' of '+K+' · seen '+v+' of '+V;
    for(var i=0;i<n*n;i++){var b=btns[i],p=placed.indexOf(i),cls='pzd-cell';
      if(p>=0){cls+=' stone'+(f[p]?'':' hid');b.textContent=f[p]?'seen':'hidden';b.setAttribute('aria-label',label(i)+': stone, '+(f[p]?'seen':'hidden')+'. Tap to take it back')}
      else{b.textContent='';b.setAttribute('aria-label',label(i)+': empty')}
      b.className=cls;b.disabled=false}
  }
  function push(next){hist.push(placed.slice());placed=next;lvl=0;render()}
  function tap(i){if(fin)return;var at=placed.indexOf(i),next;
    if(at>=0){next=placed.filter(function(x){return x!==i});}
    else{if(placed.length>=K){S.say('All '+K+' stones are placed. Take one back first.');return}next=placed.concat([i])}
    push(next);moves++;if(api.moved)api.moved();S.say(placed.length===K?'That is all '+K+' stones. Seen: '+seenCount()+'.':'');check();
  }
  function check(){if(fin||placed.length!==K||seenCount()!==V)return;fin=true;S.clearTimers();S.later(function(){api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:K,stones:K}})},350);S.say('Exactly '+V+' seen. Solved.')}
  function undo(){if(fin||!hist.length)return false;placed=hist.pop();undos++;lvl=0;render();S.say('Last change undone.');return true}
  function restart(){if(fin)return false;hist=[];placed=[];moves=0;undos=0;hints=0;lvl=0;render();S.say('Board cleared. Place '+K+' stones.');return true}
  function hint(n2){if(fin)return null;var t;n2=Math.max(1,Math.min(3,n2||lvl+1));lvl=n2;hints++;S.clearMarks();
    if(n2===1)t='A stone is hidden when another stone sits straight between it and the eye.';
    else if(n2===2){var nx=inst.sol.filter(function(i){return placed.indexOf(i)<0})[0];
      if(nx===undefined)t='Look at the hidden stones and move one of them.';else{t='Try row '+(n-Math.floor(nx/n))+', column '+(nx%n+1)+'.';btns[nx].classList.add('pzd-hint')}}
    else{hist.push(placed.slice());placed=inst.sol.slice();render();t='Here is one set of '+K+' stones that works.';moves=moves;check()}
    S.say(t);render();return t}
  bar(S,{undo:undo,hint:function(){hint()},restart:restart});
  render();
  return {undo:undo,hint:hint,restart:restart,destroy:S.destroy,moves:function(){return moves}};
}

/* ---------- Jump Line (F9) ---------- */
var JL_DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
function jlMoves(n,occ){var out=[];for(var p=0;p<n*n;p++){if(!occ[p])continue;var r=Math.floor(p/n),c=p%n;
  JL_DIRS.forEach(function(d){var r2=r+2*d[0],c2=c+2*d[1];if(r2<0||r2>=n||c2<0||c2>=n)return;var q=(r+d[0])*n+(c+d[1]),t=r2*n+c2;if(occ[q]&&!occ[t])out.push([p,q,t])})}
  return out}
function jlSolve(n,occ){var memo={};
  function go(o){var cnt=0;o.forEach(function(v){cnt+=v});if(cnt===1)return [];if(cnt===0)return null;var k=o.join('');if(memo[k]!==undefined)return memo[k];
    var ms=jlMoves(n,o),res=null;for(var i=0;i<ms.length&&!res;i++){var m=ms[i],o2=o.slice();o2[m[0]]=0;o2[m[1]]=0;o2[m[2]]=1;var r=go(o2);if(r)res=[m].concat(r)}
    memo[k]=res;return res}
  return go(occ.slice())}
function jlMake(level,rng){
  var n=level<=10?4:5,k=level<=10?2+Math.floor((level-1)/2):5+Math.floor((level-11)*8/19),attempt,occ,fwd,ok;
  for(attempt=0;attempt<300;attempt++){
    occ=[];for(var z=0;z<n*n;z++)occ.push(0);occ[pzInt(rng,n*n)]=1;fwd=[];ok=true;
    for(var s=0;s<k&&ok;s++){var cands=[];
      for(var L=0;L<n*n;L++){if(!occ[L])continue;var r=Math.floor(L/n),c=L%n;
        JL_DIRS.forEach(function(d){var rO=r-2*d[0],cO=c-2*d[1],rM=r-d[0],cM=c-d[1];if(rO<0||rO>=n||cO<0||cO>=n)return;var O=rO*n+cO,M=rM*n+cM;if(!occ[O]&&!occ[M])cands.push([L,M,O])})}
      if(!cands.length){ok=false;break}
      var pickc=cands[pzInt(rng,cands.length)];occ[pickc[0]]=0;occ[pickc[1]]=1;occ[pickc[2]]=1;fwd.push([pickc[2],pickc[1],pickc[0]]);
    }
    if(ok)break;
  }
  var start=occ.slice(),cells=[];occ.forEach(function(v,i){if(v)cells.push(i)});
  return {n:n,start:start,cells:cells,sol:fwd.reverse(),par:k,pieces:k+1,title:'Level '+level};
}
function jlMount(root,inst,api){
  var n=inst.n,S=shell(root,inst,api,{goal:'Jump until one piece is left.'});
  var occ=inst.start.slice(),hist=[],sel=-1,moves=0,undos=0,hints=0,lvl=0,fin=false,btns=[];
  var grid=pzEl('div',{class:'pzd-grid',role:'group','aria-label':'Board, '+n+' by '+n});grid.style.gridTemplateColumns='repeat('+n+',minmax(48px,1fr))';
  for(var i=0;i<n*n;i++)(function(i){var b=pzEl('button',{type:'button',class:'pzd-cell',onclick:function(){tap(i)}});btns.push(b);grid.appendChild(b)})(i);
  S.body.appendChild(grid);
  function rc(i){return 'row '+(Math.floor(i/n)+1)+', column '+(i%n+1)}
  function render(){S.clearMarks();var ms=jlMoves(n,occ),targets=[],cnt=0;occ.forEach(function(v){cnt+=v});
    if(sel>=0)ms.forEach(function(m){if(m[0]===sel)targets.push(m[2])});
    S.ct.textContent='Pieces left '+cnt+' · jumps '+moves;
    for(var i=0;i<n*n;i++){var b=btns[i],cls='pzd-cell',txt='',lab;
      if(occ[i]){cls+=' piece'+(i===sel?'':'');txt='Piece';lab='Piece, '+rc(i)+(i===sel?', selected':'');b.disabled=false;b.setAttribute('aria-pressed',i===sel?'true':'false')}
      else if(targets.indexOf(i)>=0){cls+=' land';txt='Land';lab='Land on '+rc(i);b.disabled=false;b.removeAttribute('aria-pressed')}
      else{lab='Empty, '+rc(i);b.disabled=true;b.removeAttribute('aria-pressed')}
      b.className=cls;b.textContent=txt;b.setAttribute('aria-label',lab)}
  }
  function perform(m){hist.push(occ.slice());occ[m[0]]=0;occ[m[1]]=0;occ[m[2]]=1;sel=-1;moves++;lvl=0;if(api.moved)api.moved();
    var cnt=0;occ.forEach(function(v){cnt+=v});render();
    if(cnt===1){fin=true;S.clearTimers();S.later(function(){api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par}})},350);S.say('One piece left. Solved.');return}
    if(!jlMoves(n,occ).length){S.say('No piece can jump now. Undo a jump or restart the level.');return}
    S.say('Jumped. '+pl(cnt,'piece')+' left.')}
  function tap(i){if(fin)return;
    if(occ[i]){if(sel===i){sel=-1;render();S.say('Piece put down.');return}
      if(!jlMoves(n,occ).some(function(m){return m[0]===i})){S.say('That piece has no jump. Pick a piece with an empty square beyond a neighbour.');return}
      sel=i;render();S.say('Piece selected. Tap a square it can land on.');return}
    if(sel>=0){var m=jlMoves(n,occ).filter(function(m){return m[0]===sel&&m[2]===i})[0];if(m){perform(m);return}}
    S.say('Pick a piece first.')}
  function undo(){if(fin||!hist.length)return false;occ=hist.pop();sel=-1;undos++;lvl=0;render();S.say('Last jump undone.');return true}
  function restart(){if(fin)return false;occ=inst.start.slice();hist=[];sel=-1;moves=0;undos=0;hints=0;lvl=0;render();S.say('Back to the start.');return true}
  function hint(n2){if(fin)return null;n2=Math.max(1,Math.min(3,n2||lvl+1));lvl=n2;hints++;S.clearMarks();var sol=jlSolve(n,occ),t;
    if(!sol){t='This route cannot finish. Undo a jump to get back on a route.';S.say(t);return t}
    var m=sol[0];
    if(n2===1){t='Start with the piece at '+rc(m[0])+'.';btns[m[0]].classList.add('pzd-hint')}
    else if(n2===2){t='It jumps over '+rc(m[1])+' and lands on '+rc(m[2])+'.';btns[m[2]].classList.add('pzd-hint')}
    else{t='Shown: the jump from '+rc(m[0])+' to '+rc(m[2])+'.';perform(m)}
    S.say(t);render();return t}
  bar(S,{undo:undo,hint:function(){hint()},restart:restart});
  render();
  return {undo:undo,hint:hint,restart:restart,destroy:S.destroy,moves:function(){return moves}};
}

/* ---------- Hidden Location (F4) ---------- */
function hlMake(level,rng){
  var N=level<=10?4:level<=20?6:9,R=3+Math.floor((level-1)/10),rounds=[],prev=-1,t;
  for(var r=0;r<R;r++){do{t=pzInt(rng,N)}while(t===prev);prev=t;rounds.push({tile:t,delay:400+(level-1)*90+pzInt(rng,200)})}
  return {n:N,cols:N===4?2:3,rounds:rounds,lit:900,par:R,title:'Level '+level};
}
function hlMount(root,inst,api){
  var S=shell(root,inst,api,{goal:'Watch for the tile that lights up, then tap where it was.'});
  var cols=inst.cols,rows=inst.n/cols,R=inst.rounds.length,r=0,phase='lit',moves=0,hints=0,fin=false,tiles=[],lvl=0;
  var grid=pzEl('div',{class:'pzd-tiles',role:'group','aria-label':'Tiles'});grid.style.gridTemplateColumns='repeat('+cols+',minmax(0,1fr))';
  for(var i=0;i<inst.n;i++)(function(i){var b=pzEl('button',{type:'button',class:'pzd-tile',onclick:function(){pick(i)}});tiles.push(b);grid.appendChild(b)})(i);
  S.body.appendChild(grid);
  function render(){S.clearMarks();S.ct.textContent='Round '+Math.min(r+1,R)+' of '+R;
    tiles.forEach(function(b,i){var lit=phase==='lit'&&inst.rounds[r].tile===i;
      b.classList.toggle('lit',lit);b.disabled=phase!=='choose';b.setAttribute('aria-pressed','false');
      b.textContent='Tile '+(i+1)+(lit?' (lit)':'');b.setAttribute('aria-label','Tile '+(i+1)+(lit?', lit now':''))})}
  function startRound(){if(fin)return;phase='lit';lvl=0;render();S.say('Round '+(r+1)+' of '+R+'. Watch for the tile that lights up.');
    S.later(function(){phase='wait';render();S.say('The board is dark. Wait for it.');
      S.later(function(){phase='choose';render();S.say('Which tile lit up? Tap it.')},inst.rounds[r].delay)},inst.lit)}
  function pick(i){if(phase!=='choose'||fin)return;moves++;if(api.moved)api.moved();
    if(inst.rounds[r].tile===i){r++;lvl=0;
      if(r>=R){fin=true;phase='done';render();S.say('Yes, that was it. Every round is solved.');S.clearTimers();S.later(function(){api.done({solved:true,moves:moves,hints:hints,undos:0,extra:{par:inst.par,rounds:R}})},350);return}
      phase='wait';render();S.say('Yes. Next round in a moment.');S.later(startRound,700);return}
    S.say('Not that one. Tap the tile where the light was.')}
  function hint(n2){if(fin)return null;if(phase!=='choose'){var t0='Wait until the tiles appear.';S.say(t0);return t0}
    n2=Math.max(1,Math.min(3,n2||lvl+1));lvl=n2;hints++;S.clearMarks();var tile=inst.rounds[r].tile,row=Math.floor(tile/cols),col=tile%cols,t;
    if(n2===1){var rn=rows===2?(row===0?'top':'bottom'):(row===0?'top':row===rows-1?'bottom':'middle');t='It was in the '+rn+' row.'}
    else if(n2===2)t='It was in row '+(row+1)+', column '+(col+1)+'.';
    else{tiles[tile].classList.add('pzd-hint');t='The tile with the dashed outline is the one that lit.'}
    S.say(t);return t}
  function restart(){if(fin)return false;S.clearTimers();r=0;moves=0;hints=0;lvl=0;startRound();return true}
  bar(S,{hint:function(){hint()},restart:restart,tryAgain:true});
  startRound();
  return {undo:function(){return false},hint:hint,restart:restart,destroy:S.destroy,phase:function(){return phase},round:function(){return r},moves:function(){return moves}};
}

/* ---------- Sequence Keys (F4) ---------- */
var SK_POS=['top left','top right','bottom left','bottom right'];
function skPeriod(c){var p=c.length;for(var q=1;q<p;q++){if(p%q)continue;var ok=true;for(var i=0;i<p;i++)if(c[i]!==c[(i+q)%p])ok=false;if(ok)return q}return p}
function skMake(level,rng){
  var p=level<=10?2:level<=20?3:4,cyc,i,good;
  do{cyc=[];for(i=0;i<p;i++)cyc.push(pzInt(rng,4));good=true;for(i=0;i<p;i++)if(cyc[i]===cyc[(i+1)%p])good=false}while(!good||skPeriod(cyc)!==p);
  var steps=4+Math.floor((level-1)/5),start=pzInt(rng,p),lights=[];
  for(i=0;i<2*p+steps;i++)lights.push(cyc[(i+start)%p]);
  return {cycle:cyc,lights:lights,period:p,shown:2*p,steps:steps,par:2*p+steps,title:'Level '+level};
}
function skMount(root,inst,api){
  var S=shell(root,inst,api,{goal:'Tap each lit lantern. Then tap the lantern that comes next.'});
  var i=0,show=-1,moves=0,hints=0,fin=false,lant=[],total=inst.shown+inst.steps,grid=pzEl('div',{class:'pzd-tiles',role:'group','aria-label':'Lanterns'});
  grid.style.gridTemplateColumns='repeat(2,minmax(0,1fr))';
  for(var k=0;k<4;k++)(function(k){var b=pzEl('button',{type:'button',class:'pzd-tile',onclick:function(){tap(k)}});lant.push(b);grid.appendChild(b)})(k);
  S.body.appendChild(grid);
  function phaseA(){return i<inst.shown}
  function render(){S.clearMarks();S.ct.textContent=(phaseA()?'Watch and tap ':'Predict ')+(i+1)+' of '+total;
    lant.forEach(function(b,k){var on=show===k;b.classList.toggle('lit',on);b.disabled=false;b.setAttribute('aria-pressed','false');
      b.textContent='Lantern '+(k+1)+(on?' (lit)':'');b.setAttribute('aria-label','Lantern '+(k+1)+' ('+SK_POS[k]+')'+(on?', lit now':''))})}
  function showNext(){show=phaseA()?inst.lights[i]:-1}
  function advance(k){moves++;if(api.moved)api.moved();i++;showNext();
    if(i>=total){fin=true;S.clearTimers();render();S.say('All '+total+' lanterns found. Solved.');S.later(function(){api.done({solved:true,moves:moves,hints:hints,undos:0,extra:{par:inst.par,cycle:inst.period}})},350);return}
    render();S.say(phaseA()?'Right. Tap the lantern that is lit.':'Right. Which lantern comes next?')}
  function tap(k){if(fin)return;
    if(phaseA()){if(k===inst.lights[i]){advance(k);return}moves++;if(api.moved)api.moved();S.say('That is not the lit lantern. Tap the one that is lit.');return}
    if(k===inst.lights[i]){show=k;advance(k);show=k;render();return}
    moves++;if(api.moved)api.moved();S.say('Not that one. Look back '+inst.period+' lights to find what comes next.')}
  function hint(n2){if(fin)return null;n2=Math.max(1,Math.min(3,n2||1));hints++;S.clearMarks();var t,want=inst.lights[i];
    if(n2===1)t=phaseA()?'Tap the lantern that is lit.':'Look for the order, the part that repeats.';
    else if(n2===2)t=phaseA()?'The lit lantern is at the '+SK_POS[want]+'.':'The order repeats every '+inst.period+' lights, so count back '+inst.period+' lights.';
    else{t='Shown: the lantern at the '+SK_POS[want]+' is next.';moves++;if(api.moved)api.moved();lant[want].classList.add('pzd-hint');i++;showNext();if(i>=total){fin=true;S.clearTimers();S.later(function(){api.done({solved:true,moves:moves,hints:hints,undos:0,extra:{par:inst.par,cycle:inst.period}})},350)}}
    S.say(t);render();return t}
  function restart(){if(fin)return false;S.clearTimers();i=0;moves=0;hints=0;showNext();render();S.say('Back to the first light.');return true}
  bar(S,{hint:function(){hint()},restart:restart,tryAgain:true});
  showNext();render();
  return {undo:function(){return false},hint:hint,restart:restart,destroy:S.destroy,moves:function(){return moves}};
}

/* ---------- Which Was Said (F4) ---------- */
var WSW_BANK={garden:['rose','tulip','seed','soil','rake','bloom','hedge','spade','petal','fern'],
  sea:['wave','tide','shell','sand','coral','gull','harbour','boat','anchor','reef'],
  kitchen:['spoon','kettle','pepper','bowl','oven','whisk','plate','cup','sugar','toast'],
  weather:['cloud','rain','breeze','frost','thunder','fog','hail','mist','storm','sunshine'],
  music:['drum','flute','piano','chord','tune','harp','choir','tempo','violin','cello'],
  tools:['hammer','nail','saw','drill','wrench','chisel','ladder','pliers','clamp','level']};
function wswMake(level,rng){
  var s=3+Math.floor((level-1)/10),R=2+Math.floor((level-1)/10),themes=pzShuffle(Object.keys(WSW_BANK),rng),rounds=[];
  for(var r=0;r<R;r++){var words=pzShuffle(WSW_BANK[themes[r]],rng),shown=words.slice(0,s),lures=words.slice(s,2*s),opts=pzShuffle(shown.concat(lures),rng);
    rounds.push({theme:themes[r],shown:shown,opts:opts,ans:opts.map(function(w){return shown.indexOf(w)>=0?1:0})})}
  return {rounds:rounds,s:s,par:R*s,title:'Level '+level};
}
function wswMount(root,inst,api){
  var S=shell(root,inst,api,{goal:'Which words were in the list you just read?'}),R=inst.rounds.length,r=0,phase='study',sel=[],hist=[],moves=0,undos=0,hints=0,fin=false,lvl=0;
  var intro=pzEl('p',{class:'pzd-note'}),ul=pzEl('ul',{class:'pzd-list','aria-label':'The list'}),hideBtn=pzBtn('Hide the list',function(){phase='choose';sel=[];hist=[];render();S.say('The list is hidden. Tap the words that were in it.')}),
      grid=pzEl('div',{class:'pzd-tiles',role:'group','aria-label':'Words'}),checkBtn=pzBtn('Check my picks',function(){check()});
  grid.style.gridTemplateColumns='repeat(2,minmax(0,1fr))';
  var opts=[];
  for(var j=0;j<2*inst.s;j++)(function(j){var b=pzEl('button',{type:'button',class:'pzd-tile',onclick:function(){toggle(j)}});opts.push(b);grid.appendChild(b)})(j);
  S.body.appendChild(intro);S.body.appendChild(ul);S.body.appendChild(hideBtn);S.body.appendChild(grid);S.body.appendChild(checkBtn);
  function rd(){return inst.rounds[Math.min(r,R-1)]}
  function render(){S.clearMarks();S.ct.textContent='Round '+(r+1)+' of '+R;var st=phase==='study';
    intro.textContent=st?'Read these '+inst.s+' words, then hide the list.':'Tap every word that was in the list. '+pl(inst.s,'word')+' in the list.';
    ul.textContent='';if(st)rd().shown.forEach(function(w){ul.appendChild(pzEl('li',{text:w}))});ul.hidden=!st;
    hideBtn.hidden=!st;grid.hidden=st;checkBtn.hidden=st;
    opts.forEach(function(b,j){var w=rd().opts[j];b.textContent=w;b.setAttribute('aria-label',w);b.setAttribute('aria-pressed',sel[j]?'true':'false')})}
  function toggle(j){if(phase!=='choose'||fin)return;var prev=!!sel[j];hist.push({j:j,prev:prev});sel[j]=!prev;moves++;lvl=0;if(api.moved)api.moved();render()}
  function check(){if(fin||phase!=='choose')return;var wrong=0,missed=0,a=rd().ans;
    a.forEach(function(v,j){if(v&&!sel[j])missed++;if(!v&&sel[j])wrong++});
    if(!wrong&&!missed){r++;lvl=0;
      if(r>=R){fin=true;S.clearTimers();S.say('All '+R+' rounds right. Solved.');S.later(function(){api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par,rounds:R}})},350);render();return}
      phase='study';sel=[];hist=[];render();S.say('Right. Here is the next list.');return}
    S.say('Not quite. '+pl(wrong,'word')+' you picked '+(wrong===1?'was':'were')+' not in the list, and '+pl(missed,'word')+' '+(missed===1?'is':'are')+' missing. Change your picks and check again.')}
  function undo(){if(fin||phase!=='choose'||!hist.length)return false;var h=hist.pop();sel[h.j]=h.prev;undos++;lvl=0;render();S.say('Last tap undone.');return true}
  function hint(n2){if(fin)return null;n2=Math.max(1,Math.min(3,n2||lvl+1));lvl=n2;hints++;S.clearMarks();var t;
    if(phase==='study'){t=n2===1?'The words in the list belong to one theme.':n2===2?'The list has '+pl(inst.s,'word')+'.':'Go through the list once more, word by word.'}
    else if(n2===1)t='Each word here is either in the list or a lure from the same theme.';
    else if(n2===2)t='Exactly '+pl(inst.s,'word')+' in this round were in the list.';
    else{var a=rd().ans;a.forEach(function(v,j){if(!!v!==!!sel[j]){hist.push({j:j,prev:!!sel[j]});sel[j]=!!v;moves=moves;}});t='Shown: the words that were in the list are now picked. Check them.';render()}
    S.say(t);render();return t}
  function restart(){if(fin)return false;S.clearTimers();r=0;phase='study';sel=[];hist=[];moves=0;undos=0;hints=0;lvl=0;render();S.say('Back to round 1.');return true}
  bar(S,{undo:undo,hint:function(){hint()},restart:restart});
  render();
  return {undo:undo,hint:hint,restart:restart,destroy:S.destroy,phase:function(){return phase},round:function(){return r},moves:function(){return moves}};
}

/* ---------- registration ---------- */
registerPuzzle({id:'hidden-stone',name:'Hidden Stone',family:'grid',theme:'F10',areas:['space','control'],levels:30,secs:120,undo:true,
  blurb:'Place stones so exactly the target number can be seen from the eye.',
  how:'A stone is hidden when another stone sits straight between it and the eye. Place the set number of stones so exactly the target number are seen.',
  make:hsMake,mount:hsMount,
  stars:function(res,inst){var s=pzStarsByPar(res.moves,inst.par,res.hints);return {stars:s,line:'You used all '+inst.K+' stones. The fewest moves is '+inst.par+' placements, with no stone taken back.'}}});
registerPuzzle({id:'jump-line',name:'Jump Line',family:'move',theme:'F9',areas:['control','flex'],levels:30,secs:150,undo:true,
  blurb:'Jump pieces over their neighbours until one piece is left.',
  how:'Tap a piece that has an empty square beyond a neighbour, then tap that empty square. The piece you jump over is taken. Leave one piece on the board.',
  make:jlMake,mount:jlMount,
  stars:function(res,inst){var s=pzStarsByPar(res.moves,inst.par,res.hints);return {stars:s,line:'You left one piece in '+res.moves+' jumps. Every full win takes '+inst.par+' jumps.'}}});
registerPuzzle({id:'hidden-location',name:'Hidden Location',family:'memory',theme:'F4',areas:['memory','space'],levels:30,secs:90,undo:false,
  blurb:'One tile lights up, then the board goes dark. Tap the tile that lit.',
  how:'Watch the lit tile, wait while the board is dark, then tap where it was. Finish every round to solve the level.',
  make:hlMake,mount:hlMount,
  stars:function(res,inst){var s=pzStarsByPar(res.moves,inst.par,res.hints);return {stars:s,line:'You found all '+inst.rounds.length+' tiles with '+pl(res.moves,'tap')+'. One correct tap per round is the fewest.'}}});
registerPuzzle({id:'sequence-keys',name:'Sequence Keys',family:'memory',theme:'F4',areas:['memory','attention'],levels:30,secs:90,undo:false,
  blurb:'Four lanterns light in an order that repeats. Tap what comes next.',
  how:'First tap each lit lantern as it lights. Then tap the lantern that comes next. The order repeats, so look back for the pattern.',
  make:skMake,mount:skMount,
  stars:function(res,inst){var s=pzStarsByPar(res.moves,inst.par,res.hints);return {stars:s,line:'The order repeats every '+inst.period+' lights. The fewest taps is '+inst.par+'.'}}});
registerPuzzle({id:'which-was-said',name:'Which Was Said',family:'memory',theme:'F4',areas:['memory','flex'],levels:30,secs:90,undo:true,
  blurb:'Tap the words that were in the list you just read.',
  how:'Read a short list, then hide it. Tap the words that were in it. Lures from the same theme were not in the list. Check your picks.',
  make:wswMake,mount:wswMount,
  stars:function(res,inst){var s=pzStarsByPar(res.moves,inst.par,res.hints);return {stars:s,line:'You checked '+inst.rounds.length+' lists. The fewest taps is one per word in each list, '+inst.par+' in all.'}}});

PZD5={make:{hsMake:hsMake,jlMake:jlMake,hlMake:hlMake,skMake:skMake,wswMake:wswMake},hsSeen:hsSeen,jlMoves:jlMoves,jlSolve:jlSolve,skPeriod:skPeriod,WSW_BANK:WSW_BANK,SK_POS:SK_POS};
})();
