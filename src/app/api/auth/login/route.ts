import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth/auth";
import { parseJsonBody } from "@/lib/api/request";
import { getUserByEmail } from "@/lib/db/users";
import { toSessionUser } from "@/lib/auth/session-user";
import {
  normalizeRegisterEmail,
  validateRegisterEmail,
} from "@/lib/validation/auth";

export async function POST(request: Request) {
  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  const emailError = validateRegisterEmail(email);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  try {
    const normalizedEmail = normalizeRegisterEmail(email);
    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const sessionUser = toSessionUser(user);
    const token = await createSessionToken(sessionUser);
    const response = NextResponse.json({ user: sessionUser });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
