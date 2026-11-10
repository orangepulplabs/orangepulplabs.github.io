/* Zest v6: River Ferry. Overrides puzzles_d4.js 'river-ferry' (original kept in ZK.orig). Same generator, exact BFS and par (PZD4 rf*).
   The scene IS the rules: animal/plant sprites on two banks, a boat with the farmer, and "who bites whom" chips above the river. Tap a passenger to load it,
   tap the boat to sail. Leaving a bitten pair alone draws an amber link between them and the boat refuses (kind wobble, no red). Exact BFS gives the stuck chip. */
(function(){
var ID='river-ferry',NS='http://www.w3.org/2000/svg';
/* drawn ink sprites in the Zest sketch style (1B1916 ink, flat paper colours); no emoji */
var G0='<g stroke="#1B1916" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">';
var SPR={
wolf:G0+'<path d="M10 9l7 9M38 9l-7 9" fill="none"/><path d="M9 8l9 8 6-2 6 2 9-8-1 14c3 4 3 9 0 13l-6 6c-2 2-5 3-8 3s-6-1-8-3l-6-6c-3-4-3-9 0-13z" fill="#9A958C"/><path d="M17 30c2-3 12-3 14 0l-3 8c-2 2-6 2-8 0z" fill="#E6E1D7"/><circle cx="18" cy="24" r="1.6" fill="#1B1916"/><circle cx="30" cy="24" r="1.6" fill="#1B1916"/><path d="M21.5 32h5l-2.5 3z" fill="#1B1916"/></g>',
goat:G0+'<path d="M18 13c-2-6-7-9-11-7 3 1 6 4 7 8zM30 13c2-6 7-9 11-7-3 1-6 4-7 8z" fill="#C9B48A"/><path d="M15 17c-4-1-8 0-10 3 3 2 7 2 10 0zM33 17c4-1 8 0 10 3-3 2-7 2-10 0z" fill="#E6E1D7"/><path d="M16 12h16c2 4 2 9 1 14l-2 9c-1 3-4 5-7 5s-6-2-7-5l-2-9c-1-5-1-10 1-14z" fill="#F7F4EE"/><path d="M21 38c0 4 2 7 3 8 1-1 3-4 3-8" fill="#E6E1D7"/><circle cx="19.5" cy="22" r="1.6" fill="#1B1916"/><circle cx="28.5" cy="22" r="1.6" fill="#1B1916"/><path d="M21.5 31.5c1.5 1 3.5 1 5 0" fill="none"/></g>',
cabbage:G0+'<circle cx="24" cy="26" r="17" fill="#8FC27A"/><path d="M24 43c-7-4-10-11-8-19M24 43c7-4 10-11 8-19M24 43V20" fill="none" stroke-width="2"/><path d="M14 16c4-6 16-6 20 0-3 3-7 4-10 4s-7-1-10-4z" fill="#B9DE9A"/></g>',
hen:G0+'<path d="M19 11c0-4 3-5 4-3 1-3 4-3 5 0 2-2 5 0 3 4z" fill="#E8590C"/><path d="M13 24c0-8 5-13 11-13s11 5 11 13v6c0 7-5 11-11 11s-11-4-11-11z" fill="#F7F4EE"/><path d="M33 23l8 3-8 3z" fill="#F6B73C"/><path d="M30 30c1 3 0 6-2 6s-2-3-1-6" fill="#E8590C"/><circle cx="27" cy="21" r="1.6" fill="#1B1916"/><path d="M15 31c3 2 7 2 9 0" fill="none" stroke-width="2"/></g>',
fox:G0+'<path d="M9 7l10 9h10l10-9 1 16c2 5 0 9-4 12l-7 6c-3 2-7 2-10 0l-7-6c-4-3-6-7-4-12z" fill="#E8590C"/><path d="M9 25c4 0 9 2 11 6l4 2 4-2c2-4 7-6 11-6-1 4-3 8-6 10l-7 6c-1 1-2 1-4 1s-3 0-4-1l-7-6c-3-2-5-6-6-10z" fill="#F7F4EE"/><circle cx="18" cy="22" r="1.6" fill="#1B1916"/><circle cx="30" cy="22" r="1.6" fill="#1B1916"/><path d="M22 37h4l-2 3z" fill="#1B1916"/></g>',
grain:G0+'<path d="M24 44V14M24 44l-8-14M24 44l8-14" fill="none"/><path d="M24 6c3 2 3 6 0 9-3-3-3-7 0-9zM16 13c4 0 6 3 6 7-4 0-6-3-6-7zM32 13c-4 0-6 3-6 7 4 0 6-3 6-7zM12 21c4 0 6 3 6 7-4 0-6-3-6-7zM36 21c-4 0-6 3-6 7 4 0 6-3 6-7z" fill="#E7C88F"/><path d="M17 36h14" fill="none" stroke="#B0700A" stroke-width="3.4"/></g>',
dog:G0+'<path d="M14 13h20c3 3 4 8 3 13l-2 8c-1 5-6 8-11 8s-10-3-11-8l-2-8c-1-5 0-10 3-13z" fill="#C9965E"/><path d="M14 13c-6 0-9 6-8 14 1 3 4 4 6 2l3-12M34 13c6 0 9 6 8 14-1 3-4 4-6 2l-3-12" fill="#8A5A2B"/><path d="M18 32c1-3 11-3 12 0l-2 6c-2 2-6 2-8 0z" fill="#F0DDBF"/><circle cx="19" cy="23" r="1.6" fill="#1B1916"/><circle cx="29" cy="23" r="1.6" fill="#1B1916"/><path d="M21.5 31h5l-2.5 3z" fill="#1B1916"/></g>',
farmer:G0+'<path d="M15 36c2-4 5-6 9-6s7 2 9 6v6H15z" fill="#6E9B5A"/><circle cx="24" cy="23" r="9" fill="#F2C9A0"/><path d="M6 17c6 2 30 2 36 0-3-2-8-3-9-3-1-6-5-9-9-9s-8 3-9 9c-1 0-6 1-9 3z" fill="#E7C88F"/><path d="M15 14c6 1 12 1 18 0" fill="none" stroke="#E8590C" stroke-width="2.6"/><circle cx="21" cy="24" r="1.4" fill="#1B1916"/><circle cx="27" cy="24" r="1.4" fill="#1B1916"/><path d="M21.5 28c1.5 1.2 3.5 1.2 5 0" fill="none" stroke-width="2"/></g>'};
function ico(k,px){return '<svg viewBox="0 0 48 48" width="'+px+'" height="'+px+'" aria-hidden="true" focusable="false">'+SPR[k]+'</svg>'}
var ZAP='<svg viewBox="0 0 20 24" width="14" height="17" aria-hidden="true"><path d="M12 1L3 14h6l-2 9 10-14h-6z" fill="#F6B73C" stroke="#1B1916" stroke-width="1.8" stroke-linejoin="round"/></svg>';

function sv(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
/* aha filter: from level 4 the best plan must carry something BACK across (the classic trick); level 1-3 may be the plain classic */
/* ladder: n items by level; par is exactly 2n-1 (a breather) or 2n+1 (the full trick); sawtooth: every third level is the lighter one. The BFS par is exact. */
var NAMES=['wolf','goat','cabbage','hen','fox','grain','dog'];
function make(level,rng){var n=level<=3?3:level<=9?4:level<=17?5:6,high=level===1||(level>1&&level%3!==1),want=high?2*n+1:2*n-1,inst=null,k;
  if(n===3&&level===1){want=7}
  for(k=0;k<4000&&!inst;k++){var bad=[],pr=.2+rng()*.45,i,j;for(i=0;i<n;i++)for(j=i+1;j<n;j++)if(rng()<pr)bad.push([i,j]);if(!bad.length)continue;
    var path=PZD4.rfPath(n,bad,0,0);if(!path||path.length!==want)continue;
    if(level>=4&&high&&!path.some(function(s){return s.f===0&&s.item>=0}))continue;
    inst={title:'Level '+level,level:level,par:path.length,n:n,names:NAMES.slice(0,n),bad:bad}}
  if(!inst){var b0=n===3?[[0,1],[1,2]]:null;inst=PZD4.rfMake(level,rng);inst.level=level}
  return inst}
function rfSafe(mask,bad,side){for(var k=0;k<bad.length;k++){if(((mask>>bad[k][0])&1)===side&&((mask>>bad[k][1])&1)===side)return false}return true}
var CSS='.rf{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:var(--font);--rf-w1:#BFE3F4;--rf-w2:#8FC8E6;--rf-g:#B9DE9A;--rf-g2:#9CC77B;--rf-wood:#A8723A}'
+':root[data-theme="dark"] .rf{--rf-w1:#1E3A52;--rf-w2:#142A3D;--rf-g:#3E5B34;--rf-g2:#314A29;--rf-wood:#C48D52}'
+'.rf-rules{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:34px}'
+'.rf-chip{display:flex;align-items:center;gap:2px;padding:3px 8px;border-radius:17px;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--line,#ddd);font-size:1.2rem;line-height:1.2}'
+'.rf-chip span{display:flex;align-items:center;gap:3px}.rf-chip svg{display:block}.rf-it svg{display:block;pointer-events:none}'
+'.rf-board{position:relative;width:100%;border-radius:26px;overflow:hidden;background:linear-gradient(90deg,var(--rf-g) 0,var(--rf-g) 19%,var(--rf-w1) 19%,var(--rf-w2) 81%,var(--rf-g) 81%);box-shadow:inset 0 2px 0 rgba(255,255,255,.3),0 6px 18px rgba(20,60,90,.18);touch-action:manipulation;user-select:none;-webkit-user-select:none}'
+'.rf-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'
+'.rf-svg.rf-top{z-index:4;overflow:visible}'
+'.rf-it{all:unset;position:absolute;left:0;top:0;width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:2rem;line-height:1;cursor:pointer;background:rgba(255,255,255,.55);box-shadow:0 2px 0 rgba(0,0,0,.12);transition:transform .32s cubic-bezier(.3,1.12,.6,1);will-change:transform;-webkit-tap-highlight-color:transparent}'
+':root[data-theme="dark"] .rf-it{background:rgba(237,230,216,.82)}:root[data-theme="dark"] .rf-chip{background:#EDE6D8;box-shadow:none}.rf-it:focus-visible,.rf-boat:focus-visible{outline:3px solid var(--ink);outline-offset:2px}'
+'.rf-it.sail{transition:transform .48s cubic-bezier(.45,0,.3,1)}'
+'.rf-boat{all:unset;position:absolute;left:0;top:0;width:100px;height:62px;cursor:pointer;transition:transform .48s cubic-bezier(.45,0,.3,1);will-change:transform;z-index:3;-webkit-tap-highlight-color:transparent}'
+'.rf-boat svg{width:100%;height:100%;overflow:visible}.rf-go{position:absolute;right:-6px;top:-12px;width:28px;height:28px;border-radius:50%;background:var(--accent,#E8590C);line-height:0;box-shadow:0 2px 6px rgba(0,0,0,.25)}'
+'.rf-farmer{position:absolute;left:4px;top:-30px;width:44px;height:44px;line-height:0;pointer-events:none}'
+'@media (prefers-reduced-motion:reduce){.rf-it,.rf-it.sail,.rf-boat{transition:none}}.zk-rm .rf-it,.zk-rm .rf-it.sail,.zk-rm .rf-boat{transition:none}';
function mount(root,inst,api){ZK.css(CSS,'rf-css');root.textContent='';var R={path:PZD4.rfPath,safe:rfSafe},n=inst.n,bad=inst.bad,names=inst.names,rm=ZK.rm(api);
  var mask=0,f=0,boat=-1,hist=[],busy=false,fin=false,hints=0,undos=0,moves=0,ghost=null,idle=null,offs=[],last=null,W=300,Hh=300,i;
  var stage=document.createElement('div');stage.className='rf zk-stage zk-host'+(rm?' zk-rm':'');
  var rules=document.createElement('div');rules.className='rf-rules';rules.setAttribute('aria-label','Pairs that cannot be left alone');
  bad.forEach(function(b){var c=document.createElement('div');c.className='rf-chip';c.setAttribute('aria-label',names[b[0]]+' and '+names[b[1]]+' cannot be left alone');c.innerHTML='<span aria-hidden="true">'+ico(names[b[0]],26)+ZAP+ico(names[b[1]],26)+'</span>';rules.appendChild(c)});
  var board=document.createElement('div');board.className='rf-board zk-board';board.setAttribute('role','group');board.setAttribute('aria-label','River with a boat');
  var svg=sv('svg',{'aria-hidden':'true','class':'rf-svg'});board.appendChild(svg);
  var its=[];for(i=0;i<n;i++)(function(i){var b=document.createElement('button');b.type='button';b.className='rf-it';b.setAttribute('data-zkc','');b.innerHTML=ico(names[i],42);b.onclick=function(){tapItem(i)};its.push(b);board.appendChild(b)})(i);
  var bt=document.createElement('button');bt.type='button';bt.className='rf-boat';bt.setAttribute('aria-label','Sail across');
  bt.innerHTML='<svg viewBox="0 0 100 62" aria-hidden="true"><path d="M4 30h92l-14 26H18z" fill="var(--rf-wood)" stroke="#5B3A15" stroke-width="3" stroke-linejoin="round"/><path d="M12 38h76" stroke="#5B3A15" stroke-width="2" opacity=".45"/></svg><span class="rf-farmer" aria-hidden="true">'+ico('farmer',44)+'</span><span class="rf-go" aria-hidden="true"><svg viewBox="0 0 28 28" width="28" height="28"><path d="M8 14h11M14 8.5l5.5 5.5-5.5 5.5" fill="none" stroke="#1B1916" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  bt.onclick=function(){sail()};board.appendChild(bt);
  var top=sv('svg',{'aria-hidden':'true','class':'rf-svg rf-top'});board.appendChild(top);
  var pips=ZK.pips(inst.par);stage.appendChild(rules);stage.appendChild(board);stage.appendChild(pips.el);root.appendChild(stage);
  var goEl=bt.querySelector('.rf-go');
  function layout(){W=board.clientWidth||300;Hh=Math.max(250,n*58+24);board.style.height=Hh+'px';svg.setAttribute('viewBox','0 0 '+W+' '+Hh);top.setAttribute('viewBox','0 0 '+W+' '+Hh);place(true)}
  function rowY(i){return 12+i*58+(Hh-24-n*58)/2}
  function boatX(side){var l=Math.round(W*.19)+6,r=Math.round(W*.81)-6-100;return side?r:l}
  function itemPos(i){if(boat===i){var bx=boatX(f);return[bx+(f?4:44),Hh/2-34]}var s=(mask>>i)&1;return[s?W-8-52:8,rowY(i)]}
  function place(now){var bx=boatX(f);bt.style.transform='translate('+bx+'px,'+(Hh/2-8)+'px)';   /* the hull is symmetric: no flip (a flipping parent squashed the boat to a sliver mid-crossing) */
    its.forEach(function(b,i){var p=itemPos(i);b.style.transform='translate('+p[0]+'px,'+p[1]+'px)';b.setAttribute('aria-label',names[i]+(boat===i?', in the boat':(((mask>>i)&1)?', far bank':', near bank')))});
    goEl.style.display=fin?'none':'';var fm=bt.querySelector('.rf-farmer');fm.style.transform='scaleX('+(f?-1:1)+')';fm.style.left=f?'auto':'4px';fm.style.right=f?'4px':'auto';goEl.style.transform='scaleX('+(f?-1:1)+')';goEl.style.right=f?'auto':'-6px';goEl.style.left=f?'-6px':'auto'}
  function onBank(){var o=[];for(var i=0;i<n;i++)if(((mask>>i)&1)===f&&boat!==i)o.push(i);return o}
  function dangerPairs(){var o=onBank(),pr=[];bad.forEach(function(b){if(o.indexOf(b[0])>=0&&o.indexOf(b[1])>=0)pr.push(b)});return pr}
  var warn=false;
  /* 1.2.4 (river-ferry-01): a bank is one column, so a straight link ran BEHIND the tiles in between and its zap landed next to the wrong animal.
     Each biting pair now gets an arc that leaves both tiles on their river side and bows out into the water (wider for pairs further apart, so arcs nest),
     drawn on a layer above the tiles, with an amber ring on both ends and the zap at the arc's peak. */
  function links(){svg.textContent='';top.textContent='';if(busy||fin||(boat<0&&!warn))return;var side=f;dangerPairs().forEach(function(b){var p=itemPos(b[0]),q=itemPos(b[1]),dir=side?-1:1,
      x0=side?p[0]:p[0]+52,x1=side?q[0]:q[0]+52,y0=p[1]+26,y1=q[1]+26,gap=Math.abs(b[1]-b[0]),bow=34+gap*16,cx=(x0+x1)/2+dir*bow*2,cy=(y0+y1)/2,px=(x0+x1)/4+cx/2,py=cy;
    var g=sv('g',{'data-link':names[b[0]]+'-'+names[b[1]]});
    g.appendChild(sv('path',{d:'M'+x0+' '+y0+'Q'+cx+' '+cy+' '+x1+' '+y1,fill:'none',stroke:'#1B1916','stroke-width':6.5,'stroke-linecap':'round',opacity:.28}));
    g.appendChild(sv('path',{d:'M'+x0+' '+y0+'Q'+cx+' '+cy+' '+x1+' '+y1,fill:'none',stroke:'#E9A23B','stroke-width':4,'stroke-dasharray':'3 6','stroke-linecap':'round'}));
    [p,q].forEach(function(r){g.appendChild(sv('rect',{x:r[0]-3,y:r[1]-3,width:58,height:58,rx:18,fill:'none',stroke:'#E9A23B','stroke-width':3.5}))});
    g.appendChild(sv('path',{d:'M'+(px+2)+' '+(py-11)+'l-9 13h6l-2 9 10-14h-6z',fill:'#F6B73C',stroke:'#1B1916','stroke-width':1.8,'stroke-linejoin':'round'}));top.appendChild(g)})}
  function refresh(){place();links();pips.set(moves);bt.classList.toggle('zk-p',true)}
  function tapItem(i){if(fin||busy)return;warn=false;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    if(boat===i){boat=-1;ZK.sfx('undo');ZK.buzz('tap');refresh();return}
    if(((mask>>i)&1)!==f){ZK.wrong(its[i]);return}
    boat=i;last=its[i];ZK.sfx('lift');ZK.buzz('tap');refresh();ZK.anim(its[i],[{scale:'1.2'},{scale:'1'}],240,ZK.SPRING)}
  function stuckCheck(){ZK.stuck(stage,false);if(fin)return;if(!R.path(n,bad,mask,f))ZK.stuck(stage,true,{text:'This plan can’t finish',onUndo:undo})}
  function sail(){if(fin||busy)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    var m2=boat<0?mask:mask^(1<<boat);
    if(!R.safe(m2,bad,f)){var pr=dangerPairs();warn=true;links();ZK.wrong(bt);pr.forEach(function(b){ZK.anim(its[b[0]],[{rotate:'0deg'},{rotate:'-8deg'},{rotate:'8deg'},{rotate:'0deg'}],300);ZK.anim(its[b[1]],[{rotate:'0deg'},{rotate:'8deg'},{rotate:'-8deg'},{rotate:'0deg'}],300)});api.say('Not safe to leave those two alone.');return}
    busy=true;hist.push({mask:mask,f:f,boat:boat});var carried=boat;svg.textContent='';top.textContent='';
    its.forEach(function(b){b.classList.add('sail')});f=1-f;place();ZK.sfx('slide');ZK.buzz('move');
    setTimeout(function(){its.forEach(function(b){b.classList.remove('sail')});mask=m2;boat=-1;busy=false;moves++;api.moved();if(carried>=0)last=its[carried];
      place();links();pips.set(moves);ZK.sfx('clack');ZK.buzz('tap');if(carried>=0)ZK.anim(its[carried],[{scale:'1.2'},{scale:'1'}],260,ZK.SPRING);
      /* 1.2.4 (river-ferry-02): the win comes after the boat has landed and the crossing is counted (it used to fire mid-river, with the header one behind) */
      if(mask===(1<<n)-1&&f===1){fin=true;place();api.say('Everyone is across.');setTimeout(function(){api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:220);return}
      api.say('Crossing '+moves+' done.');stuckCheck()},rm?20:500)}
  function undo(){if(fin||busy)return false;if(boat>=0){boat=-1;refresh();return true}if(!hist.length)return false;var h=hist.pop();mask=h.mask;f=h.f;boat=-1;moves=Math.max(0,moves-1);undos++;ZK.stuck(stage,false);ZK.sfx('undo');ZK.buzz('tap');refresh();return true}
  if(window.ResizeObserver){var ro=new ResizeObserver(function(){layout()});ro.observe(board);offs.push(function(){ro.disconnect()})}
  layout();refresh();
  if(inst.level===1){ghost=ZK.ghost(stage,[{tap:its[1]},{tap:bt}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  return{undo:undo,restart:function(){if(fin||busy)return;mask=0;f=0;boat=-1;hist=[];moves=0;ZK.unmark(stage);ZK.stuck(stage,false);ZK.sfx('undo');refresh()},
    hint:function(lv){if(fin||busy)return null;hints++;ZK.unmark(stage);var p=R.path(n,bad,mask,f);
      if(!p){ZK.mark(document.querySelector('.pz5 [data-undo]'));return 'This plan can’t finish. Undo a crossing.'}
      var want=p[0].item;if(lv<=1){ZK.mark(want<0?bt:its[want]);return want<0?'The boat goes over empty.':'This one goes in the boat.'}
      if(lv===2){ZK.mark(want<0?bt:its[want]);ZK.mark(bt);return 'Load it, then sail.'}
      if(boat!==want){boat=want;refresh()}setTimeout(sail,rm?0:320);return 'Sailing for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{mask:mask,f:f,boat:boat,fin:fin,moves:moves}}}}
ZK.override({id:ID,name:'River Ferry',family:'move',theme:'F7',calm:true,
  blurb:'Ferry everyone across without leaving a bitten pair alone.',
  how:'Tap a passenger, then the boat. Never leave a biting pair alone.',
  areas:['control','space'],levels:30,secs:100,make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;return{stars:pzStarsByPar(m,p,h),line:m+' crossing'+(m===1?'':'s')+(m<=p?', the fewest.':'. The fewest is '+p+'.')}}});
})();
