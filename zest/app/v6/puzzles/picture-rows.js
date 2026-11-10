/* Zest v6 new puzzle: Picture Rows (batch e, 7 Nov 2026; the nonogram genre, every picture drawn for Zest). Design note: Docs/v6/pilots/picture-rows.md.
   The numbers by each row and column are the runs of filled squares in that line, in order. Fill squares (tap, or drag along a row or column) until
   the picture appears; the cross tool marks squares you know stay empty. A number set dims when its line is done.
   Levels: tests/gen_picture_rows.js. Every picture is finished by the line solver alone (so the answer is unique and no guess is ever needed); from
   level 3 an overlap step is needed, from level 10 a chain across lines (3+ solver sweeps).
   Stuck policy (1.2.4): a stroke that leaves a line with no way to match its numbers breaks a stated rule, so it is flagged at once (kind 'rule':
   the clue turns amber, a chip offers Undo). A filled square that is not in the picture is legal and can always be erased, so nothing is lost; the
   hint names it. Stars count slips (squares filled that are not in the picture), not strokes. */
(function(){
var ID='picture-rows';
var LEVELS=[["heart",".r.r.|rrrrr|rrrrr|.rrr.|..r.."],["tree","..g..|.ggg.|ggggg|..n..|.nnn."],["mushroom",".rrr.|rrwrr|rrrrr|.wnw.|.nnn."],["boat","..w..|..ww.|..www|n.n.n|nnnn."],["bell","..y..|.yyy.|.yyy.|.yyy.|yyyyy|..n.."],["cup","b.b..|.bbb.|yyyy.|yyyyy|yyyy.|.yy.."],["house","..r...|..rr..|rrrrr.|.wkw..|.wkw..|.wkwn."],["snail","......|.nnn..|n.n.n.|n.nn.n|.nnn.n|.ggggg"],["crown","y.y.y.|yyyyyy|yryryy|.yyy.y|......|yyyyyy"],["key",".yy..|y..y.|.yyy.|..y..|..yy.|..y..|..yy."],["anchor","..nn..|..nn..|nnnnnn|..nn..|n.n..n|nnnnnn|.nnnn."],["note","...kkk|..k..k|..k..k|..k..k|kkk.kk|kkkkkk|kk..kk"],["cat","k...k.|kk.kk.|kkkkk.|kykyk.|kkkkk.|.kkk.k|.kkkk."],["fish",".....l|.bb..b|bbbbbb|bkbbb.|.bb..b|.b...."],["heliograph","yyy...|yyy...|yyy...|.n....|.nn...|n.n...|n..n.."],["umbrella","..p...|.pppp.|pppppp|p..nnp|...n..|...n..|..n..."],["bird","..bb..|.bbkb.|bbbbbo|bbbbb.|.bbbb.|..nnn.|.nn..n"],["lotus","...p..|..ppp.|.ppppp|pp.p..|.p..pp|..ggg.|gggggg|..g..."],["ship","..w...|..ww..|..www.|www...|nnnnnn|.nnnn.|bbbbb.|.b.b.b"],["duck",".yy...|yky...|.yyo..|yyy..y|yyyyy.|..yyy."],["leaf","...ggg|..gggg|.gg..g|gg..gg|g.ggg.|.g.g..|n....."],["star","...y..|l.yy..|yyyyyy|.yyyy.|..yy..|.yy.yy|yy...y"]]; /*LEVELS*/
var COL={r:'#E5484D',o:'#F28C28',y:'#F5BE2E',g:'#3E9E58',n:'#8B5A2B',b:'#3D7DD8',l:'#8EC5F0',k:'#2A2622',w:'#F7F2E8',p:'#E96BA8'};
function runs(a){var o=[],c=0;for(var i=0;i<a.length;i++){if(a[i]===1)c++;else if(c){o.push(c);c=0}}if(c)o.push(c);return o}
function cluesOf(rows){var H=rows.length,W=rows[0].length,R=[],C=[],x,y;
  for(y=0;y<H;y++){var a=[];for(x=0;x<W;x++)a.push(rows[y][x]!=='.'?1:0);R.push(runs(a))}
  for(x=0;x<W;x++){var b=[];for(y=0;y<H;y++)b.push(rows[y][x]!=='.'?1:0);C.push(runs(b))}return{R:R,C:C,W:W,H:H}}
/* all placements of clue c in a line of n cells that agree with known (1 fill, 0 empty, -1 unknown): returns the cells every placement agrees on,
   or null when no placement fits */
function lineSolve(n,c,known){var can1=[],can0=[],any=false,i;for(i=0;i<n;i++){can1.push(false);can0.push(false)}
  if(!c.length){for(i=0;i<n;i++)if(known[i]===1)return null;return new Array(n).fill(0)}
  var starts=[];
  function rec(k,pos){var len=c[k],rest=0,j,s,q;for(j=k+1;j<c.length;j++)rest+=c[j]+1;
    for(s=pos;s+len+rest<=n;s++){if(s>pos&&known[s-1]===1)break;   /* a fill left uncovered before this run */
      var ok=true;for(q=s;q<s+len;q++)if(known[q]===0){ok=false;break}if(!ok)continue;if(s+len<n&&known[s+len]===1)continue;
      starts[k]=s;if(k+1<c.length){rec(k+1,s+len+1);continue}
      for(q=s+len;q<n;q++)if(known[q]===1){ok=false;break}if(!ok)continue;
      any=true;var cur=new Array(n).fill(0);for(j=0;j<c.length;j++)for(q=starts[j];q<starts[j]+c[j];q++)cur[q]=1;
      for(q=0;q<n;q++){if(cur[q])can1[q]=true;else can0[q]=true}}}
  rec(0,0);if(!any)return null;var out=[];for(i=0;i<n;i++)out.push(can1[i]&&!can0[i]?1:!can1[i]&&can0[i]?0:-1);return out}
function solve(cl,start){var W=cl.W,H=cl.H,g=start?start.slice():new Array(W*H).fill(-1),depth=0,changed=true;
  while(changed&&depth<60){changed=false;depth++;
    for(var y=0;y<H;y++){var k=[];for(var x=0;x<W;x++)k.push(g[y*W+x]);var r=lineSolve(W,cl.R[y],k);if(!r)return{grid:g,depth:depth,solved:false,broken:true};for(x=0;x<W;x++)if(r[x]>=0&&g[y*W+x]<0){g[y*W+x]=r[x];changed=true}}
    for(x=0;x<W;x++){k=[];for(y=0;y<H;y++)k.push(g[y*W+x]);r=lineSolve(H,cl.C[x],k);if(!r)return{grid:g,depth:depth,solved:false,broken:true};for(y=0;y<H;y++)if(r[y]>=0&&g[y*W+x]<0){g[y*W+x]=r[y];changed=true}}}
  var solved=g.every(function(v){return v>=0});return{grid:g,depth:changed?depth:depth-1,solved:solved}}
function analyse(rows){var cl=cluesOf(rows),W=cl.W,H=cl.H,s=solve(cl),truth=[];for(var y=0;y<H;y++)for(var x=0;x<W;x++)truth.push(rows[y][x]!=='.'?1:0);
  var match=s.solved&&s.grid.every(function(v,i){return v===truth[i]}),overlap=0,trivial=0,lines=W+H;
  function one(n,c){var r=lineSolve(n,c,new Array(n).fill(-1)),f=r.filter(function(v){return v>=0}).length;if(f===n)trivial++;else overlap+=r.filter(function(v){return v===1}).length}
  cl.R.forEach(function(c){one(W,c)});cl.C.forEach(function(c){one(H,c)});
  return{solved:match,depth:s.depth,overlap:overlap,trivial:trivial,lines:lines}}
function make(level){var n=LEVELS.length,L=Math.max(1,Math.min(n,level|0||1)),e=LEVELS[L-1],rows=e[1].split('|'),cl=cluesOf(rows),fills=0;rows.forEach(function(r){for(var i=0;i<r.length;i++)if(r[i]!=='.')fills++});
  var nRuns=0;cl.R.forEach(function(c){nRuns+=c.length});return{level:L,title:'Level '+L,name:e[0],rows:rows,W:cl.W,H:cl.H,R:cl.R,C:cl.C,par:nRuns,fills:fills}}
window.V6PR={LEVELS:LEVELS,cluesOf:cluesOf,lineSolve:lineSolve,solve:solve,analyse:analyse,make:make,runs:runs};

var CSS=''
+'.zpr{position:relative;width:100%;max-width:400px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);--pr-paper:#FBF8F1;--pr-line:#D9D0BF;--pr-bold:#9A8C74;--pr-ink:#2A2622;--pr-clue:#3B352D;--pr-dim:#B5AC9C;--pr-x:#A0937C;--pr-hl:rgba(232,89,12,.12)}'
+':root[data-theme="dark"] .zpr{--pr-paper:#26231F;--pr-line:#3E3932;--pr-bold:#7A6E5C;--pr-ink:#EDE6D8;--pr-clue:#E8E1D3;--pr-dim:#6B6356;--pr-x:#8E8270;--pr-hl:rgba(247,163,92,.14)}'
+'.zpr-b{display:grid;width:100%;touch-action:none;user-select:none;-webkit-user-select:none}'
+'.zpr-cc{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:1px;padding-bottom:5px;font:800 .9375rem/1.05 var(--font);color:var(--pr-clue);font-variant-numeric:tabular-nums;transition:color .2s,opacity .2s}'
+'.zpr-rc{display:flex;justify-content:flex-end;align-items:center;gap:10px;padding-right:7px;font:800 .9375rem/1 var(--font);color:var(--pr-clue);font-variant-numeric:tabular-nums;transition:color .2s,opacity .2s}'
+'.zpr-cc.ok,.zpr-rc.ok{color:var(--pr-dim)}.zpr-cc.bad,.zpr-rc.bad{color:#C97A12}'
+'.zpr-cc.hl,.zpr-rc.hl{background:var(--pr-hl);border-radius:8px}'
+'.zpr-cc.lit,.zpr-rc.lit{color:var(--accent,#E8590C);background:var(--pr-hl);border-radius:8px}'
+'.zpr-c{all:unset;box-sizing:border-box;position:relative;aspect-ratio:1;background:var(--pr-paper);box-shadow:inset 0 0 0 .5px var(--pr-line);cursor:pointer;-webkit-tap-highlight-color:transparent}'
+'.zpr-c.bl{border-left:2px solid var(--pr-bold)}.zpr-c.bt{border-top:2px solid var(--pr-bold)}.zpr-c.br{border-right:2px solid var(--pr-bold)}.zpr-c.bb{border-bottom:2px solid var(--pr-bold)}'
+'.zpr-c.hl{background:color-mix(in srgb,var(--pr-paper) 86%,#E8590C)}'
+'.zpr-c i{position:absolute;inset:9%;border-radius:4px;background:var(--pr-ink);transform:scale(0);transition:transform .16s cubic-bezier(.34,1.56,.64,1),background .3s}'
+'.zpr-c.f i{transform:scale(1)}'
+'.zpr-c b{position:absolute;inset:26%;opacity:0;transition:opacity .12s}.zpr-c b::before,.zpr-c b::after{content:"";position:absolute;left:50%;top:-8%;width:3px;height:116%;margin-left:-1.5px;border-radius:2px;background:var(--pr-x);transform:rotate(45deg)}.zpr-c b::after{transform:rotate(-45deg)}'
+'.zpr-c.x b{opacity:1}'
+'.zpr-c.kc{outline:3px solid var(--ink);outline-offset:-3px;z-index:2}.zpr-b:focus{outline:none}'
+'.zpr-won .zpr-c{box-shadow:none}.zpr-won .zpr-c.x b{opacity:0}.zpr-won .zpr-c i{inset:0;border-radius:2px}.zpr-won .zpr-cc,.zpr-won .zpr-rc{opacity:.25}'
+'.zpr-tools{display:flex;gap:0;border-radius:24px;box-shadow:0 0 0 1.5px var(--line);background:var(--surface);overflow:hidden}'
+'.zpr-tools button{all:unset;box-sizing:border-box;width:64px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink)}'
+'.zpr-tools button[aria-pressed="true"]{background:var(--accent,#E8590C);color:var(--on-accent,#1B1916)}'
+'.zpr-tools button:focus-visible{outline:3px solid var(--ink);outline-offset:-3px}.zpr-tools svg{width:22px;height:22px}'
+'.zpr-bub{position:absolute;left:0;top:0;min-width:34px;height:34px;padding:0 8px;box-sizing:border-box;border-radius:17px;background:var(--ink);color:var(--surface);font:800 1rem/34px var(--font);text-align:center;pointer-events:none;z-index:8;opacity:0;transform:translate(-50%,-50%)}'
+'.zk-rm .zpr-c i{transition:none}@media (prefers-reduced-motion:reduce){.zpr-c i{transition:none}}';

function mount(root,inst,api){ZK.css(CSS,'zpr-css');root.textContent='';
  var W=inst.W,H=inst.H,rows=inst.rows,rm=ZK.rm(api),st=new Array(W*H).fill(0),hist=[],hints=0,undos=0,slips=0,slipSeen={},fin=false,ghost=null,idle=null,offs=[],mode=1,timers=[];   /* st: 0 empty, 1 filled, 2 cross */
  var truth=[];for(var y=0;y<H;y++)for(var x=0;x<W;x++)truth.push(rows[y][x]!=='.'?1:0);
  var stage=document.createElement('div');stage.className='zpr zk-stage zk-host'+(rm?' zk-rm':'');
  var maxR=0;inst.R.forEach(function(c){maxR=Math.max(maxR,c.length||1)});var gut=Math.max(30,maxR*19+12);
  var board=document.createElement('div');board.className='zpr-b zk-board';board.style.gridTemplateColumns=gut+'px repeat('+W+',1fr)';
  board.style.maxWidth='min(100%, '+(gut+W*58)+'px, calc((100svh - 330px) / '+(H+Math.max(1.2,maxCol()*0.42))+' * '+W+' + '+gut+'px))';board.setAttribute('role','grid');
  function maxCol(){var m=1;inst.C.forEach(function(c){m=Math.max(m,c.length)});return m}
  board.appendChild(document.createElement('div'));
  var cc=[],rc=[],cells=[];
  for(x=0;x<W;x++){var c=document.createElement('div');c.className='zpr-cc';(inst.C[x].length?inst.C[x]:[0]).forEach(function(n){var s=document.createElement('span');s.textContent=n;c.appendChild(s)});board.appendChild(c);cc.push(c)}
  for(y=0;y<H;y++){var r=document.createElement('div');r.className='zpr-rc';(inst.R[y].length?inst.R[y]:[0]).forEach(function(n){var s=document.createElement('span');s.textContent=n;r.appendChild(s)});board.appendChild(r);rc.push(r);
    for(x=0;x<W;x++){var b=document.createElement('div');var i=y*W+x;b.className='zpr-c';b.setAttribute('role','gridcell');b.setAttribute('data-i',i);b.setAttribute('data-zkc','');b.innerHTML='<i></i><b></b>';
      b.setAttribute('aria-label','Row '+(y+1)+', column '+(x+1)+', empty');board.appendChild(b);cells.push(b)}}
  /* keyboard: the grid is one tab stop; arrows move the cursor, Space or Enter uses the tool, X switches the tool */
  var cur=0;board.tabIndex=0;function curSet(k){cells[cur].classList.remove('kc');cur=Math.max(0,Math.min(W*H-1,k));cells[cur].classList.add('kc');board.setAttribute('aria-activedescendant','')}
  board.addEventListener('keydown',function(e){var k=e.key,y=(cur/W)|0,x=cur%W;if(k==='ArrowRight'&&x<W-1)curSet(cur+1);else if(k==='ArrowLeft'&&x>0)curSet(cur-1);else if(k==='ArrowDown'&&y<H-1)curSet(cur+W);else if(k==='ArrowUp'&&y>0)curSet(cur-W);
    else if(k===' '||k==='Enter')stroke([cur]);else if(k==='x'||k==='X')setMode(mode===1?2:1);else return;e.preventDefault()});
  board.addEventListener('focus',function(){cells[cur].classList.add('kc')});board.addEventListener('blur',function(){cells[cur].classList.remove('kc')});
  var bub=document.createElement('div');bub.className='zpr-bub';
  var tools=document.createElement('div');tools.className='zpr-tools';tools.setAttribute('role','group');tools.setAttribute('aria-label','Tool');
  var tFill=document.createElement('button'),tX=document.createElement('button');tFill.type=tX.type='button';tFill.className=tX.className='zk-p';
  tFill.innerHTML='<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor"/></svg>';tFill.setAttribute('aria-label','Fill');
  tX.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';tX.setAttribute('aria-label','Cross: mark a square that stays empty');
  function setMode(m){mode=m;tFill.setAttribute('aria-pressed',m===1?'true':'false');tX.setAttribute('aria-pressed',m===2?'true':'false')}
  tFill.onclick=function(){setMode(1);ZK.sfx('press')};tX.onclick=function(){setMode(2);ZK.sfx('press')};setMode(1);tools.appendChild(tFill);tools.appendChild(tX);
  stage.appendChild(board);stage.appendChild(tools);stage.appendChild(bub);root.appendChild(stage);
  function T(fn,ms){timers.push(setTimeout(fn,ms))}
  function paint(i){var c=cells[i],v=st[i];c.classList.toggle('f',v===1);c.classList.toggle('x',v===2);var y=(i/W)|0,x=i%W;c.setAttribute('aria-label','Row '+(y+1)+', column '+(x+1)+', '+(v===1?'filled':v===2?'crossed':'empty'))}
  function line(isRow,k){var o=[];if(isRow)for(var x=0;x<W;x++)o.push(k*W+x);else for(var y=0;y<H;y++)o.push(y*W+k);return o}
  /* clue state: done (the fills match the numbers), bad (no way to match them now, counting crosses as empty) */
  function check(){var bad=[];
    for(var y=0;y<H;y++){var ix=line(true,y),f=ix.map(function(i){return st[i]===1?1:0}),kn=ix.map(function(i){return st[i]===1?1:st[i]===2?0:-1});
      var ok=runs(f).join(',')===inst.R[y].join(','),b=!lineSolve(W,inst.R[y],kn);rc[y].classList.toggle('ok',ok&&!b);rc[y].classList.toggle('bad',b);if(b)bad.push(rc[y])}
    for(var x=0;x<W;x++){ix=line(false,x);f=ix.map(function(i){return st[i]===1?1:0});kn=ix.map(function(i){return st[i]===1?1:st[i]===2?0:-1});
      ok=runs(f).join(',')===inst.C[x].join(',');b=!lineSolve(H,inst.C[x],kn);cc[x].classList.toggle('ok',ok&&!b);cc[x].classList.toggle('bad',b);if(b)bad.push(cc[x])}
    return bad}
  function won(){for(var i=0;i<W*H;i++)if((st[i]===1?1:0)!==truth[i])return false;return true}
  /* one stroke = one move: every cell in ix takes the stroke's target state */
  var lastCell=null;
  function stroke(ix,target){if(fin||!ix.length)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);board.querySelectorAll('.hl').forEach(function(e){e.classList.remove('hl')});
    if(target==null)target=st[ix[0]]===mode?0:mode;var ch=[];
    ix.forEach(function(i){var b=st[i];if(target===1&&b===2)return;if(target===2&&b===1)return;if(target===0&&b!==st[ix[0]]&&ix.length>1)return;if(b===target)return;ch.push([i,b,target]);st[i]=target;paint(i)});
    if(target===1)ch.forEach(function(c,k){ZK.anim(cells[c[0]].firstChild,[{transform:'scale(.55)'},{transform:'scale(1.12)',offset:.6},{transform:'scale(1)'}],220,'ease-out',k*28)});
    if(!ch.length){refresh();return}
    hist.push(ch);api.moved();lastCell=cells[ch[ch.length-1][0]];
    ch.forEach(function(c){if(c[2]===1&&!truth[c[0]]&&!slipSeen[c[0]]){slipSeen[c[0]]=1;slips++}});
    var filled=ch.filter(function(c){return c[2]===1}).length;
    ZK.sfx(target===1?'click':target===2?'press':'undo',{p:Math.min(8,filled)});ZK.buzz('tap');
    var bad=check();
    if(bad.length){ZK.stuck(stage,true,{kind:'rule',text:'That line can’t match its numbers now',cells:bad});ZK.sfx('soft')}else ZK.stuck(stage,false);
    if(won())win()}
  function refresh(){paintAll();var bad=check();if(bad.length)ZK.stuck(stage,true,{kind:'rule',text:'That line can’t match its numbers now',cells:bad});else ZK.stuck(stage,false)}
  function paintAll(){for(var i=0;i<W*H;i++)paint(i)}
  function win(){fin=true;stage.classList.add('zpr-won');var org=lastCell?ZK.at(board,lastCell):{x:0,y:0};
    cells.forEach(function(c,i){if(!truth[i])return;var p=ZK.at(board,c),d=Math.hypot(p.x-org.x,p.y-org.y),ch=rows[(i/W)|0][i%W],col=COL[ch]||'#888';
      var ink=c.querySelector('i');T(function(){ink.style.background=col;if(ch==='w')ink.style.boxShadow='inset 0 0 0 1.5px rgba(0,0,0,.18)';},rm?0:Math.round(d*1.1))});
    ZK.sfx('cap',{n:6});ZK.buzz('pop');api.say('The picture is complete.');
    T(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{slips:slips}})},rm?0:300)}
  /* pointer: press a square, drag along its row or column; the bubble above the finger counts the stroke */
  var dr=null,ignore=0;function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  function cellAt(x,y){var e=document.elementFromPoint(x,y);e=e&&e.closest?e.closest('.zpr-c'):null;return e&&board.contains(e)?+e.getAttribute('data-i'):-1}
  /* the clues of the line being painted light up, so the numbers read as 'runs in this line' */
  function glow(i,axis){rc.forEach(function(e){e.classList.remove('lit')});cc.forEach(function(e){e.classList.remove('lit')});if(i<0)return;var y=(i/W)|0,x=i%W;if(axis!=='c')rc[y].classList.add('lit');if(axis!=='r')cc[x].classList.add('lit')}
  function showBub(n,x,y){var h=stage.getBoundingClientRect();bub.textContent=n;bub.style.left=(x-h.left)+'px';bub.style.top=(y-h.top-58)+'px';bub.style.opacity=n>1?1:0}
  L(board,'pointerdown',function(e){if(fin)return;var i=cellAt(e.clientX,e.clientY);if(i<0)return;e.preventDefault();try{board.setPointerCapture(e.pointerId)}catch(_){}
    var target=st[i]===mode?0:mode;if(target===1&&st[i]===2||target===2&&st[i]===1)target=0;
    dr={id:e.pointerId,a:i,target:target,from:st[i],axis:null,cur:[i],snap:{}};dr.snap[i]=st[i];glow(i,null);
    if(!(target===1&&st[i]===2)){st[i]=target;paint(i)}cells[i].classList.add('hl');ZK.anim(cells[i],[{transform:'scale(.9)'},{transform:'scale(1)'}],140,'ease-out')});
  L(board,'pointermove',function(e){if(!dr||e.pointerId!==dr.id)return;var i=cellAt(e.clientX,e.clientY);if(i<0)return;
    var ay=(dr.a/W)|0,ax=dr.a%W,y=(i/W)|0,x=i%W;if(!dr.axis){if(i===dr.a)return;dr.axis=(y===ay)?'r':(x===ax)?'c':(Math.abs(x-ax)>=Math.abs(y-ay)?'r':'c')}
    var k=dr.axis==='r'?ax+(x-ax):ay+(y-ay),ix=[];if(dr.axis==='r'){var lo=Math.min(ax,x),hi=Math.max(ax,x);for(var q=lo;q<=hi;q++)ix.push(ay*W+q)}else{lo=Math.min(ay,y);hi=Math.max(ay,y);for(q=lo;q<=hi;q++)ix.push(q*W+ax)}
    /* restore cells that left the stroke, then paint the new range */
    dr.cur.forEach(function(j){if(ix.indexOf(j)<0){st[j]=dr.snap[j];paint(j);cells[j].classList.remove('hl')}});
    ix.forEach(function(j){if(dr.snap[j]==null)dr.snap[j]=st[j];var b=dr.snap[j],t=dr.target;var skip=(t===1&&b===2)||(t===2&&b===1)||(t===0&&b!==dr.from);
      cells[j].classList.add('hl');if(!skip&&st[j]!==t){st[j]=t;paint(j);ZK.anim(cells[j],[{transform:'scale(.9)'},{transform:'scale(1)'}],120,'ease-out')}});
    if(ix.length>dr.cur.length)ZK.sfx('press');dr.cur=ix;glow(dr.a,dr.axis);showBub(ix.length,e.clientX,e.clientY)});
  function end(e,cancel){if(!dr||e.pointerId!==dr.id)return;var w=dr;dr=null;ignore=Date.now();bub.style.opacity=0;glow(-1);
    w.cur.forEach(function(j){st[j]=w.snap[j];paint(j);cells[j].classList.remove('hl')});
    if(cancel)return;stroke(w.cur,w.target)}
  L(board,'pointerup',function(e){end(e,false)});L(board,'pointercancel',function(e){end(e,true)});
  L(board,'click',function(e){if(Date.now()-ignore<500){e.preventDefault();e.stopPropagation()}},true);
  paintAll();check();
  /* level 1: the ghost drags along the first full row */
  if(inst.level===1){var fr=-1;for(y=0;y<H&&fr<0;y++)if(inst.R[y].length===1&&inst.R[y][0]===W)fr=y;
    if(fr>=0)ghost=ZK.ghost(stage,[{drag:[cells[fr*W],cells[fr*W+W-1]],down:function(){cells[fr*W].classList.add('hl')},move:function(){line(true,fr).forEach(function(j){cells[j].classList.add('hl')})},up:function(){line(true,fr).forEach(function(j){cells[j].classList.remove('hl')})}}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  /* the next cell the line solver can prove from what is correct now (fills and crosses that agree with the picture) */
  function nextDeduction(){var known=st.map(function(v,i){return v===1&&truth[i]?1:v===2&&!truth[i]?0:-1});
    var cl={R:inst.R,C:inst.C,W:W,H:H};
    for(var y=0;y<H;y++){var ix=line(true,y),r=lineSolve(W,inst.R[y],ix.map(function(i){return known[i]}));for(var x=0;x<W;x++)if(r&&r[x]>=0&&known[ix[x]]<0&&(r[x]===1?st[ix[x]]!==1:st[ix[x]]!==2))return{clue:rc[y],cell:ix[x],v:r[x],row:true}}
    for(x=0;x<W;x++){ix=line(false,x);r=lineSolve(H,inst.C[x],ix.map(function(i){return known[i]}));for(y=0;y<H;y++)if(r&&r[y]>=0&&known[ix[y]]<0&&(r[y]===1?st[ix[y]]!==1:st[ix[y]]!==2))return{clue:cc[x],cell:ix[y],v:r[y],row:false}}
    /* nothing new from one line: fall back to the answer (never needed for a line-solvable picture) */
    for(var i=0;i<W*H;i++)if(truth[i]&&st[i]!==1)return{clue:rc[(i/W)|0],cell:i,v:1,row:true};return null}
  function undo(){if(fin||!hist.length)return false;var ch=hist.pop();ch.forEach(function(c){st[c[0]]=c[1];paint(c[0])});undos++;refresh();ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true}
  return{undo:undo,
    restart:function(){if(fin)return;st=new Array(W*H).fill(0);hist=[];refresh();ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;ZK.unmark(stage);board.querySelectorAll('.hl').forEach(function(e){e.classList.remove('hl')});
      for(var i=0;i<W*H;i++){if(st[i]===1&&!truth[i]){hints++;ZK.mark(cells[i]);return 'This square is not part of the picture.'}if(st[i]===2&&truth[i]){hints++;ZK.mark(cells[i]);return 'This square is part of the picture.'}}
      var d=nextDeduction();if(!d)return null;hints++;
      if(lv<=1){d.clue.classList.add('hl');var ix=d.row?line(true,(d.cell/W)|0):line(false,d.cell%W);ix.forEach(function(j){cells[j].classList.add('hl')});return 'This '+(d.row?'row':'column')+' can tell you more. Where can its runs go?'}
      if(lv===2){ZK.mark(cells[d.cell]);return d.v===1?'This square must be filled.':'This square stays empty.'}
      stroke([d.cell],d.v===1?1:2);return d.v===1?'Filled it for you.':'Crossed it for you.'},
    destroy:function(){timers.forEach(clearTimeout);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return lastCell||board},
    state:function(){return{st:st.join(''),moves:hist.length,fin:fin,slips:slips,mode:mode}}}}

ZK.override({id:ID,name:'Picture Rows',family:'grid',blurb:'Fill squares from the number clues to reveal a picture.',
  how:'The numbers are the runs of filled squares in each row and column, in order. Drag to fill. Cross out squares that stay empty.',
  areas:['logic','space'],levels:LEVELS.length||20,secs:90,make:make,mount:mount,
  stars:function(res,inst){var s=(res.extra&&res.extra.slips)||0,h=res.hints||0,stars=s===0&&!h?3:s<=2&&h<=1?2:1;
    var t='Picture complete · '+(s===0?'no slips':s+(s===1?' slip':' slips'));return{stars:stars,line:t,winLine:t}}});
})();
