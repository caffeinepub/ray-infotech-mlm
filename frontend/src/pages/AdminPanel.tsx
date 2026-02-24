import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { useListMembers, useIsCallerAdmin, useMarkJoiningFeePaid } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Shield, Users, IndianRupee, TrendingUp, Search, RefreshCw, CheckCircle, Clock, LogIn, AlertTriangle } from 'lucide-react';
import type { MemberPublic } from '../backend';
import PlatformStatistics from '../components/PlatformStatistics';

const ITEMS_PER_PAGE = 10;

export default function AdminPanel() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: members, isLoading, refetch, isFetching } = useListMembers();
  const markFeePaid = useMarkJoiningFeePaid();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="bg-card border-border max-w-md w-full text-center">
          <CardContent className="p-8">
            <LogIn className="text-gold-400 mx-auto mb-4" size={40} />
            <h2 className="text-xl font-bold text-foreground mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">Please login to access the admin panel.</p>
            <Button onClick={login} disabled={isLoggingIn} className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold border-0">
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="bg-card border-border max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-destructive" size={32} />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              This area is restricted to Ray Infotech administrators only.
            </p>
            <Button onClick={() => navigate({ to: '/' })} variant="outline" className="border-border">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredMembers = (members || []).filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toString().includes(search)
  );

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleMarkPaid = async (member: MemberPublic) => {
    try {
      await markFeePaid.mutateAsync(member.id);
      toast.success(`Joining fee marked as paid for ${member.name}`);
    } catch {
      toast.error('Failed to update fee status');
    }
  };

  const getCommissionsForMember = (member: MemberPublic, allMembers: MemberPublic[]): number => {
    // Calculate total commissions earned by this member based on their downlines
    // Commission is earned when downlines join at various levels
    // This is a simplified calculation based on available data
    let total = 0;
    if (member.feeRefunded) total += 2750;
    return total;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold-500/15 flex items-center justify-center">
            <Shield className="text-gold-400" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Ray Infotech MLM Management</p>
          </div>
        </div>
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
      </div>

      {/* Platform Statistics */}
      <PlatformStatistics members={members || []} isLoading={isLoading} />

      {/* Members Table */}
      <Card className="bg-card border-border mt-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-foreground text-lg flex items-center gap-2">
              <Users size={18} className="text-gold-400" />
              All Members ({filteredMembers.length})
            </CardTitle>
            <div className="relative max-w-xs w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or ID..."
                className="pl-9 bg-background border-border focus:border-gold-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : paginatedMembers.length === 0 ? (
            <div className="text-center py-10">
              <Users size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {search ? 'No members match your search.' : 'No members registered yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">ID</TableHead>
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Contact</TableHead>
                      <TableHead className="text-muted-foreground">Join Date</TableHead>
                      <TableHead className="text-muted-foreground">Downlines</TableHead>
                      <TableHead className="text-muted-foreground">Refund Status</TableHead>
                      <TableHead className="text-muted-foreground">Level</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMembers.map((member) => (
                      <TableRow key={member.id.toString()} className="border-border hover:bg-muted/30">
                        <TableCell className="font-mono text-gold-400 font-semibold">
                          #{member.id.toString()}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{member.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs max-w-[160px] truncate">
                          {member.contactInfo}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(Number(member.registrationTimestamp) / 1_000_000).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-foreground font-medium">{member.directDownlines.length}</span>
                            <span className="text-muted-foreground">/3</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={member.feeRefunded
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs'
                          }>
                            {member.feeRefunded ? (
                              <><CheckCircle size={10} className="mr-1" /> Refunded</>
                            ) : (
                              <><Clock size={10} className="mr-1" /> Pending</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          L{member.matrixPosition.level.toString()}
                        </TableCell>
                        <TableCell>
                          {!member.joiningFeePaid && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkPaid(member)}
                              disabled={markFeePaid.isPending}
                              className="text-xs border-gold-500/30 text-gold-400 hover:bg-gold-500/10"
                            >
                              Mark Paid
                            </Button>
                          )}
                          {member.joiningFeePaid && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              Fee Paid
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredMembers.length)} of {filteredMembers.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-border"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm text-muted-foreground">
                      {page} / {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-border"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
