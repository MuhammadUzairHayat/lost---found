"use client";

import { useCallback, useEffect, useState } from "react";
import { ProfileLink } from "@/components/ui/ProfileLink";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useProfile } from "@/components/profile/ProfileProvider";
import type { Hand, HandMessageWithReplies, Post } from "@/lib/types";
import { timeAgo } from "@/lib/utils/time";

function MessageNode({
  node,
  depth,
  canReply,
  onReply,
}: {
  node: HandMessageWithReplies;
  depth: number;
  canReply: boolean;
  onReply: (id: string, userName: string) => void;
}) {
  return (
    <li className={depth > 0 ? "ml-4 border-l border-line pl-3" : ""}>
      <div className="flex gap-2 py-2">
        <UserAvatar
          name={node.userName}
          avatar={node.userAvatar}
          size="xxxs"
          userId={node.userId}
          linkToProfile
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <ProfileLink
              userId={node.userId}
              name={node.userName}
              className="text-xs font-medium text-ink"
            />
            <span className="text-[10px] text-mute">{timeAgo(node.createdAt)}</span>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-body whitespace-pre-wrap">
            {node.body}
          </p>
          {canReply && depth < 4 && (
            <button
              type="button"
              onClick={() => onReply(node.id, node.userName)}
              className="mt-1 text-[10px] text-mute underline hover:text-ink"
            >
              Reply
            </button>
          )}
        </div>
      </div>
      {node.replies.length > 0 && (
        <ul>
          {node.replies.map((reply) => (
            <MessageNode
              key={reply.id}
              node={reply}
              depth={depth + 1}
              canReply={canReply}
              onReply={onReply}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function HandMessagesThread({
  hand,
  post,
}: {
  hand: Hand;
  post: Post;
}) {
  const { profile, ready } = useProfile();
  const [tree, setTree] = useState<HandMessageWithReplies[]>([]);
  const [total, setTotal] = useState(0);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; userName: string } | null>(
    null
  );

  const canSend =
    ready &&
    profile &&
    (profile.id === hand.userId || profile.id === post.authorId);

  const refresh = useCallback(async () => {
    const res = await fetch(
      `/api/posts/hand/messages?handId=${encodeURIComponent(hand.id)}`
    );
    if (!res.ok) return;
    const data = await res.json();
    setTree(data.messages);
    setTotal(data.total);
  }, [hand.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submit = async () => {
    setError("");
    if (!profile) {
      setError("Sign in to send a message.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/posts/hand/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handId: hand.id,
          body,
          parentId: replyTo?.id ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setBody("");
      setReplyTo(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="text-[10px] uppercase tracking-wider text-mute font-medium mb-2">
        Messages
        {total > 0 && (
          <span className="ml-1 font-normal tabular-nums">({total})</span>
        )}
      </p>

      {total === 0 && !canSend && (
        <p className="text-xs text-mute py-1">No messages yet.</p>
      )}

      {total > 0 && (
        <ul className="mb-2">
          {tree.map((node) => (
            <MessageNode
              key={node.id}
              node={node}
              depth={0}
              canReply={!!canSend}
              onReply={(id, userName) => setReplyTo({ id, userName })}
            />
          ))}
        </ul>
      )}

      {canSend ? (
        <div className="space-y-2">
          {replyTo && (
            <p className="text-[10px] text-mute">
              Replying to {replyTo.userName}{" "}
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="underline hover:text-ink"
              >
                cancel
              </button>
            </p>
          )}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            className="field-input resize-none text-xs"
            placeholder="Message the poster or helper…"
          />
          {error && <p className="text-xs text-ink">{error}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={loading || !body.trim()}
            className="rounded-full bg-ink px-3 py-1.5 text-xs text-paper disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
      ) : (
        <p className="text-[10px] text-mute leading-relaxed">
          Only the poster and {hand.userName} can send messages here. Everyone can
          read them.
        </p>
      )}
    </div>
  );
}
