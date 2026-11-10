/* Zest v6: Odd One Out (impossible weaving frames). Overrides puzzles_d7.js through ZK.override; the generator (PZD7.oo.make), par (one tap per round) and the frame art come from the original.
   Rule: every frame is a ring of flat strips; at each corner one strip lies over the other. Exactly one frame is IMPOSSIBLE (each strip over the one before it all the way round,
   or each under), so it can never be stacked. Tap it.
   Board: 3 to 5 frames. A wrong tap does not say "wrong": it WALKS the proof. The numbers 1..n pop onto that frame's strips one after another in a valid stacking order
   (top to bottom), which shows it can be built, and the frame fades. A right tap runs the loop: the strips light up in turn round the ring, each over the next, and come back to the start.
   Rounds per level rise 3 to 7 (frames 3 to 5 from level 11). par = one tap per round.
   Aha: the one frame whose corners all turn the same way. A hint plays the numbering walk on a possible frame (no move cost), then fades a possible frame, then taps the odd one. */
(function(){
var ID='odd-one-out',CC=window.V6C,D=window.PZD7;
var NS='http://www.w3.org/2000/svg';
function sv(tag,at){var e=document.createElementNS(NS,tag);for(var k in at)e.setAttribute(k,at[k]);return e}
function r1(x){return Math.round(x*10)/10}
function order(n,bits){/* top-first stacking order of strips for an acyclic frame, or null */
  var adj=[],ind=[],i,j;for(i=0;i<n;i++){adj.push([]);ind.push(0)}
  for(j=0;j<n;j++){var a=(j+n-1)%n,o=bits[j]?j:a,u=bits[j]?a:j;adj[o].push(u);ind[u]++}
  var q=[],ord=[];for(i=0;i<n;i++)if(!ind[i])q.push(i);
  while(q.length){var x=q.shift();ord.push(x);adj[x].forEach(function(y){if(--ind[y]===0)q.push(y)})}
  return ord.length===n?ord:null}
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
/* own curve: frames 3 (to level 10), 4 (to 20), 5; strips 3-4, 3-5 from level 7, 3-6 from level 15; decoys differ by many corners early and by ONE corner from level 11; mono from level 16;
   every 5th level is a breather (small rings, colour on, decoys easier) */
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var br=level%5===0,rounds=3+Math.floor((level-1)/6),k=level<=10?3:level<=20?4:5,ns=level<=6?[3,4]:level<=14?[3,4,5]:[3,4,5,6];
  if(br)ns=[3,4];var R=[],i,f,j;
  for(i=0;i<rounds;i++){var n=ns[pzInt(rng,ns.length)],odd=pzInt(rng,k),figs=[];
    for(f=0;f<k;f++){var v=pzInt(rng,2),bits=[];for(j=0;j<n;j++)bits.push(v);
      if(f!==odd){var fl=(level<=10||br)?1+pzInt(rng,Math.max(1,Math.floor(n/2))):1,pos=pzShuffle(seq(n),rng);fl=Math.min(fl,n-1);for(j=0;j<fl;j++)bits[pos[j]]=1-v}
      figs.push({bits:bits,rot:pzInt(rng,360),mir:pzInt(rng,2)})}
    R.push({n:n,odd:odd,figs:figs})}
  return{title:'Level '+level,level:level,rounds:R,k:k,par:rounds,parExact:true,mono:level>=16&&!br}}
function plan(inst){var out=[];inst.rounds.forEach(function(r,ri){if(ri)out.push({wait:1.2});out.push('.oo-f[data-odd="1"]')});return out}
CC[ID]={make:make,plan:plan,order:order,acyclic:function(n,b){return D.oo.acyclic(n,b)}};
/* the frame: strips round a ring, painted in order, then the strips that must be on top redrawn near their corner (same drawing rule as the original) */
function fig(n,bits,rot,mir,mono){var svg=sv('svg',{viewBox:'0 0 100 100','aria-hidden':'true',focusable:'false'}),g=sv('g',mir?{transform:'translate(100 0) scale(-1 1)'}:{}),V=[],i,t=n>=6?7:8.5,e=t*.75,Rr=33,tones=['var(--tint)','var(--surface)','var(--accent)'],mids=[];
  svg.appendChild(g);
  for(i=0;i<n;i++){var a=(rot+360*i/n-90)*Math.PI/180;V.push([50+Rr*Math.cos(a),50+Rr*Math.sin(a)])}
  function tone(k){return mono?'var(--surface)':(n%2&&k===n-1)?tones[2]:tones[k%2]}
  function geo(k){var A=V[k],Bp=V[(k+1)%n],dx=Bp[0]-A[0],dy=Bp[1]-A[1],L=Math.sqrt(dx*dx+dy*dy),ux=dx/L,uy=dy/L,nx=-uy*t/2,ny=ux*t/2;
    return{pt:function(s,side){var x=A[0]+ux*s,y=A[1]+uy*s;return side?[x+nx,y+ny]:[x-nx,y-ny]},L:L}}
  function P(p){return r1(p[0])+' '+r1(p[1])}
  var strips=[];
  function strip(k){var q=geo(k),a=q.pt(-e,0),b=q.pt(-e,1),c=q.pt(q.L+e,1),d=q.pt(q.L+e,0);
    var p=sv('path',{d:'M'+P(a)+'L'+P(b)+'L'+P(c)+'L'+P(d)+'Z',fill:tone(k),stroke:'var(--ink)','stroke-width':'1.3','stroke-linejoin':'round','data-k':k});strips.push(p);g.appendChild(p);var m=q.pt(q.L/2,0);mids.push([m[0]+(q.pt(q.L/2,1)[0]-m[0])/2,m[1]+(q.pt(q.L/2,1)[1]-m[1])/2])}
  function piece(k,start){var q=geo(k),ln=e+t*1.5,s0=start?-e:q.L-ln+e,s1=start?ln-e:q.L+e,a=q.pt(s0,0),b=q.pt(s0,1),c=q.pt(s1,1),d=q.pt(s1,0);
    g.appendChild(sv('path',{d:'M'+P(a)+'L'+P(b)+'L'+P(c)+'L'+P(d)+'Z',fill:tone(k)}));
    var open=start?[q.pt(ln-e,0),q.pt(-e,0),q.pt(-e,1),q.pt(ln-e,1)]:[q.pt(q.L-ln+e,0),q.pt(q.L+e,0),q.pt(q.L+e,1),q.pt(q.L-ln+e,1)];
    g.appendChild(sv('path',{d:'M'+P(open[0])+'L'+P(open[1])+'L'+P(open[2])+'L'+P(open[3]),fill:'none',stroke:'var(--ink)','stroke-width':'1.3','stroke-linejoin':'round'}))}
  for(i=0;i<n;i++)strip(i);
  for(var j=0;j<n;j++){var a2=(j+n-1)%n,def=j===0?a2:j,req=bits[j]?j:a2;if(req!==def){if(req===j)piece(j,true);else piece(a2,false)}}
  /* number labels (hidden until a walk), in the un-mirrored frame so they stay readable: placed in a separate layer that mirrors the positions */
  var lab=sv('g',{});svg.appendChild(lab);var labels=[];
  mids.forEach(function(m,k){var x=mir?100-m[0]:m[0];var c=sv('circle',{cx:r1(x),cy:r1(m[1]),r:7.4,fill:'var(--ink)',opacity:0}),tx=sv('text',{x:r1(x),y:r1(m[1]+3.1),'text-anchor':'middle','font-size':9.5,'font-weight':800,fill:'var(--surface)',opacity:0,'font-family':'inherit'});lab.appendChild(c);lab.appendChild(tx);labels.push([c,tx])});
  svg._strips=strips;svg._labels=labels;return svg}
var CSS=''
+'.oo{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font)}'
+'.oo-grid{display:grid;gap:10px;width:100%;justify-content:center}'
+'.oo-f{all:unset;box-sizing:border-box;position:relative;aspect-ratio:1;border-radius:20px;background:var(--surface);box-shadow:0 0 0 2px var(--edge),0 5px 0 var(--edge);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:6px;-webkit-tap-highlight-color:transparent;transition:opacity .3s,scale .18s '+ZK.SPRING+'}'
+'.oo-f svg{width:100%;height:100%;display:block}.oo-f:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'.oo-f.can{opacity:.62}.oo-f.odd{background:var(--ok-bg,#ddefe2);box-shadow:0 0 0 3px var(--ok-ink,#14532d),0 5px 0 var(--ok-ink,#14532d)}'
+'.oo-f[disabled]{pointer-events:none}'
+'.oo-f path.lit{fill:var(--accent)!important}'
+'.zk-rm .oo-f{transition:none}@media (prefers-reduced-motion:reduce){.oo-f{transition:none}}';
function mount(root,inst,api){CC.css();ZK.css(CSS,'oo-css');
  var rm=ZK.rm(api),ri=0,R=inst.rounds[0],steps=0,hints=0,undos=0,fin=false,locked=false,last=null,ghost=null,idle=null,wrong={},fb=[],stage=CC.stage(root,'oo',api),grid=CC.el('div','oo-grid zk-board'),pips=ZK.pips(inst.par),base=0,timers=[];
  stage.appendChild(grid);pips.el.className+=' oo-pips';stage.appendChild(pips.el);
  function T(fn,ms){var t=setTimeout(fn,ms);timers.push(t)}
  function build(){R=inst.rounds[ri];wrong={};fb=[];grid.textContent='';var k=R.figs.length;grid.style.gridTemplateColumns='repeat('+(k===3?3:2)+',minmax(0,'+(k===3?118:150)+'px))';
    R.figs.forEach(function(fg,f){var b=CC.btn('oo-f','Frame '+(f+1)+', '+R.n+' strips',function(){tap(f)});b.setAttribute('data-f',f);b.setAttribute('data-odd',f===R.odd?'1':'0');b.setAttribute('data-zkc','');b.appendChild(fig(R.n,fg.bits,fg.rot,fg.mir,inst.mono));fb.push(b);grid.appendChild(b);
      ZK.anim(b,[{transform:'scale(.85)',opacity:0},{transform:'none',opacity:1}],240,ZK.SPRING,f*60)})}
  /* the numbering walk on a buildable frame: 1 (top) to n (bottom) */
  function walk(f,done){var fg=R.figs[f],svg=fb[f].querySelector('svg'),ord=order(R.n,fg.bits),st=0;if(!ord){if(done)done();return}
    ord.forEach(function(sk,idx){T(function(){var l=svg._labels[sk];l[0].setAttribute('opacity',1);l[1].setAttribute('opacity',1);l[1].textContent=String(idx+1);ZK.sfx('click',{p:idx*2});if(!rm)ZK.anim(l[0],[{transform:'scale(.2)'},{transform:'scale(1)'}],220,ZK.SPRING)},rm?idx*60:idx*260)});
    T(function(){if(done)done()},(rm?ord.length*60:ord.length*260)+250)}
  function loop(f,done){var svg=fb[f].querySelector('svg'),n=R.n,rounds=n+2,sp=Math.min(150,Math.floor(720/rounds));
    for(var s=0;s<rounds;s++)(function(s){T(function(){var all=svg._strips;all.forEach(function(p){p.classList.remove('lit')});all[s%n].classList.add('lit');ZK.sfx('click',{p:(s%n)*2+4})},rm?s*40:s*sp)})(s);
    T(function(){svg._strips.forEach(function(p){p.classList.remove('lit')});if(done)done()},(rm?rounds*40:rounds*sp)+200)}
  function tap(f){if(fin||locked||wrong[f])return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);steps++;api.moved();last=fb[f];
    if(f===R.odd){locked=true;fb[f].classList.add('odd');ZK.sfx('cap',{n:ri});ZK.buzz('cap');pips.set(base+1);
      var lastR=ri===inst.rounds.length-1;if(lastR){fin=true;T(function(){api.say('That frame cannot be built.');api.done({solved:true,moves:steps,hints:hints,undos:undos,extra:{par:inst.par,rounds:inst.rounds.length}})},rm?0:420)}   /* the win lands while the loop is still lighting (Next under 1 s) */
      loop(f,function(){if(lastR){}
        else{base++;ri++;locked=false;build()}})}
    else{wrong[f]=true;fb[f].disabled=true;ZK.sfx('soft');ZK.buzz('soft');locked=true;walk(f,function(){fb[f].classList.add('can');locked=false})}}
  stage.addEventListener('keydown',function(e){var k=parseInt(e.key,10);if(k>=1&&k<=R.figs.length)tap(k-1)});
  build();
  if(inst.level===1){ghost=ZK.ghost(stage,[{tap:{getBoundingClientRect:function(){return fb[R.odd].getBoundingClientRect()}},hold:900}],{id:ID,level:1,delay:1000})}
  idle=ZK.idle(stage,22000);
  return{
    undo:function(){return false},
    restart:function(){if(fin)return;timers.forEach(clearTimeout);timers=[];locked=false;ri=0;base=0;steps=0;pips.set(0);build();ZK.sfx('undo')},
    hint:function(lv){if(fin||locked)return null;hints++;ZK.unmark(stage);var cand=R.figs.map(function(x,f){return f}).filter(function(f){return f!==R.odd&&!wrong[f]});
      if(lv<=1){if(cand.length){locked=true;var f=cand[0];wrong[f]=true;fb[f].disabled=true;walk(f,function(){fb[f].classList.add('can');locked=false})}return 'Watch the numbers: a frame that can be stacked has a top-to-bottom order.'}
      if(lv===2){if(cand.length>1){var g=cand[0];wrong[g]=true;fb[g].disabled=true;fb[g].classList.add('can')}return 'Another one can be stacked. It is faded.'}
      tap(R.odd);return 'This is the one.'},
    destroy:function(){timers.forEach(clearTimeout);if(ghost)ghost.stop();if(idle)idle.stop();root.textContent=''},
    lastEl:function(){return last},state:function(){return{round:ri,steps:steps,fin:fin}}}}
ZK.override({id:ID,name:'Odd One Out',family:'grid',theme:'F1',undo:false,calm:true,blurb:'Spot the frame that could not be built from real strips.',
  how:'Tap the frame that cannot be stacked. Wrong taps show you why.',areas:['attention','space'],levels:30,secs:60,make:make,mount:mount,
  stars:function(res,inst){return{stars:pzStarsByPar(res.moves,inst.par,res.hints),line:CC.pl(inst.par,'odd frame')+' found in '+CC.pl(res.moves,'tap')+'.'}}});
})();
