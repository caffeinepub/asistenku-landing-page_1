import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  LogOut,
  Pencil,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// ── Types ──────────────────────────────────────────────────────────────────────
interface User {
  idUser: string;
  principalId: string;
  nama: string;
  email: string;
  whatsapp: string;
  role: Record<string, null>;
  status: Record<string, null>;
  createdAt: bigint;
}

interface Partner {
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

interface Client {
  idUser: string;
  principalId: string;
  nama: string;
  email: string;
  whatsapp: string;
  Company: string;
  role: Record<string, null>;
  status: Record<string, null>;
  createdAt: bigint;
}

type PendingEntry =
  | ({ kind: "user" } & User)
  | ({ kind: "partner" } & Partner)
  | ({ kind: "client" } & Client);

type SuspendedEntry =
  | ({ kind: "user" } & User)
  | ({ kind: "partner" } & Partner)
  | ({ kind: "client" } & Client);

// ── Helpers ────────────────────────────────────────────────────────────────────
function getStatus(obj: Record<string, null>): string {
  return Object.keys(obj)[0] ?? "";
}

function getRole(obj: Record<string, null>): string {
  return Object.keys(obj)[0] ?? "";
}

function getLevelLabel(level: Record<string, null>): string {
  const k = Object.keys(level)[0] ?? "";
  const map: Record<string, string> = {
    junior: "Junior",
    senior: "Senior",
    expert: "Expert",
  };
  return map[k] ?? k;
}

function roleBadgeVariant(
  role: string,
): "default" | "secondary" | "outline" | "destructive" {
  if (role === "admin") return "default";
  if (role === "asistenmu") return "secondary";
  if (role === "client") return "outline";
  if (role === "partner") return "outline";
  return "secondary";
}

function roleBadgeLabel(role: string): string {
  const map: Record<string, string> = {
    admin: "Admin",
    asistenmu: "Asistenmu",
    operasional: "Operasional",
    client: "Client",
    partner: "Partner",
    public_: "Publik",
  };
  return map[role] ?? role;
}

function levelBadgeClass(level: string): string {
  if (level === "junior") return "bg-blue-50 text-blue-700 border-blue-200";
  if (level === "senior") return "bg-amber-50 text-amber-700 border-amber-200";
  if (level === "expert")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

// ── Pagination helper ──────────────────────────────────────────────────────────
function usePagination<T>(items: T[], pageSize = 5) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paged = items.slice((page - 1) * pageSize, page * pageSize);
  const reset = useCallback(() => setPage(1), []);
  return { page, setPage, totalPages, paged, reset };
}

// ── Pagination controls ────────────────────────────────────────────────────────
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

// ── Partner Edit Modal ─────────────────────────────────────────────────────────
function PartnerEditModal({
  partner,
  open,
  onOpenChange,
  onUpdate,
}: {
  partner: Partner | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdate: (
    principalId: string,
    level: Record<string, null>,
    skills: string[],
  ) => Promise<void>;
}) {
  const [level, setLevel] = useState<string>("");
  const [skillText, setSkillText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (partner && open) {
      const l = Object.keys(partner.level)[0] ?? "";
      setLevel(l);
      setSkillText(partner.verifiedSkill.join(", "));
    }
  }, [partner, open]);

  async function handleUpdate() {
    if (!partner || !level) return;
    setIsUpdating(true);
    try {
      const skills = skillText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await onUpdate(partner.principalId, { [level]: null }, skills);
      onOpenChange(false);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Partner</DialogTitle>
        </DialogHeader>
        {partner && (
          <div className="flex flex-col gap-4 py-2">
            <div className="text-sm text-slate-600">
              <span className="font-medium">{partner.nama}</span> —{" "}
              {partner.idUser}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="partner-level">Level Partner</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="partner-level">
                  <SelectValue placeholder="Pilih level..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="partner-skills">
                Verified Skills{" "}
                <span className="text-slate-400 font-normal">
                  (pisahkan dengan koma)
                </span>
              </Label>
              <Input
                id="partner-skills"
                placeholder="contoh: Copywriting, SEO, Desain Grafis"
                value={skillText}
                onChange={(e) => setSkillText(e.target.value)}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Batal
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!level || isUpdating}
            className="bg-slate-900 text-white hover:bg-slate-700"
          >
            {isUpdating ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1" />
                Menyimpan...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Collapsible section wrapper ────────────────────────────────────────────────
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
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-slate-900 text-base">
            {title}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${accent ?? "bg-slate-100 text-slate-600"}`}
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

// ── Summary skeleton ───────────────────────────────────────────────────────────
function SummaryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardAdmin() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  const isActorReady = !!actor && !isActorFetching;
  const principalId = identity?.getPrincipal().toString();

  // ── Data state ───────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // ── Action state ─────────────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});

  // ── Partner modal state ──────────────────────────────────────────────────────
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // ── Fetch all data ───────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!actor) return;
    setIsLoadingData(true);
    try {
      const [u, p, c] = await Promise.all([
        (
          actor as unknown as Record<
            string,
            (...args: unknown[]) => Promise<unknown>
          >
        ).getAllUsers() as Promise<User[]>,
        (
          actor as unknown as Record<
            string,
            (...args: unknown[]) => Promise<unknown>
          >
        ).getAllPartners() as Promise<Partner[]>,
        (
          actor as unknown as Record<
            string,
            (...args: unknown[]) => Promise<unknown>
          >
        ).getAllClients() as Promise<Client[]>,
      ]);
      setUsers(u);
      setPartners(p);
      setClients(c);
    } catch {
      toast.error("Gagal memuat data pengguna.");
    } finally {
      setIsLoadingData(false);
    }
  }, [actor]);

  useEffect(() => {
    if (isActorReady) {
      void fetchAll();
    }
  }, [isActorReady, fetchAll]);

  // ── Action helper ─────────────────────────────────────────────────────────────
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
      await fetchAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      toast.error(msg);
    } finally {
      setLoading(key, false);
    }
  }

  // ── Computed lists ────────────────────────────────────────────────────────────
  const pendingUsers = users.filter((u) => getStatus(u.status) === "pending");
  const pendingPartners = partners.filter(
    (p) => getStatus(p.status) === "pending",
  );
  const pendingClients = clients.filter(
    (c) => getStatus(c.status) === "pending",
  );

  const pendingAll: PendingEntry[] = [
    ...pendingUsers.map((u) => ({ kind: "user" as const, ...u })),
    ...pendingPartners.map((p) => ({ kind: "partner" as const, ...p })),
    ...pendingClients.map((c) => ({ kind: "client" as const, ...c })),
  ];

  const activeClients = clients.filter((c) => getStatus(c.status) === "active");
  const activePartners = partners.filter(
    (p) => getStatus(p.status) === "active",
  );
  const activeAdminAsisstenmu = users.filter((u) => {
    const r = getRole(u.role);
    const s = getStatus(u.status);
    return (r === "admin" || r === "asistenmu") && s === "active";
  });
  const activeOperasional = users.filter((u) => {
    const r = getRole(u.role);
    const s = getStatus(u.status);
    return r === "operasional" && s === "active";
  });

  const suspendedUsers = users.filter((u) => getStatus(u.status) === "suspend");
  const suspendedPartners = partners.filter(
    (p) => getStatus(p.status) === "suspend",
  );
  const suspendedClients = clients.filter(
    (c) => getStatus(c.status) === "suspend",
  );
  const suspendedAll: SuspendedEntry[] = [
    ...suspendedUsers.map((u) => ({ kind: "user" as const, ...u })),
    ...suspendedPartners.map((p) => ({ kind: "partner" as const, ...p })),
    ...suspendedClients.map((c) => ({ kind: "client" as const, ...c })),
  ];

  // ── Summary counts ────────────────────────────────────────────────────────────
  const totalAll = users.length + partners.length + clients.length;
  const totalPending = pendingAll.length;
  const totalAktifClient = activeClients.length;
  const totalAktifPartner = activePartners.length;
  const totalAktifAsisstenmu = users.filter(
    (u) => getRole(u.role) === "asistenmu" && getStatus(u.status) === "active",
  ).length;
  const totalUserAktif = activeOperasional.length;

  // ── Paginations ───────────────────────────────────────────────────────────────
  const pendingPag = usePagination(pendingAll);
  const clientPag = usePagination(activeClients);
  const partnerPag = usePagination(activePartners);
  const adminPag = usePagination(activeAdminAsisstenmu);
  const suspendedPag = usePagination(suspendedAll);

  // ── Logout ────────────────────────────────────────────────────────────────────
  function handleLogout() {
    clear();
    void navigate({ to: "/portal-internal" });
  }

  // ── Partner update ────────────────────────────────────────────────────────────
  async function handleUpdatePartner(
    principalId: string,
    level: Record<string, null>,
    skills: string[],
  ) {
    await runAction(
      `update-${principalId}`,
      () =>
        (
          actor as unknown as Record<
            string,
            (...args: unknown[]) => Promise<void>
          >
        ).updatePartnerDetails(principalId, level, skills),
      "Data partner berhasil diperbarui.",
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-slate-700" />
            <span className="font-display font-bold text-slate-900">
              Dashboard Admin
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          {/* ── Welcome Card ── */}
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900">
                  Selamat datang, Admin
                </h1>
                <p className="text-sm text-slate-500">
                  Anda memiliki akses penuh ke sistem Asistenku
                </p>
              </div>
            </div>
            {principalId && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">Principal ID:</p>
                <p className="text-xs font-mono text-slate-700 break-all mt-1">
                  {principalId}
                </p>
              </div>
            )}
          </div>

          {/* ── Summary Cards ── */}
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
              Ringkasan Sistem
            </h2>
            {isLoadingData ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(["a", "b", "c", "d", "e", "f"] as const).map((k) => (
                  <SummaryCardSkeleton key={k} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <SummaryCard
                  icon={<Users size={22} className="text-slate-700" />}
                  label="Total Semua User"
                  value={totalAll}
                  bg="bg-slate-100"
                />
                <SummaryCard
                  icon={<Loader2 size={22} className="text-amber-600" />}
                  label="Pending User"
                  value={totalPending}
                  bg="bg-amber-50"
                  highlight={totalPending > 0}
                />
                <SummaryCard
                  icon={<UserCheck size={22} className="text-emerald-600" />}
                  label="User Aktif"
                  value={totalUserAktif}
                  bg="bg-emerald-50"
                />
                <SummaryCard
                  icon={
                    <span className="text-lg font-bold text-blue-600">CA</span>
                  }
                  label="Client Aktif"
                  value={totalAktifClient}
                  bg="bg-blue-50"
                />
                <SummaryCard
                  icon={
                    <span className="text-lg font-bold text-purple-600">
                      PA
                    </span>
                  }
                  label="Partner Aktif"
                  value={totalAktifPartner}
                  bg="bg-purple-50"
                />
                <SummaryCard
                  icon={<ShieldCheck size={22} className="text-teal-600" />}
                  label="Asistenmu Aktif"
                  value={totalAktifAsisstenmu}
                  bg="bg-teal-50"
                />
              </div>
            )}
          </div>

          {/* ── Manajemen Pengguna ── */}
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
              Manajemen Pengguna
            </h2>
            <div className="flex flex-col gap-4">
              {/* 1. Pending User */}
              <CollapsibleSection
                title="Pending User"
                count={pendingAll.length}
                defaultOpen
                accent={
                  pendingAll.length > 0
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-500"
                }
              >
                {pendingAll.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    Tidak ada user pending.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col divide-y divide-slate-100 mt-2">
                      {pendingPag.paged.map((entry) => (
                        <PendingRow
                          key={entry.idUser}
                          entry={entry}
                          actor={actor}
                          actionLoading={actionLoading}
                          pendingRoles={pendingRoles}
                          setPendingRoles={setPendingRoles}
                          onEdit={(p) => {
                            setEditPartner(p);
                            setEditModalOpen(true);
                          }}
                          runAction={runAction}
                        />
                      ))}
                    </div>
                    <PaginationControls
                      page={pendingPag.page}
                      totalPages={pendingPag.totalPages}
                      setPage={pendingPag.setPage}
                    />
                  </>
                )}
              </CollapsibleSection>

              {/* 2. Client Aktif */}
              <CollapsibleSection
                title="Client Aktif"
                count={activeClients.length}
                accent="bg-blue-50 text-blue-700"
              >
                {activeClients.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    Belum ada client aktif.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col divide-y divide-slate-100 mt-2">
                      {clientPag.paged.map((client) => (
                        <div
                          key={client.idUser}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-slate-500">
                                {client.idUser}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                Client
                              </Badge>
                            </div>
                            <p className="font-medium text-slate-900 text-sm truncate">
                              {client.nama}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {client.email} &middot; {client.Company}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              actionLoading[`suspend-${client.principalId}`]
                            }
                            onClick={() =>
                              runAction(
                                `suspend-${client.principalId}`,
                                () =>
                                  (
                                    actor as unknown as Record<
                                      string,
                                      (...args: unknown[]) => Promise<void>
                                    >
                                  ).suspendClient(client.principalId),
                                `${client.nama} berhasil disuspend.`,
                              )
                            }
                            className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0 text-xs"
                          >
                            {actionLoading[`suspend-${client.principalId}`] ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <>
                                <UserX size={13} className="mr-1" />
                                Suspend
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                    <PaginationControls
                      page={clientPag.page}
                      totalPages={clientPag.totalPages}
                      setPage={clientPag.setPage}
                    />
                  </>
                )}
              </CollapsibleSection>

              {/* 3. Partner Aktif */}
              <CollapsibleSection
                title="Partner Aktif"
                count={activePartners.length}
                accent="bg-purple-50 text-purple-700"
              >
                {activePartners.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    Belum ada partner aktif.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col divide-y divide-slate-100 mt-2">
                      {partnerPag.paged.map((partner) => (
                        <div
                          key={partner.idUser}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-slate-500">
                                {partner.idUser}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${levelBadgeClass(Object.keys(partner.level)[0] ?? "")}`}
                              >
                                {getLevelLabel(partner.level)}
                              </span>
                            </div>
                            <p className="font-medium text-slate-900 text-sm truncate">
                              {partner.nama}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {partner.email} &middot; {partner.kota}
                            </p>
                            {partner.verifiedSkill.length > 0 && (
                              <p className="text-xs text-teal-700 truncate">
                                {partner.verifiedSkill.join(", ")}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditPartner(partner);
                                setEditModalOpen(true);
                              }}
                              className="text-xs"
                            >
                              <Pencil size={13} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={
                                actionLoading[`suspend-${partner.principalId}`]
                              }
                              onClick={() =>
                                runAction(
                                  `suspend-${partner.principalId}`,
                                  () =>
                                    (
                                      actor as unknown as Record<
                                        string,
                                        (...args: unknown[]) => Promise<void>
                                      >
                                    ).suspendPartner(partner.principalId),
                                  `${partner.nama} berhasil disuspend.`,
                                )
                              }
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                            >
                              {actionLoading[
                                `suspend-${partner.principalId}`
                              ] ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <>
                                  <UserX size={13} className="mr-1" />
                                  Suspend
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <PaginationControls
                      page={partnerPag.page}
                      totalPages={partnerPag.totalPages}
                      setPage={partnerPag.setPage}
                    />
                  </>
                )}
              </CollapsibleSection>

              {/* 4. Admin & Asistenmu Aktif */}
              <CollapsibleSection
                title="Admin & Asistenmu Aktif"
                count={activeAdminAsisstenmu.length}
                accent="bg-slate-100 text-slate-600"
              >
                {activeAdminAsisstenmu.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    Tidak ada data.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col divide-y divide-slate-100 mt-2">
                      {adminPag.paged.map((user) => (
                        <div
                          key={user.idUser}
                          className="py-3 flex flex-col gap-0.5 min-w-0"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-slate-500">
                              {user.idUser}
                            </span>
                            <Badge
                              variant={roleBadgeVariant(getRole(user.role))}
                              className="text-xs"
                            >
                              {roleBadgeLabel(getRole(user.role))}
                            </Badge>
                          </div>
                          <p className="font-medium text-slate-900 text-sm truncate">
                            {user.nama}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      ))}
                    </div>
                    <PaginationControls
                      page={adminPag.page}
                      totalPages={adminPag.totalPages}
                      setPage={adminPag.setPage}
                    />
                  </>
                )}
              </CollapsibleSection>

              {/* 5. User Suspended */}
              <CollapsibleSection
                title="User Suspended"
                count={suspendedAll.length}
                accent={
                  suspendedAll.length > 0
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-500"
                }
              >
                {suspendedAll.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    Tidak ada user yang disuspend.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col divide-y divide-slate-100 mt-2">
                      {suspendedPag.paged.map((entry) => (
                        <SuspendedRow
                          key={entry.idUser}
                          entry={entry}
                          actor={actor}
                          actionLoading={actionLoading}
                          runAction={runAction}
                        />
                      ))}
                    </div>
                    <PaginationControls
                      page={suspendedPag.page}
                      totalPages={suspendedPag.totalPages}
                      setPage={suspendedPag.setPage}
                    />
                  </>
                )}
              </CollapsibleSection>
            </div>
          </div>
        </div>
      </main>

      {/* ── Partner Edit Modal ── */}
      <PartnerEditModal
        partner={editPartner}
        open={editModalOpen}
        onOpenChange={(v) => {
          setEditModalOpen(v);
          if (!v) setEditPartner(null);
        }}
        onUpdate={handleUpdatePartner}
      />

      <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Asistenku. Panel Admin &mdash;
            Akses Terbatas.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SummaryCard({
  icon,
  label,
  value,
  bg,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-soft border ${highlight ? "border-amber-200" : "border-slate-100"} p-5 flex items-center gap-4`}
    >
      <div
        className={`w-11 h-11 rounded-xl ${bg ?? "bg-slate-100"} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 leading-tight">{label}</p>
        <p
          className={`font-display font-bold text-2xl mt-0.5 ${highlight ? "text-amber-600" : "text-slate-900"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Pending row ────────────────────────────────────────────────────────────────
function PendingRow({
  entry,
  actor,
  actionLoading,
  pendingRoles,
  setPendingRoles,
  onEdit,
  runAction,
}: {
  entry: PendingEntry;
  actor: unknown;
  actionLoading: Record<string, boolean>;
  pendingRoles: Record<string, string>;
  setPendingRoles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onEdit: (p: Partner) => void;
  runAction: (
    key: string,
    fn: () => Promise<void>,
    msg: string,
  ) => Promise<void>;
}) {
  const act = actor as unknown as Record<
    string,
    (...args: unknown[]) => Promise<void>
  >;

  if (entry.kind === "user") {
    const u = entry as { kind: "user" } & User;
    const selectedRole = pendingRoles[u.principalId] ?? "";
    return (
      <div className="py-3 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-500">
                {u.idUser}
              </span>
              <Badge variant="secondary" className="text-xs">
                Internal
              </Badge>
            </div>
            <p className="font-medium text-slate-900 text-sm truncate">
              {u.nama}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {u.email} &middot; {u.whatsapp}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select
            value={selectedRole}
            onValueChange={(v) =>
              setPendingRoles((prev) => ({ ...prev, [u.principalId]: v }))
            }
          >
            <SelectTrigger className="h-8 text-xs w-full sm:w-40">
              <SelectValue placeholder="Pilih role..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operasional">Operasional</SelectItem>
              <SelectItem value="asistenmu">Asistenmu</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={
                !selectedRole || actionLoading[`approve-${u.principalId}`]
              }
              onClick={() =>
                runAction(
                  `approve-${u.principalId}`,
                  () =>
                    act.approveInternalUser(u.principalId, {
                      [selectedRole]: null,
                    }),
                  `${u.nama} berhasil di-approve sebagai ${selectedRole}.`,
                )
              }
              className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs h-8"
            >
              {actionLoading[`approve-${u.principalId}`] ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <UserCheck size={13} className="mr-1" />
                  Approve
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading[`reject-${u.principalId}`]}
              onClick={() =>
                runAction(
                  `reject-${u.principalId}`,
                  () => act.rejectUser(u.principalId),
                  `${u.nama} berhasil di-reject.`,
                )
              }
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-8"
            >
              {actionLoading[`reject-${u.principalId}`] ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <XCircle size={13} className="mr-1" />
                  Reject
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (entry.kind === "client") {
    const c = entry as { kind: "client" } & Client;
    return (
      <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-500">{c.idUser}</span>
            <Badge variant="outline" className="text-xs">
              Client
            </Badge>
          </div>
          <p className="font-medium text-slate-900 text-sm truncate">
            {c.nama}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {c.email} &middot; {c.Company}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            disabled={actionLoading[`approve-${c.principalId}`]}
            onClick={() =>
              runAction(
                `approve-${c.principalId}`,
                () => act.approveClient(c.principalId),
                `${c.nama} berhasil di-approve.`,
              )
            }
            className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs h-8"
          >
            {actionLoading[`approve-${c.principalId}`] ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <UserCheck size={13} className="mr-1" />
                Approve
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={actionLoading[`reject-${c.principalId}`]}
            onClick={() =>
              runAction(
                `reject-${c.principalId}`,
                () => act.rejectClient(c.principalId),
                `${c.nama} berhasil di-reject.`,
              )
            }
            className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-8"
          >
            {actionLoading[`reject-${c.principalId}`] ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <XCircle size={13} className="mr-1" />
                Reject
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Partner
  const p = entry as { kind: "partner" } & Partner;
  return (
    <div className="py-3 flex flex-col gap-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-500">{p.idUser}</span>
          <Badge
            variant="outline"
            className="text-xs text-purple-700 border-purple-200 bg-purple-50"
          >
            Partner
          </Badge>
        </div>
        <p className="font-medium text-slate-900 text-sm truncate">{p.nama}</p>
        <p className="text-xs text-slate-500 truncate">
          {p.email} &middot; {p.kota}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(p)}
          className="text-xs h-8"
        >
          <Pencil size={13} className="mr-1" />
          Edit
        </Button>
        <Button
          size="sm"
          disabled={actionLoading[`approve-${p.principalId}`]}
          onClick={() =>
            runAction(
              `approve-${p.principalId}`,
              () => act.approvePartner(p.principalId),
              `${p.nama} berhasil di-approve.`,
            )
          }
          className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs h-8"
        >
          {actionLoading[`approve-${p.principalId}`] ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <>
              <UserCheck size={13} className="mr-1" />
              Approve
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={actionLoading[`reject-${p.principalId}`]}
          onClick={() =>
            runAction(
              `reject-${p.principalId}`,
              () => act.rejectPartner(p.principalId),
              `${p.nama} berhasil di-reject.`,
            )
          }
          className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-8"
        >
          {actionLoading[`reject-${p.principalId}`] ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <>
              <XCircle size={13} className="mr-1" />
              Reject
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Suspended row ──────────────────────────────────────────────────────────────
function SuspendedRow({
  entry,
  actor,
  actionLoading,
  runAction,
}: {
  entry: SuspendedEntry;
  actor: unknown;
  actionLoading: Record<string, boolean>;
  runAction: (
    key: string,
    fn: () => Promise<void>,
    msg: string,
  ) => Promise<void>;
}) {
  const act = actor as unknown as Record<
    string,
    (...args: unknown[]) => Promise<void>
  >;
  const key = `reactivate-${entry.principalId}`;

  let typeLabel = "Internal";
  let reactivateFn: () => Promise<void>;

  if (entry.kind === "partner") {
    typeLabel = "Partner";
    reactivateFn = () => act.reactivatePartner(entry.principalId);
  } else if (entry.kind === "client") {
    typeLabel = "Client";
    reactivateFn = () => act.reactivateClient(entry.principalId);
  } else {
    typeLabel = "Internal";
    reactivateFn = () => act.reactivateUser(entry.principalId);
  }

  return (
    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-500">
            {entry.idUser}
          </span>
          <Badge variant="secondary" className="text-xs">
            {typeLabel}
          </Badge>
        </div>
        <p className="font-medium text-slate-900 text-sm truncate">
          {entry.nama}
        </p>
        <p className="text-xs text-slate-500 truncate">{entry.email}</p>
      </div>
      <Button
        size="sm"
        disabled={actionLoading[key]}
        onClick={() =>
          runAction(
            key,
            reactivateFn,
            `${entry.nama} berhasil diaktifkan kembali.`,
          )
        }
        className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs flex-shrink-0"
      >
        {actionLoading[key] ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <>
            <UserCheck size={13} className="mr-1" />
            Reaktivasi
          </>
        )}
      </Button>
    </div>
  );
}
