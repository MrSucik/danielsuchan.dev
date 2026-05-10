// Semantic-search MCP tool. Embeds the query via Workers AI, queries the
// danielsuchan-archive Vectorize index, and returns top-k matches with their
// metadata (source, slug, title, snippet, url).
//
// Index population is one-shot via scripts/backfill-vectorize.ts. The Worker
// only does query, never upsert — keeps the public surface read-only.

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type {
  AIBinding,
  VectorizeBinding,
  VectorizeMatch,
} from "./ai/client.js";

export const EMBEDDING_MODEL = "@cf/baai/bge-small-en-v1.5";

const SOURCE_VALUES = [
  "all",
  "changelog",
  "bug",
  "writing",
  "case-study",
  "lab",
] as const;
export type SearchSource = (typeof SOURCE_VALUES)[number];

export type SearchEnv = {
  AI?: AIBinding;
  VECTORIZE?: VectorizeBinding;
};

export type SearchHit = {
  id: string;
  score: number;
  source: string;
  title: string;
  snippet: string;
  url: string | null;
  date: string | null;
};

const NOT_CONFIGURED_MESSAGE =
  "Semantic search is not available on this server (Vectorize binding missing).";

const EMBED_FAILED_MESSAGE =
  "Could not embed the query. Try a shorter or simpler search string.";

const QUERY_FAILED_MESSAGE =
  "Search backend returned an unexpected response shape.";

export async function searchArchive(
  env: SearchEnv,
  query: string,
  limit: number,
  source: SearchSource
): Promise<{ hits: SearchHit[] } | { error: string }> {
  if (!env.AI || !env.VECTORIZE) {
    return { error: NOT_CONFIGURED_MESSAGE };
  }

  let embedding: number[];
  try {
    embedding = await embedQuery(env.AI, query);
  } catch (err) {
    console.error("search_archive: embed failed", err);
    return { error: EMBED_FAILED_MESSAGE };
  }

  let matches: VectorizeMatch[];
  try {
    const result = await env.VECTORIZE.query(embedding, {
      topK: limit,
      returnMetadata: "all",
      filter: source === "all" ? undefined : { source: { $eq: source } },
    });
    matches = result.matches;
  } catch (err) {
    console.error("search_archive: vectorize query failed", err);
    return { error: QUERY_FAILED_MESSAGE };
  }

  return { hits: matches.map(toHit) };
}

async function embedQuery(ai: AIBinding, query: string): Promise<number[]> {
  const raw = await ai.run(EMBEDDING_MODEL, { text: [query] });
  return extractEmbedding(raw);
}

// Workers AI returns { shape: [n, dims], data: [[...]], pooling?: "mean" }
// for embedding models. Tolerant of minor shape drift between models.
export function extractEmbedding(raw: unknown): number[] {
  if (!raw || typeof raw !== "object") {
    throw new Error(QUERY_FAILED_MESSAGE);
  }
  const obj = raw as { data?: unknown };
  const data = obj.data;
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(QUERY_FAILED_MESSAGE);
  }
  const first = data[0];
  if (!Array.isArray(first) || first.length === 0) {
    throw new Error(QUERY_FAILED_MESSAGE);
  }
  if (!first.every((v: unknown) => typeof v === "number")) {
    throw new Error(QUERY_FAILED_MESSAGE);
  }
  return first as number[];
}

function toHit(match: VectorizeMatch): SearchHit {
  const md = (match.metadata ?? {}) as Record<string, unknown>;
  return {
    id: match.id,
    score: round(match.score, 4),
    source: stringOr(md.source, "unknown"),
    title: stringOr(md.title, ""),
    snippet: stringOr(md.snippet, ""),
    url: stringOrNull(md.url),
    date: stringOrNull(md.date),
  };
}

function stringOr(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function stringOrNull(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function round(n: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}

export function registerSearchArchive(
  server: McpServer,
  env: SearchEnv
): void {
  server.tool(
    "search_archive",
    "Semantic search across Daniel's public archive — changelog (194 days), bugs (production fix log), writing (blog posts), case-studies (long-form architecture), labs (interactive demos). Returns top-k matches with source, title, date, snippet, and URL. Use when get_recent_shipments / get_bug_fixes / get_writing return too much or you want cross-source results for a specific concept.",
    {
      query: z
        .string()
        .min(1)
        .max(500)
        .describe("Free-form search string. Concepts work better than keywords."),
      limit: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(5)
        .describe("Max matches to return (1-20, default 5)."),
      source: z
        .enum(SOURCE_VALUES)
        .default("all")
        .describe(
          "Restrict to one source domain. 'all' searches across every domain."
        ),
    },
    async ({ query, limit, source }) => {
      const result = await searchArchive(env, query, limit, source);
      if ("error" in result) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: result.error }],
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                query,
                source,
                hits: result.hits,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
