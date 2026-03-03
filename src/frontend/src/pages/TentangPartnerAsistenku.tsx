import { Link } from "@tanstack/react-router";
import Footer from "../components/Footer";
import Header from "../components/Header";

const keuntungan = [
  "Penghasilan tambahan yang kompetitif",
  "Fleksibilitas waktu kerja",
  "Akses ke klien bisnis berkualitas",
  "Sistem pembayaran yang transparan",
  "Dukungan dari tim internal Asistenku",
];

const persyaratan = [
  "Memiliki keahlian di bidang yang relevan",
  "Komitmen terhadap kualitas dan ketepatan waktu",
  "Kemampuan komunikasi yang baik",
  "Memiliki perangkat kerja yang memadai",
];

const caraBergabung = [
  { step: "1", text: "Daftarkan diri Anda melalui Portal Partner" },
  { step: "2", text: "Tim kami akan meninjau profil Anda" },
  { step: "3", text: "Setelah disetujui, Anda dapat mulai menerima tugas" },
  { step: "4", text: "Kerjakan tugas dan dapatkan pembayaran" },
];

export default function TentangPartnerAsistenku() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Section 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-4">
              Tentang Partner Asistenku
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Partner Asistenku adalah individu profesional yang bergabung
              dengan ekosistem kami untuk mengerjakan tugas-tugas dari klien.
              Sebagai partner, Anda akan mendapatkan akses ke berbagai proyek
              menarik dari klien bisnis kami.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">
              Keuntungan Menjadi Partner
            </h2>
            <ul className="space-y-3">
              {keuntungan.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-600">
                  <span className="bg-teal-brand w-2 h-2 rounded-full mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">
              Persyaratan Partner
            </h2>
            <ul className="space-y-3">
              {persyaratan.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-600">
                  <span className="bg-teal-brand w-2 h-2 rounded-full mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">
              Cara Bergabung
            </h2>
            <ol className="space-y-4">
              {caraBergabung.map((item) => (
                <li
                  key={item.step}
                  className="flex items-start gap-4 text-gray-600"
                >
                  <span className="step-circle w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {item.step}
                  </span>
                  {item.text}
                </li>
              ))}
            </ol>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">
              Siap Bergabung?
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Daftarkan diri Anda sekarang dan mulai perjalanan sebagai Partner
              Asistenku. Tim kami siap membantu Anda dalam setiap langkah proses
              pendaftaran.
            </p>
            <Link
              to="/portal-partner"
              className="btn-teal inline-block px-6 py-3 rounded-full font-medium"
            >
              Daftar Sebagai Partner
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
