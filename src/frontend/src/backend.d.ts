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
export enum Role {
    admin = "admin",
    asistenmu = "asistenmu"
}
export enum Status {
    active = "active",
    pending = "pending"
}
export interface backendInterface {
    claimAdmin(): Promise<void>;
    getMyProfile(): Promise<User>;
    getMyRole(): Promise<Role | null>;
    getUsers(): Promise<Array<User>>;
    isAdmin(user: Principal): Promise<boolean>;
    isAdminClaimed(): Promise<boolean>;
    registerUser(nama: string, email: string, whatsapp: string): Promise<string>;
}
