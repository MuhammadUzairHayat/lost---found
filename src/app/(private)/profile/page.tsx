import Link from "next/link";
import { PageShapes } from "@/components/ui/PageShapes";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getSessionFromCookies } from "@/lib/auth/auth";
import { countPostsByAuthorId } from "@/lib/db/db";
import { getUserById } from "@/lib/db/users";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await getUserById(session.id);
  if (!user?.isProfileComplete) {
    redirect("/profile/setup?callbackUrl=/profile");
  }

  const postCount = await countPostsByAuthorId(user.id);

  return (
    <div className="relative">
      <PageShapes variant="minimal" />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} avatar={user.avatar} size="md" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Your profile
            </h1>
            <p className="text-sm text-mute font-mono">{user.studentId}</p>
            <p className="text-xs text-mute">{user.department}</p>
            <p className="mt-1 text-sm text-body">
              <span className="font-semibold tabular-nums text-ink">
                {postCount}
              </span>{" "}
              {postCount === 1 ? "post" : "posts"}
            </p>
          </div>
        </div>
        {user.bio && (
          <p className="mt-4 max-w-md text-sm text-mute leading-relaxed">
            {user.bio}
          </p>
        )}
        <p className="mt-2 text-xs text-mute">
          <Link
            href="/profile/setup?callbackUrl=%2Fprofile"
            className="underline underline-offset-2 hover:text-ink"
          >
            Edit full profile
          </Link>
        </p>
        <ProfileForm />
      </div>
    </div>
  );
}
