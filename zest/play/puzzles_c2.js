/* Zest puzzles, wave 1 file 2: Digit Shuffle, Remainder Riddle, Balance Weights.
   Loaded after puzzles_kit.js. Every make(level,rng) is pure (no Math.random, no DOM): the same seed gives the same puzzle on every device.
   Generators and solvers are exposed on PZC2 for tests/pzc2_logic.js. mount() returns {undo,hint,restart,destroy}; done() fires about 350 ms after the last move.
   Wording is about the puzzle only: no claims about the brain or health. No luck anywhere.

   Digit Shuffle: Kaprekar's routine on four digits (biggest arrangement minus smallest, repeat) until 6174. par = the number of steps (always 1 to 7).
     moves = entries made (right and wrong). Levels 1-10 show the two arrangements; 21-30 first ask the player to predict the step count (a prediction never costs anything).
   Remainder Riddle: smallest positive number with remainders r1,r2,r3 for three pairwise co-prime moduli (answer below their product M).
     Helper grid: a list of every number up to M with a given remainder. par = 2 list reveals: open the lists of the two LARGEST moduli, the numbers shared by both are
     only m1 candidates (M / (m2*m3)), and exactly one of them also fits the smallest modulus. moves = lists opened + wrong answers.
   Balance Weights: weigh an object with the fewest weights from a set, weights allowed on either pan (right pan gets +w, left pan with the object gets -w).
     par = the true minimum number of weights, found by trying every left/off/right placement of the set. res.moves = weights on the pans when it balances. */
var PZC2={};
(function(){
var CSS='.pc{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.pc *{box-sizing:border-box}'
+'.pc [hidden]{display:none!important}'
+'.pc-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.pc-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.pc-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.pc-btn,.pc-key{min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer}'
+'.pc-btn.pc-main{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}'
+'.pc-btn:disabled,.pc-key:disabled{background:var(--dis-bg);color:var(--dis-ink);border-color:var(--dis-bg);cursor:default}'
+'.pc-btn[aria-pressed=true]{background:var(--tint);outline:3px solid var(--ink);outline-offset:-3px}'
+'.pc-key{font-size:1.25rem;padding:4px 0;width:52px}'
+'.pc-big{margin:0;font:800 2.5rem var(--font);letter-spacing:.12em;text-align:center}'
+'.pc-sub{margin:0;font:600 .9375rem var(--font);text-align:center}'
+'.pc-slots{display:flex;gap:6px;justify-content:center}'
+'.pc-slot{display:flex;align-items:center;justify-content:center;width:48px;height:56px;border:2px dashed var(--edge);border-radius:var(--r1);background:var(--surface);font:700 1.5rem var(--font)}'
+'.pc-slot.pc-full{border-style:solid;background:var(--tint)}'
+'.pc-list{list-style:none;margin:0;padding:0;width:100%;display:flex;flex-direction:column;gap:6px}'
+'.pc-list li{display:flex;flex-wrap:wrap;gap:4px 12px;justify-content:space-between;padding:8px 12px;border:1px solid var(--line);border-radius:var(--r1);background:var(--surface);font-weight:600}'
+'.pc-list b{font-size:1.125rem;letter-spacing:.08em}'
+'.pc-in{width:100%;max-width:200px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1.25rem var(--font);text-align:center}'
+'.pc-grid{width:100%;display:flex;flex-direction:column;gap:8px}'
+'.pc-grid .pc-btn{width:100%;text-align:left}'
+'.pc-chips{margin:0;padding:6px 0 0;list-style:none;display:flex;flex-wrap:wrap;gap:4px}'
+'.pc-chip{min-width:36px;padding:2px 6px;border:1px solid var(--line);border-radius:6px;background:var(--surface);font:600 .875rem var(--font);text-align:center}'
+'.pc-chip.pc-both{border:2px solid var(--ink);background:var(--tint);font-weight:800;text-decoration:underline}'
+'.pc-chip.pc-both::after{content:"\\2713"}'
+'.pc-box{width:100%;padding:6px;border:1px solid var(--line);border-radius:var(--r1);background:var(--ph)}'
+'.pc-scale{width:100%;display:flex;flex-direction:column;align-items:center;gap:6px}'
+'.pc-beam{width:70%;height:10px;border-radius:5px;background:var(--ink);transition:transform .15s}'
+'.pc-pans{display:flex;gap:8px;width:100%}'
+'.pc-pan{flex:1 1 0;min-width:0;min-height:76px;padding:6px;border:2px solid var(--edge);border-radius:0 0 18px 18px;background:var(--surface);text-align:center;font:600 .875rem var(--font);overflow-wrap:anywhere}'
+'.pc-pan b{display:block;font-size:1.125rem}'
+'.pc-wrow{display:flex;flex-wrap:wrap;align-items:center;gap:6px;justify-content:space-between;width:100%;padding:4px 0;border-bottom:1px solid var(--line)}'
+'.pc-wrow>span{flex:1 1 4em;font:800 1.25rem var(--font)}'
+'.pc-wrow.pc-hint>span::after{content:" ?"}'
+'.pc-wrow .pc-btn{padding:6px 8px;min-width:56px}'
+'.phone.rm .pc *,.phone.rm .pc *::before{transition:none!important;animation:none!important}'
+'@media (prefers-reduced-motion:reduce){.pc *,.pc *::before{transition:none!important;animation:none!important}}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pzc2-css'))return;var s=document.createElement('style');s.id='pzc2-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function B(txt,fn,cls,at){at=at||{};at.class='pc-btn '+(cls||'');return pzBtn(txt,fn,at)}
function K(txt,fn,label){return pzBtn(txt,fn,{class:'pc-key','aria-label':label||txt})}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'pc '+cls});root.appendChild(w);return w}
function plural(n,w){return n+' '+w+(n===1?'':'s')}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
function pad4(n){return ('000'+n).slice(-4)}
/* every mount is wrapped: done() fires 350 ms after the last move; an Undo / Hint / Restart row is drawn unless api.toolbar===false or inst.toolbar===false */
function wrapMount(m){return function(root,inst,api){var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'pc-row pc-bar'}),w=root.firstChild;
    bar.appendChild(B('Undo',function(){lv=0;c.undo()},'',{'aria-label':'Undo'}));
    bar.appendChild(B('Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)},'',{'aria-label':'Hint'}));
    bar.appendChild(B('Restart',function(){lv=0;c.restart()},'',{'aria-label':'Restart this level'}));
    if(w)w.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,destroy:function(){clearTimeout(tm);c.destroy()}}}}

/* ================= 1. Digit Shuffle ================= */
function dsStep(n){var d=[Math.floor(n/1000),Math.floor(n/100)%10,Math.floor(n/10)%10,n%10].sort(function(a,b){return a-b});
  return(d[3]*1000+d[2]*100+d[1]*10+d[0])-(d[0]*1000+d[1]*100+d[2]*10+d[3])}
function dsArr(n){var d=[Math.floor(n/1000),Math.floor(n/100)%10,Math.floor(n/10)%10,n%10].sort(function(a,b){return a-b});
  return{big:d[3]*1000+d[2]*100+d[1]*10+d[0],small:d[0]*1000+d[1]*100+d[2]*10+d[3]}}
function dsSteps(n){var c=0;while(n!==6174){n=dsStep(n);c++;if(n===0||c>20)return-1}return c}
var dsPools=null;
function dsPool(){if(dsPools)return dsPools;dsPools={};for(var n=1;n<=9999;n++){var s=dsSteps(n);if(s>0){(dsPools[s]=dsPools[s]||[]).push(n)}}return dsPools}
function dsTarget(level){return 1+Math.round((level-1)*6/29)}
function dsMake(level,rng){var t=dsTarget(level),pool=dsPool()[t];if(level<=10)pool=pool.filter(function(n){return n>=1000});
  var n=pool[pzInt(rng,pool.length)];
  return{level:level,title:'Level '+level,start:n,par:t,predict:level>=21,helper:level<=10}}
PZC2.ds={step:dsStep,steps:dsSteps,make:dsMake,arr:dsArr,target:dsTarget};
function mountDs(root,inst,api){
  var w=shell(root,'pc-ds'),cur,trail,entry,pred,subs,wrong,hints=0,undos=0,fin,showH,i,
    info=pzEl('p',{class:'pc-info',text:'Write the digits biggest first, then smallest first, and subtract. Do it again with the answer, and keep going until you reach 6174.'}),
    now=pzEl('p',{class:'pc-big'}),sub=pzEl('p',{class:'pc-sub'}),
    predBox=pzEl('div',{class:'pc-row',role:'group','aria-label':'Guess how many steps it takes'}),predTxt=pzEl('p',{class:'pc-sub',text:'How many steps will it take to reach 6174? Pick a guess.'}),
    slots=pzEl('div',{class:'pc-slots',role:'group','aria-label':'Your answer'}),pad=pzEl('div',{class:'pc-row'}),ctl=pzEl('div',{class:'pc-row'}),
    msg=pzEl('p',{class:'pc-msg',role:'status'}),list=pzEl('ol',{class:'pc-list','aria-label':'Steps so far'}),sl=[],check;
  function say(t){msg.textContent=t;api.say(t)}
  function reset(){trail=[inst.start];entry=[];pred=inst.predict?null:-1;subs=0;wrong=0;fin=false;showH=!!inst.helper;msg.textContent=''}reset();
  function needPred(){return pred===null}
  function nextN(){return dsStep(trail[trail.length-1])}
  function paint(){cur=trail[trail.length-1];var a=dsArr(cur);now.textContent=pad4(cur);now.setAttribute('aria-label','Current number '+pad4(cur).split('').join(' '));
    sub.textContent=showH?'Biggest: '+pad4(a.big)+'   Smallest: '+pad4(a.small):'';sub.hidden=!showH||fin;
    predBox.hidden=predTxt.hidden=!needPred()||fin;slots.hidden=pad.hidden=ctl.hidden=needPred()||fin;
    for(var k=0;k<4;k++){var v=entry[k];sl[k].textContent=v===undefined?'':v;sl[k].className='pc-slot'+(v===undefined?'':' pc-full');sl[k].setAttribute('aria-label','Digit '+(k+1)+', '+(v===undefined?'empty':v))}
    check.disabled=fin||entry.length<4;list.textContent='';
    for(var s=1;s<trail.length;s++){var a2=dsArr(trail[s-1]);list.appendChild(pzEl('li',{},[pzEl('span',{text:pad4(a2.big)+' − '+pad4(a2.small)}),pzEl('b',{text:'= '+pad4(trail[s])})]))}}
  function put(d){if(fin||needPred()||entry.length>=4)return;entry.push(d);msg.textContent='';paint()}
  function erase(){if(fin||needPred())return;entry.pop();paint()}
  function pick(n){if(fin||!needPred())return;pred=n;say('You guessed '+plural(n,'step')+'. Now work it out.');paint()}
  for(i=0;i<4;i++){var e=pzEl('span',{class:'pc-slot',role:'img'});sl.push(e);slots.appendChild(e)}
  for(i=0;i<10;i++)(function(d){pad.appendChild(K(String(d),function(){put(d)},'Digit '+d))})(i);
  pad.appendChild(pzBtn('⌫',erase,{class:'pc-key','aria-label':'Erase a digit'}));
  check=B('Check',function(){submit()},'pc-main');ctl.appendChild(check);
  for(i=1;i<=7;i++)(function(n){predBox.appendChild(pzBtn(String(n),function(){pick(n)},{class:'pc-key','aria-label':'Guess '+plural(n,'step')}))})(i);
  function submit(){if(fin||needPred()||entry.length<4)return;var val=+entry.join(''),ok=nextN();subs++;api.moved();
    if(val===ok){trail.push(val);entry=[];showH=!!inst.helper;
      if(val===6174){fin=true;paint();var st=trail.length-1,t='You reached 6174 in '+plural(st,'step')+'.';if(inst.predict)t+=' You guessed '+pred+(pred===st?', and that was right.':'.');say(t);
        api.done({solved:true,moves:subs,hints:hints,undos:undos,extra:{par:inst.par,steps:st,wrong:wrong,predicted:inst.predict?pred:null,predictRight:inst.predict?pred===st:null}});return}
      say('Right: '+pad4(val)+'. Keep going.')}
    else{wrong++;entry=[];say('Not quite. Check the biggest minus the smallest and try again. Take your time.')}
    paint()}
  function onkey(ev){if(fin||ev.ctrlKey||ev.metaKey||ev.altKey)return;var k=ev.key;
    if(/^[0-9]$/.test(k)){if(needPred()){if(+k>=1&&+k<=7)pick(+k)}else put(+k)}else if(k==='Backspace')erase();else if(k==='Enter'&&ev.target.tagName!=='BUTTON')submit()}
  w.addEventListener('keydown',onkey);
  w.appendChild(info);w.appendChild(now);w.appendChild(sub);w.appendChild(predTxt);w.appendChild(predBox);w.appendChild(slots);w.appendChild(pad);w.appendChild(ctl);w.appendChild(msg);w.appendChild(list);paint();
  return{undo:function(){if(fin)return false;if(entry.length){entry.pop();paint();return true}
      if(trail.length>1){trail.pop();undos++;paint();say('Undone.');return true}
      if(inst.predict&&pred!==null){pred=null;undos++;paint();say('Undone.');return true}return false},
    restart:function(){reset();paint();say('Restarted. Same number, fresh start.')},
    hint:function(lv){if(fin)return null;hints++;var a=dsArr(cur),nx=nextN(),s;
      if(needPred()){
        if(lv<=1)s='Try the first step on paper, then guess. No number needs more than 7 steps.';
        else if(lv===2)s='The first step from '+pad4(cur)+' gives '+pad4(nx)+'.';
        else{pred=dsSteps(cur);s='It takes '+plural(pred,'step')+'. Your guess is set to '+pred+'.'}
        say(s);paint();return s}
      if(lv<=1){showH=true;s='Here are the biggest and smallest ways to arrange these digits. Subtract the smaller from the bigger.'}
      else if(lv===2){showH=true;s='Work out '+pad4(a.big)+' − '+pad4(a.small)+'.'}
      else{entry=pad4(nx).split('').map(Number);s=pad4(a.big)+' − '+pad4(a.small)+' = '+pad4(nx)+'.';paint();msg.textContent=s;api.say(s);submit();return s}
      say(s);paint();return s},
    destroy:function(){w.removeEventListener('keydown',onkey);root.textContent=''}}}
registerPuzzle({id:'digit-shuffle',name:'Digit Shuffle',family:'number',theme:'F6',blurb:'Subtract, shuffle, repeat: every four-digit number ends at 6174.',
  how:'Arrange the digits biggest first and smallest first, subtract, and type the answer. Repeat with each new number until you reach 6174. Later levels ask you to guess how many steps it takes.',
  areas:['control','flex'],levels:30,secs:120,make:dsMake,mount:wrapMount(mountDs),
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||m,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You reached 6174 with '+m+(m===1?' entry':' entries')+' and '+hintsLine(h)+'. The route has '+plural(p,'step')+'.'}}});

/* ================= 2. Remainder Riddle ================= */
function gcd(a,b){return b?gcd(b,a%b):a}
var rrTriples=null;
function rrAll(){if(rrTriples)return rrTriples;rrTriples=[];for(var a=2;a<=13;a++)for(var b=a+1;b<=13;b++)for(var c=b+1;c<=13;c++)
  if(gcd(a,b)===1&&gcd(a,c)===1&&gcd(b,c)===1)rrTriples.push({m:[a,b,c],M:a*b*c});
  rrTriples.sort(function(x,y){return x.M-y.M||x.m[2]-y.m[2]||x.m[1]-y.m[1]});return rrTriples}
function rrMake(level,rng){var all=rrAll().filter(function(t){return t.M<=400}),target=24+(level-1)*(380/29),lo=target*.8,hi=target*1.2,
    pool=all.filter(function(t){return t.M>=lo&&t.M<=hi});
  if(!pool.length){pool=all.slice().sort(function(a,b){return Math.abs(a.M-target)-Math.abs(b.M-target)}).slice(0,3)}
  var t=pool[pzInt(rng,pool.length)],M=t.M,x=1+pzInt(rng,M-1),r=t.m.map(function(m){return x%m});
  return{level:level,title:'Level '+level,mods:t.m,rems:r,M:M,answer:x,par:2}}
function rrList(m,r,M){var o=[];for(var n=r;n<=M;n+=m)if(n>=1)o.push(n);return o}
function rrSolve(mods,rems,M){var o=[];for(var n=1;n<=M;n++)if(n%mods[0]===rems[0]&&n%mods[1]===rems[1]&&n%mods[2]===rems[2])o.push(n);return o}
PZC2.rr={make:rrMake,list:rrList,solve:rrSolve,triples:rrAll};
function mountRr(root,inst,api){
  var w=shell(root,'pc-rr'),m=inst.mods,r=inst.rems,M=inst.M,open,subs,wrong,hints=0,undos=0,fin,hr=-1,rows=[],chipUl=[],i,
    info=pzEl('p',{class:'pc-info',text:'A number leaves remainder '+r[0]+' when divided by '+m[0]+', remainder '+r[1]+' when divided by '+m[1]+', and remainder '+r[2]+' when divided by '+m[2]+'. What is the smallest such number? It is no more than '+M+'. Open the lists to help.'}),
    grid=pzEl('div',{class:'pc-grid',role:'group','aria-label':'Helper lists'}),
    input=pzEl('input',{class:'pc-in',type:'text',inputmode:'numeric',autocomplete:'off','aria-label':'Your answer, a number'}),ctl=pzEl('div',{class:'pc-row'}),
    msg=pzEl('p',{class:'pc-msg',role:'status'}),check;
  function say(t){msg.textContent=t;api.say(t)}
  function reset(){open=[];subs=0;wrong=0;fin=false;hr=-1;input.value='';msg.textContent=''}reset();
  function paint(){var cnt={},k;open.forEach(function(q){rrList(m[q],r[q],M).forEach(function(n){cnt[n]=(cnt[n]||0)+1})});
    for(k=0;k<3;k++){var on=open.indexOf(k)>=0,b=rows[k];
      b.setAttribute('aria-expanded',on?'true':'false');b.disabled=fin;
      b.textContent=(on?'Hide':'Show')+' numbers up to '+M+' that leave '+r[k]+' when divided by '+m[k]+(hr===k?' (try this one)':'');
      b.setAttribute('aria-label',(on?'Hide':'Show')+' list for divisor '+m[k]+', remainder '+r[k]+(hr===k?', hint':''));
      var ul=chipUl[k];ul.textContent='';ul.hidden=!on;
      if(on)rrList(m[k],r[k],M).forEach(function(n){var both=open.length>=2&&cnt[n]===open.length;
        ul.appendChild(pzEl('li',{class:'pc-chip'+(both?' pc-both':''),text:String(n),'aria-label':n+(both?', in every open list':'')}))})}
    check.disabled=fin}
  function toggle(k){if(fin)return;var p=open.indexOf(k);if(p>=0){open.splice(p,1)}else{open.push(k);subs++;api.moved();say('List opened. Numbers in every open list are marked with a tick.')}hr=-1;paint()}
  for(i=0;i<3;i++)(function(k){var box=pzEl('div',{class:'pc-box'}),b=pzBtn('',function(){toggle(k)},{class:'pc-btn','aria-expanded':'false'}),ul=pzEl('ul',{class:'pc-chips','aria-label':'Numbers leaving '+r[k]+' when divided by '+m[k]});
    rows.push(b);chipUl.push(ul);box.appendChild(b);box.appendChild(ul);grid.appendChild(box)})(i);
  check=B('Check',function(){submit()},'pc-main');ctl.appendChild(check);
  function submit(){if(fin)return;var v=input.value.trim();if(!/^\d+$/.test(v)){say('Type a whole number first.');return}
    var n=+v;if(n===inst.answer){fin=true;paint();
      say(inst.answer+' divided by '+m.map(function(q,k){return q+' leaves '+r[k]}).join(', by ')+'. You found it.');
      api.done({solved:true,moves:subs,hints:hints,undos:undos,extra:{par:inst.par,answer:inst.answer,wrong:wrong,opened:open.length}});return}
    wrong++;subs++;api.moved();var k=0;for(var j=2;j>=0;j--)if(n%m[j]!==r[j])k=j;
    say(n%m[k]===r[k]?'That fits all three, but a smaller number does too.':'Not quite: '+n+' divided by '+m[k]+' leaves '+(n%m[k])+', not '+r[k]+'.');
    input.value='';try{input.focus()}catch(e){}}
  input.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();submit()}});
  w.appendChild(info);w.appendChild(grid);w.appendChild(input);w.appendChild(ctl);w.appendChild(msg);paint();
  return{undo:function(){if(fin||!open.length)return false;open.pop();undos++;hr=-1;paint();say('List hidden.');return true},
    restart:function(){reset();paint();say('Restarted. Same riddle, fresh start.')},
    hint:function(lv){if(fin)return null;hints++;var s;
      if(lv<=1){hr=2;s='The lists for '+m[2]+' and '+m[1]+' are the shortest. Open those two.'}
      else if(lv===2){hr=1;s='Look for numbers that appear in both of those lists. Then test them: which one leaves '+r[0]+' when divided by '+m[0]+'?'}
      else{[2,1].forEach(function(k){if(open.indexOf(k)<0){open.push(k);subs++;api.moved()}});hr=-1;input.value=String(inst.answer);s='The answer is '+inst.answer+'.';paint();msg.textContent=s;api.say(s);submit();return s}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'remainder-riddle',name:'Remainder Riddle',family:'number',theme:'F6',blurb:'Find the number from the remainders it leaves.',
  how:'You are told the remainder left by three divisions. Open the helper lists to see numbers with each remainder, spot the ones that appear in every list, and type the smallest number that fits.',
  areas:['control','flex'],levels:30,secs:120,make:rrMake,mount:wrapMount(mountRr),
  stars:function(res,inst){var p=(inst&&inst.par)||(res.extra&&res.extra.par)||2,h=res.hints||0,m=res.moves,s=m<=p?3:m<=p+1?2:1;if(h&&s===3)s=2;
    return{stars:s,line:'You found the number after '+m+' lists opened or wrong tries, with '+hintsLine(h)+'. Opening the lists of the two largest divisors takes '+p+'.'}}});

/* ================= 3. Balance Weights ================= */
var bwSets={A:[1,3,9,27],B:[1,2,4,8,16,32],C:[1,3,9,27,81],E:[1,2,5,10,20,50],F:[1,2,3,5,8,13,21]};
/* min weights for every target 1..sum: try left(-1)/off(0)/right(+1) for each weight, depth first */
function bwTable(set){var best={},n=set.length;
  (function rec(i,sum,used){if(i===n){if(sum>0&&(best[sum]===undefined||used<best[sum]))best[sum]=used;return}
    rec(i+1,sum,used);rec(i+1,sum+set[i],used+1);rec(i+1,sum-set[i],used+1)})(0,0,0);return best}
function bwSolutions(set,target){var par=bwTable(set)[target],out=[],n=set.length;
  (function rec(i,sum,used,pl){if(used>par)return;if(i===n){if(sum===target&&used===par)out.push(pl.slice());return}
    pl[i]=0;rec(i+1,sum,used,pl);pl[i]=1;rec(i+1,sum+set[i],used+1,pl);pl[i]=-1;rec(i+1,sum-set[i],used+1,pl);pl[i]=0})(0,0,0,[]);return out}
function bwSpec(level){return level<=5?{k:'A',max:13,minPar:level<=2?1:2}:level<=10?{k:'A',max:40,minPar:level<=8?2:3}
  :level<=15?{k:'B',max:63,minPar:level<=13?2:3}:level<=20?{k:'C',max:121,minPar:3}:level<=25?{k:'E',max:88,minPar:3}:{k:'F',max:53,minPar:level<=27?3:4}}
function bwMake(level,rng){var sp=bwSpec(level),set=bwSets[sp.k],tb=bwTable(set),pool=[],t;
  for(t=1;t<=sp.max;t++)if(tb[t]!==undefined&&tb[t]>=sp.minPar)pool.push(t);
  if(!pool.length)for(t=1;t<=sp.max;t++)if(tb[t]!==undefined)pool.push(t);
  var target=pool[pzInt(rng,pool.length)];
  return{level:level,title:'Level '+level,set:set.slice(),target:target,par:tb[target]}}
PZC2.bw={make:bwMake,table:bwTable,solutions:bwSolutions,spec:bwSpec,sets:bwSets};
function mountBw(root,inst,api){
  var w=shell(root,'pc-bw'),set=inst.set,n=set.length,pl,hist,hints=0,undos=0,fin,hr=-1,i,sols=bwSolutions(set,inst.target),
    info=pzEl('p',{class:'pc-info',text:'The object weighs '+inst.target+' and sits on the left pan. Put weights on either pan until the pans balance. Use as few weights as you can.'}),
    beam=pzEl('div',{class:'pc-beam','aria-hidden':'true'}),panL=pzEl('div',{class:'pc-pan'}),panR=pzEl('div',{class:'pc-pan'}),
    scale=pzEl('div',{class:'pc-scale',role:'group','aria-label':'The balance'}),pans=pzEl('div',{class:'pc-pans'}),
    msg=pzEl('p',{class:'pc-msg',role:'status'}),tray=pzEl('div',{role:'group','aria-label':'Weights',style:'width:100%'}),btns=[],trows=[];
  function say(t){msg.textContent=t;api.say(t)}
  function reset(){pl=[];for(var k=0;k<n;k++)pl.push(0);hist=[];fin=false;hr=-1}reset();
  function sums(){var L=inst.target,R=0,u=0;for(var k=0;k<n;k++){if(pl[k]<0){L+=set[k];u++}else if(pl[k]>0){R+=set[k];u++}}return{L:L,R:R,u:u}}
  function names(sg){var o=[];for(var k=0;k<n;k++)if(pl[k]===sg)o.push(set[k]);return o}
  function status(s){return s.L===s.R?'Balanced.':'Left pan '+s.L+', right pan '+s.R+(s.L>s.R?': the left is heavier.':': the right is heavier.')}
  function paint(){var s=sums(),lw=names(-1),rw=names(1);
    panL.textContent='';panR.textContent='';
    panL.appendChild(pzEl('b',{text:'Left: '+s.L}));panL.appendChild(document.createTextNode('Object '+inst.target+(lw.length?' + '+lw.join(' + '):'')));
    panR.appendChild(pzEl('b',{text:'Right: '+s.R}));panR.appendChild(document.createTextNode(rw.length?rw.join(' + '):'(empty)'));
    var tilt=s.L===s.R?0:(s.L>s.R?-7:7);beam.style.transform='rotate('+tilt+'deg)';
    for(var k=0;k<n;k++){trows[k].className='pc-wrow'+(hr===k?' pc-hint':'');
      for(var q=0;q<3;q++){var b=btns[k][q],on=pl[k]===q-1;b.setAttribute('aria-pressed',on?'true':'false');b.disabled=fin}}
    scale.setAttribute('aria-label','The balance. '+status(s))}
  function place(k,v){if(fin||pl[k]===v)return;hist.push([k,pl[k]]);pl[k]=v;hr=-1;api.moved();paint();var s=sums();
    if(s.L===s.R&&s.u>0){fin=true;paint();say('Balanced with '+plural(s.u,'weight')+'. The fewest possible is '+inst.par+'.');api.done({solved:true,moves:s.u,hints:hints,undos:undos,extra:{par:inst.par,used:s.u,taps:hist.length}})}
    else say(status(s))}
  for(i=0;i<n;i++)(function(k){var row=pzEl('div',{class:'pc-wrow'}),bs=[],labs=['Left','Off','Right'];
    row.appendChild(pzEl('span',{text:String(set[k]),'aria-hidden':'true'}));
    for(var q=0;q<3;q++)(function(q){var b=pzBtn(labs[q],function(){place(k,q-1)},{class:'pc-btn','aria-label':'Weight '+set[k]+': '+(q===1?'take off the pans':'put on the '+labs[q].toLowerCase()+' pan'),'aria-pressed':'false'});bs.push(b);row.appendChild(b)})(q);
    btns.push(bs);trows.push(row);tray.appendChild(row)})(i);
  pans.appendChild(panL);pans.appendChild(panR);scale.appendChild(beam);scale.appendChild(pans);
  w.appendChild(info);w.appendChild(scale);w.appendChild(msg);w.appendChild(tray);paint();
  /* the optimal solution closest to what is on the pans; returns {k, v} for the next change (v=0 means take it off) or null */
  function next(){var best=null,bs=-1e9,k,j;for(j=0;j<sols.length;j++){var sc=0;for(k=0;k<n;k++){if(pl[k]!==0&&pl[k]===sols[j][k])sc++;else if(pl[k]!==0)sc-=1.5}if(sc>bs){bs=sc;best=sols[j]}}
    if(!best)return null;for(k=0;k<n;k++)if(pl[k]!==0&&pl[k]!==best[k])return{k:k,v:0};
    for(k=n-1;k>=0;k--)if(pl[k]===0&&best[k]!==0)return{k:k,v:best[k]};return null}
  return{undo:function(){if(fin||!hist.length)return false;var h=hist.pop();pl[h[0]]=h[1];undos++;hr=-1;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted.')},
    hint:function(lv){if(fin)return null;var t=next();if(!t)return null;hints++;var s,wt=set[t.k];
      if(lv<=1){hr=t.k;s=t.v===0?'One weight on the pans is not part of the shortest way. Look at the weight marked with a question mark.':'The shortest way uses '+plural(inst.par,'weight')+'. Look at the weight marked with a question mark.'}
      else if(lv===2){hr=t.k;s=t.v===0?'Take the '+wt+' off the pans.':'Use the '+wt+' on the '+(t.v>0?'right':'left')+' pan.'}
      else{hr=-1;s=t.v===0?'Taking the '+wt+' off.':'Putting the '+wt+' on the '+(t.v>0?'right':'left')+' pan.';place(t.k,t.v);if(!fin){msg.textContent=s;api.say(s)}return s}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'balance-weights',name:'Balance Weights',family:'number',theme:'F5',blurb:'Balance a scale with the fewest weights.',
  how:'An object sits on the left pan. For each weight choose Left, Off or Right so both pans match. Weights may go on either pan. Fewer weights is better.',
  areas:['space','flex'],levels:30,secs:120,make:bwMake,mount:wrapMount(mountBw),
  stars:function(res,inst){var u=(res.extra&&res.extra.used)||res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||u,h=res.hints||0,s=u<=p?3:u<=p+1?2:1;if(h&&s===3)s=2;
    return{stars:s,line:'You balanced it with '+plural(u,'weight')+' and '+hintsLine(h)+'. The fewest possible is '+p+'.'}}});
})();
