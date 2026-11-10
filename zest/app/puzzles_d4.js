/* Zest wave 2, file 4: River Ferry (F7), Flat Fold Check (F8), Seat the Guests (F4), Anvil Ratios (F2), Blockade (F9).
   Loaded after puzzles_kit.js. Every make(level,rng) is pure (no Math.random, no DOM): the same seed gives the same puzzle on every device.
   Generators and solvers are exposed on PZD4 for tests/pzd4_logic.js.
   River Ferry: breadth-first search over crossings; par = the shortest number of crossings. Only safe crossings are allowed.
   Flat Fold Check: each fold point is judged by two rules: alternate angles each add to 180 (Kawasaki) and mountain and valley creases differ by 2 (Maekawa).
   Seat the Guests: the plan is shown for a few seconds, then each guest is placed. par = number of guests. No timing penalty.
   Anvil Ratios: octave 2 to 1, fifth 3 to 2, fourth 4 to 3. Level 1 uses the legend weights 12, 8 and 6.
   Blockade: a game search. par = fewest moves of yours that force a win against every reply. After each of your moves the opponent's reply is the worst one for you.
   Wording is about the puzzle only: no claims about the brain, memory or health. No luck anywhere. Audio is not used. */
var PZD4={};
(function(){
var CSS='.pd4{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.pd4 *{box-sizing:border-box}.pd4 [hidden]{display:none!important}'
+'.pd4-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.pd4-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.pd4-h{margin:0;font:700 1rem var(--font);text-align:center}'
+'.pd4-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.pd4-b{min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer}'
+'.pd4-b.pd4-main{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}'
+'.pd4-b:disabled{background:var(--dis-bg);color:var(--dis-ink);border-color:var(--dis-bg);cursor:default}'
+'.pd4-b[aria-pressed=true]{background:var(--tint);outline:3px solid var(--ink);outline-offset:-3px}'
+'.pd4-box{width:100%;padding:8px;border:1px solid var(--line);border-radius:var(--r1);background:var(--surface);display:flex;flex-direction:column;gap:6px;align-items:center}'
+'.pd4-tag{display:inline-block;min-height:48px;padding:12px 10px;border:1px dashed var(--edge);border-radius:var(--r1);font-weight:600}'
+'.pd4-list{list-style:none;margin:0;padding:0;width:100%;display:flex;flex-direction:column;gap:6px}'
+'.pd4-list li{padding:8px 12px;border:1px solid var(--line);border-radius:var(--r1);background:var(--surface);font-weight:600;text-align:center}'
+'.pd4-svg{width:min(240px,80vw);height:auto;display:block;margin:0 auto}'
+'.pd4-svg text{font:700 13px var(--font);fill:var(--ink)}'
+'.pd4-board{position:relative;width:100%;max-width:300px;aspect-ratio:1/1;margin:0 auto}'
+'.pd4-board svg{position:absolute;left:0;top:0;width:100%;height:100%}'
+'.pd4-pt{position:absolute;width:52px;height:52px;margin:0;padding:0;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:800 1.125rem var(--font);cursor:pointer}'
+'.pd4-pt.pd4-you{background:var(--tint)}'
+'.pd4-pt.pd4-them{border-radius:50%;border-width:3px}'
+'.pd4-pt[aria-pressed=true]{outline:3px solid var(--ink);outline-offset:2px}'
+'.pd4-tbl{width:100%;display:flex;flex-direction:column;gap:6px}'
+'.pd4-ratio{margin:0;font:700 1.0625rem var(--font);text-align:center}'
+'.pd4-bar{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%;margin-top:4px}'
+'.pd4 .pd4-bar .pd4-b{flex:1 1 90px}';
function css(){if(document.getElementById('pd4-css'))return;var s=document.createElement('style');s.id='pd4-css';s.textContent=CSS;document.head.appendChild(s)}
function B(label,fn,cls,attrs){var a={type:'button',class:('pd4-b '+(cls||'')).trim(),'aria-label':label,text:label,onclick:fn};if(attrs)Object.keys(attrs).forEach(function(k){a[k]=attrs[k]});return pzEl('button',a)}
function ns(tag,at){var e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.keys(at||{}).forEach(function(k){e.setAttribute(k,at[k])});return e}
function plural(n,w){return n+' '+w+(n===1?'':'s')}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
function stdStars(res,inst){var m=res.moves,p=(inst&&inst.par)||m,h=res.hints||0,s=pzStarsByPar(m,p,h);
  return{stars:s,line:'You finished in '+plural(m,'move')+' with '+hintsLine(h)+'. The fewest possible is '+p+'.'}}
/* every mount is wrapped: a toolbar with Undo, Hint and Restart unless api.toolbar===false or inst.toolbar===false; done() fires 350 ms after the last move */
function wrap(m){return function(root,inst,api){css();root.textContent='';var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var host=pzEl('div',{class:'pd4'});root.appendChild(host);
  var c=m(host,inst,a2);
  [].forEach.call(host.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live',typeof api.say==='function'?'off':'polite')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'pd4-bar'});
    bar.appendChild(B('Undo',function(){lv=0;c.undo()},'',{'aria-label':'Undo'}));
    bar.appendChild(B('Hint',function(){lv=Math.min(3,lv+1);var t=c.hint(lv);if(!t&&typeof api.say==='function')api.say('No hint is needed right now.')},'',{'aria-label':'Hint'}));
    bar.appendChild(B('Restart',function(){lv=0;c.restart()},'',{'aria-label':'Restart this level'}));
    host.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,destroy:function(){clearTimeout(tm);if(c.stop)c.stop();c.destroy();root.textContent=''}}}}

/* ---------- 1. River Ferry ---------- */
var RF_NAMES=['wolf','goat','cabbage','hen','fox','grain','dog'];
function rfSafe(mask,bad,side){for(var k=0;k<bad.length;k++){if(((mask>>bad[k][0])&1)===side&&((mask>>bad[k][1])&1)===side)return false}return true}
/* legal crossings from (mask,f): bit i of mask = item i on the far bank; f = the farmer's bank (0 near, 1 far). item -1 = the farmer goes alone */
function rfNext(n,bad,mask,f){var out=[],cand=[-1],i;for(i=0;i<n;i++)if(((mask>>i)&1)===f)cand.push(i);
  cand.forEach(function(it){var m2=it<0?mask:mask^(1<<it);if(rfSafe(m2,bad,f))out.push({item:it,mask:m2,f:1-f})});return out}
/* shortest route from the state to everything on the far bank with the farmer there: [{item,mask,f}] or null */
function rfPath(n,bad,mask0,f0){var goal=(1<<n)-1,start=mask0*2+f0,prev={},q=[start],h,j;
  if(mask0===goal&&f0===1)return[];prev[start]=null;
  for(h=0;h<q.length;h++){var s=q[h],nx=rfNext(n,bad,s>>1,s&1);
    for(j=0;j<nx.length;j++){var key=nx[j].mask*2+nx[j].f;if(key in prev)continue;prev[key]={from:s,step:nx[j]};
      if(nx[j].mask===goal&&nx[j].f===1){var path=[],cur=key;while(prev[cur]){path.unshift(prev[cur].step);cur=prev[cur].from}return path}
      q.push(key)}}
  return null}
function rfMake(level,rng){
  var n=level<=10?3:level<=20?4:5,minPar=level<=10?5:level<=20?7:9,sol=null,bad=null,i,j,t,p,path;
  if(level===1){n=3;bad=[[0,1],[1,2]];sol=rfPath(3,bad,0,0)}
  else for(t=0;t<200&&!sol;t++){bad=[];p=0.25+0.015*level;
    for(i=0;i<n;i++)for(j=i+1;j<n;j++)if(rng()<p)bad.push([i,j]);
    if(!bad.length)continue;path=rfPath(n,bad,0,0);if(path&&path.length>=minPar)sol=path}
  if(!sol){n=3;bad=[[0,1],[1,2]];sol=rfPath(3,bad,0,0)}
  return{title:'Level '+level,par:sol.length,n:n,names:RF_NAMES.slice(0,n),bad:bad}}
function rfMount(root,inst,api){
  var n=inst.n,bad=inst.bad,names=inst.names,full=(1<<n)-1,mask=0,f=0,boat=-1,hist=[],moves=0,undos=0,hints=0,done=false;
  var msg=pzEl('p',{class:'pd4-msg',role:'status'}),info=pzEl('p',{class:'pd4-info',text:'Load one item with the farmer into the boat, then sail. Some items cannot be left alone together.'});
  var rules=pzEl('ul',{class:'pd4-list','aria-label':'Rules'}),banks=pzEl('div',{class:'pd4-tbl'}),boatEl=pzEl('div',{class:'pd4-box'});
  var sailBtn=B('Sail',function(){sail()},'pd4-main');
  bad.forEach(function(p){rules.appendChild(pzEl('li',{text:'The '+names[p[0]]+' and the '+names[p[1]]+' cannot be left alone together.'}))});
  root.appendChild(info);root.appendChild(rules);root.appendChild(banks);root.appendChild(boatEl);
  root.appendChild(pzEl('div',{class:'pd4-row'},[sailBtn]));root.appendChild(msg);
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function badPairOn(m2,side){for(var k=0;k<bad.length;k++)if(((m2>>bad[k][0])&1)===side&&((m2>>bad[k][1])&1)===side)return bad[k];return null}
  function paint(){
    banks.textContent='';
    [0,1].forEach(function(side){
      var box=pzEl('div',{class:'pd4-box'});box.appendChild(pzEl('h3',{class:'pd4-h',text:side===0?'Near bank':'Far bank'}));
      box.appendChild(pzEl('p',{class:'pd4-info',text:f===side?'The farmer is here.':'The farmer is across.'}));
      var row=pzEl('div',{class:'pd4-row'}),any=false;
      for(var i=0;i<n;i++){if(((mask>>i)&1)!==side||i===boat)continue;any=true;
        if(side===f)row.appendChild(B('Load the '+names[i]+' into the boat',function(i){return function(){if(done)return;if(boat>=0){say('The boat already has the '+names[boat]+'. Unload it first.');return}boat=i;say('The '+names[i]+' is in the boat.');paint()}}(i)));
        else row.appendChild(pzEl('span',{class:'pd4-tag',text:names[i]}))}
      if(!any)row.appendChild(pzEl('span',{class:'pd4-info',text:'Nothing here.'}));
      box.appendChild(row);banks.appendChild(box)});
    boatEl.textContent='';boatEl.appendChild(pzEl('h3',{class:'pd4-h',text:'Boat'}));
    boatEl.appendChild(pzEl('p',{class:'pd4-info',text:boat>=0?'Carrying the '+names[boat]+'.':'Carrying no item.'}));
    if(boat>=0)boatEl.appendChild(B('Unload the '+names[boat]+' from the boat',function(){if(done)return;say('The '+names[boat]+' is back on the bank.');boat=-1;paint()}));
    sailBtn.textContent=f===0?'Sail to the far bank':'Sail to the near bank';sailBtn.setAttribute('aria-label',sailBtn.textContent);sailBtn.disabled=done;
  }
  function sail(){if(done)return false;
    var it=boat,m2=it<0?mask:mask^(1<<it);
    if(!rfSafe(m2,bad,f)){var pr=badPairOn(m2,f);say('Not safe: the '+names[pr[0]]+' and the '+names[pr[1]]+' would be left alone together. Choose a different load.');return false}
    hist.push({mask:mask,f:f});mask=m2;f=1-f;boat=-1;moves++;api.moved();
    if(mask===full&&f===1){done=true;say('Everyone is across.');paint();api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par}});return true}
    say(rfPath(n,bad,mask,f)?'Crossing '+moves+' is done.':'This route cannot finish. Undo to try another crossing.');paint();return true}
  paint();
  return{
    undo:function(){if(done||!hist.length)return false;var h=hist.pop();mask=h.mask;f=h.f;boat=-1;undos++;say('Undone.');paint();return true},
    restart:function(){mask=0;f=0;boat=-1;hist=[];done=false;say('Restarted.');paint()},
    hint:function(lv){if(done)return null;hints++;var path=rfPath(n,bad,mask,f),s;
      if(lv<=1)s='Some items cannot be left alone together. The rules above list them.';
      else if(!path)s='This route cannot finish. Undo to go back.';
      else if(lv===2)s=path[0].item<0?'Next crossing: the farmer goes over alone.':'Next crossing: take the '+names[path[0].item]+' over.';
      else{var want=path[0].item;if(boat>=0&&boat!==want){boat=-1}
        if(want>=0)boat=want;
        sail();s=want<0?'Sailed with nothing in the boat.':'Sailed with the '+names[want]+'.'}
      say(s);paint();return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'river-ferry',name:'River Ferry',family:'move',theme:'F7',blurb:'Ferry the wolf, goat and cabbage across the river.',
  how:'Load one item into the boat with the farmer, then sail. Some items cannot be left alone together. Cross in the fewest trips.',
  areas:['control','space'],levels:30,secs:120,make:rfMake,mount:wrap(rfMount),stars:stdStars});

/* ---------- 2. Flat Fold Check ---------- */
function ffSplit(k,rng){var a=[],i,rem=180-10*k;for(i=0;i<k;i++)a.push(10);for(i=0;i<rem;i++)a[pzInt(rng,k)]++;return a}
/* checks a fold point from its numbers alone: alternate angles (1st, 3rd, ...) and (2nd, 4th, ...) must each add to 180; mountain minus valley must be 2 or -2 */
function ffCheck(a,mv){var s1=0,s2=0,i,M=0,V=0;for(i=0;i<a.length;i++){if(i%2===0)s1+=a[i];else s2+=a[i]}
  for(i=0;i<mv.length;i++)mv[i]==='M'?M++:V++;
  var kaw=s1===180&&s2===180,mae=Math.abs(M-V)===2;return{s1:s1,s2:s2,M:M,V:V,kaw:kaw,mae:mae,flat:kaw&&mae}}
function ffPoint(d,flat,rng){var k=d/2,o=ffSplit(k,rng),e=ffSplit(k,rng),a=[],i,m,labels,kind=null,cands=[];
  for(i=0;i<k;i++){a.push(o[i]);a.push(e[i])}
  if(!flat)kind=rng()<0.5?'kaw':'mae';
  if(kind==='kaw'){var dl=2+pzInt(rng,6);a[0]+=dl;a[1]-=dl}
  if(kind==='mae'){for(m=0;m<=d;m++)if(Math.abs(2*m-d)!==2)cands.push(m);m=cands[pzInt(rng,cands.length)]}
  else m=k+(rng()<0.5?1:-1);
  labels=[];for(i=0;i<d;i++)labels.push(i<m?'M':'V');labels=pzShuffle(labels,rng);
  var c=ffCheck(a,labels);return{angles:a,mv:labels,kaw:c.kaw,mae:c.mae,flat:c.flat,s1:c.s1,s2:c.s2,M:c.M,V:c.V}}
function ffMake(level,rng){var N=level<=10?3:level<=20?4:5,flags=[],pts=[],i,d;
  for(i=0;i<N;i++)flags.push(rng()<0.5);
  if(flags.every(function(x){return x}))flags[N-1]=false;
  for(i=0;i<N;i++){d=level<=10?4:level<=20?(rng()<0.5?4:6):4+2*pzInt(rng,3);pts.push(ffPoint(d,flags[i],rng))}
  return{title:'Level '+level,par:N,pts:pts}}
function ffWhy(p){if(!p.kaw)return'Alternate angles should each add to 180. Here the 1st, 3rd and so on add to '+p.s1+', and the 2nd, 4th and so on add to '+p.s2+'.';
  return'Mountain and valley creases should differ by exactly 2. Here there are '+p.M+' mountain and '+p.V+' valley.'}
function ffSvg(p){var svg=ns('svg',{viewBox:'0 0 240 240',role:'img','aria-label':'Fold point with '+p.angles.length+' creases. Angles in degrees: '+p.angles.join(', ')});
  var cx=120,cy=120,R=92,th=0,i,a,t,x,y,mid,tx,at;
  svg.appendChild(ns('circle',{cx:cx,cy:cy,r:R+14,fill:'none',stroke:'var(--line)','stroke-width':1}));
  for(i=0;i<p.angles.length;i++){a=p.angles[i];t=th*Math.PI/180;x=cx+R*Math.cos(t);y=cy+R*Math.sin(t);
    svg.appendChild(ns('line',{x1:cx,y1:cy,x2:x,y2:y,stroke:'var(--ink)','stroke-width':p.mv[i]==='M'?3:2,'stroke-dasharray':p.mv[i]==='M'?'':'7 5'}));
    tx=ns('text',{x:cx+(R+12)*Math.cos(t),y:cy+(R+12)*Math.sin(t)+4,'text-anchor':'middle'});tx.textContent=(i+1)+' '+p.mv[i];svg.appendChild(tx);
    mid=(th+a/2)*Math.PI/180;at=ns('text',{x:cx+R*0.5*Math.cos(mid),y:cy+R*0.5*Math.sin(mid)+4,'text-anchor':'middle'});at.textContent=a+'°';svg.appendChild(at);
    th+=a}
  return svg}
function ffMount(root,inst,api){var pts=inst.pts,N=pts.length,idx=0,moves=0,undos=0,hints=0,done=false,hist=[];
  var msg=pzEl('p',{class:'pd4-msg',role:'status'}),head=pzEl('h3',{class:'pd4-h'}),info=pzEl('p',{class:'pd4-info',text:'Solid lines are mountain creases (M). Dashed lines are valley creases (V). Angles are in degrees, in order around the point.'}),
    art=pzEl('div',{class:'pd4-box'}),list=pzEl('p',{class:'pd4-info'}),yes=B('Yes, it folds flat',function(){answer(true)},'pd4-main'),no=B('No, it does not fold flat',function(){answer(false)});
  root.appendChild(head);root.appendChild(info);root.appendChild(art);root.appendChild(list);
  root.appendChild(pzEl('div',{class:'pd4-row'},[yes,no]));root.appendChild(msg);
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function paint(){head.textContent=done?'All points checked':'Point '+(idx+1)+' of '+N+': can it fold flat?';
    art.textContent='';if(!done)art.appendChild(ffSvg(pts[idx]));
    list.textContent=done?'':'Angles: '+pts[idx].angles.join(', ')+' degrees.';
    yes.disabled=done;no.disabled=done}
  function answer(ans){if(done)return false;var p=pts[idx];moves++;api.moved();
    if(p.flat===ans){hist.push(idx);idx++;
      if(idx>=N){done=true;say('Every point is right.');paint();api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:N}});return true}
      say('Right. '+(ans?'Both checks pass for this point.':'This point does not fold flat. '+ffWhy(p)));paint();return true}
    say('Not this time. '+(p.flat?'This point does fold flat, because the alternate angles add to 180 and the creases differ by 2.':ffWhy(p)));paint();return false}
  paint();
  return{
    undo:function(){if(done||!hist.length)return false;idx=hist.pop();undos++;say('Undone. Point '+(idx+1)+' is shown again.');paint();return true},
    restart:function(){idx=0;hist=[];done=false;say('Restarted.');paint()},
    hint:function(lv){if(done)return null;hints++;var p=pts[idx],s;
      if(lv<=1)s='Add the 1st, 3rd and 5th angles, then the 2nd, 4th and 6th. Does each total make 180?';
      else if(lv===2)s='Count the solid and dashed creases. They should differ by exactly 2.';
      else{answer(p.flat);s=p.flat?'The answer is yes, it folds flat.':'The answer is no, it does not fold flat.'}
      say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'flat-fold-check',name:'Flat Fold Check',family:'number',theme:'F8',blurb:'Decide whether each fold point can lie flat.',
  how:'Look at the angles and the creases of each point. Tap Yes or No. A wrong answer explains the rule that failed.',
  areas:['space','attention'],levels:30,secs:90,make:ffMake,mount:wrap(ffMount),stars:stdStars});

/* ---------- 3. Seat the Guests ---------- */
var SG_NAMES=['Ada','Ben','Chidi','Dara','Eli','Farah','Gus','Hana','Ivo','Jun','Kai','Lena','Mo','Nia','Omar','Pia'];
var SG_TABLES='ABCD';
function sgMake(level,rng){var T=level<=10?2:level<=20?3:4,S=4*T,names=pzShuffle(SG_NAMES,rng).slice(0,S);
  return{title:'Level '+level,par:S,tables:T,plan:names,showMs:4000+500*S}}
function sgMount(root,inst,api){var T=inst.tables,S=inst.par,plan=inst.plan,placed=[],sel=null,phase='show',moves=0,undos=0,hints=0,done=false,hist=[],timer=null;
  var msg=pzEl('p',{class:'pd4-msg',role:'status'}),info=pzEl('p',{class:'pd4-info'}),board=pzEl('div',{class:'pd4-tbl'}),tray=pzEl('div',{class:'pd4-row'}),hide=B('Hide the plan now',function(){endShow()});
  root.appendChild(info);root.appendChild(board);root.appendChild(hide);root.appendChild(tray);root.appendChild(msg);
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function seatName(s){return'Table '+SG_TABLES.charAt(Math.floor(s/4))+', seat '+(s%4+1)}
  function unplaced(){var out=[];plan.forEach(function(nm,s){if(placed[s]===undefined)out.push(nm)});return out}
  function paint(){
    board.textContent='';tray.textContent='';
    if(phase==='show'){info.textContent='Here is the seating plan. It hides after a few seconds.';hide.hidden=false;
      for(var t=0;t<T;t++){var box=pzEl('div',{class:'pd4-box'});box.appendChild(pzEl('h3',{class:'pd4-h',text:'Table '+SG_TABLES.charAt(t)}));
        var ul=pzEl('ul',{class:'pd4-list'});for(var k=0;k<4;k++)ul.appendChild(pzEl('li',{text:'Seat '+(k+1)+': '+plan[t*4+k]}));box.appendChild(ul);board.appendChild(box)}
      return}
    hide.hidden=true;
    info.textContent=sel?'Now tap an empty seat for '+sel+'.':'Tap a guest, then the seat they sat in.';
    for(var t2=0;t2<T;t2++){var box2=pzEl('div',{class:'pd4-box'});box2.appendChild(pzEl('h3',{class:'pd4-h',text:'Table '+SG_TABLES.charAt(t2)}));
      var row=pzEl('div',{class:'pd4-row'});
      for(var k2=0;k2<4;k2++){var s=t2*4+k2,nm=placed[s],lab=nm!==undefined?seatName(s)+': '+nm:seatName(s)+': empty';
        row.appendChild(B(lab,function(s){return function(){seat(s)}}(s),'',{'aria-label':lab}))}
      box2.appendChild(row);board.appendChild(box2)}
    unplaced().forEach(function(nm){tray.appendChild(B('Guest '+nm,function(){if(done||phase!=='seat')return;sel=sel===nm?null:nm;say(sel?sel+' is selected. Tap an empty seat.':'Selection cleared.');paint()},'',{'aria-label':'Guest '+nm,'aria-pressed':sel===nm?'true':'false'}))})
  }
  function endShow(){if(phase!=='show')return;clearTimeout(timer);phase='seat';say('Now seat the guests.');paint()}
  function seat(s){if(done||phase!=='seat')return;
    if(placed[s]!==undefined){say(seatName(s)+' already has '+placed[s]+'.');return}
    if(!sel){say('Tap a guest first.');return}
    moves++;api.moved();
    if(plan[s]===sel){placed[s]=sel;hist.push({s:s,nm:sel});say(sel+' sits in '+seatName(s)+'.');sel=null;
      if(placed.filter(function(x){return x!==undefined}).length===S){done=true;say('Everyone is seated.');paint();api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:S}});return}}
    else say('Not that seat. Try another seat for '+sel+'.');
    paint()}
  timer=setTimeout(endShow,inst.showMs);
  paint();
  return{
    stop:function(){clearTimeout(timer)},
    undo:function(){if(done||phase!=='seat'||!hist.length)return false;var h=hist.pop();placed[h.s]=undefined;undos++;sel=null;say('Undone. '+h.nm+' is back in the guest list.');paint();return true},
    restart:function(){clearTimeout(timer);placed=[];sel=null;hist=[];done=false;phase='show';paint();timer=setTimeout(endShow,inst.showMs);say('Restarted. The plan shows again.')},
    hint:function(lv){if(done)return null;hints++;
      if(phase==='show'){var s0='Wait for the plan to hide, then place the guests.';say(s0);return s0}
      var nm=sel||unplaced()[0],s=plan.indexOf(nm),st;
      if(lv<=1)st='Think about which table '+nm+' sat at.';
      else if(lv===2)st=nm+' sat in '+seatName(s)+'.';
      else{if(placed[s]===undefined){sel=nm;seat(s)}st=nm+' is in '+seatName(s)+'.'}
      say(st);paint();return st},
    destroy:function(){clearTimeout(timer);root.textContent=''}}}
registerPuzzle({id:'seat-the-guests',name:'Seat the Guests',family:'memory',theme:'F4',blurb:'Seat each guest where they sat in the plan.',
  how:'Look at the seating plan while it shows. When it hides, tap a guest and then the seat they belong in. Each guest has one seat.',
  areas:['attention','memory'],levels:30,secs:90,make:sgMake,mount:wrap(sgMount),stars:stdStars});

/* ---------- 4. Anvil Ratios ---------- */
var AR_KEY=[{name:'Octave',p:1,q:2},{name:'Fifth',p:2,q:3},{name:'Fourth',p:3,q:4}];
function arRatio(t){return AR_KEY[t].q+' to '+AR_KEY[t].p}
function arMake(level,rng){var R=level<=8?2:level<=16?3:level<=24?4:5,rows=[],r,t,km,mx,x,kk;
  if(level===1)rows=[{lo:6,hi:12,ans:0},{lo:8,hi:12,ans:1}];
  else for(r=0;r<R;r++){t=pzInt(rng,3);km=1+pzInt(rng,level<=10?2:4);kk=AR_KEY[t];mx=Math.floor(48/(kk.q*km));x=1+pzInt(rng,mx);
    rows.push({lo:kk.p*x*km,hi:kk.q*x*km,ans:t})}
  return{title:'Level '+level,par:rows.length,rows:rows}}
function arMount(root,inst,api){var rows=inst.rows,R=rows.length,got=rows.map(function(){return -1}),moves=0,undos=0,hints=0,done=false,hist=[];
  var msg=pzEl('p',{class:'pd4-msg',role:'status'}),list=pzEl('div',{class:'pd4-tbl'});
  root.appendChild(pzEl('p',{class:'pd4-ratio',text:'Octave is 2 to 1. Fifth is 3 to 2. Fourth is 4 to 3.'}));
  root.appendChild(pzEl('p',{class:'pd4-info',text:'Divide the bigger weight by the smaller one, then tap the interval that ratio makes.'}));
  root.appendChild(list);root.appendChild(msg);
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function paint(){list.textContent='';
    rows.forEach(function(rw,i){var box=pzEl('div',{class:'pd4-box'});
      box.appendChild(pzEl('p',{class:'pd4-h',text:'Pair '+(i+1)+': '+rw.hi+' and '+rw.lo+' pounds'}));
      if(got[i]>=0)box.appendChild(pzEl('p',{class:'pd4-info',text:'Matched: '+AR_KEY[got[i]].name+' ('+arRatio(got[i])+')'}));
      else{var row=pzEl('div',{class:'pd4-row'});AR_KEY.forEach(function(kk,t){row.appendChild(B(kk.name+' for pair '+(i+1),function(){answer(i,t)}))});box.appendChild(row)}
      list.appendChild(box)})}
  function answer(i,t){if(done||got[i]>=0)return false;moves++;api.moved();var rw=rows[i];
    if(t===rw.ans){got[i]=t;hist.push(i);say('Yes. '+rw.hi+' to '+rw.lo+' is '+arRatio(t)+', a '+AR_KEY[t].name.toLowerCase()+'.');
      if(got.every(function(x){return x>=0})){done=true;say('All pairs are matched.');paint();api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:R}});return true}
      paint();return true}
    say('Not that one. '+rw.hi+' to '+rw.lo+' is '+arRatio(rw.ans)+', a '+AR_KEY[rw.ans].name.toLowerCase()+'.');paint();return false}
  paint();
  return{
    undo:function(){if(done||!hist.length)return false;var i=hist.pop();got[i]=-1;undos++;say('Undone.');paint();return true},
    restart:function(){got=rows.map(function(){return -1});hist=[];done=false;say('Restarted.');paint()},
    hint:function(lv){if(done)return null;hints++;var i=got.indexOf(-1),rw=rows[i],s;
      if(lv<=1)s='Divide the bigger weight by the smaller one, then compare with 2 to 1, 3 to 2 and 4 to 3.';
      else if(lv===2)s='The pair with '+rw.hi+' and '+rw.lo+' is a '+AR_KEY[rw.ans].name.toLowerCase()+'.';
      else{answer(i,rw.ans);s=rw.hi+' and '+rw.lo+' make a '+AR_KEY[rw.ans].name.toLowerCase()+'.'}
      say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'anvil-ratios',name:'Anvil Ratios',family:'number',theme:'F2',blurb:'Match each pair of weights to its interval.',
  how:'Divide the bigger weight by the smaller one. Tap the interval that ratio makes: octave, fifth or fourth.',
  areas:['attention','flex'],levels:30,secs:60,make:arMake,mount:wrap(arMount),stars:stdStars});

/* ---------- 5. Blockade (eight points round a centre) ---------- */
var BK_ADJ=[];(function(){var i;for(i=0;i<9;i++)BK_ADJ.push([]);
  function link(a,b){if(BK_ADJ[a].indexOf(b)<0)BK_ADJ[a].push(b);if(BK_ADJ[b].indexOf(a)<0)BK_ADJ[b].push(a)}
  for(i=0;i<8;i++)link(i,(i+1)%8);for(i=0;i<8;i+=2)link(8,i)})();
var BK_MEMO={},BK_MAX=6;
/* states are 9-character strings: Y = your counter, T = theirs, . = empty; point 8 is the centre */
function bkMoves(s,who){var out=[],i,j;for(i=0;i<9;i++){if(s.charAt(i)!==who)continue;for(j=0;j<BK_ADJ[i].length;j++){var t=BK_ADJ[i][j];if(s.charAt(t)==='.')out.push([i,t])}}return out}
function bkApply(s,mv){var a=s.split('');a[mv[0]]='.';a[mv[1]]=s.charAt(mv[0]);return a.join('')}
/* true when Y (to move) can force a win within n of Y's moves; T may make any legal reply */
function bkWin(s,n){if(n<=0)return false;var key=s+'|'+n;if(key in BK_MEMO)return BK_MEMO[key];
  var res=false,ms=bkMoves(s,'Y'),i,j;
  for(i=0;i<ms.length&&!res;i++){var s1=bkApply(s,ms[i]),rs=bkMoves(s1,'T');
    if(!rs.length){res=true;break}
    var all=true;for(j=0;j<rs.length&&all;j++){if(!bkWin(bkApply(s1,rs[j]),n-1))all=false}
    if(all)res=true}
  BK_MEMO[key]=res;return res}
/* fewest moves of Y that force a win from s; 0 when none within BK_MAX */
function bkMinWin(s){for(var n=1;n<=BK_MAX;n++)if(bkWin(s,n))return n;return 0}
function bkVal(s){return bkMinWin(s)||99}
/* Y's best first move: the one whose worst reply leaves the fewest further moves */
function bkBest(s){var ms=bkMoves(s,'Y'),best=null,bv=1e9,i;for(i=0;i<ms.length;i++){var s1=bkApply(s,ms[i]),rs=bkMoves(s1,'T'),v=0,j;
  for(j=0;j<rs.length;j++){var w=1+bkVal(bkApply(s1,rs[j]));if(w>v)v=w}
  if(v<bv){bv=v;best=ms[i]}}return best}
/* T's reply in the game: the one that gives Y the longest win (ties: first in order) */
function bkReply(s1){var rs=bkMoves(s1,'T'),best=null,bv=-1,j;for(j=0;j<rs.length;j++){var v=bkVal(bkApply(s1,rs[j]));if(v>bv){bv=v;best=rs[j]}}return best}
function bkMake(level,rng){var target=level<=8?1:level<=16?2:level<=24?3:4,best=null,bestD=99,t,i,mine,theirs,cells,s,p,arr;
  for(t=0;t<60;t++){mine=2+pzInt(rng,3);theirs=2+pzInt(rng,3);cells=pzShuffle([0,1,2,3,4,5,6,7,8],rng);arr=[];
    for(i=0;i<9;i++)arr.push('.');
    for(i=0;i<mine;i++)arr[cells[i]]='Y';for(i=0;i<theirs;i++)arr[cells[mine+i]]='T';s=arr.join('');
    p=bkMinWin(s);if(!p)continue;if(p===target)return{title:'Level '+level,par:p,start:s};
    if(Math.abs(p-target)<bestD){bestD=Math.abs(p-target);best={title:'Level '+level,par:p,start:s}}}
  return best||{title:'Level '+level,par:1,start:'YYYY.TTT..'}}
var BK_NAMES=['Point 1','Point 2','Point 3','Point 4','Point 5','Point 6','Point 7','Point 8'];
function bkMount(root,inst,api){var START=inst.start,s=START,hist=[],sel=-1,moves=0,undos=0,hints=0,done=false;
  var msg=pzEl('p',{class:'pd4-msg',role:'status'}),info=pzEl('p',{class:'pd4-info',text:'Your counters are squares. Their counters are circles. Tap one of yours, then an empty point next to it. Find moves that leave them no legal reply.'}),
    board=pzEl('div',{class:'pd4-board'}),svg=ns('svg',{viewBox:'0 0 300 300','aria-hidden':'true'}),pts=[];
  var at=[];for(var i=0;i<8;i++){var a=-Math.PI/2+i*Math.PI/4;at.push([150+120*Math.cos(a),150+120*Math.sin(a)])}
  at.push([150,150]);
  BK_ADJ.forEach(function(nb,i){nb.forEach(function(j){if(j>i)svg.appendChild(ns('line',{x1:at[i][0],y1:at[i][1],x2:at[j][0],y2:at[j][1],stroke:'var(--ink)','stroke-width':2}))})});
  board.appendChild(svg);
  for(var k=0;k<9;k++){var b=pzEl('button',{type:'button',class:'pd4-pt',style:'left:calc('+(at[k][0]/3)+'% - 26px);top:calc('+(at[k][1]/3)+'% - 26px)'});b.onclick=(function(k){return function(){click(k)}})(k);pts.push(b);board.appendChild(b)}
  root.appendChild(info);root.appendChild(board);root.appendChild(msg);
  function say(t){msg.textContent=t;if(typeof api.say==='function')api.say(t)}
  function nm(i){return i<8?BK_NAMES[i]:'Centre point'}
  function paint(){for(var k=0;k<9;k++){var c=s.charAt(k),b=pts[k];b.className='pd4-pt'+(c==='Y'?' pd4-you':c==='T'?' pd4-them':'');
    b.textContent=c==='Y'?'■':c==='T'?'●':'';
    b.setAttribute('aria-pressed',sel===k?'true':'false');
    b.setAttribute('aria-label',nm(k)+(c==='Y'?': your counter':c==='T'?': their counter':': empty')+(sel===k?', selected':''));b.disabled=done}}
  function click(k){if(done)return;var c=s.charAt(k);
    if(c==='Y'){sel=sel===k?-1:k;say(sel>=0?'Selected '+nm(k)+'. Tap an empty point next to it.':'Selection cleared.');paint();return}
    if(c==='T'){say('That counter is theirs.');return}
    if(sel<0){say('Tap one of your counters first.');return}
    if(BK_ADJ[sel].indexOf(k)<0){say('Counters move to a point right next to them.');return}
    play([sel,k])}
  function play(mv){var before=s;s=bkApply(s,mv);sel=-1;hist.push(before);moves++;api.moved();
    if(!bkMoves(s,'T').length){done=true;say('They have no legal move. You trapped them.');paint();api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par}});return}
    var rp=bkReply(s);s=bkApply(s,rp);
    var txt='You moved to '+nm(mv[1])+'. They replied from '+nm(rp[0])+' to '+nm(rp[1])+'.';
    if(!bkMoves(s,'Y').length)txt+=' You have no legal move, so this line is lost. Undo to try again.';
    say(txt);paint()}
  paint();
  return{
    undo:function(){if(done||!hist.length)return false;s=hist.pop();sel=-1;undos++;say('Undone.');paint();return true},
    restart:function(){s=START;hist=[];sel=-1;done=false;say('Restarted.');paint()},
    hint:function(lv){if(done)return null;hints++;var st;
      if(lv<=1)st='Look for a counter of theirs that has an empty point beside it.';
      else if(lv===2)st='Pick the move that leaves them the fewest replies.';
      else{var mv=bkBest(s);if(!mv){st='You have no legal move from here. Undo to go back.';say(st);paint();return st}
        st='Moving the counter from '+nm(mv[0])+' to '+nm(mv[1])+'.';say(st);play(mv);return st}
      say(st);paint();return st},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'blockade',name:'Blockade',family:'move',theme:'F9',blurb:'Trap the opponent so they have no legal move.',
  how:'Slide one of your counters to an empty point next to it. Find moves that leave them with no legal reply. Fewer moves is better.',
  areas:['control','flex'],levels:30,secs:120,make:bkMake,mount:wrap(bkMount),stars:stdStars});

PZD4={rfPath:rfPath,rfMake:rfMake,ffCheck:ffCheck,ffMake:ffMake,sgMake:sgMake,arMake:arMake,bkMake:bkMake,bkWin:bkWin,bkMinWin:bkMinWin,bkMoves:bkMoves,bkApply:bkApply,bkBest:bkBest,bkReply:bkReply,BK_ADJ:BK_ADJ};
})();
