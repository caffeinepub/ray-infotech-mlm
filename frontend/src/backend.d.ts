import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MemberRegistration {
    contactInfo: string;
    name: string;
    sponsorId?: MemberId;
}
export type Time = bigint;
export interface MemberPublic {
    id: bigint;
    contactInfo: string;
    name: string;
    sponsorId?: bigint;
    feeRefunded: boolean;
    directDownlines: Array<MemberId>;
    registrationTimestamp: Time;
    joiningFeePaid: boolean;
    matrixPosition: MLMTreePosition;
}
export type MemberId = bigint;
export interface MLMTreePosition {
    memberId: MemberId;
    level: TreeLevel;
    position: bigint;
}
export interface UserProfile {
    contactInfo: string;
    name: string;
}
export type TreeLevel = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMember(id: MemberId): Promise<MemberPublic | null>;
    getSenderDownlines(senderId: MemberId): Promise<Array<MemberId>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listMembersByName(): Promise<Array<MemberPublic>>;
    markJoiningFeePaid(memberId: MemberId): Promise<void>;
    registerMember(registration: MemberRegistration): Promise<MemberId>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
