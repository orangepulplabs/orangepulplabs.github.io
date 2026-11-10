/* v5 Play: a 60-second reel of 10 quick cards, a "Worth knowing" break after the 5th, and a clean end card (audit 09-01..09-06).
   Pool: REEL_QUICK (families.js). The one-trial versions of 4 sourced games are copied from reel.js (REEL_TRIAL, v4) so v5 never loads v4 screens.
   Points: 10 a right answer x the combo (x2 from 3 in a row, x3 from 6), +5 when answered within 3 s (a bolt, no extra pill). Wrong: the combo
   deflates, no points lost. Skip (Skip button or swipe up): no points, combo kept. Best run and last run live in S().reel. No clock, no lives. */
var RL={run:null,el:null,busy:false,nudgeT:0};
var RL5_N=10,RL5_BREAK=5;
function rl5Arrow(dir){return '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(dir>0?'M6 20h26M22 10l10 10-10 10':'M34 20H8M18 10L8 20l10 10')+'"/></svg>'}
var RL5_COLS=[['RED','var(--rl-red)','Red'],['BLUE','var(--rl-blue)','Blue'],['GREEN','var(--rl-green)','Green'],['PURPLE','var(--rl-purple)','Purple']];
var RL5_SHAPES=[[[0,0],[1,0],[2,0],[2,1],[0,1]],[[0,0],[0,1],[0,2],[1,2],[1,1]],[[0,0],[1,0],[1,1],[1,2],[2,2]],[[0,0],[1,0],[2,0],[1,1],[1,2]],[[0,0],[0,1],[1,1],[2,1],[2,2]],[[0,0],[1,0],[2,0],[3,0],[3,1]]];
function rl5Shape(cells,rot,mir,col){var pts=cells.map(function(p){var x=p[0],y=p[1],t;if(mir)x=-x;for(var r=0;r<rot;r++){t=x;x=-y;y=t}return [x,y]}),
  mx=Math.min.apply(null,pts.map(function(p){return p[0]})),my=Math.min.apply(null,pts.map(function(p){return p[1]})),s='<svg width="96" height="96" viewBox="-1 -1 6 6" aria-hidden="true">';
  pts.forEach(function(p){s+='<rect x="'+(p[0]-mx)+'" y="'+(p[1]-my)+'" width=".92" height=".92" rx=".15" fill="'+col+'"/>'});return s+'</svg>'}
var RL5_TRIAL={
  flanker:{name:'Flanker',fam:'F1',make:function(r){var dir=r()<.5?-1:1,same=r()<.4,fl=same?dir:-dir,s='',i;for(i=0;i<5;i++)s+=rl5Arrow(i===2?dir:fl);
    return {q:'Which way does the middle arrow point?',stage:'<div role="img" aria-label="Five arrows. Find the middle one." style="display:flex;gap:2px">'+s+'</div>',ans:[{label:'Left',ok:dir<0},{label:'Right',ok:dir>0}],cols:2}}},
  stroop:{name:'Ink',fam:'F1',make:function(r){var w=RL5_COLS[Math.floor(r()*4)],o=RL5_COLS.filter(function(c){return c!==w}),ink=r()<.75?o[Math.floor(r()*3)]:w;
    return {q:'Tap the colour of the ink, not the word.',stage:'<div class="rl-word" style="color:'+ink[1]+'" role="img" aria-label="The word '+w[0].toLowerCase()+' in coloured ink">'+w[0]+'</div>',
      ans:RL5_COLS.map(function(c){return {label:c[2],html:'<span class="rl-sw" style="background:'+c[1]+'"></span>'+c[2],ok:c===ink}}),cols:2}}},
  space:{name:'Rotate',fam:'F8',make:function(r){var sh=RL5_SHAPES[Math.floor(r()*RL5_SHAPES.length)],mir=r()<.5,rot=1+Math.floor(r()*3);
    return {q:'Same shape turned, or a mirror image?',stage:'<div role="img" aria-label="Two shapes to compare" style="display:flex;gap:14px;align-items:center">'+rl5Shape(sh,0,false,'var(--ink)')+rl5Shape(sh,rot,mir,'var(--accent)')+'</div>',
      ans:[{label:'Same',ok:!mir},{label:'Mirror',ok:mir}],cols:2}}},
  search:{name:'Spot it',fam:'F1',make:function(r){var odd=Math.floor(r()*16),rot=[0,90,180,270][Math.floor(r()*4)],a=[],i,q;
    for(i=0;i<16;i++){q=i===odd?(rot+180)%360:rot;a.push({label:'Shape '+(i+1),html:'<svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true" style="transform:rotate('+q+'deg)"><path d="M7 6h16v5H12v13H7z" fill="var(--ink)"/></svg>',ok:i===odd})}
    return {q:'Tap the shape turned the other way.',stage:'',ans:a,cols:4,grid:1}}}};
function rl5Pool(){return Object.keys(REEL_QUICK).filter(function(id){return REEL_QUICK[id].trial?!!RL5_TRIAL[id]:!!P(id)})}
function rl5Fam(id){return RL5_TRIAL[id]?RL5_TRIAL[id].fam:fam(id).id}
function rl5Seq(seed,n){var pool=rl5Pool(),rng=pzRng('reelseq|'+seed),out=[],bag=[];while(out.length<n){if(!bag.length)bag=pzShuffle(pool,rng);var last=out[out.length-1],lf=last?rl5Fam(last):'',j=-1,i;
  for(i=0;i<bag.length;i++)if(bag[i]!==last&&rl5Fam(bag[i])!==lf){j=i;break}if(j<0)for(i=0;i<bag.length;i++)if(bag[i]!==last){j=i;break}if(j<0){bag=[];continue}out.push(bag.splice(j,1)[0])}return out}
function rl5Mult(n){return n>=6?3:n>=3?2:1}

/* ---------- the screen (built once) ---------- */
Nav.reg('play',{label:'Play',notabs:true,
  build:function(root){root.innerHTML='<div class="reel5"><div class="rl-top"><div class="rl-ring" aria-hidden="true"><svg viewBox="0 0 72 72"><circle class="rbg" cx="36" cy="36" r="31"/><circle class="ghost" cx="36" cy="36" r="31" hidden/><circle class="rfg" cx="36" cy="36" r="31" stroke-dasharray="194.8" stroke-dashoffset="194.8"/></svg><span class="rl-score" data-score>0</span></div>'+
    '<div class="rl-combo"><span class="rl-chip" data-chip>×1</span><span class="rl-meter" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span></div>'+
    '<button class="ibtn rl-x" data-x aria-label="Leave Play">'+icon('x')+'</button></div><div class="rl-dots" aria-hidden="true"></div><div class="rl-view"></div><p class="sr" data-sr role="status" aria-live="polite"></p></div>';
    RL.el=root;qs(root,'[data-x]').onclick=function(){rlLeave()};rlInstallSwipe(qs(root,'.rl-view'))},
  show:function(root){rlStart()},
  hide:function(root){rlStop()},
  onBack:function(){rlLeave();return true},
  reselect:function(){}});
function rlLeave(){rlStop();Nav.tab('today')}
function rlStop(){var r=RL.run;if(!r)return;r.cards.forEach(function(c){if(c.ctrl){try{c.ctrl.destroy&&c.ctrl.destroy()}catch(e){}c.ctrl=null}});clearTimeout(RL.nudgeT);clearTimeout(r.timer);RL.run=null}
function rlStart(){rlStop();var v=S(),seed=String(Math.floor(Math.random()*4294967296)),seq=rl5Seq(seed,RL5_N),cards=[];
  seq.forEach(function(id,k){if(k===RL5_BREAK)cards.push({k:'b'});var g=!!RL5_TRIAL[id],q=REEL_QUICK[id],rng=pzRng('reelcard|'+seed+'|'+k),lv=1;if(!g)lv=q.lv[0]+Math.floor(rng()*(q.lv[1]-q.lv[0]+1));
    cards.push({k:'c',id:id,game:g,level:lv,n:k+1,trial:g?RL5_TRIAL[id].make(pzRng('reeltrial|'+seed+'|'+k)):null,answered:false,ok:false,skipped:false,mv:0,t0:0})});
  cards.push({k:'e'});RL.run={seed:seed,cards:cards,idx:0,pts:0,combo:0,bestCombo:0,right:0,best:v.reel.best|0,last:v.reel.last|0,first:!v.reel.seen,ended:false,t0:Date.now()};
  ev('reel_run_start');var root=RL.el;qs(root,'.rl-top').style.visibility='';qs(root,'.rl-dots').style.visibility='';var dots=qs(root,'.rl-dots');dots.innerHTML=new Array(RL5_N+1).join('<i></i>');qs(root,'[data-score]').textContent='0';rlHud();
  var view=qs(root,'.rl-view');view.innerHTML='';rlShow(0,true)}
function rlHud(){var r=RL.run,root=RL.el;if(!r)return;var m=rl5Mult(r.combo),chip=qs(root,'[data-chip]');chip.textContent='×'+m;chip.classList.toggle('hot',m>1);
  qsa(root,'.rl-meter i').forEach(function(x,i){x.classList.toggle('on',i<Math.min(6,r.combo))});
  var ring=qs(root,'.rfg'),C=194.8,frac;if(r.best>0)frac=Math.min(1,r.pts/r.best);else{var done=r.cards.filter(function(c){return c.k==='c'&&(c.answered||c.skipped)}).length;frac=done/RL5_N}
  ring.style.strokeDashoffset=String(C*(1-frac));ring.style.stroke=r.best>0&&r.pts>r.best?'var(--gold)':'';
  var gh=qs(root,'.ghost');if(r.best>0&&r.last>0){gh.hidden=false;gh.style.strokeDashoffset=String(-C*Math.min(1,r.last/r.best)+0.75)}else gh.hidden=true;
  var di=qsa(root,'.rl-dots i'),cs=r.cards.filter(function(c){return c.k==='c'}),cur=r.cards[r.idx];di.forEach(function(d,i){var c=cs[i];d.className=c.answered?(c.ok?'ok':'no'):c.skipped?'no':c===cur?'cur':''})}
function rlCardEl(c){var r=RL.run,h;
  if(c.k==='b'){var ids=Object.keys(window.STORY||{}).filter(function(id){return P(id)&&STORY[id].fact}),id=ids[Math.floor(pzRng('fact|'+r.seed)()*ids.length)];c.fact=id;
    h='<div class="rl-card brk"><span class="kick">Halfway</span><div class="rl-wk"><span class="kick">'+icon('spark').replace('<svg','<svg width="14" height="14" style="stroke:currentColor;fill:none;stroke-width:2.4;vertical-align:-2px"')+' Worth knowing</span><p>'+esc(fixFact(STORY[id].fact))+'</p><small class="muted">'+esc(P(id).name)+' · '+esc(kick(id))+'</small></div><button class="btn pri big wide" data-go style="margin-top:20px">Keep going</button></div>'}
  else if(c.k==='e')h='<div class="rl-card end" data-end></div>';
  else{var nm=c.game?RL5_TRIAL[c.id].name:P(c.id).name;
    h='<div class="rl-card" data-card><div class="rl-kind"><span>'+esc(nm)+'</span><button class="rl-skip" data-skip>Skip</button></div>'+
      (c.game?'<p class="rl-q">'+esc(c.trial.q)+'</p><div class="rl-stage">'+c.trial.stage+'</div><div class="rl-ans c'+(c.trial.cols||2)+'">'+c.trial.ans.map(function(a,i){return '<button class="'+(c.trial.grid?'rl-cell':'rl-ab')+'" data-i="'+i+'" aria-label="'+esc(a.label)+'">'+(a.html||esc(a.label))+'</button>'}).join('')+'</div>'
        :'<div class="rl-play"><div class="pzroot" data-play></div></div>')+'</div>'}
  var e=h5(h);c.el=e;return e}
function rlShow(i,first){var r=RL.run,view=qs(RL.el,'.rl-view'),c=r.cards[i],old=view.querySelector('.rl-card:not(.leaving)');r.idx=i;var e=rlCardEl(c);view.appendChild(e);
  if(old){old.classList.add('leaving');old.style.pointerEvents='none';Nav.anim(old,[{transform:'none',opacity:1},{transform:'translateY(-48px) scale(.96)',opacity:0}],200,'cubic-bezier(.4,0,1,1)').then(function(){old.remove()})}
  Nav.anim(e,[{transform:'translateY('+(first?'24px':'40%')+') scale(.98)',opacity:0},{transform:'none',opacity:1}],first?280:340,null,old?90:0).then(function(a){Nav.clear(a)});
  if(c.k==='c'){c.t0=performance.now();if(c.game)qsa(e,'[data-i]').forEach(function(b){b.onclick=function(){rlAnswer(c,+b.dataset.i,b)}});else rlMount(c);qs(e,'[data-skip]').onclick=function(){rlSkip()};
    if(r.first&&i===0){var nd=h5('<span class="rl-nudge" aria-hidden="true">'+icon('up')+'</span>');view.appendChild(nd);RL.nudgeT=setTimeout(function(){nd.remove()},4000)}
    qs(RL.el,'[data-sr]').textContent='Card '+c.n+' of '+RL5_N}
  else if(c.k==='b'){qs(e,'[data-go]').onclick=function(){rlNext()};var f=S().facts;if(f.indexOf(c.fact)<0){f.push(c.fact);save()}}
  else rlEnd(e);
  rlHud()}
function rlMount(c){var root=qs(c.el,'[data-play]'),p=P(c.id),inst;try{inst=p.make(c.level,pzRng(pzSeed(c.id,c.level,'reel|'+RL.run.seed+'|'+c.n)))}catch(e){root.innerHTML='<p class="sm">This one did not load. Skip it.</p>';return}
  if(inst&&typeof inst==='object')inst.toolbar=false;c.inst=inst;
  var api={rm:rmOn(),zen:true,toolbar:false,relaxed:false,now:function(){return performance.now()-c.t0},say:function(x){qs(RL.el,'[data-sr]').textContent=x},
    moved:function(){c.mv++;rlDropNudge()},done:function(res){if(c.answered||!RL.run)return;var par=inst&&typeof inst.par==='number'?inst.par:null,mv=typeof (res||{}).moves==='number'?res.moves:c.mv;rlScore(c,true,par==null||mv<=par,qs(c.el,'[data-play]'))}};
  try{c.ctrl=p.mount(root,inst,api)}catch(e){root.innerHTML='<p class="sm">This one did not load. Skip it.</p>'}}
function rlDropNudge(){var n=RL.el&&qs(RL.el,'.rl-nudge');if(n)n.remove()}
function rlAnswer(c,i,b){if(c.answered||RL.busy)return;var a=c.trial.ans[i];rlDropNudge();
  if(a.ok){b.classList.add('ok');rlScore(c,true,true,b)}
  else{b.classList.add('no');var good=qs(c.el,'[data-i="'+c.trial.ans.findIndex(function(x){return x.ok})+'"]');if(good)good.classList.add('ok');
    if(!rmOn())Nav.anim(b,[{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(5px)'},{transform:'translateX(-3px)'},{transform:'none'}],320,'cubic-bezier(.2,.8,.2,1)');rlScore(c,false,false,b)}}
function rlScore(c,ok,clean,fromEl){var r=RL.run;if(!r||c.answered)return;c.answered=true;c.ok=ok;var ms=performance.now()-c.t0,root=RL.el;
  if(ok){r.combo++;r.right++;r.bestCombo=Math.max(r.bestCombo,r.combo);var m=rl5Mult(r.combo),quick=c.game?ms<3000:ms<8000,pts=(clean?10:6)*m+(quick?5:0);r.pts+=pts;
    rlFly(fromEl,pts,quick);fx('ok');var chip=qs(root,'[data-chip]');if(m>1&&!rmOn())Nav.anim(chip,[{transform:'scale(1)'},{transform:'scale(1.25)'},{transform:'scale(1)'}],260,'cubic-bezier(.3,1.4,.5,1)');
    if(window.ZD)ZD.countUp(qs(root,'[data-score]'),r.pts,500)}
  else{var had=r.combo>=3;r.combo=0;fx('soft');if(had){var ch=qs(root,'[data-chip]');if(!rmOn())Nav.anim(ch,[{transform:'scale(1)',opacity:1},{transform:'scale(.85)',opacity:.6},{transform:'scale(1)',opacity:1}],240)}}
  rlHud();clearTimeout(r.timer);r.timer=setTimeout(rlNext,Q.fast?40:ok?650:1100)}
function rlFly(fromEl,pts,quick){if(!fromEl||rmOn())return;var app=$('app').getBoundingClientRect(),a=fromEl.getBoundingClientRect(),ring=qs(RL.el,'.rl-ring').getBoundingClientRect();
  var f=h5('<span class="rl-fly">+'+pts+(quick?icon('bolt').replace('<svg','<svg style="fill:currentColor;stroke:none"'):'')+'</span>');f.style.left=(a.left-app.left+a.width/2-18)+'px';f.style.top=(a.top-app.top)+'px';$('app').appendChild(f);
  var dx=ring.left+ring.width/2-(a.left+a.width/2),dy=ring.top+ring.height/2-a.top;
  f.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate(0,-16px) scale(1.1)',opacity:1,offset:.25},{transform:'translate('+dx+'px,'+dy+'px) scale(.6)',opacity:0}],{duration:620,easing:'cubic-bezier(.5,0,.3,1)',fill:'forwards'}).finished.then(function(){f.remove()}).catch(function(){f.remove()})}
function rlSkip(){var r=RL.run,c=r&&r.cards[r.idx];if(!c||c.k!=='c'||c.answered||c.skipped)return;c.skipped=true;rlDropNudge();try{navigator.vibrate&&S()&&db().st.hap&&navigator.vibrate(8)}catch(e){}rlHud();rlNext()}
function rlNext(){var r=RL.run;if(!r)return;var c=r.cards[r.idx];if(c&&c.ctrl){try{c.ctrl.destroy&&c.ctrl.destroy()}catch(e){}c.ctrl=null}if(r.idx<r.cards.length-1)rlShow(r.idx+1)}
function rlInstallSwipe(view){var t=null;view.addEventListener('pointerdown',function(e){if(e.target.closest('button'))return;t={y:e.clientY,x:e.clientX,at:Date.now()}});
  view.addEventListener('pointerup',function(e){if(!t)return;var dy=e.clientY-t.y,dx=Math.abs(e.clientX-t.x);if(dy<-60&&dx<50&&Date.now()-t.at<700)rlSkip();t=null});
  view.addEventListener('pointercancel',function(){t=null})}
function rlEnd(e){var r=RL.run,v=S();if(r.ended)return;r.ended=true;var newBest=r.pts>(v.reel.best|0)&&(v.reel.runs|0)>0,firstRun=!(v.reel.runs|0);
  v.reel.last=r.pts;v.reel.best=Math.max(v.reel.best|0,r.pts);v.reel.runs=(v.reel.runs|0)+1;v.reel.pts=(v.reel.pts|0)+r.pts;v.reel.seen=1;save();ev('reel_run_done');var win=markWin({reel:true});
  var cs=r.cards.filter(function(c){return c.k==='c'});
  e.innerHTML=(newBest?'<span class="newbest">'+icon('up').replace('<svg','<svg width="14" height="14" style="stroke:currentColor;fill:none;stroke-width:2.6"')+'New best</span>':'')+
    '<div class="rl-big" data-total>'+r.pts+'</div><div class="rl-ten" role="img" aria-label="'+r.right+' of '+RL5_N+' right">'+cs.map(function(c){return '<i class="'+(c.ok?'ok':'')+'"></i>'}).join('')+'</div>'+
    '<p class="sm" style="margin-top:10px">'+(firstRun?'Your first run':'Best '+v.reel.best)+(r.bestCombo>=3?' · combo ×'+rl5Mult(r.bestCombo):'')+'</p>'+
    (win.chain&&FLAGS.chain&&win.chain.kind!=='same'?'<span class="chip acc" style="margin-top:14px">'+chainIcon(true).replace('<svg','<svg width="16" height="16"')+' Day '+v.chain.n+'</span>':'')+
    '<div class="rl-endacts"><button class="btn pri big wide" data-more>One more run</button><div class="ir"><button class="btn sec" data-share>'+icon('share')+'Challenge</button><button class="btn sec" data-done>Done</button></div></div>';
  qs(RL.el,'.rl-top').style.visibility='hidden';qs(RL.el,'.rl-dots').style.visibility='hidden';
  if(window.ZD)ZD.countUp(qs(e,'[data-total]'),r.pts,700);fx(newBest?'best':'round',newBest?qs(e,'.newbest'):null);
  qs(e,'[data-more]').onclick=async function(){await Ads.betweenRuns();qs(RL.el,'.rl-top').style.visibility='';qs(RL.el,'.rl-dots').style.visibility='';rlStart()};
  qs(e,'[data-done]').onclick=function(){qs(RL.el,'.rl-top').style.visibility='';qs(RL.el,'.rl-dots').style.visibility='';rlLeave()};
  qs(e,'[data-share]').onclick=async function(){ev('share_tap');var t='I scored '+r.pts+' in a Zest reel: '+r.right+' of 10 right. Your turn?';try{if(navigator.share){await navigator.share({text:t});return}}catch(x){if(x&&x.name==='AbortError')return}try{await navigator.clipboard.writeText(t);toast('Copied. Paste it anywhere.')}catch(x){toast(t,4000)}};
  say(r.pts+' points, '+r.right+' of 10 right')}
