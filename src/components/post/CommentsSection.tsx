"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CommentSlider } from "@/components/post/CommentSlider";
import { UserIdentity } from "@/components/ui/UserIdentity";
import { useProfile } from "@/components/profile/ProfileProvider";
import { useToast } from "@/components/ui/toast/ToastProvider";
import type { Comment, CommentWithReplies } from "@/lib/types";
import { timeAgo } from "@/lib/utils/time";

const PREVIEW_COUNT = 4;

export function CommentsSection({
  postId,
  postAuthorId,
  initialComments,
  initialTotal,
}: {
  postId: string;
  postAuthorId: string;
  initialComments: CommentWithReplies[];
  initialTotal: number;
}) {
  const { profile, ready } = useProfile();
  const toast = useToast();
  const [expanded, setExpanded] = useState(false);
  const [tree, setTree] = useState(initialComments);
  const [total, setTotal] = useState(initialTotal);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; userName: string } | null>(
    null
  );

  const refresh = useCallback(async () => {
    const res = await fetch(
      `/api/posts/comments?postId=${encodeURIComponent(postId)}`
    );
    if (!res.ok) return;
    const data = await res.json();
    setTree(data.comments);
    setTotal(data.total);
  }, [postId]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#comments") {
      setExpanded(true);
    }
  }, []);

  const previewFlat: Comment[] = [];
  const collectPreview = (nodes: CommentWithReplies[]) => {
    for (const node of [...nodes].reverse()) {
      if (previewFlat.length >= PREVIEW_COUNT) return;
      const { replies, ...comment } = node;
      previewFlat.push(comment);
      if (replies.length > 0) collectPreview(replies);
    }
  };
  collectPreview(tree);
  previewFlat.reverse();

  const submit = async (parentId: string | null = null) => {
    if (!profile) {
      toast.warning("Sign in and complete your profile to comment.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/posts/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body, parentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");
      setBody("");
      setReplyTo(null);
      await refresh();
      if (!expanded) setExpanded(true);
      toast.success(parentId ? "Reply posted." : "Comment posted.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const editComment = async (commentId: string, text: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/posts/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, body: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update comment");
      await refresh();
      toast.success("Comment updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      throw e;
    } finally {
      setActionLoading(false);
    }
  };

  const removeComment = async (commentId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/posts/comments?commentId=${encodeURIComponent(commentId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete comment");
      await refresh();
      toast.success("Comment deleted.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section id="comments" className="rounded-2xl border border-line p-5 scroll-mt-24">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 className="text-xs uppercase tracking-wider text-mute font-medium">
          Comments
        </h2>
        {total > 0 && (
          <span className="text-[10px] text-mute tabular-nums">
            {total} {total === 1 ? "comment" : "comments"}
          </span>
        )}
      </div>

      {!expanded && total > 0 && (
        <>
          <CommentSlider comments={previewFlat} />
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-3 text-xs text-mute underline hover:text-ink"
          >
            Show all comments
          </button>
        </>
      )}

      {expanded && (
        <div className="mt-4 space-y-4">
          {tree.length === 0 ? (
            <p className="text-sm text-body">No comments yet. Start the conversation.</p>
          ) : (
            tree.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                depth={0}
                currentUserId={profile?.id}
                postAuthorId={postAuthorId}
                onEditComment={editComment}
                onDeleteComment={removeComment}
                actionLoading={actionLoading}
                replyToId={replyTo?.id ?? null}
                onReply={(id, userName) => {
                  setReplyTo({ id, userName });
                  setBody("");
                }}
                onCancelReply={() => setReplyTo(null)}
                replyBody={replyTo?.id === comment.id ? body : ""}
                onReplyBodyChange={setBody}
                onSubmitReply={() => submit(comment.id)}
                replyLoading={loading}
                nestedReplyTo={replyTo}
                nestedBody={body}
                onNestedReply={setReplyTo}
                onNestedBodyChange={setBody}
                onNestedSubmit={submit}
                nestedLoading={loading}
              />
            ))
          )}
        </div>
      )}

      <div className={`${expanded ? "mt-5 pt-4 border-t border-line" : "mt-4"}`}>
        {replyTo && expanded && (
          <p className="text-xs text-mute mb-2">
            Replying to{" "}
            <span className="text-ink font-medium">{replyTo.userName}</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="ml-2 underline hover:text-ink"
            >
              Cancel
            </button>
          </p>
        )}
        {!ready ? (
          <p className="text-sm text-mute">Loading profile…</p>
        ) : !profile ? (
          <p className="text-xs text-mute">
            <Link href="/login" className="underline hover:text-ink">
              Sign in
            </Link>{" "}
            to leave a comment.
          </p>
        ) : (
          <div className="space-y-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              aria-label="Comment"
              placeholder={
                replyTo && expanded
                  ? `Reply to ${replyTo.userName}…`
                  : "Add a comment…"
              }
              className="field-input resize-none"
            />
            <button
              type="button"
              onClick={() => submit(replyTo && expanded ? replyTo.id : null)}
              disabled={loading || !body.trim()}
              className="rounded-full bg-ink text-paper px-4 py-2 text-sm disabled:opacity-50"
            >
              {loading ? "Posting…" : replyTo && expanded ? "Reply" : "Comment"}
            </button>
          </div>
        )}
      </div>

      {!expanded && total === 0 && (
        <p className="text-sm text-mute mt-2">No comments yet.</p>
      )}
    </section>
  );
}

function CommentThread({
  comment,
  depth,
  currentUserId,
  postAuthorId,
  onEditComment,
  onDeleteComment,
  actionLoading,
  replyToId,
  onReply,
  onCancelReply,
  replyBody,
  onReplyBodyChange,
  onSubmitReply,
  replyLoading,
  nestedReplyTo,
  nestedBody,
  onNestedReply,
  onNestedBodyChange,
  onNestedSubmit,
  nestedLoading,
}: {
  comment: CommentWithReplies;
  depth: number;
  currentUserId?: string;
  postAuthorId: string;
  onEditComment: (commentId: string, body: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  actionLoading: boolean;
  replyToId: string | null;
  onReply: (id: string, userName: string) => void;
  onCancelReply: () => void;
  replyBody: string;
  onReplyBodyChange: (v: string) => void;
  onSubmitReply: () => void;
  replyLoading: boolean;
  nestedReplyTo: { id: string; userName: string } | null;
  nestedBody: string;
  onNestedReply: (v: { id: string; userName: string } | null) => void;
  onNestedBodyChange: (v: string) => void;
  onNestedSubmit: (parentId: string) => void;
  nestedLoading: boolean;
}) {
  const [showReplies, setShowReplies] = useState(true);
  const isReplying = replyToId === comment.id;

  return (
    <div className={depth > 0 ? "ml-4 sm:ml-6 pl-3 border-l border-line" : ""}>
      <div className="flex gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <UserIdentity
              userId={comment.userId}
              name={comment.userName}
              avatar={comment.userAvatar}
              size="xs"
              nameClassName="text-xs font-medium"
            />
            <span className="text-[10px] text-mute">{timeAgo(comment.createdAt)}</span>
            {comment.userId === currentUserId && (
              <span className="text-[10px] text-mute">· you</span>
            )}
          </div>
          <CommentBody
            comment={comment}
            compact={false}
            currentUserId={currentUserId}
            onEdit={onEditComment}
            onDelete={onDeleteComment}
            actionLoading={actionLoading}
          />
          <div className="mt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => (isReplying ? onCancelReply() : onReply(comment.id, comment.userName))}
              className="text-[10px] text-mute hover:text-ink font-medium uppercase tracking-wide"
            >
              {isReplying ? "Cancel" : "Reply"}
            </button>
            {comment.replies.length > 0 && depth === 0 && (
              <button
                type="button"
                onClick={() => setShowReplies((v) => !v)}
                className="text-[10px] text-mute hover:text-ink"
              >
                {showReplies
                  ? `Hide ${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`
                  : `Show ${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`}
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-2 space-y-2">
              <textarea
                value={replyBody}
                onChange={(e) => onReplyBodyChange(e.target.value)}
                rows={2}
                placeholder={`Reply to ${comment.userName}…`}
                aria-label={`Reply to ${comment.userName}`}
                className="field-input resize-none"
                autoFocus
              />
              <button
                type="button"
                onClick={onSubmitReply}
                disabled={replyLoading || !replyBody.trim()}
                className="rounded-full bg-ink text-paper px-3 py-1.5 text-xs disabled:opacity-50"
              >
                {replyLoading ? "Posting…" : "Reply"}
              </button>
            </div>
          )}
        </div>
      </div>

      {showReplies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <NestedReply
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              postAuthorId={postAuthorId}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              actionLoading={actionLoading}
              replyTo={nestedReplyTo}
              body={nestedBody}
              onReply={onNestedReply}
              onBodyChange={onNestedBodyChange}
              onSubmit={onNestedSubmit}
              loading={nestedLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NestedReply({
  comment,
  currentUserId,
  postAuthorId,
  onEditComment,
  onDeleteComment,
  actionLoading,
  replyTo,
  body,
  onReply,
  onBodyChange,
  onSubmit,
  loading,
}: {
  comment: CommentWithReplies;
  currentUserId?: string;
  postAuthorId: string;
  onEditComment: (commentId: string, body: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  actionLoading: boolean;
  replyTo: { id: string; userName: string } | null;
  body: string;
  onReply: (v: { id: string; userName: string } | null) => void;
  onBodyChange: (v: string) => void;
  onSubmit: (parentId: string) => void;
  loading: boolean;
}) {
  const isReplying = replyTo?.id === comment.id;
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="ml-4 sm:ml-6 pl-3 border-l border-line">
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <UserIdentity
              userId={comment.userId}
              name={comment.userName}
              avatar={comment.userAvatar}
              size="xxs"
              nameClassName="text-[11px] font-medium"
            />
            <span className="text-[10px] text-mute">{timeAgo(comment.createdAt)}</span>
          </div>
          <CommentBody
            comment={comment}
            compact
            currentUserId={currentUserId}
            onEdit={onEditComment}
            onDelete={onDeleteComment}
            actionLoading={actionLoading}
          />
          <button
            type="button"
            onClick={() =>
              isReplying
                ? onReply(null)
                : onReply({ id: comment.id, userName: comment.userName })
            }
            className="mt-1 text-[10px] text-mute hover:text-ink font-medium uppercase tracking-wide"
          >
            {isReplying ? "Cancel" : "Reply"}
          </button>

          {isReplying && (
            <div className="mt-2 space-y-2">
              <textarea
                value={body}
                onChange={(e) => onBodyChange(e.target.value)}
                rows={2}
                aria-label={`Reply to ${comment.userName}`}
                placeholder={`Reply to ${comment.userName}…`}
                className="field-input resize-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => onSubmit(comment.id)}
                disabled={loading || !body.trim()}
                className="rounded-full bg-ink text-paper px-3 py-1.5 text-xs disabled:opacity-50"
              >
                {loading ? "Posting…" : "Reply"}
              </button>
            </div>
          )}

          {comment.replies.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowReplies((v) => !v)}
                className="mt-1 block text-[10px] text-mute hover:text-ink"
              >
                {showReplies
                  ? `Hide ${comment.replies.length} replies`
                  : `Show ${comment.replies.length} replies`}
              </button>
              {showReplies && (
                <div className="mt-2 space-y-2">
                  {comment.replies.map((r) => (
                    <NestedReply
                      key={r.id}
                      comment={r}
                      currentUserId={currentUserId}
                      postAuthorId={postAuthorId}
                      onEditComment={onEditComment}
                      onDeleteComment={onDeleteComment}
                      actionLoading={actionLoading}
                      replyTo={replyTo}
                      body={body}
                      onReply={onReply}
                      onBodyChange={onBodyChange}
                      onSubmit={onSubmit}
                      loading={loading}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentBody({
  comment,
  compact,
  currentUserId,
  onEdit,
  onDelete,
  actionLoading,
}: {
  comment: Comment;
  compact?: boolean;
  currentUserId?: string;
  onEdit: (commentId: string, body: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  actionLoading: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canEdit =
    Boolean(currentUserId) && currentUserId === comment.userId;
  const canDelete = canEdit;

  const saveEdit = async () => {
    if (!draft.trim()) return;
    try {
      await onEdit(comment.id, draft);
      setEditing(false);
    } catch {
      /* parent shows error */
    }
  };

  const textClass = compact
    ? "text-xs leading-relaxed text-body"
    : "text-sm leading-relaxed text-body";

  if (editing) {
    return (
      <div className="mt-0.5 space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={compact ? 2 : 3}
          className="field-input resize-none"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={saveEdit}
            disabled={actionLoading || !draft.trim()}
            className="rounded-full bg-ink px-3 py-1 text-xs text-paper disabled:opacity-50"
          >
            {actionLoading ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(comment.body);
              setEditing(false);
            }}
            className="text-xs text-mute underline hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className={`mt-0.5 whitespace-pre-wrap break-words ${textClass}`}>
        {comment.body}
      </p>
      {(canEdit || canDelete) && (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setDraft(comment.body);
                setEditing(true);
              }}
              className="text-[10px] text-mute hover:text-ink font-medium uppercase tracking-wide"
            >
              Edit
            </button>
          )}
          {canDelete && !confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-[10px] text-mute hover:text-ink font-medium uppercase tracking-wide"
            >
              Delete
            </button>
          )}
          {confirmDelete && (
            <>
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                disabled={actionLoading}
                className="text-[10px] font-medium text-ink uppercase tracking-wide disabled:opacity-50"
              >
                {actionLoading ? "…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-[10px] text-mute underline hover:text-ink"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
