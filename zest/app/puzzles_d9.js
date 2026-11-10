/* Zest puzzles, wave 2 file d9: Nine Rings, Living Stones, Seed Pits, Tiger and Herd.
   Loaded after puzzles_kit.js. Every make(level,rng) is pure (no Math.random, no DOM): the same seed gives the same puzzle on every device.
   Generators and solvers are exposed on PZD9 for tests/pzd9_logic.js. mount() returns {undo,hint,restart,moves,destroy}; hint(n) returns the sentence and (level 3) may perform the step.
   Inst fields: nine-rings {n,start,par}; living-stones {size,rows,target,type,k,par,sol,tpl}; seed-pits {pits,target,par}; tiger-and-herd {tigers,goats,par}.
   Everything is drawn as SVG/DOM built in code. All wording is about the puzzle only: no claims about the brain. No audio. */
var PZD9={};
(function(){
var CSS='.d9{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.d9 *{box-sizing:border-box}'
+'.d9-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.d9-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.d9-prog{margin:0;font-weight:700;font-size:1rem;text-align:center;overflow-wrap:anywhere}'
+'.d9-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.d9-btn{min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer}'
+'.d9-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(48px,1fr));gap:6px;width:100%}'
+'.d9-ring,.d9-pit{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:48px;min-height:64px;padding:2px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);cursor:pointer;font:700 .8125rem var(--font)}'
+'.d9-ring svg,.d9-pit svg{width:40px;height:36px;display:block}'
+'.d9-ring[aria-disabled=true]{border-style:dashed;background:var(--tint)}'
+'.d9-ring.d9-hint,.d9-pit.d9-hint,.d9-pt.d9-hint{outline:3px dashed var(--ink);outline-offset:2px}'
+'.d9-ring.d9-hint::before,.d9-pit.d9-hint::before,.d9-pt.d9-hint::before{content:"?";position:absolute;top:-3px;left:3px;font:800 .75rem var(--font);color:var(--ink)}'
+'.d9-pit.d9-last{border-width:4px}'
+'.d9-pit.d9-empty{border-style:dashed;background:var(--tint)}'
+'.d9 text{font-family:var(--font);font-weight:800;text-anchor:middle;fill:var(--ink)}'
+'.d9-board{position:relative;width:100%;max-width:300px;background:var(--tint);border:2px solid var(--edge);border-radius:var(--r1)}'
+'.d9-board svg.d9-lines{position:absolute;left:0;top:0;width:100%;height:100%}'
+'.d9-pt{position:absolute;transform:translate(-50%,-50%);width:48px;height:48px;min-width:48px;min-height:48px;padding:0;border:0;background:transparent;color:var(--ink);cursor:pointer;border-radius:50%}'
+'.d9-pt svg{width:44px;height:44px;display:block;margin:2px}'
+'.d9-pt.d9-last{outline:3px solid var(--ink);outline-offset:-2px}'
+'.d9-pt .d9n{font-size:10px;font-weight:700;fill:var(--muted)}'
+'.d9-note{margin:0;text-align:center;font-size:.8125rem;line-height:1.4;color:var(--muted)}'
+'@media (prefers-reduced-motion:reduce){.d9 *,.d9 *::before{transition:none!important;animation:none!important}}'
+'.phone.rm .d9 *,.phone.rm .d9 *::before{transition:none!important;animation:none!important}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pzd9-css'))return;var s=document.createElement('style');s.id='pzd9-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function B(txt,fn,at){at=at||{};at.class='d9-btn '+(at.class||'');return pzBtn(txt,fn,at)}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'d9 '+cls});root.appendChild(w);return w}
function plural(n,w,pl){return n+' '+(n===1?w:(pl||w+'s'))}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
var NS='http://www.w3.org/2000/svg';
function sv(tag,at,txt){var e=document.createElementNS(NS,tag);Object.keys(at||{}).forEach(function(k){e.setAttribute(k,at[k])});if(txt!==undefined)e.textContent=txt;return e}
function say2(msg,api,t){msg.textContent=t;if(api.say)api.say(t)}
/* shared: delays done() by 350 ms, adds the toolbar (Undo / Hint / Restart), mutes the page's own live regions when api.say exists */
function wrap(m){return function(root,inst,api){var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'d9-row d9-bar'}),w=root.firstChild;
    bar.appendChild(B('Undo',function(){lv=0;c.undo()},{'aria-label':'Undo'}));
    bar.appendChild(B('Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)},{'aria-label':'Hint'}));
    bar.appendChild(B('Restart',function(){lv=0;c.restart()},{'aria-label':'Restart this level'}));
    if(w)w.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,moves:c.moves,destroy:function(){clearTimeout(tm);c.destroy()}}}}
function starsFn(unit,tail){return function(res,inst){var par=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0,s=pzStarsByPar(m,par,h),u=res.undos||0;if(u>3&&s>2)s=2;
  return{stars:s,line:'You finished in '+plural(m,unit)+' with '+hintsLine(h)+(u?' and '+plural(u,'undo'):'')+'. '+tail(par)}}}

/* ================= 1. Nine Rings ================= */
/* n rings in a row, ring 1 first. Rule: ring 1 may always be taken off or put back; ring k (k>1) may be toggled only when ring k-1 is on and rings 1..k-2 are all off.
   State = bitmask (bit i set = ring i+1 on). Goal: all off. Moves are reversible, so one BFS from the goal gives every distance. Fewest moves from all-on is floor(2^(n+1)/3): 1,2,5,10,21,42,85,170,341. */
function nrCan(s,i){if(i===0)return true;if(!(s>>(i-1)&1))return false;return (s&((1<<(i-1))-1))===0}
function nrDist(n){var N=1<<n,d=[],q=[0],i,h=0;for(i=0;i<N;i++)d.push(-1);d[0]=0;
  while(h<q.length){var s=q[h++];for(i=0;i<n;i++)if(nrCan(s,i)){var t=s^(1<<i);if(d[t]<0){d[t]=d[s]+1;q.push(t)}}}return d}
function nrN(level){return 3+Math.floor((level-1)*6/29)}
function nrMake(level,rng){var n=nrN(level),d=nrDist(n),N=1<<n,M=d[N-1],f=(level-1)/29,start;
  if(level===30)start=N-1;else{var lo=0.3+0.6*f,hi=Math.min(1,lo+0.25),c=[];for(var s=1;s<N;s++)if(d[s]>=Math.ceil(lo*M)&&d[s]<=Math.ceil(hi*M))c.push(s);
    if(!c.length)for(s=1;s<N;s++)c.push(s);start=c[pzInt(rng,c.length)]}
  return{level:level,title:'Level '+level,n:n,start:start,par:d[start]}}
function nrBest(n,s){var d=nrDist(n),i;if(!s)return -1;for(i=0;i<n;i++)if(nrCan(s,i)&&d[s^(1<<i)]===d[s]-1)return i;return -1}
PZD9.nr={make:nrMake,dist:nrDist,can:nrCan,size:nrN};
function ringSvg(on,num){var s=sv('svg',{viewBox:'0 0 40 36','aria-hidden':'true',focusable:'false'});
  s.appendChild(sv('rect',{x:'2',y:'16',width:'36',height:'4',rx:'2',fill:'var(--ink)'}));
  if(on)s.appendChild(sv('ellipse',{cx:'20',cy:'18',rx:'11',ry:'14',fill:'none',stroke:'var(--ink)','stroke-width':'4'}));
  else s.appendChild(sv('ellipse',{cx:'20',cy:'30',rx:'8',ry:'4',fill:'none',stroke:'var(--ink)','stroke-width':'2','stroke-dasharray':'3 3'}));
  s.appendChild(sv('text',{x:'20',y:on?'22':'12','font-size':'11'},String(num)));return s}
function mountNr(root,inst,api){
  var w=shell(root,'d9-nr'),n=inst.n,s,hist,moves,hints,undos,fin,hl=-1,btn=[],i,
    info=pzEl('p',{class:'d9-info',text:'Take every ring off the bar. Ring 1 can always move. Any other ring can move only when the ring just before it is on and every ring before that one is off. Tap a ring to take it off or put it back.'}),
    prog=pzEl('p',{class:'d9-prog'}),grid=pzEl('div',{class:'d9-grid',role:'group','aria-label':'Rings 1 to '+n}),msg=pzEl('p',{class:'d9-msg',role:'status'});
  function say(t){say2(msg,api,t)}
  function reset(){s=inst.start;hist=[];moves=0;fin=false;hl=-1}
  function onList(){var a=[];for(var k=0;k<n;k++)if(s>>k&1)a.push(k+1);return a}
  function paint(){var l=onList();prog.textContent='Rings still on: '+(l.length?l.join(', '):'none')+'. Moves: '+moves+'. Shortest: '+inst.par+'.';
    for(var k=0;k<n;k++){var b=btn[k],on=s>>k&1,can=nrCan(s,k);b.textContent='';b.appendChild(ringSvg(on,k+1));b.appendChild(pzEl('span',{text:on?'on':'off'}));
      b.className='d9-ring'+(hl===k?' d9-hint':'');b.setAttribute('aria-disabled',can?'false':'true');
      b.setAttribute('aria-label','Ring '+(k+1)+', '+(on?'on the bar':'off the bar')+', '+(can?'can move':'stuck')+(hl===k?', hint':''))}}
  function why(k){if(!(s>>(k-1)&1))return'Ring '+(k+1)+' is stuck: ring '+k+' must be on first.';return'Ring '+(k+1)+' is stuck: rings 1 to '+(k-1)+' must be off first.'}
  function tap(k){if(fin)return false;if(!nrCan(s,k)){say(why(k));return false}
    hist.push(s);s^=1<<k;moves++;hl=-1;api.moved();paint();
    if(!s){fin=true;say('All rings are off in '+plural(moves,'move')+'.');api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par,n:n}})}
    else say('Ring '+(k+1)+' '+((s>>k&1)?'put back on':'taken off')+'. Rings on: '+onList().join(', ')+'.');return true}
  hints=0;undos=0;reset();
  for(i=0;i<n;i++)(function(k){var b=pzBtn('',function(){tap(k)},{class:'d9-ring','aria-label':'Ring '+(k+1)});btn.push(b);grid.appendChild(b)})(i);
  w.appendChild(info);w.appendChild(prog);w.appendChild(grid);w.appendChild(msg);paint();
  return{undo:function(){if(fin||!hist.length)return false;s=hist.pop();moves++;undos++;hl=-1;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted. The starting rings are on the bar again.')},
    moves:function(){return moves},
    hint:function(lv){if(fin)return null;hints++;var k=nrBest(n,s),t;
      if(lv<=1){hl=k;t='Look at the ring marked ?. It starts the shortest way to take them all off.'}
      else if(lv===2){hl=k;t='Move ring '+(k+1)+' ('+((s>>k&1)?'take it off':'put it back on')+').'}
      else{tap(k);return msg.textContent}
      paint();say(t);return t},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'nine-rings',name:'Nine Rings',family:'move',theme:'F8',blurb:'Free a row of linked rings from a bar, one careful move at a time.',
  how:'Tap a ring to take it off or put it back. Ring 1 can always move; another ring can move only if the ring before it is on and all rings before that are off. Remove every ring.',
  areas:['flex','space'],levels:30,secs:150,make:nrMake,mount:wrap(mountNr),
  stars:starsFn('move',function(par){return'The fewest possible is '+par+'.'})});

/* ================= 2. Living Stones ================= */
/* Small Go-style problems on a 5 x 5 board. Black is the player. Rules: a stone or group with no empty neighbour is captured; no suicide; a move may not recreate the board from two plies earlier (simple ko); White may pass.
   'cap' problems: capture the marked white stone's group within k black moves. 'save' problems: keep the marked black stone's group on the board through White's next k replies.
   Positions in GO_TPL were found by search and each has exactly one winning first move at its minimal k, confirmed by the exhaustive solver below and again by a separate solver in the tests. make() turns and flips them. */
var GS=5,GNB=(function(){var a=[],r,c;for(r=0;r<GS;r++)for(c=0;c<GS;c++){var l=[];if(r>0)l.push((r-1)*GS+c);if(r<GS-1)l.push((r+1)*GS+c);if(c>0)l.push(r*GS+c-1);if(c<GS-1)l.push(r*GS+c+1);a.push(l)}return a})();
function goGroup(b,i){var col=b[i],seen={},st=[i],out=[],libs={},nl=0;seen[i]=1;while(st.length){var p=st.pop();out.push(p);GNB[p].forEach(function(q){if(b[q]===0){if(!libs[q]){libs[q]=1;nl++}}else if(b[q]===col&&!seen[q]){seen[q]=1;st.push(q)}})}return{stones:out,libs:nl}}
function goPlay(b,i,col){if(b[i])return null;var c=b.slice(),opp=3-col;c[i]=col;GNB[i].forEach(function(q){if(c[q]===opp){var g=goGroup(c,q);if(!g.libs)g.stones.forEach(function(s){c[s]=0})}});
  if(!goGroup(c,i).libs)return null;return c}
function goKey(b){return b.join('')}
function goMoves(b,prev,col,pass){var out=[],pk=prev?goKey(prev):null;for(var i=0;i<GS*GS;i++){var n=goPlay(b,i,col);if(n&&goKey(n)!==pk)out.push({i:i,b:n})}if(pass)out.push({i:-1,b:b});return out}
/* capture: black to move, can black capture the group holding stone t within `left` black moves against any defence? */
function capAny(b,prev,left,t){var ms=goMoves(b,prev,1,false);for(var a=0;a<ms.length;a++){var n=ms[a].b;if(n[t]!==2)return true;if(left>1){var ws=goMoves(n,b,2,true),all=true;for(var k=0;k<ws.length;k++)if(!capAny(ws[k].b,n,left-1,t)){all=false;break}if(all&&ws.length)return true}}return false}
function capMoves(b,prev,left,t){var ms=goMoves(b,prev,1,false),out=[];ms.forEach(function(m){var n=m.b,ok=n[t]!==2;if(!ok&&left>1){var ws=goMoves(n,b,2,true);ok=ws.length>0&&ws.every(function(w){return capAny(w.b,n,left-1,t)})}if(ok)out.push(m.i)});return out}
function capNeed(b,prev,t,max){for(var l=1;l<=max;l++)if(capAny(b,prev,l,t))return l;return max+1}
/* save: after black's move (board n, previous board b), can White capture the black stone t within m replies when black answers best? */
function holds(n,b,m,t){var ws=goMoves(n,b,2,true);for(var k=0;k<ws.length;k++){var w=ws[k].b;if(w[t]!==1)return false;if(m>1&&!saveAny(w,n,m-1,t))return false}return true}
function saveAny(b,prev,m,t){var ms=goMoves(b,prev,1,false);for(var a=0;a<ms.length;a++)if(holds(ms[a].b,b,m,t))return true;return false}
function saveMoves(b,prev,m,t){return goMoves(b,prev,1,false).filter(function(x){return holds(x.b,b,m,t)}).map(function(x){return x.i})}
function winMoves(type,b,prev,left,t){return type==='cap'?capMoves(b,prev,left,t):saveMoves(b,prev,left,t)}
/* White's scripted reply after black's move n (from board b). left = black moves still to come (cap) or white replies including this one (save) */
function whiteReply(type,n,b,left,t){var ws=goMoves(n,b,2,true),best=null,bv=-1,k;
  if(type==='cap'){for(k=0;k<ws.length;k++){var v=capNeed(ws[k].b,n,t,left);if(v>bv){bv=v;best=ws[k]}}return best}
  for(k=0;k<ws.length;k++){if(ws[k].b[t]!==1)return ws[k]}
  for(k=0;k<ws.length;k++){if(left>1&&ws[k].i>=0&&!saveAny(ws[k].b,n,left-1,t))return ws[k]}
  bv=99;for(k=0;k<ws.length;k++){if(ws[k].i<0)continue;var l=goGroup(ws[k].b,t).libs;if(l<bv){bv=l;best=ws[k]}}return best||ws[ws.length-1]}
function goTf(i,tf){var r=Math.floor(i/GS),c=i%GS,t;if(tf&4){t=r;r=c;c=t}if(tf&1)r=GS-1-r;if(tf&2)c=GS-1-c;return r*GS+c}
function goRows(b){var rows=[],r,c;for(r=0;r<GS;r++){var s='';for(c=0;c<GS;c++)s+=['.','x','o'][b[r*GS+c]];rows.push(s)}return rows}
var GO_TPL=[
{"type":"cap","k":1,"t":23,"sol":17,"rows":["ox..o",".x.xx","xoxxo","...x.","xxoox"]},
{"type":"cap","k":1,"t":4,"sol":14,"rows":["o..xo","xoxoo",".oxx.","x.oxo","..o.x"]},
{"type":"cap","k":1,"t":0,"sol":6,"rows":["oxxx.","o...o","x..o.","x....","x.x.."]},
{"type":"cap","k":1,"t":23,"sol":18,"rows":["....o","oox.x","xx..x",".o..o","xxxoo"]},
{"type":"cap","k":1,"t":24,"sol":14,"rows":[".xo..","..o..","o.x..","x..xo","..xoo"]},
{"type":"cap","k":1,"t":16,"sol":20,"rows":[".o...",".x.x.",".xxxo","xoxxx",".ooxx"]},
{"type":"cap","k":1,"t":21,"sol":17,"rows":[".o.x.","o.o..","xxx.o","xo..o","ooxo."]},
{"type":"cap","k":1,"t":14,"sol":18,"rows":["..o..","o.oox",".x.xo","x...o","ooxxo"]},
{"type":"cap","k":1,"t":15,"sol":10,"rows":["...ox","...ox",".o.xx","ox.ox","oxo.x"]},
{"type":"cap","k":1,"t":23,"sol":18,"rows":[".....",".oxx.",".oo.x","x...x","..xoo"]},
{"type":"cap","k":1,"t":4,"sol":9,"rows":[".oxoo","xx.x.","x.oo.",".x.x.",".xxoo"]},
{"type":"cap","k":1,"t":16,"sol":22,"rows":["..oox",".....","xxoo.","xoxx.","oo..."]},
{"type":"cap","k":2,"t":2,"sol":6,"rows":["xoo.o","x.x.x",".ox.o","..oo.",".x.o."]},
{"type":"cap","k":2,"t":2,"sol":8,"rows":[".xoo.","..x..","xx.ox",".o..x","o...."]},
{"type":"cap","k":2,"t":5,"sol":15,"rows":["..xoo","ox..x","ox.x.",".x.x.","ooxo."]},
{"type":"cap","k":2,"t":2,"sol":6,"rows":["x.ox.","o.ox.","..xo.",".xx..","xx.xo"]},
{"type":"cap","k":2,"t":15,"sol":11,"rows":[".xx..","xx...","x.x.x","oox.x",".oxox"]},
{"type":"cap","k":2,"t":21,"sol":17,"rows":[".....","oox.x",".x...","xo..x",".ox.."]},
{"type":"cap","k":2,"t":9,"sol":8,"rows":["oo.xo","....o",".xx..","x.x.x","x.xxx"]},
{"type":"cap","k":2,"t":23,"sol":18,"rows":["ox.xo","..xoo",".xx..","o...x","ox.oo"]},
{"type":"save","k":1,"t":14,"sol":13,"rows":[".x.x.","x.o.o","xo..x","...ox","...oo"]},
{"type":"save","k":1,"t":22,"sol":17,"rows":[".o.x.","xo.oo","x.xxx",".o.oo",".oxxo"]},
{"type":"save","k":1,"t":24,"sol":18,"rows":["x.xo.",".xo.o","oxx..",".x..o","oooxx"]},
{"type":"save","k":1,"t":14,"sol":22,"rows":["x.xo.","o.o.o","x..ox","...ox","o..xx"]},
{"type":"save","k":1,"t":23,"sol":21,"rows":["oo.o.","...ox","...ox","..xo.","o.oxx"]},
{"type":"save","k":1,"t":4,"sol":8,"rows":["..oox","....x","o...o",".....","xx..."]},
{"type":"save","k":2,"t":11,"sol":16,"rows":["..ooo",".oo..",".xxo.","o.o.x","ox..o"]},
{"type":"save","k":2,"t":3,"sol":1,"rows":["..xxo","x.oo.","o..o.","..xxx","o.xxx"]},
{"type":"save","k":2,"t":1,"sol":7,"rows":[".xooo","xx...","ooox.","x..x.","oo.o."]},
{"type":"save","k":2,"t":23,"sol":21,"rows":["oo.o.","...ox","...ox","..xo.","o.oxx"]},
{"type":"save","k":2,"t":4,"sol":8,"rows":["..oox","....x","o...o",".....","xx..."]},
{"type":"save","k":2,"t":15,"sol":16,"rows":["..oxx","o.o..",".xo..","x.ooo","xo.xo"]},
{"type":"cap","k":3,"t":2,"sol":7,"rows":[".xoo.","ox..x",".o.ox","oxxx.","....x"]},
{"type":"cap","k":3,"t":6,"sol":11,"rows":["xoxxx",".ox.x","...xx","..xx.","x..o."]},
{"type":"cap","k":3,"t":2,"sol":6,"rows":["oxo..","o.o.x",".xx..","oo.ox",".xx.x"]},
{"type":"cap","k":3,"t":3,"sol":13,"rows":["...o.",".xxox","..x..",".xo.o","o.x.o"]},
{"type":"cap","k":3,"t":2,"sol":7,"rows":[".xooo","xx...","ooox.","x..x.","oo.o."]}];
function goBoard(rows){var b=[];rows.forEach(function(r){r.split('').forEach(function(ch){b.push(ch==='x'?1:ch==='o'?2:0)})});return b}
function goPick(level){var type,k;if(level<=10){type='cap';k=1}else if(level<=17){type='cap';k=2}else if(level<=23){type='save';k=1}else if(level<=27){type='save';k=2}else{type='cap';k=3}
  return GO_TPL.filter(function(t){return t.type===type&&t.k===k})}
function goMake(level,rng){var pool=goPick(level);if(!pool.length)pool=GO_TPL;var t=pool[pzInt(rng,pool.length)],tf=pzInt(rng,8),b=goBoard(t.rows),nb=[],i;
  for(i=0;i<GS*GS;i++)nb[goTf(i,tf)]=b[i];
  return{level:level,title:'Level '+level,size:GS,rows:goRows(nb),target:goTf(t.t,tf),type:t.type,k:t.k,par:t.k,sol:goTf(t.sol,tf),tpl:GO_TPL.indexOf(t)}}
PZD9.go={make:goMake,tpl:function(){return GO_TPL},play:goPlay,winMoves:winMoves,board:goBoard,rows:goRows,capAny:capAny,saveAny:saveAny,whiteReply:whiteReply,groupOf:goGroup,tf:goTf,setTpl:function(a){GO_TPL=a},holds:holds};
function stoneSvg(v,target){var s=sv('svg',{viewBox:'0 0 44 44','aria-hidden':'true',focusable:'false'});
  if(v===0){s.appendChild(sv('circle',{cx:'22',cy:'22',r:'2.5',fill:'var(--ink)'}));return s}
  if(v===1)s.appendChild(sv('circle',{cx:'22',cy:'22',r:'17',fill:'#111',stroke:'#fff','stroke-width':'2'}));
  else{s.appendChild(sv('circle',{cx:'22',cy:'22',r:'17',fill:'#fff',stroke:'#111','stroke-width':'3'}));s.appendChild(sv('circle',{cx:'22',cy:'22',r:'11',fill:'none',stroke:'#111','stroke-width':'1.5'}))}
  if(target)s.appendChild(sv('path',{d:'M22 14 L30 22 L22 30 L14 22 Z',fill:v===1?'#fff':'#111'}));return s}
function mountGo(root,inst,api){
  var w=shell(root,'d9-go'),b0=goBoard(inst.rows),b,prev,hist,bm,hints,undos,fin,last,hl=-1,btn=[],t=inst.target,k=inst.k,type=inst.type,i,
    what=type==='cap'?'Capture the white group marked with a diamond. A group is captured when it has no empty point next to it. Black moves first and you have '+plural(k,'stone')+'.':'Keep the black group marked with a diamond on the board. After each of your stones, White replies; the group is lost if it has no empty point next to it. White gets '+plural(k,'reply','replies')+'.',
    info=pzEl('p',{class:'d9-info',text:what+' A stone may not fill the last empty point of its own group unless it captures. Solid dark stones are Black (yours); stones with a ring are White.'}),
    prog=pzEl('p',{class:'d9-prog'}),board=pzEl('div',{class:'d9-board',role:'group','aria-label':'Board, 5 by 5'}),msg=pzEl('p',{class:'d9-msg',role:'status'});
  board.style.paddingBottom='100%';board.style.height='0';
  var lines=sv('svg',{class:'d9-lines',viewBox:'0 0 100 100',preserveAspectRatio:'none','aria-hidden':'true'}),q;
  for(q=0;q<GS;q++){var p=10+q*20;lines.appendChild(sv('line',{x1:'10',y1:p,x2:'90',y2:p,stroke:'var(--ink)','stroke-width':'1','vector-effect':'non-scaling-stroke'}));lines.appendChild(sv('line',{x1:p,y1:'10',x2:p,y2:'90',stroke:'var(--ink)','stroke-width':'1','vector-effect':'non-scaling-stroke'}))}
  board.appendChild(lines);
  function say(x){say2(msg,api,x)}
  function name(i){return 'row '+(Math.floor(i/GS)+1)+', column '+(i%GS+1)}
  function reset(){b=b0.slice();prev=null;hist=[];bm=0;fin=false;last=-1;hl=-1}
  function paint(){prog.textContent=(type==='cap'?'Stones left to play: ':'Replies still to come: ')+(k-bm)+' of '+k+'.';
    for(var j=0;j<GS*GS;j++){var e=btn[j],v=b[j],isT=(type==='cap'?j===t&&v===2:j===t&&v===1);
      e.textContent='';e.appendChild(stoneSvg(v,isT));
      e.className='d9-pt'+(hl===j?' d9-hint':'')+(last===j?' d9-last':'');
      e.setAttribute('aria-label',name(j)+', '+(v===0?'empty':v===1?'black stone':'white stone')+(isT?', marked':'')+(hl===j?', hint':'')+(last===j?', last move':''))}}
  function win(txt){fin=true;paint();say(txt);api.done({solved:true,moves:bm,hints:hints,undos:undos,extra:{par:inst.par,type:type,k:k}})}
  function tap(j){if(fin)return false;var n=goPlay(b,j,1);
    if(!n){say(b[j]?'That point is taken.':'You cannot play there: a stone must keep at least one empty point next to its group, unless it captures.');return false}
    if(prev&&goKey(n)===goKey(prev)){say('That would repeat the earlier board. Play somewhere else first.');return false}
    hist.push({b:b,prev:prev,bm:bm,last:last});var before=b;b=n;prev=before;bm++;last=j;hl=-1;api.moved();
    if(type==='cap'&&b[t]!==2){win('Captured the marked group with '+plural(bm,'stone')+'.');return true}
    var left=k-bm;
    if(type==='cap'&&left<1){paint();say('Out of stones and the group still stands. Press Undo to take your stones back.');return true}
    var wr=whiteReply(type,b,before,type==='cap'?left:k-bm+1,t),txt;
    if(wr&&wr.i>=0){prev=b;b=wr.b;last=wr.i;txt='White answered at '+name(wr.i)+'.'}else{prev=b;txt='White passed.'}
    if(type==='save'){if(b[t]!==1){paint();say('The marked group was captured. Press Undo to take that back and try another move.');return true}
      if(bm>=k){win('The group lives through White’s '+plural(k,'reply','replies')+'.');return true}
      paint();say(txt+' Your move.');return true}
    var ok=capAny(b,prev,left,t);paint();say(txt+(ok?' Your move.':' The group holds on now. Press Undo to try another first move.'));return true}
  hints=0;undos=0;reset();
  for(i=0;i<GS*GS;i++)(function(j){var e=pzBtn('',function(){tap(j)},{class:'d9-pt','aria-label':'Point '+j});e.style.left=(10+(j%GS)*20)+'%';e.style.top=(10+Math.floor(j/GS)*20)+'%';btn.push(e);board.appendChild(e)})(i);
  w.appendChild(info);w.appendChild(prog);w.appendChild(board);w.appendChild(msg);paint();
  return{undo:function(){if(fin||!hist.length)return false;var h=hist.pop();b=h.b;prev=h.prev;bm=h.bm;last=h.last;undos++;hl=-1;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted.')},
    moves:function(){return bm},
    hint:function(lv){if(fin)return null;hints++;var ms=winMoves(type,b,prev,k-bm,t),m,s;
      if(!ms.length){s='This position cannot be won from here. Press Undo to go back a stone.';say(s);return s}
      m=ms[0];
      if(lv<=1){s='The key point is in row '+(Math.floor(m/GS)+1)+'.';hl=-1}
      else if(lv===2){s='Play at '+name(m)+'.';hl=m}
      else{tap(m);return msg.textContent}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'living-stones',name:'Living Stones',family:'grid',theme:'F9',blurb:'Capture a group of stones, or keep yours alive, on a tiny board.',
  how:'You play the dark stones. Tap a point to place a stone. Either capture the marked white group, or keep the marked dark group on the board, in the number of moves shown. Free undo.',
  areas:['space','flex'],levels:30,secs:100,make:goMake,mount:wrap(mountGo),
  stars:starsFn('stone',function(par){return'It can be done in '+par+'.'})});

/* ================= 3. Seed Pits ================= */
/* A ring of 14 pits (one player owns all of them). Pick a non-empty pit, take every seed from it, and sow them one per pit going on round the ring (pit 14 is followed by pit 1).
   If the last seed lands in a pit that already held seeds, capture every seed in that pit (including the one just dropped); landing in an empty pit captures nothing.
   Goal: capture at least `target` seeds. Par = the fewest picks that can reach it: target = the most that d picks can capture, which is more than d-1 picks can. */
var SP_N=14;
function spSow(p,i){var n=p[i],q=p.slice(),pos=i,k;q[i]=0;for(k=0;k<n;k++){pos=(pos+1)%SP_N;q[pos]++}var cap=0;if(q[pos]>1){cap=q[pos];q[pos]=0}return{p:q,cap:cap,last:pos}}
function spBest(p,d){var best=[],j;for(j=0;j<=d;j++)best.push(0);
  (function go(q,depth,cap){if(cap>best[depth])best[depth]=cap;if(depth===d)return;for(var i=0;i<SP_N;i++)if(q[i]){var r=spSow(q,i);go(r.p,depth+1,cap+r.cap)}})(p,0,0);
  for(j=1;j<=d;j++)if(best[j-1]>best[j])best[j]=best[j-1];return best}
function spSolve(p,cap,target,maxD){for(var d=0;d<=maxD;d++){var r=(function go(q,c,left){if(c>=target)return[];if(!left)return null;for(var i=0;i<SP_N;i++)if(q[i]){var s=spSow(q,i),x=go(s.p,c+s.cap,left-1);if(x)return[i].concat(x)}return null})(p,cap,d);if(r)return{d:d,path:r}}return null}
function spLevelD(level){return level<=3?1:level<=11?2:level<=21?3:4}
function spMake(level,rng){var d=spLevelD(level),hi=3+Math.floor((level-1)*4/29),att,p,i,bst,f=[3,3,3,3,3,3,3,3,3,3,3,3,3,3];
  for(att=0;att<300;att++){p=[];for(i=0;i<SP_N;i++)p.push(pzInt(rng,hi+1));
    if(p.filter(function(x){return x>0}).length<7)continue;bst=spBest(p,d);if(bst[d]>bst[d-1]&&bst[d]>=3)return{level:level,title:'Level '+level,pits:p,target:bst[d],par:d}}
  return{level:level,title:'Level '+level,pits:f,target:spBest(f,1)[1],par:1}}
PZD9.sp={make:spMake,sow:spSow,best:spBest,solve:spSolve};
function pitSvg(c){var s=sv('svg',{viewBox:'0 0 40 36','aria-hidden':'true',focusable:'false'}),k,m=Math.min(c,8);
  s.appendChild(sv('ellipse',{cx:'20',cy:'18',rx:'18',ry:'15',fill:'none',stroke:'var(--ink)','stroke-width':c?'2.5':'1.5','stroke-dasharray':c?'0':'3 3'}));
  for(k=0;k<m;k++)s.appendChild(sv('circle',{cx:8+(k%4)*8,cy:k<4?9:15,r:'2.6',fill:'var(--ink)'}));
  s.appendChild(sv('text',{x:'20',y:'30','font-size':'12'},String(c)));return s}
function mountSp(root,inst,api){
  var w=shell(root,'d9-sp'),p,cap,picks,hist,hints,undos,fin,last=-1,hl=-1,btn=[],i,
    info=pzEl('p',{class:'d9-info',text:'Pits go round in a ring, numbered 1 to 14. Tap a pit to lift its seeds and drop them one at a time into the next pits. If the last seed lands in a pit that already had seeds, you capture all the seeds in that pit. Capture '+inst.target+' seeds.'}),
    prog=pzEl('p',{class:'d9-prog'}),grid=pzEl('div',{class:'d9-grid',role:'group','aria-label':'Pits 1 to 14'}),msg=pzEl('p',{class:'d9-msg',role:'status'});
  function say(t){say2(msg,api,t)}
  function reset(){p=inst.pits.slice();cap=0;picks=0;hist=[];fin=false;last=-1;hl=-1}
  function paint(){prog.textContent='Captured: '+cap+' of '+inst.target+'. Picks: '+picks+'. Shortest: '+inst.par+'.';
    for(var k=0;k<SP_N;k++){var b=btn[k];b.textContent='';b.appendChild(pitSvg(p[k]));
      b.className='d9-pit'+(hl===k?' d9-hint':'')+(last===k?' d9-last':'')+(p[k]?'':' d9-empty');b.setAttribute('aria-disabled',p[k]?'false':'true');
      b.setAttribute('aria-label','Pit '+(k+1)+', '+plural(p[k],'seed')+(hl===k?', hint':'')+(last===k?', last seed landed here':''))}}
  function tap(k){if(fin)return false;if(!p[k]){say('Pit '+(k+1)+' is empty. Pick a pit with seeds.');return false}
    hist.push({p:p,cap:cap,last:last});var n=p[k],r=spSow(p,k);p=r.p;cap+=r.cap;last=r.last;picks++;hl=-1;api.moved();paint();
    say('Sowed '+plural(n,'seed')+' from pit '+(k+1)+'. The last seed landed in pit '+(r.last+1)+(r.cap?' and captured '+r.cap+'.':', which was empty, so nothing was captured.'));
    if(cap>=inst.target){fin=true;say('Captured '+cap+' seeds in '+plural(picks,'pick')+'.');api.done({solved:true,moves:picks,hints:hints,undos:undos,extra:{par:inst.par,target:inst.target}})}return true}
  hints=0;undos=0;reset();
  for(i=0;i<SP_N;i++)(function(k){var b=pzBtn('',function(){tap(k)},{class:'d9-pit','aria-label':'Pit '+(k+1)});btn.push(b);grid.appendChild(b)})(i);
  w.appendChild(info);w.appendChild(prog);w.appendChild(grid);w.appendChild(msg);paint();
  return{undo:function(){if(fin||!hist.length)return false;var h=hist.pop();p=h.p;cap=h.cap;last=h.last;picks--;undos++;hl=-1;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted.')},
    moves:function(){return picks},
    hint:function(lv){if(fin)return null;hints++;var sol=spSolve(p,cap,inst.target,Math.max(1,inst.par-picks+1)),s;
      if(!sol){s='From here the target is out of reach in a few picks. Press Undo to go back.';say(s);return s}
      var k=sol.path[0];
      if(lv<=1){hl=-1;s='Look at the '+(k<7?'first':'second')+' half of the ring (pits '+(k<7?'1 to 7':'8 to 14')+').'}
      else if(lv===2){hl=k;s='Pick pit '+(k+1)+'.'}
      else{tap(k);return msg.textContent}
      paint();say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'seed-pits',name:'Seed Pits',family:'move',theme:'F9',blurb:'Sow seeds round a ring of pits and capture a target number.',
  how:'Tap a pit to lift its seeds and drop one in each next pit. A last seed landing in a pit that already had seeds captures that pit. Capture the target in as few picks as you can.',
  areas:['flex','space'],levels:30,secs:90,make:spMake,mount:wrap(mountSp),
  stars:starsFn('pick',function(par){return'The fewest possible is '+par+'.'})});

/* ================= 4. Tiger and Herd ================= */
/* A 15-point triangle (rows of 1 to 5 points, lines along rows and both slanting directions). Three tigers stand on points, some goats may already be placed.
   You place goats one at a time on empty points. After each placement, if no tiger has a move, you win. Otherwise the tigers follow a fixed habit:
     1. if any tiger can jump over a neighbouring goat along a line into an empty point, the first such jump (tiger 1 first, then jump directions in a fixed order) is made and that goat is removed;
     2. otherwise the first tiger that can step to a neighbouring empty point does so, to its lowest-numbered neighbour.
   A tiger with no step and no jump is stuck. Par = the fewest goat placements that trap all three, found by breadth-first search. */
var TH_N=15,TH_RC=(function(){var a=[],r,c;for(r=0;r<5;r++)for(c=0;c<=r;c++)a.push([r,c]);return a})();
function thId(r,c){return r>=0&&r<5&&c>=0&&c<=r?r*(r+1)/2+c:-1}
var TH_DIR=[[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1]];
var TH_NB=TH_RC.map(function(x){var l=[];TH_DIR.forEach(function(d){var q=thId(x[0]+d[0],x[1]+d[1]);if(q>=0)l.push(q)});return l.sort(function(a,b){return a-b})});
var TH_JP=TH_RC.map(function(x){var l=[];TH_DIR.forEach(function(d){var o=thId(x[0]+d[0],x[1]+d[1]),t=thId(x[0]+2*d[0],x[1]+2*d[1]);if(o>=0&&t>=0)l.push([o,t])});return l});
function thTiger(s){var t=s.t,g=s.g,i,j,occ=function(p){return t.indexOf(p)>=0||(g>>p&1)===1};
  for(i=0;i<3;i++)for(j=0;j<TH_JP[t[i]].length;j++){var o=TH_JP[t[i]][j][0],to=TH_JP[t[i]][j][1];if((g>>o&1)&&!occ(to)){var nt=t.slice();nt[i]=to;return{t:nt,g:g&~(1<<o),jump:o,tiger:i,to:to}}}
  for(i=0;i<3;i++)for(j=0;j<TH_NB[t[i]].length;j++){var q=TH_NB[t[i]][j];if(!occ(q)){var nt2=t.slice();nt2[i]=q;return{t:nt2,g:g,tiger:i,to:q}}}
  return null}
function thFree(s){var a=[];for(var p=0;p<TH_N;p++)if(s.t.indexOf(p)<0&&!(s.g>>p&1))a.push(p);return a}
function thKey(s){return s.t.join(',')+'|'+s.g}
function thSolve(s,maxD){var q=[{s:s,d:0,f:-1}],h=0,seen={},k;seen[thKey(s)]=1;
  while(h<q.length){var c=q[h++];if(c.d>=maxD)continue;var fr=thFree(c.s);
    for(k=0;k<fr.length;k++){var p=fr[k],s2={t:c.s.t,g:c.s.g|1<<p},f=c.f<0?p:c.f,s3=thTiger(s2);if(!s3)return{d:c.d+1,first:f};
      var ns={t:s3.t,g:s3.g},key=thKey(ns);if(!seen[key]){seen[key]=1;q.push({s:ns,d:c.d+1,f:f})}}}return null}
function thLevelPar(level){return 1+Math.floor((level-1)*4/29)}
/* positions are built backwards: random tigers, goats added at random until the tigers are stuck, then `want` goats are taken away; the search then confirms the true fewest placements */
function thMake(level,rng){var want=thLevelPar(level),att,i;
  for(att=0;att<400;att++){var pts=pzShuffle(seq(TH_N),rng),t=pts.slice(0,3),g=0,placed=[];
    for(i=3;i<TH_N;i++){g|=1<<pts[i];placed.push(pts[i]);if(!thTiger({t:t,g:g}))break}
    if(thTiger({t:t,g:g})||placed.length<want)continue;
    var rm=pzShuffle(placed,rng).slice(0,want);rm.forEach(function(p){g&=~(1<<p)});
    var s={t:t,g:g};if(!thTiger(s))continue;var r=thSolve(s,want+(att>300?1:0));
    if(r&&(r.d===want||att>300))return{level:level,title:'Level '+level,tigers:t,goats:g,par:r.d}}
  return{level:level,title:'Level '+level,tigers:[0,1,2],goats:0,par:thSolve({t:[0,1,2],g:0},9).d}}
PZD9.th={make:thMake,tiger:thTiger,solve:thSolve,nb:TH_NB,jp:TH_JP,free:thFree};
function pieceSvg(kind,num){var s=sv('svg',{viewBox:'0 0 44 44','aria-hidden':'true',focusable:'false'});
  if(kind==='t'){s.appendChild(sv('circle',{cx:'22',cy:'22',r:'17',fill:'#111',stroke:'#fff','stroke-width':'2'}));s.appendChild(sv('path',{d:'M12 12 L17 17 M32 12 L27 17',stroke:'#fff','stroke-width':'3','stroke-linecap':'round'}));s.appendChild(sv('text',{x:'22',y:'28','font-size':'14',style:'fill:#fff'},'T'))}
  else if(kind==='g'){s.appendChild(sv('circle',{cx:'22',cy:'22',r:'15',fill:'#fff',stroke:'#111','stroke-width':'3'}));s.appendChild(sv('text',{x:'22',y:'27','font-size':'14',style:'fill:#111'},'G'))}
  else{s.appendChild(sv('circle',{cx:'22',cy:'22',r:'13',fill:'var(--surface)',stroke:'var(--ink)','stroke-width':'1.5','stroke-dasharray':'3 3'}));s.appendChild(sv('text',{x:'22',y:'26','class':'d9n'},String(num)))}
  return s}
function mountTh(root,inst,api){
  var w=shell(root,'d9-th'),s,hist,placed,lost,hints,undos,fin,last=-1,hl=-1,btn=[],i,
    info=pzEl('p',{class:'d9-info',text:'You are the herd. Tap an empty point to place a goat (G). Trap all three tigers (T) so none of them can step or jump. A tiger jumps over a goat next to it along a line if the point beyond is empty.'}),
    habit=pzEl('p',{class:'d9-note',text:'After each goat the tigers follow a fixed habit: they take the first jump they can find; if there is none, the first tiger that can move steps to its lowest-numbered neighbouring point.'}),
    prog=pzEl('p',{class:'d9-prog'}),board=pzEl('div',{class:'d9-board',role:'group','aria-label':'Triangle board with 15 points'}),msg=pzEl('p',{class:'d9-msg',role:'status'});
  board.style.height='330px';
  function X(p){var r=TH_RC[p][0],c=TH_RC[p][1];return 50+(c-r/2)*19}
  function Y(p){return 30+TH_RC[p][0]*66}
  var lines=sv('svg',{class:'d9-lines',viewBox:'0 0 100 330',preserveAspectRatio:'none','aria-hidden':'true'}),a;
  for(a=0;a<TH_N;a++)(function(a){TH_NB[a].forEach(function(q){if(q>a)lines.appendChild(sv('line',{x1:X(a),y1:Y(a),x2:X(q),y2:Y(q),stroke:'var(--ink)','stroke-width':'1.4','vector-effect':'non-scaling-stroke'}))})})(a);
  board.appendChild(lines);
  function say(t){say2(msg,api,t)}
  function reset(){s={t:inst.tigers.slice(),g:inst.goats};hist=[];placed=0;lost=0;fin=false;last=-1;hl=-1}
  function paint(){prog.textContent='Goats placed: '+placed+'. Goats lost: '+lost+'. Shortest: '+inst.par+'.';
    for(var k=0;k<TH_N;k++){var e=btn[k],kind=s.t.indexOf(k)>=0?'t':(s.g>>k&1)?'g':'e';e.textContent='';e.appendChild(pieceSvg(kind,k+1));
      e.className='d9-pt'+(hl===k?' d9-hint':'')+(last===k?' d9-last':'');
      e.setAttribute('aria-label','Point '+(k+1)+', '+(kind==='t'?'tiger':kind==='g'?'goat':'empty')+(hl===k?', hint':'')+(last===k?', last move':''))}}
  function tap(p){if(fin)return false;if(s.t.indexOf(p)>=0||(s.g>>p&1)){say('Point '+(p+1)+' is taken. Tap an empty point.');return false}
    hist.push({s:s,placed:placed,lost:lost,last:last});var s2={t:s.t,g:s.g|1<<p};placed++;last=p;hl=-1;api.moved();var tm=thTiger(s2);
    if(!tm){s=s2;fin=true;paint();say('All three tigers are trapped with '+plural(placed,'goat')+'.');api.done({solved:true,moves:placed,hints:hints,undos:undos,extra:{par:inst.par,lost:lost}});return true}
    var txt='Goat on point '+(p+1)+'. ';
    if(tm.jump!==undefined){lost++;txt+='A tiger jumped to point '+(tm.to+1)+' and a goat was lost.'}else txt+='Tiger '+(tm.tiger+1)+' stepped to point '+(tm.to+1)+'.';
    s={t:tm.t,g:tm.g};paint();say(txt);return true}
  hints=0;undos=0;reset();
  for(i=0;i<TH_N;i++)(function(p){var e=pzBtn('',function(){tap(p)},{class:'d9-pt','aria-label':'Point '+(p+1)});e.style.left=X(p)+'%';e.style.top=Y(p)+'px';btn.push(e);board.appendChild(e)})(i);
  w.appendChild(info);w.appendChild(habit);w.appendChild(prog);w.appendChild(board);w.appendChild(msg);paint();
  return{undo:function(){if(fin||!hist.length)return false;var h=hist.pop();s=h.s;placed=h.placed;lost=h.lost;last=h.last;undos++;hl=-1;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted.')},
    moves:function(){return placed},
    hint:function(lv){if(fin)return null;hints++;var r=thSolve(s,9),t;
      if(!r){t='No short trap from here. Press Undo to go back.';say(t);return t}
      var p=r.first;
      if(lv<=1){hl=-1;t='A trap is possible in '+plural(r.d,'more goat')+'. Think about where the tigers could still move.'}
      else if(lv===2){hl=p;t='Place a goat on point '+(p+1)+'.'}
      else{tap(p);return msg.textContent}
      paint();say(t);return t},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'tiger-and-herd',name:'Tiger and Herd',family:'move',theme:'F9',blurb:'Place goats to trap three tigers that follow a fixed habit.',
  how:'Tap empty points to place goats. Tigers jump over a goat if they can, otherwise step. Trap all three tigers so none can move, using as few goats as you can.',
  areas:['space','flex'],levels:30,secs:100,make:thMake,mount:wrap(mountTh),
  stars:starsFn('goat',function(par){return'The fewest possible is '+par+'.'})});
})();
