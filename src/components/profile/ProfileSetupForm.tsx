"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfile } from "@/components/profile/ProfileProvider";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { UserAvatar } from "@/components/ui/UserAvatar";

type ContactMethodOption = "EMAIL" | "PHONE" | "WHATSAPP";

const CONTACT_OPTIONS: { id: ContactMethodOption; label: string }[] = [
  { id: "EMAIL", label: "Email" },
  { id: "PHONE", label: "Phone" },
  { id: "WHATSAPP", label: "WhatsApp" },
];

export function ProfileSetupForm() {
  const router = useRouter();
  const { refreshProfile } = useProfile();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [contactMethod, setContactMethod] = useState<ContactMethodOption>("EMAIL");
  const [contactValue, setContactValue] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/posts";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/profile");
      if (!res.ok || cancelled) return;
      const data = await res.json();
      const p = data.profile;
      if (!p?.isProfileComplete) return;
      setEditMode(true);
      setName(p.name ?? "");
      setBio(p.bio ?? "");
      setStudentId(p.studentId ?? "");
      setDepartment(p.department ?? "");
      if (p.contactMethod) setContactMethod(p.contactMethod);
      setContactValue(p.contactValue ?? "");
      setAvatar(p.avatar ?? null);
      setPrefilled(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Image must be JPG, PNG, or WebP",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Image must be less than 5MB",
      }));
      return;
    }

    setAvatarUploading(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.avatar;
      return next;
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          avatar: data.error ?? "Failed to upload image.",
        }));
        return;
      }

      setAvatar(data.url);
    } catch {
      setErrors((prev) => ({
        ...prev,
        avatar: "Failed to upload image.",
      }));
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(
        editMode ? "/api/profile" : "/api/profile/setup",
        {
          method: editMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            bio: bio || undefined,
            studentId,
            department,
            contactMethod,
            contactValue,
            avatar,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ form: data.error || "Failed to save profile" });
        }
        return;
      }

      await refreshProfile();
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (editMode && !prefilled) {
    return <p className="mt-8 text-sm text-mute">Loading…</p>;
  }

  return (
    <form onSubmit={submit} className="mt-8 max-w-xl space-y-8">
      <section className="rounded-2xl border border-line p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold">Section 1: Personal Information</h2>
        <label className="field-label">
          Full Name <span className="text-ink">*</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field-input"
            placeholder="John Doe"
          />
          {errors.name && (
            <span className="mt-1 block text-error">{errors.name}</span>
          )}
        </label>
        <label className="field-label">
          Bio (Optional)
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            className="field-input resize-y"
            placeholder="I'm a Computer Science student passionate..."
          />
          <span className="mt-1 block text-[10px] text-mute">
            Max 200 characters ({bio.length}/200)
          </span>
          {errors.bio && (
            <span className="mt-1 block text-error">{errors.bio}</span>
          )}
        </label>
      </section>

      <section className="rounded-2xl border border-line p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold">Section 2: University Information</h2>
        <label className="field-label">
          Student ID <span className="text-ink">*</span>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value.toUpperCase())}
            className="field-input font-mono"
            placeholder="FA24-BSCS-0295"
          />
          <span className="mt-1 block text-[10px] text-mute">
            Format: XX99-XXXX-9999 (e.g., FA24-BSCS-0295)
          </span>
          {errors.studentId && (
            <span className="mt-1 block text-error">
              {errors.studentId}
            </span>
          )}
        </label>
        <label className="field-label">
          Department <span className="text-ink">*</span>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="field-input"
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.department && (
            <span className="mt-1 block text-error">
              {errors.department}
            </span>
          )}
        </label>
      </section>

      <section className="rounded-2xl border border-line p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold">Section 3: Profile Picture (Optional)</h2>
        <div className="flex items-center gap-4">
          <UserAvatar name={name || "?"} avatar={avatar} size="md" />
          <div>
            <label className={`inline-block rounded-full border border-line px-4 py-2 text-xs hover:border-ink/40 ${avatarUploading ? "cursor-wait opacity-60" : "cursor-pointer"}`}>
              {avatarUploading ? "Uploading..." : "Upload Photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={avatarUploading}
                onChange={onAvatarChange}
              />
            </label>
            <p className="mt-2 text-[10px] text-mute max-w-xs">
              If no photo, we&apos;ll create an avatar for you
            </p>
            {errors.avatar && (
              <p className="mt-1 text-error">{errors.avatar}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold">Section 4: Contact Preferences</h2>
        <fieldset>
          <legend className="text-xs text-mute mb-2">
            How should people contact you? <span className="text-ink">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {CONTACT_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                  contactMethod === opt.id
                    ? "bg-ink text-paper border-ink"
                    : "border-line text-mute hover:border-ink/40"
                }`}
              >
                <input
                  type="radio"
                  name="contactMethod"
                  value={opt.id}
                  checked={contactMethod === opt.id}
                  onChange={() => setContactMethod(opt.id)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {errors.contactMethod && (
            <p className="mt-1 text-error">{errors.contactMethod}</p>
          )}
        </fieldset>
        <label className="field-label">
          Your Contact <span className="text-ink">*</span>
          <input
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            className="field-input"
            placeholder={
              contactMethod === "EMAIL"
                ? "john.doe@university.edu"
                : "+12345678901"
            }
          />
          {errors.contactValue && (
            <span className="mt-1 block text-error">
              {errors.contactValue}
            </span>
          )}
        </label>
      </section>

      <p className="text-xs text-mute rounded-xl border border-line/80 bg-line/20 px-4 py-3">
        All fields marked with * are required
      </p>

      {errors.form && <p className="text-error">{errors.form}</p>}

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-full border border-line px-5 py-2 text-sm text-mute hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-ink text-paper px-5 py-2 text-sm disabled:opacity-60"
        >
          {loading
            ? "Saving…"
            : editMode
              ? "Save changes"
              : "Complete Profile"}
        </button>
      </div>
    </form>
  );
}
