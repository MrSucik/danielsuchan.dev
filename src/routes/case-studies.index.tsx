import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";

export const Route = createFileRoute("/case-studies/")({
  component: CaseStudiesIndex,
  head: () => ({
    meta: buildHeadMeta({
      title: "Case Studies – Daniel Suchan | AI systems architecture",
      description:
        "Long-form architecture write-ups on production AI systems built by Daniel Suchan — starting with Dzarvis, a multi-agent assistant on Claude.",
      path: "/case-studies",
    }),
  }),
});

const caseStudies = [
  {
    slug: "dzarvis",
    name: "Dzarvis",
    tagline: "Multi-agent assistant on Claude",
    description:
      "Multi-agent harness with narrow specialized subagents on top of a 208-tool MCP server. In stealth, fine-tuning with a focus group of 15 companies.",
    stack: ["TypeScript", "Claude", "MCP", "PostgreSQL", "Hono"],
    status: "In stealth",
  },
];

function CaseStudiesIndex() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <JsonLd
        data={webPageSchema({
          name: "Case Studies",
          description:
            "Long-form architecture write-ups on production AI systems built by Daniel Suchan.",
          path: "/case-studies",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Case Studies", path: "/case-studies" },
        ])}
      />

      <motion.p
        className="mb-3 text-xs text-[var(--comment)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {"// "}Case studies
      </motion.p>

      <motion.h1
        className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-5xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        Case Studies
      </motion.h1>

      <motion.p
        className="mt-4 mb-12 max-w-lg text-sm text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Long-form write-ups on the architecture of systems I've built. What the
        problems were, what was tried, and what's still open.
      </motion.p>

      <div className="grid gap-4 md:grid-cols-2">
        {caseStudies.map((study, i) => (
          <motion.div
            key={study.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            <Link
              to="/case-studies/dzarvis"
              className="group block rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-6 no-underline transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]/80"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-bright)] transition-colors group-hover:text-[var(--accent)]">
                    {study.name}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[var(--comment)]">
                    {study.tagline}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="mt-0.5 text-[var(--text-dim)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
                />
              </div>

              <p className="mb-4 text-xs leading-relaxed text-[var(--text-muted)]">
                {study.description}
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="tag badge-active">{study.status}</span>
                {study.stack.map((tech) => (
                  <span key={tech} className="tag">
                    {tech}
                  </span>
                ))}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
