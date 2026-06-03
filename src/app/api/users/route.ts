import { NextResponse } from "next/server";
import {
  USERS_DIRECTORY_DEFAULT_LIMIT,
  USERS_DIRECTORY_MAX_LIMIT,
} from "@/lib/api/user-directory";
import { queryUsersDirectoryPage } from "@/lib/db/users-directory-query";
import { requireAuthenticatedUser } from "@/lib/api/session";

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const rawLimit = parseInt(
    url.searchParams.get("limit") ?? String(USERS_DIRECTORY_DEFAULT_LIMIT),
    10
  );
  const limit = Math.min(
    USERS_DIRECTORY_MAX_LIMIT,
    Math.max(1, rawLimit || USERS_DIRECTORY_DEFAULT_LIMIT)
  );
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 80);

  const result = await queryUsersDirectoryPage({ page, limit, q });
  return NextResponse.json(result);
}
