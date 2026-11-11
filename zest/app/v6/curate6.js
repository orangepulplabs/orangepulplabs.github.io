/* v6 library curation (integration, 4 Nov 2026). Loaded after every v5 file and before ../v5/boot.js.
   ONLY the v6 puzzles that passed the strict re-score (Docs/v6/strict-review.md) are visible anywhere: Almanac chapters and counts,
   the daily rotation (and so past days and the tomorrow teaser), search, the reel's puzzle cards, Keep going, card pages and friend links.
   Nothing is deleted: hidden puzzles stay registered (PUZZLES), so old saves still load; they are simply unreachable.
   - visible = every id overridden by a v6 file (ZK.list), minus V6_CUT (cut by the strict review, kept on disk for the record).
   - P(id) returns null for a hidden id, so every v5 guard (cards, keep going, reel pool, friend links) drops it.
   - PUZZLE_ORDER is filtered in place, so every "x of N" reads the real count.
   - Chapters (FAMILIES) with no visible puzzle are dropped; a chapter left with one puzzle is merged into a neighbour (V6_MERGE), and a chapter that
     takes in merged puzzles is relabelled (V6_RENAME). With the 13 puzzles of 4 Nov this gives 4 chapters.
   - A friend link to a hidden puzzle shows "That puzzle has moved on" and opens Today. */
(function(){
if(!window.ZK||!window.PUZZLES)return;
/* cut by the strict independent re-score (reasons in Docs/v6/strict-review.md). Files stay in puzzles/. */
var V6_CUT=window.V6_CUT={'sprout-lines':'1.2.1: part-grown gardens and the doomed chip built, but late vines must pass 11 px corridors (3 of 5 late levels could not be drawn by finger), strict 31','missing-e':'batch C cut, 32: scan-for-a-letter has no aha','magic-three':'32: every level is the same Lo Shu square rescaled','few-swaps':'32: greedy placement is always optimal, no aha after level 3','nine-rings':'32: legal rings glow, so 24 moves of chores once the rule is known','shift-three':'32: spinning the dial until it reads is faster than any insight','pile-pull':'29: the goal is invisible and the trick (Nim sums) cannot be found by play','mirror-lattice':'29: copy-the-twin chore, 35 px cells on the 8x8 boards','last-letter-chain':'29: four valid-looking words, dead ends found by trial','hidden-rule-sort':'29: a sorting test, the first card of every rule is a guess','rule-check':'29: the same vowel/even rule on every level','odd-one-out':'27: guessable (3-5 frames), small figures, the rule needs reading','temple-circles':'27: constraint symbols need decoding; level 10 is par 1','hidden-stone':'31: the goal reads only after the demo; many solutions','hundred-drawers':'25: follow the glowing chain: no aha after level 1','risk-deck':'23: a gamble, not a puzzle; no goal on the board; undo peeks'};
var FX=(location.search.match(/[?&]fx=([^&]*)/)||[])[1];if(FX)FX.split(',').forEach(function(id){delete V6_CUT[id]});   /* 1.2.1 test hook (?fx=id): make a hidden puzzle visible for re-scoring */
var vis=ZK.list.filter(function(id){return PUZZLES[id]&&PUZZLES[id].v6&&!V6_CUT[id]}),VIS={};vis.forEach(function(id){VIS[id]=1});
window.V6_VISIBLE=vis;window.v6Visible=function(id){return !!VIS[id]};
/* (challenge.js keeps PZRETIRED private, so a hidden puzzle's link still decodes; friendFromUrl below turns it into 'moved on'.
   Nothing in the UI can share a hidden puzzle, because nothing can open one.) */
/* the order everything iterates: the old order, visible ids only (in place, other files hold the same array) */
var keep=PUZZLE_ORDER.filter(function(id){return VIS[id]});vis.forEach(function(id){if(keep.indexOf(id)<0)keep.push(id)});
PUZZLE_ORDER.length=0;Array.prototype.push.apply(PUZZLE_ORDER,keep);
/* P(id): null for hidden ids */
var P0=P;P=function(id){return VIS[id]?P0(id):null};
/* chapters: drop empty ones, merge a lone puzzle into the chapter named in V6_MERGE (the closest in spirit) */
var ALL=FAMILIES.slice(),V6_MERGE={F1:'F10',F2:'F5',F3:'F5',F4:'F5',F6:'F5',F9:'F10'},
  V6_RENAME={F5:{name:'Numbers, Codes and Words',blurb:'Sums, weights, codes and word ladders'},F10:{name:'Boards, Pegs and Toggles',blurb:'Lights out, peg jumps, tube sorting and a tiger hunt'}},got={};
function rawTheme(id){var p=PUZZLES[id];return (p&&p.theme)||PZ_THEME[id]||'F10'}
function count(fid){return PUZZLE_ORDER.filter(function(id){return rawTheme(id)===fid}).length}
ALL.forEach(function(f){var n=count(f.id);if(n>0&&n<2&&V6_MERGE[f.id]){got[V6_MERGE[f.id]]=1;PUZZLE_ORDER.forEach(function(id){if(rawTheme(id)===f.id){PUZZLES[id].theme=V6_MERGE[f.id];PUZZLES[id].v6MergedFrom=f.id}})}});
ALL=ALL.map(function(f){return got[f.id]&&V6_RENAME[f.id]?Object.assign({},f,V6_RENAME[f.id]):f});
/* 1.2.1: with the word puzzles back, Words is its own chapter again, so the two chapter names must not overlap */
var V6_NAME={F3:{name:'Words',blurb:'Word ladders, jumbles and word squares'},F5:{name:'Numbers and Codes',blurb:'Sums, weights, codes and a zebra to place'}};
ALL=ALL.map(function(f){return V6_NAME[f.id]&&count(f.id)>=2?Object.assign({},f,V6_NAME[f.id]):f});
var live=ALL.filter(function(f){return count(f.id)>0});FAMILIES.length=0;Array.prototype.push.apply(FAMILIES,live);
pzTheme=function(id){var t=rawTheme(id);return FAMILIES.filter(function(f){return f.id===t})[0]||ALL.filter(function(f){return f.id===t})[0]||FAMILIES[FAMILIES.length-1]};
/* art for a hidden id (only the welcome fan can still ask for one): show a visible puzzle's art instead */
if(typeof art==='function'){var art0=art;art=function(id,k){return art0(VIS[id]||!PUZZLES[id]?id:PUZZLE_ORDER[0],k)}}
/* the first-run puzzle must be visible: Switch Off (37/40, a one-tap level 1 with a ghost demo) */
if(typeof FIRST_PUZZLE!=='undefined'&&!VIS[FIRST_PUZZLE])FIRST_PUZZLE=VIS['switch-off']?'switch-off':PUZZLE_ORDER[0];
/* friend links to a hidden puzzle: the old "moved on" message, then Today */
if(window.ZC&&ZC.fromSearch){var fs0=ZC.fromSearch;ZC.fromSearch=function(){var f=fs0.apply(ZC,arguments);window.__v6link=f;return f}}
if(typeof friendFromUrl==='function'){var ff0=friendFromUrl;friendFromUrl=function(){window.__v6link=null;var r=ff0.apply(this,arguments),f=window.__v6link;
  if(r&&r.broken&&f&&((f.ok===false&&f.why==='retired')||(f.ok&&f.id&&PUZZLES[f.id]&&!VIS[f.id]))){
    setTimeout(function(){try{toast('That puzzle has moved on, so here is today’s puzzle.',3200)}catch(e){}},60);return null}
  return r}}
})();
