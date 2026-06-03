import type { StoredUser } from "@/lib/db/users";

export type PublicProfile = {
  id: string;
  name: string;
  studentId: string | null;
  department: string | null;
  bio: string | null;
  avatar: string | null;
  postCount: number;
};

export function toPublicProfile(
  user: StoredUser,
  postCount = 0
): PublicProfile {
  return {
    id: user.id,
    name: user.name.trim() || "User",
    studentId: user.studentId,
    department: user.department,
    bio: user.bio,
    avatar: user.avatar,
    postCount,
  };
}
