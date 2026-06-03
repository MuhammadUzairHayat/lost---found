import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireCompleteProfile } from "@/lib/auth/api-auth";
import { isValidUuid, parseJsonBody } from "@/lib/api/request";
import { buildHandMessageTree } from "@/lib/hand-messages/tree";
import {
  createHandMessage,
  deleteHandMessage,
  getHandById,
  getHandMessageById,
  getHandMessagesByHandId,
  getPostById,
  updateHandMessage,
} from "@/lib/db/db";
import { requireAuthenticatedUser } from "@/lib/api/session";
import { notifyHandMessage } from "@/lib/notifications/notify";
import type { HandMessage } from "@/lib/types";
import { validateCommentBody } from "@/lib/validation/posts";

export async function GET(request: Request) {
  const handId = new URL(request.url).searchParams.get("handId")?.trim();
  if (!handId) {
    return NextResponse.json({ error: "handId required." }, { status: 400 });
  }
  if (!isValidUuid(handId)) {
    return NextResponse.json({ error: "Invalid hand id." }, { status: 400 });
  }

  const hand = await getHandById(handId);
  if (!hand) {
    return NextResponse.json({ error: "Hand not found." }, { status: 404 });
  }

  const messages = await getHandMessagesByHandId(handId);
  const tree = buildHandMessageTree(messages);

  return NextResponse.json({
    messages: tree,
    total: messages.length,
  });
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const profileBlock = requireCompleteProfile(auth.session);
  if (profileBlock) return profileBlock;

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const handId = typeof body.handId === "string" ? body.handId.trim() : "";
  if (!handId || !isValidUuid(handId)) {
    return NextResponse.json({ error: "Valid handId required." }, { status: 400 });
  }

  const hand = await getHandById(handId);
  if (!hand) {
    return NextResponse.json({ error: "Hand not found." }, { status: 404 });
  }

  const post = await getPostById(hand.postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const userId = auth.user.id;
  if (userId !== hand.userId && userId !== post.authorId) {
    return NextResponse.json(
      { error: "Only the poster and this person can send messages here." },
      { status: 403 }
    );
  }

  const text = typeof body.body === "string" ? body.body : "";
  const bodyError = validateCommentBody(text);
  if (bodyError) {
    return NextResponse.json({ error: bodyError }, { status: 400 });
  }

  const parentId =
    typeof body.parentId === "string" && body.parentId.trim()
      ? body.parentId.trim()
      : null;

  if (parentId && !isValidUuid(parentId)) {
    return NextResponse.json(
      { error: "Invalid parent message." },
      { status: 400 }
    );
  }

  let parentUserId: string | null = null;

  if (parentId) {
    const parent = await getHandMessageById(parentId);
    if (!parent || parent.handId !== handId) {
      return NextResponse.json(
        { error: "Parent message not found." },
        { status: 404 }
      );
    }
    parentUserId = parent.userId;
  }

  if (!auth.user.name.trim()) {
    return NextResponse.json(
      { error: "Profile name is required." },
      { status: 400 }
    );
  }

  const message: HandMessage = {
    id: uuidv4(),
    handId,
    postId: hand.postId,
    userId,
    userName: auth.user.name.trim(),
    body: text.trim(),
    parentId,
    createdAt: new Date().toISOString(),
  };

  const created = await createHandMessage(message);
  void notifyHandMessage({
    postId: hand.postId,
    messageUserId: userId,
    messageUserName: auth.user.name.trim(),
    body: text.trim(),
    parentId,
    parentUserId,
    handUserId: hand.userId,
    postAuthorId: post.authorId,
  });
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const messageId =
    typeof body.messageId === "string" ? body.messageId.trim() : "";
  if (!messageId || !isValidUuid(messageId)) {
    return NextResponse.json({ error: "Valid messageId required." }, { status: 400 });
  }

  const text = typeof body.body === "string" ? body.body : "";
  const bodyError = validateCommentBody(text);
  if (bodyError) {
    return NextResponse.json({ error: bodyError }, { status: 400 });
  }

  const existing = await getHandMessageById(messageId);
  if (!existing) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  if (existing.userId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const updated = await updateHandMessage(messageId, text.trim());
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const messageId = new URL(request.url).searchParams.get("messageId")?.trim();
  if (!messageId || !isValidUuid(messageId)) {
    return NextResponse.json({ error: "Valid messageId required." }, { status: 400 });
  }

  const existing = await getHandMessageById(messageId);
  if (!existing) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  const hand = await getHandById(existing.handId);
  const post = hand ? await getPostById(hand.postId) : null;
  const isAuthor = existing.userId === auth.user.id;
  const isPostOwner = post?.authorId === auth.user.id;

  if (!isAuthor && !isPostOwner) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await deleteHandMessage(messageId);
  return NextResponse.json({ ok: true });
}
