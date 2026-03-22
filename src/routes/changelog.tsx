import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import { buildHeadMeta } from "../lib/seo";
import { breadcrumbSchema, webPageSchema } from "../lib/schemas";

export const Route = createFileRoute("/changelog")({
  component: Changelog,
  head: () => ({
    meta: buildHeadMeta({
      title: "Changelog – Daniel Suchan | Updates & Releases",
      description:
        "Latest updates on projects, releases, and technical decisions from Daniel Suchan.",
      path: "/changelog",
    }),
  }),
});

function Changelog() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <JsonLd data={webPageSchema({ name: "Changelog", description: "Latest updates on projects, releases, and technical decisions from Daniel Suchan.", path: "/changelog" })} />
      <JsonLd data={breadcrumbSchema([{ name: "Changelog", path: "/changelog" }])} />
      <motion.p
        className="mb-3 text-xs text-[var(--comment)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {"// "}Updates
      </motion.p>
      <motion.h1
        className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-5xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        Changelog
      </motion.h1>
      <motion.p
        className="mt-4 mb-12 max-w-lg text-sm text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Updates on projects, releases, and what I'm building.
      </motion.p>

      <motion.div
        className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-8 py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <p className="text-2xl font-bold text-[var(--text-bright)]">
          Coming Soon
        </p>
        <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-[var(--text-muted)]">
          Documenting project updates, new releases, and what I'm working on.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-md border border-[var(--border-hover)] px-5 py-2.5 text-xs text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft size={13} /> Home
        </Link>
      </motion.div>
    </main>
  );
}
