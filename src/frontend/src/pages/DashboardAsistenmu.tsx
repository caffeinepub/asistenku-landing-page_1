import { useNavigate } from "@tanstack/react-router";
import { ClipboardList, Clock, LogOut, Star } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function DashboardAsistenmu() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();

  function handleLogout() {
    clear();
    void navigate({ to: "/portal-internal" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={20} className="text-slate-700" />
            <span className="font-display font-bold text-slate-900">
              Dashboard Asistenmu
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

      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                <Star size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  Selamat datang, Asistenmu
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Anda siap membantu klien Asistenku hari ini
                </p>
              </div>
            </div>
            {principalId && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">Principal ID:</p>
                <p className="text-xs font-mono text-slate-700 break-all mt-1">
                  {principalId}
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={22} className="text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tugas Aktif</p>
                <p className="font-display font-bold text-slate-900 text-lg mt-0.5">
                  Kelola delegasi
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Clock size={22} className="text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Status Akun</p>
                <p className="font-display font-bold text-slate-900 text-lg mt-0.5">
                  Aktif
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-slate-900 rounded-2xl p-8 text-white">
            <h2 className="font-display text-xl font-bold mb-3">
              Portal Asistenmu
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Sebagai Asistenmu, Anda mendampingi klien dalam pengaturan
              delegasi tugas. Pastikan setiap tugas yang didelegasikan berjalan
              dengan kualitas terbaik dan tepat waktu.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Asistenku. Portal Asistenmu
            &mdash; Akses Terbatas.
          </p>
        </div>
      </footer>
    </div>
  );
}
