import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Star,
  StarOff,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { ASSETS, getSimulatedPrices, isMarketOpen } from "../lib/assets";
import type { Asset } from "../lib/assets";
import { addTrade, getHoldingQty, getUserById, updateUser } from "../lib/store";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderMode = "INTRADAY" | "DELIVERY";
type OrderVariant = "MARKET" | "LIMIT" | "SL" | "GTT";

interface GTTOrder {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  type: "BUY" | "SELL";
  qty: number;
  triggerPrice: number;
  limitPrice: number;
  timestamp: number;
  orderMode: OrderMode;
}

// ─── Charges Calculator ───────────────────────────────────────────────────────

interface Charges {
  tradeValue: number;
  brokerage: number;
  intradayBrokerage: number;
  stt: number;
  exchangeCharges: number;
  gst: number;
  sebiCharges: number;
  stampDuty: number;
  totalCharges: number;
  netAmount: number;
}

function calculateCharges(
  tradeValue: number,
  type: "BUY" | "SELL",
  isIntraday: boolean,
  quantity: number,
): Charges {
  const brokerage = 0.5;
  const intradayBrokerage = isIntraday && type === "BUY" ? 0.3 * quantity : 0;
  const stt = tradeValue * 0.001;
  const exchangeCharges = tradeValue * 0.0000345;
  const gst = (brokerage + exchangeCharges) * 0.18;
  const sebiCharges = tradeValue * 0.000001;
  const stampDuty = type === "BUY" ? tradeValue * 0.00015 : 0;

  const totalCharges =
    brokerage +
    intradayBrokerage +
    stt +
    exchangeCharges +
    gst +
    sebiCharges +
    stampDuty;
  const netAmount =
    type === "BUY" ? tradeValue + totalCharges : tradeValue - totalCharges;

  return {
    tradeValue,
    brokerage,
    intradayBrokerage,
    stt,
    exchangeCharges,
    gst,
    sebiCharges,
    stampDuty,
    totalCharges,
    netAmount,
  };
}

// ─── GTT helpers ──────────────────────────────────────────────────────────────

function gttKey(userId: string) {
  return `gtt_orders_${userId}`;
}

function loadGTTOrders(userId: string): GTTOrder[] {
  try {
    return JSON.parse(localStorage.getItem(gttKey(userId)) || "[]");
  } catch {
    return [];
  }
}

function saveGTTOrders(userId: string, orders: GTTOrder[]) {
  localStorage.setItem(gttKey(userId), JSON.stringify(orders));
}

// ─── Charges Breakdown UI ─────────────────────────────────────────────────────

function ChargesBreakdown({
  charges,
  type,
  orderMode,
  orderVariant,
}: {
  charges: Charges;
  type: "BUY" | "SELL";
  orderMode: OrderMode;
  orderVariant: OrderVariant;
}) {
  const [open, setOpen] = useState(false);
  const fmt2 = (n: number) =>
    `\u20b9${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;

  return (
    <div
      className="rounded-lg border border-border bg-muted/30 text-xs"
      data-ocid="trade.charges.panel"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          Charges &amp; Taxes
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              orderMode === "INTRADAY"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-purple-500/20 text-purple-400"
            }`}
          >
            {orderMode}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
            {orderVariant}
          </span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-foreground font-semibold">
            {fmt2(charges.totalCharges)}
          </span>
          {open ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-1.5 border-t border-border pt-2">
          <div className="flex justify-between text-muted-foreground">
            <span>Trade Value</span>
            <span>{fmt2(charges.tradeValue)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Brokerage</span>
            <span>{fmt2(charges.brokerage)}</span>
          </div>
          {charges.intradayBrokerage > 0 && (
            <div className="flex justify-between text-blue-400">
              <span>Intraday Brokerage (₹0.3/share)</span>
              <span>{fmt2(charges.intradayBrokerage)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>STT (0.1%)</span>
            <span>{fmt2(charges.stt)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Exchange Charges</span>
            <span>{fmt2(charges.exchangeCharges)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>GST (18%)</span>
            <span>{fmt2(charges.gst)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>SEBI Charges</span>
            <span>{fmt2(charges.sebiCharges)}</span>
          </div>
          {type === "BUY" && (
            <div className="flex justify-between text-muted-foreground">
              <span>Stamp Duty (0.015%)</span>
              <span>{fmt2(charges.stampDuty)}</span>
            </div>
          )}
          <Separator className="my-1" />
          <div className="flex justify-between font-semibold text-foreground">
            <span>Total Charges</span>
            <span className="text-orange-400">
              {fmt2(charges.totalCharges)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-foreground">
            <span>{type === "BUY" ? "You Pay" : "You Receive"}</span>
            <span
              className={type === "BUY" ? "text-red-400" : "text-green-400"}
            >
              {fmt2(charges.netAmount)}
            </span>
          </div>
        </div>
      )}

      {!open && (
        <div className="px-3 pb-2 flex justify-between font-bold text-xs border-t border-border pt-2">
          <span className="text-muted-foreground">
            {type === "BUY" ? "You Pay" : "You Receive"}
          </span>
          <span className={type === "BUY" ? "text-red-400" : "text-green-400"}>
            {fmt2(charges.netAmount)}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Order Panel Content (reused for desktop + mobile) ───────────────────────

function OrderPanelContent({
  selected,
  prices,
  watchlist,
  user,
  orderType,
  setOrderType,
  orderMode,
  setOrderMode,
  orderVariant,
  setOrderVariant,
  qty,
  setQty,
  limitPrice,
  setLimitPrice,
  triggerPrice,
  setTriggerPrice,
  gttLimitPrice,
  setGttLimitPrice,
  liveCharges,
  isApproved,
  handleTrade,
  toggleWatch,
  fmt,
  isMobile,
}: {
  selected: Asset;
  prices: Record<string, number>;
  watchlist: string[];
  user: { id: string; virtualBalance: number };
  orderType: "BUY" | "SELL";
  setOrderType: (t: "BUY" | "SELL") => void;
  orderMode: OrderMode;
  setOrderMode: (m: OrderMode) => void;
  orderVariant: OrderVariant;
  setOrderVariant: (v: OrderVariant) => void;
  qty: string;
  setQty: (v: string) => void;
  limitPrice: string;
  setLimitPrice: (v: string) => void;
  triggerPrice: string;
  setTriggerPrice: (v: string) => void;
  gttLimitPrice: string;
  setGttLimitPrice: (v: string) => void;
  liveCharges: Charges | null;
  isApproved: boolean;
  handleTrade: () => void;
  toggleWatch: (s: string) => void;
  fmt: (n: number) => string;
  isMobile?: boolean;
}) {
  const cur = prices[selected.symbol] || selected.basePrice;

  return (
    <div className="space-y-3">
      {/* Stock info */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{selected.name}</div>
          <button
            type="button"
            onClick={() => toggleWatch(selected.symbol)}
            className={`p-1 rounded transition-colors ${
              watchlist.includes(selected.symbol)
                ? "text-yellow-400 hover:text-yellow-300"
                : "text-muted-foreground hover:text-yellow-400"
            }`}
          >
            {watchlist.includes(selected.symbol) ? (
              <Star size={15} fill="currentColor" />
            ) : (
              <StarOff size={15} />
            )}
          </button>
        </div>
        <div className="text-2xl font-bold">{fmt(cur)}</div>
        {selected.type === "FNO" && (
          <div className="text-xs text-muted-foreground">
            Lot size: {selected.lotSize}
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-1">
          Holdings: {getHoldingQty(user.id, selected.symbol)} shares
        </div>
      </div>

      {/* Intraday / Delivery toggle */}
      <div
        className="grid grid-cols-2 gap-1 bg-muted/40 rounded-lg p-1"
        data-ocid="trade.order_mode.toggle"
      >
        <button
          type="button"
          onClick={() => setOrderMode("INTRADAY")}
          className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
            orderMode === "INTRADAY"
              ? "bg-blue-600 text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Intraday
        </button>
        <button
          type="button"
          onClick={() => setOrderMode("DELIVERY")}
          className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
            orderMode === "DELIVERY"
              ? "bg-purple-600 text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Delivery (CNC)
        </button>
      </div>

      {/* BUY / SELL */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          data-ocid={
            isMobile ? "trade.mobile.buy.toggle" : "trade.buy.primary_button"
          }
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
          data-ocid={
            isMobile ? "trade.mobile.sell.toggle" : "trade.sell.primary_button"
          }
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

      {/* Order variant selector */}
      <div
        className="grid grid-cols-4 gap-1 bg-muted/40 rounded-lg p-1"
        data-ocid="trade.order_variant.toggle"
      >
        {(["MARKET", "LIMIT", "SL", "GTT"] as OrderVariant[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setOrderVariant(v)}
            className={`py-1 rounded text-[11px] font-semibold transition-colors ${
              orderVariant === v
                ? "bg-yellow-500 text-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v === "SL" ? "Stop Loss" : v}
          </button>
        ))}
      </div>

      {/* Quantity */}
      <div>
        <Label className="text-xs mb-1 block">Quantity</Label>
        <Input
          data-ocid={isMobile ? "trade.mobile.qty.input" : "trade.qty.input"}
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Number of shares"
        />
      </div>

      {/* Limit price for LIMIT order */}
      {orderVariant === "LIMIT" && (
        <div>
          <Label className="text-xs mb-1 block">Limit Price (₹)</Label>
          <Input
            data-ocid="trade.limit_price.input"
            type="number"
            min="0"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder={`Current: ${fmt(cur)}`}
          />
        </div>
      )}

      {/* Trigger price for SL */}
      {orderVariant === "SL" && (
        <div>
          <Label className="text-xs mb-1 block">Trigger Price (₹)</Label>
          <Input
            data-ocid="trade.trigger_price.input"
            type="number"
            min="0"
            value={triggerPrice}
            onChange={(e) => setTriggerPrice(e.target.value)}
            placeholder={`Current: ${fmt(cur)}`}
          />
          {triggerPrice && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Stop Loss @ ₹{triggerPrice} — executes at market price for demo
            </p>
          )}
        </div>
      )}

      {/* GTT inputs */}
      {orderVariant === "GTT" && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs mb-1 block">Trigger Price (₹)</Label>
            <Input
              data-ocid="trade.gtt_trigger.input"
              type="number"
              min="0"
              value={triggerPrice}
              onChange={(e) => setTriggerPrice(e.target.value)}
              placeholder={`e.g. ${fmt(cur * 0.95)}`}
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Limit Price (₹)</Label>
            <Input
              data-ocid="trade.gtt_limit.input"
              type="number"
              min="0"
              value={gttLimitPrice}
              onChange={(e) => setGttLimitPrice(e.target.value)}
              placeholder={`e.g. ${fmt(cur * 0.96)}`}
            />
          </div>
        </div>
      )}

      {/* Charges */}
      {liveCharges && orderVariant !== "GTT" && (
        <ChargesBreakdown
          charges={liveCharges}
          type={orderType}
          orderMode={orderMode}
          orderVariant={orderVariant}
        />
      )}

      {orderVariant === "GTT" && (
        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 text-xs text-yellow-400">
          GTT order will be stored as pending. Balance is NOT deducted until the
          order triggers.
        </div>
      )}

      {/* Submit button */}
      <Button
        data-ocid={
          isMobile
            ? "trade.mobile.order.submit_button"
            : "trade.order.submit_button"
        }
        className={`w-full font-semibold ${
          orderType === "BUY"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        } text-white`}
        onClick={handleTrade}
        disabled={!isApproved}
      >
        {orderVariant === "GTT"
          ? "Place GTT Order"
          : `Place ${orderType} Order`}
      </Button>

      {!isApproved && (
        <p className="text-xs text-yellow-400 text-center">
          Account pending approval
        </p>
      )}
    </div>
  );
}

// ─── GTT Orders Panel ─────────────────────────────────────────────────────────

function GTTOrdersPanel({
  userId,
  fmt,
}: { userId: string; fmt: (n: number) => string }) {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<GTTOrder[]>(() => loadGTTOrders(userId));

  const remove = (id: string) => {
    const updated = orders.filter((o) => o.id !== id);
    saveGTTOrders(userId, updated);
    setOrders(updated);
    toast.success("GTT order cancelled");
  };

  if (orders.length === 0) return null;

  return (
    <Card className="mt-4" data-ocid="trade.gtt.panel">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/30 transition-colors rounded-t-lg"
      >
        <span className="flex items-center gap-2">
          GTT Orders
          <span className="bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {orders.length}
          </span>
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {open && (
        <CardContent className="pt-0 pb-3 space-y-2">
          {orders.map((o, idx) => (
            <div
              key={o.id}
              data-ocid={`trade.gtt.item.${idx + 1}`}
              className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{o.symbol}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      o.type === "BUY"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {o.type}
                  </span>
                  <span className="text-muted-foreground">{o.orderMode}</span>
                </div>
                <div className="text-muted-foreground">
                  Qty: {o.qty} | Trigger: {fmt(o.triggerPrice)} | Limit:{" "}
                  {fmt(o.limitPrice)}
                </div>
              </div>
              <button
                type="button"
                data-ocid={`trade.gtt.delete_button.${idx + 1}`}
                onClick={() => remove(o.id)}
                className="ml-3 text-red-400 hover:text-red-300 transition-colors p-1"
                title="Cancel GTT order"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TradePage() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [prices, setPrices] = useState<Record<string, number>>(
    getSimulatedPrices(),
  );
  const [selected, setSelected] = useState<Asset | null>(null);
  const [qty, setQty] = useState("1");
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [orderMode, setOrderMode] = useState<OrderMode>("INTRADAY");
  const [orderVariant, setOrderVariant] = useState<OrderVariant>("MARKET");
  const [limitPrice, setLimitPrice] = useState("");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [gttLimitPrice, setGttLimitPrice] = useState("");
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
    const tradeValue = price * quantity;
    const isIntraday = orderMode === "INTRADAY";

    // GTT: store and exit
    if (orderVariant === "GTT") {
      const tp = Number.parseFloat(triggerPrice);
      const lp = Number.parseFloat(gttLimitPrice);
      if (!tp || !lp) {
        toast.error("Enter both Trigger Price and Limit Price for GTT");
        return;
      }
      const newOrder: GTTOrder = {
        id: `GTT${Date.now()}`,
        userId: user.id,
        symbol: selected.symbol,
        name: selected.name,
        type: orderType,
        qty: quantity,
        triggerPrice: tp,
        limitPrice: lp,
        timestamp: Date.now(),
        orderMode,
      };
      const existing = loadGTTOrders(user.id);
      saveGTTOrders(user.id, [...existing, newOrder]);
      toast.success(
        `GTT order placed. It will trigger when price hits ₹${tp}.`,
      );
      setTriggerPrice("");
      setGttLimitPrice("");
      return;
    }

    // LIMIT: check price condition
    if (orderVariant === "LIMIT") {
      const lp = Number.parseFloat(limitPrice);
      if (!lp) {
        toast.error("Enter a limit price");
        return;
      }
      const conditionMet = orderType === "BUY" ? price <= lp : price >= lp;
      if (!conditionMet) {
        // Store as pending — don't deduct balance
        const pendingKey = `pending_orders_${user.id}`;
        const pending = JSON.parse(localStorage.getItem(pendingKey) || "[]");
        pending.push({
          id: `PENDING${Date.now()}`,
          symbol: selected.symbol,
          type: orderType,
          qty: quantity,
          limitPrice: lp,
          timestamp: Date.now(),
        });
        localStorage.setItem(pendingKey, JSON.stringify(pending));
        toast.info(
          `Limit price not met. Order placed as pending (Limit: ₹${lp}, Current: ₹${price.toFixed(2)}).`,
        );
        setLimitPrice("");
        return;
      }
    }

    const charges = calculateCharges(
      tradeValue,
      orderType,
      isIntraday,
      quantity,
    );

    // SL: show note but execute at market
    const freshUser = getUserById(user.id);
    if (!freshUser) return;

    if (orderType === "BUY") {
      if (freshUser.virtualBalance < charges.netAmount) {
        toast.error(
          `Insufficient balance. Need ${fmt(charges.netAmount)} (incl. charges). Available: ${fmt(freshUser.virtualBalance)}`,
        );
        return;
      }
      freshUser.virtualBalance -= charges.netAmount;
    } else {
      const holding = getHoldingQty(user.id, selected.symbol);
      if (holding < quantity) {
        toast.error(`Insufficient holdings. You have ${holding} shares`);
        return;
      }
      freshUser.virtualBalance += charges.netAmount;
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
      charges: charges.totalCharges,
      netAmount: charges.netAmount,
    });

    updateUser(freshUser);
    refresh();

    const fmtFull = (n: number) =>
      `\u20b9${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const slNote =
      orderVariant === "SL" && triggerPrice ? ` [SL @ ₹${triggerPrice}]` : "";
    toast.success(
      `${orderType} order placed${slNote}: ${quantity} × ${selected.symbol} @ ${fmt(price)} | Net ${orderType === "BUY" ? "paid" : "received"}: ${fmtFull(charges.netAmount)} (charges: ${fmtFull(charges.totalCharges)})`,
    );
    setQty("1");
    setTriggerPrice("");
    setLimitPrice("");
  };

  // Compute live charges for the current selection
  const liveCharges: Charges | null = (() => {
    if (!selected || !qty) return null;
    const quantity = Number.parseInt(qty) || 0;
    if (quantity < 1) return null;
    const price = prices[selected.symbol] || selected.basePrice;
    return calculateCharges(
      price * quantity,
      orderType,
      orderMode === "INTRADAY",
      quantity,
    );
  })();

  const orderPanelProps = {
    selected: selected!,
    prices,
    watchlist,
    user,
    orderType,
    setOrderType,
    orderMode,
    setOrderMode,
    orderVariant,
    setOrderVariant,
    qty,
    setQty,
    limitPrice,
    setLimitPrice,
    triggerPrice,
    setTriggerPrice,
    gttLimitPrice,
    setGttLimitPrice,
    liveCharges,
    isApproved,
    handleTrade,
    toggleWatch,
    fmt,
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

          {/* GTT Orders panel below asset list on desktop */}
          <GTTOrdersPanel userId={user.id} fmt={fmt} />
        </div>

        {/* Order Panel - desktop only */}
        <div className="hidden lg:block lg:col-span-2" ref={orderPanelRef}>
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {selected ? selected.symbol : "Select a Stock"}
                {selected && (
                  <Badge className="text-xs" variant="outline">
                    {selected.type}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selected ? (
                <OrderPanelContent {...orderPanelProps} isMobile={false} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Click BUY or SELL on any stock to start trading
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile sticky bottom order panel */}
      {selected && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto"
          data-ocid="trade.order.panel"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">{selected.symbol}</span>
                <Badge variant="outline" className="text-[10px]">
                  {selected.type}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {selected.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                {fmt(prices[selected.symbol] || selected.basePrice)}
              </div>
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

          <OrderPanelContent {...orderPanelProps} isMobile={true} />
        </div>
      )}
    </div>
  );
}
