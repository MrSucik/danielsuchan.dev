import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { JsonLd } from "../components/JsonLd";
import {
  blogPostingSchema,
  breadcrumbSchema,
  webPageSchema,
} from "../lib/schemas";
import { buildHeadMeta } from "../lib/seo";
import { getPost } from "../lib/writing-posts";

export const Route = createFileRoute("/writing/$slug")({
  component: WritingPost,
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? buildHeadMeta({
          title: `${loaderData.post.title} – Daniel Suchan`,
          description: loaderData.post.teaser,
          path: `/writing/${loaderData.post.slug}`,
        })
      : [],
  }),
});

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function WritingPost() {
  const { post } = Route.useLoaderData();
  const isDraft = post.status === "drafting";

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <JsonLd
        data={webPageSchema({
          name: post.title,
          description: post.teaser,
          path: `/writing/${post.slug}`,
        })}
      />
      <JsonLd
        data={blogPostingSchema({
          title: post.title,
          description: post.teaser,
          slug: post.slug,
          datePublished: post.date,
          status: post.status,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Writing", path: "/writing" },
          { name: post.title, path: `/writing/${post.slug}` },
        ])}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          to="/writing"
          className="mb-8 inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft size={12} /> Writing
        </Link>
      </motion.div>

      {isDraft && (
        <motion.div
          className="mb-8 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--text-muted)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <span className="font-mono text-[var(--accent)]">DRAFT</span> — not
          yet published. Sharing for review.
        </motion.div>
      )}

      <motion.header
        className="mb-12"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
          {post.topic} &middot; {formatDate(post.date)}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-bright)] md:text-4xl">
          {post.title}
        </h1>
      </motion.header>

      <motion.article
        className="prose-post"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
      </motion.article>
    </main>
  );
}
