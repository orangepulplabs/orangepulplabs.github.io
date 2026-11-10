/* Zest v6: Hidden Rule Sort (a Wisconsin-style card sort). Overrides puzzles_e6.js through ZK.override. The card/pile art and the star rule come from the original.
   Rule (hidden): the cards sort by ONE feature (shape, count or pattern). A pile is told right or wrong at once; a wrong pile is closed for that card and never costs a move twice.
   The rule changes after every K right sorts. The board shows that: a row of K segments fills with every right sort and, when it completes, the piles flip over with a shuffle sound
   (a flash warns that the rule may have changed; it never says which). Card progress is a pip row.
   Levels 1 to 3 have one rule for the whole level (no change), so the first lessons are near-impossible to fail. From level 4 the rule changes every 5, then 4 (level 10), then 3 (level 20) right sorts.
   Aha: noticing that the rule moved (a run of misses is the signal) and ruling out the rule just left. par = cards sorted (one pick each); stars count misses against a careful-play budget. */
(function(){
var ID='hidden-rule-sort',CC=window.V6C,E=window.PZE6;
function nFor(L){if(L<=2)return 6;if(L===3)return 8;var n=10+Math.floor((L-4)*14/26);if(L%5===0)n-=3;return n}
function kFor(L,N){return L<=3?N:L<=9?5:L<=19?4:3}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var N=nFor(level),K=kFor(level,N),pm=[0,1,2].map(function(){return pzShuffle([0,1,2,3],rng)}),
    piles=[0,1,2,3].map(function(i){return[pm[0][i],pm[1][i],pm[2][i]]}),eras=Math.ceil(N/K),rules=[],cards=[],i,r=pzInt(rng,3);
  for(i=0;i<eras;i++){rules.push(r);r=(r+1+pzInt(rng,2))%3}
  for(i=0;i<N;i++){var perm=pzShuffle([0,1,2,3],rng);cards.push({f:[piles[perm[0]][0],piles[perm[1]][1],piles[perm[2]][2]],ans:[perm[0],perm[1],perm[2]]})}
  return{title:'Level '+level,level:level,N:N,K:K,piles:piles,rules:rules,cards:cards,par:N,parExact:true,budget:2+(eras-1)}}
function ruleAt(inst,i){return inst.rules[Math.floor(i/inst.K)]}
function plan(inst){var out=[];inst.cards.forEach(function(c,i){out.push('.hr-p[data-j="'+c.ans[ruleAt(inst,i)]+'"]')});return out}
CC[ID]={make:make,plan:plan,ruleAt:ruleAt,nFor:nFor,kFor:kFor};
var CSS=''
+'.hr{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font)}'
+'.hr-era{display:flex;gap:6px;align-items:center;min-height:22px}.hr-era i{width:26px;height:8px;border-radius:4px;background:var(--line,#ddd);transition:background .2s}.hr-era i.on{background:var(--accent)}.hr-era.flash i{background:#F6B73C}'
+'.hr-era svg{width:20px;height:20px;margin-left:4px}'
+'.hr-card{width:128px;height:150px;border-radius:20px;background:var(--surface);box-shadow:0 0 0 2.5px var(--edge),0 6px 0 var(--edge);display:flex;align-items:center;justify-content:center;color:var(--ink);margin:6px 0 4px}'
+'.hr-card svg{width:100px;height:100px}'
+'.hr-piles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:100%;padding:10px;box-sizing:border-box;border-radius:22px;background:var(--tint)}'
+'.hr-p{all:unset;box-sizing:border-box;aspect-ratio:1;min-height:60px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:var(--surface);box-shadow:0 0 0 2px var(--edge),0 4px 0 var(--edge);color:var(--ink);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:opacity .2s}'
+'.hr-p svg{width:70%;height:70%}.hr-p.closed{opacity:.28;pointer-events:none}.hr-p:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'.hr-p.good{background:var(--ok-bg,#ddefe2);color:var(--ok-ink,#14532d);box-shadow:0 0 0 3px var(--ok-ink,#14532d),0 4px 0 var(--ok-ink,#14532d)}'
+'.zk-rm .hr-p{transition:none}';
var SHIFT='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h13l-3-3M20 16H7l3 3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var uid=0;
function mount(root,inst,api){CC.css();ZK.css(CSS,'hr-css');
  var rm=ZK.rm(api),ci=0,misses=0,picks=0,tried=[],hints=0,fin=false,locked=false,last=null,ghost=null,idle=null,u='hr'+(++uid)+'-',
      stage=CC.stage(root,'hr',api),era=CC.el('div','hr-era'),card=CC.el('div','hr-card zk-board'),piles=CC.el('div','hr-piles'),pips=ZK.pips(inst.N),pb=[],segs=[];
  card.setAttribute('role','img');
  if(inst.K<inst.N){for(var s=0;s<inst.K;s++){var e=CC.el('i');segs.push(e);era.appendChild(e)}era.insertAdjacentHTML('beforeend',SHIFT);era.setAttribute('aria-label','Right sorts until the rule may change');era.setAttribute('role','img')}
  stage.appendChild(era);stage.appendChild(card);stage.appendChild(piles);stage.appendChild(pips.el);
  inst.piles.forEach(function(f,j){var b=CC.btn('hr-p','Pile '+(j+1)+': '+E.hrsLabel(f),function(){pick(j)});b.setAttribute('data-j',j);b.setAttribute('data-zkc','');b.appendChild(pze6CardSvg(f,u+'p'+j));pb.push(b);piles.appendChild(b)});
  function cur(){return inst.cards[ci]}
  function paintEra(){var k=ci%inst.K;segs.forEach(function(e,i){e.className=i<k?'on':''})}
  function render(pop){try{card.getAnimations().forEach(function(a){a.cancel()})}catch(e){}card.textContent='';card.appendChild(pze6CardSvg(cur().f,u+'c'+ci));card.setAttribute('aria-label','Card to sort: '+E.hrsLabel(cur().f));
    pb.forEach(function(b,j){b.classList.toggle('closed',tried.indexOf(j)>=0);b.classList.remove('good')});pips.set(ci);paintEra();
    if(pop&&!rm)ZK.anim(card,[{transform:'translateY(-30px) scale(.8)',opacity:0},{transform:'none',opacity:1}],260,ZK.SPRING)}
  function pick(j){if(fin||locked||tried.indexOf(j)>=0)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);picks++;api.moved();var rule=ruleAt(inst,ci),c=cur();last=pb[j];
    if(c.ans[rule]===j){locked=true;tried=[];pb[j].classList.add('good');ZK.sfx('click',{p:(ci%inst.K)*2});ZK.buzz('move');
      var a=ZK.at(stage,card),b=ZK.at(stage,pb[j]);ZK.anim(card,[{transform:'none',opacity:1},{transform:'translate('+(b.x-a.x)+'px,'+(b.y-a.y)+'px) scale(.45)',opacity:0}],240,ZK.EIN,0,'forwards');
      ZK.anim(pb[j],[{scale:'1'},{scale:'1.14'},{scale:'1'}],300,ZK.SPRING,200);
      if(ci>=inst.N-1){fin=true;pips.set(inst.N);setTimeout(function(){api.done({solved:true,moves:picks,hints:hints,undos:0,extra:{par:inst.par,misses:misses,budget:inst.budget}})},rm?0:340);return}
      var sw=((ci+1)%inst.K===0);
      setTimeout(function(){ci++;locked=false;render(true);
        if(sw){era.classList.add('flash');setTimeout(function(){era.classList.remove('flash')},700);ZK.sfx('roll');ZK.buzz('pop');
          pb.forEach(function(p,q){ZK.anim(p,[{transform:'rotateY(0)'},{transform:'rotateY(90deg)'},{transform:'rotateY(0)'}],420,ZK.EASE,q*60)})}},rm?60:300)}
    else{misses++;tried.push(j);ZK.wrong(pb[j]);setTimeout(function(){pb[j].classList.add('closed')},rm?0:260)}}
  stage.addEventListener('keydown',function(e){var j='1234'.indexOf(e.key);if(j>=0)pick(j)});
  render(false);
  if(inst.level===1){var c0=inst.cards[0];ghost=ZK.ghost(stage,[{tap:pb[c0.ans[ruleAt(inst,0)]],hold:900}],{id:ID,level:1,delay:900})}
  idle=ZK.idle(stage,22000);
  return{
    undo:function(){return false},
    restart:function(){if(fin||locked)return;ci=0;misses=0;picks=0;tried=[];ZK.unmark(stage);render(true);ZK.sfx('undo')},
    hint:function(lv){if(fin||locked)return null;hints++;ZK.unmark(stage);var rule=ruleAt(inst,ci),c=cur(),R=E.hrs.RULE;
      if(lv<=1)return 'The rule is shape, count or pattern. After a change it is a different one.';
      if(lv===2)return 'The rule right now is not the '+R[(rule+1)%3]+'.';
      ZK.mark(pb[c.ans[rule]]);pick(c.ans[rule]);return 'The rule is the '+R[rule]+'. Sorted for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();root.textContent=''},
    lastEl:function(){return last},state:function(){return{ci:ci,misses:misses,fin:fin}}}}
function pz(n,w,p){return n+' '+(n===1?w:(p||w+'s'))}
ZK.override({id:ID,name:'Hidden Rule Sort',family:'memory',theme:'F10',undo:false,blurb:'Sort cards by a rule nobody tells you, and notice when it changes.',
  how:'Tap the pile the card belongs on. The rule is hidden and can change.',areas:['flex','attention'],levels:30,secs:60,make:make,mount:mount,
  stars:function(res,inst){var ms=res.extra&&res.extra.misses!=null?res.extra.misses:0,bd=inst.budget,s=ms<=bd?3:ms<=bd+2?2:1;if(res.hints&&s===3)s=2;
    return{stars:s,line:inst.N+' cards sorted with '+pz(ms,'miss','misses')+'.'}}});
})();
