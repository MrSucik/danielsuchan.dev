/**
 * Single source of truth for prerender, sitemap, and any other build-time
 * route enumeration. Update this file when adding a route or post.
 *
 * IMPORTANT: post entries here MUST mirror frontmatter in src/data/writing/*.md.
 * The build verifier (scripts/verify-content.ts) enforces that drift fails CI.
 */

export interface RouteSEO {
  path: string;
  title: string;
  description: string;
  lastmod?: string;
  changefreq?: "weekly" | "monthly" | "daily";
  priority?: number;
  noindex?: boolean;
}

export const STATIC_ROUTES: RouteSEO[] = [
  {
    path: "/",
    title:
      "Daniel Suchan – 24, 9 yrs production code, ships every day | Brno",
    description:
      "Self-taught engineer, 24, with 9 years of production experience — has been shipping every day since 16. Engineering lead at Blaze, manages 3 programmers, ships hands-on across ~10 SaaS products. Public MCP server, multi-agent assistant on Claude. Built for AI agents to read.",
    lastmod: "2026-05-09",
    changefreq: "monthly",
    priority: 1.0,
  },
  {
    path: "/projects",
    title: "Projects – Daniel Suchan | Dzarvis, AI infrastructure, SaaS",
    description:
      "Production AI systems and 20+ products shipped, co-founded, or led by Daniel Suchan — including Dzarvis (multi-agent assistant on Claude), Rozpocetpro (AI construction budgeting), and Talentiqa (AI hiring).",
    lastmod: "2026-05-02",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/writing",
    title:
      "Writing – Daniel Suchan | Multi-agent systems, AI infrastructure",
    description:
      "Technical writing on building production AI systems — agent sandboxes, multi-agent orchestration, and the lessons from shipping Dzarvis.",
    lastmod: "2026-05-02",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/changelog",
    title: "Changelog – Daniel Suchan | Daily shipping log",
    description:
      "Daily log of features Daniel Suchan ships across Dzarvis, Blaze, JarvisCheck, and 20+ other projects.",
    lastmod: "2026-05-09",
    changefreq: "weekly",
    priority: 0.7,
  },
  {
    path: "/bugs",
    title: "Bugs Fixed – Daniel Suchan | Production debugging log",
    description:
      "Curated production bug fixes Daniel has shipped — symptom, root cause, fix, and impact for each. Recent and verifiable from public commit history.",
    lastmod: "2026-05-09",
    changefreq: "weekly",
    priority: 0.7,
  },
  {
    path: "/for-agents",
    title:
      "For AI agents — how to read Daniel Suchan's profile | danielsuchan.dev",
    description:
      "Most readers of this site are AI agents. Here's the canonical path: the MCP server, the JSON Resume, llms.txt. Decision tree mapping every recruiter-question to the exact MCP tool.",
    lastmod: "2026-05-09",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/newsletter",
    title: "Newsletter – Daniel Suchan | Engineering Updates",
    description:
      "Subscribe to engineering updates from Daniel Suchan, engineer building production AI systems.",
    lastmod: "2026-05-02",
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    path: "/case-studies",
    title: "Case Studies – Daniel Suchan | AI systems architecture",
    description:
      "Long-form architecture write-ups on production AI systems built by Daniel Suchan — starting with Dzarvis, a multi-agent assistant on Claude.",
    lastmod: "2026-05-02",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/case-studies/dzarvis",
    title:
      "Dzarvis — Multi-agent assistant on Claude | Case Study – Daniel Suchan",
    description:
      "Architecture write-up for Dzarvis: a multi-agent harness with narrow specialized subagents on top of a 208-tool MCP server. In stealth, fine-tuning with a focus group of 15 companies.",
    lastmod: "2026-05-02",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/labs",
    title: "Labs – Daniel Suchan | Live demos and interactive tools",
    description:
      "Interactive demos of multi-agent orchestration, MCP tooling, and AI infrastructure built by Daniel Suchan. Try the subagent decomposer or inspect the MCP server live.",
    lastmod: "2026-05-02",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/labs/decomposer",
    title: "Subagent Task Decomposer – Labs | Daniel Suchan",
    description:
      "Type any task and see how a Dzarvis-style multi-agent system decomposes it into narrow specialized subagents with a live dependency graph.",
    lastmod: "2026-05-02",
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    path: "/labs/mcp",
    title: "MCP Inspector – Labs | Daniel Suchan",
    description:
      "Chat directly with Daniel's public MCP server. Ask about Dzarvis, his projects, or his background — routed through a live Model Context Protocol endpoint.",
    lastmod: "2026-05-02",
    changefreq: "monthly",
    priority: 0.6,
  },
];

/**
 * Per-post route metadata. The slug, title, description, and date here
 * must match the frontmatter in src/data/writing/{slug}.md.
 * Drafting posts get noindex=true so search engines don't index them.
 */
export const POST_ROUTES: RouteSEO[] = [
  {
    path: "/writing/agent-sandboxes-infra",
    title: "How to design agent sandboxes infra – Daniel Suchan",
    description:
      "What it actually takes to run untrusted agent code safely — sandbox isolation patterns, security boundaries, and the cost-vs-safety tradeoffs from production agent infrastructure work.",
    lastmod: "2026-05-02",
    changefreq: "monthly",
    priority: 0.7,
    noindex: true,
  },
  {
    path: "/writing/subagent-orchestration",
    title:
      "How I orchestrate narrow subagents via LLM classification – Daniel Suchan",
    description:
      "Routing logic without hand-rolled if/else — how a multi-agent harness decides which subagent to spin up, when to spawn vs reuse, and the part nobody writes about — when NOT to call the model at all.",
    lastmod: "2026-05-02",
    changefreq: "monthly",
    priority: 0.7,
    noindex: true,
  },
];

export const ALL_ROUTES: RouteSEO[] = [...STATIC_ROUTES, ...POST_ROUTES];
