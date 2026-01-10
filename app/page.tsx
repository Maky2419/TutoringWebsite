import Link from "next/link";
import Container from "../components/Container";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-44 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-56 right-[-180px] h-[620px] w-[620px] rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-56 left-[-180px] h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-3xl" />

      {/* HERO */}
      <div className="border-b border-white/10 bg-black/20">
        <Container>
          <div className="py-20 md:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                TutorFlow • Book tutoring without the back-and-forth
              </p>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Find the right tutor.
                <span className="block bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  Request a session in minutes.
                </span>
              </h1>

              <p className="mt-6 text-base leading-relaxed text-white/70 sm:text-lg">
                Clean tutor profiles, fast booking requests, and a simple flow that feels like a real product.
                No messy DMs, no confusion — just pick a tutor and lock a time.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/book" className="btn-primary w-full sm:w-auto">
                  Request Booking
                </Link>
                <Link href="/tutors" className="btn-outline w-full sm:w-auto">
                  Browse Tutors
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Quick request form
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Tutor profiles + rates
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Admin-ready foundation
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* MAIN CONTENT */}
      <Container>
        {/* How it works */}
        <section className="py-14 md:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-semibold text-white">How it works</h2>
              <p className="mt-3 text-sm text-white/60">
                A simple flow that gets students booked faster.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Browse tutors",
                  desc: "See subjects, teaching style, and hourly rates at a glance."
                },
                {
                  step: "2",
                  title: "Send a request",
                  desc: "Share the topic + preferred times. Add notes if needed."
                },
                {
                  step: "3",
                  title: "Get confirmed",
                  desc: "Receive a reply and lock in a session. Easy."
                }
              ].map((c) => (
                <div key={c.step} className="glass p-7">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white">
                    {c.step}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{c.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="glass p-8">
                <h3 className="text-2xl font-semibold text-white">
                  Built like a real product, not a school project
                </h3>
                <p className="mt-3 text-sm text-white/70">
                  TutorFlow is designed around clarity: students know what they’re booking, tutors know what to expect,
                  and your app stays scalable.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      title: "Tutor profiles",
                      desc: "Subjects, bios, hourly rates, and profile pages."
                    },
                    {
                      title: "Booking requests",
                      desc: "Student tip: add exam date + weak areas for faster matching."
                    },
                    {
                      title: "Clean UI system",
                      desc: "Consistent glass cards, buttons, and inputs across pages."
                    },
                    {
                      title: "Admin-ready",
                      desc: "The structure makes it easy to add approval + scheduling later."
                    }
                  ].map((f) => (
                    <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <h4 className="font-semibold text-white">{f.title}</h4>
                      <p className="mt-2 text-sm text-white/70">{f.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/tutors" className="btn-outline w-full sm:w-auto">
                    Explore tutors
                  </Link>
                  <Link href="/book" className="btn-primary w-full sm:w-auto">
                    Book a session
                  </Link>
                </div>
              </div>

              {/* Side card */}
              <div className="glass p-8">
                <h3 className="text-lg font-semibold text-white">Popular requests</h3>
                <p className="mt-2 text-sm text-white/70">
                  Example topics students usually book for:
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    "AP Calculus — derivatives + optimization",
                    "Trigonometry — unit circle + identities",
                    "Grade 10 — linear + quadratic functions",
                    "Essay help — structure + clarity"
                  ].map((t) => (
                    <div
                      key={t}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="text-sm text-white/80">{t}</span>
                      <span className="text-xs text-white/50">→</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-200">
                    Tip: Include your timezone in preferred times to avoid scheduling confusion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
