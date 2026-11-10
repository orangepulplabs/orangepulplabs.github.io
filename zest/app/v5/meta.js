/* v5 content metadata: a short "kicker" per story (a year, an era, a place or "Legend"), taken only from facts already in that
   puzzle's STORY text (story_*.js). Blank = show the family name. The daily skips puzzles that need sound (they stay in the Almanac).
   Icons: one stroke set, 24px grid. */
var KICK={'disc-tower':'1883','slide-tiles':'1880s','four-by-four':'1782','zero-one':'2009','code-cracker':'1976','word-steps':'1877',
 'parallel-or-not':'1973','missing-triangle':'1955','quick-dots':'1949','balance-weights':'1612','bridge-walk':'1735','dodecahedron-tour':'1857',
 'hundred-drawers':'2003','risk-deck':'1994','on-the-tip':'1966','sharp-or-round':'1929','spotlight-cue':'1979','bigger-faster':'1967',
 'rule-check':'1968','pile-pull':'1901','eight-safe-queens':'1848','same-grey':'1995','swap-starts':'c. 1900','lotus-in-the-lake':'c. 1150',
 'hold-the-interval':'1868','switch-off':'1995','jump-away':'1697','circle-count':'1892','flat-fold-check':'1970','hidden-location':'1913',
 'sequence-keys':'1987','which-was-said':'1959','dot-dash-decoder':'1830s','odd-one-out':'1958','four-shades':'1852','sprout-lines':'1967',
 'link-across':'1942','who-owns-the-zebra':'1962','blink-stream':'1992','count-the-passes':'1999','nine-rings':'1550','living-stones':'1349',
 'endless-rise':'1964','shadow-the-voice':'1953','up-and-down':'1978','missing-e':'1969','word-square':'1925','six-dot-chord':'1824',
 'retell-chain':'1930s','study-gap-planner':'1880s','temple-circles':'1790','mirror-lattice':'1570s','block-match':'c. 1918','mix-to-target':'1704',
 'stone-trap':'1955','hidden-rule-sort':'1940s','seven-pieces':'Early 1800s','sixteen-beat-clap':'13th century','shiva-abbreviations':'Ancient India',
 'magic-three':'Legend','seat-the-guests':'Legend','ring-gate-escape':'Legend','anvil-ratios':'Legend','blockade':'New Zealand','jump-line':'Hawaii',
 'seed-pits':'South India','dot-loop':'Tamil Nadu','shadow-clock':'Jaipur','hidden-stone':'Kyoto','tilt-run':'1880s','two-ways-to-cube':'1729, a taxi',
 'virtue-ladder':'Ancient India','scramble':'Ancient Greece','ghana-order':'Vedic chant','silhouette-match':'Shadow puppets','mill-builder':'Ancient boards',
 'tiger-and-herd':'South India','last-letter-chain':'India','river-ferry':'Alcuin of York'};
var NO_DAILY=['endless-rise','sixteen-beat-clap','shadow-the-voice','up-and-down','dot-dash-decoder','hold-the-interval','who-owns-the-zebra','risk-deck'];
var FIRST_PUZZLE='disc-tower';
var ICO={
 x:'<path d="M6 6l12 12M18 6L6 18"/>',back:'<path d="M15 5l-7 7 7 7"/>',chev:'<path d="M9 5l7 7-7 7"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
 book:'<path d="M2 5c3-1 6-1 10 1 4-2 7-2 10-1v14c-3-1-6-1-10 1-4-2-7-2-10-1z"/><path d="M12 6v14"/>',
 play:'<path d="M8 5l11 7-11 7z"/>',undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',restart:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
 bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
 share:'<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4M12 2v13"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
 check:'<path d="M5 12l5 5 9-10"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
 link:'<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
 spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
 bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 up:'<path d="M6 15l6-6 6 6"/>',star:'<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.3 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/>',
 ad:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 15l2-6 2 6M8.7 13h2.6M15 9v6h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"/>',
 heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'};
function icon(n,cls){return '<svg viewBox="0 0 24 24" aria-hidden="true"'+(cls?' class="'+cls+'"':'')+'>'+(ICO[n]||'')+'</svg>'}
/* the Story-slice mark (~/dev/brand/zest/story-slice-mark.svg), inline so the WebView build needs no extra file */
var MARK='<svg viewBox="0 0 108 108" aria-hidden="true"><path d="M22 50h64a32 32 0 0 1-64 0z" fill="#F7F4EE" stroke="#1B1916" stroke-width="3.2" stroke-linejoin="round"/><path d="M28 50h52a26 26 0 0 1-52 0z" fill="#F7A35C" stroke="#1B1916" stroke-width="2.2" stroke-linejoin="round"/><g stroke="#1B1916" stroke-width="2.2" stroke-linecap="round"><path d="M54 50v26M54 50L36 68M54 50l18 18M54 50L30 58M54 50l24 8"/></g><path d="M54 50c-6-8-18-12-30-10M54 50c6-8 18-12 30-10" fill="none" stroke="#1B1916" stroke-width="3" stroke-linecap="round"/><path d="M54 50V30" stroke="#1B1916" stroke-width="2.6" stroke-linecap="round"/><path d="M54 31c2-6 8-9 13-8-2 6-7 9-13 8z" fill="#6E9B5A" stroke="#1B1916" stroke-width="2" stroke-linejoin="round"/></svg>';
var STAR_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path class="st5" d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.3 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
/* the chain icon: a citrus slice that fills as the chain grows (never wilts) */
function chainIcon(on){return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="'+(on?'var(--accent-2)':'var(--sunk)')+'" stroke="var(--ink)" stroke-width="1.6"/><path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7" stroke="'+(on?'var(--ink)':'var(--edge)')+'" stroke-width="1.2" stroke-linecap="round"/><circle cx="12" cy="12" r="2" fill="'+(on?'var(--surface)':'var(--line)')+'"/></svg>'}

/* hook lines that give away a twist or carry filler (audit 04-08) */
var HOOK_FIX={'count-the-passes':'Count the passes. Watch closely.'};
