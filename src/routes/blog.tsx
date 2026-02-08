import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileText, Rss } from "lucide-react";

export const Route = createFileRoute("/blog")({
  component: Blog,
  head: () => ({
    meta: [
      { title: "Blog — Daniel Suchan" },
      {
        name: "description",
        content:
          "Thoughts on startups, engineering leadership, and building software products.",
      },
      { property: "og:title", content: "Blog — Daniel Suchan" },
      {
        property: "og:description",
        content:
          "Thoughts on startups, engineering leadership, and building software products.",
      },
    ],
  }),
});

function Blog() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <motion.h1
        className="mb-4 text-4xl font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Blog
      </motion.h1>
      <motion.p
        className="mb-12 max-w-xl text-lg text-gray-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Thoughts on startups, engineering leadership, and building software
        products.
      </motion.p>

      {/* Coming Soon state */}
      <motion.div
        className="flex flex-col items-center rounded-xl border border-white/5 bg-white/[0.02] px-8 py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-6 flex items-center gap-3 text-amber-400">
          <FileText size={32} />
          <Rss size={24} />
        </div>
        <h2 className="mb-3 text-2xl font-semibold">Coming Soon</h2>
        <p className="mb-6 max-w-md text-gray-400">
          I'm working on articles about startup building, engineering
          leadership, and the tech behind my projects. Check back soon.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors hover:border-white/40 hover:bg-white/5"
        >
          Back to Home
        </Link>
      </motion.div>
    </main>
  );
}
