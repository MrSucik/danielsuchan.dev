import type { Project } from "./types";

const SITE_URL = "https://danielsuchan.dev";

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Daniel Suchan",
    url: SITE_URL,
    email: "mr.sucik@gmail.com",
    jobTitle: "Co-Founder & CTO",
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
    knowsLanguage: ["cs", "en"],
    sameAs: [
      "https://www.linkedin.com/in/daniel-suchan-6b8611162/",
      "https://github.com/MrSucik",
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

export function dzarvisCaseStudySchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TechnicalArticle",
    headline: "Dzarvis — A multi-agent assistant on Claude",
    description:
      "Architecture write-up for Dzarvis: a multi-agent harness with narrow specialized subagents on top of a 208-tool MCP server, in stealth fine-tuning with a focus group of 15 companies.",
    url: `${SITE_URL}/case-studies/dzarvis`,
    datePublished: "2025-05-03",
    dateModified: "2025-05-03",
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: "Daniel Suchan",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Daniel Suchan",
      url: SITE_URL,
    },
    about: {
      "@type": "SoftwareApplication",
      name: "Dzarvis",
      url: "https://dzarvis.com",
      description:
        "Multi-agent assistant on Claude. Multi-agent harness with narrow specialized subagents on top of a 208-tool MCP server.",
      applicationCategory: "BusinessApplication",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/case-studies/dzarvis`,
    },
  };
}

export function labsIndexSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Labs – Live Demos and Tools by Daniel Suchan",
    description:
      "Interactive demos of multi-agent orchestration, MCP tooling, and AI infrastructure built by Daniel Suchan.",
    url: `${SITE_URL}/labs`,
    author: { "@type": "Person", name: "Daniel Suchan", url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "SoftwareApplication",
            name: "Subagent Task Decomposer",
            url: `${SITE_URL}/labs/decomposer`,
            description:
              "Visualize how a Dzarvis-style multi-agent system decomposes any task into specialized subagents.",
            applicationCategory: "DeveloperApplication",
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "SoftwareApplication",
            name: "MCP Inspector",
            url: `${SITE_URL}/labs/mcp`,
            description:
              "Live chat interface to Daniel's public MCP server — routed through the Model Context Protocol.",
            applicationCategory: "DeveloperApplication",
          },
        },
      ],
    },
  };
}

export function labsDemoSchema({
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
    "@type": "SoftwareApplication",
    name,
    description,
    url: `${SITE_URL}${path}`,
    applicationCategory: "DeveloperApplication",
    author: { "@type": "Person", name: "Daniel Suchan", url: SITE_URL },
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
