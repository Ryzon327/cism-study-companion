/**
 * Minimal TypeScript shapes for Phase 5B's prototype fixtures.
 *
 * These mirror the shape of docs/data-model/SCHEMA-*.md's canonical
 * entities closely enough to make the fixtures realistic, but are NOT a
 * full port of the canonical schema and are NOT wired to schema/registry
 * or schema/example JSON. Real canonical-data integration is later work
 * (Phase 5A's "Canonical-Data Integration Strategy") — deliberately out of
 * scope for a visual-only prototype. See app/src/data/fixtures.ts.
 */

export type ContentStatus = "CANONICAL" | "CANDIDATE" | "PROTOTYPE_REFERENCE";

export interface JourneyStep {
  id: string;
  label: string;
  state: "completed" | "current" | "upcoming";
}

export interface TodayFocusFixture {
  domainLabel: string;
  domainNumeral: string;
  domainPosition: string;
  title: string;
  reason: string;
  // Short orientation label for the Home snapshot card ONLY — never the
  // same text as `reason` (the main paragraph's source). Deliberately not
  // a duration estimate: see docs/learning/PHASE-7C-GATE-RECORD.md's Home
  // UX correction entry for why a fabricated numeric session length was
  // removed instead of being replaced with a different guessed number.
  focus: string;
}

export interface HomeStateFixture {
  journeySteps: JourneyStep[];
  todayFocus: TodayFocusFixture;
}

export interface PatternFixture {
  id: string;
  displayName: string;
  meaning: string;
  recognitionClue: string;
}

export interface LessonFixture {
  domainLabel: string;
  conceptTitle: string;
  whyItMatters: string;
  context: string;
  pattern?: PatternFixture;
  scenario: string;
  memoryRule: string;
}

export interface AnswerOptionFixture {
  key: "a" | "b" | "c" | "d";
  text: string;
  correct: boolean;
  rationale: string;
}

export interface QuestionFixture {
  id: string;
  domainLabel: string;
  prompt: string;
  options: AnswerOptionFixture[];
}

export interface RoleTagFixture {
  label: string;
}

export interface QualifierFixture {
  label: string;
}

export interface LifecycleStageFixture {
  label: string;
  current: boolean;
}

export interface FeedbackFixture {
  question: QuestionFixture;
  selectedKey: AnswerOptionFixture["key"];
  correct: boolean;
  why: string;
  whySelectedWasWeaker?: string;
  pattern?: PatternFixture;
  qualifier?: QualifierFixture;
  role?: RoleTagFixture;
  lifecycle: LifecycleStageFixture[];
  memoryRule: string;
}

export interface ExamQuestionState {
  index: number;
  answered: boolean;
  marked: boolean;
}

export interface RecallCheckFixture {
  domainLabel: string;
  prompt: string;
  options: AnswerOptionFixture[];
  reinforcement: string;
  // Phase 10B-4: the underlying question's id, when the content source can
  // supply one (the production source can; the Phase 5B prototype fixture
  // cannot and omits it). Lets Optional Reinforcement draw a second,
  // already-relevant family from the same Daily Study session — the recall
  // question's own family — without Daily Study needing to expose any
  // other lesson/family plumbing.
  questionId?: string;
}

export interface RepairCheckFixture {
  prompt: string;
  options: AnswerOptionFixture[];
  confirmation: string;
}

export interface CompletionSummaryFixture {
  headline: string;
  detail: string;
  optionalLabel: string;
  coveredItems: string[];
}
