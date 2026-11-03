/* Zest puzzles, wave 2 builder 1: Spotlight Cue (F4), Bigger, Faster (F5), Rule Check (F5), Pile Pull (F6), Eight Safe Queens (F10).
   Loaded after puzzles_kit.js. make(level,rng) is pure and deterministic. Generators and solvers are exposed on PZD1 for tests/pzd1_logic.js.
   Wording is about the puzzle only: no claims about the brain, memory, attention, intelligence, school or health. No luck anywhere.
   par: Spotlight Cue and Bigger, Faster use the trial count; Rule Check is always 2 cards; Pile Pull uses an exact solver
   (fewest player moves against the computer's fixed reply); Eight Safe Queens counts the queens still to place. */
var PZD1={};
(function(){
var CSS='.pd{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.pd *{box-sizing:border-box}'
+'.pd [hidden]{display:none!important}'
+'.pd-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.pd-sub{margin:0;text-align:center;font-size:.9375rem;font-weight:700}'
+'.pd-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink);overflow-wrap:anywhere}'
+'.pd-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.pd-btn{min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer}'
+'.pd-btn.pd-main{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}'
+'.pd-btn:disabled,.pd-stone:disabled,.pd-card:disabled{background:var(--dis-bg);color:var(--dis-ink);border-color:var(--dis-bg);cursor:default}'
+'.pd-boxes{display:flex;gap:12px;justify-content:center;width:100%}'
+'.pd-box{flex:1 1 0;max-width:150px;min-height:112px;font:800 1.25rem var(--font);background:var(--surface);color:var(--ink);border:2px solid var(--edge);border-radius:var(--r1);cursor:pointer}'
+'.pd-box:disabled{cursor:default}'
+'.pd-cue{min-height:1.5em;margin:0;text-align:center;font-weight:700}'
+'.pd-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}'
+'.pd-card{min-height:96px;font:800 2rem var(--font);border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer}'
+'.pd-card[aria-pressed=true]{background:var(--tint);outline:3px solid var(--ink);outline-offset:-3px}'
+'.pd-card small{font:700 .8125rem var(--font)}'
+'.pd-piles{display:flex;gap:10px;justify-content:center;align-items:flex-start;width:100%}'
+'.pd-pile{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1 1 0;min-width:0;max-width:120px}'
+'.pd-stone{width:48px;min-height:48px;padding:0;border:2px solid var(--edge);border-radius:50%;background:var(--surface);color:var(--ink);font:700 1.125rem var(--font);cursor:pointer}'
+'.pd-board{display:grid;grid-template-columns:repeat(8,1fr);width:100%;max-width:320px;border:2px solid var(--ink);border-radius:var(--r1);overflow:hidden}'
+'.pd-sq{display:flex;align-items:center;justify-content:center;aspect-ratio:1/1;font-size:clamp(14px,4vw,20px);line-height:1;background:var(--ph);color:var(--ink)}'
+'.pd-sq.pd-dk{background:var(--tint)}'
+'.pd-sq.pd-hot{outline:2px dashed var(--ink);outline-offset:-4px}'
+'.pd-qlist{list-style:none;margin:0;padding:0;width:100%;display:flex;flex-direction:column}'
+'.pd-qrow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--line)}'
+'.pd-qrow>span{flex:1 1 9em;font-weight:600}'
+'@media (prefers-reduced-motion:reduce){.pd *{transition:none!important;animation:none!important}}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pzd1-css'))return;var s=document.createElement('style');s.id='pzd1-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'pd '+cls});root.appendChild(w);return w}
function plural(n,w){return n+' '+w+(n===1?'':'s')}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
/* drop attributes that are off (null, undefined or false) so they are not written as strings */
function strip(at){Object.keys(at).forEach(function(k){if(at[k]===null||at[k]===undefined||at[k]===false)delete at[k]});return at}
function el(tag,at,kids){return pzEl(tag,strip(at||{}),kids)}
function bt(label,fn,at){at=strip(at||{});at.class=(at.class?at.class+' ':'')+'pd-btn';if(at.class.indexOf('pd-main')<0&&at.main)at.class+=' pd-main';delete at.main;return pzBtn(label,fn,at)}
/* the mount wrapper: Undo only when the puzzle has moves to undo; Hint climbs the ladder; Restart */
function wrap(m){return function(root,inst,api){
  var lv=0,a2={},k;for(k in api)a2[k]=api[k];
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){
    var bar=pzEl('div',{class:'pd-row pd-bar'});
    if(c.undo)bar.appendChild(bt('Undo',function(){lv=0;c.undo()},{'aria-label':'Undo last move'}));
    bar.appendChild(bt('Hint',function(){lv=Math.min(3,lv+1);var s=c.hint(lv);if(s===null||s===undefined){if(api.say)api.say('No more hints here.')}},{'aria-label':'Hint'}));
    bar.appendChild(bt('Restart',function(){lv=0;c.restart()},{'aria-label':'Restart this level'}));
    if(root.firstChild)root.firstChild.appendChild(bar)}
  return{undo:c.undo?function(){lv=0;return c.undo()}:function(){return false},hint:c.hint,restart:c.restart,destroy:c.destroy}}}
function starsLine(stars,line){return{stars:stars,line:line}}

/* ================= 1. Spotlight Cue (F4) =================
   Posner-style cueing. An arrow points to one box; a dot then appears in one box. Levels 1-10: the arrow always points to the dot.
   Levels 11-30: some trials have the arrow pointing the wrong way, so the dot is the only true guide. par = number of trials. */
function spMake(level,rng){
  var n=4+Math.round((level-1)*12/29),inv=level<=10?0:Math.max(1,Math.round(n*.25)),idx=pzShuffle(seq(n),rng),bad={},t=[],i;
  for(i=0;i<inv;i++)bad[idx[i]]=true;
  for(i=0;i<n;i++){var cue=rng()<.5?'L':'R',valid=!bad[i];t.push({cue:cue,dot:valid?cue:(cue==='L'?'R':'L'),valid:valid})}
  return{level:level,title:'Level '+level,trials:t,par:n,invalid:inv}}
PZD1.sp={make:spMake};
function mountSp(root,inst,api){
  var w=shell(root,'pd-sp'),n=inst.trials.length,i,phase,taps,wrong,hints,rts,t0,tm,
    info=pzEl('p',{class:'pd-info',text:'An arrow flashes to one side. Then a dot appears in one box. Tap the box with the dot as soon as it shows. The arrow is usually right, but the dot is always the true answer.'}),
    prog=pzEl('p',{class:'pd-sub'}),cueTxt=pzEl('p',{class:'pd-cue'}),
    boxes=pzEl('div',{class:'pd-boxes',role:'group','aria-label':'Two boxes'}),
    start=bt('Start trial',function(){startTrial()},{main:true}),
    msg=pzEl('p',{class:'pd-msg',role:'status'}),box={};
  function now(){return api.now?api.now():Date.now()}
  function say(s){msg.textContent=s;if(api.say)api.say(s)}
  function paint(){
    var tr=inst.trials[i];
    prog.textContent=i<n?'Trial '+(i+1)+' of '+n:'All '+n+' trials done';
    cueTxt.textContent=(phase==='cue'&&tr)?(tr.cue==='L'?'The arrow points left':'The arrow points right'):'';
    ['L','R'].forEach(function(s){box[s].textContent=(s==='L'?'Left':'Right')+(phase==='dot'&&tr&&tr.dot===s?'  ●':'')});
    start.disabled=phase!=='ready'||i>=n;
    start.textContent='Start trial '+(i+1);start.setAttribute('aria-label','Start trial '+(i+1));
  }
  function finish(){
    var v=rts.filter(function(r){return r.valid}),avg=v.length?Math.round(v.reduce(function(a,b){return a+b.ms},0)/v.length):null;
    say('All '+n+' trials done.');
    api.done({solved:true,moves:taps,hints:hints,undos:0,extra:{par:n,wrong:wrong,avgValidMs:avg}});
  }
  function tap(s){
    if(i>=n)return;
    if(phase!=='dot'){say(phase==='cue'?'Wait for the dot.':'Press Start to begin the next trial.');return}
    var tr=inst.trials[i];taps++;api.moved();
    if(s===tr.dot){rts.push({valid:tr.valid,ms:now()-t0});i++;phase='ready';
      if(i>=n){paint();finish();return}
      say('Right. Press Start for trial '+(i+1)+' of '+n+'.')}
    else{wrong++;say('Not that box. Look for the dot and try again.')}
    paint();
  }
  box.L=bt('Left',function(){tap('L')},{class:'pd-box','aria-label':'Left box',text:'Left'});
  box.R=bt('Right',function(){tap('R')},{class:'pd-box','aria-label':'Right box',text:'Right'});
  boxes.appendChild(box.L);boxes.appendChild(box.R);
  function startTrial(){
    if(phase!=='ready'||i>=n)return;
    phase='cue';paint();say('Watch the arrow.');
    tm=setTimeout(function(){tm=null;phase='dot';t0=now();paint();say('Dot. Tap its box.')},450);
  }
  function reset(){clearTimeout(tm);tm=null;i=0;phase='ready';taps=0;wrong=0;hints=0;rts=[]}
  reset();
  w.appendChild(info);w.appendChild(prog);w.appendChild(cueTxt);w.appendChild(boxes);w.appendChild(start);w.appendChild(msg);
  paint();
  return{undo:null,
    hint:function(lv){
      if(i>=n)return null;hints++;var tr=inst.trials[i],s;
      if(lv<=1)s='The arrow is usually right, but the dot is always the true answer. Watch the dot.';
      else if(lv===2)s='Tap the box where the dot appears. If the dot has not come yet, wait for it.';
      else{
        if(phase==='dot'){tap(tr.dot);s='Tapped the box with the dot.'}
        else if(phase==='ready'){startTrial();s='Started the trial. Wait for the dot, then tap its box.'}
        else s='Wait for the dot, then tap its box.'}
      say(s);return s},
    restart:function(){reset();paint();say('Restarted. Press Start for trial 1.')},
    destroy:function(){clearTimeout(tm);tm=null;root.textContent=''}}}
registerPuzzle({id:'spotlight-cue',name:'Spotlight Cue',family:'memory',theme:'F4',areas:['attention','speed'],levels:30,secs:60,
  blurb:'Tap the box where the dot appears, after the arrow.',
  how:'Press Start. An arrow flashes to one side, then a dot appears in one box. Tap that box. Later levels point the arrow the wrong way on some trials, so follow the dot.',
  make:spMake,mount:wrap(mountSp),
  stars:function(res,inst){var p=(inst&&inst.par)||(res.extra&&res.extra.par)||0,wr=res.extra&&res.extra.wrong!=null?res.extra.wrong:Math.max(0,(res.moves||0)-p),h=res.hints||0,s=wr===0?3:wr<=2?2:1;if(h&&s===3)s=2;
    return starsLine(s,'You finished '+plural(p,'trial')+' with '+plural(wr,'wrong tap')+' and '+hintsLine(h)+'.')}});

/* ================= 2. Bigger, Faster (F5) =================
   Two numbers side by side; tap the larger one. The gap shrinks as the levels rise (the distance effect the research describes). */
function bfMake(level,rng){
  var n=10+Math.floor((level-1)/10)*2,maxV=level<=10?9:level<=20?49:99,gLo=level<=10?4:level<=20?2:1,gHi=level<=10?8:level<=20?5:3,t=[],i;
  for(i=0;i<n;i++){var gap=gLo+pzInt(rng,gHi-gLo+1),a=1+pzInt(rng,maxV-gap),b=a+gap,leftBig=rng()<.5;
    t.push({l:leftBig?b:a,r:leftBig?a:b,ans:leftBig?'L':'R',gap:gap})}
  return{level:level,title:'Level '+level,trials:t,par:n,maxV:maxV}}
PZD1.bf={make:bfMake};
function mountBf(root,inst,api){
  var w=shell(root,'pd-bf'),n=inst.trials.length,i,taps,wrong,hints,
    info=pzEl('p',{class:'pd-info',text:'Two numbers sit side by side. Tap the larger one. Early pairs are far apart; later pairs sit closer together.'}),
    prog=pzEl('p',{class:'pd-sub'}),row=pzEl('div',{class:'pd-boxes',role:'group','aria-label':'Two numbers'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'}),L,R;
  function say(s){msg.textContent=s;if(api.say)api.say(s)}
  function paint(){var tr=inst.trials[i];
    prog.textContent=i<n?'Pair '+(i+1)+' of '+n:'All '+n+' pairs done';
    if(i<n){L.textContent=String(tr.l);R.textContent=String(tr.r);L.setAttribute('aria-label','Left number '+tr.l);R.setAttribute('aria-label','Right number '+tr.r)}
    L.disabled=R.disabled=i>=n}
  function pick(s){
    if(i>=n)return;var tr=inst.trials[i];taps++;api.moved();
    if(s===tr.ans){i++;paint();
      if(i<n){say('Right. Pair '+(i+1)+' of '+n+'.')}
      else{say('All '+n+' pairs done.');api.done({solved:true,moves:taps,hints:hints,undos:0,extra:{par:n,wrong:wrong}})}}
    else{wrong++;say('Not that one. Pick the larger number.')}
  }
  L=bt('',function(){pick('L')},{class:'pd-box'});R=bt('',function(){pick('R')},{class:'pd-box'});
  row.appendChild(L);row.appendChild(R);
  function reset(){i=0;taps=0;wrong=0;hints=0}reset();
  w.appendChild(info);w.appendChild(prog);w.appendChild(row);w.appendChild(msg);paint();
  return{undo:null,
    hint:function(lv){
      if(i>=n)return null;hints++;var tr=inst.trials[i],s;
      if(lv<=1)s='Pick the number with the bigger value.';
      else if(lv===2)s=(tr.l>=10||tr.r>=10)?'Compare the tens digits first. If they match, compare the ones.':'Both numbers have one digit. The larger digit is the larger number.';
      else{pick(tr.ans);if(i>=n)return'All pairs done.';s='Picked the larger number, '+(tr.ans==='L'?tr.l:tr.r)+'.';say(s);return s}
      say(s);return s},
    restart:function(){reset();paint();say('Restarted. Pair 1 is back.')},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'bigger-faster',name:'Bigger, Faster',family:'number',theme:'F5',areas:['speed','control'],levels:30,secs:60,
  blurb:'Tap the larger of two numbers.',
  how:'Two numbers sit side by side. Tap the larger one. The first levels pair numbers far apart; later levels bring them closer together, and the numbers go higher.',
  make:bfMake,mount:wrap(mountBf),
  stars:function(res,inst){var p=(inst&&inst.par)||(res.extra&&res.extra.par)||0,wr=res.extra&&res.extra.wrong!=null?res.extra.wrong:Math.max(0,(res.moves||0)-p),h=res.hints||0,s=wr===0?3:wr<=2?2:1;if(h&&s===3)s=2;
    return starsLine(s,'You went through '+plural(p,'pair')+' with '+plural(wr,'wrong tap')+' and '+hintsLine(h)+'.')}});

/* ================= 3. Rule Check (F5) =================
   Four cards, each with a letter on one side and a number on the other. A rule links the two sides. Choose the cards that could break the rule.
   Levels 1-10: the vowel/even rule. Levels 11-30: four rule shapes. Exactly two cards can break the rule; par = 2. */
var RC_VOW='AEIOU',RC_CON='BCDFGHJKLMNPRSTVWXYZ';
var RC_TPL=[{p:'vowel',q:'even'},{p:'consonant',q:'odd'},{p:'vowel',q:'odd'},{p:'consonant',q:'even'}];
function rcRuleText(t){return'If a card has a '+t.p+' on one side, the other side has '+(t.q==='even'?'an even':'an odd')+' number.'}
/* a card can break the rule when its visible letter is the rule's first part, or its visible number is the opposite of the second part */
function rcBreaks(c,t){if(c.kind==='letter')return(t.p==='vowel'?RC_VOW:RC_CON).indexOf(c.v)>=0;return t.q==='even'?c.v%2===1:c.v%2===0}
function rcMake(level,rng){
  var t=level<=10?RC_TPL[0]:RC_TPL[pzInt(rng,4)],pSet=t.p==='vowel'?RC_VOW:RC_CON,nSet=t.p==='vowel'?RC_CON:RC_VOW,
    qNums=t.q==='even'?[2,4,6,8]:[1,3,5,7,9],notQ=t.q==='even'?[1,3,5,7,9]:[2,4,6,8],used={},kinds=[],cor,inc,all;
  function pick(arr){for(var g=0;g<60;g++){var v=arr[pzInt(rng,arr.length)];if(!used[v]){used[v]=1;return v}}return arr[0]}
  kinds.push(rng()<.5?'p':'n');kinds.push(rng()<.5?'p':'n');
  cor=kinds.map(function(k){return k==='p'?{kind:'letter',v:pick(pSet)}:{kind:'number',v:pick(notQ)}});
  inc=[{kind:'letter',v:pick(nSet)},{kind:'number',v:pick(qNums)}];
  all=pzShuffle(cor.concat(inc),rng);
  var correct=[];all.forEach(function(c,k){if(rcBreaks(c,t))correct.push(k)});
  return{level:level,title:'Level '+level,rule:t,ruleText:rcRuleText(t),cards:all,correct:correct,par:2}}
PZD1.rc={make:rcMake,breaks:rcBreaks,ruleText:rcRuleText};
function mountRc(root,inst,api){
  var w=shell(root,'pd-rc'),sel=[],stack=[],taps=0,wrong=0,hints=0,undos=0,fin=false,
    rule=pzEl('p',{class:'pd-info',text:'Rule: '+inst.ruleText}),
    grid=pzEl('div',{class:'pd-grid',role:'group','aria-label':'Cards'}),
    check=bt('Check my cards',function(){checkNow()},{main:true}),
    msg=pzEl('p',{class:'pd-msg',role:'status'});
  function say(s){msg.textContent=s;if(api.say)api.say(s)}
  function flip(k){var at=sel.indexOf(k);if(at>=0)sel.splice(at,1);else sel.push(k)}
  function toggle(k){if(fin)return;taps++;api.moved();flip(k);stack.push(k);paint()}
  function paint(){
    grid.textContent='';
    inst.cards.forEach(function(c,k){var on=sel.indexOf(k)>=0;
      grid.appendChild(el('button',{type:'button',class:'pd-card',disabled:fin?'disabled':null,'aria-pressed':on?'true':'false','aria-label':'Card '+c.v+', '+(on?'chosen to turn over':'not chosen'),onclick:function(){toggle(k)}},[
        pzEl('span',{text:String(c.v)}),pzEl('small',{text:on?'Turn over':'Tap to choose'})]))});
    check.disabled=fin;
  }
  function checkNow(){
    if(fin)return;
    var got=sel.slice().sort(function(a,b){return a-b}).join(),want=inst.correct.slice().sort(function(a,b){return a-b}).join();
    if(got===want){fin=true;paint();say('Yes. Those two cards are the ones that could break the rule.');
      api.done({solved:true,moves:taps,hints:hints,undos:undos,extra:{par:inst.par,wrong:wrong}})}
    else{wrong++;say('Not quite. Ask of each card: could its hidden side break the rule?')}
  }
  w.appendChild(rule);w.appendChild(grid);w.appendChild(check);w.appendChild(msg);
  paint();
  return{
    undo:function(){if(fin||!stack.length)return false;var k=stack.pop();flip(k);undos++;paint();say('Undone.');return true},
    hint:function(lv){
      if(fin)return null;hints++;var s,t=inst.rule;
      if(lv<=1)s='Ask of each card: could its hidden side break the rule?';
      else if(lv===2)s='Only a card that shows a '+t.p+', or shows the opposite of the second part, can break the rule: '+(t.q==='even'?'an odd number':'an even number')+'.';
      else{
        inst.cards.forEach(function(c,k){if(inst.correct.indexOf(k)>=0&&sel.indexOf(k)<0){taps++;api.moved();flip(k);stack.push(k)}});
        sel.slice().forEach(function(k){if(inst.correct.indexOf(k)<0){taps++;api.moved();flip(k);stack.push(k)}});
        paint();s='Chose the two cards that could break the rule. Press Check to confirm.'}
      say(s);return s},
    restart:function(){sel=[];stack=[];taps=0;wrong=0;hints=0;undos=0;fin=false;paint();say('Restarted.')},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'rule-check',name:'Rule Check',family:'number',theme:'F5',areas:['control','flex'],levels:30,secs:90,
  blurb:'Choose the cards that could break a rule.',
  how:'Each card shows one side only. A rule links the two sides. Choose the cards you must turn over to test the rule, then press Check. Only the cards that could break the rule are right.',
  make:rcMake,mount:wrap(mountRc),
  stars:function(res,inst){var wr=res.extra&&res.extra.wrong!=null?res.extra.wrong:0,h=res.hints||0,s=wr===0?3:wr===1?2:1;if(h&&s===3)s=2;
    return starsLine(s,'You found the two cards with '+plural(wr,'wrong check')+' and '+hintsLine(h)+'.')}});

/* ================= 4. Pile Pull (F6) =================
   Three piles. A move takes one or more stones from one pile: tap a stone to take it and every stone below it in its pile.
   Whoever takes the last stone wins. The computer replies with a fixed rule (ppComputer). par = the fewest player moves that win against that reply. */
function ppXor(p){return p[0]^p[1]^p[2]}
function ppTotal(p){return p[0]+p[1]+p[2]}
/* the computer: from a position with xor 0 it takes one stone from the largest pile; otherwise it moves to xor 0 (the balancing move) */
function ppComputer(p){
  var x=ppXor(p),i,t;
  if(x){for(i=0;i<3;i++){t=p[i]^x;if(t<p[i]){var q=p.slice();q[i]=t;return{m:{i:i,n:p[i]-t},s:q}}}}
  var bi=0;for(i=1;i<3;i++)if(p[i]>p[bi])bi=i;
  var r=p.slice();r[bi]-=1;return{m:{i:bi,n:1},s:r}}
var ppMemo={};
function ppValueAfter(p,i,n){
  var q=p.slice();q[i]-=n;if(ppTotal(q)===0)return 1;
  var c=ppComputer(q).s;if(ppTotal(c)===0)return Infinity;
  var f=ppBest(c);return f===Infinity?Infinity:1+f}
function ppBest(p){
  var key=p.join(','),best=Infinity,i,n,v;
  if(ppMemo[key]!==undefined)return ppMemo[key];
  if(ppTotal(p)===0)return 0;
  for(i=0;i<3;i++)for(n=1;n<=p[i];n++){v=ppValueAfter(p,i,n);if(v<best)best=v}
  ppMemo[key]=best;return best}
function ppBestMove(p){
  var best=null,bv=Infinity,i,n,v;
  for(i=0;i<3;i++)for(n=1;n<=p[i];n++){v=ppValueAfter(p,i,n);if(v<bv){bv=v;best={i:i,n:n}}}
  return best}
function ppMake(level,rng){
  var mx=level<=10?4:level<=20?6:8,minT=level<=10?4:level<=20?8:12,p,tries=0;
  do{p=[1+pzInt(rng,mx),1+pzInt(rng,mx),1+pzInt(rng,mx)];tries++}
  while((ppXor(p)===0||ppTotal(p)<minT||ppBest(p)===Infinity)&&tries<500);
  if(ppXor(p)===0||ppBest(p)===Infinity)p=[1,2,4];
  return{level:level,title:'Level '+level,piles:p,par:ppBest(p)}}
PZD1.pp={make:ppMake,computer:ppComputer,best:ppBest,bestMove:ppBestMove,xor:ppXor};
function mountPp(root,inst,api){
  var w=shell(root,'pd-pp'),p=inst.piles.slice(),stack=[],taps=0,hints=0,undos=0,fin=false,lost=false,
    info=pzEl('p',{class:'pd-info',text:'Tap a stone to take it and every stone below it in its pile. The computer answers after each move. Whoever takes the last stone wins.'}),
    board=pzEl('div',{class:'pd-piles'}),msg=pzEl('p',{class:'pd-msg',role:'status'});
  function say(s){msg.textContent=s;if(api.say)api.say(s)}
  function paint(){
    board.textContent='';
    p.forEach(function(size,i){
      var col=pzEl('div',{class:'pd-pile',role:'group','aria-label':'Pile '+(i+1)+', '+plural(size,'stone')});
      col.appendChild(pzEl('p',{class:'pd-sub',text:'Pile '+(i+1)+' ('+size+')'}));
      if(!size)col.appendChild(pzEl('p',{class:'pd-info',text:'Empty'}));
      for(var k=0;k<size;k++)(function(count){
        col.appendChild(el('button',{type:'button',class:'pd-stone',text:'●','aria-label':'Take '+plural(count,'stone')+' from pile '+(i+1),disabled:(fin||lost)?'disabled':null,onclick:function(){take(i,count)}}))})(size-k);
      board.appendChild(col)});
  }
  function take(i,n){
    if(fin||lost||p[i]<n)return;
    stack.push(p.slice());taps++;api.moved();p[i]-=n;
    if(ppTotal(p)===0){fin=true;paint();say('You took the last stone. You win.');
      api.done({solved:true,moves:taps,hints:hints,undos:undos,extra:{par:inst.par}});return}
    var c=ppComputer(p);p=c.s;
    if(ppTotal(p)===0){lost=true;paint();say('The computer took the last stone. Undo, then try another move.');return}
    paint();say('Computer took '+plural(c.m.n,'stone')+' from pile '+(c.m.i+1)+'. Your move.');
  }
  w.appendChild(info);w.appendChild(board);w.appendChild(msg);paint();
  return{
    undo:function(){if(!stack.length||fin)return false;p=stack.pop();lost=false;undos++;paint();say('Undone.');return true},
    hint:function(lv){
      if(fin||lost)return null;hints++;var s;
      if(lv<=1)s='Write each pile size in binary. A position is balanced when every column of digits has an even number of ones.';
      else if(lv===2)s='Take stones so that the piles end up balanced. The computer then has to leave them unbalanced, and you can balance them again.';
      else{var bm=ppBestMove(p);take(bm.i,bm.n);if(fin)return'You took the last stone.';s='Took '+plural(bm.n,'stone')+' from pile '+(bm.i+1)+'.';say(s);return s}
      say(s);return s},
    restart:function(){p=inst.piles.slice();stack=[];taps=0;hints=0;undos=0;fin=false;lost=false;paint();say('Restarted from the first position.')},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'pile-pull',name:'Pile Pull',family:'number',theme:'F6',areas:['control','flex'],levels:30,secs:120,
  blurb:'Take stones so that the last stone is yours.',
  how:'Three piles of stones. Tap a stone to take it and every stone below it. Whoever takes the last stone wins. The computer answers after each of your moves, so plan ahead.',
  make:ppMake,mount:wrap(mountPp),
  stars:function(res,inst){var p=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves||0,h=res.hints||0,s=m<=p?3:m<=p+2?2:1;if(h&&s===3)s=2;
    return starsLine(s,'You won in '+plural(m,'move')+' and '+hintsLine(h)+'. The fewest possible against this computer is '+p+'.')}});

/* ================= 5. Eight Safe Queens (F10) =================
   Place eight queens on an 8x8 board so that no two share a row, column or diagonal. Each row holds one queen.
   Some queens are fixed from one of the 92 solutions at the start (more at the low levels). par = queens still to place. */
var EQ_SOL=null;
function eqSolutions(){
  if(EQ_SOL)return EQ_SOL;EQ_SOL=[];var cols=[];
  (function go(r){if(r===8){EQ_SOL.push(cols.slice());return}
    for(var c=0;c<8;c++){var ok=true;for(var q=0;q<r;q++){if(cols[q]===c||Math.abs(cols[q]-c)===r-q){ok=false;break}}if(ok){cols[r]=c;go(r+1)}}})(0);
  return EQ_SOL}
function eqAttacked(cols,r){var c=cols[r],q;for(q=0;q<8;q++){if(q===r||cols[q]<0)continue;if(cols[q]===c||Math.abs(cols[q]-c)===Math.abs(q-r))return true}return false}
function eqSolved(cols){for(var r=0;r<8;r++){if(cols[r]<0||eqAttacked(cols,r))return false}return true}
function eqMake(level,rng){
  var sols=eqSolutions(),S=sols[pzInt(rng,sols.length)],k=Math.max(0,7-Math.floor((level-1)/4)),rows=pzShuffle(seq(8),rng),start=[],fixed=[],i;
  for(i=0;i<8;i++){start.push(-1);fixed.push(false)}
  for(i=0;i<k;i++){start[rows[i]]=S[rows[i]];fixed[rows[i]]=true}
  return{level:level,title:'Level '+level,start:start,fixed:fixed,par:8-k}}
PZD1.eq={make:eqMake,solutions:eqSolutions,solved:eqSolved,attacked:eqAttacked};
function mountEq(root,inst,api){
  var w=shell(root,'pd-eq'),cols=inst.start.slice(),stack=[],moves=0,hints=0,undos=0,fin=false,
    info=pzEl('p',{class:'pd-info',text:'Each row needs one queen. Queens attack along their row, their column and both diagonals. Move queens with Left and Right, Clear a row, or Add a queen, until all eight are safe. Fixed queens cannot move.'}),
    board=pzEl('div',{class:'pd-board','aria-hidden':'true'}),list=pzEl('ol',{class:'pd-qlist','aria-label':'Rows'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'});
  function say(s){msg.textContent=s;if(api.say)api.say(s)}
  function setCol(r,c){
    if(fin||inst.fixed[r]||cols[r]===c)return false;
    stack.push({r:r,prev:cols[r]});cols[r]=c;moves++;api.moved();paint();
    if(eqSolved(cols)){fin=true;paint();say('All eight queens are safe.');
      api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par}})}
    return true}
  function paint(){
    board.textContent='';
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      var cl='pd-sq'+((r+c)%2?' pd-dk':''),txt='';
      if(cols[r]===c){txt='♛';if(eqAttacked(cols,r))cl+=' pd-hot'}
      board.appendChild(el('div',{class:cl,text:txt}))}
    list.textContent='';
    var off=!!fin;
    for(var q=0;q<8;q++)(function(r){
      var c=cols[r],att=c>=0&&eqAttacked(cols,r),lab='Row '+(r+1)+': '+(c<0?'no queen':'queen in column '+(c+1)+(att?', under attack':''));
      var kids=[pzEl('span',{text:lab})];
      if(inst.fixed[r])kids.push(pzEl('span',{class:'pd-info',text:'Fixed'}));
      else if(c<0)kids.push(bt('Add',function(){setCol(r,0)},{'aria-label':'Row '+(r+1)+': add a queen in column 1',disabled:off?'disabled':null}));
      else{
        kids.push(bt('Left',function(){setCol(r,c-1)},{'aria-label':'Row '+(r+1)+': move queen one column left',disabled:(off||c===0)?'disabled':null}));
        kids.push(bt('Right',function(){setCol(r,c+1)},{'aria-label':'Row '+(r+1)+': move queen one column right',disabled:(off||c===7)?'disabled':null}));
        kids.push(bt('Clear',function(){setCol(r,-1)},{'aria-label':'Row '+(r+1)+': remove the queen',disabled:off?'disabled':null}))}
      list.appendChild(el('li',{class:'pd-qrow'},[pzEl('span',{text:lab}),pzEl('div',{class:'pd-row'},kids.slice(1))]))})(q);
  }
  w.appendChild(info);w.appendChild(board);w.appendChild(list);w.appendChild(msg);paint();
  return{
    undo:function(){if(fin||!stack.length)return false;var a=stack.pop();cols[a.r]=a.prev;undos++;paint();say('Undone.');return true},
    hint:function(lv){
      if(fin)return null;hints++;var s;
      if(lv<=1)s='Every row needs exactly one queen, and no two queens may share a column or a diagonal.';
      else if(lv===2)s='Work down the rows. Move any queen that is under attack to a column that no other queen covers.';
      else{
        var cand=eqSolutions().filter(function(S){return inst.fixed.every(function(f,r){return !f||S[r]===cols[r]})}),best=null,bm=-1;
        cand.forEach(function(S){var m=0;for(var r=0;r<8;r++)if(cols[r]>=0&&cols[r]===S[r])m++;if(m>bm){bm=m;best=S}});
        var r1=-1,r2=-1,rr;
        for(rr=0;rr<8&&r1<0;rr++)if(!inst.fixed[rr]&&cols[rr]>=0&&cols[rr]!==best[rr])r1=rr;
        for(rr=0;rr<8&&r2<0;rr++)if(!inst.fixed[rr]&&cols[rr]<0)r2=rr;
        if(r1>=0){setCol(r1,-1);s='Removed the queen in row '+(r1+1)+'. It does not fit a full solution with the others.'}
        else if(r2>=0){setCol(r2,best[r2]);s='Placed a queen in row '+(r2+1)+', column '+(best[r2]+1)+'.'}
        else s='Every row is already in place.';
        say(s);return s}
      say(s);return s},
    restart:function(){cols=inst.start.slice();stack=[];moves=0;hints=0;undos=0;fin=false;paint();say('Restarted with the fixed queens only.')},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'eight-safe-queens',name:'Eight Safe Queens',family:'grid',theme:'F10',areas:['space','control'],levels:30,secs:150,
  blurb:'Place eight queens so that none can attack another.',
  how:'Each row needs one queen. A queen attacks its row, its column and both diagonals. Move queens along their row until all eight are safe. Some queens are fixed at the start.',
  make:eqMake,mount:wrap(mountEq),
  stars:function(res,inst){var p=(inst&&inst.par)||(res.extra&&res.extra.par)||0,m=res.moves||0,h=res.hints||0,s=m<=p+2?3:m<=p+6?2:1;if(h&&s===3)s=2;
    return starsLine(s,'You solved it in '+plural(m,'move')+' and '+hintsLine(h)+'. Queens still to place at the start: '+p+'.')}});
})();
