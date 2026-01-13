export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-32">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-white/60">
        <div>
          <h3 className="font-semibold text-white mb-3">TutorHub</h3>
          <p>Premium tutoring, made simple.</p>
        </div>

        <div>
          <p><a href="/about">About</a></p>
        </div>

        <div>
          <p><a href="/faq">FAQ</a></p>
          <p><a href="/contact">Contact</a></p>
        </div>

        <div>
          <p><a href="/privacy">Privacy</a></p>
          <p><a href="/terms">Terms</a></p>
        </div>
      </div>
    </footer>
  );
}
