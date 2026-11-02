/* Zest v4 prototype, part A: data, metric, audio, daily set, the five stages. */
var FAST=/[?&]fast/.test(location.search);
function $(id){return document.getElementById(id)}
var scr,phone,hand;
var run={id:0,paused:false,pc:0},onKey=null;   // run.pc is bumped when the player pauses: a trial that straddles a pause counts as an error (see the games)
function pick(a){return a[Math.floor(Math.random()*a.length)]}

/* PURE:BEGIN  No DOM and no storage in here. tests/vectors.json and tests/check_vectors.js run this block on its own,
   and a Dart port can reuse the vectors. Keep it free of anything that touches the page. */
function med(a){if(!a.length)return 0;var s=a.slice().sort(function(x,y){return x-y}),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2}
function mean(a){return a.length?a.reduce(function(x,y){return x+y},0)/a.length:0}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function isNum(x){return typeof x==='number'&&isFinite(x)}   // isFinite(null) and isFinite('5') are true, so check the type too
function xmur3(str){for(var i=0,h=1779033703^str.length;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return function(){h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return (h^=h>>>16)>>>0}}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function seeded(seed){return mulberry32(xmur3('zest|'+seed)())}   // hash-based, so neighbouring seeds (day 1, day 2...) give unrelated streams
function shuffle(a,r){r=r||Math.random;for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function pad2(n){return (n<10?'0':'')+n}
function ds(t){var x=new Date(t);return x.getFullYear()+'-'+pad2(x.getMonth()+1)+'-'+pad2(x.getDate())}   // local day key, written by hand (toLocaleDateString differs between devices)
function dailyPick(day,ids){var s=ids.slice().sort();if(!s.length)return null;return s[Math.floor(seeded('daily|'+day)()*s.length)]}   // same answer on every device for the same day and the same ids
function hzBucket(hz){hz=+hz;if(!isFinite(hz)||hz<=0)return 60;var B=[30,48,50,60,72,75,90,100,120,144,165,180,240],b=60,bd=1e9;B.forEach(function(x){var d=Math.abs(hz-x);if(d<bd){bd=d;b=x}});return b}

/* Form: you against your own start. SCOREVER is stored on every run; runs from an older scoring are left out of Form,
   because a changed penalty moves every score (v2: error penalties raised, Glance on measured milliseconds, medians for Spot it and Pattern). */
var SCOREVER=2,NEED=4,NEEDDAYS=2,PEN_ER=2000,ER_MAX=.15;
function kcorr(v){return clamp(2*clamp(+v/100,0,1)-1,.02,.98)}   // share right on a two-choice question, corrected for guessing: 0 is chance, 1 is perfect
function lg(sg,v){if(!isNum(v))return NaN;return Math.log(sg&&sg.bounded?kcorr(v):Math.max(v,(sg&&sg.floor)||.1))/Math.LN2}
function distinctDays(rs){var s={};rs.forEach(function(r){s[ds(r.t)]=1});return Object.keys(s).length}
function cleanRuns(rs){return rs.filter(function(r){return r&&isNum(r.v)&&isNum(r.t)})}
/* rs: [{v,t}] oldest first. frozen: {value,n,date} or null. today: day key. Ready needs NEED plays on at least NEEDDAYS different days. */
function calcForm(sg,rs,frozen,today){
  rs=cleanRuns(rs);var n=rs.length,days=distinctDays(rs);
  if(n<NEED||days<NEEDDAYS)return {ready:false,n:n,days:days,more:Math.max(NEED-n,days<NEEDDAYS?1:0)};
  var vals=rs.map(function(r){return r.v}),fz=frozen&&isNum(frozen.value)?frozen:null,base=fz?+fz.value:med(vals.slice(1,4)),typ=med(vals.slice(-5)),
    raw=100+50*(sg&&sg.hi?1:-1)*(lg(sg,typ)-lg(sg,base));if(!isFinite(raw))raw=100;
  var k=n-NEED,w=k/(k+3),f=Math.round(clamp(100+w*(raw-100),60,140));
  return {ready:true,n:n,days:days,more:0,f:f,raw:raw,base:base,typ:typ,frozen:!!fz,newBase:fz?null:{value:base,n:3,date:today||ds(rs[n-1].t)}}}
/* The wobble of Form that your own results already produce: from the spread (MAD) of your last results, for a median of five, in Form points. */
function calcNoise(sg,vals){var L=vals.slice(-12).map(function(v){return lg(sg,v)}).filter(isFinite);if(L.length<5)return null;
  var m=med(L),mad=med(L.map(function(x){return Math.abs(x-m)})),band=50*1.4826*mad*1.2533/Math.sqrt(5);return clamp(Math.round(band),2,30)}
/* doms: {id: form|null}. The headline averages all six areas and fills the ones not set up yet with 100, so it does not jump when an area unlocks. */
function calcAll(doms){var ids=Object.keys(doms),vals=ids.map(function(i){return doms[i]}),rdy=vals.filter(function(x){return x!==null&&x!==undefined}).length;
  return {headline:rdy?Math.round(mean(vals.map(function(x){return x===null||x===undefined?100:x}))):null,ready:rdy,total:ids.length,doms:doms}}

/* round validity and estimators */
function vTiming(hits,cnt){return cnt>=3&&hits>=Math.ceil(cnt*6/11)}   // 6 of the 11 scored taps within 350 ms
function vChange(ok,N,full){return N>0&&2*ok/N-1>0&&(!full||ok/N>=.75)}   // above chance after guess correction, and 75% right on a full round
function vSpan(right){return right>=1}   // Sequence: at least one sequence repeated correctly
function vRT(errs,n,got,need){return n>0&&n>=need&&got>=1&&errs/n<=ER_MAX}   // Go or wait: at most 15% errors
function vNback(hits,targets,errs,n){return n>0&&targets>0&&hits/targets>=.5&&errs/n<=ER_MAX}
function vPairs(secs,pairs){return isFinite(secs)&&secs>=pairs*.8&&secs<=900}
function vTrail(done,N,wrong,right){return done>=Math.ceil(N/2)&&wrong<=right}
function spanEst(tr,best){var revs=[];for(var i=1;i<tr.length;i++)if(tr[i].ok!==tr[i-1].ok)revs.push(Math.min(tr[i].len,tr[i-1].len));   // the shorter length of each pair that flipped between right and wrong
  var e=revs.length>=2?mean(revs.slice(-4)):best;return {est:Math.round(clamp(e,1,9)*10)/10,revs:revs.length}}
function glanceEst(revs){return revs.length>=2?Math.round(mean(revs.slice(-6))):null}   // fewer than two turning points: no estimate, the round does not count
function glFrames(nominalMs,frameMs){return Math.max(Math.ceil(16.5/frameMs),Math.round(nominalMs/frameMs))}   // frames for a flash of about nominalMs; never under 16.5 ms
function penScore(rt,er){return rt+PEN_ER*er}
function mkTypes(N,rate,rng){var ns=Math.round((N-1)*rate),nr=N-1-ns,pool,tries=0,bad;
  do{pool=shuffle(Array(ns).fill('switch').concat(Array(nr).fill('rep')),rng);var r1=1;bad=false;for(var q=1;q<pool.length;q++){r1=pool[q]===pool[q-1]?r1+1:1;if(r1>4)bad=true}}while(bad&&++tries<300);return pool}
function mkCong(types,rng){var out=[],ix={switch:[],rep:[]};types.forEach(function(ty,i){if(ty!=='first')ix[ty].push(i)});   // true = incongruent; exactly half (rounded up) in each trial type
  ['switch','rep'].forEach(function(ty){var g=ix[ty],a=[];for(var i=0;i<g.length;i++)a.push(i<Math.ceil(g.length/2));shuffle(a,rng);g.forEach(function(x,j){out[x]=a[j]})});out[0]=rng()<.5;return out}
function mkSeq(n,nogo,rng){var ng=Math.round(n*nogo),seq,tries=0,bad;   // 1 go, 0 no-go; never more than two no-go in a row
  do{seq=shuffle(Array(n-ng).fill(1).concat(Array(ng).fill(0)),rng);var r2=0;bad=false;seq.forEach(function(x,i){r2=!x?r2+1:0;if(r2>2)bad=true})}while(bad&&++tries<400);return seq}
/* options for a multiple-choice answer: wrong answers are typical slips, the right one lands at a random rank among the options,
   and the parity pattern (all alike / right one odd / mixed) is random, so neither "the middle number" nor "the odd one" gives it away */
function distract(ans,cands,nd,rng,minV){rng=rng||Math.random;minV=minV==null?0:minV;
  var rank=Math.floor(rng()*(nd+1)),pr=rng(),prof=pr<.4?0:pr<.6?1:2,mixed=[],out=[],used={};used[ans]=1;   // parity: 40% all alike, 20% right one odd, 40% mixed, so an odd-one-out is the right answer only a third of the time
  if(prof===2){for(var q=0;q<nd;q++)mixed.push(rng()<.5?0:1);if(nd>1&&mixed.every(function(x){return x===mixed[0]}))mixed[Math.floor(rng()*nd)]^=1}
  var ok=cands.filter(function(v){return isFinite(v)&&v>=minV&&v!==ans});
  function match(v,d,c){return !used[v]&&(d===null||(v>ans)===d)&&(c===null||((Math.abs(v-ans)%2)===c))}
  for(var i=0;i<nd;i++){var up=i>=rank,cls=prof===0?0:prof===1?1:mixed[i],pool=ok.filter(function(v){return match(v,up,cls)});
    if(!pool.length)pool=ok.filter(function(v){return match(v,up,null)});if(!pool.length)pool=ok.filter(function(v){return match(v,null,null)});
    var v;if(pool.length)v=pool[Math.floor(rng()*pool.length)];
    else{for(var s=1;s<60&&v===undefined;s++){var w=ans+(up?s:-s);if(!used[w]&&w>=minV)v=w}for(s=1;v===undefined;s++){if(!used[ans+s])v=ans+s}}
    used[v]=1;out.push(v)}
  return out}
function mathCands(a,b,op,ans){var c=[];[1,2,3,9,10,11,20].forEach(function(d){c.push(ans+d,ans-d)});
  if(op==='+')c.push(Math.abs(a-b));else if(op==='−')c.push(a+b);else{c.push(ans+a,ans-a,ans+b,ans-b,a+b)}return c}
/* board layouts: a grid with a small jitter, one item per cell, so items never overlap and the number that fits is known in advance */
function gridCols(W,pitch){return Math.max(1,Math.floor(W/pitch))}
function gridCap(W,H,pitch){return gridCols(W,pitch)*Math.max(1,Math.floor(H/pitch))}
function gridPlace(n,W,H,pitch,rng){rng=rng||Math.random;var cols=gridCols(W,pitch),rows=Math.max(1,Math.floor(H/pitch)),cap=cols*rows;n=Math.min(n,cap);
  var cells=[];for(var i=0;i<cap;i++)cells.push(i);shuffle(cells,rng);var cw=W/cols,chh=H/rows,sx=cw-pitch,sy=chh-pitch,pts=[];
  for(i=0;i<n;i++){var c=cells[i];pts.push([(c%cols)*cw+(sx>0?rng()*sx:0),Math.floor(c/cols)*chh+(sy>0?rng()*sy:0)])}return pts}
function trailLayout(count,W,H,pitch,variant){return gridPlace(count,W,H,pitch,seeded('trail|'+count+'|'+(variant%6)))}   // a bank of six fixed layouts per count, scaled to the board
/* PURE:END */

/* ---------- time ---------- */
function todayStr(){return ds(Date.now())}
function dayNum(){var n=new Date();return Math.floor((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())-Date.UTC(2026,0,1))/864e5)+1}
function newRun(){run.id++;run.paused=false;onKey=null;hideHand();return run.id}
function wait(ms){var id=run.id;return new Promise(function(r){setTimeout(function chk(){if(id!==run.id)return;if(run.paused){setTimeout(chk,100);return}r()},FAST?ms/4:ms)})}
function rAF(){return new Promise(function(r){requestAnimationFrame(r)})}   // resolves with the frame's timestamp
function atFrame(fn){return new Promise(function(r){requestAnimationFrame(function(ts){fn();r(ts)})})}   // runs fn inside a frame and resolves with that frame's rAF timestamp: the start time for a reaction
function paint(){return rAF().then(rAF)}   // kept for old callers: the timestamp two frames on
/* Shows something for exactly k painted frames. add() runs in one frame and rem() k frames later, so even k=1 is on screen for a whole frame.
   Resolves {t0,t1,frames,ms}: the rAF timestamps of both frames and the measured length. */
function showFor(k,add,rem){return new Promise(function(r){requestAnimationFrame(function(t0){add();var c=0;requestAnimationFrame(function f(ts){if(++c>=k){rem();r({t0:t0,t1:ts,frames:k,ms:ts-t0})}else requestAnimationFrame(f)})})})}
var FRAME={ms:1000/60,hz:60,ok:false},framePromise=null;
/* the real refresh interval, measured once per session: the median of about 30 rAF gaps, accepted only between 8 and 34 ms */
function measureFrame(){if(framePromise)return framePromise;
  framePromise=new Promise(function(res){var ts=[],done=false;function fin(){if(done)return;done=true;var d=[];for(var i=1;i<ts.length;i++)d.push(ts[i]-ts[i-1]);var m=d.length>=10?med(d):0;if(m>=8&&m<=34){FRAME.ms=m;FRAME.hz=Math.round(1000/m*10)/10;FRAME.ok=true}res(FRAME)}
    requestAnimationFrame(function f(t){ts.push(t);if(ts.length<32)requestAnimationFrame(f);else fin()});setTimeout(fin,2500)});
  return framePromise}

/* ---------- storage ---------- */
/* One parsed copy lives in memory (STORE.cache). sv() writes it through. Other code that writes localStorage 'zv4' directly (the tests, seedDemo, reset)
   is noticed by wrapping Storage.prototype, and by the 'storage' event for other tabs, and the next db() reads it again. */
var STORE={cache:null,saves:0,prevOK:false,setv:undefined,fail:false,hooked:false};
(function(){try{if(typeof Storage==='undefined'||!Storage.prototype)return;var P=Storage.prototype,s0=P.setItem,r0=P.removeItem,c0=P.clear;
  P.setItem=function(k){if(k==='zv4')STORE.cache=null;return s0.apply(this,arguments)};
  P.removeItem=function(k){if(k==='zv4')STORE.cache=null;return r0.apply(this,arguments)};
  P.clear=function(){STORE.cache=null;return c0.apply(this,arguments)};STORE.hooked=true}catch(e){}
  try{window.addEventListener('storage',function(e){if(!e.key||e.key==='zv4')STORE.cache=null})}catch(e){}})();
function zfire(name,detail){try{window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}))}catch(e){}}
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
function lsDel(k){try{localStorage.removeItem(k)}catch(e){}}
function normDb(d){d.p=d.p||null;if(!Array.isArray(d.runs))d.runs=[];['ci','set','done','seen','st'].forEach(function(k){if(!d[k]||typeof d[k]!=='object'||Array.isArray(d[k]))d[k]={}});
  var s=d.st;if(s.music==null)s.music=1;if(s.sfx==null)s.sfx=1;if(s.mround==null)s.mround=0;if(s.hap==null)s.hap=1;if(s.rm==null)s.rm=0;if(s.rx==null)s.rx=0;if(s.aud==null)s.aud=0;if(s.usage==null)s.usage=1;
  return d}
function db(){if(STORE.cache)return STORE.cache;var raw=lsGet('zv4'),d;
  if(raw===null){lsDel('zv4.bak');lsDel('zv4.corrupt');lsDel('zv4.corrupt2');d={};STORE.prevOK=false}   // nothing stored (first run, or a reset): no leftovers either
  else{try{d=JSON.parse(raw)}catch(e){d=undefined}
    if(!d||typeof d!=='object'||Array.isArray(d)){   // damaged: keep it, never write over it, fall back to the last good backup or start fresh
      if(lsGet('zv4.corrupt')===null)lsSet('zv4.corrupt',raw);else lsSet('zv4.corrupt2',raw);
      var b=lsGet('zv4.bak'),bd;try{bd=JSON.parse(b)}catch(e){bd=undefined}
      if(bd&&typeof bd==='object'&&!Array.isArray(bd)){d=bd;zfire('zst:recovered',{from:'backup'})}else{d={};zfire('zst:recovered',{from:'none'})}
      STORE.prevOK=false}
    else STORE.prevOK=true}
  d=normDb(d);
  if(!d.zver){d.runs.forEach(function(r){if(r&&r.scoreVer==null)r.scoreVer=0});d.zver=SCOREVER}   // a blob from before scoreVer existed: its runs are marked old once, so Form leaves them out
  STORE.setv=d.setv;STORE.cache=d;return d}
/* Saves. Returns true, or false when the browser refused (quota, private mode): then window.zstSaveFailed is true and 'zst:savefail' fires so the UI can say so.
   A copy of the previous good blob goes to 'zv4.bak' on every 10th save and before a version bump (d.setv changes). */
function sv(d){if(!d||typeof d!=='object')d=db();
  try{normDb(d);if(d.zver)d.runs.slice(-3).forEach(function(r){if(r&&r.scoreVer==null)r.scoreVer=SCOREVER});   // until app4b stamps runs itself (runRecord), new runs get the current version
    d.zver=SCOREVER;var raw=JSON.stringify(d),prev=STORE.prevOK?lsGet('zv4'):null;STORE.saves++;
    if(prev&&(STORE.saves%10===1||(STORE.setv!==undefined&&d.setv!==STORE.setv)))lsSet('zv4.bak',prev);
    localStorage.setItem('zv4',raw);STORE.cache=d;STORE.setv=d.setv;STORE.prevOK=true;
    if(STORE.fail){STORE.fail=false;window.zstSaveFailed=false;zfire('zst:saveok')}return true}
  catch(e){STORE.cache=d;if(!STORE.fail){STORE.fail=true;window.zstSaveFailed=true}zfire('zst:savefail',{message:String(e&&e.message||e)});return false}}
function ST_(){return db().st}
function curPace(){return ST_().rx?'rx':'u'}   // which series the player is in right now: usual or relaxed pace
function reduced(){var s=ST_();return !!s.rm||!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function K_(o){return o&&o.rx?1.5:1}   // relaxed pace stretches every deadline, gap and flash by this factor in every game
/* ---------- icons ---------- */
var IC={attention:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',control:'<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',flex:'<path d="M17 3l4 4-4 4M21 7H8M7 21l-4-4 4-4M3 17h13"/>',memory:'<circle cx="6" cy="6" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="18" cy="12" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',timing:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/>',speed:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 switch:'<path d="M17 3l4 4-4 4M21 7H8M7 21l-4-4 4-4M3 17h13"/>',hold:'<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',space:'<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 22V12M3 7l9 5 9-5"/>',
 aim:'<circle cx="12" cy="12" r="8"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',today:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
 lib:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 prog:'<path d="M3 20h18M6 16v-5M11 16V6M16 16v-8M21 16V10"/>',set:'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
 check:'<path d="M5 12l5 5 9-10"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',musicoff:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/><path d="M3 3l18 18"/>',
 back:'<path d="M15 5l-7 7 7 7"/>',colour:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',shape:'<rect x="4" y="4" width="16" height="16" rx="2"/>'};
function ico(n,c){return '<svg class="i'+(c?' '+c:'')+'" viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>'}

/* ---------- stages and challenges ---------- */
/* a11y:'visual' marks a game that cannot be played without seeing the screen (the daily set can leave it out for a screen-reader user).
   aud:1 marks a game with an audio alternative (setting st.aud): Go or wait plays two tones, Sequence plays a pitch per block. */
var STG=[
 {id:'timing',name:'Timing',label:'Timing',skill:'Tapping at the right moment',unit:'ms',what:'Tap the moment the dot reaches the line.',scored:'The typical gap between your tap and the line, in milliseconds. Early and late both count. Lower is better.',n:12,np:3,col:'--c-timing'},
 {id:'speed',name:'Glance',label:'Glance',skill:'Spotting a quick flash',unit:'ms',what:'Keep your eyes on the middle dot. A dot flashes in the ring. Tap where it was.',scored:'The shortest flash you could still read, in milliseconds, measured on your own screen. It shortens after every four right answers. Lower is better.',n:40,np:3,col:'--c-speed',a11y:'visual'},
 {id:'switch',name:'Switch',label:'Switching',skill:'Following a changing rule',unit:'ms',what:'Follow the word on top: COLOUR or SHAPE. The rule changes without warning.',scored:'Your average time per answer. A wrong or missed answer counts as 2 seconds. Lower is better.',n:24,np:4,col:'--c-switch'},
 {id:'hold',name:'Hold',label:'Go or wait',skill:'Tapping only when it counts',unit:'ms',what:'Tap the orange disc. Do not tap the square.',scored:'Your typical reaction time, plus a penalty for every wrong, early or missed tap. Lower is better.',n:48,np:8,col:'--c-hold',aud:1},
 {id:'space',name:'Space',label:'Rotate',skill:'Turning shapes in your head',unit:'s',what:'One shape is shown. Pick the one that is the same shape, just turned. The other is a mirror image.',scored:'Seconds per shape. A wrong or missed answer counts as 8 seconds. Lower is better.',n:12,np:3,col:'--c-space',a11y:'visual'}];
function stage(id){return STG.filter(function(s){return s.id===id})[0]}
function visualOnly(sid){var s=stage(sid);return !!(s&&s.a11y==='visual')}
/* Challenge list. app4c rebuilds this in full when it loads (it clears and refills it), so the list is empty here. */
var CH=[];
function ch(id){return CH.filter(function(c){return c.id===id})[0]}
var GOALS=[
 {id:'react',name:'Quick-tap games',sub:'Timing, trails and quick sums',stages:['timing','speed']},
 {id:'focus',name:'Spotting games',sub:'Find it fast, ignore the rest',stages:['hold','speed']},
 {id:'control',name:'Hold-back games',sub:'Tap only when it counts',stages:['hold','switch']},
 {id:'switch',name:'Switching games',sub:'The rules keep changing',stages:['switch']},
 {id:'visual',name:'Shape and number games',sub:'Turn shapes, find patterns',stages:['space','speed']},
 {id:'fun',name:'A bit of everything',sub:'Surprise me',stages:[]}];
var AGES=['13 to 17','18 to 24','25 to 34','35 to 44','45 to 54','55 and over'];

/* ---------- Form: you against your own start ---------- */
/* Usual pace and relaxed pace are separate series ('u' and 'rx'): the functions below take an optional pace and default to usual.
   Display code should pass curPace() so a player on Relaxed pace sees their own Relaxed form; ranking code must keep the default. */
function byTime(a){var s=true;for(var i=1;i<a.length;i++)if(a[i].t<a[i-1].t){s=false;break}return s?a:a.map(function(x,i){return [x,i]}).sort(function(p,q){return p[0].t-q[0].t||p[1]-q[1]}).map(function(p){return p[0]})}
function okRun(r,pace){return !!r&&!r.flag&&!r.ast&&isNum(r.v)&&(r.scoreVer||0)>=SCOREVER&&!!r.rx===(pace==='rx')}
function stdRuns(s,pace){pace=pace||'u';var a=byTime(db().runs.filter(function(r){return r.s===s&&r.std&&okRun(r,pace)}));
  if(s==='speed'&&a.length){var hb=hzBucket(a[a.length-1].hz);a=a.filter(function(r){return hzBucket(r.hz)===hb})}   // Glance: a screen with another refresh rate is a separate series; the newest one counts
  return a}
function baseKey(s,pace,rs){return s+'|'+pace+(s==='speed'&&rs.length?'|'+hzBucket(rs[rs.length-1].hz):'')}
/* {ready,n,days,more}, and when ready {f,base,typ,raw,frozen}. The start is frozen into the profile (d.p.base[key]={value,n,date}) the first time it is ready,
   so trimming old runs from the synced snapshot never moves it. 'more' is how many plays are still needed (at least 1 while a second day is missing). */
function formS(s,pace){pace=pace||'u';var d=db(),rs=stdRuns(s,pace),key=baseKey(s,pace,rs),fz=d.p&&d.p.base?d.p.base[key]:null,
  r=calcForm(stage(s),rs.map(function(x){return {v:x.v,t:x.t}}),fz,todayStr());
  if(r.ready&&r.newBase&&d.p){d.p.base=d.p.base||{};d.p.base[key]=r.newBase;sv(d)}
  r.pace=pace;return r}
function formNoise(s,pace){return calcNoise(stage(s),stdRuns(s,pace||'u').map(function(r){return r.v}))}   // Form points of wobble from your own results (null until five plays); a change smaller than this may be chance
function formD(did,pace){var a=STG.filter(function(s){return s.dom===did}).map(function(s){return formS(s.id,pace)}).filter(function(x){return x.ready});return a.length?Math.round(mean(a.map(function(x){return x.f}))):null}
function formAllDetail(pace){var m={};DOMS.forEach(function(d){m[d.id]=formD(d.id,pace)});return calcAll(m)}   // {headline,ready,total,doms:{id:form|null}}
function formAll(pace){return formAllDetail(pace).headline}   // average of all six areas, an area not set up yet counting as 100; null while none is ready
function domReady(pace){return formAllDetail(pace).ready}
function calibDone(){return domReady()}
function runsOf(c,pace){pace=pace||curPace();return db().runs.filter(function(r){return r.c===c&&okRun(r,pace)}).map(function(r){return r.v})}   // usual and best never mix paces
function lastAt(s){var r=db().runs.filter(function(x){return x.s===s});return r.length?r[r.length-1].t:0}
function isBestSoFar(sid,v,prior){if(!prior||!prior.length||!isNum(v))return false;var sg=stage(sid);return sg&&sg.hi?v>Math.max.apply(null,prior):v<Math.min.apply(null,prior)}   // strictly better: a tie is not a new best
/* the record app4b should push for a finished round (see the report): includes scoreVer, the refresh rate for Glance and the assisted count */
function runRecord(cid,res){var c=ch(cid),r={c:cid,s:c.stage,v:res.score,t:Date.now(),std:!!c.std&&!!res.valid,rx:!!ST_().rx,flag:!res.valid,scoreVer:SCOREVER};if(res.hz)r.hz=res.hz;if(res.ast)r.ast=res.ast;return r}
/* daily set helpers for app4b.getSet */
function dailyPool(){return CH.filter(function(c){return c.std&&!c.daily&&(typeof isKept!=='function'||isKept(c.stage))}).map(function(c){return c.id}).sort()}   // the standard version of each kept game (each has a story page); the daily itself is drawn from these plus all puzzles (see cotd in app4d)
function dailyFallback(day){var id=dailyPick(day,dailyPool());return id?ch(id):null}
function cmpId(a,b){return a.id<b.id?-1:a.id>b.id?1:0}
function sortBy(a,cmp){return a.slice().sort(function(x,y){return cmp(x,y)||cmpId(x,y)})}   // sort with a tie-break on id, so every device orders ties the same way
/* ---------- audio: calm music, quiet sound effects ---------- */
var AC=window.AudioContext||window.webkitAudioContext,ac=null,sg,mb,mus,mel,echo,nbuf,timer=0,nextT=0,step=0,crackle=null;
function audio(){if(!AC)return null;if(!ac){ac=new AC();var mg=ac.createGain();mg.gain.value=.9;mg.connect(ac.destination);sg=ac.createGain();sg.gain.value=.5;sg.connect(mg);mb=ac.createGain();mb.gain.value=0;mb.connect(mg);
  mus=ac.createBiquadFilter();mus.type='lowpass';mus.frequency.value=2800;mus.connect(mb);echo=ac.createDelay(1);echo.delayTime.value=.44;var fb=ac.createGain(),dl=ac.createBiquadFilter();fb.gain.value=.33;dl.type='lowpass';dl.frequency.value=1700;
  echo.connect(dl);dl.connect(fb);fb.connect(echo);dl.connect(mus);mel=ac.createGain();mel.connect(mus);mel.connect(echo);nbuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);var dd=nbuf.getChannelData(0);for(var i=0;i<dd.length;i++)dd[i]=Math.random()*2-1}
  if(ac.state==='suspended')ac.resume();return ac}
function tone(t,f,dur,type,vol,dest,att){var o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+(att||.01));g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.05)}
function noise(t,dur,type,f,vol,dest){var s=ac.createBufferSource();s.buffer=nbuf;s.loop=true;var fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;var g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(dest);s.start(t);s.stop(t+dur+.05)}
var MCH=[{r:36,n:[60,64,67,71]},{r:33,n:[57,60,64,67]},{r:38,n:[57,62,65,69]},{r:31,n:[59,62,65,67]}],PENT=[72,74,76,79,81,84];
function mtof(m){return 440*Math.pow(2,(m-69)/12)}
function beat(sn,t){var c=MCH[Math.floor(sn/8)%4],b=sn%8;
  if(b===0){c.n.forEach(function(m,i){tone(t+i*.028,mtof(m),2.7,'triangle',.1,mus,.03);tone(t+i*.028,mtof(m)*2.003,1.6,'sine',.025,mus,.03)});tone(t,mtof(c.r),1.1,'sine',.34,mus,.02)}
  if(b===4)tone(t,mtof(c.r+7),.8,'sine',.2,mus,.02);
  if(b===0||b===5){var o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.0001,t+.2);o.connect(g);g.connect(mus);o.start(t);o.stop(t+.25)}
  if(b===2||b===6)noise(t,.12,'bandpass',1700,.14,mus);noise(t,.04,'highpass',7000,b%2?.03:.05,mus);
  if(b%2===0&&Math.random()<.3)tone(t,mtof(PENT[Math.floor(Math.random()*PENT.length)]),1,'sine',.07,mel,.01)}
function beatPads(sn,t){var c=MCH[Math.floor(sn/8)%4],b=sn%8;
  if(b===0){c.n.forEach(function(m,i){tone(t+i*.15,mtof(m),7,'sine',.09,mus,1.6);tone(t+i*.15,mtof(m)*1.002,7,'triangle',.03,mus,2)});tone(t,mtof(c.r),7.5,'sine',.3,mus,1.2)}
  if(b===4&&Math.random()<.6)tone(t,mtof(PENT[Math.floor(Math.random()*PENT.length)]-12),2.5,'sine',.05,mel,.4)}
function beatPiano(sn,t){var c=MCH[Math.floor(sn/8)%4],b=sn%8,n=c.n,pat=[0,2,1,3,2,1,3,2],m=n[pat[b]]+(b===7?12:0);
  tone(t,mtof(m),1.8,'triangle',.11,mel,.004);tone(t,mtof(m)*2,.9,'sine',.025,mel,.004);if(b===0)tone(t,mtof(c.r),2.4,'sine',.3,mus,.02);
  if(b===4&&Math.random()<.5)tone(t+.02,mtof(n[3]+12),1.2,'sine',.05,mel,.01)}
function beatRain(sn,t){noise(t,1.6,'bandpass',2400,.025,mus);if(sn%16===0)[0,7,12].forEach(function(x,i){tone(t+i*.4,mtof(36+x),9,'sine',.06,mus,2.5)})}
var BEATS={lofi:beat,pads:beatPads,piano:beatPiano,rain:beatRain},EIGHTH={lofi:60/72/2,pads:60/50/2,piano:60/66/2,rain:1.5},MUSIC_STYLES=[['lofi','Lo-fi'],['pads','Soft pads'],['piano','Piano'],['rain','Rain']],playing='';
function sched(){var e=EIGHTH[playing],fn=BEATS[playing];while(nextT<ac.currentTime+.45){fn(step%32,nextT+(playing==='lofi'&&step%2?.045:0));nextT+=e;step++}}
function mvol(){var v=ST_().mvol;return v==null?.55:v}
function musicStart(){if(!audio()||timer)return;playing=ST_().mstyle||'lofi';if(!BEATS[playing])playing='lofi';nextT=ac.currentTime+.1;step=0;mb.gain.cancelScheduledValues(ac.currentTime);mb.gain.setValueAtTime(mb.gain.value,ac.currentTime);mb.gain.linearRampToValueAtTime(mvol(),ac.currentTime+1.5);
  var s=ac.createBufferSource();s.buffer=nbuf;s.loop=true;var hp=ac.createBiquadFilter(),g=ac.createGain();if(playing==='rain'){hp.type='bandpass';hp.frequency.value=1800;g.gain.value=.05}else{hp.type='highpass';hp.frequency.value=3500;g.gain.value=playing==='lofi'?.01:0}s.connect(hp);hp.connect(g);g.connect(mb);s.start();crackle=s;timer=setInterval(sched,120)}
function musicStop(){if(!timer)return;clearInterval(timer);timer=0;mb.gain.cancelScheduledValues(ac.currentTime);mb.gain.setValueAtTime(mb.gain.value,ac.currentTime);mb.gain.linearRampToValueAtTime(0,ac.currentTime+.5);var c=crackle;crackle=null;setTimeout(function(){try{c.stop()}catch(e){}},700)}
var inRound=false,gestured=false;
function musicSync(){var s=ST_();var want=s.music&&gestured&&(!inRound||s.mround);if(want&&timer&&playing!==(s.mstyle||'lofi')){musicStop();setTimeout(musicSync,700);return}if(want&&timer&&ac){mb.gain.cancelScheduledValues(ac.currentTime);mb.gain.setTargetAtTime(mvol(),ac.currentTime,.3)}if(want)musicStart();else musicStop()}
document.addEventListener('pointerdown',function(){if(!gestured){gestured=true;musicSync()}},true);
document.addEventListener('visibilitychange',function(){if(document.hidden){if(ac&&ac.state==='running')ac.suspend();if(window.__interrupt)window.__interrupt()}else if(ac&&gestured)ac.resume()});

/* ---------- sound: calm music (above), quiet sound effects ---------- */
/* The wrong-answer tone sits at 392 Hz with a harmonic so a phone speaker can play it; buzzes are 20 to 30 ms so they are felt. */
/* The palette lives in delight.js (ZD.sound, ZD.haptic). Old names map onto it: ok, bad (a soft 'mm', never a buzzer), go (a tick), done (the round arpeggio). */
var SFXMAP={ok:['ok','ok'],bad:['soft','soft'],soft:['soft','soft'],go:['tick',null],tick:['tick',null],tap:['tap','tap'],done:['round','round'],round:['round','round'],best:['best','best'],daily:['daily','best'],swish:['swish',null]};
function sfx(n){var m=SFXMAP[n]||SFXMAP.ok;if(typeof ZD==='undefined')return;ZD.sound(m[0]);if(m[1])ZD.haptic(m[1])}
/* a right answer: pop on the target, bell and a short buzz. A miss: a 2 px wobble, amber tint, soft 'mm' and one tick. */
function okFx(el){sfx('ok');if(typeof ZD!=='undefined')ZD.pop(el||$('fb'),'ok')}
function missFx(el){sfx('bad');if(typeof ZD!=='undefined')ZD.miss(el||$('fb'))}
/* tones for the audio alternative (st.aud). They play whatever the sound-effects switch says, because here the sound is the game */
function cueTone(f,dur){if(!gestured||!audio())return;tone(ac.currentTime+.005,f,dur||.25,'sine',.5,sg,.004)}
function audOn(){return !!ST_().aud}

/* ---------- ghost hand ---------- */
function hideHand(){if(hand)hand.style.opacity=0}
function handAt(el,fy){var p=phone.getBoundingClientRect(),r=el.getBoundingClientRect();hand.style.opacity=1;hand.style.transform='translate('+(r.left-p.left+r.width/2-18)+'px,'+(r.top-p.top+r.height*(fy==null?.5:fy)-4)+'px)'}
function handTap(){hand.classList.remove('tap');void hand.offsetWidth;hand.classList.add('tap')}
function handPark(){hand.style.opacity=1;hand.style.transform='translate(300px,640px)'}
function cap(t,mode){var c=$('cap');if(c){c.className='cap'+(mode?' '+mode:'');c.textContent=t}}
function prog(i,N){var b=$('pgb'),l=$('hl');if(b)b.style.width=(N?i/N*100:0)+'%';if(l)l.textContent=N?i+'/'+N:''}
function shell(){return '<div class="top"><button class="ibtn" id="xb" aria-label="Leave this round">'+ico('x')+'</button><div class="pg"><i id="pgb"></i></div><span class="num" id="hl"></span></div><div class="cap" id="cap" role="status" aria-live="polite"></div><div id="play"></div>'}

/* ---------- feedback and input shared by the games ---------- */
var FBMS=450,fbAt=0,GLY={ok:'✓',bad:'○',warn:'○'},SR='position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0';
var FB='<div class="fb" id="fb" role="status" aria-live="polite" aria-atomic="true"></div>',SRL='<div id="srl" role="status" aria-live="polite" style="'+SR+'"></div>';
function escH(t){return String(t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
/* Feedback is words plus a glyph, never colour or sound alone, and stays up for FBMS (fbWait() holds the next trial until it has). */
/* a miss reads 'Almost', never 'Missed' or 'Too slow', and has no exclamation mark and no red: class 'soft' is a warm amber */
function softCopy(t){t=String(t||'');if(/^Paused/.test(t))return t;if(/^(Missed|Not that one|Too slow)\.?$/.test(t))return 'Almost';if(/^Too slow\. /.test(t))return 'Almost. '+t.slice(10);if(/^Not quite\. /.test(t))return 'Almost. '+t.slice(11);return t?'Almost. '+t:t}
function fbSet(t,cls){var f=$('fb');if(!f)return;if(!f.getAttribute('role')){f.setAttribute('role','status');f.setAttribute('aria-live','polite')}
  if(cls==='bad'||(cls==='warn'&&/^(Missed|Too slow)$/.test(t||''))){cls='soft';t=softCopy(t)}
  f.className='fb'+(cls?' '+cls:'');f.innerHTML=(t&&cls&&GLY[cls]?'<span aria-hidden="true">'+GLY[cls]+'</span> ':'')+escH(t||'');if(t)fbAt=performance.now()}
async function fbWait(){var r=FBMS-(performance.now()-fbAt);if(r>0)await wait(r)}
function sr(t){var e=$('srl');if(e)e.textContent=t||''}
function hit(ev){return (ev&&ev.timeStamp)||performance.now()}
/* Taps. pointerdown carries a real hardware timestamp, so it is used for timing. A click with no pointerdown before it comes from the keyboard or from an
   assistive action (TalkBack and similar), whose timestamp means nothing: it still answers, but fn gets ast:true and the game leaves that trial out of the timing score.
   A click right after a pointerdown (or after a Space/Enter the game handled) is the same tap and is ignored. */
var keyAt=0;
function onTap(el,fn){if(!el)return;el._tf=fn;if(el._tw)return;el._tw=1;var pd=0;
  el.addEventListener('pointerdown',function(ev){if(ev.button>0)return;pd=performance.now();ev.preventDefault();if(el._tf)el._tf({ts:ev.timeStamp||performance.now(),ast:false,ev:ev})});
  el.addEventListener('pointercancel',function(){pd=0});
  el.addEventListener('click',function(ev){ev.preventDefault();var n=performance.now();if(pd&&n-pd<2500){pd=0;return}if(keyAt&&n-keyAt<500)return;pd=0;if(el._tf)el._tf({ts:n,ast:true,ev:ev})})}
/* one keydown listener for every game's onKey handler (Space, Enter, arrows, 1 to 9). A handler that uses the key calls preventDefault. */
document.addEventListener('keydown',function(e){if(!onKey||e.repeat||e.ctrlKey||e.metaKey||e.altKey||run.paused)return;var tn=e.target&&e.target.tagName;if(tn==='INPUT'||tn==='TEXTAREA'||tn==='SELECT')return;
  onKey(e);if(e.defaultPrevented)keyAt=performance.now()},true);
function isGo(e){return e.code==='Space'||e.key==='Enter'||e.key===' '}
/* a missed or correct target shown with a static outline and a word, so it does not depend on motion or colour */
function flagTarget(host,el,label){el.style.outline='3px solid var(--ink)';el.style.outlineOffset='3px';
  var h=host.getBoundingClientRect(),r=el.getBoundingClientRect(),s=document.createElement('span');s.textContent=label;s.className='flab';s.setAttribute('aria-hidden','true');
  s.style.cssText='position:absolute;transform:translateX(-50%);z-index:3;pointer-events:none;white-space:nowrap;font:700 12px var(--font);background:var(--ink);color:var(--bg);padding:2px 7px;border-radius:6px;left:'+(r.left-h.left+r.width/2)+'px;top:'+(r.bottom-h.top+6)+'px';host.appendChild(s);return s}

/* ---------- games must never leave a blank screen ---------- */
function gameFail(e){try{console.error(e)}catch(_){}
  try{newRun();var h='<div class="res"><span class="pill" style="align-self:flex-start">Zest</span><div class="bigv" style="font-size:30px;line-height:1.15">Something went wrong</div><p class="sm" style="margin-top:8px">This round could not continue and was not saved. Your other results are safe.</p><div class="dock"><button class="zbtn pri wide" id="errb">Back</button></div></div>';
    if(typeof show==='function')show(h,true);else if(scr)scr.innerHTML=h;
    var b=$('errb');if(b)b.onclick=function(){try{CTX=null}catch(_){}if(typeof home==='function')home()}}catch(_){}}
/* wraps an async game (or any async step): an exception shows an error result with a Back button and resolves null, which play() already treats as "round abandoned" */
function safeGame(fn){return async function(){try{return await fn.apply(this,arguments)}catch(e){gameFail(e);return null}}}

/* ================= stages =================
   o = {auto, practice, n, mods, rx}. They resolve to {score, valid, chips[], tip} (lower score is better) or null.
   Rules every game follows:
   - A reaction starts at the rAF timestamp of the frame that showed the stimulus (atFrame/showFor), and ends at the event's own timestamp.
   - A trial that straddles a pause (run.pc changed) is dropped from the clock but counts as an error with the full penalty, so pausing never helps.
   - A tap that arrives as a click with no pointerdown (keyboard, TalkBack) is 'assisted': it answers the trial, but the trial is left out of the timing score.
   - o.rx (Relaxed pace) multiplies every deadline, gap and flash by 1.5 (K_). Relaxed runs are their own series.
   - Feedback is words plus a glyph and stays for at least FBMS. */
var GAMES={};

GAMES.timing=async function(o){
  var t=run.id,K=K_(o),N=o.auto?1:o.n,m=o.mods||{},P=$('play'),rec=[],ast=0,mode=o.auto?'demo':o.practice?'prac':'',spd=(m.tmin&&m.tmax?[m.tmin,(2*m.tmin+m.tmax)/3,(m.tmin+2*m.tmax)/3,m.tmax]:[850,1100,1400,1700]).map(function(x){return x*K});
  P.innerHTML='<div class="track" id="tr"><div class="zone" id="zn"></div><div class="line" id="ln"></div><div class="dot" id="dot" style="will-change:transform"></div></div>'+FB+'<div class="dock"><button class="tapb" id="tp">Tap</button></div>';
  var tr=$('tr'),dot=$('dot'),tp=$('tp'),zn=$('zn'),ln=$('ln');
  cap(o.auto?'Tap when the dot reaches the line.':o.practice?'Try it. Early and late both count as a gap.':(m.blind?'The dot will vanish. Keep counting.':'Tap when the dot reaches the line.'),mode);
  for(var i=1;i<=N;i++){
    if(t!==run.id)return null;prog(i,o.auto?0:N);fbSet('');dot.style.opacity=1;dot.style.transform='translate3d(0,0,0)';var pc0=run.pc;
    var W=tr.clientWidth,x0=16,xt=W*.72,T=o.auto?1300:pick(spd),pxms=(xt-x0)/T;dot.style.left=x0+'px';ln.style.left=xt+'px';zn.style.left=(xt-40*pxms)+'px';zn.style.width=(80*pxms)+'px';
    if(o.auto){handAt(tp,.62);await wait(900);if(t!==run.id)return null}
    await wait(500*K);if(t!==run.id)return null;
    var t0=await atFrame(function(){dot.style.opacity=1}),tapped=false;if(t!==run.id)return null;   // t0: the frame that starts the dot
    var e=await new Promise(function(done){
      function hitf(info){if(tapped||run.paused||o.auto)return;tapped=true;done(info.ast?'ast':clamp(Math.round(info.ts-(t0+T)),-700,700))}
      onTap(tp,hitf);
      onKey=function(ev){if(isGo(ev)&&!o.auto){ev.preventDefault();hitf({ts:ev.timeStamp,ast:false})}};
      if(o.auto)setTimeout(function(){if(t===run.id){handTap();tapped=true;done(0)}},T/(FAST?4:1));
      requestAnimationFrame(function f(ts){if(t!==run.id||tapped)return;var el=Math.max(0,ts-t0),x=x0+(xt-x0)/T*el;dot.style.transform='translate3d('+(Math.min(x,W-14)-x0)+'px,0,0)';   // transform, not left: no layout per frame
        if(m.blind&&el>T*.5)dot.style.opacity=0;if(el>T+700){tapped=true;done('miss');return}requestAnimationFrame(f)})
    });
    if(t!==run.id)return null;dot.style.opacity=1;var dr=run.pc!==pc0;
    if(e==='ast'&&!o.auto){ast++;rec.push({a:1});fbSet('Tap noted. Assistive taps are not timed.','warn')}
    else if(e==='miss'||(dr&&!o.auto)){fbSet('Missed','warn');if(!o.auto){missFx($('tp'));rec.push({m:1})}}
    else{var a=Math.abs(e);fbSet(a<40?'Spot on':(e<0?'← '+a+' ms early':a+' ms late →'),a<40?'ok':'warn');if(a<40)okFx($('dot'));else sfx('tap');if(!o.auto)rec.push({e:e})}
    await wait(Math.max(900,FBMS));if(t!==run.id)return null;
  }
  hideHand();if(o.auto||o.practice)return {score:0,valid:true,chips:[],tip:''};
  var scored=rec.slice(1),real=scored.filter(function(x){return !x.a}),taps=real.filter(function(x){return x.e!=null}).map(function(x){return x.e}),miss=real.length-taps.length,
    absv=taps.map(Math.abs).concat(real.filter(function(x){return x.m}).map(function(){return 700}));
  var late=taps.filter(function(x){return x>0}).length,early=taps.filter(function(x){return x<0}).length,bias=Math.round(med(taps)),hits=taps.filter(function(x){return Math.abs(x)<=350}).length,valid=vTiming(hits,real.length);
  return {score:Math.round(med(absv)),valid:valid,ast:ast,chips:['Late '+late,'Early '+early,'Missed '+miss].concat(ast?['Not timed '+ast]:[]),
    tip:!valid?(ast&&real.length<3?'Assistive taps are not timed, so this round could not be scored.':'Too many taps far from the line for this round to count. Watch the dot and try again.'):taps.length>3?(Math.abs(bias)<15?'Your taps were evenly spread around the line.':(bias>0?'You tapped late more often. Try tapping a little sooner.':'You tapped early more often. Try waiting a beat longer.')):''}
};

var LAD=[1,2,3,4,5,6,8,10,12,15,18,21,24,30];   // flash lengths in frames at 60 Hz. On another screen the frame count is rescaled, so the milliseconds stay the same.
var POSN=['top','top right','right','bottom right','bottom','bottom left','left','top left'];
/* Glance: a 4-up 1-down staircase over LAD. Score = the mean of the last six turning points, in measured milliseconds (every flash is timed from the rAF
   timestamps of the frames that showed and removed it). Fewer than two turning points: no estimate, the round does not count. */
GAMES.speed=async function(o){
  var t=run.id;await measureFrame();if(t!==run.id)return null;
  var K=K_(o),N=o.auto?1:o.n,m=o.mods||{},P=$('play'),mode=o.auto?'demo':o.practice?'prac':'',idx=o.auto||o.practice?13:(m.start!=null?m.start:10),streak=0,lastDir=0,revs=[],right=0,done=0,shown=[];
  var bw=P.clientWidth||300,R=Math.max(220,Math.min(300,bw-8));   // the ring follows the width of the screen
  P.innerHTML='<div class="stage"><div class="ring" id="rg" style="width:'+R+'px;height:'+R+'px"><div class="fx"></div></div></div>'+FB;
  var rg=$('rg');cap(o.auto?'Eyes on the middle dot. Watch the ring.':o.practice?'Slow flashes to start.':'Eyes on the middle dot.',mode);
  function pos(i){var a=i/8*Math.PI*2-Math.PI/2;return[50+39.3*Math.cos(a),50+39.3*Math.sin(a)]}
  function clr(){rg.querySelectorAll('i,button.pickb,span.flab').forEach(function(e){if(e.parentNode)e.remove()})}
  function add(i,cls){var p=pos(i),e=document.createElement('i');e.className=cls;e.style.left=p[0]+'%';e.style.top=p[1]+'%';rg.appendChild(e);return e}
  function addPick(i,fn){var p=pos(i),b=document.createElement('button'),v=document.createElement('i');b.type='button';b.className='pickb';b.setAttribute('aria-label','Position '+(i+1)+' of 8, '+POSN[i]);
    b.style.cssText='position:absolute;left:'+p[0]+'%;top:'+p[1]+'%;width:56px;height:56px;margin:-28px 0 0 -28px;padding:0;border:0;background:none;border-radius:50%;cursor:pointer';
    v.className='pick';v.style.cssText='left:28px;top:28px;pointer-events:none';b.appendChild(v);rg.appendChild(b);onTap(b,function(info){if(!run.paused)fn(i,b,info)});return b}
  var bag=[];function nextT(){if(!bag.length)bag=shuffle([0,1,2,3,4,5,6,7].concat([0,1,2,3,4,5,6,7]));return bag.pop()}
  for(var n=1;n<=N;n++){
    prog(n,o.auto?0:N);var tg=nextT(),k=glFrames(LAD[idx]*1000/60*K,FRAME.ms),pc0=run.pc;fbSet('');if(o.auto)handPark();
    await wait(800*K);if(t!==run.id)return null;
    var fl=await showFor(k,function(){for(var i=0;i<8;i++)add(i,i===tg?'t':'d')},clr);if(t!==run.id)return null;   // painted for k whole frames, even when k is 1
    for(var j=0;j<8;j++)add(j,'mk');await wait(250*K);if(t!==run.id)return null;clr();
    if(o.auto)cap('Now tap where it was.','demo');else fbSet('Tap where the dot was');
    var els=[],got=await new Promise(function(res){for(var q=0;q<8;q++)els.push(addPick(q,function(i){res(i)}));
      onKey=function(e){var v=+e.key;if(v>=1&&v<=8){e.preventDefault();res(v-1)}};
      if(o.auto)setTimeout(function(){if(t===run.id){handAt(els[tg],.4);setTimeout(function(){if(t===run.id){handTap();setTimeout(function(){res(tg)},350)}},700/(FAST?4:1))}},500/(FAST?4:1))});
    if(t!==run.id)return null;var dr=run.pc!==pc0,ok=got===tg&&!dr;
    if(!ok&&!o.auto){els[got].firstChild.classList.add('ch');els[tg].firstChild.classList.add('tru');flagTarget(rg,els[tg],'It was here')}else clr();
    if(!o.auto){shown.push(fl.ms);
      if(!o.practice){done++;if(ok)right++;var dir=0;if(ok){streak++;if(streak>=4){if(idx>0)idx--;streak=0;dir=-1}}else{streak=0;if(idx<LAD.length-1)idx++;dir=1}
        if(dir){if(lastDir&&dir!==lastDir)revs.push(fl.ms);lastDir=dir}}   // a turning point is recorded at the measured length of the flash where the direction flipped
      fbSet(ok?'Right':dr?'Paused':'Not that one',ok?'ok':'bad');if(ok)okFx(rg);else missFx(rg)}
    await wait(o.auto?900:ok?FBMS:900);if(t!==run.id)return null;clr();
  }
  hideHand();if(o.auto||o.practice)return {score:0,valid:true,chips:[],tip:''};
  var est=glanceEst(revs),valid=est!==null&&done>0&&right/done>=.5,ms=est===null?Math.round(shown.length?shown[shown.length-1]:FRAME.ms):est;
  return {score:ms,valid:valid,hz:FRAME.hz,chips:['Right '+right+' of '+done,'Turning points '+revs.length,'Screen '+Math.round(FRAME.hz)+' Hz'],
    tip:valid?'Flash length at the end: about '+ms+' ms on this screen. Keep your eyes on the middle dot.':'Not enough turning points in this round to find your shortest flash, so it did not count. Keep your eyes on the middle dot and try again.'}
};

GAMES.switch=async function(o){
  var t=run.id,K=K_(o),N=o.auto?2:o.n,m=o.mods||{},P=$('play'),mode=o.auto?'demo':o.practice?'prac':'',rate=m.rate==null?.5:m.rate,ok=0,cnt=0,ast=0,sum=0,rts=[];
  P.innerHTML='<div class="stage" style="min-height:220px"><div><div class="cue" id="cue"></div><svg class="shape" id="sh" viewBox="0 0 100 100" role="img" aria-label="Shape"></svg></div></div>'+FB+'<div class="dock"><div class="ans"><button id="L"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="var(--accent)"/></svg>Orange<br>Circle</button><button id="R"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2" fill="var(--blue)"/></svg>Blue<br>Square</button></div></div>';
  var cue=$('cue'),sh=$('sh');cap(o.auto?'Follow the word on top.':o.practice?'The word can change.':'Follow the word on top.',mode);
  var types=o.auto?['first','switch']:['first'].concat(mkTypes(N,rate,Math.random)),inc=o.auto?[false,false]:mkCong(types,Math.random);   // incongruent trials: exactly half (rounded up) within switch trials and within repeat trials
  var task=pick(['colour','shape']);
  for(var n=1;n<=N;n++){
    prog(n,o.auto?0:N);fbSet('');var pc0=run.pc,ty=types[n-1];if(n>1&&ty==='switch')task=task==='colour'?'shape':'colour';
    var col,shp;if(o.auto){col=n===1?'o':'b';shp='c'}else{col=pick(['o','b']);shp=inc[n-1]?(col==='o'?'s':'c'):(col==='o'?'c':'s')}   // colour and shape point to the same button, or to different ones
    cue.innerHTML=ico(task)+(task==='colour'?'COLOUR':'SHAPE');sh.innerHTML='';sh.classList.remove('shake');await wait((o.auto?900:500)*K);if(t!==run.id)return null;
    var f=col==='o'?'var(--accent)':'var(--blue)';
    var t0=await atFrame(function(){sh.innerHTML=shp==='c'?'<circle cx="50" cy="50" r="42" fill="'+f+'"/>':'<rect x="10" y="10" width="80" height="80" rx="6" fill="'+f+'"/>';sh.setAttribute('aria-label',(col==='o'?'Orange ':'Blue ')+(shp==='c'?'circle':'square'))});
    var want=task==='colour'?(col==='o'?'L':'R'):(shp==='c'?'L':'R');
    var side=await new Promise(function(res){var d=false;function g(s,info){if(d||o.auto||run.paused)return;d=true;res({s:s,ts:info.ts,ast:info.ast})}
      onTap($('L'),function(info){g('L',info)});onTap($('R'),function(info){g('R',info)});
      onKey=function(e){if(e.key==='ArrowLeft'||e.key==='1'){e.preventDefault();g('L',{ts:e.timeStamp})}if(e.key==='ArrowRight'||e.key==='2'){e.preventDefault();g('R',{ts:e.timeStamp})}};
      if(!o.auto)setTimeout(function(){if(!d&&t===run.id){d=true;res({s:'T',ts:t0+2000*K})}},2000*K);
      if(o.auto){handAt($(want),.62);setTimeout(function(){if(t===run.id){handTap();setTimeout(function(){res({s:want,ts:0})},350)}},900/(FAST?4:1))}});
    if(t!==run.id)return null;var dr=run.pc!==pc0,right=side.s===want&&!dr,rt=side.ts-t0;
    if(!o.auto){if(n>1){if(side.ast)ast++;else{cnt++;if(right){ok++;sum+=rt;rts.push(rt)}else sum+=2000*K}}
      if(side.ast)fbSet('Answer noted. Assistive taps are not timed.','warn');
      else if(right){okFx($(want));var b=$(want);b.classList.add('good');setTimeout(function(){b.classList.remove('good')},160);fbSet('Right','ok')}
      else{missFx(sh);sh.classList.add('shake');fbSet(dr?'Paused':side.s==='T'?'Too slow':'The rule was '+(task==='colour'?'colour':'shape'),'bad')}}
    if(o.auto&&n===1)cap('The word changes. So does the rule.','demo');await wait(o.auto?1000:FBMS);if(t!==run.id)return null;
  }
  hideHand();if(o.auto||o.practice)return {score:0,valid:true,chips:[],tip:''};
  var acc=cnt?ok/cnt:0,valid=cnt>=Math.ceil((N-1)/2)&&acc>=.8;return {score:cnt?Math.round(sum/cnt):0,valid:valid,ast:ast,chips:['Right '+ok+' of '+cnt,'Fastest '+Math.round(Math.min.apply(null,rts.length?rts:[0]))+' ms'].concat(ast?['Not timed '+ast]:[]),
    tip:valid?'Read the word first. The shape or colour is only a distraction.':ast&&cnt<Math.ceil((N-1)/2)?'Assistive taps are not timed, so this round could not be scored.':'Too many wrong answers for this round to count. Slow down a little and try again.'}
};

GAMES.hold=async function(o){
  var t=run.id,m=o.mods||{},P=$('play'),mode=o.auto?'demo':o.practice?'prac':'',k=K_(o),stim=(m.stim||500)*k,bl=[m.blankMin||600,m.blankMax||1000].map(function(x){return Math.max(x,FBMS)*k}),nogo=m.nogo==null?.3:m.nogo,fa=0,ant=0,miss=0,ast=0,cnt=0,rts=[],win=1000*k,aud=audOn()&&!o.auto;
  P.innerHTML='<div class="stage"><div class="blobwrap"><div class="blob" id="ob"></div></div></div>'+FB+'<div class="dock"><button class="tapb neu" id="tp">Tap</button></div>';
  var ob=$('ob'),tp=$('tp');cap(o.auto?'Orange disc: tap.':'Orange disc: tap. Square: wait.'+(aud?' Audio mode: a high tone means tap, a low tone means wait.':''),mode);
  var n=o.auto?3:o.n,seq=o.auto?[1,0,1]:mkSeq(n,nogo,Math.random);
  var curGo=false,t0=0,resp=true,tstate=0,outcome=null;
  /* a tap: a reaction under 150 ms is an anticipation, counted as an error and never as a fast reaction; a late tap (past win) is ignored and the disc counts as missed */
  function tap(info){if(run.paused||o.auto||resp||!tstate)return;
    if(info.ast){resp=true;outcome='ast';fbSet('Tap noted. Assistive taps are not timed.','warn');return}
    var rt=info.ts-t0;if(curGo&&rt>win)return;resp=true;
    if(rt<150){outcome='ant';ant++;missFx(ob);ob.classList.add('shake');fbSet('Too early','bad');return}
    if(!curGo){outcome='fa';fa++;missFx(ob);ob.classList.add('shake');ob.textContent='×';fbSet('That was the square','bad')}else{outcome='hit';rts.push(rt);okFx(ob);ob.classList.add('pop');fbSet('Right','ok')}}
  onTap(tp,tap);onKey=function(e){if(isGo(e)){e.preventDefault();tap({ts:e.timeStamp,ast:false})}};
  for(var i=0;i<seq.length;i++){
    if(t!==run.id)return null;prog(i+1,o.auto?0:seq.length);var pc0=run.pc;curGo=!!seq[i];resp=false;outcome=null;fbSet('');ob.className='blob';ob.textContent='';
    t0=await atFrame(function(){ob.className='blob '+(curGo?'go':'no')});tstate=1;if(t!==run.id)return null;
    if(aud)cueTone(curGo?880:330,.3);
    if(o.auto){handAt(tp,.62);if(curGo)setTimeout(function(){if(t===run.id)handTap()},400/(FAST?4:1));else cap('Square: do nothing.','demo')}
    await wait(stim);if(t!==run.id)return null;ob.className='blob';ob.textContent='';
    if(!o.auto&&!curGo&&!outcome)fbSet('Good, you waited','ok');
    await wait(bl[0]+Math.random()*(bl[1]-bl[0]));if(t!==run.id)return null;tstate=0;
    if(!o.auto){var dr=run.pc!==pc0;
      if(outcome==='ast')ast++;else{cnt++;if(!outcome&&(dr||curGo)){miss++;fbSet(dr?'Paused':'Too slow','warn')}}   // a go trial nobody answered, or one cut by a pause, is an error
      await fbWait();if(t!==run.id)return null}
    if(o.auto&&i===0)cap('Square: do nothing.','demo');
  }
  hideHand();if(o.auto||o.practice)return {score:0,valid:true,chips:[],tip:''};
  var errs=fa+ant+miss,er=cnt?errs/cnt:1,mrt=rts.length?med(rts):600,valid=vRT(errs,cnt,rts.length,Math.ceil(n/2));
  return {score:Math.round(penScore(mrt,er)),valid:valid,ast:ast,chips:['Wrong taps '+fa,'Too early '+ant,'Missed '+miss,'Typical '+Math.round(mrt)+' ms'].concat(ast?['Not timed '+ast]:[]),
    tip:!valid?(ast&&cnt<Math.ceil(n/2)?'Assistive taps are not timed, so this round could not be scored.':'Too many errors for this round to count. Look before you tap.'):(ant>fa&&ant>miss?'Some taps came before the disc could be seen. Wait for it.':fa>miss?'Most errors were taps on the square. A short look before tapping helps.':miss>0?'You missed some discs. Stay ready on the button.':'Clean round.')}
};

GAMES.space=async function(o){
  var t=run.id,K=K_(o),N=o.auto?1:o.n,m=o.mods||{},cn=m.cells||7,G=cn>7?5:4,ok=0,cnt=0,ast=0,times=[],P=$('play'),mode=o.auto?'demo':o.practice?'prac':'',capMs=8000*K;   // one trial lasts at most 8 s, so a slow right answer never scores worse than a wrong one
  var bw=P.clientWidth||320,S=Math.max(100,Math.min(150,Math.floor((bw-12)/2))),TS=Math.max(120,Math.min(180,Math.floor(bw*.6)));   // canvases follow the width
  var bst='position:relative;display:block;padding:0;border:0;background:none;border-radius:var(--r2);cursor:pointer;line-height:0',cst='width:'+S+'px;height:'+S+'px;aspect-ratio:1;pointer-events:none';
  P.innerHTML='<div class="stage" style="min-height:170px"><canvas id="tg" width="320" height="320" role="img" aria-label="The shape to match" style="width:'+TS+'px;height:'+TS+'px;aspect-ratio:1"></canvas></div>'+FB+'<div class="dock"><div class="opts"><button type="button" id="ba" aria-label="Option A" style="'+bst+'"><canvas id="a" width="320" height="320" style="'+cst+'"></canvas></button><button type="button" id="bb" aria-label="Option B" style="'+bst+'"><canvas id="b" width="320" height="320" style="'+cst+'"></canvas></button></div></div>';
  cap(o.auto?'Which one is the same shape, just turned?':o.practice?'The other one is a mirror image.':'Which one is the same shape, just turned?',mode);
  function norm(c){var mx=Math.min.apply(null,c.map(function(p){return p[0]})),my=Math.min.apply(null,c.map(function(p){return p[1]}));return c.map(function(p){return[p[0]-mx,p[1]-my]})}
  function key(c){return norm(c).map(function(p){return p.join(',')}).sort().join('|')}
  function rot90(c){return c.map(function(p){return[-p[1],p[0]]})}
  function mir(c){return c.map(function(p){return[-p[0],p[1]]})}
  function chiral(c){var mm=mir(c),k=key(c),r=mm;for(var i=0;i<4;i++){if(key(r)===k)return false;r=rot90(r)}return true}
  function branchy(c){var s={};c.forEach(function(p){s[p.join(',')]=1});return c.some(function(p){return[[1,0],[-1,0],[0,1],[0,-1]].filter(function(d){return s[(p[0]+d[0])+','+(p[1]+d[1])]}).length>=3})}
  function fallback(){var c=[[1,0],[2,0],[0,1],[1,1]];for(var y=2;c.length<cn;y++)c.push([1,y]);return c}   // an F-shape with a longer stem: chiral and branched, with exactly cn blocks
  function make(){for(var a=0;a<400;a++){var cells=[[Math.floor(Math.random()*G),Math.floor(Math.random()*G)]],s={},g=0;s[cells[0].join(',')]=1;while(cells.length<cn&&g++<800){var c=pick(cells),d=pick([[1,0],[-1,0],[0,1],[0,-1]]),x=c[0]+d[0],y=c[1]+d[1];if(x<0||y<0||x>=G||y>=G||s[x+','+y])continue;s[x+','+y]=1;cells.push([x,y])}
      if(cells.length===cn&&chiral(cells)&&branchy(cells))return norm(cells)}return fallback()}
  function rr(x,px,py,w,h,r){if(x.roundRect){x.roundRect(px,py,w,h,r);return}var q=Math.min(r,w/2,h/2);x.moveTo(px+q,py);x.arcTo(px+w,py,px+w,py+h,q);x.arcTo(px+w,py+h,px,py+h,q);x.arcTo(px,py+h,px,py,q);x.arcTo(px,py,px+w,py,q);x.closePath()}   // roundRect is missing on older WebViews
  function draw(cv,c,ang){c=norm(c);var x=cv.getContext('2d'),w=Math.max.apply(null,c.map(function(p){return p[0]}))+1,h=Math.max.apply(null,c.map(function(p){return p[1]}))+1,cs=Math.min(56,280/Math.hypot(w,h));
    x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,320,320);x.translate(160,160);x.rotate(ang*Math.PI/180);x.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
    c.forEach(function(p){x.beginPath();rr(x,(p[0]-w/2)*cs+2,(p[1]-h/2)*cs+2,cs-4,cs-4,8);x.fill()})}
  var ANG=[60,120,180,240,300],bagA=[],bagB=[],bagS=[];   // angles and sides come from shuffled bags, so each angle and each side is used equally often
  function nextA(bag){if(!bag.length)shuffle(ANG.concat(ANG),Math.random).forEach(function(x){bag.push(x)});return bag.pop()}
  if(!o.auto){for(var q=0;q<N;q++)bagS.push(q<Math.ceil(N/2));shuffle(bagS)}
  for(var n=1;n<=N;n++){
    prog(n,o.auto?0:N);fbSet('');var pc0=run.pc,base=make(),a1=nextA(bagA),a2=nextA(bagB),L=o.auto?Math.random()<.5:bagS.pop(),mb=mir(base);
    var t0=await atFrame(function(){draw($('tg'),base,0);draw($('a'),L?base:mb,L?a1:a2);draw($('b'),L?mb:base,L?a2:a1)});if(t!==run.id)return null;
    var res=await new Promise(function(rs){onTap($('ba'),function(info){if(!o.auto&&!run.paused)rs({l:true,ts:info.ts,ast:info.ast})});onTap($('bb'),function(info){if(!o.auto&&!run.paused)rs({l:false,ts:info.ts,ast:info.ast})});
      onKey=function(e){if(e.key==='ArrowLeft'||e.key==='1'){e.preventDefault();if(!o.auto)rs({l:true,ts:e.timeStamp})}if(e.key==='ArrowRight'||e.key==='2'){e.preventDefault();if(!o.auto)rs({l:false,ts:e.timeStamp})}};
      if(!o.auto)setTimeout(function(){if(t===run.id)rs({l:null,ts:t0+capMs})},capMs);
      if(o.auto){var el=$(L?'ba':'bb');setTimeout(function(){if(t===run.id){handAt(el,.5);setTimeout(function(){if(t===run.id){handTap();setTimeout(function(){rs({l:L,ts:0})},350)}},800/(FAST?4:1))}},1300/(FAST?4:1))}});
    if(t!==run.id)return null;var dr=run.pc!==pc0,good=res.l===L&&!dr;
    if(!o.auto){if(res.ast)ast++;else{cnt++;if(good){ok++;times.push(Math.min(res.ts-t0,capMs))}else times.push(capMs)}}
    fbSet(res.ast&&!o.auto?'Answer noted. Assistive taps are not timed.':good?'Same shape':dr?'Paused':res.l===null?'Too slow. That one is the same shape.':'That one is the mirror image',res.ast?'warn':good?'ok':'bad');if(good)okFx($(L?'a':'b'));else missFx($(L?'ba':'bb'));
    var cv=$(L?'a':'b'),from=L?a1:a2,st=performance.now();   // reveal: the right option turns into the shape (no turning when motion is reduced)
    if(reduced())draw(cv,base,0);else await new Promise(function(r){(function f(){var q=Math.min(1,(performance.now()-st)/500),e=q*q*(3-2*q);draw(cv,base,from*(1-e));if(q<1&&t===run.id)requestAnimationFrame(f);else r()})()});
    await wait(Math.max(o.auto?700:450,FBMS));if(t!==run.id)return null;
  }
  hideHand();if(o.auto||o.practice)return {score:0,valid:true,chips:[],tip:''};
  var acc=cnt?ok/cnt:0,secs=Math.round(mean(times)/100)/10,okT=times.filter(function(x){return x<capMs}),valid=cnt>=Math.ceil(N/2)&&acc>=.8;
  return {score:secs,valid:valid,ast:ast,chips:['Right '+ok+' of '+cnt,'Typical '+(Math.round(med(okT)/100)/10||0)+' s'].concat(ast?['Not timed '+ast]:[]),
    tip:valid?'Turn the shape in your head first, then look at the options.':ast&&cnt<Math.ceil(N/2)?'Assistive taps are not timed, so this round could not be scored.':'Too many wrong answers for this round to count. Take a moment before choosing.'}
};
