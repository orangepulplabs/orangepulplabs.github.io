/* Zest v6: Code Cracker. Overrides puzzles_b.js 'code-cracker' (original kept in ZK.orig). Same generator, feedback rule and solver par (PZB.cc).
   Mastermind with coloured, numbered pegs: tap a peg to drop it in the next slot, Check, and the clue pips pop in beside the row
   (filled pip = right peg in the right slot, hollow pip = right peg in the wrong slot). History stacks above your row. One-tap "next code" via the win card.
   Pegs carry a digit as well as a colour, so colour is never the only cue. */
(function(){
var ID='code-cracker',PAL=['#E69F00','#56B4E9','#009E73','#F0E442','#0072B2','#D55E00','#CC79A7','#9A9A9A','#4B4B4B','#F4F1EA'],INK=['#000','#000','#000','#000','#fff','#000','#000','#000','#fff','#000'];
/* curve: pick the secret so the solver's par follows a gentle ladder (2 to 8) with a breather at every fifth level; the generator is otherwise unchanged */
function make(level,rng){var T=Math.max(2,2+Math.floor(level*.2)-(level%5===0?1:0)),best=null,bd=99;
  for(var k=0;k<80;k++){var inst=PZB.cc.make(level,rng),d=Math.abs(inst.par-T);if(d<bd){bd=d;best=inst}if(!d)break}
  return best}
function decode(sp,x){var d=[],p;for(p=sp.len-1;p>=0;p--){d[p]=sp.lo+x%sp.size;x=Math.floor(x/sp.size)}return d}
function valid(sp,d){if(sp.rep)return true;for(var i=0;i<d.length;i++)for(var j=i+1;j<d.length;j++)if(d[i]===d[j])return false;return true}
var CCX={fb:PZB.cc.fb,cands:PZB.cc.cands,decode:decode,valid:valid};
var CSS='.cc{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:var(--font)}'
+'.cc-hist{width:100%;max-height:min(40vh,300px);overflow:auto;display:flex;flex-direction:column;gap:6px;padding:4px 2px;scrollbar-width:thin}'
+'.cc-row{display:flex;align-items:center;justify-content:center;gap:12px}.cc-pegs{display:flex;gap:6px}'
+'.cc-pip-box{display:grid;grid-template-columns:repeat(var(--cols,3),12px);gap:4px;min-width:50px}'
+'.cc-pip{width:12px;height:12px;border-radius:50%;box-sizing:border-box;border:2px solid var(--edge,#999);opacity:.45}.cc-pip.ex{background:var(--ink,#111);border-color:var(--ink,#111);opacity:1}.cc-pip.wr{border-color:var(--ink,#111);opacity:1}'
+'.cc-p{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:50%;font-weight:800;font-family:var(--font);-webkit-tap-highlight-color:transparent;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18),0 1px 2px rgba(0,0,0,.25)}'
+'.cc-p.sm{width:30px;height:30px;font-size:.85rem}.cc-slot{width:56px;height:56px;font-size:1.3rem;cursor:pointer;background:var(--surface,#fff);box-shadow:0 0 0 2px var(--edge,#999);color:var(--ink)}.cc-slot.full{box-shadow:inset 0 -3px 0 rgba(0,0,0,.18),0 1px 2px rgba(0,0,0,.25)}.cc-slot.sel{box-shadow:0 0 0 3.5px var(--ink)}'
+'.cc-slot.full.sel{box-shadow:inset 0 -3px 0 rgba(0,0,0,.18),0 0 0 3.5px var(--ink)}.cc-slot.mk{outline:3px dashed var(--ink);outline-offset:3px}'
+'.cc-pal{display:grid;gap:8px;justify-content:center;width:100%}.cc-key{width:56px;height:56px;font-size:1.3rem;cursor:pointer;transition:scale .2s cubic-bezier(.34,1.56,.64,1)}.cc-key:active{scale:.9}.cc-key:focus-visible,.cc-slot:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'.cc-go{all:unset;box-sizing:border-box;min-width:200px;height:56px;border-radius:28px;background:var(--accent,#E8590C);color:var(--on-accent,#1B1916);font:800 1.1rem/56px var(--font);text-align:center;cursor:pointer;transition:opacity .2s}.cc-go[aria-disabled="true"]{opacity:.35;cursor:default}.cc-go:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'.cc-go.warn{box-shadow:0 0 0 4px #E9A23B}.cc-cap{font:700 .8rem var(--font);color:var(--muted);text-align:center}'
+'@media (prefers-reduced-motion:reduce){.cc-key{transition:none}}.zk-rm .cc-key{transition:none}';
function peg(d,cls){var b=document.createElement('span');b.className='cc-p '+(cls||'');b.style.background=PAL[d%10];b.style.color=INK[d%10];b.textContent=d;return b}
function mount(root,inst,api){ZK.css(CSS,'cc-css');root.textContent='';var C=CCX,len=inst.len,sp={len:len,size:inst.size,rep:inst.rep,lo:inst.lo},rm=ZK.rm(api),guess=[],sel=0,hist=[],hints=0,fin=false,hp=-1,ghost=null,idle=null,last=null,offs=[],i;
  for(i=0;i<len;i++)guess.push(-1);
  var stage=document.createElement('div');stage.className='cc zk-stage zk-host'+(rm?' zk-rm':'');
  var hbox=document.createElement('div');hbox.className='cc-hist';hbox.setAttribute('role','list');hbox.setAttribute('aria-label','Your guesses and clues');
  var cap=document.createElement('div');cap.className='cc-cap';cap.textContent='● right peg, right slot   ○ right peg, wrong slot';cap.style.display='none';
  var board=document.createElement('div');board.className='cc-pegs zk-board';board.setAttribute('role','group');board.setAttribute('aria-label','Your guess');var slots=[];
  for(i=0;i<len;i++)(function(i){var b=document.createElement('button');b.type='button';b.className='cc-p cc-slot';b.setAttribute('data-zkc','');b.onclick=function(){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();if(guess[i]>=0){guess[i]=-1;ZK.sfx('undo')}sel=i;paint()};slots.push(b);board.appendChild(b)})(i);
  var pal=document.createElement('div');pal.className='cc-pal';pal.style.gridTemplateColumns='repeat('+Math.min(5,inst.size)+',56px)';var keys=[];
  for(i=0;i<inst.size;i++)(function(d){var k=peg(d,'cc-key');k.tabIndex=0;k.setAttribute('role','button');k.setAttribute('aria-label','Peg '+d);
    var go=function(){put(d)};k.onclick=go;k.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}};keys.push(k);pal.appendChild(k)})(inst.lo+i);
  var chk=document.createElement('button');chk.type='button';chk.className='cc-go zk-p';chk.textContent='Check';chk.onclick=function(){submit()};
  stage.appendChild(hbox);stage.appendChild(cap);stage.appendChild(board);stage.appendChild(pal);stage.appendChild(chk);root.appendChild(stage);
  function full(){return guess.indexOf(-1)<0}
  function paint(){for(var i=0;i<len;i++){var s=slots[i],v=guess[i];s.className='cc-p cc-slot'+(v>=0?' full':'')+(sel===i?' sel':'')+(hp===i?' mk':'');s.style.background=v>=0?PAL[v%10]:'';s.style.color=v>=0?INK[v%10]:'';s.textContent=v>=0?v:'';
      s.setAttribute('aria-label','Slot '+(i+1)+' of '+len+', '+(v<0?'empty':'peg '+v)+(hp===i?', hint':''))}
    chk.setAttribute('aria-disabled',full()?'false':'true');chk.style.display='';
    var brk=full()&&hist.some(function(h){var f=C.fb(guess,h[0]);return f[0]!==h[1][0]||f[1]!==h[1][1]});
    chk.classList.toggle('warn',!!brk);chk.textContent=brk?'! Check':'Check';chk.setAttribute('aria-label',brk?'Check. This guess breaks an earlier clue.':'Check')}
  function nextEmpty(from){for(var k=0;k<len;k++){var j=(from+k)%len;if(guess[j]<0)return j}return from}
  function put(d){if(fin)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);hp=-1;var j=guess[sel]<0?sel:nextEmpty(0);if(guess[j]>=0&&full()){ZK.wrong(slots[sel]);return}
    guess[j]=d;sel=nextEmpty(j);ZK.sfx('click',{p:d});ZK.buzz('tap');paint();ZK.anim(slots[j],[{scale:'.6'},{scale:'1.15'},{scale:'1'}],240,ZK.SPRING);last=slots[j];
    if(full())ZK.anim(chk,[{scale:'1'},{scale:'1.06'},{scale:'1'}],300,ZK.SPRING)}
  function row(g,f){var r=document.createElement('div');r.className='cc-row';r.setAttribute('role','listitem');var pg=document.createElement('div');pg.className='cc-pegs';g.forEach(function(d){pg.appendChild(peg(d,'sm'))});
    var pb=document.createElement('div');pb.className='cc-pip-box';pb.style.setProperty('--cols',len<=3?3:Math.ceil(len/2));pb.setAttribute('aria-label',f[0]+' right slot, '+f[1]+' right peg wrong slot');
    var pips=[];for(var k=0;k<len;k++){var p=document.createElement('i');p.className='cc-pip'+(k<f[0]?' ex':k<f[0]+f[1]?' wr':'');pips.push(p);pb.appendChild(p)}
    r.appendChild(pg);r.appendChild(pb);return{el:r,pips:pips,pegs:pg}}
  function submit(){if(fin)return;if(!full()){ZK.wrong(chk);return}if(!inst.rep&&!C.valid(sp,guess)){ZK.wrong(chk);api.say('Each peg is used once at most here.');return}
    ZK.ghostDone(ID);if(ghost)ghost.stop();var g=guess.slice(),f=C.fb(inst.code,g);hist.push([g,f]);api.moved();hp=-1;ZK.unmark(stage);
    var R=row(g,f);hbox.appendChild(R.el);hbox.scrollTop=hbox.scrollHeight;if(inst.level<=6)cap.style.display='';
    R.el.style.opacity=1;ZK.anim(R.el,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],240,ZK.EASE);
    R.pips.forEach(function(p,k){var on=k<f[0]+f[1];if(!on)return;setTimeout(function(){ZK.anim(p,[{scale:'0'},{scale:'1.6'},{scale:'1'}],240,ZK.SPRING);ZK.sfx('click',{p:k<f[0]?8+k*2:2+k});ZK.buzz('tap')},rm?0:140+k*110)});
    api.say(f[0]+' right slot, '+f[1]+' right peg in the wrong slot.');
    if(f[0]===len){fin=true;last=slots[len-1];slots.forEach(function(s,i){setTimeout(function(){ZK.anim(s,[{scale:'1'},{scale:'1.25'},{scale:'1'}],300,ZK.SPRING)},rm?0:i*70)});
      setTimeout(function(){api.done({solved:true,moves:hist.length,hints:hints,undos:0,extra:{par:inst.par,len:len}})},rm?0:100+len*55);return}
    for(var k=0;k<len;k++)guess[k]=-1;sel=0;paint()}
  paint();
  if(inst.level===1){ghost=ZK.ghost(stage,[{tap:keys[0]},{tap:keys[1]},{tap:keys[2]}],{id:ID,level:1})}
  idle=ZK.idle(stage,25000);
  function undo(){if(fin)return false;var had=false;for(var k=len-1;k>=0;k--)if(guess[k]>=0){guess[k]=-1;sel=k;had=true;break}if(had){ZK.sfx('undo');paint()}return had}
  return{undo:undo,
    restart:function(){if(fin)return;hist=[];hbox.textContent='';cap.style.display='none';for(var k=0;k<len;k++)guess[k]=-1;sel=0;hp=-1;ZK.unmark(stage);paint();ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;var c=C.cands(sp,hist);if(!c.length)return null;hints++;ZK.unmark(stage);var best=99,pos=0,k;
      for(var p=0;p<len;p++){var seen={},n=0;for(k=0;k<c.length;k++){var dg=C.decode(sp,c[k])[p];if(!seen[dg]){seen[dg]=1;n++}}if(n<best){best=n;pos=p}}
      if(lv<=1){hp=pos;sel=pos;paint();return 'Your clues narrow slot '+(pos+1)+' the most.'}
      if(lv===2){hp=pos;sel=pos;paint();return 'Slot '+(pos+1)+' is peg '+inst.code[pos]+'.'}
      var g=C.decode(sp,c[0]);for(k=0;k<len;k++)guess[k]=g[k];sel=len-1;hp=-1;paint();setTimeout(submit,rm?0:350);return 'This guess fits every clue. Checking it for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last},
    state:function(){return{guesses:hist.length,fin:fin,guess:guess.slice()}}}}
ZK.override({id:ID,name:'Code Cracker',family:'number',theme:'F5',calm:true,undo:true,
  blurb:'Crack the hidden peg code from the clues.',
  how:'Fill the row with pegs, then Check. Pips show how close you are.',
  areas:['space','attention'],levels:30,secs:150,make:make,mount:mount,
  stars:function(res,inst){var g=res.moves,p=(inst&&inst.par)||g,h=res.hints||0,s=g<=p+1?3:g<=p+4?2:1;if(h&&s===3)s=2;return{stars:s,line:'Cracked in '+g+' guess'+(g===1?'':'es')+'.'}}});
})();
