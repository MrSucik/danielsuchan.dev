import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      {
        title: "Daniel Suchan: Resume",
      },
      {
        name: "description",
        content: "Daniel Suchan: Resume",
      },
    ],
  }),
});

function Index() {
  const yearsExperience = Math.round(new Date().getFullYear() - 2016);

  return (
    <main className="max-w-2xl m-auto p-4">
      <h1 className="text-4xl font-bold mt-6 mb-4">Resume - Daniel Suchan</h1>
      <p className="dark:border-l-white border-l-black border-l-2 pl-4">
        I'm a software engineer based in <b>Brno</b> with {yearsExperience}{" "}
        years of experience in the software industry.
        <br />
      </p>
      <h2 className="mt-10 mb-4 text-3xl font-semibold">
        ☎️ Contact information
      </h2>
      <p>
        📧 &nbsp; <a href="mailto:mr.sucik@gmail.com">mr.sucik@gmail.com</a>
      </p>
      <hr className="my-8" />
      <h2 className="mt-10 mb-4 text-3xl font-semibold">
        👨‍💻 Work experience
      </h2>
      <h3 className="text-2xl font-medium mt-8 mb-2">Co-Founder & CTO</h3>
      <a
        href="https://blaze.codes/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold tracking-wide"
      >
        blaze.codes
      </a>
      <p className="mb-2 mt-2 italic text-grey-text">
        <b>Blaze Company</b>, Brno, Czech Republic – (January 2023 - present)
      </p>
      <p>Leading multiple development teams:</p>
      <ul className="list-disc list-inside ml-4 mt-2">
        <li>
          <a
            href="https://rozpocetpro.cz"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            rozpocetpro.cz
          </a>{" "}
          - Development Lead
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
          - Development Lead
        </li>
      </ul>

      <h3 className="text-2xl font-medium mt-8 mb-2">
        Software Startup Founder
      </h3>
      <a
        href="https://jarvischeck.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold tracking-wide"
      >
        jarvischeck.com
      </a>
      <p className="mb-2 mt-2 italic text-grey-text">
        <b>JarvisCheck</b>, Brno, Czech Republic – (January 2025 - present)
      </p>
      <p>
        Building and maintaining a website monitoring and alerting service
        platform. Responsible for full-stack development, infrastructure, and
        business operations.
      </p>
      <h3 className="text-2xl font-medium mt-8 mb-2">Development Lead</h3>
      <a
        href="https://www.xalarm.cz/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold tracking-wide"
      >
        xalarm.cz
      </a>
      <p className="mb-2 mt-2 italic text-grey-text">
        <b>XALARM</b>, Brno, Czech Republic – (December 2022 - September 2023)
      </p>
      <p>
        Responsible for planning, developing, and deploying a new service with
        mobile application for personal safety. (TS, React Native, NextJS,
        Postgres, Firebase, NodeJS, Twillio, Vercel, Expo)
      </p>
      <h3 className="text-2xl font-medium mt-8 mb-2">Frontend Developer</h3>
      <a
        href="https://www.enter.xyz/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold tracking-wide"
      >
        enter.xyz
      </a>
      <p className="mb-2 mt-2 italic text-grey-text">
        <b>STRV</b>, Brno, Czech Republic – (June 2022 - April 2024)
      </p>
      <p>
        Frontend engineer in the team responsible for delivering the next
        unicorn - enter.xyz (TS, React, Remix, GraphQL, Vercel)
      </p>
      <h3 className="text-2xl font-medium mt-8 mb-2">
        Software Startup Founder
      </h3>
      <a
        href="https://www.syncoli.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold tracking-wide"
      >
        syncoli.com
      </a>
      <p className="mb-2 mt-2 italic text-grey-text">
        <b>Syncoli</b>, Brno, Czech Republic – (August 2020 - present)
      </p>
      <p>
        Lead team of 4 members providing modern digital signage solutions with
        cutting-edge technology. I'm responsible for leading the team, the
        software, and communication with customers (TS, React, Remix,
        PostgreSQL, Cypress, NodeJS, Firebase, Python, GitHub Actions, Sentry,
        Rust). Currently in maintenance mode and no longer actively developed.
      </p>
      <h3 className="text-2xl font-medium mt-8 mb-2">Full-stack Developer</h3>
      <p className="mb-2 mt-2 italic text-grey-text">
        <b>Cantata Health</b>, Brno and Ostrava, Czech Republic – (March 2017 -
        April 2022)
      </p>
      <p>
        Together with my team, I analyzed, implemented, and deployed several
        projects for a gigantic electronic health record system. Major of my
        work during the last 3 years was on the frontend (TS, React, React
        Native, REST, C#, ASP.NET, MSSQL)
      </p>
      <hr className="my-8" />
      <h2 className="mt-10 mb-4 text-3xl font-semibold">🛠 Maintaining</h2>
      <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
        <li>
          <a
            href="https://jarvischeck.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            jarvischeck.com
          </a>{" "}
          - Website monitoring and alerting service
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
          - Modern digital signage solutions platform
        </li>
      </ul>
      <hr className="my-8" />
      <h2 className="mt-10 mb-4 text-3xl font-semibold">🗣 Languages</h2>
      <h3>Czech 🇨🇿</h3>
      <p>Native speaker</p>
      <h3>English 🇺🇸</h3>
      <p>Comfortable spoken and written</p>
      <hr className="my-8" />
      <h2 className="mt-10 mb-4 text-3xl font-semibold">😼 Hobbies</h2>
      <p>Petting cats</p>
      <p>Billiard</p>
      <p>Audiobooks about psychology</p>
      <p>Cultivating relationships with people</p>
      <p>Big time traveller</p>
      <hr className="my-8" />
      <h2 className="mt-10 mb-4 text-3xl font-semibold">😎 Achievements</h2>
      <p>
        2017 <em>–</em> Allowed by Czech court to do business before the age of
        18
      </p>
      <p>
        2020 <em>–</em> Top 3 in the Czech national round of programming
        competition for high schools
      </p>
      <p>
        2022 <em>–</em> Moved 11000km away from my home to Indonesia to see
        what's up there
      </p>
      <p>
        2022 <em>–</em> Realised that sharing technology knowledge is the key to
        growth
      </p>
    </main>
  );
}
