/* Zest v6 new puzzle: Lucas Tower (batch e, 7 Nov 2026; a new core for the cut disc-tower). Design note: Docs/v6/pilots/lucas-tower.md.
   Move one disc at a time, top disc only, never a bigger disc on a smaller one. Start and target are any legal positions (the target is drawn above
   the board and as outlines on the pegs). Levels 1-12 use 3 pegs, 13-22 add a fourth (an empty spare at the start and in the target).
   Levels are curated by tests/gen_lucas_tower.js: par is the exact BFS optimum, and from level 4 every shortest solution moves the biggest misplaced
   disc twice or disturbs a settled disc (the obvious plan cannot reach par). There are no dead ends (every move can be reversed), so there is no stuck chip;
   a big-on-small drop is refused at once with the kind wrong-move cue. */
(function(){
var ID='lucas-tower';
var LEVELS=[[3,2,"21","11",1],[3,3,"122","212",3],[3,3,"220","002",5],[3,4,"0011","2101",6],[3,5,"11102","00012",9],[3,4,"1202","0022",6],[3,5,"00021","22201",9],[3,5,"22200","12020",11],[3,5,"22201","00021",9],[3,5,"11201","00021",12],[3,6,"222012","012212",14],[3,6,"222202","000022",17],[4,4,"2321","1112",6],[4,5,"12221","11132",8],[4,5,"22221","01212",10],[4,5,"02211","01112",9],[4,6,"003332","020223",12],[4,6,"300111","101110",14],[4,6,"300101","313010",12],[4,7,"0100013","3030130",15],[4,7,"1322332","3223223",18],[4,7,"1111113","3213111",21]]; /*LEVELS*/
function enc(s,P){var e=0;for(var i=s.length-1;i>=0;i--)e=e*P+s[i];return e}
function dec(e,P,n){var s=[];for(var i=0;i<n;i++){s.push(e%P);e=Math.floor(e/P)}return s}
function tops(s,P){var t=[];for(var a=0;a<P;a++)t.push(99);for(var i=s.length-1;i>=0;i--)t[s[i]]=i;return t}
function moves(s,P,ban){var t=tops(s,P),o=[];for(var a=0;a<P;a++)if(t[a]<99&&a!==ban)for(var b=0;b<P;b++)if(b!==a&&b!==ban&&t[b]>t[a])o.push([t[a],a,b]);return o}
/* distances to the target from every position (ban: a peg that may not be used) */
function bfs(P,n,tg,ban){var N=Math.pow(P,n),d=new Int16Array(N);for(var i=0;i<N;i++)d[i]=-1;var q=[enc(tg,P)];d[q[0]]=0;
  for(var h=0;h<q.length;h++){var s=dec(q[h],P,n),ms=moves(s,P,ban);for(var j=0;j<ms.length;j++){var t=s.slice();t[ms[j][0]]=ms[j][2];var e=enc(t,P);if(d[e]<0){d[e]=d[q[h]]+1;q.push(e)}}}return d}
/* the textbook 3-peg plan: biggest misplaced disc straight to its target, everything above it parked on the third peg */
function toTower(st,k,p){if(k<0)return 0;if(st[k]===p)return toTower(st,k-1,p);var o=3-st[k]-p,c=toTower(st,k-1,o);st[k]=p;for(var i=0;i<k;i++)st[i]=p;return c+1+(Math.pow(2,k)-1)}
function direct(st,tg,k){if(k<0)return 0;if(st[k]===tg[k])return direct(st,tg,k-1);var o=3-st[k]-tg[k],c=toTower(st,k-1,o);st[k]=tg[k];return c+1+direct(st,tg,k-1)}
function arr(x){return typeof x==='string'?x.split('').map(Number):x.slice()}
/* trap: every shortest solution moves the biggest misplaced disc more than once, or moves a disc that is already settled (it and everything
   under it in place). The obvious plan (each misplaced disc moves once, biggest first, settled discs never) cannot reach par. */
function trapOf(P,n,s,g,dt){var par=dt[enc(s,P)],k=-1;for(var i=n-1;i>=0;i--)if(s[i]!==g[i]){k=i;break}if(k<0||par<=0)return{min:0,trap:false};
  var best={},e0=enc(s,P),dq=[[e0,0]];best[e0]=0;var minW=99;
  while(dq.length){var it=dq.shift(),e=it[0],w=it[1];if(w>best[e])continue;var st=dec(e,P,n),here=dt[e];if(here===0){minW=Math.min(minW,w);continue}
    var ms=moves(st,P,-1);for(var j=0;j<ms.length;j++){var t=st.slice();t[ms[j][0]]=ms[j][2];var f=enc(t,P);if(dt[f]!==here-1)continue;var ww=w+(ms[j][0]>=k?1:0);
      if(best[f]==null||ww<best[f]){best[f]=ww;if(ww===w)dq.unshift([f,ww]);else dq.push([f,ww])}}}
  return{min:minW,trap:minW>=2}}
function analyse(P,n,ss,gs,dt){var s=arr(ss),g=arr(gs),d=dt||bfs(P,n,g,-1),par=d[enc(s,P)],tr=trapOf(P,n,s,g,d),res={par:par,direct:-1,trap:tr.trap,bigMoves:tr.min};
  if(P===3)res.direct=direct(s.slice(),g,n-1);
  return res}
/* the next optimal move from s (or null) */
function nextMove(P,n,s,g,dist){var e=enc(s,P),here=dist[e];if(here<=0)return null;var ms=moves(s,P,-1);
  for(var j=0;j<ms.length;j++){var t=s.slice();t[ms[j][0]]=ms[j][2];if(dist[enc(t,P)]===here-1)return ms[j]}return null}
function make(level){var n0=LEVELS.length,L=Math.max(1,Math.min(n0,level|0||1)),e=LEVELS[L-1];
  return{level:L,title:'Level '+L,P:e[0],n:e[1],s:e[2],g:e[3],par:e[4],parExact:true}}
window.V6LT={LEVELS:LEVELS,analyse:analyse,trapOf:trapOf,bfs:bfs,enc:enc,moves:moves,nextMove:nextMove,direct:direct,make:make};

var COL=['#F6C445','#F29E4C','#EE6E5B','#D9548A','#9B5BC4','#4F7FD9','#2E9E95'];
var CSS=''
+'.zlt>.zk-pips{align-self:stretch}'
+'.zlt{position:relative;width:100%;max-width:380px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:var(--font);--lt-wood:#B98552;--lt-wood2:#8A5A2E;--lt-bg1:#F4EEE2;--lt-bg2:#EAE0CD;--lt-ghost:rgba(70,50,30,.32);--lt-goalbg:rgba(0,0,0,.04)}'
+':root[data-theme="dark"] .zlt{--lt-wood:#9A6E44;--lt-wood2:#6A4624;--lt-bg1:#29251F;--lt-bg2:#201C17;--lt-ghost:rgba(255,235,200,.3);--lt-goalbg:rgba(255,255,255,.05)}'
+'.zlt-goal{display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:14px;background:var(--lt-goalbg);box-shadow:inset 0 0 0 1.5px var(--line)}'
+'.zlt-goal svg{display:block;height:46px;width:auto}.zlt-goal .flag{width:20px;height:20px;flex:none;color:var(--ink)}'
+'.zlt-b{position:relative;width:100%;border-radius:20px;background:linear-gradient(180deg,var(--lt-bg1),var(--lt-bg2));box-shadow:inset 0 0 0 2px var(--line),0 6px 18px rgba(0,0,0,.08);touch-action:none;user-select:none;-webkit-user-select:none;overflow:visible}'
+'.zlt-peg{all:unset;position:absolute;top:0;bottom:0;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent;z-index:1}'
+'.zlt-peg:focus-visible{outline:3px solid var(--ink);outline-offset:-4px;border-radius:16px}'
+'.zlt-peg .pole{position:absolute;left:50%;width:10px;margin-left:-5px;border-radius:5px 5px 0 0;background:linear-gradient(90deg,var(--lt-wood),var(--lt-wood2));bottom:18px}'
+'.zlt-peg.sel .pole{box-shadow:0 0 0 3px rgba(232,89,12,.35)}'
+'.zlt-peg.drop .pole{box-shadow:0 0 0 4px rgba(246,183,60,.7)}'
+'.zlt-base{position:absolute;left:10px;right:10px;bottom:6px;height:14px;border-radius:7px;background:linear-gradient(180deg,var(--lt-wood),var(--lt-wood2));box-shadow:0 2px 0 rgba(0,0,0,.18);pointer-events:none}'
+'.zlt-gh{position:absolute;box-sizing:border-box;border-radius:10px;border:2px dashed var(--lt-ghost);pointer-events:none;z-index:1}'
+'.zlt-d{position:absolute;box-sizing:border-box;border-radius:10px;pointer-events:none;z-index:2;will-change:transform;box-shadow:inset 0 3px 0 rgba(255,255,255,.35),inset 0 -4px 0 rgba(0,0,0,.18),0 2px 3px rgba(0,0,0,.25);border:2px solid rgba(40,25,10,.55)}'
+'.zlt-d.up{z-index:5;box-shadow:inset 0 3px 0 rgba(255,255,255,.35),inset 0 -4px 0 rgba(0,0,0,.18),0 10px 16px rgba(0,0,0,.28)}'
+'.zlt-d i{position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px rgba(40,25,10,.45);opacity:0;transform:scale(.3);transition:opacity .2s,transform .3s cubic-bezier(.34,1.56,.64,1)}'
+'.zlt-d.home i{opacity:1;transform:scale(1)}'
+'.zk-rm .zlt-d i{transition:none}@media (prefers-reduced-motion:reduce){.zlt-d i{transition:none}}';

function mount(root,inst,api){ZK.css(CSS,'zlt-css');root.textContent='';
  var P=inst.P,n=inst.n,pos=arr(inst.s),tg=arr(inst.g),rm=ZK.rm(api),hist=[],hints=0,undos=0,fin=false,ghost=null,idle=null,offs=[],sel=-1,timers=[],dist=bfs(P,n,tg,-1);
  var DH=n<=4?30:n===5?27:n===6?24:22,BASE=20,TOPPAD=DH*1.6,BH=BASE+n*DH+TOPPAD+8;
  var stage=document.createElement('div');stage.className='zlt zk-stage zk-host'+(rm?' zk-rm':'');
  /* the target, drawn small above the board */
  var goal=document.createElement('div');goal.className='zlt-goal';goal.setAttribute('role','img');
  goal.innerHTML='<svg class="flag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>'+goalSvg();
  goal.setAttribute('aria-label','Target: '+describe(tg));
  var pips=ZK.pips(inst.par);
  var board=document.createElement('div');board.className='zlt-b zk-board';board.style.height=BH+'px';board.setAttribute('role','group');
  var base=document.createElement('div');base.className='zlt-base';board.appendChild(base);
  var pegs=[],discs=[],ghosts=[];
  for(var p=0;p<P;p++){var b=document.createElement('button');b.type='button';b.className='zlt-peg';b.style.left=(p*100/P)+'%';b.style.width=(100/P)+'%';
    b.innerHTML='<span class="pole" style="height:'+(n*DH+DH*.9)+'px"></span>';b.setAttribute('data-peg',p);(function(p){b.addEventListener('click',function(e){if(e.detail===0)pick(p)})})(p);
    board.appendChild(b);pegs.push(b)}
  function wPct(k){var f=n===1?.6:.36+.58*k/(n-1);return f*100/P}
  for(var k=0;k<n;k++){var gh=document.createElement('div');gh.className='zlt-gh';board.appendChild(gh);ghosts.push(gh);
    var d=document.createElement('div');d.className='zlt-d';d.setAttribute('data-zkc','');d.style.background='linear-gradient(180deg,'+COL[k+(7-n>0?Math.floor((7-n)/2):0)]+','+COL[k+(7-n>0?Math.floor((7-n)/2):0)]+')';d.innerHTML='<i></i>';board.appendChild(d);discs.push(d)}
  stage.appendChild(goal);stage.appendChild(pips.el);stage.appendChild(board);root.appendChild(stage);
  function height(state,k){var h=0;for(var j=k+1;j<n;j++)if(state[j]===state[k])h++;return h}
  function placeEl(el,peg,h,k){var w=wPct(k);el.style.width=w+'%';el.style.left=((peg+.5)*100/P-w/2)+'%';el.style.height=(DH-3)+'px';el.style.bottom=(BASE+h*DH)+'px'}
  for(k=0;k<n;k++)placeEl(ghosts[k],tg[k],height(tg,k),k);
  function homeOf(k){for(var j=k;j<n;j++)if(pos[j]!==tg[j])return false;return true}
  function layout(){for(var k=0;k<n;k++){placeEl(discs[k],pos[k],height(pos,k),k);discs[k].classList.toggle('home',homeOf(k))}label()}
  function describe(st){var out=[];for(var p=0;p<P;p++){var on=[];for(var k=n-1;k>=0;k--)if(st[k]===p)on.push(k+1);out.push('peg '+(p+1)+(on.length?': discs '+on.join(', '):': empty'))}return out.join('; ')}
  function label(){board.setAttribute('aria-label','Lucas Tower, '+P+' pegs. Now '+describe(pos)+'. Disc 1 is the smallest.')}
  function goalSvg(){var w=P*40,h=12+n*6,s='<svg viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><rect x="2" y="'+(h-4)+'" width="'+(w-4)+'" height="4" rx="2" fill="var(--lt-wood2)"/>';
    for(var p=0;p<P;p++)s+='<rect x="'+(p*40+19)+'" y="3" width="2" height="'+(h-6)+'" fill="var(--lt-wood)"/>';
    for(var k=0;k<n;k++){var hh=height(tg,k),ww=(n===1?.6:.36+.58*k/(n-1))*36;s+='<rect x="'+(tg[k]*40+20-ww/2).toFixed(1)+'" y="'+(h-4-(hh+1)*6+.5).toFixed(1)+'" width="'+ww.toFixed(1)+'" height="5" rx="2" fill="'+COL[k+(7-n>0?Math.floor((7-n)/2):0)]+'" stroke="rgba(40,25,10,.5)" stroke-width=".8"/>'}
    return s+'</svg>'}
  function topOf(p){for(var k=0;k<n;k++)if(pos[k]===p)return k;return -1}
  function T(fn,ms){timers.push(setTimeout(fn,ms))}
  /* lift: the top disc rises above its peg */
  function liftY(k){return -((18+(n+.9)*DH+6)-(BASE+height(pos,k)*DH))}   /* just above the pole tops */
  function lift(p){var k=topOf(p);if(k<0)return false;sel=p;pegs[p].classList.add('sel');discs[k].classList.add('up');
    var y=liftY(k);discs[k].style.transform='translateY('+y+'px)';ZK.anim(discs[k],[{transform:'translateY(0)'},{transform:'translateY('+y+'px)'}],160,ZK.SPRING);ZK.sfx('lift');ZK.buzz('tap');return true}
  function unlift(quiet){if(sel<0)return;var k=topOf(sel);pegs[sel].classList.remove('sel');if(k>=0){var d=discs[k],y=liftY(k);d.style.transform='';d.classList.remove('up');if(!quiet)ZK.anim(d,[{transform:'translateY('+y+'px)'},{transform:'translateY(0)'}],170,ZK.EASE)}sel=-1}
  /* move disc from peg a to peg b (legal check first). from: current visual offset of the disc (px), for a drag */
  function move(a,b,fromXY){var k=topOf(a);if(k<0)return false;var tb=topOf(b);
    if(a===b){unlift();return false}
    if(tb>=0&&tb<k){var d0=discs[k];ZK.wrong(d0);pegs[b].classList.remove('drop');back(k,a,fromXY);return false}
    ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    var d=discs[k],r0=d.getBoundingClientRect();   /* r0 includes the lift or drag offset */
    pegs[a].classList.remove('sel');sel=-1;d.style.transform='';
    pos[k]=b;hist.push([k,a,b]);api.moved();pips.set(hist.length);layout();
    var r1=d.getBoundingClientRect(),dx=r0.left-r1.left,dy=r0.top-r1.top,ly=liftY(k)-0;
    d.classList.add('up');
    if(!rm){var hop=Math.min(dy,ly);ZK.anim(d,[{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'translate('+dx*0.15+'px,'+hop+'px)',offset:.3},{transform:'translate(0,'+hop*0.6+'px)',offset:.62},{transform:'translate(0,0) scale(1.06,.9)',offset:.88},{transform:'translate(0,0)'}],300,'ease-in-out')}
    ZK.sfx('slide');ZK.buzz('move');
    T(function(){d.classList.remove('up');ZK.sfx('clack');if(homeOf(k)&&!fin)ZK.anim(d,[{filter:'brightness(1)'},{filter:'brightness(1.35)'},{filter:'brightness(1)'}],260,'ease-out')},rm?0:250);
    if(pos.join('')===tg.join('')){fin=true;T(function(){ZK.sfx('cap',{n:5});ZK.buzz('pop');var q=ZK.at(board,d);ZK.burst(board,q.x,q.y,{n:12,r:46});api.say('The tower matches the target.');
      T(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:30)},rm?0:240)}
    return true}
  function back(k,a,fromXY){var d=discs[k];pegs[a].classList.remove('sel');sel=-1;var x0=fromXY?fromXY[0]:0,y0=fromXY?fromXY[1]:liftY(k);d.style.transform='';
    ZK.anim(d,[{transform:'translate('+x0+'px,'+y0+'px)'},{transform:'translate(0,0)'}],220,ZK.SPRING);T(function(){d.classList.remove('up')},220)}
  function pick(p){if(fin)return;if(sel<0){if(!lift(p))ZK.wrong(pegs[p],{silent:false});return}move(sel,p)}
  /* pointer: tap a peg to lift its top disc, tap another to drop it; or drag the top disc to a peg */
  var dr=null,ignoreClick=0;function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  function pegAt(x){var r=board.getBoundingClientRect();return Math.max(0,Math.min(P-1,Math.floor((x-r.left)/r.width*P)))}
  L(board,'pointerdown',function(e){if(fin)return;var p=pegAt(e.clientX);dr={p:p,x:e.clientX,y:e.clientY,id:e.pointerId,drag:false,k:-1};try{board.setPointerCapture(e.pointerId)}catch(_){}
    if(sel<0&&topOf(p)>=0){var k=topOf(p);discs[k].classList.add('up');ZK.anim(discs[k],[{scale:'1'},{scale:'1.05'}],80,'ease-out',0,'forwards')}});
  L(board,'pointermove',function(e){if(!dr||e.pointerId!==dr.id||fin)return;var dx=e.clientX-dr.x,dy=e.clientY-dr.y;
    if(!dr.drag){if(Math.hypot(dx,dy)<10)return;var src=sel>=0?sel:dr.p,k=topOf(src);if(k<0)return;dr.drag=true;dr.src=src;dr.k=k;dr.oy=sel>=0?liftY(k):0;
      if(sel>=0){pegs[sel].classList.remove('sel')}ZK.sfx('lift')}
    var d=discs[dr.k],yy=dr.oy+dy-(dr.oy?0:44),q=pegAt(e.clientX);d.style.transform='translate('+dx+'px,'+yy+'px)';dr.cur=[dx,yy];
    pegs.forEach(function(pe,i){pe.classList.toggle('drop',i===q&&i!==dr.src)})});
  function endDrag(e,cancel){if(!dr||e.pointerId!==dr.id)return;var w=dr;dr=null;ignoreClick=Date.now();pegs.forEach(function(pe){pe.classList.remove('drop')});
    discs.forEach(function(d){d.getAnimations&&d.getAnimations().forEach(function(a){if(a.effect&&a.effect.getKeyframes&&a.effect.getKeyframes().some(function(f){return f.scale}))a.cancel()})});
    if(sel<0&&!w.drag){var k0=topOf(w.p);if(k0>=0)discs[k0].classList.remove('up')}
    if(fin)return;
    if(w.drag){var q=pegAt(e.clientX);if(cancel||q===w.src){back(w.k,w.src,w.cur);return}sel=w.src;move(w.src,q,w.cur);return}
    if(cancel)return;pick(w.p)}
  L(board,'pointerup',function(e){endDrag(e,false)});L(board,'pointercancel',function(e){endDrag(e,true)});
  L(board,'click',function(e){if(Date.now()-ignoreClick<500){e.preventDefault();e.stopPropagation()}},true);
  layout();
  if(inst.level===1){var m0=nextMove(P,n,pos,tg,dist);if(m0)ghost=ZK.ghost(stage,[{drag:[pegs[m0[1]],pegs[m0[2]]]}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin||!hist.length)return false;unlift(true);var h=hist.pop(),d=discs[h[0]],r0=d.getBoundingClientRect();pos[h[0]]=h[1];layout();var r1=d.getBoundingClientRect();
    ZK.anim(d,[{transform:'translate('+(r0.left-r1.left)+'px,'+(r0.top-r1.top)+'px)'},{transform:'none'}],200,ZK.EASE);undos++;pips.set(hist.length);ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true}
  return{undo:undo,
    restart:function(){if(fin)return;unlift(true);pos=arr(inst.s);hist=[];layout();pips.set(0);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;ZK.unmark(stage);var m=nextMove(P,n,pos,tg,dist);if(!m)return null;hints++;
      if(lv<=1){var big=-1;for(var k=n-1;k>=0;k--)if(pos[k]!==tg[k]){big=k;break}ZK.mark(discs[big]);
        return big===m[0]?'Move this disc next.':'This is the biggest disc out of place. Clear the way for it, and think about where the smaller ones should wait.'}
      if(lv===2){ZK.mark([discs[m[0]],pegs[m[2]]]);return 'Move the marked disc to the marked peg.'}
      unlift(true);move(m[1],m[2]);return 'Moved it for you.'},
    destroy:function(){timers.forEach(clearTimeout);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){var h=hist[hist.length-1];return h?discs[h[0]]:board},
    state:function(){return{pos:pos.join(''),moves:hist.length,fin:fin,sel:sel}}}}

ZK.override({id:ID,name:'Lucas Tower',family:'move',blurb:'Restack the discs to match the target.',
  how:'Drag the top disc to another peg. Never put a bigger disc on a smaller one. Match the target.',
  areas:['logic','holdback'],levels:LEVELS.length||22,secs:70,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'Matched in '+m+' move'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
