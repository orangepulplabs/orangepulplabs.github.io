/* v5 retention logic: the daily story, the day chain with rest days, the week goal, the collection, mastery tiers, the season, hints.
   The rules are pure functions over plain objects (chainMark, chainView, weekView, seasonFor...) so tests/logic.js can run them in Node.
   Fair-play rules (plan.md): nothing is lost in a hurtful way, nothing is random or paid, no copy about missed days. */

/* ---------- the daily story: same puzzle for everyone, a shuffled cycle so nothing repeats until the pool is used up ---------- */
var DAY0='2026-01-01';
function v5DailyPool(){return PUZZLE_ORDER.filter(function(id){return NO_DAILY.indexOf(id)<0&&window.ART&&ART[id]&&window.STORY&&STORY[id]})}
var DCYC={};
/* the order for cycle c: a fixed shuffle, with the last 30 of cycle c-1 moved to its end, so nothing repeats within 48 days across the seam (no repeat across the seam) */
function dailyCycle(c,pool){var k=c+'|'+pool.length;if(DCYC[k])return DCYC[k];var o=pzShuffle(pool,pzRng('v5cycle|'+c));
  if(c>0){var tail=dailyCycle(c-1,pool).slice(-30);o=o.filter(function(id){return tail.indexOf(id)<0}).concat(o.filter(function(id){return tail.indexOf(id)>=0}))}
  return DCYC[k]=o}
function dailyFor(day,solvedCount){var pool=v5DailyPool(),n=Math.max(0,daysBetween(DAY0,day)),cyc=Math.floor(n/pool.length),order=dailyCycle(cyc,pool),id=order[n%pool.length];
  var lv=1+Math.floor(pzRng('v5lv|'+day)()*5);if((solvedCount|0)<3)lv=1;   // new players get level 1 (audit 02-01)
  lv=Math.min(lv,(P(id)||{levels:30}).levels);return {id:id,level:lv,day:day,no:n+1}}
function todayDaily(){return dailyFor(T(),totalSolvedPuzzles())}
function dailyDone(day){return !!S().daily[day||T()]}

/* ---------- day chain with free rest days ----------
   A day counts when you solve any puzzle or finish a reel run. You start with 1 rest day; every 7th chain day earns one (max 2).
   A missed day spends a rest day automatically. With none left the chain quietly starts again at 1; the longest chain is kept. */
var REST_MAX=2;
function chainMark(c,day){var r={kind:'same',used:[],earned:0};if(c.last===day)return r;
  if(!c.last){c.n=1;r.kind='start'}
  else{var gap=daysBetween(c.last,day)-1;if(gap<0)return r;
    if(gap===0){c.n++;r.kind='up'}
    else if(c.rest>=gap){c.rest-=gap;for(var i=1;i<=gap;i++)r.used.push(addDays(c.last,i));c.n++;r.kind='rest'}
    else{c.n=1;r.kind='restart'}}
  c.last=day;if(c.n>(c.best|0))c.best=c.n;if(c.n%7===0&&c.rest<REST_MAX){c.rest++;r.earned=1}return r}
function chainView(c,day){if(!c||!c.last)return {n:0,alive:false,done:false,rest:c?c.rest:1};var gap=daysBetween(c.last,day)-1;
  if(gap<0)return {n:c.n,alive:true,done:true,rest:c.rest};if(gap===0)return {n:c.n,alive:true,done:false,rest:c.rest};
  if(c.rest>=gap)return {n:c.n,alive:true,done:false,rest:c.rest-gap,resting:gap};return {n:0,alive:false,done:false,rest:c.rest,best:c.best}}

/* ---------- week goal: Monday to Sunday ---------- */
function weekView(played,restUsed,day,goal){var ws=weekStart(day),out=[],n=0;
  for(var i=0;i<7;i++){var k=addDays(ws,i),st=played[k]?'on':restUsed&&restUsed[k]?'rest':k>day?'fut':k===day?'today':'off';if(played[k])n++;out.push({day:k,st:st,today:k===day,lab:'MTWTFSS'[i]})}
  return {days:out,n:n,goal:goal,met:n>=goal,ws:ws}}

/* ---------- season: one family a month, 20 free stamps, cosmetic rewards only ---------- */
var SEASON_N=20,SEASON_GIFTS={10:{k:'accent',v:'indigo',t:'Indigo accent'},20:{k:'frame',v:'season',t:'Season card frame'}};
function seasonFor(day){var y=+day.slice(0,4),m=+day.slice(5,7)-1,f=FAMILIES[(y*12+m)%FAMILIES.length];return {key:day.slice(0,7),fam:f,month:parseDay(day).toLocaleDateString('en-GB',{month:'long'})}}
function seasonState(){var v=S(),s=seasonFor(T());if(v.season.m!==s.key){v.season={m:s.key,n:0,got:v.season.got||[],seen:{}}}return Object.assign({},s,{n:v.season.n,got:v.season.got})}

/* ---------- one call after every counted win: returns what changed, so the reward screen can choreograph it ---------- */
function markWin(o){var v=S(),day=T(),out={day:day,chain:null,week:null,weekMetNow:false,season:0,gift:null,card:null,tier:0};
  // collection
  if(o.id&&!v.cards[o.id]){v.cards[o.id]={at:Date.now(),day:day};out.card=o.id;ev('card_unlocked')}
  if(o.id){var t=tierOf(maxSolved(o.id)),prev=v.tiers[o.id]|0;if(t>prev){v.tiers[o.id]=t;if(prev>0){out.tier=t;ev('tier_up')}}}
  // the day
  var wasPlayed=!!v.played[day];v.played[day]=1;
  if(!wasPlayed){var wk0=weekView(v.played,v.chain.restUsed,day,v.weekGoal);
    var r=chainMark(v.chain,day);r.used.forEach(function(k){v.chain.restUsed[k]=1;ev('rest_used')});out.chain=r;ev('chain_day');
    var wk=weekView(v.played,v.chain.restUsed,day,v.weekGoal);out.week=wk;if(wk.met&&!v.weekMetMarks[wk.ws]){v.weekMetMarks[wk.ws]=1;v.weeksMet++;out.weekMetNow=true;ev('week_goal_met')}}
  // season stamp: a daily, or a puzzle level in the month's family
  if(FLAGS.season){var ss=seasonState(),key=(o.daily?'d:'+day:'p:'+o.id+':'+o.level);v.season.seen=v.season.seen||{};
    if((o.daily||(o.id&&fam(o.id).id===ss.fam.id))&&!v.season.seen[key]&&v.season.n<SEASON_N){v.season.seen[key]=1;v.season.n++;out.season=v.season.n;ev('season_stamp');
      var g=SEASON_GIFTS[v.season.n];if(g&&v.season.got.indexOf(g.v)<0){v.season.got.push(g.v);out.gift=g}}}
  save();return out}

/* ---------- hints: the first hint of every puzzle is free; then 3 free a day; then a rewarded ad (placeholder) ---------- */
function hintBank(){var v=S(),t=T();if(v.hints.day!==t){v.hints={day:t,left:3}}return v.hints}
/* collection counts */
function cardCount(){var v=S();return Object.keys(v.cards).filter(function(id){return P(id)}).length}
function famCards(fid){return PUZZLE_ORDER.filter(function(id){return fam(id).id===fid})}
function famCount(fid){var v=S();return famCards(fid).filter(function(id){return v.cards[id]}).length}
/* "Keep going": unlocked cards with a next level, most recent first; then the gentlest locked cards */
function keepGoing(n){var v=S(),out=[];Object.keys(v.cards).sort(function(a,b){return (v.cards[b].at||0)-(v.cards[a].at||0)}).forEach(function(id){if(P(id)&&maxSolved(id)<P(id).levels)out.push({id:id,lv:nextLevel(id)})});
  var start=['few-swaps','make-target','word-steps','tilt-run','slide-tiles','switch-off','eight-safe-queens','lotus-in-the-lake','balance-weights','scramble'];
  start.concat(PUZZLE_ORDER).forEach(function(id){if(out.length<n*2&&P(id)&&!v.cards[id]&&!out.some(function(x){return x.id===id})&&NO_DAILY.indexOf(id)<0)out.push({id:id,lv:1,lock:1})});
  var d=todayDaily();return out.filter(function(x){return x.id!==d.id}).slice(0,n)}
/* welcome back after 3+ days away (time away is never shown) */
function awayDays(){var v=S();if(!v.lastSeenDay)return 0;return daysBetween(v.lastSeenDay,T())}
