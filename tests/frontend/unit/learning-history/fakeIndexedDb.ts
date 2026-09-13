/**
 * Per-test IndexedDB isolation for the Learning Intelligence v1 test suite,
 * backed by `fake-indexeddb` (a dev-only dependency added specifically for
 * this — see docs/architecture/LEARNING-INTELLIGENCE-V1.md §6/§21). A fresh
 * `IDBFactory` is installed before each test so no state leaks between
 * tests within the same file; jsdom itself provides no `indexedDB` at all
 * (see app/src/learning-history/db.ts's `isIndexedDbAvailable()`), so this
 * is also the thing that makes `app/src/learning-history/db.ts` testable
 * under Vitest at all, without a real browser.
 */
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";

export function installFakeIndexedDb(): void {
  (globalThis as { indexedDB?: IDBFactory }).indexedDB = new IDBFactory();
  (globalThis as { IDBKeyRange?: typeof IDBKeyRange }).IDBKeyRange = IDBKeyRange;
}

export function removeIndexedDbForTests(): void {
  (globalThis as { indexedDB?: IDBFactory }).indexedDB = undefined;
}
