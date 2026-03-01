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

  // Show loading while checking admin status
  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
      </div>
    );
  }

  // Show access denied if not admin
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
            <h2 className="text-xl font-semibold mb-4">Register New Member</h2>
            <AddMemberForm onSuccess={() => setShowAddMember(false)} />
          </div>
        )}

        {/* Members Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-xl font-semibold flex-1">
              Members ({filtered.length})
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, contact…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
          </div>

          {membersLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {search ? 'No members match your search.' : 'No members registered yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Member ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Contact</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Fee</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Downlines</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((member) => (
                    <MemberRow
                      key={member.id.toString()}
                      member={member}
                      onMarkPaid={handleMarkPaid}
                      isMarkingPaid={markingPaidId === member.id && markPaidMutation.isPending}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
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
