import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";
import Link from "next/link";

type FAQItem = {
  q: string;
  a: React.ReactNode;
};

export default function FAQPage() {
  const faqs: FAQItem[] = [
    {
      q: "How long do sessions last?",
      a: (
        <p className="text-white/80 leading-relaxed">
          Most sessions are <span className="text-white font-semibold">1 hour</span> or{" "}
          <span className="text-white font-semibold">1.5 hours</span>. Your tutor can recommend the best length
          depending on the student’s goals, grade level, and the subject.
        </p>
      )
    },
    {
      q: "How do payments work?",
      a: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>
            Payments are done via <span className="text-white font-semibold">bank transfer</span>.
          </p>
          <p>
            We provide a <span className="text-white font-semibold">monthly invoice</span> so everything stays clear and organized.
          </p>
        </div>
      )
    },
    {
      q: "What kind of tutors do you have?",
      a: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>
            We have a growing team of tutors across key subjects (math, sciences, English, writing, study skills).
            Each tutor focuses on clear explanations, structured lessons, and confidence-building.
          </p>
          <p className="text-white/70">
            You can view tutor profiles here:{" "}
            <Link href="/tutors" className="text-white underline hover:text-white/90">
              Meet the tutors
            </Link>
          </p>
        </div>
      )
    },
    {
      q: "What services do you offer?",
      a: (
        <p className="text-white/80 leading-relaxed">
          We offer 1-on-1 tutoring, exam/test prep, homework support, and writing/English support.{" "}
          <Link href="/services" className="text-white underline hover:text-white/90">
            See our services
          </Link>
          .
        </p>
      )
    },
    {
      q: "Where can I see pricing?",
      a: (
        <p className="text-white/80 leading-relaxed">
          Pricing is consistent across tutors and shown on our pricing page.{" "}
          <Link href="/pricing" className="text-white underline hover:text-white/90">
            View pricing
          </Link>
          .
        </p>
      )
    },
    {
      q: "What happens after I submit a tutoring request?",
      a: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>
            Once you submit a request, the tutor will <span className="text-white font-semibold">reach out</span> to confirm details.
          </p>
          <p>
            You can also request a <span className="text-white font-semibold">call</span> instead of email when you submit your booking.
          </p>
        </div>
      )
    },
    {
      q: "How do you communicate (email, WhatsApp, calls)?",
      a: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>
            All correspondence is run through <span className="text-white font-semibold">WhatsApp</span>, and it’s kept very organized.
          </p>
          <p>
            Typically, the <span className="text-white font-semibold">parent and student</span> are included in a WhatsApp group chat
            with the tutor. That way, both have transparent access to updates, schedules, and what’s being covered.
          </p>
        </div>
      )
    },
    {
      q: "Are lesson times fixed every week?",
      a: (
        <div className="space-y-2 text-white/80 leading-relaxed">
          <p>
            No — times are <span className="text-white font-semibold">flexible</span>. After you make a request and match with a tutor,
            schedules can be adjusted easily.
          </p>
          <p>
            Hours can be <span className="text-white font-semibold">swapped</span>, <span className="text-white font-semibold">increased</span>,
            or <span className="text-white font-semibold">decreased</span> depending on the student’s needs and upcoming deadlines.
          </p>
        </div>
      )
    },

    // Extra helpful FAQs (recommended)
    {
      q: "Do you offer online tutoring?",
      a: (
        <p className="text-white/80 leading-relaxed">
          Yes — we offer <span className="text-white font-semibold">online tutoring worldwide</span>. Students can join from anywhere
          as long as they have a stable internet connection.
        </p>
      )
    },
    {
      q: "Do you offer in-person tutoring?",
      a: (
        <p className="text-white/80 leading-relaxed">
          We offer limited in-person tutoring in select locations (for example{" "}
          <span className="text-white font-semibold">Dubai</span> and{" "}
          <span className="text-white font-semibold">Canada</span>) depending on availability.
        </p>
      )
    },
    {
      q: "What ages/grades do you teach?",
      a: (
        <p className="text-white/80 leading-relaxed">
          We typically support students from <span className="text-white font-semibold">middle school through high school</span>,
          plus focused exam prep and study skill building.
        </p>
      )
    },
    {
      q: "Can you help if a student is behind and needs foundations?",
      a: (
        <p className="text-white/80 leading-relaxed">
          Yes. Many students come to us needing a reset. We rebuild foundations first, then move toward grade-level material
          with a structured plan.
        </p>
      )
    },
    {
      q: "Can I change tutors if it’s not the right fit?",
      a: (
        <p className="text-white/80 leading-relaxed">
          Yes. The goal is progress and comfort — if you want to switch tutors, we can help match you with someone else.
        </p>
      )
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* glow background */}
      <div className="pointer-events-none absolute -top-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />

      <PageHeader
        title="FAQ"
        subtitle="Quick answers about sessions, scheduling, payments, and how we communicate."
      />

      <Container>
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 space-y-8">
          
          {/* FAQ list */}
          <section className="grid gap-5">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20 backdrop-blur"
              >
                <h3 className="text-white font-semibold text-lg">{item.q}</h3>
                <div className="mt-3">{item.a}</div>
              </div>
            ))}
          </section>

          {/* Closing note */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20 backdrop-blur">
            <h3 className="text-white font-semibold text-lg">Still have a question?</h3>
            <p className="mt-2 text-white/70">
              Submit a request and include your question in the message — we’ll get back to you quickly with the best next step.
            </p>
            <div className="mt-5">
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
