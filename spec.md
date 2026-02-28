# Asistenku - Dashboard Admin & User Management

## Current State
- Landing page sudah ada di `/` dengan 7 section.
- `/portal-internal` sudah ada: Login II, Form Pendaftaran (INT-XXXX), Dashboard Internal (redirect by role), Claim Admin.
- `/dashboard-admin` sudah ada tapi hanya berisi welcome card dan quick stats statis.
- `/dashboard-asistenmu` sudah ada.
- Backend: User type dengan role `#admin | #asistenmu`, status `#pending | #active`. Fungsi: claimAdmin, registerUser, getUsers, getMyRole, getMyProfile, isAdminClaimed.
- Tidak ada tipe data Partner dan Client di backend.

## Requested Changes (Diff)

### Add
- **Backend types**: role tambah `#client | #partner | #operasional | #public`; status tambah `#reject | #suspend`
- **Backend type `Partner`**: idUser (PA-XXXX), principalId, nama, email, whatsapp, kota, level (LevelPartner: #junior | #senior | #expert), verifiedSkill ([Text]), role, status, createdAt — stable var
- **Backend type `Client`**: idUser (CA-XXXXX), principalId, nama, email, whatsapp, Company, role, status, createdAt — stable var
- **Backend counter** untuk partner (PA-XXXX) dan client (CA-XXXXX) terpisah
- **Backend functions**:
  - `getAllUsers()` — return semua user internal (stable var)
  - `getAllPartners()` — return semua partner
  - `getAllClients()` — return semua client
  - `approveUser(principalId: Text, role: Role)` — update status jadi #active, set role (untuk user internal)
  - `rejectUser(principalId: Text)` — update status jadi #reject
  - `suspendUser(principalId: Text)` — update status jadi #suspend
  - `reactivateUser(principalId: Text)` — update status jadi #active
  - `updatePartnerDetails(principalId: Text, level: LevelPartner, verifiedSkill: [Text])` — update level dan skill partner
  - `approvePartner(principalId: Text)` — update status partner jadi #active
  - `rejectPartner(principalId: Text)` — update status partner jadi #reject
  - `suspendPartner(principalId: Text)` — suspend partner
  - `reactivatePartner(principalId: Text)` — reaktivasi partner
  - `approveClient(principalId: Text)` — update status client jadi #active
  - `rejectClient(principalId: Text)` — update status client jadi #reject
  - `suspendClient(principalId: Text)` — suspend client
  - `reactivateClient(principalId: Text)` — reaktivasi client
- **Dashboard Admin** (`/dashboard-admin`) — ganti konten lama dengan:
  - Summary cards: Total Semua User, Pending User, User Aktif, Client Aktif, Partner Aktif, Asistenmu Aktif
  - Manajemen Pengguna collapsible dengan 5 sub-card:
    1. Pending User (pagination 5): user internal → dropdown role (#operasional/#asistenmu) + approve/reject; client → approve/reject saja; partner → tombol edit (modal level+skill) + approve/reject
    2. Client Aktif (pagination 5): list + tombol suspend
    3. Partner Aktif (pagination 5): list + tombol suspend + tombol edit (modal level+skill)
    4. Admin & Asistenmu Aktif: list saja, tanpa tombol
    5. User Suspended: list + tombol reaktivasi

### Modify
- **Backend `User`** (user internal INT-XXXX): tambah field `role` yang sudah support semua role baru (termasuk #operasional)
- **`registerUser`**: role default tetap tidak di-set secara permanen (admin yang set saat approve)
- **`getMyRole`** di InternalPortal: perlu support role #operasional untuk redirect ke dashboard-asistenmu

### Remove
- Tidak ada yang dihapus

## Implementation Plan
1. Rewrite backend `main.mo`:
   - Tambah Role: #client, #partner, #operasional, #public
   - Tambah Status: #reject, #suspend
   - Tambah LevelPartner: #junior, #senior, #expert
   - Tambah type Partner dan Client dengan stable var
   - Tambah counter partnerCounter dan clientCounter
   - ID format: INT-XXXX, PA-XXXX (4 digit), CA-XXXXX (5 digit)
   - Implement semua fungsi admin baru di atas
   - Semua data di stable var

2. Update frontend `DashboardAdmin.tsx`:
   - Fetch data dari backend (getAllUsers, getAllPartners, getAllClients)
   - Render summary cards dengan counter real dari backend
   - Render 5 collapsible management card dengan pagination dan tombol aksi
   - Modal edit untuk partner (level dropdown + verifiedSkill text input)
   - Semua aksi memanggil backend dan refresh data setelahnya

3. Update `InternalPortal.tsx`: support redirect role #operasional ke `/dashboard-asistenmu`
