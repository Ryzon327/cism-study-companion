(function () {
  const storage = window.CISMStorage;
  const contentBank = window.CISMContent;
  const activeBank = window.CISMActiveLearning;

  const overlay = document.getElementById("dailyOverlay");
  const body = document.getElementById("dailyContent");
  const nextButton = document.getElementById("dailyNextButton");
  const closeButton = document.getElementById("closeDailyButton");
  const progressBar = document.getElementById("dailyProgressBar");
  const headerTitle = document.getElementById("dailyHeaderTitle");
  const footerNote = document.getElementById("dailyFooterNote");

  let phaseIndex = 0;
  let plan = null;
  let recallRevealed = new Set();

  const phases = ["recall","review","active","mixed","close"];
  const domainNames = {
    "1":"Governance",
    "2":"Risk Management",
    "3":"Security Program",
    "4":"Incident Management"
  };

  function esc(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  function getWeakConcepts() {
    const mastery = storage.getActiveLearning().mastery || {};
    return Object.entries(mastery)
      .map(([concept,m]) => ({
        concept,
        state:m.state || "Learning",
        attempts:m.attempts || 0,
        correct:m.correct || 0,
        rate:m.attempts ? m.correct/m.attempts : 0,
        lastMissed:m.lastMissed || null
      }))
      .sort((a,b) => {
        const priority = x => x.state === "Needs Refresh" ? 0 : x.state === "Learning" ? 1 : x.state === "Usable" ? 2 : 3;
        return priority(a)-priority(b) || a.rate-b.rate || b.attempts-a.attempts;
      });
  }

  function getConceptDomain(concept) {
    for (const [domain,lab] of Object.entries(activeBank || {})) {
      if (lab.challenges.some(c => c.concept === concept)) return domain;
    }
    return null;
  }

  function chooseFocusDomain() {
    const exams = storage.getExamReadiness().exams || [];
    if (exams.length) {
      const last = exams[exams.length-1];
      const ranked = Object.entries(last.domainStats || {})
        .filter(([,s]) => s.t)
        .sort((a,b) => (a[1].c/a[1].t) - (b[1].c/b[1].t));
      if (ranked.length) return ranked[0][0];
    }

    const weak = getWeakConcepts();
    for (const item of weak) {
      const d = getConceptDomain(item.concept);
      if (d) return d;
    }

    const evidence = storage.getActiveLearning().domainEvidence || {};
    const attempted = Object.entries(evidence).filter(([,e]) => e.attempts);
    if (attempted.length) {
      attempted.sort((a,b) => (a[1].correct/a[1].attempts) - (b[1].correct/b[1].attempts));
      return attempted[0][0];
    }
    return "1";
  }

  function chooseFocusConcept(domain) {
    const weak = getWeakConcepts();
    const weakInDomain = weak.find(x => getConceptDomain(x.concept) === domain);
    if (weakInDomain) return weakInDomain.concept;

    const domainContent = contentBank?.domains?.[domain];
    return domainContent?.concepts?.[0]?.title || domainNames[domain];
  }

  function findChallengeMemory(domain, concept) {
    const challenges = activeBank?.[domain]?.challenges || [];
    const match = challenges.find(c => c.concept === concept);
    return match?.memory || null;
  }

  function findConceptContent(domain, concept) {
    const concepts = contentBank?.domains?.[domain]?.concepts || [];
    const normalized = concept.toLowerCase();
    return concepts.find(c =>
      c.title.toLowerCase() === normalized ||
      c.title.toLowerCase().includes(normalized) ||
      normalized.includes(c.title.toLowerCase())
    ) || concepts[0] || null;
  }

  function buildRecallRules(domain, concept) {
    const mastery = storage.getActiveLearning().mastery || {};
    const candidates = [];
    const seen = new Set();

    function add(d,c,memory,state) {
      if (!memory) return;
      const key = `${d}:${c}:${memory}`;
      if (seen.has(key)) return;
      seen.add(key);
      candidates.push({domain:d,concept:c,memory,state});
    }

    const focusMemory = findChallengeMemory(domain, concept);
    add(domain, concept, focusMemory, mastery[concept]?.state);

    const weak = getWeakConcepts();
    weak.forEach(w => {
      const d = getConceptDomain(w.concept);
      add(d || domain, w.concept, findChallengeMemory(d || domain,w.concept), w.state);
    });

    const fallbacks = [
      {domain:"Core",concept:"Authority",memory:"Security advises → business authority decides."},
      {domain:"Core",concept:"Sequence",memory:"FIRST = find the missing prerequisite for this lifecycle stage."},
      {domain:"Core",concept:"Business",memory:"Security enables the business — it does not exist to maximize restriction."},
      {domain:"Core",concept:"Risk",memory:"CISM manages risk to an acceptable level — not zero risk."}
    ];
    fallbacks.forEach(x => add(x.domain,x.concept,x.memory,"Core"));

    return candidates.slice(0,3);
  }

  function buildPlan() {
    const today = storage.getTodayStudy();
    const domain = today.focusDomain || chooseFocusDomain();
    const concept = today.focusConcept || chooseFocusConcept(domain);
    const conceptContent = findConceptContent(domain,concept);
    const recall = buildRecallRules(domain,concept);

    storage.setTodayStudy({focusDomain:domain,focusConcept:concept});

    return {
      domain,
      concept,
      domainName:domainNames[domain],
      recall,
      conceptContent
    };
  }

  function getPhaseDone(key) {
    return !!storage.getTodayStudy().phases?.[key];
  }

  function markPhase(key,done=true) {
    storage.setTodayStudy({phases:{[key]:done}});
    updateProgress();
    document.dispatchEvent(new CustomEvent("cism-daily-updated"));
  }

  function updateProgress() {
    const state = storage.getTodayStudy();
    const count = phases.filter(p => state.phases?.[p]).length;
    progressBar.style.width = `${(count/phases.length)*100}%`;
  }

  function open() {
    plan = buildPlan();
    recallRevealed = new Set();

    const today = storage.getTodayStudy();
    const firstIncomplete = phases.findIndex(p => !today.phases?.[p]);
    phaseIndex = firstIncomplete === -1 ? phases.length-1 : firstIncomplete;

    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
    render();
  }

  function close() {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
    document.dispatchEvent(new CustomEvent("cism-daily-updated"));
  }

  function render() {
    updateProgress();
    const phase = phases[phaseIndex];
    headerTitle.textContent = `D${plan.domain} · ${plan.domainName}`;
    nextButton.disabled = false;
    nextButton.style.opacity = "1";

    if (phase === "recall") renderRecall();
    else if (phase === "review") renderReview();
    else if (phase === "active") renderActive();
    else if (phase === "mixed") renderMixed();
    else renderClose();
  }

  function phaseHeader(kicker,title,note,time) {
    return `<div class="daily-phase-top">
      <div><div class="mixed-stage">${esc(kicker)}</div><h2>${esc(title)}</h2><p>${esc(note)}</p></div>
      <span>${esc(time)}</span>
    </div>`;
  }

  function renderRecall() {
    body.innerHTML = `
      <article class="daily-phase">
        ${phaseHeader("1 · RECALL","Pull it from memory first.","Do not reread the answer immediately. Try to say the rule, then reveal it.","~5 min")}
        <div class="daily-recall-grid">
          ${plan.recall.map((r,i)=>`
            <button class="daily-recall-card ${recallRevealed.has(i)?"revealed":""}" data-recall="${i}" type="button">
              <span>${r.domain === "Core" ? "CORE" : `D${esc(r.domain)}`} · ${esc(r.concept)}</span>
              ${recallRevealed.has(i)
                ? `<strong>${esc(r.memory)}</strong><small>Retrieved. Say it once more in your own words.</small>`
                : `<strong>Can you state the memory rule?</strong><small>Tap to reveal only after you try.</small>`}
            </button>`).join("")}
        </div>
      </article>`;

    body.querySelectorAll("[data-recall]").forEach(btn => {
      btn.onclick = () => {
        recallRevealed.add(Number(btn.dataset.recall));
        renderRecall();
      };
    });

    nextButton.textContent = getPhaseDone("recall") ? "Continue →" : "Finish Recall →";
    nextButton.onclick = () => {
      markPhase("recall");
      phaseIndex = 1;
      render();
    };
  }

  function renderReview() {
    const c = plan.conceptContent;
    const memory = findChallengeMemory(plan.domain,plan.concept) ||
      "Understand the business purpose, role, and lifecycle stage before choosing the action.";

    body.innerHTML = `
      <article class="daily-phase">
        ${phaseHeader("2 · FOCUSED REVIEW",plan.concept,"One concept only. This is targeted review, not a trip back through the entire domain.","~7 min")}
        <div class="daily-review-card">
          <div class="eyebrow">PLAIN ENGLISH</div>
          <p>${esc(c?.plain || `Review ${plan.concept} from the CISM management perspective.`)}</p>
          <div class="daily-review-divider"></div>
          <div class="eyebrow">CISM LENS</div>
          <p>${esc(c?.exam || "Ask which choice best fits business value, the correct authority, and the current lifecycle stage.")}</p>
          <div class="study-memory-rule">
            <div class="memory-rule-icon">↳</div>
            <div><span>MEMORY RULE</span><strong>${esc(memory)}</strong></div>
          </div>
        </div>
      </article>`;

    nextButton.textContent = getPhaseDone("review") ? "Continue →" : "I’ve Got It →";
    nextButton.onclick = () => {
      markPhase("review");
      phaseIndex = 2;
      render();
    };
  }

  function renderActive() {
    body.innerHTML = `
      <article class="daily-phase">
        ${phaseHeader("3 · APPLY","Prove the domain concept.","Now retrieve and apply. Your existing Adaptive Practice engine will prioritize weaknesses and fresh wording.","~10 min")}
        <div class="daily-action-card">
          <div class="daily-action-icon">A</div>
          <div>
            <strong>D${plan.domain} · ${esc(plan.domainName)} Active Practice</strong>
            <p>Complete one adaptive set. Misses automatically roll back into repair.</p>
          </div>
          <button class="primary-button compact-button" id="launchDailyActive" type="button">${getPhaseDone("active")?"Practice again":"Start practice"} →</button>
        </div>
        ${getPhaseDone("active")?`<div class="daily-done-note">✓ Active Practice returned results to today’s plan.</div>`:""}
      </article>`;

    document.getElementById("launchDailyActive").onclick = () => {
      window.CISMActiveEngine.open(plan.domain);
    };

    nextButton.textContent = getPhaseDone("active") ? "Continue →" : "Skip for now →";
    nextButton.onclick = () => {
      phaseIndex = 3;
      render();
    };
  }

  function renderMixed() {
    body.innerHTML = `
      <article class="daily-phase">
        ${phaseHeader("4 · MIXED CISM","Remove the domain label.","Make sure the concept transfers when the exam does not tell you which domain you are in.","~8–10 min")}
        <div class="daily-action-card">
          <div class="daily-action-icon">M</div>
          <div>
            <strong>Mixed CISM + Mindset Recognition</strong>
            <p>Qualifier, role, lifecycle, decision context, answer, then targeted repair.</p>
          </div>
          <button class="primary-button compact-button" id="launchDailyMixed" type="button">${getPhaseDone("mixed")?"Practice again":"Start mixed"} →</button>
        </div>
        ${getPhaseDone("mixed")?`<div class="daily-done-note">✓ Mixed Practice returned results to today’s plan.</div>`:""}
      </article>`;

    document.getElementById("launchDailyMixed").onclick = () => {
      window.CISMMixedEngine.open();
    };

    nextButton.textContent = getPhaseDone("mixed") ? "Close Session →" : "Skip for now →";
    nextButton.onclick = () => {
      phaseIndex = 4;
      render();
    };
  }

  function renderClose() {
    const today = storage.getTodayStudy();
    const active = storage.getActiveLearning();
    const mastery = active.mastery?.[plan.concept];
    const memory = findChallengeMemory(plan.domain,plan.concept) ||
      "Right role + right lifecycle + business context.";

    body.innerHTML = `
      <article class="daily-phase daily-close">
        ${phaseHeader("5 · CLOSE","Stop studying on purpose.","End with one useful anchor. No backlog is created when you close the app.","~2 min")}
        <div class="daily-close-hero">
          <span>TODAY’S ANCHOR</span>
          <strong>${esc(memory)}</strong>
        </div>
        <div class="daily-close-grid">
          <div><span>Focus</span><strong>D${plan.domain} · ${esc(plan.concept)}</strong></div>
          <div><span>Current state</span><strong>${esc(mastery?.state || "Building")}</strong></div>
          <div><span>Active practice</span><strong>${today.phases?.active ? "Done" : "Optional today"}</strong></div>
          <div><span>Mixed practice</span><strong>${today.phases?.mixed ? "Done" : "Optional today"}</strong></div>
        </div>
        <p class="daily-close-note">Tomorrow’s plan will use the evidence you created today. You do not need to manually decide what to revisit.</p>
      </article>`;

    nextButton.textContent = today.completed ? "Done ✓" : "Finish Today ✓";
    nextButton.onclick = () => {
      markPhase("close");
      storage.setTodayStudy({completed:true});
      close();
    };
  }

  document.addEventListener("cism-active-learning-updated", () => {
    if (!overlay.classList.contains("hidden") && phases[phaseIndex] === "active") {
      markPhase("active");
      renderActive();
    }
  });

  document.addEventListener("cism-mixed-updated", () => {
    if (!overlay.classList.contains("hidden") && phases[phaseIndex] === "mixed") {
      markPhase("mixed");
      renderMixed();
    }
  });

  closeButton.onclick = close;

  window.CISMDailyStudy = {
    open,
    buildPlan,
    getSummary() {
      const p = buildPlan();
      const t = storage.getTodayStudy();
      return {...p,today:t};
    }
  };
})();