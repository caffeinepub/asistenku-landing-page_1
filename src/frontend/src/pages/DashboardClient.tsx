import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Loader2,
  LogOut,
  MessageCircle,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useRoleGuard } from "../hooks/useRoleGuard";

// ── Service Catalog (J01–J136, T01–T26) ──────────────────────────────────────
interface KatalogItem {
  id: string;
  seri: "J" | "T";
  kategori: string;
  nama: string;
  unitDasar: number;
  deskripsi: string;
}

const KATALOG_LAYANAN: KatalogItem[] = [
  // J-Series
  {
    id: "J01",
    seri: "J",
    kategori: "E-Comm",
    nama: "Rekap Pesanan Harian",
    unitDasar: 1,
    deskripsi:
      "Rekap harian penjualan dari Marketplace ke GSheets (Maks 50 pesanan/hari)",
  },
  {
    id: "J02",
    seri: "J",
    kategori: "E-Comm",
    nama: "Update Stok Ringan",
    unitDasar: 1,
    deskripsi: "Sinkronisasi stok (Maks 10 SKU) di 1 Marketplace",
  },
  {
    id: "J03",
    seri: "J",
    kategori: "Admin",
    nama: "Admin Chat (Short)",
    unitDasar: 1,
    deskripsi: "Balas chat rutin selama 1 jam (Non-komplain)",
  },
  {
    id: "J04",
    seri: "J",
    kategori: "Sosmed",
    nama: "Posting Feed/Story",
    unitDasar: 1,
    deskripsi:
      "Upload max 2 konten siap tayang ke sosial media (IG/FB/TikTok/Thread) / set scheduling post",
  },
  {
    id: "J05",
    seri: "J",
    kategori: "Admin",
    nama: "Data Entry Bisnis",
    unitDasar: 1,
    deskripsi: "Input data nota (Maks 30 entry per task)",
  },
  {
    id: "J06",
    seri: "J",
    kategori: "Writing",
    nama: "Caption Sosmed Dasar",
    unitDasar: 1,
    deskripsi: "Buat 3 caption pendek untuk posting harian",
  },
  {
    id: "J07",
    seri: "J",
    kategori: "Creative",
    nama: "Edit Foto Simple",
    unitDasar: 1,
    deskripsi: "Resize, hapus BG, atau tambah logo di foto",
  },
  {
    id: "J08",
    seri: "J",
    kategori: "Travel",
    nama: "Riset Perjalanan Dinas",
    unitDasar: 1,
    deskripsi: "Riset transportasi & hotel strategis dekat meeting",
  },
  {
    id: "J09",
    seri: "J",
    kategori: "Admin",
    nama: "File Management",
    unitDasar: 1,
    deskripsi:
      "Rapikan folder kerja di Drive/Dropbox. Maks 5 folder utama atau 100 file",
  },
  {
    id: "J10",
    seri: "J",
    kategori: "Writing",
    nama: "Proofreading Pendek",
    unitDasar: 1,
    deskripsi: "Cek typo dokumen (Maks 3 halaman)",
  },
  {
    id: "J11",
    seri: "J",
    kategori: "Admin",
    nama: "Penjadwalan Meeting",
    unitDasar: 1,
    deskripsi: "Koordinasi waktu pihak luar via WA/Email",
  },
  {
    id: "J12",
    seri: "J",
    kategori: "Digital",
    nama: "Link Bio Setup",
    unitDasar: 1,
    deskripsi: "Setup/update link di bio (S.id/Linktree)",
  },
  {
    id: "J13",
    seri: "J",
    kategori: "Admin",
    nama: "Rekap Absensi Tim",
    unitDasar: 1,
    deskripsi: "Rekap kehadiran tim (Maks 5 orang) per minggu",
  },
  {
    id: "J14",
    seri: "J",
    kategori: "Admin",
    nama: "Mystery Shopping",
    unitDasar: 1,
    deskripsi:
      "Cek respon chat toko sendiri (Anonim). Maks 5 skenario pertanyaan/interaksi",
  },
  {
    id: "J15",
    seri: "J",
    kategori: "Digital",
    nama: "Setup Google My Biz",
    unitDasar: 1,
    deskripsi: "Update jam operasional/foto di Maps",
  },
  {
    id: "J16",
    seri: "J",
    kategori: "Travel",
    nama: "Riset Tempat Meeting",
    unitDasar: 1,
    deskripsi: "Cari 3 opsi kafe/meeting room kondusif",
  },
  {
    id: "J17",
    seri: "J",
    kategori: "Sosmed",
    nama: "Repost Konten User",
    unitDasar: 1,
    deskripsi: "Bantu repost konten tag customer ke story",
  },
  {
    id: "J18",
    seri: "J",
    kategori: "Admin",
    nama: "Update Kalender",
    unitDasar: 1,
    deskripsi: "Input jadwal deadline ke Google Calendar",
  },
  {
    id: "J19",
    seri: "J",
    kategori: "Writing",
    nama: "Draft Email Internal",
    unitDasar: 1,
    deskripsi: "Buat draf pengumuman simpel untuk tim",
  },
  {
    id: "J20",
    seri: "J",
    kategori: "E-Comm",
    nama: "Cek Ongkir/Kurir",
    unitDasar: 1,
    deskripsi: "Bandingkan tarif kurir untuk kiriman besar",
  },
  {
    id: "J21",
    seri: "J",
    kategori: "Sosmed",
    nama: "Sortir Foto Konten",
    unitDasar: 1,
    deskripsi: "Pilih 10 foto terbaik dari dokumentasi",
  },
  {
    id: "J22",
    seri: "J",
    kategori: "Creative",
    nama: "Watermark Massal",
    unitDasar: 1,
    deskripsi: "Tempel logo di 20 foto produk/konten",
  },
  {
    id: "J23",
    seri: "J",
    kategori: "Digital",
    nama: "Katalog WA Dasar",
    unitDasar: 1,
    deskripsi: "Upload 5 foto produk ke WA Business",
  },
  {
    id: "J24",
    seri: "J",
    kategori: "Admin",
    nama: "Sortir Email Masuk",
    unitDasar: 1,
    deskripsi:
      "Hapus spam & tandai email penting owner. Pembersihan inbox harian (Maks 50 email baru)",
  },
  {
    id: "J25",
    seri: "J",
    kategori: "Travel",
    nama: "Riset Sewa Mobil",
    unitDasar: 1,
    deskripsi: "Cari kontak rental mobil di lokasi tujuan",
  },
  {
    id: "J26",
    seri: "J",
    kategori: "Sosmed",
    nama: "Share ke FB Group",
    unitDasar: 1,
    deskripsi: "Bagikan postingan IG ke 3 grup FB relevan",
  },
  {
    id: "J27",
    seri: "J",
    kategori: "Admin",
    nama: "Update Price List",
    unitDasar: 1,
    deskripsi: "Update harga di katalog PDF/foto menu",
  },
  {
    id: "J28",
    seri: "J",
    kategori: "Admin",
    nama: "Riset Domain Web",
    unitDasar: 1,
    deskripsi: "Cek ketersediaan nama domain web",
  },
  {
    id: "J29",
    seri: "J",
    kategori: "Writing",
    nama: "Bio Profile Singkat",
    unitDasar: 1,
    deskripsi: "Buat 1 paragraf perkenalan untuk sosmed",
  },
  {
    id: "J30",
    seri: "J",
    kategori: "Admin",
    nama: "Follow Up Tagihan",
    unitDasar: 1,
    deskripsi: "Kirim pesan reminder bayar ke 1 customer",
  },
  {
    id: "J31",
    seri: "J",
    kategori: "Strategic",
    nama: "Business Plan Draft",
    unitDasar: 10,
    deskripsi: "Penyusunan draf rencana bisnis & proyeksi laba rugi",
  },
  {
    id: "J32",
    seri: "J",
    kategori: "Legal",
    nama: "Pengurusan HAKI (DJKI)",
    unitDasar: 10,
    deskripsi: "Riset & pendaftaran merek ke DJKI",
  },
  {
    id: "J33",
    seri: "J",
    kategori: "Legal",
    nama: "Draf Perjanjian Kerja",
    unitDasar: 3,
    deskripsi: "Pembuatan kontrak kerja karyawan (PKWT/PKWTT)",
  },
  {
    id: "J34",
    seri: "J",
    kategori: "Strategic",
    nama: "Marketing Strategy",
    unitDasar: 10,
    deskripsi: "Riset pasar & strategi promosi 3-6 bulan",
  },
  {
    id: "J35",
    seri: "J",
    kategori: "Finance",
    nama: "Audit Keuangan Tahunan",
    unitDasar: 10,
    deskripsi: "Pemeriksaan mendalam arus kas & aset 1 tahun",
  },
  {
    id: "J36",
    seri: "J",
    kategori: "Management",
    nama: "Rekrutmen SDM",
    unitDasar: 9,
    deskripsi: "Skrining CV, interview, & rekomendasi kandidat",
  },
  {
    id: "J37",
    seri: "J",
    kategori: "Strategic",
    nama: "Pitch Deck Investor",
    unitDasar: 10,
    deskripsi: "Slide presentasi profesional untuk cari modal",
  },
  {
    id: "J38",
    seri: "J",
    kategori: "Legal",
    nama: "Pendirian PT Perorangan",
    unitDasar: 5,
    deskripsi: "Legalitas PT, NIB, Sertifikat, NPWP, Coretax ID",
  },
  {
    id: "J39",
    seri: "J",
    kategori: "Management",
    nama: "SOP Operasional",
    unitDasar: 10,
    deskripsi: "Pembuatan alur kerja tertulis untuk tim",
  },
  {
    id: "J40",
    seri: "J",
    kategori: "Strategic",
    nama: "Riset Ekspansi Pasar",
    unitDasar: 10,
    deskripsi: "Analisis potensi buka cabang di lokasi/kota baru",
  },
  {
    id: "J41",
    seri: "J",
    kategori: "Legal",
    nama: "Legal Audit Dokumen",
    unitDasar: 4,
    deskripsi: "Pemeriksaan kepatuhan dokumen hukum perusahaan",
  },
  {
    id: "J42",
    seri: "J",
    kategori: "Management",
    nama: "Krisis Management PR",
    unitDasar: 5,
    deskripsi: "Penanganan isu negatif/komplain viral di sosmed",
  },
  {
    id: "J43",
    seri: "J",
    kategori: "Finance",
    nama: "Perencanaan Pajak",
    unitDasar: 10,
    deskripsi: "Konsultasi efisiensi pajak badan/pribadi",
  },
  {
    id: "J44",
    seri: "J",
    kategori: "Strategic",
    nama: "Partnership Deal",
    unitDasar: 5,
    deskripsi: "Negosiasi awal & koordinasi kerjasama antar PT",
  },
  {
    id: "J45",
    seri: "J",
    kategori: "Management",
    nama: "Personal Branding CEO",
    unitDasar: 4,
    deskripsi: "Strategi konten & reputasi owner di LinkedIn",
  },
  {
    id: "J46",
    seri: "J",
    kategori: "IT",
    nama: "System Architecture",
    unitDasar: 20,
    deskripsi: "Perancangan database & alur teknis aplikasi/web",
  },
  {
    id: "J47",
    seri: "J",
    kategori: "IT",
    nama: "Security Audit",
    unitDasar: 15,
    deskripsi: "Pengetesan celah keamanan web/sistem",
  },
  {
    id: "J48",
    seri: "J",
    kategori: "Creative",
    nama: "High-End Video Ad",
    unitDasar: 25,
    deskripsi: "Editing iklan pro dengan motion graphics berat",
  },
  {
    id: "J49",
    seri: "J",
    kategori: "Creative",
    nama: "Brand Identity Guide",
    unitDasar: 15,
    deskripsi: "Pembuatan GSM lengkap untuk brand",
  },
  {
    id: "J50",
    seri: "J",
    kategori: "Strategic",
    nama: "Franchise Development",
    unitDasar: 20,
    deskripsi: "Paket kemitraan/waralaba sisi operasional",
  },
  {
    id: "J51",
    seri: "J",
    kategori: "Legal",
    nama: "Kontrak Vendor",
    unitDasar: 4,
    deskripsi: "Drafting MOU & Perjanjian kerjasama eksklusif",
  },
  {
    id: "J52",
    seri: "J",
    kategori: "Management",
    nama: "Talent Development",
    unitDasar: 10,
    deskripsi: "Penyusunan KPI & jalur karir internal tim",
  },
  {
    id: "J53",
    seri: "J",
    kategori: "Finance",
    nama: "Budgeting Tahunan",
    unitDasar: 15,
    deskripsi: "Penyusunan rencana anggaran pengeluaran PT",
  },
  {
    id: "J54",
    seri: "J",
    kategori: "IT",
    nama: "API Integration",
    unitDasar: 10,
    deskripsi: "Hubungkan sistem dengan Payment/Trip gateway",
  },
  {
    id: "J55",
    seri: "J",
    kategori: "Strategic",
    nama: "Analisis SWOT",
    unitDasar: 10,
    deskripsi: "Riset mendalam 5 kompetitor utama",
  },
  {
    id: "J56",
    seri: "J",
    kategori: "Management",
    nama: "Monitoring Tim Remote",
    unitDasar: 15,
    deskripsi: "Supervisi harian tim agar target tercapai",
  },
  {
    id: "J57",
    seri: "J",
    kategori: "Creative",
    nama: "UI/UX Design (Mobile)",
    unitDasar: 20,
    deskripsi: "Desain antarmuka aplikasi hingga prototype",
  },
  {
    id: "J58",
    seri: "J",
    kategori: "Writing",
    nama: "White Paper/E-Book",
    unitDasar: 15,
    deskripsi: "Penulisan mendalam materi edukasi industri",
  },
  {
    id: "J59",
    seri: "J",
    kategori: "Strategic",
    nama: "Exit Strategy/M&A",
    unitDasar: 30,
    deskripsi: "Persiapan dokumen akuisisi atau jual bisnis",
  },
  {
    id: "J60",
    seri: "J",
    kategori: "Management",
    nama: "Event Management Plan",
    unitDasar: 15,
    deskripsi: "Perencanaan detail acara besar (Product Launch)",
  },
  {
    id: "J61",
    seri: "J",
    kategori: "E-Comm",
    nama: "Input Produk (10 Item)",
    unitDasar: 1,
    deskripsi: "Upload produk ke 1 Marketplace",
  },
  {
    id: "J62",
    seri: "J",
    kategori: "E-Comm",
    nama: "Rekap Pesanan & Stok",
    unitDasar: 1,
    deskripsi: "Laporan penjualan harian/mingguan di Sheets",
  },
  {
    id: "J63",
    seri: "J",
    kategori: "E-Comm",
    nama: "Update Stok & Harga",
    unitDasar: 1,
    deskripsi: "Sinkronisasi stok/harga di maks 3 platform",
  },
  {
    id: "J64",
    seri: "J",
    kategori: "E-Comm",
    nama: "Setting Promo Toko",
    unitDasar: 1,
    deskripsi: "Setup Voucher, Flash Sale, atau Campaign",
  },
  {
    id: "J65",
    seri: "J",
    kategori: "E-Comm",
    nama: "Dekorasi Marketplace",
    unitDasar: 3,
    deskripsi: "Setup Banner, Kategori, & Layout Toko",
  },
  {
    id: "J66",
    seri: "J",
    kategori: "Admin",
    nama: "Admin Chat (Per Shift)",
    unitDasar: 2,
    deskripsi: "Balas chat pelanggan & bantu closing",
  },
  {
    id: "J67",
    seri: "J",
    kategori: "Admin",
    nama: "Komplain & Retur",
    unitDasar: 1,
    deskripsi: "Mediasi pembeli, kurir, & MP sampai selesai",
  },
  {
    id: "J68",
    seri: "J",
    kategori: "Admin",
    nama: "Riset Kompetitor",
    unitDasar: 2,
    deskripsi: "Cek harga & strategi promo 3 kompetitor",
  },
  {
    id: "J69",
    seri: "J",
    kategori: "Admin",
    nama: "Keyword Marketplace",
    unitDasar: 2,
    deskripsi: "Riset SEO Marketplace untuk visibilitas",
  },
  {
    id: "J70",
    seri: "J",
    kategori: "Admin",
    nama: "SKU & Barcode",
    unitDasar: 1,
    deskripsi: "Penataan kode stok unik (Maks 50 SKU)",
  },
  {
    id: "J71",
    seri: "J",
    kategori: "Admin",
    nama: "Dashboard Merchant",
    unitDasar: 2,
    deskripsi: "Upload foto & harga Grab/Gojek/ShopeeFood",
  },
  {
    id: "J72",
    seri: "J",
    kategori: "Admin",
    nama: "Manajemen Review",
    unitDasar: 1,
    deskripsi: "Balas ulasan pelanggan di semua platform",
  },
  {
    id: "J73",
    seri: "J",
    kategori: "Admin",
    nama: "Strategi Bundling",
    unitDasar: 2,
    deskripsi: "Buat skema promo paket hemat/harian",
  },
  {
    id: "J74",
    seri: "J",
    kategori: "Admin",
    nama: "Riset Supplier/Vendor",
    unitDasar: 1,
    deskripsi: "Cari & bandingkan 5 vendor sesuai spesifikasi",
  },
  {
    id: "J75",
    seri: "J",
    kategori: "Admin",
    nama: "Konversi File Bisnis",
    unitDasar: 1,
    deskripsi: "PDF ke Excel/Word (Maks 10 file/20 hal)",
  },
  {
    id: "J76",
    seri: "J",
    kategori: "Digital",
    nama: "Copywriting Caption",
    unitDasar: 1,
    deskripsi: "Pembuatan 5 Caption (Indo/Eng standar)",
  },
  {
    id: "J77",
    seri: "J",
    kategori: "Digital",
    nama: "Riset Hashtag",
    unitDasar: 1,
    deskripsi: "Kumpulan 30 Hashtag tertarget",
  },
  {
    id: "J78",
    seri: "J",
    kategori: "Digital",
    nama: "Audit Sosmed Bisnis",
    unitDasar: 2,
    deskripsi: "Laporan performa akun & saran perbaikan",
  },
  {
    id: "J79",
    seri: "J",
    kategori: "Digital",
    nama: "Admin Chat Sosmed",
    unitDasar: 2,
    deskripsi: "Fast response chat IG/WA Bisnis & closing",
  },
  {
    id: "J80",
    seri: "J",
    kategori: "Digital",
    nama: "Riset Tren Konten",
    unitDasar: 2,
    deskripsi: "Cari 3-5 ide konten viral yang relevan",
  },
  {
    id: "J81",
    seri: "J",
    kategori: "Creative",
    nama: "Design Feed IG",
    unitDasar: 1,
    deskripsi: "Design 1 Master Feed",
  },
  {
    id: "J82",
    seri: "J",
    kategori: "Creative",
    nama: "Design Story IG",
    unitDasar: 1,
    deskripsi: "Design 1 Story (Animasi/Interaksi)",
  },
  {
    id: "J83",
    seri: "J",
    kategori: "Creative",
    nama: "Design Banner",
    unitDasar: 1,
    deskripsi: "Design visual untuk cetak outdoor/indoor",
  },
  {
    id: "J84",
    seri: "J",
    kategori: "Creative",
    nama: "Design Logo Re-brand",
    unitDasar: 6,
    deskripsi: "Re-branding (Min 2 opsi konsep)",
  },
  {
    id: "J85",
    seri: "J",
    kategori: "Creative",
    nama: "Design Brosur Lipat",
    unitDasar: 2,
    deskripsi: "Layout 3 lipat bolak-balik",
  },
  {
    id: "J86",
    seri: "J",
    kategori: "Creative",
    nama: "Design Mockup Produk",
    unitDasar: 2,
    deskripsi: "Visualisasi produk 3D statis (Kemasan/Box)",
  },
  {
    id: "J87",
    seri: "J",
    kategori: "Creative",
    nama: "Katalog Produk (PDF)",
    unitDasar: 3,
    deskripsi: "Layouting & Kompilasi produk (Maks 10 hal)",
  },
  {
    id: "J88",
    seri: "J",
    kategori: "Creative",
    nama: "Edit Foto Produk",
    unitDasar: 1,
    deskripsi: "Hapus BG, retouch, & resize (Maks 5 foto)",
  },
  {
    id: "J89",
    seri: "J",
    kategori: "Creative",
    nama: "Design Kartu Nama",
    unitDasar: 1,
    deskripsi: "Design kartu nama bisnis siap cetak",
  },
  {
    id: "J90",
    seri: "J",
    kategori: "Creative",
    nama: "Design Company Profile",
    unitDasar: 4,
    deskripsi: "Layouting profil perusahaan (Maks 5 hal)",
  },
  {
    id: "J91",
    seri: "J",
    kategori: "Video",
    nama: "Editing Reels/TikTok",
    unitDasar: 1,
    deskripsi: "Potong video, musik, & subtitle (Maks 1 mnt)",
  },
  {
    id: "J92",
    seri: "J",
    kategori: "Video",
    nama: "Video Clipper (Raw)",
    unitDasar: 1,
    deskripsi: "Potong bagian video mentah tanpa efek berat",
  },
  {
    id: "J93",
    seri: "J",
    kategori: "Video",
    nama: "Subtitle Indonesia",
    unitDasar: 1,
    deskripsi: "Tambah subtitle video durasi maks 5 menit",
  },
  {
    id: "J94",
    seri: "J",
    kategori: "Video",
    nama: "YouTube to Artikel",
    unitDasar: 2,
    deskripsi: "Ringkas video YouTube (15m) jadi teks blog",
  },
  {
    id: "J95",
    seri: "J",
    kategori: "Writing",
    nama: "Artikel Blog SEO",
    unitDasar: 1,
    deskripsi: "Menulis artikel 800 kata + Riset Keyword",
  },
  {
    id: "J96",
    seri: "J",
    kategori: "Writing",
    nama: "Script Video/Reels",
    unitDasar: 1,
    deskripsi: "Naskah video promosi/edukasi 1 menit",
  },
  {
    id: "J97",
    seri: "J",
    kategori: "Writing",
    nama: "Ghostwriting Email",
    unitDasar: 1,
    deskripsi: "Draft email penawaran/kerjasama formal",
  },
  {
    id: "J98",
    seri: "J",
    kategori: "Writing",
    nama: "Proofreading Bisnis",
    unitDasar: 1,
    deskripsi: "Cek typo & tata bahasa (Maks 5 halaman)",
  },
  {
    id: "J99",
    seri: "J",
    kategori: "Writing",
    nama: "Copywriting LP",
    unitDasar: 2,
    deskripsi: "Menulis teks jualan untuk landing page",
  },
  {
    id: "J100",
    seri: "J",
    kategori: "Writing",
    nama: "Riset Nama Brand",
    unitDasar: 2,
    deskripsi: "Cari 5 opsi nama brand/tagline sesuai filosofi",
  },
  {
    id: "J101",
    seri: "J",
    kategori: "Web",
    nama: "Landing Page Premium",
    unitDasar: 10,
    deskripsi: "Setup Elementor + Copywriting & Integrasi",
  },
  {
    id: "J102",
    seri: "J",
    kategori: "Web",
    nama: "Additional Page",
    unitDasar: 2,
    deskripsi: "Tambah halaman baru dari template",
  },
  {
    id: "J103",
    seri: "J",
    kategori: "Web",
    nama: "Maintenance Web",
    unitDasar: 2,
    deskripsi: "Update plugin, backup, & cek link rusak",
  },
  {
    id: "J104",
    seri: "J",
    kategori: "Web",
    nama: "Setup Domain/Hosting",
    unitDasar: 2,
    deskripsi: "Integrasi NS/DNS ke provider",
  },
  {
    id: "J105",
    seri: "J",
    kategori: "Web",
    nama: "Install SSL",
    unitDasar: 1,
    deskripsi: "Aktivasi sertifikat keamanan di panel",
  },
  {
    id: "J106",
    seri: "J",
    kategori: "Web",
    nama: "Setup Email Bisnis",
    unitDasar: 2,
    deskripsi: "Konfigurasi Google Workspace/Titan Email",
  },
  {
    id: "J107",
    seri: "J",
    kategori: "Web",
    nama: "Optimasi Speed Web",
    unitDasar: 2,
    deskripsi: "Caching setup & optimasi gambar",
  },
  {
    id: "J108",
    seri: "J",
    kategori: "Web",
    nama: "Fix Error 404",
    unitDasar: 1,
    deskripsi: "Setup redirection 301 untuk link mati",
  },
  {
    id: "J109",
    seri: "J",
    kategori: "Web",
    nama: "GSC / Analytics",
    unitDasar: 2,
    deskripsi: "Pasang kode tracking & verifikasi GSC",
  },
  {
    id: "J110",
    seri: "J",
    kategori: "IT",
    nama: "Setup Linktree/Bio",
    unitDasar: 1,
    deskripsi: "Buat link menu di bio Instagram",
  },
  {
    id: "J111",
    seri: "J",
    kategori: "IT",
    nama: "Troubleshooting Dasar",
    unitDasar: 2,
    deskripsi: "Cek login, form error, atau integrasi API",
  },
  {
    id: "J112",
    seri: "J",
    kategori: "IT",
    nama: "Migrasi Konten",
    unitDasar: 3,
    deskripsi: "Pindahkan artikel/produk ke web baru",
  },
  {
    id: "J113",
    seri: "J",
    kategori: "Finance",
    nama: "Rekap Invoicing",
    unitDasar: 2,
    deskripsi: "Buat & kirim invoice (Maks 10 invoice)",
  },
  {
    id: "J114",
    seri: "J",
    kategori: "Finance",
    nama: "Laporan Laba Rugi",
    unitDasar: 3,
    deskripsi:
      "Rekap mutasi dari maks 2 rekening bank/e-wallet 1 bulan laporan",
  },
  {
    id: "J115",
    seri: "J",
    kategori: "Finance",
    nama: "Audit Nota/Kuitansi",
    unitDasar: 2,
    deskripsi: "Sortir & input bukti bayar (Maks 50 nota)",
  },
  {
    id: "J116",
    seri: "J",
    kategori: "Finance",
    nama: "Pengingat Piutang",
    unitDasar: 1,
    deskripsi: "Follow up tagihan via WA/Email formal",
  },
  {
    id: "J117",
    seri: "J",
    kategori: "Business",
    nama: "Riset Lokasi Bisnis",
    unitDasar: 3,
    deskripsi: "Info demografi & traffic di titik lokasi baru",
  },
  {
    id: "J118",
    seri: "J",
    kategori: "Business",
    nama: "Setup NIB (OSS)",
    unitDasar: 2,
    deskripsi: "Bantu proses pendaftaran NIB di OSS RBA",
  },
  {
    id: "J119",
    seri: "J",
    kategori: "Business",
    nama: "Draft Kontrak",
    unitDasar: 2,
    deskripsi: "Buat draf MOU/Perjanjian vendor/partner",
  },
  {
    id: "J120",
    seri: "J",
    kategori: "Business",
    nama: "Mystery Shopping",
    unitDasar: 2,
    deskripsi: "Cek kualitas layanan toko sendiri/kompetitor",
  },
  {
    id: "J121",
    seri: "J",
    kategori: "Admin",
    nama: "Sortir Database Klien",
    unitDasar: 2,
    deskripsi: "Rapikan kontak WA/Email ke GSheets",
  },
  {
    id: "J122",
    seri: "J",
    kategori: "Admin",
    nama: "Broadcast Promo",
    unitDasar: 1,
    deskripsi: "Kirim pesan blast (Maks 100 kontak)",
  },
  {
    id: "J123",
    seri: "J",
    kategori: "Creative",
    nama: "Re-Layout Feed IG",
    unitDasar: 2,
    deskripsi: "Atur komposisi grid IG agar estetik",
  },
  {
    id: "J124",
    seri: "J",
    kategori: "Creative",
    nama: "Design Voucher Fisik",
    unitDasar: 1,
    deskripsi: "Design kupon/voucher diskon siap cetak",
  },
  {
    id: "J125",
    seri: "J",
    kategori: "Digital",
    nama: "Setup Katalog WA",
    unitDasar: 1,
    deskripsi: "Upload produk & deskripsi ke WA Business",
  },
  {
    id: "J126",
    seri: "J",
    kategori: "Digital",
    nama: "Cek Backlink Web",
    unitDasar: 2,
    deskripsi: "Audit kualitas link yang mengarah ke web",
  },
  {
    id: "J127",
    seri: "J",
    kategori: "Writing",
    nama: "Deskripsi Produk (10)",
    unitDasar: 1,
    deskripsi: "Buat copywriting jualan deskripsi produk",
  },
  {
    id: "J128",
    seri: "J",
    kategori: "Writing",
    nama: "Artikel Press Release",
    unitDasar: 2,
    deskripsi: "Buat tulisan berita untuk media/portal",
  },
  {
    id: "J129",
    seri: "J",
    kategori: "Admin",
    nama: "Input Data Akuntansi",
    unitDasar: 2,
    deskripsi: "Pindahkan data nota ke Jurnal/Mekari",
  },
  {
    id: "J130",
    seri: "J",
    kategori: "Business",
    nama: "Setup Toko Cabang",
    unitDasar: 4,
    deskripsi: "Duplikasi produk & alamat di MP baru",
  },
  {
    id: "J131",
    seri: "J",
    kategori: "Admin",
    nama: "Arsip Digital Dokumen",
    unitDasar: 2,
    deskripsi: "Sortir & upload file ke Drive/Cloud",
  },
  {
    id: "J132",
    seri: "J",
    kategori: "Creative",
    nama: "Design Menu Digital",
    unitDasar: 2,
    deskripsi: "Desain menu (PDF/Image) resto/cafe",
  },
  {
    id: "J133",
    seri: "J",
    kategori: "Custom",
    nama: "Layanan Kustom / Lain-lain",
    unitDasar: 1,
    deskripsi:
      "Gunakan layanan ini jika kebutuhan tidak tertera di katalog. Admin akan review dan sesuaikan unit setelah detail dikonfirmasi",
  },
  {
    id: "J134",
    seri: "J",
    kategori: "Web",
    nama: "Optimisasi SEO Indexing dan Facebook Scrapping",
    unitDasar: 2,
    deskripsi: "Optimisasi SEO, indexing, dan Facebook scrapping per halaman",
  },
  {
    id: "J135",
    seri: "J",
    kategori: "Web",
    nama: "Perbaikan Facebook Scrapping & Indexing Google",
    unitDasar: 1,
    deskripsi: "Perbaikan Facebook Scrapping dan Indexing Google",
  },
  {
    id: "J136",
    seri: "J",
    kategori: "Business",
    nama: "Riset Izin Lingkungan",
    unitDasar: 1,
    deskripsi: "Prosedur izin warga/RT/RW untuk lokasi",
  },
  // T-Series
  {
    id: "T01",
    seri: "T",
    kategori: "Lifestyle",
    nama: "General Reservation",
    unitDasar: 1,
    deskripsi: "Booking resto, olahraga, dokter, salon",
  },
  {
    id: "T02",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Email Management",
    unitDasar: 1,
    deskripsi:
      "Rekap & balas email personal (Template) maksimal 10 email personal",
  },
  {
    id: "T03",
    seri: "T",
    kategori: "Travel",
    nama: "Riset Tiket & Hotel",
    unitDasar: 1,
    deskripsi: "Cari opsi tiket & hotel liburan keluarga",
  },
  {
    id: "T04",
    seri: "T",
    kategori: "Travel",
    nama: "Draft Itinerary",
    unitDasar: 1,
    deskripsi: "Susun jadwal harian wisata/kuliner",
  },
  {
    id: "T05",
    seri: "T",
    kategori: "Travel",
    nama: "Admin Travel & Visa",
    unitDasar: 2,
    deskripsi: "Cek syarat, isi form, & cari jadwal interview",
  },
  {
    id: "T06",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Management Tagihan",
    unitDasar: 1,
    deskripsi: "Pengingat tagihan rutin (Listrik, PBB, dll)",
  },
  {
    id: "T07",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Cari Tukang/Teknisi",
    unitDasar: 1,
    deskripsi:
      "Memberikan kontak & koordinasi jadwal 1 jenis teknisi (AC/Listrik) dengan 3 opsi",
  },
  {
    id: "T08",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Belanja & Makan Online",
    unitDasar: 1,
    deskripsi: "Pesan belanja/makan via Apps ke lokasi",
  },
  {
    id: "T09",
    seri: "T",
    kategori: "Branding",
    nama: "Draft Sambutan/Pidato",
    unitDasar: 1,
    deskripsi: "Draf sambutan formal acara keluarga/bisnis",
  },
  {
    id: "T10",
    seri: "T",
    kategori: "Branding",
    nama: "Materi Presentasi",
    unitDasar: 2,
    deskripsi: "Buat slide (PPT/Canva) pembicara tamu",
  },
  {
    id: "T11",
    seri: "T",
    kategori: "Branding",
    nama: "Video Profile Personal",
    unitDasar: 2,
    deskripsi: "Editing video aktivitas personal (Maks 2 menit)",
  },
  {
    id: "T12",
    seri: "T",
    kategori: "Branding",
    nama: "Admin Sosmed Pribadi",
    unitDasar: 2,
    deskripsi: "Posting foto pribadi/opini (Bukan jualan)",
  },
  {
    id: "T13",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Kurir Pribadi",
    unitDasar: 1,
    deskripsi: "Booking kurir kirim hampers/paket keluarga",
  },
  {
    id: "T14",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Riset Vendor Rumah",
    unitDasar: 1,
    deskripsi: "Perbandingan harga dari 3 vendor renovasi/dekor berbeda",
  },
  {
    id: "T15",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Rekap Pengeluaran RT",
    unitDasar: 1,
    deskripsi: "Catat pengeluaran harian/bulanan rumah",
  },
  {
    id: "T16",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Reminder Membership",
    unitDasar: 1,
    deskripsi: "Pengingat Gym, Netflix, atau asuransi",
  },
  {
    id: "T17",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Cari Info Les Anak",
    unitDasar: 1,
    deskripsi: "Riset 3 tempat les/ekskul terbaik anak",
  },
  {
    id: "T18",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Admin Chat Personal",
    unitDasar: 1,
    deskripsi: "Bantu balas chat selama 1 jam aktif atau rekap grup harian",
  },
  {
    id: "T19",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Riset Kado Eksklusif",
    unitDasar: 2,
    deskripsi: "Cari opsi kado luxury untuk relasi",
  },
  {
    id: "T20",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Pengingat Ibadah",
    unitDasar: 1,
    deskripsi: "Pengingat zakat, sumbangan, acara sosial",
  },
  {
    id: "T21",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Riset Hobi Khusus",
    unitDasar: 1,
    deskripsi: "Riset spek barang hobi (Sepeda/Kamera)",
  },
  {
    id: "T22",
    seri: "T",
    kategori: "Education",
    nama: "English for Kids",
    unitDasar: 1,
    deskripsi: "Sesi belajar/ngobrol Inggris anak (60 menit)",
  },
  {
    id: "T23",
    seri: "T",
    kategori: "Education",
    nama: "Beginner English",
    unitDasar: 1,
    deskripsi: "Praktek ngobrol Inggris Owner (Daily life)",
  },
  {
    id: "T24",
    seri: "T",
    kategori: "Education",
    nama: "Cari Beasiswa/Sekolah",
    unitDasar: 2,
    deskripsi: "Riset syarat masuk sekolah/beasiswa anak",
  },
  {
    id: "T25",
    seri: "T",
    kategori: "Lifestyle",
    nama: "Transkrip Catatan",
    unitDasar: 2,
    deskripsi: "Ketik ulang rekaman suara/catatan tangan durasi per jam",
  },
  {
    id: "T26",
    seri: "T",
    kategori: "Custom",
    nama: "Layanan Kustom / Lain-lain",
    unitDasar: 1,
    deskripsi:
      "Gunakan layanan ini jika kebutuhan tidak tertera di katalog. Admin akan review dan sesuaikan unit setelah detail dikonfirmasi",
  },
];

// ── Catalog helpers ──────────────────────────────────────────────────────────

function getKategoriBySeri(seri: "J" | "T" | "all"): string[] {
  const items =
    seri === "all"
      ? KATALOG_LAYANAN
      : KATALOG_LAYANAN.filter((i) => i.seri === seri);
  return [...new Set(items.map((i) => i.kategori))].sort();
}

function getJenisItems(
  seri: "J" | "T" | "all",
  kategori: string,
): KatalogItem[] {
  const items =
    seri === "all"
      ? KATALOG_LAYANAN
      : KATALOG_LAYANAN.filter((i) => i.seri === seri);
  return items.filter((i) => i.kategori === kategori);
}

// Fuzzy score: percentage of overlapping characters/words
function fuzzyScore(query: string, item: KatalogItem): number {
  if (!query.trim()) return 0;
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const haystack =
    `${item.id} ${item.nama} ${item.kategori} ${item.deskripsi}`.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return 0;
  let matched = 0;
  for (const w of words) {
    if (haystack.includes(w)) matched++;
  }
  // Also check character-level overlap for single-word queries
  let charScore = 0;
  for (const ch of q.replace(/\s/g, "")) {
    if (haystack.includes(ch)) charScore++;
  }
  const wordScore = (matched / words.length) * 100;
  const chScore = (charScore / Math.max(q.replace(/\s/g, "").length, 1)) * 50;
  return Math.max(wordScore, chScore);
}

function fuzzySearch(
  query: string,
  items: KatalogItem[],
): Array<{ item: KatalogItem; score: number }> {
  return items
    .map((item) => ({ item, score: fuzzyScore(query, item) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ── Unit calculator ──────────────────────────────────────────────────────────
function calculateUnits(itemId: string, volume: number): number {
  const rules: Record<string, number> = {
    J01: 50,
    J02: 10,
    J05: 30,
    J09: 100,
    J10: 3,
    J13: 5,
    J14: 5,
    J22: 20,
    J24: 50,
    J61: 10,
    J70: 50,
    J75: 10,
    J87: 10,
    J88: 5,
    J90: 5,
    J91: 1,
    J93: 5,
    J98: 5,
    J113: 10,
    J115: 50,
    J122: 100,
    T02: 10,
    T11: 2,
    T25: 1,
  };
  const cap = rules[itemId];
  if (!cap || volume <= 0) {
    const item = KATALOG_LAYANAN.find((i) => i.id === itemId);
    return item?.unitDasar ?? 1;
  }
  return Math.ceil(volume / cap);
}

// ── AI Helper questions per service ─────────────────────────────────────────
interface AIQuestion {
  text: string;
  volumeKey?: string; // which question answer contains volume info
}

function getQuestionsForService(item: KatalogItem): AIQuestion[] {
  const id = item.id;
  // Custom services
  if (id === "J133" || id === "T26") {
    return [
      { text: "Apa tujuan utama dari tugas ini?" },
      { text: "Apa saja langkah-langkah yang harus dilakukan tim kami?" },
      {
        text: "Berapa lama atau berapa banyak volume pekerjaannya?",
        volumeKey: "volume",
      },
    ];
  }
  // Volume-based services
  const volumeServices: Record<string, AIQuestion[]> = {
    J01: [
      {
        text: "Dari marketplace mana saja pesanan yang perlu direkap? (Tokopedia, Shopee, dll)",
      },
      {
        text: "Berapa estimasi jumlah pesanan per hari yang perlu direkap?",
        volumeKey: "volume",
      },
      {
        text: "Dalam format GSheets seperti apa output yang diinginkan? (kolom-kolom apa saja)",
      },
    ],
    J02: [
      { text: "Di marketplace mana sinkronisasi stok perlu dilakukan?" },
      {
        text: "Berapa jumlah SKU yang perlu disinkronisasi?",
        volumeKey: "volume",
      },
    ],
    J05: [
      {
        text: "Berapa jumlah entry data yang perlu diinput?",
        volumeKey: "volume",
      },
      { text: "Dari mana sumber datanya? (foto nota, file Excel, dll)" },
      { text: "Format output yang diinginkan di GSheets? (kolom apa saja)" },
    ],
    J13: [
      {
        text: "Berapa jumlah anggota tim yang perlu direkap absensinya?",
        volumeKey: "volume",
      },
      { text: "Dari mana data absensi diambil? (WA group, spreadsheet, dll)" },
    ],
    J22: [
      {
        text: "Berapa jumlah foto yang perlu diberi watermark?",
        volumeKey: "volume",
      },
      {
        text: "Bagaimana posisi watermark yang diinginkan? (pojok kanan bawah, tengah, dll)",
      },
    ],
    J24: [
      {
        text: "Berapa jumlah email baru yang perlu disortir?",
        volumeKey: "volume",
      },
      { text: "Kategori email apa saja yang perlu ditandai sebagai penting?" },
    ],
    J61: [
      { text: "Ke marketplace mana produk akan diupload?" },
      {
        text: "Berapa jumlah produk yang perlu diupload?",
        volumeKey: "volume",
      },
      { text: "Apakah konten produk (foto, deskripsi) sudah siap?" },
    ],
    J88: [
      { text: "Berapa jumlah foto yang perlu diedit?", volumeKey: "volume" },
      { text: "Edit apa saja yang dibutuhkan? (hapus BG, retouch, resize)" },
    ],
    J91: [
      {
        text: "Berapa durasi total video yang perlu diedit? (dalam menit)",
        volumeKey: "volume",
      },
      {
        text: "Platform tujuan video? (Instagram Reels, TikTok, YouTube Shorts)",
      },
      { text: "Apakah musik dan materi video sudah tersedia?" },
    ],
    J93: [
      {
        text: "Berapa durasi video yang perlu diberi subtitle? (dalam menit)",
        volumeKey: "volume",
      },
      { text: "Bahasa sumber video? (Indonesia/Inggris/dll)" },
    ],
    J98: [
      {
        text: "Berapa jumlah halaman dokumen yang perlu diperiksa?",
        volumeKey: "volume",
      },
      { text: "Jenis dokumen apa? (proposal, artikel, email, dll)" },
    ],
    J113: [
      { text: "Berapa jumlah invoice yang perlu dibuat?", volumeKey: "volume" },
      {
        text: "Data apa saja yang perlu ada di invoice? (nama klien, item, dll)",
      },
    ],
    J115: [
      {
        text: "Berapa jumlah nota/kuitansi yang perlu diaudit?",
        volumeKey: "volume",
      },
      { text: "Dari periode mana nota-nota tersebut? (bulan/tahun)" },
    ],
    J122: [
      {
        text: "Berapa jumlah kontak yang akan menerima broadcast?",
        volumeKey: "volume",
      },
      {
        text: "Konten pesan apa yang ingin dikirim? (sudah siap atau perlu dibuat?)",
      },
    ],
    T25: [
      {
        text: "Berapa jam durasi rekaman atau halaman tulisan tangan yang perlu ditranskrip?",
        volumeKey: "volume",
      },
      { text: "Bahasa rekaman/tulisan? (Indonesia/Inggris/dll)" },
    ],
  };
  if (volumeServices[id]) return volumeServices[id];

  // Service-specific questions
  const specificQuestions: Record<string, AIQuestion[]> = {
    J04: [
      { text: "Platform mana saja yang akan digunakan? (IG/FB/TikTok/Thread)" },
      { text: "Kapan jadwal postingnya? (tanggal/jam)" },
      { text: "Apakah materi konten sudah siap atau perlu disiapkan?" },
    ],
    J84: [
      { text: "Apa industri/bidang bisnis Anda?" },
      { text: "Warna apa yang ingin digunakan atau dihindari?" },
      { text: "Gaya desain yang disukai? (modern, klasik, minimalis, dll)" },
      { text: "Adakah referensi logo yang Anda sukai?" },
    ],
    J08: [
      { text: "Kota/lokasi tujuan perjalanan dinas?" },
      { text: "Tanggal dan durasi perjalanan?" },
      { text: "Preferensi transportasi dan hotel? (budget/bintang berapa)" },
    ],
    J10: [
      {
        text: "Berapa halaman dokumen yang perlu di-proofread?",
        volumeKey: "volume",
      },
      { text: "Jenis dokumen? (proposal, artikel, email resmi)" },
    ],
    J14: [
      {
        text: "Berapa skenario pertanyaan/interaksi yang ingin dicek?",
        volumeKey: "volume",
      },
      { text: "Platform toko mana yang ingin dicek? (Tokopedia/Shopee/WA)" },
    ],
    J36: [
      { text: "Posisi apa yang sedang dibuka?" },
      { text: "Kualifikasi utama yang dicari?" },
      { text: "Berapa kandidat yang diharapkan masuk shortlist?" },
    ],
    J39: [
      { text: "Untuk divisi/proses bisnis apa SOP ini dibuat?" },
      {
        text: "Apakah sudah ada alur kerja yang berjalan saat ini, atau perlu dirancang dari awal?",
      },
    ],
  };
  if (specificQuestions[id]) return specificQuestions[id];

  // Generic questions for all other services
  return [
    {
      text: `Bisa ceritakan lebih detail kebutuhan Anda untuk layanan ${item.nama}?`,
    },
    { text: "Apakah ada target waktu penyelesaian khusus?" },
    { text: "Ada informasi tambahan yang penting untuk kami ketahui?" },
  ];
}

// ── Chat message type ────────────────────────────────────────────────────────
interface ChatMessage {
  role: "ai" | "user";
  content: string;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Client {
  idUser: string;
  clientDisplayId?: string;
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

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  const raw = Number(ts);
  const ms = raw > 1e15 ? raw / 1_000_000 : raw;
  return new Date(ms).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function clientTaskStatusLabel(status: string): string {
  if (status === "ditolak") return "Sedang Didelegasikan Asistenmu";
  const map: Record<string, string> = {
    permintaanbaru: "Permintaan Baru",
    onprogress: "On Progress",
    reviewclient: "Butuh Review Kamu",
    qaasistenmu: "QA Asistenmu",
    revisi: "Dalam Revisi",
    selesai: "Selesai",
  };
  return map[status] ?? status;
}

function clientTaskStatusBadgeClass(status: string): string {
  if (status === "ditolak") return "bg-blue-50 text-blue-700 border-blue-200";
  const map: Record<string, string> = {
    permintaanbaru: "bg-orange-50 text-orange-700 border-orange-200",
    onprogress: "bg-blue-50 text-blue-700 border-blue-200",
    reviewclient: "bg-amber-50 text-amber-700 border-amber-200",
    qaasistenmu: "bg-purple-50 text-purple-700 border-purple-200",
    revisi: "bg-red-50 text-red-700 border-red-200",
    selesai: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return map[status] ?? "bg-slate-50 text-slate-700 border-slate-200";
}

// ── Pagination ────────────────────────────────────────────────────────────────
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
}: { page: number; totalPages: number; setPage: (p: number) => void }) {
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

// ── CollapsibleCard ───────────────────────────────────────────────────────────
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

// ── TaskSubSection ────────────────────────────────────────────────────────────
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

// ── SummaryCounter ────────────────────────────────────────────────────────────
function SummaryCounter({
  label,
  value,
  accent,
}: { label: string; value: number; accent: string }) {
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

// ── AIHelperChat ─────────────────────────────────────────────────────────────
interface AIHelperChatProps {
  selectedItem: KatalogItem;
  onSummaryComplete: (detail: string, units: number) => void;
}

function AIHelperChat({ selectedItem, onSummaryComplete }: AIHelperChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isCustom = selectedItem.id === "J133" || selectedItem.id === "T26";
  const questions = getQuestionsForService(selectedItem);

  // Initialize with first greeting + question
  useEffect(() => {
    const qs = getQuestionsForService(selectedItem);
    const greeting = `Halo! Saya siap membantu Anda dengan layanan **${selectedItem.nama}** (${selectedItem.id}). Mari saya bantu menyiapkan detail task Anda. 😊\n\n${qs[0].text}`;
    setMessages([{ role: "ai", content: greeting }]);
    setCurrentQ(0);
    setAnswers([]);
    setIsComplete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  function handleSend() {
    if (!userInput.trim()) return;
    const newAnswers = [...answers, userInput.trim()];
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userInput.trim() },
    ];
    setAnswers(newAnswers);
    setUserInput("");

    const nextQ = currentQ + 1;
    if (nextQ < questions.length) {
      // Clarification check: very short answers
      if (userInput.trim().length < 3) {
        newMessages.push({
          role: "ai",
          content:
            "Boleh saya tanya lebih lanjut, bisa Anda jelaskan lebih detail?",
        });
        setMessages(newMessages);
        return;
      }
      newMessages.push({ role: "ai", content: questions[nextQ].text });
      setMessages(newMessages);
      setCurrentQ(nextQ);
    } else {
      // All questions answered - generate summary
      const volumeIdx = questions.findIndex((q) => q.volumeKey === "volume");
      let volumeNum = 0;
      if (volumeIdx >= 0 && newAnswers[volumeIdx]) {
        const numMatch = newAnswers[volumeIdx].match(/\d+/);
        if (numMatch) volumeNum = Number.parseInt(numMatch[0], 10);
      }
      const estimasiUnit = calculateUnits(selectedItem.id, volumeNum);

      const summary = buildSummary(
        selectedItem,
        questions,
        newAnswers,
        estimasiUnit,
        isCustom,
      );
      const aiMsg = `Terima kasih! Berikut rangkuman task Anda:\n\n${summary}${isCustom ? "\n\n⚠️ *Tugas ini akan direview manual oleh admin untuk penentuan unit final. Estimasi unit yang ditampilkan bersifat sementara.*" : ""}`;
      newMessages.push({ role: "ai", content: aiMsg });
      setMessages(newMessages);
      setIsComplete(true);
      onSummaryComplete(summary, estimasiUnit);
    }
  }

  return (
    <div className="flex flex-col gap-0 border border-teal-200 rounded-xl overflow-hidden bg-white">
      <div className="bg-teal-600 px-4 py-2.5 flex items-center gap-2">
        <Sparkles size={14} className="text-teal-100" />
        <span className="text-sm font-semibold text-white">
          AI Helper — {selectedItem.nama}
        </span>
      </div>
      {/* Chat area */}
      <div className="flex flex-col gap-2.5 px-4 py-3 max-h-64 overflow-y-auto bg-slate-50">
        {messages.map((msg, i) => (
          <div
            key={`msg-${i}-${msg.role}`}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${msg.role === "ai" ? "bg-white border border-teal-100 text-slate-700" : "bg-teal-600 text-white"}`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {/* Input */}
      {!isComplete && (
        <div className="flex gap-2 px-3 py-2.5 border-t border-teal-100 bg-white">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ketik jawaban Anda..."
            className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-slate-50"
            data-ocid="ai-chat-input"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!userInput.trim()}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-lg px-3 py-2 transition-colors flex items-center gap-1"
            data-ocid="ai-chat-send"
          >
            <Send size={13} />
          </button>
        </div>
      )}
      {isComplete && (
        <div className="px-3 py-2 bg-emerald-50 border-t border-emerald-100 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
          <Sparkles size={12} />
          Rangkuman AI sudah diisi di field Detail Task. Anda bisa mengeditnya.
        </div>
      )}
    </div>
  );
}

function buildSummary(
  item: KatalogItem,
  questions: AIQuestion[],
  answers: string[],
  estimasiUnit: number,
  isCustom: boolean,
): string {
  const detailLines = questions
    .map((q, i) => `• ${q.text.replace(/\?$/, "")}: ${answers[i] ?? "-"}`)
    .join("\n");
  const volumeIdx = questions.findIndex((q) => q.volumeKey === "volume");
  const volumeInfo =
    volumeIdx >= 0 ? `\nVolume/Jumlah: ${answers[volumeIdx] ?? "-"}` : "";
  return `Kode Layanan: ${item.id}
Nama Layanan: ${item.nama}
Kategori: ${item.kategori}
Detail Pekerjaan:
${detailLines}${volumeInfo}
Estimasi Unit Terpakai: ${estimasiUnit}${isCustom ? " (sementara, menunggu review admin)" : ""}
Catatan Tambahan: -`;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardClient() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();
  const { isChecking } = useRoleGuard("client");

  const principalId = identity?.getPrincipal().toString() ?? "";
  const isActorReady = !!actor && !isActorFetching;

  // ── Data state ────────────────────────────────────────────────────────────
  const [clientData, setClientData] = useState<Client | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Task action state ─────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [revisiNotes, setRevisiNotes] = useState<Record<string, string>>({});
  const [showRevisiInput, setShowRevisiInput] = useState<
    Record<string, boolean>
  >({});
  const [confirmSelesai, setConfirmSelesai] = useState<string | null>(null);

  // ── New Task Modal: base state ────────────────────────────────────────────
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Step 1: Judul
  const [newTaskJudul, setNewTaskJudul] = useState("");
  // Step 2: Tipe Layanan — serviceId of the selected active service
  const [selectedServiceId, setSelectedServiceId] = useState("");
  // Step 3: Kategori
  const [selectedKategori, setSelectedKategori] = useState("");
  // Step 4: Jenis Pekerjaan (fuzzy search)
  const [jenisSearch, setJenisSearch] = useState("");
  const [selectedJenisItem, setSelectedJenisItem] =
    useState<KatalogItem | null>(null);
  const [showJenisList, setShowJenisList] = useState(false);
  const [jenisLowScore, setJenisLowScore] = useState(false);
  // Step 5: AI Helper
  const [aiSummaryComplete, setAiSummaryComplete] = useState(false);
  // Step 6: Detail Task
  const [newTaskDetail, setNewTaskDetail] = useState("");
  // Step 7: Estimasi Unit
  const [estimasiUnit, setEstimasiUnit] = useState(0);
  // Step 8: Deadline
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  // Derived: which seri to use based on selected service
  const selectedService = services.find(
    (s) => s.idService === selectedServiceId,
  );
  const activeTipe = selectedService ? getTipeLayanan(selectedService) : "";
  // tenang = T only; all others = J + T
  const allowedSeri: "J" | "T" | "all" = activeTipe === "tenang" ? "T" : "all";
  const availableKategori = getKategoriBySeri(allowedSeri);

  // Jenis items filtered by kategori & seri
  const jenisItemsForKategori = selectedKategori
    ? getJenisItems(allowedSeri, selectedKategori)
    : [];
  const jenisSearchResults = jenisSearch.trim()
    ? fuzzySearch(jenisSearch, jenisItemsForKategori)
    : jenisItemsForKategori.map((item) => ({ item, score: 100 }));
  const topScore = jenisSearchResults[0]?.score ?? 0;

  // Reset downstream fields when upstream changes
  function resetFromTipe() {
    setSelectedKategori("");
    setJenisSearch("");
    setSelectedJenisItem(null);
    setShowJenisList(false);
    setJenisLowScore(false);
    setAiSummaryComplete(false);
    setNewTaskDetail("");
    setEstimasiUnit(0);
  }
  function resetFromKategori() {
    setJenisSearch("");
    setSelectedJenisItem(null);
    setShowJenisList(false);
    setJenisLowScore(false);
    setAiSummaryComplete(false);
    setNewTaskDetail("");
    setEstimasiUnit(0);
  }
  function resetFromJenis() {
    setAiSummaryComplete(false);
    setNewTaskDetail("");
    setEstimasiUnit(0);
  }

  function closeModal() {
    setIsNewTaskOpen(false);
    setNewTaskJudul("");
    setSelectedServiceId("");
    setSelectedKategori("");
    setJenisSearch("");
    setSelectedJenisItem(null);
    setShowJenisList(false);
    setJenisLowScore(false);
    setAiSummaryComplete(false);
    setNewTaskDetail("");
    setEstimasiUnit(0);
    setNewTaskDeadline("");
  }

  const fetchData = useCallback(async () => {
    if (!actor || !principalId) return;
    setIsLoading(true);
    try {
      const act = actor as unknown as Record<
        string,
        (...args: unknown[]) => Promise<unknown>
      >;
      const [clientProfileRaw, myTasks, svcRaw] = await Promise.all([
        (act.getMyClientProfile() as Promise<Client | Client[] | null>).catch(
          () => null,
        ),
        (act.getMyTasksAsClient() as Promise<Task[]>).catch(() => [] as Task[]),
        (act.getMyServicesAsClient() as Promise<Service[]>).catch(
          () => [] as Service[],
        ),
      ]);
      let me: Client | null = null;
      if (Array.isArray(clientProfileRaw)) {
        me = (clientProfileRaw[0] as Client) ?? null;
      } else {
        me = clientProfileRaw as Client | null;
      }
      setClientData(me);
      setTasks(myTasks as Task[]);
      const myServices = (svcRaw as Service[]).filter(
        (s) => getServiceStatus(s).toLowerCase() === "active",
      );
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

  // ── Create task ───────────────────────────────────────────────────────────
  async function handleCreateTask() {
    if (
      !newTaskJudul.trim() ||
      !selectedServiceId ||
      !selectedJenisItem ||
      !newTaskDetail.trim() ||
      !newTaskDeadline ||
      !aiSummaryComplete
    ) {
      toast.error(
        "Lengkapi semua field yang diperlukan dan selesaikan AI Helper.",
      );
      return;
    }
    if (!clientData) {
      toast.error("Data profil client tidak ditemukan.");
      return;
    }
    const svc = services.find((s) => s.idService === selectedServiceId);
    if (!svc) {
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
        svc.idService,
        clientData.principalId || principalId,
        clientData.nama,
        svc.asistenmuPrincipalId,
        svc.asistenmuNama,
      );
      toast.success("Task berhasil dibuat dan dikirim ke Asistenmu.");
      closeModal();
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat task.";
      toast.error(msg);
    } finally {
      setIsCreatingTask(false);
    }
  }

  // ── Derived task lists ────────────────────────────────────────────────────
  const reviewTasks = tasks.filter((t) => getTaskStatus(t) === "reviewclient");
  const onProgressTasks = tasks.filter(
    (t) => getTaskStatus(t) === "onprogress",
  );
  const revisiTasks = tasks.filter((t) => getTaskStatus(t) === "revisi");
  const selesaiTasks = tasks.filter((t) => getTaskStatus(t) === "selesai");
  const allTasks = tasks;

  const pagReview = usePagination(reviewTasks);
  const pagProgress = usePagination(onProgressTasks);
  const pagRevisi = usePagination(revisiTasks);
  const pagSelesai = usePagination(selesaiTasks);
  const pagDibuat = usePagination(allTasks);

  function getOnHoldUnits(serviceId: string): bigint {
    return tasks
      .filter(
        (t) => t.serviceId === serviceId && getTaskStatus(t) === "onprogress",
      )
      .reduce((acc, t) => acc + t.unitLayanan, 0n);
  }

  // Submit enabled check
  const canSubmit = !!(
    newTaskJudul.trim() &&
    selectedServiceId &&
    selectedKategori &&
    selectedJenisItem &&
    aiSummaryComplete &&
    newTaskDetail.trim() &&
    newTaskDeadline
  );

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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void fetchData()}
              disabled={isLoading}
              className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 px-3 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw
                size={15}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <LogOut size={15} />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-5">
          {/* ── Greeting ── */}
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

          {/* ── Profil ── */}
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
                  <dd className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded select-all">
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

          {/* ── Layanan ── */}
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

          {/* ── Summary Task ── */}
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

          {/* ── Task Manajemen ── */}
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
                data-ocid="new-task-btn"
              >
                <Plus size={14} />
                Buat Task Baru
              </Button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {/* Task Butuh Review */}
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
                          {task.linkGdriveClient && (
                            <a
                              href={task.linkGdriveClient}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 w-fit"
                            >
                              <FolderOpen size={12} />
                              GDrive Client
                              <ExternalLink size={10} />
                            </a>
                          )}
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
                                        await act.updateTaskStatusAsClient(
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

              {/* Task On Progress */}
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

              {/* Task Dalam Revisi */}
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

              {/* Task Selesai */}
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

              {/* Task Dibuat */}
              <TaskSubSection
                title="Task Dibuat"
                count={allTasks.length}
                accent="bg-slate-100 text-slate-700"
              >
                {allTasks.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    Belum ada task yang dibuat.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col divide-y divide-slate-100">
                      {pagDibuat.paged.map((task) => {
                        const statusKey = getTaskStatus(task);
                        return (
                          <div
                            key={task.idTask}
                            className="py-4 flex flex-col gap-1.5"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-slate-400">
                                {task.idTask}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${clientTaskStatusBadgeClass(statusKey)}`}
                              >
                                {clientTaskStatusLabel(statusKey)}
                              </span>
                            </div>
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
                              {task.asistenmuNama && (
                                <span>
                                  Asistenmu:{" "}
                                  <span className="text-slate-600">
                                    {task.asistenmuNama}
                                  </span>
                                </span>
                              )}
                              <span>
                                Dibuat:{" "}
                                <span className="text-slate-600">
                                  {formatDate(task.createdAt)}
                                </span>
                              </span>
                              {task.deadline > 0n && (
                                <span>
                                  Deadline:{" "}
                                  <span className="text-slate-600">
                                    {formatDate(task.deadline)}
                                  </span>
                                </span>
                              )}
                              {task.unitLayanan > 0n && (
                                <span>
                                  Unit:{" "}
                                  <span className="text-slate-600">
                                    {String(task.unitLayanan)}
                                  </span>
                                </span>
                              )}
                            </div>
                            {statusKey === "permintaanbaru" &&
                              task.partnerId === "" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={
                                    actionLoading[`cancel-${task.idTask}`]
                                  }
                                  onClick={() =>
                                    runAction(
                                      `cancel-${task.idTask}`,
                                      async () => {
                                        const act = actor as unknown as Record<
                                          string,
                                          (...args: unknown[]) => Promise<void>
                                        >;
                                        await act.cancelTask(task.idTask);
                                      },
                                      `Task ${task.idTask} dibatalkan.`,
                                    )
                                  }
                                  className="text-xs border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full w-fit mt-1"
                                >
                                  {actionLoading[`cancel-${task.idTask}`] ? (
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <>
                                      <XCircle size={12} className="mr-1" />
                                      Batalkan Task
                                    </>
                                  )}
                                </Button>
                              )}
                          </div>
                        );
                      })}
                    </div>
                    <PaginationControls
                      page={pagDibuat.page}
                      totalPages={pagDibuat.totalPages}
                      setPage={pagDibuat.setPage}
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

      {/* ════════════════════════════════════════════════════════════════════
          NEW TASK MODAL — cascading hierarchical form + AI Helper
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={isNewTaskOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Buat Task Baru</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* 1 ── Judul Task */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-judul">
                Judul Task <span className="text-red-500">*</span>
              </Label>
              <Input
                id="task-judul"
                placeholder="Masukkan judul task..."
                value={newTaskJudul}
                onChange={(e) => setNewTaskJudul(e.target.value)}
                className="text-sm"
                data-ocid="task-judul-input"
              />
            </div>

            {/* 2 ── Tipe Layanan */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-tipe">
                Tipe Layanan <span className="text-red-500">*</span>
              </Label>
              {services.length === 0 ? (
                <p className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  Belum ada layanan aktif. Hubungi Asistenmu untuk mengaktifkan
                  paket.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {services.map((svc) => {
                    const tipe = getTipeLayanan(svc);
                    const isSelected = selectedServiceId === svc.idService;
                    return (
                      <button
                        key={svc.idService}
                        type="button"
                        data-ocid={`tipe-layanan-${tipe}`}
                        onClick={() => {
                          setSelectedServiceId(svc.idService);
                          resetFromTipe();
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${isSelected ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                      >
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${tipeBadgeClass(tipe)}`}
                        >
                          {tipeLabel(tipe)}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-mono text-slate-500 truncate">
                            {svc.idService}
                          </span>
                          <span className="text-xs text-slate-500">
                            {tipe === "tenang"
                              ? "Akses layanan Seri T (personal)"
                              : "Akses layanan Seri J & T (bisnis + personal)"}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="ml-auto text-teal-600 text-xs font-semibold">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3 ── Kategori Pekerjaan (visible after Tipe selected) */}
            {selectedServiceId && (
              <div className="flex flex-col gap-1.5">
                <Label>
                  Kategori Pekerjaan <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableKategori.map((kat) => (
                    <button
                      key={kat}
                      type="button"
                      data-ocid={`kategori-${kat.toLowerCase()}`}
                      onClick={() => {
                        setSelectedKategori(kat);
                        resetFromKategori();
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${selectedKategori === kat ? "border-teal-400 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                      {kat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4 ── Jenis Pekerjaan (visible after Kategori selected) */}
            {selectedKategori && (
              <div className="flex flex-col gap-1.5">
                <Label>
                  Jenis Pekerjaan <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <input
                    type="text"
                    value={jenisSearch}
                    placeholder="Cari jenis pekerjaan..."
                    data-ocid="jenis-search-input"
                    onChange={(e) => {
                      setJenisSearch(e.target.value);
                      setSelectedJenisItem(null);
                      setShowJenisList(true);
                      resetFromJenis();
                      // Check score
                      if (e.target.value.trim()) {
                        const results = fuzzySearch(
                          e.target.value,
                          jenisItemsForKategori,
                        );
                        setJenisLowScore(
                          results.length === 0 || (results[0]?.score ?? 0) < 40,
                        );
                      } else {
                        setJenisLowScore(false);
                      }
                    }}
                    onFocus={() => setShowJenisList(true)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-white"
                  />
                  {/* Dropdown list */}
                  {showJenisList && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                      {jenisSearchResults.length === 0 ? (
                        <p className="text-xs text-slate-400 px-4 py-3">
                          Tidak ada hasil.
                        </p>
                      ) : (
                        jenisSearchResults.map(({ item, score }) => (
                          <button
                            key={item.id}
                            type="button"
                            data-ocid={`jenis-item-${item.id}`}
                            onClick={() => {
                              setSelectedJenisItem(item);
                              setJenisSearch(item.nama);
                              setShowJenisList(false);
                              setJenisLowScore(false);
                              resetFromJenis();
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-teal-50 flex flex-col gap-0.5 border-b border-slate-50 last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-teal-600 font-semibold">
                                {item.id}
                              </span>
                              <span className="text-sm text-slate-800">
                                {item.nama}
                              </span>
                              {score < 100 && (
                                <span className="ml-auto text-xs text-slate-400">
                                  {Math.round(score)}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {item.deskripsi}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected item display */}
                {selectedJenisItem && (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-teal-700 font-bold">
                        {selectedJenisItem.id}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {selectedJenisItem.nama}
                      </span>
                      <span className="ml-auto text-xs text-teal-600 font-medium">
                        {selectedJenisItem.unitDasar} unit
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {selectedJenisItem.deskripsi}
                    </p>
                  </div>
                )}

                {/* Low score WA button */}
                {jenisLowScore && jenisSearch.trim() && topScore < 40 && (
                  <a
                    href="https://wa.me/628817743613"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid="tanya-asisten-wa-btn"
                    className="flex items-center gap-2 justify-center text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-xl px-4 py-2.5 transition-colors"
                  >
                    <MessageCircle size={16} />
                    Tanya Asistenmu via WA
                  </a>
                )}
              </div>
            )}

            {/* 5 ── AI Helper Chat (visible after Jenis selected) */}
            {selectedJenisItem && !aiSummaryComplete && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Label>AI Helper</Label>
                  <span className="text-xs text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
                    Wajib diselesaikan
                  </span>
                </div>
                <AIHelperChat
                  key={selectedJenisItem.id}
                  selectedItem={selectedJenisItem}
                  onSummaryComplete={(detail, units) => {
                    setNewTaskDetail(detail);
                    setEstimasiUnit(units);
                    setAiSummaryComplete(true);
                  }}
                />
              </div>
            )}

            {/* AI Complete indicator */}
            {aiSummaryComplete && selectedJenisItem && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <Sparkles size={13} />
                <span>
                  AI Helper selesai untuk{" "}
                  <strong>{selectedJenisItem.nama}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJenisItem(null);
                    setJenisSearch("");
                    resetFromJenis();
                  }}
                  className="ml-auto text-emerald-600 hover:text-emerald-800 underline text-xs"
                >
                  Ganti layanan
                </button>
              </div>
            )}

            {/* 6 ── Detail Task (visible after AI complete) */}
            {aiSummaryComplete && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-detail">
                  Detail Task{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    (dari AI Helper, bisa diedit)
                  </span>
                </Label>
                <Textarea
                  id="task-detail"
                  value={newTaskDetail}
                  onChange={(e) => setNewTaskDetail(e.target.value)}
                  className="text-sm min-h-[140px] resize-none font-mono text-xs"
                  data-ocid="task-detail-textarea"
                />
              </div>
            )}

            {/* 7 ── Estimasi Unit (read-only) */}
            {aiSummaryComplete && estimasiUnit > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Estimasi Unit</Label>
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                  <span className="text-2xl font-bold text-amber-700">
                    {estimasiUnit}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-amber-700">
                      unit kerja
                    </span>
                    <span className="text-xs text-amber-600">
                      dihitung otomatis dari percakapan AI
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 8 ── Deadline */}
            {aiSummaryComplete && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-deadline">
                  Deadline <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="task-deadline"
                  type="date"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="text-sm"
                  min={new Date().toISOString().split("T")[0]}
                  data-ocid="task-deadline-input"
                />
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={closeModal}
              disabled={isCreatingTask}
            >
              Batal
            </Button>
            <Button
              className="flex-1 bg-slate-900 text-white hover:bg-slate-700"
              onClick={handleCreateTask}
              disabled={!canSubmit || isCreatingTask}
              data-ocid="task-submit-btn"
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
                    await act.updateTaskStatusAsClient(taskId, {
                      selesai: null,
                    });
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
