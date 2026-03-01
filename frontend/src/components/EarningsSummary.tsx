import React from 'react';
import { MemberPublic } from '../backend';
import { IndianRupee, CheckCircle, Clock, TrendingUp, Lock } from 'lucide-react';

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
  const hasLevel1Refund = (member.directDownlines?.length ?? 0) >= 3;

  // Calculate per-level earnings for all 9 levels using explicit config
  const levelEarnings = LEVEL_CONFIG.map(({ level, rate, maxMembers }) => {
    const count: number =
      level === 1
        ? (member.directDownlines?.length ?? 0)
        : (downlinesByLevel?.[level]?.length ?? 0);

    const earned = count * JOINING_FEE * (rate / 100);
    const potential = maxMembers * JOINING_FEE * (rate / 100);

    return {
      level,
      rate,
      count,
      earned,
      potential,
      label: `${rate}%`,
      unlocked: count > 0,
    };
  });

  // Totals across all 9 levels
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
        className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${
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
              : `${member.directDownlines?.length ?? 0}/3 direct recruits — ${3 - (member.directDownlines?.length ?? 0)} more needed`}
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

      {/* Level Earnings Grid — all 9 levels in a 3×3 grid */}
      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
        Per-Level Commission Breakdown (Levels 1–9)
      </p>
      <div className="grid grid-cols-3 gap-3">
        {levelEarnings.map(({ level, rate, count, earned, potential, label, unlocked }) => (
          <div
            key={`level-card-${level}`}
            className={`p-3 rounded-xl border ${
              unlocked
                ? 'bg-gold-500/5 border-gold-500/30'
                : 'bg-card border-border/60 ring-1 ring-border/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted-foreground">Lvl {level}</span>
              <span className={`text-xs font-bold ${unlocked ? 'text-gold-400' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {unlocked ? (
              <>
                <p className="text-sm font-bold text-foreground">
                  {formatCurrency(earned)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {count} member{count !== 1 ? 's' : ''}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm font-semibold text-muted-foreground">
                    ₹0.00
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                  Max: {formatCurrency(potential)}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
