/* Zest v6 batch C: tiny shared helpers for the 9 puzzles (words, tiles, a stage). Loaded by batch-c.js before the puzzles.
   window.V6C holds helpers (CC.*) and, per puzzle id, the pure parts the tests use (V6C[id] = {make, plan, ...}). */
(function(){
var CC=window.V6C=window.V6C||{};
CC.words=function(len){var w=(typeof WORDS!=='undefined')?WORDS['by'+len]:null;return w?(typeof w==='string'?w.split(' '):w):[]};
var SET=null;CC.has=function(w){if(!SET){SET={};for(var n=3;n<=9;n++)CC.words(n).forEach(function(x){SET[x]=1})}return SET[w]===1};
CC.allWords=function(){var a=[];for(var n=3;n<=9;n++)a=a.concat(CC.words(n));return a};
CC.pl=function(n,w){return n+' '+w+(n===1?'':'s')};
CC.el=function(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
CC.btn=function(cls,label,fn){var b=document.createElement('button');b.type='button';b.className=cls+' zk-p';if(label)b.setAttribute('aria-label',label);if(fn)b.onclick=fn;return b};
CC.stage=function(root,cls,api){root.textContent='';var s=document.createElement('div');s.className='zk-stage zk-host '+cls+(ZK.rm(api)?' zk-rm':'');root.appendChild(s);return s};
/* shared look: a chunky letter tile, in every theme */
CC.CSS=''
+'.cc-t{all:unset;box-sizing:border-box;position:relative;display:flex;align-items:center;justify-content:center;width:52px;height:58px;border-radius:14px;background:var(--surface);box-shadow:0 0 0 2px var(--edge),0 4px 0 var(--edge);font:800 1.65rem/1 var(--disp,var(--font));color:var(--ink);text-transform:uppercase;cursor:pointer;-webkit-tap-highlight-color:transparent;user-select:none}'
+'.cc-t:focus-visible{outline:3px solid var(--ink);outline-offset:3px}'
+'.cc-t.ok{background:var(--ok-bg,#ddefe2);color:var(--ok-ink,#14532d);box-shadow:0 0 0 2px var(--ok-ink,#14532d),0 4px 0 var(--ok-ink,#14532d)}'
+'.cc-t.sel{background:var(--tint);box-shadow:0 0 0 3px var(--accent),0 4px 0 var(--accent)}'
+'.cc-t.dim{opacity:.35}'
+'.cc-t.amb{box-shadow:0 0 0 3px #E9A23B,0 4px 0 #E9A23B}'
+'.cc-row{display:flex;gap:7px;justify-content:center;align-items:center}'
+'.cc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}'
+'.zk-rm .cc-t{transition:none!important}';
CC.css=function(){ZK.css(CC.CSS,'cw-css')};
/* a tile's text swap with a flip (no motion under reduced motion) */
CC.flip=function(el,fn){if(ZK.rm()){fn();return}var a=ZK.anim(el,[{transform:'rotateX(0)'},{transform:'rotateX(90deg)'}],110,'ease-in');setTimeout(function(){fn();ZK.anim(el,[{transform:'rotateX(-90deg)'},{transform:'rotateX(0)'}],200,ZK.SPRING)},a?105:0)};
/* run a list of tap steps in a real browser test: each step is a CSS selector (string) */
})();
