import {
  CATEGORIES,
  POST_TYPES,
  type CategoryId,
  type PostTypeId,
} from "@/lib/constants/constants";
import type { Post } from "@/lib/types";

export type BrowseSort = "recent" | "";

export type BrowseStatusFilter = Post["status"] | "";

const BROWSE_STATUS_FILTERS: Post["status"][] = [
  "open",
  "resolved",
  "matched",
  "closed",
];

export type BrowseFilters = {
  category: string;
  type: string;
  sort: BrowseSort;
  important: boolean;
  status: BrowseStatusFilter;
};

export function isValidCategoryId(id: string): id is CategoryId {
  return CATEGORIES.some((c) => c.id === id);
}

export function isValidPostTypeId(id: string): id is PostTypeId {
  return POST_TYPES.some((t) => t.id === id);
}

export function parseBrowseSort(raw: string): BrowseSort {
  return raw === "recent" ? "recent" : "";
}

export function parseBrowseStatusFilter(raw: string): BrowseStatusFilter {
  return BROWSE_STATUS_FILTERS.includes(raw as Post["status"])
    ? (raw as Post["status"])
    : "";
}

export function parseBrowseImportantFilter(
  params: Pick<URLSearchParams, "get">
): boolean {
  const raw = params.get("important") ?? "";
  return raw === "1" || raw === "true";
}

export function parseBrowseFilters(
  params: Pick<URLSearchParams, "get">
): BrowseFilters {
  const rawCategory = params.get("category") ?? "";
  const rawType = params.get("type") ?? "";
  const rawSort = params.get("sort") ?? "";
  const legacyRecent =
    params.get("recent") === "1" || params.get("recent") === "true";
  return {
    category: isValidCategoryId(rawCategory) ? rawCategory : "",
    type: isValidPostTypeId(rawType) ? rawType : "",
    sort: parseBrowseSort(rawSort) || (legacyRecent ? "recent" : ""),
    important: parseBrowseImportantFilter(params),
    status: parseBrowseStatusFilter(params.get("status") ?? ""),
  };
}

export function buildPostsBrowseHref(
  filters: Partial<BrowseFilters>
): string {
  const params = new URLSearchParams();
  if (filters.category && isValidCategoryId(filters.category)) {
    params.set("category", filters.category);
  }
  if (filters.type && isValidPostTypeId(filters.type)) {
    params.set("type", filters.type);
  }
  if (filters.sort === "recent") {
    params.set("sort", "recent");
  }
  if (filters.important) {
    params.set("important", "1");
  }
  if (filters.status && parseBrowseStatusFilter(filters.status)) {
    params.set("status", filters.status);
  }
  const qs = params.toString();
  return qs ? `/posts?${qs}` : "/posts";
}

/** Link target for filter chips on post cards (browse, or login callback). */
export function postsBrowseFilterHref(
  filter: Partial<BrowseFilters>,
  requireAuth = false
): string {
  const href = buildPostsBrowseHref(filter);
  if (requireAuth) {
    return `/login?callbackUrl=${encodeURIComponent(href)}`;
  }
  return href;
}

export function sortBrowsePosts<T extends { post: { createdAt: string } }>(
  items: T[],
  sort: BrowseSort
): T[] {
  if (sort !== "recent") return items;
  return [...items].sort(
    (a, b) =>
      new Date(b.post.createdAt).getTime() -
      new Date(a.post.createdAt).getTime()
  );
}
