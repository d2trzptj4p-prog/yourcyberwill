"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import { NamePromptModal } from "@/components/name-prompt-modal";

type DashboardClientProps = {
  profile: Profile;
  children: React.ReactNode;
};

export function DashboardClient({ profile, children }: DashboardClientProps) {
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  useEffect(() => {
    // Show name prompt if user doesn't have a name
    if (!profile.full_name || profile.full_name.trim() === "") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowNamePrompt(true);
    }
  }, [profile.full_name]);

  return (
    <>
      <NamePromptModal
        profileId={profile.id}
        isOpen={showNamePrompt}
        onClose={() => setShowNamePrompt(false)}
      />
      {children}
    </>
  );
}
