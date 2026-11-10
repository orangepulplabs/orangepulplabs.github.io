/* Zest puzzles, wave 2 file 3: Hold the Interval, Switch Off, Jump Away, Circle Count, Magic Three.
   Loaded after puzzles_kit.js. Every make(level,rng) is pure (no Math.random, no DOM): the same seed gives the same puzzle on every device.
   Generators and solvers are exposed on PZD3 for tests/pzd3_logic.js and tests/pzd3_ui.py.
   Wording is about the puzzle only: no claims about the brain, memory, attention, health or schoolwork. No luck anywhere.

   Hold the Interval: a light is on for a short interval, then the player holds for the same time. par = 1 try; a try is right when the hold is within the level's tolerance.
   Switch Off: 5x5 toggle grid (a tap switches its cell and the four edge neighbours). Every board is made by tapping from all-off, so it is solvable.
     par = the fewest taps, found exactly by Gaussian elimination over GF(2) (all solutions, then the lightest).
   Jump Away: 37-hole French board. The start is made by reversing jumps from one peg in the middle, so a forward route always exists and ends in the middle.
     par = the number of jumps (every jump removes one peg, so every win takes exactly that many). The route is stored for the hint.
   Circle Count: Josephus counting on a ring of 4 to 14 lanterns, count k, starting at lantern 1. Answer = survivor (1-based), par = 1 choice.
   Magic Three: 3x3 Lo Shu square, digits 1 to 9, lines add to 15. Givens are chosen so exactly one of the 8 magic squares fits (unique completion). par = empty squares. */
var PZD3={};
(function(){
var CSS='.pd{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.pd *{box-sizing:border-box}'
+'.pd [hidden]{display:none!important}'
+'.pd-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.pd-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.pd-sub{margin:0;text-align:center;font:600 .9375rem var(--font);color:var(--muted)}'
+'.pd-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.pd-btn{min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer}'
+'.pd-btn.pd-main{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}'
+'.pd-btn:disabled{background:var(--dis-bg);color:var(--dis-ink);border-color:var(--dis-bg);cursor:default}'
+'.pd-btn[aria-pressed=true]{background:var(--tint);outline:3px solid var(--ink);outline-offset:-3px}'
+'.pd-hold{width:100%;min-height:120px;font:800 1.25rem var(--font);touch-action:none;user-select:none;-webkit-user-select:none}'
+'.pd-lamp{width:96px;height:96px;border-radius:50%;border:3px solid var(--edge);background:var(--surface);color:var(--ink);display:flex;align-items:center;justify-content:center;font:800 .9375rem var(--font);text-align:center}'
+'.pd-lamp.pd-on{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}'
+'.pd-grid5{display:grid;grid-template-columns:repeat(5,52px);gap:4px;justify-content:center}'
+'.pd-cell{width:52px;height:52px;padding:0;font-size:1.25rem}'
+'.pd-cell.pd-on{background:var(--tint);font-weight:800}'
+'.pd-jb{display:grid;grid-template-columns:repeat(7,40px);grid-auto-rows:40px;justify-content:center}'
+'.pd-gap{display:block}'
+'.pd-hole{width:48px;height:48px;min-width:48px;margin:-4px;padding:0;border-radius:50%;font-size:1rem;line-height:1}'
+'.pd-hole.pd-peg{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}'
+'.pd-hole.pd-target{border-style:dashed}'
+'.pd-ring{position:relative;width:288px;height:288px;max-width:100%}'
+'.pd-lan{position:absolute;width:48px;height:48px;min-width:48px;padding:0;border-radius:50%;font-variant-numeric:tabular-nums}'
+'.pd-magic{display:grid;grid-template-columns:repeat(3,84px);gap:6px;justify-content:center}'
+'.pd-sq{width:84px;height:84px;font:800 1.75rem var(--font)}'
+'.pd-sq.pd-given{background:var(--tint)}'
+'.pd-list{list-style:none;margin:0;padding:0;width:100%;display:flex;flex-direction:column;gap:4px}'
+'.pd-list li{padding:6px 12px;border:1px solid var(--line);border-radius:var(--r1);background:var(--surface);font-weight:600;font-size:.9375rem}'
+'.phone.rm .pd *,.phone.rm .pd *::before{transition:none!important;animation:none!important}'
+'@media (prefers-reduced-motion:reduce){.pd *,.pd *::before{transition:none!important;animation:none!important}}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pzd3-css'))return;var s=document.createElement('style');s.id='pzd3-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function B(txt,fn,cls,at){at=at||{};at.class='pd-btn '+(cls||'');return pzBtn(txt,fn,at)}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'pd '+cls});root.appendChild(w);return w}
function plural(n,w){return n+' '+w+(n===1?'':'s')}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
function popcount(x){var n=0;while(x){x&=x-1;n++}return n}
/* every mount is wrapped: done() fires 350 ms after the last move; an Undo / Hint / Restart row is drawn unless api.toolbar===false or inst.toolbar===false.
   opt.undo===false leaves Undo out (the puzzle has no moves to take back). */
function wrapMount(m,opt){opt=opt||{};return function(root,inst,api){var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'pd-row pd-bar'}),w=root.firstChild;
    if(opt.undo!==false)bar.appendChild(B('Undo',function(){lv=0;c.undo()},'',{'aria-label':'Undo'}));
    bar.appendChild(B('Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)},'',{'aria-label':'Hint'}));
    bar.appendChild(B('Restart',function(){lv=0;c.restart()},'',{'aria-label':'Restart this level'}));
    if(w)w.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,destroy:function(){clearTimeout(tm);c.destroy()}}}}

/* ================= 1. Hold the Interval ================= */
function hiMake(level,rng){var t=900+Math.round((level-1)/29*2600)+pzInt(rng,300);t=Math.round(t/10)*10;
  var tol=Math.round(t*(0.25-(level-1)/29*0.17)/10)*10;
  return{level:level,title:'Level '+level,target:t,tol:tol,par:1,undo:false}}
PZD3.hi={make:hiMake};
function mountHi(root,inst,api){
  var w=shell(root,'pd-hi'),T=inst.target,tol=inst.tol,tries=0,hints=0,fin=false,cueOn=false,ready=false,down=0,tmr=null,
    info=pzEl('p',{class:'pd-info',text:'A light comes on and then goes off. Watch how long it is on. Then press and hold the big button for the same length of time, and let go.'}),
    lamp=pzEl('div',{class:'pd-lamp','aria-hidden':'true',text:'Light off'}),
    cue=B('Show the light',function(){startCue()},'pd-main'),
    hold=pzBtn('Hold for the same time',function(){},{class:'pd-btn pd-hold','aria-label':'Hold for the same time'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'});
  hold.disabled=true;
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function startCue(){if(fin||cueOn)return;clearTimeout(tmr);cueOn=true;ready=false;hold.disabled=true;cue.disabled=true;
    lamp.textContent='Light on';lamp.className='pd-lamp pd-on';say('Watch the light.');
    tmr=setTimeout(function(){cueOn=false;ready=true;lamp.textContent='Light off';lamp.className='pd-lamp';hold.disabled=false;
      say('Now press and hold for the same time, then let go.')},T)}
  function press(){if(fin||!ready||down)return;down=Date.now();hold.textContent='Keep holding'}
  function cancel(){if(!down)return;down=0;hold.textContent='Hold for the same time'}
  function release(){if(!down)return;var h=Date.now()-down;down=0;hold.textContent='Hold for the same time';if(!ready)return;
    ready=false;hold.disabled=true;tries++;api.moved();judge(h)}
  function judge(h){var d=h-T;
    if(Math.abs(d)<=tol){fin=true;cue.disabled=true;
      say('You held for '+(h/1000).toFixed(1)+' seconds. The light lasted '+(T/1000).toFixed(1)+'. That is close enough.');
      api.done({solved:true,moves:tries,hints:hints,undos:0,extra:{par:1,heldMs:h,targetMs:T,toleranceMs:tol}});return}
    cue.disabled=false;
    say('Not quite. You held for '+(h/1000).toFixed(1)+' seconds, and the light lasted '+(T/1000).toFixed(1)+'. That is '+(Math.abs(d)/1000).toFixed(1)+' seconds too '+(d>0?'long':'short')+'. Show the light again and try once more.')}
  function onUp(){release()}
  hold.addEventListener('pointerdown',function(){press()});
  hold.addEventListener('pointercancel',cancel);
  hold.addEventListener('keydown',function(ev){if((ev.key===' '||ev.key==='Enter')&&!ev.repeat){ev.preventDefault();press()}});
  hold.addEventListener('keyup',function(ev){if(ev.key===' '||ev.key==='Enter')release()});
  document.addEventListener('pointerup',onUp);
  w.appendChild(info);w.appendChild(lamp);w.appendChild(cue);w.appendChild(hold);w.appendChild(msg);
  function reset(){clearTimeout(tmr);cueOn=false;ready=false;fin=false;down=0;tries=0;hints=0;lamp.textContent='Light off';lamp.className='pd-lamp';
    cue.disabled=false;hold.disabled=true;hold.textContent='Hold for the same time';msg.textContent=''}
  return{undo:function(){return false},
    restart:function(){reset();say('Restarted.')},
    hint:function(lv){if(fin)return null;hints++;var s;
      if(lv<=1)s='Count the seconds in your head while the light is on, then hold for the same count.';
      else if(lv===2)s='The light lasts about '+(T/1000).toFixed(1)+' seconds.';
      else s='Press, count to '+(T/1000).toFixed(1)+' seconds, then let go.';
      say(s);return s},
    destroy:function(){clearTimeout(tmr);document.removeEventListener('pointerup',onUp);root.textContent=''}}}
registerPuzzle({id:'hold-the-interval',name:'Hold the Interval',family:'move',theme:'F2',calm:true,
  blurb:'Watch a light for a moment, then hold for the same time.',
  how:'Press Show the light and watch it come on and go off. Then press and hold the big button for the same length of time, and let go. The closer your hold, the better.',
  areas:['speed','attention'],levels:30,secs:60,make:hiMake,mount:wrapMount(mountHi,{undo:false}),
  stars:function(res,inst){var m=res.moves||1,h=res.hints||0,s=m<=1?3:m<=2?2:1;if(h&&s===3)s=2;
    var t=(res.extra&&res.extra.targetMs)||inst.target;
    return{stars:s,line:'You were close on try '+m+', with '+hintsLine(h)+'. The light lasted '+(t/1000).toFixed(1)+' seconds.'}}});

/* ================= 2. Switch Off ================= */
var swEff=[];
(function(){for(var q=0;q<25;q++){var r0=Math.floor(q/5),c0=q%5,m0=1<<q;
  [[r0-1,c0],[r0+1,c0],[r0,c0-1],[r0,c0+1]].forEach(function(p){if(p[0]>=0&&p[0]<5&&p[1]>=0&&p[1]<5)m0|=1<<(p[0]*5+p[1])});swEff.push(m0)}})();
/* all presses x (bit j = press cell j) with A x = b over GF(2); A is symmetric, so row i of A is swEff[i] */
function swSolveAll(b){var rows=[],i,c,p,t,k,piv=[],rk=0,free=[];
  for(i=0;i<25;i++)rows.push({m:swEff[i],r:(b>>i)&1});
  for(c=0;c<25;c++){p=-1;for(i=rk;i<25;i++)if((rows[i].m>>c)&1){p=i;break}
    if(p<0)continue;t=rows[p];rows[p]=rows[rk];rows[rk]=t;
    for(i=0;i<25;i++)if(i!==rk&&((rows[i].m>>c)&1)){rows[i].m^=rows[rk].m;rows[i].r^=rows[rk].r}
    piv.push(c);rk++}
  for(i=rk;i<25;i++)if(rows[i].r)return[];
  for(c=0;c<25;c++)if(piv.indexOf(c)<0)free.push(c);
  var sols=[],f,x,val,fm,par;
  for(f=0;f<(1<<free.length);f++){x=0;for(k=0;k<free.length;k++)if((f>>k)&1)x|=1<<free[k];
    for(k=0;k<rk;k++){val=rows[k].r;fm=rows[k].m&~(1<<piv[k]);par=popcount(fm&x)&1;val^=par;if(val)x|=1<<piv[k]}
    sols.push(x)}
  return sols}
/* the fewest-tap solution for a board (mask of lit cells): {mask, presses:[cell indices]} or null */
function swMin(b){var sols=swSolveAll(b);if(!sols.length)return null;var best=sols[0],i;
  for(i=1;i<sols.length;i++)if(popcount(sols[i])<popcount(best))best=sols[i];
  var pr=[];for(i=0;i<25;i++)if((best>>i)&1)pr.push(i);return{mask:best,presses:pr}}
function swEffectOf(presses){var m=0;presses.forEach(function(j){m^=swEff[j]});return m}
function swMake(level,rng){var k=2+Math.round((level-1)/29*12)+pzInt(rng,2),b=0,pr=[],tries=0,sol,i;
  var all=[];for(i=0;i<25;i++)all.push(i);
  do{pr=pzShuffle(all,rng).slice(0,Math.min(k,25));b=swEffectOf(pr);tries++}while(b===0&&tries<60);
  var lit=[];for(i=0;i<25;i++)lit.push((b>>i)&1);
  sol=swMin(b);
  return{level:level,title:'Level '+level,lit:lit,par:popcount(sol.mask)}}
PZD3.sw={make:swMake,solve:swSolveAll,min:swMin,eff:swEff,effectOf:swEffectOf};
function mountSw(root,inst,api){
  var w=shell(root,'pd-sw'),cur=0,presses=[],made=0,hints=0,undos=0,fin=false,btns=[],i,
    info=pzEl('p',{class:'pd-info',text:'Each tap switches that light and the lights directly above, below, left and right of it. Switch every light off, in as few taps as you can.'}),
    grid=pzEl('div',{class:'pd-grid5',role:'group','aria-label':'The grid of lights'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'}),left=pzEl('p',{class:'pd-sub'});
  for(i=0;i<25;i++)if(inst.lit[i])cur|=1<<i;
  var start=cur;
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function paint(){var n=0;for(var q=0;q<25;q++){var on=(cur>>q)&1;n+=on;var b=btns[q];
      b.textContent=on?'●':'○';b.className='pd-btn pd-cell'+(on?' pd-on':'');
      b.setAttribute('aria-label','Row '+(Math.floor(q/5)+1)+', column '+(q%5+1)+', '+(on?'light on':'light off'))}
    left.textContent=n?plural(n,'light')+' still on':'All the lights are off.'}
  function tap(q){if(fin)return;presses.push(q);cur^=swEff[q];made++;api.moved();paint();
    if(cur===0){fin=true;say('All the lights are off in '+plural(made,'tap')+'. The shortest is '+plural(inst.par,'tap')+'.');
      api.done({solved:true,moves:made,hints:hints,undos:undos,extra:{par:inst.par}});return}
    say(plural(popcount(cur),'light')+' still on.')}
  for(i=0;i<25;i++)(function(q){btns[q]=pzBtn('',function(){tap(q)},{class:'pd-btn pd-cell','aria-label':'Light '+q})})(i);
  for(i=0;i<25;i++)grid.appendChild(btns[i]);
  paint();
  w.appendChild(info);w.appendChild(grid);w.appendChild(left);w.appendChild(msg);
  return{undo:function(){if(fin||!presses.length)return false;var q=presses.pop();cur^=swEff[q];undos++;paint();say('Undone.');return true},
    restart:function(){cur=start;presses=[];made=0;hints=0;undos=0;fin=false;paint();say('Restarted.')},
    hint:function(lv){if(fin||cur===0)return null;var m=swMin(cur);if(!m||!m.presses.length)return null;var q=m.presses[0],s,r=Math.floor(q/5)+1,c=q%5+1;hints++;
      if(lv<=1)s='A tap switches the light you tap and the four lights next to it.';
      else if(lv===2)s='A good next tap is row '+r+', column '+c+'.';
      else{tap(q);var s3='Tapped row '+r+', column '+c+' for you.';if(!fin)say(s3);return s3}
      say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'switch-off',name:'Switch Off',family:'grid',theme:'F10',calm:true,
  blurb:'Tap the lights until every one is off.',
  how:'A tap switches the light you tap and the four lights beside it. Switch every light off. Fewer taps is better, and Undo takes back your last tap.',
  areas:['control','flex'],levels:30,secs:120,make:swMake,mount:wrapMount(mountSw),
  stars:function(res,inst){var p=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You switched every light off in '+plural(m,'tap')+' and '+hintsLine(h)+'. The shortest is '+plural(p,'tap')+'.'}}});

/* ================= 3. Jump Away ================= */
var jaRC=[],jaIdx={},jaTrip=[];
function jaHole(r,c){if(r<0||r>6||c<0||c>6)return-1;var k=r*7+c;return jaIdx[k]===undefined?-1:jaIdx[k]}
(function(){var r,c;
  function off(r,c){return Math.min(r,6-r)+Math.min(c,6-c)<=1}
  for(r=0;r<7;r++)for(c=0;c<7;c++){if(off(r,c))continue;jaIdx[r*7+c]=jaRC.length;jaRC.push([r,c])}
  var dirs=[[0,1],[1,0],[0,-1],[-1,0]];
  jaRC.forEach(function(p,a){dirs.forEach(function(d){var b=jaHole(p[0]+d[0],p[1]+d[1]),cc=jaHole(p[0]+2*d[0],p[1]+2*d[1]);
    if(b>=0&&cc>=0)jaTrip.push([a,b,cc])})})})();
function jaSolve(s0,limit){var seen={},nodes=0,cap=false,i;
  function rec(s){var n=0;for(i=0;i<37;i++)n+=s[i];if(n===1)return[];var key=s.join('');if(seen[key])return null;seen[key]=1;
    if(++nodes>limit){cap=true;return null}
    for(var j=0;j<jaTrip.length;j++){var t=jaTrip[j];if(s[t[0]]&&s[t[1]]&&!s[t[2]]){s[t[0]]=0;s[t[1]]=0;s[t[2]]=1;var r=rec(s);s[t[0]]=1;s[t[1]]=1;s[t[2]]=0;if(r)return[t].concat(r);if(cap)return null}}
    return null}
  var res=rec(s0.slice());return{path:res,cap:cap}}
function jaMake(level,rng){var k=3+Math.round((level-1)/29*19),st=new Array(37).fill(0),c0=jaHole(3,3),recs=[],cand,t;
  st[c0]=1;
  while(recs.length<k){cand=jaTrip.filter(function(q){return st[q[2]]&&!st[q[0]]&&!st[q[1]]});if(!cand.length)break;
    t=cand[pzInt(rng,cand.length)];st[t[2]]=0;st[t[0]]=1;st[t[1]]=1;recs.push(t)}
  return{level:level,title:'Level '+level,start:st.slice(),path:recs.slice().reverse(),par:recs.length,centre:c0}}
PZD3.ja={make:jaMake,solve:jaSolve,trip:jaTrip,rc:jaRC,hole:jaHole};
function mountJa(root,inst,api){
  var w=shell(root,'pd-ja'),st=inst.start.slice(),hist=[],made=0,sel=-1,hints=0,undos=0,fin=false,btns=[],i,
    info=pzEl('p',{class:'pd-info',text:'Tap a peg, then tap an empty hole two places away in a straight line. The peg in between is taken away. Keep going until one peg is left.'}),
    board=pzEl('div',{class:'pd-jb',role:'group','aria-label':'The board'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'}),left=pzEl('p',{class:'pd-sub'});
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function pegCount(){var n=0;for(var q=0;q<37;q++)n+=st[q];return n}
  function anyJump(){return jaTrip.some(function(t){return st[t[0]]&&st[t[1]]&&!st[t[2]]})}
  function paint(){var tg={};
    if(sel>=0)jaTrip.forEach(function(t){if(t[0]===sel&&st[t[1]]&&!st[t[2]])tg[t[2]]=1});
    for(var q=0;q<37;q++){var b=btns[q],rc=jaRC[q],peg=st[q];
      b.textContent=peg?'●':(tg[q]?'◇':'○');
      b.className='pd-btn pd-hole'+(peg?' pd-peg':'')+(tg[q]?' pd-target':'');
      b.setAttribute('aria-pressed',peg&&q===sel?'true':'false');
      b.setAttribute('aria-label','Row '+(rc[0]+1)+', column '+(rc[1]+1)+', '+(peg?(q===sel?'peg, selected':'peg'):(tg[q]?'empty hole, you can land here':'empty hole')))}
    left.textContent=plural(pegCount(),'peg')+' left'}
  function jump(t){hist.push(t);st[t[0]]=0;st[t[1]]=0;st[t[2]]=1;sel=-1;made++;api.moved();paint();
    if(pegCount()===1){fin=true;say('One peg is left. Well done.');api.done({solved:true,moves:made,hints:hints,undos:undos,extra:{par:inst.par,centre:st[inst.centre]===1}});return}
    say(anyJump()?plural(pegCount(),'peg')+' left.':'No jumps are left. Undo a move or restart.')}
  function tapHole(q){if(fin)return;
    if(st[q]){sel=(sel===q)?-1:q;paint();say(sel<0?'Peg put down.':'Peg selected. Tap an empty hole two places away.');return}
    if(sel<0){say('Pick a peg first.');return}
    var t=jaTrip.filter(function(x){return x[0]===sel&&x[2]===q})[0];
    if(!t||!st[t[1]]){say('That hole is not two places away in a straight line, or the peg between is missing.');return}
    jump(t)}
  for(i=0;i<37;i++)(function(q){btns[q]=pzBtn('',function(){tapHole(q)},{class:'pd-btn pd-hole'})})(i);
  for(var r=0;r<7;r++)for(var c=0;c<7;c++){var h=jaHole(r,c);if(h<0)board.appendChild(pzEl('span',{class:'pd-gap','aria-hidden':'true'}));else board.appendChild(btns[h])}
  paint();
  w.appendChild(info);w.appendChild(board);w.appendChild(left);w.appendChild(msg);
  function onTrack(){for(var q=0;q<hist.length;q++){var e=inst.path[q];if(!e||e[0]!==hist[q][0]||e[1]!==hist[q][1]||e[2]!==hist[q][2])return false}return true}
  return{undo:function(){if(fin||!hist.length)return false;var t=hist.pop();st[t[0]]=1;st[t[1]]=1;st[t[2]]=0;sel=-1;undos++;paint();say('Undone.');return true},
    restart:function(){st=inst.start.slice();hist=[];made=0;sel=-1;hints=0;undos=0;fin=false;paint();say('Restarted.')},
    hint:function(lv){if(fin)return null;var t;
      if(onTrack()&&hist.length<inst.path.length)t=inst.path[hist.length];
      else{var res=jaSolve(st,60000);t=res.path&&res.path[0]}
      if(!t){var no='I cannot find a finish from here. Undo a move or two, then ask again.';say(no);return no}
      hints++;var fr=jaRC[t[0]],s;
      if(lv<=1)s='Look for a peg with a peg beside it and an empty hole after that, in a straight line.';
      else if(lv===2)s='Jump the peg in row '+(fr[0]+1)+', column '+(fr[1]+1)+'.';
      else{s='Jumping the peg in row '+(fr[0]+1)+', column '+(fr[1]+1)+' for you.';jump(t);if(!fin)say(s);return s}
      say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'jump-away',name:'Jump Away',family:'move',theme:'F10',calm:true,
  blurb:'Jump pegs over each other until one is left.',
  how:'Tap a peg, then tap the empty hole two places away in a straight line. The peg in the middle is taken away. Leave a single peg. Undo takes back your last jump.',
  areas:['space','control'],levels:30,secs:150,make:jaMake,mount:wrapMount(mountJa),
  stars:function(res,inst){var p=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You left one peg after '+plural(m,'jump')+' and '+hintsLine(h)+'. Every full game takes '+plural(p,'jump')+'.'}}});

/* ================= 4. Circle Count ================= */
function ccAns(n,k){var j=0;for(var m=2;m<=n;m++)j=(j+k)%m;return j+1}
function ccMake(level,rng){var n=4+Math.min(10,Math.floor((level-1)/29*10)+pzInt(rng,2)),kmax=Math.min(n-1,9),k=2+pzInt(rng,kmax-1);
  return{level:level,title:'Level '+level,n:n,k:k,answer:ccAns(n,k),par:1,undo:false}}
PZD3.cc={make:ccMake,ans:ccAns};
function mountCc(root,inst,api){
  var w=shell(root,'pd-cc'),n=inst.n,k=inst.k,ans=inst.answer,fin=false,taps=0,hints=0,i,
    info=pzEl('p',{class:'pd-info',text:'A ring of '+n+' lanterns. Count round the ring from lantern 1, and count '+k+' each time. The lantern you land on at the '+k+' count goes out, and counting carries on from the next lit lantern. Tap the lantern that stays lit at the end.'}),
    ring=pzEl('div',{class:'pd-ring',role:'group','aria-label':'Ring of '+n+' lanterns'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'});
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function pick(v){if(fin)return;taps++;api.moved();
    if(v===ans){fin=true;say('Lantern '+ans+' stays lit. You found it.');
      api.done({solved:true,moves:taps,hints:hints,undos:0,extra:{par:1,answer:ans,n:n,k:k}});return}
    say('Not that one. Count round from lantern 1, '+k+' at a time, and see which lantern stays lit.')}
  var cx=144,cy=144,R=110;
  function place(v,ang){var b=pzBtn(String(v),function(){pick(v)},{class:'pd-btn pd-lan','aria-label':'Lantern '+v});
    b.style.left=Math.round(cx+R*Math.cos(ang)-24)+'px';b.style.top=Math.round(cy+R*Math.sin(ang)-24)+'px';ring.appendChild(b)}
  for(i=0;i<n;i++)place(i+1,-Math.PI/2+2*Math.PI*i/n);
  w.appendChild(info);w.appendChild(ring);w.appendChild(msg);
  return{undo:function(){return false},
    restart:function(){fin=false;taps=0;hints=0;msg.textContent='';say('Restarted. Same ring, fresh start.')},
    hint:function(lv){if(fin)return null;var s;hints++;
      if(lv<=1)s='Counting starts at lantern 1. The first lantern to go out is number '+k+'.';
      else if(lv===2)s='Keep counting round the ring, skipping the lanterns that have gone out. Each time, start counting again from the next lit lantern.';
      else{s='Lantern '+ans+' stays lit. Choosing it for you.';pick(ans);if(!fin)say(s);return s}
      say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'circle-count',name:'Circle Count',family:'move',theme:'F7',calm:true,
  blurb:'Count round a ring of lanterns and find the one that stays lit.',
  how:'Lanterns stand in a ring. Count round from lantern 1, and every time you land on the count you have been given, that lantern goes out. Tap the lantern that is still lit at the end.',
  areas:['attention','control'],levels:30,secs:90,make:ccMake,mount:wrapMount(mountCc,{undo:false}),
  stars:function(res,inst){var p=(inst&&inst.par)||1,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You found the lit lantern on tap '+m+', with '+hintsLine(h)+'. There is one right answer.'}}});

/* ================= 5. Magic Three ================= */
var mtBase=[[2,7,6],[9,5,1],[4,3,8]];
function mtRot(m){var o=[[],[],[]],r,c;for(r=0;r<3;r++)for(c=0;c<3;c++)o[c][2-r]=m[r][c];return o}
function mtFlip(m){return m.map(function(row){return row.slice().reverse()})}
var mtSquares=(function(){var out=[],m=mtBase,k;for(k=0;k<4;k++){out.push(m);out.push(mtFlip(m));m=mtRot(m)}
  return out.map(function(sq){return sq.reduce(function(a,row){return a.concat(row)},[])})})();
var mtLines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
var mtNames=['Top row','Middle row','Bottom row','Left column','Middle column','Right column','Diagonal from top left','Diagonal from top right'];
function mtLineSum(g,L){var s=0;for(var i=0;i<3;i++){var v=g[L[i]];if(v===null)return null;s+=v}return s}
function mtMake(level,rng){var g=level<=10?5:level<=20?4:3,V,cells,t,cnt,i,all=[0,1,2,3,4,5,6,7,8];
  for(;;){for(t=0;t<400;t++){V=mtSquares[pzInt(rng,8)];
      cells=pzShuffle(all,rng).slice(0,g).sort(function(a,b){return a-b});
      cnt=0;for(i=0;i<8;i++){var S=mtSquares[i];if(cells.every(function(c){return S[c]===V[c]}))cnt++}
      if(cnt===1){var grid=[];for(i=0;i<9;i++)grid.push(cells.indexOf(i)>=0?V[i]:null);
        return{level:level,title:'Level '+level,grid:grid,solution:V.slice(),par:9-cells.length}}}
    g++}}
PZD3.mt={make:mtMake,squares:mtSquares,lines:mtLines,lineSum:mtLineSum};
function mountMt(root,inst,api){
  var w=shell(root,'pd-mt'),g=inst.grid.slice(),given=inst.grid.map(function(v){return v!==null}),sel=-1,hist=[],made=0,hints=0,undos=0,fin=false,
    cells=[],pickBtns=[],i,
    info=pzEl('p',{class:'pd-info',text:'Put the numbers 1 to 9 into the square, one number in each square. Every row, column and long diagonal must add to 15. Tap a square, then tap a number.'}),
    board=pzEl('div',{class:'pd-magic',role:'group','aria-label':'The square'}),
    pick=pzEl('div',{class:'pd-row',role:'group','aria-label':'Numbers'}),
    clr=B('Clear the square',function(){clearSel()},'',{}),
    lines=pzEl('ul',{class:'pd-list','aria-label':'Line totals'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'});
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function used(n){return g.indexOf(n)>=0}
  function paint(){
    for(var q=0;q<9;q++){var b=cells[q],v=g[q];
      b.textContent=v===null?'':String(v);
      b.className='pd-btn pd-sq'+(given[q]?' pd-given':'');
      b.setAttribute('aria-pressed',sel===q?'true':'false');
      b.setAttribute('aria-label','Row '+(Math.floor(q/3)+1)+', column '+(q%3+1)+', '+(given[q]?'given '+v:(v===null?'empty':'holds '+v))+(sel===q?', selected':''))}
    for(var n=1;n<=9;n++)pickBtns[n-1].disabled=used(n)||fin;
    clr.disabled=sel<0||given[sel]||g[sel]===null||fin;
    lines.textContent='';
    mtLines.forEach(function(L,k){var s=mtLineSum(g,L),t=mtNames[k]+': '+(s===null?'not finished':s+(s===15?', correct':', not 15'));lines.appendChild(pzEl('li',{text:t}))})}
  function setCell(q,v){hist.push({i:q,prev:g[q]});g[q]=v;made++;api.moved()}
  function place(n){if(fin)return;if(sel<0){say('Tap an empty square first.');return}
    if(given[sel]){say('That square is given and stays as it is.');return}
    if(used(n)){say('The number '+n+' is already in the square. Clear that square first.');return}
    setCell(sel,n);sel=-1;afterChange()}
  function clearSel(){if(fin||sel<0||given[sel]||g[sel]===null)return;setCell(sel,null);sel=-1;afterChange()}
  function afterChange(){paint();
    if(g.every(function(v){return v!==null})){
      var bad=-1;mtLines.forEach(function(L,k){if(bad<0&&mtLineSum(g,L)!==15)bad=k});
      if(bad<0){fin=true;paint();say('Every line adds to 15. You filled the square.');
        api.done({solved:true,moves:made,hints:hints,undos:undos,extra:{par:inst.par}});return}
      say('Not yet: the '+mtNames[bad].toLowerCase()+' adds to '+mtLineSum(g,mtLines[bad])+', not 15. Clear a square to fix it.');return}
    say('Filled '+g.filter(function(v){return v!==null}).length+' of 9 squares.')}
  function tapCell(q){if(fin)return;if(given[q]){say('That number is given and stays as it is.');return}
    sel=q;paint();say(g[q]===null?'Now tap a number to put in this square.':'Tap a number to change this square, or clear it.')}
  for(i=0;i<9;i++)(function(q){cells.push(pzBtn('',function(){tapCell(q)},{class:'pd-btn pd-sq'}))})(i);
  for(i=0;i<9;i++)board.appendChild(cells[i]);
  for(i=1;i<=9;i++)(function(n){pickBtns.push(pzBtn(String(n),function(){place(n)},{class:'pd-btn pd-key','aria-label':'Put '+n+' in the selected square'}))})(i);
  pickBtns.forEach(function(b){pick.appendChild(b)});
  w.appendChild(info);w.appendChild(board);w.appendChild(pick);w.appendChild(clr);w.appendChild(lines);w.appendChild(msg);
  paint();
  return{undo:function(){if(fin||!hist.length)return false;var h=hist.pop();g[h.i]=h.prev;undos++;sel=-1;paint();say('Undone.');return true},
    restart:function(){g=inst.grid.slice();hist=[];made=0;hints=0;undos=0;sel=-1;fin=false;paint();say('Restarted. Same square, fresh start.')},
    hint:function(lv){if(fin)return null;var e=-1;for(var q=0;q<9;q++)if(g[q]===null){e=q;break}
      if(e<0)return null;hints++;var r=Math.floor(e/3)+1,c=e%3+1,s;
      if(lv<=1)s='Every line adds to 15, and the centre square is part of four of them.';
      else if(lv===2)s='Fill the empty square in row '+r+', column '+c+'.';
      else{var v=inst.solution[e],j=g.indexOf(v);if(j>=0&&!given[j])setCell(j,null);
        setCell(e,v);s='Put '+v+' in row '+r+', column '+c+' for you.';afterChange();if(!fin)say(s);return s}
      say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'magic-three',name:'Magic Three',family:'number',theme:'F6',calm:true,
  blurb:'Fill a square of numbers so every line adds to the same total.',
  how:'Put the numbers 1 to 9 into the square, one each, so every row, column and long diagonal adds to 15. Tap a square, then a number. Clear or Undo takes a number back.',
  areas:['flex','control'],levels:30,secs:120,make:mtMake,mount:wrapMount(mountMt),
  stars:function(res,inst){var p=(inst&&inst.par)||(res.extra&&res.extra.par)||res.moves,m=res.moves,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You filled the square in '+plural(m,'move')+' and '+hintsLine(h)+'. The square had '+plural(p,'empty square')+' to fill.'}}});
})();
