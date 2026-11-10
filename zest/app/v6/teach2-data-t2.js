/* teach2 rollout, group t2 (Docs/v6/teach2-rollout-brief.md, progress in Docs/v6/teach2-t2.md): Show me demos and level-1 guides for
   four-shades, scramble, word-steps, word-square, river-ferry, dodecahedron-tour, bridge-walk, dot-loop, seven-pieces.
   Same shape as teach2-data.js (format in the header of teach2.js). Each demo runs the puzzle's own code on a tiny board of its own, 3-6 s.
   Loaded after teach2-data.js (teach2-t2.html). */
(function(){
if(!window.ZT)return;var D=ZT.DEMO=ZT.DEMO||{};
function q(root,sel,i){return root.querySelectorAll(sel)[i||0]}
function qa(root,sel){return [].slice.call(root.querySelectorAll(sel))}
function union(els){var r=null;els.forEach(function(e){if(!e)return;var b=e.getBoundingClientRect();if(!r)r={left:b.left,top:b.top,right:b.right,bottom:b.bottom};else{r.left=Math.min(r.left,b.left);r.top=Math.min(r.top,b.top);r.right=Math.max(r.right,b.right);r.bottom=Math.max(r.bottom,b.bottom)}});return r}

/* ---- Four Shades: pick a colour, tap a region; touching regions must differ (the amber border shows a clash). ---- */
function fsInst(){var F=PZD7.fs,S=[[25,22],[75,22],[50,52],[22,84],[78,84]],W=100,H=106,P=F.vor(S,W,H),adj=F.adjOf(S,P,1.2);
  return {level:0,title:'',n:S.length,W:W,H:H,seeds:S,polys:P,adj:adj,locked:[0,1,-1,-1,-1],sol:[0,1,2,1,0],par:3,locks:2,deep:false}}
function fsPt(i){return function(r,inst){var m=r.querySelector('.fs-map');if(!m)return null;var b=m.getBoundingClientRect(),s=inst.seeds[i];return {x:b.left+s[0]/inst.W*b.width,y:b.top+s[1]/inst.H*b.height}}}
/* the colours on the board now, read from the region labels (the guide runs on the real board, outside the puzzle's closure) */
function fsCols(root,inst){var L='ABCD';return qa(root,'.fs-n').map(function(b,i){var m=/colour ([ABCD])/.exec(b.getAttribute('aria-label')||'');return m?L.indexOf(m[1]):-1})}
D['four-shades']={
  line:'Pick a colour, tap a region. Touching regions must differ.',
  end:'Colour every region. Neighbours never match.',
  inst:fsInst,
  steps:[
    {tap:function(r){return q(r,'.fs-sw',2)},say:'Pick a colour, then tap a region.',hold:450},
    {tap:fsPt(2),hold:250},
    {tap:fsPt(3),say:'Touching regions can’t match.',hold:1100},
    {tap:function(r){return q(r,'.fs-sw',1)},say:'Try another colour.',hold:60},
    {tap:fsPt(3),hold:700}],
  /* level 1: the region with the fewest colours left; the puzzle has already picked its colour */
  guide:function(root,inst,k){if(k>1)return null;var col=fsCols(root,inst),best=-1,bc=9;
    for(var i=0;i<inst.n;i++)if(col[i]<0){var m=[1,1,1,1];inst.adj[i].forEach(function(j){if(col[j]>=0)m[col[j]]=0});var c=m[0]+m[1]+m[2]+m[3];if(c<bc){bc=c;best=i}}
    if(best<0)return null;var L='ABCD'[inst.sol[best]],node=root.querySelector('.fs-svg path[data-r="'+best+'"]'),sw=qa(root,'.fs-sw')[inst.sol[best]],on=sw&&sw.classList.contains('on');
    return {tap:fsPt(best),light:node,pad:2,say:on?(k===0?'Its neighbours leave only colour '+L+'. Tap this region.':'Next, this one can only be '+L+'. Tap it.'):'Its neighbours leave only '+L+'. Pick '+L+' below, then tap here.'}}};
/* ---- Scramble: tap the jumbled letters in order; a real word turns green. ---- */
function scTile(ch){return function(r){return r.querySelector('.sc-t[data-ch="'+ch+'"]:not(.in)')}}
D['scramble']={
  line:'Tap the letters in order to spell a real word.',
  end:'Spell every word to finish.',
  inst:function(){return {level:0,title:'',len:4,words:[{w:'frog',s:'gorf'}],par:4,parExact:true}},
  steps:[
    {wait:500,say:'G O R F: which word hides here?'},
    {tap:scTile('f'),say:'Tap the letters in order.',hold:80},{tap:scTile('r'),hold:80},{tap:scTile('o'),hold:80},
    {tap:scTile('g'),say:'FROG: a real word, so it turns green.',hold:1200}],
  /* level 1: light the first letter of the answer (the old ghost hand showed the first two) */
  guide:function(root,inst,k){if(k>0||!inst.words||!inst.words[0])return null;var t=root.querySelector('.sc-t[data-ch="'+inst.words[0].w.charAt(0)+'"]:not(.in)');
    return t?{tap:t,say:'Tap the letters in word order. This one comes first.'}:null}};
/* ---- Word Steps: tap a letter, pick a new one; every step is a real word, toward the flag word. ---- */
function wsStep(inst){var p=V6C['word-steps'].path(inst),a=p[0],b=p[1],k=0;while(a.charAt(k)===b.charAt(k))k++;return {k:k,c:b.charAt(k)}}
D['word-steps']={
  line:'Tap a letter, pick a new one. Every step is a real word.',
  end:'Reach the flag word in as few steps as you can.',
  inst:function(){return {level:0,title:'',len:3,start:'dig',goal:'dot',par:2,parExact:true,gap:0}},
  steps:[
    {wait:500,say:'Change DIG into the flag word, DOT.'},
    {tap:'.ws-cur [data-p="1"]',say:'Tap a letter to change it.',hold:650},
    {tap:'.ws-tray [data-c="o"]',say:'Pick a new letter. DOG is a real word.',hold:500},
    {tap:'.ws-cur [data-p="2"]',say:'One letter per step.',hold:600},
    {tap:'.ws-tray [data-c="t"]',say:'DOT: you reached the flag word.',hold:1100}],
  /* level 1: the first step of the shortest path: the letter, then its new letter in the tray */
  guide:function(root,inst,k){if(k>1)return null;var st=wsStep(inst);
    if(k===0)return {tap:'.ws-cur [data-p="'+st.k+'"]',say:'Tap this letter to change it.'};
    var b=root.querySelector('.ws-tray [data-c="'+st.c+'"]');return b?{tap:b,say:'Now pick '+st.c.toUpperCase()+'. Every step must be a real word.'}:null}};
/* ---- Word Square: move rows until each row reads the same as its column; matching tiles turn green. ---- */
function sqRow(i){return function(r){return r.querySelector('.sq-r[data-pos="'+i+'"]')}}
D['word-square']={
  line:'Drag rows into place. Each row must read like its column.',
  end:'Make every tile green: rows match columns.',
  inst:function(){var a=['cat','ape','ten'],rows=['ape','cat','ten'];return {level:0,title:'',n:3,rows:rows,answer:a,parts:[{n:3,rows:rows,answer:a,par:1,swaps:1}],par:1,parExact:true}},
  steps:[
    {mark:sqRow(1),say:'Row 1 should read the same as column 1.',hold:1300},
    {drag:[sqRow(1),sqRow(0)],ms:700,say:'Drag a row to its place.',hold:200},
    {wait:1300,say:'All green: every row matches its column.'}],
  /* level 1: the first move of the shortest plan, as a drag from the row to its slot */
  guide:function(root,inst,k){if(k>0)return null;var mp=V6C['word-square'].movesPlan(inst.parts[0].rows)[0];if(!mp)return null;
    return {light:sqRow(mp[0])(root),drag:[sqRow(mp[0]),sqRow(mp[1])],say:'Drag this row to row '+(mp[1]+1)+'. Then it reads the same down column '+(mp[1]+1)+'.'}}};
/* ---- River Ferry: tap a passenger, then the boat; the boat refuses to leave a biting pair alone. ---- */
function rfIt(i){return function(r){return r.querySelectorAll('.rf-it')[i]}}
D['river-ferry']={
  line:'Tap a passenger, then the boat. Never leave a biting pair alone.',
  end:'Get everyone across. The chips on top show who bites whom.',
  inst:function(){return {level:0,title:'',par:7,n:3,names:['wolf','goat','cabbage'],bad:[[0,1],[1,2]]}},
  steps:[
    {mark:'.rf-rules',say:'These pairs bite if left alone.',hold:1100},
    {tap:rfIt(0),say:'Tap a passenger, then the boat.',hold:100},
    {tap:'.rf-boat',hold:200},
    {wait:1600,say:'Not safe: the goat would eat the cabbage.'},
    {tap:rfIt(1),say:'Take the goat instead.',hold:100},
    {tap:'.rf-boat',hold:900}],
  /* level 1: the first crossing of the shortest plan */
  guide:function(root,inst,k){if(k>1)return null;var p=PZD4.rfPath(inst.n,inst.bad,0,0),it=p&&p[0]?p[0].item:-1;
    if(k===0&&it>=0)return {tap:rfIt(it),say:'Tap the '+inst.names[it]+' to put it in the boat.'};
    return {tap:'.rf-boat',say:'Now tap the boat to sail.'}}};
/* ---- Dodecahedron Tour: hop along the lines, light every corner once, come back to the start. ---- */
var DT={level:0,title:'',shape:'house',n:5,edges:[[4,0],[4,1],[0,1],[1,2],[2,3],[3,0]],pos:[[22,42],[78,42],[78,88],[22,88],[50,10]],H:100,start:-1,cycle:[4,1,2,3,0],par:5};
function dtV(i){return function(r){return r.querySelectorAll('.dt-v')[i]}}
/* the route so far, read from the corner labels ('step k'), and the next corner of a loop that still works */
function dtNext(root,inst){var D=PZC3.dt,adj=D.adj(inst.n,inst.edges),path=[];qa(root,'.dt-v').forEach(function(b,i){var m=/step (\d+)/.exec(b.getAttribute('aria-label')||'');if(m)path[+m[1]-1]=i});
  path=path.filter(function(x){return x!=null});var c=D.complete(adj,inst.n,path.length?path:[0]);if(!c)return null;return {path:path,next:path.length?(path.length<inst.n?c[path.length]:path[0]):c[0]}}
D['dodecahedron-tour']={
  line:'Hop along the lines. Light every corner once, then return.',
  end:'Light every corner once and finish where you began.',
  inst:function(){return JSON.parse(JSON.stringify(DT))},
  steps:[
    {tap:dtV(4),say:'Tap a corner to start.',hold:300},
    {tap:dtV(1),say:'Hop along the lines. Each corner once.',hold:60},{tap:dtV(2),hold:60},{tap:dtV(3),hold:60},{tap:dtV(0),hold:300},
    {tap:dtV(4),say:'Then back to the start: a loop.',hold:1000}],
  /* Reel levels from the prisms on give the start corner */
  by:function(inst){return inst.start>=0?'start':null},
  alt:{start:{line:'Start at the lit corner. Hop along lines, each corner once, then back.',
    inst:function(){var o=JSON.parse(JSON.stringify(DT));o.start=4;return o},
    steps:[
      {mark:dtV(4),say:'You start at the lit corner.',hold:900},
      {tap:dtV(1),say:'Hop along the lines. Each corner once.',hold:60},{tap:dtV(2),hold:60},{tap:dtV(3),hold:60},{tap:dtV(0),hold:300},
      {tap:dtV(4),say:'Then back to the start: a loop.',hold:1000}]}},
  guide:function(root,inst,k){if(k>1)return null;var nx=dtNext(root,inst);if(!nx||nx.next==null)return null;var b=dtV(nx.next)(root);
    return {tap:b,pad:10,say:nx.path.length?'Hop along a line to this corner.':'Tap any corner to start. This one works.'}}};
/* ---- Bridge Walk: walk over every bridge exactly once (tap the next island). Variants: two odd islands (start on one), and a map that can't be walked (flag, mark the odd islands). ---- */
function bwI(i){return function(r){return r.querySelectorAll('.bw-isl')[i]}}
function bwInst(n,E,pos,o){var deg=[];for(var v=0;v<n;v++)deg.push(0);E.forEach(function(e){deg[e[0]]++;deg[e[1]]++});var odd=deg.filter(function(x){return x%2}).length;
  var r={level:0,title:'',n:n,edges:E,pos:pos,par:o.imp?1:E.length,impossible:!!o.imp,odd:odd,trail:o.trail||null};return r}
D['bridge-walk']={
  line:'Tap islands to walk. Cross every bridge exactly once.',
  end:'Cross every bridge once. Stuck? Undo and try another way.',
  inst:function(){return bwInst(3,[[0,1],[1,2],[2,0]],[[22,26],[78,26],[50,78]],{trail:[0,1,2,0]})},
  steps:[
    {tap:bwI(0),say:'Tap an island to start there.',hold:250},
    {tap:bwI(1),say:'Tap the next island to cross a bridge.',hold:200},{tap:bwI(2),say:'Each bridge only once.',hold:200},{tap:bwI(0),hold:900}],
  by:function(inst){return inst.impossible?'imp':inst.odd===2?'odd':null},
  alt:{
    /* two islands with an odd number of bridges: a full walk must start on one of them (most Reel cards) */
    odd:{line:'Cross every bridge once. Start on an island with an odd number of bridges.',
      inst:function(){return bwInst(4,[[0,1],[1,2],[2,0],[0,3]],[[50,22],[84,72],[16,72],[50,58]],{trail:[3,0,1,2,0]})},
      steps:[
        {mark:bwI(3),say:'This island has 1 bridge: an odd number. Start on it.',hold:1200},
        {tap:bwI(3),hold:150},{tap:bwI(0),say:'Tap the next island to cross. Each bridge once.',hold:120},{tap:bwI(1),hold:120},{tap:bwI(2),hold:120},{tap:bwI(0),say:'Every bridge crossed.',hold:900}]},
    /* some maps can't be walked: flag it, then mark every island with an odd number of bridges */
    imp:{line:'No way to cross each bridge once? Tap the flag, then mark the odd islands.',end:'Walk every bridge once, or prove it can’t be done.',
      inst:function(){return bwInst(4,[[3,0],[3,1],[3,2]],[[50,16],[84,80],[16,80],[50,56]],{imp:true})},
      steps:[
        {tap:'.bw-flag',say:'Can’t be done? Tap the flag.',hold:500},
        {tap:bwI(0),say:'Then mark each island with an odd number of bridges.',hold:150},{tap:bwI(1),hold:150},{tap:bwI(2),hold:150},{tap:bwI(3),hold:400},
        {wait:900,say:'More than two odd islands: no walk exists.'}]}},
  /* level 1: start where the walk starts, then the first crossing */
  guide:function(root,inst,k){if(k>1||inst.impossible||!inst.trail)return null;var b=bwI(inst.trail[k])(root);
    var dg=0;inst.edges.forEach(function(e){if(e[0]===inst.trail[k]||e[1]===inst.trail[k])dg++});
    return b?{tap:b,pad:8,say:k===0?(dg%2?'It has '+dg+' bridges, an odd number. Start your walk here.':'Tap this island to start your walk here.'):'Tap this island to cross the bridge to it.'}:null}};
/* ---- Dot Loop: drag one closed wire along the grid lines; filled dots inside, rings outside, as short as you can. ---- */
function dlV(v){return function(r){return r.querySelectorAll('.dl-vx')[v]}}
D['dot-loop']={
  line:'Drag one closed loop along the lines. Dots inside, rings outside.',
  end:'Close the loop around every dot, rings outside, as short as you can.',
  inst:function(){return {level:0,title:'',R:2,C:3,dots:[0,3],hollows:[1],loop:[0,1,5,9,8,4],par:6,turns:4}},
  steps:[
    {wait:900,say:'Filled dots go inside the loop. Rings stay outside.'},
    {drag:[dlV(0),dlV(1)],ms:380,say:'Drag along the lines, corner to corner.',hold:0},
    {drag:[dlV(1),dlV(9)],ms:520,hold:0},{drag:[dlV(9),dlV(8)],ms:380,hold:0},
    {drag:[dlV(8),dlV(0)],ms:520,say:'Back to the start closes the loop.',hold:1100}],
  /* level 1: the first one or two pieces of the shortest loop; the second only if the wire is on that loop */
  guide:function(root,inst,k){var Lp=inst.loop;if(!Lp||k>1)return null;
    if(k===1){var end=-1;qa(root,'.dl-vx').forEach(function(b,i){if(/end of your wire/.test(b.getAttribute('aria-label')||''))end=i});if(end!==Lp[1])return null}
    var c=dlV(Lp[k])(root).getBoundingClientRect(),x=c.left+c.width/2,y=c.top+c.height/2;
    return {box:function(){return {left:x-15,top:y-15,right:x+15,bottom:y+15}},drag:[dlV(Lp[k]),dlV(Lp[k+1])],pad:2,above:(function(){var g=root.querySelector('.dl-grid').getBoundingClientRect();return y>g.top+g.height/2})(),say:k===0?'Drag along the lines from here.':'Keep going, around the dots.'}}};
/* ---- Seven Pieces: drag a piece onto the outline; it turns to fit by itself. The piece rides 70 px above the finger, as in the game. ---- */
/* the client point of a placement's centre, with the board's own letter-box geometry (seven-pieces.js geo/toU) */
function tgPt(root,inst,pl,ix,dy){var T=PZD8.tg,TP=T.pieces,svg=root.querySelector('.tg-svg');if(!svg)return null;var minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;
  inst.sol.forEach(function(p,i){var s=T.shape(TP[i].t,p.o);minx=Math.min(minx,p.x);miny=Math.min(miny,p.y);maxx=Math.max(maxx,p.x+s.w);maxy=Math.max(maxy,p.y+s.h)});
  var VX=minx-.5,VY=miny-.5,VW=maxx-minx+1,VH=maxy-miny+1,r=svg.getBoundingClientRect(),k=Math.min(r.width/VW,r.height/VH),ox=(r.width-VW*k)/2,oy=(r.height-VH*k)/2;
  var v=T.shape(TP[ix].t,pl.o).v,cx=0,cy=0;v.forEach(function(q){cx+=q[0]+pl.x;cy+=q[1]+pl.y});cx/=v.length;cy/=v.length;
  return {x:r.left+ox+(cx-VX)*k,y:r.top+oy+(cy-VY)*k+(dy||0)}}
function tgTile(ix){return function(r){return r.querySelector('.tg-tile[data-ix="'+ix+'"]')}}
var TGI=null;function tgInst(){if(!TGI){TGI=PZD8.tg.make(4,pzRng('t2-demo-tg'));TGI.fixed=[1,2,3,4,5];TGI.par=2;TGI.level=0;TGI.title=''}return JSON.parse(JSON.stringify(TGI))}
D['seven-pieces']={
  line:'Drag each piece onto the outline. It turns to fit by itself.',
  end:'Fill the whole outline with all seven pieces.',
  inst:tgInst,
  steps:[
    {wait:700,say:'Fill the outline with the pieces.'},
    {drag:[tgTile(0),function(r,inst){return tgPt(r,inst,inst.sol[0],0,70)}],ms:700,say:'Drag a piece onto the outline.',hold:1100},
    {drag:[tgTile(6),function(r,inst){return tgPt(r,inst,inst.sol[6],6,70)}],ms:700,say:'It turns to fit where you drop it.',hold:1100}],
  /* level 1: a piece of a solution, dragged to its spot (the path ends where the piece will sit) */
  guide:function(root,inst,k){if(k>0)return null;var T=PZD8.tg,occ={},done=[],sil;try{sil=Object.keys(T.sil(inst.sol)).map(Number)}catch(e){return null}
    for(var i=0;i<7;i++){done.push(inst.fixed.indexOf(i)>=0);if(done[i])T.quarters(inst.sol[i],i).forEach(function(q){occ[q]=1})}
    var r=T.solve(sil,occ,done,150000);if(!r||!r.length)return null;var p0=r[0],tl=tgTile(p0.i)(root);if(!tl)return null;
    return {light:tl,drag:[tl,function(rt){return tgPt(rt,inst,p0,p0.i,0)}],say:'Drag this piece onto the outline. It turns to fit.',above:true}}};
})();
