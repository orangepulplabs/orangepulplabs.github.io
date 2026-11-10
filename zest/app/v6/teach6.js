/* v6 teaching in the app (1.2.2, owner-approved "recommended mix"). Loaded after runner6.js; uses teach.js (ZT).
   - Puzzle page: the goal line above the board, a "Rules" pill next to Undo / Restart / Hint (3 numbered steps in a sheet),
     the nudge (4 s idle before the first move: the hint hand on a suggested first move), and the goal picture for Tube Sort and Slide Tiles.
   - First launch: a 3-screen intro (one puzzle a day / keep your streak / collect them all) before the welcome.
   - Today: a one-time tip on the streak (day chain) chip, the first time it shows.
   Seen flags live in the app state: S().teach = {intro:1, tip:1} (zv6 in the browser).
   ?demo (the test fixtures) skips the intro and the tip unless ?teach is also given, so older tests are unchanged. */
(function(){
if(!window.ZT)return;
var QT=/[?&]teach\b/.test(location.search),QUIET=Q.demo&&!QT;
var ms=/[?&]nudge=(\d+)/.exec(location.search);if(ms)window.ZT_NUDGE_MS=+ms[1];   /* test hook: a shorter nudge delay */
function TS(){var v=S();if(!v.teach||typeof v.teach!=='object')v.teach={};return v.teach}
window.zt6Seen=TS;

/* ---------- the puzzle page ---------- */
var pp0=playPuzzle;
playPuzzle=function(id,level,o){var st=pp0.apply(this,arguments);try{if(st&&st.id===id)decorate(st)}catch(e){console.error(e)}return st};
function decorate(st){var p=P(st.id),secs=qsa(document,'.pz5'),sec=secs[secs.length-1];if(!p||!sec||qs(sec,'.zt-goal'))return;
  var root=qs(sec,'.pzroot'),goal=ZT.goal(st.id,st.inst);
  if(goal){var thumb=ZT.thumb(st.id,st.inst),g=h5('<div class="zt-goal" data-goal>'+(thumb?'<span class="zt-goalrow"><span>'+esc(goal)+'</span>'+thumb+'</span>':esc(goal))+'</div>');root.parentNode.insertBefore(g,root)}
  var bar=qs(sec,'.pzbar');if(bar){var b=h5('<button class="zt-rules" data-rules aria-label="Rules">Rules</button>');bar.appendChild(b);b.onclick=function(){rulesSheet(st.id);ev('rules_open')}}
  if(st.inst&&!st.fin)st.nudge=ZT.nudge({id:st.id,p:p,root:root,make:function(){return p.make(st.level,pzRng(st.seed))},
    moved:function(){return st.mv>0||st.fin||RUN!==st},blocked:function(){return Nav.overlays>0||!!qs(sec,'.zk-hand')}});
  var pg=Nav.top;if(pg&&pg.el===sec){var op=pg.onPop;pg.onPop=function(){if(st.nudge)st.nudge.stop();if(op)op.apply(this,arguments)}}}
function rulesSheet(id){var p=P(id),b=h5('<div>'+ZT.stepsHtml(id,p&&p.how)+'<button class="btn pri wide" data-back style="margin-top:18px">Back to the puzzle</button></div>');
  var sh=Nav.sheet({title:(p?p.name:'')+' rules',body:b,cls:'zt-rsheet'});qs(b,'[data-back]').onclick=function(){sh.close()};return sh}
window.ztRulesSheet=rulesSheet;

/* ---------- the intro: 3 screens, once, before the welcome ---------- */
var SL=[['1','One puzzle a day','A new puzzle every morning. About 2 minutes.'],
  ['flame','Keep your streak','Play once a day to keep it going. Miss a day and it starts again.'],
  ['star','Collect them all','Each puzzle you solve adds a story to your collection.']];
var ART={'1':'<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M11 14l1.5-1v5"/></svg>',
  flame:'<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4 0 7-2.7 7-6.6 0-3.6-2.4-5.6-4-8.4-.6 2-1.6 3-3 3.4.4-3-1-6-3.5-7.4.3 3.4-1.6 5.6-3 7.6C4.7 12 5 13.7 5 15.4 5 19.3 8 22 12 22z"/></svg>',
  star:'<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2.6l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.9l-5.8 3.2 1.4-6.4L2.7 9.3l6.5-.7z"/></svg>'};
var ICSS='.zt-intro{display:flex;flex-direction:column;text-align:center;padding:calc(28px + env(safe-area-inset-top,0px)) 24px calc(24px + env(safe-area-inset-bottom,0px))}'+
 '.zt-intro .zt-sl{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}'+
 '.zt-intro .zt-art{width:132px;height:132px;border-radius:34px;background:var(--surface);box-shadow:var(--sh1);display:grid;place-items:center;color:var(--accent)}'+
 '.zt-intro h1{font:700 1.75rem/1.2 var(--disp);margin:6px 0 0;text-wrap:balance}.zt-intro p{margin:0;color:var(--muted);font-size:1rem;max-width:30ch}'+
 '.zt-dots{display:flex;justify-content:center;gap:6px;margin:18px 0}.zt-dots i{width:8px;height:8px;border-radius:4px;background:var(--line);transition:width .2s}.zt-dots i.on{width:22px;background:var(--accent)}'+
 '.zt-tip{position:absolute;z-index:30;right:12px;width:min(260px,calc(100% - 24px));background:var(--ink);color:var(--bg);border-radius:16px;padding:12px 14px;font:600 .9375rem/1.4 var(--font);box-shadow:var(--sh2)}'+
 '.zt-tip::after{content:"";position:absolute;top:-6px;right:var(--ax,40px);width:12px;height:12px;background:var(--ink);transform:rotate(45deg)}'+
 '.zt-tip button{display:block;margin:10px 0 0 auto;min-height:44px;min-width:64px;padding:0 16px;border:0;border-radius:14px;background:var(--accent);color:var(--on-accent);font:750 .9375rem var(--font)}';
try{var s=document.createElement('style');s.textContent=ICSS;document.head.appendChild(s)}catch(e){}
function intro(then){var i=0,n=h5('<div class="ob zt-intro" role="dialog" aria-modal="true" aria-label="Welcome to Zest" data-intro><div class="zt-sl" data-sl></div><div><div class="zt-dots" aria-hidden="true"></div><button class="btn pri big wide" data-next style="width:100%">Next</button></div></div>');
  var c=Nav.cover(n,{noBack:true}),sl=qs(n,'[data-sl]'),dots=qs(n,'.zt-dots'),nx=qs(n,'[data-next]');
  function show(){var x=SL[i];sl.innerHTML='<div class="zt-art" aria-hidden="true">'+ART[x[0]]+'</div><h1>'+esc(x[1])+'</h1><p>'+esc(x[2])+'</p>';
    dots.innerHTML=SL.map(function(_,k){return '<i'+(k===i?' class="on"':'')+'></i>'}).join('');nx.textContent=i===SL.length-1?'Start playing':'Next';
    Nav.anim(sl,[{opacity:0,transform:'translateX(16px)'},{opacity:1,transform:'none'}],220);say(x[1])}
  nx.onclick=function(){fx('tap');if(i<SL.length-1){i++;show();return}TS().intro=1;save();ev('intro_done');then();setTimeout(function(){c.close()},Q.fast?0:120)};
  /* a swipe left moves on too */
  var sx=null;n.addEventListener('pointerdown',function(e){sx=e.clientX});n.addEventListener('pointerup',function(e){if(sx!=null&&e.clientX-sx<-50&&i<SL.length-1){i++;show()}sx=null});
  show();return c}
window.ztIntro=intro;
var w0=welcome;
welcome=function(){if(!QUIET&&!TS().intro&&!S().onb)return intro(w0);return w0.apply(this,arguments)};

/* ---------- the streak tip: once, the first time the chain chip shows on Today ---------- */
var tr0=todayRender;
todayRender=function(root,first){var r=tr0.apply(this,arguments);try{tip(root)}catch(e){}return r};
function tip(root){if(QUIET||TS().tip||!S().onb||qs(root,'.zt-tip'))return;var chip=qs(root,'[data-chain]');if(!chip)return;
  setTimeout(function(){if(TS().tip||qs(root,'.zt-tip')||!chip.isConnected||Nav.overlays>0||Nav.depth>0||Nav.cur!=='today')return;
    var pad=qs(root,'.pad')||root,pr=pad.getBoundingClientRect(),cr=chip.getBoundingClientRect();
    var t=h5('<div class="zt-tip" role="dialog" aria-label="Your streak" data-tip>Your streak. Play one puzzle a day to keep it going. Miss a day and it starts again.<button data-ok>OK</button></div>');
    if(getComputedStyle(pad).position==='static')pad.style.position='relative';
    t.style.top=(cr.bottom-pr.top+10)+'px';t.style.right=Math.max(12,pr.right-cr.right)+'px';t.style.setProperty('--ax',Math.max(14,cr.width/2-6)+'px');
    pad.appendChild(t);TS().tip=1;save();ev('streak_tip');Nav.anim(t,[{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],220);
    qs(t,'[data-ok]').onclick=function(){t.remove()}},Q.fast?0:450)}
})();
