import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ASSETS, getSimulatedPrices, isMarketOpen } from "../lib/assets";

function TradingViewWidget({
  symbol,
  height = 400,
}: { symbol: string; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    containerRef.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerText = JSON.stringify({
      autosize: true,
      symbol,
      interval: "D",
      timezone: "Asia/Kolkata",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height, width: "100%" }}
    />
  );
}

function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerText = JSON.stringify({
      symbols: [
        { proName: "BSE:SENSEX", title: "SENSEX" },
        { proName: "NSE:NIFTY50", title: "NIFTY 50" },
        { proName: "NSE:BANKNIFTY", title: "BANK NIFTY" },
        { proName: "NSE:NIFTYMIDCAP100", title: "MIDCAP 100" },
        { proName: "NSE:RELIANCE", title: "RELIANCE" },
        { proName: "NSE:TCS", title: "TCS" },
        { proName: "NSE:INFY", title: "INFOSYS" },
        { proName: "NSE:HDFCBANK", title: "HDFC BANK" },
        { proName: "NSE:ICICIBANK", title: "ICICI BANK" },
        { proName: "NSE:SBIN", title: "SBI" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    });
    containerRef.current.appendChild(script);
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: 48 }}
    />
  );
}

const INDEX_DATA = [
  { symbol: "SENSEX", name: "BSE SENSEX", base: 72845 },
  { symbol: "NIFTY50", name: "NIFTY 50", base: 22100 },
  { symbol: "BANKNIFTY", name: "BANK NIFTY", base: 47250 },
  { symbol: "MIDCAP", name: "NIFTY MIDCAP 100", base: 51200 },
];

export default function MarketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prices, setPrices] = useState<Record<string, number>>(() =>
    getSimulatedPrices(),
  );
  const [indexPrices, setIndexPrices] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const i of INDEX_DATA) {
      init[i.symbol] = i.base;
    }
    return init;
  });
  const marketOpen = isMarketOpen();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    const interval = setInterval(() => {
      setPrices(getSimulatedPrices());
      setIndexPrices((prev) => {
        const next = { ...prev };
        for (const idx of INDEX_DATA) {
          const chg = next[idx.symbol] * (Math.random() * 0.004 - 0.002);
          next[idx.symbol] = Math.max(1, +(next[idx.symbol] + chg).toFixed(2));
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  if (!user) return null;

  const equities = ASSETS.filter((a) => a.type === "EQUITY");
  const etfs = ASSETS.filter((a) => a.type === "ETF");
  const fnos = ASSETS.filter((a) => a.type === "FNO");

  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const IndexCard = ({
    symbol,
    name,
    base,
  }: { symbol: string; name: string; base: number }) => {
    const cur = indexPrices[symbol] || base;
    const chg = cur - base;
    const chgPct = (chg / base) * 100;
    return (
      <Card className="bg-card border border-gold-500/20">
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground mb-1">{name}</div>
          <div className="text-lg font-bold">{fmt(cur)}</div>
          <div
            className={`text-xs font-semibold ${chg >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {chg >= 0 ? "▲" : "▼"} {Math.abs(chgPct).toFixed(2)}%
          </div>
        </CardContent>
      </Card>
    );
  };

  const PriceRow = ({
    symbol,
    name,
    base,
  }: { symbol: string; name: string; base: number }) => {
    const cur = prices[symbol] || base;
    const chg = cur - base;
    const chgPct = (chg / base) * 100;
    return (
      <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <div>
          <div className="font-semibold text-sm">{symbol}</div>
          <div className="text-xs text-muted-foreground">{name}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-sm">{fmt(cur)}</div>
          <div
            className={`text-xs ${chg >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {chg >= 0 ? "+" : ""}
            {chgPct.toFixed(2)}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">Market Overview</h1>
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            marketOpen
              ? "bg-green-500/15 text-green-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${marketOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
          />
          {marketOpen ? "MARKET OPEN (9:15 AM - 3:30 PM IST)" : "MARKET CLOSED"}
        </div>
      </div>

      {/* Live Index Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {INDEX_DATA.map((idx) => (
          <IndexCard
            key={idx.symbol}
            symbol={idx.symbol}
            name={idx.name}
            base={idx.base}
          />
        ))}
      </div>

      {/* Ticker Tape */}
      <div className="bg-navy-900 rounded-xl mb-4 overflow-hidden border border-gold-500/10">
        <TickerTape />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                NIFTY 50 Live Chart (TradingView)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TradingViewWidget symbol="NSE:NIFTY50" height={450} />
            </CardContent>
          </Card>
        </div>

        {/* Price Tickers */}
        <div className="space-y-4">
          <Tabs defaultValue="equity">
            <TabsList className="w-full">
              <TabsTrigger value="equity" className="flex-1 text-xs">
                Equities
              </TabsTrigger>
              <TabsTrigger value="etf" className="flex-1 text-xs">
                ETFs
              </TabsTrigger>
              <TabsTrigger value="fno" className="flex-1 text-xs">
                F&amp;O
              </TabsTrigger>
            </TabsList>
            <TabsContent value="equity">
              <Card>
                <CardContent className="p-3 max-h-[400px] overflow-y-auto">
                  {equities.map((a) => (
                    <PriceRow
                      key={a.symbol}
                      symbol={a.symbol}
                      name={a.name}
                      base={a.basePrice}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="etf">
              <Card>
                <CardContent className="p-3">
                  {etfs.map((a) => (
                    <PriceRow
                      key={a.symbol}
                      symbol={a.symbol}
                      name={a.name}
                      base={a.basePrice}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="fno">
              <Card>
                <CardContent className="p-3">
                  {fnos.map((a) => (
                    <PriceRow
                      key={a.symbol}
                      symbol={a.symbol}
                      name={a.name}
                      base={a.basePrice}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sensex Chart */}
      <div className="mt-4">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">BSE SENSEX Live Chart</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TradingViewWidget symbol="BSE:SENSEX" height={300} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
