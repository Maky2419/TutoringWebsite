import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";



export default async function DashboardRouterPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;

  if (role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  if (role === "TUTOR") {
    redirect("/tutor/dashboard");
  }

  redirect("/student/dashboard");
}