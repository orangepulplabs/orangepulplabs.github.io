/* v6 batch g loader (new puzzles, builder C, 7 Nov 2026). An id is appended to DONE only when puzzles/<id>.js passes the SEAL bar (34+/40, by play).
   GALLERY entries: {id, before, after, verdict}; these puzzles are new, so before is null. Loaded synchronously (index.html, after batch-d.js),
   plus batch-g-data.js right after teach.js (stories, art, goal lines; see Docs/v6/batch-g.md "What the integrator wires"). Test hook: ?gx=id loads a
   puzzle of this batch that is not (yet) in DONE, for re-scoring. */
(function(){var DONE=['reversi-flip','aqueduct','rolling-die','rect-cut'];
var GALLERY=[{id:'reversi-flip',before:null,after:35,verdict:'PASS (35): placements are few (k 1-5), so early levels are short'},
 {id:'aqueduct',before:null,after:35,verdict:'PASS (35): live water lets a player fiddle locally; the ring rule is what the late levels need'},
 {id:'rolling-die',before:null,after:34,verdict:'PASS (34): the sun on the far side shows only as a glow; 7x7 tilted board is small at 320 px'},
 {id:'rect-cut',before:null,after:34,verdict:'PASS (34): the goal needs the goal line or the demo; a thin story (the publisher, not a legend)'}];
var MINE=['reversi-flip','aqueduct','rolling-die','knight-swap','rect-cut'];var gx=(location.search.match(/[?&]gx=([^&]*)/)||[])[1];if(gx)gx.split(',').forEach(function(id){if(id&&MINE.indexOf(id)>=0&&DONE.indexOf(id)<0)DONE.push(id)});
window.V6_GALLERY_EXTRA=(window.V6_GALLERY_EXTRA||[]).concat(GALLERY);
var me=(document.currentScript&&document.currentScript.src)||'puzzles/batch-g.js',dir=me.slice(0,me.lastIndexOf('/')+1);   /* resolve next to this file, so a test page elsewhere loads the same files */
DONE.forEach(function(id){document.write('<script src="'+dir+id+'.js"><\/script>')});})();
