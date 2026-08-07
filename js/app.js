(function () {
  const storage = window.CISMStorage;
  const study = window.CISMStudy;
  const quiz = window.CISMQuiz;

  const html = document.documentElement;
  const prefs = storage.getPrefs();

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

  let currentStudyStep = Math.min(storage.getProgress().foundationStep || 0, study.steps.length - 1);

  const titles = {
    study: ["TODAY", "Your CISM study is ready."],
    explore: ["EXPLORE", "Everything has a place."],
    practice: ["PRACTICE", "Practice without losing the flow."],
    progress: ["PROGRESS", "See what matters, not everything."]
  };

  function applyTheme(theme) {
    html.dataset.theme = theme;
    themeIcon.textContent = theme === "light" ? "☾" : "☀";
    themeLabel.textContent = theme === "light" ? "Dark mode" : "Light mode";
  }

  applyTheme(prefs.theme);
  sessionLength.value = prefs.sessionLength || "normal";

  themeToggle.addEventListener("click", () => {
    const next = html.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next);
    storage.setPrefs({ theme: next });
  });

  navItems.forEach((item) => {
    item.addEventListener("click", () => switchView(item.dataset.view));
  });

  function switchView(viewName) {
    navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
    views.forEach((view) => view.classList.toggle("active", view.id === `view-${viewName}`));
    const [eyebrow, title] = titles[viewName];
    pageEyebrow.textContent = eyebrow;
    pageTitle.textContent = title;
    storage.setProgress({ currentView: viewName });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const savedView = storage.getProgress().currentView || "study";
  switchView(savedView);

  settingsButton.addEventListener("click", () => settingsDialog.showModal());

  sessionLength.addEventListener("change", () => {
    storage.setPrefs({ sessionLength: sessionLength.value });
  });

  exportButton.addEventListener("click", () => {
    const data = storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cism-study-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  importInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      storage.importData(parsed);
      alert("Backup restored. The app will reload.");
      location.reload();
    } catch (err) {
      alert(err.message || "Could not import that backup.");
    } finally {
      importInput.value = "";
    }
  });

  continueStudyButton.addEventListener("click", openStudy);
  closeStudyButton.addEventListener("click", closeStudy);

  studyBackButton.addEventListener("click", () => {
    if (currentStudyStep === 0) return;
    currentStudyStep--;
    renderStudyStep();
  });

  studyNextButton.addEventListener("click", () => {
    if (currentStudyStep < study.steps.length - 1) {
      currentStudyStep++;
      storage.setProgress({ foundationStep: currentStudyStep });
      renderStudyStep();
    } else {
      const progress = storage.getProgress();
      storage.setProgress({
        foundationStep: 0,
        sessionsCompleted: (progress.sessionsCompleted || 0) + 1
      });
      currentStudyStep = 0;
      closeStudy();
    }
  });

  function sessionLabel() {
    const val = storage.getPrefs().sessionLength;
    if (val === "quick") return "~15 min session";
    if (val === "deep") return "~60 min session";
    return "~35 min session";
  }

  function openStudy() {
    studyOverlay.classList.remove("hidden");
    studyOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    renderStudyStep();
  }

  function closeStudy() {
    studyOverlay.classList.add("hidden");
    studyOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function renderStudyStep() {
    const step = study.steps[currentStudyStep];
    studyContent.innerHTML = study.renderStep(currentStudyStep);
    studyStepLabel.textContent = `${currentStudyStep + 1} of ${study.steps.length} · ${step.name}`;
    studyTimeLabel.textContent = sessionLabel();
    studyProgressBar.style.width = `${((currentStudyStep + 1) / study.steps.length) * 100}%`;
    studyBackButton.disabled = currentStudyStep === 0;
    studyBackButton.style.opacity = currentStudyStep === 0 ? ".4" : "1";
    studyNextButton.innerHTML = currentStudyStep === study.steps.length - 1
      ? `Finish <span>✓</span>`
      : `Continue <span>→</span>`;
    quiz.bindChoices(studyContent);
  }
})();
