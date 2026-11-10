/* Usage totals for the dashboard (11 Nov 2026, owner: "how many iPhones / Androids, how much time on which part"). Same rules as every count:
   a daily total per event, no identifier, sent a day late with the others (core.js ev / evFlush), off with Settings > Share anonymous counts.
   - dau, dau_<platform>: once a day per device: android (the app), ios_home (iPhone Home Screen app), ios_web, android_web, desktop_web
   - ret_new / ret_1_6 / ret_7_29 / ret_30p: once a day, how long ago this device first played (new vs returning players)
   - session: an open, or a return after 30 min away
   - came_back: once per device, the first open on a later day than its first day (new players who return)
   - every count is sent with the device kind (core.js evFlush: plat), so the dashboard can filter by device
   - min_<area>: minutes on screen, counted only while the page is visible and touched in the last 60 s:
     puzzle (a puzzle page), reel (the Reel), today, almanac, other (sheets such as Settings)
   Server: zest-api src/index.js EVENT_NAMES must list every name here. */
(function(){
  var NAMES=['dau','dau_android','dau_ios_home','dau_ios_web','dau_android_web','dau_desktop_web','ret_new','ret_1_6','ret_7_29','ret_30p','session',
    'min_puzzle','min_reel','min_today','min_almanac','min_other','came_back'];
  try{if(window.EV_ALLOW)NAMES.forEach(function(n){if(EV_ALLOW.indexOf(n)<0)EV_ALLOW.push(n)})}catch(e){}
  function M(){var v=S();if(!v.mt||typeof v.mt!=='object')v.mt={};return v.mt}
  function platform(){var w=window.ZWEB;if(!w)return window.ZestNative?'android':'desktop_web';
    if(w.home&&w.iOS)return 'ios_home';if(w.iOS)return 'ios_web';if(w.android)return 'android_web';return 'desktop_web'}
  function daily(){try{var m=M(),t=T();if(m.d===t)return;m.d=t;ev('dau');ev('dau_'+platform());
    var f=S().first,n=f?daysBetween(f,t):0;ev(n<=0?'ret_new':n<7?'ret_1_6':n<30?'ret_7_29':'ret_30p');
    if(m.since==null){m.since=t;if(n>=1)m.back=1}   // players from before this code: never counted as came_back (it would spike on rollout)
    if(n>=1&&!m.back){m.back=1;ev('came_back')}   // once per device: the first open on a later day than the first one
    save()}catch(e){}}
  function area(){try{if(document.querySelector('.sheet'))return 'other';if(window.RUN&&RUN.ctrl&&Nav.depth)return 'puzzle';
    var c=Nav.cur;return c==='play'?'reel':c==='almanac'?'almanac':'today'}catch(e){return 'other'}}
  var last=Date.now(),away=0,TICK=15000;
  ['pointerdown','keydown','scroll','touchstart'].forEach(function(k){addEventListener(k,function(){last=Date.now()},{passive:true,capture:true})});
  document.addEventListener('visibilitychange',function(){if(document.hidden){away=Date.now();return}
    if(away&&Date.now()-away>30*60e3){try{ev('session')}catch(e){}daily()}away=0;last=Date.now()});
  setInterval(function(){if(document.hidden||Date.now()-last>60000)return;try{var m=M(),a=area();m.s=m.s||{};m.s[a]=(m.s[a]|0)+TICK/1000;
    if(m.s[a]>=60){var k=Math.floor(m.s[a]/60);m.s[a]-=k*60;for(var i=0;i<k;i++)ev('min_'+a)}save()}catch(e){}},TICK);
  function start(){try{if(!S().onb)return setTimeout(start,5000);ev('session');daily()}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(start,1500)});else setTimeout(start,1500);
  window.ZM={platform:platform,area:area,names:NAMES};
})();
