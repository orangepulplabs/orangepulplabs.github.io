/* v5 first run: Welcome (one tap) -> the story slate (3 s, the hook) -> Disc Tower level 1 -> reward with the card flip -> one age question -> Today.
   Target: first win in under 60 s, the story seen before the first move (audit 01-01..01-08). Nothing is asked before the first win. */
/* Terms (10 Nov 2026, owner): every player accepts the Terms and Privacy policy with a tap before playing, on Android and the web app.
   New players: the welcome's "Agree and play". A friend's link: the same words on a small screen first. Players who joined before this:
   a one-time "We updated our Terms" screen. S().tos = the version accepted; raise TERMS_V when the Terms change in a way players must accept again.
   Zest is for all ages (owner, 10 Nov 2026): "Under 13" is an age group like the others (no ads, no sign-in, no rankings; see ads.js, settings.js). */
var TERMS_V='2026-11-10';
var TERMS_LINE='By tapping, you accept the <a href="https://orangepulplabs.com/zest/terms/" target="_blank" rel="noopener">Terms</a> and <a href="https://orangepulplabs.com/zest/privacy/" target="_blank" rel="noopener">Privacy policy</a>.';
function needTerms(){var v=S();return !v.tos||v.tos<TERMS_V}
function agreeTerms(){var v=S();v.tos=TERMS_V;v.agreeAt=Date.now();save();ev('onb_agree')}
function termsGate(updated,done){
  var n=h5('<div class="ob" role="dialog" aria-modal="true" aria-label="Terms" style="z-index:95"><div class="mark">'+MARK+'</div><h1>'+(updated?'We updated our Terms':'Before you play')+'</h1>'+
    '<p class="sm" style="margin-top:10px">'+(updated?'Zest is now open to players of every age. Please read and accept the Terms and Privacy policy to keep playing.':'Zest is free, with no account needed. Please read and accept the Terms and Privacy policy.')+'</p>'+
    '<button class="btn pri big" data-ok style="margin-top:20px">'+(updated?'Agree and continue':'Agree and play')+'</button><p class="legal">'+TERMS_LINE+'</p></div>');
  var c=Nav.cover(n,{noBack:true});
  qs(n,'[data-ok]').onclick=function(){agreeTerms();fx('tap');c.close();if(done)setTimeout(done,Q.fast?0:120)}}
function welcome(){var id=FIRST_PUZZLE,p=P(id);
  /* 10 Nov 2026 (owner, Docs/website-mobile/first-play.md): one screen before play. The welcome IS the first puzzle's story (art, year, name,
     hook) with one explicit "Agree and play"; the tap accepts the Terms and opens the board (no 3-screen intro, no separate story slate). */
  var n=h5('<div class="ob ob1" role="dialog" aria-modal="true" aria-label="Welcome to Zest"><div class="ob1-top"><div class="mark">'+MARK+'</div><span>Every puzzle has a true story.</span></div>'+
    '<div class="art hero ob1-art">'+art(id,'hero')+'</div><div class="meta ob1-meta">'+kickChip(id)+'<span class="chip">Your first puzzle</span></div>'+
    '<h1>'+esc(p.name)+'</h1><p class="sm ob1-hook">'+esc(storyHook(id))+'</p>'+
    (FLAGS.ageAfterWin?'':'<div class="agegrid" data-ages></div>')+
    '<button class="btn pri big wide" data-go>Agree and play</button><p class="legal">'+TERMS_LINE+'</p></div>');
  var c=Nav.cover(n,{noBack:true});
  qsa(n,'.ob1-art,.ob1-meta,h1,.ob1-hook').forEach(function(x,i){Nav.anim(x,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],280,null,80+i*60)});
  if(!FLAGS.ageAfterWin)ageChoices(qs(n,'[data-ages]'),function(){});
  qs(n,'[data-go]').onclick=function(){if(!FLAGS.ageAfterWin&&!S().age){toast('Pick your age group first.');return}agreeTerms();fx('tap');
    playPuzzle(id,1,{first:true});setTimeout(function(){c.close()},Q.fast?0:120)}}

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
  on(box,'[data-a]','click',function(e,x){var a=x.dataset.a;S().age=a;save();ev('age_set_'+a);qsa(box,'[data-a]').forEach(function(y){y.className='btn wide '+(y===x?'pri':'sec')});done(a)})}
function onboardAfterWin(){var v=S();if(v.age||!FLAGS.ageAfterWin){finishOnboarding();return}
  var n=h5('<div class="ob" role="dialog" aria-modal="true" aria-label="Your age group"><div class="zcomp" data-zc="idle" style="width:80px;height:80px"></div><h1 style="font-size:1.625rem">One quick thing: your age group?</h1><p class="sm" style="margin-top:8px">It sets what Zest can offer you. It stays on this phone.</p><div class="agegrid" data-ages></div></div>');
  var c=Nav.cover(n,{noBack:true});if(window.ZD)ZD.mount(n);ageChoices(qs(n,'[data-ages]'),function(){setTimeout(function(){finishOnboarding();c.close()},Q.fast?0:260)})}
function finishOnboarding(){keepGuest();var v=S();v.onb=1;db().p=Object.assign(db().p||{},{done:1});save();Nav.popAll().then(function(){Nav.refresh('today');Nav.refresh('almanac');setTimeout(function(){toast('Your first story is in the Almanac')},400)})}

/* a friend's challenge link (?c=, challenge.js codec): play it at once; a new player is a guest until the first win, then keeps what they did */
function keepGuest(){try{if(window.ZC&&ZC.guest){var keep=db();ZC.endGuest();STORE.cache=null;sv(keep)}}catch(e){}}
function friendFromUrl(){if(!window.ZC||!/[?&]c=/.test(location.search))return null;
  var ctx={today:ZC.dayIdx(),levelsOf:function(id){var p=P(id);return p?p.levels:0},parOf:function(id,l,tg){try{var i=P(id).make(l,pzRng(pzSeed(id,l,tg)));return typeof i.par==='number'?i.par:null}catch(e){return null}},
    dailyOk:function(day,id,l){var d=dailyFor(day,99);return d.id===id}};
  var f=ZC.fromSearch(location.search,ctx);try{history.replaceState(null,'',location.pathname+location.search.replace(/[?&](c|l|s|t)=[^&]*/g,'').replace(/^&/,'?'))}catch(e){}
  if(!f||!f.ok||!P(f.id)){ev('link_broken');return {broken:true}}ev('link_open');return f}
function friendStart(f){if(needTerms())return termsGate(false,function(){friendStart(f)});var v=S(),o={friend:{t:f.t,who:f.who||'a friend'},guest:!v.onb};if(f.daily){if(f.tag===T()&&!v.daily[f.tag])o.daily=f.tag;else o.past=f.tag}else o.tag=f.tag||'';
  playPuzzle(f.id,f.level,o)}
