export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageShapes } from "@/components/ui/PageShapes";
import { PostDetailClient } from "@/components/post/PostDetailClient";
import { applyPostVisibility } from "@/lib/api/post-access";
import { buildCommentTree } from "@/lib/comments/tree";
import { getSessionFromCookies } from "@/lib/auth/auth";
import {
  getCommentsByPostId,
  getHandsByPostId,
  getPostByIdWithAuthorAvatar,
} from "@/lib/db/db";
export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostByIdWithAuthorAvatar(id);
  if (!post) notFound();
  const { authorAvatar, ...postData } = post;

  const hands = await getHandsByPostId(id);
  const comments = await getCommentsByPostId(id);
  const commentTree = buildCommentTree(comments);
  const session = await getSessionFromCookies();
  const viewerId = session?.id ?? null;
  const { post: visiblePost, hands: visibleHands } = applyPostVisibility(
    viewerId,
    postData,
    hands
  );
  return (
    <div className="relative">
      <PageShapes variant="minimal" />
      <div className="relative mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/posts"
          className="text-xs text-mute hover:text-ink mb-6 inline-block"
        >
          ← Back to browse
        </Link>
        <Suspense fallback={<p className="text-sm text-mute">Loading…</p>}>
          <PostDetailClient
            initialPost={visiblePost}
            authorAvatar={authorAvatar}
            initialHands={visibleHands}
            initialComments={commentTree}
            initialCommentCount={comments.length}
          />
        </Suspense>
      </div>
    </div>
  );
}
