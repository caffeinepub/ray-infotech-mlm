import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { useListMembers } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { LogIn, Search, TrendingUp, Users, IndianRupee, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import type { MemberPublic } from '../backend';
import MatrixTreeVisualization from '../components/MatrixTreeVisualization';
import CommissionHistoryTable from '../components/CommissionHistoryTable';
import EarningsSummary from '../components/EarningsSummary';
import RecruitmentDeadlineCard from '../components/RecruitmentDeadlineCard';

export default function DashboardPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: members, isLoading, refetch, isFetching } = useListMembers();
  const [searchId, setSearchId] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberPublic | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="bg-card border-border max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-full bg-gold-500/15 flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-gold-400" size={28} />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">Please login to view your dashboard.</p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold border-0"
            >
              {isLoggingIn ? 'Logging in...' : 'Login to Continue'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSearch = () => {
    if (!searchId.trim() || !members) return;
    const id = BigInt(searchId.trim());
    const found = members.find((m) => m.id === id);
    if (found) {
      setSelectedMember(found);
    } else {
      setSelectedMember(null);
    }
  };

  const totalMembers = members?.length ?? 0;
  const refundedCount = members?.filter((m) => m.feeRefunded).length ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Member Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">View matrix status, earnings, and commission history</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isFetching}
            className="border-border"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            <span className="ml-2">Refresh</span>
          </Button>
          <Button
            onClick={() => navigate({ to: '/register' })}
            size="sm"
            className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold border-0"
          >
            + Register Member
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Members', value: isLoading ? '—' : totalMembers.toString(), icon: <Users size={20} />, color: 'text-blue-400' },
          { label: 'Fee Refunded', value: isLoading ? '—' : refundedCount.toString(), icon: <CheckCircle size={20} />, color: 'text-emerald-400' },
          { label: 'Joining Fee', value: '₹2,750', icon: <IndianRupee size={20} />, color: 'text-gold-400' },
          { label: 'Max Levels', value: '10', icon: <TrendingUp size={20} />, color: 'text-purple-400' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className={`${stat.color} mb-2`}>{stat.icon}</div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Member Lookup */}
      <Card className="bg-card border-border mb-8">
        <CardHeader>
          <CardTitle className="text-foreground text-lg flex items-center gap-2">
            <Search size={18} className="text-gold-400" />
            Member Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter Member ID"
              className="bg-background border-border focus:border-gold-500 max-w-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold border-0"
            >
              Search
            </Button>
            {selectedMember && (
              <Button
                onClick={() => setSelectedMember(null)}
                variant="outline"
                className="border-border"
              >
                Clear
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          )}

          {!isLoading && searchId && !selectedMember && members && (
            <p className="text-muted-foreground text-sm mt-3">
              No member found with ID {searchId}. Try a different ID.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Selected Member Details */}
      {selectedMember && (
        <div className="space-y-6 mb-8">
          {/* Recruitment Deadline Card — shown immediately at top */}
          <RecruitmentDeadlineCard member={selectedMember} />

          {/* Member Info Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gold-500/15 flex items-center justify-center">
                      <span className="text-gold-400 font-bold text-lg">{selectedMember.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selectedMember.name}</h2>
                      <p className="text-muted-foreground text-sm">Member ID: #{selectedMember.id.toString()}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{selectedMember.contactInfo}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Joined: {new Date(Number(selectedMember.registrationTimestamp) / 1_000_000).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={selectedMember.feeRefunded
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }>
                    {selectedMember.feeRefunded ? (
                      <><CheckCircle size={12} className="mr-1" /> Fee Refunded</>
                    ) : (
                      <><Clock size={12} className="mr-1" /> Refund Pending</>
                    )}
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Level {selectedMember.matrixPosition.level.toString()}
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {selectedMember.directDownlines.length}/3 Downlines
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Earnings Summary */}
          <EarningsSummary member={selectedMember} allMembers={members || []} />

          {/* Matrix Tree */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg flex items-center gap-2">
                <Users size={18} className="text-gold-400" />
                Matrix Tree
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MatrixTreeVisualization rootMemberId={selectedMember.id} allMembers={members || []} />
            </CardContent>
          </Card>

          {/* Commission History */}
          <CommissionHistoryTable member={selectedMember} allMembers={members || []} />
        </div>
      )}

      {/* All Members List */}
      {!selectedMember && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg flex items-center gap-2">
              <Users size={18} className="text-gold-400" />
              All Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : members && members.length > 0 ? (
              <div className="space-y-2">
                {members.map((member) => (
                  <button
                    key={member.id.toString()}
                    onClick={() => { setSelectedMember(member); setSearchId(member.id.toString()); }}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 text-sm font-bold">{member.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{member.name}</div>
                        <div className="text-xs text-muted-foreground">ID: #{member.id.toString()} · {member.directDownlines.length}/3 downlines</div>
                      </div>
                    </div>
                    <Badge className={member.feeRefunded
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs'
                    }>
                      {member.feeRefunded ? 'Refunded' : 'Pending'}
                    </Badge>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No members registered yet.</p>
                <Button
                  onClick={() => navigate({ to: '/register' })}
                  className="mt-4 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold border-0"
                  size="sm"
                >
                  Register First Member
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
