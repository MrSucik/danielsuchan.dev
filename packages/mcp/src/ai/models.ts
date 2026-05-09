// Curated registry of Cloudflare Workers AI models surfaced by this server.
// Cheap-first: the default is the smallest competent model. Callers can override
// per-call via the `model` parameter on any AI tool.

export const MODELS = {
  "llama-3.1-8b": "@cf/meta/llama-3.1-8b-instruct",
  "llama-3.3-70b": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "qwen-32b-coder": "@cf/qwen/qwen2.5-coder-32b-instruct",
  "gemma-7b": "@cf/google/gemma-7b-it",
} as const;

export type ModelKey = keyof typeof MODELS;
export type ModelId = (typeof MODELS)[ModelKey];

export const DEFAULT_MODEL: ModelId = MODELS["llama-3.1-8b"];

export const MODEL_KEYS = Object.keys(MODELS) as [ModelKey, ...ModelKey[]];

export function resolveModel(key?: ModelKey): ModelId {
  return key ? MODELS[key] : DEFAULT_MODEL;
}
