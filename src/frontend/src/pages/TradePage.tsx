import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { ASSETS, getSimulatedPrices, isMarketOpen } from "../lib/assets";
import type { Asset } from "../lib/assets";
import { addTrade, getHoldingQty, getUserById, updateUser } from "../lib/store";

export default function TradePage() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [prices, setPrices] = useState<Record<string, number>>(
    getSimulatedPrices(),
  );
  const [selected, setSelected] = useState<Asset | null>(null);
  const [qty, setQty] = useState("1");
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
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

  const isApproved =
    user.paymentStatus === "approved" && user.kycStatus === "approved";
  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const handleTrade = () => {
    if (!selected) {
      toast.error("Select a stock first");
      return;
    }
    if (!isApproved) {
      toast.error("Account not approved yet");
      return;
    }
    const quantity = Number.parseInt(qty);
    if (!quantity || quantity < 1) {
      toast.error("Enter valid quantity");
      return;
    }
    const price = prices[selected.symbol] || selected.basePrice;
    const total = price * quantity;

    const freshUser = getUserById(user.id);
    if (!freshUser) return;

    if (orderType === "BUY") {
      if (freshUser.virtualBalance < total) {
        toast.error(
          `Insufficient balance. Available: ${fmt(freshUser.virtualBalance)}`,
        );
        return;
      }
      freshUser.virtualBalance -= total;
    } else {
      const holding = getHoldingQty(user.id, selected.symbol);
      if (holding < quantity) {
        toast.error(`Insufficient holdings. You have ${holding} shares`);
        return;
      }
      freshUser.virtualBalance += total;
    }

    addTrade({
      id: `T${Date.now()}`,
      userId: user.id,
      symbol: selected.symbol,
      name: selected.name,
      assetType: selected.type,
      type: orderType,
      quantity,
      price,
      timestamp: Date.now(),
    });

    updateUser(freshUser);
    refresh();
    toast.success(
      `${orderType} order placed: ${quantity} x ${selected.symbol} @ ${fmt(price)}`,
    );
    setQty("1");
  };

  const AssetList = ({ assets }: { assets: Asset[] }) => (
    <div className="space-y-1">
      {assets.map((a) => {
        const cur = prices[a.symbol] || a.basePrice;
        const chg = ((cur - a.basePrice) / a.basePrice) * 100;
        return (
          <button
            key={a.symbol}
            type="button"
            onClick={() => setSelected(a)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-left ${
              selected?.symbol === a.symbol
                ? "bg-gold-500/20 border border-gold-500/40"
                : "hover:bg-muted/50"
            }`}
          >
            <div>
              <div className="font-semibold text-sm">{a.symbol}</div>
              <div className="text-xs text-muted-foreground">{a.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{fmt(cur)}</div>
              <div
                className={`text-xs ${chg >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {chg >= 0 ? "+" : ""}
                {chg.toFixed(2)}%
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Trade</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Balance:{" "}
            <span className="text-gold-400 font-bold">
              {fmt(user.virtualBalance)}
            </span>
          </span>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${marketOpen ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${marketOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
            />
            {marketOpen ? "OPEN" : "CLOSED"}
          </div>
        </div>
      </div>

      {!isApproved && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-sm text-yellow-400">
          Your account is pending admin approval. Trading will be enabled once
          approved.
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Asset List */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="equity">
            <TabsList className="w-full mb-3">
              <TabsTrigger value="equity" className="flex-1">
                Equities
              </TabsTrigger>
              <TabsTrigger value="etf" className="flex-1">
                ETFs
              </TabsTrigger>
              <TabsTrigger value="fno" className="flex-1">
                F&O
              </TabsTrigger>
            </TabsList>
            <TabsContent value="equity">
              <Card>
                <CardContent className="p-3">
                  <AssetList
                    assets={ASSETS.filter((a) => a.type === "EQUITY")}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="etf">
              <Card>
                <CardContent className="p-3">
                  <AssetList assets={ASSETS.filter((a) => a.type === "ETF")} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="fno">
              <Card>
                <CardContent className="p-3">
                  <AssetList assets={ASSETS.filter((a) => a.type === "FNO")} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Order Panel */}
        <div className="lg:col-span-2">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {selected ? selected.symbol : "Select a Stock"}
                {selected && (
                  <Badge className="ml-2 text-xs" variant="outline">
                    {selected.type}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selected && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">
                    {selected.name}
                  </div>
                  <div className="text-2xl font-bold">
                    {fmt(prices[selected.symbol] || selected.basePrice)}
                  </div>
                  {selected.type === "FNO" && (
                    <div className="text-xs text-muted-foreground">
                      Lot size: {selected.lotSize}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Holdings: {getHoldingQty(user.id, selected.symbol)} shares
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={orderType === "BUY" ? "default" : "outline"}
                  className={
                    orderType === "BUY"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : ""
                  }
                  onClick={() => setOrderType("BUY")}
                >
                  BUY
                </Button>
                <Button
                  variant={orderType === "SELL" ? "default" : "outline"}
                  className={
                    orderType === "SELL"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : ""
                  }
                  onClick={() => setOrderType("SELL")}
                >
                  SELL
                </Button>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="Number of shares"
                />
              </div>

              {selected && qty && (
                <div className="text-sm text-muted-foreground">
                  Total:{" "}
                  <span className="font-bold text-foreground">
                    {fmt(
                      (prices[selected.symbol] || selected.basePrice) *
                        (Number.parseInt(qty) || 0),
                    )}
                  </span>
                </div>
              )}

              <Button
                className={`w-full font-semibold ${orderType === "BUY" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white`}
                onClick={handleTrade}
                disabled={!selected || !isApproved}
              >
                Place {orderType} Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
