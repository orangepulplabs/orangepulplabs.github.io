/* v5 monetisation surfaces. PLACEHOLDERS ONLY: no ad SDK, no network call, every box says "Ad placeholder".
   Caps are enforced here and tested (tests/flow.py). 13-17 players get the same slots marked non-personalised.
   Future in-app purchase slots exist only behind FLAGS.iap (false): see IAP_SLOTS and plan.md "Owner decisions". */
var ADCAP={rwPerDay:10,itEvery:3,itGapMs:4*60*1000,itPerDay:4,quietDays:2};
var IAP_SLOTS=[{id:'adfree',t:'Ad-free pass',d:'No ads, ever. Hints stay free 3 a day.'},{id:'packs',t:'Story packs',d:'New chapters of true stories.'},
  {id:'cosmetic',t:'Frames and themes',d:'Card frames and app colours. Looks only.'},{id:'tip',t:'Support the studio',d:'A one-off thank-you. Nothing changes in the game.'}];
var Ads=(function(){
  function on(){return FLAGS.ads&&S().age!=='child'}
  function npa(){return S().age==='teen'}   // non-personalised ads for 13-17
  function day(map){var t=T();return map[t]|0}
  function bump(map){var t=T();map[t]=(map[t]|0)+1;Object.keys(map).sort().slice(0,-7).forEach(function(k){delete map[k]})}
  function firstSession(){var v=S();return (v.sessions|0)<=1}
  function rewardedOk(){return on()&&FLAGS.rewarded&&!firstSession()&&day(S().ads.rw)<ADCAP.rwPerDay}
  function interstitialOk(){var v=S(),a=v.ads;if(!on()||!FLAGS.interstitial||firstSession())return false;
    if(!v.first||daysBetween(v.first,T())<ADCAP.quietDays)return false;if((a.runsSince|0)<ADCAP.itEvery)return false;
    if(Date.now()-(a.lastInter||0)<ADCAP.itGapMs)return false;return day(a.it)<ADCAP.itPerDay}
  function nativeOk(where){var v=S();if(!on()||!FLAGS.native)return false;if(!v.first||v.first===T())return false;return true}   // none on the first day
  /* a full-screen placeholder; resolves true when the reward is earned (rewarded) or when closed (interstitial) */
  function full(kind,why){return new Promise(function(res){var secs=kind==='rewarded'?5:3;if(Q.fast)secs=1;
    var n=h5('<div class="adfull" role="dialog" aria-modal="true" aria-label="Ad placeholder"><span class="adl">Ad placeholder · '+(kind==='rewarded'?'rewarded':'interstitial')+(npa()?' · non-personalised':'')+'</span>'+
      '<b>'+(kind==='rewarded'?esc(why||'Reward after the ad'):'A short ad between runs')+'</b><span class="adt num" aria-live="polite">'+secs+'</span>'+
      '<button class="btn sec" data-done hidden>'+(kind==='rewarded'?'Get the reward':'Continue')+'</button><button class="ibtn adx" data-x aria-label="Close" hidden>'+icon('x')+'</button></div>');
    var c=Nav.cover(n,{noBack:true}),t=qs(n,'.adt'),left=secs,earned=false;
    var iv=setInterval(function(){left--;t.textContent=Math.max(0,left);if(left<=0){clearInterval(iv);earned=true;t.textContent='';qs(n,'[data-done]').hidden=false;qs(n,'[data-x]').hidden=false;c.noBack=false;try{qs(n,'[data-done]').focus()}catch(e){}}},Q.fast?60:1000);
    function end(ok){clearInterval(iv);c.close();res(ok)}
    qs(n,'[data-done]').onclick=function(){end(true)};qs(n,'[data-x]').onclick=function(){end(kind!=='rewarded'||earned)}})}
  async function rewarded(why){if(!rewardedOk())return false;ev('ad_rewarded_offer');var ok=await full('rewarded',why);if(ok){bump(S().ads.rw);save();ev('ad_rewarded_done')}return ok}
  /* called when the player taps "One more run"; shows the interstitial only when every cap allows it */
  async function betweenRuns(){var a=S().ads;a.runsSince=(a.runsSince|0)+1;save();if(!interstitialOk())return false;a.runsSince=0;a.lastInter=Date.now();bump(a.it);save();ev('ad_inter_shown');await full('interstitial');return true}
  /* native "Sponsored" card: house ad when there is no paid fill */
  function native(where){if(!nativeOk(where))return '';ev('ad_native_shown');
    return '<aside class="adslot" aria-label="Sponsored, ad placeholder" data-ad="'+esc(where)+'"><span class="adl">Sponsored · Ad placeholder</span><span class="adi" aria-hidden="true"></span><span><b>Native ad slot</b><small>'+esc(where)+(npa()?' · non-personalised':'')+'</small></span></aside>'}
  return {rewardedOk:rewardedOk,interstitialOk:interstitialOk,nativeOk:nativeOk,rewarded:rewarded,betweenRuns:betweenRuns,native:native,npa:npa}
})();
