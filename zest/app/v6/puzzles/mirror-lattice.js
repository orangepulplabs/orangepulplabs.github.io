/* Zest v6: Mirror Lattice. Overrides puzzles_e4.js 'mirror-lattice' (original kept in ZK.orig). Same generator and par (PZE4.ml): every gap keeps a visible mirror twin.
   Pick a shape in the palette (it stays picked), then tap gaps to drop it in: one tap per gap, no numbered buttons. Dashed mirrors cross the board.
   Each placed shape flips in as a reflection. Press and hold a gap on early levels to see its twin. When every gap is full and something is off, the
   wrong gaps and their twins pulse amber (never red), and you can fix them. No per-tap right/wrong, so it is deduction, not guessing. */
(function(){
var ID='mirror-lattice',NS='http://www.w3.org/2000/svg',NAMES=PZE4.ml.names,COL=['#6B7280','#2B7FDB','#E8590C','#D4A100','#2F9E6B','#8B5CC9'];
function sv(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
var make=PZE4.ml.make;
function motif(id){var s=sv('svg',{viewBox:'0 0 10 10','aria-hidden':'true',focusable:'false'}),c=COL[id],f={fill:c,stroke:'none'};
  if(id===0)s.appendChild(sv('circle',{cx:5,cy:5,r:1.6,fill:c}));
  else if(id===1)s.appendChild(sv('circle',{cx:5,cy:5,r:3.1,fill:'none',stroke:c,'stroke-width':1.5}));
  else if(id===2)s.appendChild(sv('polygon',{points:'5,1.2 8.8,5 5,8.8 1.2,5',fill:c}));
  else if(id===3)s.appendChild(sv('polygon',{points:'5,.8 6.2,3.9 9.3,5 6.2,6.1 5,9.2 3.8,6.1 .7,5 3.8,3.9',fill:c}));
  else if(id===4){s.appendChild(sv('rect',{x:1.8,y:1.8,width:6.4,height:6.4,fill:'none',stroke:c,'stroke-width':1.3}));s.appendChild(sv('rect',{x:4,y:4,width:2,height:2,fill:c}))}
  else s.appendChild(sv('polygon',{points:'4,1.2 6,1.2 6,4 8.8,4 8.8,6 6,6 6,8.8 4,8.8 4,6 1.2,6 1.2,4 4,4',fill:c}));
  return s}
var CSS='.ml{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font)}'
+'.ml-board{position:relative;width:100%;border-radius:22px;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--line,#ddd),0 6px 18px rgba(0,0,0,.1);padding:6px;box-sizing:border-box;touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.ml-grid{position:relative;display:grid;gap:3px}'
+'.ml-c{all:unset;position:relative;aspect-ratio:1;border-radius:10px;background:var(--bg-soft,rgba(120,120,120,.09));display:flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent}.ml-c svg{width:78%;height:78%;pointer-events:none}'
+'button.ml-c{cursor:pointer;background:transparent;box-shadow:inset 0 0 0 2px var(--edge,#999);background-image:repeating-linear-gradient(45deg,transparent 0 5px,rgba(120,120,120,.12) 5px 7px)}button.ml-c.full{background-image:none;box-shadow:inset 0 0 0 2px var(--edge,#999)}button.ml-c:focus-visible{outline:3px solid var(--ink);outline-offset:1px}'
+'.ml-c.bad{box-shadow:inset 0 0 0 3px #E9A23B}.ml-c.tw{box-shadow:inset 0 0 0 3px var(--ink)}.ml-c.mk{outline:3px dashed var(--ink);outline-offset:1px}'
+'.ml-ax{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'
+'.ml-pal{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;width:100%}'
+'.ml-sw{all:unset;box-sizing:border-box;width:54px;height:58px;border-radius:16px;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--edge,#999);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .2s cubic-bezier(.34,1.56,.64,1);-webkit-tap-highlight-color:transparent}.ml-sw svg{width:34px;height:34px}'
+'.ml-sw.on{transform:translateY(-6px);box-shadow:0 0 0 3.5px var(--ink),0 8px 14px rgba(0,0,0,.2)}.ml-sw:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'@media (prefers-reduced-motion:reduce){.ml-sw{transition:none}}.zk-rm .ml-sw{transition:none}';

function mount(root,inst,api){ZK.css(CSS,'ml-css');root.textContent='';var N=inst.N,miss=inst.miss,T=inst.grid,rm=ZK.rm(api),cur={},hist=[],steps=0,hints=0,undos=0,fin=false,pick=0,ghost=null,idle=null,offs=[],last=null,twinC=null,badSet=null,mk=-1,i;
  var stage=document.createElement('div');stage.className='ml zk-stage zk-host'+(rm?' zk-rm':'');
  var ctr=ZK.counter({icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M5 7l5 5-5 5zM19 7l-5 5 5 5z" fill="#2B7FDB" stroke="#2b2b2b" stroke-width="1.6" stroke-linejoin="round"/></svg>',label:function(x){return x+' gaps to fill'}});
  var board=document.createElement('div');board.className='ml-board zk-board';board.setAttribute('role','group');board.setAttribute('aria-label','Lattice '+N+' by '+N+' with '+miss.length+' gaps');
  var grid=document.createElement('div');grid.className='ml-grid';grid.style.gridTemplateColumns='repeat('+N+',1fr)';var cells=[];
  function rc(c){return 'row '+(Math.floor(c/N)+1)+', column '+(c%N+1)}
  for(var c=0;c<N*N;c++)(function(c){var g=miss.indexOf(c)>=0,e=document.createElement(g?'button':'div');e.className='ml-c';e.setAttribute('data-zkc','');
    if(g){e.type='button';e.onclick=function(){tapGap(c)};e.addEventListener('pointerdown',function(){if(inst.level<=6&&!fin)showTwin(c)});e.addEventListener('pointerup',function(){setTimeout(clearTwin,700)});e.addEventListener('pointerleave',function(){clearTwin()})}
    else{e.appendChild(motif(T[c]));e.setAttribute('role','img');e.setAttribute('aria-label',rc(c)+', '+NAMES[T[c]])}
    cells.push(e);grid.appendChild(e)})(c);
  var ax=sv('svg',{viewBox:'0 0 100 100',preserveAspectRatio:'none','class':'ml-ax','aria-hidden':'true'});
  ax.appendChild(sv('path',{d:'M50 0V100M0 50H100'+(inst.sym==='D4'?'M0 0L100 100M100 0L0 100':''),stroke:'var(--ink)','stroke-width':.8,'stroke-dasharray':'2.5 2.5',opacity:.5,fill:'none','vector-effect':'non-scaling-stroke'}));
  board.appendChild(grid);board.appendChild(ax);
  var pal=document.createElement('div');pal.className='ml-pal';pal.setAttribute('role','group');pal.setAttribute('aria-label','Shapes');var sws=[];
  for(i=0;i<inst.k;i++)(function(id){var b=document.createElement('button');b.type='button';b.className='ml-sw';b.setAttribute('aria-label',NAMES[id]);b.appendChild(motif(id));b.onclick=function(){setPick(id)};sws.push(b);pal.appendChild(b)})(i);
  stage.appendChild(ctr.el);stage.appendChild(board);stage.appendChild(pal);root.appendChild(stage);
  function setPick(id){pick=id;ZK.sfx('press');ZK.buzz('tap');paint()}
  function twinsOf(c){var im=PZE4.ml.images(N,inst.sym,Math.floor(c/N),c%N),o=[];im.forEach(function(x){if(x!==c&&miss.indexOf(x)<0)o.push(x)});return o}
  function showTwin(c){clearTwin();twinC=twinsOf(c);twinC.forEach(function(x){cells[x].classList.add('tw')})}
  function clearTwin(){if(twinC){twinC.forEach(function(x){cells[x].classList.remove('tw')});twinC=null}}
  function paint(){var left=0;miss.forEach(function(c){var e=cells[c],v=cur[c];e.textContent='';if(v!==undefined){e.appendChild(motif(v));e.classList.add('full')}else{e.classList.remove('full');left++}
      e.classList.toggle('bad',!!(badSet&&badSet[c]));e.classList.toggle('mk',mk===c);e.setAttribute('aria-label','Gap, '+rc(c)+', '+(v===undefined?'empty':NAMES[v]))});
    sws.forEach(function(b,id){b.classList.toggle('on',id===pick)});ctr.set(left,true)}
  function check(){var bad={},any=false;miss.forEach(function(c){if(cur[c]!==T[c]){bad[c]=1;any=true}});return any?bad:null}
  function tapGap(c){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);mk=-1;badSet=null;
    if(cur[c]===pick){hist.push([c,cur[c]]);delete cur[c];steps++;paint();ZK.sfx('undo');return}
    hist.push([c,cur[c]]);cur[c]=pick;steps++;api.moved();last=cells[c];paint();
    var el=cells[c].firstChild;if(el){el.style.transformOrigin='center';ZK.anim(el,[{transform:'scaleX(-1) scale(.5)',opacity:.2},{transform:'scaleX(1.1) scale(1.1)',opacity:1,offset:.65},{transform:'scaleX(1) scale(1)',opacity:1}],320,ZK.SPRING)}
    ZK.sfx('click',{p:pick*2});ZK.buzz('tap');
    if(miss.every(function(m){return cur[m]!==undefined})){var bad=check();
      if(!bad){fin=true;setTimeout(function(){api.done({solved:true,moves:steps,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:240)}
      else{badSet=bad;paint();ZK.sfx('soft');ZK.buzz('wrong');Object.keys(bad).forEach(function(k){var tw=twinsOf(+k)[0];if(tw!==undefined){cells[tw].classList.add('tw');setTimeout(function(){cells[tw].classList.remove('tw')},1500)}});
        setTimeout(function(){badSet=null;if(!fin)paint()},1800);api.say('Not symmetric yet. The amber gaps and their twins are marked.')}}}
  paint();
  if(inst.level===1){var g0=miss[0];ghost=ZK.ghost(stage,[{tap:sws[T[g0]],up:function(){}},{tap:cells[g0]}],{id:ID,level:1});pick=T[g0];paint()}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin||!hist.length)return false;var h=hist.pop();if(h[1]===undefined)delete cur[h[0]];else cur[h[0]]=h[1];steps=Math.max(0,steps-1);undos++;badSet=null;paint();ZK.sfx('undo');ZK.buzz('tap');return true}
  function wrongOne(){for(var k=0;k<miss.length;k++)if(cur[miss[k]]!==T[miss[k]])return miss[k];return -1}
  return{undo:undo,
    restart:function(){if(fin)return;cur={};hist=[];badSet=null;mk=-1;ZK.unmark(stage);paint();ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;hints++;ZK.unmark(stage);var c=wrongOne();if(c<0)return null;mk=c;
      if(lv<=1){paint();return cur[c]===undefined?'Try the marked gap.':'The marked gap is not right yet.'}
      if(lv===2){paint();showTwin(c);setTimeout(clearTwin,2500);return 'Its mirror twin is outlined.'}
      pick=T[c];tapGap(c);return 'Filled it for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{filled:Object.keys(cur).length,fin:fin}}}}
ZK.override({id:ID,name:'Mirror Lattice',family:'grid',theme:'F8',calm:true,
  blurb:'Fill the gaps so the lattice mirrors itself.',
  how:'Pick a shape, tap the gaps. The dashed lines are mirrors.',
  areas:['space','flex'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var par=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;return{stars:pzStarsByPar(m,par,h),line:m+' placement'+(m===1?'':'s')+(m<=par?', one per gap.':'. One per gap is '+par+'.')}}});
})();
