import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Trash2, CheckCircle, RefreshCw, Search, Loader2, ShieldAlert, UserPlus } from 'lucide-react';
import {
  useListMembers,
  useMarkJoiningFeePaid,
  useCheckMembershipStatuses,
  useDeleteMember,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { MemberPublic } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PlatformStatistics from '../components/PlatformStatistics';
import AddMemberForm from '../components/AddMemberForm';

// ── MemberRow ────────────────────────────────────────────────────────────────
interface MemberRowProps {
  member: MemberPublic;
  onMarkPaid: (id: bigint) => Promise<void>;
  isMarkingPaid: boolean;
}

function MemberRow({ member, onMarkPaid, isMarkingPaid }: MemberRowProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteMemberMutation = useDeleteMember();

  const handleDeleteConfirm = async () => {
    try {
      await deleteMemberMutation.mutateAsync(member.id);
      toast.success(`Member ${member.memberIdStr} deleted successfully`);
      setDeleteDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Delete failed: ${msg}`);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <tr className="border-b border-border hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3 font-mono text-sm text-gold-400">{member.memberIdStr}</td>
        <td className="px-4 py-3 font-medium">{member.name}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{member.contactInfo}</td>
        <td className="px-4 py-3">
          {member.joiningFeePaid ? (
            <Badge variant="default" className="bg-green-700 text-white">Paid</Badge>
          ) : (
            <Badge variant="destructive">Unpaid</Badge>
          )}
        </td>
        <td className="px-4 py-3">
          {member.isCancelled ? (
            <Badge variant="outline" className="text-destructive border-destructive">Cancelled</Badge>
          ) : (
            <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
          )}
        </td>
        <td className="px-4 py-3 text-sm">{member.directDownlines.length}/3</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {!member.joiningFeePaid && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMarkPaid(member.id)}
                disabled={isMarkingPaid}
                className="text-xs border-gold-500 text-gold-400 hover:bg-gold-500/10"
              >
                {isMarkingPaid ? (
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
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteMemberMutation.isPending}
              className="text-xs"
            >
              {deleteMemberMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        </td>
      </tr>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{member.name}</strong> ({member.memberIdStr})?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMemberMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMemberMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMemberMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting…</>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── AdminPanel ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

export default function AdminPanel() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [markingPaidId, setMarkingPaidId] = useState<bigint | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);

  const { isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: members = [], isLoading: membersLoading, refetch } = useListMembers();
  const markPaidMutation = useMarkJoiningFeePaid();
  const checkStatusesMutation = useCheckMembershipStatuses();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.memberIdStr.toLowerCase().includes(q) ||
        m.contactInfo.toLowerCase().includes(q),
    );
  }, [members, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleMarkPaid = async (id: bigint) => {
    setMarkingPaidId(id);
    try {
      await markPaidMutation.mutateAsync(id);
      toast.success('Joining fee marked as paid');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed: ${msg}`);
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleCheckStatuses = async () => {
    try {
      await checkStatusesMutation.mutateAsync();
      toast.success('Membership statuses updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed: ${msg}`);
    }
  };

  // Show loading while identity is being restored from storage OR while checking admin status
  if (isInitializing || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
          <p className="text-muted-foreground text-sm">
            {isInitializing ? 'Restoring your session…' : 'Verifying admin access…'}
          </p>
        </div>
      </div>
    );
  }

  // Show access denied only after initialization is complete and admin check has run
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground max-w-sm">
            You do not have admin privileges to access this panel. Please log in with an admin account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Manage members and platform settings</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowAddMember((v) => !v)}
              className="border-gold-500 text-gold-400 hover:bg-gold-500/10"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {showAddMember ? 'Hide Form' : 'Add Member'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCheckStatuses}
              disabled={checkStatusesMutation.isPending}
              className="border-gold-500 text-gold-400 hover:bg-gold-500/10"
            >
              {checkStatusesMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Check Statuses
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={membersLoading}
              className="border-gold-500 text-gold-400 hover:bg-gold-500/10"
            >
              {membersLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Platform Statistics */}
        <PlatformStatistics />

        {/* Add Member Form */}
        {showAddMember && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-gold-400" />
              Add New Member
            </h2>
            <AddMemberForm />
          </div>
        )}

        {/* Members Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground flex-1">Members</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 bg-background border-border"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Member ID</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fee</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Downlines</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {membersLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading members…
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      {search ? 'No members match your search.' : 'No members registered yet.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((member) => (
                    <MemberRow
                      key={member.id.toString()}
                      member={member}
                      onMarkPaid={handleMarkPaid}
                      isMarkingPaid={markingPaidId === member.id}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages} · {filtered.length} members
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-border"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-border"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
