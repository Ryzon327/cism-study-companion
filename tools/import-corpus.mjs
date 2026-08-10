#!/usr/bin/env node
/*
 * import-corpus.mjs — LOCAL ONLY. Never commit its output.
 *
 * STATUS: INCOMPLETE. Against a 1,123-question source set this currently
 * recovers about 5%. The option-list layout varies across exports and not every
 * variant is handled yet. Run it if you like — anything it does produce is
 * structurally valid and safe to use — but do not assume full coverage.
 *
 * Converts question text files you already own into data/local/question-set.js,
 * which the app loads if present. data/local/ is gitignored, so nothing from a
 * commercial question set enters the repository.
 *
 * Usage:
 *   1. Extract text from your PDFs (one .txt per domain):
 *        brew install poppler
 *        pdftotext -layout "Domain 1.pdf" tools/input/domain-1.txt
 *        ...repeat for domains 2, 3, 4
 *   2. node tools/import-corpus.mjs
 *
 * Filenames must contain the domain number (domain-1, d2, "Domain 3", etc).
 */

import fs from "node:fs";
import path from "node:path";

const INPUT = path.resolve("tools/input");
const OUT_DIR = path.resolve("data/local");
const OUT_FILE = path.join(OUT_DIR, "question-set.js");

const ANSWER_RE = /^\s*([A-D])\s+is the correct answer\./m;
const OPTION_RE = /^\s*([A-H])[.\u200b]*\s+(.+)$/;

const QUALIFIERS = ["MOST IMPORTANT","MOST EFFECTIVE","MOST APPROPRIATE","MOST LIKELY",
  "MOST SIGNIFICANT","MOST CRITICAL","MOST USEFUL","GREATEST","PRIMARILY","PRIMARY",
  "INITIAL","FIRST","NEXT","BEST","MOST","MAIN","MAJOR","LEAST"];
const CHIPS = new Set(["FIRST","NEXT","BEST","MOST","PRIMARY","PRIMARILY","GREATEST","MAIN","NONE"]);

const ROLE_RULES = [
  [/board of directors|the board\b/i,                    "Senior management"],
  [/senior management|executive management|steering committee/i, "Senior management"],
  [/\b(business|data|information|system|asset) owner/i,  "Business/data owner"],
  [/internal audit|the auditor\b/i,                      "Internal audit"],
  [/incident response team|incident (handler|manager)/i, "Incident response team"],
  [/custodian|system administrator|\bIT (department|staff|operations)/i, "Custodian/operations"],
  [/information security manager|security manager/i,     "Security manager"],
];

const LIFECYCLE_RULES = [
  [/incident|breach|malware|intrusion|compromise|attack/i, "Incident response"],
  [/continuity|disaster|recovery|\bRTO\b|\bRPO\b|alternate site|restor/i, "Continuity/recovery"],
  [/post-?incident|lessons learned|root cause|forensic/i, "Post-incident/improvement"],
  [/risk (assessment|analysis)|threat|vulnerabilit|likelihood|impact analysis/i, "Risk assessment/evaluation"],
  [/residual risk|risk (acceptance|treatment|transfer|mitigat)|insurance/i, "Risk treatment/acceptance"],
  [/governance|strategy|steering|board|charter|align/i,  "Governance"],
];

const DECISION_RULES = [
  [/incident|containment|eradicat/i,          "Incident decision"],
  [/continuity|recovery|restor|\bRTO\b|\bRPO\b, ?/i, "Recovery decision"],
  [/risk|exposure|residual|threat/i,          "Risk decision"],
  [/governance|strateg|business objective|board|senior management/i, "Business decision"],
];

function firstMatch(rules, text, fallback) {
  for (const [re, value] of rules) if (re.test(text)) return value;
  return fallback;
}

function detectQualifier(stem) {
  for (const q of QUALIFIERS) {
    if (new RegExp(`\\b${q}\\b`).test(stem)) {
      // collapse variants onto the chips the decoder actually offers
      if (q.startsWith("MOST") && q !== "MOST") return "MOST";
      if (q === "MAJOR") return "MAIN";
      if (q === "INITIAL") return "FIRST";
      if (q === "LEAST") return "MOST";
      return CHIPS.has(q) ? q : "NONE";
    }
  }
  return "NONE";
}

function domainFromName(name) {
  const m = name.match(/(?:domain[^0-9]{0,3}|[_\-\s]d)([1-4])/i) || name.match(/([1-4])/);
  return m ? m[1] : null;
}

function parseFile(text, domain) {
  const out = [];
  const chunks = text.split(/(?=^\s*[A-D]\s+is the correct answer\.)/m);
  let carry = "";
  for (const chunk of chunks) {
    const am = chunk.match(ANSWER_RE);
    if (!am) { carry = chunk; continue; }
    const answerLetter = am[1];
    const before = carry;
    carry = chunk.slice(chunk.indexOf(am[0]) + am[0].length);

    const lines = before.split("\n").map(l => l.replace(/\u200b/g, "").trimEnd());
    // Option lines look like "A. <text>". Some exports render the list as eight
    // entries where every other one is just a bare "A." / "B." label and the
    // real option text sits in the entry after it. Collect runs, strip bare
    // labels, and keep the last run that yields exactly four real options.
    const runs = [];
    let current = [];
    const stemParts = [];
    let buf = [];
    const flushRun = () => { if (current.length) { runs.push(current); current = []; } };
    const flushBuf = () => { if (buf.length) { stemParts.push(buf.join(" ")); buf = []; } };

    for (const line of lines) {
      const s = line.trim();
      const om = OPTION_RE.exec(s);
      if (om) {
        flushBuf();
        if (om[1] === "A") flushRun();
        current.push({ text: om[2].trim(), at: stemParts.length });
        continue;
      }
      if (!s) { flushBuf(); continue; }
      if (/^(Review Category|Page \d|CISM Review|Copyright|ISACA|Justification)/i.test(s)) {
        flushRun(); flushBuf(); continue;
      }
      buf.push(s);
    }
    flushRun(); flushBuf();

    const cleaned = runs
      .map(run => run.filter(o => !/^[A-H]\.?$/.test(o.text)))
      .filter(run => run.length === 4);
    const four = cleaned.pop() || [];

    const cutoff = four.length ? four[0].at : stemParts.length;
    const candidates = stemParts.slice(0, cutoff);
    const stem = [...candidates].reverse().find(x => x.length > 25 && (/\?/.test(x) || x.endsWith(":")))
              || candidates[candidates.length - 1];
    const correctIndex = "ABCD".indexOf(answerLetter);
    if (!stem || four.length < 4 || correctIndex < 0) continue;

    const blob = stem + " " + four.map(o => o.text).join(" ");
    out.push({
      id: `LOCAL-D${domain}-${String(out.length + 1).padStart(4, "0")}`,
      familyId: `LOCAL-D${domain}-${String(out.length + 1).padStart(4, "0")}`,
      domain: Number(domain),
      concept: `Domain ${domain} applied reasoning`,
      qualifier: detectQualifier(stem),
      role: firstMatch(ROLE_RULES, stem, "None/implicit"),
      lifecycle: firstMatch(LIFECYCLE_RULES, blob, "Security program"),
      decision: firstMatch(DECISION_RULES, blob, "Program/control decision"),
      stem,
      options: four.map(o => o.text),
      correctIndex,
      rationale: "Review the reasoning in your own source material for this question.",
      memory: "Name the qualifier, the role, and the lifecycle stage before eliminating answers.",
      pattern: "Local question set",
    });
  }
  return out;
}

// ---- run ----
if (!fs.existsSync(INPUT)) {
  console.error(`No input directory. Create ${INPUT} and put your extracted .txt files there.`);
  process.exit(1);
}
const files = fs.readdirSync(INPUT).filter(f => f.endsWith(".txt"));
if (!files.length) { console.error(`No .txt files in ${INPUT}.`); process.exit(1); }

let all = [];
for (const f of files) {
  const domain = domainFromName(f);
  if (!domain) { console.warn(`  skipped ${f} — no domain number in the filename`); continue; }
  const got = parseFile(fs.readFileSync(path.join(INPUT, f), "utf8"), domain);
  console.log(`  ${f} -> domain ${domain}: ${got.length} questions`);
  all = all.concat(got);
}

if (!all.length) { console.error("Nothing parsed. Check that the text was extracted with -layout."); process.exit(1); }

const byDomain = all.reduce((a, q) => (a[q.domain] = (a[q.domain] || 0) + 1, a), {});
const byQualifier = all.reduce((a, q) => (a[q.qualifier] = (a[q.qualifier] || 0) + 1, a), {});

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE,
`/* GENERATED BY tools/import-corpus.mjs — LOCAL ONLY, DO NOT COMMIT.
   Derived from question material you supplied. ${all.length} questions. */
window.CISMLocalQuestionSet = ${JSON.stringify({ questions: all }, null, 1)};
`);

console.log(`\nWrote ${all.length} questions to data/local/question-set.js`);
console.log("  by domain:   ", JSON.stringify(byDomain));
console.log("  by qualifier:", JSON.stringify(byQualifier));
console.log("\ndata/local/ is gitignored. Verify with: git status --short");
