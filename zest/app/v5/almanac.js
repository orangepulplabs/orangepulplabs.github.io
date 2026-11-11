/* v5 Almanac: the collection and the library in one. 86 story cards in 10 chapters (the Ten Families), search, past days.
   A card unlocks when its puzzle is solved once; locked cards show their year and a silhouette (never random, never paid). */
var ALM={sig:''};
Nav.reg('almanac',{label:'Almanac',
  build:function(root){root.innerHTML='<div class="pad"><div class="alhead"><div class="alring" data-ring></div><div><h1 class="h1">Almanac</h1><p class="sm" data-sub></p></div></div>'+
    '<label class="search"><span class="sr">Search stories</span>'+icon('search')+'<input type="search" data-q placeholder="Search stories" aria-label="Search stories" autocomplete="off"></label>'+
    '<div data-res></div><div data-main><div class="sect"><div class="sh"><h2>Chapters</h2><button class="lnk" data-past>Past days</button></div><div class="chaps" data-chaps></div></div></div></div>';
    var q=qs(root,'[data-q]'),tm=0;q.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(function(){almSearch(root,q.value)},120)});
    qs(root,'[data-past]').onclick=function(){openPast()};almRender(root)},
  refresh:function(root){almRender(root)},
  reselect:function(root){root.scrollTo({top:0,behavior:rmOn()?'auto':'smooth'})}});
function almRender(root){var n=cardCount(),N=PUZZLE_ORDER.length,sig=JSON.stringify(S().cards)+JSON.stringify(S().tiers)+S().season.m;if(ALM.sig===sig)return;ALM.sig=sig;
  var C=2*Math.PI*30;qs(root,'[data-ring]').innerHTML='<svg viewBox="0 0 72 72" aria-hidden="true"><circle class="bg" cx="36" cy="36" r="30"/><circle class="fg" cx="36" cy="36" r="30" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-n/N)).toFixed(1)+'"/></svg><b class="num">'+n+'<small>of '+N+'</small></b>';
  qs(root,'[data-sub]').textContent=n?plur(n,'story','stories')+' collected':'Solve a puzzle to collect its story';
  var ss=seasonFor(T()),html='';FAMILIES.forEach(function(f,i){var ids=famCards(f.id),got=famCount(f.id);
    html+='<button class="ccard" data-fam="'+f.id+'"><span class="emb" aria-hidden="true">'+ids.slice(0,4).map(function(id){return '<span>'+art(id,'tile')+'</span>'}).join('')+'</span><span class="rt"><b>'+esc(f.name)+'</b>'+(FLAGS.season&&f.id===ss.fam.id?'<span class="chip acc" style="margin-top:6px;min-height:24px">'+esc(ss.month)+' season</span>':'')+'<span class="pbar" aria-hidden="true"><i style="width:'+(ids.length?got/ids.length*100:0)+'%"></i></span></span><span class="cnt">'+got+'/'+ids.length+'</span></button>';
    if(i===2)html+=Ads.native('Almanac, after chapter 3')});
  var ch=qs(root,'[data-chaps]');ch.innerHTML=html;qsa(ch,'[data-fam]').forEach(function(b){b.onclick=function(){openChapter(b.dataset.fam)}})}
function gridCard(id){var v=S(),got=!!v.cards[id],t=got?tierOf(maxSolved(id)):0;
  return '<button class="gcard'+(got?'':' lock')+(t?' t'+t:'')+'" data-id="'+id+'" aria-label="'+esc(P(id).name)+(got?'':', locked')+'"><span class="art">'+art(id,'tile')+'</span>'+(got?'':'<span class="lk">'+icon('lock')+'</span>')+
    '<span class="gb"><b>'+esc(P(id).name)+'</b><small>'+esc(kick(id))+(t?' · '+TIER_NAME[t]:'')+'</small></span></button>'}
function wireGrid(root){qsa(root,'.gcard[data-id]').forEach(function(b){b.onclick=function(){openCard(b.dataset.id,qs(b,'.art'))}})}
/* search: title words first, then family names, then the hook; word starts only (audit 03-04) */
function almSearch(root,q){var res=qs(root,'[data-res]'),main=qs(root,'[data-main]');q=String(q||'').trim().toLowerCase();if(!q){res.innerHTML='';main.hidden=false;return}
  main.hidden=true;var re=new RegExp('(^|[^a-z])'+q.replace(/[^a-z0-9 ]/g,''),'i'),sc=[];
  PUZZLE_ORDER.forEach(function(id){var p=P(id),s=0;if(re.test(p.name))s=3;else if(re.test(fam(id).name))s=2;else if(re.test(hook(id))||re.test(kick(id)))s=1;if(s)sc.push([s,id])});
  sc.sort(function(a,b){return b[0]-a[0]});
  res.innerHTML=sc.length?'<div class="sect"><div class="grid">'+sc.slice(0,40).map(function(x){return gridCard(x[1])}).join('')+'</div></div>':'<div class="empty"><p>No stories match "'+esc(q)+'". Try one of these:</p><div class="chips"><button class="chip" data-try="tower">tower</button><button class="chip" data-try="words">words</button><button class="chip" data-try="18">1800s</button></div></div>';
  wireGrid(res);qsa(res,'[data-try]').forEach(function(b){b.onclick=function(){var i=qs(root,'[data-q]');i.value=b.dataset.try;almSearch(root,i.value)}})}
function pageShell(title,body){return h5('<section aria-label="'+esc(title)+'"><div class="pghead"><button class="ibtn" data-back aria-label="Back">'+icon('back')+'</button><span class="pt">'+esc(title)+'</span></div><div class="pgbody">'+body+'</div></section>')}
function openChapter(fid,season){var f=FAMILIES.filter(function(x){return x.id===fid})[0],ids=famCards(fid),got=famCount(fid);
  var sec=pageShell(f.name,'<p class="sm">'+esc(f.blurb)+'</p><div class="pbar" style="margin-top:12px"><i style="width:'+(got/ids.length*100)+'%"></i></div><p class="sm num" style="margin-top:6px">'+got+' of '+ids.length+' collected</p>'+
    (season&&FLAGS.season?'<div class="card" style="margin-top:14px"><p class="kick">'+esc(seasonFor(T()).month)+' season</p><p style="margin-top:6px">Each daily puzzle, and each level you solve in this chapter, adds a stamp. 10 stamps earn an indigo accent, and 20 earn a season card frame.</p></div>':'')+
    '<div class="sect"><div class="grid">'+ids.map(gridCard).join('')+'</div></div>');
  qs(sec,'[data-back]').onclick=function(){Nav.pop()};wireGrid(sec);
  Nav.push({name:'chapter',el:sec,notabs:false,onShow:function(el){qsa(el,'.gcard').forEach(function(g){var id=g.dataset.id,n=h5(gridCard(id));if(n.className!==g.className){g.replaceWith(n);n.onclick=function(){openCard(id,qs(n,'.art'))}}})}})}
/* the card page: art, year, hook, tier, the level path, play, read the story */
function openCard(id,fromEl){var p=P(id),v=S(),got=!!v.cards[id],ms=maxSolved(id),t=tierOf(ms),nl=nextLevel(id),z=pzProg(id)||{best:{}};
  var path='';for(var i=1;i<=p.levels;i++){var b=z.best&&z.best[i];path+='<i class="'+(b?(b.stars>=3?'s3':'on'):'')+(i===nl?' cur':'')+'" title="Level '+i+'"></i>'}
  var sec=pageShell(p.name,'<div class="cp"><div class="art hero" data-art>'+art(id,'hero')+'</div><div class="ttl"><h1 class="h1">'+esc(p.name)+'</h1>'+kickChip(id)+'</div>'+
    '<p class="hook">'+esc(hook(id))+'</p><div class="tierrow">'+[1,2,3].map(function(k){return '<span class="tier t'+k+(t>=k?'':' dim')+'"><i></i>'+TIER_NAME[k]+'</span>'}).join('')+'</div>'+
    '<div class="sect"><div class="sh"><h2>Levels</h2><span class="sm num">'+solvedLevels(id).length+' of '+p.levels+'</span></div><div class="path" aria-label="'+solvedLevels(id).length+' of '+p.levels+' levels solved">'+path+'</div></div>'+
    '<div style="display:flex;flex-direction:column;gap:10px;margin-top:24px"><button class="btn pri big wide" data-play>'+icon('play').replace('<svg','<svg style="fill:currentColor;stroke:none"')+(got?'Level '+nl:'Solve to collect')+'</button>'+
    '<button class="btn sec wide" data-story>'+icon('book')+(got?'Read the story':'Read a preview')+'</button></div></div>');
  qs(sec,'[data-back]').onclick=function(){Nav.pop()};
  qs(sec,'[data-play]').onclick=function(){playPuzzle(id,nl,{})};
  qs(sec,'[data-story]').onclick=function(){if(got)storySheet(id);else previewSheet(id)};
  Nav.push({name:'card',el:sec,notabs:true,onShow:function(el){var nl2=nextLevel(id);var b=qs(el,'[data-play]');if(b&&S().cards[id])b.lastChild.textContent='Level '+nl2}},{from:fromEl,toSel:'[data-art]'})}
/* before solving: the first paragraph only, the rest is the reward */
function previewSheet(id){var st=window.STORY&&STORY[id],p=P(id);var b=h5('<div class="story"><div class="art hero">'+art(id,'hero')+'</div><div class="meta">'+kickChip(id)+'</div><h1 class="h1">'+esc(p.name)+'</h1><div class="paras"><p>'+esc(st?st.paras[0]:p.blurb)+'</p></div>'+
  '<div class="card" style="margin-top:18px;display:flex;gap:12px;align-items:center">'+icon('lock').replace('<svg','<svg width="22" height="22" style="stroke:var(--muted);fill:none;stroke-width:2"')+'<span class="sm">Solve level 1 to read the rest and add the card to your Almanac.</span></div><button class="btn pri big wide" data-play style="margin-top:16px">Play level 1</button></div>');
  var sh=Nav.sheet({title:'',body:b,full:true});qs(b,'[data-play]').onclick=function(){sh.close();playPuzzle(id,1,{})}}
/* past days: the last 14 days as rows, newest first (audit 14-01, 14-02) */
function openPast(){var v=S(),t=T(),rows='';ev('archive_opened');for(var i=1;i<=14;i++){var k=addDays(t,-i);if(v.first&&k<addDays(v.first,-7))break;var d=dailyFor(k,99),dn=v.daily[k];
    rows+='<button class="row" data-day="'+k+'"><span class="art tile">'+art(d.id,'tile')+'</span><span class="rt"><b>'+esc(P(d.id).name)+'</b><small>'+esc(dayLabel(k,{weekday:'short',day:'numeric',month:'short'}))+' · #'+d.no+'</small></span>'+(dn?'<span class="chip acc">'+icon('check')+dn.stars+'★</span>':icon('chev','chev'))+'</button>'}
  var sec=pageShell('Past days','<div class="list">'+rows+'</div><p class="sm" style="margin-top:12px">A past puzzle counts like today&rsquo;s: you get its story, and the day counts toward your streak and week.</p>');
  qs(sec,'[data-back]').onclick=function(){Nav.pop()};qsa(sec,'[data-day]').forEach(function(b){b.onclick=function(){var k=b.dataset.day,d=dailyFor(k,99);playPuzzle(d.id,d.level,{past:k})}});
  Nav.push({name:'past',el:sec,notabs:false})}
