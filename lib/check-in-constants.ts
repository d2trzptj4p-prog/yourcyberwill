/** Default check-in window: 30 days. Override with CHECK_IN_INTERVAL_MINUTES for testing. */
export function getCheckInIntervalMs(): number {
  const minutes = process.env.CHECK_IN_INTERVAL_MINUTES;
  if (minutes) {
    const parsed = Number.parseInt(minutes, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed * 60 * 1000;
    }
  }
  return 30 * 24 * 60 * 60 * 1000 * 3;
}

export function computeCheckInDueAt(from: Date = new Date()): string {
  return new Date(from.getTime() + getCheckInIntervalMs()).toISOString();
}
