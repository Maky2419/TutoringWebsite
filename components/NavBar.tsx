import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import SignOutButton from "./SignOutButton";
import CurrencyToggle from "./CurrencyToggle";

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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="min-w-0 text-xl font-extrabold tracking-tight text-slate-900 transition hover:opacity-90 sm:text-2xl lg:text-3xl"
        >
          <span className="text-slate-900">K-</span>
          <span className="text-blue-600">Cubed</span>
          <span className="hidden text-slate-900 sm:inline"> Tutoring</span>
        </Link>

        {/* Center nav - laptop/tablet */}
        <div className="hidden items-center rounded-full border border-blue-200 bg-white/80 p-1 shadow-sm md:flex">
          <Link
            href="/tutors"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 lg:px-5"
          >
            Tutors
          </Link>

          <Link
            href="/apply"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 lg:px-5"
          >
            Become a Tutor
          </Link>

          <Link
            href="/services"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 lg:px-5"
          >
            Services
          </Link>
        </div>

        {/* Right side - laptop/tablet */}
        <div className="hidden items-center gap-3 md:flex">
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
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 lg:px-6"
              >
                Book Now
              </Link>
              <CurrencyToggle />
              

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
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 lg:px-6"
              >
                Book Now
              </Link>
              <CurrencyToggle />
            </>
          )}
        </div>

        {/* Mobile main action */}
        <Link
          href="/book"
          className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 md:hidden"
        >
          Book
        </Link>
      </div>

      {/* Mobile nav */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        <Link
          href="/tutors"
          className="shrink-0 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
        >
          Tutors
        </Link>

        <Link
          href="/services"
          className="shrink-0 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
        >
          Services
        </Link>

        <Link
          href="/apply"
          className="shrink-0 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
        >
          Apply
        </Link>

        {session ? (
          <>
            <Link
              href="/dashboard"
              className="shrink-0 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              Dashboard
            </Link>

            <div className="shrink-0 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <SignOutButton />
            </div>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="shrink-0 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="shrink-0 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}