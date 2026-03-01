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

// Explicit 9-level rate config — index = level number
const LEVEL_RATES: Record<number, number> = {
  1: 9, 2: 8, 3: 7, 4: 6, 5: 5, 6: 4, 7: 3, 8: 2, 9: 1,
};

// All 9 levels explicitly defined
const ALL_LEVELS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Build a fresh levels map pre-initialised with empty arrays for all 9 levels */
function buildEmptyLevels(): Record<number, MemberPublic[]> {
  return { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
}

/**
 * BFS traversal starting from the selected member's direct downlines.
 * Level 1 = direct downlines, Level 2 = their children, …, Level 9 = 9th generation.
 * Always returns a record with all 9 level keys populated (empty arrays if no members).
 */
function buildDownlinesByLevel(
  rootMember: MemberPublic,
  memberMap: Map<bigint, MemberPublic>
): Record<number, MemberPublic[]> {
  const levels = buildEmptyLevels();

  if (!rootMember?.directDownlines?.length) {
    return levels;
  }

  // Seed the queue with direct downlines at level 1
  const queue: Array<{ id: bigint; level: number }> = [];
  for (const childId of rootMember.directDownlines) {
    queue.push({ id: childId, level: 1 });
  }

  const visited = new Set<string>();

  while (queue.length > 0) {
    const item = queue.shift()!;
    const idKey = item.id.toString();

    // Skip already-visited nodes to avoid cycles
    if (visited.has(idKey)) continue;
    visited.add(idKey);

    const member = memberMap.get(item.id);
    if (!member) continue;

    // Place member in the correct level bucket (levels 1–9)
    if (item.level >= 1 && item.level <= 9) {
      levels[item.level].push(member);
    }

    // Enqueue children for the next level — stop after level 9
    if (item.level < 9 && member.directDownlines?.length) {
      for (const childId of member.directDownlines) {
        const childKey = childId.toString();
        if (!visited.has(childKey)) {
          queue.push({ id: childId, level: item.level + 1 });
        }
      }
    }
  }

  return levels;
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

  const selectedMember = useMemo(
    () => (selectedMemberId != null ? (memberMap.get(selectedMemberId) ?? null) : null),
    [selectedMemberId, memberMap]
  );

  /**
   * Group downlines by level (1–9).
   * Always returns a record with all 9 level keys, even if some are empty arrays.
   */
  const downlinesByLevel = useMemo<Record<number, MemberPublic[]>>(() => {
    if (!selectedMember) return buildEmptyLevels();
    return buildDownlinesByLevel(selectedMember, memberMap);
  }, [selectedMember, memberMap]);

  // Calculate total earnings across all 9 levels
  const totalEarnings = useMemo(() => {
    if (!selectedMember) return 0;
    let total = 0;

    for (const level of ALL_LEVELS) {
      const rate = LEVEL_RATES[level];
      const count =
        level === 1
          ? (selectedMember.directDownlines?.length ?? 0)
          : (downlinesByLevel[level]?.length ?? 0);
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
                {selectedMember.directDownlines?.length ?? 0} / 3
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
