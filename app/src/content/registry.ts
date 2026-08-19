/**
 * Raw data access for the production content pipeline.
 *
 * Loads schema/registry/ (canonical vocabulary — domains, roles,
 * qualifiers, patterns, decision types, evidence dimensions, repair
 * targets) and content/production/ (the real, human-approved-eventually
 * curriculum surface: concepts, lessons, questions).
 *
 * Deliberately does NOT import anything from schema/example/ — that
 * directory is test/schema-demonstration fixtures only, per
 * schema/example/README.md, and must never reach the shipping app. See
 * tests/content-production/separation.test.mjs, which statically checks
 * this file (and this directory) for exactly that.
 */
import domains from "../../../schema/registry/domains.json";
import roles from "../../../schema/registry/roles.json";
import qualifiers from "../../../schema/registry/qualifiers.json";
import decisionTypes from "../../../schema/registry/decision-types.json";
import evidenceDimensions from "../../../schema/registry/evidence-dimensions.json";
import repairTargets from "../../../schema/registry/repair-targets.json";
import patterns from "../../../schema/registry/patterns.json";

import productionConcepts from "../../../content/production/concepts.json";
import productionLessons from "../../../content/production/lessons.json";
import productionQuestions from "../../../content/production/questions.json";

export interface RegistryEntity {
  id: string;
  display_name: string;
  [key: string]: unknown;
}

export interface ProductionOption {
  key: "a" | "b" | "c" | "d";
  text: string;
  correct: boolean;
  rationale: string;
  repair_target?: string;
}

export interface ProductionQuestion {
  id: string;
  domain: string;
  concepts: string[];
  patterns: string[];
  qualifier: string | null;
  roles_mentioned: string[];
  primary_role: string | null;
  lifecycle: string | null;
  stage: string | null;
  decision_type: string | null;
  prompt: string;
  options: ProductionOption[];
  explanation: string;
  recognition_clue?: string;
  memory_rule?: string;
  evidence_dimensions: string[];
  content_status: string;
  verification_status: string;
  active: boolean;
  version: number;
  source: string;
  note?: string;
}

export interface ProductionLesson {
  id: string;
  domain: string;
  concepts: string[];
  patterns: string[];
  prerequisites: string[];
  objective: string;
  context: string;
  cism_perspective: string;
  recognition_clues: string[];
  scenario: string;
  traps: string[];
  memory_rules: string[];
  retrieval_refs: string[];
  content_status: string;
  verification_status: string;
  active: boolean;
  version: number;
  source: string;
  note?: string;
}

export interface ProductionConcept {
  id: string;
  display_name: string;
  home_domain: string;
  plain: string;
  related_patterns: string[];
  content_status: string;
  verification_status: string;
  source: string;
  version: number;
  note?: string;
}

function byId<T extends { id: string }>(list: T[]): Map<string, T> {
  return new Map(list.map((entity) => [entity.id, entity]));
}

export const registry = {
  domains: byId(domains as RegistryEntity[]),
  roles: byId(roles as RegistryEntity[]),
  qualifiers: byId(qualifiers as RegistryEntity[]),
  decisionTypes: byId(decisionTypes as RegistryEntity[]),
  evidenceDimensions: byId(evidenceDimensions as RegistryEntity[]),
  repairTargets: byId(repairTargets as RegistryEntity[]),
  patterns: byId(patterns as RegistryEntity[])
};

export const production = {
  concepts: byId(productionConcepts as ProductionConcept[]),
  lessons: byId(productionLessons as ProductionLesson[]),
  questions: byId(productionQuestions as ProductionQuestion[])
};

export function requireDisplayName(map: Map<string, RegistryEntity>, id: string): string {
  const entity = map.get(id);
  if (!entity) throw new Error(`Unresolvable registry reference: ${id}`);
  return entity.display_name;
}
