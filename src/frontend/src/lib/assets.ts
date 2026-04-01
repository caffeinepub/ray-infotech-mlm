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
  // Metals & Mining
  {
    symbol: "HINDALCO",
    name: "Hindalco Industries",
    type: "EQUITY",
    basePrice: 680,
    lotSize: 1,
  },
  {
    symbol: "TATASTEEL",
    name: "Tata Steel",
    type: "EQUITY",
    basePrice: 162,
    lotSize: 1,
  },
  {
    symbol: "JSWSTEEL",
    name: "JSW Steel",
    type: "EQUITY",
    basePrice: 910,
    lotSize: 1,
  },
  {
    symbol: "COALINDIA",
    name: "Coal India",
    type: "EQUITY",
    basePrice: 480,
    lotSize: 1,
  },
  {
    symbol: "VEDL",
    name: "Vedanta Ltd",
    type: "EQUITY",
    basePrice: 460,
    lotSize: 1,
  },
  {
    symbol: "NMDC",
    name: "NMDC Ltd",
    type: "EQUITY",
    basePrice: 230,
    lotSize: 1,
  },
  {
    symbol: "HINDZINC",
    name: "Hindustan Zinc",
    type: "EQUITY",
    basePrice: 340,
    lotSize: 1,
  },
  // Pharma
  {
    symbol: "CIPLA",
    name: "Cipla Ltd",
    type: "EQUITY",
    basePrice: 1480,
    lotSize: 1,
  },
  {
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical",
    type: "EQUITY",
    basePrice: 1720,
    lotSize: 1,
  },
  {
    symbol: "DRREDDY",
    name: "Dr Reddy's Laboratories",
    type: "EQUITY",
    basePrice: 6200,
    lotSize: 1,
  },
  {
    symbol: "DIVISLAB",
    name: "Divi's Laboratories",
    type: "EQUITY",
    basePrice: 4900,
    lotSize: 1,
  },
  {
    symbol: "AUROPHARMA",
    name: "Aurobindo Pharma",
    type: "EQUITY",
    basePrice: 1180,
    lotSize: 1,
  },
  {
    symbol: "LUPIN",
    name: "Lupin Ltd",
    type: "EQUITY",
    basePrice: 1940,
    lotSize: 1,
  },
  {
    symbol: "BIOCON",
    name: "Biocon Ltd",
    type: "EQUITY",
    basePrice: 340,
    lotSize: 1,
  },
  {
    symbol: "ABBOTINDIA",
    name: "Abbott India",
    type: "EQUITY",
    basePrice: 28000,
    lotSize: 1,
  },
  {
    symbol: "RANBAXY",
    name: "Ranbaxy Laboratories",
    type: "EQUITY",
    basePrice: 560,
    lotSize: 1,
  },
  {
    symbol: "ALKEM",
    name: "Alkem Laboratories",
    type: "EQUITY",
    basePrice: 5600,
    lotSize: 1,
  },
  {
    symbol: "TORNTPHARM",
    name: "Torrent Pharmaceuticals",
    type: "EQUITY",
    basePrice: 3200,
    lotSize: 1,
  },
  {
    symbol: "GLENMARK",
    name: "Glenmark Pharmaceuticals",
    type: "EQUITY",
    basePrice: 1240,
    lotSize: 1,
  },
  // Energy & Oil
  {
    symbol: "ONGC",
    name: "Oil & Natural Gas Corp",
    type: "EQUITY",
    basePrice: 280,
    lotSize: 1,
  },
  {
    symbol: "BPCL",
    name: "Bharat Petroleum",
    type: "EQUITY",
    basePrice: 620,
    lotSize: 1,
  },
  {
    symbol: "IOC",
    name: "Indian Oil Corp",
    type: "EQUITY",
    basePrice: 170,
    lotSize: 1,
  },
  {
    symbol: "GAIL",
    name: "GAIL India",
    type: "EQUITY",
    basePrice: 215,
    lotSize: 1,
  },
  {
    symbol: "POWERGRID",
    name: "Power Grid Corp",
    type: "EQUITY",
    basePrice: 340,
    lotSize: 1,
  },
  {
    symbol: "NTPC",
    name: "NTPC Ltd",
    type: "EQUITY",
    basePrice: 390,
    lotSize: 1,
  },
  {
    symbol: "ADANIENT",
    name: "Adani Enterprises",
    type: "EQUITY",
    basePrice: 2950,
    lotSize: 1,
  },
  {
    symbol: "ADANIGREEN",
    name: "Adani Green Energy",
    type: "EQUITY",
    basePrice: 1640,
    lotSize: 1,
  },
  // Auto
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors",
    type: "EQUITY",
    basePrice: 960,
    lotSize: 1,
  },
  {
    symbol: "M&M",
    name: "Mahindra & Mahindra",
    type: "EQUITY",
    basePrice: 1900,
    lotSize: 1,
  },
  {
    symbol: "BAJAJ-AUTO",
    name: "Bajaj Auto",
    type: "EQUITY",
    basePrice: 9800,
    lotSize: 1,
  },
  {
    symbol: "HEROMOTOCO",
    name: "Hero MotoCorp",
    type: "EQUITY",
    basePrice: 5400,
    lotSize: 1,
  },
  {
    symbol: "EICHERMOT",
    name: "Eicher Motors",
    type: "EQUITY",
    basePrice: 4700,
    lotSize: 1,
  },
  {
    symbol: "ASHOKLEY",
    name: "Ashok Leyland",
    type: "EQUITY",
    basePrice: 220,
    lotSize: 1,
  },
  {
    symbol: "TVSMOTOR",
    name: "TVS Motor",
    type: "EQUITY",
    basePrice: 2400,
    lotSize: 1,
  },
  // Banking & Finance
  {
    symbol: "INDUSINDBK",
    name: "IndusInd Bank",
    type: "EQUITY",
    basePrice: 1560,
    lotSize: 1,
  },
  {
    symbol: "BANDHANBNK",
    name: "Bandhan Bank",
    type: "EQUITY",
    basePrice: 220,
    lotSize: 1,
  },
  {
    symbol: "PNB",
    name: "Punjab National Bank",
    type: "EQUITY",
    basePrice: 130,
    lotSize: 1,
  },
  {
    symbol: "BANKBARODA",
    name: "Bank of Baroda",
    type: "EQUITY",
    basePrice: 260,
    lotSize: 1,
  },
  {
    symbol: "CANBK",
    name: "Canara Bank",
    type: "EQUITY",
    basePrice: 115,
    lotSize: 1,
  },
  {
    symbol: "HDFCLIFE",
    name: "HDFC Life Insurance",
    type: "EQUITY",
    basePrice: 720,
    lotSize: 1,
  },
  {
    symbol: "SBILIFE",
    name: "SBI Life Insurance",
    type: "EQUITY",
    basePrice: 1700,
    lotSize: 1,
  },
  {
    symbol: "BAJAJFINSV",
    name: "Bajaj Finserv",
    type: "EQUITY",
    basePrice: 1740,
    lotSize: 1,
  },
  {
    symbol: "MUTHOOTFIN",
    name: "Muthoot Finance",
    type: "EQUITY",
    basePrice: 1900,
    lotSize: 1,
  },
  // IT & Tech
  {
    symbol: "HCLTECH",
    name: "HCL Technologies",
    type: "EQUITY",
    basePrice: 1860,
    lotSize: 1,
  },
  {
    symbol: "TECHM",
    name: "Tech Mahindra",
    type: "EQUITY",
    basePrice: 1640,
    lotSize: 1,
  },
  {
    symbol: "MPHASIS",
    name: "Mphasis Ltd",
    type: "EQUITY",
    basePrice: 2900,
    lotSize: 1,
  },
  {
    symbol: "LTIM",
    name: "LTIMindtree",
    type: "EQUITY",
    basePrice: 5800,
    lotSize: 1,
  },
  {
    symbol: "PERSISTENT",
    name: "Persistent Systems",
    type: "EQUITY",
    basePrice: 5600,
    lotSize: 1,
  },
  {
    symbol: "COFORGE",
    name: "Coforge Ltd",
    type: "EQUITY",
    basePrice: 8200,
    lotSize: 1,
  },
  // FMCG & Consumer
  {
    symbol: "ITC",
    name: "ITC Ltd",
    type: "EQUITY",
    basePrice: 475,
    lotSize: 1,
  },
  {
    symbol: "NESTLEIND",
    name: "Nestle India",
    type: "EQUITY",
    basePrice: 24800,
    lotSize: 1,
  },
  {
    symbol: "BRITANNIA",
    name: "Britannia Industries",
    type: "EQUITY",
    basePrice: 5600,
    lotSize: 1,
  },
  {
    symbol: "DABUR",
    name: "Dabur India",
    type: "EQUITY",
    basePrice: 580,
    lotSize: 1,
  },
  {
    symbol: "MARICO",
    name: "Marico Ltd",
    type: "EQUITY",
    basePrice: 620,
    lotSize: 1,
  },
  {
    symbol: "GODREJCP",
    name: "Godrej Consumer Products",
    type: "EQUITY",
    basePrice: 1260,
    lotSize: 1,
  },
  {
    symbol: "COLPAL",
    name: "Colgate-Palmolive India",
    type: "EQUITY",
    basePrice: 2900,
    lotSize: 1,
  },
  {
    symbol: "EMAMILTD",
    name: "Emami Ltd",
    type: "EQUITY",
    basePrice: 740,
    lotSize: 1,
  },
  // Infra & Construction
  {
    symbol: "ULTRACEMCO",
    name: "UltraTech Cement",
    type: "EQUITY",
    basePrice: 10800,
    lotSize: 1,
  },
  {
    symbol: "GRASIM",
    name: "Grasim Industries",
    type: "EQUITY",
    basePrice: 2650,
    lotSize: 1,
  },
  {
    symbol: "AMBUJACEM",
    name: "Ambuja Cements",
    type: "EQUITY",
    basePrice: 640,
    lotSize: 1,
  },
  {
    symbol: "ACC",
    name: "ACC Ltd",
    type: "EQUITY",
    basePrice: 2450,
    lotSize: 1,
  },
  {
    symbol: "DLF",
    name: "DLF Ltd",
    type: "EQUITY",
    basePrice: 840,
    lotSize: 1,
  },
  {
    symbol: "GODREJPROP",
    name: "Godrej Properties",
    type: "EQUITY",
    basePrice: 2700,
    lotSize: 1,
  },
  {
    symbol: "OBEROIRLTY",
    name: "Oberoi Realty",
    type: "EQUITY",
    basePrice: 1880,
    lotSize: 1,
  },
  // Telecom & Media
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel",
    type: "EQUITY",
    basePrice: 1640,
    lotSize: 1,
  },
  {
    symbol: "IDEA",
    name: "Vodafone Idea",
    type: "EQUITY",
    basePrice: 14,
    lotSize: 1,
  },
  {
    symbol: "ZOMATO",
    name: "Zomato Ltd",
    type: "EQUITY",
    basePrice: 240,
    lotSize: 1,
  },
  {
    symbol: "NYKAA",
    name: "FSN E-Commerce (Nykaa)",
    type: "EQUITY",
    basePrice: 180,
    lotSize: 1,
  },
  {
    symbol: "PAYTM",
    name: "One97 Communications (Paytm)",
    type: "EQUITY",
    basePrice: 540,
    lotSize: 1,
  },
  {
    symbol: "POLICYBZR",
    name: "PB Fintech (Policybazaar)",
    type: "EQUITY",
    basePrice: 1560,
    lotSize: 1,
  },
  // Tata Group
  {
    symbol: "TATACHEM",
    name: "Tata Chemicals",
    type: "EQUITY",
    basePrice: 1120,
    lotSize: 1,
  },
  {
    symbol: "TATACONSUM",
    name: "Tata Consumer Products",
    type: "EQUITY",
    basePrice: 1180,
    lotSize: 1,
  },
  {
    symbol: "TATAPOWER",
    name: "Tata Power",
    type: "EQUITY",
    basePrice: 440,
    lotSize: 1,
  },
  {
    symbol: "TITAN",
    name: "Titan Company",
    type: "EQUITY",
    basePrice: 3600,
    lotSize: 1,
  },
  // Others
  {
    symbol: "DMART",
    name: "Avenue Supermarts (D-Mart)",
    type: "EQUITY",
    basePrice: 4800,
    lotSize: 1,
  },
  {
    symbol: "PIDILITIND",
    name: "Pidilite Industries",
    type: "EQUITY",
    basePrice: 3200,
    lotSize: 1,
  },
  {
    symbol: "HAVELLS",
    name: "Havells India",
    type: "EQUITY",
    basePrice: 1760,
    lotSize: 1,
  },
  {
    symbol: "SIEMENS",
    name: "Siemens India",
    type: "EQUITY",
    basePrice: 7400,
    lotSize: 1,
  },
  {
    symbol: "ABB",
    name: "ABB India",
    type: "EQUITY",
    basePrice: 8200,
    lotSize: 1,
  },
  {
    symbol: "BOSCHLTD",
    name: "Bosch Ltd",
    type: "EQUITY",
    basePrice: 36000,
    lotSize: 1,
  },
  {
    symbol: "3MINDIA",
    name: "3M India",
    type: "EQUITY",
    basePrice: 36000,
    lotSize: 1,
  },
  {
    symbol: "PAGEIND",
    name: "Page Industries",
    type: "EQUITY",
    basePrice: 44000,
    lotSize: 1,
  },
  {
    symbol: "MCDOWELL-N",
    name: "United Spirits (McDowell's)",
    type: "EQUITY",
    basePrice: 1140,
    lotSize: 1,
  },
  {
    symbol: "UBL",
    name: "United Breweries",
    type: "EQUITY",
    basePrice: 1920,
    lotSize: 1,
  },
  {
    symbol: "RECLTD",
    name: "REC Ltd",
    type: "EQUITY",
    basePrice: 560,
    lotSize: 1,
  },
  {
    symbol: "PFC",
    name: "Power Finance Corp",
    type: "EQUITY",
    basePrice: 490,
    lotSize: 1,
  },
  {
    symbol: "IRFC",
    name: "Indian Railway Finance Corp",
    type: "EQUITY",
    basePrice: 220,
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
  {
    symbol: "JUNIORBEES",
    name: "Nippon India ETF Junior BeES",
    type: "ETF",
    basePrice: 720,
    lotSize: 1,
  },
  {
    symbol: "MOM100",
    name: "Motilal Oswal Midcap 100 ETF",
    type: "ETF",
    basePrice: 48,
    lotSize: 1,
  },
  {
    symbol: "SILVERBEES",
    name: "Nippon India Silver ETF",
    type: "ETF",
    basePrice: 92,
    lotSize: 1,
  },
  {
    symbol: "ITBEES",
    name: "Nippon India ETF IT BeES",
    type: "ETF",
    basePrice: 38,
    lotSize: 1,
  },
  {
    symbol: "PHARMABEES",
    name: "Nippon India ETF Pharma BeES",
    type: "ETF",
    basePrice: 22,
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
  {
    symbol: "BANKNIFTY-45000CE",
    name: "BankNifty 45000 Call Option",
    type: "FNO",
    basePrice: 320,
    lotSize: 15,
  },
  {
    symbol: "BANKNIFTY-44000PE",
    name: "BankNifty 44000 Put Option",
    type: "FNO",
    basePrice: 210,
    lotSize: 15,
  },
  {
    symbol: "TCS-FUT",
    name: "TCS Futures (Mar)",
    type: "FNO",
    basePrice: 3925,
    lotSize: 150,
  },
  {
    symbol: "INFY-FUT",
    name: "Infosys Futures (Mar)",
    type: "FNO",
    basePrice: 1742,
    lotSize: 300,
  },
];

export const ASSET_MAP = Object.fromEntries(ASSETS.map((a) => [a.symbol, a]));

// Simulate price fluctuations
const priceState: Record<string, number> = {};

export function getSimulatedPrices(): Record<string, number> {
  if (!isMarketOpen()) {
    // Market closed — return frozen prices without updating
    for (const asset of ASSETS) {
      if (!priceState[asset.symbol]) {
        priceState[asset.symbol] = asset.basePrice;
      }
    }
    return { ...priceState };
  }
  for (const asset of ASSETS) {
    if (!priceState[asset.symbol]) {
      priceState[asset.symbol] = asset.basePrice;
    }
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
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const totalMinutes = utcHours * 60 + utcMinutes + 330;
  const istMinutes = totalMinutes % (24 * 60);
  const open = 9 * 60 + 15;
  const close = 15 * 60 + 30;
  const istDay = (now.getUTCDay() + (totalMinutes >= 24 * 60 ? 1 : 0)) % 7;
  if (istDay === 0 || istDay === 6) return false;
  return istMinutes >= open && istMinutes <= close;
}

// TradingView symbol mapping
const TV_SYMBOL_MAP: Record<string, string> = {
  RELIANCE: "RELIANCE",
  TCS: "TCS",
  INFY: "INFY",
  HDFCBANK: "HDFCBANK",
  ICICIBANK: "ICICIBANK",
  WIPRO: "WIPRO",
  BAJFINANCE: "BAJFINANCE",
  KOTAKBANK: "KOTAKBANK",
  LT: "LT",
  HINDUNILVR: "HINDUNILVR",
  MARUTI: "MARUTI",
  ASIANPAINT: "ASIANPAINT",
  AXISBANK: "AXISBANK",
  SBIN: "SBIN",
  ADANIPORTS: "ADANIPORTS",
  HINDALCO: "HINDALCO",
  TATASTEEL: "TATASTEEL",
  JSWSTEEL: "JSWSTEEL",
  COALINDIA: "COALINDIA",
  VEDL: "VEDL",
  CIPLA: "CIPLA",
  SUNPHARMA: "SUNPHARMA",
  DRREDDY: "DRREDDY",
  DIVISLAB: "DIVISLAB",
  AUROPHARMA: "AUROPHARMA",
  LUPIN: "LUPIN",
  BIOCON: "BIOCON",
  ONGC: "ONGC",
  BPCL: "BPCL",
  IOC: "IOC",
  GAIL: "GAIL",
  POWERGRID: "POWERGRID",
  NTPC: "NTPC",
  ADANIENT: "ADANIENT",
  TATAMOTORS: "TATAMOTORS",
  HEROMOTOCO: "HEROMOTOCO",
  HCLTECH: "HCLTECH",
  TECHM: "TECHM",
  ITC: "ITC",
  NESTLEIND: "NESTLEIND",
  BRITANNIA: "BRITANNIA",
  DABUR: "DABUR",
  ULTRACEMCO: "ULTRACEMCO",
  GRASIM: "GRASIM",
  BHARTIARTL: "BHARTIARTL",
  TITAN: "TITAN",
  DMART: "DMART",
  ZOMATO: "ZOMATO",
  TATAPOWER: "TATAPOWER",
};

export function getTradingViewSymbol(symbol: string): string {
  return `NSE:${TV_SYMBOL_MAP[symbol] || "NIFTY50"}`;
}

// Order book generation
export interface OrderLevel {
  price: number;
  qty: number;
  orders: number;
}

export interface OrderBook {
  bids: OrderLevel[];
  asks: OrderLevel[];
}

export function generateOrderBook(
  _symbol: string,
  currentPrice: number,
): OrderBook {
  const spread = currentPrice * 0.0005;
  const bids: OrderLevel[] = [];
  const asks: OrderLevel[] = [];

  for (let i = 0; i < 8; i++) {
    const bidPrice = currentPrice - spread - i * spread * 0.8;
    const askPrice = currentPrice + spread + i * spread * 0.8;
    const baseQty = Math.floor(Math.random() * 500) + 50;
    const qtyVariance = Math.floor(Math.random() * 200);

    bids.push({
      price: +bidPrice.toFixed(2),
      qty: baseQty + qtyVariance,
      orders: Math.floor(Math.random() * 20) + 1,
    });
    asks.push({
      price: +askPrice.toFixed(2),
      qty: baseQty + Math.floor(Math.random() * 200),
      orders: Math.floor(Math.random() * 20) + 1,
    });
  }

  return { bids, asks };
}

// News per symbol
export interface NewsItem {
  headline: string;
  source: string;
  time: string;
  summary: string;
}

const NEWS_DB: Record<string, NewsItem[]> = {
  RELIANCE: [
    {
      headline: "Reliance Jio announces 5G rollout in 50 new cities",
      source: "Economic Times",
      time: "1 hour ago",
      summary:
        "Jio accelerates its 5G expansion with coverage now reaching tier-2 cities across Maharashtra and UP.",
    },
    {
      headline: "RIL Q3 results: Net profit rises 12% YoY to ₹18,540 crore",
      source: "MoneyControl",
      time: "3 hours ago",
      summary:
        "Strong retail and digital services segment drove earnings, offsetting softer O2C margins.",
    },
    {
      headline: "Reliance Retail acquires logistics startup for ₹1,200 crore",
      source: "Business Standard",
      time: "6 hours ago",
      summary:
        "The acquisition will bolster last-mile delivery capabilities for its e-commerce arm.",
    },
    {
      headline:
        "Analysts raise Reliance target price to ₹3,200 on green energy bets",
      source: "NDTV Profit",
      time: "1 day ago",
      summary:
        "Multiple brokerages upgraded their outlook citing accelerating clean energy investments.",
    },
  ],
  TCS: [
    {
      headline: "TCS wins $2.1B deal with European financial services giant",
      source: "Economic Times",
      time: "2 hours ago",
      summary:
        "The multi-year IT transformation deal is the largest in TCS history and covers cloud migration and AI services.",
    },
    {
      headline:
        "TCS to hire 40,000 freshers in FY25, attrition stable at 12.5%",
      source: "Business Standard",
      time: "5 hours ago",
      summary:
        "Management reiterated confidence in demand recovery in BFSI and retail verticals.",
    },
    {
      headline: "TCS Q3 revenue grows 4.5% in constant currency terms",
      source: "MoneyControl",
      time: "8 hours ago",
      summary:
        "North America showed signs of revival while Europe remained muted.",
    },
  ],
  INFY: [
    {
      headline: "Infosys raises FY25 revenue growth guidance to 4.5–5%",
      source: "Economic Times",
      time: "1 hour ago",
      summary:
        "Improved deal pipeline and large deal wins prompted a guidance upgrade in Q3 earnings call.",
    },
    {
      headline:
        "Infosys launches AI-powered platform for enterprise automation",
      source: "MoneyControl",
      time: "4 hours ago",
      summary:
        "Topaz, its AI platform, now integrates with over 200 enterprise applications.",
    },
  ],
  HDFCBANK: [
    {
      headline: "HDFC Bank loan growth moderates; NIM under pressure in Q3",
      source: "Economic Times",
      time: "2 hours ago",
      summary:
        "Post-merger integration continues to weigh on margins even as deposit mobilisation picks up.",
    },
    {
      headline:
        "HDFC Bank launches instant personal loan product via mobile app",
      source: "MoneyControl",
      time: "5 hours ago",
      summary:
        "Customers can now access pre-approved personal loans up to ₹50 lakh in under 2 minutes.",
    },
  ],
  SBIN: [
    {
      headline: "SBI net profit crosses ₹16,000 crore in Q3, up 35% YoY",
      source: "Economic Times",
      time: "1 hour ago",
      summary:
        "Robust loan growth and lower provisions drove record quarterly earnings for the public sector lender.",
    },
    {
      headline:
        "SBI announces new home loan scheme at 8.4% for first-time buyers",
      source: "MoneyControl",
      time: "4 hours ago",
      summary:
        "The scheme targets affordable housing segment and is available till March 31.",
    },
  ],
  HINDALCO: [
    {
      headline: "Hindalco Q3 profit up 72% on strong Novelis performance",
      source: "Economic Times",
      time: "2 hours ago",
      summary:
        "The US subsidiary Novelis reported record EBITDA, driving consolidated profit for Hindalco.",
    },
    {
      headline:
        "Hindalco to invest ₹5,000 crore in aluminium expansion in Odisha",
      source: "Business Standard",
      time: "5 hours ago",
      summary:
        "The greenfield project will add 3.5 lakh tonnes of capacity, making Hindalco the largest aluminium producer in Asia.",
    },
    {
      headline:
        "Hindalco wins large green aluminium supply deal with European automaker",
      source: "MoneyControl",
      time: "1 day ago",
      summary:
        "The deal is part of growing global demand for low-carbon aluminium for EV manufacturing.",
    },
  ],
  CIPLA: [
    {
      headline:
        "Cipla receives USFDA approval for generic Revlimid; stock jumps 6%",
      source: "Economic Times",
      time: "1 hour ago",
      summary:
        "The approval for lenalidomide capsules opens a large US market opportunity estimated at $800M annually.",
    },
    {
      headline: "Cipla Q3 net profit grows 28% driven by US and India business",
      source: "MoneyControl",
      time: "4 hours ago",
      summary:
        "India prescription business and specialty products in the US drove growth above analyst estimates.",
    },
    {
      headline:
        "Cipla launches affordable inhaler in rural India under PM Swasthya scheme",
      source: "Business Standard",
      time: "8 hours ago",
      summary:
        "The initiative targets COPD and asthma patients in tier-3 and tier-4 cities at 60% lower cost.",
    },
  ],
  SUNPHARMA: [
    {
      headline:
        "Sun Pharma's Ilumya sees strong US uptake; Q3 specialty revenue up 40%",
      source: "Economic Times",
      time: "2 hours ago",
      summary:
        "Specialty products now account for 18% of US revenues as dermatology pipeline matures.",
    },
    {
      headline: "Sun Pharma acquires US dermatology brand for $400M",
      source: "Business Standard",
      time: "6 hours ago",
      summary:
        "The acquisition strengthens Sun's global leadership in dermatology with an established commercial product.",
    },
  ],
  TATASTEEL: [
    {
      headline:
        "Tata Steel UK operations turn profitable for the first time in five years",
      source: "Economic Times",
      time: "3 hours ago",
      summary:
        "Cost rationalisation and government support for green transition contributed to the turnaround.",
    },
    {
      headline: "Tata Steel India capacity to reach 40 MTPA by FY28",
      source: "MoneyControl",
      time: "7 hours ago",
      summary:
        "The company is fast-tracking expansion at Kalinganagar to meet domestic infrastructure demand.",
    },
  ],
  ONGC: [
    {
      headline: "ONGC discovers new oil reserves in Krishna-Godavari basin",
      source: "Economic Times",
      time: "2 hours ago",
      summary:
        "The discovery could add 150 million barrels of recoverable reserves, boosting domestic production outlook.",
    },
    {
      headline: "ONGC Q3 profit rises 15% as oil prices stabilise",
      source: "Business Standard",
      time: "5 hours ago",
      summary:
        "Higher crude realisations and improved production from older fields supported earnings growth.",
    },
  ],
  BHARTIARTL: [
    {
      headline:
        "Airtel adds 4.2 million subscribers in January, leads 5G adoption",
      source: "Economic Times",
      time: "1 hour ago",
      summary:
        "Airtel now has 75 million 5G users on its network with coverage in 5,000+ cities and towns.",
    },
    {
      headline:
        "Airtel Business wins large enterprise cloud deal worth ₹1,800 crore",
      source: "MoneyControl",
      time: "4 hours ago",
      summary:
        "The 5-year deal covers managed cloud, cybersecurity, and IoT services for a PSU bank.",
    },
  ],
  ZOMATO: [
    {
      headline:
        "Zomato turns profitable for 4th consecutive quarter; Q3 PAT ₹138 crore",
      source: "Economic Times",
      time: "2 hours ago",
      summary:
        "Quick commerce via Blinkit continues to grow faster than core food delivery business.",
    },
    {
      headline:
        "Zomato's Blinkit hits 500 dark store milestone ahead of target",
      source: "MoneyControl",
      time: "6 hours ago",
      summary:
        "Strong execution in quick commerce positions Blinkit as the market leader in the 10-minute delivery segment.",
    },
  ],
};

const GENERIC_NEWS: NewsItem[] = [
  {
    headline: "Indian markets close higher; Sensex up 312 points",
    source: "Economic Times",
    time: "3 hours ago",
    summary:
      "Broad-based buying in banking, IT, and pharma lifted indices ahead of RBI policy decision next week.",
  },
  {
    headline: "FIIs turn net buyers; pour ₹4,200 crore into equities",
    source: "MoneyControl",
    time: "5 hours ago",
    summary:
      "Softening US bond yields and stable rupee boosted foreign investor sentiment toward Indian equities.",
  },
  {
    headline: "India GDP growth forecast raised to 7.2% by IMF for FY25",
    source: "Business Standard",
    time: "8 hours ago",
    summary:
      "Strong domestic consumption and public capex spending underpin revised growth outlook.",
  },
  {
    headline:
      "RBI holds repo rate steady at 6.5%; signals rate cuts possible in H1 FY26",
    source: "NDTV Profit",
    time: "1 day ago",
    summary:
      "The central bank maintained its cautious stance while acknowledging improving inflation trajectory.",
  },
  {
    headline: "SEBI introduces T+0 settlement for top 200 stocks from April",
    source: "Livemint",
    time: "2 days ago",
    summary:
      "Same-day settlement will reduce counterparty risk and improve liquidity for large-cap equities.",
  },
];

export function getNewsForSymbol(symbol: string): NewsItem[] {
  return NEWS_DB[symbol] || GENERIC_NEWS;
}
