/* Zest v6: Missing E (lipogram). Overrides puzzles_e2.js through ZK.override; the sentence generator (PZE2.me.make) is the original's.
   Rule: fill each gap with a word of the right meaning so the finished sentence never uses the banned letter(s).
   Board: the banned letter is a struck badge on top. The sentence is large with tappable gaps (each shows its meaning); tapping a gap opens chunky word chips.
   A pick that contains a banned letter is placed anyway and STRUCK at once: the banned letters turn amber with a line through them and the gap wobbles, so the player sees why.
   The next gap opens by itself after a clean pick. A level is 2 or 3 sentences, and the banned letter can change from one sentence to the next (so re-read the badge).
   Aha: the synonym that dodges the letter (tiny for small, huge for big); from level 21 two letters are banned. par = total gaps (one right pick per gap). */
(function(){
var ID='missing-e',CC=window.V6C,E=window.PZE2;
function roundsFor(L){return L<=24?2:3}
function make(level,rng){level=Math.max(1,Math.min(30,level|0||1));var k=roundsFor(level),rs=[],par=0;
  for(var q=0;q<k;q++){var r=E.me.make(level,rng);rs.push(r);par+=r.par}
  return{title:'Level '+level,level:level,rounds:rs,par:par,parExact:true,banned:rs[0].banned,slots:rs[0].slots}}
function plan(inst){var out=[];inst.rounds.forEach(function(r,ri){if(ri)out.push({wait:1.1});r.slots.forEach(function(s,i){out.push('.me-g[data-i="'+i+'"]');out.push('.me-o[data-ok="1"]')})});return out}
CC[ID]={make:make,plan:plan,roundsFor:roundsFor};
var CSS=''
+'.me{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font)}'
+'.me-top{display:flex;gap:10px;align-items:center;justify-content:center;min-height:42px}'
+'.me-ban{position:relative;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px var(--ink);font:800 1.35rem var(--disp,var(--font));text-transform:uppercase;color:var(--ink)}'
+'.me-ban:after{content:"";position:absolute;left:4px;right:4px;top:50%;height:4px;background:#E9A23B;border-radius:2px;transform:rotate(-38deg)}'
+'.me-sent{display:flex;flex-wrap:wrap;gap:8px 8px;justify-content:center;align-items:center;padding:14px 10px;width:100%;box-sizing:border-box;border-radius:22px;background:var(--surface);box-shadow:0 0 0 2px var(--line,#ddd);font:800 1.35rem/1 var(--disp,var(--font));color:var(--ink)}'
+'.me-g{all:unset;box-sizing:border-box;min-width:64px;min-height:48px;padding:0 12px;border-radius:14px;border:2.5px dashed var(--edge);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font:800 1.25rem/1 var(--disp,var(--font));color:var(--ink);transition:background .2s;-webkit-tap-highlight-color:transparent}'
+'.me-g small{font:700 .8rem var(--font);color:var(--muted);text-transform:none}'
+'.me-g.sel{border-style:solid;border-color:var(--accent);background:var(--tint)}.me-g.full{border-style:solid;border-color:var(--ok-ink,#14532d);background:var(--ok-bg,#ddefe2);color:var(--ok-ink,#14532d)}.me-g.bad{border-style:solid;border-color:#E9A23B;background:var(--tint)}'
+'.me-g:focus-visible,.me-o:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'.me-g i{font-style:normal;position:relative}.me-g i.x{color:#B26A00;text-decoration:line-through;text-decoration-thickness:3px;text-decoration-color:#E9A23B}'
+'.me-tray{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-content:flex-start;min-height:128px;width:100%;box-sizing:border-box;padding:8px;border-radius:20px;background:var(--tint)}'
+'.me-o{all:unset;box-sizing:border-box;min-width:92px;min-height:54px;padding:0 14px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;background:var(--surface);box-shadow:0 0 0 2px var(--edge),0 4px 0 var(--edge);cursor:pointer;font:800 1.2rem/1 var(--disp,var(--font));color:var(--ink)}'
+'.me-o[disabled]{opacity:.4}.zk-rm .me-g{transition:none}';
function mount(root,inst,api){CC.css();ZK.css(CSS,'me-css');
  var rm=ZK.rm(api),ri=0,R=inst.rounds[0],picks=[],sel=0,base=0,hist=[],hints=0,undos=0,fin=false,locked=false,last=null,ghost=null,idle=null,
      stage=CC.stage(root,'me',api),top=CC.el('div','me-top'),sent=CC.el('div','me-sent zk-board'),tray=CC.el('div','me-tray'),pips=ZK.pips(inst.par),gaps=[];
  stage.appendChild(top);stage.appendChild(sent);stage.appendChild(tray);stage.appendChild(pips.el);
  function bad(w){return R.banned.some(function(b){return w.indexOf(b)>=0})}
  function build(){R=inst.rounds[ri];picks=R.slots.map(function(){return -1});hist=[];sel=0;sent.textContent='';gaps=[];top.textContent='';
    R.banned.forEach(function(b){var e=CC.el('span','me-ban');e.textContent=b;e.setAttribute('role','img');e.setAttribute('aria-label','Banned letter '+b);top.appendChild(e)});
    sent.appendChild(document.createTextNode(R.lead));
    R.slots.forEach(function(s,i){var g=CC.btn('me-g','',function(){open(i)});g.setAttribute('data-i',i);g.setAttribute('data-zkc','');gaps.push(g);sent.appendChild(g)});
    sent.appendChild(document.createTextNode(R.tail));paint();if(!rm)ZK.anim(sent,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],260,ZK.SPRING)}
  function paint(){R.slots.forEach(function(s,i){var g=gaps[i],p=picks[i],cls='me-g';
      if(p<0){g.innerHTML='<small>'+s.m+'</small>';g.setAttribute('aria-label','Gap '+(i+1)+', '+s.m+', empty')}
      else{var w=s.opts[p];g.innerHTML=w.split('').map(function(ch){return R.banned.indexOf(ch)>=0?'<i class="x">'+ch+'</i>':'<i>'+ch+'</i>'}).join('');g.setAttribute('aria-label','Gap '+(i+1)+', '+w+(bad(w)?', contains a banned letter':''));cls+=bad(w)?' bad':' full'}
      if(sel===i&&!locked)cls+=' sel';g.className=cls});
    tray.textContent='';if(locked||fin)return;var s=R.slots[sel];
    s.opts.forEach(function(w,k){var b=CC.btn('me-o',w,function(){pick(sel,k,b)});b.textContent=w;b.setAttribute('data-ok',bad(w)?'0':'1');b.setAttribute('data-zkc','');if(picks[sel]===k)b.disabled=true;tray.appendChild(b);ZK.anim(b,[{transform:'translateY(12px) scale(.85)',opacity:0},{transform:'none',opacity:1}],200,ZK.SPRING,k*30)})}
  function open(i){if(fin||locked)return;sel=i;ZK.sfx('lift');ZK.buzz('tap');ZK.unmark(stage);paint()}
  function allDone(){return picks.every(function(p,i){return p>=0&&!bad(R.slots[i].opts[p])})}
  function pick(i,k,from){if(fin||locked)return;ZK.ghostDone(ID);if(ghost)ghost.stop();ZK.unmark(stage);var w=R.slots[i].opts[k];hist.push([i,picks[i]]);picks[i]=k;last=gaps[i];api.moved();pips.set(base+hist.length);
    if(bad(w)){paint();ZK.wrong(gaps[i]);return}
    ZK.sfx('click',{p:hist.length*2});ZK.buzz('move');ZK.anim(gaps[i],[{scale:'1'},{scale:'1.12'},{scale:'1'}],260,ZK.SPRING);
    if(allDone()){locked=true;paint();gaps.forEach(function(g,j){ZK.anim(g,[{translate:'0 0'},{translate:'0 -8px'},{translate:'0 0'}],320,ZK.SPRING,j*80)});ZK.sfx('cap',{n:ri});ZK.buzz('cap');
      if(ri===inst.rounds.length-1){fin=true;api.say('The sentence has no banned letter.');setTimeout(function(){api.done({solved:true,moves:base+hist.length,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:480)}
      else setTimeout(function(){base+=hist.length;ri++;locked=false;build()},rm?60:850);return}
    var nx=picks.findIndex(function(p,j){return j!==i&&(p<0||bad(R.slots[j].opts[p]))});if(nx>=0)sel=nx;paint()}
  stage.addEventListener('keydown',function(e){if(e.key>='1'&&e.key<='9'){var b=tray.querySelectorAll('.me-o')[+e.key-1];if(b)b.click()}});
  build();
  if(inst.level===1){ghost=ZK.ghost(stage,[{tap:{getBoundingClientRect:function(){var b=tray.querySelector('[data-ok="1"]')||tray;return b.getBoundingClientRect()}},hold:900}],{id:ID,level:1,delay:900})}
  idle=ZK.idle(stage,22000);
  return{
    undo:function(){if(fin||locked||!hist.length)return false;var h=hist.pop();picks[h[0]]=h[1];sel=h[0];undos++;pips.set(base+hist.length);ZK.unmark(stage);paint();ZK.sfx('undo');ZK.buzz('tap');return true},
    restart:function(){if(fin||locked)return;picks=R.slots.map(function(){return -1});hist=[];sel=0;pips.set(base);ZK.unmark(stage);paint();ZK.sfx('undo')},
    hint:function(lv){if(fin||locked)return null;var i=picks.findIndex(function(p,j){return p<0||bad(R.slots[j].opts[p])});if(i<0)return null;hints++;ZK.unmark(stage);
      if(lv<=1){ZK.mark(gaps[i]);return 'Look at this gap and the struck letter on top.'}
      sel=i;paint();var b=tray.querySelector('[data-ok="1"]');if(!b)return null;
      if(lv===2){ZK.mark(b);return 'This word has no banned letter.'}b.click();return 'Picked one for you.'},
    destroy:function(){if(ghost)ghost.stop();if(idle)idle.stop();root.textContent=''},
    lastEl:function(){return last},state:function(){return{round:ri,moves:base+hist.length,fin:fin}}}}
ZK.override({id:ID,name:'Missing E',family:'word',theme:'F3',blurb:'Finish the sentence with words that skip the banned letter.',
  how:'Tap a gap, pick a word without the struck letter.',areas:['flex','memory'],levels:30,secs:60,make:make,mount:mount,
  stars:function(res,inst){return{stars:pzStarsByPar(res.moves,inst.par,res.hints),line:CC.pl(inst.par,'gap')+' filled in '+CC.pl(res.moves,'pick')+'.'}}});
})();
