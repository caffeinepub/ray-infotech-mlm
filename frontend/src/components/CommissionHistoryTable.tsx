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
import { IndianRupee, Lock } from 'lucide-react';

const JOINING_FEE = 2750;

// Explicit 9-level config — never derived, never truncated
const LEVEL_CONFIG: Array<{ level: number; rate: number; maxMembers: number }> = [
  { level: 1, rate: 9,  maxMembers: 3 },
  { level: 2, rate: 8,  maxMembers: 9 },
  { level: 3, rate: 7,  maxMembers: 27 },
  { level: 4, rate: 6,  maxMembers: 81 },
  { level: 5, rate: 5,  maxMembers: 243 },
  { level: 6, rate: 4,  maxMembers: 729 },
  { level: 7, rate: 3,  maxMembers: 2187 },
  { level: 8, rate: 2,  maxMembers: 6561 },
  { level: 9, rate: 1,  maxMembers: 19683 },
];

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
  // Build exactly 9 rows — one per level config entry
  const rows = LEVEL_CONFIG.map(({ level, rate, maxMembers }) => {
    // Level 1 uses direct downlines; levels 2–9 use BFS-populated map
    const membersAtLevel: number =
      level === 1
        ? (member.directDownlines?.length ?? 0)
        : (downlinesByLevel?.[level]?.length ?? 0);

    const totalCollection = membersAtLevel * JOINING_FEE;
    const commission = totalCollection * (rate / 100);
    const maxCommission = maxMembers * JOINING_FEE * (rate / 100);

    return {
      level,
      membersAtLevel,
      maxMembers,
      rate,
      commission,
      maxCommission,
      totalCollection,
      isUnlocked: membersAtLevel > 0,
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
          Complete 9-level payout structure — Levels 1 through 9 (9% down to 1%)
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Level</TableHead>
              <TableHead className="whitespace-nowrap">Rate</TableHead>
              <TableHead className="whitespace-nowrap">Members</TableHead>
              <TableHead className="whitespace-nowrap">Max Members</TableHead>
              <TableHead className="whitespace-nowrap">Total Collection</TableHead>
              <TableHead className="whitespace-nowrap">Commission Earned</TableHead>
              <TableHead className="whitespace-nowrap">Max Commission</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={`level-row-${row.level}`}
                className={!row.isUnlocked ? 'opacity-75' : ''}
              >
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {!row.isUnlocked && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
                    <span className="font-semibold text-foreground whitespace-nowrap">
                      Level {row.level}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`font-bold whitespace-nowrap ${
                      row.isUnlocked
                        ? 'text-gold-400 border-gold-500/30 bg-gold-500/10'
                        : 'text-muted-foreground border-border'
                    }`}
                  >
                    {row.rate}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{row.membersAtLevel}</span>
                  <span className="text-muted-foreground text-xs">
                    {' '}/ {row.maxMembers.toLocaleString('en-IN')}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {row.maxMembers.toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatCurrency(row.totalCollection)}
                </TableCell>
                <TableCell>
                  <span
                    className={`font-semibold whitespace-nowrap ${
                      row.commission > 0 ? 'text-gold-400' : 'text-muted-foreground'
                    }`}
                  >
                    {formatCurrency(row.commission)}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {formatCurrency(row.maxCommission)}
                </TableCell>
                <TableCell>
                  {!row.isUnlocked ? (
                    <Badge
                      variant="outline"
                      className="text-muted-foreground border-border text-xs whitespace-nowrap"
                    >
                      Locked
                    </Badge>
                  ) : row.membersAtLevel >= row.maxMembers ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs whitespace-nowrap">
                      Full
                    </Badge>
                  ) : (
                    <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 text-xs whitespace-nowrap">
                      Active
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-muted/30">
              <TableCell colSpan={5} className="font-semibold text-foreground">
                Total Commission (All 9 Levels)
              </TableCell>
              <TableCell>
                <span className="font-bold text-gold-400 whitespace-nowrap">
                  {formatCurrency(totalCommission)}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm font-medium whitespace-nowrap">
                {formatCurrency(totalMaxCommission)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
