/* Zest web shell: the browser / home-screen build at orangepulplabs.com/zest/app/ (10 Nov 2026, plan: Zest/Docs/web-app-plan.md).
   Injected only in the web copy (tool/build_web.py), first script on the page, in place of the Android app's app-shell.js.
   - same flags as the app: ad placeholders off, v5's old nudge off
   - offline: registers ../sw.js (scope /zest/app/); a new version waits and is offered on Today, never mid-puzzle
   - no "Get the app" screen before playing (only with ?install); iPhone/iPad in a browser: after 3 puzzles solved, a 3-step "Add to Home Screen" guide (twice at most), and a Settings row
   - Android in a browser: after 3 puzzles solved, "Zest is on Google Play" (the app is the better home on Android)
   - moving progress: Safari and the home-screen app keep separate storage on iPhone, so "Copy my progress" (browser) and
     "Paste progress" (home-screen app, Settings, and a pill on the first screens) carry the save as a short text code
   - reminders: only in the Home Screen app (Web Push, iOS 16.4+); elsewhere the Reminders rows are hidden (.zw-nopush). Sign-in is
     Android-only for now. Turning reminders off (or losing permission) deletes the push address on our service (POST /v1/push/stop)
   - the Home Screen steps (STEPS) are the same words as the website's (IOS_STEPS in ~/dev/site-gen.py, which checks this file)
   Copy rules: no brain or health claims, no pressure, no emoji. */
(function(){
  try{var fl=JSON.parse(localStorage.getItem('zv5.flags')||'{}');fl.ads=false;fl.reminders=false;localStorage.setItem('zv5.flags',JSON.stringify(fl))}catch(e){}
  var ua=navigator.userAgent||'',q=location.search;
  var iOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)||/[?&]as=ios\b/.test(q);
  var android=!iOS&&(/Android/.test(ua)||/[?&]as=android\b/.test(q));
  var home=!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches))||/[?&]as=home\b/.test(q);
  var inApp=/FBAN|FBAV|Instagram|Line\/|GSA\/|WhatsApp|Snapchat|Twitter|LinkedInApp|musical_ly|TikTok/.test(ua);
  var browser=/CriOS/.test(ua)?'chrome':/FxiOS/.test(ua)?'firefox':/EdgiOS/.test(ua)?'edge':'safari';
  var PLAY='https://play.google.com/store/apps/details?id=com.orangepulplabs.zest',BETA='/beta/';
  var iosV=+((/OS (\d+)_/.exec(ua)||[])[1]||0),iPad=/iPad/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  /* where the Share button is: iPhone Safari = bottom bar (iOS 26: the ... button at the bottom right first); iPad Safari and Chrome = top right */
  var SPOT=inApp?'':(browser==='chrome'||iPad)?'top':browser==='safari'?(iosV>=26?'br':'bottom'):'';
  var W=window.ZWEB={iOS:iOS,android:android,home:home,inApp:inApp,browser:browser,update:null,log:[]};
  document.documentElement.classList.add(home?'zw-home':'zw-browser');
  var PUSHOK=home&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window||/[?&]as=pushtest\b/.test(q);
  document.documentElement.classList.add(PUSHOK?'zw-push':'zw-nopush');
  function ev2(n){W.log.push(n);try{if(typeof ev==='function')ev(n)}catch(e){}}
  /* Home Screen counts (10 Nov 2026): two anonymous daily totals in the usual usage counts (no identifier; off with Settings > Share anonymous counts).
     web_home_install: the first open from the Home Screen icon on this phone. web_home_open: at most once a day per phone, from the icon. */
  window.addEventListener('load',function(){try{if(window.EV_ALLOW)['web_home_install','web_home_open'].forEach(function(n){if(EV_ALLOW.indexOf(n)<0)EV_ALLOW.push(n)});
    if(!home)return;var k=K(),d=typeof T==='function'?T():new Date().toISOString().slice(0,10);
    if(!k.inst){k.inst=1;ev2('web_home_install')}if(k.open!==d){k.open=d;ev2('web_home_open')}setK(k)}catch(e){}});
  function K(){var t={};try{var st=JSON.parse(localStorage.getItem('zv5.web')||'{}');if(st&&typeof st==='object')t=st}catch(e){}return t}
  function setK(t){try{localStorage.setItem('zv5.web',JSON.stringify(t))}catch(e){}}

  /* ---------- offline + updates ---------- */
  if('serviceWorker' in navigator&&(location.protocol==='https:'||/^(127\.0\.0\.1|localhost)$/.test(location.hostname))&&!/[?&]nosw\b/.test(q)){
    window.addEventListener('load',function(){navigator.serviceWorker.register('../sw.js',{scope:'../'}).then(function(reg){
      function watch(w){if(!w)return;w.addEventListener('statechange',function(){if(w.state==='installed'&&navigator.serviceWorker.controller){W.update=w;ev2('web_update_ready')}})}
      if(reg.waiting&&navigator.serviceWorker.controller)W.update=reg.waiting;
      watch(reg.installing);reg.addEventListener('updatefound',function(){watch(reg.installing)});
      setInterval(function(){try{reg.update()}catch(e){}},30*60*1000);
    }).catch(function(e){W.log.push('sw:'+e)})});
    var reloaded=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(W.applying&&!reloaded){reloaded=true;location.reload()}});
  }

  /* ---------- reminders (Home Screen app, iOS 16.4+): plays the Android app's part for v6/remind6.js ----------
     remind6 builds the 7-day plan and talks to "the app" through ZestNative. Here: the plan's words are kept for the service worker
     (cache 'zpush'), and only its times go to our service (POST /v1/push/plan), which sends an empty push at each time (zest-api src/push.js).
     Permission is asked only from remind6's own explainer (Allow) or a Settings switch, as on Android. */
  var PROD='https://zest-api.orangepulplabs.workers.dev';
  function api(){try{return (typeof API!=='undefined'&&API)||PROD}catch(e){return PROD}}
  function u8(b){b=b.replace(/-/g,'+').replace(/_/g,'/');var r=atob(b+'==='.slice((b.length+3)%4)),a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a}
  function granted(){try{return Notification.permission==='granted'}catch(e){return false}}
  function tell(){try{if(window.__zestNotif)window.__zestNotif({sdk:34,enabled:granted()})}catch(e){}}
  function subscription(create){return navigator.serviceWorker.ready.then(function(reg){return reg.pushManager.getSubscription().then(function(s){if(s||!create)return s;
      return fetch(api()+'/v1/push/key').then(function(r){return r.json()}).then(function(k){return reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(k.key)})})})})}
  var lastItems=null;
  /* reminders off (an empty plan) or permission gone: forget the push address on our service and drop the browser's subscription */
  function stopPush(){return subscription(false).then(function(s){if(!s)return null;
      return fetch(api()+'/v1/push/stop',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({endpoint:s.endpoint})})
        .then(function(r){W.log.push('push:stop '+r.status);return s.unsubscribe()})}).catch(function(e){W.log.push('push:stoperr '+e)})}
  function postPlan(){if(!lastItems)return Promise.resolve(null);if(!granted()||!lastItems.length)return stopPush();return subscription(true).then(function(s){if(!s)return null;
      return fetch(api()+'/v1/push/plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({endpoint:s.endpoint,at:lastItems.map(function(x){return x.at})})})
        .then(function(r){W.log.push('push:plan '+r.status);return r.status})}).catch(function(e){W.log.push('push:err '+e)})}
  function keepWords(items){try{caches.open('zpush').then(function(c){return c.put(new URL('../push-plan',document.baseURI).href,new Response(JSON.stringify(items),{headers:{'content-type':'application/json'}}))})}catch(e){}}
  if(PUSHOK){
    window.ZestNative={postMessage:function(m){m=String(m||'');var i=m.indexOf(':'),k=m.slice(0,i),v=m.slice(i+1);W.log.push('native:'+k);
      if(k==='remind'){try{var o=JSON.parse(v);lastItems=o.items||[];keepWords(lastItems);postPlan()}catch(e){}}
      else if(k==='notif'&&v==='status')setTimeout(tell,0);
      else if(k==='notif'&&v==='ask'){var p;try{p=Notification.requestPermission()}catch(e){p=null}   /* in the tap, before any await: iOS needs that */
        Promise.resolve(p).then(function(){if(!granted()){tell();return}return subscription(true).then(function(){return postPlan()}).catch(function(e){W.log.push('push:sub '+e)}).then(tell)})}
      else if(k==='notif'&&v==='settings')say('Turn them on in iPhone Settings, then Notifications, then Zest.')}};
    W.push={post:postPlan,sub:subscription,stop:stopPush};
  }
  // a tapped reminder opens ./?rem=daily|reel (or messages an open window): go where remind6 would on Android
  function remOpen(r){if(r!=='daily'&&r!=='reel')return;var n=0;(function go(){if(window.__zestRemOpen){window.__zestRemOpen(r)}else if(n++<40)setTimeout(go,250)})()}
  try{navigator.serviceWorker.addEventListener('message',function(e){if(e.data&&e.data.rem)remOpen(e.data.rem)})}catch(e){}
  var remQ=/[?&]rem=(daily|reel)\b/.exec(q);if(remQ)window.addEventListener('load',function(){setTimeout(function(){remOpen(remQ[1])},300)});

  /* ---------- progress code: every localStorage key of the app (zv5*, the teaching state zt*), as one line of text ---------- */
  var KEEP=/^(zv5|zt)/;
  function exportCode(){var o={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(KEEP.test(k)&&k!=='zv5.web')o[k]=localStorage.getItem(k)}
    var s=JSON.stringify({v:1,at:Date.now(),d:o});return 'ZEST1:'+btoa(unescape(encodeURIComponent(s)))}
  function readCode(t){t=String(t||'').trim();var m=/ZEST1:([A-Za-z0-9+/=]+)/.exec(t);if(!m)return null;
    try{var o=JSON.parse(decodeURIComponent(escape(atob(m[1]))));return o&&o.v===1&&o.d&&typeof o.d==='object'?o:null}catch(e){return null}}
  function importCode(o){Object.keys(o.d).forEach(function(k){if(KEEP.test(k))try{localStorage.setItem(k,String(o.d[k]))}catch(e){}});var t=K();t.imported=Date.now();setK(t)}
  W.exportCode=exportCode;W.readCode=readCode;
  function copy(t){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t).then(function(){return true},function(){return fallback(t)});return Promise.resolve(fallback(t))}
  function fallback(t){try{var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;top:-1000px;opacity:0';document.body.appendChild(a);a.select();a.setSelectionRange(0,t.length);var ok=document.execCommand('copy');a.remove();return ok}catch(e){return false}}

  /* ---------- small UI helpers (the game's own sheet and toast when they exist) ---------- */
  var CSS='.zw-steps{list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column;gap:12px;counter-reset:s}'+
    '.zw-steps li{display:flex;align-items:center;gap:12px;font:600 1rem/1.35 var(--font,system-ui)}'+
    '.zw-steps li::before{counter-increment:s;content:counter(s);flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--sunk,#eee);font:700 .9rem var(--font,system-ui)}'+
    '.zw-ico{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:8px;background:var(--sunk,#eee);vertical-align:middle;margin:0 2px;flex:none}'+
    '.zw-ico svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'+
    '.zw-pill{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9000;display:flex;align-items:center;gap:8px;'+
      'background:var(--ink,#1B1916);color:var(--bg,#F7F4EE);border:0;border-radius:999px;padding:10px 16px;font:650 .95rem var(--font,system-ui);box-shadow:0 6px 24px rgba(0,0,0,.18);max-width:calc(100% - 32px)}'+
    '.zw-pill[hidden]{display:none}.zw-pill .x{opacity:.7;padding-left:6px}'+
    '.zw-box{margin-top:14px;padding:12px;border-radius:14px;background:var(--sunk,#eee)}.zw-box p{margin:0}'+
    '.zw-arrow{position:fixed;z-index:9700;pointer-events:none;width:56px;height:56px;color:var(--accent,#E8590C);filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))}'+
    '.zw-arrow svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}'+
    '.zw-arrow.bottom{left:50%;bottom:calc(6px + env(safe-area-inset-bottom,0px));margin-left:-28px;animation:zwb 1s ease-in-out infinite}'+
    '.zw-arrow.br{right:14px;bottom:calc(6px + env(safe-area-inset-bottom,0px));animation:zwb 1s ease-in-out infinite}'+
    '.zw-arrow.top{right:18px;top:calc(4px + env(safe-area-inset-top,0px));transform:rotate(180deg);animation:zwt 1s ease-in-out infinite}'+
    '@keyframes zwb{50%{translate:0 8px}}@keyframes zwt{50%{translate:0 -8px}}@media (prefers-reduced-motion:reduce){.zw-arrow{animation:none!important}}'+
    '.zw-gate{position:fixed;inset:0;z-index:9600;background:var(--bg,#F7F4EE);color:var(--ink,#1B1916);overflow:auto;display:flex;flex-direction:column;'+
      'padding:calc(28px + env(safe-area-inset-top,0px)) 22px calc(28px + env(safe-area-inset-bottom,0px))}'+
    '.zw-gate .in{max-width:440px;width:100%;margin:auto}.zw-gate h1{font:700 1.9rem/1.12 var(--serif,Georgia,serif);margin:14px 0 6px}.zw-gate .lede{color:var(--muted,#675F55);margin:0}'+
    '.zw-bdg{display:flex;align-items:center;gap:13px;width:100%;min-height:58px;padding:0 17px;margin-top:12px;border-radius:14px;background:#000;color:#fff;border:1px solid #A6A6A6;text-decoration:none;font:600 1rem var(--font,system-ui);cursor:pointer;text-align:left}'+
    '.zw-bdg[hidden]{display:none}.zw-bdg svg{width:21px;height:34px;flex:none}.zw-bdg span{display:flex;flex-direction:column;gap:3px;line-height:1}.zw-bdg small{font:600 .66rem var(--font,system-ui);letter-spacing:.07em;text-transform:uppercase}.zw-bdg b{font:600 1.45rem var(--font,system-ui);letter-spacing:-.015em}'+
    '.zw-gp{display:block;margin-top:12px}.zw-gp img{display:block;height:58px;width:auto;max-width:100%}'+
    '.zw-gate .zw-steps{margin-top:16px}.zw-gate .sm,[data-zwplay] .sm{color:var(--muted,#675F55);font-size:.9rem}.zw-link{display:block;margin:18px auto 0;background:none;border:0;color:var(--ink,#1B1916);font:650 1rem var(--font,system-ui);text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:10px}';
  function css(){if(document.getElementById('zw-css'))return;var s=document.createElement('style');s.id='zw-css';s.textContent=CSS;document.head.appendChild(s)}
  var SHARE='<svg viewBox="0 0 24 24"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  var ADD='<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
  var DOTS='<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>';
  function ico(s){return '<span class="zw-ico" aria-hidden="true">'+s+'</span>'}
  function E(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function node(h){var d=document.createElement('div');d.innerHTML=h;return d.firstChild}
  function sheet(title,body){css();try{if(typeof Nav!=='undefined'&&Nav.sheet)return Nav.sheet({title:title,body:body})}catch(e){}
    var ov=node('<div role="dialog" aria-label="'+E(title)+'" style="position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.4);display:flex;align-items:flex-end"><div style="background:var(--bg,#fff);color:var(--ink,#111);width:100%;border-radius:20px 20px 0 0;padding:20px 20px calc(20px + env(safe-area-inset-bottom,0px))"><h2 style="margin:0 0 6px;font:700 1.2rem var(--font,system-ui)">'+E(title)+'</h2></div></div>');
    ov.firstChild.appendChild(body);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove()});document.body.appendChild(ov);return {close:function(){ov.remove()},el:ov}}
  function say(t){try{if(typeof toast==='function'){toast(t);return}}catch(e){}W.log.push('toast:'+t)}
  function quiet(){try{return !!(window.ZREM&&ZREM.quiet&&ZREM.quiet())}catch(e){return false}}
  function wins(){var n=K().wins|0;try{n=Math.max(n,Object.keys(S().cards||{}).length)}catch(e){}return n}   // puzzles won here (counted by the markWin hook), or stories collected

  var ARW='<svg viewBox="0 0 24 24"><path d="M12 3v17M5 13l7 7 7-7"/></svg>';
  function arrow(){if(!SPOT||home)return null;css();var a=node('<div class="zw-arrow '+SPOT+'" aria-hidden="true">'+ARW+'</div>');document.body.appendChild(a);return a}
  /* the Home Screen steps: the same words as the website (IOS_STEPS in ~/dev/site-gen.py). Only the Share step changes where Share is
     not in Safari's place (Chrome and iPad: top right; an unknown browser: its menu). */
  var STEPS=["Tap Share. On iOS 26, tap \u00b7\u00b7\u00b7 first, then Share.","Tap Add to Home Screen, then Add.","Open Zest from your Home Screen."];
  var HEAD='Add it to your Home Screen',LEDE='Free. Opens full screen and works offline, like any app.';
  function step(i){var t=E(STEPS[i]);
    if(i===0){if(SPOT==='top')return 'Tap '+ico(SHARE)+' Share at the top right.';if(!SPOT)return 'Open your browser\u2019s menu and tap '+ico(SHARE)+' Share.';
      return t.replace('Tap Share','Tap '+ico(SHARE)+' Share').replace('tap \u00b7\u00b7\u00b7','tap '+ico(DOTS))}
    if(i===1)return t.replace('Tap Add to Home Screen','Tap '+ico(ADD)+' <b>Add to Home Screen</b>').replace(/Add\.$/,'<b>Add</b>.');
    return t}
  function stepsHTML(){return '<li><span>'+step(0)+'</span></li><li><span>'+step(1)+'</span></li><li><span>'+step(2)+'</span></li>'}
  var shareStep=function(){return step(0)};
  W.arrow=arrow;W.spot=SPOT;

  /* ---------- the install guide (iPhone/iPad) ---------- */
  function guideHTML(){
    var share=shareStep();
    if(inApp)return '<div data-zwguide><p>This page is open inside another app, which can’t add it to your Home Screen.</p>'+
      '<ol class="zw-steps"><li><span>Tap '+ico(DOTS)+' or '+ico(SHARE)+' and choose <b>Open in Safari</b>.</span></li><li><span>Then add it to your Home Screen from Safari.</span></li></ol>'+
      '<div style="display:flex;flex-direction:column;gap:8px;margin-top:16px"><button class="btn pri wide" data-zwlink>Copy link</button><button class="btn ghost wide" data-zwno>Not now</button></div></div>';
    var has=wins()>0||!!(function(){try{return S().onb}catch(e){return 0}})();
    return '<div data-zwguide><p>'+LEDE+'</p>'+
      '<ol class="zw-steps">'+stepsHTML()+'</ol>'+
      (has?'<div class="zw-box"><p class="sm">The Home Screen app starts fresh. To bring today’s progress along, copy it first, then paste it there (Settings, Paste progress).</p><button class="btn sec wide" style="margin-top:10px" data-zwcopy>Copy my progress</button></div>':'')+
      '<div style="margin-top:16px"><button class="btn ghost wide" data-zwno>Not now</button></div></div>'}
  function showGuide(why){if(home)return;var t=K();t.guide=(t.guide|0)+1;t.guideAt=Date.now();setK(t);ev2('web_guide_'+(why||'open'));
    var b=node(guideHTML()),sh=sheet(inApp?'Open in Safari':HEAD,b),ar=inApp?null:arrow();
    var cl0=sh.close;sh.close=function(){if(ar)ar.remove();return cl0.apply(this,arguments)};var iv=setInterval(function(){if(sh.el&&!sh.el.isConnected){clearInterval(iv);if(ar)ar.remove()}},500);
    var no=b.querySelector('[data-zwno]');if(no)no.onclick=function(){ev2('web_guide_later');sh.close()};
    var cp=b.querySelector('[data-zwcopy]');if(cp)cp.onclick=function(){copy(exportCode()).then(function(ok){ev2(ok?'web_progress_copied':'web_progress_copy_fail');
      cp.textContent=ok?'Copied. Paste it in the Home Screen app':'Copy failed: try again';})};
    var ln=b.querySelector('[data-zwlink]');if(ln)ln.onclick=function(){copy(location.href.split('?')[0]).then(function(ok){ln.textContent=ok?'Link copied: paste it in Safari':'Copy failed'})};
    W.lastSheet=sh;return sh}
  W.showGuide=showGuide;

  /* ---------- the welcome screen in a browser, before playing: get it for iPhone / on Google Play, or play here ---------- */
  var IPH='<svg viewBox="0 0 22 36" aria-hidden="true"><defs><linearGradient id="ibsun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7C76B"/><stop offset="1" stop-color="#E8590C"/></linearGradient></defs><rect x="1.5" y="1" width="19" height="34" rx="5" fill="#000" stroke="#fff" stroke-width="1.5"/><rect x="3.6" y="3" width="14.8" height="30" rx="3.3" fill="url(#ibsun)"/><rect x="8" y="4.3" width="6" height="1.9" rx=".95" fill="#000"/><rect x="7.5" y="30.2" width="7" height="1.3" rx=".65" fill="#fff" opacity=".9"/></svg>';
  var GPI='<svg viewBox="0 0 24 24"><path d="M5 3.5v17l9-8.5z"/><path d="M5 3.5l11 6.3-2 2.7M5 20.5l11-6.3-2-2.7M16 9.8l3.5 2.2-3.5 2.2"/></svg>';
  function gateDue(){return !home&&/[?&]install\b/.test(q)}   // 10 Nov 2026 (owner): the web app goes straight into the game; the app offer comes after a few wins (due)
  function gate(){css();ev2('web_gate');var t=K();t.gate=(t.gate|0)+1;setK(t);try{sessionStorage.setItem('zw-gate','1')}catch(e){}
    var iBtn='<button class="zw-bdg" type="button" data-zgi>'+IPH+'<span><small>Available for</small><b>iPhone</b></span></button>';
    var gBtn='<a class="zw-gp" href="'+PLAY+'" data-zgp rel="noopener"><img src="../icons/google-play.png" alt="Get it on Google Play" width="188" height="56"></a>'+
      '<p class="sm" style="margin:6px 2px 0">In testing on Google Play: <a href="'+BETA+'">join the beta</a></p>';
    var steps='<div data-zgsteps'+(iOS?'':' hidden')+'><ol class="zw-steps">'+(iOS?'':'<li><span>Open <b>orangepulplabs.com/zest/iphone</b> on your iPhone.</span></li>')+
      (inApp?'<li><span>Tap '+ico(DOTS)+' and choose <b>Open in Safari</b>.</span></li>':'')+
      stepsHTML()+'</ol></div>';
    var body=iOS?('<h1>'+HEAD+'</h1><p class="lede">'+LEDE+'</p>'+steps)
      :android?('<h1>Get the app</h1><p class="lede">Free on Google Play, with reminders and rankings.</p>'+gBtn)
      :('<h1>Get the app</h1><p class="lede">Free on iPhone and Android.</p>'+iBtn+steps+gBtn);
    var g=node('<div class="zw-gate" role="dialog" aria-modal="true" aria-label="Get the app"><div class="in"><div aria-hidden="true" style="width:56px;height:56px;border-radius:14px;overflow:hidden"><img src="../icons/icon-192.png" alt="" width="56" height="56"></div>'+body+
      '<button class="zw-link" type="button" data-zgx>Or play in your browser</button></div></div>');
    document.body.appendChild(g);var ar=iOS&&!inApp?arrow():null;
    var ib=g.querySelector('[data-zgi]');if(ib)ib.onclick=function(){var st=g.querySelector('[data-zgsteps]');st.hidden=!st.hidden;ev2('web_gate_iphone')};
    var gp=g.querySelector('[data-zgp]');if(gp)gp.onclick=function(){ev2('web_gate_play')};
    g.querySelector('[data-zgx]').onclick=function(){ev2('web_gate_browser');if(ar)ar.remove();g.remove()};W.gate=g;return g}
  W.showGate=gate;

  /* ---------- Android in a browser: the Play app ---------- */
  function showPlay(){var t=K();t.play=(t.play|0)+1;setK(t);ev2('web_play_offer');
    var b=node('<div data-zwplay><p>There is an Android app on Google Play, with reminders, rankings and your progress in one place. Free.</p>'+
      '<a class="zw-gp" href="'+PLAY+'" data-zwgo rel="noopener"><img src="../icons/google-play.png" alt="Get it on Google Play" width="188" height="56"></a>'+
      '<p class="sm" style="margin:6px 2px 0">In testing on Google Play: <a href="'+BETA+'">join the beta</a></p>'+
      '<div style="margin-top:16px"><button class="btn ghost wide" data-zwno>Keep playing here</button></div></div>');
    var sh=sheet('Get the Android app',b);b.querySelector('[data-zwno]').onclick=function(){sh.close()};b.querySelector('[data-zwgo]').onclick=function(){ev2('web_play_go')};W.lastSheet=sh;return sh}

  /* ---------- paste progress (home-screen app) ---------- */
  function paste(done){function use(txt){var o=readCode(txt);if(!o){say('That isn’t a Zest progress code');ev2('web_paste_bad');if(done)done(false);return}
      importCode(o);ev2('web_paste_ok');say('Progress moved. Reloading…');setTimeout(function(){location.reload()},700);if(done)done(true)}
    if(navigator.clipboard&&navigator.clipboard.readText)navigator.clipboard.readText().then(use,function(){manual(use)});else manual(use)}
  function manual(use){var b=node('<div><p class="sm">Paste the code you copied (it starts with ZEST1).</p><textarea data-zwta rows="4" style="width:100%;margin-top:10px;border-radius:12px;padding:10px;font:500 .9rem ui-monospace,monospace;background:var(--sunk,#eee);color:inherit;border:0"></textarea>'+
      '<div style="margin-top:12px"><button class="btn pri wide" data-zwok>Use this code</button></div></div>');var sh=sheet('Paste progress',b);
    b.querySelector('[data-zwok]').onclick=function(){var v=b.querySelector('[data-zwta]').value;sh.close();use(v)}}
  W.paste=paste;

  /* ---------- hooks (wrapped once the game's scripts have run) ---------- */
  var WINS_BEFORE_OFFER=3;   // puzzles solved before the browser offers the app (Android: Google Play; iPhone: Add to Home Screen)
  var pend=0;
  function due(){if(home||wins()<WINS_BEFORE_OFFER)return false;var t=K();if(iOS){if((t.guide|0)>=2)return false;if((t.guide|0)===1&&Date.now()-(t.guideAt|0)<3*864e5)return false;return true}
    if(android)return (t.play|0)<1;return false}
  document.addEventListener('DOMContentLoaded',function(){css();
    try{var mw0=markWin;markWin=function(o){var r=mw0.apply(this,arguments);try{if(o&&o.id){var t=K();t.wins=(t.wins|0)+1;setK(t);if(due())pend=Date.now()}}catch(e){}return r}}catch(e){}
    try{var os0=openSettings;openSettings=function(){var sh=os0.apply(this,arguments);try{settingsRow(sh)}catch(e){}return sh}}catch(e){}
    try{onboardAfterWin=function(){finishOnboarding()}}catch(e){}   // 11 Nov 2026: no age question after the first win on the web (no sign-in or rankings here); Settings still has Age group
    if(gateDue())gate();
    pastePill();
  });
  setInterval(function(){
    if(pend&&quiet()){pend=0;setTimeout(function(){if(!quiet())return;var a=window.ZREM&&ZREM.askDue&&ZREM.askDue();if(a)return;if(iOS)showGuide('win');else if(android)showPlay()},1200)}
    if(W.update&&!W.offered&&quiet()){W.offered=1;updatePill()}
  },800);

  function updatePill(){css();var p=node('<button class="zw-pill" type="button" data-zwup>New version ready <b>Refresh</b></button>');document.body.appendChild(p);ev2('web_update_offer');
    p.onclick=function(){ev2('web_update_apply');W.applying=1;p.textContent='Updating…';try{W.update.postMessage('skip')}catch(e){location.reload()}setTimeout(function(){location.reload()},4000)}}
  function pastePill(){if(!home)return;var t=K();if(t.pill||t.imported)return;var onb=0;try{onb=S().onb}catch(e){}if(onb)return;
    css();var p=node('<button class="zw-pill" type="button" data-zwpaste>Played in Safari before? Bring your progress <span class="x" data-zwx aria-label="Dismiss">✕</span></button>');
    document.body.appendChild(p);p.onclick=function(e){t.pill=1;setK(t);if(e.target&&e.target.closest('[data-zwx]')){p.remove();return}p.remove();paste()};
    var iv=setInterval(function(){var o=0;try{o=S().onb}catch(e){}if(o||!p.isConnected){clearInterval(iv);p.remove()}},1500)}

  function settingsRow(sh){var root=sh&&sh.el;if(!root||root.querySelector('[data-zwset]'))return;
    var rows='';
    if(!home&&iOS)rows+='<div class="row" data-zwrow="guide"><span class="rt"><b>Add to Home Screen</b><small>Opens full screen and works offline</small></span><button class="btn sec" data-zwg>How</button></div>';
    if(!home&&android)rows+='<div class="row" data-zwrow="play"><span class="rt"><b>Get the Android app</b><small>On Google Play</small></span><button class="btn sec" data-zwp>Open</button></div>';
    rows+='<div class="row" data-zwrow="copy"><span class="rt"><b>Copy my progress</b><small>As a code, to move it to another browser or phone</small></span><button class="btn sec" data-zwc>Copy</button></div>';
    rows+='<div class="row" data-zwrow="paste"><span class="rt"><b>Paste progress</b><small>Replaces the progress on this device</small></span><button class="btn sec" data-zwv>Paste</button></div>';
    var box=node('<div class="sect" data-zwset><div class="sh"><h2>This device</h2></div><div class="card list" style="padding:4px 16px">'+rows+'</div></div>');
    var first=root.querySelector('.sect');if(first&&first.parentNode)first.parentNode.insertBefore(box,first.nextSibling);else root.appendChild(box);
    var g=box.querySelector('[data-zwg]');if(g)g.onclick=function(){showGuide('settings')};
    var pp=box.querySelector('[data-zwp]');if(pp)pp.onclick=function(){showPlay()};
    box.querySelector('[data-zwc]').onclick=function(){var b=this;copy(exportCode()).then(function(ok){b.textContent=ok?'Copied':'Failed';ev2(ok?'web_progress_copied':'web_progress_copy_fail')})};
    box.querySelector('[data-zwv]').onclick=function(){paste()}}
})();
