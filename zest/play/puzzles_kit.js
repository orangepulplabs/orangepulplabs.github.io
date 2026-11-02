/* Zest puzzle kit: the contract every new puzzle follows, plus small helpers. Loaded after app4c.js and before app4b.js.

   registerPuzzle({
     id:'slide-tiles', name:'Slide Tiles', family:'move',          // family: grid | move | number | word | memory (browse chips)
     blurb:'Slide numbered tiles into order.', how:'Tap a tile next to the gap to slide it. Put 1 to 8 in order.',
     areas:['shapes','holdback'],                                    // the six skill areas it leans on (recommender only)
     levels:30,                                                      // number of ladder levels, easy to hard
     secs:90,                                                        // typical seconds per level, for the 'about N min' label
     make(level, rng){ ... return {title:'Level 7', par:21, ...state} },   // deterministic from rng, always solvable, par from a solver
     mount(root, inst, api){ ... return {undo(),hint(n),restart(),destroy()} },
     stars(res, inst){ return {stars:0..3, line:'You solved it in 23 moves. The shortest is 21.'} }
   })

   api passed to mount(): { done(res), moved(), say(text), zen, rm, now() }
     done(res): call once when solved: res = {solved:true, moves, hints, undos, extra:{}}  (the runner adds secs and stars)
     moved(): call for every counted move (the runner shows the count)
     say(text): announce to screen readers (live region)
     zen: true = untimed, no score saved (never show a clock yourself; the runner owns the clock)
     rm: true = reduce motion (no animation that carries information)
   mount() rules: every tappable thing is a real <button> (min 48px hit area) with an accessible name; keyboard works;
     never use colour alone; no text that claims anything about the brain; plain, kind wording; re-render cheaply (low-end Android);
     hint(n) returns a short sentence for hint level n=1 (where), 2 (what), 3 (show the move; may also perform it) or null when none.
   Persisted by the runner: db().st.pz[id] = {lvl:highest level reached, best:{level:{moves,secs,stars}}}.  */
var PUZZLES={},PUZZLE_ORDER=[];
function registerPuzzle(d){
  ['id','name','family','blurb','how','areas','levels','make','mount','stars'].forEach(function(k){if(d[k]===undefined)throw new Error('puzzle '+(d.id||'?')+' needs '+k)});
  d.secs=d.secs||90;if(!PUZZLES[d.id])PUZZLE_ORDER.push(d.id);PUZZLES[d.id]=d;return d}
/* string seed -> function returning [0,1): xmur3 hash + mulberry32. Same seed gives the same puzzle on every device. */
function pzRng(seed){var h=1779033703^seed.length;for(var i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  var a=(function(){h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return(h^=h>>>16)>>>0})();
  return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function pzSeed(id,level,tag){return id+'|'+level+'|'+(tag||'')}
function pzInt(rng,n){return Math.floor(rng()*n)}
function pzShuffle(a,rng){a=a.slice();for(var i=a.length-1;i>0;i--){var j=pzInt(rng,i+1),t=a[i];a[i]=a[j];a[j]=t}return a}
function pzEl(tag,attrs,kids){var e=document.createElement(tag);attrs=attrs||{};Object.keys(attrs).forEach(function(k){if(k==='text')e.textContent=attrs[k];else if(k==='class')e.className=attrs[k];else if(k.slice(0,2)==='on')e[k]=attrs[k];else e.setAttribute(k,attrs[k])});(kids||[]).forEach(function(c){e.appendChild(typeof c==='string'?document.createTextNode(c):c)});return e}
/* a real button with a 48px hit area; label is the accessible name */
function pzBtn(label,onclick,attrs){attrs=attrs||{};attrs.type='button';attrs['aria-label']=attrs['aria-label']||label;attrs.onclick=onclick;attrs.class=('pzb '+(attrs.class||'')).trim();if(attrs.text===undefined)attrs.text=label;return pzEl('button',attrs)}
/* default 3-star rule: 3 at par, 2 within 25% over, 1 solved; a hint costs a star's worth of 'no hints' only on the top star */
function pzStarsByPar(moves,par,hints){var s=moves<=par?3:moves<=Math.ceil(par*1.25)?2:1;if(hints&&s===3)s=2;return s}
