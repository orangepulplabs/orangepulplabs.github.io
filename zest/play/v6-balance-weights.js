/* Zest v6: Balance Weights. Overrides the puzzles_c2.js entry; the original stays in ZK.orig['balance-weights'].
   An object sits on the left pan. Put weights on either pan until the pans balance, using as few weights as you can. par = the fewest weights (exact, PZC2.bw.table).
   v5: three-state Left / Off / Right buttons per weight, a text status line, and a beam that tilted a fixed 7 degrees. Now: a real balance that tilts in proportion to the
   difference with a spring, weights as chips in a tray that you DRAG onto a pan (or tap a chip, then a pan), a tap on a placed chip returns it, and the object is a block on the left pan.
   The pan totals are numbers on the pans' bowls, the pips show weights used against par, and balanced = level beam, glowing pans, then the kit win.
   Curve (set and par per level): the 1,3,9,27 set for levels 1-8 (par 1,2,2,3,2,3,3,3), the 1,2,5,10,20,50 set for 9-14 (2,3,3,4,3,4), then 1,3,9,27,81 with a few 1,2,5,10,20,50 levels for 15-30
   (3,4,3,4,4,5,3,4,5 | 4,5,5,4,5,5,5), a dip after each climb. Aha filter: from level 2 whenever the pool allows it, EVERY fewest-weights answer needs a weight on the
   OBJECT's pan (like 8 = 9 - 1), so adding weights on one side the greedy way is the trap. No dead ends (a tap returns a weight), so no stuck chip. */
(function(){
var ID='balance-weights',BW=PZC2.bw;
var SPEC=[['A',1],['A',2],['A',2],['A',3],['A',2],['A',3],['A',3],['A',3],
 ['E',2],['E',3],['E',3],['E',4],['E',3],['E',4],
 ['C',3],['C',4],['C',3],['C',4],['C',4],['C',5],['C',3],['C',4],['C',5],
 ['E',4],['C',5],['E',5],['C',4],['C',5],['E',5],['C',5]];
var PARS=SPEC.map(function(s){return s[1]});
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var sp=SPEC[level-1],set=BW.sets[sp[0]],tb=BW.table(set),pool=[],aha=[],t;
  for(t=1;t<=(sp[0]==='A'&&level<=8?40:999);t++){if(tb[t]===sp[1]){if(level===1&&t>9)continue;pool.push(t);if(level>=2&&BW.solutions(set,t).every(function(x){return x.some(function(v){return v<0})}))aha.push(t)}}
  var P=level>=2&&aha.length?aha:pool;if(!P.length){for(t=1;t<=60;t++)if(tb[t]!==undefined)P.push(t)}
  var target=P[pzInt(rng,P.length)];
  return{level:level,title:'Level '+level,set:set.slice(),target:target,par:tb[target],aha:level<2||aha.length>0}}
window.V6BW={make:make,SPEC:SPEC,PARS:PARS};

var CSS=''
+'.bw{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:8px;font-family:var(--font);touch-action:manipulation;user-select:none;-webkit-user-select:none;--bw-a:0deg}'
+'.bw-scale{position:relative;width:100%;height:268px}'
+'.bw-post{position:absolute;left:50%;top:30px;width:12px;height:224px;margin-left:-6px;border-radius:6px;background:linear-gradient(90deg,var(--bw-wood2,#8a7a62),var(--bw-wood,#b09a78))}'
+'.bw-base{position:absolute;left:50%;bottom:0;width:120px;height:16px;margin-left:-60px;border-radius:8px;background:var(--bw-wood,#b09a78)}'
+'.bw-beam{position:absolute;left:3%;right:3%;top:30px;height:12px;margin-top:-6px;border-radius:6px;background:var(--bw-wood,#b09a78);box-shadow:inset 0 -3px 0 rgba(0,0,0,.2);transform:rotate(var(--bw-a));transition:transform .7s cubic-bezier(.3,1.35,.55,1)}'
+'.bw-pivot{position:absolute;left:50%;top:30px;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:var(--ink,#111);z-index:3}'
+'.bw-hang{position:absolute;top:6px;width:0;height:0;transform:translateY(var(--bw-d,0px));transition:transform .7s cubic-bezier(.3,1.35,.55,1)}'
+'.bw-hang.l{left:25%;--bw-d:var(--bw-dl,0px)}.bw-hang.r{right:25%;--bw-d:var(--bw-dr,0px)}'
+'.bw-hang::before{content:"";position:absolute;left:-50px;top:0;width:100px;height:52px;background:linear-gradient(to bottom right,transparent calc(50% - 1px),var(--bw-wood2,#8a7a62) 50%,transparent calc(50% + 1px)) left/50% 100% no-repeat,linear-gradient(to bottom left,transparent calc(50% - 1px),var(--bw-wood2,#8a7a62) 50%,transparent calc(50% + 1px)) right/50% 100% no-repeat}'
+'.bw-bowl{position:absolute;left:0;transform:translateX(-50%);top:52px;width:min(152px,calc((100vw - 40px)*.46));min-height:62px;box-sizing:border-box;padding:6px 6px 14px;display:flex;flex-wrap:wrap;gap:4px;justify-content:center;align-content:flex-start;border-radius:6px 6px 38px 38px;background:var(--surface,#fff);box-shadow:inset 0 0 0 2px var(--edge,#cfc7b8),inset 0 -6px 0 var(--bw-wood,#b09a78)}'
+'.bw-bowl.drop{box-shadow:inset 0 0 0 3px var(--accent,#E8590C),inset 0 -6px 0 var(--bw-wood,#b09a78);background:color-mix(in srgb,var(--surface,#fff) 90%,var(--accent,#E8590C))}'
+'.bw-tot{position:absolute;left:50%;top:-30px;transform:translateX(-50%);font:850 1.125rem/1 var(--font);font-variant-numeric:tabular-nums;color:var(--ink,#111);background:var(--surface,#fff);border-radius:14px;padding:4px 10px;box-shadow:0 0 0 1.5px var(--line,#ddd);pointer-events:none}'
+'.bw.ok .bw-bowl{box-shadow:inset 0 0 0 3px #2E8B57,inset 0 -6px 0 var(--bw-wood,#b09a78)}.bw.ok .bw-tot{background:var(--ok-bg,#ddefe2);color:var(--ok-ink,#14532d)}'
+'.bw-obj{box-sizing:border-box;min-width:44px;height:44px;padding:0 8px;border-radius:10px;background:var(--ink,#111);color:var(--surface,#fff);display:flex;align-items:center;justify-content:center;font:850 1.125rem/1 var(--font);font-variant-numeric:tabular-nums;pointer-events:none}'
+'.bw-w{all:unset;box-sizing:border-box;min-width:44px;height:44px;padding:0 6px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:850 1.0625rem/1 var(--font);font-variant-numeric:tabular-nums;color:#2B1700;background:radial-gradient(circle at 35% 30%,#FFE08A,#F0A82A);box-shadow:inset 0 -4px 0 rgba(0,0,0,.2),0 2px 3px rgba(0,0,0,.18);cursor:grab;touch-action:none;-webkit-tap-highlight-color:transparent;transition:transform .2s '+ZK.SPRING+'}'
+'.bw-w:focus-visible{outline:3px solid var(--ink,#000);outline-offset:2px}.bw-w.sel{transform:translateY(-8px) scale(1.1);box-shadow:0 0 0 4px var(--ink,#111),inset 0 -4px 0 rgba(0,0,0,.2),0 8px 12px rgba(0,0,0,.25)}'
+'.bw-w.drag{position:fixed;z-index:50;pointer-events:none;transform:scale(1.2);box-shadow:0 12px 18px rgba(0,0,0,.3),inset 0 -4px 0 rgba(0,0,0,.2);cursor:grabbing}'
+'.bw-w.big{border-radius:14px}.bw-w.zk-mark{outline-color:var(--ink,#111)}'
+'.bw-tray{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-content:center;width:100%;min-height:74px;box-sizing:border-box;padding:10px;border-radius:22px;background:var(--panel,rgba(120,110,95,.14));box-shadow:inset 0 0 0 1.5px var(--line,#ddd)}'
+'.bw-tray .bw-w{min-width:52px;height:52px}.bw-tray .bw-w.ph{visibility:hidden}'
+'.bw{--bw-wood:#b09a78;--bw-wood2:#8a7a62}:root[data-theme="dark"] .bw{--bw-wood:#8d7a5a;--bw-wood2:#6d5d44}'
+'@media (max-width:359px){.bw{width:calc(100% + 16px);max-width:none;margin:0 -8px}}'
+'@media (prefers-reduced-motion:reduce){.bw-beam,.bw-hang,.bw-w{transition:none}}.bw.zk-rm .bw-beam,.bw.zk-rm .bw-hang,.bw.zk-rm .bw-w{transition:none}';

function mount(root,inst,api){ZK.css(CSS,'bw-css');root.textContent='';
  var set=inst.set,n=set.length,rm=ZK.rm(api),pl=set.map(function(){return 0}),hist=[],hints=0,undos=0,fin=false,last=null,sel=-1,chips=[],ghost=null,idle=null,offs=[],sols=BW.solutions(set,inst.target),drag=null,i;
  var stage=document.createElement('div');stage.className='bw zk-stage zk-host'+(rm?' zk-rm':'');
  var scale=document.createElement('div');scale.className='bw-scale zk-board';scale.setAttribute('role','group');scale.setAttribute('aria-label','The balance');
  scale.innerHTML='<div class="bw-post"></div><div class="bw-base"></div><div class="bw-beam"></div><div class="bw-pivot"></div>';
  function pan(side){var h=document.createElement('div');h.className='bw-hang '+side;var bowl=document.createElement('div');bowl.className='bw-bowl';var tot=document.createElement('div');tot.className='bw-tot';bowl.appendChild(tot);h.appendChild(bowl);scale.appendChild(h);return{h:h,bowl:bowl,tot:tot}}
  var PL=pan('l'),PR=pan('r');
  var obj=document.createElement('div');obj.className='bw-obj';obj.textContent=inst.target;obj.setAttribute('aria-label','The object, weight '+inst.target);PL.bowl.appendChild(obj);
  var tray=document.createElement('div');tray.className='bw-tray';tray.setAttribute('role','group');tray.setAttribute('aria-label','Weights');
  var pips=ZK.pips(inst.par);
  set.forEach(function(v,k){var b=document.createElement('button');b.type='button';b.className='bw-w'+(v>=10?' big':'');b.setAttribute('data-zkc','');b.textContent=v;b.setAttribute('data-k',k);chips.push(b);tray.appendChild(b);bind(b,k)});
  stage.appendChild(scale);stage.appendChild(tray);stage.appendChild(pips.el);root.appendChild(stage);
  function sums(){var L=inst.target,R=0,u=0;for(var k=0;k<n;k++){if(pl[k]<0){L+=set[k];u++}else if(pl[k]>0){R+=set[k];u++}}return{L:L,R:R,u:u}}
  function tilt(s){if(s.L===s.R)return 0;var d=(s.L-s.R)/Math.max(s.L,s.R);return -Math.max(-14,Math.min(14,d*22))}
  function paint(){var s=sums(),a=tilt(s),W=scale.clientWidth||340,dy=0.25*W*Math.sin(a*Math.PI/180);stage.style.setProperty('--bw-a',a+'deg');stage.style.setProperty('--bw-dl',(-dy)+'px');stage.style.setProperty('--bw-dr',dy+'px');PL.tot.textContent=s.L;PR.tot.textContent=s.R;
    chips.forEach(function(c,k){var host=pl[k]<0?PL.bowl:pl[k]>0?PR.bowl:tray;if(c.parentNode!==host&&!c.classList.contains('drag')){if(host===tray){var nx=null;for(var q=k+1;q<n&&!nx;q++)if(chips[q].parentNode===tray)nx=chips[q];tray.insertBefore(c,nx)}else host.appendChild(c)}c.classList.toggle('sel',sel===k);
      c.setAttribute('aria-label','Weight '+set[k]+(pl[k]<0?', on the left pan':pl[k]>0?', on the right pan':', in the tray')+(sel===k?', picked':''))});
    PL.bowl.classList.toggle('drop',sel>=0&&pl[sel]!==-1);PR.bowl.classList.toggle('drop',sel>=0&&pl[sel]!==1);
    pips.set(s.u);scale.setAttribute('aria-label','The balance. Left '+s.L+', right '+s.R+(s.L===s.R?'. Balanced.':''))}
  function rects(){return chips.map(function(c){return c.getBoundingClientRect()})}
  function place(k,v,silent){if(fin||pl[k]===v)return;var before=rects();hist.push([k,pl[k]]);pl[k]=v;sel=-1;last=chips[k];api.moved();paint();
    var c=chips[k],a=before[k],b=c.getBoundingClientRect();if(!rm&&!silent&&a)ZK.anim(c,[{transform:'translate('+(a.left-b.left)+'px,'+(a.top-b.top)+'px) scale(1.15)'},{transform:'scale(1)'}],320,ZK.SPRING);
    if(!silent){ZK.sfx(v?'clack':'undo');ZK.buzz(v?'move':'tap')}
    var s=sums();if(s.L===s.R&&s.u>0){fin=true;stage.classList.add('ok');api.say('Balanced with '+s.u+' weight'+(s.u===1?'':'s')+'.');setTimeout(function(){api.done({solved:true,moves:s.u,hints:hints,undos:undos,extra:{par:inst.par,used:s.u,taps:hist.length}})},rm?0:180)}}
  function tapChip(k){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);
    if(pl[k]!==0){place(k,0);return}
    sel=sel===k?-1:k;paint();ZK.sfx('lift')}
  function tapPan(v){if(fin||sel<0)return;place(sel,v)}
  function sideAt(x){var r=scale.getBoundingClientRect();return x<r.left+r.width/2?-1:1}
  function bind(b,k){b.addEventListener('pointerdown',function(e){if(fin)return;drag={k:k,x:e.clientX,y:e.clientY,moved:false,id:e.pointerId};try{b.setPointerCapture(e.pointerId)}catch(x){}ZK.sfx('press')});
    b.addEventListener('pointermove',function(e){if(!drag||drag.k!==k)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!drag.moved&&Math.hypot(dx,dy)>8){drag.moved=true;ZK.ghostDone(ID);if(ghost)ghost.stop();var r=b.getBoundingClientRect();drag.w=r.width;drag.h=r.height;b.classList.add('drag');b.style.width=r.width+'px';b.style.height=r.height+'px';sel=-1;paint();ZK.sfx('lift')}
      if(drag.moved){b.style.left=(e.clientX-drag.w/2)+'px';b.style.top=(e.clientY-drag.h/2-52)+'px';var s=sideAt(e.clientX);PL.bowl.classList.toggle('drop',s<0&&pl[k]!==-1);PR.bowl.classList.toggle('drop',s>0&&pl[k]!==1)}});
    function end(e,cancel){if(!drag||drag.k!==k)return;var d=drag;drag=null;try{b.releasePointerCapture(d.id)}catch(x){}
      if(d.moved){b.classList.remove('drag');b.style.left=b.style.top=b.style.width=b.style.height='';var sr=scale.getBoundingClientRect(),y=e.clientY-52;
        PL.bowl.classList.remove('drop');PR.bowl.classList.remove('drop');
        if(!cancel&&y<sr.bottom&&y>sr.top-20)place(k,sideAt(e.clientX));else{paint();ZK.sfx('undo')}}
      else if(!cancel)tapChip(k)}
    b.addEventListener('pointerup',function(e){end(e,false)});b.addEventListener('pointercancel',function(e){end(e,true)});
    b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tapChip(k)}else if(e.key==='ArrowLeft')place(k,-1);else if(e.key==='ArrowRight')place(k,1)})}
  PL.bowl.addEventListener('click',function(e){if(e.target===PL.bowl||e.target===obj||e.target===PL.tot)tapPan(-1)});PR.bowl.addEventListener('click',function(e){if(e.target===PR.bowl||e.target===PR.tot)tapPan(1)});
  /* bowls are the drop targets for tap-then-tap; the whole hang area is tappable too */
  [PL,PR].forEach(function(P,ix){P.h.style.pointerEvents='none';P.bowl.style.pointerEvents='auto';P.bowl.style.minHeight='64px'});
  paint();
  function next(){var best=null,bs=-1e9,k,j;for(j=0;j<sols.length;j++){var sc=0;for(k=0;k<n;k++){if(pl[k]!==0&&pl[k]===sols[j][k])sc++;else if(pl[k]!==0)sc-=1.5}if(sc>bs){bs=sc;best=sols[j]}}
    if(!best)return null;for(k=0;k<n;k++)if(pl[k]!==0&&pl[k]!==best[k])return{k:k,v:0};for(k=n-1;k>=0;k--)if(pl[k]===0&&best[k]!==0)return{k:k,v:best[k]};return null}
  if(inst.level===1){var nx=next();if(nx){var gb=chips[nx.k];ghost=ZK.ghost(stage,[{tap:gb,down:function(){gb.classList.add('sel')},hold:700},{tap:nx.v>0?PR.bowl:PL.bowl,down:function(){(nx.v>0?PR:PL).bowl.classList.add('drop')},up:function(){gb.classList.remove('sel');PL.bowl.classList.remove('drop');PR.bowl.classList.remove('drop')},cancel:function(){gb.classList.remove('sel');PL.bowl.classList.remove('drop');PR.bowl.classList.remove('drop')},hold:700}],{id:ID,level:1})}}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin||!hist.length)return false;var h=hist.pop();pl[h[0]]=h[1];sel=-1;undos++;paint();ZK.unmark(stage);ZK.sfx('undo');ZK.buzz('tap');return true}
  return{undo:undo,
    restart:function(){if(fin)return;pl=set.map(function(){return 0});hist=[];sel=-1;paint();ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var t=next();if(!t)return null;hints++;ZK.unmark(stage);var wt=set[t.k];
      if(lv<=1){ZK.mark(chips[t.k]);return t.v===0?'One weight on a pan is not part of the shortest way.':'The shortest way uses '+inst.par+' weight'+(inst.par===1?'':'s')+'. Start with the marked one.'}
      if(lv===2){ZK.mark(chips[t.k]);return t.v===0?'Take the '+wt+' off.':'Put the '+wt+' on the '+(t.v>0?'right':'left')+' pan.'}
      place(t.k,t.v);return 'Placed one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{pl:pl.slice(),sums:sums(),fin:fin,sel:sel}}}}

ZK.override({id:ID,name:'Balance Weights',family:'number',theme:'F5',
  blurb:'Balance a scale with the fewest weights.',
  how:'Drag weights onto either pan until the scale balances. Fewer weights is better.',
  areas:['space','flex'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var u=(res.extra&&res.extra.used)||res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||u,h=res.hints||0,s=u<=p?3:u<=p+1?2:1;if(h&&s===3)s=2;
    return{stars:s,line:u<=p?'Balanced with '+u+' weight'+(u===1?'':'s')+', the fewest possible.':'Balanced with '+u+' weights. The fewest is '+p+'.'}}});
})();
