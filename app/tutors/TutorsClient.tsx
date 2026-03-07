"use client";
export const dynamic = "force-dynamic";

import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SUBJECT_CATALOG = {
  Languages: [
    "French",
    "English",
    "Spanish",
    "Japanese",
    "Academic Writing",
    "Creative Writing",
    "Reading Comprehension",
  ],
  STEM: [
    "Mathematics",
    "Biology",
    "Physics",
    "Chemistry",
    "Computer Science",
    "Java",
    "Python",
    "Data Science",
    "Algebra",
    "Geometry",
    "Calculus",
    "Statistics",
  ],
  "Business & Economics": [
    "Economics",
    "Business Management",
    "Business Studies",
    "Accounting",
    "Finance",
    "Corporate Finance",
    "Marketing",
    "Investments",
    "Risk Management",
    "Audit",
  ],
  "Humanities & Social Studies": [
    "History",
    "World History",
    "Geography",
    "Political Science",
    "Government and Civics",
    "Sociology",
    "Psychology",
    "International Relations",
    "Philosophy",
    "Cultural Studies",
  ],
};

const CURRICULUM_OPTIONS = [
  "IB",
  "AP",
  "IGCSE",
  "GCSE",
  "A-Level",
  "SAT",
  "University",
  "Professional",
  "PYP",
  "MYP",
  "British",
  "American",
  "CNED",
  "General",
];

export default function TutorsClient() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = (searchParams.get("category") ?? "").trim();
  const selectedCourse = (searchParams.get("course") ?? "").trim();
  const selectedCurriculum = (searchParams.get("curriculum") ?? "").trim();
  const query = (searchParams.get("q") ?? "").trim();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/tutors", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load tutors");

        const data = await res.json();
        if (!cancelled) setTutors(Array.isArray(data) ? data : []);
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

  const availableCourses = useMemo(() => {
    if (!selectedCategory || !SUBJECT_CATALOG[selectedCategory]) return [];
    return SUBJECT_CATALOG[selectedCategory];
  }, [selectedCategory]);

  function setParam(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    const cleaned = value.trim();

    if (!cleaned) {
      params.delete(key);
    } else {
      params.set(key, cleaned);
    }

    if (key === "category") {
      params.delete("course");
    }

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  function clearAllFilters() {
    router.replace(pathname);
  }

  const filteredTutors = useMemo(() => {
    let result = tutors;

    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory);
    }

    if (selectedCourse) {
      result = result.filter(
        (t) => Array.isArray(t.subjects) && t.subjects.includes(selectedCourse)
      );
    }

    if (selectedCurriculum) {
      result = result.filter(
        (t) =>
          Array.isArray(t.curriculum) &&
          t.curriculum.includes(selectedCurriculum)
      );
    }

    if (query) {
      const q = query.toLowerCase();

      result = result.filter((t) => {
        const subjectText = Array.isArray(t.subjects)
          ? t.subjects.join(" ").toLowerCase()
          : "";

        const curriculumText = Array.isArray(t.curriculum)
          ? t.curriculum.join(" ").toLowerCase()
          : "";

        return (
          (t.name ?? "").toLowerCase().includes(q) ||
          (t.category ?? "").toLowerCase().includes(q) ||
          (t.bio ?? "").toLowerCase().includes(q) ||
          subjectText.includes(q) ||
          curriculumText.includes(q)
        );
      });
    }

    return result;
  }, [tutors, selectedCategory, selectedCourse, selectedCurriculum, query]);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />

      <PageHeader
        title="Tutors"
        subtitle="Browse tutors by category, course, and curriculum."
      />

      <Container>
        <div className="glass mb-8 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Filters</h2>
              <p className="mt-1 text-sm text-white/65">
                Pick a category first, then narrow by course and curriculum.
              </p>
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              Clear all
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                placeholder="Search tutors, subjects..."
                className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/30"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="category"
                className="text-sm font-medium text-white/80"
              >
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setParam("category", e.target.value)}
                className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/30"
                disabled={loading}
              >
                <option className="bg-slate-900" value="">
                  All categories
                </option>
                {Object.keys(SUBJECT_CATALOG).map((category) => (
                  <option
                    key={category}
                    className="bg-slate-900"
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="course"
                className="text-sm font-medium text-white/80"
              >
                Course / Subject
              </label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setParam("course", e.target.value)}
                className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || !selectedCategory}
              >
                <option className="bg-slate-900" value="">
                  {selectedCategory ? "All courses" : "Select category first"}
                </option>
                {availableCourses.map((course) => (
                  <option key={course} className="bg-slate-900" value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="curriculum"
                className="text-sm font-medium text-white/80"
              >
                Curriculum
              </label>
              <select
                id="curriculum"
                value={selectedCurriculum}
                onChange={(e) => setParam("curriculum", e.target.value)}
                className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/30"
                disabled={loading}
              >
                <option className="bg-slate-900" value="">
                  All curricula
                </option>
                {CURRICULUM_OPTIONS.map((curriculum) => (
                  <option
                    key={curriculum}
                    className="bg-slate-900"
                    value={curriculum}
                  >
                    {curriculum}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {selectedCategory && (
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80">
                Category: {selectedCategory}
              </span>
            )}
            {selectedCourse && (
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80">
                Course: {selectedCourse}
              </span>
            )}
            {selectedCurriculum && (
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80">
                Curriculum: {selectedCurriculum}
              </span>
            )}
            {query && (
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80">
                Search: {query}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-white/65">
            <span>{loading ? "Loading..." : `${filteredTutors.length} shown`}</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/75">
              {loading ? "—" : tutors.length} tutors total
            </span>
          </div>
        </div>

        <div className="grid gap-6 pb-14 md:grid-cols-2 xl:grid-cols-3">
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

                    <p className="mt-1 text-sm text-white/70">
                      {Array.isArray(t.subjects) ? t.subjects.join(", ") : ""}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.category && (
                        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/75">
                          {t.category}
                        </span>
                      )}

                      {Array.isArray(t.curriculum) &&
                        t.curriculum.slice(0, 3).map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/75"
                          >
                            {item}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white">
                    ${t.hourlyRate}/hr
                  </div>
                </div>

                <p className="mt-4 line-clamp-4 text-sm text-white/70">
                  {t.bio}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-white/60">View profile →</span>

                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                    Available
                  </span>
                </div>

                <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-white/10 blur-2xl" />
                </div>
              </Link>
            ))}

          {!loading && filteredTutors.length === 0 && (
            <div className="glass col-span-full p-6 text-white/70">
              No tutors match your selected filters yet.
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