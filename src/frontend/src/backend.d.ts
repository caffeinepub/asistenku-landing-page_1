import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface User {
    status: Status;
    nama: string;
    createdAt: bigint;
    role: Role;
    whatsapp: string;
    email: string;
    idUser: string;
    principalId: string;
}
export interface Task {
    unitLayanan: bigint;
    status: TaskStatus;
    clientId: string;
    partnerNama: string;
    clientNama: string;
    notesAsistenmu: string;
    asistenmuId: string;
    createdAt: bigint;
    jamEfektif: bigint;
    asistenmuNama: string;
    deadline: bigint;
    detailTask: string;
    partnerId: string;
    linkGdriveInternal: string;
    linkGdriveClient: string;
    serviceId: string;
    idTask: string;
    judulTask: string;
}
export interface Service {
    unitLayanan: bigint;
    status: ServiceStatus;
    clientPrincipalId: string;
    tipeLayanan: TipeLayanan;
    clientNama: string;
    createdAt: bigint;
    asistenmuNama: string;
    hargaPerLayanan: bigint;
    sharingLayanan: Array<SharingEntry>;
    asistenmuPrincipalId: string;
    idService: string;
}
export interface Partner {
    status: Status;
    kota: string;
    nama: string;
    createdAt: bigint;
    role: Role;
    verifiedSkill: Array<string>;
    whatsapp: string;
    email: string;
    level: LevelPartner;
    idUser: string;
    principalId: string;
}
export interface WithdrawRequest {
    status: WithdrawStatus;
    partnerNama: string;
    nominal: bigint;
    idWithdraw: string;
    createdAt: bigint;
    partnerId: string;
    nomorRekening: string;
    namaRekening: string;
    namaBankEwallet: string;
}
export interface FinancialProfileRequest {
    status: FPRequestStatus;
    partnerNama: string;
    newProfile: FinancialProfile;
    createdAt: bigint;
    partnerId: string;
    oldProfile?: FinancialProfile;
    idRequest: string;
}
export interface FinancialProfile {
    createdAt: bigint;
    nomorRekening: string;
    namaRekening: string;
    namaBankEwallet: string;
}
export interface TopUp {
    createdAt: bigint;
    unitTambahan: bigint;
    idService: string;
    idTopUp: string;
    namaClient: string;
}
export interface SharingEntry {
    nama: string;
    idUser: string;
    principalId: string;
}
export interface Client {
    status: Status;
    nama: string;
    createdAt: bigint;
    role: Role;
    whatsapp: string;
    email: string;
    company: string;
    idUser: string;
    principalId: string;
}
export interface AdminLog {
    action: string;
    adminPrincipalId: string;
    createdAt: bigint;
    idLog: string;
    targetId: string;
}
export enum LevelPartner {
    junior = "junior",
    senior = "senior",
    expert = "expert"
}
export enum Role {
    client = "client",
    admin = "admin",
    operasional = "operasional",
    public_ = "public",
    asistenmu = "asistenmu",
    partner = "partner"
}
export enum ServiceStatus {
    active = "active",
    inactive = "inactive"
}
export enum Status {
    reject = "reject",
    active = "active",
    pending = "pending",
    suspend = "suspend"
}
export enum TaskStatus {
    revisi = "revisi",
    reviewclient = "reviewclient",
    ditolak = "ditolak",
    permintaanbaru = "permintaanbaru",
    qaasistenmu = "qaasistenmu",
    selesai = "selesai",
    onprogress = "onprogress"
}
export enum TipeLayanan {
    fokus = "fokus",
    jaga = "jaga",
    rapi = "rapi",
    tenang = "tenang",
    efisien = "efisien"
}
export enum WithdrawStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    aktivasiLayanan(tipe: TipeLayanan, clientPrincipalId: string, clientNama: string, asistenmuPrincipalId: string, asistenmuNama: string, unitLayanan: bigint, hargaPerLayanan: bigint, sharingLayanan: Array<SharingEntry>): Promise<string>;
    approveClient(principalId: Principal): Promise<void>;
    approveFinancialProfileRequest(idRequest: string): Promise<void>;
    approveInternalUser(principalId: Principal, role: Role): Promise<void>;
    approvePartner(principalId: Principal): Promise<void>;
    approveWithdraw(idWithdraw: string): Promise<void>;
    claimAdmin(nama: string, email: string, whatsapp: string): Promise<void>;
    createTask(judulTask: string, detailTask: string, deadline: bigint, serviceId: string, clientId: string, clientNama: string, asistenmuId: string, asistenmuNama: string): Promise<string>;
    delegasiTask(idTask: string, partnerId: string, partnerNama: string, jamEfektif: bigint, unitLayanan: bigint, notesAsistenmu: string, linkGdriveInternal: string, linkGdriveClient: string): Promise<void>;
    getAdminLogs(): Promise<Array<AdminLog>>;
    getAllClients(): Promise<Array<Client>>;
    getAllPartners(): Promise<Array<Partner>>;
    getAllTasks(): Promise<Array<Task>>;
    getAllUsers(): Promise<Array<User>>;
    getAsistenmu(): Promise<Array<User>>;
    getClients(): Promise<Array<Client>>;
    getFinancialProfileByPartnerId(partnerId: string): Promise<FinancialProfile | null>;
    getFinancialProfileRequests(): Promise<Array<FinancialProfileRequest>>;
    getMyFinancialProfile(): Promise<FinancialProfile | null>;
    getMyProfile(): Promise<User | null>;
    getMyRole(): Promise<Role | null>;
    getMyServicesAsAsistenmu(): Promise<Array<Service>>;
    getPartners(): Promise<Array<Partner>>;
    getServices(): Promise<Array<Service>>;
    getTasksByAsistenmu(): Promise<Array<Task>>;
    getTasksByPartner(): Promise<Array<Task>>;
    getTopUps(): Promise<Array<TopUp>>;
    getUsers(): Promise<Array<User>>;
    getWithdrawRequests(): Promise<Array<WithdrawRequest>>;
    isAdmin(user: Principal): Promise<boolean>;
    isAdminClaimed(): Promise<boolean>;
    reactivateClient(principalId: Principal): Promise<void>;
    reactivatePartner(principalId: Principal): Promise<void>;
    reactivateUser(principalId: Principal): Promise<void>;
    registerClient(nama: string, email: string, whatsapp: string, company: string): Promise<string>;
    registerPartner(nama: string, email: string, whatsapp: string, kota: string): Promise<string>;
    registerUser(nama: string, email: string, whatsapp: string): Promise<string>;
    rejectClient(principalId: Principal): Promise<void>;
    rejectFinancialProfileRequest(idRequest: string): Promise<void>;
    rejectPartner(principalId: Principal): Promise<void>;
    rejectUser(principalId: Principal): Promise<void>;
    rejectWithdraw(idWithdraw: string): Promise<void>;
    requestFinancialProfile(namaBankEwallet: string, nomorRekening: string, namaRekening: string): Promise<string>;
    requestWithdraw(nominal: bigint): Promise<string>;
    suspendClient(principalId: Principal): Promise<void>;
    suspendPartner(principalId: Principal): Promise<void>;
    suspendUser(principalId: Principal): Promise<void>;
    topUpService(idService: string, unitTambahan: bigint): Promise<string>;
    updatePartnerDetails(principalId: Principal, level: LevelPartner, verifiedSkill: Array<string>): Promise<void>;
    updateTaskStatus(idTask: string, status: TaskStatus): Promise<void>;
}
