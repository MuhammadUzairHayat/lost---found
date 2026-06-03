import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireCompleteProfile } from "@/lib/auth/api-auth";
import { parseJsonBody } from "@/lib/api/request";
import { toPublicPost } from "@/lib/api/responses";
import { requireAuthenticatedUser, withRefreshedSessionCookie } from "@/lib/api/session";
import {
  createPost,
  getAllPostsWithHandCounts,
} from "@/lib/db/db";
import { contactFromStoredUser } from "@/lib/db/users";
import { notifyNewPost } from "@/lib/notifications/notify";
import type { Post } from "@/lib/types";
import {
  hasPostErrors,
  validateCreatePostInput,
} from "@/lib/validation/posts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const q = searchParams.get("q")?.toLowerCase().trim();

  let posts = await getAllPostsWithHandCounts();

  if (category) posts = posts.filter((p) => p.category === category);
  if (type) posts = posts.filter((p) => p.type === type);
  if (q) {
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const profileBlock = requireCompleteProfile(auth.session);
  if (profileBlock) return profileBlock;

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const { input, errors } = validateCreatePostInput(body);
  if (!input || hasPostErrors(errors)) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  if (!auth.user.isProfileComplete) {
    return NextResponse.json(
      { error: "Complete profile setup before posting." },
      { status: 403 }
    );
  }

  try {
    const post: Post = {
      id: uuidv4(),
      type: input.type,
      category: input.category,
      title: input.title,
      description: input.description,
      location: input.location,
      images: input.images,
      authorId: auth.user.id,
      authorName: auth.user.name.trim(),
      contact: contactFromStoredUser(auth.user),
      status: "open",
      important: body.important === true,
      createdAt: new Date().toISOString(),
    };

    const created = await createPost(post);
    void notifyNewPost({
      postId: created.id,
      postTitle: created.title,
      authorId: created.authorId,
      authorName: created.authorName,
      postType: created.type,
    });
    const response = NextResponse.json(toPublicPost(created), { status: 201 });
    return withRefreshedSessionCookie(auth.user, response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
