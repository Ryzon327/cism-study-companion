import { EXPECTED_APP_TITLE } from "./test-server";

// Phase 10B-1 port-collision fix: `webServer.url` only confirms SOMETHING
// answered on the test port, not that it's THIS app — the exact gap that
// let an unrelated project's dev server on 5173 silently swallow a full
// e2e run. This polls each given dedicated test port and fails fast, with
// a clear diagnosis, if the response isn't recognizably this app. A short
// poll (rather than a single fetch) tolerates any ordering between
// webServer startup and globalSetup.
async function verifyAppAt(baseUrl: string): Promise<void> {
  const deadline = Date.now() + 25_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      const html = await response.text();
      if (html.includes(EXPECTED_APP_TITLE)) return;
      lastError = new Error(
        `${baseUrl} responded, but the page is not the CISM Study Companion app ` +
          `(expected to find "${EXPECTED_APP_TITLE}" in the response). ` +
          `Another application may already be running on this port.`
      );
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw lastError instanceof Error ? lastError : new Error(`Could not verify the CISM app at ${baseUrl}: ${String(lastError)}`);
}

/**
 * Product-environment follow-up: a Playwright config may now run more than
 * one dedicated webServer (QA-fixtures-enabled, ordinary/no-flag, and a
 * real production build) on separate ports — see
 * docs/architecture/PRODUCT-ENVIRONMENT-FOLLOW-UP.md. Each config passes
 * exactly the base URLs it actually starts a server for; verified in
 * parallel since they're fully independent servers.
 */
export function createGlobalSetup(baseUrls: string[]) {
  return async function globalSetup(): Promise<void> {
    await Promise.all(baseUrls.map(verifyAppAt));
  };
}
