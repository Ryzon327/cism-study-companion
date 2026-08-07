(function () {
  const PREFS_KEY = "cism-companion-prefs-v2";
  const PROGRESS_KEY = "cism-companion-progress-v2";
  const ATTEMPTS_KEY = "cism-companion-attempts-v2";

  const defaults = { theme: "light", sessionLength: "normal" };

  function safeParse(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function getPrefs() { return { ...defaults, ...safeParse(PREFS_KEY, {}) }; }
  function setPrefs(next) {
    const merged = { ...getPrefs(), ...next };
    localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
    return merged;
  }

  function getProgress() {
    return {
      currentView: "study",
      currentSessionId: "foundation-cism-mindset-01",
      currentStep: 0,
      sessionsCompleted: 0,
      lastUpdated: null,
      ...safeParse(PROGRESS_KEY, {})
    };
  }

  function setProgress(next) {
    const merged = { ...getProgress(), ...next, lastUpdated: new Date().toISOString() };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
    return merged;
  }

  function getAttempts() { return safeParse(ATTEMPTS_KEY, []); }
  function addAttempt(attempt) {
    const attempts = getAttempts();
    attempts.push({ ...attempt, timestamp: new Date().toISOString() });
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
    return attempts;
  }

  function exportData() {
    return {
      app: "CISM Study Companion",
      version: 2,
      exportedAt: new Date().toISOString(),
      prefs: getPrefs(),
      progress: getProgress(),
      attempts: getAttempts()
    };
  }

  function importData(data) {
    if (!data || data.app !== "CISM Study Companion") throw new Error("That file does not look like a CISM Study Companion backup.");
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...defaults, ...(data.prefs || {}) }));
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data.progress || getProgress()));
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data.attempts || []));
  }

  window.CISMStorage = { getPrefs, setPrefs, getProgress, setProgress, getAttempts, addAttempt, exportData, importData };
})();
