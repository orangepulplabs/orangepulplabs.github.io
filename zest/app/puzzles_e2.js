/* Zest puzzles, wave 3 file 2: Last Letter Chain, Missing E, Word Square, Shiva Abbreviations. Contract: see puzzles_kit.js.
   Pure generators first (no DOM, exposed as PZE2 for tests), then one shared shell, then the four mounts. Needs wordlist.js (WORDS) loaded first.
   par: Last Letter Chain = words to add (one valid word = one move; a refused word is not a move). Missing E = number of word slots (one pick each).
   Word Square = fewest row swaps (brute force over all row orders). Shiva Abbreviations = sounds to tap (each right sound tapped once).
   Everything the player types or taps is checked by rule (list membership, letter test, row/column equality, table range), never by taste.
   No audio. All graphics are DOM text. */
var PZE2={};
function pze2Pl(n,w,p){return n+' '+(n===1?w:(p||w+'s'))}
function pze2KeyOk(e){return !(e.ctrlKey||e.metaKey||e.altKey)&&!/^(INPUT|TEXTAREA|SELECT)$/.test((e.target&&e.target.tagName)||'')}
function pze2Words(len){var w=(typeof WORDS!=='undefined')?WORDS['by'+len]:null;if(!w)return [];return typeof w==='string'?w.split(' '):w}
PZE2.all=null;PZE2.set=null;
PZE2.list=function(){if(PZE2.all)return PZE2.all;var a=[],i;for(i=3;i<=9;i++)a=a.concat(pze2Words(i));PZE2.all=a;PZE2.set={};a.forEach(function(x){PZE2.set[x]=1});return a};
PZE2.has=function(w){PZE2.list();return PZE2.set[w]===1};
PZE2.last=function(w){return w.charAt(w.length-1)};

/* ================= 1. Last Letter Chain =================
   Start from the shown word. Add words, each beginning with the last letter of the one before, no repeats, until the chain has `target` new words.
   Levels add a minimum length and (from level 21) no word may end in s. The generator proves a full chain exists (inst.sol). */
PZE2.llc={};
PZE2.llc.ok=function(minLen,noEnd){return function(w){return w.length>=minLen&&!(noEnd&&PZE2.last(w)===noEnd)}};
PZE2.llc.byFirst=function(ok){var m={},l=PZE2.list(),i,w;for(i=0;i<l.length;i++){w=l[i];if(ok(w))(m[w.charAt(0)]=m[w.charAt(0)]||[]).push(w)}return m};
PZE2.llc.find=function(bf,last,used,need,rng,budget){
  var u={},k,out=[],nodes=0;for(k in used)u[k]=1;
  function w8(w){var l=bf[PZE2.last(w)];return l?l.length:0}
  function rec(l,n){if(n===0)return true;if(++nodes>budget)return false;
    var c=(bf[l]||[]).filter(function(w){return !u[w]}),i;if(!c.length)return false;
    if(rng)c=pzShuffle(c,rng);c.sort(function(a,b){return w8(b)-w8(a)});c=c.slice(0,n>1?6:1);
    for(i=0;i<c.length;i++){u[c[i]]=1;out.push(c[i]);if(rec(PZE2.last(c[i]),n-1))return true;out.pop();delete u[c[i]]}return false}
  return rec(last,need)?out:null};
PZE2.llc.params=function(level){return {minLen:level<=10?3:level<=20?4:5,noEnd:level>=21?'s':'',target:4+Math.round((level-1)*8/29)}};
PZE2.llc.make=function(level,rng){
  var p=PZE2.llc.params(level),ok=PZE2.llc.ok(p.minLen,p.noEnd),bf=PZE2.llc.byFirst(ok),maxL=level<=10?5:7,
      starts=pzShuffle(PZE2.list().filter(function(w){return w.length>=p.minLen&&w.length<=maxL}),rng),i,sol=null,st;
  for(i=0;i<starts.length&&i<400;i++){st=starts[i];var u={};u[st]=1;sol=PZE2.llc.find(bf,PZE2.last(st),u,p.target,rng,4000);if(sol)break}
  return {title:'Level '+level,level:level,start:st,target:p.target,par:p.target,parExact:true,minLen:p.minLen,noEnd:p.noEnd,sol:sol}};
/* why a word is refused, or '' if it is fine */
PZE2.llc.refuse=function(inst,chain,w){
  if(!w)return 'Type a word first.';if(!/^[a-z]+$/.test(w))return 'Use letters only, no spaces.';
  if(w.length<inst.minLen)return 'Words here need at least '+inst.minLen+' letters.';
  var need=PZE2.last(chain[chain.length-1]);if(w.charAt(0)!==need)return '“'+w+'” does not start with “'+need.toUpperCase()+'”.';
  if(chain.indexOf(w)>=0)return '“'+w+'” is already in the chain.';
  if(inst.noEnd&&PZE2.last(w)===inst.noEnd)return 'Here no word may end in “'+inst.noEnd.toUpperCase()+'”.';
  if(!PZE2.has(w))return 'Zest does not know “'+w+'”. Try another word.';return ''};

/* ================= 2. Missing E =================
   Build a short sentence "My ... ." by choosing one word for each gap, so that the finished sentence has no banned letter (one letter, later two).
   Each gap names a meaning; its choices are near-synonyms and at least one has none of the banned letters. Checked by letter test only. */
PZE2.me={};
PZE2.me.G=[
 ['a','small','tiny little small wee mini'],['a','big','big large huge vast giant'],['a','happy','glad happy merry jolly cheery'],['a','old','old aged ancient elderly'],
 ['a','fast','quick fast rapid swift speedy'],['a','calm','calm quiet still silent hushed'],['a','loud','loud noisy booming'],['a','clean','clean tidy neat spotless'],
 ['n','dog','dog hound pup mutt puppy'],['n','cat','cat kitten tabby feline puss'],['n','child','kid child tot youth lad'],['n','boat','boat ship craft yacht barge'],
 ['n','home','house home hut cabin cottage'],['n','horse','horse pony mare colt steed'],['n','road','road path lane track street'],['n','friend','friend pal buddy mate chum'],
 ['v','run','ran dashed raced sped hurried bolted'],['v','sit','sat rested perched stayed waited'],['v','sleep','slept napped dozed snoozed'],['v','jump','jumped hopped leaped sprang bounded'],
 ['v','speak','spoke talked said chatted called'],['v','laugh','laughed giggled chuckled grinned smiled'],
 ['d','gently','slowly gently calmly softly quietly'],['d','quickly','quickly fast swiftly rapidly briskly'],['d','loudly','loudly aloud noisily']];
PZE2.me.has=function(w,banned){for(var i=0;i<banned.length;i++)if(w.indexOf(banned[i])>=0)return true;return false};
PZE2.me.make=function(level,rng){
  var ns=level<=6?2:level<=16?3:4,kinds=ns===2?['n','v']:ns===3?['a','n','v']:['a','n','v','d'],k=level<=6?3:level<=16?4:5,vn=level<=10?2:1,
      pool=['e','a','o','i','e','t','r','s','n'],t,res=null;
  for(t=0;t<300&&!res;t++){
    var banned=level<=6||t>=250?['e']:level<=20?[pool[pzInt(rng,pool.length)]]:pzShuffle(['e','a','o','i','t','r','s','n'],rng).slice(0,2),slots=[],used={},j;
    for(j=0;j<kinds.length;j++){
      var cand=pzShuffle(PZE2.me.G.filter(function(g){return g[0]===kinds[j]&&!used[g[1]]}),rng),g=null,ws,v,iv,q;
      for(q=0;q<cand.length;q++){ws=cand[q][2].split(' ');v=ws.filter(function(w){return !PZE2.me.has(w,banned)});iv=ws.filter(function(w){return PZE2.me.has(w,banned)});
        if(v.length&&iv.length&&v.length+iv.length>=3){g=cand[q];break}}
      if(!g)break;used[g[1]]=1;
      var nv=Math.min(vn,v.length),pick=pzShuffle(v,rng).slice(0,nv).concat(pzShuffle(iv,rng).slice(0,Math.max(1,k-nv)));var more=pzShuffle(v,rng).filter(function(w){return pick.indexOf(w)<0});while(pick.length<3&&more.length)pick.push(more.shift());pick=pzShuffle(pick,rng);
      slots.push({kind:kinds[j],m:g[1],opts:pick,ok:pick.map(function(w){return !PZE2.me.has(w,banned)})})}
    if(slots.length===kinds.length)res={title:'Level '+level,level:level,banned:banned,slots:slots,par:slots.length,parExact:true,lead:'My',tail:'.'}}
  return res};
PZE2.me.sentence=function(inst,picks){return inst.lead+' '+inst.slots.map(function(s,i){return picks[i]>=0?s.opts[picks[i]]:'…'}).join(' ')+inst.tail};

/* ================= 3. Word Square =================
   n words are shown as rows in a shuffled order. Reorder the rows (swap two at a time) so the square is symmetric: row k reads the same as column k.
   The generator finds real squares from the word list; par = fewest swaps to any order that is symmetric (brute force over all orders). */
PZE2.ws={};
PZE2.ws.find=function(n,rng){
  var ws=pze2Words(n),bp={},i;ws.forEach(function(w){for(var q=0;q<=n;q++){var p=w.slice(0,q);(bp[p]=bp[p]||[]).push(w)}});
  function rec(rows){var i=rows.length;if(i===n)return true;var p='',r;for(r=0;r<i;r++)p+=rows[r][i];var c=bp[p]||[],k;
    for(k=0;k<c.length;k++){if(rows.indexOf(c[k])>=0)continue;rows.push(c[k]);if(rec(rows))return true;rows.pop()}return false}
  var firsts=pzShuffle(ws,rng);for(i=0;i<firsts.length;i++){var rows=[firsts[i]];if(rec(rows))return rows}return null};
PZE2.ws.sym=function(a){var n=a.length,i,j;for(i=0;i<n;i++)for(j=0;j<n;j++)if(a[i].charAt(j)!==a[j].charAt(i))return false;return true};
PZE2.ws.perms=function(a){if(a.length<=1)return [a.slice()];var out=[],i;for(i=0;i<a.length;i++){var rest=a.slice(0,i).concat(a.slice(i+1));PZE2.ws.perms(rest).forEach(function(p){out.push([a[i]].concat(p))})}return out};
PZE2.ws.solutions=function(rows){return PZE2.ws.perms(rows).filter(PZE2.ws.sym)};
PZE2.ws.dist=function(arr,target){var n=arr.length,seen=[],c=0,i,j;for(i=0;i<n;i++){if(seen[i])continue;c++;j=i;while(!seen[j]){seen[j]=1;j=arr.indexOf(target[j])}}return n-c};
PZE2.ws.par=function(arr){var best=99;PZE2.ws.solutions(arr).forEach(function(s){var d=PZE2.ws.dist(arr,s);if(d<best)best=d});return best};
PZE2.ws.nearest=function(arr){var best=null,bd=99;PZE2.ws.solutions(arr).forEach(function(s){var d=PZE2.ws.dist(arr,s);if(d<bd){bd=d;best=s}});return best};
PZE2.ws.make=function(level,rng){
  var n=level<=9?3:level<=19?4:5,lo=n===3?1:n===4?10:20,hi=n===3?9:n===4?19:30,prog=(level-lo)/(hi-lo),want=Math.max(2,Math.min(n-1,Math.round(1+prog*(n-2)))),
      sq=PZE2.ws.find(n,rng),best=null,bp=-1,t;
  for(t=0;t<60;t++){var a=pzShuffle(sq,rng),p=PZE2.ws.par(a);if(p>=1&&(best===null||Math.abs(p-want)<Math.abs(bp-want))){best=a;bp=p;if(p===want)break}}
  return {title:'Level '+level,level:level,n:n,rows:best,par:bp,parExact:true,answer:sq}};

/* ================= 4. Shiva Abbreviations =================
   An invented table lists sounds (made-up syllables) in a row, with numbered markers between groups. A code such as ko-2 means: every sound from ko
   up to marker 2 (marker cells are not sounds). Early levels end at the next marker; later levels may skip markers; from level 16 two codes are joined.
   The table, syllables and codes are all invented for Zest. They do not copy any real sutra text or any published example. */
PZE2.sv={};
PZE2.sv.cells=function(level,rng){
  var ns=Math.min(14,6+Math.floor((level-1)/4)),nm=Math.min(4,2+Math.floor((level-1)/9)),C='bdfgklmnprstvz'.split(''),V='aeiou'.split(''),names={},snd=[],sizes=[],i;
  while(snd.length<ns){var s=C[pzInt(rng,C.length)]+V[pzInt(rng,V.length)];if(!names[s]){names[s]=1;snd.push(s)}}
  for(i=0;i<nm;i++)sizes.push(1);var left=ns-nm;while(left>0){sizes[pzInt(rng,nm)]++;left--}
  var cells=[],p=0;for(i=0;i<nm;i++){for(var q=0;q<sizes[i];q++)cells.push(snd[p++]);cells.push(i+1)}return cells};
/* sounds covered by code x-m (x a sound, m a marker number), in table order */
PZE2.sv.cover=function(cells,x,m){var a=cells.indexOf(x),b=cells.indexOf(m),out=[],i;if(a<0||b<0||b<a)return out;for(i=a;i<b;i++)if(typeof cells[i]==='string')out.push(cells[i]);return out};
PZE2.sv.make=function(level,rng){
  var cells=PZE2.sv.cells(level,rng),nm=cells.filter(function(c){return typeof c==='number'}).length,rounds=[],seen={},R=3+Math.floor((level-1)/7),
      two=level>=16,skip=level>=6,sounds=cells.filter(function(c){return typeof c==='string'}),t=0,par=0;
  function code(){var x=sounds[pzInt(rng,sounds.length)],ms=[],m,xi=cells.indexOf(x);
    for(m=1;m<=nm;m++)if(cells.indexOf(m)>xi)ms.push(m);if(!ms.length)return null;
    m=skip?ms[pzInt(rng,ms.length)]:ms[0];return {x:x,m:m,text:x+'-'+m,cov:PZE2.sv.cover(cells,x,m)}}
  while(rounds.length<R&&t++<500){
    var cs=[code()],c2;if(!cs[0]||cs[0].cov.length<2)continue;
    if(two){c2=code();if(!c2||c2.cov.length<2||c2.text===cs[0].text)continue;cs.push(c2)}
    var ans=[];cs.forEach(function(c){c.cov.forEach(function(s){if(ans.indexOf(s)<0)ans.push(s)})});
    var key=cs.map(function(c){return c.text}).sort().join('+');if(seen[key]||ans.length>(level<10?4:level<20?6:8))continue;seen[key]=1;
    rounds.push({codes:cs.map(function(c){return c.text}),ans:ans});par+=ans.length}
  return {title:'Level '+level,level:level,cells:cells,rounds:rounds,par:par,parExact:true}};

/* ================= shared styles (one <style id="pze2-css">) ================= */
var PZE2_CSS='.pze2{display:flex;flex-direction:column;gap:12px;width:100%;max-width:24rem;margin:0 auto;color:var(--ink);font-family:var(--font)}.pze2 *{box-sizing:border-box}'
+'.pze2-top{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:2px 12px}.pze2-goal{margin:0;font:700 1.125rem/1.25 var(--disp)}.pze2-ct{font:650 .875rem var(--font);color:var(--muted)}'
+'.pze2-board{position:relative}.pze2-msg{margin:0;min-height:2.8em;font-size:.9375rem;line-height:1.4;color:var(--muted)}.pze2-note{margin:6px 0 0;font-size:.8125rem;line-height:1.4;color:var(--muted)}'
+'.pze2-bar{display:flex;flex-wrap:wrap;gap:8px}.pze2-bar .pzb{flex:1 1 5.5rem}'
+'.pze2 .pzb{min-height:3rem;min-width:48px;padding:.25rem 14px;border:0;border-radius:var(--r1);background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);font:700 1rem/1.2 var(--font);color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-align:center;transition:transform .12s ease-out}'
+'.pze2 .pzb:active{transform:scale(.97)}.pze2 .pzb:disabled{background:var(--dis-bg);color:var(--dis-ink);box-shadow:none;cursor:default}.pze2 .pzb.pri{background:var(--accent);color:var(--on-accent);box-shadow:none}'
+'.pze2 .pzb:focus-visible,.pze2 input:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.pze2 .pzb.pze2-hint{outline:3px dashed var(--ink);outline-offset:3px}.pze2 .pzb[aria-pressed=true]{background:var(--tint);box-shadow:inset 0 0 0 3px var(--accent)}'
+'.pze2-chain{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:6px}.pze2-chain li{padding:6px 10px;border-radius:10px;background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);font:700 1.0625rem/1.2 var(--disp);overflow-wrap:anywhere}.pze2-chain li u{text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:3px}.pze2-chain li.st{background:var(--tint)}'
+'.pze2-row{display:flex;gap:8px;align-items:stretch}.pze2-row input{flex:1 1 auto;min-width:0;min-height:3rem;padding:0 12px;border:0;border-radius:var(--r1);background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);font:700 1.125rem var(--font);color:var(--ink)}'
+'.pze2-ban{display:inline-block;padding:2px 10px;border-radius:10px;border:2px solid var(--ink);font:700 1.25rem var(--disp);margin:0 4px}.pze2-sent{margin:0;padding:10px 12px;border-radius:var(--r2);background:var(--surface);box-shadow:0 0 0 1px var(--line);font:700 1.25rem/1.4 var(--disp)}'
+'.pze2-slot{margin-top:10px}.pze2-slot p{margin:0 0 4px;font:650 .875rem var(--font);color:var(--muted)}.pze2-opts{display:flex;flex-wrap:wrap;gap:8px}.pze2-opts .pzb{flex:1 1 4.5rem}'
+'.pze2-sq{display:flex;flex-direction:column;gap:8px}.pze2 .pze2-sq .pzb{justify-content:flex-start;gap:6px;min-height:3.25rem;padding:4px 8px}.pze2-sq .pzb b{font:700 .8125rem var(--font);color:var(--muted);min-width:1.4rem}.pze2-sq .pzb i{font:700 1.5rem/1 var(--disp);font-style:normal;width:2.1rem;height:2.1rem;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:var(--bg,transparent);box-shadow:0 0 0 1.5px var(--edge)}'
+'.pze2-cols{margin:10px 0 0;padding:0;list-style:none;font:600 .9375rem/1.5 var(--font)}.pze2-cols span{font:700 1.0625rem var(--disp);letter-spacing:.06em}'
+'.pze2-tab{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.pze2-tab .pzb{min-width:3rem;font:700 1.0625rem var(--disp)}.pze2-mk{display:inline-flex;align-items:center;justify-content:center;min-width:2.2rem;height:3rem;padding:0 6px;border-radius:10px;border:2px dashed var(--edge);font:700 .9375rem var(--font);color:var(--muted)}'
+'.pze2-code{margin:0;padding:10px 12px;border-radius:var(--r2);background:var(--surface);box-shadow:0 0 0 1px var(--line);font:700 1.5rem/1.3 var(--disp);text-align:center}.pze2-code small{display:block;font:650 .8125rem var(--font);color:var(--muted)}'
+'.pze2.rm *,.pze2.rm *::before{transition:none!important;animation:none!important}@media (prefers-reduced-motion:reduce){.pze2 *,.pze2 *::before{transition:none!important;animation:none!important}}';
function pze2Css(){if(typeof document==='undefined'||document.getElementById('pze2-css'))return;var s=document.createElement('style');s.id='pze2-css';s.textContent=PZE2_CSS;(document.head||document.documentElement).appendChild(s)}

/* ================= shared shell ================= */
function pze2Shell(root,inst,api,o){
  pze2Css();while(root.firstChild)root.removeChild(root.firstChild);o=o||{};
  var S={timers:[],offs:[],dead:false,onDestroy:[]};
  S.wrap=pzEl('div',{class:'pze2'+(api.rm?' rm':'')+(o.cls?' '+o.cls:'')});
  S.goal=pzEl('p',{class:'pze2-goal',text:o.goal||''});S.ct=pzEl('span',{class:'pze2-ct num'});
  S.board=pzEl('div',{class:'pze2-board'});S.msg=pzEl('p',{class:'pze2-msg'});S.bar=pzEl('div',{class:'pze2-bar'});
  if(!api.say)S.msg.setAttribute('role','status');
  S.wrap.appendChild(pzEl('div',{class:'pze2-top'},[S.goal,S.ct]));S.wrap.appendChild(S.board);S.wrap.appendChild(S.msg);
  S.showBar=!(api.toolbar===false||inst.toolbar===false);if(S.showBar)S.wrap.appendChild(S.bar);
  S.say=function(t){S.msg.textContent=t;if(api.say)api.say(t)};
  S.later=function(fn,ms){var id=setTimeout(function(){if(!S.dead)fn()},ms);S.timers.push(id);return id};
  S.on=function(tg,ty,fn){tg.addEventListener(ty,fn);S.offs.push(function(){tg.removeEventListener(ty,fn)})};
  S.mark=function(el,ord){if(!el)return;el.classList.add('pze2-hint');el.setAttribute('data-hint-order',ord)};
  S.clearMarks=function(){var m=S.wrap.querySelectorAll('.pze2-hint'),i;for(i=0;i<m.length;i++){m[i].classList.remove('pze2-hint');m[i].removeAttribute('data-hint-order')}};
  S.finish=function(res){S.later(function(){api.done(res)},350)};
  S.bars=function(undo,hint,restart,hintTxt){var r={};if(!S.showBar)return r;
    r.u=pzBtn('Undo',undo);r.h=pzBtn('Hint',hint);r.r=pzBtn('Restart',restart);S.bar.appendChild(r.u);S.bar.appendChild(r.h);S.bar.appendChild(r.r);return r};
  S.destroy=function(){S.dead=true;S.timers.forEach(clearTimeout);S.offs.forEach(function(f){f()});S.onDestroy.forEach(function(f){try{f()}catch(e){}});if(S.wrap.parentNode)S.wrap.parentNode.removeChild(S.wrap)};
  root.appendChild(S.wrap);return S}
function pze2HintLabel(B,lvl){if(B&&B.h){var t=lvl===0?'Hint':lvl<3?'More hint':'Show again';B.h.textContent=t;B.h.setAttribute('aria-label',t)}}

/* ---- 1. Last Letter Chain ---- */
function pze2MountLlc(root,inst,api){
  var S=pze2Shell(root,inst,api,{cls:'pze2-llc',goal:'Add '+inst.target+' words. Each starts with the last letter of the word before.'}),
      chain=[inst.start],fin=0,lvl=0,hints=0,moves=0,B,list=pzEl('ol',{class:'pze2-chain'}),inp,add,prompt=pzEl('p',{class:'pze2-goal',style:'font-size:1rem'}),
      ok=PZE2.llc.ok(inst.minLen,inst.noEnd),bf=PZE2.llc.byFirst(ok);
  inp=pzEl('input',{type:'text','aria-label':'Your next word',autocomplete:'off',autocapitalize:'none',spellcheck:'false',maxlength:'12'});
  add=pzBtn('Add word',function(){submit(inp.value)},{class:'pri'});
  S.board.appendChild(list);S.board.appendChild(pzEl('div',{class:'pze2-row',style:'margin-top:10px'},[inp,add]));S.board.appendChild(prompt);
  S.board.appendChild(pzEl('p',{class:'pze2-note',text:'Words of '+inst.minLen+' or more letters from the Zest word list'+(inst.noEnd?', and none ending in '+inst.noEnd.toUpperCase():'')+'. A word that is refused costs nothing.'}));
  function used(){var u={};chain.forEach(function(w){u[w]=1});return u}
  function render(){S.clearMarks();list.textContent='';chain.forEach(function(w,i){var li=pzEl('li',{class:i?'':'st'});
    li.appendChild(document.createTextNode(w.slice(0,-1)));li.appendChild(pzEl('u',{text:PZE2.last(w)}));
    if(!i)li.appendChild(pzEl('small',{text:'  start'}));list.appendChild(li)});
    S.ct.textContent='Words added '+(chain.length-1)+' of '+inst.target;
    prompt.textContent=fin?'Chain complete.':'Next word starts with “'+PZE2.last(chain[chain.length-1]).toUpperCase()+'”.';
    inp.disabled=!!fin;add.disabled=!!fin;if(B.u)B.u.disabled=chain.length<2||!!fin}
  function put(w){chain.push(w);moves++;lvl=0;pze2HintLabel(B,0);if(api.moved)api.moved();inp.value='';
    if(chain.length-1>=inst.target){fin=1;render();S.say('“'+w+'” fits. That completes the chain of '+inst.target+' words.');S.finish({solved:true,moves:moves,hints:hints,undos:0,extra:{par:inst.par}})}
    else{render();S.say('“'+w+'” fits. Next word starts with “'+PZE2.last(w).toUpperCase()+'”.')}return true}
  function submit(raw){if(fin)return false;var w=String(raw||'').trim().toLowerCase(),m=PZE2.llc.refuse(inst,chain,w);if(m){S.say(m);return false}return put(w)}
  function cont(){return PZE2.llc.find(bf,PZE2.last(chain[chain.length-1]),used(),inst.target-(chain.length-1),null,4000)}
  function hint(n){if(fin)return null;n=Math.max(1,Math.min(3,n||lvl+1));lvl=n;hints++;S.clearMarks();var c=cont(),t;
    if(n===1)t='Your next word must start with “'+PZE2.last(chain[chain.length-1]).toUpperCase()+'”. Think of a word you know that begins that way.';
    else if(n===2)t=c?'There is a word with '+c[0].length+' letters that fits, and it ends in “'+PZE2.last(c[0]).toUpperCase()+'”.':'From here the list runs out of words to finish the chain. Try Undo.';
    else if(c){S.mark(add,1);t='Try “'+c[0]+'”. It is added for you.';put(c[0]);S.say(t)}
    else t='From here the list runs out of words to finish the chain. Use Undo or Restart.';
    if(n<3)S.say(t);pze2HintLabel(B,lvl);return t}
  function undo(){if(fin||chain.length<2)return false;chain.pop();moves--;render();S.say('Last word taken back.');return true}
  function restart(){if(fin)return false;chain=[inst.start];lvl=0;moves=0;pze2HintLabel(B,0);inp.value='';render();S.say('Back to the start word.');return true}
  B=S.bars(undo,function(){hint()},restart);
  S.on(inp,'keydown',function(e){if(e.key==='Enter'){e.preventDefault();submit(inp.value)}});
  S.say('Type a word and press Add word. Each new word begins with the last letter of the one before.');render();
  return {undo:undo,hint:hint,restart:restart,destroy:S.destroy,moves:function(){return moves}}}

/* ---- 2. Missing E ---- */
function pze2MountMe(root,inst,api){
  var L=inst.banned.map(function(b){return b.toUpperCase()}).join(' and '),
      S=pze2Shell(root,inst,api,{cls:'pze2-me',goal:'Finish the sentence without the letter '+L+'.'}),
      picks=inst.slots.map(function(){return -1}),hist=[],moves=0,hints=0,lvl=0,fin=0,B,bt=[],sent=pzEl('p',{class:'pze2-sent'}),ban=pzEl('p',{style:'margin:0'});
  ban.appendChild(document.createTextNode('Banned: '));inst.banned.forEach(function(b){ban.appendChild(pzEl('span',{class:'pze2-ban',text:b.toUpperCase()}))});
  ban.appendChild(document.createTextNode(' Not even once.'));
  S.board.appendChild(ban);S.board.appendChild(sent);
  inst.slots.forEach(function(s,i){var w=pzEl('div',{class:'pze2-slot'}),o=pzEl('div',{class:'pze2-opts'}),row=[];
    w.appendChild(pzEl('p',{text:'Gap '+(i+1)+': a word for “'+s.m+'”'}));
    s.opts.forEach(function(x,j){var b=pzBtn(x,function(){pick(i,j)},{'aria-pressed':'false'});row.push(b);o.appendChild(b)});bt.push(row);w.appendChild(o);S.board.appendChild(w)});
  function bad(i){return picks[i]>=0&&!inst.slots[i].ok[picks[i]]}
  function render(){S.clearMarks();sent.textContent=PZE2.me.sentence(inst,picks);
    bt.forEach(function(row,i){row.forEach(function(b,j){b.setAttribute('aria-pressed',picks[i]===j?'true':'false');b.disabled=!!fin})});
    S.ct.textContent='Picks '+moves+' · par '+inst.par;if(B.u)B.u.disabled=!hist.length||!!fin}
  function pick(i,j){if(fin||picks[i]===j)return false;hist.push([i,picks[i]]);picks[i]=j;moves++;lvl=0;pze2HintLabel(B,0);if(api.moved)api.moved();render();
    if(picks.every(function(p){return p>=0})){var nb=picks.filter(function(p,k){return bad(k)}).length;
      if(!nb){fin=1;render();S.say('“'+PZE2.me.sentence(inst,picks)+'” has no '+L+'. Done.');S.finish({solved:true,moves:moves,hints:hints,undos:0,extra:{par:inst.par}})}
      else S.say('The sentence is full, but '+pze2Pl(nb,'word')+' still '+(nb===1?'uses':'use')+' '+L+'. Change a pick.')}
    else S.say('“'+inst.slots[i].opts[j]+'” chosen. The sentence now reads: '+PZE2.me.sentence(inst,picks));return true}
  function firstOpen(){for(var i=0;i<picks.length;i++)if(picks[i]<0||bad(i))return i;return -1}
  function hint(n){if(fin)return null;n=Math.max(1,Math.min(3,n||lvl+1));lvl=n;hints++;S.clearMarks();var i=firstOpen(),s=inst.slots[i],t;
    if(n===1){t=picks[i]<0?'Start with gap '+(i+1)+', the word for “'+s.m+'”. One of its choices has no '+L+'.':'Gap '+(i+1)+' still has a '+L+' in it. Look at your pick there again.'}
    else if(n===2){var nok=s.ok.filter(Boolean).length;t='In gap '+(i+1)+', spell each choice letter by letter. '+pze2Pl(nok,'choice')+' of '+s.opts.length+' '+(nok===1?'has':'have')+' no '+L+'.'}
    else{var j=s.ok.indexOf(true);S.mark(bt[i][j],1);t='In gap '+(i+1)+', “'+s.opts[j]+'” has no '+L+'. It is picked for you.';pick(i,j);S.say(t)}
    if(n<3)S.say(t);pze2HintLabel(B,lvl);return t}
  function undo(){if(fin||!hist.length)return false;var h=hist.pop();picks[h[0]]=h[1];moves--;render();S.say('Last pick taken back.');return true}
  function restart(){if(fin)return false;picks=inst.slots.map(function(){return -1});hist=[];moves=0;lvl=0;pze2HintLabel(B,0);render();S.say('Sentence cleared.');return true}
  B=S.bars(undo,function(){hint()},restart);
  S.say('For each gap, pick a word that has no '+L+'. When every gap is filled the sentence is checked.');render();
  return {undo:undo,hint:hint,restart:restart,destroy:S.destroy,moves:function(){return moves}}}

/* ---- 3. Word Square ---- */
function pze2MountWs(root,inst,api){
  var S=pze2Shell(root,inst,api,{cls:'pze2-ws',goal:'Reorder the rows so each row matches the column with its number.'}),
      arr=inst.rows.slice(),sel=-1,hist=[],moves=0,hints=0,lvl=0,fin=0,B,btn=[],cols=pzEl('ul',{class:'pze2-cols'}),sq=pzEl('div',{class:'pze2-sq'}),n=inst.n;
  for(var r=0;r<n;r++)(function(i){var b=pzBtn('',function(){tap(i)},{text:'','aria-pressed':'false'});btn.push(b);sq.appendChild(b)})(r);
  S.board.appendChild(sq);S.board.appendChild(cols);
  S.board.appendChild(pzEl('p',{class:'pze2-note',text:'Tap one row, then another, to swap them. Row 1 should read down as column 1, row 2 as column 2, and so on.'}));
  function col(j){var s='',i;for(i=0;i<n;i++)s+=arr[i].charAt(j);return s}
  function render(){S.clearMarks();var i;cols.textContent='';
    for(i=0;i<n;i++){var b=btn[i];b.textContent='';b.appendChild(pzEl('b',{'aria-hidden':'true',text:String(i+1)}));
      arr[i].split('').forEach(function(ch){b.appendChild(pzEl('i',{'aria-hidden':'true',text:ch.toUpperCase()}))});
      b.setAttribute('aria-label','Row '+(i+1)+': '+arr[i]+(sel===i?', selected':''));b.setAttribute('aria-pressed',sel===i?'true':'false');b.disabled=!!fin;
      var c=col(i),same=c===arr[i];cols.appendChild(pzEl('li',{},['Column '+(i+1)+' reads ',pzEl('span',{text:c.toUpperCase()}),same?' – matches row '+(i+1)+' ✓':' – not row '+(i+1)+' yet']))}
    S.ct.textContent='Swaps '+moves+' · par '+inst.par;if(B.u)B.u.disabled=!hist.length||!!fin}
  function swap(i,j,rec){var t=arr[i];arr[i]=arr[j];arr[j]=t;if(rec){hist.push([i,j]);moves++;lvl=0;pze2HintLabel(B,0);if(api.moved)api.moved()}}
  function check(){if(PZE2.ws.sym(arr)){fin=1;sel=-1;render();S.say('Every row matches its column. The square is complete.');S.finish({solved:true,moves:moves,hints:hints,undos:0,extra:{par:inst.par}});return true}return false}
  function tap(i){if(fin)return false;if(sel<0){sel=i;render();S.say('Row '+(i+1)+' selected. Tap another row to swap.');return true}
    if(sel===i){sel=-1;render();S.say('Selection cleared.');return true}
    var a=sel;sel=-1;swap(a,i,true);render();if(!check())S.say('Rows '+(a+1)+' and '+(i+1)+' swapped.');return true}
  function hint(h){if(fin)return null;h=Math.max(1,Math.min(3,h||lvl+1));lvl=h;hints++;S.clearMarks();var t=PZE2.ws.nearest(arr),i,k,t3;
    for(i=0;i<n;i++)if(arr[i]!==t[i])break;
    if(h===1)t3='Look at the first letters of all the rows, read down. They should spell the first row.';
    else if(h===2)t3='Row '+(i+1)+' is not in its place yet. Which row would read down as column '+(i+1)+'?';
    else{k=arr.indexOf(t[i]);sel=-1;swap(i,k,true);render();S.mark(btn[i],1);S.mark(btn[k],2);t3='“'+t[i]+'” belongs in row '+(i+1)+'. The two rows are swapped for you.';if(!check())S.say(t3)}
    if(h<3)S.say(t3);pze2HintLabel(B,lvl);return t3}
  function undo(){if(fin||!hist.length)return false;var h=hist.pop();swap(h[0],h[1],false);moves--;sel=-1;render();S.say('Last swap taken back.');return true}
  function restart(){if(fin)return false;arr=inst.rows.slice();hist=[];sel=-1;moves=0;lvl=0;pze2HintLabel(B,0);render();S.say('Rows back where they started.');return true}
  B=S.bars(undo,function(){hint()},restart);
  S.say('Tap a row, then another row, to swap them. Make row 1 match column 1, row 2 match column 2, and so on.');render();
  return {undo:undo,hint:hint,restart:restart,destroy:S.destroy,moves:function(){return moves}}}

/* ---- 4. Shiva Abbreviations ---- */
function pze2MountSv(root,inst,api){
  var S=pze2Shell(root,inst,api,{cls:'pze2-sv',goal:'Tap every sound the code covers.'}),
      ri=0,sel=[],hist=[],moves=0,hints=0,lvl=0,fin=0,B,btn={},code=pzEl('p',{class:'pze2-code'}),tab=pzEl('div',{class:'pze2-tab'}),chk;
  inst.cells.forEach(function(c){if(typeof c==='string'){var b=pzBtn(c,function(){tap(c)},{'aria-label':'Sound '+c,'aria-pressed':'false'});btn[c]=b;tab.appendChild(b)}
    else tab.appendChild(pzEl('span',{class:'pze2-mk',role:'img','aria-label':'Marker '+c,text:'| '+c}))});
  chk=pzBtn('Check',function(){check(true)},{class:'pri'});
  S.board.appendChild(code);S.board.appendChild(tab);S.board.appendChild(pzEl('div',{style:'margin-top:10px'},[chk]));
  S.board.appendChild(pzEl('p',{class:'pze2-note',text:'A code such as ko-2 means every sound from ko up to marker 2, in table order. Markers are not sounds. The table is invented for this game.'}));
  function cur(){return inst.rounds[ri]}
  function render(){S.clearMarks();var r=cur();code.textContent='';code.appendChild(pzEl('small',{text:'Code'+(r.codes.length>1?'s, joined together':'')}));code.appendChild(document.createTextNode(r.codes.join('  +  ')));
    Object.keys(btn).forEach(function(s){btn[s].setAttribute('aria-pressed',sel.indexOf(s)>=0?'true':'false');btn[s].disabled=!!fin});
    S.ct.textContent='Code '+(ri+1)+' of '+inst.rounds.length+' · taps '+moves;chk.disabled=!!fin||!sel.length;if(B.u)B.u.disabled=!hist.length||!!fin}
  function same(){var a=cur().ans;return sel.length===a.length&&a.every(function(s){return sel.indexOf(s)>=0})}
  function advance(){var r=cur();if(ri>=inst.rounds.length-1){fin=1;sel=[];hist=[];render();S.say('Yes, '+r.codes.join(' and ')+' covers exactly those sounds. That was the last code.');S.finish({solved:true,moves:moves,hints:hints,undos:0,extra:{par:inst.par}})}
    else{ri++;sel=[];hist=[];lvl=0;pze2HintLabel(B,0);render();S.say('Yes, that is right. Next code: '+cur().codes.join(' and ')+'.')}}
  function check(manual){if(fin)return false;if(same()){advance();return true}
    if(manual){var a=cur().ans,extra=sel.filter(function(s){return a.indexOf(s)<0}).length,miss=a.filter(function(s){return sel.indexOf(s)<0}).length;
      S.say('Not quite yet: '+pze2Pl(extra,'tapped sound')+' '+(extra===1?'is':'are')+' outside the code, and '+pze2Pl(miss,'sound')+' '+(miss===1?'is':'are')+' still missing.')}return false}
  function tap(s){if(fin)return false;var i=sel.indexOf(s);hist.push([s,i<0]);if(i<0)sel.push(s);else sel.splice(i,1);moves++;lvl=0;pze2HintLabel(B,0);if(api.moved)api.moved();render();
    if(!check(false))S.say('Sound '+s+(i<0?' picked.':' put back.'));return true}
  function hint(h){if(fin)return null;h=Math.max(1,Math.min(3,h||lvl+1));lvl=h;hints++;S.clearMarks();var r=cur(),c=r.codes[0],x=c.split('-')[0],m=c.split('-')[1],t,
      wrong=sel.filter(function(s){return r.ans.indexOf(s)<0})[0],need=r.ans.filter(function(s){return sel.indexOf(s)<0})[0];
    if(h===1)t='Find the sound '+x+' on the table. Then read to the right until you reach marker '+m+'.';
    else if(h===2)t='The code'+(r.codes.length>1?'s together cover ':' covers ')+pze2Pl(r.ans.length,'sound')+', not counting markers.'+(wrong?' One of your taps is outside the range.':'');
    else if(wrong){S.mark(btn[wrong],1);t='Sound '+wrong+' is not covered by the code. It is put back.';tap(wrong);S.say(t)}
    else if(need){S.mark(btn[need],1);t='Sound '+need+' is covered by the code. It is picked for you.';tap(need);if(!fin)S.say(t)}
    else t='Every sound is already picked. Press Check.';
    if(h<3)S.say(t);pze2HintLabel(B,lvl);return t}
  function undo(){if(fin||!hist.length)return false;var h=hist.pop(),i=sel.indexOf(h[0]);if(h[1]&&i>=0)sel.splice(i,1);else if(!h[1]&&i<0)sel.push(h[0]);moves--;render();S.say('Last tap taken back.');return true}
  function restart(){if(fin)return false;ri=0;sel=[];hist=[];moves=0;lvl=0;pze2HintLabel(B,0);render();S.say('Back to the first code.');return true}
  B=S.bars(undo,function(){hint()},restart);
  S.say('Tap the sounds the code covers. A right set moves you on by itself; Check tells you how close you are.');render();
  return {undo:undo,hint:hint,restart:restart,destroy:S.destroy,moves:function(){return moves}}}

/* ================= registration ================= */
registerPuzzle({id:'last-letter-chain',name:'Last Letter Chain',family:'word',theme:'F3',areas:['flex','speed'],levels:30,secs:90,
  blurb:'Chain words: each one starts with the last letter of the one before.',
  how:'Type a word that begins with the last letter of the word shown, then press Add word. No repeats. Reach the chain length for the level. Later levels ask for longer words, and then no word ending in S. A refused word costs nothing.',
  make:PZE2.llc.make,mount:pze2MountLlc,
  stars:function(res,inst){return {stars:pzStarsByPar(res.moves,inst.par,res.hints),line:'You built a chain of '+inst.target+' words with '+pze2Pl(res.moves,'word')+' added. Par is '+inst.par+'; every word you add counts once.'}}});
registerPuzzle({id:'missing-e',name:'Missing E',family:'word',theme:'F3',areas:['flex','memory'],levels:30,secs:75,
  blurb:'Finish a sentence using only words that skip a banned letter.',
  how:'Each gap has a few words with the same meaning. Pick one for every gap so the finished sentence never uses the banned letter. Later levels ban other letters, and then two at once. Every pick counts, so choose with care.',
  make:PZE2.me.make,mount:pze2MountMe,
  stars:function(res,inst){return {stars:pzStarsByPar(res.moves,inst.par,res.hints),line:'You filled '+pze2Pl(inst.par,'gap')+' in '+pze2Pl(res.moves,'pick')+'. Par is '+inst.par+': one right pick per gap.'}}});
registerPuzzle({id:'word-square',name:'Word Square',family:'word',theme:'F3',areas:['space','flex'],levels:30,secs:90,
  blurb:'Reorder the rows of a word square so rows and columns match.',
  how:'You get the words of a small square in a mixed-up order. Tap two rows to swap them. The square is done when row 1 reads down as column 1, row 2 as column 2, and so on. Par is the fewest swaps.',
  make:PZE2.ws.make,mount:pze2MountWs,
  stars:function(res,inst){return {stars:pzStarsByPar(res.moves,inst.par,res.hints),line:'You finished in '+pze2Pl(res.moves,'swap')+'. The fewest possible is '+inst.par+'.'}}});
registerPuzzle({id:'shiva-abbreviations',name:'Shiva Abbreviations',family:'word',theme:'F3',areas:['attention','flex'],levels:30,secs:90,
  blurb:'Expand invented sound codes into the sounds they stand for.',
  how:'A made-up table lists sounds with numbered markers between groups. A code such as ko-2 stands for every sound from ko up to marker 2. Tap those sounds. Later levels let a code skip markers, then join two codes.',
  make:PZE2.sv.make,mount:pze2MountSv,
  stars:function(res,inst){return {stars:pzStarsByPar(res.moves,inst.par,res.hints),line:'You solved all '+inst.rounds.length+' codes with '+pze2Pl(res.moves,'tap')+'. Par is '+inst.par+': each covered sound tapped once.'}}});
