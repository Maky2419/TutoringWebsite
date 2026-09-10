"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

const provider = { id: "google", label: "Continue with Google" } as const;

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.05v2.59A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.09 12c0-.66.11-1.3.31-1.9V7.51H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.49L6.4 13.9Z" />
      <path fill="#EA4335" d="M12 5.97c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.95 5.51L6.4 10.1C7.19 7.73 9.4 5.97 12 5.97Z" />
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

  async function continueWithGoogle() {
    setError("");
    if (providers && !providers.google) {
      setError("Google sign-in is not configured on the server yet.");
      return;
    }

    setLoading("google");
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="mt-7">
      <button
        type="button"
        onClick={continueWithGoogle}
        disabled={Boolean(loading) || providers === null}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/60 hover:shadow-md disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
      >
        <GoogleIcon />
        <span>{loading === "google" ? "Opening…" : provider.label}</span>
      </button>

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
