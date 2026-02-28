import { Link } from "@tanstack/react-router";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-400 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/uploads/asistenku-icon-2.png"
              alt="Asistenku Icon"
              className="h-8 w-8 object-contain opacity-80"
            />
            <span className="text-sm font-medium text-slate-300">
              Asistenku
            </span>
          </div>
          <p className="text-sm text-center">
            &copy; {currentYear} Asistenku. Semua hak dilindungi.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/portal-internal"
              className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Portal Internal
            </Link>
            <Link
              to="/portal-partner"
              className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Portal Partner
            </Link>
            <p className="text-xs text-slate-500">
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
