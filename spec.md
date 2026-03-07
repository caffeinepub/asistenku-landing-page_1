# Asistenku

## Current State
- DashboardAdmin.tsx: memiliki section ringkasan tapi belum ada summary cards agregat (GMV, saldo partner, margin, unit aktif/on hold, task stats, dll). Section ringkasan sistem belum ada sebagai collapsible section.
- DashboardAsistenmu.tsx: form delegasi partner sudah ada input search tapi hanya filter by nama/ID, belum bisa filter by verifiedSkill. Struktur sudah pakai `filteredPartners` dengan manual search input tapi belum autocomplete dropdown yang proper dengan skill search.
- Backend main.mo: belum ada fungsi `getAdminSummary()`.

## Requested Changes (Diff)

### Add
- Backend: fungsi `getAdminSummary()` yang menghitung semua agregat dari stable var:
  - GMV Total = sum(unitLayanan x hargaPerLayanan) dari semua service + sum(unitTambahan x hargaPerLayanan_service) dari semua topup
  - GMV per tipe layanan (tenang, rapi, fokus, jaga, efisien)
  - Total saldo partner = sum wallet semua partner aktif (dihitung dari tasks selesai per partner)
  - Total sudah withdraw = sum nominal semua withdraw status #approved
  - Margin = GMV Total - total konversi task selesai (jamEfektif x hourlyRate partner -- hourlyRate dihitung dari wallet/jam task selesai -- simplified: sum(jamEfektif) task selesai per partner x rata-rata rate, atau cukup total saldo yang dikreditkan ke partner = total saldo partner + total withdraw approved)
  - Total layanan aktif, per tipe
  - Total unit aktif (sum unitLayanan semua service aktif)
  - Total unit on hold (sum unitLayanan task berstatus onprogress)
  - Total task onprogress, revisi, selesai
- DashboardAdmin.tsx: section "Ringkasan Sistem" baru sebagai OuterCollapsible, grid 4 kolom per baris, 12 card dengan icon Lucide, data dari `getAdminSummary()`
- DashboardAsistenmu.tsx: search partner dalam form delegasi diperluas untuk juga filter by verifiedSkill

### Modify
- DashboardAdmin.tsx: tambah pemanggilan `getAdminSummary()` saat fetchData dipanggil
- DashboardAsistenmu.tsx: `filteredPartners` sudah filter by nama dan idUser, tambah filter by verifiedSkill.some()

### Remove
- Tidak ada yang dihapus

## Implementation Plan
1. Tambah fungsi `getAdminSummary()` di backend main.mo -- return type AdminSummary dengan semua field agregat
2. Regenerate backend.d.ts binding
3. DashboardAdmin.tsx: tambah state adminSummary, fetch saat load, render section Ringkasan Sistem collapsible dengan grid 4 kolom 12 card
4. DashboardAsistenmu.tsx: update filteredPartners logic untuk include verifiedSkill filter
