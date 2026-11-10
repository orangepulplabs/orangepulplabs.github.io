/* Zest puzzles, wave 1 file 1: Parallel or Not? (parallel-or-not), Fill the Missing Triangle (missing-triangle), Quick Dots (quick-dots).
   Loaded after puzzles_kit.js. Contract: see puzzles_kit.js. Every make(level,rng) is pure (no Math.random, no DOM) and returns plain JSON,
   so the same seed gives the same puzzle on every device. The generators are exposed on PZC1 for tests/pzc1_logic.js.
   Extra inst fields the runner may use: inst.level, inst.par, inst.title (all three), inst.toolbar===false hides the puzzle's own buttons.
   Extra def fields: theme:'F1'|'F4', undo:false (parallel-or-not and quick-dots have no undo: they offer 'Try again').
   api.relaxed (true or function) makes Quick Dots show the dots 1.5x longer. All wording is about the puzzle only. */
var PZC1={};
(function(){
function r1(x){return Math.round(x*10)/10}function r2(x){return Math.round(x*100)/100}function r3(x){return Math.round(x*1000)/1000}
function pl(n,w){return n+' '+w+(n===1?'':'s')}
var NS='http://www.w3.org/2000/svg';
function sv(tag,attrs,kids){var e=document.createElementNS(NS,tag);attrs=attrs||{};Object.keys(attrs).forEach(function(k){e.setAttribute(k,attrs[k])});(kids||[]).forEach(function(c){e.appendChild(c)});return e}

/* ---------------- shared styles (one <style id="pzc1-css">) ---------------- */
var CSS='.pzc1{display:flex;flex-direction:column;gap:12px;width:100%;max-width:24rem;margin:0 auto;color:var(--ink);font-family:var(--font)}.pzc1 *{box-sizing:border-box}'
+'.pzc1-top{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:2px 12px}.pzc1-goal{margin:0;font:700 1.125rem/1.25 var(--disp)}.pzc1-ct{font:650 .875rem var(--font);color:var(--muted)}'
+'.pzc1-msg{margin:0;min-height:2.8em;font-size:.9375rem;line-height:1.4;color:var(--muted)}.pzc1-bar,.pzc1-row{display:flex;flex-wrap:wrap;gap:8px}.pzc1-bar .pzb,.pzc1-row .pzb{flex:1 1 5.5rem}'
+'.pzc1 .pzb{min-height:3rem;min-width:48px;padding:.25rem 14px;border:0;border-radius:var(--r1);background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);font:700 1rem/1.2 var(--font);color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-align:center}'
+'.pzc1 .pzb:disabled{background:var(--dis-bg);color:var(--dis-ink);box-shadow:none;cursor:default}.pzc1 .pzb.pri{background:var(--accent);color:var(--on-accent);box-shadow:none}.pzc1 .pzb.pri:disabled{background:var(--dis-bg);color:var(--dis-ink)}'
+'.pzc1 .pzb.sel{background:var(--tint);box-shadow:inset 0 0 0 3px var(--accent)}.pzc1 .pzb:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.pzc1 .pzb.pzc1-hint{outline:3px dashed var(--ink);outline-offset:3px}'
+'.pzc1 .pzb.ok{background:var(--ok-bg);color:var(--ok-ink)}.pzc1 .pzb.no{box-shadow:inset 0 0 0 3px var(--bad)}'
+'.pzc1-pic{position:relative;width:100%;border-radius:var(--r2);background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);overflow:hidden}.pzc1-pic svg{display:block;width:100%;height:auto}'
+'.pzc1-cafe .pzc1-pic{background:#f6f2ea}.pzc1-ruler{stroke:var(--link);color:var(--link)}'
+'.pzc1-sq::before{content:"";display:block;padding-top:100%}.pzc1-sq>svg,.pzc1-sq>.pzc1-cap{position:absolute;left:0;top:0;width:100%;height:100%}'
+'.pzc1-cap{display:flex;align-items:center;justify-content:center;text-align:center;padding:12px;font:700 1.0625rem/1.3 var(--disp);color:var(--muted)}'
+'.pzc1-prog{margin:0;font:650 .9375rem/1.4 var(--font);letter-spacing:.08em;color:var(--muted)}'
+'.pzc1-opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(3.25rem,1fr));gap:8px}.pzc1 .pzc1-opts .pzb{min-height:3.25rem;font:700 1.25rem/1 var(--disp)}'
+'.pzc1-kb{position:relative}.pzc1 .pzc1-slot{position:absolute;width:3.5rem;height:3.5rem;transform:translate(-50%,-50%);border-radius:50%;background:transparent;box-shadow:none;padding:0}.pzc1 .pzc1-slot:focus-visible{box-shadow:0 0 0 3px var(--ink)}.pzc1 .pzc1-slot.pzc1-hint{outline-offset:0}'
+'.pzc1-tray{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.pzc1 .pzc1-pc{position:relative;width:3.75rem;height:3.75rem;min-height:3.75rem;padding:0}.pzc1-pc svg{width:100%;height:100%;display:block}'
+'.pzc1-pc.used svg{opacity:.45}.pzc1-pc b,.pzc1-pc i{position:absolute;font:700 .75rem/1 var(--font);font-style:normal}.pzc1-pc b{left:5px;top:4px}.pzc1-pc i{right:5px;bottom:4px;color:var(--link)}'
+'.pzc1-tgt{display:flex;align-items:center;gap:10px}.pzc1-tgt svg{width:3.5rem;height:3.5rem;flex:none;background:var(--surface);border-radius:var(--r1);box-shadow:0 0 0 1.5px var(--edge);color:var(--ink)}.pzc1-tgt p{margin:0;font-size:.9375rem;line-height:1.35}'
+'.pzc1-fig{opacity:0;transition:opacity .15s ease-out}.pzc1-fig.on{opacity:1}'
+'.pzc1.rm *,.pzc1.rm *::before{transition:none!important;animation:none!important}@media (prefers-reduced-motion:reduce){.pzc1 *,.pzc1 *::before{transition:none!important;animation:none!important}}';
function css(){if(typeof document==='undefined'||document.getElementById('pzc1-css'))return;var s=document.createElement('style');s.id='pzc1-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}

/* shared shell: goal line, counter, board, status line, optional toolbar, timers and listeners with one destroy() */
function shell(root,inst,api,cls,goal){
  css();while(root.firstChild)root.removeChild(root.firstChild);
  var S={timers:[],offs:[],dead:false};
  S.wrap=pzEl('div',{class:'pzc1 '+cls+(api.rm?' rm':'')});
  S.ct=pzEl('span',{class:'pzc1-ct num'});S.goal=pzEl('p',{class:'pzc1-goal',text:goal});
  S.board=pzEl('div',{class:'pzc1-board'});S.msg=pzEl('p',{class:'pzc1-msg'});S.bar=pzEl('div',{class:'pzc1-bar'});
  if(api.say)S.msg.setAttribute('aria-live','off');else S.msg.setAttribute('role','status');
  S.wrap.appendChild(pzEl('div',{class:'pzc1-top'},[S.goal,S.ct]));S.wrap.appendChild(S.board);S.wrap.appendChild(S.msg);
  S.showBar=!(api.toolbar===false||inst.toolbar===false);if(S.showBar)S.wrap.appendChild(S.bar);
  S.say=function(t){S.msg.textContent=t;if(api.say)api.say(t)};
  S.later=function(fn,ms){var id=setTimeout(function(){if(!S.dead)fn()},ms);S.timers.push(id);return id};
  S.destroy=function(){S.dead=true;S.timers.forEach(clearTimeout);if(S.wrap.parentNode)S.wrap.parentNode.removeChild(S.wrap)};
  S.mark=function(el,ord){el.classList.add('pzc1-hint');el.setAttribute('data-hint-order',ord)};
  S.unmark=function(){var m=S.wrap.querySelectorAll('.pzc1-hint');for(var i=0;i<m.length;i++){m[i].classList.remove('pzc1-hint');m[i].removeAttribute('data-hint-order')}};
  root.appendChild(S.wrap);return S}
function roundStars(wrong,hints){return wrong===0?(hints?2:3):wrong===1?2:1}

/* ================= 1. Parallel or Not?  (cafe wall) =================
   A picture is 6 rows of black and white tiles; the 5 grey lines between the rows are the mortar. Each line is stored as its height at the left and right edge.
   'parallel' means every line has the same slope. A 'not parallel' picture leans neighbouring lines in opposite ways by a true angle (tilt, in degrees).
   Level 1 to 30: the tilt shrinks from about 4.5 to 1 degree while the illusion grows (tile shift f from 0.06 to 0.25 of a pattern, thinner mortar). */
var CW=300,CH=210,CROWS=6,CTRIALS=6;
PZC1.cafeSize={w:CW,h:CH,rows:CROWS};
function cafeTrial(level,rng,parallel,theta){
  var t=(level-1)/29,rh=CH/CROWS,tilt=parallel?0:r2(theta*(0.9+0.2*rng())),s0=rng()<.5?1:-1,g=0,lines=[],j;
  if(level>=8)g=r2((0.5+1.5*rng())*(rng()<.5?-1:1));
  var e=CW/2*Math.tan(tilt*Math.PI/180),ge=CW/2*Math.tan(g*Math.PI/180);
  for(j=1;j<CROWS;j++){var s=(j%2?1:-1)*s0,base=j*rh;lines.push([r2(base-s*e-ge),r2(base+s*e+ge)])}
  return {answer:parallel?'parallel':'not',tilt:tilt,g:g,f:r3(.06+.19*t),w:24,mw:r1(4-2*t),off:Math.round(rng()*48),lines:lines}}
PZC1.makeCafe=function(level,rng){
  var theta=r2(4.5-3.5*(level-1)/29),nPar=2+pzInt(rng,3),flags=[],i;
  for(i=0;i<CTRIALS;i++)flags.push(i<nPar);flags=pzShuffle(flags,rng);
  var trials=flags.map(function(p){return cafeTrial(level,rng,p,theta)});
  return {title:'Level '+level,level:level,par:CTRIALS,theta:theta,trials:trials}};
function lineY(l,x){return l[0]+(l[1]-l[0])*x/CW}
function cafeSvg(tr){
  var svg=sv('svg',{viewBox:'0 0 '+CW+' '+CH,'aria-hidden':'true',focusable:'false'}),L=tr.lines,r,c;
  svg.appendChild(sv('rect',{x:0,y:0,width:CW,height:CH,fill:'#f6f2ea'}));
  for(r=0;r<CROWS;r++){
    var top=r===0?[0,0]:L[r-1],bot=r===CROWS-1?[CH,CH]:L[r],o=(r%2)*tr.f*2*tr.w+tr.off,x0=-(o%(2*tr.w))-2*tr.w;
    for(c=0;x0<CW;c++,x0+=tr.w){
      if(c%2)continue;var a=Math.max(0,x0),b=Math.min(CW,x0+tr.w);if(b<=a)continue;
      var pts=[[a,lineY(top,a)],[b,lineY(top,b)],[b,lineY(bot,b)],[a,lineY(bot,a)]].map(function(p){return r2(p[0])+','+r2(p[1])}).join(' ');
      svg.appendChild(sv('polygon',{fill:'#14110f',points:pts}))}}
  L.forEach(function(l){svg.appendChild(sv('line',{x1:0,y1:l[0],x2:CW,y2:l[1],stroke:'#8a8a8a','stroke-width':tr.mw}))});
  return svg}
function cafeGaps(tr){return [r1(lineY(tr.lines[1],12)-lineY(tr.lines[0],12)),r1(lineY(tr.lines[1],CW-12)-lineY(tr.lines[0],CW-12))]}
function mountCafe(root,inst,api){
  var S=shell(root,inst,api,'pzc1-cafe','Are the grey lines parallel?'),T=inst.trials,K=T.length,i=0,ans=[],hints=0,hl=0,phase='ask',fin=false,attempt=1;
  var pic=pzEl('div',{class:'pzc1-pic',role:'img'}),prog=pzEl('p',{class:'pzc1-prog','aria-hidden':'true'});
  var bP=pzBtn('Parallel',function(){pick('parallel')}),bN=pzBtn('Not parallel',function(){pick('not')}),bX=pzBtn('Next picture',next,{class:'pri'});
  S.board.appendChild(pic);S.board.appendChild(prog);
  S.board.appendChild(pzEl('div',{class:'pzc1-row',style:'margin-top:12px'},[bP,bN]));S.board.appendChild(pzEl('div',{class:'pzc1-row',style:'margin-top:8px'},[bX]));
  function draw(){S.unmark();while(pic.firstChild)pic.removeChild(pic.firstChild);pic.appendChild(cafeSvg(T[i]));
    pic.setAttribute('aria-label','Picture '+(i+1)+' of '+K+': rows of black and white tiles with five grey lines between the rows. Decide whether the five grey lines are parallel.');
    S.ct.textContent='Picture '+(i+1)+' of '+K;prog.textContent=ans.map(function(a){return a?'✓':'✗'}).join(' ')+(ans.length?' ':'')+new Array(K-ans.length+1).join('• ').trim();
    bP.disabled=bN.disabled=phase!=='ask';bX.disabled=phase!=='shown'}
  function pick(a){
    if(phase!=='ask'||fin)return;var tr=T[i],good=a===tr.answer,g=cafeGaps(tr);ans.push(good);phase='shown';hl=0;if(api.moved)api.moved();draw();
    var svg=pic.firstChild;[12,CW-12].forEach(function(x){var y0=lineY(tr.lines[0],x),y1=lineY(tr.lines[1],x);
      svg.appendChild(sv('line',{x1:x,y1:y0,x2:x,y2:y1,class:'pzc1-ruler','stroke-width':2.5,'stroke-dasharray':'5 3'}));
      svg.appendChild(sv('line',{x1:x-6,y1:y0,x2:x+6,y2:y0,class:'pzc1-ruler','stroke-width':2.5}));svg.appendChild(sv('line',{x1:x-6,y1:y1,x2:x+6,y2:y1,class:'pzc1-ruler','stroke-width':2.5}))});
    var fact=tr.answer==='parallel'?'The lines were truly parallel: the gap between the first two is '+g[0]+' at the left end and '+g[1]+' at the right end. The tiles pull the eye.'
      :'The lines were not parallel: the gap between the first two is '+g[0]+' at the left end and '+g[1]+' at the right end.';
    S.say((good?'Right. ':'Not this time. ')+fact);
    if(ans.length===K){fin=true;bX.disabled=true;var right=ans.filter(Boolean).length;
      S.later(function(){api.done({solved:true,moves:K,hints:hints,undos:0,extra:{correct:right,wrong:K-right,total:K,attempt:attempt}})},700)}}
  function next(){if(phase!=='shown'||fin)return;i++;phase='ask';hl=0;draw();S.say('Picture '+(i+1)+' of '+K+'. Are the grey lines parallel?')}
  function again(){if(fin)return false;i=0;ans=[];phase='ask';hl=0;attempt++;draw();S.say('Back to the first picture.');return true}
  function hint(n){if(fin)return null;n=Math.max(1,Math.min(3,n||hl+1));hl=n;hints++;S.unmark();var t;
    if(phase==='shown'){S.mark(bX,1);t='Tap Next picture when you are ready.'}
    else if(n===1)t='Look only at the grey lines. Try to ignore the black and white tiles.';
    else if(n===2)t='Compare the gap between two grey lines at the left edge with the gap at the right edge. Equal gaps mean parallel.';
    else{var par=T[i].answer==='parallel';S.mark(par?bP:bN,1);t=par?'These lines are truly parallel. Tap Parallel.':'These lines are not parallel. Tap Not parallel.'}
    S.say(t);return t}
  if(S.showBar){S.bar.appendChild(pzBtn('Hint',function(){hint()}));S.bar.appendChild(pzBtn('Try again',again))}
  draw();S.say('Look at the grey lines between the rows of tiles. Are they parallel?');
  return {undo:function(){return false},hint:hint,restart:again,destroy:S.destroy,moves:function(){return ans.length}}}

/* ================= 2. Fill the Missing Triangle  (illusory contour) =================
   The figure is a regular polygon (3 to 6 corners). At each corner sits a slot for a disc with a wedge cut out. The disc must open toward the middle
   of the figure and its wedge must be as wide as the corner (60 deg triangle, 90 square, 108 pentagon, 120 hexagon); then the cut edges line up
   and the eye fills in the straight sides. Pieces are given by the angle b (direction the opening points, degrees anticlockwise from right) and the wedge w.
   One piece fits each slot and no decoy fits any slot, so the least number of placements (par) is the number of slots. */
var KC=100,KR=62,KRD=20;
function ang(dx,dy){var a=Math.atan2(-dy,dx)*180/Math.PI;return (a%360+360)%360}
function dang(a,b){var d=Math.abs(a-b)%360;return d>180?360-d:d}
PZC1.kShape=function(level){return level<=8?3:level<=16?4:level<=23?5:6};
PZC1.makeTriangle=function(level,rng){
  var n=PZC1.kShape(level),names={3:'triangle',4:'square',5:'pentagon',6:'hexagon'},rot,i;
  if(level<15){var opts={3:[90,270],4:[45,90],5:[90,270],6:[0,90]}[n];rot=opts[pzInt(rng,2)]}else rot=15*pzInt(rng,24);
  var slots=[],step=360/n;
  for(i=0;i<n;i++){var phi=rot+i*step,t=phi*Math.PI/180;slots.push({x:r2(KC+KR*Math.cos(t)),y:r2(KC-KR*Math.sin(t)),b:r1(((phi+180)%360+360)%360),w:r1(180-step)})}
  var pieces=slots.map(function(s){return {b:s.b,w:s.w}}),nd=level<=3?0:Math.min(n,1+Math.floor((level-4)/6)),dmin=level<10?90:level<20?45:level<26?30:15,tries=0,wides=[60,90,108,120];
  while(nd>0&&tries++<400){
    var base=slots[pzInt(rng,n)],off=(dmin+15*pzInt(rng,3))*(rng()<.5?1:-1),b=((base.b+off)%360+360)%360,w=base.w;
    if(level>=14&&rng()<.5){var ws=wides.filter(function(x){return x!==base.w});w=ws[pzInt(rng,ws.length)]}
    var clash=slots.some(function(s){return dang(s.b,b)<1.5&&Math.abs(s.w-w)<1.5});if(clash)continue;
    pieces.push({b:r1(b),w:w});nd--}
  var order=pzShuffle(pieces.map(function(_,k){return k}),rng),shuf=order.map(function(k){return pieces[k]}),sol=slots.map(function(_,s){return order.indexOf(s)});
  var rd=((rot%360)+360)%360,desc=rd===90?'with a corner pointing up':rd===270?'with a corner pointing down':'with one corner pointing toward '+rd+' degrees';
  return {title:'Level '+level,level:level,par:n,n:n,shape:names[n],rot:rd,desc:desc,slots:slots,pieces:shuf,sol:sol,decoys:pieces.length-n}};
var COMPASS=['right','up and to the right','up','up and to the left','left','down and to the left','down','down and to the right'];
var WHERE=['right','top right','top','top left','left','bottom left','bottom','bottom right'];
function pie(cx,cy,r,b,w){function P(a){var t=a*Math.PI/180;return r2(cx+r*Math.cos(t))+' '+r2(cy-r*Math.sin(t))}
  return 'M'+cx+' '+cy+'L'+P(b+w/2)+'A'+r+' '+r+' 0 '+((360-w)>180?1:0)+' 0 '+P(b-w/2)+'Z'}
function pieceOk(p,s){return dang(p.b,s.b)<=.5&&Math.abs(p.w-s.w)<=.5}
function mountTriangle(root,inst,api){
  var S=shell(root,inst,api,'pzc1-tri','Place the corner pieces so the '+inst.shape+' appears.'),n=inst.n,SL=inst.slots,PC=inst.pieces,LET='ABCDEFGHIJKL',
    hist=[SL.map(function(){return -1})],sel=-1,hints=0,undos=0,hl=0,fin=false,slotBtn=[],pcBtn=[],bu,bh;
  function cur(){return hist[hist.length-1]}
  function slotWord(k){var a=ang(SL[k].x-KC,SL[k].y-KC);return WHERE[Math.round(a/45)%8]}
  function pieceName(k){return 'Piece '+LET[k]}
  var poly=SL.map(function(s){return s.x+','+s.y}).join(' ');
  var tg=sv('svg',{viewBox:'0 0 200 200','aria-hidden':'true',focusable:'false'},[sv('polygon',{points:poly,fill:'none',stroke:'currentColor','stroke-width':8,'stroke-dasharray':'12 8'})]);
  S.board.appendChild(pzEl('div',{class:'pzc1-tgt'},[tg,pzEl('p',{text:'Target: a '+inst.shape+' '+inst.desc+'. Put a piece in each of the '+n+' slots so its opening faces the middle.'})]));
  var kb=pzEl('div',{class:'pzc1-kb pzc1-pic pzc1-sq',style:'margin-top:10px',role:'group','aria-label':'The picture: '+n+' slots at the corners of the target '+inst.shape}),svg=sv('svg',{viewBox:'0 0 200 200','aria-hidden':'true',focusable:'false'}),
    figEl=sv('polygon',{points:poly,fill:'none',stroke:'currentColor','stroke-width':2.5,'stroke-dasharray':'6 4',class:'pzc1-fig',style:'color:var(--link)'});
  kb.appendChild(svg);S.board.appendChild(kb);
  SL.forEach(function(s,k){var b=pzBtn('Slot '+(k+1),function(){place(k)},{class:'pzc1-slot',text:''});b.style.left=(s.x/2)+'%';b.style.top=(s.y/2)+'%';slotBtn.push(b);kb.appendChild(b)});
  var tray=pzEl('div',{class:'pzc1-tray',style:'margin-top:12px',role:'group','aria-label':'Pieces to place'});
  PC.forEach(function(p,k){var b=pzBtn(pieceName(k),function(){choose(k)},{class:'pzc1-pc',text:'','aria-pressed':'false'});
    b.appendChild(sv('svg',{viewBox:'-24 -24 48 48','aria-hidden':'true',focusable:'false'},[sv('path',{d:pie(0,0,20,p.b,p.w),fill:'var(--ink)'})]));
    b.appendChild(pzEl('b',{'aria-hidden':'true',text:LET[k]}));b.appendChild(pzEl('i',{'aria-hidden':'true'}));pcBtn.push(b);tray.appendChild(b)});
  S.board.appendChild(tray);
  function correct(a){return a.every(function(p,k){return p>=0&&pieceOk(PC[p],SL[k])})}
  function render(){
    S.unmark();var a=cur(),k;while(svg.firstChild)svg.removeChild(svg.firstChild);
    for(k=0;k<n;k++){var s=SL[k];
      if(a[k]<0){svg.appendChild(sv('circle',{cx:s.x,cy:s.y,r:KRD,fill:'none',stroke:'var(--edge)','stroke-width':2,'stroke-dasharray':'4 4'}));
        var tx=sv('text',{x:s.x,y:s.y+5,'text-anchor':'middle','font-size':14,'font-weight':700,fill:'var(--muted)'});tx.textContent=String(k+1);svg.appendChild(tx)}
      else svg.appendChild(sv('path',{d:pie(s.x,s.y,KRD,PC[a[k]].b,PC[a[k]].w),fill:'var(--ink)'}));
      slotBtn[k].setAttribute('aria-label','Slot '+(k+1)+' of '+n+', '+slotWord(k)+', '+(a[k]<0?'empty':'holds '+pieceName(a[k]).toLowerCase())+(sel>=0?'. Tap to place '+pieceName(sel).toLowerCase()+' here':''))}
    svg.appendChild(figEl);figEl.classList.toggle('on',correct(a));
    PC.forEach(function(p,q){var at=a.indexOf(q),b=pcBtn[q];b.classList.toggle('used',at>=0);b.classList.toggle('sel',q===sel);b.setAttribute('aria-pressed',q===sel?'true':'false');b.lastChild.textContent=at>=0?String(at+1):'';
      b.setAttribute('aria-label',pieceName(q)+', opening points '+COMPASS[Math.round(p.b/45)%8]+' (about '+Math.round(p.b)+' degrees), wedge '+Math.round(p.w)+' degrees'+(at>=0?', now in slot '+(at+1):'')+(q===sel?', selected':''))});
    S.ct.textContent='Placements '+(hist.length-1);if(bu)bu.disabled=hist.length<2||fin}
  function choose(q){if(fin)return;sel=sel===q?-1:q;render();S.say(sel<0?'Piece put down.':pieceName(q)+' is in your hand. Tap a slot to place it.')}
  function place(k){
    if(fin)return;if(sel<0){S.say('Pick a piece from the tray first, then tap a slot.');return}
    var a=cur().slice(),q=sel,old=a.indexOf(q);if(old>=0)a[old]=-1;a[k]=q;hist.push(a);sel=-1;hl=0;hintLabel();if(api.moved)api.moved();render();
    if(correct(a)){fin=true;if(bu)bu.disabled=true;S.say('The '+inst.shape+' appears: every opening faces the middle. Done in '+pl(hist.length-1,'placement')+'.');
      S.later(function(){api.done({solved:true,moves:hist.length-1,hints:hints,undos:undos,extra:{par:inst.par}})},350);return}
    S.say(pieceName(q)+' is in slot '+(k+1)+'. '+(a.every(function(p){return p>=0})?'All slots are filled but the '+inst.shape+' is not complete yet. Swap a piece.':'Keep going, and check that the openings face the middle.'))}
  function undo(){if(fin||hist.length<2)return false;hist.pop();undos++;sel=-1;hl=0;hintLabel();render();S.say('Undone. You are back to '+pl(hist.length-1,'placement')+'.');return true}
  function restart(){if(fin)return false;hist=[SL.map(function(){return -1})];sel=-1;hl=0;hintLabel();render();S.say('Back to the start.');return true}
  function nextWrong(){var a=cur();for(var k=0;k<n;k++)if(a[k]<0||!pieceOk(PC[a[k]],SL[k]))return k;return -1}
  function hintLabel(){if(bh){bh.textContent=hl===0?'Hint':hl<3?'More hint':'Show again';bh.setAttribute('aria-label',bh.textContent)}}
  function hint(m){if(fin)return null;m=Math.max(1,Math.min(3,m||hl+1));hl=m;hints++;S.unmark();var k=nextWrong(),q,s,t;
    if(k<0)return null;q=inst.sol[k];s=SL[k];
    if(m===1)t='Look at slot '+(k+1)+', at the '+slotWord(k)+'. Its opening should face the middle of the '+inst.shape+'.';
    else if(m===2)t='Slot '+(k+1)+' needs a piece whose opening points '+COMPASS[Math.round(s.b/45)%8]+', about '+Math.round(s.b)+' degrees, with a wedge of '+Math.round(s.w)+' degrees.';
    else{S.mark(pcBtn[q],1);S.mark(slotBtn[k],2);t='Pick '+pieceName(q).toLowerCase()+' and put it in slot '+(k+1)+'.'}
    S.say(t);hintLabel();return t}
  if(S.showBar){bu=pzBtn('Undo',undo);bh=pzBtn('Hint',function(){hint()});S.bar.appendChild(bu);S.bar.appendChild(bh);S.bar.appendChild(pzBtn('Restart',restart))}
  render();S.say('Pick a piece, then tap the slot where it belongs. The openings should face the middle of the '+inst.shape+'.');
  return {undo:undo,hint:hint,restart:restart,destroy:S.destroy,moves:function(){return hist.length-1}}}

/* ================= 3. Quick Dots =================
   A round is 5 flashes. Each flash shows some dots for a fixed time, then you pick how many there were. The time falls from 1000 ms (level 1)
   to 150 ms (level 30) and never goes below 150 ms; Relaxed pace shows them 1.5 times longer. The typical count rises from 2 to 10.
   Stars: 3 = every flash answered correctly on the first answer with no hints, 2 = one wrong (or any hint with all right), 1 = more. */
var DK=5;
PZC1.dotsMs=function(level){return Math.max(150,Math.round(1000-(level-1)*850/29))};
PZC1.dotsBase=function(level){return 2+Math.round((level-1)*8/29)};
function dotsLayout(n,rng){
  var pts=[],md=30,k;
  for(k=0;k<n;k++){var ok=false,t=0;
    while(!ok){var x=r1(18+rng()*164),y=r1(18+rng()*164);ok=pts.every(function(p){return Math.hypot(p[0]-x,p[1]-y)>=md});
      if(ok)pts.push([x,y]);else if(++t>150){t=0;md-=1}}}
  return pts}
PZC1.makeDots=function(level,rng){
  var b=PZC1.dotsBase(level),flashes=[],i,tries=0;
  do{flashes=[];for(i=0;i<DK;i++){var c=Math.max(1,Math.min(12,b+pzInt(rng,3)-1));flashes.push(c)}}while(flashes.every(function(v){return v===flashes[0]})&&tries++<20);
  return {title:'Level '+level,level:level,par:DK,ms:PZC1.dotsMs(level),opts:Math.min(12,Math.max(5,b+2)),flashes:flashes.map(function(c){return {n:c,dots:dotsLayout(c,rng)}})}};
var dotsHold=false;   /* hold mode lasts for the session */
function secs(ms){return (ms/1000).toFixed(2).replace(/\.?0+$/,'')}
function mountDots(root,inst,api){
  var K=(api.relaxed===true||(typeof api.relaxed==='function'&&api.relaxed()))?1.5:1,MS=Math.round(inst.ms*K),F=inst.flashes,N=F.length,
    S=shell(root,inst,api,'pzc1-dots','How many dots did you see?'),i=0,ans=[],picks=[],hints=0,hl=0,phase='ready',fin=false,attempt=1,held=false;
  var pic=pzEl('div',{class:'pzc1-pic pzc1-sq',role:'img'}),svg=sv('svg',{viewBox:'0 0 200 200','aria-hidden':'true',focusable:'false'}),cap=pzEl('div',{class:'pzc1-cap'});
  pic.appendChild(svg);pic.appendChild(cap);S.board.appendChild(pic);
  var prog=pzEl('p',{class:'pzc1-prog','aria-hidden':'true',style:'margin-top:8px'});S.board.appendChild(prog);
  var bS=pzBtn('Show the dots',show,{class:'pri'}),bX=pzBtn('Next flash',next),bH=pzBtn(dotsHold?'Hold mode: on':'Hold mode: off',function(){if(phase!=='ready')return;dotsHold=!dotsHold;bH.textContent=dotsHold?'Hold mode: on':'Hold mode: off';bH.setAttribute('aria-label',bH.textContent);bH.setAttribute('aria-pressed',dotsHold?'true':'false');S.say(dotsHold?'Hold mode is on. The dots stay on screen until you answer.':'Hold mode is off. The dots show for '+secs(MS)+' seconds.')},{'aria-pressed':dotsHold?'true':'false'});
  S.board.appendChild(pzEl('div',{class:'pzc1-row',style:'margin-top:8px'},[bS,bX]));
  var opts=pzEl('div',{class:'pzc1-opts',role:'group','aria-label':'How many dots',style:'margin-top:10px'}),ob=[];
  for(var q=1;q<=inst.opts;q++)(function(q){var b=pzBtn(String(q),function(){pick(q)},{'aria-label':pl(q,'dot')});ob.push(b);opts.appendChild(b)})(q);
  S.board.appendChild(opts);S.board.appendChild(pzEl('div',{class:'pzc1-row',style:'margin-top:8px'},[bH]));
  function drawDots(on){while(svg.firstChild)svg.removeChild(svg.firstChild);if(on)F[i].dots.forEach(function(p){svg.appendChild(sv('circle',{cx:p[0],cy:p[1],r:9,fill:'var(--ink)'}))})}
  function setCap(t){cap.textContent=t;cap.style.display=t?'flex':'none'}
  function ui(){S.unmark();S.ct.textContent='Flash '+(i+1)+' of '+N;
    prog.textContent=ans.map(function(a){return a?'✓':'✗'}).join(' ')+(ans.length?' ':'')+new Array(N-ans.length+1).join('• ').trim();
    bS.disabled=phase!=='ready';bX.disabled=phase!=='shown';bH.disabled=phase!=='ready';
    ob.forEach(function(b,k){var v=k+1;b.disabled=phase!=='ask';b.classList.remove('ok','no','sel');b.setAttribute('aria-label',pl(v,'dot'));
      if(phase==='shown'){if(v===F[i].n){b.classList.add('ok');b.setAttribute('aria-label',pl(v,'dot')+', the right count')}if(v===picks[i]&&v!==F[i].n){b.classList.add('no');b.setAttribute('aria-label',pl(v,'dot')+', your answer')}}})}
  function setPic(){pic.setAttribute('aria-label',phase==='shown'||held?'Picture of dots: there were '+pl(F[i].n,'dot'):phase==='show'?'Dots are showing now':'The dots are hidden')}
  function ready(){phase='ready';held=false;drawDots(false);setCap('Tap Show the dots when you are ready. They show for '+secs(MS)+' seconds.');setPic();ui()}
  function show(){if(phase!=='ready'||fin)return;
    drawDots(true);setCap('');
    if(dotsHold){phase='ask';held=true;setPic();ui();S.say('Here are the dots. They stay until you answer. How many are there?');return}
    phase='show';setPic();ui();S.say('Look at the middle of the box.');
    S.later(function(){if(phase!=='show')return;drawDots(false);setCap('How many dots did you see?');phase='ask';setPic();ui();S.say('How many dots did you see?')},MS)}
  function pick(v){
    if(phase!=='ask'||fin)return;var good=v===F[i].n;ans.push(good);picks[i]=v;phase='shown';drawDots(true);setCap('');setPic();hl=0;if(api.moved)api.moved();ui();
    S.say((good?'Right: ':'Not this time: ')+'there were '+pl(F[i].n,'dot')+'. You picked '+v+'.');
    if(ans.length===N){fin=true;bX.disabled=true;var right=ans.filter(Boolean).length;
      S.later(function(){api.done({solved:true,moves:N,hints:hints,undos:0,extra:{correct:right,wrong:N-right,total:N,attempt:attempt,ms:MS,hold:dotsHold}})},700)}}
  function next(){if(phase!=='shown'||fin)return;i++;ready();S.say('Flash '+(i+1)+' of '+N+'. Tap Show the dots when you are ready.')}
  function again(){if(fin)return false;i=0;ans=[];picks=[];attempt++;ready();S.say('Back to the first flash.');return true}
  function hint(n){if(fin)return null;n=Math.max(1,Math.min(3,n||hl+1));hl=n;hints++;S.unmark();var c=F[i].n,t;
    if(phase==='shown'){S.mark(bX,1);t='Tap Next flash when you are ready.'}
    else if(n===1)t='Try to see the dots as small groups instead of counting them one by one.';
    else if(n===2)t='The number of dots is between '+Math.max(1,c-2)+' and '+(c+2)+'.';
    else if(phase==='ready'||phase==='ask'){held=true;drawDots(true);setCap('');phase='ask';setPic();ui();t='The dots are on screen and stay until you answer.'}
    else t='Wait for the flash to end, then pick the count.';
    S.say(t);return t}
  if(S.showBar){S.bar.appendChild(pzBtn('Hint',function(){hint()}));S.bar.appendChild(pzBtn('Try again',again))}
  ready();S.say('Each flash shows some dots for '+secs(MS)+' seconds'+(K>1?' (Relaxed pace)':'')+'. Then pick how many there were.');
  return {undo:function(){return false},hint:hint,restart:again,destroy:S.destroy,moves:function(){return ans.length},flashMs:function(){return MS}}}

/* ================= registration ================= */
registerPuzzle({id:'parallel-or-not',name:'Parallel or Not?',family:'grid',theme:'F1',areas:['attention','space'],levels:30,secs:75,undo:false,
  blurb:'Rows of tiles that look slanted. Are the grey lines truly parallel?',
  how:'Six pictures of black and white tiles. For each one, tap Parallel or Not parallel for the five grey lines. The answer is set by the drawing, not by how it looks. Levels bring a stronger illusion and a smaller true tilt.',
  make:PZC1.makeCafe,mount:mountCafe,
  stars:function(res,inst){var x=res.extra||{},tot=x.total||inst.par,right=x.correct==null?tot:x.correct;
    return {stars:roundStars(tot-right,res.hints),line:'You judged '+right+' of '+tot+' pictures correctly'+(res.hints?', with '+pl(res.hints,'hint'):'')+'. The true tilt in the not-parallel pictures was about '+inst.theta+' degrees.'}}});
registerPuzzle({id:'missing-triangle',name:'Fill the Missing Triangle',family:'grid',theme:'F1',areas:['space','control'],levels:30,secs:90,
  blurb:'Place corner pieces so an edge that is never drawn appears.',
  how:'Pick a piece from the tray, then tap a slot. Each piece is a disc with a wedge cut out. Put one in every corner so the openings face the middle, and the target shape appears between them. Fewest placements is best.',
  make:PZC1.makeTriangle,mount:mountTriangle,
  stars:function(res,inst){var m=res.moves,p=inst.par;return {stars:pzStarsByPar(m,p,res.hints),line:m<=p?'The '+inst.shape+' appeared after '+pl(m,'placement')+', the fewest possible.':'The '+inst.shape+' appeared after '+pl(m,'placement')+'. The fewest possible is '+p+'.'}}});
registerPuzzle({id:'quick-dots',name:'Quick Dots',family:'memory',theme:'F4',areas:['speed','attention'],levels:30,secs:60,undo:false,
  blurb:'Dots flash for a moment. How many were there?',
  how:'Five flashes. Tap Show the dots, look, then pick how many there were. Levels show more dots for less time, never under 0.15 seconds. Relaxed pace shows them 1.5 times longer. Hold mode keeps the dots on screen.',
  make:PZC1.makeDots,mount:mountDots,
  stars:function(res,inst){var x=res.extra||{},tot=x.total||inst.par,right=x.correct==null?tot:x.correct,ms=x.ms||inst.ms;
    return {stars:roundStars(tot-right,res.hints),line:'You named '+right+' of '+tot+' flashes correctly, each shown for '+secs(ms)+' seconds'+(x.hold?' in hold mode':'')+(res.hints?', with '+pl(res.hints,'hint'):'')+'.'}}});
})();
