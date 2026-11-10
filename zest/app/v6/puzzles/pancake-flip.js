/* Zest v6 new puzzle (batch f): Pancake Flip. A NEW id (new core for the cut few-swaps: prefix reversal instead of swaps).
   Rule: tap a pancake and the spatula flips it and everything above it in one turn. Sort the stack, biggest at the bottom, in the fewest flips.
   From level 16 (a new board) the pancakes have a toasted side, and every toasted side must end facing down (Gates and Papadimitriou's
   burnt-pancake variant). A flip turns each flipped pancake over, so on those boards the top pancake alone can be flipped too.
   Levels are CURATED by tests/batch_f_gen_pancake.js: exact par by BFS over every stack (plain n<=9, burnt n<=6). Aha filter: from level 4
   the "biggest to the top, then down" plan costs at least one flip more than par AND its first flip is not on any shortest route; from 10 it
   costs at least two more. Ties prefer stacks where a "join two neighbours" player also misses par, then stacks with fewer best first flips.
   No dead ends exist (every flip undoes itself), so there is no stuck chip; idle 25 s glows Hint. Hints use IDA* with the break-count
   heuristic (each flip changes one neighbour pair, so it is admissible), instant for these sizes.
   No text on the board: dashed outlines behind the stack show the finished pyramid (and, on burnt boards, a dark line where the toasted side
   goes). A pancake that fits its outline loses the dash; the settled bottom run shines. */
(function(){
var ID='pancake-flip';
var LEVELS=[[[3,2,1],1,0],[[3,1,2],2,0],[[2,1,4,3],3,0],[[4,3,2,5,1],3,0],[[2,3,1,5,4],4,0],[[2,1,6,5,3,4],4,0],[[5,4,2,6,1,3],5,0],[[1,5,3,6,4,2],6,0],[[1,5,2,3,6,4],5,0],[[5,4,2,6,3,7,1],6,0],[[2,7,4,1,6,3,5],7,0],[[1,7,5,6,2,4,3],6,0],[[1,3,7,5,2,6,4],8,0],[[2,4,8,3,7,1,5,6],7,0],[[6,4,7,1,3,8,2,5],8,0],[[-2,3,1],4,1],[[-3,1,-4,2],5,1],[[-2,-3,-1,-4],6,1],[[1,8,5,3,7,2,4,6],8,0],[[4,3,2,1],7,1],[[6,3,9,2,7,8,4,1,5],8,0],[[-3,1,-4,-5,2],7,1],[[2,7,1,8,5,9,4,6,3],9,0],[[-2,3,1,-4,-5],8,1],[[6,3,7,1,5,2,8,4],9,0],[[5,4,3,2,1],9,1],[[1,7,4,9,6,3,8,5,2],10,0],[[-1,-6,5,-2,-3,4],9,1],[[-3,-4,-5,-6,2,1],10,1],[[8,4,1,6,2,9,5,7,3],10,0]]; /*LEVELS*/
function flip(a,k,burnt){var b=a.slice();for(var i=0;i<k;i++)b[i]=burnt?-a[k-1-i]:a[k-1-i];return b}
function sorted(a){for(var i=0;i<a.length;i++)if(a[i]!==i+1)return false;return true}
function breaks(a,burnt){var n=a.length,c=0;for(var i=0;i<n;i++){var x=a[i],y=i+1<n?a[i+1]:n+1;if(burnt?(y-x!==1):(Math.abs(x-y)!==1))c++}return c}
/* IDA*: a shortest list of flips (k = how many from the top) */
function solve(a,burnt,cap){var n=a.length,path=[],lo=burnt?1:2,nodes=0;cap=cap||2e6;
  function dfs(s,g,bound,pk){var h=breaks(s,burnt);if(h===0)return sorted(s)?true:g+1;var f=g+h;if(f>bound)return f;if(++nodes>cap)return Infinity;var min=Infinity;
    for(var k=lo;k<=n;k++){if(k===pk)continue;path.push(k);var r=dfs(flip(s,k,burnt),g+1,bound,k);if(r===true)return true;path.pop();if(r<min)min=r}return min}
  if(sorted(a))return [];var bound=breaks(a,burnt);if(bound===0)bound=1;for(var it=0;it<40;it++){path=[];var r=dfs(a,0,bound,0);if(r===true)return path.slice();if(r===Infinity)return null;bound=r}return null}
function make(level,rng){level=Math.max(1,Math.min(LEVELS.length,level|0||1));var L=LEVELS[level-1];
  return{level:level,title:'Level '+level,stack:L[0].slice(),n:L[0].length,par:L[1],burnt:!!L[2],parExact:true}}
window.V6PF={make:make,flip:flip,solve:solve,sorted:sorted,breaks:breaks,levels:function(){return LEVELS}};

var CSS=''
+'.pf{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);'
+'--pf-board:#E9D7B9;--pf-board2:#DCC59F;--pf-grain:rgba(120,80,40,.08);--pf-plate:#FBF8F2;--pf-plate2:#D9D2C6;--pf-cake1:#F6CF7E;--pf-cake2:#DFA247;--pf-rim:#A8691F;--pf-toast:#6B3B14;--pf-out:rgba(110,70,30,.42);--pf-home:#2E9E5B}'
+':root[data-theme="dark"] .pf{--pf-board:#2E2720;--pf-board2:#241E18;--pf-grain:rgba(255,230,200,.04);--pf-plate:#4A443D;--pf-plate2:#2F2A25;--pf-cake1:#F2C46C;--pf-cake2:#C98A33;--pf-rim:#8A5414;--pf-toast:#4A2509;--pf-out:rgba(255,225,180,.38);--pf-home:#5BD08A}'
+'.pf-b{position:relative;width:100%;box-sizing:border-box;border-radius:24px;background:repeating-linear-gradient(92deg,var(--pf-grain) 0 3px,transparent 3px 14px),linear-gradient(170deg,var(--pf-board),var(--pf-board2));box-shadow:inset 0 2px 6px rgba(0,0,0,.14);touch-action:manipulation;user-select:none;-webkit-user-select:none;overflow:hidden}'
+'.pf-plate{position:absolute;left:4%;right:4%;height:18px;border-radius:50%/60%;background:radial-gradient(ellipse at 50% 30%,var(--pf-plate),var(--pf-plate2));box-shadow:0 4px 8px rgba(0,0,0,.18),inset 0 -2px 0 rgba(0,0,0,.08)}'
+'.pf-o{position:absolute;left:50%;box-sizing:border-box;border:2px dashed var(--pf-out);border-radius:999px;transform:translateX(-50%);transition:opacity .2s;pointer-events:none}'
+'.pf-o.burnt{border-bottom:4px solid var(--pf-out)}'
+'.pf-o.fit{opacity:0}'
+'.pf-c{position:absolute;left:50%;top:0;box-sizing:border-box;border-radius:999px;background:linear-gradient(180deg,var(--pf-cake1) 0 40%,var(--pf-cake2));box-shadow:inset 0 -3px 0 var(--pf-rim),inset 0 2px 0 rgba(255,255,255,.45),0 2px 3px rgba(60,30,5,.25);pointer-events:none;will-change:transform}'
+'.pf-c{overflow:hidden}.pf-c i{position:absolute;left:0;right:0;height:40%;background:repeating-linear-gradient(90deg,var(--pf-toast) 0 10px,#8B5220 10px 13px);display:none}'
+'.pf.burnt .pf-c i{display:block}.pf-c i.dn{bottom:0}.pf-c i.up{top:0}'
+'.pf-c.home{box-shadow:inset 0 -3px 0 var(--pf-rim),inset 0 2px 0 rgba(255,255,255,.45),0 2px 3px rgba(60,30,5,.25),0 0 0 2px var(--pf-home)}'
+'.pf-c.lift{transition:translate .12s ease-out;translate:0 -6px}'
+'.pf-r{all:unset;position:absolute;left:0;right:0;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent;z-index:3}'
+'.pf-r:focus-visible{outline:3px solid var(--ink);outline-offset:-3px;border-radius:14px}'
+'.pf-r.zk-mark{border-radius:16px;outline-offset:-2px}'
+'.pf-sp{position:absolute;right:-6px;width:46%;height:22px;pointer-events:none;z-index:4;opacity:0;transform:translateX(60%);transition:transform .14s ease-out,opacity .1s}'
+'.pf-sp.on{opacity:1;transform:translateX(0)}'
+'.pf-sp svg{width:100%;height:100%;display:block}'
+'.pf-bt{position:absolute;left:50%;width:30px;height:12px;margin-left:-15px;border-radius:4px;background:#FFE58A;box-shadow:inset 0 -2px 0 #E2BE45,0 1px 2px rgba(0,0,0,.2);pointer-events:none;z-index:5;opacity:0}'
+'.zk-rm .pf-sp,.zk-rm .pf-c.lift{transition:none}@media (prefers-reduced-motion:reduce){.pf-sp,.pf-c.lift{transition:none}}';
var SPAT='<svg viewBox="0 0 180 22" preserveAspectRatio="none" aria-hidden="true"><rect x="70" y="8" width="110" height="7" rx="3.5" fill="#6B4A2B" stroke="#1B1916" stroke-width="1.6"/><path d="M2 6h74v11H2c-1.2 0-2-.8-2-2V8c0-1.2.8-2 2-2z" fill="#C9CDD1" stroke="#1B1916" stroke-width="1.6"/><path d="M14 9h50M14 14h50" stroke="#9AA0A6" stroke-width="1.4"/></svg>';

function mount(root,inst,api){ZK.css(CSS,'pf-css');root.textContent='';
  var n=inst.n,burnt=inst.burnt,rm=ZK.rm(api),a=inst.stack.slice(),hist=[],hints=0,undos=0,fin=false,busy=false,last=null,idle=null,ghost=null,offs=[],press=-1,settled=0;
  var RH=n<=6?50:n<=7?46:44,TH=Math.round(RH*.72),PAD=n>=8?34:48,PLATE=22,H=PAD+n*RH+PLATE+8;
  var stage=document.createElement('div');stage.className='pf zk-stage zk-host'+(burnt?' burnt':'')+(rm?' zk-rm':'');
  var b=document.createElement('div');b.className='pf-b zk-board';b.style.height=H+'px';b.setAttribute('role','group');b.setAttribute('aria-label','Stack of '+n+' pancakes');
  var plate=document.createElement('div');plate.className='pf-plate';plate.style.top=(PAD+n*RH+2)+'px';b.appendChild(plate);
  function wpc(s){return 36+58*(s-1)/Math.max(1,n-1)}   /* width % of the board for size s (1..n) */
  function rowTop(i){return PAD+i*RH+(RH-TH)}         /* pancakes rest on the one below: row i (0 = top) */
  var outs=[],cakes={},rows=[],sp=document.createElement('div'),bt=document.createElement('div');
  for(var i=0;i<n;i++){var o=document.createElement('div');o.className='pf-o'+(burnt?' burnt':'');o.style.width=wpc(i+1)+'%';o.style.height=TH+'px';o.style.top=rowTop(i)+'px';b.appendChild(o);outs.push(o)}
  for(var s=1;s<=n;s++){var c=document.createElement('div');c.className='pf-c';c.setAttribute('data-zkc','');c.style.width=wpc(s)+'%';c.style.height=TH+'px';c.style.marginLeft=(-wpc(s)/2)+'%';
    c.innerHTML='<i></i>';b.appendChild(c);cakes[s]=c}
  sp.className='pf-sp';sp.innerHTML=SPAT;b.appendChild(sp);bt.className='pf-bt';b.appendChild(bt);
  for(var r=0;r<n;r++)(function(r){var e=document.createElement('button');e.type='button';e.className='pf-r';e.style.top=(PAD+r*RH)+'px';e.style.height=RH+'px';
    e.onclick=function(){tapRow(r)};rows.push(e);b.appendChild(e)})(r);
  var pips=ZK.pips(inst.par);
  stage.appendChild(b);stage.appendChild(pips.el);root.appendChild(stage);
  function home(i){return a[i]===i+1}
  function settledCount(){var k=0;for(var i=n-1;i>=0;i--){if(home(i))k++;else break}return k}
  function paint(){for(var i=0;i<n;i++){var v=a[i],sz=Math.abs(v),c=cakes[sz];c.style.transform='translateY('+rowTop(i)+'px)';c.style.transformOrigin='';
      var t=c.firstChild;t.className=v>0?'dn':'up';c.classList.toggle('home',i>=n-settled);outs[i].classList.toggle('fit',home(i));
      rows[i].setAttribute('aria-label','Pancake '+sz+' of '+n+', '+(i===0?'top':'row '+(i+1))+(burnt?(v>0?', toasted side down':', toasted side up'):'')+(home(i)?', fits':'')+'. Flip from here')}}
  function L(tg,ty,fn,o){tg.addEventListener(ty,fn,o);offs.push(function(){tg.removeEventListener(ty,fn,o)})}
  /* press preview: the spatula slides under the pancake and the part that will flip lifts */
  function preview(r){unpreview();press=r;sp.style.top=(PAD+(r+1)*RH-11)+'px';sp.classList.add('on');for(var i=0;i<=r;i++)cakes[Math.abs(a[i])].classList.add('lift');ZK.sfx('press')}
  function unpreview(){press=-1;sp.classList.remove('on');for(var s=1;s<=n;s++)cakes[s].classList.remove('lift')}
  L(b,'pointerdown',function(e){if(fin||busy)return;var el=e.target.closest&&e.target.closest('.pf-r');if(!el)return;preview(rows.indexOf(el))});
  L(document,'pointerup',function(){if(press>=0)setTimeout(unpreview,0)});L(document,'pointercancel',function(){unpreview()});
  L(b,'pointerleave',function(){if(press>=0)unpreview()});
  function doFlip(k,o){o=o||{};var grp=a.slice(0,k),cy=PAD+(RH-TH)+(k*RH-(RH-TH))/2-RH*0+0,dur=rm?0:(o.fast?220:340+k*12),lift=Math.min(PAD-6,22+k*4);
    cy=rowTop(0)+(rowTop(k-1)+TH-rowTop(0))/2;
    a=flip(a,k,burnt);busy=true;ZK.unmark(stage);unpreview();
    var els=grp.map(function(v){return cakes[Math.abs(v)]});
    if(!rm){ZK.sfx('lift');sp.style.top=(PAD+k*RH-11)+'px';sp.classList.add('on');
      ZK.anim(sp,[{transform:'translateX(0) rotate(0)'},{transform:'translateX(-4%) translateY(-10px) rotate(-6deg)',offset:.35},{transform:'translateX(0) rotate(0)'}],dur*.8,ZK.EASE);
      els.forEach(function(c,j){var y=rowTop(j);c.style.transformOrigin='50% '+(cy-y)+'px';
        ZK.anim(c,[{transform:'translateY('+y+'px) rotate(0deg)'},{transform:'translateY('+(y-lift)+'px) rotate(90deg) scaleX(.42)',offset:.45},{transform:'translateY('+(y-6)+'px) rotate(176deg) scaleX(.96)',offset:.82},{transform:'translateY('+y+'px) rotate(180deg)'}],dur,'cubic-bezier(.3,.1,.3,1)')})}
    setTimeout(function(){var s0=settled;settled=settledCount();paint();sp.classList.remove('on');busy=false;
      if(!rm)els.forEach(function(c){ZK.anim(c,[{scale:'1 1'},{scale:'1.04 .82'},{scale:'1 1'}],220,ZK.SPRING)});
      ZK.sfx('thud',{k:k});ZK.buzz('move');
      if(settled>s0&&!o.undo){var top=cakes[Math.abs(a[n-settled])];ZK.anim(top,[{filter:'brightness(1)'},{filter:'brightness(1.25)'},{filter:'brightness(1)'}],380);ZK.sfx('cap',{n:Math.min(8,settled)})}
      if(sorted(a)&&!fin&&!o.undo)win();
      if(o.then)o.then()},dur+10);
    last=els[0]||null}
  function win(){fin=true;api.say('Sorted.');var top=cakes[1],y=rowTop(0)-12;bt.style.top=y+'px';
    if(!rm){ZK.anim(bt,[{transform:'translateY(-70px)',opacity:0},{transform:'translateY(0)',opacity:1,offset:.6},{transform:'translateY(2px) scaleY(.8)',opacity:1,offset:.8},{transform:'translateY(0)',opacity:1}],320,'ease-in',0,'forwards');ZK.sfx('drop')}
    else bt.style.opacity=1;last=top;
    setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:100)}
  function tapRow(r){if(fin||busy)return;var k=r+1;if(!burnt&&k===1){unpreview();ZK.wrong(cakes[Math.abs(a[0])]);return}
    if(ghost){ghost.stop();ghost=null}ZK.ghostDone(ID+(burnt?'-b':''));
    hist.push(k);api.moved();pips.set(hist.length);doFlip(k)}
  L(b,'keydown',function(e){if(e.key==='Escape')unpreview()});
  settled=settledCount();paint();pips.set(0);
  idle=ZK.idle(stage,25000);
  /* demo: level 1 (and the first burnt board) shows the spatula going under the right pancake */
  if(inst.level===1||(burnt&&inst.level===firstBurnt())){var plan=solve(a,burnt)||[2];var gr=rows[plan[0]-1];
    ghost=ZK.ghost(stage,[{tap:gr,down:function(){preview(plan[0]-1)},up:function(){unpreview()},hold:1100}],{id:ID+(burnt?'-b':''),level:1})}
  function firstBurnt(){for(var i=0;i<LEVELS.length;i++)if(LEVELS[i][2])return i+1;return -1}
  return{undo:function(){if(fin||busy||!hist.length)return false;var k=hist.pop();undos++;pips.set(hist.length);doFlip(k,{undo:true,fast:true});ZK.sfx('undo');return true},
    restart:function(){if(fin)return;a=inst.stack.slice();hist=[];settled=settledCount();paint();pips.set(0);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var p=solve(a,burnt);ZK.unmark(stage);if(!p||!p.length)return null;hints++;var k=p[0];
      if(lv<=1){ZK.mark(rows[0]);var left=p.length;return left===1?'One flip does it.':'A flip keeps the pancakes above the spatula together. '+left+' flips can finish it.'}
      if(lv===2){ZK.mark(rows[k-1]);return k===1?'Turn the top one over.':'Slide the spatula under this one.'}
      hist.push(k);api.moved();pips.set(hist.length);doFlip(k);return 'Flipped for you.'},
    destroy:function(){if(idle)idle.stop();if(ghost)ghost.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{stack:a.slice(),moves:hist.length,fin:fin,busy:busy}}}}

ZK.override({id:ID,name:'Pancake Flip',family:'move',theme:'F10',blurb:'Flip the stack with a spatula until it is sorted.',
  how:'Tap a pancake to flip it and all above it. Sort the stack, biggest at the bottom, in few flips.',
  areas:['space','control'],levels:30,secs:60,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'Sorted in '+m+' flip'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
