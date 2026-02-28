import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Loader2,
  LogOut,
  RefreshCw,
  Users,
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
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  const isActorReady = !!actor && !isActorFetching;
  const principalId = identity?.getPrincipal().toString();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );

  const fetchData = useCallback(async () => {
    if (!actor) return;
    setIsLoading(true);
    try {
      const act = actor as unknown as Record<
        string,
        (...args: unknown[]) => Promise<unknown>
      >;
      const [t, p] = await Promise.all([
        (act.getMyTasks() as Promise<Task[]>).catch(() => [] as Task[]),
        (act.getMyPartnerProfile() as Promise<PartnerProfile | null>).catch(
          () => null,
        ),
      ]);
      setTasks(t);
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                <Users size={22} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  Selamat datang
                  {profile?.nama ? `, ${profile.nama}` : ", Partner"}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Area kerja partner Asistenku
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

          {/* Summary Cards */}
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

          {/* Task Sections */}
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
