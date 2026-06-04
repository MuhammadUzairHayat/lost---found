export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { AnimatedLostFound } from "@/components/ui/AnimatedLostFound";
import { PostsBrowseScene } from "@/components/ui/PostsBrowseScene";
import { PostsBrowser } from "@/components/post/PostsBrowser";
import {
  getAllPostsWithHandCounts,
  getCommentCountsByPostIds,
  getRecentCommentsByPostIds,
} from "@/lib/db/db";

export default async function PostsPage() {
  const rows = await getAllPostsWithHandCounts();
  const postIds = rows.map((r) => r.id);
  const [commentCounts, recentByPost] = await Promise.all([
    getCommentCountsByPostIds(postIds),
    getRecentCommentsByPostIds(postIds, 4),
  ]);

  const withCounts = rows.map(({ handCount, ...post }) => ({
    post,
    handCount,
    commentCount: commentCounts[post.id] ?? 0,
    recentComments: recentByPost[post.id] ?? [],
  }));

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr,min(300px,38%)] lg:gap-10 xl:gap-14">
          <div className="min-w-0">
            <p className="page-eyebrow animate-fade-up opacity-0 [animation-fill-mode:forwards]">
              Browse
            </p>
            <h1 className="mt-2 page-title animate-fade-up opacity-0 [animation-delay:80ms] [animation-fill-mode:forwards]">
              <AnimatedLostFound loop={true} /> posts
            </h1>
            <p className="mt-3 max-w-md text-description animate-fade-up opacity-0 [animation-delay:160ms] [animation-fill-mode:forwards]">
              Search posts, open Filters to refine, then apply. Tap the hand to
              see who is connected to a post.
            </p>
          </div>

          <div className="hidden sm:block animate-fade-in opacity-0 [animation-delay:240ms] [animation-fill-mode:forwards]">
            <PostsBrowseScene />
          </div>
        </div>

        <Suspense fallback={<p className="mt-8 text-sm text-mute">Loading posts…</p>}>
          <PostsBrowser initial={withCounts} />
        </Suspense>
      </div>
    </div>
  );
}
