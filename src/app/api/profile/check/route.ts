import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/auth";
import { getUserById } from "@/lib/db/users";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ isComplete: false, authenticated: false });
  }

  const user = await getUserById(session.id);
  if (!user) {
    return NextResponse.json({ isComplete: false, authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    isComplete: user.isProfileComplete,
  });
}
