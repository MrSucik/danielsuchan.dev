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

# Summarize text via Workers AI
curl -X POST https://mcp.danielsuchan.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"ai_summarize","arguments":{"text":"<long text>","length":"short"}}}'
```

## Tools available

### Profile tools (deterministic, no LLM)

| Tool | Description |
|------|-------------|
| `get_profile` | Full profile — bio, contact, education, current role, experience |
| `get_projects` | All 20+ projects with stack, status, and description. Filterable by Active/Completed |
| `get_recent_shipments` | Recent entries from the public changelog. Default: last 30 days |
| `get_skills` | Verified technical skills (production-verified, not self-reported) |
| `ask_about_daniel` | Free-form question → curated answer. Covers experience, education, salary, location, visa, availability, remote, and more |

### AI tools (Cloudflare Workers AI)

These delegate to a small LLM running on Cloudflare Workers AI. Default model is `@cf/meta/llama-3.1-8b-instruct` — cheap, fast, ≈30–100 Neurons per call. Free tier covers ~10K Neurons/day.

| Tool | Description |
|------|-------------|
| `ai_ask` | Free-form Q&A. Optional `system` prompt and `model` override. |
| `ai_summarize` | Summarize text. `length` ∈ short/medium/long, optional `style` hint. |
| `ai_classify` | Classify into one of provided `labels`. Returns `{label, rationale}` as structured content. |
| `ai_extract_json` | Extract structured JSON from unstructured text given a plain-English `schema_description`. |
| `ai_translate` | Translate to `target_language`. Source auto-detected unless `source_language` is given. |

Available models (override per-call via `model` arg): `llama-3.1-8b` (default), `llama-3.3-70b`, `qwen-32b-coder`, `gemma-7b`.

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

Deployed as a Docker container on the Hetzner Coolify host. The included `Dockerfile` produces a small Node 22 Alpine image; Coolify handles TLS via Let's Encrypt and routes `mcp.danielsuchan.dev` to the container via Traefik.

### First-time deploy (Coolify UI)

1. In Coolify dashboard → **+ New Resource** → **Public Repository**
2. Repository: `https://github.com/MrSucik/danielsuchan.dev`, branch `master`
3. Build pack: **Dockerfile**
4. Base directory: `packages/mcp`
5. Dockerfile location: `packages/mcp/Dockerfile`
6. Domain: `mcp.danielsuchan.dev` — Coolify will request a Let's Encrypt cert automatically
7. Port: `3000`
8. Healthcheck: `GET /` returns 200
9. Click **Deploy**

### DNS

Point `mcp.danielsuchan.dev` at the Hetzner host IP via an `A` record at whichever DNS provider hosts `danielsuchan.dev`. No proxying or tunnel needed — Coolify's Traefik handles HTTPS directly on port 443.

### Local dev

```bash
cd packages/mcp
pnpm install
pnpm build
PORT=3000 pnpm start
# Server runs at http://localhost:3000
curl http://localhost:3000/
```

### Verify deploy

```bash
curl https://mcp.danielsuchan.dev/
# Should return {"name":"daniel-suchan-mcp","endpoint":"/mcp",...}
```
