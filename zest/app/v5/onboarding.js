/* v5 first run: Welcome (one tap) -> the story slate (3 s, the hook) -> Disc Tower level 1 -> reward with the card flip -> one age question -> Today.
   Target: first win in under 60 s, the story seen before the first move (audit 01-01..01-08). Nothing is asked before the first win. */
function welcome(){var tiles=[FIRST_PUZZLE,'word-steps','bridge-walk'];
  var n=h5('<div class="ob" role="dialog" aria-modal="true" aria-label="Welcome to Zest"><div class="mark">'+MARK+'</div><h1>Every puzzle has a true story.</h1>'+
    '<div class="fan3" aria-hidden="true">'+tiles.map(function(id,i){return '<span class="art" data-i="'+i+'">'+art(id,'tile')+'</span>'}).join('')+'</div>'+
    (FLAGS.ageAfterWin?'':'<div class="agegrid" data-ages></div>')+
    '<button class="btn pri big" data-go>Play</button><p class="legal">By playing you agree to the <a href="https://orangepulplabs.com/zest/terms/" target="_blank" rel="noopener">Terms</a> and <a href="https://orangepulplabs.com/zest/privacy/" target="_blank" rel="noopener">Privacy policy</a>. For ages 13 and up.</p></div>');
  var c=Nav.cover(n,{noBack:true}),arts=qsa(n,'.fan3 .art');
  arts.forEach(function(a,i){var r=(i-1)*14,x=(i-1)*62;a.style.transform='translateX('+x+'px) rotate('+r+'deg)';Nav.anim(a,[{transform:'translateY(30px) rotate(0deg)',opacity:0},{transform:'translateX('+x+'px) rotate('+r+'deg)',opacity:1}],460,'cubic-bezier(.3,1.4,.5,1)',200+i*90)});
  Nav.anim(qs(n,'.mark'),[{transform:'scale(.8)',opacity:0},{transform:'none',opacity:1}],420,'cubic-bezier(.3,1.4,.5,1)');
  if(!FLAGS.ageAfterWin)ageChoices(qs(n,'[data-ages]'),function(){});
  qs(n,'[data-go]').onclick=function(){if(!FLAGS.ageAfterWin&&!S().age){toast('Pick your age group first.');return}var v=S();v.agreeAt=Date.now();save();ev('onb_agree');fx('tap');slate(FIRST_PUZZLE,1,{first:true},c)}}
/* the story slate: the hook before the first move (also used for dailies when opened from a notification later) */
function slate(id,level,o,prevCover){var p=P(id),secs=Q.fast?0.05:2.6;
  var n=h5('<div class="slate" role="dialog" aria-modal="true" aria-label="'+esc(p.name)+'"><div class="art hero">'+art(id,'hero')+'</div><div class="meta">'+kickChip(id)+'<span class="chip">'+esc(fam(id).name)+'</span></div>'+
    '<h1>'+esc(p.name)+'</h1><p>'+esc(storyHook(id))+'</p><div class="prog" aria-hidden="true"><i></i></div><button class="btn pri big wide" data-go>Start</button></div>');
  var c=Nav.cover(n,{noBack:true});if(prevCover)setTimeout(function(){prevCover.close()},60);
  qsa(n,'.meta,h1,p').forEach(function(x,i){Nav.anim(x,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],280,null,120+i*60)});
  Nav.anim(qs(n,'.art'),[{transform:'scale(.96)',opacity:0},{transform:'none',opacity:1}],320);
  var bar=qs(n,'.prog i'),gone=false;if(bar.animate)bar.animate([{width:'0%'},{width:'100%'}],{duration:secs*1000,easing:'linear',fill:'forwards'});
  function go(){if(gone)return;gone=true;clearTimeout(tm);playPuzzle(id,level,o);setTimeout(function(){c.close()},Q.fast?0:120)}
  var tm=setTimeout(go,secs*1000+200);qs(n,'[data-go]').onclick=go}
function ageChoices(box,done){box.innerHTML='<button class="btn sec wide" data-a="child">Under 13</button><button class="btn sec wide" data-a="teen">13 to 17</button><button class="btn sec wide" data-a="adult">18 or over</button>';
  on(box,'[data-a]','click',function(e,x){var a=x.dataset.a;if(a==='child'){blockedScreen(true);return}S().age=a;save();ev(a==='teen'?'age_set_teen':'age_set_adult');qsa(box,'[data-a]').forEach(function(y){y.className='btn wide '+(y===x?'pri':'sec')});done(a)})}
function onboardAfterWin(){var v=S();if(v.age||!FLAGS.ageAfterWin){finishOnboarding();return}
  var n=h5('<div class="ob" role="dialog" aria-modal="true" aria-label="Your age group"><div class="zcomp" data-zc="idle" style="width:80px;height:80px"></div><h1 style="font-size:1.625rem">One quick thing: your age group?</h1><p class="sm" style="margin-top:8px">It sets what Zest can offer you. It stays on this phone.</p><div class="agegrid" data-ages></div></div>');
  var c=Nav.cover(n,{noBack:true});if(window.ZD)ZD.mount(n);ageChoices(qs(n,'[data-ages]'),function(){setTimeout(function(){finishOnboarding();c.close()},Q.fast?0:260)})}
function finishOnboarding(){keepGuest();var v=S();v.onb=1;db().p=Object.assign(db().p||{},{done:1});save();Nav.popAll().then(function(){Nav.refresh('today');Nav.refresh('almanac');setTimeout(function(){toast('Your first story is in the Almanac')},400)})}
/* under 13: a kind stop, no delete dialog (audit 01-07). Data is cleared quietly and the choice is remembered on this phone. */
function blockedScreen(fresh){if(fresh){try{['zv4','zv4.bak','zv4.corrupt','zv4.ev','zv4.flags'].forEach(function(k){localStorage.removeItem(k)});localStorage.setItem('zv5.blocked','1')}catch(e){}}
  var n=h5('<div class="ob" role="dialog" aria-modal="true" aria-label="Zest is for 13 and up" style="z-index:95"><div class="mark">'+MARK+'</div><h1>Zest is for ages 13 and up.</h1><p class="sm" style="margin-top:10px">Thanks for stopping by.</p></div>');
  $('layer').innerHTML='';Nav.cover(n,{noBack:true})}

/* a friend's challenge link (?c=, challenge.js codec): play it at once; a new player is a guest until the first win, then keeps what they did */
function keepGuest(){try{if(window.ZC&&ZC.guest){var keep=db();ZC.endGuest();STORE.cache=null;sv(keep)}}catch(e){}}
function friendFromUrl(){if(!window.ZC||!/[?&]c=/.test(location.search))return null;
  var ctx={today:ZC.dayIdx(),levelsOf:function(id){var p=P(id);return p?p.levels:0},parOf:function(id,l,tg){try{var i=P(id).make(l,pzRng(pzSeed(id,l,tg)));return typeof i.par==='number'?i.par:null}catch(e){return null}},
    dailyOk:function(day,id,l){var d=dailyFor(day,99);return d.id===id}};
  var f=ZC.fromSearch(location.search,ctx);try{history.replaceState(null,'',location.pathname+location.search.replace(/[?&](c|l|s|t)=[^&]*/g,'').replace(/^&/,'?'))}catch(e){}
  if(!f||!f.ok||!P(f.id)){ev('link_broken');return {broken:true}}ev('link_open');return f}
function friendStart(f){var v=S(),o={friend:{t:f.t,who:f.who||'a friend'},guest:!v.onb};if(f.daily){if(f.tag===T()&&!v.daily[f.tag])o.daily=f.tag;else o.past=f.tag}else o.tag=f.tag||'';
  if(!v.onb){v.agreeAt=Date.now();save()}playPuzzle(f.id,f.level,o)}
