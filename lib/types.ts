export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string;
  crypto_salt: string | null;
  updated_at: string;
  subscription_active: boolean;
  polar_subscription_id: string | null;
  polar_customer_id: string | null;
  recipients_notified_complete: boolean;
  recipient_email_template: string | null;
};
