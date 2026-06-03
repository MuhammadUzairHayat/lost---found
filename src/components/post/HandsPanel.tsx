"use client";

import { HandIcon } from "@/components/ui/HandIcon";
import { HandRaisedCard } from "@/components/post/HandRaisedCard";
import type { Hand } from "@/lib/types";

export function HandsPanel({
  hands,
  viewerId,
  onClose,
}: {
  hands: Hand[];
  viewerId?: string | null;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hands-panel-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-hidden rounded-t-2xl border border-line bg-paper shadow-2xl animate-fade-up sm:max-h-[80vh] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <HandIcon className="h-5 w-5" />
            <h2 id="hands-panel-title" className="text-sm font-semibold">
              Raised hands
              {hands.length > 0 && (
                <span className="ml-1 font-normal text-mute">
                  ({hands.length})
                </span>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-lg leading-none text-mute hover:text-ink"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(85vh-56px)] overflow-y-auto p-3">
          {hands.length === 0 ? (
            <p className="py-8 text-center text-sm text-mute">
              No one has raised their hand yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {hands.map((hand) => (
                <li key={hand.id}>
                  <HandRaisedCard
                    hand={hand}
                    highlight={viewerId === hand.userId}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
