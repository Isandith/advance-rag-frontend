import { Provider } from "../lib/api";
import StarRating from "./StarRating";

export default function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{provider.name}</h3>
        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {provider.domain}
        </span>
      </div>
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{provider.profession}</p>
      <p className="text-sm text-zinc-700 dark:text-zinc-300">{provider.work_description}</p>
      <StarRating score={provider.reliability_score} />
      {provider.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {provider.keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
