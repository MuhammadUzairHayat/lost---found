export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageShapes } from "@/components/ui/PageShapes";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ContactActionBar } from "@/components/ui/ContactActionBar";
import { UserProfilePosts } from "@/components/users/UserProfilePosts";
import { getSessionFromCookies } from "@/lib/auth/auth";
import { contactFromStoredUser } from "@/lib/db/users";
import {
  getCommentCountsByPostIds,
  getPostsByAuthorIdWithHandCounts,
  getRecentCommentsByPostIds,
} from "@/lib/db/db";
import { getUserById } from "@/lib/db/users";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionFromCookies();
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/users/${id}`)}`);
  }

  const user = await getUserById(id);
  if (!user?.isProfileComplete) notFound();

  const isSelf = session.id === user.id;
  const rows = await getPostsByAuthorIdWithHandCounts(user.id);
  const postIds = rows.map((r) => r.id);
  const [commentCounts, recentByPost] = await Promise.all([
    getCommentCountsByPostIds(postIds),
    getRecentCommentsByPostIds(postIds, 4),
  ]);

  const postsWithMeta = rows.map(({ handCount, ...post }) => ({
    post,
    handCount,
    commentCount: commentCounts[post.id] ?? 0,
    recentComments: recentByPost[post.id] ?? [],
  }));

  const lostCount = rows.filter((p) => p.type === "lost").length;
  const foundCount = rows.filter((p) => p.type === "found").length;

  return (
    <div className="relative">
      <PageShapes variant="minimal" />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mute">
          <Link href="/users" className="hover:text-ink">
            ← All members
          </Link>
          <Link href="/posts" className="hover:text-ink">
            Browse posts
          </Link>
        </div>

        <p className="page-eyebrow">Member</p>
        <h1 className="mt-2 page-title">{user.name}</h1>

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
                    {user.studentId && (
                      <p className="text-sm font-mono text-mute">
                        ID {user.studentId}
                      </p>
                    )}
                    {user.department && (
                      <p className="mt-0.5 text-sm text-mute">
                        {user.department}
                      </p>
                    )}
                  </div>
                  {isSelf && (
                    <Link
                      href="/profile"
                      className="shrink-0 text-xs font-medium text-body underline underline-offset-2 hover:text-ink"
                    >
                      Edit profile
                    </Link>
                  )}
                </div>

                <dl className="mt-5 flex flex-wrap gap-3">
                  <div className="rounded-xl border border-line bg-surface/80 px-3.5 py-2">
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-mute">
                      Posts
                    </dt>
                    <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
                      {rows.length}
                    </dd>
                  </div>
                  {lostCount > 0 && (
                    <div className="rounded-xl border border-line bg-surface/80 px-3.5 py-2">
                      <dt className="text-[10px] font-medium uppercase tracking-wider text-mute">
                        Lost
                      </dt>
                      <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
                        {lostCount}
                      </dd>
                    </div>
                  )}
                  {foundCount > 0 && (
                    <div className="rounded-xl border border-line bg-surface/80 px-3.5 py-2">
                      <dt className="text-[10px] font-medium uppercase tracking-wider text-mute">
                        Found
                      </dt>
                      <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
                        {foundCount}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-6 space-y-6">
              <div>
                <ContactActionBar contact={contactFromStoredUser(user)} />
              </div>
              <div>
                {user.bio ? (
                  <p className="text-sm leading-relaxed text-body whitespace-pre-wrap">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-sm text-mute italic">No bio yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10" aria-labelledby="member-posts-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="member-posts-heading" className="section-title">
                {isSelf ? "Your posts" : "Posts"}
              </h2>
              <p className="mt-1 text-sm text-description">
                {isSelf
                  ? "Everything you've shared on the board."
                  : `Lost & found items posted by ${user.name}.`}
              </p>
            </div>
            {isSelf && rows.length > 0 && (
              <Link href="/posts/new" className="btn-secondary text-xs sm:text-sm">
                New post
              </Link>
            )}
          </div>
          <UserProfilePosts posts={postsWithMeta} isSelf={isSelf} />
        </section>
      </div>
    </div>
  );
}
