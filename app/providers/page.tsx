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
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Providers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Add Provider
        </button>
      </div>

      {toast && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          {toast}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-16 text-sm text-zinc-400">
          Loading providers...
        </div>
      ) : providers.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-16 text-center text-sm text-zinc-400">
          No providers yet. Add one to get started.
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
