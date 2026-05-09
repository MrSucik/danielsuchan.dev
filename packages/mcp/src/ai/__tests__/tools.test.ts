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

function makeServer(aiResponse: unknown = { response: "ok" }) {
  const ai: AIBinding = { run: vi.fn().mockResolvedValue(aiResponse) };
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerAiTools(server, { AI: ai });
  return { server, ai };
}

function getRegisteredTools(server: McpServer): Record<string, unknown> {
  return (
    (server as unknown as { _registeredTools?: Record<string, unknown> })
      ._registeredTools ?? {}
  );
}

describe("registerAiTools", () => {
  it("registers all 5 expected AI tools", () => {
    const { server } = makeServer();
    const names = Object.keys(getRegisteredTools(server));
    for (const expected of EXPECTED_AI_TOOLS) {
      expect(names).toContain(expected);
    }
  });

  it("ai_ask passes question to the binding and returns text content", async () => {
    const { server, ai } = makeServer({ response: "the answer is 42" });
    const tool = (
      getRegisteredTools(server)["ai_ask"] as {
        handler: (
          args: unknown,
          extra?: unknown
        ) => Promise<{ content: Array<{ type: string; text: string }> }>;
      }
    ).handler;
    const result = await tool({ question: "what is the answer?" });
    expect(result.content[0]).toEqual({ type: "text", text: "the answer is 42" });
    expect(ai.run).toHaveBeenCalledOnce();
  });

  it("ai_classify rejects out-of-set labels with isError", async () => {
    // Model returns a label not present in the requested set — tool must flag error.
    const { server } = makeServer({
      response: '{"label": "off-list", "rationale": "n/a"}',
    });
    const tool = (
      getRegisteredTools(server)["ai_classify"] as {
        handler: (
          args: unknown,
          extra?: unknown
        ) => Promise<{
          isError?: boolean;
          content: Array<{ type: string; text: string }>;
        }>;
      }
    ).handler;
    const result = await tool({
      text: "hello",
      labels: ["greeting", "farewell"],
    });
    expect(result.isError).toBe(true);
  });

  it("ai_classify returns structured content when label is valid", async () => {
    const { server } = makeServer({
      response: '{"label": "greeting", "rationale": "says hello"}',
    });
    const tool = (
      getRegisteredTools(server)["ai_classify"] as {
        handler: (
          args: unknown,
          extra?: unknown
        ) => Promise<{ structuredContent?: { label: string; rationale: string } }>;
      }
    ).handler;
    const result = await tool({
      text: "hello",
      labels: ["greeting", "farewell"],
    });
    expect(result.structuredContent).toEqual({
      label: "greeting",
      rationale: "says hello",
    });
  });

  it("ai_extract_json returns structured content on valid JSON", async () => {
    const { server } = makeServer({ response: '{"name": "ACME", "tags": ["a"]}' });
    const tool = (
      getRegisteredTools(server)["ai_extract_json"] as {
        handler: (
          args: unknown,
          extra?: unknown
        ) => Promise<{ structuredContent?: Record<string, unknown> }>;
      }
    ).handler;
    const result = await tool({
      text: "ACME with tag a",
      schema_description: "object with name and tags array",
    });
    expect(result.structuredContent).toEqual({ name: "ACME", tags: ["a"] });
  });

  it("ai_extract_json flags isError on unparseable model output", async () => {
    const { server } = makeServer({ response: "absolutely not json" });
    const tool = (
      getRegisteredTools(server)["ai_extract_json"] as {
        handler: (
          args: unknown,
          extra?: unknown
        ) => Promise<{ isError?: boolean }>;
      }
    ).handler;
    const result = await tool({
      text: "x",
      schema_description: "anything",
    });
    expect(result.isError).toBe(true);
  });
});
