/**
 * SEO prerender — creates per-route index.html copies with correct <head> meta tags.
 * Does NOT render the body (avoids React hydration mismatch).
 * The SPA handles body rendering client-side.
 *
 * Routes are sourced from scripts/site-routes.ts (single source of truth).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_ROUTES, type RouteSEO } from "./site-routes.ts";

const DIST_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const SITE_URL = "https://danielsuchan.dev";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

function buildSeoHead(seo: RouteSEO): string {
  const url = `${SITE_URL}${seo.path}`;
  const robots = seo.noindex
    ? `\n    <meta name="robots" content="noindex,follow">`
    : "";
  return `    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}">
    <meta name="author" content="Daniel Suchan">
    <link rel="canonical" href="${url}">${robots}
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

  const tagsToRemove = [
    /<title>[^<]*<\/title>/g,
    /<meta name="description"[^>]*>/g,
    /<meta name="author"[^>]*>/g,
    /<meta name="robots"[^>]*>/g,
    /<link rel="canonical"[^>]*>/g,
    /<meta property="og:[^>]*>/g,
    /<meta name="twitter:[^>]*>/g,
  ];

  for (const pattern of tagsToRemove) {
    html = html.replace(pattern, "");
  }

  const seoHead = buildSeoHead(seo);
  html = html.replace(
    /(<meta name="viewport"[^>]*>)/,
    `$1\n${seoHead}`,
  );

  html = html.replace(/\n\s*\n\s*\n/g, "\n\n");
  return html;
}

function prerender() {
  console.log("SEO prerender (head-only, no Playwright)...");

  const baseHtml = readFileSync(join(DIST_DIR, "index.html"), "utf-8");

  for (const route of ALL_ROUTES) {
    const html = injectSeoHead(baseHtml, route);

    const outputPath =
      route.path === "/"
        ? join(DIST_DIR, "index.html")
        : join(DIST_DIR, route.path.slice(1), "index.html");

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html);
    console.log(`  ${route.path} → ${outputPath}`);
  }

  console.log(`Done! Prerendered ${ALL_ROUTES.length} routes.`);
}

prerender();
