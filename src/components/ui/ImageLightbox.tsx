"use client";

import { useEffect } from "react";

export function ImageLightbox({
  src,
  alt = "",
  onClose,
  onPrev,
  onNext,
  index,
  total,
}: {
  src: string;
  alt?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  index?: number;
  total?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext]);

  const showNav = total != null && total > 1 && index != null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-zoom-out"
        onClick={onClose}
        aria-label="Close"
      />
      {showNav && onPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-paper/30 bg-ink/60 px-3 py-2 text-paper hover:bg-ink/80 sm:left-4"
          aria-label="Previous image"
        >
          ←
        </button>
      )}
      {showNav && onNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-paper/30 bg-ink/60 px-3 py-2 text-paper hover:bg-ink/80 sm:right-4"
          aria-label="Next image"
        >
          →
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 rounded-full border border-paper/30 bg-ink/60 px-3 py-1.5 text-sm text-paper hover:bg-ink/80"
      >
        Close
      </button>
      {showNav && (
        <p className="absolute top-4 left-1/2 z-10 -translate-x-1/2 text-xs text-paper/70 tabular-nums">
          {index! + 1} / {total}
        </p>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="relative z-[1] max-h-full max-w-full object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
