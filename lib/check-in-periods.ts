export const CHECK_IN_PERIODS = [
  { label: "1 Minute (Testing)", days: 1, description: "For testing only" },
  { label: "Every 2 Weeks", days: 14, description: "Frequent check-ins" },
  { label: "1 Month", days: 30, description: "Monthly check-ins" },
  { label: "3 Months", days: 90, description: "Quarterly check-ins" },
  { label: "6 Months", days: 180, description: "Bi-annual check-ins" },
  { label: "1 Year", days: 365, description: "Annual check-ins" },
] as const;

export type CheckInPeriodDays = typeof CHECK_IN_PERIODS[number]["days"];

export function isValidCheckInPeriod(days: unknown): days is CheckInPeriodDays {
  return CHECK_IN_PERIODS.some((p) => p.days === days);
}

export function getCheckInPeriodLabel(days: number): string {
  const period = CHECK_IN_PERIODS.find((p) => p.days === days);
  return period?.label ?? "Unknown";
}

export function getCheckInPeriodDescription(days: number): string {
  const period = CHECK_IN_PERIODS.find((p) => p.days === days);
  return period?.description ?? "";
}

/**
 * Convert check-in period to milliseconds.
 * Special case: 1 = 1 minute (for testing)
 */
export function checkInPeriodDaysToMs(days: number): number {
  if (days === 1) {
    return 60 * 1000; // 1 minute
  }
  return days * 24 * 60 * 60 * 1000;
}
