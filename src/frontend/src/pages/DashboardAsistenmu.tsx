import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Layers,
  LogOut,
  Star,
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

interface UserProfile {
  idUser: string;
  principalId: string;
  nama: string;
  email: string;
  whatsapp: string;
  role: Record<string, null>;
  status: Record<string, null>;
  createdAt: bigint;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function getTaskStatus(task: Task): string {
  return Object.keys(task.status)[0] ?? "";
}

function getTipe(obj: Record<string, null>): string {
  return Object.keys(obj)[0] ?? "";
}

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

// ── Collapsible Section ────────────────────────────────────────────────────────
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
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-slate-900 text-base">
            {title}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${accent ?? "bg-slate-100 text-slate-600"}`}
          >
            {count}
          </span>
        </div>
        <span className="text-slate-400 flex-shrink-0">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-slate-100">{children}</div>
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
      <div className="min-w-0">
        <p className="text-xs text-slate-500 leading-tight truncate">{label}</p>
        <p className="font-display font-bold text-xl mt-0.5 text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardAsistenmu() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  const isActorReady = !!actor && !isActorFetching;
  const principalId = identity?.getPrincipal().toString();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!actor) return;
    setIsLoading(true);
    try {
      const act = actor as unknown as Record<
        string,
        (...args: unknown[]) => Promise<unknown>
      >;
      const [t, svc, p] = await Promise.all([
        (act.getMyTasks() as Promise<Task[]>).catch(() => [] as Task[]),
        (act.getMyServices() as Promise<Service[]>).catch(
          () => [] as Service[],
        ),
        (act.getMyProfile() as Promise<UserProfile | null>).catch(() => null),
      ]);
      setTasks(t);
      setServices(svc);
      setProfile(p);
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

  function handleLogout() {
    clear();
    void navigate({ to: "/portal-internal" });
  }

  // Task counts by status
  const taskPermintaanBaru = tasks.filter(
    (t) => getTaskStatus(t) === "permintaanbaru",
  );
  const taskOnProgress = tasks.filter((t) => getTaskStatus(t) === "onprogress");
  const taskReviewClient = tasks.filter(
    (t) => getTaskStatus(t) === "reviewclient",
  );
  const taskQAAsistenmu = tasks.filter(
    (t) => getTaskStatus(t) === "qaasistenmu",
  );
  const taskRevisi = tasks.filter((t) => getTaskStatus(t) === "revisi");
  const taskDitolak = tasks.filter((t) => getTaskStatus(t) === "ditolak");
  const taskSelesai = tasks.filter((t) => getTaskStatus(t) === "selesai");

  const pagServices = usePagination(services);
  const pagTasks = usePagination(taskPermintaanBaru);

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
                  Selamat datang
                  {profile?.nama ? `, ${profile.nama}` : ", Asistenmu"}
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

          {/* Summary Cards */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(["a", "b", "c", "d", "e", "f", "g", "h"] as const).map((k) => (
                <div
                  key={k}
                  className="bg-white rounded-2xl shadow-soft border border-slate-100 p-4 flex items-center gap-3"
                >
                  <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <SummaryCard
                icon={<Layers size={18} className="text-teal-700" />}
                label="Total Layanan"
                value={services.length}
                bg="bg-teal-50"
              />
              <SummaryCard
                icon={<ClipboardList size={18} className="text-orange-700" />}
                label="Permintaan Baru"
                value={taskPermintaanBaru.length}
                bg="bg-orange-50"
              />
              <SummaryCard
                icon={<ClipboardList size={18} className="text-blue-700" />}
                label="On Progress"
                value={taskOnProgress.length}
                bg="bg-blue-50"
              />
              <SummaryCard
                icon={<ClipboardList size={18} className="text-amber-700" />}
                label="Review Client"
                value={taskReviewClient.length}
                bg="bg-amber-50"
              />
              <SummaryCard
                icon={<ClipboardList size={18} className="text-purple-700" />}
                label="QA Asistenmu"
                value={taskQAAsistenmu.length}
                bg="bg-purple-50"
              />
              <SummaryCard
                icon={<ClipboardList size={18} className="text-red-700" />}
                label="Revisi"
                value={taskRevisi.length}
                bg="bg-red-50"
              />
              <SummaryCard
                icon={<ClipboardList size={18} className="text-rose-700" />}
                label="Ditolak"
                value={taskDitolak.length}
                bg="bg-rose-50"
              />
              <SummaryCard
                icon={<ClipboardList size={18} className="text-emerald-700" />}
                label="Selesai"
                value={taskSelesai.length}
                bg="bg-emerald-50"
              />
            </div>
          )}

          {/* List Layanan Terkait */}
          <CollapsibleSection
            title="Layanan Terkait"
            count={services.length}
            accent="bg-teal-50 text-teal-700"
            defaultOpen
          >
            {services.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                Belum ada layanan yang tertaut ke akun Anda.
              </p>
            ) : (
              <>
                <div className="flex flex-col divide-y divide-slate-100 mt-2">
                  {pagServices.paged.map((svc) => {
                    const tipe = getTipe(svc.tipeLayanan);
                    const statusStr = getTipe(svc.status);
                    return (
                      <div
                        key={svc.idService}
                        className="py-3 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-slate-500">
                            {svc.idService}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${tipeBadgeClass(tipe)}`}
                          >
                            {tipeLabel(tipe)}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              statusStr === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {statusStr === "active" ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                          <div>
                            <span className="text-slate-400">Client: </span>
                            <span className="text-slate-700 font-medium">
                              {svc.clientNama}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Unit: </span>
                            <span className="text-slate-700 font-medium">
                              {String(svc.unitLayanan)} unit
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Dibuat: </span>
                            <span className="text-slate-700">
                              {formatDate(svc.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <PaginationControls
                  page={pagServices.page}
                  totalPages={pagServices.totalPages}
                  setPage={pagServices.setPage}
                />
              </>
            )}
          </CollapsibleSection>

          {/* Task Permintaan Baru */}
          <CollapsibleSection
            title="Task Permintaan Baru"
            count={taskPermintaanBaru.length}
            accent={
              taskPermintaanBaru.length > 0
                ? "bg-orange-100 text-orange-700"
                : "bg-slate-100 text-slate-500"
            }
            defaultOpen
          >
            {taskPermintaanBaru.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                Tidak ada permintaan task baru.
              </p>
            ) : (
              <>
                <div className="flex flex-col divide-y divide-slate-100 mt-2">
                  {pagTasks.paged.map((task) => (
                    <div
                      key={task.idTask}
                      className="py-3 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-500">
                          {task.idTask}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                        >
                          Permintaan Baru
                        </Badge>
                      </div>
                      <p className="font-medium text-slate-900 text-sm">
                        {task.judulTask}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                        <span>
                          Client:{" "}
                          <span className="text-slate-700">
                            {task.clientNama || "—"}
                          </span>
                        </span>
                        <span>
                          Service:{" "}
                          <span className="text-slate-700 font-mono">
                            {task.serviceId}
                          </span>
                        </span>
                        {task.deadline > 0n && (
                          <span>
                            Deadline:{" "}
                            <span className="text-slate-700">
                              {formatDate(task.deadline)}
                            </span>
                          </span>
                        )}
                        <span>
                          Dibuat:{" "}
                          <span className="text-slate-700">
                            {formatDate(task.createdAt)}
                          </span>
                        </span>
                      </div>
                      {task.detailTask && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {task.detailTask}
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
                  ))}
                </div>
                <PaginationControls
                  page={pagTasks.page}
                  totalPages={pagTasks.totalPages}
                  setPage={pagTasks.setPage}
                />
              </>
            )}
          </CollapsibleSection>
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
