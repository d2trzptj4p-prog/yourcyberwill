"use client";

import { useVault } from "@/components/vault/vault-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getVaultPasswordRequirementStatus,
  isVaultMasterPasswordValid,
} from "@/lib/vault-password-policy";
import { Eye, EyeSlash, Lock } from "@phosphor-icons/react";

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
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-black dark:text-white">{label}</span>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full border border-zinc-300 bg-white py-2.5 pr-12 pl-4 text-sm text-black outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          {visible ? (
            <EyeSlash className="h-5 w-5" weight="bold" />
          ) : (
            <Eye className="h-5 w-5" weight="bold" />
          )}
        </button>
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
      <section className="rounded-xl mt-6 border-2 border-slate-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <div className="animate-spin">
            <Lock className="h-5 w-5 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-500">Initializing vault…</p>
        </div>
      </section>
    );
  }

  if (vaultGate === "create") {
    const requirements = getVaultPasswordRequirementStatus(newPassword);

    return (
      <section className="rounded-xl border-2 border-slate-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl text-black dark:text-white">
              Create a vault password
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Never lose this password as it <b>cannot</b> be recovered and is used to encrypt your data.
            </p>
          </div>

          {releaseAccessWarning && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                ⚠️ Vault access scheduled to release
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Your vault is configured to release due to missed check-ins. Creating a new password now will not prevent the scheduled release.
              </p>
            </div>
          )}

          <form onSubmit={handleCreateVault} className="space-y-4">
            <PasswordField
              label="Master Password"
              value={newPassword}
              onChange={setNewPassword}
              visible={showNewPassword}
              onToggleVisible={() => setShowNewPassword(!showNewPassword)}
              placeholder="Enter a strong password"
              autoComplete="new-password"
            />

            <PasswordField
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirmPassword}
              onToggleVisible={() => setShowConfirmPassword(!showConfirmPassword)}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />

            {/* Password Requirements */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase">
                Requirements for a strong password
              </p>
              <div className="grid grid-cols-2 gap-2">
                {getVaultPasswordRequirementStatus(newPassword).map((req, idx) => (
                  <div
                    key={idx}
                    className={`text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1 ${
                      req.met
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                    }`}
                  >
                    <span className={req.met ? "text-emerald-600" : "text-zinc-400"}>
                      {req.met ? "✓" : "○"}
                    </span>
                    {req.label}
                  </div>
                ))}
              </div>
            </div>

            {unlockError && (
              <div className="rounded-lg border-red-300 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {unlockError}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-13"
            >
              {loading ? "Creating vault…" : "Create Vault"}
            </Button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-black dark:text-white">
            Unlock Your Vault
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enter your master password to access your encrypted vault.
          </p>
        </div>

        {releaseAccessWarning && (
          <div className="rounded-lg bg-yellow-100 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Vault access scheduled to release
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Your vault is configured to release due to missed check-ins.
            </p>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <PasswordField
            label="Master Password"
            value={masterPassword}
            onChange={setMasterPassword}
            visible={showUnlockPassword}
            onToggleVisible={() => setShowUnlockPassword(!showUnlockPassword)}
            placeholder="Enter your master password"
          />

          {unlockError && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {unlockError}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-black px-4 text-base font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "Unlocking…" : "Unlock Vault"}
          </Button>
        </form>
      </div>
    </section>
  );
}

