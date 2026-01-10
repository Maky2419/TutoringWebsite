import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";
import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function TutorsPage() {
  const tutors = await prisma.tutor.findMany({ orderBy: { id: "asc" } });

  return (
    <div className="relative overflow-hidden">
      {/* subtle background decoration */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />

      <PageHeader title="Tutors" subtitle="Browse tutors by subject and style." />

      <Container>
        {/* top info bar */}
        <div className="glass mb-8 flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/70">
              Find the right fit — click a tutor to view their profile and availability.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              {tutors.length} tutors
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              Online
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              Flexible scheduling
            </span>
          </div>
        </div>

        <div className="grid gap-6 pb-14 md:grid-cols-2 lg:grid-cols-3">
          {tutors.map((t) => (
            <Link
              key={t.id}
              href={`/tutors/${t.id}`}
              className="glass group p-6 transition hover:scale-[1.02] hover:border-white/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-semibold text-white">
                    {t.name}
                  </h3>
                  <p className="mt-1 text-sm text-white/70">{t.subjects}</p>
                </div>

                <div className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white">
                  ${t.hourlyRate}/hr
                </div>
              </div>

              <p className="mt-4 line-clamp-3 text-sm text-white/70">
                {t.bio}
              </p>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-white/60">
                  View profile →
                </span>

                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                  Available
                </span>
              </div>

              {/* hover shine */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-white/10 blur-2xl" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
