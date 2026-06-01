import { getCheckInIntervalMs } from "@/lib/check-in-constants";

export const CHECK_IN_FIRST_MESSAGE =
  "Less than half of your check-in time is left. Check in first, then make changes.";

export const CHECK_IN_COMPLETE_MESSAGE =
  "All emails have been sent to your recipients. Check-ins and recipient management are no longer available for this account.";

export function getCheckInIntervalMsForClient(intervalMs?: number): number {
  return intervalMs ?? getCheckInIntervalMs();
}

export function isCheckInEditBlocked(
  params: {
    active: boolean;
    due_at: string | null;
    recipients_notified_complete?: boolean;
    interval_ms?: number;
  } | null,
  remainingMs: number | null = null,
): boolean {
  if (params?.recipients_notified_complete) {
    return true;
  }
  if (!params?.active || !params.due_at) {
    return false;
  }

  const intervalMs = getCheckInIntervalMsForClient(params.interval_ms);
  const remaining =
    remainingMs ?? new Date(params.due_at).getTime() - Date.now();

  if (remaining <= 0) {
    return true;
  }

  return remaining < intervalMs / 2;
}
