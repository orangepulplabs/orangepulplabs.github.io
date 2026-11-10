/* Zest v6: Last Letter Chain. Overrides puzzles_e2.js through ZK.override. Generator, par and the proof chain (inst.sol) are the original's.
   Rule: each word starts with the last letter of the one before; no repeats; build the chain to the target length.
   Board: the chain is a stack of word cards (the joining letter is lit on both cards), and a tray of 4 words to pick from, so there is no typing.
   Aha: some offered words are dead ends (a word whose last letter leaves no way to finish). The tray always holds at least one safe word, and from level 3 at least one trap when one exists.
   A pick that makes the chain unfinishable shows the stuck chip with a big Undo at once. From level 21 a struck letter badge shows the banned last letter.
   par = the target number of added words (exact: any finished chain needs that many). */
(function(){
var ID='last-letter-chain',CC=window.V6C,E=window.PZE2;
function last(w){return w.charAt(w.length-1)}
function ctxOf(inst){var ok=E.llc.ok(inst.minLen,inst.noEnd);return{ok:ok,bf:E.llc.byFirst(ok)}}
function live(c,lastL,used,need){if(need<=0)return true;return !!E.llc.find(c.bf,lastL,used,need,null,2500)}
function cands(inst,c,chain,rng,level){var l=last(chain[chain.length-1]),used={};chain.forEach(function(w){used[w]=1});var need=inst.target-(chain.length-1),all=(c.bf[l]||[]).filter(function(w){return !used[w]});
  all=pzShuffle(all,rng).slice(0,14);var L=[],D=[];
  all.forEach(function(w){var u={};for(var k in used)u[k]=1;u[w]=1;(live(c,last(w),u,need-1)?L:D).push(w)});
  var nl=L.length?(D.length&&level>=3?2:Math.min(4,L.length)):0,pick=L.slice(0,nl).concat(D.slice(0,4-nl));
  if(pick.length<4)pick=pick.concat(L.slice(nl,nl+4-pick.length));
  return{list:pzShuffle(pick,rng),live:L.length>0,liveSet:L}}
var TARGET=[3,3,4, 4,5,4,5, 6,5,6,7,6, 7,8,7,8,9,8, 9,10,8,9,10,11,9, 10,11,12,10,12];
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var p=E.llc.params(level),T=TARGET[level-1],ok=E.llc.ok(p.minLen,p.noEnd),bf=E.llc.byFirst(ok),maxL=level<=10?5:7,
    starts=pzShuffle(CC.allWords().filter(function(w){return w.length>=p.minLen&&w.length<=maxL}),rng),sol=null,st,k;
  for(k=0;k<starts.length&&k<400;k++){st=starts[k];var u={};u[st]=1;sol=E.llc.find(bf,last(st),u,T,rng,4000);if(sol)break}
  return{title:'Level '+level,level:level,start:st,target:T,par:T,parExact:true,minLen:p.minLen,noEnd:p.noEnd,sol:sol,seed:pzInt(rng,1e9)}}
function plan(inst){var out=[];for(var k=0;k<inst.target;k++)out.push('.ll-c[data-live="1"]');return out}
CC[ID]={make:make,plan:plan,cands:cands,ctxOf:ctxOf,live:live,last:last};

var CSS=''
+'.ll{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:var(--font)}'
+'.ll-top{display:flex;align-items:center;gap:12px;min-height:34px}'
+'.ll-ban{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;box-shadow:0 0 0 2.5px var(--ink);font:800 1.1rem var(--disp,var(--font));text-transform:uppercase;position:relative}.ll-ban:after{content:"";position:absolute;left:3px;right:3px;top:50%;height:3px;background:#E9A23B;transform:rotate(-35deg);border-radius:2px}'
+'.ll-chain{width:100%;min-height:150px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;padding:6px 0}'
+'.ll-w{display:flex;gap:3px;padding:6px 8px;border-radius:14px;background:var(--surface);box-shadow:0 0 0 2px var(--edge)}'
+'.ll-w span{min-width:24px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:7px;font:800 1.15rem/1 var(--disp,var(--font));text-transform:uppercase;color:var(--ink)}'
+'.ll-w.old{opacity:.5;transform:scale(.9)}.ll-w span.hl{background:var(--accent);color:var(--on-accent)}'
+'.ll-link{width:3px;height:10px;background:var(--accent);border-radius:2px;margin:-4px 0}'
+'.ll-tray{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;padding:8px;border-radius:20px;background:var(--tint);box-sizing:border-box;min-height:140px}'
+'.ll-c{all:unset;box-sizing:border-box;min-height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:var(--surface);box-shadow:0 0 0 2px var(--edge),0 4px 0 var(--edge);cursor:pointer;font:800 1.15rem/1 var(--disp,var(--font));color:var(--ink);text-transform:uppercase;letter-spacing:.03em;padding:0 6px;text-align:center;overflow-wrap:anywhere}'
+'.ll-c b{color:var(--accent);font-weight:800}.ll-c u{text-decoration:none;color:var(--link,#B23A07)}'
+'.ll-c:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'.zk-rm .ll-c{transition:none}';

function mount(root,inst,api){CC.css();ZK.css(CSS,'ll-css');
  var rm=ZK.rm(api),c=ctxOf(inst),chain=[inst.start],hints=0,undos=0,fin=false,lastEl=null,ghost=null,idle=null,tray,cur=null,stage=CC.stage(root,'ll',api),top=CC.el('div','ll-top'),board=CC.el('div','ll-chain zk-board'),tr=CC.el('div','ll-tray'),
      ctr=ZK.counter({icon:'<svg viewBox="0 0 24 24"><path d="M9 15l6-6M8 12l-2 2a3.5 3.5 0 005 5l2-2M16 12l2-2a3.5 3.5 0 00-5-5l-2 2" fill="none" stroke="#E8590C" stroke-width="2.4" stroke-linecap="round"/></svg>',zero:false,label:function(k){return k+' of '+inst.target+' words added'}}),pips=ZK.pips(inst.target);
  top.appendChild(ctr.el);if(inst.noEnd){var b=CC.el('span','ll-ban');b.textContent=inst.noEnd;b.setAttribute('role','img');b.setAttribute('aria-label','No word may end in '+inst.noEnd);top.appendChild(b)}
  stage.appendChild(top);stage.appendChild(board);stage.appendChild(tr);stage.appendChild(pips.el);
  function wcard(w,old,prev){var d=CC.el('div','ll-w'+(old?' old':''));w.split('').forEach(function(ch,k){var s=CC.el('span',(k===0&&prev)||k===w.length-1?'hl':'');s.textContent=ch;d.appendChild(s)});d.setAttribute('aria-label',w);return d}
  function paint(addIdx){board.textContent='';var from=Math.max(0,chain.length-4);for(var k=from;k<chain.length;k++){if(k>from){var l=CC.el('i','ll-link');board.appendChild(l)}var d=wcard(chain[k],k<chain.length-1&&k<chain.length-2,k>0);if(k===addIdx){ZK.anim(d,[{transform:'translateY(40px) scale(.8)',opacity:0},{transform:'none',opacity:1}],280,ZK.SPRING)}board.appendChild(d)}
    ctr.set(chain.length-1);pips.set(chain.length-1)}
  function paintTray(){tr.textContent='';if(fin)return;var rng=pzRng('ll'+inst.seed+chain.join()),need=inst.target-(chain.length-1),cs=cands(inst,c,chain,rng,inst.level),first=last(chain[chain.length-1]);
    cur=cs;var stuck=!cs.live;
    if(stuck){ZK.stuck(stage,true,{text:'No way to finish from here',onUndo:function(){ctl.undo()}});return}
    ZK.stuck(stage,false);
    cs.list.forEach(function(w,k){var b=CC.btn('ll-c','Add '+w,function(){pick(w,b)});b.setAttribute('data-w',w);b.setAttribute('data-live',cs.liveSet.indexOf(w)>=0?'1':'0');b.setAttribute('data-zkc','');
      b.innerHTML='<b>'+w.charAt(0)+'</b>'+w.slice(1,-1)+'<u>'+last(w)+'</u>';tr.appendChild(b);ZK.anim(b,[{transform:'translateY(16px) scale(.85)',opacity:0},{transform:'none',opacity:1}],220,ZK.SPRING,k*40)})}
  function pick(w,b){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);chain.push(w);lastEl=b;api.moved();ZK.sfx('click',{p:chain.length});ZK.buzz('move');paint(chain.length-1);
    if(chain.length-1>=inst.target){fin=true;tr.textContent='';ZK.sfx('cap',{n:2});setTimeout(function(){api.done({solved:true,moves:chain.length-1,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:380)}else paintTray()}
  var ctl={
    undo:function(){if(fin||chain.length<2)return false;chain.pop();undos++;ZK.unmark(stage);paint();paintTray();ZK.sfx('undo');ZK.buzz('tap');return true},
    restart:function(){if(fin)return;chain=[inst.start];ZK.unmark(stage);paint();paintTray();ZK.sfx('undo')},
    hint:function(lv){if(fin||!cur||!cur.live)return null;hints++;ZK.unmark(stage);var w=cur.liveSet[0],b=tr.querySelector('[data-live="1"]');
      if(lv<=1){return 'Look at the last letter of each word. Does it leave a way on?'}
      if(b){if(lv===2){ZK.mark(b);return 'This one keeps the chain alive.'}b.click();return 'Added one for you.'}return null},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();root.textContent=''},
    lastEl:function(){return lastEl},
    state:function(){return{n:chain.length-1,fin:fin}}};
  paint();paintTray();
  if(inst.level===1){ghost=ZK.ghost(stage,[{tap:{getBoundingClientRect:function(){var x=tr.querySelector('[data-live="1"]')||tr;return x.getBoundingClientRect()}},hold:900}],{id:ID,level:1,delay:900})}
  idle=ZK.idle(stage,22000);
  return ctl}

ZK.override({id:ID,name:'Last Letter Chain',family:'word',theme:'F3',
  blurb:'Chain words: each starts with the last letter of the one before.',
  how:'Tap a word that starts with the lit letter. Avoid dead ends.',
  areas:['flex','speed'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){return{stars:pzStarsByPar(res.moves,inst.par,res.hints),line:'A chain of '+inst.target+' words.'}}});
})();
