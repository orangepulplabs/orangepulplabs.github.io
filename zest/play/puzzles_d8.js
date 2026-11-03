/* Zest puzzles, wave 2 file d8: Who Owns the Zebra, Seven Pieces, Blink Stream, Count the Passes.
   Loaded after puzzles_kit.js. Every make(level,rng) is pure (no Math.random, no DOM): the same seed gives the same puzzle on every device.
   Generators and solvers are exposed on PZD8 for tests/pzd8_logic.js. Wording is about the puzzle only: no claims about the brain or health.

   Who Owns the Zebra: five houses in a row; 3, 4 or 5 groups of facts (nationality, colour, pet, drink, hobby). Original clues are drawn from the true facts
     and kept only while the grid still has exactly ONE solution (counted by a solver); then every clue that is not needed is dropped. par = 1 check.
   Seven Pieces: seven tangram-style pieces (two large triangles, medium triangle, two small triangles, square, parallelogram) on a lattice; pieces turn in 90 degree
     steps and may be flipped. Outlines are built from a real arrangement of the seven pieces (so each is fillable); early levels give some pieces already in place.
     par = pieces left for the player to place (each placed once).
   Blink Stream: six rapid letter streams per level; one letter is framed, then a letter X may or may not follow. Answer yes or no. Score = right answers.
   Count the Passes: a short original animation of squares and circles passing a ball; count the passes thrown by circles, and say whether a star crossed. */
var PZD8={};
(function(){
var CSS='.pd{box-sizing:border-box;width:100%;max-width:440px;margin:0 auto;padding:8px 0 16px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink)}'
+'.pd *{box-sizing:border-box}.pd [hidden]{display:none!important}'
+'.pd-info{margin:0;text-align:center;font-size:.9375rem;line-height:1.45;color:var(--muted)}'
+'.pd-msg{margin:0;min-height:1.5em;text-align:center;font-size:.9375rem;font-weight:600;color:var(--ink)}'
+'.pd-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.pd-btn{min-width:48px;min-height:48px;padding:6px 12px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface);color:var(--ink);font:700 1rem var(--font);cursor:pointer;overflow-wrap:anywhere}'
+'.pd-btn.pd-main{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}'
+'.pd-btn:disabled{background:var(--dis-bg);color:var(--dis-ink);border-color:var(--dis-bg);cursor:default}'
+'.pd-btn[aria-pressed=true]{background:var(--tint);outline:3px solid var(--ink);outline-offset:-3px}'
+'.pd-clues{margin:0;padding:0 0 0 1.4em;width:100%;display:flex;flex-direction:column;gap:4px;font-size:.9375rem;line-height:1.4}'
+'.pd-houses{width:100%;display:flex;flex-direction:column;gap:8px}'
+'.pd-house{margin:0;padding:8px;border:1px solid var(--line);border-radius:var(--r1);background:var(--surface)}'
+'.pd-house h3{margin:0 0 6px;font:800 .9375rem var(--font)}'
+'.pd-cells{display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:6px}'
+'.pd-cell{min-height:48px;padding:4px 6px;border:2px solid var(--edge);border-radius:var(--r1);background:var(--ph);color:var(--ink);font:700 .9375rem var(--font);cursor:pointer;overflow-wrap:anywhere}'
+'.pd-cell.pd-full{background:var(--tint);border-style:solid}.pd-cell:not(.pd-full){border-style:dashed;font-weight:500;color:var(--muted)}'
+'.pd-svg{width:100%;height:auto;display:block;touch-action:manipulation}'
+'.pd-tray{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.pd-tp{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:64px;min-height:56px;padding:4px 6px;font-size:.75rem}'
+'.pd-tp svg{width:44px;height:30px}'
+'.pd-stage{width:100%;min-height:150px;display:flex;align-items:center;justify-content:center;border:2px solid var(--edge);border-radius:var(--r1);background:var(--surface)}'
+'.pd-let{display:flex;align-items:center;justify-content:center;width:96px;height:96px;font:800 3.5rem var(--font);border:4px solid transparent;border-radius:12px}'
+'.pd-let.pd-t1{background:var(--ink);color:var(--surface);border-color:var(--accent)}'
+'.pd-list{margin:0;padding:8px 12px;list-style:none;width:100%;font:700 1rem var(--font);text-align:center;letter-spacing:.2em;overflow-wrap:anywhere}'
+'.pd-opts{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.pd-q{margin:0;font:700 .9375rem var(--font);text-align:center}'
+'.phone.rm .pd *,.phone.rm .pd *::before{transition:none!important;animation:none!important}'
+'@media (prefers-reduced-motion:reduce){.pd *,.pd *::before{transition:none!important;animation:none!important}}';
function css(){try{if(typeof document==='undefined'||document.getElementById('pzd8-css'))return;var s=document.createElement('style');s.id='pzd8-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}catch(e){}}
function B(txt,fn,cls,at){at=at||{};at.class='pd-btn '+(cls||'');return pzBtn(txt,fn,at)}
function shell(root,cls){css();root.textContent='';var w=pzEl('div',{class:'pd '+cls});root.appendChild(w);return w}
function plural(n,w){return n+' '+w+(n===1?'':'s')}
function hintsLine(h){return h?plural(h,'hint'):'no hints'}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function NS(tag,at){var e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(var k in at)e.setAttribute(k,at[k]);return e}
/* every mount is wrapped: done() fires 350 ms after the last move; an Undo / Hint / Restart row is drawn unless api.toolbar===false or inst.toolbar===false.
   A puzzle whose def says undo:false shows 'Try again' in place of Restart and no Undo. */
function wrapMount(m,noUndo){return function(root,inst,api){var lv=0,tm=null,a2={},k;for(k in api)a2[k]=api[k];
  a2.moved=function(){lv=0;api.moved()};a2.done=function(r){clearTimeout(tm);tm=setTimeout(function(){api.done(r)},350)};
  var c=m(root,inst,a2);
  if(typeof api.say==='function')[].forEach.call(root.querySelectorAll('[role=status]'),function(e){e.setAttribute('aria-live','off')});
  if(!(api.toolbar===false||inst.toolbar===false)){var bar=pzEl('div',{class:'pd-row pd-bar'}),w=root.firstChild;
    if(!noUndo)bar.appendChild(B('Undo',function(){lv=0;c.undo()},'',{'aria-label':'Undo'}));
    bar.appendChild(B('Hint',function(){lv=Math.min(3,lv+1);c.hint(lv)},'',{'aria-label':'Hint'}));
    bar.appendChild(B(noUndo?'Try again':'Restart',function(){lv=0;c.restart()},'',{'aria-label':noUndo?'Try again':'Restart this level'}));
    if(w)w.appendChild(bar)}
  return{undo:c.undo,hint:c.hint,restart:c.restart,destroy:function(){clearTimeout(tm);c.destroy()}}}}

/* ================= 1. Who Owns the Zebra ================= */
var ZC=[
 {id:'nat',name:'Nationality',pool:['Brazilian','Norwegian','Kenyan','Indian','Japanese','Peruvian','Canadian'],ph:function(v){return 'the '+v+'’s house'}},
 {id:'col',name:'Colour',pool:['red','blue','green','yellow','white','orange','purple'],ph:function(v){return 'the '+v+' house'}},
 {id:'pet',name:'Pet',pool:['zebra','cat','parrot','rabbit','tortoise','goat','owl'],ph:function(v){return 'the house with the '+v}},
 {id:'drk',name:'Drink',pool:['tea','coffee','milk','cocoa','cider','juice','water'],ph:function(v){return 'the house where '+v+' is drunk'}},
 {id:'hob',name:'Hobby',pool:['chess player','gardener','painter','potter','knitter','baker','singer'],ph:function(v){return 'the '+v+'’s house'}}];
var POSTXT={0:'the first house on the left',2:'the middle house',4:'the last house on the right'};
/* count solutions (up to limit) by constraint propagation: every (group, value) has a set of possible houses (5 bits); clues and the one-house-per-value rule prune
   the sets until nothing changes, then the search splits the smallest set. */
var PC5=[0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4,1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5];
function lowBit(m){var i=0;while(!(m>>i&1))i++;return i}function highBit(m){var i=4;while(!(m>>i&1))i--;return i}
function zbCount(nc,clues,limit){var n=0,i,dom0=[];for(i=0;i<nc;i++)dom0.push([31,31,31,31,31]);
  function prop(d){var ch=true,it=0;
    while(ch&&it++<200){ch=false;
      for(var ci=0;ci<clues.length;ci++){var c=clues[ci],A=c.a,Bq=c.b,a=d[A[0]][A[1]],b=Bq?d[Bq[0]][Bq[1]]:0,na=a,nb=b,m;
        switch(c.t){case'pos':na=a&(1<<c.h);break;case'same':na=nb=a&b;break;
          case'next':na=a&(((b<<1)|(b>>1))&31);nb=b&(((na<<1)|(na>>1))&31);break;
          case'left':na=a&(b>>1);nb=b&((na<<1)&31);break;
          case'before':if(!b||!a)return false;na=a&((1<<highBit(b))-1);nb=b&(~((1<<(lowBit(na||a)+1))-1)&31);break;
          default:if(PC5[a]===1)nb=b&~a;if(PC5[b]===1)na=a&~b;}
        if(na!==a){d[A[0]][A[1]]=na;ch=true}if(Bq&&nb!==b){d[Bq[0]][Bq[1]]=nb;ch=true}
        if(!d[A[0]][A[1]]||(Bq&&!d[Bq[0]][Bq[1]]))return false}
      for(var g=0;g<nc;g++){var row=d[g];
        for(var k=0;k<5;k++){if(!row[k])return false;if(PC5[row[k]]===1)for(var k2=0;k2<5;k2++)if(k2!==k&&(row[k2]&row[k])){row[k2]&=~row[k];ch=true;if(!row[k2])return false}}
        for(var h=0;h<5;h++){var cnt=0,who=-1;for(k=0;k<5;k++)if(row[k]>>h&1){cnt++;who=k}if(cnt===0)return false;if(cnt===1&&row[who]!==(1<<h)){row[who]=1<<h;ch=true}}}}
    return true}
  function rec(d){if(n>=limit)return;if(!prop(d))return;var bg=-1,bk=-1,bs=9;
    for(var g=0;g<nc;g++)for(var k=0;k<5;k++){var s=PC5[d[g][k]];if(s>1&&s<bs){bs=s;bg=g;bk=k}}
    if(bg<0){n++;return}
    for(var h=0;h<5&&n<limit;h++)if(d[bg][bk]>>h&1){var d2=d.map(function(r){return r.slice()});d2[bg][bk]=1<<h;rec(d2)}}
  rec(dom0);return n}
function zbTrueClues(nc,sol){var out=[],a,b,kb,ka,ha,hb;
  for(a=0;a<nc;a++)for(ka=0;ka<5;ka++){ha=sol[a][ka];
    if(ha===0||ha===2||ha===4)out.push({t:'pos',a:[a,ka],b:null,h:ha});
    for(b=0;b<nc;b++){if(b===a)continue;for(kb=0;kb<5;kb++){hb=sol[b][kb];
      if(ha===hb&&a<b)out.push({t:'same',a:[a,ka],b:[b,kb]});
      if(ha!==hb&&a<b)out.push({t:'not',a:[a,ka],b:[b,kb]});
      if(Math.abs(ha-hb)===1&&a<b)out.push({t:'next',a:[a,ka],b:[b,kb]});
      if(ha+1===hb)out.push({t:'left',a:[a,ka],b:[b,kb]});
      if(ha<hb)out.push({t:'before',a:[a,ka],b:[b,kb]})}}}
  return out}
function zbMake(level,rng){var nc=level<=8?3:level<=18?4:5,vals=[],sol=[],c,i;
  for(c=0;c<nc;c++){var idx=pzShuffle([0,1,2,3,4,5,6],rng).slice(0,5);if(c===2&&idx.indexOf(0)<0)idx[pzInt(rng,5)]=0;vals.push(idx);sol.push(pzShuffle([0,1,2,3,4],rng))}
  var W=level<7?{same:3,next:2,left:2,pos:2,before:0,not:0}:level<15?{same:2,next:2,left:1.5,pos:1,before:2,not:0}:{same:1,next:1.5,left:.7,pos:.5,before:2,not:3};
  var pool=zbTrueClues(nc,sol).filter(function(x){return W[x.t]>0}).map(function(x){return{k:Math.pow(Math.max(rng(),1e-9),1/W[x.t]),c:x}});
  pool.sort(function(a,b){return b.k-a.k});
  var clues=[],start=nc*2+2;
  for(i=0;i<pool.length;i++){clues.push(pool[i].c);if(clues.length>=start&&zbCount(nc,clues,2)===1)break}
  var order=pzShuffle(clues.map(function(_,j){return j}),rng),keep=clues.slice();
  order.forEach(function(j){var c0=clues[j],t=keep.filter(function(x){return x!==c0});if(zbCount(nc,t,2)===1)keep=t});
  keep=pzShuffle(keep,rng);
  return{level:level,title:'Level '+level,cats:[0,1,2,3,4].slice(0,nc),vals:vals,sol:sol,clues:keep,par:1}}
function zbName(inst,ci,k){return ZC[inst.cats[ci]].pool[inst.vals[ci][k]]}
function zbPhrase(inst,r){return ZC[inst.cats[r[0]]].ph(zbName(inst,r[0],r[1]))}
function zbClueText(inst,c){var a=cap(zbPhrase(inst,c.a));
  switch(c.t){case'pos':return a+' is '+POSTXT[c.h]+'.';case'same':return a+' is '+zbPhrase(inst,c.b)+'.';case'next':return a+' is right next to '+zbPhrase(inst,c.b)+'.';
    case'left':return a+' is immediately to the left of '+zbPhrase(inst,c.b)+'.';case'before':return a+' is somewhere to the left of '+zbPhrase(inst,c.b)+'.';default:return a+' is not '+zbPhrase(inst,c.b)+'.'}}
PZD8.zb={make:zbMake,count:zbCount,clueText:zbClueText,name:zbName,cats:ZC};
function mountZebra(root,inst,api){
  var w=shell(root,'pd-zb'),nc=inst.cats.length,grid,hist,hints=0,undos=0,checks=0,fin=false,cells=[],h,ci,
    inv=inst.sol.map(function(s){var r=[];s.forEach(function(hh,k){r[hh]=k});return r}),zebraK=-1;
  for(var k=0;k<5;k++)if(zbName(inst,2,k)==='zebra')zebraK=k;
  var info=pzEl('p',{class:'pd-info',text:'Five houses stand in a row, numbered 1 to 5 from the left. Use the clues to find what goes in every house, then press Check. Who owns the zebra? Tap a box to step through the choices.'}),
    clueList=pzEl('ol',{class:'pd-clues','aria-label':'Clues'}),board=pzEl('div',{class:'pd-houses'}),msg=pzEl('p',{class:'pd-msg',role:'status'}),ctl=pzEl('div',{class:'pd-row'}),chk;
  function say(t){msg.textContent=t;api.say(t)}
  function reset(){grid=[];for(var i=0;i<5;i++){var r=[];for(var j=0;j<nc;j++)r.push(-1);grid.push(r)}hist=[];fin=false;msg.textContent=''}reset();
  function used(c,except){var u={};for(var i=0;i<5;i++)if(i!==except&&grid[i][c]>=0)u[grid[i][c]]=1;return u}
  function nextVal(hh,c){var u=used(c,hh),cur=grid[hh][c];for(var k=cur+1;k<5;k++)if(!u[k])return k;return-1}
  function paint(){for(var i=0;i<5;i++)for(var c=0;c<nc;c++){var v=grid[i][c],b=cells[i][c],cn=ZC[inst.cats[c]].name;
      b.textContent=v<0?cn:cap(zbName(inst,c,v));b.className='pd-cell'+(v<0?'':' pd-full');b.setAttribute('aria-label','House '+(i+1)+', '+cn+': '+(v<0?'empty':zbName(inst,c,v)))}
    chk.disabled=fin}
  function push(){hist.push(JSON.stringify(grid))}
  function press(i,c){if(fin)return;push();grid[i][c]=nextVal(i,c);msg.textContent='';paint()}
  for(h=0;h<5;h++){cells.push([]);var sec=pzEl('section',{class:'pd-house','aria-label':'House '+(h+1)}),cg=pzEl('div',{class:'pd-cells'});sec.appendChild(pzEl('h3',{text:'House '+(h+1)+(h===0?' (left end)':h===4?' (right end)':'')}));
    for(ci=0;ci<nc;ci++)(function(hh,c){var b=pzEl('button',{type:'button',class:'pd-cell'});b.onclick=function(){press(hh,c)};cells[hh].push(b);cg.appendChild(b)})(h,ci);
    sec.appendChild(cg);board.appendChild(sec)}
  inst.clues.forEach(function(c){clueList.appendChild(pzEl('li',{text:zbClueText(inst,c)}))});
  chk=B('Check my grid',function(){check()},'pd-main');ctl.appendChild(chk);
  function wrong(){var e=0,bd=0;for(var i=0;i<5;i++)for(var c=0;c<nc;c++){if(grid[i][c]<0)e++;else if(inst.sol[c][grid[i][c]]!==i)bd++}return{empty:e,bad:bd}}
  function check(){if(fin)return;var r=wrong();if(r.empty){say('Fill every box first: '+r.empty+' still empty.');return}
    checks++;api.moved();
    if(!r.bad){fin=true;paint();var zh=inst.sol[2][zebraK],nk=inv[0][zh];say('Solved. The '+zbName(inst,0,nk)+' owns the zebra.');
      api.done({solved:true,moves:checks,hints:hints,undos:undos,extra:{par:1,cells:5*nc,zebraOwner:zbName(inst,0,nk)}});return}
    say(r.bad+' of '+(5*nc)+' boxes are not right yet. Read the clues again; you can change any box.')}
  w.appendChild(info);w.appendChild(pzEl('h3',{class:'pd-q',text:'Clues'}));w.appendChild(clueList);w.appendChild(board);w.appendChild(ctl);w.appendChild(msg);paint();
  function firstWrong(){for(var i=0;i<5;i++)for(var c=0;c<nc;c++)if(grid[i][c]!==inv[c][i])return[i,c];return null}
  return{undo:function(){if(fin||!hist.length)return false;grid=JSON.parse(hist.pop());undos++;paint();say('Undone.');return true},
    restart:function(){reset();paint();say('Restarted. The clues are the same.')},
    hint:function(lv){if(fin)return null;var f=firstWrong();if(!f)return null;hints++;var i=f[0],c=f[1],kk=inv[c][i],cn=ZC[inst.cats[c]].name,s,idx=-1;
      if(lv<=1)s='Look at house '+(i+1)+' and its '+cn.toLowerCase()+'.';
      else if(lv===2){inst.clues.forEach(function(cl,j){if(idx<0&&((cl.a[0]===c&&cl.a[1]===kk)||(cl.b&&cl.b[0]===c&&cl.b[1]===kk)))idx=j});
        s=idx>=0?'Clue '+(idx+1)+' mentions '+zbName(inst,c,kk)+'.':'No single clue names '+zbName(inst,c,kk)+'; it follows from the others.'}
      else{push();grid[i][c]=kk;paint();s='House '+(i+1)+' has '+zbName(inst,c,kk)+' ('+cn.toLowerCase()+').'}
      say(s);return s},
    destroy:function(){root.textContent=''}}}
registerPuzzle({id:'who-owns-the-zebra',name:'Who Owns the Zebra',family:'grid',theme:'F5',blurb:'Five houses, a list of clues, and one zebra to place.',
  how:'Read the clues and fill in what each of the five houses has. Tap a box to step through the choices, then press Check. Early levels have fewer kinds of facts to place.',
  areas:['control','flex'],levels:30,secs:240,make:zbMake,mount:wrapMount(mountZebra),
  stars:function(res,inst){var m=res.moves,h=res.hints||0;return{stars:pzStarsByPar(m,1,h),line:'You solved it with '+plural(m,'check')+' and '+hintsLine(h)+'. One check is the best.'}}});

/* ================= 2. Seven Pieces ================= */
var TW=100,TPD={L:[[0,0],[4,0],[2,2]],M:[[0,0],[2,0],[0,2]],S:[[0,0],[2,0],[1,1]],Q:[[1,0],[2,1],[1,2],[0,1]],P:[[0,0],[2,0],[3,1],[1,1]]};
var TP=[{t:'L',n:'Large triangle A',s:'Large A'},{t:'L',n:'Large triangle B',s:'Large B'},{t:'M',n:'Medium triangle',s:'Medium'},{t:'S',n:'Small triangle A',s:'Small A'},{t:'S',n:'Small triangle B',s:'Small B'},{t:'Q',n:'Square',s:'Square'},{t:'P',n:'Parallelogram',s:'Parallel.'}];
var TOP={L:.5,M:.4,S:.3,Q:.6,P:.7};
var QOFF=[[0,-1/3],[1/3,0],[0,1/3],[-1/3,0]],QDIJ=[[0,-1],[1,0],[0,1],[-1,0]];
function pip(poly,px,py){var c=false;for(var i=0,j=poly.length-1;i<poly.length;j=i++){var a=poly[i],b=poly[j];if((a[1]>py)!==(b[1]>py)&&px<(b[0]-a[0])*(py-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function xf(v,o){var x=v[0],y=v[1];if(o>=4)x=-x;for(var r=o%4;r>0;r--){var t=x;x=-y;y=t}return[x,y]}
var SHC={};
function shape(t,o){var key=t+o;if(SHC[key])return SHC[key];var v=TPD[t].map(function(p){return xf(p,o)}),mx=1e9,my=1e9,Mx=-1e9,My=-1e9;
  v.forEach(function(p){mx=Math.min(mx,p[0]);my=Math.min(my,p[1]);Mx=Math.max(Mx,p[0]);My=Math.max(My,p[1])});
  v=v.map(function(p){return[p[0]-mx,p[1]-my]});var q=[],i,j,k;
  for(j=0;j<My-my;j++)for(i=0;i<Mx-mx;i++)for(k=0;k<4;k++)if(pip(v,i+.5+QOFF[k][0],j+.5+QOFF[k][1]))q.push((j*TW+i)*4+k);
  q.sort(function(a,b){return a-b});return SHC[key]={v:v,q:q,sig:q.join(','),w:Mx-mx,h:My-my}}
var UNI={};
function uniq(t){if(UNI[t])return UNI[t];var seen={},out=[];for(var o=0;o<8;o++){var s=shape(t,o);if(!seen[s.sig]){seen[s.sig]=1;out.push(o)}}return UNI[t]=out}
function nbrs(key){var q=((key%4)+4)%4,cell=(key-q)/4,j=Math.floor(cell/TW),i=cell-j*TW;return[cell*4+(q+1)%4,cell*4+(q+3)%4,((j+QDIJ[q][1])*TW+(i+QDIJ[q][0]))*4+(q+2)%4]}
function dec(m){var y=Math.round(m/TW);return{x:m-y*TW,y:y}}
function tgQuarters(pl,idx){var s=shape(TP[idx].t,pl.o),d=pl.y*TW+pl.x;return s.q.map(function(k){return k+d*4})}
function tgSil(sol){var m={};sol.forEach(function(p,i){tgQuarters(p,i).forEach(function(k){m[k]=1})});return m}
/* every way to put piece type t so that it covers one of the anchor keys, stays inside allowed (or anywhere when null) and avoids occ */
function tgPlacements(t,anchors,allowed,occ){var out=[],seen={};
  uniq(t).forEach(function(o){var sh=shape(t,o);anchors.forEach(function(kk){for(var m=0;m<sh.q.length;m++){if(((sh.q[m]-kk)%4+4)%4!==0)continue;var delta=(kk-sh.q[m])/4,id=o+':'+delta;if(seen[id])continue;seen[id]=1;
      var ok=true;for(var z=0;z<sh.q.length;z++){var kq=sh.q[z]+delta*4;if(occ[kq]||(allowed&&!allowed[kq])){ok=false;break}}
      if(ok){var d=dec(delta);out.push({o:o,x:d.x,y:d.y})}}})});
  return out}
/* exact cover of the outline: always fill the lowest empty quarter; the piece that covers it must have that quarter as its own lowest */
function tgSolve(silArr,occ0,used0,maxNodes){var sil={};silArr.forEach(function(k){sil[k]=1});var sorted=silArr.slice().sort(function(a,b){return a-b}),occ={},used=used0.slice(),placed=[],nodes=0,k;
  for(k in occ0)occ[k]=1;
  function rec(){if(++nodes>maxNodes)return false;var p=0;while(p<sorted.length&&occ[sorted[p]])p++;if(p>=sorted.length)return true;var target=sorted[p];
    for(var i=0;i<7;i++){if(used[i])continue;
      if(i>0&&TP[i].t===TP[i-1].t&&!used[i-1])continue;
      var ts=uniq(TP[i].t);
      for(var oi=0;oi<ts.length;oi++){var sh=shape(TP[i].t,ts[oi]);if(((target-sh.q[0])%4+4)%4!==0)continue;var delta=(target-sh.q[0])/4,ok=true;
        for(var z=0;z<sh.q.length;z++){var kq=sh.q[z]+delta*4;if(occ[kq]||!sil[kq]){ok=false;break}}
        if(!ok)continue;var d=dec(delta);sh.q.forEach(function(kq){occ[kq+delta*4]=1});used[i]=true;placed.push({i:i,o:ts[oi],x:d.x,y:d.y});
        if(rec())return true;placed.pop();used[i]=false;sh.q.forEach(function(kq){delete occ[kq+delta*4]})}}
    return false}
  return rec()?placed:null}
function tgAssemble(rng,compact){var order=pzShuffle([0,1,2,3,4,5,6],rng),sol=[],U={};
  for(var n=0;n<7;n++){var idx=order[n],t=TP[idx].t,best=null,cands;
    if(n===0){sol[idx]={o:pzInt(rng,8),x:10,y:10};tgQuarters(sol[idx],idx).forEach(function(k){U[k]=1});continue}
    var anchors={};Object.keys(U).forEach(function(k){nbrs(+k).forEach(function(nk){if(!U[nk])anchors[nk]=1})});
    cands=tgPlacements(t,Object.keys(anchors).map(Number),null,U);if(!cands.length)return null;
    if(compact){var bs=-1,list=[];cands.forEach(function(c){var sc=0;tgQuarters(c,idx).forEach(function(k){nbrs(k).forEach(function(nk){if(U[nk])sc++})});if(sc>bs){bs=sc;list=[c]}else if(sc===bs)list.push(c)});best=list[pzInt(rng,list.length)]}
    else best=cands[pzInt(rng,cands.length)];
    sol[idx]=best;tgQuarters(best,idx).forEach(function(k){U[k]=1})}
  var mx=1e9,my=1e9;sol.forEach(function(p){mx=Math.min(mx,p.x);my=Math.min(my,p.y)});return sol.map(function(p){return{o:p.o,x:p.x-mx,y:p.y-my}})}
function tgMake(level,rng){var fc=[5,4,3,2,1,0][Math.min(5,Math.floor((level-1)/5))],sol=null,tries=0;
  if(level===30){var sq=[];for(var j=0;j<4;j++)for(var i=0;i<4;i++)for(var k=0;k<4;k++)sq.push((j*TW+i)*4+k);var r=tgSolve(sq,{},[false,false,false,false,false,false,false],400000);
    sol=[];r.forEach(function(p){sol[p.i]={o:p.o,x:p.x,y:p.y}})}
  while(!sol&&tries++<40)sol=tgAssemble(rng,level>=12);
  var fixed=pzShuffle([0,1,2,3,4,5,6],rng).slice(0,fc).sort(function(a,b){return a-b});
  return{level:level,title:'Level '+level,sol:sol,fixed:fixed,par:7-fc}}
PZD8.tg={make:tgMake,shape:shape,pieces:TP,sil:tgSil,quarters:tgQuarters,solve:tgSolve,base:TPD,xf:xf};
function tgCentroid(v){var x=0,y=0;v.forEach(function(p){x+=p[0];y+=p[1]});return[x/v.length,y/v.length]}
function tgQuad(key){var q=key%4,cell=(key-q)/4,j=Math.floor(cell/TW),i=cell-j*TW,c=[i+.5,j+.5];
  return[[[i,j],[i+1,j],c],[[i+1,j],[i+1,j+1],c],[[i+1,j+1],[i,j+1],c],[[i,j+1],[i,j],c]][q]}
function mountTangram(root,inst,api){
  var w=shell(root,'pd-tg'),SIL=tgSil(inst.sol),silArr=Object.keys(SIL).map(Number),placed=[null,null,null,null,null,null,null],ori=[0,0,0,0,0,0,0],sel=0,ci=0,cands=[],hist=[],hints=0,undos=0,moves=0,fin=false,fixedSet={},
    msg=pzEl('p',{class:'pd-msg',role:'status'}),info=pzEl('p',{class:'pd-info',text:'Fill the outline with all seven pieces and no overlaps. Pick a piece, turn or flip it, move it to a spot, then press Place piece. You can also tap the outline to move the piece. Lighter pieces are already in place.'}),
    tray=pzEl('div',{class:'pd-tray',role:'group','aria-label':'Pieces'}),ctl=pzEl('div',{class:'pd-row'}),trayBtns=[],i,
    minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;
  inst.sol.forEach(function(p,ix){var s=shape(TP[ix].t,p.o);minx=Math.min(minx,p.x);miny=Math.min(miny,p.y);maxx=Math.max(maxx,p.x+s.w);maxy=Math.max(maxy,p.y+s.h)});
  var svg=NS('svg',{viewBox:(minx-.6)+' '+(miny-.6)+' '+(maxx-minx+1.2)+' '+(maxy-miny+1.2),class:'pd-svg',role:'img','aria-label':'Outline to fill'}),gSil=NS('g'),gPcs=NS('g'),gGhost=NS('g');
  svg.appendChild(gSil);svg.appendChild(gPcs);svg.appendChild(gGhost);
  silArr.forEach(function(k){gSil.appendChild(NS('polygon',{points:tgQuad(k).map(function(p){return p.join(',')}).join(' '),fill:'var(--ph)',stroke:'var(--ph)','stroke-width':'.04'}))});
  var dd='';silArr.forEach(function(k){var tri=tgQuad(k),nb=nbrs(k),sides=[[tri[0],tri[1],nb[2]],[tri[1],tri[2],nb[0]],[tri[2],tri[0],nb[1]]];
    sides.forEach(function(s){if(!SIL[s[2]])dd+='M'+s[0].join(' ')+'L'+s[1].join(' ')})});
  gSil.appendChild(NS('path',{d:dd,fill:'none',stroke:'var(--ink)','stroke-width':'.09','stroke-linecap':'round'}));
  inst.fixed.forEach(function(ix){fixedSet[ix]=1;placed[ix]=inst.sol[ix]});
  function occ(){var m={};placed.forEach(function(p,ix){if(p)tgQuarters(p,ix).forEach(function(k){m[k]=1})});return m}
  function say(t){msg.textContent=t;api.say(t)}
  function count(){return placed.filter(Boolean).length}
  function nextFree(from){for(var s=0;s<7;s++){var ix=(from+s)%7;if(!placed[ix])return ix}return-1}
  function polyOf(ix,p){return shape(TP[ix].t,p.o).v.map(function(v){return[v[0]+p.x,v[1]+p.y]})}
  function drawPiece(ix,p,cls){var v=polyOf(ix,p),c=tgCentroid(v),g=NS('g'),pts=v.map(function(a){return a.join(',')}).join(' ');
    g.appendChild(NS('polygon',{points:pts,fill:cls==='ghost'?'none':'var(--accent)','fill-opacity':cls==='fixed'?'.18':String(TOP[TP[ix].t]),stroke:'var(--ink)','stroke-width':cls==='ghost'?'.11':cls==='fixed'?'.12':'.07','stroke-dasharray':cls==='ghost'?'.25 .15':'none','stroke-linejoin':'round'}));
    if(cls!=='ghost'){var t=NS('text',{x:c[0],y:c[1]+.17,'text-anchor':'middle','font-size':'.55',fill:'var(--ink)','font-weight':'800','font-family':'sans-serif'});t.textContent=TP[ix].t;g.appendChild(t)}
    return g}
  function sameShape(t,o1,o2){return shape(t,o1).sig===shape(t,o2).sig}
  function recand(){cands=[];if(sel<0||placed[sel])return;var o=occ(),anchors=silArr.filter(function(k){return!o[k]});cands=tgPlacements(TP[sel].t,anchors,SIL,o);
    cands=cands.filter(function(c){return sameShape(TP[sel].t,c.o,ori[sel])});
    cands.sort(function(a,b){return a.y-b.y||a.x-b.x});ci=Math.min(ci,Math.max(0,cands.length-1))}
  function paint(){
    while(gPcs.firstChild)gPcs.removeChild(gPcs.firstChild);while(gGhost.firstChild)gGhost.removeChild(gGhost.firstChild);
    placed.forEach(function(p,ix){if(p)gPcs.appendChild(drawPiece(ix,p,fixedSet[ix]?'fixed':'pc'))});
    recand();if(cands.length&&sel>=0)gGhost.appendChild(drawPiece(sel,cands[ci],'ghost'));
    svg.setAttribute('aria-label','Outline to fill: '+count()+' of 7 pieces placed');
    trayBtns.forEach(function(b,ix){var st=fixedSet[ix]?'given, already in place':placed[ix]?'placed, tap to pick it up':ix===sel?'selected':'not placed';
      b.setAttribute('aria-label',TP[ix].n+', '+st);b.setAttribute('aria-pressed',ix===sel&&!placed[ix]?'true':'false');b.disabled=!!fixedSet[ix]||fin;b.style.opacity=placed[ix]?'.55':'1'});
    pl.disabled=fin||!cands.length;nx.disabled=pv.disabled=cands.length<2;rot.disabled=flp.disabled=fin||sel<0||!!placed[sel]}
  function swatch(ix){var s=shape(TP[ix].t,0),sv=NS('svg',{viewBox:'-.2 -.2 '+(s.w+.4)+' '+(s.h+.4),'aria-hidden':'true'});
    sv.appendChild(NS('polygon',{points:s.v.map(function(a){return a.join(',')}).join(' '),fill:'var(--accent)','fill-opacity':String(TOP[TP[ix].t]),stroke:'var(--ink)','stroke-width':'.12'}));return sv}
  function snap(){hist.push(JSON.stringify({p:placed,o:ori,s:sel}))}
  function select(ix){if(fin||fixedSet[ix])return;
    if(placed[ix]){snap();ori[ix]=placed[ix].o;placed[ix]=null;say(TP[ix].n+' picked up. Move it to a new spot.')}else say(TP[ix].n+' selected.');
    sel=ix;ci=0;paint()}
  for(i=0;i<7;i++)(function(ix){var b=pzEl('button',{type:'button',class:'pd-btn pd-tp','aria-label':TP[ix].n},[swatch(ix),pzEl('span',{text:TP[ix].s})]);b.onclick=function(){select(ix)};trayBtns.push(b);tray.appendChild(b)})(i);
  function spin(){if(sel<0||placed[sel]||fin)return;var t=TP[sel].t,cur=shape(t,ori[sel]).sig,o=ori[sel],f=o>=4?4:0,r=o%4;
    for(var s=1;s<=4;s++){var n2=f+(r+s)%4;if(shape(t,n2).sig!==cur){ori[sel]=n2;ci=0;paint();say('Turned.');return}}say('This piece looks the same when turned.')}
  function flip(){if(sel<0||placed[sel]||fin)return;var t=TP[sel].t,o=ori[sel],n2=(o>=4?o-4:o+4);if(shape(t,n2).sig===shape(t,o).sig){say('This piece looks the same flipped.');return}ori[sel]=n2;ci=0;paint();say('Flipped.')}
  function place(){if(fin||!cands.length)return;snap();var c=cands[ci],nm=TP[sel].n;placed[sel]={o:c.o,x:c.x,y:c.y};ori[sel]=c.o;moves++;api.moved();
    if(count()===7){fin=true;ci=0;sel=-1;paint();say('All seven pieces fit. Well done.');api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par}});return}
    say(nm+' placed. '+count()+' of 7 pieces are in.');sel=nextFree(sel+1);ci=0;paint()}
  var rot=B('Rotate',spin,'',{'aria-label':'Rotate piece'}),flp=B('Flip',flip,'',{'aria-label':'Flip piece'}),
    pv=B('Previous spot',function(){if(cands.length){ci=(ci+cands.length-1)%cands.length;paint()}}),nx=B('Next spot',function(){if(cands.length){ci=(ci+1)%cands.length;paint()}}),
    pl=B('Place piece',place,'pd-main');
  ctl.appendChild(rot);ctl.appendChild(flp);ctl.appendChild(pv);ctl.appendChild(nx);ctl.appendChild(pl);
  svg.addEventListener('click',function(ev){if(fin||!cands.length)return;var r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal,
      x=vb.x+(ev.clientX-r.left)/r.width*vb.width,y=vb.y+(ev.clientY-r.top)/r.height*vb.height,best=0,bd=1e9;
    cands.forEach(function(c,k){var cc=tgCentroid(polyOf(sel,c)),d2=(cc[0]-x)*(cc[0]-x)+(cc[1]-y)*(cc[1]-y);if(d2<bd){bd=d2;best=k}});ci=best;paint()});
  function onkey(ev){if(fin||ev.ctrlKey||ev.metaKey||ev.altKey||ev.target.tagName==='BUTTON')return;var k=ev.key;
    if(k==='r'||k==='R')spin();else if(k==='f'||k==='F')flip();else if(k==='ArrowRight'||k==='ArrowDown'){if(cands.length){ci=(ci+1)%cands.length;paint()}}else if(k==='ArrowLeft'||k==='ArrowUp'){if(cands.length){ci=(ci+cands.length-1)%cands.length;paint()}}else if(k==='Enter')place()}
  w.addEventListener('keydown',onkey);
  w.appendChild(info);w.appendChild(svg);w.appendChild(tray);w.appendChild(ctl);w.appendChild(msg);
  sel=nextFree(0);paint();
  function restore(s){var o=JSON.parse(s);placed=o.p;ori=o.o;sel=o.s;ci=0}
  return{undo:function(){if(fin||!hist.length)return false;restore(hist.pop());undos++;paint();say('Undone.');return true},
    restart:function(){placed=[null,null,null,null,null,null,null];inst.fixed.forEach(function(ix){placed[ix]=inst.sol[ix]});ori=[0,0,0,0,0,0,0];hist=[];fin=false;sel=nextFree(0);ci=0;paint();say('Restarted.')},
    hint:function(lv){if(fin)return null;var r=tgSolve(silArr,occ(),placed.map(Boolean),150000),s;
      if(!r){var last=-1;for(var z=0;z<7;z++)if(placed[z]&&!fixedSet[z])last=z;
        if(last<0)return null;hints++;
        if(lv<=1)s='The pieces in place leave a gap that cannot be filled.';else if(lv===2)s='Try picking up the '+TP[last].n.toLowerCase()+'.';
        else{snap();placed[last]=null;sel=last;ci=0;paint();s=TP[last].n+' picked up.'}
        say(s);return s}
      if(!r.length)return null;hints++;var p=r[0],cx=0,cy=0,v=polyOf(p.i,p);v.forEach(function(a){cx+=a[0];cy+=a[1]});cx/=v.length;cy/=v.length;
      var wd=maxx-minx,ht=maxy-miny,vy=cy<miny+ht/3?'top':cy>miny+2*ht/3?'bottom':'',vx=cx<minx+wd/3?'left':cx>minx+2*wd/3?'right':'',where=(vy+' '+vx).trim()||'middle';
      if(lv<=1)s='The '+TP[p.i].n.toLowerCase()+' has a spot that works.';
      else if(lv===2)s='Try the '+TP[p.i].n.toLowerCase()+' in the '+where+' part of the outline.';
      else{snap();sel=p.i;ori[p.i]=p.o;placed[p.i]=null;recand();var k=cands.findIndex(function(c){return c.o===p.o&&c.x===p.x&&c.y===p.y});
        ci=k<0?0:k;if(!cands.length){return null}place();s='The '+TP[p.i].n.toLowerCase()+' is placed for you.'}
      if(lv<3)say(s);return s},
    destroy:function(){w.removeEventListener('keydown',onkey);root.textContent=''}}}
registerPuzzle({id:'seven-pieces',name:'Seven Pieces',family:'grid',theme:'F8',blurb:'Fit seven flat pieces together into an outline.',
  how:'Pick a piece, turn or flip it, step through the spots that fit, and press Place piece. All seven pieces must fill the outline with no gaps or overlaps. Early levels start with some pieces already in place.',
  areas:['space','flex'],levels:30,secs:150,make:tgMake,mount:wrapMount(mountTangram),
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||(res.extra&&res.extra.par)||m,h=res.hints||0;
    return{stars:pzStarsByPar(m,p,h),line:'You placed pieces '+m+(m===1?' time':' times')+' with '+hintsLine(h)+'. Putting each piece down once takes '+p+'.'}}});

/* ================= 3. Blink Stream ================= */
var BL_LET='ABCDEFGHJKLMNPRSTUVWYZ';
function blMake(level,rng){var soa=Math.round(820-(level-1)*(820-340)/29),lags=level<=10?[5,6,7,8]:level<=20?[3,4,5,6]:[2,3,4,5],flags=pzShuffle([1,1,1,0,0,0],rng),trials=[];
  for(var t=0;t<6;t++){var len=11+pzInt(rng,4),p=3+pzInt(rng,3),lag=lags[pzInt(rng,lags.length)],x=flags[t]?p+lag:-1,s='',prev='';if(x>=0&&len<x+3)len=x+3;
    for(var i=0;i<len;i++){var ch;if(i===x)ch='X';else{do{ch=BL_LET.charAt(pzInt(rng,BL_LET.length))}while(ch===prev)}s+=ch;prev=ch}
    trials.push({s:s,p:p,x:x,lag:flags[t]?lag:0})}
  return{level:level,title:'Level '+level,soa:soa,lags:[lags[0],lags[lags.length-1]],trials:trials,par:6}}
PZD8.bl={make:blMake};
var blText=false;
function mountBlink(root,inst,api){
  var w=shell(root,'pd-bl'),K=(api.relaxed===true||(typeof api.relaxed==='function'&&api.relaxed()))?1.5:1,n=inst.trials.length,ti=0,phase='ready',correct=0,answered=0,hints=0,fin=false,tm=null,
    info=pzEl('p',{class:'pd-info',text:'Letters appear one at a time. One of them is shown light on dark inside a frame. After that letter, a letter X may or may not appear. When the stream ends, say whether you saw the X. Press Start stream when you are ready.'}),
    ct=pzEl('p',{class:'pd-q'}),stage=pzEl('div',{class:'pd-stage','aria-hidden':'true'}),msg=pzEl('p',{class:'pd-msg',role:'status'}),
    ctl=pzEl('div',{class:'pd-row'}),ans=pzEl('div',{class:'pd-row'}),txt;
  function say(t){msg.textContent=t;api.say(t)}
  function clearT(){clearTimeout(tm);tm=null}
  function showLet(ch,t1){stage.textContent='';if(ch)stage.appendChild(pzEl('div',{class:'pd-let'+(t1?' pd-t1':''),text:ch}))}
  var st=B('Start stream',function(){start(1)},'pd-main'),yes=B('I saw an X',function(){answer(true)},'',{'aria-label':'I saw an X'}),no=B('No X',function(){answer(false)},'',{'aria-label':'No X seen'}),nxt=B('Next stream',function(){next()},'pd-main');
  txt=B('Text mode: '+(blText?'on':'off'),function(){blText=!blText;txt.textContent='Text mode: '+(blText?'on':'off');txt.setAttribute('aria-pressed',blText?'true':'false')},'',{'aria-pressed':blText?'true':'false','aria-label':'Text mode'});
  function paint(){st.hidden=phase!=='ready';ans.hidden=phase!=='ask';nxt.hidden=phase!=='fb';yes.disabled=no.disabled=phase!=='ask';txt.hidden=phase!=='ready';ct.textContent='Stream '+(ti+1)+' of '+n}
  function ready(){clearT();phase='ready';showLet('+',false);stage.removeAttribute('aria-hidden');paint();say('Ready when you are.')}
  function start(slow){if(phase!=='ready'&&phase!=='ask')return;clearT();var tr=inst.trials[ti],ms=Math.round(inst.soa*K*slow);
    if(blText){phase='ask';stage.textContent='';var ls=pzEl('div',{class:'pd-list'});ls.textContent=tr.s.split('').map(function(c,i){return i===tr.p?'['+c+']':c}).join(' ');stage.appendChild(ls);stage.removeAttribute('aria-hidden');paint();say('The whole stream is shown as text. The framed letter is in square brackets. Did an X come after it?');return}
    phase='run';paint();stage.setAttribute('aria-hidden','true');say('Stream running.');showLet('+',false);var i=0;
    tm=setTimeout(function step(){if(i>=tr.s.length){showLet('?',false);phase='ask';stage.removeAttribute('aria-hidden');paint();say('The stream is over. Did an X come after the framed letter?');return}
      showLet(tr.s.charAt(i),i===tr.p);i++;tm=setTimeout(step,ms)},inst.fast?50:Math.round(700*K))}
  function answer(saw){if(phase!=='ask'||fin)return;var tr=inst.trials[ti],right=saw===(tr.x>=0);answered++;api.moved();if(right)correct++;phase='fb';paint();showLet(tr.s.charAt(tr.p),true);
    stage.removeAttribute('aria-hidden');
    var t=right?'Right. ':'Not this time. ';t+=tr.x>=0?'The X came '+plural(tr.lag,'letter')+' after the framed letter ('+tr.s.charAt(tr.p)+').':'There was no X in this stream.';
    nxt.textContent=ti===n-1?'See result':'Next stream';nxt.setAttribute('aria-label',nxt.textContent);say(t)}
  function next(){if(phase!=='fb')return;if(ti===n-1){fin=true;phase='end';paint();say('Done. '+correct+' of '+n+' right.');
      api.done({solved:true,moves:answered,hints:hints,undos:0,extra:{par:n,correct:correct,trials:n,soa:inst.soa}});return}
    ti++;ready()}
  ctl.appendChild(st);ctl.appendChild(txt);ans.appendChild(yes);ans.appendChild(no);ctl.appendChild(nxt);
  w.appendChild(info);w.appendChild(ct);w.appendChild(stage);w.appendChild(ctl);w.appendChild(ans);w.appendChild(msg);ready();
  return{undo:function(){return false},
    restart:function(){clearT();ti=0;correct=0;answered=0;fin=false;ready();say('Starting again from stream 1.')},
    hint:function(lv){if(fin||phase==='fb'||phase==='end')return null;hints++;var s;
      if(lv<=1)s='Watch for the framed letter first. An X can only come after it.';
      else if(lv===2)s='If an X comes, it shows up between '+inst.lags[0]+' and '+inst.lags[1]+' letters after the framed one.';
      else{s='Playing this stream again at half speed.';phase='ready';start(2)}
      if(lv<3)say(s);return s},
    destroy:function(){clearT();root.textContent=''}}}
registerPuzzle({id:'blink-stream',name:'Blink Stream',family:'memory',theme:'F4',undo:false,blurb:'Watch a quick stream of letters and say whether an X followed the framed one.',
  how:'Letters flash one at a time. One is framed. After it, an X may or may not appear. When the stream stops, say whether you saw the X. Six streams per level; later levels are quicker.',
  areas:['speed','attention'],levels:30,secs:75,make:blMake,mount:wrapMount(mountBlink,true),
  stars:function(res,inst){var ex=res.extra||{},c=ex.correct,N=ex.trials||(inst&&inst.par)||6,h=res.hints||0,s=c===N?3:c>=N-1?2:1;if(h&&s===3)s=2;
    return{stars:s,line:'You were right on '+c+' of '+N+' streams'+(h?' with '+plural(h,'hint'):'')+'.'}}});

/* ================= 4. Count the Passes ================= */
var CP_ANCH=[[60,50],[150,34],[240,50],[60,140],[150,156],[240,140]];
function cpMake(level,rng){var total=5+Math.round((level-1)*8/29),dur=Math.round(900-(level-1)*400/29),kinds,passes,count,tries=0;
  do{kinds=pzShuffle(['c','c','c','s','s','s'],rng);var h=pzInt(rng,6);passes=[];count=0;
    for(var i=0;i<total;i++){var to;do{to=pzInt(rng,6)}while(to===h);passes.push([h,to]);if(kinds[h]==='c')count++;h=to}}
  while((count<2||count>total-2)&&tries++<60);
  var star=rng()<.5?{k:1+pzInt(rng,total-2),y:55+pzInt(rng,60)}:null;
  return{level:level,title:'Level '+level,kinds:kinds,passes:passes,count:count,total:total,dur:dur,star:star,par:1}}
PZD8.cp={make:cpMake};
function mountPasses(root,inst,api){
  var w=shell(root,'pd-cp'),K=(api.relaxed===true||(typeof api.relaxed==='function'&&api.relaxed()))?1.5:1,rm=!!api.rm,fin=false,phase='ready',raf=0,t0=0,checks=0,hints=0,selN=null,selS=null,step=0,
    info=pzEl('p',{class:'pd-info',text:'Watch the short clip. Count how many passes are thrown by a circle. Passes thrown by a square do not count. Then say whether a star crossed the picture.'}),
    msg=pzEl('p',{class:'pd-msg',role:'status'}),ctl=pzEl('div',{class:'pd-row'}),q=pzEl('div',{class:'pd-row',style:'flex-direction:column;align-items:center'}),
    nOpts=pzEl('div',{class:'pd-opts',role:'group','aria-label':'How many passes did circles throw'}),sOpts=pzEl('div',{class:'pd-opts',role:'group','aria-label':'Did a star cross the picture'}),
    svg=NS('svg',{viewBox:'0 0 300 190',class:'pd-svg',role:'img','aria-label':'A clip of circles and squares passing a ball'}),
    shp=[],ball=NS('circle',{r:'6',fill:'var(--surface)',stroke:'var(--ink)','stroke-width':'3'}),starEl=NS('polygon',{points:'0,-11 3,-4 11,-4 5,1 7,9 0,4 -7,9 -5,1 -11,-4 -3,-4',fill:'var(--accent)',stroke:'var(--ink)','stroke-width':'1.5',visibility:'hidden'}),arrow=NS('line',{stroke:'var(--ink)','stroke-width':'3','stroke-dasharray':'6 4',visibility:'hidden'}),
    dur=Math.round((inst.ms||inst.dur)*K),LEAD=inst.ms?200:600,starDur=Math.round(dur*2.4),cnt=pzEl('p',{class:'pd-q'});
  svg.appendChild(NS('rect',{x:'1',y:'1',width:'298',height:'188',rx:'10',fill:'var(--surface)',stroke:'var(--line)','stroke-width':'2'}));
  svg.appendChild(arrow);
  inst.kinds.forEach(function(k){var e=k==='c'?NS('circle',{r:'14',fill:'var(--tint)',stroke:'var(--ink)','stroke-width':'3'}):NS('rect',{width:'26',height:'26',fill:'var(--surface)',stroke:'var(--ink)','stroke-width':'3'});shp.push(e);svg.appendChild(e)});
  svg.appendChild(ball);svg.appendChild(starEl);
  function say(t){msg.textContent=t;api.say(t)}
  function ppos(p,t){return rm?CP_ANCH[p]:[CP_ANCH[p][0]+5*Math.sin(t/650+p*1.3),CP_ANCH[p][1]+4*Math.cos(t/800+p*.9)]}
  function setPlayer(p,pt){var e=shp[p];if(inst.kinds[p]==='c'){e.setAttribute('cx',pt[0]);e.setAttribute('cy',pt[1])}else{e.setAttribute('x',pt[0]-13);e.setAttribute('y',pt[1]-13)}}
  function drawAt(t){for(var p=0;p<6;p++)setPlayer(p,ppos(p,t));
    var i2=Math.floor((t-LEAD)/dur),bp;
    if(t<LEAD)bp=ppos(inst.passes[0][0],t);else if(i2>=inst.total)bp=ppos(inst.passes[inst.total-1][1],t);
    else{var f=(t-LEAD-i2*dur)/dur,e=f*f*(3-2*f),a=ppos(inst.passes[i2][0],t),b=ppos(inst.passes[i2][1],t);bp=[a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e-14*Math.sin(Math.PI*f)]}
    ball.setAttribute('cx',bp[0]);ball.setAttribute('cy',bp[1]);
    if(inst.star){var ts=LEAD+inst.star.k*dur,u=(t-ts)/starDur;if(u>=0&&u<=1){starEl.setAttribute('transform','translate('+(-12+324*u)+' '+inst.star.y+')');starEl.setAttribute('visibility','visible')}else starEl.setAttribute('visibility','hidden')}else starEl.setAttribute('visibility','hidden')}
  function stepDraw(){/* reduced motion: one pass at a time, nothing moves */drawAt(0);var s=step;arrow.setAttribute('visibility','hidden');
    if(s>0){var pa=inst.passes[s-1],a=CP_ANCH[pa[0]],b=CP_ANCH[pa[1]];arrow.setAttribute('x1',a[0]);arrow.setAttribute('y1',a[1]);arrow.setAttribute('x2',b[0]);arrow.setAttribute('y2',b[1]);arrow.setAttribute('visibility','visible');
      ball.setAttribute('cx',b[0]);ball.setAttribute('cy',b[1]-20)}else{ball.setAttribute('cx',CP_ANCH[inst.passes[0][0]][0]);ball.setAttribute('cy',CP_ANCH[inst.passes[0][0]][1]-20)}
    if(inst.star&&s===inst.star.k+1){starEl.setAttribute('transform','translate(150 '+inst.star.y+')');starEl.setAttribute('visibility','visible')}else starEl.setAttribute('visibility','hidden');
    cnt.textContent=s?'Pass '+s+' of '+inst.total:'Before the first pass'}
  var go=B('Start the clip',function(){play()},'pd-main'),again=B('Watch again',function(){play()},''),nextStep=B('Show next pass',function(){advance()},'pd-main'),chk=B('Check',function(){check()},'pd-main');
  function paint(){go.hidden=phase!=='ready'||rm;nextStep.hidden=!(rm&&(phase==='ready'||phase==='step'));again.hidden=phase!=='ask'||rm;q.hidden=phase!=='ask';cnt.hidden=!rm;chk.disabled=selN===null||selS===null||fin;
    [].forEach.call(nOpts.children,function(b){b.setAttribute('aria-pressed',+b.getAttribute('data-n')===selN?'true':'false')});[].forEach.call(sOpts.children,function(b){b.setAttribute('aria-pressed',selS!==null&&(b.getAttribute('data-s')==='1')===selS?'true':'false')})}
  function frame(ts){if(!t0)t0=ts;var t=ts-t0;drawAt(t);var end=Math.max(LEAD+inst.total*dur,inst.star?LEAD+inst.star.k*dur+starDur:0)+500;
    if(t>=end){phase='ask';drawAt(0);raf=0;paint();say('The clip is over. How many passes did circles throw? Did a star cross?');return}raf=requestAnimationFrame(frame)}
  function play(){if(fin)return;if(phase!=='ready'&&phase!=='ask')return;phase='run';t0=0;paint();say('Clip playing.');raf=requestAnimationFrame(frame)}
  function advance(){if(fin||phase==='ask')return;phase='step';step++;stepDraw();if(step>=inst.total){phase='ask';say('That was the last pass. How many passes did circles throw? Did a star appear?')}else say('Pass '+step+' of '+inst.total+'.');paint()}
  (function(){var lo=Math.max(0,inst.count-2),hi=lo+4;for(var n=lo;n<=hi;n++)(function(nn){nOpts.appendChild(B(String(nn),function(){selN=nn;paint()},'',{'aria-label':nn+' passes by circles','data-n':String(nn)}))})(n);
    sOpts.appendChild(B('Yes, a star crossed',function(){selS=true;paint()},'',{'aria-label':'Yes, a star crossed','data-s':'1'}));sOpts.appendChild(B('No star',function(){selS=false;paint()},'',{'aria-label':'No star crossed','data-s':'0'}))})();
  function check(){if(fin||selN===null||selS===null)return;checks++;api.moved();var okN=selN===inst.count,okS=selS===!!inst.star;
    if(okN&&okS){fin=true;phase='end';paint();say('Right. Circles threw '+inst.count+' passes'+(inst.star?' and a star crossed.':' and no star crossed.'));api.done({solved:true,moves:checks,hints:hints,undos:0,extra:{par:1,count:inst.count,star:!!inst.star}});return}
    say(okN?'The pass count is right. Look again for the star.':okS?'The star answer is right. Count again: circles only.':'Not yet. Watch again if you like, and count only circle throws.')}
  q.appendChild(pzEl('p',{class:'pd-q',text:'How many passes did circles throw?'}));q.appendChild(nOpts);q.appendChild(pzEl('p',{class:'pd-q',text:'Did a star cross the picture?'}));q.appendChild(sOpts);q.appendChild(chk);
  ctl.appendChild(go);ctl.appendChild(nextStep);ctl.appendChild(again);
  w.appendChild(info);w.appendChild(svg);w.appendChild(cnt);w.appendChild(ctl);w.appendChild(q);w.appendChild(msg);
  if(rm)stepDraw();else drawAt(0);paint();
  return{undo:function(){return false},
    restart:function(){if(raf)cancelAnimationFrame(raf);raf=0;fin=false;phase='ready';selN=null;selS=null;step=0;if(rm)stepDraw();else drawAt(0);paint();say('Ready to watch again.')},
    hint:function(lv){if(fin)return null;hints++;var s;
      if(lv<=1)s='Count only the passes thrown by a circle. A square throwing does not count.';
      else if(lv===2)s='The ball is thrown '+inst.total+' times in all. Some of those throws are by squares.';
      else{selN=inst.count;selS=!!inst.star;paint();s='Circles threw '+inst.count+' passes and '+(inst.star?'a star crossed':'no star crossed')+'. Your answers are filled in; press Check.'}
      say(s);return s},
    destroy:function(){if(raf)cancelAnimationFrame(raf);root.textContent=''}}}
registerPuzzle({id:'count-the-passes',name:'Count the Passes',family:'memory',theme:'F4',undo:false,blurb:'Count the ball passes thrown by circles, and notice if a star crosses.',
  how:'Watch a short clip of circles and squares passing a ball. Count only the passes thrown by a circle, and say whether a star crossed. If you prefer, you can step through one pass at a time.',
  areas:['attention','control'],levels:30,secs:60,make:cpMake,mount:wrapMount(mountPasses,true),
  stars:function(res,inst){var m=res.moves,h=res.hints||0;return{stars:pzStarsByPar(m,1,h),line:'You answered right after '+plural(m,'check')+' and '+hintsLine(h)+'.'}}});
})();
