import { NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/api/request";
import {
  requireAuthenticatedUser,
  withRefreshedSessionCookie,
} from "@/lib/api/session";
import { updateUserProfileLegacy } from "@/lib/db/users";
import { toSessionUser } from "@/lib/auth/session-user";
import type { ContactInfo } from "@/lib/types";
import type { ContactMethodId } from "@/lib/constants/constants";

const CONTACT_METHODS = new Set<ContactMethodId>(["phone", "email", "whatsapp"]);

function parseLegacyContact(value: unknown): ContactInfo | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const method = raw.method;
  if (typeof method !== "string" || !CONTACT_METHODS.has(method as ContactMethodId)) {
    return null;
  }
  return {
    method: method as ContactMethodId,
    phone: typeof raw.phone === "string" ? raw.phone : "",
    email: typeof raw.email === "string" ? raw.email : "",
    whatsapp: typeof raw.whatsapp === "string" ? raw.whatsapp : "",
  };
}

export async function PATCH(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  if (!auth.user.isProfileComplete) {
    return NextResponse.json(
      { error: "Use profile setup to complete your profile first." },
      { status: 403 }
    );
  }

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const contact = parseLegacyContact(body.contact);

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!contact) {
    return NextResponse.json({ error: "Valid contact is required." }, { status: 400 });
  }

  try {
    const result = await updateUserProfileLegacy(auth.user.id, name, contact);
    if (result.errors) {
      return NextResponse.json({ errors: result.errors }, { status: 400 });
    }
    if (!result.user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const response = NextResponse.json({ user: toSessionUser(result.user) });
    return withRefreshedSessionCookie(result.user, response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
