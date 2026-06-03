import { NextResponse } from "next/server";
import { requireCompleteProfile } from "@/lib/auth/api-auth";
import { isValidUuid, parseJsonBody } from "@/lib/api/request";
import { toPublicPost } from "@/lib/api/responses";
import { requireAuthenticatedUser } from "@/lib/api/session";
import {
  deletePostById,
  getPostById,
  updatePostById,
} from "@/lib/db/db";
import {
  hasPostErrors,
  validateCreatePostInput,
} from "@/lib/validation/posts";

export async function PATCH(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const profileBlock = requireCompleteProfile(auth.session);
  if (profileBlock) return profileBlock;

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id || !isValidUuid(id)) {
    return NextResponse.json({ error: "Valid post id required." }, { status: 400 });
  }

  const post = await getPostById(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (post.authorId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { input, errors } = validateCreatePostInput(body);
  if (!input || hasPostErrors(errors)) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const updated = await updatePostById(id, input);
  if (!updated) {
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }

  return NextResponse.json(toPublicPost(updated));
}

export async function DELETE(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id || !isValidUuid(id)) {
    return NextResponse.json({ error: "Valid post id required." }, { status: 400 });
  }

  const post = await getPostById(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (post.authorId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await deletePostById(id);
  return NextResponse.json({ ok: true });
}
