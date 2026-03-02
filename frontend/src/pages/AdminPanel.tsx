import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import {
  useListMembers,
  useMarkJoiningFeePaid,
  useDeleteMember,
  useCheckMembershipStatuses,
} from '../hooks/useQueries';
import { ShieldAlert, Loader2, Users, CheckCircle, Trash2, RefreshCw, Plus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PlatformStatistics from '../components/PlatformStatistics';
import AddMemberForm from '../components/AddMemberForm';
import type { MemberPublic } from '../backend';

export default function AdminPanel() {
  const { identity, isInitializing, login, loginStatus } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();

  const [showAddMember, setShowAddMember] = useState(false);

  // Show loading while identity is initializing or actor is fetching
  const isStillLoading = isInitializing || actorFetching;

  if (isStillLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // If not authenticated at all, prompt login
  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center px-4">
          <ShieldAlert className="h-20 w-20 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Access Required</h1>
            <p className="text-muted-foreground max-w-md">
              Please log in with your admin account to access the admin panel.
            </p>
          </div>
          <Button
            onClick={login}
            disabled={loginStatus === 'logging-in'}
            className="flex items-center gap-2"
          >
            {loginStatus === 'logging-in' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Log In'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AdminPanelContent
      showAddMember={showAddMember}
      setShowAddMember={setShowAddMember}
    />
  );
}

function AdminPanelContent({
  showAddMember,
  setShowAddMember,
}: {
  showAddMember: boolean;
  setShowAddMember: (v: boolean) => void;
}) {
  const { data: members = [], isLoading: membersLoading } = useListMembers();
  const markFeePaid = useMarkJoiningFeePaid();
  const deleteMember = useDeleteMember();
  const checkStatuses = useCheckMembershipStatuses();

  const allMembers = new Map<bigint, MemberPublic>(members.map((m) => [m.id, m]));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Manage members and platform settings</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => checkStatuses.mutate()}
              disabled={checkStatuses.isPending}
            >
              {checkStatuses.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Check Statuses
            </Button>
            <Button size="sm" onClick={() => setShowAddMember(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Platform Statistics — fetches its own data internally */}
        <div className="mb-8">
          <PlatformStatistics />
        </div>

        {/* Add Member Form */}
        {showAddMember && (
          <div className="mb-8">
            <AddMemberForm onSuccess={() => setShowAddMember(false)} />
          </div>
        )}

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              All Members
              <Badge variant="secondary" className="ml-2">
                {members.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No members registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                        Member ID
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                        Contact
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                        Sponsor
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                        Fee Paid
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <MemberRow
                        key={member.id.toString()}
                        member={member}
                        allMembers={allMembers}
                        onMarkFeePaid={(id) => markFeePaid.mutate(id)}
                        onDelete={(id) => deleteMember.mutate(id)}
                        isMarkingFee={markFeePaid.isPending}
                        isDeleting={deleteMember.isPending}
                        deleteError={deleteMember.error}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MemberRow({
  member,
  allMembers,
  onMarkFeePaid,
  onDelete,
  isMarkingFee,
  isDeleting,
  deleteError,
}: {
  member: MemberPublic;
  allMembers: Map<bigint, MemberPublic>;
  onMarkFeePaid: (id: bigint) => void;
  onDelete: (id: bigint) => void;
  isMarkingFee: boolean;
  isDeleting: boolean;
  deleteError?: Error | null;
}) {
  const sponsor = member.sponsorId != null ? allMembers.get(member.sponsorId) : null;

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-3 px-2 font-mono text-xs text-primary font-semibold">
        {member.memberIdStr}
      </td>
      <td className="py-3 px-2 font-medium text-foreground">{member.name}</td>
      <td className="py-3 px-2 text-muted-foreground text-xs">{member.contactInfo}</td>
      <td className="py-3 px-2 text-muted-foreground text-xs">
        {sponsor
          ? sponsor.memberIdStr
          : member.sponsorId != null
          ? `#${member.sponsorId}`
          : '—'}
      </td>
      <td className="py-3 px-2">
        {member.joiningFeePaid ? (
          <Badge
            variant="default"
            className="text-xs bg-green-600/20 text-green-400 border-green-600/30"
          >
            Paid
          </Badge>
        ) : (
          <Badge variant="destructive" className="text-xs">
            Unpaid
          </Badge>
        )}
      </td>
      <td className="py-3 px-2">
        {member.isCancelled ? (
          <Badge variant="destructive" className="text-xs">
            Cancelled
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Active
          </Badge>
        )}
      </td>
      <td className="py-3 px-2">
        <div className="flex gap-2">
          {!member.joiningFeePaid && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => onMarkFeePaid(member.id)}
              disabled={isMarkingFee}
            >
              {isMarkingFee ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle className="h-3 w-3 mr-1" />
              )}
              Mark Paid
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            className="h-7 text-xs"
            onClick={() => onDelete(member.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
}
