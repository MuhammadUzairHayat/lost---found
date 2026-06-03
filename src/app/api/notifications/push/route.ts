import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { parseJsonBody } from "@/lib/api/request";
import { requireAuthenticatedUser } from "@/lib/api/session";
import {
  deletePushSubscription,
  upsertPushSubscription,
} from "@/lib/notifications/queries";
import { getVapidPublicKey } from "@/lib/notifications/push";

export async function GET() {
  return NextResponse.json({ publicKey: getVapidPublicKey() });
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const subscription = body.subscription as
    | {
        endpoint?: string;
        keys?: { p256dh?: string; auth?: string };
      }
    | undefined;

  const endpoint =
    typeof subscription?.endpoint === "string" ? subscription.endpoint.trim() : "";
  const p256dh =
    typeof subscription?.keys?.p256dh === "string"
      ? subscription.keys.p256dh.trim()
      : "";
  const authKey =
    typeof subscription?.keys?.auth === "string"
      ? subscription.keys.auth.trim()
      : "";

  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
  }

  await upsertPushSubscription(
    auth.user.id,
    uuidv4(),
    endpoint,
    p256dh,
    authKey
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;

  const endpoint =
    typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint required." }, { status: 400 });
  }

  await deletePushSubscription(auth.user.id, endpoint);
  return NextResponse.json({ ok: true });
}
