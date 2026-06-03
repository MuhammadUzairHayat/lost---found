import { prisma } from "../prisma";
import { CATEGORIES, POST_TYPES } from "../constants/constants";
import type { Post } from "../types";
import { getUserById } from "./users";
import type { StoredUser } from "./users";

export type UserDashboardTotals = {
  posts: number;
  lostPosts: number;
  foundPosts: number;
  openPosts: number;
  importantPosts: number;
  handsRaised: number;
  comments: number;
  handMessages: number;
};

export type UserDashboardPost = {
  id: string;
  title: string;
  type: string;
  category: string;
  status: Post["status"];
  important: boolean;
  location: string;
  createdAt: string;
  handCount: number;
  commentCount: number;
};

export type UserDashboardHand = {
  id: string;
  postId: string;
  postTitle: string;
  postType: string;
  note: string;
  createdAt: string;
};

export type UserDashboardHandMessage = {
  id: string;
  postId: string;
  postTitle: string;
  body: string;
  createdAt: string;
};

export type UserDashboardStats = {
  user: StoredUser;
  totals: UserDashboardTotals;
  postsByStatus: Record<string, number>;
  postsByType: Record<string, number>;
  postsByCategory: Record<string, number>;
  posts: UserDashboardPost[];
  handsRaised: UserDashboardHand[];
  handMessages: UserDashboardHandMessage[];
};

function countMap(
  rows: { key: string; count: number }[],
  keys: readonly string[]
): Record<string, number> {
  const map = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const row of rows) {
    map[row.key] = row.count;
  }
  return map;
}

export async function getUserDashboardStats(
  userId: string
): Promise<UserDashboardStats | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const statusKeys = ["open", "resolved", "matched", "closed"] as const;
  const typeKeys = POST_TYPES.map((t) => t.id);
  const categoryKeys = CATEGORIES.map((c) => c.id);
  const authorFilter = { authorId: userId };

  const [
    totalPosts,
    lostPosts,
    foundPosts,
    openPosts,
    importantPosts,
    handsRaised,
    comments,
    handMessages,
    statusGroups,
    typeGroups,
    categoryGroups,
    postRows,
    handRows,
    handMessageRows,
  ] = await Promise.all([
    prisma.post.count({ where: authorFilter }),
    prisma.post.count({ where: { ...authorFilter, type: "lost" } }),
    prisma.post.count({ where: { ...authorFilter, type: "found" } }),
    prisma.post.count({ where: { ...authorFilter, status: "open" } }),
    prisma.post.count({ where: { ...authorFilter, important: true } }),
    prisma.hand.count({ where: { userId } }),
    prisma.comment.count({ where: { userId } }),
    prisma.handMessage.count({ where: { userId } }),
    prisma.post.groupBy({
      by: ["status"],
      where: authorFilter,
      _count: { _all: true },
    }),
    prisma.post.groupBy({
      by: ["type"],
      where: authorFilter,
      _count: { _all: true },
    }),
    prisma.post.groupBy({
      by: ["category"],
      where: authorFilter,
      _count: { _all: true },
    }),
    prisma.post.findMany({
      where: authorFilter,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { hands: true, comments: true } },
      },
    }),
    prisma.hand.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        post: { select: { title: true, type: true } },
      },
    }),
    prisma.handMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        post: { select: { title: true } },
      },
    }),
  ]);

  const sortedPosts = [...postRows].sort((a, b) => {
    if (a.important !== b.important) return a.important ? -1 : 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return {
    user,
    totals: {
      posts: totalPosts,
      lostPosts,
      foundPosts,
      openPosts,
      importantPosts,
      handsRaised,
      comments,
      handMessages,
    },
    postsByStatus: countMap(
      statusGroups.map((g) => ({ key: g.status, count: g._count._all })),
      statusKeys
    ),
    postsByType: countMap(
      typeGroups.map((g) => ({ key: g.type, count: g._count._all })),
      typeKeys
    ),
    postsByCategory: countMap(
      categoryGroups.map((g) => ({ key: g.category, count: g._count._all })),
      categoryKeys
    ),
    posts: sortedPosts.map((row) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      category: row.category,
      status: row.status as Post["status"],
      important: row.important,
      location: row.location,
      createdAt: row.createdAt.toISOString(),
      handCount: row._count.hands,
      commentCount: row._count.comments,
    })),
    handsRaised: handRows.map((row) => ({
      id: row.id,
      postId: row.postId,
      postTitle: row.post.title,
      postType: row.post.type,
      note: row.note,
      createdAt: row.createdAt.toISOString(),
    })),
    handMessages: handMessageRows.map((row) => ({
      id: row.id,
      postId: row.postId,
      postTitle: row.post.title,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}
