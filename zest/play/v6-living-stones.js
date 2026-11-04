/* Zest v6 batch d: Living Stones. Overrides the puzzles_d9.js entry through ZK.override (the original stays in ZK.orig).
   Rule: tiny Go-style problems on a 5x5 board; you play the dark stones. A group with no empty neighbour is captured. 'cap': capture the marked white group in k stones.
   'save': keep the marked dark group alive through White's k replies. Kept: every template, the exact solver and White's scripted replies (PZD9.go.*).
   Changed: a 30-level plan that mixes the problem types as a sawtooth (k=1 and k=2 captures, saves, k=3 at the end) with templates in order of how many breathing
   spaces the target has, instead of 10 identical k=1 levels then a cliff; no instruction text. The board draws the target group's breathing spaces as amber dots
   (fill them all to capture), marks illegal points with a small cross, animates White's reply after a short beat, pops captured stones, and shows a
   'group holds' chip with Undo when the problem is lost. */
(function(){
var ID='living-stones',G=PZD9.go,GS=5;
/* 1.2.1 (level-review fix): 8 more depth-3 problems for the top of the ladder (raw levels 31-38), found by work/ls_search.js with the same exhaustive solver:
   capture in 3 (not in 2) whose one winning first move is NOT one of the target's breathing spaces (a net), and save in 3 whose one saving move is not a
   breathing space of the group (take a neighbour, or make the second eye). Codes C3/S3 draw only from this list, so the reviewed levels 1-30 are unchanged. */
var EXTRA=[{"type":"save","k":3,"t":10,"sol":21,"rows":["...xx",".o.oo","xo.xx","xo.xx","..x.."]},{"type":"cap","k":3,"t":3,"sol":14,"rows":["xo.ox","xxoo.","x.xx.","...x.","...o."]},{"type":"save","k":3,"t":8,"sol":12,"rows":["xo...","xxoxx",".o.oo","xo.ox",".xoo."]},{"type":"cap","k":3,"t":17,"sol":10,"rows":["x...o","xxo.x",".oxxo",".xox.","ooo.."]},{"type":"save","k":3,"t":11,"sol":23,"rows":[".o.xo","xo.o.",".x.oo","oxxox","ooo.."]},{"type":"cap","k":3,"t":10,"sol":6,"rows":["o.x.x","x..x.","o.xo.","oox.o",".x.xo"]},{"type":"save","k":3,"t":5,"sol":2,"rows":[".x.ox","xox..","xo..x",".o..x","x...."]},{"type":"cap","k":3,"t":16,"sol":13,"rows":[".x...","...x.","xx..o","xooxo",".oxxo"]}];
var PLAN=['c1','c1','c1','s1','c1','c2','s1','c2','s1','c2','s1','c2','s2','c2','s1','c2','s2','c2','s2','c3','s2','c2','s2','c3','s2','c2','c3','s2','c3','c3','S3','C3','S3','C3','S3','C3','S3','C3'];
function typeOf(code){return code.charAt(0).toLowerCase()==='c'?'cap':'save'}
function libsOf(t){var b=G.board(t.rows),i=t.t,g=G.groupOf(b,i);return g.libs+g.stones.length*.1}
var POOLS={};function pool(code){if(POOLS[code])return POOLS[code];var ty=typeOf(code),k=+code.charAt(1);return POOLS[code]=(code.charAt(0)<'a'?EXTRA:G.tpl()).filter(function(t){return t.type===ty&&t.k===k}).sort(function(a,b){return libsOf(a)-libsOf(b)})}
function make(level,rng){level=Math.max(1,Math.min(PLAN.length,level|0||1));var code=PLAN[level-1],pl=pool(code),nth=0,i;for(i=0;i<level-1;i++)if(PLAN[i]===code)nth++;
  var t=pl[nth%pl.length],tf=pzInt(rng,8),b=G.board(t.rows),nb=[];for(i=0;i<GS*GS;i++)nb[G.tf(i,tf)]=b[i];
  return{level:level,title:'Level '+level,size:GS,rows:G.rows(nb),target:G.tf(t.t,tf),type:t.type,k:t.k,par:t.k,sol:G.tf(t.sol,tf),tpl:G.tpl().indexOf(t),x:EXTRA.indexOf(t),parExact:true}}
window.V6LS={make:make,PLAN:PLAN};
var CSS=''
+'.ls .ls-board{position:relative;width:100%;aspect-ratio:1;border-radius:26px;background:var(--dk-board);box-shadow:inset 0 3px 10px rgba(0,0,0,.14),0 1px 0 rgba(255,255,255,.4)}'
+'.ls .ls-board>svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'
+'.ls .dk-top{gap:8px}.ls .ls-goal{display:inline-flex;align-items:center;justify-content:center;height:34px;padding:0 8px;border-radius:17px;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--line,#ddd)}.ls .ls-goal>svg{width:44px!important;height:32px!important;flex:none}'
+'.ls [data-zkc]{transform-box:fill-box;transform-origin:center}.ls .ls-in{transform-box:view-box;transform-origin:0 0}';
var GOALCAP='<svg viewBox="0 0 44 32" aria-hidden="true"><circle cx="22" cy="16" r="8" fill="#FFF8EA" stroke="#3B3226" stroke-width="2.4"/><circle cx="22" cy="4.5" r="4" fill="#1B1916" stroke="#fff" stroke-width="1.3"/><circle cx="22" cy="27.5" r="4" fill="#1B1916" stroke="#fff" stroke-width="1.3"/><circle cx="10.5" cy="16" r="4" fill="#1B1916" stroke="#fff" stroke-width="1.3"/><circle cx="33.5" cy="16" r="4" fill="#1B1916" stroke="#fff" stroke-width="1.3"/><path d="M18 12l8 8M26 12l-8 8" stroke="#E9A23B" stroke-width="2.6" stroke-linecap="round"/></svg>';
var GOALSAVE='<svg viewBox="0 0 44 32" aria-hidden="true"><path d="M22 2l11 4v8c0 8-5 13-11 16C16 27 11 22 11 14V6z" fill="#E9A23B" fill-opacity=".25" stroke="#E9A23B" stroke-width="2.4" stroke-linejoin="round"/><circle cx="22" cy="15" r="6.5" fill="#1B1916" stroke="#fff" stroke-width="1.5"/></svg>';
var ICO='<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M0 -9L9 0L0 9L-9 0Z" fill="#fff" stroke="#3B3226" stroke-width="2.4"/><circle r="2.6" fill="#E9A23B"/></svg>';
function P(c){return 30+60*c}
function stoneG(v,mark,ghost){var o=DK.sv('g'),g=DK.sv('g',{'class':'ls-in','data-zkc':''},o);
  if(v===1){DK.sv('circle',{r:25,fill:'#1B1916',stroke:'#fff','stroke-width':2.5},g);DK.sv('circle',{cx:-8,cy:-8,r:6,fill:'#fff',opacity:.18},g)}
  else{DK.sv('circle',{r:25,fill:'#FFF8EA',stroke:'#3B3226','stroke-width':3},g);DK.sv('circle',{r:15,fill:'none',stroke:'#3B3226','stroke-width':2,opacity:.5},g)}
  if(mark)DK.sv('path',{d:'M0 -9L9 0L0 9L-9 0Z',fill:v===1?'#fff':'#3B3226'},g);if(ghost)o.setAttribute('opacity','.55');return o}
function mount(root,inst,api){ZK.css(DK.BASECSS+CSS,'ls-css');root.textContent='';
  var rm=ZK.rm(api),L=DK.life(),b0=G.board(inst.rows),b=b0.slice(),prev=null,hist=[],bm=0,fin=false,busy=false,hints=0,undos=0,lastPt=-1,ghost=null,idle=null,pvp=-1,libsHint=false,showLibs=false,t=inst.target,k=inst.k,type=inst.type,i,p;
  showLibs=type==='save'||inst.level<=6;   /* 1.2.1: also on the first capture-in-2 (orig 6), as a bridge */
  var stage=DK.h('div','dk ls zk-stage zk-host'+(rm?' zk-rm':'')),top=DK.h('div','dk-top',null,null,stage);
  var ctr=ZK.counter({icon:ICO,zero:type==='cap',label:function(n){return n+' breathing space'+(n===1?'':'s')+' left'}}),pips=ZK.pips(k);var goal=DK.h('div','ls-goal',type==='cap'?GOALCAP:GOALSAVE,{role:'img','aria-label':type==='cap'?'Goal: capture the marked white group':'Goal: keep the marked dark group alive'});top.appendChild(goal);top.appendChild(ctr.el);
  var board=DK.h('div','ls-board zk-board',null,{role:'group','aria-label':'Board, 5 by 5'},stage),svg=DK.sv('svg',{viewBox:'-12 -12 324 324','aria-hidden':'true'},board);
  var gG=DK.sv('g',null,svg),gH=DK.sv('g',null,svg),gS=DK.sv('g',null,svg),gF=DK.sv('g',null,svg),btn=[];
  for(i=0;i<GS;i++){DK.sv('line',{x1:30,y1:P(i),x2:270,y2:P(i),stroke:'var(--dk-line)','stroke-width':2.2,'stroke-linecap':'round'},gG);DK.sv('line',{x1:P(i),y1:30,x2:P(i),y2:270,stroke:'var(--dk-line)','stroke-width':2.2,'stroke-linecap':'round'},gG)}
  for(p=0;p<25;p++)(function(p){var bt=DK.btn('Point','dk-pt');bt.style.left=((P(p%5)+12)/3.24)+'%';bt.style.top=((P(Math.floor(p/5))+12)/3.24)+'%';bt.style.width='18.5%';bt.style.height='18.5%';bt.style.margin='0';bt.style.transform='translate(-50%,-50%)';bt.style.borderRadius='14px';bt.onclick=function(){tap(p)};btn.push(bt);board.appendChild(bt)})(p);
  stage.appendChild(pips.el);root.appendChild(stage);
  function targetVal(){return type==='cap'?2:1}
  function tGroup(){return b[t]===targetVal()?G.groupOf(b,t):null}
  function xy(q){return[P(q%5),P(Math.floor(q/5))]}
  function marks(pvList){gH.textContent='';var g=tGroup();
    if(g){g.stones.forEach(function(q){var c=xy(q);DK.sv('circle',{cx:c[0],cy:c[1],r:31,fill:'none',stroke:'#E9A23B','stroke-width':3.5,'stroke-dasharray':'6 5','class':'dk-pulse'},gH)});
      if(showLibs||libsHint){var seen={};g.stones.forEach(function(q){NBR(q).forEach(function(n){if(b[n]===0&&!seen[n]){seen[n]=1;var c=xy(n);DK.sv('circle',{cx:c[0],cy:c[1],r:9,fill:'#E9A23B',stroke:'#7A4A00','stroke-width':2},gH)}})})}}
    if(!fin&&!busy)for(var q=0;q<25;q++)if(b[q]===0){var ok=G.play(b,q,1)&&!(prev&&G.play(b,q,1).join('')===prev.join(''));if(!ok){var c2=xy(q);DK.sv('path',{d:'M'+(c2[0]-6)+' '+(c2[1]-6)+'L'+(c2[0]+6)+' '+(c2[1]+6)+'M'+(c2[0]+6)+' '+(c2[1]-6)+'L'+(c2[0]-6)+' '+(c2[1]+6),stroke:'var(--dk-line)','stroke-width':3,'stroke-linecap':'round',opacity:.8},gH)}}}
  function NBR(q){var r=Math.floor(q/5),c=q%5,l=[];if(r>0)l.push(q-5);if(r<4)l.push(q+5);if(c>0)l.push(q-1);if(c<4)l.push(q+1);return l}
  var sEl={};
  function sync(pop){gS.textContent='';sEl={};for(p=0;p<25;p++)if(b[p]){var g=stoneG(b[p],p===t&&b[p]===targetVal()),c=xy(p);g.style.transform='translate('+c[0]+'px,'+c[1]+'px)';gS.appendChild(g);sEl[p]=g}
    marks();var gr=tGroup();ctr.set(gr?gr.libs:0,true);pips.set(bm);
    for(p=0;p<25;p++)btn[p].setAttribute('aria-label','Row '+(Math.floor(p/5)+1)+', column '+(p%5+1)+', '+(b[p]===1?'dark stone':b[p]===2?'white stone':'empty'));
    if(pop)for(var q in pop)if(sEl[q])ZK.anim(sEl[q].firstChild,[{transform:'translate(0,-16px) scale(.5)',opacity:0},{transform:'scale(1.14)',opacity:1,offset:.6},{transform:'scale(1)',opacity:1}],260,ZK.SPRING)}
  function D(ms){return rm?0:ms}
  function popOut(before,after,except){for(var q=0;q<25;q++)if(before[q]&&!after[q]&&q!==except){var c=xy(q),g=stoneG(before[q],false);g.style.transform='translate('+c[0]+'px,'+c[1]+'px)';gF.appendChild(g);
      (function(g,c){var a=ZK.anim(g.firstChild,[{transform:'scale(1)',opacity:1},{transform:'scale(1.25)',opacity:.8,offset:.4},{transform:'scale(.1)',opacity:0}],D(330),'ease-in');if(a)a.onfinish=function(){g.remove()};else g.remove();ZK.burst(stage,(c[0]+12)/324*stage.querySelector('.ls-board').offsetWidth,(c[1]+12)/324*stage.querySelector('.ls-board').offsetWidth+stage.querySelector('.ls-board').offsetTop,{n:8,r:30,colors:before[q]===2?['#FFF8EA','#E8D5B0']:['#3B3226','#8C7A5B']})})(g,c)}}
  function tap(q){if(fin||busy)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);ZK.stuck(stage,false);pvp=-1;gF.textContent='';
    var n=G.play(b,q,1);if(!n||(prev&&n.join('')===prev.join(''))){ZK.wrong(btn[q]);return}
    hist.push({b:b,prev:prev,bm:bm,last:lastPt});var before=b;b=n;prev=before;bm++;lastPt=q;api.moved();ZK.sfx('clack');ZK.buzz('move');
    sync({q:1});var removed=0;for(var z=0;z<25;z++)if(before[z]&&!b[z])removed++;if(removed){popOut(before,b,q);L.later(function(){ZK.sfx('pop');ZK.buzz('pop')},D(80))}
    if(type==='cap'&&b[t]!==2){return win()}
    var left=k-bm;
    if(type==='cap'&&left<1){return lose('Out of stones')}
    busy=true;var wr=G.whiteReply(type,b,before,type==='cap'?left:k-bm+1,t);
    L.later(function(){var b1=b;if(wr&&wr.i>=0){prev=b;b=wr.b;lastPt=-2;sync({});var wi=wr.i;
        if(sEl[wi])ZK.anim(sEl[wi].firstChild,[{transform:'translate(0,-16px) scale(.5)',opacity:0},{transform:'scale(1.14)',opacity:1,offset:.6},{transform:'scale(1)',opacity:1}],D(260),ZK.SPRING);
        ZK.sfx('clack');popOut(b1,b,wi)}else{prev=b}
      busy=false;
      if(type==='save'){if(b[t]!==1)return lose('Group lost');if(bm>=k)return win();return sync()}
      sync();if(!G.capAny(b,prev,k-bm,t))lose('The group holds')},D(wr&&wr.i>=0?420:200))}
  function lose(txt){busy=false;ZK.stuck(stage,true,{text:txt,onUndo:function(){ctl.undo()}})}
  function win(){fin=true;busy=false;ZK.stuck(stage,false);sync();ZK.sfx('cap');api.say('Solved.');L.later(function(){api.done({solved:true,moves:bm,hints:hints,undos:undos,extra:{par:inst.par,type:type,k:k}})},D(380))}
  var ctl={
    undo:function(){if(fin||!hist.length)return false;L.clear();DK.stopAnims(stage);busy=false;gF.textContent='';var h=hist.pop();b=h.b;prev=h.prev;bm=h.bm;lastPt=h.last;undos++;ZK.stuck(stage,false);ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);sync();return true},
    restart:function(){if(fin)return;L.clear();DK.stopAnims(stage);busy=false;gF.textContent='';hist=[];b=b0.slice();prev=null;bm=0;lastPt=-1;libsHint=false;ZK.stuck(stage,false);ZK.sfx('undo');ZK.unmark(stage);sync()},
    hint:function(lv){if(fin||busy)return null;var ms=G.winMoves(type,b,prev,k-bm,t);if(!ms.length)return 'This one cannot be won from here. Try Undo.';hints++;ZK.unmark(stage);
      if(lv<=1)return type==='cap'?'The amber dots are the group’s last breathing spaces.':'Count the amber dots. White wants to fill them.';
      if(lv===2){ZK.mark(btn[ms[0]]);return 'Try this point.'}
      tap(ms[0]);return 'Placed one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();L.destroy();root.textContent=''},
    lastEl:function(){return lastPt>=0?btn[lastPt]:btn[inst.sol]},
    state:function(){return{bm:bm,fin:fin,busy:busy,b:b.slice(),prev:prev}}};
  sync();idle=ZK.idle(stage,25000);
  if(inst.level===1){var sp=inst.sol;ghost=ZK.ghost(stage,[{tap:btn[sp],hold:1100,down:function(){var c=xy(sp),g=stoneG(1,false,true);g.style.transform='translate('+c[0]+'px,'+c[1]+'px)';gF.appendChild(g)},up:function(){},cancel:function(){gF.textContent=''}}],{id:ID,level:1})}
  return ctl}
ZK.override({id:ID,name:'Living Stones',family:'grid',theme:'F9',calm:true,
  blurb:'Capture a group of stones, or keep yours alive, on a tiny board.',
  how:'Place dark stones. Capture the marked white group, or keep the marked dark group alive.',
  areas:['space','flex'],levels:38,secs:75,make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:(inst.type==='cap'?'Captured':'Saved')+' in '+m+' stone'+(m===1?'':'s')+'. It can be done in '+p+'.'}}});
})();
