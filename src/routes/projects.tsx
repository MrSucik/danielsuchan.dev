import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

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
    status: "Active",
  },
  {
    name: "rozpocetpro.cz",
    url: "https://rozpocetpro.cz",
    role: "Development Lead",
    description:
      "Budget management platform for Czech organizations. Leading the full development lifecycle from planning to deployment.",
    stack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
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

const statusColor: Record<Project["status"], string> = {
  Active: "bg-green-400/10 text-green-400",
  Maintenance: "bg-yellow-400/10 text-yellow-400",
  Completed: "bg-gray-400/10 text-gray-400",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

function Projects() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <motion.h1
        className="mb-4 text-4xl font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Projects
      </motion.h1>
      <motion.p
        className="mb-12 max-w-xl text-lg text-gray-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        A selection of products and platforms I've built, co-founded, or led as
        an engineering leader.
      </motion.p>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project, i) => (
          <motion.a
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border border-white/5 bg-white/[0.02] p-6 no-underline transition-colors hover:border-amber-400/30 hover:bg-white/[0.04]"
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                  {project.name}
                </h2>
                <p className="text-sm text-gray-500">{project.role}</p>
              </div>
              <ExternalLink
                size={16}
                className="mt-1 text-gray-600 transition-colors group-hover:text-amber-400"
              />
            </div>

            <p className="mb-4 text-sm leading-relaxed text-gray-400">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[project.status]}`}
              >
                {project.status}
              </span>
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-gray-500"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.a>
        ))}
      </div>
    </main>
  );
}
