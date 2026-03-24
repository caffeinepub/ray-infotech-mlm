import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Star,
  StarOff,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { ASSETS, getSimulatedPrices } from "../lib/assets";
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
    const isWatched = wl.includes(symbol);
    freshUser.watchlist = isWatched
      ? wl.filter((s) => s !== symbol)
      : [...wl, symbol];
    updateUser(freshUser);
    refresh();
    toast.success(isWatched ? "Removed from watchlist" : "Added to watchlist");
  };

  const AssetRow = ({
    symbol,
    name,
    base,
    watched,
    type,
  }: {
    symbol: string;
    name: string;
    base: number;
    watched: boolean;
    type: string;
  }) => {
    const cur = prices[symbol] || base;
    const chg = cur - base;
    const chgPct = (chg / base) * 100;
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{symbol}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {type}
            </span>
          </div>
          <div className="text-xs text-muted-foreground truncate">{name}</div>
        </div>
        <div className="flex items-center gap-3 ml-2">
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
            className={
              watched
                ? "text-yellow-400 hover:text-yellow-300"
                : "text-muted-foreground hover:text-yellow-400"
            }
            title={watched ? "Remove from watchlist" : "Add to watchlist"}
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

  const q = search.toLowerCase().trim();

  const filterAssets = (assets: typeof ASSETS) => {
    if (!q) return assets;
    return assets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
    );
  };

  const watchedAssets = ASSETS.filter((a) => watchlist.includes(a.symbol));

  // When searching, show global results across all types
  const globalSearchResults = q
    ? ASSETS.filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q),
      )
    : [];

  const equities = filterAssets(ASSETS.filter((a) => a.type === "EQUITY"));
  const etfs = filterAssets(ASSETS.filter((a) => a.type === "ETF"));
  const fnos = filterAssets(ASSETS.filter((a) => a.type === "FNO"));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Watchlist</h1>

      {/* Global Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search any share by symbol or name..."
          className="pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Global search results */}
      {q && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">
            SEARCH RESULTS ({globalSearchResults.length})
          </h2>
          {globalSearchResults.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No shares found for &ldquo;{search}&rdquo;
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-3">
                {globalSearchResults.map((a) => (
                  <AssetRow
                    key={a.symbol}
                    symbol={a.symbol}
                    name={a.name}
                    base={a.basePrice}
                    watched={watchlist.includes(a.symbol)}
                    type={a.type}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Watchlist */}
      {!q && (
        <>
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
                      type={a.type}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {watchedAssets.length === 0 && (
            <div className="bg-muted/30 border border-border rounded-xl p-6 text-center text-sm text-muted-foreground mb-6">
              <Star className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              Your watchlist is empty. Search above or browse below to add
              shares.
            </div>
          )}

          {/* Browse by category */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">
              BROWSE ALL SHARES
            </h2>
            <Tabs defaultValue="equity">
              <TabsList className="w-full mb-3">
                <TabsTrigger value="equity" className="flex-1">
                  Equities ({ASSETS.filter((a) => a.type === "EQUITY").length})
                </TabsTrigger>
                <TabsTrigger value="etf" className="flex-1">
                  ETFs ({ASSETS.filter((a) => a.type === "ETF").length})
                </TabsTrigger>
                <TabsTrigger value="fno" className="flex-1">
                  F&amp;O ({ASSETS.filter((a) => a.type === "FNO").length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="equity">
                <Card>
                  <CardContent className="p-3">
                    {equities.map((a) => (
                      <AssetRow
                        key={a.symbol}
                        symbol={a.symbol}
                        name={a.name}
                        base={a.basePrice}
                        watched={watchlist.includes(a.symbol)}
                        type={a.type}
                      />
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="etf">
                <Card>
                  <CardContent className="p-3">
                    {etfs.map((a) => (
                      <AssetRow
                        key={a.symbol}
                        symbol={a.symbol}
                        name={a.name}
                        base={a.basePrice}
                        watched={watchlist.includes(a.symbol)}
                        type={a.type}
                      />
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="fno">
                <Card>
                  <CardContent className="p-3">
                    {fnos.map((a) => (
                      <AssetRow
                        key={a.symbol}
                        symbol={a.symbol}
                        name={a.name}
                        base={a.basePrice}
                        watched={watchlist.includes(a.symbol)}
                        type={a.type}
                      />
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
