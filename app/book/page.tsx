"use client";

import { useState } from "react";
import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";

export default function BookPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      studentName: String(form.get("studentName") || ""),
      studentEmail: String(form.get("studentEmail") || ""),
      subject: String(form.get("subject") || ""),
      preferredTimes: String(form.get("preferredTimes") || ""),
      message: String(form.get("message") || "") || undefined
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());

      setStatus("success");
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* subtle background decoration */}
      <div className="pointer-events-none absolute -top-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />

      <PageHeader
        title="Request a Booking"
        subtitle="Tell us what you need, and we’ll match you with a tutor."
      />

      <Container>
        <div className="grid gap-10 pb-16 lg:grid-cols-[1fr_420px] lg:items-start">
          {/* form */}
          <form onSubmit={onSubmit} className="glass p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">Booking details</h2>
              <p className="mt-1 text-sm text-white/70">
                Fill this out and we’ll reply by email with next steps.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-white/80">Your name</span>
                <input
                  name="studentName"
                  required
                  className="input"
                  
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-white/80">Email</span>
                <input
                  name="studentEmail"
                  type="email"
                  required
                  className="input"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-medium text-white/80">Subject / topic</span>
              <input
                name="subject"
                required
                className="input"
                placeholder="e.g., AP Calculus — derivatives"
              />
            </label>

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-medium text-white/80">Preferred times</span>
              <input
                name="preferredTimes"
                required
                className="input"
                placeholder="e.g., Mon/Wed 6–8pm (German time)"
              />
            </label>

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-medium text-white/80">Message (optional)</span>
              <textarea
                name="message"
                className="input min-h-[140px] resize-none"
                placeholder="Goals, exam date, current level, what you’re struggling with, etc."
              />
            </label>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="btn-primary w-full sm:w-auto disabled:opacity-60"
              >
                {status === "submitting" ? "Submitting..." : "Submit request"}
              </button>

              {status === "success" ? (
                <div className="w-full rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                  Request submitted! 🎉 Check your email soon.
                </div>
              ) : null}

              {status === "error" ? (
                <div className="w-full rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  Error: {error}
                </div>
              ) : null}
            </div>
          </form>

          {/* side panel */}
          <aside className="glass p-7">
            <h3 className="text-lg font-semibold text-white">What happens next?</h3>

            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white">
                  1
                </span>
                <span>We review your request and match you with the best tutor.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white">
                  2
                </span>
                <span>We email you available times and a session plan.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white">
                  3
                </span>
                <span>You confirm, and your booking is locked in.</span>
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-sm text-white/70">
                Tip: Add your exam date and current level in the message for faster matching.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
