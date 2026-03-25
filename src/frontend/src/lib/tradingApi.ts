import { createActorWithConfig } from "../config";
import type { User } from "./store";
import {
  getUsers,
  getUserByEmail as localGetUserByEmail,
  nextMemberId as localNextMemberId,
  updateUser as localUpdateUser,
  saveUsers,
} from "./store";

export interface TradingUserBackend {
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
  watchlist: string[];
  createdAt: bigint;
  referredBy: [] | [string];
  referralBonus: bigint;
  esignature: string;
  tcSigned: boolean;
}

function backendUserToLocal(u: TradingUserBackend): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    password: u.passwordHash,
    aadhaar: u.aadhaar,
    pan: u.pan,
    digilockerRef: u.digilockerRef,
    paymentProof: u.paymentProof,
    selfie: u.selfie || undefined,
    kycStatus: u.kycStatus as User["kycStatus"],
    paymentStatus: u.paymentStatus as User["paymentStatus"],
    accountStatus: u.accountStatus as User["accountStatus"],
    virtualBalance: Number(u.virtualBalance),
    watchlist: u.watchlist,
    createdAt: Number(u.createdAt),
    referredBy:
      Array.isArray(u.referredBy) && u.referredBy.length > 0
        ? u.referredBy[0]
        : undefined,
    referralBonus: Number(u.referralBonus),
  };
}

function localUserToBackend(u: User): TradingUserBackend {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    passwordHash: u.password,
    aadhaar: u.aadhaar,
    pan: u.pan,
    digilockerRef: u.digilockerRef,
    paymentProof: u.paymentProof,
    selfie: u.selfie || "",
    kycStatus: u.kycStatus,
    paymentStatus: u.paymentStatus,
    accountStatus: u.accountStatus,
    virtualBalance: BigInt(Math.round(u.virtualBalance)),
    watchlist: u.watchlist,
    createdAt: BigInt(Math.round(u.createdAt)),
    referredBy: u.referredBy ? [u.referredBy] : [],
    referralBonus: BigInt(Math.round(u.referralBonus || 0)),
    esignature: "",
    tcSigned: false,
  };
}

export async function backendRegisterUser(user: User): Promise<boolean> {
  const actor = (await createActorWithConfig()) as any;
  const backendUser = localUserToBackend(user);
  const result = await actor.registerTradingUser(backendUser);
  if (!result?.ok) {
    const msg = result?.message || "Registration failed on backend";
    throw new Error(msg);
  }
  // Also cache in localStorage for offline/fast reads
  try {
    const users = getUsers();
    if (!users.find((x) => x.id === user.id)) {
      users.push(user);
      saveUsers(users);
    }
  } catch {
    // cache failure is non-critical
  }
  return true;
}

export async function backendGetAllUsers(): Promise<User[]> {
  try {
    const actor = (await createActorWithConfig()) as any;
    const users: TradingUserBackend[] = await actor.getAllTradingUsers();
    const backendUsers = users.map(backendUserToLocal);
    // Backend is source of truth; save to localStorage for offline/cache
    saveUsers(backendUsers);
    return backendUsers;
  } catch (e) {
    console.error("backendGetAllUsers failed, using localStorage fallback:", e);
    return getUsers();
  }
}

export async function backendGetUserByEmail(
  email: string,
): Promise<User | null> {
  try {
    const actor = (await createActorWithConfig()) as any;
    const result: [] | [TradingUserBackend] =
      await actor.getTradingUserByEmail(email);
    if (Array.isArray(result) && result.length > 0 && result[0]) {
      return backendUserToLocal(result[0]);
    }
    return null;
  } catch (e) {
    console.error(
      "getTradingUserByEmail failed, using localStorage fallback:",
      e,
    );
    return localGetUserByEmail(email);
  }
}

export async function backendUpdateUser(user: User): Promise<boolean> {
  try {
    const actor = (await createActorWithConfig()) as any;
    const backendUser = localUserToBackend(user);
    const result = await actor.updateTradingUser(backendUser);
    // Also update localStorage cache
    localUpdateUser(user);
    return result?.ok === true;
  } catch (e) {
    console.error("backendUpdateUser failed, using localStorage fallback:", e);
    localUpdateUser(user);
    return false;
  }
}

export async function backendNextMemberId(): Promise<string> {
  try {
    const actor = (await createActorWithConfig()) as any;
    return await actor.nextTradingMemberId();
  } catch (e) {
    console.error(
      "backendNextMemberId failed, using localStorage fallback:",
      e,
    );
    return localNextMemberId();
  }
}

export async function backendCreditReferral(
  referrerId: string,
): Promise<boolean> {
  try {
    const actor = (await createActorWithConfig()) as any;
    const result = await actor.creditTradingReferralBonus(referrerId);
    return result?.ok === true;
  } catch (e) {
    console.error("backendCreditReferral failed:", e);
    return false;
  }
}
