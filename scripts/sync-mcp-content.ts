/**
 * Sync site content into MCP package as JSON.
 *
 * The MCP Worker can't read the filesystem at runtime, so we bundle the
 * writing posts, case-study content, and labs metadata as JSON files inside
 * packages/mcp/src/. Run this script when adding/editing any of those.
 *
 * Produces for Worker bundling:
 *   packages/mcp/src/writing.json    — all blog posts (frontmatter + body)
 *   packages/mcp/src/case-studies.json — long-form case studies
 *   packages/mcp/src/labs.json        — labs demos metadata
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const MCP_SRC = join(ROOT, "packages", "mcp", "src");

interface Post {
  slug: string;
  title: string;
  date: string;
  status: "drafting" | "published";
  topic: string;
  teaser: string;
  body: string;
}

function parseFrontmatter(raw: string): Post {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Missing frontmatter");
  const [, fmBlock, body] = match;
  const fm: Record<string, string> = {};
  for (const line of fmBlock.split("\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    fm[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }
  return {
    slug: fm.slug,
    title: fm.title,
    date: fm.date,
    status: fm.status as "drafting" | "published",
    topic: fm.topic,
    teaser: fm.teaser,
    body: body.trim(),
  };
}

function syncWriting(): void {
  const dir = join(SRC, "data", "writing");
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  const posts = files
    .map((f) => parseFrontmatter(readFileSync(join(dir, f), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date));
  writeFileSync(
    join(MCP_SRC, "writing.json"),
    `${JSON.stringify({ posts }, null, 2)}\n`
  );
  console.log(`writing.json: ${posts.length} posts`);
}

function syncCaseStudies(): void {
  // Case studies aren't in markdown today (they're TSX components). For MCP
  // exposure we ship a structured summary that mirrors the visible page so
  // an agent gets the same content a human reader would.
  const studies = [
    {
      slug: "dzarvis",
      title: "Dzarvis — multi-agent assistant on Claude",
      url: "https://danielsuchan.dev/case-studies/dzarvis",
      teaser:
        "Architecture write-up for Dzarvis: a multi-agent harness with narrow specialized subagents on top of a 208-tool MCP server. In stealth, fine-tuning with a focus group of 15 companies.",
      sections: [
        {
          heading: "What Dzarvis is",
          body:
            "A multi-agent assistant on Claude. Daniel runs the orchestrator + a swarm of narrow specialized subagents over a 208-tool MCP server. Currently in stealth, fine-tuning with 15 companies.",
        },
        {
          heading: "Why a 208-tool MCP server",
          body:
            "Each tool is a contract: name + Zod-validated args + return shape. The orchestrator picks tools by name, the subagents are scoped to a narrow tool subset. This pushes routing logic into the type system rather than into hand-rolled if/else.",
        },
        {
          heading: "Why narrow subagents",
          body:
            "A single mega-prompt with all 208 tools available to one agent collapses under context-window pressure and tool-selection noise. Narrow subagents get tighter prompts, smaller tool surfaces, and predictable failure modes.",
        },
        {
          heading: "Trust boundary",
          body:
            "All LLM-emitted values that touch persistence go through Zod parsing first. URLs hit an allowlist before fetch. The system prompt explicitly tells the model to refuse with a structured error envelope when input is unparseable.",
        },
      ],
    },
    {
      slug: "mcp",
      title: "mcp.danielsuchan.dev — A hardened public MCP server",
      url: "https://danielsuchan.dev/case-studies/mcp",
      teaser:
        "Architecture writeup for mcp.danielsuchan.dev: a public, free-tier-safe MCP server with 16 tools, KV-based budget circuit breaker, sanitized errors, and 100% line coverage on logic.",
      sections: [
        {
          heading: "The problem",
          body:
            "A personal MCP server is a strange thing to run — neither product nor portfolio piece, but a typed surface for AI agents to read about Daniel without scraping HTML. Three constraints made it non-trivial: public + unauthenticated (anyone can call any tool), free tier (10K Workers AI Neurons/day), and agent-first audience (the reader is usually a model).",
        },
        {
          heading: "Architecture",
          body:
            "One Cloudflare Worker on Hono with the modern Streamable HTTP MCP transport. Tools are Zod-validated handlers in tools.ts. Static profile data plus generated JSON synced from the site's source-of-truth (changelog, bug-fixes, writing, case-studies, labs). Workers KV for the daily-budget counter, Workers AI bound directly to the Worker. A build-time sync script keeps site and MCP in lockstep.",
        },
        {
          heading: "Hardening",
          body:
            "Four pieces close the worst-case paths: (1) KV-backed daily budget circuit breaker — 80 calls/day caps Workers AI usage at ~8K of 10K Neurons; (2) sanitized errors at the trust boundary — internal failures to wrangler tail, public callers see a generic envelope with no trace IDs; (3) per-input length caps via Zod; (4) 139 tests at 100% line coverage on logic, 97% branch.",
        },
        {
          heading: "Agent-first surfaces",
          body:
            "get_agent_guide is the first-call tool — returns a decision tree mapping common questions to the right specialized tool. Static surfaces complement the MCP: /api/profile.json (JSON Resume v1.0.0), /llms.txt (AI-crawler convention), and /for-agents (human-readable doc page). Every claim on the site has a queryable source — the MCP is the API for those claims.",
        },
        {
          heading: "Hard problems",
          body:
            "Free-tier abuse: 80 calls/day is a soft cap, not a security boundary; the real defense is that exhaustion produces a clean 429 with no hidden cost. LLM output trust: Workers AI doesn't accept OpenAI-style json_object, only json_schema, which the public ai_extract_json can't construct from free-form input — so the fix is layered (temperature 0 + system prompt + safeParseJson with balanced-brace fallback). Site/MCP drift: the build-time sync script writes JSON into the MCP package; CI fails if regenerated JSON differs from what was committed.",
        },
      ],
    },
  ];
  writeFileSync(
    join(MCP_SRC, "case-studies.json"),
    `${JSON.stringify({ studies }, null, 2)}\n`
  );
  console.log(`case-studies.json: ${studies.length} studies`);
}

function syncLabs(): void {
  const labs = [
    {
      slug: "decomposer",
      title: "Subagent task decomposer",
      url: "https://danielsuchan.dev/labs/decomposer",
      description:
        "Type any task and see how a Dzarvis-style multi-agent system decomposes it into narrow specialized subagents with a live dependency graph.",
    },
    {
      slug: "mcp",
      title: "MCP inspector",
      url: "https://danielsuchan.dev/labs/mcp",
      description:
        "Chat directly with Daniel's public MCP server. Ask about Dzarvis, projects, or background — routed through a live Streamable-HTTP MCP endpoint.",
    },
  ];
  writeFileSync(
    join(MCP_SRC, "labs.json"),
    `${JSON.stringify({ labs }, null, 2)}\n`
  );
  console.log(`labs.json: ${labs.length} demos`);
}

syncWriting();
syncCaseStudies();
syncLabs();
console.log(`MCP content synced into ${MCP_SRC}/`);
