import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ASSET_MAP,
  generateOrderBook,
  getNewsForSymbol,
  getSimulatedPrices,
  isMarketOpen,
} from "../lib/assets";
import type { NewsItem, OrderBook } from "../lib/assets";

const ETF_TRACKING_INDEX: Record<string, string> = {
  NIFTYBEES: "NIFTY 50",
  BANKBEES: "BANK NIFTY",
  GOLDBEES: "Gold (MCX)",
  SBINIFTY: "NIFTY 50",
  HDFCNIFTY: "NIFTY 50",
  CPSEETF: "CPSE Index",
};

const ETF_AUM: Record<string, string> = {
  NIFTYBEES: "₹18,240 Cr",
  BANKBEES: "₹7,890 Cr",
  GOLDBEES: "₹9,340 Cr",
  SBINIFTY: "₹5,620 Cr",
  HDFCNIFTY: "₹4,380 Cr",
  CPSEETF: "₹2,150 Cr",
};

interface CandleData {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

function generateInitialCandles(basePrice: number): CandleData[] {
  const candles: CandleData[] = [];
  let price = basePrice * (1 + (Math.random() - 0.5) * 0.02);
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const open = price;
    const change = price * (Math.random() * 0.008 - 0.004);
    const close = Math.max(1, +(price + change).toFixed(2));
    const high = Math.max(open, close) * (1 + Math.random() * 0.003);
    const low = Math.min(open, close) * (1 - Math.random() * 0.003);
    const t = new Date(now - i * 60 * 1000);
    candles.push({
      time: `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`,
      open: +open.toFixed(2),
      close: +close.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      volume: Math.floor(Math.random() * 50000) + 5000,
    });
    price = close;
  }
  return candles;
}

function ChartTooltip({
  active,
  payload,
  label,
}: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-foreground">
        ₹{val.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

function OrderBookColumn({
  title,
  levels,
  side,
  maxQty,
}: {
  title: string;
  levels: { price: number; qty: number; orders: number }[];
  side: "bid" | "ask";
  maxQty: number;
}) {
  const isBid = side === "bid";
  return (
    <div className="flex-1 min-w-0">
      <div
        className={`text-center text-xs font-bold py-2 rounded-t-lg ${
          isBid
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        {title}
      </div>
      <div className="text-[10px] grid grid-cols-3 px-2 py-1 text-muted-foreground font-medium border-b border-border">
        <span>Price</span>
        <span className="text-center">Qty</span>
        <span className="text-right">Orders</span>
      </div>
      {levels.map((level, i) => (
        <div
          key={`${level.price}-${i}`}
          className="relative grid grid-cols-3 px-2 py-1 text-[11px] hover:bg-muted/30 transition-colors"
          data-ocid={`etf.${side}.item.${i + 1}`}
        >
          <div
            className={`absolute inset-y-0 ${isBid ? "right-0" : "left-0"} opacity-10 ${isBid ? "bg-green-400" : "bg-red-400"}`}
            style={{ width: `${(level.qty / maxQty) * 100}%` }}
          />
          <span
            className={`font-semibold relative z-10 ${isBid ? "text-green-400" : "text-red-400"}`}
          >
            ₹{level.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
          <span className="text-center text-muted-foreground relative z-10">
            {level.qty.toLocaleString("en-IN")}
          </span>
          <span className="text-right text-muted-foreground relative z-10">
            {level.orders}
          </span>
        </div>
      ))}
    </div>
  );
}

function NewsCard({ item, idx }: { item: NewsItem; idx: number }) {
  return (
    <div
      className="p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
      data-ocid={`etf.news.item.${idx + 1}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug mb-1">
            {item.headline}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {item.summary}
          </p>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {item.source}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          {item.time}
        </span>
      </div>
    </div>
  );
}

export default function ETFDetailPage() {
  const params = useParams({ from: "/etf/$symbol" });
  const navigate = useNavigate();
  const symbol = params.symbol.toUpperCase();
  const asset = ASSET_MAP[symbol];

  const [prices, setPrices] =
    useState<Record<string, number>>(getSimulatedPrices);
  const [candles, setCandles] = useState<CandleData[]>(() =>
    generateInitialCandles(asset?.basePrice || 250),
  );
  const [orderBook, setOrderBook] = useState<OrderBook>(() =>
    generateOrderBook(symbol, asset?.basePrice || 250),
  );
  const [dayOpen] = useState(() => {
    const base = asset?.basePrice || 250;
    return +(base * (1 + (Math.random() - 0.5) * 0.015)).toFixed(2);
  });
  const [dayHigh, setDayHigh] = useState(() => {
    const base = asset?.basePrice || 250;
    return +(base * (1 + Math.random() * 0.02)).toFixed(2);
  });
  const [dayLow, setDayLow] = useState(() => {
    const base = asset?.basePrice || 250;
    return +(base * (1 - Math.random() * 0.02)).toFixed(2);
  });
  const [volume] = useState(() => Math.floor(Math.random() * 2000000) + 200000);
  const marketOpen = isMarketOpen();
  const chartInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const bookInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!asset) return;
    chartInterval.current = setInterval(() => {
      const newPrices = getSimulatedPrices();
      setPrices({ ...newPrices });
      const curPrice = newPrices[symbol] || asset.basePrice;
      setDayHigh((prev) => Math.max(prev, curPrice));
      setDayLow((prev) => Math.min(prev, curPrice));
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const updated = [...prev.slice(1)];
        const now = new Date();
        updated.push({
          time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
          open: last.close,
          close: curPrice,
          high: Math.max(last.close, curPrice) * (1 + Math.random() * 0.002),
          low: Math.min(last.close, curPrice) * (1 - Math.random() * 0.002),
          volume: Math.floor(Math.random() * 50000) + 5000,
        });
        return updated;
      });
    }, 3000);
    bookInterval.current = setInterval(() => {
      const latestPrices = getSimulatedPrices();
      const curPrice = latestPrices[symbol] || asset.basePrice;
      setOrderBook(generateOrderBook(symbol, curPrice));
    }, 2000);
    return () => {
      if (chartInterval.current) clearInterval(chartInterval.current);
      if (bookInterval.current) clearInterval(bookInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, symbol]);

  if (!asset) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">
          ETF &ldquo;{symbol}&rdquo; not found.
        </p>
        <Button className="mt-4" onClick={() => navigate({ to: "/trade" })}>
          Back to Trade
        </Button>
      </div>
    );
  }

  const currentPrice = prices[symbol] || asset.basePrice;
  const priceChange = currentPrice - dayOpen;
  const pctChange = (priceChange / dayOpen) * 100;
  const isPositive = priceChange >= 0;
  const trackingIndex = ETF_TRACKING_INDEX[symbol] || "NSE Index";
  const aum = ETF_AUM[symbol] || "₹1,000 Cr";

  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const news = getNewsForSymbol(symbol);
  const maxBidQty = Math.max(...orderBook.bids.map((b) => b.qty), 1);
  const maxAskQty = Math.max(...orderBook.asks.map((a) => a.qty), 1);
  const chartData = candles.map((c) => ({ time: c.time, price: c.close }));
  const chartMin = Math.min(...chartData.map((d) => d.price)) * 0.999;
  const chartMax = Math.max(...chartData.map((d) => d.price)) * 1.001;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28 lg:pb-6">
      <div className="flex items-start gap-3 mb-6">
        <button
          type="button"
          data-ocid="etf.back.button"
          onClick={() => navigate({ to: "/trade" })}
          className="mt-1 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Back to Trade"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{symbol}</h1>
            <Badge variant="outline" className="text-xs">
              ETF
            </Badge>
            <Badge className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/40">
              Tracks: {trackingIndex}
            </Badge>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                marketOpen
                  ? "bg-green-500/15 text-green-400"
                  : "bg-red-500/15 text-red-400"
              }`}
              data-ocid="etf.market_status.panel"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${marketOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
              />
              {marketOpen ? "Market Open" : "Market Closed"}
            </div>
          </div>
          <p className="text-sm text-muted-foreground truncate">{asset.name}</p>
        </div>
        <div className="text-right flex-shrink-0" data-ocid="etf.price.panel">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
            NAV
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {fmt(currentPrice)}
          </div>
          <div
            className={`flex items-center justify-end gap-1 text-sm font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {isPositive ? "+" : ""}
            {fmt(priceChange)} ({pctChange.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6"
        data-ocid="etf.stats.panel"
      >
        {[
          { label: "NAV", value: fmt(currentPrice) },
          { label: "Day Open", value: fmt(dayOpen) },
          {
            label: "Day High",
            value: fmt(dayHigh),
            highlight: "text-green-400",
          },
          { label: "Day Low", value: fmt(dayLow), highlight: "text-red-400" },
          { label: "Volume", value: volume.toLocaleString("en-IN") },
          { label: "AUM", value: aum },
        ].map((stat) => (
          <Card key={stat.label} className="py-0">
            <CardContent className="px-4 py-3">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p
                className={`text-base font-bold tabular-nums ${stat.highlight ?? ""}`}
              >
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6" data-ocid="etf.chart.panel">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Live NAV Chart (1-min)
            </CardTitle>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Simulated · updates every 3s
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                domain={[chartMin, chartMax]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `₹${v.toFixed(0)}`}
                width={52}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                fill="url(#navGradient)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="mb-6" data-ocid="etf.tradingview.panel">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              TradingView Live Chart
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              Real NSE Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden rounded-b-xl">
          <iframe
            title={`TradingView chart for ${symbol}`}
            src={`https://s.tradingview.com/widgetembed/?symbol=NSE:${symbol}&interval=5&theme=dark&style=1&locale=en&hide_top_toolbar=0&hide_side_toolbar=0&allow_symbol_change=0`}
            style={{
              width: "100%",
              height: 400,
              border: "none",
              display: "block",
            }}
            allowFullScreen
          />
        </CardContent>
      </Card>

      <Card className="mb-6" data-ocid="etf.orderbook.panel">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Order Book</CardTitle>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Simulated · updates every 2s
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-4">
          <div className="text-center text-xs text-muted-foreground mb-3">
            <span className="bg-muted/50 px-3 py-1 rounded-full">
              Spread:{" "}
              <span className="text-foreground font-semibold">
                ₹
                {(
                  (orderBook.asks[0]?.price || 0) -
                  (orderBook.bids[0]?.price || 0)
                ).toFixed(2)}
              </span>
            </span>
          </div>
          <div className="flex gap-2">
            <OrderBookColumn
              title="BUYERS (Bids)"
              levels={orderBook.bids}
              side="bid"
              maxQty={maxBidQty}
            />
            <div className="w-px bg-border flex-shrink-0" />
            <OrderBookColumn
              title="SELLERS (Asks)"
              levels={orderBook.asks}
              side="ask"
              maxQty={maxAskQty}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6" data-ocid="etf.info.panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            ETF Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {[
              { label: "Tracking Index", value: trackingIndex },
              { label: "AUM", value: aum },
              { label: "Exchange", value: "NSE / BSE" },
              { label: "Lot Size", value: "1 unit" },
              { label: "Settlement", value: "T+1" },
              { label: "Category", value: "Index ETF" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <p className="font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="mb-6" />

      <div className="mb-6" data-ocid="etf.news.panel">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full" />
          Latest News
        </h2>
        <div className="space-y-3">
          {news.map((item, i) => (
            <NewsCard key={item.headline} item={item} idx={i} />
          ))}
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 flex gap-3">
        <Button
          data-ocid="etf.buy.primary_button"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
          onClick={() =>
            navigate({
              to: "/trade",
              search: { symbol, action: "BUY" } as never,
            })
          }
        >
          BUY {symbol}
        </Button>
        <Button
          data-ocid="etf.sell.primary_button"
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
          onClick={() =>
            navigate({
              to: "/trade",
              search: { symbol, action: "SELL" } as never,
            })
          }
        >
          SELL {symbol}
        </Button>
      </div>

      <div className="hidden lg:flex gap-4">
        <Button
          data-ocid="etf.buy.primary_button"
          size="lg"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-base"
          onClick={() =>
            navigate({
              to: "/trade",
              search: { symbol, action: "BUY" } as never,
            })
          }
        >
          BUY {symbol}
        </Button>
        <Button
          data-ocid="etf.sell.primary_button"
          size="lg"
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-base"
          onClick={() =>
            navigate({
              to: "/trade",
              search: { symbol, action: "SELL" } as never,
            })
          }
        >
          SELL {symbol}
        </Button>
      </div>
    </div>
  );
}
