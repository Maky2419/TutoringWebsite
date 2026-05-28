import Link from "next/link";
import Container from "../components/Container";
import { prisma } from "../lib/prisma";

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value ? [value] : [];
    }
  }

  return [];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function HomePage() {
  const tutors = await prisma.tutor.findMany({
    take: 6,
    orderBy: { id: "asc" },
  });

  const testimonials = await prisma.review.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { tutor: true },
  });

  const subjects = Array.from(
    new Set(tutors.flatMap((tutor) => toList(tutor.subjects)))
  ).slice(0, 8);

  const fallbackSubjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "French",
    "Computer Science",
  ];

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <section className="border-b border-blue-100 bg-gradient-to-br from-white via-sky-50 to-blue-50">
        <Container>
          <div className="grid items-center gap-14 py-20 md:grid-cols-2 md:py-28">
            <div>
              <p className="inline-flex rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                IB Curriculum Specialist
              </p>

              <h1 className="mt-7 text-5xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-7xl">
                Premium
                <span className="block text-blue-600">One-on-One</span>
                Tutoring
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600">
                Personalized tutoring by experienced teachers, helping students
                improve confidence, focus, and academic performance.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  href="https://wa.me/971585897137"
                  className="rounded-2xl bg-green-500 px-8 py-4 text-center font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-green-600"
                >
                  WhatsApp Us
                </a>

                <Link
                  href="/book"
                  className="rounded-2xl border border-blue-200 bg-white px-8 py-4 text-center font-bold text-blue-700 shadow-sm transition hover:-translate-y-1 hover:bg-blue-50"
                >
                  Book a Session
                </Link>
              </div>
            </div>

            <div className="rounded-[36px] border border-blue-100 bg-white p-6 shadow-xl">
              <div className="rounded-[28px] bg-blue-50 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
                  Personalized Learning
                </p>

                <h2 className="mt-4 text-3xl font-extrabold text-slate-950">
                  Better support. Better confidence. Better results.
                </h2>

                <div className="mt-8 space-y-4">
                  {[
                    "Personalized study plans",
                    "Flexible online tutoring",
                    "Immediate feedback",
                    "Confidence-focused teaching",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        ✓
                      </span>
                      <p className="font-semibold text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-700">
                    WhatsApp: +971-585897137
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <div className="flex-1">
        <Container>
          <section className="py-20">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="font-semibold text-blue-600">Why K-Cubed?</p>

              <h2 className="mt-3 text-4xl font-extrabold text-slate-950">
                Tutoring designed around the student
              </h2>

              <p className="mt-4 text-slate-600">
                Clear, focused, one-on-one support that helps students learn at
                their own pace.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Personalized Learning",
                "Faster Improvement",
                "Better Focus",
                "Flexible Pace",
                "Immediate Feedback",
                "Improved Grades",
                "Confidence Boosting",
                "Tailored Learning",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-5 h-12 w-12 rounded-2xl bg-blue-100" />
                  <h3 className="text-lg font-bold text-slate-900">
                    {benefit}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    Structured academic support built around the student’s
                    goals.
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-12">
            <div className="rounded-[36px] bg-blue-600 px-8 py-16 shadow-xl md:px-14">
              <div className="text-center text-white">
                <p className="font-semibold text-blue-100">Subjects</p>

                <h2 className="mt-3 text-4xl font-extrabold">
                  Our Tutors Specialize In
                </h2>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(subjects.length > 0 ? subjects : fallbackSubjects).map(
                  (subject) => (
                    <div
                      key={subject}
                      className="rounded-2xl border border-white/20 bg-white/10 p-5 text-center font-bold text-white"
                    >
                      {subject}
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          <section className="py-20">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="font-semibold text-blue-600">Tutor Profiles</p>

              <h2 className="mt-3 text-4xl font-extrabold text-slate-950">
                Meet Our Tutors
              </h2>

              <p className="mt-4 text-slate-600">
                Browse tutors, subjects, and hourly rates pulled from your
                database.
              </p>
            </div>

            {tutors.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {tutors.map((tutor) => {
                  const tutorSubjects = toList(tutor.subjects);

                  return (
                    <div
                      key={tutor.id}
                      className="rounded-[28px] border border-blue-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-xl font-extrabold text-blue-700">
                        {getInitials(tutor.name)}
                      </div>

                      <h3 className="mt-5 text-2xl font-extrabold text-slate-950">
                        {tutor.name}
                      </h3>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {tutorSubjects.length > 0 ? (
                          tutorSubjects.slice(0, 5).map((subject) => (
                            <span
                              key={subject}
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                            >
                              {subject}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            Subjects coming soon
                          </span>
                        )}
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                        <p className="font-bold text-slate-900">
                          ${tutor.hourlyRate}/hr
                        </p>

                        <Link
                          href={`/tutors/${tutor.id}`}
                          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-blue-100 bg-white p-10 text-center shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  No tutor profiles found yet.
                </h3>
              </div>
            )}
          </section>

          <section className="py-20">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="font-semibold text-blue-600">Testimonials</p>

              <h2 className="mt-3 text-4xl font-extrabold text-slate-950">
                Parent & Student Feedback
              </h2>
            </div>

            {testimonials.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[28px] border border-blue-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mb-5">
                      <p className="font-bold text-slate-900">
                        {review.student}
                      </p>
                      <p className="text-sm text-slate-500">
                        Tutor: {review.tutor?.name ?? "K-Cubed Tutor"}
                      </p>
                    </div>

                    <div className="mb-4 text-sm text-yellow-400">
                      {"★".repeat(Math.min(review.rating, 5))}
                    </div>

                    <p className="line-clamp-3 leading-relaxed text-slate-600">
                      “{review.comment}”
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-blue-100 bg-white p-10 text-center shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  No testimonials found yet.
                </h3>
              </div>
            )}
          </section>

          <section className="py-0">
            <div className="overflow-hidden rounded-t-[36px] bg-gradient-to-br from-blue-600 to-sky-500 px-8 py-16 text-center shadow-xl md:px-14">
              <h2 className="text-4xl font-extrabold text-white md:text-5xl">
                Start Learning With Confidence
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
                Book personalized one-on-one tutoring tailored to your subject,
                pace, and goals.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                <a
                  href="https://wa.me/971585897137"
                  className="rounded-2xl bg-green-500 px-8 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-green-600"
                >
                  Contact on WhatsApp
                </a>

                <Link
                  href="/book"
                  className="rounded-2xl border border-white/30 bg-white/10 px-8 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-white/20"
                >
                  Book a Session
                </Link>
              </div>
            </div>
          </section>
        </Container>
      </div>

      <footer className="mt-auto bg-slate-950 px-8 py-14 text-white">
        <Container>
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <h3 className="text-3xl font-extrabold">
                K-<span className="text-blue-400">Cubed</span>
              </h3>

              <p className="mt-5 leading-relaxed text-slate-400">
                Personalized one-on-one tutoring for confident, independent
                learning.
              </p>

              <a
                href="https://wa.me/971585897137"
                className="mt-6 inline-block rounded-2xl bg-green-500 px-6 py-3 font-bold text-white transition hover:bg-green-600"
              >
                WhatsApp Us
              </a>
            </div>

            <div>
              <h4 className="font-bold">Navigation</h4>

              <div className="mt-5 space-y-3">
                <Link href="/" className="block text-slate-400 hover:text-white">
                  Home
                </Link>
                <Link
                  href="/tutors"
                  className="block text-slate-400 hover:text-white"
                >
                  Tutors
                </Link>
                <Link
                  href="/services"
                  className="block text-slate-400 hover:text-white"
                >
                  Services
                </Link>
                <Link
                  href="/book"
                  className="block text-slate-400 hover:text-white"
                >
                  Book Session
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold">Subjects</h4>

              <div className="mt-5 space-y-3 text-slate-400">
                <p>Mathematics</p>
                <p>Physics</p>
                <p>Chemistry</p>
                <p>Biology</p>
                <p>Computer Science</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold">Contact</h4>

              <div className="mt-5 space-y-4 text-slate-400">
                <p>
                  WhatsApp:
                  <br />
                  +971-585897137
                </p>

                <p>Online Tutoring Available Worldwide</p>
                <p>IB Curriculum Specialist</p>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800 pt-6 text-center">
            <p className="text-sm text-slate-500">
              © 2026 K-Cubed Tutoring. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>
    </main>
  );
}