import { createGlobalSetup } from "./global-setup";
import { TEST_BASE_URL, PRODUCTION_DEFAULT_TEST_BASE_URL, PRODUCTION_BUILD_TEST_BASE_URL } from "./test-server";

// playwright.config.ts's globalSetup: verifies all three dedicated servers
// it starts (QA-enabled, ordinary/no-flag, and the real production build)
// before any test runs — see global-setup.ts and
// docs/architecture/PRODUCT-ENVIRONMENT-FOLLOW-UP.md.
export default createGlobalSetup([TEST_BASE_URL, PRODUCTION_DEFAULT_TEST_BASE_URL, PRODUCTION_BUILD_TEST_BASE_URL]);
