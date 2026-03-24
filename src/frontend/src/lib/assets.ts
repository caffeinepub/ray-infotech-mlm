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
    {
      headline:
        "TCS recognised as a Leader in Gartner Magic Quadrant for IT Services",
      source: "NDTV Profit",
      time: "1 day ago",
      summary:
        "The company retained its leader position for the 12th consecutive year.",
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
    {
      headline:
        "Infosys signs 10-year deal with UK government worth £1 billion",
      source: "Business Standard",
      time: "7 hours ago",
      summary:
        "The contract covers digital transformation of multiple public sector agencies.",
    },
    {
      headline: "Infosys buyback of ₹9,300 crore opens next week",
      source: "NDTV Profit",
      time: "1 day ago",
      summary:
        "The buyback price is set at ₹1,850 per share, a 6% premium to current market price.",
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
    {
      headline:
        "RBI gives HDFC Bank clean chit on digital banking restrictions",
      source: "Business Standard",
      time: "9 hours ago",
      summary:
        "The regulator lifted all restrictions imposed in 2020 on new digital products and credit card issuance.",
    },
    {
      headline: "HDFC Bank overseas bond issuance of $750M oversubscribed 3x",
      source: "NDTV Profit",
      time: "1 day ago",
      summary:
        "Strong investor demand reflects confidence in the bank's creditworthiness post-HDFC merger.",
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
    {
      headline: "SBI Q3 gross NPA declines to 2.42%, best in a decade",
      source: "Business Standard",
      time: "7 hours ago",
      summary:
        "Improved credit monitoring and recovery processes drove the asset quality improvement.",
    },
    {
      headline: "Government may divest 5% stake in SBI through OFS route",
      source: "NDTV Profit",
      time: "2 days ago",
      summary:
        "The proposed divestment would raise approximately ₹28,000 crore for the government.",
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
