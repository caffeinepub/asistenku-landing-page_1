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
import ClaimAdminAs from "./pages/ClaimAdminAs";
import ClientLogin from "./pages/ClientLogin";
import ClientRegister from "./pages/ClientRegister";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardAsistenmu from "./pages/DashboardAsistenmu";
import DashboardClient from "./pages/DashboardClient";
import DashboardInvestor from "./pages/DashboardInvestor";
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
  sharing: string[];
  note: string;
};

const services: ServiceCard[] = [
  {
    icon: "🧘",
    title: "TENANG",
    short:
      "Menjaga hidup tetap berjalan tanpa harus mengurus semuanya sendiri.",
    price: "Mulai dari Rp. 3.500.000 untuk alokasi 22 unit layanan",
    body: "Paket ini dirancang untuk kebutuhan personal life dan personal work yang perlu berjalan rapi tanpa menyita perhatian Anda setiap hari.\n\nMulai dari pengaturan agenda, koordinasi aktivitas pribadi, hingga tugas-tugas digital yang mendukung keseharian Anda. Semua disusun oleh Asistenmu dan dijalankan oleh Partner yang sesuai.\n\nAnda tidak perlu mengelola orang. Anda hanya menerima hasil yang sudah terstruktur.",
    sharing: ["hingga 2 anggota keluarga"],
    note: "Jika kebutuhan Anda mulai melibatkan pekerjaan atau aktivitas bisnis, Concierge kami dapat membantu mengkurasi struktur layanan yang lebih tepat.",
  },
  {
    icon: "🗂️",
    title: "RAPI",
    short: "Ketika hidup pribadi dan pekerjaan mulai berjalan bersamaan.",
    price: "Mulai dari Rp. 5.500.000 untuk alokasi 20 Unit Layanan",
    body: "Dirancang untuk individu yang mulai menyeimbangkan personal life dan aktivitas bisnis atau usaha. Paket ini membantu menjaga prioritas tetap jelas tanpa membuat Anda terjebak dalam koordinasi operasional harian.\n\nAsistenmu menyusun struktur kerja, sementara Partner menjalankan eksekusi yang diperlukan.\n\nAnda tetap memegang kendali arah, tanpa harus mengatur detailnya.",
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
    price: "Mulai dari Rp. 8.500.000 untuk alokasi 40 Unit Layanan",
    body: "Paket ini cocok untuk fase ketika bisnis mulai berkembang dan membutuhkan dukungan operasional yang lebih luas.\n\nBeberapa Partner dapat bekerja secara paralel dalam struktur yang dikendalikan oleh Asistenmu, memungkinkan berbagai tugas dan proyek berjalan bersamaan tanpa membebani tim inti Anda.\n\nIni memberi ruang untuk menskalakan divisi dan aktivitas bisnis tanpa proses hiring tambahan.",
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
    price: "Mulai dari Rp. 12.000.000 untuk alokasi 60 Unit Layanan",
    body: "Dirancang untuk pemilik bisnis atau eksekutif yang sudah memiliki struktur kerja stabil namun membutuhkan kontrol dan konsistensi operasional yang lebih kuat.\n\nDelegasi berjalan sistematis melalui koordinasi Asistenmu, sementara Partner menjalankan berbagai fungsi yang dibutuhkan secara paralel.\n\nAnda tetap fokus pada keputusan strategis tanpa kehilangan visibilitas terhadap eksekusi.",
    sharing: [
      "hingga 2 anggota keluarga",
      "hingga 3 partner bisnis / manajemen",
    ],
    note: "Untuk kebutuhan lintas divisi atau skala yang lebih besar, Concierge kami dapat membantu menyusun struktur layanan yang paling efektif.",
  },
];

const steps = [
  "Buat task baru di Dashboard anda",
  "Asistenmu akan menyusun permintaan anda menjadi brief yang jelas dan terstruktur dan membuat estimasi unit layanan terpakai.",
  "Asistenmu akan mendelegasikan ke partner yang tepat dan sesuai dengan bidangnya.",
  "Semua hasil kerja partner melalui QA Asistenmu sebelum di review oleh anda.",
  "Selesaikan task oleh anda dan unit layanan akan terpotong otomatis.",
];

const targetUsers = [
  {
    label: "Founder startup / Executive",
    desc: "Fokus tumbuhkan bisnis, bukan urus operasional harian.",
    icon: "🚀",
  },
  {
    label: "Pemilik UMKM",
    desc: "Jalankan bisnis lebih rapi tanpa menambah karyawan.",
    icon: "🏪",
  },
  {
    label: "Content Creator",
    desc: "Kelola jadwal & kordinasi tanpa chaos.",
    icon: "🎬",
  },
  {
    label: "Individu Sibuk",
    desc: "Hidup pribadi tetap berjalan meski jadwal padat seperti mempunyai banyak personal Assistant.",
    icon: "⏰",
  },
];

const painPoints = [
  "Kerjaan kecil tapi makan waktu banyak",
  "Mau rekrut tapi ribet & mahal",
  "Task numpuk tapi gak ada yang handle",
  "Waktu habis buat hal operasional",
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
                Kerjaan operasional numpuk?{" "}
                <span className="text-teal-brand">Gak perlu rekrut tim.</span>
              </h1>
              <p className="text-lg text-slate-700 leading-relaxed font-semibold">
                Delegasikan ke Asistenku.
              </p>
              <p className="text-base text-slate-500 leading-relaxed">
                Kami bantu handle admin, riset, dan operasional harian—biar kamu
                fokus ke hal yang lebih penting.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={scrollToLayanan}
                  className="btn-teal px-7 py-3 rounded-full font-semibold text-sm shadow-soft"
                  data-ocid="hero.primary_button"
                >
                  Pilih Layanan
                </button>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-slate-300 text-slate-700 px-7 py-3 rounded-full font-semibold text-sm hover:border-slate-400 hover:bg-slate-50 transition-all"
                  data-ocid="hero.secondary_button"
                >
                  Ngobrol dulu →
                </a>
              </div>
            </div>

            {/* Right: Hero image with floating badge */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md lg:max-w-none">
                {/* Floating badge */}
                <div
                  className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg"
                  style={{ backgroundColor: "#0d9488" }}
                >
                  ✉️ Kirim tugas. Kami yang kerjakan.
                </div>
                <img
                  src="/assets/uploads/hero-new-1.png"
                  alt="Asistenku"
                  className="rounded-2xl shadow-card w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 1a: Bukan software ── */}
        <section className="py-10 border-y border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xl font-bold text-slate-900 mb-2">
              Bukan software. Bukan freelance random.
            </p>
            <p className="text-base text-teal-700 font-semibold mb-6">
              Ini layanan asisten bisnis berbasis sistem.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Kirim tugas kapan aja",
                "Kami assign ke partner yang siap kerja",
                "Progress bisa dipantau",
                "Hasil dikirim sesuai kebutuhan",
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-2 text-slate-700 text-sm font-medium"
                >
                  <span className="text-teal-500 font-bold">✔</span> {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 1b: Asistenku untuk siapa? ── */}
        <section className="py-12 lg:py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
              Asistenku untuk siapa?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {targetUsers.map((user) => (
                <div
                  key={user.label}
                  className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 flex flex-col gap-3"
                >
                  <span className="text-2xl">{user.icon}</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {user.label}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {user.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 1c: Pain points ── */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="rounded-2xl p-8"
              style={{
                boxShadow: "0 4px 24px 0 rgba(13,148,136,0.12)",
                border: "1px solid rgba(13,148,136,0.2)",
              }}
            >
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">
                Kalau kamu ngerasain ini…
              </h2>
              <div className="flex flex-col gap-4 mb-6">
                {painPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-teal-600 text-xs font-bold">×</span>
                    </span>
                    <p className="text-slate-700 text-base">{point}</p>
                  </div>
                ))}
              </div>
              <div
                className="rounded-xl px-5 py-4"
                style={{ backgroundColor: "rgba(13,148,136,0.08)" }}
              >
                <p className="text-teal-800 font-semibold text-base">
                  👉 Artinya kamu butuh delegasi, bukan nambah kerjaan
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: Bagaimana Cara Kerja Asistenku ── */}
        <section
          style={{ backgroundColor: "#0d9488" }}
          className="py-16 lg:py-20"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: text + steps */}
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-10">
                  Bagaimana Cara Kerja Asistenku
                </h2>
                <ol className="flex flex-col gap-5">
                  {steps.map((step, i) => (
                    <li key={step} className="flex items-start gap-4">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: "white", color: "#0d9488" }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-white text-base leading-relaxed pt-1">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              {/* Right: image */}
              <div className="flex justify-center lg:justify-end">
                <img
                  src="/assets/uploads/dashboard-client-baru-1.png"
                  alt="Dashboard Client Asistenku"
                  className="rounded-2xl shadow-card w-full max-w-md lg:max-w-none object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: Bayar Sesuai Pekerjaan ── */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Bayar Sesuai Pekerjaan, Bukan Gaji
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Setiap tugas dihitung berdasarkan unit kerja, jadi kamu hanya
                bayar sesuai yang dikerjakan
              </p>
            </div>

            {/* 4 steps */}
            <div className="grid sm:grid-cols-2 gap-5 mb-10">
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📦</span>
                  <span className="text-sm font-bold text-teal-700 uppercase tracking-wide">
                    Langkah 1
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">
                  Pilih Paket, Dapat Unit Layanan
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Kamu membayar paket untuk membeli unit layanan aktif yang siap
                  dipakai kapan pun kamu butuhkan.
                </p>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">💬</span>
                  <span className="text-sm font-bold text-teal-700 uppercase tracking-wide">
                    Langkah 2
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">
                  Sampaikan Kebutuhanmu
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Cukup buat task, pilih deadlinenya dan Asistenmu akan menyusun
                  brief, memilih partner untuk eksekusi pekerjaan, dan membuat
                  estimasi unit yang dibutuhkan sesuai dengan standar pasar.
                </p>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-sm font-bold text-teal-700 uppercase tracking-wide">
                    Langkah 3
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">
                  Unit dihitung, Kamu setujui
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Sebelum dikerjakan Asistenmu akan mengkonfirmasi Unit layanan
                  yang akan terpakai, Unit masih On Hold sampai pekerjaan benar
                  - benar selesai. Tidak ada angka yang muncul tiba - tiba tanpa
                  persetujuanmu.
                </p>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🎯</span>
                  <span className="text-sm font-bold text-teal-700 uppercase tracking-wide">
                    Langkah 4
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">
                  Hasil Masuk, Unit terpotong
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Setelah hasil di review kamu dan kamu puas dengan hasilnya
                  unit baru terpotong dari layanan kamu. Dashboard-mu terupdate
                  otomatis secara real-time.
                </p>
              </div>
            </div>

            {/* Image - smaller, centered */}
            <div className="flex justify-center mb-8">
              <img
                src="/assets/uploads/unit-konversi-1.png"
                alt="Konversi Unit Layanan"
                className="rounded-2xl shadow-soft max-w-md w-full object-cover"
              />
            </div>

            {/* Quote box */}
            <div
              className="rounded-2xl p-8 text-center"
              style={{ backgroundColor: "rgba(13,148,136,0.75)" }}
            >
              <p className="text-white font-bold text-xl mb-3">
                &ldquo;Kamu tidak perlu menghitung unit yang terpakai, Asistenmu
                yang menjaga&rdquo;
              </p>
              <p className="text-white/90 text-base leading-relaxed">
                Setiap unit ditetapkan secara adil berdasarkan kompleksitas task
                - bukan waktu jam kerja. Asistenmu memastikan kamu selalu
                mendapatkan nilai terbaik dari setiap unit.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: SERVICE CARDS ── */}
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
                    className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden"
                    data-ocid={`layanan.item.${idx + 1}`}
                  >
                    <div className="px-6 py-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">{service.icon}</span>
                        <div>
                          <p className="font-display font-bold text-slate-900 text-lg">
                            {service.title}
                          </p>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {service.short}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-teal-700 mb-3">
                        {service.price}
                      </p>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        onClick={() => toggleCard(idx)}
                        aria-expanded={isOpen}
                        data-ocid={`layanan.toggle.${idx + 1}`}
                      >
                        Lihat detail
                        {isOpen ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="px-6 pb-6 border-t border-slate-100">
                        <div className="mt-4 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                          {service.body}
                        </div>
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
                          data-ocid={`layanan.button.${idx + 1}`}
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

        {/* ── SECTION 4b: Founder Story + Stats horizontal ── */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Founder Story */}
              <div
                className="rounded-2xl p-7 flex flex-col gap-4"
                style={{
                  boxShadow: "0 4px 24px 0 rgba(13,148,136,0.15)",
                  border: "1px solid rgba(13,148,136,0.2)",
                }}
              >
                <h3 className="font-display font-bold text-slate-900 text-xl">
                  Founder Story
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Asistenku dibuat karena founder Asistenku melihat pain
                  persaingan harga yang tidak wajar di marketplace freelancer
                  dan juga adanya kesulitan dalam pemilihan dan verifikasi skill
                  freelancer sehingga sering timbul masalah antara freelancer
                  dan juga client. Maka dari itu founder Asistenku membentuk
                  sebuah sistem yang adil dan memudahkan bagi semua pihak agar
                  tidak ada perang harga dan juga kepastian bagi client dan juga
                  semua partner yang tergabung di Asistenku.
                </p>
              </div>

              {/* Counter stats - HORIZONTAL layout */}
              <div
                className="rounded-2xl p-7 flex items-center"
                style={{
                  boxShadow: "0 4px 24px 0 rgba(13,148,136,0.15)",
                  border: "1px solid rgba(13,148,136,0.2)",
                }}
              >
                <div className="grid grid-cols-3 w-full divide-x divide-teal-100">
                  {/* Stat 1 */}
                  <div className="flex flex-col items-center gap-2 px-3 text-center">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <span className="text-lg">🤝</span>
                    </div>
                    <p className="text-3xl font-extrabold text-teal-600 leading-none">
                      75+
                    </p>
                    <p className="text-xs text-slate-500 leading-snug">
                      Partner bergabung
                    </p>
                  </div>
                  {/* Stat 2 */}
                  <div className="flex flex-col items-center gap-2 px-3 text-center">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <span className="text-lg">💼</span>
                    </div>
                    <p className="text-3xl font-extrabold text-teal-600 leading-none">
                      50+
                    </p>
                    <p className="text-xs text-slate-500 leading-snug">
                      Jenis pekerjaan
                    </p>
                  </div>
                  {/* Stat 3 */}
                  <div className="flex flex-col items-center gap-2 px-3 text-center">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <span className="text-lg">⚡</span>
                    </div>
                    <p className="text-3xl font-extrabold text-teal-600 leading-none">
                      &lt;10 Mnt
                    </p>
                    <p className="text-xs text-slate-500 leading-snug">
                      Rata-rata respon brief
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA quote */}
              <div
                className="rounded-2xl p-7 flex flex-col justify-center"
                style={{
                  boxShadow: "0 4px 24px 0 rgba(13,148,136,0.15)",
                  border: "1px solid rgba(13,148,136,0.2)",
                }}
              >
                <p className="text-slate-700 text-base leading-relaxed italic">
                  &ldquo;Asistenku saat ini membuka akses terbatas untuk klien
                  perdana. Mulai dengan konsultasi gratis - tidak ada komitmen
                  sebelum kamu yakin.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: Penutup ── */}
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

const dashboardInvestorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard-investor",
  component: DashboardInvestor,
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
  dashboardInvestorRoute,
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
