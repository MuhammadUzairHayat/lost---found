export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { AnimatedLostFound } from "@/components/ui/AnimatedLostFound";

import { PageShapes } from "@/components/ui/PageShapes";

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

    <div className="relative">

      <PageShapes />

      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">

        <p className="page-eyebrow">Browse</p>

        <h1 className="mt-2 page-title">

          <AnimatedLostFound /> posts

        </h1>

        <p className="mt-3 max-w-md text-description">

          Search posts, open Filters to refine, then apply. Tap the hand to see who

          is connected to a post.

        </p>

        <Suspense fallback={<p className="mt-8 text-sm text-mute">Loading posts…</p>}>
          <PostsBrowser initial={withCounts} />
        </Suspense>

      </div>

    </div>

  );

}

