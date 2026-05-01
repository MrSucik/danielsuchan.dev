import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import changelogData from "../data/changelog.json";
import { getProjectMeta } from "../lib/changelog-projects";
import { breadcrumbSchema, webPageSchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";
import type { ChangelogData } from "../lib/types";

const data = changelogData as ChangelogData;

const sortedEntries = [...data.entries].sort((a, b) =>
  b.date.localeCompare(a.date),
);

export const Route = createFileRoute("/changelog")({
  component: Changelog,
  head: () => ({
    meta: buildHeadMeta({
      title: "Changelog – Daniel Suchan | Daily shipping log",
      description:
        "Daily log of features Daniel Suchan ships across Dzarvis, Blaze, JarvisCheck, and 20+ other projects.",
      path: "/changelog",
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

function Changelog() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <JsonLd
        data={webPageSchema({
          name: "Changelog",
          description:
            "Daily log of features Daniel Suchan ships across Dzarvis, Blaze, JarvisCheck, and 20+ other projects.",
          path: "/changelog",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([{ name: "Changelog", path: "/changelog" }])}
      />
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
        className="mt-4 mb-12 max-w-xl text-sm text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        What I ship, day by day, across Dzarvis and 20+ other projects. Curated
        by hand from working notes.
      </motion.p>

      <div className="space-y-12">
        {sortedEntries.map((entry, i) => (
          <motion.section
            key={entry.date}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
          >
            <header className="mb-4 flex items-baseline justify-between border-b border-[var(--border)] pb-2">
              <h2 className="text-base font-semibold text-[var(--text-bright)]">
                {formatDate(entry.date)}
              </h2>
              <time
                className="font-mono text-[10px] text-[var(--text-dim)]"
                dateTime={entry.date}
              >
                {entry.date}
              </time>
            </header>

            <div className="space-y-4">
              {entry.shipments.map((shipment) => {
                const meta = getProjectMeta(shipment.project);
                return (
                  <div
                    key={shipment.project}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5"
                  >
                    <div className="mb-3">
                      {meta.url ? (
                        <a
                          href={meta.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-bright)] no-underline transition-colors hover:text-[var(--accent)]"
                        >
                          {meta.name}
                          <ArrowUpRight
                            size={11}
                            className="text-[var(--text-dim)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]"
                          />
                        </a>
                      ) : (
                        <span className="text-sm font-semibold text-[var(--text-bright)]">
                          {meta.name}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                      {shipment.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex gap-2 before:mt-1.5 before:block before:size-1 before:flex-shrink-0 before:rounded-full before:bg-[var(--text-dim)]"
                        >
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </motion.section>
        ))}
      </div>
    </main>
  );
}
