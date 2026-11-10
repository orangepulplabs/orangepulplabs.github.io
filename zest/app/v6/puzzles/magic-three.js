/* Zest v6: Magic Three (3x3 magic square). Overrides the puzzles_d3.js entry; the original stays in ZK.orig['magic-three'].
   Rule: put the 9 numbers in the square, one each, so every row, column and both long diagonals add to the same total.
   v5 was always the numbers 1 to 9 (total 15) and there are only 8 such squares, so 30 levels were one puzzle. Now the SET changes:
   levels 1-10 use 1..9 (total 15), 11-20 slide the set up (for example 4..12, total 24), 21-30 step it (for example 3,5,...,19, total 33).
   The set is an affine copy of the classic square, so every level still has exactly 8 squares to tell apart, and par = empty squares (one placement each).
   From level 4 the centre is never given: the centre must be worked out (it is always the middle number), which is the aha.
   Board: live line totals in a gutter (partial sum, a green tick when right, amber when over or wrong), a number tray, tap a square then a number or arm a number first;
   tapping a filled square picks its number back up. */
(function(){
var ID='magic-three';
var BASE=[[2,7,6],[9,5,1],[4,3,8]];
function rot(m){var o=[[],[],[]],r,c;for(r=0;r<3;r++)for(c=0;c<3;c++)o[c][2-r]=m[r][c];return o}
function flip(m){return m.map(function(r){return r.slice().reverse()})}
var SQ=(function(){var out=[],m=BASE,k;for(k=0;k<4;k++){out.push(m);out.push(flip(m));m=rot(m)}return out.map(function(s){return s.reduce(function(a,r){return a.concat(r)},[])})})();
var LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
var EMPTIES=[3,3,3,4,4,4,5,4,5,5, 4,4,5,5,4,5,6,5,6,6, 6,6,7,6,7,7,6,7,8,8];
function setOf(level,rng){if(level<=10)return{a:1,d:1};if(level<=20)return{a:2+pzInt(rng,8),d:1};var d=2+pzInt(rng,2);return{a:1+pzInt(rng,3),d:d}}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var st=setOf(level,rng),E=EMPTIES[level-1],g=9-E,all=[0,1,2,3,4,5,6,7,8],t,i,cells,V,cnt;
  function pack(V,cells){var sol=V.map(function(v){return st.a+st.d*(v-1)}),grid=[];for(i=0;i<9;i++)grid.push(cells.indexOf(i)>=0?sol[i]:null);
    var cands=SQ.filter(function(S){return cells.every(function(c){return S[c]===V[c]})}).map(function(S){return S.map(function(v){return st.a+st.d*(v-1)})});
    return{level:level,title:'Level '+level,grid:grid,solution:sol,cands:cands,par:9-cells.length,total:3*(st.a+4*st.d),set:sol.slice().sort(function(a,b){return a-b})}}
  /* three or more given: exactly one square fits (a unique answer). Fewer given (the late levels): several fit and any valid square wins. */
  for(var round=0;round<6;round++){
    for(t=0;t<500;t++){V=SQ[pzInt(rng,8)];cells=pzShuffle(all,rng).slice(0,g).sort(function(a,b){return a-b});
      if(level>=4&&cells.indexOf(4)>=0)continue;
      cnt=0;for(i=0;i<8;i++){var S=SQ[i];if(cells.every(function(c){return S[c]===V[c]}))cnt++}
      if(cnt===1||g<3)return pack(V,cells)}
    g++}}
window.V6MT={make:make,SQ:SQ,LINES:LINES,EMPTIES:EMPTIES};

var CSS=''
+'.mt{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font)}'
+'.mt-top{display:flex;align-items:center;justify-content:center;gap:12px;min-height:34px}'
+'.mt-board{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) 54px;grid-template-rows:repeat(3,auto) 54px;gap:6px;width:100%;box-sizing:border-box;padding:10px;border-radius:22px;background:var(--panel,rgba(120,110,95,.14));box-shadow:inset 0 0 0 1.5px var(--line,#ddd);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.mt-c{all:unset;position:relative;box-sizing:border-box;aspect-ratio:1;min-width:0;border-radius:16px;display:flex;align-items:center;justify-content:center;font:800 1.875rem/1 var(--font);cursor:pointer;background:var(--surface,#fff);color:var(--ink,#111);box-shadow:inset 0 0 0 2px var(--edge,#cfc7b8);-webkit-tap-highlight-color:transparent;transition:scale .18s '+ZK.SPRING+'}'
+'.mt-c:focus-visible,.mt-k:focus-visible{outline:3px solid var(--ink,#000);outline-offset:2px}'
+'.mt-c.nv{background:var(--mt-tile,#F6B73C);color:#2B1700;box-shadow:inset 0 -4px 0 rgba(0,0,0,.2)}.mt-c.gv{background:var(--mt-given,#3F72C4);color:#fff;cursor:default;box-shadow:inset 0 -4px 0 rgba(0,0,0,.25)}'
+'.mt-c.sl{box-shadow:inset 0 0 0 4px var(--ink,#111)}.mt-c.open{box-shadow:inset 0 0 0 3px var(--accent,#E8590C)}.mt-c.bad{box-shadow:inset 0 0 0 4px #E9A23B,0 0 0 2px #E9A23B}'
+'.mt-c.pv,.mt-k.pv{scale:.93;transition:scale .06s ease-out}'
+'.mt-b{display:flex;align-items:center;justify-content:center;gap:2px;font:800 1.0625rem/1 var(--font);font-variant-numeric:tabular-nums;color:var(--muted,#5f5a52);pointer-events:none;min-width:0}'
+'.mt-b svg{width:18px;height:18px}.mt-b.ok{color:var(--ok-ink,#14532d)}.mt-b.ok span{background:var(--ok-bg,#ddefe2);border-radius:12px;padding:3px 8px}.mt-b.over{color:#9A5B00}.mt-b.over span{background:rgba(233,162,59,.25);border-radius:12px;padding:3px 8px}'
+'.mt-d{display:flex;flex-direction:column;gap:2px;align-items:stretch}.mt-d .mt-b{font-size:.8125rem;gap:1px}.mt-d .mt-b svg{width:12px;height:12px}'
+'.mt-pad{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;width:100%}'
+'.mt-k{all:unset;box-sizing:border-box;min-height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font:800 1.375rem/1 var(--font);color:#2B1700;background:var(--mt-tile,#F6B73C);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:scale .18s '+ZK.SPRING+',opacity .2s;box-shadow:inset 0 -4px 0 rgba(0,0,0,.2)}'
+'.mt-k.used{opacity:.3}.mt-k.arm{box-shadow:0 0 0 4px var(--ink,#111),inset 0 -4px 0 rgba(0,0,0,.2);translate:0 -3px}.mt-k.gone{visibility:hidden}'
+'.mt{--mt-tile:#F6B73C;--mt-given:#3F72C4}:root[data-theme="dark"] .mt{--mt-tile:#F6B73C;--mt-given:#5C8FE0}'
+'@media (max-width:359px){.mt{width:calc(100% + 16px);max-width:none;margin:0 -8px}.mt-board{grid-template-columns:repeat(3,minmax(0,1fr)) 46px;grid-template-rows:repeat(3,auto) 46px;padding:6px;gap:4px}.mt-c{font-size:1.5rem}}'
+'@media (prefers-reduced-motion:reduce){.mt-c,.mt-k{transition:none}}.mt.zk-rm .mt-c,.mt.zk-rm .mt-k{transition:none}';
var TICK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var DG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',DG2='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 5L5 19" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';

function mount(root,inst,api){ZK.css(CSS,'mt-css');root.textContent='';
  var rm=ZK.rm(api),g=inst.grid.slice(),given=inst.grid.map(function(v){return v!==null}),T=inst.total,hist=[],hints=0,undos=0,fin=false,last=null,cells=[],keys=[],badges=[],rowB=[],colB=[],diagB=[],sel=-1,arm=0,ghost=null,idle=null,offs=[],lostTm=null,okLine=[],i;
  var stage=document.createElement('div');stage.className='mt zk-stage zk-host'+(rm?' zk-rm':'');
  var ctr=ZK.counter({icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9h14M5 15h14" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/></svg>',label:function(k){return 'Every line adds to '+k},zero:false}),pips=ZK.pips(inst.par);
  ctr.el.insertAdjacentHTML('beforeend','');var top=document.createElement('div');top.className='mt-top';top.appendChild(ctr.el);
  var board=document.createElement('div');board.className='mt-board zk-board';board.setAttribute('role','grid');board.setAttribute('aria-label','Magic square, 3 by 3');
  function mkBadge(extra){var b=document.createElement('div');b.className='mt-b'+(extra||'');return b}
  for(var r=0;r<3;r++){for(var c=0;c<3;c++)(function(q){var b=document.createElement(given[q]?'div':'button');if(!given[q])b.type='button';b.className='mt-c';b.setAttribute('data-zkc','');b.setAttribute('role','gridcell');b.onclick=function(){tapCell(q)};cells.push(b);board.appendChild(b)})(r*3+c);
    var rb=mkBadge();rowB[r]=rb;board.appendChild(rb)}
  for(var c2=0;c2<3;c2++){var cb=mkBadge();colB[c2]=cb;board.appendChild(cb)}
  var dg=document.createElement('div');dg.className='mt-d';var d1=mkBadge(),d2=mkBadge();diagB[0]=d1;diagB[1]=d2;dg.appendChild(d1);dg.appendChild(d2);board.appendChild(dg);
  // LINES order: rows 0-2, cols 3-5, diags 6-7 -> badge index = line index
  var bmap=[];LINES.forEach(function(L,k){bmap[k]=k<3?rowB[k]:k<6?colB[k-3]:diagB[k-6]});
  var pad=document.createElement('div');pad.className='mt-pad';pad.setAttribute('role','group');pad.setAttribute('aria-label','Numbers');
  inst.set.forEach(function(v){var b=document.createElement('button');b.type='button';b.className='mt-k';b.textContent=v;b.setAttribute('data-v',v);b.onclick=function(){tapKey(v)};keys.push(b);pad.appendChild(b)});
  stage.appendChild(top);stage.appendChild(board);stage.appendChild(pad);stage.appendChild(pips.el);root.appendChild(stage);
  ctr.set(T,true);
  function lineSum(L){var s=0,e=0;L.forEach(function(q){if(g[q]===null)e++;else s+=g[q]});return{s:s,e:e}}
  function where(v){return g.indexOf(v)}
  function paint(){var badq={};
    LINES.forEach(function(L,k){var x=lineSum(L),b=bmap[k],cls='mt-b'+(k>=6?'':''),h;
      if(x.e===0&&x.s===T){cls+=' ok';h='<span>'+TICK+'</span>'}else if(x.e===0||x.s>=T&&x.e>0){cls+=' over';h='<span>'+(k===6?DG:k===7?DG2:'')+x.s+'</span>'; if(x.e===0||x.s>T)L.forEach(function(q){badq[q]=1})}
      else h='<span>'+(k===6?DG:k===7?DG2:'')+(x.e===3?'·':x.s)+'</span>';
      if(k>=6&&x.e===0&&x.s===T)h='<span>'+TICK+'</span>';
      b.className=cls;b.innerHTML=h;b.setAttribute('aria-label',(x.e===0?'Line adds to '+x.s+(x.s===T?', correct':', not '+T):'Line so far '+x.s))});
    for(var q=0;q<9;q++){var e=cells[q],v=g[q];e.className='mt-c'+(v!==null?(given[q]?' gv':' nv'):'')+(sel===q?' sl':'')+(arm&&!given[q]&&sel!==q?' open':'')+(badq[q]&&!given[q]&&v!==null?' bad':'');e.textContent=v===null?'':v;
      e.setAttribute('aria-label','Row '+(((q/3)|0)+1)+', column '+(q%3+1)+', '+(given[q]?'given '+v:v===null?'empty':'holds '+v))}
    keys.forEach(function(b){var v=+b.getAttribute('data-v'),w=where(v),used=w>=0;b.classList.toggle('used',used);b.classList.toggle('arm',arm===v);b.setAttribute('aria-pressed',arm===v?'true':'false');b.setAttribute('aria-label','Number '+v+(used?', placed':''))})}
  function cheer(){var got=false;LINES.forEach(function(L,k){var x=lineSum(L),good=x.e===0&&x.s===T;if(good&&!okLine[k]){okLine[k]=1;got=true;if(!rm)L.forEach(function(q,w){ZK.anim(cells[q],[{translate:'0 0'},{translate:'0 -4px'},{translate:'0 0'}],300,ZK.SPRING,w*50)});ZK.anim(bmap[k],[{scale:'1'},{scale:'1.3'},{scale:'1'}],320,ZK.SPRING)}else if(!good)okLine[k]=0});
    if(got)setTimeout(function(){ZK.sfx('cap',{n:okLine.filter(Boolean).length})},100)}
  function full(){return g.every(function(v){return v!==null})}
  function solved(){return (full()&&LINES.every(function(L){var x=lineSum(L);return x.s===T}))}
  function stuckCheck(){clearTimeout(lostTm);ZK.stuck(stage,false);if(fin)return;lostTm=setTimeout(function(){if(fin)return;if(full())ZK.stuck(stage,true,{text:'A line is off',onUndo:undo})},700)}
  /* place v in q (moving it if it sits elsewhere); changes are one history entry */
  function put(q,v,silent){if(fin||given[q])return;var ch=[],w=where(v);if(g[q]===v)return;
    if(w>=0&&given[w])return;if(w>=0)ch.push([w,g[w]]);ch.push([q,g[q]]);hist.push(ch);if(w>=0)g[w]=null;g[q]=v;last=cells[q];api.moved();pips.set(hist.length);paint();
    if(!silent){ZK.sfx('click',{p:v%9});ZK.buzz('move')}
    ZK.anim(cells[q],[{scale:'.7'},{scale:'1.1',offset:.6},{scale:'1'}],260,ZK.SPRING);
    var bad=false;LINES.forEach(function(L){var x=lineSum(L);if(L.indexOf(q)>=0&&(x.e===0&&x.s!==T||x.s>T))bad=true});
    if(bad&&!silent)ZK.wrong(null,{});
    cheer();
    if(full()&&solved()){fin=true;sel=-1;arm=0;paint();ZK.stuck(stage,false);api.say('Every line adds to '+T+'.');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:320)}else stuckCheck()}
  function pickUp(q){if(g[q]===null||given[q])return;var v=g[q];hist.push([[q,v]]);g[q]=null;api.moved();pips.set(hist.length);arm=v;sel=-1;paint();ZK.sfx('lift');ZK.buzz('tap');ZK.anim(cells[q],[{scale:'1'},{scale:'.85'},{scale:'1'}],200,ZK.SPRING);cheer();stuckCheck()}
  function tapCell(q){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    if(given[q]){ZK.sfx('press');return}
    if(arm){var v=arm;arm=0;sel=-1;if(g[q]!==null&&g[q]!==v){/* swap: the old number goes back to the tray */}put(q,v);paint();return}
    if(g[q]!==null){pickUp(q);return}
    sel=sel===q?-1:q;paint();ZK.sfx('press')}
  function tapKey(v){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    if(sel>=0){var q=sel;sel=-1;put(q,v);paint();return}
    arm=arm===v?0:v;paint();ZK.sfx('press')}
  function undo(){if(fin||!hist.length)return false;var ch=hist.pop();ch.forEach(function(x){g[x[0]]=x[1]});undos++;sel=-1;arm=0;pips.set(hist.length);paint();ZK.unmark(stage);ZK.sfx('undo');ZK.buzz('tap');cheer();stuckCheck();return true}
  function L(t,ty,fn){t.addEventListener(ty,fn);offs.push(function(){t.removeEventListener(ty,fn)})}
  L(stage,'pointerdown',function(e){var c=e.target.closest&&e.target.closest('button.mt-c,button.mt-k');if(c&&!fin)c.classList.add('pv')});
  function unpv(){[].forEach.call(stage.querySelectorAll('.pv'),function(c){c.classList.remove('pv')})}L(document,'pointerup',unpv);L(document,'pointercancel',unpv);
  L(board,'keydown',function(e){var q=cells.indexOf(document.activeElement);if(q<0)return;var r=(q/3)|0,c=q%3,t=-1;
    if(e.key==='ArrowRight'&&c<2)t=q+1;else if(e.key==='ArrowLeft'&&c>0)t=q-1;else if(e.key==='ArrowDown'&&r<2)t=q+3;else if(e.key==='ArrowUp'&&r>0)t=q-3;
    if(t>=0){e.preventDefault();if(cells[t].tagName==='BUTTON')cells[t].focus()}});
  paint();
  function compat(){return inst.cands.filter(function(S){return S.every(function(v,k){return g[k]===null||g[k]===v})})}
  function target(){var c=compat();if(!c.length){for(var q=0;q<9;q++)if(!given[q]&&g[q]!==null)return{q:q,fix:true,sq:inst.solution};}var S=c[0]||inst.solution,o=[4,0,2,6,8,1,3,5,7];for(var k=0;k<9;k++)if(g[o[k]]===null)return{q:o[k],fix:false,sq:S};return null}
  if(inst.level===1){var gq=target().q,gv=target().sq[gq],kb=keys.filter(function(b){return +b.getAttribute('data-v')===gv})[0];
    ghost=ZK.ghost(stage,[{tap:cells[gq],down:function(){sel=gq;paint()},hold:700},{tap:kb,down:function(){kb.classList.add('pv')},up:function(){kb.classList.remove('pv');sel=-1;paint()},cancel:function(){kb.classList.remove('pv');if(!hist.length){sel=-1;paint()}},hold:700}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  return{undo:undo,
    restart:function(){if(fin)return;g=inst.grid.slice();hist=[];sel=-1;arm=0;okLine=[];pips.set(0);paint();ZK.unmark(stage);ZK.stuck(stage,false);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var t=target();if(!t)return null;hints++;ZK.unmark(stage);var q=t.q;
      if(lv<=1){var best=null,bi=99;LINES.forEach(function(Ln){if(Ln.indexOf(q)>=0){var x=lineSum(Ln);if(x.e<bi){bi=x.e;best=Ln}}});ZK.mark(best.map(function(j){return cells[j]}));return t.fix?'A number on this line is out of place.':'Start with the line that has the fewest gaps.'}
      if(lv===2){ZK.mark(cells[q]);return t.fix?'This one needs a different number.':q===4?'The middle square sits on four lines. It is the middle number.':'Try this square.'}
      put(q,t.sq[q],true);ZK.sfx('click',{p:3});return 'Placed one for you.'},
    destroy:function(){clearTimeout(lostTm);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{g:g.slice(),moves:hist.length,fin:fin,arm:arm,sel:sel}}}}

ZK.override({id:ID,name:'Magic Three',family:'number',theme:'F6',calm:true,
  blurb:'Fill a square of numbers so every line adds to the same total.',
  how:'Place each number so every row, column and diagonal adds to the total.',
  areas:['flex','control'],levels:30,secs:90,make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'Filled in '+m+' move'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
