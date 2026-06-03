export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageShapes } from "@/components/ui/PageShapes";
import { UsersDirectory } from "@/components/users/UsersDirectory";
import { USERS_DIRECTORY_DEFAULT_LIMIT } from "@/lib/api/user-directory";

export default function UsersDirectoryPage() {
  return (
    <div className="relative">
      <PageShapes variant="minimal" />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/posts"
          className="text-xs text-mute hover:text-ink mb-6 inline-block"
        >
          ← Back to browse
        </Link>
        <p className="page-eyebrow">Community</p>
        <h1 className="mt-2 page-title">Members</h1>
        <p className="mt-3 max-w-lg text-description">
          Find people in the lost & found community. Results load page by page —
          only {USERS_DIRECTORY_DEFAULT_LIMIT} profiles are fetched at a time.
        </p>
        <div className="mt-8">
          <UsersDirectory />
        </div>
      </div>
    </div>
  );
}
