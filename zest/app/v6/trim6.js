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
  'who-owns-the-zebra':[1,3,4,6,8,9,10,11,12,13,14],
  /* 1.2.1: KEEP-FIX puzzles, the good levels of level-review.md plus the new levels their fix adds (raw levels past 30) */
  'living-stones':[1,4,6,8,10,12,13,14,16,17,18,19,20,21,22,23,24,25,27,29,30,31,32,33,34,35,36,37,38],
  'link-across':[1,5,7,10,13,15,16,18,19,31,20,21,32,22,23,33,24,25,34,26,27,35,28,29,36,30,37,38],   /* 31-38: forced win in 4, interleaved as the sawtooth top */
  'word-square':[1,3,6,7,8,9,10,12,14,16,17,18,20,22,23,24,26],   /* 27 dropped too: it repeats L20's square and uses DIDNT */
  'dot-loop':[1,4,5,6,8,10,11,12,13,17,18,19,20,21,22,24,31,32,33,34,35,36,37,38],   /* 31-38: dense 5x5 (dl_gen5.js) */
  'scramble':[1,7,9,12,13,14,15,16,17,18,19,20,21,22,23,24,26],
  'bridge-walk':[1,4,5,7,9,11,13,15,16,17,19,20,21,23,24,26,27,28,29,30],
  'sprout-lines':[1,4,6,31,32,33,9,34,35,13,36,37,38,21,39,40,24,41,42,26,43,44],   /* built for 1.2.1 but below the bar: stays hidden */
  'four-by-four':[1,4,11,12,14,15,17,18,21,22,24,26,27,28,30],
  'four-shades':[1,3,5,7,9,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]};   /* forced colourings; from 12 each map needs one 'what if' step */   /* 6x6 hidden singles found without the arm-dim from 11; 26-30 need a pointing pair / naked pair */   /* from 11: stranding filter + clean layout; 28 = the one late impossible map */   /* every tile placed is a move, par = letters */
function on(id){var p=window.PUZZLES&&PUZZLES[id];return !!(p&&p.v6&&p.v6Trim)}
var seed0=pzSeed;
pzSeed=function(id,level,tag){var m=TRIM[id];if(m&&on(id)){var L=level|0;if(L>=1&&L<=m.length)level=m[L-1]}return seed0(id,level,tag)};
Object.keys(TRIM).forEach(function(id){var p=window.PUZZLES&&PUZZLES[id];if(!p||!p.v6||p.v6Trim)return;var m=TRIM[id],mk=p.make;
  p.v6Trim=m;p.levels=m.length;
  p.make=function(level,rng){var L=Math.max(1,Math.min(m.length,level|0||1)),inst=mk.call(p,m[L-1],rng);if(inst&&typeof inst==='object'){inst.v6Level=L;if(typeof inst.title==='string')inst.title='Level '+L}return inst}});
})();
