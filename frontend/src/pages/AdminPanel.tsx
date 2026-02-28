import React, { useState, useMemo } from 'react';
import { useListMembers, useMarkJoiningFeePaid, useCheckMembershipStatuses, useRegisterMember } from '../hooks/useQueries';
import { MemberPublic } from '../backend';
import PlatformStatistics from '../components/PlatformStatistics';
import AddMemberForm from '../components/AddMemberForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, UserPlus, CheckCircle, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

const PAGE_SIZE = 15;

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const { data: allMembers = [], isLoading: membersLoading } = useListMembers();
  const markPaidMutation = useMarkJoiningFeePaid();
  const checkStatusMutation = useCheckMembershipStatuses();

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return allMembers;
    const q = searchQuery.toLowerCase();
    return allMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toString().includes(q) ||
        m.memberIdStr.toLowerCase().includes(q) ||
        m.contactInfo.toLowerCase().includes(q)
    );
  }, [allMembers, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleMarkPaid = async (memberId: bigint) => {
    try {
      await markPaidMutation.mutateAsync(memberId);
    } catch (err) {
      console.error('Failed to mark as paid:', err);
    }
  };

  const getSponsorName = (sponsorId: bigint | undefined): string => {
    if (!sponsorId) return '—';
    const sponsor = allMembers.find((m) => m.id === sponsorId);
    return sponsor ? sponsor.name : `#${sponsorId}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage members and monitor platform activity</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => checkStatusMutation.mutate()}
            disabled={checkStatusMutation.isPending}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${checkStatusMutation.isPending ? 'animate-spin' : ''}`} />
            Check Statuses
          </Button>
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold gap-2">
                <UserPlus className="w-4 h-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-poppins">Add New Member</DialogTitle>
              </DialogHeader>
              <AddMemberForm onSuccess={() => setAddMemberOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="mb-8">
        <PlatformStatistics />
      </div>

      {/* Members Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              All Members
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredMembers.length} total)
              </span>
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, contact..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {membersLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Member ID</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Sponsor</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold">Joined</TableHead>
                    <TableHead className="font-semibold">Downlines</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        No members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMembers.map((member) => (
                      <MemberRow
                        key={member.id.toString()}
                        member={member}
                        onMarkPaid={handleMarkPaid}
                        markPaidPending={markPaidMutation.isPending}
                        getSponsorName={getSponsorName}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface MemberRowProps {
  member: MemberPublic;
  onMarkPaid: (id: bigint) => void;
  markPaidPending: boolean;
  getSponsorName: (id: bigint | undefined) => string;
}

function MemberRow({ member, onMarkPaid, markPaidPending, getSponsorName }: MemberRowProps) {
  const contactParts = member.contactInfo.includes('|')
    ? member.contactInfo.split('|')
    : [member.contactInfo, ''];

  return (
    <TableRow className={member.isCancelled ? 'opacity-60' : ''}>
      <TableCell>
        <span className="font-mono text-xs text-gold-400 font-semibold">{member.memberIdStr}</span>
      </TableCell>
      <TableCell>
        <div className="font-medium text-sm">{member.name}</div>
      </TableCell>
      <TableCell>
        <div className="text-xs text-muted-foreground">
          <div>{contactParts[0]}</div>
          {contactParts[1] && <div>{contactParts[1]}</div>}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {getSponsorName(member.sponsorId)}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={member.isCancelled ? 'destructive' : 'default'} className="text-xs">
          {member.isCancelled ? 'Cancelled' : 'Active'}
        </Badge>
      </TableCell>
      <TableCell>
        {member.joiningFeePaid ? (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
            Paid
          </Badge>
        ) : (
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 text-xs">
            Pending
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <span className="text-xs text-muted-foreground">
          {formatDate(member.registrationTimestamp)}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium">{member.directDownlines.length} / 3</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          {!member.joiningFeePaid && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 border-green-500/50 text-green-400 hover:bg-green-500/10"
              onClick={() => onMarkPaid(member.id)}
              disabled={markPaidPending}
            >
              <CheckCircle className="w-3 h-3" />
              Mark Paid
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                disabled={member.isCancelled}
              >
                <AlertTriangle className="w-3 h-3" />
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Member?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel <strong>{member.name}</strong>'s membership ({member.memberIdStr}).
                  Their downline members will be reassigned to the next upline level.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Member</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => {
                    // Note: Backend doesn't have explicit cancel/debar endpoint
                    // checkMembershipStatuses handles expiry; this is a placeholder
                    alert('Cancel/debar functionality requires backend update. Use "Check Statuses" to expire overdue members.');
                  }}
                >
                  Cancel Membership
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
