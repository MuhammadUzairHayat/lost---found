import { prisma } from "@/lib/prisma";
import type { AppNotification, CreateNotificationInput } from "./types";

function toNotification(row: {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  postId: string | null;
  actorId: string | null;
  actorName: string | null;
  read: boolean;
  createdAt: Date;
}): AppNotification {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as AppNotification["type"],
    title: row.title,
    body: row.body,
    link: row.link,
    postId: row.postId,
    actorId: row.actorId,
    actorName: row.actorName,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function insertNotification(
  input: CreateNotificationInput & { id: string }
): Promise<AppNotification> {
  const row = await prisma.notification.create({
    data: {
      id: input.id,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
      postId: input.postId ?? null,
      actorId: input.actorId ?? null,
      actorName: input.actorName ?? null,
    },
  });
  return toNotification(row);
}

export async function queryNotificationsForUser(
  userId: string,
  options?: { limit?: number; unreadOnly?: boolean; since?: string }
): Promise<AppNotification[]> {
  const sinceDate =
    options?.since && !Number.isNaN(Date.parse(options.since))
      ? new Date(options.since)
      : undefined;

  const rows = await prisma.notification.findMany({
    where: {
      userId,
      ...(options?.unreadOnly ? { read: false } : {}),
      ...(sinceDate ? { createdAt: { gt: sinceDate } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
  });
  return rows.map(toNotification);
}

export async function queryUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<boolean> {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
  return result.count > 0;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return result.count;
}

export async function queryNotifyableUserIds(excludeUserId?: string): Promise<string[]> {
  const rows = await prisma.user.findMany({
    where: {
      isProfileComplete: true,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export async function upsertPushSubscription(
  userId: string,
  id: string,
  endpoint: string,
  p256dh: string,
  auth: string
): Promise<void> {
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { id, userId, endpoint, p256dh, auth },
    update: { userId, p256dh, auth },
  });
}

export async function deletePushSubscription(
  userId: string,
  endpoint: string
): Promise<void> {
  await prisma.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
}

export async function queryPushSubscriptionsForUser(userId: string) {
  return prisma.pushSubscription.findMany({
    where: { userId },
  });
}

export async function deletePushSubscriptionByEndpoint(endpoint: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({
    where: { endpoint },
  });
}
