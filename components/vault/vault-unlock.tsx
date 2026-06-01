"use client";

import { useVault } from "@/components/vault/vault-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getVaultPasswordRequirementStatus,
  isVaultMasterPasswordValid,
} from "@/lib/vault-password-policy";

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  placeholder,
  autoComplete = "off",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-20 pl-4 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <Button
          type="button"
          onClick={onToggleVisible}
          variant="ghost"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          {visible ? "Hide" : "Show"}
        </Button>
      </div>
    </label>
  );
}

export function VaultUnlock() {
  const {
    vaultGate,
    loading,
    unlockError,
    handleUnlock,
    handleCreateVault,
    masterPassword,
    setMasterPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showUnlockPassword,
    setShowUnlockPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    releaseAccessWarning,
  } = useVault();

  if (vaultGate === "loading") {
    return (
      <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-medium">Encrypted vault</h2>
        <p className="mt-2 text-sm text-zinc-500">Loading…</p>
      </section>
    );
  }

  const isCreate = vaultGate === "create";
  const requirementStatus = getVaultPasswordRequirementStatus(newPassword);
  const canCreateVault =
    isVaultMasterPasswordValid(newPassword) &&
    newPassword === confirmPassword &&
    confirmPassword.length > 0;

  return (
    <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h2 className="text-lg font-medium">Encrypted vault</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {isCreate
          ? "Create a master password to unlock three sections: Passwords, Notes, and Files. Everything is encrypted in your browser before it reaches the server."
          : "Enter your master password to access Passwords, Notes, and Files."}
      </p>

      {isCreate ? (
        <form onSubmit={handleCreateVault} className="mt-6 flex flex-col gap-4">
          <PasswordField
            label="New master password"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNewPassword}
            onToggleVisible={() => setShowNewPassword((v) => !v)}
            placeholder="Create a strong password"
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirm master password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirmPassword}
            onToggleVisible={() => setShowConfirmPassword((v) => !v)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
          <ul className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
            {requirementStatus.map((item) => (
              <li
                key={item.label}
                className={
                  item.met
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-zinc-500"
                }
              >
                {item.met ? "✓" : "○"} {item.label}
              </li>
            ))}
          </ul>
          {unlockError && (
            <p className="text-sm text-red-600 dark:text-red-400">{unlockError}</p>
          )}
          {releaseAccessWarning && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {releaseAccessWarning}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading || !canCreateVault}
            className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loading ? "Creating…" : "Create vault password"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleUnlock} className="mt-6 flex flex-col gap-4">
              <PasswordField
                label="Master password"
                value={masterPassword}
                onChange={setMasterPassword}
                visible={showUnlockPassword}
                onToggleVisible={() => setShowUnlockPassword((v) => !v)}
                placeholder="Enter your master password"
                autoComplete="current-password"
              />
          {unlockError && (
            <p className="text-sm text-red-600 dark:text-red-400">{unlockError}</p>
          )}
          {releaseAccessWarning && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {releaseAccessWarning}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading || !masterPassword}
            className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loading ? "Unlocking…" : "Unlock vault"}
          </Button>
        </form>
      )}
    </section>
  );
}
