"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { categoryLabel } from "@/lib/constants/constants";
import { HandIcon } from "@/components/ui/HandIcon";
import { HandRaisedCard } from "@/components/post/HandRaisedCard";
import { HandMessagesThread } from "@/components/post/HandMessagesThread";
import { RaiseHandModal } from "@/components/post/RaiseHandModal";
import { MyHandModal } from "@/components/post/MyHandModal";
import { useProfile } from "@/components/profile/ProfileProvider";
import { handChipClass } from "@/components/post/handChip";
import { isPostOpenForHands } from "@/lib/posts/status";
import type { Hand, Post } from "@/lib/types";

type Modal = "raise" | "mine" | null;

export function HandsPageClient({
  initialPost,
  initialHands,
}: {
  initialPost: Post;
  initialHands: Hand[];
}) {
  const { profile, ready } = useProfile();
  const router = useRouter();
  const [post] = useState(initialPost);
  const [hands, setHands] = useState(initialHands);
  const [modal, setModal] = useState<Modal>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const myHand = hands.find((h) => h.userId === profile?.id);
  const isOwner = profile?.id === post.authorId;
  const canRaise =
    ready &&
    profile &&
    !isOwner &&
    !myHand &&
    isPostOpenForHands(post.status);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/posts/detail?id=${encodeURIComponent(post.id)}`);
    if (!res.ok) return;
    const data = await res.json();
    setHands(data.hands);
  }, [post.id]);

  const closeModal = () => {
    setModal(null);
    setError("");
  };

  const onTopHandClick = () => {
    setError("");
    if (myHand) {
      setModal("mine");
      return;
    }
    if (canRaise) {
      setModal("raise");
    }
  };

  const raiseHand = async (note: string) => {
    if (!profile) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/posts/hand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          userName: profile.name,
          note,
          contact: profile.contact,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await refresh();
      closeModal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const updateHand = async (note: string) => {
    if (!profile || !myHand) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/posts/hand`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await refresh();
      closeModal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const lowerHand = async () => {
    if (!profile) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/posts/hand?postId=${encodeURIComponent(post.id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      await refresh();
      closeModal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const showTopButton = canRaise || myHand;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-mute uppercase tracking-wide">
          <span
            className={`rounded-full px-2 py-0.5 font-medium ${
              post.type === "lost" ? "border border-ink" : "bg-ink text-paper"
            }`}
          >
            {post.type}
          </span>
          <span>{categoryLabel(post.category)}</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{post.title}</h1>
        <p className="text-sm text-body">{post.location}</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <HandIcon className="h-4 w-4" />
            Raised hands
            <span className="font-normal text-mute tabular-nums">
              ({hands.length})
            </span>
          </h2>
          <p className="mt-1 text-xs text-mute max-w-md">
            Everyone can read messages on each hand. Only the poster and the
            person who raised can reply.
          </p>
        </div>

        {showTopButton && (
          <button
            type="button"
            onClick={onTopHandClick}
            className={
              handChipClass(!!myHand) +
              " px-4 py-2 text-sm shrink-0 shadow-sm backdrop-blur-sm"
            }
          >
            <HandIcon className="h-4 w-4" filled={!!myHand} />
            {myHand ? "Your hand" : "Raise hand"}
          </button>
        )}
      </div>

      {!ready ? null : isOwner ? (
        <p className="text-sm text-mute rounded-xl border border-line p-4">
          You posted this. People who raise a hand appear below — you can message
          each of them directly.
        </p>
      ) : !profile ? (
        <p className="text-sm text-mute rounded-xl border border-line p-4">
          <Link href="/login" className="underline hover:text-ink">
            Sign in
          </Link>{" "}
          to raise your hand on this post.
        </p>
      ) : null}

      {hands.length === 0 ? (
        <div className="rounded-2xl border border-line px-6 py-12 text-center">
          <HandIcon className="h-8 w-8 mx-auto text-mute mb-3" />
          <p className="text-sm text-mute">No one has raised their hand yet.</p>
          {canRaise && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setModal("raise");
              }}
              className="mt-4 rounded-full bg-ink px-4 py-2 text-sm text-paper"
            >
              Be the first to raise your hand
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {hands.map((hand) => (
            <li
              key={hand.id}
              id={hand.userId === profile?.id ? "my-hand" : undefined}
              className="rounded-2xl border border-line p-4"
            >
              <HandRaisedCard hand={hand} highlight={hand.userId === profile?.id} />
              <HandMessagesThread hand={hand} post={post} />
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href={`/posts/${post.id}`}
          className="text-xs text-mute underline hover:text-ink"
        >
          ← Back to post
        </Link>
        <button
          type="button"
          onClick={() => router.push("/posts")}
          className="text-xs text-mute underline hover:text-ink"
        >
          Browse all posts
        </button>
      </div>

      {modal === "raise" && (
        <RaiseHandModal
          onClose={closeModal}
          onSubmit={raiseHand}
          loading={loading}
          error={error}
        />
      )}
      {modal === "mine" && myHand && (
        <MyHandModal
          hand={myHand}
          onClose={closeModal}
          onSave={updateHand}
          onRemove={lowerHand}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}
