import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/adminSecurity";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: Request) {
  if (!(await getCurrentAdmin())) {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }
  const logins = await prisma.loginHistory.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
    select: {
      id: true,
      provider: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
  return NextResponse.json({ logins }, { headers: { "Cache-Control": "no-store" } });
}
