import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AIBinding } from "./ai/client.js";
import { registerAiTools } from "./ai/tools.js";
import { registerResources } from "./resources.js";
import { registerTools } from "./tools.js";

const SERVER_NAME = "daniel-suchan-mcp";
const SERVER_VERSION = "1.1.0";

type Bindings = {
  AI: AIBinding;
};

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
  registerAiTools(server, { AI: c.env.AI });

  const transport = new StreamableHTTPTransport();
  await server.connect(transport);
  return transport.handleRequest(c);
});

// Health check — useful for monitoring and verifying the Worker is live.
app.get("/", (c) =>
  c.json({
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
      "ai_ask",
      "ai_summarize",
      "ai_classify",
      "ai_extract_json",
      "ai_translate",
    ],
    resources: ["resume://daniel.json", "bio://daniel.md"],
  })
);

export default app;
