// Requirement 10: basic syntax/static validation.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT } from "../helpers/load-app-globals.mjs";

function listFiles(dir, exts) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, exts));
    else if (exts.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

// data/local/ is gitignored, learner-owned content that is absent by
// default and never part of the shipped, reviewed codebase.
function isLocalContent(file) {
  return file.includes(`${path.sep}data${path.sep}local${path.sep}`);
}

test("every tracked .js/.mjs file under data/, js/, and tools/ parses without a syntax error", () => {
  const dirs = ["data", "js", "tools"]
    .map(d => path.join(ROOT, d))
    .filter(d => fs.existsSync(d));
  const files = dirs
    .flatMap(d => listFiles(d, [".js", ".mjs"]))
    .filter(f => !isLocalContent(f));

  assert.ok(files.length > 0, "expected to find at least one JS file to check");

  for (const file of files) {
    assert.doesNotThrow(
      () => execFileSync(process.execPath, ["--check", file], { stdio: "pipe" }),
      `${path.relative(ROOT, file)} should be syntactically valid`
    );
  }
});

test("every tracked .json file under data/ parses as valid JSON", () => {
  const files = listFiles(path.join(ROOT, "data"), [".json"]).filter(f => !isLocalContent(f));
  assert.ok(files.length > 0, "expected to find at least one JSON file to check");

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    assert.doesNotThrow(() => JSON.parse(raw), `${path.relative(ROOT, file)} should be valid JSON`);
  }
});
