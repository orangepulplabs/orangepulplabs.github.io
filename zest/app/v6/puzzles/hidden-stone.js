/* Zest v6 batch d: Hidden Stone. Overrides the puzzles_d5.js entry through ZK.override (the original stays in ZK.orig).
   Rule: an eye sits below the bottom row. A stone is SEEN unless another stone lies on the straight line between it and the eye. Place K stones so exactly V are seen.
   Kept: PZD5.hsSeen (the line of sight). Changed: a 30-level table of (board, K, hidden count) so every level needs occlusion (V < K, level 1 included) and the
   board grows 3x3, 4x4, 5x5 with breathers; the target is made from a real placement, so every level is solvable (inst.sol). The board draws the sight lines:
   a bright line from the eye to every stone it sees, a dashed line that stops at the blocker for a hidden stone (which goes dark and wears a slash).
   Pills: seen / target with an eye, and K stone pips. Press-free: tap an empty cell to place, tap a stone to lift it. */
(function(){
var ID='hidden-stone',SEEN=PZD5.hsSeen;
var NB=[3,3,3,3, 4,4,4,4,4,4,4,4,4,4, 5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5];
var K=[2,2,2,3, 3,3,4,3,4,4,5,4,5,5,6, 5,6,6,7,6,7,7,8,7,8,8,9,8,9,9];
var H=[1,1,1,1, 1,2,1,2,1,2,2,1,2,3,2, 3,2,3,3,3,3,4,3,4,3,4,4,4,4,5];
function gcd(a,b){return b?gcd(b,a%b):a}
function sight(n,eye,cells){var set={};cells.forEach(function(i){set[(i%n)+','+Math.floor(i/n)]=i});
  return cells.map(function(i){var x=i%n,y=Math.floor(i/n),dx=x-eye,dy=y+1,g=gcd(Math.abs(dx),dy),sx=dx/g,sy=dy/g;
    for(var j=1;j<g;j++){var b=set[(eye+j*sx)+','+(-1+j*sy)];if(b!==undefined)return{seen:false,by:b}}return{seen:true,by:-1}})}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var n=NB[level-1],k=K[level-1],h=H[level-1],all=[],i,t;for(i=0;i<n*n;i++)all.push(i);
  for(t=0;t<4000;t++){var eye=pzInt(rng,n),pick=pzShuffle(all,rng).slice(0,k).sort(function(a,b){return a-b}),sg=sight(n,eye,pick),hid=sg.filter(function(x){return !x.seen}).length;
    if(hid===h)return{level:level,title:'Level '+level,n:n,K:k,V:k-h,eye:eye,sol:pick,par:k}}
  var eye0=0,pk=all.slice(0,k);return{level:level,title:'Level '+level,n:n,K:k,V:SEEN(n,eye0,pk).filter(Boolean).length,eye:eye0,sol:pk,par:k}}
window.V6HS={make:make,sight:sight,NB:NB,K:K,H:H};

var CSS=''
+'.hs .hs-board{position:relative;width:100%;border-radius:26px;background:var(--dk-board);box-shadow:inset 0 3px 10px rgba(0,0,0,.14),0 1px 0 rgba(255,255,255,.4);padding:0}'
+'.hs .hs-board>svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'
+'.hs [data-zkc]{transform-box:fill-box;transform-origin:center}.hs .hs-in{transform-box:view-box;transform-origin:0 0}'
+'.hs .hs-pt{border-radius:14px;margin:0;transform:translate(-50%,-50%);z-index:2}';
var EYE='<svg viewBox="-14 -10 28 20" aria-hidden="true"><path d="M-12 0Q0 -12 12 0Q0 12 -12 0Z" fill="#fff" stroke="#3B3226" stroke-width="2"/><circle r="4.5" fill="#E8590C" stroke="#3B3226" stroke-width="1.5"/></svg>';
var S=60;
function stoneG(seen){var o=DK.sv('g'),g=DK.sv('g',{'class':'hs-in','data-zkc':''},o);
  if(seen){DK.sv('circle',{r:22,fill:'#F28C28',stroke:'#6B3200','stroke-width':3},g);DK.sv('path',{d:'M-9 0Q0 -8 9 0Q0 8 -9 0Z',fill:'#fff',stroke:'#6B3200','stroke-width':1.8},g);DK.sv('circle',{r:2.8,fill:'#6B3200'},g)}
  else{DK.sv('circle',{r:22,fill:'#3A4560',stroke:'#C9D2E6','stroke-width':2.5,'stroke-dasharray':'5 4'},g);DK.sv('path',{d:'M-9 0Q0 -8 9 0Q0 8 -9 0Z',fill:'none',stroke:'#C9D2E6','stroke-width':1.8},g);DK.sv('path',{d:'M-10 8L10 -8',stroke:'#C9D2E6','stroke-width':3,'stroke-linecap':'round'},g)}return o}
function mount(root,inst,api){ZK.css(DK.BASECSS+CSS,'hs-css');root.textContent='';
  var n=inst.n,K0=inst.K,V=inst.V,rm=ZK.rm(api),L=DK.life(),placed=[],hist=[],taps=0,hints=0,undos=0,fin=false,lastCell=-1,pvc=[],ghost=null,idle=null,prev={},i;
  var stage=DK.h('div','dk hs zk-stage zk-host'+(rm?' zk-rm':'')),top=DK.h('div','dk-top',null,null,stage);
  var ctr=ZK.counter({icon:EYE,zero:false,label:function(k){return k+' of '+V+' stones seen'}});var of=DK.h('span',null,'/ '+V);of.style.cssText='font-weight:700;opacity:.7;margin-left:-2px';ctr.el.appendChild(of);
  var pips=ZK.pips(K0);top.appendChild(ctr.el);
  var board=DK.h('div','hs-board zk-board',null,{role:'group','aria-label':'Board, '+n+' by '+n+', eye below'},stage),VW=n*S,VH=(n+1)*S;board.style.aspectRatio=VW+'/'+VH;board.style.maxWidth=Math.min(372,n*84)+'px';board.style.margin='0 auto';board.style.width='100%';
  var svg=DK.sv('svg',{viewBox:'0 0 '+VW+' '+VH,'aria-hidden':'true'},board),gC=DK.sv('g',null,svg),gLn=DK.sv('g',null,svg),gSt=DK.sv('g',null,svg),gEye=DK.sv('g',null,svg),btn=[];
  function cx(c){return(c%n+.5)*S}function cy(c){return(n-1-Math.floor(c/n)+.5)*S}
  var ex=(inst.eye+.5)*S,ey=n*S+S/2+2;
  for(i=0;i<n*n;i++)DK.sv('rect',{x:cx(i)-S/2+3,y:cy(i)-S/2+3,width:S-6,height:S-6,rx:12,fill:'var(--dk-tri,rgba(255,255,255,.35))',stroke:'var(--dk-line)','stroke-width':1.5,opacity:.8,'data-zkc':''},gC);
  var eg=DK.sv('g',{transform:'translate('+ex+' '+ey+')'},gEye);DK.sv('path',{d:'M-20 0Q0 -17 20 0Q0 17 -20 0Z',fill:'#fff',stroke:'var(--dk-ink)','stroke-width':3},eg);DK.sv('circle',{r:7,fill:'#E8590C',stroke:'var(--dk-ink)','stroke-width':2},eg);DK.sv('circle',{r:2.6,fill:'#1B1916'},eg);
  for(i=0;i<n*n;i++)(function(c){var b=DK.btn('Cell','dk-pt hs-pt');b.style.width=(100/n*.86)+'%';b.style.height=(100/(n+1)*.86)+'%';b.style.left=(cx(c)/VW*100)+'%';b.style.top=(cy(c)/VH*100)+'%';b.style.margin='0';b.onclick=function(){tap(c)};btn.push(b);board.appendChild(b)})(i);
  stage.appendChild(pips.el);root.appendChild(stage);
  function all(){return placed.concat(pvc.filter(function(c){return placed.indexOf(c)<0}))}
  function draw(popSet){gLn.textContent='';gSt.textContent='';var cells=all(),sg=sight(n,inst.eye,cells),el={};
    cells.forEach(function(c,k){var r=sg[k],isPv=placed.indexOf(c)<0,tx=r.seen?cx(c):cx(r.by),ty=r.seen?cy(c):cy(r.by);
      var ln=DK.sv('line',{x1:ex,y1:ey-8,x2:tx,y2:ty,stroke:r.seen?'#E9A23B':'var(--dk-line)','stroke-width':r.seen?4:2.5,'stroke-linecap':'round','stroke-dasharray':r.seen?'':'3 7',opacity:isPv?.5:r.seen?.9:.8},gLn);
      var g=stoneG(r.seen);g.style.transform='translate('+cx(c)+'px,'+cy(c)+'px)';if(isPv)g.setAttribute('opacity','.55');gSt.appendChild(g);el[c]=g;
      if(popSet&&popSet[c]&&!rm)ZK.anim(g.firstChild,[{transform:'scale(.5)',opacity:0},{transform:'scale(1.15)',opacity:1,offset:.6},{transform:'scale(1)',opacity:1}],280,ZK.SPRING)});
    var seenN=sg.filter(function(x){return x.seen}).length;
    placed.forEach(function(c,k){});return{el:el,seen:seenN,sg:sg,cells:cells}}
  function sync(pop,quiet){var r=draw(pop),seenReal=sight(n,inst.eye,placed).filter(function(x){return x.seen}).length;ctr.set(seenReal,quiet);pips.set(placed.length);
    for(var c=0;c<n*n;c++)btn[c].setAttribute('aria-label','Row '+(n-Math.floor(c/n))+', column '+(c%n+1)+', '+(placed.indexOf(c)>=0?'stone':'empty'));
    ZK.stuck(stage,false);
    if(!fin&&placed.length===K0&&seenReal!==V)ZK.stuck(stage,true,{text:seenReal+' seen, want '+V,onUndo:function(){ctl.undo()}});
    return seenReal}
  function D(ms){return rm?0:ms}
  function tap(c){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);pvc=[];
    var at=placed.indexOf(c);hist.push({placed:placed.slice(),taps:taps,last:lastCell});
    if(at>=0){placed=placed.filter(function(x){return x!==c});ZK.sfx('lift');ZK.buzz('tap')}
    else{if(placed.length>=K0){hist.pop();ZK.wrong(btn[c]);return}placed=placed.concat([c]);ZK.sfx('clack');ZK.buzz('move');lastCell=c}
    taps++;api.moved();var pop={};if(at<0)pop[c]=1;var seenN=sync(pop);
    if(placed.length===K0&&seenN===V){fin=true;api.say('Exactly '+V+' seen.');ZK.stuck(stage,false);ZK.sfx('cap');
      L.later(function(){api.done({solved:true,moves:taps,hints:hints,undos:undos,extra:{par:inst.par}})},D(300))}}
  var ctl={
    undo:function(){if(fin||!hist.length)return false;var h=hist.pop();placed=h.placed;taps=h.taps;lastCell=h.last;undos++;ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);sync();return true},
    restart:function(){if(fin)return;hist=[];placed=[];taps=0;lastCell=-1;ZK.sfx('undo');ZK.unmark(stage);sync()},
    hint:function(lv){if(fin)return null;hints++;ZK.unmark(stage);var wrong=placed.filter(function(c){return inst.sol.indexOf(c)<0}),need=inst.sol.filter(function(c){return placed.indexOf(c)<0});
      if(wrong.length&&lv>=2){if(lv===2){ZK.mark(btn[wrong[0]]);return 'Lift this stone.'}tap(wrong[0]);return 'Lifted one for you.'}
      if(lv<=1)return 'A stone hides when another sits right on its line to the eye.';
      if(!need.length)return 'Look at the lines.';
      if(lv===2){ZK.mark(btn[need[0]]);return 'A stone belongs here.'}
      tap(need[0]);return 'Placed one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();L.destroy();root.textContent=''},
    lastEl:function(){return lastCell>=0?btn[lastCell]:null},
    state:function(){return{placed:placed.slice(),taps:taps,fin:fin}}};
  sync(null,true);idle=ZK.idle(stage,25000);
  if(inst.level===1){var a=inst.sol[0],b=inst.sol[1];ghost=ZK.ghost(stage,[{tap:btn[a],down:function(){pvc=[a];draw()},hold:900},{tap:btn[b],down:function(){pvc=[a,b];draw()},hold:1100,cancel:function(){pvc=[];draw()}}],{id:ID,level:1})}
  return ctl}

ZK.override({id:ID,name:'Hidden Stone',family:'grid',theme:'F10',calm:true,
  blurb:'Place stones so exactly the target number can be seen from the eye.',
  how:'A stone is hidden when another sits between it and the eye. Show exactly the target number.',
  areas:['space','control'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var k=inst.K,m=res.moves,h=res.hints||0,s=m<=k+Math.ceil(k/3)?3:m<=2*k?2:1;if(h&&s===3)s=2;
    return{stars:s,line:'Exactly '+inst.V+' seen with '+k+' stones.'}}});
})();
