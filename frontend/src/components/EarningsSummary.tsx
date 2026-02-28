import React from 'react';
import { MemberPublic } from '../backend';
import { IndianRupee, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const JOINING_FEE = 2750;
const LEVEL_RATES = [0, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1]; // index = level (1-indexed), level 1 = fee refund

interface EarningsSummaryProps {
  member: MemberPublic;
  downlinesByLevel: Record<number, MemberPublic[]>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function EarningsSummary({ member, downlinesByLevel }: EarningsSummaryProps) {
  const hasLevel1Refund = member.directDownlines.length >= 3;

  // Calculate per-level earnings
  const levelEarnings = Array.from({ length: 9 }, (_, i) => {
    const level = i + 1;
    if (level === 1) {
      return {
        level,
        earned: hasLevel1Refund ? JOINING_FEE : 0,
        potential: JOINING_FEE,
        label: 'Fee Refund',
        unlocked: hasLevel1Refund,
      };
    }
    const membersAtLevel = downlinesByLevel[level] ?? [];
    const count = membersAtLevel.length;
    const rate = LEVEL_RATES[level];
    const earned = count * JOINING_FEE * (rate / 100);
    const potentialCount = Math.pow(3, level);
    const potential = potentialCount * JOINING_FEE * (rate / 100);
    return {
      level,
      earned,
      potential,
      label: `${rate}% Commission`,
      unlocked: count > 0,
    };
  });

  const totalEarned = levelEarnings.reduce((sum, l) => sum + l.earned, 0);
  const totalPotential = levelEarnings.reduce((sum, l) => sum + l.potential, 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-gold-400" />
        Earnings Summary
      </h3>

      {/* Total Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="w-4 h-4 text-gold-400" />
            <span className="text-sm text-muted-foreground">Total Earned</span>
          </div>
          <p className="text-3xl font-bold text-gold-400 font-poppins">
            {formatCurrency(totalEarned)}
          </p>
        </div>
        <div className="bg-muted/50 border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Potential</span>
          </div>
          <p className="text-3xl font-bold text-foreground font-poppins">
            {formatCurrency(totalPotential)}
          </p>
        </div>
      </div>

      {/* Fee Refund Status */}
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border mb-4 ${
          hasLevel1Refund
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-muted/30 border-border'
        }`}
      >
        {hasLevel1Refund ? (
          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
        ) : (
          <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">
            Joining Fee Refund (₹{JOINING_FEE.toLocaleString('en-IN')})
          </p>
          <p className="text-xs text-muted-foreground">
            {hasLevel1Refund
              ? `Refunded — 3 direct recruits completed`
              : `${member.directDownlines.length}/3 direct recruits — ${3 - member.directDownlines.length} more needed`}
          </p>
        </div>
        <div className="ml-auto">
          <span
            className={`text-sm font-bold ${
              hasLevel1Refund ? 'text-green-400' : 'text-muted-foreground'
            }`}
          >
            {hasLevel1Refund ? formatCurrency(JOINING_FEE) : '—'}
          </span>
        </div>
      </div>

      {/* Level Earnings Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {levelEarnings.slice(1).map(({ level, earned, potential, label, unlocked }) => (
          <div
            key={level}
            className={`p-3 rounded-xl border ${
              unlocked
                ? 'bg-gold-500/5 border-gold-500/30'
                : 'bg-muted/20 border-border opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted-foreground">Level {level}</span>
              <span className="text-xs text-gold-400">{label}</span>
            </div>
            <p className="text-base font-bold text-foreground">
              {unlocked ? formatCurrency(earned) : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Max: {formatCurrency(potential)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
