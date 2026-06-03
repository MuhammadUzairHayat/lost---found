import { NextResponse } from "next/server";
import { isSessionUser, requireSession } from "@/lib/auth/api-auth";
import { isValidUuid } from "@/lib/api/request";
import {
  applyPostVisibility,
  redactHandContact,
} from "@/lib/api/post-access";
import { getHandsByPostId, getHandByUserAndPost, getPostById } from "@/lib/db/db";
import type { Hand } from "@/lib/types";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "id required." }, { status: 400 });
  }
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const post = await getPostById(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const hands = await getHandsByPostId(id);

  const session = await requireSession();
  const viewerId = isSessionUser(session) ? session.id : null;
  const { post: visiblePost, hands: visibleHands, canViewContacts: showContacts } =
    applyPostVisibility(viewerId, post, hands);

  let viewerHand: Hand | null = null;
  if (viewerId) {
    viewerHand = await getHandByUserAndPost(id, viewerId);
  }

  return NextResponse.json({
    post: visiblePost,
    hands: visibleHands,
    handCount: hands.length,
    canViewContacts: showContacts,
    viewerHand: viewerHand
      ? showContacts
        ? viewerHand
        : redactHandContact(viewerHand)
      : null,
  });
}
