/* Zest v6 new puzzle: Sun Mirrors (batch e, 7 Nov 2026). Design note: Docs/v6/pilots/sun-mirrors.md.
   Tap a mirror to turn it a quarter (/ <-> \). The sun's beam redraws at once. Light every signal tower and never the camp.
   The beam passes through towers, stops at rocks and at the camp, and bounces off both faces of a mirror.
   Levels are curated by tests/gen_sun_mirrors.js: exactly one beam route wins (brute force over all 2^k settings), par = mirrors on that route that
   start the wrong way, the greedy player fails from level 4, and from level 6 each route has a trap or a mirror used twice.
   No dead ends exist (every setting can be turned back), so there is no stuck chip; lighting the camp is shown at once (amber, kind). */
(function(){
var ID='sun-mirrors',DX=[0,1,0,-1],DY=[-1,0,1,0],SL={0:1,1:0,2:3,3:2},BS={0:3,3:0,1:2,2:1},SUNS='^>v<';
var LEVELS=[[4,4,"#....T......./.<",1],[4,5,".T..#...\\/......^...",1],[5,5,"......\\.\\..T....\\..C..#^.",2],[5,5,"/C/.vT..#T..........\\...\\",2],[5,5,"..\\.#...#C#\\.T/./T.\\....^",3],[5,6,"C\\/.<.T.........T..#//\\...#..\\",3],[5,6,".....//\\.#...#...T..CT/\\..^.C\\",2],[6,6,"C..v..T/\\T.......\\\\T./../\\.....#.#..",4],[6,6,"#.\\#.#T.\\...C.....\\T\\/.#///....^....",4],[6,6,"..C..#.............\\\\T/../..T<#/\\T\\\\",5],[6,6,".#v\\./..T....#.../...C/./.\\.T./T..\\.",3],[6,6,"/..v.\\./T\\..\\.\\\\..../.T..C.T#....^#.",4],[6,6,"vC..\\.T.\\./</.T.\\/....\\...T./.#C\\#..",5],[6,7,"C\\\\T.<.T........//......./T/...#//./..#..#",5],[6,7,".....#....\\/.....T../\\T..C.\\/\\...T.#/\\T\\^.",6],[6,6,"..../\\...C\\..##\\T.>T/.../..\\C.^.\\T/.",4],[6,7,"/v....>T/....\\\\.T/.C\\T.\\/........#.#.T\\\\..",6],[6,7,"v/C....T\\..#//\\.#../T.T//./T.\\#......\\....",7],[6,7,"C.\\.#..\\T\\.<..../.\\../T\\../T.\\>....//..#.T",6],[6,7,"/\\.T/../T../....T...\\...#C#..T>/C.//C\\\\/.^",7],[6,7,"./.\\#./.....\\.....\\T.//.T\\..T<\\\\T\\...C...#",5],[6,7,"./T/...C.T//#\\C.T.#../\\/>..T\\#/C....>/\\...",7],[6,7,"....\\#...\\..\\./.../T//C\\/.T\\.T.\\\\..#./T..<",8],[6,7,"/../T./\\/../>\\.#..#CT\\\\....T..>/T..#C///..",8]]; /*LEVELS*/
function isM(ch){return ch==='/'||ch==='\\'}
/* trace every sun's beam. Returns {beams:[{pts:[[x,y]..], ev:[{c,kind,d}]}], lit:{cell:1}, camp:cell|-1, hits:{mirrorCell:count}, cells:[...]} */
function trace(W,H,g){var out={beams:[],lit:{},camp:-1,campHit:[],hits:{},cells:[]};
  for(var i=0;i<W*H;i++){var sd=SUNS.indexOf(g[i]);if(sd<0)continue;
    var x=i%W,y=(i/W)|0,d=sd,pts=[[x+.5,y+.5]],ev=[],steps=0,len=0;
    while(steps++<500){var nx=x+DX[d],ny=y+DY[d];
      if(nx<0||ny<0||nx>=W||ny>=H){pts.push([x+.5+DX[d]*.5,y+.5+DY[d]*.5]);break}
      x=nx;y=ny;var c=y*W+x,ch=g[c];out.cells.push(c);
      if(ch==='#'||SUNS.indexOf(ch)>=0){pts.push([x+.5-DX[d]*.32,y+.5-DY[d]*.32]);ev.push({c:c,kind:'stop'});break}
      if(ch==='C'){pts.push([x+.5,y+.5]);ev.push({c:c,kind:'camp'});out.camp=c;out.campHit.push(c);break}
      if(ch==='T'){out.lit[c]=1;ev.push({c:c,kind:'tower',at:[x+.5,y+.5]});continue}
      if(ch==='/'||ch==='\\'){d=ch==='/'?SL[d]:BS[d];pts.push([x+.5,y+.5]);out.hits[c]=(out.hits[c]||0)+1;ev.push({c:c,kind:'mirror',d:d})}}
    out.beams.push({sun:i,pts:pts,ev:ev})}
  return out}
function towers(g){var t=[];for(var i=0;i<g.length;i++)if(g[i]==='T')t.push(i);return t}
function won(W,H,g){var r=trace(W,H,g);if(r.camp>=0)return false;var t=towers(g);for(var i=0;i<t.length;i++)if(!r.lit[t[i]])return false;return true}
function usedMirrors(W,H,g){var r=trace(W,H,g);return Object.keys(r.hits).map(Number).sort(function(a,b){return a-b})}
function sig(W,H,g){return usedMirrors(W,H,g).map(function(c){return c+g[c]}).join(',')}
function mirrorsOf(g){var m=[];for(var i=0;i<g.length;i++)if(isM(g[i]))m.push(i);return m}
function solveAll(W,H,g){g=g.slice?g.slice():g.split('');if(typeof g==='string')g=g.split('');var mir=mirrorsOf(g),k=mir.length,wins=[],n=0;
  for(var b=0;b<(1<<k);b++){var h=g.slice();for(var j=0;j<k;j++)h[mir[j]]=(b>>j)&1?'\\':'/';if(won(W,H,h)){wins.push({set:mir.map(function(c){return h[c]}),sig:sig(W,H,h)})}n++}
  return{wins:wins,n:n,mir:mir}}
function score(W,H,g){var r=trace(W,H,g),t=towers(g),n=0;t.forEach(function(c){if(r.lit[c])n++});return n-(r.camp>=0?100:0)}
function greedy(W,H,g,lim){g=g.slice();var mir=mirrorsOf(g);for(var it=0;it<lim;it++){if(won(W,H,g))return true;var s0=score(W,H,g),best=null,bs=s0;
    for(var j=0;j<mir.length;j++){var h=g.slice();h[mir[j]]=h[mir[j]]==='/'?'\\':'/';var s=score(W,H,h);if(s>bs){bs=s;best=h}}
    if(!best)return false;g=best}return won(W,H,g)}
/* the unique route, par, and the aha features of a level */
function analyse(W,H,gs){var g=typeof gs==='string'?gs.split(''):gs.slice(),r=solveAll(W,H,g),sigs={};r.wins.forEach(function(w){sigs[w.sig]=1});
  var keys=Object.keys(sigs),res={unique:keys.length===1,wins:r.wins.length,winFrac:r.wins.length/r.n,par:-1,sol:null,greedy:false,trap:false,shared:false};
  if(!keys.length)return res;
  var sol={};keys[0].split(',').forEach(function(t){if(t)sol[+t.slice(0,-1)]=t.slice(-1)});res.sol=sol;
  var par=0;Object.keys(sol).forEach(function(c){if(g[c]!==sol[c])par++});res.par=par;
  res.greedy=greedy(W,H,g,3*r.mir.length+2);
  var sg=g.slice();Object.keys(sol).forEach(function(c){sg[c]=sol[c]});var st=trace(W,H,sg);
  Object.keys(st.hits).forEach(function(c){if(st.hits[c]>=2)res.shared=true});
  /* trap: at the start a wrong mirror on the beam already sends the light through a tower */
  var t0=trace(W,H,g);t0.beams.forEach(function(b){var cur=null;b.ev.forEach(function(e){if(e.kind==='mirror')cur=(sol[e.c]&&sol[e.c]!==g[e.c])?e.c:null;else if(e.kind==='tower'&&cur!=null)res.trap=true})});
  return res}
window.V6SM={LEVELS:LEVELS,trace:trace,won:won,usedMirrors:usedMirrors,sig:sig,solveAll:solveAll,analyse:analyse,greedy:greedy,make:make};
function make(level){var n=LEVELS.length,L=Math.max(1,Math.min(n,level|0||1)),e=LEVELS[L-1],a=analyse(e[0],e[1],e[2]);
  return{level:L,title:'Level '+L,W:e[0],H:e[1],g:e[2],par:a.par,parExact:true,sol:a.sol}}

var CSS=''
+'.zsm>.zk-pips{align-self:stretch}'
+'.zsm{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);'
+'--sm-f1:#F3E7CB;--sm-f2:#E7D4AA;--sm-ln:rgba(120,88,36,.13);--sm-base:#FBF5E8;--sm-edge:#6E5A3A;--sm-rock1:#A3907B;--sm-rock2:#6C5B49;--sm-tent:#7A4A5E;--sm-tent2:#5A3245;--sm-mast:#5B4E3E;--sm-off:#B9AE9C}'
+':root[data-theme="dark"] .zsm{--sm-f1:#2C261B;--sm-f2:#221D15;--sm-ln:rgba(255,220,150,.07);--sm-base:#3A3326;--sm-edge:#C9B48C;--sm-rock1:#75644F;--sm-rock2:#463A2D;--sm-tent:#9A6680;--sm-tent2:#6E4459;--sm-mast:#CDBB98;--sm-off:#6B6252}'
+'.zsm-b{position:relative;width:100%;border-radius:20px;overflow:hidden;background:linear-gradient(160deg,var(--sm-f1),var(--sm-f2));box-shadow:inset 0 0 0 3px rgba(110,80,30,.22),0 6px 18px rgba(60,40,10,.12);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.zsm-grid{position:absolute;inset:0;background-image:linear-gradient(var(--sm-ln) 1px,transparent 1px),linear-gradient(90deg,var(--sm-ln) 1px,transparent 1px)}'
+'.zsm-c{position:absolute;display:flex;align-items:center;justify-content:center;pointer-events:none}'
+'.zsm-c svg{width:84%;height:84%;overflow:visible}'
+'.zsm-beam{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}'
+'.zsm-beam .u{stroke:#D97A00;stroke-width:.19;opacity:.75;fill:none;stroke-linecap:round;stroke-linejoin:round}'
+'.zsm-beam .g{stroke:#FFB21E;stroke-width:.4;opacity:.3;fill:none;stroke-linecap:round;stroke-linejoin:round}'
+'.zsm-beam .k{stroke:#FFF9E3;stroke-width:.085;fill:none;stroke-linecap:round;stroke-linejoin:round}'
+':root[data-theme="dark"] .zsm-beam .g{opacity:.45}'
+'.zsm-items{position:absolute;inset:0;z-index:3}'
+'.zsm-m{all:unset;position:absolute;box-sizing:border-box;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;z-index:3}'
+'.zsm-m:focus-visible{outline:3px solid var(--ink);outline-offset:-3px;border-radius:12px}'
+'.zsm-m .base{position:absolute;width:76%;height:76%;border-radius:50%;background:var(--sm-base);box-shadow:inset 0 0 0 2px var(--sm-edge),0 2px 0 rgba(0,0,0,.18)}'
+'.zsm-m .bar{position:absolute;width:88%;height:15%;border-radius:6px;background:linear-gradient(180deg,#FFFFFF,#B9C6D1 55%,#7F8F9C);box-shadow:0 0 0 2px #2D3640,0 2px 3px rgba(0,0,0,.3);transition:transform .32s cubic-bezier(.34,1.56,.64,1)}'
+'.zsm-m.hit .base{box-shadow:inset 0 0 0 2px var(--sm-edge),0 0 0 3px rgba(255,194,58,.55),0 2px 0 rgba(0,0,0,.18)}'
+'.zsm-tw .lamp{fill:var(--sm-off);transition:fill .2s}.zsm-tw .mast{stroke:var(--sm-mast)}'
+'.zsm-tw.on .lamp{fill:#FFD34E}.zsm-tw .halo{opacity:0;transition:opacity .25s}.zsm-tw.on .halo{opacity:.42}'
+'.zsm-camp.on svg{filter:drop-shadow(0 0 6px #E9A23B)}'
+'.zsm-c.zsm-sun svg{width:72%;height:72%}.zsm-sun .rays{transform-box:fill-box;transform-origin:center;animation:smspin 9s linear infinite}@keyframes smspin{to{transform:rotate(360deg)}}'
+'.zk-rm .zsm-m .bar{transition:none}.zk-rm .zsm-sun .rays{animation:none}@media (prefers-reduced-motion:reduce){.zsm-m .bar{transition:none}.zsm-sun .rays{animation:none}}';
var SVG_SUN='<svg viewBox="-12 -12 24 24"><g class="rays" stroke="#F29E0C" stroke-width="2.2" stroke-linecap="round">'
  +[0,45,90,135,180,225,270,315].map(function(a){var r=a*Math.PI/180;return '<line x1="'+(Math.cos(r)*7.6).toFixed(2)+'" y1="'+(Math.sin(r)*7.6).toFixed(2)+'" x2="'+(Math.cos(r)*10.6).toFixed(2)+'" y2="'+(Math.sin(r)*10.6).toFixed(2)+'"/>'}).join('')
  +'</g><circle r="6.2" fill="#FFC23A" stroke="#B86A00" stroke-width="1.4"/><circle r="3.4" cx="-1.4" cy="-1.6" fill="#FFF1B8" opacity=".85"/></svg>';
var SVG_TOWER='<svg viewBox="-12 -12 24 24"><circle class="halo" r="11" fill="#FFD34E" opacity=".35"/><path class="mast" d="M-5 10.5L0 -2.5L5 10.5M-3.4 6h6.8" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  +'<circle class="lamp" cy="-5.5" r="4.6" stroke="#2D2418" stroke-width="1.5"/><circle cy="-6.7" cx="-1.4" r="1.3" fill="#fff" opacity=".7"/></svg>';
var SVG_CAMP='<svg viewBox="-12 -12 24 24"><path d="M-10.5 9.5L0 -7L10.5 9.5Z" fill="var(--sm-tent)" stroke="#2A1820" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 -7L-3 9.5H3Z" fill="var(--sm-tent2)" stroke="#2A1820" stroke-width="1.2" stroke-linejoin="round"/>'
  +'<path d="M0 -7V-11.5" stroke="#2A1820" stroke-width="1.4" stroke-linecap="round"/><path d="M0 -11.5L5 -10L0 -8.5Z" fill="#E9A23B" stroke="#2A1820" stroke-width="1"/></svg>';
var SVG_ROCK='<svg viewBox="-12 -12 24 24"><path d="M-9 6C-11 1-8-6-2-8C4-10 10-6 10 1C10 7 5 9.5-1 9.5C-5 9.5-8 8.5-9 6Z" fill="var(--sm-rock1)" stroke="#2A2218" stroke-width="1.4"/><path d="M-6 0C-5-4-2-6 2-6" stroke="rgba(255,255,255,.35)" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';

function mount(root,inst,api){ZK.css(CSS,'zsm-css');root.textContent='';
  var W=inst.W,H=inst.H,g=inst.g.split(''),rm=ZK.rm(api),hist=[],hints=0,undos=0,fin=false,ghost=null,idle=null,timers=[],cur=null,mEls={},rot={},prevPts=[];
  var stage=document.createElement('div');stage.className='zsm zk-stage zk-host'+(rm?' zk-rm':'');
  var pips=ZK.pips(inst.par);
  var board=document.createElement('div');board.className='zsm-b zk-board';board.style.aspectRatio=W+' / '+H;board.setAttribute('role','group');
  var grid=document.createElement('div');grid.className='zsm-grid';grid.style.backgroundSize=(100/W)+'% '+(100/H)+'%';board.appendChild(grid);
  var NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('class','zsm-beam');svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.setAttribute('preserveAspectRatio','none');board.appendChild(svg);
  var items=document.createElement('div');items.className='zsm-items';board.appendChild(items);
  var pw=100/W,ph=100/H,tEls={},campEls={},sunEls=[];
  function box(el,i){el.style.left=(i%W)*pw+'%';el.style.top=((i/W)|0)*ph+'%';el.style.width=pw+'%';el.style.height=ph+'%'}
  function where(i){return 'row '+(((i/W)|0)+1)+', column '+(i%W+1)}
  for(var i=0;i<W*H;i++){var ch=g[i];if(ch==='.')continue;
    if(isM(ch)){var b=document.createElement('button');b.type='button';b.className='zsm-m zk-p';b.setAttribute('data-zkc','');b.setAttribute('data-cell',i);
      b.innerHTML='<i class="base"></i><i class="bar"></i>';box(b,i);rot[i]=ch==='/'?-45:45;b.querySelector('.bar').style.transform='rotate('+rot[i]+'deg)';
      (function(i){b.addEventListener('click',function(){tap(i)})})(i);items.appendChild(b);mEls[i]=b;continue}
    var c=document.createElement('div');c.className='zsm-c';c.setAttribute('data-zkc','');box(c,i);
    if(SUNS.indexOf(ch)>=0){c.classList.add('zsm-sun');c.innerHTML=SVG_SUN;sunEls.push(c)}
    else if(ch==='T'){c.classList.add('zsm-tw');c.innerHTML=SVG_TOWER;tEls[i]=c}
    else if(ch==='C'){c.classList.add('zsm-camp');c.innerHTML=SVG_CAMP;campEls[i]=c}
    else if(ch==='#'){c.innerHTML=SVG_ROCK}
    items.appendChild(c)}
  stage.appendChild(pips.el);stage.appendChild(board);root.appendChild(stage);
  var nT=Object.keys(tEls).length;
  function T(fn,ms){var t=setTimeout(fn,ms);timers.push(t);return t}
  function clearT(){timers.forEach(clearTimeout);timers=[]}
  function plen(p){var l=0;for(var i=1;i<p.length;i++)l+=Math.abs(p[i][0]-p[i-1][0])+Math.abs(p[i][1]-p[i-1][1]);return l}
  /* distance along a beam's points to a point that lies on it */
  function along(p,q){var l=0;for(var i=1;i<p.length;i++){var a=p[i-1],b=p[i];
      var onx=a[1]===b[1]&&Math.abs(q[1]-a[1])<1e-6&&q[0]>=Math.min(a[0],b[0])-1e-6&&q[0]<=Math.max(a[0],b[0])+1e-6,
          ony=a[0]===b[0]&&Math.abs(q[0]-a[0])<1e-6&&q[1]>=Math.min(a[1],b[1])-1e-6&&q[1]<=Math.max(a[1],b[1])+1e-6;
      if(onx||ony)return l+Math.abs(q[0]-a[0])+Math.abs(q[1]-a[1]);l+=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1])}return l}
  function common(a,b){if(!a)return 0;var l=0;for(var i=1;i<Math.min(a.length,b.length);i++){if(a[i-1][0]!==b[i-1][0]||a[i-1][1]!==b[i-1][1])break;
      var sameDir=Math.sign(a[i][0]-a[i-1][0])===Math.sign(b[i][0]-b[i-1][0])&&Math.sign(a[i][1]-a[i-1][1])===Math.sign(b[i][1]-b[i-1][1]);if(!sameDir)break;
      var la=Math.abs(a[i][0]-a[i-1][0])+Math.abs(a[i][1]-a[i-1][1]),lb=Math.abs(b[i][0]-b[i-1][0])+Math.abs(b[i][1]-b[i-1][1]);l+=Math.min(la,lb);if(la!==lb||a[i][0]!==b[i][0]||a[i][1]!==b[i][1])break}return l}
  var litNow={},campNow={};
  /* draw the beams; the part that changed grows from the point where it left the old route; towers and the camp react when the light gets there */
  function draw(animate,fast){var r=trace(W,H,g);cur=r;svg.textContent='';var maxEnd=0;
    Object.keys(mEls).forEach(function(c){mEls[c].classList.toggle('hit',!!r.hits[c])});
    var newLit={},newCamp={};
    r.beams.forEach(function(bm,k){var pts=bm.pts,L=plen(pts),c0=animate?common(prevPts[k],pts):L,str=pts.map(function(p){return p[0].toFixed(3)+','+p[1].toFixed(3)}).join(' ');
      var gl=document.createElementNS(NS,'polyline'),un=document.createElementNS(NS,'polyline'),co=document.createElementNS(NS,'polyline');gl.setAttribute('class','g');un.setAttribute('class','u');co.setAttribute('class','k');[gl,un,co].forEach(function(e){e.setAttribute('points',str);svg.appendChild(e)});
      var per=fast?Math.min(26,230/Math.max(.5,L-c0)):30,dur=Math.max(0,(L-c0)*per);
      if(animate&&!rm&&L-c0>1e-3){[gl,un,co].forEach(function(el){el.style.strokeDasharray=L+' '+L;var a=el.animate([{strokeDashoffset:L-c0},{strokeDashoffset:0}],{duration:dur,easing:'linear',fill:'none'});a.onfinish=function(){el.style.strokeDasharray=''}})}
      bm.ev.forEach(function(e){var at=e.kind==='tower'?e.at:e.kind==='camp'?[e.c%W+.5,((e.c/W)|0)+.5]:null;if(!at)return;var dist=along(pts,at),delay=animate&&!rm?Math.max(0,(dist-c0)*per):0;
        if(e.kind==='tower')newLit[e.c]=Math.min(newLit[e.c]==null?1e9:newLit[e.c],delay);else newCamp[e.c]=delay;maxEnd=Math.max(maxEnd,delay)});
      maxEnd=Math.max(maxEnd,dur)});
    prevPts=r.beams.map(function(b){return b.pts});
    var order=0;Object.keys(newLit).sort(function(a,b){return newLit[a]-newLit[b]}).forEach(function(c){var was=litNow[c];
      T(function(){tEls[c].classList.add('on');if(!was&&animate){ZK.sfx('cap',{n:Math.min(8,order++)});ZK.anim(tEls[c],[{transform:'scale(1)'},{transform:'scale(1.22)'},{transform:'scale(1)'}],300,ZK.SPRING)}},newLit[c])});
    Object.keys(tEls).forEach(function(c){if(!(c in newLit))tEls[c].classList.remove('on')});
    Object.keys(campEls).forEach(function(c){if(c in newCamp){var was=campNow[c];T(function(){campEls[c].classList.add('on');if(!was&&animate)ZK.wrong(campEls[c])},newCamp[c])}else campEls[c].classList.remove('on')});
    litNow={};Object.keys(newLit).forEach(function(c){litNow[c]=1});campNow={};Object.keys(newCamp).forEach(function(c){campNow[c]=1});
    label();return maxEnd}
  function label(){var n=Object.keys(litNow).length;board.setAttribute('aria-label','Sun Mirrors board, '+W+' by '+H+'. '+n+' of '+nT+' towers lit'+(Object.keys(campNow).length?', and the camp is lit.':'.')+' Tap a mirror to turn it.')}
  function turn(i,dir){rot[i]+=dir*90;g[i]=g[i]==='/'?'\\':'/';var bar=mEls[i].querySelector('.bar');bar.style.transform='rotate('+rot[i]+'deg)';
    mEls[i].setAttribute('aria-label','Mirror at '+where(i)+', leaning '+(g[i]==='/'?'right':'left'))}
  function tap(i){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);clearT();
    turn(i,1);hist.push(i);api.moved();pips.set(hist.length);ZK.sfx('click',{p:hist.length%6});ZK.buzz('tap');
    var w=won(W,H,g),end=draw(true,w);
    if(w){fin=true;T(function(){ZK.sfx('drop');ZK.buzz('pop');Object.keys(tEls).forEach(function(c,k){var p=ZK.at(board,tEls[c]);ZK.burst(board,p.x,p.y,{n:6,r:26,colors:['#FFD34E','#FFF3C4','#F29E0C']})});
        api.say('Every tower is lit.');T(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:90)},end+40)}}
  Object.keys(mEls).forEach(function(c){mEls[c].setAttribute('aria-label','Mirror at '+where(+c)+', leaning '+(g[c]==='/'?'right':'left'))});
  draw(false);
  /* level 1: the ghost taps the one mirror that matters */
  if(inst.level===1){var wrongM=Object.keys(inst.sol||{}).filter(function(c){return g[c]!==inst.sol[c]})[0];
    if(wrongM!=null&&mEls[wrongM])ghost=ZK.ghost(stage,[{tap:mEls[wrongM]}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  /* the first mirror (in beam order) that is wrong now; else any wrong one on the route */
  function firstWrong(){var sol=inst.sol||{},seen=null;
    (cur?cur.beams:[]).forEach(function(b){b.ev.forEach(function(e){if(seen==null&&e.kind==='mirror'&&sol[e.c]&&sol[e.c]!==g[e.c])seen=e.c})});
    if(seen==null)Object.keys(sol).forEach(function(c){if(seen==null&&sol[c]!==g[c])seen=+c});return seen}
  function undo(){if(fin||!hist.length)return false;clearT();var i=hist.pop();turn(i,-1);undos++;pips.set(hist.length);draw(true);ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true}
  return{undo:undo,
    restart:function(){if(fin)return;clearT();while(hist.length){var i=hist.pop();turn(i,-1)}pips.set(0);draw(true);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;ZK.unmark(stage);var c=firstWrong();if(c==null)return null;hints++;
      if(lv<=1){var onBeam=cur&&cur.hits[c];var dark=Object.keys(tEls).filter(function(t){return !litNow[t]});
        if(onBeam){ZK.mark(mEls[c]);return 'The light goes the wrong way here.'}
        ZK.mark(dark.length?tEls[dark[0]]:mEls[c]);return dark.length?'Trace back from this tower: where must the light come from?':'Keep the light off the camp.'}
      if(lv===2){ZK.mark(mEls[c]);return 'Turn this mirror.'}
      tap(c);return 'Turned it for you.'},
    destroy:function(){clearT();if(ghost)ghost.stop();if(idle)idle.stop();root.textContent=''},
    lastEl:function(){var t=Object.keys(tEls);return t.length?tEls[t[t.length-1]]:board},
    state:function(){return{g:g.join(''),moves:hist.length,fin:fin,lit:Object.keys(litNow).length,towers:nT,camp:Object.keys(campNow).length>0}}}}

ZK.override({id:ID,name:'Sun Mirrors',family:'grid',blurb:'Turn mirrors so the sun lights every tower.',
  how:'Tap a mirror to turn it. Bounce the sunlight through every tower. Keep it off the camp.',
  areas:['space','logic'],levels:LEVELS.length||24,secs:60,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'Every tower lit in '+m+' turn'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
