import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function ClientRegister() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  const isLoggedIn = !!identity;
  const isActorReady = !!actor && !isActorFetching;

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [company, setCompany] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<string | null>(
    null,
  );
  const [registrationError, setRegistrationError] = useState<string | null>(
    null,
  );

  const principalId = identity?.getPrincipal().toString();

  function handleLogin() {
    login();
  }

  async function handleDaftar() {
    if (!actor) return;

    const trimNama = nama.trim();
    const trimEmail = email.trim();
    const trimWa = whatsapp.trim();
    const trimCompany = company.trim();

    if (!trimNama || !trimEmail || !trimWa || !trimCompany) {
      toast.error("Semua field wajib diisi.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimEmail)) {
      toast.error("Format email tidak valid.");
      return;
    }

    setIsRegistering(true);
    setRegistrationResult(null);
    setRegistrationError(null);

    try {
      const act = actor as unknown as Record<
        string,
        (...args: unknown[]) => Promise<unknown>
      >;
      const idUser = (await act.registerClient(
        trimNama,
        trimEmail,
        trimWa,
        trimCompany,
      )) as string;
      setRegistrationResult(
        `Pendaftaran berhasil! ID Anda: ${idUser}. Status: Menunggu persetujuan admin.`,
      );
      toast.success(`Pendaftaran berhasil! ID: ${idUser}`);
      setNama("");
      setEmail("");
      setWhatsapp("");
      setCompany("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      let display = "Terjadi kesalahan saat pendaftaran.";
      if (
        message.toLowerCase().includes("already registered") ||
        message.toLowerCase().includes("sudah terdaftar")
      ) {
        display = "Anda sudah terdaftar sebelumnya sebagai client.";
      }
      setRegistrationError(display);
      toast.error(display);
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 py-12 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8 flex flex-col gap-6">
            {/* Title */}
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-slate-900">
                Daftar sebagai Client
              </h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Login terlebih dahulu untuk mengaktifkan form pendaftaran.
              </p>
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-4">
              {/* Nama */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="client-nama"
                  className="text-sm font-medium text-slate-700"
                >
                  Nama
                </label>
                <input
                  id="client-nama"
                  type="text"
                  placeholder="Nama lengkap"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  disabled={!isLoggedIn || isRegistering}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 disabled:bg-slate-50 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="client-email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="client-email"
                  type="email"
                  placeholder="email@perusahaan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isLoggedIn || isRegistering}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 disabled:bg-slate-50 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
                />
              </div>

              {/* WhatsApp */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="client-whatsapp"
                  className="text-sm font-medium text-slate-700"
                >
                  WhatsApp
                </label>
                <input
                  id="client-whatsapp"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  disabled={!isLoggedIn || isRegistering}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 disabled:bg-slate-50 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
                />
              </div>

              {/* Company */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="client-company"
                  className="text-sm font-medium text-slate-700"
                >
                  Company
                </label>
                <input
                  id="client-company"
                  type="text"
                  placeholder="Nama perusahaan"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={!isLoggedIn || isRegistering}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 disabled:bg-slate-50 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
                />
              </div>
            </div>

            {/* Registration feedback */}
            {registrationResult && (
              <div className="flex items-start gap-2 bg-teal-50 border border-teal-100 rounded-xl p-3">
                <CheckCircle2
                  size={16}
                  className="text-teal-600 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-teal-800">{registrationResult}</p>
              </div>
            )}
            {registrationError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                <AlertCircle
                  size={16}
                  className="text-red-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-red-700">{registrationError}</p>
              </div>
            )}

            {/* Daftar button */}
            <button
              type="button"
              onClick={handleDaftar}
              disabled={!isLoggedIn || !isActorReady || isRegistering}
              className="w-full bg-slate-900 text-white py-3 rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              {isRegistering ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Mendaftar...
                </>
              ) : (
                "Daftar"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-xs text-slate-400 font-medium">atau</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Login II Section */}
            {isLoggedIn ? (
              <div className="w-full flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-teal-brand">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-semibold">Login berhasil</span>
                </div>
                <p className="text-xs text-slate-500 text-center break-all px-2">
                  Principal ID:{" "}
                  <span className="font-mono text-slate-700">
                    {principalId}
                  </span>
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn || isInitializing}
                className="w-full bg-slate-900 text-white py-3 rounded-full font-semibold text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menghubungkan...
                  </>
                ) : isInitializing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memuat...
                  </>
                ) : (
                  "Login II"
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
