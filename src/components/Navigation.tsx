import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { to: "/", label: "home" },
  { to: "/projects", label: "projects" },
  { to: "/changelog", label: "changelog" },
  { to: "/newsletter", label: "newsletter" },
] as const;

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="text-sm font-semibold text-[var(--text-bright)] no-underline transition-colors hover:text-[var(--accent)]"
          >
            danielsuchan.dev
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--text)] [&.active]:text-[var(--accent)]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="text-[var(--text-muted)] transition-colors hover:text-[var(--text)] md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-start justify-center bg-[var(--bg)]/98 px-10 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <Link
                  to={link.to}
                  className="block py-3 text-2xl text-[var(--text)] no-underline transition-colors hover:text-[var(--accent)] [&.active]:text-[var(--accent)]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
