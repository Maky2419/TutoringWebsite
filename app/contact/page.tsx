"use client";

import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";
import { useState } from "react";

export default function ContactPage() {
  // ✅ Replace these with your real details if you want
  const WHATSAPP_NUMBER_E164 = "+971500000000"; // e.g. +97150XXXXXXX
  const EMAIL = "K-Cubed@example.com"; // e.g. tutoramber@gmail.com

  const [copied, setCopied] = useState<null | "whatsapp" | "email">(null);

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER_E164.replace(/\+/g, "")}?text=${encodeURIComponent(
    "Hi! I’d like to ask about tutoring. (Student name, grade, subject, preferred days/times)"
  )}`;

  async function copy(text: string, which: "whatsapp" | "email") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* glow background */}
      <div className="pointer-events-none absolute -top-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />

      <PageHeader
        title="Contact"
        subtitle="We respond quickly. WhatsApp is our main communication channel."
      />

      <Container>
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 space-y-10">
          {/* Main cards */}
          <section className="grid gap-6 lg:grid-cols-3">
            {/* WhatsApp */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">WhatsApp</h3>
                  <p className="mt-2 text-white/70">
                    Fastest way to reach us. We often use a WhatsApp group chat with the parent,
                    student, and tutor for transparency.
                  </p>
                </div>
                <span className="text-2xl">💬</span>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/80">
                  <span className="text-white font-semibold">Number:</span>{" "}
                  <span className="font-mono">{WHATSAPP_NUMBER_E164}</span>
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-white/90"
                >
                  Message on WhatsApp
                </a>

                <button
                  onClick={() => copy(WHATSAPP_NUMBER_E164, "whatsapp")}
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-black/20 px-5 py-3 font-semibold text-white/90 transition hover:bg-black/10"
                >
                  {copied === "whatsapp" ? "Copied ✅" : "Copy number"}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Email</h3>
                  <p className="mt-2 text-white/70">
                    Prefer email? That’s fine too — especially for invoice/payment questions.
                  </p>
                </div>
                <span className="text-2xl">📧</span>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/80">
                  <span className="text-white font-semibold">Email:</span>{" "}
                  <span className="font-mono">{EMAIL}</span>
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                <a
                  href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                    "Tutoring inquiry"
                  )}&body=${encodeURIComponent(
                    "Hi K-Cubed,\n\nI’d like to ask about tutoring.\n\nStudent name:\nGrade:\nSubject:\nCountry/Time zone:\nPreferred days/times:\n\nThanks!"
                  )}`}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-white/90"
                >
                  Email us
                </a>

                <button
                  onClick={() => copy(EMAIL, "email")}
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-black/20 px-5 py-3 font-semibold text-white/90 transition hover:bg-black/10"
                >
                  {copied === "email" ? "Copied ✅" : "Copy email"}
                </button>
              </div>
            </div>

            {/* Locations */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Where we teach</h3>
                  <p className="mt-2 text-white/70">
                    We tutor online worldwide, with limited in-person availability in select locations.
                  </p>
                </div>
                <span className="text-2xl">📍</span>
              </div>

              <div className="mt-5 space-y-3">
                <LocationRow icon="🌍" title="Online (Worldwide)" note="Available across time zones." />
                <LocationRow icon="🇦🇪" title="In-person (Dubai)" note="Limited availability." />
                <LocationRow icon="🇨🇦" title="In-person (Canada)" note="Limited availability." />
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/70">
                  To request in-person tutoring, message us your location and availability.
                </p>
              </div>
            </div>
          </section>

          {/* What to include */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">What to include in your message</h3>
            <p className="mt-2 text-white/70">
              To match you with the best tutor quickly, please include:
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ChecklistItem text="Student name + grade/level" />
              <ChecklistItem text="Subject(s) and what they’re struggling with" />
              <ChecklistItem text="Country + time zone" />
              <ChecklistItem text="Preferred days/times (and session length: 1hr or 1.5hr)" />
              <ChecklistItem text="Exam/test coming up (if any) + date" />
              <ChecklistItem text="Preferred contact method: WhatsApp / Email / Call" />
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

function LocationRow({ icon, title, note }: { icon: string; title: string; note: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-2xl leading-none">{icon}</div>
      <div>
        <p className="text-white font-semibold">{title}</p>
        <p className="mt-1 text-sm text-white/70">{note}</p>
      </div>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
      <span className="mt-[2px] inline-block h-2 w-2 rounded-full bg-white/70" />
      <p className="text-sm text-white/80">{text}</p>
    </div>
  );
}
