// AI-powered MCP tools backed by Cloudflare Workers AI.
//
// Each tool composes one or more chat calls behind a stable, MCP-friendly
// interface. Inputs are Zod-validated with hard length caps; outputs use
// structured content where the shape is well-defined so clients can render
// results richly.
//
// Trust boundary: this server is publicly reachable. All raw model output is
// treated as untrusted. Errors are surfaced as generic messages; details are
// logged server-side, never echoed to the public MCP response.

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { parseLimit, reserveAiCall } from "./budget.js";
import {
  type Bindings,
  type ChatMessage,
  runChat,
  safeParseJson,
} from "./client.js";
import { MODEL_KEYS } from "./models.js";

const DEFAULT_DAILY_LIMIT = 80;

// Hard caps on user-controlled input lengths. Prevent quota-drain DoS on the
// public unauthenticated endpoint and keep prompts within the default model's
// token budget.
const MAX_QUESTION = 4_000;
const MAX_TEXT = 32_000;
const MAX_SYSTEM = 4_000;
const MAX_LANGUAGE = 64;
const MAX_LABEL = 64;
const MAX_LABELS = 20;
const MAX_SCHEMA_DESCRIPTION = 2_000;
const MAX_STYLE = 200;

const modelArg = z
  .enum(MODEL_KEYS)
  .optional()
  .describe(
    "Workers AI model. Default: llama-3.1-8b. Pick llama-3.3-70b for harder reasoning, qwen-32b-coder for code, gemma-7b for an alternative 7B-class model. See models.ts for the canonical list."
  );

export function registerAiTools(server: McpServer, env: Bindings): void {
  if (!env.AI || typeof env.AI.run !== "function") {
    console.error(
      'Workers AI binding missing — AI tools will NOT be registered. Add `[ai]\\nbinding = "AI"` to wrangler.toml.'
    );
    return;
  }
  if (!env.AI_BUDGET) {
    console.warn(
      "AI_BUDGET KV namespace not bound — daily call gating is DISABLED. This is fine for local dev; in production it lets a single attacker exhaust the Workers AI free tier."
    );
  }
  registerAsk(server, env);
  registerSummarize(server, env);
  registerClassify(server, env);
  registerExtractJson(server, env);
  registerTranslate(server, env);
}

async function reserveOrDeny(
  env: Bindings
): Promise<
  | null
  | {
      content: Array<{ type: "text"; text: string }>;
      isError: true;
    }
> {
  const limit = parseLimit(env.MAX_AI_CALLS_PER_DAY, DEFAULT_DAILY_LIMIT);
  const reservation = await reserveAiCall(env.AI_BUDGET, limit);
  if (reservation.allowed) return null;
  console.warn("AI tool call denied: daily budget reached", reservation);
  return {
    content: [
      {
        type: "text",
        text: `AI tools are paused for today: daily budget of ${reservation.limit} calls has been reached on this server. Resets at 00:00 UTC.`,
      },
    ],
    isError: true,
  };
}

function registerAsk(server: McpServer, env: Bindings): void {
  server.tool(
    "ai_ask",
    "Ask a free-form question and get a natural-language answer from a small, fast LLM running on Cloudflare Workers AI. Use for general Q&A, brainstorming, or open-ended requests. Not for questions about Daniel — use `ask_about_daniel` for that.",
    {
      question: z
        .string()
        .min(1)
        .max(MAX_QUESTION)
        .describe("The question or instruction to send to the model."),
      system: z
        .string()
        .max(MAX_SYSTEM)
        .optional()
        .describe("Optional system prompt to steer the model's tone or behavior."),
      model: modelArg,
    },
    async ({ question, system, model }) => {
      const denied = await reserveOrDeny(env);
      if (denied) return denied;
      const messages: ChatMessage[] = [];
      if (system) messages.push({ role: "system", content: system });
      messages.push({ role: "user", content: question });
      try {
        const answer = await runChat(env.AI, messages, { model });
        return { content: [{ type: "text" as const, text: answer }] };
      } catch (err) {
        return aiErrorResult("ai_ask", err);
      }
    }
  );
}

function registerSummarize(server: McpServer, env: Bindings): void {
  const lengthMap = {
    short: "1–2 sentences",
    medium: "3–5 sentences",
    long: "around a paragraph",
  } as const;

  server.tool(
    "ai_summarize",
    "Summarize a piece of text. Defaults to a medium-length summary (3–5 sentences). Tune length via `length`; tune voice via `style` (e.g. 'bullet points', 'tweet-length', 'executive summary'). Best for distilling long inputs into a readable abstract.",
    {
      text: z.string().min(1).max(MAX_TEXT).describe("The text to summarize."),
      length: z
        .enum(["short", "medium", "long"])
        .optional()
        .default("medium")
        .describe("Target length of the summary."),
      style: z
        .string()
        .max(MAX_STYLE)
        .optional()
        .describe("Optional style hint, e.g. 'bullet points', 'one paragraph', 'tweet-length'."),
      model: modelArg,
    },
    async ({ text, length, style, model }) => {
      const denied = await reserveOrDeny(env);
      if (denied) return denied;
      // Belt-and-suspenders: Zod's `.default("medium")` populates `length`
      // when callers go through the SDK's tool-invocation pipeline, but
      // direct handler calls (tests, in-process integrations) bypass Zod.
      const lengthHint = lengthMap[length ?? "medium"];
      const styleHint = style ? ` Style: ${style}.` : "";
      try {
        const summary = await runChat(
          env.AI,
          [
            {
              role: "system",
              content: `You summarize text faithfully. Target length: ${lengthHint}.${styleHint} Do not invent facts or add information not present in the source.`,
            },
            { role: "user", content: text },
          ],
          { model }
        );
        return { content: [{ type: "text" as const, text: summary }] };
      } catch (err) {
        return aiErrorResult("ai_summarize", err);
      }
    }
  );
}

function registerClassify(server: McpServer, env: Bindings): void {
  server.tool(
    "ai_classify",
    "Classify input text into one of the labels you provide. Returns the picked label plus a one-sentence rationale, or an error result if the model picks a label outside the provided set or omits the rationale. Use for triage, sentiment, intent detection, or any closed-set categorization. `labels` must have ≥2 entries.",
    {
      text: z.string().min(1).max(MAX_TEXT).describe("The text to classify."),
      labels: z
        .array(z.string().min(1).max(MAX_LABEL))
        .min(2)
        .max(MAX_LABELS)
        .describe("Candidate labels. Must contain at least 2 distinct options."),
      model: modelArg,
    },
    async ({ text, labels, model }) => {
      const denied = await reserveOrDeny(env);
      if (denied) return denied;
      let raw: string;
      try {
        raw = await runChat(
          env.AI,
          [
            {
              role: "system",
              content:
                'You are a strict classifier. Output JSON only, no markdown, no commentary. Shape: {"label": <one of the provided labels, exact string>, "rationale": <one short sentence>}. Choose the single best label.',
            },
            {
              role: "user",
              content: `Labels: ${JSON.stringify(labels)}\n\nText:\n${text}`,
            },
          ],
          { model, json: true, temperature: 0 }
        );
      } catch (err) {
        return aiErrorResult("ai_classify", err);
      }
      const parsed = safeParseJson(raw);
      if (
        !parsed ||
        typeof parsed.label !== "string" ||
        !labels.includes(parsed.label) ||
        typeof parsed.rationale !== "string"
      ) {
        // Don't echo raw model output to the public caller — log it server-side.
        console.warn("ai_classify: model output failed validation", {
          rawPreview: raw.slice(0, 200),
        });
        return {
          content: [
            {
              type: "text" as const,
              text: "Classification failed: model output did not match the expected JSON shape or chose an out-of-set label.",
            },
          ],
          isError: true,
        };
      }
      const result = { label: parsed.label, rationale: parsed.rationale };
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result) }],
        structuredContent: result,
      };
    }
  );
}

function registerExtractJson(server: McpServer, env: Bindings): void {
  server.tool(
    "ai_extract_json",
    "Extract structured JSON (top-level object only — arrays/primitives are rejected) from unstructured text given a natural-language schema description. Returns parsed JSON or an error result if parsing or shape-matching fails. Best for turning emails, transcripts, or scraped pages into typed records. Note: callers must validate the shape themselves — `schemaDescription` is sent to the LLM as a prompt, not enforced.",
    {
      text: z.string().min(1).max(MAX_TEXT).describe("The unstructured input text."),
      schemaDescription: z
        .string()
        .min(1)
        .max(MAX_SCHEMA_DESCRIPTION)
        .describe(
          "Plain-English description of the expected JSON shape. Example: 'object with fields name (string), price_eur (number, may be null), tags (string array)'."
        ),
      model: modelArg,
    },
    async ({ text, schemaDescription, model }) => {
      const denied = await reserveOrDeny(env);
      if (denied) return denied;
      let raw: string;
      try {
        raw = await runChat(
          env.AI,
          [
            {
              role: "system",
              content: `You extract structured data. Output JSON only, no commentary, no markdown fences. Match this shape: ${schemaDescription}. If a field is missing, set it to null. If the input is unparseable for this schema, output {"error": "<brief reason>"}.`,
            },
            { role: "user", content: text },
          ],
          { model, json: true, temperature: 0 }
        );
      } catch (err) {
        return aiErrorResult("ai_extract_json", err);
      }
      const parsed = safeParseJson(raw);
      if (!parsed) {
        console.warn("ai_extract_json: model output not parseable as JSON object", {
          rawPreview: raw.slice(0, 200),
        });
        return {
          content: [
            {
              type: "text" as const,
              text: "Extraction failed: model output was not a valid JSON object.",
            },
          ],
          isError: true,
        };
      }
      // System prompt instructs the model to emit {"error": "..."} when the
      // input is unparseable. Detect that envelope so callers don't treat it
      // as valid extracted data.
      if (Object.keys(parsed).length === 1 && typeof parsed.error === "string") {
        return {
          content: [
            {
              type: "text" as const,
              text: `Extraction failed: ${parsed.error}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(parsed) }],
        structuredContent: parsed,
      };
    }
  );
}

function registerTranslate(server: McpServer, env: Bindings): void {
  server.tool(
    "ai_translate",
    "Translate text into the target language. Source language is auto-detected unless provided. The system prompt asks the model to preserve formatting, code blocks, and proper nouns — this is a model instruction, not a code-enforced guarantee.",
    {
      text: z.string().min(1).max(MAX_TEXT).describe("The text to translate."),
      targetLanguage: z
        .string()
        .min(2)
        .max(MAX_LANGUAGE)
        .describe(
          "Target language in plain English. Examples: 'Czech', 'Japanese', 'Brazilian Portuguese'."
        ),
      sourceLanguage: z
        .string()
        .min(2)
        .max(MAX_LANGUAGE)
        .optional()
        .describe("Source language in plain English. Omit to auto-detect."),
      model: modelArg,
    },
    async ({ text, targetLanguage, sourceLanguage, model }) => {
      const denied = await reserveOrDeny(env);
      if (denied) return denied;
      const sys = sourceLanguage
        ? `Translate from ${sourceLanguage} to ${targetLanguage}. Output the translation only — no commentary, no quotation marks. Preserve formatting, code blocks, and proper nouns.`
        : `Detect the source language and translate to ${targetLanguage}. Output the translation only — no commentary, no quotation marks. Preserve formatting, code blocks, and proper nouns.`;
      try {
        const out = await runChat(
          env.AI,
          [
            { role: "system", content: sys },
            { role: "user", content: text },
          ],
          { model }
        );
        return { content: [{ type: "text" as const, text: out }] };
      } catch (err) {
        return aiErrorResult("ai_translate", err);
      }
    }
  );
}

function aiErrorResult(
  toolName: string,
  err: unknown
): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  // Log details server-side. Never expose the underlying error message to the
  // public client — Workers AI errors include account state, request IDs, and
  // other internals that should not leak.
  const detail = err instanceof Error ? err.message : String(err);
  console.error(`${toolName}: Workers AI call failed`, { error: detail });
  return {
    content: [
      {
        type: "text",
        text: "AI call failed. Try again, or pick a different model.",
      },
    ],
    isError: true,
  };
}
