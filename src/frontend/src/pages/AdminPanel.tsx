import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileCheck,
  IndianRupee,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type KycStatus = "pending" | "approved" | "rejected";
type PaymentStatus = "pending" | "approved" | "rejected";
type MemberStatus = "active" | "suspended" | "debarred";

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  aadhaar: string;
  pan: string;
  sponsorId: string | null;
  kycStatus: KycStatus;
  paymentStatus: PaymentStatus;
  status: MemberStatus;
  virtualBalance: number;
  totalInvested: number;
  pnl: number;
  totalTrades: number;
  joinedDate: string;
  lastActive: string;
  digilockerRef: string;
  transactionId: string;
  paymentMethod: string;
  downlineCount: number;
}

type NavSection = "overview" | "members" | "kyc" | "payments" | "portfolios";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_MEMBERS: Member[] = [
  {
    id: "RI001920001",
    name: "Rajesh Kumar Sharma",
    phone: "9876543210",
    email: "rajesh.sharma@gmail.com",
    aadhaar: "XXXX-XXXX-4521",
    pan: "ABCPS1234D",
    sponsorId: null,
    kycStatus: "approved",
    paymentStatus: "approved",
    status: "active",
    virtualBalance: 950000,
    totalInvested: 750000,
    pnl: 85000,
    totalTrades: 42,
    joinedDate: "2026-01-15",
    lastActive: "2026-03-24",
    digilockerRef: "DL202601152341",
    transactionId: "TXN2026011501",
    paymentMethod: "UPI",
    downlineCount: 3,
  },
  {
    id: "RI001920002",
    name: "Priya Venkataraman",
    phone: "9765432109",
    email: "priya.v@outlook.com",
    aadhaar: "XXXX-XXXX-7832",
    pan: "DLQPV5678F",
    sponsorId: "RI001920001",
    kycStatus: "approved",
    paymentStatus: "approved",
    status: "active",
    virtualBalance: 1120000,
    totalInvested: 430000,
    pnl: -32500,
    totalTrades: 28,
    joinedDate: "2026-01-22",
    lastActive: "2026-03-23",
    digilockerRef: "DL202601223912",
    transactionId: "TXN2026012201",
    paymentMethod: "Google Pay",
    downlineCount: 2,
  },
  {
    id: "RI001920003",
    name: "Amit Deshmukh",
    phone: "9654321098",
    email: "amit.deshmukh@yahoo.co.in",
    aadhaar: "XXXX-XXXX-3309",
    pan: "FGHAD9012G",
    sponsorId: "RI001920001",
    kycStatus: "pending",
    paymentStatus: "approved",
    status: "active",
    virtualBalance: 1000000,
    totalInvested: 0,
    pnl: 0,
    totalTrades: 0,
    joinedDate: "2026-02-05",
    lastActive: "2026-03-20",
    digilockerRef: "DL202602052847",
    transactionId: "TXN2026020501",
    paymentMethod: "PhonePe",
    downlineCount: 0,
  },
  {
    id: "RI001920004",
    name: "Sunita Agarwal",
    phone: "9543210987",
    email: "sunita.agarwal@gmail.com",
    aadhaar: "XXXX-XXXX-6614",
    pan: "MNOPSA3456H",
    sponsorId: "RI001920002",
    kycStatus: "rejected",
    paymentStatus: "pending",
    status: "suspended",
    virtualBalance: 1000000,
    totalInvested: 0,
    pnl: 0,
    totalTrades: 0,
    joinedDate: "2026-02-18",
    lastActive: "2026-02-20",
    digilockerRef: "",
    transactionId: "TXN2026021801",
    paymentMethod: "Bank Transfer",
    downlineCount: 0,
  },
  {
    id: "RI001920005",
    name: "Karan Mehta",
    phone: "9432109876",
    email: "karan.mehta@protonmail.com",
    aadhaar: "XXXX-XXXX-9921",
    pan: "QRSTU7890I",
    sponsorId: "RI001920001",
    kycStatus: "approved",
    paymentStatus: "approved",
    status: "active",
    virtualBalance: 1345000,
    totalInvested: 920000,
    pnl: 215000,
    totalTrades: 87,
    joinedDate: "2026-02-28",
    lastActive: "2026-03-24",
    digilockerRef: "DL202602287123",
    transactionId: "TXN2026022801",
    paymentMethod: "UPI",
    downlineCount: 3,
  },
  {
    id: "RI001920006",
    name: "Deepa Iyer",
    phone: "9321098765",
    email: "deepa.iyer@gmail.com",
    aadhaar: "XXXX-XXXX-1157",
    pan: "VWXDI2345J",
    sponsorId: "RI001920002",
    kycStatus: "pending",
    paymentStatus: "pending",
    status: "active",
    virtualBalance: 1000000,
    totalInvested: 0,
    pnl: 0,
    totalTrades: 0,
    joinedDate: "2026-03-10",
    lastActive: "2026-03-10",
    digilockerRef: "DL202603107654",
    transactionId: "TXN2026031001",
    paymentMethod: "Paytm",
    downlineCount: 0,
  },
  {
    id: "RI001920007",
    name: "Vikram Bose",
    phone: "9210987654",
    email: "vikram.bose@rediffmail.com",
    aadhaar: "XXXX-XXXX-4488",
    pan: "YZABD4567K",
    sponsorId: "RI001920005",
    kycStatus: "approved",
    paymentStatus: "approved",
    status: "debarred",
    virtualBalance: 1000000,
    totalInvested: 120000,
    pnl: -18000,
    totalTrades: 9,
    joinedDate: "2026-03-15",
    lastActive: "2026-03-18",
    digilockerRef: "DL202603158899",
    transactionId: "TXN2026031501",
    paymentMethod: "UPI",
    downlineCount: 1,
  },
];

const RECENT_ACTIVITY = [
  {
    id: 1,
    type: "join",
    text: "Deepa Iyer joined via RI001920002",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "kyc",
    text: "Karan Mehta's KYC approved",
    time: "5 hours ago",
  },
  {
    id: 3,
    type: "payment",
    text: "Amit Deshmukh's payment approved",
    time: "1 day ago",
  },
  {
    id: 4,
    type: "join",
    text: "Vikram Bose joined via RI001920005",
    time: "2 days ago",
  },
  {
    id: 5,
    type: "suspend",
    text: "Sunita Agarwal account suspended",
    time: "3 days ago",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function KycBadge({ status }: { status: KycStatus }) {
  const map: Record<KycStatus, { label: string; cls: string }> = {
    approved: {
      label: "Approved",
      cls: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    pending: {
      label: "Pending",
      cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    rejected: {
      label: "Rejected",
      cls: "bg-red-500/20 text-red-400 border-red-500/30",
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}
    >
      {label}
    </span>
  );
}

function PayBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { label: string; cls: string }> = {
    approved: {
      label: "Paid",
      cls: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    pending: {
      label: "Pending",
      cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    rejected: {
      label: "Rejected",
      cls: "bg-red-500/20 text-red-400 border-red-500/30",
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const map: Record<MemberStatus, { label: string; cls: string }> = {
    active: {
      label: "Active",
      cls: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    suspended: {
      label: "Suspended",
      cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    debarred: {
      label: "Debarred",
      cls: "bg-red-500/20 text-red-400 border-red-500/30",
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}
    >
      {label}
    </span>
  );
}

// ─── Add Member Form ──────────────────────────────────────────────────────────

function AddMemberDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (m: Member) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    aadhaar: "",
    pan: "",
    sponsorId: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.email) {
      toast.error("Name, Phone and Email are required");
      return;
    }
    const seq = String(Math.floor(1920000 + Math.random() * 9999)).padStart(
      9,
      "0",
    );
    const newMember: Member = {
      id: `RI${seq}`,
      name: form.name,
      phone: form.phone,
      email: form.email,
      aadhaar: form.aadhaar || "XXXX-XXXX-0000",
      pan: form.pan || "AAAAA0000A",
      sponsorId: form.sponsorId || null,
      kycStatus: "pending",
      paymentStatus: "pending",
      status: "active",
      virtualBalance: 1000000,
      totalInvested: 0,
      pnl: 0,
      totalTrades: 0,
      joinedDate: new Date().toISOString().split("T")[0],
      lastActive: new Date().toISOString().split("T")[0],
      digilockerRef: "",
      transactionId: "",
      paymentMethod: "",
      downlineCount: 0,
    };
    onAdd(newMember);
    setForm({
      name: "",
      phone: "",
      email: "",
      aadhaar: "",
      pan: "",
      sponsorId: "",
    });
    onClose();
    toast.success(`Member ${newMember.id} added successfully`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-ocid="add_member.dialog"
        className="bg-[#1a2235] border-white/10 text-white max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="text-white font-display">
            Add New Member
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Fill in the details to register a new member.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {(
            [
              ["name", "Full Name", "text"],
              ["phone", "Phone Number", "tel"],
              ["email", "Email Address", "email"],
              ["aadhaar", "Aadhaar Number", "text"],
              ["pan", "PAN Number", "text"],
              ["sponsorId", "Sponsor ID (optional)", "text"],
            ] as [string, string, string][]
          ).map(([key, label, type]) => (
            <div key={key} className="grid grid-cols-3 gap-4 items-center">
              <Label className="text-right text-white/70 text-sm col-span-1">
                {label}
              </Label>
              <Input
                data-ocid={`add_member.${key}_input`}
                type={type}
                value={(form as Record<string, string>)[key]}
                onChange={set(key)}
                className="col-span-2 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-chart-1"
                placeholder={label}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            data-ocid="add_member.cancel_button"
            variant="ghost"
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            data-ocid="add_member.submit_button"
            onClick={handleSubmit}
            className="bg-chart-1 hover:bg-chart-1/90 text-black font-semibold"
          >
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteDialog({
  member,
  onClose,
  onConfirm,
}: {
  member: Member | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={!!member} onOpenChange={onClose}>
      <DialogContent
        data-ocid="delete_member.dialog"
        className="bg-[#1a2235] border-white/10 text-white max-w-sm"
      >
        <DialogHeader>
          <DialogTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Confirm Delete
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Are you sure you want to permanently delete member{" "}
            <span className="text-white font-semibold">{member?.name}</span> (
            {member?.id})? Their downline will be reassigned to the next upline
            level. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            data-ocid="delete_member.cancel_button"
            variant="ghost"
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            data-ocid="delete_member.confirm_button"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Overview Section ─────────────────────────────────────────────────────────

function OverviewSection({ members }: { members: Member[] }) {
  const totalMembers = members.length;
  const pendingKyc = members.filter((m) => m.kycStatus === "pending").length;
  const pendingPayments = members.filter(
    (m) => m.paymentStatus === "pending",
  ).length;
  const activeTraders = members.filter(
    (m) => m.status === "active" && m.totalTrades > 0,
  ).length;

  const stats = [
    {
      label: "Total Members",
      value: totalMembers,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Pending KYC",
      value: pendingKyc,
      icon: FileCheck,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Pending Payments",
      value: pendingPayments,
      icon: CreditCard,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      label: "Active Traders",
      value: activeTraders,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
  ];

  const activityIcons: Record<string, React.ReactNode> = {
    join: <UserCheck className="h-4 w-4 text-green-400" />,
    kyc: <FileCheck className="h-4 w-4 text-blue-400" />,
    payment: <CreditCard className="h-4 w-4 text-chart-1" />,
    suspend: <Ban className="h-4 w-4 text-yellow-400" />,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            data-ocid={`overview.${s.label.toLowerCase().replace(/ /g, "_")}.card`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="bg-[#1a2235] border-white/10 hover:border-white/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-sm">{s.label}</p>
                    <p
                      className={`text-3xl font-bold mt-1 ${s.color} font-display`}
                    >
                      {s.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${s.bg}`}>
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-[#1a2235] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white/90 text-base font-display flex items-center gap-2">
              <Activity className="h-4 w-4 text-chart-1" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {RECENT_ACTIVITY.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors"
              >
                <div className="p-1.5 rounded-full bg-white/5">
                  {activityIcons[a.type] ?? (
                    <Activity className="h-4 w-4 text-white/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm truncate">{a.text}</p>
                </div>
                <span className="text-white/30 text-xs whitespace-nowrap">
                  {a.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#1a2235] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white/90 text-base font-display flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-chart-1" /> Platform Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                label: "Total Virtual Capital",
                value: fmtINR(members.length * 1000000),
              },
              {
                label: "Total P&L (All Members)",
                value: fmtINR(members.reduce((a, m) => a + m.pnl, 0)),
                highlight: true,
              },
              {
                label: "Total Trades",
                value: members.reduce((a, m) => a + m.totalTrades, 0),
              },
              { label: "Contact Admin", value: "rayinfotechserver@gmail.com" },
              { label: "WhatsApp", value: "+91 93377 15492" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center"
              >
                <span className="text-white/50 text-sm">{item.label}</span>
                <span
                  className={`text-sm font-mono font-medium ${
                    item.highlight
                      ? members.reduce((a, m) => a + m.pnl, 0) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                      : "text-white/80"
                  }`}
                >
                  {String(item.value)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button
          data-ocid="overview.export_button"
          variant="outline"
          className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 gap-2"
        >
          <Download className="h-4 w-4" /> Export Data
        </Button>
      </div>
    </div>
  );
}

// ─── Members Section ──────────────────────────────────────────────────────────

function MembersSection({
  members,
  onDelete,
  onStatusChange,
}: {
  members: Member[];
  onDelete: (m: Member) => void;
  onStatusChange: (id: string, status: MemberStatus) => void;
}) {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [allMembers, setAllMembers] = useState(members);
  const [viewMember, setViewMember] = useState<Member | null>(null);

  const filtered = allMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            data-ocid="members.search_input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID or email…"
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-chart-1"
          />
        </div>
        <Button
          data-ocid="members.add_button"
          onClick={() => setAddOpen(true)}
          className="bg-chart-1 hover:bg-chart-1/90 text-black font-semibold gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Member
        </Button>
      </div>

      <AddMemberDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(m) => setAllMembers((p) => [...p, m])}
      />

      <Card className="bg-[#1a2235] border-white/10">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                {[
                  "Member ID",
                  "Name",
                  "Phone / Email",
                  "KYC",
                  "Payment",
                  "Balance",
                  "Joined",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="text-white/40 text-xs uppercase tracking-wider"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-white/30 py-12"
                    data-ocid="members.empty_state"
                  >
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m, idx) => (
                  <TableRow
                    key={m.id}
                    data-ocid={`members.item.${idx + 1}`}
                    className="border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-chart-1">
                      {m.id}
                    </TableCell>
                    <TableCell className="text-white/90 font-medium whitespace-nowrap">
                      {m.name}
                    </TableCell>
                    <TableCell className="text-white/50 text-xs">
                      <div>{m.phone}</div>
                      <div className="text-white/30">{m.email}</div>
                    </TableCell>
                    <TableCell>
                      <KycBadge status={m.kycStatus} />
                    </TableCell>
                    <TableCell>
                      <PayBadge status={m.paymentStatus} />
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white/80">
                      {fmtINR(m.virtualBalance)}
                    </TableCell>
                    <TableCell className="text-white/50 text-xs whitespace-nowrap">
                      {fmtDate(m.joinedDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={m.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          data-ocid={`members.view_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-white/40 hover:text-blue-400 hover:bg-blue-500/10"
                          onClick={() => setViewMember(m)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          data-ocid={`members.suspend_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10"
                          onClick={() => {
                            onStatusChange(
                              m.id,
                              m.status === "suspended" ? "active" : "suspended",
                            );
                            toast.success(
                              `${m.name} ${m.status === "suspended" ? "reactivated" : "suspended"}`,
                            );
                          }}
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          data-ocid={`members.debar_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-white/40 hover:text-orange-400 hover:bg-orange-500/10"
                          onClick={() => {
                            onStatusChange(
                              m.id,
                              m.status === "debarred" ? "active" : "debarred",
                            );
                            toast.success(
                              `${m.name} ${m.status === "debarred" ? "reinstated" : "debarred"}`,
                            );
                          }}
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          data-ocid={`members.delete_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => onDelete(m)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={!!viewMember} onOpenChange={() => setViewMember(null)}>
        <DialogContent
          data-ocid="member_detail.dialog"
          className="bg-[#1a2235] border-white/10 text-white max-w-md"
        >
          {viewMember && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white font-display">
                  {viewMember.name}
                </DialogTitle>
                <DialogDescription className="text-chart-1 font-mono">
                  {viewMember.id}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-2 text-sm">
                {[
                  ["Phone", viewMember.phone],
                  ["Email", viewMember.email],
                  ["Aadhaar", viewMember.aadhaar],
                  ["PAN", viewMember.pan],
                  ["Sponsor", viewMember.sponsorId ?? "Root Member"],
                  ["Downlines", viewMember.downlineCount],
                  ["Joined", fmtDate(viewMember.joinedDate)],
                  ["Last Active", fmtDate(viewMember.lastActive)],
                  ["Virtual Balance", fmtINR(viewMember.virtualBalance)],
                  ["Total Trades", viewMember.totalTrades],
                  ["P&L", fmtINR(viewMember.pnl)],
                  ["DigiLocker Ref", viewMember.digilockerRef || "—"],
                ].map(([label, val]) => (
                  <div key={String(label)}>
                    <span className="text-white/40 text-xs">{label}</span>
                    <p className="text-white/90 mt-0.5">{String(val)}</p>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button
                  data-ocid="member_detail.close_button"
                  variant="ghost"
                  onClick={() => setViewMember(null)}
                  className="text-white/60 hover:text-white"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── KYC Section ──────────────────────────────────────────────────────────────

function KycSection({
  members,
  onApprove,
  onReject,
}: {
  members: Member[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | KycStatus>("pending");

  const filtered = members.filter(
    (m) => filter === "all" || m.kycStatus === filter,
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <Button
            key={f}
            data-ocid={`kyc.filter_${f}.tab`}
            variant={filter === f ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "bg-chart-1 text-black font-semibold"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <Card className="bg-[#1a2235] border-white/10">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                {[
                  "Member ID",
                  "Name",
                  "Aadhaar (Masked)",
                  "PAN No.",
                  "DigiLocker Ref",
                  "Submitted",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="text-white/40 text-xs uppercase tracking-wider"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-white/30 py-12"
                    data-ocid="kyc.empty_state"
                  >
                    No KYC submissions found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m, idx) => (
                  <TableRow
                    key={m.id}
                    data-ocid={`kyc.item.${idx + 1}`}
                    className="border-white/5 hover:bg-white/3"
                  >
                    <TableCell className="font-mono text-xs text-chart-1">
                      {m.id}
                    </TableCell>
                    <TableCell className="text-white/90 font-medium whitespace-nowrap">
                      {m.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/60">
                      {m.aadhaar}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/60">
                      {m.pan}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/50">
                      {m.digilockerRef || "—"}
                    </TableCell>
                    <TableCell className="text-white/50 text-xs">
                      {fmtDate(m.joinedDate)}
                    </TableCell>
                    <TableCell>
                      <KycBadge status={m.kycStatus} />
                    </TableCell>
                    <TableCell>
                      {m.kycStatus === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            data-ocid={`kyc.approve_button.${idx + 1}`}
                            size="sm"
                            onClick={() => {
                              onApprove(m.id);
                              toast.success(`KYC approved for ${m.name}`);
                            }}
                            className="h-7 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 text-xs px-2"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button
                            data-ocid={`kyc.reject_button.${idx + 1}`}
                            size="sm"
                            onClick={() => {
                              onReject(m.id);
                              toast.error(`KYC rejected for ${m.name}`);
                            }}
                            className="h-7 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 text-xs px-2"
                          >
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      {m.kycStatus !== "pending" && (
                        <span className="text-white/30 text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}

// ─── Payments Section ─────────────────────────────────────────────────────────

function PaymentsSection({
  members,
  onApprove,
  onReject,
}: {
  members: Member[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | PaymentStatus>("pending");

  const filtered = members.filter(
    (m) => filter === "all" || m.paymentStatus === filter,
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <Button
            key={f}
            data-ocid={`payments.filter_${f}.tab`}
            variant={filter === f ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "bg-chart-1 text-black font-semibold"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <Card className="bg-[#1a2235] border-white/10">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                {[
                  "Member ID",
                  "Name",
                  "Amount",
                  "Method",
                  "Transaction ID",
                  "Submitted",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="text-white/40 text-xs uppercase tracking-wider"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-white/30 py-12"
                    data-ocid="payments.empty_state"
                  >
                    No payment submissions found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m, idx) => (
                  <TableRow
                    key={m.id}
                    data-ocid={`payments.item.${idx + 1}`}
                    className="border-white/5 hover:bg-white/3"
                  >
                    <TableCell className="font-mono text-xs text-chart-1">
                      {m.id}
                    </TableCell>
                    <TableCell className="text-white/90 font-medium whitespace-nowrap">
                      {m.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold text-chart-1">
                      ₹1
                    </TableCell>
                    <TableCell className="text-white/60 text-xs">
                      {m.paymentMethod || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/50">
                      {m.transactionId || "—"}
                    </TableCell>
                    <TableCell className="text-white/50 text-xs">
                      {fmtDate(m.joinedDate)}
                    </TableCell>
                    <TableCell>
                      <PayBadge status={m.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      {m.paymentStatus === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            data-ocid={`payments.approve_button.${idx + 1}`}
                            size="sm"
                            onClick={() => {
                              onApprove(m.id);
                              toast.success(`Payment approved for ${m.name}`);
                            }}
                            className="h-7 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 text-xs px-2"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button
                            data-ocid={`payments.reject_button.${idx + 1}`}
                            size="sm"
                            onClick={() => {
                              onReject(m.id);
                              toast.error(`Payment rejected for ${m.name}`);
                            }}
                            className="h-7 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 text-xs px-2"
                          >
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      {m.paymentStatus !== "pending" && (
                        <span className="text-white/30 text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}

// ─── Portfolios Section ───────────────────────────────────────────────────────

function PortfoliosSection({ members }: { members: Member[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const HOLDINGS: Record<
    string,
    { symbol: string; qty: number; avgPrice: number; ltp: number }[]
  > = {
    RI001920001: [
      { symbol: "RELIANCE", qty: 10, avgPrice: 2850, ltp: 2920 },
      { symbol: "TCS", qty: 5, avgPrice: 3680, ltp: 3750 },
      { symbol: "NIFTYBEES", qty: 100, avgPrice: 220, ltp: 228 },
    ],
    RI001920002: [
      { symbol: "INFY", qty: 15, avgPrice: 1580, ltp: 1510 },
      { symbol: "HDFC", qty: 8, avgPrice: 1720, ltp: 1695 },
    ],
    RI001920005: [
      { symbol: "BANKNIFTY", qty: 1, avgPrice: 47000, ltp: 49200 },
      { symbol: "NIFTY50 CE", qty: 50, avgPrice: 280, ltp: 350 },
      { symbol: "RELIANCE", qty: 20, avgPrice: 2790, ltp: 2920 },
    ],
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2235] border-white/10">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              {[
                "Member ID",
                "Name",
                "Virtual Balance",
                "Invested",
                "P&L",
                "Trades",
                "Last Active",
                "",
              ].map((h) => (
                <TableHead
                  key={h}
                  className="text-white/40 text-xs uppercase tracking-wider"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m, idx) => (
              <React.Fragment key={m.id}>
                <TableRow
                  data-ocid={`portfolios.item.${idx + 1}`}
                  className="border-white/5 hover:bg-white/3 cursor-pointer"
                  onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                >
                  <TableCell className="font-mono text-xs text-chart-1">
                    {m.id}
                  </TableCell>
                  <TableCell className="text-white/90 font-medium whitespace-nowrap">
                    {m.name}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-white/80">
                    {fmtINR(m.virtualBalance)}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-white/70">
                    {fmtINR(m.totalInvested)}
                  </TableCell>
                  <TableCell
                    className={`font-mono text-sm font-semibold ${
                      m.pnl > 0
                        ? "text-green-400"
                        : m.pnl < 0
                          ? "text-red-400"
                          : "text-white/40"
                    }`}
                  >
                    {m.pnl > 0 ? "+" : ""}
                    {fmtINR(m.pnl)}
                  </TableCell>
                  <TableCell className="text-white/60">
                    {m.totalTrades}
                  </TableCell>
                  <TableCell className="text-white/50 text-xs">
                    {fmtDate(m.lastActive)}
                  </TableCell>
                  <TableCell>
                    {HOLDINGS[m.id] ? (
                      expanded === m.id ? (
                        <ChevronDown className="h-4 w-4 text-white/40" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-white/40" />
                      )
                    ) : null}
                  </TableCell>
                </TableRow>
                <AnimatePresence>
                  {expanded === m.id && HOLDINGS[m.id] && (
                    <TableRow className="border-white/5">
                      <TableCell colSpan={8} className="bg-white/2 p-0">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 py-3">
                            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
                              Holdings
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                              {HOLDINGS[m.id].map((h) => (
                                <div
                                  key={h.symbol}
                                  className="bg-white/5 rounded-lg p-3"
                                >
                                  <p className="text-white/90 font-mono font-semibold text-sm">
                                    {h.symbol}
                                  </p>
                                  <p className="text-white/40 text-xs mt-0.5">
                                    Qty: {h.qty}
                                  </p>
                                  <p
                                    className={`text-sm font-semibold mt-1 ${
                                      h.ltp >= h.avgPrice
                                        ? "text-green-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {h.ltp >= h.avgPrice ? "+" : ""}
                                    {fmtINR((h.ltp - h.avgPrice) * h.qty)}
                                  </p>
                                  <p className="text-white/30 text-xs">
                                    LTP: ₹{h.ltp}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

const NAV_ITEMS: {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users },
  { id: "kyc", label: "KYC Approvals", icon: FileCheck },
  { id: "payments", label: "Payment Approvals", icon: CreditCard },
  { id: "portfolios", label: "Portfolios", icon: TrendingUp },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState<NavSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const handleDelete = (m: Member) => setDeleteTarget(m);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    toast.success(
      `${deleteTarget.name} (${deleteTarget.id}) deleted. Downline reassigned.`,
    );
    setDeleteTarget(null);
  };

  const handleStatusChange = (id: string, status: MemberStatus) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const handleKycApprove = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, kycStatus: "approved" } : m)),
    );
  };

  const handleKycReject = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, kycStatus: "rejected" } : m)),
    );
  };

  const handlePayApprove = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, paymentStatus: "approved" } : m)),
    );
  };

  const handlePayReject = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, paymentStatus: "rejected" } : m)),
    );
  };

  const sectionTitles: Record<NavSection, string> = {
    overview: "Dashboard Overview",
    members: "Member Management",
    kyc: "KYC Approvals",
    payments: "Payment Approvals",
    portfolios: "Member Portfolios",
  };

  const pendingKyc = members.filter((m) => m.kycStatus === "pending").length;
  const pendingPay = members.filter(
    (m) => m.paymentStatus === "pending",
  ).length;

  return (
    <div className="flex h-screen bg-[#0f1520] text-white overflow-hidden">
      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-[#141c2e] border-r border-white/8 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-chart-1 to-chart-5 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-white font-display font-bold text-sm leading-tight">
                RAY INFOTECH
              </p>
              <p className="text-white/40 text-xs">Admin Console</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const badge =
              item.id === "kyc"
                ? pendingKyc
                : item.id === "payments"
                  ? pendingPay
                  : 0;
            const active = activeSection === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`sidebar.${item.id}.link`}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-chart-1/15 text-chart-1 font-semibold"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
            <div className="w-7 h-7 rounded-full bg-chart-1/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-chart-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs font-semibold truncate">
                Administrator
              </p>
              <p className="text-white/30 text-xs truncate">Full Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-[#141c2e] border-b border-white/8 flex items-center px-4 gap-4 shrink-0">
          <button
            type="button"
            data-ocid="header.menu_button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <div className="flex-1">
            <h1 className="text-white/90 font-display font-bold text-base hidden sm:block">
              RAY INFOTECH — Admin Dashboard
            </h1>
            <p className="text-white/40 text-xs">
              {sectionTitles[activeSection]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">Admin</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1">
              <Clock className="h-3.5 w-3.5 text-white/30" />
              <span className="text-white/40 text-xs">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-4">
                <h2 className="text-xl font-display font-bold text-white">
                  {sectionTitles[activeSection]}
                </h2>
                <Separator className="mt-3 bg-white/8" />
              </div>

              {activeSection === "overview" && (
                <OverviewSection members={members} />
              )}
              {activeSection === "members" && (
                <MembersSection
                  members={members}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              )}
              {activeSection === "kyc" && (
                <KycSection
                  members={members}
                  onApprove={handleKycApprove}
                  onReject={handleKycReject}
                />
              )}
              {activeSection === "payments" && (
                <PaymentsSection
                  members={members}
                  onApprove={handlePayApprove}
                  onReject={handlePayReject}
                />
              )}
              {activeSection === "portfolios" && (
                <PortfoliosSection members={members} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-white/8 px-6 py-3 flex items-center justify-between bg-[#141c2e]">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} RAY INFOTECH. Admin Console.
          </p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/20 hover:text-white/40 text-xs transition-colors"
          >
            Built with ❤ caffeine.ai
          </a>
        </footer>
      </div>

      {/* Delete Confirm Dialog */}
      <DeleteDialog
        member={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
