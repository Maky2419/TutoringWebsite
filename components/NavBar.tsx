import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-wide">
          Tutor<span className="text-indigo-400">Amber</span>
        </Link>

        <div className="flex gap-6 items-center text-sm">
          <Link href="/tutors" className="hover:text-indigo-400">Tutors</Link>
          <Link href="/apply"className="hover:text-indigo-400" >Become a tutor</Link>
          <Link href="/pricing" className="hover:text-indigo-400">Pricing</Link>
          <Link href="/services" className="hover:text-indigo-400">Services</Link>
          <Link href="/book" className="btn-primary">Book Now</Link>
          
        </div>
      </div>
    </nav>
  );
}
