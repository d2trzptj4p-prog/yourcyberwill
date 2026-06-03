"use client";

import type { Profile } from "@/lib/types";
import { CheckInGuardProvider } from "@/components/check-in-guard-provider";
import { CheckInSection } from "@/components/check-in-section";
import { SetupChecklist } from "@/components/setup-checklist";
import { VaultDashboardContent } from "@/components/vault/vault-dashboard";
import { VaultProvider } from "@/components/vault/vault-context";

type DashboardVaultLayoutProps = {
  profile: Profile;
};

/** Shared vault context for check-ins (recipient links) and vault sections. */
export function DashboardVaultLayout({ profile }: DashboardVaultLayoutProps) {
  return (
    <VaultProvider>
      <CheckInGuardProvider>
        <SetupChecklist profile={profile} />
        <CheckInSection />
        
        <VaultDashboardContent />
      </CheckInGuardProvider>
    </VaultProvider>
  );
}
