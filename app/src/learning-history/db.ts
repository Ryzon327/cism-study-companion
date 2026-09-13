/**
 * The thin, project-owned IndexedDB adapter for Learning Intelligence
 * history — no ORM, per docs/architecture/LEARNING-INTELLIGENCE-V1.md §6.
 *
 * One database (`cism-li`), one append-only object store
 * (`learningEvents`, keyPath `eventId`) plus a single-record `meta` store
 * holding the versioning anchor (§20 of the architecture). Indexes are
 * added only where a real LI-1 query needs them (§17: "add only when
 * actually justified") — `by_sessionId` and `by_parentAttemptId` (Repair
 * linkage lookups); `by_questionId` for grouping recorded events by
 * question. Records with a null/missing indexed field are simply omitted
 * from that index by IndexedDB itself (not an error) — expected for the
 * many events with `questionId: null` (prototype-sourced) or the
 * QUESTION_ATTEMPT events with no `parentAttemptId` at all.
 *
 * Every exported function opens, uses, and closes its own connection —
 * deliberately simple over long-lived-connection/version-change handling,
 * since LI-1's write volume is one record per learner action, not a
 * perf-sensitive path (§23 of the architecture).
 */
import type { LearningEvent } from "./types";

export const DB_NAME = "cism-li";
export const DB_VERSION = 1;
const EVENTS_STORE = "learningEvents";
const META_STORE = "meta";
const META_KEY = "main";

export interface LearningHistoryMeta {
  eventSchemaVersion: number;
  dbVersion: number;
  createdAt: number;
}

export function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        const store = db.createObjectStore(EVENTS_STORE, { keyPath: "eventId" });
        store.createIndex("by_sessionId", "sessionId");
        store.createIndex("by_questionId", "questionId");
        store.createIndex("by_parentAttemptId", "parentAttemptId");
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open the cism-li IndexedDB database"));
    request.onblocked = () => reject(new Error("cism-li IndexedDB open request was blocked"));
  });
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

export async function appendEvent(event: LearningEvent): Promise<void> {
  const db = await openDatabase();
  try {
    const tx = db.transaction(EVENTS_STORE, "readwrite");
    tx.objectStore(EVENTS_STORE).add(event);
    await transactionDone(tx);
  } finally {
    db.close();
  }
}

/** Stable ordering: chronological by `occurredAt`, tie-broken by `eventId`
 * so callers (and tests) never depend on IndexedDB's own storage order. */
export async function listEvents(): Promise<LearningEvent[]> {
  const db = await openDatabase();
  try {
    const tx = db.transaction(EVENTS_STORE, "readonly");
    const request = tx.objectStore(EVENTS_STORE).getAll();
    const [result] = await Promise.all([promisifyRequest(request), transactionDone(tx)]);
    return (result as LearningEvent[]).slice().sort((a, b) => a.occurredAt - b.occurredAt || a.eventId.localeCompare(b.eventId));
  } finally {
    db.close();
  }
}

export async function getEventById(eventId: string): Promise<LearningEvent | undefined> {
  const db = await openDatabase();
  try {
    const tx = db.transaction(EVENTS_STORE, "readonly");
    const request = tx.objectStore(EVENTS_STORE).get(eventId);
    const [result] = await Promise.all([promisifyRequest(request), transactionDone(tx)]);
    return result as LearningEvent | undefined;
  } finally {
    db.close();
  }
}

/** Clears learner history only — the `meta` versioning record survives a
 * reset (it describes the database itself, not learner evidence). */
export async function clearEvents(): Promise<void> {
  const db = await openDatabase();
  try {
    const tx = db.transaction(EVENTS_STORE, "readwrite");
    tx.objectStore(EVENTS_STORE).clear();
    await transactionDone(tx);
  } finally {
    db.close();
  }
}

export async function readMeta(): Promise<LearningHistoryMeta | undefined> {
  const db = await openDatabase();
  try {
    const tx = db.transaction(META_STORE, "readonly");
    const request = tx.objectStore(META_STORE).get(META_KEY);
    const [result] = await Promise.all([promisifyRequest(request), transactionDone(tx)]);
    if (!result) return undefined;
    const { eventSchemaVersion, dbVersion, createdAt } = result as LearningHistoryMeta;
    return { eventSchemaVersion, dbVersion, createdAt };
  } finally {
    db.close();
  }
}

/** Idempotent: writes the meta record only if one doesn't already exist,
 * and always returns the record now on disk (existing or newly written). */
export async function ensureMeta(): Promise<LearningHistoryMeta> {
  const existing = await readMeta();
  if (existing) return existing;
  const meta: LearningHistoryMeta = { eventSchemaVersion: 1, dbVersion: DB_VERSION, createdAt: Date.now() };
  const db = await openDatabase();
  try {
    const tx = db.transaction(META_STORE, "readwrite");
    tx.objectStore(META_STORE).put({ key: META_KEY, ...meta });
    await transactionDone(tx);
  } finally {
    db.close();
  }
  return meta;
}

/** Test-only: deletes the entire database so tests can start from a clean
 * slate. Not used by production code paths (LI-1 has no "delete database"
 * learner-facing capability — Reset clears events only, via clearEvents). */
export function deleteDatabaseForTests(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Failed to delete cism-li IndexedDB database"));
    request.onblocked = () => resolve();
  });
}
