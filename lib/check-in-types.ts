export type Recipient = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  notified_at: string | null;
  release_token?: string | null;
  wrapped_vault_key?: string | null;
};

export function recipientHasVaultLink(recipient: Recipient): boolean {
  return Boolean(recipient.release_token && recipient.wrapped_vault_key);
}

export type CheckInState = {
  active: boolean;
  due_at: string | null;
  recipient_count: number;
  recipients_notified_complete: boolean;
  recipient_email_template: string | null;
  /** Full check-in window length (ms); used for the 50% edit lock. */
  interval_ms: number;
  /** User's selected check-in period in days (14, 30, 90, 180, or 365). */
  check_in_interval_days: number;
};

export type SubscriptionState = {
  active: boolean;
  polar_subscription_id: string | null;
};
