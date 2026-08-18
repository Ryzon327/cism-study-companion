// Loads the app's data-layer files into a sandboxed `window`, in the same
// order index.html loads them, so data-integrity tests can inspect the real
// window.CISM* objects without a browser or DOM.
//
// Intentionally excludes: js/storage.js and the js/*.js engines (they touch
// document.getElementById(...) at module-load time and require a real or
// stubbed DOM), and data/local/question-set.js (gitignored, learner-local,
// absent by default). This loader is scoped to data-layer integrity checks
// only. A DOM-capable harness for the engines belongs to a later phase.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..", "..");

// Mirrors the <script> order in index.html for the data files only.
const DATA_FILES = [
  "data/content.js",
  "data/active-learning.js",
  "data/mixed-practice.js",
  "data/pattern-bank.js",
  "data/exam-bank.js",
  "data/daily-coach.js"
];

export function loadAppGlobals() {
  const window = {};
  const sandbox = { window, console };
  vm.createContext(sandbox);
  for (const relPath of DATA_FILES) {
    const code = fs.readFileSync(path.join(ROOT, relPath), "utf8");
    vm.runInContext(code, sandbox, { filename: relPath });
  }
  return window;
}
