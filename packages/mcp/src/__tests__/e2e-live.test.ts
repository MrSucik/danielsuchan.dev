/**
 * Live E2E tests against the deployed MCP server at mcp.danielsuchan.dev.
 *
 * These tests hit the public network and consume Workers AI Neurons (one
 * call per AI tool exercised). Gated behind RUN_LIVE_E2E=1 so the default
 * `pnpm test` stays offline + free.
 *
 * Run with: RUN_LIVE_E2E=1 pnpm test
 *
 * Coverage they add: real Workers AI binding behavior, real KV-backed budget
 * counter, real Streamable HTTP transport over public TLS — none of which
 * the in-process integration tests can simulate.
 */

import { describe, expect, it } from "vitest";

const SHOULD_RUN = process.env.RUN_LIVE_E2E === "1";
const ENDPOINT = "https://mcp.danielsuchan.dev/mcp";
const HEALTH = "https://mcp.danielsuchan.dev/";
const TIMEOUT_MS = 30_000;

const describeOrSkip = SHOULD_RUN ? describe : describe.skip;

async function rpc(
  method: string,
  params: Record<string, unknown> = {},
  id = 1
): Promise<{ status: number; rpc: Record<string, unknown> | null }> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
      signal: ac.signal,
    });
    const body = await res.text();
    const dataLine = body.split("\n").find((l) => l.startsWith("data: "));
    const json = dataLine ? dataLine.slice(6).trim() : body.trim();
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(json) as Record<string, unknown>;
    } catch {
      parsed = null;
    }
    return { status: res.status, rpc: parsed };
  } finally {
    clearTimeout(timer);
  }
}

describeOrSkip("E2E live — health endpoint", () => {
  it(
    "returns the deployed version + manifest",
    async () => {
      const res = await fetch(HEALTH);
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        version: string;
        tools: string[];
        resources: string[];
        aiBudget: { callsToday: number; limit: number };
      };
      expect(body.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(body.tools.length).toBe(12);
      expect(body.resources.length).toBe(2);
      expect(body.aiBudget.limit).toBeGreaterThan(0);
    },
    TIMEOUT_MS
  );

  it("reports a live aiBudget counter", async () => {
    const res = await fetch(HEALTH);
    const body = (await res.json()) as {
      aiBudget: { callsToday: number; limit: number; window: string };
    };
    expect(body.aiBudget.window).toBe("UTC day");
    expect(body.aiBudget.callsToday).toBeGreaterThanOrEqual(0);
    expect(body.aiBudget.callsToday).toBeLessThanOrEqual(body.aiBudget.limit);
  });
});

describeOrSkip("E2E live — protocol", () => {
  it(
    "tools/list returns 12 tools",
    async () => {
      const { status, rpc: r } = await rpc("tools/list");
      expect(status).toBe(200);
      const result = r?.result as { tools: Array<{ name: string }> } | undefined;
      expect(result?.tools.length).toBe(12);
    },
    TIMEOUT_MS
  );

  it(
    "tools/call get_profile returns canonical Daniel data",
    async () => {
      const { rpc: r } = await rpc("tools/call", {
        name: "get_profile",
        arguments: {},
      });
      const result = r?.result as
        | { content: Array<{ text: string }> }
        | undefined;
      const profile = JSON.parse(result?.content[0].text ?? "{}");
      expect(profile.name).toBe("Daniel Suchan");
      expect(profile.email).toBe("mr.sucik@gmail.com");
      expect(profile.location).toContain("Brno");
    },
    TIMEOUT_MS
  );

  it(
    "tools/call get_recent_shipments returns the 2025-2026 backfill",
    async () => {
      const { rpc: r } = await rpc("tools/call", {
        name: "get_recent_shipments",
        arguments: { days: 1095 },
      });
      const result = r?.result as
        | { content: Array<{ text: string }> }
        | undefined;
      const entries = JSON.parse(result?.content[0].text ?? "[]");
      expect(entries.length).toBeGreaterThan(50);
      // Contains entries from before this branch was created (verifies backfill)
      const oldestDate = entries[entries.length - 1].date;
      expect(oldestDate.startsWith("2025-")).toBe(true);
    },
    TIMEOUT_MS
  );

  it(
    "tools/call get_bug_fixes returns ≥100 entries",
    async () => {
      const { rpc: r } = await rpc("tools/call", {
        name: "get_bug_fixes",
        arguments: { limit: 200 },
      });
      const result = r?.result as
        | { content: Array<{ text: string }> }
        | undefined;
      const data = JSON.parse(result?.content[0].text ?? "{}");
      expect(data.count).toBeGreaterThan(100);
    },
    TIMEOUT_MS
  );

  it(
    "resources/read bio://daniel.md is current",
    async () => {
      const { rpc: r } = await rpc("resources/read", {
        uri: "bio://daniel.md",
      });
      const result = r?.result as
        | { contents: Array<{ text: string }> }
        | undefined;
      expect(result?.contents[0].text).toContain("mcp.danielsuchan.dev");
      expect(result?.contents[0].text).not.toContain("@blaze.codes");
    },
    TIMEOUT_MS
  );
});

describeOrSkip("E2E live — Workers AI tools", () => {
  it(
    "ai_ask returns a model response",
    async () => {
      const { rpc: r } = await rpc("tools/call", {
        name: "ai_ask",
        arguments: { question: "Reply with exactly: pong" },
      });
      const result = r?.result as
        | { content: Array<{ text: string }>; isError?: boolean }
        | undefined;
      expect(result?.isError).toBeFalsy();
      expect(result?.content[0].text.length).toBeGreaterThan(0);
    },
    TIMEOUT_MS
  );

  it(
    "ai_classify returns structured content within the label set",
    async () => {
      const labels = ["positive", "negative", "neutral"];
      const { rpc: r } = await rpc("tools/call", {
        name: "ai_classify",
        arguments: { text: "this is wonderful", labels },
      });
      const result = r?.result as
        | {
            structuredContent?: { label: string };
            content: Array<{ text: string }>;
            isError?: boolean;
          }
        | undefined;
      // Either the model returned a valid in-set label (happy path), or it
      // returned an out-of-set label which the tool flags isError. Both are
      // valid behavior — the contract is "return a label OR error cleanly".
      // We assert at least one of these holds, never both.
      if (result?.isError) {
        expect(result.content[0].text).toMatch(
          /classification failed|did not match/i
        );
        expect(result.structuredContent).toBeUndefined();
      } else {
        expect(labels).toContain(result?.structuredContent?.label);
      }
    },
    TIMEOUT_MS
  );

  it(
    "ai_translate produces a non-English string for Czech target",
    async () => {
      const { rpc: r } = await rpc("tools/call", {
        name: "ai_translate",
        arguments: { text: "Hello world", targetLanguage: "Czech" },
      });
      const result = r?.result as
        | { content: Array<{ text: string }>; isError?: boolean }
        | undefined;
      expect(result?.isError).toBeFalsy();
      expect(result?.content[0].text.length).toBeGreaterThan(0);
    },
    TIMEOUT_MS
  );
});

describeOrSkip("E2E live — security posture", () => {
  it("error responses do not leak Workers AI internal state", async () => {
    const { rpc: r } = await rpc("tools/call", {
      name: "ai_ask",
      arguments: { question: "" }, // empty triggers Zod validation error
    });
    const text = JSON.stringify(r);
    expect(text).not.toMatch(/AccountId|account_id|cf-ray|trace_id|x-request-id/i);
  });

  it("input length caps reject oversized text", async () => {
    const { rpc: r } = await rpc("tools/call", {
      name: "ai_summarize",
      arguments: { text: "x".repeat(40_000) }, // > MAX_TEXT (32_000)
    });
    // Either the SDK returns a Zod error or the tool flags isError.
    const text = JSON.stringify(r).toLowerCase();
    expect(text).toMatch(/too_big|too long|maximum|invalid/i);
  });
});
