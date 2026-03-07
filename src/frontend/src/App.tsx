import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ClaimAdminAs from "./pages/ClaimAdminAs";
import ClientLogin from "./pages/ClientLogin";
import ClientRegister from "./pages/ClientRegister";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardAsistenmu from "./pages/DashboardAsistenmu";
import DashboardClient from "./pages/DashboardClient";
import DashboardOperasional from "./pages/DashboardOperasional";
import DashboardPartner from "./pages/DashboardPartner";
import InternalPortal from "./pages/InternalPortal";
import NotFound from "./pages/NotFound";
import PortalPartner from "./pages/PortalPartner";
import TentangPartnerAsistenku from "./pages/TentangPartnerAsistenku";

const WA_LINK = "https://wa.me/628817743613";

type ServiceCard = {
  icon: string;
  title: string;
  short: string;
  price: string;
  body: string;
  body2?: string;
  sharing: string[];
  note: string;
};

const services: ServiceCard[] = [
  {
    icon: "🧘",
    title: "TENANG",
    short:
      "Menjaga hidup tetap berjalan tanpa harus mengurus semuanya sendiri.",
    price: "Mulai dari Rp 3.500.000 untuk alokasi 22 Unit Layanan",
    body: "Paket ini dirancang untuk kebutuhan personal life dan personal work yang perlu berjalan rapi tanpa menyita perhatian Anda setiap hari.",
    body2:
      "Mulai dari pengaturan agenda, koordinasi aktivitas pribadi, hingga tugas-tugas digital yang mendukung keseharian Anda. Semua disusun oleh Asistenmu dan dijalankan oleh Partner yang sesuai.\n\nAnda tidak perlu mengelola orang. Anda hanya menerima hasil yang sudah terstruktur.",
    sharing: ["hingga 2 anggota keluarga"],
    note: "Jika kebutuhan Anda mulai melibatkan pekerjaan atau aktivitas bisnis, Concierge kami dapat membantu mengkurasi struktur layanan yang lebih tepat.",
  },
  {
    icon: "🗂️",
    title: "RAPI",
    short: "Ketika hidup pribadi dan pekerjaan mulai berjalan bersamaan.",
    price: "Mulai dari Rp 5.500.000 untuk alokasi 20 Unit Layanan",
    body: "Dirancang untuk individu yang mulai menyeimbangkan personal life dan aktivitas bisnis atau usaha. Paket ini membantu menjaga prioritas tetap jelas tanpa membuat Anda terjebak dalam koordinasi operasional harian.",
    body2:
      "Asistenmu menyusun struktur kerja, sementara Partner menjalankan eksekusi yang diperlukan.\n\nAnda tetap memegang kendali arah, tanpa harus mengatur detailnya.",
    sharing: [
      "hingga 2 anggota keluarga",
      "hingga 1 partner bisnis / manajemen",
    ],
    note: "Untuk kebutuhan yang lebih kompleks atau lintas fungsi, struktur layanan dapat disesuaikan bersama Concierge kami.",
  },
  {
    icon: "🎯",
    title: "FOKUS",
    short: "Mengembangkan tim tanpa harus menambah karyawan baru.",
    price: "Mulai dari Rp 8.500.000 untuk alokasi 40 Unit Layanan",
    body: "Paket ini cocok untuk fase ketika bisnis mulai berkembang dan membutuhkan dukungan operasional yang lebih luas.",
    body2:
      "Beberapa Partner dapat bekerja secara paralel dalam struktur yang dikendalikan oleh Asistenmu, memungkinkan berbagai tugas dan proyek berjalan bersamaan tanpa membebani tim inti Anda.\n\nIni memberi ruang untuk menskalakan divisi dan aktivitas bisnis tanpa proses hiring tambahan.",
    sharing: [
      "hingga 2 anggota keluarga",
      "hingga 2 partner bisnis / manajemen",
    ],
    note: "Struktur layanan dapat dikurasi bersama Concierge untuk mendukung pertumbuhan bisnis Anda secara lebih strategis.",
  },
  {
    icon: "🛡️",
    title: "JAGA",
    short: "Stabilitas operasional untuk tanggung jawab yang lebih besar.",
    price: "Mulai dari Rp 12.000.000 untuk alokasi 60 Unit Layanan",
    body: "Dirancang untuk pemilik bisnis atau eksekutif yang sudah memiliki struktur kerja stabil namun membutuhkan kontrol dan konsistensi operasional yang lebih kuat.",
    body2:
      "Delegasi berjalan sistematis melalui koordinasi Asistenmu, sementara Partner menjalankan berbagai fungsi yang dibutuhkan secara paralel.\n\nAnda tetap fokus pada keputusan strategis tanpa kehilangan visibilitas terhadap eksekusi.",
    sharing: [
      "hingga 2 anggota keluarga",
      "hingga 3 partner bisnis / manajemen",
    ],
    note: "Untuk kebutuhan lintas divisi atau skala yang lebih besar, Concierge kami dapat membantu menyusun struktur layanan yang paling efektif.",
  },
];

const steps = [
  "Sampaikan kebutuhan Anda.",
  "Asistenmu menyusunnya menjadi brief yang jelas dan terstruktur.",
  "Partner yang tepat dipilih dan dikelola.",
  "Hasil diperiksa sebelum sampai ke Anda.",
];

function LandingPage() {
  const [openCard, setOpenCard] = useState<number | null>(null);

  function toggleCard(index: number) {
    setOpenCard((prev) => (prev === index ? null : index));
  }

  function scrollToLayanan() {
    document.getElementById("layanan")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* ── SECTION 1: HERO ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Kerja tetap berjalan.{" "}
                <span className="text-teal-brand">Hidup tetap tenang.</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Asistenku adalah sistem pendampingan dalam pengaturan delegasi
                tugas.
              </p>
              <p className="text-base text-slate-500 leading-relaxed">
                Kami menjaga setiap layanan agar tetap berjalan dengan kualitas
                terbaik.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={scrollToLayanan}
                  className="btn-teal px-7 py-3 rounded-full font-semibold text-sm shadow-soft"
                >
                  Pilih Layanan
                </button>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-slate-300 text-slate-700 px-7 py-3 rounded-full font-semibold text-sm hover:border-slate-400 hover:bg-slate-50 transition-all"
                >
                  Ngobrol dulu →
                </a>
              </div>
            </div>

            {/* Right: Hero image */}
            <div className="flex justify-center lg:justify-end">
              <img
                src="/assets/uploads/heroimagenew-3.png"
                alt="Asistenku"
                className="rounded-2xl shadow-card w-full max-w-md lg:max-w-none object-cover"
              />
            </div>
          </div>
        </section>

        {/* ── SECTION 2: Bagaimana Kami Mendampingi ── */}
        <section className="bg-slate-50 py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-10">
              Bagaimana Kami Mendampingi
            </h2>
            <ol className="flex flex-col gap-5 text-left max-w-xl mx-auto">
              {steps.map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="step-circle flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="text-slate-700 text-base leading-relaxed pt-1">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-10 text-slate-500 italic text-base leading-relaxed">
              Anda tidak lagi mengelola orang dan proses. Anda hanya mengelola
              keputusan.
            </p>
          </div>
        </section>

        {/* ── SECTION 3: Tepat Tanpa Kehilangan Waktu ── */}
        <section className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-10 lg:p-14">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-5">
                Tepat Tanpa Kehilangan Waktu
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                Kami menjaga ketepatan. Dalam kebutuhan mendesak, struktur kami
                memungkinkan pekerjaan dijalankan secara paralel tanpa
                kehilangan kontrol
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: Conversion Statement ── */}
        <section className="bg-dark-navy py-16 lg:py-20 text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="font-display text-2xl sm:text-3xl font-bold leading-snug mb-4">
              Konversi unit layanan tidak ditentukan secara sembarangan.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed">
              Anda tidak perlu menghitung, menegosiasikan, atau memikirkan angka
              di level eksekusi.
            </p>
          </div>
        </section>

        {/* ── SECTION 5: SERVICE CARDS ── */}
        <section id="layanan" className="py-16 lg:py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-10">
              Pilih Paket Layanan
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {services.map((service, idx) => {
                const isOpen = openCard === idx;
                return (
                  <div
                    key={service.title}
                    className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden transition-all"
                  >
                    {/* Card header — clickable accordion trigger */}
                    <button
                      type="button"
                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      onClick={() => toggleCard(idx)}
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{service.icon}</span>
                        <div>
                          <p className="font-display font-bold text-slate-900 text-lg">
                            {service.title}
                          </p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {service.short}
                          </p>
                        </div>
                      </div>
                      <span className="flex-shrink-0 text-slate-400">
                        {isOpen ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </span>
                    </button>

                    {/* Accordion content */}
                    {isOpen && (
                      <div className="px-6 pb-6 border-t border-slate-100">
                        <p className="mt-4 text-sm font-bold text-teal-price">
                          {service.price}
                        </p>
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                          {service.body}
                        </p>
                        {service.body2 && (
                          <div className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                            {service.body2}
                          </div>
                        )}
                        {service.sharing && service.sharing.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                              Sharing akses:
                            </p>
                            <ul className="flex flex-col gap-1">
                              {service.sharing.map((item) => (
                                <li
                                  key={item}
                                  className="text-sm text-slate-600 flex items-start gap-2"
                                >
                                  <span className="mt-1 text-slate-400">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="mt-4 text-sm text-slate-500 leading-relaxed">
                          {service.note}
                        </p>
                        <a
                          href={WA_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-teal mt-5 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full"
                        >
                          Hubungi Concierge Kami →
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 6: Join Team ── */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Ingin jadi bagian dari Tim Asistenku?
            </h2>
            <Link
              to="/tentang-partner-asistenku"
              className="inline-block border border-slate-300 text-slate-700 px-8 py-3 rounded-full font-semibold text-sm hover:border-slate-400 hover:bg-slate-50 transition-all"
            >
              Pelajari
            </Link>
          </div>
        </section>

        {/* ── SECTION 7: Penutup ── */}
        <section className="py-12 lg:py-16 bg-slate-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Kami menjaga setiap layanan agar tetap berjalan dengan kualitas
              terbaik.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Router setup
const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const internalPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portal-internal",
  component: InternalPortal,
});

const dashboardAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard-admin",
  component: DashboardAdmin,
});

const dashboardAsistenmuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard-asistenmu",
  component: DashboardAsistenmu,
});

const dashboardOperasionalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard-operasional",
  component: DashboardOperasional,
});

const clientLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/client-login",
  component: ClientLogin,
});

const clientRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/client-register",
  component: ClientRegister,
});

const portalPartnerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portal-partner",
  component: PortalPartner,
});

const dashboardClientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard-client",
  component: DashboardClient,
});

const dashboardPartnerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard-partner",
  component: DashboardPartner,
});

const claimAdminAsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/claim-admin-as",
  component: ClaimAdminAs,
});

const tentangPartnerAsistemuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tentang-partner-asistenku",
  component: TentangPartnerAsistenku,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  component: NotFound,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  internalPortalRoute,
  dashboardAdminRoute,
  dashboardAsistenmuRoute,
  dashboardOperasionalRoute,
  clientLoginRoute,
  clientRegisterRoute,
  portalPartnerRoute,
  dashboardClientRoute,
  dashboardPartnerRoute,
  claimAdminAsRoute,
  tentangPartnerAsistemuRoute,
  notFoundRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
