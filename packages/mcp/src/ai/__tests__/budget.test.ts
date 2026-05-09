import { describe, expect, it, vi } from "vitest";
import {
  type BudgetStore,
  parseLimit,
  readDailyCalls,
  reserveAiCall,
} from "../budget.js";

function memoryStore(initial: Record<string, string> = {}): BudgetStore {
  const map = new Map(Object.entries(initial));
  return {
    get: vi.fn(async (key: string) => map.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      map.set(key, value);
    }),
  };
}

const TODAY = `ai_calls:${new Date().toISOString().slice(0, 10)}`;

describe("reserveAiCall", () => {
  it("allows the first call and increments to 1", async () => {
    const store = memoryStore();
    const result = await reserveAiCall(store, 5);
    expect(result.allowed).toBe(true);
    expect(result.callsToday).toBe(1);
    expect(result.limit).toBe(5);
    expect(store.put).toHaveBeenCalledWith(
      TODAY,
      "1",
      expect.objectContaining({ expirationTtl: expect.any(Number) })
    );
  });

  it("denies once the daily limit is reached", async () => {
    const store = memoryStore({ [TODAY]: "5" });
    const result = await reserveAiCall(store, 5);
    expect(result.allowed).toBe(false);
    expect(result.callsToday).toBe(5);
    expect(store.put).not.toHaveBeenCalled();
  });

  it("denies just past the limit (off-by-one guard)", async () => {
    const store = memoryStore({ [TODAY]: "6" });
    const result = await reserveAiCall(store, 5);
    expect(result.allowed).toBe(false);
  });

  it("treats a missing store as 'no gating' for local dev", async () => {
    const result = await reserveAiCall(undefined, 80);
    expect(result.allowed).toBe(true);
    expect(result.callsToday).toBe(0);
  });

  it("treats malformed counter values as zero", async () => {
    const store = memoryStore({ [TODAY]: "not-a-number" });
    const result = await reserveAiCall(store, 80);
    expect(result.allowed).toBe(true);
    expect(result.callsToday).toBe(1);
  });

  it("treats negative counter values as zero", async () => {
    const store = memoryStore({ [TODAY]: "-7" });
    const result = await reserveAiCall(store, 80);
    expect(result.allowed).toBe(true);
    expect(result.callsToday).toBe(1);
  });
});

describe("readDailyCalls", () => {
  it("returns 0 when there is no entry yet", async () => {
    expect(await readDailyCalls(memoryStore())).toBe(0);
  });

  it("returns the stored counter", async () => {
    const store = memoryStore({ [TODAY]: "42" });
    expect(await readDailyCalls(store)).toBe(42);
  });

  it("returns 0 when no store is bound", async () => {
    expect(await readDailyCalls(undefined)).toBe(0);
  });
});

describe("parseLimit", () => {
  it("uses the fallback when env var is missing", () => {
    expect(parseLimit(undefined, 80)).toBe(80);
  });

  it("uses the fallback for invalid values", () => {
    expect(parseLimit("nope", 80)).toBe(80);
    expect(parseLimit("-5", 80)).toBe(80);
    expect(parseLimit("0", 80)).toBe(80);
  });

  it("parses positive integers", () => {
    expect(parseLimit("150", 80)).toBe(150);
  });
});
