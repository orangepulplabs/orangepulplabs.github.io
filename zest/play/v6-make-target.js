/* Zest v6: Make the Target. Overrides the puzzles_a.js entry; the original stays in ZK.orig['make-target'].
   Combine two numbers with + - x / into one new number (only whole numbers above zero). Make the target appear. par = fewest steps (exact breadth-first search, PZA.targetSolve).
   v5: par only 1 to 4 (level 1 was ONE step), three taps per step (number, sign, number) with a text log, no merge animation.
   Now: pick two numbers and every sign shows its RESULT live on its own button, so one tap finishes the step and the board teaches the idea (you can see 7 x 8 = 56 before you do it).
   Ops that are not allowed (a negative, zero or a fraction) are dimmed. The two numbers fly together into the new number with a pop.
   Curve: tiles 3 (levels 1-2), 4 (3-8), 5 (9-17), 6 (18-30); par 1,1,2,2,3,2,3,3 | 3,4,3,4,4,3,4,4,4 | 3,4,3,4,4,4,3,4,4,4,4,4,4 (a dip after each new tile count); the numbers get bigger and the choice wider.
   par 5 with 6 tiles is too rare to generate fast on a phone, so the ladder stops at 4 steps but with 6 numbers and large targets.
   Aha: par is never 1 after level 2, so the target is never one obvious sum away; the player has to see which pair builds a stepping stone. A stuck chip appears when one number is left that is not the target. */
(function(){
var ID='make-target',A=PZA;
var NT=[3,3,4,4,4,4,4,4, 5,5,5,5,5,5,5,5,5, 6,6,6,6,6,6,6,6,6,6,6,6,6],
    PAR=[1,1,2,2,3,2,3,3, 3,4,3,4,4,3,4,4,4, 3,4,3,4,4,4,3,4,4,4,4,4,4];
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var n=NT[level-1],k=PAR[level-1],mx=Math.round(8+20*(level-1)/29),hi=level<5?60:level<12?150:level<20?400:999,best=null;
  function fold(w){var a=pzInt(rng,w.length),b;do{b=pzInt(rng,w.length)}while(b===a);var x=Math.min(w[a],w[b]),y=Math.max(w[a],w[b]),os=[];
    if(x+y<=hi)os.push(x+y);if(x*y<=hi)os.push(x*y);if(y>x)os.push(y-x);if(x>0&&y%x===0)os.push(y/x);if(!os.length)return null;
    var r=os[pzInt(rng,os.length)],rest=w.filter(function(_,q){return q!==a&&q!==b});rest.push(r);return rest}
  for(var t=0;t<400;t++){var nums=[],i;for(i=0;i<n;i++)nums.push(1+pzInt(rng,mx));var w=nums.slice(),ok=true;
    for(var s=0;s<k&&ok;s++){w=fold(w);if(!w)ok=false}
    if(!ok)continue;var target=w[w.length-1];if(target<(level<5?5:10)||nums.indexOf(target)>=0)continue;
    var sol=A.targetSolve(nums,target,300000);if(!sol)continue;
    var cand={title:'Level '+level,level:level,nums:nums,target:target,par:sol.par,parExact:true};
    if(sol.par===k)return cand;if(!best||Math.abs(sol.par-k)<Math.abs(best.par-k))best=cand}
  return best||{title:'Level '+level,level:level,nums:[2,3,4,5,6,7].slice(0,n),target:10,par:A.targetSolve([2,3,4,5,6,7].slice(0,n),10,1e5).par,parExact:true}}
window.V6MK={make:make,NT:NT,PAR:PAR};

var CSS=''
+'.mk{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:var(--font)}'
+'.mk-tg{display:flex;align-items:center;justify-content:center;gap:10px;min-height:64px}'
+'.mk-tg .rg{position:relative;min-width:76px;height:64px;padding:0 18px;border-radius:32px;display:flex;align-items:center;justify-content:center;font:850 2rem/1 var(--font);font-variant-numeric:tabular-nums;color:var(--ink,#111);background:var(--surface,#fff);box-shadow:0 0 0 4px var(--accent,#E8590C),0 6px 16px rgba(0,0,0,.12)}'
+'.mk-tg svg{width:34px;height:34px;color:var(--accent,#E8590C)}'
+'.mk-tg.hit .rg{background:var(--ok-bg,#ddefe2);color:var(--ok-ink,#14532d);box-shadow:0 0 0 4px #2E8B57}'
+'.mk-board{position:relative;display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-content:center;width:100%;min-height:196px;box-sizing:border-box;padding:12px;border-radius:22px;background:var(--panel,rgba(120,110,95,.14));box-shadow:inset 0 0 0 1.5px var(--line,#ddd);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.mk-n{all:unset;position:relative;box-sizing:border-box;width:calc((100% - 20px)/3);min-width:88px;max-width:112px;height:84px;border-radius:20px;display:flex;align-items:center;justify-content:center;font:850 1.875rem/1 var(--font);font-variant-numeric:tabular-nums;color:#2B1700;background:var(--mk-tile,#F6B73C);box-shadow:inset 0 -5px 0 rgba(0,0,0,.2);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .2s '+ZK.SPRING+',box-shadow .15s}'
+'.mk-n:focus-visible,.mk-o:focus-visible{outline:3px solid var(--ink,#000);outline-offset:2px}'
+'.mk-n.sel{transform:translateY(-6px) scale(1.05);box-shadow:inset 0 -5px 0 rgba(0,0,0,.2),0 0 0 4px var(--ink,#111),0 10px 16px rgba(0,0,0,.2)}'
+'.mk-n i{position:absolute;left:7px;top:6px;width:20px;height:20px;border-radius:50%;background:var(--ink,#111);color:var(--surface,#fff);font:800 .75rem/20px var(--font);text-align:center;font-style:normal}'
+'.mk-n.hit{background:#6FCF97;box-shadow:inset 0 -5px 0 rgba(0,0,0,.2),0 0 0 4px #2E8B57}.mk-n.pv{transform:scale(.94);transition:transform .06s ease-out}'
+'.mk-ops{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;width:100%}'
+'.mk-o{all:unset;box-sizing:border-box;min-height:64px;border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font:850 1.5rem/1 var(--font);background:var(--surface,#fff);color:var(--ink,#111);box-shadow:0 0 0 2px var(--edge,#cfc7b8),inset 0 -3px 0 rgba(0,0,0,.1);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:scale .18s '+ZK.SPRING+',opacity .2s}'
+'.mk-o small{font:800 .9375rem/1 var(--font);min-height:.9375rem;font-variant-numeric:tabular-nums;color:var(--muted,#5f5a52)}'
+'.mk-o.ready{background:var(--accent,#E8590C);color:var(--on-accent,#1B1916);box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}.mk-o.ready small{color:inherit}'
+'.mk-o.off{opacity:.38}.mk-o.pv{scale:.93;transition:scale .06s ease-out}.mk-o.zk-mark{outline-color:var(--ink,#111)}'
+'.mk{--mk-tile:#F6B73C}'
+'@media (max-width:359px){.mk{width:calc(100% + 16px);max-width:none;margin:0 -8px}.mk-n{min-width:84px;height:76px;font-size:1.625rem}}'
+'@media (prefers-reduced-motion:reduce){.mk-n,.mk-o{transition:none}}.mk.zk-rm .mk-n,.mk.zk-rm .mk-o{transition:none}';
var BULLSEYE='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>';
var OPS=[['+','plus'],['−','minus'],['×','times'],['÷','divided by']],OPK=['+','−','×','÷'];

function mount(root,inst,api){ZK.css(CSS,'mk-css');root.textContent='';
  var rm=ZK.rm(api),cur=inst.nums.slice(),hist=[],picks=[],hints=0,undos=0,fin=false,last=null,tiles=[],opb=[],ghost=null,idle=null,offs=[],lostTm=null,fresh=-1,flyFrom=null,target=inst.target;
  var stage=document.createElement('div');stage.className='mk zk-stage zk-host'+(rm?' zk-rm':'');
  var tg=document.createElement('div');tg.className='mk-tg';tg.setAttribute('role','img');tg.setAttribute('aria-label','Target '+target);tg.innerHTML=BULLSEYE+'<div class="rg">'+target+'</div>';
  var pips=ZK.pips(inst.par);
  var board=document.createElement('div');board.className='mk-board zk-board';board.setAttribute('role','group');board.setAttribute('aria-label','Your numbers');
  var ops=document.createElement('div');ops.className='mk-ops';ops.setAttribute('role','group');ops.setAttribute('aria-label','Signs');
  OPS.forEach(function(o,k){var b=document.createElement('button');b.type='button';b.className='mk-o off';b.innerHTML='<span>'+o[0]+'</span><small></small>';b.setAttribute('aria-label',o[1]);b.onclick=function(){tapOp(k)};opb.push(b);ops.appendChild(b)});
  stage.appendChild(tg);stage.appendChild(board);stage.appendChild(ops);stage.appendChild(pips.el);root.appendChild(stage);
  function result(k){if(picks.length<2)return null;var r=A.combine(cur[picks[0]],cur[picks[1]],OPK[k]);return r.err?null:r}
  function render(){board.textContent='';tiles=[];var hit=cur.indexOf(target);
    cur.forEach(function(v,i){var b=document.createElement('button');b.type='button';b.className='mk-n';b.setAttribute('data-zkc','');var pk=picks.indexOf(i);
      if(pk>=0)b.classList.add('sel');if(i===hit)b.classList.add('hit');b.textContent=v;if(pk>=0){var m=document.createElement('i');m.textContent=pk+1;b.appendChild(m)}
      b.setAttribute('aria-label','Number '+v+(i===hit?', the target':'')+(pk>=0?', picked '+(pk===0?'first':'second'):''));b.onclick=function(){tapNum(i)};tiles.push(b);board.appendChild(b)});
    opb.forEach(function(b,k){var r=result(k),sm=b.querySelector('small');sm.textContent=r?r.r:(picks.length<2?'':'–');b.classList.toggle('ready',!!r);b.classList.toggle('off',!r);b.setAttribute('aria-disabled',r?'false':'true');
      b.setAttribute('aria-label',OPS[k][1]+(r?', makes '+r.r:''))});
    tg.classList.toggle('hit',hit>=0)}
  function tapNum(i){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);var k=picks.indexOf(i);
    if(k>=0)picks.splice(k,1);else if(picks.length<2)picks.push(i);else picks[1]=i;render();ZK.sfx(k>=0?'undo':'lift');ZK.buzz('tap')}
  function tapOp(k){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();var r=result(k);
    if(!r){ZK.wrong(opb[k]);return}
    var i=picks[0],j=picks[1],pa=tiles[i].getBoundingClientRect(),pb=tiles[j].getBoundingClientRect(),hb=board.getBoundingClientRect();
    flyFrom={x:(pa.left+pb.left)/2+pa.width/2-hb.left,y:(pa.top+pb.top)/2+pa.height/2-hb.top,i:i,j:j};
    hist.push(cur.slice());var a=cur.filter(function(_,q){return q!==i&&q!==j});a.push(r.r);cur=a;picks=[];last=null;api.moved();pips.set(hist.length);render();ZK.unmark(stage);
    var nt=tiles[tiles.length-1];last=nt;
    if(!rm){var tb=nt.getBoundingClientRect();ZK.anim(nt,[{transform:'translate('+(flyFrom.x-(tb.left-hb.left+tb.width/2))+'px,'+(flyFrom.y-(tb.top-hb.top+tb.height/2))+'px) scale(.5)',opacity:.2},{transform:'scale(1.15)',opacity:1,offset:.7},{transform:'scale(1)'}],340,ZK.SPRING);ZK.burst(board,flyFrom.x,flyFrom.y,{n:8,r:44,ms:420})}
    ZK.sfx('clack');ZK.buzz('move');
    if(cur.indexOf(target)>=0){fin=true;api.say('You made '+target+'.');if(!rm)ZK.anim(tg,[{scale:'1'},{scale:'1.18'},{scale:'1'}],420,ZK.SPRING);
      setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:280);return}
    stuckCheck()}
  function stuckCheck(){clearTimeout(lostTm);ZK.stuck(stage,false);if(fin)return;
    if(cur.length<2){ZK.stuck(stage,true,{text:'Out of numbers',onUndo:undo});api.say('Out of numbers. Undo to step back.');return}
    if(cur.length<=4)lostTm=setTimeout(function(){if(fin)return;var r=A.targetSolve(cur,target,200000);if(!r){ZK.stuck(stage,true,{text:'The target is out of reach',onUndo:undo});api.say('The target is out of reach. Undo to step back.')}},600)}
  function undo(){if(fin||!hist.length)return false;cur=hist.pop();picks=[];undos++;pips.set(hist.length);render();ZK.unmark(stage);ZK.stuck(stage,false);clearTimeout(lostTm);ZK.sfx('undo');ZK.buzz('tap');stuckCheck();return true}
  function L(t,ty,fn){t.addEventListener(ty,fn);offs.push(function(){t.removeEventListener(ty,fn)})}
  L(stage,'pointerdown',function(e){var c=e.target.closest&&e.target.closest('button.mk-n,button.mk-o');if(c&&!fin){c.classList.add('pv');ZK.sfx('press')}});
  function unpv(){[].forEach.call(stage.querySelectorAll('.pv'),function(c){c.classList.remove('pv')})}L(document,'pointerup',unpv);L(document,'pointercancel',unpv);
  render();
  function step(){var r=A.targetSolve(cur,target,400000);if(!r||!r.path.length)return null;var s=r.path[0],i=cur.indexOf(s.x),j=cur.indexOf(s.y,s.x===s.y?i+1:0);return{i:i,j:j,op:OPK.indexOf(s.op==='-'?'−':s.op==='*'?'×':s.op==='/'?'÷':s.op),s:s,left:r.par}}
  if(inst.level===1){var st=step();if(st){var ti=tiles[st.i],tj=tiles[st.j],ob=opb[st.op];
    function clr(){tiles.forEach(function(t){t.classList.remove('sel')});opb.forEach(function(b){b.classList.remove('pv')})}
    ghost=ZK.ghost(stage,[{tap:ti,down:function(){ti.classList.add('sel')},hold:600},{tap:tj,down:function(){tj.classList.add('sel')},hold:600},{tap:ob,down:function(){ob.classList.add('pv')},up:clr,cancel:clr,hold:700}],{id:ID,level:1})}}
  idle=ZK.idle(stage,25000);
  return{undo:undo,
    restart:function(){if(fin)return;cur=inst.nums.slice();hist=[];picks=[];pips.set(0);render();ZK.unmark(stage);ZK.stuck(stage,false);clearTimeout(lostTm);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var st=step();if(!st)return null;hints++;ZK.unmark(stage);
      if(lv<=1)return 'There is a way to make '+target+' in '+st.left+' more step'+(st.left===1?'':'s')+'.';
      if(lv===2){picks=[st.i,st.j];render();ZK.mark([tiles[st.i],tiles[st.j]]);return 'Try these two together.'}
      picks=[st.i,st.j];render();tapOp(st.op);return 'Did a step for you.'},
    destroy:function(){clearTimeout(lostTm);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last||board},
    state:function(){return{cur:cur.slice(),picks:picks.slice(),moves:hist.length,fin:fin}}}}

ZK.override({id:ID,name:'Make the Target',family:'number',theme:'F6',
  blurb:'Combine numbers until the target appears.',
  how:'Pick two numbers, then a sign. Make the target number.',
  areas:['space'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||m;return{stars:pzStarsByPar(m,p,res.hints),line:m<=p?'Made it in '+m+' step'+(m===1?'':'s')+', the fewest possible.':'Made it in '+m+' steps. The fewest is '+p+'.'}}});
})();
