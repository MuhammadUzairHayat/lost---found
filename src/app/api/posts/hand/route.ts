import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  isSessionUser,
  requireCompleteProfile,
  requireSession,
} from "@/lib/auth/api-auth";
import { isValidUuid, parseJsonBody } from "@/lib/api/request";
import { applyPostVisibility } from "@/lib/api/post-access";
import { toPublicHand } from "@/lib/api/responses";
import { requireAuthenticatedUser } from "@/lib/api/session";
import {
  createHand,
  getHandByUserAndPost,
  getHandsByPostId,
  getPostById,
  removeHand,
  updateHandNote,
} from "@/lib/db/db";
import { contactFromStoredUser } from "@/lib/db/users";
import { notifyHandRaised } from "@/lib/notifications/notify";
import type { Hand } from "@/lib/types";
import { validateHandNote } from "@/lib/validation/posts";

export async function GET(request: Request) {
  const postId = new URL(request.url).searchParams.get("postId")?.trim();
  if (!postId) {
    return NextResponse.json({ error: "postId required." }, { status: 400 });
  }
  if (!isValidUuid(postId)) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const post = await getPostById(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const hands = await getHandsByPostId(postId);
  const session = await requireSession();
  const viewerId = isSessionUser(session) ? session.id : null;
  const { hands: visibleHands, canViewContacts: showContacts } =
    applyPostVisibility(viewerId, post, hands);
  const responseHands = showContacts ? visibleHands : visibleHands.map(toPublicHand);

  return NextResponse.json({
    hands: responseHands,
    count: hands.length,
    canViewContacts: showContacts,
  });
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const profileBlock = requireCompleteProfile(auth.session);
  if (profileBlock) return profileBlock;

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const postId = typeof body.postId === "string" ? body.postId.trim() : "";
  if (!postId) {
    return NextResponse.json({ error: "postId required." }, { status: 400 });
  }
  if (!isValidUuid(postId)) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const note =
    typeof body.note === "string" ? body.note.trim() : "";
  const noteError = validateHandNote(note);
  if (noteError) {
    return NextResponse.json({ error: noteError }, { status: 400 });
  }

  const post = await getPostById(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (post.status !== "open") {
    return NextResponse.json(
      { error: "This post is resolved — new hands are closed." },
      { status: 400 }
    );
  }

  const userId = auth.user.id;

  if (post.authorId === userId) {
    return NextResponse.json(
      { error: "You cannot raise hand on your own post." },
      { status: 400 }
    );
  }

  const existing = await getHandByUserAndPost(postId, userId);
  if (existing) {
    return NextResponse.json(
      { error: "You already raised your hand on this post." },
      { status: 409 }
    );
  }

  if (!auth.user.name.trim()) {
    return NextResponse.json(
      { error: "Profile name is required." },
      { status: 400 }
    );
  }

  try {
    const hand: Hand = {
      id: uuidv4(),
      postId,
      userId,
      userName: auth.user.name.trim(),
      note,
      contact: contactFromStoredUser(auth.user),
      createdAt: new Date().toISOString(),
    };

    const created = await createHand(hand);
    void notifyHandRaised({
      postId: post.id,
      postTitle: post.title,
      postAuthorId: post.authorId,
      handUserId: userId,
      handUserName: auth.user.name.trim(),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to raise hand.";
    const status = message.includes("Unique constraint") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const postId = typeof body.postId === "string" ? body.postId.trim() : "";
  if (!postId) {
    return NextResponse.json({ error: "postId required." }, { status: 400 });
  }
  if (!isValidUuid(postId)) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const note =
    typeof body.note === "string" ? body.note.trim() : "";
  const noteError = validateHandNote(note);
  if (noteError) {
    return NextResponse.json({ error: noteError }, { status: 400 });
  }

  const existing = await getHandByUserAndPost(postId, auth.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Hand not found." }, { status: 404 });
  }

  const updated = await updateHandNote(postId, auth.user.id, note);
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const postId = new URL(request.url).searchParams.get("postId")?.trim();

  if (!postId) {
    return NextResponse.json({ error: "postId required." }, { status: 400 });
  }
  if (!isValidUuid(postId)) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const existing = await getHandByUserAndPost(postId, auth.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Hand not found." }, { status: 404 });
  }

  await removeHand(postId, auth.user.id);
  return NextResponse.json({ ok: true });
}
