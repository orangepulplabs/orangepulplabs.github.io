/* Zest puzzles, wave 1 file 4: Risk Deck, On the Tip, Sharp or Round. Contract: see puzzles_kit.js.
   Pure generators first (no DOM, exposed as PZC4 for tests), then one shared shell, then the three mounts.
   Every make(level, rng) is deterministic in rng and returns plain JSON.
   Extra inst fields the runner may read: inst.level, inst.par, inst.parExact, inst.title.
   Meaning of par here: Risk Deck par = number of cards drawn (every run draws exactly that many, so moves == par; the scoring
   target is inst.bestFixed in points). On the Tip par = clue reveals after which exactly one word of the Zest word list fits the letters shown.
   Sharp or Round par = number of rounds (one pick each; a wrong pick costs one extra move).
   Extra def fields: undo:false on Risk Deck and Sharp or Round (they show Hint and Try again, no Undo). Needs wordlist.js (WORDS) loaded first.
   Audio: only Sharp or Round, and only if the player turns "Sound" on (Web Audio, created on that tap, closed in destroy()). Never required. */
var PZC4={};
function pzc4Pl(n,w,p){return n+' '+(n===1?w:(p||w+'s'))}
function pzc4KeyOk(e){return !(e.ctrlKey||e.metaKey||e.altKey)&&!/^(INPUT|TEXTAREA|SELECT)$/.test((e.target&&e.target.tagName)||'')}
function pzc4Sg(n){return n>0?'+'+n:n<0?'−'+(-n):'0'}
function pzc4Words(len){var w=(typeof WORDS!=='undefined')?WORDS['by'+len]:null;if(!w)return [];return typeof w==='string'?w.split(' '):w}

/* ================= 1. Risk Deck =================
   Four decks. Each card has points won (g) and points lost (l); a card's net is g-l.
   The schedules below are ORIGINAL to Zest: they were made up for this game, with their own sizes and patterns. They are not the
   schedules of any published study, and no published schedule was copied or adapted.
   Rules of the generator (all exact, no luck at play time):
   - Every deck is a fixed list of n cards (n = 20..60, a multiple of 10), cut into blocks of 10. Block b of a deck is the same every time.
   - 'Bold' decks pay 8..10 points on every card but their losses add up to more than the wins: net -d per block (d about 30 at level 1, about 14 at level 30, +/-4).
   - 'Mild' decks pay 4..6 points per card with losses that add up to less than the wins: net +d per block.
   - One bold and one mild deck lose on 4-5 cards of every block (small losses); the other bold and mild deck lose on 1-2 cards of every block (big losses).
   - Which letter gets which kind is shuffled by the seed. Block nets are exact whatever the order of cards inside the block.
   Best fixed-deck strategy = draw all n cards from the deck with the highest total (known to the generator: inst.best, inst.bestFixed).
   inst.opt is the best total over ANY mix of decks (a deck's cards come in order). Stars: points / bestFixed. */
PZC4.makeRisk=function(level,rng){
  var n=20+10*Math.floor((level-1)/6),gap=Math.round(30-(level-1)*16/29),usedNet={};
  var kinds=pzShuffle([{bold:1,often:1},{bold:1,often:0},{bold:0,often:1},{bold:0,often:0}],rng);
  var decks=kinds.map(function(k){
    var w=k.bold?8+pzInt(rng,3):4+pzInt(rng,3),d=gap-4+pzInt(rng,9);
    while(usedNet[k.bold?-d:d])d++;usedNet[k.bold?-d:d]=1;
    var loss=k.bold?10*w+d:10*w-d,cards=[],b,j,i;
    for(b=0;b<n/10;b++){
      var kc=k.often?4+pzInt(rng,2):1+pzInt(rng,2),pos=pzShuffle([0,1,2,3,4,5,6,7,8,9],rng).slice(0,kc),wt=[],ws=0,parts=[],rem=loss-kc,left;
      for(i=0;i<kc;i++){wt.push(1+pzInt(rng,3));ws+=wt[i]}
      left=rem;for(i=0;i<kc;i++){var add=Math.floor(rem*wt[i]/ws);parts.push(1+add);left-=add}parts[0]+=left;
      for(j=0;j<10;j++){var at=pos.indexOf(j);cards.push([w,at>=0?parts[at]:0])}}
    var net=0;cards.forEach(function(c){net+=c[0]-c[1]});
    return {cards:cards,net:net,kind:(k.bold?'bold':'mild')+'-'+(k.often?'often':'rare')}});
  var best=0,i;for(i=1;i<4;i++)if(decks[i].net>decks[best].net)best=i;
  return {title:'Level '+level,level:level,n:n,decks:decks,best:best,bestFixed:decks[best].net,opt:PZC4.riskOpt(decks,n),par:n,parExact:true}};
/* best total over any split of n draws across the four decks (dynamic programming over prefix sums) */
PZC4.riskOpt=function(decks,n){
  var dp=[0],t,c,NEG=-1e9;for(t=1;t<=n;t++)dp.push(NEG);
  decks.forEach(function(dk){var pre=[0];dk.cards.forEach(function(cd){pre.push(pre[pre.length-1]+cd[0]-cd[1])});
    var nd=[];for(t=0;t<=n;t++){var b=NEG;for(c=0;c<=t&&c<pre.length;c++)if(dp[t-c]>NEG/2&&dp[t-c]+pre[c]>b)b=dp[t-c]+pre[c];nd.push(b)}dp=nd});
  return dp[n]};
PZC4.deckLetter=function(i){return 'ABCD'.charAt(i)};

/* ================= 2. On the Tip =================
   Word | short clue (original wording, written for Zest) | a related word. Every word is in WORDS.by3..by9 (tests check this).
   Reveal order (each press of Hint or "Show a clue" shows the next one): 1 first letter, 2 'ends like' word (same last two letters, by spelling, not sound),
   3 a related word, 4 second letter, 5 third letter. Par = the fewest reveals after which exactly one word in the Zest word list of that length fits the letters shown. */
PZC4.CLUETXT=[
'cat|a small furry pet that purrs|kitten','dog|a pet that barks and wags its tail|puppy','sun|the bright star that lights our day|sky','hat|you wear it on your head|cap',
'cup|you drink tea from it|mug','bed|where you sleep at night|pillow','pen|you write with its ink|paper','map|a drawing that shows where places are|road',
'bus|a big vehicle that carries many riders|stop','car|a vehicle with four wheels and an engine|road','egg|a hen lays it|shell','fox|a clever orange wild animal with a bushy tail|den',
'ice|frozen water|cold','key|you turn it in a lock|door','leg|you walk on it|knee','owl|a night bird that hoots|hoot',
'pig|a farm animal that oinks|mud','rug|a small carpet|floor','tub|a bath, or a big round container|bath','van|a boxy vehicle for carrying goods|truck',
'web|a spider spins it|spider','bat|a flying night animal, or what you swing at a ball|cave','bee|a buzzing insect that makes honey|honey','cow|a farm animal that gives milk|milk',
'fan|it spins to cool a room|breeze','jar|a glass container with a lid|jam','lid|the cover of a pot|pot','net|a mesh used to catch fish|fish',
'nut|a hard-shelled seed|squirrel','pan|you fry food in it|stove',
'moon|it shines at night and changes shape|night','star|a tiny bright light in the night sky|sky','tree|it has a trunk, branches and leaves|forest','fish|it lives in water and has fins|swim',
'bird|it has feathers and wings|nest','rain|water falling from clouds|umbrella','snow|soft white flakes in cold weather|winter','wind|moving air|breeze',
'leaf|a flat green part of a plant|branch','book|pages bound together for reading|story','door|you open it to walk into a room|handle','milk|a white drink from cows|cow',
'hand|it has five fingers|glove','foot|you stand on it|shoe','nose|you smell with it|face','lamp|it gives light on a table|bulb',
'bell|it rings when struck|ring','boat|it floats and carries people on water|sail','ship|a very large boat|ocean','farm|land where crops and animals are raised|barn',
'frog|a green jumper that croaks|pond','duck|a bird that quacks and swims|pond','goat|a horned animal that climbs rocks|kid','cake|a sweet baked treat for a party|candle',
'rice|small white grains cooked in water|bowl','soup|a warm liquid meal eaten with a spoon|bowl','salt|a white seasoning from the sea|pepper','coat|a warm layer worn outdoors|jacket','shoe|you wear it on your foot|sock',
'apple|a round fruit, red or green|tree','clock|it shows the time|tick','chair|you sit on it|table','table|a flat top on legs for meals|chair',
'horse|an animal you can ride|gallop','mouse|a tiny animal that squeaks|cheese','river|water flowing to the sea|bank','cloud|a white or grey shape in the sky|rain',
'beach|sand beside the sea|shell','plant|a living thing that grows in soil|seed','grass|green blades that cover a lawn|lawn','stone|a small piece of rock|pebble',
'tiger|a big striped cat|stripe','lemon|a sour yellow fruit|juice','music|sounds arranged to be sung or played|song','piano|an instrument with black and white keys|keys',
'dance|moving to music|music','house|a building where a family lives|home','plane|a flying machine with wings|airport','water|clear liquid you drink|drink',
'light|what a lamp gives off|lamp','night|when the sky is dark|moon','smile|a happy curve of the mouth|happy','sleep|resting with your eyes closed|bed',
'pizza|a round baked dish with cheese on top|cheese','candy|a sweet treat made of sugar|sugar','cream|thick white stuff skimmed from milk|milk','honey|a sweet golden food made by bees|bee',
'knife|a blade for cutting food|fork','spoon|you eat soup with it|fork','plate|a flat dish for food|dinner',
'garden|a place where flowers and vegetables grow|flower','window|glass you look through in a wall|glass','button|it fastens a shirt|shirt','rabbit|a long-eared hopper that eats carrots|carrot',
'monkey|a clever animal that swings in trees|banana','jacket|a short coat|coat','bridge|it carries a road over a river|river','forest|a large area full of trees|trees',
'island|land with water all around|sea','mirror|glass that shows your reflection|reflection','orange|a round citrus fruit, also a colour|juice','pepper|a spicy seasoning, or a colourful vegetable|salt',
'planet|a world that circles a star|orbit','ticket|a paper you show to get in|entry','spider|a small animal with eight legs that spins silk|web','winter|the coldest season|snow',
'flower|the colourful part of a plant|petal','candle|a stick of wax with a flame|flame','basket|a woven container with a handle|picnic','camera|it takes pictures|photo',
'cheese|a food made from milk, often yellow|milk','farmer|a person who grows crops or keeps animals|barn','finger|one of five on your hand|thumb','bottle|a tall container for drinks|cap',
'carpet|a thick floor covering|floor','dinner|the main meal of the evening|supper','doctor|a person who treats the sick|nurse','engine|the machine that makes a car go|motor',
'kitchen|the room where meals are cooked|oven','chicken|a farm bird kept for eggs and meat|hen','library|a place full of books to borrow|books','machine|a device that does a job for you|engine',
'morning|the start of the day|sunrise','rainbow|a coloured arc after the rain|colours','teacher|a person who helps a class learn|class','village|a small group of homes in the countryside|farm',
'journey|a long trip|travel','kingdom|a land ruled by a king or queen|crown','cottage|a small, cosy house in the country|garden','picture|a drawing, painting or photo|frame',
'present|a gift, or the time that is now|gift','diamond|a hard, sparkling gem|ring','holiday|a day off or a trip away|vacation','cabinet|a cupboard with shelves or doors|shelf',
'captain|the leader of a ship or a team|crew','costume|clothes worn to dress up as someone else|party','factory|a building where goods are made|workers','monster|a scary made-up creature|dragon',
'station|a stop where buses and rail passengers get on|platform','weather|sun, rain, wind and snow outside|forecast','wedding|a ceremony where two people marry|bride','cookies|small sweet baked treats|oven',
'cricket|a bat and ball game, or a chirping insect|bat','stadium|a big arena for sport|crowd','tourist|a person visiting a place for fun|holiday',
'bathroom|the room with a bath or shower|towel','birthday|the yearly day you were born|cake','building|a structure with walls and a roof|floor','calendar|it lists the days and months|date',
'computer|a machine with a screen and keyboard|keyboard','daughter|a girl, as her parents see her|mother','festival|a joyful celebration or event with music|parade','football|a team game played with a round ball|goal',
'hospital|a building where the ill are cared for|nurse','keyboard|rows of keys you press to type|typing','language|words people use to speak to each other|words','magazine|a glossy publication with pictures and articles|pages',
'mountain|a very high hill|peak','notebook|a book of blank pages for writing|pencil','painting|a picture made with a brush|canvas','shoulder|it joins your arm to your body|elbow',
'swimming|moving through water with your arms and legs|pool','tomorrow|the day after today|today','vacation|time away from work or study|holiday','baseball|a bat and ball game with four bases|bat',
'champion|the winner of a contest|trophy','children|young people, the plural of child|toys','exercise|a run, a swim or a stretch|gym','midnight|twelve o\'clock at night|clock',
'princess|the daughter of a king and queen|castle','pharmacy|a shop that sells medicines|chemist',
'adventure|an exciting, unusual journey|explore','afternoon|the part of the day after noon|lunch','apartment|a home inside a larger building|flat','beautiful|very pleasing to look at|lovely',
'breakfast|the first meal of the day|toast','chocolate|a sweet brown treat made from cocoa|cocoa','classroom|a room where a teacher and class meet|desk','community|the people who live in one area|neighbours',
'dangerous|likely to cause harm|risky','education|what students receive from teachers over the years|learning','excellent|extremely good|superb','fantastic|wonderful, almost unbelievable|amazing',
'furniture|chairs, tables and beds|sofa','hurricane|a huge, violent storm|storm','important|of great value or meaning|vital','knowledge|facts and skills that you hold|facts',
'landscape|a wide view of land and sky|scenery','orchestra|a large group of musicians playing together|conductor','passenger|a person who rides in a vehicle but does not drive|ticket','telephone|a device for talking to someone far away|call',
'wonderful|marvellous|splendid','yesterday|the day before today|today'];
PZC4.CLUES=PZC4.CLUETXT.map(function(s){var p=s.split('|');return {w:p[0],clue:p[1],rel:p[2]}});
var pzc4TipCache={};
/* the five reveals as positional constraints on a word of the same length: [first letter, last two letters, nothing, second letter, third letter] */
function pzc4TipCands(word,k){
  var len=word.length,out=[],lst=pzc4Words(len),i,w;
  for(i=0;i<lst.length;i++){w=lst[i];
    if(k>=1&&w.charAt(0)!==word.charAt(0))continue;
    if(k>=2&&w.slice(-2)!==word.slice(-2))continue;
    if(k>=4&&w.charAt(1)!==word.charAt(1))continue;
    if(k>=5&&w.charAt(2)!==word.charAt(2))continue;
    out.push(w)}
  return out}
PZC4.tipPar=function(word){var k;if(pzc4TipCache[word]!==undefined)return pzc4TipCache[word];
  for(k=1;k<=5;k++)if(pzc4TipCands(word,k).length===1)return pzc4TipCache[word]=k;
  return pzc4TipCache[word]=null};
PZC4.tipEnds=function(word){var suf=word.slice(-2),out=[],len,lst,i;
  for(len=3;len<=6;len++){lst=pzc4Words(len);for(i=0;i<lst.length;i++)if(lst[i]!==word&&!/focus|brain|train|smart|improv|boost|memory|school|health|attention|cognit/.test(lst[i])&&lst[i].slice(-2)===suf&&lst[i].indexOf(word)<0&&word.indexOf(lst[i])<0)out.push(lst[i])}
  return out};
PZC4.tipPool=function(len){return PZC4.CLUES.filter(function(c){return c.w.length===len&&pzc4Words(len).indexOf(c.w)>=0&&PZC4.tipPar(c.w)!==null&&PZC4.tipEnds(c.w).length>0})};
PZC4.tipLen=function(level){return 3+Math.floor((level-1)*7/30)};
PZC4.makeTip=function(level,rng){
  var len=PZC4.tipLen(level),decoys=Math.min(4,Math.floor((level-1)/7)),pool=pzShuffle(PZC4.tipPool(len),rng),c=pool[0],word=c.w,
      ends=pzShuffle(PZC4.tipEnds(word).slice(0,40),rng)[0],i,letters=word.split(''),abc='abcdefghijklmnopqrstuvwxyz'.split('').filter(function(x){return word.indexOf(x)<0});
  abc=pzShuffle(abc,rng);for(i=0;i<decoys;i++)letters.push(abc[i]);
  return {title:'Level '+level,level:level,len:len,word:word,clue:c.clue,rel:c.rel,ends:ends,par:PZC4.tipPar(word),tray:pzShuffle(letters,rng),parExact:true}};
PZC4.tipReveal=function(inst,i){var w=inst.word,U=function(x){return x.toUpperCase()};
  return [ 'It starts with the letter '+U(w.charAt(0))+'.','It ends with the same two letters as "'+inst.ends+'" (by spelling).','A related word: '+inst.rel+'.',
    'The second letter is '+U(w.charAt(1))+'.','The third letter is '+U(w.charAt(2))+'.'][i]};

/* ================= 3. Sharp or Round =================
   Made-up words are built from two documented sound families (the effect in the research: rounded shapes tend to be paired with soft, rounded
   speech sounds and spiky shapes with clipped, bright ones). The generator DEFINES the answer: a word's class is the family it was built from.
     round: consonants b m l n d g w, vowels o u oo, optional final m n l b      (e.g. bomu, loobun)
     sharp: consonants k t p z s,    vowels i e ee, optional final k t p z      (e.g. kitez, tipeek)
   Words are never in the Zest word list (no real words). No percentages are claimed anywhere. */
PZC4.PHON={round:{c:'b m l n d g w'.split(' '),v:['o','u','oo'],end:['m','n','l','b']},sharp:{c:'k t p z s'.split(' '),v:['i','e','ee'],end:['k','t','p','z']}};
var pzc4RealSet=null;
function pzc4Real(w){if(!pzc4RealSet){pzc4RealSet={};for(var n=3;n<=9;n++)pzc4Words(n).forEach(function(x){pzc4RealSet[x]=1})}return !!pzc4RealSet[w]}
PZC4.buildWord=function(cls,rng,syl,coda,used){var P=PZC4.PHON[cls],t,w,s;
  for(t=0;t<60;t++){w='';for(s=0;s<syl;s++)w+=P.c[pzInt(rng,P.c.length)]+P.v[pzInt(rng,P.v.length)];
    if(coda&&rng()<.6)w+=P.end[pzInt(rng,P.end.length)];
    if(!used[w]&&!pzc4Real(w)){used[w]=1;return w}}
  w+=P.v[0];used[w]=1;return w};
PZC4.classOf=function(w){var r=0,s=0,i,c;for(i=0;i<w.length;i++){c=w.charAt(i);if('bmlndgwou'.indexOf(c)>=0)r++;else if('ktpzsie'.indexOf(c)>=0)s++}return r===w.length?'round':s===w.length?'sharp':'mixed'};
PZC4.rounds=function(level){return 6+Math.floor((level-1)/6)};
PZC4.makeSharp=function(level,rng){
  var nr=PZC4.rounds(level),nv=level<=4?1:level<=12?2:3,syl=level<10?2:3,coda=level>=5,used={},rounds=[],i,
      kinds=level<7?['w2s']:level<13?['w2s','s2w']:level<19?['w2s','s2w','pair']:['pair','s2w','pair','w2s'];
  function shape(cls){return {cls:cls,v:pzInt(rng,nv)}}
  function word(cls){return {w:PZC4.buildWord(cls,rng,syl,coda,used),cls:cls}}
  function other(c){return c==='round'?'sharp':'round'}
  for(i=0;i<nr;i++){
    var k=kinds[pzInt(rng,kinds.length)],cls=rng()<.5?'round':'sharp',r,opts;
    if(k==='w2s'){var wd=word(cls);opts=pzShuffle([shape('round'),shape('sharp')],rng);r={k:k,target:wd,opts:opts,ans:opts[0].cls===cls?0:1}}
    else if(k==='s2w'){var sh=shape(cls),a=word(cls),b=word(other(cls));opts=pzShuffle([a,b],rng);r={k:k,target:sh,opts:opts,ans:opts[0].cls===cls?0:1}}
    else{var w1=word(cls),w2=word(other(cls));opts=pzShuffle([shape('round'),shape('sharp')],rng);r={k:k,words:[w1,w2],target:w1,opts:opts,ans:opts[0].cls===cls?0:1}}
    rounds.push(r)}
  return {title:'Level '+level,level:level,rounds:rounds,par:nr,parExact:true}};

/* ================= shared styles (one <style id="pzc4-css">) ================= */
var PZC4_CSS='.pzc4{display:flex;flex-direction:column;gap:12px;width:100%;max-width:24rem;margin:0 auto;color:var(--ink);font-family:var(--font)}.pzc4 *{box-sizing:border-box}'
+'.pzc4-top{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:2px 12px}.pzc4-goal{margin:0;font:700 1.125rem/1.25 var(--disp)}.pzc4-ct{font:650 .875rem var(--font);color:var(--muted)}'
+'.pzc4-board{position:relative}.pzc4-msg{margin:0;min-height:2.8em;font-size:.9375rem;line-height:1.4;color:var(--muted)}.pzc4-note{margin:8px 0 0;font-size:.8125rem;line-height:1.4;color:var(--muted)}'
+'.pzc4-bar{display:flex;flex-wrap:wrap;gap:8px}.pzc4-bar .pzb{flex:1 1 5.5rem}'
+'.pzc4 .pzb{min-height:3rem;min-width:48px;padding:.25rem 14px;border:0;border-radius:var(--r1);background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);font:700 1rem/1.2 var(--font);color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-align:center;transition:transform .12s ease-out}'
+'.pzc4 .pzb:active{transform:scale(.97)}.pzc4 .pzb:disabled{background:var(--dis-bg);color:var(--dis-ink);box-shadow:none;cursor:default}.pzc4 .pzb.pri{background:var(--accent);color:var(--on-accent);box-shadow:none}'
+'.pzc4 .pzb:focus-visible{outline:3px solid var(--ink);outline-offset:2px}.pzc4 .pzb.pzc4-hint{outline:3px dashed var(--ink);outline-offset:3px}.pzc4 .pzb[aria-pressed=true]{background:var(--tint);box-shadow:inset 0 0 0 3px var(--accent)}'
/* risk deck */
+'.pzc4-score{display:flex;gap:12px;align-items:baseline;justify-content:space-between;padding:8px 12px;border-radius:var(--r2);background:var(--surface);box-shadow:0 0 0 1px var(--line)}.pzc4-score b{font:700 2rem/1 var(--disp)}.pzc4-score span{font:650 .875rem var(--font);color:var(--muted)}'
+'.pzc4-decks{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.pzc4 .pzc4-decks .pzb{flex-direction:column;min-height:5.5rem;gap:2px;padding:8px}.pzc4-decks .pzb strong{font:700 1.125rem/1.2 var(--disp)}.pzc4-decks .pzb small{font:600 .8125rem/1.3 var(--font);color:var(--muted)}.pzc4-decks .pzb .pzc4-gl{font-size:1.5rem;line-height:1}'
+'.pzc4-last{margin:8px 0 0;font:650 1rem/1.4 var(--font);min-height:1.5em}'
/* on the tip */
+'.pzc4-clue{margin:0;padding:12px;border-radius:var(--r2);background:var(--surface);box-shadow:0 0 0 1px var(--line);font:600 1.0625rem/1.4 var(--font)}.pzc4-clue small{display:block;font:650 .8125rem var(--font);color:var(--muted);margin-bottom:2px}'
+'.pzc4-rev{margin:8px 0 0;padding-left:1.3rem;font-size:.9375rem;line-height:1.5;min-height:1.5em}'
+'.pzc4-slots{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:12px 0}.pzc4-slots span{display:flex;align-items:center;justify-content:center;width:2.25rem;height:3rem;border-radius:10px;background:var(--surface);box-shadow:0 0 0 1.5px var(--edge);font:700 1.375rem/1 var(--disp)}'
+'.pzc4-slots span.hintl{color:var(--muted);border:2px dashed var(--edge)}.pzc4-tray{display:grid;grid-template-columns:repeat(auto-fill,minmax(3rem,1fr));gap:8px}.pzc4 .pzc4-tray .pzb{min-height:3rem;font:700 1.25rem/1 var(--disp);padding:0}'
/* sharp or round */
+'.pzc4-word{margin:0;text-align:center;font:700 2.25rem/1.2 var(--disp);letter-spacing:.04em;word-break:break-word}.pzc4-pair{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:0 0 6px;font:650 1rem var(--font);color:var(--muted)}.pzc4-pair b{font:700 1.125rem var(--disp);color:var(--ink)}'
+'.pzc4-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;margin-top:10px}.pzc4 .pzc4-two .pzb{flex-direction:column;min-height:8rem;gap:4px;padding:8px}.pzc4-two svg{width:5rem;height:5rem;display:block}.pzc4-two .pzb span{font:700 .9375rem var(--font)}.pzc4 .pzc4-two .pzb.wd{min-height:5rem;font:700 1.25rem/1.2 var(--disp);overflow-wrap:anywhere;padding:4px}'
+'.pzc4-shapebig{display:flex;justify-content:center;margin:0}.pzc4-shapebig svg{width:7rem;height:7rem}.pzc4-snd{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px}'
+'.pzc4.rm *,.pzc4.rm *::before{transition:none!important;animation:none!important}@media (prefers-reduced-motion:reduce){.pzc4 *,.pzc4 *::before{transition:none!important;animation:none!important}}';
function pzc4Css(){if(typeof document==='undefined'||document.getElementById('pzc4-css'))return;var s=document.createElement('style');s.id='pzc4-css';s.textContent=PZC4_CSS;(document.head||document.documentElement).appendChild(s)}

/* ================= shared shell ================= */
function pzc4Shell(root,inst,api,o){
  pzc4Css();while(root.firstChild)root.removeChild(root.firstChild);o=o||{};
  var S={timers:[],offs:[],dead:false,onDestroy:[]};
  S.wrap=pzEl('div',{class:'pzc4'+(api.rm?' rm':'')+(o.cls?' '+o.cls:'')});
  S.goal=pzEl('p',{class:'pzc4-goal',text:o.goal||''});S.ct=pzEl('span',{class:'pzc4-ct num'});
  S.board=pzEl('div',{class:'pzc4-board'});S.msg=pzEl('p',{class:'pzc4-msg'});S.bar=pzEl('div',{class:'pzc4-bar'});
  if(!api.say)S.msg.setAttribute('role','status');
  S.wrap.appendChild(pzEl('div',{class:'pzc4-top'},[S.goal,S.ct]));S.wrap.appendChild(S.board);S.wrap.appendChild(S.msg);
  S.showBar=!(api.toolbar===false||inst.toolbar===false);if(S.showBar)S.wrap.appendChild(S.bar);
  S.say=function(t){S.msg.textContent=t;if(api.say)api.say(t)};
  S.later=function(fn,ms){var id=setTimeout(function(){if(!S.dead)fn()},ms);S.timers.push(id);return id};
  S.on=function(tg,ty,fn){tg.addEventListener(ty,fn);S.offs.push(function(){tg.removeEventListener(ty,fn)})};
  S.key=function(fn){S.on(document,'keydown',function(e){if(S.dead||!S.wrap.isConnected||!pzc4KeyOk(e))return;if(fn(e))e.preventDefault()})};
  S.mark=function(el,ord){el.classList.add('pzc4-hint');el.setAttribute('data-hint-order',ord)};
  S.clearMarks=function(){var m=S.wrap.querySelectorAll('.pzc4-hint');for(var i=0;i<m.length;i++){m[i].classList.remove('pzc4-hint');m[i].removeAttribute('data-hint-order')}};
  S.destroy=function(){S.dead=true;S.timers.forEach(clearTimeout);S.offs.forEach(function(f){f()});S.onDestroy.forEach(function(f){try{f()}catch(e){}});if(S.wrap.parentNode)S.wrap.parentNode.removeChild(S.wrap)};
  root.appendChild(S.wrap);return S}

/* ---- 1. Risk Deck ---- */
function pzc4MountRisk(root,inst,api){
  var S=pzc4Shell(root,inst,api,{cls:'pzc4-risk',goal:'Draw '+inst.n+' cards and finish with as many points as you can.'}),
      draws=[],counts=[0,0,0,0],dnet=[0,0,0,0],score=0,hints=0,fin=0,lvl=0,tries=1,btns=[],bh,br,last;
  var scoreEl=pzEl('b',{class:'num',text:'0'}),leftEl=pzEl('span',{class:'num'}),decks=pzEl('div',{class:'pzc4-decks'}),lastEl=pzEl('p',{class:'pzc4-last',text:''});
  S.board.appendChild(pzEl('div',{class:'pzc4-score'},[pzEl('span',{text:'Points'}),scoreEl,leftEl]));
  var GL=['◆','●','▲','■'];
  inst.decks.forEach(function(dk,i){var L=PZC4.deckLetter(i),b=pzBtn('Deck '+L,function(){draw(i)},{text:''});
    b.appendChild(pzEl('span',{class:'pzc4-gl','aria-hidden':'true',text:GL[i]}));b.appendChild(pzEl('strong',{'aria-hidden':'true',text:'Deck '+L}));b.appendChild(pzEl('small',{'aria-hidden':'true',text:''}));btns.push(b);decks.appendChild(b)});
  S.board.appendChild(decks);S.board.appendChild(lastEl);
  function render(){S.clearMarks();scoreEl.textContent=String(score);leftEl.textContent=(inst.n-draws.length)+' cards left';S.ct.textContent='Cards drawn '+draws.length+' of '+inst.n;
    btns.forEach(function(b,i){var L=PZC4.deckLetter(i);b.querySelector('small').textContent='Drawn '+counts[i]+' · net '+pzc4Sg(dnet[i]);
      b.setAttribute('aria-label','Deck '+L+', drawn '+pzc4Pl(counts[i],'time')+', net total '+pzc4Sg(dnet[i])+' points. Draw a card.');b.disabled=!!fin||counts[i]>=inst.n})}
  function draw(i){if(fin||counts[i]>=inst.n)return false;var c=inst.decks[i].cards[counts[i]],net=c[0]-c[1];counts[i]++;dnet[i]+=net;score+=net;draws.push(i);lvl=0;hintLabel();
    if(api.moved)api.moved();render();
    last='Deck '+PZC4.deckLetter(i)+': won '+c[0]+(c[1]?', lost '+c[1]:', lost nothing')+'. Net '+pzc4Sg(net)+'.';lastEl.textContent=last;
    if(draws.length>=inst.n){fin=1;btns.forEach(function(b){b.disabled=true});S.say(last+' That was the last card. You finished with '+score+' points.');
      S.later(function(){api.done({solved:true,moves:draws.length,hints:hints,undos:0,extra:{par:inst.par,score:score,best:inst.bestFixed,tries:tries}})},350)}
    else S.say(last);
    return true}
  function hintLabel(){if(bh){bh.textContent=lvl===0?'Hint':lvl<3?'More hint':'Show again';bh.setAttribute('aria-label',bh.textContent)}}
  function hint(n){if(fin)return null;n=Math.max(1,Math.min(3,n||lvl+1));lvl=n;hints++;S.clearMarks();var t;
    if(n===1)t='Look at the net total under each deck. A deck that pays big can also cost big.';
    else if(n===2){var bi=-1,i;for(i=0;i<4;i++)if(counts[i]>0&&(bi<0||dnet[i]>dnet[bi]))bi=i;
      t=bi<0?'Draw a few cards from each deck first, then compare their net totals.':'So far Deck '+PZC4.deckLetter(bi)+' has the best net total ('+pzc4Sg(dnet[bi])+'). Keep checking that it stays ahead.'}
    else{S.mark(btns[inst.best],1);t='Deck '+PZC4.deckLetter(inst.best)+' ends highest if you draw all your cards from it. Try it.'}
    S.say(t);hintLabel();return t}
  function restart(){if(fin)return false;draws=[];counts=[0,0,0,0];dnet=[0,0,0,0];score=0;lvl=0;tries++;lastEl.textContent='';hintLabel();render();S.say('Back to the start. Every deck gives the same cards in the same order each time.');return true}
  if(S.showBar){bh=pzBtn('Hint',function(){hint()});br=pzBtn('Try again',restart);S.bar.appendChild(bh);S.bar.appendChild(br)}
  S.key(function(e){var i='1234'.indexOf(e.key);if(i>=0&&!fin){draw(i);return true}return false});
  S.say('Each card can win points, lose points, or both. Tap a deck to draw. Draws cannot be undone; Try again starts over.');
  render();
  return {undo:function(){return false},hint:hint,restart:restart,destroy:S.destroy,moves:function(){return draws.length}}}

/* ---- 2. On the Tip ---- */
function pzc4MountTip(root,inst,api){
  var S=pzc4Shell(root,inst,api,{cls:'pzc4-tip',goal:'Find the word. It has '+inst.len+' letters.'}),
      typed=[],rev=0,wrong=0,fin=0,tb=[],bu,bh,br,slots,revEl=pzEl('ul',{class:'pzc4-rev'}),tray=pzEl('div',{class:'pzc4-tray'});
  S.board.appendChild(pzEl('p',{class:'pzc4-clue'},[pzEl('small',{text:'The clue'}),inst.clue.charAt(0).toUpperCase()+inst.clue.slice(1)+'.']));
  slots=pzEl('div',{class:'pzc4-slots',role:'img'});S.board.appendChild(slots);
  inst.tray.forEach(function(ch,i){var b=pzBtn('Letter '+ch,function(){tap(i)},{text:ch.toUpperCase()});tb.push(b);tray.appendChild(b)});
  S.board.appendChild(tray);S.board.appendChild(revEl);
  function moves(){return rev+wrong}
  function render(){S.clearMarks();var i,w=inst.word,parts=[];slots.textContent='';
    for(i=0;i<inst.len;i++){var known=(i===0&&rev>=1)||(i===1&&rev>=4)||(i===2&&rev>=5),t=i<typed.length?inst.tray[typed[i]]:null,sp=pzEl('span',{'aria-hidden':'true',class:t?'':known?'hintl':'',text:t?t.toUpperCase():known?w.charAt(i).toUpperCase():'_'});
      parts.push(t?t.toUpperCase():known?'clue letter '+w.charAt(i).toUpperCase():'blank');slots.appendChild(sp)}
    slots.setAttribute('aria-label','Your word so far: '+parts.join(', '));
    tb.forEach(function(b,j){b.disabled=typed.indexOf(j)>=0||!!fin});
    S.ct.textContent='Clue reveals '+rev+' · par '+inst.par;if(bu)bu.disabled=!typed.length||!!fin;
    revEl.textContent='';for(i=0;i<rev;i++)revEl.appendChild(pzEl('li',{text:PZC4.tipReveal(inst,i)}))}
  function tap(j){if(fin||typed.indexOf(j)>=0)return false;typed.push(j);render();
    if(typed.length===inst.len){var guess=typed.map(function(x){return inst.tray[x]}).join('');
      if(guess===inst.word){fin=1;render();S.say('Yes, the word is "'+inst.word+'". You used '+pzc4Pl(rev,'clue reveal')+' and '+pzc4Pl(wrong,'wrong try','wrong tries')+'.');
        S.later(function(){api.done({solved:true,moves:moves(),hints:rev,undos:0,extra:{par:inst.par,reveals:rev,wrong:wrong}})},350)}
      else{wrong++;typed=[];if(api.moved)api.moved();render();S.say('That spelled "'+guess+'", which is not the word. Your letters are cleared. Try again.')}}
    return true}
  function undo(){if(fin||!typed.length)return false;typed.pop();render();S.say('Last letter removed.');return true}
  function restart(){if(fin||!typed.length)return false;typed=[];render();S.say('Letters cleared. Clues already shown stay shown.');return true}
  function hint(){if(fin)return null;if(rev>=5){var t0='All five clues are showing.';S.say(t0);return t0}
    var t=PZC4.tipReveal(inst,rev);rev++;if(api.moved)api.moved();render();S.say('Clue '+rev+' of 5. '+t);return t}
  if(S.showBar){bu=pzBtn('Undo',undo);bh=pzBtn('Show a clue',function(){hint()});br=pzBtn('Restart',restart);S.bar.appendChild(bu);S.bar.appendChild(bh);S.bar.appendChild(br)}
  S.key(function(e){if(fin)return false;if(e.key==='Backspace'){undo();return true}
    if(/^[a-zA-Z]$/.test(e.key)){var ch=e.key.toLowerCase();for(var j=0;j<tb.length;j++)if(inst.tray[j]===ch&&typed.indexOf(j)<0){tap(j);return true}}return false});
  S.say('Tap letters to spell the word. Each clue you show adds one to your count; par is '+inst.par+'.');
  render();
  return {undo:undo,hint:hint,restart:restart,destroy:S.destroy,moves:moves}}

/* ---- 3. Sharp or Round ---- */
function pzc4Svg(cls,v){
  var NS='http://www.w3.org/2000/svg',s=document.createElementNS(NS,'svg'),el,pts=[],i,a,r;
  s.setAttribute('viewBox','-50 -50 100 100');s.setAttribute('aria-hidden','true');s.setAttribute('focusable','false');
  if(cls==='round'){
    if(v===0){el=document.createElementNS(NS,'circle');el.setAttribute('r','40')}
    else{var k=v===1?2:3,amp=v===1?.12:.14;for(i=0;i<60;i++){a=i*Math.PI*2/60;r=38*(1+amp*Math.sin(k*a));pts.push((r*Math.cos(a)).toFixed(1)+','+(r*Math.sin(a)).toFixed(1))}
      el=document.createElementNS(NS,'polygon');el.setAttribute('points',pts.join(' '))}}
  else{var n=v===0?5:v===1?6:8,inner=v===0?.42:v===1?.36:.5;for(i=0;i<n*2;i++){a=-Math.PI/2+i*Math.PI/n;r=i%2?46*inner:46;pts.push((r*Math.cos(a)).toFixed(1)+','+(r*Math.sin(a)).toFixed(1))}
    el=document.createElementNS(NS,'polygon');el.setAttribute('points',pts.join(' '))}
  el.setAttribute('fill','var(--tint)');el.setAttribute('stroke','var(--ink)');el.setAttribute('stroke-width','3');el.setAttribute('stroke-linejoin',cls==='round'?'round':'miter');
  s.appendChild(el);return s}
/* optional tone: soft low hum for round words, bright quick pips for sharp ones. Low volume, never required. */
function pzc4Tone(S,cls){
  try{var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;if(!S.ac)S.ac=new AC();var ac=S.ac;if(ac.state==='suspended'&&ac.resume)ac.resume();
    var t=ac.currentTime,g=ac.createGain(),f=ac.createBiquadFilter(),o=ac.createOscillator();o.connect(f);f.connect(g);g.connect(ac.destination);
    g.gain.setValueAtTime(.0001,t);
    if(cls==='round'){o.type='sine';o.frequency.setValueAtTime(247,t);f.type='lowpass';f.frequency.value=600;g.gain.linearRampToValueAtTime(.1,t+.12);g.gain.exponentialRampToValueAtTime(.0001,t+.7);o.start(t);o.stop(t+.75)}
    else{o.type='sawtooth';f.type='highpass';f.frequency.value=700;o.frequency.setValueAtTime(1046,t);o.frequency.setValueAtTime(1318,t+.16);
      [0,.16].forEach(function(d){g.gain.setValueAtTime(.0001,t+d);g.gain.linearRampToValueAtTime(.045,t+d+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d+.11)});o.start(t);o.stop(t+.35)}
    return true}catch(e){return false}}
function pzc4MountSharp(root,inst,api){
  var S=pzc4Shell(root,inst,api,{cls:'pzc4-sharp',goal:'Does it fit the rounded shape or the spiky one?'}),
      ri=0,wrong=0,moveN=0,fin=0,lvl=0,hints=0,sound=false,opts=[],bh,br,bs,bp,
      stage=pzEl('div',{}),snd=pzEl('div',{class:'pzc4-snd'});
  S.board.appendChild(stage);S.board.appendChild(snd);
  S.board.appendChild(pzEl('p',{class:'pzc4-note',text:'Sound is optional. The puzzle works fully muted, with the words shown on screen. If you turn it on, keep your volume low; headphones are fine but not needed.'}));
  S.onDestroy.push(function(){if(S.ac&&S.ac.close)S.ac.close()});
  function cur(){return inst.rounds[ri]}
  function fam(c){return c==='round'?'soft, rounded sounds (b, m, l, n, d, g, w with o and u)':'clipped, bright sounds (k, t, p, z, s with i and e)'}
  function shapeName(c){return c==='round'?'rounded':'spiky'}
  function renderSnd(){snd.textContent='';var r=cur();
    bs=pzBtn(sound?'Sound: on':'Sound: off',function(){sound=!sound;renderSnd();S.say(sound?'Sound is on. Use Play tone to hear a short tone for the word.':'Sound is off.')},{'aria-pressed':sound?'true':'false'});snd.appendChild(bs);
    if(sound&&r.k!=='s2w'){bp=pzBtn('Play tone',function(){pzc4Tone(S,r.target.cls)});snd.appendChild(bp)}}
  function render(){S.clearMarks();var r=cur();stage.textContent='';opts=[];S.ct.textContent='Round '+(ri+1)+' of '+inst.rounds.length+(wrong?' · misses '+wrong:'');
    if(r.k==='s2w'){
      stage.appendChild(pzEl('p',{class:'pzc4-shapebig','aria-label':'A '+shapeName(r.target.cls)+' shape',role:'img'},[pzc4Svg(r.target.cls,r.target.v)]));
      stage.appendChild(pzEl('p',{class:'pzc4-goal',text:'Which made-up word fits this shape?'}));
      var two=pzEl('div',{class:'pzc4-two'});r.opts.forEach(function(o,j){var b=pzBtn('Word '+o.w,function(){pick(j)},{text:o.w,class:'wd'});opts.push(b);two.appendChild(b)});stage.appendChild(two)}
    else{
      if(r.k==='pair')stage.appendChild(pzEl('p',{class:'pzc4-pair'},[pzEl('span',{text:'Two made-up words:'}),pzEl('b',{text:r.words[0].w}),pzEl('b',{text:r.words[1].w})]));
      stage.appendChild(pzEl('p',{class:'pzc4-word',text:r.target.w}));
      stage.appendChild(pzEl('p',{class:'pzc4-goal',style:'text-align:center',text:r.k==='pair'?'Which shape fits "'+r.target.w+'"? The other word gets the other shape.':'Which shape fits this word?'}));
      var tw=pzEl('div',{class:'pzc4-two'});r.opts.forEach(function(o,j){var nm=o.cls==='round'?'Rounded shape':'Spiky shape',b=pzBtn(nm,function(){pick(j)},{text:''});b.appendChild(pzc4Svg(o.cls,o.v));b.appendChild(pzEl('span',{'aria-hidden':'true',text:o.cls==='round'?'Rounded':'Spiky'}));opts.push(b);tw.appendChild(b)});stage.appendChild(tw)}
    renderSnd()}
  function pick(j){if(fin)return false;var r=cur(),cls=r.target.cls;moveN++;if(api.moved)api.moved();lvl=0;hintLabel();
    if(j===r.ans){
      if(ri>=inst.rounds.length-1){fin=1;opts.forEach(function(b){b.disabled=true});S.ct.textContent='All '+inst.rounds.length+' rounds done';
        S.say('Yes. That was the last one. You made '+pzc4Pl(moveN,'pick')+' for '+inst.rounds.length+' rounds.');
        S.later(function(){api.done({solved:true,moves:moveN,hints:hints,undos:0,extra:{par:inst.par,rounds:inst.rounds.length,misses:wrong}})},350)}
      else{var msg='Yes. The word was built from '+fam(cls)+', so it goes with the '+shapeName(cls)+' shape.';ri++;render();S.say(msg+' Next round.')}}
    else{wrong++;S.ct.textContent='Round '+(ri+1)+' of '+inst.rounds.length+' · misses '+wrong;
      S.say(r.k==='s2w'?'Not that one. Words for the '+shapeName(cls)+' shape here are built from '+fam(cls)+'. Try the other word.':'Not that one. "'+r.target.w+'" is built from '+fam(cls)+', so it goes with the '+shapeName(cls)+' shape. Try the other shape.')}
    return true}
  function hintLabel(){if(bh){bh.textContent=lvl===0?'Hint':lvl<3?'More hint':'Show again';bh.setAttribute('aria-label',bh.textContent)}}
  function hint(n){if(fin)return null;n=Math.max(1,Math.min(3,n||lvl+1));lvl=n;hints++;S.clearMarks();var r=cur(),t;
    if(n===1)t='Say it quietly. Smooth, rounded sounds suit a rounded shape; clipped, bright sounds suit a spiky one.';
    else if(n===2)t='In this puzzle, rounded words use b, m, l, n, d, g, w with o and u. Spiky words use k, t, p, z, s with i and e.';
    else{S.mark(opts[r.ans],1);t=r.k==='s2w'?'The word on the marked button fits this '+shapeName(r.target.cls)+' shape.':'The marked button is the '+shapeName(r.target.cls)+' shape, because the word uses '+fam(r.target.cls)+'.'}
    S.say(t);hintLabel();return t}
  function restart(){if(fin)return false;ri=0;wrong=0;moveN=0;lvl=0;hintLabel();render();S.say('Back to round 1.');return true}
  if(S.showBar){bh=pzBtn('Hint',function(){hint()});br=pzBtn('Try again',restart);S.bar.appendChild(bh);S.bar.appendChild(br)}
  S.key(function(e){var j='12'.indexOf(e.key);if(j>=0&&!fin){pick(j);return true}return false});
  S.say('Read the made-up word and pick the shape that fits. Press 1 or 2 to choose the left or right option. Try again starts over.');
  render();
  return {undo:function(){return false},hint:hint,restart:restart,destroy:S.destroy,moves:function(){return moveN}}}

/* ================= registration (stars talk about the puzzle and the route only) ================= */
function pzc4Stars3(s,hints){return hints&&s===3?2:s}
registerPuzzle({id:'risk-deck',name:'Risk Deck',family:'number',theme:'F5',areas:['flex','control'],levels:30,secs:150,undo:false,
  blurb:'Four decks of cards. Find the one that wins over time.',
  how:'Tap a deck to draw its next card. Each card can win points, lose points, or both. Draw all the cards you are given and finish with the most points. Every deck is fixed, so Try again deals the same cards.',
  make:PZC4.makeRisk,mount:pzc4MountRisk,
  stars:function(res,inst){var sc=res.extra&&res.extra.score!=null?res.extra.score:0,ratio=inst.bestFixed>0?sc/inst.bestFixed:0,s=ratio>=.6?3:ratio>=.25?2:1;
    return {stars:pzc4Stars3(s,res.hints),line:'You finished with '+sc+' points. The best single deck gives '+inst.bestFixed+' over these '+inst.n+' cards (Deck '+PZC4.deckLetter(inst.best)+'). Three stars need at least 60 percent of that.'}}});
registerPuzzle({id:'on-the-tip',name:'On the Tip',family:'word',theme:'F3',areas:['memory','flex'],levels:30,secs:75,
  blurb:'A word on the tip of your tongue: guess it from a clue and reveal more if you need.',
  how:'Read the clue and tap letters to spell the word. If it will not come, show the next clue: first letter, a word with the same ending, a related word, then more letters. Fewer reveals and no wrong tries score best.',
  make:PZC4.makeTip,mount:pzc4MountTip,
  stars:function(res,inst){var ex=res.extra||{},rv=ex.reveals!=null?ex.reveals:res.hints||0,wr=ex.wrong||0;
    return {stars:pzStarsByPar(res.moves,inst.par,0),line:'You found "'+inst.word+'" with '+pzc4Pl(rv,'clue reveal')+' and '+pzc4Pl(wr,'wrong try','wrong tries')+'. Par is '+inst.par+': the reveals after which only one word in our list fits the letters shown.'}}});
registerPuzzle({id:'sharp-or-round',name:'Sharp or Round',family:'word',theme:'F2',areas:['attention','flex'],levels:30,secs:75,undo:false,
  blurb:'Match made-up words to rounded or spiky shapes.',
  how:'Read the made-up word and tap the shape that fits it, rounded or spiky. Later levels add more shapes and pairs of words. Each word was built from either soft, rounded sounds or clipped, bright ones, and that is the answer. A tone is optional: the puzzle works fully muted.',
  make:PZC4.makeSharp,mount:pzc4MountSharp,
  stars:function(res,inst){var misses=(res.extra&&res.extra.misses!=null)?res.extra.misses:Math.max(0,res.moves-inst.par);
    return {stars:pzStarsByPar(res.moves,inst.par,res.hints),line:'You matched all '+inst.par+' rounds with '+pzc4Pl(misses,'miss','misses')+'. A perfect run is '+inst.par+' picks.'}}});
