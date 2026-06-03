"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, POST_TYPES } from "@/lib/constants/constants";
import { PostCard } from "@/components/post/PostCard";
import { useMyHandPostIds } from "@/components/post/useMyHandPostIds";
import {
  buildPostsBrowseHref,
  parseBrowseFilters,
  sortBrowsePosts,
  type BrowseFilters,
} from "@/lib/posts/browse-filters";
import type { PublicPost } from "@/lib/api/responses";
import type { Comment } from "@/lib/types";

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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-mute transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function countUrlFilters(filters: BrowseFilters): number {
  let n = 0;
  if (filters.category) n++;
  if (filters.type) n++;
  if (filters.sort === "recent") n++;
  if (filters.important) n++;
  if (filters.status) n++;
  return n;
}

function filtersEqual(a: BrowseFilters, b: BrowseFilters): boolean {
  return (
    a.category === b.category &&
    a.type === b.type &&
    a.sort === b.sort &&
    a.important === b.important &&
    a.status === b.status
  );
}

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-mute mb-2.5">
        {label}
      </p>
      {children}
    </div>
  );
}

export function PostsBrowser({
  initial,
}: {
  initial: {
    post: PublicPost;
    handCount: number;
    commentCount: number;
    recentComments: Comment[];
  }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applied = parseBrowseFilters(searchParams);
  const [q, setQ] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<BrowseFilters>(applied);
  const myHandPostIds = useMyHandPostIds();

  useEffect(() => {
    setDraft(parseBrowseFilters(searchParams));
  }, [searchParams]);

  const currentFilters: BrowseFilters = applied;
  const appliedFilterCount = countUrlFilters(applied);
  const draftDirty = !filtersEqual(draft, applied);

  const setBrowseFilters = (next: Partial<BrowseFilters>) => {
    const href = buildPostsBrowseHref({
      category: next.category !== undefined ? next.category : applied.category,
      type: next.type !== undefined ? next.type : applied.type,
      sort: next.sort !== undefined ? next.sort : applied.sort,
      important: next.important !== undefined ? next.important : applied.important,
      status: next.status !== undefined ? next.status : applied.status,
    });
    router.replace(href, { scroll: false });
  };

  const applyDraftFilters = () => {
    const href = buildPostsBrowseHref(draft);
    router.replace(href, { scroll: false });
    setFiltersOpen(false);
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const matches = initial.filter(({ post }) => {
      if (applied.category && post.category !== applied.category) return false;
      if (applied.type && post.type !== applied.type) return false;
      if (applied.important && !post.important) return false;
      if (applied.status && post.status !== applied.status) return false;
      if (query) {
        const hay = `${post.title} ${post.description} ${post.location}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
    return sortBrowsePosts(matches, applied.sort);
  }, [initial, applied, q]);

  const hasFilters =
    appliedFilterCount > 0 || q.trim().length > 0;

  const clearAllFilters = () => {
    const empty: BrowseFilters = {
      category: "",
      type: "",
      sort: "",
      important: false,
      status: "",
    };
    setDraft(empty);
    setBrowseFilters(empty);
    setQ("");
    setFiltersOpen(false);
  };

  const updateDraft = (next: Partial<BrowseFilters>) => {
    setDraft((prev) => ({ ...prev, ...next }));
  };

  return (
    <div className="mt-6 sm:mt-8 space-y-6">
      <div className="card p-4 sm:p-5">
        <label className="field-label">
          Search
          <div className="relative mt-1.5">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Title, description, location…"
              className="field-input !mt-0 pl-10"
            />
          </div>
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="btn-secondary !px-4 !py-2 text-xs sm:text-sm"
            aria-expanded={filtersOpen}
            aria-controls="browse-filters-panel"
          >
            <span className="flex items-center gap-2">
              Filters
              {appliedFilterCount > 0 && (
                <span className="rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-paper tabular-nums">
                  {appliedFilterCount}
                </span>
              )}
              <ChevronIcon open={filtersOpen} />
            </span>
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="btn-clear-filters shrink-0 !px-4 !py-2 text-xs"
            >
              Clear all
            </button>
          )}
        </div>

        {filtersOpen && (
          <div
            id="browse-filters-panel"
            className="mt-4 border-t border-line pt-4 space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <FilterSection label="Type">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateDraft({ type: "" })}
                    className={
                      !draft.type ? "filter-pill-active" : "filter-pill-inactive"
                    }
                  >
                    All
                  </button>
                  {POST_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updateDraft({ type: t.id })}
                      className={
                        draft.type === t.id
                          ? "filter-pill-active"
                          : "filter-pill-inactive"
                      }
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </FilterSection>

              <FilterSection label="Category">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateDraft({ category: "" })}
                    className={
                      !draft.category
                        ? "filter-pill-active"
                        : "filter-pill-inactive"
                    }
                  >
                    All
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateDraft({ category: c.id })}
                      className={
                        draft.category === c.id
                          ? "filter-pill-active"
                          : "filter-pill-inactive"
                      }
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </FilterSection>

              <FilterSection label="Sort">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateDraft({ sort: "" })}
                    className={
                      draft.sort !== "recent"
                        ? "filter-pill-active"
                        : "filter-pill-inactive"
                    }
                  >
                    Featured
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDraft({ sort: "recent" })}
                    className={
                      draft.sort === "recent"
                        ? "filter-pill-active"
                        : "filter-pill-inactive"
                    }
                    title="Newest posts first"
                  >
                    Recent
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-subtle">
                  Recent = newest first
                </p>
              </FilterSection>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FilterSection label="Status">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateDraft({ status: "" })}
                    className={
                      !draft.status
                        ? "filter-pill-active"
                        : "filter-pill-inactive"
                    }
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDraft({ status: "resolved" })}
                    className={
                      draft.status === "resolved"
                        ? "filter-pill-active"
                        : "filter-pill-inactive"
                    }
                  >
                    Resolved
                  </button>
                </div>
              </FilterSection>

              <FilterSection label="Important">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateDraft({ important: false })}
                    className={
                      !draft.important
                        ? "filter-pill-active"
                        : "filter-pill-inactive"
                    }
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraft({ important: !draft.important })
                    }
                    className={
                      draft.important
                        ? "filter-pill-active"
                        : "filter-pill-inactive"
                    }
                  >
                    Important only
                  </button>
                </div>
              </FilterSection>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-xs text-mute">
                {draftDirty
                  ? "You have unapplied filter changes"
                  : "Filters match current results"}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(applied);
                    setFiltersOpen(false);
                  }}
                  className="btn-ghost !px-4 !py-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyDraftFilters}
                  disabled={!draftDirty}
                  className="btn-primary !px-5 !py-2 text-xs sm:text-sm disabled:opacity-40"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </div>
        )}

        {hasFilters && (
          <p className="mt-4 text-xs text-mute">
            Showing {filtered.length} of {initial.length} posts
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <p className="text-sm text-body">No posts match your filters.</p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="btn-clear-filters mt-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ post, handCount, commentCount, recentComments }) => (
            <PostCard
              key={post.id}
              post={post}
              handCount={handCount}
              commentCount={commentCount}
              recentComments={recentComments}
              viewerHasHand={myHandPostIds.has(post.id)}
              browseFilterContext={currentFilters}
            />
          ))}
        </div>
      )}
    </div>
  );
}
