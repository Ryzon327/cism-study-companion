import { TEST_BASE_URL, EXPECTED_APP_TITLE } from "./test-server";

// Phase 10B-1 port-collision fix: `webServer.url` only confirms SOMETHING
// answered on the test port, not that it's THIS app — the exact gap that
// let an unrelated project's dev server on 5173 silently swallow a full
// e2e run. This polls the dedicated test port and fails fast, with a clear
// diagnosis, if the response isn't recognizably this app. A short poll
// (rather than a single fetch) tolerates any ordering between webServer
// startup and globalSetup.
export default async function globalSetup(): Promise<void> {
  const deadline = Date.now() + 25_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(TEST_BASE_URL);
      const html = await response.text();
      if (html.includes(EXPECTED_APP_TITLE)) return;
      lastError = new Error(
        `${TEST_BASE_URL} responded, but the page is not the CISM Study Companion app ` +
          `(expected to find "${EXPECTED_APP_TITLE}" in the response). ` +
          `Another application may already be running on this port.`
      );
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Could not verify the CISM app at ${TEST_BASE_URL}: ${String(lastError)}`);
}
