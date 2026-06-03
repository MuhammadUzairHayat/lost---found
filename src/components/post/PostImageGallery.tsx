"use client";

import { useState } from "react";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

export function PostImageGallery({
  images,
  title,
  overlay,
}: {
  images: string[];
  title: string;
  overlay?: React.ReactNode;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const open = (index: number) => setLightboxIndex(index);
  const close = () => setLightboxIndex(null);
  const goPrev = () =>
    setLightboxIndex((i) =>
      i == null ? null : (i - 1 + images.length) % images.length
    );
  const goNext = () =>
    setLightboxIndex((i) => (i == null ? null : (i + 1) % images.length));

  return (
    <div className="relative">
      <div
        className={
          images.length === 1
            ? ""
            : "grid gap-2 sm:grid-cols-2"
        }
      >
        {images.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={() => open(index)}
            className="group overflow-hidden rounded-xl border border-line text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
            aria-label={`View ${title} photo ${index + 1} full screen`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${title} photo ${index + 1}`}
              className="aspect-[4/3] w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] cursor-zoom-in"
            />
          </button>
        ))}
      </div>
      {overlay && (
        <div className="absolute bottom-3 right-3 flex flex-wrap items-center justify-end gap-2 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          {overlay}
        </div>
      )}
      {lightboxIndex != null && (
        <ImageLightbox
          src={images[lightboxIndex]}
          alt={`${title} photo ${lightboxIndex + 1}`}
          onClose={close}
          onPrev={images.length > 1 ? goPrev : undefined}
          onNext={images.length > 1 ? goNext : undefined}
          index={lightboxIndex}
          total={images.length}
        />
      )}
    </div>
  );
}
