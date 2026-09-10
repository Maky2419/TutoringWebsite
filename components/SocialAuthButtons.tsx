"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

const options = [
  { id: "google", label: "Continue with Google", mark: "G" },
  { id: "apple", label: "Continue with Apple", mark: "●" },
  { id: "azure-ad", label: "Continue with Microsoft", mark: "M" },
] as const;

export default function SocialAuthButtons({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const [providers, setProviders] = useState<Record<string, { id: string }> | null>(null);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getProviders()
      .then(available => setProviders(available || {}))
      .catch(() => setProviders({}));
  }, []);

  async function continueWith(providerId: (typeof options)[number]["id"]) {
    setError("");
    if (providers && !providers[providerId]) {
      const name = options.find(option => option.id === providerId)?.label.replace("Continue with ", "");
      setError(`${name} sign-in is not configured on the server yet.`);
      return;
    }

    setLoading(providerId);
    await signIn(providerId, { callbackUrl });
  }

  return (
    <div className="mt-8 space-y-3">
      {options.map(option => (
        <button
          key={option.id}
          type="button"
          onClick={() => continueWith(option.id)}
          disabled={Boolean(loading) || providers === null}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-70"
        >
          <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-xs font-extrabold">
            {option.mark}
          </span>
          {loading === option.id ? "Opening…" : option.label}
        </button>
      ))}

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or use email
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
