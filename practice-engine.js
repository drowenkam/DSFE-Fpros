(()=>{'use strict';
const ALL=window.FPROS_QUESTIONS||[];
const BY_ID=new Map(ALL.map(q=>[q.id,q]));
const D={1:'Examination & Diagnosis',2:'Investigation & Imaging',3:'Treatment Strategies',4:'Health Promotion',5:'Fixed Prosthodontics',6:'Removable Prosthodontics',7:'Implant Prosthodontics',8:'TMD',9:'Erosive Tooth Wear',10:'Aesthetic Dentistry',11:'Materials Science',12:'Dental Trauma',13:'Digital Dentistry'};
const T=['Diagnostic reasoning','Investigation & imaging','Materials & prosthesis design','Prevention, risk & ethics','Treatment & management'];
const STORE='fpros_mastery_2026_v1', SESSION='fpros_session_2026_v1';
const $=id=>document.getElementById(id),qs=sel=>[...document.querySelectorAll(sel)];
const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
const fmt=n=>Number(n||0).toLocaleString('en-GB');
function safeParse(key,otherwise){try{let x=JSON.parse(localStorage.getItem(key));return x&&typeof x==='object'?x:otherwise}catch{return otherwise}}
let master=safeParse(STORE,{stats:{},history:[],migrated:false});
master.stats=master.stats||{};master.history=master.history||[];
let attempt=safeParse(SESSION,null),reviewMode=false,reviewIds=[];
let currentPool=[];
function save(){try{localStorage.setItem(STORE,JSON.stringify(master))}catch(e){console.warn('Cannot persist study progress',e)}}
function saveAttempt(){try{if(attempt)localStorage.setItem(SESSION,JSON.stringify(attempt));else localStorage.removeItem(SESSION)}catch(e){console.warn('Could not save session',e)}}
// Only import progress from the three current source books, never the retired previous bank.
function migrate(){if(master.migrated)return;
 const keys=['fpros_2026_clinical_decision_book_i_v3','fpros_2026_clinical_decision_book_ii_v3','fpros_book_iii_2026_v1'];
 for(const key of keys){const d=safeParse(key,null);if(!d)continue;
  for(const [id,letter] of Object.entries(d.answers||{})){
    const q=BY_ID.get(id);if(!q||!('ABCDE'.includes(letter)))continue;
    if(!master.stats[id])master.stats[id]={tries:1,correct:letter===q.correct?1:0,lastCorrect:letter===q.correct,lastAnswer:letter,flagged:!!(d.flags||{})[id]};
  }
  for(const [id,v] of Object.entries(d.flags||{}))if(BY_ID.has(id)&&v){const s=master.stats[id]||{tries:0,correct:0};s.flagged=true;master.stats[id]=s}
 }
 master.migrated=true;save();}
migrate();
function selected(name){return qs(`input[name="${name}"]:checked`).map(x=>x.value)}
function mode(){return document.querySelector('input[name="mode"]:checked')?.value||'study'}
function shuffle(arr){let a=arr.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function buildUI(){const dc=$('domain-choices');for(let n=1;n<=13;n++){const lab=document.createElement('label');lab.className='checkline';lab.innerHTML=`<input type="checkbox" name="domain" value="${n}" checked><span>${String(n).padStart(2,'0')} · ${D[n]}</span>`;dc.append(lab)}
 const tc=$('type-choices');for(const t of T){const lab=document.createElement('label');let input=document.createElement('input');input.type='checkbox';input.name='type';input.value=t;input.checked=true;lab.append(input,document.createTextNode(t));tc.append(lab)}
 qs('input[name=book],input[name=domain],input[name=type],input[name=mode]').forEach(x=>x.addEventListener('change',onConfigChange));
 $('focus').addEventListener('change',updatePool);$('count').addEventListener('input',updatePool);$('minutes').addEventListener('input',updatePool);
 $('all-domains').onclick=()=>{qs('input[name=domain]').forEach(x=>x.checked=true);updatePool()};
 $('clear-domains').onclick=()=>{qs('input[name=domain]').forEach(x=>x.checked=false);updatePool()};
 $('all-types').onclick=()=>{qs('input[name=type]').forEach(x=>x.checked=true);updatePool()};
 $('start-attempt').onclick=startAttempt;
 $('resume-attempt').onclick=()=>{if(attempt){if(attempt.phaseDone?.[attempt.phase]||attempt.finished)showResults();else showSession()}};
 $('export-progress').onclick=$('session-export').onclick=$('results-export').onclick=exportProgress;
 $('import-progress').addEventListener('change',importProgress);
 $('review-back').onclick=()=>{if(attempt){reviewMode=false;attempt.reviewMode=false;saveAttempt();showResults()}};
 $('session-new').onclick=()=>{if(confirm('Leave the current attempt? Saved answers remain in your progress history when checked or submitted.')){attempt=null;saveAttempt();showConfig()}};
 $('results-new').onclick=()=>{attempt=null;saveAttempt();showConfig()};
 $('next-paper').onclick=nextPaper;$('review-results').onclick=reviewAnswers;
 $('question-prev').onclick=()=>move(-1);$('question-next').onclick=()=>move(1);
 $('question-flag').onclick=flagCurrent;$('question-reveal').onclick=revealCurrent;$('question-submit').onclick=()=>submitPaper(false);
 const url=new URL(location.href);const b=url.searchParams.get('book');if(['I','II','III'].includes(b)){qs('input[name=book]').forEach(x=>x.checked=x.value===b)}
 const mod=url.searchParams.get('mode');if(['study','timed','exam','full'].includes(mod)){const x=document.querySelector(`input[name=mode][value="${mod}"]`);if(x)x.checked=true}
 onConfigChange();
}
function onConfigChange(){const m=mode();const count=$('count'),minutes=$('minutes');
 if(m==='exam'){count.value=90;minutes.value=120;count.disabled=minutes.disabled=true}
 else if(m==='full'){count.value=180;minutes.value=120;count.disabled=minutes.disabled=true}
 else if(m==='study'){count.disabled=false;minutes.disabled=true}
 else {count.disabled=false;minutes.disabled=false}
 updatePool();}
function filterPool(){const books=new Set(selected('book')),domains=new Set(selected('domain').map(Number)),types=new Set(selected('type'));const focus=$('focus').value;
 return ALL.filter(q=>{
  if(!books.has(q.book)||!domains.has(Number(q.domain))||!q.types.some(t=>types.has(t)))return false;
  const stat=master.stats[q.id];if(focus==='new'&&stat?.tries>0)return false;
  if(focus==='incorrect'&&!(stat?.tries>0&&stat.lastCorrect===false))return false;
  if(focus==='flagged'&&!stat?.flagged)return false;
  return true;
 })}
function updatePool(){currentPool=filterPool();const available=currentPool.length,count=mode()==='exam'?90:mode()==='full'?180:clamp(Number($('count').value)||20,1,1500);
 $('pool-count').textContent=fmt(available);const byBook=['I','II','III'].map(x=>`${x}: ${currentPool.filter(q=>q.book===x).length}`).join(' · ');
 $('pool-breakdown').textContent=byBook+'\nSelected domains: '+selected('domain').length+' · Clinical types: '+selected('type').length;
 const warning=$('pool-warning');warning.classList.toggle('hidden',available>=count&&selected('book').length>0&&selected('domain').length>0&&selected('type').length>0);
 warning.textContent=available<count?`Only ${available} matching questions are available for the requested ${count}. Broaden the filters or reduce the count.`:'Select at least one book, domain and question type.';
 $('start-attempt').disabled=available<count||!selected('domain').length||!selected('type').length||!selected('book').length;
 const stats=Object.values(master.stats),attempted=stats.filter(s=>s.tries>0).length,flagged=stats.filter(s=>s.flagged).length,incorrect=stats.filter(s=>s.tries>0&&s.lastCorrect===false).length;
 $('overall-stats').textContent=`${attempted} of 1,500 attempted · ${incorrect} last answered incorrectly · ${flagged} flagged`;
 $('resume-attempt').hidden=!attempt||Boolean(attempt.finished);}
function targetSample(pool,count){let quotas=count===90?[11,8,10,5,11,10,10,3,7,6,3,3,3]:[21,15,21,10,21,20,20,7,13,12,7,6,7];
 if(!((count===90||count===180)&&selected('domain').length===13&&selected('type').length===T.length&&$('focus').value==='all'))return shuffle(pool).slice(0,count);
 let pick=[],picked=new Set();for(let d=1;d<=13;d++){let eligible=shuffle(pool.filter(x=>x.domain===d));for(const q of eligible.slice(0,quotas[d-1])){pick.push(q);picked.add(q.id)}}
 if(pick.length<count)pick.push(...shuffle(pool.filter(q=>!picked.has(q.id))).slice(0,count-pick.length));
 // Mix domains across both 90-question papers while preserving total distribution.
 return shuffle(pick).slice(0,count);
}
function startAttempt(){const m=mode(),count=m==='exam'?90:m==='full'?180:clamp(Number($('count').value)||20,1,1500),minutes=m==='exam'||m==='full'?120:m==='timed'?clamp(Number($('minutes').value)||30,1,480):0;
 const pool=filterPool();if(pool.length<count){updatePool();return}
 if(attempt&&!attempt.finished&&!confirm('Start a new attempt? Your previous unfinished attempt will be replaced.'))return;
 const picked=targetSample(pool,count);attempt={mode:m,ids:picked.map(x=>x.id),phase:0,index:0,phaseDone:[false,false],answers:{},revealed:{},recorded:{},flags:{},startedAt:Date.now(),minutes,deadline:minutes?(Date.now()+minutes*60000):0,results:[],finished:false,reviewMode:false};reviewMode=false;reviewIds=[];saveAttempt();showSession();}
function range(){if(reviewMode)return reviewIds;
 if(!attempt)return [];
 if(attempt.mode==='full')return attempt.ids.slice(attempt.phase*90,(attempt.phase+1)*90);
 return attempt.ids}
function currentId(){return range()[attempt?.index||0]}
function currentQ(){return BY_ID.get(currentId())}
function showConfig(){$('config-view').classList.remove('hidden');$('session-view').classList.add('hidden');$('results-view').classList.add('hidden');updatePool();window.scrollTo(0,0)}
function showSession(){if(!attempt)return showConfig();reviewMode=!!attempt.reviewMode;if(reviewMode)reviewIds=attempt.reviewIds||attempt.ids.slice(0,attempt.phase*90+90);$('config-view').classList.add('hidden');$('results-view').classList.add('hidden');$('session-view').classList.remove('hidden');render();window.scrollTo(0,0)}
function render(){if(!attempt)return;const arr=range();attempt.index=clamp(attempt.index,0,arr.length-1);const q=currentQ();if(!q)return;
 const selectedAnswer=attempt.answers[q.id],revealed=!!attempt.revealed[q.id]||reviewMode;
 const paperName=attempt.mode==='full'?'Paper '+(attempt.phase+1)+' of 2':attempt.mode==='exam'?'Exam-style paper':attempt.mode==='timed'?'Timed custom practice':'Study mode';
 $('session-mode').textContent=reviewMode?'Answer review':paperName;
 $('session-title').textContent=`Question ${attempt.index+1} of ${arr.length}`;
 $('session-subtitle').textContent=`${q.book==='III'?'Book III':`Book ${q.book}`} · Domain ${q.domain} · ES ${q.es||'—'} · ${q.types.slice(0,2).join(' / ')}`;
 $('session-message').textContent=reviewMode?'Completed attempt: answer choices and explanations are now visible.':(attempt.mode==='study'?'Select an answer, then choose “Check answer”.':'Answer choices remain concealed until this paper is submitted.');
 $('question-source').textContent=`${q.id} · ${q.theme||q.topic||q.domain_name} · Independent educational draft`;
 $('question-stem').textContent=q.stem;$('question-lead').textContent=q.lead||'Choose the single best answer.';
 const choices=$('question-options');choices.replaceChildren();for(const letter of 'ABCDE'){
 const label=document.createElement('label');label.className='answer-option';const input=document.createElement('input');input.type='radio';input.name='answer';input.value=letter;input.checked=selectedAnswer===letter;input.disabled=reviewMode||revealed;
 input.addEventListener('change',()=>{attempt.answers[q.id]=letter;saveAttempt();render()});
 const opt=document.createElement('strong');opt.textContent=letter+'.';const val=document.createElement('span');val.textContent=q.options[letter];label.append(input,opt,val);
 if(revealed&&letter===q.correct)label.classList.add('good');else if(revealed&&letter===selectedAnswer&&letter!==q.correct)label.classList.add('bad');
 choices.append(label)}
 const explanation=$('question-explanation');explanation.classList.toggle('hidden',!revealed);explanation.textContent=revealed?(q.solution||'Proposed answer: '+q.correct):'';
 $('question-flag').textContent=attempt.flags[q.id]?'★ Flagged':'☆ Flag';$('question-flag').disabled=reviewMode;
 $('review-back').classList.toggle('hidden',!reviewMode);
 $('question-reveal').classList.toggle('hidden',attempt.mode!=='study'||reviewMode);
 $('question-reveal').disabled=!selectedAnswer||revealed;
 $('question-submit').classList.toggle('hidden',reviewMode);
 $('question-submit').textContent=attempt.mode==='study'?'Finish this set':(attempt.mode==='full'?'Submit Paper '+(attempt.phase+1):'Submit paper');
 $('question-prev').disabled=attempt.index<=0;$('question-next').disabled=attempt.index>=arr.length-1;
 const answered=arr.filter(id=>attempt.answers[id]).length;
 $('session-progress').style.width=(100*answered/arr.length)+'%';
 $('answered-count').textContent=`${answered} of ${arr.length} answered · ${arr.length-answered} unanswered`;renderPalette();updateTimer();saveAttempt();}
function renderPalette(){const el=$('question-palette');el.replaceChildren();range().forEach((id,i)=>{const b=document.createElement('button');b.type='button';b.className='qnav';if(attempt.answers[id])b.classList.add('answered');if(attempt.flags[id])b.classList.add('flagged');if(attempt.index===i)b.classList.add('current');b.textContent=i+1;b.setAttribute('aria-label',`Question ${i+1}${attempt.answers[id]?', answered':''}${attempt.flags[id]?', flagged':''}`);b.onclick=()=>{attempt.index=i;render()};el.append(b)})}
function move(delta){if(!attempt)return;const a=range();const next=attempt.index+delta;if(next<0||next>=a.length)return;attempt.index=next;render();document.querySelector('#session-view .panel').scrollIntoView({behavior:'smooth',block:'start'});}
function flagCurrent(){if(!attempt||reviewMode)return;const id=currentId();attempt.flags[id]=!attempt.flags[id];const s=master.stats[id]||{tries:0,correct:0};s.flagged=attempt.flags[id];master.stats[id]=s;save();render()}
function record(id){if(attempt.recorded[id])return;const q=BY_ID.get(id);if(!q)return;const a=attempt.answers[id];if(!a)return;let st=master.stats[id]||{tries:0,correct:0,flagged:false};st.tries++;if(a===q.correct)st.correct++;st.lastCorrect=(a===q.correct);st.lastAnswer=a;st.lastAt=Date.now();st.flagged=Boolean(attempt.flags[id]||st.flagged);master.stats[id]=st;attempt.recorded[id]=true;save()}
function revealCurrent(){const id=currentId();if(!attempt||attempt.mode!=='study'||!attempt.answers[id])return;attempt.revealed[id]=true;record(id);render()}
function phaseResult(phase){const ids=attempt.mode==='full'?attempt.ids.slice(phase*90,(phase+1)*90):attempt.ids;
 const answered=ids.filter(id=>attempt.answers[id]).length,correct=ids.filter(id=>attempt.answers[id]===BY_ID.get(id).correct).length;
 return {phase,ids,answered,correct,total:ids.length,percent:Math.round(correct/ids.length*100),time:Date.now()}}
function submitPaper(auto){if(!attempt||attempt.phaseDone[attempt.phase]||reviewMode)return;
 const arr=range(),unanswered=arr.filter(id=>!attempt.answers[id]).length;
 if(!auto&&!confirm(`Submit this ${arr.length}-question paper? ${unanswered} question${unanswered===1?' is':'s are'} unanswered. Proposed answers will be shown after submission.`))return;
 for(const id of arr){record(id);attempt.revealed[id]=true}
 attempt.phaseDone[attempt.phase]=true;attempt.results.push(phaseResult(attempt.phase));attempt.deadline=0;
 if(attempt.mode!=='full'||attempt.phase===1){attempt.finished=true;master.history.unshift({date:Date.now(),mode:attempt.mode,books:[...new Set(attempt.ids.map(id=>BY_ID.get(id)?.book))],results:attempt.results});master.history=master.history.slice(0,40);save()}
 saveAttempt();showResults();}
function showResults(){if(!attempt)return showConfig();$('config-view').classList.add('hidden');$('session-view').classList.add('hidden');$('results-view').classList.remove('hidden');
 const r=attempt.results[attempt.results.length-1];if(!r)return showSession();
 const total=attempt.results.reduce((s,x)=>s+x.total,0),correct=attempt.results.reduce((s,x)=>s+x.correct,0),answered=attempt.results.reduce((s,x)=>s+x.answered,0);
 $('results-title').textContent=attempt.mode==='full'?(attempt.finished?'Both exam papers completed':'Paper 1 submitted — take a break before Paper 2'):'Your practice result';
 const waiting=attempt.mode==='full'&&!attempt.finished;
 const summary=$('result-summary');summary.replaceChildren();for(const [v,label] of (waiting?[['—','Score hidden'],['—','Answer key hidden'],[`${answered}/${total}`,'Paper 1 answered']]:[[`${correct}/${total}`,'Best answers'],[`${Math.round(100*correct/total)}%`,'Score'],[`${answered}/${total}`,'Answered']])){const x=document.createElement('div');const b=document.createElement('strong');b.textContent=v;const s=document.createElement('span');s.textContent=label;x.append(b,s);summary.append(x)}
 const dom=$('result-domains');dom.replaceChildren();const h=document.createElement('h3');h.textContent='Performance by domain';dom.append(h);
 const ids=attempt.results.flatMap(r=>r.ids);dom.classList.toggle('hidden',waiting);for(let n=1;n<=13;n++){const group=ids.filter(id=>BY_ID.get(id)?.domain===n);if(!group.length)continue;const good=group.filter(id=>attempt.answers[id]===BY_ID.get(id).correct).length;
 const row=document.createElement('div');row.className='meterline';const name=document.createElement('span');name.textContent=String(n).padStart(2,'0')+' · '+D[n];const score=document.createElement('strong');score.textContent=`${good}/${group.length} (${Math.round(100*good/group.length)}%)`;row.append(name,score);dom.append(row)}
 $('next-paper').hidden=!(attempt.mode==='full'&&!attempt.finished&&attempt.phase===0);
 $('review-results').hidden=waiting; $('review-results').textContent='Review answers';
 window.scrollTo(0,0);}
function nextPaper(){if(!attempt||attempt.mode!=='full'||attempt.phase!==0||!attempt.phaseDone[0])return;
 attempt.phase=1;attempt.index=0;attempt.reviewMode=false;reviewMode=false;attempt.deadline=Date.now()+120*60000;attempt.startedPaper2At=Date.now();saveAttempt();showSession();}
function reviewAnswers(){if(!attempt)return;reviewMode=true;attempt.reviewMode=true;
 reviewIds=attempt.mode==='full'?(attempt.finished?attempt.ids:attempt.ids.slice(0,90)):attempt.ids;
 attempt.reviewIds=reviewIds;attempt.index=0;saveAttempt();showSession();}
function exportProgress(){let data={schema:'FPROS_2026_3BOOKS',exportedAt:new Date().toISOString(),master,attempt};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='FPros_Books_I_II_III_Progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}
async function importProgress(e){const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(data.schema!=='FPROS_2026_3BOOKS'||!data.master?.stats)throw Error('This is not an F Pros Books I–III progress export.');
 if(!confirm('Import progress, replacing this device’s Book I–III mastery and current session?'))return;
 let clean={stats:{},history:Array.isArray(data.master.history)?data.master.history.slice(0,40):[],migrated:true};
 for(const [id,s] of Object.entries(data.master.stats)){if(BY_ID.has(id)&&s&&typeof s==='object')clean.stats[id]={tries:clamp(Number(s.tries)||0,0,10000),correct:clamp(Number(s.correct)||0,0,10000),lastCorrect:!!s.lastCorrect,lastAnswer:typeof s.lastAnswer==='string'&&'ABCDE'.includes(s.lastAnswer)?s.lastAnswer:null,flagged:!!s.flagged,lastAt:Number(s.lastAt)||0}}
 master=clean;const input=data.attempt;attempt=input&&Array.isArray(input.ids)&&input.ids.every(x=>BY_ID.has(x))?input:null;
 save();saveAttempt();showConfig();alert('Progress imported successfully.')}catch(err){alert('Import failed: '+err.message)}e.target.value=''}
function updateTimer(){if(!attempt)return;const el=$('exam-timer');if(reviewMode||!attempt.minutes){el.textContent=reviewMode?'Review':'Untimed';el.classList.remove('warn');return}
 let sec=Math.max(0,Math.ceil((attempt.deadline-Date.now())/1000));let h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
 el.textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;el.classList.toggle('warn',sec<600);
 if(sec===0&&!attempt.phaseDone[attempt.phase]){submitPaper(true)}}
window.setInterval(()=>{if(attempt&&!reviewMode&&!attempt.phaseDone[attempt.phase]&&!$('session-view').classList.contains('hidden'))updateTimer()},1000);
window.addEventListener('keydown',e=>{if($('session-view').classList.contains('hidden')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.metaKey||e.ctrlKey||e.altKey)return;
 if(e.key==='ArrowLeft')move(-1);else if(e.key==='ArrowRight')move(1);
 else if('12345'.includes(e.key)&&e.key.length===1&&!reviewMode&&!attempt.revealed[currentId()]){const q=currentQ();if(!q)return;attempt.answers[q.id]='ABCDE'[Number(e.key)-1];render()}
 else if(e.key.toLowerCase()==='f')flagCurrent()});
buildUI();if(attempt&&!attempt.finished){if(attempt.phaseDone?.[attempt.phase])showResults();else showSession()}else showConfig();
})();
