import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import { UptimeTimeline } from "../components/UptimeTimeline";
import projectsData from "../data/projects.json";
import { useServiceStatus } from "../hooks/useServiceStatus";
import { breadcrumbSchema, projectsSchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";
import type { Project } from "../lib/types";

export const Route = createFileRoute("/projects")({
  component: Projects,
  head: () => ({
    meta: buildHeadMeta({
      title: "Projects – Daniel Suchan | Dzarvis, AI infrastructure, SaaS",
      description:
        "Production AI systems and 20+ products shipped, co-founded, or led by Daniel Suchan — including Dzarvis (multi-agent assistant on Claude), Rozpocetpro (AI construction budgeting), and Talentiqa (AI hiring).",
      path: "/projects",
    }),
  }),
});

const projects = projectsData.projects as Project[];

const statusBadge: Record<Project["status"], string> = {
  Active: "badge-active",
  Maintenance: "badge-maintenance",
  Completed: "badge-completed",
};

function Projects() {
  const { loaded, getServiceForUrl } = useServiceStatus();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <JsonLd data={projectsSchema(projects)} />
      <JsonLd
        data={breadcrumbSchema([{ name: "Projects", path: "/projects" }])}
      />
      <motion.p
        className="mb-3 text-xs text-[var(--comment)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {"// "}Work
      </motion.p>
      <motion.h1
        className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-5xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        Projects
      </motion.h1>
      <motion.p
        className="mt-4 mb-12 max-w-lg text-sm text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Products and platforms I've built, co-founded, or led.
      </motion.p>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project, i) => {
          const service =
            loaded && project.url ? getServiceForUrl(project.url) : undefined;
          const motionProps = {
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-40px" },
            transition: { delay: i * 0.06, duration: 0.4 },
          } as const;
          const baseClass =
            "group block rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-6 no-underline transition-all duration-200";
          const linkHoverClass =
            "hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]/80";

          const cardBody = (
            <>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h2
                    className={`text-sm font-semibold text-[var(--text-bright)] transition-colors${
                      project.url ? " group-hover:text-[var(--accent)]" : ""
                    }`}
                  >
                    {project.name}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[var(--comment)]">
                    {project.role}
                  </p>
                </div>
                {project.url && (
                  <ArrowUpRight
                    size={14}
                    className="mt-0.5 text-[var(--text-dim)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]"
                  />
                )}
              </div>

              <p className="mb-4 text-xs leading-relaxed text-[var(--text-muted)]">
                {project.description}
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`tag ${statusBadge[project.status]}`}>
                  {project.status}
                </span>
                {project.stack.map((tech) => (
                  <span key={tech} className="tag">
                    {tech}
                  </span>
                ))}
              </div>

              {loaded && project.url && <UptimeTimeline service={service} />}
            </>
          );

          return project.url ? (
            <motion.a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseClass} ${linkHoverClass}`}
              {...motionProps}
            >
              {cardBody}
            </motion.a>
          ) : (
            <motion.div
              key={project.name}
              className={baseClass}
              {...motionProps}
            >
              {cardBody}
            </motion.div>
          );
        })}
      </div>

      {loaded && (
        <motion.div
          className="mt-6 flex items-center justify-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Activity size={10} className="text-[var(--text-dim)]" />
          <span className="text-[10px] text-[var(--text-dim)]">
            Monitored by{" "}
            <a
              href="https://jarvischeck.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--accent)]"
            >
              jarvischeck.com
            </a>
          </span>
        </motion.div>
      )}
    </main>
  );
}
