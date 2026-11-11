/* v6 daily reminders (6 Nov 2026). Loaded after daily6.js, before ../v5/boot.js. v5 files are not modified.
   Two local notifications a day, scheduled by the Android app (flutter_local_notifications, inexact, no server):
     - morning (default 09:00): today's daily puzzle, its real name and a one-line hook from its story; tap = straight to that puzzle
     - evening (default 19:00): the Reel; tap = the Play tab (the Reel)
   Both are ON by default for new and existing players. Skip rules: no morning one once today's daily is solved, no evening one once the
   Reel was played today (a Reel card solved, or swiped past). The page builds a rolling 7-day plan and sends it to the app on every open,
   after a daily win, after Reel play, after a Settings change and when the day turns; the app cancels the old plan and schedules the new one.
   State: S().rem = {daily:{on,t}, reel:{on,t}, ask:{n,pd,day,res}, reelDay} (the app's own save, zv5 in the app, zv6 in the browser).
   Android 13+ permission: an in-app explainer first (Allow / Not now), then the system prompt, at a good moment: after a puzzle win, back on
   Today with nothing else open. Declined: never nag; it may ask once more, after 3 more days of play. Below Android 13: on, no prompt.
   Bridge (tool/app-shell.js channel ZestNative): page -> app  'remind:{v,items:[{id,at,route,day,title,body}],preview}', 'notif:status',
   'notif:ask', 'notif:settings'; app -> page  window.__zestNotif({sdk,enabled,asked}), window.__zestRemOpen('daily'|'reel').
   Browser prototype: no app, so nothing is scheduled; with ?remind a simulated Android 14 app is used (tests, previews).
   Copy rules: no brain or health claims, no pressure, no streak talk, no emoji. */
(function(){
var DAYS=7,DEF={daily:{on:1,t:'09:00'},reel:{on:1,t:'19:00'}};
var SIM=/[?&]remind\b/.test(location.search)&&typeof window.ZestNative==='undefined';
var Z=window.ZREM={log:[],last:null,ns:SIM?{sdk:34,enabled:false,sim:1}:null,simAnswer:true,shown:0};
function native(){return typeof window.ZestNative!=='undefined'&&!!window.ZestNative&&typeof window.ZestNative.postMessage==='function'}
function send(m){Z.log.push(m);if(Z.log.length>60)Z.log.shift();try{if(native())window.ZestNative.postMessage(m)}catch(e){}}
function R(){var v=S();if(!v.rem||typeof v.rem!=='object')v.rem={};var r=v.rem;
  ['daily','reel'].forEach(function(k){if(!r[k]||typeof r[k]!=='object')r[k]={on:DEF[k].on,t:DEF[k].t};if(r[k].on===undefined)r[k].on=DEF[k].on;if(!/^\d\d:\d\d$/.test(r[k].t||''))r[k].t=DEF[k].t});
  if(!r.ask||typeof r.ask!=='object')r.ask={n:0,pd:0,day:null,res:''};return r}
function playDays(){try{return Object.keys(S().played||{}).length}catch(e){return 0}}
function at(k,t){var d=parseDay(k);return new Date(d.getFullYear(),d.getMonth(),d.getDate(),+t.slice(0,2),+t.slice(3,5),0,0).getTime()}
function h24(t){return String(+t.slice(0,2))+':'+t.slice(3,5)}

/* ---------- copy: a few variants each, picked by the day so the words change from day to day ---------- */
var MORNING=[function(n){return 'Today: '+n},function(n){return 'Today\u2019s puzzle: '+n},function(n){return n+' is today\u2019s puzzle'},function(n){return 'New today: '+n}];
var EVENING=[['The Reel','Harder levels are ready in the Reel.'],['A few harder ones','Harder levels of the puzzles you know, one swipe at a time.'],
  ['Evening Reel','A few harder levels, if you have a minute.'],['The Reel is ready','Harder levels, one swipe at a time.']];
function dayNo(k){return Math.max(0,daysBetween('2026-01-01',k))}
function hookLine(id){var h='';try{h=storyHook(id)||''}catch(e){}if(!h||h.length>120){try{var a=window.ART&&ART[id];if(a&&a.hook&&a.hook.length<=120)h=a.hook}catch(e){}}
  if(h.length>120)h=h.slice(0,117).replace(/\s+\S*$/,'')+'\u2026';return h}
function copyDaily(k){var d=dailyFor(k,totalSolvedPuzzles()),p=P(d.id)||{name:'A new puzzle'},n=dayNo(k);
  return {title:MORNING[n%MORNING.length](p.name),body:hookLine(d.id),pid:d.id}}
function copyReel(k){var c=EVENING[dayNo(k)%EVENING.length];return {title:c[0],body:c[1]}}
Z.copyDaily=copyDaily;Z.copyReel=copyReel;Z.MORNING=MORNING;Z.EVENING=EVENING;

/* ---------- the plan: the next 7 days, skip rules applied to today ---------- */
function plan(now){now=now==null?Date.now():now;var r=R(),v=S(),t=T(),out=[];
  for(var i=0;i<DAYS;i++){var k=addDays(t,i);
    if(r.daily.on&&!(i===0&&v.daily[t])){var a=at(k,r.daily.t);if(a>now){var c=copyDaily(k);out.push({id:100+i,at:a,route:'daily',day:k,time:r.daily.t,title:c.title,body:c.body,pid:c.pid})}}
    if(r.reel.on&&!(i===0&&r.reelDay===t)){var b=at(k,r.reel.t);if(b>now){var e=copyReel(k);out.push({id:200+i,at:b,route:'reel',day:k,time:r.reel.t,title:e.title,body:e.body})}}}
  out.sort(function(x,y){return x.at-y.at});return out}
Z.plan=plan;Z.state=R;
var lastSent='';
function sync(force){try{var p=plan(),c1=copyDaily(T()),msg={v:1,items:p,preview:{daily:{title:c1.title,body:c1.body},reel:copyReel(T())}};
  var j=JSON.stringify(msg),key=JSON.stringify(p.map(function(x){return [x.id,x.at,x.title,x.body]}));if(!force&&key===lastSent)return;lastSent=key;Z.last=msg;send('remind:'+j)}catch(e){console.error(e)}}
Z.sync=sync;

/* ---------- app -> page ---------- */
var waitAsk=null;
window.__zestNotif=function(st){st=st||{};var was=Z.ns&&Z.ns.enabled;Z.ns={sdk:st.sdk|0,enabled:!!st.enabled};
  if(waitAsk){var f=waitAsk;waitAsk=null;f(Z.ns)}if(was!==Z.ns.enabled)sync(true);paint()};
function askSystem(done){if(SIM){setTimeout(function(){Z.ns.enabled=!!Z.simAnswer;sync(true);paint();done&&done(Z.ns)},60);return}
  waitAsk=done||function(){};send('notif:ask');setTimeout(function(){if(waitAsk===done&&done){waitAsk=null;done(Z.ns||{})}},120000)}
/* Nav.tab ignores a switch while another is still animating (motion.js busy). At app start the boot's own switch to Today can still be
   running when a tapped reminder asks for the Reel, so the Reel was sometimes lost (android:notifications, 9 Nov). Retry until it shows. */
function toPlay(k){Nav.tab('play');setTimeout(function(){if(Nav.cur!=='play'&&!Nav.depth&&!Nav.overlays&&k<10)toPlay(k+1)},300)}
window.__zestRemOpen=function(route){var n=0;(function go(){
    if(($('boot')||document.querySelector('.ob,.slate'))&&n++<40){setTimeout(go,250);return}   // after boot; never over the welcome
    if(!S().onb)return;ev(route==='reel'?'remind_open_reel':'remind_open_daily');
    for(var i=0;i<3&&Nav.overlays;i++)Nav.back();
    Nav.popAll().then(function(){if(route==='reel'){toPlay(0);return}
      var d=todayDaily();Nav.tab('today').then(function(){if(!S().daily[d.day])startDaily(null)})})})()};

/* ---------- the explainer: once after a win, back on Today with nothing else open ---------- */
function askDue(){var r=R(),a=r.ask,ns=Z.ns;if(!ns||ns.enabled||(ns.sdk|0)<33)return false;if(!(r.daily.on||r.reel.on))return false;
  if(a.n===0)return true;return a.n===1&&a.res!=='granted'&&playDays()-(a.pd|0)>=3}
function quiet(){return !!(S().onb&&Nav.cur==='today'&&!Nav.depth&&!Nav.overlays&&!$('boot')&&!document.querySelector('.ob,.slate,.zt-tip,.rw'))}
Z.askDue=askDue;Z.quiet=quiet;
var pend=0;
function showAsk(){var r=R(),a=r.ask;Z.shown++;a.n=(a.n|0)+1;a.pd=playDays();a.day=T();a.res='later';save();ev('remind_ask_shown');
  var both=r.daily.on&&r.reel.on,q=both?'Get a daily puzzle at '+h24(r.daily.t)+' and a Reel nudge at '+h24(r.reel.t)+'?':r.daily.on?'Get a daily puzzle at '+h24(r.daily.t)+'?':'Get a Reel nudge at '+h24(r.reel.t)+'?';
  var b=h5('<div data-remask><p style="font-weight:700">'+esc(q)+'</p><p class="sm" style="margin-top:6px">Skipped on days you have already played. Change the times or turn them off in Settings.</p>'+
    '<div style="display:flex;flex-direction:column;gap:8px;margin-top:16px"><button class="btn pri wide" data-yes>'+icon('bell')+'Allow</button><button class="btn ghost wide" data-no>Not now</button></div></div>');
  var picked=false,sh=Nav.sheet({title:'Want reminders?',body:b,onClose:function(){if(!picked){picked=true}}});
  qs(b,'[data-no]').onclick=function(){picked=true;a.res='later';save();ev('remind_ask_later');sh.close()};
  qs(b,'[data-yes]').onclick=function(){picked=true;sh.close();ev('remind_ask_allow');
    askSystem(function(ns){a.res=ns&&ns.enabled?'granted':'denied';save();if(ns&&ns.enabled)toast('Reminders on. Change them any time in Settings.')})}}
Z.showAsk=showAsk;
setInterval(function(){if(!pend)return;if(Date.now()-pend>180000){pend=0;return}if(!askDue()){pend=0;return}
  if(quiet()){pend=0;setTimeout(function(){if(quiet()&&askDue())showAsk();else pend=Date.now()},900)}},700);

/* ---------- hooks into the game (wrapped, not edited) ---------- */
var mw0=markWin;markWin=function(o){var out=mw0.apply(this,arguments);try{if(o&&o.id&&askDue())pend=Date.now()}catch(e){}return out};
var ev0=ev;ev=function(name){var r=ev0.apply(this,arguments);try{
    if(name==='reel_solved'||name==='reel_next'){var x=R();if(x.reelDay!==T()){x.reelDay=T();save();sync()}}
    else if(name==='daily_solved')setTimeout(sync,0)}catch(e){}return r};
askReminder=function(){};   // v5's single 'daily nudge' question is replaced by the explainer above

/* ---------- Settings: a Reminders section (two switches, two times, the system status) in place of v5's Daily nudge row ---------- */
var CSS='.remrow{gap:10px}.remrow .rt{min-width:0}.remt{flex:none;font:650 1rem var(--font);color:var(--ink);background:var(--sunk);border:0;border-radius:12px;padding:0 8px;min-height:44px;min-width:88px;color-scheme:light dark}'+
  '.remt:disabled{opacity:.45}.remst{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--line,rgba(0,0,0,.08))}.remst[hidden]{display:none}.remst .rt{flex:1;min-width:0}.remst .rt b{display:block;font:700 1rem/1.3 var(--font)}.remst .rt small{display:block;color:var(--muted);font-size:.8125rem;line-height:1.35}.remst .btn{flex:none;min-height:44px}';
var paintFn=null;function paint(){if(paintFn)try{paintFn()}catch(e){}}
function section(){var r=R();
  function row(k,label,sub){return '<div class="row remrow"><span class="rt"><b id="rem-'+k+'">'+esc(label)+'</b><small>'+esc(sub)+'</small></span>'+
    '<input class="remt" type="time" step="300" data-rt="'+k+'" value="'+esc(r[k].t)+'" aria-label="'+esc(label)+' time"'+(r[k].on?'':' disabled')+'>'+
    '<button class="sw" role="switch" data-rk="'+k+'" aria-checked="'+(!!r[k].on)+'" aria-labelledby="rem-'+k+'"></button></div>'}
  return h5('<div class="sect" data-rems><div class="sh"><h2>Reminders</h2></div><div class="card list" style="padding:4px 16px">'+
    row('daily','Daily puzzle','Skipped once you have solved today\u2019s puzzle')+row('reel','Reel','Skipped once you have played the Reel that day')+
    '<div class="remst" data-remst hidden><span class="rt"><b>Notifications are off</b><small>Turn them on in iPhone Settings, Notifications, Zest.</small></span><button class="btn sec" data-remopen>Open settings</button></div>'+
    '<p class="sm" data-remweb style="padding:10px 0" hidden>Add it to your Home Screen to get reminders.</p></div></div>')}
function mountSettings(sh){var root=sh&&sh.el;if(!root||qs(root,'[data-rems]'))return;
  if(!document.getElementById('rem6css')){var st=document.createElement('style');st.id='rem6css';st.textContent=CSS;document.head.appendChild(st)}
  var old=qs(root,'[data-remind]'),sect=old&&old.closest('.sect'),box=section();
  if(old)old.remove();if(sect)sect.parentNode.insertBefore(box,sect);else{var first=qs(root,'.sect');if(first&&first.nextSibling)first.parentNode.insertBefore(box,first.nextSibling);else (qs(root,'.sect')||root).parentNode.appendChild(box)}
  function draw(){var r=R(),ns=Z.ns;['daily','reel'].forEach(function(k){var sw=qs(box,'[data-rk="'+k+'"]'),ti=qs(box,'[data-rt="'+k+'"]');sw.setAttribute('aria-checked',String(!!r[k].on));ti.disabled=!r[k].on;if(document.activeElement!==ti)ti.value=r[k].t});
    var off=!!(ns&&!ns.enabled&&(r.daily.on||r.reel.on));qs(box,'[data-remst]').hidden=!off;qs(box,'[data-remweb]').hidden=!!(ns||native())}
  paintFn=function(){if(!box.isConnected){paintFn=null;return}draw()};draw();
  qsa(box,'[data-rk]').forEach(function(sw){sw.addEventListener('click',function(e){e.stopPropagation();var k=sw.dataset.rk,r=R();r[k].on=r[k].on?0:1;save();ev(r[k].on?'remind_on_'+k:'remind_off_'+k);try{fx('tap')}catch(x){}
    draw();sync();var ns=Z.ns;if(r[k].on&&ns&&!ns.enabled&&(ns.sdk|0)>=33&&(r.ask.n|0)<2){r.ask.n=(r.ask.n|0)+1;r.ask.pd=playDays();r.ask.day=T();save();askSystem(function(n2){r.ask.res=n2&&n2.enabled?'granted':'denied';save();draw()})}})});
  qsa(box,'[data-rt]').forEach(function(ti){ti.addEventListener('change',function(){var k=ti.dataset.rt,v=String(ti.value||'').slice(0,5);if(!/^\d\d:\d\d$/.test(v)){ti.value=R()[k].t;return}R()[k].t=v;save();ev('remind_time_'+k);sync()})});
  qs(box,'[data-remopen]').onclick=function(){send('notif:settings')}}
var os0=openSettings;openSettings=function(){var sh=os0.apply(this,arguments);try{mountSettings(sh)}catch(e){console.error(e)}return sh};

/* ---------- start: ask the app for the permission status, send the plan; again when the page comes back on a new day ---------- */
window.addEventListener('load',function(){R();save();if(native())send('notif:status');setTimeout(function(){sync(true)},600)});
document.addEventListener('visibilitychange',function(){if(document.hidden)return;if(native())send('notif:status');setTimeout(sync,300)});
})();
