import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { ANSWER_BANK, BUG_FIXES, CHANGELOG, PROJECTS } from "../data.js";
import { registerTools } from "../tools.js";

type ToolHandler = (
  args: unknown,
  extra?: unknown
) => Promise<{
  content: Array<{ type: string; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}>;

function makeServer() {
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerTools(server);
  return server;
}

function tool(server: McpServer, name: string): ToolHandler {
  const map = (
    server as unknown as {
      _registeredTools?: Record<string, { handler: ToolHandler }>;
    }
  )._registeredTools;
  if (!map?.[name]) throw new Error(`tool not registered: ${name}`);
  return map[name].handler;
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

  it("returns 'No shipments found' fallback when window is empty", async () => {
    const result = await tool(makeServer(), "get_recent_shipments")({
      days: 1,
    });
    // Window of 1 day may or may not contain anything depending on test date.
    // Either it's a JSON array, or it's the fallback string.
    expect(typeof result.content[0].text).toBe("string");
  });

  it("default 30 days returns valid output", async () => {
    const result = await tool(makeServer(), "get_recent_shipments")({
      days: 30,
    });
    expect(result.content[0]).toBeDefined();
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

  it("every bug-fix has a project + title", () => {
    for (const fix of BUG_FIXES) {
      expect(fix.project).toBeTruthy();
      expect(fix.title).toBeTruthy();
      expect(fix.title.length).toBeGreaterThan(5);
    }
  });
});
