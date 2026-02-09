import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const API_URL =
  import.meta.env.VITE_API_URL ?? "https://jarvis.danielsuchan.dev";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  website: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/newsletter")({
  component: Newsletter,
  head: () => ({
    meta: [
      { title: "Newsletter — Daniel Suchan" },
      {
        name: "description",
        content:
          "Subscribe to get updates on startups, engineering, and new projects from Daniel Suchan.",
      },
      { property: "og:title", content: "Newsletter — Daniel Suchan" },
      {
        property: "og:description",
        content:
          "Subscribe to get updates on startups, engineering, and new projects from Daniel Suchan.",
      },
    ],
  }),
});

function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!turnstileToken) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          website: data.website,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Subscription failed");
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string;

  return (
    <main className="mx-auto max-w-xl px-6 py-16 md:py-24">
      <motion.p
        className="mb-3 text-xs text-[var(--comment)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {"// "}Subscribe
      </motion.p>
      <motion.h1
        className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-5xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        Newsletter
      </motion.h1>
      <motion.p
        className="mt-4 mb-10 text-sm text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Occasional updates on startups, engineering, and new projects. No
        spam, unsubscribe anytime.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {submitted ? (
          <div className="rounded-lg border border-[var(--success)]/20 bg-[var(--success)]/5 p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex size-6 items-center justify-center rounded-full bg-[var(--success)]/15">
                <Check size={14} className="text-[var(--success)]" />
              </div>
              <p className="text-sm font-semibold text-[var(--text-bright)]">
                You're subscribed
              </p>
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              Thanks for subscribing. I'll send updates when there's
              something worth sharing.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 text-xs text-[var(--accent)] no-underline transition-colors hover:text-[var(--accent-hover)]"
            >
              <ArrowLeft size={13} /> Back home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs text-[var(--text-muted)]"
              >
                Email address
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                spellCheck={false}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-dim)] caret-[var(--accent)] outline-none transition-colors focus:border-[var(--accent)]/50"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-[var(--error)]">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Honeypot */}
            <div
              aria-hidden="true"
              tabIndex={-1}
              style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
            >
              <input
                {...register("website")}
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {siteKey && (
              <Turnstile
                ref={turnstileRef}
                siteKey={siteKey}
                onSuccess={setTurnstileToken}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                options={{ theme: "dark", size: "normal" }}
              />
            )}

            {error && (
              <p className="text-xs text-[var(--error)]">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !turnstileToken}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-[var(--bg)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "Subscribing..." : "Subscribe"}
              {!submitting && <ArrowRight size={13} />}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
