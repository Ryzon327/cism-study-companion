/**
 * Raw data access for the exam blueprint registry — mirrors
 * content/registry.ts's own load-the-JSON-once pattern, kept as its own
 * module (rather than added to that file) because exam blueprints are a
 * distinct authority from the curriculum registries: see
 * schema/registry/exam-blueprints.json and types.ts.
 *
 * Validated at load time (not just in tests): a malformed registry entry
 * (weights not summing to 100, an overlapping/gapped effective date range,
 * etc.) would otherwise let `allocateBlueprintCounts` silently under- or
 * over-allocate, or `resolveCurrentBlueprint` silently mis-resolve, rather
 * than failing closed the way both of those functions are designed to.
 * Throwing here means any such defect surfaces immediately as an import-
 * time error, in every context that loads this module (app, tests, build),
 * not only when a test happens to call `validateExamBlueprintRegistry`
 * directly.
 */
import blueprintsJson from "../../../schema/registry/exam-blueprints.json";
import { validateExamBlueprintRegistry } from "./blueprintValidation";
import type { ExamBlueprint } from "./types";

export const examBlueprints: readonly ExamBlueprint[] = blueprintsJson as ExamBlueprint[];

const issues = validateExamBlueprintRegistry(examBlueprints);
if (issues.length > 0) {
  const detail = issues.map((issue) => `${issue.blueprintId}: ${issue.message}`).join("; ");
  throw new Error(`exam-blueprints.json failed validation at load time: ${detail}`);
}
