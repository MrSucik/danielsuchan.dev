const SITE_URL = "https://danielsuchan.dev";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface PageSEO {
  title: string;
  description: string;
  path: string;
  ogType?: string;
  ogImage?: string;
}

export function buildHeadMeta({ title, description, path, ogType = "website", ogImage = DEFAULT_OG_IMAGE }: PageSEO) {
  const url = `${SITE_URL}${path}`;

  return [
    { title },
    { name: "description", content: description },
    { name: "author", content: "Daniel Suchan" },
    { tagType: "link" as const, rel: "canonical", href: url },
    { property: "og:type", content: ogType },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: title },
    { property: "og:locale", content: "en_US" },
    { property: "og:site_name", content: "Daniel Suchan" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    { name: "twitter:image:alt", content: title },
  ];
}
