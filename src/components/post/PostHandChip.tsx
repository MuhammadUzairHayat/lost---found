"use client";

import { useState } from "react";
import Link from "next/link";
import { HandIcon } from "@/components/ui/HandIcon";
import { HandsClosedModal } from "@/components/post/HandsClosedModal";
import { handChipClass } from "@/components/post/handChip";
import { isPostOpenForHands, handsClosedTitle } from "@/lib/posts/status";
import type { Post } from "@/lib/types";

export function PostHandChip({
  postId,
  status,
  handCount,
  viewerHasHand = false,
  requireAuth = false,
  size = "sm",
  className = "",
}: {
  postId: string;
  status: Post["status"];
  handCount: number;
  viewerHasHand?: boolean;
  requireAuth?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const handsHref = requireAuth
    ? `/login?callbackUrl=${encodeURIComponent(`/posts/${postId}/hands`)}`
    : `/posts/${postId}/hands`;
  const handsClosed = !isPostOpenForHands(status);

  const iconClass =
    size === "md" ? "h-4 w-4" : size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";
  const countClass =
    size === "md"
      ? "text-sm tabular-nums"
      : size === "xs"
        ? "text-[10px] font-medium tabular-nums"
        : "text-[15px] font-medium tabular-nums";
  const chipClass =
    handChipClass(viewerHasHand, handsClosed) +
    (size === "md"
      ? " gap-2 px-4 py-2 text-sm shadow-sm backdrop-blur-sm"
      : size === "xs"
        ? " px-2 py-0.5"
        : " p-1 shadow-card") +
    (className ? ` ${className}` : "");

  const label =
    size === "md" ? (
      <>
        <span className={countClass}>{handCount}</span>
        <span
          className={
            viewerHasHand ? "text-paper/80 font-normal" : "text-mute font-normal"
          }
        >
          {viewerHasHand ? "your hand" : handCount === 1 ? "hand" : "hands"}
        </span>
      </>
    ) : (
      <span className={countClass}>{handCount}</span>
    );

  const title = handsClosed
    ? handsClosedTitle(status)
    : viewerHasHand
      ? "Your hand — view raised hands"
      : "See who raised their hand";

  if (handsClosed) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={chipClass}
          title={title}
          aria-haspopup="dialog"
        >
          <HandIcon className={iconClass} filled={viewerHasHand} />
          {label}
        </button>
        {modalOpen && (
          <HandsClosedModal
            status={status}
            handCount={handCount}
            handsHref={handsHref}
            viewerHasHand={viewerHasHand}
            onClose={() => setModalOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <Link href={handsHref} className={chipClass} title={title}>
      <HandIcon className={iconClass} filled={viewerHasHand} />
      {label}
    </Link>
  );
}
