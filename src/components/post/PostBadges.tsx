import { postStatusClass, postStatusLabel } from "@/lib/posts/status";
import type { Post } from "@/lib/types";

export function ImportantMark({
  className = "",
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-ink bg-ink px-1.5 py-0.5 text-paper ${className}`}
      title="Important"
    >
      <svg
        className={icon}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6L12 2z" />
      </svg>
      <span className="text-[9px] font-semibold uppercase tracking-wide">
        Important
      </span>
    </span>
  );
}

export function PostStatusBadge({
  status,
  className = "",
}: {
  status: Post["status"];
  className?: string;
}) {
  if (status === "open") return null;
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${postStatusClass(status)} ${className}`}
    >
      {postStatusLabel(status)}
    </span>
  );
}
