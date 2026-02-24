import type { MemberPublic } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, IndianRupee, TrendingUp, CheckCircle } from 'lucide-react';

interface PlatformStatisticsProps {
  members: MemberPublic[];
  isLoading: boolean;
}

const JOINING_FEE = 2750;
const COMMISSION_RATES: Record<number, number> = {
  2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1,
};

function calculatePlatformStats(members: MemberPublic[]) {
  const totalMembers = members.length;
  const totalFeesCollected = members.filter((m) => m.joiningFeePaid).length * JOINING_FEE;
  const refundedCount = members.filter((m) => m.feeRefunded).length;
  const totalRefunds = refundedCount * JOINING_FEE;

  // Calculate total commissions
  let totalCommissions = 0;
  const getDepth = (targetId: bigint, fromId: bigint, depth: number, allMembers: MemberPublic[]): number => {
    if (targetId === fromId) return depth;
    const fromMember = allMembers.find((m) => m.id === fromId);
    if (!fromMember) return -1;
    for (const downlineId of fromMember.directDownlines) {
      const result = getDepth(targetId, downlineId, depth + 1, allMembers);
      if (result !== -1) return result;
    }
    return -1;
  };

  for (const member of members) {
    if (!member.feeRefunded) continue;
    for (const m of members) {
      if (m.id === member.id) continue;
      const depth = getDepth(m.id, member.id, 0, members);
      if (depth >= 2 && depth <= 10) {
        const rate = COMMISSION_RATES[depth];
        if (rate) {
          totalCommissions += Math.floor((JOINING_FEE * rate) / 100);
        }
      }
    }
  }

  return { totalMembers, totalFeesCollected, refundedCount, totalRefunds, totalCommissions };
}

export default function PlatformStatistics({ members, isLoading }: PlatformStatisticsProps) {
  const stats = calculatePlatformStats(members);

  const cards = [
    {
      label: 'Total Members',
      value: isLoading ? null : stats.totalMembers.toString(),
      icon: <Users size={22} />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Fees Collected',
      value: isLoading ? null : `₹${stats.totalFeesCollected.toLocaleString('en-IN')}`,
      icon: <IndianRupee size={22} />,
      color: 'text-gold-400',
      bg: 'bg-gold-500/10 border-gold-500/20',
    },
    {
      label: 'Refunds Issued',
      value: isLoading ? null : `${stats.refundedCount} (₹${stats.totalRefunds.toLocaleString('en-IN')})`,
      icon: <CheckCircle size={22} />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Total Commissions',
      value: isLoading ? null : `₹${stats.totalCommissions.toLocaleString('en-IN')}`,
      icon: <TrendingUp size={22} />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className={`border ${card.bg}`}>
          <CardContent className="p-5">
            <div className={`${card.color} mb-3`}>{card.icon}</div>
            {isLoading ? (
              <Skeleton className="h-7 w-24 mb-1" />
            ) : (
              <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
            )}
            <div className="text-sm text-muted-foreground mt-1">{card.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
