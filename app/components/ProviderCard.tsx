import { Provider } from "../lib/api";
import StarRating from "./StarRating";

const DOMAIN_STYLES: Record<string, string> = {
  medical: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  legal: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  tech: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  finance: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
};

const DEFAULT_DOMAIN_STYLE = "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300";

export default function ProviderCard({ provider }: { provider: Provider }) {
  const domainStyle = DOMAIN_STYLES[provider.domain.toLowerCase()] ?? DEFAULT_DOMAIN_STYLE;

  return (
    <div className="group flex flex-col gap-2.5 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
          {provider.name}
        </h3>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${domainStyle}`}>
          {provider.domain}
        </span>
      </div>
      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{provider.profession}</p>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{provider.work_description}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <StarRating score={provider.reliability_score} />
      </div>
      {provider.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {provider.keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 transition-colors group-hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-zinc-700"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
