import { ProfileLink } from "@/components/ui/ProfileLink";
import { UserAvatar } from "@/components/ui/UserAvatar";

export function UserIdentity({
  userId,
  name,
  avatar,
  size = "xs",
  nameClassName = "text-xs font-medium text-ink",
  className = "flex items-center gap-2 min-w-0",
}: {
  userId: string;
  name: string;
  avatar?: string | null;
  size?: "xxxs" | "xxs" | "xs" | "sm" | "md" | "lg";
  nameClassName?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <UserAvatar
        name={name}
        avatar={avatar}
        size={size}
        userId={userId}
        linkToProfile
      />
      <ProfileLink userId={userId} name={name} className={nameClassName} />
    </div>
  );
}
