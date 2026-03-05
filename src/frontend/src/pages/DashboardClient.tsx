import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Loader2,
  LogOut,
  MessageSquare,
  Plus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRoleGuard } from "../hooks/useRoleGuard";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Client {
  idUser: string;
  principalId: string;
  nama: string;
  email: string;
  whatsapp: string;
  company: string;
  role: Record<string, null>;
  status: Record<string, null>;
  createdAt: bigint;
}

interface SharingEntry {
  idUser: string;
  principalId: string;
  nama: string;
}

interface Service {
  idService: string;
  tipeLayanan: Record<string, null>;
  clientPrincipalId: string;
  clientNama: string;
  asistenmuPrincipalId: string;
  asistenmuNama: string;
  unitLayanan: bigint;
  hargaPerLayanan: bigint;
  sharingLayanan: SharingEntry[];
  status: Record<string, null>;
  createdAt: bigint;
}

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

// ── Helpers ────────────────────────────────────────────────────────────────────
function extractKey(obj: unknown): string {
  if (typeof obj === "string") return obj;
  if (typeof obj === "object" && obj !== null)
    return Object.keys(obj as Record<string, unknown>)[0] ?? "";
  return "";
}

function getTaskStatus(task: Task): string {
  return extractKey(task.status);
}

function getTipeLayanan(svc: Service): string {
  return extractKey(svc.tipeLayanan);
}

function getServiceStatus(svc: Service): string {
  return extractKey(svc.status);
}

function tipeLabel(tipe: string): string {
  const map: Record<string, string> = {
    tenang: "TENANG",
    rapi: "RAPI",
    fokus: "FOKUS",
    jaga: "JAGA",
    efisien: "EFISIEN",
  };
  return map[tipe] ?? tipe.toUpperCase();
}

function tipeBadgeClass(tipe: string): string {
  const map: Record<string, string> = {
    tenang: "bg-teal-50 text-teal-700 border-teal-200",
    rapi: "bg-blue-50 text-blue-700 border-blue-200",
    fokus: "bg-amber-50 text-amber-700 border-amber-200",
    jaga: "bg-purple-50 text-purple-700 border-purple-200",
    efisien: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return map[tipe] ?? "bg-slate-50 text-slate-700 border-slate-200";
}

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
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

// ── CollapsibleCard ─────────────────────────────────────────────────────────────
function CollapsibleCard({
  title,
  children,
  defaultOpen = false,
  badge,
  badgeClass,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: number | string;
  badgeClass?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-slate-900 text-base">
            {title}
          </span>
          {badge !== undefined && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass ?? "bg-slate-100 text-slate-600"}`}
            >
              {badge}
            </span>
          )}
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

// ── TaskCard (inner collapsible for task lists) ────────────────────────────────
function TaskSubSection({
  title,
  count,
  children,
  accent,
  defaultOpen = false,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  accent?: string;
  defaultOpen?: boolean;
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
        <div className="flex items-center gap-2">
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

// ── Summary Counter Card ────────────────────────────────────────────────────────
function SummaryCounter({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
      <p
        className={`font-display font-bold text-2xl ${accent.replace("bg-", "text-").replace("-50", "-700")}`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500 text-center leading-tight">
        {label}
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardClient() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();
  const { isChecking } = useRoleGuard("client");

  const principalId = identity?.getPrincipal().toString() ?? "";
  const isActorReady = !!actor && !isActorFetching;

  // ── Data state ────────────────────────────────────────────────────────────────
  const [clientData, setClientData] = useState<Client | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Task action state ─────────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [revisiNotes, setRevisiNotes] = useState<Record<string, string>>({});
  const [showRevisiInput, setShowRevisiInput] = useState<
    Record<string, boolean>
  >({});
  const [confirmSelesai, setConfirmSelesai] = useState<string | null>(null);

  // ── New task modal state ───────────────────────────────────────────────────────
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskJudul, setNewTaskJudul] = useState("");
  const [newTaskDetail, setNewTaskDetail] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskServiceId, setNewTaskServiceId] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const fetchData = useCallback(async () => {
    if (!actor || !principalId) return;
    setIsLoading(true);
    try {
      const act = actor as unknown as Record<
        string,
        (...args: unknown[]) => Promise<unknown>
      >;

      // Use client-specific queries — all in parallel, no admin-only calls
      const [clientProfileRaw, myTasks, svcRaw] = await Promise.all([
        (act.getMyClientProfile() as Promise<Client | Client[] | null>).catch(
          () => null,
        ),
        (act.getMyTasksAsClient() as Promise<Task[]>).catch(() => [] as Task[]),
        (act.getMyServicesAsClient() as Promise<Service[]>).catch(
          () => [] as Service[],
        ),
      ]);

      // Motoko ?T returns [] or [value] — handle both
      let me: Client | null = null;
      if (Array.isArray(clientProfileRaw)) {
        me = (clientProfileRaw[0] as Client) ?? null;
      } else {
        me = clientProfileRaw as Client | null;
      }
      setClientData(me);

      // Tasks already filtered by backend by clientId
      setTasks(myTasks as Task[]);

      // Services: filter for active only
      const myServices = (svcRaw as Service[]).filter((s) => {
        const status = getServiceStatus(s).toLowerCase();
        return status === "active";
      });
      setServices(myServices);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memuat data. Coba lagi.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [actor, principalId]);

  useEffect(() => {
    if (isActorReady && !isChecking) {
      void fetchData();
    }
  }, [isActorReady, isChecking, fetchData]);

  function handleLogout() {
    clear();
    void navigate({ to: "/" });
  }

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

  // ── Create task ────────────────────────────────────────────────────────────────
  async function handleCreateTask() {
    if (
      !newTaskJudul.trim() ||
      !newTaskDetail.trim() ||
      !newTaskDeadline ||
      !newTaskServiceId
    ) {
      toast.error("Lengkapi semua field yang diperlukan.");
      return;
    }
    if (!clientData) {
      toast.error("Data profil client tidak ditemukan.");
      return;
    }
    const selectedService = services.find(
      (s) => s.idService === newTaskServiceId,
    );
    if (!selectedService) {
      toast.error("Layanan tidak ditemukan.");
      return;
    }

    setIsCreatingTask(true);
    try {
      const act = actor as unknown as Record<
        string,
        (...args: unknown[]) => Promise<string>
      >;
      const deadlineMs = BigInt(new Date(newTaskDeadline).getTime());
      await act.createTask(
        newTaskJudul.trim(),
        newTaskDetail.trim(),
        deadlineMs,
        selectedService.idService,
        clientData.idUser,
        clientData.nama,
        selectedService.asistenmuPrincipalId,
        selectedService.asistenmuNama,
      );
      toast.success("Task berhasil dibuat dan dikirim ke Asistenmu.");
      setIsNewTaskOpen(false);
      setNewTaskJudul("");
      setNewTaskDetail("");
      setNewTaskDeadline("");
      setNewTaskServiceId("");
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat task.";
      toast.error(msg);
    } finally {
      setIsCreatingTask(false);
    }
  }

  // ── Derived task lists ─────────────────────────────────────────────────────────
  const reviewTasks = tasks.filter((t) => getTaskStatus(t) === "reviewclient");
  const onProgressTasks = tasks.filter(
    (t) => getTaskStatus(t) === "onprogress",
  );
  const revisiTasks = tasks.filter((t) => getTaskStatus(t) === "revisi");
  const selesaiTasks = tasks.filter((t) => getTaskStatus(t) === "selesai");

  // ── Pagination ─────────────────────────────────────────────────────────────────
  const pagReview = usePagination(reviewTasks);
  const pagProgress = usePagination(onProgressTasks);
  const pagRevisi = usePagination(revisiTasks);
  const pagSelesai = usePagination(selesaiTasks);

  // ── Unit On Hold per service ───────────────────────────────────────────────────
  function getOnHoldUnits(serviceId: string): bigint {
    return tasks
      .filter(
        (t) => t.serviceId === serviceId && getTaskStatus(t) === "onprogress",
      )
      .reduce((acc, t) => acc + t.unitLayanan, 0n);
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-5">
          {/* ── Greeting Card ── */}
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 px-8 py-7">
            {isLoading && !clientData ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  Halo,{" "}
                  <span className="text-teal-brand">
                    {clientData?.nama ?? "Client"}
                  </span>
                  .
                </h1>
                <p className="text-base text-slate-500 mt-1">
                  Selamat datang di ruang kerja kamu.
                </p>
              </>
            )}
          </div>

          {/* ── Profil Collapsible ── */}
          <CollapsibleCard title="Profil" defaultOpen>
            {isLoading && !clientData ? (
              <div className="flex flex-col gap-3 mt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : clientData ? (
              <dl className="flex flex-col gap-3 mt-4">
                <div className="flex justify-between items-center gap-2">
                  <dt className="text-xs text-slate-500 font-medium">
                    ID User
                  </dt>
                  <dd className="text-xs font-mono text-slate-700">
                    {clientData.idUser}
                  </dd>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <dt className="text-xs text-slate-500 font-medium">Nama</dt>
                  <dd className="text-sm font-medium text-slate-800">
                    {clientData.nama}
                  </dd>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <dt className="text-xs text-slate-500 font-medium">Email</dt>
                  <dd className="text-sm text-slate-700">{clientData.email}</dd>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <dt className="text-xs text-slate-500 font-medium">
                    WhatsApp
                  </dt>
                  <dd className="text-sm text-slate-700">
                    {clientData.whatsapp}
                  </dd>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <dt className="text-xs text-slate-500 font-medium">
                    Perusahaan
                  </dt>
                  <dd className="text-sm text-slate-700">
                    {clientData.company || "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-slate-400 mt-4">
                Data profil tidak ditemukan.
              </p>
            )}
          </CollapsibleCard>

          {/* ── Layanan Anda Collapsible ── */}
          <CollapsibleCard
            title="Layanan Anda"
            badge={services.length}
            defaultOpen
          >
            {isLoading && services.length === 0 ? (
              <div className="flex flex-col gap-3 mt-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : services.length === 0 ? (
              <p className="text-sm text-slate-400 mt-4 text-center py-4">
                Belum ada layanan aktif.
              </p>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                {services.map((svc) => {
                  const tipe = getTipeLayanan(svc);
                  const onHold = getOnHoldUnits(svc.idService);
                  return (
                    <div
                      key={svc.idService}
                      className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-500">
                          {svc.idService}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tipeBadgeClass(tipe)}`}
                        >
                          {tipeLabel(tipe)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs text-slate-400">Asistenmu</p>
                          <p className="text-sm font-medium text-slate-800">
                            {svc.asistenmuNama || "—"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs text-slate-400">Unit Aktif</p>
                          <p className="text-sm font-bold text-teal-700">
                            {String(svc.unitLayanan)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs text-slate-400">Unit On Hold</p>
                          <p className="text-sm font-bold text-amber-600">
                            {String(onHold)}
                          </p>
                        </div>
                        {svc.sharingLayanan.length > 0 && (
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs text-slate-400">Sharing</p>
                            <p className="text-sm text-slate-700">
                              {svc.sharingLayanan.map((e) => e.nama).join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleCard>

          {/* ── Summary Task Collapsible ── */}
          <CollapsibleCard title="Ringkasan Task" defaultOpen>
            {isLoading && tasks.length === 0 ? (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <SummaryCounter
                  label="Butuh Review"
                  value={reviewTasks.length}
                  accent="bg-amber-50"
                />
                <SummaryCounter
                  label="On Progress"
                  value={onProgressTasks.length}
                  accent="bg-blue-50"
                />
                <SummaryCounter
                  label="Dalam Revisi"
                  value={revisiTasks.length}
                  accent="bg-red-50"
                />
                <SummaryCounter
                  label="Selesai"
                  value={selesaiTasks.length}
                  accent="bg-emerald-50"
                />
              </div>
            )}
          </CollapsibleCard>

          {/* ── Task Manajemen Section ── */}
          <div className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between gap-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} className="text-slate-600" />
                <h2 className="font-display font-bold text-slate-900 text-lg">
                  Task Manajemen
                </h2>
              </div>
              <Button
                onClick={() => setIsNewTaskOpen(true)}
                className="btn-teal rounded-full text-sm flex items-center gap-1.5 px-4 py-2 h-auto"
                disabled={services.length === 0}
              >
                <Plus size={14} />
                Buat Task Baru
              </Button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {/* 1. Task Butuh Review */}
              <TaskSubSection
                title="Task Butuh Review Kamu"
                count={reviewTasks.length}
                accent="bg-amber-50 text-amber-700"
                defaultOpen
              >
                {reviewTasks.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    Tidak ada task yang membutuhkan review.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col divide-y divide-slate-100">
                      {pagReview.paged.map((task) => (
                        <div
                          key={task.idTask}
                          className="py-4 flex flex-col gap-2"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-slate-400">
                              {task.idTask}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900 text-sm">
                            {task.judulTask}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {task.detailTask}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                            {task.partnerNama && (
                              <span>
                                Partner:{" "}
                                <span className="text-slate-600">
                                  {task.partnerNama}
                                </span>
                              </span>
                            )}
                            {task.deadline > 0n && (
                              <span>
                                Deadline:{" "}
                                <span className="text-slate-600">
                                  {formatDate(task.deadline)}
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Revisi input */}
                          {showRevisiInput[task.idTask] && (
                            <div className="mt-2 flex flex-col gap-2 bg-slate-50 rounded-xl p-3 border border-slate-200">
                              <Label className="text-xs font-medium text-slate-700">
                                Detail Revisi
                              </Label>
                              <Textarea
                                placeholder="Tuliskan detail revisi yang diperlukan..."
                                value={revisiNotes[task.idTask] ?? ""}
                                onChange={(e) =>
                                  setRevisiNotes((prev) => ({
                                    ...prev,
                                    [task.idTask]: e.target.value,
                                  }))
                                }
                                className="text-sm min-h-[72px] resize-none"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  disabled={
                                    actionLoading[`revisi-${task.idTask}`]
                                  }
                                  onClick={() =>
                                    runAction(
                                      `revisi-${task.idTask}`,
                                      async () => {
                                        const act = actor as unknown as Record<
                                          string,
                                          (...args: unknown[]) => Promise<void>
                                        >;
                                        await act.updateTaskStatus(
                                          task.idTask,
                                          { revisi: null },
                                        );
                                      },
                                      `Task ${task.idTask} dikirim untuk revisi.`,
                                    )
                                  }
                                  className="flex-1 text-xs bg-red-600 text-white hover:bg-red-700 rounded-full"
                                >
                                  {actionLoading[`revisi-${task.idTask}`] ? (
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <>
                                      <MessageSquare
                                        size={12}
                                        className="mr-1"
                                      />
                                      Kirim Revisi
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs rounded-full"
                                  onClick={() =>
                                    setShowRevisiInput((prev) => ({
                                      ...prev,
                                      [task.idTask]: false,
                                    }))
                                  }
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 mt-1 flex-wrap">
                            {!showRevisiInput[task.idTask] && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-red-200 text-red-600 hover:bg-red-50 rounded-full"
                                onClick={() =>
                                  setShowRevisiInput((prev) => ({
                                    ...prev,
                                    [task.idTask]: true,
                                  }))
                                }
                              >
                                Revisi
                              </Button>
                            )}
                            <Button
                              size="sm"
                              disabled={actionLoading[`selesai-${task.idTask}`]}
                              onClick={() => setConfirmSelesai(task.idTask)}
                              className="text-xs bg-emerald-600 text-white hover:bg-emerald-700 rounded-full"
                            >
                              {actionLoading[`selesai-${task.idTask}`] ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                "Selesaikan"
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <PaginationControls
                      page={pagReview.page}
                      totalPages={pagReview.totalPages}
                      setPage={pagReview.setPage}
                    />
                  </>
                )}
              </TaskSubSection>

              {/* 2. Task On Progress */}
              <TaskSubSection
                title="Task On Progress"
                count={onProgressTasks.length}
                accent="bg-blue-50 text-blue-700"
              >
                {onProgressTasks.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    Tidak ada task on progress.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col divide-y divide-slate-100">
                      {pagProgress.paged.map((task) => (
                        <div
                          key={task.idTask}
                          className="py-4 flex flex-col gap-1.5"
                        >
                          <span className="text-xs font-mono text-slate-400">
                            {task.idTask}
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {task.judulTask}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                            {task.partnerNama && (
                              <span>
                                Partner:{" "}
                                <span className="text-slate-600">
                                  {task.partnerNama}
                                </span>
                              </span>
                            )}
                            {task.deadline > 0n && (
                              <span>
                                Deadline:{" "}
                                <span className="text-slate-600">
                                  {formatDate(task.deadline)}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <PaginationControls
                      page={pagProgress.page}
                      totalPages={pagProgress.totalPages}
                      setPage={pagProgress.setPage}
                    />
                  </>
                )}
              </TaskSubSection>

              {/* 3. Task Dalam Revisi */}
              <TaskSubSection
                title="Task Dalam Revisi"
                count={revisiTasks.length}
                accent="bg-red-50 text-red-700"
              >
                {revisiTasks.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    Tidak ada task dalam revisi.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col divide-y divide-slate-100">
                      {pagRevisi.paged.map((task) => (
                        <div
                          key={task.idTask}
                          className="py-4 flex flex-col gap-1.5"
                        >
                          <span className="text-xs font-mono text-slate-400">
                            {task.idTask}
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {task.judulTask}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                            {task.partnerNama && (
                              <span>
                                Partner:{" "}
                                <span className="text-slate-600">
                                  {task.partnerNama}
                                </span>
                              </span>
                            )}
                            {task.deadline > 0n && (
                              <span>
                                Deadline:{" "}
                                <span className="text-slate-600">
                                  {formatDate(task.deadline)}
                                </span>
                              </span>
                            )}
                          </div>
                          {task.notesAsistenmu && (
                            <p className="text-xs text-slate-500 italic bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                              {task.notesAsistenmu}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <PaginationControls
                      page={pagRevisi.page}
                      totalPages={pagRevisi.totalPages}
                      setPage={pagRevisi.setPage}
                    />
                  </>
                )}
              </TaskSubSection>

              {/* 4. Task Selesai */}
              <TaskSubSection
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
                      {pagSelesai.paged.map((task) => (
                        <div
                          key={task.idTask}
                          className="py-4 flex flex-col gap-1.5"
                        >
                          <span className="text-xs font-mono text-slate-400">
                            {task.idTask}
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {task.judulTask}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                            {task.partnerNama && (
                              <span>
                                Partner:{" "}
                                <span className="text-slate-600">
                                  {task.partnerNama}
                                </span>
                              </span>
                            )}
                            {task.deadline > 0n && (
                              <span>
                                Deadline:{" "}
                                <span className="text-slate-600">
                                  {formatDate(task.deadline)}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <PaginationControls
                      page={pagSelesai.page}
                      totalPages={pagSelesai.totalPages}
                      setPage={pagSelesai.setPage}
                    />
                  </>
                )}
              </TaskSubSection>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-3">
          <img
            src="/assets/uploads/asistenku-icon-2.png"
            alt="Asistenku"
            className="h-8 w-8 object-contain"
          />
          <a
            href="https://wa.me/628817743613"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-teal-brand font-medium hover:underline"
          >
            Hubungi Concierge
          </a>
          <p className="text-xs text-slate-400">© Asistenku 2026</p>
        </div>
      </footer>

      {/* ── New Task Modal ── */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Buat Task Baru</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-judul">Judul Task</Label>
              <Input
                id="task-judul"
                placeholder="Masukkan judul task..."
                value={newTaskJudul}
                onChange={(e) => setNewTaskJudul(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-detail">Detail Task</Label>
              <Textarea
                id="task-detail"
                placeholder="Jelaskan detail task yang dibutuhkan..."
                value={newTaskDetail}
                onChange={(e) => setNewTaskDetail(e.target.value)}
                className="text-sm min-h-[100px] resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-deadline">Deadline</Label>
              <Input
                id="task-deadline"
                type="date"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-tipe">Tipe Layanan</Label>
              <Select
                value={newTaskServiceId}
                onValueChange={setNewTaskServiceId}
              >
                <SelectTrigger id="task-tipe">
                  <SelectValue placeholder="Pilih layanan aktif Anda..." />
                </SelectTrigger>
                <SelectContent>
                  {services.map((svc) => {
                    const tipe = getTipeLayanan(svc);
                    return (
                      <SelectItem key={svc.idService} value={svc.idService}>
                        {tipeLabel(tipe)} — {svc.idService}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsNewTaskOpen(false);
                setNewTaskJudul("");
                setNewTaskDetail("");
                setNewTaskDeadline("");
                setNewTaskServiceId("");
              }}
              disabled={isCreatingTask}
            >
              Batal
            </Button>
            <Button
              className="flex-1 bg-slate-900 text-white hover:bg-slate-700"
              onClick={handleCreateTask}
              disabled={isCreatingTask}
            >
              {isCreatingTask ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-2" />
                  Membuat...
                </>
              ) : (
                "Buat Permintaan ke Asistenmu"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Selesai Dialog ── */}
      <Dialog
        open={confirmSelesai !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmSelesai(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Konfirmasi Selesai
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menyelesaikan task ini? Tindakan ini tidak
            dapat dibatalkan.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmSelesai(null)}
            >
              Batal
            </Button>
            <Button
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={
                confirmSelesai
                  ? actionLoading[`selesai-${confirmSelesai}`]
                  : false
              }
              onClick={() => {
                if (!confirmSelesai) return;
                const taskId = confirmSelesai;
                setConfirmSelesai(null);
                void runAction(
                  `selesai-${taskId}`,
                  async () => {
                    const act = actor as unknown as Record<
                      string,
                      (...args: unknown[]) => Promise<void>
                    >;
                    await act.updateTaskStatus(taskId, { selesai: null });
                  },
                  `Task ${taskId} berhasil diselesaikan.`,
                );
              }}
            >
              Ya, Selesaikan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
