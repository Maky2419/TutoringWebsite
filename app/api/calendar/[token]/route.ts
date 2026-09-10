import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCalendarFeed, type CalendarFeedSession } from "@/lib/calendarFeed";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { token: string } }) {
  const user = await prisma.user.findUnique({
    where: { calendarFeedToken: params.token },
    include: {
      assignedTutors: { include: { tutor: true, sessions: true } },
      tutor: { include: { assignedStudents: { include: { student: true, sessions: true } } } },
    },
  });

  if (!user) return new NextResponse("Calendar not found", { status: 404 });

  const items: CalendarFeedSession[] = user.role === "TUTOR" && user.tutor
    ? user.tutor.assignedStudents.flatMap(assignment =>
        assignment.sessions.map(item => ({
          ...item,
          title: `Tutoring with ${assignment.student.name || "Student"}`,
          description: item.notes || `Student: ${assignment.student.email || "Not provided"}`,
        })))
    : user.assignedTutors.flatMap(assignment =>
        assignment.sessions.map(item => ({
          ...item,
          title: `Tutoring with ${assignment.tutor.name}`,
          description: item.notes || `Tutor: ${assignment.tutor.email}`,
        })));

  const body = createCalendarFeed("K-Cubed Tutoring", items);
  const download = new URL(request.url).searchParams.get("download") === "1";
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="kcubed-tutoring.ics"`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
