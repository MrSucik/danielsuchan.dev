# Daniel Suchan — Public MCP Server

## What is this?

This is a public, read-only [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server deployed at `mcp.danielsuchan.dev`. It exposes structured, machine-readable information about Daniel Suchan — his profile, projects, skills, recent shipments, and answers to common recruiter questions — plus a set of generic AI-powered tools backed by Cloudflare Workers AI.

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

These delegate to a small LLM running on Cloudflare Workers AI (default `@cf/meta/llama-3.1-8b-instruct`). Free tier: 10,000 Neurons/day (resets at 00:00 UTC) — see the Workers AI dashboard for actual per-call cost.

| Tool | Description |
|------|-------------|
| `ai_ask` | Free-form Q&A. Optional `system` prompt and `model` override. |
| `ai_summarize` | Summarize text. `length` ∈ short/medium/long, optional `style` hint. |
| `ai_classify` | Classify into one of provided `labels`. Returns `{label, rationale}` as structured content; flags `isError` on out-of-set labels. |
| `ai_extract_json` | Extract a top-level JSON object from text given `schemaDescription`. Detects model error envelopes. |
| `ai_translate` | Translate to `targetLanguage`. Source auto-detected unless `sourceLanguage` is given. |

Available models (override per-call via `model` arg, see `src/ai/models.ts` for the canonical list): `llama-3.1-8b` (default), `llama-3.3-70b`, `qwen-32b-coder`, `gemma-7b`.

All AI tool inputs have hard length caps to prevent quota-drain abuse. Errors are sanitized: details are logged server-side, the public response surface only carries generic messages.

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

Deployed as a Cloudflare Worker. The `[ai]` binding in `wrangler.toml` provides Workers AI inference at the edge; Cloudflare manages TLS and routing automatically via the `mcp.danielsuchan.dev` route binding.

### Deploy

```bash
# from the repo root, deploy the @danielsuchan/mcp package
pnpm --filter @danielsuchan/mcp deploy
# or, from packages/mcp/:
pnpm deploy
```

Wrangler reads `packages/mcp/wrangler.toml` for the route, AI binding, and compatibility flags. First-time deploys require `wrangler login` and that the `danielsuchan.dev` zone exist in your Cloudflare account.

### Local dev

```bash
cd packages/mcp
pnpm install
pnpm dev
# Wrangler dev server runs at http://localhost:8787 by default
curl http://localhost:8787/
```

`wrangler dev` proxies the `[ai]` binding to Cloudflare's remote Workers AI, so AI tools work locally and consume the same daily Neuron budget. To force pure-local mode without the AI binding, omit the `[ai]` block — the server will register profile tools only and log a warning.

### Verify deploy

```bash
curl https://mcp.danielsuchan.dev/
# Should return {"name":"daniel-suchan-mcp","version":"1.1.0","endpoint":"/mcp",...}
```

### Tests + typecheck

```bash
pnpm test         # vitest unit tests
pnpm typecheck    # tsc --noEmit
```
