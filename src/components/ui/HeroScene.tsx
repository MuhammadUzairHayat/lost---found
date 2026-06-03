"use client";

function LostBagIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 140"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M24 48h72l-8 76H32L24 48z" />
      <path d="M36 48V32c0-8 8-14 24-14s24 6 24 14v16" />
      <path d="M44 48c0-4 4-8 16-8s16 4 16 8" strokeWidth="1.5" />
      <circle cx="48" cy="88" r="3" fill="currentColor" stroke="none" />
      <circle cx="72" cy="96" r="2" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  );
}

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
      <path
        d="M32 38 L52 52"
        strokeWidth="1.5"
        className="text-ink/30"
        stroke="currentColor"
      />
    </svg>
  );
}

export function HeroScene() {
  return (
    <div
      className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none lg:mx-0 lg:justify-self-end"
      aria-hidden
    >
      <div className="relative aspect-[4/5] min-h-[280px] sm:min-h-[320px] lg:min-h-[360px]">
        {/* Ground shadow */}
        <div
          className="absolute bottom-[18%] left-1/2 h-3 w-[55%] -translate-x-1/2 rounded-full bg-ink/10 blur-md opacity-0 animate-hero-bag-in [animation-fill-mode:forwards]"
          style={{ animationDelay: "200ms" }}
        />

        {/* Bag — drops in first */}
        <div
          className="absolute bottom-[20%] left-[18%] w-[42%] text-ink opacity-0 animate-hero-bag-in [animation-fill-mode:forwards]"
          style={{ animationDelay: "200ms" }}
        >
          <LostBagIcon className="h-full w-full drop-shadow-sm" />
        </div>

        {/* Scope — slides in from the right */}
        <div
          className="absolute right-0 top-[32%] w-[48%] text-ink opacity-0 animate-hero-scope-in [animation-fill-mode:forwards]"
          style={{ animationDelay: "950ms" }}
        >
          <SearchScopeIcon className="h-full w-full" />
        </div>

        {/* Message bubble — appears after scope arrives */}
        <div
          className="absolute right-0 top-[6%] max-w-[min(100%,14rem)] opacity-0 animate-hero-bubble-in [animation-fill-mode:forwards]"
          style={{ animationDelay: "1550ms" }}
        >
          <div className="relative rounded-2xl border border-line bg-card px-4 py-3 shadow-card">
            <p className="text-sm font-medium text-ink leading-snug">
              Could this be yours?
            </p>
            <p className="mt-1 text-xs text-mute">
              Someone may have spotted it nearby.
            </p>
            <span
              className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-line bg-card"
              aria-hidden
            />
          </div>
        </div>

        {/* Subtle scan ring when scope lands */}
        <div
          className="absolute left-[28%] top-[42%] h-16 w-16 rounded-full border border-ink/20 opacity-0 animate-hero-scan-pulse [animation-fill-mode:forwards]"
          style={{ animationDelay: "1200ms" }}
        />
      </div>
    </div>
  );
}
