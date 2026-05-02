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
    title: "Daniel Suchan – Engineer building production AI systems | Brno",
    description:
      "Software engineer based in Brno. Building Dzarvis (multi-agent assistant on Claude) and shipping production AI infrastructure. CTO at Blaze, 8+ years writing code.",
    lastmod: "2026-05-02",
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
    lastmod: "2026-05-02",
    changefreq: "weekly",
    priority: 0.7,
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
