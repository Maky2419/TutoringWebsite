import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import SignOutButton from "./SignOutButton";

export default async function NavBar() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  const dashboardLabel =
    role === "ADMIN"
      ? "Admin Dashboard"
      : role === "TUTOR"
      ? "Tutor Dashboard"
      : "Student Dashboard";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-white transition hover:opacity-90"
        >
          <span className="text-white">K-</span>
          <span className="text-indigo-400">Cubed</span>
          <span className="text-white"> Tutoring</span>
        </Link>

        {/* Center nav pill */}
        <div className="hidden md:flex items-center rounded-full border border-white/10 bg-white/5 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <Link
            href="/tutors"
            className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Tutors
          </Link>
          <Link
            href="/apply"
            className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Become a Tutor
          </Link>
          <Link
            href="/services"
            className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Services
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {dashboardLabel}
              </Link>

              <Link
                href="/book"
                className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
              >
                Book Now
              </Link>

              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Sign Up
              </Link>

              <Link
                href="/book"
                className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
              >
                Book Now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}