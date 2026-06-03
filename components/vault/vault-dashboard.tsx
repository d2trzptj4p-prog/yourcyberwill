"use client";

import { useVault } from "@/components/vault/vault-context";
import { Button } from "@/components/ui/button";
import { VaultFilesSection } from "@/components/vault/vault-files-section";
import { VaultNotesSection } from "@/components/vault/vault-notes-section";
import { VaultPasswordsSection } from "@/components/vault/vault-passwords-section";
import { VaultUnlock } from "@/components/vault/vault-unlock";
import { LockIcon } from "@phosphor-icons/react";

export function VaultDashboardContent() {
  const { unlocked, lock } = useVault();

  if (!unlocked) {
    return <VaultUnlock />;
  }

  return (
    /* We dropped 'absolute'. Instead, we use 'w-screen' and 'relative left-1/2 -translate-x-1/2' 
      to break cleanly out of any parent padding and stretch edge-to-edge across the monitor.
      
      We also swapped 'bg-black' out for 'bg-zinc-950' to keep your high-contrast text perfectly readable,
      matching your typography configuration.
    */
    <div className="w-screen relative left-1/2 -translate-x-1/2 bg-zinc-950 text-white min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl text-white tracking-tight">Your Encrypted Vault</h1>
            <LockIcon weight="fill" className="size-7 text-zinc-400" />  
            <span className="text-xs bg-zinc-800 text-zinc-300 font-mono px-2 py-1 rounded-md">
              zero-knowledge AES-256
            </span>
          </div>
          <Button
            type="button"
            onClick={lock}
            variant="secondary"
            className="rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
          >
            Lock vault
          </Button>
        </div>

        {/* Info Banner: Active Browser Decryption */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-4">
          <p className="text-sm text-emerald-400/90 leading-relaxed">
            <strong className="text-emerald-300">Vault unlocked</strong> — Your data is safely decrypted locally within your browser tab. Any changes you make will be instantly re-encrypted on your device before saving to our servers.
          </p>
        </div>

        {/* Info Banner: Cyber Will Execution Protocol */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-5 py-4">
          <p className="text-sm text-amber-400/90 leading-relaxed">
            <strong className="text-amber-300">Beneficiary Provision Active</strong> — A secure, read-only encrypted replica of this vault will automatically be emailed to your benificaries upon the check in timer passing
          </p>
        </div>

        {/* Data Layout Segment Components */}
        <div className="space-y-12 mt-4">
          <VaultPasswordsSection />
          <VaultNotesSection />
          <VaultFilesSection />
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use DashboardVaultLayout on the dashboard page. */
export function VaultDashboard() {
  return <VaultDashboardContent />;
}