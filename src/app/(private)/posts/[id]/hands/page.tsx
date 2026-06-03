export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { PageShapes } from "@/components/ui/PageShapes";
import { HandsPageClient } from "@/components/post/HandsPageClient";
import { applyPostVisibility } from "@/lib/api/post-access";
import { getSessionFromCookies } from "@/lib/auth/auth";
import { getHandsByPostId, getPostById } from "@/lib/db/db";

export default async function PostHandsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ panel?: string }>;
}) {
  const { id } = await params;
  const { panel } = await searchParams;

  if (panel === "hands" || panel === "people") {
    redirect(`/posts/${id}/hands`);
  }

  const post = await getPostById(id);
  if (!post) notFound();

  const hands = await getHandsByPostId(id);
  const session = await getSessionFromCookies();
  const viewerId = session?.id ?? null;
  const { post: visiblePost, hands: visibleHands } = applyPostVisibility(
    viewerId,
    post,
    hands
  );

  return (
    <div className="relative">
      <PageShapes variant="minimal" />
      <div className="relative mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href={`/posts/${id}`}
          className="text-xs text-mute hover:text-ink mb-6 inline-block"
        >
          ← Back to post
        </Link>
        <Suspense fallback={<p className="text-sm text-mute">Loading…</p>}>
          <HandsPageClient
            initialPost={visiblePost}
            initialHands={visibleHands}
          />
        </Suspense>
      </div>
    </div>
  );
}
