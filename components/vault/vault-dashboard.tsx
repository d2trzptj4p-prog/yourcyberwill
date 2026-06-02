"use client";

import { useVault } from "@/components/vault/vault-context";
import { Button } from "@/components/ui/button";
import { VaultFilesSection } from "@/components/vault/vault-files-section";
import { VaultNotesSection } from "@/components/vault/vault-notes-section";
import { VaultPasswordsSection } from "@/components/vault/vault-passwords-section";
import { VaultUnlock } from "@/components/vault/vault-unlock";
import { Keyhole, LockIcon } from "@phosphor-icons/react";

export function VaultDashboardContent() {
  const { unlocked, lock } = useVault();

  if (!unlocked) {
    return <VaultUnlock />;
  }

  return (
    <div className="bg-black absolute left-0 right-0 dark:">
      
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl text-white tracking-tight">Your Encrypted Vault</h1>
            <LockIcon className="size-7 text-white" />  
            <span className="text-muted-foreground">zero-knowledge via AES-256</span>
          </div>
          <Button
          type="button"
          onClick={lock}
          className="rounded-full border h-11 px-4 py-1.5 text-sm font-medium"
        >
          <Keyhole className="size-5 mr-2" />
          Lock vault
        </Button>
        </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/40">
        <p className="text-sm text-emerald-800 dark:text-emerald-300">
          Vault unlocked — your data is decrypted in the browser and can be viewed and changed. Changes with automatically be encrypted and saved.
        </p>
        {/* <Button
          type="button"
          onClick={lock}
          className="rounded-full border border-emerald-300 px-4 py-1.5 text-sm font-medium dark:border-emerald-800"
        >
          Lock vault
        </Button> */}
      </div>

      <VaultPasswordsSection />
      <VaultNotesSection />
      <VaultFilesSection />
    </div>
    </div>
  );
}

/** @deprecated Use DashboardVaultLayout on the dashboard page. */
export function VaultDashboard() {
  return <VaultDashboardContent />;
}
