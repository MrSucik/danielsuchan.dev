// Worker-side Vectorize backfill. Triggered by POST /admin/backfill with a
// shared secret. Reads the same bundled JSON the rest of the Worker uses,
// embeds via env.AI, and upserts via env.VECTORIZE — no external API token
// needed because both bindings are already wired in production.

import bugFixesJson from "./bug-fixes.json" with { type: "json" };
import caseStudiesJson from "./case-studies.json" with { type: "json" };
import changelogJson from "./changelog.json" with { type: "json" };
import labsJson from "./labs.json" with { type: "json" };
import writingJson from "./writing.json" with { type: "json" };
import type { AIBinding, VectorizeBinding } from "./ai/client.js";
import { EMBEDDING_MODEL } from "./search.js";

const SITE = "https://danielsuchan.dev";
const BATCH_SIZE = 50;

type Doc = {
  id: string;
  text: string;
  metadata: Record<string, string>;
};

type EmbedFn = (texts: string[]) => Promise<number[][]>;
type UpsertFn = (
  vectors: Array<{
    id: string;
    values: number[];
    metadata: Record<string, string>;
  }>
) => Promise<void>;

export type BackfillResult = {
  ok: true;
  count: number;
  bySource: Record<string, number>;
};

export async function runBackfill(
  embed: EmbedFn,
  upsert: UpsertFn
): Promise<BackfillResult> {
  const docs = collectDocuments();
  const bySource: Record<string, number> = {};

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    const embeddings = await embed(batch.map((d) => d.text));
    const vectors = batch.map((d, idx) => ({
      id: d.id,
      values: embeddings[idx],
      metadata: d.metadata,
    }));
    await upsert(vectors);
    for (const d of batch) {
      const source = d.metadata.source ?? "unknown";
      bySource[source] = (bySource[source] ?? 0) + 1;
    }
  }

  return { ok: true, count: docs.length, bySource };
}

export function collectDocuments(): Doc[] {
  const docs: Doc[] = [];

  type Shipment = { project?: string; bullets?: string[] };
  type ChangelogEntry = { date?: string; shipments?: Shipment[] };
  for (const entry of (changelogJson as { entries?: ChangelogEntry[] }).entries ?? []) {
    if (!entry.date) continue;
    for (const ship of entry.shipments ?? []) {
      const bullets = ship.bullets ?? [];
      for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        if (!bullet) continue;
        docs.push({
          id: `changelog:${entry.date}:${ship.project ?? "unknown"}:${i}`,
          text: `${ship.project ?? "project"} — ${bullet}`,
          metadata: {
            source: "changelog",
            title: `${ship.project ?? "Project"} (${entry.date})`,
            snippet: trimTo(bullet, 240),
            url: `${SITE}/changelog`,
            date: entry.date,
          },
        });
      }
    }
  }

  type BugFix = {
    date?: string;
    project?: string;
    title?: string;
    symptom?: string;
    rootCause?: string;
    fix?: string;
    impact?: string;
    commit?: string;
  };
  for (const fix of (bugFixesJson as { fixes?: BugFix[] }).fixes ?? []) {
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

  type WritingPost = {
    slug?: string;
    title?: string;
    teaser?: string;
    date?: string;
    body?: string;
  };
  for (const post of (writingJson as { posts?: WritingPost[] }).posts ?? []) {
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

  type CaseStudy = {
    slug?: string;
    title?: string;
    teaser?: string;
    sections?: Array<{ heading?: string; body?: string }>;
  };
  for (const study of (caseStudiesJson as { studies?: CaseStudy[] }).studies ?? []) {
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

  type Lab = {
    slug?: string;
    title?: string;
    url?: string;
    description?: string;
  };
  for (const lab of (labsJson as { labs?: Lab[] }).labs ?? []) {
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

export function makeWorkerEmbedFn(ai: AIBinding): EmbedFn {
  return async (texts) => {
    const raw = (await ai.run(EMBEDDING_MODEL, { text: texts })) as {
      data?: number[][];
    };
    if (!raw || !Array.isArray(raw.data)) {
      throw new Error("Workers AI returned an unexpected embedding shape.");
    }
    return raw.data;
  };
}

export function makeWorkerUpsertFn(vectorize: VectorizeBinding): UpsertFn {
  return async (vectors) => {
    await vectorize.upsert(vectors);
  };
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
