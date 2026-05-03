import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FlaskConical, Network, Server } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import { breadcrumbSchema, labsIndexSchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";

export const Route = createFileRoute("/labs/")({
  component: LabsIndex,
  head: () => ({
    meta: buildHeadMeta({
      title: "Labs – Daniel Suchan | Live demos and interactive tools",
      description:
        "Interactive demos of multi-agent orchestration, MCP tooling, and AI infrastructure built by Daniel Suchan. Try the subagent decomposer or inspect the MCP server live.",
      path: "/labs",
    }),
  }),
});

const demos = [
  {
    title: "Subagent Task Decomposer",
    description:
      "Type any task. See how a Dzarvis-style multi-agent system would decompose it into narrow, specialized subagents — with a live dependency graph.",
    to: "/labs/decomposer" as const,
    icon: Network,
    tag: "Multi-agent",
    live: true,
  },
  {
    title: "MCP Inspector",
    description:
      "Chat directly with Daniel's public MCP server. Ask about Dzarvis, his projects, or his background — routed through a live Model Context Protocol endpoint.",
    to: "/labs/mcp" as const,
    icon: Server,
    tag: "MCP",
    live: true,
  },
  {
    title: "Multi-agent Harness Playground",
    description:
      "Spin up a sandboxed agent harness, wire together tools, and watch agents hand off context in real time. Coming soon.",
    to: null,
    icon: FlaskConical,
    tag: "Coming soon",
    live: false,
  },
] as const;

function LabsIndex() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <JsonLd data={labsIndexSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: "Labs", path: "/labs" }])} />

      <motion.p
        className="mb-3 text-xs text-[var(--comment)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {"// "}Labs
      </motion.p>

      <motion.h1
        className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-5xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        Labs — live demos and tools
      </motion.h1>

      <motion.p
        className="mt-4 mb-12 max-w-lg text-sm text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Things I've built that you can poke at.
      </motion.p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo, i) => {
          const Icon = demo.icon;
          const motionProps = {
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-40px" },
            transition: { delay: i * 0.08, duration: 0.4 },
          } as const;

          const cardContent = (
            <>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--accent-dim)]">
                  <Icon
                    size={16}
                    className={
                      demo.live
                        ? "text-[var(--accent)]"
                        : "text-[var(--text-dim)]"
                    }
                  />
                </div>
                <span className={`tag ${demo.live ? "badge-active" : ""}`}>
                  {demo.tag}
                </span>
              </div>

              <h2
                className={`mb-2 text-sm font-semibold ${
                  demo.live
                    ? "text-[var(--text-bright)] transition-colors group-hover:text-[var(--accent)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {demo.title}
              </h2>

              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                {demo.description}
              </p>
            </>
          );

          const baseClass =
            "group block rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-6 no-underline transition-all duration-200";

          if (demo.to) {
            return (
              <motion.div key={demo.title} {...motionProps}>
                <Link
                  to={demo.to}
                  className={`${baseClass} hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]/80`}
                >
                  {cardContent}
                </Link>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={demo.title}
              className={`${baseClass} cursor-default opacity-60`}
              {...motionProps}
            >
              {cardContent}
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
