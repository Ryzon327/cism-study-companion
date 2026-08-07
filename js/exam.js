(function () {
  const bank = window.CISMExamBank;
  const storage = window.CISMStorage;
  const overlay = document.getElementById("examOverlay");
  const content = document.getElementById("examContent");
  const counter = document.getElementById("examCounter");
  const progress = document.getElementById("examProgressBar");
  const prev = document.getElementById("examPrevButton");
  const next = document.getElementById("examNextButton");
  const review = document.getElementById("examReviewButton");
  const close = document.getElementById("closeExamButton");

  let session = [];
  let answers = {};
  let marked = {};
  let pos = 0;
  let submitted = false;

  const esc = v => String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

  function buildSession(){
    const by = {1:[],2:[],3:[],4:[]};
    bank.questions.forEach(q=>by[q.domain].push(q));
    // 40-question learning simulation using current official weighting proportions.
    const counts = {1:7,2:13,3:12,4:8};
    let out=[];
    Object.keys(counts).forEach(d=>out.push(...shuffle(by[d]).slice(0, Math.min(counts[d],by[d].length))));
    // If the current bank is smaller than 40, fill with remaining unique questions.
    const used = new Set(out.map(q=>q.id));
    for(const q of shuffle(bank.questions)){
      if(out.length>=40) break;
      if(!used.has(q.id)){out.push(q);used.add(q.id);}
    }
    return shuffle(out);
  }

  function openExam(){
    session=buildSession(); answers={}; marked={}; pos=0; submitted=false;
    overlay.classList.remove("hidden"); overlay.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden"; render();
  }
  function closeExam(){
    overlay.classList.add("hidden"); overlay.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
    document.dispatchEvent(new CustomEvent("cism-exam-updated"));
  }

  function render(){
    if(submitted) return renderResults();
    const q=session[pos];
    counter.textContent=`${pos+1} / ${session.length}`;
    progress.style.width=`${((pos+1)/session.length)*100}%`;
    content.innerHTML=`
      <article class="exam-question-card">
        <div class="exam-meta">
          <span>QUESTION ${pos+1}</span>
          ${marked[q.id]?'<span class="review-flag">MARKED FOR REVIEW</span>':''}
        </div>
        <h2>${esc(q.stem)}</h2>
        <div class="exam-options">
          ${q.options.map((o,i)=>`<button type="button" data-exam-choice="${i}" class="${answers[q.id]===i?"selected":""}">
            <span>${String.fromCharCode(65+i)}</span><strong>${esc(o)}</strong>
          </button>`).join("")}
        </div>
        <div class="exam-quiet-note">No domain label, hint, Memory Rule, or answer feedback appears during the exam.</div>
      </article>`;
    content.querySelectorAll("[data-exam-choice]").forEach(b=>b.onclick=()=>{answers[q.id]=Number(b.dataset.examChoice);render();});
    prev.disabled=pos===0;
    review.textContent=marked[q.id]?"Unmark review":"Mark for review";
    next.innerHTML=pos===session.length-1?"Review & submit →":"Next →";
  }

  function goNext(){
    if(pos<session.length-1){pos++;render();return;}
    renderSubmit();
  }

  function jumpToQuestion(questionIndex){
    pos=questionIndex;
    render();
  }

  function questionJumpButtons(items, type){
    if(!items.length) return `<div class="exam-review-empty">None</div>`;
    return `<div class="exam-jump-grid">${items.map(({q,i})=>{
      const answered=answers[q.id]!=null;
      return `<button type="button" class="exam-jump-button ${type} ${answered?"answered":"unanswered"}" data-jump-index="${i}">
        <strong>${i+1}</strong>
        <span>${answered ? "Answered" : "Unanswered"}</span>
      </button>`;
    }).join("")}</div>`;
  }

  function bindJumpButtons(){
    content.querySelectorAll("[data-jump-index]").forEach(btn=>{
      btn.onclick=()=>jumpToQuestion(Number(btn.dataset.jumpIndex));
    });
  }

  function renderSubmit(){
    const indexed=session.map((q,i)=>({q,i}));
    const unansweredItems=indexed.filter(({q})=>answers[q.id]==null);
    const flaggedItems=indexed.filter(({q})=>marked[q.id]);
    const unanswered=unansweredItems.length;
    const flagged=flaggedItems.length;

    content.innerHTML=`
      <article class="exam-submit-card exam-review-center">
        <div class="mixed-stage">REVIEW CENTER</div>
        <h2>Jump directly to anything you want to revisit.</h2>
        <p>You answered <strong>${session.length-unanswered}</strong> of ${session.length}. ${flagged} question${flagged===1?" is":"s are"} marked for review.</p>

        <section class="exam-jump-section marked-section">
          <div class="exam-jump-heading">
            <div>
              <span class="eyebrow">MARKED FOR REVIEW</span>
              <h3>${flagged ? `${flagged} question${flagged===1?"":"s"} to revisit` : "Nothing marked"}</h3>
            </div>
            <span class="exam-count-pill">${flagged}</span>
          </div>
          ${questionJumpButtons(flaggedItems,"marked")}
        </section>

        <section class="exam-jump-section unanswered-section">
          <div class="exam-jump-heading">
            <div>
              <span class="eyebrow">UNANSWERED</span>
              <h3>${unanswered ? `${unanswered} question${unanswered===1?"":"s"} still need an answer` : "All questions answered"}</h3>
            </div>
            <span class="exam-count-pill">${unanswered}</span>
          </div>
          ${questionJumpButtons(unansweredItems,"unanswered")}
        </section>

        ${unanswered?`<div class="exam-warning">${unanswered} unanswered question${unanswered===1?"":"s"} remain. You can jump directly to ${unanswered===1?"it":"them"} above.</div>`:""}

        <div class="exam-submit-actions">
          <button class="secondary-button" id="returnExamButton">Return to last question</button>
          <button class="primary-button" id="submitExamButton">Submit practice exam</button>
        </div>
      </article>`;

    bindJumpButtons();
    document.getElementById("returnExamButton").onclick=()=>{pos=session.length-1;render();};
    document.getElementById("submitExamButton").onclick=submit;
    counter.textContent="Review Center";
    next.disabled=true; review.disabled=true;
  }

  function submit(){
    const domainStats={1:{c:0,t:0},2:{c:0,t:0},3:{c:0,t:0},4:{c:0,t:0}};
    const misses=[];
    let correct=0;
    session.forEach(q=>{
      const ok=answers[q.id]===q.correctIndex;
      domainStats[q.domain].t++;
      if(ok){correct++;domainStats[q.domain].c++;}
      else misses.push(q);
    });
    let weighted=0;
    Object.entries(bank.weights).forEach(([d,w])=>{
      const st=domainStats[d];
      const pct=st.t?st.c/st.t:0;
      weighted += pct*w;
    });
    const result={
      score:correct,total:session.length,percent:Math.round(correct/session.length*100),
      weightedReadiness:Math.round(weighted),
      domainStats,
      misses:misses.map(q=>({id:q.id,domain:q.domain,concept:q.concept})),
      answers
    };
    storage.recordExam(result);
    // Feed misses/correct answers into the same concept mastery engine.
    session.forEach(q=>storage.recordActiveResult({
      domain:q.domain, challengeId:`exam:${q.id}`, type:"exam",
      concept:q.concept, correct:answers[q.id]===q.correctIndex
    }));
    submitted=true;
    window.__lastExamResult=result;
    renderResults();
  }

  function readinessLabel(n){
    if(n>=85) return ["Strong","Your evidence is strong. Keep repairing misses and confirm with another independent exam session."];
    if(n>=75) return ["Approaching ready","You are close, but there are still domain or concept gaps worth repairing before relying on the score."];
    if(n>=65) return ["Developing","The foundation is forming, but mixed exam performance still needs repair."];
    return ["Not ready yet","Use the repair list. The app should now narrow your studying rather than make you reread everything."];
  }

  function renderResults(){
    const r=window.__lastExamResult;
    const [label,desc]=readinessLabel(r.weightedReadiness);
    counter.textContent=`${r.score} / ${r.total}`;
    progress.style.width="100%";
    const domainNames={1:"Governance",2:"Risk Management",3:"Security Program",4:"Incident Management"};
    const weakDomains=Object.entries(r.domainStats).sort((a,b)=>(a[1].c/a[1].t)-(b[1].c/b[1].t));

    content.innerHTML=`
      <article class="exam-results">
        <div class="mixed-stage">PRACTICE EXAM COMPLETE</div>
        <h2>${label}</h2>
        <p class="exam-result-desc">${desc}</p>
        <div class="readiness-hero">
          <div><strong>${r.percent}%</strong><span>raw practice score</span></div>
          <div><strong>${r.weightedReadiness}%</strong><span>domain-weighted readiness</span></div>
        </div>

        <div class="exam-domain-grid">
          ${Object.entries(r.domainStats).map(([d,st])=>{
            const pct=Math.round(st.c/st.t*100);
            return `<div><span>D${d} · ${domainNames[d]}</span><strong>${pct}%</strong><small>${st.c}/${st.t} correct</small><div class="mini-progress"><span style="width:${pct}%"></span></div></div>`;
          }).join("")}
        </div>

        <div class="exam-repair-panel">
          <div class="eyebrow">WHAT TO DO NEXT</div>
          <h3>Repair the misses. Do not restart the whole curriculum.</h3>
          <div class="exam-repair-chips">
            ${[...new Set(r.misses.map(m=>`D${m.domain} · ${m.concept}`))].slice(0,12).map(x=>`<span>${esc(x)}</span>`).join("") || "<span>No missed concepts in this session.</span>"}
          </div>
        </div>

        <details class="exam-review-details">
          <summary>Review missed questions (${r.misses.length})</summary>
          <div class="exam-miss-list">
            ${session.filter(q=>answers[q.id]!==q.correctIndex).map(q=>`
              <div class="exam-miss-item">
                <span>D${q.domain} · ${esc(q.concept)}</span>
                <strong>${esc(q.stem)}</strong>
                <p><b>Best answer:</b> ${esc(q.options[q.correctIndex])}</p>
                <p>${esc(q.rationale)}</p>
                <div class="mindset-mini-memory"><span>Memory rule</span><strong>${esc(q.memory)}</strong></div>
              </div>`).join("")}
          </div>
        </details>

        <div class="study-callout">
          <strong>Readiness rule</strong>
          <div>One score does not declare you exam-ready. Look for repeatable performance across fresh sessions and no major weak domain. This score is a study signal, not an ISACA scaled-score prediction.</div>
        </div>
      </article>`;
    next.disabled=false; next.textContent="Done"; next.onclick=closeExam;
    review.disabled=true; prev.disabled=true;
  }

  prev.onclick=()=>{if(pos>0){pos--;render();}};
  next.onclick=goNext;
  review.onclick=()=>{if(submitted)return;const q=session[pos];marked[q.id]=!marked[q.id];render();};
  close.onclick=closeExam;

  window.CISMExamEngine={open:openExam};
})();