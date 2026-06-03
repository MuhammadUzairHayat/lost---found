import webpush from "web-push";
import {
  deletePushSubscriptionByEndpoint,
  queryPushSubscriptionsForUser,
} from "./queries";

let vapidConfigured = false;

function configureVapid(): boolean {
  if (vapidConfigured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:notifications@lostfound.local";

  if (!publicKey || !privateKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[push] VAPID keys missing — browser push disabled.");
    }
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY?.trim() || null;
}

export async function sendPushToUser(
  userId: string,
  payload: {
    title: string;
    body: string;
    url?: string | null;
    tag?: string;
  }
): Promise<void> {
  if (!configureVapid()) return;

  const subscriptions = await queryPushSubscriptionsForUser(userId);
  if (subscriptions.length === 0) return;

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/posts",
    tag: payload.tag ?? `lost-found-${Date.now()}`,
  });

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          message,
          { TTL: 60 * 60 * 24 }
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (process.env.NODE_ENV !== "production") {
          console.error("[push] delivery failed", { status, endpoint: sub.endpoint.slice(0, 60) });
        }
        // Remove stale or mismatched subscriptions so the client re-registers.
        if (status === 404 || status === 410 || status === 403) {
          await deletePushSubscriptionByEndpoint(sub.endpoint);
        }
      }
    })
  );
}
