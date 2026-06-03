/** Static corner shapes for inner pages — no motion */
export function PageShapes({
  variant = "default",
}: {
  variant?: "default" | "minimal";
}) {
  if (variant === "minimal") {
    return (
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -right-8 top-24 h-32 w-32 rounded-full border border-ink/[0.06]" />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -left-6 top-32 h-20 w-20 rotate-12 border border-ink/[0.08]" />
      <div className="absolute right-[10%] top-16 h-2 w-2 rounded-full bg-ink/15" />
      <div className="absolute bottom-24 left-[15%] h-14 w-14 rounded-full bg-ink/[0.03]" />
    </div>
  );
}
