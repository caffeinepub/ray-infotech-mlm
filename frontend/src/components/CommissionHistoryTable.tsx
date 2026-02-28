import React from 'react';
import { MemberPublic } from '../backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { IndianRupee } from 'lucide-react';

const JOINING_FEE = 2750;
// Level 1 = fee refund, Levels 2-9 = 9%, 8%, 7%, 6%, 5%, 4%, 3%, 2%, 1%
const LEVEL_RATES: Record<number, number> = {
  1: 0, // special: fee refund
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 1,
};

const LEVEL_MEMBER_COUNTS: Record<number, number> = {
  1: 3,
  2: 9,
  3: 27,
  4: 81,
  5: 243,
  6: 729,
  7: 2187,
  8: 6561,
  9: 19683,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

interface CommissionHistoryTableProps {
  member: MemberPublic;
  downlinesByLevel: Record<number, MemberPublic[]>;
}

export default function CommissionHistoryTable({
  member,
  downlinesByLevel,
}: CommissionHistoryTableProps) {
  const rows = Array.from({ length: 9 }, (_, i) => {
    const level = i + 1;
    const membersAtLevel = level === 1 ? member.directDownlines.length : (downlinesByLevel[level]?.length ?? 0);
    const maxMembers = LEVEL_MEMBER_COUNTS[level];
    const rate = LEVEL_RATES[level];

    let commission = 0;
    let commissionLabel = '';
    let maxCommission = 0;

    if (level === 1) {
      commission = membersAtLevel >= 3 ? JOINING_FEE : 0;
      maxCommission = JOINING_FEE;
      commissionLabel = 'Fee Refund';
    } else {
      const totalCollection = membersAtLevel * JOINING_FEE;
      commission = totalCollection * (rate / 100);
      maxCommission = maxMembers * JOINING_FEE * (rate / 100);
      commissionLabel = `${rate}%`;
    }

    return {
      level,
      membersAtLevel,
      maxMembers,
      rate,
      commission,
      maxCommission,
      commissionLabel,
      isUnlocked: membersAtLevel > 0 || (level === 1 && membersAtLevel >= 3),
    };
  });

  const totalCommission = rows.reduce((sum, r) => sum + r.commission, 0);
  const totalMaxCommission = rows.reduce((sum, r) => sum + r.maxCommission, 0);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-gold-400" />
          Level-wise Commission Breakdown
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Complete 9-level payout structure with current and maximum earnings
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Level</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Max Members</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Total Collection</TableHead>
              <TableHead>Commission Earned</TableHead>
              <TableHead>Max Commission</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.level}
                className={row.membersAtLevel === 0 ? 'opacity-50' : ''}
              >
                <TableCell>
                  <span className="font-semibold text-foreground">Level {row.level}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{row.membersAtLevel}</span>
                  <span className="text-muted-foreground text-xs"> / {row.maxMembers}</span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {row.maxMembers.toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      row.level === 1
                        ? 'border-gold-500/50 text-gold-400'
                        : 'border-blue-500/50 text-blue-400'
                    }
                  >
                    {row.commissionLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {row.level === 1
                    ? '—'
                    : formatCurrency(row.membersAtLevel * JOINING_FEE)}
                </TableCell>
                <TableCell>
                  <span
                    className={`font-semibold ${
                      row.commission > 0 ? 'text-gold-400' : 'text-muted-foreground'
                    }`}
                  >
                    {row.commission > 0 ? formatCurrency(row.commission) : '—'}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatCurrency(row.maxCommission)}
                </TableCell>
                <TableCell>
                  {row.level === 1 ? (
                    <Badge
                      variant={row.membersAtLevel >= 3 ? 'default' : 'outline'}
                      className={
                        row.membersAtLevel >= 3
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'border-yellow-500/50 text-yellow-500'
                      }
                    >
                      {row.membersAtLevel >= 3 ? 'Refunded' : `${row.membersAtLevel}/3`}
                    </Badge>
                  ) : (
                    <Badge
                      variant={row.membersAtLevel > 0 ? 'default' : 'outline'}
                      className={
                        row.membersAtLevel === row.maxMembers
                          ? 'bg-gold-500/20 text-gold-400 border-gold-500/30'
                          : row.membersAtLevel > 0
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'text-muted-foreground'
                      }
                    >
                      {row.membersAtLevel === row.maxMembers
                        ? 'Complete'
                        : row.membersAtLevel > 0
                        ? 'Active'
                        : 'Pending'}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-muted/30">
              <TableCell colSpan={5} className="font-semibold">
                Total Earnings
              </TableCell>
              <TableCell>
                <span className="font-bold text-gold-400 text-base">
                  {formatCurrency(totalCommission)}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-bold text-foreground text-base">
                  {formatCurrency(totalMaxCommission)}
                </span>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
