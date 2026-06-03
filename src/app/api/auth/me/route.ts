import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/auth";
import { toPublicUser } from "@/lib/api/responses";
import { getUserById } from "@/lib/db/users";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const stored = await getUserById(session.id);
  if (!stored) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: toPublicUser(stored) });
}
