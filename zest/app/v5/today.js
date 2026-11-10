/* v5 Today: the front door. One story card (or its solved state + tomorrow's teaser), the quick reel, the week, keep going, the season.
   Built once; refresh() re-renders only the blocks whose data changed (each block keeps a signature), never the whole screen. */
var TODAY={sig:{}};
function tBlock(root,name,sig,html,wire){var b=qs(root,'[data-blk="'+name+'"]');if(TODAY.sig[name]===sig)return false;TODAY.sig[name]=sig;b.innerHTML=html;if(wire)wire(b);return true}
Nav.reg('today',{label:'Today',
  build:function(root){root.innerHTML='<div class="pad"><div data-blk="head"></div><div data-blk="recap"></div><div data-blk="hero"></div><div data-blk="reel" class="sect"></div><div data-blk="week" class="sect"></div><div data-blk="keep" class="sect"></div><div data-blk="season" class="sect"></div><div data-blk="ad" class="sect"></div></div>';TODAY.sig={};todayRender(root,true)},
  refresh:function(root){todayRender(root,false)},
  show:function(root){var s=qs(root,'.reelc .fan');if(s)s.classList.toggle('go',!rmOn())}});
function todayRender(root,first){var v=S(),day=T(),d=todayDaily(),done=v.daily[day],cv=chainView(v.chain,day),away=awayDays();
  // head: date, chain, settings
  var chainHtml=FLAGS.chain&&(v.chain.last||cv.n)?'<button class="chainb'+(cv.alive?'':' off')+'" data-chain aria-label="'+(cv.alive?cv.n+' day chain':'Chain')+'">'+chainIcon(cv.alive&&cv.n>0)+'<span class="num">'+(cv.alive?cv.n:0)+'</span></button>':'';
  tBlock(root,'head',[day,cv.n,cv.alive,FLAGS.chain].join('|'),'<div class="thead"><div class="td"><small>'+esc(dayLabel(day,{weekday:'long'}))+'</small><b>'+esc(dayLabel(day,{day:'numeric',month:'long'}))+'</b></div>'+chainHtml+'<button class="ibtn" data-set aria-label="Settings">'+icon('gear')+'</button></div>',
    function(b){qs(b,'[data-set]').onclick=function(){openSettings()};var c=qs(b,'[data-chain]');if(c)c.onclick=function(){chainSheet()}});
  // Monday recap: last week at a glance, once, Monday to Wednesday, only when last week had play
  var ws=weekStart(day),pws=addDays(ws,-7),pw=weekView(v.played,v.chain.restUsed,addDays(ws,-1),v.weekGoal),dow=daysBetween(ws,day),newCards=Object.keys(v.cards).filter(function(id){var c=v.cards[id];return c.day&&c.day>=pws&&c.day<ws}).length;
  if(dow<=2&&pw.n>0&&v.recapSeen!==ws){tBlock(root,'recap','r'+ws+pw.n,'<div class="card" style="margin-top:14px;position:relative"><div style="display:flex;align-items:center;justify-content:space-between;padding-right:44px"><span class="kick">Last week</span>'+(pw.met?'<span class="chip acc">'+icon('check')+'Goal met</span>':'')+'</div>'+
      '<div class="wdots" style="margin-top:12px">'+pw.days.map(function(x){return '<span class="wd '+(x.st==='today'?'off':x.st)+'"><i>'+icon('check')+'</i>'+x.lab+'</span>'}).join('')+'</div>'+
      '<p style="margin-top:12px;font-weight:700">'+plur(pw.n,'day')+(newCards?' · '+plur(newCards,'new story','new stories'):'')+(v.reel.best?' · reel best '+v.reel.best:'')+'</p><button class="ibtn" data-ok aria-label="Dismiss" style="position:absolute;right:8px;top:8px">'+icon('x')+'</button></div>',
      function(b){qs(b,'[data-ok]').onclick=function(){v.recapSeen=ws;save();Nav.anim(b.firstChild,[{opacity:1,transform:'none'},{opacity:0,transform:'scale(.96)'}],200).then(function(){b.innerHTML='';TODAY.sig.recap='x'})}})}
  else tBlock(root,'recap','none','');
  // hero: today's story
  var p=P(d.id),heroSig=[day,d.id,d.level,done?done.stars+'/'+done.moves:'',away>=3,FLAGS.teaser,FLAGS.companion].join('|');
  if(!done){tBlock(root,'hero',heroSig,'<article class="hero5" aria-label="Today\'s story">'+(away>=3?'':'')+
      '<div class="art hero" data-art>'+art(d.id,'hero')+'</div><div class="hb">'+
      (away>=3?'<p class="wb">Welcome back</p>':'')+'<p class="kick">Today\'s story · '+esc(kick(d.id))+' · '+esc(mins(d.id))+'</p><h2 style="margin-top:6px">'+esc(p.name)+'</h2><p class="hook">'+esc(storyHook(d.id))+'</p>'+
      '<button class="btn pri big wide" data-play>'+icon('play').replace('<svg','<svg style="fill:currentColor;stroke:none"')+'Play</button></div></article>',
      function(b){qs(b,'[data-play]').onclick=function(){startDaily(qs(b,'[data-art]'))};if(away>=3)ev('welcome_back')})}
  else{var nd=dailyFor(addDays(day,1),totalSolvedPuzzles());
    tBlock(root,'hero',heroSig,'<article class="hero5 done" aria-label="Today\'s story, solved"><div class="art hero">'+art(d.id,'hero')+'</div>'+kickChip(d.id)+'<span class="chip dtag acc">'+icon('check')+'Solved</span><div class="hb">'+
      (FLAGS.companion?'<div class="zcomp" data-zc="auto" style="position:absolute;right:16px;margin-top:-6px;width:56px;height:56px"></div>':'')+'<p class="kick">Today\'s story · #'+d.no+'</p><h2 style="margin-top:6px">'+esc(p.name)+'</h2>'+
      '<div class="donerow"><span class="stars" role="img" aria-label="'+done.stars+' of 3 stars">'+[1,2,3].map(function(i){return STAR_SVG.replace('<svg','<svg width="22" height="22"').replace('class="st5"','class="st5'+(done.stars>=i?' on':'')+'"')}).join('')+'</span><span class="sm num">'+plur(done.moves,'move')+'</span></div>'+
      '<div style="display:flex;gap:10px;margin-top:14px"><button class="btn sec" style="flex:1" data-story>'+icon('book')+'Story</button>'+(FLAGS.share?'<button class="btn sec" style="flex:1" data-share>'+icon('share')+'Share</button>':'')+'</div>'+
      (FLAGS.teaser?'<div class="tmr"><span class="sil">'+art(nd.id,'tile')+'</span><span><b>Tomorrow: '+esc(kick(nd.id))+'</b><small>A new story at midnight</small></span></div>':'')+'</div></article>',
      function(b){qs(b,'[data-story]').onclick=function(){storySheet(d.id)};var sh=qs(b,'[data-share]');if(sh)sh.onclick=function(){shareResult({id:d.id,level:done.level,o:{daily:day},moves:done.moves,stars:done.stars,hints:done.hints|0})};
        var s=qs(b,'.tmr .sil');if(s)setTimeout(function(){s.classList.add('shim')},400);if(window.ZD&&FLAGS.companion)ZD.mount(b)})}
  // the quick reel
  tBlock(root,'reel',[v.reel.best,v.reel.runs].join('|'),'<button class="reelc" data-reel><span class="fan" aria-hidden="true"><i></i><i></i><i></i></span><span class="rt"><b>Quick reel</b><small>'+(v.reel.runs?'Best '+v.reel.best+' · 10 cards':'10 quick cards · about 1 min')+'</small></span><span class="go" aria-hidden="true">'+icon('play')+'</span></button>',
    function(b){qs(b,'[data-reel]').onclick=function(){Nav.tab('play')};var f=qs(b,'.fan');if(f&&!rmOn())f.classList.add('go')});
  // the week
  if(FLAGS.weekGoal){var wk=weekView(v.played,v.chain.restUsed,day,v.weekGoal),C=2*Math.PI*25,fr=Math.min(1,wk.n/wk.goal);
    tBlock(root,'week',JSON.stringify(wk.days.map(function(x){return x.st}))+wk.goal,'<div class="sh"><h2>This week</h2><button class="lnk" data-goal>Goal: '+wk.goal+' days</button></div><div class="card week">'+
      '<div class="wring" role="img" aria-label="'+wk.n+' of '+wk.goal+' days"><svg viewBox="0 0 56 56"><circle class="bg" cx="28" cy="28" r="25"/><circle class="fg" cx="28" cy="28" r="25" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-fr)).toFixed(1)+'"/></svg><b>'+wk.n+'/'+wk.goal+'</b></div>'+
      '<div class="wdots">'+wk.days.map(function(x){return '<span class="wd '+x.st+(x.today?' today':'')+'"><i>'+icon('check')+'</i>'+x.lab+'</span>'}).join('')+'</div></div>',
      function(b){qs(b,'[data-goal]').onclick=function(){goalSheet()}})}
  else tBlock(root,'week','off','');
  // keep going
  var kg=keepGoing(6);tBlock(root,'keep',JSON.stringify(kg),'<div class="sh"><h2>Keep going</h2><button class="lnk" data-all>Almanac</button></div><div class="keep">'+kg.map(function(x){var t=tierOf(maxSolved(x.id));
      return '<button class="tile" data-id="'+x.id+'" data-lv="'+x.lv+'"><span class="art">'+art(x.id,'tile')+'</span><b>'+esc(P(x.id).name)+'</b><small>'+(x.lock?icon('clock').replace('<svg','<svg width="12" height="12" style="stroke:currentColor;fill:none;stroke-width:2.4"')+esc(mins(x.id))+' · new':'Level '+x.lv+(t?' · '+TIER_NAME[t]:''))+'</small></button>'}).join('')+'</div>',
    function(b){qs(b,'[data-all]').onclick=function(){Nav.tab('almanac')};qsa(b,'[data-id]').forEach(function(t){t.onclick=function(){openCard(t.dataset.id,qs(t,'.art'))}})});
  // season
  if(FLAGS.season){var ss=seasonState(),famIds=famCards(ss.fam.id).slice(0,4);
    tBlock(root,'season',[ss.key,ss.n,ss.got.join()].join('|'),'<button class="season" data-season><span class="emb" aria-hidden="true">'+famIds.map(function(id){return '<span>'+art(id,'tile')+'</span>'}).join('')+'</span><span class="rt"><b>'+esc(ss.month)+': '+esc(ss.fam.name)+'</b><small>'+ss.n+' of '+SEASON_N+' stamps · free</small>'+
      '<span class="stamps" aria-hidden="true">'+new Array(SEASON_N).fill(0).map(function(_,i){return '<i class="'+(i<ss.n?'on':'')+(SEASON_GIFTS[i+1]?' gift':'')+'"></i>'}).join('')+'</span></span></button>',
      function(b){qs(b,'[data-season]').onclick=function(){openChapter(ss.fam.id,true)}})}
  else tBlock(root,'season','off','');
  tBlock(root,'ad',String(Ads.nativeOk('today'))+day,'');}   // Today stays ad-free by design: the native slot lives in the Almanac and the story sheet
function startDaily(fromEl){var d=todayDaily();playPuzzle(d.id,d.level,{daily:d.day,fromEl:fromEl})}
function chainSheet(){var v=S(),cv=chainView(v.chain,T());
  var b=h5('<div><div style="display:flex;align-items:center;gap:16px"><span style="width:64px;height:64px;display:block">'+chainIcon(cv.alive&&cv.n>0).replace('<svg','<svg width="64" height="64"')+'</span><div><div class="h1 num">'+(cv.alive?cv.n:0)+'</div><p class="sm">day chain · longest '+(v.chain.best|0)+'</p></div></div>'+
    '<div class="card" style="margin-top:18px;display:flex;align-items:center;gap:12px"><span class="wd rest"><i></i></span><span><b>'+plur(cv.rest|0,'rest day')+' saved</b><br><span class="sm">A missed day uses one by itself. Every 7 days in a row adds one (up to 2).</span></span></div></div>');
  Nav.sheet({title:'Your chain',body:b})}
function goalSheet(){var v=S(),b=h5('<div><p class="sm">How many days a week feels right? Rest days are part of the plan.</p><div class="seg" role="group" aria-label="Week goal" style="margin-top:14px">'+[3,4,5,7].map(function(n){return '<button aria-pressed="'+(v.weekGoal===n)+'" data-n="'+n+'">'+n+'</button>'}).join('')+'</div></div>');
  var sh=Nav.sheet({title:'Week goal',body:b});qsa(b,'[data-n]').forEach(function(x){x.onclick=function(){v.weekGoal=+x.dataset.n;save();qsa(b,'[data-n]').forEach(function(y){y.setAttribute('aria-pressed',y===x?'true':'false')});Nav.refresh('today');setTimeout(sh.close,200)}})}
