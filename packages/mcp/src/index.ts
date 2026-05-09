import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { parseLimit, readDailyCalls } from "./ai/budget.js";
import type { Bindings } from "./ai/client.js";
import { registerAiTools } from "./ai/tools.js";
import { registerResources } from "./resources.js";
import { registerTools } from "./tools.js";

const SERVER_NAME = "daniel-suchan-mcp";
const SERVER_VERSION = "1.3.0";
const DEFAULT_DAILY_LIMIT = 80;

const app = new Hono<{ Bindings: Bindings }>();

// Allow Claude Desktop and other MCP clients to connect cross-origin.
app.use(
  "/mcp",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Accept", "Authorization"],
    exposeHeaders: ["Content-Type"],
    maxAge: 86400,
  })
);

app.all("/mcp", async (c) => {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerTools(server);
  registerResources(server);
  registerAiTools(server, c.env);

  const transport = new StreamableHTTPTransport();
  await server.connect(transport);
  return transport.handleRequest(c);
});

// Health check — useful for monitoring and verifying the Worker is live.
app.get("/", async (c) => {
  // c.env can be `undefined` when the Worker is invoked outside Cloudflare
  // (vitest, local fetch tests). Guard so the health endpoint stays 200.
  const env = (c.env ?? {}) as Partial<Bindings>;
  const limit = parseLimit(env.MAX_AI_CALLS_PER_DAY, DEFAULT_DAILY_LIMIT);
  const callsToday = await readDailyCalls(env.AI_BUDGET).catch(() => 0);
  return c.json({
    name: SERVER_NAME,
    version: SERVER_VERSION,
    endpoint: "/mcp",
    description: "Public MCP server for Daniel Suchan — readable by any AI agent.",
    tools: [
      "get_profile",
      "get_projects",
      "get_recent_shipments",
      "get_skills",
      "ask_about_daniel",
      "get_bug_fixes",
      "ai_ask",
      "ai_summarize",
      "ai_classify",
      "ai_extract_json",
      "ai_translate",
    ],
    resources: ["resume://daniel.json", "bio://daniel.md"],
    aiBudget: {
      callsToday,
      limit,
      // Tells operators (and curious agents) where the cap comes from. Useful
      // when calls are denied with isError so the caller knows to back off.
      window: "UTC day",
    },
  });
});

export default app;
