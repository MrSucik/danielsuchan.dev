import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  ANSWER_BANK,
  BUG_FIXES,
  CHANGELOG,
  PROFILE,
  PROJECTS,
  SKILLS,
  TWITTER_PULSE_LATEST,
} from "./data.js";

export function registerTools(server: McpServer): void {
  registerGetProfile(server);
  registerGetProjects(server);
  registerGetRecentShipments(server);
  registerGetSkills(server);
  registerAskAboutDaniel(server);
  registerGetBugFixes(server);
  registerGetCuratedTweets(server);
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
