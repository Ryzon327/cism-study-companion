/**
 * LI-2 §5/§32: only genuine production learner evidence, on a schema
 * version this engine actually understands, may influence insights.
 * Prototype/QA-fixture events are routine and expected to be excluded —
 * that is not a diagnostic-worthy condition. A truly unrecognized
 * `sourceContext` (data the type system should prevent, but a defensive
 * runtime check catches anyway) or an unsupported `eventSchemaVersion` IS
 * diagnostic-worthy: excluded from classification, never guessed at.
 *
 * Pure: never mutates `events` or any event in it.
 */
import { EVENT_SCHEMA_VERSION, type LearningEvent } from "../learning-history";
import type { Diagnostic } from "./types";

const KNOWN_SOURCE_CONTEXTS = new Set(["production", "prototype"]);

export interface EligibilityResult {
  eligible: LearningEvent[];
  diagnostics: Diagnostic[];
}

export function filterEligibleEvents(events: readonly LearningEvent[]): EligibilityResult {
  const eligible: LearningEvent[] = [];
  const diagnostics: Diagnostic[] = [];

  for (const event of events) {
    if (event.eventSchemaVersion !== EVENT_SCHEMA_VERSION) {
      diagnostics.push({
        kind: "UNSUPPORTED_SCHEMA_VERSION",
        eventId: event.eventId,
        detail: `eventSchemaVersion ${String(event.eventSchemaVersion)} is not supported by insightEngineVersion 1`
      });
      continue;
    }
    if (!KNOWN_SOURCE_CONTEXTS.has(event.sourceContext)) {
      diagnostics.push({
        kind: "MALFORMED_EVENT",
        eventId: event.eventId,
        detail: `unrecognized sourceContext "${String(event.sourceContext)}"`
      });
      continue;
    }
    if (event.sourceContext !== "production") continue; // routine QA exclusion — not a diagnostic
    eligible.push(event);
  }

  return { eligible, diagnostics };
}
