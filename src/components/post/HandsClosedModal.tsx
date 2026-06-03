"use client";

import Link from "next/link";
import { HandIcon } from "@/components/ui/HandIcon";
import {
  handsClosedMessage,
  handsClosedTitle,
  postStatusClass,
  postStatusLabel,
} from "@/lib/posts/status";
import type { Post } from "@/lib/types";

export function HandsClosedModal({
  status,
  handCount,
  handsHref,
  viewerHasHand = false,
  onClose,
}: {
  status: Post["status"];
  handCount: number;
  handsHref: string;
  viewerHasHand?: boolean;
  onClose: () => void;
}) {
  const showViewHands = handCount > 0 || viewerHasHand;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hands-closed-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl border border-line bg-paper p-5 shadow-2xl animate-fade-up sm:rounded-2xl">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-mute">
            <HandIcon className="h-5 w-5" />
          </span>
          <span
            className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${postStatusClass(status)}`}
          >
            {postStatusLabel(status)}
          </span>
          <h2
            id="hands-closed-title"
            className="mt-3 text-sm font-semibold text-ink"
          >
            {handsClosedTitle(status)}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-body">
            {handsClosedMessage(status)}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className={
              showViewHands
                ? "flex-1 rounded-full border border-line px-4 py-2 text-sm text-body hover:border-ink/30"
                : "w-full rounded-full bg-ink px-4 py-2 text-sm text-paper"
            }
          >
            Got it
          </button>
          {showViewHands && (
            <Link
              href={handsHref}
              onClick={onClose}
              className="flex-1 rounded-full bg-ink px-4 py-2 text-center text-sm text-paper"
            >
              {viewerHasHand
                ? "View your hand"
                : `View ${handCount} ${handCount === 1 ? "hand" : "hands"}`}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
