/* Zest puzzles, wave 2 file 2: Same Grey?, Swap Starts, Shift Three, Lotus in the Lake, Virtue Ladder.
   Loaded after puzzles_kit.js. Every make(level,rng) is pure (no Math.random, no DOM): the same seed gives the same puzzle on every device.
   Generators and solvers are exposed on PZD2 for tests/pzd2_logic.js. mount() returns {undo,hint,restart,destroy}; done() fires about 350 ms after the last move.
   Same Grey?: slide a grey bar to the grey two squares share. Presses are counted; par is the fewest presses to a grey inside the level's tolerance.
   Swap Starts: pick the phrase made by swapping the first sounds of two words. Par is one correct pick.
   Shift Three: a letter shift (Caesar style). Turn the dial until the reading is the message. Par is the fewest dial moves (steps of 1 or 5 on the 26-letter ring).
   Lotus in the Lake: a lotus stalk is the hypotenuse of a right triangle, so depth = (side squared - above squared) / (2 x above). Type the depth. Par is one try.
   Virtue Ladder: each square offers three moves of 1 to 6. Reach square 100 exactly. Ladders climb, snakes slide. Par is the shortest route (solved over the offers).
   Wording is about the puzzle only: no claims about the brain or health. No luck anywhere. */
var PZD2={};
(function(){
var CSS='.pd{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.pd *{box-sizing:border-box}'
+'.pd [hidden]{display:none!important}'
+'.pd-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.pd-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.pd-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;width:100%}'
+'.pd-btn{min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer}'
+'.pd-btn.pd-main{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}'
+'.pd-btn:disabled{background:var(--dis-bg);color:var(--dis-ink);border-color:var(--dis-bg);cursor:default}'
+'.pd-btn.pd-wrong{text-decoration:line-through;color:var(--muted)}'
+'.pd-big{margin:0;font:800 1.75rem var(--font);letter-spacing:.04em;text-align:center;overflow-wrap:anywhere;color:var(--ink)}'
+'.pd-sub{margin:0;font:600 .9375rem var(--font);text-align:center;color:var(--ink)}'
+'.pd-svg{display:block;width:100%;max-width:340px;height:auto}'
+'.pd-svg text{font-family:var(--font);fill:var(--ink);font-size:11px}'
+'.pd-bar{width:100%;min-height:64px;border:2px solid var(--edge);border-radius:var(--r1)}'
+'.pd-opts{display:flex;flex-direction:column;gap:8px;width:100%}'
+'.pd-opts .pd-btn{width:100%;text-align:left;font-size:1.0625rem}'
+'.pd-in{width:100%;max-width:200px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1.25rem var(--font);text-align:center}'
+'.pd-board{position:relative;width:100%;max-width:340px;aspect-ratio:1/1}'
+'.pd-grid{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));grid-template-rows:repeat(10,minmax(0,1fr));gap:2px;width:100%;height:100%}'
+'.pd-cell{display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:4px;background:var(--surface);color:var(--ink);font:600 .6875rem var(--font);overflow:hidden}'
+'.pd-cell.pd-here{background:var(--tint);border:2px solid var(--ink);font-weight:800}'
+'.pd-over{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;color:var(--ink)}'
+'.pd-legend{margin:0;font-size:.8125rem;text-align:center;color:var(--muted)}'
+'.phone.rm .pd *,.phone.rm .pd *::before{transition:none!important;animation:none!important}'
+'@media (prefers-reduced-motion:reduce){.pd *{transition:none!important;animation:none!important}}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pzd2-css'))return;var s=document.createElement('style');s.id='pzd2-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function B(txt,fn,cls,at){at=at||{};at.class='pd-btn '+(cls||'');return pzBtn(txt,fn,at)}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'pd '+cls});root.appendChild(w);return w}
function plural(n,w){return n+' '+w+(n===1?'':'s')}
function tries(n){return n===1?'one try':n+' tries'}
function presses(n){return n===1?'one press':n+' presses'}
function svgEl(tag,at){var e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.keys(at).forEach(function(k){e.setAttribute(k,at[k])});return e}
function svgText(x,y,str,anchor){var t=svgEl('text',{x:x,y:y,'text-anchor':anchor||'middle'});t.textContent=str;return t}
function pzPerm(n,tag){var a=[];for(var i=0;i<n;i++)a.push(i);return pzShuffle(a,pzRng(tag))}
/* every mount is wrapped: done() fires 350 ms after the last move; an Undo / Hint / Restart row is drawn unless api.toolbar===false or inst.toolbar===false */
function wrapMount(m){return function(root,inst,api){var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'pd-row pd-bar'}),w=root.firstChild;
    bar.appendChild(B('Undo',function(){lv=0;c.undo()},'',{'aria-label':'Undo'}));
    bar.appendChild(B('Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)},'',{'aria-label':'Hint'}));
    bar.appendChild(B('Restart',function(){lv=0;c.restart()},'',{'aria-label':'Restart this level'}));
    if(w)w.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,destroy:function(){clearTimeout(tm);c.destroy()}}}}

/* ================= 1. Same Grey? (F1) ================= */
/* Two squares are printed the same grey. The left one sits on a light ground, the right one on a dark ground.
   The bar moves in steps of 1 or 10. par = fewest presses to any grey inside the tolerance (found by trying every target). */
/* fewest presses (steps of 1 or 10, staying within 0..255) from start to any grey in the window: breadth-first search */
function sgPar(start,g,tol){var lo=Math.max(0,g-tol),hi=Math.min(255,g+tol),dist={},q=[start],i=0;dist[start]=0;
  while(i<q.length){var x=q[i++];if(x>=lo&&x<=hi)return dist[x];
    [1,-1,10,-10].forEach(function(st){var y=x+st;if(y<0||y>255||dist[y]!==undefined)return;dist[y]=dist[x]+1;q.push(y)})}return-1}
function sgMake(level,rng){
  var g=40+pzInt(rng,176),start,tol=level<=10?6:level<=20?3:level<=25?1:0,bg=level<=10?110:level<=20?80:50;
  do{start=pzInt(rng,256)}while(Math.abs(start-g)<25);
  return{level:level,title:'Level '+level,grey:g,start:start,tol:tol,bg:bg,par:sgPar(start,g,tol)};
}
function sgScene(g,bg){var s=svgEl('svg',{viewBox:'0 0 320 150',class:'pd-svg',role:'img','aria-label':'Two squares printed the same grey. The left one sits on a light background and the right one on a dark background.'});
  s.appendChild(svgEl('rect',{x:0,y:0,width:160,height:150,fill:'rgb(238,234,226)'}));
  s.appendChild(svgEl('rect',{x:160,y:0,width:160,height:150,fill:'rgb('+bg+','+bg+','+bg+')'}));
  s.appendChild(svgEl('rect',{x:40,y:30,width:80,height:90,fill:'rgb('+g+','+g+','+g+')'}));
  s.appendChild(svgEl('rect',{x:200,y:30,width:80,height:90,fill:'rgb('+g+','+g+','+g+')'}));
  return s}
function mountSg(root,inst,api){
  var w=shell(root,'pd-sg'),v=inst.start,hist=[],moves=0,wrong=0,hints=0,undos=0,fin=false,
    info=pzEl('p',{class:'pd-info',text:'Both squares are printed the same grey. Set the grey bar until it matches them, then check. Arrow keys also work.'}),
    scene=sgScene(inst.grey,inst.bg),
    bar=pzEl('div',{class:'pd-bar',role:'img'}),
    val=pzEl('p',{class:'pd-sub'}),
    row1=pzEl('div',{class:'pd-row',role:'group','aria-label':'Adjust the grey bar'}),
    row2=pzEl('div',{class:'pd-row'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'}),
    bD10=B('Darker by 10',function(){nudge(-10)},'',{'aria-label':'Darker by 10'}),
    bD1=B('Darker by 1',function(){nudge(-1)},'',{'aria-label':'Darker by 1'}),
    bL1=B('Lighter by 1',function(){nudge(1)},'',{'aria-label':'Lighter by 1'}),
    bL10=B('Lighter by 10',function(){nudge(10)},'',{'aria-label':'Lighter by 10'}),
    check=B('Check my grey',function(){doCheck()},'pd-main',{'aria-label':'Check my grey'});
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function paint(){bar.style.background='rgb('+v+','+v+','+v+')';bar.setAttribute('aria-label','Grey bar at '+v+' of 255');val.textContent='Grey '+v+' of 255';
    bD10.disabled=bD1.disabled=bL1.disabled=bL10.disabled=check.disabled=fin}
  function nudge(d){if(fin)return;var nv=Math.max(0,Math.min(255,v+d));if(nv===v){say('The bar is at its '+(d<0?'darkest':'lightest')+' setting.');return}
    hist.push(v);v=nv;moves++;api.moved();msg.textContent='';paint()}
  function doCheck(){if(fin)return;
    if(Math.abs(v-inst.grey)<=inst.tol){fin=true;paint();say('Matched. Both squares are the same grey, '+inst.grey+' of 255.');
      api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par,wrong:wrong,grey:inst.grey,set:v}});return}
    wrong++;say('Not quite. Adjust the bar and check again.')}
  function onkey(ev){if(fin||ev.ctrlKey||ev.metaKey||ev.altKey)return;var k=ev.key;
    if(k==='ArrowUp'||k==='ArrowRight'){ev.preventDefault();nudge(1)}
    else if(k==='ArrowDown'||k==='ArrowLeft'){ev.preventDefault();nudge(-1)}
    else if(k==='PageUp'){ev.preventDefault();nudge(10)}
    else if(k==='PageDown'){ev.preventDefault();nudge(-10)}
    else if(k==='Enter'&&ev.target.tagName!=='BUTTON')doCheck()}
  w.addEventListener('keydown',onkey);
  row1.appendChild(bD10);row1.appendChild(bD1);row1.appendChild(bL1);row1.appendChild(bL10);row2.appendChild(check);
  w.appendChild(info);w.appendChild(scene);w.appendChild(bar);w.appendChild(val);w.appendChild(row1);w.appendChild(row2);w.appendChild(msg);
  paint();
  return{undo:function(){if(fin||!hist.length)return false;v=hist.pop();undos++;paint();say('Undone.');return true},
    restart:function(){v=inst.start;hist=[];moves=0;wrong=0;fin=false;paint();say('Restarted from the first setting.')},
    hint:function(lv){if(fin)return null;hints++;var s;
      if(lv<=1){s='Ignore the shadow. Compare the two squares by their own grey, not by the ground they sit on.';say(s);return s}
      if(lv===2){var lo=Math.floor(inst.grey/20)*20;s='The grey is between '+lo+' and '+(lo+20)+'.';say(s);return s}
      hist.push(v);v=inst.grey;paint();s='The bar is set to '+v+', the grey both squares share. Check it.';doCheck();return s},
    destroy:function(){w.removeEventListener('keydown',onkey);root.textContent=''}}}
registerPuzzle({id:'same-grey',name:'Same Grey?',family:'number',theme:'F1',blurb:'Two squares, one grey. Match the bar to what they really are.',
  how:'Two squares are printed the same grey. Set the grey bar with the buttons or the arrow keys until it matches them, then check. Later levels allow less error.',
  areas:['attention','control'],levels:30,secs:60,make:sgMake,mount:wrapMount(mountSg),
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||m,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You matched the grey in '+presses(m)+'. The shortest route is '+presses(p)+'.'}}});
PZD2.sg={make:sgMake,par:sgPar};

/* ================= 2. Swap Starts (F3) ================= */
/* Each pair is two words whose onsets are single consonants, so the swap is exact in writing: onset = letters before the first vowel. */
var SS_PAIRS=[['hot','dog'],['bad','luck'],['rat','cap'],['mad','hat'],['pack','rat'],['fat','cake'],['sit','back'],['bed','tent'],['tin','pot'],['hard','water'],['dog','bone'],['pot','hole'],['cat','nap'],['map','rod'],['ride','home'],['rough','cut'],['bell','tower'],['fine','pig'],['ten','pins'],['mad','cat'],['pan','rug'],['sad','moon'],['mail','boat']];
function ssOnset(w){var i=0;while(i<w.length&&'aeiou'.indexOf(w.charAt(i))<0)i++;return[w.slice(0,i),w.slice(i)]}
function ssSwap(a,b){var A=ssOnset(a),C=ssOnset(b);return C[0]+A[1]+' '+A[0]+C[1]}
var SS_ORDER=pzPerm(SS_PAIRS.length,'swap-starts|order');
function ssMake(level,rng){
  var idx=SS_ORDER[(level-1)%SS_PAIRS.length],a=SS_PAIRS[idx][0],b=SS_PAIRS[idx][1],c=ssSwap(a,b),A=ssOnset(a),C=ssOnset(b),
    half1=C[0]+A[1]+' '+b,half2=a+' '+A[0]+C[1],orig=a+' '+b;
  var others=pzShuffle(SS_PAIRS.map(function(p){return ssSwap(p[0],p[1])}).filter(function(s){return s!==c}),rng);
  var order=level<=10?[others[0],orig,others[1]]:level<=20?[half1,half2,others[0]]:[half1,half2,orig];
  var decoys=[];order.concat([half1,half2,orig],others).forEach(function(s){if(s!==c&&decoys.indexOf(s)<0&&decoys.length<3)decoys.push(s)});
  return{level:level,title:'Level '+level,a:a,b:b,prompt:a+'  '+b,answer:c,options:pzShuffle([c].concat(decoys),rng),par:1};
}
function mountSs(root,inst,api){
  var w=shell(root,'pd-ss'),fin=false,hints=0,undos=0,picks=0,wrongs=[],
    info=pzEl('p',{class:'pd-info',text:'Swap the first sound of the two words, then pick the phrase you made. Keys 1 to 4 also work.'}),
    big=pzEl('p',{class:'pd-big',text:inst.prompt}),
    opts=pzEl('div',{class:'pd-opts',role:'group','aria-label':'Possible swapped phrases'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'}),btns=[];
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function paintWrong(){btns.forEach(function(b,i){b.classList.toggle('pd-wrong',wrongs.indexOf(inst.options[i])>=0);b.disabled=fin})}
  function pick(i){if(fin)return;var o=inst.options[i];picks++;api.moved();
    if(o===inst.answer){fin=true;paintWrong();say('Yes: '+inst.answer+'.');
      api.done({solved:true,moves:picks,hints:hints,undos:undos,extra:{par:1,wrong:wrongs.length}});return}
    if(wrongs.indexOf(o)<0)wrongs.push(o);paintWrong();say('Not quite. Try another phrase.')}
  function onkey(ev){if(fin||ev.ctrlKey||ev.metaKey||ev.altKey)return;if(/^[1-4]$/.test(ev.key)&&inst.options[+ev.key-1]!==undefined)pick(+ev.key-1)}
  inst.options.forEach(function(o,i){var b=B(o,function(){pick(i)},'',{'aria-label':'Phrase '+(i+1)+': '+o});btns.push(b);opts.appendChild(b)});
  w.addEventListener('keydown',onkey);
  w.appendChild(info);w.appendChild(big);w.appendChild(opts);w.appendChild(msg);
  return{undo:function(){if(fin||!wrongs.length)return false;wrongs.pop();undos++;paintWrong();say('Undone. You can pick again.');return true},
    restart:function(){wrongs=[];picks=0;fin=false;paintWrong();say('Restarted.')},
    hint:function(lv){if(fin)return null;hints++;var s;
      if(lv<=1){s='Only the starting sounds move. The rest of each word stays where it is.';say(s);return s}
      if(lv===2){s='The answer starts with the letter '+inst.answer.charAt(0)+'.';say(s);return s}
      s='Here it is: '+inst.answer+'.';pick(inst.options.indexOf(inst.answer));return s},
    destroy:function(){w.removeEventListener('keydown',onkey);root.textContent=''}}}
registerPuzzle({id:'swap-starts',name:'Swap Starts',family:'word',theme:'F3',blurb:'Swap the first sounds of two words and find the phrase you made.',
  how:'Two words are shown. Swap their starting sounds, then tap the phrase you made. Later levels offer closer lookalikes.',
  areas:['attention','flex'],levels:30,secs:60,make:ssMake,mount:wrapMount(mountSs),
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||1,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You found the phrase in '+tries(m)+'. '+(m<=1?'First time.':'Keep going next time.')}}});
PZD2.ss={make:ssMake,swap:ssSwap,onset:ssOnset,pairs:SS_PAIRS};

/* ================= 3. Shift Three (F3) ================= */
var ST_MSGS=['MEET AT THE GATE','CAT ON A MAT','TEA IS READY','BRING THE MAP','THE BELL RANG','SEND HELP BY NOON','WATCH THE RIVER','LET US SING','KEEP THE LAMP LIT','OPEN THE DOOR','BREAD AND HONEY','THE KING RODE OUT','SIGN THE LETTER','THE SHIP IS LATE','A GOOD DAY TO WALK','NO MORE RAIN','RIDE TO THE HILL','FRIENDS MEET AT DUSK','PLANT THE SEEDS','BAKE A SMALL CAKE','WRITE A LONG NOTE','HELLO FROM THE FARM','LOOK BEHIND YOU','SAIL AT FIRST LIGHT','FEED THE HENS AT SIX','THE FIRE IS WARM'];
var ST_ORDER=pzPerm(ST_MSGS.length,'shift-three|order');
function stEnc(s,k){return s.replace(/[A-Z]/g,function(c){return String.fromCharCode((c.charCodeAt(0)-65+k)%26+65)})}
function stDec(s,d){return stEnc(s,(26-d)%26)}
/* fewest dial moves from setting s to setting k; dial steps +1, -1, +5, -5 on the 26-letter ring (breadth-first) */
function stPar(s,k){var dist={},q=[s],i=0;dist[s]=0;while(i<q.length){var x=q[i++];if(x===k)return dist[x];
  [1,25,5,21].forEach(function(st){var y=(x+st)%26;if(dist[y]===undefined){dist[y]=dist[x]+1;q.push(y)}})}return-1}
function stMake(level,rng){
  var plain=ST_MSGS[ST_ORDER[(level-1)%ST_MSGS.length]],k=level<=5?3:level<=10?1+pzInt(rng,6):1+pzInt(rng,25),s;
  do{s=pzInt(rng,26)}while(s===k);
  return{level:level,title:'Level '+level,plain:plain,cipher:stEnc(plain,k),shift:k,start:s,par:stPar(s,k)};
}
function mountSt(root,inst,api){
  var w=shell(root,'pd-st'),d=inst.start,hist=[],moves=0,hints=0,undos=0,wrong=0,fin=false,
    info=pzEl('p',{class:'pd-info',text:'This message was moved along the alphabet. Turn the dial until the reading line shows the message as words, then read it.'}),
    secret=pzEl('p',{class:'pd-big',text:inst.cipher,'aria-label':'Coded message: '+inst.cipher}),
    setting=pzEl('p',{class:'pd-sub'}),
    read=pzEl('p',{class:'pd-sub'}),
    row1=pzEl('div',{class:'pd-row',role:'group','aria-label':'Shift dial'}),
    row2=pzEl('div',{class:'pd-row'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'}),
    bU1=B('Dial up by 1',function(){turn(1)},'',{'aria-label':'Dial up by 1'}),
    bD1=B('Dial down by 1',function(){turn(-1)},'',{'aria-label':'Dial down by 1'}),
    bU5=B('Dial up by 5',function(){turn(5)},'',{'aria-label':'Dial up by 5'}),
    bD5=B('Dial down by 5',function(){turn(-5)},'',{'aria-label':'Dial down by 5'}),
    lock=B('Read it',function(){lockIn()},'pd-main',{'aria-label':'Lock in this reading'});
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function paint(){setting.textContent='Dial setting '+d+' of 25';read.textContent='Reading: '+stDec(inst.cipher,d);
    bU1.disabled=bD1.disabled=bU5.disabled=bD5.disabled=lock.disabled=fin}
  function turn(st){if(fin)return;hist.push(d);d=(d+st+26)%26;moves++;api.moved();msg.textContent='';paint()}
  function lockIn(){if(fin)return;
    if(stDec(inst.cipher,d)===inst.plain){fin=true;paint();say('That reads: '+inst.plain+'.');
      api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par,wrong:wrong,shift:inst.shift}});return}
    wrong++;say('Not quite. That is not the message yet. Turn the dial and try again.')}
  function onkey(ev){if(fin||ev.ctrlKey||ev.metaKey||ev.altKey)return;var k=ev.key;
    if(k==='ArrowUp'||k==='ArrowRight'){ev.preventDefault();turn(1)}
    else if(k==='ArrowDown'||k==='ArrowLeft'){ev.preventDefault();turn(-1)}
    else if(k==='PageUp'){ev.preventDefault();turn(5)}
    else if(k==='PageDown'){ev.preventDefault();turn(-5)}
    else if(k==='Enter'&&ev.target.tagName!=='BUTTON')lockIn()}
  w.addEventListener('keydown',onkey);
  row1.appendChild(bU1);row1.appendChild(bD1);row1.appendChild(bU5);row1.appendChild(bD5);row2.appendChild(lock);
  w.appendChild(info);w.appendChild(secret);w.appendChild(setting);w.appendChild(read);w.appendChild(row1);w.appendChild(row2);w.appendChild(msg);
  paint();
  return{undo:function(){if(fin||!hist.length)return false;d=hist.pop();undos++;paint();say('Undone.');return true},
    restart:function(){d=inst.start;hist=[];moves=0;wrong=0;fin=false;paint();say('Restarted from the first setting.')},
    hint:function(lv){if(fin)return null;hints++;var s;
      if(lv<=1){s='Turn the dial one step at a time and watch the reading line.';say(s);return s}
      if(lv===2){s='The first letter of the message is '+inst.plain.charAt(0)+'. Find the setting that turns '+inst.cipher.charAt(0)+' into '+inst.plain.charAt(0)+'.';say(s);return s}
      hist.push(d);d=inst.shift;paint();s='The dial is set to '+d+'. Reading it.';lockIn();return s},
    destroy:function(){w.removeEventListener('keydown',onkey);root.textContent=''}}}
registerPuzzle({id:'shift-three',name:'Shift Three',family:'word',theme:'F3',blurb:'Every letter moved along the alphabet. Turn the dial until the message reads.',
  how:'A short coded message has been shifted along the alphabet. Turn the dial until the reading line shows the message as words, then read it. Fewer dial turns scores more stars.',
  areas:['attention','control'],levels:30,secs:90,make:stMake,mount:wrapMount(mountSt),
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||m,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You read the message after '+plural(m,'dial turn')+'. The shortest is '+plural(p,'dial turn')+'.'}}});
PZD2.st={make:stMake,par:stPar,enc:stEnc,dec:stDec};

/* ================= 4. Lotus in the Lake (F6) ================= */
/* Stalk above the water is h units; the tip is pushed sideways s units until it touches the water; the lake is d units deep.
   Right triangle: legs s and d, hypotenuse d + h, so d = (s*s - h*h) / (2h). Only whole-number depths of 1 to 80 are kept. */
function lkList(){var out=[];for(var s=2;s<=25;s++)for(var h=1;h<=6;h++){if(s<=h)continue;var n=s*s-h*h;if(n%(2*h))continue;var d=n/(2*h);if(d<1||d>80)continue;out.push({s:s,h:h,d:d})}
  out.sort(function(a,b){return a.d-b.d||a.s-b.s});return out}
var LK=lkList();
function lkMake(level){var e=LK[Math.round((level-1)*(LK.length-1)/29)];
  return{level:level,title:'Level '+level,side:e.s,above:e.h,answer:e.d,par:1};
}
function lkDraw(inst){var sc=Math.min(200/inst.side,110/inst.answer),wy=50,x0=40,d=inst.answer,
  P=[x0,wy+d*sc],Q=[x0+inst.side*sc,wy+d*sc],T=[x0+inst.side*sc,wy],top=[x0,wy-inst.above*sc];
  var s=svgEl('svg',{viewBox:'0 0 320 210',class:'pd-svg',role:'img','aria-label':'A lotus stalk. Its tip was pushed sideways '+inst.side+' units until it touched the water. The depth of the lake is not shown.'});
  s.appendChild(svgEl('rect',{x:0,y:wy,width:320,height:160,fill:'rgba(70,130,170,0.22)'}));
  s.appendChild(svgEl('line',{x1:0,y1:wy,x2:320,y2:wy,stroke:'currentColor','stroke-width':'1.5'}));
  s.appendChild(svgEl('line',{x1:P[0],y1:P[1],x2:top[0],y2:top[1],stroke:'currentColor','stroke-width':'1.5','stroke-dasharray':'4 4',opacity:'0.55'}));
  s.appendChild(svgEl('polygon',{points:P.join(',')+' '+Q.join(',')+' '+T.join(','),fill:'none',stroke:'currentColor','stroke-width':'2.5'}));
  s.appendChild(svgEl('circle',{cx:T[0],cy:T[1],r:'6',fill:'currentColor'}));
  s.appendChild(svgText((P[0]+Q[0])/2,Q[1]+16,'sideways: '+inst.side+' units'));
  s.appendChild(svgText(Q[0]+8,(Q[1]+T[1])/2+4,'depth: ?','start'));
  s.appendChild(svgText((P[0]+T[0])/2-22,(P[1]+T[1])/2-6,'stalk','end'));
  return s}
function mountLk(root,inst,api){
  var w=shell(root,'pd-lk'),fin=false,attempts=0,hints=0,
    info=pzEl('p',{class:'pd-info',text:'The stalk, the sideways distance and the depth form a right triangle. Type the depth of the lake in units.'}),
    inp=pzEl('input',{class:'pd-in',type:'text',inputmode:'numeric','aria-label':'Depth of the lake in units',autocomplete:'off'}),
    row=pzEl('div',{class:'pd-row'}),
    check=B('Check depth',function(){doCheck()},'pd-main',{'aria-label':'Check depth'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'});
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function doCheck(){if(fin)return;var raw=String(inp.value).trim();
    if(!/^\d+$/.test(raw)){say('Type a whole number of units.');return}
    attempts++;api.moved();
    if(+raw===inst.answer){fin=true;inp.disabled=true;check.disabled=true;say('Yes. The lake is '+inst.answer+' units deep.');
      api.done({solved:true,moves:attempts,hints:hints,undos:0,extra:{par:1,side:inst.side,above:inst.above,answer:inst.answer}});return}
    say('Not quite. The stalk is the longest side, and its length is the depth plus '+inst.above+'.')}
  inp.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();doCheck()}});
  row.appendChild(check);
  w.appendChild(info);w.appendChild(lkDraw(inst));w.appendChild(inp);w.appendChild(row);w.appendChild(msg);
  return{undo:function(){say('Nothing to undo. Try again: type a new depth.');return false},
    restart:function(){inp.value='';inp.disabled=false;check.disabled=false;attempts=0;fin=false;say('Restarted.')},
    hint:function(lv){if(fin)return null;hints++;var s;
      if(lv<=1)s='The stalk is the longest side of the right triangle. Its length is the depth plus '+inst.above+'.';
      else if(lv===2)s='Write (depth + '+inst.above+') squared = depth squared + '+inst.side+' squared, then solve for the depth.';
      else{inp.value=String(inst.answer);s='The depth is '+inst.answer+'. Checking it.';say(s);doCheck();return s}
      say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'lotus-in-the-lake',name:'Lotus in the Lake',family:'number',theme:'F6',blurb:'A lotus tip pushed sideways touches the water. How deep is the lake?',
  how:'A lotus stalk stands above the water, and its tip is pushed sideways until it touches the water. The stalk is the longest side of a right triangle, so you can work out the depth. Type the depth and check it.',
  areas:['flex','space'],levels:30,secs:90,make:lkMake,mount:wrapMount(mountLk),
  stars:function(res,inst){var m=res.moves,p=1,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You found the depth in '+tries(m)+'. The lake is '+((inst&&inst.answer)||(res.extra&&res.extra.answer)||'?')+' units deep.'}}});
PZD2.lk={make:lkMake,list:LK};

/* ================= 5. Virtue Ladder (F7) ================= */
/* Each square offers three moves of 1 to 6. Land on a ladder bottom to climb to its top, or on a snake head to slide to its tail.
   Reach square 100 exactly: a move past 100 is not allowed. par = fewest turns from square 1 (solved over the offers by repeated relaxation). */
var VL_INF=1e9;
function vlBuild(rng,nL,nS){var used={1:1,100:1},ladders=[],snakes=[],g=0,b,t,h;
  while(ladders.length<nL&&g++<3000){b=2+pzInt(rng,70);t=b+8+pzInt(rng,25);if(t>99||used[b]||used[t])continue;used[b]=used[t]=1;ladders.push([b,t])}
  g=0;
  while(snakes.length<nS&&g++<3000){h=12+pzInt(rng,88);t=h-(8+pzInt(rng,30));if(h>99||t<2||used[h]||used[t])continue;used[h]=used[t]=1;snakes.push([h,t])}
  var jump={};ladders.concat(snakes).forEach(function(e){jump[e[0]]=e[1]});return{ladders:ladders,snakes:snakes,jump:jump}}
function vlDist(offers,jump){var dist=[],p,i,k,changed=true,rounds=0;for(i=0;i<=100;i++)dist[i]=VL_INF;dist[100]=0;
  while(changed&&rounds++<400){changed=false;
    for(p=99;p>=1;p--){var best=VL_INF;for(k=0;k<offers[p].length;k++){var q=p+offers[p][k];if(q>100)continue;var j=jump[q]!==undefined?jump[q]:q;if(dist[j]+1<best)best=dist[j]+1}
      if(best<dist[p]){dist[p]=best;changed=true}}}
  return dist}
function vlMake(level,rng){var nL=level<=10?4:level<=20?5:6,nS=level<=10?4:level<=20?5:6,board,offers,dist,tries_=0;
  do{offers=[null];for(var p=1;p<=100;p++)offers.push(pzShuffle([1,2,3,4,5,6],rng).slice(0,3).sort(function(a,b){return a-b}));
    board=vlBuild(rng,nL,nS);dist=vlDist(offers,board.jump)}while(dist[1]>=VL_INF&&++tries_<40);
  return{level:level,title:'Level '+level,offers:offers,ladders:board.ladders,snakes:board.snakes,jump:board.jump,dist:dist,par:dist[1]};
}
function vlCenter(n){var r=Math.floor((n-1)/10),c=r%2===0?(n-1)%10:9-(n-1)%10;return[c*10+5,(9-r)*10+5]}
function mountVl(root,inst,api){
  var w=shell(root,'pd-vl'),pos=1,hist=[],hints=0,undos=0,fin=false,cells=[],
    info=pzEl('p',{class:'pd-info',text:'Each square offers three moves. Pick one. Reach square 100 exactly: a move past 100 is not allowed.'}),
    legend=pzEl('p',{class:'pd-legend',text:'Solid lines are ladders (they climb). Dashed lines are snakes (they slide down).'}),
    where=pzEl('p',{class:'pd-sub'}),
    board=pzEl('div',{class:'pd-board'}),grid=pzEl('div',{class:'pd-grid'}),
    ov=svgEl('svg',{viewBox:'0 0 100 100',class:'pd-over',preserveAspectRatio:'none','aria-hidden':'true',focusable:'false'}),
    offersBox=pzEl('div',{class:'pd-opts',role:'group','aria-label':'Moves from this square'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'});
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  for(var r=9;r>=0;r--)for(var c=0;c<10;c++){var n=r*10+(r%2===0?c+1:10-c),cell=pzEl('div',{class:'pd-cell',text:String(n)});cells[n]=cell;grid.appendChild(cell)}
  inst.ladders.forEach(function(e){var a=vlCenter(e[0]),b=vlCenter(e[1]);ov.appendChild(svgEl('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'currentColor','stroke-width':'1.4'}))});
  inst.snakes.forEach(function(e){var a=vlCenter(e[0]),b=vlCenter(e[1]);ov.appendChild(svgEl('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],'stroke-width':'2','stroke-dasharray':'3 2',style:'stroke:var(--accent)'}))});
  board.appendChild(grid);board.appendChild(ov);
  function paint(){for(var n2=1;n2<=100;n2++)cells[n2].classList.toggle('pd-here',n2===pos);
    where.textContent='On square '+pos+'. Turns so far: '+hist.length+'.';
    offersBox.textContent='';var list=inst.offers[pos]||[];
    list.forEach(function(d){var q=pos+d,label,j=inst.jump[q];
      if(q>100){label='Move '+d+': too far, past 100';offersBox.appendChild(B(label,null,'',{'aria-label':label,disabled:true}));return}
      label='Move '+d+' to square '+q+(j===undefined?'':(j>q?', then climb the ladder to '+j:', then slide down the snake to '+j));
      var bb=B(label,function(){move(d)},'',{'aria-label':label});bb.disabled=fin;offersBox.appendChild(bb)})}
  function move(d){if(fin)return;var q=pos+d;if(q>100)return;var j=inst.jump[q],land=j===undefined?q:j;
    hist.push(pos);pos=land;api.moved();paint();
    if(pos===100){fin=true;paint();say('You reached square 100 in '+tries(hist.length).replace('one try','one turn').replace('tries','turns')+'.');
      api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par,turns:hist.length}});return}
    var t=j===undefined?'Square '+q+'.':(j>q?'Square '+q+', then up the ladder to '+j+'.':'Square '+q+', then down the snake to '+j+'.');
    say(t+(inst.dist[pos]>=VL_INF?' No offered move from here can reach 100. Undo to go back.':''))}
  function best(){var list=inst.offers[pos]||[],bd=null,bl=null,bv=VL_INF;
    list.forEach(function(d){var q=pos+d;if(q>100)return;var j=inst.jump[q],land=j===undefined?q:j;if(inst.dist[land]<bv){bv=inst.dist[land];bd=d;bl=land}});
    return bd===null?null:{d:bd,land:bl,left:bv}}
  w.addEventListener('keydown',function(ev){if(fin||ev.ctrlKey||ev.metaKey||ev.altKey)return;var k=+ev.key;if(k>=1&&k<=3){var list=inst.offers[pos]||[],d=list[k-1];if(d!==undefined&&pos+d<=100)move(d)}});
  w.appendChild(info);w.appendChild(legend);w.appendChild(where);w.appendChild(board);w.appendChild(offersBox);w.appendChild(msg);
  paint();
  return{undo:function(){if(fin||!hist.length)return false;pos=hist.pop();undos++;paint();say('Undone. You are on square '+pos+'.');return true},
    restart:function(){pos=1;hist=[];fin=false;paint();say('Restarted from square 1.')},
    hint:function(lv){if(fin)return null;hints++;var s,b=best();
      if(lv<=1){s='Count the squares left to 100, and pick a move that does not go past it.';say(s);return s}
      if(!b){s='No offered move from here can reach 100. Undo to go back.';say(s);return s}
      if(lv===2){s='A good move from here is '+b.d+'. It lands on square '+b.land+'.';say(s);return s}
      s='Move '+b.d+' is the best from here. Taking it.';move(b.d);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'virtue-ladder',name:'Virtue Ladder',family:'move',theme:'F7',blurb:'Race to square 100 with three moves on offer each turn. Ladders climb, snakes slide.',
  how:'Each square offers three moves. Tap one to move. Ladders lift you to their top, snakes drop you to their tail. Reach square 100 exactly, in as few turns as you can.',
  areas:['flex','space'],levels:30,secs:120,make:vlMake,mount:wrapMount(mountVl),
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||m,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You reached square 100 in '+plural(m,'turn')+'. The shortest route is '+plural(p,'turn')+'.'}}});
PZD2.vl={make:vlMake,dist:vlDist,build:vlBuild,center:vlCenter};
})();
