export function StatTile({
  label,
  value,
  hint,
  className = "",
}: {
  label: string;
  value: number | string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface/80 px-3.5 py-2.5 ${className}`}
    >
      <dt className="text-[10px] font-medium uppercase tracking-wider text-mute">
        {label}
      </dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
        {value}
      </dd>
      {hint && <p className="mt-0.5 text-[10px] text-mute">{hint}</p>}
    </div>
  );
}
