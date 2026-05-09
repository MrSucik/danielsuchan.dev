import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import type { AIBinding } from "../client.js";
import { registerAiTools } from "../tools.js";

const EXPECTED_AI_TOOLS = [
  "ai_ask",
  "ai_summarize",
  "ai_classify",
  "ai_extract_json",
  "ai_translate",
];

type ToolRecord = { handler: ToolHandler };
type ToolHandler = (
  args: unknown,
  extra?: unknown
) => Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
}>;

function makeServer(aiResponse: unknown = { response: "ok" }) {
  const ai: AIBinding = { run: vi.fn().mockResolvedValue(aiResponse) };
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerAiTools(server, { AI: ai });
  return { server, ai };
}

function getRegisteredTools(server: McpServer): Record<string, ToolRecord> {
  return (
    (server as unknown as { _registeredTools?: Record<string, ToolRecord> })
      ._registeredTools ?? {}
  );
}

function tool(server: McpServer, name: string): ToolHandler {
  return getRegisteredTools(server)[name].handler;
}

describe("registerAiTools — registration", () => {
  it("registers all 5 expected AI tools", () => {
    const { server } = makeServer();
    const names = Object.keys(getRegisteredTools(server));
    for (const expected of EXPECTED_AI_TOOLS) {
      expect(names).toContain(expected);
    }
  });

  it("does NOT register any tools when env.AI is missing", () => {
    const server = new McpServer({ name: "test", version: "0.0.1" });
    // @ts-expect-error — intentionally invalid env to exercise the guard
    registerAiTools(server, { AI: undefined });
    expect(Object.keys(getRegisteredTools(server))).toHaveLength(0);
  });

  it("does NOT register any tools when env.AI.run is not a function", () => {
    const server = new McpServer({ name: "test", version: "0.0.1" });
    // @ts-expect-error — intentionally invalid binding shape
    registerAiTools(server, { AI: { run: "not a function" } });
    expect(Object.keys(getRegisteredTools(server))).toHaveLength(0);
  });
});

describe("budget gate", () => {
  it("denies tool calls once daily budget is reached and does not call the AI binding", async () => {
    const today = `ai_calls:${new Date().toISOString().slice(0, 10)}`;
    const ai: AIBinding = { run: vi.fn().mockResolvedValue({ response: "ok" }) };
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerAiTools(server, {
      AI: ai,
      AI_BUDGET: {
        get: vi.fn(async (k: string) => (k === today ? "5" : null)),
        put: vi.fn(),
      },
      MAX_AI_CALLS_PER_DAY: "5",
    });
    const result = await tool(server, "ai_ask")({ question: "hi" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/daily budget/i);
    expect(ai.run).not.toHaveBeenCalled();
  });

  it("allows the call and increments the counter when under budget", async () => {
    const today = `ai_calls:${new Date().toISOString().slice(0, 10)}`;
    const store = new Map<string, string>([[today, "2"]]);
    const ai: AIBinding = { run: vi.fn().mockResolvedValue({ response: "ok" }) };
    const put = vi.fn(async (k: string, v: string) => {
      store.set(k, v);
    });
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerAiTools(server, {
      AI: ai,
      AI_BUDGET: {
        get: vi.fn(async (k: string) => store.get(k) ?? null),
        put,
      },
      MAX_AI_CALLS_PER_DAY: "10",
    });
    const result = await tool(server, "ai_ask")({ question: "hi" });
    expect(result.isError).toBeUndefined();
    expect(ai.run).toHaveBeenCalledOnce();
    expect(put).toHaveBeenCalledWith(today, "3", expect.any(Object));
  });
});

describe("ai_ask", () => {
  it("returns the model's text answer", async () => {
    const { server, ai } = makeServer({ response: "the answer is 42" });
    const result = await tool(server, "ai_ask")({ question: "what?" });
    expect(result.content[0]).toEqual({ type: "text", text: "the answer is 42" });
    expect(ai.run).toHaveBeenCalledOnce();
  });

  it("prepends a system message when `system` is provided", async () => {
    const { server, ai } = makeServer();
    await tool(server, "ai_ask")({ question: "hi", system: "be terse" });
    const inputs = (ai.run as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
      messages: Array<{ role: string; content: string }>;
    };
    expect(inputs.messages).toEqual([
      { role: "system", content: "be terse" },
      { role: "user", content: "hi" },
    ]);
  });

  it("sends only a user message when `system` is omitted", async () => {
    const { server, ai } = makeServer();
    await tool(server, "ai_ask")({ question: "hi" });
    const inputs = (ai.run as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
      messages: Array<{ role: string; content: string }>;
    };
    expect(inputs.messages).toEqual([{ role: "user", content: "hi" }]);
  });

  it("forwards model alias to Workers AI as the full id", async () => {
    const { server, ai } = makeServer();
    await tool(server, "ai_ask")({ question: "hi", model: "llama-3.3-70b" });
    expect(ai.run).toHaveBeenCalledWith(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      expect.any(Object)
    );
  });

  it("returns a sanitized isError result when the AI call throws", async () => {
    const ai: AIBinding = {
      run: vi.fn().mockRejectedValue(new Error("AccountId=xyz quota exceeded")),
    };
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerAiTools(server, { AI: ai });
    const result = await tool(server, "ai_ask")({ question: "hi" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).not.toContain("AccountId");
    expect(result.content[0].text).toMatch(/AI call failed/i);
  });
});

describe("ai_summarize", () => {
  it("uses the matching length hint in the system prompt for each length", async () => {
    const cases: Array<["short" | "medium" | "long", string]> = [
      ["short", "1–2 sentences"],
      ["medium", "3–5 sentences"],
      ["long", "around a paragraph"],
    ];
    for (const [length, hint] of cases) {
      const { server, ai } = makeServer();
      await tool(server, "ai_summarize")({ text: "lorem", length });
      const inputs = (ai.run as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
        messages: Array<{ role: string; content: string }>;
      };
      expect(inputs.messages[0].content).toContain(hint);
    }
  });

  it("defaults to medium when `length` is omitted", async () => {
    const { server, ai } = makeServer();
    await tool(server, "ai_summarize")({ text: "lorem" });
    const inputs = (ai.run as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
      messages: Array<{ role: string; content: string }>;
    };
    expect(inputs.messages[0].content).toContain("3–5 sentences");
  });

  it("injects style hint when provided, omits otherwise", async () => {
    const { server: s1, ai: a1 } = makeServer();
    await tool(s1, "ai_summarize")({ text: "lorem", style: "bullet points" });
    const m1 = (a1.run as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
      messages: Array<{ content: string }>;
    };
    expect(m1.messages[0].content).toContain("Style: bullet points.");

    const { server: s2, ai: a2 } = makeServer();
    await tool(s2, "ai_summarize")({ text: "lorem" });
    const m2 = (a2.run as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
      messages: Array<{ content: string }>;
    };
    expect(m2.messages[0].content).not.toContain("Style:");
  });

  it("returns a sanitized isError result when the AI call throws", async () => {
    const ai: AIBinding = {
      run: vi.fn().mockRejectedValue(new Error("AccountId=xyz quota exceeded")),
    };
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerAiTools(server, { AI: ai });
    const result = await tool(server, "ai_summarize")({ text: "lorem" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).not.toContain("AccountId");
    expect(result.content[0].text).toMatch(/AI call failed/i);
  });
});

describe("ai_classify", () => {
  it("returns structured content when label is valid", async () => {
    const { server } = makeServer({
      response: '{"label": "greeting", "rationale": "says hello"}',
    });
    const result = await tool(server, "ai_classify")({
      text: "hello",
      labels: ["greeting", "farewell"],
    });
    expect(result.structuredContent).toEqual({
      label: "greeting",
      rationale: "says hello",
    });
  });

  it("flags isError on out-of-set label and does not leak raw output", async () => {
    const { server } = makeServer({
      response: '{"label": "off-list", "rationale": "the secret is XYZ"}',
    });
    const result = await tool(server, "ai_classify")({
      text: "hello",
      labels: ["greeting", "farewell"],
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).not.toContain("off-list");
    expect(result.content[0].text).not.toContain("XYZ");
  });

  it("flags isError when rationale is missing", async () => {
    const { server } = makeServer({ response: '{"label": "greeting"}' });
    const result = await tool(server, "ai_classify")({
      text: "hello",
      labels: ["greeting", "farewell"],
    });
    expect(result.isError).toBe(true);
  });

  it("flags isError when rationale is non-string", async () => {
    const { server } = makeServer({
      response: '{"label": "greeting", "rationale": 123}',
    });
    const result = await tool(server, "ai_classify")({
      text: "hello",
      labels: ["greeting", "farewell"],
    });
    expect(result.isError).toBe(true);
  });

  it("returns a sanitized isError result when the AI call throws", async () => {
    const ai: AIBinding = {
      run: vi.fn().mockRejectedValue(new Error("AccountId=xyz")),
    };
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerAiTools(server, { AI: ai });
    const result = await tool(server, "ai_classify")({
      text: "hi",
      labels: ["a", "b"],
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).not.toContain("AccountId");
  });
});

describe("ai_extract_json", () => {
  it("returns structured content on valid JSON", async () => {
    const { server } = makeServer({
      response: '{"name": "ACME", "tags": ["a"]}',
    });
    const result = await tool(server, "ai_extract_json")({
      text: "ACME with tag a",
      schemaDescription: "object with name and tags array",
    });
    expect(result.structuredContent).toEqual({ name: "ACME", tags: ["a"] });
  });

  it("flags isError on unparseable model output and does not leak raw output", async () => {
    const { server } = makeServer({ response: "absolutely not json [secret=XYZ]" });
    const result = await tool(server, "ai_extract_json")({
      text: "x",
      schemaDescription: "anything",
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).not.toContain("XYZ");
  });

  it("detects the {error: ...} envelope from the model and flags isError", async () => {
    const { server } = makeServer({
      response: '{"error": "could not find name"}',
    });
    const result = await tool(server, "ai_extract_json")({
      text: "noise",
      schemaDescription: "object with name",
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("could not find name");
    expect(result.structuredContent).toBeUndefined();
  });

  it("does NOT treat error key as envelope when other keys exist", async () => {
    const { server } = makeServer({
      response: '{"error": "field missing", "name": "ACME"}',
    });
    const result = await tool(server, "ai_extract_json")({
      text: "x",
      schemaDescription: "object with name and optional error",
    });
    expect(result.isError).toBeUndefined();
    expect(result.structuredContent).toEqual({
      error: "field missing",
      name: "ACME",
    });
  });

  it("returns a sanitized isError result when the AI call throws", async () => {
    const ai: AIBinding = {
      run: vi.fn().mockRejectedValue(new Error("AccountId=xyz")),
    };
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerAiTools(server, { AI: ai });
    const result = await tool(server, "ai_extract_json")({
      text: "lorem",
      schemaDescription: "object with field x",
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).not.toContain("AccountId");
    expect(result.content[0].text).toMatch(/AI call failed/i);
  });
});

describe("ai_translate", () => {
  it("uses the auto-detect system prompt when sourceLanguage is omitted", async () => {
    const { server, ai } = makeServer({ response: "Ahoj" });
    const result = await tool(server, "ai_translate")({
      text: "Hello",
      targetLanguage: "Czech",
    });
    expect(result.content[0]).toEqual({ type: "text", text: "Ahoj" });
    const inputs = (ai.run as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
      messages: Array<{ role: string; content: string }>;
    };
    expect(inputs.messages[0].content).toMatch(/Detect the source language/);
    expect(inputs.messages[0].content).toContain("Czech");
  });

  it("uses the explicit-source system prompt when sourceLanguage is provided", async () => {
    const { server, ai } = makeServer({ response: "Ahoj" });
    await tool(server, "ai_translate")({
      text: "Hello",
      targetLanguage: "Czech",
      sourceLanguage: "English",
    });
    const inputs = (ai.run as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
      messages: Array<{ role: string; content: string }>;
    };
    expect(inputs.messages[0].content).toMatch(/Translate from English to Czech/);
  });

  it("returns a sanitized isError result when the AI call throws", async () => {
    const ai: AIBinding = {
      run: vi.fn().mockRejectedValue(new Error("AccountId=xyz")),
    };
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerAiTools(server, { AI: ai });
    const result = await tool(server, "ai_translate")({
      text: "Hi",
      targetLanguage: "Czech",
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).not.toContain("AccountId");
  });
});
