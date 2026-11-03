/* Zest puzzles, wave 2 file 6: Dot Dash Decoder (F2 Sound and Time), Two Ways to Cube (F6 Number Lore).
   Loaded after puzzles_kit.js. Every make(level,rng) is pure (no Math.random, no DOM): the same seed gives the same puzzle on every device.
   Generators and solvers are exposed on PZD6 for tests/pzd6_logic.js. mount() returns {undo,hint,restart,destroy}; done() fires about 350 ms after the last move.
   Wording is about the puzzle only: no claims about the brain or health. No luck anywhere. Sound is optional, off by default, never required.

   Dot Dash Decoder: a word is shown letter by letter. The player sends each letter in Morse code: a dot or a dash, from the Dot and Dash buttons,
     or from the Press key (a quick tap is a dot, a hold of 300 ms or more is a dash). par = the total number of symbols in the word.
     moves = presses (right and wrong). Each letter's code is always on the chart.
   Two Ways to Cube: the target is a number that is a sum of two positive cubes in two different ways (1729 = 1 cubed + 12 cubed = 9 cubed + 10 cubed).
     The player finds two different pairs. par = 2 checks. Levels rise through the taxicab-style numbers in increasing order. */
var PZD6={};
(function(){
var DASH_MS=300;
var CSS='.pd{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.pd *{box-sizing:border-box}'
+'.pd [hidden]{display:none!important}'
+'.pd-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.pd-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.pd-sub{margin:0;text-align:center;font:600 .9375rem var(--font);color:var(--ink)}'
+'.pd-big{margin:0;font-weight:800;font-size:min(2.5rem,11vw);line-height:1.2;text-align:center;letter-spacing:.04em;max-width:100%;overflow-wrap:anywhere}'
+'.pd-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;width:100%}'
+'.pd-key,.pd-btn{min-width:48px;min-height:48px;padding:6px 14px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer}'
+'.pd-main{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}'
+'.pd-press{width:100%;min-height:96px;font:800 1.25rem var(--font)}'
+'.pd-word{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.pd-l{min-width:52px;min-height:60px;padding:4px 6px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 1.25rem var(--font)}'
+'.pd-l small{font:600 .75rem var(--font);color:var(--muted)}'
+'.pd-l.pd-now{background:var(--tint);border-width:3px}'
+'.pd-l.pd-done{color:var(--muted)}'
+'.pd-slots{display:flex;gap:8px;justify-content:center;align-items:center;min-height:40px;width:100%}'
+'.pd-sym{display:inline-block;flex:0 0 auto;background:var(--ink)}'
+'.pd-dot{width:18px;height:18px;border-radius:50%}'
+'.pd-dash{width:48px;height:14px;border-radius:7px}'
+'.pd-empty{background:none;border:2px dashed var(--edge)}'
+'.pd-keys{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;width:100%}'
+'.pd-keys .pd-key{flex:1 1 90px}'
+'.pd-chart{width:100%;max-width:420px}'
+'.pd-chart summary{min-height:48px;display:flex;align-items:center;font:700 1rem var(--font);cursor:pointer}'
+'.pd-chart ul,.pd-cubes{list-style:none;margin:0;padding:0;columns:2;column-gap:16px}'
+'.pd-chart li,.pd-cubes li{break-inside:avoid;padding:4px 0;font:600 .9375rem var(--font)}'
+'.pd-list{list-style:none;margin:0;padding:0;width:100%;display:flex;flex-direction:column;gap:6px}'
+'.pd-list li{padding:8px 12px;border:1px solid var(--line);border-radius:var(--r1);background:var(--surface);font:700 1.0625rem var(--font);text-align:center}'
+'.pd-in{width:100%;max-width:150px;min-height:48px;padding:6px 10px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1.25rem var(--font);text-align:center}'
+'.phone.rm .pd *,.phone.rm .pd *::before{transition:none!important;animation:none!important}'
+'@media (prefers-reduced-motion:reduce){.pd *{transition:none!important;animation:none!important}}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pzd6-css'))return;var s=document.createElement('style');s.id='pzd6-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'pd '+cls});root.appendChild(w);return w}
function plural(n,w){return n+' '+w+(n===1?'':'s')}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
/* every mount is wrapped: done() fires 350 ms after the last move; an Undo / Hint / Restart row is drawn unless api.toolbar===false or inst.toolbar===false */
function wrapMount(m){return function(root,inst,api){var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'pd-row pd-bar'}),w=root.firstChild;
    bar.appendChild(pzBtn('Undo',function(){lv=0;c.undo()},{class:'pd-btn','aria-label':'Undo'}));
    bar.appendChild(pzBtn('Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)},{class:'pd-btn','aria-label':'Hint'}));
    bar.appendChild(pzBtn('Restart',function(){lv=0;c.restart()},{class:'pd-btn','aria-label':'Restart this level'}));
    if(w)w.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,destroy:function(){clearTimeout(tm);c.destroy()}}}}

/* ================= 1. Dot Dash Decoder ================= */
var DD_CODE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..'};
var DD_WORDS={2:['GO','NO','OK','HI','BE','TO','IT','ON','AM','SO','UP','WE','IF','ME','MY','DO'],
  3:['TEA','SUN','BOX','RED','MAP','CUP','FOX','ZOO','JAM','ICE','OWL','SKY','RUN','SEA','TEN'],
  4:['MOON','TREE','LAMP','FISH','GOLD','RAIN','BIRD','SAND','WIND','NEST','DOOR','FROG'],
  5:['APPLE','RIVER','CLOUD','HONEY','PIANO','STONE','WATER','BREAD','LIGHT','GREEN'],
  6:['GARDEN','ORANGE','PENCIL','SUNSET','BRIDGE','FOREST','COFFEE','BASKET','MEADOW'],
  7:['LANTERN','HARBOUR','JOURNEY','BLANKET','SPARROW']};
function ddClasses(level){return level<=5?[2]:level<=10?[2,3]:level<=15?[3]:level<=20?[4]:level<=25?[5]:[6,7]}
function ddMake(level,rng){var cls=ddClasses(level),len=cls[pzInt(rng,cls.length)],list=DD_WORDS[len],word=list[pzInt(rng,list.length)],par=0;
  var letters=word.split('').map(function(ch){par+=DD_CODE[ch].length;return{ch:ch,code:DD_CODE[ch]}});
  return{level:level,title:'Level '+level,word:word,letters:letters,par:par}}
PZD6.dd={make:ddMake,code:DD_CODE,words:DD_WORDS,classes:ddClasses};
function mountDd(root,inst,api){
  var w=shell(root,'pd-dd'),flat=[],starts=[],ends=[],i,j,p=0,subs=0,wrong=0,hints=0,undos=0,fin=false,soundOn=false,actx=null,down=null,L=inst.letters.length,
    info=pzEl('p',{class:'pd-info',text:'Send each letter of the word in code. Tap Dot for a dot and Dash for a dash, or use the Press key: a quick tap is a dot, and a hold is a dash. The chart lists every letter.'}),
    prompt=pzEl('p',{class:'pd-sub'}),
    word=pzEl('ol',{class:'pd-word','aria-label':'Letters of the word'}),cells=[],
    slots=pzEl('div',{class:'pd-slots',role:'group','aria-label':'Symbols for the current letter'}),slotEls=[],
    keys=pzEl('div',{class:'pd-keys',role:'group','aria-label':'Send a symbol'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'}),soundBtn,chart=pzEl('details',{class:'pd-chart'}),chartList=pzEl('ul',{'aria-label':'Morse code chart'});
  for(i=0;i<L;i++){starts.push(flat.length);for(j=0;j<inst.letters[i].code.length;j++)flat.push(inst.letters[i].code.charAt(j));ends.push(flat.length)}
  function say(t){msg.textContent=t;api.say(t)}
  function letterAt(pos){for(var k=0;k<L;k++)if(pos<ends[k])return k;return L-1}
  function symName(s){return s==='.'?'dot':'dash'}
  function paint(){var cur=fin?-1:letterAt(p),k;
    cells.forEach(function(c,n){var st=(fin||p>=ends[n])?'done':(n===cur?'now':'to come');
      c.className='pd-l'+(st==='done'?' pd-done':'')+(st==='now'?' pd-now':'');
      c.setAttribute('aria-label','Letter '+inst.letters[n].ch+', '+st);c.lastChild.textContent=st});
    if(fin){prompt.textContent='Sent '+inst.word+'.';slots.hidden=true;return}
    slots.hidden=false;var ch=inst.letters[cur],entered=p-starts[cur];
    prompt.textContent='Now send the letter '+ch.ch+'. It has '+plural(ch.code.length,'symbol')+'. Sent '+p+' of '+flat.length+' so far.';
    slotEls.forEach(function(e){if(e.parentNode)e.parentNode.removeChild(e)});slotEls=[];
    for(k=0;k<ch.code.length;k++){var sym=ch.code.charAt(k),filled=k<entered,sh=sym==='.'?'pd-dot':'pd-dash',
      e=pzEl('span',{class:'pd-sym '+sh+(filled?'':' pd-empty'),'aria-label':'Symbol '+(k+1)+' of '+ch.code.length+': '+(filled?symName(flat[starts[cur]+k]):'not sent yet')});slotEls.push(e);slots.appendChild(e)}}
  function beep(sym){if(!soundOn)return;try{var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!actx)actx=new AC();
    var o=actx.createOscillator(),g=actx.createGain();o.frequency.value=660;g.gain.value=.12;o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+(sym==='-'?.3:.09))}catch(e){}}
  function press(sym){if(fin)return;subs++;api.moved();beep(sym);
    if(sym===flat[p]){var cur=letterAt(p),ch=inst.letters[cur].ch;p++;
      if(p===flat.length){fin=true;paint();say('You sent '+inst.word+' with '+(subs+(subs===1?' press':' presses'))+'. '+hintsLine(hints)+'.');
        api.done({solved:true,moves:subs,hints:hints,undos:undos,extra:{par:inst.par,wrong:wrong,word:inst.word}});return}
      if(p===ends[cur]){say('Letter '+ch+' sent. Next letter.')}else say('Right. '+symName(sym)+'.')}
    else{wrong++;say('Not that one. Check the code for '+inst.letters[letterAt(p)].ch+'.')}
    paint()}
  for(i=0;i<L;i++){var c=pzEl('li',{class:'pd-l',role:'listitem'});c.appendChild(pzEl('span',{text:inst.letters[i].ch}));c.appendChild(pzEl('small',{text:''}));cells.push(c);word.appendChild(c)}
  var keyBtn=pzBtn('Press',function(){var dur=down===null?0:Date.now()-down;down=null;press(dur>=DASH_MS?'-':'.')},{class:'pd-key pd-press','aria-label':'Press: tap for a dot, hold for a dash'});
  keyBtn.addEventListener('pointerdown',function(){down=Date.now()});
  keyBtn.addEventListener('keydown',function(ev){if(!ev.repeat&&(ev.key===' '||ev.key==='Enter'))down=Date.now()});
  keys.appendChild(keyBtn);
  keys.appendChild(pzBtn('Dot',function(){press('.')},{class:'pd-key','aria-label':'Dot'}));
  keys.appendChild(pzBtn('Dash',function(){press('-')},{class:'pd-key','aria-label':'Dash'}));
  soundBtn=pzBtn('Sound: off',function(){soundOn=!soundOn;soundBtn.textContent='Sound: '+(soundOn?'on':'off');soundBtn.setAttribute('aria-pressed',soundOn?'true':'false')},{class:'pd-btn','aria-pressed':'false','aria-label':'Sound, off by default'});
  keys.appendChild(soundBtn);
  chart.appendChild(pzEl('summary',{text:'Morse code chart'}));
  Object.keys(DD_CODE).forEach(function(ch){var named=DD_CODE[ch].split('').map(function(s){return symName(s)}).join(', ');
    chartList.appendChild(pzEl('li',{text:ch+'  '+DD_CODE[ch].split('').map(function(s){return s==='.'?'dot':'dash'}).join(' '),'aria-label':ch+': '+named}))});
  chart.appendChild(chartList);
  w.appendChild(info);w.appendChild(prompt);w.appendChild(word);w.appendChild(slots);w.appendChild(keys);w.appendChild(msg);w.appendChild(chart);paint();
  return{undo:function(){if(fin||p===0)return false;p--;undos++;paint();say('Undone.');return true},
    restart:function(){p=0;subs=0;wrong=0;fin=false;paint();say('Restarted. Same word, fresh start.')},
    hint:function(lv){if(fin)return null;var cur=letterAt(p),ch=inst.letters[cur].ch,nx=flat[p],s;hints++;
      if(lv<=1){s='Next, send the letter '+ch+'.'}
      else if(lv===2){s='The next symbol for '+ch+' is a '+symName(nx)+'.'}
      else{press(nx);s='Sent the next symbol for '+ch+': a '+symName(nx)+'.';if(!fin)say(s);return s}
      say(s);return s},
    destroy:function(){try{if(actx&&actx.close)actx.close()}catch(e){}root.textContent=''}}}
registerPuzzle({id:'dot-dash-decoder',name:'Dot Dash Decoder',family:'word',theme:'F2',blurb:'Send each letter of a word in dots and dashes.',
  how:'A word is shown letter by letter. Send each letter in code: a dot is a quick tap and a dash is a hold, or use the Dot and Dash buttons. The chart lists every letter. Sound is optional and off by default.',
  areas:['speed','control'],levels:30,secs:120,make:ddMake,mount:wrapMount(mountDd),
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||m,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You sent the word with '+(m+(m===1?' press':' presses'))+' and '+hintsLine(h)+'. The shortest is '+plural(p,'symbol')+'.'}}});

/* ================= 2. Two Ways to Cube ================= */
var twCache=null;
function twReps(n){var out=[],a,b,c=Math.floor(Math.cbrt(n))+1;for(a=1;a<=c;a++)for(b=a+1;b<=c;b++)if(a*a*a+b*b*b===n)out.push([a,b]);return out}
/* every target up to 2,000,000 with two or more pairs (a < b, both positive), in increasing order */
function twPool(){if(twCache)return twCache;var map={},a,b,s;
  for(a=1;a<=126;a++)for(b=a+1;b<=126;b++){s=a*a*a+b*b*b;if(s<=2000000){(map[s]=map[s]||[]).push([a,b])}}
  twCache=Object.keys(map).map(Number).filter(function(n){return map[n].length>=2}).sort(function(x,y){return x-y}).map(function(n){return{n:n,pairs:map[n]}});
  return twCache}
function cubeTop(n){var k=Math.floor(Math.cbrt(n));while((k+1)*(k+1)*(k+1)<=n)k++;while(k*k*k>n)k--;return k}
function twMake(level,rng){var pool=twPool(),L=pool.length,idx=Math.round((level-1)*(L-1)/29);
  if(level>1){idx=Math.max(1,Math.min(L-1,idx+pzInt(rng,3)-1))}
  var t=pool[idx].n;return{level:level,title:'Level '+level,target:t,par:2,need:2,cubeTop:cubeTop(t)}}
PZD6.tw={make:twMake,pool:twPool,reps:twReps,cubeTop:cubeTop};
function pzWhole(s){var t=String(s).trim();if(!/^\d{1,9}$/.test(t))return 0;var v=+t;return v>=1?v:0}
function mountTw(root,inst,api){
  var w=shell(root,'pd-tw'),N=inst.target,found=[],subs=0,wrong=0,hints=0,undos=0,fin=false,
    info=pzEl('p',{class:'pd-info',text:'Find two different pairs of whole-number cubes that add up to the target. Type a pair and tap Check pair. Each pair counts once, in either order.'}),
    big=pzEl('p',{class:'pd-big',text:String(N),'aria-label':'Target '+N}),
    count=pzEl('p',{class:'pd-sub'}),
    ina=pzEl('input',{class:'pd-in',type:'text',inputmode:'numeric',autocomplete:'off','aria-label':'First number'}),
    inb=pzEl('input',{class:'pd-in',type:'text',inputmode:'numeric',autocomplete:'off','aria-label':'Second number'}),
    list=pzEl('ol',{class:'pd-list','aria-label':'Pairs found'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'}),
    table=pzEl('details',{class:'pd-chart'}),cubes=pzEl('ol',{class:'pd-cubes','aria-label':'Cube table'});
  function say(t){msg.textContent=t;api.say(t)}
  function key(x,y){return x+','+y}
  function has(x,y){return found.some(function(q){return key(q[0],q[1])===key(x,y)})}
  function paint(){list.textContent='';found.forEach(function(q){list.appendChild(pzEl('li',{text:q[0]+'³ + '+q[1]+'³ = '+N}))});
    if(!found.length)list.appendChild(pzEl('li',{text:'No pairs yet.'}));
    count.textContent='Pairs found: '+found.length+' of '+inst.need}
  function submit(){if(fin)return;var a=pzWhole(ina.value),b=pzWhole(inb.value);
    if(!a||!b){say('Type two whole numbers, 1 or more, in both boxes.');return}
    if(a===b){say('Use two different numbers.');return}
    var x=Math.min(a,b),y=Math.max(a,b);
    if(has(x,y)){say('You already have that pair.');return}
    subs++;api.moved();
    if(y>inst.cubeTop){wrong++;say(y+'³ is more than '+N+', so that pair is too big.');return}
    var sum=x*x*x+y*y*y;
    if(sum!==N){wrong++;say(x+'³ + '+y+'³ is '+sum+', not '+N+'. Try another pair.');return}
    found.push([x,y]);ina.value='';inb.value='';paint();
    if(found.length>=inst.need){fin=true;paint();say('Both pairs found: '+found.map(function(q){return q[0]+' and '+q[1]}).join(', then ')+'.');
      api.done({solved:true,moves:subs,hints:hints,undos:undos,extra:{par:inst.par,wrong:wrong,pairs:found.length}});return}
    say('Yes. '+x+'³ + '+y+'³ = '+N+'. Find one more, different pair.')}
  function nextPair(){var all=twReps(N);for(var i=0;i<all.length;i++)if(!has(all[i][0],all[i][1]))return all[i];return null}
  for(var k=1;k<=inst.cubeTop;k++)cubes.appendChild(pzEl('li',{text:k+'³ = '+(k*k*k),'aria-label':k+' cubed is '+(k*k*k)}));
  table.appendChild(pzEl('summary',{text:'Cube table, up to '+inst.cubeTop}));table.appendChild(cubes);
  ina.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();submit()}});
  inb.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();submit()}});
  var pair=pzEl('div',{class:'pd-row',role:'group','aria-label':'Your pair'});pair.appendChild(ina);pair.appendChild(inb);
  var row=pzEl('div',{class:'pd-row'});row.appendChild(pzBtn('Check pair',submit,{class:'pd-btn pd-main'}));
  w.appendChild(info);w.appendChild(big);w.appendChild(count);w.appendChild(pair);w.appendChild(row);w.appendChild(msg);w.appendChild(list);w.appendChild(table);paint();
  return{undo:function(){if(fin)return false;if(ina.value||inb.value){ina.value='';inb.value='';undos++;say('Boxes cleared.');return true}
      if(found.length){found.pop();paint();undos++;say('Pair removed.');return true}return false},
    restart:function(){found=[];subs=0;wrong=0;fin=false;ina.value='';inb.value='';paint();say('Restarted. Same target, fresh start.')},
    hint:function(lv){if(fin)return null;var q=nextPair();if(!q)return null;hints++;var s;
      if(lv<=1){s='Each number in a pair is at most '+inst.cubeTop+', the cube root of '+N+' rounded down.'}
      else if(lv===2){s='One of the numbers in a pair you still need is '+q[0]+'. Find its partner.'}
      else{ina.value=String(q[0]);inb.value=String(q[1]);submit();s='Checked the pair '+q[0]+' and '+q[1]+'.';if(!fin)say(s);return s}
      say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'two-ways-to-cube',name:'Two Ways to Cube',family:'number',theme:'F6',blurb:'Find two different pairs of cubes that add up to one number.',
  how:'Each round gives a target number. Type two different whole numbers whose cubes add up to the target, then tap Check pair. Find a second pair that is different from the first. The cube table lists each cube.',
  areas:['control','flex'],levels:30,secs:150,make:twMake,mount:wrapMount(mountTw),
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||2,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You found both pairs with '+plural(m,'check')+' and '+hintsLine(h)+'. The shortest route is '+plural(p,'check')+'.'}}});
})();
