"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import ProviderCard from "./components/ProviderCard";
import {
  ApiError,
  ChatMessage,
  fetchProviders,
  findMentionedProviders,
  Provider,
  sendChatMessage,
} from "./lib/api";

const CHAT_STORAGE_KEY = "chat:state";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { messages: ChatMessage[]; sessionId: string | null };
        setMessages(parsed.messages ?? []);
        setSessionId(parsed.sessionId ?? null);
      } catch {
        // ignore corrupted storage
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ messages, sessionId }));
  }, [messages, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    startTransition(() => {
      fetchProviders()
        .then(setProviders)
        .catch(() => {
          // provider cards are an enhancement; ignore failures here
        });
    });
  }, []);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(trimmed, sessionId);
      const mentionedProviders = findMentionedProviders(response.answer, providers);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer, providers: mentionedProviders },
      ]);
      if (response.session_id) {
        setSessionId(response.session_id);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  function handleReset() {
    setMessages([]);
    setSessionId(null);
    setError(null);
    setInput("");
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6">
      <div className="mb-3 flex items-center justify-end">
        <button
          onClick={handleReset}
          disabled={messages.length === 0 && !sessionId}
          className="flex items-center gap-1.5 rounded-full border border-zinc-200/70 bg-white/90 px-4 py-1.5 text-sm font-medium text-zinc-500 shadow-sm backdrop-blur-sm transition-all hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800/70 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <span aria-hidden>↺</span>
          Reset chat
        </button>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto rounded-2xl border border-zinc-200/70 bg-white/80 p-4 shadow-sm shadow-zinc-200/50 backdrop-blur-sm sm:p-6 dark:border-zinc-800/70 dark:bg-zinc-950/60 dark:shadow-none">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-2xl shadow-lg shadow-indigo-500/25">
              💬
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              How can I help you today?
            </h2>
            <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              Ask about providers, services, or anything else &mdash; I&apos;ll find the right match for you.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex animate-fade-in-up items-start gap-2.5 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar role={msg.role} />
                <div className={`flex max-w-[80%] flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "rounded-tr-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
                        : "rounded-tl-sm bg-zinc-100 text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-50"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.providers && msg.providers.length > 0 && (
                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                      {msg.providers.map((provider) => (
                        <ProviderCard key={provider.id} provider={provider} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex animate-fade-in-up items-start gap-2.5">
                <Avatar role="assistant" />
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-3 dark:bg-zinc-800/80">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-zinc-400 [animation-delay:-0.32s] dark:bg-zinc-500" />
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-zinc-400 [animation-delay:-0.16s] dark:bg-zinc-500" />
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-zinc-400 dark:bg-zinc-500" />
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
          <span aria-hidden>⚠️</span>
          {error}
        </div>
      )}

      <div className="mt-4 flex gap-2 rounded-full border border-zinc-200/70 bg-white/90 p-1.5 shadow-sm backdrop-blur-sm dark:border-zinc-800/70 dark:bg-zinc-900/80">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-transparent px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-60 dark:text-zinc-50"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 px-5 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          Send
          <span aria-hidden>↑</span>
        </button>
      </div>
    </div>
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "user") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        🧑
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 text-sm shadow-sm shadow-indigo-500/25">
      ✨
    </div>
  );
}
