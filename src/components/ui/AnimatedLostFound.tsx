"use client";

import { useEffect, useState } from "react";

type Phase = "idle" | "lost-in" | "lost-hold" | "lost-out" | "found-in" | "done";

const LOST_MS = 700;
const HOLD_MS = 900;
const OUT_MS = 450;
const FOUND_MS = 700;

export function AnimatedLostFound({ className = "" }: { className?: string }) {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("lost-in"), 80);
    const t2 = setTimeout(() => setPhase("lost-hold"), LOST_MS + 80);
    const t3 = setTimeout(() => setPhase("lost-out"), LOST_MS + HOLD_MS + 80);
    const t4 = setTimeout(
      () => setPhase("found-in"),
      LOST_MS + HOLD_MS + OUT_MS + 80
    );
    const t5 = setTimeout(
      () => setPhase("done"),
      LOST_MS + HOLD_MS + OUT_MS + FOUND_MS + 80
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const showLost =
    phase === "lost-in" || phase === "lost-hold" || phase === "lost-out";
  const showFound = phase === "found-in" || phase === "done";

  const lostAnim =
    phase === "lost-in"
      ? "animate-hero-lost-in"
      : phase === "lost-out"
        ? "animate-hero-lost-out"
        : "";

  const foundAnim =
    phase === "found-in" ? "animate-hero-found-in" : "";

  return (
    <span
      className={`relative inline-flex min-w-[5.5ch] items-center justify-center ${className}`}
      aria-live="polite"
    >
      {showLost && (
        <span
          className={`absolute inset-0 inline-flex items-center justify-center font-semibold text-ink word-lost-outline ${lostAnim}`}
          aria-hidden={showFound ? "true" : undefined}
        >
          Lost
        </span>
      )}
      {showFound && (
        <span
          className={`inline-flex items-center justify-center font-semibold text-ink ${foundAnim}`}
        >
          Found
        </span>
      )}
      {phase === "idle" && (
        <span className="invisible font-semibold" aria-hidden>
          Found
        </span>
      )}
    </span>
  );
}
