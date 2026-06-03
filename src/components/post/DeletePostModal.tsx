"use client";

import { UserAvatar } from "@/components/ui/UserAvatar";

export function DeletePostModal({
  postTitle,
  authorName,
  authorAvatar,
  onClose,
  onConfirm,
  loading,
  error,
}: {
  postTitle: string;
  authorName: string;
  authorAvatar?: string | null;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  error?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-post-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl border border-line bg-paper p-5 shadow-2xl animate-fade-up sm:rounded-2xl">
        <div className="flex flex-col items-center text-center">
          <UserAvatar
            name={authorName}
            avatar={authorAvatar}
            size="md"
          />
          <h2
            id="delete-post-title"
            className="mt-4 text-sm font-semibold text-ink"
          >
            Delete this post?
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-body">
            <span className="font-medium text-ink">{postTitle}</span> will be
            removed permanently, including all comments and raised hands.
          </p>
        </div>

        {error && <p className="mt-4 text-center text-xs text-ink">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border border-line px-4 py-2 text-sm text-body hover:border-ink/30 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete post"}
          </button>
        </div>
      </div>
    </div>
  );
}
