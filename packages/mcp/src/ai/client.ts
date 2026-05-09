// Thin wrapper around Cloudflare Workers AI for chat-style calls.
// Kept provider-agnostic via the `AIBinding` interface so the same tools could
// later target Ollama, Workers AI Gateway, or another backend with one swap.

import type { ModelId } from "./models.js";

// Subset of the Workers AI binding we actually use. Duck-typed so tests can
// supply a minimal mock without pulling in @cloudflare/workers-types.
export type AIBinding = {
  run: (model: string, inputs: unknown, options?: unknown) => Promise<unknown>;
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatOptions = {
  model?: ModelId;
  maxTokens?: number;
  temperature?: number;
  json?: boolean;
};

export async function runChat(
  ai: AIBinding,
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const {
    model = "@cf/meta/llama-3.1-8b-instruct",
    maxTokens = 1024,
    temperature = 0.2,
    json = false,
  } = options;

  const inputs: Record<string, unknown> = {
    messages,
    max_tokens: maxTokens,
    temperature,
  };
  if (json) {
    inputs.response_format = { type: "json_object" };
  }

  const raw = await ai.run(model, inputs);
  return extractText(raw);
}

function extractText(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "response" in raw) {
    const r = (raw as { response: unknown }).response;
    if (typeof r === "string") return r;
  }
  throw new Error(
    `Unexpected Workers AI response shape: ${JSON.stringify(raw).slice(0, 200)}`
  );
}

// Strips ```json fences the model occasionally adds despite system instructions,
// then JSON.parses. Returns null on any failure so callers can decide what to do.
export function safeParseJson(raw: string): Record<string, unknown> | null {
  const stripped = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "");
  try {
    const parsed: unknown = JSON.parse(stripped);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
