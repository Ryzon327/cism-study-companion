// Shared by playwright.config.ts and playwright.visual.config.ts (Phase
// 10B-1 port-collision fix). Automated browser tests run the dev server on
// this DEDICATED TEST PORT — never the normal developer port (5173) — so
// that a developer's own `npm run dev`, or an unrelated project's dev
// server already running on 5173, can never be mistaken for this app
// during CI/local browser testing. See global-setup.ts for the identity
// check that backs this up.
export const TEST_PORT = 5183;
export const TEST_BASE_URL = `http://localhost:${TEST_PORT}`;

// The exact <title> app/index.html renders. The one deterministic,
// already-existing marker used to confirm the server answering on
// TEST_PORT is actually this app, not some other application that happens
// to be listening on the same port.
export const EXPECTED_APP_TITLE = "CISM Study Companion — Visual Prototype";
