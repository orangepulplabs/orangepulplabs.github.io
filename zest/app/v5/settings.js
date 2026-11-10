/* v5 Settings: one sheet, about two screens (audit 11-01..11-04, 12-01). Segmented controls for every choice; sub-lines only where a choice is not obvious.
   Age list: Under 13, 13 to 17, 18 or over (all ages since 10 Nov 2026; changing it never deletes anything). Sign-in is for adults and lives in the Android build (no sign-in from this prototype). */
var CONTACT5='orangepulplabs@gmail.com';
function openSettings(){var v=S(),st=db().st,b=h5('<div>'+
  '<div class="sect" style="margin-top:4px"><div class="sh"><h2>Appearance</h2></div><div class="seg" role="group" aria-label="Theme" data-seg="theme"><button data-v="light">Light</button><button data-v="dark">Dark</button><button data-v="auto">Phone</button></div>'+
  ((v.season.got||[]).indexOf('indigo')>=0?'<div class="seg" role="group" aria-label="Accent" data-seg="accent" style="margin-top:8px"><button data-v="">Orange</button><button data-v="indigo">Indigo</button></div>':'')+'</div>'+
  '<div class="sect"><div class="sh"><h2>Feel</h2></div><div class="card list" style="padding:4px 16px">'+
    swRow('sfx','Sound',st.sfx)+swRow('hap','Vibration',st.hap)+swRow('rm','Reduce motion',reduced())+'</div></div>'+
  '<div class="sect"><div class="sh"><h2>Rhythm</h2></div><div class="card list" style="padding:4px 16px">'+
    '<button class="row" data-remind><span class="rt"><b>Daily nudge</b></span><span class="sm" data-rv>'+(v.remind.on?esc(fmtTime(v.remind.time)):'Off')+'</span>'+icon('chev','chev')+'</button>'+
    '<button class="row" data-goal><span class="rt"><b>Week goal</b></span><span class="sm">'+v.weekGoal+' days</span>'+icon('chev','chev')+'</button></div></div>'+
  '<div class="sect"><div class="sh"><h2>You</h2></div><div class="card list" style="padding:4px 16px">'+
    '<button class="row" data-age><span class="rt"><b>Age group</b></span><span class="sm" data-agev>'+ageLabel(v.age)+'</span>'+icon('chev','chev')+'</button>'+
    (v.age==='adult'?'<button class="row" data-signin><span class="rt"><b>Sign in with Google</b><small>Keep progress on a new phone. Adults only.</small></span>'+icon('chev','chev')+'</button>':'')+
    swRow('usage','Share anonymous counts',st.usage!==0,'A daily total per event. No identifier.')+'</div></div>'+
  (FLAGS.iap?'<div class="sect"><div class="sh"><h2>Later</h2><span class="chip">Disabled</span></div><div class="card list" style="padding:4px 16px">'+IAP_SLOTS.map(function(x){return '<div class="row" aria-disabled="true"><span class="rt"><b>'+esc(x.t)+'</b><small>'+esc(x.d)+'</small></span><span class="chip">Soon</span></div>'}).join('')+'</div></div>':'')+
  '<div class="sect"><div class="sh"><h2>About</h2></div><div class="card list" style="padding:4px 16px">'+
    '<button class="row" data-research><span class="rt"><b>What the research says</b></span>'+icon('chev','chev')+'</button>'+
    '<a class="row" href="https://orangepulplabs.com/zest/terms/" target="_blank" rel="noopener"><span class="rt"><b>Terms</b></span>'+icon('chev','chev')+'</a>'+
    '<a class="row" href="https://orangepulplabs.com/zest/privacy/" target="_blank" rel="noopener"><span class="rt"><b>Privacy</b></span>'+icon('chev','chev')+'</a>'+
    '<a class="row" href="mailto:'+CONTACT5+'"><span class="rt"><b>Contact</b><small>'+CONTACT5+'</small></span>'+icon('chev','chev')+'</a></div>'+
    '<p class="sm" style="margin-top:12px;text-align:center">Zest '+esc(V5.ver)+' · OrangePulp Labs</p></div></div>');
  var sh=Nav.sheet({title:'Settings',body:b});
  function segSet(name,val){qsa(b,'[data-seg="'+name+'"] button').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.v===val?'true':'false')})}
  segSet('theme',v.theme||'light');segSet('accent',v.accent||'');
  on(b,'[data-seg="theme"] button','click',function(e,x){v.theme=x.dataset.v;save();segSet('theme',v.theme);applyTheme()});
  on(b,'[data-seg="accent"] button','click',function(e,x){v.accent=x.dataset.v;save();segSet('accent',v.accent);applyTheme()});
  on(b,'.sw','click',function(e,x){var k=x.dataset.k,now=x.getAttribute('aria-checked')!=='true';x.setAttribute('aria-checked',String(now));var s2=db().st;
    if(k==='usage')s2.usage=now?1:0;else if(k==='rm')s2.rm=now?1:0;else s2[k]=now?1:0;save();if(k==='rm')applyTheme();if(now&&k!=='usage'&&k!=='rm')fx('tap')});
  qs(b,'[data-remind]').onclick=function(){remindSheet(function(){qs(b,'[data-rv]').textContent=S().remind.on?fmtTime(S().remind.time):'Off'})};
  qs(b,'[data-goal]').onclick=function(){goalSheet()};
  qs(b,'[data-age]').onclick=function(){ageSheet(function(){qs(b,'[data-agev]').textContent=ageLabel(S().age);sh.close();setTimeout(openSettings,300)})};
  var si=qs(b,'[data-signin]');if(si)si.onclick=function(){Nav.dialog('Sign in on Android','Google sign-in runs in the Android app (openid only, no email kept). This prototype does not sign in.',[['OK',null,'pri']])};
  qs(b,'[data-research]').onclick=function(){researchSheet()};return sh}
function swRow(k,label,onv,sub){return '<div class="row"><span class="rt"><b id="sw-'+k+'">'+esc(label)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'')+'</span><button class="sw" role="switch" data-k="'+k+'" aria-checked="'+(!!onv)+'" aria-labelledby="sw-'+k+'"></button></div>'}
function fmtTime(t){var h=+t.slice(0,2);return (h%12||12)+(h<12?' am':' pm')}
function remindSheet(done){var v=S(),b=h5('<div><div class="seg" role="group" aria-label="Nudge time"><button data-t="">Off</button><button data-t="08:00">8 am</button><button data-t="19:00">7 pm</button><button data-t="21:00">9 pm</button></div><p class="sm" style="margin-top:12px">One a day, only if you have not played yet. Sent by the Android app.</p></div>');
  var sh=Nav.sheet({title:'Daily nudge',body:b});function mark(){qsa(b,'[data-t]').forEach(function(x){x.setAttribute('aria-pressed',String(v.remind.on?x.dataset.t===v.remind.time:x.dataset.t===''))})}mark();
  on(b,'[data-t]','click',function(e,x){if(x.dataset.t){v.remind.on=1;v.remind.time=x.dataset.t;ev('remind_opt_in')}else v.remind.on=0;v.remind.asked=1;save();mark();if(done)done();setTimeout(sh.close,200)})}
/* age: three choices; changing it never deletes anything (audit 12-01) */
function ageLabel(a){return a==='child'?'Under 13':a==='teen'?'13 to 17':a==='adult'?'18 or over':'Not set'}
function ageSheet(done){var b=h5('<div><div class="list"><button class="row" data-a="child"><span class="rt"><b>Under 13</b><small>Everything stays on this phone</small></span></button><button class="row" data-a="teen"><span class="rt"><b>13 to 17</b><small>Everything stays on this phone</small></span></button><button class="row" data-a="adult"><span class="rt"><b>18 or over</b></span></button></div></div>');
  var sh=Nav.sheet({title:'Age group',body:b});on(b,'[data-a]','click',function(e,x){S().age=x.dataset.a;save();ev('age_set_'+x.dataset.a);sh.close();if(done)done()})}
function researchSheet(){var b=h5('<div><div class="list">'+
  '<div class="row"><span style="width:36px;height:36px;border-radius:18px;background:var(--tint);display:flex;align-items:center;justify-content:center;color:var(--link)">'+icon('check').replace('<svg','<svg width="18" height="18" style="stroke:currentColor;fill:none;stroke-width:2.6"')+'</span><span class="rt"><b>Practice makes you better at the game itself.</b></span></div>'+
  '<div class="row"><span style="width:36px;height:36px;border-radius:18px;background:var(--sunk);display:flex;align-items:center;justify-content:center">'+icon('info').replace('<svg','<svg width="18" height="18" style="stroke:currentColor;fill:none;stroke-width:2.2"')+'</span><span class="rt"><b>Studies have not shown that it carries over to everyday life.</b></span></div>'+
  '<div class="row"><span style="width:36px;height:36px;border-radius:18px;background:var(--sunk);display:flex;align-items:center;justify-content:center">'+icon('heart').replace('<svg','<svg width="18" height="18" style="stroke:currentColor;fill:none;stroke-width:2.2"')+'</span><span class="rt"><b>Zest is for fun. Zest itself has not been studied.</b></span></div></div>'+
  '<p class="sm" style="margin-top:12px">Each story lists its sources. Not a medical device.</p></div>');Nav.sheet({title:'What the research says',body:b})}
