// Optional Phase 1 addition (approved): dead/unreferenced data files.
// Tracked as BUG-003 in docs/regressions/REGISTRY.md — deliberately left as
// a todo test. Do not delete files to satisfy this test; deletion is a
// separate, explicitly-approved action, not an automatic consequence of
// this check going red.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../helpers/load-app-globals.mjs";

function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

function readAllAppSourceText() {
  const relFiles = ["index.html"];
  for (const dir of ["js", "tools"]) {
    const full = path.join(ROOT, dir);
    if (fs.existsSync(full)) {
      relFiles.push(...listFiles(full).map(f => path.relative(ROOT, f)));
    }
  }
  return relFiles.map(rel => fs.readFileSync(path.join(ROOT, rel), "utf8")).join("\n");
}

test(
  "every file under data/ is referenced (by path string) from index.html or app source",
  { todo: "BUG-003 — see docs/regressions/REGISTRY.md" },
  () => {
    const allSource = readAllAppSourceText();
    const dataFiles = listFiles(path.join(ROOT, "data"))
      // data/local/ is gitignored and optional by design (see docs/LOCAL-QUESTION-SET.md);
      // its liveness is asserted structurally elsewhere, not by this dead-file scan.
      .filter(f => !f.includes(`${path.sep}local${path.sep}`))
      .map(f => path.relative(ROOT, f).split(path.sep).join("/"));

    const unreferenced = dataFiles.filter(rel => !allSource.includes(rel));
    assert.equal(unreferenced.length, 0, `data files not referenced anywhere in app source: ${unreferenced.join(", ")}`);
  }
);
