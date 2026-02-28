import { useNavigate } from "@tanstack/react-router";
import { LogOut, Users } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function DashboardPartner() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();

  function handleLogout() {
    clear();
    void navigate({ to: "/portal-partner" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-slate-700" />
            <span className="font-display font-bold text-slate-900">
              Dashboard Partner
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <LogOut size={15} />
            Keluar
          </button>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                <Users size={22} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  Selamat datang, Partner
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Anda telah berhasil masuk ke dashboard partner
                </p>
              </div>
            </div>
            {principalId && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Principal ID:</p>
                <p className="text-xs font-mono text-slate-700 break-all">
                  {principalId}
                </p>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3">
              Area Kerja Partner
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Fitur dashboard partner sedang dalam pengembangan. Tim Asistenku
              akan segera melengkapi fitur-fitur yang mendukung aktivitas Anda
              sebagai partner.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Asistenku. Dashboard Partner
            &mdash; Area Terbatas.
          </p>
        </div>
      </footer>
    </div>
  );
}
