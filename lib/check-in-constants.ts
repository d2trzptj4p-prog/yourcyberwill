import { checkInPeriodDaysToMs } from "@/lib/check-in-periods";

/**
 * Get check-in interval in milliseconds.
 * For testing, override with CHECK_IN_INTERVAL_MINUTES env var (takes precedence).
 * Otherwise, uses user's selected period (default 30 days).
 */
export function getCheckInIntervalMs(userSelectedDays?: number): number {
  // For testing: CHECK_IN_INTERVAL_MINUTES env var takes precedence
  const minutes = process.env.CHECK_IN_INTERVAL_MINUTES;
  if (minutes) {
    const parsed = Number.parseInt(minutes, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed * 60 * 1000;
    }
  }

  // Use user's selected period (default 30 days)
  const days = userSelectedDays ?? 30;
  return checkInPeriodDaysToMs(days);
}

export function computeCheckInDueAt(
  from: Date = new Date(),
  userSelectedDays?: number,
): string {
  return new Date(from.getTime() + getCheckInIntervalMs(userSelectedDays)).toISOString();
}
