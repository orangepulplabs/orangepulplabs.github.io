/* Zest v6 batch d: Seed Pits. Overrides the puzzles_d9.js entry through ZK.override (the original stays in ZK.orig).
   Rule: a ring of 14 pits. Pick a pit, lift its seeds and sow them one per pit round the ring. If the LAST seed lands in a pit that already had seeds, capture that pit.
   Capture the target number. Kept: the sowing rule, the exact search (PZD9.sp.sow / best / solve). Changed: the ring is drawn as two rows of 7 round pits with a
   loop track and seeds as dots; sowing animates one seed at a time with a rising tick; press-and-hold previews the path and where the last seed lands (green ring and +N
   when it captures); the counter shows seeds still to capture; a par table with breathers (1,1,1,2,1,2,...,4) replaces 3 flat bands; from level 5 the greedy pick
   (the biggest immediate capture) is usually NOT the winning first pick. A 'no seeds left' chip with Undo is the stuck signal. */
(function(){
var ID='seed-pits',SP=PZD9.sp,N=14;
var PAR=[1,1,1,2,1,2,2,2,2,3,2,3,3,3,3,2,3,3,3,4,3,4,4,4,3,4,4,4,4,4];
function bestFirst(p,cap,target,d){var o=[],bi=-1,bc=-1,gr=[];for(var i=0;i<N;i++)if(p[i]){var r=SP.sow(p,i);if(r.cap>bc){bc=r.cap;gr=[i]}else if(r.cap===bc)gr.push(i);
  var s=SP.solve(r.p,cap+r.cap,target,d-1);if(s&&s.d<=d-1)o.push(i)}return{opt:o,greedy:gr}}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var d=PAR[level-1],hi=3+Math.floor((level-1)*4/29),att,p,i,best=null,cnt=0;
  for(att=0;att<160;att++){p=[];for(i=0;i<N;i++)p.push(pzInt(rng,hi+1));if(p.filter(function(x){return x>0}).length<7)continue;
    var bst=SP.best(p,d);if(!(bst[d]>bst[d-1]&&bst[d]>=3))continue;
    var bf=bestFirst(p,0,bst[d],d),sc=(level>=5&&d>=2&&bf.opt.length&&bf.greedy.some(function(g){return bf.opt.indexOf(g)>=0})?2:0)+(bf.opt.length>3?1:0);
    if(!best||sc<best.sc)best={sc:sc,p:p,t:bst[d]};cnt++;if(sc===0||cnt>=12)break}
  if(best)return{level:level,title:'Level '+level,pits:best.p,target:best.t,par:d,parExact:true};
  var f=[3,3,3,3,3,3,3,3,3,3,3,3,3,3];return{level:level,title:'Level '+level,pits:f,target:SP.best(f,1)[1],par:1,parExact:true}}
window.V6SP={make:make,PAR:PAR,bestFirst:bestFirst};
var CSS=''
+'.sp .sp-board{position:relative;width:auto;height:min(60vh,520px);max-width:100%;aspect-ratio:150/336;border-radius:26px;background:var(--dk-board);box-shadow:inset 0 3px 10px rgba(0,0,0,.14),0 1px 0 rgba(255,255,255,.4)}'
+'.sp .sp-board>svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'
+'.sp [data-zkc]{transform-box:fill-box;transform-origin:center}'
+'.sp .sp-pt{border-radius:50%;margin:0;transform:translate(-50%,-50%);width:30%;height:13.4%}'
/* 4 Nov level-review fixes: the store fills toward the target line (was a bare number), every pit prints its count, and the board stands in two columns so pits reach about 60 px */
+'.sp-store{display:flex;align-items:center;gap:10px;font:800 1rem/1 var(--font);color:var(--ink);font-variant-numeric:tabular-nums}'
+'.sp-jar{position:relative;width:170px;height:22px;border-radius:11px;background:var(--surface,#fff);box-shadow:inset 0 0 0 2px var(--dk-line);overflow:hidden}'
+'.sp-jar i{position:absolute;left:0;top:0;bottom:0;width:0;background:#8A5A2B;border-radius:11px;transition:width .35s cubic-bezier(.34,1.3,.64,1)}.sp-jar b{position:absolute;right:0;top:-2px;bottom:-2px;width:3px;background:#2F9E5B}'
+'.sp-store.ok .sp-jar i{background:#2F9E5B}.zk-rm .sp-jar i{transition:none}@media (max-width:359px){.sp-jar{width:130px}}';
var ICO='<svg viewBox="-12 -12 24 24" aria-hidden="true"><ellipse rx="6" ry="9" transform="rotate(35)" fill="#8A5A2B" stroke="#4A2E12" stroke-width="2"/></svg>';
function C(i){return i<7?[44,24+i*48]:[108,24+(13-i)*48]}   /* two columns: down the left, up the right */
function mount(root,inst,api){ZK.css(DK.BASECSS+CSS,'sp-css');root.textContent='';
  var rm=ZK.rm(api),L=DK.life(),p=inst.pits.slice(),cap=0,hist=[],picks=0,fin=false,busy=false,hints=0,undos=0,lastPt=-1,ghost=null,idle=null,i,T=inst.target;
  var stage=DK.h('div','dk sp zk-stage zk-host'+(rm?' zk-rm':'')),top=DK.h('div','dk-top',null,null,stage);
  var ctr=ZK.counter({icon:ICO,label:function(k){return k===0?'Target captured':k+' seeds still to capture'}}),pips=ZK.pips(inst.par);var store=DK.h('div','sp-store',null,{role:'img'},top),jar=DK.h('span','sp-jar','<i></i><b></b>',null,store),stx=DK.h('span','sp-st',null,null,store);
  function storeSet(){var f=Math.min(1,cap/T);jar.firstChild.style.width=(f*100)+'%';stx.textContent=cap+' / '+T;store.classList.toggle('ok',cap>=T);store.setAttribute('aria-label',cap+' of '+T+' seeds captured')}
  var board=DK.h('div','sp-board zk-board',null,{role:'group','aria-label':'Ring of 14 pits'},stage),svg=DK.sv('svg',{viewBox:'0 0 150 336','aria-hidden':'true'},board);
  var gT=DK.sv('g',null,svg),gP=DK.sv('g',null,svg),gS=DK.sv('g',null,svg),gV=DK.sv('g',null,svg),gF=DK.sv('g',null,svg),btn=[],pit=[];
  var x0=C(0),x6=C(6),x7=C(7),x13=C(13);
  DK.sv('path',{d:'M44 24V312Q44 336 76 336Q108 336 108 312V24Q108 0 76 0Q44 0 44 24Z',fill:'none',stroke:'var(--dk-line)','stroke-width':2.5,'stroke-dasharray':'2 8','stroke-linecap':'round',opacity:.7},gT);
  DK.sv('path',{d:'M70 330l8 4-8 4zM82 2l-8 4 8 4z',fill:'var(--dk-line)',opacity:.85},gT);
  for(i=0;i<N;i++){var c=C(i);pit.push(DK.sv('ellipse',{cx:c[0],cy:c[1],rx:20,ry:20,fill:'var(--dk-tri,rgba(255,255,255,.4))',stroke:'var(--dk-line)','stroke-width':2.5,'data-zkc':''},gP))}
  for(i=0;i<N;i++)(function(k){var b=DK.btn('Pit '+(k+1),'dk-pt sp-pt');var c=C(k);b.style.left=(c[0]/150*100)+'%';b.style.top=(c[1]/336*100)+'%';b.onclick=function(){tap(k)};btn.push(b);board.appendChild(b)})(i);
  stage.appendChild(pips.el);root.appendChild(stage);
  function seedPos(k,n){var c=C(k),o=[],r=n>1?(n>5?11:7):0;for(var s=0;s<n;s++){var a=s*2.4+.4,rr=n===1?0:s<6?r:r*.4;o.push([c[0]+Math.cos(a)*(s>=6?4:rr),c[1]+Math.sin(a)*(s>=6?4:rr)])}return o}
  function drawPit(k){var g=gS.querySelector('[data-p="'+k+'"]');if(g)g.remove();g=DK.sv('g',{'data-p':k},gS);var n=p[k];
    seedPos(k,Math.min(n,9)).forEach(function(q,j){DK.sv('ellipse',{cx:q[0],cy:q[1],rx:4.6,ry:6.4,transform:'rotate('+((j*47)%90-20)+' '+q[0]+' '+q[1]+')',fill:'#8A5A2B',stroke:'#4A2E12','stroke-width':1.6},g)});
    var ck=C(k),t=DK.sv('text',{x:ck[0]+(k<7?-31:31),y:ck[1]+5,'font-size':14,'font-weight':800,'text-anchor':'middle',fill:'var(--dk-ink)','font-family':'sans-serif',opacity:n?1:.45},g);t.textContent=n;   /* the count, printed beside every pit */
    btn[k].setAttribute('aria-label','Pit '+(k+1)+', '+n+' seed'+(n===1?'':'s'));pit[k].setAttribute('stroke-dasharray',n?'':'4 4')}
  function all(){gS.textContent='';for(var k=0;k<N;k++)drawPit(k);ctr.set(Math.max(0,T-cap),true);storeSet();pips.set(picks);ZK.stuck(stage,false);
    if(!fin&&!busy&&!p.some(function(x){return x>0}))ZK.stuck(stage,true,{text:'No seeds left',onUndo:function(){ctl.undo()}})}
  function D(ms){return rm?0:ms}
  function clearPv(){gV.textContent=''}
  function preview(k){clearPv();if(fin||busy||!p[k])return;var r=SP.sow(p,k),n=p[k],pos=k;
    for(var s=0;s<n;s++){pos=(pos+1)%N;var c=C(pos);DK.sv('circle',{cx:c[0],cy:c[1]-0,r:6,fill:'#E9A23B',stroke:'#7A4A00','stroke-width':1.5,opacity:.95},gV)}
    var lc=C(r.last);DK.sv('circle',{cx:lc[0],cy:lc[1],r:25,fill:'none',stroke:r.cap?'#2F9E5B':'var(--dk-line)','stroke-width':4,'stroke-dasharray':r.cap?'':'5 4'},gV);
    if(r.cap){var t=DK.sv('text',{x:lc[0],y:lc[1]-26,'font-size':15,'font-weight':800,'text-anchor':'middle',fill:'#1F7A44','font-family':'sans-serif',stroke:'var(--dk-board)','stroke-width':4,'paint-order':'stroke'},gV);t.textContent='+'+r.cap}}
  L.on(board,'pointerdown',function(e){var b=e.target.closest&&e.target.closest('.sp-pt');if(!b||fin||busy)return;var k=btn.indexOf(b);if(k>=0&&p[k]){ZK.sfx('press');preview(k)}});
  L.on(document,'pointerup',clearPv);L.on(document,'pointercancel',clearPv);
  function tap(k){if(fin||busy)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);clearPv();if(!p[k]){ZK.wrong(btn[k]);return}
    hist.push({p:p.slice(),cap:cap,picks:picks,last:lastPt});picks++;lastPt=k;api.moved();pips.set(picks);busy=true;
    var n=p[k],r=SP.sow(p,k),pos=k,s;p[k]=0;drawPit(k);ZK.sfx('lift');ZK.buzz('tap');var step=D(115);
    for(s=0;s<n;s++)(function(s){var from=pos,to=(pos+s+1)%N,fp=s===0?k:(k+s)%N;
      L.later(function(){p[to]++;drawPit(to);var f=C(fp),t=C(to);if(!rm){var d=DK.sv('ellipse',{cx:0,cy:0,rx:4.6,ry:6.4,fill:'#8A5A2B',stroke:'#4A2E12','stroke-width':1.6},gF);var a=d.animate([{transform:'translate('+f[0]+'px,'+f[1]+'px)'},{transform:'translate('+t[0]+'px,'+(t[1]-14)+'px)',offset:.5},{transform:'translate('+t[0]+'px,'+t[1]+'px)'}],{duration:step*.9+20,easing:'ease-out'});a.onfinish=function(){d.remove()}}
        ZK.sfx('click',{p:s});if(!rm)ZK.anim(pit[to],[{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],160)},s*step)})(s);
    L.later(function(){if(r.cap){cap+=r.cap;var lc=C(r.last),bb=ZK.at(stage,btn[r.last]);p[r.last]=0;drawPit(r.last);ZK.burst(stage,bb.x,bb.y,{n:12,r:42,colors:['#8A5A2B','#E9A23B','#F6B73C']});ZK.sfx('pop');ZK.buzz('pop')}
      ctr.set(Math.max(0,T-cap));storeSet();busy=false;
      if(cap>=T){fin=true;ZK.sfx('cap');api.say('Captured the target.');L.later(function(){api.done({solved:true,moves:picks,hints:hints,undos:undos,extra:{par:inst.par,target:T}})},D(250))}
      else all()},n*step+D(60))}
  function restore(h){L.clear();DK.stopAnims(stage);gF.textContent='';busy=false;p=h.p.slice();cap=h.cap;picks=h.picks;lastPt=h.last;clearPv();all()}
  var ctl={
    undo:function(){if(fin||!hist.length)return false;restore(hist.pop());undos++;ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);return true},
    restart:function(){if(fin)return;hist=[];restore({p:inst.pits,cap:0,picks:0,last:-1});ZK.sfx('undo');ZK.unmark(stage)},
    hint:function(lv){if(fin||busy)return null;var s=SP.solve(p,cap,T,Math.max(1,inst.par-picks+2));if(!s)return 'Out of reach from here. Try Undo.';hints++;ZK.unmark(stage);var k=s.path[0];
      if(lv<=1)return 'Press and hold a pit to see where its last seed lands.';
      if(lv===2){ZK.mark(btn[k]);return 'Try this pit.'}
      tap(k);return 'Picked one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();L.destroy();root.textContent=''},
    lastEl:function(){return lastPt>=0?btn[lastPt]:null},
    state:function(){return{p:p.slice(),cap:cap,picks:picks,fin:fin,busy:busy}}};
  all();idle=ZK.idle(stage,25000);
  if(inst.level===1){var s0=SP.solve(p,0,T,2);if(s0){var k0=s0.path[0];ghost=ZK.ghost(stage,[{tap:btn[k0],hold:1300,down:function(){preview(k0)},up:clearPv,cancel:clearPv}],{id:ID,level:1})}}
  return ctl}
ZK.override({id:ID,name:'Seed Pits',family:'move',theme:'F9',calm:true,
  blurb:'Sow seeds round a ring of pits and capture a target number.',
  how:'Tap a pit to sow its seeds round the ring. A last seed in a pit with seeds captures it.',
  areas:['flex','space'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'Captured '+inst.target+' in '+m+' pick'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
