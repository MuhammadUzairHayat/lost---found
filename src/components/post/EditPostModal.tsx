"use client";

import { useState } from "react";
import { CATEGORIES, POST_TYPES } from "@/lib/constants/constants";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { MAX_POST_IMAGES } from "@/lib/validation/images";
import type { CategoryId, PostTypeId } from "@/lib/constants/constants";
import type { Post } from "@/lib/types";

export function EditPostModal({
  post,
  onClose,
  onSaved,
}: {
  post: Post;
  onClose: () => void;
  onSaved: (post: Post) => void;
}) {
  const toast = useToast();
  const [type, setType] = useState<PostTypeId>(post.type);
  const [category, setCategory] = useState<CategoryId>(post.category);
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [location, setLocation] = useState(post.location);
  const [images, setImages] = useState<string[]>(post.images);
  const [uploadingCount, setUploadingCount] = useState(0);
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

    setUploadingCount((c) => c + 1);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", "post");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        showImageError(data.error ?? "Failed to upload image.");
        return;
      }
      setImages((prev) => [...prev, data.url]);
    } catch {
      showImageError("Failed to upload image.");
    } finally {
      setUploadingCount((c) => c - 1);
    }
  };

  const save = async () => {
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
      const res = await fetch("/api/posts/item", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          type,
          category,
          title,
          description,
          location,
          images,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors?.images) showImageError(data.errors.images);
        throw new Error(data.error || data.errors?.title || "Failed to update");
      }
      toast.success("Post updated.");
      onSaved({ ...post, ...data, contact: post.contact });
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-post-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-paper p-5 shadow-2xl sm:rounded-2xl">
        <h2 id="edit-post-title" className="text-sm font-semibold mb-4">
          Edit post
        </h2>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {POST_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`rounded-full px-3 py-1.5 text-xs border ${
                  type === t.id ? "bg-ink text-paper border-ink" : "border-line"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

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
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="field-input"
            />
          </label>

          <label className="field-label">
            Location
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="field-input"
            />
          </label>

          <label className="field-label">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="field-input resize-none"
            />
          </label>

          <div>
            <p className="field-label mb-2">Photos</p>
            <div className="flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute right-0 top-0 bg-ink/80 px-1 text-[10px] text-paper"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                for (const file of files) {
                  if (images.length + uploadingCount >= MAX_POST_IMAGES) break;
                  await uploadImage(file);
                }
              }}
              className="mt-2 text-xs"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-line px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="flex-1 rounded-full bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
