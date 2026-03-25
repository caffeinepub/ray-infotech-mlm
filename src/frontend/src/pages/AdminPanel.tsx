import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart2,
  CheckCircle,
  Clock,
  Download,
  Eye,
  EyeOff,
  Gift,
  Instagram,
  Lightbulb,
  RefreshCw,
  Share2,
  Shield,
  Trash2,
  TrendingUp,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import {
  addDailyVideo,
  clearDailyVideos,
  creditReferralBonus,
  deleteDailyVideo,
  getDailyVideos,
  getTrades,
  getUsers,
  updateUser,
} from "../lib/store";
import type { DailyVideo, User } from "../lib/store";
import {
  backendCreditReferral,
  backendGetAllUsers,
  backendUpdateUser,
} from "../lib/tradingApi";

// ─── Tips Data ────────────────────────────────────────────────────────────────

const TIPS = [
  "Buy low, sell high — but never chase prices. Patience is your greatest edge in the market.",
  "Diversify your portfolio across sectors to reduce risk. Never put all your eggs in one basket.",
  "Always set a stop-loss before entering a trade. Protecting capital is more important than making profits.",
  "Study the fundamentals of a company before investing. Good businesses make good long-term investments.",
  "The market is driven by fear and greed. Learn to control your emotions to make rational decisions.",
  "Intraday trading requires discipline. Define your entry, target, and stop-loss before placing any order.",
  "Volume confirms the trend. High volume on a breakout signals strong conviction from market participants.",
  "Never invest money you cannot afford to lose. Only use surplus funds for market investments.",
  "Moving averages help identify trends. The 50-day and 200-day MAs are key levels watched by institutions.",
  "The RSI indicator helps identify overbought and oversold conditions. Use it alongside price action.",
  "News and events drive short-term volatility. Stay updated with corporate announcements and economic data.",
  "Compound interest is the 8th wonder of the world — reinvest your profits to grow wealth over time.",
  "Options trading offers leverage but also amplifies losses. Understand theta decay before buying options.",
  "ETFs provide instant diversification at low cost. They are ideal for beginners starting their journey.",
  "Technical analysis is the art of reading charts. Support and resistance levels guide entry and exit points.",
  "Futures contracts are powerful but risky. Always use margin wisely and monitor your positions closely.",
  "The Nifty 50 index represents India's top 50 companies. Tracking it gives a pulse of the overall market.",
  "SEBI regulates Indian markets to protect investors. Always trade through registered and authorized brokers.",
  "Candlestick patterns like Doji, Hammer, and Engulfing signal potential reversals — learn to read them.",
  "Systematic Investment Plans (SIPs) in index funds beat most active traders over a 10-year horizon.",
  "Corporate earnings season moves markets. Track quarterly results for your holdings carefully.",
  "FII and DII flows influence market direction. High FII buying often signals bullish sentiment.",
  "MACD crossovers signal momentum shifts. Use them with trend analysis for higher accuracy trades.",
  "Bollinger Bands measure volatility. A squeeze often precedes a big move — be ready to act.",
  "Support levels are price floors where buying interest emerges. Resistance levels are ceilings of selling.",
  "Penny stocks are high-risk, low-liquidity instruments. Beginners should avoid them entirely.",
  "A trading journal tracks your wins and losses. Review it weekly to identify patterns in your decisions.",
  "Risk management means never risking more than 1-2% of your capital on a single trade.",
  "Sector rotation is a strategy of moving capital from one sector to another based on economic cycles.",
  "Book profits partially when your target is reached. Let the rest ride with a trailing stop-loss.",
  "India VIX measures market fear. A rising VIX signals uncertainty — consider reducing position sizes.",
  "Blue-chip stocks are shares of large, well-established companies with a history of stable returns.",
  "Derivatives are used for hedging portfolios. A Nifty Put option can protect your long equity positions.",
  "Pre-market analysis sets the tone for the day. Study global cues, SGX Nifty, and overnight news.",
  "Happy Trading! Consistency and discipline compound into extraordinary results over the long term.",
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getTodayDateString(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  return ist.toISOString().split("T")[0];
}

function getDayOfYear(dateStr: string): number {
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

function isPast11PmIST(): boolean {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  return ist.getUTCHours() >= 23;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── TipOfDayTab ──────────────────────────────────────────────────────────────

function TipOfDayTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [todayStr, setTodayStr] = useState(() => getTodayDateString());
  const [tipIndex, setTipIndex] = useState(() => {
    const stored = localStorage.getItem("ray_tip_date");
    const today = getTodayDateString();
    if (stored === today && !isPast11PmIST()) {
      const idx = Number(localStorage.getItem("ray_tip_index") ?? -1);
      if (idx >= 0) return idx;
    }
    const idx = getDayOfYear(today) % TIPS.length;
    localStorage.setItem("ray_tip_date", today);
    localStorage.setItem("ray_tip_index", String(idx));
    return idx;
  });
  const [countdown, setCountdown] = useState("");
  const [expired, setExpired] = useState(false);

  const tip = TIPS[tipIndex];
  const formattedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const ist = new Date(now.getTime() + istOffset);
      const target = new Date(ist);
      target.setUTCHours(23, 0, 0, 0);
      const diff = target.getTime() - ist.getTime();
      if (diff < 0) {
        setExpired(true);
        setCountdown("Expired");
        return;
      }
      setExpired(false);
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    tick();
    const t = setInterval(tick, 1_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const check = setInterval(() => {
      const newDate = getTodayDateString();
      if (newDate !== todayStr) {
        const idx = getDayOfYear(newDate) % TIPS.length;
        localStorage.setItem("ray_tip_date", newDate);
        localStorage.setItem("ray_tip_index", String(idx));
        setTodayStr(newDate);
        setTipIndex(idx);
        setExpired(false);
      }
    }, 60_000);
    return () => clearInterval(check);
  }, [todayStr]);

  const handleRefresh = () => {
    const newDate = getTodayDateString();
    const idx = getDayOfYear(newDate) % TIPS.length;
    localStorage.setItem("ray_tip_date", newDate);
    localStorage.setItem("ray_tip_index", String(idx));
    setTodayStr(newDate);
    setTipIndex(idx);
    setExpired(false);
    toast.success("Tip refreshed!");
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 390;
    const H = 693;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0f172a");
    bg.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const bar = ctx.createLinearGradient(0, 0, W, 0);
    bar.addColorStop(0, "#d97706");
    bar.addColorStop(1, "#f59e0b");
    ctx.fillStyle = bar;
    ctx.fillRect(0, 0, W, 6);
    ctx.fillStyle = bar;
    ctx.fillRect(0, H - 6, W, 6);

    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let x = 20; x < W; x += 30) {
      for (let y = 30; y < H - 30; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.beginPath();
    ctx.arc(W / 2, 100, 44, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(217,119,6,0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(245,158,11,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const bars = [
      { x: W / 2 - 18, h: 28 },
      { x: W / 2 - 6, h: 40 },
      { x: W / 2 + 6, h: 20 },
      { x: W / 2 + 14, h: 34 },
    ];
    for (const b of bars) {
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(b.x, 100 - b.h / 2, 8, b.h);
    }

    ctx.font = "bold 26px Arial, sans-serif";
    ctx.fillStyle = "#f59e0b";
    ctx.textAlign = "center";
    ctx.fillText("RAY INFOTECH", W / 2, 168);

    ctx.strokeStyle = "rgba(245,158,11,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 182);
    ctx.lineTo(W - 60, 182);
    ctx.stroke();

    ctx.font = "bold 14px Arial, sans-serif";
    ctx.fillStyle = "rgba(245,158,11,0.85)";
    ctx.fillText("TIP OF THE DAY", W / 2, 204);

    const cardY = 224;
    const cardH = 300;
    const cardPad = 24;
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    roundRect(ctx, cardPad, cardY, W - cardPad * 2, cardH, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(245,158,11,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "bold 60px Georgia, serif";
    ctx.fillStyle = "rgba(245,158,11,0.25)";
    ctx.textAlign = "left";
    ctx.fillText("\u201C", cardPad + 16, cardY + 55);

    ctx.font = "500 18px Arial, sans-serif";
    ctx.fillStyle = "#f1f5f9";
    ctx.textAlign = "left";
    const textX = cardPad + 20;
    const textW = W - cardPad * 2 - 40;
    const words = tip.split(" ");
    let line = "";
    const lineH = 28;
    let lineY = cardY + 74;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > textW && line) {
        ctx.fillText(line, textX, lineY);
        line = word;
        lineY += lineH;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, textX, lineY);

    ctx.textAlign = "center";
    ctx.font = "13px Arial, sans-serif";
    ctx.fillStyle = "rgba(148,163,184,0.9)";
    ctx.fillText(formattedDate, W / 2, cardY + cardH + 28);

    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillStyle = "#f59e0b";
    ctx.fillText("Happy Trading! \uD83D\uDCC8", W / 2, H - 80);

    ctx.font = "12px Arial, sans-serif";
    ctx.fillStyle = "rgba(148,163,184,0.5)";
    ctx.fillText("rayinfotech.com", W / 2, H - 52);

    ctx.font = "11px Arial, sans-serif";
    ctx.fillStyle = "rgba(245,158,11,0.5)";
    ctx.fillText(
      "#RayInfotech #StockMarket #TipOfTheDay #Trading",
      W / 2,
      H - 30,
    );
  }, [tip, formattedDate]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCanvas();
    const link = document.createElement("a");
    link.download = `RAY-INFOTECH-Tip-${todayStr}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Tip card downloaded!");
  };

  const handleShare = async () => {
    const text = `\uD83D\uDCC8 RAY INFOTECH \u2014 Tip of the Day\n\n"${tip}"\n\n${formattedDate}\nHappy Trading! \uD83D\uDCC8\n\n#RayInfotech #StockMarket #TipOfTheDay`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "RAY INFOTECH Tip of the Day", text });
        return;
      } catch {
        // fallthrough
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Tip copied to clipboard! Share it on Instagram.");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const generateVideo = async () => {
    const canvas = videoCanvasRef.current;
    if (!canvas) return;
    canvas.width = 390;
    canvas.height = 693;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setVideoGenerating(true);
    setVideoProgress(0);

    const drawVideoFrame = (
      frameCtx: CanvasRenderingContext2D,
      frame: number,
      tipText: string,
      dateStr: string,
    ) => {
      const W = 390;
      const H = 693;

      frameCtx.fillStyle = "#0f172a";
      frameCtx.fillRect(0, 0, W, H);

      frameCtx.fillStyle = "rgba(255,255,255,0.04)";
      for (let x = 20; x < W; x += 30) {
        for (let y = 30; y < H - 30; y += 30) {
          frameCtx.beginPath();
          frameCtx.arc(x, y, 1.5, 0, Math.PI * 2);
          frameCtx.fill();
        }
      }

      const t2 = frame / 360;
      for (let i = 0; i < 20; i++) {
        const px = (i * 73 + 30) % W;
        const py = H - ((t2 * H * 2 + (i * H) / 20) % H);
        const alpha = Math.sin(t2 * Math.PI * 4 + i) * 0.3 + 0.1;
        frameCtx.fillStyle = `rgba(245,158,11,${Math.max(0, alpha)})`;
        frameCtx.beginPath();
        frameCtx.arc(px, py, 2, 0, Math.PI * 2);
        frameCtx.fill();
      }

      const barAlpha = Math.min(1, frame / 60);
      const barGrad = frameCtx.createLinearGradient(0, 0, W, 0);
      barGrad.addColorStop(0, "#d97706");
      barGrad.addColorStop(1, "#f59e0b");
      frameCtx.fillStyle = barGrad;
      frameCtx.globalAlpha = barAlpha;
      frameCtx.fillRect(0, 0, W, 6);
      frameCtx.fillRect(0, H - 6, W, 6);
      frameCtx.globalAlpha = 1;

      if (frame >= 60) {
        const logoT = Math.min(1, (frame - 60) / 60);
        frameCtx.save();
        frameCtx.translate(W / 2, 100);
        frameCtx.scale(logoT, logoT);
        frameCtx.beginPath();
        frameCtx.arc(0, 0, 44, 0, Math.PI * 2);
        frameCtx.fillStyle = "rgba(217,119,6,0.15)";
        frameCtx.fill();
        frameCtx.strokeStyle = `rgba(245,158,11,${0.5 * logoT})`;
        frameCtx.lineWidth = 2;
        frameCtx.stroke();
        const pulse = 44 + Math.sin(frame * 0.2) * 8;
        frameCtx.beginPath();
        frameCtx.arc(0, 0, pulse, 0, Math.PI * 2);
        frameCtx.strokeStyle = `rgba(245,158,11,${0.15 * logoT})`;
        frameCtx.lineWidth = 1;
        frameCtx.stroke();
        const bars2: [number, number][] = [
          [-18, 28],
          [-6, 40],
          [6, 20],
          [14, 34],
        ];
        frameCtx.fillStyle = "#f59e0b";
        for (const [bx, bh] of bars2) {
          frameCtx.fillRect(bx, -bh / 2, 8, bh);
        }
        frameCtx.restore();
      }

      if (frame >= 120) {
        const brand = "RAY INFOTECH";
        const chars = Math.floor(
          Math.min(1, (frame - 120) / 60) * brand.length,
        );
        frameCtx.font = "bold 26px Arial, sans-serif";
        frameCtx.fillStyle = "#f59e0b";
        frameCtx.textAlign = "center";
        frameCtx.fillText(brand.slice(0, chars), W / 2, 168);
        if (chars === brand.length) {
          const divAlpha = Math.min(1, (frame - 175) / 5);
          frameCtx.strokeStyle = `rgba(245,158,11,${0.4 * divAlpha})`;
          frameCtx.lineWidth = 1;
          frameCtx.beginPath();
          frameCtx.moveTo(60, 182);
          frameCtx.lineTo(W - 60, 182);
          frameCtx.stroke();
        }
      }

      if (frame >= 180) {
        const labelAlpha = Math.min(1, (frame - 180) / 60);
        frameCtx.font = "bold 14px Arial, sans-serif";
        frameCtx.fillStyle = `rgba(245,158,11,${0.85 * labelAlpha})`;
        frameCtx.textAlign = "center";
        frameCtx.fillText("TIP OF THE DAY", W / 2, 204);
      }

      if (frame >= 180) {
        const cardAlpha = Math.min(1, (frame - 180) / 30);
        const cardY = 224;
        const cardH2 = 300;
        const cardPad = 24;
        frameCtx.fillStyle = `rgba(255,255,255,${0.05 * cardAlpha})`;
        const r2 = 16;
        frameCtx.beginPath();
        frameCtx.moveTo(cardPad + r2, cardY);
        frameCtx.lineTo(cardPad + (W - cardPad * 2) - r2, cardY);
        frameCtx.quadraticCurveTo(
          cardPad + (W - cardPad * 2),
          cardY,
          cardPad + (W - cardPad * 2),
          cardY + r2,
        );
        frameCtx.lineTo(cardPad + (W - cardPad * 2), cardY + cardH2 - r2);
        frameCtx.quadraticCurveTo(
          cardPad + (W - cardPad * 2),
          cardY + cardH2,
          cardPad + (W - cardPad * 2) - r2,
          cardY + cardH2,
        );
        frameCtx.lineTo(cardPad + r2, cardY + cardH2);
        frameCtx.quadraticCurveTo(
          cardPad,
          cardY + cardH2,
          cardPad,
          cardY + cardH2 - r2,
        );
        frameCtx.lineTo(cardPad, cardY + r2);
        frameCtx.quadraticCurveTo(cardPad, cardY, cardPad + r2, cardY);
        frameCtx.closePath();
        frameCtx.fill();
        frameCtx.strokeStyle = `rgba(245,158,11,${0.2 * cardAlpha})`;
        frameCtx.lineWidth = 1;
        frameCtx.stroke();
        frameCtx.font = "bold 60px Georgia, serif";
        frameCtx.fillStyle = `rgba(245,158,11,${0.25 * cardAlpha})`;
        frameCtx.textAlign = "left";
        frameCtx.fillText("\u201C", cardPad + 16, cardY + 55);
      }

      if (frame >= 240) {
        const words2 = tipText.split(" ");
        const wordsToShow = Math.floor(
          Math.min(words2.length, ((frame - 240) / 90) * words2.length),
        );
        frameCtx.font = "500 17px Arial, sans-serif";
        frameCtx.fillStyle = "#f1f5f9";
        frameCtx.textAlign = "left";
        const cardY = 224;
        const cardPad = 24;
        const textX2 = cardPad + 20;
        const textW2 = W - cardPad * 2 - 40;
        const shown = words2.slice(0, wordsToShow).join(" ");
        const lns: string[] = [];
        let line2 = "";
        for (const w of shown.split(" ")) {
          const test = line2 ? `${line2} ${w}` : w;
          if (frameCtx.measureText(test).width > textW2 && line2) {
            lns.push(line2);
            line2 = w;
          } else {
            line2 = test;
          }
        }
        if (line2) lns.push(line2);
        lns.forEach((l, i) =>
          frameCtx.fillText(l, textX2, cardY + 80 + i * 28),
        );
      }

      if (frame >= 300) {
        const alpha = Math.min(1, (frame - 300) / 30);
        const cardY = 224;
        const cardH2 = 300;
        frameCtx.textAlign = "center";
        frameCtx.font = "13px Arial, sans-serif";
        frameCtx.fillStyle = `rgba(148,163,184,${0.9 * alpha})`;
        frameCtx.fillText(dateStr, W / 2, cardY + cardH2 + 28);
      }

      if (frame >= 330) {
        const alpha = Math.min(1, (frame - 330) / 30);
        frameCtx.textAlign = "center";
        frameCtx.font = "bold 18px Arial, sans-serif";
        frameCtx.fillStyle = `rgba(245,158,11,${alpha})`;
        frameCtx.fillText("Happy Trading! \uD83D\uDCC8", W / 2, H - 80);
        frameCtx.font = "12px Arial, sans-serif";
        frameCtx.fillStyle = `rgba(148,163,184,${0.5 * alpha})`;
        frameCtx.fillText("rayinfotech.com", W / 2, H - 52);
        frameCtx.font = "11px Arial, sans-serif";
        frameCtx.fillStyle = `rgba(245,158,11,${0.5 * alpha})`;
        frameCtx.fillText(
          "#RayInfotech #StockMarket #TipOfTheDay #Trading",
          W / 2,
          H - 30,
        );
      }
    };

    const mimeType =
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
        ? "video/webm;codecs=vp8"
        : "video/webm";

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 4_000_000,
    });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RAY-INFOTECH-Tip-VIDEO-${todayStr}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setVideoGenerating(false);
      setVideoProgress(100);
      toast.success("Video downloaded! Ready for Instagram Reels.");
    };

    recorder.start();
    let frame = 0;
    const TOTAL_FRAMES = 360;

    const animate = () => {
      drawVideoFrame(ctx, frame, tip, formattedDate);
      setVideoProgress(Math.floor((frame / TOTAL_FRAMES) * 100));
      frame++;
      if (frame <= TOTAL_FRAMES) {
        requestAnimationFrame(animate);
      } else {
        recorder.stop();
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="space-y-6" data-ocid="tipofday.section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp size={18} className="text-gold-400" />
            Tip of the Day
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto-generated daily tip card &mdash; ready to share on Instagram
            Reels
          </p>
        </div>
        <div className="flex items-center gap-2">
          {expired ? (
            <Badge
              variant="outline"
              className="text-red-400 border-red-500/30 bg-red-500/10"
            >
              Expired
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-green-400 border-green-500/30 bg-green-500/10"
            >
              <Clock size={10} className="mr-1" />
              Resets in {countdown}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="text-xs"
            data-ocid="tipofday.secondary_button"
          >
            <RefreshCw size={12} className="mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card Preview */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Instagram size={15} className="text-pink-400" />
                Preview &mdash; Instagram Reels Card (9:16)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {/* 9:16 portrait card */}
              <div
                style={{
                  width: "100%",
                  maxWidth: 280,
                  margin: "0 auto",
                  aspectRatio: "9/16",
                  background: "linear-gradient(180deg,#0f172a 0%,#1e1b4b 100%)",
                  borderRadius: 16,
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0 16px",
                }}
              >
                {/* Top gold bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: "linear-gradient(90deg,#d97706,#f59e0b)",
                  }}
                />
                {/* Bottom gold bar */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: "linear-gradient(90deg,#d97706,#f59e0b)",
                  }}
                />

                {/* Logo circle */}
                <div
                  style={{
                    marginTop: 32,
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(217,119,6,0.15)",
                    border: "2px solid rgba(245,158,11,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BarChart2 size={30} style={{ color: "#f59e0b" }} />
                </div>

                {/* Brand name */}
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#f59e0b",
                    letterSpacing: "0.05em",
                    textAlign: "center",
                  }}
                >
                  RAY INFOTECH
                </div>

                {/* Divider */}
                <div
                  style={{
                    width: "60%",
                    height: 1,
                    background: "rgba(245,158,11,0.4)",
                    margin: "10px 0 8px",
                  }}
                />

                {/* TIP OF THE DAY label */}
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(245,158,11,0.85)",
                    letterSpacing: "0.2em",
                    marginBottom: 12,
                  }}
                >
                  TIP OF THE DAY
                </div>

                {/* Tip card */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: 12,
                    padding: "16px 14px",
                    width: "100%",
                    position: "relative",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    maxHeight: 220,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 6,
                      left: 10,
                      fontSize: 38,
                      color: "rgba(245,158,11,0.2)",
                      fontFamily: "Georgia, serif",
                      lineHeight: 1,
                    }}
                  >
                    &ldquo;
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "#f1f5f9",
                      textAlign: "center",
                      margin: 0,
                      paddingTop: 16,
                      fontWeight: 500,
                    }}
                  >
                    {tip}
                  </p>
                </div>

                {/* Date */}
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    color: "rgba(148,163,184,0.9)",
                  }}
                >
                  {formattedDate}
                </div>

                {/* Happy Trading */}
                <div
                  style={{
                    marginTop: "auto",
                    paddingBottom: 28,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#f59e0b",
                      marginBottom: 4,
                    }}
                  >
                    Happy Trading! \uD83D\uDCC8
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(148,163,184,0.5)" }}>
                    rayinfotech.com
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "rgba(245,158,11,0.45)",
                      marginTop: 4,
                    }}
                  >
                    #RayInfotech #StockMarket #TipOfTheDay
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hidden canvas for PNG generation */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
          {/* Hidden canvas for video generation */}
          <canvas ref={videoCanvasRef} style={{ display: "none" }} />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
              onClick={handleDownload}
              data-ocid="tipofday.primary_button"
            >
              <Download size={15} className="mr-2" />
              Download PNG
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-green-400 border-green-500/30 hover:bg-green-500/10"
              onClick={handleShare}
              data-ocid="tipofday.secondary_button"
            >
              <Share2 size={15} className="mr-2" />
              Share / Copy
            </Button>
          </div>

          {/* Generate Video Button */}
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold mt-2"
            onClick={generateVideo}
            disabled={videoGenerating}
            data-ocid="tipofday.secondary_button"
          >
            <Video size={15} className="mr-2" />
            {videoGenerating
              ? `Generating... ${videoProgress}%`
              : "Generate Video for Instagram Reels"}
          </Button>
          {videoGenerating && (
            <div
              className="w-full bg-muted rounded-full h-2 mt-2"
              data-ocid="tipofday.loading_state"
            >
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full transition-all"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb size={15} className="text-gold-400" />
                Today's Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="border-l-4 border-gold-500/60 pl-4 py-1">
                <p className="text-base font-medium leading-relaxed">{tip}</p>
              </blockquote>
              <p className="text-xs text-muted-foreground mt-3">
                \uD83D\uDCC5 {formattedDate} &mdash; Tip #{tipIndex + 1} of{" "}
                {TIPS.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock size={15} className="text-blue-400" />
                Auto-Reset Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Daily reset time</span>
                <span className="font-semibold">11:00 PM IST</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Time remaining</span>
                <span
                  className={`font-semibold ${
                    expired ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {countdown}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Total tips</span>
                <span className="font-semibold">{TIPS.length} tips</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Instagram size={15} className="text-pink-400" />
                How to Share
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>
                1. Click <strong>Download PNG</strong> to save the card image.
              </p>
              <p>
                2. Or click <strong>Generate Video</strong> to create a
                12-second animated WebM.
              </p>
              <p>
                3. Open Instagram &rarr; Create Reel &rarr; Upload the file.
              </p>
              <p>
                4. Use the <strong>Share / Copy</strong> button to copy caption
                &amp; hashtags.
              </p>
              <p className="text-xs text-muted-foreground/60">
                Video format: WebM (supported on Android). Convert to MP4 on iOS
                if needed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Video Player ─────────────────────────────────────────────────────────────

function VideoPlayer({ url }: { url: string }) {
  const isInstagram = url.includes("instagram.com");
  const isDirectVideo =
    url.endsWith(".mp4") ||
    url.endsWith(".webm") ||
    url.endsWith(".mov") ||
    url.startsWith("blob:");
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

  const getYouTubeEmbed = (u: string) => {
    const match = u.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : u;
  };

  if (isInstagram) {
    return (
      <div className="text-center py-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-400 text-sm underline flex items-center justify-center gap-1"
        >
          <Instagram size={14} />
          View on Instagram
        </a>
      </div>
    );
  }

  if (isDirectVideo) {
    return (
      <video
        src={url}
        controls
        className="w-full rounded-lg max-h-64"
        playsInline
      >
        <track kind="captions" />
      </video>
    );
  }

  if (isYouTube) {
    return (
      <iframe
        src={getYouTubeEmbed(url)}
        className="w-full rounded-lg"
        style={{ aspectRatio: "16/9" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Market video"
      />
    );
  }

  return (
    <div className="text-center py-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 text-sm underline"
      >
        Open video link
      </a>
    </div>
  );
}

// ─── Daily Videos Tab ─────────────────────────────────────────────────────────

function DailyVideosTab() {
  const [videos, setVideos] = useState<DailyVideo[]>(() => getDailyVideos());
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = getDailyVideos();
      setVideos(updated);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const reload = () => setVideos(getDailyVideos());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!videoUrl.trim() && !videoFile) {
      toast.error("Please enter a URL or upload a file");
      return;
    }

    setUploading(true);
    let finalUrl = videoUrl.trim();

    if (videoFile) {
      finalUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(videoFile);
      });
    }

    addDailyVideo({
      title: title.trim(),
      caption: caption.trim() || undefined,
      videoUrl: finalUrl,
    });

    setTitle("");
    setCaption("");
    setVideoUrl("");
    setVideoFile(null);
    setUploading(false);
    reload();
    toast.success("Video added successfully!");
  };

  const handleDelete = (id: string) => {
    deleteDailyVideo(id);
    reload();
    toast.success("Video deleted");
  };

  const handleClearAll = () => {
    clearDailyVideos();
    reload();
    toast.success("All videos cleared");
  };

  const handleShare = async (video: DailyVideo) => {
    const text = `\uD83D\uDCC8 ${video.title}\n${video.caption ? `\n${video.caption}\n` : ""}\n${video.videoUrl}\n\n#RayInfotech #StockMarket #Trading`;
    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, text });
        return;
      } catch {
        // fallthrough
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard! Share it on Instagram.");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="space-y-6" data-ocid="videos.section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Video size={20} className="text-gold-400" />
            Daily Market Videos
          </h2>
          <p className="text-xs text-muted-foreground">
            Videos are automatically deleted at 11:00 PM IST daily
          </p>
        </div>
        {videos.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs"
            data-ocid="videos.delete_button"
          >
            <Trash2 size={12} className="mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Add New */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Add New Market Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="video-title">Title</Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Today's Market Update"
              data-ocid="videos.input"
            />
          </div>
          <div>
            <Label htmlFor="video-caption">Caption (optional)</Label>
            <Input
              id="video-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Short description for Instagram"
              data-ocid="videos.input"
            />
          </div>
          <div>
            <Label htmlFor="video-url">Video URL</Label>
            <Input
              id="video-url"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                if (e.target.value) setVideoFile(null);
              }}
              placeholder="YouTube / Instagram / .mp4 URL"
              data-ocid="videos.input"
            />
          </div>
          <div>
            <Label>Upload Video File</Label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="block mt-1 text-sm text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gold-500/20 file:text-gold-400 hover:file:bg-gold-500/30"
              data-ocid="videos.upload_button"
            />
            {videoFile && (
              <p className="text-xs text-green-400 mt-1">
                Selected: {videoFile.name}
              </p>
            )}
          </div>
          <Button
            onClick={handleAdd}
            disabled={uploading}
            className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
            data-ocid="videos.primary_button"
          >
            <Video size={15} className="mr-2" />
            {uploading ? "Uploading..." : "Add Video"}
          </Button>
        </CardContent>
      </Card>

      {/* Videos List */}
      {videos.length === 0 ? (
        <Card>
          <CardContent
            className="p-8 text-center text-muted-foreground"
            data-ocid="videos.empty_state"
          >
            <Video size={32} className="mx-auto mb-2 opacity-30" />
            No videos added today. Add one above to share on your Instagram
            channel.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {videos.map((video, idx) => (
            <Card key={video.id} data-ocid={`videos.item.${idx + 1}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{video.title}</div>
                    {video.caption && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {video.caption}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Added:{" "}
                      {new Date(video.addedAt).toLocaleTimeString("en-IN")}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-green-400 border-green-500/30 hover:bg-green-500/10"
                      onClick={() => handleShare(video)}
                    >
                      <Instagram size={12} className="mr-1" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                      onClick={() => handleDelete(video.id)}
                      data-ocid={`videos.delete_button.${idx + 1}`}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
                <VideoPlayer url={video.videoUrl} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin Login Form ─────────────────────────────────────────────────────────

function AdminLoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email.trim(), password);
    setLoading(false);
    if (!ok) {
      toast.error("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gold-500/20 border border-gold-500/40 rounded-xl flex items-center justify-center">
            <BarChart2 size={22} className="text-gold-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-gold-400 tracking-wider">
              RAY INFOTECH
            </div>
            <div className="text-xs text-muted-foreground">
              Demo Trading Platform
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-gold-400" />
            <h2 className="text-xl font-bold">Admin Login</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Access the admin control panel
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                required
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="pr-10"
                  data-ocid="admin.input"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
              data-ocid="admin.submit_button"
            >
              <Shield size={15} className="mr-2" />
              {loading ? "Signing in..." : "Sign In as Admin"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          Not an admin?{" "}
          <a href="/login" className="text-gold-400 hover:text-gold-300">
            Member login &rarr;
          </a>
        </p>
      </div>
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [_loadingUsers, setLoadingUsers] = useState(false);

  const reload = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const all = await backendGetAllUsers();
      setUsers(all);
    } catch {
      setUsers(getUsers());
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 10000);
    return () => clearInterval(interval);
  }, [reload]);

  if (!isAdmin) return <AdminLoginForm />;

  const approveKyc = async (u: User) => {
    const updated = { ...u, kycStatus: "approved" as const };
    if (updated.paymentStatus === "approved") updated.virtualBalance = 1000000;
    updateUser(updated);
    await backendUpdateUser(updated);
    if (updated.paymentStatus === "approved" && updated.referredBy) {
      const credited = creditReferralBonus(updated);
      await backendCreditReferral(updated.referredBy);
      if (credited) {
        toast.success(
          `\u20b95 referral bonus credited to ${updated.referredBy}`,
        );
      }
    }
    reload();
    toast.success(`KYC approved for ${u.name}`);
  };

  const rejectKyc = async (u: User) => {
    const updated = { ...u, kycStatus: "rejected" as const };
    updateUser(updated);
    await backendUpdateUser(updated);
    reload();
    toast.error(`KYC rejected for ${u.name}`);
  };

  const approvePayment = async (u: User) => {
    const updated = { ...u, paymentStatus: "approved" as const };
    if (updated.kycStatus === "approved") updated.virtualBalance = 1000000;
    updateUser(updated);
    await backendUpdateUser(updated);
    if (updated.kycStatus === "approved" && updated.referredBy) {
      const credited = creditReferralBonus(updated);
      await backendCreditReferral(updated.referredBy);
      if (credited) {
        toast.success(
          `\u20b95 referral bonus credited to ${updated.referredBy}`,
        );
      }
    }
    reload();
    toast.success(`Payment approved for ${u.name}`);
  };

  const rejectPayment = async (u: User) => {
    const updated = { ...u, paymentStatus: "rejected" as const };
    updateUser(updated);
    await backendUpdateUser(updated);
    reload();
    toast.error(`Payment rejected for ${u.name}`);
  };

  const toggleDebar = async (u: User) => {
    const newStatus =
      u.accountStatus === "active"
        ? ("debarred" as const)
        : ("active" as const);
    const updated = { ...u, accountStatus: newStatus };
    updateUser(updated);
    await backendUpdateUser(updated);
    reload();
    toast.success(
      `${u.name} ${newStatus === "debarred" ? "debarred" : "activated"}`,
    );
  };

  const trades = getTrades();
  const pendingKyc = users.filter((u) => u.kycStatus === "pending");
  const pendingPayment = users.filter((u) => u.paymentStatus === "pending");
  const activeMembers = users.filter(
    (u) => u.kycStatus === "approved" && u.paymentStatus === "approved",
  );

  const fmt = (n: number) =>
    `\u20b9${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
      approved: "bg-green-500/15 text-green-400 border-green-500/30",
      rejected: "bg-red-500/15 text-red-400 border-red-500/30",
      pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      active: "bg-green-500/15 text-green-400 border-green-500/30",
      debarred: "bg-red-500/15 text-red-400 border-red-500/30",
    };
    return (
      <Badge variant="outline" className={`text-xs ${map[status] || ""}`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Admin Panel</h1>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" data-ocid="admin.tab">
            Overview
          </TabsTrigger>
          <TabsTrigger value="members" data-ocid="admin.tab">
            Members ({users.length})
          </TabsTrigger>
          <TabsTrigger value="kyc" data-ocid="admin.tab">
            KYC ({pendingKyc.length})
          </TabsTrigger>
          <TabsTrigger value="payments" data-ocid="admin.tab">
            Payments ({pendingPayment.length})
          </TabsTrigger>
          <TabsTrigger value="portfolios" data-ocid="admin.tab">
            Portfolios
          </TabsTrigger>
          <TabsTrigger value="videos" data-ocid="admin.tab">
            <Video size={14} className="mr-1" />
            Daily Videos
          </TabsTrigger>
          <TabsTrigger value="tipofday" data-ocid="admin.tab">
            <TrendingUp size={14} className="mr-1" />
            Tip of Day
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Members",
                value: users.length,
                icon: <Users size={20} />,
              },
              {
                label: "Pending KYC",
                value: pendingKyc.length,
                icon: <XCircle size={20} />,
              },
              {
                label: "Pending Payments",
                value: pendingPayment.length,
                icon: <XCircle size={20} />,
              },
              {
                label: "Active Traders",
                value: activeMembers.length,
                icon: <CheckCircle size={20} />,
              },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                    {s.icon}
                    {s.label}
                  </div>
                  <div className="text-2xl font-bold">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Registrations</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {users
                  .slice(-5)
                  .reverse()
                  .map((u) => (
                    <div
                      key={u.id}
                      className="flex justify-between py-2 border-b border-border last:border-0 text-sm"
                    >
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          {u.id}
                          {u.referredBy && (
                            <span className="flex items-center gap-0.5 text-green-400 ml-1">
                              <Gift size={10} />
                              ref: {u.referredBy}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {fmtDate(u.createdAt)}
                      </div>
                    </div>
                  ))}
                {users.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No members yet
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Trade Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-2xl font-bold">{trades.length}</div>
                <div className="text-xs text-muted-foreground">
                  Total trades placed
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members */}
        <TabsContent value="members">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left p-3">Member</th>
                    <th className="text-left p-3">Contact</th>
                    <th className="text-left p-3">KYC</th>
                    <th className="text-left p-3">Payment</th>
                    <th className="text-left p-3">Balance</th>
                    <th className="text-left p-3">Referral</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr
                      key={u.id}
                      className="border-b border-border last:border-0"
                      data-ocid={`members.item.${idx + 1}`}
                    >
                      <td className="p-3">
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {u.id}
                        </div>
                        {u.referredBy && (
                          <div className="flex items-center gap-1 text-xs text-green-400 mt-0.5">
                            <Gift size={10} />
                            ref: {u.referredBy}
                          </div>
                        )}
                        {u.tcSignature && (
                          <div className="text-xs text-blue-400 mt-0.5">
                            \u2713 T&C Signed
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-xs">
                        <div>{u.email}</div>
                        <div className="text-muted-foreground">{u.phone}</div>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={u.kycStatus} />
                        {u.selfie && (
                          <img
                            src={u.selfie}
                            alt="Selfie"
                            className="w-8 h-8 rounded-full object-cover mt-1 border border-border"
                          />
                        )}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={u.paymentStatus} />
                      </td>
                      <td className="p-3 text-xs font-semibold">
                        {fmt(u.virtualBalance)}
                      </td>
                      <td className="p-3 text-xs font-semibold text-green-400">
                        {u.referralBonus ? fmt(u.referralBonus) : "\u2014"}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={u.accountStatus} />
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleDebar(u)}
                          className="text-xs"
                          data-ocid={`members.toggle.${idx + 1}`}
                        >
                          {u.accountStatus === "active" ? "Debar" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-8 text-center text-muted-foreground"
                        data-ocid="members.empty_state"
                      >
                        No members registered yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC */}
        <TabsContent value="kyc">
          {pendingKyc.length === 0 ? (
            <Card>
              <CardContent
                className="p-8 text-center text-muted-foreground"
                data-ocid="kyc.empty_state"
              >
                No pending KYC approvals
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingKyc.map((u, idx) => (
                <Card key={u.id} data-ocid={`kyc.item.${idx + 1}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">
                          {u.name}{" "}
                          <span className="text-xs text-muted-foreground font-mono ml-2">
                            {u.id}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span>Aadhaar: {u.aadhaar}</span> |{" "}
                          <span>PAN: {u.pan}</span>
                          {u.digilockerRef && (
                            <span> | DigiLocker: {u.digilockerRef}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          Joined: {fmtDate(u.createdAt)}
                          {u.referredBy && (
                            <span className="flex items-center gap-1 text-green-400">
                              <Gift size={11} />
                              Referred by {u.referredBy}
                            </span>
                          )}
                        </div>
                        {u.selfie && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground mb-1">
                              Selfie:
                            </div>
                            <img
                              src={u.selfie}
                              alt="KYC Selfie"
                              className="w-16 h-16 rounded-lg object-cover border border-border"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                          onClick={() => approveKyc(u)}
                          data-ocid={`kyc.confirm_button.${idx + 1}`}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs"
                          onClick={() => rejectKyc(u)}
                          data-ocid={`kyc.delete_button.${idx + 1}`}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          {pendingPayment.length === 0 ? (
            <Card>
              <CardContent
                className="p-8 text-center text-muted-foreground"
                data-ocid="payments.empty_state"
              >
                No pending payment approvals
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingPayment.map((u, idx) => (
                <Card key={u.id} data-ocid={`payments.item.${idx + 1}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold">
                          {u.name}{" "}
                          <span className="text-xs text-muted-foreground font-mono ml-2">
                            {u.id}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Amount: \u20b91 | UPI
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          Joined: {fmtDate(u.createdAt)}
                          {u.referredBy && (
                            <span className="flex items-center gap-1 text-green-400">
                              <Gift size={11} />
                              Referred by {u.referredBy}
                            </span>
                          )}
                        </div>
                      </div>
                      {u.paymentProof && (
                        <div className="flex-shrink-0">
                          <img
                            src={u.paymentProof}
                            alt="Payment Proof"
                            className="w-20 h-20 object-cover rounded-lg border border-border"
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                          onClick={() => approvePayment(u)}
                          data-ocid={`payments.confirm_button.${idx + 1}`}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs"
                          onClick={() => rejectPayment(u)}
                          data-ocid={`payments.delete_button.${idx + 1}`}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Portfolios */}
        <TabsContent value="portfolios">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left p-3">Member</th>
                    <th className="text-right p-3">Virtual Balance</th>
                    <th className="text-right p-3">Referral Bonus</th>
                    <th className="text-right p-3">Trades</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => {
                    const userTrades = trades.filter((t) => t.userId === u.id);
                    return (
                      <tr
                        key={u.id}
                        className="border-b border-border last:border-0"
                        data-ocid={`portfolios.item.${idx + 1}`}
                      >
                        <td className="p-3">
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {u.id}
                          </div>
                        </td>
                        <td className="text-right p-3 font-semibold">
                          {fmt(u.virtualBalance)}
                        </td>
                        <td className="text-right p-3 font-semibold text-green-400">
                          {u.referralBonus ? fmt(u.referralBonus) : "\u2014"}
                        </td>
                        <td className="text-right p-3">{userTrades.length}</td>
                        <td className="p-3">
                          <StatusBadge status={u.accountStatus} />
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-muted-foreground"
                        data-ocid="portfolios.empty_state"
                      >
                        No members yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Videos */}
        <TabsContent value="videos">
          <DailyVideosTab />
        </TabsContent>

        {/* Tip of Day */}
        <TabsContent value="tipofday">
          <TipOfDayTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
