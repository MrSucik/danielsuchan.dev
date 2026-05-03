import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Info, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { JsonLd } from "../components/JsonLd";
import examples from "../data/labs/decomposer-examples.json";
import { breadcrumbSchema, labsDemoSchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";

export const Route = createFileRoute("/labs/decomposer")({
  component: DecomposerPage,
  head: () => ({
    meta: buildHeadMeta({
      title: "Subagent Task Decomposer – Labs | Daniel Suchan",
      description:
        "Type any task and see how a Dzarvis-style multi-agent system decomposes it into narrow specialized subagents with a live dependency graph.",
      path: "/labs/decomposer",
    }),
  }),
});

interface Example {
  task: string;
  tokens: string[];
  agents: Array<{ name: string; role: string }>;
  graph: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function scoreExample(input: string, example: Example): number {
  const inputTokens = new Set(tokenize(input));
  let score = 0;
  for (const token of example.tokens) {
    if (inputTokens.has(token)) score += 1;
  }
  const inputLower = input.toLowerCase();
  for (const token of example.tokens) {
    if (inputLower.includes(token)) score += 0.5;
  }
  return score;
}

function findBestMatch(
  input: string,
): { example: Example; score: number } | null {
  if (!input.trim()) return null;
  let best: { example: Example; score: number } | null = null;
  for (const ex of examples as Example[]) {
    const score = scoreExample(input, ex);
    if (!best || score > best.score) {
      best = { example: ex, score };
    }
  }
  if (!best || best.score === 0) return null;
  return best;
}

// Mermaid renders its own sanitized SVG — user input goes through mermaid's
// parser (which rejects arbitrary content) before becoming SVG output.
// We insert the library-generated SVG, not raw user input.
function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setRendered(false);
    setError(null);

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            background: "#0d1117",
            primaryColor: "#0d1117",
            primaryTextColor: "#d4d8e0",
            primaryBorderColor: "rgba(99,109,131,0.3)",
            lineColor: "#22d3ee",
            secondaryColor: "#0a0e14",
            tertiaryColor: "#0a0e14",
            edgeLabelBackground: "#0a0e14",
            nodeTextColor: "#d4d8e0",
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: "12px",
          },
        });

        const id = `mermaid-${Date.now()}`;
        // mermaid.render returns sanitized SVG generated from the chart DSL.
        // The chart string is a static, pre-authored value from decomposer-examples.json,
        // not free-form user text. User input is used only for keyword matching,
        // never injected into the chart definition.
        const { svg } = await mermaid.render(id, chart);

        if (!cancelled && containerRef.current) {
          // Safe: svg is produced by mermaid's own renderer from a
          // statically-defined chart string, not from user-controlled input.
          containerRef.current.innerHTML = svg;
          setRendered(true);
        }
      } catch {
        if (!cancelled) {
          setError("Could not render diagram");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-[var(--border)] text-xs text-[var(--text-muted)]">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition-opacity duration-300 ${
        rendered ? "opacity-100" : "opacity-40"
      }`}
    />
  );
}

function DecomposerPage() {
  const [input, setInput] = useState("");
  const [match, setMatch] = useState<{
    example: Example;
    score: number;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback((value: string) => {
    const result = findBestMatch(value);
    setMatch(result);
    setSubmitted(true);
  }, []);

  const handleExampleClick = useCallback((task: string) => {
    setInput(task);
    const result = findBestMatch(task);
    setMatch(result);
    setSubmitted(true);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit(input);
    }
  };

  const confidenceLabel = (score: number): string => {
    if (score >= 3) return "Exact match";
    if (score >= 1.5) return "Close match";
    return "Closest example I have is...";
  };

  const exampleTasks = (examples as Example[]).slice(0, 10).map((e) => e.task);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <JsonLd
        data={labsDemoSchema({
          name: "Subagent Task Decomposer",
          description:
            "Interactive tool that decomposes any task into a Dzarvis-style multi-agent pipeline with a dependency graph.",
          path: "/labs/decomposer",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Labs", path: "/labs" },
          { name: "Decomposer", path: "/labs/decomposer" },
        ])}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/labs"
          className="mb-8 inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft size={12} />
          Labs
        </Link>
      </motion.div>

      <motion.p
        className="mb-3 text-xs text-[var(--comment)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {"// "}Labs / Subagent Task Decomposer
      </motion.p>

      <motion.h1
        className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-4xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        Subagent Task Decomposer
      </motion.h1>

      <motion.p
        className="mt-4 mb-8 max-w-lg text-sm text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Type a task and see how a Dzarvis-style multi-agent system would break
        it into narrow, specialized subagents — complete with a dependency
        graph.
      </motion.p>

      {/* Input */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Debug a production incident, Plan a trip to Tokyo..."
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-dim)] outline-none transition-colors focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => handleSubmit(input)}
            disabled={!input.trim()}
            className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-xs font-semibold text-[var(--bg)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Zap size={13} />
            Decompose
          </button>
        </div>
      </motion.div>

      {/* Example chips */}
      <motion.div
        className="mb-10 flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <span className="text-xs text-[var(--comment)] self-center">
          Try an example:
        </span>
        {exampleTasks.map((task) => (
          <button
            key={task}
            type="button"
            onClick={() => handleExampleClick(task)}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1 text-[11px] text-[var(--text-muted)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text)]"
          >
            {task}
          </button>
        ))}
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {submitted && (
          <motion.div
            key={match?.example.task ?? "no-match"}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {match ? (
              <div className="space-y-6">
                {/* Confidence label */}
                <div className="flex items-center gap-2 text-xs text-[var(--comment)]">
                  <ChevronRight size={12} className="text-[var(--accent)]" />
                  <span>
                    {confidenceLabel(match.score)}{" "}
                    <span className="text-[var(--text-muted)]">
                      &ldquo;{match.example.task}&rdquo;
                    </span>
                  </span>
                </div>

                {/* Mermaid graph */}
                <div>
                  <p className="mb-2 text-xs text-[var(--comment)]">
                    Agent dependency graph
                  </p>
                  <MermaidDiagram chart={match.example.graph} />
                </div>

                {/* Agent list */}
                <div>
                  <p className="mb-3 text-xs text-[var(--comment)]">
                    Subagents ({match.example.agents.length})
                  </p>
                  <div className="space-y-2">
                    {match.example.agents.map((agent, i) => (
                      <motion.div
                        key={agent.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.3 }}
                        className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
                      >
                        <span className="mt-0.5 min-w-[18px] text-[10px] text-[var(--text-dim)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <span className="text-xs font-semibold text-[var(--accent)]">
                            {agent.name}
                          </span>
                          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                            {agent.role}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-8 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  No matching example found. Try one of the chips above, or
                  rephrase your task.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Honesty footer */}
      <motion.div
        className="mt-12 flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Info size={13} className="mt-0.5 shrink-0 text-[var(--comment)]" />
        <p className="text-[11px] text-[var(--comment)]">
          Showcase mode — matched against pre-computed examples using keyword
          overlap. The real Dzarvis routes tasks via Claude in real time, with
          live tool availability and dynamic subagent selection.
        </p>
      </motion.div>
    </main>
  );
}
