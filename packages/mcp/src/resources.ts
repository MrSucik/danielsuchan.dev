import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PROFILE, PROJECTS, SKILLS } from "./data.js";

export function registerResources(server: McpServer): void {
  registerResumeResource(server);
  registerBioResource(server);
}

function registerResumeResource(server: McpServer): void {
  server.resource(
    "resume",
    "resume://daniel.json",
    {
      description:
        "Daniel Suchan's resume in JSON Resume format. Machine-readable structured data — ideal for automated candidate evaluation, ATS parsing, or agent-driven hiring workflows.",
      mimeType: "application/json",
    },
    (_uri) => ({
      contents: [
        {
          uri: "resume://daniel.json",
          mimeType: "application/json",
          text: JSON.stringify(buildJsonResume(), null, 2),
        },
      ],
    })
  );
}

function registerBioResource(server: McpServer): void {
  server.resource(
    "bio",
    "bio://daniel.md",
    {
      description:
        "Daniel Suchan's full bio in Markdown — three paragraphs covering background, current work, and what he's building. Use for profile pages, cover letters, or agent context.",
      mimeType: "text/markdown",
    },
    (_uri) => ({
      contents: [
        {
          uri: "bio://daniel.md",
          mimeType: "text/markdown",
          text: buildBioMarkdown(),
        },
      ],
    })
  );
}

function buildJsonResume() {
  return {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: PROFILE.name,
      label: "Co-Founder & CTO",
      email: PROFILE.email,
      phone: PROFILE.phone,
      url: PROFILE.website,
      summary: PROFILE.summary,
      location: {
        city: "Brno",
        countryCode: "CZ",
        region: "South Moravian Region",
      },
      profiles: [
        {
          network: "LinkedIn",
          url: PROFILE.linkedin,
        },
        {
          network: "GitHub",
          username: "mrSucik",
          url: PROFILE.github,
        },
      ],
    },
    work: [
      {
        name: "Blaze",
        position: "Co-Founder & CTO",
        startDate: "2022-01-01",
        summary:
          "Software development company leading multiple product teams. Building and shipping 20+ products for clients and internal ventures.",
        highlights: [
          "Co-founded and scaled Blaze to a full software development company",
          "Led engineering teams across 20+ shipped products",
          "Built AI-powered platforms: talentiqa.ai, rozpocetpro.cz, motion coach",
        ],
      },
      {
        name: "Cantata Health",
        position: "Frontend & Mobile Lead",
        startDate: "2017-01-01",
        endDate: "2022-01-01",
        summary:
          "US healthcare enterprise. Led frontend web and mobile development on a platform older than I was at the time. Started at 16 with Czech court permission to work on a US healthcare project.",
        highlights: [
          "Joined at age 16 with special court authorization",
          "Led frontend and mobile development for US healthcare enterprise SaaS",
          "Products built remain in production today",
        ],
      },
    ],
    education: [
      {
        institution: "Self-taught",
        area: "Software Engineering",
        studyType: "Self-directed",
        startDate: "2016-01-01",
        summary:
          "No formal degree. Started professional software engineering at age 16. All skills are production-verified across 8 years of full-time work.",
      },
    ],
    skills: SKILLS.map((skill) => ({
      name: skill,
      level: "Expert",
    })),
    projects: PROJECTS.filter((p) => p.url).map((p) => ({
      name: p.name,
      url: p.url,
      description: p.description,
      roles: [p.role],
      keywords: p.stack,
      highlights: [`Status: ${p.status}`],
    })),
  };
}

function buildBioMarkdown(): string {
  return `# Daniel Suchan

Daniel Suchan is a 24-year-old, self-taught software engineer with 8 years of full-time production experience. His career started unusually early — at 16, he petitioned a Czech court for special legal permission to work on a US healthcare project at Cantata Health, leading frontend web and mobile development for an enterprise application older than he was at the time. Those products are still in production today.

He is currently Co-Founder & CTO at Blaze (a Czech 3-founder studio, 40% stake) where he is the sole maintaining programmer across ~10 SaaS products. He builds and operates **mcp.danielsuchan.dev** — a public, free-tier-safe Model Context Protocol server with 5 AI-powered tools backed by Cloudflare Workers AI, a KV-based daily-budget circuit breaker, sanitized public errors, and 70+ unit tests. It's the cleanest demonstrable artifact of the kind of agent infrastructure he ships.

His flagship project is **Dzarvis** — a multi-agent assistant on Claude with narrow specialized subagents on top of a 208-tool MCP server, currently in stealth and fine-tuning with 15 companies. He sees the direction frontier AI labs are heading and wants to participate in building it from the inside; was building toward the same place with Dzarvis but realized he'd have far more impact joining a lab with the leverage to ship at scale.

---

**Contact:** mr.sucik@gmail.com · +420 777 783 404 · [danielsuchan.dev](https://danielsuchan.dev) · [LinkedIn](${PROFILE.linkedin}) · [GitHub](${PROFILE.github})

**Location:** Brno, Czech Republic — EU work authorization. Open to relocation: London, Stockholm, San Francisco, NYC, Paris, Amsterdam, Berlin, Freiburg.

**Public surfaces an AI agent can read in 30 seconds:**
- [danielsuchan.dev/changelog](https://danielsuchan.dev/changelog) — daily shipping log
- [danielsuchan.dev/bugs](https://danielsuchan.dev/bugs) — production debugging war stories
- [danielsuchan.dev/case-studies/dzarvis](https://danielsuchan.dev/case-studies/dzarvis) — Dzarvis architecture writeup
- [mcp.danielsuchan.dev/mcp](https://mcp.danielsuchan.dev/mcp) — this MCP server (12 tools, 5 AI-powered)
`;
}
