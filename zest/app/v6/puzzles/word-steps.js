/* Zest v6: Word Steps (word ladder). Overrides puzzles_b.js through ZK.override.
   Rule: change one letter at a time; every step must be a real word. Goal word is shown on top; its letters light up in your word when they match.
   Board: tap a letter of your word, a tray offers ONLY the letters that make a real word (no 26-key keyboard, no wrong guesses to type), tap one and the tile flips.
   par = the shortest path (BFS, exact). Aha filter: from level 4 the shortest path is longer than the number of differing letters, so a detour is needed (a letter must
   first move AWAY from the goal). From level 13 the detour is at least 2 longer. */
(function(){
var ID='word-steps',CC=window.V6C;
var PAR=[2,2,3, 3,4,4,3, 4,5,5,4, 5,6,5,6,7, 5,6,7,7,8, 6,7,8,8,9, 7,8,9,8];
function ham(a,b){var n=0;for(var i=0;i<a.length;i++)if(a.charAt(i)!==b.charAt(i))n++;return n}
function lenFor(L,rng){return L<=6?3:L<=14?4:(pzInt(rng,2)?5:4)}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var D=PAR[level-1],G=PZB.ws,len=lenFor(level,rng),minGap=level<4?0:level<13?1:2,tries=0;
  while(tries++<4){var g=G.graph(len),order=pzShuffle(g.ws.map(function(_,i){return i}),rng),best=null;
    for(var oi=0;oi<order.length;oi++){var s=order[oi];if(g.adj[s].length<2)continue;var d=G.dist(g,s),c=[];
      for(var k=0;k<d.length;k++)if(d[k]===D&&g.adj[k].length>=2&&D-ham(g.ws[s],g.ws[k])>=minGap)c.push(k);
      if(c.length){var t=c[pzInt(rng,c.length)];return{level:level,title:'Level '+level,len:len,start:g.ws[s],goal:g.ws[t],par:D,parExact:true,gap:D-ham(g.ws[s],g.ws[t])}}}
    minGap=Math.max(0,minGap-1)}
  throw new Error('no word pair for level '+level)}
/* the shortest path as a list of words (start..goal), by BFS from the goal */
function path(inst,from){var g=PZB.ws.graph(inst.len),gd=PZB.ws.dist(g,g.idx[inst.goal]),cur=from||inst.start,out=[cur];
  while(cur!==inst.goal){var u=g.idx[cur],nx=null;for(var k=0;k<g.adj[u].length;k++){var v=g.adj[u][k];if(gd[v]===gd[u]-1){nx=g.ws[v];break}}if(!nx)return null;out.push(nx);cur=nx}
  return out}
/* test plan: selectors to tap, in order */
function plan(inst){var p=path(inst),out=[];for(var i=1;i<p.length;i++){var a=p[i-1],b=p[i],k=0;while(a.charAt(k)===b.charAt(k))k++;out.push('.ws-cur [data-p="'+k+'"]');out.push('.ws-tray [data-c="'+b.charAt(k)+'"]')}return out}
CC['word-steps']={make:make,path:path,plan:plan,PAR:PAR,ham:ham};

var CSS=''
+'.ws{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:var(--font)}'
+'.ws-goal{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:18px;border:2.5px dashed var(--edge);background:transparent}'
+'.ws-goal svg{width:22px;height:22px;flex:none}'
+'.ws-goal .ws-g{width:34px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font:800 1.2rem/1 var(--disp,var(--font));text-transform:uppercase;color:var(--ink);background:var(--tint);transition:background .2s,color .2s}'
+'.ws-goal .ws-g.ok{background:var(--ok-bg,#ddefe2);color:var(--ok-ink,#14532d)}'
+'.ws-board{width:100%;display:flex;flex-direction:column;align-items:center;gap:7px;padding:8px 6px 4px}'
+'.ws-his{display:flex;flex-direction:column;align-items:center;gap:3px;min-height:56px;justify-content:flex-end}'
+'.ws-h{display:flex;gap:4px;opacity:.55}.ws-h span{width:28px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:var(--surface);box-shadow:0 0 0 1.5px var(--line,#ddd);font:800 .95rem/1 var(--disp,var(--font));text-transform:uppercase;color:var(--ink)}'
+'.ws-h span.ch{background:var(--tint);box-shadow:0 0 0 1.5px var(--accent)}'
+'.ws-cur{gap:8px}.ws-cur .cc-t{width:clamp(48px,15.5vw,60px);height:clamp(54px,17vw,66px);font-size:1.9rem}'
+'.ws-tray{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-content:flex-start;min-height:112px;width:100%;padding:6px 4px;border-radius:20px;background:var(--tint);box-shadow:inset 0 2px 8px rgba(0,0,0,.06)}'
+'.ws-tray .cc-t{width:50px;height:52px;font-size:1.5rem}'
+'.ws-tray .ws-hint{align-self:center;margin:auto;opacity:.55}.ws-tray .ws-hint svg{width:38px;height:38px}'
+'.ws-tray.on{box-shadow:inset 0 0 0 2.5px var(--accent)}'
+'.ws-pips{margin-top:2px}';
var ARROW='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v13M6 12l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var FLAG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4M6 5h11l-2.5 4L17 13H6" fill="#F6B73C" stroke="#8A4300" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>';

function mount(root,inst,api){CC.css();ZK.css(CSS,'ws-css');
  var g=PZB.ws.graph(inst.len),len=inst.len,rm=ZK.rm(api),chain=[inst.start],sel=-1,hints=0,undos=0,fin=false,last=null,ghost=null,idle=null,gd=PZB.ws.dist(g,g.idx[inst.goal]),offs=[];
  var stage=CC.stage(root,'ws',api),goal=CC.el('div','ws-goal'),board=CC.el('div','ws-board zk-board'),his=CC.el('div','ws-his'),cur=CC.el('div','cc-row ws-cur'),tray=CC.el('div','ws-tray'),pips=ZK.pips(inst.par);
  goal.innerHTML=FLAG;var gl=[];for(var i=0;i<len;i++){var s=CC.el('span','ws-g');s.textContent=inst.goal.charAt(i);goal.appendChild(s);gl.push(s)}
  goal.setAttribute('role','img');goal.setAttribute('aria-label','Goal word '+inst.goal);
  var tiles=[];for(i=0;i<len;i++)(function(p){var b=CC.btn('cc-t','',function(){pickPos(p)});b.setAttribute('data-p',p);b.setAttribute('data-zkc','');tiles.push(b);cur.appendChild(b)})(i);
  board.appendChild(his);board.appendChild(cur);stage.appendChild(goal);stage.appendChild(board);stage.appendChild(tray);pips.el.className+=' ws-pips';stage.appendChild(pips.el);
  function word(){return chain[chain.length-1]}
  function paintHis(){his.textContent='';var from=Math.max(0,chain.length-3);for(var k=from;k<chain.length-1;k++){var r=CC.el('div','ws-h'),prev=chain[k-1],w=chain[k];for(var j=0;j<len;j++){var c=CC.el('span',prev&&prev.charAt(j)!==w.charAt(j)?'ch':'');c.textContent=w.charAt(j);r.appendChild(c)}his.appendChild(r)}}
  function paintCur(flipPos){var w=word();for(var j=0;j<len;j++){var t=tiles[j],ch=w.charAt(j),ok=ch===inst.goal.charAt(j);
      var apply=(function(t,ch,ok,j){return function(){t.textContent=ch;t.className='cc-t'+(ok?' ok':'')+(sel===j?' sel':'');t.setAttribute('aria-label','Letter '+(j+1)+' of '+len+', '+ch+(ok?', matches the goal':'')+(sel===j?', chosen':''))}})(t,ch,ok,j);
      if(j===flipPos)CC.flip(t,apply);else apply();gl[j].className='ws-g'+(ok?' ok':'')}
    pips.set(chain.length-1)}
  function paintTray(){tray.textContent='';tray.classList.toggle('on',sel>=0);
    if(sel<0||fin){tray.innerHTML='<span class="ws-hint">'+ARROW+'</span>';return}
    var u=g.idx[word()],seen={},letters=[];g.adj[u].forEach(function(v){var w=g.ws[v];if(w.charAt(sel)!==word().charAt(sel)&&w.slice(0,sel)===word().slice(0,sel)&&w.slice(sel+1)===word().slice(sel+1)&&!seen[w.charAt(sel)]){seen[w.charAt(sel)]=1;letters.push(w.charAt(sel))}});
    letters.sort();letters.forEach(function(c,k){var b=CC.btn('cc-t','Change to '+c,function(){pickLetter(c)});b.textContent=c;b.setAttribute('data-c',c);tray.appendChild(b);
      ZK.anim(b,[{transform:'translateY(14px) scale(.7)',opacity:0},{transform:'none',opacity:1}],200,ZK.SPRING,k*22)})}
  function pickPos(p){if(fin)return;if(ghost)ghost.stop();ZK.unmark(stage);sel=sel===p?-1:p;ZK.sfx('lift');ZK.buzz('tap');paintCur();paintTray()}
  function pickLetter(c){if(fin||sel<0)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);var p=sel,w=word(),nw=w.slice(0,p)+c+w.slice(p+1);if(g.idx[nw]===undefined){ZK.wrong(tiles[p]);return}
    chain.push(nw);sel=-1;last=tiles[p];api.moved();paintHis();paintCur(p);paintTray();ZK.sfx('click',{p:chain.length});ZK.buzz('move');
    if(nw===inst.goal){fin=true;api.say('You reached '+inst.goal+'.');ZK.sfx('star',{i:0});
      tiles.forEach(function(t,j){ZK.anim(t,[{translate:'0 0'},{translate:'0 -10px'},{translate:'0 0'}],360,ZK.SPRING,160+j*70)});
      setTimeout(function(){api.done({solved:true,moves:chain.length-1,hints:hints,undos:undos,extra:{par:inst.par,len:len}})},rm?0:220+len*40)}}
  function key(e){if(fin||e.ctrlKey||e.metaKey||e.altKey)return;if(/^[a-zA-Z]$/.test(e.key)&&sel>=0){var b=tray.querySelector('[data-c="'+e.key.toLowerCase()+'"]');if(b)b.click()}else if(e.key==='Escape'){sel=-1;paintCur();paintTray()}}
  stage.addEventListener('keydown',key);
  paintHis();paintCur();paintTray();
  if(inst.level===1){var pth=path(inst),k0=0;while(pth[0].charAt(k0)===pth[1].charAt(k0))k0++;var c0=pth[1].charAt(k0);
    ghost=ZK.ghost(stage,[{tap:tiles[k0],down:function(){sel=k0;paintCur();paintTray()},hold:900},{tap:{getBoundingClientRect:function(){var b=tray.querySelector('[data-c="'+c0+'"]');return(b||tiles[k0]).getBoundingClientRect()}},hold:900,up:function(){sel=-1;paintCur();paintTray()}}],{id:ID,level:1,delay:900})}
  idle=ZK.idle(stage,22000);
  return{
    undo:function(){if(fin||chain.length<2)return false;chain.pop();undos++;sel=-1;ZK.unmark(stage);paintHis();paintCur();paintTray();ZK.sfx('undo');ZK.buzz('tap');return true},
    restart:function(){if(fin)return;chain=[inst.start];sel=-1;ZK.unmark(stage);paintHis();paintCur();paintTray();ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var p=path(inst,word());if(!p)return null;hints++;var a=p[0],b=p[1],k=0;while(a.charAt(k)===b.charAt(k))k++;ZK.unmark(stage);
      if(lv<=1){ZK.mark(tiles[k]);return 'Try changing this letter.'}
      if(lv===2){sel=k;paintCur();paintTray();var bt=tray.querySelector('[data-c="'+b.charAt(k)+'"]');ZK.mark(bt);return 'This one makes a word on the way.'}
      sel=k;pickLetter(b.charAt(k));return 'Changed one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();stage.removeEventListener('keydown',key);root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{word:word(),moves:chain.length-1,fin:fin}}}}

ZK.override({id:ID,name:'Word Steps',family:'word',theme:'F3',
  blurb:'Turn one word into another, one letter at a time.',
  how:'Tap a letter, pick a new one. Every step is a real word.',
  areas:['flex','space'],levels:30,secs:75,make:make,mount:mount,
  stars:function(res,inst){var p=(inst&&inst.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:(inst?inst.start.toUpperCase()+' to '+inst.goal.toUpperCase()+' in '+m+' step'+(m===1?'':'s')+'. The fewest is '+p+'.':'')}}});
})();
