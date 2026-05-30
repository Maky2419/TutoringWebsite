"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  initialUser: {
    name: string;
    email: string;
    role: string;
  };
};

export default function StudentAccountClient({ initialUser }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/student/account/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated successfully.");
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-[32px] border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-sky-100 p-8 shadow-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Student Account
              </p>

              <h1 className="mt-3 text-4xl font-extrabold text-slate-950">
                Manage Your Account
              </h1>

              <p className="mt-3 max-w-2xl text-slate-600">
                Update your password, view your account details, and get help
                from K-Cubed support.
              </p>
            </div>

            <Link
              href="/student/dashboard"
              className="inline-flex rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-950">
              Account Information
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              These details are linked to your student login.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Name
                </label>
                <input
                  value={initialUser.name}
                  disabled
                  className="w-full rounded-2xl border border-blue-100 bg-slate-50 px-4 py-3 text-slate-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  value={initialUser.email}
                  disabled
                  className="w-full rounded-2xl border border-blue-100 bg-slate-50 px-4 py-3 text-slate-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Account Type
                </label>
                <input
                  value={initialUser.role}
                  disabled
                  className="w-full rounded-2xl border border-blue-100 bg-slate-50 px-4 py-3 text-slate-700"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-950">
              Change Password
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Use at least 8 characters for your new password.
            </p>

            <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Enter new password"
                  className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Confirm new password"
                  className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>

              {message && (
                <p className="rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-700">
                  {message}
                </p>
              )}

              {error && (
                <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}
            </form>
          </section>
        </div>

        <section className="mt-8 rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">
                Customer Support
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Need help with bookings, invoices, payments, tutors, or your
                student dashboard? Contact us and we’ll help you as soon as
                possible.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:kcubedtutoring@gmail.com"
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700"
              >
                Email Support
              </a>

              <a
                href="https://wa.me/971585897137"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-green-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-green-600"
              >
                WhatsApp Support
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="font-bold text-slate-950">Booking Help</p>
              <p className="mt-1 text-sm text-slate-600">
                Get help scheduling, changing, or cancelling sessions.
              </p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
              <p className="font-bold text-slate-950">Payment Help</p>
              <p className="mt-1 text-sm text-slate-600">
                Ask about invoices, bank transfers, and payment status.
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
              <p className="font-bold text-slate-950">Tutor Help</p>
              <p className="mt-1 text-sm text-slate-600">
                Need help choosing a tutor or changing your assigned tutor?
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}