/* Zest v6 (batch g): Aqueduct. A new puzzle (pipe-rotation genre). Tap a pipe piece to turn it a quarter turn clockwise. Water runs from the
   spring through every joined pipe. Solved when every piece carries water and no pipe end is open (no leaks); with these pieces that also
   means no loops (the network is one tree).
   Levels: a curated table (tests/batch_g_gen_aqueduct.js): a random spanning tree (no crossings), then pieces turned at random. A deduction
   solver (V6AQ.deduce) must solve each level with two human rules only, so every level has one answer and needs no guessing:
     edge rule: two touching ends must agree (both open or both closed), and nothing points off the board;
     ring rule: a turn that would close a ring of pipes (or seal off a part of the network without the rest) is impossible.
   Levels 1-5 need only the edge rule; from level 6 the ring rule is needed at least once, from level 12 at least twice.
   Par = the fewest clockwise turns to the answer. Turning never traps you (every piece comes back round), so there is no dead end. */
(function(){
var ID='aqueduct',DX=[0,1,0,-1],DY=[-1,0,1,0];   /* bit d: 0 north(1) 1 east(2) 2 south(4) 3 west(8) */
function rot(m,k){k=((k%4)+4)%4;for(var i=0;i<k;i++)m=((m<<1)|(m>>3))&15;return m}
function deg(m){var n=0;for(var d=0;d<4;d++)if(m&(1<<d))n++;return n}
function turnsTo(cur,goal){for(var k=0;k<4;k++)if(rot(cur,k)===goal)return k;return -1}
function masksOf(m){var o=[];for(var k=0;k<4;k++){var r=rot(m,k);if(o.indexOf(r)<0)o.push(r)}return o}
/* water: cells reached from the spring through mutually joined ends; leaks: open ends of watered pieces */
function flow(W,H,M,src){var seen={},order=[src],dist={},leaks=[];seen[src]=1;dist[src]=0;
  for(var q=0;q<order.length;q++){var c=order[q],x=c%W,y=(c/W)|0,m=M[c];
    for(var d=0;d<4;d++)if(m&(1<<d)){var nx=x+DX[d],ny=y+DY[d];
      if(nx<0||ny<0||nx>=W||ny>=H){leaks.push([c,d]);continue}
      var n=ny*W+nx;if(!(M[n]&(1<<((d+2)%4)))){leaks.push([c,d]);continue}
      if(!seen[n]){seen[n]=1;dist[n]=dist[c]+1;order.push(n)}}}
  return {wet:seen,order:order,dist:dist,leaks:leaks}}
function solved(W,H,M,src){var f=flow(W,H,M,src);return f.order.length===W*H&&!f.leaks.length}
/* the deduction solver. Returns {ok, sol (masks), trace:[{c, m, rule}], ring (times the ring rule was needed), stuck} */
function deduce(W,H,P){var N=W*H,Dm=P.map(masksOf),trace=[],ring=0;
  function bitAll(c,d,v){for(var i=0;i<Dm[c].length;i++)if(!!(Dm[c][i]&(1<<d))!==v)return false;return true}
  function nb(c,d){var x=c%W+DX[d],y=((c/W)|0)+DY[d];return(x<0||y<0||x>=W||y>=H)?-1:y*W+x}
  function ac(){var ch=true;while(ch){ch=false;for(var c=0;c<N;c++){var keep=Dm[c].filter(function(m){for(var d=0;d<4;d++){var n=nb(c,d),b=!!(m&(1<<d));
          if(n<0){if(b)return false;continue}
          var od=(d+2)%4,ok=false;for(var j=0;j<Dm[n].length;j++)if(!!(Dm[n][j]&(1<<od))===b){ok=true;break}if(!ok)return false}return true});
        if(!keep.length)return false;if(keep.length<Dm[c].length){if(keep.length===1)trace.push({c:c,m:keep[0],rule:'edge'});Dm[c]=keep;ch=true}}}return true}
  /* the ring rule: with c turned to m (and what that forces by the edge rule), would the surely-joined pipes close a ring, or seal a part of
     the network off from the rest? (a wipe-out by the edge rule alone does not count here: only rings and sealed parts) */
  function ringBad(c,m){var save=Dm.map(function(d){return d.slice()}),tr=trace.length;Dm[c]=[m];var bad=false;
    if(ac()){var par={};function f(a){while(par[a]!==a)a=par[a];return a}
      for(var a=0;a<N;a++)par[a]=a;
      for(var a=0;a<N&&!bad;a++)for(var d=1;d<=2;d++){var n=nb(a,d);if(n<0)continue;if(bitAll(a,d,true)&&bitAll(n,(d+2)%4,true)){var ra=f(a),rn=f(n);if(ra===rn){bad=true;break}par[ra]=rn}}
      if(!bad){var comp={};for(var a=0;a<N;a++){var r=f(a);(comp[r]=comp[r]||[]).push(a)}
        for(var k in comp){var cs=comp[k];if(cs.length===N)continue;var open=false;
          for(var i=0;i<cs.length&&!open;i++){var x=cs[i];for(var d=0;d<4;d++){var n=nb(x,d);if(n<0)continue;if(f(n)===f(x))continue;if(!bitAll(x,d,false)){open=true;break}}}
          if(!open){bad=true;break}}}}
    Dm=save;trace.length=tr;return bad}
  if(!ac())return{ok:false};
  for(var guard=0;guard<400;guard++){var open=0;for(var c=0;c<N;c++)if(Dm[c].length>1)open++;if(!open)break;
    var hit=false;for(var c2=0;c2<N&&!hit;c2++)if(Dm[c2].length>1){for(var i=0;i<Dm[c2].length;i++)if(ringBad(c2,Dm[c2][i])){var mm=Dm[c2][i];Dm[c2]=Dm[c2].filter(function(z){return z!==mm});hit=true;ring++;
          if(Dm[c2].length===1)trace.push({c:c2,m:Dm[c2][0],rule:'ring'});break}}
    if(!hit)return{ok:false,stuck:true,trace:trace,ring:ring};
    if(!ac())return{ok:false}}
  var sol=Dm.map(function(d){return d[0]});
  return{ok:true,sol:sol,trace:trace,ring:ring}}
/* curated levels: [W, H, spring, piece masks (as given, already turned), answer masks] (tests/batch_g_gen_aqueduct.js) */
var LEVELS=[[3,3,5,[4,1,12,3,12,5,2,11,6],[4,2,12,3,12,5,2,11,9]],[3,3,5,[4,1,12,3,3,10,2,11,9],[4,2,12,3,12,5,2,11,9]],[4,4,5,[4,12,6,12,6,11,14,1,5,4,3,12,12,11,8,1],[2,12,6,12,6,11,13,1,5,4,3,12,3,11,8,1]],[4,4,6,[4,8,10,12,9,14,14,13,3,9,1,10,8,2,5,9],[4,2,10,12,3,14,14,13,6,9,1,5,1,2,10,9]],[4,4,9,[4,1,14,3,7,4,8,5,9,14,10,13,1,11,8,8],[4,2,14,12,7,8,1,5,3,14,10,13,2,11,8,1]],[4,4,9,[4,2,14,1,3,7,13,4,6,14,7,13,1,2,1,1],[4,2,14,8,3,14,13,4,6,13,7,13,1,1,1,1]],[4,5,5,[6,8,1,12,3,14,6,5,6,11,11,3,5,1,7,8,3,4,3,8],[6,8,2,12,3,14,12,5,6,13,7,9,5,1,7,8,3,8,3,8]],[5,5,12,[2,2,4,12,8,7,14,7,13,4,10,7,3,10,5,5,5,4,3,13,1,3,11,8,1],[4,4,4,6,8,7,13,7,13,4,5,7,9,5,5,5,5,4,3,13,1,3,11,8,1]],[4,4,1,[4,6,5,12,7,13,1,5,9,14,8,5,2,9,8,9],[4,6,10,12,7,11,8,5,3,14,8,5,2,9,2,9]],[5,5,12,[3,12,2,4,4,5,7,13,13,9,2,8,5,11,12,3,10,11,13,1,3,10,4,3,8],[6,12,4,4,4,5,7,13,7,9,1,1,5,7,12,6,10,11,13,1,3,10,8,3,8]],[5,5,7,[9,3,2,3,8,5,3,9,7,12,9,14,14,9,4,6,9,7,13,4,1,2,9,3,8],[6,12,4,6,8,5,3,9,7,12,3,14,14,9,1,6,9,7,14,8,1,2,9,3,8]],[5,5,12,[4,2,11,8,4,7,12,5,6,6,5,14,11,11,8,1,3,14,7,6,8,10,9,4,1],[4,2,14,8,4,7,12,5,6,9,5,7,11,11,8,1,3,14,14,12,2,10,9,1,1]],[5,6,12,[1,2,6,10,12,7,7,7,4,5,8,2,3,11,9,6,14,12,7,12,5,5,7,13,5,1,1,1,4,1],[4,4,6,10,12,7,11,13,4,5,1,2,9,7,9,6,14,12,7,12,5,5,7,13,5,1,1,1,1,1]],[5,5,7,[2,9,2,4,4,1,13,13,7,13,2,2,11,14,1,5,1,14,14,2,3,5,9,3,9],[2,12,4,4,4,2,11,13,7,13,4,2,11,13,1,5,2,14,13,4,3,10,9,3,9]],[5,6,11,[6,10,5,8,4,9,14,12,4,5,4,11,7,7,14,2,13,8,2,13,2,13,4,4,1,2,13,11,14,8],[6,10,10,8,4,3,14,12,4,5,2,13,7,11,13,2,13,1,2,13,2,13,4,4,1,2,11,11,11,8]],[6,6,21,[6,10,10,12,4,4,5,4,4,6,12,5,7,11,13,12,9,13,9,14,8,13,14,5,2,1,8,5,5,4,3,5,11,9,3,8],[6,10,10,12,4,4,5,4,4,3,9,5,7,11,11,12,6,13,3,14,8,7,13,5,4,1,4,5,5,1,3,10,11,9,3,8]],[5,6,17,[1,2,14,10,12,13,10,9,2,13,7,12,4,1,2,10,11,11,11,6,10,7,14,4,5,1,1,3,4,1],[4,2,14,10,12,7,10,9,2,13,7,12,4,4,1,5,7,11,11,12,5,7,14,8,5,1,1,3,8,1]],[6,6,21,[8,1,6,14,8,4,7,7,1,10,6,9,5,1,2,13,11,12,7,12,1,13,14,13,1,11,7,12,5,5,2,9,4,2,9,8],[4,4,6,14,8,4,7,13,1,5,6,9,5,1,2,11,11,12,7,12,2,14,14,13,1,7,14,9,5,5,2,9,1,2,9,1]],[6,6,15,[4,12,4,4,4,4,2,11,11,7,7,13,6,8,3,14,6,7,9,12,4,9,1,5,6,11,14,4,6,9,3,8,3,10,11,1],[2,12,4,4,4,4,2,11,13,7,11,13,6,8,3,13,6,13,3,12,2,9,1,5,6,11,14,8,6,9,3,8,3,10,11,8]],[6,6,8,[2,12,8,6,10,12,3,13,11,14,6,8,6,14,8,2,11,8,6,11,8,2,14,8,7,10,10,14,14,12,12,2,2,12,4,9],[2,12,4,6,10,12,6,11,11,11,12,1,3,14,8,2,11,8,6,11,8,2,14,8,7,10,10,14,11,12,3,8,2,9,2,9]]];
function make(level,rng){var L=Math.max(1,Math.min(LEVELS.length,level|0||1)),e=LEVELS[L-1],W=e[0],H=e[1];
  /* a random quarter turn of the whole board for daily and reel copies (turns keep clockwise taps clockwise, so par is the same; mirrors would not) */
  var k=L===1?0:(W===H?pzInt(rng,4):2*pzInt(rng,2)),w=W,h=H,P=e[3].slice(),S=e[4].slice(),src=e[2];
  for(var q=0;q<k;q++){var P2=new Array(w*h),S2=new Array(w*h),nw=h;   /* 90 deg clockwise: (x,y) -> (h-1-y, x) on a board h wide */
    for(var c=0;c<w*h;c++){var x=c%w,y=(c/w)|0,n=x*nw+(h-1-y);P2[n]=rot(P[c],1);S2[n]=rot(S[c],1);if(c===src)var ns=n}
    P=P2;S=S2;src=ns;var t=w;w=h;h=t}
  W=w;H=h;
  var par=0;for(var c2=0;c2<W*H;c2++)par+=turnsTo(P[c2],S[c2]);
  return {level:L,title:'Level '+L,W:W,H:H,src:src,pieces:P,sol:S,par:par,parExact:true}}
window.V6AQ={rot:rot,deg:deg,turnsTo:turnsTo,masksOf:masksOf,flow:flow,solved:solved,deduce:deduce,LEVELS:LEVELS,make:make};

var CSS=''
+'.gaq{position:relative;width:100%;max-width:380px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);'
+'--gaq-stone1:#E9DDC7;--gaq-stone2:#D8C8AA;--gaq-grout:#BCA885;--gaq-dry:#B79E78;--gaq-dryin:#CDB892;--gaq-wall:#8E7552;--gaq-water:#2F8FD8;--gaq-water2:#7CC4F2;--gaq-leak:#E9A23B}'
+':root[data-theme="dark"] .gaq{--gaq-stone1:#4A4032;--gaq-stone2:#3B3327;--gaq-grout:#2A241B;--gaq-dry:#6E5E45;--gaq-dryin:#241E16;--gaq-wall:#B89C70;--gaq-water:#3A9BE6;--gaq-water2:#8ED0FA}'
+'.gaq-b{position:relative;width:100%;border-radius:18px;padding:1.5%;box-sizing:border-box;background:var(--gaq-grout);box-shadow:inset 0 0 0 3px rgba(0,0,0,.12),0 8px 20px rgba(60,40,10,.18);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.gaq-g{display:grid;gap:2px}'
+'.gaq-c{position:relative;aspect-ratio:1;border-radius:9px;background:linear-gradient(150deg,var(--gaq-stone1),var(--gaq-stone2));box-shadow:inset 0 2px 0 rgba(255,255,255,.35),inset 0 -2px 0 rgba(0,0,0,.08);cursor:pointer;overflow:visible}'
+':root[data-theme="dark"] .gaq-c{box-shadow:inset 0 2px 0 rgba(255,255,255,.06),inset 0 -2px 0 rgba(0,0,0,.25)}'
+'.gaq-c.pr{scale:.94;transition:scale .06s ease-out}'
+'.gaq-c:focus-visible{outline:3px solid var(--ink);outline-offset:1px;z-index:2}'
+'.gaq-c svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}'
+'.gaq-p{transform-origin:50px 50px;transform-box:view-box}'
+'.gaq-p .o{stroke:var(--gaq-wall);stroke-width:30;stroke-linecap:round;fill:none}'
+'.gaq-p .i{stroke:var(--gaq-dryin);stroke-width:18;stroke-linecap:round;fill:none;transition:stroke .18s}'
+'.gaq-p .w{stroke:var(--gaq-water2);stroke-width:8;stroke-linecap:round;fill:none;stroke-dasharray:6 10;opacity:0;transition:opacity .2s}'
+'.gaq-c.wet .gaq-p .i{stroke:var(--gaq-water)}.gaq-c.wet .gaq-p .w{opacity:.9;animation:aqflow .9s linear infinite}'
+'@keyframes aqflow{to{stroke-dashoffset:-16}}'
+'.gaq-hub{fill:var(--gaq-dryin);stroke:var(--gaq-wall);stroke-width:6}.gaq-c.wet .gaq-hub{fill:var(--gaq-water)}'
+'.gaq-src circle.r{fill:none;stroke:var(--gaq-water2);stroke-width:4;animation:aqrip 1.6s ease-out infinite;transform-origin:50px 50px;transform-box:view-box}'
+'@keyframes aqrip{0%{transform:scale(.5);opacity:.9}100%{transform:scale(1.25);opacity:0}}'
+'.gaq-fo .bowl{fill:var(--gaq-stone1);stroke:var(--gaq-wall);stroke-width:6}.gaq-fo .pool{fill:var(--gaq-dryin);transition:fill .2s}.gaq-c.wet .gaq-fo .pool{fill:var(--gaq-water)}.gaq-fo .drop{fill:var(--gaq-wall);opacity:.7}.gaq-c.wet .gaq-fo .drop{opacity:0}'
+'.gaq-fo .jet{fill:var(--gaq-water2);opacity:0;transform-origin:50px 50px;transform-box:view-box}'
+'.gaq-c.wet .gaq-fo .jet{opacity:1;animation:aqjet 1.1s ease-in-out infinite}'
+'@keyframes aqjet{0%,100%{transform:translateY(0) scale(1,.8)}50%{transform:translateY(-6px) scale(1,1.15)}}'
+'.gaq-leak{fill:var(--gaq-leak);opacity:0}.gaq-c.wet .gaq-leak.on{opacity:1;animation:aqdrip .8s ease-in infinite}'
+'@keyframes aqdrip{0%{transform:translate(0,0);opacity:1}100%{transform:translate(var(--lx),var(--ly));opacity:0}}'
+'.gaq-top{display:flex;align-items:center;justify-content:center;gap:10px;min-height:34px}'
+'.zk-rm .gaq-c.wet .gaq-p .w,.zk-rm .gaq-src circle.r,.zk-rm .gaq-c.wet .gaq-fo .jet,.zk-rm .gaq-c.wet .gaq-leak.on{animation:none}'
+'@media (prefers-reduced-motion:reduce){.gaq-c.wet .gaq-p .w,.gaq-src circle.r,.gaq-c.wet .gaq-fo .jet,.gaq-c.wet .gaq-leak.on{animation:none}}';
var ARM=['M50 50V-2','M50 50H102','M50 50V102','M50 50H-2'];

function mount(root,inst,api){ZK.css(CSS,'gaq-css');root.textContent='';
  var W=inst.W,H=inst.H,N=W*H,rm=ZK.rm(api),M=inst.pieces.slice(),hist=[],hints=0,fin=false,ghost=null,idle=null,offs=[],wet={},spin=[],last=null,pend=[];
  var stage=document.createElement('div');stage.className='gaq zk-stage zk-host'+(rm?' zk-rm':'');
  var top=document.createElement('div');top.className='gaq-top';
  var FOUNT='<svg viewBox="0 0 20 20"><path d="M4 12h12l-2 5H6z" fill="#2F8FD8" stroke="#1B4F7A" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 11V4M7 6l3-3 3 3" fill="none" stroke="#2F8FD8" stroke-width="2" stroke-linecap="round"/></svg>';
  var nF=0;for(var c0=0;c0<N;c0++)if(deg(M[c0])===1&&c0!==inst.src)nF++;
  var ctr=ZK.counter({icon:FOUNT,label:function(n){return n+' dry fountain'+(n===1?'':'s')}});
  var pips=ZK.pips(inst.par);top.appendChild(ctr.el);
  var board=document.createElement('div');board.className='gaq-b zk-board';
  var grid=document.createElement('div');grid.className='gaq-g';grid.style.gridTemplateColumns='repeat('+W+',1fr)';board.appendChild(grid);
  stage.appendChild(top);stage.appendChild(board);stage.appendChild(pips.el);root.appendChild(stage);
  /* fit: a 6-wide board at 320 px keeps cells >= 44 px; the board never grows past the width */
  var cells=[],grp=[],leakEls=[],ang=[];
  for(var c=0;c<N;c++){var ce=document.createElement('div');ce.className='gaq-c zk-p';ce.setAttribute('data-zkc','');ce.setAttribute('role','button');ce.tabIndex=c===0?0:-1;ce.dataset.i=c;
    var base=inst.pieces[c],isF=deg(base)===1&&c!==inst.src,isS=c===inst.src,s='<svg viewBox="0 0 100 100">';
    /* the piece is drawn in its as-given orientation, and turned with a CSS rotation (ang = quarter turns since the start) */
    s+='<g class="gaq-p">';var path='';for(var d=0;d<4;d++)if(base&(1<<d))path+=ARM[d];
    s+='<path class="o" d="'+path+'"/><path class="i" d="'+path+'"/><path class="w" d="'+path+'"/>';
    
    for(var d2=0;d2<4;d2++)if(base&(1<<d2)){var lx=DX[d2]*16,ly=DY[d2]*16+(d2===0?0:6);s+='<circle class="gaq-leak" data-d="'+d2+'" cx="'+(50+DX[d2]*46)+'" cy="'+(50+DY[d2]*46)+'" r="6" style="--lx:'+lx+'px;--ly:'+(ly+10)+'px"/>'}
    s+='</g>';
    if(isF)s+='<g class="gaq-fo"><path class="jet" d="M45 30q5-20 10 0z"/><rect class="bowl" x="27" y="31" width="46" height="40" rx="11"/><rect class="pool" x="35" y="39" width="30" height="24" rx="6"/><path class="drop" d="M50 42q-6 8-6 12a6 6 0 0 0 12 0q0-4-6-12z"/></g>';
    if(isS)s+='<g class="gaq-src"><circle cx="50" cy="50" r="17" fill="var(--gaq-water)" stroke="var(--gaq-wall)" stroke-width="5"/><circle class="r" cx="50" cy="50" r="22"/><path d="M43 50q7-9 14 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>';
    s+='</svg>';ce.innerHTML=s;grid.appendChild(ce);cells.push(ce);grp.push(ce.querySelector('.gaq-p'));leakEls.push([].slice.call(ce.querySelectorAll('.gaq-leak')));ang.push(0)}
  function setAng(c,animFrom){var g=grp[c];g.style.transform='rotate('+ang[c]*90+'deg)';
    if(animFrom!=null&&!rm)ZK.anim(g,[{transform:'rotate('+animFrom*90+'deg)'},{transform:'rotate('+(ang[c]*90+8*(ang[c]>animFrom?1:-1))+'deg)',offset:.7},{transform:'rotate('+ang[c]*90+'deg)'}],200,'cubic-bezier(.3,.7,.4,1)')}
  function water(rush,from){var f=flow(W,H,M,inst.src),nw=f.wet,newly=[];
    for(var c=0;c<N;c++){var on=!!nw[c];if(on&&!wet[c])newly.push(c);if(!on)cells[c].classList.remove('wet')}
    pend.forEach(function(t){clearTimeout(t)});pend=[];
    var d0=from!=null&&f.dist[from]!=null?f.dist[from]:0;
    for(var c=0;c<N;c++)if(nw[c]){(function(c){var isNew=!wet[c],dl=(rush&&isNew&&!rm)?Math.max(0,(f.dist[c]-d0))*55+60:0;
        if(dl)pend.push(setTimeout(function(){cells[c].classList.add('wet');if(deg(inst.pieces[c])===1&&c!==inst.src){ZK.sfx('cap',{n:Math.min(6,f.dist[c]>>1)});ZK.buzz('tap')}},dl));else cells[c].classList.add('wet')})(c)}
    /* leaks: an open end on a watered piece drips; the end is in board directions, the drops are drawn in the piece's own frame */
    var L={};f.leaks.forEach(function(l){(L[l[0]]=L[l[0]]||{})[l[1]]=1});
    for(var c=0;c<N;c++)leakEls[c].forEach(function(e){var dPiece=+e.dataset.d,dBoard=(dPiece+ang[c])%4;e.classList.toggle('on',!!(L[c]&&L[c][dBoard]))});
    var dry=0;for(var c=0;c<N;c++)if(deg(inst.pieces[c])===1&&c!==inst.src&&!nw[c])dry++;
    ctr.set(dry,!rush);wet=nw;label(f);return f}
  function label(f){board.setAttribute('aria-label','Aqueduct, '+W+' by '+H+'. '+f.order.length+' of '+N+' pieces carry water, '+f.leaks.length+' leak'+(f.leaks.length===1?'':'s')+'.')
    for(var c=0;c<N;c++){var m=M[c],dirs=['north','east','south','west'].filter(function(_,d){return m&(1<<d)}).join(' and ');
      cells[c].setAttribute('aria-label','Row '+((c/W|0)+1)+', column '+(c%W+1)+(c===inst.src?', the spring':'')+(deg(inst.pieces[c])===1&&c!==inst.src?', fountain':'')+': opens '+dirs+(f.wet[c]?', wet':', dry'))}}
  function turn(c,quiet){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    var from=ang[c];ang[c]++;M[c]=rot(M[c],1);hist.push(c);last=c;api.moved();pips.set(hist.length);setAng(c,from);
    ZK.sfx('click',{p:2});ZK.buzz('tap');var f=water(true,c);
    if(f.order.length===N&&!f.leaks.length){fin=true;if(api.say)api.say('Every fountain runs.');
      var far=0;f.order.forEach(function(q){far=Math.max(far,f.dist[q])});
      setTimeout(function(){ZK.sfx('pour',{d:.5});var g=ZK.at(board,cells[inst.src]);ZK.burst(board,g.x,g.y,{n:12,r:50,colors:['#2F8FD8','#7CC4F2','#fff']});
        api.done({solved:true,moves:hist.length,hints:hints,extra:{par:inst.par}})},rm?0:Math.min(380,far*30+140))}}
  function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  L(grid,'pointerdown',function(e){var t=e.target.closest&&e.target.closest('.gaq-c');if(t){t.classList.add('pr');ZK.sfx('press')}});
  function unpress(){[].forEach.call(grid.querySelectorAll('.gaq-c.pr'),function(t){t.classList.remove('pr')})}
  L(grid,'pointerup',unpress);L(grid,'pointercancel',unpress);L(grid,'pointerleave',unpress);
  L(grid,'click',function(e){var t=e.target.closest&&e.target.closest('.gaq-c');if(!t||!grid.contains(t))return;turn(+t.dataset.i)});
  L(grid,'keydown',function(e){var a=document.activeElement,c=a&&a.dataset&&a.dataset.i!=null?+a.dataset.i:0,n=c;
    if(e.key==='ArrowRight')n=Math.min(N-1,c+1);else if(e.key==='ArrowLeft')n=Math.max(0,c-1);else if(e.key==='ArrowDown')n=Math.min(N-1,c+W);else if(e.key==='ArrowUp')n=Math.max(0,c-W);
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();turn(c);return}else return;e.preventDefault();cells[c].tabIndex=-1;cells[n].tabIndex=0;cells[n].focus()});
  for(var c3=0;c3<N;c3++)setAng(c3);water(false);
  /* level 1: the ghost taps the one wrong piece next to the water, and the real turn preview plays (the piece turns, then turns back) */
  if(inst.level===1){var g0=-1,f0=flow(W,H,M,inst.src);for(var c4=0;c4<N&&g0<0;c4++)if(turnsTo(M[c4],inst.sol[c4])>0&&!f0.wet[c4])g0=c4;
    if(g0<0)for(var c5=0;c5<N&&g0<0;c5++)if(turnsTo(M[c5],inst.sol[c5])>0)g0=c5;
    if(g0>=0)ghost=ZK.ghost(stage,[{tap:cells[g0],down:function(){ZK.anim(grp[g0],[{transform:'rotate('+ang[g0]*90+'deg)'},{transform:'rotate('+(ang[g0]*90+90)+'deg)',offset:.5},{transform:'rotate('+ang[g0]*90+'deg)'}],700)}}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  var DED=null;function ded(){if(!DED)DED=deduce(W,H,inst.pieces);return DED}
  function undo(){if(fin||!hist.length)return false;var c=hist.pop(),from=ang[c];ang[c]--;M[c]=rot(M[c],3);pips.set(hist.length);setAng(c,from);water(false);last=hist.length?hist[hist.length-1]:null;ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true}
  return{undo:undo,
    restart:function(){if(fin)return;M=inst.pieces.slice();hist=[];for(var c=0;c<N;c++){ang[c]=0;setAng(c)}pips.set(0);water(false);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;ZK.unmark(stage);var d=ded(),tr=d.trace||[],pick=null;
      for(var i=0;i<tr.length;i++){var c=tr[i].c;if(M[c]!==inst.sol[c]){pick=tr[i];break}}
      if(!pick){for(var c2=0;c2<N;c2++)if(M[c2]!==inst.sol[c2]){pick={c:c2,rule:'edge'};break}}
      if(!pick)return null;hints++;
      if(lv<=1)return pick.rule==='ring'?'One piece here would close a ring of pipe. Water must branch, never loop.':'Look at the edges: no pipe may point off the board, and touching ends must meet.';
      if(lv===2){ZK.mark(cells[pick.c]);return pick.rule==='ring'?'This piece: one way closes a ring.':'This piece has only one way that fits.'}
      var k=turnsTo(M[pick.c],inst.sol[pick.c]);for(var j=0;j<k;j++)turn(pick.c);return 'Turned it for you.'},
    destroy:function(){pend.forEach(function(t){clearTimeout(t)});if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last!=null?cells[last]:cells[inst.src]},
    moves:function(){return hist.length},
    state:function(){return{M:M.slice(),moves:hist.length,fin:fin,wet:Object.keys(wet).length,N:N}}}}

ZK.override({id:ID,name:'Aqueduct',family:'logic',theme:'F7',blurb:'Turn the pipes until water reaches every fountain.',
  how:'Tap a pipe to turn it. Bring water from the spring to every fountain. No leaks, no loops.',
  areas:['logic','space'],levels:LEVELS.length||20,secs:90,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;var s=m<=p+2?3:m<=Math.ceil(p*1.3)+2?2:1;if(res.hints&&s===3)s=2;
    return{stars:s,line:'Water everywhere in '+m+' turn'+(m===1?'':'s')+'. The fewest is '+p+'.'+(res.hints?' With a hint.':'')}}});
})();
