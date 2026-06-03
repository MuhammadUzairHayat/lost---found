import { NextResponse } from "next/server";

const DEFAULT_MAX_BYTES = 32_768;

export async function parseJsonBody(
  request: Request,
  maxBytes = DEFAULT_MAX_BYTES
): Promise<Record<string, unknown> | NextResponse> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    return NextResponse.json({ error: "Request body too large." }, { status: 413 });
  }

  try {
    const raw = await request.text();
    if (raw.length > maxBytes) {
      return NextResponse.json({ error: "Request body too large." }, { status: 413 });
    }
    if (!raw.trim()) {
      return NextResponse.json({ error: "Request body is required." }, { status: 400 });
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ error: "JSON body must be an object." }, { status: 400 });
    }
    return parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}
