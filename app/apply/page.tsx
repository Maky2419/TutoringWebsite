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
        body: formData
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
    <div className="relative overflow-hidden">
      {/* glow background */}
      <div className="pointer-events-none absolute -top-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />

      <PageHeader
        title="Tutor Application"
        subtitle="Apply to join our tutor team. Upload your resume and we’ll review your application."
      />

      <Container>
        <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20 backdrop-blur">
            {state === "success" ? (
              <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                <h2 className="text-xl font-semibold text-white">Application submitted!</h2>
                <p className="mt-2 text-white/70">
                  Thanks — we’ve received your application and will review it soon.
                </p>
                <button
                  onClick={() => setState("idle")}
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90"
                >
                  Submit another
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Full name
                  </label>
                  <input
                    name="name"
                    required
                    className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                      placeholder="you@email.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">
                      Phone (optional)
                    </label>
                    <input
                      name="phone"
                      className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                      placeholder="+1 555 555 5555"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Subjects you can tutor
                  </label>
                  <input
                    name="subjects"
                    required
                    className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                    placeholder="e.g., Math, English, Biology, SAT, IELTS..."
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">
                      Experience level
                    </label>
                    <select
                      name="experience"
                      required
                      className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
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
                    <label className="mb-2 block text-sm font-medium text-white/80">
                      Timezone / Location
                    </label>
                    <input
                      name="location"
                      required
                      className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                      placeholder="e.g., Dubai (GMT+4)"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Short intro / why you want to tutor with us
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="w-full resize-none rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/25"
                    placeholder="Tell us a bit about you, your tutoring style, availability, etc."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Resume (PDF or DOCX)
                  </label>
                  <input
                    name="resume"
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black hover:file:bg-white/90"
                  />
                  <p className="mt-2 text-xs text-white/60">
                    Max file size recommended: 5MB.
                  </p>
                </div>

                {state === "error" && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={state === "submitting"}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-white/90 disabled:opacity-60"
                >
                  {state === "submitting" ? "Submitting..." : "Submit application"}
                </button>
              </form>
            )}
          </section>

          <p className="mt-6 text-center text-sm text-white/60">
            By submitting, you confirm the information is accurate and you consent to being contacted.
          </p>
        </div>
      </Container>
    </div>
  );
}
