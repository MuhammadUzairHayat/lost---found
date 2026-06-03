import { getSessionFromCookies } from "@/lib/auth/auth";
import {
  queryNotificationsForUser,
  queryUnreadCount,
} from "@/lib/notifications/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  let since = url.searchParams.get("since") ?? undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const ping = () => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      };

      send("connected", { ok: true });

      let lastCheck = since ? new Date(since) : new Date();
      let closed = false;

      request.signal.addEventListener("abort", () => {
        closed = true;
      });

      while (!closed) {
        try {
          const notifications = await queryNotificationsForUser(session.id, {
            since: lastCheck.toISOString(),
            limit: 20,
          });

          if (notifications.length > 0) {
            const unread = await queryUnreadCount(session.id);
            send("notifications", { notifications, unread });
            // Advance cursor to now so same-ms notifications are not skipped.
            lastCheck = new Date();
          } else {
            ping();
          }
        } catch {
          send("error", { message: "Stream error" });
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
