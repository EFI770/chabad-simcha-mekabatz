'use strict';
const stories=window.STORIES||[];
const tanyaChapters=window.TANYA||[];
const tanyaAliases=window.TANYA_ALIASES||{};
const tanyaStories=tanyaChapters.flatMap(c=>c.stories.map(s=>({...s,categories:[s.chapter]})));
const allStories=[...stories,...tanyaStories];
const $=q=>document.querySelector(q);
const escapeHtml=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=x=>String(x).normalize('NFKD').replace(/[\u0591-\u05C7]/g,'').replace(/["'״׳]/g,'').toLowerCase();
const categoryOrder=['חסידות וחב״ד','שמחה','אמונה וביטחון','אהבת ישראל','צדקה וחסד','שליחות וקירוב','חינוך ומשפחה','תורה ולימוד','שבת וחגים','תפילה','הכנסת אורחים','יושר ואחריות','מסירות נפש','חז״ל','סיפורי התנ״ך'];
let section='chabad',active='',savedOnly=false,favorites=new Set(),current=null,previousFocus=null,toastTimer;
try{const stored=JSON.parse(localStorage.getItem('chabad-story-favorites')||'[]');if(Array.isArray(stored))favorites=new Set(stored.filter(id=>allStories.some(s=>s.id===id)));}catch(e){}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600);}
function save(){try{localStorage.setItem('chabad-story-favorites',JSON.stringify([...favorites]));}catch(e){toast('השמירה זמינה כרגע רק עד סגירת הדף');}}
function toggleSaved(id){favorites.has(id)?favorites.delete(id):favorites.add(id);save();render();if(current===id)updateBookmark();}
function bookmark(s){return `<button class="bookmark" data-save="${s.id}" aria-label="${favorites.has(s.id)?'הסרת':'שמירת'} הסיפור ${escapeHtml(s.title)}" aria-pressed="${favorites.has(s.id)}">${favorites.has(s.id)?'★':'☆'}</button>`;}
function collection(){return section==='tanya'?tanyaStories:stories;}
function metaLabel(s){return s.origin==='tshura'?'נוסח התשורה':s.origin==='chat'?'מההתכתבות':s.origin==='tanya'?'מאתר סיפורי התניא':(s.kind&&s.kind.startsWith('תקציר')?'תקציר עצמאי':'עיבוד עצמאי');}
function results(){const terms=normalize($('#search').value).trim().split(/\s+/).filter(Boolean);return collection().filter(s=>(!active||s.categories.includes(active))&&(!savedOnly||favorites.has(s.id))&&terms.every(q=>normalize([s.title,s.text,s.source,...s.categories].join(' ')).includes(q)));}
function render(){
 $('#saved-count').textContent=favorites.size;$('#saved').setAttribute('aria-pressed',savedOnly);
 document.querySelectorAll('[data-section]').forEach(b=>{b.classList.toggle('active',b.dataset.section===section);b.setAttribute('aria-pressed',b.dataset.section===section);});
 const coll=collection();
 const cats=section==='tanya'?['',...tanyaChapters.map(c=>c.title)]:['',...categoryOrder];
 $('#categories-title').textContent=section==='tanya'?'לפי פרק':'לפי נושא';
 $('#categories').innerHTML=cats.map(c=>`<button class="category ${active===c?'active':''}" data-category="${escapeHtml(c)}" aria-pressed="${active===c}"><span>${escapeHtml(c||'כל הסיפורים')}</span><span class="n">${c?coll.filter(s=>s.categories.includes(c)).length:coll.length}</span></button>`).join('');
 const found=results();$('#count').textContent=found.length+' סיפורים';
 const chSum=section==='tanya'&&active?(tanyaChapters.find(c=>c.title===active)||{}).summary||'':'';
 $('#result-heading').textContent=savedOnly?'השמורים שלי':(active||'כל הסיפורים');
 $('#chapter-summary').textContent=chSum;$('#chapter-summary').hidden=!chSum;
 $('#clear-search').hidden=!$('#search').value;$('#empty').hidden=found.length>0;
 $('#stories').innerHTML=found.map(s=>`<article class="story-card"><div class="card-top"><span class="card-label">${escapeHtml(s.categories[0])}</span>${bookmark(s)}</div><h3><button class="title-button" data-open="${s.id}">${escapeHtml(s.title)}</button></h3><p class="excerpt">${escapeHtml(s.text.split('\n\n')[0])}</p><div class="card-meta"><span>${metaLabel(s)}</span><span>·</span><span>קריאה קצרה</span></div><button class="read-link" data-open="${s.id}">לקריאת הסיפור <span aria-hidden="true">←</span></button><div class="card-actions"><a class="small-action wa" href="${escapeHtml(s.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="שיתוף קישור לסיפור ${escapeHtml(s.title)} בוואטסאפ">וואטסאפ ↗</a><button class="small-action" data-copy="${s.id}">העתקה</button><a class="small-action" href="${escapeHtml(s.source_url)}" target="_blank" rel="noopener noreferrer" aria-label="פתיחת המקור של ${escapeHtml(s.title)}">למקור ↗</a></div></article>`).join('');
}
function setSection(sec){if(section===sec)return;section=sec;active='';savedOnly=false;render();}
function updateBookmark(){const holder=$('#reader-bookmark');if(holder){const s=allStories.find(x=>x.id===current);if(s)holder.innerHTML=bookmark(s);}}
function openStory(id,fromHash=false){let s=allStories.find(x=>x.id===id);if(!s&&tanyaAliases[id]){id=tanyaAliases[id];s=allStories.find(x=>x.id===id);}if(!s){if(fromHash)toast('הקישור אינו תואם לסיפור בספרייה');return;}previousFocus=document.activeElement;current=id;
 $('#reader-content').innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><span class="reader-label">${s.categories.map(escapeHtml).join(' · ')}</span><span id="reader-bookmark">${bookmark(s)}</span></div><h2 id="story-title" class="reader-title">${escapeHtml(s.title)}</h2><p class="reader-info">${escapeHtml(s.kind)}</p><div class="reader-body">${escapeHtml(s.text)}</div>${s.lesson?`<section class="thought"><h3>נקודה למחשבה · הצעת עריכה</h3><p>${escapeHtml(s.lesson)}</p></section>`: ''}<section class="source-box"><strong>המקור לסיפור</strong>${escapeHtml(s.source)}${s.source_note?`<p>${escapeHtml(s.source_note)}</p>`:''}<br><a href="${escapeHtml(s.source_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.source_link_label||'פתיחת המקור המלא ↗')}</a></section><div class="reader-actions"><a class="wa" href="${escapeHtml(s.whatsapp)}" target="_blank" rel="noopener noreferrer">שיתוף קישור בוואטסאפ ↗</a><button data-copy="${s.id}">העתקת הסיפור והמקור</button><button data-link="${s.id}">העתקת קישור</button></div><p class="share-note">וואטסאפ: קישור לסיפור ולמקור. העתקה: הטקסט המלא עם הייחוס. נקודת המחשבה אינה חלק מהטקסט המועתק.</p>`;
 if(!$('#reader').open)$('#reader').showModal();$('#reader').scrollTop=0;$('#close-reader').focus();document.body.style.overflow='hidden';if(!fromHash)history.replaceState(null,'','#story='+encodeURIComponent(id));
}
function closeReader(){if($('#reader').open)$('#reader').close();}
function copyFallback(text){return new Promise(resolve=>{const host=$('#reader').open?$('#reader'):document.body;const input=document.createElement('textarea');input.value=text;input.style.cssText='position:fixed;opacity:0;top:0;right:0';host.appendChild(input);input.focus();input.select();let ok=false;try{ok=document.execCommand('copy');}catch(e){}input.remove();resolve(ok);});}
async function copyText(text){let ok=false;try{await navigator.clipboard.writeText(text);ok=true;}catch(e){ok=await copyFallback(text);}toast(ok?'הועתק בהצלחה':'ההעתקה לא הצליחה. אפשר לסמן ולהעתיק את הטקסט ידנית.');}
function storyLink(id){const u=new URL(location.href);u.hash='story='+encodeURIComponent(id);return u.href;}
document.addEventListener('click',e=>{const b=e.target.closest('[data-category],[data-open],[data-save],[data-copy],[data-link],[data-section]');if(!b)return;if(b.hasAttribute('data-section')){setSection(b.dataset.section);}else if(b.hasAttribute('data-category')){active=b.dataset.category;render();}else if(b.dataset.open)openStory(b.dataset.open);else if(b.dataset.save)toggleSaved(b.dataset.save);else if(b.dataset.copy){const s=allStories.find(x=>x.id===b.dataset.copy);if(s)copyText(s.share_text);}else if(b.dataset.link)copyText(storyLink(b.dataset.link));});
$('#search').addEventListener('input',render);$('#clear-search').addEventListener('click',()=>{$('#search').value='';render();$('#search').focus();});$('#saved').addEventListener('click',()=>{savedOnly=!savedOnly;render();$('#library').scrollIntoView({behavior:'smooth'});});$('#random').addEventListener('click',()=>{const list=results();if(!list.length){toast('לא נמצאו סיפורים בבחירה הנוכחית');return;}openStory(list[Math.floor(Math.random()*list.length)].id);});$('#reset').addEventListener('click',()=>{active='';savedOnly=false;$('#search').value='';render();});$('#close-reader').addEventListener('click',closeReader);$('#reader').addEventListener('click',e=>{if(e.target===$('#reader')){const r=$('#reader').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeReader();}});$('#reader').addEventListener('close',()=>{document.body.style.overflow='';current=null;if(location.hash.startsWith('#story='))history.replaceState(null,'',location.pathname+location.search);previousFocus?.focus?.();});
function route(){if(location.hash.startsWith('#story=')){let id;try{id=decodeURIComponent(location.hash.slice(7));}catch(e){return;}openStory(id,true);}}
// background niggun (ז'עבינער הארץ, באדיבות חב"דפדיה) — low volume, starts on user tap
(function(){const a=$('#bgmusic'),btn=$('#music-toggle');if(!a||!btn)return;a.volume=0.2;let on=false;
 btn.addEventListener('click',()=>{if(on){a.pause();}else{a.play().catch(()=>{toast('הדפדפן חסם את הניגון — נסו לחיצה נוספת');});}on=!on;btn.setAttribute('aria-pressed',on);btn.querySelector('span').textContent=on?'♪ ניגון ברקע: מושמע':'♪ ניגון ברקע: ז׳עבינער הארץ';});
 a.addEventListener('pause',()=>{on=false;btn.setAttribute('aria-pressed','false');btn.querySelector('span').textContent='♪ ניגון ברקע: ז׳עבינער הארץ';});
 a.addEventListener('play',()=>{on=true;btn.setAttribute('aria-pressed','true');btn.querySelector('span').textContent='♪ ניגון ברקע: מושמע';});
})();
window.addEventListener('hashchange',route);$('#total').textContent=allStories.length+' סיפורים · מדור סיפורי התניא לפי פרקים · מקור לכל סיפור';render();route();
