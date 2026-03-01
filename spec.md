# Asistenku Landing Page

## Current State
- Dashboard Partner sudah ada dengan task sections (On Progress, Review Client, QA, Revisi, Selesai, Ditolak)
- Backend sudah punya: Partner data, FinancialProfile, WithdrawRequest, FinancialProfileRequest
- Backend fungsi: requestFinancialProfile, requestWithdraw, approveWithdraw, getMyFinancialProfile, getTasksByPartner
- Header menampilkan "Dashboard Partner" + icon Users
- Footer menampilkan "Dashboard Partner — Area Terbatas"
- Tidak ada card profil, finansial, level/skill, atau wallet di dashboard partner

## Requested Changes (Diff)

### Add
- Backend: `getMyPartnerProfile` query untuk partner caller
- Backend: `updateMyPartnerProfile` untuk partner update nama, email, whatsapp, kota sendiri
- Backend: `getMyWallet` query yang menghitung saldo dari task selesai (jamEfektif x hourly rate per level: junior=35000, senior=55000, expert=75000), dikurangi saldo dalam pengajuan withdraw (pending), hasil withdraw approved sudah terkurang otomatis
- Frontend: Card sapaan "Selamat datang, [nama]. Ruang Kerja kamu."
- Frontend: Card Profil Partner (idUser, nama, email, whatsapp, kota) dengan tombol Edit inline + Update (simpan ke backend)
- Frontend: Card Finansial (namaBankEwallet, nomorRekening, namaRekening) dengan tombol Edit + "Ajukan Perubahan Data" (kirim ke requestFinancialProfile)
- Frontend: Card Level & Verified Skill (read only)
- Frontend: Card Wallet (saldo tersedia, saldo dalam pengajuan withdraw, tombol Ajukan Withdraw dengan form nominal)
- Frontend: Section "Task Manajemen" collapsible yang membungkus semua card task yang ada
- Frontend: Card "Akademi Asistenku - Coming Soon" di bawah Task Manajemen
- Frontend: Logo asistenku-horizontal di header (ganti icon + tulisan)
- Frontend: Footer teks "Ruang Kerja Partner - Area terbatas"

### Modify
- Backend: Tambah fungsi `getMyPartnerProfile` dan `updateMyPartnerProfile` dan `getMyWallet`
- Frontend DashboardPartner: Header ganti dengan logo asistenku-horizontal.png
- Frontend DashboardPartner: Footer teks diubah
- Frontend DashboardPartner: Semua task sections dibungkus dalam satu section "Task Manajemen" collapsible
- Frontend DashboardPartner: Summary cards ditambah data layanan + wallet info
- Logika withdraw: saat ajukan withdraw, saldo berkurang (masuk pending); saat approved saldo dalam pengajuan berkurang; saat rejected saldo dikembalikan

### Remove
- Header icon Users dan teks "Dashboard Partner"

## Implementation Plan
1. Tambah backend fungsi: `getMyPartnerProfile`, `updateMyPartnerProfile`, `getMyWallet` (Wallet = {saldoTersedia: Nat, saldoPengajuan: Nat})
2. Regenerate backend dan backend.d.ts
3. Update DashboardPartner.tsx:
   - Header: logo asistenku-horizontal.png di kiri, tombol Keluar di kanan
   - Card sapaan dengan nama partner
   - 4 card info: Profil (edit/update), Finansial (edit/ajukan), Level+Skill (readonly), Wallet (saldo+withdraw)
   - Wrap semua task sections dalam CollapsibleSection "Task Manajemen"
   - Card Akademi Asistenku coming soon
   - Footer teks baru
