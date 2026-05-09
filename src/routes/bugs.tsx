import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import bugFixesData from "../data/bug-fixes.json";
import type { BugFixesData } from "../lib/bug-fixes-types";
import { getProjectMeta } from "../lib/changelog-projects";
import { breadcrumbSchema, webPageSchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";

const data = bugFixesData as BugFixesData;

const sortedFixes = [...data.fixes].sort((a, b) =>
  b.date.localeCompare(a.date),
);

export const Route = createFileRoute("/bugs")({
  component: Bugs,
  head: () => ({
    meta: buildHeadMeta({
      title: "Bugs Fixed – Daniel Suchan | Production debugging log",
      description:
        "Curated production bug fixes Daniel has shipped — symptom, root cause, fix, and impact for each. Recent and verifiable from public commit history.",
      path: "/bugs",
    }),
  }),
});

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function commitUrl(commit: string): string {
  return `https://github.com/MrSucik/danielsuchan.dev/commit/${commit}`;
}

function Bugs() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <JsonLd
        data={webPageSchema({
          name: "Bugs Fixed",
          description:
            "Curated production bug fixes Daniel has shipped — symptom, root cause, fix, and impact.",
          path: "/bugs",
        })}
      />
      <JsonLd data={breadcrumbSchema([{ name: "Bugs", path: "/bugs" }])} />
      <motion.p
        className="mb-3 text-xs text-[var(--comment)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {"// "}Production debugging
      </motion.p>
      <motion.h1
        className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-5xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        Bugs Fixed
      </motion.h1>
      <motion.p
        className="mt-4 mb-12 max-w-xl text-sm text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        War stories from production: symptom, root cause, fix, impact. Curated
        and verifiable — every fix points to a public commit. Not a
        comprehensive career log; recent and concrete.
      </motion.p>

      <div className="space-y-6">
        {sortedFixes.map((fix, i) => {
          const meta = getProjectMeta(fix.project);
          return (
            <motion.article
              key={`${fix.date}-${fix.title}`}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            >
              <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] pb-3">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-base font-semibold text-[var(--text-bright)]">
                    {fix.title}
                  </h2>
                  {meta.url ? (
                    <a
                      href={meta.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 font-mono text-[10px] text-[var(--text-dim)] no-underline hover:text-[var(--accent)]"
                    >
                      {meta.name}
                      <ArrowUpRight size={9} />
                    </a>
                  ) : (
                    <span className="font-mono text-[10px] text-[var(--text-dim)]">
                      {meta.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {fix.commit && (
                    <a
                      href={commitUrl(fix.commit)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-[var(--text-dim)] no-underline hover:text-[var(--accent)]"
                    >
                      {fix.commit}
                    </a>
                  )}
                  <time
                    className="font-mono text-[10px] text-[var(--text-dim)]"
                    dateTime={fix.date}
                  >
                    {formatDate(fix.date)}
                  </time>
                </div>
              </header>

              <dl className="space-y-3 text-xs leading-relaxed">
                <BugField label="Symptom" value={fix.symptom} />
                <BugField label="Root cause" value={fix.rootCause} />
                <BugField label="Fix" value={fix.fix} />
                <BugField label="Impact" value={fix.impact} accent />
              </dl>
            </motion.article>
          );
        })}
      </div>
    </main>
  );
}

function BugField({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="w-full flex-shrink-0 font-mono text-[10px] uppercase tracking-wide text-[var(--text-dim)] sm:w-24 sm:pt-0.5">
        {label}
      </dt>
      <dd
        className={
          accent ? "text-[var(--text-bright)]" : "text-[var(--text-muted)]"
        }
      >
        {value}
      </dd>
    </div>
  );
}
