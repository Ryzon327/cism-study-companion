// Invariants 13, 14, 15, 33, 34 — the machine-testable production content
// boundary: content/production/ never references schema/example/ (test-
// only) or tests/fixtures/, and the production loader/resolver
// (app/src/content/) never imports schema/example/ or the Phase 5B
// prototype fixtures (app/src/data/fixtures.ts). See
// docs/data-model/README.md and schema/example/README.md for why that
// separation exists.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadAll, loadSchemaExampleIds, ROOT } from "./helpers/load-production.mjs";

const data = loadAll();

test("invariant 13: no production entity references a schema/example/ id anywhere", () => {
  const exampleIds = loadSchemaExampleIds();
  const bad = [];
  const productionJson = JSON.stringify({ concepts: data.concepts, lessons: data.lessons, questions: data.questions });
  for (const id of exampleIds) {
    // A cheap but effective check: a schema/example id string should never
    // appear anywhere inside the serialized production content at all.
    if (productionJson.includes(`"${id}"`)) bad.push(id);
  }
  assert.equal(bad.length, 0, `production content references schema/example ids: ${bad.join(", ")}`);
});

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function listFilesRecursive(dir) {
  const out = [];
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursive(rel));
    else out.push(rel);
  }
  return out;
}

// Matches only real `import ... from "..."` / `import "..."` statements —
// deliberately not a bare substring check, since this file's own docstrings
// correctly *mention* schema/example and data/fixtures in prose explaining
// why they must never be imported, and a naive substring match would flag
// that explanatory comment as if it were the violation it's warning against.
function importsMatching(source, pathFragment) {
  const importStatementPattern = /^\s*import\s+(?:[^;]*?\sfrom\s+)?["']([^"']+)["']/gm;
  const matches = [];
  let m;
  while ((m = importStatementPattern.exec(source))) {
    if (m[1].includes(pathFragment)) matches.push(m[1]);
  }
  return matches;
}

test("invariant 14: the production content loader (app/src/content/) never imports schema/example/", () => {
  const files = listFilesRecursive("app/src/content").filter((f) => /\.(ts|tsx)$/.test(f));
  const bad = files.filter((f) => importsMatching(readFile(f), "schema/example").length > 0);
  assert.equal(bad.length, 0, `these production-loader files import schema/example/: ${bad.join(", ")}`);
});

test("invariant 15: the production content loader (app/src/content/) never imports the Phase 5B prototype fixtures", () => {
  const files = listFilesRecursive("app/src/content").filter((f) => /\.(ts|tsx)$/.test(f));
  const bad = files.filter((f) => importsMatching(readFile(f), "data/fixtures").length > 0);
  assert.equal(bad.length, 0, `these production-loader files import app/src/data/fixtures: ${bad.join(", ")}`);
});

test("invariant 33: no tests/fixtures/ content appears inside content/production/", () => {
  const fixtureDir = "tests/fixtures/data-model";
  const fixtureIds = new Set();
  for (const file of fs.readdirSync(path.join(ROOT, fixtureDir))) {
    const entities = JSON.parse(fs.readFileSync(path.join(ROOT, fixtureDir, file), "utf8"));
    for (const e of entities) fixtureIds.add(e.id);
  }
  const productionJson = JSON.stringify({ concepts: data.concepts, lessons: data.lessons, questions: data.questions });
  const bad = [...fixtureIds].filter((id) => productionJson.includes(`"${id}"`));
  assert.equal(bad.length, 0, `test-fixture ids leaked into production content: ${bad.join(", ")}`);
});

test("invariant 34: content/production/ files contain no literal text copied from app/src/data/fixtures.ts's prototype content", () => {
  const fixturesSource = readFile("app/src/data/fixtures.ts");
  // A small set of exact strings unique to the Phase 5B Domain 2 prototype
  // fixtures — if any of these ever appear in production JSON, it is a
  // sign content was copy-pasted from the prototype rather than authored
  // against the approved Foundation/Domain 1 slice.
  const prototypeMarkers = ["Residual risk and treatment decisions", "acceptable residual risk, not zero risk"];
  const productionJson = JSON.stringify(data.concepts) + JSON.stringify(data.lessons) + JSON.stringify(data.questions);
  const leaked = prototypeMarkers.filter((m) => fixturesSource.includes(m) && productionJson.includes(m));
  assert.equal(leaked.length, 0, `prototype fixture text leaked into production content: ${leaked.join(", ")}`);
});
