"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, POST_TYPES } from "@/lib/constants/constants";
import { useProfile } from "@/components/profile/ProfileProvider";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { MAX_POST_IMAGES } from "@/lib/validation/images";
import type { CategoryId, PostTypeId } from "@/lib/constants/constants";

export function NewPostForm() {
  const router = useRouter();
  const { profile, ready } = useProfile();
  const toast = useToast();
  const [type, setType] = useState<PostTypeId>("lost");
  const [category, setCategory] = useState<CategoryId>("other");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [important, setImportant] = useState(false);
  const [loading, setLoading] = useState(false);

  const showImageError = (message: string) => toast.warning(message);

  const uploadImage = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      showImageError("Images must be JPG, PNG, or WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showImageError("Each image must be less than 5MB.");
      return;
    }
    if (images.length >= MAX_POST_IMAGES) {
      showImageError(`Maximum ${MAX_POST_IMAGES} images allowed.`);
      return;
    }

    setUploadingCount((count) => count + 1);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", "post");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        showImageError(data.error ?? "Failed to upload image.");
        return;
      }

      setImages((prev) => [...prev, data.url]);
    } catch {
      showImageError("Failed to upload image.");
    } finally {
      setUploadingCount((count) => count - 1);
    }
  };

  const onImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    for (const file of files) {
      if (images.length + uploadingCount >= MAX_POST_IMAGES) {
        showImageError(`Maximum ${MAX_POST_IMAGES} images allowed.`);
        break;
      }
      await uploadImage(file);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      toast.warning("Sign in to publish a post.");
      return;
    }
    if (!profile.name?.trim()) {
      toast.warning("Complete your profile before posting.");
      return;
    }
    if (!title.trim()) {
      toast.warning("Enter a title.");
      return;
    }
    if (images.length === 0) {
      showImageError("At least one image is required.");
      return;
    }
    if (uploadingCount > 0) {
      showImageError("Wait for uploads to finish.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          category,
          title,
          description,
          location,
          images,
          important,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors?.images) {
          showImageError(data.errors.images);
        }
        throw new Error(data.error || data.errors?.title || "Failed to create post");
      }
      toast.success("Post published.");
      router.push(`/posts/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return <p className="text-sm text-mute">Loading…</p>;
  }

  const isUploading = uploadingCount > 0;

  return (
    <form onSubmit={submit} className="mt-8 space-y-8 max-w-xl">
      <fieldset>
        <legend className="text-xs uppercase tracking-wider text-mute mb-2">
          Post type
        </legend>
        <div className="flex gap-2">
          {POST_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`rounded-full px-4 py-2 text-sm border ${
                type === t.id
                  ? "bg-ink text-paper border-ink"
                  : "border-line text-mute"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="field-label">
        Category
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryId)}
          className="field-input"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        Title *
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="field-input"
          placeholder="What was lost or found?"
        />
      </label>

      <label className="field-label">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="field-input resize-none"
        />
      </label>

      <label className="field-label">
        Location
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="field-input"
          placeholder="Area, building, street…"
        />
      </label>

      <fieldset className="space-y-3">
        <legend className="field-label">
          Photos * <span className="font-normal text-subtle">(at least 1, up to {MAX_POST_IMAGES})</span>
        </legend>

        {images.length > 0 && (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((url, index) => (
              <li key={url} className="relative aspect-square overflow-hidden rounded-lg border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 rounded-full bg-ink/80 px-1.5 py-0.5 text-[10px] text-paper hover:bg-ink"
                  aria-label={`Remove image ${index + 1}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <label
          className={`inline-block rounded-full border border-line px-4 py-2 text-xs hover:border-ink/40 ${
            isUploading || images.length >= MAX_POST_IMAGES
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer"
          }`}
        >
          {isUploading ? "Uploading…" : "Add photos"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            disabled={isUploading || images.length >= MAX_POST_IMAGES}
            onChange={onImagesChange}
          />
        </label>

      </fieldset>

      <label className="flex items-center gap-2 text-sm text-body cursor-pointer">
        <input
          type="checkbox"
          checked={important}
          onChange={(e) => setImportant(e.target.checked)}
          className="rounded border-line"
        />
        Mark as important (shows a star on the post)
      </label>

      <p className="text-[10px] text-mute">
        Posted as {profile?.name || "you"}. Contact on this post comes from your{" "}
        <Link href="/profile" className="underline hover:text-ink">
          profile
        </Link>
        .
      </p>

      <button
        type="submit"
        disabled={loading || isUploading}
        className="rounded-full bg-ink text-paper px-6 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Publishing…" : "Publish post"}
      </button>
    </form>
  );
}
