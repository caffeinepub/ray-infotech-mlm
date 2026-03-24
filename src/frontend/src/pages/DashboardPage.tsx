import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  Briefcase,
  Check,
  Copy,
  Gift,
  Share2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { getSimulatedPrices, isMarketOpen } from "../lib/assets";
import { getHoldings, getTradesByUser } from "../lib/store";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [prices, setPrices] = useState<Record<string, number>>(
    getSimulatedPrices(),
  );
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (user && !user.tcSignature) {
      navigate({ to: "/esign" });
      return;
    }
    // Refresh user data every 5 seconds so referral bonus & balance updates appear live
    const refreshInterval = setInterval(() => refresh(), 5000);
    const priceInterval = setInterval(
      () => setPrices(getSimulatedPrices()),
      5000,
    );
    return () => {
      clearInterval(refreshInterval);
      clearInterval(priceInterval);
    };
  }, [user, navigate, refresh]);

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

  const referralMessage = `Join RAY INFOTECH Demo Trading Platform! Use my referral ID ${user.id} to register. Start trading with ₹1000000 virtual money. Join now: ${window.location.origin}/register`;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      toast.success("Referral ID copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "RAY INFOTECH Demo Trading Platform",
          text: referralMessage,
        });
      } catch {
        // User cancelled share, do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(referralMessage);
        setShared(true);
        toast.success("Referral link copied to clipboard!");
        setTimeout(() => setShared(false), 2000);
      } catch {
        toast.error("Failed to copy referral message");
      }
    }
  };

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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              marketOpen
                ? "bg-green-500/15 text-green-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                marketOpen ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}
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

      {/* Referral Bonus Banner */}
      {(user.referralBonus ?? 0) > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Gift size={18} className="text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-400 text-sm font-semibold">
              Referral Bonus Earned: {fmt(user.referralBonus ?? 0)}
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">
              ₹5 has been added to your virtual balance for each client you
              referred who got approved.
            </p>
          </div>
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
              className={`text-xl font-bold ${
                totalPnl >= 0 ? "text-green-400" : "text-red-400"
              }`}
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
          data-ocid="dashboard.trade_button"
        >
          <Briefcase size={20} />
          <span className="text-sm">Trade Now</span>
        </Button>
        <Button
          onClick={() => navigate({ to: "/market" })}
          className="h-16 flex-col gap-1"
          variant="outline"
          data-ocid="dashboard.market_button"
        >
          <BarChart2 size={20} />
          <span className="text-sm">View Market</span>
        </Button>
        <Button
          onClick={() => navigate({ to: "/portfolio" })}
          className="h-16 flex-col gap-1"
          variant="outline"
          data-ocid="dashboard.portfolio_button"
        >
          <BookOpen size={20} />
          <span className="text-sm">Portfolio</span>
        </Button>
      </div>

      {/* Refer & Earn Card — shown only for approved members */}
      {isApproved && (
        <Card
          className="mb-6 border border-gold-500/30 bg-gradient-to-br from-gold-500/5 to-amber-500/5"
          data-ocid="referral.card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 size={16} className="text-gold-400" />
              Refer &amp; Earn ₹5 per Friend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Share your referral ID with friends. When they register and get
              approved, ₹5 virtual money is added to your balance.
            </p>

            {/* Referral ID box */}
            <div className="flex items-center gap-2">
              <div
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 font-mono text-sm text-gold-400 select-all"
                data-ocid="referral.input"
              >
                {user.id}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyId}
                className={`gap-1.5 transition-all ${
                  copied
                    ? "border-green-500/50 text-green-400"
                    : "border-gold-500/30 text-gold-400 hover:bg-gold-500/10"
                }`}
                data-ocid="referral.copy_button"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy ID
                  </>
                )}
              </Button>
            </div>

            {/* Share button */}
            <Button
              onClick={handleShare}
              className={`w-full gap-2 transition-all ${
                shared
                  ? "bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/25"
                  : "bg-gold-500/10 border-gold-500/30 text-gold-400 hover:bg-gold-500/20"
              }`}
              variant="outline"
              data-ocid="referral.share_button"
            >
              {shared ? (
                <>
                  <Check size={16} />
                  Referral message copied!
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  Share Referral Link
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Total referral bonus earned:{" "}
              <span className="text-green-400 font-semibold">
                {fmt(user.referralBonus ?? 0)}
              </span>
            </p>
          </CardContent>
        </Card>
      )}

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
                      className={`text-xs ${
                        h.pnl >= 0 ? "text-green-400" : "text-red-400"
                      }`}
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
