/* Zest friend page layer (orangepulplabs.com/zest/play/), 6 Nov 2026: ONE challenge, then the app.
   Built by site-gen.py: ["switch-off", "jump-away", "tube-sort", "tilt-run", "slide-tiles", "make-target", "balance-weights", "zero-one", "four-by-four", "dodecahedron-tour", "river-ferry", "seven-pieces", "code-cracker", "dot-loop", "bridge-walk", "four-shades", "word-steps", "word-square", "scramble", "tiger-and-herd", "blockade", "seed-pits", "who-owns-the-zebra", "living-stones", "link-across"] (the puzzles of the current release), "https://play.google.com/store/apps/details?id=com.orangepulplabs.zest" (FRIEND_STORE_URL in site-gen.py), "https://orangepulplabs.com/beta/" (the tester
   sign-up page), ["slide-tiles", "make-target", "tilt-run", "four-by-four", "zero-one", "code-cracker", "tube-sort", "scramble", "word-steps", "balance-weights", "bridge-walk", "dodecahedron-tour", "switch-off", "jump-away", "river-ferry", "blockade", "four-shades", "link-across", "seven-pieces", "living-stones", "seed-pits", "tiger-and-herd", "word-square", "dot-loop"] (the app's daily pool, in the app's order), ["sun-mirrors", "crate-push", "picture-rows", "gear-train", "lucas-tower", "pancake-flip", "bezzel-queens", "quilt-tiles", "shunting-yard", "huarong-pass", "reversi-flip", "aqueduct", "rolling-die", "rect-cut"]/"2026-12-01" (1.2.6: v6/daily6.js), 39 (the app's puzzle count),
   "One short puzzle a day, and the true story behind it." (ZEST_PITCH), ["Tap Share. On iOS 26, tap ··· first, then Share.", "Tap Add to Home Screen, then Add.", "Open Zest from your Home Screen."] (IOS_STEPS: the same Home Screen steps as the site and the web app) and "<svg class=\"fzm\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"18 20 72 66\" aria-hidden=\"true\"><path d=\"M22 50h64a32 32 0 0 1-64 0z\" fill=\"#F7F4EE\" stroke=\"currentColor\" stroke-width=\"3.2\" stroke-linejoin=\"round\"/>\n  <path d=\"M28 50h52a26 26 0 0 1-52 0z\" fill=\"#F7A35C\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/>\n  <g stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"><path d=\"M54 50v26M54 50L36 68M54 50l18 18M54 50L30 58M54 50l24 8\"/></g>\n  <path d=\"M54 50c-6-8-18-12-30-10M54 50c6-8 18-12 30-10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n  <path d=\"M54 50V30\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\"/>\n  <path d=\"M54 31c2-6 8-9 13-8-2 6-7 9-13 8z\" fill=\"#6E9B5A\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"/></svg>" (the Zest mark) are filled in at build time.
   The store button is the official Google Play badge (Android, computers) or our own "Available for iPhone" badge (iPhone/iPad: the web app).
   Loaded after app4d, challenge, delight, the v6 kit, the one v6 puzzle override (plus trim6.js and teach.js), and before app4b boots.
   - ?c=<token>: only that puzzle, styled like the app's puzzle page (slim Zest header, name + level, the goal line, the board, Rules / Undo /
     Restart / Hint, the stuck chip in its own row, "A friend got N moves"). No tab bar, no home, no other puzzles.
   - The win plays on the board (ZK.win), then a sheet: the result, the store badge, "Challenge a friend back" (a link
     to the same board with your score, Web Share or copy) and "Try again".
   - Before the win: a small dismissible "Get the app" pill in the header; Back, or sitting idle in a lost position, opens the same sheet
     with "Keep playing".
   - No ?c=: a landing card (the mark, one line, the store button, today's daily as a normal ?c= challenge).
   - A broken or unknown link: a friendly line, the store button, today's daily.
   Nothing is stored: localStorage is kept in memory for every visitor (even one with an old Zest profile on this site), no cookies. */
(function(){
var VIS=["switch-off", "jump-away", "tube-sort", "tilt-run", "slide-tiles", "make-target", "balance-weights", "zero-one", "four-by-four", "dodecahedron-tour", "river-ferry", "seven-pieces", "code-cracker", "dot-loop", "bridge-walk", "four-shades", "word-steps", "word-square", "scramble", "tiger-and-herd", "blockade", "seed-pits", "who-owns-the-zebra", "living-stones", "link-across"],STORE="https://play.google.com/store/apps/details?id=com.orangepulplabs.zest",BETA="https://orangepulplabs.com/beta/",POOL=["slide-tiles", "make-target", "tilt-run", "four-by-four", "zero-one", "code-cracker", "tube-sort", "scramble", "word-steps", "balance-weights", "bridge-walk", "dodecahedron-tour", "switch-off", "jump-away", "river-ferry", "blockade", "four-shades", "link-across", "seven-pieces", "living-stones", "seed-pits", "tiger-and-herd", "word-square", "dot-loop"],MARK="<svg class=\"fzm\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"18 20 72 66\" aria-hidden=\"true\"><path d=\"M22 50h64a32 32 0 0 1-64 0z\" fill=\"#F7F4EE\" stroke=\"currentColor\" stroke-width=\"3.2\" stroke-linejoin=\"round\"/>\n  <path d=\"M28 50h52a26 26 0 0 1-52 0z\" fill=\"#F7A35C\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/>\n  <g stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"><path d=\"M54 50v26M54 50L36 68M54 50l18 18M54 50L30 58M54 50l24 8\"/></g>\n  <path d=\"M54 50c-6-8-18-12-30-10M54 50c6-8 18-12 30-10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n  <path d=\"M54 50V30\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\"/>\n  <path d=\"M54 31c2-6 8-9 13-8-2 6-7 9-13 8z\" fill=\"#6E9B5A\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"/></svg>";
/* 10 Nov 2026: iPhone/iPad visitors get the free Home Screen web app (/zest/app/) instead of Google Play (Zest/Docs/web-app-plan.md) */
var AS=(/[?&]as=(ios|android|desk)\b/.exec(location.search)||[])[1];   /* ?as= forces a device (tests, previews), as on the rest of the site */
var IOS=AS?AS==='ios':/iPhone|iPad|iPod/.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(IOS){STORE='/zest/app/?install';BETA=''}
var NAPP=39,PITCH=(NAPP||VIS.length)+' puzzles, each with a true story. A new one every day. Free, works offline.',ONE="One short puzzle a day, and the true story behind it.",STEPS=["Tap Share. On iOS 26, tap ··· first, then Share.", "Tap Add to Home Screen, then Add.", "Open Zest from your Home Screen."];
var FZ=window.FZ={idleMs:15000,pill:true,live:false,offered:false,cur:null,link:null};
function vis(id){return VIS.indexOf(id)>=0}
/* the curation: hidden puzzles are not playable (their file may be loaded because it also holds a visible one) */
var get0=pzGet;pzGet=function(id){return vis(id)?get0(id):null};
var keep=PUZZLE_ORDER.filter(vis);PUZZLE_ORDER.length=0;Array.prototype.push.apply(PUZZLE_ORDER,keep);
/* a daily card from the app: the token carries the puzzle, level and day, so any visible puzzle is accepted (the board is fully defined by the token) */
var zctx0=zctx;zctx=function(){var c=zctx0();c.dailyOk=function(day,id){return vis(id)};return c};
if(typeof reelTeaser==='undefined'){window.reelTeaser=function(){return ''};window.reelTeaserWire=function(){}}
var BARE=!/[?&]c=/.test(location.search||''),Q0=location.search||'';

/* nothing stored, for everyone: localStorage lives in memory on this page (challenge.js does this only for a visitor with no profile) */
if(!ZC.guest)(function(){try{var P=Storage.prototype,s1=P.setItem,r1=P.removeItem,g1=P.getItem,c1=P.clear,me=function(t){return ZC.guest&&t===localStorage};ZC.guest=true;ZC.mem={};
  P.setItem=function(k,v){if(me(this)){ZC.mem[k]=String(v);return}return s1.apply(this,arguments)};
  P.removeItem=function(k){if(me(this)){delete ZC.mem[k];return}return r1.apply(this,arguments)};
  P.getItem=function(k){if(me(this))return Object.prototype.hasOwnProperty.call(ZC.mem,k)?ZC.mem[k]:null;return g1.apply(this,arguments)};
  P.clear=function(){if(me(this)){ZC.mem={};return}return c1.apply(this,arguments)}}catch(e){}})();
ZC.endGuest=function(){};
try{document.body.classList.add('zg','fzp')}catch(e){}

/* today's daily, as the app picks it (v5 dailyFor + the v6 cycle guard in daily6.js), level 1 as for a new player */
var CYC={};
function cyc(c){if(CYC[c])return CYC[c];var o=pzShuffle(POOL,pzRng('v5cycle|'+c));
  if(c>0){var w=Math.min(30,Math.floor(POOL.length/2)),tail=cyc(c-1).slice(-w);o=o.filter(function(id){return tail.indexOf(id)<0}).concat(o.filter(function(id){return tail.indexOf(id)>=0}))}
  return CYC[c]=o}
/* 1.2.6: the app's daily6.js keeps the 1.2.5 pool (POOL) until the first cycle boundary on or after LATE_FROM, then runs the full pool
   (POOL + LATE) in its own cycles seeded 'v6late|c', the last half of the previous cycle moved to the end (same as daily6.js). The new
   puzzles are not playable on this page (no challenge row yet), so on a day the app picks one, the link is a plain level-1 challenge of the
   old rotation's puzzle for that day, and the button says "Try a puzzle". */
var LATE=["sun-mirrors", "crate-push", "picture-rows", "gear-train", "lucas-tower", "pancake-flip", "bezzel-queens", "quilt-tiles", "shunting-yard", "huarong-pass", "reversi-flip", "aqueduct", "rolling-die", "rect-cut"],LATE_FROM="2026-12-01",ALL=POOL.concat(LATE.filter(function(id){return POOL.indexOf(id)<0})),LC={};
function lateStart(){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(LATE_FROM||''),L=POOL.length;if(!m||!LATE.length)return Infinity;
  var f=Math.max(0,Math.round((Date.UTC(+m[1],+m[2]-1,+m[3])-Date.UTC(2026,0,1))/864e5));return Math.ceil(f/L)*L}
function lcyc(c){if(LC[c])return LC[c];var o=pzShuffle(ALL,pzRng('v6late|'+c)),w=Math.min(30,Math.floor(ALL.length/2));
  var tail=(c>0?lcyc(c-1):cyc(lateStart()/POOL.length-1)).slice(-w);
  o=o.filter(function(id){return tail.indexOf(id)<0}).concat(o.filter(function(id){return tail.indexOf(id)>=0}));return LC[c]=o}
function todayPick(){var n=Math.max(0,ZC.dayIdx()),b=lateStart(),old=cyc(Math.floor(n/POOL.length))[n%POOL.length];
  if(n<b)return {id:old,level:1,day:ZC.dayStr(n)};
  var m=n-b,id=lcyc(Math.floor(m/ALL.length))[m%ALL.length];
  return vis(id)?{id:id,level:1,day:ZC.dayStr(n)}:{id:old,level:1,day:ZC.dayStr(n),plain:true}}
function dailyHref(){var d=todayPick(),t=null;try{t=ZC.encodeChallenge(d.plain?{id:d.id,level:d.level,seed:0,target:0,hints:0}:{id:d.id,level:d.level,daily:d.day,hints:0})}catch(e){}return t?'./?c='+t:'./'}
FZ.today=todayPick;

/* ---------- the look: one stylesheet, the app's tokens from v4.css (light and dark) ---------- */
var CSS='body.fzp .phone{padding-bottom:0}'+
  '.fzh{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;margin:0 0 4px}'+
  '.fzb{display:inline-flex;align-items:center;gap:8px;font:700 1.25rem/1 var(--disp);color:var(--ink);letter-spacing:-.01em;white-space:nowrap}.fzb svg{width:28px;height:26px;flex:none}'+
  '.fzpill{display:inline-flex;align-items:center;min-width:0;border-radius:99px;background:var(--tint);box-shadow:inset 0 0 0 1.5px var(--accent)}'+
  '.fzpill a{display:inline-flex;align-items:center;min-height:36px;padding:0 4px 0 14px;font:700 .875rem var(--font);color:var(--ink);text-decoration:none;white-space:nowrap}'+
  '.fzpill button{all:unset;cursor:pointer;display:grid;place-items:center;width:36px;height:36px;border-radius:50%;color:var(--muted);font:600 1.125rem/1 var(--font)}'+
  '.fzpill button:focus-visible,.fzpill a:focus-visible{outline:3px solid var(--ink);outline-offset:2px}'+
  '.fz .pzt #xb{display:none}.fz .pzt{padding-left:2px}.fz .pzt .pzl b{font:700 1.25rem/1.2 var(--font)}.fz .pzt .pzl small{font:500 .875rem var(--font)}'+
  '.fz .pzt .pzm{font:700 1rem var(--font)}.fz #pzc{display:none}'+
  '.fzvs{display:flex;justify-content:center;margin:6px 0 2px}.fzvs span{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:6px 14px;border-radius:99px;background:var(--surface);box-shadow:0 0 0 1px var(--line);font:600 .875rem/1.3 var(--font);color:var(--ink);text-align:center}'+
  '.fz .zt-goal{text-align:left;margin:8px 2px 0}.fz .zt-goalrow{justify-content:space-between;flex-wrap:nowrap;gap:12px}.fz .zt-goalrow>span:first-child{flex:1 1 auto;min-width:0}.fz .zk-status{min-height:44px}.fz .pzbar .zbtn.ic6{background:var(--surface)!important;border:0!important;box-shadow:0 1px 3px rgba(0,0,0,.08),0 0 0 1px var(--line)!important}'+
  /* the sheet (win, Back, stuck) */
  '.fzs{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-end;justify-content:center}.fzs-bg{position:absolute;inset:0;background:var(--scrim)}'+
  '.fzs-c{position:relative;width:100%;max-width:440px;max-height:100%;overflow:auto;background:var(--bg);color:var(--ink);border-radius:24px 24px 0 0;padding:22px 20px calc(18px + env(safe-area-inset-bottom));text-align:center;box-shadow:0 -10px 40px rgba(0,0,0,.25)}'+
  '@media (min-height:700px) and (min-width:520px){.fzs{align-items:center}.fzs-c{border-radius:24px}}'+
  '.fzs-c h2{font:700 1.75rem/1.15 var(--disp);margin:2px 0 0;letter-spacing:-.01em}.fzk{margin:0;font:700 .75rem var(--font);letter-spacing:.09em;text-transform:uppercase;color:var(--link)}'+
  '.fzst{margin:8px 0 0}.fzvs2{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:300px;margin:14px auto 0}.fzvs2.one{grid-template-columns:1fr;max-width:150px}'+
  '.fzvs2 div{background:var(--surface);border-radius:16px;padding:10px 6px;box-shadow:0 0 0 1px var(--line)}.fzvs2 .me{box-shadow:0 0 0 2px var(--accent)}'+
  '.fzvs2 b{display:block;font:700 1.875rem/1 var(--disp)}.fzvs2 small{display:block;margin-top:4px;font:600 .8125rem var(--font);color:var(--muted)}'+
  '.fzpitch{margin:14px auto 0;max-width:30em;font:600 1rem/1.4 var(--font);color:var(--ink)}'+
  '.fzgp,.fzbdg{display:flex;align-items:center;justify-content:center;width:max-content;max-width:100%;height:56px;margin:14px auto 0;border-radius:12px;text-decoration:none}.fzgp img{display:block;height:56px;width:auto}'+
  '.fzbdg{gap:10px;padding:0 18px 0 14px;background:#000;color:#fff;border:1px solid #A6A6A6;font:600 1rem var(--font)}.fzbdg svg{width:28px;height:28px;fill:none;stroke:#fff;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}'+
  '.fzbdg span{display:flex;flex-direction:column;align-items:flex-start;line-height:1.05;text-align:left}.fzbdg small{font:500 .72rem var(--font)}.fzbdg b{font:600 1.375rem var(--font)}'+
  '.fzgp:focus-visible,.fzbdg:focus-visible,.fz2:focus-visible,.fztx:focus-visible{outline:3px solid var(--ink);outline-offset:2px}'+
  '.fz2{display:flex;align-items:center;justify-content:center;width:100%;min-height:50px;margin:10px 0 0;border-radius:16px;border:0;background:var(--surface);box-shadow:inset 0 0 0 1.5px var(--line);color:var(--ink);font:700 1rem var(--font);text-decoration:none;cursor:pointer;padding:0 16px}'+
  '.fztx{display:inline-flex;align-items:center;justify-content:center;min-height:44px;margin:6px 0 0;padding:0 14px;border:0;background:none;color:var(--ink);font:700 .9375rem var(--font);text-decoration:underline;text-underline-offset:3px;cursor:pointer}'+
  '.fzsm{margin:10px 0 0;font:500 .8125rem/1.4 var(--font);color:var(--muted)}.fzsm a{color:inherit;display:inline-flex;align-items:center;min-height:44px}'+
  '.fzsteps{margin:12px 0 0;padding-left:1.3em;text-align:left;font:500 .875rem/1.45 var(--font);color:var(--muted)}.fzsteps li{margin:3px 0}.fzsteps b{color:var(--ink)}'+
  '.fzlink{display:block;width:100%;margin:8px 0 0;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:500 .8125rem var(--font)}.fzlink[hidden]{display:none}'+
  '.fzok{min-height:1.2em;margin:6px 0 0;font:600 .8125rem var(--font);color:var(--ok)}'+
  /* the landing card (no link, or a broken one) */
  '.fzl{display:flex;flex-direction:column;min-height:100%}.fzl .fzcard{margin:auto 0;padding:28px 20px 22px;border-radius:24px;background:var(--surface);box-shadow:0 0 0 1px var(--line);text-align:center}'+
  '.fzl .fzcard svg{width:64px;height:58px}.fzl h1{font:700 2rem/1.15 var(--disp);margin:10px 0 0;letter-spacing:-.01em}.fzl .fzone{margin:10px auto 0;max-width:24em;font:500 1.0625rem/1.45 var(--font);color:var(--ink)}'+
  '.fzl .zgt{text-align:center;margin-top:16px}';
try{var st=document.createElement('style');st.id='fz-css';st.textContent=CSS;document.head.appendChild(st)}catch(e){}
function brand(pill){return '<div class="fzh"><span class="fzb">'+MARK+'<span>Zest</span></span>'+(pill&&FZ.pill?'<span class="fzpill" id="fzpill"><a href="'+esc(STORE)+'" id="fzget"'+(IOS?'':' target="_blank" rel="noopener"')+'>Get the app</a><button type="button" id="fzpx" aria-label="Hide this">×</button></span>':'')+'</div>'}
function wirePill(){var a=$('fzget'),x=$('fzpx');if(a)a.onclick=function(){zc('store_tap')};if(x)x.onclick=function(){FZ.pill=false;var p=$('fzpill');if(p)p.remove()}}
var TERMS='<p class="zgt">By playing you agree to the <a href="https://orangepulplabs.com/zest/terms/" target="_blank" rel="noopener">Terms</a> and <a href="https://orangepulplabs.com/zest/privacy/" target="_blank" rel="noopener">Privacy policy</a>.</p>';
var IPH='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M12 8.5v6M9 11.5h6"/></svg>';
function storeBtn(){return IOS?'<a class="fzbdg" id="fzstore" href="'+esc(STORE)+'">'+IPH+'<span><small>Available for</small><b>iPhone</b></span></a>'
  :'<a class="fzgp" id="fzstore" href="'+esc(STORE)+'" target="_blank" rel="noopener"><img src="/img/badges/google-play.png" alt="Get it on Google Play" width="188" height="56"></a>'}
function storeNote(){if(IOS)return '<p class="fzsm">Open the game, then:</p><ol class="fzsteps">'+STEPS.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ol>';
  return '<p class="fzsm">'+(BETA?'In testing on Google Play: <a href="'+esc(BETA)+'" id="fzbeta" target="_blank" rel="noopener">join the beta</a>. ':'')+'<a href="/zest/iphone/">On iPhone? Play free.</a></p>'}
function storeBits(){return storeBtn()+storeNote()}

/* ---------- the one screen when there is no puzzle: no link, or a link that cannot be played ---------- */
function landing(bad){FZ.live=false;newRun();var s=$('screen');if(s)s.classList.remove('fz','pz5');
  var h=bad?'This link didn’t work.':'Zest',one=bad?'It may be cut off, or that puzzle has moved on. Here is today’s puzzle instead, or get them all in the app.':ONE;
  show('<div class="fzl" data-fz="'+(bad?'bad':'land')+'"><div class="fzcard">'+MARK+'<h1>'+h+'</h1><p class="fzone">'+one+'</p>'+storeBtn()+
    '<a class="fz2" id="fzdaily" href="'+esc(dailyHref())+'">'+(todayPick().plain?'Try a puzzle':'Try today’s puzzle')+'</a>'+storeNote()+'</div>'+TERMS+'</div>',false,{back:null});
  var a=$('fzstore');if(a)a.onclick=function(){zc('store_tap')}}
FZ.landing=landing;
friendBroken=function(){landing(true)};

/* ---------- the challenge ---------- */
function friendNote(f){return f.old?'This one is a little old, but you can still play it for fun.':f.off?'This link looks a bit off, so here is the puzzle without a score.':''}
friendStart=function(f){if(!f||f.broken){landing(true);return}zc('friend_start');
  FZ.cur={id:f.id,level:f.level,tag:f.tag||'',seed:f.seed,daily:!!f.daily,t:f.t,who:f.who,hints:f.hints||0};
  playPuzzle(f.id,f.level,{tag:f.tag,friend:{t:f.t,hints:f.hints,r:f.r,who:f.who,note:friendNote(f)},exit:main,from:main,guest:true})};
function main(){var c=FZ.cur;if(c)playPuzzle(c.id,c.level,{tag:c.tag,friend:{t:c.t,hints:c.hints,who:c.who},exit:main,from:main,guest:true,instant:1});else landing(BARE?false:true)}
/* the takeover, right after app4b's first home(): no tab bar, and every way into the rest of the app lands on this page's one screen */
var fb0=friendBoot;
friendBoot=function(){try{setTab=function(){};themeOf=function(){return 'system'}}catch(e){}   /* the app defaults to light; this page follows the phone (light or dark) */
  var nav=document.getElementById('tabsnav');if(nav)nav.remove();
  ['home','guestHome','library','families','settings','archive','infoPage','pzLadder','familyPage','startFirst','makeYours','onboard'].forEach(function(k){try{if(typeof window[k]==='function')window[k]=main}catch(e){}});
  if(BARE){landing(false);return true}
  var started=FRIEND&&FRIEND.started;if(!started)fb0.apply(this,arguments);
  if(!FRIEND||FRIEND.broken){landing(true)}
  try{if(Q0&&location.search!==Q0)history.replaceState(history.state,'',location.pathname+Q0)}catch(e){}   /* keep the link in the address bar (a reload replays it) */
  return true};

/* the puzzle screen, like the app's puzzle page */
var ICO6={pzu:['Undo','<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'],
  pzr:['Restart','<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'],
  pzhb:['Hint','<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>']};
var pp0=playPuzzle;
playPuzzle=function(id,level,o){o=o||{};var out=pp0.apply(this,arguments);try{
  var p=PUZZLES[id],scr0=$('screen'),root=$('pzroot');if(!root||!p)return out;
  scr0.classList.add('fz','pz5');scr0.insertAdjacentHTML('afterbegin',brand(true));wirePill();
  var xb=$('xb');if(xb)xb.remove();
  var lb=scr0.querySelector('.pzt .pzl');if(lb)lb.innerHTML='<b>'+esc(p.name)+'</b><small>'+(FZ.cur&&FZ.cur.daily?'Today’s puzzle · ':'')+'Level '+level+'</small>';
  var cap=$('pzcap');if(cap)cap.remove();
  var f=o.friend||{};if(f.t!=null){var v=document.createElement('p');v.className='fzvs';v.id='fzvs';
    v.innerHTML='<span>'+esc(frWho(f,1))+' got '+plural(f.t,'move')+(f.hints?' with '+plural(f.hints,'hint'):'')+'. Can you beat it?</span>';root.parentNode.insertBefore(v,root)}
  /* the stuck chip's own row, right under the board (kit: .pz5 .zk-status .zk-slot), with the hint line */
  var bar=scr0.querySelector('.pzbar'),ph=$('pzh');if(bar){var sr=document.createElement('div');sr.className='zk-status';sr.innerHTML='<div class="zk-slot"></div>';bar.parentNode.insertBefore(sr,bar);if(ph)sr.appendChild(ph)}
  if(p.v6)Object.keys(ICO6).forEach(function(k){var b=$(k);if(!b)return;b.setAttribute('aria-label',ICO6[k][0]);b.title=ICO6[k][0];b.classList.add('ic6');
    b.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICO6[k][1]+'</svg>'});
  /* 1.2.4: Hint in a lost position shows the stuck chip and spends nothing */
  var hb=$('pzhb');if(hb&&window.ZK){var h0=hb.onclick;hb.onclick=function(e){var s=null;try{s=ZK.sess(root.querySelector('.zk-stage')||root)}catch(x){}if(s&&s.lost&&s.lost()){s.reveal('hint');return}return h0&&h0.call(this,e)}}
  if(p.v6)teach6(id,level,o,p);
  BACKFN=function(){giveUp('back')};FZ.live=true;FZ.offered=false;FZ.chipAt=0;FZ.link=null;
}catch(e){try{console.error(e)}catch(_){}}return out};
/* 1.2.2 teaching (v6/teach.js, the same table as the app): the goal line above the board, a Rules pill beside Undo / Restart / Hint,
   the nudge after 4 s with no input before the first move, and the goal picture for Tube Sort and Slide Tiles. Nothing is stored. */
function teach6(id,level,o,p){if(!window.ZT)return;var root=$('pzroot');if(!root||document.getElementById('pzgoal'))return;
  var tag=o.tag||(o.seed?String(o.seed).split('|').slice(2).join('|'):''),seed=o.seed||pzSeed(id,level,tag),inst=null;try{inst=p.make(level,pzRng(seed))}catch(e){}
  var g=document.createElement('div');g.id='pzgoal';g.className='zt-goal';g.setAttribute('data-goal','');var th=ZT.thumb(id,inst);
  g.innerHTML=th?'<span class="zt-goalrow"><span></span>'+th+'</span>':'';(th?g.querySelector('.zt-goalrow span'):g).textContent=ZT.goal(id);root.parentNode.insertBefore(g,root);
  var bar=document.querySelector('.pzbar');if(bar){var b=document.createElement('button');b.type='button';b.className='zt-rules';b.id='pzrules';b.setAttribute('data-rules','');b.textContent='Rules';
    b.onclick=function(){ZT.sheet(p.name+' rules',ZT.stepsHtml(id,p.how),'Back to the puzzle')};bar.appendChild(b)}
  var moved=false,rid=run.id;root.addEventListener('pointerdown',function(){moved=true},true);
  ZT.nudge({id:id,p:p,root:root,make:function(){return p.make(level,pzRng(seed))},moved:function(){return moved||rid!==run.id},blocked:function(){return !!(root.querySelector('.zk-hand')||document.querySelector('.zt-sheet,.fzs'))}})}
(function(){var s=document.createElement('style');s.textContent='.pzbar .zbtn.ic6{flex:0 0 56px!important;min-width:56px!important;width:56px!important;height:56px!important;border-radius:28px!important;padding:0!important;display:inline-flex!important;align-items:center;justify-content:center}.pzbar:has(.ic6){display:flex;justify-content:center!important;gap:16px!important}';document.head.appendChild(s)})();

/* ---------- the sheet: one layer (app4b's openLayer: focus trap, Esc and Back close it) ---------- */
function closeSheet(){var l=FZ.layer;FZ.layer=null;if(l)try{l.close()}catch(e){}}
function sheet(kind,html,onClose){closeSheet();var d=document.createElement('div');d.className='fzs';d.setAttribute('data-sheet',kind);
  d.innerHTML='<div class="fzs-bg"></div><div class="fzs-c" role="dialog" aria-modal="true" aria-labelledby="fzst">'+html+'</div>';
  (document.querySelector('.phone')||document.body).appendChild(d);
  var L=openLayer(d,{esc:function(){closeSheet();if(onClose)onClose()}});FZ.layer=L;
  d.querySelector('.fzs-bg').onclick=function(){closeSheet();if(onClose)onClose()};
  var a=d.querySelector('#fzstore');if(a)a.onclick=function(){zc('store_tap')};
  try{if(!reduced()&&d.animate){d.querySelector('.fzs-c').animate([{transform:'translateY(40px)',opacity:0},{transform:'none',opacity:1}],{duration:240,easing:'cubic-bezier(.2,.9,.3,1.2)'});d.querySelector('.fzs-bg').animate([{opacity:0},{opacity:1}],{duration:200})}}catch(e){}
  return d}
FZ.close=closeSheet;
/* Back, or idle in a lost position: the app pitch, with Keep playing */
function giveUp(why){if(!FZ.live)return;if(FZ.layer){closeSheet();return}
  var d=sheet(why,'<h2 id="fzst">'+(why==='stuck'?'Tricky one?':'Before you go')+'</h2>'+
    '<p class="fzpitch">'+(why==='stuck'?'Undo goes back to the last good spot. Or take a break: ':'Liked it? ')+PITCH+'</p>'+storeBits()+
    '<button type="button" class="fz2" id="fzkeep">Keep playing</button>');
  d.querySelector('#fzkeep').onclick=function(){closeSheet()}}
FZ.giveUp=giveUp;
/* idle in a lost position: the kit's stuck chip is up and nothing has been touched for FZ.idleMs (once per board) */
var lastIn=Date.now();['pointerdown','keydown'].forEach(function(t){document.addEventListener(t,function(){lastIn=Date.now()},true)});
setInterval(function(){if(!FZ.live||FZ.offered||FZ.layer||(typeof LAYERS!=='undefined'&&LAYERS.length))return;
  var chip=document.querySelector('#screen .zk-stuckchip');if(!chip){FZ.chipAt=0;return}if(!FZ.chipAt)FZ.chipAt=Date.now();
  var now=Date.now();if(now-lastIn>=FZ.idleMs&&now-FZ.chipAt>=1500){FZ.offered=true;giveUp('stuck')}},500);

/* ---------- challenge back: a link to the same board with your score (challenge.js codec) ---------- */
function backLink(moves,hints){var c=FZ.cur;if(!c)return null;var o={id:c.id,level:c.level,target:moves,hints:hints||0},t=null,sd;
  if(c.daily)o.daily=c.tag;
  else{sd=c.seed!=null?c.seed:ZC.tagSeed(c.tag||'');if(sd==null)return ZC.base+'?c='+encodeURIComponent(c.id)+'&l='+c.level+'&s='+encodeURIComponent(c.tag||'')+'&t='+moves;o.seed=sd}
  try{t=ZC.encodeChallenge(o)}catch(e){}return t?ZC.base+'?c='+t:null}
FZ.backLink=backLink;
function shareBack(url,text,d){var ok=d.querySelector('#fzok'),inp=d.querySelector('#fzlink');
  function shown(msg){if(inp){inp.hidden=false;inp.value=url;try{inp.focus({preventScroll:true});inp.select()}catch(e){}}if(ok)ok.textContent=msg}
  function copy(){try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(function(){shown('Link copied. Send it to a friend.')},function(){shown('Copy this link and send it to a friend.')});return}}catch(e){}shown('Copy this link and send it to a friend.')}
  zc('challenge_back_tap');
  if(navigator.share){try{navigator.share({title:'Zest',text:text,url:url}).then(function(){if(ok)ok.textContent='Sent.'},function(e){if(!e||e.name!=='AbortError')copy()});return}catch(e){}}
  copy()}

/* ---------- the ending: the win on the board first, then the sheet ---------- */
pzResult=function(id,level,o,seed,inst,r,q){
  var root=$('pzroot'),host=root&&(root.querySelector('.zk-stage')||root),done=false;FZ.live=false;closeSheet();
  function go(){if(done)return;done=true;winSheet(id,level,o,r,q)}
  ['pzbar','pzh','pznote'].forEach(function(k){var e=$(k)||document.querySelector('.'+k);if(e)e.style.visibility='hidden'});
  if(!host||!window.ZK||!PUZZLES[id].v6){go();return}
  var ctrl=PZR&&PZR.ctrl,origin=null;try{origin=ctrl&&ctrl.lastEl?ctrl.lastEl():null}catch(e){}
  try{ZK.win(host,{stars:Math.max(1,q.stars),board:host.querySelector('.zk-board')||host,origin:origin,nextLabel:'See result',onNext:function(){done=false;go()}})}catch(e){go();return}
  var t=run.id;setTimeout(function(){if(t===run.id)go()},1700)};
function winSheet(id,level,o,r,q){var p=PUZZLES[id],fo=o.friend||{},ft=fo.t!=null?fo.t:null,me=r.moves,who=frWho(fo,1),
  head=ft===null?'Solved!':me<ft?'You beat it!':me===ft?'A perfect tie.':me===ft+1?'So close!':'Nicely done.',
  vs=ft===null?'<div class="fzvs2 one"><div class="me"><b class="num">'+me+'</b><small>'+(me===1?'move':'moves')+'</small></div></div>':
    '<div class="fzvs2"><div class="me"><b class="num">'+me+'</b><small>You</small></div><div><b class="num">'+ft+'</b><small>'+esc(who)+'</small></div></div>',
  url=backLink(me,r.hints),c=FZ.cur||{};FZ.link=url;
  var d=sheet('win','<p class="fzk">'+esc(p.name)+' · Level '+level+'</p><h2 id="fzst">'+head+'</h2><div class="fzst">'+starsRow(Math.max(1,q.stars))+'</div>'+vs+
    '<p class="fzpitch">'+PITCH+'</p>'+storeBits()+
    (url?'<button type="button" class="fz2" id="fzback" data-link="'+esc(url)+'">Challenge a friend back</button><input class="fzlink" id="fzlink" readonly hidden aria-label="Your challenge link"><p class="fzok" id="fzok" role="status" aria-live="polite"></p>':'')+
    '<button type="button" class="fztx" id="fzagain">Try again</button>');
  var text=c.daily?'I solved today’s Zest puzzle, '+p.name+', in '+plural(me,'move')+'. Your turn?':'I solved '+p.name+' level '+level+' in '+plural(me,'move')+' on Zest. Can you beat it?';
  if(url)d.querySelector('#fzback').onclick=function(){shareBack(url,text,d)};
  d.querySelector('#fzagain').onclick=function(){zc('again_tap');closeSheet();main()}}
})();
