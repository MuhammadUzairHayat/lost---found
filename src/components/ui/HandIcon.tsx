export function HandIcon({
  className = "h-5 w-5",
  filled = false,
}: {
  className?: string;
  /** Solid hand — you raised on this post */
  filled?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 11V6a2 2 0 0 1 4 0v5" />
      <path d="M11 11V4a2 2 0 0 1 4 0v9" />
      <path d="M15 11V7a2 2 0 0 1 4 0v8a6 6 0 0 1-6 6H9a5 5 0 0 1-5-4.5V12a2 2 0 0 1 4 0" />
    </svg>
  );
}
