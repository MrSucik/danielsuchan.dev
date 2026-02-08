import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, Briefcase, Globe, Heart, Mail, Wrench } from "lucide-react";

export const Route = createFileRoute("/resume")({
  component: Resume,
  head: () => ({
    meta: [
      { title: "Resume — Daniel Suchan" },
      {
        name: "description",
        content:
          "Professional resume of Daniel Suchan — CTO, Founder & Full-Stack Engineer with 9+ years of experience.",
      },
      { property: "og:title", content: "Resume — Daniel Suchan" },
      {
        property: "og:description",
        content:
          "Professional resume of Daniel Suchan — CTO, Founder & Full-Stack Engineer.",
      },
    ],
  }),
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.h2
      className="mb-6 mt-12 flex items-center gap-3 text-2xl font-bold"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
    >
      <Icon size={24} className="text-amber-400" />
      {children}
    </motion.h2>
  );
}

function JobEntry({
  title,
  company,
  url,
  period,
  location,
  children,
}: {
  title: string;
  company: string;
  url?: string;
  period: string;
  location: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="mb-8 border-l-2 border-amber-400/30 pl-5"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium tracking-wide"
        >
          {company}
        </a>
      ) : (
        <p className="font-medium tracking-wide text-blue-400">{company}</p>
      )}
      <p className="mt-1 text-sm italic text-gray-500">
        {location} &mdash; {period}
      </p>
      <div className="mt-2 text-gray-300">{children}</div>
    </motion.div>
  );
}

function Resume() {
  const yearsExperience = Math.round(new Date().getFullYear() - 2016);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <motion.h1
        className="mb-4 text-4xl font-bold"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        Resume
      </motion.h1>
      <motion.p
        className="mb-8 max-w-xl text-lg text-gray-400"
        initial="hidden"
        animate="visible"
        variants={{
          ...fadeUp,
          visible: {
            ...fadeUp.visible,
            transition: { delay: 0.1, duration: 0.5 },
          },
        }}
      >
        Software engineer based in Brno with {yearsExperience} years of
        experience in the software industry.
      </motion.p>

      {/* Contact */}
      <SectionHeading icon={Mail}>Contact</SectionHeading>
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <a href="mailto:mr.sucik@gmail.com">mr.sucik@gmail.com</a>
      </motion.p>

      {/* Work Experience */}
      <SectionHeading icon={Briefcase}>Work Experience</SectionHeading>

      <JobEntry
        title="Co-Founder & CTO"
        company="blaze.codes"
        url="https://blaze.codes/"
        period="January 2023 – present"
        location="Brno, Czech Republic"
      >
        <p>Leading multiple development teams:</p>
        <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
          <li>
            <a
              href="https://rozpocetpro.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              rozpocetpro.cz
            </a>{" "}
            – Development Lead
          </li>
          <li>
            <a
              href="https://talentiqa.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              talentiqa.ai
            </a>{" "}
            – Development Lead
          </li>
        </ul>
      </JobEntry>

      <JobEntry
        title="Software Startup Founder"
        company="jarvischeck.com"
        url="https://jarvischeck.com"
        period="January 2025 – present"
        location="Brno, Czech Republic"
      >
        <p>
          Building and maintaining a website monitoring and alerting service
          platform. Responsible for full-stack development, infrastructure, and
          business operations.
        </p>
      </JobEntry>

      <JobEntry
        title="Development Lead"
        company="xalarm.cz"
        url="https://www.xalarm.cz/"
        period="December 2022 – September 2023"
        location="Brno, Czech Republic"
      >
        <p>
          Responsible for planning, developing, and deploying a new service with
          mobile application for personal safety. (TS, React Native, NextJS,
          Postgres, Firebase, NodeJS, Twillio, Vercel, Expo)
        </p>
      </JobEntry>

      <JobEntry
        title="Frontend Developer"
        company="enter.xyz"
        url="https://www.enter.xyz/"
        period="June 2022 – April 2024"
        location="Brno, Czech Republic"
      >
        <p>
          Frontend engineer at STRV, responsible for delivering enter.xyz. (TS,
          React, Remix, GraphQL, Vercel)
        </p>
      </JobEntry>

      <JobEntry
        title="Software Startup Founder"
        company="syncoli.com"
        url="https://www.syncoli.com/"
        period="August 2020 – present"
        location="Brno, Czech Republic"
      >
        <p>
          Lead team of 4 members providing modern digital signage solutions.
          Responsible for leading the team, the software, and customer
          communication. (TS, React, Remix, PostgreSQL, Cypress, NodeJS,
          Firebase, Python, GitHub Actions, Sentry, Rust). Currently in
          maintenance mode.
        </p>
      </JobEntry>

      <JobEntry
        title="Full-stack Developer"
        company="Cantata Health"
        period="March 2017 – April 2022"
        location="Brno and Ostrava, Czech Republic"
      >
        <p>
          Analyzed, implemented, and deployed several projects for an electronic
          health record system. Major work during the last 3 years was on the
          frontend. (TS, React, React Native, REST, C#, ASP.NET, MSSQL)
        </p>
      </JobEntry>

      {/* Maintaining */}
      <SectionHeading icon={Wrench}>Maintaining</SectionHeading>
      <motion.ul
        className="list-inside list-disc space-y-2 pl-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <li>
          <a
            href="https://jarvischeck.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            jarvischeck.com
          </a>{" "}
          – Website monitoring and alerting
        </li>
        <li>
          <a
            href="https://www.syncoli.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            syncoli.com
          </a>{" "}
          – Digital signage solutions
        </li>
      </motion.ul>

      {/* Languages */}
      <SectionHeading icon={Globe}>Languages</SectionHeading>
      <motion.ul
        className="list-inside list-disc space-y-2 pl-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <li>
          <strong>Czech</strong> – Native speaker
        </li>
        <li>
          <strong>English</strong> – Comfortable spoken and written
        </li>
      </motion.ul>

      {/* Hobbies */}
      <SectionHeading icon={Heart}>Hobbies</SectionHeading>
      <motion.ul
        className="list-inside list-disc space-y-2 pl-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <li>Petting cats</li>
        <li>Billiard</li>
        <li>Audiobooks about psychology</li>
        <li>Cultivating relationships with people</li>
        <li>Big time traveller</li>
      </motion.ul>

      {/* Achievements */}
      <SectionHeading icon={Award}>Achievements</SectionHeading>
      <motion.ul
        className="list-inside list-disc space-y-2 pl-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <li>
          2017 – Allowed by Czech court to do business before the age of 18
        </li>
        <li>
          2020 – Top 3 in the Czech national programming competition for high
          schools
        </li>
        <li>2022 – Moved 11,000 km to Indonesia to see what's up there</li>
        <li>
          2022 – Realised that sharing technology knowledge is the key to growth
        </li>
      </motion.ul>
    </main>
  );
}
