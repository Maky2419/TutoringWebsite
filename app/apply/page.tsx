"use client";

import { useState } from "react";
import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ApplyPage() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/tutor-application", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setState("success");
      form.reset();
    } catch (err: any) {
      setState("error");
      setError(err?.message || "Failed to submit application.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PageHeader
        title="Tutor Application"
        subtitle="Apply to join our tutor team. Upload your resume and we’ll review your application."
      />

      <Container>
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 md:px-6">
          <section className="rounded-[32px] border border-blue-100 bg-white p-5 sm:p-7 md:p-8 shadow-xl">
            {state === "success" ? (
              <div className="rounded-2xl border border-green-100 bg-green-50 p-6">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  Application submitted!
                </h2>

                <p className="mt-2 text-slate-700">
                  Thanks — we’ve received your application and will review it soon.
                </p>

                <button
                  onClick={() => setState("idle")}
                  className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
                >
                  Submit another
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full name
                  </label>
                  <input
                    name="name"
                    required
                    className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="you@email.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Phone optional
                    </label>
                    <input
                      name="phone"
                      className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="+1 555 555 5555"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subjects you can tutor
                  </label>
                  <input
                    name="subjects"
                    required
                    className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g., Math, English, Biology, SAT, IELTS..."
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Experience level
                    </label>
                    <select
                      name="experience"
                      required
                      className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select one
                      </option>
                      <option value="0-1 years">0–1 years</option>
                      <option value="1-3 years">1–3 years</option>
                      <option value="3-5 years">3–5 years</option>
                      <option value="5+ years">5+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Timezone / Location
                    </label>
                    <input
                      name="location"
                      required
                      className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="e.g., Dubai (GMT+4)"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Short intro / why you want to tutor with us
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Tell us a bit about you, your tutoring style, availability, etc."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Resume PDF or DOCX
                  </label>
                  <input
                    name="resume"
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Max file size recommended: 5MB.
                  </p>
                </div>

                {state === "error" && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={state === "submitting"}
                  className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {state === "submitting"
                    ? "Submitting..."
                    : "Submit Application"}
                </button>
              </form>
            )}
          </section>

          <p className="mt-6 text-center text-sm text-slate-500">
            By submitting, you confirm the information is accurate and you
            consent to being contacted.
          </p>
        </div>
      </Container>
    </main>
  );
}