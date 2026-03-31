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
    where: { userId: (session.user as any).id },
  });
}

function normalizeSubjects(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  return [];
}

export async function GET() {
  const tutor = await getTutorFromSession();

  if (!tutor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: tutor.id,
    name: tutor.name,
    email: tutor.email,
    subjects: normalizeSubjects(tutor.subjects),
    education: tutor.education || "",
    bio: tutor.bio || "",
  });
}

export async function PATCH(req: Request) {
  const tutor = await getTutorFromSession();

  if (!tutor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const subjects = normalizeSubjects(body.subjects);
  const education = String(body.education || "").trim();
  const bio = String(body.bio || "").trim();

  if (!bio) {
    return NextResponse.json({ error: "Bio is required" }, { status: 400 });
  }

  const updatedTutor = await prisma.tutor.update({
    where: { id: tutor.id },
    data: {
      subjects,
      education,
      bio,
    },
  });

  return NextResponse.json({
    ok: true,
    tutor: {
      id: updatedTutor.id,
      subjects: normalizeSubjects(updatedTutor.subjects),
      education: updatedTutor.education || "",
      bio: updatedTutor.bio || "",
    },
  });
}