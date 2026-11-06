/* Zest v6: Four by Four (mini Sudoku). Overrides the puzzles_b.js entry; the original stays in ZK.orig['four-by-four'].
   Rule: each number once in every row, column and box. 4x4 (2x2 boxes) for levels 1-10, 6x6 (3x2 boxes) for levels 11-30.
   Uses the original solver (PZB.fbf.solve) for uniqueness. par = number of empty cells (one placement each), as before.
   New in make(): a clue is only removed while the grid can still be finished by SINGLES alone (a cell with one candidate, or a number with one
   place left in a row/column/box), so no level ever needs a guess; and from level 4 the grid must NEED at least one 'only place left' step
   (naked singles alone get stuck): that is the aha. The clue ladder is re-cut so the 4x4 to 6x6 step is a breather (par 9 to 11 at the board change).
   The board has no text: each number has its own colour (plus the digit), the pad shows how many of each number are left, tapping a cell
   lights its row, column and box, and a number can be armed first and then tapped onto many cells. */
(function(){
var ID='four-by-four',F=PZB.fbf;
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
function dims(level){return level<=10?{n:4,bw:2,bh:2}:{n:6,bw:3,bh:2}}
function idx(d){if(d.rc)return d;var n=d.n;d.rc=[];d.cc=[];d.bc=[];d.peers=[];d.regions=[];var i,j;
  for(i=0;i<n*n;i++){var r=Math.floor(i/n),c=i%n;d.rc.push(r);d.cc.push(c);d.bc.push(Math.floor(r/d.bh)*(n/d.bw)+Math.floor(c/d.bw))}
  for(i=0;i<n;i++){var R=[],C=[],B=[];for(j=0;j<n*n;j++){if(d.rc[j]===i)R.push(j);if(d.cc[j]===i)C.push(j);if(d.bc[j]===i)B.push(j)}d.regions.push(R,C,B)}
  for(i=0;i<n*n;i++){var p=[];for(j=0;j<n*n;j++)if(j!==i&&(d.rc[j]===d.rc[i]||d.cc[j]===d.cc[i]||d.bc[j]===d.bc[i]))p.push(j);d.peers.push(p)}return d}
function cands(d,g,i){var used={},k=[],v;d.peers[i].forEach(function(j){if(g[j])used[g[j]]=1});for(v=1;v<=d.n;v++)if(!used[v])k.push(v);return k}
/* singles-only solver: returns 0 (finished by naked singles only), 1 (finished but needed a hidden single), or -1 (stuck: would need a guess) */
function singles(d,g0){var g=g0.slice(),N=d.n*d.n,ch=true,hid=false,i,k;
  while(ch){ch=false;
    for(i=0;i<N;i++)if(!g[i]){var c=cands(d,g,i);if(c.length===1){g[i]=c[0];ch=true}else if(!c.length)return -1}
    if(ch)continue;
    for(k=0;k<d.regions.length&&!ch;k++){var reg=d.regions[k];for(var v=1;v<=d.n;v++){var has=false,spots=[];reg.forEach(function(j){if(g[j]===v)has=true;else if(!g[j]&&cands(d,g,j).indexOf(v)>=0)spots.push(j)});
        if(!has&&spots.length===1){g[spots[0]]=v;ch=true;hid=true;break}}}}
  for(i=0;i<N;i++)if(!g[i])return -1;return hid?1:0}
/* cells where a number has ONE place left in a row, column or box although the cell itself still has 2 or more candidates: the 'only place' aha, visible by arming that number */
function hiddenAt(d,g){var out=[];d.regions.forEach(function(reg){for(var v=1;v<=d.n;v++){var has=false,spots=[];reg.forEach(function(j){if(g[j]===v)has=true;else if(!g[j]&&cands(d,g,j).indexOf(v)>=0)spots.push(j)});
    if(!has&&spots.length===1&&cands(d,g,spots[0]).length>1)out.push([spots[0],v])}});return out}
/* 1.2.1 (level-review fix): singles plus ONE step beyond them. Candidates are kept per cell; when no single is left, a pointing pair / box-line claim
   (a number's places in a box all in one row or column, or a line's all in one box) or a naked pair removes candidates, then singles go on.
   Returns 0/1 like singles(), 2 if it needed one of those steps, -1 if even that gets stuck. */
function logic2(d,g0){var g=g0.slice(),N=d.n*d.n,n=d.n,el=[],i,used=false;for(i=0;i<N;i++)el.push(0);var hid=false;
  function cm(i){var m=0;d.peers[i].forEach(function(j){if(g[j])m|=1<<g[j]});return ((1<<(n+1))-2)&~m&~el[i]}
  function bits(m){var o=[];for(var v=1;v<=n;v++)if(m>>v&1)o.push(v);return o}
  for(var guard=0;guard<400;guard++){var ch=false;
    for(i=0;i<N;i++)if(!g[i]){var b=bits(cm(i));if(!b.length)return -1;if(b.length===1){g[i]=b[0];ch=true}}
    if(ch)continue;
    for(var k=0;k<d.regions.length&&!ch;k++){var reg=d.regions[k];for(var v=1;v<=n&&!ch;v++){var has=false,sp=[];reg.forEach(function(j){if(g[j]===v)has=true;else if(!g[j]&&(cm(j)>>v&1))sp.push(j)});
        if(!has&&!sp.length)return -1;if(!has&&sp.length===1){g[sp[0]]=v;ch=true;hid=true}}}
    if(ch)continue;
    var done=true;for(i=0;i<N;i++)if(!g[i])done=false;if(done)return used?2:hid?1:0;
    /* one step beyond singles */
    var elim=false;
    for(k=0;k<d.regions.length;k++){var reg2=d.regions[k];for(v=1;v<=n;v++){var sp2=reg2.filter(function(j){return !g[j]&&(cm(j)>>v&1)});if(sp2.length<2)continue;
        var sameR=sp2.every(function(j){return d.rc[j]===d.rc[sp2[0]]}),sameC=sp2.every(function(j){return d.cc[j]===d.cc[sp2[0]]}),sameB=sp2.every(function(j){return d.bc[j]===d.bc[sp2[0]]});
        [[sameR,'rc'],[sameC,'cc'],[sameB,'bc']].forEach(function(t){if(!t[0])return;var key=t[1],val=d[key][sp2[0]];for(var q=0;q<N;q++)if(!g[q]&&d[key][q]===val&&sp2.indexOf(q)<0&&(cm(q)>>v&1)){el[q]|=1<<v;elim=true}})}
      var two=reg2.filter(function(j){return !g[j]&&bits(cm(j)).length===2});for(var a=0;a<two.length;a++)for(var c=a+1;c<two.length;c++)if(cm(two[a])===cm(two[c])){var m2=cm(two[a]);reg2.forEach(function(q){if(!g[q]&&q!==two[a]&&q!==two[c]&&(cm(q)&m2)){el[q]|=m2;elim=true}})}}
    if(!elim)return -1;used=true}
  return -1}
var DEEP=25;   /* from this level a grid must need logic2's extra step (singles alone get stuck). On 6x6 that only happens at about 9-12 clues, so the deep
   levels are the top of the ladder (par about 25) and 21-24 are cut a little thinner (par about 19-20) so the step stays under 40%. */
function target(level){var n=dims(level).n;if(n===4)return [11,11,10,10,9,9,8,8,7,7][level-1];
  return Math.round(26-(level-11)*13/19)+((level>11&&level%4===0)?2:0)-(level>=21&&level<=24?2:0)}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var dd=dims(level),d=idx({n:dd.n,bw:dd.bw,bh:dd.bh}),n=d.n,N=n*n,z=[],i,tries=0,res;
  for(i=0;i<N;i++)z.push(0);
  do{var full=F.solve(d,z,1,rng).sol,g=full.slice(),clues=N,tg=target(level),order=pzShuffle(seq(N),rng);
    var deep=level>=DEEP;if(deep)tg=0;for(i=0;i<order.length&&clues>tg&&!(deep&&logic2(d,g)===2);i++){var t=g[order[i]];g[order[i]]=0;if((deep?logic2(d,g):singles(d,g))<0||F.solve(d,g,2).count!==1)g[order[i]]=t;else clues--}
    res=deep?(logic2(d,g)===2?1:0):hiddenAt(d,g).length;tries++}while(level>=4&&res<1&&tries<(level>=DEEP?400:200));
  return{level:level,title:'Level '+level,n:n,bw:d.bw,bh:d.bh,given:g,sol:full,par:N-clues,clues:clues,aha:res>0,deep:level>=DEEP?logic2(d,g):null}}
window.V6FBF={logic2:logic2,DEEP:DEEP,make:make,singles:singles,hiddenAt:hiddenAt,target:target,idx:idx,dims:dims};

var COL=['#E8590C','#2E8B57','#3F72C4','#B8860B','#9B4FC0','#D6336C'],COLD=['#F27B3E','#4DB27A','#6B97E0','#E0B03A','#B97AE0','#F06595'];
var CSS=''
+'.fb{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);'+COL.map(function(c,i){return '--fb'+(i+1)+':'+c}).join(';')+'}'
+':root[data-theme="dark"] .fb{'+COLD.map(function(c,i){return '--fb'+(i+1)+':'+c}).join(';')+'}'
+'.fb-top{display:flex;align-items:center;justify-content:center;gap:12px;min-height:34px}'
+'.fb-board{position:relative;display:grid;gap:4px;width:100%;box-sizing:border-box;padding:8px;border-radius:22px;background:var(--panel,rgba(120,110,95,.14));box-shadow:inset 0 0 0 1.5px var(--line,#ddd);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.fb-c{all:unset;position:relative;box-sizing:border-box;aspect-ratio:1;min-width:0;border-radius:12px;display:flex;align-items:center;justify-content:center;font:800 1.5rem/1 var(--font);cursor:pointer;background:var(--surface,#fff);color:var(--ink,#111);box-shadow:inset 0 0 0 2px var(--edge,#cfc7b8);-webkit-tap-highlight-color:transparent;transition:scale .18s '+ZK.SPRING+'}'
+'.fb-c.bx{background:color-mix(in srgb,var(--surface,#fff) 82%,var(--edge,#999))}'
+'.fb-c:focus-visible{outline:3px solid var(--ink,#000);outline-offset:2px}'
+'.fb-c.pe{box-shadow:inset 0 0 0 2px var(--ink,#111),0 0 0 0 transparent;filter:none}.fb-c.pe::before{content:"";position:absolute;inset:0;border-radius:12px;background:var(--accent,#E8590C);opacity:.14}'
+'.fb-c.sl{box-shadow:inset 0 0 0 4px var(--ink,#111)}'
+'.fb-c.nv{color:#fff;box-shadow:inset 0 -4px 0 rgba(0,0,0,.22)}.fb-c.gv{cursor:default;box-shadow:inset 0 0 0 3px rgba(0,0,0,.4)}.fb-c.gv::after{content:"";position:absolute;right:6px;top:6px;width:6px;height:6px;border-radius:50%;background:#fff;opacity:.6}'
+'.fb-c.same{box-shadow:inset 0 0 0 4px var(--ink,#111)}'
+'.fb-c.dim{opacity:.38}.fb-c.open{box-shadow:inset 0 0 0 3px var(--accent,#E8590C)}'
+'.fb-c.bad{box-shadow:inset 0 0 0 4px #E9A23B,0 0 0 2px #E9A23B}'
+'.fb-c.pv{scale:.94}'
+'.fb-pad{display:grid;gap:6px;width:100%}'
+'.fb-k{all:unset;position:relative;box-sizing:border-box;min-height:56px;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font:800 1.375rem/1 var(--font);color:#fff;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:scale .18s '+ZK.SPRING+',opacity .2s;box-shadow:inset 0 -4px 0 rgba(0,0,0,.22)}'
+'.fb-k:focus-visible{outline:3px solid var(--ink,#000);outline-offset:2px}'
+'.fb-k.pv{scale:.92}.fb-k.arm{box-shadow:0 0 0 4px var(--ink,#111),inset 0 -4px 0 rgba(0,0,0,.22);translate:0 -3px}.fb-k.zero{opacity:.38}'
+'.fb-k s{display:flex;flex-wrap:wrap;justify-content:center;gap:3px;max-width:calc(100% - 10px);text-decoration:none}.fb-k s:has(i:nth-child(5)){display:grid;grid-template-columns:repeat(3,auto);gap:2px 3px}.fb-k s:has(i:nth-child(7)){grid-template-columns:repeat(4,auto)}.fb-k s i{width:6px;height:6px;border-radius:50%;background:#fff}.fb-k s i.u{background:transparent;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.7)}'
+'.fb-c.pv,.fb-k.pv{transition:scale .06s ease-out}'
+'@media (max-width:359px){.fb{width:calc(100% + 16px);max-width:none;margin:0 -8px}.fb-board{gap:3px;padding:6px}.fb-c{font-size:1.25rem}}'
+'@media (prefers-reduced-motion:reduce){.fb-c,.fb-k{transition:none}}.fb.zk-rm .fb-c,.fb.zk-rm .fb-k{transition:none}';
var COLOR=function(v){return 'var(--fb'+v+')'};

function mount(root,inst,api){ZK.css(CSS,'fb-css');root.textContent='';
  var n=inst.n,N=n*n,d=idx({n:n,bw:inst.bw,bh:inst.bh}),rm=ZK.rm(api),cur=inst.given.slice(),hist=[],hints=0,undos=0,fin=false,last=null,cells=[],keys=[],sel=-1,arm=0,wrong=0,ghost=null,idle=null,offs=[],lostTm=null,doneReg={},i;
  var stage=document.createElement('div');stage.className='fb zk-stage zk-host'+(rm?' zk-rm':'');
  var ctr=ZK.counter({icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2" fill="#E8590C"/><rect x="13" y="3" width="8" height="8" rx="2" fill="#3F72C4"/><rect x="3" y="13" width="8" height="8" rx="2" fill="#2E8B57"/><rect x="13" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',label:function(k){return k===0?'Grid full':k+' empty cell'+(k===1?'':'s')},zero:false}),pips=ZK.pips(inst.par);
  var top=document.createElement('div');top.className='fb-top';top.appendChild(ctr.el);
  var board=document.createElement('div');board.className='fb-board zk-board';board.setAttribute('role','grid');board.setAttribute('aria-label',n+' by '+n+' number grid');board.style.gridTemplateColumns='repeat('+n+',minmax(0,1fr))';
  for(i=0;i<N;i++)(function(q){var g=inst.given[q],b=document.createElement(g?'div':'button');if(!g)b.type='button';b.className='fb-c';b.setAttribute('data-zkc','');b.setAttribute('role','gridcell');
    if(!g)b.onclick=function(){tapCell(q)};else b.onclick=function(){tapCell(q)};cells.push(b);board.appendChild(b)})(i);
  var pad=document.createElement('div');pad.className='fb-pad';pad.style.gridTemplateColumns='repeat('+n+',minmax(0,1fr))';pad.setAttribute('role','group');pad.setAttribute('aria-label','Numbers');
  for(i=1;i<=n;i++)(function(v){var b=document.createElement('button');b.type='button';b.className='fb-k';b.style.background=COLOR(v);b.setAttribute('aria-pressed','false');
    b.innerHTML='<span>'+v+'</span><s aria-hidden="true"></s>';b.onclick=function(){tapKey(v)};keys.push(b);pad.appendChild(b)})(i);
  stage.appendChild(top);stage.appendChild(board);stage.appendChild(pad);stage.appendChild(pips.el);root.appendChild(stage);
  function empties(){var k=0;for(var q=0;q<N;q++)if(!cur[q])k++;return k}
  function conflict(q){var v=cur[q];if(!v)return false;return d.peers[q].some(function(j){return cur[j]===v})}
  function left(v){var c=0;for(var q=0;q<N;q++)if(cur[q]===v)c++;return n-c}
  function blocked(v){var b={};for(var q=0;q<N;q++)if(cur[q]===v)d.peers[q].forEach(function(j){b[j]=1});return b}
  function paint(){var peers={};var blk=arm&&inst.level<=10?blocked(arm):null;   /* 1.2.1: from level 11 the 'only place left' is found, not shown */if(sel>=0)d.peers[sel].forEach(function(j){peers[j]=1});peers[sel]=1;
    for(var q=0;q<N;q++){var v=cur[q],e=cells[q],bad=conflict(q);
      e.className='fb-c'+(((d.bc[q]+((d.bc[q]/(n/d.bw))|0))%2)?' bx':'')+(v?' nv':'')+(inst.given[q]?' gv':'')+(sel===q?' sl':'')+(peers[q]&&sel!==q?' pe':'')+(arm&&v===arm&&sel!==q?' same':'')+(blk&&!v&&blk[q]?' dim':'')+(blk&&!v&&!blk[q]?' open':'')+(bad?' bad':'');
      e.style.background=v?COLOR(v):'';e.textContent=v||'';
      e.setAttribute('aria-label','Row '+(d.rc[q]+1)+', column '+(d.cc[q]+1)+', '+(inst.given[q]?'given '+v:v?'number '+v:'empty')+(bad?', repeats':''))}
    keys.forEach(function(b,k){var v=k+1,l=left(v),s=b.querySelector('s');var h='';for(var j=0;j<n;j++)h+='<i'+(j<n-l?'':' class="u"')+'></i>';s.innerHTML=h;
      b.classList.toggle('zero',l<=0);b.classList.toggle('arm',arm===v);b.setAttribute('aria-pressed',arm===v?'true':'false');b.setAttribute('aria-label','Number '+v+', '+Math.max(0,l)+' left')})}
  function regionsOf(q){return [d.regions[d.rc[q]],d.regions[n+d.cc[q]],d.regions[2*n+d.bc[q]]]}
  function regDone(reg){var seen={};for(var k=0;k<reg.length;k++){var v=cur[reg[k]];if(!v||seen[v])return false;seen[v]=1}return true}
  function cheer(q){var got=0;regionsOf(q).forEach(function(reg,k){var key=(k*100)+(k===0?d.rc[q]:k===1?d.cc[q]:d.bc[q]);if(regDone(reg)){if(!doneReg[key]){doneReg[key]=1;got++;
        if(!rm)reg.forEach(function(j,w){ZK.anim(cells[j],[{translate:'0 0'},{translate:'0 -4px'},{translate:'0 0'}],300,ZK.SPRING,w*40)})}}else doneReg[key]=0});
    if(got)setTimeout(function(){ZK.sfx('cap',{n:Math.min(4,hist.length%5)})},100)}
  /* 1.2.4 stuck policy: a repeat is marked on the board at once (the cells turn 'bad' and it says "That number repeats"); a legal grid
     that can no longer be finished says nothing at once (kind 'dead', shown by the kit on a hint, 3 moves later or after 10 s idle).
     The text is true: "A cell has no number left" only when an empty cell really has none (that cell is outlined), otherwise the kit's
     "This can't be finished from here". */
  function stuckCheck(){clearTimeout(lostTm);ZK.stuck(stage,false);if(fin)return;
    lostTm=setTimeout(function(){if(fin)return;var q,bad=false,empty=-1;for(q=0;q<N;q++)if(conflict(q))bad=true;if(bad)return;
      for(q=0;q<N&&empty<0;q++)if(!cur[q]&&!cands(d,cur,q).length)empty=q;
      if(empty>=0){ZK.stuck(stage,true,{kind:'dead',text:'A cell has no number left',cells:[cells[empty]]});return}
      if(F.solve(d,cur,1).count===0)ZK.stuck(stage,true,{kind:'dead'})},550)}
  function place(q,v,silent){if(fin||inst.given[q])return;var was=cur[q];if(was===v){v=0}
    hist.push([q,was]);if(v&&v!==inst.sol[q])wrong++;cur[q]=v;last=cells[q];api.moved();ctr.set(empties());pips.set(hist.length);paint();
    if(!silent){ZK.sfx(v?'click':'undo',{p:v});ZK.buzz('move')}
    if(v)ZK.anim(cells[q],[{scale:'.7',translate:'0 -16px',opacity:.5},{scale:'1.1',translate:'0 2px',opacity:1,offset:.6},{scale:'1',translate:'0 0',opacity:1}],300,ZK.SPRING);   /* 1.2.1: the number drops in (travel + settle), not just pops */
    if(v&&conflict(q)&&!silent){ZK.wrong(null,{});api.say('That number repeats.')}
    cheer(q);
    var ok=true;for(var k=0;k<N;k++)if(cur[k]!==inst.sol[k]){ok=false;break}
    if(ok){fin=true;sel=-1;arm=0;paint();ZK.stuck(stage,false);api.say('Solved.');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{wrong:wrong,par:inst.par,n:n}})},rm?0:320)}else stuckCheck()}
  function tapCell(q){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);if(inst.given[q]){if(!arm){sel=-1;arm=0}paint();ZK.sfx('press');return}
    if(arm){sel=-1;place(q,arm);return}
    sel=sel===q?-1:q;paint();ZK.sfx('press')}
  function tapKey(v){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    if(sel>=0){var q=sel;place(q,v);sel=-1;paint();return}
    arm=arm===v?0:v;paint();ZK.sfx('press')}
  function undo(){if(fin||!hist.length)return false;var h=hist.pop();cur[h[0]]=h[1];undos++;sel=-1;ctr.set(empties());pips.set(hist.length);paint();ZK.unmark(stage);ZK.sfx('undo');ZK.buzz('tap');stuckCheck();return true}
  function L(t,ty,fn){t.addEventListener(ty,fn);offs.push(function(){t.removeEventListener(ty,fn)})}
  L(stage,'pointerdown',function(e){var c=e.target.closest&&e.target.closest('button.fb-c,button.fb-k');if(c&&!fin)c.classList.add('pv')});
  function unpv(){[].forEach.call(stage.querySelectorAll('.pv'),function(c){c.classList.remove('pv')})}L(document,'pointerup',unpv);L(document,'pointercancel',unpv);
  L(board,'keydown',function(e){var q=cells.indexOf(document.activeElement);if(q<0)return;var r=d.rc[q],c=d.cc[q],t=-1;
    if(e.key==='ArrowRight'&&c<n-1)t=q+1;else if(e.key==='ArrowLeft'&&c>0)t=q-1;else if(e.key==='ArrowDown'&&r<n-1)t=q+n;else if(e.key==='ArrowUp'&&r>0)t=q-n;
    if(t>=0){e.preventDefault();if(cells[t].tagName==='BUTTON')cells[t].focus()}
    else if(/^[1-9]$/.test(e.key)&&+e.key<=n&&!inst.given[q]&&!fin)place(q,+e.key);else if((e.key==='Backspace'||e.key==='Delete')&&cur[q]&&!inst.given[q]&&!fin)place(q,cur[q])});
  paint();ctr.set(empties(),true);
  if(inst.level===1){var gq=-1,gv=0;for(i=0;i<N&&gq<0;i++)if(!cur[i]&&cands(d,cur,i).length===1){gq=i;gv=cands(d,cur,i)[0]}if(gq<0){for(i=0;i<N;i++)if(!cur[i]){gq=i;gv=inst.sol[i];break}}
    ghost=ZK.ghost(stage,[{tap:cells[gq],down:function(){sel=gq;paint()},hold:700},{tap:keys[gv-1],down:function(){keys[gv-1].classList.add('pv')},up:function(){keys[gv-1].classList.remove('pv');sel=-1;paint()},cancel:function(){keys[gv-1].classList.remove('pv');if(!hist.length){sel=-1;paint()}},hold:700}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  return{undo:undo,
    restart:function(){if(fin)return;cur=inst.given.slice();hist=[];sel=-1;arm=0;wrong=0;doneReg={};ctr.set(empties());pips.set(0);paint();ZK.unmark(stage);ZK.stuck(stage,false);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var t=F.target(inst,cur);if(!t)return null;hints++;ZK.unmark(stage);var q=t.i;
      if(lv<=1){var reg=d.regions[d.rc[q]].map(function(j){return cells[j]});ZK.mark(reg);return t.fix?'A number in this row does not belong.':'Something here has few choices left.'}
      if(lv===2){ZK.mark(cells[q]);return t.fix?'This one needs a different number.':t.k===1?'Only one number fits here.':'Look here: only '+t.k+' numbers can go here.'}
      var want=inst.sol[q];place(q,want,true);ZK.sfx('click',{p:want});return 'Placed one for you.'},
    destroy:function(){clearTimeout(lostTm);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{cur:cur.slice(),moves:hist.length,fin:fin,empties:empties(),sel:sel,arm:arm}}}}

ZK.override({id:ID,name:'Four by Four',family:'grid',theme:'F10',
  blurb:'Fill the grid so every number appears once in each row, column and box.',
  how:'Tap a cell, then a number. Each number once in every row, column and box.',
  areas:['space','control'],levels:30,secs:120,make:make,mount:mount,
  stars:function(res,inst){var x=res.extra||{},w=x.wrong||0,h=res.hints||0,s=h===0&&w<=2?3:w<=5?2:1,n=x.n||(inst&&inst.n)||4;
    return{stars:s,line:'Filled all '+((inst&&inst.par)||x.par)+' empty cells'+(w?' with '+w+' wrong placement'+(w===1?'':'s'):' with no wrong placements')+'.'}}});
})();
