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
      "Personal portfolio of Daniel Suchan — Software Engineer & CTO based in Brno, Czech Republic.",
  };
}

export function profilePageSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [websiteSchema(), { "@type": "ProfilePage", mainEntity: personSchema() }],
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

export function webPageSchema({ name, description, path }: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: `${SITE_URL}${path}`,
  };
}
