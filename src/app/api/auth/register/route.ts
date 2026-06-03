import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth/auth";
import { parseJsonBody } from "@/lib/api/request";
import { createUser } from "@/lib/db/users";
import { toSessionUser } from "@/lib/auth/session-user";
import {
  hasRegisterErrors,
  normalizeRegisterEmail,
  validateRegisterInput,
} from "@/lib/validation/auth";

export async function POST(request: Request) {
  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  const errors = validateRegisterInput({ email, password });
  if (hasRegisterErrors(errors)) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    const normalizedEmail = normalizeRegisterEmail(email);
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser({
      email: normalizedEmail,
      passwordHash,
    });

    const sessionUser = toSessionUser(user);
    const token = await createSessionToken(sessionUser);
    const response = NextResponse.json({ user: sessionUser }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request.";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
