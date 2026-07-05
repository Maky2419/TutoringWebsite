import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getTutorFromSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "TUTOR") {
    return null;
  }

  return prisma.tutor.findFirst({
    where: {
      userId: (session.user as any).id,
    },
  });
}

export async function GET() {
  const tutor = await getTutorFromSession();

  if (!tutor) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: {
      tutorId: tutor.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ reviews });
}

export async function POST(req: Request) {
  const tutor = await getTutorFromSession();

  if (!tutor) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const student = String(body.student || "").trim();
  const comment = String(body.comment || "").trim();
  const rating = Number(body.rating);
  const createdAt = body.createdAt;

  if (!student) {
    return NextResponse.json(
      { error: "Student name is required" },
      { status: 400 }
    );
  }

  if (!comment) {
    return NextResponse.json(
      { error: "Review comment is required" },
      { status: 400 }
    );
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  const review = await prisma.review.create({
    data: {
      tutorId: tutor.id,
      student,
      comment,
      rating,
      ...(createdAt && {
        createdAt: new Date(createdAt),
      }),
    },
  });

  return NextResponse.json({
    ok: true,
    review,
  });
}
