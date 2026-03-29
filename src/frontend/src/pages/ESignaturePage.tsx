import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileText,
  PenLine,
  RotateCcw,
  Shield,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { clearSession, getCurrentUser, updateUser } from "../lib/store";
import { backendUpdateUser } from "../lib/tradingApi";

export default function ESignaturePage() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const currentUser = user || getCurrentUser();
    if (!currentUser) {
      navigate({ to: "/login" });
      return;
    }
    if (currentUser.tcSignature) {
      navigate({ to: "/dashboard" });
    }
  }, [user, navigate]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function getPos(
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement,
  ) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSigning(true);
    setHasSigned(true);
    lastPos.current = getPos(e, canvas);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isSigning) return;
    const canvas = canvasRef.current;
    if (!canvas || !lastPos.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }

  function endDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    setIsSigning(false);
    lastPos.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  }

  async function handleSubmit() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const currentUser = user || getCurrentUser();
    if (!currentUser) return;
    setIsSubmitting(true);
    const dataUrl = canvas.toDataURL("image/png");
    const updatedUser = {
      ...currentUser,
      tcSignature: { dataUrl, signedAt: Date.now() },
    };
    updateUser(updatedUser);
    try {
      await backendUpdateUser(updatedUser);
    } catch (e) {
      console.error("Failed to save e-signature to backend:", e);
    }
    await refresh();
    setTimeout(() => navigate({ to: "/dashboard" }), 600);
  }

  function handleDecline() {
    clearSession();
    navigate({ to: "/" });
  }

  const canSubmit = hasSigned && agreed;

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="esign.page"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Shield size={18} className="text-amber-400" />
        </div>
        <div>
          <div
            className="font-semibold text-sm text-foreground"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            RAY INFOTECH
          </div>
          <div className="text-xs text-muted-foreground">
            Terms &amp; Conditions
          </div>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            e-Signature Required
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* Intro */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/20 mb-3">
              <FileText size={26} className="text-amber-400" />
            </div>
            <h1
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Terms &amp; Conditions
            </h1>
            <p className="text-sm text-muted-foreground">
              Please read carefully and sign below to continue
            </p>
          </div>

          {/* T&C Scroll Box */}
          <div
            className="rounded-xl border border-border bg-card overflow-y-auto"
            style={{ maxHeight: "40vh" }}
            data-ocid="esign.panel"
          >
            <div className="p-4 space-y-5 text-sm text-foreground/90 leading-relaxed">
              <section>
                <h2 className="font-semibold text-amber-400 mb-1.5 text-xs uppercase tracking-wide">
                  1. Platform Purpose
                </h2>
                <p>
                  RAY INFOTECH Demo Trading Platform is a purely educational and
                  demonstration service. It is designed to help users understand
                  stock market concepts through simulated trading. No real
                  financial transactions take place on this platform.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-amber-400 mb-1.5 text-xs uppercase tracking-wide">
                  2. Virtual Balance
                </h2>
                <p>
                  Upon approval, each user receives a virtual balance of
                  ₹1000000 (Indian Rupees Ten Lakh) for practice trading only.
                  This amount is simulated and has no real monetary value. It
                  cannot be withdrawn, transferred, or exchanged for real
                  currency under any circumstances.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-amber-400 mb-1.5 text-xs uppercase tracking-wide">
                  3. KYC &amp; Personal Data
                </h2>
                <p>
                  Personal information including Aadhaar number, PAN, DigiLocker
                  reference, and selfie photograph are collected solely for
                  identity verification purposes. All data is stored securely
                  and will not be shared with any third party without your
                  consent, except as required by applicable law.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-amber-400 mb-1.5 text-xs uppercase tracking-wide">
                  4. Not Financial Advice
                </h2>
                <p>
                  All content, tools, market data, and simulations on this
                  platform are for educational purposes only. Nothing on this
                  platform constitutes financial, investment, legal, or tax
                  advice. Always consult a qualified financial advisor before
                  making real investment decisions.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-amber-400 mb-1.5 text-xs uppercase tracking-wide">
                  5. Accepted Conduct
                </h2>
                <p>
                  Users must not misuse the platform, engage in fraudulent
                  activities, share login credentials, attempt to manipulate
                  simulated prices, or use the platform for any purpose other
                  than educational practice. Violations may result in immediate
                  suspension of access without notice.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-amber-400 mb-1.5 text-xs uppercase tracking-wide">
                  6. Account Termination
                </h2>
                <p>
                  RAY INFOTECH reserves the right to suspend or permanently
                  terminate any account found in violation of these terms, or at
                  the sole discretion of the administrator. The platform
                  reserves the right to modify these terms at any time.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-amber-400 mb-1.5 text-xs uppercase tracking-wide">
                  7. Governing Law
                </h2>
                <p>
                  These Terms and Conditions shall be governed by and construed
                  in accordance with the laws of India. Any disputes arising out
                  of or in connection with these terms shall be subject to the
                  exclusive jurisdiction of the courts in India.
                </p>
              </section>

              <section className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  By signing below, you confirm that you have read, understood,
                  and agree to all the terms and conditions stated above. This
                  digital signature constitutes a legally binding acceptance.
                </p>
              </section>
            </div>
          </div>

          {/* Signature Canvas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <PenLine size={16} className="text-amber-400" />
                Your Signature
              </div>
              <button
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="esign.secondary_button"
              >
                <RotateCcw size={12} />
                Clear
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-amber-400/40 bg-white/[0.03]">
              {!hasSigned && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center space-y-1">
                    <PenLine size={28} className="text-amber-400/30 mx-auto" />
                    <p className="text-sm text-muted-foreground/50">
                      Sign here with your finger or mouse
                    </p>
                  </div>
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={600}
                height={250}
                className="w-full touch-none cursor-crosshair"
                style={{ height: "260px" }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
                data-ocid="esign.canvas_target"
              />
            </div>

            {hasSigned && (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <CheckCircle2 size={13} />
                Signature captured
              </div>
            )}
          </div>

          {/* Agreement Checkbox */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
            data-ocid="esign.panel"
          >
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(!!v)}
              className="mt-0.5 border-amber-400/60 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              data-ocid="esign.checkbox"
            />
            <label
              htmlFor="agree"
              className="text-sm text-foreground/90 leading-relaxed cursor-pointer"
            >
              I have read, understood, and agree to the{" "}
              <span className="text-amber-400 font-medium">
                Terms &amp; Conditions
              </span>{" "}
              of RAY INFOTECH Demo Trading Platform.
            </label>
          </div>

          {/* Actions */}
          <div className="space-y-3 pb-8">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              data-ocid="esign.submit_button"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Submit &amp; Accept
                </span>
              )}
            </Button>

            <button
              type="button"
              onClick={handleDecline}
              className="w-full py-3 text-sm text-muted-foreground hover:text-destructive transition-colors text-center"
              data-ocid="esign.secondary_button"
            >
              Decline and exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
