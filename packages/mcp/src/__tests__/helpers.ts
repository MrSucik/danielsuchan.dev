/**
 * Shared test helpers — single source of truth for the (necessarily fragile)
 * casts that reach into the MCP SDK's private state. Keeping them here means
 * that if the SDK changes the field name (e.g. `_registeredTools` → something
 * else in v2.x), there's exactly one place to update.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export type ToolHandler = (
  args: unknown,
  extra?: unknown
) => Promise<{
  content: Array<{ type: string; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}>;

export type ResourceReader = (uri: URL) => Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}>;

interface RegisteredTool {
  handler: ToolHandler;
}
interface RegisteredResource {
  readCallback: ResourceReader;
}

/**
 * Returns the map of registered tools on an McpServer instance.
 * Reaches through `_registeredTools` (SDK-private) — wrapped in one place so
 * if the SDK renames the field, only this helper needs updating.
 */
export function getRegisteredTools(
  server: McpServer
): Record<string, RegisteredTool> {
  return (
    (
      server as unknown as {
        _registeredTools?: Record<string, RegisteredTool>;
      }
    )._registeredTools ?? {}
  );
}

/** Returns the registered tool's handler, throwing if the tool isn't registered. */
export function tool(server: McpServer, name: string): ToolHandler {
  const map = getRegisteredTools(server);
  const entry = map[name];
  if (!entry) {
    throw new Error(
      `tool not registered: ${name}. Registered: ${Object.keys(map).join(", ")}`
    );
  }
  return entry.handler;
}

/** Returns the registered resource's read callback, throwing if not present. */
export function resource(server: McpServer, uri: string): ResourceReader {
  const map =
    (
      server as unknown as {
        _registeredResources?: Record<string, RegisteredResource>;
      }
    )._registeredResources ?? {};
  const entry = map[uri];
  if (!entry) {
    throw new Error(
      `resource not registered: ${uri}. Registered: ${Object.keys(map).join(", ")}`
    );
  }
  return entry.readCallback;
}
