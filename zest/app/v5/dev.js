/* v5 developer panel (?dev): flags, time travel, demo state, ad caps and the local event counts. Not shown to players. */
function seedDemo(){var v=S(),t=T(),st=db().st;st.pz=st.pz||{};
  var got=['disc-tower','word-steps','few-swaps','slide-tiles','bridge-walk','tilt-run','make-target','balance-weights','four-shades','lotus-in-the-lake','scramble','magic-three'];
  got.forEach(function(id,i){var lv=i<2?12:i<4?6:2,best={};for(var k=1;k<=lv;k++)best[k]={moves:5+k,secs:30,stars:k%3?3:2};st.pz[id]={lvl:lv+1,best:best};v.cards[id]={at:Date.now()-i*864e5,day:addDays(t,-i)};v.tiers[id]=tierOf(lv)});
  for(var i=1;i<=6;i++){var k=addDays(t,-i);v.played[k]=1;var d=dailyFor(k,99);if(i!==3)v.daily[k]={id:d.id,level:d.level,moves:9,stars:i%2?3:2,hints:0,at:Date.now()}}
  v.chain={n:6,best:9,rest:1,last:addDays(t,-1),restUsed:{}};v.reel={best:185,last:150,runs:7,pts:900,seen:1};v.first=addDays(t,-20);v.sessions=12;v.onb=1;v.age='adult';v.agreeAt=Date.now()-20*864e5;v.tos=TERMS_V;
  v.season={m:t.slice(0,7),n:7,got:[],seen:{}};v.remind={asked:1,on:1,time:'19:00'};v.lastSeenDay=addDays(t,-1);save()}
function openDev(){var v=S(),b=h5('<div class="dev"><div class="sect" style="margin-top:0"><div class="sh"><h2>Flags (owner decisions)</h2></div>'+Object.keys(FLAGS_DEFAULT).map(function(k){return '<div class="flagrow"><span>'+k+(FLAGS[k]!==FLAGS_DEFAULT[k]?' *':'')+'</span><button class="sw" role="switch" data-f="'+k+'" aria-checked="'+FLAGS[k]+'" aria-label="'+k+'"></button></div>'}).join('')+'</div>'+
  '<div class="sect"><div class="sh"><h2>Time</h2><span class="sm">'+esc(T())+'</span></div><div style="display:flex;gap:8px"><button class="btn sec" data-d="-1">-1 day</button><button class="btn sec" data-d="1">+1 day</button><button class="btn sec" data-d="0">Today</button></div></div>'+
  '<div class="sect"><div class="sh"><h2>State</h2></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sec" data-demo>Seed returning player</button><button class="btn sec" data-reset>Reset v5</button></div></div>'+
  '<div class="sect"><div class="sh"><h2>Ads (placeholders)</h2></div><pre>'+esc(JSON.stringify({caps:ADCAP,rewardedOk:Ads.rewardedOk(),interstitialOk:Ads.interstitialOk(),runsSince:v.ads.runsSince|0,rewardedToday:v.ads.rw[T()]|0,interToday:v.ads.it[T()]|0,sessions:v.sessions,first:v.first},null,1))+'</pre></div>'+
  '<div class="sect"><div class="sh"><h2>Events today</h2></div><pre>'+esc(JSON.stringify(v.ev[T()]||{},null,1))+'</pre><p class="sm">Only names on the server allowlist are ever sent (flag sendCounts).</p></div>'+
  (FLAGS.iap?'':'<div class="sect"><div class="sh"><h2>IAP slots (disabled)</h2></div><pre>'+esc(IAP_SLOTS.map(function(x){return x.id+': '+x.t}).join('\n'))+'</pre></div>')+'</div>');
  var sh=Nav.sheet({title:'Developer',body:b});
  on(b,'[data-f]','click',function(e,x){var k=x.dataset.f,nv=!FLAGS[k];flagSet(k,nv);x.setAttribute('aria-checked',String(nv));TODAY.sig={};ALM.sig='';Nav.refresh('today');Nav.refresh('almanac')});
  on(b,'[data-d]','click',function(e,x){var d=+x.dataset.d;v.dayOffset=d===0?0:(v.dayOffset|0)+d;save();location.reload()});
  qs(b,'[data-demo]').onclick=function(){seedDemo();location.reload()};
  qs(b,'[data-reset]').onclick=function(){try{['zv4','zv4.bak','zv4.ev','zv5.flags','zv5.blocked'].forEach(function(k){localStorage.removeItem(k)})}catch(e){}location.href=location.pathname+(Q.dev?'?dev':'')}}
