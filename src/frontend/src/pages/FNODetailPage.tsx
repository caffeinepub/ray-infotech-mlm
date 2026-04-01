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
import CandlestickChart from "../components/CandlestickChart";
import {
  ASSET_MAP,
  generateOrderBook,
  getNewsForSymbol,
  isMarketOpen,
} from "../lib/assets";
import type { NewsItem, OrderBook } from "../lib/assets";
import { usePrice } from "../lib/priceStore";

function getLastThursdayOfMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  let day = lastDay.getDate();
  const dow = lastDay.getDay();
  const offset = (dow - 4 + 7) % 7;
  day -= offset;
  const expiry = new Date(year, month, day);
  return expiry.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFNOType(symbol: string): "CE" | "PE" | "FUT" {
  if (symbol.endsWith("CE")) return "CE";
  if (symbol.endsWith("PE")) return "PE";
  return "FUT";
}

function getStrikePrice(symbol: string, basePrice: number): string {
  const match = symbol.match(/(\d{4,6})(CE|PE)/);
  if (match) return `₹${Number(match[1]).toLocaleString("en-IN")}`;
  return `₹${basePrice.toLocaleString("en-IN")} (futures)`;
}

const FNO_TYPE_COLORS: Record<string, string> = {
  CE: "bg-green-500/20 text-green-400 border-green-500/40",
  PE: "bg-red-500/20 text-red-400 border-red-500/40",
  FUT: "bg-amber-500/20 text-amber-400 border-amber-500/40",
};

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
          data-ocid={`fno.${side}.item.${i + 1}`}
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
      data-ocid={`fno.news.item.${idx + 1}`}
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

export default function FNODetailPage() {
  const params = useParams({ from: "/fno/$symbol" });
  const navigate = useNavigate();
  const symbol = params.symbol.toUpperCase();
  const asset = ASSET_MAP[symbol];

  const {
    price: livePrice,
    change: priceChangeVal,
    changePct: pctChangeVal,
  } = usePrice(symbol);
  const bookInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const marketOpen = isMarketOpen();
  const [volume] = useState(() => Math.floor(Math.random() * 3000000) + 300000);
  const [openInterest] = useState(
    () => Math.floor(Math.random() * 100000) + 10000,
  );
  const [orderBook, setOrderBook] = useState<OrderBook>(() =>
    generateOrderBook(symbol, asset?.basePrice || 22000),
  );
  const [dayOpen] = useState(() => {
    const base = asset?.basePrice || 22000;
    return +(base * (1 + (Math.random() - 0.5) * 0.015)).toFixed(2);
  });
  const [dayHigh, setDayHigh] = useState(() => {
    const base = asset?.basePrice || 22000;
    return +(base * (1 + Math.random() * 0.02)).toFixed(2);
  });
  const [dayLow, setDayLow] = useState(() => {
    const base = asset?.basePrice || 22000;
    return +(base * (1 - Math.random() * 0.02)).toFixed(2);
  });

  useEffect(() => {
    if (!asset) return;
    bookInterval.current = setInterval(() => {
      setOrderBook(generateOrderBook(symbol, livePrice || asset.basePrice));
    }, 2000);
    return () => {
      if (bookInterval.current) clearInterval(bookInterval.current);
    };
  }, [asset, symbol, livePrice]);

  useEffect(() => {
    if (livePrice > 0) {
      setDayHigh((prev) => Math.max(prev, livePrice));
      setDayLow((prev) => Math.min(prev, livePrice));
    }
  }, [livePrice]);

  if (!asset) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">
          F&O contract &ldquo;{symbol}&rdquo; not found.
        </p>
        <Button className="mt-4" onClick={() => navigate({ to: "/trade" })}>
          Back to Trade
        </Button>
      </div>
    );
  }

  const currentPrice = livePrice || asset.basePrice;
  const priceChange = priceChangeVal;
  const pctChange = pctChangeVal;
  const isPositive = priceChange >= 0;
  const fnoType = getFNOType(symbol);
  const expiry = getLastThursdayOfMonth();
  const lotSize = asset.lotSize;
  const strikePrice = getStrikePrice(symbol, asset.basePrice);
  const contractValue = currentPrice * lotSize;

  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const news = getNewsForSymbol(symbol);
  const maxBidQty = Math.max(...orderBook.bids.map((b) => b.qty), 1);
  const maxAskQty = Math.max(...orderBook.asks.map((a) => a.qty), 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28 lg:pb-6">
      <div className="flex items-start gap-3 mb-6">
        <button
          type="button"
          data-ocid="fno.back.button"
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
              F&amp;O
            </Badge>
            <Badge className={`text-xs border ${FNO_TYPE_COLORS[fnoType]}`}>
              {fnoType === "CE"
                ? "Call Option (CE)"
                : fnoType === "PE"
                  ? "Put Option (PE)"
                  : "Futures (FUT)"}
            </Badge>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                marketOpen
                  ? "bg-green-500/15 text-green-400"
                  : "bg-red-500/15 text-red-400"
              }`}
              data-ocid="fno.market_status.panel"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${marketOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
              />
              {marketOpen ? "Market Open" : "Market Closed"}
            </div>
          </div>
          <p className="text-sm text-muted-foreground truncate">{asset.name}</p>
        </div>
        <div className="text-right flex-shrink-0" data-ocid="fno.price.panel">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
            LTP
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

      {/* Lot Size Banner */}
      <div
        className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex flex-wrap items-center gap-4"
        data-ocid="fno.lotsize.panel"
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-lg">{lotSize}</span>
          <span className="text-sm text-amber-300/80">units / lot</span>
        </div>
        <div className="w-px h-6 bg-amber-500/30" />
        <div className="text-sm">
          <span className="text-muted-foreground">Contract Value: </span>
          <span className="font-semibold text-amber-300">
            {fmt(contractValue)}
          </span>
          <span className="text-muted-foreground text-xs ml-1">
            (LTP × Lot Size)
          </span>
        </div>
        <div className="w-px h-6 bg-amber-500/30 hidden sm:block" />
        <div className="text-sm">
          <span className="text-muted-foreground">Expiry: </span>
          <span className="font-semibold">{expiry}</span>
        </div>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6"
        data-ocid="fno.stats.panel"
      >
        {[
          { label: "LTP", value: fmt(currentPrice) },
          { label: "Day Open", value: fmt(dayOpen) },
          {
            label: "Day High",
            value: fmt(dayHigh),
            highlight: "text-green-400",
          },
          { label: "Day Low", value: fmt(dayLow), highlight: "text-red-400" },
          {
            label: "Open Interest",
            value: openInterest.toLocaleString("en-IN"),
          },
          { label: "Volume", value: volume.toLocaleString("en-IN") },
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

      <Card className="mb-6" data-ocid="fno.chart.panel">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Live LTP Chart (1-min)
            </CardTitle>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Simulated · updates every 3s
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <CandlestickChart symbol={symbol} height={300} />
        </CardContent>
      </Card>

      <Card className="mb-6" data-ocid="fno.tradingview.panel">
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
            src="https://s.tradingview.com/widgetembed/?symbol=NSE:NIFTY50&interval=5&theme=dark&style=1&locale=en&hide_top_toolbar=0&hide_side_toolbar=0&allow_symbol_change=0"
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

      <Card className="mb-6" data-ocid="fno.orderbook.panel">
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

      <Card className="mb-6" data-ocid="fno.info.panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Contract Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {[
              {
                label: "Type",
                value:
                  fnoType === "CE"
                    ? "Call Option"
                    : fnoType === "PE"
                      ? "Put Option"
                      : "Futures",
              },
              { label: "Strike Price", value: strikePrice },
              {
                label: "Lot Size",
                value: `${lotSize} units`,
                highlight: "text-amber-400",
              },
              { label: "Expiry", value: expiry },
              { label: "Exchange", value: "NSE" },
              { label: "Settlement", value: "Cash Settled" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <p className={`font-semibold ${item.highlight ?? ""}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="mb-6" />

      <div className="mb-6" data-ocid="fno.news.panel">
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3">
        <div className="text-center text-xs text-muted-foreground mb-2">
          1 lot = {lotSize} units · Contract Value:{" "}
          <span className="text-amber-400 font-semibold">
            {fmt(contractValue)}
          </span>
        </div>
        <div className="flex gap-3">
          <Button
            data-ocid="fno.buy.primary_button"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
            onClick={() =>
              navigate({
                to: "/trade",
                search: { symbol, action: "BUY" } as never,
              })
            }
          >
            BUY {fnoType}
          </Button>
          <Button
            data-ocid="fno.sell.primary_button"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
            onClick={() =>
              navigate({
                to: "/trade",
                search: { symbol, action: "SELL" } as never,
              })
            }
          >
            SELL {fnoType}
          </Button>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="text-center text-xs text-muted-foreground mb-3">
          1 lot = {lotSize} units · Contract Value:{" "}
          <span className="text-amber-400 font-semibold">
            {fmt(contractValue)}
          </span>
        </div>
        <div className="flex gap-4">
          <Button
            data-ocid="fno.buy.primary_button"
            size="lg"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-base"
            onClick={() =>
              navigate({
                to: "/trade",
                search: { symbol, action: "BUY" } as never,
              })
            }
          >
            BUY {fnoType} — {symbol}
          </Button>
          <Button
            data-ocid="fno.sell.primary_button"
            size="lg"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-base"
            onClick={() =>
              navigate({
                to: "/trade",
                search: { symbol, action: "SELL" } as never,
              })
            }
          >
            SELL {fnoType} — {symbol}
          </Button>
        </div>
      </div>
    </div>
  );
}
