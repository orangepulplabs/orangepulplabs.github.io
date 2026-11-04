/* v6 trimmed ladders (integration, 4 Nov 2026, owner decision: Docs/v6/level-review.md "KEEP-TRIMMED").
   A puzzle listed here serves ONLY its kept original levels, renumbered 1..N, so the level count shows N.
   make() stays deterministic: new level L is played with the ORIGINAL level's seed and make(), so every kept level is exactly the
   instance that was reviewed (pzSeed and make are both mapped; inst.level stays the original number for the puzzle's own logic).
   Loaded right after puzzles/batch-d.js (the batch loaders have registered every puzzle by then), in index.html and gallery.html. */
(function(){
var TRIM=window.V6_TRIM={
  'zero-one':[1,4,8,9,13,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
  'blockade':[1,3,5,6,7,10,11,13,15,18,20,22,25,27,28,30],
  'seed-pits':[1,4,7,10,12,13,14,15,17,18,19,20,21,22,23,24,26,27,28,29,30],
  'who-owns-the-zebra':[1,3,4,6,8,9,10,11,12,13,14]};
function on(id){var p=window.PUZZLES&&PUZZLES[id];return !!(p&&p.v6&&p.v6Trim)}
var seed0=pzSeed;
pzSeed=function(id,level,tag){var m=TRIM[id];if(m&&on(id)){var L=level|0;if(L>=1&&L<=m.length)level=m[L-1]}return seed0(id,level,tag)};
Object.keys(TRIM).forEach(function(id){var p=window.PUZZLES&&PUZZLES[id];if(!p||!p.v6||p.v6Trim)return;var m=TRIM[id],mk=p.make;
  p.v6Trim=m;p.levels=m.length;
  p.make=function(level,rng){var L=Math.max(1,Math.min(m.length,level|0||1)),inst=mk.call(p,m[L-1],rng);if(inst&&typeof inst==='object'){inst.v6Level=L;if(typeof inst.title==='string')inst.title='Level '+L}return inst}});
})();
