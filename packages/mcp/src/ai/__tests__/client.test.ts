import { describe, expect, it, vi } from "vitest";
import { type AIBinding, runChat, safeParseJson } from "../client.js";

function ai(response: unknown): AIBinding {
  return { run: vi.fn().mockResolvedValue(response) };
}

describe("runChat", () => {
  it("returns the response string from object responses", async () => {
    const out = await runChat(ai({ response: "hello" }), [
      { role: "user", content: "hi" },
    ]);
    expect(out).toBe("hello");
  });

  it("handles plain string responses", async () => {
    const out = await runChat(ai("hello"), [{ role: "user", content: "hi" }]);
    expect(out).toBe("hello");
  });

  it("throws on unexpected shape", async () => {
    await expect(
      runChat(ai({ unexpected: true }), [{ role: "user", content: "hi" }])
    ).rejects.toThrow(/Unexpected Workers AI response/);
  });

  it("forwards model + json + temperature options to the binding", async () => {
    const run = vi.fn().mockResolvedValue({ response: "ok" });
    const binding: AIBinding = { run };
    await runChat(binding, [{ role: "user", content: "hi" }], {
      model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      json: true,
      temperature: 0,
      maxTokens: 100,
    });
    expect(run).toHaveBeenCalledWith(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      expect.objectContaining({
        max_tokens: 100,
        temperature: 0,
        response_format: { type: "json_object" },
      })
    );
  });

  it("omits response_format when json is false", async () => {
    const run = vi.fn().mockResolvedValue({ response: "ok" });
    await runChat({ run }, [{ role: "user", content: "hi" }]);
    const inputs = run.mock.calls[0][1] as Record<string, unknown>;
    expect(inputs).not.toHaveProperty("response_format");
  });
});

describe("safeParseJson", () => {
  it("parses plain JSON", () => {
    expect(safeParseJson('{"a": 1}')).toEqual({ a: 1 });
  });

  it("strips ```json fences", () => {
    expect(safeParseJson('```json\n{"a": 1}\n```')).toEqual({ a: 1 });
  });

  it("strips bare ``` fences", () => {
    expect(safeParseJson('```\n{"a": 1}\n```')).toEqual({ a: 1 });
  });

  it("returns null on invalid JSON", () => {
    expect(safeParseJson("not json")).toBeNull();
  });

  it("returns null on JSON arrays (we only accept objects)", () => {
    expect(safeParseJson("[1, 2, 3]")).toBeNull();
  });

  it("returns null on JSON null/primitives", () => {
    expect(safeParseJson("null")).toBeNull();
    expect(safeParseJson("42")).toBeNull();
    expect(safeParseJson('"hi"')).toBeNull();
  });
});
