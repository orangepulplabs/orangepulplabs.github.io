/* Batch E (new puzzles, builder A, 7 Nov 2026): story, About entry, card art, chapter, goal line, Rules steps and nudge verb for each new id, in the
   shapes the existing ids use (ABOUT in about*.js, STORY in story_*.js, ART in art_*.js, PZ_THEME in families.js, ZT.T and VERB in teach.js).
   Loaded by puzzles/batch-e.js (before the story_* and teach files). It fills ABOUT, STORY, ART and PZ_THEME directly, and adds the goal line and Rules
   to ZT.T once teach.js has loaded. The nudge verbs (VERB in teach.js is private) are listed in BE_DATA for the integrator to copy.
   Facts checked on 7 Nov 2026 against the linked pages; disputes are told as disputes. No claims about brains, health, IQ or school. */
(function(){
var S='stroke="#1B1916" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
var D=window.BE_DATA={
 'sun-mirrors':{theme:'F7',verb:'Try tapping here',
  goal:'Bounce sunlight through every tower',
  rules:['Tap a mirror to turn it.','The light bounces off mirrors and passes through towers.','Light every tower, and keep the light off the camp.'],
  about:{from:'Henry Christopher Mance of the Persian Gulf Telegraph Department developed the first widely accepted heliograph, a sun mirror that flashes Morse code, about 1869 while stationed in Karachi. It was first used in war in 1877. The boards in Zest are original.',research:null,
   links:[{t:'Wikipedia: Heliograph',u:'https://en.wikipedia.org/wiki/Heliograph'},{t:'Wikipedia: Henry Christopher Mance',u:'https://en.wikipedia.org/wiki/Henry_Christopher_Mance'}]},
  story:{paras:['Picture a hilltop in the 1870s. A soldier tilts a small mirror and a flash of sunlight jumps to another hill miles away. Short and long flashes spell out Morse code, with no wire at all.',
   'That mirror is a heliograph. Henry Christopher Mance, who worked for the British Government’s Persian Gulf Telegraph Department, developed the first widely accepted one about 1869 while stationed in Karachi. It was first used in war during the Jowaki Afridi expedition of 1877.',
   'A flash is only useful if the right people see it. In Sun Mirrors you turn the mirrors so the light reaches every signal tower, and never the camp.'],
   fact:'A heliograph flash was tested over 35 miles in India.',
   links:[{t:'Wikipedia: Heliograph',u:'https://en.wikipedia.org/wiki/Heliograph'},{t:'Wikipedia: Henry Christopher Mance',u:'https://en.wikipedia.org/wiki/Henry_Christopher_Mance'}]},
  art:{hook:'Turn the mirrors so the sunlight reaches every tower.',
   tile:'<svg viewBox="0 0 120 120"><rect x="10" y="10" width="100" height="100" rx="10" fill="#F1E3C4" '+S+'/><circle cx="30" cy="90" r="11" fill="#FFC23A" '+S+'/><path d="M30 90H78V36" fill="none" stroke="#E08A00" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 90H78V36" fill="none" stroke="#FFF6D8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M68 100L88 80" stroke="#7F8F9C" stroke-width="7" stroke-linecap="round"/><circle cx="78" cy="30" r="8" fill="#FFD34E" '+S+'/></svg>',
   hero:'<svg viewBox="0 0 340 200"><rect x="16" y="16" width="308" height="168" rx="12" fill="#F1E3C4" '+S+'/><circle cx="56" cy="146" r="18" fill="#FFC23A" '+S+'/><path d="M56 146H170V62H272" fill="none" stroke="#E08A00" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M56 146H170V62H272" fill="none" stroke="#FFF6D8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M154 162L186 130M154 46L186 78" stroke="#7F8F9C" stroke-width="9" stroke-linecap="round"/><circle cx="272" cy="56" r="12" fill="#FFD34E" '+S+'/><path d="M262 92L272 70L282 92" fill="none" '+S+'/><path d="M228 160L248 128L268 160Z" fill="#7A4A5E" '+S+'/></svg>'}},
 'crate-push':{theme:'F8',verb:'Try swiping from here',
  goal:'Push every crate onto a spot',
  rules:['Swipe to walk, or tap a square to walk there.','Walk into a crate to push it. Crates never pull back.','Get every crate onto a glowing spot.'],
  about:{from:'Hiroyuki Imabayashi made the first warehouse-keeper pushing game in 1981 as a hobby project on an NEC PC-8001, and its first commercial version came from his company Thinking Rabbit in Japan in 1982 (some sources give 1983). The genre has spread far since. The rooms, art and name in Zest are original.',research:null,
   links:[{t:'Wikipedia: Sokoban',u:'https://en.wikipedia.org/wiki/Sokoban'}]},
  story:{paras:['In 1981 Hiroyuki Imabayashi, in Japan, wrote a small game for his NEC PC-8001 home computer as a hobby. A warehouse keeper walks around a room and pushes crates onto marked spots. He can push, but never pull.',
   'The game sold commercially from 1982, through Thinking Rabbit, the company he founded to publish it. The dates vary a little between sources, and some give 1983. Pushing puzzles have been a whole genre ever since, with players and researchers designing rooms of their own.',
   'Crate Push uses rooms made for Zest. A crate pushed into a corner can never come out, so look ahead before every push.'],
   fact:'The first pushing game was written for an NEC PC-8001 in 1981.',
   links:[{t:'Wikipedia: Sokoban',u:'https://en.wikipedia.org/wiki/Sokoban'}]},
  art:{hook:'Push every crate onto a spot. Crates never pull back.',
   tile:'<svg viewBox="0 0 120 120"><rect x="10" y="10" width="100" height="100" rx="10" fill="#EDE6D8" '+S+'/><rect x="20" y="20" width="24" height="80" rx="4" fill="#7D6E60" '+S+'/><rect x="58" y="46" width="28" height="28" rx="4" fill="#D9A35E" '+S+'/><path d="M62 50L82 70M82 50L62 70" stroke="#6E4419" stroke-width="3"/><circle cx="72" cy="94" r="7" fill="none" stroke="#E9A23B" stroke-width="4" stroke-dasharray="4 3"/><circle cx="72" cy="28" r="9" fill="#E8590C" '+S+'/></svg>',
   hero:'<svg viewBox="0 0 340 200"><rect x="16" y="16" width="308" height="168" rx="12" fill="#EDE6D8" '+S+'/><rect x="30" y="30" width="44" height="140" rx="6" fill="#7D6E60" '+S+'/><rect x="132" y="72" width="52" height="52" rx="6" fill="#D9A35E" '+S+'/><path d="M140 80L176 116M176 80L140 116" stroke="#6E4419" stroke-width="4"/><rect x="214" y="72" width="52" height="52" rx="6" fill="#D9A35E" '+S+'/><path d="M222 80L258 116M258 80L222 116" stroke="#6E4419" stroke-width="4"/><circle cx="158" cy="156" r="12" fill="none" stroke="#E9A23B" stroke-width="5" stroke-dasharray="6 4"/><circle cx="290" cy="98" r="12" fill="none" stroke="#E9A23B" stroke-width="5" stroke-dasharray="6 4"/><circle cx="104" cy="98" r="16" fill="#E8590C" '+S+'/></svg>'}},
 'picture-rows':{theme:'F10',verb:'Try dragging from here',
  goal:'Reveal the picture from the number clues',
  rules:['The numbers are the runs of filled squares in that row or column, in order.','Drag along a row or column to fill. Use the cross for squares that stay empty.','Match every clue and the picture appears.'],
  about:{from:'In 1987 the Tokyo graphics editor Non Ishida won a competition with pictures made by lighting skyscraper windows, and turned the idea into grid puzzles. The puzzle maker Tetsuya Nishio came up with the same kind of puzzle on his own. James Dalgety named them nonograms, and The Sunday Telegraph ran them weekly from 1990. The pictures in Zest are original.',research:null,
   links:[{t:'Wikipedia: Nonogram',u:'https://en.wikipedia.org/wiki/Nonogram'}]},
  story:{paras:['In 1987 Non Ishida, a graphics editor in Tokyo, won a competition with pictures made by switching skyscraper windows on and off. A picture made of lit and dark squares gave her the idea for a puzzle.',
   'She published the first ones in 1988. The puzzle maker Tetsuya Nishio arrived at the same idea on his own, in a different magazine. In Britain, the collector James Dalgety named them nonograms, and The Sunday Telegraph printed one every week from 1990.',
   'Every picture in Picture Rows was drawn for Zest, and each one can be worked out line by line, with no guessing.'],
   fact:'The idea began with pictures made from lit skyscraper windows.',
   links:[{t:'Wikipedia: Nonogram',u:'https://en.wikipedia.org/wiki/Nonogram'}]},
  art:{hook:'The numbers tell you the runs. Fill them in and a picture appears.',
   tile:'<svg viewBox="0 0 120 120"><rect x="10" y="10" width="100" height="100" rx="10" fill="#FBF8F1" '+S+'/><g fill="#E5484D"><rect x="40" y="34" width="12" height="12"/><rect x="68" y="34" width="12" height="12"/><rect x="34" y="48" width="52" height="12"/><rect x="34" y="62" width="52" height="12"/><rect x="46" y="76" width="28" height="12"/><rect x="54" y="90" width="12" height="10"/></g><path d="M18 26H102" stroke="#1B1916" stroke-width="3"/></svg>',
   hero:'<svg viewBox="0 0 340 200"><rect x="16" y="16" width="308" height="168" rx="12" fill="#FBF8F1" '+S+'/><g font-family="sans-serif" font-weight="800" font-size="18" fill="#3B352D"><text x="40" y="74">1 1</text><text x="52" y="102">5</text><text x="52" y="130">3</text></g><g fill="#E5484D"><rect x="136" y="52" width="22" height="22"/><rect x="184" y="52" width="22" height="22"/><rect x="112" y="80" width="118" height="22"/><rect x="136" y="108" width="70" height="22"/><rect x="160" y="136" width="22" height="22"/></g></svg>'}},
 'gear-train':{theme:'F8',verb:'Try dragging this',
  goal:'Make each dial turn like its ghost hand',
  rules:['Drag a gear from the tray onto a peg.','Gears that touch turn opposite ways; smaller gears turn faster.','Make every dial turn the way and speed its ghost hand shows.'],
  about:{from:'In 1900 and 1901 sponge divers from Symi recovered a corroded bronze device from a Roman-era shipwreck off the island of Antikythera. It held at least 30 meshing gears that modelled the movements of the Sun and Moon. Estimates of its date range from about 205 to 87 BC. Derek de Solla Price studied it with X-ray images and published Gears from the Greeks in 1974. The puzzles in Zest are original.',research:null,
   links:[{t:'Wikipedia: Antikythera mechanism',u:'https://en.wikipedia.org/wiki/Antikythera_mechanism'}]},
  story:{paras:['In 1900 sponge divers from the island of Symi found an ancient shipwreck off Antikythera, in Greece. Among the finds brought up in 1901 was a lump of corroded bronze that nobody looked at closely for months.',
   'Inside were gears: at least 30 of them, meshing like a clock’s, built to show the Sun, the Moon and eclipse cycles. Estimates of its age range from about 205 to 87 BC. The historian Derek de Solla Price studied it with X-ray images and published Gears from the Greeks in 1974.',
   'In Gear Train every mesh flips the turn and every small gear speeds it up. Count carefully, and the dial turns true.'],
   fact:'The Antikythera mechanism’s largest gear had about 223 teeth.',
   links:[{t:'Wikipedia: Antikythera mechanism',u:'https://en.wikipedia.org/wiki/Antikythera_mechanism'}]},
  art:{hook:'Place gears so every dial turns the right way at the right speed.',
   tile:'<svg viewBox="0 0 120 120"><rect x="10" y="10" width="100" height="100" rx="10" fill="#EFE7D8" '+S+'/><circle cx="44" cy="56" r="22" fill="#F2C14E" '+S+' stroke-dasharray="7 4"/><circle cx="44" cy="56" r="5" fill="#C48A16" '+S+'/><circle cx="80" cy="80" r="15" fill="#C9CFD6" '+S+' stroke-dasharray="6 3"/><circle cx="80" cy="80" r="4" fill="#8E99A6" '+S+'/><path d="M80 34V22M74 27L80 22L86 27" fill="none" stroke="#E8590C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
   hero:'<svg viewBox="0 0 340 200"><rect x="16" y="16" width="308" height="168" rx="12" fill="#EFE7D8" '+S+'/><circle cx="100" cy="100" r="44" fill="#F2C14E" '+S+' stroke-dasharray="10 6"/><circle cx="100" cy="100" r="9" fill="#C48A16" '+S+'/><circle cx="178" cy="100" r="30" fill="#C9CFD6" '+S+' stroke-dasharray="8 5"/><circle cx="178" cy="100" r="7" fill="#8E99A6" '+S+'/><circle cx="246" cy="100" r="34" fill="#FBF8F1" '+S+'/><path d="M246 100V74" stroke="#1B1916" stroke-width="5" stroke-linecap="round"/><path d="M246 100L268 88" stroke="#E8590C" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 4"/></svg>'}},
 'lucas-tower':{theme:'F10',verb:'Try dragging this',
  goal:'Restack the discs to match the target',
  rules:['Drag the top disc of a peg onto another peg.','Never put a bigger disc on a smaller one.','Match the target shown above the board.'],
  about:{from:'Édouard Lucas published the disc tower puzzle in Paris in 1883 under the name N. Claus de Siam, an anagram of Lucas d’Amiens, with an invented legend of priests moving 64 golden discs. Henry Dudeney’s The Canterbury Puzzles (1907) opened with the Reve’s Puzzle, the same idea with four stools. Zest starts from mixed positions instead of one full tower.',research:null,
   links:[{t:'MacTutor: The Tower of Hanoi',u:'https://mathshistory.st-andrews.ac.uk/Extras/Hanoi/'},{t:'Project Gutenberg: The Canterbury Puzzles',u:'https://www.gutenberg.org/ebooks/27635'}]},
  story:{paras:['In 1883 a puzzle went on sale in Paris: a stack of discs on one of three pegs, with a legend about priests who move 64 golden discs, one at a time, never a large one on a small one. When they finish, the story said, the world would end.',
   'The inventor’s name on the box, N. Claus de Siam, was an anagram of Lucas d’Amiens. It was the mathematician Édouard Lucas. In 1907 Henry Dudeney opened The Canterbury Puzzles with the Reve’s Puzzle, the same game played with cheeses on four stools, where the best plan is much harder to see.',
   'Lucas Tower starts from mixed positions, so the usual recipe does not work. The fewest moves often need a disc to wait somewhere unexpected first.'],
   fact:'Moving 64 discs takes at least 2⁶⁴ − 1 moves.',
   links:[{t:'MacTutor: The Tower of Hanoi',u:'https://mathshistory.st-andrews.ac.uk/Extras/Hanoi/'},{t:'Project Gutenberg: The Canterbury Puzzles',u:'https://www.gutenberg.org/ebooks/27635'}]},
  art:{hook:'Move one disc at a time, never big on small, to match the target.',
   tile:'<svg viewBox="0 0 120 120"><rect x="10" y="10" width="100" height="100" rx="10" fill="#F4EEE2" '+S+'/><path d="M20 96H100" '+S+'/><path d="M36 96V40M60 96V40M84 96V40" stroke="#8A5A2E" stroke-width="5" stroke-linecap="round"/><rect x="22" y="80" width="28" height="12" rx="5" fill="#4F7FD9" '+S+'/><rect x="28" y="66" width="16" height="12" rx="5" fill="#F29E4C" '+S+'/><rect x="68" y="80" width="32" height="12" rx="5" fill="#2E9E95" '+S+'/></svg>',
   hero:'<svg viewBox="0 0 340 200"><rect x="16" y="16" width="308" height="168" rx="12" fill="#F4EEE2" '+S+'/><path d="M36 166H304" '+S+'/><path d="M90 166V60M170 166V60M250 166V60" stroke="#8A5A2E" stroke-width="7" stroke-linecap="round"/><rect x="50" y="142" width="80" height="18" rx="8" fill="#9B5BC4" '+S+'/><rect x="62" y="120" width="56" height="18" rx="8" fill="#EE6E5B" '+S+'/><rect x="140" y="142" width="60" height="18" rx="8" fill="#F29E4C" '+S+'/><rect x="230" y="98" width="40" height="18" rx="8" fill="#F6C445" '+S+'/></svg>'}}};
try{Object.keys(D).forEach(function(id){var d=D[id];
  if(typeof ABOUT!=='undefined'&&!ABOUT[id])ABOUT[id]=d.about;
  var st=window.STORY=window.STORY||{};if(!st[id])st[id]=d.story;
  var ar=window.ART=window.ART||{};if(!ar[id])ar[id]=d.art;
  if(typeof PZ_THEME!=='undefined'&&!PZ_THEME[id])PZ_THEME[id]=d.theme})}catch(e){}
/* goal line + Rules once teach.js is in */
function teach(){try{if(window.ZT&&ZT.T)Object.keys(D).forEach(function(id){if(!ZT.T[id])ZT.T[id]=[D[id].goal,D[id].rules]})}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',teach);else teach();
})();
