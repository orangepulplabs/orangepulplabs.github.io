/* Zest 1.2.0 friend page layer (orangepulplabs.com/zest/play/). Built by site-gen.py: ["switch-off", "jump-away", "tube-sort", "tilt-run", "slide-tiles", "make-target", "balance-weights", "zero-one", "dodecahedron-tour", "river-ferry", "seven-pieces", "code-cracker", "word-steps", "tiger-and-herd", "blockade", "seed-pits"] and "https://orangepulplabs.com/beta/" are filled in at build time.
   Loaded after app4d, challenge, delight, the v6 kit, the one v6 puzzle override (plus trim6.js), and before app4b boots.
   - Only the 16 puzzles of Zest 1.2.0 can be played. A link to any other puzzle shows "That puzzle has moved on" with one of the 16.
   - The board is the v6 redesign (ZK.override has replaced the original entry), with the same seed as the sender: pzSeed(id, level, tag).
   - The win plays on the board (ZK.win), then the "Keep going" ending: your result against theirs, one line, the Google Play button.
   Nothing here writes cookies or storage. */
(function(){
var VIS=["switch-off", "jump-away", "tube-sort", "tilt-run", "slide-tiles", "make-target", "balance-weights", "zero-one", "dodecahedron-tour", "river-ferry", "seven-pieces", "code-cracker", "word-steps", "tiger-and-herd", "blockade", "seed-pits"],STORE="https://orangepulplabs.com/beta/",TEASER='A new true story every day.';
function vis(id){return VIS.indexOf(id)>=0}
/* the curation: hidden puzzles are not playable (their file may be loaded because it also holds a visible one) */
var get0=pzGet;pzGet=function(id){return vis(id)?get0(id):null};
var keep=PUZZLE_ORDER.filter(vis);PUZZLE_ORDER.length=0;Array.prototype.push.apply(PUZZLE_ORDER,keep);
/* a daily card from the app: the token carries the puzzle, level and day, so any visible puzzle is accepted (the board is fully defined by the token) */
var zctx0=zctx;zctx=function(){var c=zctx0();c.dailyOk=function(day,id){return vis(id)};return c};
/* the fresh puzzle offered after a broken or moved-on link: one of the loaded visible puzzles, early level, today's seed */
pzFresh=function(){var day=todayStr(),id=PUZZLE_ORDER[0],p=PUZZLES[id];return {id:id,level:1+Math.floor(seeded('pzlv|'+day)()*Math.min(5,p.levels)),tag:day}};
/* another of the 16 opens as its own link, so the page loads only that puzzle's files (and the guest stays a guest) */
function anotherHref(not){var pool=VIS.filter(function(x){return x!==not}),id=pool[Math.floor(Math.random()*pool.length)],t=null;
  try{t=ZC.encodeChallenge({id:id,level:1+Math.floor(Math.random()*3),seed:ZC.newSeed()})}catch(e){}return t?'./?c='+t:'./'}
var CSS='.k6{display:flex;flex-direction:column;align-items:center;text-align:center;gap:0;padding:28px 20px 8px}'+
  '.k6 h1{font:700 30px/1.15 var(--disp,Georgia,serif);margin:6px 0 0;letter-spacing:-.01em}'+
  '.k6 .pz{font:700 12px var(--font);letter-spacing:.09em;text-transform:uppercase;color:var(--link);margin:0}'+
  '.k6 .vs{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:320px;margin:20px 0 0}'+
  '.k6 .vs div{background:var(--card,var(--bg));border-radius:18px;padding:14px 8px;box-shadow:0 0 0 1px var(--line)}'+
  '.k6 .vs b{display:block;font:700 34px/1 var(--disp,Georgia,serif)}.k6 .vs small{display:block;margin-top:6px;font:600 13px var(--font);color:var(--muted)}'+
  '.k6 .vs .me{box-shadow:0 0 0 2px var(--accent)}'+
  '.k6 .tz{margin:22px 0 0;font:600 17px/1.4 var(--font);color:var(--ink)}'+
  '.k6 .gp{display:flex;align-items:center;justify-content:center;width:100%;max-width:340px;min-height:58px;margin:18px 0 0;border-radius:18px;background:var(--accent);color:var(--on-accent,#1B1916);font:700 18px var(--font);text-decoration:none}'+
  '.k6 .soon{margin:12px 0 0;font:600 14px var(--font);color:var(--muted)}'+
  '.k6 .row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:22px 0 0}.k6 .row a,.k6 .row button{min-height:48px;padding:0 22px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;color:var(--ink)}'+
  '.k6 .tg{margin:18px 0 0;font-size:12.5px;color:var(--muted)}.k6 .tg a{color:inherit}';
try{var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st)}catch(e){}
var TERMS='<p class="zgt">By playing you agree to the <a href="https://orangepulplabs.com/zest/terms/" target="_blank" rel="noopener">Terms</a> and <a href="https://orangepulplabs.com/zest/privacy/" target="_blank" rel="noopener">Privacy policy</a>.</p>';
/* a link that is broken, unknown or to a puzzle that is not in Zest 1.2.0 */
friendBroken=function(){var g=guestOn(),fr=pzFresh(),p=PUZZLES[fr.id],back=g?guestHome:home;
  show('<div class="core"><h1 class="s">That puzzle has moved on.</h1><p class="tag">Here is one of the puzzles in Zest today.</p>'+(g?TERMS:'')+'</div><div class="dock stk"><button class="zbtn pri wide" id="fb">Play '+esc(p.name)+'</button></div>',true,{back:back});
  $('fb').onclick=function(){playPuzzle(fr.id,fr.level,{tag:fr.tag,friend:{t:null},exit:back,from:back,guest:g})}};
/* the ending: the win on the board first, then Keep going */
var res0=pzResult;
pzResult=function(id,level,o,seed,inst,r,q){if(!(guestOn()||o.friend))return res0.apply(this,arguments);
  var args=arguments,root=$('pzroot'),host=root&&(root.querySelector('.zk-stage')||root),done=false,me=this;
  function go(){if(done)return;done=true;keepGoing(id,level,o,inst,r,q)}
  if(!host||!window.ZK||!PUZZLES[id].v6){go();return}
  ['pzbar','pzh','pzcap','pznote'].forEach(function(k){var e=$(k)||document.querySelector('.'+k);if(e)e.style.visibility='hidden'});
  var ctrl=PZR&&PZR.ctrl,origin=null;try{origin=ctrl&&ctrl.lastEl?ctrl.lastEl():null}catch(e){}
  try{ZK.win(host,{stars:Math.max(1,q.stars),board:host.querySelector('.zk-board')||host,origin:origin,nextLabel:'See result',onNext:go})}catch(e){go();return}
  var t=run.id;setTimeout(function(){if(t===run.id)go()},1700)};
function keepGoing(id,level,o,inst,r,q){newRun();var p=PUZZLES[id],fo=o.friend||{},ft=fo.t!=null?fo.t:null,me=r.moves,who=frWho(fo,1),
  head=ft===null?'Solved!':me<ft?'You beat it!':me===ft?'A perfect tie.':me===ft+1?'So close!':'Nicely done.',
  vs=ft===null?'<div class="vs" style="grid-template-columns:1fr;max-width:160px"><div class="me"><b class="num">'+me+'</b><small>'+(me===1?'move':'moves')+'</small></div></div>':
    '<div class="vs"><div class="me"><b class="num">'+me+'</b><small>You</small></div><div><b class="num">'+ft+'</b><small>'+esc(who)+'</small></div></div>';
  show('<div class="k6"><p class="pz">'+esc(p.name)+' · Level '+level+'</p><h1>'+head+'</h1><div style="margin-top:10px">'+starsRow(q.stars)+'</div>'+vs+
    '<p class="tz">'+TEASER+'</p><a class="gp" id="k6gp" href="'+STORE+'" rel="noopener">Get Zest on Google Play</a><p class="soon">Coming soon to the App Store</p>'+
    '<div class="row"><a class="zbtn ghost" id="k6pa" href="'+anotherHref(id)+'">Play another</a>'+(ft!==null&&me>ft?'<button class="zbtn ghost" id="k6ag">Try again</button>':'')+'</div></div>',true,{back:guestOn()?guestHome:home});
  if($('k6ag'))$('k6ag').onclick=function(){zc('again_tap');playPuzzle(id,level,Object.assign({},o,{instant:1}))};
  $('k6gp').onclick=function(){zc('store_tap')}}
})();
