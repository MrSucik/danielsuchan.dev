# Daniel Suchan — Public MCP Server

## What is this?

This is a public, read-only [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server deployed at `mcp.danielsuchan.dev`. It exposes structured, machine-readable information about Daniel Suchan — his profile, projects, skills, recent shipments, and answers to common recruiter questions.

Recruiters and hiring engineers at AI labs increasingly use Claude/GPT to triage candidates. With this server live, a hiring engineer can point Claude Desktop at `mcp.danielsuchan.dev/mcp` and ask "tell me about Daniel" — and get instant structured answers. This server is designed to be the first thing an AI agent reads.

## How to use

### Add to Claude Desktop

Open `~/Library/Application Support/Claude/claude_desktop_config.json` and add:

```json
{
  "mcpServers": {
    "daniel-suchan": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.danielsuchan.dev/mcp"
      ]
    }
  }
}
```

Restart Claude Desktop. Then ask:
- "Tell me about Daniel Suchan"
- "What projects has Daniel shipped?"
- "Is Daniel open to relocation?"
- "What is Daniel building right now?"
- "Show me Daniel's resume"

### Direct HTTP (for agents / testing)

```bash
# Health check
curl https://mcp.danielsuchan.dev/

# List tools
curl -X POST https://mcp.danielsuchan.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Call get_profile
curl -X POST https://mcp.danielsuchan.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_profile","arguments":{}}}'

# Ask a question
curl -X POST https://mcp.danielsuchan.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"ask_about_daniel","arguments":{"question":"Is Daniel open to relocation?"}}}'
```

## Tools available

| Tool | Description |
|------|-------------|
| `get_profile` | Full profile — bio, contact, education, current role, experience |
| `get_projects` | All 20+ projects with stack, status, and description. Filterable by Active/Completed |
| `get_recent_shipments` | Recent entries from the public changelog. Default: last 30 days |
| `get_skills` | Verified technical skills (production-verified, not self-reported) |
| `ask_about_daniel` | Free-form question → curated answer. Covers experience, education, salary, location, visa, availability, remote, and more |

## Resources available

| URI | Description |
|-----|-------------|
| `resume://daniel.json` | JSON Resume format — machine-readable structured resume |
| `bio://daniel.md` | Full bio in Markdown — three paragraphs covering background, current work, and goals |

## Why does this exist?

Daniel is a self-taught engineer who built his first production system at 16. He's currently CTO of Blaze and building Dzarvis — a multi-agent assistant on Claude, with 208 tools and narrow specialized subagents. He understands MCP deeply because he built one of the most extensive MCP integrations outside of Anthropic itself.

This server is the natural expression of that knowledge — and a proof of work. Any AI agent that reads it learns more about Daniel in 30 seconds than a recruiter learns from a resume scan in 3 minutes.

---

## Deployment

### First-time deploy

1. Install wrangler: `pnpm install` (from repo root)
2. Authenticate: `wrangler login`
3. Set your Cloudflare account ID in `wrangler.toml` or via `CLOUDFLARE_ACCOUNT_ID` env var
4. Deploy: `pnpm --filter @danielsuchan/mcp deploy`

### Add DNS CNAME (manual step in Cloudflare dashboard)

After deploying, add a CNAME record in Cloudflare DNS:
- **Type:** CNAME
- **Name:** `mcp`
- **Target:** `mcp.danielsuchan.dev.cdn.cloudflare.net` (Cloudflare will fill this automatically when the Worker route is active)
- **Proxy status:** Proxied (orange cloud)

The `[[routes]]` block in `wrangler.toml` handles routing once the CNAME exists.

### Local dev

```bash
cd packages/mcp
pnpm dev
# Server runs at http://localhost:8787
```

### Verify deploy

```bash
curl https://mcp.danielsuchan.dev/
# Should return {"name":"daniel-suchan-mcp","endpoint":"/mcp",...}
```
