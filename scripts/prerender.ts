/**
 * SEO prerender — creates per-route index.html copies with correct <head> meta tags.
 * Does NOT render the body (avoids React hydration mismatch).
 * The SPA handles body rendering client-side.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIST_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const SITE_URL = "https://danielsuchan.dev";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

interface RouteSEO {
  path: string;
  title: string;
  description: string;
}

const ROUTES: RouteSEO[] = [
  {
    path: "/",
    title: "Daniel Suchan \u2013 Software Engineer & CTO | Brno",
    description:
      "Software engineer and CTO based in Brno. Co-Founder at blaze.codes, building SaaS products and leading engineering teams across 17+ projects.",
  },
  {
    path: "/projects",
    title: "Projects \u2013 Daniel Suchan | SaaS, Apps & Platforms",
    description:
      "18 products and platforms built, co-founded, or led by Daniel Suchan \u2014 from AI tools to enterprise apps.",
  },
  {
    path: "/changelog",
    title: "Changelog \u2013 Daniel Suchan | Updates & Releases",
    description:
      "Latest updates on projects, releases, and technical decisions from Daniel Suchan.",
  },
  {
    path: "/newsletter",
    title: "Newsletter \u2013 Daniel Suchan | Engineering Updates",
    description:
      "Subscribe to engineering and startup updates from Daniel Suchan, CTO and Co-Founder at blaze.codes.",
  },
];

function buildSeoHead(seo: RouteSEO): string {
  const url = `${SITE_URL}${seo.path}`;
  return `    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}">
    <meta name="author" content="Daniel Suchan">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${seo.title}">
    <meta property="og:description" content="${seo.description}">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${seo.title}">
    <meta property="og:locale" content="en_US">
    <meta property="og:site_name" content="Daniel Suchan">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seo.title}">
    <meta name="twitter:description" content="${seo.description}">
    <meta name="twitter:image" content="${OG_IMAGE}">
    <meta name="twitter:image:alt" content="${seo.title}">`;
}

function injectSeoHead(baseHtml: string, seo: RouteSEO): string {
  let html = baseHtml;

  // Remove existing meta tags that we'll replace
  const tagsToRemove = [
    /<title>[^<]*<\/title>/g,
    /<meta name="description"[^>]*>/g,
    /<meta name="author"[^>]*>/g,
    /<link rel="canonical"[^>]*>/g,
    /<meta property="og:[^>]*>/g,
    /<meta name="twitter:[^>]*>/g,
  ];

  for (const pattern of tagsToRemove) {
    html = html.replace(pattern, "");
  }

  // Inject route-specific SEO tags after viewport meta
  const seoHead = buildSeoHead(seo);
  html = html.replace(
    /(<meta name="viewport"[^>]*>)/,
    `$1\n${seoHead}`,
  );

  // Clean up extra blank lines
  html = html.replace(/\n\s*\n\s*\n/g, "\n\n");
  return html;
}

function prerender() {
  console.log("SEO prerender (head-only, no Playwright)...");

  const baseHtml = readFileSync(join(DIST_DIR, "index.html"), "utf-8");

  for (const route of ROUTES) {
    const html = injectSeoHead(baseHtml, route);

    const outputPath =
      route.path === "/"
        ? join(DIST_DIR, "index.html")
        : join(DIST_DIR, route.path.slice(1), "index.html");

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html);
    console.log(`  ${route.path} → ${outputPath}`);
  }

  console.log("Done!");
}

prerender();
