import Container from "../../../components/Container";
import PageHeader from "../../../components/PageHeader";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";

function stars(rating: number) {
  const safe = Math.max(0, Math.min(5, rating));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
}

export default async function TutorPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const tutor = await prisma.tutor.findUnique({
    where: { id },
    include: { reviews: { orderBy: { createdAt: "desc" } } }
  });

  if (!tutor) notFound();

  const reviewCount = tutor.reviews.length;
  const avgRating =
    reviewCount === 0
      ? 0
      : tutor.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

  const subjects = Array.isArray(tutor.subjects) ? tutor.subjects.join(", ") : "";
  const curriculum = Array.isArray(tutor.curriculum) ? tutor.curriculum.join(", ") : "";

  return (
    <div>
      <PageHeader
        title={tutor.name}
        subtitle={[tutor.category, subjects].filter(Boolean).join(" • ")}
      />

      <Container>
        <div className="space-y-8 py-10">
          {/* Profile Card */}
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/70">Category</p>
                  <p className="text-lg font-semibold text-white">
                    {tutor.category || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-white/70">Subjects</p>
                  <p className="text-lg font-semibold text-white">
                    {subjects || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-white/70">Curriculum</p>
                  <p className="text-lg font-semibold text-white">
                    {curriculum || "—"}
                  </p>
                </div>

                {tutor.education && (
                  <div>
                    <p className="text-sm text-white/70">Education</p>
                    <p className="text-lg font-semibold text-white">
                      {tutor.education}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4 text-left md:text-right">
                <div>
                  <p className="text-sm text-white/70">Hourly rate</p>
                  <p className="text-2xl font-bold text-white">
                    ${tutor.hourlyRate}/hr
                  </p>
                </div>

                <div>
                  <p className="text-sm text-white/70">Rating</p>
                  <p className="text-2xl font-bold text-white">
                    {reviewCount === 0 ? "New" : avgRating.toFixed(1)}
                    <span className="text-sm text-white/70"> / 5</span>
                  </p>
                  {reviewCount > 0 && (
                    <p className="text-sm text-white/80">
                      {stars(Math.round(avgRating))} • {reviewCount} reviews
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-white/70">About</p>
              <p className="mt-2 text-white/90">{tutor.bio}</p>
            </div>

            <div className="mt-6">
              <Link
                href="/book"
                className="inline-flex rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
              >
                Request a booking
              </Link>
            </div>
          </div>

          {/* Reviews */}
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Reviews</h2>
              <p className="text-sm text-white/70">{reviewCount} reviews</p>
            </div>

            {reviewCount === 0 ? (
              <p className="mt-4 text-white/70">No reviews yet.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {tutor.reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl bg-white p-4 text-black shadow"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {r.student}{" "}
                        <span className="ml-1 text-yellow-500">
                          {stars(r.rating)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-2 text-gray-800">{r.comment}</p>
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