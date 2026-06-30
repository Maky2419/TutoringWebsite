"use client";

import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Money } from "@/components/CurrencyProvider";

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
} as const;

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
] as const;

type SubjectCategory = keyof typeof SUBJECT_CATALOG;

type Tutor = {
  id: number | string;
  name?: string | null;
  email?: string | null;
  category?: string | null;
  subjects?: string[] | null;
  curriculum?: string[] | null;
  bio?: string | null;
  hourlyRate?: number | string | null;
};

export default function TutorsClient() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = (searchParams.get("category") ?? "").trim() as
    | SubjectCategory
    | "";
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

        const data: unknown = await res.json();

        if (!cancelled) {
          setTutors(Array.isArray(data) ? (data as Tutor[]) : []);
        }
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
    if (!selectedCategory) return [];
    return [...SUBJECT_CATALOG[selectedCategory]];
  }, [selectedCategory]);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const cleaned = value.trim();

    if (!cleaned) params.delete(key);
    else params.set(key, cleaned);

    if (key === "category") params.delete("course");

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
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Tutors"
        subtitle="Browse tutors by category, course, and curriculum."
      />

      <Container>
        {/* FILTERS */}
        <div className="mb-8 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Filters</h2>
              <p className="mt-1 text-sm text-slate-600">
                Pick a category first, then narrow by course and curriculum.
              </p>
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Clear all
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="search" className="text-sm font-semibold text-slate-700">
                Search
              </label>
              <input
                id="search"
                value={query}
                onChange={(e) => setParam("q", e.target.value)}
                placeholder="Search tutors, subjects..."
                className="h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="category" className="text-sm font-semibold text-slate-700">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setParam("category", e.target.value)}
                className="h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                disabled={loading}
              >
                <option value="">All categories</option>
                {Object.keys(SUBJECT_CATALOG).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="course" className="text-sm font-semibold text-slate-700">
                Course / Subject
              </label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setParam("course", e.target.value)}
                className="h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || !selectedCategory}
              >
                <option value="">
                  {selectedCategory ? "All courses" : "Select category first"}
                </option>
                {availableCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="curriculum" className="text-sm font-semibold text-slate-700">
                Curriculum
              </label>
              <select
                id="curriculum"
                value={selectedCurriculum}
                onChange={(e) => setParam("curriculum", e.target.value)}
                className="h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                disabled={loading}
              >
                <option value="">All curricula</option>
                {CURRICULUM_OPTIONS.map((curriculum) => (
                  <option key={curriculum} value={curriculum}>
                    {curriculum}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {selectedCategory && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Category: {selectedCategory}
              </span>
            )}
            {selectedCourse && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Course: {selectedCourse}
              </span>
            )}
            {selectedCurriculum && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Curriculum: {selectedCurriculum}
              </span>
            )}
            {query && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Search: {query}
              </span>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
            <span>{loading ? "Loading..." : `${filteredTutors.length} shown`}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {loading ? "—" : tutors.length} tutors total
            </span>
          </div>
        </div>

        {/* TUTOR CARDS */}
      <div className="grid gap-6 pb-14 sm:grid-cols-2 xl:grid-cols-3">
            {!loading &&
            filteredTutors.map((t) => (
              <Link
                key={t.id}
                href={`/tutors/${t.id}`}
                className="group rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-bold text-slate-950">
                      {t.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {Array.isArray(t.subjects) ? t.subjects.join(", ") : ""}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {t.category && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {t.category}
                        </span>
                      )}

                      {Array.isArray(t.curriculum) &&
                        t.curriculum.slice(0, 3).map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                          >
                            {item}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="shrink-0 rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white">
  <Money amountUSD={t.hourlyRate ?? 0} suffix="/hr" />
</div>
                </div>

                <p className="mt-5 line-clamp-4 text-sm leading-relaxed text-slate-600">
                  {t.bio}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="text-sm font-semibold text-blue-600">
                    View profile →
                  </span>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    Available
                  </span>
                </div>
              </Link>
            ))}

          {!loading && filteredTutors.length === 0 && (
            <div className="col-span-full rounded-3xl border border-blue-100 bg-white p-5 sm:p-7 md:p-8 text-slate-700 shadow-sm">
              No tutors match your selected filters yet.
            </div>
          )}

          {loading && (
            <div className="col-span-full rounded-3xl border border-blue-100 bg-white p-5 sm:p-7 md:p-8 text-slate-700 shadow-sm">
              Loading tutors…
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}