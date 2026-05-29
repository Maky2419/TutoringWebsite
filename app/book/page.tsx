"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";

type Tutor = {
  id: number;
  name: string;
  email: string;
  subjects: string | string[];
  bio: string;
  hourlyRate: number;
};

function formatSubjects(subjects: string | string[]) {
  if (Array.isArray(subjects)) {
    return subjects.filter(Boolean).join(", ");
  }

  return String(subjects || "")
    .replace(/([a-z])([A-Z])/g, "$1, $2")
    .trim();
}

export default function BookPage() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [tutorsLoading, setTutorsLoading] = useState(true);
  const [selectedTutorId, setSelectedTutorId] = useState<string>("");

  const selectedTutor = useMemo(
    () => tutors.find((t) => String(t.id) === selectedTutorId),
    [tutors, selectedTutorId]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setTutorsLoading(true);
        const res = await fetch("/api/tutors");
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as Tutor[];
        if (!cancelled) setTutors(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load tutors");
      } finally {
        if (!cancelled) setTutorsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formEl = e.currentTarget;

    setStatus("submitting");
    setError(null);

    const form = new FormData(formEl);

    const payload = {
      tutorId: selectedTutorId ? Number(selectedTutorId) : undefined,
      subject: String(form.get("subject") || "").trim(),
      preferredTimes: String(form.get("preferredTimes") || "").trim(),
      message: String(form.get("message") || "").trim() || undefined,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setStatus("success");
      formEl.reset();
      setSelectedTutorId("");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PageHeader
        title="Request a Tutoring Session"
        subtitle="Pick a tutor, submit your request, and track it from your dashboard."
      />

      <Container>
        <div className="grid gap-8 py-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form
              onSubmit={onSubmit}
              className="rounded-[32px] border border-blue-100 bg-white p-8 shadow-xl"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select a tutor <span className="text-red-500">*</span>
                </label>

                <select
                  value={selectedTutorId}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="" disabled>
                    {tutorsLoading ? "Loading tutors..." : "Choose a tutor"}
                  </option>

                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {formatSubjects(t.subjects)} — $
                      {t.hourlyRate}/hr USD
                    </option>
                  ))}
                </select>

                {selectedTutor && (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <p className="font-bold text-slate-950">
                      {selectedTutor.name}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-blue-700">
                      {formatSubjects(selectedTutor.subjects)}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedTutor.bio}
                    </p>
                    <p className="mt-3 text-sm font-bold text-green-700">
                      ${selectedTutor.hourlyRate}/hr USD
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject / Topic <span className="text-red-500">*</span>
                </label>

                <input
                  name="subject"
                  required
                  className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Trigonometry identities"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Preferred times <span className="text-red-500">*</span>
                </label>

                <input
                  name="preferredTimes"
                  required
                  className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Mon/Wed 6–7pm"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Message optional
                </label>

                <textarea
                  name="message"
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Anything the tutor should know?"
                />
              </div>

              {status === "success" && (
                <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
                  Request sent! You can now see it from your student dashboard
                  too.
                </div>
              )}

              {status === "error" && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {error || "Something went wrong."}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-6 w-full rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Sending..." : "Send Request"}
              </button>
            </form>
          </div>

          <aside className="h-fit rounded-[32px] border border-blue-100 bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-extrabold text-slate-950">
              How it works
            </h3>

            <ul className="mt-6 space-y-4 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  1
                </span>
                Log in to your account
              </li>

              <li className="flex gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  2
                </span>
                Pick a tutor
              </li>

              <li className="flex gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  3
                </span>
                Submit your request
              </li>

              <li className="flex gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  4
                </span>
                Track it from your dashboard
              </li>
            </ul>

            <div className="mt-8 rounded-2xl bg-green-50 p-5">
              <p className="text-sm font-semibold text-green-700">
                Need help choosing a tutor?
              </p>
              <a
                href="https://wa.me/971585897137"
                className="mt-4 inline-block rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-600"
              >
                WhatsApp Us
              </a>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
} 