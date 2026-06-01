export function isCheckInLocked(profile: {
  recipients_notified_complete?: boolean;
}): boolean {
  return profile.recipients_notified_complete === true;
}
