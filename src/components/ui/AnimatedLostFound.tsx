"use client";

import { useEffect, useState } from "react";

type Phase =
  | "idle"
  | "lost-in"
  | "lost-hold"
  | "lost-out"
  | "found-in"
  | "found-hold"
  | "found-out"
  | "done";

const LOST_IN_MS = 700;
const HOLD_MS = 900;
const OUT_MS = 450;
const FOUND_IN_MS = 700;

export function AnimatedLostFound({
  className = "",
  loop = false,
}: {
  className?: string;
  /** When true, cycles Lost ↔ Found indefinitely */
  loop?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (fn: () => void, ms: number) => {
      timers.push(
        setTimeout(() => {
          if (!cancelled) fn();
        }, ms)
      );
    };

    const runCycle = () => {
      if (cancelled) return;

      setPhase("idle");

      let t = 80;
      schedule(() => setPhase("lost-in"), t);
      t += LOST_IN_MS;
      schedule(() => setPhase("lost-hold"), t);
      t += HOLD_MS;
      schedule(() => setPhase("lost-out"), t);
      t += OUT_MS;
      schedule(() => setPhase("found-in"), t);
      t += FOUND_IN_MS;

      if (loop) {
        schedule(() => setPhase("found-hold"), t);
        t += HOLD_MS;
        schedule(() => setPhase("found-out"), t);
        t += OUT_MS;
        schedule(runCycle, t);
      } else {
        schedule(() => setPhase("done"), t);
      }
    };

    runCycle();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [loop]);

  const showLost =
    phase === "lost-in" || phase === "lost-hold" || phase === "lost-out";
  const showFound =
    phase === "found-in" ||
    phase === "found-hold" ||
    phase === "found-out" ||
    phase === "done";

  const lostAnim =
    phase === "lost-in"
      ? "animate-hero-lost-in"
      : phase === "lost-out"
        ? "animate-hero-lost-out"
        : "";

  const foundAnim =
    phase === "found-in"
      ? "animate-hero-found-in"
      : phase === "found-out"
        ? "animate-hero-found-out"
        : "";

  return (
    <span
      className={`relative inline-flex min-w-[5.5ch] items-center justify-center ${className}`}
      aria-live="polite"
    >
      {showLost && (
        <span
          className={`absolute inset-0 inline-flex items-center justify-center font-semibold text-ink word-lost-outline ${lostAnim}`}
          aria-hidden={showFound}
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
