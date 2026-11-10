/* Zest v6 (batch g): Rectangle Cut. A new puzzle (the Shikaku genre). Drag from corner to corner to draw a rectangle. Each rectangle must hold
   exactly one number and cover exactly that many squares; together they cover the board.
   Levels: a curated table (tests/batch_g_gen_rect.js): a random cut of the board into rectangles, one number in each. A deduction solver
   (V6RC.deduce) must solve every level with three human rules, so each level has one answer and needs no guessing:
     fit: a number with only one rectangle that fits is placed;
     claim: a square that only one rectangle can still cover forces that rectangle;
     share: a square that every fit of one number covers belongs to that number, so other numbers' fits through it are out.
   Levels 1-3 need only "fit"; from level 4 "claim" or "share" (two numbers competing for squares) is needed, and more of it as the ladder climbs.
   A drawn rectangle that breaks the rule (no number, two numbers, wrong size) is refused at once, kindly. A legal rectangle that is not in the
   answer makes the board unfinishable: that is the deferred 'dead' signal (on Hint, 3 moves later, or 10 s idle), with Undo. */
(function(){
var ID='rect-cut';
var COLS=['#F2B880','#9DD3C8','#C6B5E8','#F4A6A6','#A9CBEF','#E6D47A','#B8DFA0','#F0B8D8','#9FC6B0','#E9C09A','#B7C2F0','#D8E59A'];
var COLS_D=['#8A5A2E','#2F6E64','#5B4A86','#8A3E3E','#355E8C','#7E6E22','#4E7A36','#86426A','#3D6A52','#835C36','#4A5590','#6C7A2E'];
/* clues: [[r,c,n],...] on an R x C board. candidates(i): every rectangle [r0,c0,h,w] holding clue i and no other clue */
function cands(R,C,clues,i){var q=clues[i],out=[],n=q[2],at={};clues.forEach(function(x,j){at[x[0]*C+x[1]]=j});
  for(var h=1;h<=n;h++){if(n%h)continue;var w=n/h;if(h>R||w>C)continue;
    for(var r0=Math.max(0,q[0]-h+1);r0<=Math.min(q[0],R-h);r0++)for(var c0=Math.max(0,q[1]-w+1);c0<=Math.min(q[1],C-w);c0++){var ok=true;
      for(var r=r0;r<r0+h&&ok;r++)for(var c=c0;c<c0+w;c++){var j=at[r*C+c];if(j!==undefined&&j!==i){ok=false;break}}
      if(ok)out.push([r0,c0,h,w])}}
  return out}
function cellsOf(t,C){var o=[];for(var r=t[0];r<t[0]+t[2];r++)for(var c=t[1];c<t[1]+t[3];c++)o.push(r*C+c);return o}
/* exact cover count (up to lim) */
function count(R,C,clues,lim){var CA=clues.map(function(_,i){return cands(R,C,clues,i).map(function(t){return cellsOf(t,C)})}),used=new Array(R*C).fill(0),n=0,done=new Array(clues.length).fill(0);
  function rec(k){if(n>=lim)return;if(k===clues.length){for(var c=0;c<R*C;c++)if(!used[c])return;n++;return}
    /* most constrained clue first */
    var bi=-1,bl=null,bc=1e9;for(var i=0;i<clues.length;i++){if(done[i])continue;var l=CA[i].filter(function(cs){for(var j=0;j<cs.length;j++)if(used[cs[j]])return false;return true});if(l.length<bc){bc=l.length;bi=i;bl=l}if(!bc)return}
    done[bi]=1;bl.forEach(function(cs){cs.forEach(function(c){used[c]=1});rec(k+1);cs.forEach(function(c){used[c]=0})});done[bi]=0}
  rec(0);return n}
/* the human deduction solver: returns {ok, sol:[rect per clue], steps:[{i, rule}], hard (claim/share uses)} */
function deduce(R,C,clues){var N=clues.length,CA=clues.map(function(_,i){return cands(R,C,clues,i)}),fixed=new Array(N).fill(null),steps=[],hard=0,own=new Array(R*C).fill(-1);
  function covers(t,c){var r=(c/C)|0,cc=c%C;return r>=t[0]&&r<t[0]+t[2]&&cc>=t[1]&&cc<t[1]+t[3]}
  function prune(){var ch=true;while(ch){ch=false;for(var i=0;i<N;i++){if(fixed[i])continue;var l=CA[i].filter(function(t){var cs=cellsOf(t,C);for(var j=0;j<cs.length;j++)if(own[cs[j]]>=0&&own[cs[j]]!==i)return false;return true});
        if(l.length!==CA[i].length){CA[i]=l;ch=true}if(!l.length)return false}}return true}
  function fix(i,t,rule){fixed[i]=t;CA[i]=[t];cellsOf(t,C).forEach(function(c){own[c]=i});steps.push({i:i,rule:rule,t:t});if(rule!=='fit')hard++}
  for(var guard=0;guard<500;guard++){if(!prune())return{ok:false};var left=0;for(var i=0;i<N;i++)if(!fixed[i])left++;if(!left)break;var did=false;
    /* fit */
    for(var i2=0;i2<N&&!did;i2++)if(!fixed[i2]&&CA[i2].length===1){fix(i2,CA[i2][0],'fit');did=true}
    if(did)continue;
    /* claim: a free square only one rectangle (of all clues) can cover */
    for(var c=0;c<R*C&&!did;c++){if(own[c]>=0)continue;var hit=[];for(var j=0;j<N;j++)if(!fixed[j])CA[j].forEach(function(t){if(covers(t,c))hit.push([j,t])});
      if(!hit.length)return{ok:false};if(hit.length===1){fix(hit[0][0],hit[0][1],'claim');did=true}
      else{var only=hit[0][0];if(hit.every(function(h){return h[0]===only})&&own[c]<0){own[c]=only;steps.push({i:only,rule:'claim-sq',c:c});hard++;did=true}}}
    if(did)continue;
    /* share: a square every fit of one number covers belongs to it */
    for(var i3=0;i3<N&&!did;i3++){if(fixed[i3])continue;var l=CA[i3];for(var c3=0;c3<R*C;c3++){if(own[c3]>=0)continue;if(l.every(function(t){return covers(t,c3)})){var others=false;
          for(var j3=0;j3<N;j3++)if(j3!==i3&&!fixed[j3]&&CA[j3].some(function(t){return covers(t,c3)})){others=true;break}
          if(others){own[c3]=i3;steps.push({i:i3,rule:'share',c:c3});hard++;did=true;break}}}}
    if(!did)return{ok:false,stuck:true,steps:steps,hard:hard}}
  return{ok:true,sol:fixed,steps:steps,hard:hard}}
/* curated levels: [R, C, clues [[r,c,n]...], answer [[r0,c0,h,w]... per clue]] (tests/batch_g_gen_rect.js) */
var LEVELS=[[3,3,[[0,1,2],[2,2,3],[1,0,4]],[[0,0,1,2],[0,2,3,1],[1,0,2,2]]],[4,4,[[0,1,6],[1,3,2],[2,1,6],[2,3,2]],[[0,0,2,3],[0,3,2,1],[2,0,2,3],[2,3,2,1]]],[4,4,[[3,0,4],[1,1,2],[2,3,6],[3,1,2],[3,2,2]],[[0,0,4,1],[0,1,2,1],[0,2,3,2],[2,1,2,1],[3,2,1,2]]],[4,4,[[1,0,6],[0,2,4],[0,3,2],[2,3,2],[3,0,2]],[[0,0,3,2],[0,2,4,1],[0,3,2,1],[2,3,2,1],[3,0,1,2]]],[5,5,[[0,2,8],[0,4,2],[4,0,3],[2,3,6],[2,4,3],[4,2,3]],[[0,0,2,4],[0,4,2,1],[2,0,3,1],[2,1,2,3],[2,4,3,1],[4,1,1,3]]],[5,5,[[0,2,4],[3,4,5],[1,1,3],[2,3,3],[3,0,6],[2,2,2],[4,2,2]],[[0,0,1,4],[0,4,5,1],[1,0,1,3],[1,3,3,1],[2,0,3,2],[2,2,2,1],[4,2,1,2]]],[5,5,[[0,1,6],[1,3,6],[3,4,5],[3,1,3],[4,3,2],[4,0,2],[4,2,1]],[[0,0,3,2],[0,2,3,2],[0,4,5,1],[3,0,1,3],[3,3,2,1],[4,0,1,2],[4,2,1,1]]],[6,6,[[0,2,4],[0,4,2],[1,2,9],[2,4,8],[1,5,4],[4,1,6],[5,4,2],[5,5,1]],[[0,0,1,4],[0,4,1,2],[1,0,3,3],[1,3,4,2],[1,5,4,1],[4,0,2,3],[5,3,1,2],[5,5,1,1]]],[5,5,[[0,0,2],[1,3,6],[2,0,4],[2,1,4],[2,2,2],[3,4,4],[4,2,3]],[[0,0,1,2],[0,2,2,3],[1,0,4,1],[1,1,4,1],[2,2,2,1],[2,3,2,2],[4,2,1,3]]],[6,6,[[0,0,3],[0,5,3],[1,2,9],[1,4,3],[3,4,8],[3,5,4],[5,0,2],[4,2,2],[5,2,2]],[[0,0,1,3],[0,3,1,3],[1,0,3,3],[1,3,1,3],[2,3,4,2],[2,5,4,1],[4,0,2,1],[4,1,1,2],[5,1,1,2]]],[6,6,[[1,2,6],[0,5,3],[3,3,3],[3,5,6],[4,0,6],[5,2,4],[4,4,4],[4,5,2],[5,0,2]],[[0,0,2,3],[0,3,1,3],[1,3,3,1],[1,4,3,2],[2,0,3,2],[2,2,4,1],[4,3,2,2],[4,5,2,1],[5,0,1,2]]],[6,6,[[0,0,3],[0,1,4],[0,3,6],[3,2,8],[2,5,2],[5,0,3],[4,1,2],[4,4,4],[4,5,2],[5,1,2]],[[0,0,3,1],[0,1,2,2],[0,3,2,3],[2,1,2,4],[2,5,2,1],[3,0,3,1],[4,1,1,2],[4,3,2,2],[4,5,2,1],[5,1,1,2]]],[6,6,[[0,2,6],[1,4,8],[0,5,2],[4,1,6],[2,2,4],[4,5,4],[5,3,4],[5,0,2]],[[0,0,2,3],[0,3,4,2],[0,5,2,1],[2,0,3,2],[2,2,4,1],[2,5,4,1],[4,3,2,2],[5,0,1,2]]],[7,6,[[1,0,2],[0,3,8],[4,5,5],[3,0,8],[5,2,4],[2,3,2],[2,4,3],[5,3,3],[6,4,4],[6,0,3]],[[0,0,2,1],[0,1,2,4],[0,5,5,1],[2,0,4,2],[2,2,4,1],[2,3,2,1],[2,4,3,1],[4,3,3,1],[5,4,2,2],[6,0,1,3]]],[7,6,[[0,1,2],[1,3,4],[1,4,4],[4,5,7],[2,0,3],[1,1,2],[2,3,8],[3,1,4],[5,0,3],[6,4,3],[6,3,2]],[[0,0,1,2],[0,2,2,2],[0,4,4,1],[0,5,7,1],[1,0,3,1],[1,1,2,1],[2,2,4,2],[3,1,4,1],[4,0,3,1],[4,4,3,1],[6,2,1,2]]],[6,6,[[3,0,6],[0,3,3],[1,4,4],[2,1,2],[5,2,5],[2,3,5],[4,4,4],[2,5,3],[5,1,3],[5,5,1]],[[0,0,6,1],[0,1,1,3],[0,4,2,2],[1,1,2,1],[1,2,5,1],[1,3,5,1],[2,4,4,1],[2,5,3,1],[3,1,3,1],[5,5,1,1]]],[7,6,[[0,0,4],[0,5,2],[4,1,10],[1,3,2],[6,4,6],[4,5,4],[3,2,3],[3,3,3],[6,2,4],[6,5,2],[6,0,2]],[[0,0,1,4],[0,4,1,2],[1,0,5,2],[1,2,1,2],[1,4,6,1],[1,5,4,1],[2,2,3,1],[2,3,3,1],[5,2,2,2],[5,5,2,1],[6,0,1,2]]],[7,6,[[1,0,2],[2,2,9],[0,4,5],[0,5,2],[3,0,4],[3,5,5],[3,2,2],[4,3,3],[5,1,4],[5,4,2],[6,2,3],[6,3,1]],[[0,0,2,1],[0,1,3,3],[0,4,5,1],[0,5,2,1],[2,0,4,1],[2,5,5,1],[3,1,1,2],[3,3,3,1],[4,1,2,2],[5,4,2,1],[6,0,1,3],[6,3,1,1]]],[7,6,[[0,0,2],[0,4,3],[1,5,2],[1,0,8],[3,4,4],[6,5,5],[5,1,8],[4,2,3],[3,3,3],[6,4,2],[6,2,2]],[[0,0,1,2],[0,2,1,3],[0,5,2,1],[1,0,2,4],[1,4,4,1],[2,5,5,1],[3,0,4,2],[3,2,3,1],[3,3,3,1],[5,4,2,1],[6,2,1,2]]],[7,6,[[0,0,6],[2,1,4],[0,3,2],[2,4,8],[3,2,3],[2,3,2],[5,3,3],[4,1,3],[5,2,3],[5,5,4],[6,0,1],[6,3,3]],[[0,0,6,1],[0,1,4,1],[0,2,1,2],[0,4,4,2],[1,2,3,1],[1,3,2,1],[3,3,3,1],[4,1,3,1],[4,2,3,1],[4,4,2,2],[6,0,1,1],[6,3,1,3]]]];
function make(level,rng){var L=Math.max(1,Math.min(LEVELS.length,level|0||1)),e=LEVELS[L-1],R=e[0],C=e[1],cl=e[2].map(function(x){return x.slice()}),so=e[3].map(function(x){return x.slice()});
  /* a random mirror for daily and reel copies */
  if(L>1){var t=pzInt(rng,4);if(t&1){cl.forEach(function(q){q[1]=C-1-q[1]});so.forEach(function(s){s[1]=C-s[1]-s[3]})}if(t&2){cl.forEach(function(q){q[0]=R-1-q[0]});so.forEach(function(s){s[0]=R-s[0]-s[2]})}}
  return {level:L,title:'Level '+L,R:R,C:C,clues:cl,sol:so,par:cl.length,parExact:true}}
window.V6RC={cands:cands,cellsOf:cellsOf,count:count,deduce:deduce,LEVELS:LEVELS,make:make};

var CSS=''
+'.grc{position:relative;width:100%;max-width:380px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);--grc-paper:#FFFDF7;--grc-line:#DCD3C2;--grc-ink:#2A2620;--grc-frame:#BFB29A}'
+':root[data-theme="dark"] .grc{--grc-paper:#26231E;--grc-line:#3E382F;--grc-ink:#F1EBDD;--grc-frame:#4E463A}'
+'.grc-b{position:relative;width:100%;border-radius:16px;padding:8px;box-sizing:border-box;background:var(--grc-frame);box-shadow:0 8px 20px rgba(60,40,10,.15);touch-action:none;user-select:none;-webkit-user-select:none}'
+'.grc-g{position:relative;width:100%;border-radius:10px;overflow:hidden;background:var(--grc-paper)}'
+'.grc-c{position:absolute;box-sizing:border-box;box-shadow:inset 0 0 0 .5px var(--grc-line);display:flex;align-items:center;justify-content:center;font:800 1.25rem/1 var(--font);color:var(--grc-ink);font-variant-numeric:tabular-nums;z-index:2;pointer-events:none}'
+'.grc-c b{display:flex;align-items:center;justify-content:center;width:min(72%,46px);height:min(72%,46px);border-radius:50%;background:var(--grc-paper);box-shadow:0 0 0 2px var(--grc-ink)}'
+'.grc-c.done b{box-shadow:0 0 0 2px var(--grc-ink),0 0 0 5px rgba(255,255,255,.5)}'
+'.grc-r{position:absolute;box-sizing:border-box;border-radius:9px;border:3px solid rgba(0,0,0,.28);z-index:1;pointer-events:none}'
+':root[data-theme="dark"] .grc-r{border-color:rgba(255,255,255,.28)}'
+'.grc-dr{position:absolute;box-sizing:border-box;border-radius:9px;border:3px dashed var(--grc-ink);background:rgba(120,110,90,.18);z-index:3;pointer-events:none}'
+'.grc-dr.good{border-style:solid;background:rgba(80,170,110,.28)}'
+'.grc-dr.bad{border-color:#E9A23B;background:rgba(233,162,59,.18)}'
+'.grc-n{position:absolute;z-index:4;min-width:34px;height:30px;padding:0 8px;box-sizing:border-box;border-radius:15px;background:var(--grc-ink);color:var(--grc-paper);font:800 1rem/30px var(--font);text-align:center;pointer-events:none;transform:translate(-50%,-130%);font-variant-numeric:tabular-nums}'
+'.grc-n.good{background:#2F8F57;color:#fff}.grc-n.bad{background:#E9A23B;color:#1B1916}';

function mount(root,inst,api){ZK.css(CSS,'grc-css');root.textContent='';
  var R=inst.R,C=inst.C,cl=inst.clues,rm=ZK.rm(api),placed=new Array(cl.length).fill(null),hist=[],hints=0,fin=false,ghost=null,idle=null,offs=[],last=null,rectEl=new Array(cl.length).fill(null);
  var dark=false;try{dark=document.documentElement.getAttribute('data-theme')==='dark'||(!document.documentElement.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme: dark)').matches)}catch(e){}
  var stage=document.createElement('div');stage.className='grc zk-stage zk-host'+(rm?' zk-rm':'');
  var pips=ZK.pips(inst.par);
  var board=document.createElement('div');board.className='grc-b zk-board';board.setAttribute('role','grid');
  var grid=document.createElement('div');grid.className='grc-g';grid.style.aspectRatio=C+' / '+R;board.appendChild(grid);
  var pw=100/C,ph=100/R,clueEl=[],at={};cl.forEach(function(q,i){at[q[0]*C+q[1]]=i});
  for(var r=0;r<R;r++)for(var c=0;c<C;c++){var e=document.createElement('div');e.className='grc-c';e.style.left=c*pw+'%';e.style.top=r*ph+'%';e.style.width=pw+'%';e.style.height=ph+'%';e.setAttribute('data-zkc','');
    var i=at[r*C+c];if(i!==undefined){e.innerHTML='<b>'+cl[i][2]+'</b>';clueEl[i]=e}grid.appendChild(e)}
  var dr=document.createElement('div');dr.className='grc-dr';dr.style.display='none';grid.appendChild(dr);
  var nb=document.createElement('div');nb.className='grc-n';nb.style.display='none';board.appendChild(nb);
  stage.appendChild(pips.el);stage.appendChild(board);root.appendChild(stage);
  /* a refused move is named at once in the line under the board (the kit's rule chip is for moves that are made, and its Undo would undo an earlier move) */
  var tellT=0;function tell(msg){if(api.say)api.say(msg);var h=root.closest&&root.closest('.pz5');h=h&&h.querySelector('.pzh');if(!h)return;h.textContent=msg;clearTimeout(tellT);tellT=setTimeout(function(){if(h.textContent===msg)h.textContent=''},1900)}
  function box(el,t){el.style.left=t[1]*pw+'%';el.style.top=t[0]*ph+'%';el.style.width=t[3]*pw+'%';el.style.height=t[2]*ph+'%'}
  function inRect(t,r,c){return r>=t[0]&&r<t[0]+t[2]&&c>=t[1]&&c<t[1]+t[3]}
  function overlaps(a,b){return a[0]<b[0]+b[2]&&b[0]<a[0]+a[2]&&a[1]<b[1]+b[3]&&b[1]<a[1]+a[3]}
  function judge(t){var inside=[];cl.forEach(function(q,i){if(inRect(t,q[0],q[1]))inside.push(i)});var area=t[2]*t[3];
    if(!inside.length)return{ok:false,why:'Each rectangle needs a number',area:area};if(inside.length>1)return{ok:false,why:'Only one number in each rectangle',area:area,cells:inside.map(function(i){return clueEl[i]})};
    var n=cl[inside[0]][2];if(area!==n)return{ok:false,why:area<n?'Too small for '+n:'Too big for '+n,area:area,i:inside[0]};return{ok:true,i:inside[0],area:area}}
  function draw(i){if(rectEl[i]){rectEl[i].remove();rectEl[i]=null}var t=placed[i];if(!t){clueEl[i].classList.remove('done');return}
    var el=document.createElement('div');el.className='grc-r';el.setAttribute('data-zkc','');el.style.background=(dark?COLS_D:COLS)[i%COLS.length];box(el,t);grid.insertBefore(el,grid.firstChild);rectEl[i]=el;clueEl[i].classList.add('done')}
  function covered(){var n=0;placed.forEach(function(t){if(t)n+=t[2]*t[3]});return n}
  function label(){board.setAttribute('aria-label','Board '+R+' by '+C+'. '+covered()+' of '+R*C+' squares covered.')}
  function same(a,b){return a&&b&&a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]&&a[3]===b[3]}
  function check(){/* is the answer still reachable? (unique answer: every placed rectangle must be the answer's) */
    var bad=false;placed.forEach(function(t,i){if(t&&!same(t,inst.sol[i]))bad=true});
    if(bad)ZK.stuck(stage,true,{kind:'dead',text:'One of these rectangles can’t be part of the answer',onUndo:undo});else ZK.stuck(stage,false)}
  function put(i,t,quiet){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    var prev=placed.map(function(x){return x&&x.slice()}),removed=[];
    placed.forEach(function(x,j){if(x&&j!==i&&overlaps(x,t)){placed[j]=null;draw(j);removed.push(j)}});
    placed[i]=t;draw(i);hist.push(prev);last=i;api.moved();pips.set(hist.length);label();
    var el=rectEl[i];if(el&&!rm){/* the colour pours out of the number to fill the rectangle, then the rectangle settles with a spring */
      var q=cl[i],cx=((q[1]-t[1]+.5)/t[3]*100).toFixed(1)+'%',cy=((q[0]-t[0]+.5)/t[2]*100).toFixed(1)+'%';
      ZK.anim(el,[{clipPath:'circle(8% at '+cx+' '+cy+')'},{clipPath:'circle(150% at '+cx+' '+cy+')'}],240,'cubic-bezier(.3,.7,.4,1)');
      ZK.anim(el,[{scale:'1'},{scale:'.96',offset:.55},{scale:'1.025',offset:.8},{scale:'1'}],380,'ease-out');
      ZK.anim(clueEl[i].firstChild,[{scale:'1'},{scale:'1.25'},{scale:'1'}],300,ZK.SPRING,120)}
    ZK.sfx('cap',{n:Math.min(8,hist.length%9)});ZK.buzz('move');
    if(placed.every(function(x,j){return same(x,inst.sol[j])})){fin=true;ZK.stuck(stage,false);if(api.say)api.say('The board is cut.');
      setTimeout(function(){var g=ZK.at(board,clueEl[i]);ZK.burst(board,g.x,g.y,{n:12,r:50});setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,extra:{par:inst.par}})},rm?0:220)},rm?0:260);return}
    check()}
  function remove(i){if(fin||!placed[i])return;var prev=placed.map(function(x){return x&&x.slice()});var el=rectEl[i];placed[i]=null;
    if(el&&!rm){rectEl[i]=null;clueEl[i].classList.remove('done');ZK.anim(el,[{transform:'none',opacity:1},{transform:'scale(.85)',opacity:0}],180,ZK.EASE);setTimeout(function(){el.remove()},180)}else draw(i);
    hist.push(prev);api.moved();pips.set(hist.length);label();ZK.sfx('undo');ZK.buzz('tap');check()}
  /* input: drag corner to corner; the rectangle grows ahead of the finger with a live count above it */
  var dg=null;function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  function cellAt(x,y,clamp){var r=grid.getBoundingClientRect(),cx=Math.floor((x-r.left)/r.width*C),cy=Math.floor((y-r.top)/r.height*R);
    if(clamp){cx=Math.max(0,Math.min(C-1,cx));cy=Math.max(0,Math.min(R-1,cy))}else if(cx<0||cy<0||cx>=C||cy>=R)return null;return[cy,cx]}
  function rectOf(a,b){var r0=Math.min(a[0],b[0]),c0=Math.min(a[1],b[1]);return[r0,c0,Math.abs(a[0]-b[0])+1,Math.abs(a[1]-b[1])+1]}
  function show(t,x,y){var j=judge(t);dr.style.display='';box(dr,t);dr.className='grc-dr'+(j.ok?' good':(t[2]*t[3]>1&&(j.why||'').indexOf('Only')===0)?' bad':'');
    var br=board.getBoundingClientRect(),gr=grid.getBoundingClientRect();nb.style.display='';nb.textContent=t[2]*t[3];nb.className='grc-n'+(j.ok?' good':'');
    nb.style.left=(x-br.left)+'px';nb.style.top=(Math.max(gr.top+8,y)-br.top)+'px';return j}
  function hide(){dr.style.display='none';nb.style.display='none'}
  L(grid,'pointerdown',function(e){if(fin)return;var a=cellAt(e.clientX,e.clientY);if(!a)return;dg={a:a,b:a,id:e.pointerId,moved:false,x:e.clientX,y:e.clientY};try{grid.setPointerCapture(e.pointerId)}catch(_){}
    var t=rectOf(a,a);show(t,e.clientX,e.clientY);ZK.sfx('press')});
  L(grid,'pointermove',function(e){if(!dg||e.pointerId!==dg.id)return;var b=cellAt(e.clientX,e.clientY,true);if(Math.hypot(e.clientX-dg.x,e.clientY-dg.y)>6)dg.moved=true;
    if(b[0]!==dg.b[0]||b[1]!==dg.b[1]){dg.b=b;var t0=rectOf(dg.a,b),a0=t0[2]*t0[3];ZK.sfx('click',{p:Math.min(12,a0)});ZK.buzz('tap')}show(rectOf(dg.a,dg.b),e.clientX,e.clientY)});
  L(grid,'pointerup',function(e){if(!dg||e.pointerId!==dg.id)return;var d=dg;dg=null;hide();var t=rectOf(d.a,d.b);
    /* a tap (no drag) on a drawn rectangle lifts it off */
    if(t[2]*t[3]===1){var hitI=-1;placed.forEach(function(x,i){if(x&&inRect(x,t[0],t[1]))hitI=i});if(hitI>=0){remove(hitI);return}}
    var j=judge(t);if(j.ok){if(same(placed[j.i],t)){return}put(j.i,t);return}
    if(t[2]*t[3]===1&&!d.moved)return;
    /* a rule-breaking rectangle: refused at once, kindly; the clashing numbers are outlined */
    var tmp=document.createElement('div');tmp.className='grc-dr bad';box(tmp,t);grid.appendChild(tmp);ZK.wrong(tmp);setTimeout(function(){tmp.remove()},rm?200:420);
    tell(j.why+'.');(j.cells||[]).forEach(function(c){c.classList.add('zk-clash');setTimeout(function(){c.classList.remove('zk-clash')},1200)})});
  L(grid,'pointercancel',function(){dg=null;hide()});
  label();
  if(inst.level===1){/* the ghost drags out the first answer rectangle */var i0=0,s0=inst.sol[0];var a0=grid.children[s0[0]*C+s0[1]],b0=grid.children[(s0[0]+s0[2]-1)*C+(s0[1]+s0[3]-1)];
    ghost=ZK.ghost(stage,[{drag:[a0,b0],down:function(){show([s0[0],s0[1],1,1],0,0);nb.style.display='none'},move:function(){setTimeout(function(){if(ghost&&ghost.playing()){show(s0,0,0);nb.style.display='none'}},380)},up:function(){hide()}}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  var DED=null;
  function undo(){if(fin||!hist.length)return false;var prev=hist.pop();placed=prev;for(var i=0;i<cl.length;i++)draw(i);pips.set(hist.length);label();ZK.stuck(stage,false);check();ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true}
  return{undo:undo,
    restart:function(){if(fin)return;placed=new Array(cl.length).fill(null);hist=[];for(var i=0;i<cl.length;i++)draw(i);pips.set(0);label();ZK.stuck(stage,false);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;ZK.unmark(stage);
      var wrong=placed.map(function(t,i){return t&&!same(t,inst.sol[i])?i:-1}).filter(function(i){return i>=0});
      if(wrong.length){hints++;ZK.mark(rectEl[wrong[0]]);return 'This rectangle is not part of the answer. Tap it to lift it off.'}
      DED=DED||deduce(R,C,cl);var st=null;(DED.steps||[]).some(function(s){if(s.t&&!same(placed[s.i],inst.sol[s.i])){st=s;return true}return false});
      if(!st){var k=placed.findIndex(function(t,i){return !same(t,inst.sol[i])});if(k<0)return null;st={i:k,rule:'fit'}}
      hints++;
      if(lv<=1)return st.rule==='fit'?'One number here has only one rectangle that fits.':'Two numbers compete for the same squares. Which one must take them?';
      if(lv===2){ZK.mark(clueEl[st.i]);return 'Work on this number.'}
      put(st.i,inst.sol[st.i].slice());return 'Drew one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last!=null&&rectEl[last]?rectEl[last]:board},
    moves:function(){return hist.length},
    state:function(){return{placed:placed.map(function(t){return t&&t.slice()}),moves:hist.length,fin:fin}}}}

ZK.override({id:ID,name:'Rectangle Cut',family:'logic',theme:'F8',blurb:'Cut the board into rectangles, one number in each.',
  how:'Drag from corner to corner to draw a rectangle. Each holds one number and covers that many squares.',
  areas:['logic','space'],levels:LEVELS.length||20,secs:90,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'Cut in '+m+' rectangle'+(m===1?'':'s')+'. The fewest is '+p+'.'+(res.hints?' With a hint.':'')}}});
})();
