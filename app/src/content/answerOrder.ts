/**
 * Separates SEMANTIC option identity (an authored option's `key` — stable
 * forever, per docs/data-model/ID-CONVENTIONS.md's "never re-derive a
 * stable identifier" principle) from DISPLAY POSITION (which on-screen
 * slot, A/B/C/D, an option occupies for one specific exposure).
 *
 * Pure and fully deterministic — no Math.random(), no I/O, no wall-clock
 * dependency. Given the same (questionId, exposureCount) inputs this
 * always returns the same order, so it is reproducible in tests and safe
 * to call from anywhere without coordination. Callers are responsible for
 * computing the order ONCE per exposure, at selection time, and carrying
 * the already-ordered result forward for the rest of that attempt — the
 * same pattern Phase 6C already established for variant selection (see
 * productionContentSource.ts) — so re-renders, StrictMode, or effect
 * re-runs can never change an in-progress attempt's answer order.
 *
 * `exposureCount` is the number of times this exact question was already
 * shown BEFORE the current exposure (0 for the first time) — the same
 * per-question counter exposureStore.ts already tracks for variant
 * rotation, reused here for an unrelated purpose (answer-position
 * variation, not variant selection). Question rotation and answer-order
 * rotation remain fully independent concerns: this module never looks at
 * families or variants, and selection.ts never looks at option order.
 */

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(hash, 31) + input.charCodeAt(i)) >>> 0;
  }
  return hash >>> 0;
}

/** Deterministic seeded PRNG (mulberry32) — not Math.random(). Same seed always produces the same output sequence. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/** Decode a permutation index (0 .. n!-1) into an order over 0..n-1, via the standard factorial-number-system (Lehmer code). Pure. */
function permutationFromIndex(n: number, index: number): number[] {
  const available = Array.from({ length: n }, (_, i) => i);
  const order: number[] = [];
  let remaining = index;
  for (let i = n; i > 0; i--) {
    const f = factorial(i - 1);
    const pick = Math.floor(remaining / f);
    remaining -= pick * f;
    order.push(available.splice(pick, 1)[0] as number);
  }
  return order;
}

/** Deterministic Fisher-Yates shuffle seeded by an integer — pure, reproducible. */
function deterministicShuffle(items: number[], seed: number): number[] {
  const rng = mulberry32(seed);
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = result[i] as number;
    result[i] = result[j] as number;
    result[j] = tmp;
  }
  return result;
}

/**
 * The full N! permutations of a question's options, in a deterministic,
 * question-specific shuffled sequence. Indexing into this list by
 * `exposureCount % N!` guarantees every possible ordering is used before
 * any repeats (mirroring selection.ts's unseen-before-repeat philosophy),
 * and — because the sequence itself is shuffled, not raw index order —
 * consecutive exposures do not follow one fixed, learnable increment.
 */
function permutationSequenceFor(questionId: string, optionCount: number): number[] {
  const total = factorial(optionCount);
  const identityIndices = Array.from({ length: total }, (_, i) => i);
  return deterministicShuffle(identityIndices, hashString(questionId));
}

/**
 * Returns `options` reordered for display, for one specific exposure of
 * one specific question. Semantic fields on each option (`key`, `correct`,
 * `rationale`, `repair_target`) are untouched — only array position moves.
 */
export function orderOptionsForDisplay<T extends { key: string }>(
  options: readonly T[],
  questionId: string,
  exposureCount: number
): T[] {
  const n = options.length;
  if (n <= 1) return options.slice();
  const sequence = permutationSequenceFor(questionId, n);
  const chosenPermutationIndex = sequence[((exposureCount % sequence.length) + sequence.length) % sequence.length] as number;
  const order = permutationFromIndex(n, chosenPermutationIndex);
  return order.map((i) => options[i] as T);
}

/** The 0-indexed display position of the option with the given semantic key, within an already-ordered options array. Throws if not found — an option must always resolve, or something upstream is broken. */
export function displayPositionOf<T extends { key: string }>(orderedOptions: readonly T[], key: string): number {
  const index = orderedOptions.findIndex((o) => o.key === key);
  if (index === -1) throw new Error(`Option key "${key}" not found in ordered options`);
  return index;
}

/** The A/B/C/D letter for a 0-indexed display position. */
export function displayLetterForPosition(position: number): string {
  return String.fromCharCode(65 + position);
}
