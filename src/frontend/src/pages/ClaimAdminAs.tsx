import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const ALLOWED_PRINCIPALS = [
  "fjkli-fsbma-6it5u-allin-kv6rp-v6j7f-bayef-3iut6-bd3td-2corr-gqe", // live
  "mu7go-gesml-ultdd-tqrkp-465oz-ticdh-ir6fg-6i6yq-qfn7i-pqaft-mqe", // draft
];

type ClaimStatus = "idle" | "success" | "error";

export default function ClaimAdminAs() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  const isLoggedIn = !!identity;
  const isActorReady = !!actor && !isActorFetching;
  const principalId = identity?.getPrincipal().toString() ?? null;
  const isAllowed = principalId
    ? ALLOWED_PRINCIPALS.includes(principalId)
    : false;

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Auto-trigger login on mount if not already logged in
  useEffect(() => {
    if (!isInitializing && !isLoggedIn && !isLoggingIn) {
      login();
    }
  }, [isInitializing, isLoggedIn, isLoggingIn, login]);

  async function handleClaimAdmin() {
    if (!actor || !isActorReady) return;
    setIsClaiming(true);
    setClaimStatus("idle");
    setErrorMsg("");

    try {
      // forceClaimAdmin overrides any existing admin with the current principal
      await (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<void>
        >
      ).forceClaimAdmin(
        "Admin Asistenku",
        "admasistenku@gmail.com",
        "08817743613",
      );
      setClaimStatus("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setClaimStatus("error");
      setErrorMsg(message);
    } finally {
      setIsClaiming(false);
    }
  }

  // ── Loading state ─────────────────────────────────────────────
  if (isInitializing || (isLoggingIn && !isLoggedIn)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">
            {isInitializing
              ? "Memuat..."
              : "Menghubungkan ke Internet Identity..."}
          </p>
        </div>
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-slate-100 p-8 flex flex-col items-center gap-5">
          <ShieldCheck size={28} className="text-slate-600" />
          <h2 className="font-display text-xl font-bold text-slate-900 text-center">
            Claim Admin Override
          </h2>
          <p className="text-sm text-slate-500 text-center leading-relaxed">
            Login diperlukan untuk mengakses halaman ini.
          </p>
          <button
            type="button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-slate-900 text-white py-3 rounded-full font-semibold text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menghubungkan...
              </>
            ) : (
              "Login dengan Internet Identity"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Access denied ─────────────────────────────────────────────
  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-slate-100 p-8 flex flex-col items-center gap-5">
          <XCircle size={28} className="text-red-500" />
          <h2 className="font-display text-xl font-bold text-slate-900 text-center">
            Akses Ditolak
          </h2>
          <p className="text-sm text-red-600 text-center leading-relaxed">
            Akses ditolak. Principal Anda tidak diizinkan.
          </p>
          <p className="text-xs text-slate-400 text-center break-all font-mono">
            {principalId}
          </p>
        </div>
      </div>
    );
  }

  // ── Allowed — show claim card ─────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-slate-100 p-8 flex flex-col items-center gap-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <ShieldCheck size={24} className="text-slate-700" />
          <h2 className="font-display text-xl font-bold text-slate-900">
            Claim Admin Override
          </h2>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 text-center leading-relaxed">
          Klaim atau ambil alih akses Admin sistem. Hanya untuk principal yang
          diizinkan.
        </p>

        {/* Principal display */}
        <div className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
          <p className="text-xs text-slate-400 mb-1">Principal Anda</p>
          <p className="text-xs font-mono text-slate-700 break-all">
            {principalId}
          </p>
        </div>

        {/* Status messages */}
        {claimStatus === "success" && (
          <div className="w-full flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
            <CheckCircle2
              size={16}
              className="text-green-600 mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-green-800 font-medium">
              Berhasil! Anda sekarang adalah Admin.
            </p>
          </div>
        )}

        {claimStatus === "error" && (
          <div className="w-full flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
            <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">
              {errorMsg || "Terjadi kesalahan. Silakan coba lagi."}
            </p>
          </div>
        )}

        {/* Claim button */}
        <button
          type="button"
          onClick={handleClaimAdmin}
          disabled={!isActorReady || isClaiming || claimStatus === "success"}
          className="w-full bg-slate-900 text-white py-3 rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          {isClaiming ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Memproses...
            </>
          ) : claimStatus === "success" ? (
            <>
              <CheckCircle2 size={16} />
              Berhasil Diklaim
            </>
          ) : (
            "Claim Admin"
          )}
        </button>

        {/* Actor loading hint */}
        {!isActorReady && !isClaiming && (
          <p className="text-xs text-slate-400 text-center flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" />
            Menginisialisasi koneksi...
          </p>
        )}
      </div>
    </div>
  );
}
