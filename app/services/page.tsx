import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";
import Link from "next/link";

export default function ServicesPage() {
  const services = [
    {
      title: "1-on-1 Tutoring",
      desc: "Personalized sessions designed around the student’s curriculum, pace, and goals.",
      bullets: ["Custom lesson plan", "Step-by-step explanations", "Confidence building", "Consistent progress tracking"],
      badge: "Most popular"
    },
    {
      title: "Exam & Test Prep",
      desc: "Focused preparation for high-stakes exams with strategy + timed practice.",
      bullets: ["Exam-style questions", "Time management strategies", "Weakness targeting", "Review plans + practice sets"],
      badge: "High impact"
    },
    {
      title: "Homework Support",
      desc: "Guided help so students learn the concept while finishing assignments properly.",
      bullets: ["Homework walkthroughs", "Concept reinforcement", "Problem-solving skills", "Avoid last-minute stress"],
      badge: "Weekly support"
    },
    {
      title: "Writing & English Support",
      desc: "Essay planning, structure, grammar, clarity — plus IELTS/academic writing guidance.",
      bullets: ["Structure + thesis support", "Clarity + flow improvements", "Sentence-level editing", "IELTS writing guidance"],
      badge: "Writing"
    }
  ];

  const subjects = [
    "Algebra",
    "Trigonometry",
    "Calculus",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Essay Writing",
    "Study Skills"
  ];

  const steps = [
    { n: "1", t: "Diagnostic", d: "We identify strengths and gaps so sessions are targeted." },
    { n: "2", t: "Custom plan", d: "A tutor builds a plan based on the student’s goals and timeline." },
    { n: "3", t: "Weekly sessions", d: "Clear lessons with active practice and guided problem-solving." },
    { n: "4", t: "Tracking", d: "Progress is monitored and the plan is adjusted as needed." },
    { n: "5", t: "Exam-ready", d: "Timed practice + strategy so students feel confident on test day." }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* glow background */}
      <div className="pointer-events-none absolute -top-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />

      <PageHeader
        title="Services"
        subtitle="Personalized tutoring, structured lessons, and real progress — wherever you are."
      />

      <Container>
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 space-y-10">
          {/* Services grid */}
          <section className="grid gap-6 md:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20 backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                    <p className="mt-2 text-white/70">{s.desc}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs font-semibold text-white/80">
                    {s.badge}
                  </span>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-white/75">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-[2px] inline-block h-2 w-2 rounded-full bg-white/70" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          {/* How it works */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">How it works</h3>
            <p className="mt-2 text-white/70">
              A simple process that keeps students supported and steadily improving.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {steps.map((st) => (
                <div key={st.n} className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                    {st.n}
                  </div>
                  <p className="text-white font-semibold">{st.t}</p>
                  <p className="mt-2 text-sm text-white/70">{st.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Subjects + Delivery */}
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Subjects */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">Subjects we help with</h3>
              <p className="mt-2 text-white/70">
                We focus on both understanding and performance — with clear explanations and practice.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {subjects.map((sub) => (
                  <span
                    key={sub}
                    className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-white/80"
                  >
                    {sub}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-sm text-white/60">
                If you don’t see your subject listed, contact us — we often support additional topics.
              </p>
            </div>

            {/* Online + In-person */}
            <DeliveryCard />
          </section>

          {/* CTA card */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Ready to get started?</h3>
                <p className="mt-1 text-white/70">
                  Pick a tutor and send a request — you’ll get an email when they accept or decline.
                </p>
              </div>

              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-white/90"
              >
                Request a session
              </Link>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

function DeliveryCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20 backdrop-blur">
      <h3 className="text-lg font-semibold text-white">Online & in-person tuition</h3>
      <p className="mt-2 text-white/70">
        We offer online tutoring from anywhere in the world — and we also provide limited in-person
        lessons in select locations.
      </p>

      <div className="mt-6 grid gap-4">
        <LocationRow
          title="Online tutoring (worldwide)"
          note="Learn from anywhere — all you need is Wi-Fi."
          icon="🌍"
        />
        <LocationRow
          title="In-person tutoring (Dubai)"
          note="Available in select areas based on tutor availability."
          icon="🇦🇪"
        />
        <LocationRow
          title="In-person tutoring (Canada)"
          note="Limited availability depending on location and schedule."
          icon="🇨🇦"
        />
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm text-white/80">
          <span className="font-semibold text-white">Tip:</span> Most students choose online lessons
          for flexibility, consistency, and easy scheduling across time zones.
        </p>
      </div>
    </div>
  );
}

function LocationRow({ title, note, icon }: { title: string; note: string; icon: string }) {
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
