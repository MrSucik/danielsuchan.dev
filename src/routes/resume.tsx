import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Archive, ExternalLink, Wrench } from "lucide-react";

export const Route = createFileRoute("/resume")({
  component: Resume,
  head: () => ({
    meta: [
      { title: "Resume — Daniel Suchan" },
      {
        name: "description",
        content:
          "Past projects and maintained products by Daniel Suchan — CTO, Founder & Full-Stack Engineer.",
      },
      { property: "og:title", content: "Resume — Daniel Suchan" },
      {
        property: "og:description",
        content:
          "Past projects and maintained products by Daniel Suchan.",
      },
    ],
  }),
});

interface Project {
  name: string;
  url: string;
  role: string;
  period: string;
  description: string;
  stack: string[];
}

const maintenanceProjects: Project[] = [
  {
    name: "jarvischeck.com",
    url: "https://jarvischeck.com",
    role: "Founder",
    period: "January 2025 – present",
    description:
      "Website monitoring and alerting service platform. Full-stack SaaS handling uptime checks, notifications, and dashboards.",
    stack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  },
  {
    name: "syncoli.com",
    url: "https://www.syncoli.com/",
    role: "Founder",
    period: "August 2020 – present",
    description:
      "Modern digital signage solutions platform. Led a team of 4, handling software, infrastructure, and customer relations.",
    stack: ["TypeScript", "React", "Remix", "Rust", "PostgreSQL"],
  },
];

const pastProjects: Project[] = [
  {
    name: "xalarm.cz",
    url: "https://www.xalarm.cz/",
    role: "Development Lead",
    period: "December 2022 – September 2023",
    description:
      "Personal safety service with mobile application. Planned, developed, and deployed the full product.",
    stack: ["React Native", "Next.js", "Firebase", "Expo", "Twilio"],
  },
  {
    name: "enter.xyz",
    url: "https://www.enter.xyz/",
    role: "Frontend Developer at STRV",
    period: "June 2022 – April 2024",
    description:
      "Frontend engineer responsible for delivering the next-generation web3 platform.",
    stack: ["TypeScript", "React", "Remix", "GraphQL", "Vercel"],
  },
  {
    name: "Cantata Health",
    url: "",
    role: "Full-stack Developer",
    period: "March 2017 – April 2022",
    description:
      "Analyzed, implemented, and deployed several projects for a large electronic health record system. Major work during the last 3 years was on the frontend.",
    stack: ["TypeScript", "React", "React Native", "C#", "ASP.NET", "MSSQL"],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const content = (
    <>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-gray-500">{project.role}</p>
        </div>
        {project.url && (
          <ExternalLink
            size={16}
            className="mt-1 text-gray-600 transition-colors group-hover:text-amber-400"
          />
        )}
      </div>
      <p className="mb-2 text-xs text-gray-500 italic">{project.period}</p>
      <p className="mb-4 text-sm leading-relaxed text-gray-400">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-gray-500"
          >
            {tech}
          </span>
        ))}
      </div>
    </>
  );

  const className =
    "group block rounded-xl border border-white/5 bg-white/[0.02] p-6 no-underline transition-colors hover:border-amber-400/30 hover:bg-white/[0.04]";

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
    >
      {project.url ? (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {content}
        </a>
      ) : (
        <div className={className}>{content}</div>
      )}
    </motion.div>
  );
}

function Resume() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <motion.h1
        className="mb-4 text-4xl font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Resume
      </motion.h1>
      <motion.p
        className="mb-12 max-w-xl text-lg text-gray-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Projects I'm maintaining and past work that shaped my engineering
        career.
      </motion.p>

      {/* Maintenance */}
      <motion.div
        className="mb-4 flex items-center gap-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <Wrench size={22} className="text-amber-400" />
        <h2 className="text-2xl font-bold">In Maintenance</h2>
      </motion.div>
      <motion.p
        className="mb-8 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        Products I built and continue to run and maintain.
      </motion.p>
      <div className="mb-16 grid gap-6 md:grid-cols-2">
        {maintenanceProjects.map((project, i) => (
          <ProjectCard key={project.name} project={project} index={i} />
        ))}
      </div>

      {/* Past Projects */}
      <motion.div
        className="mb-4 flex items-center gap-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <Archive size={22} className="text-amber-400" />
        <h2 className="text-2xl font-bold">Past Projects</h2>
      </motion.div>
      <motion.p
        className="mb-8 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        Previous roles and products I helped build.
      </motion.p>
      <div className="grid gap-6 md:grid-cols-2">
        {pastProjects.map((project, i) => (
          <ProjectCard key={project.name} project={project} index={i} />
        ))}
      </div>
    </main>
  );
}
