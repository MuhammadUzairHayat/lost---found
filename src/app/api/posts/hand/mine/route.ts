import { NextResponse } from "next/server";
import { getPostIdsWithHandByUserId } from "@/lib/db/db";
import { requireAuthenticatedUser } from "@/lib/api/session";

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const postIds = await getPostIdsWithHandByUserId(auth.user.id);
  return NextResponse.json({ postIds });
}
