import Container from "../../../components/Container";
import PageHeader from "../../../components/PageHeader";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";

function stars(rating: number) {
  const safe = Math.max(0, Math.min(5, rating));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
}

export default async function TutorPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);

  if (Number.isNaN(id)) notFound();

  const tutor = await prisma.tutor.findUnique({
    where: { id },
    include: {
      reviews: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!tutor) notFound();

  const reviewCount = tutor.reviews.length;

  const avgRating =
    reviewCount === 0
      ? 0
      : tutor.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

  const subjects = Array.isArray(tutor.subjects)
    ? tutor.subjects.join(", ")
    : "";

  const curriculum = Array.isArray(tutor.curriculum)
    ? tutor.curriculum.join(", ")
    : "";

  return (
    <div>
      <PageHeader
        title={tutor.name}
        subtitle={[tutor.category, subjects].filter(Boolean).join(" • ")}
      />

      <Container>
        <div className="space-y-8 py-10">
          {/* Profile Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 md:p-8 shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-5 sm:p-7 md:p-8">
              <div className="space-y-6 flex-1">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Category
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {tutor.category || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Subjects
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {subjects || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Curriculum
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {curriculum || "—"}
                  </p>
                </div>

                {tutor.education && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Education
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {tutor.education}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6 text-left md:text-right">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Hourly Rate
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${tutor.hourlyRate}/hr
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Rating
                  </p>

                  <p className="text-3xl font-bold text-slate-900">
                    {reviewCount === 0 ? "New" : avgRating.toFixed(1)}
                    {reviewCount > 0 && (
                      <span className="text-base font-normal text-slate-500">
                        {" "}
                        / 5
                      </span>
                    )}
                  </p>

                  {reviewCount > 0 && (
                    <p className="text-sm text-slate-600">
                      <span className="text-yellow-500">
                        {stars(Math.round(avgRating))}
                      </span>{" "}
                      • {reviewCount} reviews
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <p className="text-sm font-medium text-slate-500">About</p>

              <p className="mt-3 leading-8 text-slate-700">
                {tutor.bio || "No biography provided."}
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/book"
                className="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Request a Booking
              </Link>
            </div>
          </div>

          {/* Reviews */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 md:p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                Reviews
              </h2>

              <p className="text-sm text-slate-500">
                {reviewCount} review{reviewCount === 1 ? "" : "s"}
              </p>
            </div>

            {reviewCount === 0 ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-slate-500">
                  No reviews yet. Be the first student to leave a review.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {tutor.reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {r.student}
                        </p>

                        <p className="text-yellow-500">
                          {stars(r.rating)}
                        </p>
                      </div>

                      <p className="text-sm text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="mt-3 leading-7 text-slate-700">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}