import type { CategoryId, ContactMethodId, PostTypeId } from "./constants/constants";

export interface ContactInfo {
  method: ContactMethodId;
  phone: string;
  email: string;
  whatsapp: string;
}

export interface Post {
  id: string;
  type: PostTypeId;
  category: CategoryId;
  title: string;
  description: string;
  location: string;
  images: string[];
  authorId: string;
  authorName: string;
  contact: ContactInfo;
  status: "open" | "resolved" | "matched" | "closed";
  important: boolean;
  createdAt: string;
}

export interface Hand {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  note: string;
  contact: ContactInfo;
  createdAt: string;
  userAvatar?: string | null;
  studentId?: string | null;
  department?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  contact: ContactInfo;
  avatar?: string | null;
}

export type ParticipantRole = "owner" | "raised";

export interface Participant {
  id: string;
  userId: string;
  name: string;
  role: ParticipantRole;
  note?: string;
  contact: ContactInfo;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  body: string;
  parentId: string | null;
  createdAt: string;
}

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

export interface HandMessage {
  id: string;
  handId: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  body: string;
  parentId: string | null;
  createdAt: string;
}

export interface HandMessageWithReplies extends HandMessage {
  replies: HandMessageWithReplies[];
}
