/* Zest puzzles, wave 2 builder 7: Odd One Out, Four Shades, Sprout Lines, Link Across.
   Loaded after puzzles_kit.js. Every make(level,rng) is pure (no Math.random, no DOM). Logic is exposed on PZD7 for tests/pzd7_logic.js.
   Extra inst fields:
   odd-one-out  {rounds:[{n,odd,figs:[{bits,rot,mir}]}],k,par,mono}. A frame is n flat strips; bits[j]=1 means strip j lies over strip j-1 at corner j, 0 means under.
                A frame can be built from real strips only if the over/under relation has no cycle: here, only if the bits are not all equal. par = rounds (one tap each).
   four-shades  {n,W,H,seeds,polys,adj,locked,sol,par}. Voronoi map; locked[i] is -1 or a fixed colour 0..3 taken from sol (a proper colouring); par = regions to colour.
   sprout-lines {n,G,spots0,K,par,sol:[{f,t,path}]}. Grid game: lines are 4-connected cell paths through empty cells; a spot takes at most 3 line ends; each line makes a new spot
                in its middle (2 ends used). Goal: make K moves before no move is left. K and sol come from a playout search, so K is always reachable. par = K.
   link-across  {N,b,par,win}. b[r*N+c]: 0 empty, 1 you (top to bottom), 2 computer (left to right). You move first in the position; a forced win exists, par = fewest of your moves
                that force it; win = the winning first moves.
   Four Shades and Link Across region/cell buttons are 48 px; on a 280 px board they can overlap by a few px (hit areas centred on each region or cell). No audio. */
var PZD7={};
(function(){
var UID=0,NS='http://www.w3.org/2000/svg';
var CSS='.pd7{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.pd7 *{box-sizing:border-box}'
+'.pd7-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.pd7-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.pd7-prog{margin:0;font-weight:700;font-size:1rem;text-align:center}'
+'.pd7-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.pd7-btn{min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer}'
+'.pd7-btn:disabled{background:var(--dis-bg);color:var(--dis-ink);border-color:var(--dis-bg);cursor:default}'
+'.pd7-btn[aria-pressed=true]{border-width:4px;border-color:var(--ink)}'
+'.pd7-figs{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;width:100%}'
+'.pd7-fig{flex:1 1 40%;max-width:48%;min-width:110px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 .875rem var(--font);cursor:pointer}'
+'.pd7-fig svg{width:100%;height:auto;display:block}'
+'.pd7-fig:disabled{background:var(--dis-bg);color:var(--dis-ink)}'
+'.pd7-fig.pd7-yes{border-width:5px;border-color:var(--ink)}'
+'.pd7-fig.pd7-hint{outline:3px dashed var(--ink);outline-offset:2px}'
+'.pd7-map{position:relative;width:100%;border:2px solid var(--edge);border-radius:var(--r1);background:var(--tint)}'
+'.pd7-map>svg{position:absolute;left:0;top:0;width:100%;height:100%}'
+'.pd7-node{position:absolute;transform:translate(-50%,-50%);min-width:48px;min-height:48px;width:48px;height:48px;padding:0;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink);font:800 .9375rem/1 var(--font)}'
+'.pd7-node span{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;border:2px solid var(--ink);background:var(--surface)}'
+'.pd7-node.pd7-fixed span{border-style:double;border-width:5px}'
+'.pd7-node.pd7-sel span{outline:3px solid var(--ink);outline-offset:2px;background:var(--accent);color:var(--on-accent)}'
+'.pd7-node.pd7-hint span{outline:3px dashed var(--ink);outline-offset:3px}'
+'.pd7-node.pd7-bad span{border-style:dashed}'
+'.pd7-node:disabled{cursor:default}'
+'.pd7-sw{display:flex;align-items:center;gap:6px}.pd7-sw svg{width:26px;height:26px;display:block}'
+'.pd7-line{fill:none;stroke:var(--ink);stroke-width:.34;stroke-linecap:round;stroke-linejoin:round}'
+'.pd7-draft{fill:none;stroke:var(--accent);stroke-width:.34;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:.6 .6}'
+'.pd7-board{touch-action:none}'
+'.phone.rm .pd7 *,.phone.rm .pd7 *::before{transition:none!important;animation:none!important}'
+'@media (prefers-reduced-motion:reduce){.pd7 *,.pd7 *::before{transition:none!important;animation:none!important}}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pzd7-css'))return;var s=document.createElement('style');s.id='pzd7-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function B(txt,fn,at){at=at||{};at.class='pd7-btn '+(at.class||'');return pzBtn(txt,fn,at)}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'pd7 '+cls});root.appendChild(w);return w}
function plural(n,w,pl){return n+' '+(n===1?w:(pl||w+'s'))}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
function sv(tag,at,txt){var e=document.createElementNS(NS,tag);Object.keys(at||{}).forEach(function(k){e.setAttribute(k,at[k])});if(txt!==undefined)e.textContent=txt;return e}
function r1(x){return Math.round(x*10)/10}function r2(x){return Math.round(x*100)/100}
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
function say2(msg,api,t){msg.textContent=t;if(api.say)api.say(t)}
/* toolbar wrapper: Undo/Hint/Restart (or Hint/Try again when kind==='try'); done() delayed 350 ms; page live regions muted when api.say exists */
function wrap(m,kind,tryLabel){return function(root,inst,api){var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'pd7-row pd7-bar'}),w=root.firstChild;
    if(kind!=='try')bar.appendChild(B('Undo',function(){lv=0;c.undo()},{'aria-label':'Undo'}));
    bar.appendChild(B('Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)},{'aria-label':'Hint'}));
    bar.appendChild(kind==='try'?B('Try again',function(){lv=0;c.restart()},{'aria-label':tryLabel||'Try again'}):B('Restart',function(){lv=0;c.restart()},{'aria-label':'Restart this level'}));
    if(w)w.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,moves:c.moves,destroy:function(){clearTimeout(tm);c.destroy()}}}}

/* ================= 1. Odd One Out ================= */
function ooAcyclic(n,bits){var adj=[],ind=[],i,j;for(i=0;i<n;i++){adj.push([]);ind.push(0)}
  for(j=0;j<n;j++){var a=(j+n-1)%n,o=bits[j]?j:a,u=bits[j]?a:j;adj[o].push(u);ind[u]++}
  var q=[],seen=0;for(i=0;i<n;i++)if(!ind[i])q.push(i);
  while(q.length){var x=q.pop();seen++;adj[x].forEach(function(y){if(--ind[y]===0)q.push(y)})}
  return seen===n}
function ooMake(level,rng){var rounds=3+Math.floor((level-1)/6),k=level<=10?3:level<=20?4:5,R=[],ns=level<=6?[3,4]:level<=14?[3,4,5]:[3,4,5,6],i,f,j;
  for(i=0;i<rounds;i++){var n=ns[pzInt(rng,ns.length)],odd=pzInt(rng,k),figs=[];
    for(f=0;f<k;f++){var v=pzInt(rng,2),bits=[];for(j=0;j<n;j++)bits.push(v);
      if(f!==odd){var fl=level<=10?1+pzInt(rng,Math.max(1,Math.floor(n/2))):1,pos=pzShuffle(seq(n),rng);fl=Math.min(fl,n-1);for(j=0;j<fl;j++)bits[pos[j]]=1-v}
      figs.push({bits:bits,rot:pzInt(rng,360),mir:pzInt(rng,2)})}
    R.push({n:n,odd:odd,figs:figs})}
  return{title:'Level '+level,level:level,rounds:R,k:k,par:rounds,mono:level>10}}
PZD7.oo={acyclic:ooAcyclic,make:ooMake};
/* draw one frame: n flat strips round a ring; strips are painted in order, then the strips that must lie on top of the painting order are redrawn near their corner */
function ooFig(n,bits,rot,mir,mono){var svg=sv('svg',{viewBox:'0 0 100 100','aria-hidden':'true',focusable:'false'}),g=sv('g',mir?{transform:'translate(100 0) scale(-1 1)'}:{}),V=[],i,t=n>=6?7:8.5,e=t*.75,Rr=33,tones=['var(--tint)','var(--surface)','var(--accent)'];
  svg.appendChild(g);
  for(i=0;i<n;i++){var a=(rot+360*i/n-90)*Math.PI/180;V.push([50+Rr*Math.cos(a),50+Rr*Math.sin(a)])}
  function tone(k){return mono?'var(--surface)':(n%2&&k===n-1)?tones[2]:tones[k%2]}
  function geo(k){var A=V[k],Bp=V[(k+1)%n],dx=Bp[0]-A[0],dy=Bp[1]-A[1],L=Math.sqrt(dx*dx+dy*dy),ux=dx/L,uy=dy/L,nx=-uy*t/2,ny=ux*t/2;
    return{pt:function(s,side){var x=A[0]+ux*s,y=A[1]+uy*s;return side?[x+nx,y+ny]:[x-nx,y-ny]},L:L}}
  function P(p){return r1(p[0])+' '+r1(p[1])}
  function strip(k){var q=geo(k),a=q.pt(-e,0),b=q.pt(-e,1),c=q.pt(q.L+e,1),d=q.pt(q.L+e,0);
    g.appendChild(sv('path',{d:'M'+P(a)+'L'+P(b)+'L'+P(c)+'L'+P(d)+'Z',fill:tone(k),stroke:'var(--ink)','stroke-width':'1.3','stroke-linejoin':'round'}))}
  function piece(k,start){var q=geo(k),ln=e+t*1.5,s0=start?-e:q.L-ln+e,s1=start?ln-e:q.L+e,a=q.pt(s0,0),b=q.pt(s0,1),c=q.pt(s1,1),d=q.pt(s1,0);
    g.appendChild(sv('path',{d:'M'+P(a)+'L'+P(b)+'L'+P(c)+'L'+P(d)+'Z',fill:tone(k)}));
    var open=start?[q.pt(ln-e,0),q.pt(-e,0),q.pt(-e,1),q.pt(ln-e,1)]:[q.pt(q.L-ln+e,0),q.pt(q.L+e,0),q.pt(q.L+e,1),q.pt(q.L-ln+e,1)];
    g.appendChild(sv('path',{d:'M'+P(open[0])+'L'+P(open[1])+'L'+P(open[2])+'L'+P(open[3]),fill:'none',stroke:'var(--ink)','stroke-width':'1.3','stroke-linejoin':'round'}))}
  for(i=0;i<n;i++)strip(i);
  for(var j=0;j<n;j++){var a2=(j+n-1)%n,def=j===0?a2:j,req=bits[j]?j:a2;if(req!==def){if(req===j)piece(j,true);else piece(a2,false)}}
  return svg}
function mountOo(root,inst,api){var w=shell(root,'pd7-oo'),R=inst.rounds,ri,solved,wrong,steps=0,hints=0,attempts=1,fin=false,hl,btns=[],L='ABCDE',
  info=pzEl('p',{class:'pd7-info',text:'Each frame is made of flat strips laid one over another. At every corner one strip lies on top of the other. Tap the one frame that could not be built from real strips.'}),
  prog=pzEl('p',{class:'pd7-prog'}),grid=pzEl('div',{class:'pd7-figs',role:'group','aria-label':'Frames to choose from'}),msg=pzEl('p',{class:'pd7-msg',role:'status'}),nextb=B('Next frames',function(){next()},{'aria-label':'Next frames'});
  nextb.style.display='none';
  function say(t){say2(msg,api,t)}
  function render(){var rd=R[ri],f;grid.textContent='';btns=[];prog.textContent='Frames '+(ri+1)+' of '+R.length;
    for(f=0;f<rd.figs.length;f++)(function(f){var fg=rd.figs[f],b=B('',function(){tap(f)},{class:'pd7-fig','aria-label':'Frame '+L[f]+', '+rd.n+' strips'});
      b.appendChild(ooFig(rd.n,fg.bits,fg.rot,fg.mir,inst.mono));b.appendChild(pzEl('span',{text:'Frame '+L[f]}));btns.push(b);grid.appendChild(b)})(f);
    nextb.style.display='none';hl=-1;paint()}
  function paint(){var rd=R[ri];btns.forEach(function(b,f){var bad=wrong[f],yes=solved&&f===rd.odd;b.disabled=!!(bad||solved);b.className='pzb pd7-btn pd7-fig'+(yes?' pd7-yes':'')+(hl===f?' pd7-hint':'');
    b.setAttribute('aria-label','Frame '+L[f]+', '+rd.n+' strips'+(bad?', can be built':'')+(yes?', the odd one':'')+(hl===f?', hint':''));
    b.lastChild.textContent='Frame '+L[f]+(bad?': can be built':'')+(yes?': cannot be built':'')})}
  function reset(){ri=0;solved=false;wrong={};hl=-1;fin=false;render()}
  function tap(f){if(fin||solved||wrong[f])return;var rd=R[ri];steps++;api.moved();hl=-1;
    if(f===rd.odd){solved=true;paint();
      if(ri===R.length-1){fin=true;say('Yes: Frame '+L[f]+' is the odd one. Going round it, every strip lies over the one before it, so it can never be stacked.');api.done({solved:true,moves:steps,hints:hints,undos:0,extra:{par:inst.par,attempts:attempts,rounds:R.length}})}
      else{say('Yes: Frame '+L[f]+' is the odd one. Going round it, every strip lies over the one before it (or every strip under), so it can never be stacked.');nextb.style.display='';try{nextb.focus()}catch(e){}}}
    else{wrong[f]=true;paint();say('Frame '+L[f]+' can be built: its corners can be stacked in layers. Try another frame.')}}
  function next(){if(!solved||ri>=R.length-1)return;ri++;solved=false;wrong={};render();say('New frames. '+prog.textContent+'.')}
  w.appendChild(info);w.appendChild(prog);w.appendChild(grid);w.appendChild(nextb);w.appendChild(msg);reset();
  return{undo:function(){return false},
    restart:function(){if(fin)return;if(steps)attempts++;reset();say('Back to the first frames.')},moves:function(){return steps},
    hint:function(lv){if(fin||solved)return null;hints++;var rd=R[ri],s,c=[];
      if(lv<=1)s='Go round one frame, corner by corner, and note which strip lies on top at each corner.';
      else if(lv===2){rd.figs.forEach(function(x,f){if(f!==rd.odd&&!wrong[f])c.push(f)});
        if(c.length){wrong[c[0]]=true;hl=-1;paint();s='Frame '+L[c[0]]+' can be built, so it is not the one. Look at how the corners of the rest line up.'}else s='Only one frame is left to choose.'}
      else{tap(rd.odd);return msg.textContent}
      say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({undo:false,id:'odd-one-out',name:'Odd One Out',family:'grid',theme:'F1',blurb:'Spot the frame that could not be built from real strips.',
  how:'Each frame is made of flat strips laid over one another. Tap the one frame whose strips cannot be stacked in layers: going round, each strip lies over the one before it. A wrong tap is kind and teaches you something.',
  areas:['attention','space'],levels:30,secs:60,calm:true,make:ooMake,mount:wrap(mountOo,'try','Try again from the first frames'),
  stars:function(res,inst){var par=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0,s=pzStarsByPar(m,par,h);
    return{stars:s,line:'You found every odd frame in '+plural(m,'tap')+' with '+hintsLine(h)+'. The fewest possible is '+par+'.'}}});

/* ================= 2. Four Shades ================= */
var FS_COL=['#f4c95d','#7fb8ea','#9ad99a','#e8a0d8'],FS_L='ABCD',FS_NAME=['solid','stripes','dots','cross-hatch'];
function fsClip(poly,a,b){var nx=b[0]-a[0],ny=b[1]-a[1],c=(b[0]*b[0]+b[1]*b[1]-a[0]*a[0]-a[1]*a[1])/2,out=[],n=poly.length;
  for(var k=0;k<n;k++){var p=poly[k],q=poly[(k+1)%n],fp=p[0]*nx+p[1]*ny-c,fq=q[0]*nx+q[1]*ny-c;
    if(fp<=0)out.push(p);if((fp<0&&fq>0)||(fp>0&&fq<0)){var t=fp/(fp-fq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t])}}
  return out}
function fsVor(S,W,H){return S.map(function(s,i){var poly=[[0,0],[W,0],[W,H],[0,H]];for(var j=0;j<S.length;j++)if(j!==i)poly=fsClip(poly,s,S[j]);return poly})}
function fsAdj(S,P,minLen){minLen=minLen||.3;var n=S.length,adj=seq(n).map(function(){return[]});
  P.forEach(function(poly,i){for(var k=0;k<poly.length;k++){var p=poly[k],q=poly[(k+1)%poly.length];if(Math.hypot(p[0]-q[0],p[1]-q[1])<minLen)continue;
    for(var j=0;j<n;j++)if(j!==i){var a=S[i],b=S[j],d=Math.hypot(b[0]-a[0],b[1]-a[1]),c=(b[0]*b[0]+b[1]*b[1]-a[0]*a[0]-a[1]*a[1])/2;
      if(Math.abs((p[0]*(b[0]-a[0])+p[1]*(b[1]-a[1])-c)/d)<1e-6&&Math.abs((q[0]*(b[0]-a[0])+q[1]*(b[1]-a[1])-c)/d)<1e-6&&adj[i].indexOf(j)<0)adj[i].push(j)}}});
  adj.forEach(function(l,i){l.forEach(function(j){if(adj[j].indexOf(i)<0)adj[j].push(i)})});adj.forEach(function(l){l.sort(function(a,b){return a-b})});return adj}
/* complete a partial colouring (-1 = none) with 4 colours by backtracking on the most constrained region; returns a full array or null */
function fsSolve(adj,col,rng){var n=col.length,c=col.slice();
  function dom(i){var m=[1,1,1,1];adj[i].forEach(function(j){if(c[j]>=0)m[c[j]]=0});return m}
  function rec(){var best=-1,bd=null,bc=9,i;for(i=0;i<n;i++)if(c[i]<0){var d=dom(i),k=d[0]+d[1]+d[2]+d[3];if(k<bc){bc=k;best=i;bd=d}}
    if(best<0)return true;if(!bc)return false;var o=rng?pzShuffle([0,1,2,3],rng):[0,1,2,3];
    for(var x=0;x<4;x++)if(bd[o[x]]){c[best]=o[x];if(rec())return true;c[best]=-1}return false}
  return rec()?c:null}
function fsSites(n,W,H,rng){var S=[],minD=15,tries=0,i;
  while(S.length<n){var x=6+rng()*(W-12),y=6+rng()*(H-12),ok=true;for(i=0;i<S.length;i++)if(Math.hypot(S[i][0]-x,S[i][1]-y)<minD){ok=false;break}
    if(ok)S.push([x,y]);else if(++tries%500===0)minD*=.94}
  return S}
function fsMake(level,rng){var n=15+Math.round((level-1)*15/29),W=100,H=140,S,P,i,t;
  for(t=0;t<60;t++){S=fsSites(n,W,H,rng);P=fsVor(S,W,H);
    /* reject maps where two regions meet along a very short edge: it is hard to see whether they touch */
    if(JSON.stringify(fsAdj(S,P,.01))===JSON.stringify(fsAdj(S,P,1.2)))break}
  var adj=fsAdj(S,P,1.2),sol=fsSolve(adj,seq(n).map(function(){return-1}),rng),lc=Math.round(n*Math.max(0,.5-(level-1)*.0175)),locked=seq(n).map(function(){return-1}),order=pzShuffle(seq(n),rng);
  for(i=0;i<lc;i++)locked[order[i]]=sol[order[i]];
  return{title:'Level '+level,level:level,n:n,W:W,H:H,seeds:S.map(function(s){return[r1(s[0]),r1(s[1])]}),polys:P.map(function(p){return p.map(function(q){return[r2(q[0]),r2(q[1])]})}),adj:adj,locked:locked,sol:sol,par:n-lc}}
PZD7.fs={make:fsMake,solve:fsSolve,vor:fsVor,adjOf:fsAdj};
function mountFs(root,inst,api){var w=shell(root,'pd7-fs'),n=inst.n,W=inst.W,H=inst.H,lock=inst.locked,adj=inst.adj,col,undoS=[],steps=0,hints=0,sel=-1,hl=-1,fin=false,lastI=-1,pid='pd7fs'+(++UID),
  info=pzEl('p',{class:'pd7-info',text:'Give every region a colour so that regions sharing a border never share a colour. Tap a region, then a colour. Colours also have a letter and a pattern. A double ring marks a fixed region.'}),
  stat=pzEl('p',{class:'pd7-prog'}),map=pzEl('div',{class:'pd7-map'}),msg=pzEl('p',{class:'pd7-msg',role:'status'}),pal=pzEl('div',{class:'pd7-row',role:'group','aria-label':'Colours'}),polys=[],nodes=[],swb=[],i,k;
  col=lock.slice();
  function say(t){say2(msg,api,t)}
  map.style.paddingTop=(H/W*100)+'%';
  var svg=sv('svg',{viewBox:'0 0 '+W+' '+H,preserveAspectRatio:'none','aria-hidden':'true',focusable:'false'}),defs=sv('defs');svg.appendChild(defs);
  for(k=0;k<4;k++){var pt=sv('pattern',{id:pid+k,width:'4',height:'4',patternUnits:'userSpaceOnUse'});pt.appendChild(sv('rect',{width:'4',height:'4',fill:FS_COL[k]}));
    if(k===1)pt.appendChild(sv('rect',{x:'0',y:'0',width:'1.5',height:'4',fill:'#2b2b2b'}));
    if(k===2)pt.appendChild(sv('circle',{cx:'2',cy:'2',r:'.95',fill:'#2b2b2b'}));
    if(k===3)pt.appendChild(sv('path',{d:'M0 0L4 4M4 0L0 4',stroke:'#2b2b2b','stroke-width':'.7',fill:'none'}));defs.appendChild(pt)}
  for(i=0;i<n;i++){var d='M'+inst.polys[i].map(function(p){return p[0]+' '+p[1]}).join('L')+'Z',pe=sv('path',{d:d,fill:'var(--surface)',stroke:'var(--ink)','stroke-width':'.5','stroke-linejoin':'round'});polys.push(pe);svg.appendChild(pe)}
  map.appendChild(svg);
  for(i=0;i<n;i++)(function(i){var b=pzBtn('',function(){choose(i)},{class:'pd7-node','aria-label':'Region '+(i+1)});b.style.left=r1(inst.seeds[i][0]/W*100)+'%';b.style.top=r1(inst.seeds[i][1]/H*100)+'%';
    b.appendChild(pzEl('span',{text:String(i+1)}));nodes.push(b);map.appendChild(b)})(i);
  for(k=0;k<4;k++)(function(k){var b=B('',function(){paintWith(k)},{class:'pd7-sw','aria-label':'Colour '+FS_L[k]+', '+FS_NAME[k]}),s=sv('svg',{viewBox:'0 0 26 26','aria-hidden':'true',focusable:'false'});
    s.appendChild(sv('rect',{x:'1',y:'1',width:'24',height:'24',rx:'4',fill:'url(#'+pid+k+')',stroke:'var(--ink)','stroke-width':'2'}));b.appendChild(s);b.appendChild(pzEl('span',{text:FS_L[k]}));swb.push(b);pal.appendChild(b)})(k);
  var clr=B('Clear',function(){paintWith(-1)},{'aria-label':'Clear the chosen region'});pal.appendChild(clr);
  function clashes(){var c={};for(var a=0;a<n;a++)if(col[a]>=0)adj[a].forEach(function(b){if(col[b]===col[a]){c[a]=1}});return c}
  function paint(){var cl=clashes(),done=0,bad=Object.keys(cl).length;
    for(var a=0;a<n;a++){if(col[a]>=0)done++;polys[a].setAttribute('fill',col[a]<0?'var(--surface)':'url(#'+pid+col[a]+')');
      polys[a].setAttribute('stroke-width',cl[a]?'1.3':'.5');if(cl[a])polys[a].setAttribute('stroke-dasharray','1.6 1');else polys[a].removeAttribute('stroke-dasharray');
      var nd=nodes[a];nd.className='pzb pd7-node'+(lock[a]>=0?' pd7-fixed':'')+(sel===a?' pd7-sel':'')+(hl===a?' pd7-hint':'')+(cl[a]?' pd7-bad':'');
      nd.firstChild.textContent=col[a]>=0?FS_L[col[a]]:String(a+1);
      nd.setAttribute('aria-label','Region '+(a+1)+', '+(col[a]>=0?'colour '+FS_L[col[a]]+' '+FS_NAME[col[a]]:'not coloured')+(lock[a]>=0?', fixed':'')+(cl[a]?', clashes with a neighbour':'')+', touches '+adj[a].map(function(x){return x+1}).join(' '))}
    stat.textContent='Coloured '+done+' of '+n+(bad?'. Clashes: '+bad+' regions.':'. No clashes.');
    for(var q=0;q<4;q++)swb[q].setAttribute('aria-pressed',sel>=0&&col[sel]===q?'true':'false')}
  function check(){var cl=clashes();for(var a=0;a<n;a++)if(col[a]<0)return false;return!Object.keys(cl).length}
  function choose(i){if(fin)return;sel=i;hl=-1;paint();say('Region '+(i+1)+' chosen'+(lock[i]>=0?'. It is fixed.':'. Now pick a colour.'))}
  function paintWith(c){if(fin)return;if(sel<0){say('Pick a region first.');return}if(lock[sel]>=0){say('Region '+(sel+1)+' is fixed.');return}if(col[sel]===c)return;
    undoS.push([sel,col[sel]]);col[sel]=c;lastI=sel;steps++;api.moved();hl=-1;paint();
    if(c<0){say('Region '+(sel+1)+' cleared.');return}
    if(check()){fin=true;say('Every region is coloured and no two neighbours match. Solved.');api.done({solved:true,moves:steps,hints:hints,undos:0,extra:{par:inst.par,n:n}})}
    else say('Region '+(sel+1)+' is now '+FS_L[c]+' ('+FS_NAME[c]+').')}
  w.appendChild(info);w.appendChild(stat);w.appendChild(map);w.appendChild(pal);w.appendChild(msg);paint();
  function dom(i){var m=[1,1,1,1];adj[i].forEach(function(j){if(col[j]>=0)m[col[j]]=0});var o=[];m.forEach(function(v,x){if(v)o.push(x)});return o}
  return{undo:function(){if(fin||!undoS.length)return false;var u=undoS.pop();col[u[0]]=u[1];hl=-1;paint();say('Undone.');return true},
    restart:function(){if(fin)return;col=lock.slice();undoS=[];sel=-1;hl=-1;paint();say('Every free region is clear again.')},moves:function(){return steps},
    hint:function(lv){if(fin)return null;hints++;var cl=clashes(),ids=Object.keys(cl),s,i;
      if(ids.length){i=+ids[0];var j=adj[i].filter(function(x){return col[x]===col[i]})[0];
        if(lock[i]>=0&&lock[j]<0){var t=i;i=j;j=t}
        if(lv<=1){hl=i;s='Look at the marked region: it matches a neighbour it touches.'}
        else if(lv===2){hl=i;s='Regions '+(i+1)+' and '+(j+1)+' touch and both use '+FS_L[col[i]]+'. Change one of them.'}
        else{sel=i;undoS.push([i,col[i]]);col[i]=-1;steps++;api.moved();hl=-1;paint();s='Region '+(i+1)+' cleared because it matched a neighbour.';say(s);return s}
        paint();say(s);return s}
      var sol=fsSolve(adj,col,null);
      if(!sol){if(lv<=1){hl=lastI;s='The colours so far cannot all be completed. The last region you coloured is marked.'}
        else if(lv===2){hl=lastI;s='Take back the last colour you placed, or press Undo, and try a different colour.'}
        else{if(undoS.length){var u=undoS.pop();col[u[0]]=u[1];hl=-1;paint();s='The last colour was taken back.';say(s);return s}s='Press Restart to begin again.'}
        paint();say(s);return s}
      var best=-1,bc=9;for(i=0;i<n;i++)if(col[i]<0){var dd=dom(i).length;if(dd<bc){bc=dd;best=i}}
      if(best<0)return null;
      if(lv<=1){hl=best;s='Look at the marked region: few colours are left for it.'}
      else if(lv===2){hl=best;s='Region '+(best+1)+' can still use '+dom(best).map(function(x){return FS_L[x]}).join(' or ')+'.'}
      else{sel=best;undoS.push([best,-1]);col[best]=sol[best];lastI=best;steps++;api.moved();hl=-1;paint();s='Region '+(best+1)+' is now '+FS_L[sol[best]]+'.';
        if(check()){fin=true;say(s);api.done({solved:true,moves:steps,hints:hints,undos:0,extra:{par:inst.par,n:n}});return s}say(s);return s}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'four-shades',name:'Four Shades',family:'grid',theme:'F8',blurb:'Colour a map with four colours so neighbours never match.',
  how:'Pick a region, then pick one of four colours. Colours have letters and patterns too. Regions that share a border must differ. Some regions are fixed. Solve it by colouring every free region.',
  areas:['space','flex'],levels:30,secs:110,calm:true,make:fsMake,mount:wrap(mountFs,'full'),
  stars:function(res,inst){var par=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0,s=pzStarsByPar(m,par,h);
    return{stars:s,line:'You coloured the map in '+plural(m,'tap')+' with '+hintsLine(h)+'. Colouring each free region once takes '+par+'.'}}});

/* ================= 3. Sprout Lines ================= */
var SG=30,DR=[-1,1,0,0],DC=[0,0,-1,1];
function spNew(pos){var w=new Uint8Array(SG*SG),spots=[];pos.forEach(function(p){spots.push({r:p[0],c:p[1],l:3});w[p[0]*SG+p[1]]=2});return{w:w,spots:spots,moves:[]}}
function spClone(st){return{w:st.w.slice(),spots:st.spots.map(function(s){return{r:s.r,c:s.c,l:s.l}}),moves:st.moves.slice()}}
function spIdx(s){return s.r*SG+s.c}
function spEmptyNb(st,idx){var r=Math.floor(idx/SG),c=idx%SG,o=[];for(var d=0;d<4;d++){var rr=r+DR[d],cc=c+DC[d];if(rr>=0&&rr<SG&&cc>=0&&cc<SG&&st.w[rr*SG+cc]===0)o.push(rr*SG+cc)}return o}
function spAdjTo(idx,target){var r=Math.floor(idx/SG),c=idx%SG,tr=Math.floor(target/SG),tc=target%SG;return Math.abs(r-tr)+Math.abs(c-tc)===1}
/* breadth-first search over empty cells from src cells to the first cell satisfying goal(cell); returns cell list or null */
function spBfs(st,src,goal,rng){var prev=new Int16Array(SG*SG).fill(-2),q=[],h=0,i;
  src=rng?pzShuffle(src,rng):src;src.forEach(function(s){prev[s]=-1;q.push(s)});
  while(h<q.length){var x=q[h++];if(goal(x)){var p=[],y=x;while(y>=0){p.push(y);y=prev[y]}return p.reverse()}
    var r=Math.floor(x/SG),c=x%SG,o=rng?pzInt(rng,4):0;
    for(i=0;i<4;i++){var d=(o+i)&3,rr=r+DR[d],cc=c+DC[d];if(rr>=0&&rr<SG&&cc>=0&&cc<SG){var y2=rr*SG+cc;if(st.w[y2]===0&&prev[y2]===-2){prev[y2]=x;q.push(y2)}}}}
  return null}
function spRoute(st,a,b,rng){var A=spIdx(st.spots[a]),Bc=spIdx(st.spots[b]);
  if(a!==b){var p=spBfs(st,spEmptyNb(st,A),function(x){return spAdjTo(x,Bc)},rng);return p?[A].concat(p,[Bc]):null}
  var nb=spEmptyNb(st,A),best=null;if(rng)nb=pzShuffle(nb,rng);
  nb.forEach(function(n1){var p=spBfs(st,[n1],function(x){return x!==n1&&spAdjTo(x,A)},null);if(p&&(!best||p.length<best.length))best=p});
  return best?[A].concat(best,[A]):null}
function spApply(st,path,f,t){var k=path.length-2,mid=path[Math.ceil(k/2)],i;for(i=1;i<=k;i++)st.w[path[i]]=1;st.w[mid]=2;
  st.spots.push({r:Math.floor(mid/SG),c:mid%SG,l:1});if(f===t)st.spots[f].l-=2;else{st.spots[f].l--;st.spots[t].l--}st.moves.push({f:f,t:t,path:path})}
function spLegal(st){var comp=new Int16Array(SG*SG).fill(-1),nc=0,i,out=[];
  for(i=0;i<SG*SG;i++)if(st.w[i]===0&&comp[i]<0){var q=[i],h=0;comp[i]=nc;while(h<q.length){var x=q[h++],r=Math.floor(x/SG),c=x%SG;for(var d=0;d<4;d++){var rr=r+DR[d],cc=c+DC[d];if(rr>=0&&rr<SG&&cc>=0&&cc<SG){var y=rr*SG+cc;if(st.w[y]===0&&comp[y]<0){comp[y]=nc;q.push(y)}}}}nc++}
  var cs=st.spots.map(function(s){return s.l>=1?spEmptyNb(st,spIdx(s)).map(function(x){return comp[x]}):[]});
  for(i=0;i<st.spots.length;i++){if(st.spots[i].l<1)continue;
    if(st.spots[i].l>=2){var seen={},lp=false;cs[i].forEach(function(cp){if(seen[cp])lp=true;seen[cp]=1});if(lp)out.push({f:i,t:i})}
    for(var j=i+1;j<st.spots.length;j++)if(st.spots[j].l>=1&&cs[i].some(function(cp){return cs[j].indexOf(cp)>=0}))out.push({f:i,t:j})}
  return out}
function spPlay(st,K,rng){while(st.moves.length<K){var lm=spLegal(st);if(!lm.length)break;var m=lm[pzInt(rng,lm.length)],p=spRoute(st,m.f,m.t,rng);if(!p)break;spApply(st,p,m.f,m.t)}return st}
function spFind(st0,K,rng,tries){var best=null;for(var t=0;t<tries;t++){var st=spPlay(spClone(st0),K,rng);if(!best||st.moves.length>best.moves.length)best=st;if(st.moves.length>=K)break}return best}
var SP_POS={2:[[9,9],[20,20]],3:[[8,14],[21,8],[21,21]],4:[[8,8],[8,21],[21,8],[21,21]]};
function spSpec(level){var n=level<=8?2:level<=20?3:4,K;
  if(n===2)K=3+Math.floor((level-1)/3);else if(n===3)K=Math.min(8,5+Math.floor((level-9)/4));else K=7+Math.floor((level-21)*4/9);
  return{n:n,K:Math.min(K,3*n-1)}}
function spMake(level,rng){var sp=spSpec(level),pos=SP_POS[sp.n].map(function(p){return[p[0]+pzInt(rng,3)-1,p[1]+pzInt(rng,3)-1]}),st0=spNew(pos),best=spFind(st0,sp.K,rng,80),K=Math.min(sp.K,best.moves.length);
  return{title:'Level '+level,level:level,n:sp.n,G:SG,spots0:pos,K:K,par:K,sol:best.moves.slice(0,K).map(function(m){return{f:m.f,t:m.t,path:m.path}})}}
PZD7.sp={make:spMake,spec:spSpec};
function spSmooth(pts){for(var it=0;it<2;it++){var o=[pts[0]],i;for(i=0;i<pts.length-1;i++){var p=pts[i],q=pts[i+1];o.push([.75*p[0]+.25*q[0],.75*p[1]+.25*q[1]],[.25*p[0]+.75*q[0],.25*p[1]+.75*q[1]])}o.push(pts[pts.length-1]);pts=o}return pts}
function mountSp(root,inst,api){var w=shell(root,'pd7-sp'),K=inst.K,st,hist=[],steps=0,hints=0,undos=0,sel=-1,hl=[],fin=false,over=false,drag=null,skip=false,
  info=pzEl('p',{class:'pd7-info',text:'Each spot can take up to three lines. Join one spot to another, or a spot back to itself. Lines may not cross or touch other lines. Each line grows a new spot in its middle, which has one line left. Make '+K+' lines before no line can be drawn. Tap a spot, then another spot (tap the same spot again for a loop), or drag between spots.'}),
  prog=pzEl('p',{class:'pd7-prog'}),board=pzEl('div',{class:'pd7-map pd7-board'}),msg=pzEl('p',{class:'pd7-msg',role:'status'}),row=pzEl('div',{class:'pd7-row'}),
  svg=sv('svg',{viewBox:'0 0 '+SG+' '+SG,'aria-hidden':'true',focusable:'false'}),gl=sv('g'),gd=sv('g'),draft=sv('path',{class:'pd7-draft',d:''}),btns=[];
  board.style.paddingTop='100%';svg.appendChild(gl);svg.appendChild(gd);svg.appendChild(draft);board.appendChild(svg);
  var cancel=B('Clear choice',function(){sel=-1;paint();say('Choice cleared.')},{'aria-label':'Clear the chosen spot'});row.appendChild(cancel);
  function say(t){say2(msg,api,t)}
  function rebuild(){st=spNew(inst.spots0);hist.forEach(function(m){spApply(st,m.path,m.f,m.t)})}
  function cx(i){return(i%SG+.5)}function cy(i){return(Math.floor(i/SG)+.5)}
  function paint(){gl.textContent='';gd.textContent='';btns.forEach(function(b){b.remove()});btns=[];
    st.moves.forEach(function(m){var pts=spSmooth(m.path.map(function(i){return[cx(i),cy(i)]}));gl.appendChild(sv('path',{class:'pd7-line',d:'M'+pts.map(function(p){return r2(p[0])+' '+r2(p[1])}).join('L')}))});
    var live=0;st.spots.forEach(function(s,i){var x=s.c+.5,y=s.r+.5;
      if(s.l<1){gd.appendChild(sv('circle',{cx:x,cy:y,r:'.62',fill:'var(--ink)',stroke:'var(--surface)','stroke-width':'.12'}));return}live++;
      var b=pzBtn('',function(){onSpot(i)},{class:'pd7-node','aria-label':'Spot '+(i+1)+', '+plural(s.l,'line')+' left'+(sel===i?', chosen':'')+(hl.indexOf(i)>=0?', hint':'')});
      b.className='pzb pd7-node'+(sel===i?' pd7-sel':'')+(hl.indexOf(i)>=0?' pd7-hint':'');b.dataset.spot=i;b.style.left=r1(x/SG*100)+'%';b.style.top=r1(y/SG*100)+'%';b.appendChild(pzEl('span',{text:String(s.l)}));btns.push(b);board.appendChild(b)});
    prog.textContent='Lines made: '+st.moves.length+' of '+K+'. Spots with a line free: '+live+'.';cancel.disabled=sel<0}
  function commit(path,f,t){spApply(st,path,f,t);hist.push({f:f,t:t,path:path});steps++;api.moved();sel=-1;hl=[];over=false;paint();
    if(st.moves.length>=K){fin=true;say('Line '+K+' is drawn. Solved.');api.done({solved:true,moves:steps,hints:hints,undos:undos,extra:{par:inst.par,K:K}});return}
    if(!spLegal(st).length){over=true;say('No line is left to draw after '+st.moves.length+' lines, and you need '+K+'. Press Undo to take lines back.')}
    else say('Line '+st.moves.length+' of '+K+' drawn. A new spot grew in its middle.')}
  function onSpot(i){if(fin||skip)return;var s=st.spots[i];if(s.l<1)return;
    if(sel<0){sel=i;paint();say('Spot '+(i+1)+' chosen. Tap another spot to join it, or tap this one again for a loop.');return}
    if(sel===i){if(s.l<2){say('A loop needs two free lines and this spot has one.');sel=-1;paint();return}var lp=spRoute(st,i,i,null);if(!lp){say('There is no room for a loop at this spot.');return}commit(lp,i,i);return}
    var p=spRoute(st,sel,i,null);if(!p){say('No clear path joins those two spots. Another line may be in the way.');return}commit(p,sel,i)}
  function cellAt(e){var r=svg.getBoundingClientRect();if(!r.width)return-1;var c=Math.floor((e.clientX-r.left)/r.width*SG),rr=Math.floor((e.clientY-r.top)/r.height*SG);return(c<0||rr<0||c>=SG||rr>=SG)?-1:rr*SG+c}
  function spotAtCell(c){for(var i=0;i<st.spots.length;i++)if(spIdx(st.spots[i])===c)return i;return-1}
  function dpath(){draft.setAttribute('d',drag&&drag.cells.length>1?'M'+drag.cells.map(function(i){return r2(cx(i))+' '+r2(cy(i))}).join('L'):'')}
  function mv(e){if(!drag)return;var tc=cellAt(e);if(tc<0||drag.end>=0)return;var last=drag.cells[drag.cells.length-1],g=0;
    while(last!==tc&&g++<60){var lr=Math.floor(last/SG),lc=last%SG,tr=Math.floor(tc/SG),tcc=tc%SG,nr=lr,nc=lc;
      if(Math.abs(tr-lr)>=Math.abs(tcc-lc)&&tr!==lr)nr+=tr>lr?1:-1;else nc+=tcc>lc?1:-1;var nx=nr*SG+nc;
      if(st.w[nx]===0&&drag.cells.indexOf(nx)<0){drag.cells.push(nx);last=nx}
      else if(st.w[nx]===2){var si=spotAtCell(nx);if(si>=0&&st.spots[si].l>=1&&(si!==drag.from||drag.cells.length>=4)){drag.cells.push(nx);drag.end=si}break}
      else break}
    dpath()}
  function up(){window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);
    var d=drag;drag=null;draft.setAttribute('d','');if(!d||d.cells.length<4)return;skip=true;setTimeout(function(){skip=false},60);
    var cells=d.cells.slice(),t=d.end,i;
    if(t<0){var lastc=cells[cells.length-1];for(i=0;i<st.spots.length;i++){var s=st.spots[i];if(s.l>=1&&spAdjTo(lastc,spIdx(s))&&(i!==d.from||cells.length>=4)){t=i;break}}if(t>=0)cells.push(spIdx(st.spots[t]))}
    if(t<0){say('A line must start and end on a spot. Try again.');return}
    var f=d.from,k=cells.length-2,s1=st.spots[f];
    if(f===t&&(s1.l<2||k<3)){say('That loop is too small or the spot has too few free lines.');return}
    if(k<1){say('That line is too short.');return}
    if(!spAdjTo(cells[1],cells[0])||!spAdjTo(cells[k],cells[k+1])){say('That line did not reach a spot.');return}
    commit(cells,f,t)}
  board.addEventListener('pointerdown',function(e){if(fin)return;var b=e.target.closest?e.target.closest('.pd7-node'):null;if(!b||b.dataset.spot===undefined)return;var i=+b.dataset.spot;if(st.spots[i].l<1)return;
    drag={from:i,cells:[spIdx(st.spots[i])],end:-1};window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up)});
  w.appendChild(info);w.appendChild(prog);w.appendChild(board);w.appendChild(row);w.appendChild(msg);rebuild();paint();
  var kd=function(e){if(e.key==='Escape'&&sel>=0){sel=-1;paint()}};root.addEventListener('keydown',kd);
  function plan(){var ok=hist.length<=inst.sol.length&&hist.every(function(m,i){var s=inst.sol[i];return m.f===s.f&&m.t===s.t&&m.path.join()===s.path.join()});
    if(ok&&hist.length<K)return inst.sol.slice(hist.length,K);var r=spFind(st,K,pzRng('sp|'+hist.length+'|'+K),60);return r&&r.moves.length>=K?r.moves.slice(hist.length,K):null}
  var ctl;
  ctl={undo:function(){if(fin||!hist.length)return false;hist.pop();undos++;sel=-1;hl=[];over=false;rebuild();paint();say('Last line taken back.');return true},
    restart:function(){if(fin)return;hist=[];sel=-1;hl=[];over=false;rebuild();paint();say('The board is clear again.')},moves:function(){return hist.length},
    hint:function(lv){if(fin)return null;hints++;var p=plan(),s;
      if(!p||!p.length){if(lv<3){s='I cannot see a way to reach '+K+' lines from here. Press Undo to take some lines back.';say(s);return s}
        if(hist.length){ctl.undo();return 'The last line was taken back.'}s='Press Restart to begin again.';say(s);return s}
      var m=p[0];
      if(lv<=1){hl=[m.f];sel=-1;s='Start from the marked spot.'}
      else if(lv===2){hl=m.f===m.t?[m.f]:[m.f,m.t];s=m.f===m.t?'Draw a loop from the marked spot back to itself.':'Join the two marked spots.'}
      else{commit(m.path,m.f,m.t);return msg.textContent}
      paint();say(s);return s},
    destroy:function(){window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);root.removeEventListener('keydown',kd);root.textContent=''}};
  return ctl}
registerPuzzle({id:'sprout-lines',name:'Sprout Lines',family:'move',theme:'F9',blurb:'Draw lines between spots and keep the game alive.',
  how:'Each spot takes up to three lines. Join two spots, or one spot to itself, without crossing any line. Every line grows a new spot. Make the target number of lines before no line can be drawn.',
  areas:['space','control'],levels:30,secs:100,calm:true,make:spMake,mount:wrap(mountSp,'full'),
  stars:function(res,inst){var par=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,u=res.undos||0,h=res.hints||0,s=h?(u>4?1:2):(u>4?2:3);if(u>10)s=1;
    return{stars:s,line:'You drew '+plural(par,'line')+' with '+hintsLine(h)+' and '+plural(u,'line')+' taken back.'}}});

/* ================= 4. Link Across ================= */
var LA_D=[[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,-1]],LA_NB={};
function laNb(N){if(LA_NB[N])return LA_NB[N];var nb=[];for(var r=0;r<N;r++)for(var c=0;c<N;c++){var l=[];LA_D.forEach(function(d){var rr=r+d[0],cc=c+d[1];if(rr>=0&&rr<N&&cc>=0&&cc<N)l.push(rr*N+cc)});nb.push(l)}return LA_NB[N]=nb}
function laConn(N,b,who,nb){var seen=[],q=[],i;
  for(i=0;i<N;i++){var s=who===1?i:i*N;if(b[s]===who){seen[s]=1;q.push(s)}}
  while(q.length){var x=q.pop();if(who===1?x>=N*(N-1):x%N===N-1)return true;nb[x].forEach(function(y){if(b[y]===who&&!seen[y]){seen[y]=1;q.push(y)}})}return false}
function laMove(N,b,k,nb,m){b[m]=1;var ok;if(laConn(N,b,1,nb))ok=true;else if(k<2)ok=false;else{ok=true;var any=false;
  for(var r=0;r<N*N&&ok;r++)if(!b[r]){any=true;b[r]=2;if(laConn(N,b,2,nb)||!laAny(N,b,k-1,nb))ok=false;b[r]=0}if(!any)ok=false}
  b[m]=0;return ok}
function laAny(N,b,k,nb){for(var m=0;m<N*N;m++)if(!b[m]&&laMove(N,b,k,nb,m))return true;return false}
function laWinning(N,b,k,nb){var o=[];for(var m=0;m<N*N;m++)if(!b[m]&&laMove(N,b,k,nb,m))o.push(m);return o}
function laDist(N,b,nb,maxK){for(var k=1;k<=maxK;k++)if(laAny(N,b,k,nb))return k;return 0}
function laEmpt(b){var n=0;b.forEach(function(x){if(!x)n++});return n}
/* computer reply: take a winning cell if it has one, else the cell that leaves the human the longest way across; ties go to the lowest cell */
function laPDist(N,b,nb){var INF=99,d=[],i,ch=true;for(i=0;i<N*N;i++)d.push(INF);
  for(i=0;i<N;i++)if(b[i]!==2)d[i]=b[i]===1?0:1;
  while(ch){ch=false;for(i=0;i<N*N;i++)if(b[i]!==2&&d[i]<INF)nb[i].forEach(function(y){if(b[y]!==2){var v=d[i]+(b[y]===1?0:1);if(v<d[y]){d[y]=v;ch=true}}})}
  var m=INF;for(i=N*(N-1);i<N*N;i++)if(d[i]<m)m=d[i];return m}
function laReply(N,b,nb){var best=-1,bs=-1;for(var r=0;r<N*N;r++)if(!b[r]){b[r]=2;var s=laConn(N,b,2,nb)?1000:laPDist(N,b,nb);b[r]=0;if(s>bs){bs=s;best=r}}return best}
function laPath(N,rng){var r=0,c=pzInt(rng,N),cells=[c],used={};used[c]=1;
  while(r<N-1){var opts=[],o;
    if(rng()<.22){if(c>0&&!used[r*N+c-1])opts.push([r,c-1]);if(c<N-1&&!used[r*N+c+1])opts.push([r,c+1])}
    if(!opts.length){opts.push([r+1,c]);if(c>0)opts.push([r+1,c-1])}
    o=opts[pzInt(rng,opts.length)];r=o[0];c=o[1];used[r*N+c]=1;cells.push(r*N+c)}
  return cells}
function laMake(level,rng){var N=level<=14?4:5,d=level<=9?1:level<=20?2:3,E=d===1?2+pzInt(rng,2):d===2?4+pzInt(rng,2):6+pzInt(rng,2),nb=laNb(N),t,i,b,W;
  for(t=0;t<900;t++){var dt=t<600?d:Math.max(1,d-1);E=t<600?E:Math.max(2,E-2);var path=laPath(N,rng),on={};path.forEach(function(x){on[x]=1});b=[];for(i=0;i<N*N;i++)b.push(on[i]?1:(rng()<.5?1:2));
    var gp=pzShuffle(path,rng),g=Math.min(d,path.length-1);for(i=0;i<g;i++)b[gp[i]]=0;
    var others=pzShuffle(seq(N*N).filter(function(x){return!on[x]}),rng);for(i=0;i<E-g&&i<others.length;i++)b[others[i]]=0;
    if(laEmpt(b)!==E)continue;var np=0,nq=0;b.forEach(function(x){if(x===1)np++;if(x===2)nq++});if(Math.abs(np-nq)>2)continue;
    if(laConn(N,b,1,nb)||laConn(N,b,2,nb))continue;
    if(laDist(N,b,nb,dt)!==dt)continue;W=laWinning(N,b,dt,nb);if(W.length>(t%600<300?1:2))continue;
    return{title:'Level '+level,level:level,N:N,b:b,par:dt,win:W}}
  var pp=laPath(N,rng),onp={};pp.forEach(function(x){onp[x]=1});b=[];for(i=0;i<N*N;i++)b.push(onp[i]?1:2);b[pp[pzInt(rng,pp.length)]]=0;
  var dd=laDist(N,b,nb,3)||1;return{title:'Level '+level,level:level,N:N,b:b,par:dd,win:laWinning(N,b,dd,nb)}}
PZD7.la={make:laMake,neighbours:laNb,reply:laReply};
function mountLa(root,inst,api){var w=shell(root,'pd7-la'),N=inst.N,nb=laNb(N),b=inst.b.slice(),hist=[],steps=0,hints=0,fin=false,over=false,hl=-1,
  info=pzEl('p',{class:'pd7-info',text:'You link the top edge to the bottom edge with a chain of touching filled discs. The computer, with ringed crosses, links the left edge to the right edge. Each cell touches six others. Tap an empty cell to place a disc. A winning plan exists from the start.'}),
  prog=pzEl('p',{class:'pd7-prog'}),board=pzEl('div',{class:'pd7-map'}),msg=pzEl('p',{class:'pd7-msg',role:'status'}),
  vbW=1.5*N-.5,vbH=(N-1)*.866+1.1547,vx=-.55,vy=-.6,vw=vbW+1.1,vh=vbH+1.2,
  svg=sv('svg',{viewBox:vx+' '+vy+' '+r2(vw)+' '+r2(vh),'aria-hidden':'true',focusable:'false'}),btns=[];
  board.style.paddingTop=r2(vh/vw*100)+'%';board.appendChild(svg);
  function X(i){return Math.floor(i/N)/2+i%N+.5}function Y(i){return .5774+Math.floor(i/N)*.866}
  function hex(i,rad){var p=[];for(var k=0;k<6;k++){var a=(30+60*k)*Math.PI/180;p.push(r2(X(i)+rad*Math.cos(a))+' '+r2(Y(i)+rad*Math.sin(a)))}return'M'+p.join('L')+'Z'}
  function edge(x1,y1,x2,y2,dash){var at={d:'M'+r2(x1)+' '+r2(y1)+'L'+r2(x2)+' '+r2(y2),stroke:'var(--ink)','stroke-width':'.16',fill:'none','stroke-linecap':'round'};if(dash)at['stroke-dasharray']='.3 .3';svg.appendChild(sv('path',at))}
  edge(X(0)-.55,Y(0)-.66,X(N-1)+.55,Y(0)-.66);edge(X(N*(N-1))-.55,Y(N*N-1)+.66,X(N*N-1)+.55,Y(N*N-1)+.66);
  edge(X(0)-.62,Y(0)-.1,X(N*(N-1))-.62,Y(N*(N-1))+.1,1);edge(X(N-1)+.62,Y(N-1)-.1,X(N*N-1)+.62,Y(N*N-1)+.1,1);
  var gs=sv('g');svg.appendChild(gs);
  function say(t){say2(msg,api,t)}
  var i;for(i=0;i<N*N;i++)(function(i){var bt=pzBtn('',function(){play(i)},{class:'pd7-node','aria-label':'Row '+(Math.floor(i/N)+1)+', column '+(i%N+1)});
    bt.style.left=r2((X(i)-vx)/vw*100)+'%';bt.style.top=r2((Y(i)-vy)/vh*100)+'%';bt.appendChild(pzEl('span',{text:''}));bt.firstChild.style.border='0';bt.firstChild.style.background='transparent';btns.push(bt);board.appendChild(bt)})(i);
  function paint(){gs.textContent='';var e=0;for(var k=0;k<N*N;k++){gs.appendChild(sv('path',{d:hex(k,.55),fill:b[k]?'var(--surface)':'var(--tint)',stroke:'var(--ink)','stroke-width':'.07','stroke-linejoin':'round'}));
      if(b[k]===1)gs.appendChild(sv('circle',{cx:r2(X(k)),cy:r2(Y(k)),r:'.26',fill:'var(--ink)'}));
      if(b[k]===2){gs.appendChild(sv('circle',{cx:r2(X(k)),cy:r2(Y(k)),r:'.27',fill:'var(--surface)',stroke:'var(--ink)','stroke-width':'.08'}));
        gs.appendChild(sv('path',{d:'M'+r2(X(k)-.13)+' '+r2(Y(k)-.13)+'L'+r2(X(k)+.13)+' '+r2(Y(k)+.13)+'M'+r2(X(k)+.13)+' '+r2(Y(k)-.13)+'L'+r2(X(k)-.13)+' '+r2(Y(k)+.13),stroke:'var(--ink)','stroke-width':'.07','stroke-linecap':'round'}))}
      if(hl===k)gs.appendChild(sv('path',{d:hex(k,.62),fill:'none',stroke:'var(--ink)','stroke-width':'.1','stroke-dasharray':'.2 .15'}));
      if(!b[k])e++;
      var bt=btns[k],r=Math.floor(k/N)+1,c=k%N+1;bt.disabled=!!(b[k]||fin||over);
      bt.setAttribute('aria-label','Row '+r+', column '+c+', '+(b[k]===1?'your disc':b[k]===2?'computer cross':'empty')+(hl===k?', hint':''))}
    prog.textContent='Your discs: '+b.filter(function(x){return x===1}).length+'. Empty cells: '+e+'. Fewest moves needed: '+inst.par+'.'}
  function play(i){if(fin||over||b[i])return;hist.push(b.slice());b[i]=1;steps++;api.moved();hl=-1;
    if(laConn(N,b,1,nb)){fin=true;paint();say('Your chain links the top edge to the bottom edge. Solved.');api.done({solved:true,moves:steps,hints:hints,undos:0,extra:{par:inst.par,N:N}});return}
    var r=laReply(N,b,nb);if(r<0){paint();say('The board is full.');return}
    b[r]=2;
    if(laConn(N,b,2,nb)){over=true;paint();say('The computer linked left to right. Press Undo and try a different cell.');return}
    paint();say('Disc placed at row '+(Math.floor(i/N)+1)+', column '+(i%N+1)+'. The computer answered at row '+(Math.floor(r/N)+1)+', column '+(r%N+1)+'.')}
  w.appendChild(info);w.appendChild(prog);w.appendChild(board);w.appendChild(msg);paint();
  function winNow(){var e=laEmpt(b),k=laDist(N,b,nb,Math.ceil(e/2));return k?laWinning(N,b,k,nb):[]}
  var ctl;
  ctl={undo:function(){if(fin||!hist.length)return false;b=hist.pop();over=false;hl=-1;paint();say('Your last move and the reply were taken back.');return true},
    restart:function(){if(fin)return;b=inst.b.slice();hist=[];over=false;hl=-1;paint();say('Back to the starting position.')},moves:function(){return steps},
    hint:function(lv){if(fin)return null;hints++;var W=over?[]:winNow(),s;
      if(!W.length){if(lv<3){s='A winning plan is not visible from here. Press Undo to take a move back.';say(s);return s}
        if(hist.length){ctl.undo();return 'Your last move was taken back.'}s='Press Restart.';say(s);return s}
      var m=W[0];
      if(lv<=1){hl=-1;s='A winning move is in row '+(Math.floor(m/N)+1)+', counting from the top.'}
      else if(lv===2){hl=m;s='Try the marked cell.'}
      else{play(m);return msg.textContent}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}};
  return ctl}
registerPuzzle({id:'link-across',name:'Link Across',family:'grid',theme:'F9',blurb:'Join the top edge to the bottom edge before the computer joins left to right.',
  how:'You play filled discs and link the top edge to the bottom edge through touching cells. The computer plays crossed rings and links left to right. Each cell touches six others. A winning plan always exists.',
  areas:['space','control'],levels:30,secs:80,calm:true,make:laMake,mount:wrap(mountLa,'full'),
  stars:function(res,inst){var par=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0,s=pzStarsByPar(m,par,h);
    return{stars:s,line:'You linked across in '+plural(m,'move')+' with '+hintsLine(h)+'. The shortest forced win takes '+par+'.'}}});
})();
