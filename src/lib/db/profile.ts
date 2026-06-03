import type { ContactInfo, UserProfile } from "../types";
import type { ContactMethodId } from "../constants/constants";

const STORAGE_KEY = "lost-found-profile";

export function getStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function emptyContact(method: ContactMethodId = "phone"): ContactInfo {
  return { method, phone: "", email: "", whatsapp: "" };
}
