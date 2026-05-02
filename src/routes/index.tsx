import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import { profilePageSchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: buildHeadMeta({
      title: "Daniel Suchan – Engineer building production AI systems | Brno",
      description:
        "Software engineer based in Brno. Building Dzarvis (multi-agent assistant on Claude) and shipping production AI infrastructure. CTO at Blaze, 8+ years writing code.",
      path: "/",
    }),
  }),
});

function Index() {
  const yearsExperience = new Date().getFullYear() - 2017;

  return (
    <main className="flex h-full flex-1 flex-col justify-center">
      <JsonLd data={profilePageSchema()} />
      <section className="mx-auto w-full max-w-5xl px-6">
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

        <motion.p
          className="mt-6 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          I build production AI systems. Currently shipping{" "}
          <a
            href="https://dzarvis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-bright)] no-underline transition-colors hover:text-[var(--accent)]"
          >
            Dzarvis
          </a>{" "}
          — a multi-agent assistant on Claude, in stealth and fine-tuning with
          15 companies. {yearsExperience} years writing code, started at 16
          with Czech court permission. CTO at Blaze, also running an{" "}
          <a
            href="https://suchan.capital"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-bright)] no-underline transition-colors hover:text-[var(--accent)]"
          >
            algorithmic trading fund
          </a>
          .
        </motion.p>

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
