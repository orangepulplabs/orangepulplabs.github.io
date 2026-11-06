/* v6 teaching layer, shared by the app (teach6.js, reel6.js) and the friend page (site-src/play6.js). Pure helpers, no app state.
   Owner-approved mix (prototype "Seven ways to show a new player what to do", 5 Nov 2026):
   - ZT.goal(id): one goal line, 8 words max, always above the board (Docs/v6/goal-lines.md).
   - ZT.rules(id): the Rules sheet, 3 numbered steps split from each puzzle's own `how` text.
   - ZT.nudge(o): after 4 s with no input before the first move, the hint hand on a suggested first move with "Try tapping here".
     The move comes from the puzzle's own hint (level 2, or 1 where that marks the piece), run on an invisible copy of the board (so the real board, its hint count and stars are untouched).
   - ZT.thumb(id, inst): the "goal" picture, only for Tube Sort and Slide Tiles (cheap: the finished board is fixed by the level).
     Four Shades and Who Owns the Zebra are skipped: their finished board is the answer itself, so a picture would give the puzzle away. */
(function(){
var ZT=window.ZT={};
/* id: [goal line, [step 1, step 2, step 3]] */
var T=ZT.T={
 'switch-off':['Turn off every light',['Tap any light.','It switches, and so do the lights above, below and beside it.','Make the whole board dark.']],
 'jump-away':['Jump pegs until only one is left',['Jump a peg over its neighbour into an empty hole.','The jumped peg comes off.','Leave one peg on the board.']],
 'tube-sort':['Sort each colour into its own tube',['Tap a tube, then tap where to pour.','It pours onto the same colour or into an empty tube.','Finish with one colour per tube.']],
 'tilt-run':['Roll the ball into the hole',['Swipe to roll the ball.','It slides until something stops it.','Drop it into the hole.']],
 'slide-tiles':['Put every number back in its place',['Tap a tile next to the gap.','It slides into the gap.','Get every number onto its own place.']],
 'make-target':['Combine the numbers to make the target',['Pick two numbers.','Pick a sign to join them into a new number.','Keep going until you make the target.']],
 'balance-weights':['Make both pans of the scale balance',['Drag a weight onto either pan.','The scale tips to the heavier side.','Make it balance, with as few weights as you can.']],
 'zero-one':['Equal 0s and 1s, never three alike',['Tap a cell for 0, again for 1.','No three alike in a row or column.','Each row and column holds as many 0s as 1s.']],
 'four-by-four':['No repeats in any row, column or box',['Tap a cell, then a number.','Each number once in every row and column.','And once in every box.']],
 'dodecahedron-tour':['Visit every corner once, then return home',['Hop from corner to corner along the lines.','Light every corner exactly once.','Finish back where you started.']],
 'river-ferry':['Get everyone across the river safely',['Tap a passenger, then the boat.','The boat carries them to the other bank.','Never leave a biting pair alone.']],
 'seven-pieces':['Fill the outline with all seven pieces',['Drag a piece onto the outline.','It turns to fit where you drop it.','Fill the whole outline.']],
 'code-cracker':['Find the hidden colour code from the clues',['Fill the row with pegs.','Tap Check.','A filled pip: right peg, right slot. A hollow pip: right peg, wrong slot.']],
 'dot-loop':['Draw the shortest loop: dots inside, rings outside',['Drag along the grid lines, from corner to corner.','Close the wire into one loop: filled dots inside, rings outside.','Use as little wire as you can: the shortest loop is best.']],
 'bridge-walk':['Cross every bridge once, or prove it can’t',['Walk from island to island over the bridges.','Use every bridge exactly once.','No way? Flag it and mark the odd islands.']],
 'four-shades':['Colour the map so neighbours never match',['Pick a colour.','Tap a region to paint it.','Regions that touch must be different colours.']],
 'word-steps':['Step to the flag word, letter by letter',['Tap a letter.','Pick a new letter for it.','Every step must be a real word.']],
 'word-square':['Arrange the words so rows match columns',['Drag a row to its place, or tap it and then its slot.','Green tiles match their mirror.','Make every tile green.']],
 'scramble':['Unscramble the letters to spell the word',['See the word first.','Tap the letters in order to spell it.','Every tile you place counts as a move.']],
 'tiger-and-herd':['Trap all three tigers with your goats',['Tap a point to place a goat. The tigers move after you.','A tiger jumps over a goat to the empty point behind it, and takes that goat.','Trap all three so none can move.']],
 'blockade':['Block the other side so they cannot move',['Slide a counter to a free point beside it.','The other side moves after you.','Leave them with no move. If they can always escape, you lose.']],
 'seed-pits':['Capture the target number of seeds',['Tap a pit to sow its seeds round the ring.','A last seed in a pit with seeds captures it.','Capture the target.']],
 'who-owns-the-zebra':['Use the clues: who owns the zebra?',['Read the clues.','Tap a cell, then a choice.','Place every fact.']],
 'living-stones':['Capture the marked white group, or save yours',['Place a dark stone on a point. White answers each one.','A group with no free points next to it is captured.','Capture or save the marked group with the stones you are given: one pip each.']],
 'link-across':['Link the two orange edges before the computer',['Place a disc on a free cell.','The computer places a navy diamond after you.','Link the orange edges before it links the navy ones.']]};
/* the nudge label: most puzzles start with a tap, a few with a drag or a swipe */
var VERB={'tilt-run':'Try swiping from here','seven-pieces':'Try dragging from here','balance-weights':'Try dragging this','dot-loop':'Try dragging from here','jump-away':'Try dragging this peg'};
/* which hint level marks the concrete first move (on the throwaway copy): level 2 for most ('Try this light', 'Slide this one');
   level 1 where level 1 already marks the piece to move (and level 2 may play it) */
var HINT_LV={'jump-away':1,'tube-sort':1,'seven-pieces':1,'word-steps':1,'tiger-and-herd':1,'blockade':1,'who-owns-the-zebra':1};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
/* 1.2.4: a few goal lines depend on the level (inst, when the caller has it), so the line is true on every level; without inst the table line is used.
   - Who Owns the Zebra: levels 1-3 have no people row, so 'who owns' had no answer there; they ask which house has the zebra.
   - Living Stones: the problem type and the stone budget (k) come from the level (living-stones-01/03). */
var BY_LEVEL={
 'who-owns-the-zebra':function(i){return i.cats&&i.cats.indexOf(0)<0?'Use the clues: which house has the zebra?':null},
 'living-stones':function(i){if(!i.k)return null;var n=i.k+(i.k===1?' stone':' stones');return i.type==='save'?'Keep the marked dark group alive: '+n:'Capture the marked white group in '+n}};
ZT.goal=function(id,inst){var t=T[id];if(inst&&BY_LEVEL[id]){try{var g=BY_LEVEL[id](inst);if(g)return g}catch(e){}}return t?t[0]:''};
ZT.steps=function(id,how){var t=T[id];if(t)return t[1].slice();var s=String(how||'').split(/(?<=[.!?])\s+/).filter(Boolean);while(s.length>3)s[1]=s[1]+' '+s.splice(2,1)[0];return s};
ZT.stepsHtml=function(id,how){return '<ol class="zt-steps">'+ZT.steps(id,how).map(function(x,i){return '<li><i>'+(i+1)+'</i><span>'+esc(x)+'</span></li>'}).join('')+'</ol>'};
ZT.label=function(id){return VERB[id]||'Try tapping here'};
var BOOK='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M9 7h6"/></svg>';
ZT.BOOK=BOOK;

var CSS='.zt-goal{margin:2px 16px 4px;text-align:center;font:650 .9375rem/1.35 var(--font,system-ui);color:var(--ink,#1B1916);text-wrap:balance}'+
 '.zt-rules{flex:none;min-width:44px;height:56px;padding:0 16px;border-radius:28px;border:2px solid var(--accent,#E8590C);background:transparent;color:var(--ink,#1B1916);font:750 .9375rem var(--font,system-ui);display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}'+
 '.zt-rules:active{transform:scale(.95)}'+
 '.zt-steps{list-style:none;margin:0;padding:0;display:grid;gap:12px}.zt-steps li{display:flex;gap:12px;align-items:flex-start;font:500 1rem/1.45 var(--font,system-ui)}'+
 '.zt-steps li i{flex:none;width:26px;height:26px;border-radius:50%;background:var(--accent,#E8590C);color:var(--on-accent,#fff);font:750 .8125rem var(--font,system-ui);font-style:normal;display:grid;place-items:center;margin-top:-1px}'+
 '.zt-nudge{position:absolute;z-index:8;width:0;height:0;pointer-events:none}'+
 '.zt-nudge .zt-dot{position:absolute;left:0;top:0;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.88);box-shadow:0 0 0 3px rgba(232,89,12,.85),0 4px 12px rgba(0,0,0,.3);transform:translate(-50%,-50%);animation:zt-tap 1.4s ease-in-out infinite}'+
 '.zt-nudge .zt-lbl{position:absolute;left:-74px;top:22px;width:148px;text-align:center;font:700 .8125rem/1.25 var(--font,system-ui);color:var(--bg,#F7F4EE);background:var(--ink,#1B1916);border-radius:10px;padding:5px 8px;box-shadow:0 6px 16px -6px rgba(0,0,0,.45)}'+
 '.zt-nudge.up .zt-lbl{top:auto;bottom:22px}'+
 '@keyframes zt-tap{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(.72)}}'+
 '@media (prefers-reduced-motion:reduce){.zt-nudge .zt-dot{animation:none}}.rm .zt-nudge .zt-dot{animation:none}'+
 '.zt-thumb{display:inline-flex;flex-direction:column;align-items:center;gap:3px;font:750 .625rem/1 var(--font,system-ui);letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#6F675E);vertical-align:middle}'+
 '.zt-mini{display:grid;gap:2px;background:var(--board,#2D2925);padding:4px;border-radius:7px}'+
 '.zt-mini i{width:11px;height:11px;border-radius:3px;background:#F4EFE8;color:#1E1B17;font:800 7px/11px var(--font,system-ui);font-style:normal;text-align:center}.zt-mini i.b{background:transparent}'+
 '.zt-tubes{display:flex;gap:3px;align-items:flex-end;padding:3px 4px}.zt-tubes span{display:flex;flex-direction:column-reverse;gap:1px;width:9px;padding:1px 0 2px;border:1.5px solid var(--muted,#6F675E);border-top:0;border-radius:0 0 5px 5px;align-items:center}'+
 '.zt-tubes span b{width:6px;height:6px;border-radius:50%}'+
 '.zt-goalrow{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}'+
 '.zt-sheet-scrim{position:fixed;inset:0;z-index:90;background:rgba(20,17,14,.5)}'+
 '.zt-sheet{position:fixed;left:0;right:0;bottom:0;z-index:91;max-width:520px;margin:0 auto;background:var(--bg,#F7F4EE);color:var(--ink,#1B1916);border-radius:24px 24px 0 0;padding:20px 20px calc(22px + env(safe-area-inset-bottom,0px));display:grid;gap:14px;box-shadow:0 -14px 30px -10px rgba(0,0,0,.45)}'+
 '.zt-sheet h2{margin:0;font:700 1.25rem/1.25 var(--disp,Georgia,serif)}'+
 '.zt-sheet .zt-ok{min-height:48px;border:0;border-radius:16px;background:var(--accent,#E8590C);color:var(--on-accent,#fff);font:750 1rem var(--font,system-ui);cursor:pointer}';
function css(){if(document.getElementById('zt-css'))return;var s=document.createElement('style');s.id='zt-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}
ZT.css=css;try{css()}catch(e){}

/* a standalone bottom sheet (the friend page has no Nav.sheet) */
ZT.sheet=function(title,html,btn){css();var sc=document.createElement('div'),sh=document.createElement('div');sc.className='zt-sheet-scrim';sh.className='zt-sheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');sh.setAttribute('aria-label',title);
  sh.innerHTML='<h2>'+esc(title)+'</h2>'+html+'<button class="zt-ok" type="button">'+esc(btn||'Back to the puzzle')+'</button>';
  function close(){sc.remove();sh.remove();document.removeEventListener('keydown',key,true)}
  function key(e){if(e.key==='Escape'){e.preventDefault();close()}}
  sc.onclick=close;sh.querySelector('.zt-ok').onclick=close;document.addEventListener('keydown',key,true);document.body.appendChild(sc);document.body.appendChild(sh);
  try{sh.querySelector('.zt-ok').focus({preventScroll:true})}catch(e){}return {el:sh,close:close}};

/* ---------- the suggested first move ----------
   o: {p (puzzle def), make () -> a fresh instance of the same level, root (the real board's host element)}.
   Mounts an invisible copy laid over the real host, asks its hint(1) where to start, reads the marked element, then throws the copy away.
   Returns {x, y} in root coordinates, or null. Sound and haptics are muted while the copy runs. */
ZT.suggest=function(o){var root=o.root,p=o.p;if(!root||!p||!root.isConnected)return null;var r=root.getBoundingClientRect();if(!r.width)return null;
  var Z=window.ZK,sfx=Z&&Z.sfx,buzz=Z&&Z.buzz,box=document.createElement('div'),ctrl=null,pt=null,vib=navigator.vibrate;
  box.className=root.className;box.setAttribute('aria-hidden','true');box.setAttribute('inert','');
  box.style.cssText='position:absolute;visibility:hidden;pointer-events:none;margin:0;left:'+root.offsetLeft+'px;top:'+root.offsetTop+'px;width:'+r.width+'px;height:'+r.height+'px;box-sizing:border-box';
  var par=root.offsetParent||root.parentNode;
  try{if(Z){Z.sfx=function(){};Z.buzz=function(){}}try{navigator.vibrate=function(){return true}}catch(e){}
    par.appendChild(box);var inst=o.make();if(inst&&typeof inst==='object')inst.toolbar=false;
    ctrl=p.mount(box,inst,{rm:true,zen:true,toolbar:false,relaxed:false,now:function(){return 0},say:function(){},moved:function(){},done:function(){}});
    try{ctrl&&ctrl.hint&&ctrl.hint(HINT_LV[o.id]||2)}catch(e){}
    var m=box.querySelector('.zk-mark')||box.querySelector('.dl-hint,.zb-c.sel')||box.querySelector('[data-zkc]:not([disabled])')||box.querySelector('.zk-board button:not([disabled])')||box.querySelector('.zk-board');
    if(m){var a=m.getBoundingClientRect(),b=box.getBoundingClientRect();if(a.width||a.height)pt={x:a.left-b.left+a.width/2,y:a.top-b.top+a.height/2}}}
  catch(e){pt=null}
  finally{try{ctrl&&ctrl.destroy&&ctrl.destroy()}catch(e){}box.remove();if(Z){Z.sfx=sfx;Z.buzz=buzz}try{navigator.vibrate=vib}catch(e){}}
  return pt};

/* ---------- the nudge ----------
   o: {id, p, make, root (board host), moved () -> true once the player has moved, ms (default 4000)}. Returns {stop()}.
   Any input on the board (pointer or key) before the nudge cancels it; any input after it hides it. Never shown after the first move. */
ZT.nudge=function(o){css();var root=o.root,el=null,t=null,dead=false,ms=o.ms==null?(window.ZT_NUDGE_MS||4000):o.ms;
  function hide(){if(el){el.remove();el=null}}
  function stop(){if(dead)return;dead=true;clearTimeout(t);hide();root.removeEventListener('pointerdown',stop,true);document.removeEventListener('keydown',stop,true)}
  function show(){if(dead||!root.isConnected||(o.moved&&o.moved()))return stop();if(o.blocked&&o.blocked()){t=setTimeout(show,800);return}
    var pt=ZT.suggest(o);if(!pt||dead)return;el=document.createElement('div');el.className='zt-nudge'+(pt.y>root.clientHeight-70?' up':'');el.setAttribute('data-nudge','');
    el.style.left=(root.offsetLeft+pt.x)+'px';el.style.top=(root.offsetTop+pt.y)+'px';el.innerHTML='<span class="zt-dot"></span><span class="zt-lbl">'+esc(ZT.label(o.id))+'</span>';
    (root.offsetParent||root.parentNode).appendChild(el);if(getComputedStyle(root.offsetParent||root.parentNode).position==='static')(root.offsetParent||root.parentNode).style.position='relative';
    /* 1.2.4 (seven-pieces-02): keep the label on screen when the suggested point is near an edge (the hand stays on the point) */
    try{var lb=el.querySelector('.zt-lbl'),r=lb.getBoundingClientRect(),vw=document.documentElement.clientWidth,sh=0;if(r.left<8)sh=8-r.left;else if(r.right>vw-8)sh=vw-8-r.right;if(sh)lb.style.left=(-74+sh)+'px'}catch(e){}}
  root.addEventListener('pointerdown',stop,true);document.addEventListener('keydown',stop,true);t=setTimeout(show,ms);
  return {stop:stop,shown:function(){return !!el}}};

/* ---------- the goal picture (Tube Sort, Slide Tiles) ---------- */
var TUBE_COL=['#F0A01A','#56B4E9','#16A383','#F2E43F','#2273C3','#E0561B','#D27FB0'];
ZT.thumb=function(id,inst){try{
  if(id==='slide-tiles'&&inst&&inst.n){var n=inst.n,h='';for(var i=1;i<n*n;i++)h+='<i>'+i+'</i>';h+='<i class="b"></i>';
    return '<span class="zt-thumb" data-goalpic role="img" aria-label="Goal: 1 to '+(n*n-1)+' in order, gap last"><span class="zt-mini" style="grid-template-columns:repeat('+n+',11px)">'+h+'</span>Goal</span>'}
  if(id==='tube-sort'&&inst&&inst.tubes){var cols={},k=inst.k||0;inst.tubes.forEach(function(t){String(t).split('').forEach(function(c){cols[c]=(cols[c]||0)+1})});
    var ks=Object.keys(cols).sort(),cap=k||Math.max.apply(null,ks.map(function(c){return cols[c]})),hh='';
    ks.forEach(function(c){hh+='<span>'+new Array(cols[c]+1).join('<b style="background:'+(TUBE_COL[+c]||'#999')+'"></b>')+'</span>'});
    for(var e=ks.length;e<inst.tubes.length;e++)hh+='<span style="height:'+(cap*7+3)+'px"></span>';
    return '<span class="zt-thumb" data-goalpic role="img" aria-label="Goal: one colour per tube"><span class="zt-tubes">'+hh+'</span>Goal</span>'}
  }catch(e){}return ''};
})();
