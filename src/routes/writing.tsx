import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Pencil } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import { breadcrumbSchema, webPageSchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";
import { posts } from "../lib/writing-posts";

export const Route = createFileRoute("/writing")({
  component: Writing,
  head: () => ({
    meta: buildHeadMeta({
      title: "Writing – Daniel Suchan | Multi-agent systems, AI infrastructure",
      description:
        "Technical writing on building production AI systems — agent sandboxes, multi-agent orchestration, dual-review verification, and the lessons from shipping Dzarvis.",
      path: "/writing",
    }),
  }),
});

function Writing() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <JsonLd
        data={webPageSchema({
          name: "Writing",
          description:
            "Technical writing on building production AI systems — agent sandboxes, multi-agent orchestration, dual-review verification, and the lessons from shipping Dzarvis.",
          path: "/writing",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([{ name: "Writing", path: "/writing" }])}
      />
      <motion.p
        className="mb-3 text-xs text-[var(--comment)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {"// "}Writing
      </motion.p>
      <motion.h1
        className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-5xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        Writing
      </motion.h1>
      <motion.p
        className="mt-4 mb-12 max-w-xl text-sm text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Technical writing on building production AI systems — what I've learned
        shipping Dzarvis and the surrounding infrastructure.
      </motion.p>

      <div className="grid gap-4">
        {posts.map((post, i) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            <Link
              to="/writing/$slug"
              params={{ slug: post.slug }}
              className="group block rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-6 no-underline transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]/80"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pencil size={12} className="text-[var(--text-dim)]" />
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                    {post.status} &middot; {post.topic}
                  </span>
                </div>
                <ArrowUpRight
                  size={13}
                  className="text-[var(--text-dim)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]"
                />
              </div>
              <h2 className="text-base font-semibold text-[var(--text-bright)] transition-colors group-hover:text-[var(--accent)]">
                {post.title}
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
                {post.teaser}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
