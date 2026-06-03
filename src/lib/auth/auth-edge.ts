import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { ContactInfo } from "../types";

export const SESSION_COOKIE = "lost-found-session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  contact: ContactInfo;
  isProfileComplete: boolean;
}

interface SessionPayload {
  sub?: string;
  email: string;
  name: string;
  contact: ContactInfo;
  isProfileComplete?: boolean;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const p = payload as unknown as SessionPayload;
    if (!p.sub) return null;
    return {
      id: p.sub,
      email: p.email,
      name: p.name,
      contact: p.contact,
      isProfileComplete: p.isProfileComplete === true,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionUser | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
