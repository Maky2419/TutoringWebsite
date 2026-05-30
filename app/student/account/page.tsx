import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StudentAccountClient from "@/components/StudentAccountClient";

export default async function StudentAccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "STUDENT") {
    redirect("/dashboard");
  }

  return (
    <StudentAccountClient
      initialUser={{
        name: session.user.name || "",
        email: session.user.email || "",
        role: "Student",
      }}
    />
  );
}