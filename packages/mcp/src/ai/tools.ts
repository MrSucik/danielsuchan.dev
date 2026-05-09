// AI-powered MCP tools backed by Cloudflare Workers AI.
//
// Each tool composes one or more chat calls behind a stable, MCP-friendly
// interface. Inputs are Zod-validated; outputs use structured content where
// the shape is well-defined so clients can render results richly.

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { type AIBinding, runChat, safeParseJson } from "./client.js";
import { MODEL_KEYS, type ModelKey, resolveModel } from "./models.js";

type Env = { AI: AIBinding };

const modelArg = z
  .enum(MODEL_KEYS)
  .optional()
  .describe(
    "Workers AI model. Default: llama-3.1-8b (cheap, fast). Pick llama-3.3-70b for harder reasoning, qwen-32b-coder for code, gemma-7b for fastest."
  );

export function registerAiTools(server: McpServer, env: Env): void {
  registerAsk(server, env);
  registerSummarize(server, env);
  registerClassify(server, env);
  registerExtractJson(server, env);
  registerTranslate(server, env);
}

function registerAsk(server: McpServer, env: Env): void {
  server.tool(
    "ai_ask",
    "Ask a free-form question and get a natural-language answer from a small, fast LLM running on Cloudflare Workers AI. Use for general Q&A, brainstorming, or open-ended requests that don't fit the more specialized AI tools.",
    {
      question: z
        .string()
        .min(1)
        .describe("The question or instruction to send to the model."),
      system: z
        .string()
        .optional()
        .describe("Optional system prompt to steer the model's tone or behavior."),
      model: modelArg,
    },
    async ({ question, system, model }) => {
      const messages: Array<{ role: "system" | "user"; content: string }> = [];
      if (system) messages.push({ role: "system", content: system });
      messages.push({ role: "user", content: question });
      const answer = await runChat(env.AI, messages, { model: resolveModel(model as ModelKey | undefined) });
      return { content: [{ type: "text" as const, text: answer }] };
    }
  );
}

function registerSummarize(server: McpServer, env: Env): void {
  const lengthMap = {
    short: "1–2 sentences",
    medium: "3–5 sentences",
    long: "around a paragraph",
  } as const;

  server.tool(
    "ai_summarize",
    "Summarize a piece of text. Defaults to a medium-length summary (3–5 sentences). Tune length via `length`; tune voice via `style` (e.g. 'bullet points', 'tweet-length', 'executive summary'). Best for distilling long inputs into a readable abstract.",
    {
      text: z.string().min(1).describe("The text to summarize."),
      length: z
        .enum(["short", "medium", "long"])
        .optional()
        .default("medium")
        .describe("Target length of the summary."),
      style: z
        .string()
        .optional()
        .describe("Optional style hint, e.g. 'bullet points', 'one paragraph', 'tweet-length'."),
      model: modelArg,
    },
    async ({ text, length, style, model }) => {
      const lengthHint = lengthMap[length ?? "medium"];
      const styleHint = style ? ` Style: ${style}.` : "";
      const summary = await runChat(
        env.AI,
        [
          {
            role: "system",
            content: `You summarize text faithfully. Target length: ${lengthHint}.${styleHint} Do not invent facts or add information not present in the source.`,
          },
          { role: "user", content: text },
        ],
        { model: resolveModel(model as ModelKey | undefined) }
      );
      return { content: [{ type: "text" as const, text: summary }] };
    }
  );
}

function registerClassify(server: McpServer, env: Env): void {
  server.tool(
    "ai_classify",
    "Classify input text into one of the labels you provide. Returns the picked label plus a one-sentence rationale. Use for triage, sentiment, intent detection, or any closed-set categorization.",
    {
      text: z.string().min(1).describe("The text to classify."),
      labels: z
        .array(z.string().min(1))
        .min(2)
        .describe("Candidate labels. Must contain at least 2 distinct options."),
      model: modelArg,
    },
    async ({ text, labels, model }) => {
      const raw = await runChat(
        env.AI,
        [
          {
            role: "system",
            content: `You are a strict classifier. Output JSON only, no markdown, no commentary. Shape: {"label": <one of the provided labels, exact string>, "rationale": <one short sentence>}. Choose the single best label.`,
          },
          {
            role: "user",
            content: `Labels: ${JSON.stringify(labels)}\n\nText:\n${text}`,
          },
        ],
        { model: resolveModel(model as ModelKey | undefined), json: true, temperature: 0 }
      );
      const parsed = safeParseJson(raw);
      if (
        !parsed ||
        typeof parsed.label !== "string" ||
        !labels.includes(parsed.label)
      ) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Classification failed. Raw model output:\n${raw}`,
            },
          ],
          isError: true,
        };
      }
      const result = {
        label: parsed.label,
        rationale: typeof parsed.rationale === "string" ? parsed.rationale : "",
      };
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result) }],
        structuredContent: result,
      };
    }
  );
}

function registerExtractJson(server: McpServer, env: Env): void {
  server.tool(
    "ai_extract_json",
    "Extract structured JSON from unstructured text given a natural-language schema description. Returns parsed JSON, or an error result if parsing fails. Best for turning emails, transcripts, or scraped pages into typed records.",
    {
      text: z.string().min(1).describe("The unstructured input text."),
      schema_description: z
        .string()
        .min(1)
        .describe(
          "Plain-English description of the expected JSON shape. Example: 'object with fields name (string), price_eur (number, may be null), tags (string array)'."
        ),
      model: modelArg,
    },
    async ({ text, schema_description, model }) => {
      const raw = await runChat(
        env.AI,
        [
          {
            role: "system",
            content: `You extract structured data. Output JSON only, no commentary, no markdown fences. Match this shape: ${schema_description}. If a field is missing, set it to null. If the input is unparseable for this schema, output {"error": "<brief reason>"}.`,
          },
          { role: "user", content: text },
        ],
        { model: resolveModel(model as ModelKey | undefined), json: true, temperature: 0 }
      );
      const parsed = safeParseJson(raw);
      if (!parsed) {
        return {
          content: [
            {
              type: "text" as const,
              text: `JSON extraction failed. Raw model output:\n${raw}`,
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

function registerTranslate(server: McpServer, env: Env): void {
  server.tool(
    "ai_translate",
    "Translate text into the target language. Source language is auto-detected unless provided. Preserves formatting, code, and proper nouns by default.",
    {
      text: z.string().min(1).describe("The text to translate."),
      target_language: z
        .string()
        .min(2)
        .describe(
          "Target language in plain English. Examples: 'Czech', 'Japanese', 'Brazilian Portuguese'."
        ),
      source_language: z
        .string()
        .optional()
        .describe("Source language in plain English. Omit to auto-detect."),
      model: modelArg,
    },
    async ({ text, target_language, source_language, model }) => {
      const sys = source_language
        ? `Translate from ${source_language} to ${target_language}. Output the translation only — no commentary, no quotation marks. Preserve formatting, code blocks, and proper nouns.`
        : `Detect the source language and translate to ${target_language}. Output the translation only — no commentary, no quotation marks. Preserve formatting, code blocks, and proper nouns.`;
      const out = await runChat(
        env.AI,
        [
          { role: "system", content: sys },
          { role: "user", content: text },
        ],
        { model: resolveModel(model as ModelKey | undefined) }
      );
      return { content: [{ type: "text" as const, text: out }] };
    }
  );
}
