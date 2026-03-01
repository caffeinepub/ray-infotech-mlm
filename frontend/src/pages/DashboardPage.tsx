import React, { useState, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListMembers, useGetSenderDownlines, useCalculateCommissions } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import type { MemberPublic } from '../backend';
import { Loader2, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MatrixTreeVisualization from '../components/MatrixTreeVisualization';
import EarningsSummary from '../components/EarningsSummary';
import CommissionHistoryTable from '../components/CommissionHistoryTable';
import RecruitmentDeadlineCard from '../components/RecruitmentDeadlineCard';

export default function DashboardPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const isAuthenticated = !!identity;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<bigint | null>(null);

  const { data: members = [], isLoading: membersLoading } = useListMembers();

  const selectedMember = useMemo<MemberPublic | null>(() => {
    if (selectedMemberId === null) return null;
    return members.find((m) => m.id === selectedMemberId) ?? null;
  }, [members, selectedMemberId]);

  const { data: allDownlineIds = [], isLoading: downlinesLoading } = useGetSenderDownlines(
    selectedMember?.id ?? null,
  );

  // Build a Map<bigint, MemberPublic> for MatrixTreeVisualization
  const allMembersMap = useMemo<Map<bigint, MemberPublic>>(() => {
    const map = new Map<bigint, MemberPublic>();
    for (const m of members) {
      map.set(m.id, m);
    }
    return map;
  }, [members]);

  // BFS traversal to build downlines by level as Record<number, MemberPublic[]>
  // (EarningsSummary and CommissionHistoryTable expect Record<number, MemberPublic[]>)
  const downlinesByLevel = useMemo<Record<number, MemberPublic[]>>(() => {
    const levels: Record<number, MemberPublic[]> = {};
    for (let i = 1; i <= 9; i++) levels[i] = [];

    if (!selectedMember || members.length === 0) return levels;

    const memberMap = new Map<string, MemberPublic>();
    for (const m of members) {
      memberMap.set(m.id.toString(), m);
    }

    const visited = new Set<string>();
    const queue: Array<{ id: bigint; level: number }> = [{ id: selectedMember.id, level: 0 }];
    visited.add(selectedMember.id.toString());

    while (queue.length > 0) {
      const item = queue.shift()!;
      const current = memberMap.get(item.id.toString());
      if (!current) continue;

      for (const childId of current.directDownlines) {
        const childKey = childId.toString();
        if (!visited.has(childKey)) {
          visited.add(childKey);
          const childLevel = item.level + 1;
          if (childLevel >= 1 && childLevel <= 9) {
            const child = memberMap.get(childKey);
            if (child) {
              levels[childLevel].push(child);
              queue.push({ id: childId, level: childLevel });
            }
          }
        }
      }
    }

    return levels;
  }, [selectedMember, members]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.memberIdStr.toLowerCase().includes(q),
    );
  }, [members, searchQuery]);

  // Show loading while identity is being restored
  if (isInitializing || actorFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold-400" />
          <p className="text-muted-foreground text-sm">Restoring your session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <User className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Authentication Required</h2>
          <p className="text-muted-foreground max-w-sm">
            Please log in to access your dashboard.
          </p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Member Dashboard</h1>
          <p className="text-muted-foreground mt-1">View your network, earnings, and downline performance</p>
        </div>

        {/* Member Search & Selector */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-gold-400" />
            Select Member to View
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or member ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
          </div>

          {membersLoading ? (
            <div className="mt-4 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading members…</span>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {filteredMembers.map((member) => (
                <button
                  key={member.id.toString()}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`text-left px-3 py-2 rounded-lg border transition-colors text-sm ${
                    selectedMemberId === member.id
                      ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                      : 'border-border hover:border-gold-500/50 hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{member.memberIdStr}</div>
                </button>
              ))}
              {filteredMembers.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-3 py-2">
                  {searchQuery ? 'No members match your search.' : 'No members registered yet.'}
                </p>
              )}
            </div>
          )}
        </div>

        {selectedMember ? (
          <>
            {/* Member Info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center flex-shrink-0">
                  <User className="h-7 w-7 text-gold-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{selectedMember.name}</h2>
                  <p className="text-gold-400 font-mono text-sm">{selectedMember.memberIdStr}</p>
                  <p className="text-muted-foreground text-sm">{selectedMember.contactInfo}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedMember.joiningFeePaid
                      ? 'bg-green-700/20 text-green-400 border border-green-700/40'
                      : 'bg-destructive/20 text-destructive border border-destructive/40'
                  }`}>
                    {selectedMember.joiningFeePaid ? 'Fee Paid' : 'Fee Unpaid'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedMember.isCancelled
                      ? 'bg-destructive/20 text-destructive border border-destructive/40'
                      : 'bg-green-700/20 text-green-400 border border-green-700/40'
                  }`}>
                    {selectedMember.isCancelled ? 'Cancelled' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recruitment Deadline */}
            <RecruitmentDeadlineCard member={selectedMember} />

            {/* Earnings Summary */}
            <EarningsSummary
              member={selectedMember}
              downlinesByLevel={downlinesByLevel}
            />

            {/* Matrix Tree */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Matrix Tree</h2>
              {downlinesLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading tree…</span>
                </div>
              ) : (
                <MatrixTreeVisualization
                  member={selectedMember}
                  allMembers={allMembersMap}
                />
              )}
            </div>

            {/* Commission History */}
            <CommissionHistoryTable
              member={selectedMember}
              downlinesByLevel={downlinesByLevel}
            />
          </>
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a Member</h3>
            <p className="text-muted-foreground text-sm">
              Choose a member from the list above to view their dashboard, earnings, and matrix tree.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
