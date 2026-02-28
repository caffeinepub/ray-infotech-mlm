import React, { useState, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListMembers, useGetSenderDownlines } from '../hooks/useQueries';
import { MemberPublic } from '../backend';
import EarningsSummary from '../components/EarningsSummary';
import CommissionHistoryTable from '../components/CommissionHistoryTable';
import MatrixTreeVisualization from '../components/MatrixTreeVisualization';
import RecruitmentDeadlineCard from '../components/RecruitmentDeadlineCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, IndianRupee, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const JOINING_FEE = 2750;
const LEVEL_RATES = [0, 9, 8, 7, 6, 5, 4, 3, 2, 1]; // index = level, level 1 = fee refund

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatMemberIdStr(id: bigint): string {
  const numStr = id.toString();
  const padded = numStr.padStart(9, '0');
  return `RI ${padded}`;
}

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<bigint | null>(null);

  const { data: allMembers = [], isLoading: membersLoading } = useListMembers();
  const { data: downlineIds = [], isLoading: downlinesLoading } = useGetSenderDownlines(
    selectedMemberId
  );

  // Build a map for quick lookup
  const memberMap = useMemo(() => {
    const map = new Map<bigint, MemberPublic>();
    allMembers.forEach((m) => map.set(m.id, m));
    return map;
  }, [allMembers]);

  const selectedMember = selectedMemberId ? memberMap.get(selectedMemberId) ?? null : null;

  // Group downlines by level
  const downlinesByLevel = useMemo(() => {
    if (!selectedMember || downlineIds.length === 0) return {};
    const levels: Record<number, MemberPublic[]> = {};

    // BFS to determine levels
    const queue: Array<{ id: bigint; level: number }> = [];
    selectedMember.directDownlines.forEach((id) => queue.push({ id, level: 1 }));

    const visited = new Set<bigint>();
    while (queue.length > 0) {
      const item = queue.shift()!;
      if (visited.has(item.id)) continue;
      visited.add(item.id);

      const member = memberMap.get(item.id);
      if (!member) continue;

      if (!levels[item.level]) levels[item.level] = [];
      levels[item.level].push(member);

      if (item.level < 9) {
        member.directDownlines.forEach((childId) => {
          if (!visited.has(childId)) {
            queue.push({ id: childId, level: item.level + 1 });
          }
        });
      }
    }
    return levels;
  }, [selectedMember, downlineIds, memberMap]);

  // Calculate total earnings
  const totalEarnings = useMemo(() => {
    if (!selectedMember) return 0;
    let total = 0;

    // Level 1: fee refund if 3 direct downlines
    if (selectedMember.directDownlines.length >= 3) {
      total += JOINING_FEE;
    }

    // Levels 2-9
    for (let level = 2; level <= 9; level++) {
      const membersAtLevel = downlinesByLevel[level] ?? [];
      const count = membersAtLevel.length;
      const rate = LEVEL_RATES[level];
      total += count * JOINING_FEE * (rate / 100);
    }

    return total;
  }, [selectedMember, downlinesByLevel]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return allMembers;
    const q = searchQuery.toLowerCase();
    return allMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toString().includes(q) ||
        m.memberIdStr.toLowerCase().includes(q)
    );
  }, [allMembers, searchQuery]);

  const totalDownlineCount = downlineIds.length;

  if (membersLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-poppins">Member Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Select a member to view their earnings and downline structure
        </p>
      </div>

      {/* Member Search & Select */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gold-400" />
          Select Member
        </h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or member ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {filteredMembers.map((member) => (
            <button
              key={member.id.toString()}
              onClick={() => setSelectedMemberId(member.id)}
              className={`text-left p-3 rounded-xl border transition-all ${
                selectedMemberId === member.id
                  ? 'border-gold-500 bg-gold-500/10 text-foreground'
                  : 'border-border bg-muted/30 hover:border-gold-500/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="font-medium text-sm truncate">{member.name}</div>
              <div className="text-xs text-gold-400 font-mono">{member.memberIdStr}</div>
              <div className="flex items-center gap-1 mt-1">
                <Badge
                  variant={member.isCancelled ? 'destructive' : 'default'}
                  className="text-xs py-0"
                >
                  {member.isCancelled ? 'Cancelled' : 'Active'}
                </Badge>
                {!member.joiningFeePaid && (
                  <Badge variant="outline" className="text-xs py-0 border-yellow-500/50 text-yellow-500">
                    Fee Pending
                  </Badge>
                )}
              </div>
            </button>
          ))}
          {filteredMembers.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-3 py-4 text-center">
              No members found
            </p>
          )}
        </div>
      </div>

      {selectedMember ? (
        <>
          {/* Member Header */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground font-poppins">
                  {selectedMember.name}
                </h2>
                <p className="text-gold-400 font-mono text-sm mt-1">{selectedMember.memberIdStr}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {selectedMember.contactInfo.includes('|')
                    ? selectedMember.contactInfo.split('|')[0]
                    : selectedMember.contactInfo}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={selectedMember.isCancelled ? 'destructive' : 'default'}>
                  {selectedMember.isCancelled ? 'Cancelled' : 'Active'}
                </Badge>
                <Badge
                  variant={selectedMember.joiningFeePaid ? 'default' : 'outline'}
                  className={
                    selectedMember.joiningFeePaid
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'border-yellow-500/50 text-yellow-500'
                  }
                >
                  {selectedMember.joiningFeePaid ? 'Fee Paid' : 'Fee Pending'}
                </Badge>
                {selectedMember.feeRefunded && (
                  <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30">
                    Fee Refunded
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Recruitment Deadline */}
          <div className="mb-6">
            <RecruitmentDeadlineCard member={selectedMember} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-gold-500/10 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-gold-400" />
                </div>
                <span className="text-sm text-muted-foreground">Total Earnings</span>
              </div>
              <p className="text-2xl font-bold text-foreground font-poppins">
                {formatCurrency(totalEarnings)}
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm text-muted-foreground">Total Downline</span>
              </div>
              <p className="text-2xl font-bold text-foreground font-poppins">
                {downlinesLoading ? '...' : totalDownlineCount}
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-sm text-muted-foreground">Direct Recruits</span>
              </div>
              <p className="text-2xl font-bold text-foreground font-poppins">
                {selectedMember.directDownlines.length} / 3
              </p>
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="mb-6">
            <EarningsSummary member={selectedMember} downlinesByLevel={downlinesByLevel} />
          </div>

          {/* Commission Table */}
          <div className="mb-6">
            <CommissionHistoryTable member={selectedMember} downlinesByLevel={downlinesByLevel} />
          </div>

          {/* Matrix Tree */}
          <div className="mb-6">
            <MatrixTreeVisualization member={selectedMember} allMembers={memberMap} />
          </div>
        </>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Member Selected</h3>
          <p className="text-muted-foreground text-sm">
            Select a member from the list above to view their dashboard
          </p>
        </div>
      )}
    </div>
  );
}
