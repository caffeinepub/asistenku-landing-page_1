# Asistenku Platform

## Current State

Full-stack ICP application with:
- Motoko backend with stable vars: users, partners, clients, services, topUps, tasks, financialProfiles, withdrawRequests, financialProfileRequests, adminLogs
- Landing page (App.tsx) with 7 sections, accordion service cards
- Pages: /portal-internal, /dashboard-admin, /dashboard-asistenmu, /dashboard-operasional, /dashboard-client, /dashboard-partner, /client-login, /client-register, /portal-partner, /claim-admin-as, /tentang-partner-asistenku
- Role guard on all dashboards
- Backend functions: getUsers, getAllTasks, getTasksByPartner, getTasksByAsistenmu, getServices, getMyServicesAsAsistenmu, aktivasiLayanan, updateService, topUpService, createTask, delegasiTask, updateTaskStatus, claimAdmin, forceClaimAdmin, withdraw/financial profile functions
- DashboardAdmin has: Summary cards, Manajemen Pengguna (collapsible with filter), Manajemen Service, Manajemen Task, Financial Management, History sections
- DashboardClient has: greeting, profil, layanan, summary task, Task Manajemen sections. Data fetched via getAllClients/getServices/getAllTasks filtered by principalId.
- DashboardPartner: greeting, profil, finansial, level/skill, wallet, task manajemen sections. getTasksByPartner from backend.
- getAdminLogs() has bug: calls logs.sort() without comparator causing compile error

## Requested Changes (Diff)

### Add
- Backend: `archiveService(idService: Text)` -- soft delete, moves service to archivedServices stable map with `archived: true`
- Backend: `getArchivedServices()` -- returns archived services for admin/operasional
- Backend: Fix `getAdminLogs()` -- sort by createdAt descending using proper Array.sort with compare function
- DashboardAdmin: In Edit Service modal, add "Tambah Sharing" button to add sharing entries without creating new service
- DashboardAdmin: "Hapus Layanan" button (soft delete) in service list, archives service
- DashboardAdmin: New "Arsip Layanan" card below List Layanan, collapsible, pagination 5, showing archived services
- DashboardClient: Fix service filter -- match by `clientPrincipalId === principalId` AND fallback by `clientNama` matching client name. Also check `idUser` from getMyProfile.
- DashboardClient: Fix profile fetch -- use `getMyProfile()` directly (returns the logged-in client profile)

### Modify
- DashboardClient: Instead of calling getAllClients (admin-only), use `getMyProfile()` to get client profile directly. Filter services by matching `clientPrincipalId` to the logged-in principal. Filter tasks by `clientId === clientData.idUser` or `clientId === principalId`.
- DashboardAdmin: Edit Service modal now also supports adding new sharing entries inline.
- Backend: Fix getAdminLogs sort comparator to avoid compile error.

### Remove
- DashboardClient: Remove dependency on `getAllClients` and `getAllTasks` (admin-only calls). Use client-specific queries only.

## Implementation Plan
1. Fix backend: `getAdminLogs` sort bug, add `archiveService`, add `getArchivedServices`, add `getMyClientProfile` query for clients
2. Regenerate backend.d.ts
3. Fix DashboardClient: use `getMyClientProfile()` instead of getAllClients; use client-specific task fetch
4. Fix DashboardAdmin Edit Service modal: add inline sharing management
5. Add archiveService button + Arsip Layanan card in DashboardAdmin
6. Validate and build
