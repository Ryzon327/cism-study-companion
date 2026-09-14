export * from "./types";
export { examBlueprints } from "./blueprintRegistry";
export { validateExamBlueprint, assertValidExamBlueprint, validateExamBlueprintRegistry, type BlueprintValidationIssue } from "./blueprintValidation";
export { resolveCurrentBlueprint } from "./resolveCurrentBlueprint";
export { allocateBlueprintCounts } from "./apportionment";
export { checkExamSufficiency } from "./sufficiency";
export { interleaveDomainSelections, type DomainSelection } from "./interleaveDomainSelections";
export { buildExamQuestionSet, type BuildExamQuestionSetOptions, type ExamQuestionSetResult } from "./questionSetBuilder";
export { buildExamQuestionSnapshot, computeContentFingerprint } from "./snapshot";
