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
  /** Wall-clock timeout in ms. Defaults to 30s. */
  timeoutMs?: number;
};

// NOTE: We intentionally don't set Workers AI's `response_format` field.
// As of 2026, Workers AI only accepts `{type: "json_schema", json_schema: {...}}`
// with a concrete schema — the OpenAI-style `{type: "json_object"}` returns
// `9015: invalid prompt: unknown variant 'json_object'`. Tools that need
// JSON output rely on system-prompt instructions + safeParseJson + low
// temperature, which is reliable enough for the small set we ship.

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
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const inputs: Record<string, unknown> = {
    messages,
    max_tokens: maxTokens,
    temperature,
  };

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
 * Best-effort JSON object extraction from raw model output. Tries in order:
 *   1. Strip optional ```json / ``` fences and parse the whole string
 *   2. Find the first balanced `{...}` substring and parse that
 * Returns null if neither yields a plain object (arrays / primitives rejected).
 * Reasons are logged server-side so operators can diagnose without leaking
 * model output to public clients.
 */
export function safeParseJson(raw: string): Record<string, unknown> | null {
  const stripped = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "");
  const fromStripped = tryParseObject(stripped);
  if (fromStripped) return fromStripped;
  const fromBraces = extractBalancedObject(stripped);
  if (fromBraces) {
    const fromBracesParsed = tryParseObject(fromBraces);
    if (fromBracesParsed) return fromBracesParsed;
  }
  console.warn("safeParseJson: no JSON object found", {
    preview: stripped.slice(0, 120),
  });
  return null;
}

function tryParseObject(s: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(s);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

// Scans for the first `{...}` whose braces balance, ignoring braces inside
// string literals. Cheap enough for Worker CPU budget on the inputs we accept.
function extractBalancedObject(s: string): string | null {
  const start = s.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\") {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}
