/* Zest challenge links, phase 1: the link codec, the message templates, the chip chooser and guest mode.
   Loaded after app4d.js and before app4b.js. Pure parts (the codec, templates, chooser) need no page, so tests/share_codec.js runs them in a bare vm.
   LINK v1:  https://orangepulplabs.com/zest/play/?c=<token>   token = base64url (no padding) of 23 bytes:
     0 version (low nibble = 1) + flags (high nibble, bit0 = daily card: the seed field is the day number)   1-2 puzzle index   3 generator version g   4 level
     5-8 seed (uint32)   9 metric (0 none, 1 moves, 2 tenths of a second: reserved)   10-11 target   12 hints used   13 round r
     14-15 issue day (days since 2026-01-01)   16 sender preset (0 none, fixed list, never free text)   17-22 check tag (HMAC-SHA256, first 6 bytes)
   The token carries no personal data. The check tag only detects corruption and casual edits: the salt is public in this file, so it is NOT anti-cheat. */
(function(G){
/* the frozen puzzle table: [index, id, file]. NEVER reuse or renumber an index; a retired puzzle stays here and is marked in PZRETIRED. file: a|b|bw (bw = also needs wordlist.js).
   PZGEN: the generator version g of each puzzle. A released (id, g) generator must NEVER change its output for the same (level, seed): fix a bug by adding g 2 and keeping g 1. */
/*PZTAB*/var PZTAB=[[1,'slide-tiles','a'],[2,'disc-tower','a'],[3,'few-swaps','a'],[4,'make-target','a'],[5,'digit-span','a'],[6,'tilt-run','a'],[7,'four-by-four','b'],[8,'zero-one','b'],[9,'code-cracker','b'],[10,'tube-sort','b'],[11,'scramble','bw'],[12,'word-steps','bw'],[13,'parallel-or-not','c1'],[14,'missing-triangle','c1'],[15,'quick-dots','c1'],[16,'digit-shuffle','c2'],[17,'remainder-riddle','c2'],[18,'balance-weights','c2'],[19,'bridge-walk','c3'],[20,'dodecahedron-tour','c3'],[21,'hundred-drawers','c3'],[22,'risk-deck','c4'],[23,'on-the-tip','c4'],[24,'sharp-or-round','c4'],[25,'spotlight-cue','d1'],[26,'bigger-faster','d1'],[27,'rule-check','d1'],[28,'pile-pull','d1'],[29,'eight-safe-queens','d1'],[30,'same-grey','d2'],[31,'swap-starts','d2'],[32,'shift-three','d2'],[33,'lotus-in-the-lake','d2'],[34,'virtue-ladder','d2'],[35,'hold-the-interval','d3'],[36,'switch-off','d3'],[37,'jump-away','d3'],[38,'circle-count','d3'],[39,'magic-three','d3'],[40,'river-ferry','d4'],[41,'flat-fold-check','d4'],[42,'seat-the-guests','d4'],[43,'anvil-ratios','d4'],[44,'blockade','d4'],[45,'hidden-stone','d5'],[46,'jump-line','d5'],[47,'hidden-location','d5'],[48,'sequence-keys','d5'],[49,'which-was-said','d5'],[50,'dot-dash-decoder','d6'],[51,'two-ways-to-cube','d6'],[52,'odd-one-out','d7'],[53,'four-shades','d7'],[54,'sprout-lines','d7'],[55,'link-across','d7'],[56,'who-owns-the-zebra','d8'],[57,'seven-pieces','d8'],[58,'blink-stream','d8'],[59,'count-the-passes','d8'],[60,'nine-rings','d9'],[61,'living-stones','d9'],[62,'seed-pits','d9'],[63,'tiger-and-herd','d9'],[64,'endless-rise','e1'],[65,'sixteen-beat-clap','e1'],[66,'shadow-the-voice','e1'],[67,'up-and-down','e1'],[68,'last-letter-chain','e2'],[69,'missing-e','e2'],[70,'word-square','e2'],[71,'shiva-abbreviations','e2'],[72,'six-dot-chord','e3'],[73,'ghana-order','e3'],[74,'retell-chain','e3'],[75,'study-gap-planner','e3'],[76,'temple-circles','e4'],[77,'mirror-lattice','e4'],[78,'block-match','e4'],[79,'silhouette-match','e4'],[80,'dot-loop','e5'],[81,'ring-gate-escape','e5'],[82,'shadow-clock','e5'],[83,'mix-to-target','e5'],[84,'mill-builder','e6'],[85,'stone-trap','e6'],[86,'hidden-rule-sort','e6']]/*END*/;
var PZGEN={},PZRETIRED={};PZTAB.forEach(function(r){PZGEN[r[1]]=1});
var PRESETS=['','a friend','Papa','Mummy','Didi','Bhaiya','Dost','Dadi','Nani','Dada','Nana','Chacha','Mama','Masi','Beta','Everyone'];
var SALT='zest-challenge-v1 public salt, detects corruption only',DAY0=Date.UTC(2026,0,1),LIVE_DAYS=14;
var ZC=G.ZC={PZTAB:PZTAB,PRESETS:PRESETS,SALT:SALT};

/* ---- sha256 + hmac, pure JS and synchronous so it also works on http://localhost and old WebViews. crypto.subtle (async) is only used by ZC.hmacSubtle, which the tests use to cross-check. ---- */
var K=[],H0=[];(function(){var p=2,n=0;while(n<64){var ok=1;for(var i=2;i*i<=p;i++)if(p%i===0){ok=0;break}if(ok){if(n<8)H0[n]=(Math.pow(p,.5)%1)*4294967296|0;K[n]=(Math.pow(p,1/3)%1)*4294967296|0;n++}p++}})();
function sha256(m){var h=H0.slice(),l=m.length,b=m.slice(),i,j;b.push(128);while(b.length%64!==56)b.push(0);var hi=Math.floor(l*8/4294967296),lo=(l*8)>>>0;[hi,lo].forEach(function(v){b.push(v>>>24&255,v>>>16&255,v>>>8&255,v&255)});
  for(i=0;i<b.length;i+=64){var w=[];for(j=0;j<16;j++)w[j]=(b[i+4*j]<<24|b[i+4*j+1]<<16|b[i+4*j+2]<<8|b[i+4*j+3])|0;
    for(j=16;j<64;j++){var a=w[j-15],c=w[j-2],s0=(a>>>7|a<<25)^(a>>>18|a<<14)^(a>>>3),s1=(c>>>17|c<<15)^(c>>>19|c<<13)^(c>>>10);w[j]=(w[j-16]+s0+w[j-7]+s1)|0}
    var A=h[0],B=h[1],C=h[2],D=h[3],E=h[4],F=h[5],Gg=h[6],H=h[7];
    for(j=0;j<64;j++){var S1=(E>>>6|E<<26)^(E>>>11|E<<21)^(E>>>25|E<<7),ch=(E&F)^(~E&Gg),t1=(H+S1+ch+K[j]+w[j])|0,S0=(A>>>2|A<<30)^(A>>>13|A<<19)^(A>>>22|A<<10),mj=(A&B)^(A&C)^(B&C),t2=(S0+mj)|0;H=Gg;Gg=F;F=E;E=(D+t1)|0;D=C;C=B;B=A;A=(t1+t2)|0}
    h=[h[0]+A|0,h[1]+B|0,h[2]+C|0,h[3]+D|0,h[4]+E|0,h[5]+F|0,h[6]+Gg|0,h[7]+H|0]}
  var o=[];h.forEach(function(v){o.push(v>>>24&255,v>>>16&255,v>>>8&255,v&255)});return o}
function strBytes(s){var o=[];for(var i=0;i<s.length;i++)o.push(s.charCodeAt(i)&255);return o}
function hmac(key,msg){var k=key.slice(),i;if(k.length>64)k=sha256(k);while(k.length<64)k.push(0);var ip=[],op=[];for(i=0;i<64;i++){ip.push(k[i]^54);op.push(k[i]^92)}return sha256(op.concat(sha256(ip.concat(msg))))}
ZC.sha256=sha256;ZC.hmac=function(msg){return hmac(strBytes(SALT),msg)};
ZC.hmacSubtle=function(msg){var c=G.crypto&&G.crypto.subtle;if(!c)return Promise.reject(new Error('no subtle'));var k=new Uint8Array(strBytes(SALT));
  return c.importKey('raw',k,{name:'HMAC',hash:'SHA-256'},false,['sign']).then(function(key){return c.sign('HMAC',key,new Uint8Array(msg))}).then(function(r){return Array.prototype.slice.call(new Uint8Array(r))})};

/* ---- base64url, no padding ---- */
var B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function b64e(a){var s='',i;for(i=0;i<a.length;i+=3){var n=a[i]<<16|(a[i+1]||0)<<8|(a[i+2]||0);s+=B64[n>>18&63]+B64[n>>12&63]+(i+1<a.length?B64[n>>6&63]:'')+(i+2<a.length?B64[n&63]:'')}return s}
function b64d(s){if(!/^[A-Za-z0-9_-]+$/.test(s)||s.length%4===1)return null;var o=[],i,b=0,bits=0;for(i=0;i<s.length;i++){b=b<<6|B64.indexOf(s[i]);bits+=6;if(bits>=8){bits-=8;o.push(b>>bits&255);b&=(1<<bits)-1}}return o}
ZC.b64e=b64e;ZC.b64d=b64d;

/* ---- day numbers (days since 2026-01-01, local calendar day) and seeds ---- */
function dayIdx(date){var d=date||new Date();return Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-DAY0)/864e5)}
function dayStr(n){var d=new Date(DAY0+n*864e5);return d.getUTCFullYear()+'-'+('0'+(d.getUTCMonth()+1)).slice(-2)+'-'+('0'+d.getUTCDate()).slice(-2)}
ZC.dayIdx=dayIdx;ZC.dayStr=dayStr;
/* seed number <-> seed tag. 0 is the ladder's own puzzle (empty tag); anything else is base36, so (id, level, g, seed) fully defines the puzzle. */
ZC.seedTag=function(n){return n>0?n.toString(36):''};
ZC.tagSeed=function(t){if(t==='')return 0;if(typeof t!=='string'||!/^[0-9a-z]{1,7}$/.test(t))return null;var n=parseInt(t,36);return n>0&&n<4294967296&&n.toString(36)===t?n:null};
ZC.newSeed=function(){var n=0;try{var a=new Uint32Array(1);G.crypto.getRandomValues(a);n=a[0]}catch(e){n=Math.floor(Math.random()*4294967296)}return n||1};
function byId(id){for(var i=0;i<PZTAB.length;i++)if(PZTAB[i][1]===id)return PZTAB[i];return null}
function byIdx(n){for(var i=0;i<PZTAB.length;i++)if(PZTAB[i][0]===n)return PZTAB[i];return null}
ZC.fileOf=function(id){var r=byId(id);return r?r[2]:null};

/* ---- encode: o {id, level, seed (uint32) | daily:'YYYY-MM-DD', target, hints, r, day, preset}. Returns the token, or null when the input cannot be encoded. ---- */
ZC.encodeChallenge=function(o){try{var row=byId(o&&o.id);if(!row||PZRETIRED[row[1]])return null;var lv=Math.round(+o.level),daily=!!o.daily,seed;if(!(lv>=1&&lv<=255))return null;
  if(daily){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(o.daily);if(!m)return null;seed=Math.round((Date.UTC(+m[1],+m[2]-1,+m[3])-DAY0)/864e5);if(!(seed>=0&&seed<65535))return null}
  else{seed=+o.seed;if(!(seed>=0&&seed<4294967296&&Math.floor(seed)===seed))return null}
  var tg=o.target==null?0:Math.round(+o.target),metric=tg>0?1:0;if(tg<0||tg>999)return null;
  var hints=Math.max(0,Math.min(255,Math.round(+o.hints)||0)),r=Math.max(0,Math.min(255,Math.round(+o.r)||0)),day=o.day!=null?Math.round(+o.day):dayIdx(),pre=Math.round(+o.preset)||0;
  if(!(day>=0&&day<65536)||pre<0||pre>=PRESETS.length)return null;
  var b=[1|(daily?16:0),row[0]>>8&255,row[0]&255,PZGEN[row[1]],lv,seed>>>24&255,seed>>>16&255,seed>>>8&255,seed&255,metric,tg>>8&255,tg&255,hints,r,day>>8&255,day&255,pre];
  return b64e(b.concat(ZC.hmac(b).slice(0,6)))}catch(e){return null}};

/* ---- decode: {ok:false, why} for a link that cannot be used (the app shows 'That puzzle has moved on'), else {ok:true, ...}.
   ctx (all optional): today (day number), levelsOf(id), parOf(id,level,tag), dailyOk(dayStr,id,level).
   A bad check tag or a target below par is not fatal: ok:true with t:null and off:true (play the puzzle without a score).
   More than 14 days after the issue day: old:true (a soft note, still playable). ---- */
ZC.decodeChallenge=function(str,ctx){ctx=ctx||{};try{if(typeof str!=='string'||!str||str.length>64)return {ok:false,why:'shape'};var b=b64d(str);if(!b||b.length!==23)return {ok:false,why:'length'};
  if((b[0]&15)!==1)return {ok:false,why:'version'};var flags=b[0]>>4;if(flags&~1)return {ok:false,why:'flags'};
  var row=byIdx(b[1]<<8|b[2]);if(!row)return {ok:false,why:'unknown puzzle'};if(PZRETIRED[row[1]])return {ok:false,why:'retired'};
  if(b[3]!==PZGEN[row[1]])return {ok:false,why:'generator'};
  var level=b[4],mx=typeof ctx.levelsOf==='function'?ctx.levelsOf(row[1]):255;if(!(level>=1&&level<=(mx||255)))return {ok:false,why:'level'};
  var seed=(b[5]*16777216)+(b[6]<<16|b[7]<<8|b[8]),metric=b[9],target=b[10]<<8|b[11],hints=b[12],r=b[13],day=b[14]<<8|b[15],pre=b[16];if(pre>=PRESETS.length)return {ok:false,why:'preset'};
  if(metric>2)return {ok:false,why:'metric'};
  var daily=!!(flags&1),tag=daily?dayStr(seed):ZC.seedTag(seed),off=false;
  if(daily&&typeof ctx.dailyOk==='function'&&!ctx.dailyOk(tag,row[1],level))return {ok:false,why:'daily'};
  var want=ZC.hmac(b.slice(0,17)).slice(0,6),bad=0;for(var i=0;i<6;i++)bad|=want[i]^b[17+i];if(bad)off=true;
  var t=null;if(metric===1&&!daily){if(target<1||target>999)off=true;else{t=target;var par=typeof ctx.parOf==='function'?ctx.parOf(row[1],level,tag):null;if(par!=null&&target<par)off=true}}
  if(off)t=null;var today=ctx.today!=null?ctx.today:dayIdx();
  return {ok:true,id:row[1],idx:row[0],gen:b[3],level:level,seed:seed,tag:tag,daily:daily,t:t,hints:t==null?0:hints,r:r,day:day,preset:pre,who:pre>0?PRESETS[pre]:'a friend',off:off,old:today>day+LIVE_DAYS,legacy:false}}
  catch(e){return {ok:false,why:'error'}}};

/* ---- the whole query string: a v1 token, or the legacy ?c=<id>&l=&s=&t= links that were already shared (no expiry, no check tag; the puzzle id is checked by the app, not here). null when there is no challenge at all. ---- */
ZC.fromSearch=function(search,ctx){try{var q=new URLSearchParams(search),c=q.get('c');if(c===null)return null;
  if(q.has('l')){var l=q.get('l'),s=q.get('s')||'',tt=q.get('t');if(!/^[A-Za-z0-9_-]{1,40}$/.test(c)||!/^\d{1,3}$/.test(l||'')||!/^[A-Za-z0-9._-]{0,40}$/.test(s))return {ok:false,why:'legacy'};
    var lv=+l,mx=ctx&&typeof ctx.levelsOf==='function'?ctx.levelsOf(c):255;if(lv<1||lv>(mx||255))return {ok:false,why:'level'};
    return {ok:true,id:c,level:lv,tag:s,seed:ZC.tagSeed(s),daily:false,t:/^\d{1,5}$/.test(tt||'')&&+tt>0?+tt:null,hints:0,r:0,day:0,preset:0,who:'a friend',off:false,old:false,legacy:true}}
  return ZC.decodeChallenge(c,ctx)}catch(e){return {ok:false,why:'error'}}};

var BASE='https://orangepulplabs.com/zest/play/';
ZC.base=BASE;ZC.link=function(o){var t=ZC.encodeChallenge(o);return t?BASE+'?c='+t:null};

/* ---- message templates: ONE table. English only, body <= 125 chars once filled in; the caller puts the link on its own line after the body.
   No names, ranks, streaks, countdowns or spoilers. Variables: {name} {lv} {n} (my moves) {prev} {their} {mine} {num} (daily number) {stars} {hh} (hints, honest). Two variants each. ---- */
ZC.TEMPLATES={
  solvedPar:['{name}, level {lv}: solved in {n} moves, the fewest possible. Think you can match it? 🧩','{name}, level {lv}: {n} moves, the shortest there is. Can you match it?'],
  best:['New best on {name} level {lv}: {n} moves, down from {prev}. Your turn?','A new best on {name} level {lv}: {n} moves, down from {prev}. Want a go?'],
  beaten:['Challenge accepted! You got {their}, I got {mine}. Same puzzle, fair fight. Rematch?','Challenge accepted! You got {their}, I got {mine}. Fresh seed, same puzzle. Rematch?'],
  daily:['Zest daily #{num} · {name} · {stars} of 3 stars · {n} moves · {hh}','Zest daily #{num}, {name}: {n} moves, {hh}. Same puzzle for everyone today. How did you do?'],
  stumperSolved:['Took me a while, but I solved {name}, level {lv}. Care to try it? 🧩','{name}, level {lv} took me a while. Fancy a go?'],
  stumperStuck:['Stuck on {name} level {lv}. Fresh eyes? No timer, no pressure.','I am stuck on {name} level {lv}. Can you solve it? No timer, no pressure.'],
  closeLoss:['Your {their} beat my {mine}, so close! Rematch on the same puzzle?','You got {their}, I got {mine}. So close! Rematch on the same puzzle?'],
  tie:['We both got {n} moves. A tie! Tiebreaker on a new level?','A tie at {n} moves each! Tiebreaker on a new level?'],
  threeStars:['{name}, level {lv}: three stars on my first try, {n} moves. Can you? 🧩','Three stars on {name} level {lv}, first try, {n} moves. Your turn?'],
  group:['A quick one for the group: {name}, level {lv}. I got {n} moves. Same puzzle for everyone.','Anyone up for a short puzzle? {name}, level {lv}, I got {n} moves.'],
  nudge:['No rush, a puzzle I liked: {name}, level {lv}. Try it when you have a minute.','A short puzzle if you have a minute: {name}, level {lv}. No timer.']};
ZC.NOTARGET={nudge:1,stumperStuck:1,daily:1};   // kinds whose link carries no score
ZC.hintsTxt=function(h){return h>0?'with '+h+' hint'+(h===1?'':'s'):'no hints'};
ZC.message=function(kind,v,variant){var T=ZC.TEMPLATES[kind];if(!T)return '';var s=T[(variant|0)%T.length];v=Object.assign({},v||{});v.hh=ZC.hintsTxt(v.hints|0);
  if(v.hints>0&&kind!=='daily'&&kind!=='tie'&&kind!=='beaten'&&kind!=='closeLoss')s=s.replace('{n} moves','{n} moves ('+v.hh+')');
  return s.replace(/\{(\w+)\}/g,function(m,k){return v[k]==null?'':String(v[k])})};

/* ---- which single chip (if any) a finished puzzle result shows. s: {moves, par, stars, hints, isBest, plays (earlier plays of this level), friendT, daily, unranked}
   Returns {kind, label} or null. Never without a moves count. Priority: beat a friend, personal best, daily, solved at par, within one of par. ---- */
ZC.chipFor=function(s){if(!s||!(s.moves>0))return null;
  if(s.friendT!=null){if(s.moves<s.friendT)return {kind:'beaten',label:'Send my result back'};if(s.moves===s.friendT+1)return {kind:'closeLoss',label:'Challenge back'};return null}
  if(s.isBest&&s.plays>=3)return {kind:'best',label:'Share this best'};
  if(s.daily&&!s.unranked)return {kind:'daily',label:'Share today\u2019s card'};
  if(s.par!=null&&s.moves<=s.par)return {kind:s.stars>=3&&!s.hints&&s.plays===0?'threeStars':'solvedPar',label:'Share it, it is a neat one'};
  if(s.par!=null&&s.moves===s.par+1)return {kind:'group',label:'Challenge back'};
  return null};

/* ---- guest mode: a friend opening a link with no Zest profile on this browser plays at once and nothing is stored or sent.
   Decided here, before app4b.js boots. localStorage writes go to memory; ZC.endGuest() hands storage back (used by 'Keep playing here'). ---- */
ZC.guest=false;ZC.mem={};
(function(){try{if(typeof location==='undefined'||typeof localStorage==='undefined'||!/[?&]c=/.test(location.search||''))return;var raw=null,d=null;try{raw=localStorage.getItem('zv4')}catch(e){}if(raw){try{d=JSON.parse(raw)}catch(e){}}
  if(d&&d.p&&d.p.done)return;var P=Storage.prototype,s1=P.setItem,r1=P.removeItem,g1=P.getItem,c1=P.clear;ZC.guest=true;
  P.setItem=function(k,v){if(ZC.guest&&this===localStorage){ZC.mem[k]=String(v);return}return s1.apply(this,arguments)};
  P.removeItem=function(k){if(ZC.guest&&this===localStorage){delete ZC.mem[k];return}return r1.apply(this,arguments)};
  P.getItem=function(k){if(ZC.guest&&this===localStorage)return Object.prototype.hasOwnProperty.call(ZC.mem,k)?ZC.mem[k]:null;return g1.apply(this,arguments)};
  P.clear=function(){if(ZC.guest&&this===localStorage){ZC.mem={};return}return c1.apply(this,arguments)};
  ZC.endGuest=function(){ZC.guest=false;ZC.mem={};try{if(typeof STORE!=='undefined')STORE.cache=null}catch(e){}if(document.body)document.body.classList.remove('zg')}}catch(e){}})();
if(!ZC.endGuest)ZC.endGuest=function(){ZC.guest=false};

/* ---- the small stylesheet for the share chip, the share icon and the guest screens (existing CSS variables only) ---- */
if(typeof document!=='undefined'&&document.head){var st=document.createElement('style');st.id='share-css';
  st.textContent='.rtop{display:flex;align-items:center;justify-content:space-between;gap:8px}.shc{margin-top:14px;display:flex;flex-direction:column;align-items:flex-start;gap:6px}.shc .shp{margin:0;font-size:14px;color:var(--muted);max-width:34em}.shc .chrow{display:flex;gap:8px;flex-wrap:wrap}'+
  '.chip.shg{background:transparent;border:1.5px solid var(--line);color:var(--ink)}.zstore{margin-top:16px}.zstore p{margin:0 0 10px}.zstore .row{display:flex;gap:8px;flex-wrap:wrap}.zgt{margin:10px 0 0;font-size:13px;color:var(--muted)}.zgt a{color:inherit}'+
  'body.zg #tabsnav{display:none}body.zg .phone{padding-bottom:0}';
  document.head.appendChild(st);if(ZC.guest&&document.body)document.body.classList.add('zg')}
})(typeof window!=='undefined'?window:globalThis);
