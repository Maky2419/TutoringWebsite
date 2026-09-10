"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

const options = [
  { id: "google", label: "Google", style: "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50/60" },
  { id: "apple", label: "Apple", style: "border-slate-950 bg-slate-950 text-white hover:border-slate-800 hover:bg-slate-800" },
  { id: "azure-ad", label: "Microsoft", style: "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50/60" },
] as const;

function ProviderIcon({ id }: { id: (typeof options)[number]["id"] }) {
  if (id === "google") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.05v2.59A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.09 12c0-.66.11-1.3.31-1.9V7.51H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.49L6.4 13.9Z" />
        <path fill="#EA4335" d="M12 5.97c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.95 5.51L6.4 10.1C7.19 7.73 9.4 5.97 12 5.97Z" />
      </svg>
    );
  }

  if (id === "apple") {
    return (
      <svg aria-hidden="true" viewBox="0 0 384 512" className="h-5 w-5 fill-current">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.5 4 272.8c0 26.5 4.8 53.9 14.4 81.5 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-89-61.7-91.5ZM263.6 104.5c27.3-32.4 24.8-61.9 23.9-72.5-24.8 1.4-54 16.9-70.3 35.8-17.9 20.3-28.4 45.5-26.3 71.9 26.9 2.1 51.4-11.8 72.7-35.2Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
      <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
      <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
      <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
    </svg>
  );
}

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
      const name = options.find(option => option.id === providerId)?.label;
      setError(`${name} sign-in is not configured on the server yet.`);
      return;
    }

    setLoading(providerId);
    await signIn(providerId, { callbackUrl });
  }

  return (
    <div className="mt-7">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        Continue with
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map(option => (
          <button
            key={option.id}
            type="button"
            onClick={() => continueWith(option.id)}
            disabled={Boolean(loading) || providers === null}
            className={`flex h-14 items-center justify-center gap-2.5 rounded-2xl border px-3 text-sm font-bold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 ${option.style}`}
          >
            <ProviderIcon id={option.id} />
            <span>{loading === option.id ? "Opening…" : option.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
          {error}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or use email
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
