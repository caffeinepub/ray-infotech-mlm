import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ASSETS, getSimulatedPrices, isMarketOpen } from "../lib/assets";

function TradingViewWidget({
  symbol,
  height = 400,
}: { symbol: string; height?: number }) {
  const containerId = `tv_${symbol.replace(/[^a-z0-9]/gi, "_")}`;
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "Asia/Kolkata",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });
    const container = document.getElementById(containerId);
    if (container) container.appendChild(script);
    return () => {
      if (container) container.innerHTML = "";
    };
  }, [symbol, containerId]);

  return (
    <div
      className="tradingview-widget-container"
      style={{ height }}
      id={containerId}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: "100%" }}
      />
    </div>
  );
}

function TickerTape() {
  useEffect(() => {
    const container = document.getElementById("tv_ticker");
    if (!container) return;
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BSE:SENSEX", title: "SENSEX" },
        { proName: "NSE:NIFTY50", title: "NIFTY 50" },
        { proName: "NSE:BANKNIFTY", title: "BANK NIFTY" },
        { proName: "NSE:RELIANCE", title: "RELIANCE" },
        { proName: "NSE:TCS", title: "TCS" },
        { proName: "NSE:INFY", title: "INFOSYS" },
        { proName: "NSE:HDFCBANK", title: "HDFC BANK" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    });
    container.appendChild(script);
    return () => {
      container.innerHTML = "";
    };
  }, []);
  return <div id="tv_ticker" className="tradingview-widget-container h-12" />;
}

export default function MarketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prices, setPrices] = useState<Record<string, number>>(
    getSimulatedPrices(),
  );
  const marketOpen = isMarketOpen();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    const interval = setInterval(() => setPrices(getSimulatedPrices()), 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  if (!user) return null;

  const equities = ASSETS.filter((a) => a.type === "EQUITY");
  const etfs = ASSETS.filter((a) => a.type === "ETF");
  const fnos = ASSETS.filter((a) => a.type === "FNO");

  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

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
      {/* Session Status */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">Market Overview</h1>
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${marketOpen ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${marketOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
          />
          {marketOpen ? "MARKET OPEN (9:15 AM - 3:30 PM IST)" : "MARKET CLOSED"}
        </div>
      </div>

      {/* Ticker Tape */}
      <div className="bg-navy-900 rounded-xl mb-4 overflow-hidden">
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
                F&O
              </TabsTrigger>
            </TabsList>
            <TabsContent value="equity">
              <Card>
                <CardContent className="p-3">
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
