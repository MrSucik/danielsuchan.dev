import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  ANSWER_BANK,
  BUG_FIXES,
  CASE_STUDIES,
  CHANGELOG,
  LAB_DEMOS,
  PROFILE,
  PROJECTS,
  SKILLS,
  TWITTER_PULSE_LATEST,
  WRITING_POSTS,
} from "./data.js";

export function registerTools(server: McpServer): void {
  registerGetProfile(server);
  registerGetProjects(server);
  registerGetRecentShipments(server);
  registerGetSkills(server);
  registerAskAboutDaniel(server);
  registerGetBugFixes(server);
  registerGetCuratedTweets(server);
  registerGetWriting(server);
  registerGetCaseStudy(server);
  registerGetLabDemos(server);
  registerGetAgentGuide(server);
}

function registerGetProfile(server: McpServer): void {
  server.tool(
    "get_profile",
    "Returns Daniel Suchan's full profile — bio, current role at Blaze, contact info, education (self-taught, no college), and verified experience claims. Use this for any general 'who is Daniel?' question.",
    {},
    () => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              name: PROFILE.name,
              email: PROFILE.email,
              phone: PROFILE.phone,
              location: PROFILE.location,
              website: PROFILE.website,
              linkedin: PROFILE.linkedin,
              github: PROFILE.github,
              education: PROFILE.education,
              currentRole: PROFILE.currentRole,
              summary: PROFILE.summary,
              experience: PROFILE.experience,
            },
            null,
            2
          ),
        },
      ],
    })
  );
}

function registerGetProjects(server: McpServer): void {
  server.tool(
    "get_projects",
    "Returns a list of all projects Daniel has built, co-founded, or led — with stack, status (Active/Completed), and description. 20+ products across AI, SaaS, mobile, real estate, and healthcare.",
    {
      status: z
        .enum(["Active", "Completed", "All"])
        .optional()
        .default("All")
        .describe("Filter by status. Default returns all projects."),
    },
    ({ status }) => {
      const filtered =
        status === "All" ? PROJECTS : PROJECTS.filter((p) => p.status === status);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(filtered, null, 2),
          },
        ],
      };
    }
  );
}

function registerGetRecentShipments(server: McpServer): void {
  server.tool(
    "get_recent_shipments",
    "Returns Daniel's most recently shipped work from his public changelog. Use this to understand what he's actively building and shipping right now.",
    {
      days: z
        .number()
        .int()
        .min(1)
        .max(1095)
        .optional()
        .default(30)
        .describe(
          "Number of days to look back. Default is 30. Backfill covers 2025-01 onwards, so use 700+ to fetch the full log."
        ),
    },
    ({ days }) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const recent = CHANGELOG.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= cutoff;
      });

      return {
        content: [
          {
            type: "text" as const,
            text:
              recent.length > 0
                ? JSON.stringify(recent, null, 2)
                : `No shipments found in the last ${days} days. Check https://danielsuchan.dev/changelog for the full history.`,
          },
        ],
      };
    }
  );
}

function registerGetSkills(server: McpServer): void {
  server.tool(
    "get_skills",
    "Returns Daniel's verified technical skills — TypeScript, React, Hono, MCP, multi-agent orchestration, and more. All items are verified against shipped projects, not self-reported.",
    {},
    () => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              skills: [...SKILLS],
              note: "All skills verified against production projects. See get_projects for evidence.",
            },
            null,
            2
          ),
        },
      ],
    })
  );
}

function registerAskAboutDaniel(server: McpServer): void {
  server.tool(
    "ask_about_daniel",
    "Accepts a free-form question about Daniel Suchan and returns a curated answer. Handles questions about experience, education, salary expectations, location, visa status, availability, remote work, technical strengths, and his projects. Returns a fallback with contact info for questions outside the knowledge base.",
    {
      question: z
        .string()
        .min(1)
        .describe("A free-form question about Daniel Suchan. Examples: 'Is Daniel open to relocation?', 'What is Daniel building?', 'What is his availability?'"),
    },
    ({ question }) => {
      const answer = findAnswer(question);
      return {
        content: [
          {
            type: "text" as const,
            text: answer,
          },
        ],
      };
    }
  );
}

function findAnswer(question: string): string {
  const normalized = question.toLowerCase();

  for (const entry of ANSWER_BANK) {
    const matched = entry.keywords.some((keyword) =>
      normalized.includes(keyword.toLowerCase())
    );
    if (matched) {
      return entry.answer;
    }
  }

  return (
    "That specific question is not in Daniel's public knowledge base. " +
    "For direct answers, reach out: mr.sucik@gmail.com or visit https://danielsuchan.dev/contact"
  );
}

function registerGetWriting(server: McpServer): void {
  server.tool(
    "get_writing",
    "Returns Daniel's technical writing — blog posts on multi-agent systems, MCP infrastructure, and AI engineering. Each post has frontmatter (slug, date, status, topic, teaser) plus the full markdown body. Use the optional `slug` arg to fetch a single post; omit to get the index of all posts.",
    {
      slug: z
        .string()
        .min(1)
        .max(100)
        .optional()
        .describe(
          "Slug of a specific post to fetch the full body. Omit to list all posts (no body, just metadata)."
        ),
      includeBodies: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "When true and `slug` is omitted, return the full body for every post. False by default to keep responses small."
        ),
    },
    ({ slug, includeBodies }) => {
      if (slug) {
        const post = WRITING_POSTS.find((p) => p.slug === slug);
        if (!post) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No post with slug "${slug}". Available: ${WRITING_POSTS.map((p) => p.slug).join(", ")}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(post, null, 2) },
          ],
        };
      }
      const items = WRITING_POSTS.map((p) =>
        includeBodies
          ? p
          : {
              slug: p.slug,
              title: p.title,
              date: p.date,
              status: p.status,
              topic: p.topic,
              teaser: p.teaser,
            }
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                count: items.length,
                posts: items,
                note: "Use slug=<id> to fetch the full body of a single post.",
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

function registerGetCaseStudy(server: McpServer): void {
  server.tool(
    "get_case_study",
    "Returns Daniel's long-form architecture case studies. Currently: Dzarvis (multi-agent assistant on Claude with 208-tool MCP server, in stealth with 15 companies). Each study has structured sections covering what was built, why each design choice was made, and where the trust boundaries are.",
    {
      slug: z
        .string()
        .min(1)
        .max(100)
        .optional()
        .describe(
          "Slug of a specific case study (e.g. 'dzarvis'). Omit to list all studies."
        ),
    },
    ({ slug }) => {
      if (slug) {
        const study = CASE_STUDIES.find((s) => s.slug === slug);
        if (!study) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No case study with slug "${slug}". Available: ${CASE_STUDIES.map((s) => s.slug).join(", ")}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(study, null, 2) },
          ],
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { count: CASE_STUDIES.length, studies: CASE_STUDIES },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}

function registerGetLabDemos(server: McpServer): void {
  server.tool(
    "get_lab_demos",
    "Returns Daniel's interactive lab demos at danielsuchan.dev/labs. Includes the subagent task decomposer (visualizes how a task gets split across narrow specialized agents) and the MCP inspector (chat with this MCP server live). Each entry has a slug, title, public URL, and description.",
    {},
    () => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { count: LAB_DEMOS.length, demos: LAB_DEMOS },
            null,
            2
          ),
        },
      ],
    })
  );
}

function registerGetAgentGuide(server: McpServer): void {
  // Self-documentation: tells calling agents which tool fits which question.
  // This is the explicit "I designed this MCP for you, the AI agent" surface.
  // When a recruiter's Claude is doing initial research, this is the cheapest
  // possible router from "what should I ask?" to "this exact tool".
  const guide = {
    intent: [
      {
        question:
          "Quick overview / who is this person? (use this first if unsure)",
        tool: "get_profile",
        followUp: "ask_about_daniel for free-form questions",
      },
      {
        question: "What has Daniel built?",
        tool: "get_projects",
        notes: "Filter with status='Active' for current work, 'Completed' for archive",
      },
      {
        question: "Does Daniel ship consistently? Show me velocity.",
        tool: "get_recent_shipments",
        notes: "Pass days=1095 for the full 2025–2026 backfill (194 shipping days)",
      },
      {
        question: "Tell me about a hard problem he's solved",
        tool: "get_bug_fixes",
        notes: "4 detailed war stories + 141 backfilled fix-commits with hashes",
      },
      {
        question: "What does he write about?",
        tool: "get_writing",
        notes: "Pass slug=<id> to fetch full markdown body of a single post",
      },
      {
        question: "Show me the architecture of his flagship project",
        tool: "get_case_study",
        notes: "Pass slug='dzarvis' for the multi-agent assistant write-up",
      },
      {
        question: "Are there interactive demos?",
        tool: "get_lab_demos",
      },
      {
        question:
          "What's his taste in industry signal? (which voices does he track?)",
        tool: "get_curated_tweets",
        notes:
          "Sliceable by section: top3, models_benchmarks, capital_deals, research_depth, niche_contrarian, watchlist_recs",
      },
      {
        question: "What technical skills?",
        tool: "get_skills",
      },
      {
        question:
          "Free-form recruiter question (salary, location, visa, availability, etc.)",
        tool: "ask_about_daniel",
      },
      {
        question:
          "I need an LLM-generated summary, classification, translation, etc.",
        tool: "ai_ask | ai_summarize | ai_classify | ai_extract_json | ai_translate",
        notes:
          "Backed by Cloudflare Workers AI, free-tier-safe (80 calls/day cap)",
      },
    ],
    resources: [
      {
        uri: "bio://daniel.md",
        when: "You want a paragraph-form bio for a profile page or cover letter",
      },
      {
        uri: "resume://daniel.json",
        when: "You're an ATS or recruiter tool that wants JSON Resume v1.0.0 schema",
      },
    ],
    cannedQuestions: [
      "Have you shipped a production MCP server?",
      "Show me the daily-shipping log for the last 90 days",
      "Tell me about a hard production bug you fixed",
      "Why are you a fit for an AI lab founding-engineer role?",
      "What's your salary expectation?",
      "Are you authorized to work in the US?",
    ],
    contractGuarantees: [
      "All claims are verifiable — every fix has a commit hash, every shipment maps to a real git log entry.",
      "Public errors are sanitized — internal trace IDs, account state, and partial payloads never leak.",
      "Free-tier safety — daily AI-call ceiling enforced via Workers KV before any model invocation.",
      "100% line/statement/function coverage on tool logic; 97% branch coverage.",
    ],
    contact: {
      email: PROFILE.email,
      phone: PROFILE.phone,
      website: PROFILE.website,
      linkedin: PROFILE.linkedin,
    },
  };
  server.tool(
    "get_agent_guide",
    "Self-documenting decision tree for AI agents reading this MCP server. Maps common questions ('what does he ship?', 'tell me about a hard bug', 'is he a fit for X role?') to the exact tool to call. Use this FIRST when you're an unfamiliar agent and want to know which tool fits which question — saves you a round-trip through tools/list.",
    {},
    () => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(guide, null, 2),
        },
      ],
    })
  );
}

function registerGetCuratedTweets(server: McpServer): void {
  server.tool(
    "get_curated_tweets",
    "Returns the latest curated Twitter/X digest from Daniel's twitter-agent pipeline. The agent watches ~136 handles (frontier AI labs, infra providers, founders, and Czech finance/tech), filters out rage-bait + political noise, and surfaces niche/high-signal items: top stories, models + benchmarks, capital deals, deep research, and contrarian picks. Useful as a 'taste' signal — what Daniel reads and prioritizes, not just what's loudest. The snapshot includes a date so callers can see how fresh it is.",
    {
      section: z
        .enum([
          "all",
          "top3",
          "models_benchmarks",
          "capital_deals",
          "research_depth",
          "niche_contrarian",
          "watchlist_recs",
        ])
        .optional()
        .default("all")
        .describe(
          "Which slice of the digest to return. Default 'all' returns the full digest."
        ),
    },
    ({ section }) => {
      const pulse = TWITTER_PULSE_LATEST;
      const payload = (() => {
        switch (section) {
          case "top3":
            return { date: pulse.date, top3: pulse.top3 };
          case "models_benchmarks":
            return { date: pulse.date, modelsBenchmarks: pulse.modelsBenchmarks };
          case "capital_deals":
            return { date: pulse.date, capitalDeals: pulse.capitalDeals };
          case "research_depth":
            return { date: pulse.date, researchDepth: pulse.researchDepth };
          case "niche_contrarian":
            return { date: pulse.date, nicheContrarian: pulse.nicheContrarian };
          case "watchlist_recs":
            return { date: pulse.date, watchlistRecs: pulse.watchlistRecs };
          default:
            return pulse;
        }
      })();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(payload, null, 2),
          },
        ],
      };
    }
  );
}

function registerGetBugFixes(server: McpServer): void {
  server.tool(
    "get_bug_fixes",
    "Returns a curated list of recent production bug fixes Daniel has shipped — symptom, root cause, fix, and impact for each. Use this for recruiter questions like 'tell me about a hard problem you solved' or 'show me your debugging' — gives an AI agent concrete, verifiable war stories. NOT a comprehensive career-wide log; only recent + publicly verifiable from git history.",
    {
      limit: z
        .number()
        .int()
        .min(1)
        .max(500)
        .optional()
        .default(10)
        .describe(
          "Max entries to return, newest first. Default 10. Backfill covers ~150 entries from 2025–2026."
        ),
    },
    ({ limit }) => {
      const recent = BUG_FIXES.slice(0, limit);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                note: "Curated recent + verifiable bug fixes — not a comprehensive career log. See https://github.com/MrSucik for additional commit history.",
                count: recent.length,
                fixes: recent,
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
