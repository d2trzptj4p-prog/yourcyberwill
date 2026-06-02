import Link from "next/link";
import { Button } from "./ui/button";

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
    <Link href="/portal">
    <Button
      variant="outline"
      
     
    >
      My subscription
    </Button>
    </Link>
  );
}
