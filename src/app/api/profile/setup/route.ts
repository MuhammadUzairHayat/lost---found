import { NextResponse } from "next/server";
import { isContactMethod } from "@/lib/db/enums";
import { parseJsonBody } from "@/lib/api/request";
import { toPublicUser } from "@/lib/api/responses";
import {
  requireAuthenticatedUser,
  withRefreshedSessionCookie,
} from "@/lib/api/session";
import { completeUserProfile } from "@/lib/db/users";

function parseProfileBody(body: Record<string, unknown>) {
  const contactMethod = body.contactMethod;
  if (typeof contactMethod !== "string" || !isContactMethod(contactMethod)) {
    return null;
  }

  return {
    name: typeof body.name === "string" ? body.name : "",
    studentId: typeof body.studentId === "string" ? body.studentId : "",
    department: typeof body.department === "string" ? body.department : "",
    contactMethod,
    contactValue: typeof body.contactValue === "string" ? body.contactValue : "",
    bio: typeof body.bio === "string" ? body.bio : undefined,
    avatar:
      body.avatar === null || typeof body.avatar === "string"
        ? (body.avatar as string | null)
        : undefined,
  };
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  if (auth.user.isProfileComplete) {
    return NextResponse.json(
      { error: "Profile is already complete." },
      { status: 400 }
    );
  }

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const input = parseProfileBody(body);
  if (!input) {
    return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
  }

  try {
    const result = await completeUserProfile(auth.user.id, input);

    if (result.errors) {
      return NextResponse.json({ errors: result.errors }, { status: 400 });
    }
    if (!result.user) {
      return NextResponse.json(
        { error: "Failed to save profile." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      profile: toPublicUser(result.user),
    });
    return withRefreshedSessionCookie(result.user, response);
  } catch (err) {
    console.error("[profile/setup]", err);
    const message =
      err instanceof Error ? err.message : "Failed to save profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
