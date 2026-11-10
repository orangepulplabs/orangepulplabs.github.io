/* v5 boot: reset/demo hooks, theme, the tab bar, the first screen, onboarding for a new player. */
(function(){
  if(Q.reset){try{['zv4','zv4.bak','zv4.corrupt','zv4.ev','zv5.flags','zv5.blocked'].forEach(function(k){localStorage.removeItem(k)})}catch(e){}try{STORE.cache=null}catch(e){}}
  window.phone=$('app');   // delight.js (ZD) positions its pops relative to this
  var st=db().st;if(st.sfx===undefined){st.sfx=1;st.hap=1}if(st.rm===undefined&&window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)st.rm=1;   // audit 16-03
  var v=S(),t=T();if(Q.demo&&!v.onb)seedDemo();
  if(!v.first)v.first=t;var ns=true;try{ns=!sessionStorage.getItem('zv5.s');sessionStorage.setItem('zv5.s','1')}catch(e){}if(ns||!v.sessions)v.sessions=(v.sessions|0)+1;
  v.lastOpen=t;save();applyTheme();
  textScale();window.addEventListener('resize',textScale);
  var tabs=$('tabs');tabs.innerHTML='<span class="tind" aria-hidden="true"><i></i></span>'+
    '<button data-tab="today">'+icon('sun')+'Today</button><button data-tab="play" class="tplay"><span class="pbub">'+icon('play')+'</span>Play</button><button data-tab="almanac">'+icon('book')+'Almanac</button>';
  on(tabs,'button[data-tab]','click',function(e,b){fx('tap');Nav.tab(b.dataset.tab)});
  if(Q.dev){var d=h5('<button class="chip" style="position:absolute;left:12px;bottom:calc(var(--tabh) + 12px);z-index:40" data-dev>DEV</button>');$('app').appendChild(d);d.onclick=openDev}
  try{localStorage.removeItem('zv5.blocked')}catch(e){}   // Zest is for all ages since 10 Nov 2026: lift the old under-13 stop
  Nav.tab('today',{first:true}).then(function(){var b=$('boot');b.classList.add('gone');setTimeout(function(){b.remove()},300);
    var fr=friendFromUrl();if(fr&&!fr.broken){friendStart(fr)}else{if(fr&&fr.broken)toast('That link did not open. Here is today\'s story.');if(!S().onb)welcome();else if(needTerms())termsGate(true)}
    S().lastSeenDay=T();save();setTimeout(evFlush,3000)});
  document.addEventListener('visibilitychange',function(){if(!document.hidden){var nt=T();if(S().lastSeenDay!==nt){Nav.refresh('today')}S().lastSeenDay=nt;save()}});
})();
