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
  kycStatus: "pending" | "approved" | "rejected";
  paymentStatus: "pending" | "approved" | "rejected";
  accountStatus: "active" | "debarred";
  virtualBalance: number;
  watchlist: string[];
  createdAt: number;
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
