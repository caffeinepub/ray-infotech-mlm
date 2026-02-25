import type { MemberId } from '../backend';

// Backend Time is bigint in nanoseconds since epoch
export type Time = bigint;

/**
 * Format a nanosecond timestamp to a human-readable date + time string.
 */
export function formatDeadlineTimestamp(deadline: Time): string {
  const ms = Number(deadline) / 1_000_000;
  return new Date(ms).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a nanosecond timestamp to a short date string.
 */
export function formatTimestampShort(ts: Time): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export type DeadlineStatus = 'Active' | 'Met' | 'Cancelled';

/**
 * Compute the deadline status for a member.
 * - 'Met': 3+ direct downlines recruited
 * - 'Cancelled': isCancelled flag is true OR deadline has passed with fewer than 3 downlines
 * - 'Active': within the 3-day window, fewer than 3 downlines
 */
export function computeDeadlineStatus(
  membershipDeadline: Time,
  directDownlines: MemberId[],
  isCancelled: boolean
): DeadlineStatus {
  if (directDownlines.length >= 3) return 'Met';
  if (isCancelled) return 'Cancelled';
  const nowMs = Date.now();
  const deadlineMs = Number(membershipDeadline) / 1_000_000;
  if (nowMs > deadlineMs) return 'Cancelled';
  return 'Active';
}

export interface TimeRemaining {
  passed: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

/**
 * Get the time remaining until the deadline.
 */
export function getTimeRemaining(deadline: Time): TimeRemaining {
  const deadlineMs = Number(deadline) / 1_000_000;
  const nowMs = Date.now();
  const diff = deadlineMs - nowMs;

  if (diff <= 0) {
    return { passed: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  const totalMs = diff;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { passed: false, days, hours, minutes, seconds, totalMs };
}
