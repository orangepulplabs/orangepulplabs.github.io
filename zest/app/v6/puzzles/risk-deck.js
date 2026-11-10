/* Zest v6 batch d: Risk Deck. Overrides the puzzles_c4.js entry through ZK.override (the original stays in ZK.orig).
   Rule: four fixed decks. Each card wins some points and may lose some; a card's net is won minus lost. Draw all your cards and finish with as many points as you can.
   Kept: the idea of the schedules (made up for Zest: 'bold' decks pay big but lose more over a block, 'mild' decks pay small and win over a block; two of each lose often with small
   losses or rarely with big ones) and the exact best-single-deck / best-mix totals (PZC4.riskOpt). Changed: SHORT (10, 15 or 20 cards in blocks of 5, was 20 to 60), and a decision on
   every draw: each deck shows its running average per card as a bar and a number, the card flips with its gain and loss, and the score rolls. Stars: points against the best single
   deck. Undo takes back the last draw (the cards are fixed, so nothing new is learned by undoing). No instruction text. */
(function(){
var ID='risk-deck';
var NS=[10,10,10,10,15,10,15,15,10,15,15,15,10,15,15,20,15,15,20,15,20,20,15,20,20,20,15,20,20,20];
function nOf(level){return NS[Math.max(1,Math.min(30,level|0||1))-1]}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var n=nOf(level),B=5,gap=Math.round(15-(level-1)*7/29),used={};
  var kinds=pzShuffle([{bold:1,often:1},{bold:1,often:0},{bold:0,often:1},{bold:0,often:0}],rng);
  var decks=kinds.map(function(k){var w=k.bold?8+pzInt(rng,3):4+pzInt(rng,3),d=gap-2+pzInt(rng,5);while(used[k.bold?-d:d])d++;used[k.bold?-d:d]=1;
    var loss=k.bold?B*w+d:B*w-d,cards=[],b,j,i;
    for(b=0;b<n/B;b++){var kc=k.often?2+pzInt(rng,2):1,pos=pzShuffle([0,1,2,3,4],rng).slice(0,kc),wt=[],ws=0,parts=[],rem=loss-kc,left;
      for(i=0;i<kc;i++){wt.push(1+pzInt(rng,3));ws+=wt[i]}
      left=rem;for(i=0;i<kc;i++){var add=Math.floor(rem*wt[i]/ws);parts.push(1+add);left-=add}parts[0]+=left;
      for(j=0;j<B;j++){var at=pos.indexOf(j);cards.push([w,at>=0?parts[at]:0])}}
    var net=0;cards.forEach(function(c){net+=c[0]-c[1]});return{cards:cards,net:net,kind:(k.bold?'bold':'mild')+'-'+(k.often?'often':'rare')}});
  var best=0,i;for(i=1;i<4;i++)if(decks[i].net>decks[best].net)best=i;
  return{title:'Level '+level,level:level,n:n,decks:decks,best:best,bestFixed:decks[best].net,opt:PZC4.riskOpt(decks,n),par:n,parExact:true}}
window.V6RD={make:make,nOf:nOf};
var CSS=''
+'.rd .rd-decks{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:100%}'
+'.rd .rd-k{all:unset;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 4px 8px;border-radius:18px;background:var(--dk-board);box-shadow:inset 0 0 0 2px var(--dk-line);cursor:pointer;min-height:230px;-webkit-tap-highlight-color:transparent;color:var(--dk-ink)}'
+'.rd .rd-k:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.rd .rd-k:disabled{opacity:.55;cursor:default}'
+'.rd .rd-card{position:relative;width:100%;max-width:76px;aspect-ratio:3/4;border-radius:12px;background:var(--surface,#fff);box-shadow:0 2px 0 var(--dk-line),0 0 0 2px var(--dk-line);display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 1.125rem/1.1 var(--font);overflow:hidden}'
+'.rd .rd-card svg{width:34px;height:34px}.rd .rd-card .g{color:#2F7D4B;font-size:.875rem}.rd .rd-card .l{color:#B4540A;font-size:.875rem}.rd .rd-card .n{font-size:1.25rem}'
+'.rd .rd-bar{position:relative;width:100%;height:84px}.rd .rd-bar i{position:absolute;left:22%;right:22%;border-radius:6px}'
+'.rd .rd-bar .z{position:absolute;left:8%;right:8%;top:50%;height:2px;background:var(--dk-line);opacity:.8}'
+'.rd .rd-avg{font:800 .875rem var(--font);font-variant-numeric:tabular-nums}.rd .rd-sc{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 16px;border-radius:19px;background:var(--surface);box-shadow:0 0 0 1.5px var(--line);font:800 1.25rem var(--font);color:var(--ink);font-variant-numeric:tabular-nums}';
var SHAPES=['<path d="M12 3L21 12L12 21L3 12Z"/>','<circle cx="12" cy="12" r="9"/>','<path d="M12 3L22 20H2Z"/>','<rect x="4" y="4" width="16" height="16" rx="3"/>'];
var COLS=['#3F6FD1','#2F9E5B','#8A5AC9','#D64545'];
function shape(i){return'<svg viewBox="0 0 24 24" aria-hidden="true" fill="'+COLS[i]+'" stroke="#1B1916" stroke-width="1.6" stroke-linejoin="round">'+SHAPES[i]+'</svg>'}
function sg(n){return n>0?'+'+n:n<0?'−'+(-n):'0'}
function mount(root,inst,api){ZK.css(DK.BASECSS+CSS,'rd-css');root.textContent='';
  var n=inst.n,rm=ZK.rm(api),L=DK.life(),draws=[],counts=[0,0,0,0],dn=[0,0,0,0],score=0,hints=0,undos=0,fin=false,busy=false,lastEl=null,ghost=null,idle=null,i;
  var stage=DK.h('div','dk rd zk-stage zk-host'+(rm?' zk-rm':'')),top=DK.h('div','dk-top',null,null,stage);
  var sc=DK.h('div','rd-sc','<span class="n">0</span>',{role:'img','aria-label':'0 points'},top),scn=sc.firstChild,pips=ZK.pips(n);
  var decks=DK.h('div','rd-decks zk-board',null,{role:'group','aria-label':'Four decks'},stage),btn=[],card=[],bar=[],avg=[];
  var maxA=8;
  for(i=0;i<4;i++)(function(k){var b=DK.h('button','rd-k zk-p',null,{type:'button','data-zkc':''});var c=DK.h('div','rd-card',shape(k),null,b),br=DK.h('div','rd-bar','<span class="z"></span>',null,b),av=DK.h('div','rd-avg','–',null,b);
    b.onclick=function(){draw(k)};btn.push(b);card.push(c);bar.push(br);avg.push(av);decks.appendChild(b)})(i);
  stage.appendChild(pips.el);root.appendChild(stage);
  function D(ms){return rm?0:ms}
  function paint(){for(var k=0;k<4;k++){var a=counts[k]?dn[k]/counts[k]:0,h=Math.min(1,Math.abs(a)/maxA)*40,br=bar[k],bi=br.querySelector('i');if(!bi){bi=document.createElement('i');br.appendChild(bi)}
      bi.style.background=a>=0?'#2F9E5B':'#E9A23B';bi.style.height=Math.max(counts[k]?3:0,h)+'px';bi.style.top=a>=0?(42-h)+'px':'42px';if(!counts[k])bi.style.height='0';
      avg[k].textContent=counts[k]?sg(Math.round(a*10)/10):'–';btn[k].setAttribute('aria-label','Deck '+(k+1)+', drawn '+counts[k]+' times, average '+(counts[k]?(Math.round(a*10)/10):'none')+' per card. Draw a card.');btn[k].disabled=fin||counts[k]>=n}
    scn.textContent=sg(score).replace('+','');sc.setAttribute('aria-label',score+' points');pips.set(draws.length)}
  function flip(k,c,net){var el=card[k];el.innerHTML='<span class="g">+'+c[0]+'</span><span class="n">'+sg(net)+'</span><span class="l">'+(c[1]?'−'+c[1]:'')+'</span>';
    el.style.background=net>=0?'#E4F4E8':'#FBEBD2';if(!rm)ZK.anim(el,[{transform:'rotateY(90deg) scale(.9)'},{transform:'rotateY(0) scale(1.08)',offset:.6},{transform:'none'}],300,ZK.SPRING)}
  function draw(k){if(fin||counts[k]>=n)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);var c=inst.decks[k].cards[counts[k]],net=c[0]-c[1];counts[k]++;dn[k]+=net;score+=net;draws.push(k);lastEl=btn[k];api.moved();
    flip(k,c,net);paint();ZK.sfx(net>=0?'click':'soft',{p:Math.max(0,Math.min(8,Math.round(net/2)))});ZK.buzz(net>=0?'tap':'soft');if(!rm)ZK.anim(scn,[{transform:'scale(1.25)'},{transform:'scale(1)'}],240,ZK.SPRING);
    if(draws.length>=n){fin=true;api.say('Finished with '+score+' points.');L.later(function(){api.done({solved:true,moves:draws.length,hints:hints,undos:undos,extra:{par:inst.par,score:score,best:inst.bestFixed}})},D(450))}}
  function recompute(){counts=[0,0,0,0];dn=[0,0,0,0];score=0;draws.forEach(function(k){var c=inst.decks[k].cards[counts[k]];counts[k]++;dn[k]+=c[0]-c[1];score+=c[0]-c[1]});for(var k=0;k<4;k++)card[k].innerHTML=shape(k),card[k].style.background=''}
  var ctl={
    undo:function(){if(fin||!draws.length)return false;draws.pop();recompute();undos++;ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);paint();return true},
    restart:function(){if(fin)return;draws=[];recompute();ZK.sfx('undo');ZK.unmark(stage);paint()},
    hint:function(lv){if(fin)return null;hints++;ZK.unmark(stage);
      if(lv<=1)return 'Watch each deck’s average bar. Big wins can hide bigger losses.';
      var bi=-1,k;for(k=0;k<4;k++)if(counts[k]>0&&(bi<0||dn[k]/counts[k]>dn[bi]/counts[bi]))bi=k;
      if(lv===2)return bi<0?'Draw from each deck once, then compare the bars.':'The tallest bar so far is deck '+(bi+1)+'. Does it stay tall?';
      ZK.mark(btn[inst.best]);return 'This deck ends highest if you stay with it.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();L.destroy();root.textContent=''},
    lastEl:function(){return lastEl},
    state:function(){return{draws:draws.slice(),score:score,fin:fin,busy:false,counts:counts.slice()}}};
  paint();idle=ZK.idle(stage,25000);
  if(inst.level===1)ghost=ZK.ghost(stage,[{tap:btn[inst.best],hold:900}],{id:ID,level:1});
  return ctl}
ZK.override({id:ID,name:'Risk Deck',family:'number',theme:'F5',calm:true,
  blurb:'Four decks of cards. Find the one that wins over time.',
  how:'Tap a deck to draw its next card. Finish with the most points.',
  areas:['flex','control'],levels:30,secs:60,make:make,mount:mount,
  stars:function(res,inst){var sc=res.extra&&res.extra.score!=null?res.extra.score:0,r=inst.bestFixed>0?sc/inst.bestFixed:0,s=r>=.5?3:r>=.2?2:1;if(res.hints&&s===3)s=2;
    return{stars:s,line:sc+' points. The best single deck gives '+inst.bestFixed+'.'}}});
})();
