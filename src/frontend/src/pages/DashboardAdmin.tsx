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
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

function getTipe(obj: Record<string, null>): string {
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

// ── Autocomplete component ─────────────────────────────────────────────────────
interface AutocompleteOption {
  idUser: string;
  principalId: string;
  nama: string;
}

function Autocomplete({
  options,
  value,
  onChange,
  placeholder,
  id,
}: {
  options: AutocompleteOption[];
  value: AutocompleteOption | null;
  onChange: (v: AutocompleteOption | null) => void;
  placeholder?: string;
  id?: string;
}) {
  const [query, setQuery] = useState(
    value ? `${value.idUser} — ${value.nama}` : "",
  );
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setQuery(`${value.idUser} — ${value.nama}`);
    } else {
      setQuery("");
    }
  }, [value]);

  const filtered = query
    ? options
        .filter(
          (o) =>
            o.idUser.toLowerCase().includes(query.toLowerCase()) ||
            o.nama.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 8)
    : options.slice(0, 8);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={query}
        placeholder={placeholder ?? "Ketik untuk mencari..."}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        className="text-sm"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {filtered.map((opt) => (
            <button
              key={opt.principalId}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt);
                setQuery(`${opt.idUser} — ${opt.nama}`);
                setOpen(false);
              }}
            >
              <span className="font-mono text-xs text-slate-500">
                {opt.idUser}
              </span>{" "}
              <span className="text-slate-900">{opt.nama}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Partner Autocomplete (shows verifiedSkill) ────────────────────────────────
function PartnerAutocomplete({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: Partner[];
  value: Partner | null;
  onChange: (v: Partner | null) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(
    value ? `${value.idUser} — ${value.nama}` : "",
  );
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setQuery(`${value.idUser} — ${value.nama}`);
    } else {
      setQuery("");
    }
  }, [value]);

  const filtered = query
    ? options
        .filter(
          (o) =>
            o.idUser.toLowerCase().includes(query.toLowerCase()) ||
            o.nama.toLowerCase().includes(query.toLowerCase()) ||
            o.verifiedSkill.some((s) =>
              s.toLowerCase().includes(query.toLowerCase()),
            ),
        )
        .slice(0, 8)
    : options.slice(0, 8);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        placeholder={placeholder ?? "Cari partner (ID / Nama / Skill)..."}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        className="text-sm"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {filtered.map((opt) => (
            <button
              key={opt.principalId}
              type="button"
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt);
                setQuery(`${opt.idUser} — ${opt.nama}`);
                setOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500">
                  {opt.idUser}
                </span>
                <span className="text-slate-900 font-medium">{opt.nama}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded border ${levelBadgeClass(Object.keys(opt.level)[0] ?? "")}`}
                >
                  {getLevelLabel(opt.level)}
                </span>
              </div>
              {opt.verifiedSkill.length > 0 && (
                <p className="text-xs text-teal-600 mt-0.5 truncate">
                  {opt.verifiedSkill.join(", ")}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── GDrive Link Field ──────────────────────────────────────────────────────────
function GDriveLinkField({
  label,
  value,
  onChange,
  readOnly,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  id?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-sm font-medium flex items-center gap-1.5"
      >
        <FolderOpen size={13} className="text-slate-400" />
        {label}
      </Label>
      <div className="flex gap-2 items-center">
        <Input
          id={id}
          type="url"
          placeholder="https://drive.google.com/..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          className={`text-sm flex-1 ${readOnly ? "bg-slate-50 text-slate-500" : ""}`}
        />
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
            title="Buka link"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Delegasi Form ──────────────────────────────────────────────────────────────
function DelegasiForm({
  task,
  partnersList,
  onSuccess,
  actor,
  isReadOnly = false,
}: {
  task: Task;
  partnersList: Partner[];
  onSuccess: () => void;
  actor: unknown;
  isReadOnly?: boolean;
}) {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [jamEfektif, setJamEfektif] = useState(
    isReadOnly ? String(task.jamEfektif) : "",
  );
  const [unitLayanan, setUnitLayanan] = useState(
    isReadOnly ? String(task.unitLayanan) : "",
  );
  const [notes, setNotes] = useState(isReadOnly ? task.notesAsistenmu : "");
  const [linkInternal, setLinkInternal] = useState(
    isReadOnly ? task.linkGdriveInternal : "",
  );
  const [linkClient, setLinkClient] = useState(
    isReadOnly ? task.linkGdriveClient : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!selectedPartner) {
      toast.error("Pilih partner terlebih dahulu.");
      return;
    }
    if (!isReadOnly && (!jamEfektif || !unitLayanan)) {
      toast.error("Lengkapi jam efektif dan unit layanan.");
      return;
    }
    setIsSubmitting(true);
    try {
      await (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<void>
        >
      ).delegasiTask(
        task.idTask,
        selectedPartner.principalId,
        selectedPartner.nama,
        BigInt(jamEfektif || "0"),
        BigInt(unitLayanan || "0"),
        notes,
        linkInternal,
        linkClient,
      );
      toast.success(
        `Task ${task.idTask} berhasil didelegasikan ke ${selectedPartner.nama}.`,
      );
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mendelegasikan task.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {isReadOnly ? "Delegasi Ulang" : "Form Delegasi"}
      </p>

      {/* Partner autocomplete (always editable) */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium">Partner</Label>
        <PartnerAutocomplete
          options={partnersList}
          value={selectedPartner}
          onChange={setSelectedPartner}
          placeholder="Cari partner (ID / Nama / Skill)..."
        />
        {isReadOnly && task.partnerId && (
          <p className="text-xs text-slate-400">
            Partner sebelumnya: {task.partnerNama}
          </p>
        )}
      </div>

      {/* Jam Efektif */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`jam-${task.idTask}`} className="text-sm font-medium">
            Jam Efektif Kerja
          </Label>
          <Input
            id={`jam-${task.idTask}`}
            type="number"
            min="0"
            placeholder="0"
            value={jamEfektif}
            onChange={(e) => setJamEfektif(e.target.value)}
            readOnly={isReadOnly}
            className={`text-sm ${isReadOnly ? "bg-white text-slate-500" : ""}`}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor={`unit-${task.idTask}`}
            className="text-sm font-medium"
          >
            Unit Layanan Terpakai
          </Label>
          <Input
            id={`unit-${task.idTask}`}
            type="number"
            min="0"
            placeholder="0"
            value={unitLayanan}
            onChange={(e) => setUnitLayanan(e.target.value)}
            readOnly={isReadOnly}
            className={`text-sm ${isReadOnly ? "bg-white text-slate-500" : ""}`}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`notes-${task.idTask}`} className="text-sm font-medium">
          Notes Asistenmu
        </Label>
        <Textarea
          id={`notes-${task.idTask}`}
          placeholder="Catatan untuk partner..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          readOnly={isReadOnly}
          className={`text-sm min-h-[72px] resize-none ${isReadOnly ? "bg-white text-slate-500" : ""}`}
        />
      </div>

      {/* GDrive links */}
      <GDriveLinkField
        label="Link GDrive Internal"
        id={`gdrive-int-${task.idTask}`}
        value={linkInternal}
        onChange={setLinkInternal}
        readOnly={isReadOnly}
      />
      <GDriveLinkField
        label="Link GDrive Client"
        id={`gdrive-client-${task.idTask}`}
        value={linkClient}
        onChange={setLinkClient}
        readOnly={isReadOnly}
      />

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedPartner}
        className="w-full bg-slate-900 text-white hover:bg-slate-700 mt-1"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={14} className="animate-spin mr-2" />
            Mendelegasikan...
          </>
        ) : (
          <>
            <Send size={14} className="mr-2" />
            Delegasikan
          </>
        )}
      </Button>
    </div>
  );
}

// ── Task Filter Bar ────────────────────────────────────────────────────────────
function TaskFilterBar({
  filterNamaClient,
  setFilterNamaClient,
  filterTipe,
  setFilterTipe,
}: {
  filterNamaClient: string;
  setFilterNamaClient: (v: string) => void;
  filterTipe: string;
  setFilterTipe: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mt-3">
      <div className="flex-1">
        <Input
          placeholder="Filter nama client..."
          value={filterNamaClient}
          onChange={(e) => setFilterNamaClient(e.target.value)}
          className="text-sm h-8"
        />
      </div>
      <Select value={filterTipe} onValueChange={setFilterTipe}>
        <SelectTrigger className="h-8 text-sm w-full sm:w-36">
          <SelectValue placeholder="Semua Tipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tipe</SelectItem>
          <SelectItem value="tenang">TENANG</SelectItem>
          <SelectItem value="rapi">RAPI</SelectItem>
          <SelectItem value="fokus">FOKUS</SelectItem>
          <SelectItem value="jaga">JAGA</SelectItem>
          <SelectItem value="efisien">EFISIEN</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ── Task Row (shared display) ──────────────────────────────────────────────────
function TaskRowBase({ task, services }: { task: Task; services: Service[] }) {
  const statusKey = Object.keys(task.status)[0] ?? "";
  const svc = services.find((s) => s.idService === task.serviceId);
  const tipe = svc ? getTipe(svc.tipeLayanan) : "";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-mono text-slate-500">{task.idTask}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${taskStatusBadgeClass(statusKey)}`}
        >
          {taskStatusLabel(statusKey)}
        </span>
        {tipe && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tipeBadgeClass(tipe)}`}
          >
            {tipeLabel(tipe)}
          </span>
        )}
      </div>
      <p className="font-medium text-slate-900 text-sm">{task.judulTask}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
        <span>
          Client:{" "}
          <span className="text-slate-700">{task.clientNama || "—"}</span>
        </span>
        {task.partnerNama && (
          <span>
            Partner: <span className="text-slate-700">{task.partnerNama}</span>
          </span>
        )}
        {task.asistenmuNama && (
          <span>
            Asistenmu:{" "}
            <span className="text-slate-700">{task.asistenmuNama}</span>
          </span>
        )}
        <span>
          Dibuat:{" "}
          <span className="text-slate-700">{formatDate(task.createdAt)}</span>
        </span>
        {task.deadline > 0n && (
          <span>
            Deadline:{" "}
            <span className="text-slate-700">{formatDate(task.deadline)}</span>
          </span>
        )}
        {task.jamEfektif > 0n && (
          <span>
            Jam:{" "}
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
      {/* GDrive links display */}
      <div className="flex gap-3 mt-0.5">
        {task.linkGdriveInternal && (
          <a
            href={task.linkGdriveInternal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <FolderOpen size={12} />
            GDrive Internal
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
          </a>
        )}
      </div>
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

// ── Outer collapsible (section-level) ─────────────────────────────────────────
function OuterCollapsible({
  title,
  count,
  countAccent,
  children,
  defaultOpen = false,
}: {
  title: string;
  count: number;
  countAccent?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
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
          <span className="font-display font-bold text-slate-900 text-lg">
            {title}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${countAccent ?? "bg-slate-100 text-slate-600"}`}
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

// ── Inner collapsible section wrapper ─────────────────────────────────────────
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

// ── Filter bar ─────────────────────────────────────────────────────────────────
function UserFilterBar({
  filterRole,
  setFilterRole,
  filterNama,
  setFilterNama,
}: {
  filterRole: string;
  setFilterRole: (v: string) => void;
  filterNama: string;
  setFilterNama: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex-1">
        <Input
          placeholder="Filter nama..."
          value={filterNama}
          onChange={(e) => setFilterNama(e.target.value)}
          className="text-sm h-9"
        />
      </div>
      <Select value={filterRole} onValueChange={setFilterRole}>
        <SelectTrigger className="h-9 text-sm w-full sm:w-44">
          <SelectValue placeholder="Semua Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Role</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="asistenmu">Asistenmu</SelectItem>
          <SelectItem value="operasional">Operasional</SelectItem>
          <SelectItem value="client">Client</SelectItem>
          <SelectItem value="partner">Partner</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function ServiceFilterBar({
  filterTipe,
  setFilterTipe,
  filterNamaClient,
  setFilterNamaClient,
  filterStatus,
  setFilterStatus,
}: {
  filterTipe: string;
  setFilterTipe: (v: string) => void;
  filterNamaClient: string;
  setFilterNamaClient: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex-1">
        <Input
          placeholder="Filter nama client..."
          value={filterNamaClient}
          onChange={(e) => setFilterNamaClient(e.target.value)}
          className="text-sm h-9"
        />
      </div>
      <Select value={filterTipe} onValueChange={setFilterTipe}>
        <SelectTrigger className="h-9 text-sm w-full sm:w-36">
          <SelectValue placeholder="Semua Tipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tipe</SelectItem>
          <SelectItem value="tenang">TENANG</SelectItem>
          <SelectItem value="rapi">RAPI</SelectItem>
          <SelectItem value="fokus">FOKUS</SelectItem>
          <SelectItem value="jaga">JAGA</SelectItem>
          <SelectItem value="efisien">EFISIEN</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="h-9 text-sm w-full sm:w-36">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="active">Aktif</SelectItem>
          <SelectItem value="inactive">Nonaktif</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ── Aktivasi Layanan Form ──────────────────────────────────────────────────────
function AktivaasiLayananForm({
  clientsList,
  asistenmuList,
  serviceCount,
  onSuccess,
  actor,
}: {
  clientsList: Client[];
  asistenmuList: User[];
  serviceCount: number;
  onSuccess: () => void;
  actor: unknown;
}) {
  const [tipe, setTipe] = useState("");
  const [selectedClient, setSelectedClient] =
    useState<AutocompleteOption | null>(null);
  const [selectedAsistenmu, setSelectedAsistenmu] =
    useState<AutocompleteOption | null>(null);
  const [unitLayanan, setUnitLayanan] = useState("");
  const [hargaPerLayanan, setHargaPerLayanan] = useState("");
  const [sharingFields, setSharingFields] = useState<
    { id: number; value: AutocompleteOption | null }[]
  >([{ id: 1, value: null }]);
  const sharingIdCounter = useRef(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientOptions: AutocompleteOption[] = clientsList.map((c) => ({
    idUser: c.idUser,
    principalId: c.principalId,
    nama: c.nama,
  }));
  const asistenmuOptions: AutocompleteOption[] = asistenmuList.map((u) => ({
    idUser: u.idUser,
    principalId: u.principalId,
    nama: u.nama,
  }));

  const nextServiceId = `SA_${String(serviceCount + 1).padStart(5, "0")}`;

  function addSharingField() {
    if (sharingFields.length < 6) {
      const newId = sharingIdCounter.current++;
      setSharingFields((prev) => [...prev, { id: newId, value: null }]);
    }
  }

  function removeSharingField(id: number) {
    setSharingFields((prev) => prev.filter((f) => f.id !== id));
  }

  function updateSharing(id: number, val: AutocompleteOption | null) {
    setSharingFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: val } : f)),
    );
  }

  async function handleSubmit() {
    if (
      !tipe ||
      !selectedClient ||
      !selectedAsistenmu ||
      !unitLayanan ||
      !hargaPerLayanan
    ) {
      toast.error("Lengkapi semua field yang diperlukan.");
      return;
    }
    setIsSubmitting(true);
    try {
      const sharingArray: SharingEntry[] = sharingFields
        .filter(
          (f): f is { id: number; value: AutocompleteOption } =>
            f.value !== null,
        )
        .map((f) => ({
          idUser: f.value.idUser,
          principalId: f.value.principalId,
          nama: f.value.nama,
        }));

      await (
        actor as Record<string, (...args: unknown[]) => Promise<unknown>>
      ).aktivasiLayanan(
        { [tipe]: null },
        selectedClient.principalId,
        selectedClient.nama,
        selectedAsistenmu.principalId,
        selectedAsistenmu.nama,
        BigInt(unitLayanan),
        BigInt(hargaPerLayanan),
        sharingArray,
      );
      toast.success("Layanan berhasil diaktifkan.");
      setTipe("");
      setSelectedClient(null);
      setSelectedAsistenmu(null);
      setUnitLayanan("");
      setHargaPerLayanan("");
      setSharingFields([{ id: 1, value: null }]);
      sharingIdCounter.current = 2;
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengaktifkan layanan.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 mt-3">
      {/* ID Service (read-only) */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-slate-500">
          ID Service (auto-generate)
        </Label>
        <div className="h-9 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-500">
          {nextServiceId}
        </div>
      </div>

      {/* Tipe Layanan */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tipe-layanan" className="text-sm font-medium">
          Tipe Layanan
        </Label>
        <Select value={tipe} onValueChange={setTipe}>
          <SelectTrigger id="tipe-layanan">
            <SelectValue placeholder="Pilih tipe layanan..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tenang">TENANG</SelectItem>
            <SelectItem value="rapi">RAPI</SelectItem>
            <SelectItem value="fokus">FOKUS</SelectItem>
            <SelectItem value="jaga">JAGA</SelectItem>
            <SelectItem value="efisien">EFISIEN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium">Client</Label>
        <Autocomplete
          options={clientOptions}
          value={selectedClient}
          onChange={setSelectedClient}
          placeholder="Cari client (ID / Nama)..."
        />
      </div>

      {/* Asistenmu */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium">Assign Asistenmu</Label>
        <Autocomplete
          options={asistenmuOptions}
          value={selectedAsistenmu}
          onChange={setSelectedAsistenmu}
          placeholder="Cari asistenmu (ID / Nama)..."
        />
      </div>

      {/* Unit & Harga */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="unit-layanan" className="text-sm font-medium">
            Unit Layanan
          </Label>
          <Input
            id="unit-layanan"
            type="number"
            min="0"
            placeholder="0"
            value={unitLayanan}
            onChange={(e) => setUnitLayanan(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="harga-layanan" className="text-sm font-medium">
            Harga per Layanan (Rp)
          </Label>
          <Input
            id="harga-layanan"
            type="number"
            min="0"
            placeholder="0"
            value={hargaPerLayanan}
            onChange={(e) => setHargaPerLayanan(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      {/* Sharing Layanan */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">
          Sharing Layanan{" "}
          <span className="text-slate-400 font-normal text-xs">(maks. 6)</span>
        </Label>
        {sharingFields.map((field, idx) => (
          <div key={field.id} className="flex items-center gap-2">
            <div className="flex-1">
              <Autocomplete
                options={clientOptions}
                value={field.value}
                onChange={(v) => updateSharing(field.id, v)}
                placeholder={`Sharing ${idx + 1} — cari client...`}
              />
            </div>
            {idx > 0 && (
              <button
                type="button"
                onClick={() => removeSharingField(field.id)}
                className="flex-shrink-0 w-8 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
        ))}
        {sharingFields.length < 6 && (
          <button
            type="button"
            onClick={addSharingField}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors self-start mt-1"
          >
            <Plus size={13} />
            Tambah Sharing
          </button>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-slate-900 text-white hover:bg-slate-700 mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={14} className="animate-spin mr-2" />
            Mengaktifkan...
          </>
        ) : (
          "Aktifkan Layanan"
        )}
      </Button>
    </div>
  );
}

// ── Top Up Form ────────────────────────────────────────────────────────────────
function TopUpForm({
  services,
  onSuccess,
  actor,
}: {
  services: Service[];
  onSuccess: () => void;
  actor: unknown;
}) {
  const [idService, setIdService] = useState("");
  const [namaClient, setNamaClient] = useState("");
  const [unitTambahan, setUnitTambahan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleIdBlur() {
    if (!idService) {
      setNamaClient("");
      return;
    }
    const found = services.find((s) => s.idService === idService.trim());
    if (found) {
      setNamaClient(found.clientNama);
    } else {
      setNamaClient("");
    }
  }

  async function handleSubmit() {
    if (!idService || !unitTambahan) {
      toast.error("Lengkapi ID Service dan unit tambahan.");
      return;
    }
    setIsSubmitting(true);
    try {
      await (
        actor as Record<string, (...args: unknown[]) => Promise<unknown>>
      ).topUpService(idService.trim(), BigInt(unitTambahan));
      toast.success("Top Up berhasil.");
      setIdService("");
      setNamaClient("");
      setUnitTambahan("");
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal melakukan top up.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 mt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="top-up-id" className="text-sm font-medium">
            ID Service
          </Label>
          <Input
            id="top-up-id"
            placeholder="SA_00001"
            value={idService}
            onChange={(e) => setIdService(e.target.value)}
            onBlur={handleIdBlur}
            className="text-sm font-mono"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Nama Client</Label>
          <div className="h-9 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
            {namaClient || (
              <span className="text-slate-300">Auto dari ID Service</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="unit-tambahan" className="text-sm font-medium">
          Unit Tambahan
        </Label>
        <Input
          id="unit-tambahan"
          type="number"
          min="1"
          placeholder="0"
          value={unitTambahan}
          onChange={(e) => setUnitTambahan(e.target.value)}
          className="text-sm"
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-slate-900 text-white hover:bg-slate-700"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={14} className="animate-spin mr-2" />
            Memproses...
          </>
        ) : (
          "Top Up"
        )}
      </Button>
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
  const [services, setServices] = useState<Service[]>([]);
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [asistenmuList, setAsistenmuList] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [partnersList, setPartnersList] = useState<Partner[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // ── Filter state: Manajemen Pengguna ─────────────────────────────────────────
  const [filterRole, setFilterRole] = useState("all");
  const [filterNama, setFilterNama] = useState("");

  // ── Filter state: Manajemen Service ──────────────────────────────────────────
  const [filterTipe, setFilterTipe] = useState("all");
  const [filterNamaClient, setFilterNamaClient] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // ── Action state ─────────────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});

  // ── Partner modal state ──────────────────────────────────────────────────────
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // ── Task delegasi open state ─────────────────────────────────────────────────
  const [openDelegasiTaskId, setOpenDelegasiTaskId] = useState<string | null>(
    null,
  );

  // ── Fetch all data ───────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!actor) return;
    setIsLoadingData(true);
    try {
      const act = actor as unknown as Record<
        string,
        (...args: unknown[]) => Promise<unknown>
      >;
      const [u, p, c, svc, cl, am, t, pl] = await Promise.all([
        act.getAllUsers() as Promise<User[]>,
        act.getAllPartners() as Promise<Partner[]>,
        act.getAllClients() as Promise<Client[]>,
        (act.getServices() as Promise<Service[]>).catch(() => [] as Service[]),
        (act.getClients() as Promise<Client[]>).catch(() => [] as Client[]),
        (act.getAsistenmu() as Promise<User[]>).catch(() => [] as User[]),
        (act.getAllTasks() as Promise<Task[]>).catch(() => [] as Task[]),
        (act.getPartners() as Promise<Partner[]>).catch(() => [] as Partner[]),
      ]);
      setUsers(u);
      setPartners(p);
      setClients(c);
      setServices(svc);
      setClientsList(cl);
      setAsistenmuList(am);
      setTasks(t);
      setPartnersList(pl);
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

  // ── Filter helpers ────────────────────────────────────────────────────────────
  function matchesUserFilter(nama: string, role: string): boolean {
    const namaMatch =
      filterNama === "" ||
      nama.toLowerCase().includes(filterNama.toLowerCase());
    const roleMatch = filterRole === "all" || filterRole === role;
    return namaMatch && roleMatch;
  }

  // ── Computed lists ────────────────────────────────────────────────────────────
  const pendingUsers = users.filter(
    (u) =>
      getStatus(u.status) === "pending" &&
      matchesUserFilter(u.nama, getRole(u.role)),
  );
  const pendingPartners = partners.filter(
    (p) =>
      getStatus(p.status) === "pending" && matchesUserFilter(p.nama, "partner"),
  );
  const pendingClients = clients.filter(
    (c) =>
      getStatus(c.status) === "pending" && matchesUserFilter(c.nama, "client"),
  );

  const pendingAll: PendingEntry[] = [
    ...pendingUsers.map((u) => ({ kind: "user" as const, ...u })),
    ...pendingPartners.map((p) => ({ kind: "partner" as const, ...p })),
    ...pendingClients.map((c) => ({ kind: "client" as const, ...c })),
  ];

  const activeClients = clients.filter(
    (c) =>
      getStatus(c.status) === "active" && matchesUserFilter(c.nama, "client"),
  );
  const activePartners = partners.filter(
    (p) =>
      getStatus(p.status) === "active" && matchesUserFilter(p.nama, "partner"),
  );
  const activeAdminAsisstenmu = users.filter((u) => {
    const r = getRole(u.role);
    const s = getStatus(u.status);
    return (
      (r === "admin" || r === "asistenmu") &&
      s === "active" &&
      matchesUserFilter(u.nama, r)
    );
  });
  const activeOperasional = users.filter((u) => {
    const r = getRole(u.role);
    const s = getStatus(u.status);
    return r === "operasional" && s === "active";
  });

  const suspendedUsers = users.filter(
    (u) =>
      getStatus(u.status) === "suspend" &&
      matchesUserFilter(u.nama, getRole(u.role)),
  );
  const suspendedPartners = partners.filter(
    (p) =>
      getStatus(p.status) === "suspend" && matchesUserFilter(p.nama, "partner"),
  );
  const suspendedClients = clients.filter(
    (c) =>
      getStatus(c.status) === "suspend" && matchesUserFilter(c.nama, "client"),
  );
  const suspendedAll: SuspendedEntry[] = [
    ...suspendedUsers.map((u) => ({ kind: "user" as const, ...u })),
    ...suspendedPartners.map((p) => ({ kind: "partner" as const, ...p })),
    ...suspendedClients.map((c) => ({ kind: "client" as const, ...c })),
  ];

  // ── Summary counts (unfiltered) ────────────────────────────────────────────────
  const totalAll = users.length + partners.length + clients.length;
  const totalPending =
    users.filter((u) => getStatus(u.status) === "pending").length +
    partners.filter((p) => getStatus(p.status) === "pending").length +
    clients.filter((c) => getStatus(c.status) === "pending").length;
  const totalAktifClient = clients.filter(
    (c) => getStatus(c.status) === "active",
  ).length;
  const totalAktifPartner = partners.filter(
    (p) => getStatus(p.status) === "active",
  ).length;
  const totalAktifAsisstenmu = users.filter(
    (u) => getRole(u.role) === "asistenmu" && getStatus(u.status) === "active",
  ).length;
  const totalUserAktif = activeOperasional.length;

  // Total for manajemen pengguna outer badge (use filtered sum)
  const totalUserFiltered =
    pendingAll.length +
    activeClients.length +
    activePartners.length +
    activeAdminAsisstenmu.length +
    suspendedAll.length;

  // ── Filtered services ─────────────────────────────────────────────────────────
  const filteredServices = services.filter((s) => {
    const tipeMatch =
      filterTipe === "all" || getTipe(s.tipeLayanan) === filterTipe;
    const namaMatch =
      filterNamaClient === "" ||
      s.clientNama.toLowerCase().includes(filterNamaClient.toLowerCase());
    const statusMatch =
      filterStatus === "all" || getTipe(s.status) === filterStatus;
    return tipeMatch && namaMatch && statusMatch;
  });

  // ── Paginations ───────────────────────────────────────────────────────────────
  const pendingPag = usePagination(pendingAll);
  const clientPag = usePagination(activeClients);
  const partnerPag = usePagination(activePartners);
  const adminPag = usePagination(activeAdminAsisstenmu);
  const suspendedPag = usePagination(suspendedAll);
  const servicesPag = usePagination(filteredServices);

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

          {/* ── Manajemen Pengguna (Outer Collapsible) ── */}
          <OuterCollapsible
            title="Manajemen Pengguna"
            count={totalUserFiltered}
            countAccent="bg-slate-100 text-slate-700"
            defaultOpen
          >
            {/* Filter bar */}
            <UserFilterBar
              filterRole={filterRole}
              setFilterRole={setFilterRole}
              filterNama={filterNama}
              setFilterNama={setFilterNama}
            />

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
                            {actionLoading[`suspend-${partner.principalId}`] ? (
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
          </OuterCollapsible>

          {/* ── Manajemen Service (Outer Collapsible) ── */}
          <OuterCollapsible
            title="Manajemen Service"
            count={services.length}
            countAccent="bg-teal-50 text-teal-700"
          >
            {/* Filter bar */}
            <ServiceFilterBar
              filterTipe={filterTipe}
              setFilterTipe={setFilterTipe}
              filterNamaClient={filterNamaClient}
              setFilterNamaClient={setFilterNamaClient}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />

            {/* Sub-card 1: Aktivasi Layanan */}
            <CollapsibleSection
              title="Aktivasi Layanan"
              count={0}
              accent="bg-emerald-50 text-emerald-700"
            >
              <AktivaasiLayananForm
                clientsList={clientsList}
                asistenmuList={asistenmuList}
                serviceCount={services.length}
                onSuccess={fetchAll}
                actor={actor}
              />
            </CollapsibleSection>

            {/* Sub-card 2: Top Up Service */}
            <CollapsibleSection
              title="Top Up Service"
              count={0}
              accent="bg-blue-50 text-blue-700"
            >
              <TopUpForm
                services={services}
                onSuccess={fetchAll}
                actor={actor}
              />
            </CollapsibleSection>

            {/* Sub-card 3: List Layanan */}
            <CollapsibleSection
              title="List Layanan"
              count={filteredServices.length}
              accent="bg-slate-100 text-slate-600"
              defaultOpen
            >
              {filteredServices.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  {services.length === 0
                    ? "Belum ada layanan yang diaktifkan."
                    : "Tidak ada layanan yang cocok dengan filter."}
                </p>
              ) : (
                <>
                  <div className="flex flex-col divide-y divide-slate-100 mt-2">
                    {servicesPag.paged.map((svc) => {
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
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                            <div>
                              <p className="text-xs text-slate-400">Client</p>
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {svc.clientNama}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">
                                Asistenmu
                              </p>
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {svc.asistenmuNama}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">
                                Unit Layanan
                              </p>
                              <p className="text-sm text-slate-700">
                                {String(svc.unitLayanan)} unit
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Dibuat</p>
                              <p className="text-sm text-slate-700">
                                {formatDate(svc.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <PaginationControls
                    page={servicesPag.page}
                    totalPages={servicesPag.totalPages}
                    setPage={servicesPag.setPage}
                  />
                </>
              )}
            </CollapsibleSection>
          </OuterCollapsible>

          {/* ── Manajemen Task (Outer Collapsible) ── */}
          <ManajemenTaskSection
            tasks={tasks}
            services={services}
            partnersList={partnersList}
            actor={actor}
            fetchAll={fetchAll}
            actionLoading={actionLoading}
            runAction={runAction}
            openDelegasiTaskId={openDelegasiTaskId}
            setOpenDelegasiTaskId={setOpenDelegasiTaskId}
          />
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

// ── Manajemen Task Section ─────────────────────────────────────────────────────
function ManajemenTaskSection({
  tasks,
  services,
  partnersList,
  actor,
  fetchAll,
  actionLoading,
  runAction,
  openDelegasiTaskId,
  setOpenDelegasiTaskId,
}: {
  tasks: Task[];
  services: Service[];
  partnersList: Partner[];
  actor: unknown;
  fetchAll: () => Promise<void>;
  actionLoading: Record<string, boolean>;
  runAction: (
    key: string,
    fn: () => Promise<void>,
    msg: string,
  ) => Promise<void>;
  openDelegasiTaskId: string | null;
  setOpenDelegasiTaskId: (id: string | null) => void;
}) {
  const act = actor as unknown as Record<
    string,
    (...args: unknown[]) => Promise<void>
  >;

  function getTasksByStatus(status: string) {
    return tasks.filter((t) => Object.keys(t.status)[0] === status);
  }

  function filterTasks(list: Task[], namaClient: string, tipe: string) {
    return list.filter((t) => {
      const namaMatch =
        namaClient === "" ||
        t.clientNama.toLowerCase().includes(namaClient.toLowerCase());
      const tipeMatch = (() => {
        if (tipe === "all") return true;
        const svc = services.find((s) => s.idService === t.serviceId);
        if (!svc) return false;
        return getTipe(svc.tipeLayanan) === tipe;
      })();
      return namaMatch && tipeMatch;
    });
  }

  function toggleDelegasi(idTask: string) {
    setOpenDelegasiTaskId(openDelegasiTaskId === idTask ? null : idTask);
  }

  // Per sub-card filter states
  const [f1Nama, setF1Nama] = useState("");
  const [f1Tipe, setF1Tipe] = useState("all");
  const [f2Nama, setF2Nama] = useState("");
  const [f2Tipe, setF2Tipe] = useState("all");
  const [f3Nama, setF3Nama] = useState("");
  const [f3Tipe, setF3Tipe] = useState("all");
  const [f4Nama, setF4Nama] = useState("");
  const [f4Tipe, setF4Tipe] = useState("all");
  const [f5Nama, setF5Nama] = useState("");
  const [f5Tipe, setF5Tipe] = useState("all");
  const [f6Nama, setF6Nama] = useState("");
  const [f6Tipe, setF6Tipe] = useState("all");
  const [f7Nama, setF7Nama] = useState("");
  const [f7Tipe, setF7Tipe] = useState("all");

  const tasksBaru = filterTasks(
    getTasksByStatus("permintaanbaru"),
    f1Nama,
    f1Tipe,
  );
  const tasksReview = filterTasks(
    getTasksByStatus("reviewclient"),
    f2Nama,
    f2Tipe,
  );
  const tasksOnProgress = filterTasks(
    getTasksByStatus("onprogress"),
    f3Nama,
    f3Tipe,
  );
  const tasksQA = filterTasks(getTasksByStatus("qaasistenmu"), f4Nama, f4Tipe);
  const tasksRevisi = filterTasks(getTasksByStatus("revisi"), f5Nama, f5Tipe);
  const tasksDitolak = filterTasks(getTasksByStatus("ditolak"), f6Nama, f6Tipe);
  const tasksSelesai = filterTasks(getTasksByStatus("selesai"), f7Nama, f7Tipe);

  const pag1 = usePagination(tasksBaru);
  const pag2 = usePagination(tasksReview);
  const pag3 = usePagination(tasksOnProgress);
  const pag4 = usePagination(tasksQA);
  const pag5 = usePagination(tasksRevisi);
  const pag6 = usePagination(tasksDitolak);
  const pag7 = usePagination(tasksSelesai);

  function TaskEmptyState({ msg }: { msg: string }) {
    return <p className="text-sm text-slate-400 py-4 text-center">{msg}</p>;
  }

  return (
    <OuterCollapsible
      title="Manajemen Task"
      count={tasks.length}
      countAccent="bg-orange-50 text-orange-700"
    >
      {/* 1. Task Baru */}
      <CollapsibleSection
        title="Task Baru"
        count={getTasksByStatus("permintaanbaru").length}
        accent="bg-orange-50 text-orange-700"
        defaultOpen
      >
        <TaskFilterBar
          filterNamaClient={f1Nama}
          setFilterNamaClient={setF1Nama}
          filterTipe={f1Tipe}
          setFilterTipe={setF1Tipe}
        />
        {tasksBaru.length === 0 ? (
          <TaskEmptyState msg="Tidak ada task baru." />
        ) : (
          <>
            <div className="flex flex-col divide-y divide-slate-100 mt-2">
              {pag1.paged.map((task) => (
                <div key={task.idTask} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <TaskRowBase task={task} services={services} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleDelegasi(task.idTask)}
                      className="flex-shrink-0 text-xs"
                    >
                      <Send size={12} className="mr-1" />
                      {openDelegasiTaskId === task.idTask
                        ? "Tutup"
                        : "Delegasikan"}
                    </Button>
                  </div>
                  {openDelegasiTaskId === task.idTask && (
                    <DelegasiForm
                      task={task}
                      partnersList={partnersList}
                      onSuccess={() => {
                        setOpenDelegasiTaskId(null);
                        void fetchAll();
                      }}
                      actor={actor}
                    />
                  )}
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

      {/* 2. Task Review Client */}
      <CollapsibleSection
        title="Task Review Client"
        count={getTasksByStatus("reviewclient").length}
        accent="bg-amber-50 text-amber-700"
      >
        <TaskFilterBar
          filterNamaClient={f2Nama}
          setFilterNamaClient={setF2Nama}
          filterTipe={f2Tipe}
          setFilterTipe={setF2Tipe}
        />
        {tasksReview.length === 0 ? (
          <TaskEmptyState msg="Tidak ada task dalam review client." />
        ) : (
          <>
            <div className="flex flex-col divide-y divide-slate-100 mt-2">
              {pag2.paged.map((task) => (
                <div
                  key={task.idTask}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <TaskRowBase task={task} services={services} />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading[`status-${task.idTask}`]}
                    onClick={() =>
                      runAction(
                        `status-${task.idTask}`,
                        () =>
                          act.updateTaskStatus(task.idTask, { revisi: null }),
                        `Task ${task.idTask} dipindah ke Revisi.`,
                      )
                    }
                    className="flex-shrink-0 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {actionLoading[`status-${task.idTask}`] ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <>
                        <RefreshCw size={12} className="mr-1" />
                        Minta Revisi
                      </>
                    )}
                  </Button>
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

      {/* 3. Task On Progress */}
      <CollapsibleSection
        title="Task On Progress"
        count={getTasksByStatus("onprogress").length}
        accent="bg-blue-50 text-blue-700"
      >
        <TaskFilterBar
          filterNamaClient={f3Nama}
          setFilterNamaClient={setF3Nama}
          filterTipe={f3Tipe}
          setFilterTipe={setF3Tipe}
        />
        {tasksOnProgress.length === 0 ? (
          <TaskEmptyState msg="Tidak ada task on progress." />
        ) : (
          <>
            <div className="flex flex-col divide-y divide-slate-100 mt-2">
              {pag3.paged.map((task) => (
                <div
                  key={task.idTask}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <TaskRowBase task={task} services={services} />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading[`status-${task.idTask}`]}
                    onClick={() =>
                      runAction(
                        `status-${task.idTask}`,
                        () =>
                          act.updateTaskStatus(task.idTask, {
                            qaasistenmu: null,
                          }),
                        `Task ${task.idTask} dipindah ke QA Asistenmu.`,
                      )
                    }
                    className="flex-shrink-0 text-xs text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    {actionLoading[`status-${task.idTask}`] ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <>
                        <ClipboardList size={12} className="mr-1" />
                        Minta QA
                      </>
                    )}
                  </Button>
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

      {/* 4. Task QA Asistenmu */}
      <CollapsibleSection
        title="Task QA Asistenmu"
        count={getTasksByStatus("qaasistenmu").length}
        accent="bg-purple-50 text-purple-700"
      >
        <TaskFilterBar
          filterNamaClient={f4Nama}
          setFilterNamaClient={setF4Nama}
          filterTipe={f4Tipe}
          setFilterTipe={setF4Tipe}
        />
        {tasksQA.length === 0 ? (
          <TaskEmptyState msg="Tidak ada task QA asistenmu." />
        ) : (
          <>
            <div className="flex flex-col divide-y divide-slate-100 mt-2">
              {pag4.paged.map((task) => (
                <div
                  key={task.idTask}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <TaskRowBase task={task} services={services} />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading[`status-${task.idTask}`]}
                    onClick={() =>
                      runAction(
                        `status-${task.idTask}`,
                        () =>
                          act.updateTaskStatus(task.idTask, {
                            reviewclient: null,
                          }),
                        `Task ${task.idTask} dipindah ke Review Client.`,
                      )
                    }
                    className="flex-shrink-0 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    {actionLoading[`status-${task.idTask}`] ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={12} className="mr-1" />
                        Minta Review Client
                      </>
                    )}
                  </Button>
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

      {/* 5. Task Revisi */}
      <CollapsibleSection
        title="Task Revisi"
        count={getTasksByStatus("revisi").length}
        accent="bg-red-50 text-red-700"
      >
        <TaskFilterBar
          filterNamaClient={f5Nama}
          setFilterNamaClient={setF5Nama}
          filterTipe={f5Tipe}
          setFilterTipe={setF5Tipe}
        />
        {tasksRevisi.length === 0 ? (
          <TaskEmptyState msg="Tidak ada task revisi." />
        ) : (
          <>
            <div className="flex flex-col divide-y divide-slate-100 mt-2">
              {pag5.paged.map((task) => (
                <div
                  key={task.idTask}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <TaskRowBase task={task} services={services} />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading[`status-${task.idTask}`]}
                    onClick={() =>
                      runAction(
                        `status-${task.idTask}`,
                        () =>
                          act.updateTaskStatus(task.idTask, {
                            onprogress: null,
                          }),
                        `Task ${task.idTask} dikirim revisi ke partner.`,
                      )
                    }
                    className="flex-shrink-0 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    {actionLoading[`status-${task.idTask}`] ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={12} className="mr-1" />
                        Kirim Revisi ke Partner
                      </>
                    )}
                  </Button>
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

      {/* 6. Task Ditolak Partner */}
      <CollapsibleSection
        title="Task Ditolak Partner"
        count={getTasksByStatus("ditolak").length}
        accent="bg-rose-50 text-rose-700"
      >
        <TaskFilterBar
          filterNamaClient={f6Nama}
          setFilterNamaClient={setF6Nama}
          filterTipe={f6Tipe}
          setFilterTipe={setF6Tipe}
        />
        {tasksDitolak.length === 0 ? (
          <TaskEmptyState msg="Tidak ada task ditolak." />
        ) : (
          <>
            <div className="flex flex-col divide-y divide-slate-100 mt-2">
              {pag6.paged.map((task) => (
                <div key={task.idTask} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <TaskRowBase task={task} services={services} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleDelegasi(task.idTask)}
                      className="flex-shrink-0 text-xs"
                    >
                      <RefreshCw size={12} className="mr-1" />
                      {openDelegasiTaskId === task.idTask
                        ? "Tutup"
                        : "Delegasi Ulang"}
                    </Button>
                  </div>
                  {openDelegasiTaskId === task.idTask && (
                    <DelegasiForm
                      task={task}
                      partnersList={partnersList}
                      onSuccess={() => {
                        setOpenDelegasiTaskId(null);
                        void fetchAll();
                      }}
                      actor={actor}
                      isReadOnly
                    />
                  )}
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

      {/* 7. Task Selesai */}
      <CollapsibleSection
        title="Task Selesai"
        count={getTasksByStatus("selesai").length}
        accent="bg-emerald-50 text-emerald-700"
      >
        <TaskFilterBar
          filterNamaClient={f7Nama}
          setFilterNamaClient={setF7Nama}
          filterTipe={f7Tipe}
          setFilterTipe={setF7Tipe}
        />
        {tasksSelesai.length === 0 ? (
          <TaskEmptyState msg="Belum ada task yang selesai." />
        ) : (
          <>
            <div className="flex flex-col divide-y divide-slate-100 mt-2">
              {pag7.paged.map((task) => (
                <div key={task.idTask} className="py-3">
                  <TaskRowBase task={task} services={services} />
                </div>
              ))}
            </div>
            <PaginationControls
              page={pag7.page}
              totalPages={pag7.totalPages}
              setPage={pag7.setPage}
            />
          </>
        )}
      </CollapsibleSection>
    </OuterCollapsible>
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
