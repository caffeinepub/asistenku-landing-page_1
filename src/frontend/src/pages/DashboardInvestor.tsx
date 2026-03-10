import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Layers,
  LogOut,
  Package,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Partner, Service, Task, User } from "../backend";
import { Button } from "../components/ui/button";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRoleGuard } from "../hooks/useRoleGuard";

// ─── Types ───────────────────────────────────────────────────────────────────
type FilterPeriod = "mingguan" | "bulanan" | "tahunan";

interface ChartPoint {
  label: string;
  value: number;
}

interface SummaryData {
  totalUser: number;
  totalClient: number;
  totalPartner: number;
  taskOnprogress: number;
  taskSelesai: number;
  gmvTotal: number;
  gmvTenang: number;
  gmvRapi: number;
  gmvFokus: number;
  gmvJaga: number;
  gmvEfisien: number;
  margin: number;
  layananAktifTotal: number;
  layananAktifTenang: number;
  layananAktifRapi: number;
  layananAktifFokus: number;
  layananAktifJaga: number;
  layananAktifEfisien: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatRp(n: number): string {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

function getStatus(obj: Record<string, null> | string): string {
  if (typeof obj === "string") return obj;
  const k = Object.keys(obj as Record<string, unknown>);
  return k[0] ?? "";
}

function getTaskStatus(obj: Record<string, null> | string): string {
  if (typeof obj === "string") return obj;
  const k = Object.keys(obj as Record<string, unknown>);
  return k[0] ?? "";
}

function getTipe(obj: Record<string, null> | string): string {
  if (typeof obj === "string") return obj;
  const k = Object.keys(obj as Record<string, unknown>);
  return k[0] ?? "";
}

function getServiceStatus(obj: Record<string, null> | string): string {
  if (typeof obj === "string") return obj;
  const k = Object.keys(obj as Record<string, unknown>);
  return k[0] ?? "";
}

// Build chart data from createdAt timestamps
function buildChartData(
  timestamps: number[],
  period: FilterPeriod,
): ChartPoint[] {
  const now = Date.now();

  if (period === "mingguan") {
    // Last 7 days
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const lbl = d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
      days[lbl] = 0;
    }
    for (const ts of timestamps) {
      const d = new Date(ts);
      const lbl = d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
      if (lbl in days) days[lbl]++;
    }
    return Object.entries(days).map(([label, value]) => ({ label, value }));
  }

  if (period === "bulanan") {
    // Last 12 months
    const months: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const lbl = d.toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      });
      months[lbl] = 0;
    }
    for (const ts of timestamps) {
      const d = new Date(ts);
      const lbl = d.toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      });
      if (lbl in months) months[lbl]++;
    }
    return Object.entries(months).map(([label, value]) => ({ label, value }));
  }

  // Tahunan - last 5 years
  const years: Record<string, number> = {};
  const currentYear = new Date(now).getFullYear();
  for (let i = 4; i >= 0; i--) {
    years[String(currentYear - i)] = 0;
  }
  for (const ts of timestamps) {
    const yr = String(new Date(ts).getFullYear());
    if (yr in years) years[yr]++;
  }
  return Object.entries(years).map(([label, value]) => ({ label, value }));
}

// Build GMV chart (sum of hargaPerLayanan per period)
function buildGmvChartData(
  services: Service[],
  period: FilterPeriod,
): ChartPoint[] {
  const now = Date.now();

  const toMs = (ts: bigint) => {
    const n = Number(ts);
    return n > 1e15 ? Math.floor(n / 1_000_000) : n;
  };

  if (period === "mingguan") {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const lbl = d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
      days[lbl] = 0;
    }
    for (const s of services) {
      const ts = toMs(s.createdAt);
      const lbl = new Date(ts).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
      if (lbl in days)
        days[lbl] += Number(s.unitLayanan) * Number(s.hargaPerLayanan);
    }
    return Object.entries(days).map(([label, value]) => ({ label, value }));
  }

  if (period === "bulanan") {
    const months: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const lbl = d.toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      });
      months[lbl] = 0;
    }
    for (const s of services) {
      const ts = toMs(s.createdAt);
      const lbl = new Date(ts).toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      });
      if (lbl in months)
        months[lbl] += Number(s.unitLayanan) * Number(s.hargaPerLayanan);
    }
    return Object.entries(months).map(([label, value]) => ({ label, value }));
  }

  const years: Record<string, number> = {};
  const currentYear = new Date(now).getFullYear();
  for (let i = 4; i >= 0; i--) {
    years[String(currentYear - i)] = 0;
  }
  for (const s of services) {
    const yr = String(new Date(toMs(s.createdAt)).getFullYear());
    if (yr in years)
      years[yr] += Number(s.unitLayanan) * Number(s.hargaPerLayanan);
  }
  return Object.entries(years).map(([label, value]) => ({ label, value }));
}

// ─── MiniLineChart ────────────────────────────────────────────────────────────
function MiniLineChart({
  data,
  color = "#10b981",
}: {
  data: ChartPoint[];
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart
        data={data}
        margin={{ top: 4, right: 4, left: -32, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 9, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}
          formatter={(v: number) => [v, ""]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── PeriodFilter ─────────────────────────────────────────────────────────────
function PeriodFilter({
  value,
  onChange,
}: {
  value: FilterPeriod;
  onChange: (v: FilterPeriod) => void;
}) {
  const opts: { key: FilterPeriod; label: string }[] = [
    { key: "mingguan", label: "Mingguan" },
    { key: "bulanan", label: "Bulanan" },
    { key: "tahunan", label: "Tahunan" },
  ];
  return (
    <div className="flex gap-1" data-ocid="investor.period_filter">
      {opts.map((o) => (
        <button
          type="button"
          key={o.key}
          onClick={() => onChange(o.key)}
          data-ocid={`investor.period_filter.${o.key}`}
          className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
            value === o.key
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────
function SummaryCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  chartData,
  chartColor,
  period,
  onPeriodChange,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  chartData: ChartPoint[];
  chartColor?: string;
  period: FilterPeriod;
  onPeriodChange: (v: FilterPeriod) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 leading-tight">{label}</p>
          <p className="font-bold text-xl mt-0.5 text-slate-900">{value}</p>
          {sub && <div className="mt-0.5">{sub}</div>}
        </div>
      </div>
      <div>
        <div className="flex justify-end mb-1">
          <PeriodFilter value={period} onChange={onPeriodChange} />
        </div>
        <MiniLineChart data={chartData} color={chartColor} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardInvestor() {
  const { isChecking } = useRoleGuard("investor");
  const { clear } = useInternetIdentity();
  const navigate = useNavigate();
  const { actor } = useActor();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allClients, setAllClients] = useState<User[]>([]);
  const [allPartners, setAllPartners] = useState<Partner[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Per-card period filter
  const [periods, setPeriods] = useState<Record<string, FilterPeriod>>({
    totalUser: "bulanan",
    totalClient: "bulanan",
    totalPartner: "bulanan",
    taskOnprogress: "bulanan",
    taskSelesai: "bulanan",
    gmvTotal: "bulanan",
    gmvPerTipe: "bulanan",
    margin: "bulanan",
    layananAktifTotal: "bulanan",
    layananAktifPerTipe: "bulanan",
  });

  function setPeriod(key: string, v: FilterPeriod) {
    setPeriods((prev) => ({ ...prev, [key]: v }));
  }

  const toMs = useCallback((ts: bigint) => {
    const n = Number(ts);
    return n > 1e15 ? Math.floor(n / 1_000_000) : n;
  }, []);

  const loadData = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const [users, clients, partners, tasks, services] = await Promise.all([
        actor.getAllUsers().catch(() => [] as User[]),
        actor.getAllClients().catch(() => [] as User[]),
        actor.getAllPartners().catch(() => [] as Partner[]),
        actor.getAllTasks().catch(() => [] as Task[]),
        actor.getServices().catch(() => [] as Service[]),
      ]);
      setAllUsers(users);
      setAllClients(clients);
      setAllPartners(partners);
      setAllTasks(tasks);
      setAllServices(services);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleLogout() {
    clear();
    void navigate({ to: "/portal-internal" });
  }

  // ─── Computed Summary ─────────────────────────────────────────────────────
  const summary: SummaryData = {
    totalUser: allUsers.length,
    totalClient: allClients.length,
    totalPartner: allPartners.filter(
      (p) =>
        getStatus(p.status as unknown as Record<string, null>) === "active",
    ).length,
    taskOnprogress: allTasks.filter(
      (t) =>
        getTaskStatus(t.status as unknown as Record<string, null>) ===
        "onprogress",
    ).length,
    taskSelesai: allTasks.filter(
      (t) =>
        getTaskStatus(t.status as unknown as Record<string, null>) ===
        "selesai",
    ).length,
    gmvTotal: allServices.reduce(
      (acc, s) => acc + Number(s.unitLayanan) * Number(s.hargaPerLayanan),
      0,
    ),
    gmvTenang: allServices
      .filter(
        (s) =>
          getTipe(s.tipeLayanan as unknown as Record<string, null>) ===
          "tenang",
      )
      .reduce(
        (acc, s) => acc + Number(s.unitLayanan) * Number(s.hargaPerLayanan),
        0,
      ),
    gmvRapi: allServices
      .filter(
        (s) =>
          getTipe(s.tipeLayanan as unknown as Record<string, null>) === "rapi",
      )
      .reduce(
        (acc, s) => acc + Number(s.unitLayanan) * Number(s.hargaPerLayanan),
        0,
      ),
    gmvFokus: allServices
      .filter(
        (s) =>
          getTipe(s.tipeLayanan as unknown as Record<string, null>) === "fokus",
      )
      .reduce(
        (acc, s) => acc + Number(s.unitLayanan) * Number(s.hargaPerLayanan),
        0,
      ),
    gmvJaga: allServices
      .filter(
        (s) =>
          getTipe(s.tipeLayanan as unknown as Record<string, null>) === "jaga",
      )
      .reduce(
        (acc, s) => acc + Number(s.unitLayanan) * Number(s.hargaPerLayanan),
        0,
      ),
    gmvEfisien: allServices
      .filter(
        (s) =>
          getTipe(s.tipeLayanan as unknown as Record<string, null>) ===
          "efisien",
      )
      .reduce(
        (acc, s) => acc + Number(s.unitLayanan) * Number(s.hargaPerLayanan),
        0,
      ),
    margin:
      allServices.reduce(
        (acc, s) => acc + Number(s.unitLayanan) * Number(s.hargaPerLayanan),
        0,
      ) -
      allTasks
        .filter(
          (t) =>
            getTaskStatus(t.status as unknown as Record<string, null>) ===
            "selesai",
        )
        .reduce((acc, t) => acc + Number(t.jamEfektif) * 0, 0),
    layananAktifTotal: allServices.filter(
      (s) =>
        getServiceStatus(s.status as unknown as Record<string, null>) ===
        "active",
    ).length,
    layananAktifTenang: allServices.filter(
      (s) =>
        getServiceStatus(s.status as unknown as Record<string, null>) ===
          "active" &&
        getTipe(s.tipeLayanan as unknown as Record<string, null>) === "tenang",
    ).length,
    layananAktifRapi: allServices.filter(
      (s) =>
        getServiceStatus(s.status as unknown as Record<string, null>) ===
          "active" &&
        getTipe(s.tipeLayanan as unknown as Record<string, null>) === "rapi",
    ).length,
    layananAktifFokus: allServices.filter(
      (s) =>
        getServiceStatus(s.status as unknown as Record<string, null>) ===
          "active" &&
        getTipe(s.tipeLayanan as unknown as Record<string, null>) === "fokus",
    ).length,
    layananAktifJaga: allServices.filter(
      (s) =>
        getServiceStatus(s.status as unknown as Record<string, null>) ===
          "active" &&
        getTipe(s.tipeLayanan as unknown as Record<string, null>) === "jaga",
    ).length,
    layananAktifEfisien: allServices.filter(
      (s) =>
        getServiceStatus(s.status as unknown as Record<string, null>) ===
          "active" &&
        getTipe(s.tipeLayanan as unknown as Record<string, null>) === "efisien",
    ).length,
  };

  // ─── Chart data helpers ───────────────────────────────────────────────────
  const userTimestamps = allUsers.map((u) => toMs(u.createdAt));
  const clientTimestamps = allClients.map((u) => toMs(u.createdAt));
  const partnerTimestamps = allPartners.map((p) => toMs(p.createdAt));
  const taskOnprogressTimestamps = allTasks
    .filter(
      (t) =>
        getTaskStatus(t.status as unknown as Record<string, null>) ===
        "onprogress",
    )
    .map((t) => toMs(t.createdAt));
  const taskSelesaiTimestamps = allTasks
    .filter(
      (t) =>
        getTaskStatus(t.status as unknown as Record<string, null>) ===
        "selesai",
    )
    .map((t) => toMs(t.createdAt));
  const layananAktifTimestamps = allServices
    .filter(
      (s) =>
        getServiceStatus(s.status as unknown as Record<string, null>) ===
        "active",
    )
    .map((s) => toMs(s.createdAt));

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">
              Dashboard Investor
            </p>
            <p className="text-xs text-slate-500">Asistenku</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadData()}
            data-ocid="investor.refresh_button"
            className="text-xs gap-1.5"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            data-ocid="investor.logout_button"
            className="text-xs gap-1.5 text-slate-600"
          >
            <LogOut size={13} />
            Keluar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Ringkasan Bisnis</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Data agregat real-time dari seluruh operasional Asistenku
          </p>
        </div>

        {/* Summary Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 10 }, (_, i) => `sk-${i}`).map((k) => (
              <div
                key={k}
                className="bg-white rounded-2xl border border-slate-100 p-5 h-44 animate-pulse"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100" />
                  <div className="flex-1">
                    <div className="h-3 bg-slate-100 rounded w-20 mb-1.5" />
                    <div className="h-6 bg-slate-100 rounded w-16" />
                  </div>
                </div>
                <div className="h-16 bg-slate-50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* 1. Total User */}
            <SummaryCard
              icon={<Users size={18} />}
              iconBg="bg-slate-100"
              iconColor="text-slate-600"
              label="Total User"
              value={summary.totalUser}
              chartData={buildChartData(userTimestamps, periods.totalUser!)}
              chartColor="#64748b"
              period={periods.totalUser!}
              onPeriodChange={(v) => setPeriod("totalUser", v)}
            />

            {/* 2. Total Client */}
            <SummaryCard
              icon={<UserCheck size={18} />}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              label="Total Client"
              value={summary.totalClient}
              chartData={buildChartData(clientTimestamps, periods.totalClient!)}
              chartColor="#3b82f6"
              period={periods.totalClient!}
              onPeriodChange={(v) => setPeriod("totalClient", v)}
            />

            {/* 3. Total Partner Aktif */}
            <SummaryCard
              icon={<Briefcase size={18} />}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              label="Total Partner Aktif"
              value={summary.totalPartner}
              chartData={buildChartData(
                partnerTimestamps,
                periods.totalPartner!,
              )}
              chartColor="#14b8a6"
              period={periods.totalPartner!}
              onPeriodChange={(v) => setPeriod("totalPartner", v)}
            />

            {/* 4. Task On Progress */}
            <SummaryCard
              icon={<Clock size={18} />}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              label="Task On Progress"
              value={summary.taskOnprogress}
              chartData={buildChartData(
                taskOnprogressTimestamps,
                periods.taskOnprogress!,
              )}
              chartColor="#f59e0b"
              period={periods.taskOnprogress!}
              onPeriodChange={(v) => setPeriod("taskOnprogress", v)}
            />

            {/* 5. Task Selesai */}
            <SummaryCard
              icon={<CheckCircle2 size={18} />}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              label="Task Selesai"
              value={summary.taskSelesai}
              chartData={buildChartData(
                taskSelesaiTimestamps,
                periods.taskSelesai!,
              )}
              chartColor="#10b981"
              period={periods.taskSelesai!}
              onPeriodChange={(v) => setPeriod("taskSelesai", v)}
            />

            {/* 6. GMV Total */}
            <SummaryCard
              icon={<TrendingUp size={18} />}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              label="GMV Total"
              value={formatRp(summary.gmvTotal)}
              chartData={buildGmvChartData(allServices, periods.gmvTotal!)}
              chartColor="#10b981"
              period={periods.gmvTotal!}
              onPeriodChange={(v) => setPeriod("gmvTotal", v)}
            />

            {/* 7. GMV per Tipe */}
            <SummaryCard
              icon={<BarChart2 size={18} />}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              label="GMV per Tipe"
              value={""}
              sub={
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold text-teal-600">TENANG</span>{" "}
                    {formatRp(summary.gmvTenang)}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold text-blue-600">RAPI</span>{" "}
                    {formatRp(summary.gmvRapi)}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold text-amber-600">FOKUS</span>{" "}
                    {formatRp(summary.gmvFokus)}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold text-purple-600">JAGA</span>{" "}
                    {formatRp(summary.gmvJaga)}
                  </p>
                </div>
              }
              chartData={buildGmvChartData(allServices, periods.gmvPerTipe!)}
              chartColor="#6366f1"
              period={periods.gmvPerTipe!}
              onPeriodChange={(v) => setPeriod("gmvPerTipe", v)}
            />

            {/* 8. Margin */}
            <SummaryCard
              icon={<DollarSign size={18} />}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              label="Margin"
              value={formatRp(summary.margin)}
              chartData={buildGmvChartData(allServices, periods.margin!)}
              chartColor="#a855f7"
              period={periods.margin!}
              onPeriodChange={(v) => setPeriod("margin", v)}
            />

            {/* 9. Layanan Aktif Total */}
            <SummaryCard
              icon={<Layers size={18} />}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              label="Layanan Aktif Total"
              value={summary.layananAktifTotal}
              chartData={buildChartData(
                layananAktifTimestamps,
                periods.layananAktifTotal!,
              )}
              chartColor="#14b8a6"
              period={periods.layananAktifTotal!}
              onPeriodChange={(v) => setPeriod("layananAktifTotal", v)}
            />

            {/* 10. Layanan Aktif per Tipe */}
            <SummaryCard
              icon={<Package size={18} />}
              iconBg="bg-slate-100"
              iconColor="text-slate-600"
              label="Layanan Aktif per Tipe"
              value={""}
              sub={
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold text-teal-600">TENANG</span>{" "}
                    {summary.layananAktifTenang}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold text-blue-600">RAPI</span>{" "}
                    {summary.layananAktifRapi}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold text-amber-600">FOKUS</span>{" "}
                    {summary.layananAktifFokus}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold text-purple-600">JAGA</span>{" "}
                    {summary.layananAktifJaga}
                  </p>
                </div>
              }
              chartData={buildChartData(
                layananAktifTimestamps,
                periods.layananAktifPerTipe!,
              )}
              chartColor="#64748b"
              period={periods.layananAktifPerTipe!}
              onPeriodChange={(v) => setPeriod("layananAktifPerTipe", v)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
