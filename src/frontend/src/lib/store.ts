// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: string; // RT-000001
  name: string;
  email: string;
  phone: string;
  password: string;
  aadhaar: string;
  pan: string;
  digilockerRef: string;
  paymentProof: string; // base64
  selfie?: string; // base64 selfie for KYC
  kycStatus: "pending" | "approved" | "rejected";
  paymentStatus: "pending" | "approved" | "rejected";
  accountStatus: "active" | "debarred";
  virtualBalance: number;
  watchlist: string[];
  createdAt: number;
  referredBy?: string; // Member ID of referrer
  referralBonus?: number; // total referral bonus earned
  tcSignature?: { dataUrl: string; signedAt: number };
}

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  assetType: "EQUITY" | "ETF" | "FNO";
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  timestamp: number;
  charges?: number;
  netAmount?: number;
}

export interface Holding {
  symbol: string;
  name: string;
  assetType: "EQUITY" | "ETF" | "FNO";
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPct: number;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const USERS_KEY = "ri_users";
const TRADES_KEY = "ri_trades";
const SESSION_KEY = "ri_session";

// ─── Users ────────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUserById(id: string): User | null {
  return getUsers().find((u) => u.id === id) || null;
}

export function getUserByEmail(email: string): User | null {
  return (
    getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
    null
  );
}

export function updateUser(updated: User) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === updated.id);
  if (idx !== -1) {
    users[idx] = updated;
    saveUsers(users);
  }
}

export function nextMemberId(): string {
  const users = getUsers();
  const num = users.length + 1;
  return `RT-${String(num).padStart(6, "0")}`;
}

// ─── Referral Bonus ───────────────────────────────────────────────────────────

export const REFERRAL_BONUS = 5;

/**
 * Credit Rs5 referral bonus to the referrer when a referred user becomes
 * fully approved (both KYC and payment approved). Returns true if credited.
 */
export function creditReferralBonus(approvedUser: User): boolean {
  if (!approvedUser.referredBy) return false;
  if (
    approvedUser.kycStatus !== "approved" ||
    approvedUser.paymentStatus !== "approved"
  )
    return false;

  const referrer = getUserById(approvedUser.referredBy);
  if (!referrer) return false;

  // Avoid double-crediting
  const bonusKey = `ri_bonus_${approvedUser.id}`;
  if (localStorage.getItem(bonusKey)) return false;

  const updated = {
    ...referrer,
    virtualBalance: referrer.virtualBalance + REFERRAL_BONUS,
    referralBonus: (referrer.referralBonus || 0) + REFERRAL_BONUS,
  };
  updateUser(updated);
  localStorage.setItem(bonusKey, "1");
  return true;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setSession(userId: string) {
  localStorage.setItem(SESSION_KEY, userId);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  const id = getSession();
  if (!id) return null;
  return getUserById(id);
}

// ─── Trades ───────────────────────────────────────────────────────────────────

export function getTrades(): Trade[] {
  try {
    return JSON.parse(localStorage.getItem(TRADES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getTradesByUser(userId: string): Trade[] {
  return getTrades().filter((t) => t.userId === userId);
}

export function addTrade(trade: Trade) {
  const trades = getTrades();
  trades.push(trade);
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export function getHoldings(
  userId: string,
  prices: Record<string, number>,
): Holding[] {
  const trades = getTradesByUser(userId);
  const map: Record<
    string,
    {
      symbol: string;
      name: string;
      assetType: "EQUITY" | "ETF" | "FNO";
      qty: number;
      cost: number;
    }
  > = {};

  for (const t of trades) {
    if (!map[t.symbol]) {
      map[t.symbol] = {
        symbol: t.symbol,
        name: t.name,
        assetType: t.assetType,
        qty: 0,
        cost: 0,
      };
    }
    if (t.type === "BUY") {
      map[t.symbol].cost += t.price * t.quantity;
      map[t.symbol].qty += t.quantity;
    } else {
      const avgBuy =
        map[t.symbol].qty > 0 ? map[t.symbol].cost / map[t.symbol].qty : 0;
      map[t.symbol].cost -= avgBuy * t.quantity;
      map[t.symbol].qty -= t.quantity;
    }
  }

  return Object.values(map)
    .filter((h) => h.qty > 0)
    .map((h) => {
      const avgBuyPrice = h.qty > 0 ? h.cost / h.qty : 0;
      const currentPrice = prices[h.symbol] || avgBuyPrice;
      const pnl = (currentPrice - avgBuyPrice) * h.qty;
      const pnlPct = avgBuyPrice > 0 ? (pnl / (avgBuyPrice * h.qty)) * 100 : 0;
      return {
        symbol: h.symbol,
        name: h.name,
        assetType: h.assetType,
        quantity: h.qty,
        avgBuyPrice,
        currentPrice,
        pnl,
        pnlPct,
      };
    });
}

export function getHoldingQty(userId: string, symbol: string): number {
  const trades = getTradesByUser(userId).filter((t) => t.symbol === symbol);
  return trades.reduce(
    (acc, t) => (t.type === "BUY" ? acc + t.quantity : acc - t.quantity),
    0,
  );
}

// ─── Daily Videos ─────────────────────────────────────────────────────────────

const DAILY_VIDEOS_KEY = "ri_daily_videos";

export interface DailyVideo {
  id: string;
  title: string;
  caption?: string;
  videoUrl: string;
  addedAt: number;
  addedDate: string;
}

function getISTDateString(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  return ist.toISOString().split("T")[0];
}

function isAfter11pmIST(): boolean {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  return ist.getUTCHours() >= 23;
}

export function getDailyVideos(): DailyVideo[] {
  try {
    const raw = JSON.parse(localStorage.getItem(DAILY_VIDEOS_KEY) || "[]");
    const today = getISTDateString();
    if (isAfter11pmIST()) {
      localStorage.removeItem(DAILY_VIDEOS_KEY);
      return [];
    }
    const filtered = raw.filter((v: DailyVideo) => v.addedDate === today);
    if (filtered.length !== raw.length) {
      localStorage.setItem(DAILY_VIDEOS_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

export function addDailyVideo(
  video: Omit<DailyVideo, "id" | "addedAt" | "addedDate">,
): DailyVideo {
  const videos = getDailyVideos();
  const newVideo: DailyVideo = {
    ...video,
    id: Date.now().toString(),
    addedAt: Date.now(),
    addedDate: getISTDateString(),
  };
  videos.push(newVideo);
  localStorage.setItem(DAILY_VIDEOS_KEY, JSON.stringify(videos));
  return newVideo;
}

export function deleteDailyVideo(id: string) {
  const videos = getDailyVideos().filter((v) => v.id !== id);
  localStorage.setItem(DAILY_VIDEOS_KEY, JSON.stringify(videos));
}

export function clearDailyVideos() {
  localStorage.removeItem(DAILY_VIDEOS_KEY);
}
