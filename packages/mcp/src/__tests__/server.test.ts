import { describe, expect, it } from "vitest";

/**
 * MCP server smoke tests.
 *
 * These tests verify the server starts correctly, tools/list returns
 * expected tool names, and the health check endpoint is operational.
 *
 * Heavy MCP protocol integration is covered by the SDK's own tests;
 * here we focus on the contract surface that matters for callers.
 */

const EXPECTED_TOOLS = [
  "get_profile",
  "get_projects",
  "get_recent_shipments",
  "get_skills",
  "ask_about_daniel",
];

const EXPECTED_RESOURCES = ["resume://daniel.json", "bio://daniel.md"];

describe("MCP Server — tool registration", () => {
  it("exports all expected tool names in the manifest", async () => {
    const { registerTools } = await import("../tools.js");
    const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");

    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerTools(server);

    // Access registered tools via the internal map.
    // McpServer stores registered tools in _registeredTools (SDK v1.x).
    // We verify by checking the tool names match expectations.
    const registeredToolNames = Object.keys(
      (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools ?? {}
    );

    for (const expected of EXPECTED_TOOLS) {
      expect(registeredToolNames).toContain(expected);
    }
  });

  it("registers expected resources", async () => {
    const { registerResources } = await import("../resources.js");
    const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");

    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerResources(server);

    const registeredResourceNames = Object.keys(
      (server as unknown as { _registeredResources: Record<string, unknown> })
        ._registeredResources ?? {}
    );

    for (const expected of EXPECTED_RESOURCES) {
      expect(registeredResourceNames).toContain(expected);
    }
  });
});

describe("MCP Server — health endpoint", () => {
  it("GET / returns expected shape", async () => {
    const { default: app } = await import("../index.js");

    const res = await app.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toMatchObject({
      name: "daniel-suchan-mcp",
      endpoint: "/mcp",
    });

    for (const tool of EXPECTED_TOOLS) {
      expect((body as { tools: string[] }).tools).toContain(tool);
    }
  });
});

describe("ask_about_daniel — answer bank", () => {
  it("returns experience answer for 'experience' keyword", async () => {
    const { ANSWER_BANK } = await import("../data.js");
    const entry = ANSWER_BANK.find((e) => e.keywords.includes("experience"));
    expect(entry).toBeDefined();
    expect(entry?.answer).toContain("8 years");
  });

  it("returns education answer for 'college' keyword", async () => {
    const { ANSWER_BANK } = await import("../data.js");
    const entry = ANSWER_BANK.find((e) => e.keywords.includes("college"));
    expect(entry).toBeDefined();
    expect(entry?.answer).toContain("Self-taught");
  });

  it("returns visa answer for 'visa' keyword", async () => {
    const { ANSWER_BANK } = await import("../data.js");
    const entry = ANSWER_BANK.find((e) => e.keywords.includes("visa"));
    expect(entry).toBeDefined();
    expect(entry?.answer).toContain("EU citizen");
  });

  it("answer bank contains no blaze.codes references", async () => {
    const { ANSWER_BANK, PROFILE } = await import("../data.js");
    const allText = JSON.stringify(ANSWER_BANK) + JSON.stringify(PROFILE);
    expect(allText).not.toContain("blaze.codes");
  });
});

describe("profile data — canonical checks", () => {
  it("contains correct email", async () => {
    const { PROFILE } = await import("../data.js");
    expect(PROFILE.email).toBe("mr.sucik@gmail.com");
  });

  it("contains correct phone", async () => {
    const { PROFILE } = await import("../data.js");
    expect(PROFILE.phone).toBe("+420 777 783 404");
  });

  it("location is Brno not Prague", async () => {
    const { PROFILE } = await import("../data.js");
    expect(PROFILE.location).toContain("Brno");
    expect(PROFILE.location).not.toContain("Prague");
  });

  it("no banned phone number appears anywhere", async () => {
    const { PROFILE, ANSWER_BANK } = await import("../data.js");
    const allText = JSON.stringify(PROFILE) + JSON.stringify(ANSWER_BANK);
    expect(allText).not.toContain("735036305");
  });
});
