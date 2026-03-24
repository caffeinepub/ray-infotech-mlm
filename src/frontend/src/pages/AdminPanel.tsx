import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart2,
  CheckCircle,
  Clock,
  Copy,
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
  Upload,
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

// ─── Tips Data ────────────────────────────────────────────────────────────────

const TIPS: string[] = [
  "Always invest with a stop-loss to protect your capital.",
  "Diversify your portfolio — don't put all your eggs in one basket.",
  "Understand a company's fundamentals before buying its stock.",
  "Intraday trading requires discipline and quick decision-making.",
  "Never invest money you can't afford to lose.",
  "Bull markets can make you feel like a genius — stay humble.",
  "Cut your losses short and let your profits run.",
  "Study candlestick patterns to understand market sentiment.",
  "The trend is your friend — trade with the trend.",
  "News events can cause sharp price movements — trade carefully.",
  "A rising P/E ratio may indicate overvaluation — compare with sector peers.",
  "Book partial profits when a stock hits your target to lock in gains.",
  "Volume confirms price — high volume on breakouts is a strong signal.",
  "Don't chase stocks already up 10%+ in a single day.",
  "Patience is your most profitable trading skill.",
  "Sector rotation drives markets — identify which sector is leading.",
  "Use moving averages to identify trend direction and support levels.",
  "Never average down on a fundamentally broken stock.",
  "Sensex and Nifty 50 are your market pulse — track them daily.",
  "F&O trading amplifies both profits and losses — use with caution.",
  "Blue-chip stocks offer stability; small-caps offer growth potential.",
  "SEBI regulations protect your interests as an investor — stay informed.",
  "Quarterly earnings results can make or break a stock's trend.",
  "Keep a trading journal — review your wins and losses weekly.",
  "Market corrections are opportunities, not disasters.",
  "ETFs give instant diversification at low cost — great for beginners.",
  "The 52-week high/low tells you where a stock has been; research tells you where it's going.",
  "Don't let emotions drive your trades — stick to your strategy.",
  "FII and DII flows influence market direction significantly.",
  "Options decay (theta) works against buyers — be mindful of expiry.",
  "A strong balance sheet with low debt is a sign of a quality company.",
  "Technical analysis helps with timing; fundamental analysis helps with selection.",
  "Risk management is more important than any trading strategy.",
  "Avoid over-leveraging in futures — one bad trade can wipe your account.",
  "Consistent small gains beat occasional large wins over the long run.",
];

function getTodayDateString(): string {
  const now = new Date();
  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, "0")}-${String(ist.getUTCDate()).padStart(2, "0")}`;
}

function getDayOfYear(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, 0, 0));
  const date = new Date(Date.UTC(y, m - 1, d));
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

function isPast11PmIST(): boolean {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  return ist.getUTCHours() >= 23;
}

// ─── Tip of Day Tab ───────────────────────────────────────────────────────────

function TipOfDayTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Countdown to 11 PM IST
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const ist = new Date(now.getTime() + istOffset);
      // Target: 23:00 IST
      const target = new Date(ist);
      target.setUTCHours(23, 0, 0, 0);
      let diff = target.getTime() - ist.getTime();
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

  // Auto-refresh tip at midnight IST
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

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0f172a");
    bg.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Decorative top bar
    const bar = ctx.createLinearGradient(0, 0, W, 0);
    bar.addColorStop(0, "#d97706");
    bar.addColorStop(1, "#f59e0b");
    ctx.fillStyle = bar;
    ctx.fillRect(0, 0, W, 6);

    // Decorative bottom bar
    ctx.fillStyle = bar;
    ctx.fillRect(0, H - 6, W, 6);

    // Subtle grid dots
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let x = 20; x < W; x += 30) {
      for (let y = 30; y < H - 30; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Brand circle
    ctx.beginPath();
    ctx.arc(W / 2, 100, 44, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(217,119,6,0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(245,158,11,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Chart bar icon (simplified)
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

    // RAY INFOTECH title
    ctx.font = "bold 26px Arial, sans-serif";
    ctx.fillStyle = "#f59e0b";
    ctx.textAlign = "center";
    ctx.fillText("RAY INFOTECH", W / 2, 168);

    // Divider
    ctx.strokeStyle = "rgba(245,158,11,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 182);
    ctx.lineTo(W - 60, 182);
    ctx.stroke();

    // TIP OF THE DAY
    ctx.font = "bold 14px Arial, sans-serif";
    ctx.fillStyle = "rgba(245,158,11,0.85)";
    ctx.letterSpacing = "4px";
    ctx.fillText("TIP OF THE DAY", W / 2, 204);
    ctx.letterSpacing = "0px";

    // Tip card background
    const cardY = 224;
    const cardH = 300;
    const cardPad = 24;
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    roundRect(ctx, cardPad, cardY, W - cardPad * 2, cardH, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(245,158,11,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Quote mark
    ctx.font = "bold 60px Georgia, serif";
    ctx.fillStyle = "rgba(245,158,11,0.25)";
    ctx.fillText("\u201C", cardPad + 16, cardY + 55);

    // Tip text word wrap
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

    // Date
    ctx.textAlign = "center";
    ctx.font = "13px Arial, sans-serif";
    ctx.fillStyle = "rgba(148,163,184,0.9)";
    ctx.fillText(formattedDate, W / 2, cardY + cardH + 28);

    // Happy Trading footer
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillStyle = "#f59e0b";
    ctx.fillText("Happy Trading! \uD83D\uDCC8", W / 2, H - 80);

    // Watermark
    ctx.font = "12px Arial, sans-serif";
    ctx.fillStyle = "rgba(148,163,184,0.5)";
    ctx.fillText("rayinfotech.com", W / 2, H - 52);

    // Bottom hashtags
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
    const text = `📈 RAY INFOTECH — Tip of the Day\n\n"${tip}"\n\n${formattedDate}\nHappy Trading! 📈\n\n#RayInfotech #StockMarket #TipOfTheDay`;
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

  return (
    <div className="space-y-6" data-ocid="tipofday.section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Lightbulb size={20} className="text-gold-400" />
            Tip of the Day
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Auto-generated daily tip card — ready to share on Instagram Reels
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`flex items-center gap-1.5 ${
              expired
                ? "bg-red-500/10 text-red-400 border-red-500/30"
                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
            }`}
          >
            <Clock size={12} />
            {expired
              ? "Expired — refresh for next tip"
              : `Resets in: ${countdown}`}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="text-gold-400 border-gold-500/30 hover:bg-gold-500/10 text-xs"
            onClick={handleRefresh}
            data-ocid="tipofday.secondary_button"
          >
            <RefreshCw size={12} className="mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Canvas Preview (hidden) + Styled HTML card preview */}
        <div className="space-y-4">
          <Card className="overflow-hidden border border-gold-500/20">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb size={13} className="text-gold-400" />
                Preview — Instagram Reels Card (9:16)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {/* Styled HTML tip card */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "9/16",
                  maxWidth: 320,
                  margin: "0 auto",
                  background:
                    "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
                  borderRadius: 16,
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0 20px",
                  boxShadow: "0 0 40px rgba(245,158,11,0.15)",
                }}
                data-ocid="tipofday.card"
              >
                {/* Top bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "linear-gradient(90deg, #d97706, #f59e0b)",
                  }}
                />
                {/* Bottom bar */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "linear-gradient(90deg, #d97706, #f59e0b)",
                  }}
                />

                {/* Logo circle */}
                <div
                  style={{
                    marginTop: "10%",
                    width: 70,
                    height: 70,
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
                    Happy Trading! 📈
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
                📅 {formattedDate} — Tip #{tipIndex + 1} of {TIPS.length}
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
                  className={`font-mono font-semibold ${
                    expired ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {expired ? "Expired" : countdown}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Current tip index</span>
                <span className="font-semibold">
                  {tipIndex + 1} / {TIPS.length}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">
                  Today's date (IST)
                </span>
                <span className="font-semibold">{todayStr}</span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Tips rotate daily by day-of-year index. At 11 PM IST, the tip is
                marked expired. A new tip auto-loads at midnight IST.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                All Tips ({TIPS.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {TIPS.map((t, i) => (
                  <div
                    key={t.slice(0, 30)}
                    className={`text-xs p-2 rounded-lg border ${
                      i === tipIndex
                        ? "bg-gold-500/10 border-gold-500/40 text-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold text-gold-400 mr-1">
                      #{i + 1}
                    </span>
                    {t}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AdminLoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = login(email.trim(), password);
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
            Member login →
          </a>
        </p>
      </div>
    </div>
  );
}

// ─── Video Player ─────────────────────────────────────────────────────────────

function VideoPlayer({ url }: { url: string }) {
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const isInstagram = url.includes("instagram.com");
  const isDirectVideo =
    url.startsWith("blob:") ||
    url.startsWith("data:video") ||
    url.endsWith(".mp4") ||
    url.endsWith(".webm") ||
    url.endsWith(".mov");

  if (isYouTube) {
    let embedUrl = url;
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
    );
    if (ytMatch) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    return (
      <iframe
        src={embedUrl}
        className="w-full aspect-video rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    );
  }

  if (isInstagram) {
    let embedUrl = url;
    if (!url.includes("/embed")) {
      embedUrl = `${url.replace(/\/$/, "")}/embed`;
    }
    return (
      <iframe
        src={embedUrl}
        className="w-full rounded-lg"
        style={{ minHeight: 480 }}
        allowFullScreen
        title="Instagram reel"
      />
    );
  }

  if (isDirectVideo) {
    return (
      <video
        src={url}
        controls
        className="w-full aspect-video rounded-lg bg-black"
      >
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <div className="space-y-2">
      <video
        src={url}
        controls
        className="w-full aspect-video rounded-lg bg-black"
      >
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-400 underline break-all"
      >
        {url}
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
  const [fileObjectUrl, setFileObjectUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const check = () => {
      const updated = getDailyVideos();
      setVideos(updated);
    };
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const ist = new Date(now.getTime() + istOffset);
      const target = new Date(ist);
      target.setUTCHours(23, 0, 0, 0);
      let diff = target.getTime() - ist.getTime();
      if (diff < 0) diff = 0;
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    tick();
    const t = setInterval(tick, 1_000);
    return () => clearInterval(t);
  }, []);

  const reload = () => setVideos(getDailyVideos());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl);
    const objUrl = URL.createObjectURL(file);
    setFileObjectUrl(objUrl);
    setVideoUrl("");
    toast.success(`File "${file.name}" selected`);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = fileObjectUrl || videoUrl.trim();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!finalUrl) {
      toast.error("Please enter a video URL or upload a file");
      return;
    }
    addDailyVideo({
      title: title.trim(),
      caption: caption.trim() || undefined,
      videoUrl: finalUrl,
    });
    setTitle("");
    setCaption("");
    setVideoUrl("");
    setFileObjectUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    toast.success("All daily videos cleared");
  };

  const handleShare = async (video: DailyVideo) => {
    const text = `Market Update: ${video.title}${video.caption ? ` — ${video.caption}` : ""}`;
    const shareData = { title: video.title, text, url: video.videoUrl };
    if (navigator.share && !video.videoUrl.startsWith("blob:")) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fallthrough to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${video.videoUrl}`);
      toast.success("Copied to clipboard! Share it on Instagram.");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Video size={20} className="text-gold-400" />
            Daily Market Videos
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Videos are automatically deleted at 11:00 PM IST daily
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-400 border-amber-500/30 flex items-center gap-1.5"
          >
            <Clock size={12} />
            Auto-deletes at 11:00 PM IST
          </Badge>
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-400 border-blue-500/30 flex items-center gap-1.5"
          >
            <Clock size={12} />
            {countdown} remaining
          </Badge>
          {videos.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs"
              onClick={handleClearAll}
              data-ocid="daily_videos.delete_button"
            >
              <Trash2 size={12} className="mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Upload size={15} />
            Add New Market Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="video-title">Title *</Label>
                <Input
                  id="video-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Today's Market Update"
                  required
                  data-ocid="daily_videos.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (e.target.value) setFileObjectUrl("");
                  }}
                  placeholder="YouTube / Instagram / .mp4 URL"
                  data-ocid="daily_videos.input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="video-caption">Caption (optional)</Label>
              <Textarea
                id="video-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Short description or market insights..."
                rows={2}
                data-ocid="daily_videos.textarea"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Upload Video File</Label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="video-file"
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-dashed border-border hover:border-gold-500/50 hover:bg-gold-500/5 transition-colors text-sm text-muted-foreground"
                  data-ocid="daily_videos.upload_button"
                >
                  <Upload size={15} />
                  Choose video file
                  <input
                    id="video-file"
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {fileObjectUrl && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle size={12} />
                    File selected
                  </span>
                )}
              </div>
              {fileObjectUrl && (
                <video
                  src={fileObjectUrl}
                  controls
                  className="w-full max-w-xs aspect-video rounded-lg bg-black mt-2"
                >
                  <track kind="captions" />
                </video>
              )}
            </div>

            <Button
              type="submit"
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
              data-ocid="daily_videos.submit_button"
            >
              <Video size={15} className="mr-2" />
              Add Video
            </Button>
          </form>
        </CardContent>
      </Card>

      {videos.length === 0 ? (
        <Card data-ocid="daily_videos.empty_state">
          <CardContent className="p-10 text-center">
            <Video
              size={40}
              className="mx-auto text-muted-foreground/40 mb-3"
            />
            <p className="text-muted-foreground font-medium">
              No videos added today
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add your first market update video above
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video, idx) => (
            <Card
              key={video.id}
              className="overflow-hidden"
              data-ocid={`daily_videos.item.${idx + 1}`}
            >
              <div className="bg-black/50">
                <VideoPlayer url={video.videoUrl} />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-sm leading-tight">
                    {video.title}
                  </h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <Clock size={10} />
                    {fmtTime(video.addedAt)}
                  </span>
                </div>
                {video.caption && (
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {video.caption}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs text-green-400 border-green-500/30 hover:bg-green-500/10"
                    onClick={() => handleShare(video)}
                    data-ocid={`daily_videos.secondary_button.${idx + 1}`}
                  >
                    <Instagram size={12} className="mr-1" />
                    Share
                    <Copy size={10} className="ml-1 opacity-60" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => handleDelete(video.id)}
                    data-ocid={`daily_videos.delete_button.${idx + 1}`}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>(() => getUsers());

  if (!isAdmin) return <AdminLoginForm />;

  const reload = () => setUsers(getUsers());

  const approveKyc = (u: User) => {
    const updated = { ...u, kycStatus: "approved" as const };
    if (updated.paymentStatus === "approved") updated.virtualBalance = 1000000;
    updateUser(updated);
    if (updated.paymentStatus === "approved") {
      const credited = creditReferralBonus(updated);
      if (credited) {
        toast.success(`₹5 referral bonus credited to ${updated.referredBy}`);
      }
    }
    reload();
    toast.success(`KYC approved for ${u.name}`);
  };

  const rejectKyc = (u: User) => {
    updateUser({ ...u, kycStatus: "rejected" as const });
    reload();
    toast.error(`KYC rejected for ${u.name}`);
  };

  const approvePayment = (u: User) => {
    const updated = { ...u, paymentStatus: "approved" as const };
    if (updated.kycStatus === "approved") updated.virtualBalance = 1000000;
    updateUser(updated);
    if (updated.kycStatus === "approved") {
      const credited = creditReferralBonus(updated);
      if (credited) {
        toast.success(`₹5 referral bonus credited to ${updated.referredBy}`);
      }
    }
    reload();
    toast.success(`Payment approved for ${u.name}`);
  };

  const rejectPayment = (u: User) => {
    updateUser({ ...u, paymentStatus: "rejected" as const });
    reload();
    toast.error(`Payment rejected for ${u.name}`);
  };

  const toggleDebar = (u: User) => {
    const newStatus =
      u.accountStatus === "active"
        ? ("debarred" as const)
        : ("active" as const);
    updateUser({ ...u, accountStatus: newStatus });
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
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members ({users.length})</TabsTrigger>
          <TabsTrigger value="kyc">KYC ({pendingKyc.length})</TabsTrigger>
          <TabsTrigger value="payments">
            Payments ({pendingPayment.length})
          </TabsTrigger>
          <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
          <TabsTrigger
            value="daily-videos"
            className="flex items-center gap-1.5"
            data-ocid="daily_videos.tab"
          >
            <Video size={14} />
            Daily Videos
          </TabsTrigger>
          <TabsTrigger
            value="tipofday"
            className="flex items-center gap-1.5"
            data-ocid="tipofday.tab"
          >
            <Lightbulb size={14} />
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
                    <th className="text-left p-3">Referral Bonus</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="p-3">
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {u.id}
                        </div>
                        {u.tcSignature ? (
                          <span className="inline-flex items-center gap-0.5 text-xs text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded mt-0.5">
                            T&C ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-xs text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded mt-0.5">
                            Not Signed
                          </span>
                        )}
                        {u.referredBy && (
                          <div className="flex items-center gap-1 text-xs text-green-400 mt-0.5">
                            <Gift size={10} />
                            ref: {u.referredBy}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-xs">
                        <div>{u.email}</div>
                        <div className="text-muted-foreground">{u.phone}</div>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={u.kycStatus} />
                      </td>
                      <td className="p-3">
                        <StatusBadge status={u.paymentStatus} />
                      </td>
                      <td className="p-3 text-xs font-semibold">
                        {fmt(u.virtualBalance)}
                      </td>
                      <td className="p-3 text-xs font-semibold text-green-400">
                        {u.referralBonus ? fmt(u.referralBonus) : "—"}
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
              <CardContent className="p-8 text-center text-muted-foreground">
                No pending KYC approvals
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingKyc.map((u) => (
                <Card key={u.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
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
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                          onClick={() => approveKyc(u)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs"
                          onClick={() => rejectKyc(u)}
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
              <CardContent className="p-8 text-center text-muted-foreground">
                No pending payment approvals
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingPayment.map((u) => (
                <Card key={u.id}>
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
                          Amount: ₹1 | UPI
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
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs"
                          onClick={() => rejectPayment(u)}
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
                  {users.map((u) => {
                    const userTrades = trades.filter((t) => t.userId === u.id);
                    return (
                      <tr
                        key={u.id}
                        className="border-b border-border last:border-0"
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
                          {u.referralBonus ? fmt(u.referralBonus) : "—"}
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
        <TabsContent value="daily-videos">
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
