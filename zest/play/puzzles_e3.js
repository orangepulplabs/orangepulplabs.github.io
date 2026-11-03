/* Zest puzzles, wave 3 builder 3: Six-Dot Chord, Ghana Order, Retell Chain, Study Gap Planner.
   Loaded after puzzles_kit.js. make(level,rng) is pure; generators and solvers are exposed on PZE3 for tests/pze3_logic.js.
   Six-Dot Chord: copy or look up letters of the standard six-dot alphabet by tapping dots one at a time (a toggle per dot, never multi-touch). par = dots in all the letters; moves = dot taps.
   Ghana Order: a back-and-forth tapping pattern of our own, inspired by a recitation style (the real chant has more rules). Words 1..n, group i = (i i+1)(i+1 i)(i i+1 i+2)(i+2 i+1 i)(i i+1 i+2), then the next group starts one word on. par = taps in the pattern; moves = all taps.
   Retell Chain: an original invented tale (not a folk tale, no published text); find the retold line that drifted. par = 1; moves = line taps. Levels 21-30 chain two retellings: find the line that changed in the second one.
   Study Gap Planner: a planning puzzle on a stated model, not a test of anything. Retention halves every T days; each review sets it back to 100% and doubles T (later levels: adds T0 instead).
     Keep it at or above the shown threshold on every day 1..H with the fewest reviews. A review on day d is measured before it is applied. par = fewest reviews (latest-possible-day rule, checked by a DP in the test). */
var PZE3={};
(function(){
var CSS='.pe{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.pe *{box-sizing:border-box}.pe [hidden]{display:none!important}'
+'.pe-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.pe-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.pe-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.pe-btn{min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer}'
+'.pe-btn.pe-main{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}'
+'.pe-btn:disabled{background:var(--dis-bg);color:var(--dis-ink);border-color:var(--dis-bg);cursor:default}'
+'.pe-btn[aria-pressed=true]{background:var(--tint);outline:3px solid var(--ink);outline-offset:-3px}'
+'.pe-hl{outline:3px dashed var(--ink);outline-offset:2px}'
+'.pe-big{margin:0;font:800 2.5rem var(--font);letter-spacing:.1em;text-align:center}'
+'.pe-sub{margin:0;font:600 .9375rem var(--font);text-align:center;overflow-wrap:anywhere}'
+'.pe-cell{display:grid;grid-template-columns:repeat(2,72px);grid-template-rows:repeat(3,64px);grid-auto-flow:column;gap:8px}'
+'.pe-dot{width:72px;height:64px;min-width:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;line-height:1.1;padding:2px}'
+'.pe-dot b{font-size:1.5rem}.pe-dot span{font-size:.75rem;font-weight:600}'
+'.pe-key{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:4px;justify-content:center}'
+'.pe-key li{padding:2px 6px;border:1px solid var(--line);border-radius:6px;background:var(--surface);font:600 .8125rem var(--font)}'
+'.pe-pat{margin:0;padding:8px;width:100%;border:1px solid var(--line);border-radius:var(--r1);background:var(--ph);display:flex;flex-wrap:wrap;gap:4px 10px;justify-content:center;font:600 1rem var(--font)}'
+'.pe-blk{white-space:nowrap}.pe-blk.pe-done{color:var(--muted)}.pe-blk.pe-done::after{content:"\\2713"}.pe-blk.pe-cur{text-decoration:underline;font-weight:800}'
+'.pe-words{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:8px;width:100%}'
+'.pe-words .pe-btn{display:flex;flex-direction:column;align-items:center}.pe-words b{font-size:1.25rem}'
+'.pe-h{margin:0;width:100%;font:800 .9375rem var(--font)}'
+'.pe-ol{margin:0;padding:0 0 0 1.4em;width:100%;font-size:.9375rem;line-height:1.4}.pe-ol li{padding:2px 0}'
+'.pe-lines{list-style:none;margin:0;padding:0;width:100%;display:flex;flex-direction:column;gap:6px}'
+'.pe-lines .pe-btn{width:100%;text-align:left;font-weight:600;font-size:.9375rem}'
+'.pe-days{display:grid;grid-template-columns:repeat(auto-fill,minmax(48px,1fr));gap:4px;width:100%}'
+'.pe-day{display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1;padding:2px}.pe-day b{font-size:1rem}.pe-day span{font-size:.6875rem;font-weight:700}'
+'.pe-svg{width:100%;height:auto;max-height:140px;border:1px solid var(--line);border-radius:var(--r1);background:var(--surface)}'
+'.phone.rm .pe *{transition:none!important;animation:none!important}@media (prefers-reduced-motion:reduce){.pe *{transition:none!important;animation:none!important}}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pze3-css'))return;var s=document.createElement('style');s.id='pze3-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function B(txt,fn,cls,at){at=at||{};at.class='pe-btn '+(cls||'');return pzBtn(txt,fn,at)}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'pe '+cls});root.appendChild(w);return w}
function plural(n,w){return n+' '+w+(n===1?'':'s')}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
function starsOf(used,par,h){var s=used<=par?3:used<=Math.ceil(par*1.25)?2:1;if(h&&s===3)s=2;return s}
function wrapMount(m){return function(root,inst,api){var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'pe-row'}),w=root.firstChild;
    bar.appendChild(B('Undo',function(){lv=0;c.undo()},'',{'aria-label':'Undo'}));
    bar.appendChild(B('Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)},'',{'aria-label':'Hint'}));
    bar.appendChild(B('Restart',function(){lv=0;c.restart()},'',{'aria-label':'Restart this level'}));
    if(w)w.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,destroy:function(){clearTimeout(tm);c.destroy()}}}}
function mk(){return pzEl('p',{class:'pe-msg',role:'status'})}

/* ================= 1. Six-Dot Chord ================= */
/* standard alphabet, built from the decade rule: a-j use dots 1245 patterns, k-t add dot 3, u-z (no w) add dots 3 and 6, w is the odd one out */
var SDJ=['1','12','14','145','15','124','1245','125','24','245'];
var SD={};(function(){var i,c;for(i=0;i<10;i++){c=String.fromCharCode(97+i);SD[c]=SDJ[i];SD[String.fromCharCode(107+i)]=SDJ[i]+'3'}
  var m=['1','12','14','145','15'];SD.u='136';SD.v='1236';SD.w='2456';SD.x='1346';SD.y='13456';SD.z='1356';
  SD.k='13';SD.l='123';SD.m='134';SD.n='1345';SD.o='135';SD.p='1234';SD.q='12345';SD.r='1235';SD.s='234';SD.t='2345'})();
var SDW=['bad','cab','deaf','bead','gold','fish','kite','lamp','moon','nest','oak','pine','quiz','rope','sand','tide','vine','wolf','yarn','zinc','jazz','hawk','mist','plum','rain'];
function sdSpec(l){return{len:l<=10?3:l<=20?4:5,copy:l<=5,full:l>15}}
function sdMake(level,rng){var sp=sdSpec(level),pool=SDW.filter(function(w){return w.length>=Math.min(sp.len,4)}),word,letters=[],i;
  if(level<=10){var lt='abcdefghij'.split('');for(i=0;i<sp.len;i++)letters.push(lt[pzInt(rng,level<=5?5:10)])}
  else if(level<=20){word=SDW[pzInt(rng,SDW.length)];for(i=0;i<4;i++)letters.push(word[i%word.length])}
  else{for(i=0;i<5;i++)letters.push(String.fromCharCode(97+pzInt(rng,26)))}
  var par=0;letters.forEach(function(c){par+=SD[c].length});
  return{level:level,title:'Level '+level,letters:letters,copy:sp.copy,full:sp.full,par:par}}
PZE3.sd={make:sdMake,table:SD,spec:sdSpec};
function mountSd(root,inst,api){
  var w=shell(root,'pe-sd'),L=inst.letters,r,on,hist,moves,hints=0,undos=0,fin,hl=-1,btns=[],i,
    info=pzEl('p',{class:'pe-info',text:inst.copy?'Copy the dot pattern: tap a dot to raise it, tap again to lower it. Then press Check.':'Find the letter in the key, raise its dots one tap at a time, then press Check. Dots 1 to 3 are the left column, 4 to 6 the right.'}),
    big=pzEl('p',{class:'pe-big'}),sub=pzEl('p',{class:'pe-sub'}),cell=pzEl('div',{class:'pe-cell',role:'group','aria-label':'Six-dot cell'}),
    msg=mk(),key=pzEl('ul',{class:'pe-key','aria-label':'Key: letters and their dots'}),chk=B('Check',function(){check()},'pe-main');
  function say(t){msg.textContent=t;api.say(t)}
  function tgt(){return SD[L[r]]}
  function raised(){var o=[];for(var k=0;k<6;k++)if(on[k])o.push(k+1);return o}
  function reset(){r=0;on=[0,0,0,0,0,0];hist=[];moves=0;fin=false;hl=-1}reset();
  function paint(){var t=tgt(),word=L.join('').toUpperCase();
    big.textContent=inst.copy?'':L[r].toUpperCase();big.hidden=!!inst.copy;
    sub.textContent=(inst.copy?'Pattern to copy: dots '+t.split('').join(', ')+'. ':'')+'Letter '+(r+1)+' of '+L.length+(inst.copy?'.':' in '+word+'.');
    for(var k=0;k<6;k++){var b=btns[k];b.setAttribute('aria-pressed',on[k]?'true':'false');b.className='pe-btn pe-dot'+(hl===k?' pe-hl':'');b.disabled=fin;
      b.firstChild.textContent=on[k]?'●':'○';b.lastChild.textContent=on[k]?'raised':'down';
      b.setAttribute('aria-label','Dot '+(k+1)+', '+(on[k]?'raised':'down')+(inst.copy&&t.indexOf(String(k+1))>=0?', in the pattern':''))}
    if(inst.copy)cell.setAttribute('aria-label','Six-dot cell. Pattern dots '+t.split('').join(', '))}
  function toggle(k){if(fin)return;on[k]=on[k]?0:1;hist.push(k);moves++;hl=-1;api.moved();paint();say('Raised: '+(raised().join(', ')||'none')+'.')}
  function match(){return raised().join('')===tgt()}
  function check(){if(fin)return false;if(!match()){say('Not quite. Raised dots: '+(raised().join(', ')||'none')+'. Try again.');return false}
    if(r===L.length-1){fin=true;paint();say('All letters done in '+plural(moves,'tap')+'. The fewest possible is '+inst.par+'.');api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par}});return true}
    r++;on=[0,0,0,0,0,0];hist=[];hl=-1;paint();say('Correct. Next letter.');return true}
  for(i=0;i<6;i++)(function(k){var b=pzBtn('Dot '+(k+1),function(){toggle(k)},{class:'pe-btn pe-dot','aria-pressed':'false'});b.textContent='';b.appendChild(pzEl('b',{text:'○','aria-hidden':'true'}));b.appendChild(pzEl('span',{text:'Dot '+(k+1)}));b.appendChild(pzEl('span',{text:'down'}));
    b.firstChild.nextSibling.setAttribute('aria-hidden','true');b.lastChild.setAttribute('aria-hidden','true');btns.push(b);cell.appendChild(b)})(i);
  /* the visible label is 'Dot n' (second child); the state word is the last child */
  if(!inst.copy){var seen={},letters=inst.full?'abcdefghijklmnopqrstuvwxyz'.split(''):L.filter(function(c){if(seen[c])return false;seen[c]=1;return true}).sort();
    letters.forEach(function(c){key.appendChild(pzEl('li',{text:c.toUpperCase()+': '+SD[c].split('').join(' ')}))})}
  w.appendChild(info);w.appendChild(big);w.appendChild(sub);w.appendChild(cell);w.appendChild(chk);w.appendChild(msg);if(!inst.copy)w.appendChild(key);
  w.addEventListener('keydown',function(e){if(e.key>='1'&&e.key<='6')toggle(+e.key-1);else if(e.key==='Enter'&&e.target.tagName!=='BUTTON')check()});
  paint();
  function nextDot(){var t=tgt();for(var k=0;k<6;k++)if(!!on[k]!==(t.indexOf(String(k+1))>=0))return k;return -1}
  return{undo:function(){if(fin||!hist.length)return false;var k=hist.pop();on[k]=on[k]?0:1;undos++;hl=-1;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted.')},
    hint:function(lv){if(fin)return null;var k=nextDot(),s;hints++;
      if(k<0){if(lv>=3){check();return 'Checking the pattern.'}hl=-1;s='The dots match. Press Check.';say(s);return s}
      if(lv<=1){hl=k;s='Look at the dot with the dashed outline.'}
      else if(lv===2){hl=k;s='Dot '+(k+1)+' should be '+(on[k]?'down':'raised')+'.'}
      else{s=(on[k]?'Lowering':'Raising')+' dot '+(k+1)+'.';toggle(k);msg.textContent=s;api.say(s);return s}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'six-dot-chord',name:'Six-Dot Chord',family:'word',theme:'F3',blurb:'Raise the dots of a six-dot letter, one tap at a time.',
  how:'A cell has six dots in two columns. Tap a dot to raise it and tap again to lower it, so the cell shows the letter, then press Check. One finger is enough. The key lists the dots for each letter.',
  areas:['control','space'],levels:30,secs:90,make:sdMake,mount:wrapMount(mountSd),
  stars:function(res,inst){var p=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,h=res.hints||0;
    return{stars:starsOf(res.moves,p,h),line:'You made every letter in '+plural(res.moves,'tap')+' and '+hintsLine(h)+'. The fewest possible is '+p+'.'}}});

/* ================= 2. Ghana Order ================= */
var GOW=['dawn','reed','bell','stone','lamp','river','cloud','thread','seed','drum','moss','amber','wheel','feather'];
function goSeq(n,blocks){var out=[],g,i,b=[];
  for(i=1;i<=n-2;i++){b.push([i,i+1],[i+1,i],[i,i+1,i+2],[i+2,i+1,i],[i,i+1,i+2])}
  b=b.slice(0,blocks);return b}
function goSpec(l){var n=3+Math.floor((l-1)/8);return{n:n,blocks:Math.min(5*(n-2),3+Math.floor((l-1)/2)),show:l<=10?'all':l<=20?'first':'rule'}}
function goMake(level,rng){var sp=goSpec(level),words=pzShuffle(GOW,rng).slice(0,sp.n),order=pzShuffle(words.map(function(_,i){return i+1}),rng);
  var blocks=goSeq(sp.n,sp.blocks),seq=[];blocks.forEach(function(b){b.forEach(function(x){seq.push(x)})});
  return{level:level,title:'Level '+level,words:words,order:order,blocks:blocks,seq:seq,show:sp.show,par:seq.length}}
PZE3.go={make:goMake,seq:goSeq,spec:goSpec};
function mountGo(root,inst,api){
  var w=shell(root,'pe-go'),idx,hist,taps,hints=0,undos=0,fin,hl=-1,wb={},
    info=pzEl('p',{class:'pe-info',text:'Tap the words in the order of the pattern. The number on each word is its place. This is a back-and-forth pattern of our own, inspired by a recitation style.'}),
    rule=pzEl('p',{class:'pe-info',text:'Pattern for words a, b, c: a b, then b a, then a b c, then c b a, then a b c. Then slide one word on (b, c, d) and repeat.'}),
    pat=pzEl('p',{class:'pe-pat','aria-label':'Pattern'}),words=pzEl('div',{class:'pe-words',role:'group','aria-label':'Words'}),msg=mk(),prog=pzEl('p',{class:'pe-sub'});
  function say(t){msg.textContent=t;api.say(t)}
  function reset(){idx=0;hist=[];taps=0;fin=false;hl=-1}reset();
  function blockAt(i){var c=0;for(var b=0;b<inst.blocks.length;b++){c+=inst.blocks[b].length;if(i<c)return b}return inst.blocks.length}
  function paint(){var cur=blockAt(idx),done=0,c=0,b;pat.textContent='';
    rule.hidden=inst.show!=='rule';pat.hidden=inst.show==='rule';
    var lim=inst.show==='first'?Math.min(5,inst.blocks.length):inst.blocks.length;
    for(b=0;b<lim;b++){var s=pzEl('span',{class:'pe-blk'+(b<cur?' pe-done':b===cur?' pe-cur':''),text:inst.blocks[b].join(' ')});pat.appendChild(s)}
    if(inst.show==='first'&&inst.blocks.length>lim)pat.appendChild(pzEl('span',{class:'pe-blk',text:'then slide one word on'}));
    prog.textContent='Tapped '+idx+' of '+inst.seq.length+'.';
    inst.words.forEach(function(_,i){var bt=wb[i+1];bt.disabled=fin;bt.className='pe-btn'+(hl===i+1?' pe-hl':'')})}
  function tap(p){if(fin)return;taps++;api.moved();
    if(inst.seq[idx]===p){hist.push(idx);idx++;hl=-1;if(idx===inst.seq.length){fin=true;paint();say('Pattern complete in '+plural(taps,'tap')+'. The fewest possible is '+inst.par+'.');api.done({solved:true,moves:taps,hints:hints,undos:undos,extra:{par:inst.par}});return}
      paint();say('Right.')}
    else{hl=-1;paint();say('Not that one. Check the pattern and try again.')}}
  inst.order.forEach(function(p){var wd=inst.words[p-1],b=pzBtn('Word '+p+': '+wd,function(){tap(p)},{class:'pe-btn'});b.textContent='';b.appendChild(pzEl('b',{text:String(p),'aria-hidden':'true'}));b.appendChild(pzEl('span',{text:wd,'aria-hidden':'true'}));wb[p]=b;words.appendChild(b)});
  w.appendChild(info);w.appendChild(rule);w.appendChild(pat);w.appendChild(prog);w.appendChild(words);w.appendChild(msg);paint();
  return{undo:function(){if(fin||!hist.length)return false;idx=hist.pop();undos++;hl=-1;paint();say('Undone one tap.');return true},
    restart:function(){reset();paint();say('Restarted.')},
    hint:function(lv){if(fin)return null;var p=inst.seq[idx],s;hints++;
      if(lv<=1){hl=p;s='Look at the word with the dashed outline.'}
      else if(lv===2){hl=p;s='The next word is number '+p+', '+inst.words[p-1]+'.'}
      else{s='Tapping word '+p+'.';tap(p);if(!fin){msg.textContent=s;api.say(s)}return s}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'ghana-order',name:'Ghana Order',family:'word',theme:'F2',blurb:'Tap words in a back-and-forth pattern.',
  how:'Each word has a number. Tap the words in the order the pattern gives: pairs forward and back, then triples, sliding along one word at a time. Early levels print the whole pattern; later ones only the rule.',
  areas:['control','memory'],levels:30,secs:120,make:goMake,mount:wrapMount(mountGo),
  stars:function(res,inst){var p=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,h=res.hints||0;
    return{stars:starsOf(res.moves,p,h),line:'You finished the pattern in '+plural(res.moves,'tap')+' and '+hintsLine(h)+'. A clean run is '+p+'.'}}});

/* ================= 3. Retell Chain ================= */
/* three invented tales; each line: [original, big drift, small drift] */
var RT=[
 {t:'The Lantern Maker',L:[
  ['A lantern maker named Odo lived at the top of a windy hill.','A lantern maker named Odo lived in a small house in town.','A lantern maker named Odo lived at the top of a high hill.'],
  ['Every dusk he lit nine blue lanterns and hung them on a rope.','Every dusk he lit some lamps and hung them by his door.','Every dusk he lit seven blue lanterns and hung them on a rope.'],
  ['A fox with one white ear came and asked for a light.','A stranger came and asked for a light.','A fox with one black ear came and asked for a light.'],
  ['Odo gave her a lantern, though she had no coin to pay.','Odo gave her a lantern, and she paid him with a coin.','Odo gave her a lantern, though she had little coin to pay.'],
  ['She carried it across the marsh and left it on a stone.','She carried it home along the road and hung it on a gate.','She carried it across the marsh and left it on a log.'],
  ['The next morning a silver key lay beside his door.','The next morning a bag of gold lay beside his door.','The next morning a silver key lay beside his window.'],
  ['The key opened a small chest full of seeds, not gold.','The key opened a small chest full of gold.','The key opened a small box full of seeds, not gold.'],
  ['Odo planted them, and the hill grew thick with blue flowers.','Odo grew rich, and the hill became a busy town.','Odo planted them, and the hill grew thick with red flowers.']]},
 {t:'The Heron and the Bell',L:[
  ['A heron stood each morning beside the old mill pond.','A heron stood each morning beside the river.','A heron stood each evening beside the old mill pond.'],
  ['A small brass bell hung from the mill roof and rang in the wind.','A large iron bell hung from the church tower and rang each hour.','A small brass bell hung from the mill door and rang in the wind.'],
  ['One day the bell fell silent, and the miller was puzzled.','One day the bell broke, and the miller was angry.','One day the bell fell silent, and the miller was worried.'],
  ['The heron climbed three steps of the ladder to look.','The heron flew up to the roof to look.','The heron climbed four steps of the ladder to look.'],
  ['A thread of green weed had wound around the clapper.','A branch had fallen against the bell.','A thread of green weed had wound around the handle.'],
  ['She pulled it free with her beak and shook out her wings.','The miller pulled it free and shook it hard.','She pulled it free with her beak and shook her feathers.'],
  ['The bell rang again, and the miller left a fish on the step.','The bell rang again, and the miller gave her a reward.','The bell rang again, and the miller left a fish on the wall.'],
  ['After that, the heron was always first to hear it ring.','After that, everyone in the village loved the bell.','After that, the heron was always first to hear it chime.']]},
 {t:'The Tea Seller Umbrella',L:[
  ['A tea seller kept a yellow umbrella at the edge of the market.','A tea seller kept a small tent at the edge of the town.','A tea seller kept a red umbrella at the edge of the market.'],
  ['Each day a boy named Tavi swept the ground under it.','Each day a girl swept the shop floor.','Each day a boy named Tavi swept the ground beside it.'],
  ['One windy noon the umbrella flew off over the rooftops.','One stormy night the umbrella was blown away.','One windy morning the umbrella flew off over the rooftops.'],
  ['Tavi ran after it through six narrow streets.','Tavi ran after it down the road.','Tavi ran after it through five narrow streets.'],
  ['He found it caught on a clock tower hand.','He found it lying in a field.','He found it caught on a clock tower roof.'],
  ['He climbed up and freed it, scraping his knee.','He picked it up and carried it home.','He climbed up and freed it, scraping his elbow.'],
  ['The seller gave him a cup of warm ginger tea.','The seller thanked him and gave him some money.','The seller gave him a cup of warm lemon tea.'],
  ['From then on Tavi’s cup was kept on the highest shelf.','From then on the seller kept the umbrella indoors.','From then on Tavi’s cup was kept on the highest peg.']]}];
function rtSpec(l){return{k:Math.min(8,4+Math.floor((l-1)/7)),kind:l<=10?1:2,chain:l>=21}}
function rtMake(level,rng){var sp=rtSpec(level),t=RT[pzInt(rng,RT.length)],k=sp.k,i,a=pzInt(rng,k),b,orig=[],r1=null,r2;
  for(i=0;i<k;i++)orig.push(t.L[i][0]);
  if(!sp.chain){r2=orig.slice();r2[a]=t.L[a][sp.kind];return{level:level,title:'Level '+level,tale:t.t,orig:orig,base:orig,shown:r2,target:a,chain:false,par:1}}
  r1=orig.slice();r1[a]=t.L[a][1];b=(a+1+pzInt(rng,k-1))%k;r2=r1.slice();r2[b]=t.L[b][2];
  return{level:level,title:'Level '+level,tale:t.t,orig:orig,base:r1,shown:r2,target:b,chain:true,par:1}}
PZE3.rt={make:rtMake,tales:RT,spec:rtSpec};
function mountRt(root,inst,api){
  var w=shell(root,'pe-rt'),wrong,hist,taps,hints=0,undos=0,fin,hl=-1,k=inst.shown.length,bs=[],i,
    info=pzEl('p',{class:'pe-info',text:inst.chain?'An invented tale was retold, and then retold again. Compare the second retelling with the first: one line changed. Tap it.':'An invented tale was retold, and one line drifted from the original. Compare the two and tap the line that changed.'}),
    msg=mk(),lines=pzEl('ul',{class:'pe-lines'});
  function say(t){msg.textContent=t;api.say(t)}
  function reset(){wrong=[];hist=[];taps=0;fin=false;hl=-1}reset();
  function olist(title,arr){w.appendChild(pzEl('p',{class:'pe-h',text:title}));var o=pzEl('ol',{class:'pe-ol'});arr.forEach(function(t){o.appendChild(pzEl('li',{text:t}))});w.appendChild(o)}
  w.appendChild(info);olist('Original: '+inst.tale,inst.orig);if(inst.chain)olist('First retelling',inst.base);
  w.appendChild(pzEl('p',{class:'pe-h',text:inst.chain?'Second retelling (tap the changed line)':'Retelling (tap the changed line)'}));
  var ref=inst.chain?'first retelling':'original';
  for(i=0;i<k;i++)(function(j){var b=pzBtn('Line '+(j+1)+': '+inst.shown[j],function(){tap(j)},{class:'pe-btn'});bs.push(b);var li=pzEl('li');li.appendChild(b);lines.appendChild(li)})(i);
  w.appendChild(lines);w.appendChild(msg);
  function paint(){for(var j=0;j<k;j++){var b=bs[j],isW=wrong.indexOf(j)>=0,t=inst.shown[j];b.className='pe-btn'+(hl===j?' pe-hl':'');b.disabled=fin||isW;
    var txt=(j+1)+'. '+t+(isW?' (same as the '+ref+')':fin&&j===inst.target?' (this line changed)':'');b.textContent=txt;b.setAttribute('aria-label','Line '+(j+1)+': '+t+(isW?', same as the '+ref:fin&&j===inst.target?', this is the changed line':''))}}
  function tap(j){if(fin||wrong.indexOf(j)>=0)return;taps++;api.moved();
    if(j===inst.target){fin=true;paint();say('Yes, that line changed. '+plural(taps,'tap')+'; the best is 1.');api.done({solved:true,moves:taps,hints:hints,undos:undos,extra:{par:1}})}
    else{wrong.push(j);hist.push(j);hl=-1;paint();say('That line matches the '+ref+'. Try another.')}}
  paint();
  return{undo:function(){if(fin||!hist.length)return false;var j=hist.pop();wrong.splice(wrong.indexOf(j),1);undos++;hl=-1;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted.')},
    hint:function(lv){if(fin)return null;var s;hints++;
      if(lv<=1){s='The changed line is in the '+(inst.target<k/2?'first':'second')+' half of the retelling.'}
      else if(lv===2){hl=inst.target;s='Look at line '+(inst.target+1)+' of the retelling.'}
      else{s='Line '+(inst.target+1)+' is the one that changed.';tap(inst.target);if(!fin){msg.textContent=s;api.say(s)}return s}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'retell-chain',name:'Retell Chain',family:'word',theme:'F4',blurb:'Spot the line that drifted in a retold tale.',
  how:'Read a short invented tale, then its retelling. One line has drifted. Tap the line that changed. Later levels retell it twice: compare the second retelling with the first.',
  areas:['attention','flex'],levels:30,secs:60,make:rtMake,mount:wrapMount(mountRt),
  stars:function(res,inst){var h=res.hints||0,s=res.moves<=1?3:res.moves<=2?2:1;if(h&&s===3)s=2;
    return{stars:s,line:'You found the changed line in '+plural(res.moves,'tap')+' and '+hintsLine(h)+'. The best is 1.'}}});

/* ================= 4. Study Gap Planner ================= */
function sgWin(p,k){var T=p.growth==='add'?p.T0*(k+1):p.T0*Math.pow(2,k);return p.m*T}
function sgDays(p,rev){var r=rev.slice().sort(function(a,b){return a-b}),out=[],t,k,last;
  for(t=1;t<=p.H;t++){k=0;last=0;for(var i=0;i<r.length;i++)if(r[i]<t){k++;last=r[i]}out.push(t-last<=sgWin(p,k))}return out}
function sgPlan(p){var out=[],last=0,k=0;while(p.H-last>sgWin(p,k)){last=last+sgWin(p,k);out.push(last);k++}return out}
function sgSpec(l){return l<=10?{growth:'dbl',H:10+Math.floor((l-1)*4/9),T0:[2,3],m:[1]}:l<=20?{growth:'dbl',H:14+Math.floor((l-11)*8/9),T0:[1,2],m:[1,2]}:{growth:'add',H:22+Math.floor((l-21)*8/9),T0:[1,2],m:[1]}}
function sgMake(level,rng){var sp=sgSpec(level),p={growth:sp.growth,H:sp.H,T0:sp.T0[pzInt(rng,sp.T0.length)],m:sp.m[pzInt(rng,sp.m.length)]};
  p.level=level;p.title='Level '+level;p.par=sgPlan(p).length;return p}
PZE3.sg={make:sgMake,days:sgDays,plan:sgPlan,win:sgWin,spec:sgSpec};
function mountSg(root,inst,api){
  var w=shell(root,'pe-sg'),rev,hist,moves,hints=0,undos=0,fin,hl=-1,db=[],H=inst.H,plan=sgPlan(inst),i,
    thr=inst.m===1?'50%':'25%',growTxt=inst.growth==='add'?'adds '+inst.T0+' more day'+(inst.T0===1?'':'s')+' to that':'doubles that',
    info=pzEl('p',{class:'pe-info',text:'A planning puzzle on a simple model, not a test of anything. You learn something on day 0. In the model, its level starts at 100% and halves every '+inst.T0+' day'+(inst.T0===1?'':'s')+'. A review sets it back to 100% and '+growTxt+'. Each day is measured before that day’s review. Choose review days so that every day from 1 to '+H+' stays at or above '+thr+', with as few reviews as you can.'}),
    svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),sc=pzEl('p',{class:'pe-sub'}),msg=mk(),days=pzEl('div',{class:'pe-days',role:'group','aria-label':'Days'});
  function say(t){msg.textContent=t;api.say(t)}
  function reset(){rev=[];hist=[];moves=0;fin=false;hl=-1}reset();
  function ret(t){var r=rev.slice().sort(function(a,b){return a-b}),k=0,last=0,T;for(var j=0;j<r.length;j++)if(r[j]<t||(r[j]===t&&false)){k++;last=r[j]}
    T=inst.growth==='add'?inst.T0*(k+1):inst.T0*Math.pow(2,k);return{v:Math.pow(.5,(t-last)/T),last:last}}
  function drawChart(){var N='http://www.w3.org/2000/svg',x=function(t){return 10+t/H*280},y=function(v){return 110-v*100},d='',r=rev.slice().sort(function(a,b){return a-b}),pts=[0].concat(r),j,t;
    svg.textContent='';svg.setAttribute('viewBox','0 0 300 120');svg.setAttribute('class','pe-svg');svg.setAttribute('aria-hidden','true');
    var th=document.createElementNS(N,'line');th.setAttribute('x1',10);th.setAttribute('x2',290);th.setAttribute('y1',y(Math.pow(.5,inst.m)));th.setAttribute('y2',y(Math.pow(.5,inst.m)));th.setAttribute('stroke','currentColor');th.setAttribute('stroke-dasharray','4 3');svg.appendChild(th);
    for(j=0;j<pts.length;j++){var a=pts[j],e=j+1<pts.length?pts[j+1]:H,T=inst.growth==='add'?inst.T0*(j+1):inst.T0*Math.pow(2,j);
      for(t=a;t<=e+1e-9;t+=.25){d+=(t===a?'M':'L')+x(t).toFixed(1)+' '+y(Math.pow(.5,(t-a)/T)).toFixed(1)+' '}
      if(j>0){var m=document.createElementNS(N,'line');m.setAttribute('x1',x(a));m.setAttribute('x2',x(a));m.setAttribute('y1',10);m.setAttribute('y2',110);m.setAttribute('stroke','currentColor');m.setAttribute('stroke-width','1');svg.appendChild(m)}}
    var pa=document.createElementNS(N,'path');pa.setAttribute('d',d);pa.setAttribute('fill','none');pa.setAttribute('stroke','currentColor');pa.setAttribute('stroke-width','2');svg.appendChild(pa)}
  function paint(){var ok=sgDays(inst,rev),good=0,j;
    for(j=0;j<H;j++){var t=j+1,isR=rev.indexOf(t)>=0,b=db[j];if(ok[j])good++;
      b.className='pe-btn pe-day'+(hl===t?' pe-hl':'');b.disabled=fin;b.setAttribute('aria-pressed',isR?'true':'false');
      b.lastChild.textContent=(isR?'R ':'')+(ok[j]?'ok':'low');
      b.setAttribute('aria-label','Day '+t+': '+(isR?'review set, ':'no review, ')+(ok[j]?'level is at or above '+thr:'level is below '+thr))}
    sc.textContent='Days at or above '+thr+': '+good+' of '+H+'. Reviews used: '+rev.length+'.';drawChart();return good===H}
  function toggle(t){if(fin)return;var p=rev.indexOf(t);if(p>=0)rev.splice(p,1);else rev.push(t);hist.push(t);moves++;hl=-1;api.moved();
    if(paint()){fin=true;paint();say('Every day is covered with '+plural(rev.length,'review')+'. The fewest possible is '+inst.par+'.');api.done({solved:true,moves:rev.length,hints:hints,undos:undos,extra:{par:inst.par,used:rev.length,taps:moves}})}
    else say(p>=0?'Review on day '+t+' removed.':'Review set on day '+t+'.')}
  for(i=1;i<=H;i++)(function(t){var b=pzBtn('Day '+t,function(){toggle(t)},{class:'pe-btn pe-day','aria-pressed':'false'});b.textContent='';b.appendChild(pzEl('b',{text:String(t),'aria-hidden':'true'}));b.appendChild(pzEl('span',{'aria-hidden':'true'}));db.push(b);days.appendChild(b)})(i);
  w.appendChild(info);w.appendChild(svg);w.appendChild(sc);w.appendChild(days);w.appendChild(msg);paint();
  function nextMove(){var j;for(j=0;j<rev.length;j++)if(plan.indexOf(rev[j])<0)return{t:rev[j],add:false};for(j=0;j<plan.length;j++)if(rev.indexOf(plan[j])<0)return{t:plan[j],add:true};return null}
  return{undo:function(){if(fin||!hist.length)return false;var t=hist.pop(),p=rev.indexOf(t);if(p>=0)rev.splice(p,1);else rev.push(t);undos++;hl=-1;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted.')},
    hint:function(lv){if(fin)return null;var m=nextMove(),s;if(!m)return null;hints++;
      if(lv<=1){hl=m.t;s='Look at the day with the dashed outline.'}
      else if(lv===2){hl=m.t;s=m.add?'A review on day '+m.t+' fits the shortest plan.':'The review on day '+m.t+' is not part of the shortest plan. Take it off.'}
      else{s=(m.add?'Setting':'Removing')+' a review on day '+m.t+'.';toggle(m.t);if(!fin){msg.textContent=s;api.say(s)}return s}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'study-gap-planner',name:'Study Gap Planner',family:'number',theme:'F5',blurb:'Plan review days on a simple model.',
  how:'On a stated model a level halves every few days and a review resets it. Tap days to place or remove reviews so every day stays at or above the threshold, using as few reviews as you can.',
  areas:['flex','control'],levels:30,secs:120,make:sgMake,mount:wrapMount(mountSg),
  stars:function(res,inst){var u=(res.extra&&res.extra.used)||res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||u,h=res.hints||0,s=u<=p?3:u<=p+1?2:1;if(h&&s===3)s=2;
    return{stars:s,line:'You covered every day with '+plural(u,'review')+' and '+hintsLine(h)+'. The fewest possible is '+p+'.'}}});
})();
