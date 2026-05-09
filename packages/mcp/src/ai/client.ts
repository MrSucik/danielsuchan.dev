// Thin wrapper around Cloudflare Workers AI for chat-style calls.
// Kept provider-agnostic via the `AIBinding` interface so the same tools could
// later target Ollama, Workers AI Gateway, or another backend with one swap.

import type { BudgetStore } from "./budget.js";
import { type ModelKey, resolveModel } from "./models.js";

// Subset of the Workers AI binding we actually use. Duck-typed so tests can
// supply a minimal mock without pulling in @cloudflare/workers-types.
export type AIBinding = {
  run: (model: string, inputs: unknown, options?: unknown) => Promise<unknown>;
};

// Worker bindings shape. Colocated here so index.ts and tools.ts can
// import a single source of truth.
//
// AI_BUDGET and MAX_AI_CALLS_PER_DAY are optional at the type level so tests
// and local dev don't need to provide them — the budget guard treats a
// missing KV namespace as "no gating" and logs a warning at startup.
export type Bindings = {
  AI: AIBinding;
  AI_BUDGET?: BudgetStore;
  MAX_AI_CALLS_PER_DAY?: string;
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatOptions = {
  model?: ModelKey;
  maxTokens?: number;
  temperature?: number;
  json?: boolean;
  /** Wall-clock timeout in ms. Defaults to 30s. */
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 30_000;

export async function runChat(
  ai: AIBinding,
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const {
    model,
    // Tighter than the SDK default to keep per-call neuron cost low. Tools
    // can override per-call when they legitimately need longer output.
    maxTokens = 512,
    temperature = 0.2,
    json = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const inputs: Record<string, unknown> = {
    messages,
    max_tokens: maxTokens,
    temperature,
  };
  if (json) {
    inputs.response_format = { type: "json_object" };
  }

  const raw = await withTimeout(ai.run(resolveModel(model), inputs), timeoutMs);
  return extractText(raw);
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Workers AI request timed out after ${ms}ms`)),
      ms
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function extractText(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "response" in raw) {
    const r = (raw as { response: unknown }).response;
    if (typeof r === "string") return r;
  }
  // Log shape server-side; never leak the raw payload to a public caller.
  console.error("Workers AI: unexpected response shape", {
    rawType: typeof raw,
    isObject: raw !== null && typeof raw === "object",
  });
  throw new Error("Workers AI returned an unexpected response shape.");
}

/**
 * Strips ```json fences the model occasionally adds despite system instructions,
 * then JSON.parses. Returns null on any failure or if the parsed value isn't a
 * plain object (arrays / primitives are rejected). Reasons are logged
 * server-side so operators can diagnose without leaking model output to clients.
 */
export function safeParseJson(raw: string): Record<string, unknown> | null {
  const stripped = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch (err) {
    console.warn("safeParseJson: JSON.parse failed", {
      error: err instanceof Error ? err.message : String(err),
      preview: stripped.slice(0, 120),
    });
    return null;
  }
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return parsed as Record<string, unknown>;
  }
  console.warn("safeParseJson: parsed value is not a plain object", {
    type: typeof parsed,
    isArray: Array.isArray(parsed),
  });
  return null;
}
