(function(){'use strict';
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){
 navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
function fmt(n){return Number(n||0).toLocaleString('en-GB')}
const progress=document.getElementById('home-progress');
if(progress){try{
 const p=JSON.parse(localStorage.getItem('fpros_mastery_2026_v1')||'{}');
 const s=JSON.parse(localStorage.getItem('fpros_session_2026_v1')||'null');
 const a=Object.values(p.stats||{}),done=a.filter(x=>x.tries>0).length,incorrect=a.filter(x=>x.tries>0&&x.lastCorrect===false).length;
 progress.innerHTML=`<div class="stat"><strong>${fmt(done)}</strong><span>Questions attempted</span></div><div class="stat"><strong>${fmt(incorrect)}</strong><span>Last answered incorrectly</span></div><div class="stat"><strong>${s&&!s.finished?'Resume':'Ready'}</strong><span>${s&&!s.finished?'An unfinished attempt was saved':'Start a practice session'}</span></div>`;
}catch{progress.textContent='Your study progress will appear here after you complete questions.'}}
})();
