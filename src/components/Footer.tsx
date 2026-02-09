import { Github, Linkedin, Mail } from "lucide-react";

const socialLinks = [
  { href: "https://github.com/MrSucik", icon: Github, label: "GitHub" },
  { href: "https://www.linkedin.com/in/daniel-suchan-6b8611162/", icon: Linkedin, label: "LinkedIn" },
  { href: "mailto:mr.sucik@gmail.com", icon: Mail, label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-8 md:flex-row md:justify-between">
        <p className="text-xs text-[var(--text-dim)]">
          &copy; {new Date().getFullYear()} Daniel Suchan
        </p>
        <div className="flex items-center gap-5">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-dim)] transition-colors hover:text-[var(--accent)]"
              aria-label={link.label}
            >
              <link.icon size={16} strokeWidth={1.5} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
