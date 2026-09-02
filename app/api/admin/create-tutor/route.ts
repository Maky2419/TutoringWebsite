import { getCurrentAdmin } from "@/lib/adminSecurity";
import { recordActivity } from "@/lib/activity";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const body = await req.json();

  const hashed = await bcrypt.hash(
    body.password,
    10
  );

  await prisma.$transaction(async tx => {
    const user = await tx.user.create({
        data: {
            name: body.name,
            email: body.email,
            password: hashed,
            role: "TUTOR",
        },
    });
    const tutor = await tx.tutor.create({
        data: {
            name: body.name,
            email: body.email,
            bio: body.bio,
            education: body.education,
            category: body.category,
            hourlyRate: Number(body.hourlyRate),
            subjects: body.subjects,
            curriculum: body.curriculum,
            userId: user.id,
        },
    });
    await recordActivity(tx, { actorId: admin.id, action: "TUTOR_CREATED", entityType: "Tutor", entityId: tutor.id,
        details: { tutorId: tutor.id } });
  });

  return NextResponse.json({
    success: true,
  });
}