"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProfile } from "@/components/profile/ProfileProvider";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { BrandLogo } from "@/components/theme/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const protectedLinks = [
  { href: "/posts", label: "Browse" },
  { href: "/dashboard", label: "My dashboard" },
  { href: "/users", label: "Members" },
  { href: "/posts/new", label: "Post" },
  { href: "/profile", label: "Profile" },
];

function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/posts") {
    return pathname === "/posts";
  }
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (href === "/users") {
    return pathname === "/users" || pathname.startsWith("/users/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-5 w-5 text-ink"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      {open ? (
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, ready, clearProfile, isProfileComplete } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const signOut = async () => {
    await clearProfile();
    router.push("/");
    router.refresh();
  };

  const loginHref =
    pathname === "/login"
      ? "/login"
      : `/login?callbackUrl=${encodeURIComponent(
          pathname === "/" ? "/posts" : pathname
        )}`;

  const registerHref = `/signup?callbackUrl=${encodeURIComponent(
    pathname === "/" ? "/posts" : pathname
  )}`;

  const navLinkClass = (active: boolean) =>
    active
      ? "rounded-full bg-ink px-3 py-1.5 text-xs sm:text-sm font-medium text-paper"
      : "btn-ghost";

  const mobileNavLinkClass = (active: boolean) =>
    active
      ? "block w-full rounded-xl bg-ink px-4 py-3 text-sm font-medium text-paper"
      : "block w-full rounded-xl px-4 py-3 text-sm font-medium text-mute transition-colors hover:bg-surface hover:text-ink";

  const profileHref = isProfileComplete ? "/profile" : "/profile/setup";
  const profileActive =
    (isProfileComplete && pathname === "/profile") ||
    (!isProfileComplete && pathname.startsWith("/profile/setup"));

  const authNav = !ready ? null : profile ? (
    <>
      {isProfileComplete &&
        protectedLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={navLinkClass(isNavLinkActive(pathname, link.href))}
          >
            {link.label}
          </Link>
        ))}
      {!isProfileComplete && (
        <Link
          href="/profile/setup"
          className="rounded-full bg-ink px-3 py-1.5 text-xs sm:text-sm font-medium text-paper"
        >
          Complete profile
        </Link>
      )}
      {isProfileComplete && <NotificationBell />}
      <Link
        href={profileHref}
        className={`ml-0.5 rounded-full p-0.5 transition-opacity hover:opacity-80 ${
          profileActive ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : ""
        }`}
        aria-label="Your profile"
      >
        <UserAvatar
          name={profile.name || "User"}
          avatar={profile.avatar}
          size="xs"
        />
      </Link>
      <button type="button" onClick={signOut} className="btn-ghost">
        Sign out
      </button>
    </>
  ) : (
    <>
      <Link href={loginHref} className={navLinkClass(pathname === "/login")}>
        Sign in
      </Link>
      <Link href={registerHref} className={navLinkClass(pathname === "/signup")}>
        Register
      </Link>
    </>
  );

  const mobileAuthNav = !ready ? null : profile ? (
    <div className="space-y-1 border-t border-line pt-3">
      {isProfileComplete &&
        protectedLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={mobileNavLinkClass(isNavLinkActive(pathname, link.href))}
          >
            {link.label}
          </Link>
        ))}
      {!isProfileComplete && (
        <Link href="/profile/setup" className={mobileNavLinkClass(false)}>
          Complete profile
        </Link>
      )}
      <Link href={profileHref} className={mobileNavLinkClass(profileActive)}>
        Profile
      </Link>
      <button
        type="button"
        onClick={signOut}
        className={mobileNavLinkClass(false)}
      >
        Sign out
      </button>
    </div>
  ) : (
    <div className="space-y-1 border-t border-line pt-3">
      <Link href={loginHref} className={mobileNavLinkClass(pathname === "/login")}>
        Sign in
      </Link>
      <Link
        href={registerHref}
        className={mobileNavLinkClass(pathname === "/signup")}
      >
        Register
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
      <div className="page-container flex h-14 items-center justify-between gap-3">
        <Link
          href="/"
          className="shrink-0 transition-opacity hover:opacity-80"
          aria-label="Home"
        >
          <BrandLogo />
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <ThemeToggle />

          <nav className="hidden lg:flex items-center gap-0.5 sm:gap-1">
            <Link href="/" className={navLinkClass(pathname === "/")}>
              Home
            </Link>
            {authNav}
          </nav>

          {ready && profile && isProfileComplete && (
            <div className="lg:hidden">
              <NotificationBell />
            </div>
          )}

          <button
            title="Open menu"
            type="button"
            className="btn-ghost !p-2 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-14 z-30 bg-ink/20 backdrop-blur-[1px] lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            id="mobile-nav"
            className="relative z-40 border-t border-line bg-paper px-4 py-4 shadow-lg lg:hidden max-h-[calc(100dvh-3.5rem)] overflow-y-auto"
          >
            <div className="space-y-1">
              <Link href="/" className={mobileNavLinkClass(pathname === "/")}>
                Home
              </Link>
            </div>
            {mobileAuthNav}
          </nav>
        </>
      )}
    </header>
  );
}
