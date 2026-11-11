var STORY=window.STORY||{};
STORY['hold-the-interval']={paras:[
'In 1868 Karl von Vierordt, a German physiologist best known for his work on blood circulation, published a book on the time sense based on experiments. His listeners heard a short stretch of time and then tried to match it, so the question was simple: how close can a person come to a length of time they have just been given?',
'The answers showed a pattern. People’s copies of short intervals tended to run long, and their copies of long intervals tended to run short. Later researchers have used the effect to study how the length of an interval shapes over- and under-estimation, but the cause is still debated, and nobody has settled it.',
'Hold the Interval borrows that old test. Watch a light come on and go off, then hold the button for the same length of time and let go. It is a short game of patience, and each try tells you how close you came, so the next try can be a little better.'],
fact:'Vierordt’s 1868 book reported that short intervals ran long and long ones ran short.',
links:[{t:'Karl von Vierordt (Wikipedia)',u:'https://en.wikipedia.org/wiki/Karl_von_Vierordt'}]};
STORY['switch-off']={paras:[
'Some patterns on a 1995 handheld with 25 lights can never be switched off, and in 1998 two mathematicians proved it. The handheld was Tiger Electronics’ 5x5 grid of lights. When a game starts, some lights are on. Press a light and it switches, along with the four lights next to it. The goal is a dark board in as few presses as possible.',
'The idea had a famous ancestor. In 1978 Parker Brothers released Merlin, a handheld invented by former NASA employee Bob Doyle with his wife Holly and brother-in-law Wendl Thomis. It appeared with Simon on the cover of Newsweek’s 1978 Christmas issue, sold more than five million units, and included a game with similar rules on a 3x3 grid. Six inventors are named on the US patent for Tiger’s puzzle, granted in 1997.',
'Then the mathematicians arrived. In 1998 Marlow Anderson and Todd Feil used linear algebra, in a paper in Mathematics Magazine, to prove that not every pattern can be cleared, and that a board that can be cleared has exactly four solutions, if no light is pressed twice. Two simpler facts help any player: the order of presses doesn’t matter, and pressing a light twice is the same as not pressing it at all.',
'Later versions followed: a 6x6 board, a version with several colours, and a cube with six 3x3 faces. In 1997 Tiger also gave a cartridge of the game free with its Game.com console.',
'Switch Off has the same rules. Every board starts dark and is scrambled with random taps, so every board can be cleared. Turn every light off in as few taps as you can.'],
fact:'In 1980 Merlin was named America’s best-selling toy and game item, with 2.2 million sold.',
links:[{t:'Light-grid puzzle (Wikipedia)',u:'https://en.wikipedia.org/wiki/Lights_Out_(game)'},{t:'Merlin (Wikipedia)',u:'https://en.wikipedia.org/wiki/Merlin_(console)'},{t:'US patent 5,603,500 (Google Patents)',u:'https://patents.google.com/patent/US5603500A/en'}]};
STORY['jump-away']={paras:[
'The first known printed rules of peg solitaire appeared in August 1697, in the French magazine Mercure galant. A peg jumps over its neighbour into an empty hole, and the peg it jumped over is removed. The aim is to end with one peg.',
'The earliest evidence of the game leads to the court of Louis XIV. An engraving by Claude-Auguste Berey, dated 1697, shows Anne de Rohan-Chabot, Princess de Soubise, at a board with a peg in almost every hole.',
'Then the thinkers took it up. In 1710 Gottfried Leibniz wrote a description of the game for the Berlin Academy. Later analysis found its hidden walls. On the 37-hole French board, a game that starts with only the centre hole empty can’t be solved with straight jumps at all. On the 33-hole English board it can, and the shortest solution takes 18 moves, counting a chain of jumps by one peg as a single move.',
'A full analysis of the game appears in Winning Ways for your Mathematical Plays, by Elwyn Berlekamp, John Conway and Richard Guy.',
'Zest uses the French board of 37 holes. Every level is built by jumping backwards from one peg in the centre, so there is always a way to finish. Every game takes the same number of jumps, so the skill is in the order. Undo whenever you like.'],
fact:'Mercure galant printed sample problems along with the rules.',
links:[{t:'Peg Solitaire (Puzzle World)',u:'https://puzzleworld.org/PuzzleWorld/puz/peg_solitaire.htm'},{t:'Peg solitaire (Wikipedia)',u:'https://en.wikipedia.org/wiki/Peg_solitaire'}]};
STORY['circle-count']={paras:[
'Picture a ring of lanterns. You count round from the first one, and each time the count lands on your number, that lantern goes out. Then you count again from the next lit lantern, until only one is left. The question is which lantern will stay lit to the end.',
'The puzzle takes its name from Flavius Josephus, a first-century historian. Its form is set out in W. W. Rouse Ball’s Mathematical Recreations and Essays, published in 1892. In that book the survivor among 41 people, counting every third one, is position 31, and you can check that on paper.',
'Why do people still play it? Because the answer comes from the counting rule and nothing else. You can count the ring by hand or use a short formula, then check your choice by tapping. There is one right lantern each time, so every round is a fair question with a clear answer.'],
fact:'In a 1892 book, the survivor among 41 people counting every third is position 31.',
links:[{t:'Josephus problem (Wikipedia)',u:'https://en.wikipedia.org/wiki/Josephus_problem'}]};
STORY['magic-three']={paras:[
'Legend says a turtle rose from the Luo River in China, and on its shell was a 3x3 pattern of dots. The pattern came to be called the Lo Shu square. Every row, column and diagonal of it adds to 15.',
'The turtle is a legend, not a record. The square itself is much older than the game. Only one arrangement of the numbers 1 to 9 works, up to turning and flipping it, so there is one square to find.',
'Magic Three starts with some squares filled. You put the other numbers in, one from 1 to 9 in each square, so every line adds to 15. Each puzzle has exactly one answer, so each line you check tells you something true, and the shortest way is simply to fill what is left.'],
fact:'Legend says a turtle carried the 3x3 pattern on its shell; every line adds to 15.',
links:[{t:'Luoshu Square (Wikipedia)',u:'https://en.wikipedia.org/wiki/Luoshu_Square'}]};
