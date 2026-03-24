export interface Asset {
  symbol: string;
  name: string;
  type: "EQUITY" | "ETF" | "FNO";
  basePrice: number;
  lotSize: number;
}

export const ASSETS: Asset[] = [
  // Equities
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    type: "EQUITY",
    basePrice: 2870,
    lotSize: 1,
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    type: "EQUITY",
    basePrice: 3920,
    lotSize: 1,
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    type: "EQUITY",
    basePrice: 1740,
    lotSize: 1,
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    type: "EQUITY",
    basePrice: 1680,
    lotSize: 1,
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank",
    type: "EQUITY",
    basePrice: 1190,
    lotSize: 1,
  },
  {
    symbol: "WIPRO",
    name: "Wipro Ltd",
    type: "EQUITY",
    basePrice: 490,
    lotSize: 1,
  },
  {
    symbol: "BAJFINANCE",
    name: "Bajaj Finance",
    type: "EQUITY",
    basePrice: 7200,
    lotSize: 1,
  },
  {
    symbol: "KOTAKBANK",
    name: "Kotak Mahindra Bank",
    type: "EQUITY",
    basePrice: 1820,
    lotSize: 1,
  },
  {
    symbol: "LT",
    name: "Larsen & Toubro",
    type: "EQUITY",
    basePrice: 3640,
    lotSize: 1,
  },
  {
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever",
    type: "EQUITY",
    basePrice: 2580,
    lotSize: 1,
  },
  {
    symbol: "MARUTI",
    name: "Maruti Suzuki",
    type: "EQUITY",
    basePrice: 12800,
    lotSize: 1,
  },
  {
    symbol: "ASIANPAINT",
    name: "Asian Paints",
    type: "EQUITY",
    basePrice: 3040,
    lotSize: 1,
  },
  {
    symbol: "AXISBANK",
    name: "Axis Bank",
    type: "EQUITY",
    basePrice: 1155,
    lotSize: 1,
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    type: "EQUITY",
    basePrice: 875,
    lotSize: 1,
  },
  {
    symbol: "ADANIPORTS",
    name: "Adani Ports",
    type: "EQUITY",
    basePrice: 1290,
    lotSize: 1,
  },
  // ETFs
  {
    symbol: "NIFTYBEES",
    name: "Nippon India ETF Nifty BeES",
    type: "ETF",
    basePrice: 248,
    lotSize: 1,
  },
  {
    symbol: "BANKBEES",
    name: "Nippon India ETF Bank BeES",
    type: "ETF",
    basePrice: 508,
    lotSize: 1,
  },
  {
    symbol: "GOLDBEES",
    name: "Nippon India ETF Gold BeES",
    type: "ETF",
    basePrice: 60,
    lotSize: 1,
  },
  {
    symbol: "SBINIFTY",
    name: "SBI ETF Nifty 50",
    type: "ETF",
    basePrice: 243,
    lotSize: 1,
  },
  {
    symbol: "HDFCNIFTY",
    name: "HDFC Nifty 50 ETF",
    type: "ETF",
    basePrice: 241,
    lotSize: 1,
  },
  {
    symbol: "CPSEETF",
    name: "CPSE ETF",
    type: "ETF",
    basePrice: 94,
    lotSize: 1,
  },
  // F&O
  {
    symbol: "NIFTY-FUT",
    name: "NIFTY Futures (Mar)",
    type: "FNO",
    basePrice: 22450,
    lotSize: 25,
  },
  {
    symbol: "BANKNIFTY-FUT",
    name: "Bank Nifty Futures (Mar)",
    type: "FNO",
    basePrice: 48200,
    lotSize: 15,
  },
  {
    symbol: "NIFTY-23000CE",
    name: "NIFTY 23000 Call Option",
    type: "FNO",
    basePrice: 180,
    lotSize: 25,
  },
  {
    symbol: "NIFTY-22500PE",
    name: "NIFTY 22500 Put Option",
    type: "FNO",
    basePrice: 95,
    lotSize: 25,
  },
  {
    symbol: "RELIANCE-FUT",
    name: "Reliance Futures (Mar)",
    type: "FNO",
    basePrice: 2875,
    lotSize: 250,
  },
];

export const ASSET_MAP = Object.fromEntries(ASSETS.map((a) => [a.symbol, a]));

// Simulate price fluctuations
const priceState: Record<string, number> = {};

export function getSimulatedPrices(): Record<string, number> {
  for (const asset of ASSETS) {
    if (!priceState[asset.symbol]) {
      priceState[asset.symbol] = asset.basePrice;
    }
    // Random walk: ±0.3% per tick
    const change = priceState[asset.symbol] * (Math.random() * 0.006 - 0.003);
    priceState[asset.symbol] = Math.max(
      1,
      +(priceState[asset.symbol] + change).toFixed(2),
    );
  }
  return { ...priceState };
}

export function getCurrentPrice(symbol: string): number {
  return priceState[symbol] || ASSET_MAP[symbol]?.basePrice || 0;
}

export function isMarketOpen(): boolean {
  const now = new Date();
  // IST = UTC+5:30
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const totalMinutes = utcHours * 60 + utcMinutes + 330; // IST minutes from midnight UTC
  const istMinutes = totalMinutes % (24 * 60);
  const open = 9 * 60 + 15; // 9:15 AM
  const close = 15 * 60 + 30; // 3:30 PM
  const istDay = (now.getUTCDay() + (totalMinutes >= 24 * 60 ? 1 : 0)) % 7;
  if (istDay === 0 || istDay === 6) return false;
  return istMinutes >= open && istMinutes <= close;
}
