/* Zest v4 prototype, part C: more mechanics, grouped into six skill areas.
   Every game follows the same contract as part A: o = {auto, practice, n, mods, rx}; resolve {score, valid, chips[], tip} or null.
   The rules in part A (frame timestamps, pause = error, assisted taps, relaxed pace, feedback) apply here too. */

/* ---------- skill areas (domains) ---------- */
var DOMS=[
 {id:'speed',name:'Reflexes',col:'--c-speed',blurb:'Quick taps and quick sums'},
 {id:'attention',name:'Spotting',col:'--c-attention',blurb:'Finding the right thing'},
 {id:'control',name:'Hold back',col:'--c-control',blurb:'Tapping only when it counts'},
 {id:'flex',name:'Switching',col:'--c-flex',blurb:'Rules that keep changing'},
 {id:'memory',name:'Remembering',col:'--c-memory',blurb:'Sequences, pairs and changes'},
 {id:'space',name:'Shapes & numbers',col:'--c-space',blurb:'Turning shapes and finding patterns'}];
function dom(id){return DOMS.filter(function(d){return d.id===id})[0]}
var DOMOF={timing:'speed',speed:'attention',switch:'flex',hold:'control',space:'space'};
var RENAME={speed:['Glance','Glance'],hold:['Go or wait','Go or wait'],space:['Rotate','Rotate']};
STG.forEach(function(s){s.dom=DOMOF[s.id];s.col=dom(s.dom).col;if(RENAME[s.id]){s.name=RENAME[s.id][0];s.label=RENAME[s.id][1]}});
function addGame(g){g.col=dom(g.dom).col;g.np=g.np||3;STG.push(g)}
function addChal(game,list){list.forEach(function(c,i){CH.push({id:game+':'+c[0],stage:game,name:c[1],std:i===0?1:0,tier:c[2],desc:c[3],mods:c[4]||{}})})}

/* ---------- a shared engine for "look, then pick one of a few buttons" games ---------- */
/* c = {n, pen, dl, fix, h, grid, keys, demo/prac/real, make(i,o,boardWidth) -> {html, btns:[{k,html,label}], correct, say}}.
   Answers are real buttons (also reachable with 1 to 9 and the keys in c.keys). A right answer slower than the penalty is capped at the penalty,
   so a slow right answer never scores worse than a wrong one. Resolves {N,N0,ok,errs,sum,rts,times,ast}: N counts the trials that were timed. */
async function choiceGame(o,c){
  var t=run.id,K=K_(o),P=$('play'),mode=o.auto?'demo':o.practice?'prac':'',N=o.auto?2:o.n,sum=0,ok=0,errs=0,cnt=0,ast=0,rts=[],times=[],bw=P.clientWidth||320,pen=(c.pen||2000)*K;
  P.innerHTML='<div class="stage" style="min-height:'+(c.h||200)+'px"><div id="stim" style="text-align:center"></div></div>'+FB+SRL+'<div class="dock"><div class="ans'+(c.grid?' g2':'')+'" id="ab" role="group" aria-label="Answers"></div></div>';
  var stim=$('stim'),ab=$('ab');cap(o.auto?c.demo:o.practice?c.prac:c.real,mode);
  for(var i=1;i<=N;i++){
    if(t!==run.id)return null;prog(i,o.auto?0:N);fbSet('');sr('');var pc0=run.pc,tr=c.make(i,o,bw);stim.innerHTML=c.fix?'<div class="fix" aria-hidden="true">+</div>':'';ab.innerHTML='';
    if(c.fix){await wait(c.fix*K);if(t!==run.id)return null}
    var t0=await atFrame(function(){stim.innerHTML=tr.html;ab.innerHTML=tr.btns.map(function(b){return '<button type="button" data-k="'+b.k+'"'+(b.label?' aria-label="'+escH(b.label)+'"':'')+'>'+b.html+'</button>'}).join('')});if(t!==run.id)return null;
    if(tr.say)sr(tr.say);
    var res=await new Promise(function(rs){var d=false;function g(k,info){if(d||o.auto||run.paused)return;d=true;rs({k:k,ts:info.ts,ast:info.ast})}
      ab.querySelectorAll('button').forEach(function(b){onTap(b,function(info){g(b.dataset.k,info)})});
      onKey=function(e){var k=c.keys&&c.keys[e.key];if(!k){var v=+e.key;if(v>=1&&v<=tr.btns.length)k=tr.btns[v-1].k}if(k){e.preventDefault();g(k,{ts:e.timeStamp})}};
      if(!o.auto&&c.dl)setTimeout(function(){if(!d&&t===run.id){d=true;rs({k:'T',ts:t0+c.dl*K})}},c.dl*K);
      if(o.auto){var el=ab.querySelector('[data-k="'+tr.correct+'"]');handAt(el,.8);setTimeout(function(){if(t===run.id){handTap();setTimeout(function(){rs({k:tr.correct,ts:0})},350)}},900/(FAST?4:1))}});
    if(t!==run.id)return null;var dr=run.pc!==pc0,right=res.k===tr.correct&&!dr,rt=res.ts-t0;
    if(!o.auto){if(res.ast)ast++;else{cnt++;if(right){ok++;sum+=Math.min(rt,pen);rts.push(rt);times.push(Math.min(rt,pen))}else{errs++;sum+=pen;times.push(pen)}}
      var b=ab.querySelector('[data-k="'+tr.correct+'"]');
      if(res.ast)fbSet('Answer noted. Assistive taps are not timed.','warn');
      else if(right){okFx(b||stim);if(b){b.classList.add('good');setTimeout(function(){b.classList.remove('good')},160)}fbSet('Right','ok')}
      else{missFx(stim);stim.classList.add('shake');setTimeout(function(){stim.classList.remove('shake')},240);fbSet(dr?'Paused':res.k==='T'?'Too slow':(c.wrong||'Not that one'),'bad')}}
    if(o.auto&&i===1)cap(c.demo2||c.demo,'demo');await wait(o.auto?900:FBMS);if(t!==run.id)return null;
  }
  hideHand();if(o.auto||o.practice)return {score:0,valid:true,chips:[],tip:''};
  return {N:cnt,N0:N,ok:ok,errs:errs,sum:sum,rts:rts,times:times,ast:ast}
}
/* the round result for a choice game. agg 'med' scores the median trial time (penalties included), otherwise the mean. A round counts when at least half
   its trials were timed and minAcc of them were right. */
function fin(s,unit,minAcc,tip,extra,agg){var N=s.N,acc=N?s.ok/N:0,v=N?(agg==='med'?med(s.times):mean(s.times)):0,half=Math.ceil(s.N0/2);v=unit==='s'?Math.round(v/100)/10:Math.round(v);var valid=N>=half&&acc>=minAcc;
  return {score:v,valid:valid,ast:s.ast,chips:['Right '+s.ok+' of '+N].concat(s.rts.length?['Fastest '+Math.round(Math.min.apply(null,s.rts))+' ms']:[]).concat(s.ast?['Not timed '+s.ast]:[]).concat(extra||[]),
    tip:valid?tip:(s.ast&&N<half?'Assistive taps are not timed, so this round could not be scored.':'Too many wrong answers for this round to count. Slow down a little and try again.')}}

/* ---------- Flanker (attention): which way does the middle arrow point? ---------- */
/* Rows are neutral (15%: dashes), congruent or incongruent. The share of incongruent rows is capped at 0.8, so there is always a congruent stretch and
   "pick the opposite of the arrows around it" never works. */
GAMES.flanker=async function(o){var m=o.mods||{},size=m.size||5,inc=Math.min(m.incong==null?.5:m.incong,.8),mid=Math.floor(size/2);
  var s=await choiceGame(o,{n:o.n,pen:2000,dl:2000,fix:500,h:150,demo:'Which way does the middle arrow point?',prac:'Ignore the arrows around it.',real:'Which way does the middle arrow point?',keys:{ArrowLeft:'L',ArrowRight:'R'},
    make:function(i,oo,bw){var d=Math.random()<.5?'L':'R',o2=d==='L'?'R':'L',r=Math.random(),kind=r<.15?'N':r<.15+.85*inc?'I':'C',fl=kind==='N'?'N':kind==='I'?o2:d,h='',say=[],
        fs=Math.max(18,Math.min(40,Math.floor((bw-16-(size-1)*6)/size/1.15)));   // arrows shrink to fit the width
      for(var k=0;k<size;k++){var x=k===mid?d:fl;say.push(x==='N'?'dash':x==='L'?'left':'right');h+='<span'+(k===mid?' class="mid"':'')+'>'+(x==='N'?'–':x==='L'?'◀':'▶')+'</span>'}
      return {html:'<div class="flk" style="font-size:'+fs+'px" role="img" aria-label="'+say.join(', ')+'">'+h+'</div>',say:'Arrows: '+say.join(', '),btns:[{k:'L',html:'<span style="font-size:30px" aria-hidden="true">◀</span>Left'},{k:'R',html:'<span style="font-size:30px" aria-hidden="true">▶</span>Right'}],correct:d}}});
  if(!s||!s.N0)return s;return fin(s,'ms',.8,'The arrows beside the middle one are only a distraction. Look at the middle.')};

/* ---------- Ink (self-control): name the colour of the ink, not the word ---------- */
/* Colours from the Okabe-Ito set, which stays apart for the common kinds of colour blindness. Every button also carries its name and its own shape. */
var INKS=[{k:'Orange',v:'#E69F00',g:'<circle cx="12" cy="12" r="10"/>'},{k:'Blue',v:'#0072B2',g:'<rect x="2" y="2" width="20" height="20" rx="2"/>'},{k:'Red',v:'#D55E00',g:'<path d="M12 2l11 20H1z"/>'},{k:'Sky',v:'#56B4E9',g:'<path d="M12 1l11 11-11 11L1 12z"/>'}];
GAMES.stroop=async function(o){var m=o.mods||{},nc=m.ncol||4,inc=m.incong==null?.6:m.incong,set=INKS.slice(0,nc);if(nc<3)inc=Math.min(inc,.8);   // with two colours "every word clashes" would give the answer away
  var s=await choiceGame(o,{n:o.n,pen:2000,dl:2500,fix:400,h:150,grid:true,demo:'Tap the colour of the ink, not the word.',prac:'The word and the ink can disagree.',real:'Tap the colour of the ink.',
    make:function(){var ink=pick(set),word=Math.random()<inc?pick(set.filter(function(x){return x!==ink})):ink;
      return {html:'<div class="stw" style="color:'+ink.v+'">'+word.k.toUpperCase()+'</div>',btns:shuffle(set.slice()).map(function(x){return {k:x.k,html:'<svg class="sw2" viewBox="0 0 24 24" aria-hidden="true" fill="'+x.v+'" style="border-radius:0">'+x.g+'</svg>'+x.k}}),correct:ink.k}}});
  if(!s||!s.N0)return s;return fin(s,'ms',.8,'Say the colour you see, and let the word go.')};

/* ---------- Quick math (speed): small sums against the clock ---------- */
GAMES.math=async function(o){var m=o.mods||{},mx=m.max||20,ops=m.ops||1;
  var s=await choiceGame(o,{n:o.n,pen:8000,dl:10000,h:150,demo:'Tap the right answer.',prac:'Small sums. Take your time.',real:'Tap the right answer, quickly.',
    make:function(){var a=2+Math.floor(Math.random()*(mx-1)),b=2+Math.floor(Math.random()*(mx-1)),op=ops>1&&Math.random()<.4?'×':(Math.random()<.5?'+':'−'),ans;
      if(op==='×'){a=2+Math.floor(Math.random()*Math.min(11,mx-1));b=2+Math.floor(Math.random()*Math.min(11,mx-1));ans=a*b}else if(op==='+')ans=a+b;else{if(b>a){var q=a;a=b;b=q}ans=a-b}
      var all=shuffle([ans].concat(distract(ans,mathCands(a,b,op,ans),2,Math.random,0)));   // the two wrong answers are typical slips; the right one lands at a random rank
      return {html:'<div class="stw num" style="color:var(--ink)">'+a+' '+op+' '+b+'</div>',say:a+' '+(op==='+'?'plus':op==='−'?'minus':'times')+' '+b,btns:all.map(function(x){return {k:String(x),html:'<span class="num" style="font-size:28px">'+x+'</span>'}}),correct:String(ans)}}});
  if(!s||!s.N0)return s;return fin(s,'s',.8,'Quick and right beats very quick and wrong.')};

/* ---------- Pattern (space & logic): what number comes next? ---------- */
/* Rule kinds: 1 steady steps, 2 doubling or tripling, 3 two alternating steps, 4 square numbers plus a start, 5 sum of the last two, 6 growing steps.
   'Standard' (no level, no kind) draws from a bank of kinds 1, 2, 3, 4 and 6 in equal measure; levels 2 and 3 and the recipe kinds are unchanged. */
function patGen(kd,rng){rng=rng||Math.random;function R(n){return Math.floor(rng()*n)}var a=1+R(12),out=[],i;
  if(kd===1){var d=2+R(7);for(i=0;i<5;i++)out.push(a+d*i);return {shown:out,next:a+d*5}}
  if(kd===2){var f=rng()<.5?2:3;a=1+R(4);for(i=0;i<5;i++)out.push(a*Math.pow(f,i));return {shown:out,next:a*Math.pow(f,5)}}
  if(kd===3){var x=1+R(5),y=2+R(6),v=a;for(i=0;i<6;i++){out.push(v);v+=(i%2?y:x)}return {shown:out.slice(0,5),next:out[5]}}
  if(kd===4){for(i=1;i<=5;i++)out.push(i*i+a);return {shown:out,next:36+a}}
  if(kd===5){out=[a,a+1+R(3)];for(i=2;i<7;i++)out.push(out[i-1]+out[i-2]);var nx=out.pop();return {shown:out,next:nx}}
  var v2=a,s2=1;for(i=0;i<5;i++){out.push(v2);v2+=s2*2;s2++}return {shown:out,next:v2}}
function patKind(lv,rng){var r=(rng||Math.random)();return lv===2?(r<.4?2:r<.75?3:4):lv===3?(r<.5?5:6):1}
var PATBANK=[1,2,3,4,6];
GAMES.pattern=async function(o){var m=o.mods||{},kd=m.kind||0,lv=m.level,bag=[];
  function nextKind(){if(kd)return kd;if(lv)return patKind(lv);if(!bag.length)bag=shuffle(PATBANK.concat(PATBANK));return bag.pop()}
  var s=await choiceGame(o,{n:o.n,pen:20000,dl:40000,h:150,grid:true,demo:'What number comes next?',prac:'Find the rule.',real:'What number comes next?',
    make:function(){var p=patGen(nextKind()),sh=p.shown,last=sh[sh.length-1],step=Math.max(1,Math.abs(last-sh[sh.length-2])),
        all=shuffle([p.next].concat(distract(p.next,[p.next+1,p.next-1,p.next+2,p.next-2,p.next+step,p.next-step,p.next+step+1,p.next-step-1,last,last+step],3,Math.random,1)));
      return {html:'<div class="stw num" style="font-size:34px;color:var(--ink)">'+sh.join('  ')+'  <span style="color:var(--accent)">?</span></div>',say:'Sequence: '+sh.join(', ')+', what comes next',btns:all.map(function(x){return {k:String(x),html:'<span class="num" style="font-size:26px">'+x+'</span>'}}),correct:String(p.next)}}});
  if(!s||!s.N0)return s;return fin(s,'s',.75,'Look at how each number changes to the next one.',null,'med')};

/* ---------- Repeat (memory): tap when it matches the one N steps back ---------- */
/* The number of repeats is fixed (about 30% of the letters after the first N), placed at random. A tap under 150 ms after the letter is an anticipation:
   it counts as an error and never as a fast reaction. Score = median reaction + 2000 x error share; a round counts with at least half the repeats hit and at most 15% errors. */
function mkNback(n,back,tg,L,rng){rng=rng||Math.random;var want=Math.round((n-back)*tg),pos=[],tset={},seq=[],i;for(i=back;i<n;i++)pos.push(i);shuffle(pos,rng);pos.slice(0,want).forEach(function(x){tset[x]=1});
  for(i=0;i<n;i++){if(tset[i])seq.push(seq[i-back]);else{var c;do{c=L[Math.floor(rng()*L.length)]}while(i>=back&&c===seq[i-back]);seq.push(c)}}return seq}
GAMES.nback=async function(o){
  var t=run.id,K=K_(o),m=o.mods||{},back=m.back||1,isi=(m.isi||1800)*K,tg=m.targets==null?.3:m.targets,P=$('play'),mode=o.auto?'demo':o.practice?'prac':'',L=['B','F','K','M','R','T','X','Z'],n=o.auto?4:o.n;
  P.innerHTML='<div class="stage"><div class="blobwrap"><div class="blob" id="ob" style="font:700 64px var(--disp);color:var(--ink)"></div></div></div>'+FB+SRL+'<div class="dock"><button class="tapb neu" id="tp">Same as '+(back===1?'the last one':back+' back')+'</button></div>';
  var ob=$('ob'),tp=$('tp');cap(o.auto?'Tap if it is the same as the one before.':o.practice?'Same as '+(back===1?'the one before':back+' back')+'? Tap. Otherwise wait.':'Same as '+(back===1?'the one before':back+' back')+'? Tap.',mode);
  var seq=o.auto?['B','K','K','M']:mkNback(n,back,tg,L);
  var fa=0,ant=0,miss=0,hits=0,ast=0,cnt=0,tgts=0,rts=[],cur=-1,resp=true,t0=0,live=false,outcome=null;
  function tap(info){if(run.paused||o.auto||resp||!live)return;
    if(info.ast){resp=true;outcome='ast';fbSet('Tap noted. Assistive taps are not timed.','warn');return}
    var rt=info.ts-t0,isT=cur>=back&&seq[cur]===seq[cur-back];resp=true;
    if(rt<150){outcome='ant';ant++;missFx(ob);ob.classList.add('shake');fbSet('Too early','bad');return}
    if(isT){outcome='hit';hits++;rts.push(rt);okFx(ob);ob.classList.add('pop');fbSet('Right','ok')}else{outcome='fa';fa++;missFx(ob);ob.classList.add('shake');fbSet('Not a repeat','bad')}}
  onTap(tp,tap);onKey=function(e){if(isGo(e)){e.preventDefault();tap({ts:e.timeStamp,ast:false})}};
  for(var i=0;i<seq.length;i++){
    if(t!==run.id)return null;prog(i+1,o.auto?0:seq.length);var pc0=run.pc;cur=i;resp=false;live=true;outcome=null;ob.className='blob';ob.textContent='';fbSet('');
    t0=await atFrame(function(){ob.textContent=seq[i]});if(t!==run.id)return null;sr(seq[i]);
    var isT=i>=back&&seq[i]===seq[i-back];if(o.auto){handAt(tp,.8);if(isT)setTimeout(function(){if(t===run.id)handTap()},500/(FAST?4:1))}
    await wait(isi*.55);if(t!==run.id)return null;ob.textContent='';
    if(!o.auto&&!isT&&!outcome)fbSet('Good, not a repeat','ok');
    await wait(isi*.45);if(t!==run.id)return null;live=false;
    if(!o.auto){var dr=run.pc!==pc0;
      if(outcome==='ast')ast++;else{cnt++;if(isT)tgts++;if(!outcome&&(isT||dr)){miss++;fbSet(isT?'Missed a repeat':'Paused','warn')}}   // a repeat nobody tapped, or a trial cut by a pause, is an error
      await fbWait();if(t!==run.id)return null}
  }
  hideHand();if(o.auto||o.practice)return {score:0,valid:true,chips:[],tip:''};
  var errs=fa+ant+miss,er=cnt?errs/cnt:1,mrt=rts.length?med(rts):900,valid=vNback(hits,tgts,errs,cnt)&&cnt>=Math.ceil(seq.length/2);
  return {score:Math.round(penScore(mrt,er)),valid:valid,ast:ast,chips:['Wrong taps '+fa,'Too early '+ant,'Missed '+miss,'Typical '+Math.round(mrt)+' ms'].concat(ast?['Not timed '+ast]:[]),
    tip:!valid?(ast&&cnt<Math.ceil(seq.length/2)?'Assistive taps are not timed, so this round could not be scored.':'Too many errors or missed repeats for this round to count. Keep the last few in mind.'):(miss>fa?'You missed some repeats. Keep checking against the last one.':'Steady round.')}
};

/* ---------- Sequence (memory): repeat the order the blocks lit up ---------- */
/* A staircase on the sequence length: one longer after a right answer, one shorter after a wrong one (2 to 9). Score = the shorter length of each of the last
   four turning points (right to wrong or back), or the longest right length when there are fewer than two. A round counts with at least one right answer.
   With the audio alternative on (st.aud) each block has its own pitch, played as it lights and as it is tapped. */
var CORSI=[[16,18],[58,10],[84,34],[40,40],[12,62],[66,66],[38,84],[86,86],[18,88]],PITCH=[262,294,330,392,440,523,587,659,784];
GAMES.span=async function(o){
  var t=run.id,K=K_(o),m=o.mods||{},pace=(m.pace||700)*K,len=o.auto?3:(o.practice?2:(m.start||3)),best=0,right=0,tr=[],P=$('play'),mode=o.auto?'demo':o.practice?'prac':'',N=o.auto?1:o.n,aud=audOn()&&!o.auto;
  P.innerHTML='<div class="stage"><div class="cb" id="cb">'+CORSI.map(function(p,i){return '<button type="button" class="cbb" data-i="'+i+'" aria-label="Block '+(i+1)+' of 9" style="position:absolute;left:'+p[0]+'%;top:'+p[1]+'%;width:56px;height:56px;margin:-4px;padding:0;border:0;background:none;cursor:pointer"><i style="left:0;top:0;margin:0;pointer-events:none"></i></button>'}).join('')+'</div></div>'+FB;
  var blocks=[].slice.call(document.querySelectorAll('#cb button'));cap(o.auto?'Watch the order. Then repeat it.':o.practice?'Watch, then repeat.':'Watch the order. Then repeat it.'+(aud?' Audio mode: each block has its own pitch.':''),mode);
  function lit(i,on){blocks[i].firstChild.classList.toggle('on',on)}
  for(var n=1;n<=N;n++){
    if(t!==run.id)return null;prog(n,o.auto?0:N);fbSet('Watch…');var pc0=run.pc,order=shuffle([0,1,2,3,4,5,6,7,8]).slice(0,Math.min(len,9));await wait(700*K);if(t!==run.id)return null;
    for(var k=0;k<order.length;k++){lit(order[k],true);if(aud)cueTone(PITCH[order[k]],pace*.0007);await wait(pace*.7);if(t!==run.id)return null;lit(order[k],false);await wait(pace*.3);if(t!==run.id)return null}
    fbSet('Your turn');var got=0,okSeq=true;
    await new Promise(function(done){var d=false;
      function press(i,info){if(d||o.auto||run.paused)return;lit(i,true);setTimeout(function(){lit(i,false)},150);if(aud)cueTone(PITCH[i],.2);
        if(i===order[got]){got++;okFx(blocks[i]);if(got===order.length){d=true;done()}}else{okSeq=false;d=true;missFx(blocks[i]);blocks[i].classList.add('shake');done()}}
      blocks.forEach(function(b,i){onTap(b,function(info){press(i,info)})});
      onKey=function(e){var v=+e.key;if(v>=1&&v<=9){e.preventDefault();press(v-1)}};
      if(o.auto){var k2=0;(function nx(){if(t!==run.id||k2>=order.length){if(t===run.id){d=true;done()}return}handAt(blocks[order[k2]],.5);setTimeout(function(){if(t!==run.id)return;handTap();lit(order[k2],true);setTimeout(function(){lit(order[k2],false);k2++;nx()},300)},650/(FAST?4:1))})()}
    });
    if(t!==run.id)return null;hideHand();var dr=run.pc!==pc0;if(dr)okSeq=false;
    if(!o.auto){tr.push({len:order.length,ok:okSeq});if(okSeq){right++;best=Math.max(best,order.length);len=Math.min(9,len+1)}else len=Math.max(2,len-1)}
    if(!o.auto)fbSet(okSeq?'Right':dr?'Paused':'Not quite. The order was '+order.map(function(x){return x+1}).join(', '),okSeq?'ok':'bad');await wait(o.auto?800:Math.max(900,FBMS));if(t!==run.id)return null;
  }
  hideHand();if(o.auto||o.practice)return {score:0,valid:true,chips:[],tip:''};
  var e=spanEst(tr,best),valid=vSpan(right);
  return {score:Math.max(1,e.est),valid:valid,chips:['Longest '+Math.max(1,best),'Right '+right+' of '+N,'Turning points '+e.revs],tip:valid?'Try saying the order under your breath, or picture a path through the blocks.':'No sequence was repeated correctly in this round, so it did not count. Watch the whole order first.'}
};

/* ---------- Spot the change (memory): did that square change colour? ---------- */
/* Half of the probes are changed, exactly. The score is the share right, but a round counts only above chance after correcting for guessing
   (more than 50% right) and, on a full round of 12 or more, at 75% or better. Colours are the Okabe-Ito set and the marked square has a static ring. */
var OI=['#E69F00','#56B4E9','#009E73','#F0E442','#0072B2','#D55E00','#CC79A7'];
GAMES.change=async function(o){
  var t=run.id,K=K_(o),m=o.mods||{},size=m.size||5,show=(m.show||800)*K,N=o.auto?1:o.n,ok=0,P=$('play'),mode=o.auto?'demo':o.practice?'prac':'',diffs=[];
  for(var q=0;q<N;q++)diffs.push(q<Math.ceil(N/2));shuffle(diffs);
  P.innerHTML='<div class="stage"><div class="area" id="ar" style="height:300px" role="img" aria-label="Coloured squares"></div></div>'+FB+'<div class="dock"><div class="ans"><button data-k="S">Same colour</button><button data-k="D">Different</button></div></div>';
  var ar=$('ar');cap(o.auto?'Remember the colours. One square will be marked.':o.practice?'Is the marked square the same colour?':'Is the marked square the same colour?',mode);
  for(var n=1;n<=N;n++){
    if(t!==run.id)return null;prog(n,o.auto?0:N);fbSet('');var pc0=run.pc,W=ar.clientWidth||300,pts=gridPlace(size,W,300,46),sz=pts.length,cols=shuffle(OI.slice()).slice(0,Math.min(sz,OI.length));while(cols.length<sz)cols.push(pick(OI));
    var probe=Math.floor(Math.random()*sz),diff=diffs[n-1],pc=cols[probe];if(diff)pc=pick(OI.filter(function(c){return c!==cols[probe]}));
    function draw(test){ar.innerHTML=pts.map(function(p,i){var c=test&&i===probe?pc:cols[i];return '<b style="left:'+p[0]+'px;top:'+p[1]+'px;background:'+c+';box-shadow:'+(test&&i===probe?'0 0 0 3px var(--bg),0 0 0 6px var(--ink)':'0 0 0 1.5px var(--edge)')+'"></b>'}).join('')}
    await wait(600*K);if(t!==run.id)return null;draw(false);await wait(show);if(t!==run.id)return null;ar.innerHTML='';await wait(900*K);if(t!==run.id)return null;draw(true);
    var res=await new Promise(function(rs){var d=false;function g(k){if(!d&&!o.auto&&!run.paused){d=true;rs(k)}}document.querySelectorAll('.ans button').forEach(function(b){onTap(b,function(){g(b.dataset.k)})});
      onKey=function(e){if(e.key==='ArrowLeft'||e.key==='1'){e.preventDefault();g('S')}if(e.key==='ArrowRight'||e.key==='2'){e.preventDefault();g('D')}};
      if(o.auto){var k=diff?'D':'S',el=document.querySelector('.ans [data-k="'+k+'"]');setTimeout(function(){if(t===run.id){handAt(el,.8);setTimeout(function(){if(t===run.id){handTap();setTimeout(function(){rs(k)},350)}},700/(FAST?4:1))}},700/(FAST?4:1))}});
    if(t!==run.id)return null;var dr=run.pc!==pc0,right=res===(diff?'D':'S')&&!dr;if(!o.auto&&right)ok++;
    if(!o.auto){if(right)okFx($('fb'));else missFx($('fb'))}fbSet(right?'Right':dr?'Paused':'It was '+(diff?'different':'the same'),right?'ok':'bad');await wait(o.auto?900:Math.max(700,FBMS));if(t!==run.id)return null;
  }
  hideHand();if(o.auto||o.practice)return {score:0,valid:true,chips:[],tip:''};
  var pct=Math.round(ok/N*100),valid=vChange(ok,N,N>=12);return {score:pct,valid:valid,chips:['Right '+ok+' of '+N,'Squares: '+size],tip:valid?'Pick two or three colours to remember rather than all of them.':'Too few right answers for this round to count: guessing alone gets about half. Try again with a closer look.'}
};

/* ---------- Pairs (memory): find the matching cards ---------- */
/* Three boards of six pairs (two boards for 7 or 8 pairs, one for more; one in ?fast), scored as the mean of seconds + 2 per mismatch. A pause during a board
   drops that board; a round needs at least half its boards, and each board has to take at least 0.8 s per pair. Faces are inline SVG with a name for screen readers. */
var SYMS=[['circle','<circle cx="12" cy="12" r="8"/>'],['triangle','<path d="M12 4l9 16H3z"/>'],['square','<rect x="4" y="4" width="16" height="16" rx="2"/>'],['diamond','<path d="M12 2l9 10-9 10-9-10z"/>'],
 ['star','<path d="M12 2l3 7 7 .6-5.3 4.7 1.7 7.2L12 17.8l-6.4 3.7 1.7-7.2L2 9.6 9 9z"/>'],['cross','<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>'],['heart','<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>'],
 ['moon','<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>'],['hexagon','<path d="M12 2l8.7 5v10L12 22l-8.7-5V7z"/>'],['spark','<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>']];
var SYMC=['var(--accent)','var(--blue)','var(--c-control)','var(--c-space)','var(--c-attention)','var(--ink)'];
GAMES.match=async function(o){
  var t=run.id,K=K_(o),m=o.mods||{},pairs=o.auto?2:(o.practice?3:(m.pairs||6)),P=$('play'),mode=o.auto?'demo':o.practice?'prac':'',boards=o.auto||o.practice?1:(FAST?1:(m.boards||(pairs<=6?3:pairs<=8?2:1))),scores=[],totalMiss=0,ast=0,dropped=0;
  P.innerHTML='<div class="stage"><div class="cards" id="cd"></div></div>'+FB;
  for(var bd=1;bd<=boards;bd++){
    cap(o.auto?'Flip two cards. Find the matching pair.':o.practice?'Find the pairs.':'Find all the pairs.'+(boards>1?' Board '+bd+' of '+boards+'.':''),mode);fbSet('');
    var deck=[];for(var i=0;i<pairs;i++){deck.push(i);deck.push(i)}shuffle(deck);var cd=$('cd');
    cd.innerHTML=deck.map(function(v,i){return '<button type="button" class="cardb" data-i="'+i+'" aria-label="Card '+(i+1)+', face down"></button>'}).join('');
    var cards=[].slice.call(cd.querySelectorAll('button')),first=-1,locked=false,matched=0,miss=0,pc0=run.pc,astB=false;
    var face=function(i,on,done){var b=cards[i],nm=SYMS[deck[i]%SYMS.length][0];b.classList.toggle('up',on);
      b.innerHTML=on?'<svg viewBox="0 0 24 24" width="58%" height="58%" fill="currentColor" aria-hidden="true" style="color:'+SYMC[(deck[i]*2+(deck[i]>3?1:0))%6]+'">'+SYMS[deck[i]%SYMS.length][1]+'</svg>':'';
      b.setAttribute('aria-label','Card '+(i+1)+', '+(on?nm+(done?', matched':''):'face down'))};
    var t0=await atFrame(function(){prog(0,pairs)});if(t!==run.id)return null;
    await new Promise(function(done){
      function flip(i,info){if(locked||run.paused||cards[i].classList.contains('up'))return;if(info&&info.ast)astB=true;face(i,true);sfx('go');
        if(first<0){first=i;return}
        var a=first,b=i;first=-1;locked=true;
        if(deck[a]===deck[b]){matched++;prog(matched,pairs);okFx(cards[a]);face(a,true,true);face(b,true,true);fbSet('Match: '+SYMS[deck[a]%SYMS.length][0],'ok');locked=false;if(matched===pairs)done()}
        else{miss++;fbSet('Not a match','warn');setTimeout(function(){face(a,false);face(b,false);locked=false},Math.max(700,FBMS+250)*K/(FAST?2:1))}}
      cards.forEach(function(b){onTap(b,function(info){if(!o.auto)flip(+b.dataset.i,info)})});
      if(o.auto){var order=[];for(var v=0;v<pairs;v++){var idx=[];deck.forEach(function(x,i){if(x===v)idx.push(i)});order.push(idx[0],idx[1])}var k=0;(function nx(){if(t!==run.id)return;if(k>=order.length){done();return}var i=order[k];handAt(cards[i],.5);setTimeout(function(){if(t!==run.id)return;handTap();flip(i);k++;setTimeout(nx,400/(FAST?4:1))},700/(FAST?4:1))})()}
    });
    if(t!==run.id)return null;hideHand();var secs=(performance.now()-t0)/1000;
    if(!o.auto&&!o.practice){if(run.pc!==pc0||!vPairs(secs,pairs))dropped++;else{scores.push(Math.round((secs+2*miss)*10)/10);if(astB)ast++}totalMiss+=miss}
    await wait(o.auto?700:Math.max(500,FBMS));if(t!==run.id)return null;
  }
  if(o.auto||o.practice)return {score:0,valid:true,chips:[],tip:''};
  var sc=Math.round(mean(scores)*10)/10,valid=scores.length>=Math.ceil(boards/2);
  return {score:sc,valid:valid,ast:ast?1:0,chips:['Pairs '+pairs,'Boards '+scores.length+' of '+boards,'Mismatches '+totalMiss].concat(ast?['Assisted taps']:[]),
    tip:valid?'Say each symbol to yourself as it turns over. Remembering where is easier with a short label.':'A pause or an unusually quick board meant too few boards counted, so this round did not count.'}
};

/* ---------- Trail (speed): tap the circles in order ---------- */
/* Layouts come from a bank of six fixed layouts per circle count (trailLayout), scaled to the board width, with a 48 px tap area around every circle.
   A wrong tap marks the circle you needed with a static outline and the word Next. A round counts when at least half the boards were completed
   without a pause and the wrong taps do not outnumber the right ones. */
GAMES.trail=async function(o){
  var t=run.id,K=K_(o),m=o.mods||{},count=o.auto?4:(o.practice?6:(m.count||10)),alt=!!m.alt&&!o.auto,N=o.auto?1:(o.practice?1:o.n),times=[],errsT=0,ast=0,P=$('play'),mode=o.auto?'demo':o.practice?'prac':'',v0=Math.floor(Math.random()*6),PITCH_=48,HH=380;
  P.innerHTML='<div class="stage" style="align-items:stretch"><div class="area" id="ta" style="height:'+HH+'px"></div></div>'+FB;var ta=$('ta');
  cap(o.auto?'Tap the circles in order, 1, 2, 3…':alt?'Tap 1, A, 2, B, 3, C…':o.practice?'Tap them in order.':'Tap the circles in order.',mode);
  function labels(){var a=[];if(!alt){for(var i=1;i<=count;i++)a.push(String(i))}else{var nn=1,l=0;for(var i=0;i<count;i++){if(i%2===0)a.push(String(nn++));else a.push(String.fromCharCode(65+l++))}}return a}
  for(var r=1;r<=N;r++){
    if(t!==run.id)return null;prog(r,o.auto?0:N);fbSet('');var lab=labels(),W=ta.clientWidth||300,pts=trailLayout(count,W,HH,PITCH_,v0+r),order=shuffle(lab.map(function(_,i){return i})),nx=0,e=0,pc0=run.pc,astR=false,flagSp=null,flagEl=null;
    ta.innerHTML=lab.map(function(l,i){var p=pts[order[i]]||[10,10];return '<button type="button" class="tcb" data-i="'+i+'" aria-label="Circle '+l+'" style="position:absolute;left:'+p[0]+'px;top:'+p[1]+'px;width:'+PITCH_+'px;height:'+PITCH_+'px;padding:0;border:0;background:none;cursor:pointer"><b class="tc" data-i="'+i+'" style="left:1px;top:1px;pointer-events:none">'+l+'</b></button>'}).join('');
    var els=[].slice.call(ta.querySelectorAll('button')),dots=els.map(function(b){return b.firstChild});await wait(500*K);if(t!==run.id)return null;
    var t0=await atFrame(function(){});
    function clearFlag(){if(flagSp){flagSp.remove();flagSp=null}if(flagEl){flagEl.style.outline='';flagEl=null}}
    await new Promise(function(done){
      function tapc(i,info){if(run.paused)return;if(info&&info.ast)astR=true;
        if(i===nx){clearFlag();dots[i].classList.add('done');okFx(dots[i]);nx++;if(nx===count)done()}
        else if(!dots[i].classList.contains('done')){e++;missFx(dots[i]);dots[i].classList.add('shake');setTimeout(function(){dots[i].classList.remove('shake')},240);clearFlag();flagEl=els[nx];flagSp=flagTarget(ta,flagEl,'Next');fbSet('Wrong circle. Next is '+lab[nx],'bad')}}
      els.forEach(function(b){onTap(b,function(info){if(!o.auto)tapc(+b.dataset.i,info)})});
      if(o.auto){var k=0;(function step(){if(t!==run.id)return;if(k>=count){done();return}handAt(els[k],.5);setTimeout(function(){if(t!==run.id)return;handTap();tapc(k);k++;setTimeout(step,250)},650/(FAST?4:1))})()}
    });
    if(t!==run.id)return null;hideHand();var secs=(performance.now()-t0)/1000;if(!o.auto&&!o.practice){if(run.pc===pc0){times.push(secs+2*e);errsT+=e;if(astR)ast++}}
    await wait(o.auto?800:Math.max(600,FBMS));if(t!==run.id)return null;
  }
  hideHand();if(o.auto||o.practice)return {score:0,valid:true,chips:[],tip:''};
  var mt=Math.round(mean(times)*10)/10,valid=vTrail(times.length,N,errsT,count*times.length);
  return {score:mt,valid:valid,ast:ast?1:0,chips:['Wrong taps '+errsT,'Fastest round '+(times.length?Math.round(Math.min.apply(null,times)*10)/10:0)+' s'].concat(ast?['Assisted taps']:[]),tip:valid?'Look ahead for the next circle while you tap the current one.':'Too many wrong taps, or a board was interrupted, so this round did not count. Take it a little slower.'}
};

/* ---------- Spot it (attention): find the odd one out ---------- */
/* The board is a grid with one item per 48 px cell, so every item has a 48 px tap area and nothing overlaps; the number of items is capped by what fits the
   measured width (the board grows in height instead). The target is always among the placed items. Score = the median trial time, a miss counting as 6 seconds. */
GAMES.search=async function(o){
  var t=run.id,K=K_(o),m=o.mods||{},size=o.auto?8:(m.size||16),N=o.auto?1:o.n,ok=0,cnt=0,ast=0,times=[],rts=[],P=$('play'),mode=o.auto?'demo':o.practice?'prac':'',pen=6000*K,dl=8000*K,PT=48,sz=size;
  P.innerHTML='<div class="stage" style="align-items:stretch"><div class="area" id="sa" style="height:380px"></div></div>'+FB;var sa=$('sa');
  cap(o.auto?'Find the orange square.':o.practice?'Find the orange square.':'Find the orange square.',mode);
  for(var n=1;n<=N;n++){
    if(t!==run.id)return null;prog(n,o.auto?0:N);fbSet('');var pc0=run.pc,W=sa.clientWidth||300,H=Math.max(380,Math.ceil(size/gridCols(W,PT))*PT),pts;sa.style.height=H+'px';pts=gridPlace(size,W,H,PT);sz=pts.length;var tgt=Math.floor(Math.random()*sz);
    await wait(700*K);if(t!==run.id)return null;
    sa.innerHTML=pts.map(function(p,i){var isT=i===tgt,circle=!isT&&Math.random()<.5,orange=isT||circle;return '<button type="button" class="sqb" data-i="'+i+'" aria-label="'+(orange?'Orange':'Blue')+(circle?' circle':' square')+'" style="position:absolute;left:'+p[0]+'px;top:'+p[1]+'px;width:'+PT+'px;height:'+PT+'px;padding:0;border:0;background:none;cursor:pointer"><b class="sq'+(isT?' tt':'')+'" data-i="'+i+'" style="left:7px;top:7px;pointer-events:none;background:'+(orange?'var(--accent)':'var(--blue)')+';border-radius:'+(circle?'50%':'6px')+'"></b></button>'}).join('');
    var els=[].slice.call(sa.querySelectorAll('button'));
    var t0=await atFrame(function(){});if(t!==run.id)return null;
    var res=await new Promise(function(rs){var d=false;els.forEach(function(b){onTap(b,function(info){if(d||o.auto||run.paused)return;d=true;rs({i:+b.dataset.i,ts:info.ts,ast:info.ast})})});
      if(!o.auto)setTimeout(function(){if(!d&&t===run.id){d=true;rs({i:-1,ts:t0+dl})}},dl);
      if(o.auto)setTimeout(function(){if(t===run.id){handAt(els[tgt],.5);setTimeout(function(){if(t===run.id){handTap();setTimeout(function(){rs({i:tgt,ts:0})},350)}},700/(FAST?4:1))}},800/(FAST?4:1))});
    if(t!==run.id)return null;var dr=run.pc!==pc0,right=res.i===tgt&&!dr,rt=res.ts-t0;
    if(!o.auto){if(res.ast)ast++;else{cnt++;if(right){ok++;rts.push(rt);times.push(Math.min(rt,pen))}else times.push(pen)}
      sfx(res.ast?'go':right?'ok':'bad');
      if(res.ast)fbSet('Answer noted. Assistive taps are not timed.','warn');
      else if(!right){els[tgt].firstChild.classList.add('pulse');flagTarget(sa,els[tgt],'Orange square');fbSet(dr?'Paused':res.i<0?'Too slow':'That one is not it','bad')}else fbSet('Right','ok')}
    await wait(o.auto?900:Math.max(right?FBMS:900,FBMS));if(t!==run.id)return null;
  }
  hideHand();if(o.auto||o.practice)return {score:0,valid:true,chips:[],tip:''};
  var acc=cnt?ok/cnt:0,valid=cnt>=Math.ceil(N/2)&&acc>=.8;
  return {score:Math.round(cnt?med(times):0),valid:valid,ast:ast,chips:['Right '+ok+' of '+cnt,'Items '+sz,'Fastest '+Math.round(Math.min.apply(null,rts.length?rts:[0]))+' ms'].concat(ast?['Not timed '+ast]:[]),
    tip:valid?'Scan in one direction rather than jumping around.':ast&&cnt<Math.ceil(N/2)?'Assistive taps are not timed, so this round could not be scored.':'Too many misses for this round to count. Take a moment to scan.'}
};

/* ---------- catalog ---------- */
addGame({id:'trail',name:'Trail',label:'Trail',dom:'speed',a11y:'visual',skill:'Finding the next circle fast',unit:'s',what:'Tap the numbered circles in order, as fast as you can.',scored:'Seconds per round. A wrong tap adds 2 seconds. Lower is better.',n:3,np:1});
addGame({id:'math',name:'Quick math',label:'Quick math',dom:'speed',skill:'Quick sums',unit:'s',what:'Pick the right answer to a small sum.',scored:'Seconds per answer. A wrong answer counts as 8 seconds. Lower is better.',n:12,np:3});
addGame({id:'flanker',name:'Flanker',label:'Flanker',dom:'attention',skill:'Picking the middle arrow',unit:'ms',what:'Which way does the middle arrow point? The arrows around it may disagree.',scored:'Your average time per answer. A wrong answer counts as 2 seconds. Lower is better.',n:24,np:4});
addGame({id:'search',name:'Spot it',label:'Spot it',dom:'attention',a11y:'visual',skill:'Finding the odd one out',unit:'ms',what:'Find the orange square among circles and blue squares.',scored:'Your typical (median) time to find it. A miss counts as 6 seconds. Lower is better.',n:12,np:2});
addGame({id:'stroop',name:'Ink',label:'Ink',dom:'control',a11y:'visual',skill:'Naming the ink, not the word',unit:'ms',what:'Tap the colour of the ink, not the word.',scored:'Your average time per answer. A wrong answer counts as 2 seconds. Lower is better.',n:24,np:4});
addGame({id:'span',name:'Sequence',label:'Sequence',dom:'memory',skill:'Repeating an order',unit:'items',hi:true,aud:1,what:'Watch the blocks light up, then repeat the order.',scored:'The longest sequence you repeated correctly, worked out from the last turning points of a staircase. Higher is better.',n:10,np:2});
addGame({id:'change',name:'Spot the change',label:'Spot the change',dom:'memory',skill:'Spotting what changed',unit:'%',hi:true,bounded:true,a11y:'visual',what:'Remember the colours, then say whether the marked square changed.',scored:'The share of answers you got right. A round counts only if you did clearly better than guessing. Higher is better.',n:16,np:3});
addGame({id:'nback',name:'Repeat',label:'Repeat',dom:'memory',skill:'Spotting repeats',unit:'ms',what:'Tap when a letter is the same as the one before.',scored:'Your typical reaction time, plus a penalty for every wrong, early or missed tap. Lower is better.',n:36,np:8});
addGame({id:'match',name:'Pairs',label:'Pairs',dom:'memory',skill:'Matching pairs',unit:'s',what:'Flip cards and find all the matching pairs.',scored:'Seconds per board, averaged over three boards. Each mismatch adds 2 seconds. Lower is better.',n:3,np:1});
addGame({id:'pattern',name:'Pattern',label:'Pattern',dom:'space',skill:'Finding the next number',unit:'s',what:'Work out the rule and pick the number that comes next.',scored:'The typical (median) time per answer. A wrong answer counts as 20 seconds. Lower is better.',n:12,np:2});
STG.forEach(function(s){if(s.hi==null)s.hi=false});

// more variants for the original five, then the new games
CH.length=0;
addChal('timing',[['std','Standard','Standard','Tap when the dot reaches the line. Speeds are mixed.'],['blind','Blind finish','Hard','The dot vanishes halfway. Tap when it would arrive.',{blind:1}],['fast','Fast lane','Hard','Only fast dots, under a second.',{tmin:600,tmax:800}],['slow','Slow burn','Calm','Long, slow dots. Patience and precision.',{tmin:1800,tmax:2600}]]);
addChal('trail',[['std','Standard','Standard','Tap the circles in order, 1 to 10.'],['alt','Numbers and letters','Hard','Tap 1, A, 2, B, 3, C and so on.',{alt:1}],['quick','Quick eight','Calm','A shorter round with eight circles.',{count:8}],['big','Big board','Hard','Fourteen circles to find.',{count:14}]]);
addChal('math',[['std','Standard','Standard','Small sums. Pick the right answer.'],['times','Times tables','Hard','Adds multiplication to the mix.',{ops:2,max:12}],['big','Bigger numbers','Hard','Sums with numbers up to 60.',{max:60}]]);
addChal('speed',[['std','Standard','Standard','Spot the dot. The flash shortens as you get it right.'],['quick','Quick flash','Hard','Starts from a very short flash.',{start:5}]]);
addChal('flanker',[['std','Standard','Standard','Which way does the middle arrow point?'],['crowd','Crowded row','Hard','Seven arrows, and most of them disagree.',{size:7,incong:.7}]]);
addChal('search',[['std','Standard','Standard','Find the orange square among 16 shapes.'],['crowd','Crowded','Hard','Find it among 28 shapes.',{size:28}],['few','Few items','Calm','Only 8 shapes to scan.',{size:8}]]);
addChal('hold',[['std','Standard','Standard','Tap the disc. Do nothing on the square.'],['fast','Fast hands','Hard','Quicker items and more squares.',{stim:400,blankMin:450,blankMax:700,nogo:.4}]]);
addChal('stroop',[['std','Standard','Standard','Tap the colour of the ink, not the word.'],['two','Two colours','Calm','Only orange and blue.',{ncol:2,incong:.5}],['clash','All clashing','Hard','Every word is a different colour from its ink.',{incong:1}]]);
addChal('switch',[['std','Standard','Standard','Follow the word. The rule changes about half the time.',{rate:.5}],['rapid','Rapid change','Hard','The rule changes almost every time.',{rate:.9}],['steady','Steady','Calm','The rule changes rarely. Stay on track.',{rate:.25}]]);
addChal('span',[['std','Standard','Standard','Watch the blocks, then repeat the order.'],['fast','Fast blocks','Hard','The blocks light up quicker.',{pace:450}],['slow','Slow blocks','Calm','More time to take each one in.',{pace:900}]]);
addChal('change',[['std','Standard','Standard','Five squares. Did the marked one change colour?'],['big','Big set','Hard','Seven squares and a shorter look.',{size:7,show:600}],['easy','Easy look','Calm','Three squares and a longer look.',{size:3,show:1200}]]);
addChal('nback',[['std','Standard','Standard','Tap when a letter matches the one before.'],['two','Two back','Hard','Match the letter from two steps back.',{back:2,isi:2200}]]);
addChal('match',[['std','Standard','Standard','Find all six pairs, on three boards.'],['ten','Ten pairs','Hard','Twenty cards to remember.',{pairs:10}]]);
addChal('space',[['std','Standard','Standard','Which one is the same shape, just turned?'],['big','Bigger shapes','Hard','Nine blocks instead of seven.',{cells:9}],['small','Small shapes','Calm','Only five blocks.',{cells:5}]]);
addChal('pattern',[['std','Standard','Standard','What number comes next? A mix of steady steps, doubling, alternating and growing rules.'],['two','Level 2','Hard','Doubling, tripling and alternating rules.',{level:2}],['three','Level 3','Hard','Rules that build on themselves.',{level:3}]]);

GOALS[0].stages=['timing','speed','trail','math'];GOALS[1].stages=['flanker','search','hold','speed'];GOALS[2].stages=['hold','stroop','nback'];GOALS[3].stages=['switch','trail'];GOALS[4].stages=['space','pattern','change'];
GOALS.splice(5,0,{id:'memory',name:'Sequence and pairs games',sub:'Sequences, pairs and changes',stages:['span','change','nback','match']});

/* ---------- the next batch of challenges (recipes only: the mechanics above do the work) ---------- */
function more(game,list){list.forEach(function(c){CH.push({id:game+':'+c[0],stage:game,name:c[1],std:0,tier:c[2],desc:c[3],mods:c[4]||{}})})}
more('timing',[['bslow','Blind and slow','Hard','Slow dots that vanish halfway.',{blind:1,tmin:1800,tmax:2600}],['bquick','Quick and blind','Hard','Fast dots that vanish halfway.',{blind:1,tmin:600,tmax:800}],['steady','Steady pace','Calm','Every dot moves at about the same pace.',{tmin:1200,tmax:1300}],['sprint','Sprint','Hard','Very fast dots, around half a second.',{tmin:500,tmax:600}],['river','Lazy river','Calm','The slowest dots you will see.',{tmin:2400,tmax:3000}]]);
more('trail',[['six','Tiny six','Calm','Just six circles.',{count:6}],['eleven','Eleven','Standard','Eleven circles to find.',{count:11}],['alt8','Letters sprint','Hard','Eight circles, numbers and letters.',{count:8,alt:1}],['alt12','Twelve with letters','Hard','1, A, 2, B and so on, up to twelve.',{count:12,alt:1}],['alt14','Fourteen with letters','Hard','The longest numbers-and-letters trail.',{count:14,alt:1}]]);
more('math',[['easy','Easy sums','Calm','Numbers up to 10.',{max:10}],['t10','Times to ten','Calm','Adds times tables up to 10.',{ops:2,max:10}],['m40','Mixed forty','Hard','Sums and products, numbers up to 40.',{ops:2,max:40}],['n99','Nineties','Hard','Numbers up to 99.',{max:99}],['t99','Big mixed','Hard','Everything, with numbers up to 99.',{ops:2,max:99}]]);
more('speed',[['easy','Gentle glance','Calm','Starts from a long, easy flash.',{start:13}],['short','Short flash','Hard','Starts from a short flash.',{start:8}],['blink','Blink','Hard','Starts from a very short flash.',{start:3}],['blink2','Blink and miss','Hard','Starts from the shortest flash.',{start:1}],['mid','Middle ground','Standard','Starts from a medium flash.',{start:6}]]);
more('flanker',[['three','Three arrows','Calm','Only one arrow on each side.',{size:3}],['easy','Mostly easy','Calm','Most rows point the same way.',{incong:.2}],['tricky','Mostly tricky','Hard','Most rows disagree.',{incong:.8}],['seven','Seven arrows','Hard','Seven arrows in a row.',{size:7}],['clash','Five and clashing','Hard','Four rows in five disagree.',{incong:.8}]]);
more('search',[['t10','Ten shapes','Calm','Find it among ten.',{size:10}],['t20','Twenty shapes','Standard','Find it among twenty.',{size:20}],['t24','Twenty-four shapes','Hard','Find it among twenty-four.',{size:24}],['t32','Thirty-two shapes','Hard','Find it among thirty-two.',{size:32}],['t36','Thirty-six shapes','Hard','The most crowded screen.',{size:36}]]);
more('hold',[['easy','Easy go','Calm','Mostly discs, few squares.',{nogo:.15}],['heavy','Square heavy','Hard','Half of them are squares.',{nogo:.5}],['gaps','Slow gaps','Calm','Long pauses between items.',{blankMin:1200,blankMax:2000}],['blink','Quick blink','Hard','Items show for only a moment.',{stim:300}],['wait','Long wait','Hard','Long gaps and plenty of squares.',{blankMin:1500,blankMax:2500,nogo:.4}]]);
more('stroop',[['three','Three colours','Standard','Orange, blue and red.',{ncol:3}],['match','Mostly matching','Calm','Most words match their ink.',{incong:.3}],['c3','Three and clashing','Hard','Three colours, every word clashes.',{ncol:3,incong:1}],['c2','Two, mostly clashing','Hard','Orange and blue, four words in five clash.',{ncol:2,incong:.8}],['half','Half and half','Standard','Half the words clash.',{incong:.5}]]);
more('switch',[['slow','Slow swap','Calm','The rule almost never changes.',{rate:.1}],['mostly','Mostly steady','Calm','The rule changes now and then.',{rate:.15}],['quarter','Quarter turns','Standard','The rule changes about one time in three.',{rate:.35}],['busy','Busy','Hard','The rule changes most of the time.',{rate:.7}],['always','Constant','Hard','The rule changes every single time.',{rate:1}]]);
more('span',[['s4','Start at four','Standard','Begin with four blocks.',{start:4}],['s5','Start at five','Hard','Begin with five blocks.',{start:5}],['f4','Fast from four','Hard','Four blocks, quick pace.',{start:4,pace:450}],['gentle','Gentle start','Calm','Begin with two blocks, plenty of time.',{start:2,pace:900}],['blink','Blink blocks','Hard','Very quick flashes.',{pace:350}]]);
more('change',[['c4','Four squares','Standard','Remember four colours.',{size:4}],['c6','Six squares','Hard','Remember six colours.',{size:6}],['c8','Eight squares','Hard','Remember eight, with a short look.',{size:8,show:600}],['glimpse','Quick glimpse','Hard','Five squares, a very short look.',{show:400}],['long','Long look','Calm','Five squares, plenty of time.',{size:5,show:1600}]]);
more('nback',[['three','Three back','Hard','Match the letter from three steps back.',{back:3,isi:2400}],['fast','Fast one-back','Hard','One back, quicker letters.',{isi:1200}],['slow','Slow one-back','Calm','One back, more time.',{isi:2600}],['many','Lots of repeats','Standard','More repeats to spot.',{targets:.4}],['two2','Two back, slow','Standard','Two back, plenty of time.',{back:2,isi:2800}]]);
more('match',[['p7','Seven pairs','Standard','Fourteen cards, two boards.',{pairs:7}],['p8','Eight pairs','Hard','Sixteen cards, two boards.',{pairs:8}],['p9','Nine pairs','Hard','Eighteen cards.',{pairs:9}]]);
more('space',[['s6','Six blocks','Calm','A little simpler than usual.',{cells:6}],['s8','Eight blocks','Hard','A little harder than usual.',{cells:8}],['s10','Ten blocks','Hard','The biggest shapes.',{cells:10}]]);
more('pattern',[['steps','Steady steps','Standard','Numbers that go up by the same amount.',{kind:1}],['double','Doubling','Standard','Numbers that double or triple.',{kind:2}],['alt','Alternating steps','Hard','Two different steps, one after the other.',{kind:3}],['squares','Square numbers','Hard','1, 4, 9, 16 and friends.',{kind:4}],['fib','Sum of the last two','Hard','Each number adds the two before it.',{kind:5}],['grow','Growing steps','Hard','The step gets bigger each time.',{kind:6}]]);

/* ---------- finishing: score floors for Form, and every game gets the safe wrapper ---------- */
STG.forEach(function(s){var g=typeof REGISTRY!=='undefined'?REGISTRY.games.filter(function(x){return x.id===s.id})[0]:null;s.floor=g?Math.max(g.lo*.5,.05):.1});   // a result of 0 cannot send a ratio to infinity
Object.keys(GAMES).forEach(function(k){GAMES[k]=safeGame(GAMES[k])});   // an exception inside a game shows an error result with a Back button instead of a blank screen
