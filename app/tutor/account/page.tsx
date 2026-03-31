import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TutorAccountClient from "@/components/TutorAccountClient";

function normalizeSubjects(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return [];
}

export default async function TutorAccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "TUTOR") redirect("/dashboard");

  const tutor = await prisma.tutor.findFirst({
    where: { userId: (session.user as any).id },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tutor) {
    redirect("/tutor/dashboard");
  }

  return (
    <TutorAccountClient
      initialProfile={{
        name: tutor.name,
        email: tutor.email,
        subjects: normalizeSubjects(tutor.subjects),
        education: tutor.education || "",
        bio: tutor.bio || "",
      }}
      initialReviews={tutor.reviews.map((review) => ({
        id: review.id,
        student: review.student,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      }))}
    />
  );
}