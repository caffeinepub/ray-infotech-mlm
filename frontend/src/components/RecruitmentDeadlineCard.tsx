import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, Clock, Users, CalendarClock, XCircle } from 'lucide-react';
import type { MemberPublic } from '../backend';
import {
  formatDeadlineTimestamp,
  computeDeadlineStatus,
  getTimeRemaining,
  type DeadlineStatus,
} from '../utils/deadlineHelpers';

interface RecruitmentDeadlineCardProps {
  member: MemberPublic;
}

export default function RecruitmentDeadlineCard({ member }: RecruitmentDeadlineCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    getTimeRemaining(member.membershipDeadline)
  );

  // Live countdown ticker
  useEffect(() => {
    const status = computeDeadlineStatus(
      member.membershipDeadline,
      member.directDownlines,
      member.isCancelled
    );
    if (status !== 'Active') return; // No need to tick if already resolved

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(member.membershipDeadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [member.membershipDeadline, member.directDownlines, member.isCancelled]);

  const status: DeadlineStatus = computeDeadlineStatus(
    member.membershipDeadline,
    member.directDownlines,
    member.isCancelled
  );

  const downlineCount = member.directDownlines.length;
  const progressPercent = Math.min((downlineCount / 3) * 100, 100);
  const deadlineFormatted = formatDeadlineTimestamp(member.membershipDeadline);

  // Joined timestamp
  const joinedFormatted = new Date(Number(member.registrationTimestamp) / 1_000_000).toLocaleString(
    'en-IN',
    { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }
  );

  if (status === 'Met') {
    return (
      <Card className="bg-emerald-500/10 border-emerald-500/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="text-emerald-400" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-emerald-400 text-base">Recruitment Requirement Met! 🎉</h3>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Met</Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-3">
                Successfully recruited <strong className="text-emerald-400">{downlineCount} / 3</strong> direct downlines within the 3-day window. All benefits and commissions are active.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarClock size={12} className="text-emerald-400" />
                  Joined: {joinedFormatted}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-emerald-400" />
                  Deadline was: {deadlineFormatted}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'Cancelled') {
    return (
      <Card className="bg-destructive/10 border-destructive/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <XCircle className="text-destructive" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-destructive text-base">Membership Cancelled</h3>
                <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">Cancelled</Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-2">
                Only <strong className="text-destructive">{downlineCount} / 3</strong> direct downlines were recruited within the 3-day deadline.
              </p>
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-xs text-muted-foreground space-y-1 mb-3">
                <p className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-destructive flex-shrink-0" /> Membership has been cancelled automatically.</p>
                <p className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-destructive flex-shrink-0" /> Refund amount is forfeited.</p>
                <p className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-destructive flex-shrink-0" /> All commission and other benefits are forfeited.</p>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarClock size={12} />
                  Joined: {joinedFormatted}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Deadline was: {deadlineFormatted}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active status — show countdown
  return (
    <Card className="bg-amber-500/10 border-amber-500/30">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-amber-400 text-base flex items-center gap-2">
          <Clock size={18} className="text-amber-400" />
          Recruitment Deadline
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs ml-auto">Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {/* Joined + Deadline timestamps */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <CalendarClock size={12} className="text-amber-400" />
            Joined: <strong className="text-foreground ml-1">{joinedFormatted}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-amber-400" />
            Last date &amp; time: <strong className="text-amber-400 ml-1">{deadlineFormatted}</strong>
          </span>
        </div>

        {/* Downline progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Users size={14} className="text-amber-400" />
              Direct Downlines Recruited
            </span>
            <span className="text-sm font-bold text-foreground">
              {downlineCount} <span className="text-muted-foreground font-normal">/ 3 required</span>
            </span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-amber-500/20" />
          <p className="text-xs text-muted-foreground mt-1.5">
            {3 - downlineCount} more direct downline{3 - downlineCount !== 1 ? 's' : ''} needed to secure membership.
          </p>
        </div>

        {/* Countdown */}
        {!timeRemaining.passed && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Time remaining:</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Days', value: timeRemaining.days },
                { label: 'Hours', value: timeRemaining.hours },
                { label: 'Mins', value: timeRemaining.minutes },
                { label: 'Secs', value: timeRemaining.seconds },
              ].map(({ label, value }) => (
                <div key={label} className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-amber-400 font-mono leading-none">
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-3 border-t border-amber-500/20 pt-3">
          <AlertTriangle size={11} className="inline mr-1 text-amber-400" />
          Failure to recruit 3 direct downlines before the deadline will result in automatic membership cancellation. Refund amount and all benefits will be forfeited.
        </p>
      </CardContent>
    </Card>
  );
}
