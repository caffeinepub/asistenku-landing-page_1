import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Layers,
  Loader2,
  LogOut,
  RefreshCw,
  Send,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useActor } from "../hooks/useActor";

// ── Types ──────────────────────────────────────────────────────────────────────
type VariantOrString = Record<string, null> | string;

interface UserLocal {
  idUser: string;
  principalId: string;
  nama: string;
  email: string;
  whatsapp: string;
  role: VariantOrString;
  status: VariantOrString;
  createdAt: bigint;
}

interface PartnerLocal {
  idUser: string;
  principalId: string;
  nama: string;
  email: string;
  whatsapp: string;
  kota: string;
  verifiedSkill: string[];
  role: VariantOrString;
  status: VariantOrString;
  createdAt: bigint;
}

interface ClientLocal {
  idUser: string;
  principalId: string;
  nama: string;
  email: string;
  whatsapp: string;
  company: string;
  role: VariantOrString;
  status: VariantOrString;
  createdAt: bigint;
}

interface ServiceLocal {
  idService: string;
  tipeLayanan: VariantOrString;
  clientPrincipalId: string;
  clientNama: string;
  asistenmuNama: string;
  unitLayanan: bigint;
  hargaPerLayanan: bigint;
  status: VariantOrString;
  createdAt: bigint;
}

interface TaskLocal {
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
  status: VariantOrString;
  createdAt: bigint;
}

interface TicketLocal {
  idTicket: string;
  judul: string;
  detail: string;
  divisi: string;
  assignedTo: string;
  status: string;
  creatorId: string;
  creatorNama: string;
  createdAt: bigint;
}

type AnyUser = UserLocal | PartnerLocal | ClientLocal;

// ── Helpers ────────────────────────────────────────────────────────────────────
function extractKey(obj: unknown): string {
  if (typeof obj === "string") return obj;
  if (typeof obj === "object" && obj !== null) {
    const keys = Object.keys(obj as Record<string, unknown>);
    return keys[0] ?? "";
  }
  return "";
}

function roleBadgeLabel(role: string): string {
  const map: Record<string, string> = {
    admin: "Admin",
    asistenmu: "Asistenmu",
    operasional: "Operasional",
    investor: "Investor",
    client: "Client",
    partner: "Partner",
    concierge: "Concierge",
    public_: "Publik",
  };
  return map[role] ?? role;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: "Aktif",
    pending: "Menunggu",
    suspend: "Suspend",
    reject: "Ditolak",
  };
  return map[status] ?? status;
}

function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    suspend: "bg-rose-50 text-rose-700 border-rose-200",
    reject: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return map[status] ?? "bg-slate-50 text-slate-600 border-slate-200";
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

function ticketStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    open: "bg-blue-50 text-blue-700 border-blue-200",
    inprogress: "bg-amber-50 text-amber-700 border-amber-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    map[status.toLowerCase()] ?? "bg-slate-50 text-slate-600 border-slate-200"
  );
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
  const raw = Number(ts);
  const ms = raw > 1e15 ? raw / 1_000_000 : raw;
  return new Date(ms).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function genTicketId(): string {
  const chars = "0123456789";
  let result = "tiket-";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// ── Pagination ─────────────────────────────────────────────────────────────────
function usePagination<T>(items: T[], pageSize = 8) {
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

// ── Collapsible section ────────────────────────────────────────────────────────
function SectionCollapsible({
  title,
  count,
  icon,
  accentClass,
  children,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  accentClass: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="text-slate-500">{icon}</span>
          <span className="font-display font-bold text-slate-900 text-lg">
            {title}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${accentClass}`}
          >
            {count}
          </span>
        </div>
        <span className="text-slate-400 flex-shrink-0">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 p-6 flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Skeleton for loading state ─────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-2 py-3 border-b border-slate-100"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
      ))}
    </div>
  );
}

// ── User Row ───────────────────────────────────────────────────────────────────
function UserRow({ user }: { user: AnyUser }) {
  const role = extractKey(user.role);
  const status = extractKey(user.status);
  return (
    <div
      className="py-4 flex flex-col gap-2 border-b border-slate-100 last:border-0"
      data-ocid="concierge.user-row"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-500">
              {user.idUser}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusBadgeClass(status)}`}
            >
              {statusLabel(status)}
            </span>
            <Badge variant="secondary" className="text-xs">
              {roleBadgeLabel(role)}
            </Badge>
          </div>
          <p className="font-medium text-slate-900 text-sm">{user.nama}</p>
        </div>
        <p className="text-xs text-slate-400 flex-shrink-0 text-right">
          {formatDate(user.createdAt)}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-500">
        <span>
          Email: <span className="text-slate-700">{user.email || "—"}</span>
        </span>
        <span>
          WhatsApp:{" "}
          <span className="text-slate-700">{user.whatsapp || "—"}</span>
        </span>
        <span className="break-all">
          Principal:{" "}
          <span className="font-mono text-slate-600">{user.principalId}</span>
        </span>
        {"company" in user && user.company && (
          <span>
            Perusahaan: <span className="text-slate-700">{user.company}</span>
          </span>
        )}
        {"kota" in user && (user as PartnerLocal).kota && (
          <span>
            Kota:{" "}
            <span className="text-slate-700">
              {(user as PartnerLocal).kota}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardConcierge() {
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  const principalId = identity?.getPrincipal().toString();
  const isActorReady = !!actor && !isActorFetching;

  // ── Role guard ────────────────────────────────────────────────────────────────
  const [isChecking, setIsChecking] = useState(true);
  useEffect(() => {
    if (!isActorReady) return;
    void (async () => {
      try {
        const roleObj = await actor.getMyRole();
        let roleKey = "";
        if (typeof roleObj === "string") roleKey = roleObj;
        else if (typeof roleObj === "object" && roleObj !== null) {
          const keys = Object.keys(roleObj as Record<string, unknown>);
          roleKey = keys[0] ?? "";
        }
        if (!["concierge", "admin", "operasional"].includes(roleKey)) {
          void navigate({ to: "/" });
        } else {
          setIsChecking(false);
        }
      } catch {
        setIsChecking(false);
      }
    })();
  }, [isActorReady, actor, navigate]);

  // ── Data state ────────────────────────────────────────────────────────────────
  const [allUsers, setAllUsers] = useState<UserLocal[]>([]);
  const [allPartners, setAllPartners] = useState<PartnerLocal[]>([]);
  const [allClients, setAllClients] = useState<ClientLocal[]>([]);
  const [allServices, setAllServices] = useState<ServiceLocal[]>([]);
  const [allTasks, setAllTasks] = useState<TaskLocal[]>([]);
  const [allTickets, setAllTickets] = useState<TicketLocal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Search state ──────────────────────────────────────────────────────────────
  const [searchUser, setSearchUser] = useState("");
  const [searchLayanan, setSearchLayanan] = useState("");
  const [searchTask, setSearchTask] = useState("");
  const [searchTicket, setSearchTicket] = useState("");

  // ── Ticket form state ─────────────────────────────────────────────────────────
  const [ticketId] = useState(genTicketId);
  const [ticketJudul, setTicketJudul] = useState("");
  const [ticketDetail, setTicketDetail] = useState("");
  const [ticketDivisi, setTicketDivisi] = useState("");
  const [ticketAssignedToId, setTicketAssignedToId] = useState("");
  const [ticketAssignedToNama, setTicketAssignedToNama] = useState("");
  const [isSendingTicket, setIsSendingTicket] = useState(false);

  // ── Fetch all data ────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!actor) return;
    setIsLoading(true);
    try {
      const [users, partners, clients, services, tasks, tickets] =
        await Promise.all([
          actor.getAllUsers().catch(() => [] as UserLocal[]),
          actor.getAllPartners().catch(() => [] as PartnerLocal[]),
          actor.getAllClients().catch(() => [] as ClientLocal[]),
          actor.getServices().catch(() => [] as ServiceLocal[]),
          actor.getAllTasks().catch(() => [] as TaskLocal[]),
          actor.getAllTickets().catch(() => [] as TicketLocal[]),
        ]);
      setAllUsers(users as UserLocal[]);
      setAllPartners(partners as PartnerLocal[]);
      setAllClients(clients as ClientLocal[]);
      setAllServices(services as ServiceLocal[]);
      setAllTasks(tasks as TaskLocal[]);
      setAllTickets(tickets as TicketLocal[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (isActorReady && !isChecking) {
      void fetchAll();
    }
  }, [isActorReady, isChecking, fetchAll]);

  // ── Logout ────────────────────────────────────────────────────────────────────
  function handleLogout() {
    clear();
    void navigate({ to: "/" });
  }

  // ── Filtered data ─────────────────────────────────────────────────────────────
  const allUsersCombined: AnyUser[] = [
    ...allUsers,
    ...allPartners,
    ...allClients,
  ];

  const filteredUsers = allUsersCombined.filter((u) => {
    if (!searchUser) return true;
    const q = searchUser.toLowerCase();
    return (
      u.nama.toLowerCase().includes(q) ||
      u.idUser.toLowerCase().includes(q) ||
      u.principalId.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.whatsapp.toLowerCase().includes(q)
    );
  });

  const filteredLayanan = allServices.filter((s) => {
    if (!searchLayanan) return true;
    const q = searchLayanan.toLowerCase();
    const tipe = extractKey(s.tipeLayanan).toLowerCase();
    const dateStr = formatDate(s.createdAt).toLowerCase();
    return (
      s.idService.toLowerCase().includes(q) ||
      s.clientNama.toLowerCase().includes(q) ||
      s.asistenmuNama.toLowerCase().includes(q) ||
      tipe.includes(q) ||
      dateStr.includes(q)
    );
  });

  const filteredTasks = allTasks.filter((t) => {
    if (!searchTask) return true;
    const q = searchTask.toLowerCase();
    const dateStr = formatDate(t.createdAt).toLowerCase();
    return (
      t.idTask.toLowerCase().includes(q) ||
      t.judulTask.toLowerCase().includes(q) ||
      t.clientNama.toLowerCase().includes(q) ||
      t.partnerNama.toLowerCase().includes(q) ||
      t.clientId.toLowerCase().includes(q) ||
      dateStr.includes(q)
    );
  });

  const filteredTickets = allTickets.filter((t) => {
    if (!searchTicket) return true;
    const q = searchTicket.toLowerCase();
    return (
      t.idTicket.toLowerCase().includes(q) ||
      t.judul.toLowerCase().includes(q) ||
      t.divisi.toLowerCase().includes(q) ||
      t.creatorNama.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    );
  });

  // ── Pagination ────────────────────────────────────────────────────────────────
  const userPag = usePagination(filteredUsers);
  const layananPag = usePagination(filteredLayanan);
  const taskPag = usePagination(filteredTasks);
  const ticketPag = usePagination(filteredTickets);

  // ── Divisi → role mapping for recipient dropdown ──────────────────────────────
  const divisiRoleMap: Record<string, string[]> = {
    Admin: ["admin"],
    Operasional: ["operasional"],
    Asistenmu: ["asistenmu"],
    "Strategic Partner": ["partner"],
    Finance: ["operasional"],
  };

  const usersForDivisi: UserLocal[] = ticketDivisi
    ? allUsers.filter((u) => {
        const roleKey = extractKey(u.role);
        const allowed = divisiRoleMap[ticketDivisi] ?? [];
        return allowed.includes(roleKey);
      })
    : [];

  // ── Send ticket ───────────────────────────────────────────────────────────────
  async function handleSendTicket() {
    if (
      !ticketJudul.trim() ||
      !ticketDetail.trim() ||
      !ticketDivisi ||
      !ticketAssignedToId
    ) {
      toast.error("Lengkapi semua field tiket dan pilih penerima.");
      return;
    }
    if (!actor) return;
    setIsSendingTicket(true);
    try {
      await actor.createTicket(
        ticketJudul.trim(),
        ticketDetail.trim(),
        ticketDivisi,
        ticketAssignedToId,
      );
      toast.success("Tiket berhasil dikirim.");
      setTicketJudul("");
      setTicketDetail("");
      setTicketDivisi("");
      setTicketAssignedToId("");
      setTicketAssignedToNama("");
      await fetchAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim tiket.";
      toast.error(msg);
    } finally {
      setIsSendingTicket(false);
    }
  }

  // ── Loading / checking ────────────────────────────────────────────────────────
  if (isChecking || isActorFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* ── Top bar ── */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-xl font-bold text-slate-900">
                  Dashboard Concierge
                </h1>
                <p className="text-sm text-slate-500 truncate">
                  {principalId ?? "Memuat..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchAll()}
                disabled={isLoading}
                className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                data-ocid="concierge.refresh"
              >
                <RefreshCw
                  size={15}
                  className={isLoading ? "animate-spin" : ""}
                />
                Muat Ulang
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                data-ocid="concierge.logout"
              >
                <LogOut size={15} />
                Keluar
              </button>
            </div>
          </div>

          {/* ── Section 1: Pengguna ── */}
          <SectionCollapsible
            title="Pengguna"
            count={allUsersCombined.length}
            icon={<Users size={20} />}
            accentClass="bg-blue-50 text-blue-700"
          >
            <div data-ocid="concierge.user-search">
              <Input
                placeholder="Cari nama, ID, principal, email, WhatsApp..."
                value={searchUser}
                onChange={(e) => {
                  setSearchUser(e.target.value);
                  userPag.setPage(1);
                }}
                className="text-sm"
              />
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                {searchUser
                  ? "Tidak ada pengguna yang cocok."
                  : "Belum ada pengguna terdaftar."}
              </p>
            ) : (
              <>
                <div className="flex flex-col">
                  {userPag.paged.map((u) => (
                    <UserRow key={u.principalId} user={u} />
                  ))}
                </div>
                <PaginationControls
                  page={userPag.page}
                  totalPages={userPag.totalPages}
                  setPage={userPag.setPage}
                />
              </>
            )}
          </SectionCollapsible>

          {/* ── Section 2: Layanan ── */}
          <SectionCollapsible
            title="Layanan"
            count={allServices.length}
            icon={<Layers size={20} />}
            accentClass="bg-teal-50 text-teal-700"
          >
            <div data-ocid="concierge.layanan-search">
              <Input
                placeholder="Cari ID layanan, nama client, asistenmu, tipe, tanggal..."
                value={searchLayanan}
                onChange={(e) => {
                  setSearchLayanan(e.target.value);
                  layananPag.setPage(1);
                }}
                className="text-sm"
              />
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredLayanan.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                {searchLayanan
                  ? "Tidak ada layanan yang cocok."
                  : "Belum ada layanan aktif."}
              </p>
            ) : (
              <>
                <div className="flex flex-col divide-y divide-slate-100">
                  {layananPag.paged.map((s) => {
                    const tipe = extractKey(s.tipeLayanan);
                    const stsKey = extractKey(s.status);
                    return (
                      <div
                        key={s.idService}
                        className="py-4 flex flex-col gap-2"
                        data-ocid="concierge.layanan-row"
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-slate-500">
                                {s.idService}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tipeBadgeClass(tipe)}`}
                              >
                                {tipeLabel(tipe)}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                                  stsKey === "active"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                              >
                                {stsKey === "active" ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700">
                              Client:{" "}
                              <span className="font-medium">
                                {s.clientNama || "—"}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500">
                              Asistenmu: {s.asistenmuNama || "—"} &bull; Unit:{" "}
                              {String(s.unitLayanan)} &bull; Harga: Rp{" "}
                              {Number(s.hargaPerLayanan).toLocaleString(
                                "id-ID",
                              )}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 flex-shrink-0">
                            {formatDate(s.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <PaginationControls
                  page={layananPag.page}
                  totalPages={layananPag.totalPages}
                  setPage={layananPag.setPage}
                />
              </>
            )}
          </SectionCollapsible>

          {/* ── Section 3: Tugas ── */}
          <SectionCollapsible
            title="Tugas"
            count={allTasks.length}
            icon={<ClipboardList size={20} />}
            accentClass="bg-purple-50 text-purple-700"
          >
            <div data-ocid="concierge.task-search">
              <Input
                placeholder="Cari ID tugas, judul, nama client, partner, tanggal..."
                value={searchTask}
                onChange={(e) => {
                  setSearchTask(e.target.value);
                  taskPag.setPage(1);
                }}
                className="text-sm"
              />
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredTasks.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                {searchTask
                  ? "Tidak ada tugas yang cocok."
                  : "Belum ada tugas."}
              </p>
            ) : (
              <>
                <div className="flex flex-col divide-y divide-slate-100">
                  {taskPag.paged.map((t) => {
                    const stsKey = extractKey(t.status);
                    return (
                      <div
                        key={t.idTask}
                        className="py-4 flex flex-col gap-2"
                        data-ocid="concierge.task-row"
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-slate-500">
                                {t.idTask}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${taskStatusBadgeClass(stsKey)}`}
                              >
                                {taskStatusLabel(stsKey)}
                              </span>
                            </div>
                            <p className="font-medium text-slate-900 text-sm">
                              {t.judulTask}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                              <span>
                                Client:{" "}
                                <span className="text-slate-700">
                                  {t.clientNama || "—"}
                                </span>
                              </span>
                              {t.partnerNama && (
                                <span>
                                  Partner:{" "}
                                  <span className="text-slate-700">
                                    {t.partnerNama}
                                  </span>
                                </span>
                              )}
                              {t.asistenmuNama && (
                                <span>
                                  Asistenmu:{" "}
                                  <span className="text-slate-700">
                                    {t.asistenmuNama}
                                  </span>
                                </span>
                              )}
                              {t.deadline > 0n && (
                                <span>
                                  Deadline:{" "}
                                  <span className="text-slate-700">
                                    {formatDate(t.deadline)}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 flex-shrink-0">
                            {formatDate(t.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <PaginationControls
                  page={taskPag.page}
                  totalPages={taskPag.totalPages}
                  setPage={taskPag.setPage}
                />
              </>
            )}
          </SectionCollapsible>

          {/* ── Section 4: Tiket ── */}
          <SectionCollapsible
            title="Tiket"
            count={allTickets.length}
            icon={<Ticket size={20} />}
            accentClass="bg-amber-50 text-amber-700"
          >
            {/* Search */}
            <div data-ocid="concierge.ticket-search">
              <Input
                placeholder="Cari ID tiket, judul, divisi, pembuat, status..."
                value={searchTicket}
                onChange={(e) => {
                  setSearchTicket(e.target.value);
                  ticketPag.setPage(1);
                }}
                className="text-sm"
              />
            </div>

            {/* Ticket list */}
            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredTickets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                {searchTicket
                  ? "Tidak ada tiket yang cocok."
                  : "Belum ada tiket."}
              </p>
            ) : (
              <>
                <div className="flex flex-col divide-y divide-slate-100">
                  {ticketPag.paged.map((t) => (
                    <div
                      key={t.idTicket}
                      className="py-4 flex flex-col gap-2"
                      data-ocid="concierge.ticket-row"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-slate-500">
                              {t.idTicket}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ticketStatusBadgeClass(t.status)}`}
                            >
                              {t.status}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              {t.divisi}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900 text-sm">
                            {t.judul}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {t.detail}
                          </p>
                          <p className="text-xs text-slate-400">
                            Dibuat oleh: {t.creatorNama || t.creatorId}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400 flex-shrink-0">
                          {formatDate(t.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <PaginationControls
                  page={ticketPag.page}
                  totalPages={ticketPag.totalPages}
                  setPage={ticketPag.setPage}
                />
              </>
            )}

            {/* ── Create Ticket Form ── */}
            <div className="mt-2 p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Buat Tiket Baru
              </p>

              {/* ID Tiket (read-only preview) */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-slate-500">
                  ID Tiket (otomatis)
                </Label>
                <div className="h-9 px-3 flex items-center bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-500">
                  {ticketId}
                </div>
              </div>

              {/* Judul */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ticket-judul" className="text-sm font-medium">
                  Judul Tiket
                </Label>
                <Input
                  id="ticket-judul"
                  placeholder="Masukkan judul tiket..."
                  value={ticketJudul}
                  onChange={(e) => setTicketJudul(e.target.value)}
                  className="text-sm"
                  data-ocid="concierge.ticket-judul"
                />
              </div>

              {/* Detail */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ticket-detail" className="text-sm font-medium">
                  Detail Masalah
                </Label>
                <Textarea
                  id="ticket-detail"
                  placeholder="Deskripsikan masalah secara detail..."
                  value={ticketDetail}
                  onChange={(e) => setTicketDetail(e.target.value)}
                  className="text-sm min-h-[90px] resize-none"
                  data-ocid="concierge.ticket-detail"
                />
              </div>

              {/* Divisi */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Divisi Tujuan</Label>
                <Select
                  value={ticketDivisi}
                  onValueChange={(val) => {
                    setTicketDivisi(val);
                    setTicketAssignedToId("");
                    setTicketAssignedToNama("");
                  }}
                >
                  <SelectTrigger
                    className="text-sm"
                    data-ocid="concierge.ticket-divisi"
                  >
                    <SelectValue placeholder="Pilih divisi..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Operasional">Operasional</SelectItem>
                    <SelectItem value="Asistenmu">Asistenmu</SelectItem>
                    <SelectItem value="Strategic Partner">
                      Strategic Partner
                    </SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Penerima Tiket — muncul setelah divisi dipilih */}
              {ticketDivisi && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium">
                    Pilih Penerima Tiket
                  </Label>
                  {usersForDivisi.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">
                      Tidak ada user aktif untuk divisi {ticketDivisi}.
                    </p>
                  ) : (
                    <Select
                      value={ticketAssignedToId}
                      onValueChange={(val) => {
                        setTicketAssignedToId(val);
                        const found = usersForDivisi.find(
                          (u) => u.principalId === val,
                        );
                        setTicketAssignedToNama(found?.nama ?? "");
                      }}
                    >
                      <SelectTrigger
                        className="text-sm"
                        data-ocid="concierge.ticket-assignedto"
                      >
                        <SelectValue placeholder="Pilih penerima..." />
                      </SelectTrigger>
                      <SelectContent>
                        {usersForDivisi.map((u) => (
                          <SelectItem key={u.principalId} value={u.principalId}>
                            {u.nama} ({u.idUser})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {ticketAssignedToNama && (
                    <p className="text-xs text-slate-500">
                      Penerima:{" "}
                      <span className="font-medium text-slate-700">
                        {ticketAssignedToNama}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Submit */}
              <Button
                onClick={() => void handleSendTicket()}
                disabled={
                  isSendingTicket ||
                  !ticketJudul.trim() ||
                  !ticketDetail.trim() ||
                  !ticketDivisi ||
                  !ticketAssignedToId
                }
                className="w-full bg-slate-900 text-white hover:bg-slate-700"
                data-ocid="concierge.ticket-submit"
              >
                {isSendingTicket ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={14} className="mr-2" />
                    Kirim Tiket
                  </>
                )}
              </Button>
            </div>
          </SectionCollapsible>
        </div>
      </main>

      <Footer />
    </div>
  );
}
