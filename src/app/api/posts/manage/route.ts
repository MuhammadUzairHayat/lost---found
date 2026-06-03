import { NextResponse } from "next/server";
import { requireCompleteProfile } from "@/lib/auth/api-auth";
import { isValidUuid, parseJsonBody } from "@/lib/api/request";
import { toPublicPost } from "@/lib/api/responses";
import { requireAuthenticatedUser } from "@/lib/api/session";
import { getPostById, updatePostMeta } from "@/lib/db/db";
import type { Post } from "@/lib/types";

const ALLOWED_STATUS: Post["status"][] = [
  "open",
  "resolved",
  "matched",
  "closed",
];

export async function PATCH(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const profileBlock = requireCompleteProfile(auth.session);
  if (profileBlock) return profileBlock;

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const postId = typeof body.postId === "string" ? body.postId.trim() : "";
  if (!postId || !isValidUuid(postId)) {
    return NextResponse.json({ error: "Valid postId required." }, { status: 400 });
  }

  const post = await getPostById(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (post.authorId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const updates: { status?: Post["status"]; important?: boolean } = {};

  if (typeof body.status === "string") {
    const status = body.status.trim() as Post["status"];
    if (!ALLOWED_STATUS.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    updates.status = status;
  }

  if (typeof body.important === "boolean") {
    updates.important = body.important;
  }

  if (updates.status === undefined && updates.important === undefined) {
    return NextResponse.json(
      { error: "Provide status and/or important." },
      { status: 400 }
    );
  }

  const updated = await updatePostMeta(postId, updates);
  if (!updated) {
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }

  return NextResponse.json(toPublicPost(updated));
}
