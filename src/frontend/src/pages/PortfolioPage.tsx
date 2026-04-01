import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { usePrice, usePrices } from "../lib/priceStore";
import type { Holding, Trade } from "../lib/store";
import {
  addTrade,
  getHoldingQty,
  getHoldings,
  getTradesByUser,
  getUserById,
  updateUser,
} from "../lib/store";
import { backendUpdateUser } from "../lib/tradingApi";

// ─── Charges ──────────────────────────────────────────────────────────────────

function calcCharges(tradeValue: number, type: "BUY" | "SELL", _qty: number) {
  const brokerage = 0.5;
  const stt = tradeValue * 0.001;
  const exchangeCharges = tradeValue * 0.0000345;
  const gst = (brokerage + exchangeCharges) * 0.18;
  const sebiCharges = tradeValue * 0.000001;
  const stampDuty = type === "BUY" ? tradeValue * 0.00015 : 0;
  const totalCharges =
    brokerage + stt + exchangeCharges + gst + sebiCharges + stampDuty;
  const netAmount =
    type === "BUY" ? tradeValue + totalCharges : tradeValue - totalCharges;
  return {
    tradeValue,
    brokerage,
    stt,
    exchangeCharges,
    gst,
    sebiCharges,
    stampDuty,
    totalCharges,
    netAmount,
  };
}

// ─── Trade Sheet ─────────────────────────────────────────────────────────────

interface TradeSheetProps {
  holding: Holding;
  action: "BUY" | "SELL";
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

function TradeSheet({
  holding,
  action,
  onClose,
  onSuccess,
  userId,
}: TradeSheetProps) {
  const { price: livePrice } = usePrice(holding.symbol);
  const currentPrice = livePrice || holding.currentPrice;
  const [qty, setQty] = useState("1");
  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const quantity = Math.max(0, Number.parseInt(qty) || 0);
  const tradeValue = currentPrice * quantity;
  const charges =
    quantity > 0 ? calcCharges(tradeValue, action, quantity) : null;

  const handleConfirm = () => {
    if (!quantity || quantity < 1) {
      toast.error("Enter valid quantity");
      return;
    }

    const freshUser = getUserById(userId);
    if (!freshUser) {
      toast.error("User not found");
      return;
    }

    if (action === "BUY") {
      if (!charges || freshUser.virtualBalance < charges.netAmount) {
        toast.error(
          `Insufficient balance. Need ${fmt(charges?.netAmount ?? 0)}, available ${fmt(freshUser.virtualBalance)}`,
        );
        return;
      }
      freshUser.virtualBalance -= charges.netAmount;
    } else {
      const heldQty = getHoldingQty(userId, holding.symbol);
      if (heldQty < quantity) {
        toast.error(
          `Insufficient holdings. You have ${heldQty} shares, trying to sell ${quantity}.`,
        );
        return;
      }
      if (!charges) return;
      freshUser.virtualBalance += charges.netAmount;
    }

    addTrade({
      id: `T${Date.now()}`,
      userId,
      symbol: holding.symbol,
      name: holding.name,
      assetType: holding.assetType,
      type: action,
      quantity,
      price: currentPrice,
      timestamp: Date.now(),
      charges: charges?.totalCharges,
      netAmount: charges?.netAmount,
    });

    updateUser(freshUser);
    backendUpdateUser(freshUser).catch(() => {});

    toast.success(
      `${action} ${quantity} ${holding.symbol} @ ${fmt(currentPrice)} — Balance: ${fmt(freshUser.virtualBalance)}`,
    );
    onSuccess();
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm" data-ocid="portfolio.trade.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                action === "BUY"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {action}
            </span>
            {holding.symbol}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Price</span>
            <span className="font-semibold tabular-nums">
              {fmt(currentPrice)}
            </span>
          </div>
          {action === "SELL" && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Holdings</span>
              <span className="font-semibold">
                {getHoldingQty(userId, holding.symbol)} shares
              </span>
            </div>
          )}

          <div>
            <Label htmlFor="portfolio-qty" className="text-sm mb-1.5 block">
              Quantity
            </Label>
            <Input
              id="portfolio-qty"
              data-ocid="portfolio.trade.input"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>

          {charges && quantity > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 text-xs p-3 space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>Trade Value</span>
                <span>{fmt(charges.tradeValue)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Brokerage</span>
                <span>{fmt(charges.brokerage)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>STT (0.1%)</span>
                <span>{fmt(charges.stt)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST</span>
                <span>{fmt(charges.gst)}</span>
              </div>
              {charges.stampDuty > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Stamp Duty</span>
                  <span>{fmt(charges.stampDuty)}</span>
                </div>
              )}
              <div className="flex justify-between text-yellow-400 font-semibold pt-1 border-t border-border">
                <span>Total Charges</span>
                <span>{fmt(charges.totalCharges)}</span>
              </div>
              <div
                className={`flex justify-between font-bold pt-0.5 ${
                  action === "BUY" ? "text-red-400" : "text-green-400"
                }`}
              >
                <span>{action === "BUY" ? "You Pay" : "You Receive"}</span>
                <span>{fmt(charges.netAmount)}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            data-ocid="portfolio.trade.cancel_button"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="portfolio.trade.confirm_button"
            className={`flex-1 ${
              action === "BUY"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
            onClick={handleConfirm}
          >
            Confirm {action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Holding Row ───────────────────────────────────────────────────────────────

function HoldingRow({
  holding,
  idx,
  userId,
  onTradeSuccess,
}: {
  holding: Holding;
  idx: number;
  userId: string;
  onTradeSuccess: () => void;
}) {
  const [sheet, setSheet] = useState<"BUY" | "SELL" | null>(null);
  const { price: livePrice, change, changePct } = usePrice(holding.symbol);
  const currentPrice = livePrice || holding.currentPrice;
  const pnl = (currentPrice - holding.avgBuyPrice) * holding.quantity;
  const pnlPct =
    holding.avgBuyPrice > 0
      ? (pnl / (holding.avgBuyPrice * holding.quantity)) * 100
      : 0;
  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const liveHolding: Holding = { ...holding, currentPrice, pnl, pnlPct };

  return (
    <>
      <tr
        data-ocid={`portfolio.item.${idx + 1}`}
        className="border-b border-border last:border-0"
      >
        <td className="p-3">
          <div className="font-semibold">{holding.symbol}</div>
          <div className="text-xs text-muted-foreground">{holding.name}</div>
        </td>
        <td className="text-right p-3">{holding.quantity}</td>
        <td className="text-right p-3">{fmt(holding.avgBuyPrice)}</td>
        <td className="text-right p-3">
          <div className="tabular-nums">{fmt(currentPrice)}</div>
          <div
            className={`text-xs ${change >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {change >= 0 ? "▲" : "▼"} {Math.abs(changePct).toFixed(2)}%
          </div>
        </td>
        <td
          className={`text-right p-3 font-semibold ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}
        >
          {pnl >= 0 ? "+" : ""}
          {fmt(pnl)}
        </td>
        <td
          className={`text-right p-3 ${pnlPct >= 0 ? "text-green-400" : "text-red-400"}`}
        >
          {pnlPct >= 0 ? "+" : ""}
          {pnlPct.toFixed(2)}%
        </td>
        <td className="p-3">
          <div className="flex gap-1 justify-end">
            <button
              type="button"
              data-ocid={`portfolio.buy.button.${idx + 1}`}
              onClick={() => setSheet("BUY")}
              className="px-2 py-1 rounded text-xs font-bold bg-green-600 hover:bg-green-500 text-white transition-colors"
            >
              BUY
            </button>
            <button
              type="button"
              data-ocid={`portfolio.sell.button.${idx + 1}`}
              onClick={() => setSheet("SELL")}
              className="px-2 py-1 rounded text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors"
            >
              SELL
            </button>
          </div>
        </td>
      </tr>
      {sheet && (
        <TradeSheet
          holding={liveHolding}
          action={sheet}
          onClose={() => setSheet(null)}
          onSuccess={onTradeSuccess}
          userId={userId}
        />
      )}
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const prices = usePrices();
  const [version, setVersion] = useState(0);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  const handleTradeSuccess = () => {
    refresh();
    setVersion((v) => v + 1);
  };

  // Use live prices for holdings
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

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTrades = trades.filter(
    (t) => new Date(t.timestamp).toISOString().slice(0, 10) === todayStr,
  );
  const monthTrades = trades.filter((t) => {
    const d = new Date(t.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return key === selectedMonth;
  });

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
    return { key, label };
  });

  const tradeSummary = (tList: Trade[]) => {
    const buys = tList.filter((t) => t.type === "BUY");
    const sells = tList.filter((t) => t.type === "SELL");
    const grossBuy = buys.reduce((s, t) => s + (t.netAmount ?? 0), 0);
    const grossSell = sells.reduce((s, t) => s + (t.netAmount ?? 0), 0);
    const totalCharges = tList.reduce((s, t) => s + (t.charges || 0), 0);
    const netPnl = grossSell - grossBuy;
    return {
      buys: buys.length,
      sells: sells.length,
      grossBuy,
      grossSell,
      totalCharges,
      netPnl,
    };
  };

  const downloadCsv = (tList: Trade[], filename: string) => {
    const header = "Date,Symbol,Type,Quantity,Price,Net Amount,Charges";
    const rows = tList.map((t) =>
      [
        new Date(t.timestamp).toLocaleString("en-IN"),
        t.symbol,
        t.type,
        t.quantity,
        t.price.toFixed(2),
        (t.netAmount ?? 0).toFixed(2),
        (t.charges || 0).toFixed(2),
      ].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // version dependency so re-render after trade
  void version;

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
          <TabsTrigger value="reports" data-ocid="portfolio.reports.tab">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="holdings">
          {holdings.length === 0 ? (
            <Card>
              <CardContent
                className="p-8 text-center text-muted-foreground"
                data-ocid="portfolio.holdings.empty_state"
              >
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
                        <th className="text-right p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h, idx) => (
                        <HoldingRow
                          key={h.symbol}
                          holding={h}
                          idx={idx}
                          userId={user.id}
                          onTradeSuccess={handleTradeSuccess}
                        />
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
                              className={`text-xs ${
                                t.type === "BUY"
                                  ? "bg-green-500/15 text-green-400 border-green-500/30"
                                  : "bg-red-500/15 text-red-400 border-red-500/30"
                              }`}
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

        {/* Reports Tab */}
        <TabsContent value="reports" data-ocid="portfolio.reports.panel">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">
                  Today's Trading Report
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  data-ocid="portfolio.today_report.download_button"
                  onClick={() =>
                    downloadCsv(todayTrades, `trades-today-${todayStr}.csv`)
                  }
                  disabled={todayTrades.length === 0}
                >
                  <Download className="w-4 h-4 mr-1" /> Download CSV
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const s = tradeSummary(todayTrades);
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">
                          BUY Trades
                        </div>
                        <div className="text-lg font-bold text-green-400">
                          {s.buys}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">
                          SELL Trades
                        </div>
                        <div className="text-lg font-bold text-red-400">
                          {s.sells}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">
                          Net P&L
                        </div>
                        <div
                          className={`text-sm font-bold ${s.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {s.netPnl >= 0 ? "+" : ""}
                          {fmt(s.netPnl)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {todayTrades.length === 0 ? (
                  <div
                    data-ocid="portfolio.today_report.empty_state"
                    className="text-center text-muted-foreground py-4 text-sm"
                  >
                    No trades today.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table
                      className="w-full text-sm"
                      data-ocid="portfolio.today_report.table"
                    >
                      <thead className="border-b border-border">
                        <tr className="text-xs text-muted-foreground">
                          <th className="text-left p-2">Time</th>
                          <th className="text-left p-2">Symbol</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-right p-2">Qty</th>
                          <th className="text-right p-2">Price</th>
                          <th className="text-right p-2">Net Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayTrades.map((t, i) => (
                          <tr
                            key={t.id}
                            data-ocid={`portfolio.today_report.item.${i + 1}`}
                            className="border-b border-border last:border-0"
                          >
                            <td className="p-2 text-xs text-muted-foreground">
                              {fmtDate(t.timestamp)}
                            </td>
                            <td className="p-2 font-semibold">{t.symbol}</td>
                            <td className="p-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${t.type === "BUY" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}
                              >
                                {t.type}
                              </Badge>
                            </td>
                            <td className="text-right p-2">{t.quantity}</td>
                            <td className="text-right p-2">{fmt(t.price)}</td>
                            <td className="text-right p-2 font-semibold">
                              {fmt(t.netAmount ?? 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="text-xs text-muted-foreground border-t border-border pt-2">
                  📧 Email reports are available on paid plans. Download this
                  report as CSV using the button above.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base">
                    Monthly Trading Report
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger
                        data-ocid="portfolio.monthly_report.select"
                        className="w-44"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {last6Months.map((m) => (
                          <SelectItem key={m.key} value={m.key}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid="portfolio.monthly_report.download_button"
                      onClick={() =>
                        downloadCsv(monthTrades, `trades-${selectedMonth}.csv`)
                      }
                      disabled={monthTrades.length === 0}
                    >
                      <Download className="w-4 h-4 mr-1" /> CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const s = tradeSummary(monthTrades);
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">
                          Total Trades
                        </div>
                        <div className="text-lg font-bold">
                          {monthTrades.length}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">
                          Buy Value
                        </div>
                        <div className="text-sm font-semibold text-green-400">
                          {fmt(s.grossBuy)}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 col-span-2">
                        <div className="text-xs text-muted-foreground">
                          Net P&L
                        </div>
                        <div
                          className={`text-lg font-bold ${s.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {s.netPnl >= 0 ? "+" : ""}
                          {fmt(s.netPnl)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {monthTrades.length === 0 ? (
                  <div
                    data-ocid="portfolio.monthly_report.empty_state"
                    className="text-center text-muted-foreground py-4 text-sm"
                  >
                    No trades in the selected month.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table
                      className="w-full text-sm"
                      data-ocid="portfolio.monthly_report.table"
                    >
                      <thead className="border-b border-border">
                        <tr className="text-xs text-muted-foreground">
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Symbol</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-right p-2">Qty</th>
                          <th className="text-right p-2">Price</th>
                          <th className="text-right p-2">Net Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthTrades.map((t, i) => (
                          <tr
                            key={t.id}
                            data-ocid={`portfolio.monthly_report.item.${i + 1}`}
                            className="border-b border-border last:border-0"
                          >
                            <td className="p-2 text-xs text-muted-foreground">
                              {fmtDate(t.timestamp)}
                            </td>
                            <td className="p-2 font-semibold">{t.symbol}</td>
                            <td className="p-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${t.type === "BUY" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}
                              >
                                {t.type}
                              </Badge>
                            </td>
                            <td className="text-right p-2">{t.quantity}</td>
                            <td className="text-right p-2">{fmt(t.price)}</td>
                            <td className="text-right p-2 font-semibold">
                              {fmt(t.netAmount ?? 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
