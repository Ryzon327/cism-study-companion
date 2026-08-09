(function () {
  const PREFS_KEY = "cism-companion-prefs-v2";
  const PROGRESS_KEY = "cism-companion-progress-v2";
  const ATTEMPTS_KEY = "cism-companion-attempts-v2";
  const ACTIVE_KEY = "cism-companion-active-learning-v4";
  const MIXED_KEY = "cism-companion-mixed-practice-v8";
  const EXAM_KEY = "cism-companion-exam-readiness-v9";
  const DAILY_KEY = "cism-companion-daily-study-v11";
  const RETENTION_KEY = "cism-companion-retention-v12";
  const RECOVERY_KEY = "cism-companion-pre-import-recovery-v13";
  const CURRICULUM_KEY = "cism-companion-curriculum-v15";

  const defaults = { theme: "light", sessionLength: "normal" };

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("CISM Study Companion could not save local data.", error);
      window.dispatchEvent(new CustomEvent("cism-storage-warning", {
        detail: { message: "Your browser could not save the latest change. Export a backup before continuing." }
      }));
      return false;
    }
  }

  function isPlainObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function boundedArray(value, max) {
    return Array.isArray(value) ? value.slice(-max) : [];
  }


  function safeParse(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function getPrefs() { return { ...defaults, ...safeParse(PREFS_KEY, {}) }; }
  function setPrefs(next) {
    const merged = { ...getPrefs(), ...next };
    safeWrite(PREFS_KEY, merged);
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
    safeWrite(PROGRESS_KEY, merged);
    return merged;
  }

  function getAttempts() { return safeParse(ATTEMPTS_KEY, []); }
  function addAttempt(attempt) {
    const attempts = getAttempts();
    attempts.push({ ...attempt, timestamp: new Date().toISOString() });
    if (attempts.length > 1000) attempts.splice(0, attempts.length - 1000);
    safeWrite(ATTEMPTS_KEY, attempts);
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
    if (state.challengeHistory.length > 1500) state.challengeHistory = state.challengeHistory.slice(-1500);

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

    safeWrite(ACTIVE_KEY, state);
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
    if (state.attempts.length > 1000) state.attempts = state.attempts.slice(-1000);

    ["qualifier", "role", "lifecycle", "decision"].forEach(dim => {
      if (result.mindset?.[dim] == null) return;
      const bucket = state.mindset[dim] || { correct: 0, attempts: 0 };
      bucket.attempts += 1;
      if (result.mindset[dim]) bucket.correct += 1;
      state.mindset[dim] = bucket;
    });

    safeWrite(MIXED_KEY, state);

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
    if (state.sessions.length > 200) state.sessions = state.sessions.slice(-200);
    safeWrite(MIXED_KEY, state);
    return state;
  }


  function getExamReadiness() {
    return safeParse(EXAM_KEY, { exams: [] });
  }

  function recordExam(result) {
    const state = getExamReadiness();
    state.exams.push({ ...result, completedAt: new Date().toISOString() });
    if (state.exams.length > 20) state.exams = state.exams.slice(-20);
    safeWrite(EXAM_KEY, state);
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
        learn: false,
        lifecycle: false,
        decoder: false,
        apply: false,
        repair: false,
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
    safeWrite(DAILY_KEY, state);
    return state.days[key];
  }


  function getRetentionState() {
    return safeParse(RETENTION_KEY, { snapshots: [] });
  }

  function recordRetentionSnapshot(snapshot) {
    const state = getRetentionState();
    state.snapshots.push({ ...snapshot, timestamp: new Date().toISOString() });
    if (state.snapshots.length > 60) state.snapshots = state.snapshots.slice(-60);
    safeWrite(RETENTION_KEY, state);
    return state;
  }


  function defaultCurriculum() {
    return { phase:"learning", foundationCompleted:false, currentDomain:"1", completedDomains:[], introducedConcepts:{}, completedAt:null };
  }

  function getCurriculum() {
    const raw = localStorage.getItem(CURRICULUM_KEY);
    const c = { ...defaultCurriculum(), ...(raw ? safeParse(CURRICULUM_KEY, defaultCurriculum()) : {}) };

    if (!raw) {
      const priorProgress = safeParse(PROGRESS_KEY, {});
      if ((priorProgress.sessionsCompleted || 0) > 0) {
        c.foundationCompleted = true;
        c.currentDomain = "1";
      }
    }

    c.completedDomains = Array.isArray(c.completedDomains) ? c.completedDomains.map(String) : [];
    c.introducedConcepts = isPlainObject(c.introducedConcepts) ? c.introducedConcepts : {};
    if (!["learning","reinforcement"].includes(c.phase)) c.phase="learning";
    if (!["1","2","3","4"].includes(String(c.currentDomain))) c.currentDomain="1";
    return c;
  }

  function setCurriculum(patch) {
    const c=getCurriculum();
    const next={...c,...patch};
    if (patch.completedDomains) next.completedDomains=[...new Set(patch.completedDomains.map(String))];
    if (patch.introducedConcepts) next.introducedConcepts={...c.introducedConcepts,...patch.introducedConcepts};
    safeWrite(CURRICULUM_KEY,next);
    return next;
  }

  function markFoundationComplete() {
    const next=setCurriculum({foundationCompleted:true,currentDomain:"1"});
    window.dispatchEvent(new CustomEvent("cism-curriculum-updated",{detail:next}));
    return next;
  }

  function markConceptIntroduced(domain,concept) {
    const c=getCurriculum(), key=String(domain);
    const introduced={...c.introducedConcepts};
    const list=Array.isArray(introduced[key])?introduced[key]:[];
    introduced[key]=[...new Set([...list,concept])];
    return setCurriculum({introducedConcepts:introduced});
  }

  function markDomainComplete(domain) {
    const d=String(domain), c=getCurriculum();
    const completed=[...new Set([...c.completedDomains,d])];
    const all=["1","2","3","4"].every(x=>completed.includes(x));
    const next=setCurriculum({
      completedDomains:completed,
      currentDomain:all?"4":String(Math.min(4,Number(d)+1)),
      phase:all?"reinforcement":"learning",
      completedAt:all?new Date().toISOString():c.completedAt
    });
    window.dispatchEvent(new CustomEvent("cism-curriculum-updated",{detail:next}));
    return next;
  }

  function conceptHasBeenIntroduced(domain,concept) {
    return (getCurriculum().introducedConcepts?.[String(domain)]||[]).includes(concept);
  }

  function exportData() {
    return {
      app: "CISM Study Companion",
      version: 14,
      exportedAt: new Date().toISOString(),
      prefs: getPrefs(),
      progress: getProgress(),
      attempts: getAttempts(),
      activeLearning: getActiveLearning(),
      mixedPractice: getMixedPractice(),
      examReadiness: getExamReadiness(),
      dailyStudy: getDailyStudy(),
      retentionState: getRetentionState(),
      curriculum: getCurriculum()
    };
  }

  function validateImport(data) {
    if (!data || data.app !== "CISM Study Companion") {
      throw new Error("That file does not look like a CISM Study Companion backup.");
    }
    if (data.prefs != null && !isPlainObject(data.prefs)) throw new Error("Backup preferences are invalid.");
    if (data.progress != null && !isPlainObject(data.progress)) throw new Error("Backup progress is invalid.");
    if (data.attempts != null && !Array.isArray(data.attempts)) throw new Error("Backup attempts are invalid.");
    if (data.activeLearning != null && !isPlainObject(data.activeLearning)) throw new Error("Backup active-learning data is invalid.");
    if (data.mixedPractice != null && !isPlainObject(data.mixedPractice)) throw new Error("Backup mixed-practice data is invalid.");
    if (data.examReadiness != null && !isPlainObject(data.examReadiness)) throw new Error("Backup exam-readiness data is invalid.");
    if (data.dailyStudy != null && !isPlainObject(data.dailyStudy)) throw new Error("Backup daily-study data is invalid.");
    if (data.retentionState != null && !isPlainObject(data.retentionState)) throw new Error("Backup retention data is invalid.");
    if (data.curriculum != null && !isPlainObject(data.curriculum)) throw new Error("Backup curriculum data is invalid.");
    return true;
  }

  function importData(data) {
    validateImport(data);

    safeWrite(RECOVERY_KEY, exportData());

    const normalizedActive = {
      challengeHistory: boundedArray(data.activeLearning?.challengeHistory, 1500),
      mastery: isPlainObject(data.activeLearning?.mastery) ? data.activeLearning.mastery : {},
      domainEvidence: isPlainObject(data.activeLearning?.domainEvidence) ? data.activeLearning.domainEvidence : {}
    };

    const normalizedMixed = {
      sessions: boundedArray(data.mixedPractice?.sessions, 200),
      attempts: boundedArray(data.mixedPractice?.attempts, 1000),
      mindset: isPlainObject(data.mixedPractice?.mindset) ? data.mixedPractice.mindset : {}
    };

    const writes = [
      [PREFS_KEY, { ...defaults, ...(data.prefs || {}) }],
      [PROGRESS_KEY, data.progress || getProgress()],
      [ATTEMPTS_KEY, boundedArray(data.attempts, 1000)],
      [ACTIVE_KEY, normalizedActive],
      [MIXED_KEY, normalizedMixed],
      [EXAM_KEY, { exams: boundedArray(data.examReadiness?.exams, 20) }],
      [DAILY_KEY, isPlainObject(data.dailyStudy) ? data.dailyStudy : { days: {} }],
      [RETENTION_KEY, { snapshots: boundedArray(data.retentionState?.snapshots, 60) }],
      [CURRICULUM_KEY, isPlainObject(data.curriculum) ? data.curriculum : defaultCurriculum()]
    ];

    for (const [key, value] of writes) {
      if (!safeWrite(key, value)) {
        throw new Error("The backup was valid, but the browser could not save all imported data.");
      }
    }
    return true;
  }

  function getRecoveryBackup() {
    return safeParse(RECOVERY_KEY, null);
  }

  window.CISMStorage = { getPrefs, setPrefs, getProgress, setProgress, getAttempts, addAttempt, getActiveLearning, recordActiveResult, getMixedPractice, recordMixedAttempt, recordMixedSession, getExamReadiness, recordExam, getDailyStudy, getTodayStudy, setTodayStudy, getRetentionState, recordRetentionSnapshot, getCurriculum, setCurriculum, markFoundationComplete, markConceptIntroduced, markDomainComplete, conceptHasBeenIntroduced, exportData, importData, getRecoveryBackup };
})();
