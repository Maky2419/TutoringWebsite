import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import TutorScheduleManager from "../../../components/TutorScheduleManager";

export default async function TutorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "TUTOR") redirect("/dashboard");

  const userId = (session.user as any).id;

  const tutor = await prisma.tutor.findFirst({
    where: { userId },
  });

  if (!tutor) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-6 text-rose-100">
          No tutor profile exists for this account yet.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-4xl font-bold text-white">Tutor Dashboard</h1>
      <p className="mt-2 text-white/60">
        Welcome back, {session.user.name || tutor.name}.
      </p>

      <div className="mt-10">
        <TutorScheduleManager />
      </div>
    </div>
  );
}