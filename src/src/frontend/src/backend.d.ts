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
export interface LevelCommission {
    levelPercentage: bigint;
    totalLevelEarnings: bigint;
    level: TreeLevel;
    levelMembers: bigint;
    commissionAmount: bigint;
}
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

export interface TradingUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    aadhaar: string;
    pan: string;
    digilockerRef: string;
    paymentProof: string;
    selfie: string;
    kycStatus: string;
    paymentStatus: string;
    accountStatus: string;
    virtualBalance: bigint;
    watchlist: Array<string>;
    createdAt: bigint;
    referredBy: string;
    referralBonus: bigint;
    esignature: string;
    tcSigned: boolean;
}

export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateCommissions(_amount: bigint): Promise<Array<LevelCommission>>;
    checkMembershipStatuses(): Promise<void>;
    deleteMember(memberId: MemberId): Promise<void>;
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
    // Trading platform
    registerTradingUser(user: TradingUser): Promise<{ ok: boolean; message: string }>;
    getTradingUserByEmail(email: string): Promise<TradingUser | null>;
    getAllTradingUsers(): Promise<Array<TradingUser>>;
    updateTradingUser(user: TradingUser): Promise<{ ok: boolean }>;
    updateTradingUserById(id: string, kycStatus: string, paymentStatus: string, accountStatus: string, virtualBalance: bigint): Promise<{ ok: boolean }>;
    creditTradingReferralBonus(referrerId: string): Promise<{ ok: boolean }>;
    nextTradingMemberId(): Promise<string>;
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
}
