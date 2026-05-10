/**
 * Integration tests — exercise the full Hono → MCP SDK → tool registration
 * pipeline by issuing real JSON-RPC requests against the Worker via app.fetch.
 *
 * Closes coverage on src/index.ts (the /mcp POST route is only reachable
 * through a real protocol request, not by calling registerTools directly).
 */

import { describe, expect, it, vi } from "vitest";
import type { AIBinding, Bindings } from "../ai/client.js";
import app from "../index.js";

function makeEnv(aiResponse: unknown = { response: "ok" }): Bindings {
  const ai: AIBinding = { run: vi.fn().mockResolvedValue(aiResponse) };
  return { AI: ai };
}

/**
 * Issue a JSON-RPC POST against /mcp. The Streamable HTTP transport returns
 * its response as an SSE message line ("event: message\ndata: <json>\n\n"),
 * which we parse here so callers can assert on the JSON-RPC body directly.
 */
async function rpc(
  method: string,
  params: Record<string, unknown> = {},
  id = 1,
  env: Bindings = makeEnv()
): Promise<{ status: number; rpc: Record<string, unknown> | null }> {
  const res = await app.fetch(
    new Request("http://localhost/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    }),
    env
  );
  const body = await res.text();
  // Streamable HTTP returns either SSE-framed JSON or raw JSON depending on
  // negotiation. Handle both.
  const dataLine = body
    .split("\n")
    .find((line) => line.startsWith("data: "));
  const json = dataLine ? dataLine.slice(6).trim() : body.trim();
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(json) as Record<string, unknown>;
  } catch {
    parsed = null;
  }
  return { status: res.status, rpc: parsed };
}

describe("HTTP /mcp — protocol roundtrips", () => {
  it("tools/list returns the expected 17 tools", async () => {
    const { status, rpc: r } = await rpc("tools/list");
    expect(status).toBe(200);
    const result = r?.result as { tools: Array<{ name: string }> } | undefined;
    expect(result?.tools.length).toBe(17);
    const names = result?.tools.map((t) => t.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "get_profile",
        "get_projects",
        "get_recent_shipments",
        "get_skills",
        "ask_about_daniel",
        "get_bug_fixes",
        "get_curated_tweets",
        "get_writing",
        "get_case_study",
        "get_lab_demos",
        "get_agent_guide",
        "ai_ask",
        "ai_summarize",
        "ai_classify",
        "ai_extract_json",
        "ai_translate",
      ])
    );
  });

  it("resources/list returns the expected 2 resources", async () => {
    const { rpc: r } = await rpc("resources/list");
    const result = r?.result as
      | { resources: Array<{ uri: string }> }
      | undefined;
    const uris = result?.resources.map((res) => res.uri);
    expect(uris).toEqual(
      expect.arrayContaining(["resume://daniel.json", "bio://daniel.md"])
    );
  });

  it("tools/call get_profile returns canonical contact info", async () => {
    const { rpc: r } = await rpc("tools/call", {
      name: "get_profile",
      arguments: {},
    });
    const result = r?.result as
      | { content: Array<{ text: string }> }
      | undefined;
    const text = result?.content[0].text ?? "";
    expect(text).toContain("Daniel Suchan");
    expect(text).toContain("mr.sucik@gmail.com");
    expect(text).toContain("Brno");
  });

  it("tools/call ai_ask routes to the AI binding", async () => {
    const env = makeEnv({ response: "pong-from-binding" });
    const { rpc: r } = await rpc(
      "tools/call",
      { name: "ai_ask", arguments: { question: "ping?" } },
      2,
      env
    );
    const result = r?.result as
      | { content: Array<{ text: string }> }
      | undefined;
    expect(result?.content[0].text).toBe("pong-from-binding");
    expect((env.AI.run as ReturnType<typeof vi.fn>)).toHaveBeenCalledOnce();
  });

  it("tools/call rejects unknown tool", async () => {
    const { rpc: r } = await rpc("tools/call", {
      name: "no_such_tool",
      arguments: {},
    });
    // SDK returns either an error result or a JSON-RPC error envelope.
    const error = r?.error as { message?: string } | undefined;
    const result = r?.result as { isError?: boolean } | undefined;
    expect(error || result?.isError).toBeTruthy();
  });

  it("resources/read bio://daniel.md returns markdown with MCP credential", async () => {
    const { rpc: r } = await rpc("resources/read", { uri: "bio://daniel.md" });
    const result = r?.result as
      | { contents: Array<{ text: string; mimeType: string }> }
      | undefined;
    expect(result?.contents[0].mimeType).toBe("text/markdown");
    expect(result?.contents[0].text).toContain("mcp.danielsuchan.dev");
  });

  it("resources/read resume://daniel.json returns valid JSON Resume", async () => {
    const { rpc: r } = await rpc("resources/read", {
      uri: "resume://daniel.json",
    });
    const result = r?.result as
      | { contents: Array<{ text: string; mimeType: string }> }
      | undefined;
    expect(result?.contents[0].mimeType).toBe("application/json");
    const resume = JSON.parse(result?.contents[0].text ?? "{}");
    expect(resume.basics.name).toBe("Daniel Suchan");
  });

  it("get_recent_shipments through the protocol returns 2025-2026 backfill", async () => {
    const { rpc: r } = await rpc("tools/call", {
      name: "get_recent_shipments",
      arguments: { days: 1095 },
    });
    const result = r?.result as
      | { content: Array<{ text: string }> }
      | undefined;
    const entries = JSON.parse(result?.content[0].text ?? "[]");
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(50); // backfill is ~194 entries
  });

  it("ai_classify enforces JSON-mode contract via the protocol", async () => {
    const env = makeEnv({
      response: '{"label": "positive", "rationale": "looks good"}',
    });
    const { rpc: r } = await rpc(
      "tools/call",
      {
        name: "ai_classify",
        arguments: { text: "hello", labels: ["positive", "negative"] },
      },
      3,
      env
    );
    const result = r?.result as
      | { structuredContent?: { label: string } }
      | undefined;
    expect(result?.structuredContent?.label).toBe("positive");
  });

  it("budget gate denies when limit exhausted", async () => {
    const today = `ai_calls:${new Date().toISOString().slice(0, 10)}`;
    const ai: AIBinding = { run: vi.fn().mockResolvedValue({ response: "ok" }) };
    const env: Bindings = {
      AI: ai,
      AI_BUDGET: {
        get: vi.fn(async (k: string) => (k === today ? "5" : null)),
        put: vi.fn(),
      },
      MAX_AI_CALLS_PER_DAY: "5",
    };
    const { rpc: r } = await rpc(
      "tools/call",
      { name: "ai_ask", arguments: { question: "hi" } },
      4,
      env
    );
    const result = r?.result as
      | { isError?: boolean; content: Array<{ text: string }> }
      | undefined;
    expect(result?.isError).toBe(true);
    expect(result?.content[0].text).toMatch(/daily budget/i);
    expect(ai.run).not.toHaveBeenCalled();
  });
});

describe("HTTP / health endpoint", () => {
  it("returns 200 with version + tools manifest", async () => {
    const res = await app.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      version: string;
      tools: string[];
      resources: string[];
      aiBudget: { callsToday: number; limit: number; window: string };
    };
    expect(body.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(body.tools.length).toBe(17);
    expect(body.resources.length).toBe(2);
    expect(body.aiBudget.window).toBe("UTC day");
  });

  it("aiBudget gracefully reports 0 when no env is bound", async () => {
    const res = await app.fetch(new Request("http://localhost/"));
    const body = (await res.json()) as { aiBudget: { callsToday: number } };
    expect(body.aiBudget.callsToday).toBe(0);
  });
});

describe("HTTP /mcp — CORS preflight", () => {
  it("OPTIONS /mcp returns CORS headers permitting MCP clients", async () => {
    const res = await app.fetch(
      new Request("http://localhost/mcp", {
        method: "OPTIONS",
        headers: {
          Origin: "https://claude.ai",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      })
    );
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});
