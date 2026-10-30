(function(){
var c=document.getElementById('gc');if(!c)return;
var W=400,H=660,CX=200,CY=300,R=92,KY=500,BAND=104,T=Math.PI*2,H2=Math.PI/2;
var OR='#F2600C',INK='#14110F',MUTE='#5E5953',STEEL='#D8D4CD',BG='#F1F1EE';
var SERIF='"Plus Jakarta",system-ui,sans-serif',MONO=SERIF;
function pal(){var cs=getComputedStyle(document.documentElement),g=function(k,d){return cs.getPropertyValue(k).trim()||d};OR=g('--accent',OR);INK=g('--ink',INK);MUTE=g('--muted',MUTE);BG=g('--ph',BG)}
var x=c.getContext('2d');
var live=document.getElementById('gs');
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var st='idle',th=0,dir=1,lvl=1,knives=0,done=0,need=6,stuck=[],fly=null,parts=[],flash=0,pop=0,shake=0,toast=0,seeds=[],note='',noteT=0;
var time=0,last=0,raf=0,vis=true,best=0,fresh=false,overAt=0;
var dn=new Date(),dk=dn.getFullYear()+'-'+(dn.getMonth()+1)+'-'+dn.getDate(),today=0;
try{best=+localStorage.getItem('sliceBest')||0;var td=JSON.parse(localStorage.getItem('sliceToday')||'{}');if(td.d===dk)today=td.v|0}catch(e){}
var coarse=window.matchMedia&&matchMedia('(pointer: coarse)').matches,HINT=coarse?'Tap to hit':'Press Space or click to hit';

/* ---- sound: everything is synthesised, no audio files ---- */
var AC=window.AudioContext||window.webkitAudioContext,ac=null,sg,mb,mus,mel,echo,nbuf,crackle=null,timer=0,nextT=0,step=0;
function pref(k){try{return localStorage.getItem(k)!=='0'}catch(e){return true}}
function keep(k,v){try{localStorage.setItem(k,v?'1':'0')}catch(e){}}
var snd=pref('sliceSound');
function audio(){
  if(!AC)return null;
  if(!ac){
    ac=new AC();var mg=ac.createGain();mg.gain.value=.9;mg.connect(ac.destination);
    sg=ac.createGain();sg.gain.value=.5;sg.connect(mg);
    mb=ac.createGain();mb.gain.value=0;mb.connect(mg);
    mus=ac.createBiquadFilter();mus.type='lowpass';mus.frequency.value=3000;mus.connect(mb);
    echo=ac.createDelay(1);echo.delayTime.value=.44;
    var fb=ac.createGain(),dl=ac.createBiquadFilter();fb.gain.value=.33;dl.type='lowpass';dl.frequency.value=1700;
    echo.connect(dl);dl.connect(fb);fb.connect(echo);dl.connect(mus);
    mel=ac.createGain();mel.connect(mus);mel.connect(echo);
    nbuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);var dd=nbuf.getChannelData(0);for(var i=0;i<dd.length;i++)dd[i]=Math.random()*2-1;
  }
  if(ac.state==='suspended')ac.resume();
  return ac;
}
function tone(t,f,dur,type,vol,dest,att){
  var o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+(att||.01));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.05);
}
function noise(t,dur,type,f,vol,dest){
  var s=ac.createBufferSource();s.buffer=nbuf;s.loop=true;
  var fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;
  var g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(fl);fl.connect(g);g.connect(dest);s.start(t);s.stop(t+dur+.05);
}
function sfx(n){
  if(!snd||!ac)return;var t=ac.currentTime+.005;
  if(n==='throw')noise(t,.12,'bandpass',900,.5,sg);
  else if(n==='stick'){tone(t,170+done*14,.14,'sine',.9,sg);tone(t,90,.12,'triangle',.6,sg);noise(t,.05,'highpass',2500,.35,sg)}
  else if(n==='fail'){tone(t,1760,.5,'triangle',.3,sg);tone(t,2490,.4,'square',.1,sg);tone(t,110,.25,'sine',.8,sg)}
  else if(n==='level'){[523,659,784,1047].forEach(function(fr,i){tone(t+i*.08,fr,.5,'sine',.32,sg,.005)})}
}
var CH=[{r:36,n:[60,64,67,71]},{r:33,n:[57,60,64,67]},{r:38,n:[57,62,65,69]},{r:31,n:[59,62,65,67]}],PENT=[72,74,76,79,81,84];
function mtof(m){return 440*Math.pow(2,(m-69)/12)}
function beat(sn,t){
  var ch=CH[Math.floor(sn/8)%4],b=sn%8;
  if(b===0){ch.n.forEach(function(m,i){tone(t+i*.028,mtof(m),2.7,'triangle',.1,mus,.03);tone(t+i*.028,mtof(m)*2.003,1.6,'sine',.025,mus,.03)});tone(t,mtof(ch.r),1.1,'sine',.34,mus,.02)}
  if(b===4)tone(t,mtof(ch.r+7),.8,'sine',.2,mus,.02);
  if(b===0||b===5){var o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);
    g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.0001,t+.2);o.connect(g);g.connect(mus);o.start(t);o.stop(t+.25)}
  if(b===2||b===6)noise(t,.12,'bandpass',1700,.16,mus);
  noise(t,.04,'highpass',7000,b%2?.035:.06,mus);
  if(b%2===0&&Math.random()<.3)tone(t,mtof(PENT[Math.floor(Math.random()*PENT.length)]),1,'sine',.07,mel,.01);
}
function sched(){
  var eighth=60/74/2;
  while(nextT<ac.currentTime+.45){beat(step%32,nextT+(step%2?.045:0));nextT+=eighth;step++}
}
function startMusic(){
  if(!audio()||timer)return;
  nextT=ac.currentTime+.1;step=0;mb.gain.cancelScheduledValues(ac.currentTime);mb.gain.setValueAtTime(mb.gain.value,ac.currentTime);mb.gain.linearRampToValueAtTime(.6,ac.currentTime+1.5);
  var s=ac.createBufferSource();s.buffer=nbuf;s.loop=true;var hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=3500;
  var g=ac.createGain();g.gain.value=.012;s.connect(hp);hp.connect(g);g.connect(mb);s.start();crackle=s;
  timer=setInterval(sched,120);
}
function stopMusic(){
  if(!timer)return;clearInterval(timer);timer=0;
  mb.gain.cancelScheduledValues(ac.currentTime);mb.gain.setValueAtTime(mb.gain.value,ac.currentTime);mb.gain.linearRampToValueAtTime(0,ac.currentTime+.5);
  var s=crackle;crackle=null;setTimeout(function(){try{s.stop()}catch(e){}},700);
}
function away(){if(ac&&ac.state==='running')ac.suspend()}
function back(){if(ac&&ac.state==='suspended'&&snd)ac.resume()}

/* ---- controls: one sound switch, enlarge ---- */
var box=document.getElementById('game'),bS=document.getElementById('gsound'),bX=document.getElementById('gx'),bB=document.getElementById('gback');
var SV='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
var ICON_ON=SV+'<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 9a4 4 0 010 6M19 6.5a8 8 0 010 11"/></svg>';
var ICON_OFF=SV+'<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9.5l5 5M22 9.5l-5 5"/></svg>';
var ICON_BIG=SV+'<path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5"/></svg>';
var ICON_SMALL=SV+'<path d="M3 8h5V3M16 3v5h5M21 16h-5v5M8 21v-5H3"/></svg>';
function big(){return box&&box.classList.contains('big')}
function labels(){
  if(bS){bS.innerHTML=snd?ICON_ON:ICON_OFF;bS.setAttribute('aria-pressed',snd);bS.setAttribute('aria-label',snd?'Sound on. Press to mute.':'Sound off. Press to turn on.')}
  if(bX){bX.innerHTML=big()?ICON_SMALL:ICON_BIG;bX.setAttribute('aria-expanded',big());bX.setAttribute('aria-label',big()?'Close the large view':'Enlarge the game')}
}
var bP=document.getElementById('play'),bC=document.getElementById('gclose'),panel=box?box.querySelector('.gpanel'):null;
var vtOk=!!document.startViewTransition&&!rm;
function setName(el,on){if(el)el.style.viewTransitionName=on?'zest':''}
/* The Play button grows into the game, and the game shrinks back into the button. */
function swap(update,from,to){
  if(!vtOk){update(true);return}
  setName(from,true);
  var t=document.startViewTransition(function(){setName(from,false);setName(to,true);update(false)});
  var done=function(){setName(to,false)};
  t.finished.then(done,done);
}
function openGame(){
  if(!box||big())return;
  swap(function(fb){box.classList.toggle('fb',fb);box.classList.add('big');document.documentElement.classList.add('lock');fit();kick()},bP,panel);
  setTimeout(function(){c.focus({preventScroll:true});labels()},vtOk?650:80);
}
function closeGame(){
  if(!big())return;
  swap(function(){box.classList.remove('big','fb');document.documentElement.classList.remove('lock');fit()},panel,bP);
  setTimeout(function(){if(bP)bP.focus({preventScroll:true});labels()},vtOk?650:80);
}
function toggleBig(){if(big())closeGame();else openGame()}
function fit(){
  var s=Math.min(3,Math.max(1,(c.clientWidth||W)*(window.devicePixelRatio||1)/W));
  c.width=Math.round(W*s);c.height=Math.round(H*s);x.setTransform(s,0,0,s,0,0);draw();
}
if(bS)bS.addEventListener('click',function(e){e.stopPropagation();snd=!snd;keep('sliceSound',snd);if(snd){audio();startMusic()}else stopMusic();labels()});
if(bX)bX.addEventListener('click',function(e){e.stopPropagation();toggleBig()});
if(bB)bB.addEventListener('click',function(){if(big())toggleBig()});
function markZ(){try{sessionStorage.setItem('zestback',String(Date.now()))}catch(e){}}
markZ();setInterval(markZ,1500);
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(window.zestExit){window.zestExit();return}if(history.length>1&&document.referrer.indexOf(location.origin)===0)history.back();else location.href='/'}});

if(bP)bP.addEventListener('click',openGame);
if(bC)bC.addEventListener('click',closeGame);
var rz=0;window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(fit,150)});

function wrap(a){a%=T;if(a>Math.PI)a-=T;if(a<-Math.PI)a+=T;return a}
function say(t){if(live)live.textContent=t}
function txt(s,px,py,font,col,al){x.font=font;x.textAlign=al||'left';x.lineJoin='round';x.lineWidth=5;x.strokeStyle=BG;x.strokeText(s,px,py);x.fillStyle=col;x.fillText(s,px,py)}
function knife(ox,oy,rot){
  x.save();x.translate(ox,oy);x.rotate(rot);
  x.beginPath();x.moveTo(0,0);x.lineTo(46,-8);x.lineTo(52,-8);x.lineTo(52,8);x.lineTo(46,8);x.closePath();
  x.fillStyle=STEEL;x.fill();x.lineWidth=1.5;x.strokeStyle=INK;x.stroke();
  x.fillStyle=INK;x.fillRect(52,-6,34,12);x.fillStyle=OR;x.fillRect(52,-6,5,12);
  x.restore();
}
function burst(px,py,n,sp,cone){
  for(var i=0;i<n;i++){
    var a=cone?-H2+(Math.random()-.5)*1.7:Math.random()*T,v=sp*(.4+Math.random()*.6);
    parts.push({x:px,y:py,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1});
  }
}
function draw(){
  x.clearRect(0,0,W,H);x.fillStyle=BG;x.fillRect(0,0,W,H);
  x.save();
  if(shake>0)x.translate((Math.random()-.5)*shake*12,(Math.random()-.5)*shake*12);
  x.lineJoin='round';
  var s=1+pop*.1;
  x.save();x.translate(CX,CY);x.scale(s,s);x.rotate(th);
  x.beginPath();x.arc(0,0,R-4,0,T);x.lineWidth=8;x.strokeStyle=flash>0?INK:OR;x.stroke();
  x.fillStyle=OR;x.strokeStyle=OR;x.lineWidth=5;
  for(var i=0;i<8;i++){var a0=i*T/8+.05,a1=(i+1)*T/8-.05;
    x.beginPath();x.arc(0,0,R-17,a0,a1);x.arc(0,0,16,a1,a0,true);x.closePath();x.fill();x.stroke()}
  for(var q2=0;q2<seeds.length;q2++){var sd=seeds[q2];x.save();x.rotate(sd.a);x.translate(R-2,0);x.beginPath();x.ellipse(0,0,9,5.5,0,0,T);x.fillStyle=INK;x.fill();x.lineWidth=2;x.strokeStyle=OR;x.stroke();x.restore()}
  for(var j=0;j<stuck.length;j++){var k=stuck[j];
    x.save();x.rotate(k.a);x.translate(R-14,0);x.rotate(Math.sin(time*46)*k.w*.09);knife(0,0,0);x.restore()}
  x.restore();
  for(var q=0;q<parts.length;q++){var p=parts[q];x.globalAlpha=Math.max(p.l,0);x.fillStyle=OR;x.beginPath();x.arc(p.x,p.y,3.2,0,T);x.fill()}
  x.globalAlpha=1;
  if(st!=='over'&&!fly)knife(CX,KY,H2);
  if(fly)knife(CX,fly.y,H2+(fly.bad?fly.spin:0));
  x.restore();
  /* text band: nothing in the playfield can reach up here */
  x.fillStyle=BG;x.fillRect(0,0,W,BAND);x.globalAlpha=.22;x.fillStyle=MUTE;x.fillRect(0,BAND,W,1);x.globalAlpha=1;
  txt(String(knives),26,68,'800 54px '+SERIF,INK);
  txt('KNIVES',28,90,'600 11px '+MONO,MUTE);
  if(noteT>0){x.globalAlpha=Math.min(1,noteT*2);txt(note,CX,48,'800 26px '+SERIF,OR,'center');x.globalAlpha=1}
  else txt('Zest',CX,48,'800 26px '+SERIF,INK,'center');
  txt('LEVEL '+lvl,W-24,36,'600 15px '+MONO,INK,'right');
  txt('TODAY '+today,W-24,58,'600 12px '+MONO,MUTE,'right');
  txt('BEST '+best,W-24,78,'600 12px '+MONO,MUTE,'right');
  /* bottom strip: hint, then the knives still to throw */
  if(st==='idle'||st==='play')txt(HINT,CX,H-46,'600 12px '+MONO,MUTE,'center');
  var x0=CX-need*8;
  for(var n=0;n<need;n++){var ix=x0+n*16;x.globalAlpha=n<done?.25:1;
    x.fillStyle=STEEL;x.fillRect(ix,H-34,5,9);x.fillStyle=INK;x.fillRect(ix,H-25,5,14);x.fillStyle=OR;x.fillRect(ix,H-25,5,3)}
  x.globalAlpha=1;
  if(st==='over'){
    x.globalAlpha=.95;x.fillStyle=BG;x.fillRect(0,0,W,H);x.globalAlpha=1;
    txt('Clink.',CX,CY-30,'800 62px '+SERIF,INK,'center');
    txt(knives+(knives===1?' knife':' knives'),CX,CY+18,'600 18px '+MONO,INK,'center');
    if(fresh)txt('New all-time best',CX,CY+46,'600 13px '+MONO,OR,'center');
    txt('TODAY '+today+'   BEST '+best,CX,CY+(fresh?72:50),'600 12px '+MONO,MUTE,'center');
    txt(coarse?'Tap to play again':'Press Space or click to play again',CX,CY+120,'600 13px '+MONO,MUTE,'center');
  }
}
function layout(){
  need=Math.min(5+lvl,12);stuck=[];
  var n=lvl>=2?Math.min(lvl-1,4):0,tries=0;
  while(stuck.length<n&&tries++<80){var a=Math.random()*T;
    if(stuck.every(function(b){return Math.abs(wrap(a-b.a))>.55}))stuck.push({a:a,w:0})}
  seeds=[];tries=0;
  while(seeds.length<1&&tries++<80){var sa=Math.random()*T;
    if(stuck.every(function(b){return Math.abs(wrap(sa-b.a))>.5}))seeds.push({a:sa})}
  done=0;
}
function run(){return vis&&!document.hidden}
function loop(t){
  var dt=Math.min((t-last)/1000,.05);last=t;raf=0;time+=dt;
  if(st==='play')th+=dir*(1.5+.3*lvl)*(lvl>=3?1+.4*Math.sin(time*1.4):1)*(rm?.6:1)*dt;
  else if(st==='idle'&&!rm)th+=.55*dt;
  if(fly){
    if(fly.bad){fly.y+=700*dt;fly.spin+=9*dt;if(fly.y>H+120)fly=null}
    else{fly.y-=1300*dt;if(fly.y<=CY+R-14)land()}
  }
  for(var i=parts.length-1;i>=0;i--){var p=parts[i];p.vy+=520*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt*1.8;if(p.l<=0)parts.splice(i,1)}
  for(var j=0;j<stuck.length;j++)stuck[j].w=Math.max(0,stuck[j].w-dt*3);
  flash=Math.max(0,flash-dt*3);pop=Math.max(0,pop-dt*4);shake=Math.max(0,shake-dt*3);toast=Math.max(0,toast-dt);noteT=Math.max(0,noteT-dt);
  draw();
  var busy=st==='play'||fly||parts.length||flash>0||pop>0||shake>0||toast>0||noteT>0||(st==='idle'&&!rm);
  if(busy&&run())raf=requestAnimationFrame(loop);
}
function kick(){last=performance.now();if(!raf&&run())raf=requestAnimationFrame(loop)}
function land(){
  var a=H2-th,hit=stuck.some(function(b){return Math.abs(wrap(a-b.a))<.21});
  if(hit){fly.bad=true;fly.spin=0;shake=rm?0:1;flash=rm?0:1;sfx('fail');end();return}
  fly=null;stuck.push({a:a,w:1});knives++;done++;
  for(var si=seeds.length-1;si>=0;si--){if(Math.abs(wrap(a-seeds[si].a))<.26){seeds.splice(si,1);knives+=3;note='Seed +3';noteT=1.1;burst(CX,CY,16,260,false);sfx('level')}}
  burst(CX,CY+R-6,8,230,true);sfx('stick');
  if(navigator.vibrate&&!rm)navigator.vibrate(12);
  if(done>=need){lvl++;dir=-dir;pop=rm?0:1;note='Level '+lvl;noteT=1.4;sfx('level');burst(CX,CY,22,300,false);layout();say('Level '+lvl+'. '+knives+' knives so far.')}
}
function end(){
  st='over';overAt=performance.now();fresh=knives>best&&knives>0;
  if(fresh){best=knives;try{localStorage.setItem('sliceBest',best)}catch(e){}}
  if(knives>today){today=knives;try{localStorage.setItem('sliceToday',JSON.stringify({d:dk,v:today}))}catch(e){}}
  if(shareB)shareB.hidden=!(knives>0);
  say('Game over. '+knives+' knives'+(fresh?', a new all-time best':'')+'. Today best '+today+'. All-time best '+best+'. Press Space to play again.');kick();
}
function start(){if(shareB)shareB.hidden=true;knives=0;lvl=1;dir=1;th=0;time=0;fly=null;parts=[];flash=0;pop=0;shake=0;toast=0;noteT=0;fresh=false;layout();st='play';say('Level 1. Press Space or click to throw a knife into the orange. Do not hit another knife.');kick()}
function toss(){if(st!=='play'||fly)return;fly={y:KY};sfx('throw');kick()}
function act(){
  audio();if(snd&&!timer)startMusic();
  if(st==='over'){if(performance.now()-overAt<450)return;start();return}
  if(st==='idle')start();
  toss();
}
var shareB=null;
(function(){var pn=box&&box.querySelector('.gpanel');if(!pn)return;
  shareB=document.createElement('button');shareB.type='button';shareB.className='btn ghost zshare';shareB.hidden=true;shareB.textContent='Share your score';pn.appendChild(shareB);
  shareB.addEventListener('click',function(e){e.stopPropagation();
    var msg='I threw '+knives+' knives in Zest and reached level '+lvl+'. Can you beat it? https://orangepulplabs.com/zest/';
    if(navigator.share){navigator.share({text:msg}).catch(function(){})}
    else if(navigator.clipboard){navigator.clipboard.writeText(msg).then(function(){shareB.textContent='Copied';setTimeout(function(){shareB.textContent='Share your score'},1600)},function(){})}
  });
})();
c.addEventListener('pointerdown',function(e){e.preventDefault();act()});
c.addEventListener('keydown',function(e){if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();act()}});
if(window.IntersectionObserver)new IntersectionObserver(function(en){vis=en[0].isIntersecting;if(vis){kick();back()}else{if(raf){cancelAnimationFrame(raf);raf=0}away()}}).observe(c);
document.addEventListener('visibilitychange',function(){if(document.hidden){if(raf){cancelAnimationFrame(raf);raf=0}away()}else{kick();back()}});
if(document.fonts&&document.fonts.load){document.fonts.load('800 58px "Plus Jakarta"').then(function(){draw()})}
pal();labels();fit();kick();
if(window.MutationObserver)new MutationObserver(function(){pal();draw()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
if(window.matchMedia)matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){pal();draw()});
})();
