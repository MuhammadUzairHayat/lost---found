"use client";

import { useState } from "react";
import Link from "next/link";
import { generateAvatar } from "@/lib/constants/avatar";
import { userProfileHref } from "@/lib/users/profile-url";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

const SIZE_CLASSES = {
  xxxs: "h-5 w-5 text-[8px]",
  xxs: "h-7 w-7 text-[10px]",
  xs: "h-8 w-8 text-xs",
  sm: "h-10 w-10 text-sm",
  md: "h-20 w-20 text-2xl",
  lg: "h-[120px] w-[120px] text-4xl",
} as const;

export function UserAvatar({
  name,
  avatar,
  size = "sm",
  userId,
  linkToProfile = false,
  previewImage = true,
}: {
  name: string;
  avatar?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  /** When set, generated avatars link to profile; photo avatars open lightbox on click. */
  userId?: string;
  linkToProfile?: boolean;
  /** Open full-screen preview when clicking a photo avatar. */
  previewImage?: boolean;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const sizeClass = SIZE_CLASSES[size];

  if (avatar) {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt=""
        className={`${sizeClass} rounded-full object-cover border border-line ${
          previewImage ? "cursor-zoom-in" : ""
        }`}
      />
    );

    const photoAvatar = previewImage ? (
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
        aria-label={`View ${name}'s profile photo`}
      >
        {img}
      </button>
    ) : (
      img
    );

    return (
      <>
        {photoAvatar}
        {lightboxOpen && (
          <ImageLightbox
            src={avatar}
            alt={name}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </>
    );
  }

  const { text, color } = generateAvatar(name);
  const generated = (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${
        linkToProfile && userId ? "cursor-pointer" : ""
      }`}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {text}
    </div>
  );

  if (linkToProfile && userId) {
    return (
      <Link
        href={userProfileHref(userId)}
        className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
        aria-label={`${name}'s profile`}
      >
        {generated}
      </Link>
    );
  }

  return generated;
}
