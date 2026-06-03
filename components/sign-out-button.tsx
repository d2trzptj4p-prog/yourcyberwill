"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { HorseIcon, HeartIcon, CubeIcon, SignOut } from "@phosphor-icons/react";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";

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
      onClick={signOut}
      variant="secondary"
      
    >
      
      {/* <SignOutIcon className="ml-2 size-5 " aria-hidden="true" /> */}
      Sign out
    </Button>
  );
}
