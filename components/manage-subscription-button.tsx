type ManageSubscriptionButtonProps = {
  /** Show when user has (or had) a Polar customer linked via checkout. */
  visible: boolean;
  className?: string;
};

/**
 * Links to /portal, which creates a fresh customer session and redirects to Polar.
 * Do not cache the portal URL — tokens are short-lived.
 */
export function ManageSubscriptionButton({
  visible,
  className = "",
}: ManageSubscriptionButtonProps) {
  if (!visible) {
    return null;
  }

  return (
    <a
      href="/portal"
      className={
        className ||
        "inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      }
    >
      Manage subscription
    </a>
  );
}
