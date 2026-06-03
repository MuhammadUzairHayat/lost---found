"use client";

import Link from "next/link";
import { PostCard } from "@/components/post/PostCard";
import { useMyHandPostIds } from "@/components/post/useMyHandPostIds";
import type { PublicPost } from "@/lib/api/responses";
import type { Comment } from "@/lib/types";

export function UserProfilePosts({
  posts,
  isSelf,
  commentCountOnly = false,
}: {
  posts: {
    post: PublicPost;
    handCount: number;
    commentCount: number;
    recentComments: Comment[];
  }[];
  isSelf: boolean;
  commentCountOnly?: boolean;
}) {
  const myHandPostIds = useMyHandPostIds();

  if (posts.length === 0) {
    return (
      <div className="card px-6 py-14 text-center">
        <p className="text-sm text-body">
          {isSelf
            ? "You haven't posted anything yet."
            : "No posts from this member yet."}
        </p>
        {isSelf && (
          <Link href="/posts/new" className="btn-primary mt-4">
            Create a post
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map(({ post, handCount, commentCount, recentComments }) => (
        <PostCard
          key={post.id}
          post={post}
          handCount={handCount}
          commentCount={commentCount}
          recentComments={recentComments}
          viewerHasHand={myHandPostIds.has(post.id)}
          hideAuthor
          commentCountOnly={commentCountOnly}
        />
      ))}
    </div>
  );
}
