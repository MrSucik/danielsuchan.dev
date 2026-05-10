import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import { breadcrumbSchema, mcpCaseStudySchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";

export const Route = createFileRoute("/case-studies/mcp")({
  component: McpCaseStudy,
  head: () => ({
    meta: buildHeadMeta({
      title:
        "mcp.danielsuchan.dev — Hardened public MCP server | Case Study – Daniel Suchan",
      description:
        "Architecture writeup for mcp.danielsuchan.dev: a public, free-tier-safe MCP server with 16 tools, KV-based budget circuit breaker, sanitized errors, and 100% line coverage on logic.",
      path: "/case-studies/mcp",
    }),
  }),
});

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, delay },
});

const viewportFadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" } as const,
  transition: { duration: 0.45, delay },
});

const hardeningPoints = [
  {
    title: "Budget circuit breaker",
    body: "One Workers KV key per day. Counter increments on every AI call. Above 80 calls/day (~8K of 10K Neuron quota), all AI tools return a 429-style error envelope until midnight UTC. No second-level rate limiting — overkill at this scale.",
  },
  {
    title: "Sanitized errors at the trust boundary",
    body: "Internal failures get console.error for wrangler tail. Public callers see a generic envelope with no trace IDs, account state, or partial prompt echoes. The first version leaked Workers AI trace IDs — fixed at commit 1c53bb6.",
  },
  {
    title: "Per-input length caps",
    body: "Every tool input has a Zod-defined max length. Without this, a 1 MB prompt wastes compute before validation. With it, oversized input fails before the AI binding is hit.",
  },
  {
    title: "100% line coverage on logic",
    body: "139 tests across unit + integration + live E2E. Integration tests run against app.fetch(new Request(...)) — no full-Worker spin-up. Live tests gated on MCP_LIVE_TESTS=1 so they don't run on every push.",
  },
];

const stack = [
  "TypeScript",
  "Hono",
  "Cloudflare Workers",
  "Workers KV",
  "Workers AI",
  "MCP SDK",
  "Zod",
  "Vitest",
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-lg font-bold tracking-tight text-[var(--text-bright)] md:text-xl">
      {children}
    </h2>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-sm leading-relaxed text-[var(--text-muted)]">
      {children}
    </p>
  );
}

function HardeningCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-4">
      <p className="mb-1.5 text-xs font-semibold text-[var(--text-bright)]">
        {title}
      </p>
      <p className="text-xs leading-relaxed text-[var(--text-muted)]">{body}</p>
    </div>
  );
}

function McpCaseStudy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <JsonLd data={mcpCaseStudySchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Case Studies", path: "/case-studies" },
          { name: "MCP", path: "/case-studies/mcp" },
        ])}
      />

      {/* Back link */}
      <motion.div className="mb-6" {...fadeIn(0)}>
        <Link
          to="/case-studies"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--accent)]"
        >
          <ArrowLeft size={11} /> Case studies
        </Link>
      </motion.div>

      {/* Hero */}
      <motion.p className="mb-3 text-xs text-[var(--comment)]" {...fadeIn(0)}>
        {"// "}Case study
      </motion.p>

      <motion.h1
        className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-5xl"
        {...fadeUp(0.05)}
      >
        <span className="text-[var(--accent)]">mcp.danielsuchan.dev</span> — a
        hardened public MCP server
      </motion.h1>

      <motion.p
        className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]"
        {...fadeUp(0.1)}
      >
        Public, free-tier-safe MCP server. Streamable HTTP transport, 16 tools,
        KV-based daily budget circuit breaker, sanitized public errors, 100%
        line coverage on logic.
      </motion.p>

      <motion.div className="mt-5 mb-14 flex flex-wrap gap-2" {...fadeIn(0.15)}>
        <span className="tag badge-active">Live</span>
        <span className="tag">Free-tier safe</span>
        <span className="tag">16 tools</span>
      </motion.div>

      {/* The Problem */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>The problem</SectionHeader>
        <Prose>
          A personal MCP server is a strange thing to run. It is neither a
          product nor a portfolio piece — it is a typed surface for AI agents to
          read about Daniel without scraping HTML. The interesting design
          question is how to expose it publicly without leaking sensitive data,
          burning a Cloudflare bill on the first abusive caller, or shipping
          something that breaks on contact with real-world MCP clients.
        </Prose>
        <Prose>
          Three constraints made the problem non-trivial. First, public and
          unauthenticated — anyone can call any tool, no API key, no rate-limit
          gate beyond what the design itself provides. Second, free tier —
          Workers AI gives 10K Neurons of quota per day; running out is a hard
          failure that takes the AI tools offline. Third, agent-first audience —
          the reader is usually a model, not a person. Errors must be
          self-explanatory. Surfaces must be discoverable.
        </Prose>
      </motion.section>

      {/* Architecture */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>Architecture</SectionHeader>
        <Prose>
          The whole thing is one Cloudflare Worker on Hono. Streamable HTTP
          transport (the modern MCP transport, not stdio). One{" "}
          <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-bright)]">
            tools/list
          </code>
          , one{" "}
          <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-bright)]">
            tools/call
          </code>
          , plus a few read-only resources.
        </Prose>
        <Prose>
          Tools land in <code className="font-mono text-[12px]">tools.ts</code>{" "}
          as Zod-validated handlers. Static profile data lives in{" "}
          <code className="font-mono text-[12px]">data.ts</code> alongside JSON
          files synced from the site's source-of-truth (changelog, bug-fixes,
          writing, case-studies, labs). Workers KV holds the daily budget
          counter — one read plus one write per AI call. Workers AI is bound
          directly to the Worker, no extra HTTP hop.
        </Prose>
        <Prose>
          A small build-time script reads markdown frontmatter from{" "}
          <code className="font-mono text-[12px]">src/data/writing/*.md</code>{" "}
          and case-study/labs metadata from the site's TSX, then writes JSON
          into the MCP package. The Worker bundles those JSON files at build
          time. One source of truth. No drift between site and MCP — CI fails if
          the JSON is regenerated and differs from what was committed.
        </Prose>
      </motion.section>

      {/* Hardening */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>Hardening</SectionHeader>
        <Prose>
          Public + unauthenticated + AI-backed is a recipe for either a
          surprising Cloudflare invoice or a user-facing outage when the quota
          runs dry. Four mechanical pieces close the worst-case paths.
        </Prose>

        <motion.div
          className="mt-6 grid gap-3 sm:grid-cols-2"
          {...viewportFadeUp(0.05)}
        >
          {hardeningPoints.map((point) => (
            <HardeningCard
              key={point.title}
              title={point.title}
              body={point.body}
            />
          ))}
        </motion.div>
      </motion.section>

      {/* Agent-first surfaces */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>Agent-first surfaces</SectionHeader>
        <Prose>
          Most readers of a personal site in 2026 are agents — recruiter
          copilots, search crawlers, LLM-driven research tools. The site is
          structured around that.
        </Prose>
        <Prose>
          <code className="font-mono text-[12px]">get_agent_guide</code> is the
          first-call tool. It returns a decision tree mapping common questions
          ("Quick overview", "What has Daniel built?", "Tell me about a hard
          problem he solved") to the right specialized tool. An agent that calls
          it once does not need to figure out the schema by trial and error.
        </Prose>
        <Prose>
          Static surfaces complement the MCP. The site exposes{" "}
          <a
            href="/api/profile.json"
            className="font-mono text-[12px] text-[var(--text-bright)] no-underline hover:text-[var(--accent)]"
          >
            /api/profile.json
          </a>{" "}
          (JSON Resume v1.0.0),{" "}
          <code className="font-mono text-[12px]">/llms.txt</code> (the
          AI-crawler convention), and a{" "}
          <Link
            to="/for-agents"
            className="text-[var(--text-bright)] no-underline hover:text-[var(--accent)]"
          >
            /for-agents
          </Link>{" "}
          page that mirrors the agent guide for human readers shopping for the
          machine-readable surface.
        </Prose>
        <Prose>
          The principle: never make an agent guess. Every claim on the site has
          a queryable source. The recent-shipments tool maps to git log entries;
          the bug-fixes tool maps to commit hashes; the changelog tool maps to
          the public changelog page.
        </Prose>
      </motion.section>

      {/* Hard problems */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>Hard problems</SectionHeader>
        <div className="space-y-5">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-[var(--text-bright)]">
              The free-tier abuse vector
            </p>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              80 calls/day is a soft cap, not a security boundary. A determined
              caller can rotate IPs and exhaust the budget. The real defense is
              that exhausting it produces a clean 429 with no hidden cost — the
              breaker preserves the wallet, not the availability.
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-[var(--text-bright)]">
              Where to put the trust boundary for LLM output
            </p>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Workers AI returns text. Sometimes that text is supposed to be
              structured JSON (for ai_extract_json, ai_classify). Models lie and
              wrap JSON in prose. The fix is layered — temperature 0,
              system-prompt instructions, then a safeParseJson fallback that
              extracts balanced-brace substrings from prose-wrapped output. No
              model-level structured-output flag — Workers AI does not accept
              OpenAI-style{" "}
              <code className="font-mono text-[11px]">json_object</code>; only{" "}
              <code className="font-mono text-[11px]">json_schema</code>, which
              the public ai_extract_json cannot construct from a free-form
              schema description.
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-[var(--text-bright)]">
              Drift between site and MCP responses
            </p>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Without the sync script, the site would say one thing about
              Daniel's projects and the MCP would say another. The sync runs as
              part of pnpm build. CI fails if regenerated JSON differs from what
              was committed. The MCP and the site stay in lockstep by
              construction.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Stack */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>Stack</SectionHeader>
        <div className="flex flex-wrap gap-2">
          {stack.map((tech) => (
            <span key={tech} className="tag">
              {tech}
            </span>
          ))}
        </div>
      </motion.section>

      {/* Status */}
      <motion.section
        className="mb-14 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-6"
        {...viewportFadeUp(0)}
      >
        <SectionHeader>Status</SectionHeader>
        <Prose>
          Live at{" "}
          <a
            href="https://mcp.danielsuchan.dev/mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[12px] text-[var(--text-bright)] no-underline transition-colors hover:text-[var(--accent)]"
          >
            mcp.danielsuchan.dev/mcp
          </a>
          . Streamable HTTP, MCP v1.12. 16 tools, 100% line coverage on logic,
          97% branch.
        </Prose>
        <pre className="mb-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--bg)] p-4 text-[11px] leading-relaxed text-[var(--text-muted)]">
          <code>{`{
  "mcpServers": {
    "daniel-suchan": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.danielsuchan.dev/mcp"]
    }
  }
}`}</code>
        </pre>
        <Prose>
          Or from any Streamable-HTTP-capable MCP client, point at the URL
          directly.
        </Prose>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="mb-8 flex flex-wrap gap-3"
        {...viewportFadeUp(0)}
      >
        <Link
          to="/for-agents"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-[var(--bg)] no-underline transition-opacity hover:opacity-90"
        >
          For agents <ArrowRight size={13} />
        </Link>
        <a
          href="mailto:mr.sucik@gmail.com"
          className="inline-flex items-center gap-2 rounded-md border border-[var(--border-hover)] px-5 py-2.5 text-xs text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--text)]"
        >
          <Mail size={13} /> mr.sucik@gmail.com
        </a>
      </motion.section>
    </main>
  );
}
