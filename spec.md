# Asistenku Landing Page

## Current State
- Backend: Motoko dengan stable var users (User internal INT-XXXX), partners (PA-XXXX), clients (CA-XXXXX), services (SA-XXXXX), topUps (TU-XXXXX)
- Roles: #admin, #asistenmu, #operasional, #client, #partner, #public_
- Status: #pending, #active, #reject, #suspend
- Frontend pages: LandingPage, InternalPortal, PortalPartner, ClientLogin, ClientRegister, DashboardAdmin, DashboardPartner, DashboardAsistenmu, DashboardClient
- DashboardAdmin: summary cards, manajemen pengguna (collapsible, filter), manajemen service (collapsible, aktivasi layanan, top up, list layanan)
- DashboardPartner: hanya welcome card (stub)
- DashboardAsistenmu: hanya welcome card (stub)
- Belum ada stable var tasks di backend

## Requested Changes (Diff)

### Add
- Backend stable var `tasks` dengan struktur: idTask (TSK-XXXXX auto-generate), judulTask, detailTask, deadline (Int), serviceId, clientId, clientNama, partnerId, partnerNama, asistenmuId, asistenmuNama, notesAsistenmu, jamEfektif (Nat), unitLayanan (Nat), linkGdriveInternal, linkGdriveClient, status (TaskStatus), createdAt (Int)
- TaskStatus variants: #permintaanbaru, #onprogress, #reviewclient, #qaasistenmu, #revisi, #ditolak, #selesai
- Backend functions: createTask, delegasiTask (set partnerId/partnerNama/jamEfektif/unitLayanan/notes/linkGdriveInternal/linkGdriveClient + status #onprogress), updateTaskStatus (generic), getAllTasks, getTasksByPartner (by partnerId), getTasksByAsistenmu (filter by asistenmuId melalui serviceId), getTasksByStatus
- Dashboard Admin: tambah section "Manajemen Task" (OuterCollapsible) di bawah Manajemen Service:
  - Filter per sub-card: nama client & tipe layanan (filter by serviceId -> lookup tipeLayanan)
  - 7 sub-card CollapsibleSection, pagination 5 masing-masing:
    1. Task Baru (#permintaanbaru) - tombol Delegasikan (form modal: autocomplete partner by idUser/nama/verifiedSkill, jam efektif, unit layanan, notes, linkGdriveInternal, linkGdriveClient, tombol Delegasikan)
    2. Task Review Client (#reviewclient) - tombol Meminta Revisi (-> #revisi)
    3. Task On Progress (#onprogress) - tombol Meminta QA Asistenmu (-> #qaasistenmu)
    4. Task QA Asistenmu (#qaasistenmu) - tombol Meminta Review Client (-> #reviewclient)
    5. Task Revisi (#revisi) - tombol Kirim Revisi ke Partner (-> #onprogress)
    6. Task Ditolak Partner (#ditolak) - tombol Delegasi Ulang (form delegasi, partner bisa dipilih ulang, field lain read only)
    7. Task Selesai (#selesai) - tampilan saja
- Dashboard Partner: full replace stub dengan task list yang terdelegasi ke partner ini:
  - Sub-card tasks by status: On Progress (tombol Meminta QA Asistenmu), Review Client, QA Asistenmu, Revisi, Selesai, Ditolak
  - Data diambil dari getTasksByPartner(principalId)
- Dashboard Asistenmu: full replace stub dengan:
  - Summary cards: total layanan terkait, counter per status task (#permintaanbaru, #onprogress, #reviewclient, #qaasistenmu, #revisi, #ditolak, #selesai)
  - List layanan yang servicenya asistenmuId == principalId asistenmu (pagination 5)
  - List task #permintaanbaru yang serviceId-nya tertaut ke asistenmu ini (via getTasksByAsistenmu)

### Modify
- Backend: tambah taskCounter stable var, tambah fungsi-fungsi task ke actor
- DashboardAdmin.tsx: tambah section Manajemen Task setelah Manajemen Service, tambah interface Task, tambah state tasks, tambah fetch tasks, tambah partnerList autocomplete

### Remove
- Tidak ada yang dihapus

## Implementation Plan
1. Generate Motoko backend baru dengan semua type dan fungsi tasks (tambah ke existing stable var)
2. Update DashboardAdmin.tsx: tambah Task interface, fetch getAllTasks + getPartners, tambah section Manajemen Task dengan 7 sub-card, form delegasi modal/inline, semua tombol status update
3. Rewrite DashboardPartner.tsx: fetch getTasksByPartner, tampilkan task per status dengan tombol Meminta QA Asistenmu di On Progress
4. Rewrite DashboardAsistenmu.tsx: fetch getTasksByAsistenmu + getServices filtered by asistenmuId, summary cards, list layanan, list task permintaan baru
