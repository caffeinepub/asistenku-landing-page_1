import { Link } from "@tanstack/react-router";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 self-center sm:self-start">
            <img
              src="/assets/uploads/asistenku-icon-2.png"
              alt="Asistenku Icon"
              className="h-8 w-8 object-contain opacity-80"
            />
            <span className="text-sm font-medium text-slate-300">
              Asistenku
            </span>
          </div>

          {/* Center-left: Copyright + Partner CTA */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-400">
              Asistenku &copy; 2026 PT. Asistenku Digital Indonesia
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-300 font-medium">
                Ingin jadi Partner dari Asistenku?
              </p>
              <Link
                to="/tentang-partner-asistenku"
                className="inline-block border border-slate-600 text-slate-300 px-5 py-2 rounded-full text-sm font-semibold hover:border-slate-400 hover:bg-slate-800 transition-all w-fit"
              >
                Pelajari
              </Link>
            </div>
          </div>

          {/* Right: Portal links */}
          <div className="flex flex-col gap-2">
            <Link
              to="/portal-partner"
              className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Portal Partner
            </Link>
            <Link
              to="/portal-internal"
              className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Portal Internal
            </Link>
            <p className="text-xs text-slate-500 mt-2">
              Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-300 transition-colors underline underline-offset-2"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
