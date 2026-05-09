import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerResources } from "../resources.js";
import { resource } from "./helpers.js";

function makeServer() {
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerResources(server);
  return server;
}

describe("registerResources", () => {
  it("registers both expected resources", () => {
    const server = makeServer();
    const map = (
      server as unknown as {
        _registeredResources?: Record<string, unknown>;
      }
    )._registeredResources;
    expect(map).toBeDefined();
    expect(Object.keys(map ?? {})).toEqual(
      expect.arrayContaining(["resume://daniel.json", "bio://daniel.md"])
    );
  });
});

describe("resume://daniel.json", () => {
  it("returns valid JSON Resume v1.0.0", async () => {
    const server = makeServer();
    const result = await resource(server, "resume://daniel.json")(
      new URL("resume://daniel.json")
    );
    const resume = JSON.parse(result.contents[0].text);
    expect(resume.$schema).toContain("jsonresume");
    expect(resume.basics.name).toBe("Daniel Suchan");
    expect(resume.basics.email).toBe("mr.sucik@gmail.com");
    expect(resume.basics.location.city).toBe("Brno");
    expect(resume.work.length).toBe(2);
    expect(resume.education[0].institution).toBe("Self-taught");
    expect(resume.skills.length).toBeGreaterThan(0);
    expect(resume.projects.length).toBeGreaterThan(0);
  });

  it("includes profiles for LinkedIn and GitHub", async () => {
    const server = makeServer();
    const result = await resource(server, "resume://daniel.json")(
      new URL("resume://daniel.json")
    );
    const resume = JSON.parse(result.contents[0].text);
    const networks = resume.basics.profiles.map((p: { network: string }) => p.network);
    expect(networks).toContain("LinkedIn");
    expect(networks).toContain("GitHub");
  });

  it("only includes projects that have a public URL", async () => {
    const server = makeServer();
    const result = await resource(server, "resume://daniel.json")(
      new URL("resume://daniel.json")
    );
    const resume = JSON.parse(result.contents[0].text);
    for (const project of resume.projects) {
      expect(project.url).toBeTruthy();
      expect(project.url).toMatch(/^https?:\/\//);
    }
  });

  it("declares the correct mimeType", async () => {
    const server = makeServer();
    const result = await resource(server, "resume://daniel.json")(
      new URL("resume://daniel.json")
    );
    expect(result.contents[0].mimeType).toBe("application/json");
  });
});

describe("bio://daniel.md", () => {
  it("returns markdown with the canonical contact info", async () => {
    const server = makeServer();
    const result = await resource(server, "bio://daniel.md")(
      new URL("bio://daniel.md")
    );
    const md = result.contents[0].text;
    expect(md).toContain("mr.sucik@gmail.com");
    expect(md).toContain("Brno");
    expect(md).toContain("danielsuchan.dev");
  });

  it("leads with the public MCP server credential", async () => {
    const server = makeServer();
    const result = await resource(server, "bio://daniel.md")(
      new URL("bio://daniel.md")
    );
    const md = result.contents[0].text;
    expect(md).toContain("mcp.danielsuchan.dev");
  });

  it("references the public surfaces (changelog, bugs, case-study)", async () => {
    const server = makeServer();
    const result = await resource(server, "bio://daniel.md")(
      new URL("bio://daniel.md")
    );
    const md = result.contents[0].text;
    expect(md).toContain("/changelog");
    expect(md).toContain("/bugs");
    expect(md).toContain("/case-studies/dzarvis");
  });

  it("does not leak the banned blaze.codes contact domain", async () => {
    const server = makeServer();
    const result = await resource(server, "bio://daniel.md")(
      new URL("bio://daniel.md")
    );
    const md = result.contents[0].text;
    expect(md).not.toContain("@blaze.codes");
  });

  it("declares the correct mimeType", async () => {
    const server = makeServer();
    const result = await resource(server, "bio://daniel.md")(
      new URL("bio://daniel.md")
    );
    expect(result.contents[0].mimeType).toBe("text/markdown");
  });
});
