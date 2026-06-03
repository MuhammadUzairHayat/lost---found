import Link from "next/link";
import { BrandLogo } from "@/components/theme/BrandLogo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface/50">
      <div className="page-container flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10">
        <div>
          <BrandLogo />
          <p className="mt-1 text-xs text-mute">
            Raise a hand, connect immediately.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 sm:gap-6 text-xs font-medium text-mute">
          <Link href="/posts" className="transition-colors hover:text-ink">
            Browse posts
          </Link>
          <Link href="/posts/new" className="transition-colors hover:text-ink">
            Create post
          </Link>
        </div>
      </div>
    </footer>
  );
}
