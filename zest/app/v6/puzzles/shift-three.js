/* Zest v6: Shift Three (Caesar cipher wheel). Overrides the puzzles_d2.js entry; the original stays in ZK.orig['shift-three'].
   A short message has every letter moved along the alphabet. Turn the dial until the reading underneath shows words: it solves itself the moment it reads right
   (no 'Read it' guess button). Moves = dial turns; par = the fewest turns from the start setting to the true shift (breadth-first over the dial steps).
   v5 had one dial of +-1 and +-5 for all 30 levels and par of 1 to 4 (level 1 was trivial); the message list repeated from level 27.
   Now: a cipher WHEEL (outer ring = the coded letters, inner ring = what they read as, turning with a spring and a tick per letter), 30 different messages that
   grow from 4 to 8 words, and the dial gets finer as the levels go: steps of 1 and 5 (levels 1-8), 1 and 3 (9-18), 1 and 2 (19-30), so par climbs 1 to 7 with
   dips after each climb: 1,2,2,3,2,3,4,3 | 3,4,3,4,5,4,5,3,4,5 | 5,6,5,6,7,6,5,7,6,7,6,7. Every message holds a short common word (A, THE, AND, IS...) so there is always a clue to spot:
   the aha is working out the shift from a word's shape instead of turning blindly. The board has no text: the message words with the live reading under each letter,
   the wheel, four dial buttons and par pips. */
(function(){
var ID='shift-three';
var MSG=['CAT ON A MAT','TEA IS READY','THE BELL RANG','MEET AT THE GATE','BRING THE MAP','LET US SING AT DAWN','KEEP THE LAMP LIT','OPEN THE DOOR','BREAD AND HONEY','THE KING RODE OUT',
 'WATCH THE RIVER','SIGN THE LETTER','THE SHIP IS LATE','A GOOD DAY TO WALK','RIDE TO THE HILL','FRIENDS MEET AT DUSK','PLANT THE SEEDS','BAKE A SMALL CAKE','WRITE A LONG NOTE','HELLO FROM THE FARM',
 'LOOK BEHIND THE DOOR','SAIL AT FIRST LIGHT','FEED THE HENS AT SIX','THE FIRE IS WARM TONIGHT','BRING A LAMP AND SOME BREAD','THE RIVER IS WIDE AND DEEP','WE WALK TO THE HILL AT DAWN','A SMALL BOAT CROSSED THE LAKE','THE BAKER OPENS THE DOOR AT SIX','A QUIET WIND MOVED THE TALL GRASS'];
var PAR=[1,2,2,3,2,3,4,3, 3,4,3,4,5,4,5,3,4,5, 5,6,5,6,7,6,5,7,6,7,6,7];
function stepsOf(level){return level<=8?[1,5]:level<=18?[1,3]:[1,2]}
function enc(s,k){return s.replace(/[A-Z]/g,function(c){return String.fromCharCode((c.charCodeAt(0)-65+k)%26+65)})}
function dec(s,d){return enc(s,(26-d)%26)}
function bfs(s,k,steps){var dist={},q=[s],i=0,mv=[];dist[s]=0;steps.forEach(function(x){mv.push(x,(26-x)%26)});
  while(i<q.length){var x=q[i++];if(x===k)return dist[x];mv.forEach(function(st){var y=(x+st)%26;if(dist[y]===undefined){dist[y]=dist[x]+1;q.push(y)}})}return -1}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var plain=MSG[level-1],steps=stepsOf(level),par=PAR[level-1],c=[];
  for(var k=1;k<26;k++)for(var s=0;s<26;s++)if(s!==k&&bfs(s,k,steps)===par&&(level>3||k===3))c.push([s,k]);
  if(!c.length)for(k=1;k<26;k++)for(s=0;s<26;s++)if(s!==k&&bfs(s,k,steps)===par)c.push([s,k]);
  var pick=c[pzInt(rng,c.length)];
  return{level:level,title:'Level '+level,plain:plain,cipher:enc(plain,pick[1]),shift:pick[1],start:pick[0],par:par,parExact:true,steps:steps}}
window.V6ST={make:make,MSG:MSG,PAR:PAR,bfs:bfs,stepsOf:stepsOf,enc:enc,dec:dec};

var CSS=''
+'.st{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font)}'
+'.st-msg{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 8px;width:100%;padding:12px 8px;box-sizing:border-box;border-radius:20px;background:var(--panel,rgba(120,110,95,.14));box-shadow:inset 0 0 0 1.5px var(--line,#ddd)}'
+'.st-w{all:unset;box-sizing:border-box;display:flex;gap:3px;align-items:center;justify-content:center;min-height:48px;min-width:44px;padding:2px 4px;border-radius:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:box-shadow .18s,background .18s}.st-w:focus-visible{outline:3px solid var(--ink,#000);outline-offset:2px}.st-w.pin{background:var(--surface,#fff);box-shadow:0 0 0 3px var(--accent,#E8590C)}.st-l{display:flex;flex-direction:column;align-items:center;min-width:20px;font:800 1.125rem/1 var(--font);font-variant-numeric:tabular-nums}'
+'.st-l b{color:var(--muted,#5f5a52);font-weight:700;padding:3px 0;font-size:1rem}.st-l span{display:block;min-width:20px;text-align:center;padding:4px 1px;border-radius:7px;background:var(--surface,#fff);color:var(--ink,#111);box-shadow:inset 0 -2px 0 rgba(0,0,0,.14)}'
+'.st-msg.ok .st-l span{background:var(--ok-bg,#ddefe2);color:var(--ok-ink,#14532d)}'
+'.st-wheel{position:relative;width:min(100%,260px,max(190px,calc(100vh - 430px)));aspect-ratio:1;touch-action:manipulation}.st-wheel svg{width:100%;height:100%;display:block;overflow:visible}'
+'.st-in{transition:transform .42s cubic-bezier(.3,1.35,.55,1);transform-origin:120px 120px;transform-box:view-box}'
+'.st-wheel text{font-family:var(--font);font-weight:800;text-anchor:middle;dominant-baseline:central;fill:var(--ink,#111)}'
+'.st-wheel .po text{fill:var(--accent,#E8590C)}'
+'.st-dial{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;width:100%}'
+'.st-b{all:unset;box-sizing:border-box;min-height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;gap:4px;font:800 1.25rem/1 var(--font);background:var(--surface,#fff);color:var(--ink,#111);box-shadow:0 0 0 2px var(--edge,#cfc7b8),inset 0 -3px 0 rgba(0,0,0,.1);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:scale .18s '+ZK.SPRING+'}'
+'.st-b.big{background:var(--accent,#E8590C);color:var(--on-accent,#1B1916);box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}.st-b svg{width:20px;height:20px}'
+'.st-b:focus-visible{outline:3px solid var(--ink,#000);outline-offset:2px}.st-b.pv{scale:.93;transition:scale .06s ease-out}'
+'@media (max-width:359px){.st{width:calc(100% + 16px);max-width:none;margin:0 -8px}.st-l{min-width:17px;font-size:1rem}.st-l span{min-width:17px}}'
+'@media (prefers-reduced-motion:reduce){.st-in,.st-b{transition:none}}.st.zk-rm .st-in,.st.zk-rm .st-b{transition:none}';
var AL='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var ARW=function(left){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(left?'M15 5l-7 7 7 7':'M9 5l7 7-7 7')+'" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'};

function mount(root,inst,api){ZK.css(CSS,'sh3-css');root.textContent='';
  var rm=ZK.rm(api),d=inst.start,ang=d*360/26,hist=[],hints=0,undos=0,fin=false,last=null,ghost=null,idle=null,offs=[],tiles=[],i,steps=inst.steps;
  var stage=document.createElement('div');stage.className='st zk-stage zk-host'+(rm?' zk-rm':'');
  var pips=ZK.pips(inst.par);
  var msg=document.createElement('div');msg.className='st-msg zk-board';msg.setAttribute('role','group');msg.setAttribute('aria-label','Coded message: '+inst.cipher);
  inst.cipher.split(' ').forEach(function(w,wi){var we=document.createElement('button');we.type='button';we.className='st-w zk-p';we.setAttribute('aria-pressed','false');we.setAttribute('aria-label','Coded word '+w+'. Tap to mark it as your clue word');we.onclick=function(){var on=!we.classList.contains('pin');[].forEach.call(msg.querySelectorAll('.st-w.pin'),function(x){x.classList.remove('pin');x.setAttribute('aria-pressed','false')});if(on){we.classList.add('pin');we.setAttribute('aria-pressed','true')}ZK.sfx('press');ZK.buzz('tap')};w.split('').forEach(function(ch){var l=document.createElement('div');l.className='st-l';l.setAttribute('data-zkc','');
      l.innerHTML='<b>'+ch+'</b><span></span>';we.appendChild(l);tiles.push({el:l,ch:ch,out:l.querySelector('span')})});msg.appendChild(we)});
  var wh=document.createElement('div');wh.className='st-wheel';wh.setAttribute('aria-hidden','true');
  var svg='<svg viewBox="0 0 240 240"><circle cx="120" cy="120" r="116" fill="var(--surface,#fff)" stroke="var(--edge,#cfc7b8)" stroke-width="2"/><circle cx="120" cy="120" r="78" fill="var(--panel,rgba(120,110,95,.14))" stroke="var(--edge,#cfc7b8)" stroke-width="2"/>';
  var ob='',ib='';for(i=0;i<26;i++){var a=i*360/26,rad=(a-90)*Math.PI/180;
    ob+='<text x="'+(120+98*Math.cos(rad)).toFixed(1)+'" y="'+(120+98*Math.sin(rad)).toFixed(1)+'" font-size="15" transform="rotate('+a+' '+(120+98*Math.cos(rad)).toFixed(1)+' '+(120+98*Math.sin(rad)).toFixed(1)+')">'+AL[i]+'</text>';
    ib+='<text x="'+(120+60*Math.cos(rad)).toFixed(1)+'" y="'+(120+60*Math.sin(rad)).toFixed(1)+'" font-size="14" transform="rotate('+a+' '+(120+60*Math.cos(rad)).toFixed(1)+' '+(120+60*Math.sin(rad)).toFixed(1)+')">'+AL[i]+'</text>'}
  svg+=ob+'<g class="st-in po" id="st-in">'+ib+'</g><path d="M120 6l-7 -9h14z" fill="var(--ink,#111)"/></svg>';wh.innerHTML=svg;var inner=wh.querySelector('.st-in');inner.style.transform='rotate('+ang+'deg)';
  var dial=document.createElement('div');dial.className='st-dial';dial.setAttribute('role','group');dial.setAttribute('aria-label','Dial');
  var bs=[[-steps[1],true,true],[-steps[0],false,true],[steps[0],false,false],[steps[1],true,false]],btns=[];
  bs.forEach(function(x){var b=document.createElement('button');b.type='button';b.className='st-b'+(x[1]?' big':'');b.innerHTML=(x[2]?ARW(true):'')+'<span>'+Math.abs(x[0])+'</span>'+(x[2]?'':ARW(false));b.setAttribute('aria-label','Turn the dial '+(x[0]<0?'back':'forward')+' '+Math.abs(x[0]));b.onclick=function(){turn(x[0],b)};btns.push(b);dial.appendChild(b)});
  stage.appendChild(msg);stage.appendChild(wh);stage.appendChild(dial);stage.appendChild(pips.el);root.appendChild(stage);
  function reading(){return dec(inst.cipher,d)}
  function paint(flip){var r=reading().replace(/ /g,'');tiles.forEach(function(t,k){var c=r.charAt(k);if(t.out.textContent!==c){t.out.textContent=c;if(flip&&!rm)ZK.anim(t.out,[{transform:'translateY(-7px)',opacity:.3},{transform:'none',opacity:1}],240,ZK.EASE,k*14)}})}
  paint(false);
  function setAng(){inner.style.transform='rotate('+ang+'deg)'}
  function turn(st,btn){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);hist.push([d,ang]);d=((d+st)%26+26)%26;ang+=st*360/26;last=btn;api.moved();pips.set(hist.length);setAng();paint(true);
    ZK.sfx('click',{p:d%12});ZK.buzz('move');
    if(d===inst.shift){fin=true;msg.classList.add('ok');api.say('That reads: '+inst.plain+'.');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par,shift:inst.shift}})},rm?0:360)}}
  function undo(){if(fin||!hist.length)return false;var h=hist.pop();d=h[0];ang=h[1];undos++;pips.set(hist.length);setAng();paint(true);ZK.unmark(stage);ZK.sfx('undo');ZK.buzz('tap');return true}
  function L(t,ty,fn){t.addEventListener(ty,fn);offs.push(function(){t.removeEventListener(ty,fn)})}
  L(stage,'pointerdown',function(e){var c=e.target.closest&&e.target.closest('button.st-b');if(c&&!fin){c.classList.add('pv');ZK.sfx('press')}});
  function unpv(){btns.forEach(function(c){c.classList.remove('pv')})}L(document,'pointerup',unpv);L(document,'pointercancel',unpv);
  L(stage,'keydown',function(e){if(fin)return;if(e.key==='ArrowRight'||e.key==='ArrowUp'){e.preventDefault();turn(steps[0],btns[2])}else if(e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();turn(-steps[0],btns[1])}});
  function nextStep(){var best=null;[steps[0],steps[1],-steps[0],-steps[1]].forEach(function(st){var y=((d+st)%26+26)%26,v=bfs(y,inst.shift,steps);if(v>=0&&v===bfs(d,inst.shift,steps)-1&&!best)best=st});return best}
  if(inst.level===1){var ns=nextStep();var bi=[-steps[1],-steps[0],steps[0],steps[1]].indexOf(ns);ghost=ZK.ghost(stage,[{tap:btns[bi<0?2:bi],down:function(){btns[bi<0?2:bi].classList.add('pv')},up:function(){btns[bi<0?2:bi].classList.remove('pv')},cancel:function(){btns[bi<0?2:bi].classList.remove('pv')},hold:800}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  /* the clue word: a one-letter word, else the shortest common word */
  function clueWord(){var ws=inst.plain.split(' '),idx=-1,pos=0,best=null;ws.forEach(function(w,k){var s=pos;pos+=w.length;if(/^(A|THE|AND|IS|AT|TO|ON)$/.test(w)){var sc=w==='A'?0:w==='THE'?1:2;if(!best||sc<best.sc)best={sc:sc,s:s,w:w,k:k}}});return best}
  return{undo:undo,
    restart:function(){if(fin)return;d=inst.start;ang=d*360/26;hist=[];setAng();paint(true);pips.set(0);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;hints++;ZK.unmark(stage);var cw=clueWord();
      if(lv<=1){if(cw){ZK.mark(tiles.slice(cw.s,cw.s+cw.w.length).map(function(t){return t.el}));return cw.w.length===1?'A one-letter word is almost always A.':'A short word like this is often '+cw.w+'.'}return 'Look for a short word you know.'}
      if(lv===2){if(cw)ZK.mark(tiles.slice(cw.s,cw.s+cw.w.length).map(function(t){return t.el}));return 'Turn the dial until this reads “'+(cw?cw.w:inst.plain.split(' ')[0])+'”.'}
      hist.push([d,ang]);var st=((inst.shift-d)%26+26)%26;d=inst.shift;ang+=(st>13?st-26:st)*360/26;api.moved();pips.set(hist.length);setAng();paint(true);ZK.sfx('click',{p:7});
      fin=true;msg.classList.add('ok');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par,shift:inst.shift}})},rm?0:360);return 'Set the dial for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last||tiles[0].el},
    state:function(){return{d:d,moves:hist.length,fin:fin}}}}

ZK.override({id:ID,name:'Shift Three',family:'word',theme:'F3',
  blurb:'Every letter moved along the alphabet. Turn the dial until the message reads.',
  how:'Turn the wheel until the coded letters read as words.',
  areas:['attention','control'],levels:30,secs:60,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||m,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:m<=p?'Read in '+m+' turn'+(m===1?'':'s')+', the fewest possible.':'Read in '+m+' turns. The fewest is '+p+'.'}}});
})();
