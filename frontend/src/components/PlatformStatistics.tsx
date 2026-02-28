import React, { useMemo } from 'react';
import { useListMembers } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, IndianRupee, TrendingUp, Award } from 'lucide-react';

const JOINING_FEE = 2750;
const LEVEL_RATES: Record<number, number> = {
  2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 1,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PlatformStatistics() {
  const { data: allMembers = [], isLoading } = useListMembers();

  const stats = useMemo(() => {
    const totalMembers = allMembers.length;
    const paidMembers = allMembers.filter((m) => m.joiningFeePaid).length;
    const totalFeesCollected = paidMembers * JOINING_FEE;

    // Members who have 3+ direct downlines (eligible for refund)
    const refundEligible = allMembers.filter((m) => m.directDownlines.length >= 3).length;
    const totalRefundsIssued = refundEligible * JOINING_FEE;

    // Build member map for downline traversal
    const memberMap = new Map(allMembers.map((m) => [m.id, m]));

    // Calculate total commissions across all members (levels 2-9)
    let totalCommissions = 0;
    for (const member of allMembers) {
      // BFS to get downlines by level
      const queue: Array<{ id: bigint; level: number }> = [];
      member.directDownlines.forEach((id) => queue.push({ id, level: 1 }));
      const visited = new Set<bigint>();

      while (queue.length > 0) {
        const item = queue.shift()!;
        if (visited.has(item.id)) continue;
        visited.add(item.id);

        const downlineMember = memberMap.get(item.id);
        if (!downlineMember) continue;

        if (item.level >= 2 && item.level <= 9) {
          const rate = LEVEL_RATES[item.level] ?? 0;
          totalCommissions += JOINING_FEE * (rate / 100);
        }

        if (item.level < 9) {
          downlineMember.directDownlines.forEach((childId) => {
            if (!visited.has(childId)) {
              queue.push({ id: childId, level: item.level + 1 });
            }
          });
        }
      }
    }

    const activeMembers = allMembers.filter((m) => !m.isCancelled).length;
    const cancelledMembers = allMembers.filter((m) => m.isCancelled).length;

    return {
      totalMembers,
      paidMembers,
      totalFeesCollected,
      refundEligible,
      totalRefundsIssued,
      totalCommissions,
      activeMembers,
      cancelledMembers,
    };
  }, [allMembers]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Members',
      value: stats.totalMembers.toLocaleString('en-IN'),
      sub: `${stats.activeMembers} active, ${stats.cancelledMembers} cancelled`,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Fees Collected',
      value: formatCurrency(stats.totalFeesCollected),
      sub: `${stats.paidMembers} paid members`,
      icon: IndianRupee,
      color: 'text-gold-400',
      bg: 'bg-gold-500/10',
    },
    {
      label: 'Refunds Issued',
      value: formatCurrency(stats.totalRefundsIssued),
      sub: `${stats.refundEligible} members qualified`,
      icon: Award,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Total Commissions',
      value: formatCurrency(stats.totalCommissions),
      sub: 'Levels 2–9 payouts',
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <span className="text-sm text-muted-foreground">{card.label}</span>
          </div>
          <p className="text-xl font-bold text-foreground font-poppins">{card.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
