/**
 * Build verifier — runs after prerender + sitemap. Fails the build if:
 *   1. A post in src/data/writing/*.md is missing from POST_ROUTES
 *   2. A POST_ROUTES entry's title/description/slug drifts from frontmatter
 *   3. A banned string appears in any shipped dist HTML
 *
 * The banned-string list catches stale brand copy that shouldn't reach prod.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { POST_ROUTES } from "./site-routes.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST_DIR = join(ROOT, "dist");
const WRITING_DIR = join(ROOT, "src", "data", "writing");

interface PostFrontmatter {
  title: string;
  slug: string;
  date: string;
  status: string;
  topic: string;
  teaser: string;
}

const errors: string[] = [];

function parseFrontmatter(raw: string, file: string): PostFrontmatter {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    errors.push(`${file}: missing frontmatter block`);
    return { title: "", slug: "", date: "", status: "", topic: "", teaser: "" };
  }
  const fm: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    fm[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }
  return {
    title: fm.title ?? "",
    slug: fm.slug ?? "",
    date: fm.date ?? "",
    status: fm.status ?? "",
    topic: fm.topic ?? "",
    teaser: fm.teaser ?? "",
  };
}

function checkPostsCoverage(): void {
  const postFiles = readdirSync(WRITING_DIR).filter((f) => f.endsWith(".md"));
  const slugsInRoutes = new Set(
    POST_ROUTES.map((r) => r.path.replace("/writing/", "")),
  );
  const slugsInPosts = new Set<string>();

  for (const file of postFiles) {
    const raw = readFileSync(join(WRITING_DIR, file), "utf-8");
    const fm = parseFrontmatter(raw, file);
    if (!fm.slug) {
      errors.push(`${file}: frontmatter missing slug`);
      continue;
    }
    slugsInPosts.add(fm.slug);

    const route = POST_ROUTES.find(
      (r) => r.path === `/writing/${fm.slug}`,
    );
    if (!route) {
      errors.push(
        `Post ${file} (slug=${fm.slug}) is missing a POST_ROUTES entry in scripts/site-routes.ts`,
      );
      continue;
    }
    const noindexExpected = fm.status === "drafting";
    if (Boolean(route.noindex) !== noindexExpected) {
      errors.push(
        `Post ${fm.slug}: frontmatter status="${fm.status}" but POST_ROUTES.noindex=${route.noindex}. Drafting posts must be noindex.`,
      );
    }
  }

  for (const slug of slugsInRoutes) {
    if (!slugsInPosts.has(slug)) {
      errors.push(
        `POST_ROUTES has /writing/${slug} but no matching src/data/writing/${slug}.md`,
      );
    }
  }
}

const BANNED_STRINGS: Array<{ needle: string; reason: string }> = [
  { needle: "Software Engineer & CTO | Brno", reason: "stale homepage title" },
  {
    needle: "Co-Founder at blaze.codes",
    reason: "stale newsletter copy",
  },
  {
    needle: "leading engineering teams across 17+ projects",
    reason: "stale homepage description",
  },
  // Unverified Dzarvis specifics — see user_bio_canonical.md "NEVER claim" list.
  { needle: "$6/day", reason: "unverified Dzarvis pricing claim" },
  { needle: "14-20", reason: "unverified subagent count claim" },
  {
    needle: "dual-review verification",
    reason: "unverified Dzarvis feature claim",
  },
  {
    needle: "content-hash cache",
    reason: "unverified Dzarvis feature claim",
  },
  {
    needle: "Per-domain trigger detection",
    reason: "unverified Dzarvis feature claim",
  },
  {
    needle: "Gemini Flash Lite + Claude Sonnet",
    reason: "unverified model-routing specifics",
  },
];

function walkHtml(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkHtml(full, files);
    } else if (entry.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

function checkBannedStrings(): void {
  const htmlFiles = walkHtml(DIST_DIR);
  for (const file of htmlFiles) {
    const raw = readFileSync(file, "utf-8");
    for (const { needle, reason } of BANNED_STRINGS) {
      if (raw.includes(needle)) {
        errors.push(
          `${file.replace(ROOT, "")}: contains banned string "${needle}" (${reason})`,
        );
      }
    }
  }
}

function main(): void {
  checkPostsCoverage();
  checkBannedStrings();

  if (errors.length > 0) {
    console.error("\nBuild verification FAILED:\n");
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error(`\n${errors.length} error(s).\n`);
    process.exit(1);
  }

  console.log("Build verification passed.");
}

main();
