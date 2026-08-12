(function () {
  const storage = window.CISMStorage;
  const contentBank = window.CISMContent;
  const activeBank = window.CISMActiveLearning;
  const coach = window.CISMDailyCoach;
  const mixedBank = window.CISMMixedPractice;
  const overlay = document.getElementById("dailyOverlay"), body = document.getElementById("dailyContent"), nextButton = document.getElementById("dailyNextButton"), closeButton = document.getElementById("closeDailyButton"), progressBar = document.getElementById("dailyProgressBar"), headerTitle = document.getElementById("dailyHeaderTitle");
  let phaseIndex=0, plan=null, local={};
  const phases=["recall","learn","lifecycle","decoder","apply","repair","close"];
  const domainNames={"1":"Governance","2":"Risk Management","3":"Security Program","4":"Incident Management"};
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  function mastery(){return storage.getActiveLearning().mastery||{}}
  function conceptDomain(concept){for(const [d,lab] of Object.entries(activeBank||{})) if((lab.challenges||[]).some(c=>c.concept===concept)) return d; return null}
  function focusDomain(){const curriculum=storage.getCurriculum();if(curriculum.phase==="learning")return String(curriculum.currentDomain||"1");const ex=storage.getExamReadiness().exams||[];if(ex.length){const r=Object.entries(ex.at(-1).domainStats||{}).filter(([,s])=>s.t).sort((a,b)=>a[1].c/a[1].t-b[1].c/b[1].t);if(r.length)return r[0][0]}const ms=Object.entries(mastery()).sort((a,b)=>(a[1].attempts?a[1].correct/a[1].attempts:0)-(b[1].attempts?b[1].correct/b[1].attempts:0));for(const [c] of ms){const dd=conceptDomain(c);if(dd)return dd}return "1"}
  function focusConcept(d){const curriculum=storage.getCurriculum(),concepts=contentBank?.domains?.[d]?.concepts||[];if(curriculum.phase==="learning"){
    // First-pass learning teaches NEW material in order (handoff sec.5). A concept
    // already taught only comes back if it is GENUINELY weak - previously any
    // taught concept with a mastery record outranked unseen material, which
    // pinned the learner to one concept forever even at 100% correct.
    const studied=new Set(curriculum.studiedConcepts?.[String(d)]||[]);
    const introduced=new Set(curriculum.introducedConcepts?.[String(d)]||[]);
    const titles=new Set(concepts.map(x=>x.title));
    // "Needs Refresh" flips on a SINGLE miss, so it cannot gate focus selection
    // on its own: a learner answering ~80% correct would re-flag the concept
    // most days and never advance. Require sustained evidence instead.
    const isWeak=m=>m.attempts>=4&&m.correct/m.attempts<0.6;
    // Never re-serve yesterday's concept as today's focus while untaught
    // material remains in the domain. Forward progress is the priority during
    // first-pass learning; weak concepts return through recall and repair.
    const lastFocus=storage.getTodayStudy()?.focusConcept;
    const untaughtRemains=concepts.some(c=>!studied.has(c.title));
    const weak=Object.entries(mastery())
      .filter(([c,m])=>titles.has(c)&&introduced.has(c)&&isWeak(m)
        &&!(untaughtRemains&&c===lastFocus))
      .sort((a,b)=>(a[1].attempts?a[1].correct/a[1].attempts:0)-(b[1].attempts?b[1].correct/b[1].attempts:0));
    if(weak[0])return weak[0][0];
    // Next untaught concept. studiedConcepts is the honest record of what a
    // session actually covered, so fall back to it before introducedConcepts.
    const unseen=concepts.find(c=>!studied.has(c.title))||concepts.find(c=>!introduced.has(c.title));
    return unseen?.title||concepts[0]?.title||domainNames[d]}// Reinforcement: rotate across the weakest concepts instead of returning the
  // single lowest every day. Always picking the minimum pinned the learner to
  // one concept, because a day of practice rarely changes which concept ranks
  // last. Yesterday's focus is excluded while alternatives exist.
  const titleSet=new Set(concepts.map(x=>x.title));
  const last=storage.getTodayStudy()?.focusConcept;
  const ranked=Object.entries(mastery())
    .filter(([c])=>titleSet.has(c)||conceptDomain(c)===d)
    .sort((a,b)=>(a[1].attempts?a[1].correct/a[1].attempts:0)-(b[1].attempts?b[1].correct/b[1].attempts:0));
  const untouched=concepts.filter(x=>!ranked.some(([c])=>c===x.title)).map(x=>x.title);
  // Concepts with no evidence at all are the most useful thing to revisit.
  const pool=[...untouched,...ranked.slice(0,4).map(([c])=>c)];
  const choices=pool.filter(c=>c!==last);
  const from=choices.length?choices:pool;
  return from[Math.floor(Math.random()*from.length)]||concepts[0]?.title||domainNames[d]}
  function memoryFor(d,c){return activeBank?.[d]?.challenges?.find(x=>x.concept===c)?.memory||contentBank?.domains?.[d]?.comparisons?.[0]?.memory||"Right role + right stage + business context."}
  function buildRecall(d,c){const curriculum=storage.getCurriculum(),out=[{concept:c,memory:memoryFor(d,c)}],allowed=new Set();Object.entries(curriculum.introducedConcepts||{}).forEach(([domain,names])=>(names||[]).forEach(name=>allowed.add(`${domain}:${name}`)));for(const [name,m] of Object.entries(mastery())){if(out.length>=3)break;const dd=conceptDomain(name);if(!dd||name===c)continue;if(curriculum.phase==="learning"&&!allowed.has(`${dd}:${name}`))continue;if(m.state==="Needs Refresh"||m.state==="Learning"||allowed.has(`${dd}:${name}`))out.push({concept:name,memory:memoryFor(dd,name)})}for(const rule of ["FIRST → find the missing prerequisite.","Security advises → business authority decides.","Correct action + wrong lifecycle stage = wrong answer."]){if(out.length>=3)break;out.push({concept:"CISM reasoning",memory:rule})}return out.slice(0,3)}
  function weakestMindset(){const m=storage.getMixedPractice().mindset||{};const dims=["qualifier","role","lifecycle","decision"].map(k=>({k,...(m[k]||{attempts:0,correct:0})}));dims.forEach(x=>x.rate=x.attempts?x.correct/x.attempts:0);return dims.sort((a,b)=>a.rate-b.rate||a.attempts-b.attempts)[0]?.k||"role"}
  function hasMindsetEvidence(){const m=storage.getMixedPractice().mindset||{};return ["qualifier","role","lifecycle","decision"].some(k=>(m[k]?.attempts||0)>0)}
  // With no decoder evidence yet there is no "weakest" dimension to repair, so
  // start with the constraint lesson, which teaches the general habit of reading
  // the whole stem before eliminating answers.
  // A dimension may have more than one lesson (qualifier has both the general
  // decoder and the MOST vs BEST comparison). Rotate across days so the learner
  // sees each of them rather than only the first match.
  function decoderLesson(){const lessons=coach.decoderLessons||[];
    if(!hasMindsetEvidence()){const intro=lessons.find(x=>x.dimension==="constraint");if(intro)return intro}
    const weak=weakestMindset(),matches=lessons.filter(x=>x.dimension===weak);
    if(!matches.length)return lessons[0];
    const seen=Object.values(storage.getDailyStudy().days||{}).filter(d=>d&&d.phases&&d.phases.decoder).length;
    return matches[seen%matches.length]}
  // PURE. buildPlan() must never write. It is called by getSummary() on every
  // home-screen render and on four different events; when it wrote to the
  // curriculum, merely looking at the home screen marked concepts as taught and
  // domains completed themselves. Session writes now live in open() only.
  function buildPlan(){const curriculum=storage.getCurriculum(),t=storage.getTodayStudy(),computed=focusDomain(),d=curriculum.phase==="learning"?computed:(t.focusDomain||computed),c=curriculum.phase==="learning"?focusConcept(d):(t.focusConcept||focusConcept(d)),defs=coach.definitions[d]||[],life=(coach.lifecycleExercises[d]||coach.lifecycleExercises["2"]||[]).filter(isLifecycleStageExercise),lesson=decoderLesson();const why=curriculum.phase==="learning"?`Domain ${d} is your current learning stage. Daily Study will teach here and only reinforce material you have already been introduced to.`:`All four domains are complete. Daily Study selected Domain ${d} from your recent learning evidence.`;return{domain:d,concept:c,domainName:domainNames[d],recall:buildRecall(d,c),definitions:defs.slice(0,2),life:life.slice(0,2),lesson,why,curriculum}}
  // Only stage-format exercises ({stem,answer,why,trap}) can be rendered by
  // renderLifecycle(). Guarding here stops a mis-shaped entry from producing a
  // blank, unanswerable question.
  function isLifecycleStageExercise(x){return !!x&&typeof x.stem==="string"&&typeof x.answer==="string"}
  function done(k){return !!storage.getTodayStudy().phases?.[k]}
  function mark(k){storage.setTodayStudy({phases:{[k]:true}});updateProgress();document.dispatchEvent(new CustomEvent("cism-daily-updated"))}
  function updateProgress(){const t=storage.getTodayStudy(),n=phases.filter(p=>t.phases?.[p]).length;progressBar.style.width=`${n/phases.length*100}%`}
  function phaseHeader(k,t,n,time){return `<div class="daily-phase-top"><div><div class="mixed-stage">${esc(k)}</div><h2>${esc(t)}</h2><p>${esc(n)}</p></div><span>${esc(time)}</span></div>`}
  function open(){plan=buildPlan();
    // Advance the curriculum here rather than relying on the learner reaching
    // the session's final screen. Previously advanceDomainIfReady() ran only in
    // renderClose(), so an abandoned session could leave a fully-taught domain
    // current and re-serve already-mastered concepts indefinitely.
    if(plan.curriculum.phase==="learning"){
      const titles=(contentBank?.domains?.[plan.domain]?.concepts||[]).map(x=>x.title);
      const studied=plan.curriculum.studiedConcepts?.[String(plan.domain)]||[];
      if(titles.length&&titles.every(t=>studied.includes(t))){
        storage.markDomainComplete(plan.domain);
        plan=buildPlan();
      }
    }
    // The learner has actually started a session: this is the only place the
    // curriculum is allowed to record that a concept was taught.
    storage.markConceptStudied(plan.domain,plan.concept);
    storage.setTodayStudy({focusDomain:plan.domain,focusConcept:plan.concept});
    local={recall:new Set(),lifeIndex:0,lifeSelected:null,lifeChecked:false,decoderSelected:null,decoderChecked:false,applyIndex:0,applySelected:null,applyChecked:false,applyResults:[]};const t=storage.getTodayStudy(),i=phases.findIndex(p=>!t.phases?.[p]);phaseIndex=i<0?phases.length-1:i;overlay.classList.remove("hidden");overlay.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";render()}
  function close(){overlay.classList.add("hidden");overlay.setAttribute("aria-hidden","true");document.body.style.overflow="";document.dispatchEvent(new CustomEvent("cism-daily-updated"))}
  function render(){updateProgress();headerTitle.textContent=`D${plan.domain} · ${plan.domainName}`;({recall:renderRecall,learn:renderLearn,lifecycle:renderLifecycle,decoder:renderDecoder,apply:renderApply,repair:renderRepair,close:renderClose}[phases[phaseIndex]])()}
  function goNext(key){mark(key);phaseIndex++;render()}
  function renderRecall(){body.innerHTML=`<article class="daily-phase">${phaseHeader("1 · QUICK RECALL","Pull it from memory.","Try first, then reveal. This is retrieval—not rereading.","~3 min")}<div class="daily-recall-grid">${plan.recall.map((r,i)=>`<button class="daily-recall-card ${local.recall.has(i)?"revealed":""}" data-r="${i}"><span>${esc(r.concept)}</span>${local.recall.has(i)?`<strong>${esc(r.memory)}</strong><small>Say why this rule is true in your own words.</small>`:`<strong>What is the rule?</strong><small>Try to retrieve it before tapping.</small>`}</button>`).join("")}</div></article>`;body.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{local.recall.add(+b.dataset.r);renderRecall()});nextButton.textContent="Continue →";nextButton.onclick=()=>goNext("recall")}
  function renderLearn(){body.innerHTML=`<article class="daily-phase"><div class="daily-why-card"><span>WHY YOU’RE SEEING THIS</span><strong>${esc(plan.why)}</strong></div>${phaseHeader("2 · LEARN","Definitions that help you eliminate answers.","Only a few terms, tied to exam recognition—not a glossary marathon.","~4 min")}<div class="daily-teach-grid">${plan.definitions.map(d=>`<div class="daily-teach-card"><span>TERM</span><strong>${esc(d.term)}</strong><p>${esc(d.plain)}</p><div class="daily-term-line"><b>Recognition clue</b><p>${esc(d.clue)}</p></div><div class="daily-term-line"><b>Don't confuse it with</b><p>${esc(d.contrast)}</p></div><div class="study-memory-rule"><div class="memory-rule-icon">↳</div><div><span>MEMORY RULE</span><strong>${esc(d.memory)}</strong></div></div></div>`).join("")}</div></article>`;nextButton.textContent="Apply it →";nextButton.onclick=()=>goNext("learn")}
  function renderLifecycle(){const q=plan.life[local.lifeIndex]||plan.life[0],stages=contentBank?.domains?.[plan.domain]?.lifecycle||[];if(!q||!stages.length){goNext("lifecycle");return}body.innerHTML=`<article class="daily-phase">${phaseHeader("3 · LIFECYCLE APPLICATION","Locate yourself in the process.","Do not recite the order. Use what has already happened in the scenario to identify the stage.","~5 min")}<div class="daily-lifecycle-map">${stages.map(s=>`<span class="${local.lifeChecked&&s===q.answer?"current":""}">${esc(s)}</span>`).join("")}</div><div class="daily-exercise-card"><span>WHERE ARE WE?</span><h3>${esc(q.stem)}</h3><div class="daily-choice-list">${stages.map(s=>`<button class="daily-choice ${local.lifeSelected===s?"selected":""} ${local.lifeChecked&&s===q.answer?"correct":""} ${local.lifeChecked&&local.lifeSelected===s&&s!==q.answer?"wrong":""}" data-life="${esc(s)}">${esc(s)}</button>`).join("")}</div>${local.lifeChecked?`<div class="daily-explanation"><strong>${local.lifeSelected===q.answer?"Yes — and here is why.":`Best stage: ${esc(q.answer)}`}</strong><p>${esc(q.why)}</p><p><b>Why the tempting jump fails:</b> ${esc(q.trap)}</p></div>`:""}</div></article>`;body.querySelectorAll("[data-life]").forEach(b=>b.onclick=()=>{if(!local.lifeChecked){local.lifeSelected=b.dataset.life;renderLifecycle()}});nextButton.textContent=local.lifeChecked?(local.lifeIndex<plan.life.length-1?"Next scenario →":"Continue →"):"Check reasoning";nextButton.disabled=!local.lifeSelected&&!local.lifeChecked;nextButton.onclick=()=>{if(!local.lifeChecked){local.lifeChecked=true;renderLifecycle();return}if(local.lifeIndex<plan.life.length-1){local.lifeIndex++;local.lifeSelected=null;local.lifeChecked=false;renderLifecycle()}else goNext("lifecycle")}}
  function renderDecoder(){const l=plan.lesson;body.innerHTML=`<article class="daily-phase">${phaseHeader("4 · CISM QUESTION DECODER",l.title,"We teach the signal before expecting you to recognize it under exam wording.","~5 min")}<div class="daily-decoder-rule">${esc(l.rule)}</div><div class="daily-exercise-card"><span>RECOGNITION CHECK</span><h3>${esc(l.question)}</h3><div class="daily-choice-list">${l.options.map((o,i)=>`<button class="daily-choice ${local.decoderSelected===i?"selected":""} ${local.decoderChecked&&i===l.correctIndex?"correct":""} ${local.decoderChecked&&local.decoderSelected===i&&i!==l.correctIndex?"wrong":""}" data-dec="${i}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join("")}</div>${local.decoderChecked?`<div class="daily-explanation"><strong>${local.decoderSelected===l.correctIndex?"Correct — now make the reason automatic.":"This is the distinction to keep."}</strong><p>${esc(l.why)}</p></div>`:""}</div></article>`;body.querySelectorAll("[data-dec]").forEach(b=>b.onclick=()=>{if(!local.decoderChecked){local.decoderSelected=+b.dataset.dec;renderDecoder()}});nextButton.disabled=local.decoderSelected==null&&!local.decoderChecked;nextButton.textContent=local.decoderChecked?"Use it on exam wording →":"Check reasoning";nextButton.onclick=()=>{if(!local.decoderChecked){local.decoderChecked=true;renderDecoder()}else goNext("decoder")}}
  function conceptMatches(a,b){const x=String(a||"").toLowerCase(),y=String(b||"").toLowerCase();return x===y||x.includes(y)||y.includes(x)}
  function applicationQuestions(){
    const d=String(plan.domain),curriculum=storage.getCurriculum();
    // Pool = bundled curriculum-tagged questions plus any locally imported
    // questions for this domain. Previously only the small bundled bank was
    // used, so a domain could offer the same handful of questions forever.
    const localQs=(window.CISMLocalQuestionSet?.questions||[]).filter(q=>String(q.domain)===d);
    const all=[...(mixedBank.questions||[]).filter(q=>String(q.domain)===d),...localQs];
    // Questions answered in recent daily sessions, so they are not re-served.
    const recent=new Set((storage.getMixedPractice().attempts||[])
      .filter(a=>typeof a.questionId==="string"&&a.questionId.startsWith("daily:"))
      .slice(-40).map(a=>a.questionId.slice(6)));
    const fresh=x=>!recent.has(x.id);
    let tiers;
    if(curriculum.phase==="learning"){
      const introduced=curriculum.introducedConcepts?.[d]||[];
      const onConcept=all.filter(q=>conceptMatches(q.concept,plan.concept));
      const onTaught=all.filter(q=>!onConcept.includes(q)&&introduced.some(c=>conceptMatches(q.concept,c)));
      // Same-domain filler keeps the session complete when curriculum-tagged
      // questions run out. Curriculum-aligned questions always come first.
      const filler=all.filter(q=>!onConcept.includes(q)&&!onTaught.includes(q));
      tiers=[onConcept,onTaught,filler];
    } else {
      const onConcept=all.filter(q=>conceptMatches(q.concept,plan.concept));
      tiers=[onConcept,all.filter(q=>!onConcept.includes(q))];
    }
    const picked=[];
    for(const tier of tiers){
      if(picked.length>=3) break;
      // Unseen first, then anything, shuffled so the same three never recur.
      for(const group of [tier.filter(fresh),tier.filter(x=>!fresh(x))]){
        const pool=shuffle(group.slice());
        for(const q of pool){
          if(picked.length>=3) break;
          if(!picked.some(x=>x.id===q.id)) picked.push(q);
        }
      }
    }
    return picked;
  }
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a}

  // Resolved once per session. It was previously recomputed on every render, and
  // because it depends on introducedConcepts (which grows during a session) the
  // list could reorder underneath local.applyIndex and swap the question the
  // learner was mid-way through answering.
  function currentApplyQuestions(){if(!local.applyQuestions)local.applyQuestions=applicationQuestions();return local.applyQuestions}
  function renderApply(){const qs=currentApplyQuestions(),q=qs[local.applyIndex];if(!q){goNext("apply");return}body.innerHTML=`<article class="daily-phase">${phaseHeader("5 · APPLY","Now answer the CISM-style question.","The wording is intentionally less tidy. Read for role, qualifier, lifecycle, objective, constraint, and authority.","~8–10 min")}<div><span class="daily-skill-tag">ROLE</span><span class="daily-skill-tag">QUALIFIER</span><span class="daily-skill-tag">LIFECYCLE</span><span class="daily-skill-tag">CONSTRAINT</span></div><div class="daily-exercise-card" style="margin-top:14px"><span>QUESTION ${local.applyIndex+1} OF ${qs.length}</span><h3>${esc(q.stem)}</h3><div class="daily-choice-list">${q.options.map((o,i)=>`<button class="daily-choice ${local.applySelected===i?"selected":""} ${local.applyChecked&&i===q.correctIndex?"correct":""} ${local.applyChecked&&local.applySelected===i&&i!==q.correctIndex?"wrong":""}" data-app="${i}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join("")}</div>${local.applyChecked?`<div class="daily-explanation"><strong>${local.applySelected===q.correctIndex?"Correct — but the reason is the part to keep.":`Best answer: ${String.fromCharCode(65+q.correctIndex)}. ${esc(q.options[q.correctIndex])}`}</strong><p>${esc(q.rationale)}</p><div class="daily-term-line"><b>How to read this question</b><p><b>Role:</b> ${esc(q.role)} · <b>Qualifier:</b> ${esc(q.qualifier)} · <b>Lifecycle:</b> ${esc(q.lifecycle)} · <b>Decision:</b> ${esc(q.decision)}</p></div><div class="study-memory-rule"><div class="memory-rule-icon">↳</div><div><span>MEMORY RULE</span><strong>${esc(q.memory)}</strong></div></div></div>`:""}</div></article>`;body.querySelectorAll("[data-app]").forEach(b=>b.onclick=()=>{if(!local.applyChecked){local.applySelected=+b.dataset.app;renderApply()}});nextButton.disabled=local.applySelected==null&&!local.applyChecked;nextButton.textContent=local.applyChecked?(local.applyIndex<qs.length-1?"Next question →":"Review today →"):"Check answer";nextButton.onclick=()=>{if(!local.applyChecked){local.applyChecked=true;const correct=local.applySelected===q.correctIndex;local.applyResults.push({q,correct});storage.recordMixedAttempt({questionId:`daily:${q.id}`,domain:q.domain,concept:q.concept,correct,mindset:{}});renderApply();return}if(local.applyIndex<qs.length-1){local.applyIndex++;local.applySelected=null;local.applyChecked=false;renderApply()}else goNext("apply")}}
  function focusRows(){const mix=storage.getMixedPractice().mindset||{};const rows=[];const labels={qualifier:"Question qualifiers",role:"Role / authority",lifecycle:"Lifecycle recognition",decision:"Decision context"};Object.entries(labels).forEach(([k,label])=>{const x=mix[k]||{attempts:0,correct:0},rate=x.attempts?x.correct/x.attempts:null;rows.push({label,text:rate==null?"We are still gathering evidence. Daily Study will teach and sample this skill.":rate>=.8?"Holding up well. It will return occasionally for retention.":rate>=.6?"Building. Daily Study will keep reinforcing this without adding a separate assignment.":"Worth reinforcing. Tomorrow’s session will give this more attention."})});return rows}
  function renderRepair(){const missed=local.applyResults.filter(x=>!x.correct);body.innerHTML=`<article class="daily-phase">${phaseHeader("6 · TODAY'S SIGNALS","See what the session actually showed.","No red flags or guilt language—just useful evidence for what comes next.","~2–3 min")}<div class="daily-focus-card"><span>CURRENT FOCUS</span><h3>${esc(plan.concept)}</h3><p>${missed.length?`${missed.length} of today's application questions needed another pass. The next session will recycle the reasoning, not make you reread the whole domain.`:"Today's application held up. This concept can move into lighter retention review."}</p><div class="daily-focus-list">${focusRows().map(r=>`<div class="daily-focus-row"><strong>${esc(r.label)}</strong><span>${esc(r.text)}</span></div>`).join("")}</div></div></article>`;nextButton.disabled=false;nextButton.textContent="Finish today →";nextButton.onclick=()=>goNext("repair")}
  // Completion is measured from studiedConcepts (sessions actually opened), not
  // introducedConcepts (anything ever surfaced). A domain can no longer complete
  // itself from page views.
  function domainCoverage(){const curriculum=storage.getCurriculum(),titles=(contentBank?.domains?.[plan.domain]?.concepts||[]).map(x=>x.title),studied=curriculum.studiedConcepts?.[String(plan.domain)]||[],covered=titles.filter(t=>studied.includes(t)).length;return{covered,total:titles.length,complete:titles.length>0&&covered>=titles.length}}
  function advanceDomainIfReady(){const curriculum=storage.getCurriculum();if(curriculum.phase!=="learning")return null;const coverage=domainCoverage();if(!coverage.complete)return null;return storage.markDomainComplete(plan.domain)}
  function recommendation(){const curriculum=storage.getCurriculum(),coverage=domainCoverage(),missed=local.applyResults.filter(x=>!x.correct);if(curriculum.phase==="learning"&&coverage.complete){const next=Number(plan.domain)<4?`Domain ${Number(plan.domain)+1}`:"adaptive reinforcement";return{title:"Come back tomorrow.",text:`You have now been introduced to the planned concepts in Domain ${plan.domain}. After today closes, your guided path will move to ${next}. Recall will continue bringing earlier material back.`,optional:null,action:null}}if(missed.length>=2)return{title:"Come back tomorrow.",text:"Your next Daily Study will automatically reinforce the reasoning that needed more support today. Nothing else is required.",optional:"Optional 5-minute reinforcement",action:"active"};if(weakestMindset()==="lifecycle")return{title:"Come back tomorrow.",text:"Lifecycle recognition remains a current focus, so the next guided session will bring it back in a different scenario.",optional:"Optional lifecycle reinforcement",action:"active"};return{title:"Come back tomorrow.",text:`Your guided path remains in Domain ${plan.domain}. Recall and reinforcement will stay within material you have already encountered while new concepts continue in sequence.`,optional:null,action:null}}
  function renderClose(){const r=recommendation();body.innerHTML=`<article class="daily-phase daily-close">${phaseHeader("7 · COMPLETE","You're done for today.","The guided session is complete. Continuing is optional, not unfinished work.","Done")}<div class="daily-recommend-card"><span>RECOMMENDED NEXT STEP</span><div class="daily-calm-done">${esc(r.title)}</div><p>${esc(r.text)}</p>${r.optional?`<div class="daily-close-actions"><button class="secondary-button" id="optionalReinforce" type="button">${esc(r.optional)}</button></div><div class="daily-optional">Optional means optional. Stopping here is a complete study day.</div>`:""}</div></article>`;document.getElementById("optionalReinforce")?.addEventListener("click",()=>window.CISMActiveEngine.open(plan.domain));nextButton.disabled=false;nextButton.textContent="Finish Today ✓";nextButton.onclick=()=>{mark("close");storage.setTodayStudy({completed:true});advanceDomainIfReady();close()}}
  document.addEventListener("cism-active-learning-updated",()=>{if(!overlay.classList.contains("hidden"))document.dispatchEvent(new CustomEvent("cism-daily-updated"))});closeButton.onclick=close;window.CISMDailyStudy={open,buildPlan,getSummary(){return{...buildPlan(),today:storage.getTodayStudy()}}};
})();
