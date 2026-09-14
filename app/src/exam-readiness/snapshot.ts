import { production, type ProductionQuestion } from "../content/registry";
import { buildExamQuestionSet, type BuildExamQuestionSetOptions } from "./questionSetBuilder";
import type { ExamBlueprint, ExamQuestionSnapshot, ExamQuestionSnapshotEntry } from "./types";

function freezeQuestion(raw: ProductionQuestion): ExamQuestionSnapshotEntry {
  return {
    questionId: raw.id,
    domainId: raw.domain,
    family: raw.family ?? null,
    // An independent copy, never the source array itself — mutating
    // production.questions' own `concepts` array after this point must
    // never reach back into an already-built snapshot. Order is preserved
    // as authored (this is the faithful frozen record); fingerprint
    // canonicalization treats concept membership as set-like and
    // deliberately ignores order — see `canonicalize` below.
    concepts: [...raw.concepts],
    prompt: raw.prompt,
    options: raw.options.map((option) => ({ key: option.key, text: option.text, correct: option.correct, rationale: option.rationale })),
    explanation: raw.explanation,
    contentVersion: raw.version
  };
}

/**
 * Dependency-free, non-cryptographic 32-bit FNV-1a hash over UTF-16 code
 * units. Only used to detect accidental drift between two snapshots that
 * are supposed to represent "the same" frozen question set — never a
 * security or content-integrity signature.
 */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Canonical, sort-order-independent serialization of frozen questions —
 * sorted by `questionId` so the fingerprint depends only on *which*
 * content was frozen (and its exact field values), never on selection
 * order or object-key insertion order.
 *
 * `concepts` is itself canonicalized (sorted, deduplicated) before
 * hashing: concept identity is a set-like curriculum relationship, so a
 * mere reordering of an otherwise-unchanged concepts array must never
 * change a snapshot's fingerprint — only an actual membership change
 * (a concept added, removed, or replaced) should. The STORED
 * `entry.concepts` itself is left in its original, as-authored order;
 * only this fingerprint input is canonicalized.
 */
function canonicalize(entries: readonly ExamQuestionSnapshotEntry[]): string {
  const sorted = [...entries].sort((a, b) => a.questionId.localeCompare(b.questionId));
  return JSON.stringify(
    sorted.map((entry) => ({
      questionId: entry.questionId,
      domainId: entry.domainId,
      family: entry.family,
      concepts: [...new Set(entry.concepts)].sort(),
      prompt: entry.prompt,
      options: entry.options.map((option) => ({ key: option.key, text: option.text, correct: option.correct, rationale: option.rationale })),
      explanation: entry.explanation,
      contentVersion: entry.contentVersion
    }))
  );
}

export function computeContentFingerprint(entries: readonly ExamQuestionSnapshotEntry[]): string {
  return fnv1a(canonicalize(entries));
}

/**
 * Builds a frozen exam question snapshot for `blueprint`: draws a question
 * set (`buildExamQuestionSet`), then freezes each selected question's
 * exam-relevant content — not just its id — into an immutable
 * `ExamQuestionSnapshot`, explicitly separate from "current production
 * content" as an authority. A later edit to the source question in
 * `content/production/questions.json` never changes an already-built
 * snapshot's meaning.
 */
export function buildExamQuestionSnapshot(blueprint: ExamBlueprint, options: BuildExamQuestionSetOptions = {}): ExamQuestionSnapshot {
  const built = buildExamQuestionSet(blueprint, options);
  const questions = built.questionIds.map((id) => {
    const raw = production.questions.get(id);
    if (!raw) {
      throw new Error(`buildExamQuestionSnapshot: selected question ${id} is not in the production registry`);
    }
    return freezeQuestion(raw);
  });

  return {
    blueprintId: blueprint.id,
    builtAt: options.now ?? Date.now(),
    contentFingerprint: computeContentFingerprint(questions),
    questions
  };
}
