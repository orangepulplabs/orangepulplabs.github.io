/* v5 core: flags, state, small DOM helpers, the day clock, anonymous counts, sound/haptic wrappers, theme.
   State lives in the engine blob (db(), localStorage 'zv5' through store-shim.js) under db().v5, so one key holds everything.
   Puzzle progress keeps the v4 shape db().st.pz[id] = {lvl, best:{level:{moves,secs,stars}}} so the engines and a later sync stay compatible. */
var V5={ver:'v5.0 b1'};
/* ---------- flags: owner decisions and monetisation switches. URL: ?flags=chain:0,iap:1  Dev panel (?dev) can flip them too. ---------- */
var FLAGS_DEFAULT={
  chain:true,          // D1: day chain with free rest days (false = week goal only)
  weekGoal:true,       // week goal ring (3, 4, 5 or 7 days)
  season:true,         // monthly free stamp track with cosmetic rewards
  teaser:true,         // tomorrow's year + silhouette after today's puzzle
  reminders:true,      // ask once, after the 2nd daily solved
  ageAfterWin:true,    // D3: ask the age group after the first win (false = on the welcome screen)
  companion:true,      // the citrus companion on Today and the reward
  ads:true,            // master switch for every ad placeholder
  rewarded:true,       // rewarded hint / solution offers
  interstitial:true,   // one interstitial between reel runs (capped)
  native:true,         // native "Sponsored" card in Almanac and story sheet
  iap:false,           // FUTURE in-app purchase slots: DISABLED (owner's Play account would show a home address)
  sendCounts:false,    // send allowlisted anonymous counts to the demo API once a day
  share:true           // friend challenge share from the reward
};
var FLAGS=(function(){var f=Object.assign({},FLAGS_DEFAULT);try{var j=JSON.parse(localStorage.getItem('zv5.flags')||'{}');Object.keys(j).forEach(function(k){if(k in f)f[k]=!!j[k]})}catch(e){}
  var m=/[?&]flags=([^&]+)/.exec(location.search);if(m)decodeURIComponent(m[1]).split(',').forEach(function(p){var kv=p.split(':');if(kv[0] in f)f[kv[0]]=kv[1]!=='0'&&kv[1]!=='false'});return f})();
function flagSet(k,v){FLAGS[k]=!!v;try{var j=JSON.parse(localStorage.getItem('zv5.flags')||'{}');j[k]=!!v;localStorage.setItem('zv5.flags',JSON.stringify(j))}catch(e){}}
var Q=(function(){var s=location.search;return {dev:/[?&]dev\b/.test(s),fast:/[?&]fast\b/.test(s),reset:/[?&]reset\b/.test(s),demo:/[?&]demo\b/.test(s),
  day:(/[?&]day=(\d{4}-\d{2}-\d{2})/.exec(s)||[])[1]||null,theme:(/[?&]theme=(light|dark)/.exec(s)||[])[1]||null,api:(/[?&]api=([^&]+)/.exec(s)||[])[1]||null}})();
var API=Q.api?decodeURIComponent(Q.api):'https://zest-api-demo.orangepulplabs.workers.dev';   // the demo service only; never production from v5
if(API.indexOf('https://zest-api-demo.')!==0&&API.indexOf('http://127.0.0.1')!==0)API='https://zest-api-demo.orangepulplabs.workers.dev';

/* ---------- state ---------- */
function v5Defaults(){return {onb:0,agreeAt:0,age:null,first:null,sessions:0,lastOpen:null,lastSeenDay:null,theme:'light',accent:'',
  daily:{},played:{},cards:{},facts:[],chain:{n:0,best:0,rest:1,last:null,restUsed:{}},weekGoal:4,weeksMet:0,weekMetMarks:{},
  reel:{best:0,last:0,runs:0,pts:0,seen:0},ads:{rw:{},it:{},lastInter:0,runsSince:0,shown:{}},hints:{day:null,left:3},
  season:{m:null,n:0,got:[]},remind:{asked:0,on:0,time:'19:00'},ev:{},sent:null,tiers:{},dayOffset:0,firstWinMs:0}}
function S(){var d=db();if(!d.v5||typeof d.v5!=='object')d.v5=v5Defaults();var v=d.v5,def=v5Defaults();Object.keys(def).forEach(function(k){if(v[k]===undefined)v[k]=def[k]});return v}
function save(){try{sv(db())}catch(e){}}
function pzProg(id){var s=db().st;if(!s.pz||typeof s.pz!=='object')s.pz={};return s.pz[id]||null}
function pzProgW(id){var s=db().st;if(!s.pz||typeof s.pz!=='object')s.pz={};return s.pz[id]||(s.pz[id]={lvl:1,best:{}})}

/* ---------- the day clock (?day=YYYY-MM-DD and the dev panel's day offset are for tests) ---------- */
function ymd(dt){return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0')}
function parseDay(k){return new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10),12)}
function addDays(k,n){var d=parseDay(k);d.setDate(d.getDate()+n);return ymd(d)}
function daysBetween(a,b){return Math.round((parseDay(b)-parseDay(a))/864e5)}
function T(){var base=Q.day||ymd(new Date());var off=0;try{off=(db().v5&&db().v5.dayOffset)|0}catch(e){}return off?addDays(base,off):base}
function weekStart(k){var d=parseDay(k),dow=(d.getDay()+6)%7;return addDays(k,-dow)}   // Monday
function dayLabel(k,o){return parseDay(k).toLocaleDateString('en-GB',o||{weekday:'long',day:'numeric',month:'long'})}

/* ---------- DOM helpers ---------- */
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function frag(html){var t=document.createElement('template');t.innerHTML=html.trim();return t.content}
function h5(html){return frag(html).firstElementChild}
function qs(root,sel){return root.querySelector(sel)}
function qsa(root,sel){return Array.prototype.slice.call(root.querySelectorAll(sel))}
function on(root,sel,ev,fn){root.addEventListener(ev,function(e){var t=e.target.closest(sel);if(t&&root.contains(t))fn(e,t)})}
function plur(n,one,many){return n+' '+(n===1?one:(many||one+'s'))}
function clampN(x,a,b){return Math.max(a,Math.min(b,x))}
function nap(ms){return new Promise(function(r){setTimeout(r,Q.fast?Math.min(ms,30):ms)})}
function say(t){var e=$('live');if(!e)return;e.textContent='';setTimeout(function(){e.textContent=t},40)}
var toastT=0;function toast(t,ms){var e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){e.classList.remove('on')},ms||2400)}

/* ---------- anonymous counts: every event counts locally (dev panel); only names on the server allowlist are ever sent ---------- */
var EV_ALLOW=['onb_agree','first_round_started','first_round_finished','round_started','round_finished','round_abandoned','again_tap','next_tap','done_tap','set_started','set_finished','zen_started','retry_instant','puzzle_started','puzzle_solved','share_tap','signin_started','signin_done','rank_joined','archive_opened','stop_shown','stop_taken','stop_continue','mode_1','mode_3','mode_10','share_shown','share_text','share_done','link_open','friend_start','friend_finish','friend_beat','friend_sendback','challenge_back_tap','store_tap','link_broken'];
function ev(name){try{var v=S(),t=T();var day=v.ev[t]=v.ev[t]||{};day[name]=(day[name]||0)+1;var ks=Object.keys(v.ev).sort();while(ks.length>14)delete v.ev[ks.shift()];save()}catch(e){}}
function evFlush(){if(!FLAGS.sendCounts||db().st.usage===0||navigator.onLine===false)return;var v=S(),t=T();if(v.sent===t)return;var y=addDays(t,-1),src=v.ev[y];if(!src)return;
  var events={};Object.keys(src).forEach(function(k){if(EV_ALLOW.indexOf(k)>=0)events[k]=src[k]});if(!Object.keys(events).length){v.sent=t;save();return}
  fetch(API+'/v1/ev',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({day:y,events:events})}).then(function(r){if(r.status===204||r.ok){v.sent=t;save()}}).catch(function(){})}

/* ---------- feel: sound + haptic through the shared ZD (delight.js), respecting the player's switches ---------- */
function fx(kind,elx){try{if(!window.ZD)return;if(elx&&kind!=='tap')ZD.pop(elx,kind==='best'||kind==='daily'?kind:'ok');ZD.sound(kind==='tap'?'tap':kind==='best'?'best':kind==='daily'?'daily':kind==='soft'?'soft':kind==='round'?'round':'ok');ZD.haptic(kind==='tap'?'tap':kind==='best'||kind==='daily'?'best':kind==='soft'?'soft':'ok')}catch(e){}}
function rmOn(){try{return reduced()}catch(e){return false}}

/* ---------- theme ---------- */
function applyTheme(){var v=S(),t=Q.theme||v.theme||'light',dark=t==='dark'||(t==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme',dark?'dark':'light');if(v.accent)document.documentElement.setAttribute('data-accent',v.accent);else document.documentElement.removeAttribute('data-accent');
  var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',dark?'#14120F':'#F7F4EE');
  var app=$('app');if(app)app.classList.toggle('rm',rmOn())}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){if(S().theme==='auto')applyTheme()})}catch(e){}

/* ---------- content helpers ---------- */
function P(id){return (window.PUZZLES&&PUZZLES[id])||null}
function art(id,kind){var a=window.ART&&ART[id];return a?(kind==='hero'?a.hero:a.tile):''}
/* story hook: the story's own first sentence (a curiosity line), falls back to the instruction hook */
function storyHook(id){var st=window.STORY&&STORY[id];if(st&&st.paras&&st.paras[0]){var f=st.paras[0].split(/(?<=[.!?])\s/)[0];if(f.length<=150)return f}return hook(id)}
function hook(id){if(HOOK_FIX[id])return HOOK_FIX[id];var a=window.ART&&ART[id];return (a&&a.hook)||(P(id)&&P(id).blurb)||''}
function fam(id){return pzTheme(id)}
function kick(id){return KICK[id]||fam(id).name}
function mins(id){var p=P(id);var s=(p&&p.secs)||90;return s<60?Math.round(s/10)*10+' s':Math.round(s/60)+' min'}
function tierOf(lvl){return lvl>=21?3:lvl>=11?2:lvl>=1?1:0}   // levels reached 1-10 Bronze, 11-20 Silver, 21-30 Gold
var TIER_NAME=['','Bronze','Silver','Gold'];
function solvedLevels(id){var z=pzProg(id);return z&&z.best?Object.keys(z.best).map(Number).filter(function(n){return n>0}):[]}
function maxSolved(id){var a=solvedLevels(id);return a.length?Math.max.apply(null,a):0}
function nextLevel(id){var p=P(id),z=pzProg(id);if(!z||!z.best)return 1;var lv=Math.min(p.levels,Math.max(1,z.lvl||1));for(var i=1;i<=lv;i++)if(!z.best[i])return i;return lv}
function totalSolvedPuzzles(){var s=db().st.pz||{};return Object.keys(s).filter(function(k){return P(k)&&s[k].best&&Object.keys(s[k].best).length}).length}

/* large system text (150% and up): headers wrap instead of colliding (audit 16-01) */
function textScale(){var px=parseFloat(getComputedStyle(document.documentElement).fontSize)||16;var a=$('app');if(a)a.classList.toggle('big-text',px>=24)}
