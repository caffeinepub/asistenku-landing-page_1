# Asistenku Landing Page

## Current State
- Landing page (7 sections) dengan accordion service cards
- /portal-internal: Login II, Form Pendaftaran (INT-XXXX), Dashboard Internal, Claim Admin
- /portal-partner: Form pendaftaran partner (PA-XXXX)
- /client-login, /client-register: Login & pendaftaran client (CA-XXXXX)
- Dashboard Admin: summary cards, 5 collapsible sub-card manajemen pengguna (pending, client aktif, partner aktif, admin & asistenmu, suspended)
- Backend: User, Partner, Client dengan role (#admin, #asistenmu, #operasional, #client, #partner, #public_) dan status (#pending, #active, #reject, #suspend)

## Requested Changes (Diff)

### Add
- Backend: type Service, type TopUp, stable var services, stable var topUps
- Backend: Service struct: idService (SA_XXXXX), tipeLayanan (#tenang/#rapi/#fokus/#jaga/#efisien), clientPrincipalId, clientNama, asistenmuPrincipalId, asistenmuNama, unitLayanan (Nat), hargaPerLayanan (Nat), sharingLayanan (max 6, array of {idUser, principalId, nama}), status (#active/#inactive), createdAt
- Backend: TopUp struct: idTopUp (TU-XXXXX), idService, namaClient (otomatis dari idService), unitTambahan (Nat), createdAt
- Backend: fungsi aktivasiLayanan, topUpService, getServices, getTopUps, getAsistenmu, getClients
- Backend: counter serviceCounter, topUpCounter (stable)
- Dashboard Admin: section Manajemen Pengguna dijadikan outer collapsible (menyembunyikan semua sub-card list user), dengan filter role dan nama
- Dashboard Admin: section baru "Manajemen Service" collapsible (di bawah Manajemen Pengguna) dengan filter tipe layanan, nama client, status layanan:
  1. Card "Aktivasi Layanan" collapsible: form SA_XXXXX auto-generate, dropdown tipe layanan, autocomplete client, autocomplete asistenmu, unitLayanan, hargaPerLayanan, field sharing 1 (+ tombol tambah untuk field 2-6 max), tombol Aktifkan
  2. Card "Top Up Service" collapsible: input idService, nama client otomatis, input unitTambahan, tombol Top Up
  3. Card "List Layanan" collapsible: pagination 5, tampilkan semua service

### Modify
- Dashboard Admin: wrap seluruh section Manajemen Pengguna (semua 5 sub-card) dalam outer collapsible dengan header "Manajemen Pengguna" + filter role dan nama
- Backend main.mo: tambah type Service, TopUp, stable var, dan fungsi-fungsi di atas

### Remove
- Tidak ada yang dihapus

## Implementation Plan
1. Update backend main.mo: tambah type TipeLayanan, Service, TopUp, stable var services dan topUps, counter serviceCounter dan topUpCounter, fungsi aktivasiLayanan, topUpService, getServices, getTopUps (admin only), fungsi helper getServiceById untuk top up nama client auto-fill
2. Update backend.d.ts: tambah interface Service, TopUp, TipeLayanan, dan semua fungsi baru
3. Update DashboardAdmin.tsx:
   a. Wrap section "Manajemen Pengguna" (header + semua 5 CollapsibleSection) dalam outer collapsible baru dengan state isManajemenPenggunaOpen
   b. Tambah filter state (filterRole, filterNama) di dalam section Manajemen Pengguna
   c. Buat section baru "Manajemen Service" di bawahnya dengan state isManajemenServiceOpen
   d. Di dalam Manajemen Service: filter (tipeLayanan, namaClient, statusLayanan), Card Aktivasi Layanan, Card Top Up Service, Card List Layanan
   e. Autocomplete component untuk client dan asistenmu (search dari daftar yang di-load dari backend)
   f. State form aktivasi layanan lengkap termasuk sharingLayanan array (1 field default, +5 tambahan via tombol)
