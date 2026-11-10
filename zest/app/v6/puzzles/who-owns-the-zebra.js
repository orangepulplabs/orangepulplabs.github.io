/* Zest v6 batch d: Who Owns the Zebra. Overrides the puzzles_d8.js entry through ZK.override (the original stays in ZK.orig).
   Rule: houses in a row, a few kinds of facts, clues that pin them down (one unique solution). Place every fact, and find who owns the zebra.
   Kept: the clue kinds and the unique-solution generator (clues are dropped while the solution stays unique), generalised here from 5 fixed houses to H houses.
   Changed: levels 1-8 use 3 houses and 2-3 kinds of facts (then 4, then 5), so the first levels are short; clues are compact chips (A = B, next to, just left of, left of, not, first/middle/last)
   that you can tap to cross off; the answer grid is a NOTES grid: each cell shows the candidates still possible, a picker under the grid has Place and Cross-out modes, placing a fact
   rules it out everywhere it cannot be (shown as crossed marks), and the board checks itself when full (par = 1 check). A kind check message shows how many cells are off. */
(function(){
var ID='zebra';ID='who-owns-the-zebra';
var ZC=[
 {id:'nat',name:'Who',pool:['Brazilian','Norwegian','Kenyan','Indian','Japanese','Peruvian','Canadian'],ph:function(v){return v}},
 {id:'col',name:'Colour',pool:['red','blue','green','yellow','white','orange','purple'],ph:function(v){return v}},
 {id:'pet',name:'Pet',pool:['zebra','cat','parrot','rabbit','tortoise','goat','owl'],ph:function(v){return v}},
 {id:'drk',name:'Drink',pool:['tea','coffee','milk','cocoa','cider','juice','water'],ph:function(v){return v}},
 {id:'hob',name:'Hobby',pool:['chess','garden','paint','pottery','knit','bake','sing'],ph:function(v){return v}}];
var COLH={red:'#D64545',blue:'#3F6FD1',green:'#3E9B5A',yellow:'#E9C03B',white:'#F4EFE4',orange:'#F28C28',purple:'#8A5AC9'};
var PC=[];for(var q=0;q<32;q++){var n=0,x=q;while(x){n+=x&1;x>>=1}PC.push(n)}
function lowBit(m){var i=0;while(!(m>>i&1))i++;return i}function highBit(m,H){var i=H-1;while(!(m>>i&1))i--;return i}
function count(H,nc,clues,limit,init,shallow){var FULL=(1<<H)-1,n=0,i,dom0=[];for(i=0;i<nc;i++){var r=[];for(var j=0;j<H;j++)r.push(init?init[i][j]:FULL);dom0.push(r)}
  function prop(d){var ch=true,it=0;
    while(ch&&it++<200){ch=false;
      for(var ci=0;ci<clues.length;ci++){var c=clues[ci],A=c.a,Bq=c.b,a=d[A[0]][A[1]],b=Bq?d[Bq[0]][Bq[1]]:0,na=a,nb=b;
        switch(c.t){case'pos':na=a&(1<<c.h);break;case'same':na=nb=a&b;break;
          case'next':na=a&(((b<<1)|(b>>1))&FULL);nb=b&(((na<<1)|(na>>1))&FULL);break;
          case'left':na=a&(b>>1);nb=b&((na<<1)&FULL);break;
          case'before':if(!b||!a)return false;na=a&((1<<highBit(b,H))-1);nb=b&(~((1<<(lowBit(na||a)+1))-1)&FULL);break;
          default:if(PC[a]===1)nb=b&~a;if(PC[b]===1)na=a&~b;}
        if(na!==a){d[A[0]][A[1]]=na;ch=true}if(Bq&&nb!==b){d[Bq[0]][Bq[1]]=nb;ch=true}
        if(!d[A[0]][A[1]]||(Bq&&!d[Bq[0]][Bq[1]]))return false}
      for(var g=0;g<nc;g++){var row=d[g];
        for(var k=0;k<H;k++){if(!row[k])return false;if(PC[row[k]]===1)for(var k2=0;k2<H;k2++)if(k2!==k&&(row[k2]&row[k])){row[k2]&=~row[k];ch=true;if(!row[k2])return false}}
        for(var h=0;h<H;h++){var cnt=0,who=-1;for(k=0;k<H;k++)if(row[k]>>h&1){cnt++;who=k}if(cnt===0)return false;if(cnt===1&&row[who]!==(1<<h)){row[who]=1<<h;ch=true}}}}
    return true}
  function rec(d){if(n>=limit)return;if(!prop(d))return;var bg=-1,bk=-1,bs=9;
    for(var g=0;g<nc;g++)for(var k=0;k<H;k++){var s=PC[d[g][k]];if(s>1&&s<bs){bs=s;bg=g;bk=k}}
    if(bg<0){n++;return}
    for(var h=0;h<H&&n<limit;h++)if(d[bg][bk]>>h&1){var d2=d.map(function(r){return r.slice()});d2[bg][bk]=1<<h;rec(d2)}}
  if(shallow)return prop(dom0)?1:0;rec(dom0);return n}
function trueClues(H,nc,sol){var out=[],a,b,kb,ka,ha,hb,mid=H%2?(H-1)/2:-1;
  for(a=0;a<nc;a++)for(ka=0;ka<H;ka++){ha=sol[a][ka];
    if(ha===0||ha===H-1||ha===mid)out.push({t:'pos',a:[a,ka],b:null,h:ha});
    for(b=0;b<nc;b++){if(b===a)continue;for(kb=0;kb<H;kb++){hb=sol[b][kb];
      if(ha===hb&&a<b)out.push({t:'same',a:[a,ka],b:[b,kb]});if(ha!==hb&&a<b)out.push({t:'not',a:[a,ka],b:[b,kb]});
      if(Math.abs(ha-hb)===1&&a<b)out.push({t:'next',a:[a,ka],b:[b,kb]});if(ha+1===hb)out.push({t:'left',a:[a,ka],b:[b,kb]});if(ha<hb)out.push({t:'before',a:[a,ka],b:[b,kb]})}}}
  return out}
function plan(level){return level<=3?[3,[1,2]]:level<=8?[3,[0,1,2]]:level<=14?[4,[0,1,2]]:level<=21?[4,[0,1,2,3]]:level<=26?[5,[0,1,2,3]]:[5,[0,1,2,3,4]]}
function seq(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a}
function build(level,rng,Wsel){var P=plan(level),H=P[0],cats=P[1],nc=cats.length,vals=[],sol=[],c,i;
  for(c=0;c<nc;c++){var idx=pzShuffle(seq(7),rng).slice(0,H);if(cats[c]===2&&idx.indexOf(0)<0)idx[pzInt(rng,H)]=0;vals.push(idx);sol.push(pzShuffle(seq(H),rng))}
  var W=Wsel===1?{same:1.5,next:1.5,left:1,pos:1,before:1.5,not:1.5}:level<4?{same:3,next:2,left:2,pos:2,before:0,not:0}:level<15?{same:2,next:2,left:1.5,pos:1,before:2,not:0}:{same:1,next:1.5,left:.7,pos:.5,before:2,not:3};
  var pool=trueClues(H,nc,sol).filter(function(x){return W[x.t]>0}).map(function(x){return{k:Math.pow(Math.max(rng(),1e-9),1/W[x.t]),c:x}});pool.sort(function(a,b){return b.k-a.k});
  var clues=[],start=nc*2+1,ok=false;
  for(i=0;i<pool.length;i++){clues.push(pool[i].c);if(clues.length>=start&&count(H,nc,clues,2)===1){ok=true;break}}
  if(!ok)return null;
  var order=pzShuffle(clues.map(function(_,j){return j}),rng),keep=clues.slice();
  order.forEach(function(j){var c0=clues[j],t=keep.filter(function(x){return x!==c0});if(count(H,nc,t,2)===1)keep=t});
  return{level:level,title:'Level '+level,H:H,cats:cats,vals:vals,sol:sol,clues:pzShuffle(keep,rng),par:1,parExact:true}}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));return build(level,rng,0)||build(level,rng,1)||build(level,rng,1)}
function name(inst,ci,k){return ZC[inst.cats[ci]].pool[inst.vals[ci][k]]}
function ctext(inst,c){var a=name(inst,c.a[0],c.a[1]),b=c.b?name(inst,c.b[0],c.b[1]):'';
  switch(c.t){case'pos':return a+' is in the '+(c.h===0?'first house':c.h===inst.H-1?'last house':'middle house');case'same':return a+' goes with '+b;case'next':return a+' is next to '+b;
    case'left':return a+' is just left of '+b;case'before':return a+' is somewhere left of '+b;default:return a+' is not with '+b}}
window.V6ZB={make:make,count:count,name:name,ctext:ctext};
var CSS=''
+'.zb{gap:10px}.zb .zb-clues{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%}'
+'.zb .zb-cl{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:5px;min-height:34px;padding:3px 9px;border-radius:17px;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--line,#ddd);font:700 .8125rem/1.15 var(--font);color:var(--ink);cursor:pointer}'
+'.zb .zb-cl.on{opacity:.45;text-decoration:line-through}.zb .zb-cl:focus-visible{outline:3px solid var(--ink);outline-offset:2px}'
+'.zb .zb-cl i{font-style:normal;font-weight:600;opacity:.7;font-size:.75rem}.zb .zb-sw{width:11px;height:11px;border-radius:50%;box-shadow:0 0 0 1.5px var(--dk-ink);flex:none}'
+'.zb .zb-grid{display:grid;gap:5px;width:100%;padding:8px;border-radius:22px;background:var(--dk-board)}'
+'.zb .zb-hd{display:flex;align-items:center;justify-content:center;font:800 .875rem var(--font);color:var(--dk-ink);min-height:28px}'
+'.zb .zb-c{all:unset;box-sizing:border-box;position:relative;min-height:52px;border-radius:12px;background:var(--dk-tri,rgba(255,255,255,.45));box-shadow:inset 0 0 0 1.5px var(--dk-line);display:flex;flex-wrap:wrap;align-items:center;justify-content:center;align-content:center;gap:2px 3px;padding:3px;cursor:pointer;font:700 .6875rem/1 var(--font);color:var(--dk-ink);-webkit-tap-highlight-color:transparent}'
+'.zb .zb-c.sel{box-shadow:inset 0 0 0 3px var(--accent,#E8590C)}.zb .zb-c.full{font-size:.75rem;letter-spacing:-.2px;background:var(--surface,#fff)}.zb .zb-c.bad{box-shadow:inset 0 0 0 3px #E9A23B}'
+'.zb .zb-c:focus-visible{outline:3px solid var(--ink);outline-offset:1px}.zb .zb-c .zb-sw{width:11px;height:11px}'
+'.zb .zb-clues.sm .zb-cl{min-height:27px;padding:1px 7px;font-size:.71875rem;gap:4px;border-radius:14px}.zb .zb-clues.sm{gap:4px;max-height:124px;overflow-y:auto;overscroll-behavior:contain;padding:2px}.zb .zb-c.sm{min-height:44px}'
+'.zb .zb-pick{display:flex;flex-direction:column;gap:6px;width:100%;align-items:center}'
+'.zb .zb-modes{display:flex;gap:6px}.zb .zb-mode{all:unset;box-sizing:border-box;min-width:92px;min-height:44px;border-radius:22px;text-align:center;font:800 .9375rem/44px var(--font);background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--line,#ddd);cursor:pointer;color:var(--ink)}'
+'.zb .zb-mode[aria-pressed=true]{background:var(--accent,#E8590C);color:var(--on-accent,#1B1916);box-shadow:none}'
+'.zb .zb-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}'
+'.zb .zb-ch{all:unset;box-sizing:border-box;min-width:62px;min-height:44px;padding:0 12px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;gap:6px;font:800 .875rem var(--font);background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--edge,#999);cursor:pointer;color:var(--ink)}'
+'.zb .zb-ch.here{background:var(--accent,#E8590C);color:var(--on-accent,#1B1916);box-shadow:none}.zb .zb-ch.x{opacity:.45;text-decoration:line-through}.zb .zb-ch.auto{opacity:.3}'
+'.zb .zb-ch:focus-visible{outline:3px solid var(--ink);outline-offset:2px}'
/* 4 Nov level-review fixes: notes are real swatches and unique 3+ letter names (no more 'co' for both cocoa and coffee); an open cell with no candidate left gets the amber ring */
+'.zb .zb-m{display:inline-flex;align-items:center;justify-content:center;margin:1px 3px;font:700 .75rem/1.1 var(--font);color:var(--muted,#5f5a52)}.zb .zb-sw{display:inline-block}.zb .zb-m .zb-sw{width:14px;height:14px}'
+'.zb-fly{position:fixed;left:0;top:0;z-index:30;pointer-events:none;display:inline-flex;align-items:center;gap:5px;padding:8px 12px;border-radius:12px;background:var(--accent,#E8590C);color:var(--on-accent,#1B1916);font:800 .875rem var(--font);box-shadow:0 6px 16px rgba(0,0,0,.2)}.zb-fly .zb-sw{width:11px;height:11px;border-radius:50%}'
+'.zb .zb-c.dead{box-shadow:inset 0 0 0 3px #E9A23B;background:rgba(233,162,59,.14)}'
/* 1.2.1 layout: grid first (above the fold at 320 px), picker right under it, clues below in two columns of 44 px chips; counter in the grid corner */
+'.zb .zb-clues{display:grid;grid-template-columns:1fr 1fr;gap:6px;max-width:440px}.zb .zb-cl{display:flex;flex-wrap:wrap;justify-content:center;text-align:center;min-height:44px;border-radius:14px;padding:4px 8px;font-size:.8125rem;line-height:1.2;gap:3px 5px}'
+'.zb .zb-grid.h4 .zb-c:not(.full){display:grid;grid-template-columns:1fr 1fr;place-items:center;align-content:center;gap:2px 0;padding:3px 1px}.zb .zb-m{margin:0 2px;font-size:.71875rem;letter-spacing:-.2px;color:#34302a}.zb .zb-m .zb-sw{width:13px;height:13px}.zb .zb-pick{gap:0}.zb .zb-chips{gap:5px}'
+'.zb .zb-corner .zk-ctr{height:30px;padding:0 7px;gap:0;font-size:.9375rem}.zb .zb-corner .zk-ctr svg{display:none}.zb .zb-c{min-height:46px}'
+'.zb .zb-mode{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:44px;padding:0 12px;font:800 .875rem/1 var(--font)}.zb .zb-mode[aria-pressed=true]{background:var(--ink,#1B1916);color:var(--bg,#fff)}';
var ICONS={nat:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 4-8 8-8s8 3 8 8z"/>',col:'<path d="M12 3C8 8 5 11 5 15a7 7 0 0 0 14 0c0-4-3-7-7-12z"/>',pet:'<circle cx="12" cy="16" r="5"/><circle cx="5" cy="11" r="2.2"/><circle cx="9.5" cy="6" r="2.2"/><circle cx="14.5" cy="6" r="2.2"/><circle cx="19" cy="11" r="2.2"/>',drk:'<path d="M5 6h12v7a6 6 0 0 1-12 0zM17 8h2a3 3 0 0 1 0 6h-2"/>',hob:'<path d="M12 2l3 7 7 .7-5.3 4.7 1.6 7.1L12 17.8 5.7 21.5l1.6-7.1L2 9.7 9 9z"/>'};
function ico(id){return'<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor" stroke="none">'+ICONS[id]+'</svg>'}
var XICO='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
var HOUSE='<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M3 12L12 4l9 8v9H3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
function abbr(inst,ci,k){var all=[],H=inst.H,i,n,nm=name(inst,ci,k);for(i=0;i<H;i++)all.push(name(inst,ci,i));   /* the shortest prefix (3+ letters) that no other item of the kind shares */
  for(n=3;n<nm.length;n++){var pre=nm.slice(0,n);if(!all.some(function(o,j){return j!==k&&o.slice(0,n)===pre}))return pre}return nm}
function tok(inst,ci,k,long){var nm=name(inst,ci,k),id=ZC[inst.cats[ci]].id;if(id==='col')return'<span class="zb-sw" style="background:'+COLH[nm]+'" title="'+nm+'"></span>'+(long?'<span>'+nm+'</span>':'');return'<span>'+(long?nm:abbr(inst,ci,k))+'</span>'}
function mount(root,inst,api){ZK.css(DK.BASECSS+CSS,'zb-css');root.textContent='';
  var slips=0,wasClash=false,placing=false,H=inst.H,nc=inst.cats.length,rm=ZK.rm(api),L=DK.life(),place=[],man=[],hist=[],checks=0,hints=0,undos=0,fin=false,mode='place',sel=[0,0],done={},lastEl=null,ghost=null,idle=null,ci,h,k;
  var inv=inst.sol.map(function(s){var r=[];s.forEach(function(hh,kk){r[hh]=kk});return r});
  for(ci=0;ci<nc;ci++){place.push([]);man.push([]);for(h=0;h<H;h++){place[ci].push(-1);man[ci].push(0)}}
  var zk=-1,zc=-1;for(ci=0;ci<nc;ci++)if(ZC[inst.cats[ci]].id==='pet'){zc=ci;for(k=0;k<H;k++)if(name(inst,ci,k)==='zebra')zk=k}
  var stage=DK.h('div','dk zb zk-stage zk-host'+(rm?' zk-rm':'')),top=DK.h('div','dk-top',null,null,stage);
  var ctr=ZK.counter({icon:HOUSE,label:function(n){return n===0?'Everything placed':n+' cells to place'}});top.style.display='none';
  var clueBox=DK.h('div','zb-clues',null,{role:'list','aria-label':'Clues'}),cl=[];
  inst.clues.forEach(function(c,j){var b=DK.h('button','zb-cl zk-p',null,{type:'button','aria-label':ctext(inst,c)+'. Tap to cross off.','aria-pressed':'false'});var A=tok(inst,c.a[0],c.a[1],true),Bt=c.b?tok(inst,c.b[0],c.b[1],true):'';
    var rel={same:'=',next:'<i>next to</i>',left:'<i>just left of</i>',before:'<i>left of</i>',not:'<i>not</i>'}[c.t];
    b.innerHTML=c.t==='pos'?A+'<i>'+(c.h===0?'first house':c.h===H-1?'last house':'middle house')+'</i>':A+rel+Bt;
    b.onclick=function(){done[j]=!done[j];b.classList.toggle('on',!!done[j]);b.setAttribute('aria-pressed',done[j]?'true':'false');ZK.sfx('press');ZK.ghostDone(ID);if(ghost)ghost.stop()};clueBox.appendChild(b);cl.push(b)});
  var grid=DK.h('div','zb-grid zk-board'+(H>=4?' h4':''),null,{role:'grid','aria-label':'Notes grid'},stage);grid.style.gridTemplateColumns='42px repeat('+H+',1fr)';
  DK.h('div','zb-hd zb-corner','',null,grid).appendChild(ctr.el);for(h=0;h<H;h++)DK.h('div','zb-hd',HOUSE.replace('</svg>','<text x="12" y="19" font-size="9" font-weight="800" text-anchor="middle" fill="currentColor" stroke="none">'+(h+1)+'</text></svg>'),null,grid);
  var cell=[];for(ci=0;ci<nc;ci++){cell.push([]);DK.h('div','zb-hd',ico(ZC[inst.cats[ci]].id),null,grid);
    for(h=0;h<H;h++)(function(ci,h){var b=DK.h('button','zb-c',null,{type:'button','data-zkc':''});b.onclick=function(){select(ci,h)};cell[ci].push(b);grid.appendChild(b)})(ci,h)}
  var pick=DK.h('div','zb-pick',null,null,stage),chips=DK.h('div','zb-chips',null,null,pick),mx=DK.h('button','zb-mode zk-p',XICO+'<span>Cross out</span>',{type:'button','aria-pressed':'false','aria-label':'Cross-out mode'});
  function setMode(m){mode=m;mx.setAttribute('aria-pressed',m==='x'?'true':'false');ZK.sfx('press')}
  mx.onclick=function(){setMode(mode==='x'?'place':'x')};
  stage.appendChild(clueBox);root.appendChild(stage);
  function autoMask(ci,h2){var m=0,hh;if(place[ci][h2]>=0)m|=((1<<H)-1)&~(1<<place[ci][h2]);for(hh=0;hh<H;hh++)if(hh!==h2&&place[ci][hh]>=0)m|=1<<place[ci][hh];return m}
  function crossedMask(ci,h2){return man[ci][h2]|autoMask(ci,h2)}
  function snap(){return JSON.stringify([place,man])}
  function load(s){var o=JSON.parse(s);place=o[0];man=o[1]}
  function remaining(){var n=0;for(var a=0;a<nc;a++)for(var b=0;b<H;b++)if(place[a][b]<0)n++;return n}
  function render(){for(var a=0;a<nc;a++)for(var b=0;b<H;b++){var c=cell[a][b],p=place[a][b],cm=crossedMask(a,b),s='';
      if(p>=0)s=tok(inst,a,p,true);else for(var v=0;v<H;v++)if(!(cm>>v&1))s+='<span class="zb-m">'+tok(inst,a,v,false)+'</span>';
      var dead=p<0&&PC[cm&((1<<H)-1)]>=H;c.innerHTML=s;c.className='zb-c'+(p>=0?' full':'')+(dead?' dead':'')+(sel[0]===a&&sel[1]===b?' sel':'');c.setAttribute('aria-label','House '+(b+1)+', '+ZC[inst.cats[a]].name+': '+(p>=0?name(inst,a,p):'open, '+(H-PC[cm&((1<<H)-1)])+' possible'))}
    chips.textContent='';chips.appendChild(mx);var ca=sel[0],hb=sel[1],cmk=crossedMask(ca,hb);
    for(var v2=0;v2<H;v2++)(function(v){var b=DK.h('button','zb-ch zk-p',tok(inst,ca,v,true),{type:'button'}),here=place[ca][hb]===v,mn=!!(man[ca][hb]>>v&1),au=!!(autoMask(ca,hb)>>v&1)&&!here;
      b.className='zb-ch zk-p'+(here?' here':'')+(mn?' x':'')+(au?' auto':'');b.setAttribute('aria-label',name(inst,ca,v)+(here?', placed here':mn?', crossed out':au?', ruled out':''));b.onclick=function(){chip(v)};chips.insertBefore(b,mx)})(v2);
    ctr.set(remaining(),true);var cx=!fin&&remaining()>0&&clash();if(cx&&!wasClash&&placing){slips++}wasClash=cx;ZK.stuck(stage,cx,cx?{kind:'dead',text:'The clues can’t all hold now',onUndo:function(){ctl.undo()}}:undefined)}   /* 1.2.4: a clash found by combining clues is not shown at once (the kit shows it on a hint, 3 moves later or after 10 s idle) */
  function select(ci2,h2){if(fin)return;sel=[ci2,h2];ZK.sfx('press');ZK.unmark(stage);render()}
  function act(fn,pl){hist.push(snap());fn();placing=!!pl;render();placing=false}
  function chip(v){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);var ca=sel[0],hb=sel[1],au=!!(autoMask(ca,hb)>>v&1)&&place[ca][hb]!==v;
    if(mode==='x'){if(au||place[ca][hb]===v){ZK.wrong(chips.children[v]);return}act(function(){man[ca][hb]^=1<<v},true);ZK.sfx('undo');ZK.buzz('tap');return}
    if(au){ZK.wrong(chips.children[v]);return}
    if(place[ca][hb]===v){act(function(){place[ca][hb]=-1});ZK.sfx('lift');ZK.buzz('tap');return}
    var src=chips.children[v],r0=src&&src.getBoundingClientRect();act(function(){place[ca][hb]=v;man[ca][hb]&=~(1<<v)},true);api.moved();lastEl=cell[ca][hb];ZK.sfx('clack');ZK.buzz('move');if(!rm){fly(r0,cell[ca][hb],tok(inst,ca,v,true));ZK.anim(cell[ca][hb],[{scale:'.9'},{scale:'.9',offset:.55},{scale:'1.08',offset:.8},{scale:'1'}],380,ZK.SPRING)}
    var nx=nextEmpty();if(nx)sel=nx;render();if(!remaining())check()}
  function fly(r0,to,html){if(!r0||!to||!to.getBoundingClientRect)return;var r1=to.getBoundingClientRect(),g=document.createElement('div');g.className='zb-fly';g.innerHTML=html;document.body.appendChild(g);
    var w=g.offsetWidth,h=g.offsetHeight,x0=r0.left+r0.width/2-w/2,y0=r0.top+r0.height/2-h/2,x1=r1.left+r1.width/2-w/2,y1=r1.top+r1.height/2-h/2;
    var an=ZK.anim(g,[{transform:'translate('+x0+'px,'+y0+'px) scale(1)',opacity:1},{transform:'translate('+((x0+x1)/2)+'px,'+(Math.min(y0,y1)-18)+'px) scale(1.08)',opacity:1,offset:.5},{transform:'translate('+x1+'px,'+y1+'px) scale(.85)',opacity:.2}],210,ZK.EASE,0,'forwards');
    L.later(function(){g.remove()},240);if(!an)g.remove()}
  function nextEmpty(){var a=sel[0],b=sel[1],i;for(i=1;i<=nc*H;i++){var idx=(a*H+b+i)%(nc*H),x=Math.floor(idx/H),y=idx%H;if(place[x][y]<0)return[x,y]}return null}
  function clash(){var FULL=(1<<H)-1,d=[],a,k,hh;   /* the placed facts and crossed-out notes against the clues, by direct propagation only (no search):
       a clash means the level is known lost from here, which the player could see from the clues; a deeper mistake still waits for the check */
    for(a=0;a<nc;a++){d.push([]);for(k=0;k<H;k++){var m=FULL;for(hh=0;hh<H;hh++){if(place[a][hh]===k){m=1<<hh;break}if((place[a][hh]>=0&&place[a][hh]!==k)||(man[a][hh]>>k&1))m&=~(1<<hh)}d[a].push(m)}}
    for(a=0;a<nc;a++)for(k=0;k<H;k++)if(!d[a][k])return true;
    return count(H,nc,inst.clues,1,d,true)===0}
  function bad(){var o=[];for(var a=0;a<nc;a++)for(var b=0;b<H;b++)if(place[a][b]!==inv[a][b])o.push([a,b]);return o}
  function check(){checks++;var w=bad();if(!w.length){fin=true;var own=-1;for(var a=0;a<nc;a++)if(ZC[inst.cats[a]].id==='nat'||a===0){var hz=inst.sol[zc][zk];own=name(inst,0,inv[0][hz])+(ZC[inst.cats[0]].id==='col'?' house':'');break}
      ZK.sfx('cap');api.say('Solved. The '+own+' owns the zebra.');inst._owner=own;ZK.stuck(stage,false);
      if(!rm)cell.forEach(function(r,i){r.forEach(function(c,j){ZK.anim(c,[{scale:'1'},{scale:'1.1'},{scale:'1'}],300,ZK.SPRING,(i+j)*60)})});
      L.later(function(){var w=document.querySelector('.pz5 .zk-win');if(w&&w.scrollIntoView)try{w.scrollIntoView({block:'nearest',behavior:rm?'auto':'smooth'})}catch(e){}},rm?200:700);
      L.later(function(){api.done({solved:true,moves:checks+slips,hints:hints,undos:undos,extra:{par:1,owner:own}})},rm?0:420);return}
    w.forEach(function(x){ZK.wrong(cell[x[0]][x[1]],{silent:true});cell[x[0]][x[1]].classList.add('bad')});ZK.sfx('soft');ZK.buzz('wrong');
    ZK.stuck(stage,true,{kind:'rule',text:w.length+' cell'+(w.length===1?' does':'s do')+'n’t fit the clues',cells:w.map(function(x){return cell[x[0]][x[1]]}),onUndo:function(){ctl.undo()}})}
  var ctl={
    undo:function(){if(fin||!hist.length)return false;load(hist.pop());undos++;ZK.sfx('undo');ZK.buzz('tap');ZK.unmark(stage);render();return true},
    restart:function(){if(fin)return;hist=[];wasClash=false;for(var a=0;a<nc;a++)for(var b=0;b<H;b++){place[a][b]=-1;man[a][b]=0}sel=[0,0];ZK.sfx('undo');ZK.unmark(stage);render()},
    hint:function(lv){if(fin)return null;var w=null,a,b;for(a=0;a<nc&&!w;a++)for(b=0;b<H&&!w;b++)if(place[a][b]!==inv[a][b])w=[a,b];if(!w)return null;hints++;ZK.unmark(stage);a=w[0];b=w[1];var kk=inv[a][b];
      sel=[a,b];render();
      if(lv<=1)return 'Look at house '+(b+1)+', '+ZC[inst.cats[a]].name.toLowerCase()+'.';
      if(lv===2){var j=-1;inst.clues.forEach(function(c,x){if(j<0&&((c.a[0]===a&&c.a[1]===kk)||(c.b&&c.b[0]===a&&c.b[1]===kk)))j=x});if(j>=0){ZK.mark(cl[j]);return 'This clue is about '+name(inst,a,kk)+'.'}return 'No clue names '+name(inst,a,kk)+'. It follows from the others.'}
      act(function(){place[a][b]=kk;man[a][b]&=~(1<<kk)});lastEl=cell[a][b];api.moved();if(!remaining())check();return 'House '+(b+1)+' has '+name(inst,a,kk)+'.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();L.destroy();root.textContent=''},
    lastEl:function(){return lastEl},
    state:function(){return{place:place,checks:checks,fin:fin,owner:inst._owner,busy:false}}};
  render();idle=ZK.idle(stage,30000);
  if(inst.level===1){var gv=inv[0][0];ghost=ZK.ghost(stage,[{tap:chips.children[gv],hold:1000}],{id:ID,level:1})}
  return ctl}
ZK.override({id:ID,name:'Who Owns the Zebra',family:'grid',theme:'F5',calm:true,
  blurb:'Houses in a row, a few clues, and one zebra to place.',
  how:'Use the clues to place every fact. Tap a cell, then a choice.',
  areas:['control','flex'],levels:30,secs:120,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,h=res.hints||0,nf=inst.H*inst.cats.length;return{stars:pzStarsByPar(m,1,h),winLine:'All '+nf+' facts placed · '+(m<=1?'no slips':(m-1)+' slip'+(m===2?'':'s')),line:'The '+((res.extra&&res.extra.owner)||'owner')+' owns the zebra. '+m+' check'+(m===1?'':'s')+'.'}}});
})();
