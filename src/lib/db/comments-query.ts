import { Prisma } from "@prisma/client";
import { getPrisma } from "../prisma";
import type { Comment } from "../types";

type RawCommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  body: string;
  parent_id: string | null;
  created_at: Date;
  user_avatar: string | null;
};

const userSelect = { user: { select: { avatar: true } } } as const;

function mapComment(row: {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  body: string;
  parentId: string | null;
  createdAt: Date;
  user?: { avatar: string | null } | null;
}): Comment {
  return {
    id: row.id,
    postId: row.postId,
    userId: row.userId,
    userName: row.userName,
    userAvatar: row.user?.avatar ?? null,
    body: row.body,
    parentId: row.parentId,
    createdAt: row.createdAt.toISOString(),
  };
}

function fromRaw(row: RawCommentRow): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    userName: row.user_name,
    userAvatar: row.user_avatar,
    body: row.body,
    parentId: row.parent_id,
    createdAt: row.created_at.toISOString(),
  };
}

function getCommentDelegate() {
  return getPrisma().comment ?? null;
}

export async function queryCommentsByPostId(postId: string): Promise<Comment[]> {
  const delegate = getCommentDelegate();
  if (delegate) {
    const rows = await delegate.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: userSelect,
    });
    return rows.map(mapComment);
  }

  const rows = await getPrisma().$queryRaw<RawCommentRow[]>`
    SELECT c.id, c.post_id, c.user_id, c.user_name, c.body, c.parent_id, c.created_at, u.avatar AS user_avatar
    FROM comments c
    LEFT JOIN users u ON u.id = c.user_id
    WHERE c.post_id = ${postId}
    ORDER BY c.created_at ASC
  `;
  return rows.map(fromRaw);
}

export async function queryCommentCountByPostId(postId: string): Promise<number> {
  const delegate = getCommentDelegate();
  if (delegate) {
    return delegate.count({ where: { postId } });
  }

  const rows = await getPrisma().$queryRaw<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM comments
    WHERE post_id = ${postId}
  `;
  return rows[0]?.count ?? 0;
}

export async function queryCommentCountsByPostIds(
  postIds: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const id of postIds) counts[id] = 0;
  if (postIds.length === 0) return counts;

  const delegate = getCommentDelegate();
  if (delegate) {
    const rows = await delegate.findMany({
      where: { postId: { in: postIds } },
      select: { postId: true },
    });
    for (const row of rows) {
      counts[row.postId] = (counts[row.postId] ?? 0) + 1;
    }
    return counts;
  }

  const rows = await getPrisma().$queryRaw<{ post_id: string; count: number }[]>`
    SELECT post_id, COUNT(*)::int AS count
    FROM comments
    WHERE post_id IN (${Prisma.join(postIds)})
    GROUP BY post_id
  `;
  for (const row of rows) {
    counts[row.post_id] = row.count;
  }
  return counts;
}

export async function queryRecentCommentsByPostId(
  postId: string,
  limit = 5,
): Promise<Comment[]> {
  const delegate = getCommentDelegate();
  if (delegate) {
    const rows = await delegate.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: userSelect,
    });
    return rows.map(mapComment).reverse();
  }

  const rows = await getPrisma().$queryRaw<RawCommentRow[]>`
    SELECT c.id, c.post_id, c.user_id, c.user_name, c.body, c.parent_id, c.created_at, u.avatar AS user_avatar
    FROM comments c
    LEFT JOIN users u ON u.id = c.user_id
    WHERE c.post_id = ${postId}
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;
  return rows.map(fromRaw).reverse();
}

export async function queryRecentCommentsByPostIds(
  postIds: string[],
  limitPerPost = 4,
): Promise<Record<string, Comment[]>> {
  if (postIds.length === 0) return {};

  const delegate = getCommentDelegate();
  let rows: Comment[];

  if (delegate) {
    const dbRows = await delegate.findMany({
      where: { postId: { in: postIds } },
      orderBy: { createdAt: "desc" },
      include: userSelect,
    });
    rows = dbRows.map(mapComment);
  } else {
    const dbRows = await getPrisma().$queryRaw<RawCommentRow[]>`
      SELECT c.id, c.post_id, c.user_id, c.user_name, c.body, c.parent_id, c.created_at, u.avatar AS user_avatar
      FROM comments c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE c.post_id IN (${Prisma.join(postIds)})
      ORDER BY c.created_at DESC
    `;
    rows = dbRows.map(fromRaw);
  }

  const grouped: Record<string, Comment[]> = {};
  for (const comment of rows) {
    if (!grouped[comment.postId]) grouped[comment.postId] = [];
    if (grouped[comment.postId].length < limitPerPost) {
      grouped[comment.postId].push(comment);
    }
  }
  for (const id of postIds) {
    if (grouped[id]) grouped[id].reverse();
  }
  return grouped;
}

export async function queryCommentById(id: string): Promise<Comment | null> {
  const delegate = getCommentDelegate();
  if (delegate) {
    const row = await delegate.findUnique({
      where: { id },
      include: userSelect,
    });
    return row ? mapComment(row) : null;
  }

  const rows = await getPrisma().$queryRaw<RawCommentRow[]>`
    SELECT c.id, c.post_id, c.user_id, c.user_name, c.body, c.parent_id, c.created_at, u.avatar AS user_avatar
    FROM comments c
    LEFT JOIN users u ON u.id = c.user_id
    WHERE c.id = ${id}
    LIMIT 1
  `;
  return rows[0] ? fromRaw(rows[0]) : null;
}

export async function insertComment(comment: Comment): Promise<Comment> {
  const delegate = getCommentDelegate();
  if (delegate) {
    const row = await delegate.create({
      data: {
        id: comment.id,
        postId: comment.postId,
        userId: comment.userId,
        userName: comment.userName,
        body: comment.body,
        parentId: comment.parentId,
        createdAt: new Date(comment.createdAt),
      },
      include: userSelect,
    });
    return mapComment(row);
  }

  await getPrisma().$executeRaw`
    INSERT INTO comments (id, post_id, user_id, user_name, body, parent_id, created_at)
    VALUES (
      ${comment.id},
      ${comment.postId},
      ${comment.userId},
      ${comment.userName},
      ${comment.body},
      ${comment.parentId},
      ${new Date(comment.createdAt)}
    )
  `;

  const created = await queryCommentById(comment.id);
  return created ?? { ...comment, userAvatar: comment.userAvatar ?? null };
}

export async function updateCommentBody(
  id: string,
  body: string,
): Promise<Comment | null> {
  const delegate = getCommentDelegate();
  if (delegate) {
    const row = await delegate.update({
      where: { id },
      data: { body },
      include: userSelect,
    });
    return row ? mapComment(row) : null;
  }

  await getPrisma().$executeRaw`
    UPDATE comments SET body = ${body} WHERE id = ${id}
  `;
  return queryCommentById(id);
}

export async function deleteCommentById(id: string): Promise<boolean> {
  const delegate = getCommentDelegate();
  if (delegate) {
    await delegate.delete({ where: { id } });
    return true;
  }

  const result = await getPrisma().$executeRaw`
    DELETE FROM comments WHERE id = ${id}
  `;
  return Number(result) > 0;
}
