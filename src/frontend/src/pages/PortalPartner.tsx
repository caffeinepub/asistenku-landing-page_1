import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function PortalPartner() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  const isLoggedIn = !!identity;
  const isActorReady = !!actor && !isActorFetching;

  // ── Form state ──────────────────────────────────────────────
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [kota, setKota] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<string | null>(
    null,
  );
  const [registrationError, setRegistrationError] = useState<string | null>(
    null,
  );

  // ── Dashboard / role check state ─────────────────────────────
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  // ── Login handler ─────────────────────────────────────────────
  function handleLogin() {
    login();
  }

  // ── Register handler ──────────────────────────────────────────
  async function handleRegister() {
    if (!actor) return;

    const trimNama = nama.trim();
    const trimEmail = email.trim();
    const trimWa = whatsapp.trim();
    const trimKota = kota.trim();

    if (!trimNama || !trimEmail || !trimWa || !trimKota) {
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
      const idUser = (await act.registerPartner(
        trimNama,
        trimEmail,
        trimWa,
        trimKota,
      )) as string;
      setRegistrationResult(
        `Pendaftaran berhasil! ID Anda: ${idUser}. Status: Menunggu persetujuan admin.`,
      );
      toast.success(`Pendaftaran berhasil! ID: ${idUser}`);
      setNama("");
      setEmail("");
      setWhatsapp("");
      setKota("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      let display = "Terjadi kesalahan saat pendaftaran.";
      if (
        message.toLowerCase().includes("already registered") ||
        message.toLowerCase().includes("sudah terdaftar")
      ) {
        display = "Anda sudah terdaftar sebelumnya sebagai partner.";
      }
      setRegistrationError(display);
      toast.error(display);
    } finally {
      setIsRegistering(false);
    }
  }

  // ── Masuk / role check handler ────────────────────────────────
  async function handleMasuk() {
    if (!actor) return;
    setIsCheckingRole(true);
    setRoleError(null);
    try {
      const roleResult = await (
        actor as unknown as Record<string, () => Promise<unknown>>
      ).getMyRole();

      if (!roleResult) {
        const msg =
          "Anda belum terdaftar sebagai partner. Silakan daftar terlebih dahulu.";
        setRoleError(msg);
        toast.error(msg);
        return;
      }

      let roleKey: string;
      if (typeof roleResult === "string") {
        roleKey = roleResult;
      } else {
        roleKey = Object.keys(roleResult as Record<string, null>)[0] ?? "";
      }

      if (roleKey === "partner") {
        void navigate({ to: "/dashboard-partner" });
      } else {
        const msg =
          "Akun Anda bukan akun partner. Silakan daftar terlebih dahulu.";
        setRoleError(msg);
        toast.error(msg);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memeriksa role.";
      setRoleError(message);
      toast.error(message);
    } finally {
      setIsCheckingRole(false);
    }
  }

  const principalId = identity?.getPrincipal().toString();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 items-center">
          {/* ── Card 1: Login Internet Identity ── */}
          <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-slate-100 p-8 flex flex-col items-center gap-5">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Login Internet Identity
            </h2>

            {isLoggedIn ? (
              <div className="w-full flex flex-col items-center gap-3">
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

          {/* ── Cards 2 & 3: Dashboard Partner + Form Pendaftaran ── */}
          <div className="w-full grid md:grid-cols-2 gap-6">
            {/* Dashboard Partner — order-1 on desktop */}
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8 flex flex-col gap-5 md:order-1">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Dashboard Partner
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Jika Anda belum memiliki akun partner, silakan mendaftar
                terlebih dahulu.
              </p>

              {roleError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                  <AlertCircle
                    size={16}
                    className="text-red-500 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs text-red-700">{roleError}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleMasuk}
                disabled={!isLoggedIn || !isActorReady || isCheckingRole}
                className="w-full bg-slate-900 text-white py-3 rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors mt-auto flex items-center justify-center gap-2"
              >
                {isCheckingRole ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memeriksa...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>

            {/* Form Pendaftaran — order-2 on desktop */}
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8 flex flex-col gap-5 md:order-2">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Form Pendaftaran
              </h2>

              <div className="flex flex-col gap-4">
                {/* Nama */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="partner-nama"
                    className="text-sm font-medium text-slate-700"
                  >
                    Nama
                  </label>
                  <input
                    id="partner-nama"
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
                    htmlFor="partner-email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>
                  <input
                    id="partner-email"
                    type="email"
                    placeholder="email@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isLoggedIn || isRegistering}
                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 disabled:bg-slate-50 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
                  />
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="partner-whatsapp"
                    className="text-sm font-medium text-slate-700"
                  >
                    WhatsApp
                  </label>
                  <input
                    id="partner-whatsapp"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    disabled={!isLoggedIn || isRegistering}
                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 disabled:bg-slate-50 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
                  />
                </div>

                {/* Kota Domisili */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="partner-kota"
                    className="text-sm font-medium text-slate-700"
                  >
                    Kota Domisili
                  </label>
                  <input
                    id="partner-kota"
                    type="text"
                    placeholder="Jakarta, Surabaya, Bandung..."
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    disabled={!isLoggedIn || isRegistering}
                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 disabled:bg-slate-50 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
                  />
                </div>
              </div>

              {/* Registration result */}
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

              <button
                type="button"
                onClick={handleRegister}
                disabled={!isLoggedIn || !isActorReady || isRegistering}
                className="w-full bg-slate-900 text-white py-3 rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors mt-2 flex items-center justify-center gap-2"
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
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
