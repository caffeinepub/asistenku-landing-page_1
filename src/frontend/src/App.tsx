import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardAsistenmu from "./pages/DashboardAsistenmu";
import InternalPortal from "./pages/InternalPortal";

const WA_LINK = "https://wa.me/628817743613";

type ServiceCard = {
  icon: string;
  title: string;
  short: string;
  price: string;
  body: string;
  note: string;
};

const services: ServiceCard[] = [
  {
    icon: "🧘",
    title: "TENANG",
    short: "Untuk kebutuhan dasar yang tetap terkendali.",
    price: "Rp 3.500.000 untuk alokasi 22 Unit Layanan",
    body: "Paket ini cocok untuk kebutuhan operasional rutin yang perlu berjalan stabil tanpa Anda harus mengatur detail teknisnya. Struktur kerja disusun oleh Asistenmu dan dijalankan oleh Partner yang sesuai.",
    note: "Untuk kebutuhan dengan skala yang lebih besar, struktur layanan dapat dikurasi bersama Concierge kami.",
  },
  {
    icon: "🗂️",
    title: "RAPI",
    short: "Struktur kerja dan personal lebih tertata dan stabil.",
    price: "Rp 5.500.000 untuk alokasi 35 Unit Layanan",
    body: "Dirancang untuk bisnis yang mulai bertumbuh dan membutuhkan pengaturan prioritas serta kontrol revisi yang lebih rapi. Anda tidak mengelola orang — Anda menerima hasil yang sudah melalui struktur.",
    note: "Untuk kebutuhan yang lebih kompleks, alokasi unit dapat disesuaikan melalui Concierge.",
  },
  {
    icon: "🎯",
    title: "FOKUS",
    short: "Eksekusi lebih dalam dengan prioritas jelas.",
    price: "Rp 8.500.000 untuk alokasi 60 Unit Layanan",
    body: "Cocok untuk fase ekspansi, campaign, atau operasional dengan tingkat koordinasi tinggi. Beberapa Partner dapat bekerja paralel dalam struktur yang dikendalikan Asistenmu.",
    note: "Struktur layanan dapat dikurasi sesuai kebutuhan skala bisnis Anda.",
  },
  {
    icon: "🛡️",
    title: "JAGA",
    short: "Kontrol menyeluruh untuk tanggung jawab besar.",
    price: "Rp 12.000.000 untuk alokasi 80 Unit Layanan",
    body: "Untuk pemilik bisnis atau eksekutif yang membutuhkan stabilitas eksekusi tanpa kehilangan kendali strategis. Delegasi berjalan sistematis dengan monitoring terstruktur.",
    note: "Untuk kebutuhan skala besar dan lintas fungsi, struktur layanan disusun bersama Concierge.",
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
                        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
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
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-slate-300 text-slate-700 px-8 py-3 rounded-full font-semibold text-sm hover:border-slate-400 hover:bg-slate-50 transition-all"
            >
              Pelajari
            </a>
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  internalPortalRoute,
  dashboardAdminRoute,
  dashboardAsistenmuRoute,
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
