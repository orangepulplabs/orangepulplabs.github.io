/* v5 puzzle runner and reward. Mounts any registered puzzle through the puzzle contract (puzzles_kit.js) inside a pushed page,
   draws its own toolbar (Undo, Restart, Hint), saves progress in the v4 shape, then replaces itself with the reward page.
   o: {daily:'YYYY-MM-DD', first:true (onboarding), from:element (art to fly from)} */
var RUN=null;
function pzSeedFor(id,level,o){o=o||{};return pzSeed(id,level,o.daily||o.past||o.tag||'')}
function playPuzzle(id,level,o){o=o||{};var p=P(id);if(!p)return;level=clampN(Math.round(+level)||1,1,p.levels);
  var seed=pzSeedFor(id,level,o),inst;try{inst=p.make(level,pzRng(seed))}catch(e){toast('That puzzle could not load.');return}
  if(inst&&typeof inst==='object')inst.toolbar=false;
  var sec=h5('<section class="pz5" aria-label="'+esc(p.name)+'"><div class="pzt"><button class="ibtn" data-x aria-label="Leave">'+icon('x')+'</button>'+
    '<div class="pzl"><b>'+esc(p.name)+'</b><small>'+(o.daily?'Today · ':'')+'Level '+level+'</small></div><div class="mv num" aria-live="off"><span data-mv>0</span><small>moves</small></div></div>'+
    (o.friend&&o.friend.t?'<p class="fr chip acc" style="align-self:center">'+icon('heart')+esc(o.friend.who==='a friend'?'A friend':o.friend.who)+' got '+plur(o.friend.t,'move')+'. Beat it?</p>':'')+'<div class="pzroot"></div><p class="pzh" role="status" aria-live="polite"></p>'+
    '<div class="pzbar">'+(p.undo===false?'':'<button class="ibtn" data-undo aria-label="Undo">'+icon('undo')+'</button>')+'<button class="ibtn" data-restart aria-label="Restart">'+icon('restart')+'</button>'+
    '<button class="ibtn" data-hint aria-label="Hint">'+icon('bulb')+'<span class="badge" data-hb></span></button></div><div class="sr" data-live role="status" aria-live="polite"></div></section>');
  var st={id:id,level:level,o:o,seed:seed,inst:inst,mv:0,hints:0,undos:0,hn:0,fin:false,t0:performance.now(),ctrl:null};RUN=st;
  var mvEl=qs(sec,'[data-mv]'),hEl=qs(sec,'.pzh');
  function setMv(){mvEl.textContent=st.mv;if(!rmOn()&&mvEl.animate)mvEl.animate([{transform:'translateY(-3px)'},{transform:'none'}],{duration:140,easing:'ease-out'})}
  function hintBadge(){var b=qs(sec,'[data-hb]'),bank=hintBank(),free=(st.hn===0?1:0)+bank.left;if(st.hn>=3){b.hidden=true;return}b.hidden=false;
    if(st.hn===0){b.textContent='1';b.className='badge'}else if(bank.left>0){b.textContent=String(bank.left);b.className='badge'}else if(Ads.rewardedOk()){b.innerHTML='AD';b.className='badge ad'}else{b.hidden=true}
    qs(sec,'[data-hint]').setAttribute('aria-label',st.hn===0?'Hint, free':bank.left>0?'Hint, '+bank.left+' free today':'Hint')}
  var api={rm:rmOn(),zen:false,toolbar:false,relaxed:!!db().st.rx,now:function(){return performance.now()-st.t0},
    say:function(x){var e=qs(sec,'[data-live]');e.textContent='';setTimeout(function(){e.textContent=x},30)},
    moved:function(){if(st.fin)return;st.mv++;setMv();if(st.hn)hEl.textContent=''},
    done:function(res){if(st.fin||RUN!==st)return;st.fin=true;finishPuzzle(st,res||{})}};
  var page={name:'puzzle',el:sec,notabs:true,onPop:function(){teardown(st);if((o.first||o.guest)&&!st.fin&&!S().onb)setTimeout(welcome,50)},onBack:function(){leave();return true}};
  function leave(){if(st.fin)return;if(st.mv===0){Nav.pop();return}Nav.dialog('Leave this puzzle?','',[['Keep playing',null,'pri'],['Leave',function(){ev('round_abandoned');Nav.pop()},'sec']])}
  qs(sec,'[data-x]').onclick=leave;
  if(qs(sec,'[data-undo]'))qs(sec,'[data-undo]').onclick=function(){if(st.fin)return;try{st.ctrl.undo&&st.ctrl.undo()}catch(e){}st.undos++;if(st.mv>0){st.mv--;setMv()}fx('tap')};
  qs(sec,'[data-restart]').onclick=function(){if(st.fin)return;try{st.ctrl.restart&&st.ctrl.restart()}catch(e){}st.mv=0;setMv();st.hn=0;hintBadge();hEl.textContent='';fx('tap')};
  qs(sec,'[data-hint]').onclick=async function(){if(st.fin||st.hn>=3)return;var bank=hintBank();
    if(st.hn===0){ev('hint_free')}
    else if(bank.left>0){bank.left--;save()}
    else if(Ads.rewardedOk()){var want=await offerAd('Out of free hints today','Watch a short ad for one more hint? Undo and Restart stay free.');if(!want||st.fin)return;var ok=await Ads.rewarded('A hint for '+p.name);if(!ok||st.fin)return}
    else{hEl.textContent='No more hints today. Undo and Restart are always free.';return}
    st.hn++;st.hints++;var tx=null;try{tx=st.ctrl.hint&&st.ctrl.hint(st.hn)}catch(e){}hEl.textContent='';setTimeout(function(){hEl.textContent=tx||'No hint for this spot. Try Undo.'},30);hintBadge()};
  Nav.push(page,{from:o.fromEl,toSel:null});
  try{st.ctrl=p.mount(qs(sec,'.pzroot'),inst,api)}catch(e){console.error(e);toast('That puzzle could not load.');Nav.pop();return}
  if(/\bMoves?\b/i.test(qs(sec,'.pzroot').innerText||''))qs(sec,'.mv').hidden=true;hintBadge();ev('puzzle_started');if(o.daily)ev('daily_started');if(o.first)ev('first_round_started');if(o.friend)ev('friend_start');return st}
function teardown(st){if(!st)return;try{st.ctrl&&st.ctrl.destroy&&st.ctrl.destroy()}catch(e){}if(RUN===st)RUN=null}
function better(a,b){if(!b)return true;if(a.stars!==b.stars)return a.stars>b.stars;return a.moves<b.moves}
function finishPuzzle(st,res){var p=P(st.id),moves=typeof res.moves==='number'?res.moves:st.mv,r={solved:true,moves:moves,hints:res.hints!=null?res.hints:st.hints,undos:st.undos,extra:res.extra||{},secs:Math.round((performance.now()-st.t0)/1000)},sr;
  try{sr=p.stars(r,st.inst)||{}}catch(e){sr={}}var stars=clampN(Math.round(+sr.stars)||1,1,3);
  var z=pzProgW(st.id),prior=z.best&&z.best[st.level]||null,rec={moves:moves,secs:r.secs,stars:stars},isBest=false;z.best=z.best||{};
  z.lvl=Math.max(z.lvl||1,Math.min(st.level+1,p.levels));(db().st.pzlast=db().st.pzlast||{})[st.id]=Date.now();
  if(better(rec,prior)){isBest=!!prior;z.best[st.level]=rec}
  var v=S();if(st.o.daily&&!v.daily[st.o.daily]){v.daily[st.o.daily]={id:st.id,level:st.level,moves:moves,stars:stars,hints:r.hints,at:Date.now()};ev('daily_solved')}
  if(st.o.first){v.firstWinMs=Date.now()-(v.agreeAt||Date.now());ev('first_round_finished')}
  save();ev('puzzle_solved');var win=markWin({id:st.id,level:st.level,daily:!!st.o.daily});
  var par=st.inst&&typeof st.inst.par==='number'?st.inst.par:(r.extra&&typeof r.extra.par==='number'?r.extra.par:null);
  setTimeout(function(){showReward({id:st.id,level:st.level,o:st.o,moves:moves,stars:stars,par:par,prior:prior,isBest:isBest,hints:r.hints,win:win,line:String(sr.line||'')})},rmOn()||Q.fast?0:220)}

/* ---------- the reward page ---------- */
function showReward(R){var p=P(R.id),v=S(),w=R.win,o=R.o,isDaily=!!o.daily,newCard=!!w.card,next=R.level<p.levels?R.level+1:null;
  var total=cardCount(),stars=[1,2,3].map(function(i){return '<span data-st="'+i+'">'+STAR_SVG.replace('class="st5"','class="st5'+(R.stars>=i?' on':'')+'"')+'</span>'}).join('');
  var parHtml=R.par?'<div class="parbar" aria-hidden="true"><i style="width:0"></i><b style="left:calc('+Math.min(100,R.par/Math.max(R.moves,R.par)*100)+'% - 1px)"></b><em style="left:'+Math.min(100,R.par/Math.max(R.moves,R.par)*100)+'%">fewest '+R.par+'</em></div>':'';
  var badges=[];
  if(FLAGS.chain&&w.chain&&w.chain.kind!=='same')badges.push('<span class="chip acc" data-b="chain">'+chainIcon(true).replace('<svg','<svg width="16" height="16"')+' Day '+v.chain.n+'</span>');
  if(FLAGS.weekGoal&&w.week)badges.push('<span class="chip'+(w.weekMetNow?' acc':'')+'" data-b="week">'+icon('cal')+(w.weekMetNow?'Week goal met':w.week.n+' of '+w.week.goal+' this week')+'</span>');
  if(w.season)badges.push('<span class="chip" data-b="season">'+icon('star')+'Stamp '+w.season+' of '+SEASON_N+'</span>');
  if(w.chain&&w.chain.earned&&FLAGS.chain)badges.push('<span class="chip acc">+1 rest day</span>');if(R.isBest)badges.push('<span class="chip acc">'+icon('up')+'New best</span>');
  var fr=o.friend&&o.friend.t?(R.moves<o.friend.t?'You beat it! '+R.moves+' vs '+o.friend.t:R.moves===o.friend.t?'A tie at '+R.moves:'They win this one: '+o.friend.t+' vs '+R.moves):'';if(o.friend){ev('friend_finish');if(o.friend.t&&R.moves<o.friend.t)ev('friend_beat')}
  var cardHtml=newCard?'<div class="flip" aria-hidden="true"><div class="fi"><div class="ff">'+MARK+'</div><div class="fb">'+cardFace(R.id)+'</div></div></div><p class="addl">Added to your Almanac<small>'+total+' of '+PUZZLE_ORDER.length+' stories</small></p>':
    (w.tier?'<div class="flip on" aria-hidden="true" style="width:160px"><div class="fi" style="width:160px;height:208px"><div class="fb">'+cardFace(R.id)+'</div></div></div><p class="addl">'+TIER_NAME[w.tier]+' card</p>':'');
  var tmr='';if(isDaily&&FLAGS.teaser){var nd=dailyFor(addDays(o.daily,1),totalSolvedPuzzles());tmr='<div class="tmr" style="width:100%;text-align:left"><span class="sil">'+art(nd.id,'tile')+'</span><span><b>Tomorrow: '+esc(kick(nd.id))+'</b><small>A new story at midnight</small></span></div>'}
  var primary=o.first||o.guest?'Continue':isDaily?'Quick reel':next?'Level '+next:'Done';
  var sec=h5('<section class="rw" aria-label="Solved"><button class="ibtn rwx" data-x aria-label="Close">'+icon('x')+'</button>'+
    (FLAGS.companion&&!newCard&&!w.tier?'<div class="zcomp" data-zc="idle" style="margin-top:4px"></div>':'')+
    (fr?'<h1 class="h2" style="margin-top:28px">'+esc(fr)+'</h1>':'')+'<div class="stars" role="img" aria-label="'+R.stars+' of 3 stars">'+stars+'</div>'+
    '<div class="bignum" data-big>'+R.moves+'</div><div class="bigl">moves'+(R.prior&&!R.isBest?' · best '+R.prior.moves:'')+(R.hints?' · '+plur(R.hints,'hint'):'')+'</div>'+parHtml+
    cardHtml+'<div class="badges">'+badges.join('')+'</div>'+tmr+
    '<div class="acts"><button class="btn pri big wide" data-next>'+esc(primary)+'</button><div class="ir">'+
    '<button class="btn sec" data-story>'+icon('book')+'Story</button>'+(FLAGS.share&&!o.first&&!o.guest?'<button class="btn sec" data-share>'+icon('share')+'Share</button>':'')+
    (!o.first?'<button class="btn sec" data-again aria-label="Play again">'+icon('restart')+'</button>':'')+'</div></div></section>');
  if(!rmOn()&&!Q.fast)qsa(sec,'[data-st]').forEach(function(x){x.style.opacity='0'});var page={name:'reward',el:sec,notabs:true,onBack:function(){close();return true}};
  function close(){if(o.first||o.guest){onboardAfterWin();return}Nav.pop()}
  qs(sec,'[data-x]').onclick=close;
  qs(sec,'[data-story]').onclick=function(){storySheet(R.id)};
  if(qs(sec,'[data-again]'))qs(sec,'[data-again]').onclick=function(){Nav.pop().then(function(){playPuzzle(R.id,R.level,{daily:o.daily})})};
  if(qs(sec,'[data-share]'))qs(sec,'[data-share]').onclick=function(){shareResult(R)};
  qs(sec,'[data-next]').onclick=function(){ev('next_tap');if(o.first||o.guest){onboardAfterWin();return}
    if(isDaily){Nav.popAll().then(function(){Nav.tab('play')});return}
    if(next){Nav.pop().then(function(){playPuzzle(R.id,next,{})});return}Nav.pop()};
  Nav.push(page,{replace:true}).then(function(){choreo(sec,R)});}
async function choreo(sec,R){var w=R.win;if(window.ZD&&FLAGS.companion)ZD.mount(sec);
  var ss=qsa(sec,'[data-st]');for(var i=0;i<ss.length;i++){var on=i<R.stars;if(!rmOn()){Nav.anim(ss[i],[{transform:'scale(.4)',opacity:0},{transform:'scale(1.15)',opacity:1,offset:.7},{transform:'scale(1)',opacity:1}],280,'cubic-bezier(.3,1.4,.5,1)')}if(on)fx(i===2?'best':'ok',null);await nap(90)}
  if(window.ZD){ZD.countUp(qs(sec,'[data-big]'),R.moves,400);if(FLAGS.companion)ZD.react(R.stars===3?'cheer':'hop')}
  var pb=qs(sec,'.parbar i');if(pb)setTimeout(function(){pb.style.width='100%'},60);
  var fl=qs(sec,'.flip:not(.on)');if(fl){await nap(450);fl.classList.add('on');fx('daily',qs(sec,'.addl'))}
  qsa(sec,'.badges .chip').forEach(function(c,i){Nav.anim(c,[{opacity:0,transform:'translateY(8px) scale(.9)'},{opacity:1,transform:'none'}],260,'cubic-bezier(.3,1.4,.5,1)',600+i*90)});
  var tm=qs(sec,'.tmr .sil');if(tm)setTimeout(function(){tm.classList.add('shim')},900);
  if(w.gift)setTimeout(function(){toast('Season gift unlocked: '+w.gift.t)},1400);
  // the reminder question: once, after the 2nd daily solved, at a happy moment
  var v=S();if(R.o.daily&&FLAGS.reminders&&!v.remind.asked&&Object.keys(v.daily).length>=2)setTimeout(askReminder,1600);
  say(R.stars+' of 3 stars, '+plur(R.moves,'move')+(w.card?'. Story added to your Almanac':''))}
function askReminder(){var v=S();v.remind.asked=1;save();
  var b=h5('<div><p class="sm">One nudge a day when the new story is out. Never after you have played.</p><div class="seg" role="group" aria-label="Time" style="margin-top:14px"><button aria-pressed="false" data-t="08:00">8 am</button><button aria-pressed="true" data-t="19:00">7 pm</button><button aria-pressed="false" data-t="21:00">9 pm</button></div>'+
    '<div style="display:flex;flex-direction:column;gap:8px;margin-top:16px"><button class="btn pri wide" data-yes>'+icon('bell')+'Remind me</button><button class="btn ghost wide" data-no>Not now</button></div></div>');
  var t='19:00';qsa(b,'[data-t]').forEach(function(x){x.onclick=function(){t=x.dataset.t;qsa(b,'[data-t]').forEach(function(y){y.setAttribute('aria-pressed',y===x?'true':'false')})}});
  var sh=Nav.sheet({title:'A nudge for tomorrow?',body:b});
  qs(b,'[data-yes]').onclick=function(){v.remind={asked:1,on:1,time:t};save();ev('remind_opt_in');sh.close();toast('Done. The Android app will remind you at '+qs(b,'[aria-pressed=true]').textContent+'.')};
  qs(b,'[data-no]').onclick=function(){sh.close()}}
/* share: the daily as a short line + the challenge link (challenge.js codec); a ladder level as a friend challenge */
async function shareResult(R){ev('share_tap');var p=P(R.id),link=null,text='';
  try{if(R.o.daily){link=ZC.link({id:R.id,level:R.level,daily:R.o.daily,hints:R.hints});text='Zest #'+dailyFor(R.o.daily).no+' · '+p.name+' · '+'★★★'.slice(0,R.stars)+'☆☆☆'.slice(0,3-R.stars)+' · '+plur(R.moves,'move')+'. Same puzzle for everyone today.'}
    else{link=ZC.link({id:R.id,level:R.level,seed:0,target:R.moves,hints:R.hints});text=p.name+', level '+R.level+': '+plur(R.moves,'move')+'. Can you match it?'}}catch(e){}
  var full=text+(link?'\n'+link:'');
  try{if(navigator.share){await navigator.share({text:full});ev('share_done');return}}catch(e){if(e&&e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(full);ev('share_done');toast('Copied. Paste it anywhere.');return}catch(e){}
  Nav.sheet({title:'Share',body:'<p class="sm">Copy this:</p><p style="margin-top:8px;word-break:break-all">'+esc(full)+'</p>'})}

/* rewarded ads are always opt-in: a small sheet first, never an ad on a single tap */
function offerAd(title,text){return new Promise(function(res){var done=false,b=h5('<div><p class="sm">'+esc(text)+'</p><div style="display:flex;flex-direction:column;gap:8px;margin-top:16px"><button class="btn pri wide" data-y>'+icon('ad')+'Watch an ad</button><button class="btn ghost wide" data-n>Not now</button></div></div>');
  var sh=Nav.sheet({title:title,body:b,onClose:function(){if(!done){done=true;res(false)}}});
  qs(b,'[data-y]').onclick=function(){done=true;sh.close();res(true)};qs(b,'[data-n]').onclick=function(){done=true;sh.close();res(false)}})}
