/* Zest v6 batch d: Link Across. Overrides the puzzles_d7.js entry through ZK.override (the original stays in ZK.orig).
   Rule (Hex on a small rhombus): you place orange discs and link the TOP edge to the BOTTOM edge through touching cells; the computer places navy diamonds and links LEFT to RIGHT.
   Kept: the position generator idea (a drawn path with gaps), the exact solver (fewest of your moves that force a win) and the computer's reply, copied from puzzles_d7.js.
   Changed: coloured edges (orange top and bottom, navy left and right) so the goal is on the board; two race pills (cells you still need, cells they still need); a 30-level
   schedule (3x3 for 1-3, 4x4 to 14, 5x5 after; forced win in 1, then 2, then 3 moves, with breathers) instead of 9 levels of par 1; the computer answers after a short beat; the winning chain lights up
   cell by cell; a 'they linked' / 'no forced win left' chip with Undo is the stuck signal. */
(function(){
var ID='link-across';
var D=[[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,-1]],NBC={};
function nbs(N){if(NBC[N])return NBC[N];var nb=[];for(var r=0;r<N;r++)for(var c=0;c<N;c++){var l=[];D.forEach(function(d){var rr=r+d[0],cc=c+d[1];if(rr>=0&&rr<N&&cc>=0&&cc<N)l.push(rr*N+cc)});nb.push(l)}return NBC[N]=nb}
function conn(N,b,who,nb){var seen=[],q=[],i;for(i=0;i<N;i++){var s=who===1?i:i*N;if(b[s]===who){seen[s]=1;q.push(s)}}
  while(q.length){var x=q.pop();if(who===1?x>=N*(N-1):x%N===N-1)return true;nb[x].forEach(function(y){if(b[y]===who&&!seen[y]){seen[y]=1;q.push(y)}})}return false}
function chain(N,b,nb){var prev={},q=[],i;for(i=0;i<N;i++)if(b[i]===1){prev[i]=-1;q.push(i)}
  for(var h=0;h<q.length;h++){var x=q[h];if(x>=N*(N-1)){var out=[];while(x>=0){out.push(x);x=prev[x]}return out.reverse()}nb[x].forEach(function(y){if(b[y]===1&&prev[y]===undefined){prev[y]=x;q.push(y)}})}return[]}
function mv(N,b,k,nb,m){b[m]=1;var ok;if(conn(N,b,1,nb))ok=true;else if(k<2)ok=false;else{ok=true;var any=false;
  for(var r=0;r<N*N&&ok;r++)if(!b[r]){any=true;b[r]=2;if(conn(N,b,2,nb)||!anyW(N,b,k-1,nb))ok=false;b[r]=0}if(!any)ok=false}b[m]=0;return ok}
function anyW(N,b,k,nb){for(var m=0;m<N*N;m++)if(!b[m]&&mv(N,b,k,nb,m))return true;return false}
function winning(N,b,k,nb){var o=[];for(var m=0;m<N*N;m++)if(!b[m]&&mv(N,b,k,nb,m))o.push(m);return o}
function distK(N,b,nb,maxK){for(var k=1;k<=maxK;k++)if(anyW(N,b,k,nb))return k;return 0}
function empt(b){var n=0;b.forEach(function(x){if(!x)n++});return n}
/* shortest number of empty cells a side still needs (INF 99): who 1 top-bottom, who 2 left-right */
function need(N,b,who,nb){var INF=99,d=[],i,ch=true,o=who===1?2:1;for(i=0;i<N*N;i++)d.push(INF);
  for(i=0;i<N;i++){var s=who===1?i:i*N;if(b[s]!==o)d[s]=b[s]===who?0:1}
  while(ch){ch=false;for(i=0;i<N*N;i++)if(b[i]!==o&&d[i]<INF)nb[i].forEach(function(y){if(b[y]!==o){var v=d[i]+(b[y]===who?0:1);if(v<d[y]){d[y]=v;ch=true}}})}
  var m=INF;for(i=0;i<N;i++){var e=who===1?N*(N-1)+i:i*N+N-1;if(d[e]<m)m=d[e]}return m}
function reply(N,b,nb){var best=-1,bs=-1;for(var r=0;r<N*N;r++)if(!b[r]){b[r]=2;var s=conn(N,b,2,nb)?1000:need(N,b,1,nb);b[r]=0;if(s>bs){bs=s;best=r}}return best}
/* 1.2.1: the computer defends for real. Its reply is the cell that pushes your forced win furthest away (or kills it), by the exact solver; ties go to the
   old blocking heuristic. So par ('forced win in k') is exactly what it takes against this computer, and a weak reply never hands out a shorter win. */
function smartReply(N,b,nb){var e=empt(b),mk=Math.min(5,Math.ceil((e-1)/2)),best=-1,bs=-1,bh=-1;
  for(var r=0;r<N*N;r++)if(!b[r]){b[r]=2;var s,h;if(conn(N,b,2,nb)){s=1e4;h=0}else{var d=mk>0?distK(N,b,nb,mk):0;s=d===0?999:d;h=need(N,b,1,nb)}b[r]=0;
    if(s>bs||(s===bs&&h>bh)){bs=s;bh=h;best=r}}return best}
function path(N,rng){var r=0,c=pzInt(rng,N),cells=[c],used={};used[c]=1;
  while(r<N-1){var opts=[],o;if(rng()<.22){if(c>0&&!used[r*N+c-1])opts.push([r,c-1]);if(c<N-1&&!used[r*N+c+1])opts.push([r,c+1])}
    if(!opts.length){opts.push([r+1,c]);if(c>0)opts.push([r+1,c-1])}o=opts[pzInt(rng,opts.length)];r=o[0];c=o[1];used[r*N+c]=1;cells.push(r*N+c)}return cells}
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
/* 1.2.1 (level-review fix): raw levels 31-38 are 5x5 boards with a forced win in exactly 4 (not 3) and ONE winning first move, found by work/la_gen4.js
   with this file's exact solver (seeded, so the table is reproducible). trim6.js interleaves them with the par-3 levels as the ladder's sawtooth top.
   (The review suggested 6x6; on 6x6 the cells would be 28 px apart at 320 px, so the extra depth comes from more open cells on 5x5 instead.) */
var TOP=[{"N":5,"b":"0021101012200202022200111","par":4,"win":[16]},{"N":5,"b":"2110012002211011002220212","par":4,"win":[21]},{"N":5,"b":"1022012201011001101122022","par":4,"win":[22]},{"N":5,"b":"0012110222012210011120020","par":4,"win":[16]},{"N":5,"b":"2100210001201210022121102","par":4,"win":[8]},{"N":5,"b":"1202012200021001211100022","par":4,"win":[4]},{"N":5,"b":"1122010110200202022100102","par":4,"win":[16]},{"N":5,"b":"2000210220001221121100110","par":4,"win":[6]}];
var PAR=[1,1,1,1,2,2,2,2,2,2,2,2,3,2,3,3,2,3,3,3,3,3,3,3,3,3,3,3,3,3];
function make(level,rng){level=Math.max(1,Math.min(30+TOP.length,level|0||1));if(level>30){var T=TOP[level-31];return{title:'Level '+level,level:level,N:T.N,b:T.b.split('').map(Number),par:T.par,win:T.win.slice(),parExact:true}}var N=level<=3?3:level<=14?4:5,d=PAR[level-1],nb=nbs(N),t,i,b,E;
  for(t=0;t<900;t++){var dt=t<600?d:Math.max(1,d-1);E=dt===1?2+pzInt(rng,2):dt===2?4+pzInt(rng,2):6+pzInt(rng,2);if(N===3)E=Math.min(E,dt+2);
    var pa=path(N,rng),on={};pa.forEach(function(x){on[x]=1});b=[];for(i=0;i<N*N;i++)b.push(on[i]?1:(rng()<.5?1:2));
    var gp=pzShuffle(pa,rng),g=Math.min(dt,pa.length-1);for(i=0;i<g;i++)b[gp[i]]=0;
    var oth=pzShuffle(seq(N*N).filter(function(x){return !on[x]}),rng);for(i=0;i<E-g&&i<oth.length;i++)b[oth[i]]=0;
    if(empt(b)<dt+1)continue;var np=0,nq=0;b.forEach(function(x){if(x===1)np++;if(x===2)nq++});if(Math.abs(np-nq)>2)continue;
    if(conn(N,b,1,nb)||conn(N,b,2,nb))continue;if(distK(N,b,nb,dt)!==dt)continue;var W=winning(N,b,dt,nb);if(W.length>(t%600<300?1:2))continue;
    return{title:'Level '+level,level:level,N:N,b:b,par:dt,win:W,parExact:true}}
  var pp=path(N,rng),onp={};pp.forEach(function(x){onp[x]=1});b=[];for(i=0;i<N*N;i++)b.push(onp[i]?1:2);b[pp[pzInt(rng,pp.length)]]=0;
  var dd=distK(N,b,nb,3)||1;return{title:'Level '+level,level:level,N:N,b:b,par:dd,win:winning(N,b,dd,nb),parExact:true}}
window.V6LA={smartReply:smartReply,TOP:TOP,make:make,conn:conn,winning:winning,distK:distK,nbs:nbs,PAR:PAR,reply:reply};
var CSS=''
+'.la .la-board{position:relative;width:100%;border-radius:26px;background:var(--dk-board);box-shadow:inset 0 3px 10px rgba(0,0,0,.14),0 1px 0 rgba(255,255,255,.4);margin:0 auto}'
+'.la .la-board>svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'
+'.la [data-zkc]{transform-box:fill-box;transform-origin:center}'
+'.la .la-pt{border-radius:50%;margin:0;transform:translate(-50%,-50%)}'
+'.la .la-pill{display:inline-flex;align-items:center;gap:6px}'
+'.la .zk-ctr.la-cut .zk-num{font-size:.875rem;letter-spacing:.01em}.la .zk-ctr.la-cut-me{background:#FBE3BF;color:#7A3B00;box-shadow:0 0 0 2px #E9A23B}'
+'.la .zk-ctr>svg{width:26px;height:24px}.la .zk-ctr .la-to{font:700 .75rem/1 var(--font);color:var(--muted,#5f5a52);margin-left:2px}.la .dk-top{gap:10px}';
/* 1.2.1: the race pills draw what they count: your two orange edges joined by a dotted run of discs (cells you still need), their navy edges joined by diamonds */
var ICO1='<svg viewBox="0 0 26 24" aria-hidden="true"><path d="M4 2.5h18M4 21.5h18" stroke="#F28C28" stroke-width="3" stroke-linecap="round"/><circle cx="13" cy="8" r="3.2" fill="#F28C28" stroke="#6B3200" stroke-width="1.4"/><circle cx="13" cy="16" r="3.2" fill="none" stroke="#F28C28" stroke-width="1.6" stroke-dasharray="2 1.6"/></svg>';
var ICO2='<svg viewBox="0 0 26 24" aria-hidden="true"><path d="M2.5 4v16M23.5 4v16" stroke="#6F8FD8" stroke-width="3" stroke-linecap="round"/><rect x="6" y="8.5" width="6" height="6" rx="1.4" transform="rotate(45 9 11.5)" fill="#27324A" stroke="#fff" stroke-width="1.2"/><rect x="14" y="8.5" width="6" height="6" rx="1.4" transform="rotate(45 17 11.5)" fill="none" stroke="#6F8FD8" stroke-width="1.4" stroke-dasharray="2 1.4"/></svg>';
function mount(root,inst,api){ZK.css(DK.BASECSS+CSS,'la-css');root.textContent='';
  var N=inst.N,nb=nbs(N),rm=ZK.rm(api),L=DK.life(),b=inst.b.slice(),hist=[],steps=0,hints=0,undos=0,fin=false,busy=false,over=false,lastPt=-1,ghost=null,idle=null,i;
  var stage=DK.h('div','dk la zk-stage zk-host'+(rm?' zk-rm':'')),top=DK.h('div','dk-top',null,null,stage);
  var cMe=ZK.counter({icon:ICO1,label:function(k){return k===0?'You are linked':'You need '+k+' more cells'}}),cThem=ZK.counter({icon:ICO2,zero:false,label:function(k){return 'They need '+k+' more cells'}}),pips=ZK.pips(inst.par);
  top.appendChild(cMe.el);top.appendChild(cThem.el);[cMe,cThem].forEach(function(c){var sm=document.createElement('small');sm.className='la-to';sm.textContent='to link';c.el.appendChild(sm)});
  var vbW=1.5*N-.5,vbH=(N-1)*.866+1.1547,vx=-.9,vy=-.9,vw=vbW+1.8,vh=vbH+1.8;
  var board=DK.h('div','la-board zk-board',null,{role:'group','aria-label':'Hex board, '+N+' by '+N},stage);board.style.aspectRatio=vw+'/'+vh;board.style.maxWidth=Math.min(372,N*100)+'px';
  var svg=DK.sv('svg',{viewBox:vx+' '+vy+' '+vw.toFixed(3)+' '+vh.toFixed(3),'aria-hidden':'true'},board),gE=DK.sv('g',null,svg),gC=DK.sv('g',null,svg),gW=DK.sv('g',null,svg),gP=DK.sv('g',null,svg),btn=[];
  function X(k){return Math.floor(k/N)/2+k%N+.5}function Y(k){return .5774+Math.floor(k/N)*.866}
  function hex(k,r){var p=[];for(var j=0;j<6;j++){var a=(30+60*j)*Math.PI/180;p.push((X(k)+r*Math.cos(a)).toFixed(3)+' '+(Y(k)+r*Math.sin(a)).toFixed(3))}return'M'+p.join('L')+'Z'}
  function edge(x1,y1,x2,y2,col){DK.sv('line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:col,'stroke-width':.24,'stroke-linecap':'round'},gE)}
  edge(X(0)-.55,Y(0)-.7,X(N-1)+.55,Y(0)-.7,'#F28C28');edge(X(N*(N-1))-.55,Y(N*N-1)+.7,X(N*N-1)+.55,Y(N*N-1)+.7,'#F28C28');
  edge(X(0)-.66,Y(0)-.1,X(N*(N-1))-.66,Y(N*(N-1))+.1,'#6F8FD8');edge(X(N-1)+.66,Y(N-1)-.1,X(N*N-1)+.66,Y(N*N-1)+.1,'#6F8FD8');
  for(i=0;i<N*N;i++)DK.sv('path',{d:hex(i,.55),fill:'var(--dk-tri,rgba(255,255,255,.4))',stroke:'var(--dk-line)','stroke-width':.07,'stroke-linejoin':'round','data-zkc':''},gC);
  for(i=0;i<N*N;i++)(function(k){var bt=DK.btn('Cell','dk-pt la-pt');bt.style.left=((X(k)-vx)/vw*100)+'%';bt.style.top=((Y(k)-vy)/vh*100)+'%';bt.style.width=(100/vw*.95)+'%';bt.style.minWidth='44px';bt.style.height='0';bt.style.paddingBottom=(100/vw*.95)+'%';bt.style.minHeight='44px';bt.onclick=function(){tap(k)};btn.push(bt);board.appendChild(bt)})(i);
  stage.appendChild(pips.el);root.appendChild(stage);
  var pe={};
  function piece(k,who){var g=DK.sv('g',{'data-zkc':''});g.style.transformBox='fill-box';g.style.transformOrigin='center';
    if(who===1){DK.sv('circle',{cx:X(k),cy:Y(k),r:.33,fill:'#F28C28',stroke:'#6B3200','stroke-width':.09},g);DK.sv('circle',{cx:X(k),cy:Y(k),r:.1,fill:'#FFE2B8'},g)}
    else{DK.sv('rect',{x:X(k)-.25,y:Y(k)-.25,width:.5,height:.5,rx:.12,transform:'rotate(45 '+X(k)+' '+Y(k)+')',fill:'#27324A',stroke:'#fff','stroke-width':.08},g)}return g}
  function sync(){gP.textContent='';pe={};for(var k=0;k<N*N;k++){if(b[k]){var g=piece(k,b[k]);gP.appendChild(g);pe[k]=g}btn[k].setAttribute('aria-label','Row '+(Math.floor(k/N)+1)+', column '+(k%N+1)+', '+(b[k]===1?'your disc':b[k]===2?'their diamond':'empty'))}
    var me=need(N,b,1,nb),th=need(N,b,2,nb);pill(cMe,me,'You are cut off: no path is left',true);pill(cThem,th,'They are cut off: no path is left',false);pips.set(steps);ZK.stuck(stage,false);if(!fin&&!busy)chk()}
  /* 1.2.4 (link-across-01): 'impossible' (99) used to show as 0, the 'linked' state (green on your pill). A side with no path left now reads 'Cut off':
     a warning style on your pill (you can no longer link), a plain one on theirs (they can no longer link). */
  function pill(c,k,cutLbl,mine){var cut=k>=99,sm=c.el.querySelector('.la-to'),nm=c.el.querySelector('.zk-num');c.set(cut?-1:k,true);
    c.el.classList.toggle('la-cut',cut);c.el.classList.toggle('la-cut-me',cut&&mine);c.el.setAttribute('data-cut',cut?'1':'0');
    if(cut){nm.textContent='Cut off';c.el.setAttribute('aria-label',cutLbl)}if(sm)sm.style.display=cut?'none':''}
  function winNow(){var e=empt(b);if(!e)return[];var k=distK(N,b,nb,Math.ceil(e/2));return k?winning(N,b,k,nb):[]}
  function chk(){if(over)return ZK.stuck(stage,true,{text:'They linked across',onUndo:function(){ctl.undo()}});if(!winNow().length)ZK.stuck(stage,true,{text:'No forced win left',onUndo:function(){ctl.undo()}})}
  function D(ms){return rm?0:ms}
  function drop(k){var g=pe[k];if(g&&!rm)ZK.anim(g,[{transform:'scale(.4)',opacity:0},{transform:'scale(1.15)',opacity:1,offset:.6},{transform:'scale(1)',opacity:1}],260,ZK.SPRING)}
  function tap(k){if(fin||busy||over)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);if(b[k]){ZK.wrong(btn[k]);return}
    hist.push({b:b.slice(),steps:steps,last:lastPt,over:over});b[k]=1;steps++;lastPt=k;api.moved();sync();drop(k);ZK.sfx('clack');ZK.buzz('move');
    if(conn(N,b,1,nb)){return win()}
    if(!empt(b))return;busy=true;ZK.stuck(stage,false);
    L.later(function(){var r=smartReply(N,b,nb);if(r<0){busy=false;return}b[r]=2;sync();drop(r);ZK.sfx('slide');
      if(conn(N,b,2,nb))over=true;busy=false;sync()},D(380))}
  function win(){fin=true;var ch=chain(N,b,nb);ZK.sfx('cap');api.say('Linked top to bottom.');
    if(ch.length&&!rm){var pts=ch.map(function(k){return X(k).toFixed(3)+' '+Y(k).toFixed(3)}).join('L'),ln=DK.sv('path',{d:'M'+pts,fill:'none',stroke:'#FFE2B8','stroke-width':.16,'stroke-linecap':'round','stroke-linejoin':'round',opacity:.95},gW);
      try{var len=ln.getTotalLength();ln.style.strokeDasharray=len;ln.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{duration:420,easing:'ease-out',fill:'forwards'})}catch(e){}}
    else if(ch.length)DK.sv('path',{d:'M'+ch.map(function(k){return X(k).toFixed(3)+' '+Y(k).toFixed(3)}).join('L'),fill:'none',stroke:'#FFE2B8','stroke-width':.16,'stroke-linecap':'round'},gW);
    pill(cMe,0,'',true);L.later(function(){api.done({solved:true,moves:steps,hints:hints,undos:undos,extra:{par:inst.par,N:N}})},D(450))}
  var ctl={
    undo:function(){if(fin||!hist.length)return false;L.clear();busy=false;var h=hist.pop();b=h.b;steps=h.steps;lastPt=h.last;over=false;undos++;ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);sync();return true},
    restart:function(){if(fin)return;L.clear();busy=false;hist=[];b=inst.b.slice();steps=0;lastPt=-1;over=false;ZK.sfx('undo');ZK.unmark(stage);sync()},
    hint:function(lv){if(fin||busy)return null;var W=over?[]:winNow();if(!W.length){if(lv>=3&&hist.length){ctl.undo();return 'Took your last move back.'}return 'No forced win from here. Try Undo.'}hints++;ZK.unmark(stage);var m=W[0];
      if(lv<=1)return 'Find the gap in your chain, and watch their race pill.';
      if(lv===2){ZK.mark(btn[m]);return 'Try this cell.'}
      tap(m);return 'Placed one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();L.destroy();root.textContent=''},
    lastEl:function(){return lastPt>=0?btn[lastPt]:null},
    state:function(){return{b:b.slice(),steps:steps,fin:fin,busy:busy,over:over}}};
  sync();idle=ZK.idle(stage,25000);
  if(inst.level===1&&inst.win.length)ghost=ZK.ghost(stage,[{tap:btn[inst.win[0]],hold:900}],{id:ID,level:1});
  return ctl}
ZK.override({id:ID,name:'Link Across',family:'grid',theme:'F9',calm:true,
  blurb:'Join the top edge to the bottom edge before the computer joins left to right.',
  how:'Place discs to link the orange edges. The computer links the navy edges.',
  areas:['space','control'],levels:38,secs:75,make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'Linked in '+m+' move'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
