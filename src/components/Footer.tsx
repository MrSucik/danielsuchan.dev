import { Github, Linkedin, Mail } from "lucide-react";

const socialLinks = [
  {
    href: "https://github.com/MrSucik",
    icon: Github,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/danielsuchan/",
    icon: Linkedin,
    label: "LinkedIn",
  },
  {
    href: "mailto:mr.sucik@gmail.com",
    icon: Mail,
    label: "Email",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#141414]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Daniel Suchan. All rights reserved.
        </p>

        <div className="flex items-center gap-5">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 transition-colors hover:text-amber-400"
              aria-label={link.label}
            >
              <link.icon size={20} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
