import { Link } from "@tanstack/react-router";
import { ShieldOff } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md mx-auto flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
            <ShieldOff size={36} className="text-slate-400" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-7xl font-bold text-slate-900">
              404
            </h1>
            <p className="text-lg font-semibold text-slate-700">
              Anda tidak mempunyai akses ke halaman ini.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Halaman yang Anda coba akses tidak tersedia atau Anda tidak
              memiliki izin untuk mengaksesnya.
            </p>
          </div>
          <Link
            to="/"
            className="btn-teal px-6 py-3 rounded-full font-semibold text-sm shadow-soft"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
