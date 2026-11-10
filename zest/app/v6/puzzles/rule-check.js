/* Zest v6: Rule Check (the Wason selection task). Overrides puzzles_d1.js through ZK.override.
   Rule (shown as two picture chips with an arrow, a rule that is always TRUE): "if the front is P, the back is Q". Each card shows one side. Flip the cards that COULD break the rule.
   The move is the flip itself: tap a card and it turns over with a spring to show its hidden side, so there is no "choose then Check" step. A flip of a card that cannot break the rule is a wasted move
   (stars count flips against par) and the card is stamped with a small shield so the player learns why. The level is won the moment the last risky card is flipped.
   Cards show a letter or a number (rules like vowel -> even) or a colour or a shape (red -> circle). Levels 1-8: vowel -> even, 4 cards, 2 risky. 9-14: all four letter/number rules.
   15-20: colour/shape rules mixed in. 21-25: 5 cards, 3 risky. 26-30: 6 cards, 3 risky. Every 5th level steps back to the simple rule (breather).
   par = the number of risky cards (exact: P cards and not-Q cards, nothing else can break the rule). */
(function(){
var ID='rule-check',CC=window.V6C;
var VOW='AEIOU'.split(''),CON='BCDFGHKLMNPRSTVWZ'.split('');
var COL=[['red','#D6402F'],['blue','#2F6FD6'],['green','#2E9E5B'],['gold','#E3A71B']],SHP=['circle','square','triangle'];
function cfgFor(L){var n=L<=20?4:L<=25?5:6,br=n===4?2:3,hard=L%5===0?0:L<=8?0:L<=14?1:L<=20?2:2;return{n:n,br:br,hard:hard}}
/* a domain describes: how to draw a front value and a back value, the P set and Q set */
function pickTpl(L,rng,hard){
  if(hard===0)return{dom:'A',p:'vowel',q:'even'};
  if(hard===1)return{dom:'A',p:['vowel','consonant'][pzInt(rng,2)],q:['even','odd'][pzInt(rng,2)]};
  return pzInt(rng,2)?{dom:'B',p:COL[pzInt(rng,4)][0],q:SHP[pzInt(rng,3)]}:{dom:'A',p:['vowel','consonant'][pzInt(rng,2)],q:['even','odd'][pzInt(rng,2)]}}
function inP(t,v){return t.dom==='A'?(t.p==='vowel'?VOW:CON.concat([])).indexOf(v)>=0:v===t.p}
function inQ(t,v){return t.dom==='A'?(t.q==='even'?v%2===0:v%2===1):v===t.q}
function valsP(t,rng){if(t.dom==='A')return t.p==='vowel'?VOW:CON;return[t.p]}
function valsNP(t){if(t.dom==='A')return t.p==='vowel'?CON:VOW;return COL.map(function(c){return c[0]}).filter(function(c){return c!==t.p})}
function valsQ(t){if(t.dom==='A')return t.q==='even'?[2,4,6,8]:[1,3,5,7,9];return[t.q]}
function valsNQ(t){if(t.dom==='A')return t.q==='even'?[1,3,5,7,9]:[2,4,6,8];return SHP.filter(function(s){return s!==t.q})}
function any(arr,rng){return arr[pzInt(rng,arr.length)]}
function one(level,rng){var c=cfgFor(level),t=pickTpl(level,rng,c.hard),kinds=[],i;
  for(i=0;i<c.br;i++)kinds.push(pzInt(rng,2)?'p':'nq');
  var safe=c.n-c.br;kinds.push('np');kinds.push('q');for(i=2;i<safe;i++)kinds.push(pzInt(rng,2)?'np':'q');
  kinds=pzShuffle(kinds,rng);var used={},cards=kinds.map(function(k){var front,back,shown;
    function pick(arr){for(var g=0;g<30;g++){var v=any(arr,rng);var key=k+v;if(!used[key]){used[key]=1;return v}}return any(arr,rng)}
    if(k==='p'){front=pick(valsP(t));back=any(valsQ(t),rng);shown='f'}
    else if(k==='np'){front=pick(valsNP(t));back=any(valsQ(t).concat(valsNQ(t)),rng);shown='f'}
    else if(k==='q'){back=pick(valsQ(t));front=any(valsP(t).concat(valsNP(t)),rng);shown='b'}
    else{back=pick(valsNQ(t));front=any(valsNP(t),rng);shown='b'}   /* a not-Q card hides a not-P value, so the rule stays true */
    return{kind:k,front:front,back:back,shown:shown,risky:k==='p'||k==='nq'}});
  return{rule:t,cards:cards,par:c.br,risky:cards.map(function(x,j){return x.risky?j:-1}).filter(function(j){return j>=0})}}
function roundsFor(L){return L<=3?2:L<=14?3:4}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var k=roundsFor(level),rs=[],par=0;for(var q=0;q<k;q++){var r=one(level,rng);rs.push(r);par+=r.par}
  return{level:level,title:'Level '+level,rounds:rs,rule:rs[0].rule,cards:rs[0].cards,risky:rs[0].risky,par:par,parExact:true}}
function plan(inst){var out=[];inst.rounds.forEach(function(r,ri){if(ri)out.push({wait:1.2});for(var k=0;k<r.par;k++)out.push('.rc-c[data-brk="1"]:not(.fl)')});return out}
CC[ID]={make:make,one:one,roundsFor:roundsFor,plan:plan,inP:inP,inQ:inQ,cfgFor:cfgFor};
var CSS=''
+'.rc{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:var(--font)}'
+'.rc-rule{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:20px;background:var(--surface);box-shadow:0 0 0 2px var(--line,#ddd)}'
+'.rc-chip{min-width:84px;min-height:50px;padding:0 10px;border-radius:14px;background:var(--tint);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font:800 1.05rem/1 var(--disp,var(--font));color:var(--ink);letter-spacing:.06em}'
+'.rc-chip small{font:700 .72rem var(--font);color:var(--muted);letter-spacing:0;text-transform:none}.rc-chip svg{width:30px;height:30px}'
+'.rc-arr{width:30px;height:30px;color:var(--ink)}'
+'.rc-cap{margin:-4px 0 0;font:700 .9rem/1.2 var(--font);color:var(--muted);text-align:center}'
+'.rc-cards{display:grid;gap:10px;width:100%;justify-content:center}'
+'.rc-c{all:unset;position:relative;box-sizing:border-box;aspect-ratio:3/4;perspective:600px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:scale .18s '+ZK.SPRING+'}'
+'.rc-c:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'.rc-in{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.3,1.35,.55,1)}'
+'.rc-c.fl .rc-in{transform:rotateY(180deg)}'
+'.rc-f,.rc-b{position:absolute;inset:0;border-radius:16px;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font:800 2.2rem/1 var(--disp,var(--font));color:var(--ink);background:var(--surface);box-shadow:0 0 0 2.5px var(--edge),0 5px 0 var(--edge)}'
+'.rc-b{transform:rotateY(180deg);background:var(--tint)}'
+'.rc-f svg,.rc-b svg{width:48%;height:auto;max-height:46%}'
+'.rc-f small,.rc-b small{font:700 .75rem var(--font);color:var(--muted)}'
+'.rc-dot{width:44%;aspect-ratio:1;border-radius:50%}'
+'.rc-stamp{position:absolute;right:-6px;top:-8px;width:28px;height:28px;border-radius:50%;background:var(--surface);box-shadow:0 0 0 2px var(--edge);display:none;align-items:center;justify-content:center;z-index:2}'
+'.rc-stamp svg{width:16px;height:16px}.rc-c.safe .rc-stamp,.rc-c.risk .rc-stamp{display:flex}.rc-c.risk .rc-stamp{background:var(--ok-bg,#ddefe2);box-shadow:0 0 0 2px var(--ok-ink,#14532d)}'
+'.rc-c.safe{opacity:.7}.rc-c.risk .rc-b{background:var(--ok-bg,#ddefe2)}'
+'.zk-rm .rc-in,.zk-rm .rc-c{transition:none}@media (prefers-reduced-motion:reduce){.rc-in,.rc-c{transition:none}}';
var ARR='<svg class="rc-arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var SHIELD='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>';
var CHECK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10" fill="none" stroke="#14532d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function shape(s){var d=s==='circle'?'<circle cx="12" cy="12" r="9"/>':s==='square'?'<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/>':'<path d="M12 3.5l9 16.5H3z" stroke-linejoin="round"/>';return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="currentColor" stroke-width="1">'+d+'</svg>'}
function colorOf(n){for(var i=0;i<COL.length;i++)if(COL[i][0]===n)return COL[i][1];return '#999'}
function face(t,dom,v,side){/* side 'f' front, 'b' back */
  if(t.dom==='A')return side==='f'?'<span>'+v+'</span>':'<span>'+v+'</span>';
  return side==='f'?'<i class="rc-dot" style="background:'+colorOf(v)+'"></i><small>'+v+'</small>':shape(v)+'<small>'+v+'</small>'}
function ruleChips(t){var a,b;
  if(t.dom==='A'){a='<span>'+(t.p==='vowel'?VOW:CON.slice(0,5)).join(' ')+'</span><small>'+(t.p==='vowel'?'a vowel':'a consonant')+'</small>';b='<span>'+(t.q==='even'?'2 4 6 8':'1 3 5 7 9')+'</span><small>'+(t.q==='even'?'an even number':'an odd number')+'</small>'}
  else{a='<i class="rc-dot" style="width:26px;background:'+colorOf(t.p)+'"></i><small>'+t.p+'</small>';b=shape(t.q)+'<small>'+t.q+'</small>'}
  return [a,b]}
function mount(root,inst,api){CC.css();ZK.css(CSS,'rc-css');
  var rm=ZK.rm(api),ri=0,R=inst.rounds[0],t=R.rule,flipped=[],hist=[],base=0,locked=false,hints=0,undos=0,fin=false,last=null,ghost=null,idle=null,stage=CC.stage(root,'rc',api),ruleEl=CC.el('div','rc-rule'),grid=CC.el('div','rc-cards zk-board'),pips=ZK.pips(inst.par),cs=[];
  var cap=CC.el('p','rc-cap');cap.textContent='The rule is true. Flip only cards that could break it.';stage.appendChild(ruleEl);stage.appendChild(cap);stage.appendChild(grid);stage.appendChild(pips.el);
  function build(){R=inst.rounds[ri];t=R.rule;flipped=[];hist=[];cs=[];grid.textContent='';var chips=ruleChips(t);ruleEl.setAttribute('role','img');ruleEl.setAttribute('aria-label',t.dom==='A'?'Rule: if one side is '+(t.p==='vowel'?'a vowel':'a consonant')+', the other is '+(t.q==='even'?'an even':'an odd')+' number':'Rule: if the colour is '+t.p+', the shape is a '+t.q);
    ruleEl.innerHTML='<div class="rc-chip">'+chips[0]+'</div>'+ARR+'<div class="rc-chip">'+chips[1]+'</div>';
    var n=R.cards.length,cols=n===6?3:n;grid.style.gridTemplateColumns='repeat('+cols+',minmax(0,'+(n===6?96:n===5?64:82)+'px))';
    R.cards.forEach(function(c,i){var b=CC.btn('rc-c','',function(){flip(i)});b.setAttribute('data-i',i);b.setAttribute('data-brk',c.risky?'1':'0');b.setAttribute('data-zkc','');
      b.innerHTML='<span class="rc-in"><span class="rc-f">'+face(t,t.dom,c.shown==='f'?c.front:c.back,c.shown)+'</span><span class="rc-b">'+face(t,t.dom,c.shown==='f'?c.back:c.front,c.shown==='f'?'b':'f')+'</span></span><span class="rc-stamp"></span>';
      b.setAttribute('aria-label','Card '+(i+1)+', face up shows '+(c.shown==='f'?c.front:c.back)+', tap to flip');cs.push(b);grid.appendChild(b);ZK.anim(b,[{transform:'translateY(18px)',opacity:0},{transform:'none',opacity:1}],240,ZK.SPRING,i*50)})}
  function left(){return R.risky.filter(function(j){return flipped.indexOf(j)<0}).length}
  function flip(i){if(fin||locked||flipped.indexOf(i)>=0)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);var c=R.cards[i];flipped.push(i);hist.push(i);last=cs[i];api.moved();
    cs[i].classList.add('fl',c.risky?'risk':'safe');cs[i].querySelector('.rc-stamp').innerHTML=c.risky?CHECK:SHIELD;
    cs[i].setAttribute('aria-label','Card '+(i+1)+', flipped, '+(c.risky?'it could have broken the rule':'it could never break the rule'));
    ZK.sfx(c.risky?'clack':'soft');ZK.buzz(c.risky?'move':'tap');
    pips.set(base+R.risky.length-left());
    if(c.risky)ZK.anim(cs[i],[{scale:'1'},{scale:'1.08'},{scale:'1'}],300,ZK.SPRING,300);else ZK.wrong(cs[i],{silent:true});
    if(left()===0){ZK.sfx('cap',{n:ri});cs.forEach(function(b,j){if(flipped.indexOf(j)<0)b.style.opacity=.55});
      if(ri===inst.rounds.length-1){fin=true;api.say('Those cards could break the rule.');setTimeout(function(){api.done({solved:true,moves:base+hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:380)}
      else{locked=true;setTimeout(function(){base+=hist.length;ri++;locked=false;build()},rm?80:1050)}}}
  function key(e){var k=parseInt(e.key,10);if(k>=1&&k<=n)flip(k-1)}
  stage.addEventListener('keydown',key);
  build();
  if(inst.level===1){ghost=ZK.ghost(stage,[{tap:cs[R.risky[0]],hold:900},{tap:cs[R.risky[1]],hold:900}],{id:ID,level:1,delay:900})}
  idle=ZK.idle(stage,22000);
  return{
    undo:function(){if(fin||locked||!hist.length)return false;var i=hist.pop();flipped.splice(flipped.indexOf(i),1);undos++;cs[i].classList.remove('fl','risk','safe');pips.set(base+R.risky.length-left());ZK.unmark(stage);ZK.sfx('undo');ZK.buzz('tap');return true},
    restart:function(){if(fin||locked)return;flipped=[];hist=[];cs.forEach(function(b){b.classList.remove('fl','risk','safe');b.style.opacity=''});pips.set(base);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin||locked)return null;var r=R.risky.filter(function(j){return flipped.indexOf(j)<0});if(!r.length)return null;hints++;ZK.unmark(stage);
      if(lv<=1){ZK.mark(ruleEl);return 'Ask of each card: could its other side break the rule?'}
      if(lv===2){ZK.mark(cs[r[0]]);return 'This card could break it.'}
      flip(r[0]);return 'Flipped one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();stage.removeEventListener('keydown',key);root.textContent=''},
    lastEl:function(){return last},state:function(){return{flips:hist.length,fin:fin}}}}
ZK.override({id:ID,name:'Rule Check',family:'number',theme:'F5',blurb:'Flip only the cards that could break the rule.',
  how:'The rule is true. Flip the cards that could break it, and no others.',areas:['control','flex'],levels:30,secs:60,make:make,mount:mount,
  stars:function(res,inst){var wr=Math.max(0,res.moves-inst.par),h=res.hints||0,s=wr===0?3:wr===1?2:1;if(h&&s===3)s=2;
    return{stars:s,line:res.moves+' flip'+(res.moves===1?'':'s')+'. Only '+inst.par+' could break the rule.'}}});
})();
