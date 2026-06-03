import { PostCard } from "@/components/post/PostCard";
import { AnimatedLostFound } from "@/components/ui/AnimatedLostFound";
import { HandIcon } from "@/components/ui/HandIcon";
import { HeroScene } from "@/components/ui/HeroScene";
import { getSessionFromCookies } from "@/lib/auth/auth";
import {
  getAllPostsWithHandCounts,
  getCommentCountsByPostIds,
  getPostIdsWithHandByUserId,
  getRecentCommentsByPostIds,
} from "@/lib/db/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const all = await getAllPostsWithHandCounts();
  const recent = all.slice(0, 6);
  const recentIds = recent.map((p) => p.id);
  const session = await getSessionFromCookies();
  const myHandPostIds = session
    ? new Set(await getPostIdsWithHandByUserId(session.id))
    : new Set<string>();

  const [commentCounts, recentCommentsByPost] = await Promise.all([
    getCommentCountsByPostIds(recentIds),
    getRecentCommentsByPostIds(recentIds, 4),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-card">
        <div className="page-container relative py-14 sm:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="min-w-0">
              <p className="page-eyebrow animate-fade-up opacity-0 [animation-fill-mode:forwards]">
                Community lost & found
              </p>
              <h1 className="mt-4 max-w-xl page-title animate-fade-up opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards]">
                Something <AnimatedLostFound />?{" "}
                <span className="text-mute font-normal">Raise one hand.</span>
              </h1>
              <p className="mt-5 max-w-lg text-description animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
                Post any category — vehicles, electronics, pets, and more. When
                someone spots your item, they raise a hand. Tap the hand to see
                everyone involved and contact them instantly.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 animate-fade-up opacity-0 [animation-delay:300ms] [animation-fill-mode:forwards]">
                <Link
                  href="/login?callbackUrl=%2Fposts%2Fnew"
                  className="btn-primary"
                >
                  Create a post
                </Link>
                <Link
                  href="/login?callbackUrl=%2Fposts"
                  className="btn-secondary"
                >
                  View all posts
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-mute animate-fade-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full border border-ink/40" />
                  Lost
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-ink/50" />
                  Found
                </span>
                <span className="flex items-center gap-1.5">
                  <HandIcon className="h-3.5 w-3.5" />
                  One hand per person
                </span>
              </div>
            </div>

            <HeroScene />
          </div>
        </div>
      </section>

      <section className="page-container py-14 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="page-eyebrow mb-1">Latest</p>
            <h2 className="section-title">Recent posts</h2>
          </div>
          <Link
            href="/login?callbackUrl=%2Fposts"
            className="text-xs font-medium text-mute transition-colors hover:text-ink"
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="card px-6 py-12 text-center">
            <p className="text-sm text-mute">No posts yet. Be the first to post.</p>
            <Link href="/login?callbackUrl=%2Fposts%2Fnew" className="btn-primary mt-4">
              Create a post
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                handCount={post.handCount}
                commentCount={commentCounts[post.id] ?? 0}
                recentComments={recentCommentsByPost[post.id] ?? []}
                requireAuth
                viewerHasHand={myHandPostIds.has(post.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-line bg-ink text-paper">
        <div className="page-container py-14 sm:py-16">
          <p className="page-eyebrow text-paper/50 mb-2">How it works</p>
          <h2 className="text-lg font-semibold tracking-tight mb-10">
            Three steps to reconnect
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Post with category",
                body: "Lost or found — add details, location, and how to reach you.",
              },
              {
                step: "02",
                title: "Raise your hand",
                body: "One hand per post. Signal you may have found or seen the item.",
              },
              {
                step: "03",
                title: "See everyone",
                body: "Open the hand count to view posters and helpers — contact shown immediately.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-paper/10 bg-paper/[0.03] p-5"
              >
                <p className="font-mono text-xs text-paper/40">{item.step}</p>
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-xs text-paper/65 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
