import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ASSETS } from "./assets";

export interface OHLCCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface PriceInfo {
  price: number;
  open: number;
  change: number;
  changePct: number;
  direction: "up" | "down" | "flat";
  candles: OHLCCandle[];
}

interface PriceStore {
  prices: Record<string, PriceInfo>;
}

export function isMarketOpen(): boolean {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const day = ist.getUTCDay();
  if (day === 0 || day === 6) return false;
  const hours = ist.getUTCHours();
  const minutes = ist.getUTCMinutes();
  const totalMins = hours * 60 + minutes;
  return totalMins >= 9 * 60 + 15 && totalMins <= 15 * 60 + 30;
}

const INDEX_BASES: Record<string, number> = {
  SENSEX: 74000,
  NIFTY: 22500,
  BANKNIFTY: 48000,
  MIDCAP100: 11000,
};

function generateHistoricalCandles(
  basePrice: number,
  count = 50,
): OHLCCandle[] {
  const candles: OHLCCandle[] = [];
  let price = basePrice * (1 + (Math.random() - 0.5) * 0.04);
  const now = Date.now();
  const interval = 5 * 60 * 1000;
  for (let i = count - 1; i >= 0; i--) {
    const open = price;
    const change = price * (Math.random() * 0.008 - 0.004);
    const close = Math.max(1, +(price + change).toFixed(2));
    const high = +(Math.max(open, close) * (1 + Math.random() * 0.003)).toFixed(
      2,
    );
    const low = +(Math.min(open, close) * (1 - Math.random() * 0.003)).toFixed(
      2,
    );
    candles.push({
      time: now - i * interval,
      open: +open.toFixed(2),
      high,
      low,
      close,
    });
    price = close;
  }
  return candles;
}

const PriceContext = createContext<PriceStore>({ prices: {} });

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Record<string, PriceInfo>>(() => {
    const init: Record<string, PriceInfo> = {};
    for (const asset of ASSETS) {
      const p = asset.basePrice;
      init[asset.symbol] = {
        price: p,
        open: p,
        change: 0,
        changePct: 0,
        direction: "flat",
        candles: generateHistoricalCandles(p),
      };
    }
    for (const [sym, base] of Object.entries(INDEX_BASES)) {
      init[sym] = {
        price: base,
        open: base,
        change: 0,
        changePct: 0,
        direction: "flat",
        candles: generateHistoricalCandles(base),
      };
    }
    return init;
  });

  const lastCandleTime = useRef<Record<string, number>>({});

  const tick = useCallback(() => {
    // Always simulate price updates for demo/educational purposes.
    // Trading order execution restrictions are handled separately via isMarketOpen() in trade pages.
    const now = Date.now();
    const candleInterval = 30 * 1000;
    setPrices((prev) => {
      const next: Record<string, PriceInfo> = {};
      for (const [sym, info] of Object.entries(prev)) {
        const change = info.price * (Math.random() * 0.006 - 0.003);
        const newPrice = Math.max(1, +(info.price + change).toFixed(2));
        const totalChange = newPrice - info.open;
        const pct = info.open > 0 ? (totalChange / info.open) * 100 : 0;
        let candles = info.candles;
        const lastTime = lastCandleTime.current[sym] || 0;
        if (now - lastTime >= candleInterval) {
          const prev_ = candles[candles.length - 1];
          const newCandle: OHLCCandle = {
            time: now,
            open: prev_?.close ?? newPrice,
            high:
              Math.max(prev_?.close ?? newPrice, newPrice) *
              (1 + Math.random() * 0.002),
            low:
              Math.min(prev_?.close ?? newPrice, newPrice) *
              (1 - Math.random() * 0.002),
            close: newPrice,
          };
          candles = [...candles.slice(-99), newCandle];
          lastCandleTime.current[sym] = now;
        } else {
          const last = candles[candles.length - 1];
          if (last) {
            const updated: OHLCCandle = {
              ...last,
              close: newPrice,
              high: Math.max(last.high, newPrice),
              low: Math.min(last.low, newPrice),
            };
            candles = [...candles.slice(0, -1), updated];
          }
        }
        next[sym] = {
          price: newPrice,
          open: info.open,
          change: totalChange,
          changePct: pct,
          direction: totalChange > 0 ? "up" : totalChange < 0 ? "down" : "flat",
          candles,
        };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <PriceContext.Provider value={{ prices }}>{children}</PriceContext.Provider>
  );
}

export function usePrice(symbol: string): PriceInfo {
  const { prices } = useContext(PriceContext);
  return (
    prices[symbol] ?? {
      price: 0,
      open: 0,
      change: 0,
      changePct: 0,
      direction: "flat" as const,
      candles: [],
    }
  );
}

export function usePrices(): Record<string, number> {
  const { prices } = useContext(PriceContext);
  const result: Record<string, number> = {};
  for (const [sym, info] of Object.entries(prices)) {
    result[sym] = info.price;
  }
  return result;
}
