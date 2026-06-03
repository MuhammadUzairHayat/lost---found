import type { Post } from "@/lib/types";

export type PostStatus = Post["status"];

export function isPostOpenForHands(status: PostStatus): boolean {
  return status === "open";
}

export function postStatusLabel(status: PostStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "resolved":
      return "Resolved";
    case "matched":
      return "Matched";
    case "closed":
      return "Closed";
    default:
      return status;
  }
}

export function handsClosedTitle(status: PostStatus): string {
  switch (status) {
    case "resolved":
      return "This post is resolved";
    case "matched":
      return "This item has been matched";
    case "closed":
      return "This post is closed";
    default:
      return "Hands are closed";
  }
}

export function handsClosedMessage(status: PostStatus): string {
  switch (status) {
    case "resolved":
      return "The poster marked this as resolved, so new hands can't be raised. Existing raised hands and messages are still available to view.";
    case "matched":
      return "This item has been matched with someone. New hands are no longer accepted on this post.";
    case "closed":
      return "This post is closed. New hands can't be raised anymore.";
    default:
      return "New hands can't be raised on this post.";
  }
}

export function postStatusClass(status: PostStatus): string {
  switch (status) {
    case "open":
      return "border border-ink/30 text-ink bg-paper";
    case "resolved":
      return "border border-emerald-600/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "matched":
      return "border border-blue-600/40 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300";
    case "closed":
      return "border border-line bg-surface text-mute";
    default:
      return "bg-ink/10 text-mute border border-line";
  }
}
