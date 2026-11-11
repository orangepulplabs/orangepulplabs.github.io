/* The ten families the Challenges tab is organised by (from the puzzle research master list), and which family each puzzle belongs to.
   A puzzle may also set `theme:'F1'`..`'F10'` in its registerPuzzle call; PZ_THEME is the fallback. Game ids (the 15 Practice games) are not listed here. */
var FAMILIES=[
 {id:'F1',name:'Eye Tricks',blurb:'Illusions and what you see against what is true'},
 {id:'F2',name:'Sound and Time',blurb:'Tones, rhythms, timing and chants'},
 {id:'F3',name:'Words and Codes',blurb:'Language games, codes and letter play'},
 {id:'F4',name:'Recall and Attention',blurb:'Remembering and noticing, as game tasks'},
 {id:'F5',name:'Choices and Logic',blurb:'Decisions and deduction'},
 {id:'F6',name:'Number Lore',blurb:'Arithmetic and the stories behind it'},
 {id:'F7',name:'Paths and Crossings',blurb:'Routes, loops and graphs'},
 {id:'F8',name:'Shapes and Builds',blurb:'Fitting, tiling and constructing'},
 {id:'F9',name:'Board Battles',blurb:'Traditional board games and their puzzle positions'},
 {id:'F10',name:'Grids, Pegs and Stacks',blurb:'Lights, number grids, peg jumps and stacks to sort'}];
var PZ_THEME={
 'slide-tiles':'F8','disc-tower':'F10','few-swaps':'F10','make-target':'F6','digit-span':'F4','tilt-run':'F7','four-by-four':'F10','zero-one':'F10','code-cracker':'F5','tube-sort':'F10','scramble':'F3','word-steps':'F3',
 'parallel-or-not':'F1','missing-triangle':'F1','quick-dots':'F4','digit-shuffle':'F6','remainder-riddle':'F6','balance-weights':'F5','bridge-walk':'F7','dodecahedron-tour':'F7','hundred-drawers':'F10','risk-deck':'F5','on-the-tip':'F3','sharp-or-round':'F2'};
function pzTheme(id){var p=window.PUZZLES&&PUZZLES[id];var t=(p&&p.theme)||PZ_THEME[id]||'F10';return FAMILIES.filter(function(f){return f.id===t})[0]||FAMILIES[9]}
/* The nine Practice games kept as ordinary challenges (each has a sourced story page). Every other game id (timing, speed, math, pattern, trail, match) is hidden:
   it is not in any shelf, family, daily, set, time mode or search. The engine code stays, but nothing here can reach it. */
var KEEP_GAMES=['hold','switch','span','nback','flanker','stroop','search','change','space'];
var GAME_THEME={hold:'F4',switch:'F5',span:'F4',nback:'F4',flanker:'F1',stroop:'F1',search:'F1',change:'F1',space:'F8'};
function isKept(sid){return KEEP_GAMES.indexOf(sid)>=0}
function keptStages(){return STG.filter(function(s){return isKept(s.id)})}
function gameTheme(sid){var t=GAME_THEME[sid];return FAMILIES.filter(function(f){return f.id===t})[0]||null}
/* The Play reel ("version C"): quick cards only, each about 5 to 20 seconds, one decision (or a couple of taps), no clock.
   REEL_QUICK is the whole pool. {trial:1} = the sourced game played as ONE trial built inside reel.js (the game engine runs whole rounds, so it is not launched from the reel).
   {lv:[a,b]} = a puzzle, only at those small levels (par is 1 to 3 moves there; checked with p.make()).
   IN: flanker, stroop, search, space (one trial each: one tap, a few seconds). Puzzles that fit one card without scrolling at 390x844: swap-starts (L1, one choice), make-target (L1-3, par 1-2),
   shift-three (L1, par 2), few-swaps (L1, par 3), switch-off (L1, par 2), rule-check (L1-2, one pick of cards).
   OUT (too slow for the reel): hold, switch, span, nback, change (need a run of trials, a sequence or waiting); quick-dots (five flashes), spotlight-cue (Start, four timed trials),
   bigger-faster (ten trials), parallel-or-not and sharp-or-round and endless-rise (six rounds each), odd-one-out and silhouette-match (three rounds each), same-grey (slider, par up to 15),
   circle-count, tilt-run, shadow-clock, mix-to-target, flat-fold-check (the board or dial is taller than one card, so the card scrolls; measured),
   block-match, missing-triangle, mirror-lattice (several placements), magic-three, slide-tiles, bridge-walk (four lines of rules, par 6+), digit-shuffle (typing four-digit sums). */
var REEL_QUICK={'flanker':{trial:1},'stroop':{trial:1},'search':{trial:1},'space':{trial:1},
 'swap-starts':{lv:[1,1]},'make-target':{lv:[1,3]},'shift-three':{lv:[1,1]},
 'few-swaps':{lv:[1,1]},'switch-off':{lv:[1,1]},'rule-check':{lv:[1,2]}};
var REEL_POOL=Object.keys(REEL_QUICK);
var REEL_TAP_START=[];