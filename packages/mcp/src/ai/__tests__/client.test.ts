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

  it("throws a sanitized error on unexpected shape", async () => {
    await expect(
      runChat(ai({ unexpected: true }), [{ role: "user", content: "hi" }])
    ).rejects.toThrow(/unexpected response shape/);
  });

  it("throws on null response", async () => {
    await expect(
      runChat(ai(null), [{ role: "user", content: "hi" }])
    ).rejects.toThrow(/unexpected response shape/);
  });

  it("throws on non-string `response` field", async () => {
    await expect(
      runChat(ai({ response: 123 }), [{ role: "user", content: "hi" }])
    ).rejects.toThrow(/unexpected response shape/);
  });

  it("does not leak the raw payload in the thrown message", async () => {
    const secret = "cf-account-internals-trace-id-XYZ";
    try {
      await runChat(ai({ secret }), [{ role: "user", content: "hi" }]);
      throw new Error("expected runChat to throw");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message).not.toContain(secret);
    }
  });

  it("resolves model alias keys to the full Workers AI model id", async () => {
    const run = vi.fn().mockResolvedValue({ response: "ok" });
    await runChat({ run }, [{ role: "user", content: "hi" }], {
      model: "llama-3.3-70b",
    });
    expect(run).toHaveBeenCalledWith(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      expect.any(Object)
    );
  });

  it("uses llama-3.1-8b as the default when model is omitted", async () => {
    const run = vi.fn().mockResolvedValue({ response: "ok" });
    await runChat({ run }, [{ role: "user", content: "hi" }]);
    expect(run).toHaveBeenCalledWith(
      "@cf/meta/llama-3.1-8b-instruct",
      expect.any(Object)
    );
  });

  it("forwards json + temperature options to the binding", async () => {
    const run = vi.fn().mockResolvedValue({ response: "ok" });
    await runChat({ run }, [{ role: "user", content: "hi" }], {
      json: true,
      temperature: 0,
      maxTokens: 100,
    });
    expect(run).toHaveBeenCalledWith(
      expect.any(String),
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

  it("times out a stuck binding call", async () => {
    const stuck: AIBinding = { run: vi.fn(() => new Promise(() => {})) };
    await expect(
      runChat(stuck, [{ role: "user", content: "hi" }], { timeoutMs: 25 })
    ).rejects.toThrow(/timed out/);
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

  it("returns null on trailing-comma JSON (we don't tolerate JSON5)", () => {
    expect(safeParseJson('{"a": 1,}')).toBeNull();
  });
});
