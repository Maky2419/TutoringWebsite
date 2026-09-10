"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [providers, setProviders] = useState<Record<string, { id: string }>>({});

  useEffect(() => {
    getProviders().then((available) => setProviders(available || {}));
  }, []);

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push(callbackUrl);
  }

  async function handleSocialLogin(provider: "google" | "apple" | "azure-ad") {
    setSocialLoading(provider);
    setError("");
    await signIn(provider, { callbackUrl });
  }

  const socialProviders = [
    { id: "google" as const, label: "Continue with Google", mark: "G" },
    { id: "apple" as const, label: "Continue with Apple", mark: "●" },
    { id: "azure-ad" as const, label: "Continue with Microsoft", mark: "M" },
  ].filter((provider) => providers[provider.id]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-md">
        <div className="rounded-[32px] border border-blue-100 bg-white p-5 sm:p-7 md:p-8 shadow-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950">
            Login
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Log in first to continue with booking.
          </p>

          {socialProviders.length > 0 && (
            <div className="mt-8 space-y-3">
              {socialProviders.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleSocialLogin(provider.id)}
                  disabled={Boolean(socialLoading)}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-xs font-extrabold">
                    {provider.mark}
                  </span>
                  {socialLoading === provider.id ? "Opening…" : provider.label}
                </button>
              ))}

              <div className="flex items-center gap-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or use email
                <span className="h-px flex-1 bg-slate-200" />
              </div>
            </div>
          )}

          <form onSubmit={handleCredentialsLogin} className={`${socialProviders.length > 0 ? "mt-2" : "mt-8"} space-y-5`}>
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-4 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-4 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
