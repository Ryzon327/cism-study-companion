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

  // Explicit navigation mode prevents button-state collisions.
  // modes: question | reviewCenter | flaggedReview | unansweredReview | results
  let mode = "question";
  let reviewQueue = [];
  let reviewQueueIndex = 0;

  const esc = v => String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

  function shuffle(a){
    a=[...a];
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function shuffleAnswers(q){
    const indexed=q.options.map((text,i)=>({text,original:i}));
    const mixed=shuffle(indexed);
    return {...q,options:mixed.map(x=>x.text),correctIndex:mixed.findIndex(x=>x.original===q.correctIndex)};
  }

  function buildSession(){
    const history=storage.getExamReadiness().exams || [];
    const recentQuestionIds=new Set(history.slice(-3).flatMap(e=>e.questionIds || []));
    const recentFamilyIds=new Set(history.slice(-2).flatMap(e=>e.familyIds || []));
    const counts={1:7,2:13,3:12,4:8};
    const out=[];

    Object.entries(counts).forEach(([domain,count])=>{
      const pool=bank.questions.filter(q=>String(q.domain)===domain);
      const families={};
      pool.forEach(q=>{ const f=q.familyId||`LEGACY-${q.id}`; (families[f] ||= []).push(q); });
      const ranked=Object.entries(families).map(([familyId,qs])=>({
        familyId,qs,
        score:(recentFamilyIds.has(familyId)?0:6)+qs.filter(q=>!recentQuestionIds.has(q.id)).length+Math.random()*3
      })).sort((a,b)=>b.score-a.score);

      const chosen=[];
      for(const fam of ranked){
        if(chosen.length>=count) break;
        const qs=[...fam.qs].sort((a,b)=>(recentQuestionIds.has(a.id)?1:0)-(recentQuestionIds.has(b.id)?1:0)||Math.random()-.5);
        chosen.push(qs[0]);
      }
      if(chosen.length<count){
        const used=new Set(chosen.map(q=>q.id));
        const rest=pool.filter(q=>!used.has(q.id)).sort((a,b)=>(recentQuestionIds.has(a.id)?1:0)-(recentQuestionIds.has(b.id)?1:0)||Math.random()-.5);
        chosen.push(...rest.slice(0,count-chosen.length));
      }
      out.push(...chosen.slice(0,count));
    });
    return shuffle(out.map(shuffleAnswers));
  }

  function resetFooterHandlers(){
    prev.onclick=null;
    next.onclick=null;
    review.onclick=null;
  }

  function openExam(){
    session=buildSession();
    answers={};
    marked={};
    pos=0;
    submitted=false;
    mode="question";
    reviewQueue=[];
    reviewQueueIndex=0;
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
    render();
  }

  function closeExam(){
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
    document.dispatchEvent(new CustomEvent("cism-exam-updated"));
  }

  function render(){
    resetFooterHandlers();

    if(submitted || mode==="results"){
      renderResults();
      return;
    }

    if(mode==="reviewCenter"){
      renderReviewCenter();
      return;
    }

    if(mode==="flaggedReview" || mode==="unansweredReview"){
      renderQueuedQuestion();
      return;
    }

    renderNormalQuestion();
  }

  function renderNormalQuestion(){
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

    content.querySelectorAll("[data-exam-choice]").forEach(b=>{
      b.onclick=()=>{
        answers[q.id]=Number(b.dataset.examChoice);
        renderNormalQuestion();
      };
    });

    prev.disabled=pos===0;
    prev.style.opacity=prev.disabled?".45":"1";
    prev.textContent="← Previous";

    review.disabled=false;
    review.style.opacity="1";
    review.textContent=marked[q.id]?"Unmark review":"Mark for review";

    next.disabled=false;
    next.style.opacity="1";
    next.innerHTML=pos===session.length-1?"Review before submit →":"Next →";

    prev.onclick=()=>{
      if(pos>0){pos--;render();}
    };

    review.onclick=()=>{
      marked[q.id]=!marked[q.id];
      renderNormalQuestion();
    };

    next.onclick=()=>{
      if(pos<session.length-1){
        pos++;
        render();
      } else {
        mode="reviewCenter";
        render();
      }
    };
  }

  function getIndexedItems(){
    return session.map((q,i)=>({q,i}));
  }

  function flaggedItems(){
    return getIndexedItems().filter(({q})=>marked[q.id]);
  }

  function unansweredItems(){
    return getIndexedItems().filter(({q})=>answers[q.id]==null);
  }

  function questionJumpButtons(items,type){
    if(!items.length) return `<div class="exam-review-empty">None</div>`;
    return `<div class="exam-jump-grid">${items.map(({q,i},queuePos)=>{
      const answered=answers[q.id]!=null;
      return `<button type="button"
        class="exam-jump-button ${type} ${answered?"answered":"unanswered"}"
        data-review-jump-index="${i}"
        data-review-queue-type="${type}"
        data-review-queue-pos="${queuePos}">
        <strong>${i+1}</strong>
        <span>${answered?"Answered":"Unanswered"}</span>
      </button>`;
    }).join("")}</div>`;
  }

  function renderReviewCenter(){
    const flagged=flaggedItems();
    const unanswered=unansweredItems();

    counter.textContent="Review Center";
    progress.style.width="100%";

    content.innerHTML=`
      <article class="exam-submit-card exam-review-center">
        <div class="mixed-stage">REVIEW CENTER</div>
        <h2>Review what matters before you submit.</h2>
        <p>You answered <strong>${session.length-unanswered.length}</strong> of ${session.length}. ${flagged.length} question${flagged.length===1?" is":"s are"} marked for review.</p>

        <section class="exam-jump-section marked-section">
          <div class="exam-jump-heading">
            <div>
              <span class="eyebrow">MARKED FOR REVIEW</span>
              <h3>${flagged.length?`${flagged.length} question${flagged.length===1?"":"s"} to revisit`:"Nothing marked"}</h3>
            </div>
            <span class="exam-count-pill">${flagged.length}</span>
          </div>
          ${questionJumpButtons(flagged,"marked")}
          ${flagged.length?`<button class="secondary-button exam-review-all-button" id="reviewAllMarkedButton" type="button">Review marked questions in order →</button>`:""}
        </section>

        <section class="exam-jump-section unanswered-section">
          <div class="exam-jump-heading">
            <div>
              <span class="eyebrow">UNANSWERED</span>
              <h3>${unanswered.length?`${unanswered.length} question${unanswered.length===1?"":"s"} still need an answer`:"All questions answered"}</h3>
            </div>
            <span class="exam-count-pill">${unanswered.length}</span>
          </div>
          ${questionJumpButtons(unanswered,"unanswered")}
          ${unanswered.length?`<button class="secondary-button exam-review-all-button" id="reviewAllUnansweredButton" type="button">Review unanswered questions in order →</button>`:""}
        </section>

        ${unanswered.length?`<div class="exam-warning">${unanswered.length} unanswered question${unanswered.length===1?"":"s"} remain. You can review them directly before submitting.</div>`:""}

        <div class="exam-submit-actions">
          <button class="secondary-button" id="returnToExamButton" type="button">Return to exam</button>
          <button class="primary-button" id="submitExamButton" type="button">Submit practice exam</button>
        </div>
      </article>`;

    content.querySelectorAll("[data-review-jump-index]").forEach(btn=>{
      btn.onclick=()=>{
        const queueType=btn.dataset.reviewQueueType;
        const selectedPos=Number(btn.dataset.reviewQueuePos);

        if(queueType==="marked"){
          reviewQueue=flagged.map(x=>x.i);
          reviewQueueIndex=Math.min(selectedPos,Math.max(0,reviewQueue.length-1));
          mode="flaggedReview";
        }else{
          reviewQueue=unanswered.map(x=>x.i);
          reviewQueueIndex=Math.min(selectedPos,Math.max(0,reviewQueue.length-1));
          mode="unansweredReview";
        }

        if(reviewQueue.length){
          pos=reviewQueue[reviewQueueIndex];
          render();
        }else{
          mode="reviewCenter";
          render();
        }
      };
    });

    document.getElementById("reviewAllMarkedButton")?.addEventListener("click",()=>{
      startQueue("flaggedReview", flagged.map(x=>x.i));
    });

    document.getElementById("reviewAllUnansweredButton")?.addEventListener("click",()=>{
      startQueue("unansweredReview", unanswered.map(x=>x.i));
    });

    document.getElementById("returnToExamButton").onclick=()=>{
      mode="question";
      render();
    };

    document.getElementById("submitExamButton").onclick=submit;

    // Footer in review center should not pretend to navigate questions.
    prev.disabled=false;
    prev.style.opacity="1";
    prev.textContent="← Back to last question";
    prev.onclick=()=>{
      mode="question";
      render();
    };

    review.disabled=true;
    review.style.opacity=".35";
    review.textContent="Mark for review";

    next.disabled=true;
    next.style.opacity=".35";
    next.textContent="Submit from Review Center";
  }

  function startQueue(queueMode, indexes){
    reviewQueue=[...indexes];
    reviewQueueIndex=0;
    mode=queueMode;
    if(reviewQueue.length){
      pos=reviewQueue[0];
      render();
    }else{
      mode="reviewCenter";
      render();
    }
  }

  function currentQueueLabel(){
    return mode==="flaggedReview"?"MARKED REVIEW":"UNANSWERED REVIEW";
  }

  function cleanQueue(){
    // In flagged review: remove anything the user unmarked.
    // In unanswered review: remove anything the user has now answered.
    if(mode==="flaggedReview"){
      reviewQueue=reviewQueue.filter(i=>marked[session[i].id]);
    }else if(mode==="unansweredReview"){
      reviewQueue=reviewQueue.filter(i=>answers[session[i].id]==null);
    }

    if(!reviewQueue.length){
      mode="reviewCenter";
      reviewQueueIndex=0;
      render();
      return false;
    }

    if(reviewQueueIndex>=reviewQueue.length){
      reviewQueueIndex=reviewQueue.length-1;
    }
    pos=reviewQueue[reviewQueueIndex];
    return true;
  }

  function renderQueuedQuestion(){
    if(!cleanQueue()) return;

    const q=session[pos];
    const total=reviewQueue.length;
    const shown=reviewQueueIndex+1;

    counter.textContent=`${shown} / ${total} · Review`;
    progress.style.width=`${(shown/total)*100}%`;

    content.innerHTML=`
      <article class="exam-question-card review-queue-card">
        <div class="exam-meta">
          <span>${currentQueueLabel()} · ORIGINAL QUESTION ${pos+1}</span>
          ${marked[q.id]?'<span class="review-flag">MARKED FOR REVIEW</span>':''}
        </div>
        <h2>${esc(q.stem)}</h2>
        <div class="exam-options">
          ${q.options.map((o,i)=>`<button type="button" data-exam-choice="${i}" class="${answers[q.id]===i?"selected":""}">
            <span>${String.fromCharCode(65+i)}</span><strong>${esc(o)}</strong>
          </button>`).join("")}
        </div>
        <div class="review-queue-note">
          <strong>${mode==="flaggedReview"?"Reviewing marked questions":"Reviewing unanswered questions"}</strong>
          <span>You can answer, change the answer, leave it as-is, or move directly to the next item in this review queue.</span>
          <button type="button" class="review-center-inline-button" id="returnReviewCenterInline">Return to Review Center</button>
        </div>
      </article>`;

    document.getElementById("returnReviewCenterInline")?.addEventListener("click",()=>{
      mode="reviewCenter";
      render();
    });

    content.querySelectorAll("[data-exam-choice]").forEach(b=>{
      b.onclick=()=>{
        answers[q.id]=Number(b.dataset.examChoice);

        // If answering an unanswered review question removes it from the queue,
        // keep the UI stable by moving to the next remaining unanswered item.
        if(mode==="unansweredReview"){
          const oldIndex=reviewQueueIndex;
          reviewQueue=reviewQueue.filter(i=>answers[session[i].id]==null);
          if(!reviewQueue.length){
            mode="reviewCenter";
            render();
            return;
          }
          reviewQueueIndex=Math.min(oldIndex,reviewQueue.length-1);
          pos=reviewQueue[reviewQueueIndex];
          render();
          return;
        }
        renderQueuedQuestion();
      };
    });

    prev.disabled=false;
    prev.style.opacity="1";
    prev.textContent=reviewQueueIndex===0?"← Review Center":"← Previous review";

    next.disabled=false;
    next.style.opacity="1";
    next.innerHTML=reviewQueueIndex===reviewQueue.length-1?"Back to Review Center →":"Next review →";

    review.disabled=false;
    review.style.opacity="1";
    review.textContent=marked[q.id]?"Unmark review":"Mark for review";

    prev.onclick=()=>{
      if(reviewQueueIndex===0){
        mode="reviewCenter";
        render();
      }else{
        reviewQueueIndex--;
        pos=reviewQueue[reviewQueueIndex];
        render();
      }
    };

    next.onclick=()=>{
      // Queue is already kept current when an answer is entered or an item is unmarked.
      // Move only within the active review queue.
      if(!reviewQueue.length){
        mode="reviewCenter";
        render();
        return;
      }

      if(reviewQueueIndex<reviewQueue.length-1){
        reviewQueueIndex++;
        pos=reviewQueue[reviewQueueIndex];
        render();
      }else{
        mode="reviewCenter";
        render();
      }
    };

    review.onclick=()=>{
      marked[q.id]=!marked[q.id];

      if(mode==="flaggedReview" && !marked[q.id]){
        const oldIndex=reviewQueueIndex;
        reviewQueue=reviewQueue.filter(i=>marked[session[i].id]);

        if(!reviewQueue.length){
          mode="reviewCenter";
          render();
          return;
        }

        reviewQueueIndex=Math.min(oldIndex,reviewQueue.length-1);
        pos=reviewQueue[reviewQueueIndex];
        render();
        return;
      }

      renderQueuedQuestion();
    };
  }

  function submit(){
    const domainStats={1:{c:0,t:0},2:{c:0,t:0},3:{c:0,t:0},4:{c:0,t:0}};
    const misses=[];
    let correct=0;

    session.forEach(q=>{
      const ok=answers[q.id]===q.correctIndex;
      // A question with an unexpected domain must not abort scoring the exam.
      const st=domainStats[q.domain];
      if(st){
        st.t++;
        if(ok) st.c++;
      }
      if(ok) correct++;
      else misses.push(q);
    });

    let weighted=0;
    Object.entries(bank.weights).forEach(([d,w])=>{
      const st=domainStats[d];
      const pct=st.t?st.c/st.t:0;
      weighted+=pct*w;
    });

    const result={
      score:correct,
      total:session.length,
      percent:Math.round(correct/session.length*100),
      weightedReadiness:Math.round(weighted),
      domainStats,
      misses:misses.map(q=>({id:q.id,domain:q.domain,concept:q.concept,familyId:q.familyId||null})),
      answers,
      questionIds:session.map(q=>q.id),
      familyIds:[...new Set(session.map(q=>q.familyId||`LEGACY-${q.id}`))]
    };

    storage.recordExam(result);

    session.forEach(q=>storage.recordActiveResult({
      domain:q.domain,
      challengeId:`exam:${q.id}`,
      type:"exam",
      concept:q.concept,
      correct:answers[q.id]===q.correctIndex
    }));

    submitted=true;
    mode="results";
    window.__lastExamResult=result;
    render();
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
            const pct=st.t?Math.round(st.c/st.t*100):0;
            return `<div>
              <span>D${d} · ${domainNames[d]}</span>
              <strong>${st.t?pct+"%":"—"}</strong>
              <small>${st.t?`${st.c}/${st.t} correct`:"Not covered in this exam"}</small>
              <div class="mini-progress"><span style="width:${pct}%"></span></div>
            </div>`;
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
                <div class="mindset-mini-memory">
                  <span>Memory rule</span>
                  <strong>${esc(q.memory)}</strong>
                </div>
              </div>`).join("")}
          </div>
        </details>

        <div class="study-callout">
          <strong>Readiness rule</strong>
          <div>One score does not declare you exam-ready. Look for repeatable performance across fresh sessions and no major weak domain. This score is a study signal, not an ISACA scaled-score prediction.</div>
        </div>
      </article>`;

    prev.disabled=true;
    prev.style.opacity=".35";
    review.disabled=true;
    review.style.opacity=".35";
    next.disabled=false;
    next.style.opacity="1";
    next.textContent="Done";
    next.onclick=closeExam;
  }

  close.onclick=closeExam;
  window.CISMExamEngine={open:openExam};
})();