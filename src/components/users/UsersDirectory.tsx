"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { UserDirectoryItem, UserDirectoryPage } from "@/lib/api/user-directory";
import { USERS_DIRECTORY_DEFAULT_LIMIT } from "@/lib/api/user-directory";
import { userProfileHref } from "@/lib/users/profile-url";

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M13 13l4 4" strokeLinecap="round" />
    </svg>
  );
}

function UserCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-paper p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-line" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded bg-line" />
          <div className="h-2.5 w-1/2 rounded bg-line" />
          <div className="h-2 w-full rounded bg-line" />
        </div>
      </div>
    </div>
  );
}

function UserCard({ user }: { user: UserDirectoryItem }) {
  return (
    <Link
      href={userProfileHref(user.id)}
      className="group block rounded-2xl border border-line bg-paper p-4 transition-colors hover:border-ink/25 hover:shadow-card"
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          name={user.name}
          avatar={user.avatar}
          size="sm"
          userId={user.id}
          linkToProfile={false}
          previewImage
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink truncate group-hover:underline underline-offset-2">
            {user.name}
          </p>
          <div className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-mute">
            {user.studentId && <span className="font-mono">ID {user.studentId}</span>}
            {user.department && <span className="truncate">{user.department}</span>}
          </div>
          {user.bio ? (
            <p className="mt-2 text-xs leading-relaxed text-body line-clamp-2">
              {user.bio}
            </p>
          ) : (
            <p className="mt-2 text-xs text-subtle italic">No bio</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function pageRange(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

export function UsersDirectory() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [data, setData] = useState<UserDirectoryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ]);

  const fetchPage = useCallback(async (targetPage: number, q: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(USERS_DIRECTORY_DEFAULT_LIMIT),
      });
      if (q) params.set("q", q);
      const res = await fetch(`/api/users?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load members");
      setData(json);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPage(page, debouncedQ);
  }, [page, debouncedQ, fetchPage]);

  const rangeLabel = useMemo(() => {
    if (!data || data.total === 0) return null;
    const start = (data.page - 1) * data.limit + 1;
    const end = Math.min(data.page * data.limit, data.total);
    return `${start}–${end} of ${data.total}`;
  }, [data]);

  const pages = data ? pageRange(data.page, data.totalPages) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="block flex-1 max-w-md">
          <span className="sr-only">Search members</span>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, ID, department…"
              className="field-input !mt-0 w-full pl-10"
              autoComplete="off"
            />
          </div>
        </label>
        {rangeLabel && !loading && (
          <p className="text-xs text-mute tabular-nums shrink-0">{rangeLabel}</p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-line px-4 py-3 text-sm text-ink">
          {error}
          <button
            type="button"
            onClick={() => void fetchPage(page, debouncedQ)}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: USERS_DIRECTORY_DEFAULT_LIMIT }).map((_, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.users.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="text-sm text-body">
            {debouncedQ
              ? "No members match your search."
              : "No members with completed profiles yet."}
          </p>
          {debouncedQ && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="btn-secondary mt-4"
            >
              Clear search
            </button>
          )}
        </div>
      ) : data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : null}

      {data && data.totalPages > 1 && (
        <nav
          className="flex flex-col items-center gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between"
          aria-label="Members pagination"
        >
          <p className="text-xs text-mute order-2 sm:order-1">
            Page {data.page} of {data.totalPages}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1 order-1 sm:order-2">
            <button
              type="button"
              disabled={loading || data.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:border-ink/30"
            >
              Previous
            </button>
            {data.page > 3 && data.totalPages > 7 && (
              <>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setPage(1)}
                  className="min-w-[2rem] rounded-full px-2 py-1.5 text-xs text-mute hover:bg-line/50"
                >
                  1
                </button>
                <span className="px-1 text-mute text-xs">…</span>
              </>
            )}
            {pages.map((p) => (
              <button
                key={p}
                type="button"
                disabled={loading}
                onClick={() => setPage(p)}
                aria-current={p === data.page ? "page" : undefined}
                className={
                  p === data.page
                    ? "min-w-[2rem] rounded-full bg-ink px-2 py-1.5 text-xs font-medium text-paper"
                    : "min-w-[2rem] rounded-full px-2 py-1.5 text-xs text-mute hover:bg-line/50"
                }
              >
                {p}
              </button>
            ))}
            {data.page < data.totalPages - 2 && data.totalPages > 7 && (
              <>
                <span className="px-1 text-mute text-xs">…</span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setPage(data.totalPages)}
                  className="min-w-[2rem] rounded-full px-2 py-1.5 text-xs text-mute hover:bg-line/50"
                >
                  {data.totalPages}
                </button>
              </>
            )}
            <button
              type="button"
              disabled={loading || data.page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:border-ink/30"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
