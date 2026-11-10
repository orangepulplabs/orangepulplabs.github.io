/* v6 daily rotation fix (integration, 4 Nov 2026). Loaded after curate6.js, before ../v5/boot.js. Pure: no DOM.
   v5's dailyCycle moves the last 30 puzzles of the previous cycle to the end of the next one, so nothing repeats across the seam.
   With the curated v6 pool (13 puzzles) every puzzle is in that "last 30", the guard does nothing, and the same puzzle could be the
   daily two days running (it happened: tube-sort on 13 and 14 Jan). Here the guard moves the last half of the previous cycle instead,
   so a daily never comes back within a week, for any pool size. Same seeds as v5, so a pool of 60+ behaves exactly as before. */
(function(){
var C={};
dailyCycle=function(c,pool){var k=c+'|'+pool.length+'|v6';if(C[k])return C[k];var o=pzShuffle(pool,pzRng('v5cycle|'+c));
  if(c>0){var w=Math.min(30,Math.floor(pool.length/2)),tail=dailyCycle(c-1,pool).slice(-w);o=o.filter(function(id){return tail.indexOf(id)<0}).concat(o.filter(function(id){return tail.indexOf(id)>=0}))}
  return C[k]=o};
})();
/* 1.2.6 (8 Nov 2026): the 14 new puzzles join the daily rotation without changing any day before DAILY_LATE_FROM.
   v5's dailyFor picks day n from a shuffle of the whole pool, so adding ids would change every past daily (Almanac past days, the
   streak record's "Zest #n", friend links) and today's. Instead the pool of 1.2.5 (24 ids) keeps its exact order until the first
   cycle boundary of that pool on or after DAILY_LATE_FROM (2026-12-01 -> cycle 14 starts 2026-12-03), and from there on the full pool
   (old ids + V6_DAILY_LATE) runs its own cycles, seeded 'v6late|c', with the same "last half of the previous cycle goes to the end"
   guard across the seam. Days before the boundary are byte-for-byte the 1.2.5 dailies. ~/dev/site-gen.py reads both constants. */
(function(){
var LATE=window.V6_DAILY_LATE=['sun-mirrors','crate-push','picture-rows','gear-train','lucas-tower','pancake-flip','bezzel-queens','quilt-tiles','shunting-yard','huarong-pass','reversi-flip','aqueduct','rolling-die','rect-cut'];
var FROM=window.V6_DAILY_LATE_FROM='2026-12-01',C={};
function split(){var all=v5DailyPool();return {old:all.filter(function(id){return LATE.indexOf(id)<0}),all:all.filter(function(id){return LATE.indexOf(id)<0}).concat(LATE.filter(function(id){return all.indexOf(id)>=0}))}}
function start(L){var f=Math.max(0,daysBetween(DAY0,FROM));return Math.ceil(f/L)*L}   /* first day index of the new rotation */
function lateCycle(c,pool,old,b){var k=c+'|'+pool.length+'|'+old.length;if(C[k])return C[k];var o=pzShuffle(pool,pzRng('v6late|'+c)),w=Math.min(30,Math.floor(pool.length/2));
  var tail=(c>0?lateCycle(c-1,pool,old,b):dailyCycle(b/old.length-1,old)).slice(-w);
  o=o.filter(function(id){return tail.indexOf(id)<0}).concat(o.filter(function(id){return tail.indexOf(id)>=0}));return C[k]=o}
window.v6DailyId=function(n){var s=split(),L=s.old.length;if(!L)return null;var b=start(L);
  if(n<b||s.all.length===L)return dailyCycle(Math.floor(n/L),s.old)[n%L];
  var m=n-b,N=s.all.length;return lateCycle(Math.floor(m/N),s.all,s.old,b)[m%N]};
dailyFor=function(day,solvedCount){var n=Math.max(0,daysBetween(DAY0,day)),id=v6DailyId(n);
  var lv=1+Math.floor(pzRng('v5lv|'+day)()*5);if((solvedCount|0)<3)lv=1;   /* as v5: new players get level 1 */
  lv=Math.min(lv,(P(id)||{levels:30}).levels);return {id:id,level:lv,day:day,no:n+1}};
})();
