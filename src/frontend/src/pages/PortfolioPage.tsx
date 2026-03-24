import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { TrendingDown, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getSimulatedPrices } from "../lib/assets";
import { getHoldings, getTradesByUser } from "../lib/store";

export default function PortfolioPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prices, setPrices] = useState<Record<string, number>>(
    getSimulatedPrices(),
  );

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    const interval = setInterval(() => setPrices(getSimulatedPrices()), 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  if (!user) return null;

  const holdings = getHoldings(user.id, prices);
  const trades = getTradesByUser(user.id).sort(
    (a, b) => b.timestamp - a.timestamp,
  );
  const totalInvested = holdings.reduce(
    (acc, h) => acc + h.avgBuyPrice * h.quantity,
    0,
  );
  const totalValue = holdings.reduce(
    (acc, h) => acc + h.currentPrice * h.quantity,
    0,
  );
  const totalPnl = totalValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Portfolio</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Invested</div>
            <div className="text-lg font-bold">{fmt(totalInvested)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Current Value
            </div>
            <div className="text-lg font-bold">{fmt(totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Total P&L</div>
            <div
              className={`text-lg font-bold flex items-center gap-1 ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {totalPnl >= 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              {totalPnl >= 0 ? "+" : ""}
              {fmt(totalPnl)} ({totalPnlPct.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="holdings">
        <TabsList>
          <TabsTrigger value="holdings">
            Holdings ({holdings.length})
          </TabsTrigger>
          <TabsTrigger value="trades">
            Trade History ({trades.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="holdings">
          {holdings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No holdings yet. Start trading to see your portfolio.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr className="text-xs text-muted-foreground">
                        <th className="text-left p-3">Symbol</th>
                        <th className="text-right p-3">Qty</th>
                        <th className="text-right p-3">Avg Buy</th>
                        <th className="text-right p-3">LTP</th>
                        <th className="text-right p-3">P&L</th>
                        <th className="text-right p-3">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h) => (
                        <tr
                          key={h.symbol}
                          className="border-b border-border last:border-0"
                        >
                          <td className="p-3">
                            <div className="font-semibold">{h.symbol}</div>
                            <div className="text-xs text-muted-foreground">
                              {h.name}
                            </div>
                          </td>
                          <td className="text-right p-3">{h.quantity}</td>
                          <td className="text-right p-3">
                            {fmt(h.avgBuyPrice)}
                          </td>
                          <td className="text-right p-3">
                            {fmt(h.currentPrice)}
                          </td>
                          <td
                            className={`text-right p-3 font-semibold ${h.pnl >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {h.pnl >= 0 ? "+" : ""}
                            {fmt(h.pnl)}
                          </td>
                          <td
                            className={`text-right p-3 ${h.pnlPct >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {h.pnlPct >= 0 ? "+" : ""}
                            {h.pnlPct.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trades">
          {trades.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No trades yet.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr className="text-xs text-muted-foreground">
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Symbol</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-right p-3">Qty</th>
                        <th className="text-right p-3">Price</th>
                        <th className="text-right p-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((t) => (
                        <tr
                          key={t.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="p-3 text-xs text-muted-foreground">
                            {fmtDate(t.timestamp)}
                          </td>
                          <td className="p-3 font-semibold">{t.symbol}</td>
                          <td className="p-3">
                            <Badge
                              className={`text-xs ${t.type === "BUY" ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}
                              variant="outline"
                            >
                              {t.type}
                            </Badge>
                          </td>
                          <td className="text-right p-3">{t.quantity}</td>
                          <td className="text-right p-3">{fmt(t.price)}</td>
                          <td className="text-right p-3 font-semibold">
                            {fmt(t.price * t.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
