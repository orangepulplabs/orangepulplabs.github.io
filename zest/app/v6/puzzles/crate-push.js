/* Zest v6 new puzzle: Crate Push (batch e, 7 Nov 2026; the push-crates genre, our own rooms and art). Design note: Docs/v6/pilots/crate-push.md.
   Walk the keeper (swipe, the pad, the arrow keys, or tap a floor cell to walk there); walking into a crate pushes it one cell. Crates can never be
   pulled. Get every crate onto a glowing spot. Par counts pushes (walking is free), so stars measure the plan, not the footwork.
   Levels are curated by tests/gen_crate_push.js (rooms made for Zest, solved by a backward 'pull' search from the spots): par is the exact fewest
   pushes; from level 3 at least one first push already loses the level; from level 4 the greedy pusher (always the push that brings the crates
   closest to the spots) fails.
   Stuck policy (1.2.4): the same backward search, run when the level loads, tells after every push whether the room can still be solved. A push into a
   lost room is legal, so it is deferred (ZK.stuck kind 'dead': on Hint, after 3 more pushes, or 10 s idle) with Undo back to the last good position.
   Walking into a wall or pushing a crate into a wall or another crate does nothing: the keeper bumps and springs back (kind, no move counted). */
(function(){
var ID='crate-push',DX=[0,1,0,-1],DY=[-1,0,1,0],NAME=['up','right','down','left'];
var LEVELS=[[5,3,"-------.$@-----",1],[5,4,"-#-#----#.-@$-------",3],[5,5,"-.--#--#$-----@---#---#--",5],[5,5,"------$-.@---$-##-----.#-",5],[6,5,"---#-#-##--.-$-$----.-----@-#-",7],[6,6,"-#-$.----.----###-----#----$----@---",8],[5,6,"------.-----##-@$-$----.-----#",7],[6,6,"---------#$---#----$.#---@----##.-#-",9],[6,6,"-@#----#---#---###.$-..#-$$--#-#----",9],[6,7,"@--###-$--##.-####$$###--.-#---.-#-#------",12],[6,6,"@--.---#-#----#-.--$----#-#-$#------",9],[6,7,"--#----#------..-#--##$--#@-$-#-$.-------#",13],[6,7,"--------@-#--#-$#--#.$-#-#$#---..----###--",15],[6,7,"-.------##----$--##.-$#--$--@--.##--#---#-",12],[6,7,"-.--.--.--#--$#-###--##-#-$-@--$-#--------",16],[6,8,"--####-+-###..$-###--###--$###-----#-$-------#--",18],[6,7,"---###@$------.-#-#-$####.-###.-$###---###",14],[6,8,"--####-$-$--.-$#-##----###---#----##-#---.-+---#",19],[6,8,"##---##-##---$------#.$-#-.$-###--$###@#.-##.#--",17],[6,8,"-##-##---.##--#-##-----.#$$$$-@--#-.--###.#####-",21],[6,8,"-.#---.-#-#--$--$---$#@----##--####-.-##-----##-",18],[6,8,"#-$.#-----@-##.$-----$###.$-##-.-####--###---###",23],[6,8,"###-.-##--.-#@------$$###-$.##.--###-$-###--####",25],[6,8,"#--#####--####-$##-@-$---#-$-#$-##-#.-##--.-..--",27]]; /*LEVELS*/
/* level: [W, H, rows] with '#' wall, '-' floor, '.' spot, '$' crate, '*' crate on spot, '@' keeper, '+' keeper on spot */
function parse(e){var W=e[0],H=e[1],s=e[2],wall=[],goal=[],crates=[],player=-1;
  for(var i=0;i<W*H;i++){var c=s[i];wall.push(c==='#');goal.push(c==='.'||c==='*'||c==='+');if(c==='$'||c==='*')crates.push(i);if(c==='@'||c==='+')player=i}
  return{W:W,H:H,wall:wall,goal:goal,crates:crates,player:player}}
function reach(R,occ,p){var W=R.W,H=R.H,seen=new Uint8Array(W*H),st=[p],mn=p;seen[p]=1;
  while(st.length){var c=st.pop();if(c<mn)mn=c;var x=c%W,y=(c/W)|0;
    for(var d=0;d<4;d++){var nx=x+DX[d],ny=y+DY[d];if(nx<0||ny<0||nx>=W||ny>=H)continue;var n=ny*W+nx;if(seen[n]||R.wall[n]||occ[n])continue;seen[n]=1;st.push(n)}}
  return{seen:seen,min:mn}}
function occOf(R,cr){var o=new Uint8Array(R.W*R.H);for(var i=0;i<cr.length;i++)o[cr[i]]=1;return o}
function key(cr,m){return cr.slice().sort(function(a,b){return a-b}).join(',')+'|'+m}
function step(R,c,d){var x=c%R.W+DX[d],y=((c/R.W)|0)+DY[d];if(x<0||y<0||x>=R.W||y>=R.H)return -1;return y*R.W+x}
/* backward search from every finished position: dist[key] = fewest pushes to finish from there. Covers every position that can still be solved. */
function pullAll(R,limit){var W=R.W,H=R.H,goals=[];for(var i=0;i<W*H;i++)if(R.goal[i])goals.push(i);
  var dist={},q=[],occ=occOf(R,goals),done=new Uint8Array(W*H);
  for(i=0;i<W*H;i++){if(R.wall[i]||occ[i]||done[i])continue;var r=reach(R,occ,i);for(var j=0;j<W*H;j++)if(r.seen[j])done[j]=1;var k=key(goals,r.min);if(dist[k]==null){dist[k]=0;q.push([goals,r.min])}}
  for(var h=0;h<q.length;h++){if(limit&&q.length>limit)break;var cr=q[h][0],p=q[h][1],kk=key(cr,p),dd=dist[kk],o=occOf(R,cr),rr=reach(R,o,p);
    for(var a=0;a<cr.length;a++){var c=cr[a];for(var d=0;d<4;d++){var q1=step(R,c,d);if(q1<0||!rr.seen[q1])continue;var q2=step(R,q1,d);if(q2<0||R.wall[q2]||o[q2])continue;
      /* pull: keeper at q1 steps to q2, crate moves c -> q1 */
      var nc=cr.slice();nc[a]=q1;o[c]=0;o[q1]=1;var r2=reach(R,o,q2);o[q1]=0;o[c]=1;var nk=key(nc,r2.min);if(dist[nk]==null){dist[nk]=dd+1;q.push([nc,r2.min])}}}}
  return dist}
/* every push from (crates, keeper): [crateIndex, dir, newCrates, keeperAfter] */
function pushes(R,cr,p){var o=occOf(R,cr),r=reach(R,o,p),out=[];
  for(var a=0;a<cr.length;a++){var c=cr[a];for(var d=0;d<4;d++){var from=step(R,c,(d+2)%4),to=step(R,c,d);if(from<0||to<0||!r.seen[from]||R.wall[to]||o[to])continue;var nc=cr.slice();nc[a]=to;out.push([a,d,nc,c,from])}}
  return out}
function stateKey(R,cr,p){var r=reach(R,occOf(R,cr),p);return key(cr,r.min)}
function solved(R,cr){for(var i=0;i<cr.length;i++)if(!R.goal[cr[i]])return false;return true}
/* level analysis (for the generator and the logic checks) */
function analyse(e,dist){var R=parse(e);dist=dist||pullAll(R);var k0=stateKey(R,R.crates,R.player),par=dist[k0],dead=0,ps=pushes(R,R.crates,R.player);
  ps.forEach(function(m){if(dist[stateKey(R,m[2],m[3])]==null)dead++});
  return{par:par==null?-1:par,deadFirst:dead,firstPushes:ps.length,greedy:greedy(R,dist,par==null?0:par*3+4),states:Object.keys(dist).length}}
function hd(R,cr){var gs=[];for(var i=0;i<R.W*R.H;i++)if(R.goal[i])gs.push(i);var s=0;cr.forEach(function(c){var b=99;gs.forEach(function(g){b=Math.min(b,Math.abs(g%R.W-c%R.W)+Math.abs(((g/R.W)|0)-((c/R.W)|0)))});s+=b});return s}
/* the greedy pusher: always the push that lowers the crates' total distance to the nearest spots the most (ties: first found); it may not see deadlocks */
function greedy(R,dist,lim){var cr=R.crates.slice(),p=R.player,seen={};for(var i=0;i<lim;i++){if(solved(R,cr))return true;seen[stateKey(R,cr,p)]=1;var best=null,bs=1e9;
    pushes(R,cr,p).forEach(function(m){var k=stateKey(R,m[2],m[3]);if(seen[k])return;var s=hd(R,m[2]);if(s<bs){bs=s;best=m}});if(!best)return false;cr=best[2];p=best[3]}return solved(R,cr)}
function path(R,occ,a,b){if(a===b)return[];var W=R.W,prev=new Int32Array(R.W*R.H).fill(-1),q=[a];prev[a]=a;
  for(var h=0;h<q.length;h++){var c=q[h];if(c===b)break;for(var d=0;d<4;d++){var n=step(R,c,d);if(n<0||R.wall[n]||occ[n]||prev[n]>=0)continue;prev[n]=c;q.push(n)}}
  if(prev[b]<0)return null;var out=[],c2=b;while(c2!==a){var pc=prev[c2];for(var d2=0;d2<4;d2++)if(step(R,pc,d2)===c2)out.unshift(d2);c2=pc}return out}
function make(level){var n=LEVELS.length,L=Math.max(1,Math.min(n,level|0||1)),e=LEVELS[L-1];return{level:L,title:'Level '+L,lv:e,par:e[3],parExact:true}}
window.V6CP={LEVELS:LEVELS,parse:parse,pullAll:pullAll,pushes:pushes,stateKey:stateKey,solved:solved,analyse:analyse,greedy:greedy,path:path,step:step,make:make};

var CSS=''
+'.zcp>.zk-pips{align-self:stretch}'
+'.zcp{position:relative;width:100%;max-width:340px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);'
+'--cp-fl1:#EDE6D8;--cp-fl2:#E3DAC8;--cp-wall1:#7D6E60;--cp-wall2:#5B4E43;--cp-spot:#E9A23B;--cp-box1:#D9A35E;--cp-box2:#B07A3A;--cp-boxln:#6E4419;--cp-ok:#3E9C6A}'
+':root[data-theme="dark"] .zcp{--cp-fl1:#2A2722;--cp-fl2:#23201C;--cp-wall1:#5C5248;--cp-wall2:#3E3731;--cp-spot:#F0B04E;--cp-box1:#C08A48;--cp-box2:#946231;--cp-boxln:#4A2C0C;--cp-ok:#4FB57F}'
+'.zcp-b{position:relative;width:100%;border-radius:18px;overflow:hidden;background:var(--cp-fl1);box-shadow:inset 0 0 0 3px var(--cp-wall2),0 6px 18px rgba(0,0,0,.12);touch-action:none;user-select:none;-webkit-user-select:none}'
+'.zcp-b:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'.zcp-t{position:absolute;box-sizing:border-box}'
+'.zcp-t.f{background:var(--cp-fl1)}.zcp-t.f.k2{background:var(--cp-fl2)}'
+'.zcp-t.w{background:linear-gradient(160deg,var(--cp-wall1),var(--cp-wall2));box-shadow:inset 0 3px 0 rgba(255,255,255,.12),inset 0 -3px 0 rgba(0,0,0,.25)}'
+'.zcp-t.s::after{content:"";position:absolute;left:24%;top:24%;width:52%;height:52%;border-radius:50%;box-sizing:border-box;border:3px dashed var(--cp-spot);box-shadow:0 0 10px rgba(233,162,59,.55);animation:cpspot 2.4s ease-in-out infinite}'
+'@keyframes cpspot{50%{box-shadow:0 0 16px rgba(233,162,59,.85)}}'
+'.zcp-o{position:absolute;left:0;top:0;display:flex;align-items:center;justify-content:center;pointer-events:none;will-change:transform}'
+'.zcp-x{z-index:3}.zcp-x svg{width:84%;height:84%;overflow:visible;transition:filter .2s}'
+'.zcp-x.on svg{filter:drop-shadow(0 0 5px rgba(246,183,60,.9))}.zcp-x .chk{opacity:0;transition:opacity .2s}.zcp-x.on .chk{opacity:1}'
+'.zcp-k{z-index:4}.zcp-k svg{width:78%;height:78%;overflow:visible}.zcp-k .eyes{transition:transform .12s}'
+'.zcp-pad{display:flex;gap:10px;align-items:center;justify-content:center}'
+'.zcp-pad button{all:unset;box-sizing:border-box;width:52px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:var(--surface);box-shadow:0 0 0 1.5px var(--line),0 2px 0 var(--line);cursor:pointer;color:var(--ink)}'
+'.zcp-pad button:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.zcp-pad svg{width:22px;height:22px}'
+'.zcp .zk-pips.zcp-pipsm{gap:3px}.zcp .zk-pips.zcp-pipsm i{width:7px;height:7px}.zcp .zk-pips.zcp-pipsm i.over{width:5px;height:5px}'
+'@media (max-height:740px){.zcp-pad{display:none}}'
+'.zk-rm .zcp-t.s::after{animation:none}@media (prefers-reduced-motion:reduce){.zcp-t.s::after{animation:none}}';
var BOX='<svg viewBox="-12 -12 24 24"><rect x="-10.5" y="-10.5" width="21" height="21" rx="2.6" fill="var(--cp-box1)" stroke="var(--cp-boxln)" stroke-width="1.6"/>'
 +'<rect x="-7.6" y="-7.6" width="15.2" height="15.2" rx="1" fill="var(--cp-box2)" stroke="var(--cp-boxln)" stroke-width="1"/><path d="M-7.6 -7.6L7.6 7.6M7.6 -7.6L-7.6 7.6" stroke="var(--cp-box1)" stroke-width="2.4"/>'
 +'<g class="chk"><circle cx="6.5" cy="-6.5" r="5" fill="var(--cp-ok)" stroke="#fff" stroke-width="1.4"/><path d="M4.2 -6.6l1.6 1.7 3-3.2" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g></svg>';
var KEEP='<svg viewBox="-12 -12 24 24"><ellipse cy="10" rx="7" ry="2" fill="rgba(0,0,0,.18)"/><circle r="9.5" fill="#E8590C" stroke="#5A2205" stroke-width="1.6"/>'
 +'<path d="M-8.6 -3.5C-7 -10 7 -10 8.6 -3.5Z" fill="#2F5D8A" stroke="#5A2205" stroke-width="1.2"/><g class="eyes"><circle cx="-3.2" cy="0.5" r="1.7" fill="#1B1916"/><circle cx="3.2" cy="0.5" r="1.7" fill="#1B1916"/></g></svg>';
var ARW=['M12 19V5M5 12l7-7 7 7','M5 12h14M12 5l7 7-7 7','M12 5v14M5 12l7 7 7-7','M19 12H5M12 5l-7 7 7 7'];

function mount(root,inst,api){ZK.css(CSS,'zcp-css');root.textContent='';
  var R=parse(inst.lv),W=R.W,H=R.H,cr=R.crates.slice(),p=R.player,rm=ZK.rm(api),hist=[],hints=0,undos=0,fin=false,ghost=null,idle=null,offs=[],queue=[],walking=false,timers=[],face=2;
  var dist=pullAll(R);
  var stage=document.createElement('div');stage.className='zcp zk-stage zk-host'+(rm?' zk-rm':'');
  var pips=ZK.pips(inst.par);if(inst.par>16)pips.el.classList.add('zcp-pipsm');
  var board=document.createElement('div');board.className='zcp-b zk-board';board.style.aspectRatio=W+' / '+H;board.style.width='min(100%, calc((100svh - 270px) * '+W+' / '+H+'))';board.tabIndex=0;board.setAttribute('role','application');
  var pw=100/W,ph=100/H,tiles=[];
  for(var i=0;i<W*H;i++){var t=document.createElement('div');t.className='zcp-t '+(R.wall[i]?'w':'f')+(R.goal[i]?' s':'')+(((i%W)+((i/W)|0))%2?' k2':'');t.style.left=(i%W)*pw+'%';t.style.top=((i/W)|0)*ph+'%';t.style.width=pw+'%';t.style.height=ph+'%';
    if(!R.wall[i])t.setAttribute('data-zkc','');board.appendChild(t);tiles.push(t)}
  var boxes=cr.map(function(c){var b=document.createElement('div');b.className='zcp-o zcp-x';b.innerHTML=BOX;b.style.width=pw+'%';b.style.height=ph+'%';b.setAttribute('data-zkc','');board.appendChild(b);return b});
  var keeper=document.createElement('div');keeper.className='zcp-o zcp-k';keeper.innerHTML=KEEP;keeper.style.width=pw+'%';keeper.style.height=ph+'%';board.appendChild(keeper);
  var eyes=keeper.querySelector('.eyes');
  var padEl=document.createElement('div');padEl.className='zcp-pad';padEl.setAttribute('role','group');padEl.setAttribute('aria-label','Walk the keeper');var pad=[];
  [3,0,2,1].forEach(function(d){var b=document.createElement('button');b.type='button';b.className='zk-p';b.setAttribute('aria-label','Walk '+NAME[d]);
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="'+ARW[d]+'"/></svg>';b.onclick=function(){go(d)};pad[d]=b;padEl.appendChild(b)});
  stage.appendChild(pips.el);stage.appendChild(board);stage.appendChild(padEl);root.appendChild(stage);
  function tr(c){return 'translate('+(c%W)*100+'%,'+((c/W)|0)*100+'%)'}
  function place(){keeper.style.transform=tr(p);cr.forEach(function(c,i){boxes[i].style.transform=tr(c);boxes[i].classList.toggle('on',!!R.goal[c])});eyes.style.transform='translate('+DX[face]*1.6+'px,'+DY[face]*1.6+'px)';label()}
  function onSpots(){var n=0;cr.forEach(function(c){if(R.goal[c])n++});return n}
  function label(){board.setAttribute('aria-label','Crate Push room '+W+' by '+H+'. '+onSpots()+' of '+cr.length+' crates on spots. Keeper at row '+(((p/W)|0)+1)+', column '+(p%W+1)+'. Swipe, use the arrow keys, or tap a floor cell to walk.')}
  function T(fn,ms){timers.push(setTimeout(fn,ms))}
  function crateAt(c){return cr.indexOf(c)}
  var STEP=rm?0:85,PUSH=rm?0:120;
  /* one step in direction d; returns ms it takes, or -1 when blocked */
  function stepOnce(d,manual){var n=step(R,p,d);face=d;
    if(n<0||R.wall[n]){bump(d);return -1}
    var ci=crateAt(n);
    if(ci>=0){var n2=step(R,n,d);if(n2<0||R.wall[n2]||crateAt(n2)>=0){bump(d,boxes[ci]);return -1}
      var wasOn=!!R.goal[cr[ci]],from=p;hist.push({p:p,ci:ci,c:n});cr[ci]=n2;p=n;api.moved();pips.set(hist.length);
      var a0=tr(n),a1=tr(n2);place();
      ZK.anim(boxes[ci],[{transform:a0},{transform:a1}],PUSH,'cubic-bezier(.3,.6,.4,1)');ZK.anim(keeper,[{transform:tr(from)},{transform:tr(p)}],PUSH,'cubic-bezier(.3,.6,.4,1)');
      ZK.sfx('slide');ZK.buzz('move');
      var on=!!R.goal[n2];
      T(function(){if(on&&!wasOn){ZK.sfx('cap',{n:Math.min(8,onSpots()*2)});ZK.buzz('cap');var q=ZK.at(board,boxes[ci]);ZK.burst(board,q.x,q.y,{n:8,r:30,colors:['#F6B73C','#E9A23B','#fff']});
          ZK.anim(boxes[ci],[{transform:a1+' scale(1)'},{transform:a1+' scale(1.12)'},{transform:a1+' scale(1)'}],240,ZK.SPRING)}
        else ZK.sfx('thud',{k:1})},PUSH);
      afterPush();return PUSH+10}
    var from2=p;p=n;place();ZK.anim(keeper,[{transform:tr(from2)},{transform:tr(p)+' translateY(-6%)',offset:.5},{transform:tr(p)}],STEP,'linear');
    if(manual){ZK.sfx('press');ZK.buzz('tap')}
    return STEP}
  function bump(d,crate){var a=tr(p);ZK.anim(keeper,[{transform:a},{transform:a+' translate('+DX[d]*14+'%,'+DY[d]*14+'%)'},{transform:a}],180,'ease-out');
    if(crate){var c=tr(cr[boxes.indexOf(crate)]);ZK.anim(crate,[{transform:c},{transform:c+' translate('+DX[d]*4+'%,'+DY[d]*4+'%)'},{transform:c}],180,'ease-out')}
    ZK.sfx('soft');ZK.buzz('wrong');eyes.style.transform='translate('+DX[d]*1.6+'px,'+DY[d]*1.6+'px)'}
  function afterPush(){if(solved(R,cr)){fin=true;queue=[];T(function(){ZK.sfx('drop');ZK.buzz('pop');api.say('Every crate is on a spot.');api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},PUSH+20);return}
    var ok=dist[stateKey(R,cr,p)]!=null;ZK.stuck(stage,!ok,{kind:'dead',text:'A crate is stuck now. This room can’t be finished.'})}
  /* a queue of steps (a walk), played one after another */
  function run(){if(walking||!queue.length||fin)return;walking=true;var d=queue.shift(),ms=stepOnce(d,false);if(ms<0){queue=[];walking=false;return}T(function(){walking=false;run()},ms)}
  function go(d){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);if(walking){queue=[d];return}queue=[];var ms=stepOnce(d,true);if(ms>0){walking=true;T(function(){walking=false;run()},Math.max(0,ms-25))}}
  function walkTo(c){if(fin)return;var pa=path(R,occOf(R,cr),p,c);if(!pa){ZK.wrong(tiles[c]);return}if(!pa.length)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);queue=pa;ZK.sfx('press');run()}
  /* input: swipe anywhere (one step per swipe), tap a floor cell to walk there, tap a crate next to the keeper to push it */
  var sw=null;function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  L(board,'pointerdown',function(e){sw={x:e.clientX,y:e.clientY,id:e.pointerId,done:false};try{board.setPointerCapture(e.pointerId)}catch(_){}
    ZK.anim(keeper.firstChild,[{transform:'scale(1)'},{transform:'scale(.92)'},{transform:'scale(1)'}],160,'ease-out')});
  L(board,'pointermove',function(e){if(!sw||sw.done||e.pointerId!==sw.id)return;var dx=e.clientX-sw.x,dy=e.clientY-sw.y;if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;sw.done=true;
    go(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0))});
  L(board,'pointerup',function(e){if(!sw||e.pointerId!==sw.id)return;var w=sw;sw=null;if(w.done)return;
    var r=board.getBoundingClientRect(),cx=Math.floor((e.clientX-r.left)/r.width*W),cy=Math.floor((e.clientY-r.top)/r.height*H);if(cx<0||cy<0||cx>=W||cy>=H)return;var c=cy*W+cx;
    if(R.wall[c])return;var ci=crateAt(c);
    if(ci>=0){for(var d=0;d<4;d++)if(step(R,p,d)===c){go(d);return}ZK.wrong(boxes[ci]);return}
    walkTo(c)});
  L(board,'pointercancel',function(){sw=null});
  L(board,'keydown',function(e){var d=e.key==='ArrowUp'?0:e.key==='ArrowRight'?1:e.key==='ArrowDown'?2:e.key==='ArrowLeft'?3:-1;if(d<0)return;e.preventDefault();go(d)});
  place();
  /* level 1: the ghost swipes the keeper into the crate */
  if(inst.level===1){var m=nextPush();if(m&&m.walk.length===0)ghost=ZK.ghost(stage,[{swipe:[keeper,DX[m.d]*80,DY[m.d]*80]}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  /* the next push on a shortest solution, with the keeper's walk to it */
  function nextPush(){var k=stateKey(R,cr,p),here=dist[k];if(here==null||here===0)return null;var o=occOf(R,cr),best=null;
    pushes(R,cr,p).forEach(function(m){if(best)return;if(dist[stateKey(R,m[2],m[3])]===here-1){var wk=path(R,o,p,m[4]);if(wk)best={ci:m[0],d:m[1],from:m[4],walk:wk}}});return best}
  function undo(){if(fin||!hist.length)return false;queue=[];var h=hist.pop(),a=tr(cr[h.ci]),k0=tr(p);cr[h.ci]=h.c;p=h.p;place();
    ZK.anim(boxes[h.ci],[{transform:a},{transform:tr(h.c)}],160,ZK.EASE);ZK.anim(keeper,[{transform:k0},{transform:tr(p)}],160,ZK.EASE);undos++;pips.set(hist.length);
    ZK.stuck(stage,dist[stateKey(R,cr,p)]==null,{kind:'dead',text:'A crate is stuck now. This room can’t be finished.'});ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true}
  return{undo:undo,
    restart:function(){if(fin)return;queue=[];cr=R.crates.slice();p=R.player;hist=[];place();pips.set(0);ZK.stuck(stage,false);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;ZK.unmark(stage);if(dist[stateKey(R,cr,p)]==null){ZK.mark(document.querySelector('.pz5 [data-undo]'));return 'A crate is stuck. Undo a push.'}
      var m=nextPush();if(!m)return null;hints++;
      if(lv<=1){ZK.mark(boxes[m.ci]);return 'Push this crate next.'}
      if(lv===2){ZK.mark([boxes[m.ci],tiles[m.from]]);return 'Stand on the marked cell and push it '+NAME[m.d]+'.'}
      queue=m.walk.concat([m.d]);run();return 'Pushed it for you.'},
    destroy:function(){timers.forEach(clearTimeout);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){var h=hist[hist.length-1];return h?boxes[h.ci]:keeper},
    state:function(){return{p:p,crates:cr.slice(),moves:hist.length,fin:fin,walking:walking||queue.length>0,lost:dist[stateKey(R,cr,p)]==null}}}}

ZK.override({id:ID,name:'Crate Push',family:'move',blurb:'Push every crate onto a glowing spot.',
  how:'Swipe to walk. Walk into a crate to push it. Crates never pull back. Get every crate onto a spot.',
  areas:['space','logic'],levels:LEVELS.length||24,secs:90,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'All crates placed in '+m+' push'+(m===1?'':'es')+'. The fewest is '+p+'.'}}});
})();
