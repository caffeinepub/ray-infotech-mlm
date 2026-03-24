import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart2,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { getTrades, getUsers, updateUser } from "../lib/store";
import type { User } from "../lib/store";

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
        {/* Branding */}
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

        {/* Card */}
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

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>(() => getUsers());

  if (!isAdmin) return <AdminLoginForm />;

  const reload = () => setUsers(getUsers());

  const approveKyc = (u: User) => {
    const updated = { ...u, kycStatus: "approved" as const };
    if (updated.paymentStatus === "approved") updated.virtualBalance = 1000000;
    updateUser(updated);
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
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members ({users.length})</TabsTrigger>
          <TabsTrigger value="kyc">KYC ({pendingKyc.length})</TabsTrigger>
          <TabsTrigger value="payments">
            Payments ({pendingPayment.length})
          </TabsTrigger>
          <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
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
                        <div className="text-xs text-muted-foreground">
                          {u.id}
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
                        colSpan={7}
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
                        <div className="text-xs text-muted-foreground mt-1">
                          Joined: {fmtDate(u.createdAt)}
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
                        <div className="text-xs text-muted-foreground">
                          Joined: {fmtDate(u.createdAt)}
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
                        colSpan={4}
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
      </Tabs>
    </div>
  );
}
