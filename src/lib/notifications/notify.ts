import { v4 as uuidv4 } from "uuid";
import {
  insertNotification,
  queryNotifyableUserIds,
} from "./queries";
import { sendPushToUser } from "./push";
import type { CreateNotificationInput } from "./types";

async function deliverNotification(input: CreateNotificationInput): Promise<void> {
  const notification = await insertNotification({ ...input, id: uuidv4() });

  await sendPushToUser(input.userId, {
    title: input.title,
    body: input.body,
    url: input.link,
    tag: notification.id,
  });
}

export async function notifyUser(input: CreateNotificationInput): Promise<void> {
  if (input.actorId && input.userId === input.actorId) return;
  await deliverNotification(input);
}

export async function notifyUsers(
  userIds: string[],
  input: Omit<CreateNotificationInput, "userId">
): Promise<void> {
  const unique = [...new Set(userIds)].filter(
    (id) => !input.actorId || id !== input.actorId
  );
  await Promise.allSettled(
    unique.map((userId) => deliverNotification({ ...input, userId }))
  );
}

export async function notifyNewPost(params: {
  postId: string;
  postTitle: string;
  authorId: string;
  authorName: string;
  postType: string;
}): Promise<void> {
  const userIds = await queryNotifyableUserIds(params.authorId);
  const typeLabel = params.postType === "found" ? "Found" : "Lost";

  await notifyUsers(userIds, {
    type: "NEW_POST",
    title: `New ${typeLabel.toLowerCase()} post`,
    body: `${params.authorName} posted "${params.postTitle}"`,
    link: `/posts/${params.postId}`,
    postId: params.postId,
    actorId: params.authorId,
    actorName: params.authorName,
  });
}

export async function notifyHandRaised(params: {
  postId: string;
  postTitle: string;
  postAuthorId: string;
  handUserId: string;
  handUserName: string;
}): Promise<void> {
  await notifyUser({
    userId: params.postAuthorId,
    type: "HAND_RAISED",
    title: "Hand raised on your post",
    body: `${params.handUserName} raised a hand on "${params.postTitle}"`,
    link: `/posts/${params.postId}/hands`,
    postId: params.postId,
    actorId: params.handUserId,
    actorName: params.handUserName,
  });
}

export async function notifyComment(params: {
  postId: string;
  postTitle: string;
  postAuthorId: string;
  commentUserId: string;
  commentUserName: string;
  body: string;
  parentId: string | null;
  parentUserId: string | null;
}): Promise<void> {
  const snippet =
    params.body.length > 80 ? `${params.body.slice(0, 77)}…` : params.body;
  const link = `/posts/${params.postId}#comments`;
  const notified = new Set<string>();

  if (params.parentId && params.parentUserId) {
    await notifyUser({
      userId: params.parentUserId,
      type: "COMMENT_REPLY",
      title: "Reply to your comment",
      body: `${params.commentUserName}: ${snippet}`,
      link,
      postId: params.postId,
      actorId: params.commentUserId,
      actorName: params.commentUserName,
    });
    notified.add(params.parentUserId);
  }

  if (
    !notified.has(params.postAuthorId) &&
    params.postAuthorId !== params.commentUserId
  ) {
    await notifyUser({
      userId: params.postAuthorId,
      type: params.parentId ? "COMMENT_REPLY" : "COMMENT",
      title: params.parentId ? "New reply on your post" : "New comment on your post",
      body: `${params.commentUserName} on "${params.postTitle}": ${snippet}`,
      link,
      postId: params.postId,
      actorId: params.commentUserId,
      actorName: params.commentUserName,
    });
  }
}

export async function notifyHandMessage(params: {
  postId: string;
  messageUserId: string;
  messageUserName: string;
  body: string;
  parentId: string | null;
  parentUserId: string | null;
  handUserId: string;
  postAuthorId: string;
}): Promise<void> {
  const snippet =
    params.body.length > 80 ? `${params.body.slice(0, 77)}…` : params.body;
  const link = `/posts/${params.postId}/hands`;
  const notified = new Set<string>();

  const primaryRecipient =
    params.messageUserId === params.postAuthorId
      ? params.handUserId
      : params.postAuthorId;

  await notifyUser({
    userId: primaryRecipient,
    type: params.parentId ? "HAND_MESSAGE_REPLY" : "HAND_MESSAGE",
    title: params.parentId ? "New reply in hand thread" : "New hand message",
    body: `${params.messageUserName}: ${snippet}`,
    link,
    postId: params.postId,
    actorId: params.messageUserId,
    actorName: params.messageUserName,
  });
  notified.add(primaryRecipient);

  if (
    params.parentId &&
    params.parentUserId &&
    !notified.has(params.parentUserId)
  ) {
    await notifyUser({
      userId: params.parentUserId,
      type: "HAND_MESSAGE_REPLY",
      title: "Reply to your message",
      body: `${params.messageUserName}: ${snippet}`,
      link,
      postId: params.postId,
      actorId: params.messageUserId,
      actorName: params.messageUserName,
    });
  }
}
