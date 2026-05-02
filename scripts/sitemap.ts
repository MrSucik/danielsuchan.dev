/**
 * Sitemap generator — runs after build, writes dist/sitemap.xml from
 * scripts/site-routes.ts. Excludes routes flagged `noindex`.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_ROUTES } from "./site-routes.ts";

const DIST_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const SITE_URL = "https://danielsuchan.dev";

function buildSitemap(): string {
  const indexedRoutes = ALL_ROUTES.filter((r) => !r.noindex);
  const entries = indexedRoutes
    .map((r) => {
      const loc = `${SITE_URL}${r.path === "/" ? "/" : r.path}`;
      const lastmod = r.lastmod ?? new Date().toISOString().slice(0, 10);
      const changefreq = r.changefreq ?? "monthly";
      const priority = (r.priority ?? 0.5).toFixed(1);
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function main() {
  const xml = buildSitemap();
  writeFileSync(join(DIST_DIR, "sitemap.xml"), xml);
  const indexedCount = ALL_ROUTES.filter((r) => !r.noindex).length;
  const noindexCount = ALL_ROUTES.length - indexedCount;
  console.log(
    `Sitemap: ${indexedCount} indexed routes, ${noindexCount} noindex skipped.`,
  );
}

main();
