import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireCompleteProfile } from "@/lib/auth/api-auth";
import { isValidUuid, parseJsonBody } from "@/lib/api/request";
import { buildCommentTree } from "@/lib/comments/tree";
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentCountByPostId,
  getCommentsByPostId,
  getPostById,
  getRecentCommentsByPostId,
  updateComment,
} from "@/lib/db/db";
import { requireAuthenticatedUser } from "@/lib/api/session";
import { notifyComment } from "@/lib/notifications/notify";
import type { Comment } from "@/lib/types";
import { validateCommentBody } from "@/lib/validation/posts";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const postId = url.searchParams.get("postId")?.trim();
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

  const preview = url.searchParams.get("preview");
  if (preview) {
    const limit = Math.min(Math.max(parseInt(preview, 10) || 5, 1), 10);
    const [recent, total] = await Promise.all([
      getRecentCommentsByPostId(postId, limit),
      getCommentCountByPostId(postId),
    ]);
    return NextResponse.json({
      comments: recent,
      total,
    });
  }

  const comments = await getCommentsByPostId(postId);
  const tree = buildCommentTree(comments);

  return NextResponse.json({
    comments: tree,
    total: comments.length,
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
      { error: "Invalid parent comment." },
      { status: 400 }
    );
  }

  const post = await getPostById(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (post.status !== "open") {
    return NextResponse.json(
      { error: "This post is no longer accepting comments." },
      { status: 400 }
    );
  }

  let parentUserId: string | null = null;

  if (parentId) {
    const parent = await getCommentById(parentId);
    if (!parent || parent.postId !== postId) {
      return NextResponse.json(
        { error: "Parent comment not found." },
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

  const comment: Comment = {
    id: uuidv4(),
    postId,
    userId: auth.user.id,
    userName: auth.user.name.trim(),
    body: text.trim(),
    parentId,
    createdAt: new Date().toISOString(),
  };

  const created = await createComment(comment);
  void notifyComment({
    postId,
    postTitle: post.title,
    postAuthorId: post.authorId,
    commentUserId: auth.user.id,
    commentUserName: auth.user.name.trim(),
    body: text.trim(),
    parentId,
    parentUserId,
  });
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const commentId =
    typeof body.commentId === "string" ? body.commentId.trim() : "";
  if (!commentId || !isValidUuid(commentId)) {
    return NextResponse.json({ error: "Valid commentId required." }, { status: 400 });
  }

  const text = typeof body.body === "string" ? body.body : "";
  const bodyError = validateCommentBody(text);
  if (bodyError) {
    return NextResponse.json({ error: bodyError }, { status: 400 });
  }

  const comment = await getCommentById(commentId);
  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  if (comment.userId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const updated = await updateComment(commentId, text.trim());
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const commentId = new URL(request.url).searchParams.get("commentId")?.trim();
  if (!commentId || !isValidUuid(commentId)) {
    return NextResponse.json({ error: "Valid commentId required." }, { status: 400 });
  }

  const comment = await getCommentById(commentId);
  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  const post = await getPostById(comment.postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const isAuthor = comment.userId === auth.user.id;
  const isPostOwner = post.authorId === auth.user.id;
  if (!isAuthor && !isPostOwner) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await deleteComment(commentId);
  return NextResponse.json({ ok: true });
}
