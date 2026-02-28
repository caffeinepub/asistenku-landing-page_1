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
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-teal px-5 py-2 rounded-full font-semibold text-sm"
        >
          Hubungi Kami
        </a>
      </div>
    </header>
  );
}
