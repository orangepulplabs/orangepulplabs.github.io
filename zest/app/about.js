/* "About this game" panels, the research screen and the sources list. Plain facts only.
   Rules (from the sources review, 1 Nov 2026): say where a game comes from, say at most that researchers have used a classic task,
   and never say or imply that playing helps memory, focus, intelligence, schoolwork or health. Never name Mastermind, Countdown,
   Sudoku, Wordle, Tetris, Raven's or the Stroop Color and Word Test. Fields: from (true, playful, with the year), research (one careful
   sentence, only where the paper was verified; otherwise null), links (title + url). Links were fetched on 1 Nov 2026; Wikipedia pages are
   secondary sources: re-check before launch, and have a professional read the wording.  */
var ABOUT_NOCLAIM='Zest is for fun and for beating your own best. We do not claim it improves memory, focus, schoolwork or health.';
var ABOUT={
 'disc-tower':{from:'French mathematician Édouard Lucas published this in 1883 with a legend about monks moving 64 golden discs. Moving n discs takes at least 2ⁿ−1 moves.',research:null,links:[{t:'Tower of Hanoi',u:'https://en.wikipedia.org/wiki/Tower_of_Hanoi'}]},
 'slide-tiles':{from:'An early version is credited to Noyes Chapman around 1874. The "Gem Puzzle" became a craze in 1880. Half of all random boards cannot be solved, so Zest only deals boards that can.',research:null,links:[{t:'15 puzzle',u:'https://en.wikipedia.org/wiki/15_puzzle'}]},
 'few-swaps':{from:'Sorting by swapping is an old idea in mathematics. Zest tells you the fewest swaps that would do it.',research:null,links:[]},
 'make-target':{from:'Reaching a target number from a handful of others is a classic arithmetic puzzle, and a staple of TV game shows since the 1960s.',research:null,links:[]},
 'digit-span':{from:'Remembering a string of digits was one of the first memory tests, described by J. Jacobs in 1887.',research:'Psychologists have used digit tasks like this to study short-term memory.',links:[{t:'Digit span',u:'https://en.wikipedia.org/wiki/Digit_span'}]},
 'tilt-run':{from:'Slide-until-you-hit-something puzzles are a broad genre. Zest finds the shortest route for every board.',research:null,links:[]},
 'four-by-four':{from:'Grids where every row and column holds each symbol once are called Latin squares. Leonhard Euler wrote the first general theory in 1782.',research:null,links:[{t:'Latin square',u:'https://en.wikipedia.org/wiki/Latin_square'}]},
 'zero-one':{from:'Binary grid puzzles, where no three in a row can match, appeared in the 2000s. Zest checks that every board has exactly one answer.',research:null,links:[{t:'Takuzu',u:'https://en.wikipedia.org/wiki/Takuzu'}]},
 'code-cracker':{from:'Guessing a hidden code from feedback descends from the old pencil game Bulls and Cows. In 1976 Donald Knuth showed a four-peg, six-colour code can always be cracked in five guesses.',research:null,links:[{t:'Bulls and Cows',u:'https://en.wikipedia.org/wiki/Bulls_and_Cows'}]},
 'tube-sort':{from:'Sorting colours between tubes became popular on phones in recent years. Zest builds every board backwards from a solved one, so each can be finished.',research:null,links:[]},
 'scramble':{from:'Anagrams are one of the oldest word games, with no single inventor.',research:null,links:[]},
 'word-steps':{from:'Lewis Carroll invented this as "Doublets" at Christmas 1877 and published it in 1879. Change one letter at a time to get from one word to another.',research:null,links:[{t:'Word ladder',u:'https://en.wikipedia.org/wiki/Word_ladder'}]},
 'timing':{from:'Tapping at the instant something arrives is a very old kind of reaction game.',research:null,links:[]},
 'speed':{from:'Spotting something shown for a split second is a staple of how scientists study seeing.',research:null,links:[]},
 'hold':{from:'Respond to some things and hold back on others: researchers call it a go/no-go task.',research:'Psychologists have used go/no-go tasks to study how people stop a response.',links:[{t:'Verbruggen & Logan, 2008',u:'https://doi.org/10.1037/a0013170'}]},
 'switch':{from:'Changing the rule between rounds is a classic setup for studying task switching.',research:'Researchers have used tasks like this to study the cost of switching between tasks.',links:[{t:'Rogers & Monsell, 1995',u:'https://doi.org/10.1037/0096-3445.124.2.207'},{t:'Monsell, 2003',u:'https://doi.org/10.1016/S1364-6613(03)00028-7'}]},
 'span':{from:'A block-tapping task from the early 1970s is the inspiration: watch the blocks light up, then repeat the order.',research:'Researchers have used tasks like this to study short-term memory for locations.',links:[{t:'Corsi block-tapping test',u:'https://en.wikipedia.org/wiki/Corsi_block-tapping_test'}]},
 'nback':{from:'Is this the same as the one from a few steps back? Wayne Kirchner introduced the n-back task in 1958.',research:'Researchers use it to study working memory, and whether practice helps beyond the task is debated.',links:[{t:'Kirchner, 1958',u:'https://doi.org/10.1037/h0043688'}]},
 'flanker':{from:'Barbara and Charles Eriksen described this task in 1974: name the middle arrow while others around it point the other way.',research:'Researchers have used it to study how people deal with distracting information.',links:[{t:'Eriksen & Eriksen, 1974',u:'https://doi.org/10.3758/BF03203267'}]},
 'stroop':{from:'Named for John Ridley Stroop, who described colour-word interference in 1935. It is one of the most-studied tasks in psychology.',research:'Researchers have used it to study how people handle conflicting information. Zest’s version is for fun, not a test.',links:[{t:'Stroop, 1935',u:'https://doi.org/10.1037/h0054651'},{t:'MacLeod, 1991 (review)',u:'https://doi.org/10.1037/0033-2909.109.2.163'}]},
 'math':{from:'Quick sums are as old as school. Zest only asks for small ones.',research:null,links:[]},
 'pattern':{from:'Completing a pattern is one of the oldest puzzle ideas. Zest makes up its own each time.',research:null,links:[]},
 'search':{from:'Finding one thing among many is a classic task in the study of attention.',research:'Researchers have used visual search tasks to study attention.',links:[{t:'Treisman & Gelade, 1980',u:'https://doi.org/10.1016/0010-0285(80)90005-5'}]},
 'change':{from:'Spotting what changed between two pictures is called a flicker task in the lab.',research:'Researchers have used it to study how people notice changes in a scene.',links:[{t:'Rensink, O’Regan & Clark, 1997',u:'https://doi.org/10.1111/j.1467-9280.1997.tb00427.x'}]},
 'space':{from:'In 1971 Roger Shepard and Jacqueline Metzler asked people whether two 3D shapes matched, and found the time went up with the angle. Zest draws its own shapes.',research:'Researchers still use mental rotation tasks.',links:[{t:'Shepard & Metzler, 1971',u:'https://doi.org/10.1126/science.171.3972.701'}]},
 'trail':{from:'Joining dots in order is inspired by a paper-and-pencil task from the 1940s. Zest’s version is a game, not a test, and tells you nothing about your health.',research:null,links:[]},
 'match':{from:'Finding matching pairs is an old card game, often called Concentration.',research:null,links:[]}
};
/* the one screen about evidence: honest, kind, no claim */
var RESEARCH_TEXT='Zest is for fun, and for beating your own best. Psychologists have studied games like these for over a century. One finding is solid: practising a game makes you better at that game. Whether that carries over to other skills, or to everyday life, is still debated, and large reviews have mostly not found that it does. So Zest makes no promise about memory, focus, school or health. Play because it is satisfying, and watch your own numbers. Zest is not a medical or diagnostic tool. The stories and sources in Zest are to the best of our knowledge and can be wrong. If you spot a mistake, use Report a mistake and we will look into it.';
var SOURCES=[
 {g:'What the evidence says',items:[
  {t:'Simons et al. (2016), Do brain-training programs work?',u:'https://doi.org/10.1177/1529100616661983'},
  {t:'Owen et al. (2010), Putting brain training to the test',u:'https://doi.org/10.1038/nature09042'},
  {t:'Melby-Lervåg, Redick & Hulme (2016), Working memory training',u:'https://doi.org/10.1177/1745691616635612'},
  {t:'Sala & Gobet (2019), Cognitive training does not enhance general cognition',u:'https://doi.org/10.1016/j.tics.2018.10.004'}]},
 {g:'Tasks used in research',items:[
  {t:'Stroop (1935)',u:'https://doi.org/10.1037/h0054651'},{t:'Eriksen & Eriksen (1974)',u:'https://doi.org/10.3758/BF03203267'},
  {t:'Kirchner (1958)',u:'https://doi.org/10.1037/h0043688'},{t:'Shepard & Metzler (1971)',u:'https://doi.org/10.1126/science.171.3972.701'},
  {t:'Treisman & Gelade (1980)',u:'https://doi.org/10.1016/0010-0285(80)90005-5'},{t:'Rensink, O’Regan & Clark (1997)',u:'https://doi.org/10.1111/j.1467-9280.1997.tb00427.x'},
  {t:'Rogers & Monsell (1995)',u:'https://doi.org/10.1037/0096-3445.124.2.207'},{t:'Verbruggen & Logan (2008)',u:'https://doi.org/10.1037/a0013170'}]}
];
var SOURCES_NOTE='This list is not exhaustive. Links last checked 1 Nov 2026.';
