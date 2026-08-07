(function () {
  const PREFS_KEY = "cism-companion-prefs-v2";
  const PROGRESS_KEY = "cism-companion-progress-v2";
  const ATTEMPTS_KEY = "cism-companion-attempts-v2";
  const ACTIVE_KEY = "cism-companion-active-learning-v4";
  const MIXED_KEY = "cism-companion-mixed-practice-v8";
  const EXAM_KEY = "cism-companion-exam-readiness-v9";
  const DAILY_KEY = "cism-companion-daily-study-v11";

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


  function getMixedPractice() {
    return safeParse(MIXED_KEY, {
      sessions: [],
      attempts: [],
      mindset: {
        qualifier: { correct: 0, attempts: 0 },
        role: { correct: 0, attempts: 0 },
        lifecycle: { correct: 0, attempts: 0 },
        decision: { correct: 0, attempts: 0 }
      }
    });
  }

  function recordMixedAttempt(result) {
    const state = getMixedPractice();
    state.attempts.push({ ...result, timestamp: new Date().toISOString() });

    ["qualifier", "role", "lifecycle", "decision"].forEach(dim => {
      if (result.mindset?.[dim] == null) return;
      const bucket = state.mindset[dim] || { correct: 0, attempts: 0 };
      bucket.attempts += 1;
      if (result.mindset[dim]) bucket.correct += 1;
      state.mindset[dim] = bucket;
    });

    localStorage.setItem(MIXED_KEY, JSON.stringify(state));

    // Feed the core concept result into the same mastery/repair engine.
    recordActiveResult({
      domain: result.domain,
      challengeId: `mixed:${result.questionId}`,
      type: "mixed",
      concept: result.concept,
      correct: result.correct
    });

    return state;
  }

  function recordMixedSession(session) {
    const state = getMixedPractice();
    state.sessions.push({ ...session, completedAt: new Date().toISOString() });
    localStorage.setItem(MIXED_KEY, JSON.stringify(state));
    return state;
  }


  function getExamReadiness() {
    return safeParse(EXAM_KEY, { exams: [] });
  }

  function recordExam(result) {
    const state = getExamReadiness();
    state.exams.push({ ...result, completedAt: new Date().toISOString() });
    if (state.exams.length > 20) state.exams = state.exams.slice(-20);
    localStorage.setItem(EXAM_KEY, JSON.stringify(state));
    return state;
  }


  function localDateKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth()+1).padStart(2,"0");
    const d = String(now.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  }

  function getDailyStudy() {
    return safeParse(DAILY_KEY, { days: {} });
  }

  function getTodayStudy() {
    const state = getDailyStudy();
    const key = localDateKey();
    return state.days[key] || {
      date: key,
      focusDomain: null,
      focusConcept: null,
      phases: {
        recall: false,
        review: false,
        active: false,
        mixed: false,
        close: false
      },
      completed: false
    };
  }

  function setTodayStudy(patch) {
    const state = getDailyStudy();
    const key = localDateKey();
    const current = getTodayStudy();
    state.days[key] = {
      ...current,
      ...patch,
      phases: { ...current.phases, ...(patch.phases || {}) },
      updatedAt: new Date().toISOString()
    };
    // Keep only the most recent 45 daily records.
    const keys = Object.keys(state.days).sort();
    while (keys.length > 45) {
      const remove = keys.shift();
      delete state.days[remove];
    }
    localStorage.setItem(DAILY_KEY, JSON.stringify(state));
    return state.days[key];
  }

  function exportData() {
    return {
      app: "CISM Study Companion",
      version: 2,
      exportedAt: new Date().toISOString(),
      prefs: getPrefs(),
      progress: getProgress(),
      attempts: getAttempts(),
      activeLearning: getActiveLearning(),
      mixedPractice: getMixedPractice(),
      examReadiness: getExamReadiness(),
      dailyStudy: getDailyStudy()
    };
  }

  function importData(data) {
    if (!data || data.app !== "CISM Study Companion") throw new Error("That file does not look like a CISM Study Companion backup.");
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...defaults, ...(data.prefs || {}) }));
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data.progress || getProgress()));
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data.attempts || []));
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(data.activeLearning || { challengeHistory: [], mastery: {}, domainEvidence: {} }));
    localStorage.setItem(MIXED_KEY, JSON.stringify(data.mixedPractice || { sessions: [], attempts: [], mindset: {} }));
    localStorage.setItem(EXAM_KEY, JSON.stringify(data.examReadiness || { exams: [] }));
    localStorage.setItem(DAILY_KEY, JSON.stringify(data.dailyStudy || { days: {} }));
  }

  window.CISMStorage = { getPrefs, setPrefs, getProgress, setProgress, getAttempts, addAttempt, getActiveLearning, recordActiveResult, getMixedPractice, recordMixedAttempt, recordMixedSession, getExamReadiness, recordExam, getDailyStudy, getTodayStudy, setTodayStudy, exportData, importData };
})();
