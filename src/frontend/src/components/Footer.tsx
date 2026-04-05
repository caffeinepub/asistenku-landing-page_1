export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 self-center sm:self-start -ml-2">
            <a href="https://asistenku.id/" className="flex items-center gap-3">
              <img
                src="/assets/uploads/asistenku-icon-2.png"
                alt="Asistenku Icon"
                className="h-8 w-8 object-contain opacity-80"
              />
              <span className="text-sm font-medium text-slate-300">
                Asistenku
              </span>
            </a>
          </div>

          {/* Center: Partner CTA above copyright */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-300 font-medium">
                Ingin jadi Partner dari Asistenku?
              </p>
              <a
                href="https://asistenku.id/tentang-partner-asistenku/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-slate-600 text-slate-300 px-4 py-1.5 rounded-full text-sm font-semibold hover:border-slate-400 hover:bg-slate-800 transition-all whitespace-nowrap"
              >
                Pelajari
              </a>
            </div>
            <p className="text-sm text-slate-400">
              Asistenku &copy; 2026 PT. Asistenku Digital Indonesia
            </p>
          </div>

          {/* Right: Portal links */}
          <div className="flex flex-col gap-2">
            <a
              href="https://asistenku.id/portal-partner-asistenku/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Portal Partner
            </a>
            <a
              href="https://asistenku.id/portal-internal-asistenku/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Portal Internal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
