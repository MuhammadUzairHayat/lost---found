import { NextResponse } from "next/server";
import { getSessionFromCookies, type SessionUser } from "./auth";

export async function requireSession(): Promise<SessionUser | NextResponse> {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }
  return session;
}

export function isSessionUser(
  session: SessionUser | NextResponse
): session is SessionUser {
  return !(session instanceof NextResponse);
}

export function requireCompleteProfile(
  session: SessionUser
): NextResponse | null {
  if (session.isProfileComplete) return null;
  return NextResponse.json(
    { error: "Profile required.", code: "PROFILE_INCOMPLETE" },
    { status: 403 }
  );
}
