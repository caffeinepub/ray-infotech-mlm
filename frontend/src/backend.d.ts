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
    uplineId?: MemberId;
    name: string;
    sponsorId?: MemberId;
}
export type MatrixPosition = bigint;
export type Time = bigint;
export interface MemberRegistrationResult {
    id: MemberId;
    memberId: string;
}
export interface MemberPublic {
    id: bigint;
    isCancelled: boolean;
    contactInfo: string;
    uplineId?: bigint;
    name: string;
    sponsorId?: bigint;
    membershipDeadline: Time;
    feeRefunded: boolean;
    directDownlines: Array<MemberId>;
    registrationTimestamp: Time;
    memberIdStr: string;
    joiningFeePaid: boolean;
    matrixPosition: MLMTreePosition;
}
export type MemberId = bigint;
export interface MLMTreePosition {
    memberId: MemberId;
    level: TreeLevel;
    position: MatrixPosition;
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
    checkMembershipStatuses(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMember(id: MemberId): Promise<MemberPublic | null>;
    getMemberRegistrationData(user: Principal): Promise<UserProfile | null>;
    getSenderDownlines(senderId: MemberId): Promise<Array<MemberId>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listMembersByName(): Promise<Array<MemberPublic>>;
    markJoiningFeePaid(memberId: MemberId): Promise<void>;
    registerMember(registration: MemberRegistration): Promise<MemberRegistrationResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
