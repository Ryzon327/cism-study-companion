// Shared by playwright.config.ts and playwright.visual.config.ts (Phase
// 10B-1 port-collision fix). Automated browser tests run the dev server on
// this DEDICATED TEST PORT — never the normal developer port (5173) — so
// that a developer's own `npm run dev`, or an unrelated project's dev
// server already running on 5173, can never be mistaken for this app
// during CI/local browser testing. See global-setup.ts for the identity
// check that backs this up.
export const TEST_PORT = 5183;
export const TEST_BASE_URL = `http://localhost:${TEST_PORT}`;

// Product-environment follow-up (docs/architecture/PRODUCT-ENVIRONMENT-FOLLOW-UP.md):
// the existing e2e/visual suites above all reach QA-only tooling (the
// Prototype/Production content-source switcher, the visual prototype gate
// states) directly via page.goto("/") — so their shared webServer must now
// explicitly opt into QA fixtures (see playwright.config.ts/
// playwright.visual.config.ts), rather than relying on that being the
// silent default. These two additional dedicated ports/servers exist
// specifically to prove the OPPOSITE — that ordinary startup and a real
// production build both default to production content with no QA tooling
// rendered at all.
export const PRODUCTION_DEFAULT_TEST_PORT = 5184;
export const PRODUCTION_DEFAULT_TEST_BASE_URL = `http://localhost:${PRODUCTION_DEFAULT_TEST_PORT}`;

export const PRODUCTION_BUILD_TEST_PORT = 5185;
export const PRODUCTION_BUILD_TEST_BASE_URL = `http://localhost:${PRODUCTION_BUILD_TEST_PORT}`;

// The exact <title> app/index.html renders. The one deterministic,
// already-existing marker used to confirm the server answering on a given
// test port is actually this app, not some other application that happens
// to be listening on the same port. Identical across QA/ordinary/build
// variants — the title is static markup, unrelated to QA mode.
export const EXPECTED_APP_TITLE = "CISM Study Companion — Visual Prototype";
