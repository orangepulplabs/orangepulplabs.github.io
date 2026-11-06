/* Zest v6: Zero One (binary grid). Overrides the puzzles_b.js entry; the original stays in ZK.orig['zero-one'].
   Rules: no three of the same digit in a row or column, and every row and column has equal numbers of 0 and 1.
   make(), the solver and par (a 0 needs 1 tap, a 1 needs 2) come from the original (PZB.zo), so every level stays unique and solvable.
   The curve is changed only on the 6x6 board: it starts with 27 clues (a breather after the 4x4 ladder) and thins to about 12 by level 30.
   The board explains the rules with no text: a blue 0 and an orange 1 (digit glyph too), a tally of dots at the end of every row and column
   (equal counts: fill the blue half and the orange half), and an amber ring on any three in a row. */
(function(){
var ID='zero-one',Z=PZB.zo;
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
function clueTarget(level,n){if(n===4)return [12,11,11,10,10,9,9,8][level-1];
  var saw=(level%3===0&&level>9)?2:0;return Math.round(27-(level-9)*15/21)+saw}
/* does propagating only 'no three alike' (pairs and sandwiches) finish the grid? if not, the equal-count rule is needed: that is the aha */
function ruleOneFinishes(g,n){var a=g.slice(),ch=true,q,N=n*n;
  while(ch){ch=false;for(q=0;q<N;q++)if(a[q]<0){var o0=okv(a,n,q,0,true),o1=okv(a,n,q,1,true);if(o0!==o1){a[q]=o0?0:1;ch=true}else if(!o0&&!o1)return false}}
  for(q=0;q<N;q++)if(a[q]<0)return false;return true}
function build(level,n,rng){var N=n*n,z=[],i;for(i=0;i<N;i++)z.push(-1);
  var full=PZB.zo.solve(z,n,1,rng).sol,g=full.slice(),clues=N,target=clueTarget(level,n),order=pzShuffle(seq(N),rng);
  for(i=0;i<order.length&&clues>target;i++){var t=g[order[i]];g[order[i]]=-1;if(PZB.zo.solve(g,n,2).count!==1)g[order[i]]=t;else clues--}
  return{full:full,g:g,clues:clues}}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var n=level<=8?4:6,N=n*n,b,i,tries=0;
  do{b=build(level,n,rng);tries++}while(level>=4&&ruleOneFinishes(b.g,n)&&tries<40);
  var g=b.g,full=b.full,clues=b.clues,par=0;for(i=0;i<N;i++)if(g[i]<0)par+=full[i]===0?1:2;
  return{level:level,title:'Level '+level,n:n,given:g,sol:full,par:par,empties:N-clues,clues:clues,aha:!ruleOneFinishes(g,n)}}
function okv(g,n,i,v,nocount){var r=Math.floor(i/n),c=i%n,h=n/2,k,j,rc=0,cc=0;
  for(k=0;k<n;k++){if(k!==c&&g[r*n+k]===v)rc++;if(k!==r&&g[k*n+c]===v)cc++}
  if(!nocount&&(rc>=h||cc>=h))return false;
  for(k=-2;k<=0;k++){if(c+k>=0&&c+k+2<n){var a=0;for(j=0;j<3;j++){var p=c+k+j;if(p===c||g[r*n+p]===v)a++}if(a===3)return false}
    if(r+k>=0&&r+k+2<n){var b=0;for(j=0;j<3;j++){var q=r+k+j;if(q===r||g[q*n+c]===v)b++}if(b===3)return false}}
  return true}
window.V6ZO={make:make,clueTarget:clueTarget,okv:okv,ruleOneFinishes:ruleOneFinishes};

var CSS=''
+'.zo{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);--zo0:#3F72C4;--zo1:#F0951A;--zo0i:#fff;--zo1i:#2B1700;--zo-bl:var(--surface,#fff);--zg:15px;--zgap:2px;--zpad:3px}@media (min-width:360px){.zo{--zg:24px;--zgap:5px;--zpad:9px}}@media (max-width:359px){.zo{width:calc(100% + 16px);max-width:none;margin:0 -8px}.zo-c{font-size:1.25rem}}'
+':root[data-theme="dark"] .zo{--zo0:#5C8FE0;--zo1:#F6A93B}'
+'.zo-top{display:flex;align-items:center;justify-content:center;gap:12px;min-height:34px}'
+'.zo-board{position:relative;display:grid;gap:var(--zgap);width:100%;box-sizing:border-box;padding:var(--zpad);border-radius:22px;background:var(--panel,rgba(120,110,95,.12));box-shadow:inset 0 0 0 1.5px var(--line,#ddd);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.zo-c{all:unset;position:relative;box-sizing:border-box;aspect-ratio:1;min-width:0;border-radius:14px;display:flex;align-items:center;justify-content:center;font:800 1.5rem/1 var(--font);cursor:pointer;background:var(--surface,#fff);box-shadow:inset 0 0 0 2px var(--edge,#b9b1a4);-webkit-tap-highlight-color:transparent;transition:scale .18s '+ZK.SPRING+'}'
+'.zo-c:focus-visible{outline:3px solid var(--ink,#000);outline-offset:2px}'
+'.zo-c.v0{background:var(--zo0);color:var(--zo0i);box-shadow:inset 0 -4px 0 rgba(0,0,0,.22)}.zo-c.v1{background:var(--zo1);color:var(--zo1i);box-shadow:inset 0 -4px 0 rgba(0,0,0,.2)}'
+'.zo-c.gv{cursor:default;box-shadow:inset 0 0 0 2.5px rgba(0,0,0,.35)}.zo-c.gv::after{content:"";position:absolute;right:6px;top:6px;width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.45}'
+'.zo-c.bad{box-shadow:inset 0 0 0 4px #E9A23B,0 0 0 2px #E9A23B}'
+'.zo-c.pv{scale:.94}'
+'.zo-tl{display:flex;align-items:center;justify-content:center;gap:3px;pointer-events:none}'
+'.zo-tl.r{flex-direction:row;gap:3px}.zo-tl.c{flex-direction:column;gap:3px}'
+'.zo-tl .s{display:grid;gap:3px}.zo-tl.r .s{grid-auto-flow:row}.zo-tl.c .s{grid-auto-flow:column}'
+'.zo-tl i{width:6px;height:6px;border-radius:50%;box-sizing:border-box;box-shadow:inset 0 0 0 1.5px var(--zo0);transition:background .15s,box-shadow .15s}'
+'.zo-tl .s1 i{box-shadow:inset 0 0 0 1.5px var(--zo1)}'
+'.zo-tl .s0 i.on{background:var(--zo0)}.zo-tl .s1 i.on{background:var(--zo1)}'
+'.zo-tl.over{outline:2px solid #E9A23B;outline-offset:2px;border-radius:6px}'
+'.zo-tl.full{opacity:.55}'
+'@media (prefers-reduced-motion:reduce){.zo-c,.zo-tl i{transition:none}}.zo.zk-rm .zo-c,.zo.zk-rm .zo-tl i{transition:none}'
/* 4 Nov (level-review fix): the 6 px tally dots read as noise, so each line now shows two short bars, one per colour, that fill a notch per tile
   (half the line each); a full bar pair dims, an overfilled bar rings amber */
+'.zo-tl.r{align-self:stretch;height:auto;padding:5px 0;gap:3px}.zo-tl.r .s{display:flex;flex-direction:column-reverse;gap:2px;height:100%}.zo-tl.r i{width:8px;height:auto;flex:1;border-radius:3px}'
+'.zo-tl.c{justify-self:stretch;width:auto;padding:0 5px;gap:3px}.zo-tl.c .s{display:flex;flex-direction:row;gap:2px;width:100%}.zo-tl.c i{height:8px;width:auto;flex:1;border-radius:3px}'
+'.zo-tl i{box-shadow:inset 0 0 0 1.5px var(--zo0);opacity:.9}.zo-tl .s1 i{box-shadow:inset 0 0 0 1.5px var(--zo1)}'
+'@media (max-width:359px){.zo-tl.r i{width:6px}.zo-tl.c i{height:6px}.zo-tl.r{gap:2px}.zo-tl.c{gap:2px}}';

function mount(root,inst,api){ZK.css(CSS,'zo-css');root.textContent='';
  var n=inst.n,N=n*n,h=n/2,rm=ZK.rm(api),cur=inst.given.slice(),hist=[],hints=0,undos=0,fin=false,last=null,cells=[],ghost=null,idle=null,offs=[],rowT=[],colT=[],rowDone=[],colDone=[],lostTm=null,i;
  var stage=document.createElement('div');stage.className='zo zk-stage zk-host'+(rm?' zk-rm':'');
  var ctr=ZK.counter({icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2" fill="#3F72C4"/><rect x="13" y="13" width="8" height="8" rx="2" fill="#F0951A"/><rect x="13" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',label:function(k){return k===0?'No empty cells':k+' empty cell'+(k===1?'':'s')},zero:false}),pips=ZK.pips(inst.par);
  var top=document.createElement('div');top.className='zo-top';top.appendChild(ctr.el);
  var board=document.createElement('div');board.className='zo-board zk-board';board.setAttribute('role','grid');board.setAttribute('aria-label',n+' by '+n+' grid of 0 and 1');
  board.style.gridTemplateColumns='repeat('+n+',minmax(0,1fr)) var(--zg)';board.style.gridTemplateRows='repeat('+n+',auto) var(--zg)';
  function tally(kind,k){var t=document.createElement('div'),a=document.createElement('span'),b=document.createElement('span');t.className='zo-tl '+kind;a.className='s s0';b.className='s s1';
    for(var q=0;q<h;q++){a.appendChild(document.createElement('i'));b.appendChild(document.createElement('i'))}t.appendChild(a);t.appendChild(b);return t}
  for(var r=0;r<n;r++){for(var c=0;c<n;c++)(function(q){var isG=inst.given[q]>=0,b=document.createElement(isG?'div':'button');if(!isG)b.type='button';b.className='zo-c';b.setAttribute('data-zkc','');b.setAttribute('role','gridcell');
      if(!isG){b.onclick=function(){tap(q)};ZK.pressable(b);b.classList.remove('zk-p')}
      cells.push(b);board.appendChild(b)})(r*n+c);
    var t=tally('r',r);rowT.push(t);board.appendChild(t)}
  for(var c2=0;c2<n;c2++){var t2=tally('c',c2);colT.push(t2);board.appendChild(t2)}
  board.appendChild(document.createElement('span'));
  stage.appendChild(top);stage.appendChild(board);stage.appendChild(pips.el);root.appendChild(stage);
  function empties(){var k=0;for(var q=0;q<N;q++)if(cur[q]<0)k++;return k}
  function badMap(){return Z.bad(cur,n)}
  function paint(){var bm=badMap();
    for(var q=0;q<N;q++){var v=cur[q],e=cells[q];e.className='zo-c'+(v===0?' v0':v===1?' v1':'')+(inst.given[q]>=0?' gv':'')+(bm[q]?' bad':'');e.textContent=v<0?'':v;
      e.setAttribute('aria-label','Row '+(((q/n)|0)+1)+', column '+(q%n+1)+', '+(v<0?'empty':v)+(inst.given[q]>=0?', given':'')+(bm[q]?', breaks a rule':''))}
    var newly=[];
    for(var k=0;k<n;k++){tl(rowT[k],0,k,true);tl(colT[k],0,k,false)}
    function tl(el,_,k,isRow){var c0=0,c1=0,j;for(j=0;j<n;j++){var v=isRow?cur[k*n+j]:cur[j*n+k];if(v===0)c0++;else if(v===1)c1++}
      var s0=el.children[0].children,s1=el.children[1].children;for(j=0;j<h;j++){s0[j].className=j<c0?'on':'';s1[j].className=j<c1?'on':''}
      var over=c0>h||c1>h,full=c0===h&&c1===h;el.classList.toggle('over',over);el.classList.toggle('full',full&&!over);
      var arr=isRow?rowDone:colDone;if(full&&!over&&!arr[k]){arr[k]=1;newly.push([isRow,k])}else if(!(full&&!over))arr[k]=0}
    return newly}
  function wave(list){if(rm)return;list.forEach(function(x,j){var idx=[];for(var q=0;q<n;q++)idx.push(x[0]?x[1]*n+q:q*n+x[1]);
      idx.forEach(function(q,w){ZK.anim(cells[q],[{translate:'0 0'},{translate:'0 -4px'},{translate:'0 0'}],300,ZK.SPRING,w*45+j*60)})});}
  /* 1.2.4 stuck policy: a broken rule is already marked on the board as it happens (amber cells, amber pips); a full board that breaks one
     says which rule and outlines the cells. A legal grid that can no longer be finished says nothing at once (kind 'dead': the kit shows
     "This can't be finished from here" on a hint, 3 moves later, or after 10 s idle). */
  function ruleText(){var q,r,c,h=n/2;function at(r,c){return cur[r*n+c]}
    for(r=0;r<n;r++)for(c=0;c+2<n;c++){var a=at(r,c);if(a>=0&&a===at(r,c+1)&&a===at(r,c+2))return 'Three alike in a row'}
    for(c=0;c<n;c++)for(r=0;r+2<n;r++){var b=at(r,c);if(b>=0&&b===at(r+1,c)&&b===at(r+2,c))return 'Three alike in a column'}
    for(r=0;r<n;r++){var z=0,o=0;for(c=0;c<n;c++){if(at(r,c)===0)z++;else if(at(r,c)===1)o++}if(z>h||o>h)return 'A row has too many '+(z>h?'0s':'1s')}
    for(c=0;c<n;c++){var z2=0,o2=0;for(r=0;r<n;r++){if(at(r,c)===0)z2++;else if(at(r,c)===1)o2++}if(z2>h||o2>h)return 'A column has too many '+(z2>h?'0s':'1s')}
    return 'A rule is broken'}
  function stuckCheck(){clearTimeout(lostTm);ZK.stuck(stage,false);if(fin)return;
    lostTm=setTimeout(function(){if(fin)return;var bm=badMap(),bad=Object.keys(bm),q,lost=false;
      if(empties()===0&&bad.length){var t=ruleText();ZK.stuck(stage,true,{kind:'rule',text:t,cells:bad.map(function(k){return cells[+k]})});api.say(t+'. Undo to step back.');return}
      if(bad.length)return;   /* the marked cells already show the broken rule */
      if(empties()===0)lost=true;else{for(q=0;q<N&&!lost;q++)if(cur[q]<0&&!okv(cur,n,q,0)&&!okv(cur,n,q,1))lost=true;
        if(!lost&&Z.solve(cur,n,1).count===0)lost=true}
      if(lost)ZK.stuck(stage,true,{kind:'dead'})},empties()===0?260:600)}
  function done(){var ok=true;for(var q=0;q<N;q++)if(cur[q]!==inst.sol[q]){ok=false;break}return ok}
  function set(q,v,silent){hist.push([q,cur[q]]);cur[q]=v;last=cells[q];api.moved();var bm=badMap(),was=!!bm[q],nw=paint();ctr.set(empties());pips.set(hist.length);
    if(!silent){ZK.sfx('click',{p:v===1?5:1});ZK.buzz('move')}
    ZK.anim(cells[q],[{rotate:'y 90deg',scale:'.92'},{rotate:'y 0deg',scale:'1.06',offset:.6},{rotate:'y 0deg',scale:'1'}],280,ZK.SPRING);   /* a quick flip shows travel (level-review fix) */
    if(was&&!silent)ZK.wrong(null,{});
    wave(nw);if(nw.length&&!fin)setTimeout(function(){ZK.sfx('cap',{n:Math.min(4,hist.length%5)})},90);
    if(done()){fin=true;ZK.stuck(stage,false);api.say('Solved.');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par,n:n}})},rm?0:320)}else stuckCheck()}
  function tap(q){if(fin||inst.given[q]>=0)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);set(q,cur[q]<0?0:cur[q]===0?1:0)}
  function undo(){if(fin||!hist.length)return false;var hh=hist.pop();cur[hh[0]]=hh[1];undos++;paint();ctr.set(empties());pips.set(hist.length);ZK.unmark(stage);ZK.sfx('undo');ZK.buzz('tap');stuckCheck();return true}
  function L(t,ty,fn){t.addEventListener(ty,fn);offs.push(function(){t.removeEventListener(ty,fn)})}
  L(board,'pointerdown',function(e){var c=e.target.closest&&e.target.closest('button.zo-c');if(c&&!fin){c.classList.add('pv');ZK.sfx('press')}});
  function unpv(){cells.forEach(function(c){c.classList.remove('pv')})}L(document,'pointerup',unpv);L(document,'pointercancel',unpv);
  L(board,'keydown',function(e){var q=cells.indexOf(document.activeElement);if(q<0)return;var r=(q/n)|0,c=q%n,t=-1;
    if(e.key==='ArrowRight'&&c<n-1)t=q+1;else if(e.key==='ArrowLeft'&&c>0)t=q-1;else if(e.key==='ArrowDown'&&r<n-1)t=q+n;else if(e.key==='ArrowUp'&&r>0)t=q-n;
    if(t>=0){e.preventDefault();if(cells[t].tagName==='BUTTON')cells[t].focus()}else if((e.key==='0'||e.key==='1')&&inst.given[q]<0&&!fin)set(q,+e.key)});
  paint();ctr.set(empties(),true);
  if(inst.level===1){var gq=-1;for(i=0;i<N;i++)if(inst.given[i]<0&&inst.sol[i]===0){gq=i;break}if(gq<0)for(i=0;i<N;i++)if(inst.given[i]<0){gq=i;break}
    ghost=ZK.ghost(stage,[{tap:cells[gq],down:function(){cells[gq].classList.add('pv','v0');cells[gq].textContent='0'},up:function(){cells[gq].classList.remove('pv','v0');cells[gq].textContent=''},cancel:function(){cells[gq].classList.remove('pv','v0');cells[gq].textContent=cur[gq]<0?'':cur[gq]},hold:900}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  return{undo:undo,
    restart:function(){if(fin)return;cur=inst.given.slice();hist=[];paint();ctr.set(empties());pips.set(0);ZK.unmark(stage);ZK.stuck(stage,false);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var t=Z.target(inst,cur);if(!t)return null;hints++;ZK.unmark(stage);var r=Math.floor(t.i/n),s;
      if(lv<=1){var row=[];for(var q=0;q<n;q++)row.push(cells[r*n+q]);ZK.mark(row);return t.fix?'One digit in this row does not belong.':'Something here can be filled in.'}
      if(lv===2){ZK.mark(cells[t.i]);return t.fix?'This one needs the other digit.':t.forced?'Only one digit fits here.':'Try this cell.'}
      var want=inst.sol[t.i];if(cur[t.i]===want)return null;while(cur[t.i]!==want&&!fin)set(t.i,cur[t.i]<0?0:cur[t.i]===0?1:0,true);ZK.sfx('click',{p:want?5:1});return 'Placed one for you.'},
    destroy:function(){clearTimeout(lostTm);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{cur:cur.slice(),moves:hist.length,fin:fin,empties:empties()}}}}

ZK.override({id:ID,name:'Zero One',family:'grid',theme:'F10',
  blurb:'Fill the grid with 0 and 1 using three simple rules.',
  how:'Tap a cell for 0, again for 1. No three alike in a line; each row and column holds equal 0s and 1s.',
  areas:['space','control'],levels:30,secs:110,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||m,h=res.hints||0,s=m<=Math.ceil(p*1.25)?3:m<=p*2?2:1;if(h&&s===3)s=2;
    return{stars:s,line:'Filled in '+m+' tap'+(m===1?'':'s')+'. The most direct route is '+p+'.'}}});
})();
