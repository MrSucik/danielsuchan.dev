import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/404")({
  component: NotFound,
  head: () => ({
    meta: [
      { title: "404 — Page Not Found – Daniel Suchan" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-7xl font-bold text-[var(--text-dim)] md:text-9xl">
          404
        </p>
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          This page doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-[var(--bg)] no-underline transition-opacity hover:opacity-90"
        >
          <ArrowLeft size={13} /> Home
        </Link>
      </motion.div>
    </main>
  );
}
