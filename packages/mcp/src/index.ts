import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerResources } from "./resources.js";
import { registerTools } from "./tools.js";

const SERVER_NAME = "daniel-suchan-mcp";
const SERVER_VERSION = "1.0.0";

const app = new Hono();

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
    ],
    resources: ["resume://daniel.json", "bio://daniel.md"],
  })
);

export default app;
