import type { MemberPublic } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, TrendingUp, Gift } from 'lucide-react';

interface EarningsSummaryProps {
  member: MemberPublic;
  allMembers: MemberPublic[];
}

const JOINING_FEE = 2750;
const COMMISSION_RATES: Record<number, number> = {
  2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1,
};

function calculateMemberEarnings(member: MemberPublic, allMembers: MemberPublic[]) {
  let refundAmount = 0;
  let commissionTotal = 0;
  const commissions: Array<{ level: number; amount: number; memberId: bigint }> = [];

  if (member.feeRefunded) {
    refundAmount = JOINING_FEE;
  }

  // Calculate commissions: for each member in the downline tree, check what level they are relative to this member
  const getDepth = (targetId: bigint, fromId: bigint, depth: number): number => {
    if (targetId === fromId) return depth;
    const fromMember = allMembers.find((m) => m.id === fromId);
    if (!fromMember) return -1;
    for (const downlineId of fromMember.directDownlines) {
      const result = getDepth(targetId, downlineId, depth + 1);
      if (result !== -1) return result;
    }
    return -1;
  };

  // Walk all members and find those in this member's downline
  for (const m of allMembers) {
    if (m.id === member.id) continue;
    const depth = getDepth(m.id, member.id, 0);
    if (depth >= 2 && depth <= 10 && member.feeRefunded) {
      const rate = COMMISSION_RATES[depth];
      if (rate) {
        const amount = Math.floor((JOINING_FEE * rate) / 100);
        commissionTotal += amount;
        commissions.push({ level: depth, amount, memberId: m.id });
      }
    }
  }

  return { refundAmount, commissionTotal, total: refundAmount + commissionTotal, commissions };
}

export default function EarningsSummary({ member, allMembers }: EarningsSummaryProps) {
  const { refundAmount, commissionTotal, total } = calculateMemberEarnings(member, allMembers);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground text-lg flex items-center gap-2">
          <TrendingUp size={18} className="text-gold-400" />
          Earnings Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Earnings */}
          <div className="sm:col-span-1 bg-gold-500/10 border border-gold-500/30 rounded-xl p-4 text-center">
            <div className="text-gold-400 mb-1 flex justify-center">
              <IndianRupee size={24} />
            </div>
            <div className="text-3xl font-bold text-gold-400">₹{total.toLocaleString('en-IN')}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Earnings</div>
          </div>

          {/* Refund */}
          <div className={`rounded-xl p-4 text-center border ${
            member.feeRefunded
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-muted/30 border-border'
          }`}>
            <div className={`mb-1 flex justify-center ${member.feeRefunded ? 'text-emerald-400' : 'text-muted-foreground'}`}>
              <Gift size={24} />
            </div>
            <div className={`text-2xl font-bold ${member.feeRefunded ? 'text-emerald-400' : 'text-muted-foreground'}`}>
              {member.feeRefunded ? `₹${refundAmount.toLocaleString('en-IN')}` : '—'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {member.feeRefunded ? 'Fee Refunded' : 'Refund Pending'}
            </div>
            {!member.feeRefunded && (
              <div className="text-xs text-muted-foreground mt-1">
                {member.directDownlines.length}/3 slots filled
              </div>
            )}
          </div>

          {/* Commissions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-blue-400 mb-1 flex justify-center">
              <TrendingUp size={24} />
            </div>
            <div className="text-2xl font-bold text-blue-400">₹{commissionTotal.toLocaleString('en-IN')}</div>
            <div className="text-sm text-muted-foreground mt-1">Commissions Earned</div>
          </div>
        </div>

        {!member.feeRefunded && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-amber-400 text-sm text-center">
              💡 Fill {3 - member.directDownlines.length} more direct downline slot{3 - member.directDownlines.length !== 1 ? 's' : ''} to get your ₹2,750 joining fee refunded!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
