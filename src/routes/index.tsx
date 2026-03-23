import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import { buildHeadMeta } from "../lib/seo";
import { profilePageSchema } from "../lib/schemas";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: buildHeadMeta({
      title: "Daniel Suchan – Software Engineer & CTO | Brno",
      description:
        "Software engineer and CTO based in Brno. Co-Founder at blaze.codes, building SaaS products and leading engineering teams across 20+ projects.",
      path: "/",
    }),
  }),
});

function Index() {
  const yearsExperience = Math.round(new Date().getFullYear() - 2016);

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
          {"// "}Founder &middot; Engineer &middot; Czech Republic
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
          className="mt-6 max-w-lg text-sm leading-relaxed text-[var(--text-muted)]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          I build startups, lead engineering teams, and run an{" "}
          <a href="https://suchan.capital" target="_blank" rel="noopener noreferrer" className="text-[var(--text-bright)] no-underline transition-colors hover:text-[var(--accent)]">algorithmic investment fund</a>.
          With {yearsExperience} years in the industry, I turn ideas into
          products — from architecture to deployment.
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
