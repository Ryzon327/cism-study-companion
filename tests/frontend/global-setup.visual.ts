import { createGlobalSetup } from "./global-setup";
import { TEST_BASE_URL } from "./test-server";

// playwright.visual.config.ts's globalSetup: unchanged single-server
// behavior (visual regression only ever exercises QA-reachable prototype
// gate screens) — see global-setup.ts.
export default createGlobalSetup([TEST_BASE_URL]);
