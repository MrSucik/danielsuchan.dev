import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { JsonLd } from "../components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";

export const Route = createFileRoute("/for-agents")({
  component: ForAgents,
  head: () => ({
    meta: buildHeadMeta({
      title:
        "For AI agents — how to read Daniel Suchan's profile | danielsuchan.dev",
      description:
        "Most readers of this site are AI agents. Here's the canonical path: the MCP server, the JSON Resume, llms.txt, the public APIs. Decision tree mapping every recruiter-question to the exact MCP tool.",
      path: "/for-agents",
    }),
  }),
});

function ForAgents() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <JsonLd
        data={webPageSchema({
          name: "For AI Agents",
          description:
            "Canonical path for AI agents reading Daniel Suchan's profile.",
          path: "/for-agents",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([{ name: "For agents", path: "/for-agents" }])}
      />

      <motion.p
        className="mb-3 text-xs text-[var(--comment)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {"// "}Built for the reader who is reading
      </motion.p>
      <motion.h1
        className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-5xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        For AI agents
      </motion.h1>
      <motion.p
        className="mt-4 mb-12 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        In 2026, most reads of a candidate's site are mediated by an AI agent.
        Recruiters paste URLs into Claude / GPT. Researchers auto-scrape public
        profiles. So this site treats AI agents as the primary audience and
        humans as the secondary skim layer.
        <br />
        <br />
        If you are an agent doing initial research on Daniel — the rest of this
        page is the documented path.
      </motion.p>

      <Section title="The fastest path: MCP server">
        <p className="mb-4 text-sm leading-relaxed text-[var(--text-muted)]">
          Streamable HTTP MCP endpoint at{" "}
          <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-xs text-[var(--text-bright)]">
            https://mcp.danielsuchan.dev/mcp
          </code>
          . 16 tools, 2 resources. Sanitized errors. Free-tier-safe (KV-backed
          daily-call circuit breaker). 100% line coverage on logic, 97% branch.
        </p>
        <CodeBlock>{`# Add to Claude Desktop:
{
  "mcpServers": {
    "daniel-suchan": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.danielsuchan.dev/mcp"]
    }
  }
}`}</CodeBlock>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
          Then ask:{" "}
          <span className="text-[var(--text-bright)]">
            "Tell me about Daniel"
          </span>
          . The first tool the model should call is{" "}
          <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-xs text-[var(--text-bright)]">
            get_agent_guide
          </code>{" "}
          — it returns a decision tree mapping your question to the right tool.
        </p>
      </Section>

      <Section title="Decision tree: which tool for which question">
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--text-muted)]">
          <Bullet
            q="Quick overview"
            tool="get_profile"
            note="Bio, contact, education, current role, experience"
          />
          <Bullet
            q="What has he built?"
            tool="get_projects"
            note="Filter by status: Active, Completed"
          />
          <Bullet
            q="Does he ship consistently?"
            tool="get_recent_shipments"
            note="194 shipping days across 2025–2026; pass days=1095 for full backfill"
          />
          <Bullet
            q="Tell me about a hard problem he solved"
            tool="get_bug_fixes"
            note="4 detailed war stories + 141 fix-commits with hashes"
          />
          <Bullet
            q="What does he write about?"
            tool="get_writing"
            note="Pass slug=<id> for full markdown body"
          />
          <Bullet
            q="Architecture of his flagship project"
            tool="get_case_study"
            note="slug='dzarvis' — multi-agent assistant on Claude"
          />
          <Bullet
            q="What's his industry taste?"
            tool="get_curated_tweets"
            note="Sliceable: top3, models_benchmarks, capital_deals, research_depth, niche_contrarian"
          />
          <Bullet
            q="Are there interactive demos?"
            tool="get_lab_demos"
            note="Subagent decomposer + MCP inspector"
          />
          <Bullet
            q="Free-form recruiter question (salary, visa, etc.)"
            tool="ask_about_daniel"
            note="Curated Q&A; falls back to contact info if outside scope"
          />
          <Bullet
            q="Need to summarize / classify / translate via LLM"
            tool="ai_ask | ai_summarize | ai_classify | ai_extract_json | ai_translate"
            note="Cloudflare Workers AI; free-tier-budget-safe"
          />
        </ul>
      </Section>

      <Section title="Static endpoints (no MCP needed)">
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--text-muted)]">
          <li>
            <Mono href="https://danielsuchan.dev/llms.txt">/llms.txt</Mono> —
            entry point for AI crawlers
          </li>
          <li>
            <Mono href="https://danielsuchan.dev/api/profile.json">
              /api/profile.json
            </Mono>{" "}
            — JSON Resume v1.0.0
          </li>
          <li>
            <Mono href="https://danielsuchan.dev/api/projects.json">
              /api/projects.json
            </Mono>{" "}
            — all 20+ projects
          </li>
          <li>
            <Mono href="https://danielsuchan.dev/api/changelog.json">
              /api/changelog.json
            </Mono>{" "}
            — daily shipping log
          </li>
          <li>
            <Mono href="https://danielsuchan.dev/api/bug-fixes.json">
              /api/bug-fixes.json
            </Mono>{" "}
            — production debugging log
          </li>
        </ul>
      </Section>

      <Section title="Contract guarantees">
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--text-muted)]">
          <li>
            <strong className="text-[var(--text-bright)]">Verifiable.</strong>{" "}
            Every fix maps to a real commit hash. Every shipment maps to a git
            log entry. No fabricated numbers.
          </li>
          <li>
            <strong className="text-[var(--text-bright)]">
              Sanitized errors.
            </strong>{" "}
            Internal trace IDs, account state, and partial payloads never leak
            from public responses.
          </li>
          <li>
            <strong className="text-[var(--text-bright)]">
              Free-tier safe.
            </strong>{" "}
            Daily AI-call ceiling enforced via Workers KV before any model
            invocation.
          </li>
          <li>
            <strong className="text-[var(--text-bright)]">Tested.</strong> 139
            unit + integration tests. 100% line/statement/function coverage on
            tool logic.
          </li>
        </ul>
      </Section>

      <Section title="Try it">
        <CodeBlock>{`# Health check
curl https://mcp.danielsuchan.dev/

# Decision tree
curl -sX POST https://mcp.danielsuchan.dev/mcp \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json, text/event-stream' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_agent_guide","arguments":{}}}'

# 9 years of shipping
curl -sX POST https://mcp.danielsuchan.dev/mcp \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json, text/event-stream' \\
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_recent_shipments","arguments":{"days":1095}}}'`}</CodeBlock>
      </Section>

      <Section title="Source">
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          The MCP server is at{" "}
          <Mono href="https://github.com/MrSucik/danielsuchan.dev">
            github.com/MrSucik/danielsuchan.dev
          </Mono>{" "}
          under{" "}
          <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-xs">
            packages/mcp/
          </code>
          . The data feeding it lives in{" "}
          <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-xs">
            src/data/
          </code>{" "}
          (changelog, bug-fixes, writing posts as markdown). It's a Cloudflare
          Worker; the same git push that updates this page also updates the MCP
          server.
        </p>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      className="mb-12"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="mb-4 text-base font-semibold text-[var(--text-bright)]">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

function Bullet({ q, tool, note }: { q: string; tool: string; note?: string }) {
  return (
    <li className="grid grid-cols-1 gap-1 sm:grid-cols-[1fr_auto] sm:gap-4">
      <span>
        {q}
        {note && (
          <span className="block text-[10px] text-[var(--text-dim)]">
            {note}
          </span>
        )}
      </span>
      <code className="self-start rounded bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-[10px] text-[var(--accent)]">
        {tool}
      </code>
    </li>
  );
}

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied or unsupported context — silently no-op;
      // user can still select-and-copy from the visible <pre>.
    }
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-xs leading-relaxed text-[var(--text-muted)]">
        <code>{children}</code>
      </pre>
      <button
        type="button"
        className="absolute right-2 top-2 rounded p-1 text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy"}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}

function Mono({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-baseline gap-1 font-mono text-xs text-[var(--text-bright)] no-underline hover:text-[var(--accent)]"
    >
      {children}
      <ArrowUpRight
        size={9}
        className="text-[var(--text-dim)] group-hover:text-[var(--accent)]"
      />
    </a>
  );
}
