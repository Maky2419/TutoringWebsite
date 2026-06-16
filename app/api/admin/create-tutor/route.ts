import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const hashed = await bcrypt.hash(
    body.password,
    10
  );

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashed,
      role: "TUTOR",
    },
  });

  await prisma.tutor.create({
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

  return NextResponse.json({
    success: true,
  });
}