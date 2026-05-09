/**
 * Build public machine-readable data — runs after vite build.
 *
 * Produces under dist/api/:
 *   - profile.json   — JSON Resume v1.0.0 schema (jsonresume.org/schema)
 *   - projects.json  — copy of src/data/projects.json
 *   - changelog.json — copy of src/data/changelog.json
 *   - bug-fixes.json — copy of src/data/bug-fixes.json
 *
 * These are mirrored as static files so AI agents and recruiter tools can
 * fetch a single canonical artifact for any aspect of Daniel's profile.
 *
 * Source-of-truth: src/data/projects.json + src/data/changelog.json. Anything
 * here must NEVER fabricate data not present in the source. Bio text is
 * pinned to copy already shipped on the home route — do not paraphrase.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST_DIR = join(ROOT, "dist");
const API_DIR = join(DIST_DIR, "api");
const SRC_DATA = join(ROOT, "src", "data");
const SITE_URL = "https://danielsuchan.dev";

interface Project {
  name: string;
  url?: string;
  role: string;
  description: string;
  stack: string[];
  status: "Active" | "Maintenance" | "Completed";
}

interface ProjectsData {
  projects: Project[];
}

function readJSON<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf-8")) as T;
}

function writeJSON(file: string, data: unknown): void {
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function buildProfile(projects: Project[]) {
  const lastModified = new Date().toISOString();

  // Highlight projects = anything Daniel founded/leads, capped at top 8 active.
  // Pulled directly from projects.json so this stays in sync automatically.
  const highlightProjects = projects
    .filter((p) => p.status === "Active")
    .slice(0, 8)
    .map((p) => ({
      name: p.name,
      description: p.description,
      ...(p.url ? { url: p.url } : {}),
      keywords: p.stack,
      roles: [p.role],
    }));

  // Skills aggregated from project tech stacks. Frequency-weighted top items
  // mirror what Daniel actually ships, not a self-reported list.
  const stackCounts = new Map<string, number>();
  for (const p of projects) {
    for (const tech of p.stack) {
      stackCounts.set(tech, (stackCounts.get(tech) ?? 0) + 1);
    }
  }
  const sortedStack = [...stackCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  return {
    $schema:
      "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: "Daniel Suchan",
      label: "CTO at Blaze",
      email: "mr.sucik@gmail.com",
      phone: "+420 777 783 404",
      url: SITE_URL,
      summary:
        "Engineer building production AI systems. Currently shipping Dzarvis — a multi-agent assistant on Claude, in stealth and fine-tuning with 15 companies. 8+ years writing production code, started at 16 with Czech court permission. CTO at Blaze, also running an algorithmic trading fund (suchan.capital).",
      location: {
        city: "Brno",
        countryCode: "CZ",
        region: "South Moravia",
      },
      profiles: [
        {
          network: "GitHub",
          username: "MrSucik",
          url: "https://github.com/MrSucik",
        },
        {
          network: "LinkedIn",
          username: "daniel-suchan-6b8611162",
          url: "https://www.linkedin.com/in/daniel-suchan-6b8611162/",
        },
      ],
    },
    work: [
      {
        name: "Blaze",
        position: "Co-Founder & CTO",
        startDate: "2022-01",
        summary:
          "Software development company leading multiple product teams. Building and shipping products for clients and internal ventures.",
        highlights: [
          "Lead engineering across multiple concurrent product lines",
          "Set technical direction, hire engineers, design system architecture",
          "Ship production AI infrastructure, including the Dzarvis multi-agent assistant",
        ],
      },
      {
        name: "Cantata Health",
        position: "Frontend & Mobile Lead",
        startDate: "2017-01",
        endDate: "2022-01",
        summary:
          "US healthcare enterprise application. Joined at 16 with Czech court permission to work on a US healthcare project.",
        highlights: [
          "Led frontend web + mobile development on a long-running healthcare platform",
          "Products built during this period are still in production today",
          "Started at age 16 — one of the youngest engineers approved to work on a US healthcare project under Czech court order",
        ],
      },
    ],
    skills: [
      {
        name: "Languages & Runtimes",
        keywords: sortedStack.filter((t) =>
          [
            "TypeScript",
            "Node.js",
            "Bun",
            "Hono",
          ].includes(t),
        ),
      },
      {
        name: "Frontend",
        keywords: sortedStack.filter((t) =>
          ["React", "React Native"].includes(t),
        ),
      },
      {
        name: "AI & Agents",
        keywords: ["Claude API", "MCP", "Multi-agent orchestration", "AI/ML"],
      },
      {
        name: "Data",
        keywords: sortedStack.filter((t) =>
          ["PostgreSQL", "SQLite"].includes(t),
        ),
      },
    ],
    languages: [
      { language: "Czech", fluency: "Native speaker" },
      { language: "English", fluency: "Professional working proficiency" },
    ],
    projects: highlightProjects,
    meta: {
      canonical: `${SITE_URL}/api/profile.json`,
      version: "v1.0.0",
      lastModified,
    },
  };
}

function main(): void {
  mkdirSync(API_DIR, { recursive: true });

  const projectsData = readJSON<ProjectsData>(
    join(SRC_DATA, "projects.json"),
  );
  const changelogData = readJSON<unknown>(join(SRC_DATA, "changelog.json"));
  const bugFixesData = readJSON<unknown>(join(SRC_DATA, "bug-fixes.json"));

  const profile = buildProfile(projectsData.projects);

  writeJSON(join(API_DIR, "profile.json"), profile);
  writeJSON(join(API_DIR, "projects.json"), projectsData);
  writeJSON(join(API_DIR, "changelog.json"), changelogData);
  writeJSON(join(API_DIR, "bug-fixes.json"), bugFixesData);

  console.log(
    `Public data: dist/api/{profile.json, projects.json, changelog.json, bug-fixes.json} written.`,
  );
}

main();
