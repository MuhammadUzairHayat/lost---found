import { NextResponse } from "next/server";
import type { ContactMethod } from "@prisma/client";
import { parseJsonBody } from "@/lib/api/request";
import { toPublicUser } from "@/lib/api/responses";
import {
  requireAuthenticatedUser,
  withRefreshedSessionCookie,
} from "@/lib/api/session";
import { updateUserProfile } from "@/lib/db/users";

const CONTACT_METHODS = new Set<ContactMethod>(["EMAIL", "PHONE", "WHATSAPP"]);

function parseProfileBody(body: Record<string, unknown>) {
  const contactMethod = body.contactMethod;
  if (
    typeof contactMethod !== "string" ||
    !CONTACT_METHODS.has(contactMethod as ContactMethod)
  ) {
    return null;
  }

  return {
    name: typeof body.name === "string" ? body.name : "",
    studentId: typeof body.studentId === "string" ? body.studentId : "",
    department: typeof body.department === "string" ? body.department : "",
    contactMethod: contactMethod as ContactMethod,
    contactValue: typeof body.contactValue === "string" ? body.contactValue : "",
    bio: typeof body.bio === "string" ? body.bio : undefined,
    avatar:
      body.avatar === null || typeof body.avatar === "string"
        ? (body.avatar as string | null)
        : undefined,
  };
}

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json({ profile: toPublicUser(auth.user) });
}

export async function PUT(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  if (!auth.user.isProfileComplete) {
    return NextResponse.json(
      { error: "Complete profile setup first." },
      { status: 403 }
    );
  }

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const input = parseProfileBody(body);
  if (!input) {
    return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
  }

  try {
    const result = await updateUserProfile(auth.user.id, input);

    if (result.errors) {
      return NextResponse.json({ errors: result.errors }, { status: 400 });
    }
    if (!result.user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const response = NextResponse.json({ profile: toPublicUser(result.user) });
    return withRefreshedSessionCookie(result.user, response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
