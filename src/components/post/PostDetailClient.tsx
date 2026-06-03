"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { categoryLabel } from "@/lib/constants/constants";
import { ContactDisplay } from "@/components/ui/ContactDisplay";
import { UserIdentity } from "@/components/ui/UserIdentity";
import { PostHandChip } from "@/components/post/PostHandChip";
import { ImportantMark, PostStatusBadge } from "@/components/post/PostBadges";
import { PostImageGallery } from "@/components/post/PostImageGallery";
import { CommentsSection } from "@/components/post/CommentsSection";
import { DeletePostModal } from "@/components/post/DeletePostModal";
import { EditPostModal } from "@/components/post/EditPostModal";
import { useProfile } from "@/components/profile/ProfileProvider";
import { isPostOpenForHands } from "@/lib/posts/status";
import { formatPostedAt, timeAgo } from "@/lib/utils/time";
import type { Hand, Post, CommentWithReplies } from "@/lib/types";

export function PostDetailClient({
  initialPost,
  authorAvatar = null,
  initialHands,
  initialComments,
  initialCommentCount,
}: {
  initialPost: Post;
  authorAvatar?: string | null;
  initialHands: Hand[];
  initialComments: CommentWithReplies[];
  initialCommentCount: number;
}) {
  const { profile, ready } = useProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [post, setPost] = useState(initialPost);
  const [hands] = useState(initialHands);
  const [editPostOpen, setEditPostOpen] = useState(false);
  const [confirmDeletePost, setConfirmDeletePost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const myHand = hands.find((h) => h.userId === profile?.id);
  const isOwner = profile?.id === post.authorId;
  const handsHref = `/posts/${post.id}/hands`;
  const acceptsHands = isPostOpenForHands(post.status);

  useEffect(() => {
    const panel = searchParams.get("panel");
    if (panel === "hands" || panel === "people") {
      router.replace(handsHref);
    }
  }, [searchParams, router, handsHref]);

  const patchMeta = async (payload: {
    status?: Post["status"];
    important?: boolean;
  }) => {
    setLoading(true);
    setError("");
    const snapshot = { status: post.status, important: post.important };
    setPost((prev) => ({ ...prev, ...payload }));
    try {
      const res = await fetch("/api/posts/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setPost((prev) => ({
        ...prev,
        status: data.status ?? prev.status,
        important: data.important ?? prev.important,
      }));
      router.refresh();
    } catch (e) {
      setPost((prev) => ({ ...prev, ...snapshot }));
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/posts/item?id=${encodeURIComponent(post.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");
      router.push("/posts");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const HandChip = (
    <PostHandChip
      postId={post.id}
      status={post.status}
      handCount={hands.length}
      viewerHasHand={!!myHand}
      size="md"
    />
  );

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                post.type === "lost"
                  ? "border border-ink"
                  : "bg-ink text-paper"
              }`}
            >
              {post.type}
            </span>
            <span className="text-[10px] text-mute uppercase tracking-wide">
              {categoryLabel(post.category)}
            </span>
            {post.important && <ImportantMark />}
            <PostStatusBadge status={post.status} />
          </div>
          {isOwner && (
            <div className="flex flex-wrap items-center gap-2">
              {acceptsHands ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => patchMeta({ status: "resolved" })}
                  className="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-mute transition-colors hover:border-emerald-600/40 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 disabled:opacity-50"
                >
                  Mark resolved
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => patchMeta({ status: "open" })}
                  className="inline-flex items-center rounded-full border border-emerald-600/40 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 disabled:opacity-50"
                >
                  Reopen post
                </button>
              )}
              <button
                type="button"
                disabled={loading}
                onClick={() => patchMeta({ important: !post.important })}
                className={
                  post.important
                    ? "inline-flex items-center gap-1 rounded-full border border-ink bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-paper disabled:opacity-50"
                    : "rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-mute transition-colors hover:border-ink/30 hover:bg-surface hover:text-ink disabled:opacity-50"
                }
              >
                {post.important ? (
                  <>
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6L12 2z" />
                    </svg>
                    Important
                  </>
                ) : (
                  "Mark important"
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditPostOpen(true)}
                className="text-xs text-mute underline hover:text-ink"
              >
                Edit post
              </button>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setConfirmDeletePost(true);
                }}
                className="text-xs text-mute underline hover:text-ink"
              >
                Delete post
              </button>
            </div>
          )}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{post.title}</h1>
        <p className="text-sm text-body">{post.location}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mute">
          <UserIdentity
            userId={post.authorId}
            name={post.authorName}
            avatar={authorAvatar}
            size="xs"
            nameClassName="text-sm font-medium text-ink"
            className="flex items-center gap-2"
          />
          <span className="text-subtle">·</span>
          <time dateTime={post.createdAt} title={formatPostedAt(post.createdAt)}>
            Posted {timeAgo(post.createdAt)}
          </time>
        </div>
      </header>

      {!acceptsHands && (
        <p className="rounded-xl border border-line bg-line/20 px-4 py-3 text-sm text-body">
          This post is <strong className="font-medium text-ink">resolved</strong>.
          New hands are closed; existing messages and comments stay visible.
        </p>
      )}

      {post.images.length > 0 && (
        <div className="space-y-2">
          <PostImageGallery
            images={post.images}
            title={post.title}
            overlay={HandChip}
          />
          <p className="text-[10px] text-mute">Tap any photo to view full screen.</p>
        </div>
      )}

      <p className="text-description">{post.description}</p>

      <div className="flex flex-wrap items-center gap-3">
        {post.images.length === 0 && HandChip}
        {hands.length > 0 && (
          <Link
            href={handsHref}
            className="text-xs text-mute underline hover:text-ink"
          >
            View {hands.length} raised {hands.length === 1 ? "hand" : "hands"}
          </Link>
        )}
      </div>

      {error && <p className="text-sm text-ink">{error}</p>}

      {!ready ? null : isOwner ? (
        <p className="text-sm text-mute">
          {acceptsHands
            ? "You posted this. Others can raise a hand when they have a lead."
            : "You posted this. Mark it open again if you still need help."}
        </p>
      ) : !profile ? (
        <p className="text-sm text-mute">
          <Link href="/login" className="underline hover:text-ink">
            Sign in
          </Link>{" "}
          to raise your hand on this post.
        </p>
      ) : !myHand && acceptsHands ? (
        <p className="text-sm text-mute">
          <Link href={handsHref} className="underline hover:text-ink">
            Raise your hand
          </Link>{" "}
          if you have a lead on this item.
        </p>
      ) : null}

      <CommentsSection
        postId={post.id}
        postAuthorId={post.authorId}
        initialComments={initialComments}
        initialTotal={initialCommentCount}
      />

      <section className="rounded-2xl border border-line p-5">
        <h2 className="text-xs uppercase tracking-wider text-mute font-medium mb-3">
          Poster contact
        </h2>
        <ContactDisplay contact={post.contact} />
      </section>

      {editPostOpen && (
        <EditPostModal
          post={post}
          onClose={() => setEditPostOpen(false)}
          onSaved={(updated) =>
            setPost((prev) => ({
              ...prev,
              type: updated.type,
              category: updated.category,
              title: updated.title,
              description: updated.description,
              location: updated.location,
              images: updated.images,
            }))
          }
        />
      )}
      {confirmDeletePost && (
        <DeletePostModal
          postTitle={post.title}
          authorName={profile?.name ?? post.authorName}
          authorAvatar={profile?.avatar}
          onClose={() => {
            setConfirmDeletePost(false);
            setError("");
          }}
          onConfirm={deletePost}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}
