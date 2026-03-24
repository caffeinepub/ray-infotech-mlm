import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Upload } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getUsers, nextMemberId, saveUsers } from "../lib/store";
import type { User } from "../lib/store";

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
  });
  const [proof, setProof] = useState<string>("");
  const [proofName, setProofName] = useState("");
  const [done, setDone] = useState<User | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large (max 2MB)");
      return;
    }
    setProofName(file.name);
    const reader = new FileReader();
    reader.onload = () => setProof(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof) {
      toast.error("Please upload payment proof");
      return;
    }
    const users = getUsers();
    if (users.find((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      toast.error("Email already registered");
      return;
    }
    const newUser: User = {
      id: nextMemberId(),
      ...form,
      paymentProof: proof,
      kycStatus: "pending",
      paymentStatus: "pending",
      accountStatus: "active",
      virtualBalance: 0,
      watchlist: [],
      createdAt: Date.now(),
    };
    users.push(newUser);
    saveUsers(users);
    setDone(newUser);
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
          <p className="text-sm text-muted-foreground mb-6">
            Your registration is under review. Once admin approves your payment
            and KYC, you will receive ₹1000000 virtual balance.
          </p>
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
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
                  setStep(3);
                }}
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
                Pay \u20b91 via UPI to complete registration
              </p>
              <div className="inline-block border-2 border-gold-500/40 rounded-xl p-2 bg-white">
                <img
                  src="/assets/uploads/c4e00e11-2c6c-4637-966f-6cd09caf74db_image-1.png"
                  alt="UPI QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                UPI ID: 6370815283@okbizaxis
                <br />
                RAY INFOTECH | Amount: \u20b91
              </p>
            </div>

            <div>
              <Label>Upload Payment Screenshot *</Label>
              <button
                type="button"
                className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-gold-500/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload
                  size={20}
                  className="mx-auto text-muted-foreground mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  {proofName || "Click to upload screenshot"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Max 2MB (JPG/PNG)
                </p>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
              >
                Submit Registration
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
