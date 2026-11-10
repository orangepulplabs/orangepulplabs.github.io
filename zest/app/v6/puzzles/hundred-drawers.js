/* Zest v6 batch d: Hundred Drawers. Overrides the puzzles_c3.js entry through ZK.override (the original stays in ZK.orig).
   Rule: N numbered drawers each hold a slip with a number. You hold a ticket with your number and may open only a few drawers. Find the slip that carries YOUR number.
   The trick: open the drawer with your own number, read its slip, open the drawer that slip names, and so on: the chain always ends at your slip.
   Kept: the construction (the permutation is built so your chain has length L, so it always works; par = L). Changed: the board GUIDES the trick: the drawer to open next glows
   (levels 1-6 from the start, levels 7-14 after the first open), every open draws an arrow from the drawer to the drawer its slip names, so the chain shows on the board; the
   opens left are dots; sizes cap at 20 drawers; the open limit is chain length + 2 (never more than half), so random hunting rarely works and the chain is the answer; a table of
   chain lengths with breathers replaces par 13 on the biggest board. The win draws the whole loop. 'Out of opens' is the stuck signal with Undo. */
(function(){
var ID='hundred-drawers';
var NN=[6,6,6,8,8,8,10,10,10,10,12,12,12,12,14,14,14,16,16,16,18,18,18,20,20,20,20,20,20,20];
var LL=[2,2,3,3,3,4,3,4,4,5,4,5,5,6,5,6,6,7,6,7,7,8,7,8,8,9,8,9,9,10];
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var N=NN[level-1],Lc=Math.min(LL[level-1],Math.floor(N/2)),cap=Math.min(Math.floor(N/2),Lc+2),p=1+pzInt(rng,N),i,
  others=pzShuffle(seq(N).map(function(x){return x+1}).filter(function(x){return x!==p}),rng),cyc=[p].concat(others.slice(0,Lc-1)),rest=others.slice(Lc-1),sh=pzShuffle(rest,rng),perm=seq(N+1).map(function(){return 0});
  for(i=0;i<Lc;i++)perm[cyc[i]]=cyc[(i+1)%Lc];for(i=0;i<rest.length;i++)perm[rest[i]]=sh[i];
  return{level:level,title:'Level '+level,n:N,cap:cap,mine:p,perm:perm.slice(1),par:Lc,chain:cyc,parExact:true}}
window.V6HD={make:make,NN:NN,LL:LL};
var CSS=''
+'.hd .hd-wrap{position:relative;width:100%}'
+'.hd .hd-grid{display:grid;gap:8px;width:100%;padding:10px;border-radius:24px;background:var(--dk-board);box-shadow:inset 0 3px 10px rgba(0,0,0,.14)}'
+'.hd .hd-d{all:unset;box-sizing:border-box;position:relative;aspect-ratio:60/54;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent}'
+'.hd .hd-d:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.hd .hd-d svg{width:100%;height:100%;overflow:visible}'
+'.hd .hd-ar{position:absolute;inset:10px;pointer-events:none;z-index:3;width:calc(100% - 20px);height:calc(100% - 20px)}'
+'.hd .hd-tk{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 14px 0 10px;border-radius:17px;background:var(--surface);box-shadow:0 0 0 1.5px var(--line);font:800 1.0625rem var(--font);color:var(--ink)}'
+'.hd .hd-tk b{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:26px;padding:0 6px;border-radius:7px;background:#F28C28;color:#1B1916;border:2px dashed #6B3200;font-size:1rem}';
function drawerSvg(num,slip,open,found,glow){
  var wood='#C8955A',dark='#8A5A2B',s='<svg viewBox="0 0 60 54" aria-hidden="true">';
  if(open){s+='<rect x="4" y="22" width="52" height="28" rx="7" fill="#5E3C1B" stroke="'+dark+'" stroke-width="2.5"/>'
    +'<g class="hd-sl"><rect x="10" y="4" width="40" height="30" rx="5" fill="'+(found?'#FFE9A8':'#FFF8EA')+'" stroke="'+(found?'#E8590C':'#6B4A22')+'" stroke-width="'+(found?4:2.5)+'"/><text x="30" y="26" font-size="19" font-weight="800" text-anchor="middle" fill="#1B1916" font-family="sans-serif">'+slip+'</text></g>'
    +'<rect x="4" y="32" width="52" height="18" rx="6" fill="'+wood+'" stroke="'+dark+'" stroke-width="2.5"/><text x="30" y="45" font-size="11" font-weight="800" text-anchor="middle" fill="#3B2410" font-family="sans-serif">'+num+'</text>'}
  else{s+='<rect x="4" y="6" width="52" height="44" rx="7" fill="'+wood+'" stroke="'+(glow?'#E8590C':dark)+'" stroke-width="'+(glow?4.5:2.5)+'"/><rect x="18" y="12" width="24" height="15" rx="4" fill="#FFF3DC" stroke="'+dark+'" stroke-width="1.5"/><text x="30" y="24" font-size="12" font-weight="800" text-anchor="middle" fill="#3B2410" font-family="sans-serif">'+num+'</text><rect x="21" y="36" width="18" height="5" rx="2.5" fill="#6B3A12"/>'}
  return s+'</svg>'}
function mount(root,inst,api){ZK.css(DK.BASECSS+CSS,'hd-css');root.textContent='';
  var N=inst.n,cap=inst.cap,p=inst.mine,perm=inst.perm,rm=ZK.rm(api),L=DK.life(),opened=[],found=false,fail=false,fin=false,hints=0,undos=0,lastD=-1,ghost=null,idle=null,lv=inst.level,i,d;
  var cols=N<=6?3:N<=8?4:5,rows=Math.ceil(N/cols);
  var stage=DK.h('div','dk hd zk-stage zk-host'+(rm?' zk-rm':'')),top=DK.h('div','dk-top',null,null,stage);
  var tk=DK.h('div','hd-tk','<span>You</span><b>'+p+'</b>',{role:'img','aria-label':'Your number is '+p},top),pips=ZK.pips(cap);top.appendChild(tk);
  var wrap=DK.h('div','hd-wrap',null,null,stage),grid=DK.h('div','hd-grid zk-board',null,{role:'group','aria-label':'Drawers 1 to '+N},wrap);grid.style.gridTemplateColumns='repeat('+cols+',1fr)';
  var arr=DK.sv('svg',{'class':'hd-ar',viewBox:'0 0 '+(cols*60)+' '+(rows*54),preserveAspectRatio:'none','aria-hidden':'true'},wrap),btn=[];
  for(d=1;d<=N;d++)(function(d){var b=DK.h('button','hd-d zk-p',null,{type:'button','data-zkc':''});b.onclick=function(){open(d)};btn.push(b);grid.appendChild(b)})(d);
  stage.appendChild(pips.el);root.appendChild(stage);
  function nextDrawer(){var x=p;for(var g=0;g<=N;g++){if(opened.indexOf(x)<0)return x;if(perm[x-1]===p)return -1;x=perm[x-1]}return -1}
  function guideOn(){return lv<=6||(lv<=14&&opened.length>0)}
  function xy(dd){var r=Math.floor((dd-1)/cols),c=(dd-1)%cols;return[c*60+30,r*54+28]}
  function draw(popD){var nx=guideOn()&&!fin&&!fail?nextDrawer():-1;
    for(d=1;d<=N;d++){var o=opened.indexOf(d)>=0,slip=perm[d-1],fd=found&&o&&slip===p,b=btn[d-1];b.innerHTML=drawerSvg(d,slip,o,fd,d===nx);b.setAttribute('aria-label','Drawer '+d+(o?', open, slip '+slip+(fd?', your number':''):', closed')+(d===nx?', open this next':''));
      if(d===nx){b.classList.add('dk-pulse')}else b.classList.remove('dk-pulse')}
    arr.textContent='';
    opened.forEach(function(dd){var v=perm[dd-1];if(v===p&&found&&dd===opened[opened.length-1])return;var a=xy(dd),c=xy(v);if(a[0]===c[0]&&a[1]===c[1])return;
      DK.sv('path',{d:DK.arrow(a[0],a[1]+6,c[0],c[1]+6,a[0]===c[0]?0:(a[1]===c[1]?-16:-10),7),fill:'none',stroke:'#E8590C','stroke-width':2.4,'stroke-linecap':'round','stroke-linejoin':'round',opacity:.75,'vector-effect':'non-scaling-stroke'},arr)});
    if(popD&&!rm){var sl=btn[popD-1].querySelector('.hd-sl');if(sl)ZK.anim(sl,[{transform:'translateY(14px)',opacity:0},{transform:'translateY(-2px)',opacity:1,offset:.7},{transform:'translateY(0)',opacity:1}],260,ZK.SPRING)}
    pips.set(opened.length);ZK.stuck(stage,false);if(fail&&!fin)ZK.stuck(stage,true,{text:'Out of opens',onUndo:function(){ctl.undo()}})}
  function D(ms){return rm?0:ms}
  function open(dd){if(fin||fail||opened.indexOf(dd)>=0)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);opened.push(dd);lastD=dd;api.moved();var slip=perm[dd-1];ZK.sfx('slide');ZK.buzz('move');
    if(slip===p){found=true;fin=true;draw(dd);ZK.sfx('cap');api.say('Found your slip.');L.later(function(){api.done({solved:true,moves:opened.length,hints:hints,undos:undos,extra:{par:inst.par,n:N,cap:cap}})},D(420));return}
    if(opened.length>=cap)fail=true;draw(dd)}
  var ctl={
    undo:function(){if(fin||!opened.length)return false;L.clear();opened.pop();lastD=opened.length?opened[opened.length-1]:-1;fail=false;undos++;ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);draw();return true},
    restart:function(){if(fin)return;L.clear();opened=[];fail=false;lastD=-1;ZK.sfx('undo');ZK.unmark(stage);draw()},
    hint:function(h){if(fin)return null;if(fail)return 'Out of opens. Try Undo.';var x=nextDrawer();if(x<0)return 'Follow the slips from your own drawer.';hints++;ZK.unmark(stage);
      if(h<=1)return opened.length?'The slip you just read names the next drawer.':'Start with the drawer that has your own number.';
      if(h===2){ZK.mark(btn[x-1]);return 'Open this drawer.'}
      open(x);return 'Opened one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();L.destroy();root.textContent=''},
    lastEl:function(){return lastD>0?btn[lastD-1]:null},
    state:function(){return{opened:opened.slice(),fin:fin,fail:fail,busy:false,next:nextDrawer()}}};
  draw();idle=ZK.idle(stage,25000);
  if(lv===1)ghost=ZK.ghost(stage,[{tap:btn[p-1],hold:1000}],{id:ID,level:1});
  return ctl}
ZK.override({id:ID,name:'Hundred Drawers',family:'number',theme:'F10',calm:true,
  blurb:'Find your number among drawers by following the slips.',
  how:'Open the drawer with your number. Each slip names the next drawer. Find your own slip.',
  areas:['memory','flex'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'Found in '+m+' open'+(m===1?'':'s')+'. Following the slips takes '+p+'.'}}});
})();
