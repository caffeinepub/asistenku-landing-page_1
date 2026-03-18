import { Link } from "@tanstack/react-router";

const WA_LINK = "https://wa.me/628817743613";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-soft">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" aria-label="Asistenku Home">
          <img
            src="/assets/uploads/asistenku-horizontal-1.png"
            alt="Asistenku"
            className="h-8 w-auto object-contain"
          />
        </a>
        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-teal px-3 py-1.5 sm:px-5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm"
          >
            Hubungi Kami
          </a>
          <Link
            to="/client-login"
            className="btn-teal px-3 py-1.5 sm:px-5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm"
          >
            Masuk
          </Link>
          <Link
            to="/client-register"
            className="btn-teal px-3 py-1.5 sm:px-5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}
