import { startTestDatabase, stopTestDatabase } from "./setup.js";

// Vitest global setup — runs once before the whole suite, teardown runs once
// after. This keeps us from spinning up Postgres 8 times (one per test file).
// Individual test files still seed fresh data in their own beforeAll to
// avoid cross-file state leaks.

export async function setup() {
  await startTestDatabase();
}

export async function teardown() {
  await stopTestDatabase();
}
