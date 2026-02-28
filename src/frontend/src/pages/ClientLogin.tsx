import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function ClientLogin() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  const isLoggedIn = !!identity;
  const isActorReady = !!actor && !isActorFetching;

  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const principalId = identity?.getPrincipal().toString();

  function handleLogin() {
    login();
  }

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
          "Akun Anda belum terdaftar. Silakan daftar sebagai client terlebih dahulu.";
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

      if (roleKey === "client") {
        void navigate({ to: "/dashboard-client" });
      } else {
        const msg = "Akun Anda bukan akun client. Silakan hubungi admin.";
        setRoleError(msg);
        toast.error(msg);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memeriksa akun.";
      setRoleError(message);
      toast.error(message);
    } finally {
      setIsCheckingRole(false);
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
                Masuk ke Akun Client
              </h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Login dengan Internet Identity untuk mengakses dashboard Anda.
              </p>
            </div>

            {/* Login II Section */}
            <div className="flex flex-col gap-3">
              {isLoggedIn ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-teal-brand">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-semibold">
                      Login berhasil
                    </span>
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

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Role error */}
            {roleError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                <AlertCircle
                  size={16}
                  className="text-red-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-red-700">{roleError}</p>
              </div>
            )}

            {/* Masuk ke Ruang Kerja button */}
            <button
              type="button"
              onClick={handleMasuk}
              disabled={!isLoggedIn || !isActorReady || isCheckingRole}
              className="w-full bg-slate-900 text-white py-3 rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              {isCheckingRole ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memeriksa akun...
                </>
              ) : (
                "Masuk ke Ruang Kerja"
              )}
            </button>

            {!isLoggedIn && (
              <p className="text-xs text-slate-400 text-center">
                Login terlebih dahulu untuk mengakses ruang kerja Anda.
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
