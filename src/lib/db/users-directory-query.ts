import { prisma } from "@/lib/prisma";
import type { UserDirectoryItem, UserDirectoryPage } from "@/lib/api/user-directory";

function mapRow(row: {
  id: string;
  name: string;
  studentId: string | null;
  department: string | null;
  bio: string | null;
  avatar: string | null;
}): UserDirectoryItem {
  return {
    id: row.id,
    name: row.name.trim() || "User",
    studentId: row.studentId,
    department: row.department,
    bio: row.bio,
    avatar: row.avatar,
  };
}

function buildSearchWhere(q: string) {
  if (!q) {
    return { isProfileComplete: true } as const;
  }
  return {
    isProfileComplete: true,
    OR: [
      { name: { contains: q, mode: "insensitive" as const } },
      { studentId: { contains: q, mode: "insensitive" as const } },
      { department: { contains: q, mode: "insensitive" as const } },
      { bio: { contains: q, mode: "insensitive" as const } },
    ],
  };
}

export async function queryUsersDirectoryPage(options: {
  page: number;
  limit: number;
  q?: string;
}): Promise<UserDirectoryPage> {
  const page = Math.max(1, options.page);
  const limit = Math.max(1, Math.min(options.limit, 48));
  const q = options.q?.trim() ?? "";
  const where = buildSearchWhere(q);
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        studentId: true,
        department: true,
        bio: true,
        avatar: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    users: rows.map(mapRow),
    page,
    limit,
    total,
    totalPages,
  };
}
