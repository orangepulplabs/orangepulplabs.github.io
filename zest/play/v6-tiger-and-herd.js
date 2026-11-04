/* Zest v6 batch d: Tiger and Herd. Overrides the puzzles_d9.js entry through ZK.override (the original stays in ZK.orig).
   Rule: you place goats on a 15-point triangle. After each goat the tigers follow a fixed habit (jump if they can, else step). Trap all three.
   Kept from the original: the position generator idea (built backwards from a trapped position), the tiger habit (PZD9.th.tiger). Changed:
   - the solver also counts a tiger that traps ITSELF with its own reply as a win, so the win rule and the par agree (par is solver-exact);
   - a 30-level par table with breathers (1,1,2,2,3,2,...6) instead of 8 levels of par 1;
   - aha filter from level 3: at least one free point is a trap (a goat placed there is jumped), and from level 5 the winning first moves are a minority.
   Board: no text. Amber dashed arrows show where a tiger can jump (the goat in danger wears an amber ring); hollow tiger-orange dots show where a tiger can step;
   a tiger with no move falls asleep. Press-and-hold on a point previews the goat and the tiger's reply. The computer's move waits a short beat, then animates. */
(function(){
var ID='tiger-and-herd',TH=PZD9.th,N=15,TS=TH.tiger,FREE=TH.free,NB=TH.nb,JP=TH.jp;
function RC(p){var r=0;while((r+1)*(r+2)/2<=p)r++;return[r,p-r*(r+1)/2]}
function X(p){var rc=RC(p);return 150+(rc[1]-rc[0]/2)*60}
function Y(p){return 38+RC(p)[0]*64}
/* ---- solver: fewest goats to trap all three (a win also when a tiger traps itself by its own reply) ---- */
function after(s,p){var s2={t:s.t,g:s.g|1<<p},r=TS(s2);if(!r)return{win:true,s:s2};var ns={t:r.t,g:r.g};return{win:!TS(ns),s:ns,jump:r.jump!==undefined,r:r}}
function key(s){return s.t.join(',')+'|'+s.g}
function solve(s,maxD){var q=[{s:s,d:0,f:-1}],h=0,seen={};seen[key(s)]=1;
  while(h<q.length){var c=q[h++];if(c.d>=maxD)continue;var fr=FREE(c.s);
    for(var k=0;k<fr.length;k++){var p=fr[k],a=after(c.s,p),f=c.f<0?p:c.f;if(a.win)return{d:c.d+1,first:f};var kk=key(a.s);if(!seen[kk]){seen[kk]=1;q.push({s:a.s,d:c.d+1,f:f})}}}return null}
function optFirst(s,par){var fr=FREE(s),o=[],tr=0;fr.forEach(function(p){var a=after(s,p);if(a.jump)tr++;if(par===1?a.win:(!a.win&&(function(){var r=solve(a.s,par-1);return r&&r.d===par-1})()))o.push(p)});return{opt:o,traps:tr,free:fr.length}}
var PAR=[1,1,2,2,3,2,3,3,4,3,4,4,5,4,5,5,6,5,6,5,6,6,5,6,6,6,5,6,6,6];
var LEVELS=[[[6,10,11,12726],[14,9,12,10668],[8,13,14,6771],[10,6,11,12714],[5,9,14,12761],[10,7,6,6462]],[[11,13,14,5876],[10,7,11,13142],[12,6,14,12170],[3,0,1,3572],[6,3,10,22707],[9,2,1,16889]],[[4,0,2,9192],[10,1,6,22700],[8,10,6,8890],[5,14,13,2461],[12,10,11,8634],[13,14,9,4342]],[[1,2,0,21208],[12,11,6,8634],[2,4,0,10728],[11,12,13,2008],[5,0,14,9882],[2,1,9,24952]],[[9,14,5,4554],[10,11,1,12677],[14,5,13,4381],[6,0,1,1944],[2,5,9,8602],[10,6,13,922]],[[9,5,14,12691],[2,0,5,29074],[13,12,14,2008],[9,14,2,10666],[14,11,12,2024],[11,10,13,5104]],[[13,5,9,4505],[1,11,10,12613],[13,14,11,1896],[10,12,11,442],[1,5,14,12557],[14,7,0,12842]],[[4,14,10,2668],[0,8,1,4792],[14,10,11,504],[7,14,5,12617],[8,1,2,10920],[0,2,5,20824]],[[14,10,6,4634],[13,2,9,4498],[0,6,7,2826],[13,2,0,1816],[2,14,9,12568],[10,3,6,2438]],[[14,7,9,8506],[14,4,9,12390],[0,11,1,1204],[6,0,2,12842],[5,2,14,4499],[7,5,0,29000]],[[10,6,11,12338],[3,0,2,1760],[0,2,7,4464],[6,4,11,8334],[4,3,0,3266],[4,10,7,6721]],[[0,13,2,794],[0,1,3,3124],[13,11,14,1236],[13,1,0,16500],[7,0,1,2148],[9,14,5,8222]],[[1,14,2,216],[9,10,6,46],[3,0,1,292],[0,12,2,3586],[9,2,0,12322],[4,6,2,17184]],[[2,5,0,16792],[13,2,0,1712],[10,2,0,12330],[14,2,0,738],[2,4,1,2760],[6,10,7,8730]],[[0,4,1,556],[11,7,6,4618],[2,7,1,2152],[14,13,8,116],[10,1,6,4241],[14,1,2,2656]],[[8,9,0,20504],[14,8,9,6180],[0,2,7,6464],[4,9,1,11328],[1,0,2,10504],[10,14,0,12608]],[[8,0,1,10248],[11,9,14,8322],[0,14,1,2052]],[[6,14,0,4370],[7,2,0,2880],[7,5,14,585],[3,10,5,2324],[2,10,3,4193],[4,6,2,6912]],[[4,5,14,8450],[3,2,0,34],[14,13,8,52],[9,10,6,4353],[8,7,2,4168]],[[0,2,3,1376],[9,14,0,1050],[4,6,10,6658],[0,6,10,2464],[5,14,10,8776],[3,6,0,432]],[[9,1,8,12296],[14,6,10,2082],[14,1,9,4225],[4,5,9,12296],[7,2,3,2562],[2,0,14,584]],[[12,6,10,416],[0,14,1,168],[3,0,5,16644],[5,3,0,2178],[10,0,1,656]],[[10,14,11,624],[14,13,9,6156],[7,14,5,13056],[14,13,4,166],[0,4,2,2090],[10,2,1,9024]],[[10,2,7,560],[10,1,3,161],[13,2,0,2120],[14,7,13,2081],[10,0,2,42],[0,3,10,4176]],[[12,10,6,548],[7,14,0,8232],[12,2,1,608],[7,6,2,10240],[0,9,7,24584],[13,6,10,2084]],[[7,13,14,2051],[9,11,10,4108],[5,3,6,2432],[1,0,10,704],[2,13,1,2208],[11,7,13,16904]],[[0,14,2,4106],[9,1,0,2120],[8,14,0,6664],[8,7,0,2152],[1,6,3,2436],[0,8,9,10250]],[[1,0,4,704],[7,10,6,6146],[5,1,0,2116],[2,10,7,266],[14,0,2,1034],[0,3,9,2054]],[[0,4,1,9220],[0,12,2,74],[8,6,0,2592],[10,0,8,44],[1,13,14,4225]],[[1,6,10,2308],[13,0,1,1540],[5,10,6,386]]];
/* LEVELS[level-1] = candidate positions [tiger0,tiger1,tiger2,goatMask], found offline by work/th_gen.js: solver-exact par = PAR[level-1], free points = par+3 where possible,
   and from level 3 at least one trap point, from level 5 at most 2 winning first moves (never more than a third of the free points). */
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var c=LEVELS[level-1],pick=c[pzInt(rng,c.length)];
  return{level:level,title:'Level '+level,tigers:[pick[0],pick[1],pick[2]],goats:pick[3],par:PAR[level-1],parExact:true}}
window.V6TH={make:make,LEVELS:LEVELS,solve:solve,after:after,optFirst:optFirst,PAR:PAR};

var CSS=''
+'.th .th-board{position:relative;width:100%;aspect-ratio:300/330;border-radius:26px;background:var(--dk-board);box-shadow:inset 0 3px 10px rgba(0,0,0,.14),0 1px 0 rgba(255,255,255,.4);--dk-tri:rgba(255,255,255,.4)}'
+':root[data-theme="dark"] .th .th-board{--dk-tri:rgba(255,255,255,.05)}'
+'@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .th .th-board{--dk-tri:rgba(255,255,255,.05)}}'
+'.th .th-board>svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'
+'.th [data-zkc]{transform-box:fill-box;transform-origin:center}'
+'.th .th-in{transform-box:view-box;transform-origin:0 0}'
+'.th .th-pt{z-index:2}'
+'.th-lbl{font:800 .9375rem var(--font)}';
var TIGER_ICO='<svg viewBox="-24 -24 48 48" aria-hidden="true"><circle r="20" fill="#F28C28" stroke="#6B3200" stroke-width="3"/><path d="M-9 -17L-5 -9M0 -19V-10M9 -17L5 -9" stroke="#4A2200" stroke-width="3" stroke-linecap="round"/><circle cx="-7" cy="0" r="3" fill="#fff"/><circle cx="7" cy="0" r="3" fill="#fff"/></svg>';
function tigerG(asleep){var o=DK.sv('g'),g=DK.sv('g',{'class':'th-in','data-zkc':''},o);
  DK.sv('circle',{cx:-15,cy:-15,r:6,fill:'#F28C28',stroke:'#6B3200','stroke-width':2.5},g);DK.sv('circle',{cx:15,cy:-15,r:6,fill:'#F28C28',stroke:'#6B3200','stroke-width':2.5},g);
  DK.sv('circle',{r:21,fill:'#F28C28',stroke:'#6B3200','stroke-width':2.8},g);
  DK.sv('path',{d:'M-9 -18L-5 -10M0 -20V-11M9 -18L5 -10M-21 4L-14 5M21 4L14 5',stroke:'#4A2200','stroke-width':3,'stroke-linecap':'round',fill:'none'},g);
  if(asleep){DK.sv('path',{d:'M-11 -2Q-7 2 -3 -2M3 -2Q7 2 11 -2',stroke:'#4A2200','stroke-width':2.6,fill:'none','stroke-linecap':'round'},g);
    var z=DK.sv('text',{x:15,y:-17,'font-size':13,'font-weight':800,fill:'#4A2200','font-family':'sans-serif'},g);z.textContent='z'}
  else{DK.sv('circle',{cx:-7,cy:-2,r:4,fill:'#fff',stroke:'#4A2200','stroke-width':1.5},g);DK.sv('circle',{cx:7,cy:-2,r:4,fill:'#fff',stroke:'#4A2200','stroke-width':1.5},g);
    DK.sv('circle',{cx:-6,cy:-1,r:1.8,fill:'#1B1916'},g);DK.sv('circle',{cx:8,cy:-1,r:1.8,fill:'#1B1916'},g)}
  DK.sv('path',{d:'M-4 7H4L0 12Z',fill:'#7A2E1A'},g);if(asleep)g.setAttribute('opacity','.82');return o}
function goatG(){var o=DK.sv('g'),g=DK.sv('g',{'class':'th-in','data-zkc':''},o);
  DK.sv('path',{d:'M-8 -15Q-15 -27 -6 -25M8 -15Q15 -27 6 -25',stroke:'#5A4A33','stroke-width':3.2,fill:'none','stroke-linecap':'round'},g);
  DK.sv('circle',{r:18,fill:'#FFF8EA',stroke:'#5A4A33','stroke-width':2.8},g);
  DK.sv('circle',{cx:-6,cy:-3,r:2.6,fill:'#3B3226'},g);DK.sv('circle',{cx:6,cy:-3,r:2.6,fill:'#3B3226'},g);
  DK.sv('ellipse',{cy:7,rx:7.5,ry:5,fill:'#E8D5B0'},g);DK.sv('path',{d:'M-2 10Q0 15 2 10',stroke:'#5A4A33','stroke-width':2,fill:'none','stroke-linecap':'round'},g);return o}
function put(el,x,y){el.style.transform='translate('+x+'px,'+y+'px)'}

function mount(root,inst,api){ZK.css(DK.BASECSS+CSS,'th-css');root.textContent='';
  var rm=ZK.rm(api),L=DK.life(),s={t:inst.tigers.slice(),g:inst.goats},hist=[],placed=0,lost=0,fin=false,busy=false,queue=-1,hints=0,undos=0,lastPt=-1,pv=-1,ghost=null,idle=null,sol0=null;
  var stage=DK.h('div','dk th zk-stage zk-host'+(rm?' zk-rm':'')),top=DK.h('div','dk-top',null,null,stage);
  var ctr=ZK.counter({icon:TIGER_ICO,label:function(k){return k===0?'All tigers trapped':k+' tiger'+(k===1?'':'s')+' still free'}}),pips=ZK.pips(inst.par);top.appendChild(ctr.el);
  var board=DK.h('div','th-board zk-board',null,{role:'group','aria-label':'Triangle board with 15 points'},stage),svg=DK.sv('svg',{viewBox:'0 0 300 330','aria-hidden':'true'},board);
  var gTri=DK.sv('g',null,svg),gThr=DK.sv('g',null,svg),gPt=DK.sv('g',null,svg),gPc=DK.sv('g',null,svg),gPv=DK.sv('g',{'pointer-events':'none'},svg),btn=[],dots=[],p,q;
  DK.sv('path',{d:'M'+X(0)+' '+Y(0)+'L'+X(14)+' '+Y(14)+'L'+X(10)+' '+Y(10)+'Z',fill:'var(--dk-tri)',stroke:'none'},gTri);
  for(p=0;p<N;p++)NB[p].forEach(function(qq){if(qq>p)DK.sv('line',{x1:X(p),y1:Y(p),x2:X(qq),y2:Y(qq),stroke:'var(--dk-line)','stroke-width':2.2,'stroke-linecap':'round'},gTri)});
  for(p=0;p<N;p++)dots.push(DK.sv('circle',{cx:X(p),cy:Y(p),r:4.5,fill:'var(--dk-line)','data-zkc':''},gPt));
  for(p=0;p<N;p++)(function(p){var b=DK.btn('Point '+(p+1),'dk-pt th-pt');b.style.left=(X(p)/3)+'%';b.style.top=(Y(p)/3.3)+'%';b.onclick=function(){tap(p)};btn.push(b);board.appendChild(b)})(p);
  stage.appendChild(pips.el);root.appendChild(stage);
  var tg=[],gt={};   /* tiger elements by index, goat elements by point */
  function occ(p){return s.t.indexOf(p)>=0||(s.g>>p&1)}
  function tigerFree(i){var t=s.t[i],j,o;function oc(x){return s.t.indexOf(x)>=0||(s.g>>x&1)}
    for(j=0;j<JP[t].length;j++){o=JP[t][j];if((s.g>>o[0]&1)&&!oc(o[1]))return true}
    for(j=0;j<NB[t].length;j++)if(!oc(NB[t][j]))return true;return false}
  function asleepSet(){return s.t.map(function(_,i){return !tigerFree(i)})}
  function threats(){gThr.textContent='';var j,i;
    s.t.forEach(function(tp,i2){if(!tigerFree(i2))return;
      NB[tp].forEach(function(qq){if(!occ(qq))DK.sv('circle',{cx:X(qq),cy:Y(qq),r:9,fill:'none',stroke:'#F28C28','stroke-width':3},gThr)});
      JP[tp].forEach(function(o){if((s.g>>o[0]&1)&&!occ(o[1])){
        var ring=DK.sv('circle',{cx:X(o[0]),cy:Y(o[0]),r:25,fill:'none',stroke:'#E9A23B','stroke-width':3.5,'stroke-dasharray':'5 4','class':'dk-pulse'},gThr);
        DK.sv('path',{d:DK.arrow(X(tp),Y(tp),X(o[1]),Y(o[1]),-26,8),fill:'none',stroke:'#E9A23B','stroke-width':3.5,'stroke-dasharray':'6 5','stroke-linecap':'round','stroke-linejoin':'round'},gThr);
        DK.sv('circle',{cx:X(o[1]),cy:Y(o[1]),r:9,fill:'none',stroke:'#E9A23B','stroke-width':3},gThr)}})})}
  function sync(){gPc.textContent='';tg=[];gt={};var sl=asleepSet(),i;
    for(p=0;p<N;p++)if(s.g>>p&1){var g=goatG();put(g,X(p),Y(p));gPc.appendChild(g);gt[p]=g}
    s.t.forEach(function(tp,i2){var t=tigerG(sl[i2]);put(t,X(tp),Y(tp));gPc.appendChild(t);tg.push(t)});
    threats();var free=sl.filter(function(x){return !x}).length;ctr.set(free,true);labels()}
  function labels(){for(var k=0;k<N;k++){var ti=s.t.indexOf(k);btn[k].setAttribute('aria-label','Point '+(k+1)+', '+(ti>=0?'tiger':(s.g>>k&1)?'goat':'empty'))}}
  function clearPv(){gPv.textContent='';pv=-1}
  function preview(p0){clearPv();if(fin||busy||occ(p0))return;pv=p0;var a=after(s,p0),gh=goatG();put(gh,X(p0),Y(p0));gh.setAttribute('opacity','.6');gPv.appendChild(gh);
    if(a.win){s.t.forEach(function(tp){DK.sv('circle',{cx:X(tp),cy:Y(tp),r:27,fill:'none',stroke:'#2F9E5B','stroke-width':4},gPv)})}
    else{var r=a.r,from=s.t[r.tiger];DK.sv('path',{d:DK.arrow(X(from),Y(from),X(r.to),Y(r.to),r.jump!==undefined?-26:0,9),fill:'none',stroke:r.jump!==undefined?'#C2410C':'#1B1916','stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round',opacity:.85},gPv);
      if(r.jump!==undefined){var x=X(r.jump),y=Y(r.jump);DK.sv('path',{d:'M'+(x-9)+' '+(y-9)+'L'+(x+9)+' '+(y+9)+'M'+(x+9)+' '+(y-9)+'L'+(x-9)+' '+(y+9),stroke:'#C2410C','stroke-width':4,'stroke-linecap':'round'},gPv)}}}
  L.on(board,'pointerdown',function(e){var b=e.target.closest&&e.target.closest('.th-pt');if(!b||fin||busy)return;var k=btn.indexOf(b);if(k>=0&&!occ(k)){ZK.sfx('press');preview(k)}});
  L.on(document,'pointerup',clearPv);L.on(document,'pointercancel',clearPv);
  function D(ms){return rm?0:ms}
  function tap(k){if(fin)return;if(occ(k)){var ti=s.t.indexOf(k);ZK.wrong(btn[k]);return}clearPv();ZK.unmark(stage);ZK.ghostDone(ID);if(ghost)ghost.stop();
    if(busy){queue=k;return}place(k)}
  function place(k){hist.push({s:{t:s.t.slice(),g:s.g},lost:lost,placed:placed,last:lastPt});
    var s2={t:s.t,g:s.g|1<<k};placed++;lastPt=k;api.moved();pips.set(placed);
    var ge=goatG();put(ge,X(k),Y(k));gPc.appendChild(ge);gt[k]=ge;
    ZK.anim(ge.firstChild,[{transform:'translate(0,-18px) scale(.5)',opacity:0},{transform:'scale(1.14)',opacity:1,offset:.6},{transform:'scale(1)',opacity:1}],280,ZK.SPRING);
    ZK.sfx('clack');ZK.buzz('move');s=s2;threats();labels();
    var tm=TS(s2);
    if(!tm){labels();win();return}
    busy=true;var mover=tg[tm.tiger];if(mover)ZK.anim(mover.firstChild,[{transform:'scale(1)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],D(300),'ease-in-out');
    L.later(function(){move(tm)},D(340))}
  function move(tm){var i=tm.tiger,from=s.t[i],to=tm.to,el=tg[i],jump=tm.jump!==undefined;
    s={t:tm.t,g:tm.g};if(jump)lost++;
    put(el,X(to),Y(to));
    if(!rm){var a=[{transform:'translate('+X(from)+'px,'+Y(from)+'px)'}];
      if(jump){a.push({transform:'translate('+((X(from)+X(to))/2)+'px,'+((Y(from)+Y(to))/2-20)+'px)',offset:.5});}
      a.push({transform:'translate('+X(to)+'px,'+Y(to)+'px)'});ZK.anim(el,a,jump?420:300,jump?'ease-in-out':'cubic-bezier(.4,0,.2,1)');}
    gPc.appendChild(el);   /* tiger on top */
    if(jump){var ge=gt[tm.jump];L.later(function(){if(ge){ZK.anim(ge.firstChild,[{transform:'scale(1)',opacity:1},{transform:'scale(1.3)',opacity:.7,offset:.4},{transform:'scale(.1)',opacity:0}],D(260),'ease-in');ZK.burst(stage,0,0,{n:0});
        var bb=ZK.at(stage,btn[tm.jump]);ZK.burst(stage,bb.x,bb.y,{n:8,r:30,colors:['#FFF8EA','#E8D5B0','#E9A23B']});ZK.sfx('pop');ZK.buzz('pop')}},D(190));
      ZK.sfx('thud',{k:3});ZK.sfx('soft')}else ZK.sfx('slide');
    L.later(function(){busy=false;sync();labels();
      if(!TS(s)){win();return}
      if(jump){}
      if(queue>=0){var k=queue;queue=-1;if(!occ(k))place(k)}},D(jump?520:380))}
  function win(){fin=true;busy=false;queue=-1;sync();var sl=tg;sl.forEach(function(t,i){ZK.anim(t.firstChild,[{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],D(320),ZK.SPRING,i*90)});
    ZK.sfx('cap');api.say('All three tigers are trapped.');
    L.later(function(){api.done({solved:true,moves:placed,hints:hints,undos:undos,extra:{par:inst.par,lost:lost}})},D(300))}
  sync();pips.set(0);idle=ZK.idle(stage,25000);
  if(inst.level===1){sol0=solve(s,3);if(sol0){var fp=sol0.first;ghost=ZK.ghost(stage,[{tap:btn[fp],down:function(){preview(fp)},up:clearPv,cancel:clearPv,hold:1100}],{id:ID,level:1})}}
  function restore(h){L.clear();DK.stopAnims(stage);busy=false;queue=-1;clearPv();s={t:h.s.t.slice(),g:h.s.g};placed=h.placed;lost=h.lost;lastPt=h.last;pips.set(placed);sync()}
  return{
    undo:function(){if(fin||!hist.length)return false;var h=hist.pop();restore(h);undos++;ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true},
    restart:function(){if(fin)return;hist=[];restore({s:{t:inst.tigers.slice(),g:inst.goats},lost:0,placed:0,last:-1});ZK.sfx('undo');ZK.unmark(stage)},
    hint:function(lv){if(fin)return null;var r=solve(s,8);if(busy&&!r)return null;if(!r)return 'No short trap from here. Try Undo.';hints++;ZK.unmark(stage);
      if(lv<=1){return 'Watch the amber arrows. A goat with a free spot behind it gets jumped.'}
      if(lv===2){ZK.mark(btn[r.first]);return 'Try this point.'}
      tap(r.first);return 'Placed one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();L.destroy();root.textContent=''},
    lastEl:function(){return lastPt>=0?btn[lastPt]:null},
    state:function(){return{placed:placed,lost:lost,fin:fin,busy:busy,t:s.t.slice(),g:s.g}}}}

ZK.override({id:ID,name:'Tiger and Herd',family:'move',theme:'F9',calm:true,
  blurb:'Place goats to trap three tigers that follow a fixed habit.',
  how:'Tap a point to place a goat. Trap all three tigers so none can move.',
  areas:['space','flex'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'Trapped with '+m+' goat'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
