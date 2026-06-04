"use client";

const LIST_ROWS = [
  { type: "lost" as const, title: "Blue backpack", location: "Campus library" },
  { type: "found" as const, title: "House keys", location: "Main street" },
  { type: "lost" as const, title: "Wireless earbuds", location: "Bus stop #12" },
  { type: "found" as const, title: "ID card", location: "Coffee shop" },
];

function SearchScopeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="42" cy="42" r="26" />
      <path d="M60 60 L88 88" strokeWidth="3" />
      <path d="M32 38 L52 52" strokeWidth="1.5" opacity="0.35" />
    </svg>
  );
}

function MiniListRow({
  type,
  title,
  location,
  delayMs,
}: {
  type: "lost" | "found";
  title: string;
  location: string;
  delayMs: number;
}) {
  const typeClass =
    type === "lost"
      ? "border border-ink text-ink"
      : "bg-ink text-paper";

  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-2.5 py-2 shadow-card opacity-0 animate-posts-row-drop [animation-fill-mode:forwards]"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="h-9 w-9 shrink-0 rounded-lg bg-surface" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`rounded-full px-1.5 py-px text-[8px] font-semibold uppercase tracking-wide ${typeClass}`}
          >
            {type}
          </span>
          <p className="truncate text-[11px] font-medium text-ink">{title}</p>
        </div>
        <p className="mt-0.5 truncate text-[9px] text-mute">{location}</p>
      </div>
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-[8px] font-medium text-mute tabular-nums">
        1
      </div>
    </div>
  );
}

export function PostsBrowseScene() {
  return (
    <div
      className="relative mx-auto w-full max-w-[280px] sm:max-w-none lg:mx-0 lg:justify-self-end"
      aria-hidden
    >
      <div className="relative aspect-[4/5] min-h-[240px] sm:min-h-[280px] lg:min-h-[320px]">
        {/* List stack — drops in from top */}
        <div className="absolute inset-x-0 top-[8%] space-y-2 px-1">
          {LIST_ROWS.map((row, i) => (
            <MiniListRow
              key={row.title}
              type={row.type}
              title={row.title}
              location={row.location}
              delayMs={120 + i * 140}
            />
          ))}
        </div>

        {/* Scan beam cone under scope while it moves */}
        <div
          className="pointer-events-none absolute left-1/2 top-[38%] h-24 w-16 -translate-x-1/2 origin-top opacity-0 animate-posts-scan-beam [animation-fill-mode:forwards]"
          style={{
            animationDelay: "680ms",
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            background:
              "linear-gradient(to bottom, rgb(var(--ink-rgb) / 0.12), transparent)",
          }}
        />

        {/* Scope — sweeps the list then docks top-right */}
        <div
          className="absolute left-1/2 top-1/2 w-[38%] -translate-x-1/2 -translate-y-1/2 text-ink opacity-0 animate-posts-scope-journey [animation-fill-mode:forwards]"
          style={{ animationDelay: "680ms" }}
        >
          <SearchScopeIcon className="h-full w-full drop-shadow-sm" />
        </div>

        {/* Docked scope — subtle pulse after journey completes */}
        <div
          className="absolute right-0 top-0 w-[22%] text-ink/70 opacity-0 animate-posts-dock-pulse [animation-fill-mode:forwards]"
          style={{ animationDelay: "3480ms" }}
        >
          <SearchScopeIcon className="h-full w-full" />
        </div>

        {/* Scan rings when scope passes rows */}
        <div
          className="absolute left-[22%] top-[42%] h-10 w-10 rounded-full border border-ink/15 opacity-0 animate-hero-scan-pulse [animation-fill-mode:forwards]"
          style={{ animationDelay: "1400ms" }}
        />
        <div
          className="absolute left-[18%] top-[58%] h-8 w-8 rounded-full border border-ink/10 opacity-0 animate-hero-scan-pulse [animation-fill-mode:forwards]"
          style={{ animationDelay: "1900ms" }}
        />
      </div>
    </div>
  );
}
