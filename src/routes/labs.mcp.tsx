import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Send,
  Server,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { JsonLd } from "../components/JsonLd";
import { breadcrumbSchema, labsDemoSchema } from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";

export const Route = createFileRoute("/labs/mcp")({
  component: McpInspectorPage,
  head: () => ({
    meta: buildHeadMeta({
      title: "MCP Inspector – Labs | Daniel Suchan",
      description:
        "Chat directly with Daniel's public MCP server. Ask about Dzarvis, his projects, or his background — routed through a live Model Context Protocol endpoint.",
      path: "/labs/mcp",
    }),
  }),
});

const MCP_URL =
  (import.meta as unknown as { env: { VITE_MCP_URL?: string } }).env
    .VITE_MCP_URL ?? "https://mcp.danielsuchan.dev/mcp";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const SAMPLE_RESPONSES: Record<string, string> = {
  "Tell me about Daniel":
    "Daniel Suchan is a software engineer based in Brno, Czech Republic. He started coding at 16 with Czech court permission to work on a US healthcare project. He's the Co-Founder & CTO of Blaze, founder of Dzarvis (a multi-agent assistant built on Claude), and runs an algorithmic trading fund under ČNB §15 ZISIF. He's been writing code for 8+ years across web, mobile, AI/ML, and infrastructure.",
  "What is Dzarvis?":
    "Dzarvis is a multi-agent personal assistant built on Claude. It exposes a 208-tool MCP server that integrates everything from email and calendar to banking, Spotify, Sentry, GitHub, and more. A multi-agent harness routes tasks to narrow specialized subagents — each scoped to a single capability domain. Currently in stealth, fine-tuning with a focus group of 15 companies.",
  "Where is he based?":
    "Daniel is based in Brno, Czech Republic — specifically in the city center near Nové Lauby. He builds distributed systems and AI infrastructure from there, working across European and US-based clients and ventures.",
  "List his projects":
    "Daniel's notable projects include: Dzarvis (multi-agent assistant on Claude, in stealth), Blaze (software development company, Co-Founder & CTO), jarvischeck.com (website monitoring SaaS), rozpocetpro.cz (AI construction budgeting, 300k+ items), talentiqa.ai (AI hiring platform), IZZY (cleaning services marketplace), nemoskop.cz (Czech real estate analytics), suchan.capital (algorithmic trading fund, ČNB §15 ZISIF), and several other platforms across e-commerce, civic tech, and real estate.",
};

const CHIPS = [
  "Tell me about Daniel",
  "What is Dzarvis?",
  "Where is he based?",
  "List his projects",
] as const;

type ChipQuery = (typeof CHIPS)[number];

async function callMcpServer(
  query: string,
  onChunk: (chunk: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      id: Date.now(),
      params: {
        name: "ask_about_daniel",
        arguments: { question: query },
      },
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`MCP server returned ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (
    contentType.includes("text/event-stream") ||
    contentType.includes("text/plain")
  ) {
    // Streaming response
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // Parse SSE chunks
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            const text =
              parsed?.result?.content?.[0]?.text ??
              parsed?.choices?.[0]?.delta?.content ??
              "";
            if (text) onChunk(text);
          } catch {
            // Non-JSON data line, emit raw
            if (data) onChunk(data);
          }
        }
      }
    }
  } else {
    // Non-streaming JSON-RPC response
    const json = await response.json();
    const text =
      json?.result?.content?.[0]?.text ??
      json?.result?.text ??
      JSON.stringify(json?.result ?? json);
    onChunk(text);
  }
}

function McpInspectorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<
    "unknown" | "live" | "offline"
  >("unknown");
  const [showFallbackBanner, setShowFallbackBanner] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Clean up streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current !== null) {
        clearInterval(streamingIntervalRef.current);
        streamingIntervalRef.current = null;
      }
    };
  }, []);

  // Probe server on mount
  useEffect(() => {
    let cancelled = false;
    async function probe() {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(MCP_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", method: "ping", id: 1 }),
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!cancelled) setServerStatus(res.ok ? "live" : "offline");
      } catch {
        if (!cancelled) setServerStatus("offline");
      }
    }
    probe();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-scroll to bottom when message count changes.
  // messageCount is read inside the effect to satisfy exhaustive-deps.
  const messageCount = messages.length;
  useEffect(() => {
    // Referencing messageCount ensures the effect re-runs on each new message
    // while only operating on the stable scrollRef.
    if (messageCount > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageCount]);

  const sendMessage = useCallback(
    async (query: string) => {
      if (!query.trim() || loading) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: query,
      };
      const assistantId = `a-${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setLoading(true);

      if (serverStatus === "offline") {
        // Graceful fallback
        const fallback =
          SAMPLE_RESPONSES[query as ChipQuery] ??
          "The MCP server isn't deployed yet — it's coming soon. In the meantime, check the pre-set questions using the chips above for sample responses, or visit /projects to see Daniel's work.";

        setShowFallbackBanner(true);

        // Simulate streaming for nicer UX
        let i = 0;
        const chars = fallback.split("");
        // Clear any existing streaming interval before starting a new one
        if (streamingIntervalRef.current !== null) {
          clearInterval(streamingIntervalRef.current);
        }
        streamingIntervalRef.current = setInterval(() => {
          i += 3;
          const partial = chars.slice(0, i).join("");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: partial, streaming: i < chars.length }
                : m,
            ),
          );
          if (i >= chars.length) {
            if (streamingIntervalRef.current !== null) {
              clearInterval(streamingIntervalRef.current);
              streamingIntervalRef.current = null;
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, streaming: false } : m,
              ),
            );
            setLoading(false);
          }
        }, 16);
        return;
      }

      // Live MCP call
      abortRef.current = new AbortController();
      try {
        await callMcpServer(
          query,
          (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + chunk, streaming: true }
                  : m,
              ),
            );
          },
          abortRef.current.signal,
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, streaming: false } : m,
          ),
        );
      } catch (err) {
        const msg =
          err instanceof Error && err.name === "AbortError"
            ? "Cancelled."
            : "Could not reach MCP server. Showing a sample response instead.";

        setShowFallbackBanner(true);

        const fallback =
          SAMPLE_RESPONSES[query as ChipQuery] ??
          "The MCP server is not reachable right now — try again shortly, or use the pre-set questions for sample responses.";

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `${msg}\n\n${fallback}`, streaming: false }
              : m,
          ),
        );
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [loading, serverStatus],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      sendMessage(input);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <JsonLd
        data={labsDemoSchema({
          name: "MCP Inspector",
          description:
            "Chat directly with Daniel's public MCP server via the Model Context Protocol.",
          path: "/labs/mcp",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Labs", path: "/labs" },
          { name: "MCP Inspector", path: "/labs/mcp" },
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
        {"// "}Labs / MCP Inspector
      </motion.p>

      <motion.h1
        className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-4xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        MCP Inspector
      </motion.h1>

      <motion.p
        className="mt-4 mb-8 max-w-lg text-sm text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Chat with Daniel's public MCP server. Ask about Dzarvis, his projects,
        or his background — routed through a live Model Context Protocol
        endpoint.
      </motion.p>

      {/* Status + context banner */}
      <motion.div
        className="mb-6 flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="flex items-center gap-2 text-xs">
          <Server size={12} className="text-[var(--comment)]" />
          <span className="text-[var(--comment)]">{MCP_URL}</span>
          {serverStatus === "live" && (
            <span className="flex items-center gap-1 text-[var(--success)]">
              <Wifi size={11} /> live
            </span>
          )}
          {serverStatus === "offline" && (
            <span className="flex items-center gap-1 text-[var(--text-dim)]">
              <WifiOff size={11} /> not deployed yet
            </span>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
          <Info size={13} className="mt-0.5 shrink-0 text-[var(--comment)]" />
          <p className="text-[11px] text-[var(--comment)]">
            First time? See{" "}
            <Link
              to="/writing"
              className="text-[var(--accent)] no-underline transition-colors hover:text-[var(--accent-hover)]"
            >
              the writing section
            </Link>{" "}
            for context on how Dzarvis and MCP fit together.
          </p>
        </div>

        {showFallbackBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-lg border border-[var(--warning)]/20 bg-[var(--bg-elevated)] px-4 py-3"
          >
            <Info size={13} className="mt-0.5 shrink-0 text-[var(--warning)]" />
            <p className="text-[11px] text-[var(--comment)]">
              Server not yet deployed — showing example responses below. When
              the MCP server goes live at{" "}
              <span className="text-[var(--text-muted)]">
                mcp.danielsuchan.dev
              </span>
              , this demo lights up automatically.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Chat container */}
      <motion.div
        className="flex h-[420px] flex-col rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-xs text-[var(--text-dim)]">
                Ask something, or use a chip below.
              </p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[var(--accent)] text-[var(--bg)]"
                      : "border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)]"
                  }`}
                >
                  {msg.content}
                  {msg.streaming && (
                    <span className="cursor-blink ml-0.5 inline-block">▋</span>
                  )}
                  {msg.role === "assistant" &&
                    !msg.content &&
                    msg.streaming && (
                      <span className="text-[var(--text-dim)]">
                        Thinking
                        <span className="cursor-blink">...</span>
                      </span>
                    )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input row */}
        <div className="border-t border-[var(--border)] p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={loading}
              className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--text)] placeholder-[var(--text-dim)] outline-none transition-colors focus:border-[var(--accent)] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--bg)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={11} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Pre-set chips */}
      <motion.div
        className="mt-4 flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <span className="self-center text-xs text-[var(--comment)]">
          Try asking:
        </span>
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => sendMessage(chip)}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1 text-[11px] text-[var(--text-muted)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text)] disabled:opacity-50"
          >
            {chip}
            <ArrowRight size={10} className="text-[var(--text-dim)]" />
          </button>
        ))}
      </motion.div>
    </main>
  );
}
