import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { Search, Star, StarOff, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
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
  const [search, setSearch] = useState("");
  const marketOpen = isMarketOpen();
  const orderPanelRef = useRef<HTMLDivElement>(null);

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
  const watchlist = user.watchlist || [];
  const fmt = (n: number) =>
    `\u20b9${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const toggleWatch = (symbol: string) => {
    const freshUser = getUserById(user.id);
    if (!freshUser) return;
    const wl = freshUser.watchlist || [];
    const isWatched = wl.includes(symbol);
    freshUser.watchlist = isWatched
      ? wl.filter((s) => s !== symbol)
      : [...wl, symbol];
    updateUser(freshUser);
    refresh();
    toast.success(isWatched ? "Removed from watchlist" : "Added to watchlist");
  };

  const q = search.toLowerCase().trim();

  const filterAssets = (assets: Asset[]) => {
    if (!q) return assets;
    return assets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
    );
  };

  // Global search across all asset types when query is present
  const globalSearchResults = q
    ? ASSETS.filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q),
      )
    : [];

  const handleSelectAndOrder = (asset: Asset, type: "BUY" | "SELL") => {
    setSelected(asset);
    setOrderType(type);
    setTimeout(() => {
      orderPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

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

  const AssetRow = ({ a, idx }: { a: Asset; idx: number }) => {
    const cur = prices[a.symbol] || a.basePrice;
    const chg = ((cur - a.basePrice) / a.basePrice) * 100;
    const isSelected = selected?.symbol === a.symbol;
    const watched = watchlist.includes(a.symbol);
    return (
      <div
        key={a.symbol}
        data-ocid={`trade.item.${idx + 1}`}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
          isSelected
            ? "bg-yellow-500/20 border border-yellow-500/40"
            : "hover:bg-muted/50"
        }`}
      >
        <button
          type="button"
          onClick={() => setSelected(a)}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm">{a.symbol}</span>
            {q && (
              <span className="text-xs px-1 py-0.5 rounded bg-muted text-muted-foreground">
                {a.type}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">{a.name}</div>
        </button>
        <div className="flex items-center gap-1.5 ml-1">
          <div className="text-right mr-1">
            <div className="text-sm font-semibold">{fmt(cur)}</div>
            <div
              className={`text-xs ${
                chg >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {chg >= 0 ? "+" : ""}
              {chg.toFixed(2)}%
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleWatch(a.symbol)}
            className={`p-1 rounded transition-colors ${
              watched
                ? "text-yellow-400 hover:text-yellow-300"
                : "text-muted-foreground hover:text-yellow-400"
            }`}
            title={watched ? "Remove from watchlist" : "Add to watchlist"}
          >
            {watched ? (
              <Star size={13} fill="currentColor" />
            ) : (
              <StarOff size={13} />
            )}
          </button>
          <button
            type="button"
            data-ocid={`trade.buy.button.${idx + 1}`}
            onClick={() => handleSelectAndOrder(a, "BUY")}
            className="px-2 py-1 rounded text-xs font-bold bg-green-600 hover:bg-green-500 text-white transition-colors"
          >
            BUY
          </button>
          <button
            type="button"
            data-ocid={`trade.sell.button.${idx + 1}`}
            onClick={() => handleSelectAndOrder(a, "SELL")}
            className="px-2 py-1 rounded text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            SELL
          </button>
        </div>
      </div>
    );
  };

  const AssetList = ({ assets }: { assets: Asset[] }) => {
    const filtered = filterAssets(assets);
    if (filtered.length === 0) {
      return (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No results found for &ldquo;{search}&rdquo;
        </div>
      );
    }
    return (
      <div className="space-y-1">
        {filtered.map((a, idx) => (
          <AssetRow key={a.symbol} a={a} idx={idx} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-40 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Trade</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Balance:{" "}
            <span className="text-yellow-400 font-bold">
              {fmt(user.virtualBalance)}
            </span>
          </span>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              marketOpen
                ? "bg-green-500/15 text-green-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                marketOpen ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}
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

      {/* Search Bar */}
      <div className="relative mb-4" data-ocid="trade.search_input">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search any share — Equities, ETFs, F&O..."
          className="pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Asset List */}
        <div className="lg:col-span-3">
          {/* Global search results across all types */}
          {q ? (
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-2 px-1">
                  {globalSearchResults.length} result
                  {globalSearchResults.length !== 1 ? "s" : ""} across all
                  categories
                </div>
                {globalSearchResults.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No shares found for &ldquo;{search}&rdquo;
                  </div>
                ) : (
                  <div className="space-y-1">
                    {globalSearchResults.map((a, idx) => (
                      <AssetRow key={a.symbol} a={a} idx={idx} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="equity">
              <TabsList className="w-full mb-3">
                <TabsTrigger
                  value="equity"
                  className="flex-1"
                  data-ocid="trade.equity.tab"
                >
                  Equities
                </TabsTrigger>
                <TabsTrigger
                  value="etf"
                  className="flex-1"
                  data-ocid="trade.etf.tab"
                >
                  ETFs
                </TabsTrigger>
                <TabsTrigger
                  value="fno"
                  className="flex-1"
                  data-ocid="trade.fno.tab"
                >
                  F&amp;O
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
                    <AssetList
                      assets={ASSETS.filter((a) => a.type === "ETF")}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="fno">
                <Card>
                  <CardContent className="p-3">
                    <AssetList
                      assets={ASSETS.filter((a) => a.type === "FNO")}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Order Panel - desktop only */}
        <div className="hidden lg:block lg:col-span-2" ref={orderPanelRef}>
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
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {selected.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleWatch(selected.symbol)}
                      className={`p-1 rounded transition-colors ${
                        watchlist.includes(selected.symbol)
                          ? "text-yellow-400 hover:text-yellow-300"
                          : "text-muted-foreground hover:text-yellow-400"
                      }`}
                      title={
                        watchlist.includes(selected.symbol)
                          ? "Remove from watchlist"
                          : "Add to watchlist"
                      }
                    >
                      {watchlist.includes(selected.symbol) ? (
                        <Star size={15} fill="currentColor" />
                      ) : (
                        <StarOff size={15} />
                      )}
                    </button>
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
                  data-ocid="trade.buy.primary_button"
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
                  data-ocid="trade.sell.primary_button"
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
                  data-ocid="trade.qty.input"
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
                data-ocid="trade.order.submit_button"
                className={`w-full font-semibold ${
                  orderType === "BUY"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } text-white`}
                onClick={handleTrade}
                disabled={!selected || !isApproved}
              >
                Place {orderType} Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile sticky bottom order panel */}
      {selected && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl shadow-2xl p-4"
          data-ocid="trade.order.panel"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">{selected.symbol}</span>
                <button
                  type="button"
                  onClick={() => toggleWatch(selected.symbol)}
                  className={`transition-colors ${
                    watchlist.includes(selected.symbol)
                      ? "text-yellow-400"
                      : "text-muted-foreground hover:text-yellow-400"
                  }`}
                >
                  {watchlist.includes(selected.symbol) ? (
                    <Star size={14} fill="currentColor" />
                  ) : (
                    <StarOff size={14} />
                  )}
                </button>
              </div>
              <div className="text-xs text-muted-foreground">
                {selected.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                {fmt(prices[selected.symbol] || selected.basePrice)}
              </div>
              {selected.type === "FNO" && (
                <div className="text-xs text-muted-foreground">
                  Lot: {selected.lotSize}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="ml-3 text-muted-foreground hover:text-foreground"
              data-ocid="trade.order.close_button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              data-ocid="trade.mobile.buy.toggle"
              onClick={() => setOrderType("BUY")}
              className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                orderType === "BUY"
                  ? "bg-green-600 text-white"
                  : "border border-green-600 text-green-500"
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              data-ocid="trade.mobile.sell.toggle"
              onClick={() => setOrderType("SELL")}
              className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                orderType === "SELL"
                  ? "bg-red-600 text-white"
                  : "border border-red-600 text-red-500"
              }`}
            >
              SELL
            </button>
          </div>

          <div className="flex gap-2">
            <Input
              data-ocid="trade.mobile.qty.input"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Qty"
              className="w-24"
            />
            {qty && (
              <div className="flex items-center text-xs text-muted-foreground flex-1">
                Total:{" "}
                <span className="font-bold text-foreground ml-1">
                  {fmt(
                    (prices[selected.symbol] || selected.basePrice) *
                      (Number.parseInt(qty) || 0),
                  )}
                </span>
              </div>
            )}
            <Button
              data-ocid="trade.mobile.order.submit_button"
              onClick={handleTrade}
              disabled={!isApproved}
              className={`font-semibold ${
                orderType === "BUY"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              Place {orderType}
            </Button>
          </div>

          {!isApproved && (
            <p className="text-xs text-yellow-400 mt-2">
              Account pending approval
            </p>
          )}
        </div>
      )}
    </div>
  );
}
