/**
 * Joins content/production/ entities with schema/registry/ vocabulary into
 * the same rendering shapes app/src/types/content.ts already declares
 * (LessonFixture, QuestionFixture, FeedbackFixture) — so DailyStudySession
 * and every screen component work identically whether their content came
 * from app/src/data/fixtures.ts (Phase 5B prototype) or here. Nothing in
 * this file is UI; it produces plain data.
 */
import { registry, production, requireDisplayName, type ProductionQuestion, type ProductionLesson } from "./registry";
import { selectVariant, type ExposureHistory } from "./selection";
import type {
  LessonFixture,
  QuestionFixture,
  AnswerOptionFixture,
  FeedbackFixture,
  PatternFixture,
  QualifierFixture,
  RoleTagFixture
} from "../types/content";

function domainLabel(domainId: string): string {
  return requireDisplayName(registry.domains, domainId);
}

function resolvePattern(patternIds: string[]): PatternFixture | undefined {
  const firstId = patternIds[0];
  if (!firstId) return undefined;
  const pattern = registry.patterns.get(firstId);
  if (!pattern) throw new Error(`Unresolvable pattern reference: ${firstId}`);
  return {
    id: pattern.id,
    displayName: pattern.display_name,
    meaning: pattern.meaning as string,
    recognitionClue: (pattern.recognition_clues as string[])[0] ?? ""
  };
}

function resolveQualifier(qualifierId: string | null): QualifierFixture | undefined {
  if (!qualifierId) return undefined;
  return { label: requireDisplayName(registry.qualifiers, qualifierId) };
}

function resolveRole(roleId: string | null): RoleTagFixture | undefined {
  if (!roleId) return undefined;
  return { label: requireDisplayName(registry.roles, roleId) };
}

export function resolveLesson(lessonId: string): LessonFixture {
  const lesson = production.lessons.get(lessonId);
  if (!lesson) throw new Error(`Unresolvable production lesson: ${lessonId}`);
  const concept = production.concepts.get(lesson.concepts[0] ?? "");
  return {
    domainLabel: domainLabel(lesson.domain),
    conceptTitle: concept?.display_name ?? lesson.objective,
    whyItMatters: lesson.objective,
    context: lesson.context,
    pattern: resolvePattern(lesson.patterns),
    scenario: lesson.scenario,
    memoryRule: lesson.memory_rules[0] ?? ""
  };
}

export function resolveQuestion(question: ProductionQuestion): QuestionFixture {
  const options: AnswerOptionFixture[] = question.options.map((opt) => ({
    key: opt.key,
    text: opt.text,
    correct: opt.correct,
    rationale: opt.rationale
  }));
  return {
    id: question.id,
    domainLabel: domainLabel(question.domain),
    prompt: question.prompt,
    options
  };
}

export function questionMeta(question: ProductionQuestion, index: number, total: number): string {
  return `Question ${index} of ${total} · ${domainLabel(question.domain)}`;
}

/**
 * Mirrors app/src/data/fixtures.ts's buildFeedback: builds feedback from
 * whichever option was actually selected, not a fixed correct/incorrect
 * pair — so production feedback always names the real selected answer.
 * Also surfaces the triggered repair_target (if any) so the session layer
 * can select option-specific repair content, per the "repair should target
 * the reasoning failure" requirement — the Phase 5B fixture path has no
 * equivalent because it only ever demonstrated one fixed wrong answer.
 */
export function resolveFeedback(
  question: ProductionQuestion,
  selectedKey: AnswerOptionFixture["key"]
): FeedbackFixture & { repairTargetId?: string } {
  const selectedOption = question.options.find((o) => o.key === selectedKey);
  if (!selectedOption) throw new Error(`Unresolvable option key "${selectedKey}" on ${question.id}`);
  const correctOption = question.options.find((o) => o.correct);
  if (!correctOption) throw new Error(`Question ${question.id} has no correct option`);
  const correct = selectedOption.correct;

  return {
    question: resolveQuestion(question),
    selectedKey,
    correct,
    why: correctOption.rationale,
    whySelectedWasWeaker: correct ? undefined : selectedOption.rationale,
    pattern: resolvePattern(question.patterns),
    qualifier: resolveQualifier(question.qualifier),
    role: resolveRole(question.primary_role),
    lifecycle: [],
    memoryRule: question.memory_rule ?? correctOption.rationale,
    repairTargetId: correct ? undefined : selectedOption.repair_target
  };
}

export function requireProductionLesson(lessonId: string): ProductionLesson {
  const lesson = production.lessons.get(lessonId);
  if (!lesson) throw new Error(`Unresolvable production lesson: ${lessonId}`);
  return lesson;
}

export function requireProductionQuestion(questionId: string): ProductionQuestion {
  const question = production.questions.get(questionId);
  if (!question) throw new Error(`Unresolvable production question: ${questionId}`);
  return question;
}

/**
 * All active variants belonging to one family — the pool
 * selectFamilyVariant() chooses from. A family with no variants is a
 * content-authoring gap, not a runtime state to silently tolerate.
 */
export function familyVariantsFor(familyId: string): ProductionQuestion[] {
  return [...production.questions.values()].filter((q) => q.family === familyId && q.active);
}

/**
 * The exact-repeat policy (docs/data-model/REPETITION-AND-RECALL-MODEL.md)
 * applied to one family: unseen-preferred, least-recently-seen fallback,
 * deterministic tie-break. Pure selection logic lives in selection.ts;
 * this just supplies the candidate pool.
 */
export function selectFamilyVariant(familyId: string, history: ExposureHistory, now: number): ProductionQuestion {
  const candidates = familyVariantsFor(familyId);
  if (candidates.length === 0) {
    throw new Error(`No variants found for family ${familyId} — a family with zero variants is an authoring gap.`);
  }
  const chosenId = selectVariant(
    candidates.map((q) => q.id),
    history,
    now
  );
  return requireProductionQuestion(chosenId);
}

/**
 * Recall-eligibility, enforced structurally: the pool a session can draw
 * Recall material from is exactly the retrieval_refs of lessons reachable
 * through `prerequisites` — never the lesson being taught today, and
 * never anything not a prerequisite of it — expanded to each of those
 * questions' full QuestionFamily (Phase 6C) when one is set, so Recall can
 * rotate through variants rather than always showing the exact same
 * question. A retrieval_ref question with no family falls back to just
 * itself (Phase 6B-compatible behavior). See
 * docs/learning/CURRICULUM-BLUEPRINT.md's untaught-material rule and
 * docs/learning/DAILY-STUDY-MODEL.md's Recall section.
 */
export function recallPoolFor(todaysLessonId: string): ProductionQuestion[] {
  const todaysLesson = requireProductionLesson(todaysLessonId);
  const seenLessons = new Set<string>();
  const poolIds = new Set<string>();
  const pool: ProductionQuestion[] = [];

  function addQuestion(q: ProductionQuestion) {
    if (poolIds.has(q.id)) return;
    poolIds.add(q.id);
    pool.push(q);
  }

  function visit(lessonId: string) {
    if (seenLessons.has(lessonId)) return;
    seenLessons.add(lessonId);
    const lesson = production.lessons.get(lessonId);
    if (!lesson) return;
    for (const refId of lesson.retrieval_refs) {
      const q = production.questions.get(refId);
      if (!q) continue;
      if (q.family) {
        for (const variant of familyVariantsFor(q.family)) addQuestion(variant);
      } else {
        addQuestion(q);
      }
    }
    for (const prereqId of lesson.prerequisites) {
      if (production.lessons.has(prereqId)) visit(prereqId);
    }
  }

  for (const prereqId of todaysLesson.prerequisites) {
    if (production.lessons.has(prereqId)) visit(prereqId);
  }

  return pool;
}

/**
 * Stage 2 of the target -> family -> variant pipeline: which distinct
 * families are recall-eligible for today's lesson. Phase 6C's two-family
 * slice always resolves to exactly one (trivial "stage 1" target
 * selection) — the function is written generally so it stays correct once
 * more targets/families exist, per
 * docs/data-model/REPETITION-AND-RECALL-MODEL.md.
 */
export function recallFamilyIdsFor(todaysLessonId: string): string[] {
  const pool = recallPoolFor(todaysLessonId);
  const ids: string[] = [];
  for (const q of pool) {
    if (q.family && !ids.includes(q.family)) ids.push(q.family);
  }
  return ids;
}

/**
 * Today's lesson's own "anchor" family — the family (if any) its
 * retrieval_refs[0] question belongs to. Used to let the Apply step
 * rotate through the same family's variants across repeated sessions,
 * rather than always showing exactly the lesson's originally-paired
 * question. Returns undefined when the anchor question has no family
 * (Phase 6B-compatible fallback).
 */
export function anchorFamilyIdFor(lessonId: string): string | undefined {
  const lesson = requireProductionLesson(lessonId);
  const anchorId = lesson.retrieval_refs[0];
  if (!anchorId) return undefined;
  return production.questions.get(anchorId)?.family ?? undefined;
}
