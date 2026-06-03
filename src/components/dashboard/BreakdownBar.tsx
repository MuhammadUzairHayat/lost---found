export function BreakdownBar({
  label,
  count,
  total,
  colorClass = "bg-ink",
}: {
  label: string;
  count: number;
  total: number;
  colorClass?: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <span className="text-body">{label}</span>
        <span className="shrink-0 tabular-nums text-mute">
          {count}
          <span className="ml-1 text-[10px]">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
