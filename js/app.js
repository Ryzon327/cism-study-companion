(function () {
  const storage = window.CISMStorage;
  const study = window.CISMStudy;
  const quiz = window.CISMQuiz;
  const html = document.documentElement;

  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeLabel = document.getElementById("themeLabel");
  const navItems = [...document.querySelectorAll(".nav-item")];
  const views = [...document.querySelectorAll(".view")];
  const pageEyebrow = document.getElementById("pageEyebrow");
  const pageTitle = document.getElementById("pageTitle");
  const settingsButton = document.getElementById("settingsButton");
  const settingsDialog = document.getElementById("settingsDialog");
  const sessionLength = document.getElementById("sessionLength");
  const exportButton = document.getElementById("exportButton");
  const importInput = document.getElementById("importInput");
  const studyOverlay = document.getElementById("studyOverlay");
  const continueStudyButton = document.getElementById("continueStudyButton");
  const closeStudyButton = document.getElementById("closeStudyButton");
  const studyContent = document.getElementById("studyContent");
  const studyStepLabel = document.getElementById("studyStepLabel");
  const studyTimeLabel = document.getElementById("studyTimeLabel");
  const studyProgressBar = document.getElementById("studyProgressBar");
  const studyBackButton = document.getElementById("studyBackButton");
  const studyNextButton = document.getElementById("studyNextButton");

  const titles = {
    study: ["TODAY", "Your CISM study is ready."],
    explore: ["EXPLORE", "Everything has a place."],
    practice: ["PRACTICE", "Practice without losing the flow."],
    progress: ["PROGRESS", "See what matters, not everything."]
  };

  let currentStep = Math.min(storage.getProgress().currentStep || 0, study.session.steps.length - 1);
  let stepState = {};

  function applyTheme(theme) {
    html.dataset.theme = theme;
    themeIcon.textContent = theme === "light" ? "☾" : "☀";
    themeLabel.textContent = theme === "light" ? "Dark mode" : "Light mode";
  }

  const prefs = storage.getPrefs();
  applyTheme(prefs.theme);
  sessionLength.value = prefs.sessionLength || "normal";

  themeToggle.addEventListener("click", () => {
    const next = html.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next);
    storage.setPrefs({ theme: next });
  });

  navItems.forEach(item => item.addEventListener("click", () => switchView(item.dataset.view)));
  function switchView(viewName) {
    navItems.forEach(item => item.classList.toggle("active", item.dataset.view === viewName));
    views.forEach(view => view.classList.toggle("active", view.id === `view-${viewName}`));
    const [eyebrow, title] = titles[viewName];
    pageEyebrow.textContent = eyebrow;
    pageTitle.textContent = title;
    storage.setProgress({ currentView: viewName });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  switchView(storage.getProgress().currentView || "study");

  settingsButton.addEventListener("click", () => settingsDialog.showModal());
  sessionLength.addEventListener("change", () => storage.setPrefs({ sessionLength: sessionLength.value }));

  exportButton.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(storage.exportData(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cism-study-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  importInput.addEventListener("change", async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      storage.importData(JSON.parse(await file.text()));
      alert("Backup restored. The app will reload.");
      location.reload();
    } catch (err) {
      alert(err.message || "Could not import that backup.");
    } finally { importInput.value = ""; }
  });

  continueStudyButton.addEventListener("click", openStudy);
  closeStudyButton.addEventListener("click", closeStudy);
  studyBackButton.addEventListener("click", () => {
    if (stepState.showTransfer) {
      stepState.showTransfer = false;
      renderStep();
      return;
    }
    if (currentStep > 0) {
      currentStep--;
      stepState = {};
      storage.setProgress({ currentStep });
      renderStep();
    }
  });

  studyNextButton.addEventListener("click", () => {
    const step = study.session.steps[currentStep];
    if (step.choices && !stepState.attempt?.submitted) return;
    if (stepState.showTransfer && !stepState.transferAttempt?.submitted) return;

    if (currentStep < study.session.steps.length - 1) {
      currentStep++;
      stepState = {};
      storage.setProgress({ currentStep });
      renderStep();
    } else {
      const p = storage.getProgress();
      storage.setProgress({ currentStep: 0, sessionsCompleted: (p.sessionsCompleted || 0) + 1 });
      currentStep = 0;
      stepState = {};
      closeStudy();
      updateHomeAfterCompletion();
    }
  });

  function sessionLabel() {
    const val = storage.getPrefs().sessionLength;
    return val === "quick" ? "~15 min session" : val === "deep" ? "~60 min session" : "~35 min session";
  }

  function openStudy() {
    studyOverlay.classList.remove("hidden");
    studyOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    renderStep();
  }

  function closeStudy() {
    studyOverlay.classList.add("hidden");
    studyOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function renderStep() {
    const step = study.session.steps[currentStep];
    studyContent.innerHTML = study.renderStep(currentStep, stepState);
    studyStepLabel.textContent = `${currentStep + 1} of ${study.session.steps.length} · ${step.name}`;
    studyTimeLabel.textContent = sessionLabel();
    studyProgressBar.style.width = `${((currentStep + 1) / study.session.steps.length) * 100}%`;
    studyBackButton.disabled = currentStep === 0 && !stepState.showTransfer;
    studyBackButton.style.opacity = studyBackButton.disabled ? ".4" : "1";

    const requiresAnswer = step.choices && !stepState.attempt?.submitted;
    const requiresTransfer = stepState.showTransfer && !stepState.transferAttempt?.submitted;
    studyNextButton.disabled = !!(requiresAnswer || requiresTransfer);
    studyNextButton.style.opacity = studyNextButton.disabled ? ".45" : "1";
    studyNextButton.innerHTML = currentStep === study.session.steps.length - 1 ? `Finish <span>✓</span>` : `Continue <span>→</span>`;

    quiz.bindStep(studyContent, stepState, {
      onSelect(index) {
        stepState.attempt = { ...(stepState.attempt || {}), selectedIndex: index, confidence: stepState.attempt?.confidence || null, submitted: false };
        renderStep();
      },
      onConfidence(confidence) {
        stepState.attempt = { ...(stepState.attempt || {}), confidence, submitted: false };
        renderStep();
      },
      onSubmit() {
        if (stepState.attempt?.selectedIndex == null) return;
        stepState.attempt.submitted = true;
        const correct = stepState.attempt.selectedIndex === step.correctIndex;
        storage.addAttempt({
          sessionId: study.session.id,
          stepIndex: currentStep,
          stepType: step.type,
          question: step.body,
          selectedIndex: stepState.attempt.selectedIndex,
          correctIndex: step.correctIndex,
          correct,
          confidence: stepState.attempt.confidence || "not-recorded",
          pattern: step.pattern || null
        });
        renderStep();
      },
      onOpenTransfer() {
        stepState.showTransfer = true;
        stepState.transferAttempt = {};
        renderStep();
      },
      onTransferSelect(index) {
        stepState.transferAttempt = { selectedIndex: index, submitted: false };
        renderStep();
      },
      onTransferSubmit() {
        if (stepState.transferAttempt?.selectedIndex == null) return;
        stepState.transferAttempt.submitted = true;
        const r = step.repair;
        storage.addAttempt({
          sessionId: study.session.id,
          stepIndex: currentStep,
          stepType: "repair-transfer",
          question: r.transferQuestion,
          selectedIndex: stepState.transferAttempt.selectedIndex,
          correctIndex: r.transferCorrectIndex,
          correct: stepState.transferAttempt.selectedIndex === r.transferCorrectIndex,
          confidence: "transfer",
          pattern: step.pattern || null
        });
        renderStep();
      }
    });
  }

  function updateHomeAfterCompletion() {
    const card = document.querySelector(".focus-title");
    const note = document.querySelector(".focus-note");
    if (card) card.textContent = "Foundation session complete.";
    if (note) note.textContent = "Your next build will expand this engine into the Domain 1 curriculum.";
  }

  if ((storage.getProgress().sessionsCompleted || 0) > 0) updateHomeAfterCompletion();

  // Build 3 — Explore content engine
  const content = window.CISMContent;
  const domainTabs = document.getElementById("domainTabs");
  const contentModeTabs = document.getElementById("contentModeTabs");
  const contentWorkspaceBody = document.getElementById("contentWorkspaceBody");
  const contentWorkspaceTitle = document.getElementById("contentWorkspaceTitle");
  let activeDomain = "1";
  let activeContentMode = "concepts";

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
  }

  function initContentEngine() {
    if (!content || !domainTabs || !contentWorkspaceBody) return;

    domainTabs.innerHTML = Object.entries(content.domains).map(([id, domain]) =>
      `<button class="domain-tab ${id === activeDomain ? "active" : ""}" data-domain-tab="${id}" type="button">D${id} · ${escapeHTML(domain.shortName)}</button>`
    ).join("");

    domainTabs.addEventListener("click", e => {
      const button = e.target.closest("[data-domain-tab]");
      if (!button) return;
      activeDomain = button.dataset.domainTab;
      domainTabs.querySelectorAll(".domain-tab").forEach(x => x.classList.toggle("active", x.dataset.domainTab === activeDomain));
      renderContentWorkspace();
    });

    contentModeTabs.addEventListener("click", e => {
      const button = e.target.closest("[data-content-mode]");
      if (!button) return;
      activeContentMode = button.dataset.contentMode;
      contentModeTabs.querySelectorAll(".content-mode").forEach(x => x.classList.toggle("active", x.dataset.contentMode === activeContentMode));
      renderContentWorkspace();
    });

    document.querySelectorAll("[data-explore]").forEach(card => {
      card.addEventListener("click", () => {
        const map = { domains: "concepts", maps: "lifecycles", compare: "comparisons", patterns: "patterns" };
        activeContentMode = map[card.dataset.explore] || "concepts";
        contentModeTabs.querySelectorAll(".content-mode").forEach(x => x.classList.toggle("active", x.dataset.contentMode === activeContentMode));
        renderContentWorkspace();
        document.getElementById("contentWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    renderContentWorkspace();
  }

  function renderContentWorkspace() {
    const domain = content.domains[activeDomain];
    contentWorkspaceTitle.textContent = `Domain ${activeDomain} · ${domain.name}`;

    let body = `<div class="domain-story"><strong>Domain story:</strong> ${escapeHTML(domain.story)}</div>`;

    if (activeContentMode === "concepts") {
      body += `<div class="content-list">${domain.concepts.map(c => `
        <article class="content-item">
          <div class="content-item-top">
            <h4>${escapeHTML(c.title)}</h4>
            <span class="content-status ${escapeHTML(c.status || "")}">${escapeHTML(c.status || "learn")}</span>
          </div>
          <p>${escapeHTML(c.plain)}</p>
          <div class="exam-note"><strong>CISM lens</strong><p>${escapeHTML(c.exam)}</p></div>
        </article>
      `).join("")}</div>`;
    }

    if (activeContentMode === "comparisons") {
      body += `<div class="compare-library">${domain.comparisons.map(c => {
        let middle = "";
        if (c.left && c.right) {
          middle = `<div class="compare-pair">
            <div class="compare-side"><strong>${escapeHTML(c.left[0])}</strong><span>${escapeHTML(c.left[1])}</span></div>
            <div class="compare-side"><strong>${escapeHTML(c.right[0])}</strong><span>${escapeHTML(c.right[1])}</span></div>
          </div>`;
        } else {
          middle = `<div class="compare-items">${(c.items || []).map(([name, desc]) =>
            `<div><strong>${escapeHTML(name)}</strong><span>${escapeHTML(desc)}</span></div>`
          ).join("")}</div>`;
        }
        return `<article class="compare-library-card">
          <header><h4>${escapeHTML(c.title)}</h4></header>
          ${middle}
          <div class="memory-line"><strong>Remember:</strong> ${escapeHTML(c.memory)}</div>
        </article>`;
      }).join("")}</div>`;
    }

    if (activeContentMode === "patterns") {
      body += `<div class="pattern-library">${domain.patterns.map(([signal, action]) =>
        `<div class="pattern-library-item"><strong>${escapeHTML(signal)}</strong><span>${escapeHTML(action)}</span></div>`
      ).join("")}</div>`;

      body += `<div class="universal-patterns"><h4>Universal CISM patterns</h4>${content.universalPatterns.map(p =>
        `<div class="universal-card"><strong>${escapeHTML(p.title)}</strong><span>${escapeHTML(p.rule)} Ask: ${escapeHTML(p.ask)}</span></div>`
      ).join("")}</div>`;
    }

    if (activeContentMode === "lifecycles") {
      body += renderLifecycleSection("Primary lifecycle", domain.lifecycle);
      if (domain.continuityLifecycle) body += renderLifecycleSection("Continuity / recovery lifecycle", domain.continuityLifecycle);
    }

    if (activeContentMode === "active") {
      const lab = window.CISMActiveLearning?.[activeDomain];
      const saved = storage.getActiveLearning();
      const evidence = saved.domainEvidence?.[activeDomain] || { attempts: 0, correct: 0 };
      const weakConcepts = Object.entries(saved.mastery || {})
        .filter(([concept, m]) => ["Learning", "Needs Refresh"].includes(m.state))
        .filter(([concept]) => lab.challenges.some(c => c.concept === concept))
        .sort((a,b) => (a[1].state === "Needs Refresh" ? -1 : 1))
        .slice(0, 4);

      body += `<div class="active-practice-intro">
        <div>
          <div class="eyebrow">ADAPTIVE ACTIVE LEARNING</div>
          <h4>${escapeHTML(lab.title)}</h4>
          <p>${escapeHTML(lab.description)}</p>
        </div>
        <div class="active-evidence">
          <strong>${evidence.correct}</strong>
          <span>correct of ${evidence.attempts} attempts</span>
        </div>
      </div>
      <div class="active-method-grid">
        <div><strong>Fresh mix</strong><span>Different questions are selected each session.</span></div>
        <div><strong>Weakness weighted</strong><span>Missed concepts return more often.</span></div>
        <div><strong>Repeat protection</strong><span>Recently seen wording is de-prioritized.</span></div>
        <div><strong>Repair loop</strong><span>Misses feed directly back into relearning.</span></div>
      </div>
      ${weakConcepts.length ? `<div class="adaptive-focus">
        <div class="eyebrow">CURRENT REPAIR FOCUS</div>
        <div class="adaptive-focus-chips">
          ${weakConcepts.map(([concept, m]) => `<span class="${m.state === "Needs Refresh" ? "refresh" : ""}">${escapeHTML(concept)} · ${escapeHTML(m.state)}</span>`).join("")}
        </div>
      </div>` : ""}
      <button class="primary-button" id="startActivePracticeButton" type="button">Start Adaptive Practice <span>→</span></button>`;
    }

    contentWorkspaceBody.innerHTML = body;
    contentWorkspaceBody.querySelector("#startActivePracticeButton")?.addEventListener("click", () => {
      window.CISMActiveEngine.open(activeDomain);
    });
  }

  function renderLifecycleSection(title, steps) {
    return `<div class="lifecycle-section">
      <h4>${escapeHTML(title)}</h4>
      <p>Use the map to determine where a question sits before choosing the next action.</p>
      <div class="lifecycle-large">${steps.map((step, i) =>
        `<span class="lifecycle-node">${escapeHTML(step)}</span>${i < steps.length - 1 ? `<span class="lifecycle-arrow">→</span>` : ""}`
      ).join("")}</div>
    </div>`;
  }

  document.addEventListener("cism-active-learning-updated", () => {
    if (activeContentMode === "active") renderContentWorkspace();
    renderActiveProgress();
    renderStudyMemoryRules();
  });


  function renderStudyMemoryRules() {
    const grid = document.getElementById("memoryHomeGrid");
    if (!grid) return;

    const state = storage.getActiveLearning();
    const mastery = state.mastery || {};
    const labs = window.CISMActiveLearning || {};
    const candidates = [];

    Object.entries(labs).forEach(([domain, lab]) => {
      lab.challenges.forEach(challenge => {
        const m = mastery[challenge.concept];
        if (!m || !["Learning", "Needs Refresh"].includes(m.state)) return;
        candidates.push({
          domain,
          concept: challenge.concept,
          state: m.state,
          attempts: m.attempts || 0,
          memory: challenge.memory
        });
      });
    });

    const unique = [];
    const seen = new Set();

    candidates
      .sort((a, b) => {
        const pa = a.state === "Needs Refresh" ? 0 : 1;
        const pb = b.state === "Needs Refresh" ? 0 : 1;
        return pa - pb || b.attempts - a.attempts;
      })
      .forEach(item => {
        const key = `${item.domain}:${item.concept}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      });

    const fallback = [
      { domain: "Core", concept: "Business", memory: "Security enables the business — it does not exist to maximize restriction." },
      { domain: "Core", concept: "Authority", memory: "Security advises → business authority decides." },
      { domain: "Core", concept: "Sequence", memory: "FIRST = find the prerequisite for this lifecycle stage." },
      { domain: "Core", concept: "Management", memory: "Funding / executive support → business case." }
    ];

    const chosen = unique.length ? unique.slice(0, 4) : fallback;

    grid.innerHTML = chosen.map(item => `
      <div class="memory-home-item ${item.state === "Needs Refresh" ? "refresh" : ""}">
        <span>${item.domain === "Core" ? escapeHTML(item.concept) : `D${escapeHTML(item.domain)} · ${escapeHTML(item.concept)}`}</span>
        <strong>${escapeHTML(item.memory)}</strong>
      </div>
    `).join("");
  }

  function renderActiveProgress() {
    const state = storage.getActiveLearning();
    const progressRoot = document.querySelector("#view-progress .progress-grid");
    if (!progressRoot) return;

    let card = document.getElementById("activeLearningProgressCard");
    if (!card) {
      card = document.createElement("article");
      card.className = "panel";
      card.id = "activeLearningProgressCard";
      progressRoot.appendChild(card);
    }

    const rows = ["1","2","3","4"].map(id => {
      const evidence = state.domainEvidence?.[id] || { attempts: 0, correct: 0 };
      const pct = evidence.attempts ? Math.round((evidence.correct / evidence.attempts) * 100) : 0;
      return `<div class="active-progress-row">
        <div><strong>Domain ${id}</strong><span>${evidence.attempts ? `${evidence.correct}/${evidence.attempts} active checks correct` : "No active checks yet"}</span></div>
        <div class="mini-progress"><span style="width:${pct}%"></span></div>
      </div>`;
    }).join("");

    card.innerHTML = `<div class="panel-heading">
      <div><div class="eyebrow">ACTIVE RETENTION</div><h3>Proof through retrieval</h3></div>
    </div>
    <p class="muted">This tracks interactive evidence — not how many times you reread a page.</p>
    <div class="active-progress-list">${rows}</div>`;
  }

  renderActiveProgress();
  renderStudyMemoryRules();


  document.getElementById("startMixedPracticeCard")?.addEventListener("click", () => {
    window.CISMMixedEngine.open();
  });

  document.addEventListener("cism-mixed-updated", () => {
    renderMixedProgress();
    renderStudyMemoryRules();
  });

  function renderMixedProgress() {
    const state = storage.getMixedPractice();
    const progressRoot = document.querySelector("#view-progress .progress-grid");
    if (!progressRoot) return;

    let card = document.getElementById("mixedMindsetProgressCard");
    if (!card) {
      card = document.createElement("article");
      card.className = "panel";
      card.id = "mixedMindsetProgressCard";
      progressRoot.appendChild(card);
    }

    const rows = Object.entries(state.mindset || {}).map(([key, v]) => {
      const pct = v.attempts ? Math.round((v.correct / v.attempts) * 100) : 0;
      const label = key === "qualifier" ? "Qualifier recognition"
        : key === "role" ? "Role / authority"
        : key === "lifecycle" ? "Lifecycle placement"
        : "Decision context";
      return `<div class="active-progress-row">
        <div><strong>${escapeHTML(label)}</strong><span>${v.attempts ? `${pct}% · ${v.correct}/${v.attempts}` : "No mixed evidence yet"}</span></div>
        <div class="mini-progress"><span style="width:${pct}%"></span></div>
      </div>`;
    }).join("");

    card.innerHTML = `<div class="panel-heading">
      <div><div class="eyebrow">MIXED CISM JUDGMENT</div><h3>Can you identify the problem?</h3></div>
    </div>
    <p class="muted">Mixed Practice measures whether you recognize the qualifier, role, lifecycle stage, and decision context before answering.</p>
    <div class="active-progress-list">${rows}</div>`;
  }

  renderMixedProgress();


  document.getElementById("startPracticeExamCard")?.addEventListener("click", () => {
    window.CISMExamEngine.open();
  });

  function renderExamReadiness() {
    const root = document.querySelector("#view-progress .progress-grid");
    if (!root) return;
    let card = document.getElementById("examReadinessCard");
    if (!card) {
      card = document.createElement("article");
      card.className = "panel exam-readiness-progress";
      card.id = "examReadinessCard";
      root.appendChild(card);
    }
    const exams = storage.getExamReadiness().exams || [];
    if (!exams.length) {
      card.innerHTML = `<div class="panel-heading"><div><div class="eyebrow">EXAM READINESS</div><h3>No exam evidence yet</h3></div></div>
        <p class="muted">Complete Practice Exam + Readiness when you want to test without coaching.</p>`;
      return;
    }
    const last = exams[exams.length-1];
    const recent = exams.slice(-3);
    const avg = Math.round(recent.reduce((a,e)=>a+(e.weightedReadiness||0),0)/recent.length);
    card.innerHTML = `<div class="panel-heading"><div><div class="eyebrow">EXAM READINESS</div><h3>${last.weightedReadiness}% weighted readiness</h3></div><span class="status-pill subtle">${exams.length} exam${exams.length===1?"":"s"}</span></div>
      <p class="muted">Recent ${recent.length}-session average: <strong>${avg}%</strong>. Use repeated evidence, not one lucky score.</p>
      <div class="mini-progress"><span style="width:${last.weightedReadiness}%"></span></div>`;
  }

  document.addEventListener("cism-exam-updated", () => {
    renderExamReadiness();
    renderActiveProgress();
    renderStudyMemoryRules();
  });

  renderExamReadiness();

  function renderQuestionVariance() {
    const root = document.querySelector("#view-progress .progress-grid");
    if (!root) return;
    let card = document.getElementById("questionVarianceCard");
    if (!card) { card=document.createElement("article"); card.className="panel"; card.id="questionVarianceCard"; root.appendChild(card); }
    const families=window.CISMPatternBank?.families?.length || 0;
    const scenarios=window.CISMPatternBank?.questions?.length || 0;
    const total=window.CISMExamBank?.questions?.length || 0;
    card.innerHTML=`<div class="panel-heading"><div><div class="eyebrow">QUESTION VARIANCE</div><h3>${total} exam questions available</h3></div><span class="status-pill subtle">${families} pattern families</span></div><p class="muted">${scenarios} are scenario variants tied to recurring CISM mental models. Practice Exam favors family diversity and recently unseen wording, then shuffles answer positions.</p>`;
  }
  renderQuestionVariance();

  initContentEngine();

})();
