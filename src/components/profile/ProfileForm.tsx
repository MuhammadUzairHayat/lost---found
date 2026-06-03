"use client";

import { useEffect, useState } from "react";
import { ContactFields } from "@/components/ui/ContactFields";
import { useProfile } from "@/components/profile/ProfileProvider";
import { emptyContact } from "@/lib/db/profile";

export function ProfileForm() {
  const { profile, setProfile, clearProfile, ready } = useProfile();
  const [name, setName] = useState("");
  const [contact, setContact] = useState(emptyContact());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setContact(profile.contact);
    }
  }, [profile]);

  if (!ready) {
    return <p className="text-sm text-mute">Loading…</p>;
  }

  const save = async () => {
    if (!name.trim()) return;
    setError("");
    setLoading(true);
    try {
      await setProfile(name.trim(), contact);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 max-w-md space-y-6">
      <p className="text-description">
        Your profile is tied to your account. Name and contact appear on posts
        you create and when you raise a hand — visible immediately to others.
      </p>
      <label className="field-label">
        Display name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field-input"
        />
      </label>
      <ContactFields contact={contact} onChange={setContact} />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="rounded-full bg-ink text-paper px-5 py-2 text-sm disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save profile"}
        </button>
        <button
          type="button"
          onClick={clearProfile}
          className="rounded-full border border-line px-5 py-2 text-sm text-mute hover:text-ink"
        >
          Sign out
        </button>
      </div>
      {error && <p className="text-error">{error}</p>}
      {saved && (
        <p className="text-xs text-mute animate-fade-up">Profile saved.</p>
      )}
    </div>
  );
}
