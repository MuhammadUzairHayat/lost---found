import Link from "next/link";
import { categoryLabel } from "@/lib/constants/constants";
import {
  postsBrowseFilterHref,
  type BrowseFilters,
} from "@/lib/posts/browse-filters";
import { PostHandChip } from "@/components/post/PostHandChip";
import { UserIdentity } from "@/components/ui/UserIdentity";
import { CommentSlider } from "@/components/post/CommentSlider";
import { ImportantMark, PostStatusBadge } from "@/components/post/PostBadges";
import type { PublicPost } from "@/lib/api/responses";
import type { Comment } from "@/lib/types";
import { timeAgo } from "@/lib/utils/time";

function LocationIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-2.5 w-2.5 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function PostCard({
  post,
  handCount = 0,
  commentCount = 0,
  recentComments = [],
  requireAuth = false,
  viewerHasHand = false,
  hideAuthor = false,
  commentCountOnly = false,
  browseFilterContext,
}: {
  post: PublicPost;
  handCount?: number;
  commentCount?: number;
  recentComments?: Comment[];
  requireAuth?: boolean;
  viewerHasHand?: boolean;
  hideAuthor?: boolean;
  /** When true, show comment count only — no preview slider. */
  commentCountOnly?: boolean;
  /** When set (e.g. on /posts), card filter links keep the other active filters. */
  browseFilterContext?: BrowseFilters;
}) {
  const postHref = requireAuth
    ? `/login?callbackUrl=${encodeURIComponent(`/posts/${post.id}`)}`
    : `/posts/${post.id}`;
  const commentsHref = requireAuth
    ? postHref
    : `/posts/${post.id}#comments`;
  const hasComments = commentCount > 0 || recentComments.length > 0;
  const typeFilterHref = postsBrowseFilterHref(
    browseFilterContext
      ? { ...browseFilterContext, type: post.type }
      : { type: post.type },
    requireAuth
  );
  const categoryFilterHref = postsBrowseFilterHref(
    browseFilterContext
      ? { ...browseFilterContext, category: post.category }
      : { category: post.category },
    requireAuth
  );
  const typeBadgeClass =
    post.type === "lost"
      ? "border border-ink text-ink"
      : "bg-ink text-paper";

  const showMeta = post.important || post.status !== "open";
  const cardStateClass =
    post.status === "resolved"
      ? "ring-1 ring-emerald-600/25"
      : post.important
        ? "ring-1 ring-ink/15"
        : "";

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden card-interactive ${cardStateClass}`}
    >
      <Link
        href={postHref}
        className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        aria-label={`View post: ${post.title}`}
        tabIndex={0}
      />

      {post.images.length > 0 ? (
        <div className="relative pointer-events-none">
          <div className="block aspect-[3/2] overflow-hidden bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.images[0]}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
          {showMeta && (
            <div className="absolute left-2.5 top-2.5 z-10 flex flex-wrap gap-1">
              {post.important && <ImportantMark />}
              <PostStatusBadge status={post.status} />
            </div>
          )}
          <PostHandChip
            postId={post.id}
            status={post.status}
            handCount={handCount}
            viewerHasHand={viewerHasHand}
            requireAuth={requireAuth}
            size="sm"
            className="pointer-events-auto absolute bottom-2.5 right-2.5 z-10"
          />
        </div>
      ) : (
        <div className="relative z-[1] flex items-center justify-between gap-2 border-b border-line px-3 py-1.5 pointer-events-none">
          {showMeta ? (
            <div className="flex flex-wrap gap-1">
              {post.important && <ImportantMark />}
              <PostStatusBadge status={post.status} />
            </div>
          ) : (
            <span />
          )}
          <PostHandChip
            postId={post.id}
            status={post.status}
            handCount={handCount}
            viewerHasHand={viewerHasHand}
            requireAuth={requireAuth}
            size="xs"
            className="pointer-events-auto"
          />
        </div>
      )}

      <div className="relative z-[1] flex flex-1 flex-col gap-2.5 p-4 pointer-events-none">
        <div className="flex items-start gap-2">
          <Link
            href={typeFilterHref}
            title={`Filter by ${post.type} posts`}
            className={`pointer-events-auto relative z-10 mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide transition-opacity hover:opacity-80 ${typeBadgeClass}`}
          >
            {post.type}
          </Link>
          <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-ink line-clamp-2 group-hover:underline underline-offset-2">
            {post.title}
          </h3>
        </div>

        <div className="pointer-events-auto relative z-10 flex min-w-0 items-center gap-1.5 text-[11px] text-mute">
          {hideAuthor ? (
            <Link
              href={categoryFilterHref}
              title={`Filter by ${categoryLabel(post.category)}`}
              className="truncate hover:text-ink hover:underline underline-offset-2"
            >
              {categoryLabel(post.category)}
            </Link>
          ) : (
            <>
              <UserIdentity
                userId={post.authorId}
                name={post.authorName}
                avatar={post.authorAvatar}
                size="xxxs"
                nameClassName="truncate font-medium text-ink text-[11px]"
                className="flex min-w-0 shrink items-center gap-1.5"
              />
              <span className="shrink-0 text-subtle">·</span>
              <Link
                href={categoryFilterHref}
                title={`Filter by ${categoryLabel(post.category)}`}
                className="truncate hover:text-ink hover:underline underline-offset-2"
              >
                {categoryLabel(post.category)}
              </Link>
            </>
          )}
        </div>

        <p className="flex items-center gap-1 text-[11px] text-body">
          <LocationIcon className="text-mute" />
          <span className="truncate">{post.location}</span>
        </p>

        <p className="text-xs leading-relaxed text-body line-clamp-2">
          {post.description}
        </p>

        <p className="text-[10px] text-mute">
          <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
        </p>

        {(commentCountOnly ? commentCount > 0 : hasComments) && (
          <div className="relative z-10 mt-auto border-t border-line pt-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-mute">
                {commentCount} {commentCount === 1 ? "comment" : "comments"}
              </span>
              {commentCount > 0 && (
                <Link
                  href={commentsHref}
                  className="pointer-events-auto text-[11px] font-medium text-body hover:text-ink hover:underline underline-offset-2"
                >
                  View
                </Link>
              )}
            </div>
            {!commentCountOnly && (
              <CommentSlider comments={recentComments} compact />
            )}
          </div>
        )}
      </div>
    </article>
  );
}
