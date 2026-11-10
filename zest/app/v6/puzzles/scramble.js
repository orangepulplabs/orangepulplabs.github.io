/* Zest v6: Scramble (anagram). Overrides puzzles_b.js through ZK.override.
   Rule: put the jumbled letter tiles back into a real word (any real word made from the same letters counts). Several words per level.
   Board: slots on top, the tiles below. Tap a tile and it flies into the next slot with a spring; tap a placed tile and it flies home; a round shuffle button re-deals the tiles that are left.
   Words get longer with the level (4 to 8 letters) and the number of words rises 1, 2, 3, 4 with a breather each time the length steps up. Long words use two rows so tiles stay 44 px or bigger.
   Aha filter: the jumble never begins with the first three letters of the answer in order, and never spells another real word by accident (so the obvious first guess is wrong).
   par = the number of words (a word is one move). */
(function(){
var ID='scramble',CC=window.V6C;
function srt(s){return s.split('').sort().join('')}
function valid(word,guess){if(guess===word)return true;if(srt(guess)!==srt(word))return false;return CC.has(guess)}
function lenFor(L){return Math.min(8,4+Math.floor((L-1)/5))}
function countFor(L){var n=L<=3?1:L<=12?2:L<=24?3:4;if(L>1&&(L-1)%5===0)n=Math.max(1,n-1);return n}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var len=lenFor(level),n=countFor(level),pool=CC.words(len),words=[],used={};
  while(words.length<n){var w=pool[pzInt(rng,pool.length)];if(used[w])continue;used[w]=1;var s=w,t=0;
    do{s=pzShuffle(w.split(''),rng).join('')}while(t++<60&&(s===w||valid(w,s)||(level>=2&&s.slice(0,3)===w.slice(0,3))));words.push({w:w,s:s})}
  return{level:level,title:'Level '+level,len:len,words:words,par:n*len,parExact:true}}   /* 1.2.1: par = letters (each tile placed is a move) */
function plan(inst){var out=[];inst.words.forEach(function(wd,wi){if(wi)out.push({wait:1.0});wd.w.split('').forEach(function(c){out.push('.sc-t[data-ch="'+c+'"]:not(.in)')})});return out}
CC[ID]={make:make,valid:valid,plan:plan,lenFor:lenFor,countFor:countFor};

var CSS=''
+'.sc{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:var(--font)}'
+'.sc-area{position:relative;width:100%}'
+'.sc-slot{position:absolute;left:0;top:0;border-radius:14px;border:2.5px dashed var(--edge);opacity:.7}'
+'.sc-t{position:absolute!important;left:0;top:0;transition:transform .28s '+ZK.SPRING+',background .2s,box-shadow .2s;touch-action:manipulation}'
+'.sc-t.in{z-index:2}.sc-t.wrong{box-shadow:0 0 0 3px #E9A23B,0 4px 0 #E9A23B}'
+'.sc-shuf{all:unset;box-sizing:border-box;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--surface);box-shadow:0 0 0 2px var(--edge),0 3px 0 var(--edge);cursor:pointer}'
+'.sc-shuf svg{width:26px;height:26px}.sc-shuf:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'.sc-row{display:flex;gap:12px;align-items:center}'
+'@media (prefers-reduced-motion:reduce){.sc-t{transition:none}}.zk-rm .sc-t{transition:none}';
var SHUF='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h3.5c5 0 6 10 11 10H21M3 17h3.5c1.7 0 2.9-1 3.9-2.4M14 8.2C14.9 7.5 16 7 17.5 7H21M18 4l3 3-3 3M18 14l3 3-3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function mount(root,inst,api){CC.css();ZK.css(CSS,'sc-css');
  var placed=0,rm=ZK.rm(api),len=inst.len,wi=0,hints=0,undos=0,fin=false,locked=false,last=null,ghost=null,idle=null,undoStack=[],hist=[],tiles=[],slots=[],inSlot=[],homeOf=[],slotEls=[],offs=[];
  var stage=CC.stage(root,'sc',api),area=CC.el('div','sc-area zk-board'),pips=ZK.pips(inst.words.length),tool=CC.el('div','sc-row'),sh=CC.btn('sc-shuf','Shuffle the letters');
  sh.innerHTML=SHUF;tool.appendChild(sh);stage.appendChild(area);stage.appendChild(tool);pips.el.className+=' sc-pips';stage.appendChild(pips.el);
  var W=0,tw=52,gap=8,cols=len,srows=1;
  function geom(){W=Math.floor(stage.getBoundingClientRect().width)||340;var fit=Math.floor((W-12-gap*(len-1))/len);
    if(fit>=46){cols=len;tw=Math.min(58,fit)}else{cols=Math.ceil(len/2);tw=Math.min(58,Math.floor((W-12-gap*(cols-1))/cols))}srows=Math.ceil(len/cols)}
  function pt(k,zone){var r=Math.floor(k/cols),c=k%cols,inRow=Math.min(cols,len-r*cols),x0=(W-(inRow*tw+(inRow-1)*gap))/2,th=Math.round(tw*1.1);
    return{x:Math.round(x0+c*(tw+gap)),y:(zone==='slot'?0:srows*(th+gap)+22)+r*(th+gap)}}
  function build(){area.textContent='';tiles=[];slotEls=[];geom();var th=Math.round(tw*1.1),cur=inst.words[wi];slots=[];homeOf=[];
    area.style.height=(srows*(th+gap)*2+22)+'px';
    for(var k=0;k<len;k++){var s=CC.el('div','sc-slot');s.style.width=tw+'px';s.style.height=th+'px';var p=pt(k,'slot');s.style.transform='translate('+p.x+'px,'+p.y+'px)';slotEls.push(s);area.appendChild(s)}
    for(k=0;k<len;k++)(function(k){var b=CC.btn('cc-t sc-t','',function(){tapTile(k)});b.textContent=cur.s.charAt(k);b.setAttribute('data-ch',cur.s.charAt(k));b.setAttribute('data-zkc','');b.style.width=tw+'px';b.style.height=th+'px';b.style.fontSize=Math.round(tw*.52)+'px';
      homeOf.push(k);tiles.push(b);area.appendChild(b)})(k);
    inSlot=[];layout(true);label()}
  function layout(instant){for(var k=0;k<len;k++){var t=tiles[k],si=inSlot.indexOf(k),p=si>=0?pt(si,'slot'):pt(homeOf[k],'pool');
      if(instant)t.style.transition='none';t.style.transform='translate('+p.x+'px,'+p.y+'px)';t.classList.toggle('in',si>=0);
      if(instant){void t.offsetWidth;t.style.transition=''}}}
  function label(){for(var k=0;k<len;k++){var si=inSlot.indexOf(k);tiles[k].setAttribute('aria-label','Letter '+inst.words[wi].s.charAt(k)+(si>=0?', placed in slot '+(si+1)+', tap to take back':', tap to place'))}}
  var ANA={};function anas(){var cur=inst.words[wi];if(ANA[wi])return ANA[wi];var k=srt(cur.w);return ANA[wi]=CC.words(len).filter(function(w){return srt(w)===k}).concat([cur.w])}
  function dead(){var g=guess();return g.length>0&&g.length<len&&!anas().some(function(a){return a.slice(0,g.length)===g})}
  function stuckChk(){if(dead())ZK.stuck(stage,true,{kind:'dead',text:'No word starts like this',onUndo:function(){ctl.undo()}});else ZK.stuck(stage,false)}   /* 1.2.4: legal but lost: the kit says it on a hint, 3 tiles later or after 10 s idle */
  function guess(){return inSlot.map(function(k){return inst.words[wi].s.charAt(k)}).join('')}
  function tapTile(k){if(fin||locked)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);var si=inSlot.indexOf(k);
    tiles.forEach(function(t){t.classList.remove('wrong')});
    if(si>=0){inSlot.splice(si,1);undoStack.push(['out',k,si]);ZK.sfx('lift');ZK.buzz('tap');layout();label();stuckChk();return}
    if(inSlot.length>=len)return;inSlot.push(k);undoStack.push(['in',k]);last=tiles[k];placed++;api.moved();   /* 1.2.1: every tile placed is a move; taking one back does not refund it */
    ZK.sfx('click',{p:inSlot.length*2});ZK.buzz('tap');layout();label();
    if(inSlot.length===len)check();else stuckChk()}
  function check(){var g=guess(),cur=inst.words[wi];
    if(valid(cur.w,g)){locked=true;pips.set(wi+1);var ts=inSlot.map(function(k){return tiles[k]});
      ts.forEach(function(t,j){t.classList.add('ok');ZK.anim(t,[{translate:'0 0'},{translate:'0 -9px'},{translate:'0 0'}],340,ZK.SPRING,j*60)});
      ZK.sfx('cap',{n:wi});ZK.buzz('cap');
      if(wi===inst.words.length-1){fin=true;api.say('That spells '+g+'. All done.');
        setTimeout(function(){api.done({solved:true,moves:placed,hints:hints,undos:undos,extra:{par:inst.par,words:inst.words.length}})},rm?0:200+len*35)}
      else setTimeout(function(){wi++;locked=false;undoStack=[];if(!rm)ts.forEach(function(t,j){ZK.anim(t,[{opacity:1},{opacity:0,transform:t.style.transform+' scale(.6)'}],200,'ease-in',j*20,'forwards')});setTimeout(build,rm?0:260+len*20)},rm?60:680)}
    else{inSlot.forEach(function(k){tiles[k].classList.add('wrong')});ZK.wrong(slotEls[0],{});ZK.sfx('soft');api.say('That is not a word. Tap a letter to take it back.')}}
  sh.onclick=function(){if(fin||locked)return;var free=[];for(var k=0;k<len;k++)if(inSlot.indexOf(k)<0)free.push(homeOf[k]);if(free.length<2)return;
    var rng=pzRng('sc|'+Date.now()),mix=pzShuffle(free,rng);for(var q=0,k2=0;k2<len;k2++)if(inSlot.indexOf(k2)<0)homeOf[k2]=mix[q++];
    ZK.sfx('roll');ZK.buzz('tap');layout();ZK.anim(sh,[{transform:'rotate(0)'},{transform:'rotate(180deg)'}],320,ZK.SPRING)};
  function key(e){if(fin||locked||e.ctrlKey||e.metaKey||e.altKey)return;if(/^[a-zA-Z]$/.test(e.key)){var t=area.querySelector('.sc-t[data-ch="'+e.key.toLowerCase()+'"]:not(.in)');if(t)t.click()}else if(e.key==='Backspace'&&inSlot.length)tapTile(inSlot[inSlot.length-1])}
  stage.addEventListener('keydown',key);
  build();if(!rm&&inst.level>0)requestAnimationFrame(function(){tiles.forEach(function(t,j){ZK.anim(t,[{opacity:0,scale:'.6'},{opacity:1,scale:'1'}],240,ZK.SPRING,j*35)})});
  if(inst.level===1){var cur0=inst.words[0],ord=[];cur0.w.split('').forEach(function(c){for(var k=0;k<len;k++)if(cur0.s.charAt(k)===c&&ord.indexOf(k)<0){ord.push(k);break}});
    ghost=ZK.ghost(stage,[{tap:tiles[ord[0]],hold:800,down:function(){}},{tap:tiles[ord[1]],hold:800}],{id:ID,level:1,delay:900})}
  idle=ZK.idle(stage,22000);
  function nextNeeded(){var cur=inst.words[wi],g=guess(),w=cur.w;
    /* the best target: the stored answer, or if the player's prefix already fits it, continue it */
    var ans=w;if(!valid(w,g+'')&&g.length){}
    var k=0;while(k<g.length&&g.charAt(k)===ans.charAt(k))k++;return{ans:ans,ok:k,bad:k<g.length}}
  var ctl={
    undo:function(){if(fin||locked||!inSlot.length)return false;var k=inSlot.pop();undos++;tiles.forEach(function(t){t.classList.remove('wrong')});layout();label();stuckChk();ZK.sfx('undo');ZK.buzz('tap');return true},
    restart:function(){if(fin||locked)return;inSlot=[];tiles.forEach(function(t){t.classList.remove('wrong')});for(var k=0;k<len;k++)homeOf[k]=k;layout();label();ZK.unmark(stage);ZK.stuck(stage,false);ZK.sfx('undo')},
    hint:function(lv){if(fin||locked)return null;hints++;ZK.unmark(stage);var n=nextNeeded();
      if(n.bad){/* take back the first wrong letter and everything after it */ if(lv>=2){while(inSlot.length>n.ok)inSlot.pop();layout();label();return 'Took the wrong letters back.'}
        var wk=inSlot[n.ok];ZK.mark(tiles[wk]);return 'This letter does not fit here.'}
      var c=n.ans.charAt(n.ok),t=null;for(var k=0;k<len;k++)if(inSlot.indexOf(k)<0&&inst.words[wi].s.charAt(k)===c){t=k;break}
      if(t===null)return null;
      if(lv<=1){var A=n.ans,E=['ing','ion','ed','er','ly','es','al','ent','est','ure'].filter(function(x){return A.length>x.length+2&&A.slice(-x.length)===x})[0];
        if(E&&!n.ok)return 'It ends in -'+E.toUpperCase()+'. Set those letters aside and look at what is left.';ZK.mark(tiles[t]);return 'Start with this letter.'}
      if(lv===2){ZK.mark(tiles[t]);return 'This letter comes next.'}
      while(inSlot.length<len&&!fin&&!locked){var n2=nextNeeded(),c2=n2.ans.charAt(n2.ok),t2=null;for(var q=0;q<len;q++)if(inSlot.indexOf(q)<0&&inst.words[wi].s.charAt(q)===c2){t2=q;break}if(t2===null)break;tapTile(t2)}
      return 'Spelled it for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();stage.removeEventListener('keydown',key);root.textContent=''},
    moves:function(){return placed},   /* 1.2.4: the count the header, the Reel chip and the win card all show */
    lastEl:function(){return last},
    state:function(){return{word:wi,placed:inSlot.length,fin:fin}}};return ctl}

ZK.override({id:ID,name:'Scramble',family:'word',theme:'F3',
  blurb:'Put the jumbled letters back into words.',
  how:'Tap the letters in order to spell the word. Every tile you place counts, so see the word first.',
  areas:['attention','flex'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var h=res.hints||0,p=(inst&&inst.par)||res.moves,m=res.moves;
    return{stars:pzStarsByPar(m,p,h),line:CC.pl(inst.words.length,'word')+', '+CC.pl(m,'tile')+' placed. The fewest is '+p+'.'}}});
})();
