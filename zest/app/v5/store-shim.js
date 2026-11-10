/* v5 storage shim. The shared engine files (app4a.js, app4d.js, challenge.js...) hard-code the localStorage key 'zv4'.
   v5 must never touch the v4 data the Android build uses, so every key that starts with 'zv4' is read and written as 'zv5...'.
   Loaded first, before any engine file. v4 files are not modified. */
(function(){try{var P=Storage.prototype,g=P.getItem,s=P.setItem,r=P.removeItem;
  function m(k){k=String(k);return k.indexOf('zv4')===0?'zv5'+k.slice(3):k}
  P.getItem=function(k){return g.call(this,m(k))};P.setItem=function(k,v){return s.call(this,m(k),v)};P.removeItem=function(k){return r.call(this,m(k))};
  window.addEventListener('storage',function(e){},true)}catch(e){}})();
