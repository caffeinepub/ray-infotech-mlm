import type { MemberPublic } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Gift } from 'lucide-react';

interface CommissionHistoryTableProps {
  member: MemberPublic;
  allMembers: MemberPublic[];
}

const JOINING_FEE = 2750;
const COMMISSION_RATES: Record<number, number> = {
  2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1,
};

interface CommissionEntry {
  type: 'refund' | 'commission';
  level: number;
  percentage: number | null;
  amount: number;
  fromMember: MemberPublic | null;
  timestamp: bigint;
}

function buildCommissionHistory(member: MemberPublic, allMembers: MemberPublic[]): CommissionEntry[] {
  const entries: CommissionEntry[] = [];

  // Refund entry
  if (member.feeRefunded) {
    entries.push({
      type: 'refund',
      level: 1,
      percentage: null,
      amount: JOINING_FEE,
      fromMember: null,
      timestamp: member.registrationTimestamp,
    });
  }

  // Commission entries from downlines
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

  if (member.feeRefunded) {
    for (const m of allMembers) {
      if (m.id === member.id) continue;
      const depth = getDepth(m.id, member.id, 0);
      if (depth >= 2 && depth <= 10) {
        const rate = COMMISSION_RATES[depth];
        if (rate) {
          entries.push({
            type: 'commission',
            level: depth,
            percentage: rate,
            amount: Math.floor((JOINING_FEE * rate) / 100),
            fromMember: m,
            timestamp: m.registrationTimestamp,
          });
        }
      }
    }
  }

  // Sort by timestamp descending
  entries.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));

  return entries;
}

export default function CommissionHistoryTable({ member, allMembers }: CommissionHistoryTableProps) {
  const entries = buildCommissionHistory(member, allMembers);
  const totalEarned = entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-lg flex items-center gap-2">
            <TrendingUp size={18} className="text-gold-400" />
            Commission History
          </CardTitle>
          {entries.length > 0 && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total Earned</div>
              <div className="text-lg font-bold text-gold-400">₹{totalEarned.toLocaleString('en-IN')}</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp size={36} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No earnings yet.</p>
            <p className="text-muted-foreground text-xs mt-1">
              {member.feeRefunded
                ? 'Commissions will appear as your downlines grow.'
                : 'Fill 3 direct downline slots to start earning.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Level</TableHead>
                  <TableHead className="text-muted-foreground">Rate</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">From Member</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, i) => (
                  <TableRow key={i} className="border-border hover:bg-muted/20">
                    <TableCell>
                      {entry.type === 'refund' ? (
                        <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 text-xs">
                          <Gift size={10} className="mr-1" /> Refund
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                          <TrendingUp size={10} className="mr-1" /> Commission
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground font-medium">
                      Level {entry.level}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.percentage !== null ? `${entry.percentage}%` : 'Full Refund'}
                    </TableCell>
                    <TableCell className="font-semibold text-gold-400">
                      ₹{entry.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.fromMember ? `${entry.fromMember.name} (#${entry.fromMember.id.toString()})` : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(Number(entry.timestamp) / 1_000_000).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
