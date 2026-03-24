import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { BarChart2, LogIn } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { getCurrentUser } from "../lib/store";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAdmin, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate({ to: "/dashboard" });
    return null;
  }
  if (isAdmin) {
    navigate({ to: "/admin" });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = login(email.trim(), password);
    setLoading(false);
    if (ok) {
      const session = localStorage.getItem("ri_session");
      if (session === "admin") {
        navigate({ to: "/admin" });
      } else {
        const u = getCurrentUser();
        if (u && !u.tcSignature) navigate({ to: "/esign" });
        else navigate({ to: "/dashboard" });
      }
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gold-500/20 border border-gold-500/40 rounded-xl flex items-center justify-center">
            <BarChart2 size={20} className="text-gold-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-gold-400 tracking-wider">
              RAY INFOTECH
            </div>
            <div className="text-xs text-muted-foreground">
              Demo Trading Platform
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-1">Sign In</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Access your trading account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                data-ocid="login.input"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                data-ocid="login.input"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
              data-ocid="login.submit_button"
            >
              <LogIn size={16} className="mr-2" /> Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            No account?{" "}
            <a href="/register" className="text-gold-400 hover:text-gold-300">
              Register here
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Admin?{" "}
          <a href="/admin" className="text-gold-400 hover:text-gold-300">
            Go to Admin Panel →
          </a>
        </p>
      </div>
    </div>
  );
}
