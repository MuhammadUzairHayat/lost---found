import { NextResponse } from "next/server";
import { toPublicProfile } from "@/lib/api/public-profile";
import { isValidUuid } from "@/lib/api/request";
import { countPostsByAuthorId } from "@/lib/db/db";
import { getUserById } from "@/lib/db/users";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  const user = await getUserById(id);
  if (!user || !user.isProfileComplete) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const postCount = await countPostsByAuthorId(user.id);
  return NextResponse.json(toPublicProfile(user, postCount));
}
