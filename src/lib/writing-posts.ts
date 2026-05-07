import sandboxesRaw from "../data/writing/agent-sandboxes-infra.md?raw";
import appearanceRaw from "../data/writing/appearance-of-software-working.md?raw";
import subagentRaw from "../data/writing/subagent-orchestration.md?raw";

export type PostStatus = "drafting" | "published";

export interface PostFrontmatter {
  title: string;
  slug: string;
  date: string;
  status: PostStatus;
  topic: string;
  teaser: string;
}

export interface Post extends PostFrontmatter {
  body: string;
}

function parseFrontmatter(raw: string): { fm: PostFrontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Invalid post: missing frontmatter");
  }
  const [, fmBlock, body] = match;
  const fm: Record<string, string> = {};
  for (const line of fmBlock.split("\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();
    fm[key] = value;
  }
  for (const required of [
    "title",
    "slug",
    "date",
    "status",
    "topic",
    "teaser",
  ]) {
    if (!fm[required]) {
      throw new Error(`Invalid post: missing frontmatter field "${required}"`);
    }
  }
  if (fm.status !== "drafting" && fm.status !== "published") {
    throw new Error(`Invalid post status: ${fm.status}`);
  }
  return {
    fm: {
      title: fm.title,
      slug: fm.slug,
      date: fm.date,
      status: fm.status as PostStatus,
      topic: fm.topic,
      teaser: fm.teaser,
    },
    body: body.trim(),
  };
}

const rawPosts = [appearanceRaw, sandboxesRaw, subagentRaw];

export const posts: Post[] = rawPosts.map((raw) => {
  const { fm, body } = parseFrontmatter(raw);
  return { ...fm, body };
});

export const postsBySlug: Record<string, Post> = Object.fromEntries(
  posts.map((p) => [p.slug, p]),
);

export function getPost(slug: string): Post | undefined {
  return postsBySlug[slug];
}
