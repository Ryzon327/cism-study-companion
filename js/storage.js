(function () {
  const PREFS_KEY = "cism-companion-prefs-v2";
  const PROGRESS_KEY = "cism-companion-progress-v2";
  const ATTEMPTS_KEY = "cism-companion-attempts-v2";
  const ACTIVE_KEY = "cism-companion-active-learning-v4";

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


  function getActiveLearning() {
    return safeParse(ACTIVE_KEY, {
      challengeHistory: [],
      mastery: {},
      domainEvidence: {}
    });
  }

  function recordActiveResult(result) {
    const state = getActiveLearning();
    state.challengeHistory.push({ ...result, timestamp: new Date().toISOString() });

    const key = result.concept || result.challengeId;
    const prior = state.mastery[key] || { attempts: 0, correct: 0, lastSeen: null };
    prior.attempts += 1;
    if (result.correct) {
      prior.correct += 1;
      prior.consecutiveCorrect = (prior.consecutiveCorrect || 0) + 1;
      prior.consecutiveWrong = 0;
    } else {
      prior.consecutiveWrong = (prior.consecutiveWrong || 0) + 1;
      prior.consecutiveCorrect = 0;
      prior.lastMissed = new Date().toISOString();
    }

    prior.lastSeen = new Date().toISOString();
    const rate = prior.attempts ? prior.correct / prior.attempts : 0;

    if (!result.correct && (prior.state === "Strong" || prior.state === "Usable")) {
      prior.state = "Needs Refresh";
    } else if (prior.attempts >= 4 && rate >= 0.80 && (prior.consecutiveCorrect || 0) >= 2) {
      prior.state = "Strong";
    } else if (prior.correct >= 2 && rate >= 0.60) {
      prior.state = "Usable";
    } else {
      prior.state = "Learning";
    }

    state.mastery[key] = prior;

    const d = String(result.domain);
    const domain = state.domainEvidence[d] || { attempts: 0, correct: 0 };
    domain.attempts += 1;
    if (result.correct) domain.correct += 1;
    state.domainEvidence[d] = domain;

    localStorage.setItem(ACTIVE_KEY, JSON.stringify(state));
    return state;
  }

  function exportData() {
    return {
      app: "CISM Study Companion",
      version: 2,
      exportedAt: new Date().toISOString(),
      prefs: getPrefs(),
      progress: getProgress(),
      attempts: getAttempts(),
      activeLearning: getActiveLearning()
    };
  }

  function importData(data) {
    if (!data || data.app !== "CISM Study Companion") throw new Error("That file does not look like a CISM Study Companion backup.");
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...defaults, ...(data.prefs || {}) }));
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data.progress || getProgress()));
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data.attempts || []));
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(data.activeLearning || { challengeHistory: [], mastery: {}, domainEvidence: {} }));
  }

  window.CISMStorage = { getPrefs, setPrefs, getProgress, setProgress, getAttempts, addAttempt, getActiveLearning, recordActiveResult, exportData, importData };
})();
