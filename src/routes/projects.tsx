import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight } from "lucide-react";
import { useServiceStatus, type Service } from "../hooks/useServiceStatus";

export const Route = createFileRoute("/projects")({
  component: Projects,
  head: () => ({
    meta: [
      { title: "Projects — Daniel Suchan" },
      {
        name: "description",
        content:
          "Projects built and led by Daniel Suchan — from SaaS platforms to enterprise applications.",
      },
      { property: "og:title", content: "Projects — Daniel Suchan" },
      {
        property: "og:description",
        content: "Projects built and led by Daniel Suchan.",
      },
    ],
  }),
});

interface Project {
  name: string;
  url: string;
  role: string;
  description: string;
  stack: string[];
  status: "Active" | "Maintenance" | "Completed";
}

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
    name: "talentiqa.ai",
    url: "https://talentiqa.ai",
    role: "Development Lead",
    description:
      "AI-powered talent acquisition platform. Leading the engineering team to deliver intelligent hiring workflows.",
    stack: ["TypeScript", "React", "AI/ML", "Node.js"],
    status: "Completed",
  },
  {
    name: "rozpocetpro.cz",
    url: "https://rozpocetpro.cz",
    role: "Development Lead",
    description:
      "Budget management platform for Czech organizations. Leading the full development lifecycle from planning to deployment.",
    stack: ["TypeScript", "React", "AI/ML", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "syncoli.com",
    url: "https://www.syncoli.com/",
    role: "Founder",
    description:
      "Modern digital signage solutions platform. Led a team of 4, handling software, infrastructure, and customer relations.",
    stack: ["TypeScript", "React", "Remix", "Rust", "PostgreSQL"],
    status: "Maintenance",
  },
  {
    name: "xalarm.cz",
    url: "https://www.xalarm.cz/",
    role: "Development Lead",
    description:
      "Personal safety service with mobile application. Planned, developed, and deployed the full product.",
    stack: ["React Native", "Next.js", "Firebase", "Expo"],
    status: "Completed",
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
