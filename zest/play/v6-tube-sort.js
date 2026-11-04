/* Zest v6 pilot: Tube Sort. Overrides puzzles_b.js 'tube-sort' (original kept in ZK.orig). Uses the original rules and solver (PZB.ts):
   a pour moves the whole top run of one colour onto the same colour or into an empty tube, if it all fits (4 per tube). Goal: every tube one colour.
   Levels are CURATED by tests/gen_tube.js: reverse pours from solved (always solvable), exact par by A* (admissible h, w=1), and a random-play
   solve rate R (lower = more traps). The ladder grows colours slowly, and introduces 'one spare tube' boards as a new idea with sawtooth breathers.
   make() shuffles tube order and colour assignment with the seed (same par). No letters on the liquid: each colour also has a faint shape mark,
   so colour is never the only cue. Stuck signal: no pours left, or (exact search) no way to finish from here. */
(function(){
var ID='tube-sort',CAP=4;
/* liquid colours (Okabe-Ito hues, as in v5) + a shape mark per colour */
var COL=[['Orange','#F0A01A','#B86E00'],['Sky','#56B4E9','#1F7FB8'],['Green','#16A383','#0A6B55'],['Yellow','#F2E43F','#A89A10'],['Blue','#2273C3','#123F75'],['Red','#E0561B','#8F2E06'],['Pink','#D27FB0','#8E3F6E']];
var MARK=['<circle cx="12" cy="12" r="6"/>','<path d="M12 5l7 13H5z"/>','<rect x="6" y="6" width="12" height="12" rx="1.5"/>','<path d="M12 4l8 8-8 8-8-8z"/>','<path d="M12 4.5l2.2 4.8 5.3.6-3.9 3.6 1 5.2-4.6-2.6-4.6 2.6 1-5.2-3.9-3.6 5.3-.6z"/>','<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"/>','<circle cx="12" cy="12" r="6.5" fill="none" stroke-width="3.2"/>'];
var LEVELS=[[2,1,["0111","1000",""],3,1],[3,2,["0000","","2212","","1112"],4,1],[3,2,["0002","102","","2","1112"],5,1],[4,2,["0002","1110","2","32","3331","2"],6,1],[4,2,["030","112","20","3332","0112",""],8,1],[3,1,["020","112","220","110"],6,0.167],[4,2,["002","1123","","2","0013","3321"],9,1],[5,2,["01","","2220","3331","4441","2013","04"],10,0.973],[5,2,["0","120","210","3312","4432","4431","0"],12,0.987],[4,1,["0002","1323","2323","","1110"],9,0.047],[5,2,["0031","","","3312","4442","4312","0021"],12,0.96],[6,2,["002","1104","2454","3335","","5504","1132","2"],13,0.683],[5,1,["0010","413","2203","13","4443","221"],11,0.14],[6,2,["0054","153","2234","343","","521","0052","114"],15,0.867],[6,2,["","1202","5554","","4203","5303","1140","1423"],18,0.82],[5,1,["0414","114","2023","3201","4","3320"],13,0.397],[7,2,["043","1106","2226","3114","","53","6430","520","5564"],17,0.293],[6,1,["","1112","2540","3332","4404","5350","1250"],14,0.49],[7,2,["063","","240","3561","4240","5515","664","231","2301"],20,0.653],[6,2,["0045","1113","2440","3325","","","1320","2545"],15,0.74],[6,1,["0052","143","2124","31","4243","5553","001"],15,0.39],[7,2,["5526","3316","2014","3260","","5536","4","0124","104"],19,0.917],[6,1,["","1120","2140","3314","4452","5050","3325"],15,0.007],[7,2,["","1146","2640","3156","4460","5520","","2331","3520"],19,0.837],[6,2,["023","143","153","","4452","5453","112","0002"],16,0.84],[7,1,["0514","12","2120","30","4516","5562","6440","3336"],17,0.197],[7,2,["","160","2224","56","3340","556","6340","1250","1143"],18,0.663],[7,1,["0001","1115","","3342","4462","5343","6652","0562"],15,0.55],[6,2,["0025","1254","1154","3354","","","3324","0021"],16,0.763],[7,1,["0004","1123","2265","13","441","5052","643","6653"],16,0.017]]; /*LEVELS*/
/* reverse walk from solved: k colours, E spare tubes (copied from puzzles_b.js tsWalk, with E as a parameter) */
function walk(k,E,steps,rng){var T=[],i,ref=0,TS=PZB.ts;for(i=0;i<k;i++){var s='';for(var q=0;q<CAP;q++)s+=i;T.push(s)}for(i=0;i<E;i++)T.push('');
  for(var tries=0;tries<800&&(ref<steps||T.filter(function(x){return!x}).length!==E||TS.solved(T));tries++){var cand=[];
    for(var b=0;b<T.length;b++){if(!T[b])continue;var Bt=T[b],c=Bt.charAt(Bt.length-1),rb=run(Bt);
      for(var t=1;t<=rb;t++){if(t===rb&&rb!==Bt.length)continue;
        for(var a=0;a<T.length;a++){if(a===b)continue;var A=T[a];if(A&&A.charAt(A.length-1)===c)continue;if(A.length+t>CAP)continue;if(!A&&t===Bt.length)continue;cand.push([b,a,t])}}}
    if(!cand.length)break;
    if(ref>=steps){var ne=T.filter(function(x){return!x}).length,pref=cand.filter(function(c){var e=(T[c[1]]?0:1)-(T[c[0]].length===c[2]?1:0);return ne>E?e>0:ne<E?e<0:false});if(pref.length)cand=pref}
    var m=cand[pzInt(rng,cand.length)];T=TS.apply(T,m[0],m[1],m[2]);ref++}
  return T}
function run(t){var n=0,c=t.charAt(t.length-1);while(n<t.length&&t.charAt(t.length-1-n)===c)n++;return n}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var L=LEVELS[level-1],k=L[0],perm=pzShuffle([0,1,2,3,4,5,6],rng).slice(0,k),order=pzShuffle(L[2].map(function(_,i){return i}),rng);
  var tubes=order.map(function(i){return L[2][i].split('').map(function(c){return String(perm[+c])}).join('')});
  return{level:level,title:'Level '+level,tubes:tubes,k:k,spare:L[1],par:L[3],parExact:true,rate:L[4]}}
window.V6TS={make:make,walk:walk,levels:function(){return LEVELS},COL:COL};

var CSS=''
+'.ts{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:18px;font-family:var(--font);--ts-glass:rgba(255,255,255,.55);--ts-edge:rgba(40,30,20,.28)}'
+':root[data-theme="dark"] .ts{--ts-glass:rgba(255,255,255,.07);--ts-edge:rgba(255,255,255,.28)}'
+'.ts-goal{display:flex;gap:6px;min-height:22px}.ts-goal i{width:20px;height:20px;border-radius:50%;box-shadow:inset 0 0 0 2px var(--edge);display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .2s}.ts-goal i svg{width:12px;height:12px;fill:rgba(0,0,0,.4);stroke:rgba(0,0,0,.4)}.ts-goal i.on{opacity:1;box-shadow:none}'
+'.ts-row{display:flex;flex-wrap:wrap;justify-content:center;gap:22px 12px;width:100%;padding-top:18px}'
+'.ts-t{all:unset;position:relative;width:var(--tw,54px);height:calc(var(--lh,30px)*4 + 18px);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .22s '+ZK.SPRING+';touch-action:manipulation}'
+'.ts-g{position:absolute;inset:0;border-radius:8px 8px calc(var(--tw,54px)/2) calc(var(--tw,54px)/2);background:var(--ts-glass);box-shadow:inset 0 0 0 2.5px var(--ts-edge),inset 6px 0 0 -2px rgba(255,255,255,.35);overflow:hidden}'
+'.ts-l{position:absolute;left:5px;right:5px;height:var(--lh,30px);transform-origin:50% 100%;display:flex;align-items:center;justify-content:center}'
+'.ts-l svg{width:13px;height:13px;opacity:.38}'
+'.ts-l.b0{border-radius:0 0 calc(var(--tw,54px)/2 - 5px) calc(var(--tw,54px)/2 - 5px)}'
+'.ts-l.top::after{content:"";position:absolute;left:0;right:0;top:0;height:5px;background:rgba(255,255,255,.35);border-radius:3px}'
+'.ts-t.up{transform:translateY(-16px)}.ts-t.up .ts-g{box-shadow:inset 0 0 0 2.5px var(--ink),0 10px 18px rgba(0,0,0,.18)}'
+'.ts-t:focus-visible{outline:3px solid var(--ink);outline-offset:4px;border-radius:10px}'
+'.ts-cap{position:absolute;left:-4px;right:-4px;top:-9px;height:14px;border-radius:6px;background:linear-gradient(#B98A57,#8A5E33);box-shadow:inset 0 2px 0 rgba(255,255,255,.3),0 2px 3px rgba(0,0,0,.25);display:none}'
+'.ts-t.done .ts-cap{display:block}.ts-t.done{cursor:default}'
+'.ts-stream{position:absolute;width:7px;border-radius:4px;z-index:4;pointer-events:none;transform-origin:50% 0}'
+'.ts-t.zk-mark{outline-offset:6px;border-radius:12px}'
+'.zk-rm .ts-t{transition:none}@media (prefers-reduced-motion:reduce){.ts-t{transition:none}}';
function markSvg(i){return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="#000" stroke="#000">'+MARK[i]+'</svg>'}

function mount(root,inst,api){ZK.css(CSS,'ts-css');root.textContent='';
  var TS=PZB.ts,rm=ZK.rm(api),T=inst.tubes.slice(),hist=[],hints=0,undos=0,fin=false,sel=-1,last=null,btn=[],ghost=null,idle=null,running=[],lostTm=null,offs=[];
  var cols={};inst.tubes.join('').split('').forEach(function(c){cols[c]=1});var colours=Object.keys(cols).map(Number).sort();
  var stage=document.createElement('div');stage.className='ts zk-stage zk-host'+(rm?' zk-rm':'');
  var goal=document.createElement('div');goal.className='ts-goal';goal.setAttribute('aria-hidden','true');var gdot={};
  colours.forEach(function(c){var i=document.createElement('i');i.style.background=COL[c][1];i.innerHTML=markSvg(c);gdot[c]=i;goal.appendChild(i)});
  var row=document.createElement('div');row.className='ts-row zk-board';row.setAttribute('role','group');row.setAttribute('aria-label','Tubes');
  var nT=T.length,perRow=nT<=5?nT:Math.ceil(nT/2),tw=Math.max(44,Math.min(58,Math.floor((340-(perRow-1)*12)/perRow)));
  stage.style.setProperty('--tw',tw+'px');stage.style.setProperty('--lh',(nT>5?28:32)+'px');
  for(var i=0;i<nT;i++)(function(i){var b=document.createElement('button');b.type='button';b.className='ts-t zk-p';b.setAttribute('data-zkc','');
    b.innerHTML='<span class="ts-g"></span><span class="ts-cap"></span>';b.onclick=function(){tap(i)};btn.push(b);row.appendChild(b)})(i);
  if(nT>5){row.style.maxWidth=(perRow*tw+(perRow-1)*12+2)+'px'}
  stage.appendChild(goal);stage.appendChild(row);root.appendChild(stage);
  function full(t){return t.length===CAP&&run(t)===CAP}
  function lh(){return parseFloat(getComputedStyle(stage).getPropertyValue('--lh'))||30}
  var drawn=[];
  function drawTube(i,force){var b=btn[i],g=b.firstChild,t=T[i],h=lh();if(force||drawn[i]!==t){drawn[i]=t;g.textContent='';
    for(var j=0;j<t.length;j++){var c=+t.charAt(j),l=document.createElement('span');l.className='ts-l'+(j===0?' b0':'')+(j===t.length-1?' top':'');
      l.style.bottom=(5+j*h)+'px';l.style.background='linear-gradient(90deg,'+COL[c][1]+' 0,'+COL[c][1]+' 70%,'+COL[c][2]+' 140%)';l.innerHTML=markSvg(c);g.appendChild(l)}}
    b.classList.toggle('done',full(t));b.classList.toggle('up',i===sel);
    var names=[];for(var q=0;q<t.length;q++)names.push(COL[+t.charAt(q)][0].toLowerCase());
    b.setAttribute('aria-label','Tube '+(i+1)+': '+(t?names.join(', ')+' (bottom to top)':'empty')+(full(t)?', sorted':'')+(i===sel?', lifted':''));b.setAttribute('aria-pressed',i===sel?'true':'false')}
  function draw(){for(var i=0;i<nT;i++)drawTube(i);colours.forEach(function(c){gdot[c].classList.toggle('on',T.some(function(t){return full(t)&&t.charAt(0)===String(c)}))})}
  function settle(){running.forEach(function(a){try{a.finish()}catch(e){}});running=[];[].forEach.call(stage.querySelectorAll('.ts-stream,.ts-ghostl'),function(e){e.remove()})}
  function A(el,fr,ms,ease,delay){var a=ZK.anim(el,fr,ms,ease,delay,'both');if(a)running.push(a);return a}
  function lift(i){sel=i;draw();if(i>=0){ZK.sfx('lift');ZK.buzz('tap')}}
  function tap(i){if(fin)return;settle();
    if(sel<0){if(!T[i]||full(T[i])){ZK.wrong(btn[i]);return}lift(i);return}
    if(sel===i){lift(-1);ZK.sfx('press');return}
    var m=TS.tryPour(T,sel,i);if(!m||m.err){var s=sel;lift(-1);ZK.wrong(btn[i]);return}
    pour(sel,i,m.r)}
  function pour(a,b,r){ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);ZK.stuck(stage,false);
    var colour=+T[a].charAt(T[a].length-1),fromLen=T[a].length,toLen=T[b].length,wasFull=full(T[b]);
    var ra=btn[a].getBoundingClientRect(),rb=btn[b].getBoundingClientRect(),up=btn[a].classList.contains('up')?16:0;
    hist.push(T);T=TS.apply(T,a,b,r);sel=-1;last=btn[b];drawn[a]=drawn[b]=null;draw();api.moved();
    var h=lh(),dir=rb.left>=ra.left?1:-1,dx=rb.left-ra.left-dir*tw*.32,dy=rb.top-ra.top-up-h*1.15;
    if(!rm){
      /* lift, move above the target, tilt, stream, return (about 640 ms in all) */
      var ta=A(btn[a],[{transform:'translateY(-16px)'},{transform:'translate('+dx+'px,'+dy+'px) rotate(0deg)',offset:.3},{transform:'translate('+dx+'px,'+dy+'px) rotate('+(dir*100)+'deg)',offset:.45},
        {transform:'translate('+dx+'px,'+dy+'px) rotate('+(dir*100)+'deg)',offset:.75},{transform:'none'}],640,'cubic-bezier(.4,0,.3,1)');
      btn[a].style.zIndex=5;btn[a].style.transformOrigin='50% 0';var ba=btn[a];if(ta)ta.addEventListener('finish',function(){ba.style.zIndex='';ba.style.transformOrigin=''});
      /* the departing run drains inside the travelling tube */
      var g=btn[a].firstChild;for(var j=0;j<r;j++){var l=document.createElement('span');l.className='ts-l ts-ghostl'+(fromLen-r+j===fromLen-1?' top':'');l.style.bottom=(5+(fromLen-r+j)*h)+'px';l.style.background=COL[colour][1];l.innerHTML=markSvg(colour);g.appendChild(l);
        (function(l,j){var an=A(l,[{transform:'scaleY(1)',opacity:1},{transform:'scaleY(1)',opacity:1,offset:.45},{transform:'scaleY(0)',opacity:.6,offset:.75},{transform:'scaleY(0)',opacity:0}],640,'linear');if(an)an.onfinish=function(){l.remove()}})(l,j)}
      /* the stream */
      var host=stage.getBoundingClientRect(),st=document.createElement('span');st.className='ts-stream';st.style.background=COL[colour][1];
      var sx=rb.left-host.left+rb.width/2-3.5-dir*tw*.12,sy=rb.top-host.top-h*1.05;st.style.left=sx+'px';st.style.top=sy+'px';st.style.height=(h*1.05+(CAP-toLen)*h+4)+'px';stage.appendChild(st);
      var sa=A(st,[{transform:'scaleY(0)',opacity:0},{transform:'scaleY(0)',opacity:0,offset:.42},{transform:'scaleY(1)',opacity:1,offset:.52},{transform:'scaleY(1)',opacity:1,offset:.72},{transform:'scaleY(.2) translateY('+(h*4)+'px)',opacity:0,offset:.82},{transform:'scaleY(0)',opacity:0}],640,'linear');
      if(sa)sa.onfinish=function(){st.remove()};else st.remove();
      /* the arriving layers rise */
      var ls=btn[b].firstChild.children;for(var q=toLen;q<toLen+r;q++){if(ls[q])A(ls[q],[{transform:'scaleY(0)'},{transform:'scaleY(0)',offset:.5},{transform:'scaleY(1)',offset:.5+.22*(q-toLen+1)/r},{transform:'scaleY(1)'}],640,'linear')}
    }
    setTimeout(function(){ZK.sfx('pour',{d:.24})},rm?0:300);ZK.buzz('move');
    if(full(T[b])&&!wasFull){var nCap=T.filter(full).length;setTimeout(function(){
        var cap=btn[b].querySelector('.ts-cap');ZK.anim(cap,[{transform:'translateY(-26px)',opacity:0},{transform:'translateY(2px)',opacity:1,offset:.7},{transform:'none',opacity:1}],280,ZK.SPRING);
        ZK.anim(btn[b],[{transform:'none'},{transform:'translateY(3px)'},{transform:'none'}],260,ZK.SPRING,120);
        var p=ZK.at(stage,btn[b]);ZK.burst(stage,p.x,p.y-p.h/2-6,{n:9,r:30,colors:[COL[colour][1],'#fff',COL[colour][2]]});
        ZK.anim(gdot[colour],[{transform:'scale(1)'},{transform:'scale(1.5)'},{transform:'scale(1)'}],320,ZK.SPRING);
        ZK.sfx('cap',{n:nCap});ZK.buzz('cap')},rm?0:500)}
    if(TS.solved(T)){fin=true;api.say('Every tube is one colour.');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:520);return}
    stuckCheck()}
  function stuckCheck(){clearTimeout(lostTm);ZK.stuck(stage,false);if(fin)return;
    if(!TS.moves(T).length){ZK.stuck(stage,true,{text:'No pours left',onUndo:undo});api.say('No pours left. Undo to step back.');return}
    lostTm=setTimeout(function(){if(fin)return;var r=TS.solve(T,30000,1);if(!r.path&&!r.capped){ZK.stuck(stage,true,{text:'This one can’t be finished now',onUndo:undo});api.say('From here the tubes cannot be sorted. Undo to step back.')}},700)}
  function undo(){if(fin||!hist.length)return false;settle();T=hist.pop();sel=-1;undos++;draw();ZK.unmark(stage);ZK.stuck(stage,false);ZK.sfx('undo');ZK.buzz('tap');stuckCheck();return true}
  draw();
  if(inst.level===1){var p0=TS.solve(T,5000,1).path;if(p0&&p0.length){var a0=p0[0][0],b0=p0[0][1];
    ghost=ZK.ghost(stage,[{tap:btn[a0],down:function(){lift(a0)},hold:700},{tap:btn[b0],down:function(){},up:function(){lift(-1)},cancel:function(){if(!hist.length)lift(-1)},hold:600}],{id:ID,level:1})}}
  idle=ZK.idle(stage,25000);
  function next(){var r=TS.solve(T,20000,1);if(!r.path)r=TS.solve(T,20000,2.5);return r.path&&r.path.length?r.path[0]:null}
  return{undo:undo,
    restart:function(){if(fin)return;settle();T=inst.tubes.slice();hist=[];sel=-1;draw();ZK.unmark(stage);ZK.stuck(stage,false);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;settle();var m=next();ZK.unmark(stage);
      if(!m){ZK.mark(document.querySelector('.pz5 [data-undo]'));return 'This can’t be finished from here. Undo a pour.'}
      hints++;if(lv<=1){ZK.mark(btn[m[0]]);return 'Start with this tube.'}
      if(lv===2){lift(m[0]);ZK.mark(btn[m[1]]);return 'Pour it here.'}
      pour(m[0],m[1],TS.tryPour(T,m[0],m[1]).r);return 'Poured for you.'},
    destroy:function(){clearTimeout(lostTm);settle();if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{tubes:T.slice(),moves:hist.length,fin:fin,sel:sel}}}}

ZK.override({id:ID,name:'Tube Sort',family:'memory',blurb:'Pour colours between tubes until each tube holds one colour.',
  how:'Tap a tube, then tap where to pour. Same colour on top, or an empty tube. One colour per tube.',
  areas:['memory','space'],levels:30,secs:90,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||m,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'Sorted in '+m+' pour'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
