/* Zest v6 new puzzle (batch f): Shunting Yard (Inglenook-style shunting; a NEW id).
   The yard: a departure line (top), two more sidings, and the headshunt (bottom) where the engine waits. Every move is one engine trip, one tap:
   - tap a wagon in a siding: the engine runs in and comes back with that wagon and every wagon between it and the points (anything it was already
     pulling stays coupled, in front);
   - tap a siding: the engine pushes everything it pulls into that siding.
   Limits: the headshunt holds the engine plus 3 wagons, and a siding holds only its marked slots. Goal: the departure line holds exactly the
   wagons shown by the faint outlines, in that order.
   Levels are CURATED by tests/batch_f_gen_shunt.js: random yards (3-6 wagons), exact par by BFS (one move = one engine trip), and a filter:
   from level 4 a "make the departure line look more right each trip" player (best single trip by a simple score, random ties) must miss par
   in at least 9 of 10 runs, so every level needs staging that looks backwards at first.
   Lost positions: the code checks after every trip (kit 'dead' chip, deferred, Undo to the last good position), but on the shipped 30 levels
   every reachable position can still make the train (checked in tests/batch_f_logic.js), so it never shows. A refused trip (too long for the headshunt or the
   siding) moves nothing: the slots it would overfill pulse and a short line names the limit. */
(function(){
var ID='shunting-yard';
var LEVELS=[[[3,2,2],["1","0","2"],"10",2],[[3,2,2],["0","1","2"],"10",3],[[3,2,2],["","2","01"],"10",4],[[3,2,2],["0","2","13"],"031",4],[[3,2,2],["02","13",""],"032",5],[[3,2,2],["","31","02"],"310",6],[[4,3,2],["3","02","41"],"123",6],[[3,2,2],["2","3","10"],"023",7],[[4,3,2],["40","2","13"],"023",7],[[4,3,3],["341","2","0"],"0314",8],[[3,2,2],["0","13","2"],"320",6],[[4,3,2],["","124","03"],"413",8],[[4,3,3],["32","0","14"],"4123",9],[[5,3,3],["254","","301"],"2453",9],[[3,2,2],["13","","20"],"302",8],[[4,3,3],["03","124",""],"3102",10],[[5,3,3],["13","5","042"],"2031",10],[[4,3,2],["042","31",""],"430",9],[[5,3,3],["014","23","5"],"1042",11],[[4,3,3],["120","3","4"],"4231",10],[[5,3,3],["0234","5","1"],"4501",11],[[4,3,3],["4","0","312"],"1430",11],[[5,3,3],["3","04","251"],"1025",10],[[5,3,3],["05134","","2"],"3105",12],[[4,3,2],["40","23","1"],"102",10],[[5,3,3],["250","1","34"],"0514",11],[[5,3,3],["13","045","2"],"4310",12],[[4,3,3],["4","2","310"],"3012",11],[[5,3,3],["2034","15",""],"0214",12],[[5,3,3],["102","43","5"],"4205",12]]; /*LEVELS*/
var HC=3;
/* ---- core: state {s:[strings buffer->points], t:string far end->engine}; caps per siding; target string for siding 0 ---- */
function key(st){return st.s.join('|')+'#'+st.t}
function moves(st,caps){var out=[],t=st.t;
  for(var i=0;i<st.s.length;i++){var s=st.s[i];
    if(t&&s.length+t.length<=caps[i]){var ns=st.s.slice();ns[i]=s+t;out.push({m:['push',i],st:{s:ns,t:''}})}
    if(s.length+t.length<=caps[i])for(var j=0;j<s.length;j++){var nt=s.slice(j)+t;if(nt.length>HC)continue;var ns2=st.s.slice();ns2[i]=s.slice(0,j);out.push({m:['take',i,j],st:{s:ns2,t:nt}})}}
  return out}
function goal(st,target){return st.s[0]===target}
/* full reachable graph from start, then distance to the goal for every state (Infinity = lost) */
function analyse(start,caps,target,cap){cap=cap||200000;var K0=key(start),idx={},S=[start],adj=[];idx[K0]=0;
  for(var q=0;q<S.length;q++){var ms=moves(S[q],caps),a=[];for(var m=0;m<ms.length;m++){var k=key(ms[m].st);if(idx[k]==null){idx[k]=S.length;S.push(ms[m].st);if(S.length>cap)return null}a.push(idx[k])}adj.push(a)}
  var rev=S.map(function(){return[]});adj.forEach(function(a,i){a.forEach(function(j){rev[j].push(i)})});
  var dist=new Array(S.length).fill(Infinity),fr=[];S.forEach(function(st,i){if(goal(st,target)){dist[i]=0;fr.push(i)}});
  while(fr.length){var nf=[];fr.forEach(function(i){rev[i].forEach(function(j){if(dist[j]===Infinity){dist[j]=dist[i]+1;nf.push(j)}})});fr=nf}
  return{idx:idx,S:S,dist:dist,par:dist[0]}}
/* a level row: [caps, sidings, target, par] */
function make(level,rng){level=Math.max(1,Math.min(LEVELS.length,level|0||1));var L=LEVELS[level-1];
  return{level:level,title:'Level '+level,caps:L[0].slice(),start:{s:L[1].slice(),t:''},target:L[2],par:L[3],parExact:true}}
window.V6SY={make:make,moves:moves,analyse:analyse,key:key,goal:goal,HC:HC,levels:function(){return LEVELS}};

var WC=[['#E4572E','#9E3412'],['#2F7FC1','#1C5487'],['#F2C14E','#B38518'],['#3E9C8A','#24685B'],['#8E6CC0','#5E4590'],['#D96C9B','#9C3F67']];
var SYM=['<circle cx="12" cy="12" r="5.5"/>','<path d="M12 5.5l6.5 11.5h-13z"/>','<rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/>','<path d="M12 4.5l7.5 7.5-7.5 7.5-7.5-7.5z"/>','<path d="M12 4.8l2.1 4.6 5 .5-3.8 3.4 1.1 5-4.4-2.6-4.4 2.6 1.1-5-3.8-3.4 5-.5z"/>','<path d="M9 5h6v4h4v6h-4v4H9v-4H5V9h4z"/>'];
var CSS=''
+'.sy{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:var(--font);'
+'--sy-bg:#E7E0CF;--sy-bg2:#DCD3BE;--sy-rail:#6E6556;--sy-tie:#B9A98A;--sy-slot:rgba(80,60,30,.32);--sy-dep:rgba(90,170,110,.22);--sy-eng:#2D2A33;--sy-eng2:#4A4655}'
+':root[data-theme="dark"] .sy{--sy-bg:#24211C;--sy-bg2:#1D1A16;--sy-rail:#A39782;--sy-tie:#4E4536;--sy-slot:rgba(255,235,200,.3);--sy-dep:rgba(90,190,120,.16);--sy-eng:#E9E2D4;--sy-eng2:#B8AF9E}'
+'.sy-b{position:relative;width:100%;box-sizing:border-box;border-radius:20px;background:linear-gradient(170deg,var(--sy-bg),var(--sy-bg2));box-shadow:inset 0 2px 6px rgba(0,0,0,.12);touch-action:manipulation;user-select:none;-webkit-user-select:none;overflow:hidden}'
+'.sy-tr{position:absolute;pointer-events:none}'
+'.sy-tr svg{position:absolute;left:0;top:0;overflow:visible}'
+'.sy-s{all:unset;position:absolute;box-sizing:border-box;cursor:pointer;border-radius:12px;-webkit-tap-highlight-color:transparent;z-index:1}'
+'.sy-s.dep{background:var(--sy-dep)}'
+'.sy-s:focus-visible{outline:3px solid var(--ink);outline-offset:-2px}'
+'.sy-s.zk-mark{outline-offset:-3px}'
+'.sy-s.drop{box-shadow:inset 0 0 0 3px var(--accent,#E8590C)}'
+'.sy-slot{position:absolute;z-index:2;box-sizing:border-box;border:2px dashed var(--sy-slot);border-radius:8px;pointer-events:none}'
+'.sy-slot.ghost{border-style:solid;border-width:2.5px;opacity:.55}'
+'.sy-slot.ghost svg{position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;opacity:.9}'
+'.sy-slot.can{border-color:var(--accent,#E8590C);animation:sycan 1.4s ease-in-out infinite}@keyframes sycan{50%{opacity:.45}}'
+'@media (prefers-reduced-motion:reduce){.sy-slot.can{animation:none}}.zk-rm .sy-slot.can{animation:none}'
+'.sy-slot.full{animation:sypulse .5s ease-in-out 2}@keyframes sypulse{50%{border-color:#E9A23B;transform:scale(1.06)}}'
+'.sy-w{all:unset;position:absolute;left:0;top:0;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent;z-index:3;will-change:transform}'
+'.sy-w .bd{position:absolute;inset:4px 1px 9px;border-radius:7px;box-shadow:inset 0 2px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(0,0,0,.2),0 2px 3px rgba(0,0,0,.25)}'
+'.sy-w .bd svg{position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;fill:#fff;stroke:rgba(0,0,0,.35);stroke-width:1}'
+'.sy-w i{position:absolute;bottom:2px;width:10px;height:10px;border-radius:50%;background:#2B2620;box-shadow:inset 0 0 0 2px #6B6152}.sy-w i.a{left:7px}.sy-w i.b{right:7px}'
+'.sy-w.pick .bd{box-shadow:0 0 0 3px var(--accent,#E8590C),inset 0 2px 0 rgba(255,255,255,.35)}'
+'.sy-w:focus-visible .bd{outline:3px solid var(--ink);outline-offset:2px}'
+'.sy-w.zk-mark{outline:none}.sy-w.zk-mark .bd{animation:zkmark 1s ease-in-out infinite}'
+'.sy-e{position:absolute;left:0;top:0;pointer-events:none;z-index:4;will-change:transform}'
+'.sy-e svg{display:block;width:100%;height:100%}'
+'.sy-msg{min-height:20px;font:650 .8125rem/1.3 var(--font);color:var(--muted,#6F675E);text-align:center;opacity:0;transition:opacity .2s}.sy-msg.on{opacity:1}'
+'.zk-rm .sy-msg{transition:none}';
function symSvg(i){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+SYM[i%SYM.length]+'</svg>'}
var ENG='<svg viewBox="0 0 50 44" aria-hidden="true"><rect x="2" y="12" width="30" height="20" rx="4" fill="var(--sy-eng)"/><rect x="28" y="5" width="18" height="27" rx="3" fill="var(--sy-eng)"/><rect x="32" y="9" width="10" height="8" rx="1.5" fill="#F6E7B0"/><rect x="8" y="5" width="7" height="9" rx="1.5" fill="var(--sy-eng2)"/><path d="M0 30h50" stroke="var(--sy-eng2)" stroke-width="3"/><circle cx="11" cy="37" r="5" fill="#2B2620" stroke="#6B6152" stroke-width="2"/><circle cx="25" cy="37" r="5" fill="#2B2620" stroke="#6B6152" stroke-width="2"/><circle cx="39" cy="37" r="5" fill="#2B2620" stroke="#6B6152" stroke-width="2"/></svg>';

function mount(root,inst,api){ZK.css(CSS,'sy-css');root.textContent='';
  var caps=inst.caps,NS=caps.length,target=inst.target,rm=ZK.rm(api),st={s:inst.start.s.slice(),t:''},hist=[],hints=0,undos=0,fin=false,busy=false,last=null,idle=null,ghost=null,offs=[],msgT=0;
  var A=analyse(inst.start,caps,target);
  var nW=0;st.s.forEach(function(x){nW+=x.length});var ids=[];st.s.join('').split('').forEach(function(c){ids.push(+c)});var maxId=Math.max.apply(null,ids);
  var stage=document.createElement('div');stage.className='sy zk-stage zk-host'+(rm?' zk-rm':'');
  var b=document.createElement('div');b.className='sy-b zk-board';b.setAttribute('role','group');b.setAttribute('aria-label','Shunting yard');
  var trk=document.createElement('div');trk.className='sy-tr';b.appendChild(trk);
  var sb=[],slots=[],wag={},eng=document.createElement('div');eng.className='sy-e';eng.innerHTML=ENG;
  for(var i=0;i<NS;i++)(function(i){var e=document.createElement('button');e.type='button';e.className='sy-s'+(i===0?' dep':'');e.setAttribute('aria-label',(i===0?'Departure line':'Siding '+(i+1))+', holds '+caps[i]);
    e.onclick=function(){tapSiding(i)};sb.push(e);b.appendChild(e);slots.push([])})(i);
  var hsb=document.createElement('div');hsb.className='sy-s';hsb.style.cursor='default';b.appendChild(hsb);var hslots=[];
  for(var w=0;w<=maxId;w++)(function(w){if(ids.indexOf(w)<0)return;var e=document.createElement('button');e.type='button';e.className='sy-w';e.setAttribute('data-zkc','');
    e.innerHTML='<span class="bd" style="background:linear-gradient(170deg,'+WC[w][0]+','+WC[w][1]+')">'+symSvg(w)+'</span><i class="a"></i><i class="b"></i>';e.onclick=function(){tapWagon(w)};wag[w]=e;b.appendChild(e)})(w);
  b.appendChild(eng);
  var msg=document.createElement('div');msg.className='sy-msg';msg.setAttribute('aria-live','polite');
  var pips=ZK.pips(inst.par);
  stage.appendChild(b);stage.appendChild(msg);stage.appendChild(pips.el);root.appendChild(stage);
  /* geometry */
  var P=50,X0=40,RH=62,TOP=12,WW=46,WH=44,ys=[],yH=0,LX=0;
  function layout(){var Wd=b.clientWidth||300,cm=Math.max.apply(null,caps.concat([HC+1]));X0=40;P=Math.max(48,Math.min(58,Math.floor((Wd-X0-14)/cm)));X0=Math.max(30,Math.min(40,Wd-cm*P-14));WW=P-4;
    for(var i=0;i<NS;i++)ys[i]=TOP+i*RH+RH/2;yH=TOP+NS*RH+14+RH/2;LX=X0-16;b.style.height=(yH+RH/2+10)+'px';
    var svg='<svg width="'+Wd+'" height="'+(yH+RH)+'">';
    function rail(x1,y1,x2,y2){var o='';for(var x=x1+6;x<x2;x+=12)o+='<rect x="'+x+'" y="'+(y1-9)+'" width="5" height="18" rx="1.5" fill="var(--sy-tie)"/>';return o+'<path d="M'+x1+' '+(y1-5)+'H'+x2+'M'+x1+' '+(y1+5)+'H'+x2+'" stroke="var(--sy-rail)" stroke-width="2.5"/>'}
    for(var s=0;s<NS;s++){var xe=X0+caps[s]*P;svg+=rail(LX,ys[s],xe+6,ys[s])+'<rect x="'+(xe+4)+'" y="'+(ys[s]-14)+'" width="7" height="28" rx="2" fill="#B5462A"/>';
      sb[s].style.left=(X0-6)+'px';sb[s].style.top=(ys[s]-RH/2+3)+'px';sb[s].style.width=(caps[s]*P+14)+'px';sb[s].style.height=(RH-6)+'px'}
    svg+=rail(LX,yH,X0+(HC+1)*P+8,yH);
    svg+='<path d="M'+(LX)+' '+(ys[0]-5)+'V'+(yH+5)+'M'+(LX+10)+' '+(ys[0]-5)+'V'+(yH+5)+'" stroke="var(--sy-rail)" stroke-width="2.5"/>';
    svg+='</svg>';trk.innerHTML=svg;
    hsb.style.left=(X0-6)+'px';hsb.style.top=(yH-RH/2+3)+'px';hsb.style.width=((HC+1)*P+14)+'px';hsb.style.height=(RH-6)+'px';
    /* slots: dashed per siding place; the departure line shows the target as faint outlines */
    slots.forEach(function(arr){arr.forEach(function(e){e.remove()})});slots=caps.map(function(c,s){var arr=[];for(var k=0;k<c;k++){var e=document.createElement('div');var tg=s===0&&k<target.length?+target.charAt(k):-1;
        e.className='sy-slot'+(tg>=0?' ghost':'');var x=sx(s,k);e.style.left=(x-WW/2)+'px';e.style.top=(ys[s]-WH/2+2)+'px';e.style.width=WW+'px';e.style.height=(WH-9)+'px';
        if(tg>=0){e.style.borderColor=WC[tg][0];e.innerHTML=symSvg(tg).replace('<svg','<svg style="fill:'+WC[tg][0]+'"')}b.insertBefore(e,sb[0]);arr.push(e)}return arr});
    hslots.forEach(function(e){e.remove()});hslots=[];for(var k=0;k<HC;k++){var e2=document.createElement('div');e2.className='sy-slot';var x2=hx(k);e2.style.left=(x2-WW/2)+'px';e2.style.top=(yH-WH/2+2)+'px';e2.style.width=WW+'px';e2.style.height=(WH-9)+'px';b.insertBefore(e2,sb[0]);hslots.push(e2)}
    for(var w in wag){wag[w].style.width=WW+'px';wag[w].style.height=WH+'px'}eng.style.width=(WW+4)+'px';eng.style.height=WH+'px';paint()}
  function sx(s,k){return X0+caps[s]*P-(k+.5)*P}           /* siding s, index k from the buffer */
  function hx(k){return X0+(k+.5)*P}                        /* headshunt element k from the points (0 = nearest) */
  /* path coordinate u for a trip to siding s: 0 at the buffer, along the siding, up/down the points ladder, along the headshunt */
  function U1(s){return caps[s]*P+(X0-LX)}function U2(s){return U1(s)+Math.abs(yH-ys[s])}
  function ptU(s,u){var u1=U1(s),u2=U2(s);if(u<=u1)return{x:X0+caps[s]*P-u,y:ys[s]};if(u<=u2)return{x:LX,y:ys[s]+(yH>ys[s]?1:-1)*(u-u1)};return{x:LX+(u-u2),y:yH}}
  function uSid(k){return(k+.5)*P}function uHead(s,k){return U2(s)+(X0-LX)+(k+.5)*P}
  function put(el,x,y,w){el.style.transform='translate('+(x-(w||WW)/2)+'px,'+(y-WH/2)+'px)'}
  function paint(){st.s.forEach(function(str,s){for(var k=0;k<str.length;k++){var w=+str.charAt(k);put(wag[w],sx(s,k),ys[s]);wag[w].setAttribute('aria-label',label(w)+(s===0?', on the departure line':', in siding '+(s+1))+'. Fetch')}});
    for(var k=0;k<st.t.length;k++){var w2=+st.t.charAt(k);put(wag[w2],hx(k),yH);wag[w2].setAttribute('aria-label',label(w2)+', on the engine')}put(eng,hx(st.t.length)+2,yH,WW+4);cans()}
  /* while the engine pulls wagons, the free slots of every siding that can take them glow: the drop targets */
  function cans(){slots.forEach(function(arr,s2){var ok=!busy&&!fin&&st.t&&st.s[s2].length+st.t.length<=caps[s2];arr.forEach(function(e,k){e.classList.toggle('can',!!ok&&k>=st.s[s2].length&&k<st.s[s2].length+st.t.length)})})}
  function label(w){return ['Red','Blue','Yellow','Green','Purple','Pink'][w]+' wagon'}
  /* animate a consist (list of [el, w]) along a trip path from u0[i] by delta */
  function travel(s,items,delta,ms,done){if(rm||!ms){done();return}var N=12,left=0,fired=false,mine=[];
    function end(){if(fired)return;fired=true;done();mine.forEach(function(a){try{a.cancel()}catch(e){}})}   /* done() paints the end positions first, then only THIS trip's animations are dropped */
    items.forEach(function(it){var kf=[];for(var q=0;q<=N;q++){var p=ptU(s,it.u+delta*q/N),w=it.el===eng?WW+4:WW;kf.push({transform:'translate('+(p.x-w/2)+'px,'+(p.y-WH/2)+'px)'})}
      var a=it.el.animate(kf,{duration:ms,easing:'cubic-bezier(.45,.05,.4,1)',fill:'forwards'});mine.push(a);left++;a.onfinish=function(){if(--left===0)end()}});
    setTimeout(end,ms*15+500)}
  function dur(d){return Math.max(240,Math.min(560,Math.abs(d)/1.6))}
  function say(t){msg.textContent=t;msg.classList.add('on');clearTimeout(msgT);msgT=setTimeout(function(){msg.classList.remove('on')},1800);api.say(t)}
  function pulse(arr){arr.forEach(function(e){if(!e)return;e.classList.remove('full');void e.offsetWidth;e.classList.add('full')})}
  function consist(s){var out=[];for(var k=0;k<st.t.length;k++)out.push({el:wag[+st.t.charAt(k)],u:uHead(s,k)});out.push({el:eng,u:uHead(s,st.t.length)});return out}
  function doMove(m,o){o=o||{};var s=m[1],sid=st.s[s],t=st.t,prev={s:st.s.slice(),t:st.t};busy=true;ZK.unmark(stage);clearPick();
    var items=consist(s),front=(sid.length+.5)*P,d1=front-items[0].u;cans();
    if(!o.undo){hist.push(prev);api.moved();pips.set(hist.length)}
    ZK.sfx('roll',{d:dur(d1)/1000});
    travel(s,items,d1,dur(d1),function(){ZK.sfx('clack');ZK.buzz('tap');
      if(m[0]==='push'){var ns=st.s.slice();ns[s]=sid+t;st={s:ns,t:''};paint2(s,true);var eu=uSid(ns[s].length),d2=uHead(s,0)-eu;
        if(goal(st,target)){finish(s);return}
        travel(s,[{el:eng,u:eu}],d2,dur(d2),function(){paint();settle()})}
      else{var j=m[2],nt=sid.slice(j)+t,ns2=st.s.slice();ns2[s]=sid.slice(0,j);var its=[];for(var k=0;k<nt.length;k++)its.push({el:wag[+nt.charAt(k)],u:uSid(j+k)});its.push({el:eng,u:uSid(j+nt.length)});
        st={s:ns2,t:nt};var d3=uHead(s,0)-its[0].u;ZK.sfx('roll',{d:dur(d3)/1000});travel(s,its,d3,dur(d3),function(){paint();settle()})}})}
  function paint2(s,engAtSiding){paint();if(engAtSiding){put(eng,ptU(s,uSid(st.s[s].length)).x,ys[s],WW+4)}}
  function settle(){busy=false;cans();if(!rm){var w=st.t.length?wag[+st.t.charAt(0)]:eng;ZK.anim(w,[{translate:'0 0'},{translate:'-3px 0'},{translate:'0 0'}],180,'ease-out')}
    last=st.t.length?wag[+st.t.charAt(st.t.length-1)]:eng;checkLost()}
  function checkLost(){var i=A.idx[key(st)],d=i==null?Infinity:A.dist[i];if(d===Infinity)ZK.stuck(stage,true,{text:'The train can’t be made from here'});else ZK.stuck(stage,false)}
  function finish(s){fin=true;busy=false;api.say('Train ready.');last=wag[+target.charAt(target.length-1)];ZK.sfx('cap',{n:5});
    if(!rm){for(var k=0;k<target.length;k++)(function(k){var e=wag[+target.charAt(k)];ZK.anim(e,[{translate:'0 0'},{translate:'0 -6px'},{translate:'0 0'}],260,ZK.SPRING,k*60)})(k);ZK.burst(stage,LX+20,ys[0],{n:8,r:30,colors:['#fff','#ddd','#bbb'],fall:-16})}
    setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:140)}
  function legal(m){return moves(st,caps).some(function(x){return x.m.join()===m.join()})}
  function where(w){for(var s=0;s<NS;s++){var k=st.s[s].indexOf(String(w));if(k>=0)return{s:s,k:k}}var t=st.t.indexOf(String(w));return t>=0?{s:-1,k:t}:null}
  function tapWagon(w){if(fin||busy)return;var p=where(w);if(!p)return;stopGhost();
    if(p.s<0){ZK.wrong(wag[w].firstChild,{silent:true});ZK.sfx('soft');say('Tap a siding to drop these wagons there.');return}
    var m=['take',p.s,p.k];if(legal(m)){doMove(m);return}
    var sid=st.s[p.s],nt=sid.length-p.k+st.t.length;ZK.wrong(wag[w].firstChild);
    if(nt>HC){pulse(hslots);say('The headshunt holds '+HC+' wagons.')}else{pulse(slots[p.s]);say('The wagons you pull must fit in this siding first.')}}
  function tapSiding(s){if(fin||busy)return;stopGhost();if(!st.t){ZK.wrong(sb[s],{silent:true});ZK.sfx('soft');say('Tap a wagon to fetch it first.');return}
    var m=['push',s];if(legal(m)){doMove(m);return}ZK.wrong(sb[s]);pulse(slots[s]);say('That siding holds '+caps[s]+' wagons.')}
  /* press preview: what a tap would move */
  function clearPick(){for(var w in wag)wag[w].classList.remove('pick');sb.forEach(function(e){e.classList.remove('drop')})}
  function L(tg,ty,fn,o){tg.addEventListener(ty,fn,o);offs.push(function(){tg.removeEventListener(ty,fn,o)})}
  function preview(el){clearPick();var wi=null;for(var w in wag)if(wag[w]===el)wi=+w;
    if(wi!=null){var p=where(wi);if(p&&p.s>=0){var sid=st.s[p.s];for(var k=p.k;k<sid.length;k++)wag[+sid.charAt(k)].classList.add('pick')}}
    else{var s=sb.indexOf(el);if(s>=0&&st.t)sb[s].classList.add('drop')}}
  L(b,'pointerdown',function(e){if(fin||busy)return;var el=e.target.closest&&(e.target.closest('.sy-w')||e.target.closest('.sy-s'));if(el){preview(el);ZK.sfx('press')}});
  L(document,'pointerup',function(){setTimeout(clearPick,0)});L(document,'pointercancel',clearPick);
  L(window,'resize',function(){if(!busy)layout()});
  function stopGhost(){if(ghost){ghost.stop();ghost=null}ZK.ghostDone(ID)}
  function bestMove(){var ms=moves(st,caps),i0=A.idx[key(st)],d0=i0==null?Infinity:A.dist[i0];if(d0===Infinity)return null;for(var q=0;q<ms.length;q++){var j=A.idx[key(ms[q].st)];if(j!=null&&A.dist[j]===d0-1)return ms[q].m}return null}
  function target2el(m){return m[0]==='push'?sb[m[1]]:wag[+st.s[m[1]].charAt(m[2])]}
  layout();pips.set(0);
  idle=ZK.idle(stage,25000);
  if(inst.level===1){var m0=bestMove();if(m0){var te=target2el(m0),pick0=null;
    /* two taps: fetch (the group lights), then drop on the departure line (its free slots glow) */
    ghost=ZK.ghost(stage,[{tap:te,down:function(){preview(te)},up:function(){clearPick()},hold:900},
      {tap:sb[0],down:function(){sb[0].classList.add('drop');slots[0].forEach(function(e,k){if(k>=st.s[0].length)e.classList.add('can')})},up:function(){sb[0].classList.remove('drop');cans()},hold:900}],{id:ID,level:1})}}
  return{undo:function(){if(fin||busy||!hist.length)return false;st=hist.pop();undos++;pips.set(hist.length);paint();checkLost();ZK.sfx('undo');return true},
    restart:function(){if(fin||busy)return;st={s:inst.start.s.slice(),t:''};hist=[];paint();pips.set(0);ZK.stuck(stage,false);ZK.unmark(stage);ZK.sfx('undo')},
    hint:function(lv){if(fin||busy)return null;var m=bestMove();ZK.unmark(stage);if(!m)return null;hints++;var i0=A.idx[key(st)],left=A.dist[i0];
      if(lv<=1){var need=null;for(var k=0;k<target.length;k++)if(st.s[0].charAt(k)!==target.charAt(k)){need=+target.charAt(k);break}
        if(need!=null&&wag[need])ZK.mark(wag[need]);return left+' trips can make the train. The marked wagon is the next one the departure line needs; what has to move out of its way first?'}
      ZK.mark(target2el(m));if(lv===2)return m[0]==='push'?'Drop the wagons here.':'Fetch this wagon (and the ones in front of it).';
      doMove(m);return 'Done for you.'},
    destroy:function(){if(idle)idle.stop();if(ghost)ghost.stop();clearTimeout(msgT);offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    next:function(){var m=bestMove();if(!m)return null;return m[0]==='push'?{sel:'.sy-s',i:m[1]}:{sel:'.sy-w',i:[].indexOf.call(b.querySelectorAll('.sy-w'),wag[+st.s[m[1]].charAt(m[2])])}},
    state:function(){return{s:st.s.slice(),t:st.t,moves:hist.length,fin:fin,busy:busy}}}}

ZK.override({id:ID,name:'Shunting Yard',family:'move',theme:'F7',blurb:'Shunt the wagons until the departure line matches.',
  how:'Tap a wagon: the engine fetches it and those in front. Tap a siding to drop them. Match the outlines.',
  areas:['space','control'],levels:30,secs:90,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=inst.par;return{stars:pzStarsByPar(m,p,res.hints),line:'Made up in '+m+' trip'+(m===1?'':'s')+'. The fewest is '+p+'.'}}});
})();
