/* Zest v4 prototype, part B: screens and flow. */
var TERMS_URL='https://orangepulplabs.com/zest/terms/',PRIVACY_URL='https://orangepulplabs.com/zest/privacy/',TERMS_VERSION='2026-10-31',BUILD='b6',CONTACT='orangepulplabs@gmail.com',CTX=null,TAB='today',OB={goals:[],mins:5,hand:'R',age:null},PEER={g:'age',s:null},LIBF='all',LIBQ='';
var LS_BLOCK='zv4.blocked',LS_PEND='zv4.pending';
var AGEOPTS=['Under 13'].concat(AGES,['Prefer not to say']);   // one neutral list, ascending

/* ---------- small helpers ---------- */
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function plural(n,one,many){return n+' '+(n===1?one:(many||one+'s'))}
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
function lsDel(k){try{localStorage.removeItem(k)}catch(e){}}
function lsJson(k){try{return JSON.parse(lsGet(k)||'null')}catch(e){return null}}
function isLocal(){try{return /^(localhost|127\.0\.0\.1)$/.test(location.hostname)}catch(e){return false}}
var DEVMODE=isLocal()&&/[?&]dev/.test(location.search);
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function icoSize(n,px){return ico(n).replace('class="i"','class="i" style="width:'+px+'px;height:'+px+'px"')}
function agoText(t){if(!t)return 'not yet';var m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' days ago'}

/* one plain name for each idea: six areas, the games in them, and the challenges (versions of a game) */
(function(){var nm={speed:'Quick reactions',attention:'Spotting',control:'Hold back',flex:'Switching',memory:'Memory',space:'Shapes and numbers'};DOMS.forEach(function(d){if(nm[d.id])d.name=nm[d.id]});
  var gl={react:['Quick reactions','Taps against the clock'],focus:['Spotting','Find it fast, ignore the rest'],control:['Hold back','Tap only when it counts'],switch:['Switching','The rules keep changing'],visual:['Shapes and numbers','Turn shapes, find patterns'],memory:['Memory','Sequences, pairs and changes'],fun:['A bit of everything','Surprise me']};
  GOALS.forEach(function(g){if(gl[g.id]){g.name=gl[g.id][0];g.sub=gl[g.id][1]}});
  var sw=stage('switch');if(sw)sw.label=sw.name})();
/* one distinct glyph per game (the area icon stays the colour cue) */
Object.assign(IC,{g_timing:'<path d="M18 4v16"/><circle cx="8" cy="12" r="3"/><path d="M13 12h2"/>',g_speed:'<circle cx="12" cy="12" r="9" stroke-dasharray="2 3.2"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18" cy="7" r="1.8" fill="currentColor"/>',g_switch:IC.flex,g_hold:'<circle cx="8" cy="12" r="4"/><rect x="14" y="8" width="8" height="8" rx="1"/>',g_space:IC.space,
  g_trail:'<circle cx="5" cy="17" r="2"/><circle cx="12" cy="7" r="2"/><circle cx="19" cy="15" r="2"/><path d="M6.5 15.5l4-6M13.7 8.3l4 5.3"/>',g_math:'<path d="M4 8h8M8 4v8M14 18h7M14 5l6 6M20 5l-6 6"/>',g_flanker:'<path d="M4 12l3-3M4 12l3 3M11 12l3-3M11 12l3 3M18 12l3-3M18 12l3 3"/>',g_search:'<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>',g_stroop:'<path d="M5 19l7-14 7 14M8 14h8"/>',
  g_span:'<rect x="3" y="14" width="5" height="6" rx="1"/><rect x="10" y="9" width="5" height="11" rx="1"/><rect x="17" y="4" width="5" height="16" rx="1"/>',g_change:'<rect x="3" y="4" width="9" height="9" rx="1.5"/><rect x="12" y="11" width="9" height="9" rx="1.5" stroke-dasharray="3 2"/>',g_nback:'<path d="M4 18V8l5 10V8M14 8h6M14 12h6M14 16h6"/>',g_match:'<rect x="3" y="5" width="8" height="14" rx="1.5"/><rect x="13" y="5" width="8" height="14" rx="1.5"/><circle cx="7" cy="12" r="1.4"/><circle cx="17" cy="12" r="1.4"/>',g_pattern:'<circle cx="5" cy="12" r="2.5"/><path d="M10.5 9.5h5v5h-5zM19 9l3 5h-6z"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',share:'<path d="M12 15V3M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',chev:'<path d="M9 5l7 7-7 7"/>',up:'<path d="M12 19V5M6 11l6-6 6 6"/>',down:'<path d="M12 5v14M6 13l6 6 6-6"/>',flat:'<path d="M5 12h14M14 7l5 5-5 5"/>',pause:'<path d="M9 5v14M15 5v14"/>',play:'<path d="M7 4l13 8-13 8z"/>',replay:'<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/>'});
function gico(sid,px){var s=stage(sid);return ico(IC['g_'+sid]?'g_'+sid:(s?s.dom:'aim')).replace('class="i"','class="i"'+(px?' style="width:'+px+'px;height:'+px+'px"':''))}
function bestOf(sid,arr){return stage(sid).hi?Math.max.apply(null,arr):Math.min.apply(null,arr)}
function ttl(c){return esc(stage(c.stage).name+' · '+c.name)}
/* story art (art_*.js): a small picture per game or puzzle, with a bigger one and a one-line hook on its page; falls back to the plain icon */
function artBox(id,fb,style){var a=window.ART&&ART[id];return a?'<span class="sico art"'+(style?' style="'+style+'"':'')+' aria-hidden="true">'+a.tile+'</span>':fb}
function artHero(id){var a=window.ART&&ART[id];return a?'<div class="arthero" aria-hidden="true">'+a.hero+(a.cap?'<span class="cap">'+esc(a.cap)+'</span>':'')+'</div><p class="hook">'+esc(a.hook)+'</p>':''}
function iconBox(sid,size){var s=stage(sid);return artBox(sid,'<span class="sico" style="--c:var('+s.col+')">'+gico(sid)+'</span>')}
function fmtV(s,x){return s.unit==='s'?(Math.round(x*10)/10)+'':Math.round(x)+''}
/* runs of a challenge, in the current pace only (relaxed pace keeps its own series) */
function runsX(cid,rx){return runsOf(cid,rx?'rx':'u')}   // the usual and relaxed series never mix (runsOf also leaves out flagged, assisted and old-scoring rounds)
function curRx(){return !!db().st.rx}
function estSec(c){var s=stage(c.stage),tpt={timing:2.6,speed:3.4,switch:2,hold:1.7,space:4.4,trail:5,math:3,flanker:1.8,search:3.2,stroop:1.8,span:6,change:3,nback:2.6,match:4,pattern:6},n=(c.mods&&c.mods.n)||s.n||10;return Math.max(15,Math.round(n*(tpt[c.stage]||3)/5)*5+10)}
function estText(c){var t=estSec(c);return t<60?'about '+(Math.round(t/10)*10)+' s':'about '+plural(Math.round(t/60),'min')}

/* ---------- messages that stay out of the way: banners and a toast ---------- */
var BAN={},toastT=0;
function banner(id,html,acts){var box=$('banners');if(!box)return;var el=BAN[id];if(!el){el=document.createElement('div');el.className='ban';el.setAttribute('role','status');box.appendChild(el);BAN[id]=el}
  el.innerHTML='<span class="bt">'+html+'</span>'+(acts||[]).map(function(a,i){return '<button class="chip" data-i="'+i+'">'+esc(a[0])+'</button>'}).join('');
  el.querySelectorAll('button').forEach(function(b){b.onclick=function(){acts[+b.dataset.i][1]()}})}
function unban(id){var el=BAN[id];if(el){el.remove();delete BAN[id]}}
function toast(t){var el=$('toast');if(!el)return;el.textContent=t;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){el.classList.remove('on')},2800)}
window.addEventListener('zst:recovered',function(e){var f=e.detail&&e.detail.from;banner('corrupt',f==='backup'?'Zest could not read your saved data on this phone, so it went back to a recent copy. Your last few rounds may be missing.':'Zest could not read your saved data on this phone, so it started fresh and kept the old copy. Email '+CONTACT+' if you would like help getting it back.',[['OK',function(){unban('corrupt')}]])});
window.addEventListener('zst:savefail',function(){banner('savefail','Could not save on this phone. Your last result may not be kept. Free some space or close other tabs, then play again.',[['OK',function(){unban('savefail')}]])});

/* ---------- dialogs and sheets share one layer stack: focus trap, inert background, Esc and Back close the top one ---------- */
var LAYERS=[],DLGN=0;
function refreshInert(){var on=LAYERS.length>0;[scr,$('tabsnav'),$('banners')].forEach(function(e){if(!e)return;if(on){e.setAttribute('inert','');e.setAttribute('aria-hidden','true')}else{e.removeAttribute('inert');e.removeAttribute('aria-hidden')}});
  LAYERS.forEach(function(l,i){if(i===LAYERS.length-1)l.root.removeAttribute('inert');else l.root.setAttribute('inert','')})}
function openLayer(root,o){var l={root:root,prev:document.activeElement,esc:o.esc};LAYERS.push(l);refreshInert();
  l.close=function(){var i=LAYERS.indexOf(l);if(i<0)return;LAYERS.splice(i,1);root.remove();refreshInert();try{if(l.prev&&document.contains(l.prev))l.prev.focus();else if(LAYERS.length)focusIn(LAYERS[LAYERS.length-1].root)}catch(e){}};
  setTimeout(function(){focusIn(root,o.focus)},0);return l}
function focusables(root){return [].slice.call(root.querySelectorAll('button:not([disabled]),input,a[href],[tabindex]:not([tabindex="-1"])'))}
function focusIn(root,sel){var t=(sel&&root.querySelector(sel))||focusables(root)[0];if(t)try{t.focus({preventScroll:true})}catch(e){}}
function closeTopLayer(){var l=LAYERS[LAYERS.length-1];if(!l)return false;if(l.esc)l.esc();else l.close();return true}
document.addEventListener('keydown',function(e){var l=LAYERS[LAYERS.length-1];if(!l)return;
  if(e.key==='Escape'){e.preventDefault();closeTopLayer();return}
  if(e.key==='Tab'){var f=focusables(l.root);if(!f.length)return;var a=document.activeElement,i=f.indexOf(a);if(e.shiftKey&&(i<=0)){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&(i===f.length-1||i<0)){e.preventDefault();f[0].focus()}}},true);
/* btns: [label, fn, style?, 'keep'?]. The first button is the safe one and the primary. A 'keep' button runs first and closes the dialog unless it returns false. */
function dialog(title,body,btns,o){o=o||{};var d=document.createElement('div'),id='dl'+(++DLGN);d.className='dlg';if(body.charAt(0)!=='<')body='<p>'+body+'</p>';
  d.innerHTML='<div role="dialog" aria-modal="true" aria-labelledby="'+id+'t" aria-describedby="'+id+'b"><h3 id="'+id+'t">'+title+'</h3><div class="db" id="'+id+'b">'+body+'</div><div class="dock">'+btns.map(function(b,i){return '<button class="zbtn '+(b[2]||(i?'ghost':'pri'))+' wide" data-i="'+i+'">'+b[0]+'</button>'}).join('')+'</div></div>';
  phone.appendChild(d);var L;
  async function go(i){var b=btns[i];if(b[3]==='keep'){var r=b[1]();if(r&&r.then)r=await r;if(r!==false)L.close();return}L.close();if(b[1])b[1]()}
  L=openLayer(d,{esc:function(){go(o.esc==null?0:o.esc)},focus:o.focus});
  d.querySelectorAll('button[data-i]').forEach(function(b){b.onclick=function(){go(+b.dataset.i)}});return L}
/* a confirm where the safe choice is first and primary, and the destructive one has the danger style */
function confirmDanger(title,body,safe,danger,fn){dialog(title,body,[[safe,function(){}],[danger,fn,'danger']])}
function info(title,body,after){dialog(title,body,[['OK',after||function(){}]])}

/* ---------- screens ---------- */
var dockLock=0,BACKFN=null,demoPaused=false;
function show(h,g,o){o=o||{};LAYERS.slice().forEach(function(l){l.close()});phone.querySelectorAll('.dlg,.sheet,.cnt.rez').forEach(function(e){e.remove()});
  BACKFN=o.back||null;demoPaused=false;RESUME=0;scr.innerHTML=h;scr.scrollTop=0;phone.classList.toggle('ingame',!!g);phone.classList.toggle('inround',g==='round');inRound=(g==='round');dockLock=Date.now()+400;musicSync();var d=db();phone.classList.toggle('rm',!!d.st.rm);if(typeof ZD!=='undefined'){ZD.mount(scr);if(g==='round')ZD.resetChain()}focusScreen(g)}
function focusScreen(g){var h=scr.querySelector('h1,h2'),live=$('live');
  if(g==='round'||!h){try{scr.focus({preventScroll:true})}catch(e){}if(live)live.textContent='';return}
  h.setAttribute('tabindex','-1');try{h.focus({preventScroll:true})}catch(e){}if(live){live.textContent='';setTimeout(function(){live.textContent=h.textContent},60)}}
/* a tap that lands on a dock right after a screen appears is ignored, so 'Next' cannot start the next round unread */
function wireDockLock(){scr.addEventListener('click',function(e){if(Date.now()<dockLock&&e.target.closest&&e.target.closest('.dock')){e.stopImmediatePropagation();e.preventDefault()}},true)}
function setTab(n){TAB=n;['today','lib','play','fam','set'].forEach(function(k,i){var b=$('tt'+(i+1));if(k===n)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
function keepView(fn){var y=scr.scrollTop,a=document.activeElement,k=a&&a.dataset?(a.dataset.k||a.dataset.ms||a.dataset.mv||a.dataset.a||a.dataset.h||a.id):null;fn();scr.scrollTop=y;if(k){var t=scr.querySelector('[data-k="'+k+'"],[data-ms="'+k+'"],[data-mv="'+k+'"],[data-a="'+k+'"],[data-h="'+k+'"],#'+(/^[A-Za-z][\w-]*$/.test(k)?k:'x'));if(t)try{t.focus({preventScroll:true})}catch(e){}}}
/* where the player came from: Today, Challenges, Families. Stored in CTX.from */
function originName(){var f=CTX&&CTX.from;return f===library?'Challenges':f===families?'Families':(typeof archive==='function'&&f===archive)?'Past dailies':'Today'}
function goOrigin(){var f=CTX&&CTX.from;CTX=null;newRun();(f||home)()}

/* ---------- Android Back: one guard entry in the browser history, re-armed after every Back ---------- */
var GUARD={activated:false,exitUntil:0};
function guardDepth(){return history.state&&history.state.z?history.state.z:0}
function guardTop(){var want=GUARD.activated?2:1;try{for(var n=guardDepth();n<want;n++)history.pushState({z:n+1},'')}catch(e){}}
function handleBack(){
  if(LAYERS.length){closeTopLayer();return true}
  if(BACKFN){var f=BACKFN;f();return true}
  if(TAB!=='today'){home();return true}
  return false}
window.addEventListener('popstate',function(){
  if(handleBack()){guardTop();return}
  if(Date.now()<GUARD.exitUntil){history.go(-(guardDepth()+1));return}
  GUARD.exitUntil=Date.now()+2500;toast('Press Back again to exit');guardTop()});
['pointerdown','click','keydown'].forEach(function(t){document.addEventListener(t,function(){if(!GUARD.activated){GUARD.activated=true;guardTop()}},true)});   // the second entry is added after a real interaction, because browsers skip history entries a page added on its own

/* ---------- leaving, pausing and resuming a round ---------- */
var RESUME=0;
function askLeave(auto){if(!inRound||LAYERS.length)return;if(RESUME){if(!auto)return;RESUME++;var o=phone.querySelector('.cnt.rez');if(o)o.remove()}else if(run.paused&&!demoPaused)return;run.paused=true;run.pc++;
  dialog(auto?'Paused':'Leave this round?',auto?'Your round is paused. The question you were on will not count. If you leave, this round is not saved.':'It will not be saved.',[[auto?'Resume':'Keep playing',resumeRound],[auto?'Leave round':'Leave',function(){if(RNDLIVE){RNDLIVE=false;zc('round_abandoned')}goOrigin()},'danger']])}
async function resumeRound(){var id=run.id,tk=++RESUME,ov=document.createElement('div');ov.className='cnt rez';ov.innerHTML='<div><div class="n" id="rn" aria-live="assertive">3</div><p>Get ready</p></div>';phone.appendChild(ov);
  for(var k=3;k>=1;k--){var n=ov.querySelector('#rn');if(n){n.textContent=k;n.style.animation='none';void n.offsetWidth;n.style.animation=''}sfx('go');await sleep(FAST?200:700);if(id!==run.id||tk!==RESUME){ov.remove();return}}
  ov.remove();RESUME=0;demoPaused=false;run.paused=false}
function wireX(){var b=$('xb');if(b)b.onclick=function(){askLeave(false)}}
window.__interrupt=function(){if(inRound)askLeave(true)};

/* ---------- the daily challenge is the same for everyone; your set is made once per local day, then frozen ---------- */
function nPlays(s){return stdRuns(s,curPace()).length}
var VS_START='100 means the same as when you started. 104 means about 4% better.';
function moreText(sid){var r=formS(sid,curPace());if(r.ready)return '';var left=Math.max(0,NEED-(r.n||0));return left>0?'Play '+plural(left,'more round')+' to set your start in '+esc(stage(sid).label):'Play on another day to set your start in '+esc(stage(sid).label)}
function needAll(){var m=99,best=0;STG.forEach(function(s){var r=formS(s.id,curPace());if(r.ready){m=0;return}var l=Math.max(0,NEED-(r.n||0));if(l<m)m=l;best=Math.max(best,Math.min(r.n||0,NEED))});return {left:m===99?NEED:m,pct:Math.round(best/NEED*100)}}
function needLine(){var n=needAll();return n.left>0?'Play '+plural(n.left,'more round')+' to see your scores here':'Play on another day to see your scores here'}
function sharedDaily(){return cotd(todayStr())}   // the challenge of the day (see app4d)
function shortWhy(w){return /not tried (this game|[A-Z])/.test(w)?'New to you':/level/.test(w)?'Next level':/tried \d/.test(w)?'Keep exploring':/played this/.test(w)?'Revisit':w}
/* Your set: puzzles and the nine kept games from the recommender, each with its reason, never today's challenge of the day, different families first */
function getSet(){
  var d=db(),day=todayStr();if(d.setv!==BUILD){d.set={};d.setv=BUILD;sv(d)}
  if(d.set[day]&&d.set[day].every(function(x){return itemInfo(x.id)}))return d.set[day];
  var p=d.p||{mins:5},n=p.mins>=10?4:p.mins>=5?2:1,cx=cotd(day),skip=cx.kind==='p'?'pz:'+cx.id:cx.id,cands=[],out=[],usedF={};
  libPicks().forEach(function(it){var id=it.p?'pz:'+it.p:it.g+':std';if(id!==skip&&itemInfo(id))cands.push({id:id,tag:shortWhy(it.why||'Try this'),shared:false})});
  [true,false].forEach(function(strict){cands.forEach(function(c){var f=itemFam(c.id);if(out.length>=n||out.indexOf(c)>=0||(strict&&usedF[f]))return;out.push(c);usedF[f]=1})});
  d.set[day]=out;sv(d);return out}

/* ---------- running a challenge ---------- */
async function runGame(sid,o){try{var fn=function(){return GAMES[sid](o)};return typeof safeGame==='function'?await safeGame(fn)():await fn()}catch(e){return null}}
function gameFailed(){newRun();dialog('Something went wrong','This game stopped unexpectedly. Your other scores are safe.',[['Back',function(){goOrigin()}]])}
function demoBar(){return '<div class="demobar"><button class="chip" id="dp" aria-pressed="false">'+ico('pause')+'<span>Pause</span></button><button class="chip" id="dr">'+ico('replay')+'Replay</button><button class="chip go" id="sk">Tap to continue</button></div>'}
function wireDemo(cid){$('dp').onclick=function(){demoPaused=!demoPaused;run.paused=demoPaused;this.setAttribute('aria-pressed',demoPaused);this.querySelector('span').textContent=demoPaused?'Play':'Pause';this.querySelector('svg').innerHTML=IC[demoPaused?'play':'pause']};$('dr').onclick=function(){play(cid)};$('sk').onclick=function(){play(cid,{skipDemo:1})}}
async function play(cid,opts){
  opts=opts||{};var c=ch(cid);if(!c){goOrigin();return}var t=newRun(),s=stage(c.stage),d=db(),first=!d.seen[c.stage],rx=!!d.st.rx,quick=!!opts.instant&&!first,q=CTX&&CTX.queue;WB=false;RNDLIVE=false;
  if(first&&!opts.skipDemo){show(shell().replace('<div class="cap"',demoBar()+'<div class="cap"'),'round',{back:function(){askLeave(false)}});wireX();wireDemo(cid);var r0=await runGame(c.stage,{auto:true,rx:rx});if(t!==run.id)return;if(!r0){gameFailed();return}}
  if(first||opts.skipDemo){t=newRun();show(shell(),'round',{back:function(){askLeave(false)}});wireX();var r1=await runGame(c.stage,{practice:true,n:s.np,rx:rx});if(t!==run.id)return;if(!r1){gameFailed();return}var d2=db();d2.seen[c.stage]=1;sv(d2)}
  t=newRun();var zen=!!opts.zen;
  if(quick){   // Play again: no demo, no practice, no ready screen, no 3-2-1. One quiet beat, then the same game.
    zc('retry_instant');show('<div class="cnt"><div><div class="n w" id="cn" role="status">Ready</div><p>'+esc(s.name)+'</p></div></div>',true,{back:goOrigin});await wait(1000);if(t!==run.id)return}
  else{
  var r=runsX(cid,rx),usual=r.length?Math.round(med(r.slice(-5))*10)/10:null,canZen=!opts.unranked;
  show('<div class="ready"><div><button class="back" id="bk">'+ico('back')+' '+originName()+'</button></div><div class="diag"><span class="sico big" style="--c:var('+s.col+')">'+gico(c.stage,36)+'</span></div><span class="pill'+(c.std?'':' sh')+'" style="align-self:flex-start">'+ttl(c)+'</span>'+(q?'<p class="sm qline" style="margin:8px 0 0">Game '+(CTX.i+1)+' of '+q.n+'. You can stop any time.</p>':'')+'<h1 class="rt">'+esc(c.std?s.name:c.name)+'</h1><p>'+esc(c.desc)+'</p>'+'<p class="sm" style="margin-top:-6px">'+esc(s.scored)+'</p>'+(s.a11y==='visual'?'<p class="sm" style="margin-top:-6px">This game depends on seeing the screen.</p>':'')+(opts.unranked?'<p class="sm" style="margin-top:-6px">Unranked practice. It does not change your scores, your week or the rankings.</p>':usual!=null?'<p class="sm" style="margin-top:-6px">Your usual'+(rx?' (relaxed pace)':'')+': <b class="num">'+usual+' '+esc(s.unit)+'</b>. '+(s.hi?'Higher':'Lower')+' is better.</p>':'')+'<div class="dock stk"><button class="zbtn pri wide" id="rd">'+(opts.unranked?'Start':'Start. This one counts')+'</button>'+(canZen?'<button class="zbtn ghost wide" id="jp">Just play</button><p class="fine" style="margin:0;text-align:center">Just play. Nothing is saved or compared.</p>':'')+'<button class="zbtn ghost wide" id="wd">Watch the demo again</button></div></div>',true,{back:goOrigin});
  $('bk').onclick=function(){goOrigin()};$('wd').onclick=function(){var dd=db();delete dd.seen[c.stage];sv(dd);play(cid,opts)};
  zen=(await new Promise(function(r){$('rd').onclick=function(){r(false)};if($('jp'))$('jp').onclick=function(){r(true)}}))||!!opts.zen;if(t!==run.id)return;
  t=newRun();show('<div class="cnt"><div><div class="n" id="cn" aria-live="assertive">3</div><p>'+esc(s.name)+'</p></div></div>',true,{back:goOrigin});
  for(var k=3;k>=1;k--){var cn=$('cn');if(cn){cn.textContent=k;cn.style.animation='none';void cn.offsetWidth;cn.style.animation=''}sfx('go');await wait(700);if(t!==run.id)return}
  $('cn').textContent='Go';await wait(350);if(t!==run.id)return}
  show(shell(),'round',{back:function(){askLeave(false)}});wireX();
  if(zen)zc('zen_started');else{zc('round_started');if(CTX&&CTX.first)zc('first_round_started')}RNDLIVE=!zen;
  var res=await runGame(c.stage,{n:FAST?Math.min(s.n,6):s.n,mods:c.mods,rx:rx});RNDLIVE=false;if(t!==run.id)return;if(!res){gameFailed();return}
  if(zen){zenEnd(cid,res,{zen:true});return}
  if(opts.unranked){unrankedEnd(cid,res,{unranked:true,day:opts.day});return}
  after(cid,res)}
function after(cid,res){
  var c=ch(cid),d=db(),before=formS(c.stage,curPace()),r0=typeof runRecord==='function'?runRecord(cid,res):{c:cid,s:c.stage,v:res.score,t:Date.now(),std:!!c.std&&res.valid,rx:!!d.st.rx,flag:!res.valid};
  d.runs.push(r0);var day=todayStr();d.done[day]=d.done[day]||[];if(d.done[day].indexOf(cid)<0)d.done[day].push(cid);sv(d);pushScores();scheduleSync();zc('round_finished');if(CTX&&CTX.first)zc('first_round_finished');bumpToday();
  result(cid,res,before)}

/* ---------- result ---------- */
function shareText(c,s,v){return (c.std?s.name:s.name+' ('+c.name+')')+' on Zest: '+fmtV(s,v)+' '+s.unit+'. Can you beat it?'}
async function shareResult(c,s,v){zc('share_tap');var text=shareText(c,s,v);
  try{if(navigator.share){await navigator.share({text:text});return}}catch(e){if(e&&e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(text);toast('Copied. Paste it anywhere to share.');return}catch(e){}
  dialog('Share your result','<p>Copy this text to share it.</p><p><input class="inp" id="shtxt" readonly value="'+esc(text)+'" aria-label="Text to share"></p>',[['Close',function(){}]],{focus:'#shtxt'});var i=$('shtxt');if(i)i.select()}
/* the result ceremony: the number counts up over 600 ms, a new best gets a gold ring, a badge, the best sound and buzz; otherwise the round sound.
   Reduce motion: instant number, no ring, a 200 ms highlight on the badge. With sound and vibration off the badge and line still say it. */
function ceremony(valid,isBest,v,fmt){if(typeof ZD==='undefined')return;var bv=$('bv'),ms=FAST?150:600,cp=ZD.comps[0];
  if(valid&&bv)ZD.countUp(bv,v,ms,fmt);
  if(!valid){ZD.sound('soft');ZD.haptic('soft');if(cp)cp.tilt();return}
  if(isBest){ZD.sound('best');ZD.haptic('best');if(cp)cp.cheer();setTimeout(function(){var b=$('bv'),g=$('bdg');if(b&&b.isConnected){ZD.ring(b);if(g)ZD.pop(g,'best')}},ms)}
  else{ZD.sound('round');ZD.haptic('round');if(cp)cp.hop()}}
function result(cid,res,before){
  newRun();var c=ch(cid),s=stage(c.stage),rx=curRx(),all=runsX(cid,rx),valid=res.valid,prior=valid?all.slice(0,-1):all,typ=prior.length?med(prior.slice(-5)):null,v=res.score,fmt=function(x){return fmtV(s,x)};
  var pbest=prior.length?bestOf(c.stage,prior):null,best=all.length?bestOf(c.stage,all):v,isBest=!!(valid&&(typeof isBestSoFar==='function'?isBestSoFar(c.stage,v,prior):pbest!==null&&(s.hi?v>pbest:v<pbest))),better=s.hi?'Higher':'Lower';
  var calm='',isBetter=false,isSame=false;if(valid&&typ!==null){var df=v-typ,ap=Math.abs(df);isSame=Math.abs(df)/Math.max(typ,.001)<.04;isBetter=s.hi?df>0:df<0;
    calm=isSame?'About your usual. Nice and steady.':isBetter?'Nice. '+fmt(ap)+' '+s.unit+' '+(s.hi?'higher':'faster')+' than your usual.':'A little '+(s.hi?'lower':'slower')+' than your usual. Some rounds are like that.'}
  else if(valid&&pbest===null)calm='First time here: this is your starting point.';
  if(isBest)calm='That is your best yet. Nice.';
  var gapTxt=valid&&!isBest&&pbest!==null?(Math.abs(v-pbest)<1e-9?'Matches your best':fmt(Math.abs(v-pbest))+' '+esc(s.unit)+' from your best'):'';
  var set=CTX&&CTX.set,more=set&&CTX.i<set.length-1,nextC=more?itemInfo(CTX.set[CTX.i+1].id):(CTX&&CTX.queue?null:valid?nextSug(cid):null),qn=CTX&&CTX.queue;
  var pts=all.slice(-12),W=330,H=110,mx=Math.max.apply(null,pts),mn=Math.min.apply(null,pts),rg=(mx-mn)||1;function X(i){return 10+i*(W-20)/Math.max(1,pts.length-1)}function Y(x){return 10+((s.hi?mx-x:x-mn)/rg)*(H-38)}
  var roll=pts.map(function(_,i){return med(pts.slice(Math.max(0,i-2),i+1))}),dirTxt=better+' is better';
  var chart=pts.length>=3?'<div class="lab">Your last '+pts.length+' rounds</div><svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Your recent results. '+dirTxt+'.">'+pts.map(function(x,i){return '<circle cx="'+X(i)+'" cy="'+Y(x)+'" r="3.5" fill="var(--edge)"/>'}).join('')+'<polyline fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round" points="'+roll.map(function(x,i){return X(i)+','+Y(x)}).join(' ')+'"/><circle cx="'+X(pts.length-1)+'" cy="'+Y(pts[pts.length-1])+'" r="6" fill="var(--bg)" stroke="var(--accent)" stroke-width="3"/><text x="10" y="'+(H-4)+'" font-size="12" fill="var(--muted)">older</text><text x="'+(W-10)+'" y="'+(H-4)+'" text-anchor="end" font-size="12" fill="var(--muted)">latest</text><text x="'+(W-10)+'" y="12" text-anchor="end" font-size="12" fill="var(--muted)">↑ better</text></svg><div class="sm" style="margin-top:-2px">Line: your typical result. '+dirTxt+'.</div>':'';
  var ms=valid&&!isBest?milestone(d0runs()):0,
    head=valid?'<h1 class="pill'+(c.std?'':' sh')+'" style="align-self:flex-start">'+ttl(c)+'</h1><div class="bigv num" id="bv">'+fmt(v)+'</div><div class="unit">'+esc(s.unit)+'</div><p class="calml">'+calm+'</p>'+(c.std?'<p class="pctl" id="pctl" role="status"></p>':'')+(isBest?'<div class="badge best" id="bdg" role="status">'+ico('star')+' New best</div>':ms?'<div class="badge ms" role="status">Round '+ms+'</div>':'')+(gapTxt?'<div class="sm" style="margin-top:8px">'+gapTxt+'</div>':'')
      :'<div class="pill'+(c.std?' sh':'')+'" style="align-self:flex-start">'+ttl(c)+'</div><h1 class="bigv small" id="bv">That one got away from us. Try again?</h1>',
    chips='<div class="lab">What happened</div><div class="chp">'+(res.chips||[]).map(function(x){return '<span class="num">'+esc(x)+'</span>'}).join('')+'</div>',
    detail=(valid?'<div class="two"><div><b class="num">'+(typ!==null?fmt(typ):'–')+'</b><span>your usual</span></div><div><b class="num">'+fmt(best)+'</b><span>your best</span></div></div><div class="sm" style="margin-top:8px">'+dirTxt+'.'+(rx?' Relaxed pace.':'')+'</div>':'<p class="sm" style="margin:0 0 6px">This round did not count. '+esc(res.tip||'')+'</p>')+chips+(valid&&res.tip?'<div class="tip"><b>Next time:</b> '+esc(res.tip)+'</div>':'')+
      chart;
  show('<div class="res"><div><button class="back" id="bk">'+ico('back')+' '+originName()+'</button></div><div class="core cer"><div class="zcomp sm rcomp" data-zc="idle"></div>'+head+
   '<div class="rrow" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="chip" id="dtb" aria-expanded="false" aria-controls="dtp">Details '+ico('chev')+'</button>'+(valid?'<button class="chip" id="sh">'+ico('share')+' Share</button>':'')+'</div><div class="dtp" id="dtp" hidden role="region" aria-label="Details">'+detail+'</div></div>'+
   '<div class="dock stk">'+(valid&&nextC||qn&&nextC?'<button class="zbtn pri wide two-l" id="nx"><b>'+(qn?'Next game':'Next suggestion')+'</b><small>'+(qn?'Game '+(CTX.i+2)+' of '+qn.n+': ':'')+esc(nextC.title)+'</small></button>':'')+'<div class="dock2"><button class="zbtn '+(valid&&nextC?'ghost':'pri')+'" id="ag">'+(valid?'Play again':'Try again')+'</button><button class="zbtn ghost" id="dn">Done for now</button></div></div></div>',true,{back:backFromResult});
  $('dtb').onclick=function(){var o=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',!o);$('dtp').hidden=o};
  ceremony(valid,isBest,v,fmt);if(valid&&c.std)showPct(c.stage,'pctl');
  $('bk').onclick=backFromResult;$('dn').onclick=function(){zc('done_tap');if(CTX&&CTX.set&&!more&&!CTX.first)finishToday();else backFromResult()};$('ag').onclick=function(){zc('again_tap');play(cid,{instant:1})};
  if($('nx'))$('nx').onclick=function(){zc('next_tap');if(more){stepTo(CTX.i+1)}else{CTX=CTX&&CTX.first?{from:home}:CTX;nextC.pz?playPuzzle(nextC.pz,pzNext(nextC.pz),{zen:!!db().st.pzzen}):play(nextC.c.id)}};
  if($('sh'))$('sh').onclick=function(){shareResult(c,s,v)};maybeStop()}
function d0runs(){return db().runs.length}
function milestone(n){return [10,50,100,250,500,1000].indexOf(n)>=0?n:0}
function needYours(){var d=db();return !!(d.p&&d.p.done&&d.p.yours===0)}
function backFromResult(){if(needYours()){CTX=null;makeYours();return}goOrigin()}
function finishToday(){
  newRun();var n=(db().done[todayStr()]||[]).length+(CTX&&CTX.set?CTX.set.filter(function(x){return String(x.id).indexOf('pz:')===0&&itemDone(x.id)}).length:0),qm=CTX&&CTX.queue;if(!qm)zc('set_finished');var dnum=dayNum(),ddone=cotdDone(cotd(todayStr()));CTX=null;
  show('<div class="ready" style="padding-top:40px;text-align:center"><div class="zcomp" data-zc="idle" style="margin:0 auto 6px"></div><span class="sico big" id="dck" style="--c:var(--ok);border-radius:50%;margin:0 auto 14px">'+icoSize('check',36)+'</span><h1 class="rt">'+(qm?'That was your '+plural(qm.mins,'minute'):'Done for today')+'</h1><p>'+(qm?plural(qm.n,'game')+' finished. Stop whenever you like.':plural(n,'challenge')+' finished.'+(ddone?' Challenge of the day #'+dnum+' done. #'+(dnum+1)+' arrives tomorrow.':''))+'</p>'+
   '<p class="sm">Come back whenever you like. A missed day costs you nothing.</p><div class="dock stk"><button class="zbtn pri wide" id="hm">Back to today</button></div></div>',true,{back:home});
  if(typeof ZD!=='undefined'){ZD.sound(qm?'round':'daily');ZD.haptic('best');if(ZD.comps[0])ZD.comps[0].cheer();ZD.pop($('dck'),'daily')}
  $('hm').onclick=function(){if(needYours())makeYours();else home()}}

/* ---------- age rules: the safe choice is always offered first; nothing is deleted without saying exactly what ---------- */
function minorAge(a){return a==='13 to 17'||a==='Under 13'}
var BLOCKED=false;
function blockedScreen(){BLOCKED=true;newRun();musicStop();var pend=lsJson(LS_PEND);
  show('<div class="ready"><h1 class="rt">Zest is for ages 13 and over</h1><p>You told us you are under 13, so Zest cannot be used on this phone. We have removed what Zest had saved here, and the app will stay closed.</p>'+
   (pend?'<p class="sm">We could not remove your cloud copy yet. Zest will try again whenever it opens with a connection. You can also email <b>'+CONTACT+'</b> and we will delete it.</p><div class="dock"><button class="zbtn ghost wide" id="rt">Try again now</button></div>':'<p class="sm">Nothing about you has been kept. If you picked this by mistake, a parent or carer can email us at <b>'+CONTACT+'</b>.</p>')+'</div>',true);
  if($('rt'))$('rt').onclick=async function(){this.disabled=true;await runPending();blockedScreen()}}
async function blockUnder13(o){o=o||{};var d=db(),tok=d.st.session;
  lsSet(LS_BLOCK,JSON.stringify({t:Date.now(),src:o.src||'self'}));
  if(tok&&o.cloud!==false)lsSet(LS_PEND,JSON.stringify({kind:'account',tok:tok,t:Date.now()}));
  ['zv4','zv4.bak','zv4.corrupt'].forEach(lsDel);OB={goals:[],mins:5,hand:'R',age:null};CTX=null;blockedScreen();
  if(lsJson(LS_PEND))runPending().then(function(){if(BLOCKED)blockedScreen()})}
function u13Body(){var d=db();return '<p>This will delete everything Zest has saved on this phone: your scores and your settings.'+((d.st.session||d.st.share)?' It will also delete your cloud copy and your entries in the rankings.':'')+'</p><p>Zest is for ages 13 and over, so you will not be able to use it on this phone afterwards.</p>'}
function teenBody(){return '<p>Cloud copies and rankings are for adults. Choosing 13 to 17 will delete your cloud copy of your progress, and your scores in the rankings.</p><p>Your scores on this phone stay, and you can keep playing.</p>'}
function commitAge(age){var d=db();if(!d.p){ensureProfile();d=db()}d.p.age=age;d.p.mt=Date.now();if(d.st.ageSrc)delete d.st.ageSrc;sv(d);scheduleSync()}
/* onCancel runs when the player backs out, so a screen can show the saved age again */
function applyAge(age,after,onCancel){var d=db();onCancel=onCancel||function(){};
  if(age==='Under 13'){dialog('Delete everything and stop using Zest?',u13Body(),[['Cancel',onCancel],['Delete and stop using Zest',function(){blockUnder13({src:'self'})},'danger']]);return}
  if(age==='13 to 17'&&(d.st.session||d.st.share)){dialog('Keep Zest on this phone only?',teenBody(),[['Cancel',onCancel],['Delete cloud copy and rankings',function(){commitAge(age);deleteCloud('account',after)},'danger']]);return}
  commitAge(age);putAge(age).then(function(){after&&after()})}

/* ---------- terms ---------- */
function acceptTerms(){var d=db();d.st.terms={v:TERMS_VERSION,t:Date.now()};sv(d)}
function termsNeeded(){var t=db().st.terms;return !t||t.v!==TERMS_VERSION}
function termsScreen(){newRun();
  show('<div class="q"><h1>Our terms have changed</h1><p>We updated the <a href="'+TERMS_URL+'" target="_blank" rel="noopener">Terms of use</a> and the <a href="'+PRIVACY_URL+'" target="_blank" rel="noopener">Privacy policy</a>. Please read them and agree to keep using Zest. Your progress is safe either way.</p></div><div class="dock stk"><button class="zbtn pri wide" id="c">Agree and continue</button></div>',true);
  $('c').onclick=function(){acceptTerms();home()}}

/* ---------- onboarding: agree, then play one round. The rest comes after, and can be skipped ---------- */
function steps(n,of){return '<div class="steps" role="progressbar" aria-valuemin="1" aria-valuemax="'+of+'" aria-valuenow="'+n+'" aria-valuetext="Step '+n+' of '+of+'" aria-label="Step '+n+' of '+of+'">'+Array.apply(null,Array(of)).map(function(_,i){return '<i class="'+(i<n?'on':'')+'"></i>'}).join('')+'</div>'}
function ensureProfile(){var d=db();if(!d.p||!d.p.done){var pa=d.st.pendingAge;d.p={mt:Date.now(),goals:['fun'],mins:5,hand:'R',age:pa||null,done:1,start:todayStr(),yours:0};delete d.st.pendingAge;sv(d)}return db().p}
function startFirst(){ensureProfile();CTX={first:1,from:home};play('timing:std')}
/* the Zest mark, "Story slice": half a citrus that is also an open book (source: ~/dev/brand/zest/story-slice-mark.svg) */
var ZEST_MARK='<svg class="zmark" viewBox="0 0 108 108" aria-hidden="true"><rect width="108" height="108" rx="24" fill="#E8590C"/><g transform="translate(54 54) scale(1.05) translate(-54 -53)"><path d="M22 50h64a32 32 0 0 1-64 0z" fill="#F7F4EE" stroke="#1B1916" stroke-width="3.2" stroke-linejoin="round"/><path d="M28 50h52a26 26 0 0 1-52 0z" fill="#F7A35C" stroke="#1B1916" stroke-width="2.2" stroke-linejoin="round"/><g stroke="#1B1916" stroke-width="2.2" stroke-linecap="round"><path d="M54 50v26M54 50L36 68M54 50l18 18M54 50L30 58M54 50l24 8"/></g><path d="M54 50c-6-8-18-12-30-10M54 50c6-8 18-12 30-10" fill="none" stroke="#1B1916" stroke-width="3" stroke-linecap="round"/><path d="M54 50V30" stroke="#1B1916" stroke-width="2.6" stroke-linecap="round"/><path d="M54 31c2-6 8-9 13-8-2 6-7 9-13 8z" fill="#6E9B5A" stroke="#1B1916" stroke-width="2" stroke-linejoin="round"/></g></svg>';
function wordmark(){return '<div class="wm" aria-hidden="true">'+ZEST_MARK+'<span>Zest</span></div>'}
function welcomeClip(){return '<svg class="clip" viewBox="0 0 300 120" role="img" aria-label="A short loop of the Timing game: a dot slides along a track, you tap as it reaches the line, and it says Spot on."><rect x="6" y="36" width="288" height="48" rx="14" class="ctrk"/><line x1="226" y1="28" x2="226" y2="92" class="cln"/><circle class="cdot" cx="226" cy="60" r="12"/><circle class="crip" cx="226" cy="60" r="12"/><text class="cspot" x="150" y="18" text-anchor="middle">Spot on</text></svg>'}
function onboard(step){
  newRun();if(step>=1){makeYours();return}
  show('<div class="wel">'+steps(1,2)+wordmark()+welcomeClip()+'<h1 class="rt">Short games. A fresh puzzle every day.</h1><p>Play for a few minutes, then try to beat your own best.</p></div><div class="dock stk"><button class="zbtn pri wide" id="c">Agree and continue</button><p class="fine terms">By continuing you confirm you are 13 or over and agree to the <a href="'+TERMS_URL+'" target="_blank" rel="noopener">Terms</a> and the <a href="'+PRIVACY_URL+'" target="_blank" rel="noopener">Privacy Policy</a>. Zest is a game for entertainment, not a medical device. Your answers stay on this phone.</p><button class="lnk" id="si">I already use Zest. Sign in</button></div>',true);
  $('c').onclick=function(){acceptTerms();zc('onb_agree');startFirst()};
  $('si').onclick=function(){acceptTerms();signinScreen()}}
/* a radio group: one tab stop, arrow keys move the choice */
function bindRadios(root,sel,onPick){var items=[].slice.call(root.querySelectorAll(sel));
  function pick(b,focus){items.forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-checked',on);x.tabIndex=on?0:-1});if(focus)b.focus();onPick(b)}
  items.forEach(function(b,i){b.onclick=function(){pick(b,false)};b.onkeydown=function(e){var k=e.key,n=k==='ArrowDown'||k==='ArrowRight'?1:k==='ArrowUp'||k==='ArrowLeft'?-1:0;if(!n)return;e.preventDefault();pick(items[(i+n+items.length)%items.length],true)}})}
function radios(label,id,list,cur,attr){return '<div class="grp" id="'+id+'">'+label+'</div><div class="radios" role="radiogroup" aria-labelledby="'+id+'">'+list.map(function(x,i){var v=Array.isArray(x)?x[0]:x,t=Array.isArray(x)?x[1]:x,on=String(cur)===String(v);return '<button class="rad'+(on?' on':'')+'" role="radio" aria-checked="'+on+'" tabindex="'+((on||(cur==null&&i===0))?0:-1)+'" data-'+attr+'="'+esc(v)+'"><span class="dotr"></span>'+esc(t)+'</button>'}).join('')+'</div>'}
function ageRadios(cur){return radios('Which of these includes your age?','agelab',AGEOPTS,cur,'a')}
function makeYours(){
  newRun();var d=db(),p=d.p||ensureProfile();OB={goals:(p.goals||[]).filter(function(g){return g!=='fun'}),mins:p.mins||5,hand:p.hand||'R',age:p.age||null};
  show('<div class="q"><div><button class="back" id="bk">'+ico('back')+' Back</button></div>'+steps(2,2)+'<h1>Make Zest yours</h1><p>All of this is optional. You can change it later in Settings.</p></div>'+
   '<div class="grp" style="margin-top:0">What do you feel like playing? Pick any.</div>'+GOALS.map(function(g){var on=OB.goals.indexOf(g.id)>=0;return '<button class="opt'+(on?' on':'')+'" data-g="'+g.id+'" aria-pressed="'+on+'"><span><b>'+esc(g.name)+'</b><span class="s2">'+esc(g.sub)+'</span></span><span class="tick">'+icoSize('check',16)+'</span></button>'}).join('')+
   radios('How much time a day?','minlab',[[3,'3 minutes'],[5,'5 minutes'],[10,'10 minutes']],OB.mins,'m')+ageRadios(OB.age)+radios('Tapping hand','handlab',[['R','Right'],['L','Left']],OB.hand,'h')+
   '<p class="fine">Your first few rounds set your starting point. Zest compares you with yourself, never with a score out of 100.</p><div class="dock stk"><button class="zbtn pri wide" id="c">Save</button><button class="zbtn ghost wide" id="skp">Skip for now</button></div>',true,{back:skipYours});
  scr.querySelectorAll('.opt[data-g]').forEach(function(b){b.onclick=function(){var g=b.dataset.g,i=OB.goals.indexOf(g);if(i>=0)OB.goals.splice(i,1);else OB.goals.push(g);b.classList.toggle('on');b.setAttribute('aria-pressed',i<0)}});
  bindRadios($('minlab').nextElementSibling,'[data-m]',function(b){OB.mins=+b.dataset.m});bindRadios($('agelab').nextElementSibling,'[data-a]',function(b){OB.age=b.dataset.a});bindRadios($('handlab').nextElementSibling,'[data-h]',function(b){OB.hand=b.dataset.h});
  $('bk').onclick=skipYours;$('skp').onclick=skipYours;$('c').onclick=saveYours}
function skipYours(){var d=db();if(d.p&&d.p.yours===0){d.p.yours=1;sv(d)}home()}
function saveYours(){
  function commit(){var d=db(),p=d.p;delete p.name;p.goals=OB.goals.length?OB.goals:['fun'];p.mins=OB.mins;p.hand=OB.hand;p.yours=1;p.mt=Date.now();sv(d);hand.classList.toggle('lefty',p.hand==='L');d.set={};sv(d);home()}
  if(OB.age&&OB.age!==(db().p||{}).age)applyAge(OB.age,commit,function(){});else commit()}

/* ---------- today: the daily, your set, this week ---------- */
var DAYN=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
function signed(n){return n>0?'+'+n:n<0?'−'+Math.abs(n):'0'}
function weekStrip(d){var now=new Date(),dow=(now.getDay()+6)%7,mon=new Date(now.getFullYear(),now.getMonth(),now.getDate()-dow),played={};d.runs.forEach(function(r){played[ds(r.t)]=1});var n=0,cells='';
  for(var i=0;i<7;i++){var dt=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+i),k=ds(dt),on=played[k];if(on)n++;
    cells+='<li><span class="sr">'+DAYN[i]+(i===dow?' (today)':'')+', '+(on?'played':i>dow?'not yet':'not played')+'</span>'+(on?'<i aria-hidden="true" class="on'+(i===dow?' td':'')+'">'+icoSize('check',16)+'</i>':'')+'</li>'}return {cells:cells,n:n}}   // only played days are drawn; the others are plain space, with text for all seven
function statusMark(on){return '<span class="st'+(on?' on':'')+'" aria-hidden="true">'+icoSize(on?'check':'chev',on?16:18)+'</span><span class="sr">'+(on?'Done':'Not done')+'</span>'}
function home(){
  if(typeof friendResume==='function'&&friendResume())return;
  newRun();setTab('today');if(lsGet(LS_BLOCK)){blockedScreen();return}
  var d=db();if(!d.p||!d.p.done){onboard(0);return}if(termsNeeded()){termsScreen();return}
  hand.classList.toggle('lefty',d.p.hand==='L');var set=getSet().filter(function(x){return itemInfo(x.id)}),dn=set.filter(function(x){return itemDone(x.id)}).length,wk=weekStrip(d),dc=cotd(todayStr()),dcDone=cotdDone(dc);
  var dt=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'}),setMin=Math.max(1,Math.round(set.reduce(function(a,x){return a+itemInfo(x.id).secs},0)/60));
  var sets=function(){return set.map(function(x){return {id:x.id}})};
  var sky=typeof ZD!=='undefined'?ZD.sky():'day',hr=typeof ZD!=='undefined'?ZD.getHour():new Date().getHours(),pp=clamp((hr-5)/14,0,1),sx=sky==='night'?190:Math.round(10+pp*180),sy=sky==='night'?50:Math.round(46+22*(1-Math.sin(Math.PI*pp))),
    greet=(hr>=5&&hr<12?'Good morning':hr>=12&&hr<17?'Good afternoon':'Good evening')+'',
    startSet=function(){var i=0;for(;i<set.length;i++)if(!itemDone(set[i].id))break;if(i>=set.length)i=0;if(dn===0)zc('set_started');CTX={set:sets(),i:i,from:home};stepTo(i)},
    gdLabel=!dcDone?'Start':'Play it again',dkind=dc.kind==='p'?'Puzzle. Level '+dc.level+'. ':'Game. ';
  show('<div class="dh"><div><h1 class="z">Today</h1><small>'+dt+'</small><p class="greet">'+greet+'</p></div><button class="ibtn" id="mt" aria-label="Music" aria-pressed="'+!!d.st.music+'">'+ico(d.st.music?'music':'musicoff')+'</button></div>'+
   ''+(WB?'<p class="sm wb" role="status">Welcome back. Good to see you.</p>':'')+'<section class="zcard hero sky s-'+sky+(dcDone?' calm':'')+'" aria-label="Challenge of the day"><i class="sun" aria-hidden="true" style="transform:translate('+sx+'px,'+sy+'px)"></i><div class="fk"><span>Challenge of the day #'+dayNum()+'</span><span>'+secText(dc.secs)+'</span></div><div class="cen"><div class="zcomp" data-zc="auto"></div><h2 class="hn">'+esc(dc.name)+'</h2><p class="sm">'+dkind+esc(dc.desc)+'</p><p class="sm same">Same challenge for everyone today.</p></div><button class="zbtn pri wide big" id="gd">'+gdLabel+'</button>'+(dcDone?'<p class="sm donel" role="status">'+icoSize('check',16)+' Challenge of the day #'+dayNum()+' done. #'+(dayNum()+1)+' arrives tomorrow.</p>':'')+'</section>'+
   reelTeaser()+'<section class="zcard" aria-label="Your set"><div class="fk"><span>Your set</span><span>about '+plural(setMin,'min')+'</span></div>'+set.map(function(x,i){var it=itemInfo(x.id),on=itemDone(x.id);return '<button class="slot" data-i="'+i+'">'+itemIcon(it)+'<span class="t"><b>'+esc(it.title)+'</b><span class="d">'+esc(it.desc)+'</span><span class="meta"><span class="pill'+(x.shared?' sh':'')+'">'+esc(x.tag)+'</span> '+secText(it.secs)+'</span></span>'+statusMark(on)+'</button>'}).join('')+
   '<button class="zbtn '+'ghost'+' wide" id="go" style="margin-top:8px">'+(dn===0?'Start your set':dn<set.length?'Continue your set':'Play your set again')+'</button></section>'+
   '<section class="zcard" aria-label="This week"><div class="fk"><span>This week</span><span class="num">'+wk.n+' of 7 days</span></div><ul class="wk">'+wk.cells+'</ul><div class="sm">Play when you like. Rest days are fine.</div></section>'+
   '<button class="rowlink" id="parch"><span class="rl">Past dailies</span><span class="rv sm">Missed days are always open</span><span class="chv" aria-hidden="true">'+ico('chev')+'</span></button>'+
      (needYours()?'<button class="rowlink" id="mky"><span class="rl">Make Zest yours</span><span class="rv sm">Goals and time</span><span class="chv" aria-hidden="true">'+ico('chev')+'</span></button>':'')+
   (!signedIn()&&canSync(d.p)&&!d.st.nosave&&d.runs.length>=3&&!d.st.demo?'<div class="nudge" id="nudge"><b>Keep your progress safe.</b> <span class="sm">Sign in with Google to keep it on all your devices.</span><div class="chips"><button class="chip" id="ng">Sign in</button><button class="chip" id="nn">Not now</button></div></div>':''));
  $('gd').onclick=function(){cotdPlay(todayStr(),false)};
  $('go').onclick=startSet;
  $('parch').onclick=archive;if($('pzd'))$('pzd').onclick=function(){pzDayPlay(todayStr(),false)};reelTeaserWire();
  scr.querySelectorAll('.slot').forEach(function(b){b.onclick=function(){var i=+b.dataset.i;CTX={set:sets(),i:i,from:home};stepTo(i)}});
  if($('ng'))$('ng').onclick=settings;if($('nn'))$('nn').onclick=function(){var dd=db();dd.st.nosave=1;sv(dd);home()};if($('mky'))$('mky').onclick=makeYours;
  $('mt').onclick=function(){var dd=db();dd.st.music=dd.st.music?0:1;sv(dd);gestured=true;musicSync();this.setAttribute('aria-pressed',!!dd.st.music);this.innerHTML=ico(dd.st.music?'music':'musicoff')}}

/* ---------- challenges: a pinned daily, shelves, and a browse list ---------- */
function chList(){return CH.filter(function(c){return !c.daily&&!c.std})}
function stats(){var cs={},cc={},last={};db().runs.forEach(function(r){if(r.flag)return;cs[r.s]=(cs[r.s]||0)+1;cc[r.c]=(cc[r.c]||0)+1;last[r.c]=r.t});return {s:cs,c:cc,last:last}}
/* the recommender: only your own plays, and every card says why in plain facts. pickList is the games part (standard versions of the nine kept games). */
function pickList(){return libPicks().filter(function(it){return it.g&&gStd(it.g)}).map(function(it){return {c:gStd(it.g),why:it.why}})}
function nextSug(cid){var cur=(ch(cid)||{}).stage,l=libPicks().filter(function(x){return x.g!==cur});return l.length?itemInfo(l[0].p?'pz:'+l[0].p:l[0].g+':std'):null}
/* ---------- the Challenges tab: unique puzzles and the Zest games, by family ---------- */
function aboutOf(id){return typeof ABOUT!=='undefined'&&ABOUT[id]||null}
function pzCalm(p){return p.calm!==undefined?!!p.calm:(p.undo!==false&&!p.timed&&!p.clock)}   // calm: no clock pressure
function gStd(sid){return ch(sid+':std')}
function gSecs(sid){var c=gStd(sid);return c?estSec(c):90}
function lastPz(id){return ((db().st.pzlast)||{})[id]||0}
function famIds(fid){return pzOn()?PUZZLE_ORDER.filter(function(id){return pzTheme(id).id===fid}):[]}
function famGames(fid){return keptStages().filter(function(g){return (gameTheme(g.id)||{}).id===fid}).map(function(g){return g.id})}
function gamesTried(ids){var st=stats().s;return ids.filter(function(g){return st[g]}).length}
function famTried(ids){var z=pzData();return ids.filter(function(id){return z[id]}).length}
function itKey(it){return it.p||it.g||'aim'}
function itSecs(it){return it.p?(PUZZLES[it.p].secs||90):gSecs(it.g)}
function gcard(sid,why){var s=stage(sid),c=gStd(sid),rs=stdRuns(sid,curPace()),vs=rs.map(function(r){return r.v});
  return '<button class="lc" data-g="'+esc(sid)+'"><span class="lct">'+iconBox(sid)+(rs.length?'':'<span class="new">New</span>')+'</span><b>'+esc(s.name)+'</b><span class="lm">Game · '+(c?estText(c):'about 1 min')+'</span>'+(why?'<em class="why">'+esc(why)+'</em>':'')+(vs.length?'<em class="num best">Best '+bestOf(sid,vs)+' '+esc(s.unit)+'</em>':'')+'</button>'}
function libPicks(){var st=stats(),z=pzData(),out=[],used={};
  function add(it,why){var k=itKey(it);if(used[k]||out.length>=8)return;used[k]=1;it.why=why;out.push(it)}
  keptStages().filter(function(s){return !st.s[s.id]}).slice(0,3).forEach(function(s){add({g:s.id},'You have not tried this game yet')});
  if(pzOn()){PUZZLE_ORDER.filter(function(id){var e=z[id];return e&&(e.lvl||1)<PUZZLES[id].levels&&Object.keys(e.best||{}).length}).slice(0,2).forEach(function(id){add({p:id},'You are on level '+z[id].lvl+' of '+PUZZLES[id].levels)});
    FAMILIES.map(function(f){var ids=famIds(f.id);return {f:f,ids:ids,t:famTried(ids)}}).filter(function(x){return x.ids.length&&x.t<x.ids.length}).sort(function(a,b){return a.t/a.ids.length-b.t/b.ids.length}).slice(0,3).forEach(function(x){
      var id=x.ids.filter(function(i){return !z[i]})[0];add({p:id},x.t?'You have tried '+x.t+' of '+x.ids.length+' in '+x.f.name:'You have not tried '+x.f.name+' yet')})}
  keptStages().sort(function(a,b){return (st.s[a.id]||0)-(st.s[b.id]||0)}).forEach(function(s){add({g:s.id},'You have played this '+plural(st.s[s.id]||0,'time'))});
  return out}
function shelfData(){var P=pzOn()?PUZZLE_ORDER:[],all=P.map(function(id){return {p:id,why:null}}).concat(keptStages().map(function(s){return {g:s.id,why:null}})),
  rec=all.map(function(it){return {it:it,t:it.p?lastPz(it.p):lastAt(it.g)}}).filter(function(x){return x.t}).sort(function(a,b){return b.t-a.t});
  return [{k:'picks',t:'Picked for you',items:libPicks()},pzNewShelf(),
   {k:'short',t:'Under a minute',items:all.filter(function(it){return itSecs(it)<=60}).sort(function(a,b){return itSecs(a)-itSecs(b)})},
   {k:'calm',t:'Calm',items:all.filter(function(it){return it.p?pzCalm(PUZZLES[it.p]):(gStd(it.g)||{}).tier==='Calm'})},
   {k:'recent',t:'Played recently',items:rec.slice(0,12).map(function(x){x.it.why='Last played '+agoText(x.t);return x.it})}].filter(function(s){return s&&s.items.length})}
function lcard(it){
  if(it.p)return pcard(it.p,it.why);if(it.g)return gcard(it.g,it.why);
  return ''}
var INFOBACK=null;
function wireCards(root,back){root.querySelectorAll('.lc').forEach(function(b){b.onclick=function(){INFOBACK=back||null;b.dataset.p?infoPage(b.dataset.p):b.dataset.g?infoPage(b.dataset.g):aim()}})}
function famCard(f){var ids=famIds(f.id),gs=famGames(f.id),n=ids.length+gs.length,t=famTried(ids)+gamesTried(gs);
  return '<button class="fcard" data-fam="'+f.id+'" data-n="'+n+'" data-np="'+ids.length+'" data-ng="'+gs.length+'" data-tried="'+t+'"><b>'+esc(f.name)+'</b><span class="fb">'+esc(f.blurb)+'</span><span class="fnum num">'+(n?plural(n,'challenge')+' · '+t+' tried':'None yet')+'</span></button>'}
function shelfHtml(sh){var it=sh.items.slice(0,8);return '<section aria-labelledby="sh-'+sh.k+'"><div class="shh"><h2 class="sh" id="sh-'+sh.k+'">'+esc(sh.t)+'</h2><button class="lnk" data-all="'+sh.k+'" aria-label="See all: '+esc(sh.t)+'">See all</button></div><div class="shelf">'+it.map(lcard).join('')+'</div></section>'}
function libSearch(qs){var q=qs.trim().toLowerCase().split(/\s+/).filter(Boolean),out=[];if(!q.length)return null;
  function ok(h){h=h.toLowerCase();return q.every(function(w){return h.indexOf(w)>=0})}
  if(pzOn())PUZZLE_ORDER.forEach(function(id){var p=PUZZLES[id],a=aboutOf(id);if(ok(p.name+' '+p.blurb+' '+(a?a.from:'')))out.push({p:id})});
  keptStages().forEach(function(s){var a=aboutOf(s.id);if(ok(s.name+' '+(s.label||'')+' '+s.what+' '+(a?a.from:'')))out.push({g:s.id})});
  return out}
function renderSearch(){var el=$('browse'),main=$('libmain');if(!el)return;var r=libSearch(LIBQ);main.hidden=!!r;
  if(!r){el.innerHTML='';return}
  el.innerHTML=r.length?'<div class="lib">'+r.map(lcard).join('')+'</div><p class="sm" role="status" style="margin:10px 0 0">'+plural(r.length,'result')+'.</p>':'<div class="empty" role="status"><p>Nothing matches “'+esc(LIBQ.trim())+'”.</p><button class="chip" id="clr">Clear search</button></div>';
  wireCards(el);if($('clr'))$('clr').onclick=function(){LIBQ='';$('q').value='';renderSearch()}}
function library(){
  newRun();setTab('lib');var dc=cotd(todayStr()),dcDone=cotdDone(dc),di=itemInfo(dc.kind==='p'?'pz:'+dc.id:dc.id),sd=shelfData(),A=sd.filter(function(s){return s.k==='picks'||s.k==='pznew'}),B=sd.filter(function(s){return A.indexOf(s)<0});
  show('<h1 class="s">Challenges</h1><p class="tag">Puzzles with a story behind them, and a few games. A new challenge every day.</p>'+
   '<label class="sr" for="q">Search challenges</label><input id="q" class="inp" type="search" placeholder="Search challenges" autocomplete="off" value="'+esc(LIBQ)+'"><div id="browse" style="margin-top:12px"></div><div id="libmain">'+
   '<button class="zcard pinned" id="pd">'+(di?itemIcon(di):'')+'<span class="t"><span class="fk" style="justify-content:flex-start;gap:8px">Challenge of the day <span class="pill sh">Same for everyone</span></span><b>'+esc(dc.name)+'</b><span class="sm">'+secText(dc.secs)+(dcDone?' · Done today':'')+'</span></span><span class="chv" aria-hidden="true">'+ico('chev')+'</span></button>'+
   A.map(shelfHtml).join('')+
   '<button class="rowlink" id="tofam" style="margin-top:18px"><span class="rl">Browse by family</span><span class="rv sm">Ten families of puzzles and games</span><span class="chv" aria-hidden="true">'+ico('chev')+'</span></button>'+
   B.map(shelfHtml).join('')+'</div>');
  $('q').oninput=function(){LIBQ=this.value;renderSearch()};
  $('pd').onclick=function(){cotdPlay(todayStr(),false)};$('tofam').onclick=families;
  scr.querySelectorAll('[data-all]').forEach(function(b){b.onclick=function(){shelfAll(b.dataset.all)}});
  wireCards($('libmain'));renderSearch()}
/* ---------- the Families tab: the ten families, each with its puzzles and games ---------- */
function families(){newRun();setTab('fam');
  show('<h1 class="s">Families</h1><p class="tag">Puzzles and games, grouped by what they ask of you.</p><div class="fgrid" id="fgrid">'+FAMILIES.map(famCard).join('')+'</div>');
  scr.querySelectorAll('.fcard').forEach(function(b){b.onclick=function(){familyPage(b.dataset.fam)}})}
function shelfAll(k){newRun();setTab('lib');var sh=shelfData().filter(function(x){return x.k===k})[0];if(!sh){library();return}
  show('<div><button class="back" id="bk">'+ico('back')+' Challenges</button></div><h1 class="s">'+esc(sh.t)+'</h1><p class="tag">'+plural(sh.items.length,'item')+'.</p><div class="lib">'+sh.items.map(lcard).join('')+'</div>',true,{back:library});
  $('bk').onclick=library;wireCards(scr,function(){shelfAll(k)})}
/* a family: its puzzles as cards; over 12, grouped by the puzzle's `sub` (or sets of 12 in order), all on one page */
function familyPage(fid){var f=FAMILIES.filter(function(x){return x.id===fid})[0];if(!f){families();return}newRun();setTab('fam');var ids=famIds(fid),gs=famGames(fid),n=ids.length+gs.length,t=famTried(ids)+gamesTried(gs),body='';
  function grid(a){return '<div class="lib">'+a.map(function(x){return x.g?gcard(x.g):pcard(x.p)}).join('')+'</div>'}
  var items=ids.map(function(id){return {p:id}}).concat(gs.map(function(g){return {g:g}}));
  if(n<=12)body=grid(items);else{var g=[],ix={};ids.forEach(function(id,i){var k=PUZZLES[id].sub||('Puzzles '+(Math.floor(i/12)*12+1)+' to '+Math.min(ids.length,Math.floor(i/12)*12+12));if(!ix[k]){ix[k]=[];g.push(k)}ix[k].push({p:id})});if(gs.length){g.unshift('Games');ix.Games=gs.map(function(x){return {g:x}})}body=g.map(function(k){return '<h2 class="sh" style="margin-top:18px">'+esc(k)+'</h2>'+grid(ix[k])}).join('')}
  show('<div><button class="back" id="bk">'+ico('back')+' Families</button></div><h1 class="s">'+esc(f.name)+'</h1><p class="tag">'+esc(f.blurb)+'</p><p class="sm" id="fprog" role="status">'+(n?'You have tried '+t+' of '+n+'.':'Challenges for this family are on their way.')+'</p>'+body,true,{back:families});
  $('bk').onclick=families;wireCards(scr,function(){familyPage(fid)})}
/* ---------- the story page: one for every puzzle and game ---------- */
function infoLinks(id){var a=aboutOf(id),st=window.STORY&&STORY[id],seen={},out=[];((st&&st.links)||[]).concat((a&&a.links)||[]).forEach(function(l){if(l&&l.u&&!seen[l.u]){seen[l.u]=1;out.push(l)}});return out}
function infoBack(){var b=INFOBACK;if(b)b();else TAB==='fam'?families():library()}
function infoPage(id){var p=pzGet(id),s=p?null:stage(id);if(!p&&!s||s&&!isKept(id)){library();return}newRun();setTab(TAB==='fam'?'fam':'lib');CTX=null;
  var a=aboutOf(id),art=window.ART&&ART[id],fam=p&&pzFam(p),name=p?p.name:s.name,hook=(art&&art.hook)||(p?p.blurb:s.what),stz=window.STORY&&STORY[id]&&STORY[id].paras&&STORY[id].paras.length?STORY[id]:null,links=infoLinks(id),
    big='<span class="sico big" style="--c:var('+(p?fam.col:s.col)+')">'+(p?ico(fam.ic):gico(id,36))+'</span>',
    hero=art?'<div class="arthero" aria-hidden="true">'+art.hero+(art.cap?'<span class="cap">'+esc(art.cap)+'</span>':'')+'</div>':'<div class="arthero fb" aria-hidden="true">'+big+'</div>',
    paras=stz?stz.paras:(a&&a.from?[a.from+(a.research?' '+a.research:'')]:[p?p.how:s.what]),fact=stz&&stz.fact?stz.fact:'',mid=Math.max(1,Math.floor(paras.length/2)),
    story='<div class="storyb poster" id="stb"><p class="story tease" id="stz">'+esc(paras[0])+'</p><div class="more" id="smore" hidden>'+paras.map(function(x,i){return (i===0?'':'<p class="story">'+esc(x)+'</p>')+(fact&&i===mid-1?'<aside class="worth"><b>Worth knowing</b><span>'+esc(fact)+'</span></aside>':'')}).join('')+'</div>'+(paras.length>1||fact||paras[0].length>90?'<button class="lnk rdm" id="srd" aria-expanded="false" aria-controls="smore">Read the story</button>':'')+'</div>';
  show('<div class="poster-top"><button class="back ovl" id="bk">'+ico('back')+' Back</button>'+hero+'<h1 class="s ptitle" id="ittl">'+esc(name)+'</h1></div><div class="psheet"><p class="hook">'+esc(hook)+'</p>'+(s?'<p class="pctl" id="pctl" role="status"></p>':'')+story+'</div>'+
   '<div class="dock stk info"><div class="dock2"><button class="zbtn ghost" id="idemo">See demo</button><button class="zbtn pri" id="ist" style="flex:2">Start</button></div>'+(p?'<button class="lnk" id="ilv">Levels and Zen</button>':'')+
   '<p class="quiet">'+(links.length?'<button class="lnk" id="isrc">Sources</button> · ':'')+'<button class="lnk" data-flag="'+esc(id)+'">Report a mistake</button></p></div>',true,{back:infoBack});
  $('bk').onclick=infoBack;if(s)showPct(id,'pctl');
  if($('srd'))$('srd').onclick=function(){var m=$('smore'),o=m.hidden;m.hidden=!o;$('stz').classList.toggle('open',o);this.setAttribute('aria-expanded',o);this.textContent=o?'Show less':'Read the story'};
  $('ist').onclick=function(){p?pzStart(id):gameStart(id)};
  $('idemo').onclick=function(){p?pzHow(id):gameDemo(id)};
  if($('ilv'))$('ilv').onclick=function(){pzLadder(id)};
  if($('isrc'))$('isrc').onclick=function(){dialog('Sources','<ul style="margin:0;padding-left:18px;text-align:left">'+links.map(function(l){return '<li style="margin:6px 0"><a href="'+esc(l.u)+'" target="_blank" rel="noopener">'+esc(l.t)+'</a></li>'}).join('')+'</ul>',[['Close',function(){}]],{esc:1})}}
function gameStart(sid){CTX={from:library};play(sid+':std')}
async function gameDemo(sid){var c=gStd(sid);if(!c){return}var t=newRun();CTX={from:function(){infoPage(sid)}};
  show(shell().replace('<div class="cap"',demoBar()+'<div class="cap"'),'round',{back:function(){infoPage(sid)}});wireX();wireDemo(c.id);
  $('dr').onclick=function(){gameDemo(sid)};$('sk').onclick=function(){infoPage(sid)};
  await runGame(sid,{auto:true,rx:curRx()});if(t!==run.id)return;infoPage(sid)}
/* where a game comes from, and what researchers have used it for: plain facts from about.js, never a claim of benefit */
function aboutLinks(a){return (a.links||[]).map(function(l){return '<a href="'+esc(l.u)+'" target="_blank" rel="noopener">'+esc(l.t)+'</a>'}).join(' · ')}
function researchDialog(){if(typeof RESEARCH_TEXT==='undefined')return;dialog('What the research says','<p>'+esc(RESEARCH_TEXT)+'</p>',[['Sources',function(){sourcesDialog()}],['Close',function(){}]],{esc:1})}
function sourcesDialog(){if(typeof SOURCES==='undefined')return;
  var h='<div style="max-height:55vh;overflow-y:auto;text-align:left">'+SOURCES.map(function(g){return '<div class="lab" style="margin:10px 0 4px">'+esc(g.g)+'</div><ul style="margin:0;padding-left:18px">'+g.items.map(function(i){return '<li style="margin:4px 0"><a href="'+esc(i.u)+'" target="_blank" rel="noopener">'+esc(i.t)+'</a></li>'}).join('')+'</ul>'}).join('')+'<p class="sm" style="margin:10px 0 0">'+esc(SOURCES_NOTE)+'</p></div>';
  dialog('Sources',h,[['Close',function(){}]],{esc:1})}
function aim(){newRun();setTab('lib');var url=(typeof ZCONFIG!=='undefined'&&ZCONFIG.aimUrl)||'/site/zest/index.html';
  show('<div><button class="back" id="bk">'+ico('back')+' Challenges</button></div><h1 class="sr">Aim</h1><div class="aimbox"><div class="aimst" id="aimst" role="status">Loading Aim…</div><iframe class="zf" id="zf" title="Zest: Aim" src="'+esc(url)+'"></iframe></div>',true,{back:library});
  $('bk').onclick=library;musicStop();var f=$('zf'),bad=function(){var e=$('aimst');if(!e)return;e.innerHTML='Could not load Aim. <button class="chip" id="aimr">Try again</button>';$('aimr').onclick=aim},tm=setTimeout(bad,10000);
  f.onload=function(){clearTimeout(tm);try{var b=f.contentDocument&&f.contentDocument.body;if(!b||!b.children.length)return bad()}catch(e){}var e=$('aimst');if(e)e.remove()}}

/* ---------- the service: one place for calls, timeouts, sessions and 401s ---------- */
var API=(function(){var B=(typeof ZCONFIG!=='undefined'&&ZCONFIG.apiBase)||'https://zest-api.orangepulplabs.workers.dev';try{if(isLocal()){var q=new URLSearchParams(location.search).get('api');if(q)return q}}catch(e){}return B})();
var ADULT=['18 to 24','25 to 34','35 to 44','45 to 54','55 and over'],NETF=0;
function signedIn(){var st=db().st;return !!(st.session&&st.acct)}
function canSync(p){var st=db().st;return !st.gMinor&&!(p&&minorAge(p.age))}   // 13 to 17 stays on the phone
function rankOK(){var d=db(),st=d.st;return !!(st.session&&st.gAdult&&!st.gMinor&&canSync(d.p))}
function isAdult(){return rankOK()}
function authH(tok){var t=tok||db().st.session;return t?{'content-type':'application/json',authorization:'Bearer '+t}:{'content-type':'application/json'}}
/* returns {ok,status,j,net}. Never throws. o: method, body, ms, tok, noauth, quiet, nohandle */
async function api(path,o){o=o||{};var ctl=new AbortController(),tm=setTimeout(function(){ctl.abort()},o.ms||12000);
  try{var r=await fetch(API+path,{method:o.method||'GET',headers:o.noauth?{'content-type':'application/json'}:authH(o.tok),body:o.body!==undefined?JSON.stringify(o.body):undefined,signal:ctl.signal});
    var fresh=r.headers.get('x-zest-session');if(fresh&&!o.noauth&&!o.tok&&db().st.session)keepSession(fresh);
    var j=null;try{j=await r.json()}catch(e){}j=j||{};NETF=0;unban('offline');
    if(r.status===401&&!o.noauth&&!o.nohandle&&!o.tok)onAuthFail(j);
    return {ok:r.ok,status:r.status,j:j,net:false}}
  catch(e){NETF++;if(!o.quiet&&(signedIn()||o.loud))offline();return {ok:false,status:0,j:{},net:true}}
  finally{clearTimeout(tm)}}
function offline(){banner('offline',(navigator.onLine===false?'You are offline.':'Could not reach Zest.')+' Your scores are safe on this phone.',[['Retry',retryNow]])}
function retryNow(){unban('offline');syncNow();runPending();refreshView()}
/* re-draw a screen that shows network results, without a jump */
function refreshView(){if(inRound||LAYERS.length)return;if(scr.querySelector('#acct'))keepView(settings)}
function keepSession(tok){var d=db();d.st.session=tok;delete d.st.expired;sv(d)}
function onAuthFail(j){if(j&&j.error==='account_gone'){accountGone();return}sessionExpired()}
function sessionExpired(){var d=db();if(!d.st.session)return;if(!d.st.expired){d.st.expired=1;sv(d)}expiredBanner()}
function expiredBanner(){if(!db().st.expired)return;banner('expired','Your sign-in has ended. Sign in again to keep your progress synced.',[['Sign in again',signInAgain]])}
function signInAgain(){startGoogle(function(){unban('expired');refreshView()})}
function wipeLocal(){var d=db();d.runs=[];d.ci={};d.set={};d.done={};d.seen={};d.p=null;['share','sent','rejected','dirty','pendingAge','owner','demo','cloudCorrupt'].forEach(function(k){delete d.st[k]});sv(d)}
function accountGone(){var d=db();if(!d.st.session)return;['session','acct','expired','owner','dirty','cloudCorrupt'].forEach(function(k){delete d.st[k]});d.st.share=0;d.st.sent={};delete d.st.rejected;sv(d);unban('expired');unban('offline');
  dialog('This account was deleted on another device','<p>Its cloud copy and its entries in the rankings are gone. Your progress on this phone is still here, and you are signed out.</p><p>Joining the rankings again will ask for your consent again.</p>',[['Keep my progress on this phone',function(){refreshView();if(TAB==='set')settings()}],['Remove it from this phone',function(){confirmDanger('Remove your progress from this phone?','<p>This deletes your scores and settings on this phone. It cannot be undone.</p>','Keep it','Delete from this phone',function(){wipeLocal();home()})},'danger']])}

/* ---------- deleting cloud data: only signed out locally after the service says yes, and retried until it does ---------- */
function markPending(kind){var d=db();if(d.st.session)lsSet(LS_PEND,JSON.stringify({kind:kind,tok:d.st.session,t:Date.now()}))}
var pendBusy=false;
async function runPending(){var p=lsJson(LS_PEND);if(!p)return true;if(!p.tok){lsDel(LS_PEND);return true}if(pendBusy)return false;pendBusy=true;
  try{var r=await api(p.kind==='account'?'/v1/account':'/v1/me',{method:'DELETE',tok:p.tok,quiet:true});
    if(!(r.ok||r.status===404||(r.status===401&&r.j.error==='account_gone')))return false;
    lsDel(LS_PEND);var d=db();d.st.share=0;d.st.sent={};if(p.kind==='account'&&d.st.session===p.tok){['session','acct','expired','dirty','cloudCorrupt'].forEach(function(k){delete d.st[k]});unban('expired')}sv(d);return true}
  finally{pendBusy=false}}
/* kind: 'account' (cloud copy and rankings) or 'ranking' (rankings only) */
async function deleteCloud(kind,after){var d=db();if(!d.st.session){var s=db();s.st.share=0;s.st.sent={};sv(s);after&&after(true);return true}
  markPending(kind);var ok=await runPending();
  if(ok){after&&after(true);return true}
  dialog('Could not delete','Could not delete. Check your connection and try again.',[['Retry',function(){deleteCloud(kind,after)}],['Close',function(){after&&after(false)}]]);return false}
function eraseShared(after){return deleteCloud('ranking',function(ok){if(ok)after&&after()})}

/* ---------- ranking: adults only, opt-in, and only after Google confirmed an age ---------- */
var pushBusy=false,pushTimer=0;
/* the service refuses scores outside the registry bounds, so clamp before sending */
function clampScore(sid,x){var g=(typeof REGISTRY!=='undefined'&&REGISTRY.games||[]).filter(function(g){return g.id===sid})[0];if(!g||g.lo==null||g.top==null)return x;return Math.round(Math.min(g.top,Math.max(g.lo,x))*10)/10}
async function pushScores(){var d=db();if(!d.st.share||!rankOK()||!d.p||d.st.demo||d.st.expired||pushBusy)return;
  var rej=d.st.rejected||{},jobs=[];STG.forEach(function(s){var r=formS(s.id);if(!r.ready)return;var score=clampScore(s.id,Math.round(r.typ*10)/10),key=score+'|'+(d.p.age||'');if((d.st.sent||{})[s.id]===key||rej[s.id+'|'+key])return;jobs.push({s:s,score:score,key:key,runs:r.n})});
  if(!jobs.length)return;pushBusy=true;var retry=false,wait=90000;
  try{for(var i=0;i<jobs.length;i++){var jb=jobs[i],x=await api('/v1/score',{method:'POST',body:{stage:jb.s.id,score:jb.score,runs:jb.runs,ver:'proto4'},quiet:true}),dd=db();
    if(x.ok){dd.st.sent=dd.st.sent||{};dd.st.sent[jb.s.id]=jb.key;sv(dd)}
    else if(x.status===401)break;
    else if(x.status===429||x.status>=500||x.net){retry=true;if(x.j&&x.j.retry_after)wait=Math.max(wait,x.j.retry_after*1000)}
    else if(x.status>=400){dd.st.rejected=dd.st.rejected||{};dd.st.rejected[jb.s.id+'|'+jb.key]=1;   // 400, 403, 409, 422: sending the same thing again would not help
      sv(dd)}}}
  finally{pushBusy=false}
  if(retry){clearTimeout(pushTimer);pushTimer=setTimeout(pushScores,wait)}}
function consentShare(after){var d0=db();if(!d0.p)return;
  dialog('Join the rankings?','<p>Zest will send your typical result in each game together with the age group you chose. You are compared with other players in the same age group, and you only see a percentage. No name or score is ever shown to anyone, and your email and exact age are never shared. You can leave and delete your entries in Settings at any time.</p>',
   [['Turn on',function(){var dd=db();dd.st.share=1;dd.st.sent={};delete dd.st.rejected;sv(dd);zc('rank_joined');pushScores();after()}],['Not now',function(){}]],{esc:1})}
async function rankAll(ready){var sc={};ready.forEach(function(s){sc[s.id]=clampScore(s.id,Math.round(formS(s.id).typ*10)/10)});var r=await api('/v1/rank/all',{method:'POST',body:{scores:sc}});
  if(r.ok&&r.j&&r.j.stages){var out={};ready.forEach(function(s){var x=r.j.stages[s.id];out[s.id]=x?(x.group||x):null});return out}
  if(r.status!==404&&r.status!==405)return null;
  var out2={},bad=false;await Promise.all(ready.map(function(s){var f=formS(s.id);return api('/v1/rank?stage='+s.id+'&score='+sc[s.id]).then(function(x){if(x.ok)out2[s.id]=x.j.group||null;else bad=true})}));return bad?null:out2}
/* The percentile line (story page and result screen): 'Top X% in your age group', only for a signed-in adult who joined the rankings, when the service says shown:true for that game.
   Nothing at all otherwise. One /v1/rank/all call per set of scores, kept for the session. */
var RANKC=null;
function rankEligible(){var d=db(),st=d.st;return !st.demo&&!st.expired&&signedIn()&&rankOK()&&!!st.share}
async function peerPct(sid){if(!rankEligible()||!isKept(sid))return null;
  var ready=keptStages().filter(function(s){return formS(s.id).ready});if(!ready.some(function(s){return s.id===sid}))return null;
  var key=ready.map(function(s){return s.id+'='+clampScore(s.id,Math.round(formS(s.id).typ*10)/10)}).join(',');
  if(!RANKC||RANKC.key!==key)RANKC={key:key,p:rankAll(ready)};var cur=RANKC,res=await cur.p;
  if(!res){if(RANKC===cur)RANKC=null;return null}
  var x=res[sid];if(!x||x.shown!==true||!isNum(x.pct))return null;return clamp(100-Math.round(x.pct),1,100)}
async function showPct(sid,elId){var myrun=run.id,n;try{n=await peerPct(sid)}catch(e){return}var el=$(elId);if(n===null||run.id!==myrun||!el)return;el.textContent='Top '+n+'% in your age group'}
/* 'Report a mistake' on a story or source: preset reasons only, counted on the server per item with no identifier */
function flagDialog(item){var R=[['wrong_fact','A fact looks wrong'],['wrong_date','A date or name looks wrong'],['broken_link','A link does not work'],['unclear','It is confusing'],['other','Something else']];
  dialog('Report a mistake','<p>Thanks for helping. Tell us what is off. We read the counts and check the story. This sends nothing about you.</p>',R.map(function(r,i){return [r[1],async function(){var x=await api('/v1/flag',{method:'POST',body:{item:item,reason:r[0]},noauth:true,quiet:true});toast(x.status===204||x.ok?'Thanks. We will check it.':x.status===429?'You have sent a lot of reports. Please try again later.':'Could not send that. Try again later.')},i?'ghost':'pri']}).concat([['Cancel',function(){},'ghost']]),{esc:R.length})}
document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-flag]');if(b){e.preventDefault();flagDialog(b.dataset.flag)}});

/* ---------- challenges you publish from the admin page ---------- */
function applyDaily(map){
  Object.keys(map).forEach(function(date){var r=map[date],g=REGISTRY.games.filter(function(x){return x.id===r.game})[0];if(!g||!stage(r.game))return;
    var mods={};g.params.forEach(function(p){var v=r.params&&r.params[p.key];if(v===undefined||v===null)return;if(p.type==='bool'){mods[p.key]=!!v;return}v=Number(v);if(!isFinite(v))return;v=Math.min(p.max,Math.max(p.min,v));mods[p.key]=p.type==='int'?Math.round(v):v});
    for(var i=CH.length-1;i>=0;i--)if(CH[i].id==='daily:'+date)CH.splice(i,1);
    CH.push({id:'daily:'+date,stage:r.game,name:String(r.name||'Daily').slice(0,32),std:0,tier:'Daily',desc:String(r.desc||'').slice(0,110),mods:mods,daily:true})})}
async function refreshDaily(){
  var r=await api('/v1/daily',{quiet:true,noauth:true});if(!r.ok||!r.j.items)return;
  try{var dd=db(),map=dd.st.dcfg||{},t=todayStr(),tm=ds(Date.now()+864e5),got={},before=cotd(t).id;
    r.j.items.forEach(function(it){got[it.date]=1;map[it.date]=it.recipe});[t,tm].forEach(function(k){if(!got[k])delete map[k]});
    var keys=Object.keys(map).sort().slice(-10),nm={};keys.forEach(function(k){nm[k]=map[k]});dd.st.dcfg=nm;sv(dd);applyDaily(nm);
    if(cotd(t).id!==before&&TAB==='today'&&!CTX&&!inRound&&!LAYERS.length&&scr.querySelector('#gd'))home()}catch(e){}}

/* ---------- account: Google sign-in and progress that follows you ---------- */
function loadGis(){return new Promise(function(res,rej){if(window.google&&google.accounts&&google.accounts.oauth2)return res();var el=document.createElement('script'),tm=setTimeout(function(){rej()},12000);el.src='https://accounts.google.com/gsi/client';el.async=true;el.onload=function(){clearTimeout(tm);res()};el.onerror=function(){clearTimeout(tm);rej()};document.head.appendChild(el)})}
var GSCOPES={agerange:'https://www.googleapis.com/auth/profile.agerange.read',birthday:'https://www.googleapis.com/auth/user.birthday.read'};
/* only what the service needs: who you are (openid) and the age permission */
function gScope(){return 'openid'+(GSCOPES[ZCONFIG.ageScope]?' '+GSCOPES[ZCONFIG.ageScope]:'')}
function ageNote(){return ZCONFIG.ageScope==='birthday'?'Zest reads your birth date from Google once, only to tell adults from under-18s. We keep your age band and never your birthday.':ZCONFIG.ageScope==='agerange'?'Zest asks Google for your age range once, only to tell adults from under-18s. We keep that answer and nothing else about your age.':'Zest does not ask Google for your age. Rankings use the age group you choose in Zest.'}
var GLOGO='<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
/* Google's script is only fetched when the player taps Continue */
async function startGoogle(onDone,o){o=o||{};if(!ZCONFIG.googleClientId){info('Sign-in','Google sign-in is not switched on in this build yet.');return}
  var b=o.btn,label=b&&b.innerHTML;function back(){if(b){b.disabled=false;b.innerHTML=label}}
  if(b){b.disabled=true;b.textContent='Opening Google…'}
  zc('signin_started');try{await loadGis()}catch(e){back();info('Sign-in','Could not reach Google. Check your connection and try again.');return}
  var tc=google.accounts.oauth2.initTokenClient({client_id:ZCONFIG.googleClientId,scope:gScope(),callback:function(r){back();if(r&&r.access_token)handleAccessToken(r.access_token,onDone);else info('Sign-in','Google sign-in was cancelled or did not finish.')},error_callback:function(){back()}});
  tc.requestAccessToken(o.chooser?{prompt:'select_account'}:{})}
function googleButton(el,onDone,o){
  if(!ZCONFIG.googleClientId){el.innerHTML='<p class="sm" style="margin:0">Google sign-in is not switched on in this build yet.</p>';return}
  el.innerHTML='<button class="zbtn ghost wide" id="gcont" style="gap:10px">'+GLOGO+'Continue with Google</button><p class="fine">'+ageNote()+'</p>';
  el.querySelector('#gcont').onclick=function(){startGoogle(onDone,{btn:this,chooser:o&&o.chooser})}}
async function acctMark(tok){try{var p=JSON.parse(atob(String(tok).split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))),u=String(p.uid||'');if(!u)return null;
  if(window.crypto&&crypto.subtle){var h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('zmark:'+u));return Array.from(new Uint8Array(h)).slice(0,8).map(function(b){return ('0'+b.toString(16)).slice(-2)}).join('')}
  var x=5381;for(var i=0;i<u.length;i++)x=((x<<5)+x+u.charCodeAt(i))|0;return 'h'+(x>>>0).toString(16)}catch(e){return null}}
function hasLocalData(d){return d.runs.length>0||!!(d.p&&d.p.done)}
function adultBand(a){return AGES.indexOf(a)>0}
function declaredBody(tok){var d=db(),a=(d.p&&d.p.age)||d.st.pendingAge,o={accessToken:tok};if(a&&a!=='Prefer not to say'&&(adultBand(a)||minorAge(a)))o.ageBand=a;return o}
/* tell the service the age group the player chose, so rankings use it; returns when done */
async function putAge(age){var d=db();if(!d.st.session||d.st.demo)return;
  if(!adultBand(age)){delete d.st.gAdult;d.st.share=0;sv(d);return}
  var r=await api('/v1/age',{method:'PUT',body:{ageBand:age},quiet:true}),dd=db();
  if(r.ok&&r.j&&r.j.age&&r.j.age.adult){dd.st.gAdult=1;dd.st.sent={};sv(dd)}}
async function handleAccessToken(tok,onDone){
  var r=await api('/v1/auth/google-token',{method:'POST',body:declaredBody(tok),noauth:true,loud:true,ms:15000});
  if(r.net){info('Sign-in','Could not reach the Zest service. Check your connection and try again.');return}
  var j=r.j;if(!r.ok){info('Sign-in',esc(r.status===503||j.error==='not_configured'?'Sign-in is not switched on yet.':j.error==='google_unverified'?'Google sign-in could not be verified. Please try again.':(j.message||'Sign-in failed.')));return}
  var a=j.age||{};
  if(a.known&&a.allowed===false){googleMinor(a);return}
  var mark=await acctMark(j.session),d=db();
  if(mark&&d.st.owner&&d.st.owner!==mark&&hasLocalData(d)){
    dialog('Keep this phone’s data for this account, or start fresh?','<p>This phone has progress that belongs to a different Google account.</p><p><b>Keep it</b> saves this phone’s progress to the account you just signed in with. <b>Start fresh</b> deletes the progress on this phone first, and loads this account’s own progress instead.</p>',
     [['Keep this phone’s data',function(){finishSignIn(j,a,mark,onDone)}],['Start fresh',function(){confirmDanger('Delete the progress on this phone?','<p>Your scores and settings on this phone will be deleted. This account’s own progress, if it has any, is loaded afterwards.</p>','Cancel','Delete and start fresh',function(){wipeLocal();finishSignIn(j,a,mark,onDone)})},'danger'],['Cancel sign-in',function(){}]],{esc:2});return}
  finishSignIn(j,a,mark,onDone)}
/* a Google account under 18: under 13 is treated exactly like the under 13 age choice; 13 to 17 stays on the phone */
function googleMinor(a){var d=db();
  if(a.band==='Under 13'){blockUnder13({src:'google',cloud:false});return}
  d.st.gMinor=1;d.st.ageSrc='google';['session','acct','expired'].forEach(function(k){delete d.st[k]});d.st.share=0;d.st.sent={};if(d.p){d.p.age='13 to 17';d.p.mt=Date.now()}else d.st.pendingAge='13 to 17';sv(d);unban('expired');
  info('Sign-in is for adults','Signing in and cloud sync are for adults 18 and over. You can keep playing, and your progress stays on this phone.',function(){if(TAB==='set')settings();else home()})}
async function finishSignIn(j,a,mark,onDone){
  var d=db(),same=mark&&d.st.owner===mark;
  d.st.session=j.session;d.st.acct={at:Date.now(),base:0,lastSync:0};if(mark)d.st.owner=mark;['expired','cloudCorrupt','gMinor','ageSrc'].forEach(function(k){delete d.st[k]});
  if(!same&&j.hasPlayer!==true||j.hasPlayer===false){d.st.share=0;d.st.sent={};delete d.st.rejected}   // the ranking consent belongs to the account, so it is asked again
  if(a.adult)d.st.gAdult=1;else delete d.st.gAdult;
  if(a.known&&a.band!=='Adult'){if(d.p){d.p.age=a.band;d.p.mt=Date.now()}else d.st.pendingAge=a.band}
  sv(d);unban('expired');await syncNow();
  var d2=db();if(a.known&&a.band!=='Adult'&&d2.p){d2.p.age=a.band;d2.p.mt=Date.now();sv(d2);scheduleSync()}   // Google's band wins over what a cloud copy said
  zc('signin_done');onDone&&onDone(j.hasData)}
function signOutLocal(){var d=db();['session','acct','expired','dirty','cloudCorrupt'].forEach(function(k){delete d.st[k]});sv(d);unban('expired');unban('offline')}
function useOtherAccount(){var d=db();delete d.st.gMinor;if(d.st.ageSrc==='google'&&d.p&&d.p.age==='13 to 17')d.p.age=null;delete d.st.ageSrc;delete d.st.pendingAge;sv(d);
  info('Use a different account','Sign in with an adult Google account to use cloud sync and rankings.',function(){if(TAB==='set')settings();else home()})}

/* ---------- sync: a dirty flag, retried with backoff, on launch, resume and reconnect ---------- */
function snapshot(){var d=db(),pp=d.p&&Object.assign({},d.p),o={v:1,p:(pp&&delete pp.name,pp),runs:d.runs.filter(function(r){return !r.demo}).slice(-3000),ci:d.ci,done:{},seen:d.seen,st:{}};Object.keys(d.done).sort().slice(-60).forEach(function(k){o.done[k]=d.done[k]});
  ['music','sfx','mround','hap','rm','rx','mstyle','mvol','remind','aud','pz','pzzen','points','reelLen'].forEach(function(k){if(d.st[k]!==undefined)o.st[k]=d.st[k]});return o}   // pz (puzzle progress) syncs like the other settings; it is never sent to rankings
function mergeData(L,C){
  var out={v:1},lp=L.p,cp=C.p;out.p=!lp?cp:!cp?lp:((cp.mt||0)>(lp.mt||0)?cp:lp);
  var seen={},runs=[];(C.runs||[]).concat(L.runs||[]).forEach(function(r){var k=r.c+'|'+r.t;if(!seen[k]){seen[k]=1;runs.push(r)}});runs.sort(function(a,b){return a.t-b.t});out.runs=runs.slice(-3000);
  out.ci=Object.assign({},C.ci,L.ci);out.seen=Object.assign({},C.seen,L.seen);out.done={};
  [C.done||{},L.done||{}].forEach(function(m){Object.keys(m).forEach(function(k){var a=out.done[k]||[];m[k].forEach(function(x){if(a.indexOf(x)<0)a.push(x)});out.done[k]=a})});
  out.st=Object.assign({},C.st,L.st);
  var pz=mergePz((C.st||{}).pz,(L.st||{}).pz);if(pz)out.st.pz=pz;var pt=Math.max(+(C.st||{}).points||0,+(L.st||{}).points||0);if(pt>0)out.st.points=pt;
  return out}
/* puzzle progress from two devices: the highest level reached, and per level the better of the two bests (stars, then fewer moves) */
function mergePz(a,b){if(!a||typeof a!=='object')return b&&typeof b==='object'?b:null;if(!b||typeof b!=='object')return a;var out={};Object.keys(a).concat(Object.keys(b)).forEach(function(id){if(out[id])return;var x=a[id]||{},y=b[id]||{},e={lvl:Math.max(+x.lvl||1,+y.lvl||1),best:{}};[x.best||{},y.best||{}].forEach(function(m){Object.keys(m).forEach(function(l){var v=m[l],c=e.best[l];if(v&&(!c||v.stars>c.stars||(v.stars===c.stars&&v.moves<c.moves)))e.best[l]=v})});out[id]=e});return out}
var syncBusy=false,syncTimer=0,syncFail=0,dirtyV=0;
function syncUi(){var b=$('syn');if(b){b.disabled=syncBusy;b.textContent=syncBusy?'Syncing…':'Sync now'}var l=$('lsync');if(l)l.textContent=syncBusy?'syncing now':agoText((db().st.acct||{}).lastSync)}
function syncFailed(why){syncFail++;var d=db();if(d.st.session&&!d.st.dirty){d.st.dirty=1;sv(d)}schedule(true);return why}
function schedule(backoff){clearTimeout(syncTimer);syncTimer=setTimeout(function(){syncNow()},backoff?Math.min(900000,8000*Math.pow(2,Math.min(syncFail,7))):8000)}
function scheduleSync(){var d=db();if(!d.st.session||d.st.demo)return;dirtyV++;if(!d.st.dirty){d.st.dirty=1;sv(d)}schedule(syncFail>0)}
/* returns true when synced, otherwise a short reason: busy, offline, server, expired, gone, corrupt, minor, demo */
async function syncNow(o){o=o||{};var d=db();if(!d.st.session)return false;if(d.st.demo)return 'demo';if(d.st.expired){expiredBanner();return 'expired'}
  if(syncBusy)return 'busy';
  if(!canSync(d.p)){if(!lsJson(LS_PEND))markPending('account');await runPending();return 'minor'}
  syncBusy=true;syncUi();var v0=dirtyV;
  try{var H=null;
    for(var tries=0;tries<3;tries++){
      var r=await api('/v1/sync',{ms:15000});if(r.status===401)return db().st.session?'expired':'gone';if(r.net)return syncFailed('offline');if(!r.ok)return syncFailed('server');
      var j=r.j,cloud=null;if(j.blob){try{cloud=JSON.parse(j.blob);if(!cloud||!Array.isArray(cloud.runs))throw 0}catch(e){if(!o.replace){var dc=db();dc.st.cloudCorrupt=1;sv(dc);return 'corrupt'}cloud=null}}
      var cur=db(),m=cloud?mergeData(snapshot(),cloud):snapshot();
      cur.p=m.p;cur.runs=m.runs;cur.ci=m.ci;cur.seen=m.seen;Object.keys(m.done).forEach(function(k){cur.done[k]=m.done[k]});Object.assign(cur.st,m.st);delete cur.st.cloudCorrupt;sv(cur);
      var put=await api('/v1/sync',{method:'PUT',body:{blob:JSON.stringify(snapshot()),base:j.updated||0},ms:20000});
      if(put.status===401)return db().st.session?'expired':'gone';if(put.net)return syncFailed('offline');
      if(put.status===403){markPending('account');await runPending();return 'minor'}
      if(put.status===409&&put.j.error==='older_client'){banner('older','This version of Zest is older than your saved progress, so it will not overwrite it. Update the app to keep syncing.',[['OK',function(){unban('older')}]]);return 'older'}
      if(put.status===413||put.status===400){return 'toolarge'}
      if(put.status===409||put.status===429){await sleep(2200);continue}
      if(put.ok){var dd=db();if(dd.st.acct){dd.st.acct.lastSync=Date.now();dd.st.acct.base=put.j.updated}if(dirtyV===v0)delete dd.st.dirty;sv(dd);syncFail=0;if(dirtyV!==v0)schedule(false);return true}
      return syncFailed('server')}
    return syncFailed('server')}
  catch(e){return syncFailed('server')}
  finally{syncBusy=false;syncUi()}}
function syncIfNeeded(){var d=db();if(d.st.session&&!d.st.demo&&!d.st.expired&&(d.st.dirty||!d.st.acct||Date.now()-(d.st.acct.lastSync||0)>6e5))syncNow()}
document.addEventListener('visibilitychange',function(){if(document.hidden){var d=db();if(d.st.session&&d.st.dirty){clearTimeout(syncTimer);syncNow()}}else{syncIfNeeded();runPending();refreshDaily();setTimeout(evFlush,2000)}});
window.addEventListener('online',function(){unban('offline');syncIfNeeded();runPending();refreshView()});
window.addEventListener('offline',function(){if(signedIn())offline()});

/* ---------- settings: account card ---------- */
function signinScreen(){
  newRun();var pend=lsJson(LS_PEND);
  show('<div class="q"><div><button class="back" id="bk">'+ico('back')+' Back</button></div><h1>Sign in</h1><p>Use your Google account to get your progress back on this device. We keep a scrambled ID, your progress and your age band. We never keep your email, name or birthday.</p></div>'+
   (pend?'<div class="callout" role="status">Deleting your earlier cloud data is still waiting for a connection. It has to finish before you sign in again.<div class="chips" style="margin-top:10px"><button class="chip" id="rp">Try again now</button></div></div>':'<div id="gbtn"></div>')+'<p class="fine">Players aged 13 to 17 can still play. Their progress stays on the phone.</p>',true,{back:function(){onboard(0)}});
  $('bk').onclick=function(){onboard(0)};
  if($('rp'))$('rp').onclick=async function(){this.disabled=true;await runPending();signinScreen()};
  if($('gbtn'))googleButton($('gbtn'),function(hasData){if(hasData&&db().p&&db().p.done)home();else startFirst()})}
function accountCard(d){var p=d.p||{},st=d.st,pend=lsJson(LS_PEND),pn=pend?'<div class="callout" role="status" style="margin-bottom:10px">Deleting your cloud data is still waiting for a connection. Zest keeps trying.<div class="chips" style="margin-top:8px"><button class="chip" id="rpd">Try again</button></div></div>':'';
  if(st.gMinor)return '<div class="zcard" id="acct">'+pn+'<p class="sm" style="margin:0">The Google account you used is under 18. Signing in and cloud sync are for adults 18 and over, so your progress stays on this phone.</p><div class="chips" style="margin-top:10px"><button class="chip" id="alt">Use a different account</button></div></div>';
  if(!canSync(p))return '<div class="zcard" id="acct">'+pn+'<p class="sm" style="margin:0">Signing in and cloud sync are for adults aged 18 and over for now. Your progress stays on this phone.</p></div>';
  if(signedIn()){var ls=(st.acct||{}).lastSync||0,stale=ls&&Date.now()-ls>3*864e5;
    return '<div class="zcard" id="acct">'+pn+'<b class="ct">Signed in with Google</b><p class="sm" style="margin:6px 0 10px">Your progress is saved to your account and follows you to the app and the website. Last synced: <span id="lsync">'+agoText(ls)+'</span>.</p>'+
     (st.expired?'<div class="callout" role="status" style="margin-bottom:10px">Your sign-in has ended.<div class="chips" style="margin-top:8px"><button class="chip" id="sia">Sign in again</button></div></div>':'')+
     (stale?'<div class="callout" role="status" style="margin-bottom:10px">It has been '+Math.round((Date.now()-ls)/864e5)+' days since your progress was last saved to your account. Tap Sync now to be safe.</div>':'')+
     (st.cloudCorrupt?'<div class="callout" role="alert" style="margin-bottom:10px">The copy in your account could not be read, so Zest has not changed it.<div class="chips" style="margin-top:8px"><button class="chip" id="repl">Replace the cloud copy with this phone</button></div></div>':'')+
     '<div class="chips"><button class="chip" id="syn"'+(syncBusy?' disabled':'')+'>'+(syncBusy?'Syncing…':'Sync now')+'</button><button class="chip" id="sout">Sign out</button></div><div class="chips" style="margin-top:8px"><button class="chip" id="sall">Sign out everywhere</button><button class="chip" id="adel">Delete my cloud data</button></div></div>'}
  return '<div class="zcard" id="acct">'+pn+'<b class="ct">Keep your progress safe</b><p class="sm" style="margin:4px 0 12px">Sign in with Google to use the same progress on your phone and on the website. We keep a scrambled ID, your progress and your age band, never your email, name or birthday.</p><div id="gbtn2"></div></div>'}
function updateAcct(){var a=$('acct');if(!a||!scr.contains(a))return;a.outerHTML=accountCard(db());accountWire()}
function accountWire(){
  var g=$('gbtn2');if(g)googleButton(g,function(){settings()});
  if($('rpd'))$('rpd').onclick=async function(){this.disabled=true;await runPending();updateAcct()};
  if($('alt'))$('alt').onclick=useOtherAccount;if($('sia'))$('sia').onclick=signInAgain;
  if($('syn'))$('syn').onclick=async function(){if(syncBusy)return;var res=await syncNow({manual:1});updateAcct();if(res===true)toast('Synced');else if(res==='offline'||res==='server'||res==='toolarge')dialog('Could not sync','Could not sync right now. Your progress is safe on this phone.',[['Try again',function(){$('syn')&&$('syn').click()}],['Close',function(){}]])};
  if($('repl'))$('repl').onclick=function(){dialog('Replace the cloud copy?','<p>This overwrites the copy in your account with the progress on this phone.</p>',[['Keep the cloud copy',function(){}],['Replace it',async function(){await syncNow({replace:1});updateAcct()},'danger']])};
  if($('sout'))$('sout').onclick=function(){dialog('Sign out?','<p>Your progress stays on this phone. You can sign in again any time to get it on other devices.</p><p>If you joined the rankings, your scores stay in the rankings, only ever as a percentage, until you delete them in Settings under Rankings.</p>',[['Stay signed in',function(){}],['Sign out',function(){signOutLocal();keepView(settings)},'ghost']])};
  if($('sall'))$('sall').onclick=function(){dialog('Sign out everywhere?','<p>This signs Zest out on every other phone and browser. This phone stays signed in. Your progress stays on each device and in your account.</p>',[['Cancel',function(){}],['Sign out everywhere',async function(){var x=await api('/v1/signout-everywhere',{method:'POST'});if(x.ok&&x.j.session){keepSession(x.j.session);toast('Signed out everywhere else.')}else if(!x.net&&x.status!==401)info('Sign out everywhere','Could not do that right now. Try again later.');else if(x.net)info('Sign out everywhere','Could not reach Zest. Check your connection and try again.')},'danger']])};
  if($('adel'))$('adel').onclick=function(){dialog('Delete your cloud data?','<p>This removes your account data from our service and your entries in the rankings. Progress on this phone stays.</p>',[['Keep it',function(){}],['Delete',function(){deleteCloud('account',function(ok){if(ok)keepView(settings)})},'danger']])}}

/* ---------- settings ---------- */
function setRow(k,label,sub,on){return '<button class="set" data-k="'+k+'" role="switch" aria-checked="'+(!!on)+'"><span class="t"><b>'+label+'</b><span>'+sub+'</span></span><span class="sw'+(on?' on':'')+'" aria-hidden="true"></span></button>'}
function chipRadios(label,id,list,isOn,attr){return '<div class="grp" id="'+id+'">'+label+'</div><div class="chips" role="radiogroup" aria-labelledby="'+id+'">'+list.map(function(m){var on=isOn(m[0]);return '<button class="chip'+(on?' on':'')+'" role="radio" aria-checked="'+on+'" data-'+attr+'="'+m[0]+'">'+esc(m[1])+'</button>'}).join('')+'</div>'}
/* Appearance: 'light' (default, owner decision 2 Nov 2026), 'dark' or 'system' (follows the phone). Sets html[data-theme]; no attribute means follow the phone. Stored per device. */
function themeOf(){return (db().st||{}).theme||'light'}
function applyTheme(){var v=themeOf(),r=document.documentElement;if(v==='light'||v==='dark')r.setAttribute('data-theme',v);else r.removeAttribute('data-theme')}
function settings(){
  newRun();setTab('set');var d=db(),s=d.st,p=d.p||{},rem=s.remind||{on:0,time:'18:00'};
  show('<h1 class="s">Settings</h1><p class="tag">Make Zest yours.</p>'+
   '<div class="lab">Appearance</div><div class="zcard">'+chipRadios('Light or dark','thlab',[['light','Light'],['dark','Dark'],['system','Use phone setting']],function(v){return themeOf()===v},'th')+'</div>'+
   '<div class="lab" style="margin-top:8px">Account</div>'+accountCard(d)+'<div class="lab">Sound</div><div class="zcard">'+setRow('music','Music','Calm background music on the home screens',s.music)+'<div style="padding:4px 0 12px">'+chipRadios('Music style','mslab',MUSIC_STYLES,function(v){return (s.mstyle||'lofi')===v},'ms')+chipRadios('Volume','mvlab',[['0.3','Low'],['0.55','Medium'],['0.9','High']],function(v){return Math.abs(mvol()-(+v))<.01},'mv')+'</div>'+setRow('mround','Music during rounds','Off by default so it never gets in the way of timing',s.mround)+setRow('sfx','Sound effects','Soft cues for right and wrong',s.sfx)+setRow('aud','Audio alternative','Tones in Go or wait and Sequence, so you can play without relying on the screen',s.aud)+(navigator.vibrate?setRow('hap','Vibration','A short buzz on right and wrong',s.hap):'')+'</div>'+
   '<div class="lab">Daily reminder</div><div class="zcard">'+setRow('remind','Daily reminder','Reminders arrive with the Android app. This only saves your preference.',rem.on)+'<div class="remtime"><label for="rtime">Time</label><input type="time" id="rtime" class="inp" value="'+esc(rem.time||'18:00')+'"'+(rem.on?'':' disabled')+'></div></div>'+
   '<div class="lab">Comfort</div><div class="zcard">'+setRow('rm','Reduce motion','Turns off animations, including the demo hand glide',s.rm)+setRow('rx','Relaxed pace','Slower timing and longer waits. Kept separate from your progress',s.rx)+'</div>'+
   '<div class="lab">Rankings</div><div class="zcard">'+(rankOK()?setRow('share','Join the rankings','Show how your scores compare with other adults in your age group, per challenge',s.share)+(s.share?'<button class="set" id="del"><span class="t"><b>Delete my ranking entries</b><span>Removes your scores from the comparison and turns rankings off</span></span></button>':''):'<p class="sm" style="margin:0">Rankings are for adults who sign in with Google and choose their age group. You see a percentage on each challenge, never a list of names.</p>')+'</div>'+
   '<div class="lab">About you</div><div class="zcard">'+ageRadios(p.age)+radios('Tapping hand','handlab',[['R','Right'],['L','Left']],p.hand||'R','h')+'</div>'+
   '<div class="lab">Privacy</div><div class="zcard">'+setRow('usage','Share anonymous usage counts','Counts of things like rounds played. No account, no personal data.',s.usage!==0)+'</div>'+
   '<div class="lab">About Zest</div><div class="zcard"><button class="set" id="tl"><span class="t"><b>Terms of use</b><span>Opens in your browser</span></span></button><button class="set" id="pl"><span class="t"><b>Privacy policy</b><span>Opens in your browser</span></span></button><p class="sm" style="margin:10px 0 4px">Zest is a game for entertainment. It is not a medical device. Your scores describe how you did in the games, nothing more.</p><button class="set" id="rs1"><span class="t"><b>What the research says</b><span>Where the games come from, and what is and is not known</span></span></button><button class="set" id="so1"><span class="t"><b>Sources</b><span>Papers and history, with links</span></span></button><p class="sm" style="margin:10px 0 4px">Zest itself has not been studied.</p><p class="sm" style="margin:10px 0 4px">OrangePulp Labs, New Delhi. Questions: <a href="mailto:'+CONTACT+'">'+CONTACT+'</a></p></div>'+
   (DEVMODE?'<div class="lab">Prototype tools</div><div class="chips"><button class="chip" id="sd">Load sample data</button><button class="chip" id="rs">Reset everything</button></div>':'')+'<div style="height:12px"></div>');
  if($('rs1'))$('rs1').onclick=researchDialog;if($('so1'))$('so1').onclick=sourcesDialog;
  scr.querySelectorAll('[data-th]').forEach(function(b){b.onclick=function(){var dd=db();dd.st.theme=b.dataset.th;sv(dd);applyTheme();keepView(settings)}});
  scr.querySelectorAll('[data-ms]').forEach(function(b){b.onclick=function(){var dd=db();dd.st.mstyle=b.dataset.ms;sv(dd);musicSync();keepView(settings)}});   // picking a style never turns music on
  scr.querySelectorAll('[data-mv]').forEach(function(b){b.onclick=function(){var dd=db();dd.st.mvol=+b.dataset.mv;sv(dd);musicSync();keepView(settings)}});
  scr.querySelectorAll('.set[data-k]').forEach(function(b){b.onclick=function(){var k=b.dataset.k;
    if(k==='share'){if(db().st.share)dialog('Leave the rankings?','<p>This deletes your scores from the rankings and turns rankings off. Your results on this phone stay.</p>',[['Stay in',function(){}],['Leave and delete',function(){eraseShared(function(){keepView(settings)})},'danger']]);else consentShare(function(){keepView(settings)});return}
    var dd=db();if(k==='remind'){var r0=dd.st.remind||{on:0,time:'18:00'};dd.st.remind={on:r0.on?0:1,time:r0.time||'18:00'}}else{dd.st[k]=dd.st[k]?0:1;if(k==='music'&&dd.st.music)gestured=true;if(k==='usage'&&!dd.st.usage)lsDel('zv4.ev')}
    sv(dd);musicSync();if(k==='remind')scheduleSync();keepView(settings)}});
  if($('rtime'))$('rtime').onchange=function(){var dd=db();dd.st.remind=dd.st.remind||{on:1};dd.st.remind.time=this.value||'18:00';sv(dd);scheduleSync()};
  bindRadios($('agelab').nextElementSibling,'[data-a]',function(b){var a=b.dataset.a;if(a===(db().p||{}).age)return;if(!db().p){ensureProfile()}applyAge(a,function(){keepView(settings)},function(){keepView(settings)})});
  bindRadios($('handlab').nextElementSibling,'[data-h]',function(b){var dd=db();if(!dd.p)return;dd.p.hand=b.dataset.h;dd.p.mt=Date.now();sv(dd);scheduleSync();hand.classList.toggle('lefty',dd.p.hand==='L')});
  accountWire();
  $('tl').onclick=function(){window.open(TERMS_URL,'_blank','noopener')};$('pl').onclick=function(){window.open(PRIVACY_URL,'_blank','noopener')};
  if($('del'))$('del').onclick=function(){dialog('Delete your ranking entries?','<p>This removes your scores from the rankings and turns rankings off. Your results on this phone stay.</p>',[['Keep them',function(){}],['Delete',function(){eraseShared(function(){keepView(settings)})},'danger']])};
  if($('sd'))$('sd').onclick=function(){seedDemo();home()};
  if($('rs'))$('rs').onclick=function(){dialog('Reset everything?','<p>This deletes all Zest data in this browser: scores, settings and sign-in. It cannot be undone. Developer tool.</p>',[['Cancel',function(){}],['Reset everything',function(){['zv4','zv4.bak','zv4.corrupt'].forEach(lsDel);OB={goals:[],mins:5,hand:'R',age:null};location.reload()},'danger']])}}

/* developer sample data (only offered with ?dev on localhost). Every run is tagged demo and never reaches rankings or sync. */
function seedDemo(o){o=o||{};
  var old=db(),d={p:{goals:['react','focus'],mins:5,hand:'R',age:'25 to 34',done:1,yours:1,start:todayStr()},runs:[],ci:{},set:{},done:{},seen:{timing:1,speed:1,switch:1,hold:1,space:1},st:old.st};
  var base={timing:58,speed:160,switch:780,hold:540,space:8.2,trail:14,math:3.1,flanker:620,search:1900,stroop:760,span:5,change:72,nback:700,match:38,pattern:14},drift={timing:.86,speed:.9,switch:1.02,hold:.8,space:.93,trail:.9,math:.92,flanker:.95,search:.9,stroop:.93,span:1.18,change:1.12,nback:.9,match:.9,pattern:.93},now=Date.now(),tag=o.real?{}:{demo:true};
  if(!d.st.terms)d.st.terms={v:TERMS_VERSION,t:now};
  for(var k=13;k>=0;k--){STG.forEach(function(s,si){if((k+si)%3===0&&k>0)return;var pr=(13-k)/13,v=base[s.id]*(1-(1-drift[s.id])*pr)*(1+Math.sin(k*3+si)*.06);v=s.unit==='s'?Math.round(v*10)/10:Math.round(v);if(s.id==='change')v=Math.min(100,v);d.runs.push(Object.assign({c:s.id+':std',s:s.id,v:v,t:now-k*864e5-si*1000,std:true,rx:false,flag:false,scoreVer:SCOREVER},tag))});
    if(k<12)d.ci[ds(now-k*864e5)]=1+((k*7)%5)}
  d.runs.push(Object.assign({c:'timing:blind',s:'timing',v:96,t:now-2*864e5,std:false,rx:false,flag:false,scoreVer:SCOREVER},tag),Object.assign({c:'timing:blind',s:'timing',v:84,t:now-864e5,std:false,rx:false,flag:false,scoreVer:SCOREVER},tag));
  if(o.real)delete d.st.demo;else d.st.demo=1;sv(d)}

/* ---------- boot ---------- */
scr=$('screen');phone=document.querySelector('.phone');hand=$('hand');wireDockLock();reelInstall();
['today','lib','play','fam','set'].forEach(function(k,i){$('tt'+(i+1)).onclick=function(){({today:home,lib:library,play:function(){reelOpen('tab')},fam:families,set:settings})[k]()}});
if(isLocal()&&/[?&]reset/.test(location.search)){lsDel('zv4');lsDel('zv4.bak')}
if(isLocal()&&/[?&]demo/.test(location.search)){seedDemo()}
(function(){var d0=db();if(!d0.st.musicInit){if(!d0.p)d0.st.music=0;d0.st.musicInit=1;sv(d0)}})();   // a new install starts quiet: music is the player's choice
applyDaily(db().st.dcfg||{});bootStamp();
window.__z4={syncNow:syncNow,mergeData:mergeData,handleAccessToken:handleAccessToken,snapshot:snapshot,signedIn:signedIn,refreshDaily:refreshDaily,applyDaily:applyDaily,home:home,play:play,seedDemo:seedDemo,db:db,formAll:formAll,formS:formS,getSet:getSet,library:library,families:families,cotd:cotd,settings:settings,onboard:onboard,infoPage:infoPage,infoLinks:infoLinks,familyPage:familyPage,gameDemo:gameDemo,libSearch:libSearch,askLeave:askLeave,resumeRound:resumeRound,pickList:pickList,shelfData:shelfData,applyAge:applyAge,blockUnder13:blockUnder13,runPending:runPending,makeYours:makeYours,startFirst:startFirst,api:api,handleBack:handleBack,pushScores:pushScores,sessionExpired:sessionExpired,accountGone:accountGone,plural:plural,sharedDaily:sharedDaily,result:result,after:after,show:show,playPuzzle:playPuzzle,pzLadder:pzLadder,archive:archive,zc:zc,evFlush:evFlush,startMode:startMode,buildQueue:buildQueue,pzDaily:pzDaily,pzFromUrl:pzFromUrl,friendBoot:friendBoot,maybeStop:maybeStop,bumpToday:bumpToday,mergeData:mergeData,archiveDay:archiveDay,pzDayPlay:pzDayPlay,resultLite:resultLite};
guardTop();
if(lsGet(LS_BLOCK)){['zv4','zv4.bak','zv4.corrupt'].forEach(lsDel);blockedScreen();runPending().then(function(){blockedScreen()})}
else{
  if(lsGet('zv4.corrupt'))banner('corrupt','Zest could not read your saved data on this phone, so it started fresh and kept the old copy. Email '+CONTACT+' if you would like help getting it back.',[['OK',function(){unban('corrupt')}]]);
  home();friendBoot();
  if(db().st.session){expiredBanner();syncNow()}
  runPending();refreshDaily();setTimeout(evFlush,4000)}
applyTheme();
