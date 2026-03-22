import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIST_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORT = 4173;

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
      "17 products and platforms built, co-founded, or led by Daniel Suchan \u2014 from AI tools to enterprise apps.",
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

function cleanAndInjectHead(html: string, seo: RouteSEO): string {
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

  const seoHead = buildSeoHead(seo);
  html = html.replace(
    /(<meta name="viewport"[^>]*>)/,
    `$1\n${seoHead}`,
  );

  html = html.replace(/\n\s*\n\s*\n/g, "\n\n");
  return html;
}

function createStaticServer(distDir: string, templatePath: string, port: number) {
  const mimeTypes: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
  };

  const server = createServer((req, res) => {
    const url = req.url ?? "/";
    const filePath = join(distDir, url === "/" ? "index.html" : url);

    try {
      const content = readFileSync(filePath);
      const ext = filePath.substring(filePath.lastIndexOf("."));
      res.writeHead(200, { "Content-Type": mimeTypes[ext] ?? "application/octet-stream" });
      res.end(content);
    } catch {
      // SPA fallback: always serve the ORIGINAL template, not a prerendered version
      const fallback = readFileSync(templatePath);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(fallback);
    }
  });

  return new Promise<typeof server>((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function prerender() {
  console.log("Starting prerender...");

  // Save the original index.html as a template before any modifications
  const templatePath = join(DIST_DIR, "_template.html");
  copyFileSync(join(DIST_DIR, "index.html"), templatePath);

  const server = await createStaticServer(DIST_DIR, templatePath, PORT);
  const browser = await chromium.launch();

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      const url = `http://localhost:${PORT}${route.path}`;

      console.log(`  Rendering ${route.path}...`);
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      let html = await page.content();
      html = cleanAndInjectHead(html, route);

      const outputPath =
        route.path === "/"
          ? join(DIST_DIR, "index.html")
          : join(DIST_DIR, route.path.slice(1), "index.html");

      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, `<!DOCTYPE html>\n${html}`);
      console.log(`  Wrote ${outputPath}`);

      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  // Clean up template
  try {
    const { unlinkSync } = await import("node:fs");
    unlinkSync(templatePath);
  } catch {}

  console.log("Prerender complete!");
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
