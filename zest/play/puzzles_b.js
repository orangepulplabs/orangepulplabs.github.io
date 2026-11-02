/* Zest puzzles, set B: Four by Four, Zero One, Code Cracker, Tube Sort, Scramble, Word Steps.
   Loaded after puzzles_kit.js and wordlist.js. Every make(level,rng) is pure (no Math.random, no DOM) so the same seed gives the same puzzle on every device;
   the generators and solvers are exposed on PZB for the node tests (tests/pzb_logic.js).
   mount() returns {undo,hint,restart,destroy}; hint(n) returns the sentence to show and (level 3) may perform the step; done(res) carries res.extra (see each stars()).
   All wording is about the puzzle only: no claims about the brain. */
var PZB={};
(function(){
var CSS='.pb{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.pb *{box-sizing:border-box}'
+'.pb-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.pb-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.pb-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.pb-btn,.pb-key{min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer}'
+'.pb-btn.pb-main{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}'
+'.pb-btn:disabled,.pb-key:disabled{background:var(--dis-bg);color:var(--dis-ink);border-color:var(--dis-bg);cursor:default}'
+'.pb-key{font-size:1.25rem;padding:4px 0;flex:0 0 auto;width:52px}'
+'.pb-grid{display:grid;width:100%;box-shadow:0 0 0 3px var(--ink);background:var(--surface)}'
+'.pb-cell{position:relative;display:flex;width:100%;align-items:center;justify-content:center;min-width:0;min-height:48px;aspect-ratio:1;margin:0;padding:0;border:1px solid var(--edge);border-radius:0;background:var(--surface);color:var(--ink);font:700 min(1.5rem,7.5vw) var(--font);cursor:pointer;overflow:hidden}'
+'.pb-g8 .pb-cell{min-height:0}'
+'.pb-given{background:var(--ph);cursor:default}'
+'.pb-br{border-right:3px solid var(--ink)}.pb-bb{border-bottom:3px solid var(--ink)}'
+'.pb-sel{outline:3px solid var(--ink);outline-offset:-3px;background:var(--tint)}'
+'.pb-bad{color:var(--bad);text-decoration:underline wavy var(--bad) 1px;text-underline-offset:4px}.pb-bad::after{content:"!";position:absolute;top:0;right:3px;font:800 .75rem var(--font);color:var(--bad)}'
+'.pb-hint::before{content:"?";position:absolute;top:0;left:3px;font:800 .75rem var(--font);color:var(--ink)}'
+'.pb-hint{outline:3px dashed var(--ink);outline-offset:-3px}'
+'.pb-hintrow{background:var(--tint)}'
+'.pb-slots{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}'
+'.pb-slot,.pb-tile{position:relative;display:flex;align-items:center;justify-content:center;width:48px;height:56px;padding:0;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1.5rem var(--font);text-transform:uppercase;cursor:pointer}'
+'.pb-slot{border-style:dashed}.pb-slot.pb-full{border-style:solid;background:var(--tint)}'
+'.pb-tile.pb-used{opacity:.35;cursor:default}'
+'.pb-code .pb-slot{font-size:1.75rem;text-transform:none}'
+'.pb-hist{list-style:none;margin:0;padding:0;width:100%;display:flex;flex-direction:column;gap:6px}'
+'.pb-hist li{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid var(--line);border-radius:var(--r1);background:var(--surface);font-size:.9375rem}'
+'.pb-hist b{font:700 1.25rem var(--font);letter-spacing:.15em}'
+'.pb-tubes{display:flex;flex-wrap:wrap;justify-content:center;gap:16px 8px;width:100%;padding-bottom:22px}'
+'.pb-tube{position:relative;display:flex;flex-direction:column-reverse;justify-content:flex-start;gap:2px;width:50px;min-height:156px;padding:4px;border:3px solid var(--edge);border-radius:6px 6px 22px 22px;background:var(--surface);cursor:pointer;transition:transform .12s ease}'
+'.pb-tube.pb-sel{transform:translateY(-8px);outline:3px solid var(--ink);outline-offset:2px;border-style:double;background:var(--surface)}'
+'.pb-tube.pb-hint{outline:3px dashed var(--ink);outline-offset:2px}.pb-tube.pb-hint::before{top:-16px;left:50%;margin-left:-4px}'
+'.pb-u{display:flex;align-items:center;justify-content:center;height:30px;border:2px solid rgba(0,0,0,.55);border-radius:6px;font:800 1rem var(--font)}'
+'.pb-tn{position:absolute;bottom:-1.5em;left:0;right:0;text-align:center;font:600 .75rem var(--font);color:var(--muted)}'
+'.pb-chain{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;font:700 1.125rem var(--font);text-transform:uppercase;letter-spacing:.08em}'
+'.pb-chain li{padding:6px 10px;border:1px solid var(--line);border-radius:var(--r1);background:var(--surface)}'
+'.pb-chain li.pb-goal{border:2px dashed var(--ink)}'
+'.pb-alpha{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}'
+'.pb-alpha .pb-key{text-transform:uppercase}'
+'.pb-prog{margin:0;font-weight:700;font-size:1rem}'
+'.pb-solved{margin:0;padding:0;list-style:none;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;font-weight:700;text-transform:uppercase;letter-spacing:.06em}'
+'.pb-solved li{padding:2px 10px;border-radius:99px;background:var(--ok-bg);color:var(--ok-ink)}'
+'.pb-solved li::before{content:"\\2713 "}'
+'.phone.rm .pb *,.phone.rm .pb *::before{transition:none!important;animation:none!important}'
+'@media (prefers-reduced-motion:reduce){.pb *,.pb *::before{transition:none!important;animation:none!important}}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pzb-css'))return;var s=document.createElement('style');s.id='pzb-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function B(txt,fn,cls,at){at=at||{};at.class='pb-btn '+(cls||'');return pzBtn(txt,fn,at)}
function K(txt,fn,label){return pzBtn(txt,fn,{class:'pb-key','aria-label':label||txt})}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'pb '+cls});root.appendChild(w);return w}
function plural(n,w){return n+' '+w+(n===1?'':'s')}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
PZB.css=css;

/* every mount is wrapped: done() fires 350 ms after the last move; an Undo / Hint / Restart row is drawn unless api.toolbar===false or inst.toolbar===false (the runner then drives the controller) */
function wrapMount(m,noUndo){return function(root,inst,api){var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'pb-row pb-bar'}),w=root.firstChild;
    bar.appendChild(B(noUndo?'Back':'Undo',function(){lv=0;c.undo()},'',{'aria-label':noUndo?'Erase the last entry':'Undo'}));
    bar.appendChild(B('Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)},'',{'aria-label':'Hint'}));
    bar.appendChild(B('Restart',function(){lv=0;c.restart()},'',{'aria-label':'Restart this level'}));
    if(w)w.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,destroy:function(){clearTimeout(tm);c.destroy()}}}}

/* ---------- 1. Four by Four: Latin square with boxes (4x4 levels 1-10, 6x6 with 2x3 boxes levels 11-30) ---------- */
function fbfDims(level){return level<=10?{n:4,bw:2,bh:2}:{n:6,bw:3,bh:2}}
function fbfIdx(d){if(d.rc)return d;var n=d.n;d.rc=[];d.cc=[];d.bc=[];for(var i=0;i<n*n;i++){var r=Math.floor(i/n),c=i%n;d.rc.push(r);d.cc.push(c);d.bc.push(Math.floor(r/d.bh)*(n/d.bw)+Math.floor(c/d.bw))}return d}
function pop(x){var c=0;while(x){x&=x-1;c++}return c}
/* counts solutions (stops at limit); with rng it tries digits in random order (used to build the full grid). g: 0 = empty */
function fbfSolve(d,g,limit,rng){fbfIdx(d);var n=d.n,N=n*n,full=(1<<(n+1))-2,rm=[],cm=[],bm=[],i,a=g.slice(),cells=[],cnt=0,sol=null;
  for(i=0;i<n;i++){rm.push(0);cm.push(0);bm.push(0)}
  for(i=0;i<N;i++){var v=a[i];if(v){var bit=1<<v;if((rm[d.rc[i]]|cm[d.cc[i]]|bm[d.bc[i]])&bit)return{count:0,sol:null};rm[d.rc[i]]|=bit;cm[d.cc[i]]|=bit;bm[d.bc[i]]|=bit}else cells.push(i)}
  function rec(){var best=-1,av=0,bc=99,k,j;
    for(k=0;k<cells.length;k++){j=cells[k];if(a[j])continue;var m=full&~(rm[d.rc[j]]|cm[d.cc[j]]|bm[d.bc[j]]),p=pop(m);if(p<bc){bc=p;best=j;av=m;if(p<=1)break}}
    if(best<0){cnt++;if(!sol)sol=a.slice();return cnt>=limit}
    if(!bc)return false;
    var ds=[];for(k=1;k<=n;k++)if(av>>k&1)ds.push(k);if(rng)ds=pzShuffle(ds,rng);
    for(k=0;k<ds.length;k++){var x=ds[k],b=1<<x;a[best]=x;rm[d.rc[best]]|=b;cm[d.cc[best]]|=b;bm[d.bc[best]]|=b;
      var stop=rec();rm[d.rc[best]]&=~b;cm[d.cc[best]]&=~b;bm[d.bc[best]]&=~b;a[best]=0;if(stop)return true}
    return false}
  rec();return{count:cnt,sol:sol}}
function fbfMake(level,rng){var d=fbfIdx(fbfDims(level)),n=d.n,N=n*n,z=[],i;for(i=0;i<N;i++)z.push(0);
  var full=fbfSolve(d,z,1,rng).sol,g=full.slice(),clues=N,
    target=n===4?[11,11,10,10,9,9,8,8,7,6][level-1]:Math.round(24-(level-11)*11/19),order=pzShuffle(seq(N),rng);
  for(i=0;i<order.length&&clues>target;i++){var t=g[order[i]];g[order[i]]=0;if(fbfSolve(d,g,2).count!==1)g[order[i]]=t;else clues--}
  return{level:level,title:'Level '+level,n:n,bw:d.bw,bh:d.bh,given:g,sol:full,par:N-clues,clues:clues}}
function fbfConflict(d,cur,i){fbfIdx(d);var v=cur[i];if(!v)return false;for(var j=0;j<cur.length;j++)if(j!==i&&cur[j]===v&&(d.rc[j]===d.rc[i]||d.cc[j]===d.cc[i]||d.bc[j]===d.bc[i]))return true;return false}
function fbfCand(d,cur,i){fbfIdx(d);var k=[],used={};for(var j=0;j<cur.length;j++)if(cur[j]&&(d.rc[j]===d.rc[i]||d.cc[j]===d.cc[i]||d.bc[j]===d.bc[i]))used[cur[j]]=1;for(var v=1;v<=d.n;v++)if(!used[v])k.push(v);return k}
/* next helpful cell: a placed digit that is wrong, else the empty cell with the fewest choices */
function fbfTarget(inst,cur){var d=fbfIdx({n:inst.n,bw:inst.bw,bh:inst.bh}),best=-1,bc=99,i;
  for(i=0;i<cur.length;i++)if(!inst.given[i]&&cur[i]&&cur[i]!==inst.sol[i])return{i:i,fix:true};
  for(i=0;i<cur.length;i++)if(!cur[i]){var c=fbfCand(d,cur,i).length;if(c<bc){bc=c;best=i}}
  return best<0?null:{i:best,fix:false,k:bc}}
PZB.fbf={dims:fbfDims,make:fbfMake,solve:fbfSolve,target:fbfTarget,conflict:fbfConflict};
function mountFbf(root,inst,api){
  var w=shell(root,'pb-fbf'),n=inst.n,N=n*n,d=fbfIdx({n:n,bw:inst.bw,bh:inst.bh}),cur,hist,sel,wrong,hints=0,undos=0,fin,hc,hr,cells=[],i;
  var info=pzEl('p',{class:'pb-info',text:'Put 1 to '+n+' once in every row, every column and every '+inst.bh+' by '+inst.bw+' box. Tap a cell, then a number.'}),
    msg=pzEl('p',{class:'pb-msg',role:'status'}),grid=pzEl('div',{class:'pb-grid pb-g'+n,role:'group','aria-label':n+' by '+n+' number grid'}),pad=pzEl('div',{class:'pb-row'});
  grid.style.gridTemplateColumns='repeat('+n+',minmax(0,1fr))';grid.style.maxWidth=(n*64)+'px';
  function say(t){msg.textContent=t;api.say(t)}
  function reset(){cur=inst.given.slice();hist=[];sel=-1;wrong=0;fin=false;hc=-1;hr=-1}
  reset();
  function lab(i){var r=d.rc[i]+1,c=d.cc[i]+1,v=cur[i];return 'Row '+r+', column '+c+', '+(inst.given[i]?'given '+v:v?'number '+v:'empty')+(fbfConflict(d,cur,i)?', repeats in its row, column or box':'')+(hc===i?', hint':'')}
  function paint(){for(var i=0;i<N;i++){var e=cells[i],v=cur[i],bad=fbfConflict(d,cur,i);e.textContent=v||'';
    e.className='pb-cell'+(inst.given[i]?' pb-given':'')+(sel===i?' pb-sel':'')+(bad?' pb-bad':'')+(hc===i?' pb-hint':'')+(hr===d.rc[i]?' pb-hintrow':'')+((d.cc[i]+1)%inst.bw===0&&d.cc[i]<n-1?' pb-br':'')+((d.rc[i]+1)%inst.bh===0&&d.rc[i]<n-1?' pb-bb':'');
    e.setAttribute('aria-label',lab(i));if(!inst.given[i])e.setAttribute('aria-pressed',sel===i?'true':'false')}}
  function focusCell(j){if(cells[j]&&!inst.given[j]){sel=j;paint();cells[j].focus()}}
  function key(e,i){var r=d.rc[i],c=d.cc[i],s=0;if(e.key==='ArrowRight'&&c<n-1)s=1;else if(e.key==='ArrowLeft'&&c>0)s=-1;else if(e.key==='ArrowDown'&&r<n-1)s=n;else if(e.key==='ArrowUp'&&r>0)s=-n;
    if(s){e.preventDefault();var k=i+s;while(k>=0&&k<N&&inst.given[k]&&((s===1&&k%n!==0)||(s===-1&&k%n!==n-1)||Math.abs(s)===n))k+=s;if(k>=0&&k<N&&!inst.given[k])focusCell(k)}}
  for(i=0;i<N;i++)(function(i){var e;if(inst.given[i])e=pzEl('div',{role:'img'});else{e=pzEl('button',{type:'button'});e.onclick=function(){if(fin)return;sel=i;hc=-1;hr=-1;paint()};e.onkeydown=function(ev){key(ev,i)}}cells.push(e);grid.appendChild(e)})(i);
  function solvedNow(){return cur.every(function(x,k){return x===inst.sol[k]})}
  function finish(){fin=true;paint();api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{wrong:wrong,par:inst.par,n:n}})}
  function place(v){if(fin)return;if(sel<0){say('Tap an empty cell first.');return}if(cur[sel]===v)return;hist.push([sel,cur[sel]]);if(v&&v!==inst.sol[sel])wrong++;cur[sel]=v;hc=-1;hr=-1;api.moved();paint();msg.textContent='';
    if(solvedNow()){say('Solved.');finish()}}
  for(i=1;i<=n;i++)(function(v){pad.appendChild(K(String(v),function(){place(v)},'Number '+v))})(i);
  pad.appendChild(pzBtn('Erase',function(){place(0)},{class:'pb-btn','aria-label':'Erase the selected cell'}));
  w.appendChild(info);w.appendChild(grid);w.appendChild(pad);w.appendChild(msg);
  function onkey(e){if(fin||e.ctrlKey||e.metaKey||e.altKey)return;if(/^[1-9]$/.test(e.key)&&+e.key<=n)place(+e.key);else if(e.key==='Backspace'||e.key==='Delete'||e.key==='0')place(0)}
  w.addEventListener('keydown',onkey);paint();
  return{undo:function(){if(fin||!hist.length)return false;var h=hist.pop();cur[h[0]]=h[1];undos++;hc=-1;hr=-1;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted.')},
    hint:function(lv){if(fin)return null;var t=fbfTarget(inst,cur);if(!t)return null;hints++;var r=d.rc[t.i]+1,c=d.cc[t.i]+1,s;
      if(lv<=1){hr=d.rc[t.i];hc=-1;s=t.fix?'Look at row '+r+'. One of the numbers there does not belong.':'Look at row '+r+'. A cell there has few choices left.'}
      else if(lv===2){hr=-1;hc=t.i;sel=t.i;s=t.fix?'Row '+r+', column '+c+' needs a different number.':'Row '+r+', column '+c+': only '+plural(t.k,'number')+' can go there.'}
      else{hr=-1;hc=t.i;sel=t.i;hist.push([t.i,cur[t.i]]);cur[t.i]=inst.sol[t.i];api.moved();s='Row '+r+', column '+c+' is '+inst.sol[t.i]+'.'}
      paint();msg.textContent=s;api.say(s);if(lv>=3&&solvedNow())finish();return s},
    destroy:function(){w.removeEventListener('keydown',onkey);root.textContent=''}}}
registerPuzzle({id:'four-by-four',name:'Four by Four',family:'grid',blurb:'Fill the grid so every number appears once in each row, column and box.',
  how:'Tap a cell, then tap a number. Each number can appear only once in every row, column and box. Cells marked ! repeat a number.',
  areas:['space','control'],levels:30,secs:150,make:fbfMake,mount:wrapMount(mountFbf),
  stars:function(res,inst){var x=res.extra||{},w=x.wrong||0,h=res.hints||0,s=h===0&&w<=2?3:w<=5?2:1,n=x.n||(inst&&inst.n)||4;
    return{stars:s,line:'You filled the '+n+' by '+n+' grid with '+plural(w,'wrong placement')+' and '+hintsLine(h)+'. There were '+((inst&&inst.par)||x.par)+' empty cells.'}}});

/* ---------- 2. Zero One: fill with 0 and 1, no three equal in a row or column, equal counts in every row and column ----------
   par = fewest taps: a cell that ends as 0 needs one tap (blank, 0), a cell that ends as 1 needs two (blank, 0, 1). */
function zoN(level){return level<=8?4:6}
/* can v go at cell i of grid g (-1 empty) without breaking the rules? checks counts and any three in a row through i, against every filled cell */
function zoOk(g,n,i,v){var r=Math.floor(i/n),c=i%n,h=n/2,k,j,rc=0,cc=0;
  for(k=0;k<n;k++){if(k!==c&&g[r*n+k]===v)rc++;if(k!==r&&g[k*n+c]===v)cc++}
  if(rc>=h||cc>=h)return false;
  for(k=-2;k<=0;k++){if(c+k>=0&&c+k+2<n){var a=0;for(j=0;j<3;j++){var p=c+k+j;if(p===c||g[r*n+p]===v)a++}if(a===3)return false}
    if(r+k>=0&&r+k+2<n){var b=0;for(j=0;j<3;j++){var q=r+k+j;if(q===r||g[q*n+c]===v)b++}if(b===3)return false}}
  return true}
function zoSolve(g,n,limit,rng){var a=g.slice(),cells=[],cnt=0,sol=null,i,N=n*n;for(i=0;i<N;i++)if(a[i]<0)cells.push(i);
  function rec(k){if(k===cells.length){cnt++;if(!sol)sol=a.slice();return cnt>=limit}
    var j=cells[k],o=rng&&rng()<.5?[1,0]:[0,1];
    for(var x=0;x<2;x++){var v=o[x];if(zoOk(a,n,j,v)){a[j]=v;var s=rec(k+1);a[j]=-1;if(s)return true}}return false}
  rec(0);return{count:cnt,sol:sol}}
function zoMake(level,rng){var n=zoN(level),N=n*n,z=[],i;for(i=0;i<N;i++)z.push(-1);
  var full=zoSolve(z,n,1,rng).sol,g=full.slice(),clues=N,
    target=n===4?[11,10,10,9,9,8,8,7][level-1]:Math.round(22-(level-9)*10/21),order=pzShuffle(seq(N),rng);
  for(i=0;i<order.length&&clues>target;i++){var t=g[order[i]];g[order[i]]=-1;if(zoSolve(g,n,2).count!==1)g[order[i]]=t;else clues--}
  var par=0;for(i=0;i<N;i++)if(g[i]<0)par+=full[i]===0?1:2;
  return{level:level,title:'Level '+level,n:n,given:g,sol:full,par:par,empties:N-clues,clues:clues}}
/* cells breaking a rule: three equal in a row/column, or more than half the same digit in a row/column */
function zoBad(g,n){var bad={},r,c,k,v;
  for(r=0;r<n;r++)for(c=0;c<n;c++){v=g[r*n+c];if(v<0)continue;
    if(c+2<n&&g[r*n+c+1]===v&&g[r*n+c+2]===v){bad[r*n+c]=bad[r*n+c+1]=bad[r*n+c+2]=1}
    if(r+2<n&&g[(r+1)*n+c]===v&&g[(r+2)*n+c]===v){bad[r*n+c]=bad[(r+1)*n+c]=bad[(r+2)*n+c]=1}}
  for(r=0;r<n;r++){var rc=[0,0],cc=[0,0];for(c=0;c<n;c++){if(g[r*n+c]>=0)rc[g[r*n+c]]++;if(g[c*n+r]>=0)cc[g[c*n+r]]++}
    for(v=0;v<2;v++){if(rc[v]>n/2)for(k=0;k<n;k++)if(g[r*n+k]===v)bad[r*n+k]=1;if(cc[v]>n/2)for(k=0;k<n;k++)if(g[k*n+r]===v)bad[k*n+r]=1}}
  return bad}
function zoTarget(inst,cur){var n=inst.n,i,f=-1;
  for(i=0;i<cur.length;i++)if(!(inst.given[i]>=0)&&cur[i]>=0&&cur[i]!==inst.sol[i])return{i:i,fix:true};
  for(i=0;i<cur.length;i++)if(cur[i]<0){var a=zoOk(cur,n,i,0),b=zoOk(cur,n,i,1);if(a!==b)return{i:i,fix:false,forced:true};if(f<0)f=i}
  return f<0?null:{i:f,fix:false,forced:false}}
PZB.zo={n:zoN,make:zoMake,solve:zoSolve,bad:zoBad,target:zoTarget};
function mountZo(root,inst,api){
  var w=shell(root,'pb-zo'),n=inst.n,N=n*n,cur,hist,hints=0,undos=0,fin,hc,hr,cells=[],i,bad={},
    info=pzEl('p',{class:'pb-info',text:'Fill every cell with 0 or 1. No three of the same in a row or column, and each row and column has the same number of 0s and 1s. Tap a cell to cycle blank, 0, 1.'}),
    msg=pzEl('p',{class:'pb-msg',role:'status'}),grid=pzEl('div',{class:'pb-grid pb-g'+n,role:'group','aria-label':n+' by '+n+' grid of zeros and ones'});
  grid.style.gridTemplateColumns='repeat('+n+',minmax(0,1fr))';grid.style.maxWidth=(n*64)+'px';
  function say(t){msg.textContent=t;api.say(t)}
  function reset(){cur=inst.given.slice();hist=[];fin=false;hc=-1;hr=-1}reset();
  function lab(i){var v=cur[i];return 'Row '+(Math.floor(i/n)+1)+', column '+(i%n+1)+', '+(inst.given[i]>=0?'given '+v:v>=0?'digit '+v:'empty')+(bad[i]?', breaks a rule':'')+(hc===i?', hint':'')}
  function paint(){bad=zoBad(cur,n);for(var i=0;i<N;i++){var e=cells[i],v=cur[i];e.textContent=v<0?'':v;
    e.className='pb-cell'+(inst.given[i]>=0?' pb-given':'')+(bad[i]?' pb-bad':'')+(hc===i?' pb-hint':'')+(hr===Math.floor(i/n)?' pb-hintrow':'');e.setAttribute('aria-label',lab(i))}}
  function finish(){if(cur.every(function(x,k){return x===inst.sol[k]})){fin=true;say('Solved.');api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par,n:n}});return true}return false}
  function setv(i,v){hist.push([i,cur[i]]);cur[i]=v;hc=-1;hr=-1;api.moved();paint();msg.textContent='';finish()}
  for(i=0;i<N;i++)(function(i){var e;if(inst.given[i]>=0)e=pzEl('div',{role:'img'});else{e=pzEl('button',{type:'button'});
    e.onclick=function(){if(fin)return;setv(i,cur[i]<0?0:cur[i]===0?1:-1)};
    e.onkeydown=function(ev){var r=Math.floor(i/n),c=i%n,k=ev.key;if(k==='0'||k==='1'){if(!fin)setv(i,+k)}else if(k==='Backspace'||k==='Delete'){if(!fin&&cur[i]>=0)setv(i,-1)}
      else{var j=k==='ArrowRight'&&c<n-1?i+1:k==='ArrowLeft'&&c>0?i-1:k==='ArrowDown'&&r<n-1?i+n:k==='ArrowUp'&&r>0?i-n:-1;if(j>=0){ev.preventDefault();if(cells[j].tagName==='BUTTON')cells[j].focus()}}}}
    cells.push(e);grid.appendChild(e)})(i);
  w.appendChild(info);w.appendChild(grid);w.appendChild(msg);paint();
  return{undo:function(){if(fin||!hist.length)return false;var h=hist.pop();cur[h[0]]=h[1];undos++;hc=-1;hr=-1;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted.')},
    hint:function(lv){if(fin)return null;var t=zoTarget(inst,cur);if(!t)return null;hints++;var r=Math.floor(t.i/n)+1,c=t.i%n+1,s;
      if(lv<=1){hr=r-1;hc=-1;s=t.fix?'Look at row '+r+'. One digit there does not belong.':'Look at row '+r+'. Something can be filled in there.'}
      else if(lv===2){hr=-1;hc=t.i;s=t.fix?'Row '+r+', column '+c+' needs the other digit.':'Row '+r+', column '+c+(t.forced?': only one digit fits there.':': try there.')}
      else{hr=-1;hc=t.i;hist.push([t.i,cur[t.i]]);cur[t.i]=inst.sol[t.i];api.moved();s='Row '+r+', column '+c+' is '+inst.sol[t.i]+'.'}
      paint();msg.textContent=s;api.say(s);if(lv>=3)finish();return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'zero-one',name:'Zero One',family:'grid',blurb:'Fill the grid with 0 and 1 using three simple rules.',
  how:'Tap a cell to cycle blank, 0, 1. No three of the same digit in a row or column, and every row and column has equal numbers of 0 and 1.',
  areas:['space','control'],levels:30,secs:150,make:zoMake,mount:wrapMount(mountZo),
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||m,h=res.hints||0,s=m<=Math.ceil(p*1.25)?3:m<=p*2?2:1;if(h&&s===3)s=2;
    return{stars:s,line:'You filled the grid in '+plural(m,'tap')+' with '+hintsLine(h)+'. The most direct route is '+plural(p,'tap')+'.'}}});

/* ---------- 3. Code Cracker ----------
   Feedback: exact = same digit in the same place; wrong place = sum over digits of min(left-over count in code, left-over count in guess) after removing the exact matches (duplicates handled by counts). fb() returns [exact, wrongPlace].
   Par = guesses a simple solver needs: a fixed opener (0123.. or 0011.. when digits can repeat), then always the lowest code that agrees with every clue so far. */
function ccSpec(level){var g=Math.floor((level-1)/5),j=(level-1)%5,T=[[3,[4,4,5,5,6],0,1],[3,[7,8,9,10,10],0,0],[4,[6,7,8,9,10],0,0],[4,[5,6,7,8,10],1,0],[5,[7,8,9,10,10],0,0],[5,[5,6,7,8,10],1,0]][g];
  return{len:T[0],size:T[1][j],rep:!!T[2],lo:T[3]}}
function ccFb(s,g){var ex=0,a=[0,0,0,0,0,0,0,0,0,0],b=[0,0,0,0,0,0,0,0,0,0],i,c=0;for(i=0;i<s.length;i++){if(s[i]===g[i])ex++;else{a[s[i]]++;b[g[i]]++}}for(i=0;i<10;i++)c+=a[i]<b[i]?a[i]:b[i];return[ex,c]}
function ccDecode(sp,x){var d=[],p;for(p=sp.len-1;p>=0;p--){d[p]=sp.lo+x%sp.size;x=Math.floor(x/sp.size)}return d}
function ccValid(sp,d){if(sp.rep)return true;for(var i=0;i<d.length;i++)for(var j=i+1;j<d.length;j++)if(d[i]===d[j])return false;return true}
/* all codes (as indexes, lowest first) that agree with every [guess,fb] in hist; from = an earlier candidate list to narrow */
function ccCands(sp,hist,from){var tot=Math.pow(sp.size,sp.len),out=[],x,k,d,ok,cnt=from?from.length:tot;
  for(x=0;x<cnt;x++){var id=from?from[x]:x;d=ccDecode(sp,id);if(!ccValid(sp,d))continue;ok=true;
    for(k=0;k<hist.length;k++){var f=ccFb(d,hist[k][0]);if(f[0]!==hist[k][1][0]||f[1]!==hist[k][1][1]){ok=false;break}}if(ok)out.push(id)}
  return out}
function ccOpener(sp){var o=[];for(var i=0;i<sp.len;i++)o.push(sp.lo+(sp.rep?Math.floor(i/2):i));return o}
function ccSolve(sp,secret){var g=ccOpener(sp),n=0,c=null;
  for(;;){n++;var f=ccFb(secret,g);if(f[0]===sp.len)return n;c=ccCands(sp,[[g,f]],c);g=ccDecode(sp,c[0])}}
function ccMake(level,rng){var sp=ccSpec(level),d=[],i,ds=[];for(i=0;i<sp.size;i++)ds.push(sp.lo+i);
  if(!sp.rep)d=pzShuffle(ds,rng).slice(0,sp.len);
  else{for(i=0;i<sp.len;i++)d.push(ds[pzInt(rng,sp.size)]);var dup=false;for(i=1;i<d.length;i++)if(d.indexOf(d[i])<i)dup=true;if(!dup){var a=pzInt(rng,sp.len),b=(a+1+pzInt(rng,sp.len-1))%sp.len;d[b]=d[a]}}
  return{level:level,title:'Level '+level,len:sp.len,lo:sp.lo,size:sp.size,rep:sp.rep,code:d,par:ccSolve(sp,d)}}
function ccSay(f,len){if(f[0]===len)return 'All '+len+' in the right place.';return f[0]+' right place, '+f[1]+' right digit wrong place'}
PZB.cc={spec:ccSpec,fb:ccFb,make:ccMake,solve:ccSolve,cands:ccCands,say:ccSay,opener:ccOpener};
function mountCc(root,inst,api){
  var w=shell(root,'pb-code'),len=inst.len,sp={len:len,size:inst.size,rep:inst.rep,lo:inst.lo},guess,sel,hist,hints=0,fin,hp,
    info=pzEl('p',{class:'pb-info',text:'Find the hidden '+len+'-digit code. Digits '+inst.lo+' to '+(inst.lo+inst.size-1)+(inst.rep?'; a digit can appear more than once.':', each used once at most.')+' After each guess you get clues. Tap a box to change it.'}),
    slots=pzEl('div',{class:'pb-slots',role:'group','aria-label':'Your guess'}),pad=pzEl('div',{class:'pb-row'}),ctl=pzEl('div',{class:'pb-row'}),
    msg=pzEl('p',{class:'pb-msg',role:'status'}),list=pzEl('ol',{class:'pb-hist','aria-label':'Your guesses and clues',reversed:'reversed'}),sb=[],check,i;
  function say(t){msg.textContent=t;api.say(t)}
  function reset(){guess=[];for(var i=0;i<len;i++)guess.push(-1);sel=0;hist=[];fin=false;hp=-1;list.textContent=''}reset();
  function paint(){for(var i=0;i<len;i++){var e=sb[i],v=guess[i];e.textContent=v<0?'–':v;e.className='pb-slot'+(v>=0?' pb-full':'')+(sel===i?' pb-sel':'')+(hp===i?' pb-hint':'');
    e.setAttribute('aria-label','Digit '+(i+1)+' of '+len+', '+(v<0?'empty':v)+(hp===i?', hint':''));e.setAttribute('aria-pressed',sel===i?'true':'false')}
    check.disabled=fin||guess.indexOf(-1)>=0}
  function nextEmpty(from){for(var k=1;k<=len;k++){var j=(from+k)%len;if(guess[j]<0)return j}return from}
  function put(d){if(fin)return;if(sel<0)sel=0;guess[sel]=d;hp=-1;sel=nextEmpty(sel);msg.textContent='';paint()}
  function erase(){if(fin)return;if(guess[sel]>=0)guess[sel]=-1;else{for(var k=len-1;k>=0;k--)if(guess[k]>=0){guess[k]=-1;sel=k;break}}paint()}
  for(i=0;i<len;i++)(function(i){var e=pzBtn('',function(){sel=i;paint()},{class:'pb-slot','aria-label':'Digit '+(i+1)});e.textContent='–';sb.push(e);slots.appendChild(e)})(i);
  for(i=0;i<inst.size;i++)(function(d){pad.appendChild(K(String(d),function(){put(d)},'Digit '+d))})(inst.lo+i);
  pad.appendChild(pzBtn('⌫',erase,{class:'pb-key','aria-label':'Erase a digit'}));
  check=B('Check guess',function(){submit()},'pb-main');ctl.appendChild(check);
  function submit(){if(fin||guess.indexOf(-1)>=0)return;if(!inst.rep&&!ccValid(sp,guess)){say('In this code each digit is used once at most. Change a repeated digit.');return}
    var g=guess.slice(),f=ccFb(inst.code,g);hist.push([g,f]);api.moved();
    var li=pzEl('li',{},[pzEl('b',{text:g.join(''),'aria-label':'Guess '+hist.length+': '+g.join(' ')}),pzEl('span',{text:ccSay(f,len)}),pzEl('span',{'aria-hidden':'true',text:Array(f[0]+1).join('●')+Array(f[1]+1).join('○')})]);
    list.insertBefore(li,list.firstChild);
    if(f[0]===len){fin=true;paint();say('Cracked in '+plural(hist.length,'guess')+'.');api.done({solved:true,moves:hist.length,hints:hints,undos:0,extra:{par:inst.par,len:len}});return}
    for(var k=0;k<len;k++)guess[k]=-1;sel=0;hp=-1;say(ccSay(f,len));paint()}
  function onkey(e){if(fin||e.ctrlKey||e.metaKey||e.altKey)return;if(/^[0-9]$/.test(e.key)){var d=+e.key;if(d>=inst.lo&&d<inst.lo+inst.size)put(d)}else if(e.key==='Backspace'){erase()}else if(e.key==='Enter'&&e.target.tagName!=='BUTTON'){submit()}}
  w.addEventListener('keydown',onkey);
  w.appendChild(info);w.appendChild(slots);w.appendChild(pad);w.appendChild(ctl);w.appendChild(msg);w.appendChild(list);paint();
  return{undo:function(){if(fin)return false;var had=guess.some(function(x){return x>=0});erase();return had},restart:function(){reset();paint();say('Restarted. Same code, fresh start.')},
    hint:function(lv){if(fin)return null;var c=ccCands(sp,hist),k,s;if(!c.length)return null;hints++;
      var pos=0,best=99;for(var p=0;p<len;p++){var seen={},n=0;for(k=0;k<c.length;k++){var dg=ccDecode(sp,c[k])[p];if(!seen[dg]){seen[dg]=1;n++}}if(n<best){best=n;pos=p}}
      if(lv<=1){hp=pos;sel=pos;s='Look at digit '+(pos+1)+'. Your clues narrow it down the most.'}
      else if(lv===2){hp=pos;sel=pos;s='Digit '+(pos+1)+' of the code is '+inst.code[pos]+'.'}
      else{var g=ccDecode(sp,c[0]);for(k=0;k<len;k++)guess[k]=g[k];sel=len-1;hp=-1;s='Try '+g.join('')+'. It fits every clue so far. Press Check guess.'}
      paint();msg.textContent=s;api.say(s);return s},
    destroy:function(){w.removeEventListener('keydown',onkey);root.textContent=''}}}
registerPuzzle({undo:false,id:'code-cracker',name:'Code Cracker',family:'number',blurb:'Find the hidden code from the clues after each guess.',
  how:'Type or tap a code and press Check guess. Clues tell you how many digits are right and in the right place, and how many are right but in the wrong place.',
  areas:['space','attention'],levels:30,secs:150,make:ccMake,mount:wrapMount(mountCc,true),
  stars:function(res,inst){var g=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||g,h=res.hints||0,s=g<=p+1?3:g<=p+4?2:1;if(h&&s===3)s=2;
    return{stars:s,line:'You cracked the code in '+plural(g,'guess')+' with '+hintsLine(h)+'. A steady method takes about '+plural(p,'guess')+'.'}}});

/* ---------- 4. Tube Sort ----------
   A tube is a string of colour ids (bottom to top). A pour moves the whole top run of one colour onto a tube whose top is that colour (or is empty) if it all fits (4 per tube).
   make() starts from solved and applies random REVERSE pours, so it is always solvable. par = the exact optimum when A* finishes inside a small node budget, otherwise an upper bound:
   the best of a weighted A* solution and the number of reverse pours used to build the puzzle. inst.parExact says which. */
var TCAP=4,TPAL=[['A','Orange','#E69F00','#000'],['B','Sky blue','#56B4E9','#000'],['C','Green','#009E73','#000'],['D','Yellow','#F0E442','#000'],['E','Blue','#0072B2','#fff'],['F','Red','#D55E00','#000'],['G','Pink','#CC79A7','#000'],['H','Grey','#9A9A9A','#000']];
function tsRun(t){var n=0,c=t.charAt(t.length-1);while(n<t.length&&t.charAt(t.length-1-n)===c)n++;return n}
function tsTry(T,a,b){var A=T[a],Bt=T[b];if(a===b||!A)return null;var r=tsRun(A);if(Bt&&Bt.charAt(Bt.length-1)!==A.charAt(A.length-1))return{err:'Colours have to match.'};if(Bt.length+r>TCAP)return{err:'There is not enough room there.'};return{r:r}}
function tsApply(T,a,b,r){var N=T.slice();N[b]=T[b]+T[a].slice(T[a].length-r);N[a]=T[a].slice(0,T[a].length-r);return N}
function tsMoves(T){var m=[],a,b,emptyDone;for(a=0;a<T.length;a++){if(!T[a])continue;var r=tsRun(T[a]),pure=r===T[a].length;emptyDone=false;
    for(b=0;b<T.length;b++){if(a===b)continue;var Bt=T[b];if(!Bt){if(pure||emptyDone)continue;emptyDone=true}else if(Bt.charAt(Bt.length-1)!==T[a].charAt(T[a].length-1))continue;if(Bt.length+r>TCAP)continue;m.push([a,b,r])}}return m}
function tsKey(T){return T.slice().sort().join('|')}
function tsSolved(T){var seen={};for(var i=0;i<T.length;i++){var t=T[i];if(!t)continue;if(tsRun(t)!==t.length)return false;if(seen[t.charAt(0)])return false;seen[t.charAt(0)]=1}return true}
function tsH(T){var blocks=0,seen={},k=0;for(var i=0;i<T.length;i++){var t=T[i];for(var j=0;j<t.length;j++){if(j===0||t.charAt(j)!==t.charAt(j-1))blocks++;if(!seen[t.charAt(j)]){seen[t.charAt(j)]=1;k++}}}return blocks-k}
function tsHeap(){var a=[];return{n:function(){return a.length},push:function(k,v){a.push([k,v]);var i=a.length-1;while(i>0){var p=(i-1)>>1;if(a[p][0]<=a[i][0])break;var t=a[p];a[p]=a[i];a[i]=t;i=p}},
  pop:function(){var top=a[0],l=a.pop();if(a.length){a[0]=l;var i=0;for(;;){var c=2*i+1;if(c>=a.length)break;if(c+1<a.length&&a[c+1][0]<a[c][0])c++;if(a[i][0]<=a[c][0])break;var t=a[i];a[i]=a[c];a[c]=t;i=c}}return top}}}
/* A* with h = blocks - colours, which never over-estimates (a pour removes at most one block), so w=1 is optimal; w>1 trades optimality for speed.
   Returns {path:[[from,to],..],exact} or {path:null,capped} (capped = gave up after maxNodes expansions) */
function tsSolve(T,maxNodes,w){w=w||1;var nodes=[{t:T,g:0,p:-1,m:null}],hp=tsHeap(),best={},exp=0,h0=tsH(T);hp.push(h0*w*100+h0,0);best[tsKey(T)]=0;
  while(hp.n()){var id=hp.pop()[1],nd=nodes[id];
    if(tsSolved(nd.t)){var p=[],q=id;while(nodes[q].p>=0){p.push(nodes[q].m);q=nodes[q].p}return{path:p.reverse(),exact:w===1}}
    if(exp++>=maxNodes)return{path:null,capped:true};
    var ms=tsMoves(nd.t);for(var i=0;i<ms.length;i++){var m=ms[i],nt=tsApply(nd.t,m[0],m[1],m[2]),g=nd.g+1,key=tsKey(nt);
      if(best[key]!==undefined&&best[key]<=g)continue;best[key]=g;var h=tsH(nt);nodes.push({t:nt,g:g,p:id,m:[m[0],m[1]]});hp.push((g+w*h)*100+h,nodes.length-1)}}
  return{path:null,capped:false}}
function tsWalk(k,pal,steps,rng){var T=[],i,ref=[];
  for(i=0;i<k;i++){var s='';for(var q=0;q<TCAP;q++)s+=pal[i];T.push(s)}T.push('');T.push('');
  for(var tries=0;tries<600&&(ref.length<steps||T.filter(function(x){return!x}).length!==2||tsSolved(T));tries++){var cand=[];
    for(var b=0;b<T.length;b++){if(!T[b])continue;var Bt=T[b],c=Bt.charAt(Bt.length-1),rb=tsRun(Bt);
      for(var t=1;t<=rb;t++){if(t===rb&&rb!==Bt.length)continue;
        for(var a=0;a<T.length;a++){if(a===b)continue;var A=T[a];if(A&&A.charAt(A.length-1)===c)continue;if(A.length+t>TCAP)continue;if(!A&&t===Bt.length)continue;cand.push([b,a,t])}}}
    if(!cand.length)break;
    if(ref.length>=steps){var ne=T.filter(function(x){return!x}).length,pref=cand.filter(function(c){var e=(T[c[1]]?0:1)-(T[c[0]].length===c[2]?1:0);return ne>2?e>0:ne<2?e<0:false});if(pref.length)cand=pref}
    var m=cand[pzInt(rng,cand.length)];T=tsApply(T,m[0],m[1],m[2]);ref.push([m[1],m[0]])}
  return{T:T,ref:ref}}
/* a start state: tries a few reverse walks and prefers one that ends packed with exactly 2 empty tubes and is not solved */
function tsMake(level,rng){var k=Math.min(8,3+Math.floor((level-1)/5)),j=(level-1)%5,steps=4*k+3*j+2,pal=pzShuffle(seq(8),rng).slice(0,k),best=null,at,T,ref;
  for(at=0;at<16;at++){var wk=tsWalk(k,pal,steps,rng),e=wk.T.filter(function(x){return!x}).length,sc=(tsSolved(wk.T)?-1000:0)+(e===2?500:0)+Math.min(wk.ref.length,steps);if(!best||sc>best.sc)best={sc:sc,T:wk.T,ref:wk.ref};if(best.sc>=500+steps)break}
  T=best.T;ref=best.ref;
  ref.reverse();
  var ex=tsSolve(T,6000,1),par,exact=false;
  if(ex.path){par=ex.path.length;exact=true}else{var wt=tsSolve(T,3000,2.5);par=wt.path?Math.min(wt.path.length,ref.length):ref.length}
  if(!exact)par=Math.min(par,ref.length);
  return{level:level,title:'Level '+level,tubes:T,k:k,par:par,parExact:exact,ref:ref}}
PZB.ts={make:tsMake,solve:tsSolve,moves:tsMoves,apply:tsApply,solved:tsSolved,tryPour:tsTry,pal:TPAL};
function mountTs(root,inst,api){
  var w=shell(root,'pb-ts'),T,hist,sel,hints=0,undos=0,fin,hl,plan,btn=[],msg=pzEl('p',{class:'pb-msg',role:'status'}),box=pzEl('div',{class:'pb-tubes',role:'group','aria-label':'Tubes'}),i,
    info=pzEl('p',{class:'pb-info',text:'Tap a tube, then tap where to pour its top colour. It can go on the same colour or into an empty tube. Make every tube one colour. Each colour has its own letter.'});
  function say(t){msg.textContent=t;api.say(t)}
  function reset(){T=inst.tubes.slice();hist=[];sel=-1;fin=false;hl=[];plan=null}reset();
  function name(c){var p=TPAL[+c];return p[0]+' '+p[1].toLowerCase()}
  function lab(i){var t=T[i],s='Tube '+(i+1)+', ';if(!t)s+='empty';else{var a=[];for(var j=0;j<t.length;j++)a.push(name(t.charAt(j)));s+='bottom to top: '+a.join(', ')}return s+(sel===i?', selected':'')+(hl.indexOf(i)>=0?', hint':'')}
  function paint(){for(var i=0;i<btn.length;i++){var e=btn[i],t=T[i];e.textContent='';
    for(var j=0;j<t.length;j++){var p=TPAL[+t.charAt(j)],u=pzEl('div',{class:'pb-u','aria-hidden':'true',text:p[0]});u.style.background=p[2];u.style.color=p[3];e.appendChild(u)}
    e.appendChild(pzEl('span',{class:'pb-tn','aria-hidden':'true',text:String(i+1)}));
    e.className='pb-tube'+(sel===i?' pb-sel':'')+(hl.indexOf(i)>=0?' pb-hint':'');e.setAttribute('aria-label',lab(i));e.setAttribute('aria-pressed',sel===i?'true':'false')}}
  function pour(a,b,r){hist.push(T);T=tsApply(T,a,b,r);plan=null;hl=[];sel=-1;api.moved();paint();
    if(tsSolved(T)){fin=true;say('Sorted.');api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})}}
  function tap(i){if(fin)return;hl=[];if(sel<0){if(T[i]){sel=i;msg.textContent='';api.say('Tube '+(i+1)+' picked up.')}else say('That tube is empty.');paint();return}
    if(sel===i){sel=-1;paint();return}var m=tsTry(T,sel,i);if(m&&m.err){say(m.err);sel=-1;paint();return}pour(sel,i,m.r)}
  for(i=0;i<T.length;i++)(function(i){var e=pzBtn('',function(){tap(i)},{class:'pb-tube','aria-label':'Tube '+(i+1)});btn.push(e);box.appendChild(e)})(i);
  w.appendChild(info);w.appendChild(box);w.appendChild(msg);paint();
  function next(){var k=T.join(',');if(!plan||plan.key!==k){var r=tsSolve(T,9000,2.5);plan={key:k,path:r.path}}return plan.path&&plan.path.length?plan.path[0]:null}
  return{undo:function(){if(fin||!hist.length)return false;T=hist.pop();undos++;sel=-1;hl=[];plan=null;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted.')},
    hint:function(lv){if(fin)return null;var m=next();hints++;if(!m){var z='This arrangement looks stuck. Use Undo to step back.';msg.textContent=z;api.say(z);return z}
      var s,cn=name(T[m[0]].charAt(T[m[0]].length-1));
      if(lv<=1){hl=[m[0]];sel=-1;s='Look at tube '+(m[0]+1)+'. Its top colour can move.'}
      else if(lv===2){hl=[m[0],m[1]];sel=-1;s='Move the '+cn+' from tube '+(m[0]+1)+' onto tube '+(m[1]+1)+'.'}
      else{pour(m[0],m[1],tsTry(T,m[0],m[1]).r);s='Poured '+cn+' from tube '+(m[0]+1)+' onto tube '+(m[1]+1)+'.'}
      paint();msg.textContent=s;api.say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'tube-sort',name:'Tube Sort',family:'memory',blurb:'Pour colours between tubes until each tube holds one colour.',
  how:'Tap a tube, then tap another tube to pour the top colour onto it. It must match the colour on top or go into an empty tube, and it must fit. Every colour has its own letter.',
  areas:['memory','space'],levels:30,secs:150,make:tsMake,mount:wrapMount(mountTs),
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||m,h=res.hints||0,s=pzStarsByPar(m,p,h);
    return{stars:s,line:'You sorted the tubes in '+plural(m,'pour')+' with '+hintsLine(h)+'. A short route takes '+plural(p,'pour')+'.'}}});

/* ---------- 5. Scramble ---------- */
function scrLen(level){return Math.min(9,4+Math.floor((level-1)/5))}
function scrSort(s){return s.split('').sort().join('')}
/* the target word, or any other listed word made of the same letters, counts as right */
function scrValid(word,guess){if(guess===word)return true;if(scrSort(guess)!==scrSort(word))return false;return WORDS['by'+guess.length].indexOf(guess)>=0}
function scrMake(level,rng){var len=scrLen(level),n=level<=15?3:4,pool=WORDS['by'+len],ws=[],words=[];
  while(words.length<n){var w=pool[pzInt(rng,pool.length)];if(ws.indexOf(w)>=0)continue;ws.push(w);
    var s=w,t=0;do{s=pzShuffle(w.split(''),rng).join('')}while(t++<30&&(s===w||scrValid(w,s)));words.push({w:w,s:s})}
  return{level:level,title:'Level '+level,len:len,words:words,par:n}}
PZB.scr={make:scrMake,valid:scrValid,len:scrLen};
function mountScr(root,inst,api){
  var w=shell(root,'pb-scr'),len=inst.len,wi,slots,used,hints=0,fin,solved,cur,sb=[],tb=[],i,locked=false,
    prog=pzEl('p',{class:'pb-prog'}),done=pzEl('ul',{class:'pb-solved','aria-label':'Solved words'}),
    info=pzEl('p',{class:'pb-info',text:'Tap the letters in order to spell a word. Tap a placed letter to send it back.'}),
    sl=pzEl('div',{class:'pb-slots',role:'group','aria-label':'Your word'}),tl=pzEl('div',{class:'pb-slots',role:'group','aria-label':'Letters to use'}),msg=pzEl('p',{class:'pb-msg',role:'status'}),
    nx=B('Next word',function(){go(wi+1)},'pb-main');
  function say(t){msg.textContent=t;api.say(t)}
  function go(k){if(k>=inst.words.length)return;wi=k;cur=inst.words[wi];slots=[];used=[];for(var j=0;j<len;j++){slots.push(-1);used.push(false)}locked=false;nx.style.display='none';msg.textContent='';paint();if(k>0&&tb[0])tb[0].focus()}
  function reset(){fin=false;solved=[];go(0)}
  function wordNow(){return slots.map(function(t){return t<0?'':cur.s.charAt(t)}).join('')}
  function paint(){prog.textContent='Word '+(wi+1)+' of '+inst.words.length;done.textContent='';solved.forEach(function(x){done.appendChild(pzEl('li',{text:x}))});
    for(var j=0;j<len;j++){var e=sb[j],t=slots[j];e.textContent=t<0?'':cur.s.charAt(t);e.className='pb-slot'+(t>=0?' pb-full':'');e.setAttribute('aria-label','Slot '+(j+1)+' of '+len+', '+(t<0?'empty':cur.s.charAt(t)+', tap to send back'));
      var g=tb[j];g.textContent=cur.s.charAt(j);g.className='pb-tile'+(used[j]?' pb-used':'');g.setAttribute('aria-label','Letter '+cur.s.charAt(j)+(used[j]?', used':''));g.setAttribute('aria-disabled',used[j]?'true':'false')}}
  function check(){if(slots.indexOf(-1)>=0)return;var g=wordNow();if(scrValid(cur.w,g)){solved.push(g);locked=true;api.moved();paint();
      if(wi===inst.words.length-1){fin=true;say('That spells '+g+'. All done.');api.done({solved:true,moves:inst.words.length,hints:hints,undos:0,extra:{par:inst.par,words:inst.words.length}})}
      else{say('That spells '+g+'.');nx.style.display='';nx.focus()}}
    else say('Those letters do not make a word on our list. Tap a letter to send it back.')}
  function place(t){if(fin||locked||used[t])return;var j=slots.indexOf(-1);if(j<0)return;slots[j]=t;used[t]=true;msg.textContent='';paint();check()}
  function back(j){if(fin||locked||slots[j]<0)return;used[slots[j]]=false;slots[j]=-1;msg.textContent='';paint()}
  for(i=0;i<len;i++)(function(i){var s=pzBtn('',function(){back(i)},{class:'pb-slot','aria-label':'Slot '+(i+1)}),t=pzBtn('',function(){place(i)},{class:'pb-tile','aria-label':'Letter'});sb.push(s);tb.push(t);sl.appendChild(s);tl.appendChild(t)})(i);
  nx.style.display='none';
  w.appendChild(prog);w.appendChild(done);w.appendChild(info);w.appendChild(sl);w.appendChild(tl);w.appendChild(msg);w.appendChild(nx);reset();
  function onkey(e){if(fin||locked||e.ctrlKey||e.metaKey||e.altKey)return;if(/^[a-zA-Z]$/.test(e.key)){var c=e.key.toLowerCase();for(var j=0;j<len;j++)if(!used[j]&&cur.s.charAt(j)===c){place(j);break}}
    else if(e.key==='Backspace'){for(var k=len-1;k>=0;k--)if(slots[k]>=0){back(k);break}}}
  w.addEventListener('keydown',onkey);
  function fill(n){slots=[];used=[];var j,p=cur.w.split('');for(j=0;j<len;j++){slots.push(-1);used.push(false)}
    for(j=0;j<n;j++){for(var t=0;t<len;t++)if(!used[t]&&cur.s.charAt(t)===p[j]){slots[j]=t;used[t]=true;break}}}
  return{undo:function(){if(fin||locked)return false;for(var k=len-1;k>=0;k--)if(slots[k]>=0){back(k);return true}return false},
    restart:function(){reset();say('Restarted.')},
    hint:function(lv){if(fin||locked)return null;hints++;var s,v=cur.w.replace(/[^aeiou]/g,'').length;
      if(lv<=1)s='Look at the first letter. This word has '+plural(v,'vowel')+' and starts with a '+('aeiou'.indexOf(cur.w.charAt(0))>=0?'vowel':'consonant')+'.';
      else if(lv===2){fill(1);paint();s='The word starts with '+cur.w.charAt(0).toUpperCase()+'.'}
      else{fill(len);paint();s='The word is '+cur.w.toUpperCase()+'.';check()}
      msg.textContent=s;api.say(s);return s},
    destroy:function(){w.removeEventListener('keydown',onkey);root.textContent=''}}}
registerPuzzle({undo:false,id:'scramble',name:'Scramble',family:'word',blurb:'Put the jumbled letters back into words.',
  how:'Tap the letters in order to spell the word. Tap a placed letter to take it back. Each level has a few words in a row. There is no clock.',
  areas:['attention','flex'],levels:30,secs:120,make:scrMake,mount:wrapMount(mountScr,true),
  stars:function(res,inst){var h=res.hints||0,n=(inst&&inst.par)||(res.extra&&res.extra.words)||3,s=h===0?3:h<=n?2:1;
    return{stars:s,line:'You unscrambled '+plural(n,'word')+' with '+hintsLine(h)+'.'}}});

/* ---------- 6. Word Steps ---------- */
var WSG={};
function wsGraph(len){if(WSG[len])return WSG[len];var ws=WORDS['by'+len],idx={},bk={},adj=[],i,j,p;
  for(i=0;i<ws.length;i++){idx[ws[i]]=i;adj.push([])}
  for(i=0;i<ws.length;i++)for(p=0;p<len;p++){var k=ws[i].slice(0,p)+'_'+ws[i].slice(p+1);(bk[k]=bk[k]||[]).push(i)}
  for(var k2 in bk){var a=bk[k2];for(i=0;i<a.length;i++)for(j=0;j<a.length;j++)if(i!==j)adj[a[i]].push(a[j])}
  return WSG[len]={ws:ws,idx:idx,adj:adj}}
function wsDist(g,src){var d=[],q=[src],i,h=0;for(i=0;i<g.ws.length;i++)d.push(-1);d[src]=0;while(h<q.length){var u=q[h++];for(i=0;i<g.adj[u].length;i++){var v=g.adj[u][i];if(d[v]<0){d[v]=d[u]+1;q.push(v)}}}return d}
function wsSteps(level){return 2+Math.floor((level-1)/5)}
function wsMake(level,rng){var D=wsSteps(level),lens=level<=10?[3,4]:[4,5,3],li,g,order,i;
  for(li=0;li<lens.length;li++){g=wsGraph(lens[li]);order=pzShuffle(seq(g.ws.length),rng);
    for(i=0;i<order.length;i++){if(g.adj[order[i]].length<2)continue;var d=wsDist(g,order[i]),c=[];for(var k=0;k<d.length;k++)if(d[k]===D)c.push(k);
      if(c.length){var t=c[pzInt(rng,c.length)];return{level:level,title:'Level '+level,len:lens[li],start:g.ws[order[i]],goal:g.ws[t],par:D}}}}
  throw new Error('no word pair for level '+level)}
function wsIsStep(a,b){if(a.length!==b.length)return false;var n=0;for(var i=0;i<a.length;i++)if(a.charAt(i)!==b.charAt(i))n++;return n===1}
PZB.ws={make:wsMake,graph:wsGraph,dist:wsDist,steps:wsSteps,isStep:wsIsStep};
function mountWs(root,inst,api){
  var w=shell(root,'pb-ws'),g=wsGraph(inst.len),len=inst.len,chain,sel,hints=0,undos=0,fin,hp,gd=wsDist(g,g.idx[inst.goal]),lb=[],i,
    info=pzEl('p',{class:'pb-info',text:'Change one letter at a time to turn '+inst.start.toUpperCase()+' into '+inst.goal.toUpperCase()+'. Every step must be a real word. Tap a letter, then pick its replacement.'}),
    list=pzEl('ol',{class:'pb-chain','aria-label':'Your steps'}),cw=pzEl('div',{class:'pb-slots',role:'group','aria-label':'Current word, tap a letter to change it'}),
    alpha=pzEl('div',{class:'pb-alpha',role:'group','aria-label':'Pick a letter'}),msg=pzEl('p',{class:'pb-msg',role:'status'});
  function say(t){msg.textContent=t;api.say(t)}
  function reset(){chain=[inst.start];sel=-1;fin=false;hp=-1}reset();
  function paint(){var cur=chain[chain.length-1];list.textContent='';chain.forEach(function(x,k){list.appendChild(pzEl('li',{text:x,'aria-label':k===0?'Start '+x:'Step '+k+' '+x}))});
    list.appendChild(pzEl('li',{class:'pb-goal',text:inst.goal,'aria-label':'Goal '+inst.goal}));
    for(var j=0;j<len;j++){var e=lb[j];e.textContent=cur.charAt(j);e.className='pb-slot pb-full'+(sel===j?' pb-sel':'')+(hp===j?' pb-hint':'');e.setAttribute('aria-label','Letter '+(j+1)+' of '+len+', '+cur.charAt(j)+(sel===j?', selected':'')+(hp===j?', hint':''));e.setAttribute('aria-pressed',sel===j?'true':'false')}
    alpha.style.display=sel>=0&&!fin?'':'none'}
  function step(nw){if(g.idx[nw]===undefined){say(nw.toUpperCase()+' is not in our word list.');return false}
    chain.push(nw);sel=-1;hp=-1;api.moved();paint();msg.textContent='';
    if(nw===inst.goal){fin=true;say('You reached '+inst.goal.toUpperCase()+' in '+plural(chain.length-1,'step')+'.');paint();api.done({solved:true,moves:chain.length-1,hints:hints,undos:undos,extra:{par:inst.par,len:len}})}return true}
  function pick(c){if(fin||sel<0)return;var cur=chain[chain.length-1];if(cur.charAt(sel)===c){say('That is the same letter. Pick a different one.');return}step(cur.slice(0,sel)+c+cur.slice(sel+1))}
  for(i=0;i<len;i++)(function(i){var e=pzBtn('',function(){if(fin)return;sel=sel===i?-1:i;hp=-1;paint()},{class:'pb-slot'});lb.push(e);cw.appendChild(e)})(i);
  for(i=0;i<26;i++)(function(c){alpha.appendChild(K(c,function(){pick(c)},'Letter '+c))})(String.fromCharCode(97+i));
  w.appendChild(info);w.appendChild(list);w.appendChild(cw);w.appendChild(alpha);w.appendChild(msg);
  function onkey(e){if(fin||e.ctrlKey||e.metaKey||e.altKey)return;if(/^[a-zA-Z]$/.test(e.key)&&sel>=0)pick(e.key.toLowerCase());else if(e.key==='Escape'){sel=-1;paint()}}
  w.addEventListener('keydown',onkey);paint();
  function nextWord(){var cur=chain[chain.length-1],u=g.idx[cur];if(u===undefined)return null;for(var k=0;k<g.adj[u].length;k++){var v=g.adj[u][k];if(gd[v]>=0&&gd[v]===gd[u]-1)return g.ws[v]}return null}
  return{undo:function(){if(fin||chain.length<2)return false;chain.pop();undos++;sel=-1;hp=-1;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted.')},
    hint:function(lv){if(fin)return null;var cur=chain[chain.length-1],nx=nextWord();if(!nx)return null;hints++;var p=0;while(cur.charAt(p)===nx.charAt(p))p++;var s;
      if(lv<=1){hp=p;sel=-1;s='Look at letter '+(p+1)+' of '+cur.toUpperCase()+'.'}
      else if(lv===2){hp=p;sel=p;s='Change letter '+(p+1)+' to '+nx.charAt(p).toUpperCase()+'.'}
      else{step(nx);s='Changed letter '+(p+1)+' to '+nx.charAt(p).toUpperCase()+': '+nx.toUpperCase()+'.'}
      paint();msg.textContent=s;api.say(s);return s},
    destroy:function(){w.removeEventListener('keydown',onkey);root.textContent=''}}}
registerPuzzle({id:'word-steps',name:'Word Steps',family:'word',blurb:'Turn one word into another, changing a single letter at a time.',
  how:'Tap a letter of the word, then pick a new letter. Each step must make a real word. Reach the goal word in as few steps as you can.',
  areas:['flex','space'],levels:30,secs:120,make:wsMake,mount:wrapMount(mountWs),
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||m,h=res.hints||0,s=pzStarsByPar(m,p,h);
    return{stars:s,line:'You turned '+(inst?inst.start.toUpperCase()+' into '+inst.goal.toUpperCase():'the word')+' in '+plural(m,'step')+' with '+hintsLine(h)+'. The shortest path is '+plural(p,'step')+'.'}}});
})();
