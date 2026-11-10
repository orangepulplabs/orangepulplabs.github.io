/* v5 story: the collectible card face, the story sheet (full text, Worth knowing, sources, Report a mistake), and the yearly kicker chip.
   Story text is unchanged from story_*.js (past-tense, sourced). Nothing here claims any effect of playing. */
function kickChip(id){var k=kick(id);return '<span class="yr">'+esc(k)+'</span>'}
function tierChip(id){var t=tierOf(maxSolved(id));return t?'<span class="tier t'+t+'"><i></i>'+TIER_NAME[t]+'</span>':''}
function cardFace(id,o){o=o||{};var p=P(id),t=tierOf(maxSolved(id)),season=(S().season.got||[]).indexOf('season')>=0&&fam(id).id===seasonFor(T()).fam.id;
  return '<div class="scard'+(t?' t'+t:'')+(season?' season':'')+'"><div class="art">'+art(id,'tile')+'</div><div class="sb"><b>'+esc(p.name)+'</b><small>'+esc(kick(id))+(t?' · '+TIER_NAME[t]:'')+'</small></div></div>'}
function fixFact(s){return String(s||'').replace(/2\^(\d+)/g,'2 to the power $1')}   // audit 04-05: no code-like "2^64"
function storySheet(id){var p=P(id),st=(window.STORY&&STORY[id])||null,ab=(window.ABOUT&&ABOUT[id])||null;ev('story_open');
  var paras=st?st.paras:[ab?ab.from:p.blurb],links=(st&&st.links)||(ab&&ab.links)||[];
  var body=h5('<div class="story"><div class="art hero">'+art(id,'hero')+'</div><div class="meta">'+kickChip(id)+'<span class="chip">'+esc(fam(id).name)+'</span>'+tierChip(id)+'</div>'+
    '<h1 class="h1">'+esc(p.name)+'</h1><div class="paras">'+paras.map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+'</div>'+
    (st&&st.fact?'<div class="wk"><span class="kick">'+icon('spark')+'Worth knowing</span><p>'+esc(fixFact(st.fact))+'</p></div>':'')+
    '<div class="sect">'+Ads.native('Story sheet, under Worth knowing')+'</div>'+
    '<div class="srcs list">'+links.map(function(l){var host='';try{host=new URL(l.u).hostname.replace(/^www\./,'')}catch(e){}return '<a class="row" href="'+esc(l.u)+'" target="_blank" rel="noopener">'+icon('link','chev')+'<span class="rt"><b>'+esc(l.t)+'</b><small>'+esc(host)+'</small></span></a>'}).join('')+
    '<button class="row" data-report>'+icon('flag','chev')+'<span class="rt"><b>Report a mistake</b></span></button></div>'+
    '<p class="legal">Told to the best of our knowledge. Spot an error? Tell us above.</p></div>');
  var sh=Nav.sheet({title:'',body:body,full:true,cls:'storysh'});
  qs(body,'[data-report]').onclick=function(){reportMistake(id)};return sh}
function reportMistake(id){var R=[['wrong_fact','A fact looks wrong'],['wrong_date','A date or name looks wrong'],['broken_link','A link does not work'],['unclear','It is confusing'],['other','Something else']];
  var b=h5('<div><p class="sm">Pick one. This sends nothing about you.</p><div class="list" style="margin-top:8px"></div></div>'),list=qs(b,'.list');
  var sh=Nav.sheet({title:'Report a mistake',body:b});
  R.forEach(function(r){var row=h5('<button class="row"><span class="rt"><b>'+esc(r[1])+'</b></span>'+icon('chev','chev')+'</button>');row.onclick=function(){sh.close();
    fetch(API+'/v1/flag',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({item:id,reason:r[0]})}).then(function(x){toast(x.status===204||x.ok?'Thanks. We will check it.':'Could not send. Try later.')}).catch(function(){toast('Could not send. Try later.')})};list.appendChild(row)})}
