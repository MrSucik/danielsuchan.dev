import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { ANSWER_BANK, BUG_FIXES, CHANGELOG, PROJECTS } from "../data.js";
import { registerTools } from "../tools.js";
import { tool } from "./helpers.js";

function makeServer() {
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerTools(server);
  return server;
}

describe("get_profile", () => {
  it("returns the canonical profile JSON shape", async () => {
    const result = await tool(makeServer(), "get_profile")({});
    const profile = JSON.parse(result.content[0].text);
    expect(profile.name).toBe("Daniel Suchan");
    expect(profile.email).toBe("mr.sucik@gmail.com");
    expect(profile.location).toContain("Brno");
    expect(profile.education).toContain("Self-taught");
    expect(profile.experience.length).toBeGreaterThanOrEqual(2);
  });

  it("does not leak banned blaze.codes domain in any field", async () => {
    const result = await tool(makeServer(), "get_profile")({});
    expect(result.content[0].text).not.toContain("@blaze.codes");
    expect(result.content[0].text).not.toContain("danielsuchan.dev/blaze.codes");
  });
});

describe("get_projects", () => {
  it("returns all projects when status=All (default)", async () => {
    const result = await tool(makeServer(), "get_projects")({ status: "All" });
    const projects = JSON.parse(result.content[0].text);
    expect(projects.length).toBe(PROJECTS.length);
  });

  it("filters by Active status", async () => {
    const result = await tool(makeServer(), "get_projects")({
      status: "Active",
    });
    const projects = JSON.parse(result.content[0].text);
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.length).toBeLessThan(PROJECTS.length);
    for (const p of projects) {
      expect(p.status).toBe("Active");
    }
  });

  it("filters by Completed status", async () => {
    const result = await tool(makeServer(), "get_projects")({
      status: "Completed",
    });
    const projects = JSON.parse(result.content[0].text);
    for (const p of projects) {
      expect(p.status).toBe("Completed");
    }
  });
});

describe("get_recent_shipments", () => {
  it("returns entries within the requested days window", async () => {
    const result = await tool(makeServer(), "get_recent_shipments")({
      days: 1095,
    });
    const entries = JSON.parse(result.content[0].text);
    expect(entries.length).toBeGreaterThan(0);
    // Newest first
    expect(entries[0].date >= entries[entries.length - 1].date).toBe(true);
  });

  it("returns the fallback message when the window is empty", async () => {
    // Force an empty window by clearing the in-memory CHANGELOG with vi spy
    // would couple to internals; cleaner is to use a date guaranteed pre-data.
    // The CHANGELOG starts 2025-01-02 — a 1-day window from 2024-01-01 has
    // no entries, but tools use `new Date()` so we can't time-travel directly.
    // Instead: pass days=0 → cutoff is now, no entries match.
    const result = await tool(makeServer(), "get_recent_shipments")({ days: 0 });
    expect(result.content[0].text).toMatch(/No shipments found/);
    expect(result.content[0].text).toContain("https://danielsuchan.dev/changelog");
  });

  it("days=30 returns recent entries in correct shape", async () => {
    const result = await tool(makeServer(), "get_recent_shipments")({
      days: 30,
    });
    expect(result.content[0].type).toBe("text");
    // 30-day window will have at least the recent backfill entries
    const text = result.content[0].text;
    if (!text.startsWith("No shipments")) {
      const entries = JSON.parse(text);
      expect(Array.isArray(entries)).toBe(true);
    }
  });
});

describe("get_skills", () => {
  it("returns the full skills list with verification note", async () => {
    const result = await tool(makeServer(), "get_skills")({});
    const data = JSON.parse(result.content[0].text);
    expect(data.skills.length).toBeGreaterThanOrEqual(10);
    expect(data.note).toContain("verified");
  });
});

describe("ask_about_daniel", () => {
  // Each canonical recruiter question should hit a curated answer (not the
  // fallback). One representative question per ANSWER_BANK entry.
  it.each(ANSWER_BANK.map((e) => [e.keywords[0], e.keywords[0]]))(
    "returns curated answer for keyword %s",
    async (kw) => {
      const result = await tool(makeServer(), "ask_about_daniel")({
        question: `Tell me about ${kw}.`,
      });
      const text = result.content[0].text;
      expect(text.length).toBeGreaterThan(20);
      expect(text).not.toContain("not in Daniel's public knowledge base");
    }
  );

  it("returns the fallback message for an out-of-scope question", async () => {
    // NB: keyword matcher is substring-based, so this question must avoid
    // every token in ANSWER_BANK keywords. "zxqv" keeps it unambiguous.
    const result = await tool(makeServer(), "ask_about_daniel")({
      question: "zxqv unrelated query",
    });
    const text = result.content[0].text;
    expect(text).toContain("not in Daniel's public knowledge base");
    expect(text).toContain("mr.sucik@gmail.com");
  });
});

describe("get_bug_fixes", () => {
  it("respects the limit parameter", async () => {
    const result = await tool(makeServer(), "get_bug_fixes")({ limit: 5 });
    const data = JSON.parse(result.content[0].text);
    expect(data.count).toBe(5);
    expect(data.fixes.length).toBe(5);
  });

  it("clamps to the actual entry count when limit > total", async () => {
    const result = await tool(makeServer(), "get_bug_fixes")({ limit: 500 });
    const data = JSON.parse(result.content[0].text);
    expect(data.count).toBe(BUG_FIXES.length);
  });

  it("returns newest-first ordering", async () => {
    const result = await tool(makeServer(), "get_bug_fixes")({ limit: 10 });
    const data = JSON.parse(result.content[0].text);
    for (let i = 1; i < data.fixes.length; i++) {
      expect(data.fixes[i - 1].date >= data.fixes[i].date).toBe(true);
    }
  });

  it("includes the disclaimer note", async () => {
    const result = await tool(makeServer(), "get_bug_fixes")({ limit: 1 });
    const data = JSON.parse(result.content[0].text);
    expect(data.note).toContain("not a comprehensive");
  });
});

describe("get_writing", () => {
  it("returns the index without bodies by default", async () => {
    const result = await tool(makeServer(), "get_writing")({});
    const data = JSON.parse(result.content[0].text);
    expect(data.count).toBeGreaterThan(0);
    expect(data.posts[0].slug).toBeTruthy();
    expect(data.posts[0].body).toBeUndefined();
  });

  it("returns full bodies when includeBodies=true", async () => {
    const result = await tool(makeServer(), "get_writing")({ includeBodies: true });
    const data = JSON.parse(result.content[0].text);
    expect(data.posts[0].body.length).toBeGreaterThan(0);
  });

  it("returns a single post with body when slug is provided", async () => {
    const result = await tool(makeServer(), "get_writing")({
      slug: "agent-sandboxes-infra",
    });
    const post = JSON.parse(result.content[0].text);
    expect(post.slug).toBe("agent-sandboxes-infra");
    expect(post.body.length).toBeGreaterThan(0);
  });

  it("flags isError when slug is unknown", async () => {
    const result = await tool(makeServer(), "get_writing")({
      slug: "no-such-post-12345",
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/No post with slug/);
    expect(result.content[0].text).toContain("Available:");
  });
});

describe("get_case_study", () => {
  it("returns all studies when no slug", async () => {
    const result = await tool(makeServer(), "get_case_study")({});
    const data = JSON.parse(result.content[0].text);
    expect(data.count).toBeGreaterThan(0);
    expect(data.studies[0].slug).toBeTruthy();
  });

  it("returns a single study when slug is provided", async () => {
    const result = await tool(makeServer(), "get_case_study")({
      slug: "dzarvis",
    });
    const study = JSON.parse(result.content[0].text);
    expect(study.slug).toBe("dzarvis");
    expect(study.sections.length).toBeGreaterThan(0);
  });

  it("flags isError when slug is unknown", async () => {
    const result = await tool(makeServer(), "get_case_study")({
      slug: "no-such-study",
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/No case study/);
  });
});

describe("get_lab_demos", () => {
  it("returns all demos with structured metadata", async () => {
    const result = await tool(makeServer(), "get_lab_demos")({});
    const data = JSON.parse(result.content[0].text);
    expect(data.count).toBeGreaterThan(0);
    for (const demo of data.demos) {
      expect(demo.slug).toBeTruthy();
      expect(demo.url).toMatch(/^https?:\/\//);
      expect(demo.description.length).toBeGreaterThan(10);
    }
  });
});

describe("get_agent_guide", () => {
  it("returns a decision tree mapping intents to tools", async () => {
    const result = await tool(makeServer(), "get_agent_guide")({});
    const guide = JSON.parse(result.content[0].text);
    expect(Array.isArray(guide.intent)).toBe(true);
    expect(guide.intent.length).toBeGreaterThan(5);
    for (const i of guide.intent) {
      expect(i.question).toBeTruthy();
      expect(i.tool).toBeTruthy();
    }
  });

  it("references all major MCP tools in the intent map", async () => {
    const result = await tool(makeServer(), "get_agent_guide")({});
    const guide = JSON.parse(result.content[0].text);
    const referencedTools = guide.intent.map((i: { tool: string }) => i.tool).join(" ");
    for (const expected of [
      "get_profile",
      "get_projects",
      "get_recent_shipments",
      "get_bug_fixes",
      "get_writing",
      "get_case_study",
      "ask_about_daniel",
    ]) {
      expect(referencedTools).toContain(expected);
    }
  });

  it("declares contract guarantees that match the production reality", async () => {
    const result = await tool(makeServer(), "get_agent_guide")({});
    const guide = JSON.parse(result.content[0].text);
    expect(guide.contractGuarantees).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/verifiable/i),
        expect.stringMatching(/sanitized/i),
        expect.stringMatching(/free.tier/i),
      ])
    );
  });

  it("includes canonical contact info", async () => {
    const result = await tool(makeServer(), "get_agent_guide")({});
    const guide = JSON.parse(result.content[0].text);
    expect(guide.contact.email).toBe("mr.sucik@gmail.com");
    expect(guide.contact.website).toBe("https://danielsuchan.dev");
  });
});

describe("get_curated_tweets", () => {
  it.each([
    "all",
    "top3",
    "models_benchmarks",
    "capital_deals",
    "research_depth",
    "niche_contrarian",
    "watchlist_recs",
  ] as const)("returns valid payload for section=%s", async (section) => {
    const result = await tool(makeServer(), "get_curated_tweets")({ section });
    const data = JSON.parse(result.content[0].text);
    expect(data.date).toBeDefined();
    if (section !== "all") {
      // Each slice returns date + the matching field
      const expectedFieldMap: Record<string, string> = {
        top3: "top3",
        models_benchmarks: "modelsBenchmarks",
        capital_deals: "capitalDeals",
        research_depth: "researchDepth",
        niche_contrarian: "nicheContrarian",
        watchlist_recs: "watchlistRecs",
      };
      const field = expectedFieldMap[section];
      expect(data[field]).toBeDefined();
    }
  });

  it("default (no section) returns full digest", async () => {
    const result = await tool(makeServer(), "get_curated_tweets")({});
    const data = JSON.parse(result.content[0].text);
    expect(data.daySummary).toBeDefined();
    expect(data.top3.length).toBeGreaterThan(0);
  });
});

describe("data integrity checks", () => {
  it("CHANGELOG is sorted newest-first", () => {
    for (let i = 1; i < CHANGELOG.length; i++) {
      expect(CHANGELOG[i - 1].date >= CHANGELOG[i].date).toBe(true);
    }
  });

  it("BUG_FIXES is sorted newest-first", () => {
    for (let i = 1; i < BUG_FIXES.length; i++) {
      expect(BUG_FIXES[i - 1].date >= BUG_FIXES[i].date).toBe(true);
    }
  });

  it("no leak markers in CHANGELOG (OLAOLA / @blaze-it / inside.blaze)", () => {
    const json = JSON.stringify(CHANGELOG);
    expect(json).not.toMatch(/OLAOLA|olaola|@blaze-it|inside\.blaze/i);
  });

  it("no leak markers in BUG_FIXES", () => {
    const json = JSON.stringify(BUG_FIXES);
    expect(json).not.toMatch(/OLAOLA|olaola|@blaze-it|inside\.blaze/i);
  });

  it("no leftover (#NNNN) PR refs in changelog bullets", () => {
    for (const entry of CHANGELOG) {
      for (const ship of entry.shipments) {
        for (const bullet of ship.bullets) {
          expect(bullet).not.toMatch(/\(#\d+\)/);
        }
      }
    }
  });

  it("every bug-fix has a non-empty project + title", () => {
    for (const fix of BUG_FIXES) {
      expect(typeof fix.project).toBe("string");
      expect(fix.project.length).toBeGreaterThan(0);
      expect(typeof fix.title).toBe("string");
      expect(fix.title.length).toBeGreaterThan(5);
    }
  });
});
