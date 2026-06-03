import { NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
  type SessionUser,
} from "@/lib/auth/auth";
import { isSessionUser, requireSession } from "@/lib/auth/api-auth";
import { getUserById, type StoredUser } from "@/lib/db/users";
import { toSessionUser } from "@/lib/auth/session-user";

export type AuthenticatedContext = {
  session: SessionUser;
  user: StoredUser;
};

export async function requireAuthenticatedUser(): Promise<
  AuthenticatedContext | NextResponse
> {
  const session = await requireSession();
  if (!isSessionUser(session)) return session;

  const user = await getUserById(session.id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  return { session, user };
}

export async function withRefreshedSessionCookie(
  user: StoredUser,
  response: NextResponse
): Promise<NextResponse> {
  const token = await createSessionToken(toSessionUser(user));
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
