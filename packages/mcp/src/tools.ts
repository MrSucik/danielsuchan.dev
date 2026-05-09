import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  ANSWER_BANK,
  BUG_FIXES,
  CHANGELOG,
  PROFILE,
  PROJECTS,
  SKILLS,
} from "./data.js";

export function registerTools(server: McpServer): void {
  registerGetProfile(server);
  registerGetProjects(server);
  registerGetRecentShipments(server);
  registerGetSkills(server);
  registerAskAboutDaniel(server);
  registerGetBugFixes(server);
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
        .max(365)
        .optional()
        .default(30)
        .describe("Number of days to look back. Default is 30."),
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

function registerGetBugFixes(server: McpServer): void {
  server.tool(
    "get_bug_fixes",
    "Returns a curated list of recent production bug fixes Daniel has shipped — symptom, root cause, fix, and impact for each. Use this for recruiter questions like 'tell me about a hard problem you solved' or 'show me your debugging' — gives an AI agent concrete, verifiable war stories. NOT a comprehensive career-wide log; only recent + publicly verifiable from git history.",
    {
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .default(10)
        .describe("Max entries to return, newest first. Default 10."),
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
