"use client";

import { useState } from "react";
import { HandIcon } from "@/components/ui/HandIcon";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { Hand } from "@/lib/types";

export function MyHandModal({
  hand,
  onClose,
  onSave,
  onRemove,
  loading,
  error,
}: {
  hand: Hand;
  onClose: () => void;
  onSave: (note: string) => Promise<void>;
  onRemove: () => Promise<void>;
  loading?: boolean;
  error?: string;
}) {
  const [note, setNote] = useState(hand.note);
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-hand-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-line bg-paper p-5 shadow-2xl animate-fade-up sm:rounded-2xl">
        <div className="mb-4 flex items-center gap-2">
          <HandIcon className="h-5 w-5" filled />
          <h2 id="my-hand-title" className="text-sm font-semibold">
            Your raised hand
          </h2>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-xl border border-line bg-line/20 p-3">
          <UserAvatar
            name={hand.userName}
            avatar={hand.userAvatar}
            size="sm"
          />
          <div className="min-w-0 text-xs text-mute">
            <p className="font-medium text-ink text-sm">{hand.userName}</p>
            {hand.studentId && <p>ID {hand.studentId}</p>}
            {hand.department && <p>{hand.department}</p>}
          </div>
        </div>

        <label className="field-label">
          Your message
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="field-input resize-none"
          />
        </label>

        {error && <p className="mt-2 text-xs text-ink">{error}</p>}

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onSave(note)}
            disabled={loading}
            className="rounded-full bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
          {confirmRemove ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                className="flex-1 rounded-full border border-line px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onRemove}
                disabled={loading}
                className="flex-1 rounded-full border border-ink px-4 py-2 text-sm text-ink disabled:opacity-50"
              >
                Confirm remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="text-xs text-mute underline hover:text-ink"
            >
              Lower hand
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
