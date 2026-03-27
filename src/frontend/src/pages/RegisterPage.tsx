import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useNavigate } from "@tanstack/react-router";
import {
  Camera,
  CheckCircle,
  Gift,
  Loader2,
  RefreshCw,
  Upload,
  User as UserIcon,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { loadConfig } from "../config";
import type { User } from "../lib/store";
import {
  backendGetAllUsers,
  backendNextMemberId,
  backendRegisterUser,
} from "../lib/tradingApi";
import { StorageClient } from "../utils/StorageClient";

async function uploadImageToStorage(base64DataUrl: string): Promise<string> {
  try {
    const config = await loadConfig();
    const agent = new HttpAgent({ host: config.backend_host });
    const storageClient = new StorageClient(
      "default-bucket",
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    const base64 = base64DataUrl.split(",")[1];
    if (!base64) throw new Error("Invalid image data");
    const byteString = atob(base64);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++)
      bytes[i] = byteString.charCodeAt(i);
    const { hash } = await storageClient.putFile(bytes);
    return await storageClient.getDirectURL(hash);
  } catch (err) {
    console.error("uploadImageToStorage failed:", err);
    // Fallback: store as base64 (will still be large, but better than crashing)
    return base64DataUrl;
  }
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    aadhaar: "",
    pan: "",
    digilockerRef: "",
    referredBy: "",
  });
  const [proof, setProof] = useState<string>("");
  const [proofName, setProofName] = useState("");
  const [selfie, setSelfie] = useState<string>("");
  const [done, setDone] = useState<User | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const selfieUploadRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large (max 20MB)");
      return;
    }
    setProofName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.6);
        setProof(compressed);
        toast.success("Screenshot uploaded successfully");
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => toast.error("Failed to read file");
    reader.readAsDataURL(file);
  };

  const handleSelfie = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Selfie too large (max 20MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.6);
        setSelfie(compressed);
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => toast.error("Failed to read selfie");
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const [registering, setRegistering] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof) {
      toast.error("Please upload payment proof");
      return;
    }
    setRegistering(true);
    try {
      // Check if email already exists in backend
      const allUsers = await backendGetAllUsers();
      if (
        allUsers.find((u) => u.email.toLowerCase() === form.email.toLowerCase())
      ) {
        toast.error("Email already registered");
        setRegistering(false);
        return;
      }

      // Validate referral code if provided
      const referralId = form.referredBy.trim().toUpperCase();
      if (referralId) {
        const referrer = allUsers.find((u) => u.id === referralId);
        if (!referrer) {
          toast.error("Invalid referral code. Please check and try again.");
          setRegistering(false);
          return;
        }
      }

      // Upload images to StorageClient (avoids 2MB IC canister limit)
      setUploadProgress("Uploading payment proof...");
      const paymentProofUrl = await uploadImageToStorage(proof);

      let selfieUrl = "";
      if (selfie) {
        setUploadProgress("Uploading selfie...");
        selfieUrl = await uploadImageToStorage(selfie);
      }

      setUploadProgress("Registering...");
      const memberId = await backendNextMemberId();
      const newUser: User = {
        id: memberId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        aadhaar: form.aadhaar,
        pan: form.pan,
        digilockerRef: form.digilockerRef,
        paymentProof: paymentProofUrl,
        selfie: selfieUrl || undefined,
        kycStatus: "pending",
        paymentStatus: "pending",
        accountStatus: "active",
        virtualBalance: 0,
        watchlist: [],
        createdAt: Date.now(),
        referredBy: referralId || undefined,
      };

      // Save to backend — this is required for cross-device visibility
      const ok = await backendRegisterUser(newUser);
      if (!ok) {
        toast.error(
          "Registration failed. Please check your connection and try again.",
        );
        return;
      }

      setDone(newUser);
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setRegistering(false);
      setUploadProgress("");
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-card border rounded-2xl p-8 max-w-sm w-full text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Registration Submitted!</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Your Member ID:{" "}
            <span className="font-bold text-gold-400">{done.id}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Your registration is under review. Once admin approves your payment
            and KYC, you will receive ₹1000000 virtual balance.
          </p>
          {done.referredBy && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-4">
              <Gift size={13} />
              <span>
                Referred by <strong>{done.referredBy}</strong> — they will earn
                ₹5 bonus once you are approved!
              </span>
            </div>
          )}
          <Button
            onClick={() => navigate({ to: "/login" })}
            className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-1">Create Account</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Join RAY INFOTECH Demo Trading Platform
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  step >= s
                    ? "bg-gold-500 text-navy-900"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 flex-1 rounded ${
                    step > s ? "bg-gold-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="10-digit"
                  required
                />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Min 6 characters"
                required
              />
            </div>
            <div>
              <Label>Referral Code (optional)</Label>
              <Input
                value={form.referredBy}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    referredBy: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g. RT-000001"
                data-ocid="register.input"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a member's ID to credit them ₹5 bonus when you get
                approved.
              </p>
            </div>
            <Button
              className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
              onClick={() => {
                if (
                  !form.name ||
                  !form.email ||
                  !form.phone ||
                  !form.password
                ) {
                  toast.error("Fill all fields");
                  return;
                }
                if (form.password.length < 6) {
                  toast.error("Password min 6 chars");
                  return;
                }
                setStep(2);
              }}
            >
              Next: KYC Details
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Aadhaar Number *</Label>
              <Input
                value={form.aadhaar}
                onChange={(e) =>
                  setForm((f) => ({ ...f, aadhaar: e.target.value }))
                }
                placeholder="12-digit Aadhaar"
                required
              />
            </div>
            <div>
              <Label>PAN Number *</Label>
              <Input
                value={form.pan}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pan: e.target.value.toUpperCase() }))
                }
                placeholder="ABCDE1234F"
                required
              />
            </div>
            <div>
              <Label>DigiLocker Reference (optional)</Label>
              <Input
                value={form.digilockerRef}
                onChange={(e) =>
                  setForm((f) => ({ ...f, digilockerRef: e.target.value }))
                }
                placeholder="DigiLocker document reference"
              />
            </div>

            {/* Selfie Section */}
            <div>
              <Label className="mb-2 block">Selfie Photo *</Label>
              {selfie ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gold-500/50 shrink-0">
                    <img
                      src={selfie}
                      alt="Selfie preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-green-400 font-medium mb-2">
                      ✓ Selfie captured
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs border-gold-500/30 hover:border-gold-500 gap-1.5"
                      onClick={() => setSelfie("")}
                      data-ocid="kyc.retake_button"
                    >
                      <RefreshCw size={12} />
                      Retake
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Take a clear photo of your face for KYC verification.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 flex flex-col items-center gap-1.5 border-2 border-dashed border-gold-500/40 rounded-xl p-4 hover:border-gold-500/70 hover:bg-gold-500/5 transition-all cursor-pointer"
                      onClick={() => selfieRef.current?.click()}
                      data-ocid="kyc.selfie_button"
                    >
                      <Camera size={22} className="text-gold-400" />
                      <span className="text-xs font-medium">Take Selfie</span>
                      <span className="text-xs text-muted-foreground">
                        Front camera
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flex-1 flex flex-col items-center gap-1.5 border-2 border-dashed border-border rounded-xl p-4 hover:border-gold-500/40 hover:bg-gold-500/5 transition-all cursor-pointer"
                      onClick={() => selfieUploadRef.current?.click()}
                      data-ocid="kyc.upload_button"
                    >
                      <UserIcon size={22} className="text-muted-foreground" />
                      <span className="text-xs font-medium">Upload Photo</span>
                      <span className="text-xs text-muted-foreground">
                        From gallery
                      </span>
                    </button>
                  </div>
                  <input
                    ref={selfieRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleSelfie}
                    className="hidden"
                  />
                  <input
                    ref={selfieUploadRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSelfie}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
                data-ocid="kyc.back_button"
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
                onClick={() => {
                  if (!form.aadhaar || !form.pan) {
                    toast.error("Fill Aadhaar and PAN");
                    return;
                  }
                  if (!selfie) {
                    toast.error("Please capture or upload a selfie");
                    return;
                  }
                  setStep(3);
                }}
                data-ocid="kyc.next_button"
              >
                Next: Payment
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-semibold mb-3">
                Pay ₹1 via UPI to complete registration
              </p>
              <div className="inline-block border-2 border-gold-500/40 rounded-xl p-2 bg-white">
                <img
                  src="/assets/c4e00e11-2c6c-4637-966f-6cd09caf74db_image.png"
                  alt="UPI QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                UPI ID: 6370815283@okbizaxis
                <br />
                RAY INFOTECH | Amount: ₹1
              </p>
            </div>

            <div>
              <Label>Upload Payment Screenshot *</Label>
              {proof ? (
                <div className="flex items-center gap-3 border rounded-lg p-3 bg-green-500/5 border-green-500/30">
                  <CheckCircle size={18} className="text-green-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-green-400 font-medium">
                      Screenshot uploaded
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {proofName}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs shrink-0"
                    onClick={() => {
                      setProof("");
                      setProofName("");
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-gold-500/50 transition-colors"
                  onClick={() => fileRef.current?.click()}
                  data-ocid="payment.upload_button"
                >
                  <Upload
                    size={20}
                    className="mx-auto text-muted-foreground mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    Click to upload screenshot
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Any size accepted (auto-compressed)
                  </p>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            {registering && uploadProgress && (
              <div className="flex items-center gap-2 text-xs text-gold-400 bg-gold-500/10 border border-gold-500/20 rounded-lg px-3 py-2">
                <Loader2 size={13} className="animate-spin" />
                <span>{uploadProgress}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
                data-ocid="payment.back_button"
                disabled={registering}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
                data-ocid="payment.submit_button"
                disabled={registering || !proof}
              >
                {registering ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    {uploadProgress || "Submitting..."}
                  </>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-4">
          Have an account?{" "}
          <a href="/login" className="text-gold-400 hover:text-gold-300">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
