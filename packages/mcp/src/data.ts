/**
 * Canonical data about Daniel Suchan.
 * All claims here are verified. Do not add unverified facts.
 *
 * Verification sources: bio_canonical memory, public sites, public GitHub,
 * and git logs of repos under /Users/xxx/p/. Anything not on the approved
 * list in the bio_canonical memory must NOT be added here.
 */

export const PROFILE = {
  name: "Daniel Suchan",
  email: "mr.sucik@gmail.com",
  phone: "+420 777 783 404",
  location: "Brno, Czech Republic",
  website: "https://danielsuchan.dev",
  linkedin: "https://www.linkedin.com/in/daniel-suchan-6b8611162/",
  github: "https://github.com/mrSucik",
  education: "Self-taught. Started professional work at 16. Did not attend college.",
  currentRole: "Co-Founder & CTO at Blaze",
  // Lead with the rarest credential (a public MCP server with Workers AI tools)
  // because that's the cheapest disambiguator for a recruiter's AI agent.
  // Then context, then the call to action.
  summary:
    "Self-taught engineer, 24, with 8 years of full-time production experience. " +
    "Builds and operates mcp.danielsuchan.dev — a public, free-tier-safe MCP server with Cloudflare Workers AI tools (free-tier daily-budget circuit breaker, sanitized public errors, 70+ unit tests). " +
    "Co-Founder & CTO at Blaze (Czech 3-founder studio, 40% stake; sole programmer maintaining ~10 SaaS products). " +
    "Flagship: Dzarvis — a multi-agent assistant on Claude with narrow specialized subagents on top of a 208-tool MCP server (in stealth, fine-tuning with 15 companies). " +
    "Open to founding-engineer / staff IC roles at frontier AI labs.",
  experience: [
    {
      company: "Blaze",
      role: "Co-Founder & CTO",
      period: "2022–present",
      description:
        "Czech 3-founder software studio (Daniel 40%, two co-founders 30% each). Sole programmer maintaining ~10 SaaS projects across AI, real estate, healthcare, and construction. Recently launched Blaze AI Agent Day — a one-day on-site engagement where Czech SMBs ship a working AI agent with the team.",
    },
    {
      company: "Cantata Health",
      role: "Frontend & Mobile Lead",
      period: "2017–2022",
      description:
        "US healthcare enterprise. Led frontend web and mobile development on a platform older than Daniel was at the time. Joined at 16 with Czech court permission to work on a US healthcare project. Products built then are still in production today.",
    },
  ],
} as const;

export type Project = {
  name: string;
  url?: string;
  role: string;
  description: string;
  stack: string[];
  status: "Active" | "Completed";
};

export const PROJECTS: Project[] = [
  {
    name: "dzarvis.com",
    url: "https://dzarvis.com",
    role: "Founder & Sole Engineer",
    description:
      "Multi-agent assistant on Claude. Multi-agent harness with narrow specialized subagents on top of a 208-tool MCP server. In stealth, fine-tuning with a focus group of 15 companies.",
    stack: ["TypeScript", "Claude", "MCP", "PostgreSQL", "Hono"],
    status: "Active",
  },
  {
    name: "danielsuchan.dev + mcp.danielsuchan.dev",
    url: "https://danielsuchan.dev",
    role: "Founder & Sole Engineer",
    description:
      "Personal site with a public Streamable-HTTP MCP server at mcp.danielsuchan.dev. Exposes profile/projects/skills tools plus 5 AI-powered tools (ai_ask, ai_summarize, ai_classify, ai_extract_json, ai_translate) backed by Cloudflare Workers AI. Includes daily-budget circuit breaker, sanitized public errors, and 70+ unit tests.",
    stack: ["TypeScript", "Hono", "Cloudflare Workers", "Workers AI", "Workers KV", "MCP SDK", "Vitest"],
    status: "Active",
  },
  {
    name: "Blaze",
    url: "https://blaze.codes/",
    role: "Co-Founder & CTO",
    description:
      "Czech 3-founder software studio (Daniel 40%). Sole programmer maintaining ~10 SaaS products. Recently launched Blaze AI Agent Day — €590/day Ostrava, €890/day Prague.",
    stack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "polygraf.app",
    url: "https://polygraf.app",
    role: "Sole Engineer",
    description:
      "Accessibility tooling built for Masaryk University. Public artifact, currently maintained.",
    stack: ["TypeScript", "React", "Node.js"],
    status: "Active",
  },
  {
    name: "rozpocetpro.cz",
    url: "https://rozpocetpro.cz",
    role: "Development Lead",
    description:
      "B2B SaaS for Czech construction budgets and price quotes. Database of 300,000+ items, OTSKP classification, export to Excel/PDF/XML.",
    stack: ["TypeScript", "React", "AI/ML", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "talentiqa.ai",
    url: "https://talentiqa.ai",
    role: "Development Lead",
    description:
      "AI-powered talent acquisition platform integrated with major ATS systems. Led engineering team to deliver intelligent hiring workflows.",
    stack: ["TypeScript", "React", "AI/ML", "Node.js"],
    status: "Completed",
  },
  {
    name: "jarvischeck.com",
    url: "https://jarvischeck.com",
    role: "Founder",
    description:
      "Website monitoring and alerting SaaS — uptime checks, notifications, dashboards.",
    stack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "IZZY",
    url: "https://izzy.cz",
    role: "Development Lead",
    description:
      "Mobile + web platform for cleaning services in Czechia. Booking, chat, ratings, insurance.",
    stack: ["TypeScript", "React Native", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "ArchiPad",
    url: "https://archipad.app",
    role: "Development Lead",
    description:
      "Construction project management and architecture tooling. Documentation, coordination, and communication for project teams.",
    stack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "Motion Coach",
    url: "https://motioncoach.app",
    role: "Development Lead",
    description:
      "AI fitness app — real-time movement analysis via phone camera with instant feedback on form quality and rep counting.",
    stack: ["TypeScript", "React Native", "AI/ML", "Node.js"],
    status: "Active",
  },
  {
    name: "nemoskop.cz",
    url: "https://nemoskop.cz",
    role: "Founder",
    description:
      "Real estate analysis platform for the Czech Republic. Aggregates pricing, crime, amenities, and transport data into a single map-based tool.",
    stack: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "dotacni-sniper.cz",
    url: "https://dotacni-sniper.cz",
    role: "Founder",
    description:
      "Subsidy finder for Czech housing associations. Helps SVJ and residential buildings discover eligible grants in under 2 minutes.",
    stack: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "morivo.cz",
    url: "https://morivo.cz",
    role: "Founder",
    description:
      "Czech real estate marketplace. Buyer/seller listings, search, and contact flow.",
    stack: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "uniklo.cz",
    url: "https://uniklo.cz",
    role: "Founder",
    description:
      "Data breach checker for Czech users. Free lookup against 947 known breaches and 17B+ records to verify email/password exposure.",
    stack: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "suchan.capital",
    url: "https://suchan.capital",
    role: "Founder",
    description:
      "Algorithmic trading fund building track record. News-driven crypto scalping and event-driven equity trading powered by AI. Registered under ČNB §15 ZISIF.",
    stack: ["TypeScript", "React", "Bun", "SQLite", "AI/ML"],
    status: "Active",
  },
  {
    name: "Cantata Health",
    role: "Frontend & Mobile Lead, 2017–2022",
    description:
      "US healthcare enterprise application. Led frontend web + mobile development. Joined at 16 with Czech court permission. Products built then are still in production today.",
    stack: ["TypeScript", "React", "React Native", "Node.js"],
    status: "Completed",
  },
];

export const SKILLS = [
  "TypeScript",
  "React",
  "React Native",
  "Hono",
  "MCP (Model Context Protocol) — server design + Streamable HTTP transport",
  "Multi-agent orchestration on Claude",
  "Anthropic SDK + tool use",
  "Cloudflare Workers + Workers AI + Workers KV",
  "Production AI systems",
  "PostgreSQL + Drizzle",
  "Node.js + Bun",
  "SaaS product development from 0→1",
  "Engineering team leadership across multiple product lines",
] as const;

export type AnswerBankEntry = {
  keywords: string[];
  answer: string;
};

export const ANSWER_BANK: AnswerBankEntry[] = [
  {
    keywords: ["experience", "years", "how long", "seniority", "senior", "age"],
    answer:
      "24 years old, 8 years of full-time production experience. Started at 16 as Frontend & Mobile Lead at Cantata Health (US healthcare enterprise) with Czech court permission. Currently CTO at Blaze and building Dzarvis. Self-taught — no formal degree, all skills production-verified.",
  },
  {
    keywords: ["education", "school", "degree", "college", "university", "studied"],
    answer:
      "Self-taught. Started professional work at 16 — Czech court granted special legal permission for a US healthcare project at Cantata Health. Did not attend college. Every skill on Daniel's profile is verified against shipped production code.",
  },
  {
    keywords: ["salary", "compensation", "expectation", "package", "money", "pay", "rate"],
    answer:
      "Open to discussion. Currently CTO of a Czech software company; a comparable senior IC or staff engineer role at an AI lab makes sense. Happy to discuss specifics — Daniel doesn't optimize purely for cash, weighs equity, mission, and team carefully.",
  },
  {
    keywords: ["location", "where", "based", "country", "city", "live"],
    answer:
      "Brno, Czech Republic. Open to relocation globally — has 3+ years of digital-nomad experience working across time zones. EU work authorization. Visa sponsorship needed for US/UK/Israel/Japan/Singapore.",
  },
  {
    keywords: ["visa", "sponsorship", "work permit", "authorized", "authorization"],
    answer:
      "EU citizen (Czech Republic). EU work authorization available; no sponsorship needed for any EU/EEA role. Visa sponsorship needed for US, UK, Israel, Japan, Singapore, and most non-EU countries.",
  },
  {
    keywords: ["dzarvis", "flagship", "side project"],
    answer:
      "Dzarvis is Daniel's flagship project — a multi-agent assistant on Claude with narrow specialized subagents on top of a 208-tool MCP server. Currently in stealth, fine-tuning with a focus group of 15 companies. See https://dzarvis.com for the public surface and https://danielsuchan.dev/case-studies/dzarvis for the case study.",
  },
  {
    keywords: ["mcp", "model context protocol", "shipped", "production mcp", "mcp server"],
    answer:
      "Daniel ships and operates a public production MCP server at https://mcp.danielsuchan.dev — Streamable HTTP transport on Cloudflare Workers, exposing profile tools plus 5 AI-powered tools (ai_ask, ai_summarize, ai_classify, ai_extract_json, ai_translate) backed by Cloudflare Workers AI. Hardened with sanitized public errors, hard input length caps, and a free-tier daily-budget circuit breaker via Workers KV. 70+ unit tests, all passing.",
  },
  {
    keywords: ["why", "anthropic", "openai", "deepmind", "lab", "motivation", "interest", "join"],
    answer:
      "Daniel sees the direction frontier AI labs are heading and wants to participate in building it from the inside. He was building toward the same place with Dzarvis — a multi-agent harness on Claude — but realized he'd have far more impact joining a lab with the leverage and resources to ship at scale, rather than competing alone. He takes AI safety and the responsibility of building these systems seriously.",
  },
  {
    keywords: ["available", "start date", "when", "notice", "notice period"],
    answer:
      "Available immediately for the right role. Daniel is in a transition window after closing Wave 2 of his job hunt and locking a parallel external-advisor commitment.",
  },
  {
    keywords: ["remote", "onsite", "in-person", "office", "hybrid", "relocate", "relocation"],
    answer:
      "Open to remote, hybrid, or onsite. 3+ years digital-nomad track record working across time zones. Open to relocation to London, Stockholm, San Francisco, NYC, Paris, Amsterdam, Berlin, or Freiburg.",
  },
  {
    keywords: ["strengths", "technical", "skills", "best at", "good at", "expertise", "stack"],
    answer:
      "Multi-agent orchestration on Claude, MCP server design, full-stack TypeScript on the edge (Hono on Cloudflare Workers + PostgreSQL/Drizzle + React/React Native), and shipping production AI to real users. Also: founding products from 0→1, leading engineering teams across multiple product lines simultaneously.",
  },
  {
    keywords: ["leadership", "team", "manage", "lead", "mentor", "people", "engineers"],
    answer:
      "At Blaze, Daniel co-founded a 3-founder studio and acts as the sole maintaining programmer across ~10 SaaS projects, while coordinating engineering effort on team-led products. At Cantata Health he led frontend web + mobile for a US healthcare enterprise platform from age 16. Comfortable balancing hands-on coding with managing small-to-midsize remote teams.",
  },
  {
    keywords: ["hard problem", "incident", "production", "bug", "war story", "challenge"],
    answer:
      "Recent example: Daniel's public MCP server was returning '9015: invalid prompt' on JSON-mode AI tool calls. Root cause: Cloudflare Workers AI in 2026 only accepts response_format `json_schema` — the OpenAI-style `json_object` is rejected. Fix: removed response_format entirely, fell back to system-prompt instructions + temperature 0 + a hand-written JSON parser with a balanced-brace fallback for prose-wrapped output. Restored all 5 AI tools end-to-end. See `get_bug_fixes` for more.",
  },
  {
    keywords: ["why hire", "fit", "differentiator", "rare", "unique"],
    answer:
      "Three things rare for a 24-year-old: (1) a publicly running production MCP server with hardened Workers AI tools, free-tier circuit breaker and 70+ unit tests; (2) 8 years of full-time production code starting at 16 — including a US healthcare enterprise that's still in production; (3) operating Dzarvis, a 208-tool multi-agent harness on Claude in stealth with 15 companies. The combination of MCP fluency, multi-agent production experience, and shipping cadence on a public surface is the bet.",
  },
  {
    keywords: ["shipping", "cadence", "velocity", "commits", "daily", "what built"],
    answer:
      "Use the `get_recent_shipments` tool for a verified daily log. Daniel ships across multiple repos every working day; recent week alone added 5 AI tools, a free-tier circuit breaker, and the public MCP server itself. Curated changelog at https://danielsuchan.dev/changelog.",
  },
  {
    keywords: ["contact", "reach", "email", "phone", "linkedin"],
    answer:
      "Email: mr.sucik@gmail.com | Phone: +420 777 783 404 | LinkedIn: https://www.linkedin.com/in/daniel-suchan-6b8611162/ | Website: https://danielsuchan.dev",
  },
];

// Daily-shipping log + bug fixes. The Worker bundles them at build time from
// JSON mirrors of the canonical website data (src/data/{changelog,bug-fixes}.json
// in the repo root). Single source of truth lives there; we copy into the
// MCP package because Cloudflare Workers can't read fs at runtime.
import changelogJson from "./changelog.json" with { type: "json" };
import bugFixesJson from "./bug-fixes.json" with { type: "json" };

export type ChangelogEntry = {
  date: string;
  shipments: Array<{
    project: string;
    bullets: string[];
  }>;
};

export const CHANGELOG: ChangelogEntry[] =
  (changelogJson as { entries: ChangelogEntry[] }).entries;

const _UNUSED_INLINE_CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-05-09",
    shipments: [
      {
        project: "danielsuchan-mcp",
        bullets: [
          "Shipped 5 AI-powered MCP tools (ai_ask, ai_summarize, ai_classify, ai_extract_json, ai_translate) backed by Cloudflare Workers AI",
          "Added free-tier safety: KV-based daily-call circuit breaker (80 calls/day cap → ~8K of 10K Neuron quota), per-input length caps, sanitized public errors that don't leak account state",
          "Fixed JSON-mode failure on Workers AI by dropping OpenAI-style response_format and adding a balanced-brace JSON extractor for prose-wrapped output",
          "Hardened error handling — every tool wraps runChat in try/catch, safeParseJson logs failures server-side, registerAiTools fails fast if the AI binding is missing",
          "70+ unit tests across budget, client, tools, and registration; deployed to mcp.danielsuchan.dev v1.2.0",
        ],
      },
    ],
  },
  {
    date: "2026-05-03",
    shipments: [
      {
        project: "danielsuchan-mcp",
        bullets: [
          "Migrated MCP server from Hetzner Coolify back to Cloudflare Workers — cleaner deploy, edge TLS, native Workers AI binding access",
          "Public MCP server live at mcp.danielsuchan.dev, listed on awesome-mcp-servers",
        ],
      },
      {
        project: "danielsuchan-dev",
        bullets: [
          "Added /labs section with subagent decomposer + MCP inspector demos",
          "Shipped llms.txt, JSON Resume endpoints, and per-page JSON-LD for AI-agent readability",
          "Added Dzarvis case study at /case-studies/dzarvis",
          "Removed all blaze.codes URL leakage from public surface; registered case-studies/labs routes",
          "Added Cantata Health to projects, removed closed it.blaze.codes",
        ],
      },
    ],
  },
  {
    date: "2026-05-02",
    shipments: [
      {
        project: "danielsuchan-dev",
        bullets: [
          "Stripped unverified Dzarvis claims from public site after honest audit (no fabricated subagent counts, no fake pricing claims)",
          "Hardened deploy pipeline + extended SEO surface",
          "Refreshed route SEO meta + added /writing route",
        ],
      },
    ],
  },
  {
    date: "2026-05-01",
    shipments: [
      {
        project: "danielsuchan-dev",
        bullets: [
          "Repositioned home page hero around Dzarvis as the flagship project",
          "Pulled Dzarvis to position #1 on /projects with full technical description",
          "Added skill-curated /changelog — daily-shipping log across all projects",
          "Shipped /writing with full markdown rendering and two technical post drafts: agent sandboxes infrastructure + multi-agent subagent orchestration",
          "Added prose-post styles for long-form technical writing",
        ],
      },
    ],
  },
];

// Production bug fixes. Source-of-truth: src/data/bug-fixes.json (repo root).
// Curated war stories carry symptom/rootCause/fix/impact; backfilled entries
// from public git logs include just the title + commit reference.
export type BugFix = {
  date: string;
  project: string;
  title: string;
  symptom?: string;
  rootCause?: string;
  fix?: string;
  impact?: string;
  commit?: string;
  repo?: string;
};

export const BUG_FIXES: BugFix[] =
  (bugFixesJson as { fixes: BugFix[] }).fixes;

const _UNUSED_INLINE_BUG_FIXES: BugFix[] = [
  {
    date: "2026-05-09",
    project: "danielsuchan-mcp",
    title: "Workers AI rejects OpenAI-style response_format json_object",
    symptom:
      "ai_classify and ai_extract_json failed every call with '9015: invalid prompt: failed to parse prompt: unknown variant `json_object`, expected `json_schema`'",
    rootCause:
      "Cloudflare Workers AI in 2026 only accepts `response_format: {type: 'json_schema', json_schema: {...}}` with a concrete schema. The OpenAI-style `{type: 'json_object'}` is rejected — and ai_extract_json's schemaDescription is plain English from the user, so we can't construct one.",
    fix: "Removed the `json` flag from ChatOptions entirely. JSON-output tools now rely on system-prompt instructions + temperature 0 + safeParseJson with a new balanced-brace substring fallback that handles prose-wrapped JSON correctly (including escaped quotes inside string literals).",
    impact:
      "Restored all 5 AI tools end-to-end on mcp.danielsuchan.dev. Wrote a doc comment on the gotcha so future MCP integrations don't re-introduce the bug.",
    commit: "689be3a",
  },
  {
    date: "2026-05-09",
    project: "danielsuchan-mcp",
    title: "Health endpoint 500ed when env was undefined in vitest",
    symptom:
      "After exposing aiBudget on GET /, fetch-tests started returning 500 because c.env was undefined when the Worker was invoked outside Cloudflare.",
    rootCause:
      "Hono's c.env is undefined when app.fetch(req) is called without an env argument; reading c.env.MAX_AI_CALLS_PER_DAY threw 'cannot read properties of undefined'.",
    fix: "Added a defensive `(c.env ?? {}) as Partial<Bindings>` cast in the health-endpoint handler so vitest fetch-tests stay 200.",
    impact:
      "Tests can call app.fetch(new Request('/')) directly without staging a full Bindings shape. 66/66 tests green.",
    commit: "d1abadf",
  },
  {
    date: "2026-05-09",
    project: "danielsuchan-mcp",
    title: "Public MCP server leaked Workers AI internal trace IDs in error messages",
    symptom:
      "When the AI binding returned an unexpected shape, the thrown error message included up to 200 chars of the raw payload — surfacing internal trace IDs, account state, and partial prompt echoes to public callers.",
    rootCause:
      "extractText threw `new Error('Unexpected Workers AI response shape: ${JSON.stringify(raw).slice(0, 200)}')` and the MCP SDK piped error.message verbatim into the public CallToolResult.content.",
    fix: "Sanitized the message to a generic 'Workers AI returned an unexpected response shape' and console.error the raw shape server-side instead. Did the same for ai_classify and ai_extract_json's failure paths — log details, return generic isError to public callers.",
    impact:
      "Closed an info-leak vector on a public unauthenticated MCP endpoint. Operators still get full diagnostics in `wrangler tail`.",
    commit: "1c53bb6",
  },
  {
    date: "2026-05-02",
    project: "danielsuchan-dev",
    title: "Public site claimed Dzarvis features that weren't verifiable.",
    symptom:
      "Site referenced specific subagent counts, $/day pricing, dual-review verification, content-hash caching, and per-domain trigger detection — none verifiable as shipped.",
    rootCause:
      "Earlier session populated copy from speculative architecture ideas rather than verified production behavior.",
    fix: "Stripped every unverified claim. Added a strict bio_canonical memory listing exactly which Dzarvis claims may appear in public artifacts ('multi-agent assistant on Claude', '208-tool MCP server', '15 fine-tuning companies', 'stealth mode') and which must NEVER appear.",
    impact:
      "Site now reflects only verifiable facts; future content generation has a clear allowlist/blocklist to ground against.",
    commit: "8071cc1",
  },
];

// Curated daily Twitter/X digest snapshot. Source: Daniel's twitter-agent
// pipeline at /Users/xxx/p/twitter, persisted to Jarvis KV namespace
// `twitter-pulse` keyed by date. The agent filters 136 handles for niche /
// high-signal AI + finance content (no rage-bait, no political noise).
//
// This is a snapshot of the most recent digest, embedded so the Worker can
// serve it without a Jarvis round-trip. Long-term: a sync script will push
// each new digest into Workers KV and this tool will read live. For now,
// `latestSnapshot` is updated by hand or by a CI step.
export type TwitterPulseEntry = {
  handle: string;
  link?: string;
  detail?: string;
  fact?: string;
  headline?: string;
};

export type TwitterPulse = {
  date: string;
  source: string;
  daySummary: string;
  sentiment: number;
  watchlistSize: number;
  activeHandles: number;
  silentHandles: number;
  top3: TwitterPulseEntry[];
  modelsBenchmarks: TwitterPulseEntry[];
  capitalDeals: TwitterPulseEntry[];
  researchDepth: TwitterPulseEntry[];
  nicheContrarian: TwitterPulseEntry[];
  watchlistRecs: {
    add: Array<{ handle: string; reason: string }>;
    prune: Array<{ handle: string; reason: string }>;
  };
};

export const TWITTER_PULSE_LATEST: TwitterPulse = {
  date: "2026-05-01",
  source: "twitter-agent curation",
  daySummary:
    "Codex onboarding wave + ChatGPT Images 2.0 inflection + open-weights closing within 6 pts of frontier + e2b textbook security writeup. Sentiment +2. No rage-bait surfaced.",
  sentiment: 2,
  watchlistSize: 99,
  activeHandles: 29,
  silentHandles: 70,
  top3: [
    {
      handle: "@ArtificialAnlys",
      headline: "Grok 4.3 ships with massive agentic jump",
      detail:
        "53 on AA Intelligence Index, +321 ELO on GDPval-AA to 1500, ~40% cheaper input / ~60% cheaper output than Grok 4.20. $395 to run full benchmark suite.",
      link: "https://x.com/ArtificialAnlys/status/2049987001655714250",
    },
    {
      handle: "@OpenAI",
      headline: "GPT-5.5 + Codex traction is real",
      detail:
        "Week-one API revenue 2x faster than any prior OpenAI release; Codex revenue doubled in <7 days. OpenAI shipped one-click migration from Claude Code (settings/plugins/agents/project config).",
      link: "https://x.com/OpenAI/status/2050250926888468929",
    },
    {
      handle: "@OpenAINewsroom",
      headline: "ChatGPT Images 2.0 inflecting",
      detail:
        ">50% jump in image usage in a few weeks; ~60% of daily users newly logged-in. 360° viewer rolling out desktop now / mobile next week.",
      link: "https://x.com/OpenAINewsroom/status/2050296741715706182",
    },
  ],
  modelsBenchmarks: [
    {
      handle: "@ArtificialAnlys",
      fact: "Open weights at 54: Kimi K2.6 (1T/32B, 256K) and Xiaomi MiMo V2.5 Pro (1T/42B, 1M) tie for #1; DeepSeek V4 Pro (1.6T/49B, 1M) at 52. GPT-5.5 xhigh at 60, Gemini 3.1 Pro Preview / Claude Opus 4.7 at 57. One year ago best open weights was 22.",
      link: "https://x.com/ArtificialAnlys/status/2050096370200281539",
    },
    {
      handle: "@AnthropicAI",
      fact: "1M-conversation guidance/sycophancy study fed back into Opus 4.7 + Mythos Preview training",
      link: "https://x.com/AnthropicAI/status/2049927618397614466",
    },
    {
      handle: "@cursor_ai",
      fact: "Cursor Security Review GA for Teams/Enterprise — per-PR Security Reviewer + Vulnerability Scanner posting to Slack",
      link: "https://x.com/cursor_ai/status/2049926283061035254",
    },
    {
      handle: "@lmsysorg",
      fact: "SGLang DeepSeek V4 — only ~10% degradation at 1M ctx (ShadowRadix prefix cache + HiSparse KV)",
      link: "https://x.com/lmsysorg/status/2049977433450045866",
    },
    {
      handle: "@togethercompute",
      fact: "DeepSeek V4 hybrid attention + sparse MoE cuts KV cache up to 90%, 1M-tok context",
      link: "https://x.com/togethercompute/status/2049940598917087262",
    },
    {
      handle: "@satyanadella",
      fact: "Microsoft Agent 365 GA — extends enterprise identity/security/governance to every AI agent",
      link: "https://x.com/satyanadella/status/2050251014691840015",
    },
    {
      handle: "@runwayml",
      fact: "Runway gen-video now on Android + iOS",
      link: "https://x.com/runwayml/status/2050270993487212712",
    },
    {
      handle: "@claudeai",
      fact: "Code with Claude dev conference next week — livestream registration open",
      link: "https://x.com/claudeai/status/2050252933866930339",
    },
  ],
  capitalDeals: [
    {
      handle: "@MistralAI",
      fact: "TIME100 Most Influential Companies 2026, top-10 for AI",
      link: "https://x.com/MistralAI/status/2049988769928056852",
    },
    {
      handle: "@Alibaba_Qwen",
      fact: "Strategic partnership with Fireworks AI for production-ready Qwen closed-weights deployment",
      link: "https://x.com/Alibaba_Qwen/status/2050232280082522505",
    },
    {
      handle: "@nvidia",
      fact: "OpenClaw → 250K GH stars in 60 days (fastest climb ever); NVIDIA partnered to enterprise-harden it",
      link: "https://x.com/nvidia/status/2049971830513910054",
    },
    {
      handle: "@DeepInfra",
      fact: "Now first-class provider in OpenClaw — one key, every model",
      link: "https://x.com/DeepInfra/status/2050294604654874973",
    },
    {
      handle: "@togethercompute",
      fact: "Scaled Cognition reports ~50% cost savings vs AWS post-switch",
      link: "https://x.com/togethercompute/status/2050271746062721175",
    },
  ],
  researchDepth: [
    {
      handle: "@e2b",
      fact: "CVE-2026-31431 writeup — Linux kernel root flaw since 2017, cross-tenant on shared-kernel sandbox hosts. E2B unaffected by design (per-sandbox Firecracker microVMs, CONFIG_CRYPTO_USER never compiled). Textbook sandbox-security signal.",
      link: "https://x.com/e2b/status/2049992833256374640",
    },
    {
      handle: "@MSFTResearch",
      fact: "Safe agents ≠ safe ecosystem — network-level risks in interconnected agents need new framing",
      link: "https://x.com/MSFTResearch/status/2049972123901264027",
    },
    {
      handle: "@togethercompute",
      fact: "Super-Reliable Intelligence framing from @profdanklein — fluent + confident + wrong is the failure mode no one was tracking",
      link: "https://x.com/togethercompute/status/2050272756906746241",
    },
  ],
  nicheContrarian: [
    {
      handle: "@ArtificialAnlys",
      fact: "Open weights gap on agentic coding still wide — TerminalBench Hard 43–46% vs GPT-5.5 @ 61%. Closing-the-gap narrative is partial.",
    },
    {
      handle: "@huggingface",
      fact: "DeepInfra now an HF Inference Provider (DeepSeek V4, Kimi-K2.6, GLM-5.1, 100+ models) — cheap-serving consolidation",
      link: "https://x.com/huggingface/status/2050114293383737553",
    },
    {
      handle: "@ollama",
      fact: "People running Claude Code with local Ollama+Gemma to dodge API costs — local-first agent stack signal",
    },
  ],
  watchlistRecs: {
    add: [
      {
        handle: "@Xiaomi",
        reason:
          "MiMo V2.5 Pro ties for open-weights #1 on AA Intelligence Index; niche Chinese frontier lab not on list",
      },
      {
        handle: "@OpenClaw",
        reason:
          "250K GH stars in 60 days, NVIDIA-partnered, now a routing hub (DeepInfra integrated)",
      },
    ],
    prune: [{ handle: "@modal_labs", reason: "Confirmed suspended on X" }],
  },
};
