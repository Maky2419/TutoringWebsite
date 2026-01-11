import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const tutors = await prisma.tutor.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(tutors);
}
