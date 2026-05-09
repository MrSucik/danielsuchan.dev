// Daily budget tracker for Workers AI calls. Circuit-breaks before the
// free-tier Neuron quota is exhausted.
//
// Tracking is best-effort: KV is eventually consistent, so concurrent
// increments may race. Good enough for budget enforcement on a low-traffic
// public endpoint; not safety-critical.

// Subset of KVNamespace we use. Duck-typed for testability.
export type BudgetStore = {
  get: (key: string) => Promise<string | null>;
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ) => Promise<void>;
};

export type BudgetCheck = {
  allowed: boolean;
  /** Calls counted *after* the increment when allowed; before when denied. */
  callsToday: number;
  limit: number;
};

const KEY_PREFIX = "ai_calls";

function todayKey(): string {
  // YYYY-MM-DD in UTC matches Cloudflare's quota-reset boundary.
  return `${KEY_PREFIX}:${new Date().toISOString().slice(0, 10)}`;
}

/**
 * Atomically (best-effort) checks the daily call counter and increments it.
 * Returns `allowed: false` once the limit is reached so callers can short-circuit
 * the AI call. The key carries a 48h TTL so old day-keys self-clean.
 */
export async function reserveAiCall(
  store: BudgetStore | undefined,
  limit: number
): Promise<BudgetCheck> {
  // No store bound (e.g., local dev without KV) → don't gate. Operators see
  // a startup warning so this isn't silently bypassed in prod.
  if (!store) {
    return { allowed: true, callsToday: 0, limit };
  }
  const key = todayKey();
  const current = parseCount(await store.get(key));
  if (current >= limit) {
    return { allowed: false, callsToday: current, limit };
  }
  const next = current + 1;
  // 48h TTL: yesterday's key expires before today even reaches its budget.
  await store.put(key, String(next), { expirationTtl: 48 * 3600 });
  return { allowed: true, callsToday: next, limit };
}

/** Read-only inspection — used by the health endpoint, never gates calls. */
export async function readDailyCalls(
  store: BudgetStore | undefined
): Promise<number> {
  if (!store) return 0;
  return parseCount(await store.get(todayKey()));
}

function parseCount(raw: string | null): number {
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Parse a positive integer env var with a fallback default. */
export function parseLimit(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
