/**
 * Exam Readiness v1 (ER-1) — pure data shapes only. No IndexedDB, no
 * timers, no UI: the session database, timer, and screens are ER-2/ER-3
 * scope. See docs/architecture (ER-1 spec) for the full rationale.
 */

export interface ExamBlueprintDomainWeight {
  domainId: string;
  weightPercent: number;
}

/**
 * A versioned, dated CISM exam content outline — distinct from
 * `schema/registry/domains.json`'s own `exam_weight` (this project's prior,
 * unversioned flat record of "the current outline"). A blueprint is
 * immutable once published; a new outline is a new blueprint entry, never
 * an edit to an existing one. `effectiveFrom`/`effectiveTo` are ISO
 * `YYYY-MM-DD` dates: `effectiveFrom` is inclusive, `effectiveTo` is
 * exclusive, and `null` means an open start/end.
 */
export interface ExamBlueprint {
  id: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  questionCount: number;
  durationMinutes: number;
  domainWeights: ExamBlueprintDomainWeight[];
}

export interface DomainQuestionAllocation {
  domainId: string;
  questionCount: number;
}

export interface ExamSufficiencyDomainStatus {
  domainId: string;
  required: number;
  available: number;
  shortfall: number;
  sufficient: boolean;
}

export interface ExamSufficiencyResult {
  blueprintId: string;
  sufficient: boolean;
  domains: ExamSufficiencyDomainStatus[];
}

export interface ExamQuestionSnapshotOption {
  key: "a" | "b" | "c" | "d";
  text: string;
  correct: boolean;
  rationale: string;
}

/**
 * A frozen copy of one production question's exam-relevant content at the
 * moment an exam question set was built — deliberately NOT just a question
 * id. Current production content keeps evolving after an exam is built;
 * this snapshot is a separate, immutable authority so a completed attempt's
 * historical record never silently changes meaning if the source question
 * is later edited, superseded, or removed.
 */
export interface ExamQuestionSnapshotEntry {
  questionId: string;
  domainId: string;
  family: string | null;
  /**
   * The question's concept identity/identities at build time — its own
   * independent copy, never a retained reference to the source
   * `ProductionQuestion.concepts` array, so a later mutation of that array
   * can never reach back into an already-built snapshot.
   */
  concepts: string[];
  prompt: string;
  options: ExamQuestionSnapshotOption[];
  explanation: string;
  contentVersion: number;
}

export interface ExamQuestionSnapshot {
  blueprintId: string;
  builtAt: number;
  contentFingerprint: string;
  questions: ExamQuestionSnapshotEntry[];
}
