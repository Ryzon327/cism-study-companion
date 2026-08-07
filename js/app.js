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
})();
