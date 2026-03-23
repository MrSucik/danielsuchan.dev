import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import { buildHeadMeta } from "../lib/seo";
import { breadcrumbSchema, projectsSchema } from "../lib/schemas";
import type { Project } from "../lib/types";
import { useServiceStatus, type Service } from "../hooks/useServiceStatus";

export const Route = createFileRoute("/projects")({
  component: Projects,
  head: () => ({
    meta: buildHeadMeta({
      title: "Projects – Daniel Suchan | SaaS, Apps & Platforms",
      description:
        "18 products and platforms built, co-founded, or led by Daniel Suchan — from AI tools to enterprise apps.",
      path: "/projects",
    }),
  }),
});

const projects: Project[] = [
  {
    name: "blaze.codes",
    url: "https://blaze.codes/",
    role: "Co-Founder & CTO",
    description:
      "Software development company leading multiple product teams. Building and shipping products for clients and internal ventures.",
    stack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "jarvischeck.com",
    url: "https://jarvischeck.com",
    role: "Founder",
    description:
      "Website monitoring and alerting service platform. Full-stack SaaS handling uptime checks, notifications, and dashboards.",
    stack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "rozpocetpro.cz",
    url: "https://rozpocetpro.cz",
    role: "Development Lead",
    description:
      "AI tool for construction budgets and price quotes. Database of 300,000+ items, OTSKP classification, export to Excel/PDF/XML. Budget in minutes instead of days.",
    stack: ["TypeScript", "React", "AI/ML", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "talentiqa.ai",
    url: "https://talentiqa.ai",
    role: "Development Lead",
    description:
      "AI-powered talent acquisition platform. Leading the engineering team to deliver intelligent hiring workflows.",
    stack: ["TypeScript", "React", "AI/ML", "Node.js"],
    status: "Completed",
  },
  {
    name: "IZZY",
    url: "https://izzy.cz",
    role: "Development Lead",
    description:
      "Platform for cleaning services. Mobile and web app connecting customers with professional cleaners. Booking, chat, ratings, and insurance.",
    stack: ["TypeScript", "React Native", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "ArchiPad",
    url: "https://archipad.com",
    role: "Development Lead",
    description:
      "Construction project management and architecture tools. Documentation, coordination, and communication for project teams.",
    stack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "Motion Coach",
    url: "https://motioncoach.app",
    role: "Development Lead",
    description:
      "AI fitness app for real-time movement analysis. Exercise tracking via phone camera with instant feedback on form quality and rep counting.",
    stack: ["TypeScript", "React Native", "AI/ML", "Node.js"],
    status: "Active",
  },
  {
    name: "MUNI Polygraf",
    url: "https://polygraf.muni.cz",
    role: "Development Lead",
    description:
      "Internal accessibility tool for Masaryk University. Support for students and employees with disabilities, specialized resources and accommodations.",
    stack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "ECHO",
    url: "https://aplikaceecho.cz",
    role: "Development Lead",
    description:
      "App for searching for missing persons. Connected to Czech Police database with real-time notifications about endangered children and seniors.",
    stack: ["TypeScript", "React Native", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "nemoskop.cz",
    url: "https://nemoskop.cz",
    role: "Founder",
    description:
      "Comprehensive real estate analysis platform for the Czech Republic. Aggregates pricing, crime, amenities, and transport data into a single map-based tool.",
    stack: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "dotacni-sniper.cz",
    url: "https://dotacni-sniper.cz",
    role: "Founder",
    description:
      "Subsidy finder for Czech housing associations. Helps SVJ and residential buildings discover eligible grants and funding in under 2 minutes.",
    stack: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "morivo.cz",
    url: "https://morivo.cz",
    role: "Founder",
    description:
      "Real estate marketplace for the Czech market. Connecting buyers and sellers with streamlined property listings and search.",
    stack: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "suchanpro.cz",
    url: "https://suchanpro.cz",
    role: "Founder",
    description:
      "Professional services platform. Providing expert consulting and development services for businesses.",
    stack: ["TypeScript", "React", "Hono"],
    status: "Active",
  },
  {
    name: "pandidorty.cz",
    url: "https://pandidorty.cz",
    role: "Founder",
    description:
      "E-commerce platform for the Czech market. Online store with product catalog, ordering, and delivery management.",
    stack: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "dzarvis.com",
    url: "https://dzarvis.com",
    role: "Founder",
    description:
      "AI-powered personal productivity and life management platform. Track tasks, health, finances, goals, and more — all in one place.",
    stack: ["TypeScript", "React", "Hono", "PostgreSQL", "AI/ML"],
    status: "Active",
  },
  {
    name: "it.blaze.codes",
    url: "https://it.blaze.codes",
    role: "Product & Development",
    description:
      "Self-hosted PaaS for deploying containerized applications. Deploy Docker containers to your own servers with GitHub integration, automatic SSL, and real-time metrics.",
    stack: ["TypeScript", "React", "Hono", "Docker", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "inside.blaze.codes",
    url: "https://inside.blaze.codes",
    role: "Product & Development",
    description:
      "Internal operations panel for managing employees and workspace resources at Blaze.",
    stack: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "suchan.capital",
    url: "https://suchan.capital",
    role: "Founder",
    description:
      "Algorithmic trading fund building track record. News-driven crypto scalping and event-driven equity trading powered by AI. Registered under ČNB §15 ZISIF.",
    stack: ["TypeScript", "React", "Bun", "SQLite", "AI/ML"],
    status: "Active",
  },
];

const statusBadge: Record<Project["status"], string> = {
  Active: "badge-active",
  Maintenance: "badge-maintenance",
  Completed: "badge-completed",
};

function UptimeIndicator({ service }: { service?: Service }) {
  if (!service) {
    return (
      <div className="mt-3 flex items-center gap-2 border-t border-[var(--border)] pt-3">
        <span className="inline-block size-1.5 shrink-0 rounded-full bg-[var(--text-dim)]" />
        <span className="text-[10px] text-[var(--text-dim)]">Not monitored</span>
      </div>
    );
  }

  const uptimeColor =
    service.uptime >= 99.9
      ? "var(--success)"
      : service.uptime >= 99
        ? "var(--warning)"
        : "var(--error)";

  const statusDot =
    service.status === "OK"
      ? "bg-[var(--success)]"
      : service.status === "ERROR"
        ? "bg-[var(--error)]"
        : service.status === "WARNING"
          ? "bg-[var(--warning)]"
          : "bg-[var(--text-dim)]";

  return (
    <motion.div
      className="mt-3 flex items-center gap-2 border-t border-[var(--border)] pt-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <span className={`inline-block size-1.5 shrink-0 rounded-full ${statusDot}`} />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="text-[10px] text-[var(--text-dim)]">
          {service.status === "OK" ? "Operational" : service.status === "ERROR" ? "Down" : "Degraded"}
        </span>
        {service.avgResponseTime !== null && (
          <span className="text-[10px] text-[var(--text-dim)]">
            {Math.round(service.avgResponseTime)}ms
          </span>
        )}
      </div>
      <span className="text-[11px] font-medium" style={{ color: uptimeColor }}>
        {service.uptime.toFixed(2)}%
      </span>
    </motion.div>
  );
}

function Projects() {
  const { loaded, getServiceForUrl } = useServiceStatus();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <JsonLd data={projectsSchema(projects)} />
      <JsonLd data={breadcrumbSchema([{ name: "Projects", path: "/projects" }])} />
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
          const service = loaded ? getServiceForUrl(project.url) : undefined;

          return (
            <motion.a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-6 no-underline transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]/80"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-bright)] transition-colors group-hover:text-[var(--accent)]">
                    {project.name}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[var(--comment)]">
                    {project.role}
                  </p>
                </div>
                <ArrowUpRight
                  size={14}
                  className="mt-0.5 text-[var(--text-dim)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]"
                />
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

              {loaded && <UptimeIndicator service={service} />}
            </motion.a>
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
