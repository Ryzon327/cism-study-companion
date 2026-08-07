(function () {
  const PREFS_KEY = "cism-companion-prefs-v1";
  const PROGRESS_KEY = "cism-companion-progress-v1";

  const defaults = {
    theme: "light",
    sessionLength: "normal"
  };

  function getPrefs() {
    try {
      return { ...defaults, ...(JSON.parse(localStorage.getItem(PREFS_KEY)) || {}) };
    } catch {
      return { ...defaults };
    }
  }

  function setPrefs(next) {
    const merged = { ...getPrefs(), ...next };
    localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
    return merged;
  }

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {
        currentView: "study",
        foundationStep: 0,
        sessionsCompleted: 0,
        lastUpdated: null
      };
    } catch {
      return {
        currentView: "study",
        foundationStep: 0,
        sessionsCompleted: 0,
        lastUpdated: null
      };
    }
  }

  function setProgress(next) {
    const merged = {
      ...getProgress(),
      ...next,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
    return merged;
  }

  function exportData() {
    return {
      app: "CISM Study Companion",
      version: 1,
      exportedAt: new Date().toISOString(),
      prefs: getPrefs(),
      progress: getProgress()
    };
  }

  function importData(data) {
    if (!data || data.app !== "CISM Study Companion") {
      throw new Error("That file does not look like a CISM Study Companion backup.");
    }
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...defaults, ...(data.prefs || {}) }));
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data.progress || getProgress()));
  }

  window.CISMStorage = {
    getPrefs,
    setPrefs,
    getProgress,
    setProgress,
    exportData,
    importData
  };
})();
