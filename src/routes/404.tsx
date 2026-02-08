import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, SearchX } from "lucide-react";

export const Route = createFileRoute("/404")({
  component: NotFound,
  head: () => ({
    meta: [{ title: "Not Found — Daniel Suchan" }],
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
        <SearchX size={48} className="mx-auto mb-6 text-amber-400" />
        <h1 className="mb-2 text-5xl font-bold">404</h1>
        <p className="mb-8 text-lg text-gray-400">
          This page doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-3 text-sm font-semibold text-black no-underline transition-colors hover:bg-amber-300"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </motion.div>
    </main>
  );
}
