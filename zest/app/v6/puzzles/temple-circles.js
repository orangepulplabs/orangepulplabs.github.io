/* Zest v6: Temple Circles (Apollonius-flavoured geometry). Overrides puzzles_e4.js through ZK.override; make() (PZE4.tc.make), the exact whole-number touch test and par (one circle = one move) are the original's.
   Rule: place each new circle so it exactly touches everything on its list (walls, the floor, the top, fixed circles A, B, C).
   Board: drag (or tap) on the tablet and the dashed circle follows, riding 48 px ABOVE a touching finger so the finger never hides it. Every exact touch lights a diamond and pings
   (sound and haptic); the touch chips under the board tick off live; overlap tints the circle amber. When every touch is exact the circle LOCKS by itself on release (no Lock button, no arrows),
   with a chime, and the next circle appears. Arrow keys still work. par = the number of circles. Levels 1-2 ask only for a corner (floor + a wall), levels 3-8 use 1 circle, up to 4 later.
   Aha: the position is found by distance (two radii apart), not by sight. Hints light the unmet touch, show a faint dashed ring on a right spot, then place it. */
(function(){
var ID='temple-circles',CC=window.V6C,E=window.PZE4;
/* own curve: the original generator is driven by a mapped level so the number of circles and constraints ramp with breathers (every 5th level steps back) */
var G=[1,2,5,9,3, 10,11,12,13,7, 17,18,19,20,10, 21,22,23,24,13, 25,26,27,28,17, 29,30,30,29,30];
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var i=E.tc.make(G[level-1],rng);i.level=level;i.title='Level '+level;return i}
function plan(inst){var out=[],W=inst.W,H=inst.H;inst.circles.forEach(function(c,k){if(k)out.push({wait:.9});var s=c.sols[0];out.push({at:['.tc-svg',(s[0]+.6)/(W+1.2),(H-s[1]+.6)/(H+1.2)]})});return out}
CC[ID]={make:make,G:G,plan:plan};
var LET='ABCDE';
var CSS=''
+'.tc{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:var(--font)}'
+'.tc-svg{width:100%;display:block;touch-action:none;border-radius:16px;background:var(--surface);box-shadow:0 0 0 2px var(--edge),0 4px 0 var(--edge);user-select:none;-webkit-user-select:none}'
+'.tc-svg .gl{stroke:var(--line,#ddd);stroke-width:.04}.tc-svg .bd{fill:none;stroke:var(--ink);stroke-width:.16}'
+'.tc-svg .fx{fill:var(--tint);stroke:var(--ink);stroke-width:.14}.tc-svg .pl{fill:var(--ok-bg,#ddefe2);stroke:var(--ok-ink,#14532d);stroke-width:.14}'
+'.tc-svg .ac{fill:rgba(232,89,12,.14);stroke:var(--accent);stroke-width:.2;stroke-dasharray:.5 .35}.tc-svg .ac.amber{stroke:#E9A23B;fill:rgba(233,162,59,.2)}.tc-svg .ac.ready{fill:rgba(46,158,91,.2);stroke:var(--ok-ink,#14532d);stroke-dasharray:none}'
+'.tc-svg text{font:800 1.15px var(--disp,var(--font));text-anchor:middle;fill:var(--ink);pointer-events:none}'
+'.tc-svg .mk{fill:var(--accent);stroke:var(--ink);stroke-width:.06}.tc-svg .gh{fill:none;stroke:var(--accent);stroke-width:.14;stroke-dasharray:.25 .3;opacity:.7}'
+'.tc-chips{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;min-height:50px}'
+'.tc-chip{min-width:48px;height:46px;padding:0 10px;border-radius:23px;background:var(--surface);box-shadow:0 0 0 2px var(--edge);display:flex;align-items:center;justify-content:center;gap:6px;font:800 1.05rem/1 var(--disp,var(--font));color:var(--ink);transition:background .15s}'
+'.tc-chip svg{width:26px;height:26px}.tc-chip.on{background:var(--ok-bg,#ddefe2);color:var(--ok-ink,#14532d);box-shadow:0 0 0 2px var(--ok-ink,#14532d)}'
+'.tc-chip.hl{box-shadow:0 0 0 3px var(--accent)}'
+'.tc-kb{position:absolute;width:1px;height:1px;opacity:0}'
+'.zk-rm .tc-chip{transition:none}';
function icon(k){var s='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">';
  if(k==='F')return s+'<path d="M3 20h18"/><circle cx="12" cy="11" r="5"/></svg>';if(k==='T')return s+'<path d="M3 4h18"/><circle cx="12" cy="13" r="5"/></svg>';
  if(k==='L')return s+'<path d="M4 3v18"/><circle cx="13" cy="12" r="5"/></svg>';if(k==='R')return s+'<path d="M20 3v18"/><circle cx="11" cy="12" r="5"/></svg>';
  return s+'<circle cx="8" cy="12" r="5"/><circle cx="17" cy="12" r="3.5"/></svg>'}
function nameOf(k){return k==='F'?'the floor':k==='L'?'the left wall':k==='R'?'the right wall':k==='T'?'the top':'circle '+LET.charAt(+k.slice(1))}
var NS='http://www.w3.org/2000/svg';function sv(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
function mount(root,inst,api){CC.css();ZK.css(CSS,'tc-css');
  var rm=ZK.rm(api),W=inst.W,H=inst.H,C=inst.circles,F=inst.fixed,placed=[],pos=[Math.round(W/2),Math.round(H/2)],hist=[],hints=0,undos=0,fin=false,locked=false,drag=false,touch=false,last=null,ghost=null,idle=null,gring=null,metPrev=0,
      stage=CC.stage(root,'tc',api),svg=sv('svg',{viewBox:'-0.6 -0.6 '+(W+1.2)+' '+(H+1.2),class:'tc-svg zk-board',role:'img','aria-label':'Tablet with '+F.length+' fixed circle'+(F.length===1?'':'s'),focusable:'false'}),chips=CC.el('div','tc-chips'),pips=ZK.pips(inst.par);
  svg.style.aspectRatio=(W+1.2)+'/'+(H+1.2);stage.appendChild(svg);stage.appendChild(chips);stage.appendChild(pips.el);
  function cur(){return C[Math.min(placed.length,C.length-1)]}
  function clamp(){var r=cur().r;pos[0]=Math.max(r,Math.min(W-r,pos[0]));pos[1]=Math.max(r,Math.min(H-r,pos[1]))}
  clamp();
  function stat(){var i=placed.length,c=C[Math.min(i,C.length-1)],x=pos[0],y=pos[1],r=c.r,items=c.cons.map(function(k){var ok,pt;
      if(k==='F'){ok=y===r;pt=[x,0]}else if(k==='L'){ok=x===r;pt=[0,y]}else if(k==='R'){ok=x===W-r;pt=[W,y]}else if(k==='T'){ok=y===H-r;pt=[x,H]}
      else{var f=F[+k.slice(1)],dx=x-f.x,dy=y-f.y;ok=dx*dx+dy*dy===(r+f.r)*(r+f.r);pt=[x+(f.x-x)*r/(r+f.r),y+(f.y-y)*r/(r+f.r)]}return{k:k,ok:ok,pt:pt}}),over=false;
    F.concat(placed.map(function(p,j){return{x:p[0],y:p[1],r:C[j].r}})).forEach(function(o){var dx=x-o.x,dy=y-o.y;if(dx*dx+dy*dy<(r+o.r)*(r+o.r))over=true});
    return{items:items,over:over,all:!over&&items.every(function(t){return t.ok})}}
  function paint(){svg.textContent='';svg.appendChild(sv('rect',{x:0,y:0,width:W,height:H,class:'bd'}));
    for(var g=1;g<W;g++)svg.appendChild(sv('line',{x1:g,y1:0,x2:g,y2:H,class:'gl'}));for(g=1;g<H;g++)svg.appendChild(sv('line',{x1:0,y1:g,x2:W,y2:g,class:'gl'}));
    F.forEach(function(f,i){svg.appendChild(sv('circle',{cx:f.x,cy:H-f.y,r:f.r,class:'fx'}));var t=sv('text',{x:f.x,y:H-f.y+.42});t.textContent=LET.charAt(i);svg.appendChild(t)});
    placed.forEach(function(p,i){var cc=sv('circle',{cx:p[0],cy:H-p[1],r:C[i].r,class:'pl'});svg.appendChild(cc);var t=sv('text',{x:p[0],y:H-p[1]+.42});t.textContent=String(i+1);svg.appendChild(t)});
    if(gring){svg.appendChild(sv('circle',{cx:gring[0],cy:H-gring[1],r:cur().r,class:'gh'}))}
    if(fin)return;var s=stat(),c=cur();svg.appendChild(sv('circle',{cx:pos[0],cy:H-pos[1],r:c.r,class:'ac'+(s.over?' amber':s.all?' ready':'')}));
    var rt=sv('text',{x:pos[0],y:H-pos[1]+.42});rt.textContent=String(c.r);svg.appendChild(rt);
    s.items.forEach(function(t){if(t.ok){var x=t.pt[0],y=H-t.pt[1];svg.appendChild(sv('polygon',{points:x+','+(y-.42)+' '+(x+.42)+','+y+' '+x+','+(y+.42)+' '+(x-.42)+','+y,class:'mk'}))}});
    chips.textContent='';s.items.forEach(function(t){var ch=CC.el('div','tc-chip'+(t.ok?' on':''),icon(t.k)+(t.k.charAt(0)==='C'?'<span>'+LET.charAt(+t.k.slice(1))+'</span>':''));ch.setAttribute('data-k',t.k);ch.setAttribute('aria-label',(t.ok?'Touching ':'Not yet touching ')+nameOf(t.k));chips.appendChild(ch)});
    var met=s.items.filter(function(t){return t.ok}).length;if(met>metPrev){ZK.sfx('click',{p:met*3});ZK.buzz('tap')}metPrev=met;return s}
  function toPos(e){var rc=svg.getBoundingClientRect();if(!rc.width)return;var oy=(e.pointerType==='touch'||e.pointerType==='pen')?48:0;
    var x=(e.clientX-rc.left)/rc.width*(W+1.2)-.6,y=H-(((e.clientY-oy)-rc.top)/rc.height*(H+1.2)-.6);pos=[Math.round(x),Math.round(y)];clamp();return paint()}
  function down(e){if(fin||locked)return;ZK.ghostDone(ID);if(ghost)ghost.stop();gring=null;ZK.unmark(stage);drag=true;try{svg.setPointerCapture(e.pointerId)}catch(x){}toPos(e);e.preventDefault()}
  function move(e){if(drag&&!fin&&!locked)toPos(e)}
  function up(){if(!drag)return;drag=false;tryLock()}
  svg.addEventListener('pointerdown',down);svg.addEventListener('pointermove',move);svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',function(){drag=false});
  function tryLock(){if(fin||locked)return;var s=stat();if(!s.all){if(s.items.some(function(t){return t.ok})||s.over){var u=chips.querySelector('.tc-chip:not(.on)');if(u)ZK.wrong(u,{silent:true})}return}
    var i=placed.length;placed.push(pos.slice());hist.push(pos.slice());api.moved();pips.set(placed.length);last=svg;locked=true;metPrev=0;ZK.sfx('cap',{n:i});ZK.buzz('cap');
    if(placed.length===C.length){fin=true;paint();api.say('Every circle touches exactly what it should.');setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:420);return}
    pos=[Math.round(W/2),Math.round(H/2)];clamp();setTimeout(function(){locked=false;paint()},rm?0:320);paint()}
  var nk=null;function nudge(dx,dy){if(fin||locked)return;pos=[pos[0]+dx,pos[1]+dy];clamp();paint();clearTimeout(nk);nk=setTimeout(tryLock,650)}
  stage.addEventListener('keydown',function(e){var m={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[e.key];if(m){nudge(m[0],m[1]);e.preventDefault()}});
  svg.tabIndex=0;svg.setAttribute('aria-label',svg.getAttribute('aria-label')+'. Arrow keys move the new circle.');
  paint();
  if(inst.level===1){var s0=C[0].sols[0];ghost=ZK.ghost(stage,[{tap:{getBoundingClientRect:function(){var r=svg.getBoundingClientRect();return{left:r.left+(s0[0]+.6)/(W+1.2)*r.width,top:r.top+(H-s0[1]+.6)/(H+1.2)*r.height,width:2,height:2}}},hold:900,down:function(){pos=s0.slice();paint()},up:function(){pos=[Math.round(W/2),Math.round(H/2)];clamp();paint()},cancel:function(){pos=[Math.round(W/2),Math.round(H/2)];clamp();paint()}}],{id:ID,level:1,delay:1000})}
  idle=ZK.idle(stage,25000);
  return{
    undo:function(){if(fin||locked||!placed.length)return false;placed.pop();hist.pop();undos++;pips.set(placed.length);pos=[Math.round(W/2),Math.round(H/2)];clamp();gring=null;paint();ZK.sfx('undo');ZK.buzz('tap');return true},
    restart:function(){if(fin||locked)return;placed=[];hist=[];pips.set(0);pos=[Math.round(W/2),Math.round(H/2)];clamp();gring=null;paint();ZK.sfx('undo')},
    hint:function(lv){if(fin||locked)return null;hints++;var s=stat(),c=cur(),m=s.items.filter(function(t){return !t.ok})[0];
      if(lv<=1){var ch=m&&chips.querySelector('[data-k="'+m.k+'"]');if(ch){ch.classList.add('hl');setTimeout(function(){ch.classList.remove('hl')},2500)}return m?'Not yet touching '+nameOf(m.k)+'.':'Let go to lock it.'}
      if(lv===2){gring=c.sols[0].slice();paint();return 'A faint ring shows one right spot.'}
      pos=c.sols[0].slice();gring=null;paint();tryLock();return 'Placed it for you.'},
    destroy:function(){clearTimeout(nk);if(ghost)ghost.stop();if(idle)idle.stop();root.textContent=''},
    lastEl:function(){return last},state:function(){return{placed:placed.length,fin:fin}}}}
ZK.override({id:ID,name:'Temple Circles',family:'move',theme:'F8',blurb:'Place circles so they exactly touch walls and other circles.',
  how:'Drag the circle until every chip lights up. It locks on release.',areas:['space','control'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){return{stars:pzStarsByPar(res.moves,inst.par,res.hints),line:CC.pl(inst.par,'circle')+' placed exactly.'}}});
})();
