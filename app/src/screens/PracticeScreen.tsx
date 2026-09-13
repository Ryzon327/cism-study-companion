import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { Button } from "../components/Button/Button";
import { QuestionAttemptFlow } from "../session/QuestionAttemptFlow";
import {
  listPracticeScopes,
  getPracticeCountOptions,
  buildPracticeSession,
  conceptForQuestion,
  ALL_SCOPE_ID,
  eligibleQuestionsForTarget,
  getTargetedPracticeCountOptions,
  buildTargetedPracticeSession
} from "../content/practice";
import { productionContentSource } from "../content/productionContentSource";
import type { QuestionFixture } from "../types/content";
import type { PracticeHandoffRequest } from "../study-handoff/types";
import "./PracticeScreen.css";

type PracticePhase = "landing" | "session" | "summary";

interface MissedConcept {
  id: string;
  label: string;
}

interface PracticeScreenProps {
  onExit: () => void;
  // Phase 10B-3: reuses Explore's existing concept routing for the
  // summary's "Review" handoff rather than a new recommendation engine —
  // undefined opens plain Explore (no missed concepts to route to).
  onExploreConcept: (conceptId?: string) => void;
  // LI-4: set only when Practice was entered via an Insights "Practice..."
  // action. A `"domain"` scope simply preselects the existing domain radio
  // option below (the ordinary landing renders unchanged); a `"target"`
  // scope (concept/family/pattern/qualifier/decision_type/evidence_dimension/
  // role/lifecycle/stage) renders a distinct targeted landing. Captured
  // once via useState, exactly like ExploreScreen's own `initialConceptId` —
  // opening Practice from primary navigation always omits this prop, so
  // ordinary Practice is never accidentally sticky with a prior
  // recommendation's target (see docs/architecture/
  // LI-4-IMPLEMENTATION-RECORD.md).
  initialHandoff?: PracticeHandoffRequest;
}

/**
 * Practice — "test me deliberately on material I've already learned,"
 * distinct from Explore ("understand or revisit something specific") and
 * Daily Study ("teach me what's next"). A bounded session: choose a scope
 * and a question count, answer that many questions one at a time through
 * the exact shared QuestionAttemptFlow -> Feedback -> Repair pipeline
 * every other mode uses, then see a calm, truthful summary. No timer, no
 * streaks, no scores, no persistence.
 *
 * Deliberately less scaffolded than Explore: no concept/perspective label
 * is ever shown before or during a question — only the domain label (the
 * same baseline Daily Study's own Apply screen already shows), matching
 * this phase's approved Explore-more-scaffolding / Practice-less-scaffolding
 * progression. The concept a question tested is only surfaced afterward,
 * in the session summary, from data already resolved during the attempt —
 * never inferred or leaked beforehand.
 */
export function PracticeScreen({ onExit, onExploreConcept, initialHandoff }: PracticeScreenProps): JSX.Element | null {
  const scopes = listPracticeScopes();
  const [phase, setPhase] = useState<PracticePhase>("landing");
  const [scopeId, setScopeId] = useState<string>(
    initialHandoff && initialHandoff.scope.kind === "domain" ? initialHandoff.scope.domainId : ALL_SCOPE_ID
  );
  const [targetHandoff, setTargetHandoff] = useState<PracticeHandoffRequest | undefined>(
    initialHandoff && initialHandoff.scope.kind === "target" ? initialHandoff : undefined
  );
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<QuestionFixture[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [missedConcepts, setMissedConcepts] = useState<MissedConcept[]>([]);

  // LI-4: `undefined` unless Practice was entered via an Insights
  // cross-cutting/concept/family "Practice..." action. Re-resolved against
  // CURRENT production content on every render (never a stale snapshot
  // carried from Insights) — see practiceTarget's two call sites below.
  const practiceTarget = targetHandoff?.scope.kind === "target" ? targetHandoff.scope : undefined;

  const countOptions = practiceTarget ? getTargetedPracticeCountOptions(practiceTarget) : getPracticeCountOptions(scopeId);
  const effectiveCount =
    selectedCount && countOptions.some((option) => option.count === selectedCount && option.available)
      ? selectedCount
      : (countOptions.find((option) => option.available)?.count ?? null);

  function startPractice() {
    if (!effectiveCount) return;
    const questions = practiceTarget ? buildTargetedPracticeSession(practiceTarget, effectiveCount) : buildPracticeSession(scopeId, effectiveCount);
    if (questions.length === 0) return;
    setSessionQuestions(questions);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setMissedConcepts([]);
    setPhase("session");
  }

  // LI-4 §19: an obvious, explicit way to leave targeted scope and return
  // to ordinary Practice — never permanently alters the learner's normal
  // Practice preferences (scopeId/selectedCount reset exactly as choosing a
  // different scope already does today).
  function clearTarget() {
    setTargetHandoff(undefined);
    setSelectedCount(null);
  }

  function handleQuestionComplete(correct: boolean) {
    const finishedQuestion = sessionQuestions[currentIndex];
    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setIncorrectCount((c) => c + 1);
      const concept = finishedQuestion ? conceptForQuestion(finishedQuestion.id) : undefined;
      if (concept) {
        setMissedConcepts((prev) => (prev.some((existing) => existing.id === concept.id) ? prev : [...prev, concept]));
      }
    }
    if (currentIndex + 1 >= sessionQuestions.length) {
      setPhase("summary");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function practiceAgain() {
    setSelectedCount(null);
    setPhase("landing");
  }

  if (phase === "landing" && practiceTarget && targetHandoff) {
    // LI-4 §16/§27: a distinct targeted landing — the learner must
    // recognize this is not the whole question bank, and the available
    // count must be truthful (never "10-question practice" for a 6-question
    // pool; never padded with a repeat to reach a configured number).
    const eligibleCount = eligibleQuestionsForTarget(practiceTarget).length;
    return (
      <div class="screen practice-screen">
        <p class="practice-eyebrow">Practice</p>
        <h1 class="practice-title">Targeted practice</h1>
        <p class="practice-target-label">{targetHandoff.label}</p>

        {eligibleCount > 0 ? (
          <>
            <p class="practice-target-count">
              {eligibleCount} question{eligibleCount === 1 ? "" : "s"} available for this focus
            </p>
            <div class="practice-section">
              <p class="practice-section-label" id="practice-count-label">Questions</p>
              <div class="practice-options" role="radiogroup" aria-labelledby="practice-count-label">
                {countOptions.map((option) => (
                  <button
                    key={option.count}
                    type="button"
                    role="radio"
                    aria-checked={effectiveCount === option.count}
                    class={`practice-option practice-option-compact ${effectiveCount === option.count ? "practice-option-selected" : ""}`}
                    onClick={() => setSelectedCount(option.count)}
                  >
                    {option.count}
                  </button>
                ))}
              </div>
            </div>
            <div class="practice-actions">
              <Button onClick={startPractice} disabled={!effectiveCount}>Start Practice &rarr;</Button>
              <Button variant="secondary" onClick={clearTarget}>Practice something else</Button>
              <Button variant="secondary" onClick={onExit}>Done</Button>
            </div>
          </>
        ) : (
          <>
            <p class="practice-target-count">No current questions match this focus right now.</p>
            <div class="practice-actions">
              <Button variant="secondary" onClick={clearTarget}>Practice something else</Button>
              <Button variant="secondary" onClick={onExit}>Done</Button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (phase === "landing") {
    return (
      <div class="screen practice-screen">
        <p class="practice-eyebrow">Practice</p>
        <h1 class="practice-title">Choose what to practice</h1>

        <div class="practice-section">
          <p class="practice-section-label" id="practice-scope-label">Scope</p>
          <div class="practice-options" role="radiogroup" aria-labelledby="practice-scope-label">
            {scopes.map((scope) => (
              <button
                key={scope.id}
                type="button"
                role="radio"
                aria-checked={scopeId === scope.id}
                class={`practice-option ${scopeId === scope.id ? "practice-option-selected" : ""}`}
                disabled={scope.eligibleQuestionCount === 0}
                onClick={() => {
                  setScopeId(scope.id);
                  setSelectedCount(null);
                }}
              >
                {scope.label}
              </button>
            ))}
          </div>
        </div>

        <div class="practice-section">
          <p class="practice-section-label" id="practice-count-label">Questions</p>
          <div class="practice-options" role="radiogroup" aria-labelledby="practice-count-label">
            {countOptions.map((option) => (
              <button
                key={option.count}
                type="button"
                role="radio"
                aria-checked={effectiveCount === option.count}
                class={`practice-option practice-option-compact ${effectiveCount === option.count ? "practice-option-selected" : ""}`}
                disabled={!option.available}
                onClick={() => setSelectedCount(option.count)}
              >
                {option.count}
              </button>
            ))}
          </div>
        </div>

        <div class="practice-actions">
          <Button onClick={startPractice} disabled={!effectiveCount}>Start Practice &rarr;</Button>
          <Button variant="secondary" onClick={onExit}>Done</Button>
        </div>
      </div>
    );
  }

  if (phase === "session") {
    const current = sessionQuestions[currentIndex];
    if (!current) return null;
    return (
      <QuestionAttemptFlow
        // key forces a fresh QuestionAttemptFlow instance per question —
        // without it, moving to the next question would reuse the same
        // component instance and its internal apply/feedback/repair phase
        // and selectedKey would leak from the previous question instead of
        // resetting to a clean "apply" state.
        key={current.id}
        question={current}
        meta={`Question ${currentIndex + 1} of ${sessionQuestions.length} · ${current.domainLabel}`}
        buildFeedback={productionContentSource.buildFeedback}
        getRepairCheck={productionContentSource.getRepairCheck}
        learningMode="practice"
        sourceContext="production"
        onComplete={handleQuestionComplete}
      />
    );
  }

  // phase === "summary"
  return (
    <div class="screen practice-screen">
      <p class="practice-eyebrow">Practice</p>
      <h1 class="practice-title">Practice complete</h1>
      <p class="practice-summary-line">{sessionQuestions.length} questions completed</p>
      <p class="practice-summary-line">{correctCount} correct</p>
      <p class="practice-summary-line">{incorrectCount} needed repair</p>

      {missedConcepts.length > 0 && (
        <div class="practice-review">
          <p class="practice-section-label">Review</p>
          <ul class="practice-review-list">
            {missedConcepts.map((concept) => (
              <li key={concept.id} class="practice-review-item">
                <span>{concept.label}</span>
                <button type="button" class="practice-review-link" onClick={() => onExploreConcept(concept.id)}>
                  Explore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div class="practice-actions">
        <Button onClick={practiceAgain}>Practice again</Button>
        {missedConcepts.length === 0 && (
          <Button variant="secondary" onClick={() => onExploreConcept(undefined)}>Explore a concept</Button>
        )}
        <Button variant="secondary" onClick={onExit}>Done</Button>
      </div>
    </div>
  );
}
