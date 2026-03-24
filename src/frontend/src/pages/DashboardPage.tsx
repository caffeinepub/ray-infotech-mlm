import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  Briefcase,
  Star,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getSimulatedPrices, isMarketOpen } from "../lib/assets";
import { getHoldings, getTradesByUser } from "../lib/store";

export default function DashboardPage() {
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

  const isApproved =
    user.paymentStatus === "approved" && user.kycStatus === "approved";
  const holdings = getHoldings(user.id, prices);
  const trades = getTradesByUser(user.id);
  const portfolioValue = holdings.reduce(
    (acc, h) => acc + h.currentPrice * h.quantity,
    0,
  );
  const totalPnl = holdings.reduce((acc, h) => acc + h.pnl, 0);
  const marketOpen = isMarketOpen();

  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Member ID:{" "}
            <span className="text-gold-400 font-mono">{user.id}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${marketOpen ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${marketOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
            />
            Market {marketOpen ? "OPEN" : "CLOSED"}
          </div>
        </div>
      </div>

      {/* Approval Banner */}
      {!isApproved && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 text-sm font-semibold">
            Account Pending Approval
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            KYC:{" "}
            <Badge variant="outline" className="text-xs">
              {user.kycStatus}
            </Badge>{" "}
            Payment:{" "}
            <Badge variant="outline" className="text-xs">
              {user.paymentStatus}
            </Badge>{" "}
            — Admin will review and approve shortly. You'll receive ₹1000000
            virtual balance once approved.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Wallet size={14} />
              Available Balance
            </div>
            <div className="text-xl font-bold text-gold-400">
              {fmt(user.virtualBalance)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <BarChart2 size={14} />
              Portfolio Value
            </div>
            <div className="text-xl font-bold">{fmt(portfolioValue)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              {totalPnl >= 0 ? (
                <TrendingUp size={14} className="text-green-400" />
              ) : (
                <TrendingDown size={14} className="text-red-400" />
              )}
              Total P&L
            </div>
            <div
              className={`text-xl font-bold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {totalPnl >= 0 ? "+" : ""}
              {fmt(totalPnl)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Briefcase size={14} />
              Total Trades
            </div>
            <div className="text-xl font-bold">{trades.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Button
          onClick={() => navigate({ to: "/trade" })}
          className="h-16 flex-col gap-1 bg-gold-500/10 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20"
          variant="outline"
        >
          <Briefcase size={20} />
          <span className="text-sm">Trade Now</span>
        </Button>
        <Button
          onClick={() => navigate({ to: "/market" })}
          className="h-16 flex-col gap-1"
          variant="outline"
        >
          <BarChart2 size={20} />
          <span className="text-sm">View Market</span>
        </Button>
        <Button
          onClick={() => navigate({ to: "/portfolio" })}
          className="h-16 flex-col gap-1"
          variant="outline"
        >
          <BookOpen size={20} />
          <span className="text-sm">Portfolio</span>
        </Button>
      </div>

      {/* Holdings Preview */}
      {holdings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Current Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {holdings.slice(0, 5).map((h) => (
                <div
                  key={h.symbol}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <div className="font-semibold text-sm">{h.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {h.quantity} shares
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {fmt(h.currentPrice * h.quantity)}
                    </div>
                    <div
                      className={`text-xs ${h.pnl >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {h.pnl >= 0 ? "+" : ""}
                      {fmt(h.pnl)} ({h.pnlPct.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {holdings.length > 5 && (
              <Button
                variant="link"
                onClick={() => navigate({ to: "/portfolio" })}
                className="mt-2 p-0 h-auto text-gold-400"
              >
                View all {holdings.length} holdings
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
