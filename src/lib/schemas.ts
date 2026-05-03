import type { Project } from "./types";

const SITE_URL = "https://danielsuchan.dev";

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Daniel Suchan",
    givenName: "Daniel",
    familyName: "Suchan",
    url: SITE_URL,
    email: "mr.sucik@gmail.com",
    jobTitle: "Co-Founder & CTO",
    description:
      "Engineer building production AI systems. Building Dzarvis — a multi-agent assistant on Claude. CTO at Blaze. 8+ years writing production code, started at 16 with Czech court permission.",
    worksFor: {
      "@type": "Organization",
      name: "Blaze Company",
      url: "https://blaze.codes",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brno",
      addressCountry: "CZ",
    },
    nationality: {
      "@type": "Country",
      name: "Czech Republic",
    },
    knowsLanguage: ["cs", "en"],
    knowsAbout: [
      "AI engineering",
      "Multi-agent systems",
      "Model Context Protocol (MCP)",
      "Claude API",
      "TypeScript",
      "React",
      "React Native",
      "Node.js",
      "Hono",
      "PostgreSQL",
      "Production AI infrastructure",
      "Algorithmic trading",
    ],
    sameAs: [
      "https://www.linkedin.com/in/daniel-suchan-6b8611162/",
      "https://github.com/MrSucik",
      "https://dzarvis.com",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Daniel Suchan",
    url: SITE_URL,
    description:
      "Personal portfolio of Daniel Suchan — engineer building production AI systems based in Brno, Czech Republic.",
  };
}

export function blogPostingSchema({
  title,
  description,
  slug,
  datePublished,
  status,
}: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  status: "drafting" | "published";
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `${SITE_URL}/writing/${slug}`,
    datePublished,
    dateModified: datePublished,
    author: { "@type": "Person", name: "Daniel Suchan", url: SITE_URL },
    publisher: { "@type": "Person", name: "Daniel Suchan", url: SITE_URL },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/writing/${slug}`,
    },
    creativeWorkStatus: status === "drafting" ? "Draft" : "Published",
  };
}

export function profilePageSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteSchema(),
      { "@type": "ProfilePage", mainEntity: personSchema() },
    ],
  };
}

export function projectsSchema(projects: Project[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Projects by Daniel Suchan",
    url: `${SITE_URL}/projects`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          name: project.name,
          url: project.url,
          description: project.description,
          applicationCategory: "BusinessApplication",
        },
      })),
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.name,
        item: `${SITE_URL}${item.path}`,
      })),
    ],
  };
}

export function webPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: `${SITE_URL}${path}`,
  };
}
