import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { Star, StarOff, TrendingDown, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { ASSETS } from "../lib/assets";
import { getSimulatedPrices } from "../lib/assets";
import { getUserById, updateUser } from "../lib/store";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [prices, setPrices] = useState<Record<string, number>>(
    getSimulatedPrices(),
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    const interval = setInterval(() => setPrices(getSimulatedPrices()), 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  if (!user) return null;

  const watchlist = user.watchlist || [];
  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const toggleWatch = (symbol: string) => {
    const freshUser = getUserById(user.id);
    if (!freshUser) return;
    const wl = freshUser.watchlist || [];
    freshUser.watchlist = wl.includes(symbol)
      ? wl.filter((s) => s !== symbol)
      : [...wl, symbol];
    updateUser(freshUser);
    refresh();
    toast.success(
      wl.includes(symbol) ? "Removed from watchlist" : "Added to watchlist",
    );
  };

  const watchedAssets = ASSETS.filter((a) => watchlist.includes(a.symbol));
  const otherAssets = ASSETS.filter(
    (a) =>
      !watchlist.includes(a.symbol) &&
      (!search ||
        a.symbol.toLowerCase().includes(search.toLowerCase()) ||
        a.name.toLowerCase().includes(search.toLowerCase())),
  );

  const AssetRow = ({
    symbol,
    name,
    base,
    watched,
  }: { symbol: string; name: string; base: number; watched: boolean }) => {
    const cur = prices[symbol] || base;
    const chg = cur - base;
    const chgPct = (chg / base) * 100;
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
        <div className="flex-1">
          <div className="font-semibold text-sm">{symbol}</div>
          <div className="text-xs text-muted-foreground">{name}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold">{fmt(cur)}</div>
            <div
              className={`text-xs flex items-center gap-0.5 justify-end ${chg >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {chg >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {chg >= 0 ? "+" : ""}
              {chgPct.toFixed(2)}%
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleWatch(symbol)}
            className={watched ? "text-gold-400" : "text-muted-foreground"}
          >
            {watched ? (
              <Star size={16} fill="currentColor" />
            ) : (
              <StarOff size={16} />
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Watchlist</h1>

      {watchedAssets.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">
            YOUR WATCHLIST ({watchedAssets.length})
          </h2>
          <Card>
            <CardContent className="p-3">
              {watchedAssets.map((a) => (
                <AssetRow
                  key={a.symbol}
                  symbol={a.symbol}
                  name={a.name}
                  base={a.basePrice}
                  watched
                />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">
          ADD TO WATCHLIST
        </h2>
        <input
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background mb-3 focus:outline-none focus:ring-1 focus:ring-gold-500"
          placeholder="Search stocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Card>
          <CardContent className="p-3">
            {otherAssets.slice(0, 20).map((a) => (
              <AssetRow
                key={a.symbol}
                symbol={a.symbol}
                name={a.name}
                base={a.basePrice}
                watched={false}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
