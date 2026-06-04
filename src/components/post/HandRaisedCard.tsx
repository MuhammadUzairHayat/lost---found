"use client";

import { useEffect, useState } from "react";
import { ProfileLink } from "@/components/ui/ProfileLink";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { Hand } from "@/lib/types";

export function HandRaisedCard({
  hand,
  highlight,
  isOwn = false,
  onUpdated,
  onRemoved,
}: {
  hand: Hand;
  highlight?: boolean;
  isOwn?: boolean;
  onUpdated?: (hand: Hand) => void;
  onRemoved?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(hand.note);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) setNote(hand.note);
  }, [hand.note, editing]);

  const saveNote = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/posts/hand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: hand.postId, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setEditing(false);
      onUpdated?.(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const lowerHand = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/posts/hand?postId=${encodeURIComponent(hand.postId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove hand");
      onRemoved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight ? "border-ink bg-ink/5" : "border-line"
      }`}
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          name={hand.userName}
          avatar={hand.userAvatar}
          size="xs"
          userId={hand.userId}
          linkToProfile
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <ProfileLink
              userId={hand.userId}
              name={hand.userName}
              className="text-sm font-medium text-ink"
            />
            {isOwn && !editing && (
              <span className="rounded-full border border-ink/30 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-mute">
                Your hand
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-mute">
            {hand.studentId && <span>ID {hand.studentId}</span>}
            {hand.department && <span>{hand.department}</span>}
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <label className="field-label">
                Your message
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="field-input resize-none text-xs"
                  autoFocus
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveNote}
                  disabled={loading}
                  className="rounded-full bg-ink px-3 py-1.5 text-xs text-paper disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNote(hand.note);
                    setEditing(false);
                    setError("");
                  }}
                  className="text-xs text-mute underline hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : note ? (
            <p className="mt-2 text-xs leading-relaxed text-body whitespace-pre-wrap">
              {note}
            </p>
          ) : (
            <p className="mt-2 text-xs text-subtle italic">
              No description provided.
            </p>
          )}

          {isOwn && !editing && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setNote(hand.note);
                  setEditing(true);
                  setError("");
                }}
                className="text-[10px] font-medium uppercase tracking-wide text-mute hover:text-ink"
              >
                Edit
              </button>
              {!confirmRemove ? (
                <button
                  type="button"
                  onClick={() => setConfirmRemove(true)}
                  className="text-[10px] font-medium uppercase tracking-wide text-mute hover:text-ink"
                >
                  Lower hand
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={lowerHand}
                    disabled={loading}
                    className="text-[10px] font-medium uppercase tracking-wide text-ink disabled:opacity-50"
                  >
                    {loading ? "…" : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(false)}
                    className="text-[10px] text-mute underline hover:text-ink"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}

          {error && <p className="mt-2 text-xs text-ink">{error}</p>}
        </div>
      </div>
    </div>
  );
}
