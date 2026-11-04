/* Zest v6: Seven Pieces (tangram). Overrides puzzles_d8.js 'seven-pieces' (original kept in ZK.orig). Same outline generator, exact cover solver and par (PZD8.tg).
   FIXES the v5 bug where level 10 drew huge black blobs (the outline relied on a CSS variable that was undefined in some themes, and fills had no fallback):
   every colour here is set from this file's own theme-aware variables with fallbacks, and the board is sized from the outline's bounding box.
   Interaction: DRAG a piece from the tray onto the outline. A dashed ghost shows exactly where it will land and the piece turns to fit by itself (no rotate / flip / next-spot buttons).
   Release near a ghost and it snaps with a spring; release elsewhere and it glides home. Pick placed pieces up by dragging them. Exact solver flags a doomed layout at once. */
(function(){
var ID='seven-pieces',NS='http://www.w3.org/2000/svg';
function sv(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
var T=PZD8.tg,TP=T.pieces,shape=T.shape,quarters=T.quarters,TW=100;
var COL={L:'#E8590C',M:'#2F9E6B',S:'#3B82C4',Q:'#E9B000',P:'#8B5CC9'};
function nbrs(key){var q=((key%4)+4)%4,cell=(key-q)/4,j=Math.floor(cell/TW),i=cell-j*TW,D=[[0,-1],[1,0],[0,1],[-1,0]];return[cell*4+(q+1)%4,cell*4+(q+3)%4,((j+D[q][1])*TW+(i+D[q][0]))*4+(q+2)%4]}
function dec(m){var y=Math.round(m/TW);return{x:m-y*TW,y:y}}
function quad(key){var q=key%4,cell=(key-q)/4,j=Math.floor(cell/TW),i=cell-j*TW,c=[i+.5,j+.5];return[[[i,j],[i+1,j],c],[[i+1,j],[i+1,j+1],c],[[i+1,j+1],[i,j+1],c],[[i,j+1],[i,j],c]][q]}
/* every placement of piece type t (all orientations) on free outline quarters: copy of the original search, since PZD8 exposes only solve/shape */
var UNI={};function uniq(t){if(UNI[t])return UNI[t];var seen={},out=[];for(var o=0;o<8;o++){var s=shape(t,o);if(!seen[s.sig]){seen[s.sig]=1;out.push(o)}}return UNI[t]=out}
function placements(t,anchors,allowed,occ){var out=[],seen={};
  uniq(t).forEach(function(o){var sh=shape(t,o);anchors.forEach(function(kk){for(var m=0;m<sh.q.length;m++){if(((sh.q[m]-kk)%4+4)%4!==0)continue;var delta=(kk-sh.q[m])/4,id=o+':'+delta;if(seen[id])continue;seen[id]=1;
      var ok=true;for(var z=0;z<sh.q.length;z++){var kq=sh.q[z]+delta*4;if(occ[kq]||(allowed&&!allowed[kq])){ok=false;break}}
      if(ok){var d=dec(delta);out.push({o:o,x:d.x,y:d.y})}}})});
  return out}
var make=T.make;
var CSS='.tg{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);--tg-bg:#F1ECE0;--tg-fill:#D8CDB4;--tg-line:#5B4F3A}'
+':root[data-theme="dark"] .tg{--tg-bg:#2A2620;--tg-fill:#47402F;--tg-line:#C9BD9F}'
+'.tg-board{position:relative;width:100%;border-radius:24px;background:var(--tg-bg);box-shadow:inset 0 2px 0 rgba(255,255,255,.2),0 6px 18px rgba(60,40,10,.14);padding:10px;box-sizing:border-box;touch-action:none;user-select:none;-webkit-user-select:none}'
+'.tg-svg{display:block;width:100%;height:auto;max-height:42vh;margin:0 auto;overflow:visible}'
+'.tg-tray{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:100%}'
+'.tg-tile{position:relative;height:74px;border-radius:16px;background:var(--surface,#fff);box-shadow:0 0 0 1.5px var(--line,#ddd);display:flex;align-items:center;justify-content:center;touch-action:none;cursor:grab;-webkit-tap-highlight-color:transparent}'
+'.tg-tile.gone{background:transparent;box-shadow:0 0 0 1.5px var(--line,#ddd);opacity:.45;cursor:default;border-style:dashed}.tg-tile.gone svg{opacity:.18}.tg-tile.mk{outline:3px dashed var(--ink);outline-offset:2px}'
+'.tg-tile svg{width:62px;height:58px;overflow:visible;pointer-events:none}.tg-tile:focus-visible{outline:3px solid var(--ink);outline-offset:2px}'
+'.tg-fly{position:absolute;left:0;top:0;pointer-events:none;z-index:8;overflow:visible;filter:drop-shadow(0 8px 8px rgba(0,0,0,.28))}'
+'.tg-p{cursor:grab}';
function pts(v){return v.map(function(a){return a[0].toFixed(3)+','+a[1].toFixed(3)}).join(' ')}
function tile(ix){var s=shape(TP[ix].t,0),e=sv('svg',{viewBox:(-.15)+' '+(-.15)+' '+(s.w+.3)+' '+(s.h+.3),'aria-hidden':'true'});e.appendChild(sv('polygon',{points:pts(s.v),fill:COL[TP[ix].t],stroke:'var(--tg-line)','stroke-width':.1,'stroke-linejoin':'round'}));return e}

function mount(root,inst,api){ZK.css(CSS,'tg-css');root.textContent='';var rm=ZK.rm(api),SIL=T.sil(inst.sol),silArr=Object.keys(SIL).map(Number),placed=[null,null,null,null,null,null,null],fixed={},hist=[],hints=0,undos=0,moves=0,fin=false,ghost=null,idle=null,offs=[],drag=null,lost=null,last=null,hl=null,dummy=null;
  inst.fixed.forEach(function(ix){fixed[ix]=1;placed[ix]=inst.sol[ix]});
  var minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;inst.sol.forEach(function(p,ix){var s=shape(TP[ix].t,p.o);minx=Math.min(minx,p.x);miny=Math.min(miny,p.y);maxx=Math.max(maxx,p.x+s.w);maxy=Math.max(maxy,p.y+s.h)});
  var VX=minx-.5,VY=miny-.5,VW=maxx-minx+1,VH=maxy-miny+1;
  var stage=document.createElement('div');stage.className='tg zk-stage zk-host'+(rm?' zk-rm':'');
  var board=document.createElement('div');board.className='tg-board zk-board';board.setAttribute('role','group');board.setAttribute('aria-label','Outline to fill');
  var svg=sv('svg',{viewBox:VX+' '+VY+' '+VW+' '+VH,'class':'tg-svg','aria-hidden':'true',focusable:'false'}),gS=sv('g',{}),gP=sv('g',{}),gG=sv('g',{});svg.appendChild(gS);svg.appendChild(gP);svg.appendChild(gG);board.appendChild(svg);
  silArr.forEach(function(k){gS.appendChild(sv('polygon',{points:pts(quad(k)),fill:'var(--tg-fill)',stroke:'var(--tg-fill)','stroke-width':.04}))});
  var dd='';silArr.forEach(function(k){var tri=quad(k),nb=nbrs(k),sides=[[tri[0],tri[1],nb[2]],[tri[1],tri[2],nb[0]],[tri[2],tri[0],nb[1]]];sides.forEach(function(s){if(!SIL[s[2]])dd+='M'+s[0].join(' ')+'L'+s[1].join(' ')})});
  gS.appendChild(sv('path',{d:dd,fill:'none',stroke:'var(--tg-line)','stroke-width':.1,'stroke-linecap':'round'}));
  var tray=document.createElement('div');tray.className='tg-tray';tray.setAttribute('role','group');tray.setAttribute('aria-label','Pieces');var tiles=[];
  for(var i=0;i<7;i++)(function(ix){var b=document.createElement('div');b.className='tg-tile';b.setAttribute('role','button');b.tabIndex=0;b.appendChild(tile(ix));b.dataset.ix=ix;tiles.push(b);tray.appendChild(b);
    b.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();autoPlace(ix)}}})(i);
  var pips=ZK.pips(inst.par);stage.appendChild(board);stage.appendChild(tray);stage.appendChild(pips.el);root.appendChild(stage);
  /* geometry helpers: units <-> client pixels (the svg is letter-boxed by max-height) */
  function geo(){var r=svg.getBoundingClientRect(),s=Math.min(r.width/VW,r.height/VH);return{r:r,s:s,ox:(r.width-VW*s)/2,oy:(r.height-VH*s)/2}}
  function toU(g,cx,cy){return[VX+(cx-g.r.left-g.ox)/g.s,VY+(cy-g.r.top-g.oy)/g.s]}
  function cen(v){var x=0,y=0;v.forEach(function(p){x+=p[0];y+=p[1]});return[x/v.length,y/v.length]}
  function polyOf(ix,p){return shape(TP[ix].t,p.o).v.map(function(v){return[v[0]+p.x,v[1]+p.y]})}
  function occ(skip){var m={};placed.forEach(function(p,ix){if(p&&ix!==skip)quarters(p,ix).forEach(function(k){m[k]=1})});return m}
  function count(){return placed.filter(Boolean).length}
  function paint(){gP.textContent='';
    placed.forEach(function(p,ix){if(!p||(drag&&drag.ix===ix&&drag.moved))return;var g=sv('g',{'data-zkc':'','data-ix':ix,'class':'tg-p'});g.style.transformBox='fill-box';g.style.transformOrigin='center';
      g.appendChild(sv('polygon',{points:pts(polyOf(ix,p)),fill:COL[TP[ix].t],'fill-opacity':fixed[ix]?.55:1,stroke:'var(--tg-line)','stroke-width':fixed[ix]?.1:.07,'stroke-linejoin':'round'}));
      if(fixed[ix]){var c=cen(polyOf(ix,p));g.appendChild(sv('circle',{cx:c[0],cy:c[1],r:.12,fill:'var(--tg-line)',opacity:.6}))}
      gP.appendChild(g)});
    tiles.forEach(function(t,ix){var gone=!!placed[ix]||(drag&&drag.ix===ix&&drag.moved);t.classList.toggle('gone',!!gone);t.setAttribute('aria-label',TP[ix].n+(fixed[ix]?', given':placed[ix]?', placed':', in the tray, drag it onto the outline'))});
    gG.textContent='';if(hl){gG.appendChild(sv('polygon',{points:pts(polyOf(hl.i,hl)),fill:'none',stroke:'var(--ink)','stroke-width':.12,'stroke-dasharray':'.25 .18','stroke-linejoin':'round'}))}
    pips.set(moves)}
  function snapH(){hist.push(JSON.stringify({p:placed}))}
  function doomed(){clearTimeout(lost);ZK.stuck(stage,false);if(fin)return;lost=setTimeout(function(){if(fin||count()===7)return;var r=T.solve(silArr,occ(),placed.map(Boolean),300000);if(!r)ZK.stuck(stage,true,{text:'These pieces can’t all fit',onUndo:undo})},rm?0:150)}
  /* ---- drag and drop ---- */
  function L(t,ty,fn,o){t.addEventListener(ty,fn,o);offs.push(function(){t.removeEventListener(ty,fn,o)})}
  function startDrag(ix,e,fromBoard){var g=geo(),cands=placements(TP[ix].t,silArr.filter(function(k){return!occ(ix)[k]}),SIL,occ(ix));
    drag={id:e.pointerId,ix:ix,x0:e.clientX,y0:e.clientY,moved:false,cands:cands,fromBoard:fromBoard,snap:null,fly:null,g:g,had:placed[ix]}}
  L(stage,'pointerdown',function(e){if(fin)return;ZK.unmark(stage);
    var tl=e.target.closest&&e.target.closest('.tg-tile');if(tl){var ix=+tl.dataset.ix;if(placed[ix])return;startDrag(ix,e,false);return}
    var pg=e.target.closest&&e.target.closest('.tg-p');if(pg){var ix2=+pg.dataset.ix;if(fixed[ix2])return;startDrag(ix2,e,true)}});
  function makeFly(ix){var s=shape(TP[ix].t,0),k=drag.g.s,el=sv('svg',{viewBox:'0 0 '+s.w+' '+s.h,'class':'tg-fly',width:Math.ceil(s.w*k)+4,height:Math.ceil(s.h*k)+4});el.appendChild(sv('polygon',{points:pts(s.v),fill:COL[TP[ix].t],stroke:'var(--tg-line)','stroke-width':.07,'stroke-linejoin':'round'}));el.style.overflow='visible';return el}
  function setFly(sh,ix,px,py){var k=drag.g.s,w=sh.w*k,h=sh.h*k,sr=stage.getBoundingClientRect();drag.fly.setAttribute('viewBox','0 0 '+sh.w+' '+sh.h);drag.fly.setAttribute('width',Math.ceil(w)+4);drag.fly.setAttribute('height',Math.ceil(h)+4);
    drag.fly.firstChild.setAttribute('points',pts(sh.v));drag.fly.style.transform='translate('+(px-sr.left-w/2)+'px,'+(py-sr.top-h/2)+'px)'}
  L(document,'pointermove',function(e){if(!drag||e.pointerId!==drag.id||fin)return;
    if(!drag.moved){if(Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<8)return;drag.moved=true;ZK.ghostDone(ID);if(ghost)ghost.stop();
      if(drag.fromBoard){snapH();placed[drag.ix]=null;moves=Math.max(0,moves-1)}drag.fly=makeFly(drag.ix);stage.appendChild(drag.fly);ZK.sfx('lift');ZK.buzz('tap');paint()}
    var fx=e.clientX,fy=e.clientY-70,u=toU(drag.g,fx,fy),best=null,bd=1e9;
    drag.cands.forEach(function(c){var cc=cen(polyOf(drag.ix,c)),d=Math.hypot(cc[0]-u[0],cc[1]-u[1]);if(d<bd){bd=d;best=c}});
    var near=best&&bd<1.15?best:null;
    if(near!==drag.snap){drag.snap=near;gG.textContent='';if(near){gG.appendChild(sv('polygon',{points:pts(polyOf(drag.ix,near)),fill:COL[TP[drag.ix].t],'fill-opacity':.28,stroke:'var(--ink)','stroke-width':.1,'stroke-dasharray':'.25 .18','stroke-linejoin':'round'}));ZK.buzz('tap');ZK.sfx('press')}}
    setFly(shape(TP[drag.ix].t,near?near.o:0),drag.ix,fx,fy)});
  function end(e){if(!drag||(e&&e.pointerId!==drag.id))return;var d=drag;drag=null;
    if(!d.moved){if(d.fly)d.fly.remove();ZK.anim(tiles[d.ix],[{translate:'0 0'},{translate:'0 -6px'},{translate:'0 0'}],260,ZK.SPRING);return}
    gG.textContent='';var fly=d.fly;
    if(d.snap){var c=d.snap,ix=d.ix,v=polyOf(ix,c),cc=cen(v),g=geo(),tx=g.r.left+g.ox+(cc[0]-VX)*g.s,ty=g.r.top+g.oy+(cc[1]-VY)*g.s,sr=stage.getBoundingClientRect(),sh=shape(TP[ix].t,c.o);
      if(!d.fromBoard)snapH();placed[ix]={o:c.o,x:c.x,y:c.y};moves++;api.moved();last=null;
      if(fly&&!rm){var an=fly.animate([{transform:fly.style.transform},{transform:'translate('+(tx-sr.left-sh.w*g.s/2)+'px,'+(ty-sr.top-sh.h*g.s/2)+'px)'}],{duration:130,easing:'ease-out',fill:'forwards'});an.onfinish=function(){fly.remove()}}else if(fly)fly.remove();
      setTimeout(function(){paint();var el=gP.querySelector('[data-ix="'+ix+'"]');last=el;if(el)ZK.anim(el,[{scale:'1.12'},{scale:'.97'},{scale:'1'}],300,ZK.SPRING);ZK.sfx('clack');ZK.buzz('pop');ZK.burst(board,(cc[0]-VX)*g.s+g.ox+10,(cc[1]-VY)*g.s+g.oy+10,{n:6,r:22});
        if(count()===7){fin=true;ZK.stuck(stage,false);setTimeout(function(){api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:260)}else{api.say(count()+' of 7 pieces in.');doomed()}},rm?0:120)}
    else{if(d.fromBoard){/* stays in tray */moves=moves;}
      if(fly&&!rm){var tr=tiles[d.ix].getBoundingClientRect(),sr2=stage.getBoundingClientRect(),w=parseFloat(fly.getAttribute('width')),h=parseFloat(fly.getAttribute('height'));
        var an2=fly.animate([{transform:fly.style.transform,opacity:1},{transform:'translate('+(tr.left-sr2.left+tr.width/2-w/2)+'px,'+(tr.top-sr2.top+tr.height/2-h/2)+'px) scale(.4)',opacity:.2}],{duration:240,easing:'cubic-bezier(.3,.7,.4,1)',fill:'forwards'});an2.onfinish=function(){fly.remove()}}else if(fly)fly.remove();
      ZK.sfx('soft');paint();if(d.fromBoard)doomed()}}
  L(document,'pointerup',end);L(document,'pointercancel',end);
  /* keyboard / hint path: drop a piece on its first fitting spot */
  function autoPlace(ix){if(fin||placed[ix])return;var c=placements(TP[ix].t,silArr.filter(function(k){return!occ()[k]}),SIL,occ());if(!c.length){ZK.wrong(tiles[ix]);return}snapH();placed[ix]={o:c[0].o,x:c[0].x,y:c[0].y};moves++;api.moved();last=null;paint();ZK.sfx('clack');if(count()===7){fin=true;setTimeout(function(){api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:260)}else doomed()}
  paint();
  if(inst.level===1){var r0=T.solve(silArr,occ(),placed.map(Boolean),150000);
    if(r0&&r0.length){var p0=r0[0],v0=polyOf(p0.i,p0),c0=cen(v0),g0=geo();dummy=document.createElement('div');dummy.style.cssText='position:absolute;width:2px;height:2px;pointer-events:none';
      var sr0=stage.getBoundingClientRect();dummy.style.left=(g0.r.left+g0.ox+(c0[0]-VX)*g0.s-sr0.left)+'px';dummy.style.top=(g0.r.top+g0.oy+(c0[1]-VY)*g0.s-sr0.top)+'px';stage.appendChild(dummy);
      ghost=ZK.ghost(stage,[{drag:[tiles[p0.i],dummy],down:function(){hl=p0;paint()},up:function(){hl=null;paint()},cancel:function(){hl=null;paint()}}],{id:ID,level:1,delay:900})}}
  idle=ZK.idle(stage,25000);
  doomed();
  function undo(){if(fin||!hist.length)return false;var o=JSON.parse(hist.pop());placed=o.p;moves=Math.max(0,moves-1);undos++;hl=null;ZK.unmark(stage);paint();ZK.sfx('undo');ZK.buzz('tap');doomed();return true}
  return{undo:undo,
    restart:function(){if(fin)return;placed=[null,null,null,null,null,null,null];inst.fixed.forEach(function(ix){placed[ix]=inst.sol[ix]});hist=[];moves=0;hl=null;ZK.unmark(stage);ZK.stuck(stage,false);paint();ZK.sfx('undo')},
    hint:function(lv){if(fin)return null;ZK.unmark(stage);hl=null;var r=T.solve(silArr,occ(),placed.map(Boolean),300000);
      if(!r){var lastIx=-1;for(var z=0;z<7;z++)if(placed[z]&&!fixed[z])lastIx=z;hints++;if(lastIx<0){paint();return null}
        if(lv<3){ZK.mark(document.querySelector('.pz5 [data-undo]'));paint();return 'The pieces in place leave a gap that cannot be filled. Undo.'}
        snapH();placed[lastIx]=null;moves=Math.max(0,moves-1);paint();doomed();return 'Picked up a piece.'}
      if(!r.length)return null;hints++;var p=r[0];
      if(lv<=1){ZK.mark(tiles[p.i]);paint();return 'The marked piece has a spot that works.'}
      if(lv===2){hl=p;paint();return 'It fits where the dashed outline is.'}
      snapH();placed[p.i]={o:p.o,x:p.x,y:p.y};moves++;api.moved();last=null;paint();ZK.sfx('clack');
      if(count()===7){fin=true;setTimeout(function(){api.done({solved:true,moves:moves,hints:hints,undos:undos,extra:{par:inst.par}})},rm?0:260)}else doomed();return 'Placed it for you.'},
    destroy:function(){clearTimeout(lost);if(ghost)ghost.stop();if(idle)idle.stop();offs.forEach(function(f){f()});root.textContent=''},
    lastEl:function(){return last||gP.firstChild},
    state:function(){return{placed:count(),fin:fin,moves:moves}}}}
ZK.override({id:ID,name:'Seven Pieces',family:'grid',theme:'F8',calm:true,
  blurb:'Drag seven flat pieces into the outline.',
  how:'Drag each piece onto the outline. It turns to fit.',
  areas:['space','flex'],levels:30,secs:150,make:make,mount:mount,
  stars:function(res,inst){var m=res.moves,p=(inst&&inst.par)||m,h=res.hints||0;return{stars:pzStarsByPar(m,p,h),line:'All seven pieces in.'}}});
})();
