/* Zest v6 batch d: tiny shared helpers (DK) for agent D's nine puzzles. Loaded by batch-d.js before the puzzle files. No DOM at load time. */
(function(){
var DK=window.DK={};
var NS='http://www.w3.org/2000/svg';
DK.NS=NS;
/* svg element: sv('circle',{cx:1}), optional parent */
DK.sv=function(tag,at,par){var e=document.createElementNS(NS,tag);if(at)for(var k in at)e.setAttribute(k,at[k]);if(par)par.appendChild(e);return e};
/* html element: h('div','cls',innerHTML,{attr:..}) */
DK.h=function(tag,cls,html,at,par){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(at)for(var k in at)e.setAttribute(k,at[k]);if(par)par.appendChild(e);return e};
/* lifecycle: timers and listeners that die with the puzzle */
DK.life=function(){var tm=[],offs=[],dead=false;
  return{later:function(fn,ms){var id=setTimeout(function(){if(!dead)fn()},ms);tm.push(id);return id},
    clear:function(){tm.forEach(clearTimeout);tm=[]},
    on:function(t,ev,fn,o){t.addEventListener(ev,fn,o);offs.push(function(){t.removeEventListener(ev,fn,o)})},
    destroy:function(){dead=true;tm.forEach(clearTimeout);tm=[];offs.forEach(function(f){f()});offs=[]},
    isDead:function(){return dead}}};
/* stop any running WAAPI animation on an element and its children */
DK.stopAnims=function(el){try{(el.getAnimations?el.getAnimations({subtree:true}):[]).forEach(function(a){a.cancel()})}catch(e){}};
/* an arrow button that is a real button, 44px minimum, with a name */
DK.btn=function(label,cls,par){var b=document.createElement('button');b.type='button';b.className=cls||'';b.setAttribute('aria-label',label);if(par)par.appendChild(b);return b};
/* SVG path for a curved arrow from (x1,y1) to (x2,y2) with a head; bend in px */
DK.arrow=function(x1,y1,x2,y2,bend,head){var mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,cx=mx+nx*bend,cy=my+ny*bend;
  var ex=x2-(cx-x2)*0,a=Math.atan2(y2-cy,x2-cx),hs=head||7,p1=[x2-hs*Math.cos(a-.5),y2-hs*Math.sin(a-.5)],p2=[x2-hs*Math.cos(a+.5),y2-hs*Math.sin(a+.5)];
  return'M'+x1.toFixed(1)+' '+y1.toFixed(1)+'Q'+cx.toFixed(1)+' '+cy.toFixed(1)+' '+x2.toFixed(1)+' '+y2.toFixed(1)+'M'+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+'L'+x2.toFixed(1)+' '+y2.toFixed(1)+'L'+p2[0].toFixed(1)+' '+p2[1].toFixed(1)};
DK.BASECSS=''
+'.dk{position:relative;width:100%;max-width:372px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font);color:var(--ink);--dk-board:#F1E7D3;--dk-line:#8C7A5B;--dk-ink:#3B3226}'
+':root[data-theme="dark"] .dk{--dk-board:#2A2622;--dk-line:#72675A;--dk-ink:#EDE6D8}'
+'@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .dk{--dk-board:#2A2622;--dk-line:#72675A;--dk-ink:#EDE6D8}}'
+'.dk *{box-sizing:border-box}'
+'.dk-top{display:flex;align-items:center;justify-content:center;gap:12px;min-height:34px;flex-wrap:wrap}'
+'.dk button{font-family:inherit}'
+'.dk-pt{position:absolute;width:48px;height:48px;margin:-24px 0 0 -24px;padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}'
+'.dk-pt:focus-visible{outline:3px solid var(--ink);outline-offset:-4px}'
+'.dk svg{display:block;overflow:visible}'
+'@keyframes dkpulse{0%,100%{opacity:.35}50%{opacity:1}}.dk-pulse{animation:dkpulse 1.1s ease-in-out infinite}'
+'.zk-rm .dk-pulse,.dk.zk-rm .dk-pulse{animation:none;opacity:1}'
+'@media (prefers-reduced-motion:reduce){.dk-pulse{animation:none;opacity:1}}';
})();
