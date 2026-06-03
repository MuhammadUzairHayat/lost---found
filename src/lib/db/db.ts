import type { Prisma } from "@prisma/client";
import { prisma } from '../prisma';
import {
  deleteCommentById,
  insertComment,
  queryCommentById,
  queryCommentCountByPostId,
  queryCommentCountsByPostIds,
  queryCommentsByPostId,
  queryRecentCommentsByPostId,
  queryRecentCommentsByPostIds,
  updateCommentBody,
} from "./comments-query";
import type { CategoryId, PostTypeId } from "../constants/constants";
import type { PublicPost } from "../api/responses";
import {
  deleteHandMessageById,
  insertHandMessage,
  queryHandMessageById,
  queryHandMessagesByHandId,
  queryPostIdsWithHandByUserId,
  updateHandMessageBody,
} from "./hand-messages-query";
import type { ContactInfo, Hand, HandMessage, Post, Comment } from "../types";

function parseContact(value: unknown): ContactInfo {
  if (value && typeof value === "object" && "method" in value) {
    const c = value as ContactInfo;
    return {
      method: c.method ?? "phone",
      phone: c.phone ?? "",
      email: c.email ?? "",
      whatsapp: c.whatsapp ?? "",
    };
  }
  return { method: "phone", phone: "", email: "", whatsapp: "" };
}

function toPost(row: {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  location: string;
  images: string[];
  authorId: string;
  authorName: string;
  contact: unknown;
  status: string;
  important: boolean;
  createdAt: Date;
}): Post {
  return {
    id: row.id,
    type: row.type as PostTypeId,
    category: row.category as CategoryId,
    title: row.title,
    description: row.description,
    location: row.location,
    images: row.images,
    authorId: row.authorId,
    authorName: row.authorName,
    contact: parseContact(row.contact),
    status: row.status as Post["status"],
    important: row.important ?? false,
    createdAt: row.createdAt.toISOString(),
  };
}

type HandRow = {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  note: string;
  contact: unknown;
  createdAt: Date;
  user?: {
    avatar: string | null;
    studentId: string | null;
    department: string | null;
  } | null;
};

function toHand(row: HandRow): Hand {
  return {
    id: row.id,
    postId: row.postId,
    userId: row.userId,
    userName: row.userName,
    note: row.note,
    contact: parseContact(row.contact),
    createdAt: row.createdAt.toISOString(),
    userAvatar: row.user?.avatar ?? null,
    studentId: row.user?.studentId ?? null,
    department: row.user?.department ?? null,
  };
}

const handUserSelect = {
  user: {
    select: {
      avatar: true,
      studentId: true,
      department: true,
    },
  },
} as const;

export async function getAllPosts(): Promise<Post[]> {
  const rows = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toPost);
}

export async function getAllPostsWithHandCounts(): Promise<
  (PublicPost & { handCount: number })[]
> {
  const rows = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { hands: true } },
      author: { select: { avatar: true } },
    },
  });
  const sorted = [...rows].sort((a, b) => {
    if (a.important !== b.important) {
      return a.important ? -1 : 1;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  return sorted.map((row) => {
    const post = toPost(row);
    const { contact: _contact, ...publicPost } = post;
    return {
      ...publicPost,
      authorAvatar: row.author.avatar,
      handCount: row._count.hands,
    };
  });
}

export async function getPostById(id: string): Promise<Post | null> {
  const row = await prisma.post.findUnique({ where: { id } });
  return row ? toPost(row) : null;
}

export async function getPostByIdWithAuthorAvatar(
  id: string
): Promise<(Post & { authorAvatar: string | null }) | null> {
  const row = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { avatar: true } } },
  });
  if (!row) return null;
  return {
    ...toPost(row),
    authorAvatar: row.author.avatar,
  };
}

export async function createPost(post: Post): Promise<Post> {
  const row = await prisma.post.create({
    data: {
      id: post.id,
      type: post.type,
      category: post.category,
      title: post.title,
      description: post.description,
      location: post.location,
      images: post.images,
      authorId: post.authorId,
      authorName: post.authorName,
      contact: post.contact as unknown as Prisma.InputJsonValue,
      status: post.status,
      important: post.important,
      createdAt: new Date(post.createdAt),
    },
  });
  return toPost(row);
}

export async function countPostsByAuthorId(authorId: string): Promise<number> {
  return prisma.post.count({ where: { authorId } });
}

export async function getPostsByAuthorIdWithHandCounts(
  authorId: string
): Promise<(PublicPost & { handCount: number })[]> {
  const rows = await prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { hands: true } },
      author: { select: { avatar: true } },
    },
  });
  const sorted = [...rows].sort((a, b) => {
    if (a.important !== b.important) {
      return a.important ? -1 : 1;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  return sorted.map((row) => {
    const post = toPost(row);
    const { contact: _contact, ...publicPost } = post;
    return {
      ...publicPost,
      authorAvatar: row.author.avatar,
      handCount: row._count.hands,
    };
  });
}

export async function updatePostMeta(
  id: string,
  data: { status?: Post["status"]; important?: boolean }
): Promise<Post | null> {
  const row = await prisma.post.update({
    where: { id },
    data: {
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.important !== undefined ? { important: data.important } : {}),
    },
  });
  return toPost(row);
}

export async function getHandsByPostId(postId: string): Promise<Hand[]> {
  const rows = await prisma.hand.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    include: handUserSelect,
  });
  return rows.map(toHand);
}

export async function getHandByUserAndPost(
  postId: string,
  userId: string,
): Promise<Hand | null> {
  const row = await prisma.hand.findUnique({
    where: { postId_userId: { postId, userId } },
    include: handUserSelect,
  });
  return row ? toHand(row) : null;
}

export async function getHandById(id: string): Promise<Hand | null> {
  const row = await prisma.hand.findUnique({
    where: { id },
    include: handUserSelect,
  });
  return row ? toHand(row) : null;
}

export async function updateHandNote(
  postId: string,
  userId: string,
  note: string,
): Promise<Hand | null> {
  const existing = await getHandByUserAndPost(postId, userId);
  if (!existing) return null;
  const row = await prisma.hand.update({
    where: { postId_userId: { postId, userId } },
    data: { note },
    include: handUserSelect,
  });
  return toHand(row);
}

export async function createHand(hand: Hand): Promise<Hand> {
  const row = await prisma.hand.create({
    data: {
      id: hand.id,
      postId: hand.postId,
      userId: hand.userId,
      userName: hand.userName,
      note: hand.note,
      contact: hand.contact as unknown as Prisma.InputJsonValue,
      createdAt: new Date(hand.createdAt),
    },
  });
  return toHand(row);
}

export async function removeHand(
  postId: string,
  userId: string,
): Promise<void> {
  await prisma.hand.deleteMany({
    where: { postId, userId },
  });
}

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  return queryCommentsByPostId(postId);
}

export async function getCommentCountByPostId(postId: string): Promise<number> {
  return queryCommentCountByPostId(postId);
}

export async function getCommentCountsByPostIds(
  postIds: string[],
): Promise<Record<string, number>> {
  return queryCommentCountsByPostIds(postIds);
}

export async function getRecentCommentsByPostId(
  postId: string,
  limit = 5,
): Promise<Comment[]> {
  return queryRecentCommentsByPostId(postId, limit);
}

export async function getRecentCommentsByPostIds(
  postIds: string[],
  limitPerPost = 4,
): Promise<Record<string, Comment[]>> {
  return queryRecentCommentsByPostIds(postIds, limitPerPost);
}

export async function getCommentById(id: string): Promise<Comment | null> {
  return queryCommentById(id);
}

export async function createComment(comment: Comment): Promise<Comment> {
  return insertComment(comment);
}

export async function updateComment(
  id: string,
  body: string,
): Promise<Comment | null> {
  return updateCommentBody(id, body);
}

export async function deleteComment(id: string): Promise<boolean> {
  return deleteCommentById(id);
}

export async function updatePostById(
  id: string,
  data: {
    type: PostTypeId;
    category: CategoryId;
    title: string;
    description: string;
    location: string;
    images: string[];
  },
): Promise<Post | null> {
  const row = await prisma.post.update({
    where: { id },
    data: {
      type: data.type,
      category: data.category,
      title: data.title,
      description: data.description,
      location: data.location,
      images: data.images,
    },
  });
  return toPost(row);
}

export async function deletePostById(id: string): Promise<void> {
  await prisma.post.delete({ where: { id } });
}

export async function getHandMessagesByHandId(
  handId: string
): Promise<HandMessage[]> {
  return queryHandMessagesByHandId(handId);
}

export async function getHandMessageById(
  id: string
): Promise<HandMessage | null> {
  return queryHandMessageById(id);
}

export async function createHandMessage(
  message: HandMessage
): Promise<HandMessage> {
  return insertHandMessage(message);
}

export async function updateHandMessage(
  id: string,
  body: string
): Promise<HandMessage | null> {
  return updateHandMessageBody(id, body);
}

export async function deleteHandMessage(id: string): Promise<boolean> {
  return deleteHandMessageById(id);
}

export async function getPostIdsWithHandByUserId(
  userId: string
): Promise<string[]> {
  return queryPostIdsWithHandByUserId(userId);
}
