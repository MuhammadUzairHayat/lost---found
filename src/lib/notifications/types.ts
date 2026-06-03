export type NotificationType =
  | "NEW_POST"
  | "HAND_RAISED"
  | "COMMENT"
  | "COMMENT_REPLY"
  | "HAND_MESSAGE"
  | "HAND_MESSAGE_REPLY";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  postId: string | null;
  actorId: string | null;
  actorName: string | null;
  read: boolean;
  createdAt: string;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  postId?: string | null;
  actorId?: string | null;
  actorName?: string | null;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
