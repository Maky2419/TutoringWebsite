import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { calendarFeedToken: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let token = user.calendarFeedToken;
  if (!token) {
    token = randomBytes(32).toString("hex");
    await prisma.user.update({ where: { id: userId }, data: { calendarFeedToken: token } });
  }

  const origin = new URL(request.url).origin;
  const feedUrl = `${origin}/api/calendar/${token}`;
  return NextResponse.json({
    feedUrl,
    webcalUrl: feedUrl.replace(/^https?:/, "webcal:"),
    downloadUrl: `${feedUrl}?download=1`,
  });
}
