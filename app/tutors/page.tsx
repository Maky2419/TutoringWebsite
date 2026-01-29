"use client";

import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Tutor = {
  id: number;
  name: string;
  subjects: string;
  bio: string;
  hourlyRate: number;
};

function extractTopics(subjects: string): string[] {
  return subjects
    .split(/[,\n/|•]+|\s&\s|\s+and\s+/gi)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedTopic = (searchParams.get("topic") ?? "").trim();
  const query = (searchParams.get("q") ?? "").trim();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/tutors", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load tutors");
        const data = (await res.json()) as Tutor[];
        if (!cancelled) setTutors(data);
      } catch {
        if (!cancelled) setTutors([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const allTopics = useMemo(() => {
    const topics = tutors.flatMap((t) => extractTopics(t.subjects));
    return Array.from(new Set(topics)).sort((a, b) => a.localeCompare(b));
  }, [tutors]);

  function setParam(key: "topic" | "q", value: string) {
    const params = new URLSearchParams(searchParams.toString());

    const cleaned = value.trim();

    if (!cleaned) params.delete(key);
    else params.set(key, cleaned);

    // if user changes topic but search is empty, keep it empty; same for q
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  const filteredTutors = useMemo(() => {
    let result = tutors;

    if (selectedTopic) {
      const needle = selectedTopic.toLowerCase();
      result = result.filter((t) => t.subjects.toLowerCase().includes(needle));
    }

    if (query) {
      const q = query.toLowerCase();
      result = result.filter((t) => {
        return (
          t.name.toLowerCase().includes(q) ||
          t.subjects.toLowerCase().includes(q) ||
          t.bio.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [tutors, selectedTopic, query]);

  return (
    <div className="relative overflow-hidden">
      {/* subtle background decoration */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />

      <PageHeader title="Tutors" subtitle="Browse tutors by subject and style." />

      <Container>
        {/* top info bar */}
        <div className="glass mb-8 flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div className="w-full">
            <p className="text-sm text-white/70">
              Find the right fit — click a tutor to view their profile and availability.
            </p>

            {/* filters */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {/* search */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="search"
                  className="text-sm font-medium text-white/80"
                >
                  Search
                </label>
                <input
                  id="search"
                  value={query}
                  onChange={(e) => setParam("q", e.target.value)}
                  placeholder="Try: calculus, AP, physics, IB…"
                  className="h-10 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/30"
                  disabled={loading}
                />
              </div>

              {/* topic */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="topic"
                  className="text-sm font-medium text-white/80"
                >
                  Filter by topic
                </label>
                <select
                  id="topic"
                  value={selectedTopic}
                  onChange={(e) => setParam("topic", e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/30"
                  disabled={loading}
                >
                  <option className="bg-slate-900" value="">
                    All topics
                  </option>
                  {allTopics.map((t) => (
                    <option key={t} className="bg-slate-900" value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 text-sm text-white/60">
              {loading ? "Loading..." : `${filteredTutors.length} shown`}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/60">
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">
              {loading ? "—" : tutors.length} tutors
            </span>
            
          </div>
        </div>

        <div className="grid gap-6 pb-14 md:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            filteredTutors.map((t) => (
              <Link
                key={t.id}
                href={`/tutors/${t.id}`}
                className="glass group relative p-6 transition hover:scale-[1.02] hover:border-white/30"
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
                  <span className="text-sm text-white/60">View profile →</span>

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

          {!loading && filteredTutors.length === 0 && (
            <div className="glass col-span-full p-6 text-white/70">
              No tutors match your filter/search yet.
            </div>
          )}

          {loading && (
            <div className="glass col-span-full p-6 text-white/70">
              Loading tutors…
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
