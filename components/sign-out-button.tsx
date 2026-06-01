"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { HorseIcon, HeartIcon, CubeIcon, SignOut } from "@phosphor-icons/react";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      size="lg"
      onClick={signOut}
      variant="ghost"
      className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      
      <SignOut className="ml-2 size-5 " aria-hidden="true" />
      Sign out
    </Button>
  );
}
