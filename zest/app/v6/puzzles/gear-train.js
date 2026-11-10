/* Zest v6 new puzzle: Gear Train (batch e, 7 Nov 2026). Design note: Docs/v6/pilots/gear-train.md.
   Drag gears from the tray onto pegs. Two gears mesh when their rims just touch (the peg gap equals the two radii); gears that would overlap do not
   fit. The gold drive turns all the time; every mesh turns the next gear the other way, and a smaller gear turns faster. Make each dial hand turn the
   way and at the speed its orange (ghost) hand shows. Three gears meshed in a ring jam, and then nothing turns.
   Sizes in half-units: small r=2 (8 teeth), medium r=3 (12), large r=4 (16). Speed of a gear = drive speed x drive radius / its radius.
   Levels are curated by tests/gen_gear_train.js: every placement the tray allows is checked; exactly one placement with the fewest gears wins
   (par = gears placed), and from level 3 some placement that connects the drive to the dial with no more gears turns it the wrong way or speed.
   No dead ends: a gear can always be lifted off again, so there is no stuck chip. A gear that would overlap another is refused at once (kind). */
(function(){
var ID='gear-train',RAD=[0,2,3,4],SN=['','small','medium','large'],TEETH=[0,8,12,16];
var LEVELS=[{"W":10.4,"H":12.596,"pegs":[[6.7,8.896],[3.7,3.7]],"drive":0,"dsize":2,"outs":[{"p":1,"dir":-1,"sp":1}],"tray":[0,1,0],"sol":[2,2],"par":1},{"W":11.73,"H":13.9,"pegs":[[6.03,11.164],[8.03,7.7],[8.03,3.7],[3.7,10.2]],"drive":0,"dsize":1,"outs":[{"p":2,"dir":1,"sp":1}],"tray":[2,1,0],"sol":[1,1,1,0],"par":2},{"W":16.4,"H":15.4,"pegs":[[10.7,10.7],[4.7,10.7],[7.7,5.504],[4.7,4.7],[11.7,5.504]],"drive":0,"dsize":1,"outs":[{"p":2,"dir":1,"sp":1}],"tray":[3,0,1],"sol":[1,3,1,0,0],"par":2},{"W":14.077,"H":17.596,"pegs":[[10.636,7.7],[5.44,4.7],[5.44,10.7],[8.44,5.504],[7.636,12.896]],"drive":0,"dsize":1,"outs":[{"p":2,"dir":1,"sp":1}],"tray":[1,0,2],"sol":[1,3,1,0,0],"par":2},{"W":16.9,"H":17.06,"pegs":[[9.7,13.36],[7.2,9.03],[4.7,4.7],[9.7,4.7],[12.2,9.03],[4.7,11.7]],"drive":0,"dsize":2,"outs":[{"p":3,"dir":-1,"sp":1.5}],"tray":[2,1,1],"sol":[2,1,2,1,0,0],"par":3},{"W":16.071,"H":14.178,"pegs":[[7.396,9.03],[9.896,4.7],[4.896,4.7],[11.371,9.478],[4.7,7.7],[9.226,7.2]],"drive":0,"dsize":1,"outs":[{"p":2,"dir":1,"sp":1}],"tray":[1,2,1],"sol":[1,2,1,0,0,0],"par":2},{"W":13.4,"H":15.792,"pegs":[[6.7,6.164],[4.7,9.628],[6.7,13.092],[10.7,13.092],[2.7,6.164],[8.7,9.628],[4.7,2.7]],"drive":0,"dsize":1,"outs":[{"p":3,"dir":-1,"sp":1}],"tray":[5,0,0],"sol":[1,1,1,1,0,0,0],"par":3},{"W":18.73,"H":19.4,"pegs":[[9.7,14.7],[9.7,9.7],[9.7,4.7],[14.03,7.2],[13.366,11.3],[10.03,7.2],[4.7,14.7]],"drive":0,"dsize":2,"outs":[{"p":3,"dir":-1,"sp":1.5}],"tray":[2,2,1],"sol":[2,1,2,1,0,0,0],"par":3},{"W":16.864,"H":18.4,"pegs":[[12.164,4.7],[12.164,9.7],[12.164,13.7],[8.164,13.7],[4.7,11.7],[8.164,9.7],[7.164,4.7],[4.7,7.7]],"drive":0,"dsize":2,"outs":[{"p":4,"dir":1,"sp":1.5}],"tray":[5,0,1],"sol":[2,1,1,1,1,0,0,0],"par":4},{"W":17.596,"H":16.864,"pegs":[[7.2,4.37],[4.7,8.7],[9.896,11.7],[12.896,6.504],[8.675,9.148],[12.896,10.504],[4.7,4.7],[6.7,12.164]],"drive":0,"dsize":2,"outs":[{"p":3,"dir":-1,"sp":1.5}],"tray":[3,1,1],"sol":[2,1,3,1,0,0,0,0],"par":3},{"W":14.864,"H":17.864,"pegs":[[9.164,3.7],[9.164,8.7],[11.164,12.164],[7.7,14.164],[3.7,14.164],[5.7,10.7],[7.164,5.236],[4.164,3.7],[4.834,6.2]],"drive":0,"dsize":2,"outs":[{"p":4,"dir":1,"sp":1.5}],"tray":[4,2,0],"sol":[2,1,1,1,1,0,0,0,0],"par":4},{"W":17.864,"H":21.23,"pegs":[[12.2,7.2],[9.7,11.53],[13.164,13.53],[4.7,11.53],[7.2,15.86],[9.03,9.03],[4.7,16.53],[7.87,4.7]],"drive":0,"dsize":2,"outs":[{"p":2,"dir":1,"sp":1.5},{"p":4,"dir":-1,"sp":1.5}],"tray":[3,1,2],"sol":[2,1,1,2,1,0,0,0],"par":4},{"W":18.328,"H":20.658,"pegs":[[8.7,9.03],[6.7,12.494],[10.164,14.494],[13.628,12.494],[6.2,4.7],[11.2,4.7],[4.7,15.958],[12.7,9.03],[5.236,7.03]],"drive":0,"dsize":1,"outs":[{"p":3,"dir":-1,"sp":1},{"p":5,"dir":1,"sp":1}],"tray":[4,2,1],"sol":[1,1,1,1,2,1,0,0,0],"par":5},{"W":19.4,"H":19.694,"pegs":[[10.2,7.2],[12.7,11.53],[10.7,14.994],[6.7,14.994],[4.7,11.53],[8.725,11.978],[14.53,4.7],[9.236,9.53],[14.7,8.066]],"drive":0,"dsize":2,"outs":[{"p":4,"dir":1,"sp":1.5}],"tray":[4,0,3],"sol":[2,1,1,1,1,0,0,0,0],"par":4},{"W":16.864,"H":17.792,"pegs":[[11.164,8.628],[13.164,12.092],[9.7,14.092],[5.7,14.092],[3.7,10.628],[5.7,7.164],[13.164,5.164],[7.7,10.628],[9.164,5.164],[3.7,3.7]],"drive":0,"dsize":1,"outs":[{"p":5,"dir":-1,"sp":1}],"tray":[6,1,0],"sol":[1,1,1,1,1,1,0,0,0,0],"par":5},{"W":15.9,"H":18.73,"pegs":[[12.2,3.7],[6.2,3.7],[6.2,8.7],[8.7,13.03],[3.7,13.03],[12.2,8.7],[8.534,7.1],[9.664,10.7],[3.7,4.37],[7.164,15.03]],"drive":0,"dsize":2,"outs":[{"p":4,"dir":1,"sp":1.5},{"p":5,"dir":-1,"sp":1.5}],"tray":[5,2,0],"sol":[2,2,1,2,1,1,0,0,0,0],"par":5},{"W":17.73,"H":20.4,"pegs":[[4.7,15.7],[9.03,13.2],[13.03,13.2],[13.03,9.2],[13.03,5.2],[4.7,10.7],[8.164,8.7],[8.164,4.7],[7.2,11.37],[9.7,15.7]],"drive":0,"dsize":2,"outs":[{"p":4,"dir":1,"sp":1.5},{"p":6,"dir":1,"sp":1.5}],"tray":[6,1,1],"sol":[2,1,1,1,1,1,1,0,0,0],"par":6},{"W":16.06,"H":18.658,"pegs":[[12.36,6.2],[8.03,3.7],[6.03,7.164],[8.03,10.628],[10.53,14.958],[5.53,14.958],[4.03,10.628],[11.494,12.628],[10.03,7.164],[8.994,12.958],[3.7,13.128]],"drive":0,"dsize":2,"outs":[{"p":5,"dir":-1,"sp":1.5}],"tray":[6,2,0],"sol":[2,1,1,1,2,1,0,0,0,0,0],"par":5},{"W":19.792,"H":20.864,"pegs":[[11.628,10.7],[13.628,14.164],[10.164,16.164],[6.7,14.164],[4.7,10.7],[4.7,6.7],[15.092,8.7],[11.628,6.7],[8.164,8.7],[8.164,4.7],[7.7,11.896]],"drive":0,"dsize":1,"outs":[{"p":5,"dir":-1,"sp":1},{"p":6,"dir":-1,"sp":1}],"tray":[6,1,1],"sol":[1,1,1,1,1,1,1,0,0,0,0],"par":6},{"W":15.73,"H":19.375,"pegs":[[7.7,7.7],[7.7,11.7],[12.03,14.2],[12.03,9.2],[12.03,5.2],[3.7,7.7],[3.7,3.7],[7.252,15.675],[3.7,11.7],[9.53,9.53],[7.03,5.2]],"drive":0,"dsize":1,"outs":[{"p":4,"dir":1,"sp":1},{"p":6,"dir":1,"sp":1}],"tray":[6,2,0],"sol":[1,1,2,1,1,1,1,0,0,0,0],"par":6}]; /*LEVELS*/
/* level: {W,H,pegs:[[x,y]...], drive:i, dsize, outs:[{p:i, dir:1|-1, sp:num}], tray:[nS,nM,nL], sol:[size per peg]} (sizes 0 none, 1 S, 2 M, 3 L) */
function dist(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1])}
/* evaluate an assignment (size per peg; the drive's own size is forced). Returns {bad:[i,j] overlap | null, jam, turn:{peg:{dir,sp}}, edges, won} */
function evaluate(lv,asg){var n=lv.pegs.length,s=asg.slice();s[lv.drive]=lv.dsize;var e=[],i,j;
  for(i=0;i<n;i++)if(s[i])for(j=i+1;j<n;j++)if(s[j]){var d=dist(lv.pegs[i],lv.pegs[j]),r=RAD[s[i]]+RAD[s[j]];if(d<r-.02)return{bad:[i,j],jam:false,turn:{},edges:[],won:false};if(Math.abs(d-r)<=.02)e.push([i,j])}
  var adj=[];for(i=0;i<n;i++)adj.push([]);e.forEach(function(x){adj[x[0]].push(x[1]);adj[x[1]].push(x[0])});
  var dir={},sp={},q=[lv.drive],jam=false;dir[lv.drive]=1;sp[lv.drive]=1;
  for(var h=0;h<q.length;h++){var a=q[h];adj[a].forEach(function(b){var nd=-dir[a],ns=sp[a]*RAD[s[a]]/RAD[s[b]];if(dir[b]==null){dir[b]=nd;sp[b]=ns;q.push(b)}else if(dir[b]!==nd)jam=true})}
  var turn={};if(!jam)q.forEach(function(p){turn[p]={dir:dir[p],sp:sp[p]}});
  var won=!jam&&lv.outs.every(function(o){var t=turn[o.p];return t&&s[o.p]&&t.dir===o.dir&&Math.abs(t.sp-o.sp)<1e-6});
  return{bad:null,jam:jam,turn:turn,edges:e,won:won,comp:q}}
/* every assignment the tray allows: wins grouped by gear count */
function enumerate(lv,cb){var n=lv.pegs.length,free=[],i;for(i=0;i<n;i++)if(i!==lv.drive)free.push(i);var asg=new Array(n).fill(0),left=lv.tray.slice();
  (function rec(k,cnt){if(k===free.length){cb(asg,cnt);return}var p=free[k];rec(k+1,cnt);for(var z=1;z<=3;z++)if(left[z-1]>0){left[z-1]--;asg[p]=z;rec(k+1,cnt+1);asg[p]=0;left[z-1]++}})(0,0)}
function analyse(lv){var best=99,wins={},conn=0,alts=0,jams=0;
  enumerate(lv,function(a,c){var r=evaluate(lv,a);if(r.bad)return;if(r.won){(wins[c]=wins[c]||[]).push(a.join(''));if(c<best)best=c}});
  var par=best,sols=wins[par]||[];
  /* the 'shortest chain' trap: placements with at most par gears that make every dial turn, but wrong; and placements that jam */
  enumerate(lv,function(a,c){if(c>par)return;var r=evaluate(lv,a);if(r.bad)return;if(r.jam){jams++;return}if(r.won)return;
    if(lv.outs.every(function(o){return r.turn[o.p]&&a[o.p]}))alts++});
  var minConn=99;enumerate(lv,function(a,c){if(c>=minConn)return;var r=evaluate(lv,a);if(r.bad||r.jam)return;if(lv.outs.every(function(o){return r.turn[o.p]&&a[o.p]}))minConn=c});
  return{par:par===99?-1:par,unique:sols.length===1,sol:sols[0]||null,alts:alts,jams:jams,minConn:minConn}}
function make(level){var n=LEVELS.length,L=Math.max(1,Math.min(n,level|0||1)),lv=LEVELS[L-1];
  return{level:L,title:'Level '+L,lv:lv,par:lv.par,parExact:true}}
window.V6GT={LEVELS:LEVELS,evaluate:evaluate,enumerate:enumerate,analyse:analyse,RAD:RAD,make:make};

var CSS=''
+'.zgt>.zk-pips{align-self:stretch}'
+'.zgt{position:relative;width:100%;max-width:380px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:var(--font);'
+'--gt-bg1:#EFE7D8;--gt-bg2:#E4D8C2;--gt-peg:#7A6A55;--gt-g1:#C9CFD6;--gt-g2:#8E99A6;--gt-gl:#39424C;--gt-dr1:#F2C14E;--gt-dr2:#C48A16;--gt-dial:#FBF8F1;--gt-hand:#1B1916;--gt-ghost:#E8590C}'
+':root[data-theme="dark"] .zgt{--gt-bg1:#2A2621;--gt-bg2:#221E1A;--gt-peg:#A8977E;--gt-g1:#9AA4AF;--gt-g2:#5E6873;--gt-gl:#1A1F24;--gt-dr1:#E6B240;--gt-dr2:#A8740F;--gt-dial:#3A352E;--gt-hand:#F3EEE4;--gt-ghost:#F7A35C}'
+'.zgt-b{position:relative;width:100%;border-radius:20px;background:radial-gradient(circle at 30% 20%,var(--gt-bg1),var(--gt-bg2));box-shadow:inset 0 0 0 2px var(--line),0 6px 18px rgba(0,0,0,.1);touch-action:none;user-select:none;-webkit-user-select:none}'
+'.zgt-b svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}'
+'.zgt-peg{fill:var(--gt-peg)}.zgt-pegring{fill:none;stroke:var(--gt-peg);stroke-width:.18;stroke-dasharray:.35 .3;opacity:.55}'
+'.zgt-gear path{fill:var(--gt-g1);stroke:var(--gt-gl);stroke-width:.16;stroke-linejoin:round}.zgt-gear .hub{fill:var(--gt-g2);stroke:var(--gt-gl);stroke-width:.14}'
+'.zgt-gear.drv path{fill:var(--gt-dr1)}.zgt-gear.drv .hub{fill:var(--gt-dr2)}'
+'.zgt-gear.jam path{fill:#F1C27D}.zgt-gear.ok path{filter:drop-shadow(0 0 .25px #F6B73C)}'
+'.zgt-gear.still path{fill-opacity:.82}'
+'.zgt-dial .face{fill:var(--gt-dial);stroke:var(--gt-gl);stroke-width:.14}.zgt-dial .hand{stroke:var(--gt-hand);stroke-width:.32;stroke-linecap:round}.zgt-dial .ghost{stroke:var(--gt-ghost);stroke-width:.28;stroke-linecap:round;stroke-dasharray:.35 .25}'
+'.zgt-dial .arr{fill:none;stroke:var(--gt-ghost);stroke-width:.2;stroke-linecap:round;stroke-linejoin:round}.zgt-dial.ok .face{stroke:#2F9E5F;stroke-width:.28}'
+'.zgt-hit{fill:transparent;cursor:pointer}'
+'.zgt-tray{display:flex;gap:10px;justify-content:center;align-items:flex-end;min-height:84px}'
+'.zgt-tok{all:unset;position:relative;box-sizing:border-box;display:flex;align-items:center;justify-content:center;cursor:grab;border-radius:16px;padding:4px;touch-action:none;-webkit-tap-highlight-color:transparent}'
+'.zgt-tok:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.zgt-tok.sel{box-shadow:0 0 0 3px var(--accent,#E8590C)}'
+'.zgt-tok svg{overflow:visible}.zgt-tok .n{position:absolute;right:-4px;top:-4px;min-width:22px;height:22px;border-radius:11px;background:var(--ink);color:var(--surface);font:800 .8125rem/22px var(--font);text-align:center}'
+'.zgt-tok[disabled]{opacity:.3;cursor:default}'
+'.zgt-drag{position:absolute;left:0;top:0;pointer-events:none;z-index:9;opacity:.92;filter:drop-shadow(0 8px 10px rgba(0,0,0,.3))}'
+'.zgt-mk{fill:none;stroke:var(--accent,#E8590C);stroke-width:.26;stroke-dasharray:.5 .32;pointer-events:none;animation:zgtmk 1.1s ease-in-out infinite}@keyframes zgtmk{50%{stroke-width:.42}}.zgt.zk-rm .zgt-mk{animation:none}@media (prefers-reduced-motion:reduce){.zgt-mk{animation:none}}'
+'.zgt-fit{fill:none;stroke-width:.3}.zgt-fit.m{stroke:#2F9E5F}.zgt-fit.x{stroke:#E9A23B;stroke-dasharray:.4 .3}.zgt-fit.n{stroke:var(--gt-peg);stroke-dasharray:.4 .3;opacity:.7}';
function gearPath(r,teeth){var o=r+.42,inr=r-.42,pts=[],k;for(k=0;k<teeth;k++){var a0=k/teeth*Math.PI*2,w=Math.PI*2/teeth;
    [[inr,a0],[inr,a0+w*.12],[o,a0+w*.28],[o,a0+w*.62],[inr,a0+w*.78]].forEach(function(p){pts.push((p[0]*Math.cos(p[1])).toFixed(3)+' '+(p[0]*Math.sin(p[1])).toFixed(3))})}
  return 'M'+pts.join('L')+'Z M'+(r*.42).toFixed(2)+' 0 A'+(r*.42).toFixed(2)+' '+(r*.42).toFixed(2)+' 0 1 0 '+(-r*.42).toFixed(2)+' 0 A'+(r*.42).toFixed(2)+' '+(r*.42).toFixed(2)+' 0 1 0 '+(r*.42).toFixed(2)+' 0Z'}
function gearSvg(z,px){var r=RAD[z],s=(r+.6)*2;return '<svg width="'+(s*px)+'" height="'+(s*px)+'" viewBox="'+(-s/2)+' '+(-s/2)+' '+s+' '+s+'"><g class="zgt-gear"><path d="'+gearPath(r,TEETH[z])+'" fill-rule="evenodd" style="fill:var(--gt-g1);stroke:var(--gt-gl);stroke-width:.16"/><circle class="hub" r=".55" style="fill:var(--gt-g2);stroke:var(--gt-gl);stroke-width:.14"/></g></svg>'}
var NS='http://www.w3.org/2000/svg';function E(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}

function mount(root,inst,api){ZK.css(CSS,'zgt-css');root.textContent='';
  var lv=inst.lv,n=lv.pegs.length,rm=ZK.rm(api),asg=new Array(n).fill(0),tray=lv.tray.slice(),hist=[],hints=0,undos=0,fin=false,ghost=null,idle=null,offs=[],timers=[],raf=0,t0=performance.now(),state=null,sel=0,phase={},angle={},boost=1;
  asg[lv.drive]=lv.dsize;
  var stage=document.createElement('div');stage.className='zgt zk-stage zk-host'+(rm?' zk-rm':'');
  var pips=ZK.pips(inst.par);
  var board=document.createElement('div');board.className='zgt-b zk-board';board.style.aspectRatio=lv.W+' / '+lv.H;board.style.width='min(100%, calc((100svh - 330px) * '+lv.W+' / '+lv.H+'))';board.setAttribute('role','group');
  var svg=E('svg',{viewBox:'0 0 '+lv.W+' '+lv.H});board.appendChild(svg);
  var gPeg=E('g',{},svg),gGear=E('g',{},svg),gDial=E('g',{},svg),gFit=E('g',{},svg),gMk=E('g',{},svg),gHit=E('g',{},svg);
  /* teach2 fix: hints used ZK.mark on SVG shapes, and a CSS outline on a shape inside a scaled viewBox drew big peach rectangles over the board.
     The hint marks are rings drawn in board units instead (r: the gear's own size where a size is known). */
  function mk(i,r){var p=lv.pegs[i];E('circle',{class:'zgt-mk',cx:p[0],cy:p[1],r:r||1.5},gMk)}
  function unmk(){ZK.unmark(stage);gMk.textContent=''}
  var gearEl={},hitEl=[],dials=[];
  lv.pegs.forEach(function(p,i){E('circle',{class:'zgt-peg',cx:p[0],cy:p[1],r:.42},gPeg);if(i!==lv.drive)E('circle',{class:'zgt-pegring',cx:p[0],cy:p[1],r:1.15},gPeg);
    var h=E('circle',{class:'zgt-hit',cx:p[0],cy:p[1],r:1.6,'data-peg':i,'data-zkc':''},gHit);hitEl.push(h)});
  lv.outs.forEach(function(o){var p=lv.pegs[o.p],g=E('g',{class:'zgt-dial',transform:'translate('+p[0]+' '+p[1]+')'},gDial);
    E('circle',{class:'face',r:1.05},g);var gh=E('line',{class:'ghost',x1:0,y1:0,x2:0,y2:-.85},g),hd=E('line',{class:'hand',x1:0,y1:0,x2:0,y2:-.8},g);
    E('path',{class:'arr',d:o.dir>0?'M-.55 -1.35A1.45 1.45 0 0 1 .55 -1.35M.3 -1.6L.6 -1.35L.28 -1.1':'M.55 -1.35A1.45 1.45 0 0 0 -.55 -1.35M-.3 -1.6L-.6 -1.35L-.28 -1.1'},g);
    E('circle',{r:.2,fill:'var(--gt-hand)'},g);dials.push({o:o,g:g,ghost:gh,hand:hd})});
  /* tray */
  var trayEl=document.createElement('div');trayEl.className='zgt-tray';var toks=[];
  stage.appendChild(pips.el);stage.appendChild(board);stage.appendChild(trayEl);root.appendChild(stage);
  function px(){return board.getBoundingClientRect().width/lv.W}
  function buildTray(){trayEl.textContent='';toks=[];var u=Math.max(8,Math.min(10.5,px()*.55));
    [1,2,3].forEach(function(z){if(!lv.tray[z-1])return;var b=document.createElement('button');b.type='button';b.className='zgt-tok zk-p';b.setAttribute('data-size',z);b.innerHTML=gearSvg(z,u)+'<span class="n"></span>';
      b.addEventListener('pointerdown',function(e){startDrag(e,z,-1)});b.addEventListener('click',function(e){if(e.detail===0||Date.now()-tapAt<400){sel=sel===z?0:z;syncTray();ZK.sfx('lift')}});trayEl.appendChild(b);toks[z]=b});syncTray()}
  var tapAt=0;
  function syncTray(){[1,2,3].forEach(function(z){var b=toks[z];if(!b)return;b.querySelector('.n').textContent=tray[z-1];b.disabled=tray[z-1]<=0;b.classList.toggle('sel',sel===z);b.setAttribute('aria-label',SN[z]+' gear, '+tray[z-1]+' left'+(sel===z?', picked':''))})}
  function T(fn,ms){timers.push(setTimeout(fn,ms))}
  /* draw the gears, with tooth phases that mesh */
  function rebuild(){gGear.textContent='';gearEl={};state=evaluate(lv,asg);
    for(var i=0;i<n;i++)if(asg[i]){var z=asg[i],p=lv.pegs[i],g=E('g',{class:'zgt-gear'+(i===lv.drive?' drv':''),'data-peg':i},gGear);E('path',{d:gearPath(RAD[z],TEETH[z]),'fill-rule':'evenodd'},g);E('circle',{class:'hub',r:i===lv.drive?.75:.55},g);
      if(i===lv.drive)E('path',{d:'M0 0L0 -.6',stroke:'#5A3A05','stroke-width':'.22','stroke-linecap':'round'},g);gearEl[i]=g}
    /* phases: walk the meshes from the drive */
    phase={};phase[lv.drive]=0;var q=[lv.drive];
    for(var h=0;h<q.length;h++){var a=q[h];state.edges.forEach(function(e){var b=e[0]===a?e[1]:e[1]===a?e[0]:-1;if(b<0||phase[b]!=null)return;var pa=lv.pegs[a],pb=lv.pegs[b],th=Math.atan2(pb[1]-pa[1],pb[0]-pa[0]),ra=RAD[asg[a]],rb=RAD[asg[b]];
      phase[b]=th+Math.PI-(phase[a]-th)*ra/rb+Math.PI/TEETH[asg[b]];q.push(b)})}
    for(i=0;i<n;i++)if(asg[i]&&phase[i]==null)phase[i]=0;
    for(i in gearEl){var t=state.turn[i];gearEl[i].classList.toggle('still',!t);gearEl[i].classList.toggle('jam',state.jam&&state.comp.indexOf(+i)>=0)}
    dials.forEach(function(d){var t=state.turn[d.o.p],ok=t&&asg[d.o.p]&&t.dir===d.o.dir&&Math.abs(t.sp-d.o.sp)<1e-6;d.g.classList.toggle('ok',!!ok)});
    if(rm)still();   /* teach2 fix: with Reduce motion there is no frame loop, so a gear placed after mount sat at the board's top-left corner */
    label()}
  function label(){var placed=[];for(var i=0;i<n;i++)if(asg[i]&&i!==lv.drive)placed.push(SN[asg[i]]);board.setAttribute('aria-label','Gear board. '+(placed.length?'Placed: '+placed.join(', ')+'. ':'')+(state&&state.jam?'The gears are jammed. ':'')+dials.filter(function(d){return d.g.classList.contains('ok')}).length+' of '+dials.length+' dials right.')}
  /* the clock: drive 1 turn per 4 s; each gear turns at its speed; a jammed train shakes */
  var BASE=Math.PI*2/4000;
  function frame(now){raf=requestAnimationFrame(frame);var dt=now-t0;
    for(var i in gearEl){var t=state.turn[i],p=lv.pegs[i],a=phase[i]||0,sh='';if(t)a+=t.dir*t.sp*BASE*dt*boost;else if(state.jam&&state.comp.indexOf(+i)>=0&&!rm)a+=Math.sin(now/40)*.03;angle[i]=a;
      gearEl[i].setAttribute('transform','translate('+p[0]+' '+p[1]+') rotate('+(a*180/Math.PI).toFixed(2)+')')}
    dials.forEach(function(d){var ga=d.o.dir*d.o.sp*BASE*dt;d.ghost.setAttribute('transform','rotate('+(ga*180/Math.PI%360).toFixed(2)+')');
      var t=state.turn[d.o.p],ha=t&&asg[d.o.p]?(angle[d.o.p]-(phase[d.o.p]||0)):0;d.hand.setAttribute('transform','rotate('+(ha*180/Math.PI%360).toFixed(2)+')')})}
  function still(){for(var i in gearEl){var p=lv.pegs[i];gearEl[i].setAttribute('transform','translate('+p[0]+' '+p[1]+') rotate('+((phase[i]||0)*180/Math.PI).toFixed(2)+')')}}
  /* placing */
  function fits(z,i){var a=asg.slice();a[i]=z;var r=evaluate(lv,a);return r}
  function place(z,i,from){if(fin)return false;if(i===lv.drive||(asg[i]&&from!==i))return false;
    var a=asg.slice();if(from>=0)a[from]=0;a[i]=z;var r=evaluate(lv,a);
    if(r.bad){var other=r.bad[0]===i?r.bad[1]:r.bad[0];if(gearEl[other])ZK.wrong(gearEl[other]);else ZK.wrong(hitEl[i]);flashBad(i,z);return false}
    ZK.ghostDone(ID);if(ghost)ghost.stop();unmk();
    var wasWon=false;hist.push({z:z,to:i,from:from});if(from>=0)asg[from]=0;else tray[z-1]--;asg[i]=z;api.moved();pips.set(hist.length);syncTray();
    var before=state;rebuild();if(!rm&&gearEl[i])ZK.anim(gearEl[i],[{opacity:.4},{opacity:1}],200,'ease-out');
    ZK.sfx('clack');ZK.buzz('move');var pq=at(i);
    if(state.turn[i])T(function(){ZK.sfx('click',{p:Math.min(8,Math.round(state.turn[i].sp*3))})},90);
    if(state.jam){ZK.sfx('soft');ZK.buzz('wrong')}
    check();return true}
  function flashBad(i,z){var p=lv.pegs[i],c=E('circle',{class:'zgt-fit x',cx:p[0],cy:p[1],r:RAD[z]},gFit);T(function(){if(c.parentNode)c.remove()},520)}
  function lift(i){if(fin||!asg[i]||i===lv.drive)return;var z=asg[i];hist.push({z:z,to:-1,from:i});asg[i]=0;tray[z-1]++;api.moved();pips.set(hist.length);syncTray();rebuild();ZK.sfx('lift');ZK.buzz('tap');check()}
  function check(){if(state.won&&!fin){fin=true;boost=1;var t1=performance.now();
      /* spin-up: the whole train speeds up for a moment, every dial glows */
      if(!rm){var t0b=t1;(function up(){var k=(performance.now()-t0b)/600;if(k<1&&fin){boost=1+2.5*Math.sin(Math.PI*k);requestAnimationFrame(up)}else boost=1})()}
      ZK.sfx('cap',{n:6});ZK.buzz('pop');dials.forEach(function(d){var q=ZK.at(board,hitEl[d.o.p]);ZK.burst(board,q.x,q.y,{n:10,r:40,colors:['#F6B73C','#2F9E5F','#fff']})});
      api.say('Every dial turns the right way at the right speed.');T(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:260)}}
  function at(i){return ZK.at(board,hitEl[i])}
  /* drag: from the tray (from=-1) or from a peg; the gear rides above the finger; pegs preview mesh (green), overlap (amber) or no contact */
  var dr=null,ignore=0;function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  function nearest(x,y){var r=board.getBoundingClientRect(),u=r.width/lv.W,best=-1,bd=1e9;lv.pegs.forEach(function(p,i){var d=Math.hypot(r.left+p[0]*u-x,r.top+p[1]*u-y);if(d<bd){bd=d;best=i}});return bd<u*2.6?best:-1}
  function preview(z,i){gFit.textContent='';if(i<0||i===lv.drive||(asg[i]&&(!dr||dr.from!==i)))return;var a=asg.slice();if(dr&&dr.from>=0)a[dr.from]=0;a[i]=z;var r=evaluate(lv,a),p=lv.pegs[i];
    E('circle',{class:'zgt-fit '+(r.bad?'x':r.edges.some(function(e){return e[0]===i||e[1]===i})?'m':'n'),cx:p[0],cy:p[1],r:RAD[z]},gFit)}
  function startDrag(e,z,from){if(fin)return;if(from<0&&tray[z-1]<=0)return;e.preventDefault();var u=px(),el=document.createElement('div');el.className='zgt-drag';el.innerHTML=gearSvg(z,u);
    dr={id:e.pointerId,z:z,from:from,x0:e.clientX,y0:e.clientY,moved:false,el:el,u:u};
    try{(e.currentTarget||board).setPointerCapture(e.pointerId)}catch(_){}
    document.addEventListener('pointermove',mv,true);document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',cancel,true)}
  function posDrag(x,y){var h=stage.getBoundingClientRect(),s=(RAD[dr.z]+.6)*2*dr.u;dr.el.style.transform='translate('+(x-h.left-s/2)+'px,'+(y-h.top-s/2-56)+'px)'}
  function mv(e){if(!dr||e.pointerId!==dr.id)return;if(!dr.moved){if(Math.hypot(e.clientX-dr.x0,e.clientY-dr.y0)<8)return;dr.moved=true;stage.appendChild(dr.el);ZK.sfx('lift');if(dr.from>=0&&gearEl[dr.from])gearEl[dr.from].style.opacity=.25}
    posDrag(e.clientX,e.clientY);preview(dr.z,nearest(e.clientX,e.clientY-56))}
  function fin2(){document.removeEventListener('pointermove',mv,true);document.removeEventListener('pointerup',up,true);document.removeEventListener('pointercancel',cancel,true);if(dr&&dr.el.parentNode)dr.el.remove();gFit.textContent='';if(dr&&dr.from>=0&&gearEl[dr.from])gearEl[dr.from].style.opacity='';ignore=Date.now()}
  function up(e){if(!dr||e.pointerId!==dr.id)return;var w=dr;fin2();dr=null;
    if(!w.moved){if(w.from>=0){lift(w.from);return}tapAt=Date.now();return}
    var i=nearest(e.clientX,e.clientY-56);if(i<0||i===lv.drive){if(w.from>=0)lift(w.from);return}
    if(i===w.from){return}if(asg[i]){ZK.wrong(gearEl[i]);return}place(w.z,i,w.from)}
  function cancel(e){if(!dr||e.pointerId!==dr.id)return;fin2();dr=null}
  /* taps on pegs: with a tray gear picked, put it there; on a placed gear, start a drag (a tap lifts it off) */
  L(board,'pointerdown',function(e){if(fin)return;var i=nearest(e.clientX,e.clientY);if(i<0)return;
    if(asg[i]&&i!==lv.drive){startDrag(e,asg[i],i);return}
    if(sel&&!asg[i]){e.preventDefault();if(place(sel,i,-1)){if(tray[sel-1]<=0)sel=0;syncTray()}}});
  /* keyboard: the pegs as buttons in the a11y tree would be heavy; Enter on a tray gear picks it, arrow keys pick a peg */
  buildTray();rebuild();if(rm)still();else raf=requestAnimationFrame(frame);
  if(rm){/* reduced motion: hands point to show direction as a static tilt */dials.forEach(function(d){d.ghost.setAttribute('transform','rotate('+(d.o.dir*35)+')')})}
  if(inst.level===1&&lv.sol){var tgt=-1;for(var i=0;i<n;i++)if(lv.sol[i]&&i!==lv.drive){tgt=i;break}
    if(tgt>=0&&toks[lv.sol[tgt]])T(function(){var m=document.createElement('i'),pp=lv.pegs[tgt];m.style.cssText='position:absolute;width:2px;height:2px;pointer-events:none;left:'+(pp[0]/lv.W*100)+'%;top:calc('+(pp[1]/lv.H*100)+'% + 56px)';board.appendChild(m);   /* the finger ends under the peg: the lifted gear rides above it */
      ghost=ZK.ghost(stage,[{drag:[toks[lv.sol[tgt]],m]}],{id:ID,level:1})},30)}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin||!hist.length)return false;var h=hist.pop();if(h.to>=0){asg[h.to]=0;if(h.from>=0)asg[h.from]=h.z;else tray[h.z-1]++}else{asg[h.from]=h.z;tray[h.z-1]--}
    undos++;pips.set(hist.length);syncTray();rebuild();ZK.sfx('undo');ZK.buzz('tap');unmk();return true}
  return{undo:undo,
    restart:function(){if(fin)return;asg=new Array(n).fill(0);asg[lv.drive]=lv.dsize;tray=lv.tray.slice();hist=[];sel=0;pips.set(0);syncTray();rebuild();unmk();ZK.sfx('undo')},
    hint:function(lv2){if(fin)return null;unmk();var sol=lv.sol;if(!sol)return null;hints++;
      /* a gear that is not in the answer comes off first */
      for(var i=0;i<n;i++)if(i!==lv.drive&&asg[i]&&asg[i]!==sol[i]){mk(i,RAD[asg[i]]+.55);if(lv2>=3){lift(i);return 'Took it off for you.'}return 'This gear is not part of the answer. Lift it off.'}
      var miss=-1;for(i=0;i<n;i++)if(i!==lv.drive&&sol[i]&&!asg[i]){miss=i;break}if(miss<0)return null;
      if(lv2<=1){mk(miss);var d0=lv.outs[0];return d0.dir>0?'Count the meshes: each one flips the turn. The dial must turn clockwise.':'Count the meshes: each one flips the turn. The dial must turn anticlockwise.'}
      if(lv2===2){mk(miss,RAD[sol[miss]]);ZK.mark(toks[sol[miss]]);return 'A '+SN[sol[miss]]+' gear goes on the marked peg.'}
      place(sol[miss],miss,-1);return 'Placed it for you.'},
    destroy:function(){cancelAnimationFrame(raf);timers.forEach(clearTimeout);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});if(dr)fin2();root.textContent=''},
    lastEl:function(){var h=hist[hist.length-1];return h&&h.to>=0?hitEl[h.to]:board},
    state:function(){return{asg:asg.join(''),tray:tray.slice(),moves:hist.length,fin:fin,jam:state.jam,won:state.won}}}}

ZK.override({id:ID,name:'Gear Train',family:'move',blurb:'Place gears so each dial turns the right way at the right speed.',
  how:'Drag gears onto pegs. Touching gears turn opposite ways, and small gears turn faster. Match each dial’s orange hand.',
  areas:['space','logic'],levels:LEVELS.length||20,secs:80,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'The dials turn true with '+m+' move'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
