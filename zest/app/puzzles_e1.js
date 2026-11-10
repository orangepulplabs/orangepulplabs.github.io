/* Zest puzzles, wave 3 file E1 (theme F2, Sound and Time): Endless Rise, Sixteen-Beat Clap, Shadow the Voice, Up and Down. Contract: puzzles_kit.js.
   Pure generators first (no DOM, exposed as PZE1 for tests), then one shared round shell, then four small specs.
   Every make(level, rng) is deterministic in rng and returns plain JSON. All four are turn-based and fully playable with the sound off:
   every sound has a picture beside it. Sound is optional, off by default, made with Web Audio on the first tap of "Sound", closed in destroy().
   Par = number of rounds (one Check or pick per round). A wrong Check costs one extra move. undo:false on all four (Hint and Try again).
   Rules (all exact):
   - Endless Rise: two notes on the 12-note pitch circle (clockwise = higher). Tritone pairs (6 apart) are never used. Answer = the shorter way round.
   - Sixteen-Beat Clap: a 16-beat cycle in four sections of 4 (sam = beat 1, section starts 1, 5, 9, 13). Rounds: mark the section starts / next section start after beat b / beat reached after N more beats.
   - Shadow the Voice: two lanes (left ear, right ear) of two-note chimes; tap every rising chime (second note higher) in the followed lane only.
   - Up and Down: for each step between neighbouring notes of a short melody choose Up, Same or Down. Melodies are made up by Zest's own generator. */
var PZE1={};
PZE1.NOTES=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
function pze1Pl(n,w,p){return n+' '+(n===1?w:(p||w+'s'))}
function pze1KeyOk(e){return !(e.ctrlKey||e.metaKey||e.altKey)&&!/^(INPUT|TEXTAREA|SELECT)$/.test((e.target&&e.target.tagName)||'')}
function pze1One(n,i){var a=[],k;for(k=0;k<n;k++)a.push(k===i?1:0);return a}

/* ---- 1. Endless Rise ---- */
PZE1.makeEndless=function(level,rng){
  var n=6+Math.floor((level-1)/3),pool=level<=10?[1,2,3]:level<=20?[2,3,4]:[3,4,5],rounds=[],prev='',guard=0;
  while(rounds.length<n&&guard++<500){var a=pzInt(rng,12),m=pool[pzInt(rng,pool.length)],up=rng()<.5?1:0,b=(a+(up?m:12-m))%12,key=a+'-'+b;
    if(key===prev)continue;prev=key;rounds.push({a:a,b:b,up:up,steps:m,ans:[[up?1:0,up?0:1]]})}
  return {title:'Level '+level,level:level,rounds:rounds,par:n}};
/* independent: direction by the shorter way round the circle */
PZE1.endlessDir=function(a,b){var d=((b-a)%12+12)%12;return d<6?1:0};

/* ---- 2. Sixteen-Beat Clap ---- */
PZE1.STARTS=[0,4,8,12];
PZE1.makeClap=function(level,rng){
  var n=3+Math.floor((level-1)/6),pool=level<=6?['next','marks']:level<=15?['next','ahead','marks']:['ahead','ahead','next','marks'],rounds=[],i;
  for(i=0;i<n;i++){var k=(i===0&&level<=12)?'marks':pool[pzInt(rng,pool.length)],b=pzInt(rng,16),N=0,ans=[],j;
    for(j=0;j<16;j++)ans.push(0);
    if(k==='marks'){PZE1.STARTS.forEach(function(s){ans[s]=1});b=-1}
    else if(k==='next'){var nx=0;for(j=0;j<4;j++)if(PZE1.STARTS[j]>b){nx=PZE1.STARTS[j];break}ans[nx]=1}
    else{do{N=level<=15?3+pzInt(rng,6):5+pzInt(rng,10+level)}while(N%16===0);ans[(b+N)%16]=1}
    rounds.push({k:k,b:b,N:N,radio:k!=='marks',ans:[ans]})}
  return {title:'Level '+level,level:level,rounds:rounds,par:n}};

/* ---- 3. Shadow the Voice ---- */
PZE1.makeShadow=function(level,rng){
  var n=2+Math.floor((level-1)/8),L=4+Math.floor((level-1)/6),gr=level<=10?[3,5]:level<=20?[2,4]:[1,3],rounds=[],r,tries;
  function chime(){var f,g,s,up;do{f=1+pzInt(rng,8);g=gr[0]+pzInt(rng,gr[1]-gr[0]+1);up=rng()<.5;s=up?f+g:f-g;if(s<1||s>8){s=up?f-g:f+g}}while(s<1||s>8);return {f:f,s:s}}
  for(r=0;r<n;r++){var rd=null;
    for(tries=0;tries<200;tries++){var t=pzInt(rng,2),lanes=[[],[]],i,c;
      for(c=0;c<2;c++)for(i=0;i<L;i++)lanes[c].push(chime());
      var ups=lanes[t].filter(function(x){return x.s>x.f}).length;
      if(ups>=1&&ups<=L-1){rd={target:t,lanes:lanes,ans:lanes.map(function(ln,ch){return ln.map(function(x){return ch===t&&x.s>x.f?1:0})})};break}}
    if(!rd){var lanes2=[[],[]];for(i=0;i<L;i++){lanes2[0].push({f:2,s:i%2?1:3});lanes2[1].push({f:3,s:i%2?4:2})}
      rd={target:0,lanes:lanes2,ans:lanes2.map(function(ln,ch){return ln.map(function(x){return ch===0&&x.s>x.f?1:0})})}}
    rounds.push(rd)}
  return {title:'Level '+level,level:level,rounds:rounds,par:n}};

/* ---- 4. Up and Down ---- */
PZE1.makeContour=function(level,rng){
  var n=2+Math.floor((level-1)/10),len=4+Math.floor((level-1)/5),allowSame=level>10,rounds=[],r,tries;
  for(r=0;r<n;r++){var notes=null;
    for(tries=0;tries<300&&!notes;tries++){var x=1+pzInt(rng,8),a=[x],i,ok=true;
      for(i=1;i<len;i++){var mag=allowSame&&rng()<.2?0:1+pzInt(rng,3),y=x+(rng()<.5?mag:-mag);if(y<1||y>8)y=x+(y<1?mag:-mag);if(y<1||y>8){ok=false;break}a.push(y);x=y}
      if(!ok)continue;var u=0,d=0,s=0;for(i=1;i<len;i++){if(a[i]>a[i-1])u++;else if(a[i]<a[i-1])d++;else s++}
      if(u>=1&&d>=1&&(allowSame||s===0)&&(level<=10||s>=1||level>20))notes=a}
    if(!notes){notes=[];for(var q=0;q<len;q++)notes.push(q%2?2:4+(q%4===0?1:0))}
    var ans=[];for(var j=1;j<notes.length;j++)ans.push(pze1One(3,notes[j]>notes[j-1]?0:notes[j]===notes[j-1]?1:2));
    rounds.push({notes:notes,ans:ans})}
  return {title:'Level '+level,level:level,rounds:rounds,par:n}};

/* ================= sound (optional; never required) ================= */
var PZE1_CSS='.pze1{display:flex;flex-direction:column;gap:12px;width:100%;max-width:24rem;margin:0 auto;color:var(--ink);font-family:var(--font)}.pze1 *{box-sizing:border-box}'
+'.pze1-top{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:2px 12px}.pze1-goal{margin:0;font:700 1.125rem/1.25 var(--disp)}.pze1-ct{font:650 .875rem var(--font);color:var(--muted)}'
+'.pze1-board{position:relative}.pze1-msg{margin:0;min-height:2.8em;font-size:.9375rem;line-height:1.4;color:var(--muted)}.pze1-note{margin:8px 0 0;font-size:.8125rem;line-height:1.4;color:var(--muted)}'
+'.pze1-bar,.pze1-act,.pze1-snd{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.pze1-act,.pze1-snd{margin-top:10px}.pze1-bar .pzb{flex:1 1 5.5rem}'
+'.pze1 .pzb{min-height:3rem;min-width:48px;padding:.25rem 14px;border:0;border-radius:var(--r1);background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);font:700 1rem/1.2 var(--font);color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-align:center;transition:transform .12s}'
+'.pze1 .pzb:active{transform:scale(.97)}.pze1 .pzb:disabled{background:var(--dis-bg);color:var(--dis-ink);box-shadow:none;cursor:default}.pze1 .pzb.pri{background:var(--accent);color:var(--on-accent);box-shadow:none}'
+'.pze1 .pzb:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.pze1 .pzb.pze1-hint{outline:3px dashed var(--ink);outline-offset:3px}.pze1 .pzb[aria-pressed=true]{background:var(--tint);box-shadow:inset 0 0 0 3px var(--accent)}'
+'.pze1-prompt{margin:0 0 8px;font:600 1rem/1.4 var(--font)}.pze1-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;margin-top:8px}.pze1 .pze1-two .pzb{min-height:4rem;font:700 1.125rem var(--disp)}'
+'.pze1-circle{display:flex;justify-content:center}.pze1-circle svg{width:100%;max-width:15rem;height:auto;display:block}.pze1-circle text{font:700 11px var(--font);fill:var(--ink)}'
+'.pze1-sec{margin:8px 0 2px;font:650 .8125rem var(--font);color:var(--muted)}.pze1-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.pze1 .pze1-row .pzb{flex-direction:column;min-height:3.25rem;padding:2px;gap:0}.pze1-row .pzb small{font:600 .6875rem var(--font);color:var(--muted)}.pze1-row .pzb.now{box-shadow:0 0 0 2px var(--ink)}.pze1-row .pzb.pulse{background:var(--tint)}'
+'.pze1-lane{margin:10px 0 0}.pze1-lane h3{margin:0 0 4px;font:700 .9375rem var(--font)}.pze1-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(3rem,1fr));gap:6px}.pze1 .pze1-slots .pzb{flex-direction:column;min-height:3.75rem;padding:2px;gap:0}.pze1-slots svg{width:2.25rem;height:2.5rem;display:block}.pze1-slots small{font:600 .6875rem var(--font);color:var(--muted)}.pze1-lane.ign .pze1-slots{opacity:.9}'
+'.pze1-notes{display:flex;justify-content:center;margin:0 0 6px}.pze1-notes svg{width:100%;max-width:20rem;height:auto;display:block}.pze1-notes text{font:700 10px var(--font);fill:var(--ink)}'
+'.pze1-gap{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;align-items:center;margin-top:8px}.pze1-gap>span{grid-column:1/-1;font:650 .875rem var(--font)}.pze1 .pze1-gap .pzb{padding:2px 4px;font-size:.9375rem}'
+'.pze1-shape{display:flex;justify-content:center;margin-top:8px}.pze1-shape svg{width:100%;max-width:16rem;height:auto}'
+'.pze1.rm *,.pze1.rm *::before{transition:none!important;animation:none!important}@media (prefers-reduced-motion:reduce){.pze1 *,.pze1 *::before{transition:none!important;animation:none!important}}';
function pze1Css(){if(typeof document==='undefined'||document.getElementById('pze1-css'))return;var s=document.createElement('style');s.id='pze1-css';s.textContent=PZE1_CSS;(document.head||document.documentElement).appendChild(s)}
function pze1Svg(vb){var s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox',vb);s.setAttribute('aria-hidden','true');s.setAttribute('focusable','false');return s}
function pze1Sv(p,tag,at,txt){var e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.keys(at).forEach(function(k){e.setAttribute(k,at[k])});if(txt!=null)e.textContent=txt;p.appendChild(e);return e}
PZE1.ctx=function(S){var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;if(!S.ac)S.ac=new AC();if(S.ac.state==='suspended'&&S.ac.resume)S.ac.resume();return S.ac};
PZE1.tone=function(ac,f,t,dur,vol,pan){var o=ac.createOscillator(),g=ac.createGain(),out=g;o.type='sine';o.frequency.value=f;o.connect(g);
  if(ac.createStereoPanner){var p=ac.createStereoPanner();p.pan.value=pan||0;g.connect(p);out=p}out.connect(ac.destination);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.start(t);o.stop(t+dur+.05)};
/* Shepard-style tone: octave-spaced sines under a bell-shaped loudness curve, so it has a note name but no fixed octave */
PZE1.shepard=function(ac,pc,t,dur,vol){for(var k=0;k<9;k++){var pos=k+pc/12,f=16.35*Math.pow(2,pos),w=Math.exp(-Math.pow(pos-4.5,2)/(2*1.6*1.6));if(f<4500)PZE1.tone(ac,f,t,dur,vol*w,0)}};
PZE1.clap=function(ac,t,accent){var len=Math.floor(ac.sampleRate*.08),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0),i;for(i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);
  var s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=buf;f.type='bandpass';f.frequency.value=accent?1400:2200;s.connect(f);f.connect(g);g.connect(ac.destination);g.gain.value=accent?.35:.16;s.start(t);
  if(accent)PZE1.tone(ac,196,t,.2,.12,0)};
PZE1.degHz=function(d){return 261.63*Math.pow(2,[0,2,4,5,7,9,11,12][d-1]/12)};

/* ================= shared round shell ================= */
function pze1Shell(root,inst,api,o){
  pze1Css();while(root.firstChild)root.removeChild(root.firstChild);o=o||{};
  var S={timers:[],offs:[],dead:false,onDestroy:[]};
  S.wrap=pzEl('div',{class:'pze1'+(api.rm?' rm':'')+(o.cls?' '+o.cls:'')});
  S.goal=pzEl('p',{class:'pze1-goal',text:o.goal||''});S.ct=pzEl('span',{class:'pze1-ct num'});
  S.board=pzEl('div',{class:'pze1-board'});S.msg=pzEl('p',{class:'pze1-msg'});S.bar=pzEl('div',{class:'pze1-bar'});
  if(!api.say)S.msg.setAttribute('role','status');
  S.wrap.appendChild(pzEl('div',{class:'pze1-top'},[S.goal,S.ct]));S.wrap.appendChild(S.board);S.wrap.appendChild(S.msg);
  S.showBar=!(api.toolbar===false||inst.toolbar===false);if(S.showBar)S.wrap.appendChild(S.bar);
  S.say=function(t){S.msg.textContent=t;if(api.say)api.say(t)};
  S.later=function(fn,ms){var id=setTimeout(function(){if(!S.dead)fn()},ms);S.timers.push(id);return id};
  S.on=function(tg,ty,fn){tg.addEventListener(ty,fn);S.offs.push(function(){tg.removeEventListener(ty,fn)})};
  S.key=function(fn){S.on(document,'keydown',function(e){if(S.dead||!S.wrap.isConnected||!pze1KeyOk(e))return;if(fn(e))e.preventDefault()})};
  S.destroy=function(){S.dead=true;S.timers.forEach(clearTimeout);S.offs.forEach(function(f){f()});S.onDestroy.forEach(function(f){try{f()}catch(e){}});if(S.wrap.parentNode)S.wrap.parentNode.removeChild(S.wrap)};
  root.appendChild(S.wrap);return S}

/* sp = {cls, goal, instant, radio(round,g), draw(stage,round,H,S), h1(r), h2(r,sel), h3(r,g,o), explain(r), wrong(r,diff), play(S,r,H), playLabel, key(e,H), note, hasHide}
   Selection state sel[g][o] in {0,1}; round.ans has the same shape. radio groups hold exactly one 1 once chosen. */
function pze1Mount(root,inst,api,sp){
  var S=pze1Shell(root,inst,api,{cls:sp.cls,goal:sp.goal}),R=inst.rounds,ri=0,sel,btns,wrong=0,checks=0,hints=0,lvl=0,fin=0,sound=false,hide=false,bh,br,bc,
      stage=pzEl('div',{}),act=pzEl('div',{class:'pze1-act'}),snd=pzEl('div',{class:'pze1-snd'});
  S.board.appendChild(stage);S.board.appendChild(act);S.board.appendChild(snd);
  S.board.appendChild(pzEl('p',{class:'pze1-note',text:sp.note}));
  S.onDestroy.push(function(){if(S.ac&&S.ac.close)try{S.ac.close()}catch(e){}});
  function cur(){return R[ri]}
  function blank(){sel=cur().ans.map(function(g){return g.map(function(){return 0})})}
  function isRadio(g){return !!sp.radio(cur(),g)}
  var H={reg:function(g,o,b,fn){(btns[g]=btns[g]||[])[o]=b;b.onclick=function(){choose(g,o)};return b},get sound(){return sound},get hide(){return hide},S:S};
  function diff(){var r=cur(),n=0;r.ans.forEach(function(g,gi){if(isRadio(gi)){var bad=false;g.forEach(function(v,o){if(v!==sel[gi][o])bad=true});if(bad)n++}else g.forEach(function(v,o){if(v!==sel[gi][o])n++})});return n}
  function refresh(){S.wrap.querySelectorAll('.pze1-hint').forEach(function(m){m.classList.remove('pze1-hint')});
    btns.forEach(function(gs,g){gs.forEach(function(b,o){if(b)b.setAttribute('aria-pressed',sel[g][o]?'true':'false')})});
    var any=sel.some(function(g){return g.some(function(v){return v})});if(bc)bc.disabled=!any||!!fin}
  function render(){stage.textContent='';btns=[];S.ct.textContent='Round '+(ri+1)+' of '+R.length+(wrong?' · misses '+wrong:'');
    sp.draw(stage,cur(),H,S);refresh();renderSnd()}
  function renderSnd(){snd.textContent='';var b=pzBtn(sound?'Sound: on':'Sound: off',function(){sound=!sound;if(sound&&!PZE1.ctx(S)){sound=false;S.say('This device cannot make sound here. The picture shows everything.')}if(!sound)hide=false;render()},{'aria-pressed':sound?'true':'false'});snd.appendChild(b);
    if(sound){snd.appendChild(pzBtn(sp.playLabel,function(){sp.play(S,cur(),H)}));
      if(sp.hasHide)snd.appendChild(pzBtn(hide?'Notes: hidden':'Notes: shown',function(){hide=!hide;render()},{'aria-pressed':hide?'true':'false'}))}}
  function choose(g,o){if(fin)return false;lvl=0;hintLabel();
    if(isRadio(g))sel[g]=sel[g].map(function(_,k){return k===o?1:0});else sel[g][o]=sel[g][o]?0:1;refresh();
    if(sp.instant)check();return true}
  function check(){if(fin)return false;var d=diff();checks++;if(api.moved)api.moved();lvl=0;hintLabel();var r=cur();
    if(d===0){var ex=sp.explain(r);
      if(ri>=R.length-1){fin=1;S.ct.textContent='All '+R.length+' rounds done';btns.forEach(function(gs){gs.forEach(function(b){if(b)b.disabled=true})});if(bc)bc.disabled=true;
        S.say(ex+' That was the last round. You made '+pzc4PlE(checks,'check')+' for '+R.length+' rounds.');
        S.later(function(){api.done({solved:true,moves:checks,hints:hints,undos:0,extra:{par:inst.par,rounds:R.length,misses:wrong}})},350)}
      else{ri++;blank();render();S.say(ex+' Next round.')}}
    else{wrong++;S.ct.textContent='Round '+(ri+1)+' of '+R.length+' · misses '+wrong;S.say(sp.wrong(r,d))}
    return true}
  function hintLabel(){if(bh){bh.textContent=lvl===0?'Hint':lvl<3?'More hint':'Show again';bh.setAttribute('aria-label',bh.textContent)}}
  function hint(n){if(fin)return null;n=Math.max(1,Math.min(3,n||lvl+1));lvl=n;hints++;var r=cur(),t;
    S.wrap.querySelectorAll('.pze1-hint').forEach(function(m){m.classList.remove('pze1-hint')});
    if(n===1)t=sp.h1(r);else if(n===2)t=sp.h2(r,sel);
    else{var fg=-1,fo=-1;r.ans.forEach(function(g,gi){if(fg>=0)return;g.forEach(function(v,o){if(fg<0&&v!==sel[gi][o]){fg=gi;fo=o}})});
      if(fg<0){t='That looks right. Checking it.';S.say(t);hintLabel();check();return t}
      var want=r.ans[fg][fo];if(isRadio(fg)){fo=r.ans[fg].indexOf(1)}
      var b=btns[fg][fo];if(b)b.classList.add('pze1-hint');t=sp.h3(r,fg,fo,want);
      if(sp.instant){choose(fg,fo)}else{if(isRadio(fg))sel[fg]=sel[fg].map(function(_,k){return k===fo?1:0});else sel[fg][fo]=want;refresh()}
      if(b&&!fin)b.classList.add('pze1-hint')}
    S.say(t);hintLabel();return t}
  function restart(){if(fin)return false;ri=0;wrong=0;checks=0;lvl=0;blank();hintLabel();render();S.say('Back to round 1.');return true}
  if(!sp.instant){bc=pzBtn('Check',check,{class:'pri'});act.appendChild(bc)}
  if(S.showBar){bh=pzBtn('Hint',function(){hint()});br=pzBtn('Try again',restart);S.bar.appendChild(bh);S.bar.appendChild(br)}
  if(sp.key)S.key(function(e){return !fin&&sp.key(e,H,choose)});
  blank();render();S.say(sp.intro);
  return {undo:function(){return false},hint:hint,restart:restart,destroy:S.destroy,moves:function(){return checks}}}
function pzc4PlE(n,w){return pze1Pl(n,w)}

/* ================= the four specs ================= */
var PZE1_ENDLESS={cls:'pze1-rise',goal:'Does the second note sound higher or lower?',instant:true,playLabel:'Play the two notes',
  note:'Sound is optional. The puzzle works fully muted: the circle shows both notes. If you turn sound on, keep your volume low; headphones are fine but not needed.',
  intro:'Two notes sit on a circle of twelve. Clockwise means higher. Tap Rising or Falling, or press 1 or 2.',
  radio:function(){return true},
  draw:function(stage,r,H){var NN=PZE1.NOTES,svg=pze1Svg('0 0 240 250'),i,cx=120,cy=118,R0=82;
    pze1Sv(svg,'circle',{cx:cx,cy:cy,r:R0,fill:'none',stroke:'var(--edge)','stroke-width':2});
    function pt(k,rad){var a=-Math.PI/2+k*Math.PI/6;return [cx+rad*Math.cos(a),cy+rad*Math.sin(a)]}
    for(i=0;i<12;i++){var p=pt(i,R0),q=pt(i,R0+20);pze1Sv(svg,'circle',{cx:p[0].toFixed(1),cy:p[1].toFixed(1),r:3,fill:'var(--muted)'});pze1Sv(svg,'text',{x:q[0].toFixed(1),y:(q[1]+4).toFixed(1),'text-anchor':'middle'},NN[i])}
    var pa=pt(r.a,R0),pb=pt(r.b,R0);
    pze1Sv(svg,'circle',{cx:pa[0].toFixed(1),cy:pa[1].toFixed(1),r:11,fill:'var(--tint)',stroke:'var(--ink)','stroke-width':3});pze1Sv(svg,'text',{x:pa[0].toFixed(1),y:(pa[1]+4).toFixed(1),'text-anchor':'middle'},'1');
    pze1Sv(svg,'rect',{x:(pb[0]-11).toFixed(1),y:(pb[1]-11).toFixed(1),width:22,height:22,rx:5,fill:'var(--ink)'});pze1Sv(svg,'text',{x:pb[0].toFixed(1),y:(pb[1]+4).toFixed(1),'text-anchor':'middle',style:'fill:var(--bg,#fff)'},'2');
    pze1Sv(svg,'text',{x:cx,y:cy-4,'text-anchor':'middle'},'Clockwise = higher');pze1Sv(svg,'text',{x:cx,y:cy+12,'text-anchor':'middle'},'Anticlockwise = lower');
    var fig=pzEl('div',{class:'pze1-circle',role:'img','aria-label':'Pitch circle. Note 1 is '+NN[r.a]+'. Note 2 is '+NN[r.b]+'. The twelve notes in order clockwise from the top are '+NN.join(', ')+'.'});fig.appendChild(svg);
    stage.appendChild(pzEl('p',{class:'pze1-prompt',text:'Note 1 is '+NN[r.a]+', note 2 is '+NN[r.b]+'. Take the shorter way round from 1 to 2.'}));stage.appendChild(fig);
    var two=pzEl('div',{class:'pze1-two'});[['Rising','↑'],['Falling','↓']].forEach(function(x,o){var b=pzBtn(x[0],null,{text:''});b.appendChild(pzEl('span',{'aria-hidden':'true',text:x[1]}));b.appendChild(document.createTextNode(x[0]));H.reg(0,o,b);two.appendChild(b)});stage.appendChild(two)},
  play:function(S,r){var ac=PZE1.ctx(S);if(!ac)return;var t=ac.currentTime+.05;PZE1.shepard(ac,r.a,t,.8,.05);PZE1.shepard(ac,r.b,t+1,.8,.05)},
  h1:function(){return 'Picture the twelve notes on a clock face, with C at the top. Which way round is the shorter trip from note 1 to note 2?'},
  h2:function(r){var cw=((r.b-r.a)%12+12)%12;return 'Going clockwise takes '+pze1Pl(cw,'step')+'. Going anticlockwise takes '+pze1Pl(12-cw,'step')+'. Pick the shorter way.'},
  h3:function(r){return 'The marked button is right: the shorter way is '+(r.up?'clockwise, so Rising':'anticlockwise, so Falling')+'.'},
  explain:function(r){var NN=PZE1.NOTES,cw=((r.b-r.a)%12+12)%12;return 'Yes. From '+NN[r.a]+' to '+NN[r.b]+' is '+pze1Pl(cw,'step')+' clockwise and '+(12-cw)+' the other way, so the short way is '+(r.up?'rising':'falling')+'.'},
  wrong:function(r){var cw=((r.b-r.a)%12+12)%12;return 'Not that one. Count the steps round the circle both ways: '+cw+' clockwise, '+(12-cw)+' anticlockwise. The shorter way wins. Try the other button.'},
  key:function(e,H,choose){var j='12'.indexOf(e.key);if(j>=0){choose(0,j);return true}return false}};

var PZE1_CLAP={cls:'pze1-clap',goal:'Find your place in the sixteen-beat cycle.',playLabel:'Play the cycle',
  note:'Sound is optional. The puzzle works fully muted: every beat is numbered in four rows. If you turn sound on, keep your volume low.',
  intro:'The cycle has 16 beats in four sections of four. Beat 1 is the sam. Each section starts on beats 1, 5, 9 and 13.',
  radio:function(r){return r.radio},
  draw:function(stage,r,H){var s,j,txt;
    if(r.k==='marks')txt='Tap the first beat of each of the four sections, then Check.';
    else if(r.k==='next')txt='The pulse is on beat '+(r.b+1)+' (marked "now"). Tap the first beat of the next section, then Check.';
    else txt='The pulse is on beat '+(r.b+1)+' (marked "now"). Count '+r.N+' more beats, going round to 1 after 16. Tap the beat you land on, then Check.';
    stage.appendChild(pzEl('p',{class:'pze1-prompt',text:txt}));
    for(s=0;s<4;s++){stage.appendChild(pzEl('p',{class:'pze1-sec',text:'Section '+(s+1)}));var row=pzEl('div',{class:'pze1-row'});
      for(j=0;j<4;j++){var o=s*4+j,nm='Beat '+(o+1)+(o===0?', sam, the first beat of the cycle':j===0?', first beat of section '+(s+1):'')+(o===r.b?', the pulse is here':''),
        b=pzBtn(nm,null,{text:'',class:(o===r.b?'now':'')});b.appendChild(pzEl('b',{'aria-hidden':'true',text:String(o+1)}));
        var sm=o===r.b?'now':o===0?'sam':'';if(sm)b.appendChild(pzEl('small',{'aria-hidden':'true',text:sm}));H.reg(0,o,b);row.appendChild(b)}
      stage.appendChild(row)}},
  play:function(S,r,H){var ac=PZE1.ctx(S);if(!ac)return;var t=ac.currentTime+.05,i,bs=S.wrap.querySelectorAll('.pze1-row .pzb');
    for(i=0;i<16;i++){PZE1.clap(ac,t+i*.4,i%4===0);(function(k){if(!S.wrap.classList.contains('rm'))S.later(function(){bs.forEach(function(b,q){b.classList.toggle('pulse',q===k)});if(k===15)S.later(function(){bs.forEach(function(b){b.classList.remove('pulse')})},400)},k*400)})(i)}},
  h1:function(r){return r.k==='marks'?'Each section is four beats long. Which beat opens each one?':r.k==='next'?'The sections open on beats 1, 5, 9 and 13. Which of those comes next after the pulse?':'Count on from the pulse one beat at a time. After beat 16 the cycle starts again at 1.'},
  h2:function(r){return r.k==='marks'?'Sections open every four beats, starting at the sam, beat 1.':r.k==='next'?'The pulse is on beat '+(r.b+1)+'. After the last section start (13) the next one is beat 1.':'You need '+(r.N%16)+' step'+(r.N%16===1?'':'s')+' after the full laps of 16 are removed.'},
  h3:function(r,g,o){return 'The marked beat is part of the answer: beat '+(o+1)+'.'},
  explain:function(r){return r.k==='marks'?'Yes, beats 1, 5, 9 and 13 open the four sections.':r.k==='next'?'Yes, the next section opens on beat '+(r.ans[0].indexOf(1)+1)+'.':'Yes, '+r.N+' beats on from beat '+(r.b+1)+' lands on beat '+(r.ans[0].indexOf(1)+1)+'.'},
  wrong:function(r,d){return r.k==='marks'?'Not yet: '+pze1Pl(d,'beat')+' to change. Sections start every four beats from beat 1.':'Not that one. '+(r.k==='next'?'Look for the next of beats 1, 5, 9, 13 after the pulse.':'Count '+r.N+' beats on from the pulse, wrapping from 16 to 1.')+' Try again.'}};

var PZE1_SHADOW={cls:'pze1-shadow',goal:'Follow one ear. Tap each rising chime in it.',hasHide:false,playLabel:'Play both ears',
  note:'Sound is optional. The puzzle works fully muted: each chime is drawn as two dots, the first note (ring) and the second (filled). Headphones help if you play it by ear, but they are not needed.',
  intro:'Each chime is two notes. A chime rises when its second note (filled dot) sits higher than its first (ring). Tap the rising chimes in the lane you follow, then Check.',
  radio:function(){return false},
  draw:function(stage,r,H){var side=['Left ear','Right ear'];
    stage.appendChild(pzEl('p',{class:'pze1-prompt',text:'Follow the '+side[r.target].toLowerCase()+'. Tap every rising chime in it and none in the other lane.'}));
    r.lanes.forEach(function(ln,ch){var lane=pzEl('div',{class:'pze1-lane'+(ch===r.target?'':' ign')});
      lane.appendChild(pzEl('h3',{text:side[ch]+(ch===r.target?': follow this one':': ignore')}));var sl=pzEl('div',{class:'pze1-slots'});
      ln.forEach(function(c,i){var b=pzBtn(side[ch]+' chime '+(i+1)+': first note '+c.f+', second note '+c.s+' (1 lowest, 8 highest)',null,{text:''}),svg=pze1Svg('0 0 44 56');
        function y(d){return 50-(d-1)*6.5}
        pze1Sv(svg,'circle',{cx:11,cy:y(c.f),r:5,fill:'none',stroke:'var(--ink)','stroke-width':2.5});pze1Sv(svg,'circle',{cx:33,cy:y(c.s),r:5,fill:'var(--ink)'});
        b.appendChild(svg);b.appendChild(pzEl('small',{'aria-hidden':'true',text:String(i+1)}));H.reg(ch,i,b);sl.appendChild(b)});
      lane.appendChild(sl);stage.appendChild(lane)})},
  play:function(S,r){var ac=PZE1.ctx(S);if(!ac)return;var t=ac.currentTime+.05;
    r.lanes.forEach(function(ln,ch){ln.forEach(function(c,i){PZE1.tone(ac,PZE1.degHz(c.f),t+i*1,.35,.08,ch?1:-1);PZE1.tone(ac,PZE1.degHz(c.s),t+i*1+.4,.35,.08,ch?1:-1)})})},
  h1:function(r){return 'Only the lane marked "follow this one" counts. In it, look for chimes where the filled dot sits higher than the ring.'},
  h2:function(r){var k=r.ans[r.target].reduce(function(a,b){return a+b},0);return 'The '+(r.target?'right':'left')+' ear has '+pze1Pl(k,'rising chime')+' to find. The other ear needs none.'},
  h3:function(r,g,o){return 'The marked chime is one to tap: in the '+(g?'right':'left')+' ear, chime '+(o+1)+' rises.'},
  explain:function(r){var l=[];r.ans[r.target].forEach(function(v,i){if(v)l.push(i+1)});return 'Yes. The rising chimes in the '+(r.target?'right':'left')+' ear were '+l.join(', ')+'.'},
  wrong:function(r,d){return 'Not yet: '+pze1Pl(d,'chime')+' to change (a missing one or an extra one). Only rising chimes in the '+(r.target?'right':'left')+' ear count.'}};

var PZE1_UD={cls:'pze1-ud',goal:'Draw the melody’s up and down shape.',hasHide:true,playLabel:'Play the melody',
  note:'Sound is optional. The puzzle works fully muted: the notes are shown as bars and numbers (1 lowest, 8 highest). With sound on you may also hide the notes and draw the shape by ear.',
  intro:'For each step, pick whether the next note goes Up, stays the Same or goes Down. Then Check.',
  radio:function(){return true},
  draw:function(stage,r,H,S){var n=r.notes.length,wrap=pzEl('div',{class:'pze1-notes',role:'img','aria-label':H.hide?'The notes are hidden. Use Play the melody.':'Melody notes, 1 lowest to 8 highest: '+r.notes.join(', ')});
    if(!H.hide){var svg=pze1Svg('0 0 '+(n*32)+' 84'),i;for(i=0;i<n;i++){var h=r.notes[i]*7;pze1Sv(svg,'rect',{x:i*32+6,y:70-h,width:20,height:h,rx:3,fill:'var(--tint)',stroke:'var(--ink)','stroke-width':2});pze1Sv(svg,'text',{x:i*32+16,y:81,'text-anchor':'middle'},String(r.notes[i]))}wrap.appendChild(svg)}
    else wrap.appendChild(pzEl('p',{class:'pze1-note',text:'Notes hidden. Play the melody and listen.'}));
    stage.appendChild(wrap);
    var lab=['Up','Same','Down'],gl=['↑','→','↓'],i2;
    for(i2=0;i2<n-1;i2++){(function(g){var row=pzEl('div',{class:'pze1-gap',role:'group','aria-label':'Step '+(g+1)+' to '+(g+2)});row.appendChild(pzEl('span',{text:'Step '+(g+1)+' to '+(g+2)}));
      lab.forEach(function(L,o){var b=pzBtn('Step '+(g+1)+' to '+(g+2)+': '+L,null,{text:''});b.appendChild(pzEl('span',{'aria-hidden':'true',text:gl[o]+' '+L}));H.reg(g,o,b);row.appendChild(b)});stage.appendChild(row)})(i2)}},
  play:function(S,r){var ac=PZE1.ctx(S);if(!ac)return;var t=ac.currentTime+.05;r.notes.forEach(function(d,i){PZE1.tone(ac,PZE1.degHz(d),t+i*.55,.5,.09,0)})},
  h1:function(){return 'Compare each note with the one before it: is it higher, lower or the same?'},
  h2:function(r,sel){var g=0,i;for(i=0;i<sel.length;i++){if(!sel[i].some(function(v){return v})||sel[i].join()!==r.ans[i].join()){g=i;break}}
    return 'Look at step '+(g+1)+' to '+(g+2)+': the notes are '+r.notes[g]+' then '+r.notes[g+1]+'. Is the second one higher, lower or the same as the first?'},
  h3:function(r,g,o){return 'The marked button is right for step '+(g+1)+' to '+(g+2)+': '+['Up','Same','Down'][o]+'.'},
  explain:function(r){var s=r.ans.map(function(a){return ['up','same','down'][a.indexOf(1)]});return 'Yes. The shape is '+s.join(', ')+'.'},
  wrong:function(r,d){return 'Not yet: '+pze1Pl(d,'step')+' to change. Compare each pair of neighbouring notes.'}};

function pze1Line(res,inst,what){var misses=(res.extra&&res.extra.misses!=null)?res.extra.misses:Math.max(0,res.moves-inst.par);
  return 'You finished all '+inst.par+' '+what+' with '+pze1Pl(misses,'miss','misses')+'. A clean run is '+inst.par+' checks.'}
registerPuzzle({id:'endless-rise',name:'Endless Rise',family:'number',theme:'F2',areas:['attention','flex'],levels:30,secs:90,undo:false,
  blurb:'Two notes on a circle: do they rise or fall?',
  how:'Two notes sit on a circle of twelve. Going clockwise is higher. Take the shorter way round from note 1 to note 2 and tap Rising or Falling. Pairs exactly opposite each other are never used. A sound is optional: the puzzle works fully muted.',
  make:PZE1.makeEndless,mount:function(root,inst,api){return pze1Mount(root,inst,api,PZE1_ENDLESS)},
  stars:function(res,inst){return {stars:pzStarsByPar(res.moves,inst.par,res.hints),line:pze1Line(res,inst,'rounds')}}});
registerPuzzle({id:'sixteen-beat-clap',name:'Sixteen-Beat Clap',family:'number',theme:'F2',areas:['attention','control'],levels:30,secs:75,undo:false,
  blurb:'Find your place in a cycle of sixteen beats.',
  how:'The cycle has 16 beats in four sections of four, with beat 1 as the sam. Mark where sections begin, find the next one, or count on from the pulse, then Check. A clap sound is optional: the puzzle works fully muted.',
  make:PZE1.makeClap,mount:function(root,inst,api){return pze1Mount(root,inst,api,PZE1_CLAP)},
  stars:function(res,inst){return {stars:pzStarsByPar(res.moves,inst.par,res.hints),line:pze1Line(res,inst,'rounds')}}});
registerPuzzle({id:'shadow-the-voice',name:'Shadow the Voice',family:'number',theme:'F2',areas:['attention','control'],levels:30,secs:120,undo:false,
  blurb:'Follow one ear and tap its rising chimes.',
  how:'Two lanes of chimes, one for each ear. Each chime has two notes drawn as dots. Follow the lane named at the top and tap every chime whose second note is higher, then Check. Sound is optional: the puzzle works fully muted, and headphones are not needed.',
  make:PZE1.makeShadow,mount:function(root,inst,api){return pze1Mount(root,inst,api,PZE1_SHADOW)},
  stars:function(res,inst){return {stars:pzStarsByPar(res.moves,inst.par,res.hints),line:pze1Line(res,inst,'passages')}}});
registerPuzzle({id:'up-and-down',name:'Up and Down',family:'number',theme:'F2',areas:['attention','flex'],levels:30,secs:120,undo:false,
  blurb:'Draw the up and down shape of a short melody.',
  how:'A short melody is shown as bars and numbers. For each step between notes, pick Up, Same or Down, then Check. Later levels add longer melodies and repeated notes. Sound is optional: the puzzle works fully muted.',
  make:PZE1.makeContour,mount:function(root,inst,api){return pze1Mount(root,inst,api,PZE1_UD)},
  stars:function(res,inst){return {stars:pzStarsByPar(res.moves,inst.par,res.hints),line:pze1Line(res,inst,'melodies')}}});
