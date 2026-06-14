export default function StarRating({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(5, score));
  const fullStars = Math.round(clamped);

  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span aria-hidden className="tracking-tight text-amber-400">
        {"★".repeat(fullStars)}
        <span className="text-zinc-300 dark:text-zinc-700">{"★".repeat(5 - fullStars)}</span>
      </span>
      <span className="font-medium text-zinc-500 dark:text-zinc-400">{clamped.toFixed(1)}</span>
    </span>
  );
}
