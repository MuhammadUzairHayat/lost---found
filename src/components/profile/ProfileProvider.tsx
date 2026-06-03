"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { saveProfile } from "@/lib/db/profile";
import type { UserProfile } from "@/lib/types";
import type { ContactInfo } from "@/lib/types";

interface ProfileContextValue {
  profile: UserProfile | null;
  ready: boolean;
  isProfileComplete: boolean;
  setProfile: (name: string, contact: ContactInfo) => Promise<void>;
  clearProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const PROFILE_SETUP = "/profile/setup";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        const next: UserProfile = {
          id: data.user.id,
          name: data.user.name,
          contact: data.user.contact,
          avatar: data.user.avatar ?? null,
        };
        saveProfile(next);
        setProfileState(next);
        setIsProfileComplete(data.user.isProfileComplete === true);
      } else {
        setProfileState(null);
        setIsProfileComplete(false);
      }
    } catch {
      setProfileState(null);
      setIsProfileComplete(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile().finally(() => setReady(true));
  }, [refreshProfile]);

  useEffect(() => {
    if (!ready || !profile) return;
    if (isProfileComplete) return;
    if (pathname === PROFILE_SETUP) return;
    if (pathname.startsWith("/api/")) return;

    router.push(
      `${PROFILE_SETUP}?callbackUrl=${encodeURIComponent(pathname)}`
    );
  }, [ready, profile, isProfileComplete, pathname, router]);

  const setProfile = useCallback(
    async (name: string, contact: ContactInfo) => {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");
      const next: UserProfile = {
        id: data.user.id,
        name: data.user.name,
        contact: data.user.contact,
        avatar: data.user.avatar ?? null,
      };
      saveProfile(next);
      setProfileState(next);
      setIsProfileComplete(data.user.isProfileComplete === true);
    },
    []
  );

  const clearProfile = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("lost-found-profile");
    setProfileState(null);
    setIsProfileComplete(false);
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        ready,
        isProfileComplete,
        setProfile,
        clearProfile,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
