import { NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/api/request";
import { requireAuthenticatedUser } from "@/lib/api/session";
import {
  markAllNotificationsRead,
  markNotificationRead,
  queryNotificationsForUser,
  queryUnreadCount,
} from "@/lib/notifications/queries";

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const unreadOnly = url.searchParams.get("unread") === "1";
  const since = url.searchParams.get("since") ?? undefined;
  const countOnly = url.searchParams.get("count") === "1";

  if (countOnly) {
    const unread = await queryUnreadCount(auth.user.id);
    return NextResponse.json({ unread });
  }

  const notifications = await queryNotificationsForUser(auth.user.id, {
    unreadOnly,
    since,
    limit: 50,
  });
  const unread = await queryUnreadCount(auth.user.id);

  return NextResponse.json({ notifications, unread });
}

export async function PATCH(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  if (body.all === true) {
    const marked = await markAllNotificationsRead(auth.user.id);
    return NextResponse.json({ ok: true, marked });
  }

  const notificationId =
    typeof body.notificationId === "string" ? body.notificationId.trim() : "";
  if (!notificationId) {
    return NextResponse.json({ error: "notificationId required." }, { status: 400 });
  }

  const ok = await markNotificationRead(auth.user.id, notificationId);
  if (!ok) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }

  const unread = await queryUnreadCount(auth.user.id);
  return NextResponse.json({ ok: true, unread });
}
