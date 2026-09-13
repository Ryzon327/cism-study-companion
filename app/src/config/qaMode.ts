/**
 * Explicit, compile-time opt-in for QA/prototype tooling — never a
 * default. Ordinary `npm run dev` and every production build must default
 * to real production content with no QA controls rendered at all;
 * `VITE_ENABLE_QA_FIXTURES` is the one deliberate escape hatch, for
 * automated tests and intentional developer review. See
 * docs/architecture/PRODUCT-ENVIRONMENT-FOLLOW-UP.md.
 *
 * A function, not a frozen module-level constant: Vite/Vitest env vars are
 * always strings (never real booleans, even when the shell sets `=true`),
 * and reading `import.meta.env` inside a function call — rather than once
 * at module-evaluation time — is what lets `vi.stubEnv()` change the
 * result within a test file, since a value computed once at import time
 * would never see a later stub.
 */
export function qaFixturesEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_QA_FIXTURES === "true";
}
