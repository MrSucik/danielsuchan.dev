#!/usr/bin/env tsx
/**
 * One-shot backfill of the danielsuchan-archive Vectorize index.
 *
 * Reads source JSON files committed to packages/mcp/src/ (the same files the
 * Worker bundles) and upserts each entry as a vector with metadata.
 *
 * Vectorize bindings only work inside a deployed Worker, so this script uses
 * the Cloudflare REST API directly:
 *   - POST /accounts/{id}/ai/run/{model}              for embeddings
 *   - POST /accounts/{id}/vectorize/v2/indexes/{name}/upsert (NDJSON body)
 *
 * Required env vars:
 *   CLOUDFLARE_ACCOUNT_ID  — same one used by wrangler
 *   CLOUDFLARE_API_TOKEN   — needs Workers AI:Read + Vectorize:Edit
 *
 * Run with:
 *   pnpm --filter @danielsuchan/mcp exec tsx scripts/backfill-vectorize.ts
 *
 * Re-running is safe — Vectorize upsert is idempotent on the `id` field.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

const INDEX_NAME = "danielsuchan-archive";
const EMBEDDING_MODEL = "@cf/baai/bge-small-en-v1.5";
const SITE = "https://danielsuchan.dev";

type Vector = {
  id: string;
  values: number[];
  metadata: Record<string, string>;
};

type Source = "changelog" | "bug" | "writing" | "case-study" | "lab";

async function main(): Promise<void> {
  const accountId = requireEnv("CLOUDFLARE_ACCOUNT_ID");
  const apiToken = requireEnv("CLOUDFLARE_API_TOKEN");

  const documents = collectDocuments();
  console.log(`Backfilling ${documents.length} documents → ${INDEX_NAME}`);

  // Embed in batches of 50 (CF Workers AI accepts batched text).
  const vectors: Vector[] = [];
  const BATCH_SIZE = 50;
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);
    const embeddings = await embed(
      accountId,
      apiToken,
      batch.map((d) => d.text)
    );
    for (let j = 0; j < batch.length; j++) {
      vectors.push({
        id: batch[j].id,
        values: embeddings[j],
        metadata: batch[j].metadata,
      });
    }
    console.log(`  embedded ${vectors.length}/${documents.length}`);
  }

  await upsert(accountId, apiToken, vectors);
  console.log(`Upserted ${vectors.length} vectors into ${INDEX_NAME}.`);
}

type Doc = {
  id: string;
  text: string;
  metadata: Record<string, string>;
};

function collectDocuments(): Doc[] {
  const docs: Doc[] = [];

  // CHANGELOG — one vector per (date, project, item)
  const changelog = readJson<{
    entries?: Array<{
      date?: string;
      project?: string;
      items?: string[];
    }>;
  }>("changelog.json");
  for (const entry of changelog.entries ?? []) {
    if (!entry.date) continue;
    const items = entry.items ?? [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      docs.push({
        id: `changelog:${entry.date}:${entry.project ?? "unknown"}:${i}`,
        text: `${entry.project ?? "project"} — ${item}`,
        metadata: {
          source: "changelog",
          title: `${entry.project ?? "Project"} (${entry.date})`,
          snippet: trimTo(item, 240),
          url: `${SITE}/changelog`,
          date: entry.date,
        },
      });
    }
  }

  // BUG-FIXES — one vector per fix
  const bugs = readJson<{
    fixes?: Array<{
      date?: string;
      project?: string;
      title?: string;
      symptom?: string;
      rootCause?: string;
      fix?: string;
      impact?: string;
      commit?: string;
    }>;
  }>("bug-fixes.json");
  for (const fix of bugs.fixes ?? []) {
    if (!fix.title || !fix.date) continue;
    const text = [fix.title, fix.symptom, fix.rootCause, fix.fix, fix.impact]
      .filter((v): v is string => Boolean(v))
      .join(" — ");
    docs.push({
      id: `bug:${fix.date}:${fix.commit ?? slug(fix.title)}`,
      text,
      metadata: {
        source: "bug",
        title: fix.title,
        snippet: trimTo(fix.symptom ?? text, 240),
        url: `${SITE}/bugs`,
        date: fix.date,
      },
    });
  }

  // WRITING — one vector per post
  const writing = readJson<{
    posts?: Array<{
      slug?: string;
      title?: string;
      teaser?: string;
      date?: string;
      body?: string;
    }>;
  }>("writing.json");
  for (const post of writing.posts ?? []) {
    if (!post.slug || !post.title) continue;
    const text = [post.title, post.teaser, post.body]
      .filter((v): v is string => Boolean(v))
      .join(" — ");
    docs.push({
      id: `writing:${post.slug}`,
      text: trimTo(text, 4000),
      metadata: {
        source: "writing",
        title: post.title,
        snippet: trimTo(post.teaser ?? text, 240),
        url: `${SITE}/writing/${post.slug}`,
        date: post.date ?? "",
      },
    });
  }

  // CASE-STUDIES — one vector per study (concatenate all section bodies)
  const caseStudies = readJson<{
    studies?: Array<{
      slug?: string;
      title?: string;
      teaser?: string;
      sections?: Array<{ heading?: string; body?: string }>;
    }>;
  }>("case-studies.json");
  for (const study of caseStudies.studies ?? []) {
    if (!study.slug || !study.title) continue;
    const sectionText = (study.sections ?? [])
      .map((s) => `${s.heading ?? ""} ${s.body ?? ""}`)
      .join(" ");
    const text = `${study.title} — ${study.teaser ?? ""} — ${sectionText}`;
    docs.push({
      id: `case-study:${study.slug}`,
      text: trimTo(text, 4000),
      metadata: {
        source: "case-study",
        title: study.title,
        snippet: trimTo(study.teaser ?? text, 240),
        url: `${SITE}/case-studies/${study.slug}`,
        date: "",
      },
    });
  }

  // LABS — one vector per demo
  const labs = readJson<{
    labs?: Array<{
      slug?: string;
      title?: string;
      url?: string;
      description?: string;
    }>;
  }>("labs.json");
  for (const lab of labs.labs ?? []) {
    if (!lab.slug || !lab.title) continue;
    const text = `${lab.title} — ${lab.description ?? ""}`;
    docs.push({
      id: `lab:${lab.slug}`,
      text,
      metadata: {
        source: "lab",
        title: lab.title,
        snippet: trimTo(lab.description ?? text, 240),
        url: lab.url ?? `${SITE}/labs/${lab.slug}`,
        date: "",
      },
    });
  }

  return docs;
}

async function embed(
  accountId: string,
  apiToken: string,
  texts: string[]
): Promise<number[][]> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${EMBEDDING_MODEL}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: texts }),
  });
  if (!res.ok) {
    throw new Error(
      `Workers AI embed failed (${res.status}): ${await res.text()}`
    );
  }
  const json = (await res.json()) as {
    success?: boolean;
    result?: { data?: number[][] };
    errors?: unknown;
  };
  if (!json.success || !json.result?.data) {
    throw new Error(
      `Workers AI embed unexpected response: ${JSON.stringify(json).slice(0, 400)}`
    );
  }
  return json.result.data;
}

async function upsert(
  accountId: string,
  apiToken: string,
  vectors: Vector[]
): Promise<void> {
  // Vectorize v2 expects NDJSON (one JSON object per line).
  const ndjson = vectors.map((v) => JSON.stringify(v)).join("\n");
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/vectorize/v2/indexes/${INDEX_NAME}/upsert`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/x-ndjson",
    },
    body: ndjson,
  });
  if (!res.ok) {
    throw new Error(
      `Vectorize upsert failed (${res.status}): ${await res.text()}`
    );
  }
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(SRC, file), "utf-8")) as T;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

function trimTo(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
