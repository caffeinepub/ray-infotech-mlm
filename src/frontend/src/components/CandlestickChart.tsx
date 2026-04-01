import React, { useEffect, useRef } from "react";
import { usePrice } from "../lib/priceStore";

interface Props {
  symbol: string;
  height?: number;
}

const UP_COLOR = "#26a69a";
const DOWN_COLOR = "#ef5350";
const BG_COLOR = "#0f1118";
const GRID_COLOR = "rgba(255,255,255,0.06)";
const TEXT_COLOR = "rgba(255,255,255,0.45)";
const WICK_UP = "#26a69a";
const WICK_DOWN = "#ef5350";

export default function CandlestickChart({ symbol, height = 300 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { candles } = usePrice(symbol);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Layout
    const padL = 56;
    const padR = 12;
    const padT = 12;
    const padB = 28;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    // Background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, w, h);

    const visible = candles.slice(-60);
    if (visible.length === 0) return;

    const prices = visible.flatMap((c) => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const pricePad = priceRange * 0.05;
    const lo = minPrice - pricePad;
    const hi = maxPrice + pricePad;

    const toY = (p: number) => padT + chartH - ((p - lo) / (hi - lo)) * chartH;
    const candleW = Math.max(2, Math.floor(chartW / visible.length) - 2);

    // Grid lines
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    const gridLines = 5;
    ctx.textAlign = "right";
    ctx.font = `${10}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = TEXT_COLOR;
    for (let i = 0; i <= gridLines; i++) {
      const y = padT + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
      const price = hi - ((hi - lo) / gridLines) * i;
      ctx.fillText(
        price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price.toFixed(0),
        padL - 4,
        y + 4,
      );
    }

    // Candles
    visible.forEach((candle, i) => {
      const x =
        padL +
        i * (chartW / visible.length) +
        (chartW / visible.length - candleW) / 2;
      const isUp = candle.close >= candle.open;
      const color = isUp ? UP_COLOR : DOWN_COLOR;
      const wickColor = isUp ? WICK_UP : WICK_DOWN;

      const openY = toY(candle.open);
      const closeY = toY(candle.close);
      const highY = toY(candle.high);
      const lowY = toY(candle.low);

      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(1, Math.abs(closeY - openY));
      const wickX = x + candleW / 2;

      // Wick
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wickX, highY);
      ctx.lineTo(wickX, bodyTop);
      ctx.moveTo(wickX, bodyTop + bodyH);
      ctx.lineTo(wickX, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      ctx.fillRect(x, bodyTop, candleW, bodyH);
    });

    // Time labels (every ~10 candles)
    ctx.textAlign = "center";
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = `${9}px 'JetBrains Mono', monospace`;
    const labelEvery = Math.max(1, Math.floor(visible.length / 6));
    visible.forEach((candle, i) => {
      if (i % labelEvery !== 0) return;
      const x =
        padL + i * (chartW / visible.length) + chartW / visible.length / 2;
      const d = new Date(candle.time);
      const label = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
      ctx.fillText(label, x, h - padB + 14);
    });
  }, [candles, height]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      // Trigger redraw
      const canvas = canvasRef.current;
      if (canvas) canvas.style.width = "";
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        background: BG_COLOR,
        borderRadius: 8,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
