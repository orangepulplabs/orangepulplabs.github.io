/* v6 batch e loader (new puzzles, builder A, 7 Nov 2026): sun-mirrors, crate-push, picture-rows, gear-train, lucas-tower.
   An id is in DONE only when puzzles/<id>.js is complete, passes its tests and scored 34+ against bar.md (Docs/v6/batch-e.md).
   GALLERY entries: {id, before, after, verdict} (before: null, these are new puzzles). batch-e-data.js holds each id's story, card art, goal line,
   Rules steps, chapter and nudge verb, for the integrator to wire (index.html loads this file after batch-d.js).
   Test hook: ?te=id1,id2 loads not-yet-DONE puzzles of this batch. */
(function(){var DONE=['sun-mirrors','crate-push','picture-rows','gear-train','lucas-tower'];   /* builder scores 7 Nov 2026 (Docs/v6/batch-e.md); three are borderline 34s */
var GALLERY=[{id:'sun-mirrors',before:null,after:35,verdict:'PASS (35): aha, clarity and curve at 4; the beam explains the board'},
 {id:'crate-push',before:null,after:35,verdict:'PASS (35): generated rooms, aha 4; exact deferred stuck chip'},
 {id:'picture-rows',before:null,after:34,verdict:'PASS borderline (34): 37-38 px cells on 6-wide pictures at 320 px'},
 {id:'gear-train',before:null,after:34,verdict:'PASS borderline (34): clarity 3, speed ratio read from the ghost hand'},
 {id:'lucas-tower',before:null,after:34,verdict:'PASS borderline (34): aha 3, the same park-the-big-disc trick every level'}];
var MINE=['sun-mirrors','crate-push','picture-rows','gear-train','lucas-tower'];
var te=(location.search.match(/[?&]te=([^&]*)/)||[])[1];if(te)te.split(',').forEach(function(id){if(id&&MINE.indexOf(id)>=0&&DONE.indexOf(id)<0)DONE.push(id)});
window.V6_GALLERY_EXTRA=(window.V6_GALLERY_EXTRA||[]).concat(GALLERY);
document.write('<script src="puzzles/batch-e-data.js"><\/script>');
DONE.forEach(function(id){document.write('<script src="puzzles/'+id+'.js"><\/script>')});})();
