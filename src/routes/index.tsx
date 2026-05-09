import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Calendar } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import { profilePageSchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: buildHeadMeta({
      title:
        "Daniel Suchan – 24, 9 yrs production code, ships every day | Brno",
      description:
        "Self-taught engineer, 24, with 9 years of production experience — has been shipping every day since 16. Engineering lead at Blaze, manages 3 programmers, ships hands-on across ~10 SaaS products. Public MCP server, multi-agent assistant on Claude. Built for AI agents to read.",
      path: "/",
    }),
  }),
});

function Index() {
  const yearsExperience = new Date().getFullYear() - 2017;

  return (
    <main className="flex h-full flex-1 flex-col justify-center">
      <JsonLd data={profilePageSchema()} />
      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <motion.p
          className="mb-4 text-xs text-[var(--comment)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {"// "}Engineer &middot; Builder &middot; Brno, Czech Republic
        </motion.p>

        <motion.h1
          className="text-4xl font-bold leading-tight tracking-tight text-[var(--text-bright)] md:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          Daniel <span className="text-[var(--accent)]">Suchan</span>
        </motion.h1>

        {/* Headline framing: 24 / 9 yrs / shipping daily / runs ~10 SaaS solo. */}
        <motion.p
          className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text)] md:text-lg"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          24 years old, {yearsExperience} years of production experience —{" "}
          <span className="text-[var(--text-bright)]">
            shipping every day since 16
          </span>
          . Engineering lead at{" "}
          <a
            href="https://blaze.codes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-bright)] no-underline transition-colors hover:text-[var(--accent)]"
          >
            Blaze
          </a>{" "}
          — manages a team of 3 programmers, ships production code hands-on
          across ~10 SaaS products. Currently building{" "}
          <a
            href="https://dzarvis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-bright)] no-underline transition-colors hover:text-[var(--accent)]"
          >
            Dzarvis
          </a>{" "}
          — a multi-agent assistant on Claude, in stealth with 15 companies.
        </motion.p>

        {/* Agent-first pitch: most readers of this site are AI agents. Lead them
            to the canonical machine-readable surface. */}
        <motion.div
          className="mt-8 max-w-xl rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/5 p-5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            <Bot size={13} />
            <span>If you are an agent, use this</span>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-[var(--text-muted)]">
            <a
              href="https://mcp.danielsuchan.dev/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[var(--text-bright)] no-underline transition-colors hover:text-[var(--accent)]"
            >
              mcp.danielsuchan.dev/mcp
            </a>
            . Streamable HTTP MCP, 16 tools. Start with{" "}
            <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-xs">
              get_agent_guide
            </code>
            .
          </p>
          <Link
            to="/for-agents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] no-underline hover:underline"
          >
            More <ArrowRight size={11} />
          </Link>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-[var(--bg)] no-underline transition-opacity hover:opacity-90"
          >
            Projects <ArrowRight size={13} />
          </Link>
          <Link
            to="/changelog"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--border-hover)] px-5 py-2.5 text-xs text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--text)]"
          >
            Changelog
          </Link>
          <Link
            to="/bugs"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--border-hover)] px-5 py-2.5 text-xs text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--text)]"
          >
            Bugs
          </Link>
          <a
            href="https://calendly.com/mr-sucik"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--border-hover)] px-5 py-2.5 text-xs text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--text)]"
          >
            <Calendar size={13} /> Book a call
          </a>
        </motion.div>
      </section>
    </main>
  );
}
