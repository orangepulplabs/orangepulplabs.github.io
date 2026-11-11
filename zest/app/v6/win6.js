/* home-final, design W2 (12 Nov 2026, Docs/home-redo, "Win" artboard, middle column): the solved screen looks like the home page's
   before-playing state. Loaded after runner6.js; replaces v5's showReward and choreo (v5 files are not modified).
   - top row: Close (x), Play again (icon; not on the first win)
   - middle: the puzzle's own art on the home page's plate and rings, with a round tilted stamp: the stars, the move count, MOVES
   - bottom: an optional bold friend result ("You beat it! 9 vs 12"), the kicker "SOLVED · DAY n" plus at most one milestone
     (weekly goal met > +1 rest day > new best > stamp n of 20 > tier up), the name, the story's first line in full,
     "Read the story", then Share (amber) and Continue (outlined; its label is Continue / Level n / Done)
   Removed from this screen: the big number and the fewest bar (the stamp; "fewest n" stays in the screen reader text), the flip card
   and tier label, "Story n of 39", the chips, the Tomorrow card, "Play the Reel". After a daily, Continue goes to Today, which has
   the Reel link. Light: terracotta #A9380B. Dark: #1F1410 with terracotta accents (same as the home page's dark before state). */
(function(){
var XI='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  AGAIN='<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v5h5"/></svg>',
  SHARE='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/></svg>';
var CSS=
  '.rw.w2{--wb:#A9380B;--wi:#FFF8F1;--wk:#FAD4B8;--wring:#B9471A;--wplate:#F7E3D1;--wsb:#FFF8F1;--wsi:#8A2E08;--wpb:#FFF8F1;--wpi:#8A2E08;--wshb:#F2B65A;--wshi:#3A1404;--wline:rgba(255,248,241,.5);'+
    'background:var(--wb);color:var(--wi);display:flex;flex-direction:column;align-items:stretch;text-align:left;min-height:100%;padding:0}'+
  ':root[data-theme="dark"] .rw.w2{--wb:#1F1410;--wi:#F4EEE3;--wk:#F2A27A;--wring:#5A2410;--wplate:#CDB59C;--wsb:#F4EEE3;--wsi:#8A2E08;--wpb:#C2410C;--wpi:#FFFFFF;--wline:rgba(244,238,227,.35)}'+
  '.rw.w2 .wtop{display:flex;justify-content:space-between;padding:calc(14px + env(safe-area-inset-top,0px)) 10px 0}'+
  '.rw.w2 .wtop button{width:44px;height:44px;border:0;background:none;color:var(--wi);display:flex;align-items:center;justify-content:center;border-radius:12px;cursor:pointer}'+
  '.rw.w2 .wtop .rwx{position:static}'+
  '.rw.w2 .wmid{flex:1;display:flex;align-items:center;justify-content:center;min-height:200px;padding:8px 0}'+
  '.rw.w2 .wart{position:relative;width:min(240px,30vh);aspect-ratio:1}'+
  '.rw.w2 .wart::before{content:"";position:absolute;inset:1.5%;border-radius:50%;border:1.2px dashed var(--wk)}'+
  '.rw.w2 .wrg{position:absolute;inset:5%;border-radius:50%;background:var(--wring)}'+
  '.rw.w2 .wplate{position:absolute;inset:10%;border-radius:50%;background:var(--wplate);display:flex;align-items:center;justify-content:center}'+
  '.rw.w2 .wplate svg{width:78%;height:78%}'+
  ':root[data-theme="dark"] .rw.w2 .wplate svg{filter:brightness(.9) saturate(.9)}'+
  '.rw.w2 .wstamp{position:absolute;right:-18px;bottom:-10px;width:90px;height:90px;border-radius:50%;background:var(--wsb);color:var(--wsi);transform:rotate(-12deg);display:flex;flex-direction:column;align-items:center;justify-content:center;'+
    'box-shadow:0 0 0 4px var(--wb),0 0 0 5.5px var(--wsb)}'+
  '.rw.w2 .wstars{font-size:15px;letter-spacing:1px;line-height:1.1;color:#C9962B}.rw.w2 .wstars i{font-style:normal;color:#D9CFC2}'+
  '.rw.w2 .wnum{font:700 24px/1 var(--disp);font-variant-numeric:tabular-nums}'+
  '.rw.w2 .wlab{font:700 10px/1.2 var(--font);letter-spacing:.08em;text-transform:uppercase}'+
  '.rw.w2 .wbot{padding:0 26px calc(24px + env(safe-area-inset-bottom,0px))}'+
  '.rw.w2 .wfr{font:700 17px/1.35 var(--font);margin:0 0 8px;color:var(--wi)}'+
  '.rw.w2 .wkick{font:700 12px/1.3 var(--font);letter-spacing:.1em;text-transform:uppercase;color:var(--wk)}'+
  '.rw.w2 h1.wname{font:700 42px/.95 var(--disp);letter-spacing:-.01em;margin:4px 0 0;color:var(--wi);overflow-wrap:anywhere}'+
  '.rw.w2 .wline{font:600 18px/1.42 var(--disp);margin:12px 0 0;color:var(--wi)}'+
  '.rw.w2 .wread{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:56px;margin-top:18px;padding:8px 16px;border:0;border-radius:18px;background:var(--wpb);color:var(--wpi);font:700 17px/1.2 var(--font);cursor:pointer;text-align:center}'+
  '.rw.w2 .wrow{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}.rw.w2 .wrow.one{grid-template-columns:1fr}'+
  '.rw.w2 .wrow button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:6px 10px;border-radius:16px;font:700 16px/1.2 var(--font);cursor:pointer;min-width:0}'+
  '.rw.w2 .wshare{border:0;background:var(--wshb);color:var(--wshi)}'+
  '.rw.w2 .wnext{border:1.5px solid var(--wline);background:none;color:var(--wi)}'+
  '.rw.w2 button:focus-visible{outline:3px solid var(--wi);outline-offset:2px}'+
  '.rw.w2 .wread:active,.rw.w2 .wrow button:active{transform:scale(.98)}'+
  '@media (max-height:740px){.rw.w2 h1.wname{font-size:36px}.rw.w2 .wline{font-size:16px;margin-top:8px}.rw.w2 .wread{margin-top:14px;min-height:52px}.rw.w2 .wmid{min-height:170px}}'+
  '@media (max-width:359px){.rw.w2 .wbot{padding-left:20px;padding-right:20px}.rw.w2 h1.wname{font-size:36px}}';
function css(){if(document.getElementById('win6css'))return;var s=document.createElement('style');s.id='win6css';s.textContent=CSS;document.head.appendChild(s)}

/* at most one milestone, in the owner's order */
function milestone(R){var w=R.win||{};
  if(FLAGS.weekGoal&&w.weekMetNow)return 'Weekly goal met';
  if(FLAGS.chain&&w.chain&&w.chain.earned)return '+1 rest day';
  if(R.isBest)return 'New best';
  if(w.season)return 'Stamp '+w.season+' of '+SEASON_N;
  if(w.tier)return TIER_NAME[w.tier]+' tier';
  return ''}
function friendLine(o,R){if(!(o.friend&&o.friend.t))return '';var t=o.friend.t;
  return R.moves<t?'You beat it! '+R.moves+' vs '+t:R.moves===t?'Tied at '+R.moves+' moves':'They win this one: '+t+' vs '+R.moves}

showReward=function(R){css();var p=P(R.id),v=S(),w=R.win||{},o=R.o||{},isDaily=!!o.daily,next=R.level<p.levels?R.level+1:null;
  if(o.friend){ev('friend_finish');if(o.friend.t&&R.moves<o.friend.t)ev('friend_beat')}
  var cv=chainView(v.chain,T()),day=FLAGS.chain&&cv.alive&&cv.n?'Day '+cv.n:'',ms=milestone(R);
  var kick=['Solved',day,ms].filter(Boolean).join(' · ');
  var wl=typeof R.winLine==='string'&&R.winLine?R.winLine:'';
  var sr=R.stars+' of 3 stars, '+(wl||plur(R.moves,'move')+(R.par?(R.moves<=R.par?', the fewest possible':', fewest '+R.par):''))+(R.hints?', '+plur(R.hints,'hint'):'');
  var stars='★★★'.slice(0,R.stars)+'<i>'+'★★★'.slice(0,3-R.stars)+'</i>';
  var stamp='<div class="wstamp" data-stamp role="img" aria-label="'+esc(sr)+'"><span class="wstars" aria-hidden="true">'+stars+'</span>'+
    (wl?'<span class="wlab" aria-hidden="true">Solved</span>':'<span class="wnum" aria-hidden="true">'+R.moves+'</span><span class="wlab" aria-hidden="true">'+(R.moves===1?'Move':'Moves')+'</span>')+'</div>';
  var primary=o.first||o.guest||isDaily?'Continue':next?'Level '+next:'Done';
  var share=FLAGS.share&&!o.first&&!o.guest,fr=friendLine(o,R);
  var sec=h5('<section class="rw w2" aria-label="Solved"><div class="wtop"><button class="rwx" data-x aria-label="Close">'+XI+'</button>'+
      (!o.first?'<button data-again aria-label="Play again">'+AGAIN+'</button>':'<span></span>')+'</div>'+
    '<div class="wmid"><div class="wart"><div class="wrg"></div><div class="wplate" aria-hidden="true">'+art(R.id,'hero')+'</div>'+stamp+'</div></div>'+
    '<div class="wbot">'+(fr?'<p class="wfr">'+esc(fr)+'</p>':'')+'<div class="wkick">'+esc(kick)+'</div><h1 class="wname">'+esc(p.name)+'</h1>'+
      '<p class="wline">'+esc(storyHook(R.id)||'Its story is now in your Almanac.')+'</p>'+
      '<button class="wread" data-story>Read the story</button>'+
      '<div class="wrow'+(share?'':' one')+'">'+(share?'<button class="wshare" data-share>'+SHARE+'Share</button>':'')+'<button class="wnext" data-next>'+esc(primary)+'</button></div></div></section>');
  if(!rmOn()&&!Q.fast){var st=qs(sec,'[data-stamp]');if(st)st.style.opacity='0'}
  var page={name:'reward',el:sec,notabs:true,onBack:function(){close();return true}};
  function close(){if(o.first||o.guest){onboardAfterWin();return}Nav.pop()}
  qs(sec,'[data-x]').onclick=close;
  qs(sec,'[data-story]').onclick=function(){storySheet(R.id)};
  if(qs(sec,'[data-again]'))qs(sec,'[data-again]').onclick=function(){Nav.pop().then(function(){playPuzzle(R.id,R.level,{daily:o.daily})})};
  if(qs(sec,'[data-share]'))qs(sec,'[data-share]').onclick=function(){shareResult(R)};
  qs(sec,'[data-next]').onclick=function(){ev('next_tap');if(o.first||o.guest){onboardAfterWin();return}
    if(isDaily){Nav.popAll().then(function(){return Nav.tab('today')});return}
    if(next){Nav.pop().then(function(){playPuzzle(R.id,next,{})});return}Nav.pop()};
  Nav.push(page,{replace:true}).then(function(){choreo(sec,R);try{window.__homeSysbar&&__homeSysbar()}catch(e){}})};

choreo=async function(sec,R){var w=R.win||{},still=rmOn()||Q.fast,st=qs(sec,'[data-stamp]');
  if(st){st.style.opacity='';if(!still)Nav.anim(st,[{opacity:0,transform:'rotate(-40deg) scale(1.6)'},{opacity:1,transform:'rotate(-8deg) scale(.94)',offset:.75},{opacity:1,transform:'rotate(-12deg) scale(1)'}],460,'cubic-bezier(.3,1.3,.5,1)',220)}
  if(!still)await nap(260);for(var i=0;i<R.stars;i++){fx(i===2?'best':'ok',null);if(!still)await nap(90)}
  if(w.gift)setTimeout(function(){toast('New season gift: '+w.gift.t)},1400);
  var v=S();if(R.o.daily&&FLAGS.reminders&&!v.remind.asked&&Object.keys(v.daily).length>=2)setTimeout(askReminder,1600);
  say(R.stars+' of 3 stars, '+(R.winLine||plur(R.moves,'move'))+(w.card?'. Its story is now in your Almanac':''))};
})();
