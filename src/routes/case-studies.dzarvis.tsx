import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { JsonLd } from "../components/JsonLd";
import { breadcrumbSchema, dzarvisCaseStudySchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";

export const Route = createFileRoute("/case-studies/dzarvis")({
  component: DzarvisCaseStudy,
  head: () => ({
    meta: buildHeadMeta({
      title:
        "Dzarvis — Multi-agent assistant on Claude | Case Study – Daniel Suchan",
      description:
        "Architecture write-up for Dzarvis: a multi-agent harness with narrow specialized subagents on top of a 208-tool MCP server. In stealth, fine-tuning with a focus group of 15 companies.",
      path: "/case-studies/dzarvis",
    }),
  }),
});

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, delay },
});

const viewportFadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" } as const,
  transition: { duration: 0.45, delay },
});

const toolDomains = [
  {
    domain: "Communication",
    tools: "Email, Slack, messaging",
  },
  {
    domain: "Calendar & scheduling",
    tools: "Events, reminders, availability",
  },
  {
    domain: "Tasks & project management",
    tools: "Tasks, projects, epics, sprints",
  },
  {
    domain: "Personal finance & banking",
    tools: "Transactions, accounts, invoicing",
  },
  {
    domain: "Knowledge base",
    tools: "Notes, documents, search",
  },
  {
    domain: "File & document generation",
    tools: "PDF, DOCX, XLSX templates",
  },
  {
    domain: "Search & research",
    tools: "Web search, deep research",
  },
  {
    domain: "Browser automation",
    tools: "Navigation, extraction, interaction",
  },
  {
    domain: "Notes & journaling",
    tools: "Journal, memory, context",
  },
  {
    domain: "Custom integrations",
    tools: "Per-workflow MCP extensions",
  },
];

const stack = [
  "TypeScript",
  "Claude API",
  "MCP TypeScript SDK",
  "Hono",
  "PostgreSQL",
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-lg font-bold tracking-tight text-[var(--text-bright)] md:text-xl">
      {children}
    </h2>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-sm leading-relaxed text-[var(--text-muted)]">
      {children}
    </p>
  );
}

function DzarvisCaseStudy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <JsonLd data={dzarvisCaseStudySchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Case Studies", path: "/case-studies" },
          { name: "Dzarvis", path: "/case-studies/dzarvis" },
        ])}
      />

      {/* Hero */}
      <motion.p className="mb-3 text-xs text-[var(--comment)]" {...fadeIn(0)}>
        {"// "}Case study
      </motion.p>

      <motion.h1
        className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-5xl"
        {...fadeUp(0.05)}
      >
        Dzarvis —{" "}
        <span className="text-[var(--accent)]">A multi-agent assistant</span> on
        Claude
      </motion.h1>

      <motion.p
        className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]"
        {...fadeUp(0.1)}
      >
        Multi-agent harness with narrow specialized subagents on top of a
        208-tool MCP server. In stealth, fine-tuning with a focus group of 15
        companies.
      </motion.p>

      <motion.div className="mt-5 mb-14" {...fadeIn(0.15)}>
        <span className="tag badge-active">In stealth · Focus group of 15</span>
      </motion.div>

      {/* The Problem */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>The problem</SectionHeader>
        <Prose>
          Off-the-shelf AI assistants handle individual prompts well. They
          struggle the moment a real workflow spans multiple tools. Ask "block
          next Tuesday afternoon based on my email backlog and calendar" and
          most assistants either hallucinate a plan or give you instructions to
          carry out yourself. Context evaporates at tool boundaries.
        </Prose>
        <Prose>
          Single-prompt architectures hit a hard limit on multi-step tasks. The
          model has to hold the full state of every tool in one context window,
          so the longer the task, the more the model drifts. Reliability drops
          as task complexity grows — exactly the inverse of what production
          workflows need.
        </Prose>
        <Prose>
          The interesting design problem is not "make the model smarter." It is
          "design the system so the model is only ever doing one focused thing
          at a time." That is the premise behind Dzarvis.
        </Prose>
      </motion.section>

      {/* Architecture */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>Architecture</SectionHeader>
        <Prose>
          The core pattern is an orchestrator over narrow subagents over a
          shared MCP server. The orchestrator handles intent routing. Each
          subagent handles one domain. The MCP server owns the tool contracts.
        </Prose>

        {/* Architecture diagram — inline SVG */}
        <motion.div
          className="my-8 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-6"
          {...viewportFadeUp(0.05)}
        >
          <ArchDiagram />
          <p className="mt-4 text-center font-mono text-[10px] text-[var(--comment)]">
            Generic pattern. Narrow subagents over a shared MCP. Orchestrator
            routes by intent.
          </p>
        </motion.div>
      </motion.section>

      {/* Subagent design rationale */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>Subagent design rationale</SectionHeader>
        <Prose>
          Why narrow subagents instead of one generalist agent? Each subagent
          gets a focused system prompt describing its domain, a small subset of
          relevant tools, and clear output contracts. The context per LLM call
          stays small, which means lower latency, lower cost, and fewer
          hallucinations from tool overload.
        </Prose>
        <Prose>
          Evaluation becomes tractable at the subagent level. You can test the
          email subagent independently of the calendar subagent. When something
          breaks, the failure surface is narrow. Compare that to debugging a
          single 208-tool agent where any of hundreds of tool calls could be the
          culprit.
        </Prose>
        <Prose>
          Where tasks are independent, subagents can run in parallel. The
          orchestrator identifies concurrent branches and dispatches them
          without waiting. This matters for real workflows where three things
          need to happen before something can proceed — doing them sequentially
          is unnecessarily slow.
        </Prose>
      </motion.section>

      {/* 208-tool MCP */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>The 208-tool MCP server</SectionHeader>
        <Prose>
          Tools live behind one MCP server, organized by domain. Each tool has a
          single, narrow contract — one action, typed inputs, typed output. The
          cost of adding tool #209 is bounded by the schema, not by retraining
          the agent.
        </Prose>

        <motion.div
          className="mt-6 grid gap-2 sm:grid-cols-2"
          {...viewportFadeUp(0.05)}
        >
          {toolDomains.map((item) => (
            <div
              key={item.domain}
              className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
            >
              <p className="text-xs font-semibold text-[var(--text-bright)]">
                {item.domain}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-[var(--comment)]">
                {item.tools}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* Hard problems */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>Hard problems (still iterating)</SectionHeader>
        <div className="space-y-5">
          <ProblemCard
            title="Tool selection cost at scale"
            body="At 208 tools, describing every available tool in every context window is prohibitively expensive. The problem is routing: how do you tell the orchestrator which tools are relevant before it starts? We're iterating on dynamic tool manifests that surface per-intent subsets instead of the full list."
          />
          <ProblemCard
            title="Cross-tool state sharing"
            body="When one task touches four tools, how do they share intermediate state without round-trips back to the user? Passing structured context between subagents works up to a point. The design challenge is defining what belongs in shared state versus what each subagent resolves independently."
          />
          <ProblemCard
            title="Orchestrator recovery on subagent failure"
            body="Subagents get stuck. Networks drop. APIs return unexpected shapes. The orchestrator needs to distinguish 'retry', 'reroute', and 'surface to user' — three meaningfully different failure responses that look similar at the tool-call level. This is one of the less glamorous but most important design surfaces."
          />
        </div>
      </motion.section>

      {/* Stack */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>Stack</SectionHeader>
        <div className="flex flex-wrap gap-2">
          {stack.map((tech) => (
            <span key={tech} className="tag">
              {tech}
            </span>
          ))}
        </div>
      </motion.section>

      {/* Status */}
      <motion.section
        className="mb-14 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-6"
        {...viewportFadeUp(0)}
      >
        <SectionHeader>Status</SectionHeader>
        <Prose>
          In stealth, fine-tuning with focus group of 15 companies. The focus
          group is helping shape real workflow patterns before a broader
          release.
        </Prose>
        <Prose>
          If you're at an AI lab and want to talk about agent design,{" "}
          <a
            href="mailto:mr.sucik@gmail.com"
            className="text-[var(--accent)] no-underline transition-colors hover:text-[var(--accent-hover)]"
          >
            reach out
          </a>
          .
        </Prose>
      </motion.section>

      {/* What's next */}
      <motion.section className="mb-14" {...viewportFadeUp(0)}>
        <SectionHeader>What's next</SectionHeader>
        <Prose>
          The immediate focus is improving orchestration reliability — tighter
          failure handling, better subagent context passing, and a public eval
          harness that lets us catch regressions before they reach production
          users. More tools are always in progress, but the bigger leverage is
          in making the orchestration layer predictable under adversarial
          inputs.
        </Prose>
        <Prose>
          Longer term: a broader tool ecosystem, contributions from the focus
          group's workflow patterns, and eventually a path to open-sourcing
          parts of the MCP layer once the architecture stabilizes.
        </Prose>
      </motion.section>

      {/* CTA */}
      <motion.div
        className="flex flex-wrap gap-3 pt-4 border-t border-[var(--border)]"
        {...viewportFadeUp(0)}
      >
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-md border border-[var(--border-hover)] px-5 py-2.5 text-xs text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft size={13} /> Back to Projects
        </Link>
        <a
          href="mailto:mr.sucik@gmail.com"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-[var(--bg)] no-underline transition-opacity hover:opacity-90"
        >
          <Mail size={13} /> Get in touch
        </a>
      </motion.div>
    </main>
  );
}

function ProblemCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
      <p className="mb-2 text-sm font-semibold text-[var(--text-bright)]">
        {title}
      </p>
      <p className="text-xs leading-relaxed text-[var(--text-muted)]">{body}</p>
    </div>
  );
}

function ArchDiagram() {
  const boxStyle = {
    rx: 4,
    fill: "var(--bg)",
    stroke: "var(--border-hover)",
    strokeWidth: 1,
  };
  const textStyle = {
    fill: "var(--text-bright)",
    fontSize: 10,
    fontFamily: "var(--font-mono)",
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
  };
  const dimTextStyle = {
    ...textStyle,
    fill: "var(--comment)",
    fontSize: 9,
  };
  const accentBoxStyle = {
    ...boxStyle,
    stroke: "var(--accent)",
  };
  const arrowStyle = {
    stroke: "var(--text-dim)",
    strokeWidth: 1,
    fill: "none",
  };
  const arrowHeadStyle = {
    fill: "var(--text-dim)",
  };

  return (
    <svg
      viewBox="0 0 560 220"
      width="100%"
      aria-label="Architecture diagram: User intent flows to Orchestrator, which routes to three narrow subagents, all sharing a 208-tool MCP server that connects to external integrations"
      role="img"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" {...arrowHeadStyle} />
        </marker>
      </defs>

      {/* User intent */}
      <rect x="10" y="90" width="80" height="40" {...boxStyle} />
      <text x="50" y="110" {...textStyle}>
        User
      </text>
      <text x="50" y="122" {...dimTextStyle}>
        intent
      </text>

      {/* Arrow: User → Orchestrator */}
      <line
        x1="90"
        y1="110"
        x2="148"
        y2="110"
        {...arrowStyle}
        markerEnd="url(#arrowhead)"
      />

      {/* Orchestrator */}
      <rect x="150" y="82" width="100" height="56" {...accentBoxStyle} />
      <text x="200" y="107" {...textStyle}>
        Orchestrator
      </text>
      <text x="200" y="120" {...dimTextStyle}>
        routes by intent
      </text>

      {/* Arrows: Orchestrator → Subagents */}
      <line
        x1="250"
        y1="96"
        x2="298"
        y2="44"
        {...arrowStyle}
        markerEnd="url(#arrowhead)"
      />
      <line
        x1="250"
        y1="110"
        x2="298"
        y2="110"
        {...arrowStyle}
        markerEnd="url(#arrowhead)"
      />
      <line
        x1="250"
        y1="124"
        x2="298"
        y2="176"
        {...arrowStyle}
        markerEnd="url(#arrowhead)"
      />

      {/* Subagent 1 */}
      <rect x="300" y="20" width="100" height="48" {...boxStyle} />
      <text x="350" y="40" {...textStyle}>
        Subagent
      </text>
      <text x="350" y="53" {...dimTextStyle}>
        emails
      </text>

      {/* Subagent 2 */}
      <rect x="300" y="86" width="100" height="48" {...boxStyle} />
      <text x="350" y="106" {...textStyle}>
        Subagent
      </text>
      <text x="350" y="119" {...dimTextStyle}>
        calendar
      </text>

      {/* Subagent 3 */}
      <rect x="300" y="152" width="100" height="48" {...boxStyle} />
      <text x="350" y="172" {...textStyle}>
        Subagent
      </text>
      <text x="350" y="185" {...dimTextStyle}>
        + 8 more…
      </text>

      {/* Arrows: Subagents → MCP */}
      <line
        x1="400"
        y1="44"
        x2="448"
        y2="90"
        {...arrowStyle}
        markerEnd="url(#arrowhead)"
      />
      <line
        x1="400"
        y1="110"
        x2="448"
        y2="110"
        {...arrowStyle}
        markerEnd="url(#arrowhead)"
      />
      <line
        x1="400"
        y1="176"
        x2="448"
        y2="130"
        {...arrowStyle}
        markerEnd="url(#arrowhead)"
      />

      {/* MCP server */}
      <rect x="450" y="82" width="100" height="56" {...accentBoxStyle} />
      <text x="500" y="104" {...textStyle}>
        208-tool
      </text>
      <text x="500" y="117" {...textStyle}>
        MCP server
      </text>
    </svg>
  );
}
