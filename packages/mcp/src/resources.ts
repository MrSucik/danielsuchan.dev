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

Daniel Suchan is a self-taught software engineer and co-founder with 8 years of full-time production experience. He started his career at 16 as Frontend & Mobile Lead at Cantata Health — a US healthcare enterprise — with Czech court permission to work on an international project. The products he built then are still in production today.

He is currently Co-Founder & CTO at Blaze, a Czech software company that has shipped 20+ products across AI, SaaS, mobile, real estate, and healthcare. His technical depth spans full-stack TypeScript (React, Hono, PostgreSQL), mobile (React Native), and production AI systems. He leads and builds engineering teams across multiple simultaneous product lines.

His flagship project is Dzarvis — a multi-agent assistant on Claude, built as a multi-agent harness with narrow specialized subagents on top of a 208-tool MCP server. Currently in stealth, fine-tuning with a focus group of 15 companies. He is exploring roles at AI labs where he can contribute to the infrastructure and systems that make agents like Dzarvis possible.

---

**Contact:** mr.sucik@gmail.com | [danielsuchan.dev](https://danielsuchan.dev) | [LinkedIn](${PROFILE.linkedin}) | [GitHub](${PROFILE.github})

**Location:** Brno, Czech Republic — open to relocation globally. EU work authorization available.
`;
}
