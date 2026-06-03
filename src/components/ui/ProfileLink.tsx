import type { ReactNode } from "react";
import Link from "next/link";
import { userProfileHref } from "@/lib/users/profile-url";

export function ProfileLink({
  userId,
  name,
  className = "",
  children,
}: {
  userId: string;
  name?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link
      href={userProfileHref(userId)}
      className={`hover:text-ink hover:underline underline-offset-2 ${className}`}
    >
      {children ?? name}
    </Link>
  );
}
