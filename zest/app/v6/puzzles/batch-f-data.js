/* Batch F (builder B, 7 Nov 2026): story, About entry, card art, chapter and teaching data for the new ids, in the shapes the existing ids use.
   The integrator loads this ONE file after teach.js and before ../v5/boot.js (e.g. right after curate6.js). It only ADDS keys:
   - ABOUT[id]  {from, research, links}         (as about_*.js)
   - STORY[id]  {paras[3], fact, links}         (as story_*.js)
   - ART[id]    {hook, tile (120x120 svg), hero (340x200 svg)}   (as art_*.js)
   - PZ_THEME[id] chapter (the puzzle defs also carry theme:)
   - ZT.T[id]   [goal line (8 words max), [3 rule steps]] and the nudge verb for drag puzzles (ZT.label is wrapped, teach.js is not edited)
   Facts were checked on 7 Nov 2026 (links in each entry); disputes are told as disputes. No brain, health, IQ or schoolwork claims.
   IDS lists the ids that are applied (the passes); data for cut ids, if any, stays in D unused. */
(function(){
var D={};
var K='stroke="#1B1916" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
function cake(x,y,w,h,f){return '<rect x="'+(x-w/2)+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(h/2)+'" fill="'+(f||'#F2B95A')+'"/>'}

D['pancake-flip']={
 about:{from:'Jacob E. Goodman posed the pancake problem in the American Mathematical Monthly in 1975 under the pen name Harry Dweighter ("harried waiter"). In 1979 Bill Gates and Christos Papadimitriou published Bounds for Sorting by Prefix Reversal, which also looked at pancakes with one burnt side.',research:null,
   links:[{t:'Pancake sorting (Wikipedia)',u:'https://en.wikipedia.org/wiki/Pancake_sorting'},{t:'Gates and Papadimitriou (1979), Discrete Mathematics 27',u:'https://doi.org/10.1016/0012-365X(79)90068-2'}]},
 story:{paras:[
  'In 1975 a problem appeared in the American Mathematical Monthly from a reader called Harry Dweighter, a pun on "harried waiter". The chef makes pancakes of all sizes, and the waiter, carrying them out, tidies the stack by flipping the top few over with a spatula. How many flips can it take? The real author was the geometer Jacob E. Goodman.',
  'In 1979 Bill Gates, then at Harvard, and Christos Papadimitriou, one of his teachers there, published a paper on it: Bounds for Sorting by Prefix Reversal. It is the only research paper Gates is known for. The same paper looked at pancakes burnt on one side, where every burnt side must end facing down.',
  'In Pancake Flip you slide the spatula under a pancake and the whole stack above it turns over. Bringing the biggest to the top and then down always works, but it is rarely the fewest. Flips keep neighbours together, so look for the flip that joins a pair.'],
  fact:'Bill Gates co-wrote one research paper, in 1979, and it was about flipping pancakes.',
  links:[{t:'Pancake sorting (Wikipedia)',u:'https://en.wikipedia.org/wiki/Pancake_sorting'},{t:'Gates and Papadimitriou (1979), Discrete Mathematics 27: 47-57',u:'https://doi.org/10.1016/0012-365X(79)90068-2'}]},
 art:{hook:'A waiter, a spatula and a messy stack. How few flips can do it?',
  tile:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g '+K+'><ellipse cx="60" cy="98" rx="46" ry="8" fill="#F7F4EE"/>'+cake(60,80,76,13)+cake(60,64,44,13)+cake(60,48,62,13)+cake(60,32,30,13)+'<path d="M96 52l18-10" stroke-width="6"/><path d="M70 60l26-8 3 7-26 8z" fill="#C9CDD1"/></g></svg>',
  hero:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 200"><g '+K+'><rect x="10" y="10" width="320" height="180" rx="22" fill="#E9D7B9"/><ellipse cx="130" cy="166" rx="92" ry="12" fill="#F7F4EE"/>'+cake(130,140,160,20)+cake(130,116,100,20)+cake(130,92,136,20)+cake(130,68,64,20)+'<path d="M218 98l70-34" stroke-width="8" stroke="#6B4A2B"/><path d="M170 112l52-16 4 10-52 16z" fill="#C9CDD1"/><g stroke-dasharray="6 6" opacity=".5" fill="none"><rect x="262" y="140" width="56" height="16" rx="8"/><rect x="270" y="120" width="40" height="16" rx="8"/><rect x="278" y="100" width="24" height="16" rx="8"/></g></g></svg>'},
 theme:'F10',
 teach:['Sort the stack: biggest at the bottom',['Tap a pancake.','The spatula flips it and every pancake above it.','Sort the stack, biggest at the bottom, in as few flips as you can.']]};

D['bezzel-queens']={
 about:{from:'The chess composer Max Bezzel published the eight queens problem in 1848 in the Berlin chess society\'s magazine, the Schachzeitung. Franz Nauck published the first solutions in 1850, all 92 of them, and extended the question to boards of any size.',research:null,
   links:[{t:'Eight queens puzzle (Wikipedia)',u:'https://en.wikipedia.org/wiki/Eight_queens_puzzle'},{t:'The n-queens problem, a survey (arXiv 2109.08083)',u:'https://arxiv.org/abs/2109.08083'}]},
 story:{paras:[
  'In 1848 the magazine of the Berlin chess society printed a question from the chess composer Max Bezzel. Can eight queens stand on a chessboard so that none of them attacks another?',
  'A queen attacks along its row, its column and both diagonals, so every queen needs a line of its own in all four directions. In 1850 Franz Nauck published the answers, 92 of them, and asked the same question for boards of every size. Many mathematicians have worked on it since, Carl Friedrich Gauss among them.',
  'In Safe Queens some queens are already placed, and rocks fill a few squares: a rock holds no queen, but lines of attack pass over it. Every board has exactly one answer. The shaded squares are under attack. When no line has a single safe square left, press a square and watch its lines: would a queen there leave some row with nowhere to go?'],
  fact:'The eight queens problem has 92 answers on a full chessboard, first published by Franz Nauck in 1850.',
  links:[{t:'Eight queens puzzle (Wikipedia)',u:'https://en.wikipedia.org/wiki/Eight_queens_puzzle'},{t:'The n-queens problem, a survey (arXiv 2109.08083)',u:'https://arxiv.org/abs/2109.08083'}]},
 art:{hook:'Eight queens, one board, and not one of them under attack.',
  tile:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g '+K+'><rect x="14" y="14" width="92" height="92" rx="10" fill="#F6ECD9"/><path d="M37 14v92M60 14v92M83 14v92M14 37h92M14 60h92M14 83h92" stroke-width="1.5" opacity=".4"/><path d="M40 70l-4-20 9 8 7-13 7 13 9-8-4 20z" fill="#1F2A44"/><rect x="40" y="70" width="24" height="6" rx="2" fill="#1F2A44"/><path d="M52 60L100 12M52 60H106M52 60v46" stroke="#E8590C" stroke-width="3" opacity=".7"/><circle cx="83" cy="88" r="9" fill="#8C857A"/></g></svg>',
  hero:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 200"><g '+K+'><rect x="90" y="10" width="160" height="180" rx="14" fill="#8A6A45"/><rect x="100" y="20" width="140" height="160" rx="8" fill="#F6ECD9"/><path d="M128 20v160M156 20v160M184 20v160M212 20v160M100 52h140M100 84h140M100 116h140M100 148h140" stroke-width="1.5" opacity=".35"/><path d="M134 76l-3-14 7 6 4-9 4 9 7-6-3 14z" fill="#1F2A44"/><path d="M190 140l-3-14 7 6 4-9 4 9 7-6-3 14z" fill="#8E5B1E"/><circle cx="226" cy="36" r="9" fill="#8C857A"/><path d="M142 68H240M142 68L240 166M142 68L100 110" stroke="#E8590C" stroke-width="3" opacity=".6"/></g></svg>'},
 theme:'F10',
 teach:['Place queens so none can attack another',['Tap a square to place a queen.','A queen attacks along its row, column and diagonals; rocks hold no queen.','Fill every row with a queen that is safe from all the others.']]};

function tri(x,y,w,c){return '<polygon points="'+(x+w/2)+','+(y+w/2)+' '+x+','+y+' '+(x+w)+','+y+'" fill="'+c[0]+'"/><polygon points="'+(x+w/2)+','+(y+w/2)+' '+(x+w)+','+y+' '+(x+w)+','+(y+w)+'" fill="'+c[1]+'"/><polygon points="'+(x+w/2)+','+(y+w/2)+' '+(x+w)+','+(y+w)+' '+x+','+(y+w)+'" fill="'+c[2]+'"/><polygon points="'+(x+w/2)+','+(y+w/2)+' '+x+','+(y+w)+' '+x+','+y+'" fill="'+c[3]+'"/>'}
var NV='#3E3A52',RD='#E4572E',YL='#F2C14E',TL='#3E9C8A';
D['quilt-tiles']={
 about:{from:'Percy Alexander MacMahon, a mathematician and former officer in the Royal Artillery, published his coloured squares in New Mathematical Pastimes (Cambridge University Press, 1921): 24 squares, each edge one of three colours, to be laid in a 4 by 6 rectangle so that touching edges match. A variant asks for a single colour all round the border.',research:null,
   links:[{t:'MacMahon Squares (Wikipedia)',u:'https://en.wikipedia.org/wiki/MacMahon_Squares'},{t:'Percy Alexander MacMahon (Wikipedia)',u:'https://en.wikipedia.org/wiki/Percy_Alexander_MacMahon'}]},
 story:{paras:[
  'In 1921 Cambridge University Press published New Mathematical Pastimes by Percy Alexander MacMahon, a mathematician who had served as an officer in the Royal Artillery. One of its games used 24 squares. Each edge of a square carries one of three colours, and no two squares are alike.',
  'The task is to lay all 24 in a 4 by 6 rectangle so that wherever two squares touch, the touching edges match. One version asks for a single colour all the way round the border. MacMahon\'s squares are an early member of the edge-matching family; in 1964 a computer is reported to have found 12,261 answers to the basic version.',
  'In Quilt Tiles each board has exactly one answer. The dark frame is the border colour, so corner tiles show it on two edges and side tiles on one. Work out where each tile belongs before you move it: the fewest moves come from seeing the whole quilt first.'],
  fact:'MacMahon\'s 24 coloured squares appeared in New Mathematical Pastimes in 1921.',
  links:[{t:'MacMahon Squares (Wikipedia)',u:'https://en.wikipedia.org/wiki/MacMahon_Squares'}]},
 art:{hook:'Every seam must match, and the border must be one colour.',
  tile:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="8" y="8" width="104" height="104" rx="12" fill="'+NV+'"/>'+tri(16,16,44,[NV,RD,YL,NV])+tri(60,16,44,[NV,NV,TL,RD])+tri(16,60,44,[YL,TL,NV,NV])+tri(60,60,44,[TL,NV,NV,TL])+'<path d="M60 26v24M60 70v24M26 60h24M70 60h24" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 3"/></svg>',
  hero:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 200"><rect x="70" y="10" width="200" height="180" rx="16" fill="'+NV+'"/>'+tri(84,20,54,[NV,RD,YL,NV])+tri(138,20,54,[NV,TL,RD,RD])+tri(192,20,54,[NV,NV,YL,TL])+tri(84,74,54,[YL,TL,TL,NV])+tri(138,74,54,[RD,YL,TL,TL])+tri(192,74,54,[YL,NV,RD,YL])+tri(84,128,54,[TL,RD,NV,NV])+tri(138,128,54,[TL,YL,NV,RD])+tri(192,128,54,[RD,NV,NV,YL])+'</svg>'},
 theme:'F8',verb:'Try dragging this tile',
 teach:['Match every seam; plain border all round',['Drag a tile onto another to swap them.','From level 9, tap a tile to turn it.','Every touching edge must match, and the outside edges show the dark frame colour.']]};

function wagon(x,y,c){return '<rect x="'+x+'" y="'+y+'" width="34" height="20" rx="4" fill="'+c+'"/><circle cx="'+(x+8)+'" cy="'+(y+23)+'" r="4" fill="#2B2620"/><circle cx="'+(x+26)+'" cy="'+(y+23)+'" r="4" fill="#2B2620"/>'}
D['shunting-yard']={
 about:{from:'Inglenook Sidings is a shunting puzzle for model railways created by Alan Wright (1928-2005), based on Kilham sidings on the Alnwick-Cornhill branch of the North Eastern Railway: sidings for 5, 3 and 3 wagons and a headshunt for the engine and 3. Sources differ on the date: one gives 1978, another the Manchester Model Railway Exhibition of 1979. John Allen\'s Timesaver, another shunting puzzle, was published in 1972.',research:null,
   links:[{t:'Inglenook Sidings (Wikipedia)',u:'https://en.wikipedia.org/wiki/Inglenook_Sidings'},{t:'Blackburn, Inglenook Shunting Puzzles (arXiv 1810.07970)',u:'https://arxiv.org/abs/1810.07970'}]},
 story:{paras:[
  'Model railway shows need layouts that keep visitors watching. In the late 1970s Alan Wright, an English modeller, built a tiny one that was really a puzzle, Inglenook Sidings. One account dates it to 1978; another places its first showing at the Manchester Model Railway Exhibition in 1979.',
  'His track copied Kilham sidings on the Alnwick to Cornhill branch of the North Eastern Railway: three sidings that hold 5, 3 and 3 wagons, and a short headshunt that holds the engine and only 3 wagons. Eight wagons sit in the sidings, and the task is to make up an outgoing train of five, in a set order. Wagons can be pushed and pulled, but never lifted. In 1972 the American modeller John Allen had published a cousin, the Timesaver.',
  'Shunting Yard keeps the rules and shrinks the yard. Tap a wagon and the engine fetches it with every wagon in front of it; tap a siding to drop what it pulls. The short headshunt is the whole puzzle: you will park wagons you need later so that the right one comes out first.'],
  fact:'Inglenook Sidings copies a real yard: Kilham, on the Alnwick to Cornhill branch line.',
  links:[{t:'Inglenook Sidings (Wikipedia)',u:'https://en.wikipedia.org/wiki/Inglenook_Sidings'},{t:'Blackburn, Inglenook Shunting Puzzles (arXiv 1810.07970)',u:'https://arxiv.org/abs/1810.07970'}]},
 art:{hook:'One small engine, a short headshunt, and a train to make up in order.',
  tile:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g '+K+'><rect x="8" y="8" width="104" height="104" rx="14" fill="#E7E0CF"/><path d="M20 34h84M20 62h84M20 90h84M20 30v64" stroke="#6E6556" stroke-width="2.5"/></g><g stroke="#1B1916" stroke-width="2">'+wagon(60,20,'#E4572E')+wagon(26,48,'#2F7FC1')+wagon(64,48,'#F2C14E')+'<rect x="26" y="76" width="30" height="16" rx="3" fill="#2D2A33"/><rect x="46" y="68" width="14" height="24" rx="3" fill="#2D2A33"/></g></svg>',
  hero:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 200"><rect x="10" y="10" width="320" height="180" rx="22" fill="#E7E0CF"/><g stroke="#6E6556" stroke-width="3" fill="none"><path d="M50 50H300M50 95H230M50 140H230M50 46V164M50 160H220"/></g><g stroke="#1B1916" stroke-width="2"><rect x="62" y="36" width="40" height="22" rx="4" fill="none" stroke-dasharray="5 4" stroke="#E4572E"/>'+wagon(210,36,'#3E9C8A')+wagon(252,36,'#E4572E')+wagon(150,81,'#2F7FC1')+wagon(190,81,'#F2C14E')+wagon(190,126,'#8E6CC0')+'<rect x="104" y="146" width="40" height="18" rx="3" fill="#2D2A33"/><rect x="128" y="136" width="18" height="28" rx="3" fill="#2D2A33"/>'+wagon(62,144,'#D96C9B')+'</g></svg>'},
 theme:'F7',
 teach:['Make up the train shown on top',['Tap a wagon: the engine fetches it and the wagons in front of it.','Tap a siding to drop what the engine pulls. The headshunt holds 3 wagons.','Fill the top line in the order of the outlines.']]};

function blk(x,y,w,h,c){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="7" fill="'+c+'"/>'}
D['huarong-pass']={
 about:{from:'In China this sliding-block puzzle is Huarong Dao, named after the trail where Cao Cao escaped in Romance of the Three Kingdoms; its biggest block is called Cao Cao. Children were seen playing a paper version in Shaanxi in 1938, and Jiang Changying\'s book Science Entertainment (1949) is one of the earliest to describe it. In the United States, Lewis W. Hardy of Chicago copyrighted a close relative, the Pennant Puzzle, in 1909. Which version came first is not known.',research:null,
   links:[{t:'Klotski (Wikipedia)',u:'https://en.wikipedia.org/wiki/Klotski'},{t:'US patent 1,017,752 (L. W. Hardy)',u:'https://patents.google.com/patent/US1017752'}]},
 story:{paras:[
  'In Romance of the Three Kingdoms, the defeated warlord Cao Cao flees after the Battle of Red Cliffs down a narrow road called the Huarong trail. Guan Yu waits for him there, and lets him pass. In China the sliding-block puzzle named after that escape is Huarong Dao, and its big square block is Cao Cao.',
  'Where the puzzle began is not known, and several countries claim it. A Chinese researcher recalled children in Shaanxi playing a paper version in 1938, and Jiang Changying\'s 1949 book Science Entertainment is one of the earliest to describe it. In Chicago, Lewis W. Hardy copyrighted a near relative, the Pennant Puzzle, in 1909. The classic layout takes 81 moves at best.',
  'Huarong Pass uses new layouts, smaller than the classic. Drag a block into free space; the big red block must leave through the gate in the bottom edge. Often it has to move away from the gate first, so that a two-wide road can open for it.'],
  fact:'The classic Huarong Dao layout needs at least 81 moves, a count checked by computer.',
  links:[{t:'Klotski (Wikipedia)',u:'https://en.wikipedia.org/wiki/Klotski'}]},
 art:{hook:'The big block has to get out, and everything is in the way.',
  tile:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g '+K+'><rect x="14" y="10" width="92" height="100" rx="12" fill="#C9B48F"/><rect x="20" y="16" width="80" height="86" rx="6" fill="#E8DCC4"/>'+blk(22,18,36,36,'#E4572E')+blk(60,18,18,36,'#5B8DB8')+blk(80,18,18,36,'#5B8DB8')+blk(22,56,36,16,'#6E9B5A')+blk(60,56,18,16,'#F3E7CF')+blk(22,74,18,26,'#5B8DB8')+blk(80,74,18,26,'#5B8DB8')+'<path d="M42 110h36" stroke="#E4572E" stroke-width="5" stroke-dasharray="6 4"/></g></svg>',
  hero:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 200"><g '+K+'><rect x="110" y="8" width="120" height="166" rx="14" fill="#C9B48F"/><rect x="118" y="16" width="104" height="150" rx="8" fill="#E8DCC4"/>'+blk(120,18,24,48,'#5B8DB8')+blk(146,18,48,48,'#E4572E')+blk(196,18,24,48,'#5B8DB8')+blk(120,68,24,48,'#5B8DB8')+blk(146,68,48,22,'#6E9B5A')+blk(196,68,24,48,'#5B8DB8')+blk(146,92,22,22,'#F3E7CF')+blk(172,92,22,22,'#F3E7CF')+blk(120,118,22,22,'#F3E7CF')+blk(196,118,22,22,'#F3E7CF')+'<path d="M146 186h48" stroke="#E4572E" stroke-width="5" stroke-dasharray="7 5"/><path d="M170 176v12M164 182l6 6 6-6" stroke="#E4572E" stroke-width="3" fill="none"/></g></svg>'},
 theme:'F8',verb:'Try dragging this block',
 teach:['Free the big red block through the gate',['Drag a block into free space.','It slides in a straight line until you let go.','Get the big red block out through the gate below.']]};

/*MORE*/
var IDS=window.BATCH_F_DATA_IDS=['pancake-flip','bezzel-queens','quilt-tiles','shunting-yard','huarong-pass'];
window.BATCH_F_DATA=D;
var VERB={};
function apply(){
  IDS.forEach(function(id){var d=D[id];if(!d)return;
    try{if(typeof ABOUT!=='undefined'&&d.about)ABOUT[id]=d.about}catch(e){}
    try{var S=window.STORY||(typeof STORY!=='undefined'?STORY:null);if(S&&d.story)S[id]=d.story}catch(e){}
    try{var A=window.ART||(typeof ART!=='undefined'?ART:null);if(A&&d.art)A[id]=d.art}catch(e){}
    try{if(typeof PZ_THEME!=='undefined'&&d.theme)PZ_THEME[id]=d.theme}catch(e){}});
  applyZT()}
function applyZT(){var ZT=window.ZT;if(!ZT||!ZT.T||ZT.__bf)return false;ZT.__bf=1;
  IDS.forEach(function(id){if(D[id]&&D[id].teach)ZT.T[id]=D[id].teach;if(D[id]&&D[id].verb)VERB[id]=D[id].verb});
  var lab=ZT.label;ZT.label=function(id){return VERB[id]||lab(id)};return true}
apply();
if(!window.ZT)document.addEventListener('DOMContentLoaded',applyZT);
})();
