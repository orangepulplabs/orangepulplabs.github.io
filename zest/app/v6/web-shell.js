/* Zest web shell: the browser / home-screen build at orangepulplabs.com/zest/app/ (10 Nov 2026, plan: Zest/Docs/web-app-plan.md).
   Injected only in the web copy (tool/build_web.py), first script on the page, in place of the Android app's app-shell.js.
   - same flags as the app: ad placeholders off, v5's old nudge off
   - offline: registers ../sw.js (scope /zest/app/); a new version waits and is offered on Today, never mid-puzzle
   - iPhone/iPad in a browser: after the first win, a 3-step "Add to Home Screen" guide (twice at most), and a Settings row
   - Android in a browser: after the first win, "Zest is on Google Play" (the app is the better home on Android)
   - moving progress: Safari and the home-screen app keep separate storage on iPhone, so "Copy my progress" (browser) and
     "Paste progress" (home-screen app, Settings, and a pill on the first screens) carry the save as a short text code
   - Reminders and sign-in are app-only for now: their Settings rows are hidden by CSS in the web build
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
  var W=window.ZWEB={iOS:iOS,android:android,home:home,inApp:inApp,browser:browser,update:null,log:[]};
  document.documentElement.classList.add(home?'zw-home':'zw-browser');
  function ev2(n){W.log.push(n);try{if(typeof ev==='function')ev(n)}catch(e){}}
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
    '.zw-box{margin-top:14px;padding:12px;border-radius:14px;background:var(--sunk,#eee)}.zw-box p{margin:0}';
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
  function wins(){try{var v=S();return Object.keys(v.solved||v.done||v.wins||{}).length||(v.stats&&v.stats.wins)||0}catch(e){return 0}}

  /* ---------- the install guide (iPhone/iPad) ---------- */
  function guideHTML(){
    var share=browser==='safari'?'Tap '+ico(SHARE)+' Share. If you don’t see it, tap '+ico(DOTS)+' first.'
      :browser==='chrome'?'Tap '+ico(SHARE)+' Share, at the top right next to the address.'
      :'Open your browser’s menu and tap '+ico(SHARE)+' Share.';
    if(inApp)return '<div data-zwguide><p>This page is open inside another app, which can’t add it to your Home Screen.</p>'+
      '<ol class="zw-steps"><li><span>Tap '+ico(DOTS)+' or '+ico(SHARE)+' and choose <b>Open in Safari</b>.</span></li><li><span>Then add Zest to your Home Screen from Safari.</span></li></ol>'+
      '<div style="display:flex;flex-direction:column;gap:8px;margin-top:16px"><button class="btn pri wide" data-zwlink>Copy link</button><button class="btn ghost wide" data-zwno>Not now</button></div></div>';
    var has=wins()>0||!!(function(){try{return S().onb}catch(e){return 0}})();
    return '<div data-zwguide><p>Zest works like an app from your Home Screen: full screen, offline, and your progress stays put. Free, no App Store needed.</p>'+
      '<ol class="zw-steps"><li><span>'+share+'</span></li><li><span>Scroll down and tap '+ico(ADD)+' <b>Add to Home Screen</b>.</span></li><li><span>Tap <b>Add</b>, then open Zest from your Home Screen.</span></li></ol>'+
      (has?'<div class="zw-box"><p class="sm">Your Home Screen Zest starts fresh. To bring today’s progress along, copy it first, then paste it there (Settings, Paste progress).</p><button class="btn sec wide" style="margin-top:10px" data-zwcopy>Copy my progress</button></div>':'')+
      '<div style="margin-top:16px"><button class="btn ghost wide" data-zwno>Not now</button></div></div>'}
  function showGuide(why){if(home)return;var t=K();t.guide=(t.guide|0)+1;t.guideAt=Date.now();setK(t);ev2('web_guide_'+(why||'open'));
    var b=node(guideHTML()),sh=sheet(inApp?'Open in Safari':'Add Zest to your Home Screen',b);
    var no=b.querySelector('[data-zwno]');if(no)no.onclick=function(){ev2('web_guide_later');sh.close()};
    var cp=b.querySelector('[data-zwcopy]');if(cp)cp.onclick=function(){copy(exportCode()).then(function(ok){ev2(ok?'web_progress_copied':'web_progress_copy_fail');
      cp.textContent=ok?'Copied. Paste it in your Home Screen Zest':'Copy failed: try again';})};
    var ln=b.querySelector('[data-zwlink]');if(ln)ln.onclick=function(){copy(location.href.split('?')[0]).then(function(ok){ln.textContent=ok?'Link copied: paste it in Safari':'Copy failed'})};
    W.lastSheet=sh;return sh}
  W.showGuide=showGuide;

  /* ---------- Android in a browser: the Play app ---------- */
  function showPlay(){var t=K();t.play=(t.play|0)+1;setK(t);ev2('web_play_offer');
    var b=node('<div data-zwplay><p>Zest is an Android app on Google Play: reminders, rankings and your progress in one place. Free.</p>'+
      '<div style="display:flex;flex-direction:column;gap:8px;margin-top:16px"><a class="btn pri wide" href="'+PLAY+'" data-zwgo>Get it on Google Play</a>'+
      '<a class="btn sec wide" href="'+BETA+'">In testing: join the beta first</a><button class="btn ghost wide" data-zwno>Keep playing here</button></div></div>');
    var sh=sheet('Zest is on Google Play',b);b.querySelector('[data-zwno]').onclick=function(){sh.close()};b.querySelector('[data-zwgo]').onclick=function(){ev2('web_play_go')};W.lastSheet=sh;return sh}

  /* ---------- paste progress (home-screen app) ---------- */
  function paste(done){function use(txt){var o=readCode(txt);if(!o){say('That isn’t a Zest progress code');ev2('web_paste_bad');if(done)done(false);return}
      importCode(o);ev2('web_paste_ok');say('Progress moved. Reloading…');setTimeout(function(){location.reload()},700);if(done)done(true)}
    if(navigator.clipboard&&navigator.clipboard.readText)navigator.clipboard.readText().then(use,function(){manual(use)});else manual(use)}
  function manual(use){var b=node('<div><p class="sm">Paste the code you copied (it starts with ZEST1).</p><textarea data-zwta rows="4" style="width:100%;margin-top:10px;border-radius:12px;padding:10px;font:500 .9rem ui-monospace,monospace;background:var(--sunk,#eee);color:inherit;border:0"></textarea>'+
      '<div style="margin-top:12px"><button class="btn pri wide" data-zwok>Use this code</button></div></div>');var sh=sheet('Paste progress',b);
    b.querySelector('[data-zwok]').onclick=function(){var v=b.querySelector('[data-zwta]').value;sh.close();use(v)}}
  W.paste=paste;

  /* ---------- hooks (wrapped once the game's scripts have run) ---------- */
  var pend=0;
  function due(){if(home)return false;var t=K();if(iOS){if((t.guide|0)>=2)return false;if((t.guide|0)===1&&Date.now()-(t.guideAt|0)<3*864e5)return false;return true}
    if(android)return (t.play|0)<1;return false}
  document.addEventListener('DOMContentLoaded',function(){css();
    try{var mw0=markWin;markWin=function(o){var r=mw0.apply(this,arguments);try{if(o&&o.id&&due())pend=Date.now()}catch(e){}return r}}catch(e){}
    try{var os0=openSettings;openSettings=function(){var sh=os0.apply(this,arguments);try{settingsRow(sh)}catch(e){}return sh}}catch(e){}
    if(/[?&]install\b/.test(q)&&!home)setTimeout(function(){if(iOS)showGuide('link');else if(android)showPlay()},1200);
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
    if(!home&&iOS)rows+='<div class="row" data-zwrow="guide"><span class="rt"><b>Add to Home Screen</b><small>Full screen, offline, progress kept</small></span><button class="btn sec" data-zwg>How</button></div>';
    if(!home&&android)rows+='<div class="row" data-zwrow="play"><span class="rt"><b>Get the Android app</b><small>On Google Play</small></span><button class="btn sec" data-zwp>Open</button></div>';
    rows+='<div class="row" data-zwrow="copy"><span class="rt"><b>Copy my progress</b><small>As a code, to move it to another browser or phone</small></span><button class="btn sec" data-zwc>Copy</button></div>';
    rows+='<div class="row" data-zwrow="paste"><span class="rt"><b>Paste progress</b><small>Replaces the progress here</small></span><button class="btn sec" data-zwv>Paste</button></div>';
    var box=node('<div class="sect" data-zwset><div class="sh"><h2>This device</h2></div><div class="card list" style="padding:4px 16px">'+rows+'</div></div>');
    var first=root.querySelector('.sect');if(first&&first.parentNode)first.parentNode.insertBefore(box,first.nextSibling);else root.appendChild(box);
    var g=box.querySelector('[data-zwg]');if(g)g.onclick=function(){showGuide('settings')};
    var pp=box.querySelector('[data-zwp]');if(pp)pp.onclick=function(){showPlay()};
    box.querySelector('[data-zwc]').onclick=function(){var b=this;copy(exportCode()).then(function(ok){b.textContent=ok?'Copied':'Failed';ev2(ok?'web_progress_copied':'web_progress_copy_fail')})};
    box.querySelector('[data-zwv]').onclick=function(){paste()}}
})();
