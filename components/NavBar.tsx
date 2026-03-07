import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import SignOutButton from "./SignOutButton";

export default async function NavBar() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-wide">
          K-<span className="text-indigo-400">Cubed Tutoring</span>
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/tutors" className="hover:text-indigo-400">
            Tutors
          </Link>
          <Link href="/apply" className="hover:text-indigo-400">
            Become a tutor
          </Link>
          <Link href="/pricing" className="hover:text-indigo-400">
            Pricing
          </Link>
          <Link href="/services" className="hover:text-indigo-400">
            Services
          </Link>

          {session ? (
            <>
              <Link href="/book" className="hover:text-indigo-400">
                Book Now
              </Link>

              <Link href="/dashboard" className="hover:text-indigo-400">
                {role === "ADMIN"
                  ? "Admin Dashboard"
                  : role === "TUTOR"
                  ? "Tutor Dashboard"
                  : "Student Dashboard"}
              </Link>

              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-indigo-400">
                Login
              </Link>
              <Link href="/signup" className="hover:text-indigo-400">
                Sign Up
              </Link>
              <Link
                href="/book"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
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