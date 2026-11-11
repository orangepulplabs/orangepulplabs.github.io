/* v6 runner patch, loaded after ../v5/runner.js (v5 files are not modified).
   For a v6 puzzle (def.v6) the win happens ON the board: the puzzle's own finish, then ZK.win (settle, chime, wave, stars, Next in < 1 s).
   Progress is saved at once, exactly as v5 does. The full v5 reward page (card, chain, week, share) still opens by itself when there is
   something new to show (daily, first run, a friend challenge, a new card or tier, the week goal, a season gift); otherwise the player goes straight on (no 'Details' link, owner default). */
(function(){
var v5finish=finishPuzzle;
function bigMoment(st,w){var o=st.o;return !!(o.daily||o.first||o.guest||o.friend||w.card||w.tier||w.weekMetNow||w.gift)}
finishPuzzle=function(st,res){var p=P(st.id);if(!p||!p.v6||!window.ZK)return v5finish(st,res);
  var moves=typeof res.moves==='number'?res.moves:st.mv,r={solved:true,moves:moves,hints:res.hints!=null?res.hints:st.hints,undos:st.undos,extra:res.extra||{},secs:Math.round((performance.now()-st.t0)/1000)},sr;
  try{sr=p.stars(r,st.inst)||{}}catch(e){sr={}}var stars=clampN(Math.round(+sr.stars)||1,1,3);
  var z=pzProgW(st.id),prior=z.best&&z.best[st.level]||null,rec={moves:moves,secs:r.secs,stars:stars},isBest=false;z.best=z.best||{};
  z.lvl=Math.max(z.lvl||1,Math.min(st.level+1,p.levels));(db().st.pzlast=db().st.pzlast||{})[st.id]=Date.now();
  if(better(rec,prior)){isBest=!!prior;z.best[st.level]=rec}
  var v=S();if(st.o.daily&&!v.daily[st.o.daily]){v.daily[st.o.daily]={id:st.id,level:st.level,moves:moves,stars:stars,hints:r.hints,at:Date.now()};ev('daily_solved')}
  if(st.o.first){v.firstWinMs=Date.now()-(v.agreeAt||Date.now());ev('first_round_finished')}
  save();ev('puzzle_solved');var win=markWin({id:st.id,level:st.level,daily:!!st.o.daily});
  var par=st.inst&&typeof st.inst.par==='number'?st.inst.par:(r.extra&&typeof r.extra.par==='number'?r.extra.par:null);
  var R={id:st.id,level:st.level,o:st.o,moves:moves,stars:stars,par:par,prior:prior,isBest:isBest,hints:r.hints,win:win,line:String(sr.line||'')};
  var sec=document.querySelector('.pz5'),root=sec&&sec.querySelector('.pzroot'),host=root&&(root.querySelector('.zk-stage')||root),board=host&&host.querySelector('.zk-board');
  var next=st.level<p.levels?st.level+1:null,big=bigMoment(st,win);
  if(sec){var bar=sec.querySelector('.pzbar');if(bar)bar.style.visibility='hidden';var hh=sec.querySelector('.pzh');if(hh)hh.textContent=''}
  var shown=false;function toReward(){if(shown)return;shown=true;if(typeof sr.winLine==='string'){R.par=null;R.winLine=sr.winLine}showReward(R);if(document.querySelector('.rw.w2'))return;   /* W2 (win6.js) shows R.winLine itself */
    if(typeof sr.winLine==='string')try{var bg=[].slice.call(document.querySelectorAll('[data-big]')).pop(),bl=bg&&bg.parentNode.querySelector('.bigl');if(bg){bg.style.display='none';bg.removeAttribute('data-big')}if(bl)bl.textContent=sr.winLine+(r.hints?' · with a hint':'')}catch(e){}}   /* 1.2.1: no '1 moves' on the reward page either */
  if(!host||Q.fast){setTimeout(toReward,0);return}
  var mvs=moves+(moves===1?' move':' moves'),line=par?(moves<=par?mvs+', the fewest possible':mvs+' · fewest '+par):'';if(typeof sr.winLine==='string')line=sr.winLine;   /* 1.2.1: a puzzle whose move count is not a tap count (zebra: checks) words its own line */
  if(line&&r.hints)line+=' · with a hint';   /* a hint caps the stars at 2, so say why */
  var origin=st.ctrl&&st.ctrl.lastEl?st.ctrl.lastEl():null;
  ZK.win(host,{stars:stars,board:board||host,origin:origin,line:line,
    nextLabel:big?'Continue':next?'Next level':'Done',
    onNext:function(){ev('next_tap');if(big){toReward();return}
      if(next){var op=Nav.push;Nav.push=function(pg,o2){Nav.push=op;o2=o2||{};o2.replace=true;return op.call(Nav,pg,o2)};playPuzzle(st.id,next,{});return}
      Nav.pop()},
    onMore:null});   /* owner default (4 Nov): no 'Details' link after a ladder win; big moments still open the v5 reward by themselves */
  if(big)setTimeout(function(){if(sec&&sec.isConnected)toReward()},1500)};
/* ---------- 1.2.4: one set of puzzle controls for the puzzle page and the Reel (ZR) ----------
   ZR(o) drives Undo, Restart and Hint for one mounted board through its kit session (ZK.sess):
   - one move count: Undo lowers it only when something was undone (an empty Undo is a no-op and costs nothing), Restart sets it to 0,
     the stuck chip's Undo and Restart come through here too, and a puzzle with its own count (ctrl.moves) is shown as it counts;
     the header, the Reel chip and the win card all read the same number.
   - the Hint badge shows the hints really left for this board: min(3 - hints taken, free hint + today's bank). At the limit the button
     is dimmed (aria-disabled) and a tap says why. Restart starts the hint ladder again and clears the hint count for the stars (a clean
     replay scores clean), but the free hint stays spent.
   - Hint in a lost position: the kit's stuck chip is shown ("A recent move went wrong", Undo back to the last good position, Restart),
     and no hint is spent.
   o: {s: session, fin(), text(msg), btn: hint button, badge: badge element, count(n), say(msg)} */
window.ZR=function(o){var s=o.s,c={hn:0,hints:0,undos:0,freeUsed:false};
  function bank(){try{return hintBank()}catch(e){return {left:0}}}
  function adOk(){try{return !!(window.Ads&&Ads.rewardedOk())}catch(e){return false}}
  c.left=function(){return Math.max(0,Math.min(3-c.hn,(c.freeUsed?0:1)+bank().left))};
  c.badge=function(){var b=o.badge,btn=o.btn;if(!b||!btn)return;var n=c.left(),cap=c.hn>=3,ad=!cap&&n===0&&adOk(),off=cap||(n===0&&!ad);
    b.hidden=false;b.className='badge'+(ad?' ad':'');b.textContent=ad?'AD':String(n);if(off)b.hidden=true;
    btn.classList.toggle('zk-hoff',off);btn.setAttribute('aria-disabled',off?'true':'false');
    btn.setAttribute('aria-label',off?(cap?'Hint, none left for this puzzle':'Hint, none left today'):ad?'Hint, watch an ad':'Hint, '+n+' left')};
  c.undo=function(){if(o.fin())return false;var ok=s.undo();if(ok){c.undos++;try{fx('tap')}catch(e){}}return ok};
  c.restart=function(){if(o.fin())return;s.restart();c.hn=0;c.hints=0;c.badge();o.text('');try{fx('tap')}catch(e){}};
  c.hint=async function(){if(o.fin())return;
    if(s.lost()){s.reveal('hint');return}   /* no hint is spent: it says a recent move went wrong and offers the way back */
    if(c.hn>=3){o.text('That was the last hint for this puzzle. Undo and Restart are always free.');return}
    var bk=bank();
    if(!c.freeUsed){c.freeUsed=true;try{ev('hint_free')}catch(e){}}
    else if(bk.left>0){bk.left--;try{save()}catch(e){}}
    else if(adOk()){var want=await offerAd('Out of free hints today','Watch a short ad for one more hint? Undo and Restart stay free.');if(!want||o.fin())return;var ok=await Ads.rewarded('A hint');if(!ok||o.fin())return}
    else{o.text('No more hints today. Undo and Restart are always free.');c.badge();return}
    c.hn++;c.hints++;var tx=null;try{tx=s.ctrl&&s.ctrl.hint&&s.ctrl.hint(c.hn)}catch(e){}
    o.text('');setTimeout(function(){o.text(tx||'No hint for this spot. Try Undo.')},30);c.badge();s.sync();setTimeout(s.sync,600)};
  s.ui={moved:function(){if(c.hn)o.text('')},count:o.count,undo:c.undo,restart:c.restart,hints:function(){return c.hints},say:o.say};
  c.badge();s.sync();return c};
/* the puzzle page: the stuck chip's own row under the board (it holds the hint line too, so the board never jumps), and the toolbar
   wired to ZR (v5's handlers are replaced; v5's runner itself is not modified) */
var pp6=playPuzzle;
playPuzzle=function(id,level,o){var st=pp6.apply(this,arguments);try{var p=P(id);if(st&&st.id===id&&p&&p.v6)wire(st)}catch(e){console.error(e)}return st};
function wire(st){var secs=document.querySelectorAll('.pz5'),sec=secs[secs.length-1];if(!sec)return;var root=sec.querySelector('.pzroot'),s=root&&window.ZK&&ZK.sess(root);if(!s)return;
  var hEl=sec.querySelector('.pzh'),mvEl=sec.querySelector('[data-mv]');
  if(hEl&&!hEl.parentNode.classList.contains('zk-status')){var row=document.createElement('div');row.className='zk-status';hEl.parentNode.insertBefore(row,hEl);row.appendChild(hEl);
    var slot=document.createElement('div');slot.className='zk-slot';row.appendChild(slot)}
  var c=ZR({s:s,fin:function(){return st.fin||RUN!==st},text:function(t){if(hEl)hEl.textContent=t},btn:sec.querySelector('[data-hint]'),badge:sec.querySelector('[data-hb]'),
    count:function(n){if(st.mv!==n){st.mv=n;if(mvEl)mvEl.textContent=n}st.undos=c?c.undos:0;st.hints=c?c.hints:0},say:function(x){var e=sec.querySelector('[data-live]');if(e){e.textContent='';setTimeout(function(){e.textContent=x},30)}}});
  st.zr=c;
  var u=sec.querySelector('[data-undo]'),r=sec.querySelector('[data-restart]'),h=sec.querySelector('[data-hint]');
  if(u)u.onclick=function(){c.undo()};if(r)r.onclick=function(){c.restart()};if(h)h.onclick=function(){c.hint()}}
})();
