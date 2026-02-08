import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Code2, Rocket, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Daniel Suchan — CTO, Founder & Software Engineer" },
      {
        name: "description",
        content:
          "CTO & Founder based in Brno, Czech Republic. Building startups, leading engineering teams, and crafting modern web applications.",
      },
      {
        property: "og:title",
        content: "Daniel Suchan — CTO, Founder & Software Engineer",
      },
      {
        property: "og:description",
        content:
          "CTO & Founder based in Brno, Czech Republic. Building startups, leading engineering teams, and crafting modern web applications.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const highlights = [
  {
    icon: Rocket,
    title: "Startup Builder",
    description:
      "Founded multiple tech startups from scratch — from idea to production, handling product, engineering, and business.",
  },
  {
    icon: Users,
    title: "Engineering Leader",
    description:
      "Leading development teams as CTO at blaze.codes, coordinating cross-functional product delivery.",
  },
  {
    icon: Code2,
    title: "Full-Stack Engineer",
    description:
      "Deep expertise in React, TypeScript, Node.js, and modern cloud infrastructure with 9+ years of experience.",
  },
  {
    icon: Briefcase,
    title: "Product Thinker",
    description:
      "Bridging the gap between technical execution and product strategy to ship things that matter.",
  },
];

function Index() {
  const yearsExperience = Math.round(new Date().getFullYear() - 2016);

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-24 md:pt-32">
        <motion.p
          className="mb-4 text-sm font-medium uppercase tracking-widest text-amber-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          CTO &middot; Founder &middot; Engineer
        </motion.p>
        <motion.h1
          className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Hi, I'm <span className="text-amber-400">Daniel Suchan</span>
        </motion.h1>
        <motion.p
          className="mb-10 max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          I build startups and lead engineering teams from Brno, Czech Republic.
          With {yearsExperience} years in the industry, I turn ideas into
          products — from architecture to deployment.
        </motion.p>
        <motion.div
          className="flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-3 text-sm font-semibold text-black no-underline transition-colors hover:bg-amber-300"
          >
            View Projects <ArrowRight size={16} />
          </Link>
          <Link
            to="/resume"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Read Resume
          </Link>
        </motion.div>
      </section>

      {/* Highlights */}
      <section className="border-t border-white/10 bg-[#141414]">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-20 md:grid-cols-2">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-6"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
            >
              <item.icon className="mb-4 text-amber-400" size={28} />
              <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <motion.h2
          className="mb-4 text-2xl font-bold md:text-3xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          Want to work together?
        </motion.h2>
        <motion.p
          className="mb-8 text-gray-400"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
        >
          I'm always open to interesting projects and conversations.
        </motion.p>
        <motion.a
          href="mailto:mr.sucik@gmail.com"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-3 text-sm font-semibold text-black no-underline transition-colors hover:bg-amber-300"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={2}
        >
          Get in Touch <ArrowRight size={16} />
        </motion.a>
      </section>
    </main>
  );
}
