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
    <nav className="sticky top-0 z-50 border-b border-blue-200 bg-gradient-to-r from-sky-100 via-blue-100 to-cyan-100 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tight text-slate-900 transition hover:opacity-90"
        >
          <span className="text-slate-900">K-</span>
          <span className="text-blue-600">Cubed</span>
          <span className="text-slate-900"> Tutoring</span>
        </Link>

        {/* Center nav */}
        <div className="hidden items-center rounded-full border border-blue-200 bg-white/80 p-1 shadow-sm md:flex">
          <Link
            href="/tutors"
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Tutors
          </Link>

          <Link
            href="/apply"
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Become a Tutor
          </Link>

          <Link
            href="/services"
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
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
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                {dashboardLabel}
              </Link>

              <Link
                href="/book"
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
              >
                Book Now
              </Link>

              <div className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Sign Up
              </Link>

              <Link
                href="/book"
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
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