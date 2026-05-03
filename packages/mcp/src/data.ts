/**
 * Canonical data about Daniel Suchan.
 * All claims here are verified. Do not add unverified facts.
 */

export const PROFILE = {
  name: "Daniel Suchan",
  email: "mr.sucik@gmail.com",
  phone: "+420 777 783 404",
  location: "Brno, Czech Republic",
  website: "https://danielsuchan.dev",
  linkedin: "https://www.linkedin.com/in/daniel-suchan-6b8611162/",
  github: "https://github.com/mrSucik",
  education: "Self-taught. Started professional work at 16. Did not attend college.",
  currentRole: "Co-Founder & CTO at Blaze",
  summary:
    "Self-taught engineer with 8 years of full-time production experience. " +
    "Started at 16 as Frontend & Mobile Lead at Cantata Health (US healthcare enterprise), " +
    "with Czech court permission to work on an international project. " +
    "Currently Co-Founder & CTO at Blaze, a Czech software company shipping 20+ products. " +
    "Building Dzarvis: a multi-agent assistant on Claude with narrow specialized subagents on top of a 208-tool MCP server.",
  experience: [
    {
      company: "Blaze",
      role: "Co-Founder & CTO",
      period: "2022–present",
      description:
        "Software development company leading multiple product teams. Building and shipping products for clients and internal ventures.",
    },
    {
      company: "Cantata Health",
      role: "Frontend & Mobile Lead",
      period: "2017–2022",
      description:
        "US healthcare enterprise. Led frontend web and mobile development. Joined at 16 with Czech court permission to work on a US healthcare project. Products still in production today.",
    },
  ],
} as const;

export type Project = {
  name: string;
  url?: string;
  role: string;
  description: string;
  stack: string[];
  status: "Active" | "Completed";
};

export const PROJECTS: Project[] = [
  {
    name: "dzarvis.com",
    url: "https://dzarvis.com",
    role: "Founder & Sole Engineer",
    description:
      "Multi-agent assistant on Claude. Multi-agent harness with narrow specialized subagents on top of a 208-tool MCP server. In stealth, fine-tuning with a focus group of 15 companies.",
    stack: ["TypeScript", "Claude", "MCP", "PostgreSQL", "Hono"],
    status: "Active",
  },
  {
    name: "Blaze",
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
      "AI tool for construction budgets and price quotes. Database of 300,000+ items, OTSKP classification, export to Excel/PDF/XML.",
    stack: ["TypeScript", "React", "AI/ML", "Node.js", "PostgreSQL"],
    status: "Active",
  },
  {
    name: "talentiqa.ai",
    url: "https://talentiqa.ai",
    role: "Development Lead",
    description:
      "AI-powered talent acquisition platform. Led engineering team to deliver intelligent hiring workflows.",
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
    url: "https://archipad.app",
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
    name: "uniklo.cz",
    url: "https://uniklo.cz",
    role: "Founder",
    description:
      "Data breach checker for Czech users. Free lookup against 947 known breaches with 17B+ records to verify email and password exposure.",
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
  {
    name: "Cantata Health",
    role: "Frontend & Mobile Lead, 2017–2022",
    description:
      "US healthcare enterprise application. Led frontend web + mobile development. Joined at 16 with Czech court permission to work on a US healthcare project. Products built then are still in production today.",
    stack: ["TypeScript", "React", "React Native", "Node.js"],
    status: "Completed",
  },
];

export const SKILLS = [
  "TypeScript",
  "React",
  "Hono",
  "MCP (Model Context Protocol)",
  "Multi-agent orchestration",
  "Claude / Anthropic SDK",
  "PostgreSQL",
  "React Native",
  "Node.js",
  "Bun",
  "Cloudflare Workers",
  "Full-stack architecture",
  "Production AI systems",
  "SaaS product development",
] as const;

export type AnswerBankEntry = {
  keywords: string[];
  answer: string;
};

export const ANSWER_BANK: AnswerBankEntry[] = [
  {
    keywords: ["experience", "years", "how long", "seniority", "senior"],
    answer:
      "8 years of full-time production experience. Started professional work at 16 as Frontend & Mobile Lead at Cantata Health (US healthcare enterprise). Currently CTO of Blaze and building Dzarvis.",
  },
  {
    keywords: ["education", "school", "degree", "college", "university", "studied"],
    answer:
      "Self-taught. Started professional work at 16 (Cantata Health, US healthcare) — with Czech court permission to work on an international project. Did not attend college.",
  },
  {
    keywords: ["salary", "compensation", "expectation", "package", "money", "pay", "rate"],
    answer:
      "Open to discussion. Currently CTO of a Czech software company; a comparable senior IC or staff engineer role at an AI lab makes sense. Happy to discuss specifics.",
  },
  {
    keywords: ["location", "where", "based", "country", "city", "live"],
    answer:
      "Brno, Czech Republic. Open to relocation globally. EU work authorization available. Visa sponsorship needed for US/UK/Israel/Japan/Singapore and similar.",
  },
  {
    keywords: ["visa", "sponsorship", "work permit", "authorized", "authorization"],
    answer:
      "EU citizen (Czech Republic). EU work authorization available. Visa sponsorship needed for US, UK, Israel, Japan, Singapore, and most non-EU countries.",
  },
  {
    keywords: ["dzarvis", "building", "project", "flagship", "side project"],
    answer:
      "Dzarvis is a multi-agent assistant on Claude. Multi-agent harness with narrow specialized subagents on top of a 208-tool MCP server. Currently in stealth, fine-tuning with a focus group of 15 companies.",
  },
  {
    keywords: ["why ai labs", "why anthropic", "why openai", "motivation", "interest", "join"],
    answer:
      "I see the direction AI labs are heading and want to participate in building it from the inside. Was building toward the same place with Dzarvis — a deep multi-agent system on Claude — but realized I'd have more impact working directly at a lab.",
  },
  {
    keywords: ["available", "start date", "when", "notice", "notice period"],
    answer: "Available immediately for the right role.",
  },
  {
    keywords: ["remote", "onsite", "in-person", "office", "hybrid"],
    answer:
      "Open to either. Strong remote async track record — 3+ years working across time zones as a digital nomad.",
  },
  {
    keywords: ["strengths", "technical", "skills", "best at", "good at", "expertise"],
    answer:
      "Multi-agent orchestration, MCP server design, full-stack TypeScript (React / Hono / Postgres), and shipping production AI to real users. Also: founding products from 0 to 1, leading engineering teams.",
  },
  {
    keywords: ["contact", "reach", "email", "phone", "linkedin"],
    answer:
      "Email: mr.sucik@gmail.com | LinkedIn: https://www.linkedin.com/in/daniel-suchan-6b8611162/ | Website: https://danielsuchan.dev",
  },
];
