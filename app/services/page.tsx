import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";
import Link from "next/link";

export default function ServicesPage() {
  const services = [
    {
      title: "1-on-1 Tutoring",
      desc: "Personalized sessions designed around the student’s curriculum, pace, and goals.",
      bullets: [
        "Custom lesson plan",
        "Step-by-step explanations",
        "Confidence building",
        "Consistent progress tracking",
      ],
      badge: "Most popular",
    },
    {
      title: "Exam & Test Prep",
      desc: "Focused preparation for high-stakes exams with strategy + timed practice.",
      bullets: [
        "Exam-style questions",
        "Time management strategies",
        "Weakness targeting",
        "Review plans + practice sets",
      ],
      badge: "High impact",
    },
    {
      title: "Homework Support",
      desc: "Guided help so students learn the concept while finishing assignments properly.",
      bullets: [
        "Homework walkthroughs",
        "Concept reinforcement",
        "Problem-solving skills",
        "Avoid last-minute stress",
      ],
      badge: "Weekly support",
    },
    {
      title: "Writing & English Support",
      desc: "Essay planning, structure, grammar, clarity — plus IELTS/academic writing guidance.",
      bullets: [
        "Structure + thesis support",
        "Clarity + flow improvements",
        "Sentence-level editing",
        "IELTS writing guidance",
      ],
      badge: "Writing",
    },
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
    "Study Skills",
  ];

  const steps = [
    {
      n: "1",
      t: "Diagnostic",
      d: "We identify strengths and gaps so sessions are targeted.",
    },
    {
      n: "2",
      t: "Custom plan",
      d: "A tutor builds a plan based on the student’s goals and timeline.",
    },
    {
      n: "3",
      t: "Weekly sessions",
      d: "Clear lessons with active practice and guided problem-solving.",
    },
    {
      n: "4",
      t: "Tracking",
      d: "Progress is monitored and the plan is adjusted as needed.",
    },
    {
      n: "5",
      t: "Exam-ready",
      d: "Timed practice + strategy so students feel confident on test day.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <PageHeader
        title="Services"
        subtitle="Personalized tutoring, structured lessons, and real progress — wherever you are."
      />

      <Container>
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
<section className="grid gap-6 sm:grid-cols-2">
              {services.map((s) => (
              <div
                key={s.title}
                className="rounded-[28px] border border-blue-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-950">
                      {s.title}
                    </h3>

                    <p className="mt-2 leading-relaxed text-slate-600">
                      {s.desc}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {s.badge}
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex flex-col gap-3 sm:flex-row">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        ✓
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="mt-10 rounded-[28px] border border-blue-100 bg-white p-5 sm:p-7 md:p-8 shadow-sm">
            <h3 className="text-2xl font-extrabold text-slate-950">
              How it works
            </h3>

            <p className="mt-2 text-slate-600">
              A simple process that keeps students supported and steadily
              improving.
            </p>

<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                  {steps.map((st) => (
                <div
                  key={st.n}
                  className="rounded-2xl bg-blue-50 p-5 text-center"
                >
                  <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                    {st.n}
                  </div>

                  <p className="font-bold text-slate-950">{st.t}</p>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {st.d}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-blue-100 bg-white p-5 sm:p-7 md:p-8 shadow-sm">
              <h3 className="text-2xl font-extrabold text-slate-950">
                Subjects we help with
              </h3>

              <p className="mt-2 text-slate-600">
                We focus on both understanding and performance with clear
                explanations and practice.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {subjects.map((sub) => (
                  <span
                    key={sub}
                    className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                  >
                    {sub}
                  </span>
                ))}
              </div>

              <p className="mt-6 text-sm text-slate-500">
                If you don’t see your subject listed, contact us — we often
                support additional topics.
              </p>
            </div>

            <DeliveryCard />
          </section>

          <section className="mt-10 rounded-[28px] bg-blue-600 p-5 sm:p-7 md:p-8 shadow-xl">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-white">
                  Ready to get started?
                </h3>

                <p className="mt-2 text-blue-100">
                  Pick a tutor and send a request — you’ll get an email when
                  they accept or decline.
                </p>
              </div>

              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 font-bold text-blue-700 shadow-lg transition hover:bg-blue-50"
              >
                Request a session
              </Link>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}

function DeliveryCard() {
  return (
    <div className="rounded-[28px] border border-blue-100 bg-white p-5 sm:p-7 md:p-8 shadow-sm">
      <h3 className="text-2xl font-extrabold text-slate-950">
        Online & in-person tuition
      </h3>

      <p className="mt-2 text-slate-600">
        We offer online tutoring from anywhere in the world — and we also
        provide limited in-person lessons in select locations.
      </p>

      <div className="mt-6 grid gap-4">
        <LocationRow
          title="Online tutoring worldwide"
          note="Learn from anywhere — all you need is Wi-Fi."
          icon="🌍"
        />
        <LocationRow
          title="In-person tutoring Dubai"
          note="Available in select areas based on tutor availability."
          icon="🇦🇪"
        />
        <LocationRow
          title="In-person tutoring Canada"
          note="Limited availability depending on location and schedule."
          icon="🇨🇦"
        />
      </div>

      <div className="mt-6 rounded-2xl bg-green-50 p-4">
        <p className="text-sm text-green-800">
          <span className="font-bold">Tip:</span> Most students choose online
          lessons for flexibility, consistency, and easy scheduling across time
          zones.
        </p>
      </div>
    </div>
  );
}

function LocationRow({
  title,
  note,
  icon,
}: {
  title: string;
  note: string;
  icon: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
      <div className="text-2xl leading-none">{icon}</div>

      <div>
        <p className="font-bold text-slate-950">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{note}</p>
      </div>
    </div>
  );
}