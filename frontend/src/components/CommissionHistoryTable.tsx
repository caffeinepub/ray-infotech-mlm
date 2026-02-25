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

// Level 1 = 9%, Level 2 = 8%, ..., Level 9 = 1%
// depth in tree maps directly: depth 1 → 9%, depth 2 → 8%, ..., depth 9 → 1%
const COMMISSION_RATES: Record<number, number> = {
  1: 9, 2: 8, 3: 7, 4: 6, 5: 5, 6: 4, 7: 3, 8: 2, 9: 1,
};

interface CommissionEntry {
  type: 'refund' | 'commission';
  level: number;
  percentage: number | null;
  memberCount: number;
  totalCollection: number;
  amount: number;
  timestamp: bigint;
}

function buildCommissionHistory(member: MemberPublic, allMembers: MemberPublic[]): CommissionEntry[] {
  const entries: CommissionEntry[] = [];

  // Refund entry
  if (member.feeRefunded) {
    entries.push({
      type: 'refund',
      level: 0,
      percentage: null,
      memberCount: 3,
      totalCollection: JOINING_FEE * 3,
      amount: JOINING_FEE,
      timestamp: member.registrationTimestamp,
    });
  }

  // Find depth of a target member relative to this member's tree
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
    // Group members by their depth level relative to this member
    const levelGroups: Record<number, MemberPublic[]> = {};

    for (const m of allMembers) {
      if (m.id === member.id) continue;
      const depth = getDepth(m.id, member.id, 0);
      if (depth >= 1 && depth <= 9) {
        if (!levelGroups[depth]) levelGroups[depth] = [];
        levelGroups[depth].push(m);
      }
    }

    // Create one commission entry per level (total collection at that level)
    for (const [depthStr, membersAtLevel] of Object.entries(levelGroups)) {
      const depth = Number(depthStr);
      const rate = COMMISSION_RATES[depth];
      if (rate && membersAtLevel.length > 0) {
        const memberCount = membersAtLevel.length;
        const totalCollection = memberCount * JOINING_FEE;
        const amount = Math.floor((totalCollection * rate) / 100);
        // Use the latest registration timestamp among members at this level
        const latestTimestamp = membersAtLevel.reduce(
          (max, m) => (m.registrationTimestamp > max ? m.registrationTimestamp : max),
          membersAtLevel[0].registrationTimestamp
        );
        entries.push({
          type: 'commission',
          level: depth,
          percentage: rate,
          memberCount,
          totalCollection,
          amount,
          timestamp: latestTimestamp,
        });
      }
    }
  }

  // Sort by level ascending (refund first, then level 1, 2, ...)
  entries.sort((a, b) => a.level - b.level);

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
                  <TableHead className="text-muted-foreground">Members</TableHead>
                  <TableHead className="text-muted-foreground">Total Collection</TableHead>
                  <TableHead className="text-muted-foreground">Commission</TableHead>
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
                      {entry.type === 'refund' ? 'Direct (L0)' : `Level ${entry.level}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.percentage !== null ? `${entry.percentage}% of total` : 'Full Refund'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.type === 'commission' ? entry.memberCount : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.type === 'commission'
                        ? `₹${entry.totalCollection.toLocaleString('en-IN')}`
                        : '—'}
                    </TableCell>
                    <TableCell className="font-semibold text-gold-400">
                      ₹{entry.amount.toLocaleString('en-IN')}
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
