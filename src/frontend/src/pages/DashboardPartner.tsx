import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  GraduationCap,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Task {
  idTask: string;
  judulTask: string;
  detailTask: string;
  deadline: bigint;
  serviceId: string;
  clientId: string;
  clientNama: string;
  partnerId: string;
  partnerNama: string;
  asistenmuId: string;
  asistenmuNama: string;
  notesAsistenmu: string;
  jamEfektif: bigint;
  unitLayanan: bigint;
  linkGdriveInternal: string;
  linkGdriveClient: string;
  status: Record<string, null>;
  createdAt: bigint;
}

interface PartnerProfile {
  idUser: string;
  principalId: string;
  nama: string;
  email: string;
  whatsapp: string;
  kota: string;
  level: Record<string, null>;
  verifiedSkill: string[];
  role: Record<string, null>;
  status: Record<string, null>;
  createdAt: bigint;
}

interface FinancialProfile {
  namaBankEwallet: string;
  nomorRekening: string;
  namaRekening: string;
  createdAt: bigint;
}

interface WalletInfo {
  saldoTersedia: bigint;
  saldoPengajuan: bigint;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function getTaskStatus(task: Task): string {
  return Object.keys(task.status)[0] ?? "";
}

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRupiah(val: bigint): string {
  return `Rp ${Number(val).toLocaleString("id-ID")}`;
}

function taskStatusLabel(status: string): string {
  const map: Record<string, string> = {
    permintaanbaru: "Permintaan Baru",
    onprogress: "On Progress",
    reviewclient: "Review Client",
    qaasistenmu: "QA Asistenmu",
    revisi: "Revisi",
    ditolak: "Ditolak",
    selesai: "Selesai",
  };
  return map[status] ?? status;
}

function taskStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    permintaanbaru: "bg-orange-50 text-orange-700 border-orange-200",
    onprogress: "bg-blue-50 text-blue-700 border-blue-200",
    reviewclient: "bg-amber-50 text-amber-700 border-amber-200",
    qaasistenmu: "bg-purple-50 text-purple-700 border-purple-200",
    revisi: "bg-red-50 text-red-700 border-red-200",
    ditolak: "bg-rose-50 text-rose-700 border-rose-200",
    selesai: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return map[status] ?? "bg-slate-50 text-slate-700 border-slate-200";
}

function getLevelInfo(level: Record<string, null>): {
  label: string;
  className: string;
} {
  const key = Object.keys(level)[0] ?? "";
  const map: Record<string, { label: string; className: string }> = {
    junior: {
      label: "Junior",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    senior: {
      label: "Senior",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    expert: {
      label: "Expert",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },
  };
  return (
    map[key] ?? {
      label: key,
      className: "bg-slate-50 text-slate-700 border-slate-200",
    }
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
function usePagination<T>(items: T[], pageSize = 5) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paged = items.slice((page - 1) * pageSize, page * pageSize);
  return { page, setPage, totalPages, paged };
}

function PaginationControls({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="text-xs"
      >
        ← Sebelumnya
      </Button>
      <span className="text-xs text-slate-500">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="text-xs"
      >
        Berikutnya →
      </Button>
    </div>
  );
}

// ── Collapsible Card ──────────────────────────────────────────────────────────
function CollapsibleCard({
  title,
  icon,
  children,
  defaultOpen = false,
  className = "",
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div
      className={`bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden ${className}`}
    >
      <button
        type="button"
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-500">{icon}</span>}
          <span className="font-display font-bold text-slate-900 text-base">
            {title}
          </span>
        </div>
        <span className="text-slate-400 flex-shrink-0">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-slate-100">{children}</div>
      )}
    </div>
  );
}

// ── Collapsible Section (for task sub-cards) ───────────────────────────────────
function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = false,
  accent,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accent?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-slate-900 text-sm">
            {title}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${accent ?? "bg-slate-100 text-slate-600"}`}
          >
            {count}
          </span>
        </div>
        <span className="text-slate-400 flex-shrink-0">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-slate-100">{children}</div>
      )}
    </div>
  );
}

// ── Outer Collapsible Section (for Task Manajemen wrapper) ─────────────────────
function OuterCollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-3 hover:bg-slate-200/60 transition-colors"
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-slate-600">{icon}</span>}
          <span className="font-display font-bold text-slate-900 text-lg">
            {title}
          </span>
        </div>
        <span className="text-slate-500 flex-shrink-0">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-3">{children}</div>
      )}
    </div>
  );
}

// ── Summary Card ───────────────────────────────────────────────────────────────
function SummaryCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl ${bg ?? "bg-slate-100"} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 leading-tight">{label}</p>
        <p className="font-display font-bold text-xl mt-0.5 text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Task Row ───────────────────────────────────────────────────────────────────
function TaskRow({ task }: { task: Task }) {
  const statusKey = getTaskStatus(task);
  return (
    <div className="py-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-mono text-slate-500">{task.idTask}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${taskStatusBadgeClass(statusKey)}`}
        >
          {taskStatusLabel(statusKey)}
        </span>
      </div>
      <p className="font-medium text-slate-900 text-sm">{task.judulTask}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
        <span>
          Client:{" "}
          <span className="text-slate-700">{task.clientNama || "—"}</span>
        </span>
        {task.asistenmuNama && (
          <span>
            Asistenmu:{" "}
            <span className="text-slate-700">{task.asistenmuNama}</span>
          </span>
        )}
        {task.deadline > 0n && (
          <span>
            Deadline:{" "}
            <span className="text-slate-700">{formatDate(task.deadline)}</span>
          </span>
        )}
        <span>
          Dibuat:{" "}
          <span className="text-slate-700">{formatDate(task.createdAt)}</span>
        </span>
        {task.jamEfektif > 0n && (
          <span>
            Jam Efektif:{" "}
            <span className="text-slate-700">
              {String(task.jamEfektif)} jam
            </span>
          </span>
        )}
        {task.unitLayanan > 0n && (
          <span>
            Unit:{" "}
            <span className="text-slate-700">{String(task.unitLayanan)}</span>
          </span>
        )}
      </div>
      {task.notesAsistenmu && (
        <p className="text-xs text-slate-500 italic bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
          {task.notesAsistenmu}
        </p>
      )}
      <div className="flex gap-3">
        {task.linkGdriveInternal && (
          <a
            href={task.linkGdriveInternal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <FolderOpen size={12} />
            GDrive Internal
            <ExternalLink size={10} />
          </a>
        )}
        {task.linkGdriveClient && (
          <a
            href={task.linkGdriveClient}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800"
          >
            <FolderOpen size={12} />
            GDrive Client
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardPartner() {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  const isActorReady = !!actor && !isActorFetching;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [financialProfile, setFinancialProfile] =
    useState<FinancialProfile | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editKota, setEditKota] = useState("");

  // Financial edit state
  const [isEditingFinancial, setIsEditingFinancial] = useState(false);
  const [editNamaBank, setEditNamaBank] = useState("");
  const [editNomorRek, setEditNomorRek] = useState("");
  const [editNamaRek, setEditNamaRek] = useState("");

  // Withdraw form state
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawNominal, setWithdrawNominal] = useState("");

  const fetchData = useCallback(async () => {
    if (!actor) return;
    setIsLoading(true);
    try {
      const act = actor as unknown as Record<
        string,
        (...args: unknown[]) => Promise<unknown>
      >;
      const [t, p, fp, w] = await Promise.all([
        (act.getTasksByPartner() as Promise<Task[]>).catch(() => [] as Task[]),
        (act.getMyPartnerProfile() as Promise<PartnerProfile | null>).catch(
          () => null,
        ),
        (act.getMyFinancialProfile() as Promise<FinancialProfile | null>).catch(
          () => null,
        ),
        (act.getMyWallet() as Promise<WalletInfo>).catch(
          () => ({ saldoTersedia: 0n, saldoPengajuan: 0n }) as WalletInfo,
        ),
      ]);
      setTasks(t);
      setProfile(p);
      setFinancialProfile(fp);
      setWalletInfo(w);

      // Sync edit fields when profile loads
      if (p) {
        setEditNama(p.nama);
        setEditEmail(p.email);
        setEditWhatsapp(p.whatsapp);
        setEditKota(p.kota);
      }
      if (fp) {
        setEditNamaBank(fp.namaBankEwallet);
        setEditNomorRek(fp.nomorRekening);
        setEditNamaRek(fp.namaRekening);
      }
    } catch {
      toast.error("Gagal memuat data.");
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (isActorReady) {
      void fetchData();
    }
  }, [isActorReady, fetchData]);

  function setLoading(key: string, v: boolean) {
    setActionLoading((prev) => ({ ...prev, [key]: v }));
  }

  async function runAction(
    key: string,
    fn: () => Promise<void>,
    successMsg: string,
  ) {
    setLoading(key, true);
    try {
      await fn();
      toast.success(successMsg);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      toast.error(msg);
    } finally {
      setLoading(key, false);
    }
  }

  function handleLogout() {
    clear();
    void navigate({ to: "/portal-partner" });
  }

  const act = actor as unknown as Record<
    string,
    (...args: unknown[]) => Promise<void>
  >;

  async function handleUpdateProfile() {
    await runAction(
      "update-profile",
      () =>
        act.updateMyPartnerProfile(editNama, editEmail, editWhatsapp, editKota),
      "Profil berhasil diperbarui.",
    );
    setIsEditingProfile(false);
  }

  async function handleAjukanFinancial() {
    await runAction(
      "ajukan-financial",
      () =>
        act.requestFinancialProfile(editNamaBank, editNomorRek, editNamaRek),
      "Permintaan terkirim ke admin.",
    );
    setIsEditingFinancial(false);
  }

  async function handleWithdraw() {
    const nominal = Number.parseInt(withdrawNominal, 10);
    if (!nominal || nominal <= 0) {
      toast.error("Masukkan nominal yang valid.");
      return;
    }
    await runAction(
      "withdraw",
      async () => {
        const actTyped = actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<string>
        >;
        await actTyped.requestWithdraw(BigInt(nominal));
      },
      "Permintaan withdraw terkirim. Akan diproses 1x24 jam kerja.",
    );
    setWithdrawNominal("");
    setIsWithdrawOpen(false);
  }

  function getTasksByStatus(status: string) {
    return tasks.filter((t) => getTaskStatus(t) === status);
  }

  const onProgressTasks = getTasksByStatus("onprogress");
  const reviewClientTasks = getTasksByStatus("reviewclient");
  const qaTasks = getTasksByStatus("qaasistenmu");
  const revisiTasks = getTasksByStatus("revisi");
  const selesaiTasks = getTasksByStatus("selesai");
  const ditolakTasks = getTasksByStatus("ditolak");

  const pag1 = usePagination(onProgressTasks);
  const pag2 = usePagination(reviewClientTasks);
  const pag3 = usePagination(qaTasks);
  const pag4 = usePagination(revisiTasks);
  const pag5 = usePagination(selesaiTasks);
  const pag6 = usePagination(ditolakTasks);

  const levelInfo = profile ? getLevelInfo(profile.level) : null;
  const hasFinancialProfile = !!financialProfile;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <img
            src="/assets/uploads/asistenku-horizontal-1.png"
            alt="Asistenku"
            className="h-8 object-contain"
          />
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* ── Greeting Card ── */}
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 px-8 py-7">
            {isLoading && !profile ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  Selamat datang, {profile?.nama ? profile.nama : "Partner"}.
                </h1>
                <p className="text-base text-slate-500 mt-1">
                  Ruang Kerja kamu.
                </p>
              </>
            )}
          </div>

          {/* ── 4 Info Cards Grid ── */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Card A — Profil Partner */}
            <CollapsibleCard
              title="Profil Partner"
              icon={<BookOpen size={16} />}
              defaultOpen
            >
              {isLoading && !profile ? (
                <div className="flex flex-col gap-3 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : profile ? (
                <div className="mt-4 flex flex-col gap-4">
                  {!isEditingProfile ? (
                    <>
                      <dl className="flex flex-col gap-2.5">
                        <div className="flex justify-between gap-2">
                          <dt className="text-xs text-slate-500 font-medium">
                            ID User
                          </dt>
                          <dd className="text-xs font-mono text-slate-700">
                            {profile.idUser}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-xs text-slate-500 font-medium">
                            Nama
                          </dt>
                          <dd className="text-sm text-slate-800 font-medium">
                            {profile.nama}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-xs text-slate-500 font-medium">
                            Email
                          </dt>
                          <dd className="text-sm text-slate-700">
                            {profile.email}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-xs text-slate-500 font-medium">
                            WhatsApp
                          </dt>
                          <dd className="text-sm text-slate-700">
                            {profile.whatsapp}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-xs text-slate-500 font-medium">
                            Kota Domisili
                          </dt>
                          <dd className="text-sm text-slate-700">
                            {profile.kota}
                          </dd>
                        </div>
                      </dl>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-1 text-xs gap-1"
                        onClick={() => setIsEditingProfile(true)}
                      >
                        <Pencil size={12} />
                        Edit Profil
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Nama</Label>
                        <Input
                          value={editNama}
                          onChange={(e) => setEditNama(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Email</Label>
                        <Input
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">WhatsApp</Label>
                        <Input
                          value={editWhatsapp}
                          onChange={(e) => setEditWhatsapp(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Kota Domisili</Label>
                        <Input
                          value={editKota}
                          onChange={(e) => setEditKota(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Button
                          size="sm"
                          className="flex-1 text-xs btn-teal rounded-full"
                          disabled={actionLoading["update-profile"]}
                          onClick={handleUpdateProfile}
                        >
                          {actionLoading["update-profile"] ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            "Update"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs rounded-full"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 mt-4">
                  Data profil tidak ditemukan.
                </p>
              )}
            </CollapsibleCard>

            {/* Card B — Finansial */}
            <CollapsibleCard
              title="Finansial"
              icon={<Wallet size={16} />}
              defaultOpen
            >
              <div className="mt-4 flex flex-col gap-4">
                {!hasFinancialProfile && !isEditingFinancial && (
                  <p className="text-sm text-slate-400">
                    Belum ada data finansial.
                  </p>
                )}

                {hasFinancialProfile && !isEditingFinancial && (
                  <dl className="flex flex-col gap-2.5">
                    <div className="flex justify-between gap-2">
                      <dt className="text-xs text-slate-500 font-medium">
                        Bank / E-Wallet
                      </dt>
                      <dd className="text-sm text-slate-700">
                        {financialProfile?.namaBankEwallet}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-xs text-slate-500 font-medium">
                        Nomor Rekening / E-Wallet
                      </dt>
                      <dd className="text-sm text-slate-700 font-mono">
                        {financialProfile?.nomorRekening}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-xs text-slate-500 font-medium">
                        Nama di Rekening
                      </dt>
                      <dd className="text-sm text-slate-800 font-medium">
                        {financialProfile?.namaRekening}
                      </dd>
                    </div>
                  </dl>
                )}

                {isEditingFinancial ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Nama Bank / E-Wallet</Label>
                      <Input
                        value={editNamaBank}
                        onChange={(e) => setEditNamaBank(e.target.value)}
                        placeholder="BCA / GoPay / dll"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">
                        Nomor Rekening / E-Wallet
                      </Label>
                      <Input
                        value={editNomorRek}
                        onChange={(e) => setEditNomorRek(e.target.value)}
                        placeholder="0812xxxxx"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Nama di Rekening</Label>
                      <Input
                        value={editNamaRek}
                        onChange={(e) => setEditNamaRek(e.target.value)}
                        placeholder="Nama sesuai rekening"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Button
                        size="sm"
                        className="flex-1 text-xs btn-teal rounded-full"
                        disabled={actionLoading["ajukan-financial"]}
                        onClick={handleAjukanFinancial}
                      >
                        {actionLoading["ajukan-financial"] ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          "Ajukan Perubahan Data"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs rounded-full"
                        onClick={() => setIsEditingFinancial(false)}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs gap-1"
                    onClick={() => {
                      if (financialProfile) {
                        setEditNamaBank(financialProfile.namaBankEwallet);
                        setEditNomorRek(financialProfile.nomorRekening);
                        setEditNamaRek(financialProfile.namaRekening);
                      }
                      setIsEditingFinancial(true);
                    }}
                  >
                    <Pencil size={12} />
                    {hasFinancialProfile
                      ? "Edit & Ajukan Perubahan"
                      : "Tambah Data Finansial"}
                  </Button>
                )}
              </div>
            </CollapsibleCard>

            {/* Card C — Level & Verified Skill */}
            <CollapsibleCard
              title="Level & Verified Skill"
              icon={<GraduationCap size={16} />}
              defaultOpen
            >
              <div className="mt-4 flex flex-col gap-4">
                {isLoading && !profile ? (
                  <Skeleton className="h-8 w-24 rounded-full" />
                ) : profile && levelInfo ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">
                        Level
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${levelInfo.className}`}
                      >
                        {levelInfo.label}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-2">
                        Verified Skill
                      </p>
                      {profile.verifiedSkill.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {profile.verifiedSkill
                            .flatMap((s) =>
                              s
                                .split(",")
                                .map((sk) => sk.trim())
                                .filter(Boolean),
                            )
                            .map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          Belum ada skill yang diverifikasi.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">Data tidak tersedia.</p>
                )}
              </div>
            </CollapsibleCard>

            {/* Card D — Wallet */}
            <CollapsibleCard
              title="Wallet"
              icon={<Wallet size={16} />}
              defaultOpen
            >
              <div className="mt-4 flex flex-col gap-4">
                {isLoading && !walletInfo ? (
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                ) : walletInfo ? (
                  <>
                    <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          Saldo Tersedia
                        </span>
                        <span className="font-display font-bold text-slate-900 text-base">
                          {formatRupiah(walletInfo.saldoTersedia)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          Saldo Dalam Pengajuan
                        </span>
                        <span className="font-medium text-amber-600 text-sm">
                          {formatRupiah(walletInfo.saldoPengajuan)}
                        </span>
                      </div>
                    </div>

                    {!hasFinancialProfile && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        Lengkapi data finansial terlebih dahulu sebelum
                        mengajukan withdraw.
                      </p>
                    )}

                    {!isWithdrawOpen ? (
                      <Button
                        size="sm"
                        className="w-full text-xs btn-teal rounded-full"
                        disabled={!hasFinancialProfile}
                        onClick={() => setIsWithdrawOpen(true)}
                      >
                        Ajukan Withdraw
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs">
                            Nominal Withdraw (Rp)
                          </Label>
                          <Input
                            type="number"
                            value={withdrawNominal}
                            onChange={(e) => setWithdrawNominal(e.target.value)}
                            placeholder="Masukkan nominal"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 text-xs btn-teal rounded-full"
                            disabled={actionLoading.withdraw}
                            onClick={handleWithdraw}
                          >
                            {actionLoading.withdraw ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              "Ajukan"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs rounded-full"
                            onClick={() => {
                              setIsWithdrawOpen(false);
                              setWithdrawNominal("");
                            }}
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-400">
                    Data wallet tidak tersedia.
                  </p>
                )}
              </div>
            </CollapsibleCard>
          </div>

          {/* ── Summary Cards (Task Counters) ── */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(["a", "b", "c", "d", "e", "f"] as const).map((k) => (
                <div
                  key={k}
                  className="bg-white rounded-2xl shadow-soft border border-slate-100 p-4 flex items-center gap-3"
                >
                  <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-10" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryCard
                icon={<ClipboardList size={18} className="text-blue-700" />}
                label="On Progress"
                value={onProgressTasks.length}
                bg="bg-blue-50"
              />
              <SummaryCard
                icon={<ClipboardList size={18} className="text-amber-700" />}
                label="Review Client"
                value={reviewClientTasks.length}
                bg="bg-amber-50"
              />
              <SummaryCard
                icon={<ClipboardList size={18} className="text-purple-700" />}
                label="QA Asistenmu"
                value={qaTasks.length}
                bg="bg-purple-50"
              />
              <SummaryCard
                icon={<ClipboardList size={18} className="text-red-700" />}
                label="Revisi"
                value={revisiTasks.length}
                bg="bg-red-50"
              />
              <SummaryCard
                icon={<CheckCircle size={18} className="text-emerald-700" />}
                label="Selesai"
                value={selesaiTasks.length}
                bg="bg-emerald-50"
              />
              <SummaryCard
                icon={<ClipboardList size={18} className="text-rose-700" />}
                label="Ditolak"
                value={ditolakTasks.length}
                bg="bg-rose-50"
              />
            </div>
          )}

          {/* ── Task Manajemen Section (outer collapsible) ── */}
          <OuterCollapsibleSection
            title="Task Manajemen"
            icon={<ClipboardList size={20} />}
            defaultOpen
          >
            {/* 1. On Progress */}
            <CollapsibleSection
              title="Task On Progress"
              count={onProgressTasks.length}
              accent="bg-blue-50 text-blue-700"
              defaultOpen
            >
              {onProgressTasks.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  Tidak ada task on progress.
                </p>
              ) : (
                <>
                  <div className="flex flex-col divide-y divide-slate-100">
                    {pag1.paged.map((task) => (
                      <div
                        key={task.idTask}
                        className="py-3 flex items-start justify-between gap-3"
                      >
                        <TaskRow task={task} />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading[`qa-${task.idTask}`]}
                          onClick={() =>
                            runAction(
                              `qa-${task.idTask}`,
                              () =>
                                act.updateTaskStatus(task.idTask, {
                                  qaasistenmu: null,
                                }),
                              `Task ${task.idTask} dipindah ke QA Asistenmu.`,
                            )
                          }
                          className="flex-shrink-0 text-xs text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                          {actionLoading[`qa-${task.idTask}`] ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <>
                              <RefreshCw size={12} className="mr-1" />
                              Minta QA Asistenmu
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    page={pag1.page}
                    totalPages={pag1.totalPages}
                    setPage={pag1.setPage}
                  />
                </>
              )}
            </CollapsibleSection>

            {/* 2. Review Client */}
            <CollapsibleSection
              title="Task Review Client"
              count={reviewClientTasks.length}
              accent="bg-amber-50 text-amber-700"
            >
              {reviewClientTasks.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  Tidak ada task review client.
                </p>
              ) : (
                <>
                  <div className="flex flex-col divide-y divide-slate-100">
                    {pag2.paged.map((task) => (
                      <div key={task.idTask} className="py-3">
                        <TaskRow task={task} />
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    page={pag2.page}
                    totalPages={pag2.totalPages}
                    setPage={pag2.setPage}
                  />
                </>
              )}
            </CollapsibleSection>

            {/* 3. QA Asistenmu */}
            <CollapsibleSection
              title="Task QA Asistenmu"
              count={qaTasks.length}
              accent="bg-purple-50 text-purple-700"
            >
              {qaTasks.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  Tidak ada task QA asistenmu.
                </p>
              ) : (
                <>
                  <div className="flex flex-col divide-y divide-slate-100">
                    {pag3.paged.map((task) => (
                      <div key={task.idTask} className="py-3">
                        <TaskRow task={task} />
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    page={pag3.page}
                    totalPages={pag3.totalPages}
                    setPage={pag3.setPage}
                  />
                </>
              )}
            </CollapsibleSection>

            {/* 4. Revisi */}
            <CollapsibleSection
              title="Task Revisi"
              count={revisiTasks.length}
              accent="bg-red-50 text-red-700"
            >
              {revisiTasks.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  Tidak ada task revisi.
                </p>
              ) : (
                <>
                  <div className="flex flex-col divide-y divide-slate-100">
                    {pag4.paged.map((task) => (
                      <div key={task.idTask} className="py-3">
                        <TaskRow task={task} />
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    page={pag4.page}
                    totalPages={pag4.totalPages}
                    setPage={pag4.setPage}
                  />
                </>
              )}
            </CollapsibleSection>

            {/* 5. Selesai */}
            <CollapsibleSection
              title="Task Selesai"
              count={selesaiTasks.length}
              accent="bg-emerald-50 text-emerald-700"
            >
              {selesaiTasks.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  Belum ada task yang selesai.
                </p>
              ) : (
                <>
                  <div className="flex flex-col divide-y divide-slate-100">
                    {pag5.paged.map((task) => (
                      <div key={task.idTask} className="py-3">
                        <TaskRow task={task} />
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    page={pag5.page}
                    totalPages={pag5.totalPages}
                    setPage={pag5.setPage}
                  />
                </>
              )}
            </CollapsibleSection>

            {/* 6. Ditolak */}
            <CollapsibleSection
              title="Task Ditolak"
              count={ditolakTasks.length}
              accent="bg-rose-50 text-rose-700"
            >
              {ditolakTasks.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  Tidak ada task ditolak.
                </p>
              ) : (
                <>
                  <div className="flex flex-col divide-y divide-slate-100">
                    {pag6.paged.map((task) => (
                      <div key={task.idTask} className="py-3">
                        <TaskRow task={task} />
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    page={pag6.page}
                    totalPages={pag6.totalPages}
                    setPage={pag6.setPage}
                  />
                </>
              )}
            </CollapsibleSection>
          </OuterCollapsibleSection>

          {/* ── Akademi Asistenku (Coming Soon) ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center gap-4 opacity-70">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Lock size={24} className="text-slate-400" />
            </div>
            <div className="text-center">
              <h2 className="font-display font-bold text-slate-700 text-xl">
                Akademi Asistenku
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Ruang belajar dan pengembangan skill untuk partner.
              </p>
            </div>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
              Coming Soon
            </span>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Asistenku. Ruang Kerja Partner
            &mdash; Area terbatas.
          </p>
        </div>
      </footer>
    </div>
  );
}
