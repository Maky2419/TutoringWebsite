import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const tutor = await prisma.tutor.findUnique({ where: { id } });
  if (!tutor) return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  return NextResponse.json(tutor);
}
