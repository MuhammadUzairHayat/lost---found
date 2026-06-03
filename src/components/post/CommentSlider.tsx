"use client";

import { useEffect, useState } from "react";
import type { Comment } from "@/lib/types";
import { UserIdentity } from "@/components/ui/UserIdentity";
import { timeAgo } from "@/lib/utils/time";

function CommentPreview({
  comment,
  compact,
}: {
  comment: Comment;
  compact: boolean;
}) {
  return (
    <>
      <div className="mb-1 flex items-center gap-2 min-w-0">
        <UserIdentity
          userId={comment.userId}
          name={comment.userName}
          avatar={comment.userAvatar}
          size={compact ? "xxs" : "xs"}
          nameClassName={`truncate font-medium text-ink ${
            compact ? "text-[11px]" : "text-xs"
          }`}
          className="flex items-center gap-2 min-w-0 shrink"
        />
        <span
          className={`ml-auto shrink-0 text-subtle ${
            compact ? "text-[10px]" : "text-[11px]"
          }`}
        >
          {timeAgo(comment.createdAt)}
        </span>
      </div>
      <p
        className={`leading-snug text-body ${
          compact ? "text-[11px] line-clamp-1" : "text-xs line-clamp-3"
        }`}
      >
        {comment.parentId && <span className="mr-1 text-subtle">↳</span>}
        {comment.body}
      </p>
    </>
  );
}

const DEFAULT_AUTO_PLAY_MS = 5000;

export function CommentSlider({
  comments,
  compact = false,
  autoPlayMs = DEFAULT_AUTO_PLAY_MS,
}: {
  comments: Comment[];
  compact?: boolean;
  /** Auto-rotate interval in ms. Pass 0 to disable. */
  autoPlayMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [comments]);

  useEffect(() => {
    if (comments.length <= 1 || autoPlayMs <= 0) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % comments.length);
    }, autoPlayMs);
    return () => clearInterval(timer);
  }, [comments.length, autoPlayMs]);

  if (comments.length === 0) return null;

  const comment = comments[index];

  return (
    <div className={compact ? "" : "mt-3"}>
      <div
        className={`rounded-xl border border-line bg-surface/80 ${
          compact ? "p-2.5" : "p-3"
        }`}
      >
        <div key={comment.id} className="animate-fade-up [animation-duration:250ms]">
          <CommentPreview comment={comment} compact={compact} />
        </div>
      </div>

      {comments.length > 1 && (
        <div
          className="mt-1.5 flex items-center justify-center gap-1"
          role="tablist"
          aria-label="Comment previews"
        >
          {comments.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index ? "true" : "false"}
              aria-label={`Show comment ${i + 1} of ${comments.length}`}
              onClick={() => setIndex(i)}
              className={`rounded-full transition-all ${
                i === index
                  ? "h-1.5 w-1.5 bg-ink"
                  : "h-1.5 w-1.5 bg-line hover:bg-mute"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
