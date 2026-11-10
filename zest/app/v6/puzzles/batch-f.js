/* v6 batch f loader (new puzzles, builder B, 7 Nov 2026). An id goes into DONE only when puzzles/<id>.js passes the SEAL bar (34+, played).
   GALLERY entries: {id, before, after, verdict}; these are NEW puzzles, so 'before' is null. Loaded synchronously after batch-d.js.
   Story, card art and goal lines for these ids are in puzzles/batch-f-data.js (load it after teach.js, see the file head).
   Test hook: ?tf=id1,id2 loads not-yet-DONE puzzles of batch f for testing. Paths are taken from this script's own URL, so a test page
   in another folder can load it too. */
(function(){var DONE=['pancake-flip','bezzel-queens','quilt-tiles','shunting-yard','huarong-pass'];
var GALLERY=[{id:'pancake-flip',before:'new',after:35,verdict:'PASS (new, 30 levels): Next 0.8 s; clarity needs the L1 spatula demo once'},{id:'bezzel-queens',before:21,after:34,verdict:'PASS (new core for eight-safe-queens, 30 levels): borderline; the board is full-bleed at 320 px on 7x7'},{id:'quilt-tiles',before:'new',after:34,verdict:'PASS (new, 30 levels): borderline; aha 3, a careful corners-first method carries far'},{id:'shunting-yard',before:'new',after:35,verdict:'PASS (new, 30 levels): two tap meanings still lean on the L1 two-step demo'},{id:'huarong-pass',before:'new',after:34,verdict:'PASS (new, 29 levels): borderline; top levels (par 28-35) run past 2 minutes'}];
var MINE=['pancake-flip','huarong-pass','quilt-tiles','bezzel-queens','shunting-yard'];
var tf=(location.search.match(/[?&]tf=([^&]*)/)||[])[1];if(tf)tf.split(',').forEach(function(id){if(id&&MINE.indexOf(id)>=0&&DONE.indexOf(id)<0)DONE.push(id)});
window.V6_GALLERY_EXTRA=(window.V6_GALLERY_EXTRA||[]).concat(GALLERY);
var me=document.currentScript&&document.currentScript.src||'',base=me?me.replace(/batch-f\.js(\?.*)?$/,''):'puzzles/';
DONE.forEach(function(id){document.write('<script src="'+base+id+'.js"><\/script>')});})();
