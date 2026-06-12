export default function StarRating({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(5, score));
  const fullStars = Math.round(clamped);

  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span aria-hidden className="text-amber-500">
        {"★".repeat(fullStars)}
        {"☆".repeat(5 - fullStars)}
      </span>
      <span className="text-zinc-500 dark:text-zinc-400">{clamped.toFixed(1)} / 5</span>
    </span>
  );
}
