export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BreakdownBar } from "@/components/dashboard/BreakdownBar";
import { StatTile } from "@/components/dashboard/StatTile";
import { UserProfilePosts } from "@/components/users/UserProfilePosts";
import { ContactDisplay } from "@/components/ui/ContactDisplay";
import { PageShapes } from "@/components/ui/PageShapes";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getSessionFromCookies } from "@/lib/auth/auth";
import {
  CATEGORIES,
  POST_TYPES,
} from "@/lib/constants/constants";
import { getUserDashboardStats } from "@/lib/db/dashboard-query";
import {
  getCommentCountsByPostIds,
  getPostsByAuthorIdWithHandCounts,
} from "@/lib/db/db";
import { contactFromStoredUser } from "@/lib/db/users";
import { postStatusLabel } from "@/lib/posts/status";
import { timeAgo } from "@/lib/utils/time";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-ink",
  resolved: "bg-emerald-600",
  matched: "bg-blue-600",
  closed: "bg-mute",
};

export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }
  if (!session.isProfileComplete) {
    redirect("/profile/setup?callbackUrl=/dashboard");
  }

  const stats = await getUserDashboardStats(session.id);
  if (!stats) notFound();

  const { user, totals } = stats;
  const postRows = await getPostsByAuthorIdWithHandCounts(session.id);
  const postIds = postRows.map((r) => r.id);
  const commentCounts = await getCommentCountsByPostIds(postIds);

  const postsWithMeta = postRows.map(({ handCount, ...post }) => ({
    post,
    handCount,
    commentCount: commentCounts[post.id] ?? 0,
    recentComments: [],
  }));

  return (
    <div className="relative">
      <PageShapes variant="minimal" />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mute">
          <Link href="/posts" className="hover:text-ink">
            ← Browse posts
          </Link>
          <Link href="/profile" className="hover:text-ink">
            Edit profile
          </Link>
        </div>

        <p className="page-eyebrow">Your activity</p>
        <h1 className="mt-2 page-title">My dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-description">
          Your posts and raised hands in one place.
        </p>

        {/* Profile summary */}
        <div className="mt-8 card overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <UserAvatar
                name={user.name}
                avatar={user.avatar}
                size="lg"
                previewImage
                userId={user.id}
                linkToProfile={false}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-ink">{user.name}</p>
                    {user.studentId && (
                      <p className="mt-0.5 text-sm font-mono text-mute">
                        ID {user.studentId}
                      </p>
                    )}
                    {user.department && (
                      <p className="mt-0.5 text-sm text-mute">{user.department}</p>
                    )}
                    <p className="mt-0.5 text-xs text-mute">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="shrink-0 text-xs font-medium text-body underline underline-offset-2 hover:text-ink"
                  >
                    Edit profile
                  </Link>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                  <StatTile label="Posts" value={totals.posts} />
                  {totals.lostPosts > 0 && (
                    <StatTile label="Lost" value={totals.lostPosts} />
                  )}
                  {totals.foundPosts > 0 && (
                    <StatTile label="Found" value={totals.foundPosts} />
                  )}
                  <StatTile label="Hands raised" value={totals.handsRaised} />
                  <StatTile label="Comments" value={totals.comments} />
                  <StatTile label="Messages" value={totals.handMessages} />
                  <StatTile label="Open posts" value={totals.openPosts} />
                </dl>
              </div>
            </div>

            {user.bio && (
              <div className="mt-6 border-t border-line pt-6">
                <p className="text-sm leading-relaxed text-body whitespace-pre-wrap">
                  {user.bio}
                </p>
              </div>
            )}

            <div className="mt-6 border-t border-line pt-6">
              <p className="text-[10px] font-medium uppercase tracking-wider text-mute">
                Contact
              </p>
              <div className="mt-2">
                <ContactDisplay contact={contactFromStoredUser(user)} compact />
              </div>
            </div>
          </div>
        </div>

        {/* Post breakdowns */}
        {totals.posts > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <section className="card p-5 sm:p-6" aria-labelledby="my-status">
              <h2 id="my-status" className="section-title text-base">
                Your posts by status
              </h2>
              <div className="mt-4 space-y-3">
                {(["open", "resolved", "matched", "closed"] as const).map(
                  (status) => (
                    <BreakdownBar
                      key={status}
                      label={postStatusLabel(status)}
                      count={stats.postsByStatus[status] ?? 0}
                      total={totals.posts}
                      colorClass={STATUS_COLORS[status]}
                    />
                  )
                )}
              </div>
            </section>

            <section className="card p-5 sm:p-6" aria-labelledby="my-type">
              <h2 id="my-type" className="section-title text-base">
                By type
              </h2>
              <div className="mt-4 space-y-3">
                {POST_TYPES.map(({ id, label }) => (
                  <BreakdownBar
                    key={id}
                    label={label}
                    count={stats.postsByType[id] ?? 0}
                    total={totals.posts}
                    colorClass={id === "lost" ? "bg-ink" : "bg-ink/60"}
                  />
                ))}
              </div>
            </section>

            <section className="card p-5 sm:p-6" aria-labelledby="my-category">
              <h2 id="my-category" className="section-title text-base">
                By category
              </h2>
              <div className="mt-4 max-h-52 space-y-2.5 overflow-y-auto pr-1">
                {CATEGORIES.map(({ id, label }) => (
                  <BreakdownBar
                    key={id}
                    label={label}
                    count={stats.postsByCategory[id] ?? 0}
                    total={totals.posts}
                    colorClass="bg-ink/70"
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Your posts */}
        <section className="mt-10" aria-labelledby="my-posts">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="my-posts" className="section-title">
                Your posts
              </h2>
              <p className="mt-1 text-sm text-description">
                Everything you&apos;ve shared on the board.
              </p>
            </div>
            <Link href="/posts/new" className="btn-secondary text-xs sm:text-sm">
              New post
            </Link>
          </div>
          <UserProfilePosts posts={postsWithMeta} isSelf commentCountOnly />
        </section>

        {/* Hands raised */}
        <section className="mt-10" aria-labelledby="my-hands">
          <h2 id="my-hands" className="section-title">
            Hands you raised
          </h2>
          <p className="mt-1 text-sm text-description">
            Posts where you signalled you may have seen or found the item.
          </p>
          <ul className="mt-4 space-y-2">
            {stats.handsRaised.map((hand) => (
              <li key={hand.id}>
                <Link
                  href={`/posts/${hand.postId}/hands`}
                  className="card block p-4 transition-colors hover:border-ink/25 hover:bg-surface/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-body group-hover:text-ink">
                        {hand.postTitle}
                      </p>
                      <p className="mt-0.5 text-[11px] text-mute">
                        {hand.postType === "lost" ? "Lost" : "Found"}
                      </p>
                    </div>
                    <time
                      dateTime={hand.createdAt}
                      className="shrink-0 text-xs text-mute"
                    >
                      {timeAgo(hand.createdAt)}
                    </time>
                  </div>
                  {hand.note ? (
                    <p className="mt-2 text-sm text-body line-clamp-2">
                      {hand.note}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-mute italic">No note</p>
                  )}
                  <p className="mt-2 text-[11px] font-medium text-body">
                    View hand thread →
                  </p>
                </Link>
              </li>
            ))}
            {stats.handsRaised.length === 0 && (
              <li className="card p-6 text-center text-sm text-mute">
                You haven&apos;t raised a hand on any post yet.
              </li>
            )}
          </ul>
        </section>

        {/* Hand messages */}
        <section className="mt-10" aria-labelledby="my-messages">
          <h2 id="my-messages" className="section-title">
            Your hand messages
          </h2>
          <p className="mt-1 text-sm text-description">
            Private coordination messages in hand threads.
          </p>
          <ul className="mt-4 space-y-2">
            {stats.handMessages.map((message) => (
              <li key={message.id} className="card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link
                    href={`/posts/${message.postId}/hands`}
                    className="text-xs font-medium text-body hover:text-ink"
                  >
                    {message.postTitle}
                  </Link>
                  <time
                    dateTime={message.createdAt}
                    className="text-[10px] text-mute"
                  >
                    {timeAgo(message.createdAt)}
                  </time>
                </div>
                <p className="mt-1.5 text-sm text-body">{message.body}</p>
              </li>
            ))}
            {stats.handMessages.length === 0 && (
              <li className="card p-6 text-center text-sm text-mute">
                No hand messages yet.
              </li>
            )}
          </ul>
        </section>

        <section className="mt-10 flex flex-wrap gap-3">
          <Link href="/posts/new" className="btn-primary text-sm">
            New post
          </Link>
          <Link href="/posts" className="btn-secondary text-sm">
            Browse posts
          </Link>
        </section>
      </div>
    </div>
  );
}
