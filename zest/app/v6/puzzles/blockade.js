/* Zest v6 batch d: Blockade. Overrides the puzzles_d4.js entry through ZK.override (the original stays in ZK.orig).
   Rule: eight points round a hub. You slide a counter to an empty point next to it; the computer slides one of theirs (its best defence). Leave them no legal move.
   Kept: the position model, the solver (PZD4.bkWin / bkMinWin: fewest of YOUR moves that force a win, exact up to 6) and the computer's reply (PZD4.bkReply).
   Changed: a 30-level par table with breathers instead of 8 levels of par 1; aha filter from level 3 (few winning first moves, not "the obvious one"); for
   level 6+ the move that leaves them the fewest replies is not always the winning one. The board shows their escape points (hollow diamonds), your legal
   moves when a counter is selected (orange dashed rings), a counter of their remaining moves, and a "slipped away" chip when no forced win is left. */
(function(){
var ID='blockade',D4=PZD4,ADJ=D4.BK_ADJ,MV=D4.bkMoves,AP=D4.bkApply;
var PAR=[1,1,2,1,2,2,3,2,2,3,3,2,3,3,4,3,3,4,3,4,4,5,4,4,5,4,5,5,4,5];
function nwin(s,par){var ms=MV(s,'Y'),out=[];ms.forEach(function(m){var s1=AP(s,m),rs=MV(s1,'T');if(!rs.length){out.push(m);return}
  if(par>1){var all=true;for(var j=0;j<rs.length&&all;j++)if(!D4.bkWin(AP(s1,rs[j]),par-1))all=false;if(all)out.push(m)}});return out}
function greedyWins(s,par){var ms=MV(s,'Y'),best=1e9,pick=[];ms.forEach(function(m){var n=MV(AP(s,m),'T').length;if(n<best){best=n;pick=[m]}else if(n===best)pick.push(m)});
  var w=nwin(s,par);return pick.some(function(m){return w.some(function(x){return x[0]===m[0]&&x[1]===m[1]})})}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var target=PAR[level-1],best=null,bs=1e9,t,i;
  for(t=0;t<260;t++){var mine=2+pzInt(rng,3),theirs=2+pzInt(rng,3),cells=pzShuffle([0,1,2,3,4,5,6,7,8],rng),arr=[];for(i=0;i<9;i++)arr.push('.');
    for(i=0;i<mine;i++)arr[cells[i]]='Y';for(i=0;i<theirs;i++)arr[cells[mine+i]]='T';var s=arr.join('');
    if(!MV(s,'T').length||!MV(s,'Y').length)continue;var p=D4.bkMinWin(s);if(p!==target)continue;
    var w=nwin(s,p),ym=MV(s,'Y').length,sc=0;
    if(level>=3){if(w.length>2)sc+=4;if(ym<4)sc+=2;if(w.length>3)sc+=6}
    if(level>=6&&p>=2&&greedyWins(s,p))sc+=3;
    if(sc<bs){bs=sc;best={title:'Level '+level,level:level,par:p,start:s,wins:w.length}}if(sc===0)break}
  if(!best){for(t=0;t<400;t++){var m2=2+pzInt(rng,3),th2=2+pzInt(rng,3),c2=pzShuffle([0,1,2,3,4,5,6,7,8],rng),a2=[];for(i=0;i<9;i++)a2.push('.');
    for(i=0;i<m2;i++)a2[c2[i]]='Y';for(i=0;i<th2;i++)a2[c2[m2+i]]='T';var s2=a2.join(''),p2=D4.bkMinWin(s2);if(p2&&Math.abs(p2-target)<=1&&MV(s2,'T').length)return{title:'Level '+level,level:level,par:p2,start:s2}}
    return{title:'Level '+level,level:level,par:1,start:'YYYY.TTT.'}}
  return best}
/* 1.2.4 (blockade-01/02): the EXACT game value, with no depth cap. PZD4.bkMinWin stops at 6 of your moves, so '0' there was never proof of a lost game.
   The game is tiny (9 points, the counts never change), so every position with the same counts is solved by retrograde analysis: a position (you to move)
   is won in k when some move of yours leaves them no move (k=1), or every reply lands in a position won in k-1 or less. A position that never gets a value
   is lost for good: whatever you do, the computer can always keep a move. That is the only 'lost' the board ever shows. exact(s) = fewest moves, 0 = lost. */
var EX={};
function exTable(s){var ny=0,nt=0,i;for(i=0;i<9;i++){if(s.charAt(i)==='Y')ny++;else if(s.charAt(i)==='T')nt++}var key=ny+','+nt;if(EX[key])return EX[key];
  var all=[];(function gen(pre,y,t){if(pre.length===9){if(!y&&!t)all.push(pre);return}var left=9-pre.length;if(y)gen(pre+'Y',y-1,t);if(t)gen(pre+'T',y,t-1);if(left>y+t)gen(pre+'.',y,t)})('',ny,nt);
  var val={},ch=true,k=0;
  while(ch){ch=false;k++;for(var a=0;a<all.length;a++){var st=all[a];if(val[st])continue;var ms=MV(st,'Y'),ok=false;
    for(var j=0;j<ms.length&&!ok;j++){var s1=AP(st,ms[j]),rs=MV(s1,'T');if(!rs.length){ok=true;break}var good=true;for(var r=0;r<rs.length&&good;r++){var v=val[AP(s1,rs[r])];if(!v||v>=k)good=false}if(good)ok=true}
    if(ok){val[st]=k;ch=true}}}
  return EX[key]=val}
function exact(s){return exTable(s)[s]||0}
/* the computer's reply: the one that keeps you furthest from a win, by the exact value (a reply that escapes for good beats any finite one; ties: first in order) */
function exReply(s1){var rs=MV(s1,'T'),best=null,bv=-1;for(var j=0;j<rs.length;j++){var v=exact(AP(s1,rs[j]))||1e9;if(v>bv){bv=v;best=rs[j]}}return best}
window.V6BK={make:make,nwin:nwin,greedyWins:greedyWins,PAR:PAR,exact:exact,exReply:exReply};

var CSS=''
+'.bk .bk-board{position:relative;width:100%;aspect-ratio:1;border-radius:26px;background:var(--dk-board);box-shadow:inset 0 3px 10px rgba(0,0,0,.14),0 1px 0 rgba(255,255,255,.4)}'
+'.bk .bk-board>svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'
+'.bk [data-zkc]{transform-box:fill-box;transform-origin:center}.bk .bk-in{transform-box:view-box;transform-origin:0 0}'
+'.bk .bk-pt{z-index:2}'
+'.bk .zk-ctr .bk-to{font:700 .75rem/1 var(--font);color:var(--muted,#5f5a52);margin-left:2px}'
/* 1.2.4: the end panel for a real loss (over the board, which dims) */
+'.bk.bk-lost-on .bk-board{opacity:.45;filter:saturate(.6)}'
+'.bk-end{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:8;width:min(300px,86%);box-sizing:border-box;padding:16px 16px 14px;border-radius:22px;background:var(--surface,#fff);color:var(--ink,#111);box-shadow:0 10px 30px rgba(0,0,0,.25),0 0 0 2px #E9A23B;display:grid;gap:6px;text-align:center;font-family:var(--font)}'
+'.bk-end strong{font:800 1.0625rem/1.3 var(--font)}.bk-end span{font:500 .875rem/1.35 var(--font);color:var(--muted,#5f5a52)}'
+'.bk-endrow{display:flex;gap:10px;justify-content:center;margin-top:6px}'
+'.bk-endrow button{all:unset;box-sizing:border-box;cursor:pointer;min-height:48px;min-width:96px;padding:0 18px;border-radius:24px;display:flex;align-items:center;justify-content:center;font:800 .9375rem var(--font)}'
+'.bk-endrow .bk-retry{background:var(--accent,#E8590C);color:var(--on-accent,#fff)}.bk-endrow .bk-undo{box-shadow:0 0 0 2px var(--edge,#999);color:var(--ink,#111)}'
/* 4 Nov level-review fixes: the board sits lower (no empty lower third); their counters get a light halo in dark mode */
+'.bk{padding-top:min(7vh,56px);--bk-halo:transparent}:root[data-theme="dark"] .bk{--bk-halo:#EDE6D8}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .bk{--bk-halo:#EDE6D8}}';
var DIA='<svg viewBox="-24 -24 48 48" aria-hidden="true"><rect x="-14" y="-14" width="28" height="28" rx="8" transform="rotate(45)" fill="#27324A" stroke="#fff" stroke-width="3"/></svg>';
var AT=[];for(var i=0;i<8;i++){var a=-Math.PI/2+i*Math.PI/4;AT.push([150+112*Math.cos(a),150+112*Math.sin(a)])}AT.push([150,150]);
function put(el,p){el.style.transform='translate('+AT[p][0]+'px,'+AT[p][1]+'px)'}
function yG(sel){var o=DK.sv('g'),g=DK.sv('g',{'class':'bk-in','data-zkc':''},o);DK.sv('circle',{r:21,fill:'#F28C28',stroke:'#6B3200','stroke-width':3},g);DK.sv('circle',{r:7,fill:'#FFE2B8'},g);if(sel)DK.sv('circle',{r:27,fill:'none',stroke:'var(--dk-ink)','stroke-width':3},g);return o}
function tG(stuck){var o=DK.sv('g'),g=DK.sv('g',{'class':'bk-in','data-zkc':''},o);DK.sv('rect',{x:-18,y:-18,width:36,height:36,rx:11,transform:'rotate(45)',fill:'none',stroke:'var(--bk-halo)','stroke-width':2.5},g);DK.sv('rect',{x:-15,y:-15,width:30,height:30,rx:9,transform:'rotate(45)',fill:'#27324A',stroke:'#fff','stroke-width':3,opacity:stuck?.7:1},g);
  if(stuck){DK.sv('rect',{x:-8,y:-3,width:16,height:12,rx:3,fill:'#fff'},g);DK.sv('path',{d:'M-5 -3V-8a5 5 0 0 1 10 0V-3',fill:'none',stroke:'#fff','stroke-width':3},g)}else{DK.sv('circle',{cx:-5,cy:-2,r:2.6,fill:'#fff'},g);DK.sv('circle',{cx:5,cy:-2,r:2.6,fill:'#fff'},g)}return o}

function mount(root,inst,api){ZK.css(DK.BASECSS+CSS,'bk-css');root.textContent='';
  var rm=ZK.rm(api),L=DK.life(),s=inst.start,hist=[],sel=-1,fin=false,busy=false,lost=false,endEl=null,moves=0,hints=0,undos=0,lastPt=-1,ghost=null,idle=null,i,p;
  var stage=DK.h('div','dk bk zk-stage zk-host'+(rm?' zk-rm':'')),top=DK.h('div','dk-top',null,null,stage);
  var ctr=ZK.counter({icon:DIA,label:function(k){return k===0?'They have no move':'They have '+k+' move'+(k===1?'':'s')}}),pips=ZK.pips(inst.par);top.appendChild(ctr.el);
  var ctl0=document.createElement('small');ctl0.className='bk-to';ctl0.textContent='their moves';ctr.el.appendChild(ctl0);   /* 1.2.4 (blockade-04): the pill says what it counts */
  var board=DK.h('div','bk-board zk-board',null,{role:'group','aria-label':'Eight points round a hub'},stage),svg=DK.sv('svg',{viewBox:'0 0 300 300','aria-hidden':'true'},board);
  var gL=DK.sv('g',null,svg),gH=DK.sv('g',null,svg),gP=DK.sv('g',null,svg),gPc=DK.sv('g',null,svg),btn=[];
  ADJ.forEach(function(nb,a){nb.forEach(function(b){if(b>a)DK.sv('line',{x1:AT[a][0],y1:AT[a][1],x2:AT[b][0],y2:AT[b][1],stroke:'var(--dk-line)','stroke-width':a===8||b===8?3:3.4,'stroke-linecap':'round'},gL)})});
  for(p=0;p<9;p++)DK.sv('circle',{cx:AT[p][0],cy:AT[p][1],r:5,fill:'var(--dk-line)','data-zkc':''},gP);
  for(p=0;p<9;p++)(function(p){var b=DK.btn('Point '+(p+1),'dk-pt bk-pt');b.style.left=(AT[p][0]/3)+'%';b.style.top=(AT[p][1]/3)+'%';b.onclick=function(){tap(p)};btn.push(b);board.appendChild(b)})(p);
  stage.appendChild(pips.el);root.appendChild(stage);
  var el={};
  function ch(q,k){return s.charAt(q)===k}
  function tMoves(){return MV(s,'T')}
  function marks(){gH.textContent='';var tm=tMoves();
    var seen={};tm.forEach(function(m){var q=m[1];if(seen[q])return;seen[q]=1;   /* an escape point: a dashed ring round the point plus a small diamond (was a 12 px hollow diamond) */
      DK.sv('circle',{cx:AT[q][0],cy:AT[q][1],r:19,fill:'rgba(39,50,74,.08)',stroke:'var(--dk-ink)','stroke-width':3,'stroke-dasharray':'5 4',opacity:.85},gH);
      DK.sv('rect',{x:AT[q][0]-7,y:AT[q][1]-7,width:14,height:14,rx:4,transform:'rotate(45 '+AT[q][0]+' '+AT[q][1]+')',fill:'var(--dk-ink)',opacity:.8},gH)});
    if(sel>=0&&!fin)ADJ[sel].forEach(function(q){if(ch(q,'.'))DK.sv('circle',{cx:AT[q][0],cy:AT[q][1],r:26,fill:'rgba(242,140,40,.16)',stroke:'#F28C28','stroke-width':3.5,'stroke-dasharray':'6 5','class':'dk-pulse'},gH)})}
  function sync(){gPc.textContent='';el={};for(p=0;p<8+1;p++){var c=s.charAt(p);if(c==='Y'||c==='T'){var g=c==='Y'?yG(p===sel):tG(!MV(s,'T').some(function(m){return m[0]===p}));put(g,p);gPc.appendChild(g);el[p]=g}}
    marks();ctr.set(tMoves().length,true);for(p=0;p<9;p++){var c2=s.charAt(p);btn[p].setAttribute('aria-label','Point '+(p+1)+', '+(c2==='Y'?'your counter':c2==='T'?'their counter':'empty')+(p===sel?', selected':''))}
    ZK.stuck(stage,false);if(!fin)checkStuck()}
  /* 1.2.4: a real loss ends the game (blockade-02: it used to grey the board and play on forever). Lost = you have no move, or the exact solve says the
     computer can always keep a move from here. The board stops taking moves and an end panel says why, with Retry (from the start) and Undo. */
  function checkStuck(){if(busy||fin)return;var noMove=!MV(s,'Y').length;if(noMove||!exact(s))endLost(noMove)}
  function endLost(noMove){lost=true;sel=-1;marks();stage.classList.add('bk-lost-on');
    var t=noMove?'You have no move left.':'They can always escape now.',sub=noMove?'Every counter of yours is blocked.':'From here they always keep a move, whatever you do.';
    endEl=DK.h('div','bk-end',null,{role:'status','data-lost':noMove?'nomove':'escape'},stage);
    DK.h('strong',null,t,null,endEl);DK.h('span',null,sub,null,endEl);var row=DK.h('div','bk-endrow',null,null,endEl);
    var bR=DK.h('button','zk-p bk-retry','Retry',{type:'button','data-retry':''},row),bU=DK.h('button','zk-p bk-undo','Undo',{type:'button','data-bkundo':''},row);
    bR.onclick=function(){var zs=window.ZK&&ZK.sess&&ZK.sess(stage);if(zs){zs.doRestart();return}var r=stage.closest('.pz5');var rb=r&&r.querySelector('[data-restart]');if(rb&&rb.offsetParent!==null)rb.click();else ctl.restart()};   /* the runner's Restart / Undo (page and Reel: one move count) */
    bU.onclick=function(){var zs=window.ZK&&ZK.sess&&ZK.sess(stage);if(zs){zs.doUndo();return}var r=stage.closest('.pz5');var ub=r&&r.querySelector('[data-undo]');if(ub&&ub.offsetParent!==null)ub.click();else ctl.undo()};
    ZK.sfx('soft');ZK.buzz('soft');api.say(t+' '+sub+' Retry or Undo.')}
  function clearLost(){lost=false;stage.classList.remove('bk-lost-on');if(endEl){endEl.remove();endEl=null}}
  function D(ms){return rm?0:ms}
  function tap(p0){if(fin||busy||lost)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);var c=s.charAt(p0);
    if(c==='Y'){sel=sel===p0?-1:p0;ZK.sfx('lift');ZK.buzz('tap');sync();if(sel>=0&&el[sel])ZK.anim(el[sel].firstChild,[{transform:'scale(1)'},{transform:'scale(1.16)'},{transform:'scale(1.08)'}],D(180),ZK.SPRING,0,'forwards');return}
    if(c==='T'){ZK.wrong(btn[p0]);return}
    if(sel<0){return}
    if(ADJ[sel].indexOf(p0)<0){ZK.wrong(btn[p0]);return}
    play([sel,p0])}
  function slide(g,from,to,ms,arc){if(!g||rm)return;var mx=(AT[from][0]+AT[to][0])/2,my=(AT[from][1]+AT[to][1])/2;   /* the counter lifts as it slides along its line, then settles */
    ZK.anim(g,[{transform:'translate('+AT[from][0]+'px,'+AT[from][1]+'px) scale(1)'},{transform:'translate('+mx+'px,'+my+'px) scale(1.14)',offset:.5},{transform:'translate('+AT[to][0]+'px,'+AT[to][1]+'px) scale(1)'}],ms,'cubic-bezier(.4,0,.2,1)')}
  function play(m){hist.push({s:s,moves:moves,last:lastPt});var g=el[m[0]];s=AP(s,m);sel=-1;moves++;lastPt=m[1];api.moved();pips.set(moves);
    if(g){put(g,m[1]);slide(g,m[0],m[1],D(300))}ZK.sfx('slide');ZK.buzz('move');gH.textContent='';
    L.later(function(){gPc.textContent='';el={};var b2=s;for(p=0;p<9;p++){var c=b2.charAt(p);if(c==='Y'||c==='T'){var gg=c==='Y'?yG(false):tG(false);put(gg,p);gPc.appendChild(gg);el[p]=gg}}
      if(!MV(s,'T').length){win();return}
      busy=true;ctr.set(tMoves().length);var rp=exReply(s),tg=el[rp[0]];if(tg)ZK.anim(tg.firstChild,[{transform:'scale(1)'},{transform:'scale(1.2)'},{transform:'scale(1)'}],D(300),'ease-in-out');
      L.later(function(){var from=rp[0],to=rp[1];s=AP(s,rp);if(tg){put(tg,to);slide(tg,from,to,D(300))}ZK.sfx('slide');
        L.later(function(){busy=false;sync()},D(330))},D(360))},D(310))}
  function win(){fin=true;busy=false;sync();ctr.set(0);ZK.sfx('cap');api.say('They have no legal move.');
    [].forEach.call(gPc.querySelectorAll('.bk-in'),function(n,i){ZK.anim(n,[{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],D(300),ZK.SPRING,i*70)});
    L.later(function(){api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par}})},D(300))}
  var ctl={
    undo:function(){if(fin||!hist.length)return false;L.clear();DK.stopAnims(stage);busy=false;clearLost();var h=hist.pop();s=h.s;moves=h.moves;lastPt=h.last;sel=-1;pips.set(moves);undos++;ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);sync();return true},
    restart:function(){if(fin)return;L.clear();DK.stopAnims(stage);busy=false;clearLost();hist=[];s=inst.start;moves=0;sel=-1;lastPt=-1;pips.set(0);ZK.sfx('undo');ZK.unmark(stage);sync()},
    hint:function(lv){if(fin)return null;var d=exact(s);if(lost||!d)return 'They can always escape from here. Undo or Retry.';var w=nwin(s,d);if(!w.length)return 'Try Undo.';hints++;ZK.unmark(stage);var m=w[0];
      if(lv<=1){return 'Look at where their counters can go (the hollow diamonds).'}
      if(lv===2){ZK.mark(btn[m[0]]);return 'Move this counter.'}
      sel=m[0];play(m);return 'Moved one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();L.destroy();root.textContent=''},
    lastEl:function(){return lastPt>=0?btn[lastPt]:null},
    state:function(){return{moves:moves,fin:fin,busy:busy,s:s,sel:sel,lost:lost}}};
  sync();pips.set(0);idle=ZK.idle(stage,25000);
  if(inst.level===1){var w0=nwin(s,inst.par);if(w0.length){var m0=w0[0];ghost=ZK.ghost(stage,[{tap:btn[m0[0]],down:function(){sel=m0[0];marks()},up:function(){},cancel:function(){sel=-1;marks()},hold:900},{tap:btn[m0[1]],hold:700}],{id:ID,level:1})}}
  return ctl}

ZK.override({id:ID,name:'Blockade',family:'move',theme:'F9',calm:true,
  blurb:'Trap the opponent so they have no legal move.',
  how:'Slide a counter to a free point beside it. Leave them no move.',
  areas:['control','flex'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'Trapped in '+m+' move'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
