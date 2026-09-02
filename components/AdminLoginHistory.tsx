"use client";

import { useEffect, useState } from "react";
import { DUBAI_TIME_ZONE } from "@/lib/sessionTime";

type Login = {
  id: number;
  provider: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null; role: string };
};

export default function AdminLoginHistory() {
  const [logins, setLogins] = useState<Login[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    async function load() {
      try {
        const response = await fetch("/api/admin/logins", {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load login history.");
        if (!controller.signal.aborted) setLogins(data.logins);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error instanceof Error ? error.message : "Unable to load login history.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [refresh]);

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Latest 100 successful logins across all users, newest first. Times are Dubai (UAE, UTC+4).
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={() => setRefresh(n => n + 1)}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
      {loading ? (
        <p role="status" className="text-sm text-slate-600">Loading logins…</p>
      ) : error ? (
        <p role="alert" className="text-sm text-red-700">{error}</p>
      ) : logins.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          No logins have been recorded yet. New successful logins appear here after login recording is installed.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                {["#", "User", "Email", "Role", "Login time — Dubai (UTC+4)", "Sign-in method"].map(label => (
                  <th key={label} className="p-3">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logins.map((login, index) => (
                <tr key={login.id} className="border-t align-top">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{login.user.name || "Unnamed user"}</td>
                  <td className="p-3">{login.user.email || login.user.id}</td>
                  <td className="p-3">{login.user.role}</td>
                  <td className="whitespace-nowrap p-3">
                    {new Intl.DateTimeFormat("en-GB", {
                      timeZone: DUBAI_TIME_ZONE,
                      dateStyle: "medium",
                      timeStyle: "medium",
                    }).format(new Date(login.createdAt))}
                  </td>
                  <td className="p-3">
                    {login.provider === "credentials" ? "Email and password" : login.provider}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
