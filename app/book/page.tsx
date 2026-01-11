"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";

type Tutor = {
  id: number;
  name: string;
  email: string;
  subjects: string;
  bio: string;
  hourlyRate: number;
};

export default function BookPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
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

    // ✅ Always the form element in an onSubmit handler
    const formEl = e.currentTarget;

    setStatus("submitting");
    setError(null);

    const form = new FormData(formEl);

    const payload = {
      tutorId: selectedTutorId ? Number(selectedTutorId) : undefined,
      studentName: String(form.get("studentName") || "").trim(),
      studentEmail: String(form.get("studentEmail") || "").trim(),
      subject: String(form.get("subject") || "").trim(),
      preferredTimes: String(form.get("preferredTimes") || "").trim(),
      message: String(form.get("message") || "").trim() || undefined
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // Try to show a more readable message
        const txt = await res.text();
        throw new Error(txt || "Request failed");
      }

      setStatus("success");

      // Reset native form fields
      formEl.reset();

      // Reset controlled field (tutor dropdown)
      setSelectedTutorId("");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />

      <PageHeader
        title="Request a Tutoring Session"
        subtitle="Pick a tutor, submit a request — you’ll get emailed when they accept."
      />

      <Container>
        <div className="grid gap-10 py-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur"
            >
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Select a tutor <span className="text-rose-300">*</span>
                </label>

                <select
                  value={selectedTutorId}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                >
                  <option value="" disabled>
                    {tutorsLoading ? "Loading tutors..." : "Choose a tutor"}
                  </option>
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.subjects} (${t.hourlyRate}/hr)
                    </option>
                  ))}
                </select>

                {selectedTutor && (
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white/90">{selectedTutor.name}</p>
                    <p className="mt-1 text-sm text-white/70">{selectedTutor.subjects}</p>
                    <p className="mt-2 text-sm text-white/70">{selectedTutor.bio}</p>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Your name <span className="text-rose-300">*</span>
                  </label>
                  <input
                    name="studentName"
                    required
                    className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Your email <span className="text-rose-300">*</span>
                  </label>
                  <input
                    type="email"
                    name="studentEmail"
                    required
                    className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Subject / Topic <span className="text-rose-300">*</span>
                </label>
                <input
                  name="subject"
                  required
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                  placeholder="e.g., Trigonometry identities"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Preferred times <span className="text-rose-300">*</span>
                </label>
                <input
                  name="preferredTimes"
                  required
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                  placeholder="e.g., Mon/Wed 6–7pm"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-white/80">Message (optional)</label>
                <textarea
                  name="message"
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                  placeholder="Anything the tutor should know?"
                />
              </div>

              {status === "success" && (
                <div className="mt-5 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-emerald-100">
                  Request sent! We emailed the tutor — you’ll get an email when they accept or decline.
                </div>
              )}

              {status === "error" && (
                <div className="mt-5 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 text-rose-100">
                  {error || "Something went wrong."}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Sending..." : "Send request"}
              </button>
            </form>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">How it works</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>1) Pick a tutor</li>
              <li>2) Submit your request</li>
              <li>3) Tutor accepts/declines via email link</li>
              <li>4) You get emailed the decision</li>
            </ul>
          </aside>
        </div>
      </Container>
    </div>
  );
}
