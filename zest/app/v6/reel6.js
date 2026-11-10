/* v6 Reel. 1.2.2 brought the Reel ("The Reel, like Instagram"); 1.2.3 lays each card out as option D "Insta stack" (owner-approved
   design review, 6 Nov 2026), with the tab bar kept. Replaces v5's quick reel on the Play tab (reel5.js stays loaded, unused).
   - Full-screen cards that snap (CSS scroll-snap), scrolling both ways; new cards are added below as you go, so it never ends.
   - Each card is a real v6 board at a harder kept level (upper part of the ladder, after trim6.js), labelled Medium or Hard,
     drawn from the visible puzzles (PUZZLE_ORDER after curate6.js), never the same puzzle twice in a row (nor within 5 cards).
   - The board uses the ladder's own seed (pzSeed(id, level, '')), so Share (ZC challenge link, seed 0) and Explore open exactly this board.
   - Card (D): a slim top line ("Reel #N" + moves chip); the board full width, scaled to fit the space (up as well as down);
     then an Instagram-style bottom zone: the caption on the left (name + badge, "Level N · goal", a "More levels" pill that opens the
     Explore sheet, a Next chip) and a stack on the right (Like, Rules, Share). No control ever sits over the board box.
   - The board owns its touches (touch-action:none on the board area), so a drag on the board never moves the feed;
     the feed moves by swiping outside the board, or with Next.
   - Double-tap anywhere that is not the board (caption, margins, empty space) likes the card with a heart burst; the stack shows Liked.
   - Solved: the caption becomes a big green "Solved in N moves · Next challenge" button (no banner over the board).
   - Like saves {id, level} to S().liked (shown in the Explore sheet and on the Almanac). Solving a reel card does not touch ladder progress.
   - Boards are mounted near the visible card only (current +-1) and destroyed further away; a solved card keeps its board and button.
   The reel is always dark (like the prototype): while it is on screen the app runs the dark theme, restored on leave. */
(function(){
if(!window.ZT||!window.Nav)return;
var CSS='#s-play{background:#171412;overflow:hidden}'+
 '.rl6{position:absolute;inset:0;bottom:calc(var(--tabh,64px) + env(safe-area-inset-bottom,0px));background:#171412;color:#F4EFE8;--rg:rgba(255,255,255,.12);--rm6:#B6ADA2}'+
 '.rl6 .feed{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;scroll-snap-type:y mandatory;overscroll-behavior:contain;scrollbar-width:none;outline:none}.rl6 .feed::-webkit-scrollbar{display:none}'+
 /* touch-action:manipulation: the feed still pans, but a double-tap never zooms (it likes) */
 '.rl6c{height:100%;scroll-snap-align:start;scroll-snap-stop:always;position:relative;display:flex;flex-direction:column;padding:calc(4px + env(safe-area-inset-top,0px)) 12px 0;overflow:hidden;touch-action:manipulation}'+
 '.rl6c .bgglow{position:absolute;inset:0;pointer-events:none;opacity:.55}'+
 /* top line */
 '.rl6c .rtop{position:relative;display:flex;align-items:center;gap:8px;height:44px;flex:none;padding:0 2px;font:700 .8125rem var(--font);color:var(--rm6);font-variant-numeric:tabular-nums}'+
 /* 1.2.4: Undo, Restart, Hint in the top line (44 px each), the same actions as the puzzle page (ZR in runner6.js) */
 '.rl6c .rctl{margin-left:auto;display:flex;gap:4px;flex:none}'+
 '.rl6c .rbtn{position:relative;width:44px;height:44px;flex:none;border:0;border-radius:50%;padding:0;display:grid;place-items:center;background:rgba(255,255,255,.10);color:#F4EFE8;cursor:pointer}'+
 '.rl6c .rbtn svg{width:22px;height:22px}.rl6c .rbtn.zk-hoff{opacity:.42}'+
 '.rl6c .rbtn .badge{position:absolute;right:1px;top:1px;min-width:16px;height:16px;padding:0 4px;box-sizing:border-box;border-radius:8px;background:#FF7A3D;color:#171412;font:800 .625rem/16px var(--font);text-align:center}'+
 '.rl6c .rbtn .badge.ad{background:#F4EFE8}'+
 '.rl6c.solved .rbtn[data-undo],.rl6c.solved .rbtn[data-hint]{visibility:hidden}'+
 /* the stuck chip's row on a card: over the name and goal in the caption (never the board, the stack or the More levels / Next row) */
 '.rl6c .rcap{position:relative}.rl6c .rchipslot{position:absolute;left:0;right:0;bottom:52px;z-index:3;justify-content:flex-start;padding:0}'+
 '.rl6c.zk-chip .rchip,.rl6c.zk-chip .rgoal,.rl6c.zk-chip .rhint{visibility:hidden}'+
 '.rl6c .rhint{display:none;margin:0;text-align:left;font:700 .8125rem/1.3 var(--font);color:#FFD08A;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'+
 '.rl6c.rhinting .rhint{display:-webkit-box}.rl6c.rhinting .rgoal{display:none}'+
 '.rl6c .rtop b{font:700 1rem var(--disp);color:#F4EFE8}'+
 '.rl6c .rstat{white-space:nowrap;padding:4px 10px;border-radius:99px;background:var(--rg);font:700 .75rem/1.2 var(--font);font-variant-numeric:tabular-nums;color:#F4EFE8}'+
 /* the board area: owns its touches */
 '.rl6c .rmid{position:relative;flex:1;min-height:0;display:grid;place-items:center;touch-action:none}'+
 '.rl6c .rplay{position:relative;width:100%;height:100%;display:grid;place-items:center}'+
 '.rl6c .rhost{position:relative;width:100%;max-width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0;min-height:0;transform-origin:50% 50%}'+
 '.rl6c .rhost>*{max-width:100%}'+
 /* bottom zone: caption left, stack right */
 '.rl6c .rzone{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end;padding:2px 0 12px;flex:none}'+
 '.rl6c .rcap{min-width:0;display:grid;gap:4px;padding-left:2px}'+
 '.rl6c .rchip{display:flex;align-items:center;justify-content:flex-start;gap:8px;flex-wrap:nowrap;min-width:0}'+
 '.rl6c .rname{font:700 1.125rem/1.2 var(--disp);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}'+
 /* badges: dark ink on a light fill, at least 4.5:1 (Hard 7.1:1, Medium 9.7:1) */
 '.rl6c .diff{flex:none;font:750 .625rem/1 var(--font);letter-spacing:.08em;text-transform:uppercase;padding:3px 7px;border-radius:99px;background:#FF7A3D;color:#171412}.rl6c .diff.med{background:#F0B232}'+
 '.rl6c .rgoal{margin:0;text-align:left;font:600 .8125rem/1.3 var(--font);color:#D6CCBF;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'+
 '.rl6c .rrow{display:flex;gap:8px;margin-top:4px;min-width:0}'+
 '.rl6c .rpill{display:inline-flex;align-items:center;gap:6px;min-height:44px;max-width:100%;padding:0 12px;border-radius:22px;border:0;background:rgba(255,255,255,.12);color:#F4EFE8;font:700 .8125rem var(--font);white-space:nowrap;overflow:hidden;cursor:pointer;min-width:0}'+
 '.rl6c .rpill span{overflow:hidden;text-overflow:ellipsis}.rl6c .rpill svg{width:16px;height:16px;flex:none}'+
 '.rl6c .rnext{flex:none;padding:0 14px 0 16px;background:#F4EFE8;color:#171412}'+
 '.rl6c .rstack{display:grid;gap:12px;justify-items:center}'+
 '.rl6c .ract{display:grid;justify-items:center;gap:2px;border:0;background:none;color:#F4EFE8;padding:0;cursor:pointer;font:650 .6875rem/13px var(--font);min-width:48px}'+
 '.rl6c .ract span{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.10)}.rl6c .ract svg{width:26px;height:26px}'+
 '.rl6c .ract.liked span{color:#FF3B5C}.rl6c .ract.liked svg{fill:currentColor}'+
 /* solved: the caption becomes the Next button */
 '.rl6c .rsolved{display:none;width:100%;min-height:64px;border-radius:18px;border:0;background:#2F7D4F;color:#fff;font:750 1rem/1.25 var(--font);cursor:pointer;padding:8px 14px;text-align:left;align-items:center;justify-content:space-between;gap:8px;animation:rl6pop .35s ease-out}'+
 '.rl6c .rsolved small{display:block;font:600 .8125rem var(--font);opacity:.9}.rl6c .rsolved svg{width:22px;height:22px;flex:none}'+
 '.rl6c.solved .rsolved{display:flex}.rl6c.solved .rcap>*:not(.rsolved){display:none}'+
 '@keyframes rl6pop{0%{transform:scale(.85);opacity:0}100%{transform:scale(1);opacity:1}}'+
 /* double-tap heart */
 '.rl6c .rburst{position:absolute;z-index:9;width:96px;height:96px;margin:-48px 0 0 -48px;pointer-events:none;color:#FF3B5C;filter:drop-shadow(0 4px 14px rgba(0,0,0,.45));animation:rl6b .8s ease-out forwards}'+
 '.rl6c .rburst svg{width:100%;height:100%;fill:currentColor}'+
 '@keyframes rl6b{0%{transform:scale(.2) rotate(-12deg);opacity:0}15%{transform:scale(1.15) rotate(0);opacity:1}30%{transform:scale(.95)}45%{transform:scale(1)}80%{opacity:1}100%{transform:scale(1) translateY(-40px);opacity:0}}'+
 /* first-card swipe hint cue (sits over the bottom of the feed, never takes taps) */
 '.rl6 .rswipe{position:absolute;left:50%;bottom:10px;z-index:6;transform:translateX(-50%);display:inline-flex;align-items:center;gap:6px;padding:7px 14px 7px 10px;border-radius:99px;background:rgba(23,20,18,.86);color:#F4EFE8;font:700 .8125rem var(--font);pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,.4);transition:opacity .25s}'+
 '.rl6 .rswipe svg{width:18px;height:18px}.rl6 .rswipe.off{opacity:0}'+
 '.rl6c .rload{color:var(--rm6);font:600 .875rem var(--font)}'+
 '.rm .rl6c .rsolved,.rm .rl6c .rburst{animation:none}@media (prefers-reduced-motion:reduce){.rl6c .rsolved,.rl6c .rburst{animation:none}}'+
 '.rl6lv{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-top:14px}'+
 '.rl6lv button{aspect-ratio:1;min-height:44px;border-radius:12px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);font:750 .875rem var(--font);padding:0}'+
 '.rl6lv button.done{background:var(--ok,#2F7D4F);border-color:var(--ok,#2F7D4F);color:#fff}.rl6lv button.cur{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent)}'+
 '.rl6liked{display:flex;gap:8px;overflow-x:auto;padding:2px 0 4px;scrollbar-width:none}.rl6liked button{flex:none;min-height:44px;padding:0 14px;border-radius:22px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);font:700 .875rem var(--font);display:inline-flex;align-items:center;gap:6px}';
try{var s=document.createElement('style');s.id='rl6-css';s.textContent=CSS;document.head.appendChild(s)}catch(e){}
var SV=function(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'};
var IC={heart:SV('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  plane:SV('<path d="M21.5 3.5L10.2 14.1"/><path d="M21.5 3.5l-6.6 17-4.7-6.4-6.7-3.9z"/>'),
  book:SV('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M9 7h6"/>'),grid:SV('<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>'),
  chev:SV('<path d="M9 6l6 6-6 6"/>'),undo:SV('<path d="M9 5L4 10l5 5"/><path d="M4 10h10a6 6 0 0 1 0 12h-3"/>'),restart:SV('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>'),
  bulb:SV('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>'),up:SV('<path d="M6 15l6-6 6 6"/>'),down:SV('<path d="M6 9l6 6 6-6"/>')};
var GLOW=['rgba(245,178,60,.32)','rgba(63,167,181,.30)','rgba(154,114,224,.28)','rgba(232,89,12,.26)','rgba(93,187,130,.26)'];
var MAXUP=1.35;      /* a small board is scaled up to at most this */
var DBL_MS=350;      /* two taps within this (and 40 px) are a double-tap */

var R=window.RL6={el:null,feed:null,cards:[],cur:0,io:null,built:false,seq:0};
function liked(){var v=S();if(!v.liked||typeof v.liked!=='object')v.liked={};return v.liked}
function lkey(id,lv){return id+'|'+lv}
/* a harder kept level: 40% to 80% of the ladder (after trim6.js), Hard from 65% */
function pick(recent){recent=recent||[];var pool=PUZZLE_ORDER.filter(function(id){return P(id)&&recent.indexOf(id)<0});if(!pool.length)pool=PUZZLE_ORDER.filter(function(id){return P(id)&&id!==recent[recent.length-1]});if(!pool.length)pool=PUZZLE_ORDER.slice();
  var id=pool[Math.floor(Math.random()*pool.length)],N=P(id).levels,lo=Math.max(2,Math.round(N*.4)),hi=Math.max(lo,Math.round(N*.8)),lv=Math.min(N,lo+Math.floor(Math.random()*(hi-lo+1)));
  return {id:id,level:lv,hard:lv>=Math.round(N*.65)}}
function addCard(spec){spec=spec||pick(R.cards.slice(-4).map(function(c){return c.id}));var p=P(spec.id),k=R.cards.length,
  c={id:spec.id,level:spec.level,hard:spec.hard,n:k+1,mv:0,solved:false,ctrl:null,el:null};
  var on=!!liked()[lkey(c.id,c.level)];
  var e=h5('<section class="rl6c" data-i="'+k+'" data-id="'+c.id+'" data-level="'+c.level+'" aria-label="'+esc(p.name)+', level '+c.level+'">'+
    '<div class="bgglow" style="background:radial-gradient(circle at 50% 42%,'+GLOW[PUZZLE_ORDER.indexOf(c.id)%GLOW.length]+',transparent 62%)"></div>'+
    '<div class="rtop"><b>Reel</b><span>#'+(k+1)+'</span><span class="rctl">'+
      '<button class="rbtn" data-undo aria-label="Undo">'+IC.undo+'</button><button class="rbtn" data-restart aria-label="Restart">'+IC.restart+'</button>'+
      '<button class="rbtn" data-hint aria-label="Hint">'+IC.bulb+'<span class="badge" data-hb></span></button></span>'+
      '<span class="rstat"><span data-m>0</span> <span data-mw>moves</span></span></div>'+
    '<div class="rmid" data-board><div class="rplay"><div class="rhost" data-host><p class="rload">Loading…</p></div></div></div>'+
    '<div class="rzone"><div class="rcap">'+
      '<div class="rchip"><span class="rname">'+esc(p.name)+'</span><span class="diff'+(c.hard?'':' med')+'">'+(c.hard?'Hard':'Medium')+'</span></div>'+
      '<div class="rgoal">Level '+c.level+' · '+esc(ZT.goal(c.id))+'</div><p class="rhint" role="status" aria-live="polite" data-rh></p><div class="rchipslot zk-slot"></div>'+
      '<div class="rrow"><button class="rpill" data-explore aria-label="More '+esc(p.name)+' levels">'+IC.grid+'<span>More levels</span>'+IC.chev+'</button>'+
        '<button class="rpill rnext" data-next aria-label="Next challenge">Next'+IC.down+'</button></div>'+
      '<button class="rsolved" data-solved aria-label="Solved. Next challenge"><span><span data-sw>Solved</span><small>Next challenge</small></span>'+IC.down+'</button>'+
    '</div><div class="rstack">'+
      '<button class="ract'+(on?' liked':'')+'" data-like aria-pressed="'+on+'" aria-label="Like"><span>'+IC.heart+'</span><em data-lw style="font-style:normal">'+(on?'Liked':'Like')+'</em></button>'+
      '<button class="ract" data-rules aria-label="Rules"><span>'+IC.book+'</span>Rules</button>'+
      '<button class="ract" data-share aria-label="Share"><span>'+IC.plane+'</span>Share</button>'+
    '</div></div></section>');
  c.el=e;R.cards.push(c);R.feed.appendChild(e);
  qs(e,'[data-like]').onclick=function(){like(c)};qs(e,'[data-share]').onclick=function(){share(c)};
  qs(e,'[data-rules]').onclick=function(){if(window.ztRulesSheet)ztRulesSheet(c.id);ev('reel_rules')};qs(e,'[data-explore]').onclick=function(){explore(c)};
  qs(e,'[data-next]').onclick=function(){next(c)};qs(e,'[data-solved]').onclick=function(){next(c)};
  qs(e,'[data-undo]').onclick=function(){if(c.zr)c.zr.undo()};qs(e,'[data-hint]').onclick=function(){if(c.zr)c.zr.hint()};
  /* Restart: the same as the puzzle page; on a solved card it deals the same board again, to replay it for par */
  qs(e,'[data-restart]').onclick=function(){if(c.solved){replay(c);return}if(c.zr)c.zr.restart()};
  gestures(c);
  if(R.io)R.io.observe(e);return c}
R.add=function(spec){return addCard(spec)};   /* tests: append a given card */
function mount(c){if(c.ctrl||c.solved&&c.el.querySelector('.zk-board'))return;var host=qs(c.el,'[data-host]'),p=P(c.id),inst;host.innerHTML='';
  try{inst=p.make(c.level,pzRng(pzSeed(c.id,c.level,'')))}catch(e){host.innerHTML='<p class="rload">This one did not load. Swipe on.</p>';return}
  if(inst&&typeof inst==='object')inst.toolbar=false;c.inst=inst;c.mv=0;c.t0=performance.now();moves(c);
  try{var rg=qs(c.el,'.rgoal');if(rg)rg.textContent='Level '+c.level+' · '+ZT.goal(c.id,inst)}catch(e){}   /* 1.2.4: per-level goal lines (Zebra, Living Stones) */
  var api={rm:rmOn(),zen:true,toolbar:false,relaxed:false,now:function(){return performance.now()-c.t0},say:function(x){say(x)},
    moved:function(){c.mv++;moves(c)},
    done:function(res){if(c.solved)return;c.solved=true;var mv=typeof (res||{}).moves==='number'?res.moves:c.mv;c.moves=mv;
      qs(c.el,'[data-sw]').textContent='Solved in '+plur(mv,'move');var b=qs(c.el,'[data-solved]');b.setAttribute('aria-label','Solved in '+plur(mv,'move')+'. Next challenge');
      c.el.classList.add('solved');say('Solved in '+plur(mv,'move')+'.');fx('ok');ev('reel_solved');
      try{var lw=window.ZK;if(lw)lw.sfx('chime')}catch(e){}}};
  try{c.ctrl=p.mount(host,inst,api)}catch(e){console.error(e);host.innerHTML='<p class="rload">This one did not load. Swipe on.</p>'}
  /* 1.2.4: Undo, Restart and Hint through the same runner actions as the puzzle page; the moves chip follows that one count */
  var zs=window.ZK&&ZK.sess(host),rh=qs(c.el,'[data-rh]');c.zr=null;rh.textContent='';c.el.classList.remove('rhinting');
  if(zs&&window.ZR)c.zr=ZR({s:zs,fin:function(){return c.solved||!c.ctrl},btn:qs(c.el,'[data-hint]'),badge:qs(c.el,'[data-hb]'),say:function(x){say(x)},
    text:function(t){rh.textContent=t;c.el.classList.toggle('rhinting',!!t);if(t)say(t)},count:function(n){if(c.mv!==n){c.mv=n;moves(c)}}});
  /* re-fit when the board redraws itself (debounced; never while a finger is on the board) */
  try{if(c.mo)c.mo.disconnect();var t=0;c.mo=new MutationObserver(function(){clearTimeout(t);t=setTimeout(function(){if(!c.down)fit(c)},90)});c.mo.observe(host,{childList:true,subtree:true})}catch(e){}
  if(R.onMount)try{R.onMount(c)}catch(e){console.error(e)}   /* teach2: confusion watch on the new board */
  fit(c);requestAnimationFrame(function(){fit(c)});setTimeout(function(){fit(c)},350);setTimeout(function(){if(!c.down&&!c.mv)fit(c);c.settled=true},1000)}   /* the last one: after the board's entrance animations settle */
function moves(c){qs(c.el,'[data-m]').textContent=String(c.mv);qs(c.el,'[data-mw]').textContent=c.mv===1?'move':'moves'}
/* Scale the board to the space it has: down if it does not fit, up (to MAXUP) if it is small; transform keeps taps exact and the margins
   give the space back to the layout. The board's width is the box of what it draws: a full-width element only counts if it paints
   something (a panel, a river), so a transparent full-width wrapper does not stop the scale-up, and a painted panel never gets cut. */
function painted(e){var c=getComputedStyle(e);return /svg|img|canvas/i.test(e.tagName)||c.backgroundImage!=='none'||c.boxShadow!=='none'||parseFloat(c.borderLeftWidth)>0||!/rgba\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor)}
function fit(c){var h=qs(c.el,'[data-host]'),mid=qs(c.el,'.rmid');if(!h||!mid||!c.el.isConnected||qs(h,'.rload'))return;
  h.style.transform='';h.style.margin='';h.style.transformOrigin='';var hr=h.getBoundingClientRect(),hh=h.scrollHeight,l=1e9,r=-1e9;
  [].forEach.call(h.querySelectorAll('*'),function(e){var b=e.getBoundingClientRect();if(b.width<2||b.height<2)return;if(b.width>=hr.width-1&&!painted(e))return;l=Math.min(l,b.left);r=Math.max(r,b.right)});
  var bw=r>l?Math.max(r-l,1):hr.width,cx=r>l?(l+r)/2-(hr.left+hr.width/2):0,aw=mid.clientWidth-4,ah=mid.clientHeight-12;if(!hh||ah<60)return;
  var sc=Math.min(MAXUP,ah/hh,aw/bw);
  if(c.settled&&c.scale&&Math.abs(sc-c.scale)/c.scale<.02)sc=c.scale;   // once settled, a hint mark or a chip never nudges the board (fix124:first-move); a new level re-fits
  c.scale=sc;if(Math.abs(sc-1)<.01)return;
  h.style.transformOrigin=(50+100*cx/hr.width).toFixed(2)+'% 50%';h.style.transform='translateX('+(-cx).toFixed(1)+'px) scale('+sc.toFixed(3)+')';h.style.margin=(hh*(sc-1)/2).toFixed(1)+'px 0'}
window.addEventListener('resize',function(){R.cards.forEach(function(c){if(c.ctrl)fit(c)})});
function replay(c){c.settled=false;if(c.ctrl)try{c.ctrl.destroy&&c.ctrl.destroy()}catch(e){}c.ctrl=null;c.zr=null;if(c.mo){c.mo.disconnect();c.mo=null}c.solved=false;c.el.classList.remove('solved','rhinting');
  var h=qs(c.el,'[data-host]');h.style.transform='';h.style.margin='';h.innerHTML='<p class="rload">Loading…</p>';mount(c);ev('reel_replay')}
function unmount(c){c.settled=false;if(!c.ctrl)return;try{c.ctrl.destroy&&c.ctrl.destroy()}catch(e){}c.ctrl=null;c.zr=null;if(c.mo){c.mo.disconnect();c.mo=null}if(!c.solved){var h=qs(c.el,'[data-host]');h.innerHTML='<p class="rload">Loading…</p>';h.style.transform='';h.style.margin=''}}
function focus(i){if(i!==R.cur)hintSeen();R.cur=i;
  while(R.cards.length<i+3)addCard();
  R.cards.forEach(function(c,k){if(Math.abs(k-i)<=1)mount(c);else if(Math.abs(k-i)>2)unmount(c)})
  /* teach2: the teaching layer (teach2.js) hears which card is in view, to offer its Show me demo on a puzzle met for the first time */
  if(R.onFocus)try{R.onFocus(R.cards[i])}catch(e){console.error(e)}}
/* the next card: Next, the solved button (scrolls the feed, which then focuses and mounts it as a swipe does) */
function next(c){var i=R.cards.indexOf(c);while(R.cards.length<i+2)addCard();R.feed.scrollTo({top:R.cards[i+1].el.offsetTop,behavior:rmOn()?'auto':'smooth'});ev('reel_next')}
/* Like: the stack shows the state (Liked), no toast */
function like(c,force){var L=liked(),k=lkey(c.id,c.level),on=force===undefined?!L[k]:force;if(on===!!L[k])return;if(on)L[k]={id:c.id,level:c.level,at:Date.now()};else delete L[k];save();
  var b=qs(c.el,'[data-like]');b.classList.toggle('liked',on);b.setAttribute('aria-pressed',String(on));qs(b,'[data-lw]').textContent=on?'Liked':'Like';
  fx('tap');say(on?'Liked':'Like removed');ev(on?'reel_like':'reel_unlike');try{Nav.refresh('almanac')}catch(e){}}
/* the board box: what the board draws (its visible elements), on screen */
function boardBox(c){var h=qs(c.el,'[data-host]'),b=null;if(!h)return null;
  [].forEach.call(h.querySelectorAll('*'),function(e){if(e.closest('.rload'))return;var r=e.getBoundingClientRect();if(r.width<2||r.height<2)return;
    if(!b)b={l:r.left,t:r.top,r:r.right,b:r.bottom};else{b.l=Math.min(b.l,r.left);b.t=Math.min(b.t,r.top);b.r=Math.max(b.r,r.right);b.b=Math.max(b.b,r.bottom)}});return b}
R.boardBox=function(i){var c=R.cards[i==null?R.cur:i];return c&&boardBox(c)};
/* double-tap on anything that is not the board or a control likes the card (Instagram); the board keeps its own taps */
function gestures(c){var e=c.el,lt=0,lx=0,ly=0,dx=0,dy=0,mid=qs(e,'.rmid');
  mid.addEventListener('pointerdown',function(){c.down=true},true);
  var up=function(){if(c.down){c.down=false;setTimeout(function(){if(!c.down)fit(c)},120)}};mid.addEventListener('pointerup',up,true);mid.addEventListener('pointercancel',up,true);
  e.addEventListener('pointerdown',function(v){dx=v.clientX;dy=v.clientY});
  e.addEventListener('pointerup',function(v){var t=v.target,x=v.clientX,y=v.clientY;
    if(Math.abs(x-dx)>12||Math.abs(y-dy)>12){lt=0;return}                  /* a drag, not a tap */
    if(t.closest&&t.closest('button,a,input,select,textarea,[role=button]')){lt=0;return}
    var host=qs(e,'[data-host]');if(host&&t!==host&&host.contains(t)){lt=0;return}
    var b=boardBox(c);if(b&&x>=b.l&&x<=b.r&&y>=b.t&&y<=b.b){lt=0;return}
    if(v.timeStamp-lt<DBL_MS&&Math.abs(x-lx)<40&&Math.abs(y-ly)<40){lt=0;dlike(c,x,y)}else{lt=v.timeStamp;lx=x;ly=y}})}
function dlike(c,x,y){like(c,true);var r=c.el.getBoundingClientRect(),b=h5('<div class="rburst" aria-hidden="true">'+IC.heart+'</div>');
  b.style.left=(x-r.left)+'px';b.style.top=(y-r.top)+'px';c.el.appendChild(b);setTimeout(function(){b.remove()},rmOn()?300:850);ev('reel_dbl_like')}
/* share: the existing challenge link (challenge.js) for this exact board, through navigator.share (the app shell's native share bridge) */
function shareText(c){var p=P(c.id),link=ZC.link({id:c.id,level:c.level,seed:0,target:c.solved?c.moves:0,hints:0});
  return {link:link,text:p.name+', level '+c.level+(c.solved?': '+plur(c.moves,'move')+'. Can you beat it?':'. Can you solve it?')+(link?'\n'+link:'')}}
async function share(c){ev('share_tap');var s=shareText(c);R.lastShare=s.text;
  try{if(navigator.share){await navigator.share({text:s.text});ev('share_done');return}}catch(e){if(e&&e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(s.text);ev('share_done');toast('Link copied. Paste it anywhere.');return}catch(e){}
  Nav.sheet({title:'Challenge a friend',body:'<p class="sm">Copy this:</p><p style="margin-top:8px;word-break:break-all">'+esc(s.text)+'</p>'})}
function explore(c){var p=P(c.id),z=pzProg(c.id),done=z&&z.best?z.best:{},L=liked(),n=0,cells='';
  for(var i=1;i<=p.levels;i++){var d=!!done[i];if(d)n++;cells+='<button class="'+(d?'done':i===c.level?'cur':'')+'" data-lv="'+i+'" aria-label="Level '+i+(d?', solved':'')+(i===c.level?', this card':'')+'">'+i+'</button>'}
  var lk=Object.keys(L).filter(function(k){return L[k].id===c.id}).length;
  var b=h5('<div><p class="sm">'+plur(p.levels,'level')+' · '+n+' solved · this card is level '+c.level+(lk?' · '+lk+' liked':'')+'</p><div class="rl6lv">'+cells+'</div><button class="btn sec wide" data-back style="margin-top:16px">Keep scrolling the Reel</button></div>');
  var sh=Nav.sheet({title:p.name,body:b,cls:'rl6sheet'});qs(b,'[data-back]').onclick=function(){sh.close()};
  qsa(b,'[data-lv]').forEach(function(x){x.onclick=function(){sh.close();ev('reel_explore');openLevel(c.id,+x.dataset.lv)}})}
function openLevel(id,lv){try{applyTheme()}catch(e){}playPuzzle(id,lv,{})}
function dark(){document.documentElement.setAttribute('data-theme','dark')}

/* ---------- first-card swipe hint (owner, 6 Nov): about 1 s after the first card settles, the card nudges up ~56 px and springs back,
   showing a peek of the next card, with a "Swipe up" cue; twice, then it stops. Shown until the player has moved to another card once
   (S().teach.reelswipe), cancelled by any touch, key or wheel. Reduced motion: the cue only, no movement. The nudge scrolls the feed with
   snapping off (the cards themselves are never transformed), stays far below the 60% focus threshold and comes back to exactly the
   same card; it never runs once the player has made a move on the card. ?demo (test fixtures) skips it unless ?teach or ?swipehint is given. */
var HQ=/[?&](teach|swipehint)\b/.test(location.search),HQUIET=window.Q&&Q.demo&&!HQ,HPX=56,HMS=1000;
var H=R.hint={state:'idle',plays:0,t:0,raf:0,cue:null};
/* any touch in the Reel before the hint starts (even before the first card has settled) means it never plays on this visit */
document.addEventListener('pointerdown',function(e){if(R.el&&R.el.contains(e.target))H.touched=1},true);
function TS(){var v=S();if(!v.teach||typeof v.teach!=='object')v.teach={};return v.teach}
function hintSeen(){if(H.state==='run'||H.state==='wait')hintStop();var t=TS();if(!t.reelswipe){t.reelswipe=1;save()}}
function hintLater(){if(H.touched&&H.state==='idle'){H.state='done';return}if(HQUIET||TS().reelswipe||H.state!=='idle'||R.cur!==0)return;H.state='wait';clearTimeout(H.t);H.t=setTimeout(hintRun,HMS);
  ['pointerdown','wheel','keydown'].forEach(function(k){document.addEventListener(k,hintStop,true)})}
function hintStop(){clearTimeout(H.t);cancelAnimationFrame(H.raf);['pointerdown','wheel','keydown'].forEach(function(k){document.removeEventListener(k,hintStop,true)});
  if(H.state==='run'&&R.feed){R.feed.style.scrollSnapType='';if(R.feed.scrollTop<HPX+4)R.feed.scrollTop=0}
  if(H.cue){var q=H.cue;H.cue=null;q.classList.add('off');setTimeout(function(){q.remove()},260)}
  if(H.state==='wait'||H.state==='run')H.state='done'}
R.hintStop=hintStop;
function hintRun(){var c=R.cards[0];if(H.state!=='wait'||H.touched||Nav.cur!=='play'||Nav.depth||R.cur!==0||!c||c.mv>0||c.down||c.solved||!R.feed||R.feed.scrollTop>2){H.state='done';return hintStop()}
  H.state='run';ev('reel_swipe_hint');
  var q=h5('<div class="rswipe" data-swipehint aria-hidden="true">'+IC.up+'Swipe up</div>');R.el.querySelector('.rl6').appendChild(q);H.cue=q;
  if(rmOn()){H.t=setTimeout(hintStop,2600);return}
  var f=R.feed,n=0;f.style.scrollSnapType='none';
  /* one nudge: up in 320 ms (ease-out), back with a small spring in 520 ms; two nudges 500 ms apart */
  function nudge(){var t0=performance.now();(function step(now){if(H.state!=='run')return;var t=now-t0,y;
      if(t<320){var a=t/320;y=HPX*(1-Math.pow(1-a,3))}else if(t<840){var b=(t-320)/520;y=HPX*Math.cos(b*Math.PI*1.5)*Math.exp(-3*b);if(y<0)y=0}else y=0;
      f.scrollTop=Math.round(y);
      if(t<840){H.raf=requestAnimationFrame(step);return}
      f.scrollTop=0;H.plays=++n;if(n<2){H.t=setTimeout(nudge,500)}else{f.style.scrollSnapType='';H.t=setTimeout(hintStop,700)}})(t0)}
  nudge()}

/* ---------- the Play tab ---------- */
var old=document.getElementById('s-play');if(old)old.remove();
Nav.reg('play',{label:'Play',notabs:false,
  build:function(root){root.innerHTML='<div class="rl6"><div class="feed" tabindex="0" aria-label="Challenge reel. Scroll up or down."></div></div>';
    R.el=root;R.feed=qs(root,'.feed');R.built=true;
    try{R.io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&e.intersectionRatio>=.6)focus(+e.target.dataset.i)})},{root:R.feed,threshold:[.6]})}catch(e){R.io=null}
    R.feed.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='PageDown'||e.key==='PageUp'){if(e.target!==R.feed)return;e.preventDefault();R.feed.scrollBy({top:(/Down/.test(e.key)?1:-1)*R.feed.clientHeight,behavior:rmOn()?'auto':'smooth'})}});
    /* without IntersectionObserver: follow the scroll position */
    var st=0;R.feed.addEventListener('scroll',function(){clearTimeout(st);st=setTimeout(function(){var i=Math.round(R.feed.scrollTop/Math.max(1,R.feed.clientHeight));if(i!==R.cur&&R.cards[i])focus(i)},120)},{passive:true})},
  show:function(root){dark();if(!R.cards.length){addCard();addCard();addCard();focus(0)}else focus(R.cur);ev('reel_open');hintLater()},
  refresh:function(root){if(Nav.cur==='play'&&!Nav.depth)dark()},
  hide:function(root){hintStop();try{applyTheme()}catch(e){}},
  onBack:function(){Nav.tab('today');return true},
  reselect:function(){if(R.feed)R.feed.scrollTo({top:R.feed.scrollTop+R.feed.clientHeight,behavior:rmOn()?'auto':'smooth'})}});
/* a page pushed over the reel (a level from Explore) runs in the player's own theme; back on the reel it is dark again */
var push0=Nav.push;Nav.push=function(){if(Nav.cur==='play')try{applyTheme()}catch(e){}return push0.apply(Nav,arguments)};
var pop0=Nav.pop;Nav.pop=function(){var r=pop0.apply(Nav,arguments);Promise.resolve(r).then(function(){if(Nav.cur==='play'&&!Nav.depth)dark()});return r};
/* the Today entry: the new reel's words */
var tr0=todayRender;todayRender=function(root,first){var r=tr0.apply(this,arguments);try{var b=qs(root,'[data-reel] .rt');if(b&&!b.dataset.rl6){b.dataset.rl6=1;b.innerHTML='<b>The Reel</b><small>Harder levels to swipe through</small>'}}catch(e){}return r};
/* the Almanac: liked challenges, one tap to play */
if(typeof almRender==='function'){var ar0=almRender;almRender=function(root){var r=ar0.apply(this,arguments);try{likedRow(root)}catch(e){}return r}}
function likedRow(root){var L=liked(),ks=Object.keys(L).filter(function(k){return P(L[k].id)}).sort(function(a,b){return L[b].at-L[a].at}),box=qs(root,'[data-liked]');
  if(!ks.length){if(box)box.remove();return}
  if(!box){box=h5('<div class="sect" data-liked style="margin:14px 0 0"></div>');var pad=qs(root,'.pad')||root,h=pad.firstElementChild;if(h&&h.nextSibling)pad.insertBefore(box,h.nextSibling);else pad.appendChild(box)}
  box.innerHTML='<div class="sh"><h2>Liked in the Reel</h2></div><div class="rl6liked">'+ks.map(function(k){var x=L[k];return '<button data-k="'+esc(k)+'">'+IC.heart.replace('<svg','<svg width="16" height="16"')+esc(P(x.id).name)+' · '+x.level+'</button>'}).join('')+'</div>';
  qsa(box,'[data-k]').forEach(function(b){b.onclick=function(){var x=L[b.dataset.k];playPuzzle(x.id,x.level,{})}})}
})();
