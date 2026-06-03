import type { SessionUser } from "@/lib/auth/auth-edge";
import { contactFromStoredUser, type StoredUser } from "@/lib/db/users";

export function toSessionUser(user: StoredUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    contact: contactFromStoredUser(user),
    isProfileComplete: user.isProfileComplete,
  };
}
