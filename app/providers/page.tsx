"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import AddProviderForm from "../components/AddProviderForm";
import ProviderCard from "../components/ProviderCard";
import { ApiError, fetchProviders, Provider } from "../lib/api";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProviders();
      setProviders(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load providers.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      loadProviders();
    });
  }, [loadProviders]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleCreated(message: string) {
    setShowForm(false);
    setToast(message);
    loadProviders();
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Providers
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {loading ? "Loading providers..." : `${providers.length} provider${providers.length === 1 ? "" : "s"} available`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30"
        >
          <span aria-hidden className="text-base leading-none">+</span>
          Add Provider
        </button>
      </div>

      {toast && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
          <span aria-hidden>✅</span>
          {toast}
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
          <span aria-hidden>⚠️</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl border border-zinc-200/80 bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/40"
            />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-2xl shadow-lg shadow-indigo-500/25">
            📋
          </div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">No providers yet</h2>
          <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Add your first provider to start matching them in conversations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}

      {showForm && <AddProviderForm onClose={() => setShowForm(false)} onCreated={handleCreated} />}
    </div>
  );
}
