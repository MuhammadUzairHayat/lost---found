"use client";

import { useState } from "react";
import { HandIcon } from "@/components/ui/HandIcon";

export function RaiseHandModal({
  onClose,
  onSubmit,
  loading,
}: {
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  loading?: boolean;
}) {
  const [note, setNote] = useState("");

  const submit = async () => {
    await onSubmit(note);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="raise-hand-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-line bg-paper p-5 shadow-2xl animate-fade-up sm:rounded-2xl">
        <div className="mb-4 flex items-center gap-2">
          <HandIcon className="h-5 w-5" />
          <h2 id="raise-hand-title" className="text-sm font-semibold">
            Raise your hand
          </h2>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-body">
          Say where or when you saw it, or how you can help. One hand per post.
        </p>
        <label className="field-label">
          Your message
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="field-input resize-none"
            placeholder="e.g. Saw it near the library yesterday…"
            autoFocus
          />
        </label>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-line px-4 py-2 text-sm text-body hover:border-ink/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
          >
            <HandIcon className="h-4 w-4" filled />
            {loading ? "Saving…" : "Raise hand"}
          </button>
        </div>
      </div>
    </div>
  );
}
