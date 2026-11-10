/* v5 navigation and motion. Three persistent tab screens (built once, refreshed in place) and a stack of pushed pages.
   Every change of screen animates (transform + opacity only); Reduce motion turns each into a 150 ms fade.
   Overlays (sheets, dialogs, ad placeholders) stack above; the Android Back button walks overlays, then pages, then tabs. */
var Nav=(function(){
  var TABS=['today','play','almanac'],screens={},stack=[],overlays=[],cur='today',busy=false;
  var E_OUT='cubic-bezier(.2,.8,.2,1)',E_IN='cubic-bezier(.4,0,1,1)';
  function dur(ms){return Q.fast?1:rmOn()?150:ms}
  function anim(elx,kf,ms,easing,delay){if(!elx||!elx.animate)return Promise.resolve();if(rmOn())kf=kf.map(function(k){return {opacity:k.opacity==null?1:k.opacity}});
    var a=elx.animate(kf,{duration:dur(ms),easing:easing||E_OUT,delay:Q.fast?0:(delay||0),fill:'both'});return a.finished.then(function(){return a}).catch(function(){return a})}
  function clear(a){try{a&&a.cancel()}catch(e){}}
  function stageEl(){return $('stage')}
  function vis(elx,v){elx.setAttribute('aria-hidden',v?'false':'true');if(v)elx.removeAttribute('inert');else elx.setAttribute('inert','')}
  function setTabsUI(){var nav=$('tabs');qsa(nav,'button[data-tab]').forEach(function(b){if(b.dataset.tab===cur)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    var i=TABS.indexOf(cur),ind=qs(nav,'.tind');if(ind)ind.style.transform='translateX('+(i*100)+'%)';$('app').dataset.tab=cur}
  function chrome(){var top=stack[stack.length-1],hide=(top&&top.notabs!==false)||(!top&&screens[cur]&&screens[cur].notabs);$('app').classList.toggle('notabs',!!hide)}
  /* a tab screen: {name, build(el), refresh(el), show(el), hide(el), notabs} */
  function reg(name,def){var s=h5('<section class="scr" id="s-'+name+'" aria-label="'+esc(def.label||name)+'"></section>');vis(s,false);stageEl().appendChild(s);def.el=s;def.built=false;screens[name]=def;return def}
  function ensure(name){var d=screens[name];if(!d.built){d.build(d.el);d.built=true}else if(d.refresh)d.refresh(d.el);return d}
  async function tab(name,o){o=o||{};if(TABS.indexOf(name)<0)return;if(busy&&!o.force)return;
    if(stack.length){await popAll();}
    if(name===cur&&!o.first){var d0=ensure(name);if(d0.reselect)d0.reselect(d0.el);return}
    busy=true;var from=screens[cur],to=ensure(name),prev=cur;cur=name;setTabsUI();
    if(from&&from!==to&&!o.first){if(from.hide)from.hide(from.el);anim(from.el,[{opacity:1},{opacity:0}],120,E_IN).then(function(a){vis(from.el,false);clear(a)})}
    vis(to.el,true);chrome();if(to.show)to.show(to.el,prev);
    var a=await anim(to.el,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],o.first?240:180,E_OUT,o.first?0:60);clear(a);busy=false;
    var b=qs($('tabs'),'button[data-tab="'+name+'"] svg');if(b&&!o.first)anim(b,[{transform:'scale(1)'},{transform:'scale(1.18)'},{transform:'scale(1.08)'}],220,'cubic-bezier(.3,1.4,.5,1)').then(clear);
    ev('tab_'+name)}
  function topEl(){var t=stack[stack.length-1];return t?t.el:screens[cur].el}
  /* push a page: {name, el (section), notabs (default true), onPop, onShow}. The tapped element can fly to the new page (shared art). */
  async function push(pg,o){o=o||{};pg.el.classList.add('scr');vis(pg.el,true);var under=topEl();stageEl().appendChild(pg.el);stack.push(pg);chrome();
    if(o.replace&&stack.length>1){var old=stack.splice(stack.length-2,1)[0];old.el.remove();if(old.onPop)old.onPop()}
    var aOut=o.replace?null:anim(under,[{opacity:1,transform:'none'},{opacity:0,transform:'translateX(-12px)'}],240,E_IN);
    if(o.from&&o.toSel)fly(o.from,qs(pg.el,o.toSel));
    var a=await anim(pg.el,[{opacity:0,transform:'translateX(24px)'},{opacity:1,transform:'none'}],280,E_OUT,40);clear(a);
    if(aOut)aOut.then(function(x){vis(under,false);clear(x)});if(pg.onShow)pg.onShow(pg.el);ev('page_'+pg.name);return pg}
  async function pop(o){o=o||{};if(!stack.length)return false;var pg=stack.pop(),under=topEl();vis(under,true);chrome();
    var u=screens[cur];if(!stack.length&&u.refresh&&!o.norefresh)u.refresh(u.el);var top=stack[stack.length-1];if(top&&top.onShow)top.onShow(top.el);
    anim(under,[{opacity:0,transform:'translateX(-12px)'},{opacity:1,transform:'none'}],260,E_OUT,30).then(clear);
    await anim(pg.el,[{opacity:1,transform:'none'},{opacity:0,transform:'translateX(24px)'}],220,E_IN);pg.el.remove();if(pg.onPop)pg.onPop();return true}
  async function popAll(){while(stack.length>1){var p=stack.splice(stack.length-2,1)[0];p.el.remove();if(p.onPop)p.onPop()}if(stack.length)await pop()}
  /* FLIP: a clone of the tapped art flies into the destination's art box */
  function fly(fromEl,toEl){if(!fromEl||!toEl||rmOn()||Q.fast)return;var a=fromEl.getBoundingClientRect(),b=toEl.getBoundingClientRect(),app=$('app').getBoundingClientRect();if(!a.width||!b.width)return;
    var c=fromEl.cloneNode(true);c.style.cssText='position:absolute;z-index:70;margin:0;left:'+(b.left-app.left)+'px;top:'+(b.top-app.top)+'px;width:'+b.width+'px;height:'+b.height+'px;pointer-events:none;border-radius:20px';
    $('app').appendChild(c);toEl.style.opacity='0';var sx=a.width/b.width,sy=a.height/b.height;
    var an=c.animate([{transform:'translate('+(a.left-b.left)+'px,'+(a.top-b.top)+'px) scale('+sx+','+sy+')',transformOrigin:'0 0'},{transform:'none',transformOrigin:'0 0'}],{duration:320,easing:E_OUT,fill:'both'});
    an.finished.then(function(){toEl.style.opacity='';c.remove()}).catch(function(){toEl.style.opacity='';c.remove()})}
  /* ---------- overlays ---------- */
  function layer(){return $('layer')}
  function scrimEl(onTap){var s=h5('<div class="scrim"></div>');s.onclick=onTap;return s}
  /* sheet({title, body: node|html, full, onClose, cls}) -> {el, close} */
  function sheet(o){var L=layer(),sc=scrimEl(function(){api.close()}),sh=h5('<div class="sheet'+(o.full?' full':'')+(o.cls?' '+o.cls:'')+'" role="dialog" aria-modal="true" aria-label="'+esc(o.title||'')+'">'+(o.full?'':'<div class="grab" aria-hidden="true"><i></i></div>')+
      '<div class="shd"><h2>'+esc(o.title||'')+'</h2><button class="ibtn" data-x aria-label="Close">'+icon('x')+'</button></div><div class="sbd"></div></div>');
    var bd=qs(sh,'.sbd');if(typeof o.body==='string')bd.innerHTML=o.body;else if(o.body)bd.appendChild(o.body);
    if(o.noTitle)qs(sh,'.shd h2').textContent='';
    L.appendChild(sc);L.appendChild(sh);var prevFocus=document.activeElement;
    requestAnimationFrame(function(){sc.classList.add('on');sh.classList.add('on');var x=qs(sh,'[data-x]');try{x.focus({preventScroll:true})}catch(e){}});
    var closed=false,api={el:sh,body:bd,close:function(){if(closed)return;closed=true;var i=overlays.indexOf(api);if(i>=0)overlays.splice(i,1);sc.classList.remove('on');sh.classList.remove('on');
      setTimeout(function(){sc.remove();sh.remove()},dur(280));try{prevFocus&&prevFocus.focus({preventScroll:true})}catch(e){}if(o.onClose)o.onClose()}};
    qs(sh,'[data-x]').onclick=function(){api.close()};overlays.push(api);return api}
  /* dialog(title, text, [[label, fn, cls]]) */
  function dialog(title,text,acts){var L=layer(),sc=scrimEl(function(){api.close()}),d=h5('<div class="dlg" role="alertdialog" aria-modal="true" aria-label="'+esc(title)+'"><h2>'+esc(title)+'</h2>'+(text?'<p>'+esc(text)+'</p>':'')+'<div class="acts"></div></div>');
    var box=qs(d,'.acts');(acts||[['OK',null,'pri']]).forEach(function(a){var b=h5('<button class="btn wide '+(a[2]||'sec')+'">'+esc(a[0])+'</button>');b.onclick=function(){api.close();if(a[1])a[1]()};box.appendChild(b)});
    L.appendChild(sc);L.appendChild(d);requestAnimationFrame(function(){sc.classList.add('on');d.classList.add('on');try{qs(d,'button').focus({preventScroll:true})}catch(e){}});
    var closed=false,api={el:d,close:function(){if(closed)return;closed=true;var i=overlays.indexOf(api);if(i>=0)overlays.splice(i,1);sc.classList.remove('on');d.classList.remove('on');setTimeout(function(){sc.remove();d.remove()},dur(260))}};overlays.push(api);return api}
  /* a full-screen overlay that is not dismissable by the scrim (onboarding, ad placeholders) */
  function cover(node,o){o=o||{};var L=layer();node.style.pointerEvents='auto';L.appendChild(node);var api={el:node,noBack:!!o.noBack,close:function(){var i=overlays.indexOf(api);if(i>=0)overlays.splice(i,1);
      return anim(node,[{opacity:1},{opacity:0}],200,E_IN).then(function(){node.remove()})}};overlays.push(api);anim(node,[{opacity:0},{opacity:1}],220).then(clear);return api}
  function back(){if(overlays.length){var o=overlays[overlays.length-1];if(o.noBack)return true;o.close();return true}
    var top=stack[stack.length-1];if(top){if(top.onBack&&top.onBack()===true)return true;pop();return true}
    var s=screens[cur];if(s&&s.onBack&&s.onBack()===true)return true;if(cur!=='today'){tab('today');return true}return false}
  return {TABS:TABS,reg:reg,tab:tab,push:push,pop:pop,popAll:popAll,sheet:sheet,dialog:dialog,cover:cover,back:back,anim:anim,clear:clear,fly:fly,chrome:chrome,
    get cur(){return cur},get depth(){return stack.length},get top(){return stack[stack.length-1]||null},get overlays(){return overlays.length},screen:function(n){return screens[n]},refresh:function(n){var d=screens[n];if(d&&d.built&&d.refresh)d.refresh(d.el)}};
})();
/* Android shell hook (tool/app-shell.js calls __z4.handleBack(); it exits the app only when this returns false) */
window.__z4=window.__z4||{};window.__z4.handleBack=function(){return Nav.back()};
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(Nav.back())e.preventDefault()}});
