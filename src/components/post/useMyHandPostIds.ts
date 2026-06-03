"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useProfile } from "@/components/profile/ProfileProvider";

export function useMyHandPostIds(): Set<string> {
  const { profile, ready } = useProfile();
  const pathname = usePathname();
  const [postIds, setPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!ready || !profile) {
      setPostIds(new Set());
      return;
    }
    let cancelled = false;
    fetch("/api/posts/hand/mine")
      .then((res) => (res.ok ? res.json() : { postIds: [] }))
      .then((data: { postIds?: string[] }) => {
        if (!cancelled) {
          setPostIds(new Set(data.postIds ?? []));
        }
      })
      .catch(() => {
        if (!cancelled) setPostIds(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [profile, ready, pathname]);

  return postIds;
}
