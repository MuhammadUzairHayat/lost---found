export function handChipClass(viewerHasHand: boolean, handsClosed = false) {
  if (handsClosed) {
    return (
      "inline-flex items-center gap-1.5 rounded-2xl px-3 border font-medium " +
      "border-line bg-surface/90 text-mute cursor-not-allowed opacity-80"
    );
  }

  return (
    "inline-flex items-center gap-1.5 rounded-2xl px-3 border font-medium transition-colors " +
    (viewerHasHand
      ? "border-ink bg-ink text-paper  hover:bg-ink/90"
      : "border-line bg-paper/90 text-ink backdrop-blur-sm hover:border-ink/30")
  );
}
