/* Zest v4 prototype, part D: puzzles (browse, ladder, runner, result), just play, past dailies, time modes, the kind stop, challenge a friend,
   anonymous usage counts. Loaded after the puzzle files and before app4b.js. Everything here runs after app4b has loaded, so it may call app4b's helpers
   (show, dialog, ico, esc, toast, db...). Every use of PUZZLES is guarded: with no puzzles registered the app behaves as before. */
Object.assign(IC,{f_grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke-dasharray="3 2"/>',
  f_move:'<path d="M5 12h14M15 8l4 4-4 4M9 5L5 9l4 4" />',f_number:'<path d="M8 4v16M16 4v16M4 8h16M4 16h16"/>',f_word:'<path d="M3 19l5-14 5 14M5 14h6M17 8h4M17 12h4M17 16h4"/>',f_memory:IC.memory,
  stone:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'});
var PZFAM={grid:{name:'Grid',ic:'f_grid',col:'--c-control'},move:{name:'Move',ic:'f_move',col:'--c-flex'},number:{name:'Number',ic:'f_number',col:'--c-space'},word:{name:'Word',ic:'f_word',col:'--c-attention'},memory:{name:'Memory',ic:'f_memory',col:'--c-memory'}};
var PZF='all',PZR=null,WB=false,RNDLIVE=false;

/* ---------- small helpers ---------- */
function pzOn(){return typeof PUZZLES!=='undefined'&&typeof PUZZLE_ORDER!=='undefined'&&PUZZLE_ORDER.length>0}
function pzGet(id){return pzOn()&&Object.prototype.hasOwnProperty.call(PUZZLES,id)&&PUZZLES[id]||null}
function pzData(){var s=db().st;if(!s.pz||typeof s.pz!=='object'||Array.isArray(s.pz))s.pz={};return s.pz}
function pzFam(p){return PZFAM[p.family]||PZFAM.grid}
function pzMin(p){return Math.max(1,Math.round((p.secs||90)/60))}
function pzTotalStars(id){var z=pzData()[id],n=0;if(z&&z.best)Object.keys(z.best).forEach(function(k){n+=(z.best[k]&&z.best[k].stars)||0});return n}
function starSvg(on){return '<svg class="st3'+(on?' on':'')+'" viewBox="0 0 24 24" aria-hidden="true">'+IC.star+'</svg>'}
function starsRow(n){return '<span class="stars3" role="img" aria-label="'+n+' of 3 stars">'+starSvg(n>=1)+starSvg(n>=2)+starSvg(n>=3)+'</span>'}
function starsTxt(n){return '★★★'.slice(0,n)+'☆☆☆'.slice(0,3-n)}
function clockTxt(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+':'+pad2(s%60)}
function dayDiff(a,b){function n(k){return Date.UTC(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10))/864e5}return Math.round(n(b)-n(a))}
/* the player's own rounds today, for the kind stop. Not shared and not synced. */
function bumpToday(){var d=db(),t=todayStr(),r=d.st.rtoday;if(!r||r.day!==t)r=d.st.rtoday={day:t,n:0};r.n++;sv(d);return r.n}
/* about 8 rounds in a day: ask once, kindly, with two equal buttons */
function maybeStop(){var d=db(),t=todayStr(),r=d.st.rtoday;if(!r||r.day!==t||r.n<8||d.st.stopDay===t||LAYERS.length)return;
  d.st.stopDay=t;sv(d);zc('stop_shown');
  dialog('Take a break?','<p>You have played a good few rounds today. Keep going if you are enjoying it, or stop here. Zest will be here whenever you like.</p>',
    [['Keep going',function(){zc('stop_continue')},'ghost'],['Stop here',function(){zc('stop_taken');CTX=null;home()},'ghost']],{esc:0})}

/* newRun() is the one place every screen change passes through, so a puzzle on screen is cleaned up there */
(function(){var nr=newRun;newRun=function(){pzTeardown();return nr.apply(this,arguments)}})();
function pzTeardown(){if(!PZR)return;var z=PZR;PZR=null;clearInterval(z.iv);try{z.ctrl&&z.ctrl.destroy&&z.ctrl.destroy()}catch(e){}}

/* ---------- anonymous usage counts ---------- */
var EVN=['onb_agree','first_round_started','first_round_finished','round_started','round_finished','round_abandoned','again_tap','next_tap','done_tap','set_started','set_finished','zen_started','retry_instant','puzzle_started','puzzle_solved','share_tap','signin_started','signin_done','rank_joined','archive_opened','stop_shown','stop_taken','stop_continue','mode_1','mode_3','mode_10','share_shown','share_text','share_done','link_open','friend_start','friend_finish','friend_beat','friend_sendback','challenge_back_tap','store_tap','link_broken','reel_open','reel_card','reel_solve','reel_skip','reel_chapter','reel_done'];
function usageOn(){return !guestOn()&&db().st.usage!==0}   // a guest (a friend playing from a link, no profile) counts and sends nothing
function guestOn(){return typeof ZC!=='undefined'&&!!ZC.guest}
/* a local tally per day under its own key (never in the synced save). Only fixed names are ever counted. */
function zc(name){try{if(EVN.indexOf(name)<0||!usageOn())return;var e=lsJson('zv4.ev')||{days:{}},t=todayStr();if(!e.days||typeof e.days!=='object')e.days={};var a=e.days[t]=e.days[t]||{};a[name]=(a[name]||0)+1;
  var ks=Object.keys(e.days).sort();while(ks.length>14)delete e.days[ks.shift()];lsSet('zv4.ev',JSON.stringify(e))}catch(x){}}
/* One POST a day at most, for the latest finished day that has counts. No identifiers, no auth header. Any failure is silent; the tally stays for the next launch. */
var evBusy=false;
async function evFlush(){if(evBusy||!usageOn()||navigator.onLine===false)return false;var e=lsJson('zv4.ev'),t=todayStr();if(!e||!e.days||e.sent===t)return false;
  var days=Object.keys(e.days).filter(function(k){return k<t&&/^\d{4}-\d{2}-\d{2}$/.test(k)}).sort();if(!days.length)return false;
  var day=days[days.length-1],ev={};EVN.forEach(function(n){var v=e.days[day][n];if(v>0)ev[n]=Math.min(v,100000)});if(!Object.keys(ev).length)return false;
  evBusy=true;var ctl=new AbortController(),tm=setTimeout(function(){ctl.abort()},8000);
  try{var r=await fetch(API+'/v1/ev',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({day:day,events:ev}),signal:ctl.signal,credentials:'omit'});
    if(r.status===204||r.ok){var e2=lsJson('zv4.ev')||{days:{}};Object.keys(e2.days||{}).forEach(function(k){if(k<=day)delete e2.days[k]});e2.sent=t;lsSet('zv4.ev',JSON.stringify(e2));return true}return false}
  catch(x){return false}finally{clearTimeout(tm);evBusy=false}}

/* ---------- puzzles: cards, shelf, browse ---------- */
function pcard(id,why){var p=PUZZLES[id],z=pzData()[id],fam=pzFam(p),done=z&&z.best?Object.keys(z.best).length:0,on=done?Math.max(1,Math.round(done/p.levels*5)):0,ts=pzTotalStars(id),lv=z?Math.min(p.levels,z.lvl||1):1;
  return '<button class="lc pz" data-p="'+esc(id)+'"><span class="lct">'+artBox(id,'<span class="sico" style="--c:var('+fam.col+')">'+ico(fam.ic)+'</span>')+(z?'':'<span class="new">New</span>')+'</span><b>'+esc(p.name)+'</b><span class="lm">'+esc(fam.name)+' puzzle · about '+plural(pzMin(p),'min')+'</span>'+
   '<span class="lm"><span class="pips" aria-hidden="true">'+[1,2,3,4,5].map(function(i){return '<i'+(i<=on?' class="on"':'')+'></i>'}).join('')+'</span><span class="sr">Level '+lv+' of '+p.levels+' reached.</span></span>'+
   (why?'<em class="why">'+esc(why)+'</em>':'')+(ts?'<em class="num best">'+starSvg(1)+' '+plural(ts,'star')+'</em>':'')+'</button>'}
function pzNewShelf(){if(!pzOn())return null;var items=PUZZLE_ORDER.filter(function(id){return !pzData()[id]}).map(function(id){return {p:id,why:null}});return items.length?{k:'pznew',t:'New puzzles',items:items}:null}
function pzWireCards(root){root.querySelectorAll('.lc[data-p]').forEach(function(b){b.onclick=function(){infoPage(b.dataset.p)}})}

/* ---------- the ladder: a winding path of numbered stones ---------- */
function pzLadder(id){var p=pzGet(id);if(!p){library();return}newRun();setTab('lib');CTX=null;var d=db(),z=pzData()[id]||{lvl:1,best:{}},lvl=Math.min(p.levels,Math.max(1,z.lvl||1)),next=null,zen=!!d.st.pzzen,fam=pzFam(p),jmax=Math.min(p.levels,lvl+1),best=z.best||{},st='';
  for(var i=1;i<=lvl;i++)if(!best[i]){next=i;break}
  for(i=1;i<=p.levels;i++){var b=best[i],off=Math.round(Math.sin(i*.85)*14);
    if(i<=lvl)st+='<li style="--o:'+off+'%"><button class="stone'+(b?' done':'')+(i===next?' next':'')+'" data-l="'+i+'" aria-label="Level '+i+(b?', '+plural(b.stars,'star'):i===next?', next':', not finished yet')+'"><span class="sn num">'+i+'</span>'+(b?'<span class="ss" aria-hidden="true">'+starsTxt(b.stars)+'</span>':i===next?'<span class="ss" aria-hidden="true">Next</span>':'')+'</button></li>';
    else st+='<li style="--o:'+off+'%"><span class="stone lock" role="img" aria-label="Level '+i+', not reached yet"><span class="sn num">'+i+'</span></span></li>'}
  show('<div><button class="back" id="bk">'+ico('back')+' Back</button></div><h1 class="s" style="display:flex;align-items:center;gap:12px">'+artBox(id,'<span class="sico" style="--c:var('+fam.col+');flex:none">'+ico(fam.ic)+'</span>','flex:none')+'<span>'+esc(p.name)+'</span></h1><p class="tag" style="margin-bottom:8px">'+esc(p.how)+'</p>'+
   '<div class="zcard" style="padding:4px 18px"><button class="set" id="zenb" role="switch" aria-checked="'+zen+'"><span class="t"><b>Zen</b><span>No clock and no time pressure. Your progress is still saved.</span></span><span class="sw'+(zen?' on':'')+'" aria-hidden="true"></span></button></div>'+
   '<ol class="lad" aria-label="Levels">'+st+'</ol>'+
   '<div class="zcard jump"><label for="jmp" class="ct">Jump to a level</label><div style="display:flex;gap:8px;margin-top:8px"><input id="jmp" class="inp" type="number" inputmode="numeric" min="1" max="'+jmax+'" value="'+(next||lvl)+'" aria-describedby="jmsg"><button class="zbtn ghost" id="jgo" style="padding:0 18px">Go</button></div><div class="fine" id="jmsg" role="status" aria-live="polite">Any level you have reached, and one more. Levels 1 to '+jmax+' are open.</div></div>'+
   '<div class="dock stk"><button class="zbtn pri wide" id="pgo">'+(zen?'Play level '+(next||lvl)+' in Zen':'Play level '+(next||lvl))+'</button></div>',true,{back:function(){infoPage(id)}});
  $('bk').onclick=function(){infoPage(id)};
  function go(l){playPuzzle(id,l,{zen:!!db().st.pzzen})}
  scr.querySelectorAll('.stone[data-l]').forEach(function(b){b.onclick=function(){go(+b.dataset.l)}});
  $('pgo').onclick=function(){go(next||lvl)};
  $('zenb').onclick=function(){var dd=db();dd.st.pzzen=dd.st.pzzen?0:1;sv(dd);keepView(function(){pzLadder(id)})};
  $('jgo').onclick=function(){var v=$('jmp').value.trim(),n=/^\d{1,3}$/.test(v)?+v:0;if(n<1||n>jmax){$('jmsg').textContent='Pick a level from 1 to '+jmax+'.';$('jmsg').style.color='var(--bad)';$('jmp').setAttribute('aria-invalid','true');return}go(n)};
  $('jmp').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();$('jgo').click()}};
  var nx=scr.querySelector('.stone.next')||scr.querySelector('.stone.done:last-of-type');if(nx&&nx.scrollIntoView)try{nx.scrollIntoView({block:'center'})}catch(e){}}

/* Start on the story page: the next level you have not finished (Zen if the switch is on) */
function pzNext(id){var p=PUZZLES[id],z=pzData()[id]||{lvl:1,best:{}},lvl=Math.min(p.levels,Math.max(1,z.lvl||1)),b=z.best||{};for(var i=1;i<=lvl;i++)if(!b[i])return i;return lvl}
function pzStart(id){playPuzzle(id,pzNext(id),{zen:!!db().st.pzzen})}
/* See demo for a puzzle: the rules, with the puzzle's own demo(root) if it has one, else a still picture */
function pzHow(id){var p=PUZZLES[id],art=window.ART&&ART[id],fam=pzFam(p),pic=art?'<div class="arthero" aria-hidden="true">'+art.hero+'</div>':'<div class="arthero fb" aria-hidden="true"><span class="sico big" style="--c:var('+fam.col+')">'+ico(fam.ic)+'</span></div>',own=typeof p.demo==='function';
  dialog('How to play',(own?'<div id="pzdemo" class="pzroot"></div>':pic)+'<p><b>'+esc(p.name)+'.</b> '+esc(p.how)+'</p>',[['Start',function(){pzStart(id)}],['Close',function(){},'ghost']],{esc:1});
  if(own){var el=$('pzdemo');try{p.demo(el,{rm:reduced()})}catch(e){if(el)el.outerHTML=pic}}}
/* ---------- the runner ---------- */
/* o: {seed, tag, zen, daily:'YYYY-MM-DD', friend:{t}, unranked, exit}. Ladder plays save to st.pz; a daily, past daily or friend's level never touches the ladder. */
function playPuzzle(id,level,o){o=o||{};var p=pzGet(id);if(!p){goOrigin();return}level=clamp(Math.round(+level)||1,1,p.levels);
  var t=newRun(),zen=!!o.zen,tag=o.tag||(o.seed?String(o.seed).split('|').slice(2).join('|'):''),seed=o.seed||pzSeed(id,level,tag),inst,rng=pzRng(seed),rm=reduced();
  var exit=o.exit||(o.daily?home:library),again=function(){playPuzzle(id,level,Object.assign({},o,{seed:seed,instant:1}))};
  try{inst=p.make(level,rng)}catch(e){try{console.error(e)}catch(_){}gameFailed();return}
  var tm={acc:0,last:performance.now()},mv=0,hints=0,undos=0,hn=0,fin=false,from=o.from||function(){o.daily?exit():pzLadder(id)};CTX={from:from,pz:1};if(o.setCtx){CTX.set=o.setCtx.set;CTX.i=o.setCtx.i;CTX.queue=o.setCtx.queue}
  zc('puzzle_started');if(zen)zc('zen_started');if(o.instant)zc('retry_instant');
  function clockNow(){var n=performance.now();if(!run.paused)tm.acc+=n-tm.last;tm.last=n;return tm.acc}
  show('<div class="top pzt"><button class="ibtn" id="xb" aria-label="Leave this puzzle">'+ico('x')+'</button><div class="pzl"><b>'+esc(inst&&inst.title||'Level '+level)+'</b><small>'+esc(p.name)+(zen?' · Zen':'')+'</small></div><span class="pzm num" id="pzm">0 moves</span>'+(zen?'':'<span class="pzc num" id="pzc" aria-hidden="true">0:00</span>')+'</div>'+
    '<p class="sm pzcap" id="pzcap">'+(o.friend&&o.friend.t!=null?esc(frWho(o.friend,1))+' got '+plural(o.friend.t,'move')+(o.friend.hints?' with '+plural(o.friend.hints,'hint'):'')+'. Can you beat it? ':'')+(o.setCtx&&o.setCtx.queue?'Game '+(o.setCtx.i+1)+' of '+o.setCtx.queue.n+'. ':'')+esc(p.how)+'</p>'+(o.friend&&o.friend.note?'<p class="sm" id="pznote">'+esc(o.friend.note)+'</p>':'')+'<div class="pzroot" id="pzroot"></div>'+
    '<div class="pzbar">'+(p.undo===false?'':'<button class="zbtn ghost" id="pzu">Undo</button>')+'<button class="zbtn ghost" id="pzr">Restart</button><button class="zbtn ghost" id="pzhb">Hint</button></div><div class="pzh" id="pzh" role="status" aria-live="polite"></div><div id="pzlive" class="sr" role="status" aria-live="polite"></div>'+(o.guest?'<p class="zgt">By playing you agree to the <a href="https://orangepulplabs.com/zest/terms/" target="_blank" rel="noopener">Terms</a> and <a href="https://orangepulplabs.com/zest/privacy/" target="_blank" rel="noopener">Privacy policy</a>.</p>':''),
    'round',{back:function(){askLeave(false)}});wireX();
  if(inst&&typeof inst==='object')inst.toolbar=false;   // the runner draws Undo, Restart and Hint itself
  var api={rm:rm,zen:zen,toolbar:false,relaxed:!!db().st.rx,now:function(){return clockNow()},
    say:function(x){var e=$('pzlive');if(e){e.textContent='';setTimeout(function(){if(e)e.textContent=x},30)}},
    moved:function(){if(fin)return;mv++;hn=0;var e=$('pzm');if(e)e.textContent=plural(mv,'move');var c=$('pzcap');if(c)c.hidden=true;var h=$('pzh');if(h)h.textContent=''},
    done:function(res){if(fin||t!==run.id)return;fin=true;pzDone(id,level,o,seed,inst,res||{},{secs:Math.round(clockNow()/1000),mv:mv,hints:hints,undos:undos,zen:zen,exit:exit,again:again})}};
  var ctrl;try{ctrl=p.mount($('pzroot'),inst,api)}catch(e){try{console.error(e)}catch(_){}gameFailed();return}
  PZR={id:id,ctrl:ctrl,iv:0};
  if(!zen)PZR.iv=setInterval(function(){if(t!==run.id){clearInterval(PZR&&PZR.iv);return}var c=$('pzc'),n=clockNow();if(c)c.textContent=clockTxt(n)},1000);
  if($('pzu'))$('pzu').onclick=function(){if(fin)return;try{ctrl.undo&&ctrl.undo()}catch(e){}undos++;if(mv>0){mv--;var e=$('pzm');if(e)e.textContent=plural(mv,'move')}};
  $('pzr').onclick=function(){if(fin)return;try{ctrl.restart&&ctrl.restart()}catch(e){}mv=0;hn=0;var e=$('pzm');if(e)e.textContent='0 moves';var h=$('pzh');if(h)h.textContent='Back to the start.'};
  $('pzhb').onclick=function(){if(fin)return;hn=Math.min(3,hn+1);var tx=null;try{tx=ctrl.hint&&ctrl.hint(hn)}catch(e){}hints++;var h=$('pzh');if(h){h.textContent='';setTimeout(function(){h.textContent=tx?'Hint '+hn+' of 3: '+tx:'No hint for this one right now.'},30)}};
  try{var f=$('pzroot').querySelector('button,[tabindex]');if(f&&!document.activeElement.closest('#screen')){}}catch(e){}}
function pzBetter(a,b,zen){if(!b)return true;if(a.stars!==b.stars)return a.stars>b.stars;if(a.moves!==b.moves)return a.moves<b.moves;return !zen&&a.secs>0&&b.secs>0&&a.secs<b.secs}
async function pzDone(id,level,o,seed,inst,res,x){
  var p=PUZZLES[id],t=run.id,moves=isNum(res.moves)?res.moves:x.mv,r={solved:true,moves:moves,hints:res.hints!=null?res.hints:x.hints,undos:res.undos!=null?res.undos:x.undos,extra:res.extra||{},secs:x.secs,zen:x.zen},sr;
  try{sr=p.stars(r,inst)||{}}catch(e){sr={}}var stars=clamp(Math.round(+sr.stars)||0,0,3),line=String(sr.line||'');
  var d=db(),z=pzData(),ladder=!o.daily&&!o.friend&&!o.unranked,prior=ladder&&z[id]&&z[id].best?z[id].best[level]:null,rec={moves:moves,secs:x.zen?0:x.secs,stars:stars},isBest=false,day=o.daily;
  if(ladder){var e=z[id]||(z[id]={lvl:1,best:{}});e.best=e.best||{};e.lvl=Math.max(e.lvl||1,Math.min(level+1,p.levels));(d.st.pzlast=d.st.pzlast||{})[id]=Date.now();
    if(pzBetter(rec,prior,x.zen)){isBest=!!prior;e.best[level]=x.zen&&prior&&prior.secs&&prior.moves===moves?{moves:moves,secs:prior.secs,stars:stars}:rec}}
  else if(day&&!o.unranked){d.st.pzday=d.st.pzday||{};d.st.pzday[day]={id:id,level:level,moves:moves,stars:stars}}
  if(o.unranked&&day){d.st.arch=d.st.arch||{};d.st.arch[day]=1}
  sv(d);if(ladder)scheduleSync();zc('puzzle_solved');if(o.friend){zc('friend_finish');if(o.friend.t!=null&&moves<o.friend.t)zc('friend_beat')}bumpToday();
  if(!reduced())await sleep(150);if(t!==run.id)return;
  pzResult(id,level,o,seed,inst,r,{stars:stars,line:line,isBest:isBest,prior:prior,x:x})}
/* a friend's name for the sentences: 'a friend' (or none) reads 'A friend' / 'They'; a preset reads as it is */
function frWho(f,cap){var w=f&&f.who&&f.who!=='a friend'?f.who:'';return w||(cap?'A friend':'They')}
/* local share bookkeeping (never synced, never sent): plays per level, chips shown since the last tap, collapsed until the next personal best */
function shrGet(){var s=lsJson('zv4.shr');if(!s||typeof s!=='object'||Array.isArray(s))s={};if(!s.plays||typeof s.plays!=='object')s.plays={};s.shown|=0;s.off=s.off?1:0;return s}
function shrSave(s){var k=Object.keys(s.plays);if(k.length>400)k.slice(0,k.length-400).forEach(function(x){delete s.plays[x]});lsSet('zv4.shr',JSON.stringify(s))}
var PLAY_PKG='com.orangepulplabs.zest';   // PLACEHOLDER: the app is not on the Play Store yet. Change this id (and check the link) when it is published.
function playUrl(){return 'https://play.google.com/store/apps/details?id='+PLAY_PKG+'&referrer='+encodeURIComponent('utm_source=challenge&utm_medium=share')}
function pzFresh(){var day=todayStr(),pd=pzDaily(day);if(pd)return {id:pd.id,level:pd.level,tag:day};var id=dailyPick(day+'|pzfb',PUZZLE_ORDER),p=PUZZLES[id]||PUZZLES[PUZZLE_ORDER[0]];return {id:p.id,level:1+Math.floor(seeded('pzlv|'+day)()*Math.max(1,Math.ceil(p.levels/3))),tag:day}}

function pzResult(id,level,o,seed,inst,r,q){newRun();var p=PUZZLES[id],x=q.x,par=inst&&isNum(inst.par)?inst.par:r.extra&&isNum(r.extra.par)?r.extra.par:null,ladder=!o.daily&&!o.friend&&!o.unranked&&!o.guest,nextL=ladder&&level<p.levels?level+1:0,exit=x.exit,
  almost=par!==null&&q.stars<3&&r.moves>par?plural(r.moves-par,'move')+' over the shortest.':par!==null&&q.stars<3&&r.moves<=par?'You matched the shortest.':'',
  fo=o.friend||null,ft=fo&&fo.t!=null?fo.t:null,guest=guestOn(),tag=String(seed).split('|').slice(2).join('|'),me=r.moves,
  cmp=ft===null?'':me<ft?'win':me===ft?'tie':me===ft+1?'close':'far',who=frWho(fo),
  fr=cmp==='win'?'You beat it. '+me+' moves vs '+(fo.who&&fo.who!=='a friend'?fo.who+'’s ':'')+ft+'.':cmp==='tie'?'A perfect tie. '+me+' moves each.':cmp==='close'?'So close. '+who+' got '+ft+'. You got '+me+'. One move fewer and it is a tie.':cmp==='far'?'Good effort. '+who+' got '+ft+'. You got '+me+'. Same puzzle, so a retry is fair.':'',
  frh=(r.hints?'You got '+me+' with '+plural(r.hints,'hint')+'.':'')+(ft!==null&&fo.hints?' '+who+' used '+plural(fo.hints,'hint')+'.':'');
  var S=shrGet(),sk=id+'|'+level,plays=S.plays[sk]||0,chip=null,sd={id:id,level:level,tag:tag,moves:me,hints:r.hints||0,stars:q.stars,par:par,prev:q.prior?q.prior.moves:null,ft:ft,fr:fo&&fo.r||0,daily:o.daily&&!o.unranked?o.daily:null,name:p.name,exit:exit,o:o},vi=0;
  /* a puzzle has no percentile yet: nothing about rankings is shown on this screen */
  if(!fo&&!o.guest)S.plays[sk]=plays+1;
  if(me>0)chip=ZC.chipFor({moves:me,par:par,stars:q.stars,hints:r.hints,isBest:q.isBest,plays:plays,friendT:ft,daily:!!o.daily,unranked:!!o.unranked});
  if(chip&&chip.kind==='beaten')chip=null;   // a win over a friend already has 'Send my result back' as the main button
  if(q.isBest&&S.off){S.off=0;S.shown=0}
  if(chip&&S.off)chip=null;
  if(chip){S.shown++;if(S.shown>=10)S.off=1;zc('share_shown')}
  shrSave(S);
  var lines=fr?'<p class="tip"><b>'+esc(fr)+'</b></p>'+(frh?'<p class="sm" style="margin:6px 0 0">'+esc(frh)+'</p>':''):(frh&&r.hints?'':'');
  var sq=o.setCtx,sqNext=sq&&sq.set&&sq.i<sq.set.length-1&&!fo?itemInfo(sq.set[sq.i+1].id):null,
  primary=sqNext?'<button class="zbtn pri wide two-l" id="nx"><b>'+(sq.queue?'Next game':'Next in your set')+'</b><small>'+(sq.queue?'Game '+(sq.i+2)+' of '+sq.queue.n+': ':'')+esc(sqNext.title)+'</small></button>':cmp==='win'||cmp==='tie'?'<button class="zbtn pri wide" id="nx">Send my result back</button>':cmp==='close'||cmp==='far'?'<button class="zbtn pri wide" id="nx">Try again</button>':fo?'<button class="zbtn pri wide" id="nx">Play another</button>':
    (nextL?'<button class="zbtn pri wide two-l" id="nx"><b>Next level</b><small>Level '+nextL+'</small></button>':(ladder?'':'<button class="zbtn pri wide two-l" id="nx"><b>See all levels</b><small>'+esc(p.name)+'</small></button>')),
  dock2=fo&&ft!==null?'<button class="zbtn ghost" id="pa">Play another</button>'+(guest?'':'<button class="zbtn ghost" id="dn">Done for now</button>'):fo?(guest?'':'<button class="zbtn ghost" id="dn">Done for now</button>'):'<button class="zbtn ghost" id="ag">Play again</button><button class="zbtn ghost" id="dn">Done for now</button>';
  show('<div class="res"><div class="rtop"><button class="back" id="bk">'+ico('back')+' '+(guest?'Zest':fo?'Challenges':ladder?'Levels':o.daily?(o.unranked?'Past dailies':'Today'):'Challenges')+'</button>'+(me>0?'<button class="ibtn" id="shi" aria-label="Share this puzzle">'+ico('share')+'</button>':'')+'</div><div class="core"><h1 class="pill sh" style="align-self:flex-start">'+esc(p.name)+' · Level '+level+'</h1>'+
   '<div style="margin-top:10px">'+starsRow(q.stars)+'</div><div class="bigv small" style="margin-top:6px">'+(q.stars?q.stars+' of 3 stars':'Solved')+'</div>'+
   (q.line?'<p class="starline">'+esc(q.line)+'</p>':'')+(almost?'<p class="sm" style="margin:2px 0 0">'+almost+'</p>':'')+
   (q.isBest?'<div class="badge best" role="status">'+ico('star')+' New best</div>':'')+
   '<div class="chp"><span class="num">'+plural(r.moves,'move')+'</span>'+(x.zen?'':'<span class="num">'+clockTxt(x.secs*1000)+'</span>')+(r.hints?'<span class="num">'+plural(r.hints,'hint')+'</span>':'')+(r.undos?'<span class="num">'+plural(r.undos,'undo')+'</span>':'')+'</div>'+
   lines+(o.unranked?'<div class="tip">Unranked practice. Nothing here changes your scores or your week.</div>':o.daily?'<div class="tip">The challenge of the day is the same for everyone. It does not change your ladder.</div>':'')+
   (chip?'<div class="shc"><button class="chip" id="shc">'+ico('share')+' '+esc(chip.label)+'</button><div id="shx" hidden><p class="shp" id="shp"></p><div class="chrow"><button class="chip shg" id="shw">Change wording</button></div></div></div>':'')+
   (guest?'<div class="zcard zstore"><p>Enjoyed that? Zest has a puzzle every day.</p><div class="row"><button class="zbtn ghost" id="stb">Get Zest on Google Play</button><button class="zbtn ghost" id="kph">Keep playing here</button></div></div>':'')+'</div>'+
   '<div class="dock stk">'+primary+'<div class="dock2">'+dock2+'</div></div></div>',true,{back:ladder?function(){pzLadder(id)}:exit});
  if(q.isBest){if(typeof ZD!=='undefined'){ZD.sound('best');ZD.haptic('best')}else sfx('done')}
  $('bk').onclick=ladder?function(){pzLadder(id)}:exit;
  var again=function(){zc('again_tap');x.again()},another=function(){zc('again_tap');pzAnother(id,level,o)};
  if($('ag'))$('ag').onclick=again;if($('pa'))$('pa').onclick=another;if($('dn'))$('dn').onclick=function(){zc('done_tap');if(sq&&sq.set&&!sqNext)finishToday();else exit()};
  if($('nx'))$('nx').onclick=function(){if(sqNext){zc('next_tap');CTX={set:sq.set,i:sq.i+1,from:sq.from,queue:sq.queue};stepTo(sq.i+1);return}if(cmp==='win'||cmp==='tie'){zc('friend_sendback');pzShare(sd,cmp==='win'?'beaten':'tie',vi)}else if(cmp==='close'||cmp==='far')again();else if(fo)another();else{zc('next_tap');if(nextL)playPuzzle(id,nextL,{zen:x.zen});else pzLadder(id)}};
  /* the share icon: the chip's own wording when there is a chip, else a plain 'nudge' (no score in it) */
  var kindIcon=chip?chip.kind:cmp==='win'?'beaten':cmp==='tie'?'tie':cmp==='close'?'closeLoss':'nudge';
  if($('shi'))$('shi').onclick=function(){pzShare(sd,kindIcon,vi)};
  if($('shc')){var tx=function(){var t=pzShareText(sd,chip.kind,vi);if($('shp'))$('shp').textContent=t.text.split('\n')[0]};
    $('shc').onclick=function(){if(chip.kind==='closeLoss')zc('challenge_back_tap');var S2=shrGet();S2.shown=0;S2.taps=(S2.taps|0)+1;S2.off=0;shrSave(S2);$('shx').hidden=false;tx();pzShare(sd,chip.kind,vi)};
    $('shw').onclick=function(){vi=(vi+1)%2;zc('share_text');tx();$('shw').focus()}}
  if($('stb'))$('stb').onclick=function(){zc('store_tap');try{window.open(playUrl(),'_blank','noopener')}catch(e){}};
  if($('kph'))$('kph').onclick=function(){ZC.endGuest();CTX=null;home()};
  maybeStop()}
/* a fresh puzzle of the same kind and level: new seed, no target, saves nothing to the ladder */
function pzAnother(id,level,o){var f=o.friend||{};playPuzzle(id,level,{tag:ZC.seedTag(ZC.newSeed()),friend:{t:null,who:f.who},exit:o.exit,from:o.from,guest:o.guest})}

/* legacy link, kept so old callers and old shared links still work. New links go through ZC.link (a self-contained token). */
function pzLink(id,level,tag,t){return 'https://orangepulplabs.com/zest/play/?c='+encodeURIComponent(id)+'&l='+level+'&s='+encodeURIComponent(tag||'')+'&t='+(isNum(t)?Math.round(t):0)}
/* the text and link for one share. sd: the result's facts. kind: a key of ZC.TEMPLATES. Returns {text, link}; the link sits on its own line after the body. */
function pzShareText(sd,kind,vi){var reply=kind==='beaten'||kind==='tie'||kind==='closeLoss',seed=ZC.tagSeed(sd.tag),link=null,tg=ZC.NOTARGET[kind]?null:sd.moves;
  if(kind==='daily'&&sd.daily)link=ZC.link({id:sd.id,level:sd.level,daily:sd.daily,hints:sd.hints});
  else if(reply)link=ZC.link({id:sd.id,level:sd.level,seed:ZC.newSeed(),target:tg,hints:sd.hints,r:Math.min(255,(sd.fr|0)+1)});
  else if(seed!==null)link=ZC.link({id:sd.id,level:sd.level,seed:seed,target:tg,hints:sd.hints,r:sd.fr|0});
  if(!link)link=pzLink(sd.id,sd.level,sd.tag,tg);
  var text=ZC.message(kind,{name:sd.name,lv:sd.level,n:sd.moves,prev:sd.prev,their:sd.ft,mine:sd.moves,num:dayNum(),stars:sd.stars,hints:sd.hints},vi);
  return {text:text+'\n'+link,link:link,body:text}}
async function pzShare(sd,kind,vi){zc('share_tap');var t=pzShareText(sd,kind,vi);
  try{if(navigator.share){await navigator.share({text:t.text});zc('share_done');return}}catch(e){if(e&&e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(t.text);zc('share_done');toast('Copied. Paste it anywhere to share.');return}catch(e){}
  dialog('Challenge a friend','<p>Copy this to share it.</p><p><input class="inp" id="shtxt" readonly value="'+esc(t.text.replace('\n',' '))+'" aria-label="Text to share"></p>',[['Close',function(){}]],{focus:'#shtxt'});var i=$('shtxt');if(i)i.select()}

/* ---- opening a challenge link ----
   The address is read ONCE, here, held in memory (FRIEND) and in sessionStorage, and the challenge parameters are taken off the address. A brand-new
   friend is a guest (see challenge.js): they go straight to the puzzle. A player who has to finish the first-run agreement first resumes it afterwards. */
var FRIEND;
function zctx(){return {today:ZC.dayIdx(),levelsOf:function(id){var p=pzGet(id);return p?p.levels:0},
  parOf:function(id,l,tg){try{var i=pzGet(id).make(l,pzRng(pzSeed(id,l,tg)));return isNum(i.par)?i.par:null}catch(e){return null}},
  dailyOk:function(day,id,l){var pd=pzDaily(day);return !!pd&&pd.id===id&&pd.level===l}}}
/* legacy parser, now a thin wrapper (null for anything malformed or not legacy) */
function pzFromUrl(search){try{var s=search===undefined?location.search:search;if(!/[?&]l=/.test(s)||typeof ZC==='undefined')return null;var f=ZC.fromSearch(s,zctx());return f&&f.ok&&pzOn()&&pzGet(f.id)?{id:f.id,level:f.level,tag:f.tag,t:f.t}:null}catch(e){return null}}
function friendGet(){if(FRIEND!==undefined)return FRIEND;FRIEND=null;if(typeof ZC==='undefined')return null;
  try{var s=location.search;if(/[?&]c=/.test(s)){var f=pzOn()?ZC.fromSearch(s,zctx()):{ok:false,why:'none'};
      if(f&&f.ok&&!pzGet(f.id))f={ok:false,why:'not loaded'};
      FRIEND=f&&f.ok?f:{broken:true,why:f&&f.why};zc(f&&f.ok?'link_open':'link_broken');
      try{var q=new URLSearchParams(s);['c','l','s','t'].forEach(function(k){q.delete(k)});history.replaceState(history.state,'',location.pathname+(q.toString()?'?'+q:''))}catch(e){}
      if(!guestOn()){try{sessionStorage.setItem('zv4.friend',JSON.stringify(FRIEND))}catch(e){}}}
    else{var j=JSON.parse(sessionStorage.getItem('zv4.friend')||'null');if(j&&typeof j==='object'&&(j.broken||(typeof j.id==='string'&&pzGet(j.id)&&isNum(j.level))))FRIEND=j}}catch(e){}
  return FRIEND}
function friendReady(){if(guestOn())return true;var d=db();return !!(d.p&&d.p.done)&&!termsNeeded()&&!lsGet(LS_BLOCK)}
function friendStart(f){if(f.broken){friendBroken();return}var g=guestOn(),home0=g?guestHome:home;zc('friend_start');
  var note=f.old?'This one is a little old, but you can still play it for fun.':f.off?'This link looks a bit off, so here is the puzzle without a score.':'';
  playPuzzle(f.id,f.level,{tag:f.tag,friend:{t:f.t,hints:f.hints,r:f.r,who:f.who,note:note},exit:home0,from:home0,guest:g})}
function friendResume(){var f=friendGet();if(!f||f.started||!friendReady())return false;f.started=1;try{sessionStorage.removeItem('zv4.friend')}catch(e){}friendStart(f);return true}
function friendBoot(){return friendResume()}
/* a link that is broken, unknown or retired: a calm line and one button */
function friendBroken(){var g=guestOn(),fr=pzFresh();
  show('<div class="core"><h1 class="s">That puzzle has moved on.</h1><p class="tag">Here is a fresh one.</p>'+(g?'<p class="zgt">By playing you agree to the <a href="https://orangepulplabs.com/zest/terms/" target="_blank" rel="noopener">Terms</a> and <a href="https://orangepulplabs.com/zest/privacy/" target="_blank" rel="noopener">Privacy policy</a>.</p>':'')+'</div><div class="dock stk"><button class="zbtn pri wide" id="fb">Play today’s puzzle</button></div>',true,{back:g?guestHome:home});
  $('fb').onclick=function(){playPuzzle(fr.id,fr.level,{tag:fr.tag,friend:{t:null},exit:g?guestHome:home,from:g?guestHome:home,guest:g})}}
/* the guest's own small hub (leaving a puzzle with X): play again, or open the app. Nothing is stored. */
function guestHome(){var f=FRIEND&&!FRIEND.broken?FRIEND:null,fr=pzFresh();newRun();
  show('<div class="core"><h1 class="s">Zest</h1><p class="tag">A short puzzle, the same one they played.</p></div><div class="dock stk"><button class="zbtn pri wide" id="gp">Play the puzzle</button><div class="dock2"><button class="zbtn ghost" id="go">Open Zest here</button></div></div>',false,{back:guestHome});
  $('gp').onclick=function(){if(f)friendStart(f);else playPuzzle(fr.id,fr.level,{tag:fr.tag,friend:{t:null},exit:guestHome,from:guestHome,guest:true})};
  $('go').onclick=function(){ZC.endGuest();CTX=null;home()}}

/* ---------- the challenge of the day: one pick per date, the same for everyone, from all puzzles plus the nine kept games ---------- */
function secText(t){return t<60?'about '+(Math.round(t/10)*10)+' s':'about '+plural(Math.round(t/60),'min')}
function cotdPool(){return (pzOn()?PUZZLE_ORDER:[]).concat(KEEP_GAMES.filter(function(g){return !!stage(g)&&!!ch(g+':std')}))}
/* {kind:'p',id,p,level} for a puzzle (level in the first third, chosen by date) or {kind:'g',id:'hold:std',c,stage} for a game. A published admin daily for a kept game overrides. */
function cotd(day){var c=ch('daily:'+day);
  if(c&&isKept(c.stage))return {kind:'g',id:c.id,c:c,stage:c.stage,name:c.name,desc:c.desc,secs:estSec(c),day:day};
  var id=dailyPick(day+'|cotd',cotdPool());
  if(pzGet(id)){var p=PUZZLES[id];return {kind:'p',id:id,p:p,name:p.name,desc:p.blurb,level:1+Math.floor(seeded('pzlv|'+day)()*Math.max(1,Math.ceil(p.levels/3))),secs:p.secs||90,day:day}}
  var g=ch(id+':std'),s=stage(id);return {kind:'g',id:g.id,c:g,stage:id,name:s.name,desc:g.desc,secs:estSec(g),day:day}}
function pzDayKind(day){return cotd(day).kind==='p'}
function pzDaily(day){var x=cotd(day);return x.kind==='p'?{id:x.id,level:x.level,tag:day,p:x.p}:null}   // the puzzle days only
function cotdDone(x){return x.kind==='p'?!!(db().st.pzday||{})[x.day]:(db().done[x.day]||[]).indexOf(x.id)>=0}
function pzDayPlay(day,unranked){var pd=pzDaily(day);if(!pd)return;CTX={from:unranked?archive:home,pz:1};playPuzzle(pd.id,pd.level,{tag:day,daily:day,unranked:!!unranked,exit:unranked?archive:home,from:unranked?archive:home})}
function cotdPlay(day,unranked){var x=cotd(day);if(x.kind==='p'){pzDayPlay(day,unranked);return}
  if(unranked){CTX={from:archive,unranked:1,set:null};play(x.id,{unranked:1,day:day})}else{CTX={from:home,daily:1};play(x.id)}}   // no share link is ever built for a game daily
/* set and queue items: 'hold:std' (a game) or 'pz:slide-tiles' (a puzzle, at the level you are on) */
function itemInfo(id){id=String(id||'');if(id.indexOf('pz:')===0){var pid=id.slice(3),p=pzGet(pid);return p?{pz:pid,p:p,title:p.name,desc:p.blurb,secs:p.secs||90}:null}
  var c=ch(id);return c&&c.std&&isKept(c.stage)?{c:c,title:stage(c.stage).name,desc:c.desc,secs:estSec(c)}:null}
function itemIcon(it){if(it.p){var f=pzFam(it.p);return artBox(it.pz,'<span class="sico" style="--c:var('+f.col+')">'+ico(f.ic)+'</span>')}return iconBox(it.c.stage)}
function itemFam(id){var it=itemInfo(id);if(!it)return '';return it.p?pzTheme(it.pz).id:(gameTheme(it.c.stage)||{}).id||''}
function itemLast(id){var it=itemInfo(id);return it?(it.p?lastPz(it.pz):lastAt(it.c.stage)):0}
function itemDone(id){var it=itemInfo(id);if(!it)return false;return it.p?ds(lastPz(it.pz))===todayStr():(db().done[todayStr()]||[]).indexOf(id)>=0}
function stepTo(i){var set=CTX&&CTX.set;if(!set||!set[i]){home();return}var it=set[i],keep={set:set,i:i,queue:CTX.queue,from:CTX.from||home};CTX={set:set,i:i,from:keep.from,queue:keep.queue};
  if(String(it.id).indexOf('pz:')===0){var pid=it.id.slice(3);playPuzzle(pid,pzNext(pid),{zen:!!db().st.pzzen,setCtx:keep,exit:keep.from,from:keep.from})}else play(it.id)}

/* ---------- time modes ---------- */
function timeChooserHtml(){return '<div class="zcard tmode" role="group" aria-labelledby="tmh"><div class="fk" id="tmh"><span>How long do you have?</span></div><div class="chips" style="margin-top:10px"><button class="chip" data-tm="1">1 minute</button><button class="chip" data-tm="3">3 minutes</button><button class="chip" data-tm="10">10 minutes</button></div><p class="sm" style="margin:8px 0 0">A short run of puzzles and games you can stop at any time.</p></div>'}
/* a finite queue from the recommender: puzzles and the nine kept games, different families, never a repeat in one run */
function buildQueue(mins){var cands=[],seen={};function add(id){if(!seen[id]&&itemInfo(id)){seen[id]=1;cands.push(id)}}
  libPicks().forEach(function(it){add(it.p?'pz:'+it.p:it.g+':std')});
  var rest=keptStages().map(function(s){return s.id+':std'}).concat(pzOn()?PUZZLE_ORDER.map(function(id){return 'pz:'+id}):[]);
  rest=rest.filter(function(id){return !seen[id]}).sort(function(a,b){return itemLast(a)-itemLast(b)||(a<b?-1:1)});rest.forEach(add);
  var sec=function(id){return itemInfo(id).secs};
  if(mins===1){var q=cands.filter(function(id){return sec(id)<=60});return [(q.length?q:cands.slice().sort(function(a,b){return sec(a)-sec(b)}))[0]].filter(Boolean)}
  var want=mins===3?3:5,cap=mins===3?190:99999,out=[],usedF={},tot=0;
  if(mins===3)cands=cands.filter(function(id){return sec(id)<=100}).concat(cands.filter(function(id){return sec(id)>100}));
  [true,false].forEach(function(strict){cands.forEach(function(id){var f=itemFam(id);if(out.length>=want||out.indexOf(id)>=0||(strict&&usedF[f])||tot+sec(id)>cap&&out.length)return;out.push(id);usedF[f]=1;tot+=sec(id)})});
  return out}
function startMode(mins){var q=buildQueue(mins);if(!q.length)return;zc('mode_'+mins);CTX={set:q.map(function(id){return {id:id}}),i:0,from:home,queue:{mins:mins,n:q.length}};stepTo(0)}

/* ---------- past dailies: a calendar of the current month. Every past day is open; nothing is missed. ---------- */
function archive(){newRun();setTab('today');zc('archive_opened');CTX=null;var d=db(),now=new Date(),y=now.getFullYear(),m=now.getMonth(),dow=(new Date(y,m,1).getDay()+6)%7,nd=new Date(y,m+1,0).getDate(),tk=todayStr(),played={},cells='';
  d.runs.forEach(function(r){played[ds(r.t)]=1});Object.keys(d.done).forEach(function(k){if(d.done[k]&&d.done[k].length)played[k]=1});Object.keys(d.st.arch||{}).forEach(function(k){played[k]=1});Object.keys(d.st.pzday||{}).forEach(function(k){played[k]=1});
  for(var i=0;i<dow;i++)cells+='<li class="cx" aria-hidden="true"></li>';
  for(i=1;i<=nd;i++){var k=y+'-'+pad2(m+1)+'-'+pad2(i),lb=new Date(y,m,i).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}),on=!!played[k];
    cells+=k>tk?'<li><span class="cd fut" role="img" aria-label="'+lb+', not yet">'+i+'</span></li>':'<li><button class="cd'+(on?' on':'')+(k===tk?' td':'')+'" data-day="'+k+'" aria-label="'+lb+(k===tk?' (today)':'')+', '+(on?'played':'open')+'"><span class="dn">'+i+'</span><span class="dk" aria-hidden="true">'+(on?'✓':'')+'</span></button></li>'}
  show('<div><button class="back" id="bk">'+ico('back')+' Today</button></div><h1 class="s">Past dailies</h1><p class="tag" style="margin-bottom:12px">'+now.toLocaleDateString('en-IN',{month:'long',year:'numeric'})+'. Missed days are always open. Tap a day to play it.</p>'+
   '<div class="zcard"><div class="hdow" aria-hidden="true">'+'MTWTFSS'.split('').map(function(x){return '<span>'+x+'</span>'}).join('')+'</div><ol class="cal">'+cells+'</ol><p class="sm" style="margin:10px 0 0">Filled days have something played. Past days are played as unranked practice: they do not change your scores, your week or the rankings.</p></div>',true,{back:home});
  $('bk').onclick=home;scr.querySelectorAll('[data-day]').forEach(function(b){b.onclick=function(){archiveDay(b.dataset.day)}})}
function archiveDay(k){var tk=todayStr(),x=cotd(k),lb=new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10)).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}),btns=[];
  btns.push(['Play the challenge of the day: '+esc(x.name),function(){cotdPlay(k,k!==tk)}]);
  btns.push(['Close',function(){},'ghost']);
  dialog(esc(lb),'<p>'+(k===tk?'Today’s challenge of the day.':'Played as unranked practice. It does not change your scores, your week or the rankings.')+'</p>',btns,{esc:btns.length-1})}

/* ---------- just play, unranked and result screens that save nothing ---------- */
function resultLite(kind,cid,res,opts){newRun();var c=ch(cid),s=stage(c.stage),zen=kind==='zen',back=zen?goOrigin:archive,bl=zen?originName():'Past dailies',v=res&&res.valid?fmtV(s,res.score):null;
  show('<div class="res"><div><button class="back" id="bk">'+ico('back')+' '+esc(bl)+'</button></div><div class="core"><h1 class="pill'+(c.std?'':' sh')+'" style="align-self:flex-start">'+ttl(c)+'</h1>'+
   (zen?'<div class="bigv small">Nice one</div><p class="sm" style="margin-top:8px">Just play. Nothing is saved or compared.</p>':(v!==null?'<div class="bigv num">'+v+'</div><div class="unit">'+esc(s.unit)+'</div>':'<div class="bigv small">This round did not count</div>')+'<p class="sm" style="margin-top:8px">Unranked practice. It is not saved to your scores, your week or the rankings.</p>')+'</div>'+
   '<div class="dock stk"><div class="dock2"><button class="zbtn ghost" id="ag">'+(zen?'Just play again':'Play again')+'</button><button class="zbtn ghost" id="dn">Done for now</button></div></div></div>',true,{back:back});
  $('bk').onclick=back;$('ag').onclick=function(){zc('again_tap');play(cid,Object.assign({},opts,{instant:1}))};$('dn').onclick=function(){zc('done_tap');back()};maybeStop()}
function zenEnd(cid,res,opts){bumpToday();resultLite('zen',cid,res,opts)}
function unrankedEnd(cid,res,opts){var d=db();d.st.arch=d.st.arch||{};if(opts.day)d.st.arch[opts.day]=1;sv(d);bumpToday();resultLite('arch',cid,res,opts)}

/* ---------- welcome back, and boot-time bookkeeping ---------- */
function bootStamp(){var d=db();if(!d.p||!d.p.done)return;var t=todayStr(),prev=d.st.lastOpen;if(prev&&/^\d{4}-\d{2}-\d{2}$/.test(prev)&&dayDiff(prev,t)>=3)WB=true;if(prev!==t){d.st.lastOpen=t;sv(d)}}
