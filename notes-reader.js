(()=>{'use strict';
const IDX=window.FPROS_NOTE_INDEX||[], MAX=IDX.length;
const chapters=[[1,'Introduction'],[6,'01 · Examination and Diagnosis'],[23,'02 · Clinical Investigation and Imaging'],[33,'03 · Treatment Strategies'],[48,'04 · Health Promotion and Prevention'],[57,'05 · Fixed Prosthodontics'],[72,'06 · Removable Prosthodontics'],[90,'07 · Implant Prosthodontics'],[104,'08 · Temporomandibular Disorders'],[113,'09 · Erosive Tooth Wear'],[124,'10 · Aesthetic Dentistry'],[130,'11 · Materials Science'],[143,'12 · Dental Traumatology'],[149,'13 · Digital Dentistry'],[154,'High-yield revision & references']];
const $=id=>document.getElementById(id), STATUS=$('notes-status'), Q=$('notes-query');
const LAST='fpros_notebook_authored_2026_last';const BOOKMARKS='fpros_notebook_authored_2026_bookmarks';
let page=1, bookmarks=[];try{bookmarks=JSON.parse(localStorage.getItem(BOOKMARKS)||'[]').filter(n=>n>0&&n<=MAX)}catch{}
const url=new URL(location.href), qp=parseInt(url.searchParams.get('page'),10); let saved=1;try{saved=Number(localStorage.getItem(LAST))||1}catch{}
page=qp>=1&&qp<=MAX?qp:Math.min(MAX,Math.max(1,saved));
function nav(n){if(!Number.isInteger(n)||n<1||n>MAX)return;page=n;render();}
const loaded=new Set(),pending=new Map();window.FPROS_NOTE_PAGES=window.FPROS_NOTE_PAGES||{};
function group(n){return String(Math.floor((n-1)/12)).padStart(2,'0')}
function loadPage(n){return new Promise((resolve,reject)=>{
 const gid=group(n);
 if(window.FPROS_NOTE_PAGES[n])return resolve(window.FPROS_NOTE_PAGES[n]);
 if(pending.has(gid))return pending.get(gid).then(()=>resolve(window.FPROS_NOTE_PAGES[n]),reject);
 const job=new Promise((a,b)=>{const s=document.createElement('script');s.src='./assets/notebook-'+gid+'.js';s.async=true;s.onload=()=>{loaded.add(gid);a()};s.onerror=()=>b(new Error('Could not load page group '+gid));document.head.appendChild(s)});
 pending.set(gid,job);job.then(()=>{pending.delete(gid);resolve(window.FPROS_NOTE_PAGES[n])},reject);
 });}
function chapterFor(n){let x=chapters[0];for(const c of chapters){if(c[0]<=n)x=c;else break}return x}
function syncMarks(){const x=$('notes-bookmarks');x.replaceChildren();if(!bookmarks.length){const span=document.createElement('span');span.className='quiet';span.textContent='No bookmarked pages';x.append(span)}
 for(const n of [...bookmarks].sort((a,b)=>a-b)){const a=document.createElement('button');a.className='btn smallbtn';a.textContent='Page '+n+' · '+chapterFor(n)[1].replace(/^\d+ · /,'');a.onclick=()=>nav(n);x.append(a)}
 $('notes-mark').textContent=bookmarks.includes(page)?'★ Bookmarked':'☆ Bookmark';}
function render(){const n=page,id=n;$('notes-page').value=n;$('notes-title').textContent='Page '+n+' · '+chapterFor(n)[1];
 for(const b of document.querySelectorAll('.chapter-link'))b.classList.toggle('active',+b.dataset.page===chapterFor(n)[0]);
 syncMarks();const frame=$('notes-frame'),img=$('notes-image');img.removeAttribute('src');STATUS.textContent='Loading the exact textbook page…';
 try{localStorage.setItem(LAST,String(n))}catch{}
 const uu=new URL(location.href);uu.searchParams.set('page',n);try{history.replaceState(null,'',uu)}catch{}
 loadPage(n).then(data=>{if(page!==id)return;img.src=data;img.alt='Original uploaded F Pros notebook, PDF page '+n;img.style.width=$('notes-zoom').value+'%';frame.scrollTop=0;frame.scrollLeft=0;STATUS.textContent='Original textbook page '+n+' of '+MAX+' · tables and diagrams preserved';
 const next=n+1;if(next<=MAX && group(next)===group(n))loadPage(next).catch(()=>{});
 }).catch(e=>{if(page===id)STATUS.textContent='Page image could not load. '+e.message+' — confirm notebook files are uploaded in the assets folder.'});
}
const C=$('chapter-list');chapters.forEach(([p,label])=>{const b=document.createElement('button');b.type='button';b.className='chapter-link';b.textContent=label;b.dataset.page=p;b.onclick=()=>nav(p);C.append(b)});
function norm(x){return (x||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function search(){const q=norm(Q.value);const parts=q.split(/\s+/).filter(Boolean),compact=q.replace(/[^a-z0-9]/g,'');let hits=[];
 if(parts.length){for(const r of IDX){const text=norm(r.text),c=text.replace(/[^a-z0-9]/g,'');if(parts.every(w=>text.includes(w)||c.includes(w.replace(/[^a-z0-9]/g,'')))){
 const first=text.indexOf(parts[0]);let excerpt=first>=0?text.slice(Math.max(0,first-60),first+150):text.slice(0,170);
 hits.push({n:r.n,title:r.section,excerpt})}}}
 $('notes-count').textContent=q?`${hits.length} page${hits.length===1?'':'s'} match your search`:'Enter a keyword or ES code';const container=$('notes-results');container.replaceChildren();
 if(!q)return;hits.slice(0,100).forEach(h=>{const b=document.createElement('button');b.className='search-hit';const title=document.createElement('strong');title.textContent='Page '+h.n+' · '+h.title;const desc=document.createElement('small');desc.textContent=h.excerpt; b.append(title,desc);b.onclick=()=>nav(h.n);container.append(b)});
 if(hits.length>100){const p=document.createElement('p');p.className='small';p.textContent='First 100 matches displayed. Refine the search to narrow them.';container.append(p)}
}
$('notes-offline').onclick=async()=>{const b=$('notes-offline');if(!('caches' in window)||location.protocol!=='https:'&&location.hostname!=='localhost'){STATUS.textContent='Offline downloading needs a hosted HTTPS website. The source pages can be read normally while online.';return}b.disabled=true;let good=0;try{const cache=await caches.open('fpros-complete-reset-20261114-v3');for(let g=0;g<14;g++){b.textContent='Saving '+(g+1)+' of 14…';const path='./assets/notebook-'+String(g).padStart(2,'0')+'.js';await cache.add(path);good++;}STATUS.textContent='All 165 original notebook pages saved for offline study on this device.';b.textContent='Offline notebook ready';}catch(e){STATUS.textContent=`Saved ${good} of 14 notebook groups. Connect to Wi-Fi and retry to finish downloading.`;b.textContent='Retry offline saving';b.disabled=false}};
$('notes-search-btn').onclick=search;Q.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search()}});
$('notes-clear').onclick=()=>{Q.value='';search();Q.focus()};$('notes-prev').onclick=$('notes-prev-bottom').onclick=()=>nav(page-1);$('notes-next').onclick=$('notes-next-bottom').onclick=()=>nav(page+1);
$('notes-page').addEventListener('change',e=>nav(Number(e.target.value)));$('notes-zoom').onchange=()=>{const img=$('notes-image');img.style.width=$('notes-zoom').value+'%'}; $('notes-image').onclick=()=>{const z=$('notes-zoom');z.value=z.value==='100'?'170':'100';z.dispatchEvent(new Event('change'))};
$('notes-mark').onclick=()=>{if(bookmarks.includes(page))bookmarks=bookmarks.filter(x=>x!==page);else bookmarks.push(page);try{localStorage.setItem(BOOKMARKS,JSON.stringify(bookmarks))}catch{}syncMarks()};
window.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowLeft')nav(page-1);else if(e.key==='ArrowRight')nav(page+1)});
const searchFromUrl=url.searchParams.get('q');if(searchFromUrl){Q.value=searchFromUrl;search()}render();
})();
