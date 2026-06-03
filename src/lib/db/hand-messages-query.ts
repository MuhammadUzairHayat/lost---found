import { getPrisma } from "../prisma";
import type { HandMessage } from "../types";

const userSelect = { user: { select: { avatar: true } } } as const;

function mapMessage(row: {
  id: string;
  handId: string;
  postId: string;
  userId: string;
  userName: string;
  body: string;
  parentId: string | null;
  createdAt: Date;
  user?: { avatar: string | null } | null;
}): HandMessage {
  return {
    id: row.id,
    handId: row.handId,
    postId: row.postId,
    userId: row.userId,
    userName: row.userName,
    userAvatar: row.user?.avatar ?? null,
    body: row.body,
    parentId: row.parentId,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function queryHandMessagesByHandId(
  handId: string
): Promise<HandMessage[]> {
  const rows = await getPrisma().handMessage.findMany({
    where: { handId },
    orderBy: { createdAt: "asc" },
    include: userSelect,
  });
  return rows.map(mapMessage);
}

export async function queryHandMessageById(
  id: string
): Promise<HandMessage | null> {
  const row = await getPrisma().handMessage.findUnique({
    where: { id },
    include: userSelect,
  });
  return row ? mapMessage(row) : null;
}

export async function insertHandMessage(
  message: HandMessage
): Promise<HandMessage> {
  const row = await getPrisma().handMessage.create({
    data: {
      id: message.id,
      handId: message.handId,
      postId: message.postId,
      userId: message.userId,
      userName: message.userName,
      body: message.body,
      parentId: message.parentId,
      createdAt: new Date(message.createdAt),
    },
    include: userSelect,
  });
  return mapMessage(row);
}

export async function updateHandMessageBody(
  id: string,
  body: string
): Promise<HandMessage | null> {
  try {
    const row = await getPrisma().handMessage.update({
      where: { id },
      data: { body },
      include: userSelect,
    });
    return mapMessage(row);
  } catch {
    return null;
  }
}

export async function deleteHandMessageById(id: string): Promise<boolean> {
  try {
    await getPrisma().handMessage.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function queryPostIdsWithHandByUserId(
  userId: string
): Promise<string[]> {
  const rows = await getPrisma().hand.findMany({
    where: { userId },
    select: { postId: true },
  });
  return rows.map((r) => r.postId);
}
