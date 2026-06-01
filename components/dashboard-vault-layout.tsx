"use client";

import { CheckInGuardProvider } from "@/components/check-in-guard-provider";
import { CheckInSection } from "@/components/check-in-section";
import { VaultDashboardContent } from "@/components/vault/vault-dashboard";
import { VaultProvider } from "@/components/vault/vault-context";

/** Shared vault context for check-ins (recipient links) and vault sections. */
export function DashboardVaultLayout() {
  return (
    <VaultProvider>
      <CheckInGuardProvider>
        <CheckInSection />
        <VaultDashboardContent />
      </CheckInGuardProvider>
    </VaultProvider>
  );
}
