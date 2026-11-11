/* home-final (11 Nov 2026): the owner's pick, design B (Docs/home-redo/B-before.dc.html, B-after.dc.html), built on home-a "Just today".
   Loaded right after ../v5/almanac.js, so teach6.js (streak tip) and reel6.js still wrap this todayRender.
   Today is one full-height page, in two distinct themes:
   - before today's puzzle: date, the streak pill (opens the streak sheet), Settings; the puzzle's own art on a plate;
     "TODAY · <place>", the name, the story's first line, "Play today's puzzle".
     Light: terracotta #A9380B. Dark: near-black warm #1F1410 with terracotta as the accent (kicker, Play button, a glowing ring), plate dimmed.
   - after it: the pill filled amber, a moon, "Done for today.", "You solved <name> in <n> moves.", the story row (opens the story),
     "NEXT PUZZLE IN" with a live countdown to local midnight, and a link to the Reel.
     Light: a cream evening page #FBF7F0, white story card. Dark: a warm night page #17110E (one warm family with the dark before page).
   Coming back to Today right after the win, the page crossfades from before to after (none under reduced motion).
   The status bar (meta theme-color, and the Android shell's --bg poll) takes the page's colour while Today is showing.
   The tab bar floats as a rounded bar on Today only (in Today's colours); other screens keep the v5 bar.
   Blocks moved off Today in home-a: the week and goal are in the streak sheet, the season card is in the Almanac, the Reel is the Play tab. */
(function(){
var FLAME='<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/></svg>',
  GEAR='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  MOON='<svg width="58" height="58" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>',
  CHEV='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  PLAY='<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>';
var CSS=
  /* the Today screen is one page in its own colours */
  /* light theme: terracotta before, a cream evening page after */
  '#s-today.hm{--hb:#A9380B;--hi:#FFF8F1;--hs:#FFE7D6;--hk:#FAD4B8;--hbtn:#FFF8F1;--hbtx:#8A2E08;--hplate:#F8E3D1;--hring:rgba(247,201,168,.55);--hglow:rgba(255,248,241,.06);--hpb:rgba(255,248,241,.45);'+
    'background:var(--hb);color:var(--hi);transition:background-color .5s ease}'+
  '#s-today.hm.night{--hb:#FBF7F0;--hi:#1C1814;--hs:#5E564D;--hk:#1C1814;--hk2:#5E564D;--hacc:#9A330A;--hmoon:#E39A2D;--hpill:#E39A2D;--hpilltx:#1C1814;--hcard:#FFFFFF;--hcardb:#E6DFD3;--hchev:#5E564D}'+
  /* dark theme: a near-black warm page before (terracotta as the accent), the night page after */
  ':root[data-theme="dark"] #s-today.hm:not(.night){--hb:#1F1410;--hi:#F4EEE3;--hs:#E6D9CB;--hk:#F2A27A;--hbtn:#C2410C;--hbtx:#FFFFFF;--hplate:#CDB59C;--hring:rgba(242,162,122,.6);--hglow:rgba(194,65,12,.22);--hpb:rgba(244,238,227,.4)}'+
  ':root[data-theme="dark"] #s-today.hm:not(.night) .hplate{box-shadow:0 0 0 12px var(--hglow),0 0 56px 8px rgba(194,65,12,.35)}'+
  ':root[data-theme="dark"] #s-today.hm .hplate svg{filter:brightness(.9) saturate(.9)}'+
  ':root[data-theme="dark"] #s-today.hm.night{--hb:#17110E;--hi:#F4EEE3;--hs:#CDBFB2;--hk:#CDBFB2;--hk2:#CDBFB2;--hacc:#F2B65A;--hmoon:#F2B65A;--hpill:#F2B65A;--hpilltx:#17110E;--hcard:#241A15;--hcardb:transparent;--hchev:#CDBFB2}'+
  '.hfade{position:absolute;left:0;right:0;top:0;z-index:5;pointer-events:none;display:flex;flex-direction:column}'+
  '#app[data-tab="today"][data-deep="0"] .tabs{transition:background-color .6s ease}.rm #app .tabs{transition:none}'+
  '.rm #s-today.hm{transition:none}'+
  '#s-today.hm>.pad{padding:0;min-height:100%;display:flex;flex-direction:column}'+
  '#s-today.hm [data-blk]:empty{display:none}'+
  '#s-today.hm [data-blk="hero"]{flex:1;display:flex;flex-direction:column}'+
  '.hm .hhead{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:calc(12px + env(safe-area-inset-top,0px)) 10px 0 24px;min-height:44px}'+
  '.hm .hdate{font:700 13px/1.2 var(--font);letter-spacing:.08em;color:var(--hk)}.hm:not(.night) .hdate{color:var(--hi)}'+
  '.hm .hr{display:flex;align-items:center;gap:4px}'+
  '.hm .hpill{display:flex;align-items:center;gap:6px;height:44px;padding:0 4px;border:0;background:none;color:var(--hi);font:700 15px/1 var(--font);font-variant-numeric:tabular-nums;cursor:pointer}'+
  '.hm .hpill>span{display:flex;align-items:center;gap:6px;height:36px;padding:0 13px;border-radius:99px;border:1px solid var(--hpb)}'+
  '.hm .hpill svg{fill:currentColor}'+
  '#s-today.hm.night>.pad .hpill>span{border:0;background:var(--hpill);color:var(--hpilltx)}'+
  '.hm .hpill.off>span{opacity:.8}'+
  '.hm .hset{width:44px;height:44px;border:0;background:none;color:var(--hi);display:flex;align-items:center;justify-content:center;cursor:pointer}'+
  '.hm button:focus-visible,.hm a:focus-visible{outline:3px solid var(--hi);outline-offset:2px;border-radius:12px}'+
  /* before */
  '.hm .hart{flex:1;display:flex;align-items:center;justify-content:center;padding:12px 0;min-height:200px}'+
  '.hm .hplate{position:relative;width:min(68vw,36vh,290px);aspect-ratio:1;border-radius:50%;background:var(--hplate);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 12px var(--hglow)}'+
  '.hm .hplate::after{content:"";position:absolute;inset:-22px;border-radius:50%;border:1.5px dashed var(--hring)}'+
  '.hm .hplate svg{width:76%;height:76%}'+
  '.hm .hbot{padding:0 26px calc(112px + env(safe-area-inset-bottom,0px))}'+
  '.hm .hkick{font:700 12px/1.3 var(--font);letter-spacing:.1em;text-transform:uppercase;color:var(--hk)}'+
  '.hm h1.hname{font:700 56px/.95 var(--disp);letter-spacing:-.02em;margin:4px 0 0;color:var(--hi);overflow-wrap:anywhere}'+
  '.hm .hhook{font:italic 600 18px/1.5 var(--disp);margin:14px 0 0;color:var(--hs)}'+
  '.hm .hplay{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:58px;margin-top:24px;border:0;border-radius:18px;background:var(--hbtn);color:var(--hbtx);font:700 17px var(--font);cursor:pointer}'+
  '.hm .hplay svg{fill:currentColor}.hm .hplay:active{transform:scale(.98)}'+
  /* after */
  '.hm .hnight{flex:1;display:flex;flex-direction:column;padding:48px 26px calc(112px + env(safe-area-inset-bottom,0px))}'+
  '.hm .hnight .hmoon svg{fill:var(--hmoon)}'+
  '.hm h1.hdone{font:700 52px/.98 var(--disp);letter-spacing:-.02em;margin:20px 0 0;color:var(--hi)}'+
  '.hm .hsolved{font:500 17px/1.5 var(--font);margin:14px 0 0;color:var(--hs)}'+
  '.hm .hstory{display:flex;align-items:center;gap:14px;width:100%;margin-top:30px;padding:16px;background:var(--hcard);border:1px solid var(--hcardb);border-radius:22px;color:var(--hi);text-align:left;cursor:pointer}'+
  '.hm .hthumb{width:68px;height:68px;flex:none;border-radius:16px;background:#EADCC6;display:flex;align-items:center;justify-content:center}'+
  '.hm .hthumb svg{width:54px;height:54px}'+
  '.hm .hst{flex:1;min-width:0}.hm .hst b{display:block;font:700 12px/1.3 var(--font);letter-spacing:.08em;text-transform:uppercase;color:var(--hacc)}'+
  '.hm .hst span{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;line-clamp:3;overflow:hidden;font:600 17px/1.35 var(--disp);margin-top:4px}'+
  '.hm .hstory>svg{flex:none;color:var(--hchev)}'+
  '.hm .hnext{margin-top:auto;padding-top:28px}'+
  '.hm .hnl{font:700 12px/1.3 var(--font);letter-spacing:.1em;color:var(--hk)}'+
  '.hm .hcd{font:600 64px/1 var(--disp);letter-spacing:-.02em;margin-top:6px;font-variant-numeric:tabular-nums;color:var(--hi)}'+
  '.hm .hcd small{font:600 22px/1 var(--disp);color:var(--hk2);margin-left:8px;letter-spacing:0}'+
  '.hm .hmore{margin:10px 0 0;font:500 15px/1.4 var(--font);color:var(--hs)}'+
  '.hm .hmore button{border:0;background:none;padding:0 2px;min-height:44px;font:700 15px/1.4 var(--font);color:var(--hacc);text-decoration:underline;text-underline-offset:3px;cursor:pointer}'+
  /* the tab bar floats on Today, in Today's colours */
  '#app[data-tab="today"][data-deep="0"] .tabs{left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));height:64px;padding:0 6px;border-radius:22px;background:var(--htab-c,rgba(60,18,4,.35));box-shadow:none;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}'+
  '#app[data-tab="today"][data-deep="0"][data-home="before"] .tabs{--htab-c:rgba(60,18,4,.35);--ti:#FFE7D6;--tia:#FFF8F1;--ton:rgba(255,248,241,.16)}'+
  '#app[data-tab="today"][data-deep="0"][data-home="after"] .tabs{--htab-c:#FFFFFF;--ti:#5E564D;--tia:#9A330A;--ton:#F3ECE1;box-shadow:0 6px 24px rgba(28,24,20,.12),0 1px 3px rgba(28,24,20,.08)}'+
  ':root[data-theme="dark"] #app[data-tab="today"][data-deep="0"][data-home="before"] .tabs{--htab-c:#2A1C16;--ti:#CDBFB2;--tia:#F2A27A;--ton:rgba(242,162,122,.14)}'+
  ':root[data-theme="dark"] #app[data-tab="today"][data-deep="0"][data-home="after"] .tabs{--htab-c:#241A15;--ti:#CBBFB4;--tia:#F2B65A;--ton:#3A2A22;box-shadow:none}'+
  '#app[data-tab="today"][data-deep="0"] .tabs button{margin:0 4px;height:50px;min-height:50px;align-self:center;border-radius:16px;color:var(--ti);font-size:11px;gap:2px}'+
  '#app[data-tab="today"][data-deep="0"] .tabs button[aria-current="page"]{background:var(--ton);color:var(--tia)}'+
  '#app[data-tab="today"][data-deep="0"] .tabs button svg{width:20px;height:20px}'+
  '#app[data-tab="today"][data-deep="0"] .tabs .tind{display:none}'+
  '#app[data-tab="today"][data-deep="0"] .tabs .tplay .pbub{width:auto;height:auto;background:none;color:inherit}'+
  '@media (max-width:359px){.hm h1.hname{font-size:46px}.hm h1.hdone{font-size:44px}.hm .hcd{font-size:54px}.hm .hbot,.hm .hnight{padding-left:20px;padding-right:20px}}'+
  '@media (max-height:700px){.hm .hnight{padding-top:20px}.hm .hmoon svg{width:44px;height:44px}.hm h1.hdone{font-size:44px;margin-top:12px}.hm .hstory{margin-top:20px;padding:12px}.hm .hst span{font-size:15px}.hm .hthumb{width:56px;height:56px}.hm .hthumb svg{width:44px;height:44px}.hm .hcd{font-size:52px}.hm h1.hname{font-size:46px}.hm .hhook{font-size:16px}}'+
  '.big-text .hm h1.hname{font-size:48px}';
function css(){if(document.getElementById('home6css'))return;var s=document.createElement('style');s.id='home6css';s.textContent=CSS;document.head.appendChild(s)}
function firstPara(id){var st=window.STORY&&STORY[id],ab=window.ABOUT&&ABOUT[id];if(st&&st.paras&&st.paras[0])return st.paras[0];if(ab&&ab.from)return ab.from;var p=P(id);return (p&&p.blurb)||storyHook(id)}
window.firstPara6=firstPara;

/* contrast (WCAG): kicker #FAD4B8 on #A9380B 4.66:1 (the mockup #F7C9A8 is 4.26:1, so it is a shade lighter); all other text 5.4:1 or more */
/* the time to local midnight: "6:12" hours, or "48" minutes in the last hour */
function untilMidnight(){var n=new Date(),m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1),s=Math.max(0,Math.round((m-n)/1000)),h=Math.floor(s/3600),mi=Math.floor((s%3600)/60);
  if(h>=1)return {t:h+':'+(mi<10?'0':'')+mi,u:h===1&&mi===0?'hour':'hours',say:plur(h,'hour')+(mi?' '+plur(mi,'minute'):'')};
  var mm=Math.max(1,mi+(s%60?1:0));return {t:String(mm),u:mm===1?'minute':'minutes',say:plur(mm,'minute')}}
var RDAY='';
function tick(){var el=document.querySelector('#s-today [data-cd]');
  if(RDAY&&T()!==RDAY){RDAY='';Nav.refresh('today');return}
  if(!el)return;var c=untilMidnight();el.innerHTML=esc(c.t)+'<small>'+esc(c.u)+'</small>';el.setAttribute('aria-label',c.say)}
setInterval(tick,20000);document.addEventListener('visibilitychange',function(){if(!document.hidden)tick()});

/* the first win no longer toasts "Your first story is in the Almanac" (v5 finishOnboarding): on this page it covered Play,
   and the night page's story row already leads to the story. onboarding.js loads after this file, so the toast is filtered here. */
var toast0=toast;toast=function(m){if(m==='Your first story is in the Almanac')return;return toast0.apply(this,arguments)};

/* boot's first Nav.tab('today') popped any page opened before boot.js ran (a page reloaded under load, then a puzzle started at once,
   as the tests do): the puzzle vanished (RUN null). Now the first call builds Today underneath and leaves that page open. */
var tab0=Nav.tab;Nav.tab=function(name,o){if(o&&o.first&&Nav.depth>0&&name==='today'){var sc=Nav.screen('today');
    if(sc&&!sc.built){sc.build(sc.el);sc.built=true}var tb=$('tabs');if(tb)qsa(tb,'button[data-tab]').forEach(function(b){if(b.dataset.tab==='today')b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    return Promise.resolve()}
  return tab0.apply(this,arguments)};

/* is a page pushed on top? (the floating tab bar is for the Today page itself) */
function deep(){var a=$('app');if(a)a.dataset.deep=Nav.depth?'1':'0'}
try{new MutationObserver(deep).observe($('stage'),{childList:true})}catch(e){}

/* Nav.pop refreshes Today even when it has not been built yet (a page opened during boot, as the tests do right after a reload);
   v5's renderer then wrote into blocks that did not exist and threw, which also left the popped page in place. Build the blocks first. */
var BLKS=['head','recap','hero','reel','week','keep','season','ad'];
function ensureBlocks(root){if(qs(root,'[data-blk="hero"]'))return;root.innerHTML='<div class="pad">'+BLKS.map(function(k){return '<div data-blk="'+k+'"></div>'}).join('')+'</div>';TODAY.sig={}}
todayRender=function(root,first){css();if(!root)return;ensureBlocks(root);var v=S(),day=T(),d=todayDaily(),done=v.daily[day],cv=chainView(v.chain,day),p=P(d.id),app=$('app');
  var prevState=root.dataset.hstate,flip=!!done&&prevState==='before'&&!rmOn()&&!Q.fast,snap=null;
  if(flip){var hb=qs(root,'[data-blk="hero"]');if(hb){snap=hb.cloneNode(true);snap.removeAttribute('data-blk');snap.className='hfade hm';snap.setAttribute('aria-hidden','true');snap.setAttribute('inert','');
    var cs=getComputedStyle(root);['--hb','--hi','--hs','--hk','--hbtn','--hbtx','--hplate','--hring','--hglow','--hpb'].forEach(function(k){snap.style.setProperty(k,cs.getPropertyValue(k))});snap.style.background=cs.backgroundColor;snap.style.color=cs.color;snap.style.minHeight=root.clientHeight+'px';qsa(snap,'[id]').forEach(function(x){x.removeAttribute('id')})}}
  RDAY=day;root.classList.add('hm');root.classList.toggle('night',!!done);root.dataset.hstate=done?'after':'before';if(app){if(!snap)app.dataset.home=done?'after':'before';deep()}
  var n=cv.alive?cv.n:0,date=dayLabel(day,{weekday:'short'}).replace('.','')+' · '+dayLabel(day,{day:'numeric',month:'short'}).replace('.','');
  var pill=FLAGS.chain&&(v.chain.last||cv.n)?'<button class="hpill'+(cv.alive?'':' off')+'" data-chain aria-label="Streak: '+plur(n,'day')+'. Open your streak"><span>'+FLAME+'<b class="num">'+n+'</b></span></button>':'';
  var head='<div class="hhead"><div class="hdate">'+esc(date.toUpperCase())+'</div><div class="hr">'+pill+'<button class="hset" data-set aria-label="Settings">'+GEAR+'</button></div></div>';
  var sig=['B',day,d.id,d.level,done?done.moves:'-',n,cv.alive,FLAGS.chain].join('|'),html;
  if(!done)html=head+'<div class="hart"><div class="hplate" data-art aria-hidden="true">'+art(d.id,'hero')+'</div></div>'+
      '<section class="hbot" aria-label="Today\'s puzzle"><div class="hkick">Today · '+esc(kick(d.id))+'</div><h1 class="hname">'+esc(p.name)+'</h1>'+
      '<p class="hhook">'+esc(storyHook(d.id))+'</p><button class="hplay" data-play>'+PLAY+'Play today\'s puzzle</button></section>';
  else{var c=untilMidnight();
    html=head+'<section class="hnight" aria-label="Today\'s puzzle, solved"><span class="hmoon">'+MOON+'</span><h1 class="hdone">Done for<br>today.</h1>'+
      '<p class="hsolved">You solved '+esc(p.name)+' in '+esc(plur(done.moves,'move'))+'.</p>'+
      '<button class="hstory" data-story aria-label="Read its story: '+esc(p.name)+'"><span class="hthumb" aria-hidden="true">'+art(d.id,'tile')+'</span>'+
        '<span class="hst"><b>Its story · '+esc(kick(d.id))+'</b><span title="'+esc(storyHook(d.id))+'">'+esc(storyHook(d.id))+'</span></span>'+CHEV+'</button>'+
      '<div class="hnext"><div class="hnl">NEXT PUZZLE IN</div><div class="hcd" data-cd role="timer" aria-label="'+esc(c.say)+'">'+esc(c.t)+'<small>'+esc(c.u)+'</small></div>'+
        '<p class="hmore">Want more tonight? <button data-reel>Harder levels in the Reel</button></p></div></section>'}
  tBlock(root,'hero',sig,html,function(b){qs(b,'[data-set]').onclick=function(){openSettings()};var c=qs(b,'[data-chain]');if(c)c.onclick=function(){chainSheet()};
    var pl=qs(b,'[data-play]');if(pl)pl.onclick=function(){startDaily(qs(b,'[data-art]'))};
    var st=qs(b,'[data-story]');if(st)st.onclick=function(){storySheet(d.id)};
    var r=qs(b,'[data-reel]');if(r)r.onclick=function(){Nav.tab('play')};
    if(!first&&!rmOn()&&!Q.fast){var t=qs(b,done?'.hnight':'.hplate');if(t)Nav.anim(t,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],420)}});
  ['head','recap','reel','week','keep','season','ad'].forEach(function(k){tBlock(root,k,'off','')});
  if(snap){var old=qs(root,'.hfade');if(old)old.remove();root.appendChild(snap);crossfade(root,snap)}};

/* right after the win, Today turns from terracotta to night with a short crossfade, once Today is actually on screen
   (the player may first go to the Reel). The old page is a snapshot laid over the new one; reduced motion skips all of this. */
function crossfade(root,snap){var app=$('app'),t0=Date.now();
  (function wait(){if(!snap.isConnected)return;
    var shown=Nav.cur==='today'&&!Nav.depth&&!Nav.overlays&&root.getAttribute('aria-hidden')!=='true';
    if(!shown){if(Date.now()-t0>3600000){snap.remove();if(app)app.dataset.home='after';return}setTimeout(wait,200);return}
    setTimeout(function(){if(!snap.isConnected)return;if(app)app.dataset.home='after';
      if(rmOn()){snap.remove();return}
      Nav.anim(snap,[{opacity:1},{opacity:0}],700,'ease-in-out').then(function(){snap.remove()});
      var n=qs(root,'.hnight');if(n)Nav.anim(n,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],700,'cubic-bezier(.2,.8,.2,1)',150)},350)})()}

/* system bars: while the Today page itself is showing, the status bar takes the page's colour.
   - web app: meta theme-color (all of them; the built web app has a light and a dark one)
   - Android app: the shell (apps/zest tool/app-shell.js) polls :root's --bg every 700 ms and sends it to Flutter, which colours the
     status and navigation bars. So :root's --bg is set to the page colour and #app gets the theme's own --bg back, so nothing in the app changes.
   Leaving Today (another tab, a pushed page) restores both. */
var PAGE={before:{light:'#A9380B',dark:'#1F1410'},after:{light:'#FBF7F0',dark:'#17110E'}};
function sysbar(){var de=document.documentElement,app=$('app');if(!app)return;
  var on=app.dataset.tab==='today'&&app.dataset.deep==='0'&&!!app.dataset.home&&S().onb&&!document.querySelector('.ob'),
    dark=de.getAttribute('data-theme')==='dark',col=on?PAGE[app.dataset.home==='after'?'after':'before'][dark?'dark':'light']:'',top=Nav.top;
  if(top&&top.name==='reward'&&top.el&&top.el.classList.contains('w2')&&!document.querySelector('.ob'))col=dark?'#1F1410':'#A9380B';   /* the W2 solved screen (win6.js) */
  if(col){if(de.style.getPropertyValue('--bg')!==col){de.style.removeProperty('--bg');var base=getComputedStyle(de).getPropertyValue('--bg').trim();
      app.style.setProperty('--bg',base);de.style.setProperty('--bg',col)}}
  else if(de.style.getPropertyValue('--bg')){de.style.removeProperty('--bg');app.style.removeProperty('--bg')}
  qsa(document,'meta[name="theme-color"]').forEach(function(m){if(m.dataset.c0==null)m.dataset.c0=m.getAttribute('content')||'';
    var want=col||(m.getAttribute('media')?m.dataset.c0:(dark?'#14120F':'#F7F4EE'));if(m.getAttribute('content')!==want)m.setAttribute('content',want)})}
window.__homeSysbar=sysbar;
window.addEventListener('load',function(){var app=$('app');try{new MutationObserver(sysbar).observe(app,{attributes:true,attributeFilter:['data-tab','data-home','data-deep']});
  new MutationObserver(sysbar).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  new MutationObserver(sysbar).observe(document.body,{childList:true,subtree:false})}catch(e){}sysbar();setInterval(sysbar,1000)});

/* the streak sheet (v5's, rewritten here): the streak and rest days as before, plus this week and the weekly goal (they were blocks on Today) */
chainSheet=function(){var v=S(),cv=chainView(v.chain,T());
  var week='';if(FLAGS.weekGoal){var wk=weekView(v.played,v.chain.restUsed,T(),v.weekGoal),C=2*Math.PI*25,fr=Math.min(1,wk.n/wk.goal);
    week='<div class="sect" style="margin-top:22px"><div class="sh"><h2>This week</h2><button class="lnk" data-goal>Goal: '+wk.goal+' days</button></div><div class="card week">'+
      '<div class="wring" role="img" aria-label="'+wk.n+' of '+wk.goal+' days"><svg viewBox="0 0 56 56"><circle class="bg" cx="28" cy="28" r="25"/><circle class="fg" cx="28" cy="28" r="25" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-fr)).toFixed(1)+'"/></svg><b>'+wk.n+'/'+wk.goal+'</b></div>'+
      '<div class="wdots">'+wk.days.map(function(x){return '<span class="wd '+x.st+(x.today?' today':'')+'"><i>'+icon('check')+'</i>'+x.lab+'</span>'}).join('')+'</div></div></div>'}
  var b=h5('<div><div style="display:flex;align-items:center;gap:16px"><span style="width:64px;height:64px;display:block">'+chainIcon(cv.alive&&cv.n>0).replace('<svg','<svg width="64" height="64"')+'</span><div><div class="h1 num">'+(cv.alive?cv.n:0)+'</div><p class="sm">day streak · longest '+(v.chain.best|0)+'</p></div></div>'+
    '<div class="card" style="margin-top:18px;display:flex;align-items:center;gap:12px"><span class="wd rest"><i></i></span><span><b>'+plur(cv.rest|0,'rest day')+' saved</b><br><span class="sm">If you miss a day, a rest day covers it and your streak carries on. You earn one for every 7 days in a row, and you can save up to 2.</span></span></div>'+week+'</div>');
  var sh=Nav.sheet({title:'Your streak',body:b});var g=qs(b,'[data-goal]');if(g)g.onclick=function(){sh.close();setTimeout(goalSheet,Q.fast?0:250)};return sh};

/* the Almanac: this month's season card at the top (it was the last block on Today) */
function seasonCard(){var ss=seasonState(),famIds=famCards(ss.fam.id).slice(0,4);
  return '<button class="season alseason" data-season><span class="emb" aria-hidden="true">'+famIds.map(function(id){return '<span>'+art(id,'tile')+'</span>'}).join('')+'</span><span class="rt"><b>'+esc(ss.month)+': '+esc(ss.fam.name)+'</b><small>'+ss.n+' of '+SEASON_N+' stamps · free</small>'+
    '<span class="stamps" aria-hidden="true">'+new Array(SEASON_N).fill(0).map(function(_,i){return '<i class="'+(i<ss.n?'on':'')+(SEASON_GIFTS[i+1]?' gift':'')+'"></i>'}).join('')+'</span></span></button>'}
var ar0=almRender;
almRender=function(root){var r=ar0.apply(this,arguments);try{if(!FLAGS.season)return r;var main=qs(root,'[data-main]');if(!main)return r;
    var box=qs(main,'[data-alseason]');if(!box){box=document.createElement('div');box.className='sect';box.setAttribute('data-alseason','');main.insertBefore(box,main.firstChild)}
    var ss=seasonState(),sg=[ss.key,ss.n,ss.got.join()].join('|');if(box.dataset.sig!==sg){box.dataset.sig=sg;box.innerHTML=seasonCard();qs(box,'[data-season]').onclick=function(){openChapter(ss.fam.id,true)}}}catch(e){console.error(e)}return r};
})();
