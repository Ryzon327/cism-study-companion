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
    const raw = safeParse(ACTIVE_KEY, {});
    // Defend each sub-key individually. safeParse only substitutes the whole
    // fallback when the stored value is missing, so a partially-shaped blob
    // (older build, hand-edited backup, interrupted write) previously reached
    // recordActiveResult() with challengeHistory undefined and threw.
    return {
      challengeHistory: Array.isArray(raw.challengeHistory) ? raw.challengeHistory : [],
      mastery: isPlainObject(raw.mastery) ? raw.mastery : {},
      domainEvidence: isPlainObject(raw.domainEvidence) ? raw.domainEvidence : {}
    };
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
    const raw = safeParse(MIXED_KEY, {});
    const mindset = isPlainObject(raw.mindset) ? raw.mindset : {};
    // Every dimension must always be present: renderCompletion() and the
    // progress cards iterate these keys directly.
    ["qualifier", "role", "lifecycle", "decision"].forEach(dim => {
      if (!isPlainObject(mindset[dim])) mindset[dim] = { correct: 0, attempts: 0 };
    });
    return {
      sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
      attempts: Array.isArray(raw.attempts) ? raw.attempts : [],
      mindset
    };
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
    const raw = safeParse(EXAM_KEY, {});
    return { exams: Array.isArray(raw.exams) ? raw.exams : [] };
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
    const raw = safeParse(DAILY_KEY, {});
    return { days: isPlainObject(raw.days) ? raw.days : {} };
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
    const raw = safeParse(RETENTION_KEY, {});
    return { snapshots: Array.isArray(raw.snapshots) ? raw.snapshots : [] };
  }

  function recordRetentionSnapshot(snapshot) {
    const state = getRetentionState();
    state.snapshots.push({ ...snapshot, timestamp: new Date().toISOString() });
    if (state.snapshots.length > 60) state.snapshots = state.snapshots.slice(-60);
    safeWrite(RETENTION_KEY, state);
    return state;
  }


  function defaultCurriculum() {
    // introducedConcepts = surfaced to the learner (eligible for recall/practice).
    // studiedConcepts    = actually taught in a Daily Study session the learner opened.
    // Domain completion is measured from studiedConcepts only, so rendering the
    // home screen can never advance the curriculum.
    return { phase:"learning", foundationCompleted:false, currentDomain:"1", completedDomains:[], introducedConcepts:{}, studiedConcepts:{}, completedAt:null };
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
    c.studiedConcepts = isPlainObject(c.studiedConcepts) ? c.studiedConcepts : {};
    if (!["learning","reinforcement"].includes(c.phase)) c.phase="learning";
    if (!["1","2","3","4"].includes(String(c.currentDomain))) c.currentDomain="1";
    return c;
  }

  function setCurriculum(patch) {
    const c=getCurriculum();
    const next={...c,...patch};
    if (patch.completedDomains) next.completedDomains=[...new Set(patch.completedDomains.map(String))];
    if (patch.introducedConcepts) next.introducedConcepts={...c.introducedConcepts,...patch.introducedConcepts};
    if (patch.studiedConcepts) next.studiedConcepts={...c.studiedConcepts,...patch.studiedConcepts};
    safeWrite(CURRICULUM_KEY,next);
    return next;
  }

  function markFoundationComplete() {
    const next=setCurriculum({foundationCompleted:true,currentDomain:"1"});
    // Dispatched on document: app.js listens there, as do all other cism-* events.
    document.dispatchEvent(new CustomEvent("cism-curriculum-updated",{detail:next}));
    return next;
  }

  function addToConceptMap(mapName,domain,concept) {
    const c=getCurriculum(), key=String(domain);
    const map={...c[mapName]};
    const list=Array.isArray(map[key])?map[key]:[];
    map[key]=[...new Set([...list,concept])];
    return setCurriculum({[mapName]:map});
  }

  function markConceptIntroduced(domain,concept) {
    return addToConceptMap("introducedConcepts",domain,concept);
  }

  // Called only when the learner actually opens a Daily Study session.
  function markConceptStudied(domain,concept) {
    addToConceptMap("introducedConcepts",domain,concept);
    return addToConceptMap("studiedConcepts",domain,concept);
  }

  function conceptHasBeenStudied(domain,concept) {
    return (getCurriculum().studiedConcepts?.[String(domain)]||[]).includes(concept);
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
    document.dispatchEvent(new CustomEvent("cism-curriculum-updated",{detail:next}));
    return next;
  }

  function conceptHasBeenIntroduced(domain,concept) {
    return (getCurriculum().introducedConcepts?.[String(domain)]||[]).includes(concept);
  }

  // ---------------------------------------------------------------
  // Build 16 migration.
  //
  // Before Build 16, simply rendering the home screen called
  // markConceptIntroduced(), so introducedConcepts could not be trusted as
  // evidence that a concept was ever taught. studiedConcepts is therefore
  // seeded from the only trustworthy record we have: daily entries whose
  // "learn" phase was completed, which is written exclusively by a learner
  // clicking through Daily Study.
  //
  // This is additive. Nothing is deleted, and introducedConcepts is left
  // exactly as-is so existing recall and practice eligibility are unchanged.
  // ---------------------------------------------------------------
  function migrateStudiedConcepts() {
    const raw = localStorage.getItem(CURRICULUM_KEY);
    if (!raw) return;                       // fresh install: nothing to migrate
    const c = getCurriculum();
    if (isPlainObject(c.studiedConcepts) && Object.keys(c.studiedConcepts).length) return; // already migrated

    const seeded = {};
    const days = getDailyStudy().days;
    Object.values(days).forEach(day => {
      if (!day || !day.phases?.learn) return;
      const d = String(day.focusDomain || "");
      if (!d || !day.focusConcept) return;
      const list = seeded[d] || (seeded[d] = []);
      if (!list.includes(day.focusConcept)) list.push(day.focusConcept);
    });

    // A completed domain is prior evidence in its own right; keep it whole so
    // an existing learner is never pushed backwards through finished material.
    (c.completedDomains || []).forEach(d => {
      const introduced = c.introducedConcepts?.[d];
      if (Array.isArray(introduced) && introduced.length) {
        seeded[d] = [...new Set([...(seeded[d] || []), ...introduced])];
      }
    });

    setCurriculum({ studiedConcepts: seeded });
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

  try { migrateStudiedConcepts(); }
  catch (error) { console.warn("CISM Study Companion could not migrate curriculum evidence.", error); }

  window.CISMStorage = { getPrefs, setPrefs, getProgress, setProgress, getAttempts, addAttempt, getActiveLearning, recordActiveResult, getMixedPractice, recordMixedAttempt, recordMixedSession, getExamReadiness, recordExam, getDailyStudy, getTodayStudy, setTodayStudy, getRetentionState, recordRetentionSnapshot, getCurriculum, setCurriculum, markFoundationComplete, markConceptIntroduced, markConceptStudied, markDomainComplete, conceptHasBeenIntroduced, conceptHasBeenStudied, exportData, importData, getRecoveryBackup };
})();
